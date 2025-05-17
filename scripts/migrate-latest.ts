import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const main = async () => {
    try {
        console.log("Applying latest migration manually...");

        // Aplicamos directamente la migración más reciente
        await sql`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "external_id" text`;
        console.log("Added external_id column");

        await sql`CREATE UNIQUE INDEX IF NOT EXISTS "external_id_idx" ON "transactions" USING btree ("external_id")`;
        console.log("Created external_id index");

        console.log("Migration completed successfully");
    } catch (error) {
        console.error("Error during manual migration:", error);
        process.exit(1);
    }
};

main(); 