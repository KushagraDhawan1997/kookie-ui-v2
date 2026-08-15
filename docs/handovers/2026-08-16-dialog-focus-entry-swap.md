# Prepared patch: Dialog swaps to the focus entry (§24)

**Status: WAITING. Do not apply until AlertDialog has landed** (WIP in another session — it
takes the overlay materialization recipe, the `OverlayBody` runner, and the current §24
entry/exit laws as its own, re-keyed to its popup class, laws moving in the same commit).
This file is the Dialog-side follow-up, pre-written so the swap is one commit. It is a
recipe for edits, not a source of truth — where it disagrees with the governance docs or
the code at apply time, they win. Judged values come from the lab (lab2's mass strip,
variant A, tuned by Kushagra 2026-08-16: "a bit faster, a little more than 2%, very slight
overshoot") and are v0 for the eye pass like every other locked motion value.

The decision this implements: LOG 2026-08-16 "Alert dialog and dialog split." The entry is
**depth, not distance** — the scrim pushes the app back, the panel comes forward 3% in z
with a very slight single overshoot, zero x/y travel; the content shares the container's
coming-into-focus (blur → sharp) and ONLY that, because blur is the one channel that
presumes nothing about content the system doesn't own.

---

## 1. Config (`packages/ui/src/tokens/config.ts`)

New spring in `springs`, beside `elastic` (same shape). ζ = 0.8 gives a single ~1.5%
overshoot — exp(−πζ/√(1−ζ²)) — and the normalized ω matches the lab's sampled curve:

```ts
/** The heavy plane's spring (§24): near-critical — one slight crossing, gentle return.
    Mass forbids overshoot; this spends almost the whole one-crossing allowance on the
    approach. Lab-judged at ζ 0.8 (≈1.5% single overshoot). */
poised: { zeta: 0.8, omega: 8.75, steps: 36 },
```

(Name is a proposal — the vocabulary is calm/lively/elastic/stiff; Kushagra names it.
Do NOT redefine `calm`: different curve, and silent redefinition is the mode-blind-step
bug's shape.)

New clock/travel family, beside `overlayMotion` (which moves to the alert with the
materialization — renaming it `alertMotion` is the other session's call):

```ts
/** §24, the DIALOG's entry — the large-mass principles: clocks stretch with mass, travel
    is depth only. settle = the box's z-arrival AND the content's focus clock (the content
    is part of the mass, so one clock); reveal = presence, paint. depth = the z-travel
    (scale start); blur = the out-of-focus start, px. */
dialogMotion: { settle: 600, reveal: 300 },
dialogEntry: { depth: 0.97, blur: 6 },
```

Exit clocks stay the family's shared `dissolve` / `settle` pair (today `overlayMotion`'s
140/160) — wherever those land after the alert's rename, the dialog exit reads them.

## 2. Generator (`packages/ui/src/tokens/generate.ts`)

- `--motion-spring-poised` emitted exactly as `--motion-spring-elastic` is (sampled
  `linear()`; the spring re-derivation law should pick it up from config automatically —
  if the law lists springs by hand, add it).
- `--dialog-settle`, `--dialog-reveal`, `--dialog-depth`, `--dialog-blur` puts beside the
  overlay ones. `depth` is unitless; `blur` is px.
- Regenerate: `pnpm --filter @kookie-ui/react run tokens`.

## 3. Recipe (`packages/ui/src/system/surfaces.css`)

The materialization block will have been re-keyed to the alert's class. The dialog's block
replaces it ON THE DIALOG PATH, keyed on the member class (`.kui-dialog-popup` — the
overlay family class keeps only what both members share: identity, size join, width).
All of Base UI's own stamps, no runner, no measurement, no JS:

```css
/* ── The DIALOG's entry (§24, 2026-08-16): DEPTH, NOT DISTANCE. A dialog is summoned, not
   an interruption — the scrim carries the arrival (it pushes the app back, §10), and the
   panel comes forward: 3% in z on the poised spring, zero x/y travel, presence as paint.
   Mass rules from the lab: clocks stretch, damping near critical (one slight crossing),
   onset soft (a spring from rest has no instant velocity). No size channels ON PURPOSE —
   a law asserts their absence. */
.kui-surface.kui-overlay.kui-dialog-popup {
  transition:
    scale var(--dialog-settle) var(--motion-spring-poised),
    opacity var(--dialog-reveal) ease-out;
}
.kui-surface.kui-overlay.kui-dialog-popup[data-starting-style] {
  opacity: 0;
  scale: var(--dialog-depth);
}
/* The content shares the container's coming-into-focus and ONLY that (Kushagra
   2026-08-16): blur → sharp on the box's own clock — depth of field is a property of the
   mass, so what is printed on the plane focuses WITH the plane. No travel, no print, no
   independent opacity: the arrangement inside is the consumer's, and blur is the one
   channel that presumes nothing about it. */
.kui-dialog-popup .kui-dialog-body {
  transition: filter var(--dialog-settle) ease-out;
}
.kui-dialog-popup[data-starting-style] .kui-dialog-body {
  filter: blur(var(--dialog-blur));
}
/* The exit is the family dissolve, unchanged in character. Scale stays LISTED so a
   mid-flight dismissal RETARGETS the running entry smoothly instead of cancelling it
   (the 2026-08-16 finding: dropping a property from transition-property cancels its
   running transition and the value jumps). */
.kui-surface.kui-overlay.kui-dialog-popup[data-ending-style] {
  opacity: 0;
  scale: 0.99;
  transition:
    scale var(--overlay-settle) var(--motion-spring-stiff),
    opacity var(--overlay-dissolve) ease-in;
}
```

Reduce-motion: extend the shared §8 block to cover `.kui-dialog-body` and the dialog
pose selectors (transition none; opacity/scale/filter neutral), exactly as the overlay
selectors are covered today.

## 4. Component (`packages/ui/src/components/dialog/dialog.tsx`)

- `DialogContent` stops rendering `OverlayBody` (that runner is the alert's now — it
  lives in system/floating.tsx since the 2026-08-16 promotion). It renders a plain
  `<div className="kui-dialog-body" role="presentation">` — the wrapper survives only as
  the blur's subject (§10's mechanically-forced sanction, restated: you cannot blur
  children without a box holding them).
- Two behavior consequences, both deliberate — record them in the registry/refusals if
  not already:
  - `defaultOpen` mounts INSTANT (Base UI stamps no starting-style on mount). Right for
    a dialog: a panel already open at page load has no arrival to perform.
  - A quick reopen mid-dissolve gets NO fresh entry (no starting stamp on that path —
    the menu's 2026-08-16 finding). For THIS entry that is correct, not a bug: the
    recovery (opacity and scale easing home) is visually the entry itself. The dialog's
    reopen law from 2026-08-16 moves to the alert with the runner; do not re-point it at
    Dialog.

## 5. Laws (`packages/ui/src/components/dialog/dialog.browser.test.tsx`)

The current §24 entry laws move to the alert (other session). Dialog's replacements —
every one falsified against sabotaged CSS before trust:

1. **The pose** (the exit law's stamp-and-pin pattern): under `[data-starting-style]`,
   opacity 0, `scale` = the depth token, `translate` = none (depth not distance), body
   `filter` = the blur token.
2. **No size channels**: the entry's `transition-property` lists scale and opacity ONLY —
   no block-size, no inline-size, no border-radius, no padding, no translate. This is the
   materialization's negative and the law that keeps "depth not distance" true.
3. **Spring agreement + single slight overshoot**: the scale channel's easing equals
   `curveOn(popup, "--motion-spring-poised")`; samples exceed 1 somewhere (vacuity guard —
   it genuinely overshoots) but never 1.02, and cross 1 exactly once.
4. **Two clocks, one mass**: scale and the body's filter share `--dialog-settle` (the
   content focuses WITH the mass); opacity rides `--dialog-reveal` and eases (paint).
5. **The content is not printed**: the body's transition lists `filter` ONLY — no
   opacity, no translate delays. The ownership law.
6. **The exit dissolves** (adapt the existing law): scale listed at stiff, opacity
   ease-in — and a mid-flight Escape RETARGETS: sample the rect mid-entry, dismiss,
   assert continuity (no single-frame jump).
7. **Suppression is total** (keep the existing reduce law; re-point selectors).

## 6. Cleanup + bookkeeping (same commit)

- Retire the lab: delete the mass-lab block from `apps/docs/app/lab2/lab2.css` and the
  `DialogMass` strip from `apps/docs/app/lab2/page.tsx`.
- DECISIONS §24: the entry paragraph now describes the alert's gesture — rewrite for the
  split (alert = materialization, dialog = focus entry), citing LOG 2026-08-16.
- LOG: one lock entry (the values, what was judged out: B's rise = levitation, C's fade
  = earns nothing, D's set-down = physical but lost to depth — confirm D actually lost
  before writing this; it was unjudged at prep time).
- Budget: re-record `baselineGzipBytes` in `packages/ui/budget.json`.
- Full `pnpm run ci` from repo root before claiming done.
