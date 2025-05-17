// Worker de categorización en segundo plano - Versión optimizada avanzada con Cloudflare
// Este script ejecuta el worker de categorización de forma adaptativa
// Usa una estrategia inteligente para maximizar el throughput sin exceder el rate limit
// Versión adaptada para trabajar con el rate limiter de Cloudflare Workers

// Si estás usando Node.js 18+, fetch está disponible globalmente
// Si usas una versión anterior, instala node-fetch con: npm install node-fetch
let fetchModule;
try {
  fetchModule = fetch;
} catch {
  fetchModule = require("node-fetch");
}

// Configuración adaptativa avanzada
let config = {
  baseIntervalMs: 5000, // Intervalo base entre ejecuciones (5s)
  minIntervalMs: 2000, // Intervalo mínimo (2s)
  maxIntervalMs: 30000, // Intervalo máximo en caso de problemas (30s)
  currentIntervalMs: 5000, // Intervalo actual (comienza con base)

  minBatchSize: 1, // Tamaño mínimo de batch
  maxBatchSize: 30, // Aumentado de 15 a 30 para mayor throughput
  currentBatchSize: 5, // Tamaño inicial del lote aumentado para mejor arranque

  batchIncrementStep: 3, // Aumentado de 2 a 3 para escalar más rápido
  batchDecrementStep: 1, // Cuánto reducir el batch después de errores

  successThreshold: 2, // Éxitos consecutivos para aumentar batch
  errorThreshold: 1, // Errores para reducir batch

  backoffFactor: 1.5, // Factor para aumentar tiempo de espera exponencialmente
  recoveryFactor: 0.75, // Ligeramente más agresivo (0.8 → 0.75) para recuperarse más rápido

  // Configuración para Cloudflare Worker
  useCloudflare: false, // Cambiado a false para pruebas iniciales
  cloudflareEndpoint:
    "https://ahorrito-categorization-worker.your-account.workers.dev/api/categorization-worker/run",
  // Para desarrollo local usa:
  // cloudflareEndpoint: "http://localhost:8787/api/categorization-worker/run",
  // o si has configurado un túnel con Cloudflare:
  // cloudflareEndpoint: "https://tu-dominio-de-desarrollo.trycloudflare.com/api/categorization-worker/run",
  localEndpoint: "http://localhost:3000/api/internal-categorization-worker/run", // Actualizado a la nueva ruta
};

// Estadísticas y contadores
let stats = {
  consecutiveSuccesses: 0, // Contador de éxitos consecutivos
  consecutiveErrors: 0, // Contador de errores consecutivos
  totalProcessed: 0, // Total de transacciones procesadas
  totalErrors: 0, // Total de errores
  startTime: Date.now(), // Para calcular estadísticas
  lastRateLimit: 0, // Timestamp del último rate limit
  lastRunStatus: null, // Resultado de la última ejecución
  totalRuns: 0, // Número total de ejecuciones
  rateLimitHits: 0, // Veces que se ha alcanzado rate limit
  movingAvgTxPerMinute: 0, // Promedio móvil de tx/minuto
  pendingTransactions: 0, // Estimación de transacciones pendientes
  bestThroughput: 0, // Mejor rendimiento logrado (tx/min)
  bestConfig: null, // Configuración que dio mejor rendimiento
  lastCloudflareRateLimit: {
    limit: 0, // Límite configurado
    remaining: 0, // Llamadas restantes en el período
    resetAt: 0, // Timestamp de reinicio del contador
  },
};

// Función para recopilar y mostrar métricas de rendimiento
function logPerformanceMetrics() {
  const runTimeMinutes = (Date.now() - stats.startTime) / 60000;
  const currentThroughput = stats.totalProcessed / runTimeMinutes;

  // Actualizar mejor rendimiento si es superior
  if (currentThroughput > stats.bestThroughput && stats.totalProcessed > 10) {
    stats.bestThroughput = currentThroughput;
    stats.bestConfig = {
      batchSize: config.currentBatchSize,
      intervalMs: config.currentIntervalMs,
    };
  }

  console.log(
    `\n[${new Date().toLocaleTimeString()}] 📊 ESTADÍSTICAS DE RENDIMIENTO:`
  );
  console.log(`   Transacciones categorizadas: ${stats.totalProcessed}`);
  console.log(`   Tiempo ejecutándose: ${runTimeMinutes.toFixed(1)} minutos`);
  console.log(
    `   Throughput actual: ${currentThroughput.toFixed(2)} tx/minuto`
  );
  console.log(
    `   Mejor throughput: ${stats.bestThroughput.toFixed(2)} tx/minuto`
  );
  if (stats.bestConfig) {
    console.log(
      `   Mejor configuración: batch=${stats.bestConfig.batchSize}, intervalo=${stats.bestConfig.intervalMs}ms`
    );
  }
  console.log(
    `   Errores totales: ${stats.totalErrors} (${(
      (stats.totalErrors / stats.totalRuns) *
      100
    ).toFixed(1)}%)`
  );
  console.log(`   Rate limits encontrados: ${stats.rateLimitHits}`);
  console.log(
    `   Configuración actual: batch=${config.currentBatchSize}, intervalo=${config.currentIntervalMs}ms`
  );
  console.log(
    `   Transacciones pendientes estimadas: ${stats.pendingTransactions}\n`
  );

  // Información de Cloudflare si está disponible
  if (config.useCloudflare && stats.lastCloudflareRateLimit.limit > 0) {
    const resetInSeconds = Math.max(
      0,
      (stats.lastCloudflareRateLimit.resetAt - Date.now()) / 1000
    );
    console.log(
      `   Cloudflare Rate Limit: ${stats.lastCloudflareRateLimit.remaining}/${stats.lastCloudflareRateLimit.limit} restantes`
    );
    console.log(`   Reinicio del límite en: ${resetInSeconds.toFixed(0)}s\n`);
  }
}

// Función para ajustar parámetros de optimización basados en resultados
function adjustParameters(
  success,
  processed,
  pendingCount,
  rateLimitHit,
  retryAfterMs,
  cloudflareRateLimit
) {
  stats.totalRuns++;

  // Actualizar información de rate limit de Cloudflare si está disponible
  if (cloudflareRateLimit) {
    stats.lastCloudflareRateLimit = cloudflareRateLimit;

    // Si estamos cerca del límite (menos del 20% disponible), reducimos el ritmo
    if (cloudflareRateLimit.remaining < cloudflareRateLimit.limit * 0.2) {
      config.currentIntervalMs = Math.min(
        config.maxIntervalMs,
        config.currentIntervalMs * 1.2
      );
      console.log(
        `[${new Date().toLocaleTimeString()}] ⚠️ Acercándonos al rate limit de Cloudflare, ralentizando a ${
          config.currentIntervalMs
        }ms`
      );
    }
  }

  // Actualizar información de transacciones pendientes
  if (pendingCount !== undefined) {
    stats.pendingTransactions = pendingCount;
  }

  if (success) {
    stats.consecutiveSuccesses++;
    stats.consecutiveErrors = 0;

    // Estrategia de recuperación gradual después de errores
    if (config.currentIntervalMs > config.baseIntervalMs) {
      config.currentIntervalMs = Math.max(
        config.minIntervalMs,
        Math.floor(config.currentIntervalMs * config.recoveryFactor)
      );
      console.log(
        `[${new Date().toLocaleTimeString()}] ⏱️ Reduciendo intervalo a ${
          config.currentIntervalMs
        }ms`
      );
    }

    // Aumentar tamaño del batch si tenemos varios éxitos consecutivos
    if (
      stats.consecutiveSuccesses >= config.successThreshold &&
      config.currentBatchSize < config.maxBatchSize
    ) {
      // Si hay muchas transacciones pendientes, incrementar más agresivamente
      const increment =
        pendingCount > 20
          ? config.batchIncrementStep * 2
          : config.batchIncrementStep;
      config.currentBatchSize = Math.min(
        config.maxBatchSize,
        config.currentBatchSize + increment
      );
      console.log(
        `[${new Date().toLocaleTimeString()}] 🚀 Rendimiento bueno, aumentando batch a ${
          config.currentBatchSize
        }`
      );
      stats.consecutiveSuccesses = 0; // Reiniciar contador
    }
  } else {
    stats.consecutiveErrors++;
    stats.consecutiveSuccesses = 0;
    stats.totalErrors++;

    // Manejo específico de rate limits
    if (rateLimitHit) {
      stats.rateLimitHits++;
      stats.lastRateLimit = Date.now();

      // Reducir batch size más agresivamente en rate limits
      config.currentBatchSize = Math.max(
        config.minBatchSize,
        config.currentBatchSize - config.batchDecrementStep * 2
      );

      // Aumentar intervalo con backoff exponencial
      if (retryAfterMs) {
        // Si el API nos dice cuánto esperar, respetamos eso + margen
        config.currentIntervalMs = retryAfterMs + 1000;
      } else {
        // De lo contrario aplicamos backoff exponencial
        config.currentIntervalMs = Math.min(
          config.maxIntervalMs,
          Math.floor(config.currentIntervalMs * config.backoffFactor)
        );
      }

      console.log(
        `[${new Date().toLocaleTimeString()}] 🛑 Rate limit alcanzado, nuevo batch=${
          config.currentBatchSize
        }, intervalo=${config.currentIntervalMs}ms`
      );
    }
    // Otros tipos de error, estrategia más moderada
    else if (stats.consecutiveErrors >= config.errorThreshold) {
      config.currentBatchSize = Math.max(
        config.minBatchSize,
        config.currentBatchSize - config.batchDecrementStep
      );
      console.log(
        `[${new Date().toLocaleTimeString()}] ⚠️ Error detectado, reduciendo batch a ${
          config.currentBatchSize
        }`
      );
    }
  }

  // Cada 10 ejecuciones o 20 transacciones procesadas, mostrar métricas
  if (stats.totalRuns % 10 === 0 || stats.totalProcessed % 20 === 0) {
    logPerformanceMetrics();
  }

  return {
    batchSize: config.currentBatchSize,
    intervalMs: config.currentIntervalMs,
  };
}

async function runWorker() {
  try {
    console.log(
      `[${new Date().toLocaleTimeString()}] Ejecutando worker (batch=${
        config.currentBatchSize
      })...`
    );

    // Determinar qué endpoint usar (Cloudflare protegido o directo)
    const endpoint = config.useCloudflare
      ? config.cloudflareEndpoint
      : config.localEndpoint;

    // Enviar tamaño del lote actual como parámetro
    const res = await fetchModule(
      `${endpoint}?batch_size=${config.currentBatchSize}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await res.json();

    // Extraer información de rate limit de Cloudflare si está disponible
    let cloudflareRateLimit = null;
    if (data.rateLimit) {
      cloudflareRateLimit = {
        limit: data.rateLimit.limit || 0,
        remaining: data.rateLimit.remaining || 0,
        resetAt: data.rateLimit.resetAt || 0,
      };
    }

    // Manejar resultados y errores
    if (data.error) {
      console.log(`[${new Date().toLocaleTimeString()}] Error: ${data.error}`);

      let retryAfterMs;
      let isRateLimit = data.error.includes("Rate Limit");

      // Extraer tiempo de retry si es un rate limit
      if (isRateLimit) {
        // Buscar en diferentes formatos posibles según la fuente del error
        const retryMatch =
          data.error.match(/Espera (\d+)s/) ||
          data.error.match(/Wait (\d+)s/) ||
          (data.metrics?.rateLimitInfo?.resetIn
            ? [`dummy`, data.metrics.rateLimitInfo.resetIn]
            : null);

        const retrySeconds = retryMatch ? parseInt(retryMatch[1], 10) : 30;
        retryAfterMs = retrySeconds * 1000;

        console.log(
          `[${new Date().toLocaleTimeString()}] 🛑 Rate limit detectado, esperando ${retrySeconds}s...`
        );
      }

      // Ajustar parámetros según el resultado
      const { intervalMs } = adjustParameters(
        false,
        0,
        data.found_pending || 0,
        isRateLimit,
        retryAfterMs,
        cloudflareRateLimit
      );

      // Si es rate limit, usar el tiempo recomendado o el calculado, el que sea mayor
      const nextIntervalMs = isRateLimit
        ? Math.max(retryAfterMs || 0, intervalMs)
        : intervalMs;

      console.log(
        `[${new Date().toLocaleTimeString()}] Próxima ejecución en ${(
          nextIntervalMs / 1000
        ).toFixed(1)}s...`
      );

      setTimeout(runWorker, nextIntervalMs);
      return;
    } else {
      // Éxito: actualizar contadores y ajustar estrategia
      const processed = data.successfully_categorized_in_db || 0;
      const pending = data.found_pending || data.total_pending || 0;

      stats.totalProcessed += processed;
      stats.lastRunStatus = "success";

      // Mostrar resultados detallados
      console.log(
        `[${new Date().toLocaleTimeString()}] Resultado:`,
        pending > 0
          ? `Encontradas ${pending} pendientes, procesadas ${processed} (${stats.totalProcessed} total)`
          : "No hay transacciones pendientes"
      );

      // Mostrar información de rate limit si viene de Cloudflare
      if (cloudflareRateLimit) {
        console.log(
          `[${new Date().toLocaleTimeString()}] Rate limit: ${
            cloudflareRateLimit.remaining
          }/${cloudflareRateLimit.limit} llamadas restantes`
        );
      }

      // Ajustar parámetros según el resultado
      const { intervalMs } = adjustParameters(
        true,
        processed,
        pending,
        false,
        null,
        cloudflareRateLimit
      );

      // Si no hay pendientes, esperar más tiempo para no saturar el sistema
      const nextIntervalMs =
        pending === 0
          ? Math.max(intervalMs, config.baseIntervalMs * 2)
          : intervalMs;

      console.log(
        `[${new Date().toLocaleTimeString()}] Próxima ejecución en ${(
          nextIntervalMs / 1000
        ).toFixed(1)}s...`
      );

      setTimeout(runWorker, nextIntervalMs);
    }
  } catch (err) {
    console.error(
      `[${new Date().toLocaleTimeString()}] Error en la petición:`,
      err.message
    );

    stats.consecutiveErrors++;
    stats.totalErrors++;
    stats.lastRunStatus = "error";

    // Backoff en caso de error de conexión
    config.currentIntervalMs = Math.min(
      config.maxIntervalMs,
      Math.floor(config.currentIntervalMs * 1.2)
    );

    console.log(
      `[${new Date().toLocaleTimeString()}] Error de conexión, esperando ${(
        config.currentIntervalMs / 1000
      ).toFixed(1)}s...`
    );

    setTimeout(runWorker, config.currentIntervalMs);
  }
}

// Mensaje inicial
console.log("===================================================");
console.log("🚀 Iniciando worker de categorización con CLOUDFLARE");
console.log("🛡️ Protección de rate limit avanzada con Cloudflare Workers");
console.log("📊 Estrategia adaptativa avanzada con métricas");
console.log("⚙️ Ajuste dinámico de intervalos y tamaños de lote");
console.log("📈 Maximización de throughput respetando rate limits");
console.log(
  `🔄 Usando endpoint: ${
    config.useCloudflare ? "Cloudflare (protegido)" : "Directo (sin protección)"
  }`
);
console.log("🛑 Presiona Ctrl+C para detener");
console.log("===================================================");

// Iniciar el proceso
runWorker();
