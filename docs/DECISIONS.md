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

**Measured correction (2026-07-31, amended 2026-08-02, v1 shipped output):** re-measured file by file, gzipped — `styles.css` 127KB aggregate; `components.css` 67KB (dominated by responsive prop utilities; `sidebar.css` alone 47,426 bytes raw); `tokens.css` 36KB; `utilities.css` 25KB; `layout.css` 24KB; and `tokens/colors/` is 31 scales at **29.3KB**, about 1.1KB each.

The original correction put colour at ~2.8KB and concluded the diagnosis above was wrong; that figure was one scale mistaken for the total. Colour *is* a major term and generating only the configured tones earns its place — v2 spends 6,369 bytes on three tones in two modes with alpha ramps, a P3 block and a high-contrast block. What the measurement actually changes is narrower: component CSS is **not** lean in the shipped fork, so responsive prop utilities are the larger mass and the bigger lever. Both have structural answers: colours by generation (reason 2 below), responsive props by variable remap (below).

Four structural reasons KookieUI stays small (all already decided):

1. **A closed tone set, not 30 arbitrary colors.** `tone` is a closed set: the semantic core (neutral, accent, destructive; **success, warning, info completed it 2026-08-05**, Kushagra — each its own family resolving to an already-judged pigment: green's hue, amber's, blue's, so a meaning stays independently correctable without moving the data colour it currently shares a hue with) plus a few basic categorical families (blue, green, orange added 2026-08-04; amber 2026-08-05 at vividness 0.9, the cusp finding — colour-as-data vocabulary for tags, charts, badges) — ten scales, not 30. The set widens only in config, when a component forces it; the palette is never pre-shipped. There is no open per-component `color` prop forcing all scales to ship (color-scarcity decision, sections 7 and 9). The one arbitrary brand hue is the single configured accent. This alone cuts color mass to ~1/5 of Radix before anything else.

2. **Generated, scoped output (the real differentiator).** Colors are generated at build time (section 7), so the build emits **only** the configured tones, **only** targeted modes (light/dark), **only** wanted gamuts (P3 gated behind `@supports`, droppable), and the alpha ramp **only** where surfaces need it. Output size is a function of config, not a fixed constant. Radix is a precompiled artifact and structurally cannot do this.

3. **Component CSS is additive, not multiplicative.** Emphasis rungs are shared role-token bundles defined once globally and reused across components in a category (section 8): `[data-emphasis="medium"]` sets bg/fg tokens; Button, Badge, Select all read them. Sizes set `--control-height`. Total is roughly `O(components + rungs + sizes)` as small token-setting rules, never `O(components x rungs x sizes x tones)` as full rules. The combinatorial explosion collapses into addition because variation lives in token *values*, not duplicated *rules*.

4. **No utility classes** (this section) so no Tailwind-style utility permutation.

### Responsive props: variable remap, not utility classes

**Decision: responsive props (`gap={{ initial: "2", md: "4" }}`) compile by variable remap.** The component writes tier values as inline custom properties (`style="--kui-g: var(--space-2); --kui-g-md: var(--space-4)"`); the stylesheet ships a fixed set of arbitration rules per prop — the base rule reads `--kui-g`, each tier's rule prefers its own var and falls back down the chain. Values never appear in the stylesheet, so:

- CSS cost is O(props × tiers), ~constant forever. The token dimension — the multiplier behind v1's 55KB — is gone; adding tokens costs zero CSS.
- Raw strings ride the same pipe free (`gap="13px"` inlines like any token), which pregenerated classes structurally cannot do.
- The mechanism is value-agnostic, so structural props (`direction`, `columns`, `display`, `areas`) remap identically to spacing.

**Four requirements, and the last two are non-obvious enough that the mechanism was built wrong without them** (found by browser tests, 2026-08-02; all four are law-tested):

1. Register every `--kui-*` remap var with `@property { inherits: false }`. Custom properties inherit; a nested Flex without `gap` must not silently read its parent's.
2. Prove the mechanism on Box alone, measured, before any other layout primitive ships (section 14).
3. **Emit longhands only, never a shorthand.** `padding: var(--kui-p)` followed by `padding-block-start: var(--kui-pt)` does not degrade to the shorthand when `pt` is unset — an unset custom property makes its declaration invalid at computed-value time and the property falls back to its *initial* value. So the shorthand renders 0. Prop specificity (`pt` over `py` over `p`) lives inside one var chain per longhand instead, where it behaves. **This was fixed for padding on 2026-08-02 and left broken for `inset` and `overflow` until 2026-08-03**, both of which shipped as dead no-ops: `<Box position="absolute" inset="0">` shrink-wrapped at its static position, and `overflow="hidden"` clipped nothing. The rule is now a law over the prop table rather than a sentence in it — a shorthand is legal only where no other row feeds a longhand it would swallow, which is why `grid-area` stands and `inset` did not.
4. **Give a fallback to any property whose CSS initial value is not the sensible default.** Same rule, and `display` is the case that matters: `display: var(--kui-d)` with nothing set falls back to `inline`, which ignores width and height and cannot be a query container — so no Box was a container and no tier could ever fire.

The mechanism is generated from one prop table that drives both the resolver and the stylesheet, so a prop cannot exist in one and not the other.

**The costs of container-keyed tiers, named and accepted (2026-08-03; the first three are pinned by laws):**

- **A contained element contributes zero intrinsic inline size.** A bare Box as a flex item at `width: auto` collapses to nothing regardless of content; the escape is any explicit width, `flexGrow`, or `flexBasis`. The block axis is untouched — height-from-content works normally (`inline-size` containment, not `size`), and there is no SSR tier-flash: container queries are CSS, resolved at first layout, no hydration involved.
- **Style-recalc tail at depth.** Every Box is a containment context and the engine re-evaluates container conditions on container resize — on resize only, not on paint or scroll. Two things bound it: the arbitration rules are O(longhands × tiers) and never grow with tokens, and layout containment is itself an isolation win, since a change inside a contained subtree cannot invalidate layout outside it. Unmeasured at depth all the same; measured for real when the docs app has a deep tree. Accepted as the price of slot-correct responsiveness — not free, worth it.
- **Positioning is *not* affected, though the spec reads as though it should be.** Layout containment is documented as making an element a containing block for absolutely and fixed positioned descendants; measured, neither is caught — a consumer's fixed overlay or absolute child behaves exactly as inside a plain div. Pinned by a law so an engine change surfaces here rather than in someone's app.
- **Strict-CSP SSR constraint.** Values ride as inline custom properties. Client-side React sets them via CSSOM, which CSP does not block — but server-rendered HTML's `style` attributes are blocked under `style-src` without `unsafe-inline` until hydration re-applies them. A documented deployment constraint, not a design lever.

**One sharp edge, found and closed (2026-08-02): a tier reads the nearest *ancestor* query container, and a Box is a container for its children, never for itself.** The outermost Box in a tree therefore had no tier context and sat at its base values at every width — found when the preview's grid rig rendered one column forever. **Resolved: Theme's element is a container too** (`.kui-theme { container-type: inline-size }`), so the rule is "inside a Theme, tiers always work," and a nested regional Theme is the more correct slot for its subtree anyway. The caveat that comes with it: inline-size containment means a Theme's width cannot come from its contents, so a Theme rendered onto a shrink-to-fit element (a flex child at `width: auto`, an inline-block) collapses — give such an element a width, or don't put the Theme there. Outside any Theme the edge still exists, and a law pins it.

**Tiers are container-keyed and few.** `@md` is a container-width tier resolved by container queries, not a viewport breakpoint — a component adapts to its slot, so the same Grid is correct in a drawer and a main column. Both native platforms converged here (iOS: 2 size classes; Android: 3 window classes; neither has per-prop pixel breakpoints): keep the tier count small and the names semantic. Only Shell and page-gutter concerns key off the viewport. `--kui-*` vars are private plumbing — undocumented, unstable, never for consumers (section 13).

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

**Space palette (the raw currency).** Hybrid curve: fine and near-linear at the bottom (12, 16, 24 are all distinct and used constantly), geometric and sparse at the top (80 vs 88 is imperceptible). Density never touches it; `--scale` re-prices it globally.

**Layout space (the semantic layer over it, decided 2026-08-04, Kushagra).** `--layout-space-N`: what every layout prop actually consumes — gap on Flex/Stack/Grid, Box `p`/`m` — and what surface padding picks from. At default density it is the 1:1 identity map; compact and comfortable re-pick steps from the untouched palette (section 12). This is what makes `gap="4"` mean "step 4 of this density's rhythm" rather than a frozen alias for 16px — the same move contrast makes on colour roles, and without it the index would be a unit conversion. The boundary: layout space carries every distance BETWEEN elements (and container edge to content); raw space remains the palette plus the control family's own picks, because control innards already answer density through the designed sets and a second application would compress them twice.

```css
--space-1:  2px     --space-7:  32px
--space-2:  4px     --space-8:  40px
--space-3:  8px     --space-9:  48px
--space-4:  12px    --space-10: 64px
--space-5:  16px    --space-11: 96px
--space-6:  24px    --space-12: 128px
```

~12 steps because spacing spans nearly two orders of magnitude, unlike radius's bounded ~4-32px range. This is why Radix ships ~9 space tokens but only 6 radius tokens. The step count is set by dynamic range, not copied from the size count.

**Control padding (semantic, size-indexed, a designed number — NOT a palette pick).** Inline padding inside controls, at default density in the fine world:

```css
--control-px-1: 8px    --control-px-3: 13px
--control-px-2: 10px   --control-px-4: 16px
```

**It left the space palette on 2026-08-05, and the reason is the whole rule.** Padding has to hold a roughly constant fraction of the box it pads — the same law section 6 already imposes on the control radius, and for the same reason: let it climb with the size index and the top of the ladder stops looking like the bottom. The palette cannot express that. It is a *layout* rhythm, near-linear at the bottom and geometric at the top, so through the control band it grows ~1.44x per step against a height ladder that grows ~1.20x; indexing one with the other made the fraction climb 0.286 -> 0.500 across four sizes, and coarse/comfortable ran out of palette entirely and repeated a step, so its size 4 was padded no wider than its size 3. Radius solved its own version of this by widening its palette inside the control band; space cannot be widened without renumbering every layout pick, so control padding joins `height` as a raw designed number. All six density x pointer sets now sit in **0.24-0.38 of their box**, law-tested per cell, alongside monotonicity and the compact < default < comfortable ordering.

This is not an exception to "reference, never restate" — there is no palette entry being restated. `--control-px-N` is still the only name a component may use, and it still carries `--scale`, which it previously inherited from the space token and now takes directly.

**A bare pill edge pads wider, per side (2026-08-05, Kushagra).** Padding is measured at the vertical midline, where a pill is at its widest; the eye judges the gap at the text's cap line, where the corner curve has already swung inward — so under `radius="full"` a label reads crammed against the cap at the very padding that is correct at every other level. The correction is geometric in origin (the capsule rule of thumb: pad half the height and the text starts where the straight walls do) and designed in value: `--control-px-pill-N`, a second designed number per (density × pointer) cell sitting just under half the box (~0.40–0.44; full half-height overshoots at the large sizes), resolving to `--control-px-N` at every level except `full`. **Per side, and only a bare side**: an edge whose content starts with a slot — an icon, a hosted clear button — keeps the plain padding, because the slot already stands between the text and the curve (the Password/Search pair that decided it: a password field with a trailing Show button compensates only its leading edge; a search field with a leading icon and trailing Clear compensates neither). The skeleton pads each side independently and the shared slot rules do the reset; Button's slots gained the `data-slot` wrapper so the rule reads structure off the DOM — which also extended §4's hosted-control geometry to Button, which TextField had and Button silently did not. Emission is the radius × density × pointer cell pattern the control radii already use, except the full cells must state raw values (there is no palette step for the level to re-price), which is why the pointer worlds carry their own full cells. Laws: wider than the plain padding and never past half the box, monotone across sizes, level-ordered, and mounted per-side assertions on both components.

Controls have **no vertical padding token** (height + center, per section 4). Surfaces (cards) take both axes via their own `--surface-p-N`, fixed picks into layout space (section 10) — density reaches them through the layer (section 12).

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

Token is the on-system spelling (`gap="4"` -> `--layout-space-4`, the density-aware layer of §3 — NOT `--space-4`, which is a frozen alias and would make the index a unit conversion); the `| string` on the **same** prop is the inline exit (`gap="13px"`), so you never hit a wall. width/height are pure CSS strings (there was never parity to chase there). Anything uncovered is one `style={{ ... }}` away. A new CSS property ships -> do nothing, it already works via `style`. This is the property you never maintain.

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
- inline padding from `--control-px-N` (a designed length, not a space pick — see section 3)
- corner from the control-radius family (see section 6)
- gap from a `--space-N` token

The pixel value lives only in the height family. Text lives in a separate family. That separation is what lets height move to 40px while text stays at size 2.

**Fixed-height controls** (Button, Input, Tabs, Segmented Control, Select trigger):

```css
min-height: var(--control-height-2);   /* not height: — amended 2026-08-02 */
display: inline-flex;
align-items: center;
/* inline padding only; vertical padding does not exist as a concept */
```

Contents center in whatever height the box is. "Make size 2 = 40px" becomes one line, text untouched, everything re-centers free.

**`min-height`, not `height` — fixed height is the design intent, not the implementation.** In every normal render the two are pixel-identical: a single-line label sits far below the token, so the token decides the box. The `min-` is dormant insurance for the two cases where the token loses: WCAG 1.4.4 text resized to 200% (a hard `height` clips the label — clipping the exact preference the type system honours), and wrapping (long labels, localization, user content in a trigger). There, growing is correct because the alternative is truncation. One consequence: wrapped content needs a small designed block padding so two centered lines don't touch the edges — a protection value, not vertical padding returning as a sizing mechanism; height still comes only from the token.

**Designed heights, not an anchor times a factor** (amended 2026-08-01 when density became designed sets — section 12). Each density level places its own four heights; `--scale` is the only multiplier left, and it sits at 1:

```css
/* :root — the default level */
--control-height-1: calc(28px * var(--scale));
--control-height-2: calc(32px * var(--scale));
--control-height-3: calc(40px * var(--scale));
--control-height-4: calc(48px * var(--scale));
/* [data-density="compact"] re-declares the family at 24/28/34/40 */
```

The anchor model read better and corrected worse: a factor moves all four heights together, so "size 2 should be 33px" is unsayable. Correction is the actual work, and it has to be local.

**Non-fixed-height components** (cards, table cells, callouts, textareas): padding is the dimension. They rescale via padding anchors, not height anchors.

**Split Radix's single `scaling` knob into independent axes:** control density, type scale, radius, each with its own anchor. Keep a convenience that moves them together for the simple case.

---

## 5. The Theme component

### Props

```
appearance     light | dark | inherit          color scheme. Both directions nest: `[data-appearance="light"]` is emitted as its own block alongside `[data-appearance="dark"]`, so a light section inside a dark app escapes as well as the reverse. `inherit` stamps nothing and keeps the outer scope. Each scope also declares `color-scheme`, so UA-painted chrome (scrollbar tracks, a consumer's native inputs) follows the appearance instead of staying light
material       off | on (policy)               global translucency gate; CAPS per-component material (section 10). aka allowTranslucency
accentColor    <brand color>                   hue that tone="accent" resolves to; input to the color generator (section 7)
grayColor      <neutral>                        low-chroma accent from the same generator; tone="neutral" hue
contrast       normal | high                   drives borders/dividers too, resolves per appearance. Stamped only when chosen, so `prefers-contrast: more` still reaches an unconfigured Theme (section 7)
radius         none | small | medium | large | full   selects a designed radius palette (section 6), not a factor and not a token pick
density        compact | default | comfortable  selects a designed control-family set (height, px, gap, radius); never type, never the space palette (section 12). Theme-scoped only: an airy region is a nested Theme on an element you already have (via `render`), not a per-component prop, which would duplicate `size`
surfaces       flat | elevated                 does light exist (sections 10, 19). SHIPPED 2026-08-04. The semantic is elevation-as-identity; surfaces cast shadow row 3, solid-fill controls cast row 2 and catch light (2026-08-07). An app choice made once - no component exposes a shadow API, law-tested. Fields left its set 2026-08-06 (a field is a well; the criterion sentence lives in section 10's shadow-palette notes)
look           outlined | filled               the resting dress of the one-look families (section 19). SHIPPED 2026-08-06. Border on a control is rank (Button's bordered) and stays a prop; border on a one-look family is dress and is the app's. outlined is the identity; filled darkens by hierarchy (surface, field, mark). Neutral-only by the tone-set rule
pointer        fine | coarse | auto            which geometry the controls take (section 16), and the handheld type band with it (section 17 — coarse means handheld; there is no separate device prop). `auto` follows @media (pointer: coarse); pinning forces the whole world, which is also how the coarse matrix and phone type are judged on a desktop
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

### The mark family: controls that ARE their own mark (2026-08-05, shipped with Checkbox)

A checkbox, a radio, a switch's track and a slider's thumb are not boxes that *contain* a label — they sit **beside** one. The height ladder is the geometry of a container, so these leave it, and what they take instead is one shared ladder: **`--mark-N`**.

**One ladder, because four are four ladders that drift.** A checkbox next to a switch in one form has to read as the same size of thing, and nothing enforces that if each control designs its own pair. The derivations off it are identities, never ratios (Kushagra, 2026-08-05: "I don't like fraction" — the objection that moved control padding off the space palette the day before):

    checkbox side = radio diameter = slider thumb = mark(n)
    switch track height                           = mark(n + 1)

The one-index shift is what the peers arrive at by hand: Radix's switch heights (16/20/24) ARE their checkbox ladder (14/16/20) moved up a step; Material's switch track is 32 against an 18 checkbox. An index shift is a move this system already makes — density shifts layout-space picks, the handheld band shifts type steps.

**The ladder is the line box, and that is why it has no numbers of its own.** `--mark-N` resolves to `--line-height-N`: a mark occupies exactly one line of the label it sits beside. Three things follow that a designed ladder would not have given: it aligns with its label by construction and never disturbs the text rhythm; it **grows on a phone with nothing designed twice**, because §17's handheld band raises the type and the mark rides it (Spectrum reaches the same place by scaling every component 1.25x on touch, maintained by hand); and there is no second ladder to keep in sync. Rendered: **16/20/24/26 fine, 20/24/26/28 coarse**. Peer check — Material paints 18 at one size, Radix 14/16/20, Fluent 16/20.

**The space palette was tried first and cannot hold it**, which is the third instance of one lesson (radius, then control padding, now this). Across a mark's plausible range (14-30px) the palette offers exactly two rungs, 16 and 24, so a four-step ladder either repeats steps (16, 16, 24, 24) or overshoots (12, 16, 24, 32). Radix hit the same wall from the other side and papered over it: their switch size 2 is `calc(var(--space-5) * 5/6)`, a fraction written to reach a 20 the palette does not have.

**The control edge (2026-08-07, Kushagra; supersedes the mark edge of 2026-08-06 — audit D2, widened and re-solved).** The role is the resting hairline of a control whose identity NEEDS it under the outlined look. D2 established the criterion for marks: an unchecked checkbox IS its border, so it wants real weight where the shared `--color-border` has almost none (|Lc| 17.1 light / ~0 dark). The widening applies the same criterion honestly: an outlined FIELD's fill is the seal it sits on, so its border is likewise all that identifies it — and it wears the SAME SOLVE ONE TIER DOWN (`--field-edge`; corrected same day by eye — "Text Field + Area being much larger than checkbox, they appear very dark"): at equal colour the long border of a large box reads far heavier than a mark's ring, and APCA's own tiers agree that a large element owes less boundary contrast than fine detail. The claim is an ORDER, law-tested: ring strongest, field one tier down, card's quiet hairline under both, each resolving its own solved role. Cards and separators keep the quiet hairline; a card has a body, and its identity does not rest on its edge.

**SOLVED to `controlEdgeLc`, never picked from the ladder — the dark ring is why.** The 2026-08-06 picks took the first passing rung per mode, and dark has no rung near the floor: step 9 misses at 42.1 and the scale folds back before 11, so the pick landed at Lc 66.5 — `#bcbec0`, a third of the way to white, which Kushagra read, correctly, as "what I would expect when high contrast is on." The generator now binary-searches the neutral recipe's lightness for the value that JUST clears the target against both the seal and the page (the `--accent-label` precedent, generalised), and the law holds a CEILING as well as a floor, so neither the solve nor a hand edit can move the rendered edge away from the stated number. The normal targets are PER MODE, dark under light (2026-08-07, the split's first taste edit — equal Lc renders a heavier line in dark, where a mid-grey glows: the same Lc 46 measures 2.4:1 on white and 6.4:1 on the dark page): mark 46 light / 30 dark (`#a3a6aa` / `#75787b`), field 31 light / 15 dark (`#c0c2c5` / `#525557`); `high` stays mode-invariant, because conformance does not dim with the lights, and a law pins the direction (dark < light) without pinning the values. Under the mode split below, that pair is a DRIFT check on a taste value, not a conformance floor; the anchor law moved to the `high` targets, the ones conformance actually rides on.

**The contrast rule splits by mode (2026-08-07, Kushagra: "APCA rule checks for high contrast mode, taste over APCA rules in standard" — scope: borders and fills).** At rest in standard mode, a border or fill is DRESS: stated in config, judged in the preview, held to no floor by any law. The forcing pair arrived the same day the solve did. First, the two rulers split on one hex — the solved light ring clears its APCA target while measuring 2.44:1 in WCAG 2 terms, under the 3:1 the pick it replaced cleared at 3.17 — and a value cannot be optimised to two disagreeing meters at once. Second, `filled`'s borders are picked ladder steps beside `outlined`'s solved ones, an inconsistency with no principle to arbitrate it as long as "standard mode owes APCA" was the claim. The rule dissolves both: standard mode owes the eye, and **`contrast="high"` is the conformance surface** — its edge targets are the ones law-anchored to `apcaFloors`, and the look-border stand-down routes `filled` through those same solved edges, so both looks conform under the setting built for it. OUTSIDE the split, keeping their standard-mode floors: text pairings, the focus ring, and the invalid edge — those are signals, not dress, and a signal that only works under an opt-in setting is not a signal. **Taste stays contrast-INFORMED (the rule's second clause, same day):** the standard-mode values are still decided with the meters in hand, and the suite still measures them on every run — a report that prints each resting border and fill against its advisory tier on both meters, asserting only that the measurement happened. Validation moved to `contrast="high"`; visibility of the numbers never moved at all.

**`contrast="high"` gets a designed answer, not a band accident:** the edge re-solves one tier up (Lc 60) in the high-contrast scopes. Before this, dark's pick moved under the setting only because its step happened to sit in a re-priced band, and light's never moved at all (audit R9's half-truth). APCA's own non-text tiers (fine detail 45, large solid shapes 30, bare discernibility 15) are also why `filled` is NOT held to this hairline: a filled control identifies by its solid well, not its border.

**And filled's wells stay soft BY DECISION (2026-08-07, settled after measuring, not before).** The wells sit at single-digit Lc against their beds — under even the 15 discernibility tier. That tier is advisory APCA guidance, not the normative rule: a filled field is still identified by its label, placeholder and caret, so WCAG 1.4.11 does not bind the fill, and a large soft well is plainly visible to typical vision (Kushagra, from the preview: "in what world is this low contrast"). The users the tier protects are served by **`contrast="high"`, which measurably restores a strong boundary to every filled control** — the look-border stand-down falls back to the solved edges at their HC tier (field #e0e1e2 → #a3a6aa light, checkbox #46484a → #b0b3b5 dark; mounted law). The complete position: outlined conforms at rest through its border, filled reads as filled at rest and conforms under the setting built for exactly this. Audits: the soft filled fill is not a finding.

**Density never touches a mark** — it is content, in the label cluster §4 already holds invariant, and a mark that grew while its label held would be a mark that no longer matched its line.

**The family promoted into the shared layer on its third member (2026-08-06, Radio + the slider thumb landing together — the rule TextArea's LOG set, applied as written).** The box, the invisible target, the hosted floor, the seal-and-edge resting identity, the disabled fill arm, the binary ON state and the glyph-is-the-box rule all live in `system/recipes.css` as `.kui-mark` rules; checkbox.css keeps only the tri-state's glyph picks, radio.css only its circle. A structural law pins the promotion: no component stylesheet may size a mark's box or re-point the mark edge. **Shape is each member's own**: the checkbox states its corner through `--radius-mark-N`; a radio is a circle by role semantics (§6) and states it itself; the slider thumb is a VERTICAL CAPSULE since 2026-08-07 (Kushagra: "longer vertically") — block stays the mark ladder, inline narrows to `--slider-thumb-w-N` (10/12/14/16 raw designed px, the fourth family at the no-palette-rung wall), radius w/2, still outside the radius axis at every level.

**A mark's shape is role semantics, and two of the family's shapes are circles the radius axis never reaches (§6, 2026-08-06).** The checkbox's cap at `full` ("a circular checkbox reads as a radio") already put role legibility above theme uniformity; Radio is the same sentence mirrored — a square radio reads as a checkbox — so its circle holds at every radius level, `none` included, stated as the rule (half the mark, §6's own capsule correction) rather than 9999px riding the clamp. The slider thumb took the circle for the platform's reason, and became a VERTICAL CAPSULE 2026-08-07 (Kushagra: "longer vertically" — block stays the mark ladder, inline narrows to the designed `--slider-thumb-w-N`, radius w/2); the shape changed, the exception did not — a square handle still reads as a bead that stuck. This is a deliberate, narrow exception to `none`-squares-everything: the kill switch owns every corner that is dress; these two corners are role, and they are the only two. **The count was false for a day (audit R8, fixed 2026-08-07):** the slider RAIL was a silent third, escaping not by argument but by arithmetic — its cap is `calc(track / 2)`, a designed px with no palette token in the chain, so `radius="none"` left it a 2-3.5px capsule while every box beside it squared off. It is now `min(half the rail, the control radius)`: at every level that has a corner the control radius dwarfs half a 4-7px rail, so the capsule survives byte-identically, and at `none` it squares with everything else. An exception has to be argued to be an exception; this one was only ever unreached.

**The slider's track joins the family's numbers (§11 "track low", 2026-08-06):** `--slider-track-N`, a designed raw ladder (4/5/6/7, ~0.25 of the fine mark) — the space palette has nothing between 4 and 8, the mark's own wall one part over — density- and pointer-invariant because the slider's coarse target is the CONTROL's height, not a fatter line (iOS holds 4pt against a 28pt thumb). Its colour is **`--color-track`**, a new tone-independent role beside `--mark-edge` and minted for the same structural reason: the off part of a value control is neutral by §11's own row, and a component that stamps `accent` for its fill can only say neutral through a role. The switch's off-track and progress/meter inherit it. Deliberately not held to the mark edge's non-text floor — a well is a region the APCA-passing fill moves through, not a hairline identity, and every platform ships it subtle.

### A mark's target: a control of its size, painted or not (2026-08-05)

A mark is the first control whose **painted box is smaller than the thing you aim at**, and §16 had already refused the obvious fix: an invisible pseudo-element, rejected because "its safe extent depends on neighbour gaps, which CSS cannot read" — the clamp was guesswork and the overlap was silent.

What makes it legitimate here is that **the extent is not guessed**. The target is `min(--control-height-N, --touch-target-min)`: the same box the Button beside it occupies at the same size index, capped at the touch floor. A checkbox is exactly as large a target as any other control of its size, which is a rule rather than a clamp, and it inherits the compliance the height ladder already proved — the locked 24 floor in every fine cell, the 44 target on the coarse default path (§16).

- **The cap bounds the reach; the SPACING RULE is what makes a stack safe (corrected 2026-08-06 — audit D1).** The raw ladder reaches 68px at comfortable coarse, which would be 20px of invisible reach on every side of a 28px mark; past 44 a target buys nothing and starts taking from its neighbour. With the cap the widest reach in any of the 24 cells is **11px** (the half-difference plus the border term). The sentence that stood here — "a stacked list is clear at any gap the layout-space scale offers" — was FALSE: the scale starts at 2px, and below the reach the later sibling's target overlaps the earlier one's *painted box* and wins the hit-test, so a real click on one checkbox toggled the next (measured: 6px of a 24px mark stolen at a 4px gap under coarse). The rule that replaces it, Kushagra's call: **marks in a stack need 12 real pixels** — one more than the worst reach. Twelve is a real rung (space 4; the default density's `gap="4"` sits exactly on it, and `gap="5"` is the smallest index that holds it at every density, since compact resolves 4 to 8px). The law mounts the rule rather than deriving it: two marks at exactly 12px in all 24 (pointer × density × size) cells, every point strictly inside the first's paint must belong to the first — plus a negative control at 4px that must keep stealing, so the twelve cannot rot into decoration. A scan row nobody claims is an error, not a zero: the first cut of that law ran off-viewport and passed 24 cells while measuring nothing.
- **Both pointer worlds**, unlike the hosted-control rule's coarse-only expansion: a fine cell's mark is 16-26px, under WCAG 2.5.8's minimum at the small sizes, and "a mouse is precise" is not what that criterion says.
- **The exclusion generalised when the slider thumb arrived (2026-08-06): a mark inside ANOTHER CONTROL never grows its own target** — `:not(.kui-control *)`, replacing the slot-only spelling. The container owns the question in both cases it covers: a slot's hosted rule (audit D4), and the slider root's own control-height box, where a thumb's private reach would have fought Base UI's nearest-thumb hit logic in tree order. A mark in a label, form or Card keeps its reach — nothing there is holding it.
- **It is the hosted-control rule inverted, deliberately.** There the hit area SHRINKS to the container so a nested control never out-targets what holds it; here it GROWS to the container the mark would have been, because nothing holds it.
- `--touch-target-min` gets its **first stylesheet consumer** here. It was minted for the `max()` height reserve §16 dropped and has been a published number with nothing reading it since.

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
--radius-6: 10px   \
--radius-7: 12px    |  the SURFACE band — --radius-surface-1..4 (size-indexed, 2026-08-04)
--radius-8: 16px    |
--radius-9: 20px   /
--radius-10: 24px      the OVERLAY — --radius-overlay (a dialog has one size)
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
--radius-surface-3: var(--radius-8);   /* size-3 card, panel, popover (size-indexed, section 10) */
--radius-overlay: var(--radius-10);    /* dialogs, sheets — flat */
```

A Button references `--radius-control-2`, never `--radius-2` directly.

### Two axes, one mapping does both jobs

- **Within a component:** radius tracks size. A size-4 button pulls a bigger corner than a size-2 button, or it reads boxy. **Bigger in absolute terms, not proportionally**: hold the corner near a constant fraction of the box (~0.2) rather than letting it climb with the size index. Measured on the first build, a climbing ratio ran 0.14 at size 1 to 0.25 at size 4 and turned the largest control into a capsule; it also made compact, which reuses radii on smaller boxes, come out rounder than default, which is backwards for a dense mode.
- **Across components at the same size:** radius is fixed. Every size-2 control (Button, Input, Select trigger) pulls the same `--radius-control-2`, so corners are locked identical by the reference, not by coincidence. This is the join that matters in a form.

### Boundaries

- Stepped radius families exist for **both** kinds of component, differently sized on purpose. Controls: `--radius-control-1..4`, density-indexed (section 12). Surfaces: `--radius-surface-1..4`, size-indexed only (amended 2026-08-04, Kushagra — a size-1 card and a size-4 card should not wear the same corner; the original "a card has no size index" premise died when Card grew one for padding). Density never touches a surface corner — density reaches a card through padding (layout space); the corner follows the size index alone. Size 3 anchors at each level's old flat value, so the default card never moved. Overlay stays flat: a dialog has one size.
- **Do not auto-derive radius from height.** `calc(height * ratio)` re-imports the non-linearity. Each control-radius is a designed value placed on the curve, hand-tuned references.
- **Control radius is part of the density set** (section 12). Density changes visual size enough that a fixed corner reads boxy at the airy end, so each density level places its own control radii — still designed points, never derived from the height.

### The Theme radius prop: designed palettes, not a factor

**Decision: each level (`none`, `small`, `medium`, `large`, `full`) is a designed palette, emitted at build time under `[data-radius]`.** Not a multiplier over one palette, for the same reason density is not one: a factor can only move every step together, so no single corner is correctable, and each radius is supposed to be a placed point on a perceptual curve.

The decisive case is `full`. CSS clamps `border-radius` to half the smaller dimension, so a huge value gives a perfect pill on controls free — but surfaces must be **capped** (a dialog at full must not become a giant lens; Radix caps card radius even in full). One factor cannot do both, because it scales controls and surfaces by the same amount. A designed palette can: at `full`, the control band pills and the surface band holds at `large`'s values.

**The control band at `full` states the rule, not the trick (changed 2026-08-05, LOG).** It shipped as 9999px, letting CSS clamping find the capsule — which asks the *rendered* box, and that is the wrong box the moment a control's height is not its token's. TextArea forced the question (a three-row box became a stadium, its first line deep inside the corner curve; the resize handle floated outside it), and a wrapped pill label at 200% zoom was quietly the same case. The semantic band now emits `--radius-control-N: calc(var(--control-height-N) / 2)` — a capsule was only ever "half the height", so every fixed-height control renders byte-identically, and a control that grows keeps the one-row curvature instead of scaling its corner with accidental height. This is the surface band's own move (full re-prices it to designed corners, never a capsule) applied to the control band, and it rides the cell emission below, so each (density × pointer) world halves its own ladder. The raw palette steps 1-5 keep 9999 for escape-hatch use; the semantic layer no longer reads them at `full`. Laws: computed radius equals half the height token on a mounted control (the literal 9999px failed this), a grown TextArea wears the same corner as a one-row one, per world.

**Bands keep the two axes legible:** steps 1-5 are the control band, 6-9 the surface band, 10 the overlay, disjoint on purpose, so `full` can pill the controls while capping surfaces. Density picks a control step; size picks a surface step; a level says what a step is worth. The surface semantics are re-declared inside every `[data-radius]` block — they take no density, so no cell carries them, and a `:root`-only declaration would stay baked to the default palette inside any radius subtree (the substitution-at-declaration lesson below, applied at emission time rather than re-learned).

**But disjoint bands are not sufficient, and a browser test is what proved it (2026-08-02).** A custom property that references another is substituted **where it is declared**, not where it is used, so `--radius-control-2: var(--radius-2)` sitting in `:root` is already baked to the default palette before any `[data-radius]` block further down changes `--radius-2`. Setting a radius level therefore did nothing to control radii at all, and the earlier claim that the axes composed because neither wrote the other's token was simply wrong. The generator now emits every (radius x density) cell — Theme writes both attributes on one element, so the combined selector always matches and outranks either alone. The lesson is narrower than "test the cascade": **an indirection through a custom property is resolved at its declaration site, so any token that must react to a scope below it has to be re-declared in that scope.**

`none` squares everything including `--radius-full`: a kill switch with an exception is not a kill switch.

**A mark's corner is the family's own band, and it holds a fraction of the MARK (2026-08-05, corrected same day).** It shipped riding `--radius-control-N` with a ceiling bolted on at `full`, and that was the fraction bug a third time — after the control corner itself and control padding. Those radii are designed against the HEIGHT ladder, and a mark is not on it, so the corner held a fraction of a box the control does not have: **0.250 → 0.385** across the size index at default density (Kushagra, by eye: "size 4 looks much more rounded than size 1"), and **0.462** at comfortable size 4 — a circle in all but name, which is the one thing this family must never be. The ceiling could not catch that second half, because it guarded the `radius` LEVELS and the offender was `density`, an axis that never touches the mark's box at all.

`--radius-mark-N` picks into the same palette on the family's own terms. The fraction is a **per-level band** (corrected 2026-08-06, audit D13 — the first spelling claimed 0.17–0.25 for every level, which is only the default's range): `small` 0.08–0.13, `medium` 0.17–0.25, `large`/`full` 0.25–0.38, in both pointer worlds, under two invariants that DO hold everywhere — no cell reaches half its box, and the spread across the size index stays under 1.4× per level per world (coarse ships 1.3846; the law's comment records why the ceiling is not tighter). It is **density-invariant** like the mark itself; and because the picks are steps rather than raw px, the levels still reach it — `small` and `large` move it, and `none` squares it like it squares everything (§6's kill switch, kept whole). At `full` the band **holds at `large`'s values**, which is the surface band's own sentence one band over: a corner stops getting rounder, it never retreats. The residual spread is the palette's granularity — holding 0.25 exactly would want a 5 at size 2 and a 6.5 at size 4, which the palette does not have and which a raw ladder could only buy by going deaf to the levels. Rendered 4/4/6/6 at the default level against marks of 16/20/24/26. Laws: the spread across the index stays under 1.4× at every level in both pointer worlds, no cell ever reaches half the box, `full` equals `large`, `none` is zero, and density declares no mark corner at all.

**Two of the family's corners are not the band's at all (2026-08-06, Radio and the slider thumb): a radio and a thumb are circles by role semantics, and the radius axis — `none` included — never reaches them.** The checkbox-at-`full` sentence mirrored: role legibility outranks theme uniformity in both directions, and a square radio reads as a checkbox exactly as a circular checkbox reads as a radio. Stated as `calc(mark / 2)` — the capsule as the rule, this section's own correction — never 9999px riding the clamp. The narrow breach of the kill switch is deliberate and law-tested at every level in both worlds: `none` owns every corner that is dress; these two are role, and they are the only two.

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

The large 8 to 9 drop is the soft/solid discontinuity, placed on purpose. Solid hover and active derive as uniform L-deltas off the resting fill, so the three states are evenly spaced **by construction** across every hue.

**Direction is label-relative, not mode-relative (revised 2026-08-02).** The states move *away* from the lightness of the label the fill carries. A fixed per-mode rule ("darken in light, lighten in dark") reasons against the background and therefore walks a fill toward its own label half the time: measured, it put the destructive pressed state at APCA Lc 59 in dark mode, and dropped every dark-labelled bright hue (yellow, lime, cyan) to Lc 53-55 in light mode. Moving away from the label makes hover and press **strictly more legible than rest**, so only the resting fill has to clear the target and no interaction state can silently fall through it. It also reads correctly: pressed separates from its label rather than muddying into it. A fill already at an extreme has no room to move away and moves toward the label instead, which is safe precisely because sitting at an extreme is what left the margin.

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

**Decision: in light mode, the supplied accent hex reproduces exactly as step 9.** Implemented and law-tested against real brand colors (Radix violet, Vercel blue, Linear indigo, Radix red and yellow): step 9 comes back byte-identical to the input. The intake takes hue as-is and derives vividness as the color's chroma measured against what its own lightness could hold, so "as saturated as they drew it" survives being replotted anywhere on the ladder; the input's lightness is carried as a pin that overrides the cusp formula in light mode only.

Inputs outside a usable band (roughly L .42 to .92) snap to the nearest in-bounds value — a near-black or near-white "brand color" was never usable as a solid, and a very dark one falls through to the low-chroma path and becomes a near-black solid anyway, which is what it wanted. Dark mode re-derives from the hue and chroma shape with no pinning; no brand promise exists on a dark solid.

**Pinning never buys fidelity at the cost of the guarantees.** Every brand color is tested against the full legibility suite in both modes, and against the shared ladder outside the solid band. A color that pinned but failed APCA would be a colour picker, not a system.

### contrast="high": an accessibility setting, not a design knob

**Decision: `contrast` is a Theme-level accessibility preference and nothing else. There is no per-component `highContrast` prop.**

**And since 2026-08-07 it is also WHERE the border-and-fill contrast guarantees live.** The mode split (§5): resting borders and fills answer to taste in standard mode; the APCA floors bind in the `contrast="high"` scopes, whose solved edge targets are the ones law-anchored. Text, the focus ring, and the invalid edge stay floor-checked in standard mode — signals, not dress.

Radix's per-component version is a *role remap* — it changes which step a role reads — and it exists to escape a step 11 placed at a threshold. Both of its real uses (the grey solid, the under-weight label) are fixed properly in the role layer above, so what remains would be an appearance escape hatch, which contradicts appearance-as-output and would grow a boolean on every component whose meaning shifts per rung. It does not ship.

The Theme setting is a *value shift*: the generator emits an override block per appearance base — `:root[data-contrast="high"]` and `[data-appearance="light"][data-contrast="high"]` for light, `[data-appearance="dark"][data-contrast="high"]` for dark — re-declaring only the affected bands: borders (6-8) strengthened, text bands pushed toward the extremes, solid state spread widened. **Light needs both bases and this was wrong until 2026-08-03**: the block was scoped to `:root` alone, `:root` only ever matches `<html>`, and Theme renders a div — so in the default appearance the prop resolved no rule at all while still stamping its attribute. Dark was correct only by accident, because Theme co-locates `data-appearance` and `data-contrast` on one element. The law that would have caught it reads a computed token, not the attribute.

**The guarantee is "as much contrast as each colour permits," not a fixed increase.** Every band is bounded by what its hue can take: a bright hue's border band already sits at its cusp, and pushing it further turns yellow to olive — the same mud the solid band's cusp rule exists to prevent, one band over. So bright hues do not move their borders at all and take their gain in the text band instead, which is the one place the ladder structurally guarantees headroom. **A band that stays put is the setting working.** The only failure is a pairing that comes out worse, which is law-tested. Chromatic solids never move at all (that value is the brand colour); low-chroma solids do, because they read step 12 and a grey has no hue to protect. Cost: a fraction of one scale per tone, shipped by default so the setting works at runtime; a config flag can drop it. One law, one delta table, no second ladder. It should also honour the platform signal (`prefers-contrast: more`) rather than waiting to be set by hand. That guard is spelled `:not([data-contrast="normal"])`, which forces a rule on Theme: **it stamps `data-contrast` only when the axis was actually chosen**, by that Theme or an ancestor. A Theme that stamped a defaulted `normal` would exclude itself from the media query it exists to receive — which is what dark did until 2026-08-03, since every dark Theme also carried `data-contrast="normal"`.

### Output: static, compiled, P3

Generate the 12 steps in TS / Style Dictionary at **build time**; emit plain `--accent-N: oklch(...)` custom properties. The browser does **zero color math at runtime** (the performance answer). Emit P3 with sRGB fallback; flag out-of-gamut steps in the pipeline. Runtime `oklch(from var(--base) ...)` survives only as an **optional** layer for a user's live arbitrary brand hex, where reactivity earns the paint cost. Shipped accents are static.

### Role layer (what components consume)

Components reference roles, never raw steps and never the generation mechanism. Also emit an **alpha ramp** (`--accent-a1..a12`) for surface nesting (section 10). The ramp composites over the **surface seal** (`--color-surface`, decided 2026-08-06): an alpha fill's usual home is a sealed surface, so the solve targets what the fill actually sits on — read from config's `surfaceColor` in both modes, never a second statement of the page colour.

```css
--accent-soft / -soft-hover / -soft-active      /* tint states */
--accent-solid / -solid-hover / -solid-active   /* solid states */
--accent-border
--accent-text                                   /* step 11: links, prose on a tint */
--accent-label                                  /* generated between 11 and 12: UI labels */
--accent-contrast                               /* APCA-computed text on solid */
--accent-a1 ... --accent-a12                     /* alpha scale, composites over the seal */
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

### Interaction motion: zero until the motion system exists (decided 2026-08-03, Kushagra)

**No transition ships.** Every state change — hover, press, release, disable — is instant, on both pointer worlds, until motion is designed as its own system rather than accreted one duration at a time. The motion tokens (`--motion-duration`, `--motion-easing`) stay wired in the pipeline; nothing reads them. A law asserts the recipe layer contains no `transition`.

History, because it constrains the future system: an interim 120ms eased transition shipped with Button and failed on a real phone — a tap lasts ~60ms, so an eased press never reaches its colour and the control reads as dead; desktop emulation never showed it. The interim fix was instant press with eased release. Zeroing everything supersedes that, and hands the finding forward as a hard constraint: **whatever motion lands, press stays instant.**

Two touch behaviours are *not* motion and remain shipped:

- **Hover exists only where hovering does**: every `:hover` rule sits under `@media (hover: hover)`. A touch device synthesises hover on tap and holds it until the next tap, so an unguarded rule leaves a pressed control stuck in its hover fill. `:active` is never guarded — on touch it is the only feedback there is.
- Controls set `touch-action: manipulation` (drops double-tap-to-zoom, keeps scroll and pinch) and clear `-webkit-tap-highlight-color` — the press state is the tap feedback, not the browser's grey flash.
- **iOS Safari arms `:active` only while a touch listener is registered somewhere on the page.** Every hydrated React app has one (React 18 roots register touch listeners at mount), so the library ships no shim — but any JS-free page rendering these controls (the token preview was one) must add `document.addEventListener("touchstart", () => {}, { passive: true })` or the press state silently never fires on an iPhone. Found because the preview's buttons showed no tap feedback on a real device while Base UI's hydrated docs site worked.

Both are laws in `recipes.test.ts`, asserted structurally with comments stripped first — a law a comment can satisfy is not a law.

**The wider motion system is deferred (2026-08-02)** — duration families, overlay enter/exit, the reduced-motion law get their own discussion. The deferral is not a gate.

### Cursors: tokenised, four states (decided 2026-08-03; `text` added 2026-08-04 with TextField)

`--cursor-button: pointer`, `--cursor-loading: progress`, `--cursor-disabled: default`, `--cursor-text: text`. The fourth arrived with TextField and covers the field's whole box — padding and passive slots included, because clicking any of them lands the caret in the same text. The earlier native-parity position (arrow on buttons, matching macOS) did not survive the medium: on the web the hand means "this responds" — a learned convention every major system honours — and refusing it makes a control read as inert. `progress` rather than `wait` while loading: the system is busy, the interface is not frozen. Disabled reverts to the arrow — the hand promises a response the control will not give — and never `not-allowed`, which scolds and matches no native platform. Loading blocks activation via `aria-disabled` plus Base UI's preventDefault handlers, deliberately NOT via the native `disabled` attribute — which the loading path withholds so the control keeps focus and its place in the tab order (§8's own rule, one paragraph down). What earns the cursor is that the element still hit-tests, which `pointer-events: none` would prevent: an element that takes no pointer events shows no cursor. The plain `disabled` path does use the native attribute.

### Focus: one ring, one designed value (decided 2026-08-02; amended 2026-08-04)

`outline: var(--focus-ring-width) solid var(--focus-ring); outline-offset: var(--focus-ring-offset)`, on `:focus-visible`. `--focus-ring` is a generated role token resolving to the accent family **regardless of the control's tone** — `--accent-solid` in light, `--accent-11` in dark: the ring answers "where is focus," which is one question system-wide, so a destructive **tone** still rings accent (Spectrum, Radix, Primer all converged here). The one exception is the invalid **state**, which rings `--invalid-edge` — see the validity section below; a tone is chosen, a state is not, and that is the whole of the distinction. `outline` rather than box-shadow because it follows `border-radius` natively, pills included, and cannot affect layout. WCAG 2.4.7/2.4.13 shape: ≥2px, offset, ≥3:1 against adjacent surfaces — the last is a law, asserted with APCA against steps 1-3 in both modes. **That law did not exist until 2026-08-03, and the dark ring had been failing it the whole time**: step 9 is a deep violet on a near-black page, |Lc| 22.3, a focus indicator you effectively cannot see. Hence the per-mode step — the ring's promise is a contrast guarantee against the page, and the solid band cannot keep it in dark. Both modes now clear the Lc 45 non-text floor with room (74.7 light, 66.3 dark).

**"Defined once" always meant one designed VALUE, not one selector — and the heading was already wrong before TextField.** The ring lands wherever focus can: the control, an interactive surface (`.kui-surface:where(button, a)`, since card-as-button), and the field wrapper. That last is the system's one deliberate departure from `:focus-visible`: **a field's focus is a mode, not a keyboard affordance.** You do not press a field, you enter it, and once your keystrokes land inside, the box has to say so however you arrived — which is what every native text input does. The ring belongs to the box that draws the border, so it encloses the slots.

**It rings on the INPUT holding focus, not on `:focus-within` (narrowed 2026-08-05).** `:focus-within` fires for any descendant, and once a control hosted in a slot became a first-class pattern (section 4) that descendant is routinely a button — so tabbing to a clear button lit the field's ring *and* the button's own, one nested inside the other, saying two different things. Worse, the field claimed a focus it did not have, which empties the ring of the only meaning it has: *your keystrokes land here*. The question the selector asks moved from "is focus anywhere in this box" to "is the caret in this field"; a hosted control rings itself, as any control does. The law is therefore not a count of rules — counting one file is exactly what let this claim go stale — but that **every focus rule in every shipped stylesheet resolves the same three tokens**, asserted across all of them and mutation-checked.

### Invalid: a role remap, and only the border moves (decided 2026-08-04)

Same mechanism as disabled below, for the same reason: the control keeps its shape and changes family, so the pairing stays designed and testable instead of a red border bolted onto whatever was underneath. It lives in the **shared control layer**, not in the component that first needed it — Select, Combobox and NumberField can all be wrong — and it is a STATE, never a variant: nothing chooses to look invalid, which is why there is no `invalid` prop. Two spellings are read, both required: `data-invalid`, which Base UI writes inside a `Field.Root`, and `aria-invalid`, the platform spelling standalone. A `:has()` arm covers the controls whose visible box is a wrapper around the input, where the state lands on a child and the border being corrected is the parent's.

**The value the user typed is their content and stays legible; the BOX carries the state** — border and ring both, through one `--invalid-edge` token picked per mode (`--destructive-solid` light, `--destructive-11` dark). Disabled outranks invalid by specificity, deterministically, and a mounted law pins it.

**Reversed 2026-08-04, and the original reasoning was wrong twice over.** The border was `--destructive-border` — step 7, which shares its lightness with every other tone at that step *by law* — so the entire validity signal was a hue rotation at constant luminance: measured against the field fill, 22.8 -> 23.9 Lc in light and 10.3 -> **9.8** in dark. Going invalid made the border *fainter* than the resting one it replaced, and at constant luminance it is close to invisible to a red-green colourblind user. And the ring stayed accent, measuring **6.4x** the visual weight of the error border beside it, so the error signal was at its faintest exactly when the user focused the field to correct it. The stated defence — that a destructive ring "would have to re-clear the APCA floor per mode" — is simply false, measured: destructive clears Lc 55-65 in both modes against a floor of 45. What actually argued for one ring was consistency with Spectrum/Radix/Primer, and that is outweighed by two chromatic signals arguing on one control. Both values are now law-tested against the Lc 45 non-text floor.

**Colour alone is not sufficient signalling (WCAG 1.4.1).** The border is the system's part; the error *text* is `Field.Error`'s, and a field that renders no message is a composition defect rather than a token one. The labelled, described, error-carrying arrangement is a block.

### Disabled: a role remap, never opacity (decided 2026-08-02)

Foreground remaps to `neutral-8`, fills to `neutral-3`, borders to `neutral-6`; hover and press stop firing. No `opacity` — it stacks on tinted surfaces and silently voids every generated contrast guarantee, where the remap keeps "legible but clearly off" as a designed, testable pair. Cursor drops to `--cursor-disabled` (see Cursors, above). Not focusable at rest, matching the native element — except while loading, below.

### Loading: the label never hides (decided 2026-08-02)

`data-loading` + `aria-busy`; interaction blocked; focus retained via Base UI's `focusableWhenDisabled`, so a click that flips a button to loading does not dump keyboard focus.

Composition: **a control with an icon swaps the icon for the Spinner in the same `--icon-size-N` box — zero layout shift. A text-only control gains the Spinner beside its label, and the label stays.** This reverses the label-hiding pattern (Polaris, Primer): a button that loses its label stops saying what it is doing, and the accepted cost is a slight width change on text-only controls while loading.

**Spinner is a public component and deliberately primitive (revised 2026-08-03):** one SVG of eight static spokes (twelve at first; eight halves nothing visually and trims the DOM — Kushagra's call) rotated as a whole by a `steps(8)` keyframe — the indicator *ticks* from spoke to spoke rather than sweeping, which is the native-platform idiom. The first build was the border-trick arc (one element, no SVG); it was rejected by eye, and the conic-gradient attempt at spokes failed structurally — a conic gradient cuts angular wedges, not parallel-sided bars, so the spokes are geometry in the component. Still no JS and one composited transform per frame; `fill: currentColor` inherits the label's colour with no token; sized by the icon family. Under `prefers-reduced-motion` it slows (3s) rather than stops — a busy indicator that stops moving is information lost. **Revised 2026-08-06 (LOG): the rotation rides an HTML `<span>` wrapper around the svg.** An SVG root's transform is not reliably composited — some engines animate it on the main thread, and a busy indicator that freezes when the main thread blocks fails its one job. The wrapper owns the icon box, the animation, `fill` (inherited into the svg) and the ref; the svg only fills it. The second element is sanctioned by the anatomy criterion: forced by something non-visual, not layout convenience.

### The icon box (decided 2026-08-02)

`--icon-size-1..4` = 16 / 16 / 20 / 24, pulled by the size index. Sizes 1 and 2 share 16 because the icon grid the ecosystem draws on (16/20/24 — Primer, Lucide, Material) has nothing legible below it, and a 14px raster of a 24-grid icon blurs its strokes. **Icons are `ReactNode` slots; the package ships no icon dependency.** Hugeicons is the blessed set — installed by the app (and the docs), never by the library: a bundled set is dead weight for anyone with their own, an update treadmill, and a licence surface. Stroke width, optical centering, and the set contract stay open with the icon-system decision; only the box is pinned. The Spinner rides the same box.

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
elevation  DELETED 2026-08-03 — see section 10               separation is border and fill; no shadows
material   solid | thin | regular | thick                             backdrop defense; any FLOATING component, buttons included
states     rest | hover | press                                       the +1/+2 step rule (interactive only)
size       1 | 2 | 3 | 4                                               height index (controls) / padding + corner (surfaces)
```

`appearance` (the actual fill/shadow/blur) is the **resolved output** of (tone x emphasis x bordered x material), never set directly.

**There is no `variant` prop. `emphasis` is the only loudness axis**, and its three rungs are the recipes — there is no second, rawer naming underneath to escape into. The old five-name set (`solid / soft / surface / outline / ghost`) is dead: it named construction rather than loudness, and mixing metaphors is what made it unmappable to a ladder.

**Why three rungs and not four or five.** A rung must earn a *visible* step or it does not exist. Three stays obviously separable, and matches the roughly three prominence levels iOS ships. This also settles the old blocker honestly: the ladder is no longer stretched to cover recipes that were never loudness.

**Why `bordered` is separate.** Border-versus-fill is *containment*, a different question from loudness, and forcing it onto the ladder was the entire `surface` incoherence. As an orthogonal boolean it reproduces the old range with fewer concepts: `quiet + bordered` is the old outline, `medium + bordered` the old surface. Border does one job — separate the control from a busy background — which is also why it pairs naturally with material (section 10).

**`loud + bordered` is useless, and stays legal (judged 2026-08-03, Kushagra).** A step-7 border against a solid step-9 fill does no containment work — the fill already separates itself. It is not forbidden: refusing the combination would cost either an axis-multiplying CSS rule (the exact shape the additivity law forbids) or component-level prop logic, both worse than a no-op nobody reaches for. The preview stops showing the cell; documentation says don't.

**On controls, `bordered` is honestly part of the emphasis ladder (named 2026-08-04).** `medium + bordered` reads louder than `medium`; the composed cells reproduce v1's five variants exactly (ghost/outline/soft/surface/solid). The prop stays — the ladder is real and border is how two of its rungs are built — but its §-framing as pure containment was only half true, and consumers should read the pairs as loudness steps, not decoration.

### TextField is a field, and its wrapper is the control (decided 2026-08-04, Kushagra)

**`TextField` is `size × material`, two slots, and the native input's own props. No `emphasis`, no `tone`, no `bordered`.** Loudness ranks actions *against their siblings* — Save loud, Cancel quiet, side by side — and text fields never rank against each other: a form where one field is louder than the next is incoherent, and "a loud input" names nothing the system can mean. This is the Card argument arriving at a control. What the world calls input variants (Material's filled vs outlined, Radix's `classic | surface | soft`) is not per-field loudness but **app identity** — an app uses one construction throughout — so if it ever ships it is a Theme prop, the way `surfaces` is, and not before a real app forces it. The field is bordered by identity: on a field the border is the affordance, not a rung.

**The visible control is the WRAPPER, and that is what makes slots legitimate anatomy.** A field that can hold an icon inside its border cannot keep that border on the `<input>`. Once a wrapper owns the border it owes three things no consumer can compose from outside: clicking anywhere in the box must land the caret; the input must yield to the slots without breaking `::placeholder`, autofill or selection; and an interactive trailing control must stay reachable without stealing the field's focus. That is §10's anatomy criterion met — *system-owned only where something non-visual forces it* — which is precisely why this component has slots and Card does not. `leading` and `trailing` are props rather than compound children, so the field owns order and padding deterministically; free-form children invite the arbitrary stacking that made shadcn's card header the cautionary case.

**Consequences of the wrapper, each recorded because each is a departure:** `ref` goes to the *input* (`.focus()`, `.select()`, the value — what a caller actually holds a field for) while `className` and `style` dress the wrapper, so this is the first component where the element you style and the element you hold differ. Focus rings when the input holds focus, not on `:focus-within` (see §8). The caret cursor and text selection are re-enabled over the control skeleton, which forbids both for good reason on a button. The fill states are declared as constants — a field's fill does not move; its border and ring carry its states — and that is not decoration but a hard requirement: the shared layer swaps to `--kui-fill-src-hover` on pointer, and a field that left it unset would go transparent under the pointer, invalid at computed-value time. **The same sentence has to be said twice, once for the fill the component declares and once for the fill the layer derives** (2026-08-05): material is a fill *modifier* with an interaction ramp of its own, so pinning the three sources to one colour still left a glass field lightening under the pointer — 64% -> 72% -> 80% of the same white at the middle thickness — and the trailing button fired it just by being crossed on the way to the caret. The derived hover and active fills are pinned to the resting derived value, which names no thickness.

**`disabled` is read off the input, not only stamped from the prop** (2026-08-05). Inside a `Field.Root disabled` the flag never passes through this component: Base UI computes `fieldDisabled || disabledProp` at the input, so the wrapper — the element that paints — was never told, and a disabled fieldset rendered a field that looked entirely live. The shared layer now carries a direct-child `:has()` arm beside the attribute, exactly the way `invalid` has always been read. Direct child only: a disabled control hosted in a slot must not grey out the field containing it.

**`children` is not part of the API.** It was typed on the props and spread onto the `<input>`, so `<TextField>x</TextField>` type-checked and threw at render. The slots are the way in.

**`type` is a closed union, the way `size` is** (2026-08-05): `text | email | password | search | tel | url | number`. On the native element `type` is not one axis but a *component selector* — `hidden` renders no box, `checkbox`/`radio`/`range`/`color`/`file` each render a different control with its own anatomy, and `submit`/`button` are buttons. Unconstrained, `type="hidden"` produced a **visible empty bordered box**, which is the argument in one render: the wrapper is what draws the border and the height, and a wrapper cannot honour a type it was never told about. Date and time are absent on purpose — they render a native picker inside the box and are a component, not a value of this one.

**The value wears content dress, not control dress** (2026-08-05, Kushagra: "too thick, and placeholder not light enough"). The skeleton's medium weight was designed for button labels and reached the input through `font: inherit` — inherited, never decided. A field's value is the user's *content*, and content in this system rests regular (§15, Text's own default); the field now declares it, slots included, and a hosted control re-declares its own medium through the skeleton. The placeholder was the same finding one layer down, and there it was outright drift: it read `--color-text-muted` while the faint role's own definition (§15) names "a placeholder" as its case. It reads `--color-text-faint` now; muted stays the slot colour — an adornment informs, a placeholder invites.

**`readOnly` is a state with a resolved appearance** (2026-08-05). It shipped fully accepted and resolving to nothing at all: keystrokes were refused while the field looked pixel-identical to the one beside it, so the only feedback was typing and having nothing happen. It is **not** disabled and must not borrow that vocabulary — the value is live, selectable, focusable, in the tab order and submitted with the form. Exactly one thing is gone, the invitation to type, so exactly one thing changes: **the seal**, which is what makes a field read as a well you put a caret into. Border, text contrast and the caret cursor all stay. Under a material it resolves to transparent, which is the same answer the bare rung gets under glass.

**Slot content DESCRIBES the field.** Each rendered slot gets an id and is appended to the input's `aria-describedby` — appended, never replacing, since a field inside a `Field.Root` already carries a description id. Described rather than labelled is the right relationship: an adornment ("$", "USD") qualifies the value, it does not name the field, and the name is the caller's. Before this, adornments were announced — if at all — as loose text with no relationship to the field beside them.

**There is no `render` escape, and that is a decision rather than the omission it looked like** (2026-08-05). Everywhere else `render` swaps the one element that *is* the component. Here there are two and neither can move: the wrapper exists to hold a border the input cannot hold once a slot sits inside it, and the input must stay an `<input>` or the platform wiring this component exists to preserve — labelling, autofill, form association, the `type` behaviours — goes with it. `render` would have to silently mean one of them. Refused by the type, which is the law.

**What Base UI owns and we do not:** label, description and error are `Field` parts, which already do the `aria-*` wiring; the state vocabulary (`data-invalid`, `data-focused`, `data-filled`, `data-dirty`, `data-touched`) is Base UI's, read by our stylesheet. The labelled arrangement around a field is a block.

**Measured: +247 bytes gzipped for the entire second control** (9,574 -> 9,821; the same number §14 records), because the size index, the states, the disabled and invalid remaps and material all arrived from the layer Button already paid for. That is §2's additivity claim getting its first real test rather than its first assertion.

### Card is a shell (decided 2026-08-04, Kushagra)

**Card is `size × material` and children. No tone, no emphasis, no bordered, no anatomy slots. One treatment: the opaque seal (`--color-surface`), the border, the surface radius, the padding rhythm — fixed identity, written by the component as constant data attributes, never chosen at a call site.**

Three arguments closed it, in order:

1. **Emphasis ranks actions; a container is not an action.** A "loud card" carries no meaning the system can name, so consumers would use it as a purely visual tool — the failure a semantic system exists to prevent. The rungs stay in the surface layer for the components where tone genuinely means something: Callout, Banner, Toast (status), and interactive surfaces (the control ladder).
2. **Anatomy is system-owned only where something non-visual forces it.** Dialog's title/description are forced by a11y wiring (`aria-labelledby`/`aria-describedby`); Callout's by status semantics. Nothing forces a Card layout: title-then-description-then-actions is one layout among many (stat cards, media cards, profile cards), and blessing one deprecates the rest. **Layouts are blocks (kookie-blocks), not components.** The considered-and-cut slot set is recorded in LOG so it is not re-litigated: Header (a wrapper with no layout job once the corner slot died), Footer (positional name, and Apple's `Section(footer:)` means fine print — the semantic name was Actions), Action-in-header (its only legitimate tenant is card-object operations — dismiss, overflow — whose components do not exist yet; shipped early it gets squatted by task actions, which is shadcn's own demo failure).
3. **Material stays, because a Card is a surface** and surfaces defend their backdrops — cards land on hostile imagery routinely. Apple's model concurs: no Card component anywhere, `GroupBox`/inset `Section` with one fixed treatment, materials as the real axis, card-ness composed rather than shipped.

**The rule the footer discussion produced, kept as the documented pattern:** a composition has exactly one task-action zone. Verbs of the task (Save, Login, Export) live together at the end; verbs on the surface itself (dismiss, overflow) are a different kind and get their slot when Dialog/Toast force it. The corrected login composition becomes the first documented block.

### Card-as-button: the element brings the interactivity (decided 2026-08-04)

`<Card render={<button/>}>` (or an anchor) IS the pattern — no prop, no component. The surface layer keys on the element semantics (`.kui-surface:where(button, a)`) and applies the control state machine, per this section's own rule: reuse it, never invent a surface one. Rest is pixel-identical to a plain Card — a card is a card until you point at it. Hover washes the seal to `--color-surface-hover` (guarded by `(hover: hover)`), press steps to `--color-surface-active` instantly and unguarded, keyboard gets the one shared ring, cursor and touch hygiene match the controls. **All three rungs are configured per mode**, which was wrong until 2026-08-03: hover and active were hard-coded to `--neutral-2` and `--neutral-3` for both modes while the dark seal *was* `--neutral-2`, so in dark, rest and hover were the same token and an interactive card had no hover feedback at all. Dark now rests at 2 and steps 3 / 4; light is unchanged. The law reads three resolved colours through a mounted Card, not three token names in the stylesheet. This respects the anatomy criterion: here interactivity is forced by something non-visual — the element itself — and HTML enforces the one-action rule for free, since a button cannot nest a button.

### The shadow palette: a resource, never an axis (decided 2026-08-04; consumer corrected the same day; redesigned and widened to five rows 2026-08-07)

Elevation stays deleted; taste does not. `--shadow-1..5` ships in the public token contract (§13) — five rows on the system's one index shape, ordered by height, mode-aware (dark keeps the same geometry and raises alpha only: the light source does not move at night). Row 1 is the inset well; **row 2 is the control drop** (added 2026-08-07 — the palette had no rung at button scale, and Kushagra's refutation killed the alternative: a bespoke shadow hidden inside a chrome role is a second source of shadow truth, and a block wanting a small raised chip could never reach it. More rows, not more sources); rows 3-5 are the old 2-4 renumbered while nothing is published. **Every drop row is one anatomy at a different height** (redesigned 2026-08-07, the four-worlds frame): a CONTACT line — small offset, near-zero blur, the crisp dark line under the edge that makes a shadow read sharp — plus an AMBIENT halo with **negative spread, the sharpness mechanism**: it pulls the shadow in under the element so depth drops below instead of haloing sideways. A law asserts the anatomy per row per mode: two layers, x always 0, ambient offset strictly growing with the row.

**Consumers, exactly two, and no component API anywhere:**
- **Theme `surfaces="elevated"`** — the one stylesheet consumer (§5). Each world scope declares the chrome roles, and the elements that read them paint them: `.kui-surface` reads `--kui-surface-chrome`, and since 2026-08-07 the control layer reads `--kui-control-chrome` + `--kui-control-light` through the emphasis ladder (below). **Fields left the set 2026-08-06** (they had joined 2026-08-04 on the sentence "a text field is a bordered box sitting on the page — it lifts with the cards"; the sentence was asserted, not judged): elevation separates a plane from what is BEHIND it, and a field is a **well** — content of a plane, not a plane above one. A recessed thing cannot cast a drop shadow; Material's fields are filled or outlined, never raised, and no platform shades an input. `flat` still resolves to `none`, so the default stays byte-identical to a world without the rule. **The count that matters is not how many rules exist but that every box-shadow resolves a world chrome role** — a law walks every shipped stylesheet and asserts exactly that, and pins the consumer count at two: a third appearing is a decision, and it fails there first. It escapes by declaration, like every other axis: written as a descendant selector with no reset (until 2026-08-03) a nested `surfaces="flat"` matched nothing and the elevated ancestor's rule still reached the inner cards, so a flat panel inside an elevated shell was unbuildable. An app identity, never a per-card knob.

  **The membership sentence split by what light does (§5 amended 2026-08-07, the four-worlds frame — deliberately reversing 2026-08-06's "a button stays flat" negative law).** The PLANE criterion governs surface-scale depth: elevation dresses boxes that establish a plane of their own, and a field (a well) or a mark still does not qualify. But in a world with a light source a raised CONTROL is lit too: a solid-fill rung casts the palette's control row (`--kui-control-chrome`, one shared shadow — no button can have a different one, because no button owns one) and catches light on top (`--kui-control-light`, gradient layers painted over whatever fill the rung chose, tone-independent by construction). The wiring is the rung's own statement — `--kui-ct-cast`/`--kui-ct-light` in the emphasis ladder: loud maps both world tokens, medium maps the cast only (a white wash over a pastel fill reads as fog — judged three times in the preview, 2026-08-07; gradient light is for saturated solid fills, and a pale button carries shadow alone), quiet maps `none` for both (nothing to light, and declared rather than omitted so a quiet control inside a louder surface cannot inherit the ancestor's cast). The light never moves with state; disabled stands it down (no promise, no hover above the page); material stands the CATCH down (a gradient on a veil repaints the material's own face) and keeps the cast. **A checked mark catches too (same day, Kushagra):** the checked fill is the mark family's LOUD rung (§11 — state is the mark's emphasis), so under an elevated world a checked checkbox or selected radio wears exactly the loud button's gradient over the same accent solid — one material for a form's solid fills — and never a cast: a mark is a well that fills, not a raised key. The mark declares its light `none` at rest (declared, not omitted — the ladder's tokens inherit, and a mark under a loud-emphasis ancestor would otherwise wear its light; law-mounted with a bare `data-emphasis="loud"` div). Button and the checked marks today. **And the slider thumb casts ALWAYS — flat world included (same day, Kushagra: "slider thumb needs elevation always, it's how it should be").** Depth as role semantics, the kill switch's second named exception beside the circle (§6): a grip that does not sit above its rail stops reading as a grip, and every platform ships the handle shadowed in every context. Mechanically it reads the palette row's VALUE (`--control-chrome`) rather than the world switch, which is what "always" means — the flat world and one-lift-per-pane cannot strip it — and the box-shadow consumer count re-pins at three. No catch: a gradient on a near-white circle is invisible. **Its fill left the seal the same hour ("dark shouldn't be dark"):** `--color-thumb`, the value-control family's third role — light keeps the seal, dark goes near-white (`--neutral-12`, iOS's own posture), because a grip must be the most findable object on the rail and a seal-dark handle on a dark rail was nearly invisible.

  **One lighting model, the palette its source of truth, and the edge is not special (finesse passes, 2026-08-04, Kushagra).** Three constraints closed it in sequence: the edge should read lighter at top and darker at bottom; whatever consumes shadow must share one lighting model, including shadow itself; and contrast must reach the edge. Resolution — *add depth, change nothing else*: `--surface-chrome` is `var(--shadow-3)` (dark prepends the inset rim-light a dark fill needs) and `--control-chrome` is the crisp inset rim plus `var(--shadow-2)` in BOTH modes (researched 2026-08-07 — Primer's shadow-highlight, the tactile recipes: the top catch that reads as a machined edge is a 1px LINE; a gradient wash is what fogs), so tuning a row tunes every consumer at that height; the border stays the same `--tone-border` every surface wears, which keeps the edge sharp and puts it inside the contrast system for free; the top edge reads lighter because every palette shadow falls downward. Two dead ends recorded so they stay dead: an inset ring beside a transparent border (paints inside the border strip — two lines), and a raw-alpha border (soft, and blind to `contrast="high"`). Laws: exactly two `box-shadow` declarations in the shipped stylesheets, each reading a chrome role; the chromes compose their stated rows; mounted, an elevated card's computed shadow equals row 3 exactly, an elevated loud button's equals row 2 exactly, and the card's border is identical to the flat world's.
- **Escapes and blocks** through `style={{ boxShadow: "var(--shadow-N)" }}` — lawless but visible, as `style` has always been.

**Box's `shadow` prop shipped for a day and died as a taxonomy leak (Kushagra):** Box is layout, shadow is paint, and a typed prop added nothing but a blessing the taxonomy forbids. A `@ts-expect-error` law pins the refusal, alongside Card's.

```
tone (hue) + emphasis (rung) -> role-token bundle -> scale steps -> generated OKLCH values
```

Same pattern as everywhere: expose intent, resolve to values.

### Axes are derived, not assigned

Questions about a component's nature determine its axis set:
- carries meaning -> **tone**
- an action with loudness -> **emphasis**
- can sit on a busy background -> **bordered**
- ~~has height above the page -> **elevation**~~ (deleted 2026-08-03: nothing ever varied it per call site — it was a component fact, and this list should have caught it)
- **can float over content** -> **material**
- interactive -> **states**
- has a size step -> **size**

Answer those and any component's axes fall out, including ones not yet built. **Controls** use tone x emphasis x bordered x states x size. **Surfaces** add material. **Interactive surfaces** reuse the control state machine from a subtler base.

**Material is derived from floating, not from being a container** (corrected 2026-08-01). The earlier reading gave material to surfaces only, which was wrong in both directions: a Card sitting in a solid layout has nothing to defend against, and a Button floating over a photo does. Material follows the question "can something busy be behind this," and that question is asked of buttons too.

### What this finally fixes

The system now *knows* what is primary (`emphasis="loud"`), so hierarchy is legible to tooling — a lint rule can flag two loud actions in one scope — which a pure appearance API structurally cannot, because it never learns the button's job. **Hierarchy is convention plus optional lint, not mechanism:** no auto-scoping, no auto-demotion of a second loud button. Silent demotion is the kind of magic that is impossible to debug when it fires wrongly.

### The cost, named honestly

Two axes is a grid, and most cells resolve cleanly because tone swaps hue while emphasis swaps rung. One cell needs a real answer: **`loud + neutral`, the loud grey button.** It is a legitimate and common pattern (a near-black primary), but it breaks on the generated ladder rather than on the axis model — `loud` fills with step 9, and neutral step 9 sits near L .62, a mid-grey that reads secondary or disabled instead of primary. A convincing black button wants roughly L .2. This is the same failure as the bright-hue case in section 7 (a fixed ladder producing a wrong-looking solid for one hue, here for the absence of one), so it is resolved with the solid band, not here.

Name the loudness axis **emphasis**, never "primary/secondary," which smuggles the conflation back in, and never `variant`, which invites the docs to spend forever explaining that the prop is not about looks.

---

## 10. Surfaces

**Decision (amended 2026-08-03, re-amended 2026-08-04): a surface is tone x emphasis x bordered x material. There is no elevation axis, and no call site ever chooses a shadow — the one sanctioned shadow is Theme `surfaces="elevated"`, an app identity chosen once (§5, and "The shadow palette" below).**

### Elevation: deleted (2026-08-03, Kushagra)

The section that stood here defined a four-level shadow ladder (flat / raised / floating / overlay). It died on first contact with the eye — "shadows for elevation is a no go" — and the post-mortem showed the axis was over-modelled from the start: **nothing ever chose elevation at a call site.** §11's own table fixed it per component (a Card is never floating, a Menu is never flat, a Dialog is always an overlay), and §9's rule — axes are derived, not assigned — should have caught that a prop nobody varies is a component fact, not an axis.

What replaces it costs nothing: **separation is border and fill.** In-flow surfaces (Card, Panel, Callout) separate by containment and the alpha ramp. Detached components design their own detachment when they are built — Dialog's separation already lives in its backdrop (scrim + blur, §11), and whether Popover/Menu need anything beyond border + opaque fill is decided at Popover, against a real backdrop, not pre-modelled. A law asserts the surface layer names no shadow and no elevation.

### Material: backdrop defense (Theme policy x component usage)

**Decision (revised 2026-08-04): `material = solid | thin | regular | thick`. `solid` is the default and is not a material — it is the seal, the absence of one. Three designed thicknesses, like the emphasis ladder; `regular` is the middle, SwiftUI's own name for it. Available on any component that can float — buttons included.**

**Material is backdrop defense, not decoration.** Its job is keeping the foreground legible over whatever is behind it, and it fires only when something floats over busy content. That framing makes the axis testable — does the label survive — instead of aesthetic, and it is why the axis is not surfaces-only: a Card in a solid layout has nothing to defend against, while a Button floating over a photo does.

**Three designed points, not a dial (amended 2026-08-04 — was "two recipes", superseded when the axis gained its middle).** Every lever in a recipe does legibility work, moving together by defense intensity. Values are tokens, mode-aware, and are v0 defaults judged against the photo backdrop in the preview rather than reasoned about (`regular` interpolates thin/thick as a starting point only — it is its own designed row). The alpha is what the component's **own** fill is mixed toward transparent at — material is a fill modifier, never a fill of its own (below):

```
                 bg alpha   backdrop-filter (light mode)                  dark-mode delta
thick   (max)    0.88       blur(32px) saturate(210%) brightness(1.12)    alpha 0.92, brightness 0.78
regular (middle) 0.64       blur(16px) saturate(165%) brightness(1.06)    alpha 0.71, brightness 0.88
thin    (veil)   0.30       blur(5px)  saturate(130%) brightness(1.02)    alpha 0.38, brightness 0.95
dim / scrim      -          rgba(0,0,0,0.40) + blur(4px)                  rgba(0,0,0,0.55)
```

Why these and not near-opaque: alpha stays translucent because if you cannot sense the backdrop you should have used `solid`. Legibility comes from blur, saturation, and brightness, not from pushing alpha toward 1. The ~12px blur floor applies to the *defending* recipes (regular, thick) — `thin` sits below it deliberately, because thin is a veil and the backdrop's structure ghosting through is its point, not a failure. The ~30px mush ceiling binds `regular`; `thick` rides just past it on purpose — it is the near-seal, and losing the depth cue is what maximum defense costs (spread widened twice 2026-08-04, judged against the photo: the ladder is monotone in every lever so thickness reads as one dimension). Saturation is the actual defense: the material's own tint has to dominate so image colours cannot bleed into the label. The scrim's 4px only needs to push the app back, not frost it.

**The brightness floor is load-bearing and its direction follows the label:** dark label means brightening the backdrop, light label means darkening it. That branch is what lets a material control survive an *arbitrary* photo rather than the demo one. It needs no new mechanism — section 7 already computes this signal as `--accent-contrast` (APCA-derived, "is the foreground light or dark on this fill"), so the recipe reads it. The label never moves; the material adapts around it.

**No vibrancy.** We take iOS's concept (a translucency axis, orthogonal to elevation) and skip the glass simulation. Two recipes, not five magnitudes, because ours vary saturation and brightness *against* opacity to make two characters rather than one dial.

Two scopes, **clamped**:
- **Theme `material` = policy ceiling.** "Is translucency *allowed* in this tree." Default permits; can force-off globally (perf, embedded context, illegible backdrop). The global kill switch.
- **Component `material` = per-component usage.** Defaults `solid`; opts in.
- **Clamp:** Theme caps component. `Theme=solid` forces the whole tree solid and ignores a component's `thin`/`thick`, so the kill switch works without hunting.

### Material is a fill modifier, not a fill (2026-08-04, Kushagra — supersedes the same-day "glass owns the fill")

**Material makes whatever fill the component would have painted translucent at the thickness alpha, and adds the filter.** It never chooses a colour of its own — the first cut shipped a white veil (mixed over the page colour) that erased tone and loudness under glass, and died within hours on Kushagra's question: if the veil can tint from neutral, why not from whatever fill the rung already chose? So the rungs publish their fills as sources (`--kui-fill-src[-hover/-active]`, `--kui-sf-fill-src`), the painted value reads through a fallback chain, and material re-derives every state as `color-mix(in srgb, var(<source>) var(--material-<t>-alpha…), transparent)`. Consequences, all of them simplifications:

- **Both axes survive the glass.** A loud accent button under glass is translucent accent-9; medium is a soft veil; **quiet is bare blur** — the absence of a fill, frosted. Tone and emphasis ride into the veil through the role layer, one rule per thickness, no tone × material product.
- **The rung keeps its own label pairing.** The fill is still the rung's, merely translucent, so loud keeps `--tone-contrast` and the others keep `--tone-label`. Thin-glass-over-a-bright-photo legibility is the deferred brightness-floor branch's job, not a label swap.
- **Interaction steps glass's one ramp: the mix percentage.** Each thickness carries designed `[rest, hover, active]` alphas (§8's +1/+2 translated), stepping the veil toward its own seal, monotone per column. The filter never moves with state — a blur change re-samples the backdrop and shimmers.
- **The opaque environments are the fill nearly sealed.** No `backdrop-filter`, or reduced transparency: every state mixes its own source at `--material-opaque-alpha` — a 30% veil defends nothing without blur, so the fallback is the rung's fill at ~95%; quiet honestly stays bare.
- **The surface layer is the same law one level up, and Card is its special case.** The quiet rung's source is the opaque seal, so a glass Card is the seal made translucent — page-coloured glass, which is why Card never visibly changed when the rule generalised. A tone-forward surface (Callout, Banner) will tint its own veil the day one floats. Interactive surfaces re-derive their hover/press steps the same way, so a glass card never flashes opaque under the pointer. The derived fills carry `@property inherits: false` guards — a plain card nested in a glass card keeps its seal.

The Theme policy clamp (still open, below) stays what makes this reversible tree-wide: forcing solid returns every component to its opaque fill.

### Material costs frames, so the levers are architectural

`backdrop-filter` has no cheap implementation; cost is driven by how many elements blur and whether they re-composite per frame. Four rules follow:

- **One glass per stack.** A material control inside a material container is double glass, the same error as double shadow. Prefer the toolbar being the glass and its buttons plain.
- **Prefer material on fixed chrome that content scrolls *under*.** A blurred element that itself moves re-samples its backdrop every frame.
- **Honour `prefers-reduced-transparency`** by falling back to opaque. An accessibility requirement and a performance escape in one.
- **`@supports` fallback to a higher-alpha opaque fill** where `backdrop-filter` is unavailable.

Blur radii are provisional until measured on a mid-tier device.

### Placement is the user's; the library only defines what material looks like

Material is only *situationally* correct — over a solid surface it blurs nothing and reads as a muddy smudge. We neither block it (rigidity leaks) nor stay silent (people ship the smudge and blame the library), so: **allow and guide.** Default `solid` everywhere so nobody stumbles into it, document that material is for controls floating over media or content, and add a dev-time nudge for material-over-a-solid-parent, in the same spirit as the double-glass warning. The bad case and the good case both require someone to type the prop deliberately, and the default is always safe.

**Border and material pair naturally.** Both answer "this control is sitting on something busy" — one by containment, one by defense — so `bordered` composes with any material.

**The edge belongs to the material (closed 2026-08-05, Kushagra: blur plus the ordinary card border read "cheap" — the border looked slapped on, and was).** A material is a pane, and a pane owns more than what light does passing through it. On surfaces, three of its parts are now the material's own, per thickness and mode, all v0 for the eye:

- **Edge:** the tone border on glass was opaque pigment on a pane of light. Under a material the border resolves to `--material-<t>-edge` — a translucent white hairline, stronger with thickness — consumed with a `var(--tone-border)` fallback that resolves at the element.
- **Rim:** a top inner light catch, painted as a `background-image` gradient rather than a shadow — the scene's one light source falls downward (the shadow palette's own model), and using a background layer keeps the one-box-shadow law out of it entirely.
- **Separation stays the app's** — deliberately NOT the pane's. A first cut welded `var(--shadow-2)` to glass ("a pane floats by definition") and was reversed the same hour: a pane that always floats overrides the flat identity. Rim and edge are what the material *is*; depth follows `surfaces="elevated"`, so a flat world's glass has edge and glint, no lift.

**Elevation meets the material at two seams (2026-08-07, the four-worlds frame — Kushagra: the interaction "has to be deeper than what it is"; what makes blur read as substance is light responding to it).** Both are config values per thickness, both consumed through the elevated scope, so flat worlds are untouched by construction. **What a pane CASTS is the app's shadow transmitted:** glass passes light, so an elevated glass surface's chrome re-points to the surface row FADED by a per-thickness `transmission` factor (thin passes most, thick least, all weaker than a solid slab) — generator-DERIVED from the palette row, never authored, so there is still exactly one source of shadow truth (the same refutation that killed the bespoke button shadow), and a law re-derives each faded row. The no-blur fallback and reduced-transparency both re-seal the pane and take the world's full chrome back (`inherit` — a sealed pane stops transmitting). **What a pane CATCHES rises under the sun:** the elevated scope remaps each `-rim` to a brighter `-rim-lifted` (both declared in the appearance scopes; the world block stays mode-blind, the look axis's own rule), and `contrast="high"` empties the lifted variant alongside the resting one so the remap cannot resurrect the glint the setting removed. Mounted laws: elevated thin glass casts exactly the faded row — weaker than the solid card's, still a shadow; flat glass casts none; the two worlds' rims both paint and differ. **And one lift per pane (same day, from the preview — buttons on dark glass cast "an extremely dark shadow"):** dark's shadow alphas assume a dark page that swallows them, but a pane swallows nothing — the backdrop shows through and a control's cast lands on it like ink. A material surface stands `--kui-control-chrome` down for its whole subtree (inherited, no selector into the control layer): the pane is the raised thing and its contents sit flush on it, the platform's own posture. The catch stays — it paints over the control's own fill, which glass never changes. Mounted: a loud button inside an elevated glass card casts nothing and keeps its gradient.

**`contrast="high"` leans on the glass, it does not unmake it.** Each thickness carries a designed `alphaHigh` triple — more opaque, never fully, so the three thicknesses stay distinct (a first cut reused the reduced-transparency fallback and collapsed them into one). The edge and rim empty, sending the border back to the tone system, which is the one place high contrast can reach it. Reduced transparency keeps meaning the near-seal.

### Two surface-only rules controls never needed

**A surface sets foreground context, not just a background.** It colors everything nested inside it. A soft-red Callout sets its text to `--accent-text` (red-11) and muted text accordingly so arbitrary children read correctly; a solid-accent Banner flips children to `--accent-contrast` (APCA) text. Mechanically the surface re-scopes the foreground role tokens (`--color-text`, `--color-text-muted`, `--color-contrast`) on its subtree. Translucent surfaces have a **legibility dependency** solid does not: text contrast rides on the backdrop, so they need a contrast floor (subtle scrim / min backdrop-darkening) or text fails over busy content. This is where "surface sets foreground context" grows teeth.

**Retracted (2026-08-04): the default surface fill is not alpha — it is the opaque seal.** The paragraph that stood here argued nested surfaces should default to alpha backgrounds so levels auto-differentiate by compositing. Built and judged, it failed twice at once: at the neutral end of the ramp the per-level difference (~1.2%) is invisible — nested surfaces visibly separate by **border**, not fill — and over media the "surface" was a border floating on a photo. The category error, named by Kushagra: translucency is **material's** job, and an alpha default was material's responsibility leaking into the shell. The default fill is now `--color-surface` (opaque, page-coloured, mode-aware). The alpha ramp keeps its real surface job in the tone-forward rungs (`--tone-a3` for Callout's dressing), where the fill carries chroma and is actually visible.

### Interactive surfaces

A clickable card, table row, list/menu item is a **control wearing a container**: it reuses the control state machine rather than inventing a surface one. One machine, two dressings.

The rest state is the surface's own fill, not a ghost — for Card that is the opaque seal, so rest is pixel-identical to a plain Card (a card is a card until you point at it) and the ladder steps the seal: `--color-surface` -> `--color-surface-hover` -> `--color-surface-active`, all three configured per mode. **This paragraph described a transparent-at-rest ghost stepping to `--tone-3` / `--tone-4` until 2026-08-03**, which the 2026-08-04 seal retraction had already falsified in every term: a transparent rest is exactly the fill that vanishes over media, which is what the retraction exists to prevent.

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
| TextField | *(fixed identity)* | *(none)* | *(always)* | solid | the seal + border; see "TextField is a field" below |
| Tabs | neutral | quiet | - | solid | active tab takes accent |
| Segmented Control | neutral | medium + bordered | - | solid | selected segment bumps a step |
| Slider | neutral | - | - | - | track low, fill accent — SHIPPED 2026-08-06: root on the height ladder (the target), thumb = mark(n), track = --color-track at --slider-track-N |

**Binary controls** (tone x states; emphasis implicit)

| Component | tone | emphasis | elev | material | notes |
|---|---|---|---|---|---|
| Checkbox / Radio / Switch | accent (on) | - | - | - | neutral off, accent on — Checkbox shipped 2026-08-05, Radio 2026-08-06 (the ON state written once, `.kui-mark:where([data-checked])`) |

**Inert atoms** (size x tone x emphasis; no states)

| Component | tone | emphasis | elev | material | notes |
|---|---|---|---|---|---|
| Badge / Tag | neutral | medium | - | - | often colored, defaults neutral |
| Code / Kbd | neutral | medium | - | - | subtle fill |

**Surfaces** (all four axes)

| Component | tone | emphasis | elev | material | notes |
|---|---|---|---|---|---|
| Card | — (shell: fixed neutral quiet + bordered identity, no visual props; `size × material` only) | | | solid | see §10 "Card is a shell" |
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
| Text / Heading / Blockquote | any (opt-in) | ladder-as-roles | - | - | *read* the foreground context the surface sets; emphasis picks WHICH role (loud text / medium muted / quiet faint) and a chosen tone re-scopes the ladder onto the family's ink trio (§15) |
| Link | accent | - | - | - | accent + hover/visited states |

### Four rules generate every row

- **Material is `solid` for everything** in the defaults, and is available on every component that can float, buttons included. `thin`/`thick` are always opt-in, correct only over media or scrolling content. The Apple-rollback lesson hard-coded into the resting state.
- **Tone is neutral for everything** except the genuine accent-default spots: Checkbox/Radio/Switch (on), Link, and the active state of interactive surfaces. Status surfaces (Callout, Banner, Toast) are tone-*forward* by intent but still default to neutral hue until a color is set.
- **Elevation is deleted (2026-08-03)** — the `elev` column in these tables is historical; no component takes it and nothing casts a shadow. What survives of its logic is the stacking rule: one glass per stack (section 10).
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
control family    -> scale, then the density set  (control-height, control-px, radius-control)
                     control-height and control-px are designed lengths; radius indexes its palette
icon-label gap    -> scale (via space), size and pointer only  (--control-gap-N; the label cluster, never density — amended 2026-08-04)
layout space      -> scale (via space), then the density set  (--layout-space-N picks; sections 3, 12 — decided 2026-08-04)
surface padding   -> layout space, fixed picks                (--surface-p-N; section 10 — density speaks through the layer)
color             -> neither                      (compiled static; not a runtime multiplier axis)
```

**Density is not a multiplier. It selects a designed set.** Each level (`compact`, `default`, `comfortable`) re-declares the control family — height, inline padding, and control radius — as placed values, emitted at build time under a `[data-density]` block. The icon-label gap left the set 2026-08-04 (Kushagra): density grows the box and holds the content, and type, the icon box, and the gap binding them are one **label cluster** — the gap is size-indexed, re-declared per pointer world (the coarse cluster spreads with its box, section 16), and a law asserts no `[data-density]` block declares it. Heights and inline paddings are raw numbers per level (padding joined them 2026-08-05, section 3); the radius family moves by a step offset into its palette, with per-cell overrides where an offset lands wrong. Nothing is a product, so nothing resolves to an arbitrary 26.78px, and every cell is correctable on its own — a multiplier can only move a whole level at once, which makes every taste correction global. **Layout space joined the set 2026-08-04** (Kushagra; it superseded, the same day, a morning mechanism that gave surface padding its own per-level sets — one lever, not two): each density level places twelve picks into the untouched space palette (`--layout-space-N`), the default level being the 1:1 identity map. Every layout prop resolves through the layer, surface padding picks from it (re-baked per density scope — substitution-at-declaration, section 6), and the v0 shape shifts steps 1-8 by one while the gutter band (9-12) holds at identity, so "compact must not collapse page gutters" survives as a placed choice rather than a hard rule. Density still never touches the space palette itself; a level only picks different steps from it. The pointer axis never touches the layer (section 16).

**Radius participates.** A large density delta changes visual size enough that a fixed corner reads boxy; section 6's rule that a bigger control wants a bigger corner is about visual size, not about the size index.

**What density never touches:** the space palette, so compact cannot shrink page gutters (the coarseness section 4 rejects in Radix's single `scaling` knob), and type, which is the whole point — density buys breathing room at a fixed label size, where `size` would move the type too.

**One invariant, law-tested:** for a given size, compact < default < comfortable. Nothing orders across both axes; a comfortable size-2 sitting above a compact size-3 is what density means, not drift.

### Strict dependency direction, no cycles

```
raw px constants
  -> base scale (via --scale; radius and control values come from the radius and density sets)
    -> semantic tokens (--radius-control-N, --radius-surface-N, --control-px-N, ...)
      -> variant recipes (soft/solid/...) -> components consume via tone x emphasis
         (user-authored components may consume base directly)

color: OKLCH anchors + curve -> build-time generator -> static --accent-N (+ alpha) -> role tokens -> recipes -> components

Theme props drive the factors, the color hue, and the material policy at the top.
```

---

## 13. Public token contract

**Both layers are public, with different jobs:**
- **Base scales** (`--radius-0..10` + `--radius-full`, `--space-1..12`, `--accent-1..12` + alpha): the palettes, sampled freely by user-authored components. Public, complete, primitive.
- **Semantic tokens** (`--radius-control-N`, `--control-px-N`, `--accent-solid`, the variant recipes, etc.): the convention, for our components and for users building control-like things.

**Why the base palettes must ship:** once users compose their own components, the palette is the contract, not an escape hatch. A user who writes `8px` opts out of the theme (frozen). A user who writes `var(--radius-3)` or `var(--space-4)` stays in, their component reflows with the theme exactly like a native one. The token sells theme-reactivity that a raw value structurally cannot. The base scale's job is to make the themed path more attractive than the hardcoded one.

**The rule users follow:** consume the numbered tokens and the semantic axes; control them via Theme props. Never redefine a resolved token (`--radius-3: 10px` leaves the system). The `calc()` and the color compilation live inside our layer where users do not touch them. Private `--kui-*` mechanism vars (the responsive remap plumbing, section 2) are not part of the contract: undocumented, unstable.

**`--scale` is reserved, not public.** It stays unprefixed because it is the system's one remaining factor and is intended to become public if it ever earns a Theme prop (section 5); `--kui-*` is for plumbing that never will. Until then it is undocumented and unsupported: set it and you own the fractional values that result.

**Tailwind bridge (optional, sanctioned):** for teams that keep Tailwind in app code, ship a preset mapping its theme onto our variables (`spacing: { 4: "var(--space-4)" }`, colors onto `--accent-N`, …). The threat Tailwind poses to the system is its parallel token scale, not its syntax; with the preset, even `mt-4` written by a defector resolves through the token contract and reflows with the Theme. Our own components never use it.

---

## 14. Build order (first vertical slice)

Architecture is locked; open items are tuning values resolved as the component that needs them is built, not before. Build in this order so every layer and the CSS-size thesis are validated before scaling to the full component set.

1. **Scaffold.** pnpm + Turborepo + tsdown (Rolldown/Oxc) + Lightning CSS + Changesets + Vitest. `packages/ui`, `apps/docs`, shared config. The CI budget gate is wired on day one, even while it measures nothing.
2. **Token pipeline.** Space, radius, and type scales first — static calc chains, a day's work, exercising the whole path (config -> generation -> tokens.css -> measurement) with zero research risk. Then the OKLCH color generator: the long pole; budget it at 2-3x anything else, and test with hostile hues (brand yellow, neon lime, near-black navy) before calling the law proven. **Measure with a two-accent config** (alpha ramps x modes x tones) so the budget covers section 7's full output.
3. **Box + the responsive mechanism.** Variable remap, `@property` inheritance guard, the full prop table on one primitive. **Measure its CSS** to prove O(props x tiers) before any other layout primitive ships. (The blocker-1 proof; needs only the space tokens, so it can overlap the color work.)
4. **Theme + layout primitives.** Theme (scoping the CSS vars, nesting/inheritance) + Flex, Stack, Grid as typed sugar over Box. Proves token consumption and the layout layer.
   - **4b (added 2026-08-02): the pointer axis.** Coarse designed sets in config, generator emits the (family × pointer × density) cells, Theme gains the `pointer` prop, preview gains the coarse matrix (pinned via `data-pointer`), budget re-measured. Laws: the rendered floor holds under coarse (asserted against the box, including under a hostile root font-size), per-world monotonicity, the space palette untouched by pointer (§16).
5. **Button, end-to-end.** Full axis model (tone x emphasis x states x size) on one control, wrapped over Base UI's Button (§1) — the package's first runtime dependency. **Measure its CSS** to prove variant-as-token-remap (additive, not multiplicative) before scaling. Gates cleared 2026-08-02: focus-visible, disabled, loading, icon box decided (§8, §4); motion deferred without gating (§8); coarse v0 numbers accepted as refinable, not blocking (§16); Theme-as-query-container decided yes (§2). **No gates remain.**
   **Shipped 2026-08-03.** Base UI behind the Kookie surface; `size × tone × emphasis × bordered × loading`; Spinner as a one-element primitive (a `<span>` wrapper joined 2026-08-06 — the rotation must ride an HTML element to stay composited; §8, LOG). Measured: **+1,206 bytes gzipped for the whole control layer** (8,105 total against the 40,960 ceiling), of which `button.css` is ~480 — the rest is `system/recipes.css`, shared by every control that follows. The additive claim is asserted structurally as well as measured: a law forbids `button.css` from naming any tone, rung or size, and forbids the recipe layer from ever selecting one axis against another. `material` deliberately did **not** ship on Button — §10's recipes were v0-pending-measurement and step 6 is where they got judged. **Material returned 2026-08-04**, after Card proved the recipes: the control layer gained the material block, Button the prop, and `button.css` still names no axis — material included, law-tested. The first cut (a white veil owning the fill) was superseded the same day by the fill-modifier model (§10 "Material is a fill modifier"): the veil is the rung's own fill at the thickness alpha, so tone and loudness survive the glass.
6. **Card, end-to-end.** One surface, proving elevation + material + foreground-context + alpha-nesting.
   **Shipped 2026-08-03; elevation deleted the same day on first judgment; stripped to a shell 2026-08-04 (§10).** The surface layer (`system/surfaces.css`) is recipes.css one level up: rungs resolved through the seal and the alpha ramp (the opaque `--color-surface` quiet, `--tone-a3` medium, solid loud — the quiet rung was `--tone-a1` until the same-day retraction below), the §10 material table as tokens with the `@supports` fallback and `prefers-reduced-transparency` override in cascade order, and foreground context as `--color-text` / `--color-text-muted` roles re-scoped by the tone-forward rungs. No shadows: the v0 ladder was built, judged by eye, and killed — separation is border and fill, and a law asserts the layer names no shadow and no elevation. **Card ships zero CSS of its own — a law asserts card.css does not exist.** Measured: +426 bytes gzipped for the surface world after the deletion (8,538 total). v0 taste still pending judgment: surface padding (12/16/24/32 on the size index, default 3), material values against the hostile backdrop. Deferred with §10's open list: Theme material policy clamp (naming still open), the brightness-floor branch, the material border edge, dev-time nudges, whether surface padding takes density, the opaque-seal opt-out for a plain surface over media.

This slice exercises every layer (tokens -> variants -> control -> surface) and the CSS budget. Everything after it is repetition across the component set.

**Repetition, first entry — TextField, shipped 2026-08-04 (§9, §11).** The second control, and the additivity claim's first test with something to compare against: **+247 bytes gzipped** (9,574 -> 9,821), against Button's +1,206 for the control layer it created. What is genuinely new is the wrapper pattern and one shared-layer addition (the `invalid` tone remap, §8); everything else was already paid for. Laws: 23 mounted, written to the post-audit bar — computed values only, both appearances — plus structural laws for the invalid remap, the icon-box mechanism, and the two claims that had quietly gone stale (every focus rule reads the ring tokens; every `box-shadow` reads the world's chrome), both mutation-checked. Standing debts it opened: the `leading`/`trailing` versus Button's `icon`/`iconEnd` spelling, the absent `render` escape, and iOS's zoom-on-focus below 16px at sizes 1-2 — all recorded in the Open-questions list.

**Repetition, second entry — TextArea, shipped 2026-08-05 (§4, §8, §11).** The first non-fixed-height control, for **+91 bytes gzipped** of CSS (14,146 -> 14,237) — the additivity curve still bending the right way (1,206 -> 247 -> 91). ONE element, no wrapper and no slots: the anatomy criterion applied twice with two answers — TextField's wrapper exists because a slot forces the border off the input, and a textarea has no slots (an adornment floating over a scrolling paragraph is not a designed position), so the border stays on the `<textarea>` and every wrapper debt never exists. Height leaves the ladder per §4's own rule ("non-fixed-height components: padding is the dimension") — **and the dimension is ONE inset, all four sides (reversed same day, LOG "the frame is the inset").** The first cut derived the block padding from the height token — `(height − line − 2·border) / 2` — so a one-row TextArea matched a TextField exactly; Kushagra caught in the preview what the residue looks like with a second line: a paragraph framed 13px at the sides and 9px above, an asymmetry nobody chose, because centering leftover is not an inset. Every real textarea is a multi-row paragraph (one row is TextField's job; a chat composer is its own component with its own needs), so the paragraph wins outright: block padding IS the side padding — the plain value, not the pill value, at every radius level (the pill bump corrects text running sideways into the corner at its widest swing; vertically the curve has flattened to under half a pixel where the text starts — no exception for roundness, judged in the preview). A `rows={1}` textarea therefore sits taller than a field, accepted; the control height survives as a floor, never a ceiling. Growth is content's (`rows`; a law asserts it arrives in whole lines). `resize` is vertical-only by stylesheet default — horizontal resize breaks the column that owns the element — and is NOT a prop: a prop that renames a raw CSS property earns no row (ENGINEERING §5), `style` is the escape. One shared-layer addition: the disabled remap's third arm, `.kui-control:disabled`, for the control that IS the native form element — no wrapper to tell, no attribute to stamp; whichever route disables it (our prop, or a `Field.Root` computing it at the control), it lands as the native attribute, the one truth. Refused by the type: `children` (React's contract for form values is `defaultValue`; two spellings for one fact is drift), `cols` (the same character-count width hack the field's native `size` is), `render` (the one element must stay a `<textarea>` or the platform wiring goes with it), `emphasis`/`tone` (TextField's argument verbatim). The zoom floor lands on the element's own type — one element means no wrapper holds the designed step where the floor is live; the line height keeps its token, so the paragraph stays on the designed rhythm. 20 mounted laws; the structural laws (no-axis, role-not-family, icon-box) now walk a third component stylesheet.

**Repetition, third and fourth entries together — Radio and Slider, shipped 2026-08-06 (§4, §6, §11).** Landed as one change on purpose: the slider thumb is the mark family's third member, so the two arrivals are what triggered the family's promotion into the shared layer (the rule TextArea's LOG set — see §4). **Radio** is the checkbox's shape sibling: everything structural is the family's, `name`-grouping and roving focus are Base UI's `RadioGroup` (a Kookie `RadioGroup` wraps it — zero CSS, `render` open so the group can BE a Stack), and its one own fact is the circle (§6, role semantics). Refusals inherited by name: `children`, `render`, `nativeButton`, `readOnly` (the group refuses it too), `tone`, `emphasis`, `material`. **Slider** is the first value control: the ROOT is the control — the height ladder is the target, no new mechanism — the thumb rests as every mark rests, the track wears the new `--color-track` role at the new `--slider-track-N` designed ladder, and the fill is `--tone-solid` under the stamped accent identity, so the shared disabled remap greys the whole control through the one arm. Fixed identities: `thumbAlignment="edge"` (the handle stays inside the rail); horizontal only (`orientation` refused — vertical ships as its own designed set the day something forces it). Range sliders are the same component (array value, one thumb per entry). 71 mounted laws between them; the structural walks audited both stylesheets the day they existed, which is what ENGINEERING §2.1 was written to do.

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

Anchor-derived off `--font-size-base` (step 3) x `--scale` — never `--density` (section 12). Nine steps, not six: type's dynamic range (12 to 56+) is wider than the control family's, the same reasoning that gave space 12 steps and radius 6 (section 6's ceilings rule). The type bands (section 17) re-price the palette per band — a size step names a *role on the ramp*, and what a role renders as follows the band, the same move contrast makes on colour roles; density still never touches it, and the handheld band's carrier is the pointer axis itself (the `device` prop is dropped — section 17).

### Line height: paired, not derived

Each step ships a designed `--line-height-N` (reading sizes ~1.5x, display sizes tightening toward ~1.1). One global ratio is wrong at both ends — the same anti-derivation stance as radius-from-height (section 6). Inside fixed-height controls, line height is 1: the box centers its contents (section 4); leading is a text-flow concern.

### Letter spacing

`--letter-spacing-N`, ~0 through reading sizes, slightly negative at display sizes. Paired with the step, same rule as line height.

### Weights

`--font-weight-regular / -medium / -semibold / -bold` (400/500/600/700). Closed set; `light` deferred until something needs it. Text defaults regular, Heading defaults bold; the `weight` prop takes token names, never numbers.

### Families

Three slots, set by Theme (section 5): `--font-heading`, `--font-body`, `--font-mono`. Components read slots, never raw stacks; the Theme props are the only place a stack is written.

### The components (shipped 2026-08-04)

`Text` and `Heading` are one type system through two family slots, resolved by a shared type layer (`system/type.css`) the way every control resolves through recipes.css — neither ships a stylesheet of its own, law-tested. `size` spans the full `"1"–"9"`; a step joins the three paired scales at one index. `weight` takes the token names. No margin: spacing belongs to the layout that owns the relationship (section 3). Tone-less by default: text reads the foreground context its surface sets (section 11).

**`tone` reaches text as a semantic family, never a colour name (2026-08-04).** The meaning is the API — `tone="destructive"` says *error*, and the theme resolves the pigment — which is section 7's law applied to type; a raw colour rides the `style` escape, spelled where review sees it. A chosen tone re-scopes the emphasis ladder onto the family's **ink trio**: `--{tone}-ink` / `-ink-muted` / `-ink-faint`, new roles carried by the tone indirection, so no type rule ever names a family. Neutral's inks are designed steps (12/11/10 — the tone-less roles exactly, so `tone="neutral"` and no tone are one ladder, law-tested). A chroma family has exactly one designed text colour (step 11; 12 is the high-contrast variant, and 9/10 are solid fills — *more* vivid below the text step, not less), so its loud ink is step 11 — an error reads red, not near-black — and the lower rungs fade the ink by mixing it toward transparent, the material mechanism applied to text. Mix percentages are v0. A tone is stamped only when chosen; an explicit tone survives a loud surface's collapse (a choice is respected, the tone-less default is protected), which also makes the call site responsible for a coloured line over a solid fill.

**`emphasis` reaches type — the third resolution of the one axis (2026-08-04).** Controls resolve the ladder as fills (section 9), surfaces as dressing (section 10); type resolves it as the foreground roles: loud reads `--color-text`, medium `--color-text-muted`, quiet `--color-text-faint` (a third role, v0 at neutral-10). Text **rests loud** — the deliberate inversion of the control default, because full contrast is the accessible resting state for reading; a screen ranks its actions, not its paragraphs. Quiet is below body-copy contrast by design (a timestamp, a placeholder) and never carries a reading-length line — the call site's law. On a loud surface all three rungs collapse to `--tone-contrast`: legibility over hierarchy, since the APCA-chosen contrast is the one colour guaranteed against a solid tone fill. Strength has no rung because it is already spelled twice: `weight` prices it, `render={<strong/>}` means it.

Defaults, chosen not derived: **Text** renders a `<span>` at size 3 (the anchor step), regular — flow is the layout layer's job, and a paragraph is `render={<p/>}`. **Heading** renders an `<h2>` at size 6, bold — a page rarely wants a second `h1`, so the default is the level a section actually reaches for, and the real outline level is named through `render` (section 5). Visual size and outline level are deliberately independent axes: `size` prices the type, `render` names the document structure.

---

## 16. The pointer axis

**Decision (2026-08-02, in principle — values open): the system renders two complete geometries, `fine` and `coarse`, the way it renders two complete color modes.** Same components, same size index, same laws — different placed values. Not a mobile mode: a phone is not a small desktop, and the signal is what touches the screen, never how wide anything is (THESIS §7). KookieUI targets apps and products, and products get used on phones whether anyone designed for it or not — so coarse is a first-class world, not an adaptation bolted on.

Sorted by the governance tiers (THESIS §7):

### Two target sizes, and they are different tiers (corrected 2026-08-03)

The distinction the earlier draft got wrong: **44 is not the accessibility floor.** WCAG 2.2 SC 2.5.8 *Target Size (Minimum)* is **24×24 CSS px at Level AA** — that is the enforceable requirement. The 44×44 figure is SC 2.5.5 *Target Size (Enhanced)* at Level AAA, and Apple's HIG number. Treating AAA as the floor made the system look like it needed a runtime mechanism it does not.

- **Locked (tier 1): 24px.** No designed cell in any pointer world at any density may fall below it. The smallest control in the system — fine, compact, size 1 — sits at exactly 24. Law-tested across every cell.
- **Opt-out default (tier 2): 44px on the default path.** Default density, size 2, coarse pointer renders 44. That is what a consumer gets without thinking, which is the whole inversion (THESIS §7). Going below it takes two deliberate acts — asking for size 1, or setting a denser theme — and a smaller control in a specific place is a legitimate design choice, not a defect.

**No runtime reserve.** The geometry alone carries both guarantees, which means no control needs a layout box that differs from its painted box, which means **no control needs a second element** — Button is one element plus its content slots. The `max()` reserve considered earlier is dropped; it only ever earns its keep for something whose *visual* size is genuinely below 24 (a Checkbox glyph), and that is a Checkbox decision, not a system one.

Interactive surfaces — a table row, list item, clickable card, "a ghost-emphasis control wearing a container" (§10) — inherit the same designed geometry through the control machinery they already reuse.

### Opt-out default: the coarse geometry

Under `pointer: coarse`, these families re-declare as **designed sets** — placed values per (family × pointer × density), never multipliers, exactly as density levels work (§12):

| Re-placed under coarse | Why |
|---|---|
| Control heights | The visible growth; the height token is the only thing that can grow a min-height control (§4) |
| Control inline padding | Larger type in a taller box wants more air |
| Icon-label gap | The label cluster spreads with the much larger coarse box — the one axis the gap follows besides size (section 12) |
| Control radius | The corner-holds-~0.2-of-box law (§6) prices the bigger box |
| Type + line height | **Resolved 2026-08-04, amended 2026-08-05: reading type follows the `handheld` band (section 17), which rides this axis's own scopes.** The conjunction that once separated them is gone — it was excluding tablets from a rise Apple gives them. The `device` prop that briefly kept type and targets separable is dropped: pinning `pointer` moves both, because coarse means handheld (section 17, LOG) |

**Deliberately untouched:** the space palette AND the layout-space layer over it (gutters and gaps must not inflate on the smaller screen — a phone needs more content per inch, not less; layouts adapt on their own because controls grow and gaps hold), surface radii, elevation, color. Static surfaces do not change; only their interactive contents do.

**The opt-out is a Theme prop, symmetric with appearance:**

```
appearance: light | dark | inherit
pointer:    fine  | coarse | auto     (default auto)
```

`auto` follows the media query; pinning forces a world — which is also how the coarse matrix gets judged in a desktop preview. Theme stamps `data-pointer`; coarse values emit under the attribute plus a media-scoped default for `auto`. Composition with density multiplies cells, the same lesson radius × density taught: any token reacting to two scopes is re-declared per cell, and gzip absorbs the repetition.

### Taste: every number

The v0 heights. Size 2 at default density is the path a consumer lands on without choosing anything, so it carries the 44 target; the rest are placed around it:

| | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| fine — compact / default / comfortable | 24 / 28 / 34 | 28 / 32 / 40 | 34 / 40 / 50 | 40 / 48 / 60 |
| coarse — compact / default / comfortable | 32 / 36 / 40 | 38 / **44** / 48 | 46 / 52 / 58 | 54 / 60 / 68 |

Sizes below 44 under coarse are deliberate: a size-1 control in a dense toolbar is a design choice a consumer makes on purpose, it clears the AA floor with room, and pulling it up to 44 would erase the size index exactly where someone reached for it. All numbers await the (size × density × pointer) preview matrix, like density's did.

### Open

- Every coarse value; the body-type question above.
- **The `any-pointer` split (proposal, needs a device pass):** the visible geometry keys off `pointer: coarse` (primary input). Whether a touchscreen laptop should get anything from `any-pointer: coarse` is unresolved — and with the reserve dropped there is no longer an invisible mechanism to give it, so this now means "should a hybrid device get the coarse geometry outright," which is a bigger question with a real visual cost.
- Budget impact: cells roughly double across the control families. Measured when generated, not estimated.

Rejected: rem-derived geometry from a root font-size switch (one root scales gutters and type together — a multiplier by the back door, and gutters must not grow on phones); the floor as `max()` on the *height* token (flattens size 1 and 2 into the same rendered box, collapsing the index); invisible hit-area expansion via pseudo-element **as a system-wide geometry mechanism** (its safe extent depends on neighbour gaps, which CSS cannot read — clamping was guesswork and overlap was silent). *Narrowed 2026-08-05:* the mark family (§4) does expand this way, and is allowed to because it does not clamp — its extent is `min(control height, 44)`, the box a control of that size already occupies, so the reach is a known number per cell (≤11px, law-tested) rather than a guess — and it obliges a stated spacing rule in return: stacked marks need 12 real pixels (§4, 2026-08-06). The refusal stands for anything that would have to invent one; responsive `size` as the mechanism (opt-in, so the floor would depend on every author remembering — the inversion THESIS §7 exists to prevent); width or breakpoints as the signal *for geometry* in any capacity (section 17's `narrow` band keys **display type** off width — geometry still never reads it).

---

## 17. Type bands: handheld and narrow

**Decision (2026-08-05, Kushagra; supersedes the single conjunction-gated band of 2026-08-04; values v0): the type palette answers TWO independent questions with two independent bands.**

| band | what moves | why | signal |
|---|---|---|---|
| `handheld` | reading steps 1–4 rise (16 → 18) | the screen is close to the eye | `(pointer: coarse)` |
| `narrow` | display steps 8–9 fall (56 → 40) | the line is short | `(max-width: 48rem)` |

Steps 5–7 are nobody's. Each band emits **only the steps it moves**, which is what lets two bands coexist without overwriting each other on a phone, where both apply.

### Why it is two bands and not one

It shipped as one, called `handheld`, keyed on `(pointer: coarse) and (max-width: 48rem)`. That band did both jobs above at once, and the two jobs have nothing to do with each other — one is about **viewing distance**, the other about **line length**. Welding them together got the middle of the range wrong in both directions:

- **A tablet lost a rise it should have had.** Apple ships **one** Dynamic Type table for iOS *and* iPadOS — Body is 17pt on an iPhone and 17pt on an iPad — so the reading question does not distinguish phone from tablet at all. Our width gate did. (Kushagra, from Apple's own table; LOG.)
- **The gate did not even split phones from tablets.** A 13" iPad Pro is 1032px in portrait and 1376px in landscape; the 10.9" is 820px. At 768px the conjunction separates an *iPad mini in portrait* from every other iPad — which is where a threshold happened to land, not a boundary anyone designed.
- **A narrow desktop window kept its 56px headings**, though the line-length argument applies to it identically.

The four cells now come out right, and two of them are the ones the single band got wrong:

| | reading | display |
|---|---|---|
| phone (touch + narrow) | ↑ 18 | ↓ 40 |
| tablet landscape (touch, wide) | ↑ 18 | **56 holds** |
| narrow desktop window (fine, narrow) | **16 holds** | ↓ 40 |
| desktop | 16 | 56 |

### A band is a re-pick, and it is non-monotonic by design

A band re-picks each type step's **index** into the three paired palettes (§15), so every rendered step is a designed triple — font-size, line height and letter spacing move together or not at all. "Bigger on mobile" as a multiplier is wrong at both ends, the same anti-derivation stance as line-height (§15). Steps 4/5 and 7/8 still collapse to one rendered value where both bands apply — the price of a nine-step range on a small screen, the same price compact pays in layout space (§12).

Mechanically a band **re-prices the palette in place** — it re-declares `--font-size-N` and its pair, the radius-level mechanism (§6) one family over. No second token name: raw type has no legitimate consumer the way raw space does (§12's boundary), so `--font-size-N` stays the one spelling and consumers never learn a band exists. (Re-picking *within* the family via `var()` is impossible — a band maps step 5 onto its own name, and a self-referencing custom property is invalid at computed-value time, taking the chain down with it — so a band emits re-priced values from the same config source.)

### The signals, and why each is the one it is

**`handheld` reads `pointer`, not `any-pointer`.** The *primary* input being a finger is what says there is no attached pointing device, which is what says the thing is probably in a hand. A 1920px Windows laptop with a trackpad reports `fine` and stays desktop; detach the keyboard from a Surface and it reports `coarse`, which is correct — it is a slab in someone's hands. A stylus reports `fine` too. `any-pointer: coarse` would mean "touch exists somewhere on this machine" and would permanently inflate a mouse-driven touchscreen laptop.

**And it rides the pointer axis's own scopes** — `[data-pointer]`, the three-scope shape of §16, with the band's steps emitted inside the pointer world blocks. Pinning `pointer="coarse"` therefore forces the *whole* coarse world, geometry and reading type together, and `pointer="fine"` is the escape (it re-declares the identity steps — an escape that does nothing is not an escape). There is no separate attribute and no separate prop; see "The `device` prop was dropped" below.

**`narrow` reads width, and carries no attribute at all.** Width is not a device fact and there is nothing to escape: a Theme pinned to `fine` inside a 375px window still has a 375px window. The band sits on `:root` and inherits into every Theme scope. Neither pointer world touches steps 8–9 — a pointer says nothing about how wide the window is. This does not reopen §16's rejection of width as a signal *for geometry* — geometry still never reads width in any capacity.

**The two thresholds are now tunable separately**, which is half the point of the split: "how close is this screen" and "how wide is this screen" no longer share a number. v0 keeps 48rem for the narrow band so exactly one thing changed.

### The `device` prop was dropped (2026-08-05, Kushagra)

For one day the split left a Theme prop called `device: desktop | handheld | auto` whose auto signal asked the same question `pointer` asks, kept alive as an escape for the cases where "coarse" and "held close" disagree: a touch-only kiosk read from two metres, a POS terminal at desk distance. **We are not designing for those** — and with them gone the prop had no consumer: it controlled reading type only (a name that promised a device's worth and delivered four font sizes), and the preview can force phone type by pinning `pointer`, which now carries the band. So the prop, its type, its attribute and its emitted scopes are gone; coarse means handheld with no daylight between them. The LOG records the shape to bring back if a touch-at-a-distance product ever appears.

### What reads a band, and what must not

- **Type** — the whole palette, so Text, Heading, control labels and field text all follow through the one size-step definition (the §15 join; the control≡type parity law pins that there is exactly one such definition).
- **Interaction adaptation, later** — dialog→sheet, popover→drawer, hover-reveal→tap (THESIS Part II's opt-out responsiveness). They split the same way the bands did: hover-reveal is a pointer fact; sheet/drawer follow the `narrow` window class (§18), not a band.
- **Never: spacing** (gutters must not inflate on the smaller screen — §16's exclusion, reasserted per band by law) **and never: control geometry from the narrow band** (heights are the pointer axis's; width pushing a box would compose a height nobody designed).

### Open

- **The picks and both thresholds** — v0. The narrow threshold is now §18's narrow window boundary by derivation (one number, shared on purpose), so judging it is judging both at once.
- **The narrow band should arguably key on the CONTAINER, not the viewport.** A heading in a narrow sidebar on a wide monitor wraps just as badly. Re-pricing tokens inside a container query has substitution problems the viewport version does not (§6), so the viewport band ships first.
- ~~**Window-level size classes for app-shell layout**~~ — **CLOSED 2026-08-05: section 18.** Three classes, `narrow | regular | wide`, a hook; the narrow boundary is this band's number by derivation.
- A locked type floor ("no band renders below the platform minimum") is *not yet claimed* — the bands happen to clear it, but nothing enforces it. Claiming it without a law is the audit sin (§2); it becomes a claim the day it becomes a law.
- Whether the fine world ever earns its own non-identity band (macOS 13pt against the web's 16px default suggests not).

---

## 18. Window size classes

**Decision (2026-08-05, Kushagra; thresholds v0): the one viewport question gets three classes — `narrow | regular | wide` — and they pick the SHELL, nothing else.**

Container tiers (§2) answer *"how much room does this component have"* — measured against the nearest container, deliberately, so the same card stacks in a sidebar and spreads in the main area. Nothing answered *"which interface should this app show"*: bottom bar on a narrow window, rail in between, sidebar when there is room. That is decided **once, at the top, against the window** — not per container, not per component — and without a sanctioned answer every consumer hand-writes media queries with invented numbers, which is what this system exists to prevent.

| class | boundary | shell it names |
|---|---|---|
| `narrow` | width ≤ 48rem | one column, bottom bar; dialogs become sheets (later) |
| `regular` | in between | rail navigation |
| `wide` | width ≥ 75rem | sidebar; everything a shell can use |

### Three, not four (LOG 2026-08-05)

A class exists to pick the navigation shape, and there are three shapes. Material's three primary classes map to exactly this ladder; Apple's two are the documented failure (rail and sidebar collapse into "regular"); Microsoft ships three. Material's fourth and fifth classes ("at 1600px, add an inspector") exist to compensate for not having container queries — that is a *room* question, and container tiers already answer it where it is asked, in the pane. The set is a closed union that widens by config the day a real shell forces it — the tone set's rule — and the waiting name is `expanded`.

### Named for room, never hardware (LOG)

`phone | tablet | desktop` was considered and rejected with its own argument: users run apps in windowed mode, so device names lie — an app dragged to half a 5K display would be "tablet" with no tablet anywhere, and a phone-shaped preview canvas inside a desktop tool would be a "phone". Every platform that started from devices retreated to window-measured classes. The device question is already answered properly by `pointer` (§16, §17); the window class is pure room. The words are the system's kind — blunt, one each: `narrow` shared with the type band on purpose, `regular` the unmarked middle (material's habit, not "medium", which would claim a midpoint), `wide` the sidebar shell.

### The boundaries, and the one that is shared

Two numbers make three classes: the queries are derived so `regular` is "not narrow, not wide" spelled with the identical strings — a threshold correction cannot open a gap or an overlap, law-tested.

- **narrow/regular = 48rem, and it IS the narrow type band's number by derivation** (`config.ts`: `narrowMedia` is built from `windowClass.narrowMax`). One word, one number, one moment: display type shrinks exactly when the app goes to one column. This closes §17's open "same numbers or independent" question — same, mechanically.
- **regular/wide = 75rem (judged 2026-08-05 — opened at 64rem, moved same day).** `wide` promises a sidebar, and at 1024 the content behind a ~260px sidebar would be narrower than a narrow window — the shell would grant a sidebar and starve the content it serves. At 1200: iPads in landscape (1024–1180) take the rail, half a 27" display (1280) and every fullscreen laptop take the sidebar, content behind a sidebar never drops below ~920px. Not 80rem: that puts the boundary exactly on 1280, one of the most populated widths in the wild (half-27", WXGA fullscreen), so the commonest desktop posture would flip shells with a pixel of drag — a threshold sits in quiet territory between populations, never on top of one.
- **Boundaries land downward** — a window at exactly 48rem is `narrow`, matching the band's inclusive `max-width`. Law-tested at the exact widths.

### How it surfaces: a hook, because a shell is components

`useWindowClass(): "narrow" | "regular" | "wide" | null` — live over `matchMedia`, subscribed at the two boundaries. **No token moves with the window class**: spacing is nobody's, type already answers width through the narrow band, geometry is the pointer axis's — a law asserts the generated CSS never mentions a window class. A class picks a shell, and a shell is different components, which only JS can render; that is why the primitive is a hook and not a stylesheet, and why it is the system's first sanctioned runtime signal (still nothing at *interaction* time — a resize listener the consumer opts into).

**`null` is the server's answer, honestly — and no script can change it (corrected 2026-08-05, LOG).** SSR has no window. The first draft bundled this with dark-mode SSR as "one inline script, both answers stamped before paint"; scrutiny killed the window half twice over. A pre-paint stamp is visible to CSS, but CSS never needed it — media queries read the window width natively, before paint, with no script; `data-pointer` earns its attribute only because pinning overrides what media would say, and window pinning does not exist. And the hook cannot read it: React's first client render must match the server HTML, so the null branch renders first no matter what an inline script stamped — even next-themes, the standard dark-mode script, fixes only CSS while its hook stays undefined until mount. **A first-paint shell is therefore CSS-shaped**: both navigations in the HTML, the boundary queries (`windowClassQueries`) picking — no flash, no script. The hook is for decisions *after* mount. Dark mode keeps its inline script (the standard fix, needed because `appearance` can be authored rather than system-followed); it stamps appearance alone.

### Open

- The 75rem boundary, re-judged when a real shell exists to judge it against (the 2026-08-05 judgment was arithmetic and device populations, not an eye on a rendered shell).
- Pinning (a phone-shaped canvas inside a desktop tool is a pinned narrow window — the escape the dropped `device` prop would have wanted). The `data-window` attribute exists only if pinning does — media queries already give CSS the un-pinned answer — so the two are one open item, not two.
- Interaction adaptation (dialog→sheet at `narrow`, popover→drawer) — §17's open item resolves mostly into this class, not into a band; hover-reveal→tap stays the pointer's.

---

## 19. The look axis

**SHIPPED 2026-08-06.** The seventh Theme prop: `look="outlined" | "filled"`, the resting dress of the one-look families. An app identity chosen once, never a per-component knob — the `surfaces` tier, for the border-versus-fill question.

**What the axes MEAN — the four worlds (settled 2026-08-07, Kushagra; the frame every taste value answers to).** The two identity axes are two independent questions about the interface's nature, and their four combinations are four worlds, each with its own physics:

- **`look` answers: what is the interface made of.** `outlined` says it is DRAWN — regions exist because a line declares them; the print/blueprint tradition, where the line is the statement of structure itself, not decoration. `filled` says it is MOLDED — regions exist because the material differs; a field is a well pressed into the surface, a card a slab of different stock, and no line appears because matter meeting matter needs no annotation. This is why the border question resolves per family (§19 throughout), and why the slider left the axis: in a drawn world the line IS the thing, in a molded world it is redundant, and an instrument belongs to neither.
- **`surfaces` answers: does light exist.** `flat` says no — depth is stated, not simulated; the world is a diagram. `elevated` says one sun, above — things cast down and catch on top. The dark rim-light (§5) is the catch half's first resident; casting without catching is half a light source, and the elevated taste pass grows the catch (rim, fill light, seat) — always as paint (`background-image`, shadow list), never filter, never extra elements, never JS.
- **The four worlds each get a stated physics, and taste values are judged against their OWN world's statement, not against each other.** Outlined+flat is pure notation — its taste pass is line: weight, rhythm, corner precision, and SHARP IS NOT DARK (precision comes from consistency of weight and alignment; the Lc report is the conscience that separates modern-flat from dim-flat). Filled+flat is regions of tone, where figure-ground carries everything and the report matters most. Outlined+elevated is drawn structure over soft cast. Filled+elevated is the relief map — wells recede, slabs rise, light says which.
- **The liquid-glass lesson is not glass: a look is a physics** — one consistent rule about how the world behaves, applied without exception, which is what makes it read as inevitable rather than decorated. The role machinery is the mechanical half (membership is role consumption); these statements are the design half.
- **Held closed on purpose: states do not vary by look.** The furthest implication — a drawn world's states speaking in line, a molded world's in material — is real, and refused for now: the signals (focus ring, invalid edge, disabled) stay one fixed vocabulary across all four worlds. If ever bent, it is per-channel expression of the SAME fixed signal, never a different signal.
- **Declined as overreach: the outer glow.** A control's resting state never radiates; a hero moment is an app's escape (`--shadow-*` via `style`, §13), not a system value.

**The criterion is the border's job.** Radix-style variants felt expressive because they fused two different questions: *rank* (which action is louder — per call site, and already this system's `emphasis`) and *dress* (how the app draws things at rest — an app identity with no home until now). The border pixel serves both masters, resolved per family exactly the way emphasis is: on a control it is RANK — Button's `bordered` is the emphasis half-step (quiet < quiet+bordered < medium < medium+border < loud), turns three rungs into five, and stays a prop — and on a one-look family it ranks nothing (a form where one field is louder than the next names nothing), so it is DRESS and the app owns it. The preview's button matrix is the visible proof: quiet+border is the classic "outline button" every system ships as a named variant; ours derives it, so the half-step composes with every tone and material for free.

**Resolution is per family, and membership IS role consumption.** `--look-<family>-<slot>` roles are emitted in tokens.css (the axis's one home) and consumed by three families: the surface family (fill + edge + the card-as-button interactive steps), the field family (fill + edge — one fill with no interactive steps, because a field's fill does not move under the pointer; the border and the ring carry its states), and the mark family (fill trio + edge) — but only the members that ARE controls: checkbox and radio are dressed, the slider thumb is not (narrowed 2026-08-07). A checkbox at rest is a small empty surface with a boundary, and the app's identity is exactly a statement about how resting surfaces are drawn; a handle is not a surface you read but a grip you move, whose job is to stay the same recognisable object while everything behind it changes. That is the same reason Button belongs to no dressed family, and it puts the thumb in Button's category despite sharing the checkbox's geometry: **the mark family shares its box, not its dress.** The selector is the hosted-mark precedent reused — `:not(.kui-control *)` already means "a mark that is itself the control" in the target rule. A family is dressed because its sheet consumes the roles, and only for that reason; Button belongs to no dressed family and a mounted negative law pins it byte-identical across looks, per rung, bordered included. A law also pins the axis's home: no stylesheet outside tokens.css may put a colour in a look role (the shared state arms may write only `initial`).

**`outlined` is the default and the identity** — exactly the chrome each family declared before the axis existed, asserted end-to-end (the sheet reads the role; tokens.css maps the role to the old value; mounted, outlined ≡ the bare render). **`filled` fills, and the fill is the whole signal** — surfaces lightest, fields past them, marks darkest, interactive steps walking upward, and the well moving the other way (below). Neutral-only by the tone-set rule: an accent-tinted well joins as a *value on this axis* the day a real app wants it, never as a second prop.

**`filled` is NOT a trade — corrected 2026-08-06, by eye, the day it shipped.** The first cut set every border to `transparent`, on the sentence "the axis trades a hairline for a darkened well". Kushagra, from the preview's outlined/filled pair: *"filled surfaces can have slight border, but their main pull is filled bg, not border."* The trade had three measured costs, all of which the axis's own laws were blind to. An unchecked mark lost the boundary `--mark-edge` was minted for one day earlier (audit D2), dropping to |Lc| 0.0 against its card — and an unchecked box IS its hairline. A **read-only** field lost its fill by design (readOnly drops the seal: what goes is the invitation to type) and its border by dress, so it painted nothing whatsoever. And `contrast="high"` had no edge left anywhere to strengthen, which made the accessibility escape silently inert on every dressed family. A filled component now keeps a **softer** edge — its own roles, one step in from `--tone-border` — and the fill carries the identity.

**And `contrast="high"` outranks dress, by the material's own mechanism.** A soft edge is the point of `filled`, and a user asking for high contrast is asking for the tone system's boundary rather than the app's taste — so under high contrast every `--look-<family>-border` stands down to `initial` and the consumption site's fallback (`var(--tone-border)`, `var(--mark-edge)`) resolves at the element. This is exactly what the material already does with its glass edge (§10), for exactly the same reason: a scope-level colour cannot reach where the tone lives. The first attempt instead picked the soft steps out of `contrastHighBands.border` and claimed that made them reachable — **it did not, and the law that "proved" it was the audit's own defect class committed while fixing the audit.** That band indexes the ladder 0-based while token names are 1-based, so `[5, 6, 7]` emits as `--neutral-6/7/8`; the `--neutral-5` edges chosen for the surface and field families were never re-declared under high contrast at all, and the law passed by comparing 1-indexed names to 0-indexed positions. The replacement law is an **outcome** law, mounted: a real component's computed `border-top-color` must change when `contrast="high"` is set, per family and per appearance. It cannot be satisfied by an off-by-one, and it holds whichever mechanism delivers the result.

**The steps are per APPEARANCE, because an index is not a colour.** `filled` shipped naming raw `--neutral-2/3/4`, and in dark those *are* `--color-surface` and its two states — so the surface family resolved byte-identically to `outlined`, and the axis did nothing but delete the card's hairline in half the world. The `[data-look]` blocks cannot fix this themselves: they are one block per look on purpose (co-location — Theme stamps `data-look` beside `data-appearance` on a single element, and a compound `[data-appearance][data-look]` selector would resolve for Theme while missing the supported un-themed path), so they may only hold mode-blind mappings. The pigment therefore arrives by indirection through `--dress-<family>-<slot>` roles declared in each appearance scope — the same shape `--color-surface` already is, and the same reason. **This is the third instance of one bug:** `surfaceColor`'s own comment records the second (dark's card hover equalled its rest, because the steps were hard-coded for both modes while the dark seal sat at `--neutral-2`). A higher step is *darker* in light and *lighter* in dark, so "recessed" and "raised" are opposite arithmetic and the two ladders are not each other's copy.

**Two load-bearing mechanics.**
- *Late binding via `initial`* (§6's substitution-at-declaration, respected this time): a border role holding `var(--tone-border)` would bake at the Theme scope, where no tone exists, and every outlined border would silently be transparent — the first cut failed exactly this way, caught by the mounted laws. Outlined's borders are `initial`: the role stands down and the consumption site's fallback (`var(--tone-border)`, `var(--mark-edge)`) resolves at the element — the material edge's own pattern — which is what keeps `contrast="high"` and the state remaps reaching every edge.
- *A look role holds a COLOUR, so it repeats in every appearance scope* — the same rule the surface roles follow, and it was missed for half a day. The fills bake where they are declared, so emitting them only at `:root` baked the LIGHT seal, and every dark region that was not *itself* a look scope inherited a white card, a white field and a white mark. Through `Theme` this is invisible, because Theme stamps `data-look` beside `data-appearance` on one element and the `[data-look]` blocks re-declare there — it was the preview's hand-written `data-appearance="dark"` sections, the un-themed path the emitted stylesheet explicitly promises works standalone, that showed it. Both appearance scopes now carry the default look's roles, the `[data-look]` blocks come later and win on the co-located element, and two laws hold it: the emission law requires the roles in all three scopes, and a mounted law renders a Card through a **raw** `data-appearance` div and asserts it matches the themed dark render and differs from light. Consequence stated rather than hidden: a bare appearance scope carries the DEFAULT look, so a raw `[data-appearance]` div inside a filled app resets to outlined until it stamps a look. Theme always stamps both, which is why the sanctioned path cannot reach it.
- *State outranks dress:* the shared invalid and disabled arms stand `--look-field-border` down, so under `filled` the error edge and the flattened disabled edge replace the softer resting one rather than competing with it; marks need no arm — their border IS `--tone-border` and the remaps win that battle on specificity. The material also outranks the look on glass: a pane's edge is what the material is, in either look. (The arms were written when `filled`'s resting border was `transparent` and were load-bearing for a different reason then — they kept a state from being *swallowed*. They now keep it from being *muted*, which is the same rule and a smaller stake.)

**Both dressed control families are wired in the shared layer, and the mark family proves why.** The field family's edge rule is `.kui-field, .kui-textarea` in `recipes.css` — named members until a third field-shaped control promotes the family (TextArea's rule) — because a component sheet never mentions the painted variable. The mark family's wiring was written against `.kui-checkbox` the day before Radio and the slider thumb promoted the family into `.kui-mark`, and rebasing it there is the promotion paying its way: **one rule now dresses all three members**, Radio and Slider answer the axis without a line of their own, and a mounted law pins all three to the same computed pair in both looks — the divergence a per-component copy would cause fails there first.

**The slider is OUTSIDE the axis, whole — settled 2026-08-07 after three passes.** Kushagra: *"slider has basically no reason to subscribe to look axis, like button has no role."* The reversals are recorded in LOG because the next value control meets the same fork, and the short version is that each pass argued about the parts and none argued about the thing. The rail was excluded at first on "an edgeless well has no border-versus-fill trade to make", which stopped being true when `filled` stopped being a trade — so it was let in. It was then drawn as an outline, which is `outlined` applied to a path by analogy with surfaces, and it read as a bead resting on nothing. The thumb then left on its own merits, which forced dark's rail down to the page step to stay off the thumb's colour, at which point a filled rail was nearly invisible on its card.

**The rule that survives is about what a slider IS.** The axis dresses things whose resting state is a *surface with a boundary* — a card, a field, a checkbox — because for those, "how does this app draw a resting surface" is a question with an answer. A slider has no resting surface: it is a rail, a fill and a grip. It is an instrument, and every part of it is shaped by what it does rather than by the app's identity. Button belongs to no dressed family on exactly this argument, and **Progress will land here too** — a bar is a rail with no grip. The membership test therefore has two halves, not one: a family is dressed because its sheet consumes the roles (the mechanical half), and it *should* consume them only if its resting state is a surface (the design half). The mechanical half alone is what let a slider in twice.

A law pins every painted part of the slider — rail, rail edge, fill, thumb, thumb edge — unmoved across both looks, with a checkbox in the same app as the negative control so it cannot pass in a world where `look` has simply stopped working. Asserting all five together is deliberate: a component leaves an axis completely or it does not leave it, and a law that checked only the rail would have missed the thumb, which was dressed until the day before.

---

## Open questions / deferred

**Forced colors is NOT SUPPORTED, and that is a decision (2026-08-07, Kushagra: "our library is too premature to solve it").** Windows Contrast Themes — `forced-colors: active` — replaces the page's palette with the user's own, and this library has no handling for it anywhere: `grep -rn "forced-color" src` returns nothing. The consequence is measured rather than assumed, and it is real: under emulation, a **checked radio is indistinguishable from an unchecked one**, because the accent fill is forced to Canvas white while the indicator dot stays white — white on white. Assistive tech is unaffected (the hidden input still reports `checked`), so the loss falls exactly on sighted users of the setting. It predates the axis work: it shipped with Checkbox on 2026-08-05 and survived the 40-agent audit.

It is declined rather than fixed because fixing one control is worse than fixing none — the mode is all-or-nothing per page, so a radio that answers it beside a slider that does not is a *more* confusing screen, not a less confusing one. Supporting it properly means a pass over every control (marks, fills, focus rings, disabled states, the material) plus laws that drive the media query, and that is a body of work this library is too early for. Recorded here so each audit round stops rediscovering it as a defect: it is a known, measured, accepted gap. `prefers-contrast: more` and `contrast="high"` are a different mechanism and ARE supported (§7).

**Color:** section 7 is implemented and law-tested (`src/tokens/color.ts`, 106 laws). What remains is not mechanism:
- **Named extra accent slots** for genuine dual-brand cases (the `accentAlt` path).
- Chroma varies about 2x across hues at the solid band, because each hue sits at its own cusp: indigo holds C .30 where cyan holds C .15. Intrinsic to sRGB, narrowed but not removed by P3. It only shows when two distant hues ship together (a cyan `accent` beside a red `destructive`), and the lever is per-tone `vividness`. Deliberately **not** normalized automatically across the configured tones: that would mean adding a destructive red silently changes how the accent looks, and action at a distance is worse than a documented asymmetry.

**Recipes and axes (sections 8-11):**
- Judge the **material** recipes against real backdrops: three or four hostile photos, a real control, both modes. Expect blur to move +/-6px and alpha +/-0.1. Confirm the brightness floor actually holds. Measure `backdrop-filter` cost on a mid-tier device before the radii lock.
- The **chroma threshold** below which `--accent-solid` remaps to step 12 (section 7), and the L-deltas for its hover and press. Tuning, not architecture.
- Where exactly `--accent-label` sits between steps 11 and 12, per mode.
- ~~How **`quiet`** actually renders~~ — closed at the first real Button (2026-08-03): bare at rest, `transparent` literally, entering the ramp at hover (transparent → soft → soft-hover). Law-tested across every tone. `quiet + bordered` covers the faint-containment case the tint would have served.
- Theme `material` **naming**: `material` vs `allowTranslucency` vs `materials`.

**Radius / layout:**
- Concentric radius nesting (inner R = outer R minus inset P). Apple builds the system around it; we defer to v1+1. Confirmed taste-multiplier.
- Shape-by-size fork: keep one shape with scaled radius (current) vs Apple's capsule-at-large-sizes. Leaning keep.
- Surface size cap in `radius="full"` (confirm clamp for dialogs/sheets).
- Space scale top-out (64 component/section level) vs one fixed scale to 128, with responsive page gutters via `clamp()` as a later layer.

**API:**
- Naming of the per-component escape prop (`UNSAFE_` vs `override`). The name is the deterrent.
- ~~**The adornment spelling.**~~ **CLOSED 2026-08-04, Kushagra: Button renames to `leading` / `trailing`.** `iconEnd` is not RTL-correct, and a trailing slot frequently holds a *control* rather than an icon — which the new slot-hosting rule (§4) makes routine rather than exceptional. The API break is theoretical while the package is unpublished, and the cost of two spellings is permanent.
- ~~**TextField ships no `render` escape.**~~ **CLOSED 2026-08-05: refused, and pinned by a type law.** Everywhere else `render` swaps the one element that *is* the component; here there are two, and neither can move — the wrapper holds a border the input cannot hold once a slot sits inside it, and the input must stay an `<input>` or the platform wiring the component exists to preserve goes with it. `render` would have to silently mean one of them.
- ~~**iOS zooms the page on focus for any input under 16px.**~~ **CLOSED 2026-08-05: the input's font takes a floor from the pointer world.** The device axis was only most of the answer, and the hole was bigger than the size 1 it was thought to be: an iPad in landscape is past the handheld width threshold, so it reads as `desktop`, gets the desktop type ladder — 14px at size 2 — and Safari still zooms. The signal has to be *what touches the screen*, so `--input-font-floor` rides the pointer axis (0 on fine, 16 on coarse) and `max()`es the INPUT's font size only. The box keeps its designed height and the label its designed step, so a size-1 field is still a size-1 field. Deliberately not solved by lifting the type ladder: size 1 is the caption step, and a phone that cannot render small secondary text has lost something real to fix one control.
- **Pointer: the numbers.** The coarse sets' values — §16, judged in the 4b matrix. ~~Whether a hybrid device gets coarse geometry via `any-pointer`~~ — **closed 2026-08-05: no.** `any-pointer: coarse` means "touch exists somewhere on this machine" and would permanently inflate a mouse-driven touchscreen laptop, overriding density, a whole axis built so people could choose airiness. `pointer` tracks how the machine is being used *right now* — flip a 2-in-1 into tablet mode and the controls grow, flip it back and they shrink — and every designed cell already clears the WCAG 24px minimum, so what `any-pointer` would buy is only the stricter 44 target. Capability is not use.
- ~~**Device: the tablet band.**~~ **CLOSED 2026-08-05: there is no tablet band, because the single band that needed one was doing two jobs.** Apple ships one Dynamic Type table for iOS and iPadOS, so a tablet's reading type is a phone's; the only thing that genuinely differed was display type, and that is a line-length fact keyed on width. Split into `handheld` (touch) and `narrow` (width) — section 17. Still open there: both sets of picks, both thresholds, the container version of the narrow band, and the not-yet-claimed platform-minimum type floor. **Newly open, and the real tablet deliverable: window-level size classes for app-shell layout** — nothing in the system answers "which interface should this app show" (container tiers answer a different question), which is what Figma-on-iPad is deciding.
- **LIVE DEFECT (found 2026-08-05, building Checkbox's preview): a Box collapses to zero inline size whenever it must shrink-wrap.** Every `.kui-box` carries `container-type: inline-size` so tiers can query it (§2) — and that applies size containment in the inline axis, which means **the contents never contribute to the box's own width**. Measured in Chromium against the shipped stylesheet: a Box as a flex-ROW item computes to **0px** where a plain `<div>` computes to 70px; `align-items: flex-start` in a column, `display: inline-flex`, `width: max-content` and `width: fit-content` are all 0 as well. It renders correctly only where something else hands it a definite width — a block context, or the default `align-items: stretch` — which is why every demo built so far has looked fine and no law caught it. `<Flex><Box>…</Box><Box>…</Box></Flex>` is the most ordinary composition the library offers, and today it silently produces zero-width children with spilling content. Not fixed here (it is nowhere near Checkbox's scope): the fix is a real decision, since containment is what makes a Box queryable, and the candidates — only containerise a Box that has tier props, or `container-type: normal` plus an opt-in, or an intrinsic-size escape — each trade a different part of §2's nearest-ancestor semantics. Needs a mounted law in both directions the moment it is chosen. **Independently re-found the same day by the docs app** (the first real consumer), which is worth recording because the two discoveries landed on different escapes and the pair is the whole picture: it hit a header row holding a nested button group — again the most ordinary composition there is — and shipped around it with `flexGrow`, which takes width from space distribution rather than from content measurement and is therefore the one sizing route containment leaves open. Stating `width` works for the same reason; restructuring so the Boxes are column items works because those stretch. Note also that the generator's own comment has named this for `.kui-theme` since containment shipped — so the behaviour was documented for one of the two elements that carry it and unnoticed on the other, which is why it reads as a surprise rather than a known cost. Whatever is chosen, the escapes above are what the docs currently lean on.
- **Container tiers: wrapping re-targets.** Adding a plain Box around a subtree changes which container its children's tiers measure — a documented consequence of nearest-ancestor resolution (section 2) that is not yet *named as a cost* there, has no pinning law, and whose taught escape is "put tier props on the region's direct children." Recorded 2026-08-04 after a full re-litigation of container-keyed tiers (window-based re-rejected; see LOG); to be named in section 2's cost list with a law when touched next.
- **Density: the numbers.** Heights per level, the step offsets, and any per-cell overrides. Also the level names and count (`comfortable` may understate the airy end). Surface padding takes density through the layout-space layer — decided 2026-08-04 (sections 3, 12); the per-level layout-space picks are v0 values like the rest, the gutter-band hold included. Architecture settled (section 12); values are taste, and they need the size-by-density matrix in the docs app before they can be judged.
- **Scale: if it ever ships.** The factor stays wired and the prop is deferred (sections 5, 13). Reopen only when a real need names the steps, and ship it as designed steps rather than a free multiplier.
- RTL / `dir`. Deferred, architectural room left.

**From the 2026-08-06 audit (REVIEW) — confirmed defects held back because each is a system decision, not a repair:**
- **Does a Button rendered as a link announce as a link?** `<Button render={<a href/>}>` emits `role="button"`: Base UI infers a non-native button and stamps the role plus `tabindex`, so the docs site exposes exactly ONE link to a screen-reader's link rotor and Space — which `role=button` promises — does not activate it. The composition is blessed by §1 and by a law whose own title calls it "a link that looks like a button", so the law pins the behaviour that is wrong. The call: when the render target is an anchor carrying `href`, the native link role should survive, and Base UI's non-button branch should be reserved for genuinely non-interactive elements. Deferred only because it changes a shipped a11y contract and rewrites the law that guards it.
- **Can a TextField shrink?** The wrapper has no `min-width`, and its intrinsic width comes from the `<input>`'s UA `size=20` (~174px measured), so as a flex item it refuses to shrink and `/matrix` scrolls horizontally at 375px — the width where the coarse geometry is judged. `min-width: 0` on the wrapper is the one-liner; whether a field should be shrinkable BY DEFAULT, or whether that is the call site's to state, is the actual question (§4's "components never own outer spacing" has no sibling rule for intrinsic width).
- **`.kui-surface:where(button, a)` resets seven UA properties and not `display`.** So a plain Card is a block and `<Card render={<a href/>}>` — the pattern §10 names by hand — is inline, taking a line box and shrink-wrapping. `display: block` on the interactive arm is the fix; it is here rather than done because the card-as-button block is due a pass when the material work continues, and because the existing law compares two colours where it should also compare the box.
- **`.kui-surface` never zeroes margin**, so `<Card render={<figure/>}>` or `<blockquote/>` inherits UA margins and owns outer spacing — against the non-negotiable that `.kui-type` (`margin: 0`, citing §3) and the layout mechanism both honour. One declaration plus the mounted law it earns.
- **How is selection state spelled on a control the system does not have yet?** The docs' pickers convey "selected" through tone and emphasis alone, so the accessibility tree is byte-identical before and after a choice changes — including on the contrast picker, which is itself the accessibility setting. `aria-pressed` is expressible through Button's props today, but the right answer is a system one (Segmented Control / Toggle Button are on the component list), and patching the docs page would spend the question rather than answer it.

**Selection controls — Checkbox SHIPPED 2026-08-05; Radio and Switch pre-scoped:**
- ~~**Checkbox × `radius="full"`: the capsule must not reach it.**~~ **CLOSED — shipped as the mark corner ceiling (§6).** A circular checkbox reads as a radio — shape is role semantics here, and role legibility outranks theme uniformity. §6 already re-prices `full` per band (surfaces to designed corners, controls to h/2); the checkbox is the control band's designed exception at full, capping at a designed step instead of taking the capsule. Same family as the pill padding bump: a place where roundness meets a rule that outranks it. The cap's value is taste, judged in the preview.
- **A mark hosted in a slot stays a mark (2026-08-06, Kushagra — audit D4).** The hosted-control rule pins `height` to the slot's derived box, which is right for a Button and wrong for the one control whose box IS its mark: a checkbox in a field's trailing slot rendered 20 x 24, its corner holding two fractions of two axes, and on a fine pointer it kept its own expanding target inside the container — 36px of reach inside a 32px field, the exact inversion §4's hosted rule exists to prevent. Now both axes come from one expression (the mark, floored by the hosted box where the slot is genuinely tighter) and the mark's own expander is scoped out of slots entirely, so the container-matched coarse target from the shared rule is the only target a hosted mark has. A true type-level block was considered and is impossible — the slots accept any node — so behaving is the fix ("A", over documenting a broken cell nobody can be stopped from rendering). Radio and Switch inherit the geometry.
- ~~**Checkbox × coarse pointer: it stays a checkbox.**~~ **CLOSED, and the target answer changed in the building (§4):** it does stay a checkbox, and coarse does owe it a target — but the target is not 44, it is a control of its size capped at 44, and it applies in BOTH pointer worlds because the fine world's mark is under the minimum too. The box also turned out to grow on coarse after all, without a coarse ladder: the mark is a line of its label, and the handheld band raises the type. iOS's native vocabulary has none (switches for settings, edit-mode selection circles in lists) — but that is an iOS stance, not a mobile truth: Material ships one and the mobile web is full of them (consent, multi-select filters, row selection). Swapping to a switch by pointer would change semantics (a switch commits immediately; a checkbox waits for submit) — a product choice, never a pointer response. What coarse owes it is the target: the visual box stays small and the hit area extends to the 44 target — the hosted-control rule inverted (there the hit area shrinks to the container; here it grows past the box).
- **`readOnly` is REFUSED on Checkbox (2026-08-06, Kushagra), and the reason is that there is no wheel to reinvent.** The HTML attribute is defined for text fields and deliberately not for checkboxes — the WHATWG position is that a read-only checkbox has no useful distinction from a disabled one. Material has an open request from 2019 and never shipped it; Ant likewise; the libraries that do accept it (Base UI included) draw it identically to a live control, which is exactly the defect the audit found here (D5: accepted, resolving to nothing, hover still stepping the fill while the click was refused). Rather than design an appearance for a state the platform says should not exist, the prop is refused by the type with the other closed edges. What is lost: a read-only value submits with the form where a disabled one does not — rare, and an app that needs it sends the value itself. Radio inherits this refusal; a read-only SWITCH is the same question and takes the same answer.
- ~~**Radio is the checkbox's shape sibling, and it is what should promote the family.**~~ **CLOSED 2026-08-06: shipped, and it did promote — with the slider thumb as the third member landing in the same change** (§4, §14). The circle is role semantics and the radius axis never reaches it (§6); `readOnly` refused as inherited; the group is Base UI's, wrapped with zero CSS.
- **Switch leaves the control height ladder — and now has somewhere to land (amended 2026-08-05; the family's rules now sit in the shared layer, 2026-08-06, so Switch inherits the box, target, identity and ON-state machinery the day its stylesheet exists).** It takes the mark family at a one-index shift (§4) rather than a bespoke designed pair, so a switch and the checkbox above it in one form cannot drift apart; the THUMB is that track minus a designed inset, its off-track wears `--color-track` (minted with Slider), and the WIDTH is still genuinely open (Material 1.63x, iOS 1.65x, Radix 1.75x — all fractions, so ours will be a designed number). Known wrinkle to settle when it ships: the handheld band collapses type steps 4 and 5 onto one value, so the shift is inert at size 4 under coarse, where a switch would stand exactly as tall as the checkbox. The original pre-scoping — its own designed pair (track × thumb) per pointer world — it does not take control height on iOS either, and coarse widens the track/thumb (iOS 26 direction) to buy target area the height ladder would not give it. The numbers are config lines, judged in the preview; a taste call lands here with the coarse pair especially.

**Feel (not ratios):**
- "Balanced" corner feel, tuned by eye per step.
