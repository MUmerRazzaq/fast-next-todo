import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Note: "output: standalone" is for Docker only, not needed for Vercel
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
