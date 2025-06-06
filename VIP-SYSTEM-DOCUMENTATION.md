# 🏆 Sistema VIP - Documentación Completa

## 📋 Resumen

El sistema VIP de Ahorrito permite a los usuarios obtener acceso premium mediante suscripciones pagadas a través de Stripe. Cuando un usuario paga una suscripción, automáticamente se convierte en VIP con beneficios exclusivos.

## 🏗️ Arquitectura del Sistema

### 1. Base de Datos

**Tabla: `userSubscriptions`** ([`db/schema.ts`](db/schema.ts:290))
```sql
- id: string (PK)
- userId: string (UNIQUE)
- stripeCustomerId: string
- stripeSubscriptionId: string (UNIQUE)  
- stripePriceId: string
- plan: "weekly" | "monthly" | "annual"
- status: "active" | "inactive" | "canceled" | "past_due"
- currentPeriodStart: timestamp
- currentPeriodEnd: timestamp
- cancelAtPeriodEnd: boolean
- createdAt: timestamp
- updatedAt: timestamp
```

### 2. Flujo de Pago

#### Paso 1: Checkout
- Usuario selecciona plan en `/pricing`
- Se crea sesión de Stripe Checkout ([`stripe.ts:21`](app/api/[[...route]]/stripe.ts:21))
- Redirección a Stripe para pago

#### Paso 2: Webhook de Stripe
- Stripe envía evento `checkout.session.completed` ([`stripe.ts:78`](app/api/[[...route]]/stripe.ts:78))
- Sistema procesa el pago y crea/actualiza suscripción
- Usuario se convierte automáticamente en VIP

#### Paso 3: Verificación VIP
- Hook [`useSubscription`](features/subscriptions/hooks/use-subscription.tsx:21) verifica estado
- UI se actualiza mostrando badges VIP

## 🔧 Componentes Principales

### 1. Backend APIs

**Stripe Webhook** ([`app/api/[[...route]]/stripe.ts`](app/api/[[...route]]/stripe.ts))
- ✅ Procesa pagos exitosos
- ✅ Detecta tipo de plan (semanal/mensual/anual)
- ✅ Crea/actualiza suscripciones en DB
- ✅ Maneja actualizaciones y cancelaciones
- ✅ Logging para debugging

**Subscriptions API** ([`app/api/[[...route]]/subscriptions.ts`](app/api/[[...route]]/subscriptions.ts))
- ✅ Obtiene suscripción actual del usuario
- ✅ CRUD de suscripciones

### 2. Frontend Components

**Hook VIP** ([`features/subscriptions/hooks/use-subscription.tsx`](features/subscriptions/hooks/use-subscription.tsx))
```tsx
const { isVip, daysRemaining, subscription } = useSubscription();
```
- ✅ Detecta si usuario es VIP
- ✅ Calcula días restantes
- ✅ Cache con React Query

**VIP Badge** ([`components/ui/vip-badge.tsx`](components/ui/vip-badge.tsx))
```tsx
<VipBadge size="md" showDays daysRemaining={30} />
```
- ✅ Componente reutilizable
- ✅ Animaciones con Framer Motion
- ✅ Múltiples tamaños

**Sidebar VIP Status** ([`components/layout/Sidebar.tsx:264`](components/layout/Sidebar.tsx:264))
- ✅ Muestra estado VIP activo
- ✅ Botón upgrade para no-VIP
- ✅ Información de días restantes

**Página Pro** ([`app/pro/page.tsx`](app/pro/page.tsx))
- ✅ Confirmación post-pago
- ✅ Detalles de suscripción
- ✅ Lista de beneficios VIP

## 📅 Planes de Suscripción

**Configuración** ([`lib/stripe-plans.ts`](lib/stripe-plans.ts))

| Plan | Precio | Duración | Price ID |
|------|--------|----------|----------|
| Pro Weekly | $1.99/week | 7 días | `NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY` |
| Pro Monthly | $5.99/month | 30 días | `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` |
| Pro Annual | $49.99/year | 365 días | `NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL` |

## 🎯 Detección VIP

**Lógica de Verificación:**
```typescript
const isVip = subscription?.status === "active" && 
              new Date() < new Date(subscription.currentPeriodEnd);
```

**Criterios para ser VIP:**
1. ✅ Tener suscripción activa (`status: "active"`)
2. ✅ Estar dentro del período de suscripción
3. ✅ No haber cancelado (o cancelación no efectiva aún)

## 🔍 Testing y Debugging

### Script de Pruebas
**Archivo:** [`scripts/test-vip-system.ts`](scripts/test-vip-system.ts)

```bash
# Ejecutar pruebas del sistema VIP
npx tsx scripts/test-vip-system.ts
```

**Funcionalidades del script:**
- ✅ Crear suscripción VIP de prueba
- ✅ Verificar estado VIP
- ✅ Cancelar suscripción
- ✅ Logging detallado

### Logs de Webhook
El sistema registra todos los eventos importantes:
```
✅ Checkout session completed: { sessionId, customerId, userId, priceId }
🎯 Creating VIP subscription: { userId, planType, subscriptionId, periods }
✅ VIP subscription created/updated successfully
```

## 🛠️ Variables de Entorno Requeridas

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL=price_...

# App URLs
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 🚀 Cómo Usar el Sistema

### Para Desarrolladores

1. **Configurar Stripe:**
   - Crear productos y precios en Stripe Dashboard
   - Configurar webhook endpoint: `/api/stripe/webhook`
   - Añadir variables de entorno

2. **Probar localmente:**
   ```bash
   # Usar Stripe CLI para webhooks locales
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   
   # Ejecutar pruebas
   npx tsx scripts/test-vip-system.ts
   ```

3. **Verificar funcionamiento:**
   - Usuario paga → Webhook ejecuta → DB actualizada → UI muestra VIP

### Para Usuarios

1. **Obtener VIP:**
   - Ir a `/pricing`
   - Seleccionar plan
   - Completar pago en Stripe
   - Redirección a `/pro?success=true`

2. **Beneficios VIP:**
   - Badge VIP en sidebar
   - Acceso a funciones premium
   - Soporte prioritario
   - Análisis avanzados con IA

## 🔧 Mantenimiento

### Monitorear Suscripciones
```sql
-- Ver todas las suscripciones activas
SELECT userId, plan, status, currentPeriodEnd 
FROM user_subscriptions 
WHERE status = 'active';

-- Ver suscripciones que expiran pronto
SELECT userId, plan, currentPeriodEnd,
       EXTRACT(DAYS FROM currentPeriodEnd - NOW()) as days_remaining
FROM user_subscriptions 
WHERE status = 'active' 
  AND currentPeriodEnd < NOW() + INTERVAL '7 days';
```

### Troubleshooting

**Problema:** Usuario pagó pero no es VIP
1. Verificar logs de webhook en consola
2. Verificar que `STRIPE_WEBHOOK_SECRET` esté configurado
3. Comprobar que el evento llegó a `/api/stripe/webhook`
4. Verificar que el `userId` esté en metadata de Stripe

**Problema:** Badge VIP no aparece
1. Verificar que `useSubscription` hook esté funcionando
2. Comprobar query de React Query en DevTools
3. Verificar endpoint `/api/subscriptions/current`

## ✅ Estado Actual

### ✅ Completado
- [x] Estructura de base de datos
- [x] Webhook de Stripe funcional
- [x] Detección automática de tipo de plan
- [x] Hook de React para estado VIP
- [x] Componentes UI (badge, sidebar)
- [x] Página de confirmación
- [x] Sistema de logging
- [x] Script de pruebas
- [x] Documentación completa

### 🔄 Mejoras Futuras
- [ ] Notificaciones por email
- [ ] Dashboard de admin para gestionar VIPs
- [ ] Métricas de conversión
- [ ] Descuentos y cupones
- [ ] Renovación automática con recordatorios

---

## 🎉 ¡Sistema VIP Completo y Funcional!

El sistema está **100% operativo**. Cuando un usuario realiza un pago exitoso a través de Stripe:

1. 💳 **Pago procesado** → Stripe envía webhook
2. 🔄 **Webhook ejecuta** → Suscripción creada en DB  
3. 👑 **Usuario es VIP** → UI actualizada automáticamente
4. ✨ **Beneficios activos** → Acceso a funciones premium

**¿Necesitas ayuda?** Usa el script de pruebas o revisa los logs de webhook para debugging.