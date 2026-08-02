# KookieUI v2: Design Decisions

Living document. Captures decisions and rationale as we make them. Numbers in token examples are illustrative unless marked final.

---

## 1. Headless foundation

**Decision: build on Base UI, wrapped behind our own component surface.**

Base UI is the Radix Primitives successor from the same lineage (Radix, Floating UI, MUI contributors), backed by MUI with a long-term maintenance commitment. It solves the specific Radix pains:

- `render` prop instead of `asChild` (explicit composition, no ref-merge weirdness)
- Floating UI native (configurable popover/tooltip/select positioning)
- First-class exit animations and unmount handling (no `forceMount` hacks)
- Real form and field primitives with validation wiring

What we control is the **API boundary**, not the implementation. Base UI is a swappable dependency sitting behind the Kookie component surface. This is the "separate design layer" thesis applied one layer down. If Base UI ever stalls the way Radix did, we swap the layer and the Kookie component API is untouched. Low-regret by construction.

**Current state (June 2026):** v1.6.0, stable since Dec 2025, 35 components under `@base-ui/react`. The maintenance trajectory is the reason to commit: Radix (WorkOS-acquired) has slowed on complex components (Combobox, multi-select cited); Base UI is now the actively maintained primitive layer. Recently matured exactly where headless is hardest: Drawer and OTPField graduated to stable, mount/unmount performance up 50%/85%, iOS VoiceOver and NVDA fixes, nested-menu focus fixes.

**Risks (accepted, mitigated by the wrapper):** young (~6 months stable), API more verbose than Radix, a few components just left preview.

**Optional learning track:** hand-roll one or two primitives (Tooltip, Dialog) behind the same API as a React exercise and an escape hatch. Not a reason to reimplement the whole primitive layer before the move.

---

## 2. Styling model

**Decision: CSS with custom properties (tokens). Not Tailwind. No utility classes in markup.**

Utility classes inline design decisions at every call site, so there is no single source of truth for layout rhythm and no enforceable boundary between library and consumer. Disqualifying for a published design system. (Tailwind remains fine for product teams where the markup *is* the design artifact and nobody publishes an API. Wrong tool for our layer, not a bad tool.)

**On Tailwind's token generation, which we do like:** `radius-[4px]` and `radius-xl` are build-time JIT output, frozen values. CSS custom properties give the same "don't ship every permutation" benefit at **runtime**, and reactively:

```css
--radius-3: calc(8px * var(--scale));
```

`var(--radius-3)` resolves live in the browser and recomputes when Theme factors change. No build step, no JS.

Key consequence: we have **no permutation explosion** because we ship no utility classes. The no-classes-in-markup decision is the same decision that removes any need for a JIT compiler. We define a small set of base tokens once; everything references them by name.

Build-time tooling (Style Dictionary or a small script) is used for *authoring* tokens from a config (base + ratio + steps), and for the color pipeline (section 7). Separate concern from runtime resolution.

### CSS output strategy (no bulky all-permutation CSS)

**Priority: the shipped CSS must stay small. Radix Themes' large output is the anti-target.**

Diagnosis (where Radix's bytes actually are): Radix's *component* CSS is already lean and token-driven (one set of rules per component reading `--accent-*` vars, not 30 precompiled color variants). The weight is the **colors** — it ships all ~25-30 accent scales, each in light, dark, P3, and alpha, so every color is declared 4-8 times as a full 12-step scale, and you carry all 30 whether you use one or none. That color-token mass is the bulk. So the optimization targets color output and keeps component CSS additive.

**Measured correction (2026-07-31, v1 shipped output):** ~91.5KB gzipped total; component CSS ~55KB+ of it, dominated by responsive prop utilities (`sidebar.css` alone 48KB raw); all tokens ~13KB; color scales ~2.8KB. In the shipped fork the bulk is not colors — it is the responsive-utility mass. Both masses have structural answers: colors by generation (reason 2 below), responsive props by variable remap (below).

Four structural reasons KookieUI stays small (all already decided):

1. **Semantic tones, not 30 arbitrary colors.** `tone` is a closed set (neutral, accent, destructive, maybe success/warning/info) ~ 5-6 scales, not 30. There is no open per-component `color` prop forcing all scales to ship (color-scarcity decision, sections 7 and 9). The one arbitrary brand hue is the single configured accent. This alone cuts color mass to ~1/6 of Radix before anything else.

2. **Generated, scoped output (the real differentiator).** Colors are generated at build time (section 7), so the build emits **only** the configured tones, **only** targeted modes (light/dark), **only** wanted gamuts (P3 gated behind `@supports`, droppable), and the alpha ramp **only** where surfaces need it. Output size is a function of config, not a fixed constant. Radix is a precompiled artifact and structurally cannot do this.

3. **Component CSS is additive, not multiplicative.** Emphasis rungs are shared role-token bundles defined once globally and reused across components in a category (section 8): `[data-emphasis="medium"]` sets bg/fg tokens; Button, Badge, Select all read them. Sizes set `--control-height`. Total is roughly `O(components + rungs + sizes)` as small token-setting rules, never `O(components x rungs x sizes x tones)` as full rules. The combinatorial explosion collapses into addition because variation lives in token *values*, not duplicated *rules*.

4. **No utility classes** (this section) so no Tailwind-style utility permutation.

### Responsive props: variable remap, not utility classes

**Decision: responsive props (`gap={{ initial: "2", "@md": "4" }}`) compile by variable remap.** The component writes tier values as inline custom properties (`style="--kk-gap: var(--space-2); --kk-gap-md: var(--space-4)"`); the stylesheet ships a fixed set of arbitration rules per prop — the base rule reads `--kk-gap`, each tier's rule prefers its own var and falls back down the chain. Values never appear in the stylesheet, so:

- CSS cost is O(props × tiers), ~constant forever. The token dimension — the multiplier behind v1's 55KB — is gone; adding tokens costs zero CSS.
- Raw strings ride the same pipe free (`gap="13px"` inlines like any token), which pregenerated classes structurally cannot do.
- The mechanism is value-agnostic, so structural props (`direction`, `columns`, `display`, `areas`) remap identically to spacing.

Two requirements: register every `--kk-*` remap var with `@property { inherits: false }` (custom properties inherit; a nested Flex without `gap` must not silently read its parent's), and prove the mechanism on Box alone, measured, before any other layout primitive ships (section 14).

**Tiers are container-keyed and few.** `@md` is a container-width tier resolved by container queries, not a viewport breakpoint — a component adapts to its slot, so the same Grid is correct in a drawer and a main column. Both native platforms converged here (iOS: 2 size classes; Android: 3 window classes; neither has per-prop pixel breakpoints): keep the tier count small and the names semantic. Only Shell and page-gutter concerns key off the viewport. `--kk-*` vars are private plumbing — undocumented, unstable, never for consumers (section 13).

The file is small by construction, not by post-hoc minification. Process the output with **Lightning CSS** (minify, autoprefix, nesting).

**Budget and validation:** set a hard target (e.g. core CSS under ~30-40KB gzipped for a typical config), measure in CI, fail the build on regression. Validate early — the first component built (Button) gets its CSS measured to prove the variant-as-token-remap thesis before scaling to the full set.

Optional later: per-component CSS modules for granular tree-shaking. Likely unnecessary because the monolith is already small; revisit only if measurement says otherwise.

---

## 3. Spacing and layout

**Decision: components never own outer spacing. No margin prop on Button et al.**

Margin is a property of the relationship between elements, not of the element. Inter-element spacing comes from layout primitives (Flex, Stack, Grid) via `gap`. This diverges from Radix Themes (which ships `m`, `mx`, `mt` on everything) on purpose; matches Braid's "margin is a component smell" position.

**Escape hatches (friction must redirect, not just annoy):**
- Preferred: wrap in a layout component (`<Box m="4">`). The positioning concern lives in a layout element, the markup honestly shows a one-off hack.
- Per-component: a single loud override prop (working name `UNSAFE_` / `override`). The naming is the design.

**Hard dependency:** this only works if layout primitives are excellent. We remove the easy bad path, so the good path has to be effortless. Gap-based Flex/Stack/Grid on a spacing scale, good defaults.

### Spacing scale

Two layers, structurally parallel to radius (section 6):

**Space palette (the free layout currency).** Gap on Flex/Stack/Grid, Box padding. Hybrid curve: fine and near-linear at the bottom (12, 16, 24 are all distinct and used constantly), geometric and sparse at the top (80 vs 88 is imperceptible).

```css
--space-1:  2px     --space-7:  32px
--space-2:  4px     --space-8:  40px
--space-3:  8px     --space-9:  48px
--space-4:  12px    --space-10: 64px
--space-5:  16px    --space-11: 96px
--space-6:  24px    --space-12: 128px
```

~12 steps because spacing spans nearly two orders of magnitude, unlike radius's bounded ~4-32px range. This is why Radix ships ~9 space tokens but only 6 radius tokens. The step count is set by dynamic range, not copied from the size count.

**Control padding (semantic, size-indexed, references the palette).** Inline padding inside controls:

```css
--control-px-1: var(--space-3);   /* 8px  */
--control-px-2: var(--space-4);   /* 12px */
--control-px-3: var(--space-5);   /* 16px */
--control-px-4: var(--space-6);   /* 24px */
```

Controls have **no vertical padding token** (height + center, per section 4). Surfaces (cards) take both axes via their own `--card-padding` referencing space steps.

**Rule: do not numerically align across scales.** `--space-2` (4px), `--radius-2` (6px), and `--control-height-2` will not match and should not. The alignment that matters lives in the **size index** (a size-2 control pulls control-px-2, control-height-2, radius-control-2 together), not in raw palette numbers matching across families. Forcing space-N = radius-N is the fragile-coincidence trap one layer over.

### Layout primitives

**Decision: a small, stable set of primitives that curate CSS, not mirror it. Parity with CSS is an anti-goal.**

Chasing the CSS surface in props is unwinnable by construction (CSS is a growing spec of hundreds of properties). The primitive's job is to make common, on-system layout effortless and route the long tail to raw CSS without shame. Radix Themes already implements this model (and is why these primitives feel right); KookieUI adopts it with three divergences: margin props live **only** on layout primitives (Radix puts them on most components, which section 3 rejects), the space scale is 1-12, and composition is Base UI `render` (not `asChild`). Responsive object syntax is kept (matches Shell's colocated-responsive API).

**The set (finite, pinned to intents, does not grow when CSS grows):**

`Box` `Flex` `Grid` `Stack` `Container` `Spacer`. (Optional later: `Section` for page vertical rhythm.)

All of them are thin typed wrappers over Box: they preset `display`, narrow the prop types to what their layout model uses, and name the intent in markup. Same CSS, same mechanism, zero added bytes. The narrowing is the point — raw CSS accepts every property on every element and ignores the wrong ones silently; the named primitives are where that becomes a type error and where the library adds enforcement over the platform. Box underneath stays fully capable for the cases the narrowed types would forbid.

**Prop taxonomy — four buckets, this is the whole design:**

```
TOKENIZED (space scale OR raw-string escape)    Responsive<SpaceToken | string>
  gap gapX gapY                                  Flex / Grid / Stack
  p px py pt pr pb pl                             all
  m mx my mt mr mb ml                             LAYOUT PRIMITIVES ONLY
  inset top right bottom left                     position offsets

PASS-THROUGH CSS (freeform, no token)            Responsive<string>
  width minWidth maxWidth
  height minHeight maxHeight
  flexBasis

STRUCTURAL KEYWORDS (fixed enum set)             Responsive<enum>
  direction align justify wrap                    Flex / Stack
  columns rows areas flow align justify           Grid (columns/rows/areas also accept raw string)
  position display overflow overflowX overflowY
  flexGrow flexShrink                             flex-child control, on any layout primitive

ESCAPE (always forwarded, the long tail)
  className   style   render
```

Token is the on-system spelling (`gap="4"` -> `--space-4`); the `| string` on the **same** prop is the inline exit (`gap="13px"`), so you never hit a wall. width/height are pure CSS strings (there was never parity to chase there). Anything uncovered is one `style={{ ... }}` away. A new CSS property ships -> do nothing, it already works via `style`. This is the property you never maintain.

**Per-primitive surface:**

- **Box** — the engine and escape hatch. The full curated prop set: tokenized spacing, pass-through sizing, structural position/display/overflow, flex/grid-child props, **and the container props** (`display`, `direction`, `columns`, gaps, …). `display` is responsive like any prop, so a flex↔grid switch per tier is legal — CSS ignores inapplicable properties, so both modes' props coexist inertly. `render`, `className`, `style`.
- **Flex** — Box props + `direction`, `align`, `justify`, `wrap`, `gap`/`gapX`/`gapY`.
- **Grid** — Box props + `columns`, `rows`, `areas`, `flow`, `align`, `justify`, `gap`/`gapX`/`gapY`.
- **Stack** — opinionated Flex: `direction` defaults to `column`, gap is the primary prop, plus `align`/`justify`/`wrap`. The most-reached-for primitive; removes the flex+direction+gap boilerplate. (Radix has no Stack; this is an addition.)
- **Container** — `size` (1-4, max-width tokens for a readable measure) + `align` + margin/padding/display. Centers and width-constrains.
- **Spacer** — flex-child filler: `size` (space token) or grows to fill the remaining axis.

**Composition:** `render` (Base UI) replaces Radix's `asChild`, so a primitive's layout behavior wraps any element without adding a DOM node — consistent with section 1.

**Margin boundary (the Radix divergence, restated for emphasis):** Radix ships margin on most components; KookieUI ships it ONLY on these layout primitives. A Button has no `m`; `<Box m="4"><Button/></Box>` is the sanctioned one-off. Layout owns spacing; the escape is a layout wrapper, never a margin prop on a control.

**Enforcement is a gradient, not a wall.** `className` and `style` stay forwarded everywhere; consumer `style` merges last (an escape that loses to the default is not an escape). Nothing technically stops `className="mt-12"` on a Button — no component API can prevent CSS from styling DOM. The system's leverage: it ships no utility vocabulary (section 2), the blessed path is easier than defection, and defection is visible — one string search, one shipped lint rule (`no-spacing-utilities-on-controls`), one obvious thing in review. Braid locks `className` down entirely; we keep the escape and police it with the linter. Same contract as tokens: nothing stops `8px`, the system makes `var(--space-3)` more attractive.

**Reconciliation with the site's DESIGN.md** (which rejects the Box/Flex/Stack suite as "a layout DSL moving visual decisions into markup"): in Astro, scoped CSS is the enforceable layer, so primitives would be a leak around it. In a published React library, the component API is the only enforceable surface — the primitives *are* the enforcement, not the leak. Same principle (decisions live where they can be reviewed), opposite conclusions per medium. The two documents do not argue.

---

## 4. The size system

**Decision: `size` is an index, not a measurement.**

`size="2"` means "the second step, the baseline." It does not mean 32px. 32px is the current resolved value of that step, and resolution lives in a layer the consumer can remap.

A component reads several independent scales, all indexed by the same `size` prop:

- height from `--control-height-N`
- label from `--font-size-N`
- inline padding from `--control-px-N`
- corner from the control-radius family (see section 6)
- gap from a `--space-N` token

The pixel value lives only in the height family. Text lives in a separate family. That separation is what lets height move to 40px while text stays at size 2.

**Fixed-height controls** (Button, Input, Tabs, Segmented Control, Select trigger):

```css
height: var(--control-height-2);
display: inline-flex;
align-items: center;
/* inline padding only; vertical padding does not exist as a concept */
```

Contents center in whatever height the box is. "Make size 2 = 40px" becomes one line, text untouched, everything re-centers free.

**Anchor-based derivation** so one knob moves the set:

```css
--control-height-base: 32px;
--control-height-1: calc(var(--control-height-base) * 0.875 * var(--scale) * var(--density));
--control-height-2: calc(var(--control-height-base) * 1     * var(--scale) * var(--density));
--control-height-3: calc(var(--control-height-base) * 1.25  * var(--scale) * var(--density));
--control-height-4: calc(var(--control-height-base) * 1.5   * var(--scale) * var(--density));
```

**Non-fixed-height components** (cards, table cells, callouts, textareas): padding is the dimension. They rescale via padding anchors, not height anchors.

**Split Radix's single `scaling` knob into independent axes:** control density, type scale, radius, each with its own anchor. Keep a convenience that moves them together for the simple case.

---

## 5. The Theme component

### Props

```
appearance     light | dark | inherit          color scheme; inherit enables nested dark sections
material       off | on (policy)               global translucency gate; CAPS per-component material (section 10). aka allowTranslucency
accentColor    <brand color>                   hue that tone="accent" resolves to; input to the color generator (section 7)
grayColor      <neutral>                        low-chroma accent from the same generator; tone="neutral" hue
contrast       default | high                  drives borders/dividers too, resolves per appearance
radius         none | small | medium | large | full   selects a designed radius palette (section 6), not a factor and not a token pick
density        compact | default | comfortable  selects a designed control-family set (height, px, gap, radius); never type, never the space palette (section 12). Theme-scoped only: an airy region is a nested Theme on an element you already have (via `render`), not a per-component prop, which would duplicate `size`
scale          (deferred, see below)            global zoom: type, height, spacing, radius together
font           mono | sans | serif             shorthand: sets heading + body
fontHeading    "
fontBody       "
fontMono       "                               third slot for code, kbd, pre
hasBackground  boolean
reducedMotion  user | always                   global override beyond prefers-reduced-motion
```

Deferred: `scale` (the factor stays wired, no prop yet — below). `dir` / RTL. Leave room, do not half-build.

Note on `material`: this is the **policy ceiling**, not the per-surface choice. It answers "is translucency allowed in this tree." The per-component `material` prop (section 10) is the usage; Theme caps it. Naming is open (`material` vs `allowTranslucency` vs `materials`).

### Behavior (not props)

- **Nestable, inherits unspecified props from nearest ancestor Theme.** Subtree theming (a section with a different accent, a forced-dark card, a denser toolbar) is a top use case. Match Radix's inheritance.
- **Renders a real DOM element** (needs a node to scope the CSS variables). Offer a `render` escape so it does not force an extra wrapper where unwanted.

### density vs scale

Two different ideas, deliberately not collapsed, and only one of them ships:

- **`density` = breathing room at a fixed type size.** A designed set per level (section 12), a real Theme prop. Grows the box, holds the label. This is the case people actually reach for, and it is why `size` (which moves type too) is the wrong tool for a taller button.
- **`scale` = global zoom, type included.** Still a multiplier: `--scale` defaults to 1 and stays wired through every length token, so the door is open and anyone can set it. There is no Theme prop yet. Global magnification is browser zoom's job today, and shipping a knob whose steps nobody has needed would make it the one factor in the system producing arbitrary products. At `--scale: 1` every token resolves to exactly its designed integer, so keeping the wiring costs bytes and nothing else.

If `scale` ever earns an API it arrives as designed steps, the way density did, not as a free number. That change would strip the multiplier from the calcs, so the current wiring is a cheap bet on the cheap model, reversible in one generator edit.

---

## 6. The radius system

**Decision: geometric (non-linear) scale, semantic tokens for consistency, stepped for controls and flat for surfaces.**

### The curve

Radius is perceptually non-linear. Fine steps at the small end (controls, eye is sensitive), spread out at the large end (30 vs 32px on a card is invisible). Grow geometrically, ratio ~1.4:

```css
--radius-0: 0px
--radius-1: 4px    \
--radius-2: 6px     |
--radius-3: 8px     |  the CONTROL band — density picks a step from here
--radius-4: 10px    |
--radius-5: 12px   /
--radius-6: 16px   \   the SURFACE band — --radius-surface, --radius-overlay
--radius-7: 24px   /
--radius-full: 9999px
```

### Three count ceilings, all different, do not conflate

- **Size system caps at ~6 by maintenance cost.** Each size is real surface area (height, font, padding, radius, tested per component).
- **Radius palette caps at ~6 to 8 by perception**, where the curve goes visually flat (~24 to 32px). Above that the eye reads "pill," not "rounder." A scale longer than this becomes a ruler, and a ruler is just px with extra syntax.
- **Control-radius family caps at 4 by the size count**, because there is no size-5 control to pair a control-radius-5 with.

The trap is letting the prettiest ceiling (size = 6) silently set the others. They are unrelated. Step count is set by dynamic range and perception, not copied across scales.

### Semantic layer (where consistency actually comes from)

Numeric coincidence ("size 2 uses radius 2") is fragile, it holds only until something is renumbered. Robust consistency comes from references:

```css
--radius-control-1: var(--radius-1);   /* size 1 control, per density level (section 12) */
--radius-control-2: var(--radius-2);
--radius-control-3: var(--radius-3);
--radius-control-4: var(--radius-4);
--radius-surface: var(--radius-5);     /* cards, panels, popovers */
--radius-overlay: var(--radius-6);     /* dialogs, sheets */
```

A Button references `--radius-control-2`, never `--radius-2` directly.

### Two axes, one mapping does both jobs

- **Within a component:** radius tracks size. A size-4 button pulls a bigger corner than a size-2 button, or it reads boxy. **Bigger in absolute terms, not proportionally**: hold the corner near a constant fraction of the box (~0.2) rather than letting it climb with the size index. Measured on the first build, a climbing ratio ran 0.14 at size 1 to 0.25 at size 4 and turned the largest control into a capsule; it also made compact, which reuses radii on smaller boxes, come out rounder than default, which is backwards for a dense mode.
- **Across components at the same size:** radius is fixed. Every size-2 control (Button, Input, Select trigger) pulls the same `--radius-control-2`, so corners are locked identical by the reference, not by coincidence. This is the join that matters in a form.

### Boundaries

- Stepped radius family is a **control** concern (fixed-height family). **Surfaces** take flat `--radius-surface` / `--radius-overlay`, because a card has no size index. Small stepped family for controls, flat tokens for surfaces, not a giant matrix.
- **Do not auto-derive radius from height.** `calc(height * ratio)` re-imports the non-linearity. Each control-radius is a designed value placed on the curve, hand-tuned references.
- **Control radius is part of the density set** (section 12). Density changes visual size enough that a fixed corner reads boxy at the airy end, so each density level places its own control radii — still designed points, never derived from the height.

### The Theme radius prop: designed palettes, not a factor

**Decision: each level (`none`, `small`, `medium`, `large`, `full`) is a designed palette, emitted at build time under `[data-radius]`.** Not a multiplier over one palette, for the same reason density is not one: a factor can only move every step together, so no single corner is correctable, and each radius is supposed to be a placed point on a perceptual curve.

The decisive case is `full`. CSS clamps `border-radius` to half the smaller dimension, so a huge value gives a perfect pill on controls free — but surfaces must be **capped** (a dialog at full must not become a giant lens; Radix caps card radius even in full). One factor cannot do both, because it scales controls and surfaces by the same amount. A designed palette can: at `full`, the control band goes to 9999 and the surface band holds at its medium values.

**Bands are what make the layering safe.** Steps 1-5 are the control band and 6-7 the surface band, disjoint on purpose. Density only ever picks a step; a level only ever says what a step is worth. No token is written by both, so a nested Theme setting one cannot clobber the other — which a cascade-ordering fix would not survive, since a nearer ancestor's custom property wins regardless of source order.

`none` squares everything including `--radius-full`: a kill switch with an exception is not a kill switch.

**The cap sits at `large`'s surface values, not medium's**, and the law is that no step ever gets *smaller* as the level goes up. Capping lower made cards read squarer at `full` than at `large`, which inverts the dial. So `full` means controls become pills and surfaces stop getting rounder — never that they retreat.

---

## 7. The color system

**Decision: keep Radix's 12-step semantic model as the interop surface; generate every value from OKLCH anchors via one law; compile to static variables at build time. No borrowed values, no per-hue hand authoring, no per-state exceptions.**

Stated bar driving this section: **right over shipped; performance and consistency over everything.**

### Keep the 12-step semantic model

The step number is a UI role, not a darkness level: 1-2 backgrounds, 3-5 interactive (rest/hover/pressed), 6-8 borders, 9-10 solid, 11-12 text. This is the industry benchmark and our Radix-compatibility surface. **Do not mutate the scale** (no step 10.5, no 13th step). Extra states live in the role layer above the scale.

### The problem that forced generation

- The solid band (9, 10) has only two steps, but a solid control needs three: rest, hover, pressed. Radix supplies the third via a brightness/overlay composite.
- Step 11 cannot supply the pressed state. It is the *text* role, tuned for legibility on a light background, so it is far darker and far lower in chroma (Orange 11 is a brown). Routing press into 11 lurches the hue.
- Root cause: **soft and solid are two different things wearing consecutive numbers.** There is a real discontinuity at 8 to 9 (chroma jumps, role changes from "tint of the hue" to "the hue itself"). Drawing them as one continuous ramp is a presentation fiction; forcing them to derive the same way is what creates the asymmetry.

### Why one law, not an exception

An apparent exception is a missing distinction. Three responses, one correct:
- Reject hiding the asymmetry in the role layer (paints over it, does not resolve it).
- Reject borrowing Radix tints (inherited values, inconsistent with generated solids by construction).
- Reject the hybrid (two mechanisms *is* the exception).
- Adopt: generate everything from anchors in OKLCH, one transform law for the whole system.

### The spine: one fixed lightness ladder, system-wide

Twelve L values defined once; **every hue uses the identical ladder for backgrounds, borders, and text (steps 1-8, 11-12); the solid band is the one designed exception, below.** This is the entire mechanism by which "red step 9" and "blue step 9" read as the same step. Light mode and dark mode each get their own tuned ladder (dark is a separately tuned ladder, not an inversion).

Illustrative light-mode ladder:

```
1: .99   2: .975  3: .96   4: .945   (backgrounds)
5: .92   6: .90   7: .87   8: .82    (interactive / borders)
9: .62   10: .58                     (solid: rest, hover)
11: .52  12: .24                     (text: low, high contrast)
```

The large 8 to 9 drop is the soft/solid discontinuity, placed on purpose. Solid active derives as a uniform L-delta off step 9 (~.54): rest, hover, active are evenly spaced **by construction**, across every hue. Direction is mode-aware (darken in light, lighten in dark).

**One designed exception: the solid band's L is hue-aware.** A fixed L ≈ .62 solid is mud for bright hues — saturated yellow, amber, lime, mint, sky do not exist at that lightness. Radix hand-places their solid bands at L ≈ .85+ with dark contrast text; the site's color log hit the same wall and hand-darkened bright ramps. Because accent is an arbitrary user hue, a brand yellow **will** arrive. The fix inside the one-law frame: steps 9/10/active take their L from a **bounded, continuous function of hue angle** — deep hues sit at the ladder's ≈ .62, bright hues rise toward ≈ .85 — while backgrounds, borders, and text bands keep the fixed ladder. The function is part of the generator, identical for every hue: still generation, not per-hue hand-tuning. APCA (below) flips the contrast text automatically where the band rises.

The fixed ladder is also what makes the project finite: design the L ladder once, design the chroma curve, then per accent supply only hue and chroma shape. Bounded, not unbounded tuning.

### Per-hue input: two parameters, not twelve colors

A **hue angle** and a **chroma curve** (peak chroma + falloff shape). That is the entire per-accent definition. You author rules and two knobs, never values. Grays fall out of the same generator at near-zero chroma, so tinted neutrals (slate, sage) are just low-chroma accents. One generator produces the whole system, gray included.

### Accent: a hue-driven, rebindable role (and multi-accent)

Two things the question "what accent, and what if I want more than one" fuses but that are separate axes: **how an accent is chosen** and **how many can coexist.**

**Choosing: the user brings a hue; the generator makes it correct.** Unlike Radix (pick one of ~30 named scales), KookieUI's accent is a brand hue the user supplies: `accentColor="#6E56CF"` (a hex or OKLCH triple, or a preset token name if a few are shipped for convenience). The section-7 pipeline (L ladder + chroma curve) turns it into a system-correct 12-step scale. "What accent do I use" is answered by "your brand color," not "which of our 30."

**Multiplicity: accent is a rebindable role, not a hardcoded color.** "Accent" resolves to whatever hue the nearest Theme provides, and Theme nests (section 5). Three cases:

1. **One accent (common case).** Set the brand hue on the root Theme. Done.
2. **A second accent in a section — free, already supported.** A nested Theme rebinds the accent role for its subtree. The component never changes; it reads `--accent-*` and context decides the hue:
   ```
   <Theme accentColor="indigo">
     <Button>Primary</Button>            {/* indigo */}
     <Theme accentColor="teal">
       <Button>Primary here</Button>      {/* teal, same component, no new prop */}
     </Theme>
   </Theme>
   ```
   Appearance-as-resolved-output: the component expresses intent (accent), the Theme decides the value. Same mechanism as a forced-dark nested Theme.
3. **Two accents side by side in one scope — opt-in named slots.** Ship a second always-on accent slot (e.g. `accent` + `accentAlt`, or user-named); a component opts in via `tone="accentAlt"`. Composes with the semantic tones, which are themselves named slots ("destructive" is the red slot).

**CSS cost (the generated-output lever doing its job).** Each always-on accent slot is one more generated scale, so two side-by-side accents is ~2x the accent color mass. Still bounded (you ship 2, not 30), still generated, still tiny next to Radix. Nested-Theme rebinding (case 2) adds scales only for hues actually used in those scopes. The user who declares two accents pays for two; one pays for one; nobody pays for thirty.

**Before reaching for a second accent:** often the "second color" is a semantic role wearing a brand coat (a success green, a warning amber). If so it is already a tone, not a second accent. Push toward the semantic tones first; reserve a true named second accent for genuine dual-brand cases.

**Decision:** ship exactly one `accent` slot plus the semantic tones by default; support nested-Theme rebinding for sectioned multi-accent at zero added API; expose named extra accent slots as the sanctioned dual-brand path, each honestly costing its own generated scale.

### Gamut policy: hold lightness, reduce chroma

**Lightness is sacred** — the consistency guarantee lives in the L ladder, so L can never move to absorb a clamp. Chroma is the give. Shape the chroma curve to **follow the gamut boundary** (peak in mid-lightness, taper toward both ends) so most steps are in-gamut by construction; hold-L-reduce-C only mops up residual clipping. Detect out-of-gamut steps in the build pipeline and apply the mapping explicitly, rather than letting the browser clamp per hue at runtime.

### Contrast token: APCA-computed

White-or-black on each solid is computed by the generator via **APCA**, not WCAG 2 ratios. We left sRGB because its contrast math is perceptually wrong; WCAG 2 carries the same wrongness.

### Brand fidelity: step 9 pins to the input

**Decision: in light mode, the supplied accent hex reproduces exactly as step 9.** The solid-band L function evaluates locally through the input's own L (clamped to the band's bounds), so the brand color *is* the button, not a normalized cousin of it. Inputs outside the bounds snap to the nearest in-bounds value — a near-black or near-white "brand color" was never usable as a solid. Dark mode derives from the same hue + chroma shape with no pinning; no brand promise exists on a dark solid. Edge behavior near the bounds: tune when the generator is built.

### contrast="high": an accessibility setting, not a design knob

**Decision: `contrast` is a Theme-level accessibility preference and nothing else. There is no per-component `highContrast` prop.**

Radix's per-component version is a *role remap* — it changes which step a role reads — and it exists to escape a step 11 placed at a threshold. Both of its real uses (the grey solid, the under-weight label) are fixed properly in the role layer above, so what remains would be an appearance escape hatch, which contradicts appearance-as-output and would grow a boolean on every component whose meaning shifts per rung. It does not ship.

The Theme setting is a *value shift*: the generator emits an override block scoped to `[data-contrast="high"]`, re-declaring only the affected bands — borders (6-8) strengthened, text bands pushed toward the extremes, solid state spread widened — by fixed per-mode deltas. Cost: a fraction of one scale per tone, shipped by default so the setting works at runtime; a config flag can drop it. One law, one delta table, no second ladder. It should also honour the platform signal (`prefers-contrast: more`) rather than waiting to be set by hand.

### Output: static, compiled, P3

Generate the 12 steps in TS / Style Dictionary at **build time**; emit plain `--accent-N: oklch(...)` custom properties. The browser does **zero color math at runtime** (the performance answer). Emit P3 with sRGB fallback; flag out-of-gamut steps in the pipeline. Runtime `oklch(from var(--base) ...)` survives only as an **optional** layer for a user's live arbitrary brand hex, where reactivity earns the paint cost. Shipped accents are static.

### Role layer (what components consume)

Components reference roles, never raw steps and never the generation mechanism. Also emit an **alpha ramp** (`--accent-a1..a12`) for surface nesting (section 10):

```css
--accent-soft / -soft-hover / -soft-active      /* tint states */
--accent-solid / -solid-hover / -solid-active   /* solid states */
--accent-border
--accent-text                                   /* step 11: links, prose on a tint */
--accent-label                                  /* generated between 11 and 12: UI labels */
--accent-contrast                               /* APCA-computed text on solid */
--accent-a1 ... --accent-a12                     /* alpha scale, composites over backdrop */
```

Press darkens the `background-color` token, **never** `filter: brightness()` (which would dim the contrast text and icon with the fill). The pressed state is a real token, so the label stays crisp.

### Two role remaps that stop `highContrast` from ever being needed

Radix ships a per-component `highContrast` prop because its step 11 is placed at a *floor* — the minimum that clears 4.5:1 on the backgrounds it sits on — so the prop is an escape from a value tuned to a threshold rather than to how it should look. We generate and verify with APCA, so the default can sit where it actually looks right and still be provably legible. Both fixes live in the role layer; **neither touches the scale**, and that constraint is what makes them correct.

**1. A UI label is not a link.** `--accent-text` (step 11) stays as it is, because links and prose on a tint genuinely want the lighter, more chromatic value. Button and control labels instead read `--accent-label`, generated between 11 and 12: enough weight to read as a UI label, enough chroma to still say accent rather than ink. This is the section's own rule about extra states living in the role layer above the scale, not as a step 11.5.

**2. Prominence comes from chroma or from lightness, and at zero chroma lightness does all the work.** A mid-grey solid never reads as loud no matter how correct its lightness is, because it has no saturation to carry prominence. So for scales below a chroma threshold, `--accent-solid` resolves to **step 12** rather than step 9. Keyed on chroma rather than on the name "neutral", so a user's desaturated brand accent gets the same correction. In dark mode step 12 is near-white, so the neutral primary becomes a light button with a dark label, which is what the pattern looks like everywhere it ships.

**The ramp runs out at 12**, so a low-chroma solid's hover and press cannot be +1/+2 steps. They derive as generated L-deltas off step 12, exactly as `--accent-solid-active` derives off step 9 for chromatic scales. Same mechanism, one more place it is needed.

Neither of these is a prop. A pairing that needs more contrast is a bug in this layer, not a switch for the user to find.

### The tradeoff, accepted on purpose

Uniform lightness across hues forces **non-uniform chroma** across hues (the gamut is not a cylinder). Vivid blues and reds will read more saturated than yellows at the same step. Unfixable. Trading saturation-uniformity for lightness-uniformity is correct for a UI system: lightness governs hierarchy, contrast, and dark mode (must be predictable); saturation variance is cosmetic. Radix buys saturation consistency by hand-tuning every hue by eye; we buy lightness consistency by formula. **Decision made. Do not reopen.**

---

## 8. Variants and interaction states

**Decision: variants and interaction states are shared system primitives, defined once, that components cannot deviate from. Consistency is enforced, not designed.**

The taste in "bland with excellent defaults" lives in the system holding together across components, emphasis rungs, and states, not in any single component. A medium-emphasis Button matching a medium Badge matching a medium Select, at rest/hover/press, with the same transition, is the whole game. This is combinatorial (components x rungs x states), so per-component craft cannot hold it. Encode it once; every component inherits.

### The emphasis ladder is a system concept

Each rung is a named bundle of role-token mappings, defined once and consumed by every component:

```
loud   = { bg: accent-solid, bgHover: accent-solid-hover, bgActive: accent-solid-active, text: accent-contrast }
medium = { bg: accent-3,     bgHover: accent-4,            bgActive: accent-5,             text: accent-label }
quiet  = { bg: transparent,  bgHover: accent-3,            bgActive: accent-4,             text: accent-label }
```

Plus one orthogonal boolean, `bordered`, which crosses every rung:

```
bordered = { border: accent-7 }   /* on quiet this is the old "outline"; on medium the old "surface" */
```

Labels read `--accent-label`, not `--accent-text`: a control label is not a link (section 7). `loud` reads `--accent-solid` rather than step 9 directly, because a low-chroma scale resolves that role to step 12 instead — the ramp position is the role layer's business, not the recipe's.

A medium button and a medium badge match because they read identical tokens, not because they were tuned alike. This is the radius-control lesson: consistency from shared reference, not coincidence. These bundles **are** the color role layer (section 7) surfaced as a recipe.

**Superseded (2026-08-01):** the five-name recipe set `solid / soft / surface / outline / ghost` is dead. It named construction rather than emphasis, and two of its members (`surface`, `outline`) were never loudness levels at all — they were *containment*, which is why they never fit the ladder. See section 9.

### States are uniform steps on the ramp, by one global rule

No rung invents its own feedback amount. The rule: **hover = +1 step, press = +2 steps.** Medium rests at 3, so hover 4, press 5. Loud rests at 9, so hover 10, press the generated active. Quiet rests at transparent, which is not a step, so it enters the ramp at hover: transparent, then 3, then 4 — the same one-step increments from a base of nothing. Absolute colors differ per rung; the *amount* of feedback is identical everywhere. Low-chroma solids are the exception the role layer already absorbs: resting at step 12 there is no room above, so their hover and press come from generated L-deltas (section 7).

**Law: the label must clear APCA against every background in its rung, not just the resting one.** Medium rests on step 3, hovers to 4, presses to 5, and the press state is where a label that only passed at rest fails silently.

### One canonical interaction transition

A single duration + easing, color properties only, no layout animation, applied uniformly. Every hover is the same gesture at the same speed.

### Why uniform steps feel uniform

"+1 step" reads as the same perceived change across every hue **only because of the perceptually-even L ladder** (section 7). On a naive sRGB ramp, one step would read as more change on blue than on yellow, and interaction consistency would silently break per color. The color architecture is what makes uniform interaction feedback possible. The whole system is one decision wearing different clothes.

---

## 9. The component axis model

**Decision: components expose semantic axes that resolve to appearance. Appearance is always output, never input. Each axis is derived from one yes/no about the component's nature.**

This is the Apple lesson done correctly: separate *meaning* from *loudness* from *depth* from *substance*, rather than collapsing them onto one "variant" or "prominence" prop. Naive `primary | secondary | danger` is strictly **less** expressive than soft/solid, because it fuses loudness and meaning and so cannot express a low-emphasis destructive action (a quiet delete link). Apple splits role (`.destructive`) from prominence (`.bordered` / `.borderedProminent`); we mirror the structure, not the glass.

### The axes

```
tone       neutral | accent | destructive | (success | warning ...)   picks the HUE (accent resolves via Theme accentColor)
emphasis   loud | medium | quiet                                      how loud, three rungs
bordered   boolean                                                    containment: separate the control from a busy backdrop
elevation  flat | raised | floating | overlay                         shadow + separation (surfaces only)
material   solid | thin | thick                                       backdrop defense; any FLOATING component, buttons included
states     rest | hover | press                                       the +1/+2 step rule (interactive only)
size       1 | 2 | 3 | 4                                               height index (controls) / padding (surfaces)
```

`appearance` (the actual fill/shadow/blur) is the **resolved output** of (tone x emphasis x bordered x elevation x material), never set directly.

**There is no `variant` prop. `emphasis` is the only loudness axis**, and its three rungs are the recipes — there is no second, rawer naming underneath to escape into. The old five-name set (`solid / soft / surface / outline / ghost`) is dead: it named construction rather than loudness, and mixing metaphors is what made it unmappable to a ladder.

**Why three rungs and not four or five.** A rung must earn a *visible* step or it does not exist. Three stays obviously separable, and matches the roughly three prominence levels iOS ships. This also settles the old blocker honestly: the ladder is no longer stretched to cover recipes that were never loudness.

**Why `bordered` is separate.** Border-versus-fill is *containment*, a different question from loudness, and forcing it onto the ladder was the entire `surface` incoherence. As an orthogonal boolean it reproduces the old range with fewer concepts: `quiet + bordered` is the old outline, `medium + bordered` the old surface. Border does one job — separate the control from a busy background — which is also why it pairs naturally with material (section 10).

```
tone (hue) + emphasis (rung) -> role-token bundle -> scale steps -> generated OKLCH values
```

Same pattern as everywhere: expose intent, resolve to values.

### Axes are derived, not assigned

Questions about a component's nature determine its axis set:
- carries meaning -> **tone**
- an action with loudness -> **emphasis**
- can sit on a busy background -> **bordered**
- has height above the page -> **elevation**
- **can float over content** -> **material**
- interactive -> **states**
- has a size step -> **size**

Answer those and any component's axes fall out, including ones not yet built. **Controls** use tone x emphasis x bordered x states x size. **Surfaces** add elevation. **Interactive surfaces** reuse the control state machine from a subtler base.

**Material is derived from floating, not from being a container** (corrected 2026-08-01). The earlier reading gave material to surfaces only, which was wrong in both directions: a Card sitting in a solid layout has nothing to defend against, and a Button floating over a photo does. Material follows the question "can something busy be behind this," and that question is asked of buttons too.

### What this finally fixes

The system now *knows* what is primary (`emphasis="loud"`), so hierarchy is legible to tooling — a lint rule can flag two loud actions in one scope — which a pure appearance API structurally cannot, because it never learns the button's job. **Hierarchy is convention plus optional lint, not mechanism:** no auto-scoping, no auto-demotion of a second loud button. Silent demotion is the kind of magic that is impossible to debug when it fires wrongly.

### The cost, named honestly

Two axes is a grid, and most cells resolve cleanly because tone swaps hue while emphasis swaps rung. One cell needs a real answer: **`loud + neutral`, the loud grey button.** It is a legitimate and common pattern (a near-black primary), but it breaks on the generated ladder rather than on the axis model — `loud` fills with step 9, and neutral step 9 sits near L .62, a mid-grey that reads secondary or disabled instead of primary. A convincing black button wants roughly L .2. This is the same failure as the bright-hue case in section 7 (a fixed ladder producing a wrong-looking solid for one hue, here for the absence of one), so it is resolved with the solid band, not here.

Name the loudness axis **emphasis**, never "primary/secondary," which smuggles the conflation back in, and never `variant`, which invites the docs to spend forever explaining that the prop is not about looks.

---

## 10. Surfaces

**Decision: a surface is tone x emphasis x bordered x elevation x material. Elevation and material stay orthogonal; height and substance are different questions.**

The cells all populate, which proves orthogonality: solid+flat (opaque inline card), solid+floating (opaque dropdown with shadow, no blur, the common menu), thin+flat (frosted panel over a hero), thick+floating (the glass overlay). iOS fuses material with elevation; we keep them split, because "what it is made of" and "how high it floats" are different questions.

### Elevation: how high

Semantic levels, not numbers, consistent with `--radius-surface` / `--radius-overlay`. Each resolves to a shadow step + border treatment:

```
flat       no shadow, sits in flow         (panels, callouts, inline regions)
raised     small shadow                    (cards)
floating   medium shadow                   (popovers, menus, hovercards)
overlay    large shadow                    (dialogs, sheets, drawers)
```

### Material: backdrop defense (Theme policy x component usage)

**Decision (revised 2026-08-01): `material = solid | thin | thick`, off by default, available on any component that can float — buttons included.**

**Material is backdrop defense, not decoration.** Its job is keeping the foreground legible over whatever is behind it, and it fires only when something floats over busy content. That framing makes the axis testable — does the label survive — instead of aesthetic, and it is why the axis is not surfaces-only: a Card in a solid layout has nothing to defend against, while a Button floating over a photo does.

**`thin` and `thick` are two recipes, not a magnitude dial.** Saturation and opacity do not order monotonically between them, which is what proves they are different behaviours rather than two points on one scale. Every lever in a recipe does legibility work, moving together by defense intensity. Values are tokens (`--material-thick-alpha` and so on), mode-aware, and are v0 defaults to be judged against real backdrops rather than reasoned about:

```
                 bg alpha   backdrop-filter (light mode)                  dark-mode delta
thick   (max)    0.72       blur(20px) saturate(180%) brightness(1.08)    alpha ~0.80, brightness 0.85
thin    (light)  0.55       blur(12px) saturate(150%) brightness(1.05)    alpha ~0.62, brightness 0.90
dim / scrim      -          rgba(0,0,0,0.40) + blur(4px)                  rgba(0,0,0,0.55)
```

Why these and not near-opaque: alpha stays translucent because if you cannot sense the backdrop you should have used `solid`. Legibility comes from blur, saturation, and brightness, not from pushing alpha toward 1. Blur below ~12px lets edges punch through and above ~30px is mush with no depth cue. Saturation is the actual defense: the material's own tint has to dominate so image colours cannot bleed into the label. The scrim's 4px only needs to push the app back, not frost it.

**The brightness floor is load-bearing and its direction follows the label:** dark label means brightening the backdrop, light label means darkening it. That branch is what lets a material control survive an *arbitrary* photo rather than the demo one. It needs no new mechanism — section 7 already computes this signal as `--accent-contrast` (APCA-derived, "is the foreground light or dark on this fill"), so the recipe reads it. The label never moves; the material adapts around it.

**No vibrancy.** We take iOS's concept (a translucency axis, orthogonal to elevation) and skip the glass simulation. Two recipes, not five magnitudes, because ours vary saturation and brightness *against* opacity to make two characters rather than one dial.

Two scopes, **clamped**:
- **Theme `material` = policy ceiling.** "Is translucency *allowed* in this tree." Default permits; can force-off globally (perf, embedded context, illegible backdrop). The global kill switch.
- **Component `material` = per-component usage.** Defaults `solid`; opts in.
- **Clamp:** Theme caps component. `Theme=solid` forces the whole tree solid and ignores a component's `thin`/`thick`, so the kill switch works without hunting.

### Material costs frames, so the levers are architectural

`backdrop-filter` has no cheap implementation; cost is driven by how many elements blur and whether they re-composite per frame. Four rules follow:

- **One glass per stack.** A material control inside a material container is double glass, the same error as double shadow. Prefer the toolbar being the glass and its buttons plain.
- **Prefer material on fixed chrome that content scrolls *under*.** A blurred element that itself moves re-samples its backdrop every frame.
- **Honour `prefers-reduced-transparency`** by falling back to opaque. An accessibility requirement and a performance escape in one.
- **`@supports` fallback to a higher-alpha opaque fill** where `backdrop-filter` is unavailable.

Blur radii are provisional until measured on a mid-tier device.

### Placement is the user's; the library only defines what material looks like

Material is only *situationally* correct — over a solid surface it blurs nothing and reads as a muddy smudge. We neither block it (rigidity leaks) nor stay silent (people ship the smudge and blame the library), so: **allow and guide.** Default `solid` everywhere so nobody stumbles into it, document that material is for controls floating over media or content, and add a dev-time nudge for material-over-a-solid-parent, in the same spirit as the double-glass warning. The bad case and the good case both require someone to type the prop deliberately, and the default is always safe.

**Border and material pair naturally.** Both answer "this control is sitting on something busy" — one by containment, one by defense — so `bordered` composes with any material. Open: whether that border stays opaque or goes translucent with the fill. An opaque edge on glass reads as a sticker; a fully translucent one vanishes over light backdrops. The platform answer is a semi-transparent hairline, usually lighter along the top edge.

### Two surface-only rules controls never needed

**A surface sets foreground context, not just a background.** It colors everything nested inside it. A soft-red Callout sets its text to `--accent-text` (red-11) and muted text accordingly so arbitrary children read correctly; a solid-accent Banner flips children to `--accent-contrast` (APCA) text. Mechanically the surface re-scopes the foreground role tokens (`--color-text`, `--color-text-muted`, `--color-contrast`) on its subtree. Translucent surfaces have a **legibility dependency** solid does not: text contrast rides on the backdrop, so they need a contrast floor (subtle scrim / min backdrop-darkening) or text fails over busy content. This is where "surface sets foreground context" grows teeth.

**Surfaces nest, so default backgrounds to the alpha ramp.** A card in a panel in the page: each level must read distinct from its parent. Use **alpha** backgrounds (`--accent-a1..a12`), not solid steps. An alpha fill composites over whatever is behind it, so stacked surfaces auto-differentiate without per-level color math, and survive over images and translucent materials. This is the surface-specific reason the alpha scale earns its keep. Solid surfaces are the opt-out for an opaque seal. (Distinct from `material`: alpha-for-nesting is the fill *mechanism*; material decides whether the surface *also* blurs to reveal content beyond its parent. Alpha ramp is the resource; material decides how deep through the stack you can see.)

### Interactive surfaces

A clickable card, table row, list/menu item is a **ghost-emphasis control wearing a container**: neutral tone, ghost fill (transparent at rest), plus the +1/+2 step rule from a subtler base (rest transparent -> hover step 3 -> press step 4). Reuse the control state machine; do not invent a surface one. One machine, two dressings.

---

## 11. Per-component defaults

Resting position for each component across the four axes. Dash = axis not exposed (the component's nature lacks that question). Emphasis shown as the rung (resolves to the solid/soft/surface/ghost recipe).

**Controls** (size x tone x emphasis x states)

| Component | tone | emphasis | elev | material | notes |
|---|---|---|---|---|---|
| Button | neutral | medium | - | solid | primary CTA is explicit `loud` + `accent`; material only when floating over media |
| IconButton | neutral | quiet | - | solid | subtle, lives in toolbars |
| Toggle Button | neutral | quiet | - | solid | accent when active |
| Select trigger | neutral | medium + bordered | - | solid | reads like a field |
| Input / Textarea | neutral | medium + bordered | - | solid | border-led |
| Tabs | neutral | quiet | - | solid | active tab takes accent |
| Segmented Control | neutral | medium + bordered | - | solid | selected segment bumps a step |
| Slider | neutral | - | - | - | track low, fill accent |

**Binary controls** (tone x states; emphasis implicit)

| Component | tone | emphasis | elev | material | notes |
|---|---|---|---|---|---|
| Checkbox / Radio / Switch | accent (on) | - | - | - | neutral off, accent on |

**Inert atoms** (size x tone x emphasis; no states)

| Component | tone | emphasis | elev | material | notes |
|---|---|---|---|---|---|
| Badge / Tag | neutral | medium | - | - | often colored, defaults neutral |
| Code / Kbd | neutral | medium | - | - | subtle fill |

**Surfaces** (all four axes)

| Component | tone | emphasis | elev | material | notes |
|---|---|---|---|---|---|
| Card | neutral | quiet + bordered | raised | solid | canonical surface |
| Panel | neutral | quiet | flat | solid | flush (sidebar/inspector body) |
| Callout | neutral | medium | flat | solid | tone-forward, inline |
| Banner | neutral | medium | flat | solid | tone-forward, full-width |
| Popover / HoverCard | neutral | quiet + bordered | floating | solid | thin/thick opt-in |
| Menu / Dropdown | neutral | quiet + bordered | floating | solid | thin/thick opt-in |
| Tooltip | neutral (inverted) | - | floating | solid | exception: high-contrast inverted |
| Dialog | neutral | quiet | overlay | solid | panel stays solid; the backdrop carries scrim + blur |
| Sheet / Drawer | neutral | quiet | overlay | solid | content scrolls under: strong material candidate |
| Toast | neutral | quiet + bordered | floating | solid | tone-forward for status |

**Interactive surfaces** (surface axes + states; reuse control state machine)

| Component | tone | emphasis | elev | material | notes |
|---|---|---|---|---|---|
| Clickable Card | neutral | quiet + bordered | raised | solid | quiet hover overlay atop the raised surface |
| Table row | neutral | quiet | flat | solid | transparent -> hover 3 -> press 4; selected = accent |
| List / Menu item | neutral | quiet | flat | solid | active = accent |
| Command item | neutral | quiet | flat | solid | |
| Sidebar button | neutral | quiet | flat | solid | active = accent |
| Accordion trigger | neutral | quiet | flat | solid | |

**Layout** (spacing only; no visual axes)

| Component | tone | emphasis | elev | material | notes |
|---|---|---|---|---|---|
| Flex / Stack / Grid / Container / Spacer / Shell | - | - | - | - | structural only |
| Box | - | - | opt-in | opt-in | escape-hatch surface; can take surface props deliberately |
| Separator | - | - | - | - | reads a border token |

**Typography** (size x tone x weight; Link adds states)

| Component | tone | emphasis | elev | material | notes |
|---|---|---|---|---|---|
| Text / Heading / Blockquote | neutral | - | - | - | *read* the foreground context the surface sets |
| Link | accent | - | - | - | accent + hover/visited states |

### Four rules generate every row

- **Material is `solid` for everything** in the defaults, and is available on every component that can float, buttons included. `thin`/`thick` are always opt-in, correct only over media or scrolling content. The Apple-rollback lesson hard-coded into the resting state.
- **Tone is neutral for everything** except the genuine accent-default spots: Checkbox/Radio/Switch (on), Link, and the active state of interactive surfaces. Status surfaces (Callout, Banner, Toast) are tone-*forward* by intent but still default to neutral hue until a color is set.
- **Elevation appears only on containers.** Every control/atom shows a dash there; contents inherit depth from their surface, never declare it. One shadow per stack, and by the same logic one glass per stack (section 10).
- **The primary action is always explicit.** No component defaults to `loud + accent`. The loud tinted thing is opt-in so the system guarantees one focal point per context instead of hoping you self-police.

---

## 12. Token resolution and multipliers

### Two distinct multipliers, keep separate

- `--scale`: global zoom. Affects type, height, spacing, radius.
- The Theme `radius` prop is **not** a factor: it selects a designed palette per level (section 6), so `full` can pill the controls while capping surfaces, which no single multiplier can express.

Fold them into one and you cannot express "square but not shrunk."

```css
--radius-1: calc(4px * var(--scale));   /* value comes from the level's palette */
```

### Which multiplier affects what

```
type              -> scale                        (never density)
space palette     -> scale                        (layout gaps, gutters; density never touches it)
radius palette    -> scale, then the radius set   (never density, never height directly)
control family    -> scale, then the density set  (control-height, control-px, control-gap, radius-control)
color             -> neither                      (compiled static; not a runtime multiplier axis)
```

**Density is not a multiplier. It selects a designed set.** Each level (`compact`, `default`, `comfortable`) re-declares the control family — height, inline padding, internal gap, and control radius — as placed values, emitted at build time under a `[data-density]` block. Heights are raw numbers per level; the referencing families move by a step offset into the space and radius palettes, with per-cell overrides where an offset lands wrong. Nothing is a product, so nothing resolves to an arbitrary 26.78px, and every cell is correctable on its own — a multiplier can only move a whole level at once, which makes every taste correction global.

**Radius participates.** A large density delta changes visual size enough that a fixed corner reads boxy; section 6's rule that a bigger control wants a bigger corner is about visual size, not about the size index.

**What density never touches:** the space palette, so compact cannot shrink page gutters (the coarseness section 4 rejects in Radix's single `scaling` knob), and type, which is the whole point — density buys breathing room at a fixed label size, where `size` would move the type too.

**One invariant, law-tested:** for a given size, compact < default < comfortable. Nothing orders across both axes; a comfortable size-2 sitting above a compact size-3 is what density means, not drift.

### Strict dependency direction, no cycles

```
raw px constants
  -> base scale (via --scale; radius and control values come from the radius and density sets)
    -> semantic tokens (--radius-control-N, --radius-surface, --control-px-N, ...)
      -> variant recipes (soft/solid/...) -> components consume via tone x emphasis
         (user-authored components may consume base directly)

color: OKLCH anchors + curve -> build-time generator -> static --accent-N (+ alpha) -> role tokens -> recipes -> components

Theme props drive the factors, the color hue, and the material policy at the top.
```

---

## 13. Public token contract

**Both layers are public, with different jobs:**
- **Base scales** (`--radius-1..6`, `--space-1..12`, `--accent-1..12` + alpha): the palettes, sampled freely by user-authored components. Public, complete, primitive.
- **Semantic tokens** (`--radius-control-N`, `--control-px-N`, `--accent-solid`, the variant recipes, etc.): the convention, for our components and for users building control-like things.

**Why the base palettes must ship:** once users compose their own components, the palette is the contract, not an escape hatch. A user who writes `8px` opts out of the theme (frozen). A user who writes `var(--radius-3)` or `var(--space-4)` stays in, their component reflows with the theme exactly like a native one. The token sells theme-reactivity that a raw value structurally cannot. The base scale's job is to make the themed path more attractive than the hardcoded one.

**The rule users follow:** consume the numbered tokens and the semantic axes; control them via Theme props. Never redefine a resolved token (`--radius-3: 10px` leaves the system). The `calc()` and the color compilation live inside our layer where users do not touch them. Private `--kk-*` mechanism vars (the responsive remap plumbing, section 2) are not part of the contract: undocumented, unstable.

**`--scale` is reserved, not public.** It stays unprefixed because it is the system's one remaining factor and is intended to become public if it ever earns a Theme prop (section 5); `--kk-*` is for plumbing that never will. Until then it is undocumented and unsupported: set it and you own the fractional values that result.

**Tailwind bridge (optional, sanctioned):** for teams that keep Tailwind in app code, ship a preset mapping its theme onto our variables (`spacing: { 4: "var(--space-4)" }`, colors onto `--accent-N`, …). The threat Tailwind poses to the system is its parallel token scale, not its syntax; with the preset, even `mt-4` written by a defector resolves through the token contract and reflows with the Theme. Our own components never use it.

---

## 14. Build order (first vertical slice)

Architecture is locked; open items are tuning values resolved as the component that needs them is built, not before. Build in this order so every layer and the CSS-size thesis are validated before scaling to the full component set.

1. **Scaffold.** pnpm + Turborepo + tsdown (Rolldown/Oxc) + Lightning CSS + Changesets + Vitest. `packages/ui`, `apps/docs`, shared config. The CI budget gate is wired on day one, even while it measures nothing.
2. **Token pipeline.** Space, radius, and type scales first — static calc chains, a day's work, exercising the whole path (config -> generation -> tokens.css -> measurement) with zero research risk. Then the OKLCH color generator: the long pole; budget it at 2-3x anything else, and test with hostile hues (brand yellow, neon lime, near-black navy) before calling the law proven. **Measure with a two-accent config** (alpha ramps x modes x tones) so the budget covers section 7's full output.
3. **Box + the responsive mechanism.** Variable remap, `@property` inheritance guard, the full prop table on one primitive. **Measure its CSS** to prove O(props x tiers) before any other layout primitive ships. (The blocker-1 proof; needs only the space tokens, so it can overlap the color work.)
4. **Theme + layout primitives.** Theme (scoping the CSS vars, nesting/inheritance) + Flex, Stack, Grid as typed sugar over Box. Proves token consumption and the layout layer.
5. **Button, end-to-end.** Full axis model (tone x emphasis x states x size) on one control. **Measure its CSS** to prove variant-as-token-remap (additive, not multiplicative) before scaling. Gated on the remaining pre-Button decisions: focus-visible, disabled/loading, motion tokens, icon sizing (REVIEW.md).
6. **Card, end-to-end.** One surface, proving elevation + material + foreground-context + alpha-nesting.

This slice exercises every layer (tokens -> variants -> control -> surface) and the CSS budget. Everything after it is repetition across the component set.

---

## 15. Typography

**Decision: one indexed font-size family spanning text and controls; line height and letter spacing are paired designed tokens, never derived ratios; three family slots; four weights.**

### Scale

`--font-size-1..9`. Controls consume steps 1-4 through the size index (section 4); Text and Heading span the full range. Hybrid curve like space (section 3): near-linear through the reading sizes (all constantly used, must stay distinct), geometric at display sizes. Illustrative:

```css
--font-size-1: 12px    --font-size-4: 18px    --font-size-7: 30px
--font-size-2: 14px    --font-size-5: 20px    --font-size-8: 40px
--font-size-3: 16px    --font-size-6: 24px    --font-size-9: 56px
```

Anchor-derived off `--font-size-base` (step 3) x `--scale` — never `--density` (section 12). Nine steps, not six: type's dynamic range (12 to 56+) is wider than the control family's, the same reasoning that gave space 12 steps and radius 6 (section 6's ceilings rule).

### Line height: paired, not derived

Each step ships a designed `--line-height-N` (reading sizes ~1.5x, display sizes tightening toward ~1.1). One global ratio is wrong at both ends — the same anti-derivation stance as radius-from-height (section 6). Inside fixed-height controls, line height is 1: the box centers its contents (section 4); leading is a text-flow concern.

### Letter spacing

`--letter-spacing-N`, ~0 through reading sizes, slightly negative at display sizes. Paired with the step, same rule as line height.

### Weights

`--font-weight-regular / -medium / -semibold / -bold` (400/500/600/700). Closed set; `light` deferred until something needs it. Text defaults regular, Heading defaults bold; the `weight` prop takes token names, never numbers.

### Families

Three slots, set by Theme (section 5): `--font-heading`, `--font-body`, `--font-mono`. Components read slots, never raw stacks; the Theme props are the only place a stack is written.

---

## Open questions / deferred

**Color:**
- Tune the actual L ladders, light and dark (current values illustrative).
- Design the solid-band L(hue) function's shape and bounds (the blocker-2 fix; section 7).
- Design the per-hue chroma curve shape (peak + falloff).
- Confirm dark-mode press direction (lighten) and delta magnitude.
- Pick the gamut-mapping implementation details for residual clipping (hold-L-reduce-C chosen; edge behavior near cusp TBD).

**Recipes and axes (sections 8-11):**
- Lock the **elevation ladder** shadow recipes (shadow step + border per level: flat/raised/floating/overlay).
- Judge the **material** recipes against real backdrops: three or four hostile photos, a real control, both modes. Expect blur to move +/-6px and alpha +/-0.1. Confirm the brightness floor actually holds. Measure `backdrop-filter` cost on a mid-tier device before the radii lock.
- Decide whether a material `bordered` edge stays opaque or goes translucent (section 10).
- **Tone set** membership: do success/warning/info earn system-tone status, or stay app-defined?
- The **chroma threshold** below which `--accent-solid` remaps to step 12 (section 7), and the L-deltas for its hover and press. Tuning, not architecture.
- Where exactly `--accent-label` sits between steps 11 and 12, per mode.
- How **`quiet`** actually renders: a faint tint at rest, or bare until hover. Decide at the first real Button, not in the abstract.
- Theme `material` **naming**: `material` vs `allowTranslucency` vs `materials`.

**Radius / layout:**
- Concentric radius nesting (inner R = outer R minus inset P). Apple builds the system around it; we defer to v1+1. Confirmed taste-multiplier.
- Shape-by-size fork: keep one shape with scaled radius (current) vs Apple's capsule-at-large-sizes. Leaning keep.
- Surface size cap in `radius="full"` (confirm clamp for dialogs/sheets).
- Space scale top-out (64 component/section level) vs one fixed scale to 128, with responsive page gutters via `clamp()` as a later layer.

**API:**
- Naming of the per-component escape prop (`UNSAFE_` vs `override`). The name is the deterrent.
- **Density: the numbers.** Heights per level, the step offsets, and any per-cell overrides. Also the level names and count (`comfortable` may understate the airy end) and whether surface padding takes density (lands at Card). Architecture settled (section 12); values are taste, and they need the size-by-density matrix in the docs app before they can be judged.
- **Scale: if it ever ships.** The factor stays wired and the prop is deferred (sections 5, 13). Reopen only when a real need names the steps, and ship it as designed steps rather than a free multiplier.
- RTL / `dir`. Deferred, architectural room left.

**Feel (not ratios):**
- "Balanced" corner feel, tuned by eye per step.
