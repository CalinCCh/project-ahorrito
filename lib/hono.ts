import { hc } from 'hono/client'

import { AppType } from "@/app/api/[[...route]]/route"

// Función para obtener la URL base dependiendo del entorno
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // En el cliente, SIEMPRE usar la URL actual del browser
    return window.location.origin;
  }
  
  // En el servidor, usar variable de entorno o fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export const client = hc<AppType>(getBaseUrl())