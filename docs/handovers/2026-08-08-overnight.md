# Handover — overnight run, 2026-08-08

Branch: `claude/kookie-ui-overnight-tasks-iiu5x5` · five commits · `pnpm run ci` green on each.

**What this file is, and is not.** A handover is written in plain English for the person who was not in the room, and it is the only doc here that is allowed to repeat itself. The governance docs each say one thing and say it once — `DECISIONS.md` is what the system is, `LOG.md` is how it got there, `REVIEW.md` is what an audit found, `ENGINEERING.md` is how we build. This says *what happened in one session*, and every claim in it is stated properly in one of those four. If they disagree, they are right and this is stale. Nothing should ever be read out of this file and into code.

It exists because the work was done unattended. When a session runs while nobody is watching, the review burden is higher than usual and "read five commits and three doc diffs" is the wrong place to start.

---

## What shipped

**Four components** — Progress, Code, Kbd, Blockquote. **One audit.** **One documentation site.**

CSS budget went 20,000 → 20,220 gzipped for all of it. Test count went 891 → 965 in the package, 43 → 73 in the docs app.

### Progress

A progress bar: a grey groove with a coloured fill.

The interesting part is what it does **not** have — a size setting. Sliders already ship four track thicknesses, and reusing them was the obvious move. But those numbers were chosen as a fraction of the slider's round handle; they mean "a quarter of the size of the knob." A progress bar has no knob. Reusing that ladder would have sized the bar against a part it does not have.

This repo has made that exact mistake four times, in four different places (control padding, the mark ladder, the checkbox corner, the slider rail). This is the fifth, and the first one caught *before* shipping rather than after. It got one fixed thickness instead.

Adding a size setting later is additive; removing one is a breaking change. That is why the answer is "not yet" rather than "yes" — the reversible direction is the one you can take without a taste pass.

It also animates when the task has no known duration. I checked whether that broke the rule that nothing animates until the motion system exists. It does not: that rule is about state changes — hover, press, disable — and a sliding bar is the same category as the spinner, which already ships and already answers people who have asked their computer to reduce motion (slow it down, never stop it).

### Code and Kbd

Inline code snippets, and keyboard key caps like ⌘K. **75 bytes for both**, because nearly everything they look like was already written in the shared type layer.

The spec sheet said these default to `emphasis: medium`, and building that literally would have been a bug. "Medium" in that row is borrowed from the *button* vocabulary, where it means a soft background fill. These are text, and for text the same word means a dimmer ink colour. Implemented as written, one setting would have been doing two different jobs on one element — which is exactly the confusion that got the `variant` prop deleted. The spec is corrected instead, with the reason beside it.

One genuinely unusual thing: `Code` has no default size. Every other component has one. If it copied Text's default, a snippet inside small caption text would jump to full body size and people would quietly stop using it there. Unset, it matches the line it is sitting in.

### Blockquote

A pull quote with a vertical rule down the left. 27 bytes.

Its one open question was whether colouring the quote red also colours the bar. It does not — the colour moves the words, the bar stays neutral.

The riskier half was *how that was written*, not what was decided. The natural-looking CSS would have been "use the coloured border if there is one, otherwise the neutral one." That is a trap: CSS colour variables flow downward, so an uncoloured quote sitting anywhere inside a coloured section would silently inherit that section's colour. This repo has been bitten by that shape twice. It is written flat, with a test that specifically nests an uncoloured quote inside a red one.

---

## The audit

I went back over the work trying to break it. **One real bug, and it was mine.**

Progress carried a line meaning "don't let a cramped layout squash you." That protects its thickness — but the same line also froze its *width*, and the bar is set to fill its container. Sitting beside a button in a row, it overhung its container by **81 pixels**. Measured, not inferred.

Worse than the bug: my test for it only checked one direction. It verified the bar keeps its thickness in a vertical stack and never checked a horizontal row — so it tested the half that was working. There are two tests now, and I proved they catch opposite mistakes.

Also found: a leftover checkbox test that could not fail — an older, weaker version that an earlier fix was meant to replace but left behind, carrying a comment claiming a browser limitation that measurement shows does not exist. Deleted.

**Two things found and deliberately not fixed**, because they are system decisions rather than repairs. Both are written into `DECISIONS.md`'s open list so the next audit stops rediscovering them:

- High contrast mode does nothing to a progress bar. That is the existing rule working correctly — high contrast targets borders and text, not fills — but a bar is the one component whose entire meaning is one fill against another. Measured at 3.06:1 in light and 4.13:1 in dark, identical to the slider already shipped and above the accessibility floor for non-text.
- A separator placed against the wrong axis (a vertical rule inside a vertical list) renders invisible but stays in the accessibility tree. Not fixable without guessing the container's direction, which is the same argument §16 already makes elsewhere.

**On my own reliability:** two of my measurements were wrong before they were right, and both failed *silently* — producing plausible tables of nonsense rather than errors. One had my colour parser reading the "3" in `display-p3` as a colour channel. Nothing catches that except noticing that an instrument giving the same answer for every input is not an instrument.

---

## A build problem found by accident

There is a rule that every component must appear in the playground, enforced by a test. **That test was not running.**

It reads a file from the package, but the build tool only watched the docs folder — so adding a component looked like "nothing changed" and served a cached pass. A full test run reported 43 docs tests green while two brand-new components had no playground section at all. One line fixed it.

The generalisation is in `ENGINEERING.md`: a law that reads across a package boundary owes a build edge across the same boundary. "Did not run" is a way of not failing.

---

## The documentation site

New: `/components`, an index, plus a page per component.

It is one page template reading a single data file rather than twenty hand-written pages. Adding a component means adding a row; twenty pages means twenty places for one claim to drift with nothing to notice when it does.

The section that matters is **"What it refuses, and why."** A generated API table can only list what a component *has*. It cannot distinguish "no `variant` because we deleted it deliberately, and here is the reasoning" from "no `variant` because nobody got to it" — and that distinction is most of what this library is.

A test checks every export has an entry, plus two more checking the entries actually say something, because the cheapest way to satisfy a coverage rule is a blank row.

**The type checker caught me publishing something false.** I documented a `Theme` prop called `accentColor` that has never existed — accent is set in config and baked in at build time, not per subtree. I wrote it confidently and it was wrong. A markdown docs site would have shipped that sentence; this one failed the build. The absence is now documented as a deliberate refusal.

The site was run and looked at, not only compiled.

---

## Waiting on you

Three decisions I chose not to make alone. All three are in `DECISIONS.md`'s open list with their arguments; this is only the index.

1. **Does a progress bar earn a size setting?** If yes, the honest move is not a second set of numbers — it is renaming the slider's track ladder into a shared one, the same promotion the mark family already went through. The playground now shows a bar and a slider on one page, which is what judging it needs.
2. **Should a progress bar accept a colour?** A failed upload in red is exactly what the colour vocabulary exists for. Left closed because adding an axis the day a component ships is assignment, not derivation.
3. **The usual v0 numbers** — the bar's thickness, the chip padding, the quote indent. Config lines, waiting for the eye pass.

---

## Environment caveat

The browser the test suite normally pins could not be downloaded in this session (network restriction), so the suite was pointed at the Chromium already present on the machine — **141 rather than 151**. That was a machine-local alias; nothing in the repo changed, and no config was edited to accommodate it. It does mean the browser laws in these five commits ran against a slightly older engine than a local run will use. Worth a re-run on a normal machine before merge, and worth knowing if anything here behaves differently for you.
