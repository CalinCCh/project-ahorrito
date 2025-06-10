// Configuración simplificada de URLs para evitar problemas de SSR
export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // En el cliente, usar siempre la URL actual
    return window.location.origin;
  }
  // En el servidor, usar variable de entorno o localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export const getBaseUrl = () => {
  return getApiUrl();
};

// Lista simplificada de orígenes permitidos para CORS - INCLUIR TODOS LOS DEPLOYMENTS
export const getAllowedOrigins = () => [
  'http://localhost:3000',
  'https://ahorrito-e1gopprcr-calin-constantin-chirilas-projects.vercel.app', // NUEVA URL
  'https://ahorrito-p04sg1y0e-calin-constantin-chirilas-projects.vercel.app',
  'https://ahorrito-lki9s4pj7-calin-constantin-chirilas-projects.vercel.app',
  'https://ahorrito-fdbsf9bog-calin-constantin-chirilas-projects.vercel.app',
  /https:\/\/ahorrito-.*\.vercel\.app$/
];
