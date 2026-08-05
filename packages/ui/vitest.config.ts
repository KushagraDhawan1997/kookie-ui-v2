import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/**
 * Two projects, because the suite asserts two different kinds of thing.
 *
 * The node project covers generators and prop tables: pure functions, fast, no DOM. The browser
 * project covers everything only a browser can answer — what a var chain actually computes,
 * whether `@property { inherits: false }` really stops inheritance, which rule wins when a
 * nested Theme and a container query disagree. Those were asserted in prose for days and
 * verified nowhere, which is exactly where a system quietly stops being true.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          // .tsx is here for the type-refusal suites, which build JSX without a DOM; anything
          // that MOUNTS belongs to the browser project below.
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["src/**/*.browser.test.tsx"],
          environment: "node",
        },
      },
      {
        // Pre-bundled explicitly: discovering React mid-run makes Vite reload the page, which
        // it warns is a source of flake and duplicated runs.
        optimizeDeps: {
          // Base UI's entry points belong here for the same reason React does, and the failure
          // is louder: an entry discovered mid-run is optimized in a second pass and ends up
          // holding a different React than the page, so every hook in it reads off `null`.
          // `@base-ui/react/input` did exactly that the first time TextField mounted.
          include: [
            "react",
            "react-dom",
            "react-dom/client",
            "react/jsx-dev-runtime",
            "@base-ui/react/button",
            "@base-ui/react/checkbox",
            "@base-ui/react/input",
          ],
        },
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.tsx"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            // A WIDE viewport, pinned rather than defaulted (2026-08-05). The type layer
            // gained a narrow band that cuts display sizes below 48rem, and the default
            // headless window sat under it — so every law that read a step-9 size was
            // silently asserting against the narrow world while claiming to test the base
            // palette. The identity is what a law should stand on; the narrow band gets its
            // own laws that resize the page deliberately.
            viewport: { width: 1280, height: 800 },
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
