/**
 * Worker de Cloudflare para categorización con rate limiting integrado
 * Este worker actúa como proxy inteligente entre tu aplicación y la API de Gemini
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining?: number;
    reset?: number;
}

interface Env {
    GEMINI_RATELIMITER: {
        limit: (options: { key: string }) => Promise<RateLimitResult>;
    };
    MIN_BATCH_SIZE: string;
    MAX_BATCH_SIZE: string;
    BASE_INTERVAL: string;
}

// Estadísticas y métricas (persisten mientras el worker está activo)
const stats = {
    totalRequests: 0,
    rateLimitHits: 0,
    successfulCategorizations: 0,
    totalTransactionsProcessed: 0,
    lastRateLimitHit: 0,
    lastSuccess: 0,
    startTime: Date.now(),
};

const app = new Hono<{ Bindings: Env }>();

// Configurar CORS
app.use('*', cors({
    origin: '*', // En producción, restringe esto a dominios específicos
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    maxAge: 86400,
}));

// Ruta principal para ejecutar el worker de categorización
app.post('/api/categorization-worker/run', async (c) => {
    const env = c.env;
    const now = Date.now();
    stats.totalRequests++;

    // Obtener parámetros de la solicitud
    const url = new URL(c.req.url);
    const batchSizeParam = url.searchParams.get('batch_size');

    // Configuración desde variables de entorno con valores por defecto
    const minBatchSize = parseInt(env.MIN_BATCH_SIZE || '1', 10);
    const maxBatchSize = parseInt(env.MAX_BATCH_SIZE || '15', 10);

    // Procesar y validar el batch size
    let batchSize = 3; // valor por defecto
    if (batchSizeParam) {
        batchSize = parseInt(batchSizeParam, 10);
        batchSize = Math.max(minBatchSize, Math.min(maxBatchSize, batchSize));
    }

    try {
        // Verificar el rate limit usando la key 'global'
        // Puedes usar diferentes keys para diferentes tipos de categorización si es necesario
        const rateLimitResult = await env.GEMINI_RATELIMITER.limit({
            key: 'global',
        });

        // Si se ha alcanzado el rate limit, devolver error 429
        if (!rateLimitResult.success) {
            stats.rateLimitHits++;
            stats.lastRateLimitHit = now;

            // Calcular tiempo de reinicio en segundos
            const resetInSeconds = rateLimitResult.reset
                ? Math.ceil((rateLimitResult.reset - now) / 1000)
                : 30; // valor por defecto si no hay reset

            return c.json({
                error: `Error de Rate Limit con Gemini. Intenta más tarde. Espera ${resetInSeconds}s.`,
                metrics: {
                    rateLimitInfo: {
                        hits: stats.rateLimitHits,
                        lastHitAge: now - stats.lastRateLimitHit,
                        resetIn: resetInSeconds,
                        limit: rateLimitResult.limit,
                        remaining: rateLimitResult.remaining || 0
                    }
                }
            }, 429);
        }

        // Forward a tu API interna (usa localhost en desarrollo)
        // En producción, esto podría ser un servicio interno o una URL específica de producción
        const baseUrl = c.req.url.includes('localhost')
            ? 'http://localhost:3000'
            : 'https://tu-dominio-produccion.com';

        const apiResponse = await fetch(`${baseUrl}/api/internal-categorization-worker/run?batch_size=${batchSize}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Puedes añadir cabeceras de seguridad si es necesario
            },
        });

        // Procesar respuesta
        const data = await apiResponse.json();

        // Actualizar estadísticas
        if (!data.error) {
            stats.lastSuccess = now;
            stats.successfulCategorizations++;
            if (data.successfully_categorized_in_db) {
                stats.totalTransactionsProcessed += data.successfully_categorized_in_db;
            }
        }

        // Enriquecer respuesta con información del rate limit
        return c.json({
            ...data,
            rateLimit: {
                limit: rateLimitResult.limit,
                remaining: rateLimitResult.remaining,
                resetAt: rateLimitResult.reset,
            },
            workerStats: {
                totalRequests: stats.totalRequests,
                rateLimitHits: stats.rateLimitHits,
                successfulCategorizations: stats.successfulCategorizations,
                totalTransactionsProcessed: stats.totalTransactionsProcessed,
            }
        });
    } catch (error: any) {
        console.error('[WORKER][ERROR] Error in categorization worker:', error);

        return c.json({
            error: 'Error en el worker de categorización',
            details: error.message || 'Error desconocido'
        }, 500);
    }
});

// Ruta para obtener estadísticas (opcional)
app.get('/api/categorization-worker/stats', (c) => {
    return c.json({
        stats: {
            ...stats,
            uptime: Date.now() - stats.startTime,
        }
    });
});

export default app; 