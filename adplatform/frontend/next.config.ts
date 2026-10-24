import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      { source: '/login', destination: '/auth/login' },
      { source: '/register', destination: '/auth/register' },
    ];
  },
};

export default nextConfig;
