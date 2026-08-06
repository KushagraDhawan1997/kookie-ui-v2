# Review of DECISIONS.md

2026-07-31. Audit of the v2 decisions against measurements of v1 (`~/Code/kookie-ui`) and the site rebuild's decision log (`~/Code/kushagradhawan-v2`). Verdict: build it. Architecture is sound; three defects to fix in the doc before code, none architectural.

**Resolution log (2026-07-31, later same day):** blockers 1-3, typography, density coupling, accent brand fidelity, `contrast="high"`, the DESIGN.md reconciliation, and both build-order amendments are resolved in DECISIONS.md (§2, §3, §7, §9, §12, §14, §15). Still open from this review: focus-visible, disabled/loading, motion, dark-mode SSR, icon sizing, Shell, migration — focus-visible, disabled/loading, motion and icon sizing gate Button (§14 step 5), joined 2026-08-02 by the pointer axis's coarse numbers (§16, §14 step 4b). Dark-mode SSR was passed by Theme and comes due at apps/docs (ENGINEERING.md).

**Second resolution round (2026-08-02, evening):** focus-visible, disabled, loading and the icon box are decided in §8/§4; motion is deferred without gating Button, which ships on §8's single canonical transition; the coarse v0 numbers are accepted as refinable. Button's sole remaining gate is the Theme-as-query-container question (§2). Still open: the full motion system, dark-mode SSR (due at apps/docs), the icon *system* (set contract, stroke, optical centering — only the box is pinned), Shell, migration.

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

---

# Audit 2026-08-06 — Radio and Slider (ultracode; findings OPEN, nothing fixed)

Scope: `771b95b..cb8a8f2` (the value-control tokens, the mark-family promotion, Radio + Slider). Eight parallel finders on one model, every finding then put to two adversarial verifiers on a *different* model — one refuting by reading, one by measurement — so a shared blind spot had to survive two models to land. 31 raw → 25 after dedup → **8 confirmed, 10 plausible, 7 refuted**. The three worst were re-measured by hand afterwards and all three reproduce.

**Verdict.** The promotion is clean and the additivity claim holds (+177 gzipped for two controls, a minted role, a designed ladder and the move itself; checkbox's mounted laws needed no edit, verified as a 0-line diff). What did not survive contact is the mark family's founding identity and the shared state layer's reach: **the thumb is the first mark that is not a `.kui-control`**, and every consequence of that — its box model, the invalid and disabled remaps, the box that accepts a press — shipped unmeasured. The pattern is 2026-08-03's lesson one level up: these laws do read the browser, they just read the wrong element or the wrong box, and in each case that thing was wrong.

## Confirmed

**R1 — the thumb paints 2px larger than the checkbox at every size, and is not a circle (major).** `box-sizing: border-box` is on `.kui-control`, not `.kui-mark`; the thumb wears `kui-mark kui-slider-thumb` with a real border, so it resolves content-box. Measured (`getBoundingClientRect`): checkbox 16/20/24/26 against thumb **18/22/26/28**. Falsifies §4's `checkbox = radio = slider thumb = mark(n)` and the §6 circle (radius 8px on an 18px box leaves a ~2px flat run per edge). Both governing laws are blind the same way — they compare `getComputedStyle().height`, which is the *content* box in both modes: 16 === 16 while the paint is 16 vs 18. *Fix:* `box-sizing: border-box` on `.kui-mark` (a no-op for checkbox and radio); re-write both laws against `getBoundingClientRect`. Switch inherits this — a track that is not a `.kui-control` is the next content-box mark.

**R2 — the invalid and disabled remaps never reach the thumb's edge (major).** `.kui-mark` declares `--tone-border: var(--mark-edge)` *on* the mark. For checkbox and radio the mark IS the control, so the shared remaps are same-element and win; the thumb is the first **descendant** mark and its own declaration shadows the inherited remap. Measured both appearances: rest, invalid and disabled thumb borders are byte-identical `--mark-edge`, while the root's `--tone-border` does become `--invalid-edge`. Nothing else on a slider reads the role, so **an invalid slider at rest is pixel-identical to a valid one** — its only expression is the focus ring, which arrives after the user has already focused. The contradiction is the promoted comment itself (recipes.css: re-pointing the role is load-bearing "because a component that reaches past them makes itself unreachable by every state law"): true for same-element topology, carried by the promotion to a topology where it is false. *Fix (a real choice):* a state arm reaching a descendant mark (`.kui-control:is([data-invalid],[aria-invalid="true"]) .kui-mark`, plus the disabled equivalent), **or** the family stops re-declaring `--tone-border` on the mark. Plus a law reading the thumb's `border-top-color` at rest/invalid/disabled in both appearances.

**R3 — under forced colors a checked Radio is indistinguishable from unchecked (major; predates these commits).** Screenshot diff under emulated `forced-colors: active`, light palette: radio checked→unchecked **0 changed px** (checkbox 0 too), against a negative control of 395/524 px with forcing off. Chromium's UA sheet sets `forced-color-adjust: preserve-parent-color` on SVG content, resolving `currentColor` to `--accent-contrast` white against a Canvas-white backplate; dark palettes survive by accident. Shipped with Checkbox 2026-08-05 and survived the 40-agent audit; 957a0ba generalised it to the family, and it is Radio's only state signal. AT is unaffected (the hidden input carries `checked`); the loss is for sighted HCM users. `grep -rn "forced-color"` over `src` returns zero — the package has no forced-colors handling at all. *Fix: scope is Kushagra's call — this would be the first forced-colors rule in the package.*

**R4 — the pressable strip is one border short of the height ladder's promise, and one cell breaks the locked floor (major).** Base UI's press handlers are on `.kui-slider-control`, which `align-self: stretch` fills to the root's *content* box (root − 2×`--border-width`). Row scan by `elementFromPoint`, null treated as an error: coarse/default/size 2 → root 44px, **43 live**; fine/compact/size 1 → root 24px, **23 live**. That last cell sits exactly on the tier-1 24px floor, so its real target is 23 — under WCAG 2.5.8 and under this repo's own non-negotiable. Trusted clicks agree (a click on the bottom row does not move the value). Both target laws read `getComputedStyle(root).height` — 44 and 24, both true — one indirection from the element Base UI hit-tests, so they cannot fail while the pressable box is 43/23. *Fix:* one declaration on `.kui-slider-control` (stretch over the border box, or move the border to the control); rewrite the two laws to press the box.

**R5 — standalone `aria-invalid` never reaches the node AT exposes as the slider (moderate).** It spreads onto Base UI's root, which is `role="group"`; the thumb's hidden `<input type=range>` carries `aria-label | aria-orientation | aria-valuenow` and no `aria-invalid`. Inside `Field.Root` Base UI wires it correctly, so the gap is exactly the standalone platform spelling §8 calls required — and `render`/`children` are refused, so a call site cannot fix it. *Fix:* forward `aria-invalid` to the thumb as `aria-label` already is, plus a law reading it off the range input.

**R6 — the mark-promotion law has two demonstrated escapes (minor).** Mutation-tested against a scratch copy: `height: calc(var(--kui-ct-mark) * 0.8)` and `height: var(--mark-2)` both pass the whole node suite (each is caught loudly by the member's own mounted laws, so this is defence-in-depth). `--kui-ct-mark: 40px` is *not* an escape — the raw-px law catches it. *Fix:* widen to `/(inline-size|block-size|width|height)\s*:[^;]*--kui-ct-mark/` plus `/--kui-ct-mark\s*:/`; both leave the legitimate `border-radius: calc(var(--kui-ct-mark) / 2)` alone.

**R7 — "law-tested at every level in both worlds" is false for one of the two breaching corners (minor).** Radio's circle law loops level × pointer × size; the thumb's loops levels only, in the fine world. Mutation: `[data-pointer="coarse"] .kui-slider-thumb { border-radius: 0 }` is caught in 20 cells on `.kui-radio` and **zero** by the shipped slider law. §6 and LOG both claim both worlds; only the radio half is true.

**R8 — "the only two corners the radius axis never reaches" is false: the rail is a third (minor).** The track's `calc(var(--kui-ct-track) / 2)` resolves through raw designed px with no radius-palette token in the chain, and the fill inherits it. Measured under `radius="none"`, both worlds, all sizes: track corners 2/2.5/3/3.5px (a full capsule) while root, Button, Checkbox and TextField all read 0. The claim appears in §6 twice, LOG and CLAUDE.md; LOG's slider entry documents the track exhaustively and never mentions its corner. *Fix is doc-shaped* (a capsule rail under `none` is what every platform ships): argue the end-cap as role the way the two circles are argued, correct the count in four places, add the missing law.

**R9 — the track-well law's recorded rationale names an axis that cannot reach it (minor).** The comment says a raw hex "would go deaf to `contrast=high`", but `trackWellStep` is 4 and `contrastHighBands` covers 5/6/7 and 10/11, so the high-contrast pass never emits index 4. Measured: `--color-track` is byte-identical between normal and high in both appearances while positive controls move. The `var()` indirection is still load-bearing — it buys the *appearance* scopes and the *P3* rewrite. *Fix:* reword to name appearance and P3. (Instructive: `--mark-edge` would have been half-true — dark's step 11 is in the text band and does move; light's step 9 does not.)

## Plausible (one line each; what would settle it)

- The track exemption's predicate "a well is a region the APCA-passing fill moves through" is not law-held at the boundary it implies — fill vs track measures Lc 44.97 light / 40.9 dark, both under the nonText floor of 45. *Decide which edge is the 1.4.11-bearing one, then write that law.*
- Both laws pinning `--slider-track-N`'s density/pointer invariance have blind spots (the mounted one resolves the token inside the scope it measures). *A whole-sheet occurrence assertion closes it in one line.*
- The invalid-slider law survives sabotage (`outline-color: rgb(1,2,3)` leaves both assertions true) — downstream of R2 either way.
- Slider collapses to its 2px borders in any indefinite-width containing block, and in a TextField slot the thumb stays `visibility: hidden` permanently. *The generic half IS the recorded Box shrink-wrap open item; does the slot case earn a line?*
- 3+ thumbs share one accessible name — Base UI's default `aria-valuetext` special-cases exactly two. *Is 3+ supported? If yes it needs a law.*
- `min === max` renders an invisible, unfocusable slider with a live `aria-valuenow`; Base UI logs a dev warning. *Is an upstream warning accepted as the coverage?*
- A bare Radio outside a group is silently inert, and `value=""` paints permanently checked — while radio.tsx's own docstring example shows a Radio with no group wrapper. *Fix the example, or decide the requirement is stated elsewhere.*
- Dark's `--color-surface-active` is the same token `--color-track` reads, so a slider on a pressed card-as-button has a track indistinguishable from its bed. *Eye pass, with numbers: light track vs page Lc 8.7; dark Lc 0.00.*
- RadioGroup renders an unnamed `role="radiogroup"` on its own documented path; two naming routes work and neither is documented. *One JSDoc sentence.*
- Both circle laws read only `border-top-left-radius`; a mutation squaring three corners passes both.

## Refuted — recorded so they are not re-raised

- **RTL is not a defect.** The physics reproduce, but `DirectionProvider` (a dependency's public entry, and an *ancestor*, so the closed `render` cannot block it) makes every measurement correct. RTL is a recorded deferral whose "architectural room left" verifies — slider.css is written entirely in logical properties.
- **No light-mode SC 1.4.11 failure.** The finding enumerated only boundaries internal to the rail; the thumb's edge against the page is 3.09–3.17:1 across ~85% of its perimeter.
- **The slider is not unreadable under forced colors.** `.kui-control`'s normally-transparent border is forced to CanvasText, so the root paints a bounded frame whose edges are the track's endpoints; position stays readable. What is lost is the fill/track distinction. (The real forced-colors defect is R3.)
- **The mark expander in a Card-as-button is not the D4 shape** — the halo behaves identically in a plain Card, and the finder's negative control was itself the error (the reach is general to any neighbour, which is what the 12px rule exists for).
- **`aria-invalid` on `role="radio"` is conforming** — "deprecated as global" flags a future restriction, not present non-conformance; Chromium maps it identically to `role=checkbox` and to a native radio. The suggested alternative is worse.
- **`--slider-track-N` is not specially frozen under a subtree `--scale`** — 29–47 tokens declared once at `:root` behave identically, `--icon-size-N` among them; the thumb and track freeze together.
- **"The promotion proving it changed nothing" is not an overclaim** — it is scoped in both LOG and CLAUDE.md to the mounted checkbox laws needing no edit, which is verifiably true. Residue: a stale comment at checkbox.browser.test.tsx (":not([data-slot] > *)" language outliving the respelling).
- **Recorded clean, do not re-raise** (all mounted, with negative controls): mixed Radio+Checkbox stacks hold the 12px rule in all 24 cells in both orders; the size-4 comfortable-coarse interior is slider-owned; the fill never paints outside the track at 0 or 100; `name` reaches every range input; SSR emits Base UI's prehydration script; Base UI's label association works across five shapes.
