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
          include: ["src/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.tsx"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
