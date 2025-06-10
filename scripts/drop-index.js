// Script para eliminar los índices únicos que causan conflicto
const { Pool } = require("pg");

async function main() {
  // Conexión a la base de datos
  const pool = new Pool({
    connectionString:
      "postgresql://neondb_owner:npg_ZD5e3OwBjzEg@ep-cold-brook-a27kc23j-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
  });

  try {
    // Ejecutar la migración para eliminar los índices
    console.log("Eliminando índice user_plaid_id_unique...");
    await pool.query("DROP INDEX IF EXISTS user_plaid_id_unique;");

    console.log("Eliminando restricción accounts_plaid_id_unique...");
    await pool.query(
      "ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_plaid_id_unique;"
    );

    console.log("Eliminando índice external_id_idx...");
    await pool.query("DROP INDEX IF EXISTS external_id_idx;");

    console.log("Índices eliminados con éxito");
  } catch (error) {
    console.error("Error al eliminar los índices:", error);
  } finally {
    // Cerrar la conexión
    await pool.end();
  }
}

main().catch(console.error);
