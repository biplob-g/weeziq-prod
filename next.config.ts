import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client"],

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
