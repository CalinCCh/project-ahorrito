# Sistema de Categorización Automática con Gemini LLM y Cloudflare Workers

Este sistema proporciona una solución completa para categorizar automáticamente transacciones financieras utilizando la API de Gemini LLM con protección de rate limit mediante Cloudflare Workers.

## Arquitectura del Sistema

El sistema consta de tres componentes principales:

1. **Worker Node.js** (scripts/categorize-worker.js)

   - Script que corre en segundo plano
   - Gestiona el ritmo de procesamiento de transacciones
   - Se adapta dinámicamente al rate limit

2. **Cloudflare Worker** (app/workers/categorization.worker.ts)

   - Actúa como proxy entre tu aplicación y la API de Gemini
   - Implementa rate limiting nativo de Cloudflare
   - Proporciona métricas de uso y estado del rate limit

3. **Endpoint Interno** (app/api/[[...route]]/internal-categorization-worker.ts)
   - Realiza la categorización real usando Gemini LLM
   - Accede a la base de datos para procesar las transacciones
   - Solo es llamado a través del Cloudflare Worker

## Diagrama de Flujo

```
Node.js Worker (categorize-worker.js)
        |
        ↓
Cloudflare Worker (rate limiting)
        |
        ↓
Endpoint Interno
        |
        ↓
Gemini API
```

## Configuración y Uso

### 1. Configuración de Cloudflare Workers

1. Instala Wrangler CLI:

   ```
   npm install -g wrangler
   ```

2. Autentica con Cloudflare:

   ```
   wrangler login
   ```

3. Ajusta el archivo `wrangler.toml` con tus parámetros de rate limit.

4. Despliega el worker:
   ```
   wrangler deploy
   ```

### 2. Configuración del Worker Node.js

Edita `scripts/categorize-worker.js` para:

- Modificar la URL del endpoint de Cloudflare Worker
- Ajustar parámetros de batch y intervalos según tus necesidades
- Habilitar/deshabilitar el uso de Cloudflare con `useCloudflare: true/false`

### 3. Ejecución

Ejecuta el worker en segundo plano con:

```
node scripts/categorize-worker.js
```

O para mantenerlo funcionando en producción:

```
pm2 start scripts/categorize-worker.js --name "categorization"
```

## Cómo Funciona

1. **Arranque del Proceso**:

   - El worker Node.js inicia y comienza a llamar al endpoint protegido por Cloudflare
   - Comienza con un batch pequeño (3 transacciones) y un intervalo base (5s)

2. **Protección de Rate Limit**:

   - Cloudflare Worker verifica el rate limit antes de cada petición
   - Si el rate limit no se ha alcanzado, reenvía la petición al endpoint interno
   - Si se ha alcanzado, devuelve un error 429 con tiempo de espera recomendado

3. **Optimización Dinámica**:

   - El worker Node.js ajusta automáticamente:
     - Tamaño de batch (cuántas transacciones por llamada)
     - Intervalo entre llamadas (cuánto esperar entre peticiones)
   - Se basa en:
     - Éxito/fracaso de las llamadas anteriores
     - Información de rate limit de Cloudflare
     - Número de transacciones pendientes

4. **Métricas y Monitorización**:
   - El worker muestra estadísticas de rendimiento regularmente
   - Puedes ver en tiempo real el throughput (tx/minuto)
   - Información de rate limit y estimación de transacciones pendientes

## Ventajas

- **Protección Completa**: Nunca alcanzarás el rate limit de Gemini
- **Optimización Automática**: Máximo throughput sin errores
- **Escalabilidad**: La solución se adapta a cambios en el volumen de transacciones
- **Resiliencia**: Manejo automático de errores y reintentos
- **Monitorización**: Métricas detalladas de rendimiento

## Requisitos

- Cuenta en Cloudflare (plan gratuito es suficiente)
- API Key de Gemini configurada en variables de entorno
- Node.js v14 o superior

## Limitaciones

- El plan gratuito de Cloudflare Workers tiene límites de:
  - 100,000 peticiones/día
  - 10ms de CPU por invocación
  - Limitaciones en regiones y características avanzadas

Si tus necesidades superan estos límites, considera actualizar a un plan de pago.
