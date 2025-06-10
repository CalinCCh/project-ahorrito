import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Optimizar la conexión para mejor rendimiento
const sql = neon(process.env.DATABASE_URL!, {
  fetchConnectionCache: true,
});

export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

