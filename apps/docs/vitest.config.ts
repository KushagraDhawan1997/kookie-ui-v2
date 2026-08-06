import { defineConfig } from "vitest/config";

/**
 * One node project. The docs app had no test harness at all until 2026-08-06, and the audit
 * that found that also found what it cost: the appearance mechanism — the thing the whole
 * dark-SSR debt was paid with — had zero assertions, so two crash-the-site defects shipped
 * through a green `pnpm run ci`.
 *
 * Node, not browser: what needs proving here is that two IMPLEMENTATIONS of one rule agree
 * (the pre-paint script string and the client store), which is a logic question answered
 * against stubs. The rendered result is the package's business and already has laws there.
 */
export default defineConfig({
  test: {
    name: "docs",
    include: ["app/**/*.test.ts"],
    environment: "node",
  },
});
