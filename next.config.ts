import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  output: 'standalone',
};

export default nextConfig;
