// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // allow direct storage paths
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },

      // also allow the /api/storage/** path in case any URL still contains /api/storage
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/api/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/storage/**',
      },
    ],
  },
};

module.exports = nextConfig;
