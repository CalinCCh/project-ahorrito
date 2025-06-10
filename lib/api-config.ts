// Configuración simplificada de URLs para evitar problemas de SSR
export const getApiUrl = () => {
  // Siempre devolver la URL de producción actual
  return 'https://ahorrito-p04sg1y0e-calin-constantin-chirilas-projects.vercel.app';
};

export const getBaseUrl = () => {
  return getApiUrl();
};

// Lista simplificada de orígenes permitidos para CORS
export const getAllowedOrigins = () => [
  'http://localhost:3000',
  'https://ahorrito-p04sg1y0e-calin-constantin-chirilas-projects.vercel.app',
  'https://ahorrito-lki9s4pj7-calin-constantin-chirilas-projects.vercel.app',
  'https://ahorrito-fdbsf9bog-calin-constantin-chirilas-projects.vercel.app',
  /https:\/\/ahorrito-.*\.vercel\.app$/
];
