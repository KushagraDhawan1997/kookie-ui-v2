# Handover: the builder moves into the Shell (2026-08-20)

Plain English, for whoever reviews this branch. The governance docs are the source of truth
(DECISIONS §27, LOG 2026-08-20 "The builder moves into the Shell"); this repeats them for a
reader who was not in the room.

## What happened

Main shipped `Shell` — the app frame — a few hours after the builder shipped its own. So the
builder had a hand-rolled frame: a full-height column holding a top bar, three fixed-width
boxes and four dividers. This branch deletes that and uses the real thing.

The reason is the same one this project used to refuse a docs framework: a builder whose job
is to prove the system composes, built on a frame the system does not provide, argues against
itself in the place it is loudest.

## What you get

Nothing you have to learn. The editor looks and works as it did, plus:

- **Real landmarks.** The top bar is a `<header>`, the palette and the canvas are named
  `<nav>` and `<main>`, the inspector is an `<aside>`. Screen readers get an app, not a pile
  of divs.
- **The Add / Layers tabs became an icon rail** — the narrow column on the far left. Same two
  regions, same behaviour, and pressing one now also opens the panel if it was closed.
- **Panels close instead of disappearing.** Preview used to throw the side panels away and
  rebuild them; now it closes them, so your scroll position and everything you had typed comes
  back when you leave preview.
- **It works on a small window.** Under 768px the palette and rail get out of the way and the
  canvas takes the screen. Before, they stayed and left the canvas about 20px wide.
- **Two buttons in the top bar** toggle the left panel and the inspector.

Nothing was removed. Every command, panel, dialog and shortcut is where it was.

## The bug this found — worth reading

Porting it turned up a defect in Shell itself that its own 46 tests were green through:

**A panel containing a scroll region could not be closed.** Not "closed badly" — the close did
nothing at all. Ask it to close and it stayed on screen, at any window size. On a phone, the
navigation panel that is supposed to get out of the way stayed put.

That is the exact shape the docs tell people to build (a panel with a `ShellScroll` inside it),
and it was broken from the day it shipped.

Why the tests missed it: every one of them put a plain piece of text in the panel. With text in
it, nothing competes with the "hide" rule, so hiding works. With a scroll region in it, two
other rules — one in the shell's own stylesheet, one in a shared one — win instead, and quietly
turn hiding back off. **The tests asserted the right thing about an input where right and wrong
cannot be told apart.** That is the same lesson the builder's own audit earned the day before,
found this time by a real consumer rather than by a suite.

The fix is one word added to four selectors: not-being-displayed now outranks how-a-displayed-
panel-lays-itself-out, by rank rather than by which rule happens to come last. Eight new tests
cover all four hiding conditions against both scroll arrangements; five of them fail with the
fix removed, and the three that pass are kept on purpose and explained, because which ones
survive is part of the finding.

## Honest flags for review

- **One thing moved home rather than being solved.** The inspector opens on a desktop and stays
  shut on a phone, and the builder decides that itself, because Shell's inspector only offers
  "closed until asked". That is written down as an open question for the library, not patched
  quietly. Without it the builder opened on a phone with the inspector covering half the screen.
- **Small visual change in the canvas area.** The jump bar (zoom, tier, breadcrumb) now sits on
  the panel's own surface rather than on the grey, so it reads as a toolbar. The grey moved down
  to the region the canvas floats in, which is what it was always describing.
- **The divider under the jump bar is gone** — the grey below it already draws that line, and
  two lines in one seam is a defect this repo has paid for twice.
- **CSS budget +7 bytes** (30,845 → 30,852), all of it the four longer selectors.
- **Four new builder tests, eight new Shell tests**, every one broken on purpose first and
  required to fail.
