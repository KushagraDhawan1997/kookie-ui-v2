import { defineConfig } from "vitest/config";

// Node environment for generator/type-level tests. The CSS-law suite (computed styles,
// @property, container queries) gets a browser-mode project when Box lands (§14 step 3).
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
  },
});
