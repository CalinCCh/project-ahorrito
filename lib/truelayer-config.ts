import { getEnvironmentUrls } from './environment-urls';

// Configuración dinámica para TrueLayer según el entorno
export const getTrueLayerConfig = () => {
  const urls = getEnvironmentUrls();
  
  return {
    redirectUri: urls.truelayerRedirectUri,
    apiBaseUrl: 'https://api.truelayer.com', // Siempre producción
    authUrl: 'https://auth.truelayer.com/connect/token', // Siempre producción
    authBaseUrl: 'https://auth.truelayer.com', // Para crear link tokens
    clientId: process.env.TRUELAYER_CLIENT_ID,
    clientSecret: process.env.TRUELAYER_CLIENT_SECRET,
  };
};

// Helper para validar la configuración
export const validateTrueLayerConfig = () => {
  const config = getTrueLayerConfig();
  
  const missing = [];
  if (!config.clientId) missing.push('TRUELAYER_CLIENT_ID');
  if (!config.clientSecret) missing.push('TRUELAYER_CLIENT_SECRET');
  
  if (missing.length > 0) {
    throw new Error(`Missing TrueLayer environment variables: ${missing.join(', ')}`);
  }
  
  return config;
};
