import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['react-markdown', '@tanstack/react-query', '@trpc/react-query'],
  },
  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Split chunks for better caching
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          trpc: {
            test: /[\\/]node_modules[\\/]@trpc[\\/]/,
            name: 'trpc',
            priority: 15,
            chunks: 'all',
          },
          reactQuery: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
            name: 'react-query',
            priority: 15,
            chunks: 'all',
          },
          markdown: {
            test: /[\\/]node_modules[\\/]react-markdown[\\/]/,
            name: 'markdown',
            priority: 15,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },

  // Image optimizations
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
    unoptimized: true,
    // Enable modern image formats
    // formats: ['image/webp', 'image/avif'],
    // Add image optimization
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,
  
  // Redirects configuration
  redirects: async () => [
    {
      source: '/admin',
      destination: '/admin/overview',
      permanent: false, // Use temporary redirect to avoid caching issues
    },
  ],
  
  // Performance headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        }
      ]
    }
  ],
};

export default nextConfig;
