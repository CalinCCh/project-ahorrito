/**
 * API interno para categorización
 * Este endpoint es llamado por el worker de Cloudflare y hace
 * el trabajo real de categorización usando la API de Gemini
 */

import { Hono } from 'hono';
import { db } from '@/db/drizzle';
import { transactions, predefinedCategories } from '@/db/schema';
import { categorizeTransactionsBatch } from '@/app/services/gemini/gemini-service';
import { sql, eq, and, isNull, asc } from 'drizzle-orm';

const app = new Hono();

const DEFAULT_BATCH_SIZE = 5;
const MAX_BATCH_SIZE = 40;

const categorizationCache = new Map<string, string>();

async function loadCategorizationCache() {
    try {
        const categorizedTransactions = await db
            .select({
                payee: transactions.payee,
                categoryId: transactions.predefinedCategoryId
            })
            .from(transactions)
            .where(
                and(
                    sql`${transactions.predefinedCategoryId} IS NOT NULL`,
                    sql`${transactions.payee} IS NOT NULL`
                )
            );

        const payeeCategoryCount = new Map<string, Map<string, number>>();

        for (const tx of categorizedTransactions) {
            if (!tx.payee || !tx.categoryId) continue;

            const payee = tx.payee.toLowerCase().trim();
            const categoryId = tx.categoryId;

            if (!payeeCategoryCount.has(payee)) {
                payeeCategoryCount.set(payee, new Map<string, number>());
            }

            const categoryCounts = payeeCategoryCount.get(payee)!;
            categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1);
        }

        // Para cada payee, tomar la categoría más frecuentemente asignada
        for (const [payee, categoryCounts] of payeeCategoryCount.entries()) {
            let maxCount = 0;
            let mostFrequentCategoryId = '';

            for (const [categoryId, count] of categoryCounts.entries()) {
                if (count > maxCount) {
                    maxCount = count;
                    mostFrequentCategoryId = categoryId;
                }
            }

            if (mostFrequentCategoryId) {
                categorizationCache.set(payee, mostFrequentCategoryId);
            }
        }

        console.log(`[CACHE] Cargada caché de categorización con ${categorizationCache.size} entradas`);
    } catch (error) {
        console.error('[CACHE] Error cargando caché de categorización:', error);
    }
}

// Cargar la caché al iniciar
loadCategorizationCache();

app.post('/run', async (c) => {
    const now = Date.now();

    // Obtener batch_size del query y aplicar límites de seguridad
    const batchSizeParam = c.req.query('batch_size');
    const batchSize = batchSizeParam ? parseInt(batchSizeParam, 10) : DEFAULT_BATCH_SIZE;
    const transactionsToFetch = Math.min(Math.max(1, batchSize), MAX_BATCH_SIZE);

    console.log(`[INTERNAL-WORKER] Buscando ${transactionsToFetch} transacciones pendientes de categorización...`);

    try {
        // Contar cuántas transacciones pendientes hay en total (para métricas)
        const [{ totalPending }] = await db
            .select({ totalPending: sql<number>`cast(count(${transactions.id}) as int)` })
            .from(transactions)
            .where(
                and(
                    isNull(transactions.predefinedCategoryId),
                    sql`${transactions.amount} < 0`
                )
            );

        // Obtener categorías predefinidas
        const predefinedCats = await db.select({ id: predefinedCategories.id, name: predefinedCategories.name }).from(predefinedCategories);
        if (!predefinedCats.length) {
            return c.json({ error: 'No hay categorías predefinidas cargadas.' }, 500);
        }

        // Mapa inverso para buscar categorías por ID
        const categoryById = new Map(predefinedCats.map(cat => [cat.id, cat.name]));

        // Buscar transacciones que son de gasto (amount < 0) y no tienen predefinedCategoryId
        const pendingTransactions = await db
            .select({
                id: transactions.id,
                payee: transactions.payee,
                amount: transactions.amount,
                date: transactions.date,
                notes: transactions.notes,
            })
            .from(transactions)
            .where(
                and(
                    isNull(transactions.predefinedCategoryId),
                    sql`${transactions.amount} < 0`
                )
            )
            .orderBy(asc(transactions.date)) // Procesar las más antiguas primero
            .limit(transactionsToFetch);

        if (!pendingTransactions.length) {
            return c.json({
                message: 'No hay transacciones pendientes de categorización.',
                found_pending: 0,
                total_pending: 0
            });
        }

        console.log(`[INTERNAL-WORKER] Encontradas ${pendingTransactions.length} transacciones para categorizar.`);

        // Separar transacciones que ya pueden ser categorizadas por caché
        const transactionsToProcess = [];
        const cachedTransactions = [];

        for (const tx of pendingTransactions) {
            if (tx.payee) {
                const payeeKey = tx.payee.toLowerCase().trim();
                if (categorizationCache.has(payeeKey)) {
                    cachedTransactions.push({
                        transaction: tx,
                        categoryId: categorizationCache.get(payeeKey)!
                    });
                } else {
                    transactionsToProcess.push(tx);
                }
            } else {
                // Si no tiene payee, añadir a las que hay que procesar
                transactionsToProcess.push(tx);
            }
        }

        console.log(`[INTERNAL-WORKER] ${cachedTransactions.length} transacciones encontradas en caché, ${transactionsToProcess.length} necesitan categorización.`);

        let categorizedCount = 0;

        // Aplicar categorías de la caché inmediatamente
        if (cachedTransactions.length > 0) {
            for (const { transaction, categoryId } of cachedTransactions) {
                try {
                    await db.update(transactions)
                        .set({ predefinedCategoryId: categoryId })
                        .where(eq(transactions.id, transaction.id));

                    categorizedCount++;
                    const categoryName = categoryById.get(categoryId) || 'desconocida';
                    console.log(`[INTERNAL-WORKER] Categorización desde caché: "${transaction.payee}" → "${categoryName}"`);
                } catch (err) {
                    console.error(`[INTERNAL-WORKER] Error aplicando categoría desde caché para tx ${transaction.id}:`, err);
                }
            }
        }

        // Si hay transacciones que necesitan categorización con LLM
        if (transactionsToProcess.length > 0) {
            const inputsForGemini = transactionsToProcess.map(tx => ({
                payee: tx.payee,
                amount: tx.amount,
                date: tx.date?.toISOString(),
                description: tx.notes || undefined,
            }));

            // Filtrar "Income" de la lista de categorías para Gemini
            const categoriasParaGemini = predefinedCats
                .filter(cat => cat.name.toLowerCase() !== "income")
                .map(cat => cat.name);

            console.log(`[INTERNAL-WORKER] Usando las siguientes categorías para Gemini: ${categoriasParaGemini.join(", ")}`);

            // Llamar a Gemini para categorización
            const categorizedResults = await categorizeTransactionsBatch(inputsForGemini, categoriasParaGemini);

            if (categorizedResults && categorizedResults.length > 0) {
                console.log(`[INTERNAL-WORKER] Gemini devolvió ${categorizedResults.length} categorizaciones.`);

                for (const result of categorizedResults) {
                    const originalTransaction = transactionsToProcess[result.index];
                    if (originalTransaction) {
                        // Verificar nuevamente que no haya asignado "Income" (sólo por seguridad)
                        if (result.category.toLowerCase() === "income") {
                            console.warn(`[INTERNAL-WORKER] Gemini asignó "Income" a pesar de la restricción para tx: ${originalTransaction.id}`);
                            // Buscar otra categoría para usar como alternativa
                            const fallbackCategory = predefinedCats.find(cat => cat.name.toLowerCase() !== "income") || predefinedCats[0];
                            await db.update(transactions)
                                .set({ predefinedCategoryId: fallbackCategory.id })
                                .where(eq(transactions.id, originalTransaction.id));
                            categorizedCount++;

                            if (originalTransaction.payee) {
                                const payeeKey = originalTransaction.payee.toLowerCase().trim();
                                categorizationCache.set(payeeKey, fallbackCategory.id);
                            }

                            console.log(`[INTERNAL-WORKER] Sobreescrita categoría "Income" con "${fallbackCategory.name}" para tx: ${originalTransaction.id}`);
                            continue;
                        }

                        const foundCategory = predefinedCats.find(cat => cat.name.toLowerCase() === result.category.toLowerCase());
                        if (foundCategory) {
                            await db.update(transactions)
                                .set({ predefinedCategoryId: foundCategory.id })
                                .where(eq(transactions.id, originalTransaction.id));
                            categorizedCount++;

                            // Agregar a la caché si tiene payee
                            if (originalTransaction.payee) {
                                const payeeKey = originalTransaction.payee.toLowerCase().trim();
                                categorizationCache.set(payeeKey, foundCategory.id);
                                console.log(`[CACHE] Añadida nueva entrada: "${originalTransaction.payee}" → "${foundCategory.name}"`);
                            }
                        } else {
                            // Si no encontramos la categoría (incluyendo "Other"), usamos la primera disponible como fallback
                            console.warn(`[INTERNAL-WORKER] Categoría "${result.category}" no encontrada. Usando categoría fallback para tx: ${originalTransaction.id}`);

                            if (predefinedCats.length > 0) {
                                // Usar la primera categoría disponible como fallback (puedes ajustar esto a tu preferencia)
                                const fallbackCategory = predefinedCats[0];
                                await db.update(transactions)
                                    .set({ predefinedCategoryId: fallbackCategory.id })
                                    .where(eq(transactions.id, originalTransaction.id));
                                categorizedCount++;

                                // Agregar a la caché si tiene payee
                                if (originalTransaction.payee) {
                                    const payeeKey = originalTransaction.payee.toLowerCase().trim();
                                    categorizationCache.set(payeeKey, fallbackCategory.id);
                                    console.log(`[CACHE] Añadida nueva entrada fallback: "${originalTransaction.payee}" → "${fallbackCategory.name}"`);
                                }

                                console.log(`[INTERNAL-WORKER] Asignada categoría fallback "${fallbackCategory.name}" a tx: ${originalTransaction.id}`);
                            } else {
                                console.error(`[INTERNAL-WORKER] No hay categorías predefinidas disponibles para usar como fallback.`);
                            }
                        }
                    }
                }
            }
        }

        return c.json({
            message: 'Worker interno de categorización ejecutado.',
            found_pending: pendingTransactions.length,
            cached_transactions: cachedTransactions.length,
            llm_processed: transactionsToProcess.length,
            total_pending: totalPending,
            attempted_categorization_for: pendingTransactions.length,
            successfully_categorized_in_db: categorizedCount,
            cache_size: categorizationCache.size
        });

    } catch (error: any) {
        console.error('[INTERNAL-WORKER][ERROR] Error en worker interno:', error);

        // Devolver error para que el worker de Cloudflare lo maneje
        return c.json({
            error: 'Error en el worker interno de categorización.',
            details: error.message || 'Error desconocido'
        }, 500);
    }
});

export default app; 