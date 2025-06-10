// Configuración específica para Clerk en diferentes entornos
export const clerkConfig = {
  development: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    allowedOrigins: ['http://localhost:3000']
  },
  production: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    allowedOrigins: [
      'https://ahorrito-fdbsf9bog-calin-constantin-chirilas-projects.vercel.app',
      'https://project-ahorrito.vercel.app'
    ]
  }
};

export const getClerkConfig = () => {
  const env = process.env.NODE_ENV;
  return env === 'production' ? clerkConfig.production : clerkConfig.development;
};
