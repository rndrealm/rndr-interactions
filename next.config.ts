import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// Next infers the workspace root by walking up for a lockfile, and there's a
// stray package-lock.json in the home directory — so it was selecting /Users/…
// as the root and warning about it on every dev start. Pinning it here silences
// the warning and stops Turbopack watching the whole home folder.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
    rules: {
      "*.glsl": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.vert": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.frag": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.vs": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.fs": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader", "glslify-loader"],
    });
    return config;
  },
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

export default nextConfig;
