// Configuración de URLs para diferentes entornos
export const getApiUrl = () => {
  // En desarrollo
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // En producción, usar la URL actual de Vercel o la variable de entorno
  return process.env.NEXT_PUBLIC_API_URL || 
         'https://ahorrito-lki9s4pj7-calin-constantin-chirilas-projects.vercel.app';
};

export const getBaseUrl = () => {
  return getApiUrl();
};

// Lista de todos los dominios permitidos para CORS
export const getAllowedOrigins = () => [
  'http://localhost:3000',
  'https://ahorrito-lki9s4pj7-calin-constantin-chirilas-projects.vercel.app',
  'https://ahorrito-fdbsf9bog-calin-constantin-chirilas-projects.vercel.app', 
  'https://project-ahorrito.vercel.app',
  // Patrón wildcard para cualquier deployment de Vercel
  /https:\/\/ahorrito-.*\.vercel\.app$/
];
