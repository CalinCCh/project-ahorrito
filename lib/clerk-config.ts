// Configuración específica para Clerk en diferentes entornos
export const clerkConfig = {
    development: {
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        allowedOrigins: ['http://localhost:3000']
    },
    production: {
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        allowedOrigins: [
            'https://project-ahorrito.com',
            'https://www.project-ahorrito.com'
        ]
    }
};

export const getClerkConfig = () => {
    const env = process.env.NODE_ENV;
    return env === 'production' ? clerkConfig.production : clerkConfig.development;
};
