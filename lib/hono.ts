import { hc } from 'hono/client'

import { AppType } from "@/app/api/[[...route]]/route"

// Función para obtener la URL base dependiendo del entorno
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // En el cliente, usar la URL actual
    return window.location.origin;
  }
  
  // En el servidor, usar variable de entorno o URL de producción
  return process.env.NEXT_PUBLIC_API_URL || 
         'https://ahorrito-p04sg1y0e-calin-constantin-chirilas-projects.vercel.app';
};

export const client = hc<AppType>(getBaseUrl())