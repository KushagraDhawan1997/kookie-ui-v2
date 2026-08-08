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
  // Next's tsconfig says `jsx: preserve` because Next owns the transform; Vitest does not,
  // so the runtime is stated here. Needed since 2026-08-08, when the shell laws started
  // rendering the layouts rather than reading them.
  esbuild: { jsx: "automatic" },
  test: {
    name: "docs",
    // .tsx as well: a law that renders a layout is JSX, and the app's only laws until
    // 2026-08-08 were logic-against-stubs, which .ts covered.
    include: ["app/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
