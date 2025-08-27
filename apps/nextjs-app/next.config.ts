import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blog.ghatakbits.in",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
        port: "",
        pathname: "/avatar/**",
      },
      {
        protocol: "https",
        hostname: "ucarecdn.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  webpack: (config, { dev, isServer: _isServer }) => {
    if (!dev) {
      config.cache = {
        type: "filesystem",
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    if (config.resolve && config.resolve.alias) {
      delete config.resolve.alias[
        "next/dist/compiled/@ampproject/toolbox-optimizer"
      ];
      delete config.resolve.alias["next/dist/compiled/edge-runtime"];
    }
    return config;
  },
};

export default nextConfig;
