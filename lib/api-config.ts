import { getEnvironmentUrls } from './environment-urls';

// Configuración simplificada de URLs para evitar problemas de SSR
export const getApiUrl = () => {
  return getEnvironmentUrls().apiUrl;
};

export const getBaseUrl = () => {
  return getEnvironmentUrls().baseUrl;
};

// Configuración dinámica de orígenes permitidos para CORS
export const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3000',
    'https://localhost:3001'
  ];
  
  // Agregar el origen actual si estamos en el navegador
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    if (!origins.includes(currentOrigin)) {
      origins.push(currentOrigin);
    }
  }
  
  // Agregar patrones para Vercel
  return [
    ...origins,
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*-.*\.vercel\.app$/,
    /^https:\/\/.*\.vercel\.com$/
  ];
};
