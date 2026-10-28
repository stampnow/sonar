import type { NextConfig } from "next";
import dns from "node:dns";

// Fix for Node.js IPv6 ETIMEDOUT bug with Next.js fetch()
dns.setDefaultResultOrder("ipv4first");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
