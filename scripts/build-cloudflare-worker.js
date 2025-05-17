/**
 * Script para compilar el worker de Cloudflare de TypeScript a JavaScript
 * Usado para desplegar el worker en Cloudflare
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Rutas
const sourceFile = path.join(
  __dirname,
  "..",
  "app",
  "workers",
  "categorization.worker.ts"
);
const outputDir = path.join(__dirname, "..", "app", "workers");
const outputFile = path.join(outputDir, "categorization.worker.js");

console.log("📦 Compilando Worker de Cloudflare...");

try {
  // Comprobar que el archivo fuente existe
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Error: Archivo fuente no encontrado: ${sourceFile}`);
    process.exit(1);
  }

  // Compilar TypeScript a JavaScript usando esbuild
  console.log("🛠️  Ejecutando esbuild...");
  execSync(
    `npx esbuild ${sourceFile} --bundle --platform=browser --target=es2020 --outfile=${outputFile}`,
    { stdio: "inherit" }
  );

  console.log(`✅ Worker compilado exitosamente: ${outputFile}`);
  console.log("");
  console.log("Para desplegar el worker, ejecuta:");
  console.log("npx wrangler deploy");
} catch (error) {
  console.error(`❌ Error durante la compilación: ${error.message}`);
  process.exit(1);
}
