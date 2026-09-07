import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  fixedExtension: false,
  dts: true,
  // NOT `clean: true`, unlike the ui package: `scripts/build-data.ts` writes `dist/data.json`
  // before this runs, and a clean would delete the snapshot the server reads. The build script
  // is one command with the two steps in that order, so the sequence is stated rather than
  // depended on.
  clean: false,
  // Bundled, unlike the ui package, and for the mirror-image reason: there are no "use client"
  // directives to preserve here, and a server started by `npx` should be one file.
  unbundle: false,
  platform: "node",
  // The two runtime dependencies stay as imports rather than being inlined: they are real
  // dependencies a consumer installs, and bundling a peer's copy of zod into this file would
  // ship a second one.
  deps: { neverBundle: ["@modelcontextprotocol/server", "zod"] },
});
