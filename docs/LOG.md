# LOG

Living decision log. Newest first. Each entry: what, why, date, alternatives rejected.

This is the *why* behind the history, not a changelog: git is the changelog. `DECISIONS.md` says what the system is now; this says how it got there and what was turned down on the way, so a later reader cannot quietly re-litigate a settled question or re-try a dead end. (Naming differs from the site repo on purpose: there `DECISIONS.md` is the log, here it is the standing spec and the log is this file.)

Write an entry when a choice was genuinely open and got closed: a reversal, a measurement that moved a decision, a constraint the code cannot show, a rejected alternative worth staying rejected. Do not write one for tuning or for new code that is simply new.

---

## 2026-08-02 An audit of the layout layer: the browser suite was testing the stylesheet, not the components

Swept the work from the token pipeline through Theme against the docs. The finding that matters is not any single defect but what the suite's shape was hiding.

**A browser test that hand-writes its own markup proves the stylesheet and nothing else.** Every one of the twelve browser laws mounted `<div class="kk-box" style="--kk-p: ...">` — the markup Box is *supposed* to produce. So the stylesheet was thoroughly proven and the entire React half was asserted nowhere: prop to custom property, token index to `var()`, tier key to tier var, the `render` merge, Theme's nesting and inheritance. It looked like coverage because the tests were about the right subject; they entered the system one layer below the part nobody had checked. Real components are mounted now, and the resolver has node laws of its own.

**The split between the two projects is itself load-bearing, in both directions.** `p={0}` emitted `var(--space-0)` — the palette starts at 1 — and rendered `0px` anyway, because an unset custom property falls back to the property's initial value and padding's is zero. No browser test could ever have caught it; only reading what the resolver *writes* shows a working token apart from a broken one. The mirror case is the one from the entry below: a stylesheet can be textually perfect and compute nothing. Bare indices are bounded by the palette now, and out-of-range digits pass through as raw CSS where a wrong value is at least visible.

**`layout.css` was generated, committed, and unlawed** while `tokens.css` had a drift test — so a hand edit to the half of the CSS carrying the responsive mechanism would have survived CI. Both are covered now, and both mutations were checked to actually fail.

**The type refused the ordinary conditional prop.** The package compiles with `exactOptionalPropertyTypes`, under which `Partial<Record<...>>` rejects `p={cond ? "4" : undefined}`. A type that turns the normal spelling into an error pushes people to the escape hatch, which is the opposite of what §3's whole enforcement argument depends on. `| undefined` is explicit now.

Smaller, all fixed: nine screenshot artifacts were committed, one of them from a debug test file that no longer exists (`__screenshots__` is ignored now); `config.ts` still carried the disjoint-bands-make-it-safe argument that the browser had disproven and §6 had already been corrected for; the docs spelled remap vars `--kk-gap` where the code writes `--kk-g`; and the entry below claimed §14 step 4 when only Theme had shipped.

Not fixed, recorded instead: **Theme shipped ahead of the dark-mode SSR decision**, which REVIEW.md listed as its gate. Nothing renders an app yet so the debt is invisible, and it comes due at `apps/docs`. Naming it beats quietly deciding the gate was never real.

## 2026-08-02 Box and Theme land, and the browser finds four things the string tests could not

§14 step 3 and the Theme half of step 4 — Flex, Stack and Grid do not exist yet, and the first version of this entry claimed the whole step. The responsive mechanism is generated from one prop table, Box is the engine and Theme scopes the tokens, and the suite gains a browser project because the claims that mattered most had been asserted in prose for days and verified nowhere.

**Every failure below was found by the browser suite within minutes of it existing.** Three of the four were invisible to a test that reads generated CSS as text, because the text was correct and the *engine* disagreed with what we thought it meant.

**A shorthand followed by longhands does not degrade the way it looks like it should.** `padding: var(--kk-p)` then `padding-block-start: var(--kk-pt)` renders 0 whenever `pt` is unset, because an unset custom property makes its declaration invalid at computed-value time and the property falls back to its *initial* value rather than to the earlier shorthand. Shorthands are expanded now, and the specificity of `pt` over `py` over `p` lives inside one var chain per longhand, where it behaves.

**Every Box was an inline element.** Same rule, worse blast radius: `display: var(--kk-d)` with nothing set falls back to `display`'s initial value, which is `inline`, not `block`. Width and height were ignored, block padding collapsed, and `container-type` does not apply to inline boxes — so no Box was ever a query container and no responsive tier could ever have fired. The prop table now carries an explicit fallback for properties whose CSS initial value is not the sensible default; `display` is the only one that needs it.

**And the one that invalidated an argument in the spec: a custom property reference is substituted where it is DECLARED, not where it is used.** `--radius-control-2: var(--radius-2)` in `:root` is baked to the default palette immediately, so a `[data-radius]` block further down the tree never reaches it — setting a radius level did nothing to control radii. The disjoint-band design was justified on the grounds that the two axes never write the same token and therefore compose; that reasoning was wrong, and only a browser could say so. The generator now emits every (radius x density) cell, which is exact because Theme writes both attributes on one element. Bands still earn their keep for `full` capping surfaces; they just were not sufficient.

**`"use client"` was being stripped by the bundler**, which the audit had warned about and the tsdown bump had not actually fixed: bundling merges modules and drops their directives, and the failure only appears in a consumer's RSC app. Output is unbundled now, and the build walks the source for directives and fails if any is missing downstream.

The mechanism itself: one prop table drives the resolver and the stylesheet, so a prop cannot exist in one and not the other. Cost is O(longhands x tiers) and does not move when tokens are added, because no value ever appears in the CSS. Tiers are container-keyed, three of them, semantic.

Rejected: a shorthand-plus-longhand emission (above); `banner: '"use client"'` on the bundle (marks every export a client module, including ones that are not); reading custom properties directly in tests (`getComputedStyle` hands back the unresolved token stream, so a probe has to actually use the value).

## 2026-08-02 Colour finishes: chroma against the boundary, P3, contrast, and a brand colour going in

Everything after the generator's first landing, in one entry because it was one arc: making the output actually look right, then making the section's headline claim true.

**Chroma was authored as absolutes, and they were wrong in both directions at once.** Every light step of every hue asked for more than sRGB holds and was silently clamped — so the curve did nothing through steps 1-8 and hold-L-reduce-C was doing all the work, which is the reverse of what §7 describes. Meanwhile the solid band asked for *less* than available: red sat at .17 where sRGB allows .254. Chroma is now a **fraction of what the gamut holds at that lightness**, and the per-tone knob is `vividness` from 0 to 1. Red gained 50%, green 29%, magenta 31%. The curve means what it says at every step, nothing is silently clipped, and P3 became a parameter rather than a rewrite.

**P3 ships behind `@supports`, layered over the sRGB values rather than replacing them.** It was worth the bytes precisely where sRGB constrains a hue most: cyan +31%, sky +25%, blue +22%, against indigo's +4%. Blue and sky had been sitting *at* the sRGB ceiling — 0.185 of a possible 0.187 — so their flatness was the gamut's shape, not an under-ask. The alpha ramp deliberately stays sRGB: its least-alpha solve assumes sRGB compositing, and surface nesting gains nothing from a wider gamut.

**`contrast="high"` is generated, and its claim is "as much contrast as each colour permits", not a fixed shift.** The first version asserted a uniform +9 Lc, which is the dangerous kind of law: insisting every band move is exactly what pushed yellow's borders below their cusp and turned them olive. Bright hues now take no border shift at all and gain in the text band, which is the one place the ladder structurally guarantees headroom. A band that stays put is the setting working; the only failure is a pairing that comes out worse. Both cases are asserted, so nobody later "fixes" the no-op.

**Six bugs came out of looking at the preview, and four of those were found by a law rather than by eye.** The pattern is worth keeping: each one was invisible until a law existed that stated the intent.

- The contrast token was recomputed per gamut, so P3's more saturated red tipped APCA to black — the same button rendered white-on-red on one display and black-on-red on another. Decided on the sRGB rendering now: the label is a design decision, not a per-display computation.
- A fixed interaction direction ("darken in light, lighten in dark") reasons against the background and therefore walks a fill *toward* its own label half the time. Dark destructive pressed measured Lc 59; every dark-labelled bright hue measured 53-55. Direction follows the label now, so hover and press are strictly more legible than rest.
- The excursion is bounded by **what the hue can hold**, not a fixed delta. Yellow was olive going down and washed out to near-white going up, shedding 54% of its chroma — a fill at its cusp is hemmed in on both sides. States now travel as far as they can while keeping 75% of the resting chroma, direction chosen by which way affords more of it.
- Neutral's states were 0.24 / 0.20 / 0.16 and read as one flat black. A low-chroma solid moves *toward* its label (the visible direction, safe because it started at an extreme) and takes a wider step, since a grey has only lightness where a hue also shifts saturation.
- The two state-widenings were multiplying rather than taking the larger, dropping dark neutral's pressed label to Lc 55.
- High contrast pushed dark neutral's step 12 past pure white. Found by the law being written for the bug above it.

**The intake landed last, and it is what makes this a system rather than a generator.** `toneFromColor` takes a CSS colour: hue as-is, vividness as the colour's chroma measured against what its own lightness could hold, and the input's lightness carried as a pin. Light mode reproduces the supplied hex **byte-identically at step 9**; dark mode re-derives, since no promise was made about a dark solid. Verified against Radix violet, Vercel blue, Linear indigo, Radix red and yellow, and a teal — and every one is put through the full legibility suite in both modes, because pinning that bought fidelity at the cost of the guarantees would make this a colour picker. Out-of-band inputs snap, and a near-black brand colour falls through the low-chroma path to a near-black solid, which is what it wanted. Generated solids also round-trip: any step 9 on the preview can be pasted back in as an accent to reproduce its own scale.

Final shape: 106 laws, 4,316 bytes gzipped against a 40,960 ceiling, for three tones in two modes with full alpha ramps, a P3 block and a high-contrast block.

Rejected: `apca-w3` as a dependency (thirty lines against a licence question on a value we ship); snapshotting hex values (a snapshot asserts the output did not change, never that it is correct); normalising vividness across the configured tones so hues read at equal intensity (it works, but adding a destructive red would then silently change how the accent looks, and action at a distance is worse than a documented asymmetry); compressing the state excursion rather than reversing it (a fill near its cusp can only go lighter by shedding chroma, so the pressed yellow stopped being yellow).

## 2026-08-02 The colour generator lands, and interaction states learn to move away from their label

§14 step 2b. Three tones in both modes generate from a hue angle and a chroma peak each, 2,102 bytes gzipped for the whole token file against a 40,960 ceiling. `culori` does the colour-space work at build time; APCA-W3 0.1.9 is implemented directly, thirty lines, so the contrast guarantee has no licence question attached to it. The browser does no colour maths.

**The law tests earned their existence three times before the generator was finished.** Each failure was a real design defect, not a wrong assertion, which is the whole argument for laws over snapshots.

**First: the dark text role missed its own target.** `--destructive-text` measured APCA Lc 57 on the soft fill it sits on, under the Lc 60 body-text bar. Fixed in the ladder, dark step 11 from .77 to .80, rather than by lowering the bar.

**Second, and the interesting one: a fixed interaction direction walks a fill toward its own label half the time.** §7 said darken in light, lighten in dark, reasoned against the *background*. But in dark mode lightening a solid moves it toward its white label — the destructive pressed state landed at Lc 59. The same fault in mirror image hit every bright hue in light mode: yellow, lime and cyan carry black labels, and darkening on press dropped them to Lc 53-55, the worst cases in the system.

The rule is now **away from the label, never a fixed direction per mode.** The label is chosen on the resting fill, then hover and press move away from it, so the interaction states are *strictly more* legible than rest and only rest has to clear the bar. It reads correctly too: pressed separates further from its label rather than muddying into it. One exception falls out of the arithmetic — a fill already at an extreme has no room to move away (dark neutral rests at L .94 with a black label), so it moves toward the label instead, which is safe precisely because being at an extreme is what left the margin.

Worst case across every hue tested, both modes, is now Lc 68. It was 53.

**Third: the cusp pull needed to be stronger than guessed.** At 0.55 the bright hues sat in the middle-lightness zone where neither black nor white clears comfortably. 0.72 puts them where dark text has room.

The hostile-hue suite is the reason all of this surfaced: brand yellow, neon lime, hot magenta, cyan, near-black navy and a near-grey accent, each asserted against the same laws as the shipped tones. The near-grey case also confirms the low-chroma solid remap keys on chroma rather than on the tone being *named* neutral.

Also built: the alpha ramp (least-alpha overlay that composites back to its step, law-tested by recompositing), and colour swatches in the preview, because Lc numbers say a colour is legible and nothing but an eye says it looks right.

Rejected: pulling in `apca-w3` as a dependency (thirty lines against a licence question on a value we ship); snapshotting hex values (a snapshot asserts that the output did not change, never that it is correct); lowering the target to Lc 45 for interaction states, which would have passed all three bugs.

## 2026-08-02 highContrast does not ship, because both of its jobs are role-layer bugs

Radix's per-component `highContrast` was being reached for as a *look* — a darker, more authoritative button label — which is not what the name says and not what the mechanism is for. Two orthogonal problems were hiding under one prop, and neither one is about contrast.

**Radix's step 11 is placed at a floor**, the minimum clearing 4.5:1 on the backgrounds it sits on, so `highContrast` is an escape from a value tuned to a threshold rather than to how it should look. We generate and verify with APCA, so the default can sit where it looks right and still be provably legible. That removes the reason the escape existed.

**Fix one: a UI label is not a link.** `--accent-text` (step 11) stays where it is, because links and prose on a tint want the lighter, more chromatic value and *should* look different from a button label. Controls read a new `--accent-label`, generated between 11 and 12 — enough weight to read as a label, enough chroma to still say accent rather than ink.

**Fix two: prominence comes from chroma or from lightness, and at zero chroma lightness does all the work.** A mid-grey solid never reads as loud, whatever its lightness. So below a chroma threshold, `--accent-solid` resolves to step 12 rather than step 9. Keyed on chroma, not on the name "neutral", so a desaturated brand accent gets the same correction. Dark mode falls out free: step 12 there is near-white, giving the light primary with a dark label that Vercel, Linear and Radix all ship.

**Both live in the role layer, and that constraint is what makes them right.** The first instinct was to bend the solid band's lightness by chroma, the way section 7 already bends it by hue. That breaks the system: neutral step 9 at L .2 would sit *below* step 12 at .24, destroying the ladder's monotonicity and the guarantee that step 9 reads as the same step across every hue. Section 7's "do not mutate the scale" earns its keep here.

**Consequence worth remembering: the ramp runs out at 12.** A low-chroma solid cannot take +1/+2 for hover and press, so those derive as generated L-deltas off step 12 — the same problem that made `--accent-solid-active` a generated token rather than a step.

So `contrast` is now only what it should always have been: a Theme-level accessibility setting, honouring `prefers-contrast: more`, that shifts values globally. Section 7 previously framed it as a design knob with a cost to budget; that framing was wrong.

New law for the build: a label must clear APCA against **every** background in its rung, not only the resting one. Medium rests on step 3 and presses to 5, and the press state is where a label that passed at rest fails silently.

Rejected: a per-component `highContrast` prop (an appearance escape hatch, contradicting appearance-as-output, growing a boolean on every component whose meaning shifts per rung); moving step 11 darker (links and prose need it where it is); a step 11.5 (the scale does not gain steps — extra states live in the role layer); keying the solid remap on `tone === "neutral"` (misses the desaturated brand accent, which has the identical problem).

## 2026-08-01 Emphasis collapses to three rungs, border leaves the ladder, and material becomes backdrop defense

Supersedes the variant decision made earlier today and the material parts of sections 9-11. Kushagra's call, worked out in parallel with the token build.

**The five-name recipe set is dead.** `solid / soft / surface / outline / ghost` named construction rather than loudness, which is why four emphasis rungs could never map onto it cleanly. The earlier fix — keep `variant` public underneath `emphasis` as a documented escape — preserved the mixed metaphor instead of removing it, and left users with two props and no rule for choosing between them. There is now one axis: `emphasis = loud | medium | quiet`. Three rungs, because a rung has to earn a visible step to exist, and three stays obviously separable (roughly what iOS ships).

**`bordered` is the reason the ladder ever looked lossy.** `surface` and `outline` were never loudness levels; they were *containment*, a different question. As an orthogonal boolean it reproduces the whole old range from two comprehensible props: `quiet + bordered` is the old outline, `medium + bordered` the old surface. The blocker that opened this whole thread turns out to have been a factoring error, not a counting error.

**Material is backdrop defense, not decoration**, which is what makes it testable — does the label survive — rather than aesthetic. It is `solid | thin | thick`, off by default, and available on any component that can *float*, buttons included. That corrects the old "containers only" reading in both directions: a Card in a solid layout has nothing to defend against, and a Button over a photo does. `thin` and `thick` are two recipes rather than two magnitudes, since saturation and opacity do not order monotonically between them.

The load-bearing detail is that the brightness floor's direction follows the label: dark label brightens the backdrop, light label darkens it, which is what lets a control survive an arbitrary photo instead of the demo one. It needs no new plumbing — section 7's APCA-derived `--accent-contrast` already carries exactly that signal, so the material reads it and the label never moves.

**Performance has no clever fix, so the rules are architectural**: one glass per stack (the toolbar is the glass, its buttons are plain), material on fixed chrome that content scrolls under rather than on things that move and re-sample every frame, `prefers-reduced-transparency` honoured, `@supports` fallback to opaque. Blur radii are provisional until measured on a mid-tier device.

**Placement stays the user's.** Material over a solid surface is a muddy smudge, and the answer is allow-and-guide rather than block (rigidity leaks) or silence (people ship the smudge and blame the library) — the same stance as `className` forwarding and the margin escape.

Rejected: keeping `variant` as a public escape beneath `emphasis` (two props, one job); four or five rungs (a rung that is not visibly distinct is not a rung); border as a rung (the original error); `regular` as a material level (it was either the off-state or a status word on a magnitude axis); naming the loudness prop `variant` (the docs would spend forever explaining that the prop is not about looks); gating material placement by component (the library defines what material looks like, never where it goes).

## 2026-08-01 The radius prop becomes designed palettes, and the palette splits into two bands

The Theme `radius` prop was the last multiplier standing after density lost its own. It is now five designed palettes (`none`, `small`, `medium`, `large`, `full`) emitted under `[data-radius]`, and `--radius-factor` is gone.

**`full` is what settles it.** A pill comes free because CSS clamps `border-radius` to half the smaller dimension, but §6 requires surfaces to be *capped* at the same time, so a dialog does not become a giant lens. One factor scales controls and surfaces by the same amount and structurally cannot do both. A designed palette can: the control band goes to 9999 while the surface band holds at its medium values. The multiplier was already broken for the level that most needed care.

**The palette split into disjoint bands, and that is the load-bearing part.** Steps 1-5 are the control band, 6-7 the surface band. Density only ever picks a step; a level only ever says what a step is worth. No token is written by both, so the two axes compose instead of racing.

The alternative considered first was letting the radius level re-declare `--radius-control-N` directly and relying on source order, since the generated file controls it. That fails on nested Themes: a custom property set by a nearer ancestor wins regardless of source order, so an inner Theme setting only `density` would silently drop an outer Theme's `full`. Disjoint bands survive that; cascade ordering does not.

`none` squares everything including `--radius-full`, since a kill switch with an exception is not a kill switch. Surfaces moved up a step with the split, so a card reads 16px and a dialog 24px where they were 12 and 16 — a deliberate consequence of giving surfaces their own band, worth re-judging by eye.

**Caught on the first look at the preview: `full` was capping surfaces at medium's 16/24 while `large` already sat at 24/32, so cards got squarer as the dial turned up.** The cap now sits at large's values, and a law asserts the real invariant — for any step, the value never decreases across `none, small, medium, large, full`. Turning the dial up must never turn a corner down. Worth noting the shape of the miss: the cap was chosen against the requirement it came from (§6's "do not let a dialog become a lens") without checking it against its own neighbour on the ladder.

Two more law-test corrections fell out of building it. The "palette is non-decreasing" law was wrong: at `full` it must drop at the band boundary, so it now asserts monotonicity within each band. And the test helper that sliced a rule body ran to end-of-file, so a density block appeared to contain every later block's declarations; it now bounds at the closing brace. Both were tests asserting something looser than intended, which is the failure mode worth watching in a suite built on absence checks.

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
