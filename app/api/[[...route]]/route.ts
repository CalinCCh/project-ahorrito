import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { getAllowedOrigins } from '@/lib/api-config';

import categories from './categories'
import accounts from './accounts'
import transactions from './transactions';
import summary from './summary';
import predefinedCategoriesRoutes from "./predefined-categories";
import geminiRoutes from "./gemini";
import truelayerRoutes from "./truelayer";
import userStatsRoutes from "./user-stats";
import internalCategorizationWorkerRoutes from "./internal-categorization-worker";
import stripeRoutes from "./stripe";
import aiAssistantRoutes from "./ai-assistant";
import savingsGoalsRoutes from "./savings-goals";
import savingsContributionsRoutes from "./savings-contributions";
import achievementsRoutes from "./achievements";
import subscriptionsRoutes from "./subscriptions";
import adminRoutes from "./admin";
import userLevelsRoutes from "./user-levels";

// Cambiar a nodejs runtime para mejor compatibilidad con DB
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const app = new Hono().basePath('/api')

// Add CORS middleware simplificado para producción
app.use('*', cors({
  origin: (origin, c) => {
    // Permitir requests sin origen (como Postman, mobile apps, etc.)
    if (!origin) return '*';
    
    // Permitir todos los orígenes en producción temporalmente para debug
    console.log(`[CORS] Permitiendo origen: ${origin}`);
    return origin;
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-custom-header'],
  credentials: true
}))

// Logging middleware
app.use('*', async (c, next) => {
  console.log(`[HONO REQUEST] ${c.req.method} ${c.req.path}`,
    c.req.method === 'POST' ? 'Con body' : '');
  try {
    await next();
  } catch (error) {
    console.error('[HONO ERROR]', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// Test endpoint para verificar que la API funciona
app.get('/test', (c) => {
  return c.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    path: c.req.path
  });
});

const routes = app
  .route("/accounts", accounts)
  .route("/categories", categories)
  .route("/transactions", transactions)
  .route("/summary", summary)
  .route("/predefined-categories", predefinedCategoriesRoutes)
  .route("/gemini", geminiRoutes)
  .route("/truelayer", truelayerRoutes)
  .route("/user-stats", userStatsRoutes)
  .route("/internal-categorization-worker", internalCategorizationWorkerRoutes)
  .route("/stripe", stripeRoutes)
  .route("/ai-assistant", aiAssistantRoutes)
  .route("/savings-goals", savingsGoalsRoutes)
  .route("/savings-contributions", savingsContributionsRoutes)
  .route("/achievements", achievementsRoutes)
  .route("/subscriptions", subscriptionsRoutes)
  .route("/admin", adminRoutes)
  .route("/user-levels", userLevelsRoutes);

console.log('[HONO CONFIG] Rutas configuradas:', Object.keys(routes));

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
export const OPTIONS = handle(app)


export type AppType = typeof routes