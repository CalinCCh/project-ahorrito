import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

async function main() {
  console.log("🔄 Starting subscription system migration...");
  
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("✅ Subscription system migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("❌ Migration script failed:", error);
  process.exit(1);
});