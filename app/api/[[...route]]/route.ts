import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import categories from './categories'
import accounts from './accounts'
import transactions from './transactions';
import summary from './summary';
import predefinedCategoriesRoutes from "./predefined-categories";
import geminiRoutes from "./gemini";
import truelayerRoutes from "./truelayer";
import userStatsRoutes from "./user-stats";
import internalCategorizationWorkerRoutes from "./internal-categorization-worker";

export const runtime = 'edge'

const app = new Hono().basePath('/api')

console.log('[HONO CONFIG] Configurando rutas de API...');

const routes = app
  .route("/accounts", accounts)
  .route("/categories", categories)
  .route("/transactions", transactions)
  .route("/summary", summary)
  .route("/predefined-categories", predefinedCategoriesRoutes)
  .route("/gemini", geminiRoutes)
  .route("/truelayer", truelayerRoutes)
  .route("/user-stats", userStatsRoutes)
  .route("/internal-categorization-worker", internalCategorizationWorkerRoutes);

console.log('[HONO CONFIG] Rutas configuradas:', Object.keys(routes));

app.use('*', async (c, next) => {
  console.log(`[HONO REQUEST] ${c.req.method} ${c.req.path}`,
    c.req.method === 'POST' ? 'Con body' : '');
  await next();
});

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)


export type AppType = typeof routes