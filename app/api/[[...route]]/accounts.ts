import { Hono } from 'hono';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { createId } from "@paralleldrive/cuid2"
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"


import { db } from "@/db/drizzle"
import { insertAccountSchema, accounts, accountBalances, bankConnections, transactions } from "@/db/schema"
import { z } from 'zod';
import { desc, sql } from 'drizzle-orm';
import { convertAmountFromMiliunits } from '@/lib/utils';
import { getTrueLayerConfig } from '@/lib/truelayer-config';

// Usar configuración dinámica
const config = getTrueLayerConfig();
const API_BASE_URL_TRUELAYER = config.apiBaseUrl;
const AUTH_URL_TRUELAYER = config.authUrl;

// Tipo simplificado para la conexión bancaria
type BankConnection = {
    id: string;
    userId: string;
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date | null;
};

// Función para verificar si un token ha expirado
function isTokenExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return true;
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    return now.getTime() > (expirationDate.getTime() - 5 * 60 * 1000); // 5 minutos de margen
}

async function refreshAccessToken(connection: BankConnection): Promise<string> {
    if (!connection.refreshToken) throw new Error('No hay refresh token disponible');
    const response = await fetch(AUTH_URL_TRUELAYER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: config.clientId!,
            client_secret: config.clientSecret!,
            refresh_token: connection.refreshToken,
        }),
    });
    if (!response.ok) throw new Error(`Error al renovar token: ${await response.text()}`);
    const data = await response.json();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);
    await db.update(bankConnections)
        .set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token || connection.refreshToken,
            expiresAt,
            updatedAt: new Date(),
        })
        .where(eq(bankConnections.id, connection.id))
        .execute();
    return data.access_token;
}

// Función para ofuscar un IBAN
function obfuscateIban(iban: string): string {
    if (!iban || iban.length < 10) return iban;

    // Mantener los primeros 4 caracteres (código de país y dígitos de control)
    // y los últimos 4 caracteres, ofuscando el resto
    const countryAndCheck = iban.substring(0, 4);
    const lastFour = iban.substring(iban.length - 4);
    const middleLength = iban.length - 8;

    // Crear asteriscos para la parte media
    const maskedMiddle = '*'.repeat(Math.min(middleLength, 8)); // Limitar a máximo 8 asteriscos

    return `${countryAndCheck} ${maskedMiddle} ${lastFour}`;
}

// Función para limpiar el nombre de la institución
function cleanInstitutionName(name: string | null): string | null {
    if (!name) return null;
    // Lista de posibles prefijos/componentes a ignorar o que indican un nombre más largo
    const prefixesToClean = [
        "XS2A-REDSYS-",
        "ES-XS2A-",
        "REDSYS-",
        "XS2A-"
        // Añadir más prefijos genéricos si es necesario
    ];

    let cleanedName = name;
    for (const prefix of prefixesToClean) {
        if (cleanedName.toUpperCase().startsWith(prefix.toUpperCase())) {
            cleanedName = cleanedName.substring(prefix.length);
        }
    }

    // Si después de quitar prefijos comunes, aún hay guiones, tomar la última parte.
    const parts = cleanedName.split('-');
    if (parts.length > 1) {
        // Tomar la última parte, asumiendo que es el nombre del banco principal.
        // Esto es una heurística y podría necesitar ajustes.
        // Ejemplo: "SOME-PREFIX-BANKNAME" -> "BANKNAME"
        // Ejemplo específico: "BBVA" (si queda así después de quitar prefijos)
        // o si originalmente era "BANK-BBVA" -> "BBVA"
        const lastPart = parts[parts.length - 1];
        // Podríamos añadir una verificación aquí para ver si lastPart es un nombre de banco conocido
        // o si es muy corto y podría ser un código, en cuyo caso tomar más partes.
        // Por ahora, una lógica simple:
        if (lastPart.length > 2 || parts.length === 2) { // Evitar códigos de país o muy cortos si hay más partes
            return lastPart;
        } else if (parts.length > 2) {
            // Si la última parte es muy corta y hay más, quizás la penúltima es mejor
            const secondLastPart = parts[parts.length - 2];
            if (secondLastPart.length > 2) return secondLastPart;
        }
    }
    return cleanedName; // Devuelve el nombre procesado o el original si no hay guiones significativos
}

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        async (c) => {
            try {
                const auth = getAuth(c)

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
    .get(
        "/:id/details",
        zValidator("param", z.object({ id: z.string() })),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);
            if (!id) return c.json({ error: "Missing id" }, 400);

            const [account] = await db
                .select({ id: accounts.id, name: accounts.name, plaidId: accounts.plaidId })
                .from(accounts)
                .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)));
            if (!account) return c.json({ error: "Account not found" }, 404);

            const bankConnectionDetails = await db
                .select({
                    institutionName: bankConnections.institutionName,
                    status: bankConnections.status,
                    lastSynced: bankConnections.lastSyncedAt,
                    accessToken: bankConnections.accessToken,
                    refreshToken: bankConnections.refreshToken,
                    expiresAt: bankConnections.expiresAt,
                    id: bankConnections.id 
                })
                .from(bankConnections)
                .where(eq(bankConnections.userId, auth.userId))
                .orderBy(desc(bankConnections.createdAt))
                .limit(1)
                .then(r => r[0] || null);

            const balancesHistory = await db
                .select({ timestamp: accountBalances.timestamp, current: accountBalances.current })
                .from(accountBalances)
                .where(eq(accountBalances.accountId, id))
                .orderBy(desc(accountBalances.timestamp))
                .limit(30);
            const latestBalance = balancesHistory[0] || null;

            // 4. Última transacción
            const lastTransaction = await db
                .select({ id: transactions.id, amount: transactions.amount, payee: transactions.payee, date: transactions.date })
                .from(transactions)
                .where(eq(transactions.accountId, id))
                .orderBy(desc(transactions.date))
                .limit(1)
                .then(r => r[0] || null);

            // 5. Cantidad de transacciones
            const [{ count: transactionsCount }] = await db
                .select({ count: sql`count(*)` })
                .from(transactions)
                .where(eq(transactions.accountId, id));

            // 6. Obtener logo y detalles adicionales de TrueLayer si es posible
            let logoUrl: string | null = null;
            let accountNumberDisplay: string | null = null;
            let providerInstitutionName: string | null = bankConnectionDetails?.institutionName || null;
            let truelayerCurrency: string | undefined = undefined;

            if (account.plaidId && bankConnectionDetails) {
                try {
                    // Asegurarnos de tener un token válido
                    let accessToken = bankConnectionDetails.accessToken;
                    if (isTokenExpired(bankConnectionDetails.expiresAt)) {
                        try {
                            accessToken = await refreshAccessToken({
                                id: bankConnectionDetails.id,
                                userId: auth.userId,
                                accessToken: bankConnectionDetails.accessToken,
                                refreshToken: bankConnectionDetails.refreshToken,
                                expiresAt: bankConnectionDetails.expiresAt
                            });
                        } catch (error) {
                            console.error('Error al refrescar token para detalles de cuenta:', error);
                            // Continuamos con el token existente o sin detalles adicionales
                        }
                    }

                    // Llamar a la API de TrueLayer para obtener detalles de la cuenta
                    if (accessToken) {
                        const accountDetailsRes = await fetch(`${API_BASE_URL_TRUELAYER}/data/v1/accounts/${account.plaidId}`, {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        });

                        if (accountDetailsRes.ok) {
                            const accountDetailsData = await accountDetailsRes.json() as {
                                results?: Array<{
                                    provider?: {
                                        logo_uri?: string;
                                        display_name?: string;
                                    };
                                    account_number?: {
                                        iban?: string;
                                        number?: string;
                                        sort_code?: string;
                                    };
                                    currency?: string;
                                }>;
                            };
                            console.log('[API][GET /accounts/:id/details] Respuesta de TrueLayer:',
                                JSON.stringify(accountDetailsData, null, 2));

                            if (accountDetailsData.results && accountDetailsData.results.length > 0) {
                                const accountDetails = accountDetailsData.results[0];

                                // Extraer logo_uri si está disponible
                                if (accountDetails.provider && accountDetails.provider.logo_uri) {
                                    logoUrl = accountDetails.provider.logo_uri;
                                }

                                // Extraer nombre de la institución si está disponible
                                if (accountDetails.provider && accountDetails.provider.display_name) {
                                    providerInstitutionName = accountDetails.provider.display_name;
                                }

                                // Extraer y ofuscar número de cuenta (IBAN preferentemente)
                                if (accountDetails.account_number) {
                                    if (accountDetails.account_number.iban) {
                                        accountNumberDisplay = obfuscateIban(accountDetails.account_number.iban);
                                    } else if (accountDetails.account_number.number) {
                                        // Alternativa para cuentas sin IBAN
                                        const number = accountDetails.account_number.number;
                                        const lastFour = number.slice(-4);
                                        accountNumberDisplay = `**** **** **** ${lastFour}`;

                                        // Si hay sort_code (común en UK), incluirlo
                                        if (accountDetails.account_number.sort_code) {
                                            accountNumberDisplay = `${accountDetails.account_number.sort_code} - ${accountNumberDisplay}`;
                                        }
                                    }
                                }

                                if (accountDetails.currency) {
                                    truelayerCurrency = accountDetails.currency;
                                }
                            }
                        } else {
                            console.error('[API][GET /accounts/:id/details] Error al obtener detalles de cuenta de TrueLayer:',
                                await accountDetailsRes.text());
                        }
                    }
                } catch (error) {
                    console.error('[API][GET /accounts/:id/details] Error al procesar detalles de TrueLayer:', error);
                    // Continuamos con los datos que tengamos
                }
            }

            // 7. Formatear balances
            function formatBalance(b: { current: number, available?: number, currency?: string } | null) {
                return b ? {
                    current: convertAmountFromMiliunits(b.current),
                    available: b.available ? convertAmountFromMiliunits(b.available) : convertAmountFromMiliunits(b.current),
                    currency: b.currency || truelayerCurrency || "EUR"
                } : null;
            }

            return c.json({
                data: {
                    account,
                    bank: {
                        institutionName: cleanInstitutionName(providerInstitutionName),
                        status: bankConnectionDetails?.status || null,
                        logoUrl: logoUrl,
                    },
                    balance: formatBalance(latestBalance),
                    balancesHistory: balancesHistory.map(b => ({ timestamp: b.timestamp, current: convertAmountFromMiliunits(b.current) })).reverse(),
                    transactionsCount: Number(transactionsCount || 0),
                    lastTransaction: lastTransaction ? {
                        ...lastTransaction,
                        amount: convertAmountFromMiliunits(lastTransaction.amount)
                    } : null,
                    lastSynced: bankConnectionDetails?.lastSynced || null,
                    accountNumberDisplay: accountNumberDisplay
                }
            });
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
        const userAccounts = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.userId, auth.userId));
        if (!userAccounts.length) return c.json({ pending: [] });
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