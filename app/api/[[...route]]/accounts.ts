import { Hono } from 'hono';
import { and, eq, inArray } from 'drizzle-orm';
import { createId } from "@paralleldrive/cuid2"
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"


import { db } from "@/db/drizzle"
import { insertAccountSchema, accounts, accountBalances, bankConnections, transactions } from "@/db/schema"
import { z } from 'zod';
import { desc, sql } from 'drizzle-orm';
import { convertAmountFromMiliunits } from '@/lib/utils';


const app = new Hono()

    .get(
        "/",
        clerkMiddleware(),
        async (c) => {
            try {
                const auth = getAuth(c)
                console.log('[API][GET /accounts] Solicitando cuentas para usuario:', auth?.userId);

                if (!auth?.userId) {
                    return c.json({ error: "Unauthorized" }, 401)
                }

                // Obtener la conexión más reciente para saber cuándo fue la última sincronización
                const connection = await db.query.bankConnections.findFirst({
                    where: eq(bankConnections.userId, auth.userId),
                    orderBy: (bankConnections, { desc }) => [desc(bankConnections.createdAt)],
                });

                // Obtener las cuentas del usuario con plaidId
                const accountsData = await db
                    .select({
                        id: accounts.id,
                        name: accounts.name,
                        plaidId: accounts.plaidId,
                    })
                    .from(accounts)
                    .where(eq(accounts.userId, auth.userId));

                console.log('[API][GET /accounts] Cuentas encontradas:', accountsData.length);

                // Preparar el objeto de respuesta
                const accountResults = [];
                for (const account of accountsData) {
                    // Obtener el último balance desde la base de datos
                    const latestBalance = await db
                        .select()
                        .from(accountBalances)
                        .where(eq(accountBalances.accountId, account.id))
                        .orderBy(desc(accountBalances.timestamp))
                        .limit(1)
                        .then(results => results[0] || null);

                    // Contar transacciones
                    const transactionsCount = await db
                        .select({ count: sql`count(*)` })
                        .from(transactions)
                        .where(eq(transactions.accountId, account.id))
                        .then(result => Number(result[0]?.count || 0));

                    accountResults.push({
                        account,
                        balance: latestBalance
                            ? {
                                current: convertAmountFromMiliunits(latestBalance.current),
                                available: latestBalance.available ? convertAmountFromMiliunits(latestBalance.available) : convertAmountFromMiliunits(latestBalance.current),
                                currency: latestBalance.currency
                            }
                            : null,
                        transactions: transactionsCount
                    });
                }

                return c.json({
                    success: true,
                    accounts: accountResults,
                    lastSynced: connection?.lastSyncedAt || null
                });
            } catch (error: any) {
                console.error('[API][GET /accounts] Error:', error);
                return c.json({
                    success: false,
                    error: "Error al obtener cuentas",
                    details: error?.message || "Error desconocido"
                }, { status: 500 });
            }
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
                    id: accounts.id,
                    name: accounts.name,
                })
                .from(accounts)
                .where(
                    and(
                        eq(accounts.userId, auth.userId),
                        eq(accounts.id, id)
                    )
                )

            if (!data) {
                return c.json({ error: "Account not found" }, 404)
            }

            return c.json({ data })
        }
    )
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", insertAccountSchema.extend({
            balance: z.object({
                current: z.number().min(0),
                currency: z.string().default("EUR")
            }).optional(),
        })),
        async (c) => {
            try {
                const auth = getAuth(c)
                const values = c.req.valid("json")
                console.log('[API][POST /accounts] Payload recibido:', values);

                if (!auth?.userId) {
                    console.log('[API][POST /accounts] Error: Unauthorized');
                    return c.json({ error: "Unauthorized" }, 401)
                }

                // Crear la cuenta
                const [account] = await db.insert(accounts).values({
                    id: createId(),
                    userId: auth.userId,
                    name: values.name,
                }).returning()
                console.log('[API][POST /accounts] Cuenta creada:', account);

                // Si hay balance y no es cuenta bancaria, crear balance inicial
                if (values.balance && !account.plaidId) {
                    await db.insert(accountBalances).values({
                        id: createId(),
                        accountId: account.id,
                        current: Math.round(values.balance.current * 1000),
                        currency: values.balance.currency || "EUR",
                        timestamp: new Date(),
                    })
                    console.log('[API][POST /accounts] Balance manual insertado:', values.balance);
                }

                return c.json({ data: account })
            } catch (err) {
                console.error('[API][POST /accounts] Error inesperado:', err);
                return c.json({ error: 'Internal server error', details: String(err) }, 500);
            }
        }
    )
    .post(
        "/bulk-delete",
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

            const data = await db
                .delete(accounts)
                .where(
                    and(
                        eq(accounts.userId, auth.userId),
                        inArray(accounts.id, values.ids)
                    )
                )
                .returning({
                    id: accounts.id,
                }
                )
            return c.json({ data })
        }
    )
    .patch("/:id",
        clerkMiddleware(),
        zValidator("param", z.object({
            id: z.string().optional(),
        })),
        zValidator("json", insertAccountSchema.pick({
            name: true,
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

            const [data] = await db
                .update(accounts)
                .set(values)
                .where(
                    and(
                        eq(accounts.userId, auth.userId),
                        eq(accounts.id, id)
                    )
                )
                .returning()

            if (!data) {
                return c.json({ error: "Account not found" }, 404)
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

            const [data] = await db
                .delete(accounts)
                .where(
                    and(
                        eq(accounts.userId, auth.userId),
                        eq(accounts.id, id)
                    )
                )
                .returning({
                    id: accounts.id,
                })

            if (!data) {
                return c.json({ error: "Account not found" }, 404)
            }

            return c.json({ data })
        }
    )
    .get('/pending-categorization', async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }
        // Buscar todas las cuentas del usuario
        const userAccounts = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.userId, auth.userId));
        if (!userAccounts.length) return c.json({ pending: [] });
        // Para cada cuenta, contar transacciones de gasto sin categoría
        const pending = await Promise.all(
            userAccounts.map(async (acc) => {
                const [{ count }] = await db
                    .select({ count: sql<number>`cast(count(${transactions.id}) as int)` })
                    .from(transactions)
                    .where(
                        and(
                            eq(transactions.accountId, acc.id),
                            isNull(transactions.predefinedCategoryId),
                            sql`${transactions.amount} < 0`
                        )
                    );
                return { accountId: acc.id, pendingCount: count };
            })
        );
        return c.json({ pending });
    });

export default app;