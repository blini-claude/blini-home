import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.shporta.shop" },
      { protocol: "https", hostname: "**.tregu.shop" },
      { protocol: "https", hostname: "**.bennygroup.store" },
    ],
  },
};

export default nextConfig;
