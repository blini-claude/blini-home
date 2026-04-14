import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "shporta.shop" },
      { protocol: "https", hostname: "**.shporta.shop" },
      { protocol: "https", hostname: "tregu.shop" },
      { protocol: "https", hostname: "**.tregu.shop" },
      { protocol: "https", hostname: "bennygroup.store" },
      { protocol: "https", hostname: "**.bennygroup.store" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
