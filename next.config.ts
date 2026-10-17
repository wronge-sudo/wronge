import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // All images go through Cloudinary (or are served as-is from /public),
    // so Vercel's image optimizer quota is never used.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
