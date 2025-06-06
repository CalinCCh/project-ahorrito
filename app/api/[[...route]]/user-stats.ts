import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { db } from '@/db/drizzle';
import { accounts, transactions, categories, accountBalances, savingsGoals, savingsContributions } from '@/db/schema';
import { desc, eq, sql, and, count } from 'drizzle-orm';

const userStatsRoutes = new Hono()
    .use('*', clerkMiddleware())
    .get('/', async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }
        const userId = auth.userId;

        try {
            // Obtener balance total sumando el último balance de cada cuenta
            const balanceResult = await db
                .select({ balance: sql<number>`COALESCE(SUM(${accountBalances.current}), 0)` })
                .from(accountBalances)
                .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
                .where(eq(accounts.userId, userId));
            const balance = balanceResult[0]?.balance || 0;

            // Gastos del mes actual
            const now = new Date();
            const from = new Date(now.getFullYear(), now.getMonth(), 1);
            const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const spendResult = await db
                .select({ monthlySpend: sql<number>`ABS(COALESCE(SUM(${transactions.amount}), 0))` })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(
                    eq(accounts.userId, userId),
                    sql`${transactions.amount} < 0`,
                    sql`${transactions.date} >= ${from}`,
                    sql`${transactions.date} <= ${to}`
                ));
            const monthlySpend = spendResult[0]?.monthlySpend || 0;            // Categoría principal del mes
            const topCat = await db
                .select({
                    name: categories.name,
                    total: sql<number>`ABS(SUM(${transactions.amount}))`,
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .innerJoin(categories, eq(transactions.userCategoryId, categories.id))
                .where(and(
                    eq(accounts.userId, userId),
                    sql`${transactions.amount} < 0`,
                    sql`${transactions.date} >= ${from}`,
                    sql`${transactions.date} <= ${to}`
                ))
                .groupBy(categories.name)
                .orderBy(desc(sql<number>`ABS(SUM(${transactions.amount}))`));

            return c.json({
                monthlySpend,
                topCategory: topCat?.[0]?.name || '',
                balance,
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    })
    .get('/overview', async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }
        const userId = auth.userId;

        try {
            // Balance total
            const balanceResult = await db
                .select({ balance: sql<number>`COALESCE(SUM(${accountBalances.current}), 0)` })
                .from(accountBalances)
                .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
                .where(eq(accounts.userId, userId));
            const balance = balanceResult[0]?.balance || 0;

            // Número de cuentas
            const accountCountResult = await db
                .select({ accountCount: count() })
                .from(accounts)
                .where(eq(accounts.userId, userId));
            const accountCount = accountCountResult[0]?.accountCount || 0;

            // Número de transacciones este mes
            const now = new Date();
            const from = new Date(now.getFullYear(), now.getMonth(), 1);
            const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const transactionCountResult = await db
                .select({ transactionCount: count() })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(
                    eq(accounts.userId, userId),
                    sql`${transactions.date} >= ${from}`,
                    sql`${transactions.date} <= ${to}`
                ));
            const transactionCount = transactionCountResult[0]?.transactionCount || 0;

            // Metas de ahorro activas
            const activeSavingsGoalsResult = await db
                .select({ activeSavingsGoals: count() })
                .from(savingsGoals)
                .where(and(
                    eq(savingsGoals.userId, userId),
                    eq(savingsGoals.status, 'active')
                ));
            const activeSavingsGoals = activeSavingsGoalsResult[0]?.activeSavingsGoals || 0;

            // Total ahorrado
            const totalSavedResult = await db
                .select({ totalSaved: sql<number>`COALESCE(SUM(${savingsContributions.amount}), 0)` })
                .from(savingsContributions)
                .innerJoin(savingsGoals, eq(savingsContributions.goalId, savingsGoals.id))
                .where(eq(savingsGoals.userId, userId));
            const totalSaved = totalSavedResult[0]?.totalSaved || 0;

            return c.json({
                balance,
                accountCount,
                transactionCount,
                activeSavingsGoals,
                totalSaved
            });
        } catch (error) {
            console.error('Error fetching user overview stats:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    })
    .get('/monthly', async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }
        const userId = auth.userId;

        try {
            const now = new Date();
            const from = new Date(now.getFullYear(), now.getMonth(), 1);
            const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            // Gastos del mes
            const spendResult = await db
                .select({ monthlySpend: sql<number>`ABS(COALESCE(SUM(${transactions.amount}), 0))` })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(
                    eq(accounts.userId, userId),
                    sql`${transactions.amount} < 0`,
                    sql`${transactions.date} >= ${from}`,
                    sql`${transactions.date} <= ${to}`
                ));
            const monthlySpend = spendResult[0]?.monthlySpend || 0;

            // Ingresos del mes
            const incomeResult = await db
                .select({ monthlyIncome: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(
                    eq(accounts.userId, userId),
                    sql`${transactions.amount} > 0`,
                    sql`${transactions.date} >= ${from}`,
                    sql`${transactions.date} <= ${to}`
                ));
            const monthlyIncome = incomeResult[0]?.monthlyIncome || 0;            // Top 5 categorías de gastos
            const topCategories = await db
                .select({
                    name: categories.name,
                    total: sql<number>`ABS(SUM(${transactions.amount}))`,
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .innerJoin(categories, eq(transactions.userCategoryId, categories.id))
                .where(and(
                    eq(accounts.userId, userId),
                    sql`${transactions.amount} < 0`,
                    sql`${transactions.date} >= ${from}`,
                    sql`${transactions.date} <= ${to}`
                ))
                .groupBy(categories.name)
                .orderBy(desc(sql<number>`ABS(SUM(${transactions.amount}))`))
                .limit(5);

            return c.json({
                monthlySpend,
                monthlyIncome,
                monthlyNet: monthlyIncome - monthlySpend,
                topCategories
            });
        } catch (error) {
            console.error('Error fetching monthly stats:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    });

export default userStatsRoutes;