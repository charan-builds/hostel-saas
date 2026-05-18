import path from "node:path";

import type { NextConfig } from "next";

import { getSecurityHeaders } from "./lib/security/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        // Static route headers cover normal App Router, API, and public asset
        // responses. Proxy-generated redirects/errors apply the same set again
        // from `lib/security/security-headers.ts`.
        headers: getSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
