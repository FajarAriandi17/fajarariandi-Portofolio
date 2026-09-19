import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Exposes Wrangler bindings (assets, R2, …) to `next dev` so local
// development matches the Workers runtime. No-op in every other command,
// so it is safe to call at import time.
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Sanity image CDN — content images pulled from the CMS
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // three.js ships untranspiled ESM in places; keep the build quiet and fast.
  transpilePackages: ["three"],
  experimental: {
    optimizePackageImports: ["@react-three/drei", "motion", "gsap"],
  },
};

export default nextConfig;
