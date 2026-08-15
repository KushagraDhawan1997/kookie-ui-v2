# Handover — the material rethink, 2026-08-12 → 14

Everything here is **uncommitted**, on `main`'s working tree. The three lab routes are scratch — judging surfaces, never shipped, deleted the day their recipes move into config. A handful of package files changed for real along the way; they are listed at the end with the debts they carry.

**What this file is, and is not.** A handover is written in plain English for the person who was not in the room, and it is the only doc here that is allowed to repeat itself. Where this file and a governance doc disagree, the governance doc is right. Nothing should ever be read out of this file and into code — when the recipes port, they port from the lab sources and the tables below, re-judged.

---

## The world model

Three days of design dialogue arrived at a frame the current system doesn't have:

**Material is a theme property, not a per-component opt-in.** The question is "of what material are my components built" — an app identity, like depth. Solid is a material too, not the absence of one: light lands on it and doesn't pass through. Thin/regular/thick are the translucent rungs; the theme picks one world and everything is built of it.

**Depth is membership, not drama.** Three rungs, each *adding members* to the lit world rather than adding theatrics to the members it has:

- **Drawn** (rung 0) — ink only. No light anywhere; boundaries are lines. Glass **seals** here: a static composite visually identical to solid by construction, so turning glass off is purely a performance decision.
- **Stacked** (rung 1) — surfaces are lit (cast, catch, rim on glass); controls stay flat. **The chosen default.**
- **Lit** (rung 2) — controls join. Card paint is *identical* to rung 1; only the buttons lift.

**Light is the renderer.** Every visual fact in the labs derives from it: a shadow's spread is the caster's height, its darkness is the material's opacity, a rim is evidence of transmission (glass only — matte solid has no rim, locked), dark mode's in-flow surfaces subtract toward black while *floating* panes lighten toward white (in dark, height is lightness — macOS dark menus do the same).

## Lab 1 — solid, locked

`/lab` — sliders per mode over beds × rungs × materials. The solid anatomy: a face-light gradient, a bottom inner shade, a soft contact shadow (`0 1px 2px`), and a **diffuse blast** (`0 24px 64px -12px`, darkness by opacity — 5/7/9/11% across the ladder). No rim: matte was judged the right call for solid. Locked knobs: light `{top:100, bot:15, ring:10, grad:30}`, dark `{top:15, bot:0, ring:10, grad:10}`. The lit world's light page is `--neutral-2` (the value-gap rule); dark's is `--neutral-1`.

## Lab 2 — the flagship

`/lab2` — "free reign, think Apple, produce something as good as Liquid Glass." It got there by copying the physics, credited: **kube.io's liquid-glass method** ([kube.io/blog/liquid-glass-css-svg](https://kube.io/blog/liquid-glass-css-svg)).

**Real refraction.** An SVG `feDisplacementMap` used as a `backdrop-filter` (Chromium only). The displacement map is computed on a canvas from Snell's law: a rounded-rect signed-distance field, a bezel surface profile (circle / squircle / concave / lip), red = X-bend, green = Y-bend, 128 = neutral; displacement scale clamps to the bezel width. Chromatic aberration is three displacements at `base × (1 ± spread)`, channel-isolated with `feColorMatrix`, screen-blended. Refraction is only *visible* where detail bends — heavy blur erases what it bent, so the material went near-clear ("diamond, not frost") and the beds grew hard detail: numerals, a checker, graph paper, two photographs.

**Locked lens parameters:** profile `concave`, bezel `120`, thickness `80`, refraction index `2.4`, fringe `40%`, boost `2×`, specular `100%`, frost `20%`.

**Two Chromium constraints, both measured:** `url(#id)` filter references resolve **once** — a dead reference never revives and mutations inside a referenced filter go unobserved. Fixed cards with params-keyed filter ids plus a stylesheet injected after DOM commit. Menus (content-sized, portal-mounted, size-animated) get runtime dressing: a MutationObserver + frame-loop reads `--kui-floating-w/-h` — the *final* size, known on frame one — builds a per-size map, and attaches a stylesheet rule, so the pane refracts during the entry instead of popping after it.

**The glass anatomy** (outermost in): contact + drop + blast shadows and a bottom inner pool; a 1px gradient **rim** that tracks the pointer — every pane measures the angle from its own center to the cursor and eases toward it with shortest-arc damping (a single global angle jumped; per-element is what killed the jump); grain, corner bloom, base sheen over the veil; blur + saturate + brightness in the body. Corners are `corner-shape: squircle` where supported, with a standing exception: **a capsule is already its own curve** — squircle math at a 999px radius bulges square, so pills, and later the glass buttons, stay `round` (the rim pseudo-element must be excepted *with* its box; `corner-shape` does not inherit).

**Menus wear the material** with their own scaled parameters (`--l2m-*`): the card recipe at ~70% shadow reach, rim at 60% opacity (full flare read as costume on a small dense box), dark veils lifting toward white. Their entry animation is amped in the lab only — a bouncier spring with visible overshoot that deliberately breaks §8's one-crossing damping law; it is a judgment call waiting on Kushagra, not a decision.

**Performance is a structural boolean, not a quality dial.** True glass pays a backdrop readback per pane; the proposal is a per-component `layered` prop (Box's `container` shape): the *theme* owns what the material is, the *component* states the layout fact "content flows under me." `layered={false}` renders the **sealed** composite — same veil color-mixed over the page color, same rim, grain, and shadows, zero readbacks. The stress test (pane count × layered count sliders, live fps/worst-frame meter) is the judging surface; the budget on slow hardware is Kushagra's to run.

## Buttons — the Lit rung, built today

**Rung 2 is not a new Button look.** The package already ships the switch: `--kui-control-chrome` (cast) and `--kui-control-light` (catch) are the world tokens `depth="elevated"` declares; loud reads both, medium refuses the catch (the fog rule), quiet declares none, disabled stands the world down. The lab's Lit rung is those two names handed the *new* primitives — contact line, diffuse blast at button scale, bottom shade in light, face light on saturated fills — and everything else fell out of shipped machinery, verified by computed style. A press tightens the blast as the button travels toward the page. The old elevated look (shadow row 2 + gradient wash) appears nowhere; that is the point.

Findings on the way, each measured:

- **The bottom shade keys to the fill's darkness** — invisible inside black and red, a drawn line on pastel. Medium runs it at 0.04. The first fix tried a `var()` dial inside the world token and it *could not work*: a `var()` inside a custom property substitutes at the **declaring** element, not the consumer — §6's substitution-at-declaration trap, re-committed and re-measured. The rung re-declares chrome on the element instead.
- **Glass buttons** are quiet's empty box given a real pane: veil, grain, blur, rim, and the pointer light arrive with the class; shadows re-scale to a 32px caster. **Hover on glass is light, not a fill step** — the package's quiet-hover was swapping the veil for a grey pastel because a button's hover steps `background-color` and the veil *is* the background-color slot. The veil is pinned through rest/hover/press; hover moves brightness only, smaller in dark.
- **Control surfaces price the material at their own scale** — the card's blur turns a 40px window to mud. Third family to re-price (card, menu, control), which is the shape the config port wants: one materials table, per-family cells.
- **Loud through the glass, one rule for ten families.** The Button's own `tone` prop stamps the indirection; `--tone-solid`/`--tone-contrast` resolve per family, and hover/active step through the family's own hover/active solids — §10's "material re-derives from the same sources" worn by glass. No per-color CSS exists.
- **Vibrancy has a gamut wall.** The pigment runs hotter than the flat solid via relative color (`oklch(from var(--tone-solid) …)`). At 1.45× chroma, orange clipped out of sRGB and rendered *red* — measured, and it is what bounds the boost. Grey accent is immune by construction (chroma ≈ 0 scales to ≈ 0: smoke stays smoke).
- **Dark vibrancy is glow, not chroma.** Dark's family solids are designed milder, so chroma boosts barely move them; the lever is a lightness lift (×1.12 dark vs ×1.04 light), carried per-panel as a constant, not a slider.
- Scenes: Stacked vs Lit side by side (disabled riding along to prove the stand-down), Lit over the grid, glass ranks over the plain page / the river (moving tiles — quiet glass drinks the passing color, loud holds its pigment) / the checker / a photograph.

## The dials, and the recommended defaults

Every number above is live in the sticky bar: the lens row (profile, bezel, thickness, index, fringe, boost, specular, frost) plus a material row with an **Editing: light / dark** toggle — each mode owns a full knob-set, each panel permanently wears its own. Multipliers, 100 = the designed cell.

| Dial | Light | Dark | Dark's reason |
|---|---|---|---|
| Surface veil | 85 | 95 | Light's milk was pre-refraction pricing; dark keeps a touch less black film |
| Surface blur | 100 | 100 | Frost lives on the global dial (20%) |
| Surface saturation | 115 | 130 | A black veil mutes the backdrop harder than a white one |
| Surface sheen | 85 | 55 | White milk on dark glass reads as grey film |
| Control veil / blur | 100 | 100 | Control cells were priced at their own scale, same day |
| Control saturation | 100 | 125 | Small dark panes lose color fastest |
| Control sheen | 100 | 80 | Same film, smaller box |
| Loud pigment (α) | 80 | 85 | Kushagra's judged pair in light; more body against the black bed |
| Loud chroma (×) | 160 | 160 | Chroma is not dark's lever — the lightness lift is |

## Package changes riding in the working tree

Real, uncommitted, each with its story:

- **The floating entry is rewritten: a panel FORMS** (`system/surfaces.css`). The unfurl-from-a-seed morph was judged out on sight — *"a rigid body conjured up… as a result of that inertia, it stretches"* — a finished object ported into place. What replaced flight is presence: born at final size in final place, opacity condensing, a small scale settling out of the anchored corner (which IS the trigger's corner), the cast fading up. The verdict landed the day the body's counter-squish started actually running — because of the next item.
- **A dangling var had disarmed the body squish since it shipped**: the transition read `var(--floating-rise)`, a token that never existed (`--motion-rise` does). Nothing failed; the animation was silently instant. **Debt, named:** a law that walks component stylesheets for `var()` names that resolve nowhere, and a LOG entry for both this and the forming reversal, in the commit that lands them.
- **The scrim never blurred in the app** (`dialog.css`, `scripts/build-css.mjs`): a hand-written `-webkit-backdrop-filter` beside the standard property parses as the *same logical property*, and Lightning kept the last spelling — dist shipped webkit-only, which Chromium ignores, while every law read the committed source and stayed green. Sources are unprefixed-only now; the build asserts it three ways (no hand-prefix in sources, no prefix-only block in the artifact, the scrim's declaration survives verbatim).
- `budget.json` re-recorded 24323 → 24321; `shell.test.tsx` BARE set grew `lab`, `lab2`, `lab3`; menu/select browser tests updated for the forming recipe.

## Open, in one place

The `layered` prop port (theme materials table per family × mode, depth rungs, sealed composite, per-size displacement maps in the token pipeline — "say when"); the bouncy menu spring vs §8's one-crossing law; the stress budget on slow hardware; text legibility over photo beds at frost 20; refraction is Chromium-only (Safari/Firefox get the blur-chain fallback — acceptable for a lab, a decision for a port); the labs' deletion when the recipes move.
