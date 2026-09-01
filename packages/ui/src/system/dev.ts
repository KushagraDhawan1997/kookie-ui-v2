/**
 * IS THIS A DEVELOPMENT BUILD? One home for the one question (§13).
 *
 * It was written SIX TIMES — clip.tsx, nesting.tsx, floating.tsx, box.tsx, shell.tsx,
 * theme.tsx — as the identical expression under four different comments, one of which stated a
 * property the expression did not have. That is the shape a fact in six homes always takes, and
 * the fact here is load-bearing: every dev-only guard in the package is a `ResizeObserver`, a
 * `MutationObserver` or a measuring effect, so a `DEV` that answers wrong in production does not
 * print a stray warning — it ships observers into an app that is paying for them forever.
 *
 * THE SPELLING IS THE WHOLE POINT, and both obvious ones are wrong. It has to answer three
 * environments correctly, and the previous form answered only two:
 *
 *   1. A PRODUCTION BUNDLE. The bundler substitutes `process.env.NODE_ENV` with `"production"`
 *      and nothing else. It does NOT define a runtime `process`, and it does not fold
 *      `typeof process`. So `typeof process === "undefined" || <folded false>` evaluates to
 *      TRUE wherever the global is absent — which is Vite, Rollup, Parcel and bare ESM, every
 *      one of them shipping the dev observers (2026-08-31 performance pass, measured against
 *      esbuild's own output: `typeof process>"u"||!1`). Next and webpack shim `process`, which
 *      is the only reason the docs app never showed it.
 *   2. THE BROWSER SUITE, which serves source with no runtime `process` at all. Box's 2026-08-08
 *      scar is here: written `typeof process !== "undefined" && …` the flag is FALSE in exactly
 *      that environment, so every dev-warning law measures a warning that was compiled out.
 *   3. BARE ESM with no bundler and no define, where reading `process` throws.
 *
 * Reading the substituted value inside a `try` answers all three from one expression: case 1
 * reads the folded `"production"` and never consults the global, case 2 and case 3 fall through
 * to `undefined` — dev, which is the safe direction for a warning and the direction the suite
 * needs. A bundler that substitutes nothing at all lands on dev too, so the failure mode is a
 * console line nobody needed rather than an observer nobody asked for.
 *
 * The read is deliberately the exact token sequence `process.env.NODE_ENV`, because that is what
 * every bundler's `define` matches. Do not rename the intermediate or split the member access.
 */
let env: string | undefined;
try {
  env = process.env.NODE_ENV;
} catch {
  // No `process` in this realm, and no bundler substituted the read. Treat that as development:
  // see case 2 above — it is what the browser suite is, and a suppressed warning there is a
  // law that silently measures nothing.
}

export const DEV = env !== "production";
