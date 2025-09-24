import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy backend API during development to avoid CORS and HTML fallback issues
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/api/:path*`
          : 'http://localhost:5000/api/:path*'
      }
    ];
  }
};

export default nextConfig;
