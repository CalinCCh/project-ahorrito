import { db } from '@/db/drizzle';
import { accounts, categories, predefinedCategories, transactions, accountBalances } from '@/db/schema';
import { calculatePercentageChange, fillMissingDays } from '@/lib/utils';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { subDays, parse, differenceInDays } from 'date-fns';
import { and, desc, eq, gte, lt, lte, sql, sum, isNotNull, isNull } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        zValidator(
            "query",
            z.object({
                from: z.string().optional(),
                to: z.string().optional(),
                accountId: z.string().optional(),
            }),
        ),
        async (c) => {
            const auth = getAuth(c)
            const { from, to, accountId } = c.req.valid("query")

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const defaultTo = new Date()
            const defaultFrom = subDays(defaultTo, 30)

            const startDate = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom
            const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo

            const periodLength = differenceInDays(endDate, startDate) + 1
            const lastPeriodStart = subDays(startDate, periodLength)
            const lastPeriodEnd = subDays(endDate, periodLength)

            async function fetchFinancialData(
                userId: string,
                startDate: Date,
                endDate: Date,
            ) {
                return await db
                    .select({
                        income: sql`SUM(CASE WHEN ${transactions.amount} >=0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
                        expenses: sql`SUM(CASE WHEN ${transactions.amount} <0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
                        remaining: sum(transactions.amount).mapWith(Number),
                    })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(and(
                        accountId ? eq(transactions.accountId, accountId) : undefined,
                        eq(accounts.userId, userId),
                        gte(transactions.date, startDate),
                        lte(transactions.date, endDate),
                    ))
            }

            const [currentPeriod] = await fetchFinancialData(
                auth.userId,
                startDate,
                endDate,
            );

            const [lastPeriod] = await fetchFinancialData(
                auth.userId,
                lastPeriodStart,
                lastPeriodEnd,
            );            // Get the user's primary currency from their accounts
            let primaryCurrency = "EUR"; // default fallback

            if (accountId) {
                const [latestBalance] = await db
                    .select({ currency: accountBalances.currency })
                    .from(accountBalances)
                    .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
                    .where(and(
                        eq(accountBalances.accountId, accountId),
                        eq(accounts.userId, auth.userId)
                    ))
                    .orderBy(desc(accountBalances.timestamp))
                    .limit(1);

                if (latestBalance) {
                    primaryCurrency = latestBalance.currency;
                }
            } else {
                // If no specific account, get the most common currency from user's accounts
                const [commonCurrency] = await db
                    .select({
                        currency: accountBalances.currency,
                        count: sql`COUNT(*)`.mapWith(Number)
                    })
                    .from(accountBalances)
                    .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
                    .where(eq(accounts.userId, auth.userId))
                    .groupBy(accountBalances.currency)
                    .orderBy(desc(sql`COUNT(*)`))
                    .limit(1);

                if (commonCurrency) {
                    primaryCurrency = commonCurrency.currency;
                }
            }

            // Get current account balances (remaining amount)
            let currentBalance = 0;

            if (accountId) {
                // Get balance for specific account, verify ownership
                const [accountBalance] = await db
                    .select({
                        balance: accountBalances.current
                    })
                    .from(accountBalances)
                    .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
                    .where(and(
                        eq(accountBalances.accountId, accountId),
                        eq(accounts.userId, auth.userId)
                    ))
                    .orderBy(desc(accountBalances.timestamp))
                    .limit(1);

                if (accountBalance) {
                    currentBalance = accountBalance.balance;
                }
            } else {
                // Get total balance across all user accounts
                const balances = await db
                    .select({
                        accountId: accountBalances.accountId,
                        balance: accountBalances.current,
                        timestamp: accountBalances.timestamp
                    })
                    .from(accountBalances)
                    .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
                    .where(eq(accounts.userId, auth.userId))
                    .orderBy(desc(accountBalances.timestamp));

                // Get the latest balance for each account
                const latestBalances = new Map();
                for (const balance of balances) {
                    if (!latestBalances.has(balance.accountId)) {
                        latestBalances.set(balance.accountId, balance.balance);
                    }
                }

                currentBalance = Array.from(latestBalances.values()).reduce((sum, balance) => sum + balance, 0);
            }

            // Calculate remaining change based on current balance vs previous period remaining
            const remainingChange = calculatePercentageChange(currentBalance, lastPeriod.remaining);

            const incomeChange = calculatePercentageChange(currentPeriod.income, lastPeriod.income);
            const expensesChange = calculatePercentageChange(currentPeriod.expenses, lastPeriod.expenses);

            // Get spending by user-defined categories
            const userCategory = await db
                .select({
                    name: categories.name,
                    value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
                })
                .from(transactions)
                .innerJoin(
                    accounts,
                    eq(transactions.accountId, accounts.id),
                )
                .innerJoin(
                    categories,
                    eq(transactions.userCategoryId, categories.id),
                )
                .where(and(
                    accountId ? eq(transactions.accountId, accountId) : undefined,
                    eq(accounts.userId, auth.userId),
                    lt(transactions.amount, 0),
                    lte(transactions.date, endDate),
                    gte(transactions.date, startDate),
                    isNotNull(transactions.userCategoryId),
                ))
                .groupBy(categories.name)
                .orderBy(desc(
                    sql`SUM(ABS(${transactions.amount}))`,))

            // Get spending by predefined categories
            const predefinedCategory = await db
                .select({
                    name: predefinedCategories.name,
                    value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
                })
                .from(transactions)
                .innerJoin(
                    accounts,
                    eq(transactions.accountId, accounts.id),
                )
                .innerJoin(
                    predefinedCategories,
                    eq(transactions.predefinedCategoryId, predefinedCategories.id),
                )
                .where(and(
                    accountId ? eq(transactions.accountId, accountId) : undefined,
                    eq(accounts.userId, auth.userId),
                    lt(transactions.amount, 0),
                    lte(transactions.date, endDate),
                    gte(transactions.date, startDate),
                    isNotNull(transactions.predefinedCategoryId),
                ))
                .groupBy(predefinedCategories.name)
                .orderBy(desc(
                    sql`SUM(ABS(${transactions.amount}))`,))

            // Combine user and predefined categories
            const category = [...userCategory, ...predefinedCategory];

            // Get uncategorized transactions
            const [uncategorizedTotal] = await db
                .select({
                    value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
                })
                .from(transactions)
                .innerJoin(
                    accounts,
                    eq(transactions.accountId, accounts.id),
                )
                .where(and(
                    accountId ? eq(transactions.accountId, accountId) : undefined,
                    eq(accounts.userId, auth.userId),
                    lt(transactions.amount, 0),
                    lte(transactions.date, endDate),
                    gte(transactions.date, startDate),
                    isNull(transactions.userCategoryId),
                    isNull(transactions.predefinedCategoryId),
                ));

            // Add uncategorized to the list if there are any
            if (uncategorizedTotal && uncategorizedTotal.value > 0) {
                category.push({
                    name: "Uncategorized",
                    value: uncategorizedTotal.value,
                });
            }

            // Sort categories by value (highest to lowest)
            const sortedCategories = [...category].sort((a, b) => b.value - a.value);
            
            // Take top 5 categories maximum, minimum 1
            let finalCategories = [];
            
            if (sortedCategories.length > 0) {
                const topCategories = sortedCategories.slice(0, 5);
                const otherCategories = sortedCategories.slice(5);
                const otherSum = otherCategories.reduce((sum, current) => sum + current.value, 0);
                
                // Keep original values for proper chart display
                finalCategories = topCategories.map(cat => ({
                    name: cat.name,
                    value: cat.value
                }));
                
                // Add "Other" category if there are remaining categories and we have space
                if (otherCategories.length > 0 && otherSum > 0 && finalCategories.length < 5) {
                    finalCategories.push({
                        name: "Other",
                        value: otherSum
                    });
                }
                
                // Ensure minimum of 1 category
                if (finalCategories.length === 0) {
                    finalCategories = sortedCategories.slice(0, 1);
                }
            }

            const activeDays = await db
                .select({
                    date: transactions.date,
                    income: sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
                    expenses: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS (${transactions.amount}) ELSE 0 END)`.mapWith(Number),
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id)).where(and(
                    accountId ? eq(transactions.accountId, accountId) : undefined,
                    eq(accounts.userId, auth.userId),
                    lte(transactions.date, endDate),
                    gte(transactions.date, startDate),
                ))
                .groupBy(transactions.date)
                .orderBy(transactions.date)

            const days = fillMissingDays(activeDays, startDate, endDate);

            return c.json({
                data: {
                    remainingAmount: currentBalance,
                    remainingChange,
                    incomeAmount: currentPeriod.income,
                    incomeChange,
                    expensesAmount: currentPeriod.expenses,
                    expensesChange,
                    categories: finalCategories,
                    days,
                    currency: primaryCurrency,
                }
            })
        }
    )

export default app