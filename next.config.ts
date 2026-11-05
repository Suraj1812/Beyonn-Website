import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The share-image route reads these brand files from disk; make sure they ship with it.
  outputFileTracingIncludes: {
    "/og": ["./public/assets/beyonn-logo.png", "./public/assets/site/beyonn-emblem.png"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: "/beyonn-protocol", destination: "/the-beyonn-system", permanent: true },
      { source: "/the-beyonn-protocol", destination: "/the-beyonn-system", permanent: true },
      { source: "/workshop", destination: "/#workshop", permanent: false },
      { source: "/workshops", destination: "/#workshop", permanent: false },
      { source: "/find-a-provider", destination: "/patients/find-a-provider", permanent: true },
      { source: "/about", destination: "/team", permanent: true },
    ];
  },
};

export default nextConfig;
