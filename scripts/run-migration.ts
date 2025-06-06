import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from '@/db/drizzle';
import path from 'path';

async function runMigrations() {
  console.log('🚀 Ejecutando migraciones...');
  
  try {
    await migrate(db, { 
      migrationsFolder: path.resolve(process.cwd(), 'drizzle') 
    });
    
    console.log('✅ Migraciones ejecutadas exitosamente');
    
    // Verificar que la tabla existe
    const result = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_subscriptions';
    `);
    
    if (result.length > 0) {
      console.log('✅ Tabla user_subscriptions creada correctamente');
    } else {
      console.log('❌ Tabla user_subscriptions no encontrada');
    }
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    throw error;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🎯 Migraciones completadas. Ahora puedes ejecutar: npm run vip:make-all');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}