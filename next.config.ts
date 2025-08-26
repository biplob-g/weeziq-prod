import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  devIndicators: false,

  // Disable TypeScript checking during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // Disable ESLint during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ucarecdn.com" },
      { protocol: "https", hostname: "blog.ghatakbits.in" },
      { protocol: "https", hostname: "secure.gravatar.com" },
    ],
    unoptimized: true, // Required for Cloudflare
  },

  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = {
        type: "filesystem",
        cacheDirectory: path.resolve(".next/cache"),
        compression: "gzip",
        maxAge: 172800000, // 2 days

        // ✅ restrict buildDependencies to project files only
        buildDependencies: {
          config: [path.resolve(__dirname, "next.config.ts")],
          // include only your package.json instead of scanning user folders
          defaultWebpack: ["webpack/lib/"],
        },
      };
    }

    return config;
  },
};

export default nextConfig;
