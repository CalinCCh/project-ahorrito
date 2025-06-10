// Utilidad para generar URLs dinámicamente según el entorno
export const getEnvironmentUrls = () => {
  const isClient = typeof window !== 'undefined';
  const isDev = process.env.NODE_ENV === 'development';
  
  // Detectar URL base automáticamente
  let baseUrl: string;
  
  if (isClient) {
    // En el cliente, usar la URL actual
    baseUrl = window.location.origin;
  } else if (process.env.VERCEL_URL) {
    // En Vercel durante build/SSR
    baseUrl = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NEXT_PUBLIC_BASE_URL) {
    // URL configurada manualmente
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  } else {
    // Fallback para desarrollo
    baseUrl = isDev ? 'http://localhost:3000' : 'https://localhost:3000';
  }
  
  return {
    baseUrl,
    apiUrl: baseUrl,
    truelayerRedirectUri: `${baseUrl}/truelayer-callback`,
    clerkDomain: baseUrl
  };
};

// Hook para usar en componentes React
export const useEnvironmentUrls = () => {
  return getEnvironmentUrls();
};
