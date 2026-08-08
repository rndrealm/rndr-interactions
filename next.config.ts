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
  },
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

export default nextConfig;
