import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readFileSync } from "fs";
import { join } from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function migrate() {
  try {
    console.log("🚀 Ejecutando migración de metas de ahorro...");

    // Crear tablas una por una
    console.log("📋 Creando tabla savings_goals...");
    await sql`CREATE TABLE IF NOT EXISTS "savings_goals" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "name" text NOT NULL,
      "description" text,
      "target_amount" integer NOT NULL,
      "current_amount" integer DEFAULT 0 NOT NULL,
      "currency" text DEFAULT 'MXN' NOT NULL,
      "category" text NOT NULL,
      "emoji" text DEFAULT '🎯',
      "color" text DEFAULT 'blue',
      "priority" text DEFAULT 'medium' NOT NULL,
      "target_date" timestamp,
      "monthly_contribution" integer DEFAULT 0,
      "auto_save" text DEFAULT 'manual',
      "status" text DEFAULT 'active' NOT NULL,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp DEFAULT now(),
      "completed_at" timestamp
    )`;

    console.log("📋 Creando tabla savings_contributions...");
    await sql`CREATE TABLE IF NOT EXISTS "savings_contributions" (
      "id" text PRIMARY KEY NOT NULL,
      "goal_id" text NOT NULL,
      "amount" integer NOT NULL,
      "currency" text DEFAULT 'MXN' NOT NULL,
      "type" text DEFAULT 'manual' NOT NULL,
      "source" text,
      "notes" text,
      "created_at" timestamp DEFAULT now(),
      "transaction_id" text
    )`;

    console.log("📋 Creando tabla savings_milestones...");
    await sql`CREATE TABLE IF NOT EXISTS "savings_milestones" (
      "id" text PRIMARY KEY NOT NULL,
      "goal_id" text NOT NULL,
      "name" text NOT NULL,
      "description" text,
      "percentage" integer NOT NULL,
      "target_amount" integer NOT NULL,
      "is_completed" text DEFAULT 'false' NOT NULL,
      "completed_at" timestamp,
      "reward_message" text,
      "emoji" text DEFAULT '🏆',
      "created_at" timestamp DEFAULT now()
    )`; console.log("🔗 Agregando constraints...");
    try {
      await sql`ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_goal_id_savings_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."savings_goals"("id") ON DELETE cascade ON UPDATE no action`;
    } catch (e: any) {
      if (e.code !== "42710") throw e; // 42710 = constraint already exists
    }

    try {
      await sql`ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action`;
    } catch (e: any) {
      if (e.code !== "42710") throw e;
    }

    try {
      await sql`ALTER TABLE "savings_milestones" ADD CONSTRAINT "savings_milestones_goal_id_savings_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."savings_goals"("id") ON DELETE cascade ON UPDATE no action`;
    } catch (e: any) {
      if (e.code !== "42710") throw e;
    }

    console.log("✅ Migración de metas de ahorro completada exitosamente");
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    process.exit(1);
  }
}

migrate();
