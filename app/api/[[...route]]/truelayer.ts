import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { db } from '@/db/drizzle';
import { accounts, transactions, bankConnections, accountBalances, categories, predefinedCategories } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, desc, sql, and } from 'drizzle-orm';
import { convertAmountToMiliunits } from '@/lib/utils';
import { getTrueLayerConfig } from '@/lib/truelayer-config';

// Usar configuración dinámica
const config = getTrueLayerConfig();
const API_BASE_URL = config.apiBaseUrl;
const AUTH_URL = config.authUrl;

export type BankConnection = {
    id: string;
    userId: string;
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date | null;
};

async function refreshAccessToken(connection: BankConnection): Promise<string> {
    if (!connection.refreshToken) throw new Error('No hay refresh token disponible');
    const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
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

function isTokenExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return true;
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    return now.getTime() > (expirationDate.getTime() - 5 * 60 * 1000);
}

function validateTransaction(transaction: any): boolean {
    if (!transaction.amount || typeof transaction.amount !== 'number') return false;
    if (!transaction.description || typeof transaction.description !== 'string') return false;
    if (!transaction.timestamp || isNaN(new Date(transaction.timestamp).getTime())) return false;
    return true;
}

function sanitizeText(text: string): string {
    return text.replace(/[<>]/g, '');
}

async function getLastTransactionDate(accountId: string): Promise<Date | null> {
    try {
        const result = await db.query.transactions.findFirst({
            where: eq(transactions.accountId, accountId),
            orderBy: (transactions, { desc }) => [desc(transactions.date)],
        });
        return result?.date || null;
    } catch {
        return null;
    }
}

const app = new Hono();

app.use('/sync', clerkMiddleware());

app.post('/sync', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const requestData = await c.req.json();
    const { access_token, connection_id, force = false } = requestData;
    const account_id = requestData.account_id || null;
    const balanceOnly = requestData.balanceOnly === true;

    let accessToken;
    let connection;
    const userId = auth.userId;

    if (access_token) {
        accessToken = access_token;
    } else if (connection_id) {
        connection = await db.query.bankConnections.findFirst({
            where: eq(bankConnections.id, connection_id),
        });
        if (!connection || connection.userId !== userId) {
            return c.json({ error: 'Conexión no encontrada o no autorizada' }, 404);
        }
        if (isTokenExpired(connection.expiresAt)) {
            try {
                accessToken = await refreshAccessToken(connection);
            } catch (error) {
                return c.json({ error: 'No se pudo renovar el token de acceso', details: error instanceof Error ? error.message : 'Error desconocido' }, 401);
            }
        } else {
            accessToken = connection.accessToken;
        }
    } else {
        connection = await db.query.bankConnections.findFirst({
            where: eq(bankConnections.userId, userId),
            orderBy: (bankConnections, { desc }) => [desc(bankConnections.createdAt)],
        });
        if (!connection) {
            return c.json({ error: 'No hay conexiones bancarias' }, 404);
        }
        if (isTokenExpired(connection.expiresAt)) {
            try {
                accessToken = await refreshAccessToken(connection);
            } catch (error) {
                return c.json({ error: 'No se pudo renovar el token de acceso', details: error instanceof Error ? error.message : 'Error desconocido' }, 401);
            }
        } else {
            accessToken = connection.accessToken;
        }
    }

    const accountResults = [];
    const syncType = balanceOnly ? 'balance_only' : 'full_sync';
    const targetAccount = account_id ? 'single_account' : 'all_accounts';
    try {
        const accountsRes = await fetch(`${API_BASE_URL}/data/v1/accounts`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!accountsRes.ok) {
            const errorText = await accountsRes.text();
            return c.json({ error: 'Error al obtener cuentas', status: accountsRes.status, details: errorText }, 400);
        }
        const accountsData = await accountsRes.json();
        const { results: accountsList } = accountsData;
        const predefinedCats = await db.select({ id: predefinedCategories.id, name: predefinedCategories.name }).from(predefinedCategories);
        for (const account of accountsList) {
            if (account_id && account.account_id !== account_id) continue;
            try {
                // Primero verificar si ya existe una cuenta con este plaidId para este usuario
                const existingAccount = await db.query.accounts.findFirst({
                    where: and(
                        eq(accounts.plaidId, account.account_id),
                        eq(accounts.userId, userId)
                    ),
                });

                let savedAccount;
                if (existingAccount) {
                    // Actualizar cuenta existente
                    [savedAccount] = await db.update(accounts)
                        .set({ name: account.display_name || account.account_name })
                        .where(eq(accounts.id, existingAccount.id))
                        .returning();
                } else {
                    // Crear nueva cuenta
                    const accountId = createId();

                    // Insertar la cuenta con el nuevo ID, sin usar onConflictDoUpdate
                    const [savedAccount] = await db.insert(accounts)
                        .values({
                            id: accountId,
                            plaidId: account.account_id,
                            name: account.display_name || account.account_name,
                            userId,
                        })
                        .returning();

                    console.log('[SYNC] Created new account:', {
                        id: savedAccount.id,
                        name: savedAccount.name,
                        plaidId: savedAccount.plaidId
                    });
                }
                const balanceRes = await fetch(`${API_BASE_URL}/data/v1/accounts/${account.account_id}/balance`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                let balances = [];
                if (balanceRes.ok && savedAccount) {
                    const balanceData = await balanceRes.json();
                    balances = balanceData.results;
                    if (balances && balances.length > 0) {
                        const balance = balances[0];
                        await db.insert(accountBalances)
                            .values({
                                id: createId(),
                                accountId: savedAccount.id,
                                current: convertAmountToMiliunits(balance.current),
                                available: balance.available ? convertAmountToMiliunits(balance.available) : null,
                                currency: balance.currency,
                                timestamp: new Date(),
                            })
                            .execute();
                    }
                    let fromDate: Date | null = null;
                    let autoForce = false;
                    if (!balanceOnly && savedAccount) {
                        if (!force) {
                            fromDate = await getLastTransactionDate(savedAccount.id);
                            if (fromDate) {
                                const now = new Date();
                                const diffDays = (now.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
                                if (diffDays > 2) {
                                    fromDate = null;
                                    autoForce = true;
                                }
                            }
                        }
                        const transactionsUrl = new URL(`${API_BASE_URL}/data/v1/accounts/${account.account_id}/transactions`);
                        let fromDateParam: string | null = null;
                        if (!force && !autoForce && fromDate) {
                            const nextDay = new Date(fromDate);
                            nextDay.setDate(nextDay.getDate() + 1);
                            fromDateParam = nextDay.toISOString().split('T')[0];
                            transactionsUrl.searchParams.append('from', fromDateParam);
                        }
                        console.log('[SYNC] Requesting transactions', {
                            accountId: savedAccount?.id,
                            force,
                            autoForce,
                            fromDateParam,
                            url: transactionsUrl.toString(),
                        });
                        const transactionRes = await fetch(transactionsUrl.toString(), {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        });
                        if (transactionRes.ok && savedAccount) {
                            const transactionData = await transactionRes.json();
                            const fetchedCount = Array.isArray(transactionData.results) ? transactionData.results.length : 0;
                            console.log('[SYNC][RAW_TRANSACTIONS] Fetched:', {
                                accountId: savedAccount.id,
                                count: fetchedCount,
                                isFullSync: force || autoForce,
                            });
                            const allTransactions = transactionData.results || [];

                            // Consultar las transacciones YA categorizadas en la BD para esta cuenta
                            const existingCategorizedTxsInDb = await db.select({
                                externalId: transactions.externalId,
                                predefinedCategoryId: transactions.predefinedCategoryId,
                                userCategoryId: transactions.userCategoryId,
                            }).from(transactions)
                                .where(
                                    and(
                                        eq(transactions.accountId, savedAccount.id),
                                        sql`${transactions.predefinedCategoryId} IS NOT NULL OR ${transactions.userCategoryId} IS NOT NULL`
                                    )
                                );

                            const alreadyCategorizedInDbMap = new Map();
                            existingCategorizedTxsInDb.forEach(tx => {
                                if (tx.externalId) {
                                    alreadyCategorizedInDbMap.set(tx.externalId, {
                                        predefinedCategoryId: tx.predefinedCategoryId,
                                        userCategoryId: tx.userCategoryId
                                    });
                                }
                            });

                            for (let idx: number = 0; idx < allTransactions.length; idx++) {
                                const tlTransaction: any = allTransactions[idx];
                                if (!validateTransaction(tlTransaction)) continue;

                                let userCategoryId = null;
                                let predefinedCategoryId = null; // Por defecto null

                                const existingCat = tlTransaction.transaction_id ? alreadyCategorizedInDbMap.get(tlTransaction.transaction_id) : null;

                                if (existingCat) {
                                    predefinedCategoryId = existingCat.predefinedCategoryId;
                                    userCategoryId = existingCat.userCategoryId;
                                } else if (tlTransaction.transaction_type === 'CREDIT') {
                                    const incomeCat = predefinedCats.find(cat => cat.id === 'cat_income');
                                    if (incomeCat) predefinedCategoryId = incomeCat.id;
                                }
                                // Si no es CREDIT y no está en `alreadyCategorizedInDbMap`, `predefinedCategoryId` se queda en null
                                // Esto la marcará como "necesita categorización por IA" para el worker

                                const sanitizedPayee = sanitizeText(tlTransaction.description);
                                const sanitizedNotes = tlTransaction.transaction_category
                                    ? `Categoría: ${sanitizeText(tlTransaction.transaction_category)}`
                                    : undefined;
                                const amount = typeof tlTransaction.amount === 'number'
                                    ? convertAmountToMiliunits(tlTransaction.amount)
                                    : convertAmountToMiliunits(parseFloat(tlTransaction.amount));

                                const transactionValues = {
                                    amount,
                                    payee: sanitizedPayee,
                                    notes: sanitizedNotes,
                                    date: new Date(tlTransaction.timestamp),
                                    accountId: savedAccount.id,
                                    userCategoryId, // Se mantiene si ya existía
                                    predefinedCategoryId, // Se asigna si es CREDIT o ya existía, sino null
                                    externalId: tlTransaction.transaction_id || null,
                                };

                                await db.insert(transactions)
                                    .values({
                                        id: createId(),
                                        ...transactionValues
                                    })
                                    .onConflictDoUpdate({
                                        target: [transactions.accountId, transactions.amount, transactions.payee, transactions.date],
                                        set: { // Solo actualizamos ciertos campos para no sobrescribir una categoría manual o de IA ya puesta
                                            notes: sanitizedNotes,
                                            externalId: tlTransaction.transaction_id || sql`excluded.external_id`,
                                            // Si ya tenía categoría (manual o de IA), no la tocamos aquí
                                            // Si es una transacción nueva y es CREDIT, se pone 'cat_income'
                                            // Si es nueva y no es CREDIT, predefinedCategoryId será null
                                            predefinedCategoryId: sql`CASE WHEN excluded.predefined_category_id IS NOT NULL THEN excluded.predefined_category_id ELSE ${predefinedCategoryId} END`,
                                            userCategoryId: sql`excluded.user_category_id` // No tocar la userCategoryId aquí
                                        }
                                    });
                            }
                        } else {
                            // Error importante: fetch de transacciones
                            const errorText = await transactionRes.text();
                            console.error('[SYNC][ERROR] Error fetching transactions:', {
                                accountId: savedAccount.id,
                                status: transactionRes.status,
                                text: errorText,
                            });
                        }
                    }
                }
                // Contar las transacciones reales en la base de datos para esta cuenta
                if (savedAccount) {
                    const transactionCount = await db
                        .select({ count: sql<number>`cast(count(${transactions.id}) as int)` })
                        .from(transactions)
                        .where(eq(transactions.accountId, savedAccount.id))
                        .then(result => result[0]?.count || 0);
                    accountResults.push({
                        account: savedAccount,
                        balance: balances[0] || null,
                        transactions: transactionCount,
                        diagnostics: null,
                    });
                }
            } catch (accountError) {
                // Error importante: error al procesar cuenta
                console.error('[SYNC][ACCOUNT_ERROR]', account.account_id, accountError);
                // No hagas throw, sigue con las demás cuentas
            }
        }
        if (connection) {
            await db.update(bankConnections)
                .set({ lastSyncedAt: new Date() })
                .where(eq(bankConnections.id, connection.id))
                .execute();
        }
        return c.json({
            success: true,
            accounts: accountResults,
            lastSynced: new Date(),
            balanceOnly,
            syncType,
            targetAccount,
        });
    } catch (error: any) {
        if (accountResults.length > 0) {
            return c.json({
                success: true,
                accounts: accountResults,
                lastSynced: new Date(),
                balanceOnly,
                syncType,
                targetAccount,
                warning: 'Hubo errores parciales: ' + (error?.message || 'Error desconocido'),
            });
        }
        return c.json({ error: 'Error durante la sincronización', details: error?.message || 'Error desconocido' }, 500);
    }
});

app.post('/exchange-token', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    let codeFromBody;
    try {
        const body = await c.req.json();
        codeFromBody = body.code;
    } catch (e) {
        return c.json({ error: 'Invalid request body' }, 400);
    }

    if (!codeFromBody) {
        return c.json({ error: 'Code is required' }, 400);
    }

    if (typeof codeFromBody !== 'string' || codeFromBody.length > 2048) {
        return c.json({ error: 'Invalid code format' }, 400);
    }

    const userId = auth.userId;

    try {
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: config.clientId!,
                client_secret: config.clientSecret!,
                redirect_uri: config.redirectUri,
                code: codeFromBody,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[EXCHANGE_TOKEN] Error de TrueLayer API al intercambiar token:', { status: response.status, errorText });
            return c.json({ error: 'Failed to exchange token with TrueLayer', details: errorText }, response.status as any);
        }

        const tokenData = await response.json();
        console.log('[EXCHANGE_TOKEN] Token exchange successful');

        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

        let institutionIdFromProvider: string | null = null;
        let institutionNameFromProvider: string | null = null;

        // Intentar obtener información del proveedor desde el endpoint /me de TrueLayer
        // TrueLayer recomienda obtener el provider_id y display_name de esta manera.
        if (tokenData.access_token) {
            console.log('[EXCHANGE_TOKEN] Obteniendo información del proveedor desde /data/v1/me');
            try {
                const meResponse = await fetch(`${API_BASE_URL}/data/v1/me`, {
                    headers: { Authorization: `Bearer ${tokenData.access_token}` },
                });

                if (meResponse.ok) {
                    const meData = await meResponse.json();
                    if (meData.results && meData.results.length > 0) {
                        const providerDetails = meData.results[0].provider;
                        institutionIdFromProvider = providerDetails?.provider_id || null;
                        institutionNameFromProvider = providerDetails?.display_name || null;
                        console.log('[EXCHANGE_TOKEN] Detalles del proveedor obtenidos:', { institutionIdFromProvider, institutionNameFromProvider });
                    } else {
                        console.warn('[EXCHANGE_TOKEN] Respuesta de /me sin resultados o vacía:', meData);
                    }
                } else {
                    const meErrorText = await meResponse.text();
                    console.warn('[EXCHANGE_TOKEN] No se pudo obtener /me de TrueLayer:', { status: meResponse.status, meErrorText });
                }
            } catch (meError) {
                console.warn('[EXCHANGE_TOKEN] Error al llamar a /me de TrueLayer:', meError);
            }
        } else {
            console.warn('[EXCHANGE_TOKEN] No access_token in TrueLayer response, skipping /me call.');
        }

        const existingConnection = await db.query.bankConnections.findFirst({
            where: and(
                eq(bankConnections.userId, userId),
                // Si tienes institutionIdFromProvider, úsalo para verificar si la conexión específica ya existe.
                // Si no, al menos verifica que no haya otra conexión de truelayer sin institutionId.
                institutionIdFromProvider
                    ? eq(bankConnections.institutionId, institutionIdFromProvider)
                    : eq(bankConnections.provider, 'truelayer')
            ),
        });

        const connectionValues = {
            userId,
            provider: 'truelayer',
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt,
            institutionId: institutionIdFromProvider,
            institutionName: institutionNameFromProvider,
            status: 'active',
            updatedAt: new Date(),
            lastSyncedAt: null,
        };

        let newConnectionId;

        if (existingConnection) {
            console.log(`[EXCHANGE_TOKEN] Actualizando conexión bancaria existente ID: ${existingConnection.id}`);
            await db.update(bankConnections)
                .set(connectionValues)
                .where(eq(bankConnections.id, existingConnection.id));
            newConnectionId = existingConnection.id;
        } else {
            newConnectionId = createId();
            console.log(`[EXCHANGE_TOKEN] Creando nueva conexión bancaria ID: ${newConnectionId}`);
            await db.insert(bankConnections)
                .values({
                    id: newConnectionId,
                    ...connectionValues,
                    createdAt: new Date(),
                });
        }

        console.log('[EXCHANGE_TOKEN] Conexión bancaria procesada y guardada/actualizada en DB.');

        return c.json({
            message: 'Token exchanged and bank connection processed successfully.',
            access_token: tokenData.access_token, // Devuelve el access_token para la sincronización inicial
            connection_id: newConnectionId, // Devuelve el ID de la conexión para referencia futura
        });

    } catch (error) {
        console.error('[EXCHANGE_TOKEN] Error general durante el intercambio de token:', error);
        return c.json({ error: 'Internal server error during token exchange', details: error instanceof Error ? error.message : String(error) }, 500);
    }
});

export default app;