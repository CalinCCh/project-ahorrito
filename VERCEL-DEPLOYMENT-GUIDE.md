# 🚀 Guía de Despliegue en Vercel - Project Ahorrito

## 📋 Variables de Entorno Requeridas en Vercel

Configura estas variables en tu Dashboard de Vercel → Settings → Environment Variables:

### 🔐 Clerk Authentication (PRODUCCIÓN)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[TU_CLAVE_CLERK_PUBLISHABLE]
CLERK_SECRET_KEY=sk_live_[TU_CLAVE_CLERK_SECRET]
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/
```

### 🗄️ Base de Datos
```bash
DATABASE_URL=postgresql://[TU_DATABASE_URL]
```

### 🏦 TrueLayer (Configuración Dinámica)
```bash
TRUELAYER_CLIENT_ID=[TU_TRUELAYER_CLIENT_ID]
TRUELAYER_CLIENT_SECRET=[TU_TRUELAYER_CLIENT_SECRET]
NEXT_PUBLIC_TRUELAYER_CLIENT_ID=[TU_TRUELAYER_CLIENT_ID]
```

### 🤖 APIs Externas
```bash
GEMINI_API_KEY=[TU_GEMINI_API_KEY]
SUPABASE_MCP_TOKEN=[TU_SUPABASE_TOKEN]
```

### 💳 Stripe
```bash
STRIPE_SECRET_KEY=sk_test_[TU_STRIPE_SECRET_KEY]
NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY=price_[TU_PRICE_ID_WEEKLY]
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_[TU_PRICE_ID_MONTHLY]
NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL=price_[TU_PRICE_ID_ANNUAL]
```

### 🔧 Otras
```bash
NEON_API_KEY=napi_[TU_NEON_API_KEY]
```

## ✅ Variables NO Necesarias (Se Auto-Detectan)

**NO configurar estas variables** - se generan automáticamente:
- `NEXT_PUBLIC_API_URL` 
- `NEXT_PUBLIC_BASE_URL`
- `TRUELAYER_REDIRECT_URI`
- `NEXT_PUBLIC_TRUELAYER_REDIRECT_URI`

## 🎯 Características Implementadas

### 🔄 URLs Dinámicas
- ✅ Auto-detección del dominio actual (`window.location.origin`)
- ✅ Soporte para `VERCEL_URL` en builds
- ✅ Fallbacks inteligentes para desarrollo y producción

### 🌐 CORS Inteligente
- ✅ Acepta cualquier dominio `*.vercel.app` automáticamente
- ✅ Soporte para localhost en desarrollo
- ✅ Sin hardcodeo de URLs específicas

### 🏦 TrueLayer Flexible
- ✅ Redirect URI se genera dinámicamente
- ✅ Compatible con cualquier dominio de Vercel
- ✅ Configuración centralizada en `lib/truelayer-config.ts`

### 🔐 Clerk Producción
- ✅ Claves `pk_live_` y `sk_live_` configuradas
- ✅ Compatible con dominios dinámicos
- ✅ Rutas de autenticación relativas

## 🚀 Pasos para Desplegar

1. **Configurar Variables**: Agregar todas las variables listadas arriba en Vercel
2. **Asignar a Production**: Configurar cada variable para el entorno "Production"
3. **Desplegar**: Push a tu rama principal
4. **Verificar**: Usar `npm run validate-vercel` localmente para validar

## 🛠️ Validación Local

```bash
# Validar configuración antes del despliegue
npm run validate-vercel
```

## 📁 Archivos Modificados

### Configuración Dinámica
- `lib/environment-urls.ts` - Detección automática de URLs
- `lib/truelayer-config.ts` - Configuración TrueLayer centralizada
- `lib/api-config.ts` - CORS y APIs dinámicas

### APIs Actualizadas
- `app/api/[[...route]]/route.ts` - CORS mejorado
- `app/api/[[...route]]/truelayer.ts` - Configuración dinámica
- `app/api/[[...route]]/accounts.ts` - URLs dinámicas

### Frontend
- `features/accounts/components/new-account-sheet.tsx` - Redirect URI dinámico

### Despliegue
- `vercel.json` - Configuración optimizada
- `next.config.ts` - Build configuration
- `.env.local` - Variables actualizadas

## 🎉 Resultado

Tu aplicación funcionará en **cualquier URL de Vercel** sin necesidad de:
- ❌ Hardcodear dominios específicos
- ❌ Actualizar configuración manualmente
- ❌ Cambiar variables de entorno por cada despliegue

## 🔧 Troubleshooting

### Si TrueLayer falla:
1. Verificar que `TRUELAYER_CLIENT_ID` esté configurado en Vercel
2. Revisar logs de TrueLayer en dashboard
3. Confirmar que tu aplicación TrueLayer permite tu dominio de Vercel

### Si Clerk falla:
1. Confirmar que estás usando claves `pk_live_` y `sk_live_`
2. Agregar tu dominio de Vercel en Clerk Dashboard → Domains
3. Verificar que las rutas de callback están configuradas

### Si las APIs fallan:
1. Revisar logs en Vercel Functions
2. Confirmar que `DATABASE_URL` es accesible desde Vercel
3. Verificar que todas las variables estén en "Production"
