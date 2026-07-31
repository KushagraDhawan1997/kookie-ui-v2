# LOG

Living decision log. Newest first. Each entry: what, why, date, alternatives rejected.

This is the *why* behind the history, not a changelog: git is the changelog. `DECISIONS.md` says what the system is now; this says how it got there and what was turned down on the way, so a later reader cannot quietly re-litigate a settled question or re-try a dead end. (Naming differs from the site repo on purpose: there `DECISIONS.md` is the log, here it is the standing spec and the log is this file.)

Write an entry when a choice was genuinely open and got closed: a reversal, a measurement that moved a decision, a constraint the code cannot show, a rejected alternative worth staying rejected. Do not write one for tuning or for new code that is simply new.

---

## 2026-08-01 The radius prop becomes designed palettes, and the palette splits into two bands

The Theme `radius` prop was the last multiplier standing after density lost its own. It is now five designed palettes (`none`, `small`, `medium`, `large`, `full`) emitted under `[data-radius]`, and `--radius-factor` is gone.

**`full` is what settles it.** A pill comes free because CSS clamps `border-radius` to half the smaller dimension, but §6 requires surfaces to be *capped* at the same time, so a dialog does not become a giant lens. One factor scales controls and surfaces by the same amount and structurally cannot do both. A designed palette can: the control band goes to 9999 while the surface band holds at its medium values. The multiplier was already broken for the level that most needed care.

**The palette split into disjoint bands, and that is the load-bearing part.** Steps 1-5 are the control band, 6-7 the surface band. Density only ever picks a step; a level only ever says what a step is worth. No token is written by both, so the two axes compose instead of racing.

The alternative considered first was letting the radius level re-declare `--radius-control-N` directly and relying on source order, since the generated file controls it. That fails on nested Themes: a custom property set by a nearer ancestor wins regardless of source order, so an inner Theme setting only `density` would silently drop an outer Theme's `full`. Disjoint bands survive that; cascade ordering does not.

`none` squares everything including `--radius-full`, since a kill switch with an exception is not a kill switch. Surfaces moved up a step with the split, so a card reads 16px and a dialog 24px where they were 12 and 16 — a deliberate consequence of giving surfaces their own band, worth re-judging by eye.

Two law-test corrections fell out of building it. The "palette is non-decreasing" law was wrong: at `full` it must drop at the band boundary, so it now asserts monotonicity within each band. And the test helper that sliced a rule body ran to end-of-file, so a density block appeared to contain every later block's declarations; it now bounds at the closing brace. Both were tests asserting something looser than intended, which is the failure mode worth watching in a suite built on absence checks.

## 2026-08-01 The corner is held to a fraction of its box, and the palette gains a 10

Seen in the density matrix on the first render: the largest controls read as capsules. The cause was that radius climbed with the size index rather than with the box. Measured against its own height, default ran 0.14 at size 1 to 0.25 at size 4, comfortable reached 0.40, and compact came out at 0.30, rounder than default, because it reused the same radii on smaller boxes. A dense mode being bubblier than a roomy one is backwards.

**The rule is now that a corner holds near a constant fraction of its box (~0.2), growing in absolute terms with size but not in proportion.** §6 already said a bigger control wants a bigger corner; it did not say how much bigger, and "proportionally rounder" was the wrong reading. Resulting ratios: compact 0.17/0.21/0.18/0.20, default 0.14/0.19/0.20/0.21, comfortable 0.18/0.20/0.20/0.20.

**The palette gained a 10px step to make that expressible.** Controls live between 4 and 12, where the old curve jumped 8 to 12 with nothing between, so every correction overshot by 50% and the size-4 corner had nowhere to land. Eight steps is still inside §6's perception cap. Surfaces moved up with the renumbering: `--radius-surface` is now step 5 and `--radius-overlay` step 6, both unchanged in pixels.

Rejected: leaving the palette alone and choosing coarser control radii (the wobble was the problem, and no combination of 4/6/8/12 holds the ratio); dropping the climb entirely for one flat control radius (a size-4 corner genuinely should be larger in absolute terms, which §6 is right about).

## 2026-08-01 Scale keeps its wiring and loses its API

`--scale` stays a multiplier on every length token and stays at 1; the Theme `scale` prop is deferred. Once density took "bigger box, same type," the only case left for scale was "everything bigger, type included," and that splits into browser zoom (which already does it, and is where accessibility guidance points), a config change to the anchors (for a permanently larger system), and the size index (for one larger region). None of those needs a runtime knob today.

**Keeping the wiring costs nothing that matters.** At `--scale: 1` every token resolves to exactly its designed integer, so the arbitrary products only appear if someone opts in. The price is about fifteen characters per token, highly repetitive, which gzip removes almost entirely.

**Not shipping the prop is what avoids the problem**, because a shipped `scale` would be the one factor in the system still producing values like 26.78px after density stopped. Adding a prop later is non-breaking, so this is the reversible direction.

Rejected: stripping `--scale` from the calcs entirely (cleaner, but it forecloses the option for a saving gzip already provides); shipping the prop now as a free multiplier (arbitrary products, and nobody has named the steps it should have); designed sets for scale the way density got them (density re-declares ~16 control tokens per level, scale would re-declare ~40 — every space step, radius step, type step and line height, plus the control family — for a knob with no demonstrated demand); CSS `zoom` as the sanctioned scoped mechanism (it does not reach portaled content, so a zoomed region's popover renders unzoomed; fine as an app-root escape, wrong as an API).

## 2026-08-01 Density becomes designed sets, not a multiplier, and it takes radius with it

Density's job is breathing room at a fixed type size. Canva's signup button is the case that names it: the same label size in a much taller box with a much larger corner. `size` grows everything including type; density grows only the box. v1 had size 2 at 32px height with 14px type and that pairing was right, but some interfaces want the bigger box without the bigger type, and reaching for size 3 to get it moves the type too.

**It is a set of designed values per level, not a multiplier.** Two reasons, and the second is the decisive one. A multiplier produces arbitrary products (`32px * 0.95 * 0.875` = 26.6px), which the system rejects elsewhere: §6 already forbids deriving radius from height on the grounds that each value should be a designed point on a curve. More importantly, a multiplier makes every taste correction *global* — you cannot say "spacious size 2 should be 44px, not 45px" without moving all four sizes in that level. Designed sets make each correction local, and correction is the actual work.

**Shape:** designed heights per level, plus a step offset into the existing palettes for the families that reference them (control-px, control-gap, radius-control), with a per-cell override where the offset lands wrong. Roughly twelve raw numbers and three offsets, about the same decision count as the multiplier model, with the fractions gone and every rendered value a placed point.

**Radius joins the set.** This reverses the call made earlier the same day. Holding radius fixed is right across a small delta, where the radius-to-height ratio moves 0.19 to 0.21 and nobody sees it. It is wrong across density's real range: a 44px box wearing a 6px corner reads boxy, and §6's own argument ("a bigger control wants a bigger corner") is about visual size, not about the size index.

**Untouched, deliberately:** the space palette, so compact never shrinks page gutters, and type, which is the entire point.

**Theme level only, with nested Theme as the escape.** A per-component `density` prop duplicates `size` (a spacious size 2 at 44px against a default size 3 at 40px is two knobs producing overlapping geometry with no rule for choosing between them), and density is a property of a region rather than of an element. The airy hero CTA is reached by putting a nested Theme on the hero section that already exists, via §5's `render` escape, so it costs no extra DOM. Same mechanism §7 uses to rebind accent for a subtree instead of adding a per-component color prop.

**One law, and only one:** for a given size, compact < default < spacious. Spacious size 2 landing above compact size 3 is not drift, it is what density means; a law forbidding it would encode taste as correctness.

**Built the same day, and two details changed on contact.** The step offsets became explicit per-level arrays: an offset could not carry radius (compact at -1 put a size-1 control on `--radius-0`, a square corner), and once one family needs its own array the offset saves nothing over twelve readable rows of data. Compact therefore keeps default's radii deliberately, since a fixed corner reads boxy when the box grows, not when it shrinks. Measured cost of the two extra levels: +108 bytes gzipped, against the +50% guess, so the whole token file is 730.

The heights landed at 24/28/34/40, 28/32/40/48, 34/40/50/60, built so one density step moves the box about one size step while the label holds: compact size 2 stands where default size 1 does, comfortable size 2 where default size 3 does, all three setting their label at font-size 2. That pairing is the axis stated in numbers.

Still open: the numbers themselves, the level names and count (§5 says `comfortable`, which may understate the airy end), whether surface padding takes density (lands at Card), and a size-by-density matrix in the docs app — which is the real gate, because twelve heights across three levels cannot be judged by reading a config file.

Rejected: multiplicative density (arbitrary products, global corrections); density as "another spacing token series" (height is not spacing, and §3 forbids aligning the scales — `--space-7` at 32px matching a size-2 control at 32px is exactly the coincidence the doc warns against); a per-component density prop; a cross-level ordering law.

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
