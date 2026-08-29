import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import { defineConfig } from "vitest/config";

import remarkFenceMeta from "./mdx-plugins/remark-fence-meta.mjs";

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
  // THE SAME COMPILER THE SITE USES (2026-08-21). The chapter law renders every chapter to
  // static markup, which means the suite has to be able to import a `.mdx` — and importing
  // one through a DIFFERENT compiler than `next build` uses would make the law an assertion
  // about a second pipeline nobody ships. `@mdx-js/rollup` and `@next/mdx` are two adapters
  // over one `@mdx-js/mdx`, which is the arrangement that keeps "it renders here" meaning
  // "it renders there".
  // The GFM plugin is passed here too, and it MUST match `next.config.ts`. A suite whose
  // compiler differs from the site's is a suite asserting things about a pipeline nobody
  // ships — and the divergence would be silent in exactly the direction that matters, since
  // a chapter's table would render here and not there.
  plugins: [mdx({ remarkPlugins: [remarkGfm, remarkFenceMeta] })],
  // `next/font/*` is a BUILD-TIME transform, not a runtime module — the published entry
  // throws on purpose, so the shell laws (which render the real root layout) died the moment
  // the layout loaded a face. See the stub for what it deliberately
  // cannot prove. Only the `local` entry is aliased: both faces on this site are self-hosted,
  // so `next/font/google` is imported nowhere.
  resolve: {
    alias: { "next/font/local": "./test/next-font.ts" },
  },
  test: {
    name: "docs",
    // .tsx as well: a law that renders a layout is JSX, and the app's only laws until
    // 2026-08-08 were logic-against-stubs, which .ts covered.
    include: ["app/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
