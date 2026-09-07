import { defineConfig } from "vitest/config";

/**
 * One node project. What needs proving here is that a derivation agrees with its sources and
 * that a scanner reads real text correctly — both logic questions with no browser in them.
 * The assembled binary is proven separately, by `scripts/drive.mjs`, which speaks JSON-RPC to
 * a real child process: a unit cannot show that a bin starts.
 */
export default defineConfig({
  test: { name: "mcp", include: ["src/**/*.test.ts"], environment: "node", testTimeout: 120_000 },
});
