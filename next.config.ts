import type { NextConfig } from "next";

// GitHub Pages serves a project repo from /<repo>/, not from the domain root, so every
// absolute href ("/vendors", "/peptides") 404s without a basePath. It is set from an env
// var rather than hardcoded so local dev and a future root-domain deploy (custom domain or
// Cloudflare Pages) keep working unchanged — set BASE_PATH only in the Pages build.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true, // Pages serves /vendors/ as a directory; without this the links 404
  images: {
    unoptimized: true, // required: the default image optimizer needs a server runtime
  },
};

export default nextConfig;
