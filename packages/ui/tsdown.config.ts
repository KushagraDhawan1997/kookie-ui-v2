import { defineConfig } from "tsdown";

export default defineConfig({
  // Two entries. `src/lint` is the ESLint plugin, and it ships because a plugin a consumer
  // cannot enable is a plugin only this repo's own tests ever run — which is the "did not run
  // is a way of not failing" finding in another home. It is Node-side tooling, so it is a
  // separate entry rather than part of the component surface.
  entry: ["src/index.ts", "src/lint/index.ts", "src/agent/index.ts"],
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
