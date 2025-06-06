import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from "@/db/drizzle";
import { userSubscriptions, accounts } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";

/**
 * Script para hacer VIP a todos los usuarios con cuentas creadas
 * Útil para testing y demostración del sistema VIP
 */

async function makeAllUsersVip() {
  console.log('🚀 Iniciando proceso para hacer VIP a todos los usuarios...\n');

  try {
    // 1. Obtener todos los usuarios únicos de la tabla accounts
    console.log('📋 Obteniendo usuarios únicos...');
    const users = await db
      .select({ userId: accounts.userId })
      .from(accounts)
      .groupBy(accounts.userId);

    console.log(`👥 Usuarios encontrados: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos.');
      return;
    }

    // 2. Configurar suscripción VIP (30 días)
    const now = new Date();
    const vipEndDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 días
    
    console.log('⚙️ Configuración VIP:');
    console.log(`   📅 Fecha inicio: ${now.toLocaleDateString()}`);
    console.log(`   📅 Fecha fin: ${vipEndDate.toLocaleDateString()}`);
    console.log(`   🎯 Plan: monthly`);
    console.log(`   ⏳ Duración: 30 días\n`);

    // 3. Procesar cada usuario
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`👑 Procesando usuario: ${user.userId}`);

        // Verificar si ya tiene suscripción
        const existingSubscription = await db
          .select()
          .from(userSubscriptions)
          .where(sql`${userSubscriptions.userId} = ${user.userId}`)
          .limit(1);

        if (existingSubscription.length > 0) {
          // Actualizar suscripción existente
          await db
            .update(userSubscriptions)
            .set({
              plan: 'monthly',
              status: 'active',
              currentPeriodStart: now,
              currentPeriodEnd: vipEndDate,
              cancelAtPeriodEnd: 'false',
              updatedAt: new Date(),
            })
            .where(sql`${userSubscriptions.userId} = ${user.userId}`);
          
          console.log(`   ✅ Suscripción actualizada`);
        } else {
          // Crear nueva suscripción
          await db.insert(userSubscriptions).values({
            id: createId(),
            userId: user.userId,
            stripeCustomerId: `cus_demo_${createId()}`,
            stripeSubscriptionId: `sub_demo_${createId()}`,
            stripePriceId: 'price_demo_monthly',
            plan: 'monthly',
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: vipEndDate,
            cancelAtPeriodEnd: 'false',
          });
          
          console.log(`   ✅ Nueva suscripción creada`);
        }

        successCount++;
      } catch (error) {
        console.error(`   ❌ Error al procesar usuario ${user.userId}:`, error);
        errorCount++;
      }
    }

    // 4. Resumen final
    console.log(`\n🎉 === PROCESO COMPLETADO ===`);
    console.log(`✅ Usuarios convertidos a VIP: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📊 Total procesados: ${users.length}`);
    
    if (successCount > 0) {
      console.log(`\n👑 ¡Todos los usuarios son ahora VIP por 30 días!`);
      console.log(`💡 Puedes verificar el estado VIP en la interfaz del sidebar.`);
    }

    // 5. Verificar resultados
    console.log(`\n🔍 Verificando suscripciones activas...`);
    const activeSubscriptions = await db
      .select()
      .from(userSubscriptions)
      .where(sql`${userSubscriptions.status} = 'active'`);

    console.log(`🎯 Suscripciones VIP activas: ${activeSubscriptions.length}`);
    
    // Mostrar primeras 5 suscripciones como ejemplo
    if (activeSubscriptions.length > 0) {
      console.log(`\n📋 Ejemplos de suscripciones activas:`);
      for (const sub of activeSubscriptions.slice(0, 5)) {
        const daysRemaining = Math.ceil((new Date(sub.currentPeriodEnd!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   👤 ${sub.userId.substring(0, 12)}... - ${sub.plan} - ${daysRemaining} días`);
      }
    }

  } catch (error) {
    console.error('💥 Error durante el proceso:', error);
    throw error;
  }
}

async function removeAllVipStatus() {
  console.log('🗑️ Removiendo estado VIP de todos los usuarios...\n');

  try {
    const result = await db
      .update(userSubscriptions)
      .set({
        status: 'canceled',
        updatedAt: new Date(),
      })
      .where(sql`${userSubscriptions.status} = 'active'`);

    console.log(`✅ Estado VIP removido de todos los usuarios`);
    console.log(`📊 Suscripciones canceladas: ${result.rowCount || 0}`);
  } catch (error) {
    console.error('❌ Error al remover estado VIP:', error);
    throw error;
  }
}

// Función para verificar el estado actual
async function checkVipStatus() {
  console.log('🔍 Verificando estado VIP actual...\n');

  try {
    const activeVips = await db
      .select()
      .from(userSubscriptions)
      .where(sql`${userSubscriptions.status} = 'active'`);

    console.log(`👑 Usuarios VIP activos: ${activeVips.length}`);
    
    if (activeVips.length > 0) {
      console.log(`\n📋 Lista de VIPs:`);
      for (const vip of activeVips) {
        const daysRemaining = Math.ceil((new Date(vip.currentPeriodEnd!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   👤 ${vip.userId} - Plan: ${vip.plan} - Días restantes: ${daysRemaining}`);
      }
    }
  } catch (error) {
    console.error('❌ Error al verificar estado VIP:', error);
    throw error;
  }
}

// Función principal
async function main() {
  const action = process.argv[2] || 'make-vip';
  
  switch (action) {
    case 'make-vip':
      await makeAllUsersVip();
      break;
    case 'remove-vip':
      await removeAllVipStatus();
      break;
    case 'check':
      await checkVipStatus();
      break;
    default:
      console.log(`
🛠️ Script para gestionar estado VIP masivo

Uso:
  npx tsx scripts/make-all-users-vip.ts make-vip   # Hacer VIP a todos los usuarios
  npx tsx scripts/make-all-users-vip.ts remove-vip # Quitar VIP a todos los usuarios  
  npx tsx scripts/make-all-users-vip.ts check      # Verificar estado VIP actual
      `);
      break;
  }
}

// Exportar funciones
export {
  makeAllUsersVip,
  removeAllVipStatus,
  checkVipStatus
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎯 Proceso completado exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en el proceso:', error);
      process.exit(1);
    });
}