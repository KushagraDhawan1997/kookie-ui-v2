# Handover: the Shell — spec'd and built (2026-08-16)

Plain-English summary for reviewing this branch. The governance docs are the source of truth
(DECISIONS §26, LOG 2026-08-16 ×2); this repeats them for a reader who wasn't in the room.

## What happened

Two things, in order, on one branch:

1. **The spec.** We read v1's Shell whole (~4,300 lines of TS, 643 of CSS, 46 test files,
   plus its own audit report with open P0 bugs) and wrote DECISIONS §26 from the autopsy.
   Almost everything is a deletion. The calls you made in the conversation are all recorded:
   the header is full-width by definition (otherwise it's a content header), drag-to-resize
   comes later but the architecture leaves room for it, pane widths are real numbers (the
   system's first — nothing else could price them), peek comes later, and floating IS the
   gap (no gap prop anywhere).

2. **The build.** The component, its stylesheet, its tokens, 33 tests, the playground
   section, and the reference entry — all shipped, all green except four pre-existing
   flaky motion tests explained below.

## What you get

```tsx
<Shell>                                  {/* or panes="floating" */}
  <ShellHeader>…</ShellHeader>           {/* full-width bar, <header> */}
  <ShellRail aria-label="Sections">…     {/* narrow icon column, <nav> */}
  <ShellSidebar aria-label="Primary">…   {/* wide nav column, <nav> */}
  <ShellContent>…</ShellContent>         {/* the work area, <main>, scrolls itself */}
  <ShellInspector>…</ShellInspector>     {/* right detail column, <aside>, rests closed */}
  <ShellBottom>…</ShellBottom>           {/* terminal/log strip, <aside>, rests closed */}
</Shell>
```

- **Panes are cards.** Every pane is a surface: it gets the seal, the hairline, the look
  axis, glass, and the app's flat/elevated depth for free. The shell itself paints nothing.
- **Untouched panes do the right thing with zero code.** Don't pass anything and the
  sidebar/rail are open on desktop, closed on a phone — decided by CSS at first paint, no
  script, no flash, no hydration risk. Open something on a phone and it presents as an
  overlay: scrim behind it, Escape closes, the rest of the shell goes inert, focus comes
  back to the button that opened it.
- **State is per pane, like Dialog:** `open` / `defaultOpen` / `onOpenChange`. The first
  toggle makes an auto pane explicit. Nothing fires at mount, ever — structurally.
- **`ShellTrigger target="sidebar"`** anywhere inside the shell drives a pane by name and
  carries `aria-expanded`/`aria-controls`. Wrap your own Button with `render`.
- **`panes="floating"`** separates the panes: gaps show your page (glass finally has
  something to see through to), corners come back, spacing is even everywhere by
  construction and tightens with density. No gap knob — that's on purpose.
- **Widths:** `<ShellSidebar width={320}>` (px). It writes the same CSS variable a future
  drag-resize will write, so resize lands later without any API change.

## What is deliberately NOT here yet

- **Motion.** Panes snap open/closed. Menu shipped the same way and gained its unfurl the
  next day; the shell's spring entry is the recorded follow-up. A test asserts the absence
  so it can't drift in unnoticed.
- **Drag-to-resize** (your call: later, but important). The width-variable design is the
  room left for it; it arrives with min/max, persistence, and the written exception to
  "no JS at interaction time".
- **Peek, `stacked` presentation, mixed flush/floating** (Linear's nav-flush + content-
  floating). All recorded open, waiting on real screens.

## Numbers

- **+556 bytes gzipped** for the whole frame, tokens included (budget 25,327 → 25,883).
  For scale: Checkbox alone was +311.
- **33 new laws** (27 in a real browser, 6 reading the shipped files). The five that carry
  the design were falsified first — the suite was run against deliberately broken code and
  had to fail. One falsification script was itself caught doing nothing (a one-character
  mismatch in its search string) while reporting success; falsifications now assert they
  actually applied. That lesson is in LOG.
- **1,335 package tests, 155 docs tests.**

## Honest flags for review

- **Four pre-existing motion tests fail on this container** (two menu unfurl laws, one
  select entry law, one focus-ring travel law). They fail *identically on the clean tree
  before any of my changes* — they measure real animation frames and this sandbox can't
  hold frame rate under full-suite load. Expect them green on a normal machine; nothing
  shell-related is near them.
- **One unrelated test got a real fix in its own commit:** the ink-ladder law runs the
  colour solver twenty times and takes ~5.05s of honest compute here, against a 5s default
  timeout. It now has explicit headroom (20s) with the measurement in the comment.
- **v0 taste values** for the eye pass: pane widths (64/288/320/200 — v1's judged numbers),
  the floating gap pick (layout-space 3 ≈ 8px), the auto postures, and flush-vs-floating in
  an elevated world (flush panes casting shadows onto neighbours is a cell nobody judged).
- **Overlay containment is `inert`-based** (focus, pointer and the accessibility tree all
  leave together) rather than a ported focus trap. Two simultaneous overlays closed in
  non-stack order restore `inert` a beat early — noted in the code, pathological in
  practice, and the scrim closes all of them at once.
- **The playground section** (`/preview`, "Shell") is the judging surface: a flush demo
  with triggers and a floating demo with rail + sidebar. Drag the window across 768px to
  watch auto resolve with nothing re-rendering.
