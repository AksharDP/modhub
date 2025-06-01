import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // add https://placehold.co/
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
