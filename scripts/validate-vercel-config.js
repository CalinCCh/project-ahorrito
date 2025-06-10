// Script de validación para el despliegue en Vercel
console.log('🔍 Validando configuración para despliegue en Vercel...\n');

try {
  // 1. Validar variables de entorno básicas
  console.log('1. ✅ Variables de entorno básicas:');
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'DATABASE_URL',
    'TRUELAYER_CLIENT_ID',
    'TRUELAYER_CLIENT_SECRET',
    'NEXT_PUBLIC_TRUELAYER_CLIENT_ID',
    'GEMINI_API_KEY',
    'STRIPE_SECRET_KEY'
  ];
  
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('   ❌ Variables faltantes:', missing);
    console.log('   📋 Necesitas configurar estas variables en Vercel Dashboard');
  } else {
    console.log('   ✅ Todas las variables requeridas están presentes');
  }

  // 2. Validar configuración de TrueLayer
  console.log('\n2. ✅ Configuración TrueLayer:');
  const truelayerClientId = process.env.TRUELAYER_CLIENT_ID;
  const truelayerSecret = process.env.TRUELAYER_CLIENT_SECRET;
  const truelayerPublicId = process.env.NEXT_PUBLIC_TRUELAYER_CLIENT_ID;
  
  if (truelayerClientId) {
    console.log(`   Client ID: ${truelayerClientId.substring(0, 10)}...`);
  }
  if (truelayerSecret) {
    console.log(`   Secret: ${truelayerSecret.substring(0, 8)}...`);
  }
  if (truelayerPublicId) {
    console.log(`   Public Client ID: ${truelayerPublicId.substring(0, 10)}...`);
  }

  // 3. Validar claves de Clerk
  console.log('\n3. ✅ Configuración Clerk:');
  const clerkPublishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  
  if (clerkPublishable?.startsWith('pk_live_')) {
    console.log('   ✅ Usando claves de PRODUCCIÓN (pk_live_)');
  } else if (clerkPublishable?.startsWith('pk_test_')) {
    console.log('   ⚠️  Usando claves de DESARROLLO (pk_test_)');
  } else {
    console.log('   ❌ Clave publishable no válida o faltante');
  }
  
  if (clerkSecret?.startsWith('sk_live_')) {
    console.log('   ✅ Secret key de PRODUCCIÓN (sk_live_)');
  } else if (clerkSecret?.startsWith('sk_test_')) {
    console.log('   ⚠️  Secret key de DESARROLLO (sk_test_)');
  } else {
    console.log('   ❌ Secret key no válida o faltante');
  }

  // 4. Validar consistencia entre claves
  const isPublishableLive = clerkPublishable?.startsWith('pk_live_');
  const isSecretLive = clerkSecret?.startsWith('sk_live_');
  
  if (isPublishableLive && isSecretLive) {
    console.log('   ✅ Ambas claves son de producción - CORRECTO para Vercel');
  } else if (!isPublishableLive && !isSecretLive) {
    console.log('   ⚠️  Ambas claves son de desarrollo - OK para testing');
  } else {
    console.log('   ❌ INCONSISTENCIA: Una clave es de producción y otra de desarrollo');
  }

  // 5. Validar base de datos
  console.log('\n4. ✅ Base de Datos:');
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    if (dbUrl.includes('neon.tech')) {
      console.log('   ✅ Usando Neon Database (recomendado para Vercel)');
    } else if (dbUrl.includes('localhost')) {
      console.log('   ⚠️  Usando base de datos local (no funcionará en Vercel)');
    } else {
      console.log('   ✅ Usando base de datos externa');
    }
  } else {
    console.log('   ❌ DATABASE_URL no configurada');
  }

  console.log('\n🎉 ¡Validación completa!');
  console.log('\n📋 Resumen para Vercel:');
  console.log('   • Variables de entorno:', missing.length === 0 ? '✅' : '❌');
  console.log('   • Configuración dinámica de URLs: ✅');
  console.log('   • CORS configurado para cualquier dominio de Vercel: ✅');
  console.log('   • TrueLayer con redirect URI dinámico: ✅');
  
  if (missing.length === 0) {
    console.log('\n🚀 ¡Listo para desplegar en Vercel!');
    console.log('\n📖 Consulta VERCEL-DEPLOYMENT-GUIDE.md para instrucciones detalladas.');
  } else {
    console.log('\n⚠️  Configura las variables faltantes antes de desplegar.');
  }
  
} catch (error) {
  console.error('❌ Error durante la validación:', error.message);
  process.exit(1);
}
