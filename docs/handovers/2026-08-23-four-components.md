# Four components, in plain English

**Branch:** `claude/next-component-pattern-a8jprs` · **Date:** 2026-08-23

You asked what the next component pattern was, I recommended one and named three runners-up, and you said "let's do all 4". This is what landed, why each one is shaped the way it is, and the three things I want you to look at with your own eyes.

Four commits, one per component, each with its own laws, docs, playground section and budget re-record. `pnpm run ci` is green except for one failure that was already there before I started — see the last section, because it is interesting.

---

## What shipped

| | Cost | What it really was |
|---|---|---|
| **Badge** | +17 bytes | The atom family's third member, so it fired the promotion |
| **Row** | **−17 bytes** | §21's missing fourth row, and it deleted more than it added |
| **Popover** | +14 bytes | Split a class that was making two different claims |
| **Tooltip** | +117 bytes | Built the one identity §11 described and nobody had made |

Net **+131 bytes gzipped** for four components. Baseline is now 31,778 against the 40,960 ceiling.

---

## Badge

A short word or a count that says what the thing beside it is. It is the third member of the family Code and Kbd belong to, and that is the interesting part: the family rule says the second member self-keys and the third promotes, so the fill, the corner and the size-inheriting arm moved out of both stylesheets into one place, and the one-line box Kbd designed moved with them. Kbd's own laws needed no edit at all, which is the promotion proving it changed nothing.

**Tone is the category, not the volume.** There are no fill rungs and no `variant`: a failed deploy is `destructive` whether or not it is the loudest thing on the screen, and two badges of different loudness claim a ranking neither of them means. That is Notice's sentence, one family over.

**It is flat where a key cap is raised**, and that is the whole argument for it being a separate component rather than a Kbd without an edge. A cap is a picture of a physical object; a badge is printed onto the thing it marks.

**Refused:** a fill ladder, a dismissal (that is a control with a keyboard model — `Tag` waits for a real case), a `count` prop with its own overflow rule, a position (Apple's badge sits *on* its container, which §3 forbids a component owning), and emptiness — a bare coloured dot is colour carrying meaning alone.

**One thing to know:** the sabotage pass caught a defect in a law that shipped six days ago. Badge's floor law was copied from Kbd's, and Kbd's fixture used `K` — which renders 1.654em wide, *content*-driven, a hair over the 1.6em floor it was supposed to demonstrate. Deleting the floor entirely changed nothing either law could see. Both now measure a glyph the floor actually binds (`i`, at 1.599em) with a wide one beside it as calibration.

## Row

§21 named four rows on day one — menu item, command item, list item, sidebar button — and built three. This is the fourth, the one that lives outside Menu and Shell. It ships **no stylesheet at all** and no per-component class either: every other member wears one because it is a *part* of something, and a standalone row is a part of nothing.

**The evidence it was overdue is in our own apps.** `docs-search.tsx` rendered its results as full-width quiet Buttons with a comment saying it was standing in for exactly this. `command-palette.tsx` painted its highlighted row `var(--neutral-a3)` inline — the row family's lit fill redrawn by hand, and already drifted, because that fill grew material remaps and a high-contrast arm while the copy stayed one flat step. Both are ported.

**The design decision worth your attention:** what lights a row is a *per-instance* claim, not a per-component one. The same Row is roving inside a command palette (arrow keys move a highlight while focus stays in the field) and not roving in a settings list. So no component boundary can answer it. A Row stamps `data-hover-lit` when nobody else is driving it and stops the moment a caller states `highlighted` — state it and hover goes quiet, so a mouse resting on row one cannot argue with a keyboard that has moved to row five.

The marker is opt-in rather than a gate, and a menu **label** is why: it is a `.kui-row` that is not a control at all, so gating would have handed hover to every row that never asked, headings included.

`shell.css`'s private `:hover` rule is deleted. Its own comment had scheduled that — *"a third non-roving row is what promotes it"* — and two shell laws that encoded the old state came due with it.

## Popover

An anchored panel holding whatever you put in it, with the page still live. It is the floating family's first member whose *content* the system does not design, and that turned out to matter more than the component.

`kui-floating` was carrying two different claims: **where a pane sits** (it covers the app, so it casts, expresses the material, flies out of its trigger) and **what a pane holds** (rows, so its corner is the rows' corner plus the padding). Every member so far hugged rows, so nothing had separated them.

Measured, it is not subtle. Wearing the concentric arm, a popover's corner came out **42 / 54.25 / 71.75 / 89.25px** against a Card's 38.7 / 51.6 / 64.5 / 77.4 — rounder than a card at every index, and not matching a Menu either (28 / 33.25 / 36.75 / 40.25), so "one family, one corner" dies on the same numbers. The criterion was already written one join below, in the overlay pane's comment: *nothing about it hugs rows, so there is no concentric arithmetic to do.*

The same defect was there twice: the squircle bump's own sentence says *"a small pane hugging tight rows"* and it was on `.kui-floating` too, which is why the corner was still 42/56/70/84 after the first fix.

**Refused:** `modal` (a panel that must be answered is a Dialog), an arrow, free positioning, a width floored at the trigger, and a drawn ✕. `HoverCard` is *not* shipped and it is not an oversight — a card that opens on hover is a hover-reveal, and what that becomes on touch is a question §17 and §18 both assign to the pointer axis. Building one would answer it for the system by accident.

## Tooltip

The name of a control, shown to a pointer that rests on it. It closes §20's enumeration — Menu, Select, Popover, Dialog, Tooltip were the five floating components named the day the portal groundwork shipped, and all five now exist.

**The inversion cost two declarations and no new colour.** §11 has said `neutral (inverted)` with `exception: high-contrast inverted` since the defaults table was written. The answer is the mode's own two ends, swapped: the pane paints itself in `--color-text` and its words are written in `--color-surface`. Dark on a light page, light on a dark one, and `contrast="high"` reaches it free because the conformance surface moves both roles.

A `<Theme appearance>` flip looks obviously right and cannot work: under `appearance="inherit"` — the supported shape, and what apps/docs renders — no React code knows the current mode, because it is stamped on `<html>` before hydration.

**`children` is a `string`, and this is the one API narrowing I would most like you to sanity-check.** An inverted pane cannot invert an arbitrary subtree: a component that stamps a tone re-declares the ink roles *on its own element* and outranks anything a parent re-scoped. Measured, a `Kbd` inside a tooltip kept the page's dark ink and its own pale fill and vanished on a near-black pane. Re-scoping the tone trio as well is not a fix, because the chip's fill would still be wrong. So a tooltip holds a sentence, the shortcut case is a string too (`Undo ⌘Z`), and anything needing a chip is a Popover.

**Every refusal is one rule restated: a tooltip may only say what its control already says.** It has no keyboard route, no touch route and no reading order, so anything appearing only there is lost to everybody else. That is why the panel is `aria-hidden` (Base UI wires nothing either way — I measured — and announcing a restatement reads as "Undo, button, Undo"), why it needs no touch story, and why it takes no size, tone, emphasis, material or per-call-site delay.

The delay lives on `TooltipProvider` because Base UI accepts it nowhere else — which is the right home anyway, since a delay is a property of a region. It also *groups*, so the first tooltip in a toolbar waits and the rest arrive as the pointer travels.

---

## Three things to look at

1. **The tooltip's inset and delay.** `--tooltip-p-block` / `--tooltip-p-inline` are picks 2 and 4 into layout space (4px and 12px at default), giving a 28px chip; `--tooltip-max-w` is 240; the delay is 600ms. All v0. `/preview` → Tooltip has a grouped toolbar to feel the timing on.
2. **Badge's discount.** `--badge-scale` is 0.9, equal to the cap's and deliberately its own number. `/preview` → Badge puts badge, cap and chip in one row at four steps.
3. **The popover corner.** It is a card's now. `/preview` → Popover opens one beside a menu and a card at the same index, which is the row to read.

## Two things I did not do, on purpose

- **I did not wire tooltips onto the 26 icon-only buttons in apps/docs**, even though those were the forcing case I argued from. That is a behaviour change to a shipped app across many files, and this repo's own stance (the builder's toast) is that such a change belongs in its own commit. The component, its example and its playground section all exist; spending it is one small follow-up.
- **I did not give Row a "standing" height.** `ShellNavItem` stands level with a Button and a Row does not — a Row is the panel row. Whether a standalone row should be able to stand is a real question and withholding is the additive direction, so it is recorded rather than guessed.

## The one pre-existing failure, and it is worth reading

`src/system/motion.browser.test.tsx` → *"a button's travels, and it travels in whole pixels"* fails on this machine, and it failed before I touched anything. It is not flake and I have not weakened it.

The law pauses the ring's arrival animation and steps it, reading what the engine renders at each station. It expects whole CSS pixels. Chromium 141 renders **6, 5.96875, 5.95312, 5.9375 …** — 1/64px steps. The engine has started interpolating `outline-offset`.

That matters because the law's own comment says so: *"if this ever reports fewer steps than the pixels it crosses, the engine started interpolating and the refusal below is worth reopening."* The refusal is **"a field gets no arrival at all" (2026-08-10)**, which was decided on the measurement that a field's 2px of room is three values and reads as a stutter. On an engine that interpolates, that premise no longer holds. Whether a field should get its arrival back is your call; I have only recorded that the door is open.

*(Environment note: Playwright 1.62 wants chromium build 1234 and the image ships 1194, so the browser project could not launch at all — and CI still exited 0, which is the 2026-08-20 "a launch failure that reads like a pass" finding recurring for a new reason. I symlinked the installed binaries into the expected paths. That is an environment fix and nothing in the repo changed for it, but it means CI here was reporting green over 1,400 laws that never ran.)*
