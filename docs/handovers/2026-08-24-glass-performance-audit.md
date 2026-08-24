# Handover — the glass infrastructure, audited for performance, 2026-08-24

Written for the person who was not in the room. Plain English. Where this file and a
governance doc disagree, the governance doc is right.

The job was: look at the glass system again after the last two weeks of change, and find ways
to make it much faster without moving a single pixel.

Everything below was measured in a real Chromium, not read off the source. Where a claim is
that two things are identical, I built both and compared the bytes, then tried to break my own
comparison. Where I could not measure something, I say so instead of guessing.

---

## The short version

The glass **looks** the way it does for almost no per-frame cost. What it costs is a lump of
JavaScript on first paint, and that lump is much bigger than it needs to be — not because the
algorithm is wrong, but because it computes the same answers over and over.

**A realistic glass screen blocks the main thread for 137 ms on first paint. The same screen
in solid takes 9 ms.** Nine of every ten of those milliseconds are one arithmetic loop.

Three changes make that loop **2.9x faster with byte-identical output**. Three more remove work
that nothing can see. None of them touches a colour, a length or a recipe.

---

## 1. Where the time goes

One glass pane installs this, measured on a mounted `<Card backdrop>` at 600x420, regular:

| | |
|---|---|
| backdrop-filter | `url(#kui-lens-1) blur(4px) saturate(2.07) brightness(1.05)` |
| SVG filter primitives | **10** (`feImage`, `feGaussianBlur`, 3x `feDisplacementMap`, 3x `feColorMatrix`, 2x `feBlend`) |
| displacement map PNG | 8,678 bytes |
| glint mask PNG | 7,125 bytes |
| observers | 1 ResizeObserver + 1 MutationObserver |

The 10 primitives are the steady-state cost. They run on the GPU when the pane repaints. The
PNGs are the one-time cost: the browser has to be handed two images, and JavaScript draws them
pixel by pixel.

Building those two images for one 320x224 map costs, measured separately:

| step | cost |
|---|---|
| walk every pixel and ask "is it in the bezel?" | 1.3 ms |
| the four extra distance samples per bezel pixel (the surface normal) | 1.9 ms |
| **`bendAt` — the Snell solve, per bezel pixel** | **3.5 ms** |
| write the finished bytes | 0.3 ms |
| the glint's squircle distance field, over every pixel | 1.9 ms |
| `putImageData` | 0.3 ms |
| `toDataURL` (the PNG encode) | 0.4 ms |

The PNG encode is 9% of it. Almost everything is arithmetic.

---

## 2. The finding: the same answers, computed a hundred times over

`bendAt` is the physics — Snell's law across the bezel. It is the single most expensive step.
It takes **one varying argument**: how far into the bezel the pixel is.

A card's map calls it **17,924 times, for 166 distinct arguments**.

| box | calls | distinct arguments | recomputed |
|---|---|---|---|
| card 320x224 r21 | 17,924 | 166 | 108x each |
| dialog 238x320 r22 | 18,396 | 177 | 104x each |
| menu 320x263 r18 | 19,416 | 131 | 148x each |
| square 256x256 r0 | 17,136 | 18 | **952x each** |
| button 120x32 r16 | 3,264 | 103 | 32x each |

This is not an approximation to be traded off. Every pixel at the same depth in the bezel gets
the same bend, because that is what the model says. The straight edges of a pane are a handful
of distances repeated down their whole length.

Remembering the answer, keyed on the **exact** floating-point argument, takes the bend pass from
5.10 ms to 2.10 ms. Both sums agree to twelve decimal places, because a memo on an exact key
returns the exact value. There is no rounding anywhere.

---

## 3. Two more exact wins in the same loop

**The band is 14% of the map, and the loop walks all of it.** For a card, 61,484 of 71,680
pixels are visited and thrown away. The distance function is monotone toward the middle of a
row, so once a row leaves the bezel the interior can be skipped to the mirrored column. That is
exact, not a heuristic.

**The four extra distance samples are already computed.** The gradient reads the field at
x-0.5, x+0.5 and x+1.5 — which are the centre samples of the neighbouring pixels. Three rows of
cached centres make both gradients free, with no change to a single value.

**The glint's squircle costs three `Math.pow` calls on every pixel of the map** — 79% of all the
`pow` calls a pane makes. The p-norm is only different from the ordinary distance in the corner
region. Where either outside term is zero it reduces to the other term exactly.

---

## 4. What the three together do

Measured in Chromium, median of 13 runs, each box built both ways and compared byte for byte:

| box | shipped | fixed | |
|---|---|---|---|
| card 320x224 regular | 13.40 ms | 4.60 ms | 2.91x |
| dialog 238x320 thick | 17.10 ms | 5.30 ms | 3.23x |
| menu 320x263 regular | 13.40 ms | 4.50 ms | 2.98x |
| button 120x32 regular | 1.60 ms | 0.70 ms | 2.29x |
| square 256x256 r0 | 9.60 ms | 3.60 ms | 2.67x |
| pill 200x40 thin | 2.60 ms | 1.10 ms | 2.36x |
| **all six** | **57.7 ms** | **19.8 ms** | **2.91x** |

**Zero differing pixels in every case**, lens and glint alike.

I tried to break that result five ways. Memoising on a rounded key instead of the exact one:
caught, up to 72 levels of channel error. Taking the wrong term in the corner shortcut: caught,
up to 236. Getting the band test wrong: caught. Caching almost nothing: caught. One sabotage
survived — moving the row-jump by one column — and it survived because that column is provably
outside the band, so the edit was a no-op rather than a defect. The comparison is not blind; I
checked.

---

## 5. Work that nothing can see

**Reduced transparency stops the CSS and not the JavaScript.** Under
`prefers-reduced-transparency: reduce` the pane computes `backdrop-filter: none` and
`--material-ring-opacity: 0` — and the hook still builds both maps, installs the `<filter>`, and
writes `--kui-lens` onto the element. Measured: 8,678 + 7,125 bytes of images nothing will ever
sample. `surfaces.css` calls this preference "an accessibility requirement and a performance
escape in one". Half of that escape does not exist.

**High contrast stands the ring and the glint down** (`--material-ring-opacity: 0`) and leaves
the backdrop-filter alone. So the glint mask is built and never shown.

**A pane nobody can see pays in full.** Six glass cards, in a container the reader cannot see
through:

| where the cards are | maps built | bytes | cost |
|---|---|---|---|
| visible, in the viewport | 12 | 87,492 | 116 ms |
| scrolled 12,000px below the fold | 11 | 72,574 | 94 ms |
| `visibility: hidden` | 11 | 66,582 | 90 ms |
| `opacity: 0` | 10 | 57,720 | 75 ms |
| `content-visibility: hidden` | 8 | 42,788 | 67 ms |
| inside `display: none` | **0** | **0** | 5 ms |

Only the zero-sized case is free, and that is not a decision — it falls out of the hook
declining a box under 8px. A long page of glass cards pays for every one of them before the
reader has scrolled.

---

## 6. Near-twins pay twice for nothing

Two panes four pixels apart generate the same map SIZE and two different maps, because the
fitted bezel carries the raw floating-point scale into the cache key.

Measured, 600x420 against 604x423: both produce a 320x224 map with r=21. The two maps differ on
1.74% of their bytes, and **the largest difference is 1 unit out of 255**. At the filter's own
scale that is **0.03 of a pixel of bend**. Each pane pays a full solve and a full PNG encode for
that.

Snapping the fitted bezel to a quarter of a pixel changes the map by at most the same 1 unit.
This one is not byte-identical, so it is a judgement call rather than a free win — but the bound
is measured and it is thirty times below one pixel.

---

## 7. What is already right

These came back clean. They are recorded so the next audit does not re-raise them.

- **Glass does not stack, and it is worth real money.** A glass Card scopes its subtree, so the
  buttons and fields inside it resolve `on-glass`: no filter, no lens, no glint, no pseudo-
  elements. On the nine-pane screen only the nine panes minted lenses; the controls inside them
  cost nothing.
- **The rim stage ships off.** `glint.rimSaturate` is 0, so the four extra filter primitives are
  never built. The filter is 10 primitives, not 14.
- **Reference counting is sound.** Mounting and unmounting 70 panes leaves 0 filters behind. The
  2026-08-22 leak is fixed and stayed fixed.
- **The lens is skipped entirely in engines that cannot render it.** Safari and Firefox build the
  glint and never touch the displacement map.
- **The lens does not run during a flight.** The 2026-08-22 deferral holds.
- **`display: none` panes cost nothing.**
- **Nothing in the package sets `will-change`**, and no glass rule forces a compositing layer of
  its own beyond the backdrop root that `backdrop-filter` implies.

---

## 8. What I could not settle

- **Per-frame GPU cost.** This container renders in software. A frame rate measured here says
  nothing about how a real GPU handles a 10-primitive filter inside `backdrop-filter`, and
  reporting one would be a miscalibrated instrument. What can be said: the chain is 10 SVG
  primitives plus 4 filter functions, over the pane's whole box, and it re-runs whenever the
  pane or its backdrop repaints. **Needs a real device.**
- **Hover re-runs the whole chain.** A glass control's `:hover` installs a different
  `backdrop-filter` value (the brightness term moves). The lens re-evaluates with it. Whether
  that is expensive enough to matter is the same question as above.
- **Safari.** Whether WebKit parses the lens `url()` and paints nothing is still open, and the
  `var()` seam means that case would cost the blur too.
- **Two material laws fail in this container.** `CSS.supports("background-clip: border-area")` is
  false in the Chromium available here, so the field family's ring does not paint. This is the
  aliased browser build, not a defect in the code.

---

## 9. The order to do it in

Each step ships with the law that would have caught its absence, which is this repo's rule.

1. **Memoise `bendAt` on its exact argument.** A few lines. Byte-identical by construction.
   Law: the same box, built with and without the memo, is byte-for-byte equal — and the law fails
   if the key is ever rounded.
2. **Skip the interior; take the gradients from a rolling row buffer.** Same law covers it.
3. **Take the cheap path in the glint's corner distance.** Same law, on the glint.
   Steps 1-3 together are the 2.9x. Gate: the per-map A/B above, re-run against the real code.
4. **Do not build anything under `prefers-reduced-transparency: reduce`.** Law: a pane mounted
   under the emulated preference installs no filter and writes no custom property.
5. **Do not build the glint under high contrast.** Same shape.
6. **Defer panes that are not near the viewport.** This one needs a decision, because a pane that
   gains its bend as it scrolls in is a visible change. A generous margin makes it invisible in
   practice; the margin is a taste number and belongs in config.
7. **Consider snapping the fitted bezel.** Bounded at 0.03px of bend. A judgement call.

Steps 1-5 move no pixels at all. On the nine-pane screen they are the difference between 137 ms
of blocked main thread and roughly 50 ms, with 4 and 5 taking whole populations of panes to zero.

The projection in that last sentence is arithmetic on the measured parts, not an end-to-end
measurement. Confirming it end to end is step 3's gate, and it should be done before the number
is quoted anywhere else.

---

## Addendum, same day: steps 1-5 are implemented, and the ceiling moved

Kushagra's call on reading the report: do steps 1-5, "but 2.9x isnt enough." The 2.9x was the
ceiling of cleaning the existing loop, so the loop is gone instead.

**What shipped** (`refraction.tsx`, held by `refraction.browser.test.tsx`):

- The generator ASSEMBLES the map instead of solving every pixel: the bend memoised on its
  exact float argument, one corner quadrant solved and mirrored, straight edges filled one
  value per depth, the interior prefilled. Every float still comes off the real field at
  inputs that provably coincide — nothing is synthesised, which is what makes byte identity
  structural rather than lucky. Small boxes take a banded fallback.
- Under `prefers-reduced-transparency: reduce` the hook builds NOTHING — the gate reads the
  cascade's own computed answer, a media listener only wakes the flip back.
- Step 5 as written in this report (skip the glint under high contrast) is REVISED after
  refutation: an HC flip can arrive by a route nothing announces (the app's toggle stamping
  `<html>`), so skipping would strand a missing glint on the flip back. Under reduced
  transparency the glint skip rides step 4; under HC alone it keeps building (~1 ms, hidden
  by opacity, exactly the pre-change behaviour). A negative-control law pins the refusal.

**Measured after, same container, same fixtures:**

| | before | after | |
|---|---|---|---|
| card map (lens + glint) | 16.5 ms | 2.2 ms | 7.5x |
| dialog map | 17.5 ms | 2.4 ms | 7.3x |
| menu map | 15.5 ms | 2.3 ms | 6.7x |
| six-box sweep | 66.1 ms | 12.6 ms | 5.25x |
| the nine-pane cold screen's glass tax | 137.4 ms | 57.6 ms | 2.4x |

Byte identity is a LAW, not a claim: the 2026-08-23 generator is frozen in the law file as an
oracle and the PNG data URLs are compared string-equal across eighteen box shapes and three
rungs, with a coverage guard proving the sweep exercises both generator paths. Seven sabotages
caught; two survived and both were proven mathematical no-ops rather than blind spots.

The remaining ~58 ms on that screen: roughly 40% corner solves, PNG encodes and pixel writes,
the rest React and style work the solid screen also pays. Steps 6-7 (defer off-screen panes,
quantise the fitted bezel) both move pixels and stay decisions. Suite state after: 535 node +
1387 browser laws with the same 5 environmental failures as before the change (border-area
unsupported in this container's Chromium, plus the documented whole-pixel motion flake) —
verified by stashing the change and watching the same 5 fail without it. Budget unmoved at
32,936 gzipped: no CSS changed.
