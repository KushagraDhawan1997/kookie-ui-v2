# Review of DECISIONS.md

2026-07-31. Audit of the v2 decisions against measurements of v1 (`~/Code/kookie-ui`) and the site rebuild's decision log (`~/Code/kushagradhawan-v2`). Verdict: build it. Architecture is sound; three defects to fix in the doc before code, none architectural.

**Resolution log (2026-07-31, later same day):** blockers 1-3, typography, density coupling, accent brand fidelity, `contrast="high"`, the DESIGN.md reconciliation, and both build-order amendments are resolved in DECISIONS.md (§2, §3, §7, §9, §12, §14, §15). Still open from this review: focus-visible, disabled/loading, motion, dark-mode SSR, icon sizing, Shell, migration — focus-visible, disabled/loading, motion and icon sizing gate Button (§14 step 5), joined 2026-08-02 by the pointer axis's coarse numbers (§16, §14 step 4b). Dark-mode SSR was passed by Theme and comes due at apps/docs (ENGINEERING.md).

**Second resolution round (2026-08-02, evening):** focus-visible, disabled, loading and the icon box are decided in §8/§4; motion is deferred without gating Button, which ships on §8's single canonical transition; the coarse v0 numbers are accepted as refinable. Button's sole remaining gate is the Theme-as-query-container question (§2). Still open: the full motion system, dark-mode SSR (due at apps/docs), the icon *system* (set contract, stroke, optical centering — only the box is pinned), Shell, migration.

**Third resolution round (2026-08-05):** dark-mode SSR is resolved where it was due — apps/docs exists (bare Next.js; every visible pixel is @kookie-ui/react, no docs framework — LOG). A pre-paint inline script stamps `data-appearance` *and* `data-contrast` on `<html>` — both, because the generated high-contrast selectors assume the two attributes co-locate on one element (§7) — and the root Theme runs `appearance="inherit"` so it stamps neither: one source of truth, no flash, hydration-safe (the store's server snapshots render the toggles neutral and `useSyncExternalStore` corrects them without a mismatch). Still open from this review: the full motion system, the icon system, Shell, migration.

## Sound, no changes

Base UI behind a Kookie-owned API boundary. Token-only styling, no utility classes. Margin only on layout primitives. Size-as-index. Semantic radius references (`--radius-control-N`). Variants as shared role-token bundles. Tone x emphasis x material with appearance as resolved output (elevation was deleted as an axis on 2026-08-03; see LOG). Generated OKLCH color with a role layer. Build order (tokens, Button, Card, measured at each step).

## Blockers (fix in DECISIONS.md before code)

### 1. Responsive props have no compile story, and the CSS-size diagnosis is wrong

Measured v1 gzipped: ~91.5KB total, of which component CSS is ~55KB+ (responsive prop utilities per breakpoint; `sidebar.css` alone 48KB raw), all tokens ~13KB, ~~color scales ~2.8KB~~. The doc's diagnosis (colors are the bulk, component CSS is lean) does not hold for the shipped codebase. Section 3 promises `Responsive<SpaceToken | string>` object syntax; section 2 never says how it compiles. This is the single biggest size lever.

**Correction (2026-08-02): the color figure was wrong by an order of magnitude, and it was the number carrying the "colors are not the problem" claim.** Re-measured: `tokens/colors/` is 31 scales, 248KB raw, **29.3KB gzipped** — ~1.1KB per scale, which is what 2.8KB was probably a sample of. Full re-measure, each file gzipped separately: `styles.css` 127KB, `components.css` 67KB, `tokens.css` 36KB, `utilities.css` 25KB, `layout.css` 24KB (`sidebar.css` at 47,426 bytes raw confirmed). So color is a **major** term, not a rounding error, and shipping only the configured tones is doing real work — v2 currently spends 6,369 bytes gzipped on three tones in two modes with alpha ramps, a P3 block and a high-contrast block. What survives is the narrower claim: component + layout + utility CSS is still much larger than color, responsive prop utilities are still the biggest single lever, and section 2 still had no compile story for them. What does not survive is "the doc's colour diagnosis is wrong" — it is substantially right.

Options: (a) pregenerated token x breakpoint utility classes, the v1 mass scoped to layout primitives; (b) variable-per-breakpoint remap: props set `--gap`, `--gap-sm`, `--gap-md` inline, O(breakpoints) global rules decide which var wins per tier. (b) is the answer; it also absorbs the raw-string escape (`gap="13px"`) for free, which (a) structurally cannot. Decide it, write it into section 2, and prove it on Box before Flex/Grid/Stack ship.

Breakpoints stay the Radix scale (xs 520 / sm 768 / md 1024 / lg 1280 / xl 1640): the site rebuild is already written against it "to stay aligned with KookieUI." ~~Reversed the same day~~ — tiers are container-keyed and there are three of them (`sm` 30rem, `md` 48rem, `lg` 64rem), because a component should adapt to its slot rather than the window (DECISIONS §2; LOG 2026-07-31).

### 2. The fixed L ladder breaks on bright hues

Step 9 at L ~.62 is a mud olive for yellow, amber, lime, mint, sky. Radix hand-places those solid bands at L ~.85+ with dark contrast text. Because accent is an arbitrary user hue, someone will pass a brand yellow. APCA contrast text handles the label flip, not the ugly fill.

Already proven in-house: the site's color log rejected gold/yellow accents ("step 9 must hold 4.5:1, which a light hue cannot at any saturation") and hand-darkened the teal ramp's deep steps "where the hue runs bright." That hand adjustment is the missing term.

Fix without breaking one-law: make the solid band's L (steps 9/10/active) a bounded, continuous function of hue. Backgrounds, borders, and text bands keep the fixed ladder. Still generated, still not hand-tuning. Amend section 7 and remove "do not reopen" from the ladder (the chroma-vs-lightness tradeoff paragraph stands).

### 3. emphasis vs variant is unresolved, and the mapping is lossy

Section 8 defines five recipes (soft/solid/surface/outline/ghost); section 9 defines four emphasis rungs with `low -> surface/outline` naming two recipes for one rung, so one is unreachable through the semantic API. Decide before Button hard-codes it: is `variant` a public prop beside `emphasis`, or internal only? Which recipe does `low` resolve to, and how is the other reached (fifth rung, `variant` escape, or it dies)?

## Missing sections (silent in the doc, each needs a decision)

- **Focus-visible.** Absent from the state machine entirely. One system ring recipe (offset, color role, follows radius), defined once like hover/press.
- **Disabled and loading.** States are rest/hover/press only. One global law (which tokens survive, alpha or desaturation) or every component reinvents it.
- **Typography.** `--font-size-N` is referenced throughout with no type section: scale, line-height law, weight tokens, heading/body mapping.
- **Motion.** One interaction transition exists; overlay enter/exit (a stated reason for Base UI) has no duration/easing tokens or reduced-motion mapping.
- **Accent brand fidelity.** Does step 9 reproduce the supplied hex exactly (ladder bends locally) or normalize it to the ladder's L (output differs visibly from the brand color)? Pick one; pinning step 9 to the input in light mode is the defensible default.
- **`contrast="high"` mechanism.** A Theme prop with no generator story; it is a second ladder or an L-delta and should be costed in section 7.
- **Dark-mode flash / SSR.** `appearance` hydration (inline script vs class on html), RSC / `"use client"` boundaries.
- **Icon sizing.** `--icon-size-N` pulled by the same size index; one paragraph closes it.
- **Shell.** v1's flagship, one table row in section 11. Decide: v2 core, separate package on v2 primitives, or deferred. Its 48KB of v1 CSS makes it the stress test for blocker 1.
- **Migration.** v1 promises Radix API compatibility; v2 breaks it. Even "clean break, no codemods, v1 maintained until X" is a decision worth a line.
- **Density coupling.** Section 12 has density multiply all spacing, so compact mode shrinks page gutters, the same coarseness the doc rejects in Radix's `scaling`. Either scope density to control-adjacent tokens (height, control-px, control gaps) or accept the coupling in writing.

## One argument the doc must make

The site's DESIGN.md rejects the Box/Flex/Stack suite by name ("a layout DSL moves visual decisions into markup, where they cannot be reviewed as design"). v2 ships that suite. The reconciliation: in Astro, scoped CSS modules are the enforceable layer; in a React library, the component API is the only enforceable surface, so the primitives are the enforcement, not the leak. Write this into section 3 so the two documents do not argue.

## Build-order amendments (section 14)

- Insert between steps 2 and 3: prove the responsive-prop compile strategy on Box alone and measure it (blocker 1).
- Step 2's measurement should include a two-accent config (alpha ramps x modes x tones) so the budget covers section 7's full output.
