import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy /api/* → backend on localhost:5000/api/*
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
