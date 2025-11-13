/** @type {import('next').NextConfig} */

// Use an env var for production backend host (resolved at build time).
// For local dev this file also includes localhost/127.0.0.1 patterns.
const backendHost =
  process.env.BACKEND_HOST ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, "") ||
  "tech-resolute-backend-production.up.railway.app";

const nextConfig = {
  images: {
    remotePatterns: [
      // local dev (http)
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

      // production backend (https) - allow any path from the backend host
      { protocol: "https", hostname: backendHost, pathname: "/**" },

      // common S3 host (may need to add region-specific hosts if you use them)
      { protocol: "https", hostname: "s3.amazonaws.com", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;
