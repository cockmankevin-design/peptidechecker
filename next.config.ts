import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // required: the default image optimizer needs a server runtime
  },
};

export default nextConfig;
