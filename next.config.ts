import type { NextConfig } from "next";

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  basePath,
  ...(process.env.STATIC_EXPORT === "true"
    ? { output: "export", trailingSlash: true }
    : {}),
};

export default nextConfig;
