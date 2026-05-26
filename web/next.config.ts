import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};

    Object.assign(config.resolve.alias, {
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    });

    return config;
  },
};

export default nextConfig;
