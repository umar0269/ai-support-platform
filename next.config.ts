import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse reads test fixture files at import time via __dirname;
  // marking it as an external keeps it in Node.js module resolution
  // and prevents webpack from trying to bundle the binary test assets.
  serverExternalPackages: ["pdf-parse"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
