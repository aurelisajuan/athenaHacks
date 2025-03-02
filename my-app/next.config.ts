import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  ignoreBuildErrors: true,
  images: {
    domains: ["mt0.google.com"],
  },
};

export default nextConfig;
