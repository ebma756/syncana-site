import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow phone testing against the dev server via LAN IP.
  allowedDevOrigins: ["http://localhost:3001", "http://172.30.144.152:3001"],
};

export default nextConfig;
