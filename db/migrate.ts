import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('La variable de entorno DATABASE_URL no está definida');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
    try {
        console.log('Iniciando migración...');
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log('Migración completada con éxito');
        process.exit(0);
    } catch (error) {
        console.error('Error al ejecutar la migración:', error);
        process.exit(1);
    }
}

main(); 