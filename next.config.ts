import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Leaflet SSR is handled by dynamic import with ssr:false — no webpack config needed.
  // Empty turbopack config silences the Turbopack/webpack mismatch warning.
  turbopack: {},
};

export default nextConfig;
