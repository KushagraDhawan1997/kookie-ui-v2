# Handover: the Shell — spec'd, built, audited, repaired (2026-08-16)

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

2. **The build.** The component, its stylesheet, its tokens, the playground section and the
   reference entry.

3. **The audit, and the repair.** A 17-agent adversarial pass found a critical defect I had
   shipped — see below. Fixed, with the tests that should have caught it.

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

- **+610 bytes gzipped** for the whole frame including the audit repairs (25,327 → 25,937).
  For scale: Checkbox alone was +311.
- **46 laws** (38 in a real browser, 8 reading the shipped files), up from 33 after the
  audit. Every load-bearing one was falsified — the suite run against deliberately broken
  code, and required to fail. Three falsification scripts were themselves caught doing
  nothing while reporting success; they assert their own application now, and that lesson
  is in LOG.
- **1,348 package tests, 155 docs tests.**

## The audit found a critical, and it is fixed

After building it I ran a 17-agent adversarial audit. It found a defect that could **permanently
brick an app**, reachable by ordinary pointer use, with all 33 of my tests passing:

Open the nav drawer on a phone, press something in it that opens a second pane, then tap the
scrim. Both drawers went dead while visible, and afterwards the header and the main content
stayed permanently unclickable and unreachable by keyboard — until reload.

The cause: I made each pane responsible for disabling the others. A pane can only see itself,
so with two open they disabled each other, and each one's idea of "how things were before" had
already been overwritten by the other. My code even had a comment claiming this case was
considered and harmless. It was neither.

Why no test caught it: every one of my overlay tests opened exactly **one** pane. The suite
swept sizes, widths, states and postures, and never swept *how many*.

The fix moves that responsibility to the shell itself — the only place that can see all the
panes at once. Six smaller repairs came with it: an overlay pane could cover the entire screen
on a small phone leaving no way to close it; the floating layout overflowed its own container;
a too-wide header pushed the whole page sideways; and pane widths leaked into nested content.

Five new tests cover the two-pane case, and I broke the code on purpose to prove each one
fails without the fix. Two of the *new* tests turned out to be unfalsifiable when I tried that —
both are fixed and noted in LOG.

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
- **Placement is settled and tested both ways.** At the app root — what it is designed for —
  switching off every child of the shell *is* switching off the app, so nothing leaks. Inside
  a Dialog, the dialog already handles everything outside it, so the shell doing its own
  children is exactly right. Both are covered by tests. Checking this found one real bug: a
  single Escape was closing the panel *and* the dialog around it. Now the innermost thing
  answers the key and nothing else hears it. The one placement not claimed is a Shell dropped
  into a larger page as a widget — there the surrounding page stays keyboard-reachable behind
  an open panel (mouse users are fine, the dim layer covers it).
- **One limit still open**, in §26: the switching-off only works once JavaScript loads, so a
  page arriving from the server with a panel already open is briefly unprotected for keyboard
  and screen-reader users. Not patched quietly, because a half-answer would look like the
  answer.
- **Note for embedded use:** the automatic "open on desktop, closed on phone" behaviour reads
  the *window*, not the box the shell is in. That is right at the app root. A Shell inside a
  dialog should say what it wants explicitly.
- **The playground section** (`/preview`, "Shell") is the judging surface: a flush demo
  with triggers and a floating demo with rail + sidebar. Drag the window across 768px to
  watch auto resolve with nothing re-rendering.
