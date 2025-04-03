// next.config.js
const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
  });
  
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    ignoreBuildErrors: true,
    images: {
      domains: ['mt0.google.com'],
    },
  };
  
  module.exports = withPWA(nextConfig);