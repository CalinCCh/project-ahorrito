import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  
  // Experimental optimizations
  experimental: {
    missingSuspenseWithCSRBailout: false,
    optimizePackageImports: [
      "@clerk/nextjs",
      "lucide-react",
      "recharts",
      "framer-motion"
    ],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  
  // Bundle optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Optimize chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          clerk: {
            test: /[\\/]node_modules[\\/]@clerk[\\/]/,
            name: "clerk",
            chunks: "all",
            priority: 10,
          },
        },
      },
    };
    
    return config;
  },
  
  output: 'standalone'
};

export default nextConfig;
