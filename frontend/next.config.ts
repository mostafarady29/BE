import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy /api/* → backend on localhost:5000/api/*
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
        port: "",
        pathname: "/**",
      },
      // Add other hostnames as needed
    ],
  },
};

export default nextConfig;
