import type { NextConfig } from "next";

const r2Hostname = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: r2Hostname ? [{ protocol: "https", hostname: r2Hostname }] : [],
  },
};

export default nextConfig;
