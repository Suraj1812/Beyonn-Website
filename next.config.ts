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
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/assets/:path*", destination: "/api/media/assets/assets/:path*" },
        { source: "/icon.png", destination: "/api/media/assets/icon.png" },
        { source: "/apple-icon.png", destination: "/api/media/assets/apple-icon.png" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  turbopack: {
    rules: {
      // Keep CSS Modules on Next's native compiler: the loader's `as` rename
      // would otherwise remove their scoped class exports.
      "*.css": {
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/control/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/beyonn-protocol",
        destination: "/the-beyonn-system",
        permanent: true,
      },
      {
        source: "/the-beyonn-protocol",
        destination: "/the-beyonn-system",
        permanent: true,
      },
      { source: "/workshops", destination: "/workshop", permanent: false },
      {
        source: "/find-a-provider",
        destination: "/patients/find-a-provider",
        permanent: true,
      },
      { source: "/about", destination: "/team", permanent: true },
    ];
  },
};

export default nextConfig;
