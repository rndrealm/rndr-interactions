import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Allow @ts-ignore. R3F's `extend()` adds intrinsic elements TypeScript
      // can't see, so the suppressions sit on lines that error only sometimes —
      // exactly where @ts-expect-error would itself become an error.
      "@typescript-eslint/ban-ts-comment": "off",
      // Allow `any`. Shader material and GLTF refs have no useful static type.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
