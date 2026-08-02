import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  fixedExtension: false,
  dts: true,
  clean: true,
  // One output file per module, so each component keeps its own "use client". Bundling merged
  // them and dropped the directives, which crashes any hook-using component imported from a
  // Next.js server component — invisible until a consumer hits it, so the build asserts it.
  unbundle: true,
  external: ["react", "react-dom"],
});
