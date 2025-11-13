// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // dev/local storage paths
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },

      // /api/storage fallbacks
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/api/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/api/storage/**",
      },

      // production backend on Railway
      {
        protocol: "https",
        hostname: "tech-resolute-backend-production.up.railway.app",
        pathname: "/**",
      },
      {protocol: "https",
      hostname: "s3.amazonaws.com",
      pathname: "/**"
      },

    ],
  },
};

module.exports = nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
// const devRemotePatterns = [
//   { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/storage/**' },
//   { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/storage/**' },
//   { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/api/storage/**' },
//   { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/api/storage/**' },
// ];

// const prodRemotePatterns = [];
// if (process.env.NODE_ENV === 'production') {
//   const backendHost = process.env.BACKEND_HOST || 'tech-resolute-backend-production.up.railway.app';
//   prodRemotePatterns.push({
//     protocol: 'https',
//     hostname: backendHost,
//     pathname: '/**', // or narrow to '/storage/**' if you can
//   });
// }

// const nextConfig = {
//   images: {
//     remotePatterns: [...devRemotePatterns, ...prodRemotePatterns],
//   },
// };

// module.exports = nextConfig;
