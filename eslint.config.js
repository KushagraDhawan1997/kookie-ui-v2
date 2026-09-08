// The BUILT plugin, by path: the root has no dependency on the workspace package and
// should not grow one to lint itself. `lint` depends on `^build` AND `build`, so `dist` is
// there — and for eleven commits it was not, because this sentence said `^build` alone and
// believed it (2026-09-08). `^build` builds a package's DEPENDENCIES, and `@kookie-ui/react`
// has none that build, so the list expanded to nothing and this import died on every clean
// checkout. See `turbo.json`'s `lint` task for the measurement.
import kookie from "./packages/ui/dist/lint/index.js";
import tseslint from "typescript-eslint";

/**
 * THE REPO RUNS ITS OWN PLUGIN (2026-09-07, the audit).
 *
 * It did not, and the TODO the plugin discharged was still sitting here — so the one codebase
 * that could catch a false positive on real code before a consumer did was the one codebase not
 * running it. `no-spacing-utilities-on-controls` is what `no-escape-abuse` ships as, and the
 * boundary rule is answered by the exports map plus `publint` and `are-the-types-wrong` on
 * every build, which check the packed artifact rather than a lint pattern's guess at nesting.
 *
 * `typescript-eslint`'s parser is configured first; the shareable config brings none, for the
 * reason its own header gives at length.
 */
export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/.turbo/**", "**/.next/**", "**/next-env.d.ts"] },
  ...tseslint.configs.recommended,
  ...kookie.configs.recommended,
  {
    // The plugin's own fixtures exist to be wrong. Reporting them is the fixtures working.
    ignores: ["packages/ui/src/lint/__fixtures__/**"],
  },
);
