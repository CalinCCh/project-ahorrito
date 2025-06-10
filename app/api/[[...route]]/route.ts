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

// Add CORS middleware
app.use('*', cors({
  origin: getAllowedOrigins(),
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Logging middleware
app.use('*', async (c, next) => {
  console.log(`[HONO REQUEST] ${c.req.method} ${c.req.path}`,
    c.req.method === 'POST' ? 'Con body' : '');
  await next();
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