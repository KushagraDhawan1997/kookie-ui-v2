import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { VIEWPORT } from "./src/test/viewport.ts";

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
          // A HANG-GUARD, not a claim about speed (2026-09-10). Every law in this project is a
          // pure walk over a fixed corpus — it terminates or it loops forever — so what a
          // timeout can catch here is a loop, and vitest's 5s default was instead making the
          // machine's load part of the verdict. Three of these laws do real work (the type
          // refusals build diagnostics per prop, 2.6s; the preview law generates the whole
          // density page, 0.8s) and a two-core CI runner is several times slower than a
          // developer's, so `resolve.test.ts` went red on CI with nothing wrong in it. A
          // genuine loop still fails, later and just as loudly.
          testTimeout: 30_000,
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
            "@base-ui/react/accordion",
            "@base-ui/react/autocomplete",
            "@base-ui/react/avatar",
            "@base-ui/react/button",
            "@base-ui/react/checkbox",
            "@base-ui/react/alert-dialog",
            "@base-ui/react/combobox",
            "@base-ui/react/dialog",
            "@base-ui/react/direction-provider",
            "@base-ui/react/drawer",
            "@base-ui/react/field",
            "@base-ui/react/input",
            "@base-ui/react/context-menu",
            "@base-ui/react/menu",
            "@base-ui/react/number-field",
            "@base-ui/react/popover",
            "@base-ui/react/progress",
            "@base-ui/react/radio",
            "@base-ui/react/select",
            "@base-ui/react/radio-group",
            "@base-ui/react/scroll-area",
            "@base-ui/react/separator",
            "@base-ui/react/slider",
            "@base-ui/react/switch",
            "@base-ui/react/tabs",
            "@base-ui/react/toggle",
            "@base-ui/react/toggle-group",
            "@base-ui/react/toolbar",
            "@base-ui/react/tooltip",
            "@shadcn/react/message-scroller",
          ],
        },
        /**
         * NO COMPILED-IN CLOCK FACTS (2026-09-20).
         *
         * Two used to be defined here — `__KUI_CI__` and `__KUI_STALL__` — because browser mode
         * runs the laws in a real page where there is no `process` to ask, and a law whose claim
         * depended on WHEN it looked had to know whether this machine's clock could be trusted.
         * Both existed only to serve the frame-watching register, and the register existed only
         * to serve motion. With the motion system removed, no law in this suite makes a claim
         * about a moment: the three content loops are asserted by their declarations, and every
         * other state is settled the instant it is stamped. A mechanism whose one job is gone is
         * deleted rather than left inert, so these are not kept "in case".
         */
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.tsx"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            // Pinned WIDE, one home: src/test/viewport.ts carries the why.
            viewport: VIEWPORT,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
