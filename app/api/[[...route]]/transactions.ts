import { Hono } from 'hono';
import { and, desc, eq, gte, inArray, lte, sql, isNotNull, isNull, or } from 'drizzle-orm';
import { createId } from "@paralleldrive/cuid2"
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { parse, subDays, startOfDay, endOfDay } from "date-fns"


import { db } from "@/db/drizzle"
import { accounts, categories, predefinedCategories, insertTransactionSchema, transactions } from "@/db/schema"
import { z } from 'zod';


const app = new Hono()

    .get(
        "/count",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [{ total = 0 } = {}] = await db
                .select({ total: sql`COUNT(${transactions.id})` })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(eq(accounts.userId, auth.userId));

            return c.json({ total });
        }
    )
    .get(
        "/",
        zValidator("query", z.object({
            from: z.string().optional(),
            to: z.string().optional(),
            accountId: z.string().optional(),
        })),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c)
            const { from, to, accountId } = c.req.valid("query")

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            // Apply date filters only when query parameters are provided
            const startDate = from
                ? startOfDay(parse(from, "yyyy-MM-dd", new Date()))
                : undefined;

            const endDate = to
                ? endOfDay(parse(to, "yyyy-MM-dd", new Date()))
                : undefined;

            const data = await db
                .select({
                    id: transactions.id,
                    date: transactions.date,
                    // Combined result for the display "category" field
                    category: sql`
                        CASE 
                            WHEN ${categories.name} IS NOT NULL THEN ${categories.name} 
                            WHEN ${predefinedCategories.name} IS NOT NULL THEN ${predefinedCategories.name}
                            ELSE 'Uncategorized'
                        END
                    `.as('category'),
                    // Include the emoji for predefined categories
                    categoryEmoji: sql`
                        CASE
                            WHEN ${predefinedCategories.emoji} IS NOT NULL THEN ${predefinedCategories.emoji}
                            ELSE NULL
                        END
                    `.as('categoryEmoji'),
                    // Include the icon for predefined categories
                    categoryIcon: sql`
                        CASE
                            WHEN ${predefinedCategories.icon} IS NOT NULL THEN ${predefinedCategories.icon}
                            ELSE NULL
                        END
                    `.as('categoryIcon'),
                    // Store both types of category IDs
                    userCategoryId: transactions.userCategoryId,
                    predefinedCategoryId: transactions.predefinedCategoryId,
                    payee: transactions.payee,
                    amount: transactions.amount,
                    notes: transactions.notes,
                    account: accounts.name,
                    accountId: transactions.accountId,
                    // Include currency from the account's latest balance
                    currency: sql`
                        COALESCE(
                            (SELECT currency FROM account_balances 
                             WHERE account_id = ${transactions.accountId} 
                             ORDER BY timestamp DESC LIMIT 1),
                            'EUR'
                        )
                    `.as('currency'),
                }).from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                // Left join both category tables - only one will match for each transaction
                .leftJoin(categories, eq(transactions.userCategoryId, categories.id))
                .leftJoin(predefinedCategories, eq(transactions.predefinedCategoryId, predefinedCategories.id))
                .where(
                    and(
                        accountId ? eq(transactions.accountId, accountId) : undefined,
                        eq(accounts.userId, auth.userId),
                        startDate ? gte(transactions.date, startDate) : undefined,
                        endDate ? lte(transactions.date, endDate) : undefined,
                    ))
                .orderBy(desc(transactions.date))
            return c.json({ data })
        })
    .get(
        "/:id",
        zValidator("param", z.object({
            id: z.string().optional(),
        })),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c)
            const { id } = c.req.valid("param")

            if (!id) {
                return c.json({ error: "Missing id" }, 400)
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const [data] = await db
                .select({
                    id: transactions.id,
                    date: transactions.date,
                    userCategoryId: transactions.userCategoryId,
                    predefinedCategoryId: transactions.predefinedCategoryId,
                    payee: transactions.payee,
                    amount: transactions.amount,
                    notes: transactions.notes,
                    accountId: transactions.accountId,
                    // Include currency from the account's latest balance
                    currency: sql`
                        COALESCE(
                            (SELECT currency FROM account_balances 
                             WHERE account_id = ${transactions.accountId} 
                             ORDER BY timestamp DESC LIMIT 1),
                            'EUR'
                        )
                    `.as('currency'),
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(
                    and(
                        eq(transactions.id, id),
                        eq(accounts.userId, auth.userId),
                    )
                )

            if (!data) {
                return c.json({ error: "Not found" }, 404)
            }

            return c.json({ data })
        }
    )
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", z.object({
            date: z.coerce.date(),
            payee: z.string(),
            amount: z.number(),
            notes: z.string().optional(),
            accountId: z.string(),
            userCategoryId: z.string().optional(),
            predefinedCategoryId: z.string().optional(),
        }).refine(data => !(data.userCategoryId && data.predefinedCategoryId), {
            message: "A transaction cannot have both a user category and a predefined category",
        })),
        async (c) => {
            const auth = getAuth(c)
            const values = c.req.valid("json")

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const [data] = await db.insert(transactions).values({
                id: createId(),
                ...values,
            }).returning()


            return c.json({ data })
        })
    .post(
        "/bulk-create",
        clerkMiddleware(),
        zValidator("json", z.array(
            z.object({
                date: z.coerce.date(),
                payee: z.string(),
                amount: z.number(),
                notes: z.string().optional(),
                accountId: z.string(),
                // Make both category fields optional
                userCategoryId: z.string().optional(),
                predefinedCategoryId: z.string().optional(),
            }).refine(data => !(data.userCategoryId && data.predefinedCategoryId), {
                message: "A transaction cannot have both a user category and a predefined category",
            })
        ).min(1, { message: "At least one transaction is required" })
        ),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            try {
                const data = await db
                    .insert(transactions)
                    .values(
                        values.map((value) => ({
                            id: createId(),
                            ...value,
                        }))
                    ).returning();

                return c.json({ data });
            } catch (error: unknown) {
                // *** Log Crítico de Error DB ***
                console.error("API /bulk-create: Error durante la inserción en DB:", error);
                // Considera devolver un error más específico si es posible
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return c.json({ error: "Database insertion failed", details: errorMessage }, 500);
            }
        })
    .post(
        "/ -delete",
        clerkMiddleware(),
        zValidator("json", z.object({
            ids: z.array(z.string())
        })
        ),
        async (c) => {
            const auth = getAuth(c)
            const values = c.req.valid("json")

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const transactionsToDelete = db.$with("transactions_to_delete").as(db.select({ id: transactions.id })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(
                    inArray(transactions.id, values.ids),
                    eq(accounts.userId, auth.userId),
                ))
            )

            const data = await db
                .with(transactionsToDelete)
                .delete(transactions)
                .where(
                    inArray(transactions.id, sql`(select id from ${transactionsToDelete})`)
                )
                .returning({
                    id: transactions.id,
                })
            return c.json({ data })
        }
    )
    .patch("/:id",
        clerkMiddleware(),
        zValidator("param", z.object({
            id: z.string().optional(),
        })),
        zValidator("json", z.object({
            date: z.coerce.date(),
            payee: z.string(),
            amount: z.number(),
            notes: z.string().optional(),
            accountId: z.string(),
            userCategoryId: z.string().optional().nullable(),
            predefinedCategoryId: z.string().optional().nullable(),
        }).refine(data => !(data.userCategoryId && data.predefinedCategoryId), {
            message: "A transaction cannot have both a user category and a predefined category",
        })),
        async (c) => {
            const auth = getAuth(c)
            const { id } = c.req.valid("param")
            const values = c.req.valid("json")

            if (!id) {
                return c.json({ error: "Missing id" }, 400)
            }
            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const transactionsToUpdate = db.$with("transactions_to_update").as(db.select({ id: transactions.id })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(
                    eq(transactions.id, id),
                    eq(accounts.userId, auth.userId),
                ))
            )

            const [data] = await db
                .with(transactionsToUpdate)
                .update(transactions)
                .set({
                    ...values,
                })
                .where(
                    inArray(transactions.id, sql`(select id from ${transactionsToUpdate})`)
                )
                .returning();

            if (!data) {
                return c.json({ error: "Not found" }, 404)
            }

            return c.json({ data })
        }
    )
    .delete("/:id",
        clerkMiddleware(),
        zValidator("param", z.object({
            id: z.string().optional(),
        })),
        async (c) => {
            const auth = getAuth(c)
            const { id } = c.req.valid("param")

            if (!id) {
                return c.json({ error: "Missing id" }, 400)
            }
            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const transactionsToDelete = db.$with("transactions_to_delete").as(db.select({ id: transactions.id })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(
                    eq(transactions.id, id),
                    eq(accounts.userId, auth.userId),
                ))
            )

            const [data] = await db
                .with(transactionsToDelete)
                .delete(transactions)
                .where(
                    inArray(transactions.id, sql`(select id from ${transactionsToDelete})`)
                )
                .returning({
                    id: transactions.id,
                })


            if (!data) {
                return c.json({ error: "Not found" }, 404)
            }

            return c.json({ data })
        }
    )


export default app;