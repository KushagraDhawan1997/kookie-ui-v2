# LOG

Living decision log. Newest first. Each entry: what, why, date, alternatives rejected.

This is the *why* behind the history, not a changelog: git is the changelog. `DECISIONS.md` says what the system is now; this says how it got there and what was turned down on the way, so a later reader cannot quietly re-litigate a settled question or re-try a dead end. (Naming differs from the site repo on purpose: there `DECISIONS.md` is the log, here it is the standing spec and the log is this file.)

Write an entry when a choice was genuinely open and got closed: a reversal, a measurement that moved a decision, a constraint the code cannot show, a rejected alternative worth staying rejected. Do not write one for tuning or for new code that is simply new.

---

## 2026-08-01 The token pipeline lands, and density enters at the semantic layer only

Space, radius, type, and the control family generate from `src/tokens/config.ts`, which now holds every raw pixel constant in the system. The generator is §12's multiplier table expressed as code, which is the point: `--scale` is global, `--density` reaches only control height and control inline padding, `--radius-factor` only radius, and the law tests fail if any family drifts from that table.

**§3 and §12 contradicted each other, and the fix keeps both.** §3 specified `--control-px-1: var(--space-3)`, a pure reference with no multiplier; the amended §12 says control spacing takes density. Emitted as `calc(var(--space-3) * var(--density))`, both rules hold: the semantic token still points at the palette instead of restating 8px (§6's reference-not-coincidence law), and density enters at the semantic control layer exactly as §12 says. The space palette itself stays density-free, so a compact theme tightens controls without shrinking page gutters. That coupling was the defect REVIEW.md flagged in Radix's single `scaling` knob.

**Values that were illustrative are now pinned:** line heights 16/20/24/26/28/32/38/48/62px (ratios running 1.33 to 1.5 through the reading sizes, tightening to 1.11 at display), letter spacing flat through the reading sizes then -0.005 to -0.025em, system stacks as the family defaults with `--font-heading` chaining to `var(--font-body)` so §5's `font` shorthand falls out for free. `--radius-full` is deliberately not scaled: it is a clamp sentinel, not a measurement.

**Generated files are protected by a law test, not a hook.** The suite regenerates and compares against the committed artifact. Proved by appending a comment to `tokens.css` by hand: the test failed, and passed again after regeneration. A hook only protects the session that has it installed; a test fails CI for everyone, including a future contributor who never read ENGINEERING.md.

**The budget ratchet fired on its first real growth**, refusing 20 to 604 bytes gzipped until the baseline was re-recorded in the same commit. Working as designed: intentional growth is cheap to accept and impossible to take silently.

Rejected: a single derived line-height ratio (§15 already argues one ratio is wrong at both ends of a nine-step ramp); unitless line heights (they would re-derive the ratio from font-size, which is the derivation §15 rejects, and paired px values scale correctly through `--scale` anyway); density on the space palette (compact would shrink page gutters, the coupling defect); a PreToolUse hook guarding generated files (protects one machine, not the repo).

## 2026-07-31 The scaffold ships audited, and the budget gate becomes a ratchet

pnpm, Turborepo, tsdown, Lightning CSS, Changesets, Vitest, with the CI budget gate wired on day one per §14. Two adversarial audits ran against the result before anything was committed, and two of their findings were real defects invisible from the working tree.

**The published package would have had no types and no client directives.** tsdown 0.12 emitted a content-hashed `index-BNjKmUhF.d.ts` while the exports map promised `./dist/index.d.ts`, so every TypeScript consumer would have gotten "could not find a declaration file"; the same version stripped `"use client"`, which would crash any hook-using component imported from a Next.js server component. Both fixed by moving to tsdown 0.22, and the build now asserts its own output files exist. That assertion immediately earned itself by catching 0.22 defaulting to `.mjs`.

**The budget gate contradicted its own spec.** All three documents say the build fails on *regression*; the script checked only a fixed 40KB ceiling, so every byte of creep from zero to 40,959 would have passed silently. It is now a ratchet: `budget.json` carries a baseline alongside the ceiling, and any unexplained increase fails.

Two smaller corrections worth remembering: Lightning CSS was doing bundle and minify only, because without `targets` it emits no prefixes and passes nesting through untranspiled, so §2's promise of "minify, autoprefix, nesting" was two-thirds inert; and the release workflow failed on its first push trying to publish 0.0.0 without an `NPM_TOKEN`, so it is manual until there is something to publish.

Rejected: Bun (pnpm's strict isolated `node_modules` makes phantom dependencies fail immediately, which is a correctness gate for a published package; `Bun.build` emits no declarations; `bun test` has no browser mode, and the CSS law tests need a real browser to evaluate `@property` and container queries); ESLint 10 and TypeScript 7 despite both being current (typescript-eslint 8 pairs with ESLint 9, and TS 7's native compiler is an ecosystem-compatibility bet the scaffold does not need to take); a `no-restricted-imports` depth pattern for package boundaries (it false-positives on legitimate nesting like `src/components/button` importing `src/system`).

## 2026-07-31 The review's blockers close: responsive props compile by variable remap

REVIEW.md's three blockers are resolved in the spec, and the largest one reversed a diagnosis the doc had made confidently.

**The CSS-size story was wrong about the shipped codebase.** Measured v1: ~91.5KB gzipped, of which component CSS is ~55KB (`sidebar.css` alone 48KB raw) and all color scales are ~2.8KB. The doc had argued colors were the bulk and component CSS was lean, which is true of Radix's architecture but not of the fork that ships. The real mass is responsive prop utilities, and the doc had no compile story for them at all.

**Variable remap is the answer, and its shape is what makes it small.** The component writes tier values as inline custom properties; the stylesheet holds a fixed set of arbitration rules per prop that decide which tier's variable wins. Values never enter the stylesheet, so cost is O(props x tiers) forever and the token dimension, the multiplier behind the 55KB, disappears entirely. Raw strings like `gap="13px"` ride the same pipe at zero additional cost, which pregenerated classes structurally cannot do. Because the mechanism is value-agnostic, structural props (`direction`, `columns`, `display`, `areas`) remap identically to spacing.

**Tiers are container-keyed, few, and semantic**, so a component adapts to its slot rather than the window and the same Grid is correct in a drawer and a main column. Both native platforms independently landed there: iOS ships two size classes, Android three window classes, and neither has per-prop pixel breakpoints anywhere in its API.

The other two blockers: the fixed L ladder now bends for the solid band only, as a bounded continuous function of hue, because saturated yellow does not exist at L .62 and an arbitrary user hue means a brand yellow will eventually arrive; and `variant` becomes public underneath `emphasis`, because four rungs cannot address five recipes and `outline` was otherwise unreachable through the semantic API.

Rejected: pregenerated token-by-breakpoint utility classes (v1's mass, and no way to express an arbitrary value); build-time scanning of consumer source in the manner of Tailwind's JIT or Panda (requires a compiler in every consumer's build, breaks on runtime-computed props like `gap={isCompact ? "2" : "4"}`, and contradicts §2's no-build-step position); a fifth emphasis rung or deleting `outline` to make the ladder cover the recipes (distorts the semantic layer to protect an abstraction); viewport breakpoints as the primary tier vocabulary; Braid-style `className` lockdown (kills legitimate escapes such as consumer grid placement and animation libraries; a shipped lint rule polices defection instead).
