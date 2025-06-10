// Este archivo contiene configuraciones de rendimiento para la página de transactions
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config

// Indica a Next.js que este segmento de ruta debe generarse dinámicamente en tiempo de ejecución
export const dynamic = 'force-dynamic';

// Establece la duración máxima de caché para datos revalidados
export const revalidate = 60; // Revalidar datos cada 60 segundos 