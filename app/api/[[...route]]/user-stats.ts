import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { db } from '@/db/drizzle';
import { accounts, transactions, categories, accountBalances } from '@/db/schema';
import { desc, eq, sql, and } from 'drizzle-orm';

const userStatsRoutes = new Hono()
    .use('*', clerkMiddleware())
    .get('/', async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }
        const userId = auth.userId;

        // Obtener balance total sumando el último balance de cada cuenta
        const [{ balance = 0 } = {}] = await db
            .select({ balance: sql`COALESCE(SUM(${accountBalances.current}), 0)` })
            .from(accountBalances)
            .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
            .where(eq(accounts.userId, userId));

        // Gastos del mes actual
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const [{ monthlySpend = 0 } = {}] = await db
            .select({ monthlySpend: sql`ABS(COALESCE(SUM(${transactions.amount}), 0))` })
            .from(transactions)
            .innerJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(and(
                eq(accounts.userId, userId),
                sql`${transactions.amount} < 0`,
                sql`${transactions.date} >= ${from}`,
                sql`${transactions.date} <= ${to}`
            ));

        // Categoría principal del mes
        const [topCat] = await db
            .select({
                name: categories.name,
                total: sql`ABS(SUM(${transactions.amount}))`,
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
            .orderBy(desc(sql`total`));

        return c.json({
            monthlySpend,
            topCategory: topCat?.name || '',
            balance,
        });
    });

export default userStatsRoutes; 