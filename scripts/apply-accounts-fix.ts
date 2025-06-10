import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

const main = async () => {
  try {
    console.log("Aplicando fix para accounts unique constraint...");
    
    // Primero intentar eliminar el constraint existente
    try {
      await sql`ALTER TABLE "accounts" DROP CONSTRAINT "accounts_plaid_id_unique"`;
      console.log("✅ Constraint accounts_plaid_id_unique eliminado");
    } catch (error: any) {
      if (error.code === "42704") {
        console.log("ℹ️  Constraint accounts_plaid_id_unique no existe, continuando...");
      } else {
        console.log("⚠️  Error eliminando constraint:", error.message);
      }
    }
    
    // Crear el nuevo índice único
    try {
      await sql`CREATE UNIQUE INDEX "user_plaid_id_unique" ON "accounts" USING btree ("user_id","plaid_id")`;
      console.log("✅ Nuevo índice user_plaid_id_unique creado");
    } catch (error: any) {
      if (error.code === "42P07") {
        console.log("ℹ️  Índice user_plaid_id_unique ya existe");
      } else {
        throw error;
      }
    }
    
    console.log("🎉 Fix aplicado correctamente");
  } catch (error) {
    console.error("❌ Error durante el fix:", error);
    process.exit(1);
  }
};

main();