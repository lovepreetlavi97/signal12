import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow your phone's IP for development resources
  experimental: {
    allowedDevOrigins: ['192.168.1.112', 'localhost:3000'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:4000/socket.io/:path*',
      },
    ];
  },
};

export default nextConfig;
