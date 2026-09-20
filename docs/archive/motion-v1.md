# Motion v1 — the record

- **Removed:** 2026-09-20. From that date every state change in KookieUI v2 is instant. The live rule is DECISIONS §8, "Motion: none — every state change is instant (2026-09-20, Kushagra)".
- **Why, in Kushagra's words:** "Lets run an ultracode agent to remove all motion from kookie ui v2. Motion needs to be done properly, what we have is not proper. We can keep a record of it somewhere, in a markdown, but lets go back to instant changes."
- **What survived the removal that motion had made:** the segmented control's thumb element and its measurement, and the Shell tab bar's, which is the same mechanism's second member. The travel is gone and the elements are not, because deleting them changes settled pixels in one state; the measurement and the open question are in [The exceptions to "no JS at interaction time"](#the-exceptions-to-no-js-at-interaction-time). Nothing else does.
- **Last commit with motion:** `39f388494fe01c27f0f2aa620359fdc16b62a18b` (short `39f3884`), 2026-09-20 00:15 +0530, "docs: NumberField's zones and the disabled arm in §51/§8, and the week of red laws in LOG".
- **To read any file as it was:** `git show 39f3884:<path>`, for example `git show 39f3884:packages/ui/src/system/floating.tsx`.
- **To restore a file:** `git checkout 39f3884 -- <path>`. Pieces do not restore alone. The tokens (`packages/ui/src/tokens/config.ts`, read by `generate.ts`, written to `tokens.css`), the entry runner (`packages/ui/src/system/floating.tsx`), the stylesheets (`system/recipes.css`, `system/surfaces.css` and the component sheets) and the laws were one system. The stylesheets read tokens that only the generator emitted (`--motion-*`, `--floating-*`, `--overlay-*`, `--dialog-*`, `--tooltip-*`) and variables that only the runner wrote (`--kui-fly-*`, `--kui-seed-*`, `--kui-from-*`, `--kui-anchor-w`). The laws read all three. A piece restored alone reads names that nothing declares, or writes names that nothing reads. The system was also written against Base UI 1.7 and against the engine behaviour of its time; both are listed under [Lessons](#lessons).
- **What was kept that was never motion's:** three loops in the package — Spinner's rotation, Progress's indeterminate sweep and Attachment's upload sweep. They were never part of the motion system. Each is motion that IS the content: an indefinite loop that read no motion token and was never scaled by `motionSpeed` (config.ts:776-780). Under `prefers-reduced-motion` each slows and does not stop (Spinner 1s to 3s, the two sweeps 1.6s to 4s), because "a busy indicator that stops moving is information lost" (DECISIONS §8 as it now reads; LOG 2026-08-09 "Motion's grammar is chosen: physics, not clips — judged on a switch and a button", principle 8; `spinner.css`, `progress.css`, `attachment.css` @39f3884). See [The content loops, which stayed](#the-content-loops-which-stayed).

## What this record is

This is a record, not a spec: it describes the motion system as it stood at `39f3884`, and nothing in it is a rule. The live spec, `docs/DECISIONS.md` §8, says there is no motion. It merges three working sections written from `39f3884` — the controls section (principles, tokens and the control layer), the floating section (the floating family, the overlays and the drawers) and the instruments section (instruments, laws, lessons and docs) — with nothing dropped; where two of them disagreed, both readings are kept and the disagreement is named. Citations point at `39f3884`: `file:line`, DECISIONS §N, LOG entries by date and title (the entries stay in `docs/LOG.md`), CLAUDE.md and `docs/handovers/`. "Judged" is a number as Kushagra judged it in `config.ts`; "emitted" is what `tokens.css` carried after 2026-09-14, when every duration was multiplied by `motionSpeed` (0.6) and rounded to the millisecond. Where a dated source quotes a clock, the number is the one current on that date.

## Contents

- [What this record is](#what-this-record-is)
- [The system, by layer](#the-system-by-layer)
  - [Chronology](#chronology)
  - [Principles and grammar](#principles-and-grammar)
  - [The numbers](#the-numbers)
  - [The control layer](#the-control-layer)
  - [Marks and grips](#marks-and-grips)
  - [The travelling highlight](#the-travelling-highlight)
  - [The floating family and its runner](#the-floating-family-and-its-runner)
  - [The overlay family](#the-overlay-family)
  - [The drawers](#the-drawers)
  - [The smaller fades](#the-smaller-fades)
  - [The content loops, which stayed](#the-content-loops-which-stayed)
  - [The harness and the laws](#the-harness-and-the-laws)
  - [The docs side](#the-docs-side)
- [Lessons](#lessons)
  - [Time, the machine, and when a law looks](#time-the-machine-and-when-a-law-looks)
  - [What a law reads](#what-a-law-reads)
  - [Fixtures, sabotage and calibration](#fixtures-sabotage-and-calibration)
  - [Reduced motion and media](#reduced-motion-and-media)
  - [CSS and engine facts motion depended on](#css-and-engine-facts-motion-depended-on)
  - [Base UI and floating-ui facts](#base-ui-and-floating-ui-facts)
  - [Building and judging](#building-and-judging)
  - [The recurring shape, as the audits named it](#the-recurring-shape-as-the-audits-named-it)
- [What went wrong](#what-went-wrong)
  - [The audits](#the-audits)
  - [Defects, by date](#defects-by-date)
  - [Reversals](#reversals)
  - [Laws that could not fail, and other law defects](#laws-that-could-not-fail-and-other-law-defects)
  - [The CI saga](#the-ci-saga)
  - [What motion forced into the structure](#what-motion-forced-into-the-structure)
  - [The exceptions to "no JS at interaction time"](#the-exceptions-to-no-js-at-interaction-time)
  - [Bespoke entries, member by member](#bespoke-entries-member-by-member)
  - [What it cost](#what-it-cost)
- [Open at removal](#open-at-removal)
  - [Design questions](#design-questions)
  - [Mechanisms and defects left standing](#mechanisms-and-defects-left-standing)
  - [Instruments and laws](#instruments-and-laws)
  - [Docs](#docs)
  - [Stale or conflicting text at 39f3884](#stale-or-conflicting-text-at-39f3884)
- [Appendices](#appendices)
  - [A. DECISIONS.md passages moved out](#a-decisionsmd-passages-moved-out)
  - [B. CLAUDE.md paragraphs moved out](#b-claudemd-paragraphs-moved-out)
  - [C. The docs site's Motion chapter as it stood](#c-the-docs-sites-motion-chapter-as-it-stood)
  - [D. LOG.md entries about motion](#d-logmd-entries-about-motion)
  - [E. Laws deleted](#e-laws-deleted)

## The system, by layer

Paths are repo-relative, or relative to `packages/ui/src/` when they start with `system/`, `tokens/`, `components/` or `test/`. Line numbers are `@39f3884`.

### Chronology

What shipped, was found or was reversed, by date. Each layer below tells the full story; the entry named here is where the LOG tells it.

- **2026-07-31.** The first review listed motion as a gap: "One interaction transition exists; overlay enter/exit … has no duration/easing tokens or reduced-motion mapping." (REVIEW.md:85)
- **2026-08-02.** Motion was "deferred to its own discussion without gating — Button ships on §8's single canonical transition." Rejected the same day: "a third motion duration nobody has ever justified." The first Spinner was one element, a border-top arc on one rotate keyframe. (LOG 2026-08-02 "The pre-Button states close, and loading refuses to eat the label")
- **2026-08-03.** Button shipped with one 120ms eased transition for every state change. On a real iPhone the button read as dead: a tap lasts ~60ms, so an eased press never reached its colour. The first fix was an instant press (`transition-duration: 0s` on `:active`) with an eased release. **Superseded the same day by Kushagra: all transitions were removed** until a motion system existed, the tokens stayed wired but unread, and a law asserted that the recipe layer named no `transition`. The finding was handed forward as a constraint: *whatever motion lands, press stays instant.* The Spinner's arc was rejected by eye the same day and became twelve SVG spokes on `steps(12)`. (LOG 2026-08-03 "Button meets a real phone, and three settled answers reverse"; DECISIONS §8 "History" and "Loading")
- **2026-08-06.** An external audit moved the Spinner's rotation off the `<svg>` root, whose transform "is not reliably composited", onto an HTML `<span>`. (LOG 2026-08-06 "The spinner gains a wrapper: composited rotation outranks one element")
- **2026-08-08.** Progress shipped with its indeterminate sweep, on the argument that a sweeping segment is motion that IS the content, outside the zero-transition law. (LOG 2026-08-08 "Progress ships without a size axis — the ladder was asked first and refused")
- **2026-08-09.** The grammar was chosen on a throwaway scratch page holding one switch and one button built both ways; Kushagra on the switch: "no competition." Sixteen principles were written down. The same day motion reached the control layer — Button, checkbox, radio, switch, fields and the shared skeleton — for **+506 bytes gzipped**, with three same-day corrections from Kushagra's eye: the button's hover rise, the switch losing the mark squash, and the switch thumb's lean going from 3px to 6px and moving to the root's `:active`. The browser harness became still by default. Menu shipped "motion instant" and became the first floating consumer the same day, judged in a throwaway route (`apps/docs/app/motion-lab`): the exit became a dissolve, the fall led, `translate` carried the seed, the seed was a designed circle (the anchor's height arrived asynchronously), the width floor stood down during the flight, the measurement window was pinned against animating backwards, boxes were read at subpixel precision, and `.kui-floating-body` was added — **+887 bytes gzipped** (21,684 → 22,571). DECISIONS §8 still listed "the floating family's exit (Menu's is open)" as deferred at `39f3884`, though it was chosen that day. (LOG 2026-08-09 "Motion's grammar is chosen: physics, not clips — judged on a switch and a button"; LOG 2026-08-09 "Motion reaches the control layer, and the press keeps its 2026-08-03 finding by splitting it"; LOG 2026-08-09 "Menu ships on the row family, and a floating pane casts in every world"; LOG 2026-08-09 "Motion ships, on Menu alone — and the exit is a dissolve, not the entry reversed")
- **2026-08-10.** The fields' turn. Field and checkbox were found to have no hover state at all, and a boundary hover was added (deleted 2026-08-17). The field ring's arrival was built and refused on sight ("it grows in steps, like so jaggedy"). The pass found that `prefers-reduced-motion` had never suppressed the focus ring; the harness learned `asksForStillness()` and pointer parking. The slider grip learned to squash on `data-dragging`, and the per-file reduced-motion doctrine was written. The select trigger took the button's press, and an open trigger started holding it. The entry was promoted from Menu to the floating family when Select joined, with five defects found on the way (role, the stamp borrowed from React, specificity, dead pointer region, once per node). The body was pinned to the non-growing edge, which exposed the inset-against-padding jump. A mid-flight collision flip was found: DECISIONS §22 recorded it OPEN with a `clip-path` candidate, the positioner pin closed it (the 2026-08-22 audit confirmed `data-align` read `end` in all 40 frames), and the §22 open note was never amended. The seed became the trigger's own box (the morph), the release became clock-driven, the open trigger held its press, `pointer-events: none` for the whole flight was built and reversed within the hour, an opacity-0 overlap window was added (later reversed by the opaque silhouette), and the seed stopped casting. (LOG 2026-08-10 "Hover reaches the boundary, the field's ring stays instant because the engine says so, and reduced motion turns out never to have worked"; LOG 2026-08-10 "The grip squashes when held, and finding its key re-measured the suppression the whole layer trusted"; LOG 2026-08-10 "The entry becomes the family's, and the second member finds the bugs the first could not"; LOG 2026-08-10 "Why a menu that opens left looks worse than one that opens down — two answers, one fixed and one recorded open"; LOG 2026-08-10 "The seed becomes the trigger itself — the morph, unblocked by the machinery built for a different bug")
- **2026-08-11.** Commit `6af4bb8` ("feat: motion for every family, the floating morph, and Dialog — the 2026-08-09..11 batch") carried every control value that never changed afterwards. The held press was found to compress an opening panel's width at release, 402 → 392; `heldAnchorWidth` fixed it. (LOG 2026-08-11 "The panel compressed at release, because the two width floors measured different triggers")
- **2026-08-14.** The counter-squish was found reading `var(--floating-rise)`, a token that never existed, and the dangling-var law followed. The unfurl was judged out ("I want the body to form, to be created, not to be ported"), and three forming recipes were built in the lab: a 0.96 condensation, a deep scale from 0.4 to 1 with a droplet corner, and a `clip-path` inset morph on the lively spring (overshoot −7%). Kushagra's iOS frames "settled the direction". (LOG 2026-08-14 "The entry stops being ported and starts being formed — judged against iOS's own frames")
- **2026-08-15.** The clip morph was rejected ("OMG this is so bad") and the circle returned (40 → 72 → 56). A quadrant growth centre, a hold-then-unfurl beat, a "fluid spring" (ζ0.92/ω5.8), a three-stage choreography and a covering placement were all judged out. **The silhouette locked** (Kushagra: "make the circle shape of trigger exactly, and make it start from where the trigger is, thats all, no h/4 w/4."). The body became the held unit, `revealDelay` went to 280, and the dialog's first materialization was cut. (LOG 2026-08-15 "The circle comes back — the day of forming recipes ends where the emergence began"; LOG 2026-08-15 "The silhouette locks — the entry answers where the panel came from, and every intermediate is retired"; LOG 2026-08-15 "The dialog materializes — the floating principles cross a family boundary without their animation")
- **2026-08-16.** The springs got their first laws — "the one thing in the motion system with no law until 2026-08-16" (tokens.test.ts:2185). `elastic` and `poised` were minted. The materialization was tuned into the family; Alert dialog and Dialog split, and AlertDialog shipped with the materialization. A quick reopen was found to have no birth and was made to replay the entry (reversed 2026-08-20); flight retirement; the dismissal listener armed at departure. The two entry runners became one after a six-dimension audit (22 confirmed findings, CLAUDE.md); `box-shadow` joined the exit's restated channels, a law derived the exit's list from the entry's, and the reduced-motion guard stopped maintaining an inverse of every pose. Dialog's depth entry locked. The lab bench's clocks were ported (commit `d18ffae`), and the provisional aim was added. (LOG 2026-08-16 "The materialization is tuned into the family — one curve, two speeds, and an exit that keeps becoming"; LOG 2026-08-16 "Alert dialog and dialog split — the materialization is the alert's gesture, and the difference must be built"; LOG 2026-08-16 "A quick reopen has no birth — the popup Base UI hands back, and the flight it interrupts"; LOG 2026-08-16 "AlertDialog ships, and the materialization moves home"; LOG 2026-08-16 "The dialog's entry locks on depth, and the audit before it collapsed two runners into one")
- **2026-08-17.** Card-as-button got the control layer's motion at its own distances (+74 bytes). The boundary hover died with the fill-first flip. A submenu started flying from the seam. Select became item-aligned: `placedByContent`, the borrowed inline height, the pose keyed on `data-unfurling`; a curtain was built, law-tested and rejected on sight. The select entry was found scrolling its own panel (57px), and, once clipped, the page (65px); `clip` plus a page hold shut both. Menu adopted ScrollArea and the flight learned to stretch it. The harness gained `until()`. (LOG 2026-08-17 "The one component with a full state machine and no motion was the card you can press"; DECISIONS §8 "Hover is one step, in one currency — the boundary rule is DELETED"; LOG 2026-08-17 "A submenu flies from the seam, because a silhouette is only honest when the panel lands on its trigger"; LOG 2026-08-17 "A select's panel is placed by what is inside it, so it is placed before it is posed"; LOG 2026-08-17 "A select's entry was moving the page, and shutting one door moved the symptom to the other"; LOG 2026-08-17 "ScrollArea ships as one export, Menu scrolls its list instead of its panel, Select waits on a measurement")
- **2026-08-18.** Tabs and SegmentedControl shipped. Tabs' indicator shipped drawn by two edges; the segmented control shipped with no indicator element. Base UI went from 1.6 to 1.7. (LOG 2026-08-18 "Tabs and the segmented control: two objects that look alike, and the role is what separates them")
- **2026-08-19.** The tab rule went back to `left` + `width` after measuring zero width on an overflowing bar. Base UI 1.7 was kept and `data-instant="click"` exempted, so the keyboard kept the entry flight. (LOG 2026-08-19 "The tab rule goes back to left + width, and the audit that made it necessary"; LOG 2026-08-19 "Base UI 1.7 stays, and the keyboard keeps the entry flight")
- **2026-08-20.** A reopen mid-dissolve became CAUGHT instead of replayed. `sweep`, `catchDissolve` and `seizeFlight` seized animation clocks, and the ring law moved to a paused, stepped sweep. With CI still red on a different law each round, Kushagra: *"lets remove the core cause, dont test animations on ci machine"* — `watchesFrames` took five frame-watching laws off CI. `pnpm run ci` was also found unable to launch a browser at all. (LOG 2026-08-20 "A dismissal taken back is CAUGHT, not replayed — the quick reopen reversed"; LOG 2026-08-20 "The three flakiest laws in the suite were three different lies about time, and one was measuring an animation it could not see"; LOG 2026-08-20 "The rotation's last four laws were each a window the machine could outrun — and a window is held open, not raced"; LOG 2026-08-20 "A flight is seized by its clocks — except where its subject is a wall-time loop"; LOG 2026-08-20 "Stillness is not arrival — and a borrowed clock has to be given back"; LOG 2026-08-20 "A law that must catch a MOMENT does not run where the clock is not ours"; LOG 2026-08-20 "A check that cannot run is a check that cannot fail — `turbo` and the browser laws")
- **2026-08-21.** The dialog's narrow-window sheet arm shipped with its motion stood down. A node law began forbidding the read of a gesture's effect on the next line. (LOG 2026-08-21 "The sheet's ring was cut, and it had borrowed the wrong motion"; LOG 2026-08-21 "A driver gesture resolving is not the browser having settled"; LOG 2026-08-21 "The shape is forbidden by a law now, because fixing it one law at a time did not work"; LOG 2026-08-21 "Main went red on two laws that raced a window, one day after the rule against it")
- **2026-08-22.** `holdPress` (a raw CDP `mousePressed`) made `:active` producible in tests (test/browser.tsx:418-442). The floating-motion audit ran — 33 agents, 102 findings, 96 surviving, 13 critical, all suites green at 199/200 — and its repairs shipped (see [The audits](#the-audits)). Later the same day the placement's scroll offset was carried as layout during the flight and the positioner was restored before the panel. The motion bench was added to `/preview`. The root cause of the green suites was named: *"Both Select fixtures used eight options"*. (LOG 2026-08-22 "A sabotage that survives is evidence about the LAW, not only about the code"; LOG 2026-08-22 "The flight borrows a style, it does not enumerate one — and three other things the suite could not see"; LOG 2026-08-22 "— an item-aligned panel's scroll offset IS its placement, so the flight keeps it"; LOG 2026-08-22 "— the placement is carried as LAYOUT while the panel is in the air"; LOG 2026-08-22 "— the parent is put back before the panel is"; docs/handovers/2026-08-22-floating-motion-audit.md)
- **2026-08-23.** The travelling highlight shipped on Tabs and SegmentedControl (320ms / 480ms, calm). Same day: the grip painted over its own label, a tab touched its hairline, and the chosen segment's hover wash sat on top of the travelling grip; all three were fixed. `elastic` moved to ζ 0.715 and the floating and overlay clocks were cut to 0.75× on the motion bench (commit `25464a4`). The body's stretch clock moved from `--motion-rise` to `--floating-corner` (*"it works, but it doesnt work proportionally to how content animates"*). `fitToRoom` and its `heldHeight` guard; the body origin inherits the panel's table; aim-gate and hit-test laws; RTL physical-side arms; the page hold recorded as never firing; the lens built from the flight's target box. Popover and Tooltip shipped. (LOG 2026-08-23 "The traveling highlight: one object that stretches toward where it is going"; LOG 2026-08-23 "The grip painted over its own label, and a tab ended on the line it stands on"; LOG 2026-08-23 "A re-key that moved a colour and left its rule behind"; LOG 2026-08-23 "The panel's content was stretching on the control layer's clock"; LOG 2026-08-23 "The panel measures itself before the browser has told it how much room it has"; LOG 2026-08-23 "The room clamp is only the panel's cap where the panel sits on one side of its trigger"; LOG 2026-08-23 "The flying body pivoted on one edge and was pinned to another"; LOG 2026-08-23 "Two mechanisms that could be deleted with the suite green now have laws"; LOG 2026-08-23 "A right-to-left menu opened on the far edge and flew backwards onto its trigger"; LOG 2026-08-23 "The page-hold in the select entry has never fired"; LOG 2026-08-23 "The lens was drawn in the corner of the pane, and it arrived after the panel did")
- **2026-08-25.** The segmented channel and the tab bar got walls: an overshoot into an end seat became a squash (+42 bytes for the segmented control; CLAUDE.md records "+57 bytes across both"). The placement's anchor became the trigger's resting box (the last 2px), the body took a sink, the pin was fitted to the room with a departure wait and a glue observer, and the catch reset the popup's own scroll viewport. Found on the way: *"the docs dev server serves `dist`"*, so source edits were invisible until a rebuild. (LOG 2026-08-25 "The channel has walls — the segmented thumb's overshoot becomes a squash"; LOG 2026-08-25 "The placement's anchor is the trigger's RESTING box, and the last 2px of the release jump goes"; LOG 2026-08-25 "The flight's body takes a SINK, and the rows the flight reveals become the rows the panel rests on"; LOG 2026-08-25 "The flight's pin is corrected to the room, and a constrained top-opening menu stops jumping at release"; LOG 2026-08-25 "The catch keeps the box's flight, not the list's browsing")
- **2026-08-26.** An audit guarded the switch lean on `:not([data-disabled])`, made the reduced-motion coverage law check each rule, and made the segmented thumb watch every seat (switch.css:153-173; recipes.test.ts:1764-1776; segmented-control.tsx:218-233). The flying body's pin became a per-axis pair, `printBlur` was promoted to one token (LOG 2026-08-26 "The audit's shared layer: three reversals, one promotion, and a role set that grew a twin"), the floating direction context defaulted to `direction: null` (unmeasured), and a dead release arm was removed. The settling law was widened, and `test/cascade.test.ts` began comparing the harness's stylesheet order with `styles/index.css`.
- **2026-08-29.** A centred body was pinned by its own centre, `data-instant="focus"` was exempted, `SIDE_OFFSET` got one home, and Popover took `useRestingAnchor`. (LOG 2026-08-29 "A centred body cannot be centred by auto margins, and every entry in the family was sliding its content"; LOG 2026-08-29 "`data-instant="focus"` is an input class, and the family had exempted only two of three"; LOG 2026-08-29 "The floating family's trigger gap had four homes, each commented as if it had one")
- **2026-08-31.** Accordion (panel travel, chevron turn) and Toggle shipped (DECISIONS §37, §34). The tooltip's entry became a lift; the popover's seed became a circle on the alert's clocks; a centred pane was pinned by its middle; `--floating-paint` was minted. The glass-and-motion performance assessment left the floating family as it was (its findings 5 and 6 were assessed and left), found the panel seam, and moved the progress sweep from `inset-inline-start` to `translate`. (LOG 2026-08-31 "A tooltip's entry is a lift, not a silhouette — the bench's "Physics" tooltip, built on the family's own channels"; LOG 2026-08-31 "A popover's seed is a circle on its trigger — the alert's grammar at the floating family's origin"; LOG 2026-08-31 "A centred panel is held by its middle, or the fall clock carries a distance it was never given"; docs/handovers/2026-08-31-glass-motion-perf.md)
- **2026-09-01.** An ultracode audit raised the shared press rule to (0,4,0) and found the accordion's underline transition replacing the skeleton's whole list. The segmented thumb learned to divide out an ancestor's scale — measured inside an overlay's entry as "the same numbers times 0.95, the entry's own scale". Attachment shipped with Progress's sweep (DECISIONS §43). (LOG 2026-09-01 "An ultracode audit of the five new components, and every fix it earned"; LOG 2026-09-01 "A box mid-flight is not its own size — the segmented thumb measured through an ancestor's scale")
- **2026-09-02.** Button's `done` state shipped as a glyph swap with a travelling width (+204 bytes). ContextMenu shipped flying from the point — a first pose "breathing from 0.92" was rejected by eye and the seed became zero-sized — and its audit fixed three entry cases the flight had never met. (DECISIONS §41, §42; LOG 2026-09-02 "The done state is a swap, not a draw — and the tick had three homes"; LOG 2026-09-02 "A context menu is a menu, so it ships three exports — and it flies from the point"; LOG 2026-09-02 "The ContextMenu audit — three cases the flight had never met, and five laws that could not fail")
- **2026-09-05.** Command's results pane opened out of the search bar without a runner; `useStatedFlight` told the lens where the pane was going; the dialog body's filter was stood down over glass; the list ↔ empty change reused the done swap's blur and clock. (DECISIONS §44; command.css:530-583; LOG 2026-09-05 "The results pane opens out of the search bar, and the empty state is what it shows"; LOG 2026-09-05 "The glass got thicker in a jump, and the fix is telling the lens where the pane is going")
- **2026-09-06.** The Shell drawer shipped: a slide, the frame receding under it, a well, a plane and a parked scrim, on the new `driven` spring (which needed the critical closed form in the generator). The slide shipped dead (the comma defect) and the frame's clip cut the drawer (clipping happens before the transform). The Page's collapsing title became the seventh bounded exception to "no JS at interaction time" (DECISIONS §46). Command's rows stopped drawing a ring on the way out. (LOG 2026-09-06 "A drawer slides, the frame recedes under it, and the slide shipped dead"; LOG 2026-09-06 "Tab walked into the search results, and the ring was never the thing to remove")
- **2026-09-08 / 2026-09-09.** A side pane began pushing the frame instead of receding it; `carried` replaced `driven`, the drawer clock went 420 → 500, and the scrim dimmed without blurring. The sections date the spring change differently: the controls section, reading config, dates `carried` 2026-09-08 (config.ts:866-874); the floating section and the LOG entry date the replacement 2026-09-09. The shell rail's narrow-window tab bar got a third travelling grip. (LOG 2026-09-09 "A side drawer pushes the frame; only a sheet from below recedes it"; LOG 2026-09-09 "A rail meets a narrow window as a tab bar")
- **2026-09-10.** The ring-landing law measured 96 sub-pixel stations on Chromium 141 and was restated. CI reached every stage for the first time in weeks and then failed on the machine; seven repairs followed, among them reading the release deadline where the runner reads it and calibrating the stall throttle (`KUI_STALL` 4 was below the fault's threshold; 8 reproduced it). (LOG 2026-09-10 "Three repairs that survived a collision, and the check that found the other five"; LOG 2026-09-10 "The runner's clock was an input to the verdict, seven times over")
- **2026-09-11.** The bottom pane pushed the frame too, and nothing receded after that. (DECISIONS §27)
- **2026-09-12.** Sheet shipped on Base UI's Drawer. Combobox's seed became a line at the field's bottom edge, and the flight learned to follow its content. The recession CSS and `shellDrawer.scale` were deleted (commit `10b85ae`). The transition laws began splitting a list at top-level commas. (DECISIONS §49, §50; LOG 2026-09-12 "The flight follows its content, and the seed stops covering the field"; recipes.test.ts:1572-1590)
- **2026-09-14.** `motionSpeed = 0.6`: every emitted duration became 0.6 of its judged value. Kushagra: *"whatever animates, lets make it all much faster, like keep animation as is, but make them faster"*. Popover took Dialog's depth entry. (LOG 2026-09-14 "Motion runs at 0.6 of its judged clocks; the popover takes the dialog's entry")
- **2026-09-17.** MessageScroller's jump button was re-placed by layout because its `translate` lift fought the Button's own hover and press (message-scroller.css:30-37).
- **2026-09-18.** Carousel shipped with smooth `scrollBy` (reduced motion → `auto`) (carousel.tsx:197-203).
- **2026-09-19.** MessageScroller's fade moved from the button to its dock (DECISIONS §56; [Appendix A](#a-decisionsmd-passages-moved-out)).
- **2026-09-20.** Kushagra: *"Lets run an ultracode agent to remove all motion from kookie ui v2. Motion needs to be done properly, what we have is not proper. We can keep a record of it somewhere, in a markdown, but lets go back to instant changes."*

### Principles and grammar

#### Clips versus physics (2026-08-09)

The deciding distinction: "the web animates with clips, Apple animates with physics." A clip has a
duration and a curve; time is the input and the animation is a performance that plays. A spring is
attached to the object — position, velocity, target — so a state change moves the target and the
spring chases it, and interruption "is not a feature but what falls out when nothing is ever
'playing'." Motion.dev was judged to have springs but a culture attached to appearing; GSAP was
called "the clip grammar perfected" and also a runtime dependency against the no-JS-at-interaction
rule. (LOG 2026-08-09 "Motion's grammar is chosen…")

**The mechanism cost zero runtime: real spring curves were baked into CSS `linear()`** — designed
physics in config, emitted as values, the colour generator's shape. The honest limit was recorded
with it: **CSS retargets a transition from the current position but not the current velocity.** The
spring curves start steep, so a reversal still read alive ("ease-in-out starts slow, which is exactly
why interrupting the web default feels mushy"). True velocity (a thrown sheet) was said to need ~50
lines of JS, "owed only by gestures, decided the day a draggable component exists". (same entry)

The scratch demo's three curves were "settle ~500ms/6.8% overshoot, ~650ms/16%, stiff ~140ms". The
16% "bouncy curve that exists in the lab is the rejected comparison and is deliberately not emitted."
(same entry; DECISIONS §8)

#### The sixteen principles

Quoted in substance from LOG 2026-08-09 "Motion's grammar is chosen…", in the order they were learned:

1. **Motion tells the truth about space.** Things come from somewhere: a menu grows from its trigger,
   a sheet from its edge. Travel carries information.
2. **Motion follows travel.** The switch was the benchmark because its thumb goes somewhere. A control
   that travels nowhere earns almost nothing. The bouncy scale-from-centre button ("Pop") was rejected
   as "a performance in a spring costume: travel in no direction, at nobody".
3. **Never animate toward the finger; press is never eased.** The demo's best button sank "on a stiff
   ~140ms spring that is 80% deep by 60ms — it beats a real tap". Colour stayed instant. This refined,
   not reversed, the press-stays-instant law: "its true statement is 'instant signal, stiff-spring
   travel.' Only the return — the object's act — is expressive."
4. **Deformation leans toward the destination, and stretch shares the travel's own properties.** The
   switch thumb is drawn by two edges and only the edges animate; pressed, the far edge leans toward
   the destination (the first cut used `scale` from a flipping origin and "read as collapse-then-move").
   Released, un-stretch and travel are the same two properties, so they cannot sequence. "iOS's own trick."
5. **Two clocks: colour is signal, geometry is physics.** The track's colour settled (~180ms ease-out)
   faster than the thumb arrived (~500ms spring, visually settled ~250ms). "One clock for everything
   is the clip tell."
6. **An object exists all the time, not just during the click.** The button reached the switch's
   league only with mass at every moment: hover lifts 1px ("life before touch — iPadOS's pointer
   idea"), press sinks and squashes, release pops past rest and settles. "A held control is *held*."
7. **Leaving is faster than arriving, and exits don't bounce.** Enter timing lives on the open state's
   transition and exit timing on the closed state's, so CSS itself enforces the asymmetry. And **the exit is not the entry reversed**: *"an entry answers 'where did this come from' and an exit answers nothing"* (LOG 2026-08-09 "Motion ships, on Menu alone").
8. **Motion that IS content stays its own category** — Spinner and indeterminate Progress (slowed,
   never stopped), untouched by the system.
9. **Damping is one value everywhere; travel is the only amplitude dial.** Short-travel controls
   looked dead, so their curves were loosened (~27% overshoot) and read "mechanical, 'just spring'".
   The tell is ringing: those curves crossed rest two or three visible times; the switch's crossed
   ONCE, "blooms, and comes home on a long soft tail, second ripple under 1%". "When an overshoot is
   invisible, the fix is more travel or a channel that can show one pass — never less damping."
10. **Fluidity is parts arriving at different times; one transform is a rigid body.** The switch's
    fluidity came from two edges animating different distances. The floating entry applied it as four channels on one spring with four durations.
11. **Nothing appears; things become.** The judged demo morph read as *"the button morphs into the overlay"*; Kushagra: *"I think its perfect"*. The open height is measured from content, never authored. (See [The floating family and its runner](#the-floating-family-and-its-runner).)
12. **Depth is contact; paint is state.** No platform expresses a persistent state as a held
    depression. A toggle presses like any key and returns to the same rest as its siblings, "rising
    already wearing its ON fill". The rule caught a held-sunken menu trigger in the demo, reverted
    "to engagement as paint at normal depth". (Note: on 2026-08-10 the shipped open trigger was made
    to HOLD the press after all — see [Button](#button). The toggle kept principle 12 — see [Toggle and ToggleGroup](#toggle-and-togglegroup).)
13. **Velocity handoff is real, small, and only gestures need it** — built and judged in the demo on a
    draggable sheet ("the boss"): a fling past ~900px/s wins regardless of position, below that the
    halfway line decides; semi-implicit Euler at display rate. Never built in the package.
14. **A presented object arrives with velocity and no bounce; only the user's own momentum may make
    something bounce.** (Became `driven`/`carried`; see [The seven springs](#the-seven-springs).)
15. **Overdrag deforms from the planted anchor; it never displaces.** (Demo only.)
16. **The travelling highlight is the switch's edge trick between siblings.** Direction decides which
    edge leads on a faster spring; pressing an unselected destination leans toward it; boundaries are
    safe because "a lean always points inward"; the selected segment is grabbable; keyboard selection
    jumps ("keys are not travel"). Only the first part shipped (see [The travelling highlight](#the-travelling-highlight)).

Rejected that day: GSAP; motion.dev's grammar; "an interim duration/easing token palette (tokens the
timeline, not the physics — the token set, when it comes, is spring parameters per weight class)";
scale-from-centre press feedback; "animating the press with an ordinary ease (re-litigating the
2026-08-03 phone finding)"; low-damping curves as the fix for invisible bounce; a held-sunken menu
trigger. Left open: "how motion's shadow half meets `surfaces='flat' | 'elevated'`" — the demo
button's press compressed its shadow and hover grew it. (same entry)

#### What the panel families added

The floating, overlay and drawer work added principles of its own, written down in LOG 2026-08-09 ("Motion ships, on Menu alone"), DECISIONS §8, §22 and §24, and LOG 2026-08-16. The ones that shaped the panels, beyond principles 1, 5, 7, 10, 11 and 14 above:

- **The axis that finishes last is the one the eye reads as the direction of travel** (LOG 2026-08-09 "Motion ships, on Menu alone"). So the vertical led and the width trailed.
- **A silhouette is honest only where the panel lands on the thing it came out of** (2026-08-17). A menu hangs off its button; a select straddles its field. A submenu does not, and neither does a tooltip, a popover's form, or a combobox's field you are still typing in.
- **Mass principles for overlays** (LOG 2026-08-16 "Alert dialog and dialog split"): *"mass lowers frequency (clocks stretch), mass forbids overshoot (damping rises toward critical…), mass shortens travel (until at the limit the motion transfers to the environment: the scrim IS the arrival…), and mass softens onset"*.
- **Ownership decides what content may do** (DECISIONS §24, §25). An alert's content is system-owned, so it may be held molten and printed. A dialog's content is the consumer's, so only blur (*"the one channel that presumes nothing about arrangement"*) was allowed.
- **One family, one entry** (2026-08-17, Select's curtain rejected). What varied between members was where the flight landed, not what it did.
- **Opening a panel is already script** (LOG 2026-08-09). The destination measurement ran once per open — see the next subsection but one.

#### The rules as DECISIONS §8 stated them at 39f3884

The verbatim text is in [Appendix A](#a-decisionsmd-passages-moved-out). A digest:

DECISIONS §8 "Motion: physics, not clips — and it is spent where it was designed (decided 2026-08-03;
the system landed 2026-08-09, Kushagra)". At 39f3884 the subsection was split in two: its later
paragraphs ("What moves is a panel arriving…", "Two clocks…", "Damping is sacred…", "No duration is
ever typed in…", "Suppression is total…", "History…", the touch behaviours, and the floating entry)
sat under the next heading, "Hover is one step, in one currency — the boundary rule is DELETED
(2026-08-10 → 2026-08-17)", which had been inserted into the middle of it.

- **The press keeps its colour instant.** "Paint is one clock and geometry is another, so a tap lands
  its colour on the first frame while its travel rides a spring underneath. `--kui-ct-paint` is that
  clock, one variable every control reads, and a press sets it to zero."
- **One speed multiplier** (2026-09-14): the numbers are "the judged RATIOS and the rendered durations
  are 0.6 of them. The springs are baked per transition and normalised to their own duration, so a
  shorter clock keeps its curve. The loops … do not read it. Laws that name a duration read the token,
  never a literal."
- **Hover is asymmetric.** 80ms in, 220ms out. "A symmetric hover reads as a lamp on a switch; this
  reads as a surface warming under the pointer and cooling after it — … arriving is something the
  user did and leaving is something they stopped doing."
- **Each family says how far it moves; nobody says how long.** A button SINKS (down and smaller:
  "only-down reads as sliding, only-smaller as receding"), an interactive surface sinks by its own
  distances, a mark SQUASHES ("it has no depth to sink into"), a field does nothing ("the one control
  the eye rests *inside*", measured under a real pointer). The select trigger is "a button in field
  dress" and takes the button's rise and press. The slider grip: "distortion on the hold, physics on
  the travel never." A control whose popup is open holds the hover step and HOLDS THE PRESS.
- **Glyphs are drawn, not switched on.** The tick draws along its stroke, the radio dot arrives; both
  IN and never OUT.
- **The switch thumb is drawn by both its edges** — "the one structural change motion forced".
- **The ring ARRIVES, and the direction it arrives from says what happened.** After a Tab the eye
  must find focus; after a click it knows, so the motion would be decoration. `:focus-visible` draws
  the line, except on text-entry elements.
- **A field's ring is instant, and the reason is the mechanism.** Chrome resolved `outline-offset` to
  whole CSS pixels (see [The field family (TextField, TextArea)](#the-field-family-textfield-textarea)). Amended 2026-09-10: on Chromium 141 the premise no longer held; "The refusal
  stands until it is re-judged on a real screen."
- **Which arrival a control gets is a hook, `--kui-ct-ring`,** so reduced motion stands down the
  recipe rather than the rules that read it.
- **Two clocks, and they are different kinds of thing.** Colour and opacity are signals: they ease and
  are short. Geometry is physics: it rides `--motion-spring`, or `--motion-spring-stiff` where nothing
  may overshoot. "Mixing them is what makes a system read as a slideshow."
- **Damping is sacred.** Curves cross their target at most once; a movement that needs to be more
  visible gets more travel, never less damping. (The text at 39f3884 still said "Both shipped curves",
  written when there were two.)
- **No duration is ever typed in.** Every channel of every transition must resolve to a motion token,
  with `var()` stripped first "so that a hand-typed `150ms` cannot hide behind an easing that happens
  to be one." This replaced the earlier zero-transition law that named the one sheet allowed to move.
- **Suppression is total** — "A suppression that leaves one channel moving is worse than none: the user
  who asked for stillness gets it in pieces." (The history of why this was false for six days: [Reduced motion in the control layer](#reduced-motion-in-the-control-layer).)
- **History, because it constrains the future system**: the interim 120ms transition, the phone
  failure, "whatever motion lands, press stays instant."
- **Two touch behaviours are not motion and remained shipped**: every `:hover` rule under
  `@media (hover: hover)` (touch synthesises hover on tap and holds it; `:active` never guarded — "on
  touch it is the only feedback there is"); `touch-action: manipulation` and a transparent
  `-webkit-tap-highlight-color`. And: **iOS Safari arms `:active` only while a touch listener is
  registered somewhere on the page** — every hydrated React app has one, but a JS-free page must add
  `document.addEventListener("touchstart", () => {}, { passive: true })` or the press never fires.
- **What was still deferred (2026-08-10):** the floating exit (answered later: dissolve), "the button's
  shadow crossfade (blocked on the flat/elevated ruling: a cast that does not exist has nothing to
  step)", the slider's keyboard-step and track-tap easing, and "every v0 number here".

#### "No JS at interaction time" and its bounded exceptions

ENGINEERING §1.5 at 39f3884: "CSS does everything CSS can. JS resolves props to attributes and vars
once at render. Hover, press, focus, responsive, theming are stylesheet work. Interaction-time JS is
~zero and that is checkable." Motion pushed against this rule several times; each crossing was named
as a numbered, bounded exception (DECISIONS §26, §27, §46):

1. The floating layer's flight measurement (§22).
2. The lens (§10).
3. Tabs' indicator re-measure (Base UI's, on selection change) — 2026-08-18.
4. The segmented thumb's measurement (`useTravelingThumb`) — 2026-08-23.
5. The submenu panel seam (`panelSeam`) — found by a performance pass 2026-08-31.
6. The shell's resize drag — it "claimed the fifth for a day, which the panel seam already held —
   the doctrine had two fifths" (DECISIONS §27).
7. The Page's collapsing title (an IntersectionObserver writing one attribute) — 2026-09-06.

Each was "bounded the same way": run on mount, resize and state change, never on hover, press, focus
or scroll, and write values rather than drive a frame loop. A law in `recipes.test.ts` ("no component
source attaches an interaction-time handler (ENGINEERING §1.5)") banned `getComputedStyle` and
`getBoundingClientRect` in component source with a named exemption each (DECISIONS §26, 2026-08-31).

The first of these was motion's own. The floating family's destination measurement ran once per open; it was the first sanctioned exception to "no JS at interaction time", which guarded hover, press and focus, and it was bounded to open, never hover, press, focus or scroll. The flight measurement had one home (`system/floating.tsx`), which ENGINEERING §1.5's exception named (LOG 2026-08-09 "Motion ships, on Menu alone"). The law that enforced the doctrine, and what it could not see, is in [The harness and the laws](#the-harness-and-the-laws); which of the seven existed only for motion is in [What went wrong](#what-went-wrong).

### The numbers

#### Where the numbers lived

| What | Where |
|---|---|
| Global speed multiplier | `tokens/config.ts:780` (`motionSpeed = 0.6`) |
| Signal clock | `config.ts:782` (`motion = { duration: "120ms", easing: "cubic-bezier(0.22, 1, 0.36, 1)" }`) |
| Spring models | `config.ts:813-876` (`springs`: calm, lively, stiff, poised, elastic, driven, carried) |
| Control clocks and distances | `config.ts:911-1023` (`controlMotion`) |
| Focus ring geometry | `config.ts:760` (`focusRing = { width: 2, offset: 2 }`) |
| Panel families | `config.ts`: `floatingSeed` :1035, `floatingEcho` :1040, `floatingMotion` :1042, `overlaySeed` :1100, `overlayLift` :1109, `overlayEcho` :1115, `dialogMotion` :1129, `dialogEntry` :1145, `printBlur` :1162, `overlayMotion` :1164, `floatingMinWidth` :1614, `tooltipMotion` :1657, `tooltipEntry` :1674, `scrim` :1700, `shellDrawer` :1891 (its `duration` :1901) |
| Duration helper, zoom helper | `tokens/generate.ts:120` (`ms`), `generate.ts:126` (`zoom`) |
| Spring model and sampler | `generate.ts:128-183` (the model's docblock from :128, `springAt` :153, `springCurve` :164) |
| Emission of the motion tokens | `generate.ts:356-428` |
| Emitted tokens | `tokens/tokens.css:200-265` |

The two sections gave slightly different ranges for the sampler (`153-183`, `128-161` and `143–182`) and the emission (`356-393` and `355–428`); the ranges above were read off the file at `39f3884`.

#### `motionSpeed` and `ms()`

```ts
// config.ts:780 @39f3884
export const motionSpeed = 0.6;
// generate.ts:120 @39f3884
const ms = (n: number) => `${Math.round(n * motionSpeed)}ms`;
```

Added 2026-09-14. Kushagra: *"whatever animates, lets make it all much faster, like keep animation as
is, but make them faster"*. Rejected: "editing each clock (thirty-three numbers, each already judged as
a ratio to the others, and the next retune would be thirty-three edits again) and scaling the spring
models (the curves are normalised to their transitions, so the shape was never the slow part)." "The
JS runners already read their deadlines from computed styles, so nothing in TypeScript moved." Found
on the first look: the docs site read `dist/styles.css`, so the change was invisible until the package
was rebuilt, and "seems slow still" was the stale build. Four tabs/segmented laws had pinned
`0.32s`/`0.48s` and a seize at 160ms; they were changed to read the tokens. (LOG 2026-09-14)

The loops (Spinner, Progress sweep, Attachment sweep) were not scaled; nor were their reduced-motion
durations. Distances were scaled by `--scale` through `zoom()`
(`const zoom = (px) => \`calc(${px}px * var(--scale))\``, generate.ts:126); durations deliberately
were not: "Time, so no --scale: a panel does not unfurl slower because the interface is zoomed"
(generate.ts:395-396 @39f3884).

#### The signal clock

`motion = { duration: "120ms", easing: "cubic-bezier(0.22, 1, 0.36, 1)" }` (config.ts:782). "Ease-out
because it responds immediately and settles; 120ms because hover feedback reads laggy past ~150. Both
values were designed 2026-08-03 and sat unread until the motion system landed 2026-08-09" (config.ts:771-774).
Emitted `--motion-duration: 72ms`, `--motion-easing: cubic-bezier(0.22, 1, 0.36, 1)`. The easing
carried every paint channel in the package; the duration carried only the small fades that had no
hover asymmetry (Link, Breadcrumb, Toolbar title, the shell resize line).

#### The spring model and the sampler

Config stated the physics, never samples: `zeta` (damping ratio, "the CHARACTER: how the energy
leaves") and `omega` (undamped frequency "in radians per unit of normalised progress (the SHAPE: how
much of the settle happens inside the window)"). "Wall-clock speed is the transition's own duration,
which is why one curve serves a 480ms panel and a 140ms press." `steps` was the sample count; "Stiff
needs fewer because it never overshoots — there is no fine structure to miss — and every sample is
bytes." (config.ts:787-812)

The model (generate.ts:128-161 @39f3884), step response from rest at 0 toward 1, `t` in normalised progress:

```
underdamped (ζ < 1):  x(t) = 1 − e^(−ζωt) · ( cos(ω_d t) + ((ζω − v₀) / ω_d) · sin(ω_d t) ),   ω_d = ω·√(1 − ζ²)
critical   (ζ = 1):   x(t) = 1 − e^(−ωt) · ( 1 + (ω − v₀) · t )
```

```ts
const springAt = (zeta, omega, v0, t) => {
  const decay = Math.exp(-zeta * omega * t);
  if (zeta === 1) return 1 - decay * (1 + (omega - v0) * t);
  const damped = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - decay * (Math.cos(damped * t) + ((zeta * omega - v0) / damped) * Math.sin(damped * t));
};
const springCurve = ({ zeta, omega, steps, v0 = 0 }) => {
  const trim = (n, places) => String(Number(n.toFixed(places)));
  const points = [`0`];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    points.push(`${trim(springAt(zeta, omega, v0, t), 3)} ${trim(t * 100, 2)}%`);
  }
  points.push("1 100%");
  return `linear(${points.join(", ")})`;
};
```

- **Endpoints stated, not sampled**: "`linear()` must start at 0 and end at 1, and a spring's own value
  at t=1 is merely close to 1, so sampling the last point would leave a sub-pixel step at the end of
  every transition." Values were trimmed to 3 decimals, positions to 2.
- **The critical branch (2026-09-06).** "At ζ = 1 the damped frequency `ω√(1−ζ²)` is zero and the
  expression divides by it; the critical system has its own solution, and the repeated root makes it
  a linear term rather than a sinusoid." It was "one branch, taken by ζ === 1 and by nothing else"
  (config.ts:855-857).
- **`v₀`** is "the launch — the velocity the object already has at t = 0, in units of the travel per unit
  of normalised time", written into both branches "so that a spring's character and its launch are
  independent knobs"; with v₀ = 0 both collapsed to the step-from-rest used before, "which is why no
  emitted value moved when it landed." At ζ = 1 "the curve overshoots if and only if `v0 > ω`".

#### The seven springs

Values from config.ts:813-876 @39f3884; the peak and crossing columns are read off the emitted samples
in tokens.css:207 and :227-232.

| Spring | Token | ζ | ω | v₀ | steps | Character (config's words) | Emitted curve, read off the samples | Consumers at 39f3884 |
|---|---|---|---|---|---|---|---|---|
| calm | `--motion-spring` | 0.65 | 7.7 | 0 | 36 | "Travel. ~6.8% overshoot, one crossing, a long soft tail — the calm the switch set." | crosses 1 between 38.89% (0.999) and 41.67% (1.026); peak 1.068 at 52.78%; last samples 0.999 → 0.997 → 1 | switch thumb crossing; checkbox tick draw; radio dot; done-state tick arrival; accordion panel and chevron; tab rule, segmented thumb and shell bar thumb (both edges); tooltip scale |
| lively | `--motion-spring-lively` | 0.58 | 10.835 | 0 | 36 | "A control recovering: ~10.7% overshoot, then a rebound that stops about 1% under its target — a hundredth of a pixel over the travel it actually carries, which is why this is not a ring. … It carries the hover rise and the release." | 1.004 at 25%; peak 1.107 at 36.11%; dips to 0.989 (69.44-75%); 1 from 94.44% | default geometry clock of every `.kui-control` (`--kui-ct-move-ease`) and of the interactive surface (`--kui-sf-move-ease`) |
| stiff | `--motion-spring-stiff` | 0.85 | 4.706 | 0 | 24 | "The press-down, and every EXIT: fast, weighted, decelerating, and it never overshoots. An exit that bounces is an object that did not mean to leave; an exit on `ease-in` slams, because ease-in ends at maximum velocity." | 0.749 at 50%; 0.991 at 95.83%; never above 1 | the press (control and surface); the slider grip while dragged; the ring landing; the done swap's exit scale; floating/overlay exit settles |
| poised | `--motion-spring-poised` | 0.8 | 8.75 | 0 | 36 | "The heavy plane's arrival (§24, 2026-08-16 … 'a bit faster, a little more than 2%, with slight overshoot'). Mass forbids overshoot … ζ0.8 is ~1.5% of the travel, a single crossing, a calm return." | crosses 1 near 47-50%; peak 1.015 (58.33-61.11%); 1.001 at 97.22% | dialog entry scale (depth); popover (since 2026-09-14) |
| elastic | `--motion-spring-elastic` | 0.715 | 10.835 | 0 | 36 | "The floating and alert entries — menu, select, alert dialog." ζ 0.715 since 2026-08-23 (Kushagra: *"bounce also at 0.75x"*): "~4.0% overshoot, second excursion ~0.16% — still one crossing". | peak 1.04 at 41.67%; 1 at 72.22%; minimum 0.998 | floating and overlay geometry (menu, select, command, alert) |
| driven | `--motion-spring-driven` | 1 | 9 | 1.5 | 36 | "LAUNCHED, AND IT NEVER BOUNCES (§27, 2026-09-06)." Zero-bounce "BY CONSTRUCTION" since 1.5 < 9. | first sample 0.059 (from rest ω=9 would put it "near 0.03"); max 0.999 before the stated 1 | **none** — emitted and law-tested, read by no stylesheet |
| carried | `--motion-spring-carried` | 1 | 7.5 | 0 | 36 | "CARRIED, FROM REST (§27, 2026-09-08) … UIKit's own presentation spring (damping 1, response ~0.5s)." | 0.496 at 22.22%; 0.888 at 50%; 0.994 at 97.22% | shell drawer (push), Sheet |

The emitted curves themselves are in [The emitted motion block](#the-emitted-motion-block).

History of the family, from both sections:

- **calm and stiff** were the two curves shipped with the control layer on 2026-08-09 (DECISIONS §8: "it rides `--motion-spring`, or `--motion-spring-stiff` where nothing may overshoot").
- **lively** arrived the same day with the button's hover lift — "the LIVELY spring … turned out to be the more important half. Geometry now has two clocks the way paint does" (LOG 2026-08-09 "Motion reaches the control layer…"). recipes.css:1166 says it was "judged on the Key button".
- **Until 2026-08-16 the floating entry's geometry rode `--motion-spring` (calm, ζ0.65).** Checked in `surfaces.css` at commit `6af4bb8` (2026-08-11): `block-size var(--floating-fall) var(--motion-spring)`. Commit `d18ffae` records that the lab's spring override *"sets --motion-spring, and the floating entry has read --motion-spring-elastic since 08-16"*. The lab's clip-path morph of 2026-08-14 ran on `lively`.
- **A "fluid spring"** (ζ0.92/ω5.8) was minted and deleted on 2026-08-15 (*"the fluid spring isn't good"*).
- **elastic** was minted 2026-08-16 at ζ 0.62 (~8.4%) to replace per-recipe curves for the whole floating and overlay family (LOG 2026-08-16 "The materialization is tuned into the family — one curve, two speeds…"). Before it, ζ 0.5 (~16%) "carried a ~2.7% second excursion — visible, and the reversal restored damping's sacredness", and lively's 10.7% "was too polite for a box arriving with a whole card's momentum" (config.ts:835). A "grander overlay spring was minted … and deleted within the hour (*'No this isnt right, made it worse'*)". It moved to ζ 0.715 on 2026-08-23 (Kushagra on the motion bench: *"bounce also at 0.75x"*); "ζ0.62's ~8.4% is … the number to go back to if a quicker entry ever reads as flat. `omega` is unmoved". (config.ts:833-844)
- **poised** was minted 2026-08-16 for the dialog's depth entry. (LOG 2026-08-16 "The dialog's entry locks on depth…")
- **driven** (2026-09-06) followed the rule "presentation is damping 1 with initial velocity injected … bounce belongs only to momentum-driven motion"; it needed the critical closed form in the generator. It was measured putting "76% of the travel inside the first 120ms, which reads as a snap and then a creep once the travel is a screen's width", and **carried** replaced it (Kushagra: *"The opening animation is extremely bad, it just jumps to a middle state, and theres no animation on scrim, or dimming, even when going back"*). config.ts dates `carried` 2026-09-08 (config.ts:866-874); the floating section dates the replacement 2026-09-09, as does the LOG entry. (LOG 2026-09-09 "A side drawer pushes the frame; only a sheet from below recedes it")

The rule over all of them was that damping is sacred: every curve crossed its target at most once, and when a movement needed more visibility it got more travel, not less damping (LOG 2026-08-09 "Motion's grammar is chosen", principle 9).

#### The press curve against a tap

A reading of the press curve against the tap it had to beat (this record's own arithmetic, read off
the emitted samples): the demo's claim was "80% deep by 60ms" at ~140ms. The shipped `stiff` curve at
its judged 140ms reached about 0.64-0.70 of its travel by 60ms (60/140 = 42.9%; samples 0.642 at
41.67%, 0.699 at 45.83%). At the emitted 84ms, 60ms is 71.4% of the clock, where the curve reads
0.918-0.937.

#### Control clocks and distances

config.ts:911-1023 @39f3884. All values were set in the 2026-08-09..11 batch and never changed; later
entries were additions (git log on the keys: `6af4bb8`, `0f25be2` surface, `e62bf56` travel lead/trail,
`f3c0f0b` done seed/blur, `59a9aa8` motionSpeed).

| Key | Judged | Token | Emitted | Why (config's words, abridged) | Used by |
|---|---|---|---|---|---|
| `hoverIn` | 80ms | `--motion-hover-in` | 48ms | "fast enough that the pointer never outruns it" | hover paint on controls and surfaces; scroll-bar fade-in; done-swap fades |
| `hoverOut` | 220ms | `--motion-hover-out` | 132ms | "slow enough to read as cooling rather than switching off" | the resting paint clock (control, surface); scroll-bar fade-out; MessageScroller dock fade |
| `press` | 140ms | `--motion-press` | 84ms | "The press's geometry. Short, and on the stiff spring: it must beat a ~60ms tap." | control and surface press; slider hold; done-swap exit scale |
| `rise` | 550ms | `--motion-rise` | 330ms | "Everything a control's geometry does that is NOT a press — the hover rise, the settle back down, a squashed mark springing out. Long and lively against the press's short and stiff." | default geometry clock of every control and interactive surface |
| `hoverTravel` | 1px | `--hover-travel` | `calc(1px * var(--scale))` | "One pixel: the fill has already stepped, and this is the surface acknowledging a hand near it, not an animation." | Button, Select trigger, interactive surface |
| `mark` | 380ms | `--motion-mark` | 228ms | "A mark's glyph arriving — a tick is drawn, not switched on." | tick draw, radio dot, done tick arrival, accordion chevron turn, Command's list↔empty blur swap |
| `travel` | 420ms | `--motion-travel` | 252ms | "The switch thumb crossing its channel. The benchmark movement (LOG, principle 2)." | switch thumb, accordion panel height, done-state width |
| `travelLead` | 320ms | `--motion-travel-lead` | 192ms | the leading edge of the travelling highlight (see [The travelling highlight](#the-travelling-highlight)) | Tabs rule, segmented thumb, shell bar thumb |
| `travelTrail` | 480ms | `--motion-travel-trail` | 288ms | the trailing edge; "The ratio (0.667) is the judged half; the pair straddles the benchmark rather than replacing it." | same |
| `ring` | 260ms | `--motion-ring` | 156ms | "The focus ring landing from outside … Keyboard only by construction" | `kui-ring-land` on controls and interactive surfaces |
| `ringLand` | 4px | `--focus-ring-land` | `calc(4px * var(--scale))` | "how far outside it starts" | the ring starts at offset 2px + 4px = 6px |
| `pressTravel` | 2px | `--press-travel` | `calc(2px * var(--scale))` | "How far a pressed button sinks" | Button, Select trigger, held open trigger |
| `pressScale` | 0.975 | `--press-scale` | 0.975 | "and how far it shrinks doing it" | same |
| `doneSeed` | 0.6 | `--done-seed` | 0.6 | a DISTANCE, "One seed for both directions" | done swap |
| `doneBlur` | 1.5px | `--done-blur` | `calc(1.5px * var(--scale))` | "THE BLUR IS THE DIAL MOST LIKELY TO GO TO ZERO" | done swap; Command list↔empty |
| `surfacePressTravel` | 1px | `--press-travel-surface` | `calc(1px * var(--scale))` | card-as-button's sink | interactive surface |
| `surfacePressScale` | 0.995 | `--press-scale-surface` | 0.995 | matched on edge movement (see [The interactive surface: card-as-button](#the-interactive-surface-card-as-button)) | interactive surface |
| `pressSquash` | 0.9 | `--press-squash` | 0.9 | "A pressed mark squashes rather than sinking — it has no depth to sink into." | checkbox, radio, slider grip |
| `thumbLean` | 6px | `--thumb-lean` | `calc(6px * var(--scale))` | "How far a switch thumb leans toward where it is about to go, while held." | switch |

Focus ring geometry, not motion but the ring's endpoints: `focusRing = { width: 2, offset: 2 }` (config.ts:760).

#### Panel-family clocks

Durations are the judged config value, then the emitted token value. Distances and scales were not multiplied by `motionSpeed`.

| Config key | Judged | Emitted token | Emitted | What it drove | History |
|---|---|---|---|---|---|
| `floatingMotion.fall` | 345 | `--floating-fall` | 207ms | Height and the panel's travel (`translate`). It led, so it was the shortest geometry clock | 320 (2026-08-09/11) → 460 (2026-08-16, lab bench) → 345 (2026-08-23, ×0.75) |
| `floatingMotion.spread` | 510 | `--floating-spread` | 306ms | Width. It trailed | 480 → 680 → 510 |
| `floatingMotion.corner` | 420 | `--floating-corner` | 252ms | `border-radius`, the pane's `scale`, the body's squish `scale`, the body's `filter` | 380 → 560 → 420 |
| `floatingMotion.reveal` | 195 | `--floating-reveal` | 117ms | The cast fading up (`box-shadow`), the body's `opacity` | 200 → 260 → 195 |
| `floatingMotion.paint` | 80 | `--floating-paint` | 48ms | The pane's own `opacity` | Minted 2026-08-31. Before that it borrowed `--motion-hover-in` (80) |
| `floatingMotion.revealDelay` | 45 | `--floating-reveal-delay` | 27ms | Delay before the body printed | 80 (2026-08-09) → 280 (2026-08-15) → 60 (2026-08-16) → 45 (2026-08-23) |
| `floatingMotion.dissolve` | 105 | `--floating-dissolve` | 63ms | Exit `opacity` (ease-in) | 140 → 105 |
| `floatingMotion.settle` | 120 | `--floating-settle` | 72ms | Exit `scale` (stiff spring) | 160 → 120 |
| `overlayMotion.materialize` | 525 | `--overlay-materialize` | 315ms | Alert: `border-radius`, `padding` | 400 (2026-08-15 first cut) → 700 (2026-08-16) → 525 (2026-08-23) |
| `overlayMotion.fall` | 420 | `--overlay-fall` | 252ms | Alert: height, the rise (`translate`) | 560 → 420 |
| `overlayMotion.spread` | 600 | `--overlay-spread` | 360ms | Alert: width | 800 → 600 |
| `overlayMotion.hold` | 0 | `--overlay-hold` | 0ms | Delay on the rise | Zero since 2026-08-16 |
| `overlayMotion.grow` | 0 | `--overlay-grow` | 0ms | Delay on growth | 300, then 180, then 120 with a 120 hold, all judged out; zero since 2026-08-16 |
| `overlayMotion.reveal` | 150 | `--overlay-reveal` | 90ms | Alert pane and body `opacity`; both scrims' fade | 200 → 150 |
| `overlayMotion.revealDelay` | 120 | `--overlay-reveal-delay` | 72ms | Alert body print delay | 240 (first cut) → 160 → 120 |
| `overlayMotion.print` | 285 | `--overlay-print` | 171ms | Alert body `filter` and echo `translate` | 380 → 285 |
| `overlayMotion.dissolve` | 105 | `--overlay-dissolve` | 63ms | Alert, Dialog, Popover exit `opacity` | 140 → 105 |
| `overlayMotion.settle` | 120 | `--overlay-settle` | 72ms | Alert, Dialog, Popover exit `scale` | 160 → 120 |
| `dialogMotion.settle` | 600 | `--dialog-settle` | 360ms | Dialog and Popover `scale`; the body's focus (`filter`) | Locked 2026-08-16 |
| `dialogMotion.reveal` | 300 | `--dialog-reveal` | 180ms | Dialog and Popover `opacity`; Popover `box-shadow` | Locked 2026-08-16 |
| `tooltipMotion.form` | 300 | `--tooltip-form` | 180ms | Tooltip `scale` | 2026-08-31 |
| `tooltipMotion.paint` | 120 | `--tooltip-paint` | 72ms | Tooltip `opacity` | 2026-08-31 |
| `shellDrawer.duration` | 500 | `--motion-drawer` | 300ms | Every drawer channel: slide, push, scrim, well, plane, `visibility`, and Sheet | 420 (2026-09-06) → 500 (2026-09-09) |
| `motion.duration` | 120 | `--motion-duration` | 72ms | (control layer; not used by this family) | — |
| `controlMotion.mark` | 380 | `--motion-mark` | 228ms | Command's list↔empty blur swap | — |

The clock history had four steps. On 2026-08-16 the menu's clocks came off the lab bench (Kushagra: *"I prefer whatever is on lab"*; commit `d18ffae`). On 2026-08-23 the floating and overlay clocks were cut to 0.75× on the motion bench (commit `25464a4`). On 2026-09-14 every emitted duration was multiplied by 0.6 (Kushagra: *"whatever animates, lets make it all much faster, like keep animation as is, but make them faster"*; LOG 2026-09-14 "Motion runs at 0.6 of its judged clocks"). Compared with the lab-bench values of 2026-08-16, the shipped floating clocks at 39f3884 ran at 0.45× (fall 460 → 207ms emitted).

#### How short the clocks could go

The motion bench measured, on 2026-08-23 and re-measured, "on `/preview/select`, three fixtures (a 48-row list, a short list opening near the window's top edge, a trigger against an edge) at window heights 420 and 620, sampling the chosen row's distance from its trigger per frame", at 1.00×, 0.70×, 0.55× and 0.40× of that day's config values (apps/docs/app/preview/motion-panel.tsx:24-48; the sections cite :24-45 and :26-48):

| Clock multiplier | Chosen-row offset spread | Lands off by | After landing |
|---|---|---|---|
| 1.00× | 0 | 2px | no movement |
| 0.70× | 0 | 3px | no movement |
| 0.55× | 0 | 5px | 1-2px of creep |
| 0.40× | 0 | 4px | 3-7px of creep |

"So a cut of about a THIRD is free … Below roughly 0.6x the panel starts finishing its growth after the entry says it has landed, and the chosen row crawls the last few pixels … If a shorter clock is what the eye wants, that is a real bug to fix, not a bound to widen." The panel's on-screen caption said: "Floating clocks are safe to about 0.7×. Below roughly 0.6× a select's chosen row crawls the last few pixels after the entry has landed" (motion-panel.tsx:26-48, :393-396). The file does not say which baseline those multipliers were measured against; the 0.75× cut landed the same day. `motionSpeed` shipped at exactly 0.6 on 2026-09-14; LOG and DECISIONS record no re-measurement of the select's creep after it.

#### Distances, poses and scales

| Name | Value | Emitted | Role |
|---|---|---|---|
| `floatingSeed` | 56 | `--floating-seed: calc(56px * var(--scale))` | The designed seed diameter. After 2026-08-15 it was only the fallback when no trigger was measured. It also served as the "not laid out yet" threshold |
| `floatingEcho` | 8 | `--floating-echo: calc(8px * var(--scale))` | The body's small upward arrival as it printed; Command's pane start offset |
| `overlaySeed` | 64 | `--overlay-seed: calc(64px * var(--scale))` | The alert's circle |
| `overlayLift` | 32 | `--overlay-lift: calc(32px * var(--scale))` | Gap below the alert's measured bottom edge where the circle formed |
| `overlayEcho` | 8 | `--overlay-echo: calc(8px * var(--scale))` | The alert body's rise |
| `dialogEntry.depth` | 0.97 | `--dialog-depth: 0.97` | Dialog and Popover starting `scale` (3% in z) |
| `printBlur` | 6 | `--print-blur: 6px` (not multiplied by `--scale`) | Content that had not printed yet: floating body, alert body, dialog body, popover body. Promoted 2026-08-26 from `dialogEntry.blur` / `--dialog-blur`. Before that the floating and alert seeds each wrote a raw `blur(6px)` |
| `tooltipEntry.seed` | 0.9 | `--tooltip-seed: 0.9` | Tooltip starting and exit `scale` |
| literal | `scale: 0.95 0.5` | surfaces.css:3178 | The floating body's squish at the seed |
| literal | `scale: 0.98` | surfaces.css:3192 | Floating exit settle |
| literal | `scale: 0.99` | surfaces.css:3375, :3463, popover.css:99 | Alert, Dialog and Popover exit settle |
| `shellDrawer.scale` | 0.925 | `--shell-drawer-scale` | The frame's recession. Deleted 2026-09-12 once nothing receded |
| `scrim.well` | `#0b0b0c` | `--scrim-well` | What a receding frame went back into. Emitted but painted by nothing at 39f3884 |
| `controlMotion.pressTravel` / `pressScale` | 2 / 0.975 | `--press-travel`, `--press-scale` | Not this family's, but an open trigger HELD this press. That is why the width floor and the resting anchor existed |
| `controlMotion.doneBlur` | 1.5 | `--done-blur: calc(1.5px * var(--scale))` | Command's list↔empty swap |

#### Constants in the JavaScript

Not tokens, and not multiplied by `motionSpeed`.

| Constant | Value | Where | Meaning |
|---|---|---|---|
| `SIDE_OFFSET` | 4 (px) | `floating.tsx:509` | The gap between trigger and panel for the whole anchored family. It had four private copies until 2026-08-29 |
| Tooltip `DELAY` / `CLOSE_DELAY` | 600ms / 0ms | `tooltip.tsx:31–32` | Delay on `TooltipProvider`. v0 ("Radix rests at 700ms, Material at 500") |
| `whenPlaced` cap | 12 frames | `floating.tsx:~1700` | How long a content-placed panel (Select) waited for its box to hold still |
| `depart` wait cap | 10 frames | `floating.tsx:1579` | How long a pin-corrected flight waited for a still positioner |
| Page hold | "four frames" (measured as 5 by the 2026-08-31 audit) | `floating.tsx:759` | How long the page scroll was re-parked |
| Release slack | +50ms | `floating.tsx:1633` | Added to the longest declared `duration + delay` |
| `useStatedFlight` guard | fall + 200ms | `floating.tsx:2045` | Fallback landing for a pane with no `transitionend` |
| `useStatedFlight` size floor | 8px | `floating.tsx` | Below this the pane was not announced |
| `measureUnlessFlying` lens floor | 8px | `refraction.tsx:1272` | Below this the lens built no map |

#### The scrim

- Light: fill `rgb(0 0 0 / 0.18)`, filter `blur(8px) saturate(0.8)`, high-contrast fill `rgb(0 0 0 / 0.62)`.
- Dark: fill `rgb(0 0 0 / 0.32)`, filter `blur(8px) saturate(0.8) brightness(0.9)`, high-contrast fill `rgb(0 0 0 / 0.75)`.

These were the lab's values, ported 2026-08-17. The first cut was 0.4 light and 0.55 dark with a 4px blur. Under `contrast="high"` and reduced transparency the filter stood down to `initial` and the fill went to the high-contrast value. The Shell's scrim dimmed without blurring (`backdrop-filter: none`, 2026-09-08).

#### The emitted motion block

The motion block of `tokens.css:200-265` at `39f3884`, verbatim. The panel families' tokens followed it in the same file (their values are in [Panel-family clocks](#panel-family-clocks) and [Distances, poses and scales](#distances-poses-and-scales)); each was emitted with `ms()`, so each carried the 0.6.

```css
  /* motion (§8) — two clocks. Signal (colour, opacity) eases and is short; travel
     (geometry) rides a baked damped spring, so a state change costs a cubic-bezier and
     reads like mass. The curves are SAMPLED from the model in config, never pasted. */
  --motion-duration: 72ms;
  --motion-drawer: 300ms;
  --motion-easing: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-spring: linear(0, 0.021 2.78%, 0.076 5.56%, 0.154 8.33%, 0.247 11.11%, 0.347 13.89%, 0.449 16.67%, 0.548 19.44%, 0.641 22.22%, 0.726 25%, 0.801 27.78%, 0.866 30.56%, 0.92 33.33%, 0.964 36.11%, 0.999 38.89%, 1.026 41.67%, 1.045 44.44%, 1.058 47.22%, 1.065 50%, 1.068 52.78%, 1.067 55.56%, 1.064 58.33%, 1.059 61.11%, 1.053 63.89%, 1.047 66.67%, 1.04 69.44%, 1.033 72.22%, 1.026 75%, 1.02 77.78%, 1.015 80.56%, 1.011 83.33%, 1.007 86.11%, 1.003 88.89%, 1.001 91.67%, 0.999 94.44%, 0.997 97.22%, 1 100%);
  --motion-hover-in: 48ms;
  --motion-hover-out: 132ms;
  --motion-press: 84ms;
  --motion-rise: 330ms;
  --hover-travel: calc(1px * var(--scale));
  --motion-mark: 228ms;
  --motion-travel: 252ms;
  --motion-travel-lead: 192ms;
  --motion-travel-trail: 288ms;
  --motion-ring: 156ms;
  --focus-ring-land: calc(4px * var(--scale));
  --press-travel: calc(2px * var(--scale));
  --press-scale: 0.975;
  --press-squash: 0.9;
  --done-seed: 0.6;
  --done-blur: calc(1.5px * var(--scale));
  --press-travel-surface: calc(1px * var(--scale));
  --press-scale-surface: 0.995;
  --thumb-lean: calc(6px * var(--scale));
  --motion-spring-lively: linear(0, 0.04 2.78%, 0.141 5.56%, 0.278 8.33%, 0.429 11.11%, 0.579 13.89%, 0.717 16.67%, 0.835 19.44%, 0.931 22.22%, 1.004 25%, 1.056 27.78%, 1.087 30.56%, 1.103 33.33%, 1.107 36.11%, 1.101 38.89%, 1.089 41.67%, 1.074 44.44%, 1.058 47.22%, 1.042 50%, 1.028 52.78%, 1.016 55.56%, 1.006 58.33%, 0.998 61.11%, 0.993 63.89%, 0.99 66.67%, 0.989 69.44%, 0.989 72.22%, 0.989 75%, 0.991 77.78%, 0.992 80.56%, 0.994 83.33%, 0.996 86.11%, 0.997 88.89%, 0.999 91.67%, 1 94.44%, 1 97.22%, 1 100%);
  --motion-spring-stiff: linear(0, 0.017 4.17%, 0.062 8.33%, 0.124 12.5%, 0.197 16.67%, 0.276 20.83%, 0.356 25%, 0.434 29.17%, 0.509 33.33%, 0.578 37.5%, 0.642 41.67%, 0.699 45.83%, 0.749 50%, 0.794 54.17%, 0.833 58.33%, 0.866 62.5%, 0.894 66.67%, 0.918 70.83%, 0.937 75%, 0.953 79.17%, 0.966 83.33%, 0.977 87.5%, 0.985 91.67%, 0.991 95.83%, 1 100%);
  --motion-spring-elastic: linear(0, 0.039 2.78%, 0.135 5.56%, 0.26 8.33%, 0.396 11.11%, 0.528 13.89%, 0.649 16.67%, 0.753 19.44%, 0.838 22.22%, 0.906 25%, 0.957 27.78%, 0.993 30.56%, 1.017 33.33%, 1.031 36.11%, 1.038 38.89%, 1.04 41.67%, 1.038 44.44%, 1.034 47.22%, 1.029 50%, 1.024 52.78%, 1.019 55.56%, 1.014 58.33%, 1.01 61.11%, 1.006 63.89%, 1.004 66.67%, 1.002 69.44%, 1 72.22%, 0.999 75%, 0.999 77.78%, 0.998 80.56%, 0.998 83.33%, 0.998 86.11%, 0.999 88.89%, 0.999 91.67%, 0.999 94.44%, 0.999 97.22%, 1 100%);
  --motion-spring-poised: linear(0, 0.026 2.78%, 0.091 5.56%, 0.179 8.33%, 0.279 11.11%, 0.382 13.89%, 0.482 16.67%, 0.575 19.44%, 0.658 22.22%, 0.732 25%, 0.794 27.78%, 0.847 30.56%, 0.89 33.33%, 0.925 36.11%, 0.952 38.89%, 0.972 41.67%, 0.988 44.44%, 0.999 47.22%, 1.006 50%, 1.011 52.78%, 1.014 55.56%, 1.015 58.33%, 1.015 61.11%, 1.014 63.89%, 1.013 66.67%, 1.012 69.44%, 1.01 72.22%, 1.009 75%, 1.007 77.78%, 1.006 80.56%, 1.005 83.33%, 1.004 86.11%, 1.003 88.89%, 1.002 91.67%, 1.001 94.44%, 1.001 97.22%, 1 100%);
  --motion-spring-driven: linear(0, 0.059 2.78%, 0.141 5.56%, 0.232 8.33%, 0.326 11.11%, 0.415 13.89%, 0.498 16.67%, 0.573 19.44%, 0.639 22.22%, 0.697 25%, 0.747 27.78%, 0.79 30.56%, 0.826 33.33%, 0.856 36.11%, 0.882 38.89%, 0.903 41.67%, 0.921 44.44%, 0.935 47.22%, 0.947 50%, 0.957 52.78%, 0.965 55.56%, 0.972 58.33%, 0.977 61.11%, 0.982 63.89%, 0.985 66.67%, 0.988 69.44%, 0.99 72.22%, 0.992 75%, 0.994 77.78%, 0.995 80.56%, 0.996 83.33%, 0.997 86.11%, 0.997 88.89%, 0.998 91.67%, 0.998 94.44%, 0.999 97.22%, 1 100%);
  --motion-spring-carried: linear(0, 0.019 2.78%, 0.066 5.56%, 0.13 8.33%, 0.203 11.11%, 0.28 13.89%, 0.355 16.67%, 0.428 19.44%, 0.496 22.22%, 0.559 25%, 0.616 27.78%, 0.667 30.56%, 0.713 33.33%, 0.753 36.11%, 0.788 38.89%, 0.819 41.67%, 0.845 44.44%, 0.868 47.22%, 0.888 50%, 0.905 52.78%, 0.92 55.56%, 0.932 58.33%, 0.943 61.11%, 0.952 63.89%, 0.96 66.67%, 0.966 69.44%, 0.971 72.22%, 0.976 75%, 0.98 77.78%, 0.983 80.56%, 0.986 83.33%, 0.988 86.11%, 0.99 88.89%, 0.992 91.67%, 0.993 94.44%, 0.994 97.22%, 1 100%);
```

### The control layer

#### Where the control layer lived

| What | Where |
|---|---|
| Control transition list and hooks | `packages/ui/src/system/recipes.css:1150-1184` |
| Hover, press, open-trigger rules | `recipes.css:1197`, `:1285`, `:1316`, `:1325` |
| Ring arrival (`@keyframes kui-ring-land`, `--kui-ct-ring`) | `recipes.css:1371-1395` |
| Shared reduced-motion block | `recipes.css:1410-1423` |
| Mark squash | `recipes.css:531` |
| Interactive surface (card-as-button) motion | `packages/ui/src/system/surfaces.css:1332-1418`, stand-down `surfaces.css:3471-3505` |
| Button rise, sink, held press, done swap | `components/button/button.css:30-165`, `button.tsx:105-135, 210-270` |
| Select trigger's button gesture | `components/select/select.css:75-93` |
| Checkbox tick draw | `components/checkbox/checkbox.css:34-72`, `checkbox.tsx:104-136` |
| Radio dot | `components/radio/radio.css:31-49` |
| Switch thumb | `components/switch/switch.css:94-238` |
| Slider grip | `components/slider/slider.css:166-198` |
| Tabs rule | `components/tabs/tabs.css:118-279` |
| Segmented thumb | `components/segmented-control/segmented-control.css:184-384`, `segmented-control.tsx:55-253` (`useTravelingThumb`) |
| Shell tab-bar grip | `components/shell/shell.css:2081-2115`, stand-down `shell.css:2734-2752` |
| Accordion panel and chevron | `components/accordion/accordion.css:81-236` |
| Paint fades | `link.css`, `breadcrumb.css`, `scroll-area.css`, `toolbar.css`, `message-scroller.css`, `shell.css` (resize line) |
| Content loops | `spinner.css`, `progress.css`, `attachment.css` |

#### The hooks and the one transition list

Every `.kui-control` declared the same transition list, and every state restated a clock through a
custom property rather than restating the list (recipes.css:1150-1184 @39f3884):

```css
.kui-control {
  --kui-ct-paint: var(--motion-hover-out);
  --kui-ct-move: var(--motion-rise);
  --kui-ct-move-ease: var(--motion-spring-lively);
  --kui-ct-width: 0s;
  transition:
    background-color var(--kui-ct-paint) var(--motion-easing),
    border-color var(--kui-ct-paint) var(--motion-easing),
    color var(--kui-ct-paint) var(--motion-easing),
    translate var(--kui-ct-move) var(--kui-ct-move-ease),
    scale var(--kui-ct-move) var(--kui-ct-move-ease),
    inline-size var(--kui-ct-width) var(--kui-ct-move-ease);
}
```

- `--kui-ct-paint` was "one variable, so every state can restate the clock without restating the
  properties: hover warms it fast, the pointer leaving cools it slow, and a press sets it to zero —
  which is the 2026-08-03 finding kept literally, not compromised."
- `--kui-ct-move` / `--kui-ct-move-ease` were the same shape for geometry: "A press is a hard stop
  under the finger — short and stiff, and it must beat a ~60ms tap. Everything else the geometry does
  is the object RECOVERING … Long and lively against short and stiff, and giving them one clock
  flattens both."
- "The geometry channels are declared for every control and used by two families (Button sinks, a mark
  squashes). Listing them here rather than per component is what keeps the press one sentence."
- `--kui-ct-width` (2026-09-02) was "a HOOK rather than a value so nothing else in the system starts
  animating: `0s` is a no-op, and only a control that opts in — today a Button whose label changes with
  its done state — gives it a duration. Appended rather than inserted, because the paint channels lead
  the list and a law reads them."
- The resting cast (`box-shadow`) was NOT in the list: the loud rung's press "tighten" of its cast
  (recipes.css:1316, `--kui-ct-cast` swapping to the `-active` chain) therefore changed in one frame.
  In the whole package, `box-shadow` transitioned only on floating and overlay panels. The button's
  shadow crossfade stayed deferred (see [The rules as DECISIONS §8 stated them at 39f3884](#the-rules-as-decisions-8-stated-them-at-39f3884)).
- The skeleton's own opening rule still carried the pre-motion comment at 39f3884: "No transition
  ships until the motion system is designed (§8, decided 2026-08-03): every state change is instant on
  both pointer worlds. The motion tokens stay wired; nothing reads them yet." (recipes.css:149-152)

#### Hover

```css
@media (hover: hover) {
  .kui-control:hover:not([data-disabled], [data-loading], :disabled) {
    background-color: var(--kui-ct-fill-hover, var(--kui-ct-fill-src-hover));
    --kui-ct-paint: var(--motion-hover-in);
  }
}
```
(recipes.css:1197-1205 @39f3884)

- The asymmetry lived in two places: the resting `--kui-ct-paint` was `--motion-hover-out` (so leaving
  cooled over 220 → 132ms), and the hovered state restated it as `--motion-hover-in` (so arriving
  warmed over 80 → 48ms).
- Row family arms restated the hover-in clock too (`.kui-row[data-hover-lit]:hover…`), and the quiet
  row's lit fill was a half-step (`--kui-ct-lit-mix`), paint only.
- **The boundary hover (2026-08-10 → 2026-08-17).** On 2026-08-10 Kushagra: *"there's no hover
  darkening of border on text field or checkbox."* Measured: a hovered TextField and TextArea computed
  byte-identical to rest. The fix was "a **mix toward the family's own ink**, not a pick off a ladder"
  (`edgeHoverMix`, v0), held at (0,2,0) so invalid and disabled still won. On 2026-08-17 the fill-first
  flip gave fields and marks a dress fill with hover slots, the border mix made "a hovered field move
  in TWO currencies at once, which Kushagra read immediately ('hover too aggressive')", and the rule
  and `edgeHoverMix` were deleted: "hover is ONE step in the ONE currency the control's identity is
  made of." (DECISIONS §8; recipes.css:1264-1273)
- The hover guard learned `:disabled` on 2026-08-26 after a dead `<button disabled>` row "rested at
  `rgba(0, 0, 0, 0)` and lit to `oklab(0 0 0 / 0.02015)`, ~56% of the live row's step" (recipes.css:1185-1195).

#### Press

```css
.kui-control:active:not([data-disabled]):not([data-loading]) {
  background-color: var(--kui-ct-fill-active, var(--kui-ct-fill-src-active));
  --kui-ct-paint: 0s;
  --kui-ct-move: var(--motion-press);
  --kui-ct-move-ease: var(--motion-spring-stiff);
}
```
(recipes.css:1325-1337 @39f3884)

- "Only the paint is zeroed — the geometry keeps its spring, so a pressed button still travels. That
  separation is what made motion possible here at all." And: "Restated on the STATE, so the release
  automatically takes the base clock back — a single duration would make the recovery as abrupt as the
  strike."
- "Press is deliberately NOT guarded: it fires on every input, and on touch it is the only feedback
  there is."
- **The rank (2026-09-01 audit).** The rule had been (0,3,0), and "three lit rules written to beat the
  shared hover at (0,3,0) landed at (0,4,0) and beat this as well": a plain `<Row>` "went rest -> hover
  -> press all `oklab(0 0 0 / 0.03575)` with `:active` true", and an unpressed Toggle held under the
  pointer painted its hover fill while a quiet Button moved `0.055` → `0.078`. The fix split the one
  `:not()` into two to reach (0,4,0), "spent deliberately"; a component's own lit rule must state
  (0,3,0) or lower. A mounted law held a real press on a Toggle and a Row (recipes.css:1289-1307).

#### In use: an open trigger holds the hover step, and per family the press

```css
.kui-control[data-popup-open]:where(:not([data-disabled], .kui-row)) {
  background-color: var(--kui-ct-fill-hover, var(--kui-ct-fill-src-hover));
}
```
(recipes.css:1285-1287) — promoted 2026-08-10 on its third member (submenu row, select trigger, menu
trigger; Kushagra: *"dropdown menus trigger also should remain in state where it activated"*).
Unguarded, "being in use is not a pointer fact". The geometry half (the held press) was the Button
family's and the Select trigger's own rule (see [Button](#button) and [Select trigger](#select-trigger)).

#### The ring's arrival

```css
@keyframes kui-ring-land {
  from { outline-offset: calc(var(--focus-ring-offset) + var(--focus-ring-land)); }
}
.kui-control { --kui-ct-ring: kui-ring-land var(--motion-ring) var(--motion-spring-stiff); }
.kui-control:focus-visible:not(:where(input, textarea, .kui-row)) { animation: var(--kui-ct-ring); }
```
(recipes.css:1371-1395 @39f3884)

- An `animation`, not a transition, because "there is no previous `outline-offset` to travel from,
  because the ring does not exist until this rule matches". The ring travelled from 6px to 2px (offset
  2px + land 4px) over 260 → 156ms on the stiff curve (no overshoot). "The colour is instant either way —
  a ring is a truth claim about where keystrokes land, and a truth claim does not fade in."
- The rule stated: "motion must answer 'what does the viewer not yet know?', and when the answer is
  nothing the change is instant."
- Text-entry elements were named out because browsers match `:focus-visible` on click for them. Rows
  were also named out; the sources read here do not state why.
- The `:where()` wrapper was added 2026-08-10: "the list is a filter, not a claim to specificity, and
  the loud spelling is what set the trap" (see [Reduced motion in the control layer](#reduced-motion-in-the-control-layer)).
- Where the ring did NOT land: the field family (`.kui-field:has(> .kui-field-input:focus)`, text-field.css:157,
  instant by measured refusal, see [The field family (TextField, TextArea)](#the-field-family-textfield-textarea)); the slider grip (`.kui-slider-thumb:has(input:focus-visible)`,
  slider.css:230, no animation); Link, Breadcrumb and the docs blocks ("No `kui-ring-land` arrival … an
  inline ring sits close to its glyphs by necessity", link.css:58-62).

#### Reduced motion in the control layer

```css
@media (prefers-reduced-motion: reduce) {
  .kui-control, .kui-control *, .kui-mark { transition: none; }
  .kui-control { --kui-ct-ring: none; }
}
```
(recipes.css:1410-1423 @39f3884)

**It had never worked for the ring (found 2026-08-10).** "`:not()` takes the specificity of its most
specific *argument* rather than summing its list. So `.kui-control:focus-visible:not(input, textarea,
.kui-row)` is (0,3,0), the stand-down `.kui-control:focus-visible { animation: none }` is (0,2,0), and a
media query adds nothing. **The focus ring went on landing for every user who had asked their operating
system for stillness**, for six days." Two laws missed it: the suppression law walked `transition`
declarations and this was an `animation`; and "even for transitions the law asked only whether a
selector was *present* inside the guarded block, never whether it *won*." The fix was structural: the
arrival became the `--kui-ct-ring` hook, "so a recipe and its suppression share a selector, the tie goes
to source order, and specificity can never separate them again." The harness learned to enter the media
query (`asksForStillness()`, CDP `Emulation.setEmulatedMedia`). (LOG 2026-08-10 "Hover reaches the boundary…")

**The second verse, the same day, in the moving parts.** "The shared stand-down covers `.kui-control *`
at (0,1,0); the tick, the dot and the switch grip declare their clocks in sheets that import later — the
dot's `.kui-radio > svg > circle` outruns it at (0,1,2), the others tie and win on file order. Measured
before claiming: the tick kept its 0.38s draw under `reduce`." The doctrine became: "**the sheet that
declares a clock stands it down itself, on the declaring selector**, end of file, so the tie goes to the
stand-down by construction". Four sheets got the block that day (checkbox, radio, switch, slider).
"Raising the shared stand-down's specificity" was rejected: "no spelling wins against an arbitrary
component selector by construction — the doctrine scales, arithmetic does not." (LOG 2026-08-10 "The grip squashes…")

By 39f3884 local stand-downs existed in checkbox.css:67, radio.css:45, switch.css:234, slider.css:194,
tabs.css:274, segmented-control.css:379, accordion.css:228, link.css:79, breadcrumb.css:134,
scroll-area.css:208, toolbar.css:238, message-scroller.css:72, shell.css:2734, command.css and
surfaces.css:3471 (interactive surface: `transition: none` and `--kui-sf-ring: none`). Only the ring's
`animation` was named, "never `animation` at large: motion that IS the content keeps its own answer".

**What stillness did not remove.** Stillness removed travel, never state or affordance: the switch still
jumped, the ring still drew at its resting offset, the toolbar title still arrived ("reduced motion asks
for stillness, not for information to be withheld", toolbar.css:233-237).

**A suspicion recorded here, not measured in the sources.** button.css carried no
`prefers-reduced-motion` block at 39f3884. The done swap's glyph transitions were declared on
`.kui-button-swap-from, .kui-button-swap-to` (0,1,0) and `.kui-button[data-done] .kui-button-swap-to`
(0,3,0). By the 2026-08-10 finding, a later-imported (0,1,0) ties `.kui-control *` and wins on file
order, and a heavier selector outruns it, so these glyph clocks were probably not stood down. The
coverage law's `COVERED = /\.kui-(control|mark|button|checkbox|radio|switch|field|textarea|slider|row)\b/`
matches `.kui-button-swap-from` (the `\b` falls before the hyphen), so it treated the selector as
covered; the mounted "moving PARTS" law checked the tick, dash, dot and both grips, not the swap.
button.tsx:111 claimed "reduced motion stands it down through the shared hook like every other recipe".

#### Button

**Rest identity.** `.kui-button { translate: 0 0; scale: 1; }` (button.css:30-33). A mounted law's
comment: "A resting button states the identity, which is what gives the press somewhere to travel FROM:
without it the first press interpolates out of `none` and the spring has no start." (button.browser.test.tsx:1211-1213)
A Button could afford the stacking context a mark could not.

**The rise.** `@media (hover: hover) { .kui-button:hover:not([data-disabled], [data-loading], [data-popup-open]) { translate: 0 calc(-1 * var(--hover-travel)); } }`
(button.css:42-46). Kushagra, on the shipped version without it: *"its different to the key one, key one
also raises on hover"*. The author had withheld it on the argument that it needed the open flat/elevated
shadow ruling; "Wrong on the facts: the lift is geometry and the cast is chrome, and only the second one
is blocked." Guarded because "a touch device synthesises it on tap and would leave every pressed button
hanging a pixel high." (LOG 2026-08-09 "Motion reaches the control layer…")

**The sink.** `.kui-button:active:not([data-disabled], [data-loading], [data-popup-open]) { translate: 0 var(--press-travel); scale: var(--press-scale); }`
(button.css:57-60): 2px down and 0.975, on the press clock (140 → 84ms, stiff), recovering on the rise
clock (550 → 330ms, lively). Kushagra, 2026-08-09: *"I have a feeling that the button will have travel, a
bit down, but it will have travel"*. "Down AND smaller: a box that only moves down reads as sliding, and
one that only shrinks reads as receding; together they read as pressed." "Source order is the mechanism:
hover and press are both (0,3,0), so the press must come after or a hovered button would stay lifted
while it is being held." (button.css:18-29, 48-56)

**The held press on an open trigger (2026-08-10).** `.kui-button[data-popup-open] { translate: 0 var(--press-travel); scale: var(--press-scale); }`
(button.css:69-72). Two calls the same hour:
1. *"leaving the mouse off triggers also moves the menu as the button moves back to its OG position"* —
   "floating-ui measures the anchor WITH its transforms, so the trigger's 1px hover settle — 550ms of
   lively spring — dragged the whole anchored panel with it." The first fix LOCKED an open trigger at rest.
2. *"button goes down when clicked, but with select or dropdown, its not happening — I want it to go down,
   and stay there"* — "menus open on pointer-DOWN, so the open stamp lands the instant the sink begins and
   cancelled it before it was visible." "The right model was his: the open state IS the held press."
(LOG 2026-08-10 "The seed becomes the trigger itself…")

Principle 12 (2026-08-09) had reverted a held-sunken menu trigger in the scratch demo ("engagement as
paint at normal depth"). The sources read here do not record the shipped held press being reconciled with
that principle; the Toggle kept principle 12 (see [Toggle and ToggleGroup](#toggle-and-togglegroup)).

**What the held press cost the floating layer.** Three repairs, each told in full in [The width floor and `--kui-anchor-w`](#the-width-floor-and---kui-anchor-w) and [`useRestingAnchor`](#userestinganchor-floatingtsx356-2026-08-25):
- 2026-08-11: the entry floored the panel on the resting rect while floating-ui floored it on the held (0.975) rect — "flight at 402px, settle at 392, a 10px step". Fixed with `heldAnchorWidth` (reading the scale transition's end value off the Web Animations API). The law had passed because it mounted with `defaultOpen`, "where the trigger is BORN holding the press". Rejected: "dropping `scale` from the held press (removes the cause, changes a judged design — Kushagra's call, not the mechanism's)". (LOG 2026-08-11 "The panel compressed at release, because the two width floors measured different triggers")
- 2026-08-22: the press is a spring, so the trigger's scale at the instant the entry measured depended on how the panel was opened — `scale: 1` under a real pointer press, `scale: 0.975` under `defaultOpen`. (LOG 2026-08-22 "The flight borrows a style, it does not enumerate one — and three other things the suite could not see")
- 2026-08-25: "§8's held press sinks an open trigger 2px over ~150ms", floating-ui's autoUpdate "watches element resize and layout shift, never a transform", so a constrained top-opening flight popped ~2px at release (*"Theres a small jumo still"*). Fixed with `useRestingAnchor` — a virtual anchor reporting the trigger's untransformed layout box — at the stated cost of "a static 2px larger gap between a pressed trigger and its panel". (LOG 2026-08-25 "The placement's anchor is the trigger's RESTING box, and the last 2px of the release jump goes")

**The done state (§41, 2026-09-02).** `done?: boolean`; the app owns the state and its timer.
- Kushagra asked for *"a small scale down + blur + appear, like we have done motion in other tools, like
  menu, popover"*. The author first argued for the tick DRAW; "He corrected the scope — the motion is on
  the ICON as it changes, not on the box". The draw was rejected because "a done state is a momentary
  report that reverts in two seconds … a draw in and out over that round trip reads fussy." The floating
  family's print recipe was refused: "licensed by MASS … A 16px glyph at a ~1.17px painted stroke has
  neither." (LOG 2026-09-02 "The done state is a swap, not a draw…")
- **Both glyphs mounted always**: `DoneSwap` rendered `.kui-button-swap` (a one-cell grid) holding
  `.kui-button-swap-from` (the caller's glyph) and `.kui-button-swap-to` (the tick, `aria-hidden`), both
  `data-glyph` (button.tsx:118-135). "React would unmount the outgoing one the instant `done` flips, and an
  unmounted element cannot leave." Passing the prop at all (even `false`) mounted the tick.
- **Clocks** (button.css:112-146): resting/leaving glyphs — `opacity` and `filter` on `--motion-hover-in`
  (48ms) with the paint easing, `scale` on `--motion-press` (84ms) and `stiff`; the arriving tick under
  `[data-done]` — `opacity` on hover-in, `filter` on `--motion-mark` (228ms), `scale` on `--motion-mark` and
  `--motion-spring` (calm). Resting state of the waiting tick: `opacity: 0; scale: var(--done-seed);
  filter: blur(var(--done-blur))`. The asymmetry was "entirely in the durations". As written, when `done`
  went back to false the caller's glyph returned on the exit clocks (press/stiff), since only the tick's
  arrival had its own rule.
- **The width travelled** (Kushagra's call, asked as a choice: travel it or reserve the wider word):
  `.kui-button:has(.kui-button-swap) { interpolate-size: allow-keywords; --kui-ct-width: var(--motion-travel); }`
  (button.css:163-165). "Where an engine does not have it the width simply snaps … so this is additive."
  The first spelling put a live `inline-size` in the shared list, "which would have animated the width of
  every field, select trigger and segmented track"; two skeleton clock laws caught it.
- Found by laws: "an icon-only button grew TWO swaps" (the leading arm did not exclude `iconOnly`); and
  "the caller's own glyph fell out of the shared icon-box rule … an `<svg>` with no intrinsic size is
  300x150 by CSS's replaced-element default", fixed with a `[data-glyph]` arm on the shared icon rule.
  `system/glyphs.ts` became the tick's one home after the checkbox, menu and button each had a copy.
- +204 gzipped bytes; 13 mounted laws; ten sabotage passes.
- **Unverified at 39f3884**: the width law (button.browser.test.tsx:1690-1711) asserted only that the
  `inline-size` channel had a non-zero duration; no law in the sources observed the width move. On
  2026-09-05 the Command work recorded that "A content-driven height change is `auto` to `auto` — no
  computed value moves, so no transition can fire", and that `interpolate-size` "buys the arrival, where
  the value really does go from `0`, and cannot buy this"; it also measured that "`interpolate-size` does
  not reach a FLEX ITEM" (command.css:545-551; LOG 2026-09-05 "The results pane opens out of the search
  bar…"). `Copy` → `Copied` is a content-driven `auto` → `auto` change. The sources contain no measurement
  showing the done width actually animated. See also the reduced-motion suspicion in [Reduced motion in the control layer](#reduced-motion-in-the-control-layer).

#### Select trigger

Wore field dress but took "the BUTTON'S GESTURE" (select.css:68-93, 2026-08-10, Kushagra: *"its also an
onclick trigger"*): rest identity, the 1px rise under `@media (hover: hover)`, the 2px/0.975 press, and the
held press under `[data-popup-open]` — "Distances are the button family's tokens, so a re-judged press
reaches both files from config." §8's "a field does nothing" was "about the box the eye rests INSIDE".

The gesture's comment and rules ran `select.css:68-93` at `39f3884` (the rules alone :75-93; the floating section's map cites :66–93). The trigger held the button's press for as long as its panel was open.

#### Toggle and ToggleGroup

A Toggle wore `kui-control kui-button kui-toggle`, so the rise, sink and ring arrived by membership.
**Refused**: "a pressed toggle HOLDING the press travel (proposed on Button's latched-trigger rule,
refuted: that rule exists to still a panel hanging from the trigger, and a toggle hangs nothing — a
pressed Bold sitting 1px lower than Italic beside it would read as a misprint)" (DECISIONS §34) — principle
12 held here. (The token was 2px; see [Stale or conflicting text at 39f3884](#stale-or-conflicting-text-at-39f3884).)

#### Where the travel was stood down: SplitButton, ButtonGroup, NumberField

The halves did not travel: `.kui-split-button > .kui-button.kui-button { translate: 0 0; scale: 1; }` —
"A button rises and sinks because it sits on the page; half of one moving alone would tear the box at the
seam. The fill still lights and presses." (split-button.css:24-29). ButtonGroup: "The buttons do not
travel: one moving alone would tear the box at the seam." (button-group.css:46-50)

NumberField's steppers were zones of the field: the quiet rung's fill states and the disabled remap reached them, "and the rise and sink never do (measured before, the stepper rose 0.989px and sank 2px, carrying its glyph away from the value)" (DECISIONS §51 at `39f3884`; [Appendix A](#a-decisionsmd-passages-moved-out)).

#### The field family (TextField, TextArea)

- **A field does nothing.** Its box never travelled or scaled; asserted by a mounted law with a real
  pointer ("nothing on it travels or scales under a real pointer, and the seal holds",
  motion.browser.test.tsx:357). Its paint still rode the skeleton's paint clock.
- **The ring was instant, by measurement (2026-08-10).** It shipped for about an hour "emerging from the
  box's own edge — the same property travelling the opposite way, which is the right story for a focus
  you ENTER". Kushagra: *"it grows in steps, like so jaggedy"*. "Chrome resolves `outline-offset` to whole
  CSS pixels, so a ring animation renders one frame per pixel of travel however long its clock is.
  Measured: the field's 2px of room is exactly three values (0px, 1px, 2px) across 49 frames. … The
  landing survives only because it travels twice as far — 6, 5, 4, 3, 2 — enough to read as movement on
  the same 260ms. **So the ring's travel is bounded below by the engine at about 4px**". Rejected: "a
  colour fade (the common answer — Stripe, shadcn, macOS), because a ring is a truth claim … and because
  it mixes paint into a channel that is otherwise pure geometry; Material's thickening outline, because our
  border sits on the wrapper and a width change moves the value inside it by a pixel. Starting the ring
  *under* the border — a bigger image, more travel — is recorded unbuilt." (LOG 2026-08-10 "Hover reaches the boundary…")
- **2026-09-10, Chromium 141**: "the same arrival renders **96 distinct sub-pixel stations** … The refusal
  stands until it is re-judged on a real screen, because whether a field's 2px reads as motion is a taste
  call … what has changed is that it is now conservative rather than forced." (DECISIONS §8)

#### The interactive surface: card-as-button

Asked plainly — *"is there any component left that doesnt have our motion principles?"* — the answer took
a measurement: `<Card render={<button/>}>` computed `transition-duration: 0s` and `translate: none` beside
a Button's `0.22s paint / 0.55s geometry`. "It is a dating artifact, not a decision": card-as-button
shipped 2026-08-03 and the motion system was written against `.kui-control`.

Kushagra: *"should work like button, but because of larger area, perhaps a little different physics."*
The surface got the control block verbatim under its own stem (surfaces.css:1332-1418 @39f3884):
`--kui-sf-paint` / `--kui-sf-move` / `--kui-sf-move-ease`, the same hover rise (`--hover-travel`, "one
pixel means the same thing on a card as on a button: it is an absolute distance, not a ratio"), and the
same `kui-ring-land` arrival through `--kui-sf-ring`. Only the press distances were its own:
`translate: 0 var(--press-travel-surface)` (1px) and `scale: var(--press-scale-surface)` (0.995).

- "Scale is relative and these boxes are not the same size: a ~64px button at 0.975 moves each edge 0.8px;
  a 400px card at the same factor moves each edge 5px, which reads as the page flexing. 0.995 puts a 400px
  card at 1.0px per edge — matched on EDGE MOVEMENT". "The sink is halved for the same reason a heavier
  thing moves less under the same push."
- **A second spring was refuted by arithmetic before it was built**: "§24's 'mass forbids overshoot' … argues
  for `poised` over `lively` on a big box. Then: lively's overshoot is 10.7%, the travel is one pixel, and
  10.7% of a pixel is a tenth of a pixel." (0.2px for the scale channel on a 400px card.)
- Rejected: paint-only ("a card that changes colour but does not answer the finger is not a stated refusal,
  it is a button missing half its feedback").
- `resolveHooks` in recipes.test.ts knew only `--kui-ct-`, so the surface's channels "read as unsprung and
  hand-typed"; widened to both private stems. +74 bytes gzipped. (LOG 2026-08-17 "The one component with a
  full state machine and no motion was the card you can press")
- A dead interactive surface (2026-08-22) stood the motion down on the same selector: `translate: 0 0;
  scale: 1` in the dead arm, winning the (0,2,0) tie on source order (surfaces.css:1510-1516). A label-card
  holding a control got the same arm at (0,3,0).

#### Accordion

- **Panel**: `.kui-accordion-panel { box-sizing: border-box; block-size: var(--accordion-panel-height, auto); overflow: clip; transition: block-size var(--motion-travel) var(--motion-spring); }`,
  — and the `box-sizing` is quoted because leaving it out of this record is what made it easy to
  lose: the rule was deleted whole at the removal, which took a declaration that had nothing to do
  with motion. `AccordionPanelProps` admits `style`, so with the panel stating no box a caller
  writing `block-size: 120px; padding: 20px` on it rendered 160px rather than 120. Restored on
  2026-09-20, motion and clipping not; this package declares the reset per family and never
  globally, so an unstated family is the one that differs.
  zero at `data-starting-style`/`data-ending-style` (accordion.css:207-216). Base UI published
  `--accordion-panel-height`. `clip`, never `hidden` ("a hidden box is a scroll container, and a focus
  inside a closing panel would scroll it").
- **Chevron**: `rotate: 0deg` → `90deg` on `[data-panel-open]`, `transition: rotate var(--motion-mark) var(--motion-spring)`;
  RTL mirrored with `scale: -1 1` and turned `-90deg` because the individual transforms compose R·S (the
  tree's 2026-08-26 finding).
- **The heading's hover** was the label's underline (`text-decoration-color` from `transparent` to
  `currentcolor`) on the paint clock, and `:active` showed it unguarded so touch had feedback.
- **The 2026-09-01 audit**: the underline's `transition` "was copied verbatim from `link.css`, where the
  element is not a control — a shorthand, so it REPLACED the skeleton's five channels with one" (measured
  `text-decoration-color / 0.12s` against a Button's `0.22s … 0.55s`). The trigger now restated the full
  list plus `text-decoration-color` (accordion.css:110-132), and a law derived it from a mounted Button.
- Stand-down on trigger, chevron and panel (accordion.css:228-236).

#### Tree: the one disclosure that never moved

The Tree's disclosure chevron turned 90° on `[data-expanded]` with no transition: "`rotate`, not
`transform`, so a future motion pass can spring the channel without restating the pose" (tree.css:63-67).
The Accordion reused the same glyph and did spring it.

### Marks and grips

#### The mark squash, and why a mark states no resting transform

```css
.kui-mark:where(:not(.kui-control *, .kui-switch)):active:not([data-disabled]) {
  scale: var(--press-squash);
}
```
(recipes.css:531 @39f3884)

- "A pressed mark SQUASHES — it has no depth to sink into." Scoped like the invisible target: a mark
  inside another control does not answer, "because the press belongs to whatever contains it."
- **The switch was named out** (Kushagra, 2026-08-09: *"why does switch even have scale on press?"*):
  "A checkbox and a radio ARE their glyph's box … A switch is a channel with a grip in it: its press
  belongs to the THUMB … Squashing the track as well shrinks the channel the thumb is crossing."
- **No resting `scale: 1`.** "Any non-`none` transform value makes the element a containing block AND a
  stacking context, and a mark's target is a pseudo-element that deliberately paints OUTSIDE its own box:
  give every mark a stacking context and a later sibling's expander paints over an earlier sibling's
  paint, which is the exact hit-test the 12px stacking rule exists to prevent … Five laws caught it.
  `none` interpolates as the identity, so the squash still springs; the context now exists only while the
  mark is actually held." (recipes.css:524-530; LOG 2026-08-09 "Motion reaches the control layer…")
- The squash rode the shared press clock (84ms stiff) down and the lively recovery (330ms) back.

#### Checkbox: the tick is drawn

```css
.kui-checkbox-check, .kui-checkbox-dash {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset var(--motion-mark) var(--motion-spring);
}
/* retracted, instantly, wherever the glyph is not the one the state means */
… { stroke-dashoffset: 1; transition-duration: 0s; }
```
(checkbox.css:34-58 @39f3884)

- `pathLength={1}` on both paths: "Normalised so CSS can draw the stroke without measuring it (§8): with
  pathLength 1, a dash array of 1 spans the whole glyph whatever the viewBox or the size" (checkbox.tsx:121-123).
- "A checkmark that appears whole is a state being reported; one that draws is the gesture being
  answered". "It draws IN and never OUT … nobody watches a tick un-draw, and the box is already empty by
  the time the eye gets there".
- Base UI's indicator was `keepMounted`, "because the alternative is styling an element that is not
  there: … no glyph to transition from when motion lands" (checkbox.tsx:104-107).
- Draw: 380 → 228ms on calm. Squash while held: see [The mark squash, and why a mark states no resting transform](#the-mark-squash-and-why-a-mark-states-no-resting-transform).

#### Radio: the dot arrives

```css
.kui-radio > svg > circle {
  transform-box: fill-box;
  transform-origin: center;
  scale: 1;
  transition: scale var(--motion-mark) var(--motion-spring);
}
.kui-radio > svg[data-unchecked] > circle { scale: 0; transition-duration: 0s; }
```
(radio.css:31-40) — "`transform-box: fill-box` so the scale pivots on the dot rather than on the SVG's own
origin, which would slide it out of the mark while it grew." "In and never out … watching the old one
deflate would put the eye on what was just abandoned."

#### Switch: the benchmark

- **Drawn by both edges (2026-08-09).** "`inset-inline-end: auto` cannot be animated to, so a thumb pinned
  by one edge could only ever teleport." Both inline insets became lengths:
  `--kui-sw-gap: calc(var(--switch-inset) - var(--border-width))`,
  `--kui-sw-d: calc(var(--kui-ct-mark) - 2 * var(--switch-inset))`,
  `--kui-sw-far: calc(100% - var(--kui-sw-gap) - var(--kui-sw-d))`; checked swaps which end is near
  (switch.css:94-148). The crossing: `transition: inset-inline-start var(--motion-travel) var(--motion-spring), inset-inline-end var(--motion-travel) var(--motion-spring)` — 420 → 252ms, calm.
- `aspect-ratio: 1` came off: "the four insets close the square by construction, and left in place it
  silently outranked the lean, so the grip could not stretch at all. Its own law caught that". The corner
  changed from `50%` to a stated half-diameter "because 50% of a leaning (non-square) box is an ellipse".
- **The lean.** `.kui-switch:active:not([data-disabled]) .kui-switch-thumb:where(:not([data-checked])) { inset-inline-end: calc(var(--kui-sw-far) - var(--thumb-lean)); }`
  and the mirror for checked (switch.css:168-173). "The near edge stays planted and the far edge reaches
  out … the single most-praised thing in the whole motion pass". Kushagra: *"switch might travel but it
  doesnt scale the thumb like our example did, why did we spend hours refining that?"* — "The lean was 3px
  against a 20px grip, a seventh of it, where the judged demo stretched about 38% — invisible", and it was
  keyed on the thumb's own `:active`, which "matches the element being activated and its ANCESTORS but
  never its descendants: pressing anywhere on the track except the grip itself did nothing at all." Six
  pixels was "that fraction at the small end of the ladder and a quarter at the top. A designed set per
  size is the next move if the eye wants it even across the range." (config.ts:1009-1021)
- The `:not([data-disabled])` guard was added 2026-08-26: "the root is a `<span role="switch"
  aria-disabled>` … so `:active` matches a dead switch exactly as it matches a live one."
- A comment above the checked rule still read, at 39f3884: "Position, not transform, because no
  transition ships until the motion system lands (§8) — the jump is instant either way, and the motion pass
  will own how this travels." (switch.css:141-144)

#### Slider: distortion on the hold, physics on the travel never

```css
.kui-slider-thumb { transition: scale var(--kui-ct-move) var(--kui-ct-move-ease); }
.kui-slider-thumb[data-dragging]:not([data-disabled]) {
  scale: var(--press-squash);
  --kui-ct-move: var(--motion-press);
  --kui-ct-move-ease: var(--motion-spring-stiff);
}
```
(slider.css:166-190 @39f3884)

- "During a drag the pointer IS the physics — Base UI writes the position inline, and a spring between
  finger and grip is lag on a direct manipulation … so the grip's transition carries exactly one channel,
  `scale`, and a mounted law holds the computed list at one."
- Keyed on `data-dragging` (stamped "from the first pointerdown frame — thumb press or track grab alike —
  and it survives the pointer leaving the strip under capture, which `:active` is not guaranteed to").
- On a range slider both grips squashed while either was held (Base UI "writes no per-thumb active
  attribute").
- Honesty about the clock restate: "the sabotage pass proved the restate redundant on every grab a
  desktop harness can drive … so it stands on the touch-timing argument, not on a measurement."
- Open: "Keyboard-step and track-tap easing stay open with the eye-pass list: a discrete jump has no
  pointer to track and could ride the recovery spring, iOS's own answer." (LOG 2026-08-10 "The grip squashes…")

### The travelling highlight

#### What it was

"One object drawn by its two inline edges, and the edge FACING the destination takes the shorter clock —
320ms against 480 — so the highlight stretches toward the tab you picked and gathers itself as the far edge
catches up. Both edges ride `calm` … the character is one spring and the asymmetry is entirely in the two
durations, which is the only shape that keeps damping sacred (§8). Two edges on one clock is a photograph
being slid, which is the motion this replaced." (DECISIONS §26) Judged in Kushagra's "Clip vs Physics"
bench "where the same recipe sits beside the 250ms both-edges-on-one-clock version it replaces". Measured:
"a tab rule resting at 56.9px peaks at 125.7 mid-flight and settles at 94" (CLAUDE.md). `travel` (420, the
switch's crossing) was not reused: "a highlight moving a whole segment's width is a different distance
answering a different question". Emitted 192ms / 288ms after 2026-09-14.

"Why two clocks and not a livelier spring … Giving the leading edge a bouncier curve than the trailing one
would put two different damping ratios on one object, which rings". (LOG 2026-08-23 "The traveling highlight…")

#### Direction

"Direction is the one fact CSS cannot see — a stylesheet knows the value a property animates TO and never
the value it left — so it is stamped." Tabs got it free: Base UI's `Tabs.Indicator` published
`data-activation-direction`, "including the `none` that is exactly the first paint, so the whole of Tabs'
motion is CSS and the component gained no JavaScript at all." The segmented control wrote the same
attribute itself. `none` matched neither direction rule, so the element had no clock and was PLACED; and
"`transition-property: all` never covers a custom property, so the unstamped state cannot accidentally
animate the registered pair." (DECISIONS §26; segmented-control.css:279-293)

```css
.kui-tab-rule[data-activation-direction="right"] {
  transition: --kui-tab-right var(--motion-travel-lead) var(--motion-spring),
              --kui-tab-left  var(--motion-travel-trail) var(--motion-spring);
}
.kui-tab-rule[data-activation-direction="left"] {
  transition: --kui-tab-left  var(--motion-travel-lead) var(--motion-spring),
              --kui-tab-right var(--motion-travel-trail) var(--motion-spring);
}
```
(tabs.css:253-263; the segmented thumb and shell bar thumb had the same pair on `--kui-seg-*` and `--kui-bar-*`.)

#### Tabs: the rule's two edges, and the derived right edge

- 2026-08-18: shipped drawn by both inline edges ("two edges can travel at two speeds … it costs the same two
  declarations now"). Physical `left`/`right` "because Base UI's measurement is physical and a logical
  pairing puts the rule on the wrong side of an RTL bar."
- 2026-08-19: reverted to `left` + `width`. "Base UI computes `--active-tab-right` as `scrollWidth − left −
  width`, in the tab list's SCROLL coordinate space; CSS resolves an absolutely positioned box's `right`
  against its containing block's PADDING box." "Measured, four ordinary tabs in a 200px column: the rule
  rendered ZERO pixels wide". Kushagra: *"why is this controversial? whatever everyone else does."*
- 2026-08-23: two edges again, with the right one DERIVED: `calc(100% - var(--active-tab-left) - var(--active-tab-width))`
  — "the pair Base UI computes in ONE space … against the `100%` that IS the containing block. Measured on a
  bar overflowing by 61px: the rule spans 91.69 against a 91.67 tab, where the old spelling drew 0."
- The rule was paint with `pointer-events: none` (2026-08-26: `elementFromPoint` over the bar's bottom rows
  had returned the rule).

#### SegmentedControl: the thumb element and `useTravelingThumb`

**Everything in this subsection except the flight survived the removal.** The element, the `max()` floor, the `[hidden]` gate, the observers and the measurement are all still shipped; the hook is `useThumb` now, and what it no longer writes is `data-activation-direction`. Why it was kept, and the 342-state measurement that kept it, are in [The exceptions](#the-exceptions-to-no-js-at-interaction-time).

- 2026-08-18: shipped with NO indicator: "a gliding thumb here means writing the measurement ourselves — a
  mechanism whose only consumer is a motion that has not been designed … the curtain, deleted 2026-08-17".
  Its comment left the door open: *"when the motion pass wants one object gliding between homes, the
  measuring hook arrives with it."* (DECISIONS §26)
- 2026-08-23: `.kui-segment-thumb` became one absolutely positioned grip (`inset-block: var(--segment-inset)`,
  `left`/`right` from the measurement, the segment's concentric corner, `--color-thumb` fill, the grip's cast)
  and the chosen segment "gave up its fill … the segment keeps only its ink — which switches INSTANTLY while
  the box travels, §8's split rather than an oversight."
- **The measurement is the fourth bounded exception** (segmented-control.tsx:55-253). "Arithmetic over an
  index was the alternative and it is wrong, measured": `flex: 1 1 0` gave "425.3 / 425.3 / 425.3" for three
  labels while the track sized itself, but in a 200px box `min-width: auto` bound on the longest label
  ("62.0 / 62.0 / 72.0 … where the arithmetic answers 65.3 and puts the grip ten pixels off its seat").
- It read `getBoundingClientRect` for the track and the chosen seat, corrected by fractional border widths
  from `getComputedStyle`, and divided out an ancestor's visual scale (see [Defects around it](#defects-around-it)); wrote
  `--kui-seg-left/right` inline and `data-activation-direction` (`none` for first paint, resize, or no
  movement; else `right`/`left` by comparing the new left to the previous one).
- Watchers: a `MutationObserver` on `data-checked` in the subtree (because "an uncontrolled `RadioGroup`
  holds its value inside Base UI and never re-renders this component"); a `ResizeObserver` on the track and,
  from 2026-08-26, on every seat (a seat can move while the track's box does not); a `MutationObserver` on
  `childList` to watch new seats; a `WeakSet` so a seat is never re-observed ("WOULD re-fire and rewrite a
  live flight's direction to `none`"). "A MutationObserver's callback runs at the microtask checkpoint,
  before paint, so the placement lands on the same frame the stamp did."
- The thumb was `[hidden]` until first measured; that was "the one guard" against an unmeasured paint.

#### The walls (2026-08-25)

Kushagra, from the bench beside the glass preview: the bench's end segments *"do not leave container, and
yet in our implementation, it does"* — then *"only happens in glass btw."* Measured identical in both:
"the grip's edge **14.11px outside the track at t=170ms** on a full first-to-last jump across a 360px
track … because the calm spring's ~6.8% overshoot is ~16px of a 236px travel and the 2px channel inset
absorbs almost none of it. Glass only made it visible". The bench's own principle: *"a lean can never cross a
boundary: it always points inward"*.

**The wall was geometry, not a second spring.** The spring moved onto registered custom properties and the
painted inset floored it with `max()`:

```css
@property --kui-seg-left  { syntax: "<length>"; inherits: false; initial-value: 0px; }
@property --kui-seg-right { syntax: "<length>"; inherits: false; initial-value: 0px; }
.kui-segment-thumb {
  left:  max(var(--kui-seg-left),  var(--segment-inset));
  right: max(var(--kui-seg-right), var(--segment-inset));
}
```
(segmented-control.css:224-257)

- "An unregistered custom property transitions *discretely*, so the registration is what makes a spring
  expressible on one at all." Interior flights never reached the floor and were byte-identical; a flight into
  an end seat "has its leading edge arrive at the wall and hold while the trailing edge is still flying on its
  own clock, so the overshoot is spent as a squash against the wall."
- Rejected: "`overflow: clip` on the track (pins the visible edge at the BOX rather than the channel … shaves
  the grip's always-cast, and is the bench's rejected side by name); a non-overshooting curve (`stiff`/`poised`)
  on wall-bound flights (the component would have to know its destination is an end seat, and §8's 'one
  character, the asymmetry entirely in the durations' dies with a per-destination spring)."
- The registration made the old `var(--kui-seg-left, var(--segment-inset))` fallbacks unreachable; they were
  deleted ("a fallback chain is only a mechanism if every arm is reachable").
- The existing "thumb sits exactly on the chosen segment" law failed, and its fixture was wrong: squeezing the
  track to 0.55 × natural put "the SEATS themselves" outside the channel (seg[0] 15.5px left of the track).
- **Tabs (same day, Kushagra: *"lets fix tab too"*)** needed an ADAPTIVE floor, `min(target, 0%)` per edge,
  because on an overflowing bar "a tab's resting `right` inset is legitimately negative" and a static floor
  "would re-commit the 2026-08-19 coordinate regression as a clamp":
  ```css
  @property --kui-tab-left  { syntax: "<length-percentage>"; inherits: false; initial-value: 0px; }
  @property --kui-tab-right { syntax: "<length-percentage>"; inherits: false; initial-value: 0px; }
  --kui-tab-left-target:  var(--active-tab-left, 0%);
  --kui-tab-right-target: calc(100% - var(--active-tab-left, 0%) - var(--active-tab-width, 0%));
  --kui-tab-left:  var(--kui-tab-left-target);
  --kui-tab-right: var(--kui-tab-right-target);
  left:  max(var(--kui-tab-left),  min(var(--kui-tab-left-target), 0%));
  right: max(var(--kui-tab-right), min(var(--kui-tab-right-target), 0%));
  ```
  (tabs.css:172-219). "One name cannot be both the spring and the target, which is why the fact needs two."
  Deliberately kept: a flight to the last tab of a bar the tabs do not fill "stretches ~14px past the last
  label ALONG the hairline and gathers back — ink on a rail, and the rail continues".
- +42 bytes for the segmented walls; CLAUDE.md records "+57 bytes across both".

#### Defects around it

- **The grip covered its own label (2026-08-23).** The JSX claimed document order painted the thumb under
  the segments. "Within one stacking context CSS paints in-flow non-positioned content in steps 4-7 and
  positioned descendants in step 8". Measured with `elementFromPoint` at the label's centre: it returned the
  thumb. Every colour law was green, "correctly so". Fixed with `position: relative` on the segment, no
  `z-index`. (LOG 2026-08-23 "The grip painted over its own label…")
- **A tab touched its hairline (same day).** Kushagra: *"a little shorter than control, it is 28px on 32px
  control, same size as menu rows, so we have precedence. We need the same for tabs"*. Tabs became 24 / 28 /
  36 / 44 against a Button's 28 / 32 / 40 / 48 via `tabInset`, block padding only, because inline padding
  would shift every rule (the indicator measures from the border box).
- **The chosen segment's hover wash (same day).** *"is on top, so as I click on a segment, and it animates,
  the hover continues to stay, which doesn't wobble btw, making it look very weird."* The old triple pinned
  at `--color-thumb` "was carrying TWO facts at once: what colour the grip is, and the rule that a grip does
  not fill"; moving the colour deleted the rule, and the segment painted "`color(srgb 0 0 0.0588235 / 0.067)`".
  Fixed by pinning all three sources `transparent`. "When a declaration is moved, ask what ELSE it was
  saying." (LOG 2026-08-23 "A re-key that moved a colour and left its rule behind")
- **Three measurement defects in the first hook (2026-08-23).** The effect was keyed on renders and fired
  once per lifetime ("the thumb held 56.9px while another segment was genuinely checked"); `clientWidth`/
  `clientLeft` are integers, so the grip "sat 0.5px narrow on one side only"; and "the `ResizeObserver`
  fired the moment it was observed, which rewrote the direction to `none` a frame after every selection —
  removing the transition and teleporting the grip" (56.9 → 68.4px in one frame). A width-comparison guard
  fixed the teleport, then became unfalsifiable once the effect stopped being keyed on renders, and was
  deleted after three sabotage passes changed nothing across 38 laws.
- **Measured through an ancestor's scale (2026-09-01).** Kushagra: *"in segment control, when opening it for
  the first time, theres an overlap between two values, but once I click something, then it corrects the size
  of each thumb."* Inside an overlay's scaled entry the first placement wrote "38.074 / 74.248" where the true
  insets were "40.078 / 78.156 — the same numbers times 0.95", leaving the grip "5.9px wider than its seat".
  "Layout width held at 156 for every frame of the entry while the rect went 148.5 → 156.3". The fix divided
  out `rect.width / layoutWidth`. `offsetWidth` (integer: 156 for 156.312) gave a phantom 1.002; adding
  paddings to a border-box `width` gave 1.02 and "failed six laws". Laws: an agreement (scaled and unscaled
  write the same lengths) with a vacuity guard (`expected 115.8 to be less than 114.8` when the fixture's
  scale was 1). "Whether Base UI's tab indicator has the same fault one component over is UNVERIFIED."
  (LOG 2026-09-01 "A box mid-flight is not its own size…")

#### The shell's tab-bar grip (2026-09-09)

When the rail met a narrow window as a tab bar, "The chosen tab is the segmented control's travelling grip,
self-keyed as its second member (§26): measured insets, the edge facing the destination on the shorter
clock, the calm spring, and the bar's padding as the wall an overshoot squashes against. **Its width is ONE
width, read from the widest label in the bar rather than the current one**, so it does not resize as it
flies" (Kushagra: *"I dont want layout shift like removal of ellipsis when thumb comes on it"*). CSS:
`left: max(var(--kui-bar-left), var(--layout-space-2))`, the same lead/trail pair on `--kui-bar-*`
(shell.css:2081-2115), stood down at shell.css:2745-2748. (LOG 2026-09-09 "A rail meets a narrow window as a tab bar")

**It survived the removal with its sibling**, for the sibling's reason: the grip element, `useBarThumb`'s measurement, the one width and the `max()` floor are all still shipped, and what went is the pair of clocks and the spring. The two spellings diverged for a day and were brought back together on 2026-09-20: the segmented control had dropped its `@property` registration for `var(--kui-seg-left, var(--segment-inset))` while `--kui-bar-left/right` stayed registered, leaving shell.css's comment describing "two registered insets" as "the segmented control's own mechanism" that the segmented control no longer had. Registration is what made a spring expressible on a custom property at all, but it was never its only reason: `inherits: false` keeps a length private to one thumb out of anything nested in it, and an initial value retires a fallback arm the 2026-08-07 rule would otherwise oblige us to keep reachable. Both members register the pair and read it bare; segmented-control.css carries the argument and shell.css points at it.

#### Not built

From principle 16 and the bench: "the press LEAN and the grabbable segment … Both are interaction models
rather than motion — the lean needs a pointerdown handler on every segment and the drag needs pointer
capture, hit-testing and a snap". The keyboard was NOT exempted, "a deliberate departure from the bench":
"arrow keys here move exactly one position, so nothing is crossed that was not passed through. Exempting
them would cost a modality listener at interaction time … Reopen it if a keyboard jump of more than one
ever exists." (DECISIONS §26; LOG 2026-08-23)

### The floating family and its runner

This layer and the two after it cover every panel that appeared over the page: the anchored panels that flew out of a trigger (Menu, submenus, ContextMenu, Select, Combobox, Popover, Tooltip), the command palette's results pane, the overlay panels anchored to nothing (AlertDialog, Dialog), their scrims, and the two kinds of drawer (the Shell's overlaying panes and `Sheet`). Durations are given as the judged config value, then the emitted token value; distances and scales were not multiplied by `motionSpeed`.

Three entrance grammars lived here, and choosing between them was most of the design work:

- **The silhouette flight** (anchored panels). The panel's first frame was the trigger's own box, sitting on the trigger. It then unfurled into its own box on springs. JavaScript measured the destination. (DECISIONS §22, §8)
- **The materialization** (AlertDialog). A small circle of surface rose from below the panel's footprint and grew into the measured card. (DECISIONS §25)
- **Depth, not distance** (Dialog, and Popover since 2026-09-14). The landed box stepped forward 3% in z. There was no travel and no measurement. (DECISIONS §24, §31)

Drawers had a fourth grammar: **a slide**. The distance was the pane's own width, so nothing was measured (DECISIONS §27, §49).

The anchored panels are this layer; [The overlay family](#the-overlay-family) and [The drawers](#the-drawers) follow it.

#### Where it lived

| Concern | File and location |
|---|---|
| The one entry runner (`useFlight`), the plans, the body elements, the width floor, the resting anchor, `useStatedFlight`, `SIDE_OFFSET`, `FLIES_ANYWAY` | `packages/ui/src/system/floating.tsx` (2,112 lines). Motion starts at :250 |
| The family's flight CSS: pose, aim gate, pins, body, exit, `[data-instant]` stand-down | `packages/ui/src/system/surfaces.css:2486–3253` |
| The alert's materialization, the pointer-events keep-alive, Dialog's depth entry, the reduced-motion block | `surfaces.css:3254–3545` |
| The width floor (`kui-floating-anchored`) that the flight had to stand down | `surfaces.css:681` |
| The per-axis pin inset (`--kui-sf-p-block/-inline`) | `surfaces.css:155–156`, tooltip override `:699–701` |
| `@property` registrations for flight hooks (`--kui-body-sink`, `--kui-seed-dx`, `--kui-seed-dy`) | `surfaces.css:92–110` |
| Member sheets | `menu.css` (no motion of its own), `select.css:66–93` (the trigger's press, held while open), `combobox.css:59–92`, `popover.css:52–149`, `tooltip.css:103–237`, `command.css:419–583`, `dialog.css:24–56` (scrim) and `:224–260` (sheet arm with no motion), `alert-dialog.css:10–33` (scrim) |
| Drawers | `components/shell/shell.css:146–277` (frame clip), `:558–905` (drawer, push, well, plane, parking, scrim), `:2140–2280` (narrow-window restatements), `:2734–2752` (reduced motion); `components/sheet/sheet.css` (197 lines) |
| The lens's flight deferral | `packages/ui/src/system/refraction.tsx:1201–1285` (target box), `:1426–1476` (`measureUnlessFlying`) |
| Config | `packages/ui/src/tokens/config.ts`: `motionSpeed` :780, `motion` :782, `springs` :813, `floatingSeed` :1035, `floatingEcho` :1040, `floatingMotion` :1042, `overlaySeed` :1100, `overlayLift` :1109, `overlayEcho` :1115, `dialogMotion` :1129, `dialogEntry` :1145, `printBlur` :1162, `overlayMotion` :1164, `floatingMinWidth` :1614, `tooltipMotion` :1657, `tooltipEntry` :1674, `scrim` :1700, `shellDrawer` :1891 |
| Emission | `packages/ui/src/tokens/generate.ts:120` (`ms`), `:143–182` (`springAt`, `springCurve`), `:355–428` (motion tokens) |
| Components using the runner | `menu.tsx` (`FloatingBody`, `useRestingAnchor`, `panelSeam`, `ContextMenu` `seedSize`), `select.tsx` (`SelectBody`), `combobox.tsx` (`ComboboxBody`), `popover.tsx` (`FloatingBody`, `useRestingAnchor`), `tooltip.tsx` (`FloatingBody`, `DELAY`/`CLOSE_DELAY`), `alert-dialog.tsx` (`OverlayBody`), `dialog.tsx` (plain `.kui-dialog-body`, no runner), `command.tsx` (`useStatedFlight`), `sheet.tsx` (Base UI Drawer; `swipeDirectionFor`) |
| Judging surfaces | `apps/docs/app/preview/motion-panel.tsx` (the motion bench, 2026-08-22), `apps/docs/app/lab2` (the dialog mass strip), `apps/docs/app/preview/lens-bench.tsx`; the 2026-08-09 `apps/docs/app/motion-lab` route no longer existed at 39f3884 |
| Test instruments | `packages/ui/src/test/browser.tsx` (`inMotion`, `asksForStillness`, `settle`, `settleAll`, `sweep`, `catchDissolve`, `holdPress`, `flushFlight`, `watchesFrames`, `KUI_STALL`), `packages/ui/src/test/frames.test.ts` (the CI-exclusion registry); `seizeFlight` and `watchPose` lived in `menu.browser.test.tsx` |

#### The anchored entry: the runner (`system/floating.tsx`)

Two runners were written five days apart: the anchored one (2026-08-09/10) and the alert's (2026-08-15/16). The 2026-08-16 audit found four defects that were *"nothing but the gap between the twins"*, and the two became one on 2026-08-16. The families differed in one thing: *"does it fly from the trigger that opened it"*. That question was asked three times in the runner and nowhere else (LOG 2026-08-16 "The dialog's entry locks on depth, and the audit before it collapsed two runners into one").

#### Plans and flags (`floating.tsx:392–467`)

`FlightPlan` had `popup` (family class), `body` (body class), and three flags:

- **`fromAnchor`**: fly from the trigger's silhouette (true) or rise in place from a designed seed (false).
- **`placedByContent`** (2026-08-17): the panel's placement depended on its own box. It was Select's, because Base UI's item-aligned overlap computed from the real box. The entry therefore waited for placement before posing. Posed first, *"the chosen row settled 66px below the trigger"*.
- **`followsContent`** (2026-09-12, audit C3): the content could change while flying. It was Combobox's (typing opens it). A `ResizeObserver` re-aimed the target height during the flight.

| Plan | popup / body | fromAnchor | placedByContent | followsContent | Wrapper |
|---|---|---|---|---|---|
| `FLOATING_PLAN` | `kui-floating` / `kui-floating-body` | true | false | false | `FloatingBody` (Menu, Popover, Tooltip) |
| `SELECT_PLAN` | same | true | true | false | `SelectBody` |
| `COMBOBOX_PLAN` | same | true | false | true | `ComboboxBody` |
| `OVERLAY_PLAN` | `kui-overlay` / `kui-overlay-body` | false | false | false | `OverlayBody` (AlertDialog only) |

Plans were module constants because the ref callback memoised on them: a fresh object per render would re-attach the mechanism.

Each wrapper was a `<div role="presentation">`. The role was added 2026-08-10 because an unmarked div between `role="menu"`/`role="listbox"` and its items was a structural violation. Select's law caught it; Menu had shipped the same hole the day before. The wrapper was *"mechanically forced"*: content cannot squish unless a box holds it. It was compared to Spinner's `<span>`. It also owned the width pin so text could not re-wrap mid-flight (`floating.tsx:1844–1856`).

#### Flight variables (`FLIGHT_VARS`, `floating.tsx:474`)

`--kui-fly-w`, `--kui-fly-h`, `--kui-fly-r`, `--kui-fly-bw`, `--kui-fly-bh`, `--kui-anchor-w`, `--kui-seed-w`, `--kui-seed-h`, `--kui-seed-r`, `--kui-from-x`, `--kui-from-y`. One list served both families and was stripped as a set at pose time and at release. The release kept `--kui-anchor-w` (see the width floor below). Before the 2026-08-16 unification the two runners used different names (`--kui-floating-w/h/bw` and `--kui-ov-w/h/bw`).

#### Attributes the runner wrote

- `data-seed` was the VISIBILITY gate: the pose was on.
- `data-unfurling` meant the FLIGHT: the pose's geometry applied, and the flight arrangement held.
- `data-aimed` meant placed. Until it was stamped the pose was transparent.

The split between `data-seed` and `data-unfurling` was forced on 2026-08-17. Select wore the gate through its placement window, and a pose keyed on the gate shrank the box the placement was measured from (58px of the 66px misplacement came from the body's squish alone).

#### Lifecycle, step by step

**0. When an entry began.** The entry ran per OPEN, not per mount (2026-08-10, Kushagra: *"animation on select only once. Next time, its instant"*). A select keeps its panel mounted forever after the first open, so a ref-keyed entry played once per node. The ref callback called `begin()` in the commit unless the popup was `hidden`. A kept-mounted panel that mounted closed reported every box as zero. A `MutationObserver` on the popup (`data-starting-style`, `data-open`, `data-ending-style`, with `attributeOldValue`) called `begin()` again on Base UI's per-open starting stamp. It called `begin()` for a kept-mounted reopen too, on the ARRIVAL of `data-open` (see the catch below). The first open began in the commit rather than on the starting stamp because *"Base UI writes [it] from a layout effect that runs after ref callbacks, one microtask too late for the pose to be the panel's first painted frame"* (`floating.tsx:1716–1720`).

**1. `begin()` (`floating.tsx:582`).**
- Returned at once under `prefers-reduced-motion: reduce`. *"Suppression is total"*: no pose and no measurement.
- Returned if `data-instant` was present and not in `FLIES_ANYWAY` (`click`, `dismiss`, `focus`; see [The `[data-instant]` stand-down](#the-data-instant-stand-down-surfacescss32503253)).
- Retired any previous flight on the same popup (`flights` WeakMap → its `release`). This happened only after the bails. Retiring above them *"meant a begin that could not fly still killed a live flight"* (2026-08-16 audit).
- Removed `data-aimed`, stamped `data-seed`, and stamped `data-unfurling` unless `placedByContent`.
- **Provisional aim** (2026-08-16, Kushagra: *"I click a dropdown menu and then it shifts page"*). An unplaced positioner sat at the document top (measured y = −2116 with the viewport at 2116). Base UI focused the selected row during that window and the browser scrolled the page to it. So `--kui-from-x/y` was written immediately as the trigger's rect against the popup's current rect. `data-aimed` was not stamped: the box moved, the paint did not. A summoned panel (ContextMenu) wrote 0/0.
- **Page hold.** If the trigger was fully in view, a `scroll` listener re-parked `window.scrollX/Y` for about four frames. It ran inside the scroll event, before paint. It was *"measured inert"* on 2026-08-23 (see [Open at removal](#open-at-removal)).
- Scheduled `poseAndFly`: in a microtask for ordinary panels, or through `whenPlaced` (up to 12 frames until the positioner carried `data-side` and the box's rounded top and height stopped changing) for `placedByContent`. A microtask ran after the commit's layout effects and before paint. A ref callback was too early: *"a half-laid-out sliver ~90px wide, and the flight targeted the sliver"*.

**2. `poseAndFly()` (`floating.tsx:770`): the measurement window.**
- Stood down if the panel had already landed by other means.
- Pinned `transition: none !important` inline on popup and body for the whole window. Reading a box flushes style, and without the pin the browser *"saw pose → natural … and began animating the panel BACKWARDS into its seed"* (2026-08-09).
- **Borrowed Base UI's inline `height`** (2026-08-17). An item-aligned select is `height: 100%` of a positioner Base UI sized. The inline value made the flight's block-size channel dead: *"panel 70px tall for every frame of an entry that was supposed to unfurl out of its trigger"*. It was removed for the flight and put back exactly as found. `!important` in the sheet was refused because *"it wins the cascade and leaves the library's intent unstated"*.
- **Borrowed the popup's inline `overflow` and read `scrollTop`** (2026-08-22). Base UI spreads `LIST_FUNCTIONAL_STYLES` (`position: relative`, `max-height: 100%`, `overflow: hidden auto`) as the popup's React `style` on the item-aligned path, so the stylesheet's `overflow: clip` never applied to a select.
- Stripped the pose and all flight vars, then measured whether the panel was laid out: the posed width (at the designed seed) against the natural width. At or under the pose meant *"not laid out yet"* and the entry bailed, handing back the borrowed height (a 2026-08-22 audit repair). The first spelling parsed `--floating-seed` off the cascade, got `calc(56px * var(--scale))`, `parseFloat` → NaN → `|| 0`. The guard meant `width <= 0` and was dead from 2026-08-10 to the 2026-08-16 audit.
- Removed Base UI's `data-starting-style` for good. The pose was the runner's own after 2026-08-10: re-adding it by hand stranded Select's panel at its seed, and under StrictMode made every menu *"a 40px circle and stayed one"*.
- **Wrote the seed**:
  - Summoned panel (ContextMenu, §42): `--kui-seed-w/h` = the point's size (0/0), `--kui-seed-r: 0px`, no anchor floor.
  - Anchored panel: `--kui-anchor-w` = `restingAnchorWidth(trigger, rect.width)`; `--kui-seed-w/h` = the trigger's real rect (the silhouette sits on the painted pixels); `--kui-seed-r` = the trigger's computed `border-top-left-radius`.
- Measured `natural` (popup rect) and `bodyBox` (body rect), subpixel, body first. `offsetWidth` rounds, and *"a third of a pixel was the whole difference between 'Alpha' fitting its row and wrapping"* (2026-08-09). Then wrote `--kui-fly-w/h`, `--kui-fly-r` (the resting corner, read here because a flying corner is mid-transition; added 2026-08-23 for the lens and later the tooltip pose), `--kui-fly-bw` and `--kui-fly-bh` (2026-08-29, for the centred body pin).
- **Pinned the positioner at the natural box** if it carried `data-side`, after snapshotting its inline width and height (2026-08-10, Kushagra: *"it opens and then as it animates it realises it must open on the other side, so it switches mid animation"*). The positioner shrink-wraps the popup, so collision was re-asked against every intermediate size and `data-align` flipped a third of the way in. The snapshot-and-restore spelling was a 2026-08-22 repair. The first spelling `removeProperty`'d both at release, which deleted the height Base UI sizes an item-aligned select by.
- Re-posed (`data-unfurling`, `data-seed`), re-wrote the provisional aim, wrote `overflow: clip` inline, and if there was a held scroll offset wrote it as a negative `margin-block-start` on the body. Forced a layout (`void popup.offsetWidth`) so the pose landed as the baseline while the pin held. Then removed the pin.

**3. `aim()` (`floating.tsx:1484`).** It ran in its own microtask, then again on the next frame, then on every positioner style mutation until departure.
- Returned until the positioner carried `data-side`. The runner had tried aiming inline during the unification: `data-side` was not there yet and the panel departed unaimed (*"5px off a bottom-start trigger and 43px off an end-aligned one"*). The first spelling of all measured synchronously and read a stale positioner transform (*"going all over the page lol"*, 2026-08-15).
- Called `fitPin()` and `fitSink()`.
- Wrote `--kui-from-x/y`: the trigger's rect against the positioner's rect plus the popup's layout offset (`offsetLeft/Top`, which a translate never moves).
  - A panel landing BESIDE its trigger (`data-side` of `inline-start|inline-end|left|right`) took x = 0 and dropped `--kui-seed-w`, so the seed fell back to the designed width (2026-08-17).
  - A summoned panel took x = 0 and y = the anchor point's y read from Base UI's `--transform-origin` minus the popup's `offsetTop` (2026-09-02).
- Stamped `data-aimed`. Until then the seed was invisible: *"one frame at x=2275"* was measured before this gate existed.

**4. The glue observer (`floating.tsx:1649`, 2026-08-25).** This was a `MutationObserver` on the positioner's `style` that re-ran `aim()` whenever floating-ui wrote a new transform, until the seed came off. A rAF re-aim lost when floating-ui's write landed after it and before paint: *"the seed paints one frame wherever the moved box left it — 200px off its trigger, at full opacity"*. A `MutationObserver` runs after the write and before paint.

**5. `depart()` (`floating.tsx:1579`).**
- If `fitPin` had corrected the positioner (`--kui-pin-fit` on the element), `depart` waited up to 10 frames for the positioner's rounded box to stop changing, re-aiming each frame (2026-08-25). *"the seed at 651 for a trigger at 450, and the flight ran from there"* was the defect.
- Disconnected the glue observer. Ran `fitToRoom()`. Removed `data-seed`, which started the flight: the base rule's transitions now applied.
- Armed `transitioncancel` and `followContent()` here and never earlier. A flight born while an exit was dying cancelled that exit's transitions, and a listener armed at `begin` read those as a dismissal (2026-08-16).
- Read the popup's computed `transition-duration` and `transition-delay`, took the maximum `duration + delay`, and set `setTimeout(release, max × 1000 + 50)`. The read happened after the pose came off, because the pose pinned `transition: none` and a posed read *"would see zero-length spans and release the flight at birth"*.
- Anchored panels spent two frames before departing (aim on frame 1, depart on frame 2). Unanchored panels (the alert) departed on the next frame. Taking the extra frame anyway *"left the alert still posed when its own exit law arrived"*.

**6. Release by the clock, never by `transitionend` (2026-08-10).** A select's trigger is often exactly as wide as its panel, so its width channel legitimately never fires; *"no channel is safe to wait on"*. `release()` (`floating.tsx:1334`) ran once and restored in an order that was load-bearing:
1. Disconnect the content watcher. Return if `data-unfurling` was already gone (the suite landed panels by stripping it).
2. Remove every flight var except `--kui-anchor-w`.
3. **Restore the positioner before the popup** (2026-08-22, Kushagra: after the entry *"settles, it scrolls down a bit internally, ever so slightly"*). The popup's restored height is `100%` of the positioner, so restoring the popup first pointed it at the parent's current value and the height transition carried it there. It was measured 349 → 353px, with the maximum offset falling 21 → 17. Put back the snapshotted width and height and remove `--kui-pin-fit`. A dead second `else if` arm for the item-aligned select was removed 2026-08-26: `data-side="none"` is present to `hasAttribute`, so the first arm always ran.
4. Restore the popup's borrowed height.
5. Restore `overflow` BEFORE `scrollTop`. *"a box that is still `clip` has nowhere to put a scroll position"*.
6. Remove the body's negative margin BEFORE setting `scrollTop`. A negative margin shortens scrollable content, so the reverse order clamped: *"it jumped 61px on the frame it landed"*.
7. Remove `--kui-body-sink` under a suppressed body transition, set `scrollTop`, remove `data-aimed`/`data-seed`/`data-unfurling`, force layout, restore the body's transition. Unsuppressed, *"the settled list sliding several hundred pixels after the flight had said it was finished"*.
8. Remove the `transitioncancel` listener.

**7. Dismissed mid-flight (`onCancel`, `floating.tsx:1446`).** A `transitioncancel` on the popup released the flight only if the property matched `FLIGHT_GEOMETRY` (`inline-size|block-size|width|height|translate|scale|padding|margin|border-*-radius`). Paint cancellations were ignored, because the exit restated geometry but not every paint channel (2026-08-16: *"measured at 169 → 303px inside two frames"*). The list named what geometry IS: *"an unlisted geometry channel costs a slightly late release … while an unlisted paint channel would retire a live flight"*. A cancellation on `block-size`/`height` that the runner itself caused through `followContent` was counted off (`selfRetargets`), because the event arrives at a later style update, so a flag cleared in a microtask would miss it.

**8. The reopen catch (`floating.tsx:1737–1845`).**
- 2026-08-16: a reopen mid-dissolve had no birth. Base UI flips the still-mounted popup back with `data-closed` off → `data-open` on → `data-ending-style` off and no starting stamp. The runner then REPLAYED the entry on `data-open` returning.
- 2026-08-20 reversal (Kushagra: *"on second quick click it does show wrong animation"*). Replaying teleported the panel: *"a panel dissolving at 355 x 98 and 58% opacity became 239 x 32 at full opacity in the next frame … With a short trigger the jump measures 358px → 64px"*. After the reversal a reopen was CAUGHT. No pose, no measurement, no flight. The ending stamp leaving took the exit's targets off and the paint clock carried the panel back. The discriminator was the ARRIVAL of `data-open` (`oldValue === null`): mid-dissolve the ending stamp was still on (catch); on a kept-mounted panel's ordinary reopen it was long gone (begin). Deleting the branch outright broke Select, whose law reported *"the entry ran once per lifetime"*.
- 2026-09-02 exception: a SUMMONED panel (ContextMenu) always began again, because its second gesture carries a new place. Measured, the catch moved the same popup *"289px inline and 155px block between two frames, at full opacity"*.
- 2026-08-25 (Kushagra: a constrained menu reopened *"scrolled"*; *"unable to fix it forever"*): on the REVOCATION edge (the ending stamp leaving while the panel was open) the popup's own `:scope > .kui-scroll-area > .kui-scroll-viewport` was reset to `scrollTop = 0`. It was anchored on the revocation because a reset at the arrival was undone as scaled content grew (*"0 at the arrival, 132 again by the next frame"*). The reach stopped at the direct-child chain, so a caller's ScrollArea inside a popover kept its offset. A select was untouched, because its offset was its placement.

**9. Cleanup.** The ref-callback cleanup disconnected the observer and called the current flight's release.

#### The width floor and `--kui-anchor-w`

The settled floor was `min(max(--floating-min-w, var(--kui-anchor-w, var(--anchor-width, --floating-min-w))), max(--floating-min-w, --available-width))` on `.kui-surface.kui-floating-anchored` (`surfaces.css:681`). Menu (top level only), Select and Combobox wore that class; submenus, ContextMenu, Popover and Tooltip did not. `--anchor-width` does not exist until Base UI places the panel, so the entry published its own number. On a first open the natural box *"measured content-only (~140px against a ~620px trigger) and the real floor landed only at release, the panel visibly re-expanding a beat after it felt done"* (`floating.tsx:913–921`). The two floors had to agree, and getting them to agree took five steps:

- **2026-08-10**: the entry measured the trigger synchronously per open and published `--kui-anchor-w`. LOG 2026-08-11 says this first reading took the rect *"on the open's first frame — before the held-press transition has visibly moved — so it reads the RESTING box"*. The floating.tsx comment at 39f3884 calls the later division *"the 2026-08-10 spelling, restored"*. No separate 2026-08-10 code snapshot exists (the 2026-08-09..11 work landed as one commit, `6af4bb8`).
- **2026-08-11** ("The panel compressed at release"): `heldAnchorWidth` predicted the HELD box: rect ÷ current scale × the end value of the trigger's running `scale` transition (read via Web Animations). It fixed a 402 → 392 step. The law had passed because `defaultOpen` is born holding the press.
- **2026-08-17**: `restingAnchorWidth` (rect ÷ computed scale). It was argued on the premise that Base UI 1.6 normalises the anchor rect by `getScale` (measured then: rect 83px at scale 0.975 against `--anchor-width: 85px`).
- **2026-08-22** audit, C2: that premise was false. `getScale` appears in `internals/useAnchorPositioning.js` zero times, and floating-ui divides by the offset parent's scale, never the reference's. The fix kept the division for a different reason: *"the press is a SPRING, so the scale at the instant the entry measures depends on how the panel was opened: a real pointer press has not started travelling yet (measured `scale: 1`, rect 400 on a 400px button) while a `defaultOpen` panel is already holding it (measured `scale: 0.975`, rect 351 on a 360px trigger)"*. It also KEPT `--kui-anchor-w` through release, because floating-ui kept re-measuring the anchor while the press travelled (*"`--anchor-width` walking 400 → 388 → 390 over ~350ms"*), and handing the floor back at release produced a 10px snap about 300ms after the box stopped (Kushagra: *"it jumps a bit in width at the end"*, twice). The sources are inconsistent about which date's spelling "removed" and which "restored" the division: the floating.tsx comment calls it *"the 2026-08-10 spelling, restored"*. The code history above is what shipped.
- **2026-08-23**: a guarantee that ran only in a CI-excluded law moved into a select law that ran on CI (LOG 2026-08-23 "A guarantee held only by a law CI does not run").

The flight stood the floor down for its whole length (`min-inline-size: 0` on `[data-unfurling]`, (0,3,0), beating the floor's (0,2,0)). On 2026-08-09 the floor had snapped every entry to 112px on the frame after the seed (*"w=40 → 112 in one step, then 112 for the rest of the entry"*; Kushagra: *"it starts at a certain width, left to the trigger, then it goes down and it shrinks, and then when it reaches the correct vertical position it expands again"*).

#### `useRestingAnchor` (`floating.tsx:356`, 2026-08-25)

A virtual anchor for the Positioner whose `getBoundingClientRect` returned the trigger's untransformed layout box. It inverted the individual `scale` and `translate` properties about the transform-origin: corner = layout + T + O·(1 − s), *"verified against a live press to the hundredth (layout 434.38 + 2 + 16·0.025 = 436.78 measured 436.77)"*. It stood down for a `transform` matrix. `contextElement` stayed the real trigger. It fixed a 2px pop of a constrained top-opening panel's top edge at release. Kushagra: *"Theres a small jumo still"*. The pair was proven first: press held gave a 2.00px delta, press neutralised gave zero. The cause stated was that the placement froze mid-spring *"— the pin stops the positioner's resize observer, and floating-ui's autoUpdate watches element resize and layout shift, never a transform"*.

- Consumers: Menu (2026-08-25) and Popover (2026-08-29).
- Not Tooltip: *"a tooltip's trigger is HOVERED for the whole life of the panel, so its 1px rise is a static fact"*.
- Not ContextMenu: its anchor is a point.

The visible cost was a static 2px larger gap under a pressed trigger. The 2026-08-31 performance assessment later refuted the stated cause: *"`observeMove` compares client rects, which include transforms, so the trigger's own press spring drives ~254 position solves per `defaultOpen` (78–86 on a real press)"*.

#### `fitToRoom`, `fitPin`, `fitSink` (the constrained-panel repairs)

- **`fitToRoom`** (2026-08-23, at departure). `natural` was measured in the microtask, while Base UI's seeded `--available-width/-height` still read `100vw/100vh`. A 40-item menu wrote `--kui-fly-h: 800px` for a panel that settled at 393.4. The box reached its real ceiling at about 56ms of a 460ms fall *"and then stands still, while `inline-size` … travels for another third of a second"*. That was the order §22 had reversed on 2026-08-09. It clamped (never re-aimed) the targets to the room. It was skipped when `heldHeight` was set, meaning Base UI owned the positioner's height (item-aligned select). Without the skip a 48-row select flew to 425 and jumped to 880 at release (Kushagra: *"this bug is back"*, within the hour). Departure was the last free moment: *"re-fitting every frame for twenty frames released the flight at frame five and snapped the panel open"*. Two alternatives were rejected: a CSS `min()` clamp (*"the panel was 144px of its 393 when the flight ended"*) and making menus wait like Select (a settle wait on every open). The recorded residue was about 2.4px (0.6%), taken at release.
- **`fitPin`** (2026-08-25, at the aim). The positioner pin still held the unclamped `natural`, so a top-opening panel's release frame showed *"one painted frame at top = -191 for a panel that rests at 5, a 196px flash"* (640 − 443.8). Kushagra: *"after animation completes, it jumps to correct position"*. It accepted only a `px`-suffixed room: `parseFloat("100vh")` is 100, and the first spelling pinned 100px and flipped the panel to the wrong side. It compared against the element's current inline pin, not a closure's snapshot, because `begin` could run more than once per open. It left `--kui-pin-fit` on the element for the departure gate.
- **`fitSink`** (2026-08-25, at the aim). A bottom-pinned body (top-opening, or side placement aligned end) held the list's LAST row at the seam, while rest was `scrollTop 0`. The release frame jumped by the overflow (*"the first row at -113 through the flight and 41 at rest"*; Kushagra: *"Just see the shift"*). The sink was the viewport's `scrollHeight − clientHeight`, measured on the rest state with clocks suppressed and written as `--kui-body-sink` (`@property <length>`, `inherits: false`, initial `0px`). CSS turned it into `transform-origin: … calc(100% − sink)` plus a constant post-scale `translate`. An inset sink was the first spelling and failed (*"a blank panel sliding into place"*). The sink had to be the transition's baseline, not a retarget; written at departure it animated *"a several-hundred-pixel slide of the whole list"*.

#### `followContent` (`floating.tsx:1306`, 2026-09-12, Combobox)

A `ResizeObserver` on the body, armed at departure and disconnected at release. It re-aimed `--kui-fly-h` (and the positioner's height, unless Base UI owned it) to natural height + (body height − measured body height), clamped by a `px` room, and ignored changes under 0.5px. Measured at 130ms per key: typing *"par"* left one row inside an 86px box that snapped 86 → 56 at release, and backspacing left nine rows inside a 146px box that could not scroll.

#### `useStatedFlight` (`floating.tsx:1989`, 2026-09-05, Command's results pane)

This announced a flight for a pane with no positioner and no runner, so the lens could build its map once for the landing box.
- It lifted the seed (`height: auto`) with transitions stood down and read `offsetWidth`/`offsetHeight` (the LAYOUT box).
- It published `--kui-fly-w/h/r` plus `data-unfurling`, and removed them on the height's `transitionend`/`transitioncancel` or a guard timer at fall + 200ms.

Three measurements shaped it:
- React runs a child's layout effects before its parent's, so in the suite the pane read 98px while a real open read the 8px seed.
- Lifting the height started a transition that `transitioncancel` then read as landing.
- A dialog's 3% z-step made the painted box 303.61px for a pane landing at 313.

The 2026-09-10 CI note: the guard timer means *"the lens may measure again"*, not *"this has landed"*. It fired first on a starved runner.

#### The flight in CSS (`surfaces.css` @39f3884)

The recipe was promoted from `menu.css` to the family class on 2026-08-10, when Select became the second member (Kushagra: *"can we apply the same animation to select now?"*). Every selector carried `.kui-surface`, because the promotion flipped a specificity tie with the width floor and the panel had opened at its 112px floor instead of its seed.

##### The base flight rule (`surfaces.css:2534`)

`inline-size: var(--kui-fly-w, auto); block-size: var(--kui-fly-h, auto); transform-origin: var(--kui-origin-x, left) var(--kui-origin-y, top); scale: 1; translate: 0 0;` and:

```
transition:
  block-size    var(--floating-fall)   var(--motion-spring-elastic),   /* 207ms */
  translate     var(--floating-fall)   var(--motion-spring-elastic),   /* 207ms */
  inline-size   var(--floating-spread) var(--motion-spring-elastic),   /* 306ms */
  border-radius var(--floating-corner) var(--motion-spring-elastic),   /* 252ms */
  scale         var(--floating-corner) var(--motion-spring-elastic),   /* 252ms */
  opacity       var(--floating-paint)  ease-out,                        /*  48ms */
  box-shadow    var(--floating-reveal) ease-out;                        /* 117ms */
```

There were no delays: *"the first frame is the trigger's own opaque silhouette … so there is no fade to wait out"*.

##### The origin table (`surfaces.css:2576–2636`)

`--kui-origin-x/-y` came from `data-side`/`data-align`: `top` → y bottom; bottom/top + `end` → x right; left/inline-start → x right; bottom/top + `center` → x center; side placements + `end` → y bottom; side + `center` → y center. It had RTL arms for bottom/top start/end, and since 2026-08-23 for `inline-start`/`inline-end`. Without the logical-side arms *"the shared seam OPENS by 2.79px on a 164.8px panel"* on every RTL submenu. The table stated physical keywords because `transform-origin` has no logical ones. The custom properties were unregistered so they inherited. From 2026-08-23 the body read the same table (below).

##### The pose (`surfaces.css:2659`, `[data-unfurling][data-seed]`)

- `translate: calc(var(--kui-from-x, 0px) + var(--kui-seed-dx)) calc(var(--kui-from-y, 0px) + var(--kui-seed-dy))`
- `inline-size: var(--kui-seed-w, var(--kui-seed))`, `block-size: var(--kui-seed-h, var(--kui-seed))`, `min-inline-size: 0`
- `border-radius: var(--kui-seed-r, calc(var(--kui-seed) / 2))`
- `--kui-sf-cast: none` (castless; the floating shadow faded up on the reveal clock as the panel lifted)
- `transition: none`. The pose was a held static pose. Under a live list every aim write started a translate transition *"whose cancellation at seed-release reads as a dismissal (measured: the entry released two frames in and the panel snapped)"*. Measured 36.9 → 350 in one frame (LOG 2026-08-15).

It was OPAQUE from the first frame. It covered the trigger exactly, so *"this is the trigger's own body lifting, and a body does not fade in"*. What arrived gradually was the light (the cast).

##### The aim gate (`surfaces.css:2692`)

`[data-seed]:not([data-aimed]) { opacity: 0 }`. It had no law until 2026-08-23. The three places that mentioned `data-aimed` used it to select a frame to measure, so they only ever read aimed panels. The recorded cost of its absence on a Select was *"up to twelve frames of the fully grown panel before it collapses to its trigger and unfurls back out"*.

##### While unfurling (`surfaces.css:2730`, `:2869–2988`)

- `overflow: clip`. The base surface rule clipped since 2026-08-20, but select.css's `overflow-y: auto` beat it on source order, so the flight restated it. `clip` rather than `hidden`, because *"`hidden` is a SCROLL CONTAINER"*: Base UI focused the selected row and the browser scrolled the panel to it (*"`scrollTop: 57` on an eight-row select with the fifth selected"*). The inline `LIST_FUNCTIONAL_STYLES` on an item-aligned select beat this rule, so the runner wrote the clip inline (2026-08-22).
- `min-inline-size: 0`: the floor stood down for the whole flight.
- `.kui-portal :has(> .kui-surface.kui-floating[data-unfurling]) { pointer-events: none }`: the positioner held at the final box was a transparent region that would swallow clicks. `.kui-surface.kui-floating[data-unfurling] { position: absolute; pointer-events: auto; inset-block-start: 0; inset-inline-start: 0 }`: the panel punched back through. On 2026-08-10 `pointer-events: none` for the whole flight was built (Kushagra: *"pointer events none in beginning so that cursor doesnt change"*) and reversed within the hour (*"we need to cancel pointer events, it annoys"*): *"an eager click inside the flight dismissed instead of selecting, and a row the pointer was already resting on could not light"*. The first spelling cleared the dead region in JS on `transitionend`, so a panel landed any other way *"kept a dead region over the page forever"*. The rule keyed on the attribute from 2026-08-10.
- **Pins: which edge held the panel inside the held box.** end-aligned bottom/top, `left`, `inline-start` → `inset-inline-end: 0`. `top`, and side placements aligned end → `inset-block-end: 0`. RTL arms for physical `left`/`right` (2026-08-23): *"the seed painted at 896–952, 85px away on a 141px panel"*. The pin block and the origin block had drifted: `inline-start` was missing, and `[data-align="end"]` fired bare on side placements (2026-08-22 audit M8: a flipped submenu *"growing sideways back INTO the menu it came out of"*).
- **The centred bottom/top pane** (2026-08-31, Kushagra: the popover *"for some reason goes left"*): `inset-inline-start: 50%; inset-inline-end: auto; transform: translateX(-50%)` (RTL `translateX(50%)`). The seed arm added `var(--kui-seed-w, var(--kui-seed)) / 2` to the x offset. The start-edge pin had measured `--kui-from-x: 182px`, carried on the fall clock (345ms judged at that date) while the width rode the spread (510ms judged), and *"the centre swung 442 → 630 → 623"*. Auto margins shipped first for an hour and clamped at overshoot (*"there's still a lateral shift inside"*; 5px). The pull is `transform`, not `translate`, because *"`translate` is the flight's animated channel: a `-50%` there would start a half-width slide the frame the pin comes off at release"*.
- **The side placement centred on its row**: `inset-block: 0; margin-block: auto`.
- **The scroll area stretch** (`surfaces.css:3035`, 2026-08-17, Kushagra: *"whenever menu opens to the top, the content doesnt load, it comes after animation completes"*). ScrollArea's root was `position: relative`, so the body's containing block collapsed to 8px. A top-opening panel resolved `inset-block-end` from that 8px box and clipped the whole body for the entry. `block-size: 100%` on `.kui-scroll-area` during the flight fixed it. Base UI writes `position: relative` inline on ScrollArea.Root, so height was the only lever.

##### The body (`surfaces.css:2776`, `:2824`, `:3072–3178`)

- At rest the body declared `inline-size: var(--kui-fly-bw, auto)` and `transform-origin: var(--kui-origin-x, left) var(--kui-origin-y, top)` (inherited from the popup's table since 2026-08-23; before that it was `top left` plus two bespoke arms, so an end-aligned menu's content slid *"15.10 → 4.19 → 5.00"*).
- Transitions: `scale var(--floating-corner) elastic` (on `--motion-rise`, the control clock, from 2026-08-14 to 2026-08-23), `translate var(--floating-fall) elastic var(--floating-reveal-delay)`, `opacity var(--floating-reveal) ease-out var(--floating-reveal-delay)`, `filter var(--floating-corner) ease-out var(--floating-reveal-delay)`.
- Seed pose on the body: `opacity: 0; filter: blur(var(--print-blur)); translate: 0 calc(var(--floating-echo) + var(--kui-body-sink)); scale: 0.95 0.5` (the squish). The content was *"invisible and molten while the box is becoming, printing as one piece when the shape lands"* (2026-08-15, Kushagra: *"blurred out, empty content that shows up as the circle takes the shape of the container"*). The per-row hold that preceded it was deleted on 2026-08-15. Its stand-down arms (`:where(.kui-row, .kui-separator)`) survived as dead text in the `[data-instant]` and reduced-motion rules (2026-08-31 assessment: 210 raw / 18 gz bytes).
- The counter-squish shipped reading `var(--floating-rise)`, a token that never existed. The whole declaration was invalid from 2026-08-09 until Kushagra found it in the lab on 2026-08-14 (*"the container moves nicely, but the text doesn't move or stretch with it"*). That produced the dangling-var law.
- **The body pin during flight**: `position: absolute; inset-block-start: var(--kui-sf-p-block); inset-inline-start: var(--kui-sf-p-inline); translate: 0 var(--kui-body-sink)`, with arms mirroring the panel's pins.
  - 2026-08-10: pinned to the edge the box is NOT growing from. Kushagra: *"why does a menu that opens to the left look and perform so different to the one that opens bottom"*. Measured: *"the body's left edge moved 21px start-aligned and 175px end-aligned"*. Absolute rather than auto margin, because *"an auto margin resolves to zero when the available space is negative, which is the entire flight"*.
  - Inset by the panel's own padding: `inset: 0` resolved against the padding box put rows a few pixels off (Kushagra: *"the inside of the menu jumps after animation finishes"*).
  - 2026-08-23 audit: the pins read `--kui-floating-p`, which was unset on Popover and Tooltip, so the declaration was invalid and every inset became `auto`. They read `--kui-sf-p` from then.
  - 2026-08-26 audit: a per-axis pair, because Tooltip padded 4px block and 12px inline: *"the pin's `inset-block-end` computed `12px` against `padding-block-end: 4px` — 8px off its resting line"*.
- **A centred body is pinned by its own centre** (2026-08-29, Kushagra on a tooltip: *"after it animates, the content inside is in wrong pos, it jumps after animation has finished"*): `inset-inline-start: 50%; margin-inline-start: calc(var(--kui-fly-bw) / -2)`. The block arm is `inset-block-start: 50%; margin-block-start: calc(var(--kui-fly-bh) / -2)`. Auto margins were over-constrained while the body was held at its landed width inside a smaller pane. The end inset was dropped: *"13.4px from the left edge and 7.4px PAST the right one on an 88.9px pane"*. On the block axis two insets squeezed: *"56px of body holding 60px of words"*. It reached Tooltip and Popover (both default `align="center"`) and the alert body.

##### The exit (`surfaces.css:3190`)

`[data-ending-style] { opacity: 0; scale: 0.98 }` with:

```
transition:
  block-size    var(--floating-fall)     var(--motion-spring-elastic),
  translate     var(--floating-fall)     var(--motion-spring-elastic),
  inline-size   var(--floating-spread)   var(--motion-spring-elastic),
  border-radius var(--floating-corner)   var(--motion-spring-elastic),
  box-shadow    var(--floating-reveal)   ease-out,
  opacity       var(--floating-dissolve) ease-in,       /* 63ms */
  scale         var(--floating-settle)   var(--motion-spring-stiff);  /* 72ms */
```

The exit was chosen 2026-08-09 from three built side by side in `apps/docs/app/motion-lab`: fold back into the seed, mirror the entry on a compressed clock, and dissolve. Kushagra: *"For now, dissolve, otherwise it works beautifully."* The geometry channels were RESTATED so a mid-flight dismissal kept becoming while it dissolved: *"dropping a property from the list CANCELS its running transition"*. `box-shadow` was the channel the first restatement missed (2026-08-16). A law derived the exit list from the entry's so the class could not recur.

##### The pointer-events keep-alive (`surfaces.css:3418`, 2026-08-22)

`[data-ending-style] { pointer-events: none }` on floating panes, the alert popup, the dialog popup and both backdrops. The restated channels ran to their full entry durations, and Base UI unmounted only when `Promise.all(getAnimations().map(a => a.finished))` settled. So a dismissed panel stayed mounted and hit-testable while invisible. Measured dead windows: Menu 253ms, Select 423ms, AlertDialog 527ms. *"`elementFromPoint(30, 20)`, an ordinary page corner, returned `DIV.kui-alert-backdrop`"*. Shortening the restated channels to the exit's clock was built, measured as a no-op (an unretargeted transition keeps its duration) and reverted.

##### The `[data-instant]` stand-down (`surfaces.css:3250–3253`)

`.kui-surface.kui-floating[data-instant]:not([data-instant="click"]):not([data-instant="dismiss"]):not([data-instant="focus"])`, its body, and its rows: `transition: none`. Base UI stamps `data-instant` when a change *"is not a reveal"*. Three values were exempt, each for being about the input rather than the change:
- **`click`** (2026-08-19): Base UI 1.7 stamps it for any press with `nativeEvent.detail === 0` (every keyboard Enter/Space, every programmatic `.click()`), so the keyboard had lost the entry.
- **`dismiss`** (2026-08-22): Menu's store sets it for `reason === escapeKey || reason == null`, so Escape deleted the menu's exit (*"opacity 1 to 0 in a single frame and was gone in 29ms"* against ~220ms). A CONTROLLED menu never ran `setOpen`, so the stale stamp killed its next entry too.
- **`focus`** (2026-08-29): a focus-opened tooltip and a focus-out popover close; again stale on controlled roots.

`delay` (a warm group, such as a toolbar's second tooltip), `trigger-change` and `tracking-cursor` stayed instant. The runner's `FLIES_ANYWAY` stated the same set, and `system/surfaces.test.ts` read both SOURCES and required agreement. Before 2026-08-19 the stylesheet comment called `dismiss` *"a dismissal the pointer already committed to"*. That was Popover's store definition, and *"had the two backwards"*.

##### Reduced motion in the flight (`surfaces.css:3471–3545`)

`transition: none` on the pane, body, rows, alert popup, overlay body, dialog popup and dialog body at the recipe's own weight. Being one class lighter lost the tie and left every clock running; that was caught 2026-08-16. The three `[data-ending-style]` exits were added 2026-08-22, when the full seven-channel list had been surviving under reduced motion. The exits and the dialog's starting pose were reset (`translate: 0 0; scale: 1; opacity: 1; filter: none`), and the dialog body's blur was stood down.

- **The runner's poses were NOT reverse-declared.** The guard used to maintain an inverse of every pose, and within ten minutes that inverse had missed the aim gate and `min-inline-size`. The runner refused under the setting, so a pose could exist only if the setting was turned on mid-flight. The guard owed only *"nothing moves, nothing is measured"*, asserted by mounted law (2026-08-16).
- **`margin: 0` was DELETED on 2026-08-22** (audit C4). It stood down nothing, but it beat the `margin: auto` that centred a dialog. *"a dialog open at `360,351 560x98` became `24,24 560x752` at full opacity on the frame the ending stamp landed, and sat there for eight frames"*. It was held on screen by the surviving exit clock. *"The setting that exists to remove motion was producing the largest movement in the family."*
- The dialog's starting pose was stood down in CSS on purpose, because it was Base UI's `data-starting-style` (stamped whatever the OS preference), not the runner's.

#### The members

##### Menu, submenus and the trigger that held its press

- Menu shipped 2026-08-09 with *"motion instant"* (LOG 2026-08-09 "Menu ships on the row family"), and became the motion system's first floating consumer the same day.
- **The trigger held its press while its panel was open** (2026-08-10, Kushagra: *"button goes down when clicked, but with select or dropdown, its not happening — I want it to go down, and stay there"*). `[data-popup-open]` held `translate: 0 var(--press-travel)` (2px) and `scale: var(--press-scale)` (0.975). For an hour before that, an open trigger's geometry had been LOCKED at rest (Kushagra: *"leaving the mouse off triggers also moves the menu as the button moves back to its OG position"*), which also killed the press. The held press is what made the width floor and the placement anchor depend on when they were measured.
- **Submenu seam**: `panelSeam` (`menu.tsx:69`) read the parent panel's top padding (from its ScrollArea viewport since 2026-08-17) plus its border at position time. It was Base UI's function-form offset, evaluated on every position pass. The 2026-08-31 assessment called it a fifth interaction-time mechanism the enforcing law could not see (negligible cost).
- **Submenu seed history.**
  - 2026-08-10: a row-height sliver claiming adjacency (Kushagra: *"the submenu appears very different"*).
  - 2026-08-15: the row's full silhouette, *"growing the short true distance out"*.
  - 2026-08-17: BESIDE. The measured travel was *"the seed was `353 x 30` at x=10 … the panel lands `92 x 73` at x=376 … slid 366px right while shrinking to a quarter of its width, overshooting to 398"* (Kushagra: *"the way submenu appears is quite aggressive … it ends up traveling a lot, especially if dropdown menu is wide"*). The fix was keyed on the PLACEMENT (`data-side`), never the component.
  - `MenuSub` dropped `seedSize` from its context on 2026-09-02, because a submenu of a ContextMenu had inherited the zero seed.

##### ContextMenu (DECISIONS §42, 2026-09-02)

- The first design gave the panel its own pose (*"the landed box breathing from 0.92"*). Kushagra, by eye: *"something is wrong with animation, and I dont get it, we literally had to copy paste menu"*. Measured, it was *"a twitch — 8% of a panel over 345ms, with no unfurl and no body squish"*.
- Final design: the family's entry unchanged, with a zero-size seed. `seedSize: () => ({ width: 0, height: 0 })` on the direction context.
- A cursor-tracking spelling (`onContextMenu`/`onPointerDown` on the region) was refused by the shipped interaction-time law.
- Deleted with the first design: `CONTEXT_PLAN`, `ContextFloatingBody`, `kui-menu-point`, the pose in `menu.css`, `contextEntry` and `--context-seed`. Net −84 bytes; the component shipped 0 gzipped CSS bytes.
- Audit fixes the same day:
  - `seedSize` leaked into submenus.
  - A panel shifted up by `shift({crossAxis})` (with `flip.mainAxis` off) seeded 107px above the pointer. The y now came from Base UI's `--transform-origin`.
  - The catch teleported a re-summoned panel 289px. A summoned panel always flew.
  - The platform menu drew over the panel, because Base UI suppressed `contextmenu` only on the region and its backdrop.

##### Select (DECISIONS §23)

- Adopted the family's entry on 2026-08-10 with zero motion CSS of its own.
- **Item-aligned since 2026-08-17** (`alignItemWithTrigger` back to Base UI's default). The chosen row landed on the value it replaced. Kushagra: *"I would expect same animation as dropdown, but only the position changes… I still expect the animation."*
- A **curtain** was built, law-tested and rejected on sight: the box at its settled size and place from the first frame, with only the reveal animating. It was deleted rather than flagged.
- The runner waited for placement (`placedByContent`) and borrowed Base UI's height, overflow and scroll offset.
- **The offset is the placement.**
  - First, a clip abolished the offset and the row sat 374px adrift for ~740ms (Kushagra: *"jumps the selected item to correct position after opening"*).
  - Next, the offset was written with the pose: 374 → 73px worst departure.
  - Last, the offset was carried as a negative body margin, because a scaled body shrinks `scrollHeight` and the browser clamps the offset (*"settled 21, then 15, 9, 3 across the flight"*).
- The law read the ROW's distance from the trigger on the last flying frame, bound 6px: *"between the panel's own sub-pixel settling (2.4px) and the smallest real defect (21px)"*.
- **The page.** *"why is it on preview page, opening some dropdown menus shift or move the page"*, then *"Select still jumps"*, then *"IS KOOKIE UI THE ONLY LIBRARY ON THE PLANET USING BASE UI?"*. The answer: *"Every other Base UI consumer opens a select in place… Ours FLIES"*. With `hidden` the panel scrolled (57px); with `clip` alone the page kept 65px. Both doors were shut: clip plus the page hold.
- No ScrollArea (Kushagra: *"skip it on select for now"*), because Base UI's overlap controls its own scroller.
- An open select trigger held the button press (`select.css:66–93`, 2026-08-10: *"its also an onclick trigger"*).

##### Combobox (DECISIONS §50, 2026-09-12)

- The seed was a zero-height line at the field's bottom edge (`block-size: 0; --kui-seed-dy: var(--kui-seed-h, 0px); opacity: 0`, combobox.css:87). The opaque silhouette had covered the field being typed into: *"`elementFromPoint` at the input's text midline returned the popup from t=86 to t=140 while `input.value` became 'L'"*. The seed faded, because a line with no height covers nothing.
- The height followed the list in flight (`followsContent`) and at rest (`interpolate-size: allow-keywords`, scoped to the pane because it inherits; measured snap 234 → 162 → 234 before).

##### Popover (DECISIONS §31): three entries in three weeks

1. **2026-08-23 to 2026-08-31**: the family's silhouette.
2. **2026-08-31 to 2026-09-14**: a faint designed circle (`50%` corner) on the trigger's centre, on the ALERT's clocks re-pointed token for token. Kushagra: *"feel like alert dialog's"*, then *"it doesnt still feel like alert dialog's"*, then *"No change in animation… its not the same as alert dilaog at all, in how it expands, in how content appears"*. The seed without the clocks was measured *"175 × 153 at 90% opacity by 60ms"*. Two options were put to him with previews and rejected: the alert's recipe verbatim (it forgets the anchor) and a fade on the silhouette. `--kui-seed-dx/dy` (registered `<length>`) said how far inside the trigger box the circle sat. `corner-shape: round` on the seed produced *"a second much more circular corner radius border inside"*, because the glint mask read `corner-shape` off the element assuming it never changed in flight.
3. **2026-09-14 onward**: Dialog's depth entry (Kushagra: *"Popover should animate like dialog, because it can be huge and that animation doesnt work for that big a container"*). It used the tooltip's mechanism. The runner still flew. The pose was the landed box (`--kui-fly-w/h/r`) at `scale: var(--dialog-depth)` and `opacity: 0`. Every pin was zeroed and `transform: none` set. The body stayed in flow (`position: static`, `margin: 0`, `scale: none`, `translate: none`) and ran only `filter var(--dialog-settle) ease-out` from `blur(--print-blur)`. The popup ran `scale var(--dialog-settle) poised`, `opacity var(--dialog-reveal) ease-out`, `box-shadow var(--dialog-reveal) ease-out`. The exit was `opacity 0; scale 0.99` on `--overlay-settle` stiff / `--overlay-dissolve` ease-in. Rules carried `[role]` for rank over the family's (0,5,1) seed arm. Rejected: keeping the circle below a size threshold (*"two entries for one component, keyed on a measurement"*).

Popover took `useRestingAnchor` on 2026-08-29.

##### Tooltip (DECISIONS §32)

- Shipped 2026-08-23 on the family's silhouette. **2026-08-31: a lift, not a silhouette.** Kushagra: *"way too much, especially when it's on a larger surface, it looks very weird for a tooltip"*. The reference was the Physics tooltip on his "Clip vs Physics" bench. Measured before: *"the chip's first frame was the card's full box, collapsing ~370px of width on the spread clock into a 60px chip"*.
- The pose was the landed box at `scale: var(--tooltip-seed)` (0.9) about the family's origin and `opacity: 0`, with `translate: 0 0`. The body's print was stood down whole.
- It owned a three-channel list: `scale var(--tooltip-form) var(--motion-spring)` (calm), `opacity var(--tooltip-paint) ease-out`, `box-shadow var(--floating-reveal) ease-out`. That way the release, which waits for the longest declared clock, landed with the chip at 300ms judged rather than the 510ms spread.
- **Second pass**: *"Doesnt seem the same physics tho"*. The family's elastic channel reached 0.995 by 90ms and landed at 120; the bench's calm spring was 0.983 at 90 and crossed 1 near 130. After the change: *"0.917/0.953/0.982/0.997/1.003 against the bench's 0.919/0.954/0.983/0.998/1.004 at 30/60/90/120/150ms"*.
- The exit returned to 0.9 on the family's settle clock and stiff spring. The pins were stood down, because the centred pin's `transform` composed inside `scale` (*"4.4px off at the seed"*).
- Not built: the bench's warm SLIDE between adjacent triggers. It would need a cross-element flight, because Base UI mounts one popup per tooltip. Warm tooltips were instant (`data-instant="delay"`).

##### The command palette (DECISIONS §44)

- The palette was a Dialog, so its column kept Dialog's depth entry (0.97, poised).
- **The results pane fell out of the search bar** (2026-09-05, Kushagra: *"Can it also open like a menu? Or a popover, as far as motion goes, with the search bar being the trigger?"*). No runner: `interpolate-size: allow-keywords; height: auto` with `height` and `translate` on `--floating-fall` elastic, `border-radius` on `--floating-corner`, `opacity` on `--floating-paint`. The seed was `height: 0; translate: 0 calc(-1 * var(--floating-echo)); opacity: 0`. The exit was opacity on `--floating-dissolve` ease-in.
- The dialog body stopped being a flex column, because `interpolate-size` does not reach a flex item (*"a block child interpolates 0 → auto (69.3px at 35% of its clock) and a flex item … snaps straight to 200"*). `grid-template-rows: 0fr → 1fr` was built and lost to the system's (0,3,0) flex-column rule (*"304.5px of pane at a track reading 0.32fr"*).
- The lens was announced with `useStatedFlight`. The dialog body's blur was stood down here, because a `filter` makes a backdrop root: *"for the whole entry both panes drew their blur, saturation and lens on an empty backdrop"* (Kushagra: *"after animation completes, the bg changes and gets thicker in a jump"*).
- **List ↔ empty message**: a blur fade on the mark clock, recorded with the other small fades in [The smaller fades](#the-smaller-fades). The height between list and message was refused as animation: it was `auto` to `auto`, and animating it would mean measuring per keystroke.
- On exit, rows stopped drawing their focus ring (2026-09-06).

#### The refraction lens and the flight (`refraction.tsx`)

The lens built a displacement map per distinct box *"on mount and on resize"*.
- **2026-08-22 (audit M5)**: the flight animates `inline-size`/`block-size` on the element the lens is attached to, so every frame was a new cache key. *"27 distinct filters installed on a single panel"*. Each miss ran a per-pixel Snell solve, a `toDataURL` PNG encode and an eleven-node filter graft, synchronously before paint. Each map was a frame stale. Measured drops: menu glass 18–22 maps and 19–20 of ~40 frames dropped; alert glass 20/62; dialog glass 1 map (scale does not change the border box). The fix deferred measurement to the landing.
- **2026-08-23** (Kushagra: *"material behind menu jumps after it settles — the refraction takes place after animation finishes, with a jump"*): *"70 of 90 frames carried no `--kui-lens`"*. The lens then built once from the flight's TARGET box (`--kui-fly-w/h/r`, with `--kui-fly-r` added for this) and wore it the whole way. The landing became a cache hit. `measureUnlessFlying` (`refraction.tsx:1461`) measured a flying pane once per distinct target key and otherwise returned. The seam was still watched in case content changed size mid-flight.
- **2026-09-05**: Command's pane had no runner, so `useStatedFlight` published the same vocabulary. Before that there was *"no lens at all for the first ~130ms, then four maps in a row"*.
- **2026-08-31 assessment** (finding 5): *"A glass floating panel runs the whole filter chain per frame over a box that changes size, for the entire 345–600 ms entry"*; about 104M pixel operations for a 320×263 glass menu at DPR2 over about 31 frames. Finding 6: a dialog or alert entry stacked two (default) or three (glass) filter passes. The GPU cost was 2.29 ms/frame against 1.16 baseline. The body arrival blur was `blur(6px)` → 0 over about 504×700 for 600ms. Both were assessed and left.

### The overlay family

The panels anchored to nothing. AlertDialog alone used the runner (`OVERLAY_PLAN`, `OverlayBody`); Dialog's entry was pure CSS on Base UI's stamps.

#### AlertDialog: the materialization (DECISIONS §25, `surfaces.css:3254–3392`)

The recipe was formed on 2026-08-15/16 as the DIALOG's entry and moved to AlertDialog at the split (2026-08-16, Kushagra: *"my fear is true. What we finalised is good for alert dialog… they are semantically different"*).

- **2026-08-15 first cut**: `scale 0.92 0.8` on Base UI's stamps, no JS (*"lets apply similar 'principles', not the same animation, principles, to dialog opening, I think the container is the same surface"*; then *"Shouldnt container also grow like it does?"*).
- It became a circle rising from below (*"we know the origin of dropdown menu is trigger, whats the origin of this? It needs to move"*; *"the dialog container itself expanding from a circle in center"*). A clip was judged out on sight, because it flattened against the box edges.
- **Final pose** (`[data-seed]`): `inline-size`/`block-size: var(--overlay-seed)` (64px), `border-radius: 50%` (a percentage keeps the box curvy as it opens), `corner-shape: round`, `padding: 0` (border-box floored at padding; the first circle posed 50px wide), `translate: 0 calc(var(--kui-fly-h, var(--overlay-seed)) / 2 + var(--overlay-lift))`, `opacity: 0`, `transition: none`.
- **Flight**: `block-size var(--overlay-fall)`, `inline-size var(--overlay-spread)`, `border-radius` and `padding var(--overlay-materialize)`, all elastic with delay `--overlay-grow` (0); `translate var(--overlay-fall)` elastic with delay `--overlay-hold` (0); `opacity var(--overlay-reveal) ease-out`.
- **Body**: absolute, pinned where flow would put it (`inset-block-start` = padding token; centred inline by 50% plus a negative half-width margin since 2026-08-29), held at `--kui-fly-bw`. It transitioned `opacity var(--overlay-reveal) ease-out var(--overlay-reveal-delay)`, `filter var(--overlay-print) ease-out` (same delay), `translate var(--overlay-print) elastic` (same delay). Seed: `opacity: 0; filter: blur(--print-blur); translate: 0 var(--overlay-echo)`.
- **Exit**: `opacity: 0; scale: 0.99`, with all geometry restated. On 2026-08-16, Escape mid-flight *"snapped the box 125 → 560 in one frame"* before the restatement existed.
- **Tuning (2026-08-16)**: *"not of the same family"*, *"dialog feels snappy… not wrong, but different"*, *"content animation feels different too"*. Box clocks were SPEED-matched to travel (~1.7× the menu's; 1.4× still read snappy). Content clocks were TIME-matched to the family (print and the 8px echo shared). The hold went to 0 (*"a weird random square on the screen for a brief instant"*).
- The system could animate this content because the alert's anatomy was closed (title, description, two actions). *"If the slots are ever opened up, the content animation leaves with them."*
- **The flight broke a dev warning.** `useClipWarning` ran at mount, while the popup was held at its 64px seed, so a plain "Delete file?" alert warned it was *"208px wider than it is… not reachable"* on every open while its settled `scrollWidth === clientWidth`. The warning was removed from AlertDialog on 2026-08-22 (`alert-dialog.tsx:~247`).

#### Dialog: depth, not distance (DECISIONS §24, `surfaces.css:3438–3469`, locked 2026-08-16)

- Judged on lab2's mass strip at 55vw/55vh and 88vw/85vh against three other candidates: a 12px rise (*"levitation"*), a pure fade (*"earns nothing"*) and a "placed" set-down from above.
- Tuned: *"a bit faster, a little more than 2%, with slight overshoot"*. This minted `poised`.
- The popup ran `scale var(--dialog-settle) poised`, `opacity var(--dialog-reveal) ease-out`, starting at `opacity: 0; scale: var(--dialog-depth)` on Base UI's `[data-starting-style]`. The body ran `filter var(--dialog-settle) ease-out` from `blur(var(--print-blur))`. Kushagra: *"if the container mass takes some time to get in focus, content should also do same, no travel bc we dont know how its arranged inside"*.
- There was no runner, no measurement and no release clock. A law asserted the ABSENCE of size channels. The exit was `opacity: 0; scale: 0.99` with `scale` still listed, so a mid-arrival dismissal retargeted the running spring.
- Consequences recorded:
  - `defaultOpen` mounted instantly (Base UI stamps no starting style on mount).
  - A quick reopen mid-dissolve got no fresh entry; *"the recovery … is visually the entry itself"*.
  - Filter over a large subtree was the recipe's most expensive paint.
  - A running filter made the body a containing block for a consumer's `position: fixed` child.
- **The narrow-window sheet arm had no motion** (2026-08-21, Kushagra: *"it still has same motion as dialog when it opens in sheet. We will design a separate motion system for sheet, so what it has right now is wrong."*). Both clock and pose were stood down at matching specificity (`dialog.css:224–260`), because with no transition the browser still painted one frame at the starting values. The scrim kept its fade.

#### The scrims

`.kui-dialog-backdrop` and `.kui-alert-backdrop` faded `opacity var(--overlay-reveal) ease-out` (90ms emitted). They were at `opacity: 0` on the starting and ending stamps, and under reduced motion `transition: none` with `opacity: 1`. The scrim was pure signal: *"it has no box to become"*.

### The drawers

A drawer's grammar was a slide: the distance was the pane's own width, so nothing was measured (DECISIONS §27, §49).

#### The Shell's overlaying panes (DECISIONS §27)

**2026-09-06: slide, and the frame recedes.** Kushagra, against his own "Clip vs Physics" bench: *"Yes it can come from side, but there's more, and we're at an advantage because we have the Shell. The bg should scale down."*

- A drawer was *"none of the three entrances"*: not a menu (anchored to the window edge, not a trigger), not a dialog (a dialog barely travels). The distance was `100%` of the pane, so there was no runner.
- The root scaled to `--shell-drawer-scale` 0.925. A well appeared behind it (`--scrim-well`), the scrim covered both, and all four rode one clock (`--motion-drawer`, 420ms judged then).
- The `driven` spring was minted (ζ1, ω9, v₀1.5), which needed the critical closed form in the generator.
- The drawer took the exact inverse scale about the same page point, so side drawers spanned `grid-row: 1 / -1`. A 600×400 frame at 0.925 with a counter-scaled 200×400 child *"returns the child to exactly 200×400"*.
- A closed drawer was PARKED at `visibility: hidden` one pane-width (plus gap) outside the frame instead of `display: none`, which cannot transition.
- The reference's 8px settle was dropped (*"One number, one inverse"*).

**The slide shipped dead.** Kushagra: *"there's no slide in and out"*. The travel hook held both axes (`calc(-100% - var(--shell-gap)) 0`), and `translate()` separates arguments with a comma. The substitution was invalid at computed-value time and *"every parked drawer computed `transform: none` … and appeared"*. The fix was one hook per axis (+5 bytes). 2,634 laws were green, because every drawer law read a landed pane.

**The clip cut the thing it protected** (Kushagra: *"the sidebar is also cut"*). `overflow` clips in the element's own box before its transform. *"the drawer painted 26.25→673.75 where its box is 8→692, trimmed 18px"*. The clip became a property of the RESTING frame: `overflow 0s var(--motion-drawer) allow-discrete`, so it came back only after the last exit, with a live arm at zero delay. A parked sibling then scrolled the page (a 375×700 window reported 663×874), so non-live drawers went back to `display: none`.

**The well ate the app** (*"Normal white page becomes black when sidebar comes"*). Flush panes paint nothing, so the well showed through. The frame took the seal on a second pseudo-element (`::after`), because under `isolation: isolate` a `z-index: -1` child paints above the parent's own background (*"The entire page is black there is no ring"*). Its law grabbed the screen and read a pixel.

**The scrim left before the drawer** (*"When I dismiss it, the bg loses its blur instantly making it look weird"*). The scrim was parked with `opacity` plus `visibility` on the drawer's clock. **The receded frame rounded** (*"when the bg scales down, it should have corner radius too"*).

**2026-09-08/09: a side pane PUSHES the frame.** Kushagra: *"Treating a left drawer like an iOS sheet which comes from below is different. Just because they're all sheets doesn't mean they're treated the same… The content is pushed to right, so sidebar always stays compliant with how desktop works."*

- The frame's CHILDREN carried `translate: var(--kui-shell-push-x) var(--kui-shell-push-y)`, never the root, because a transformed root counted as scrollable overflow (*"when sidebar opens the page is very wide so I can actually scroll"*).
- A pane parked exactly one push away. *"measured 2px at 120ms"* of daylight appeared with the old one-gap park.
- `--kui-shell-push-x` was registered `<length-percentage>`. A `<length>` registration made the `100%` cap invalid, and it silently computed 0px.
- The scrim dimmed without blurring (*"We have a blur scrim and a scale down, both, which looks odd"*).
- **`carried` replaced `driven`** (*"The opening animation is extremely bad, it just jumps to a middle state, and theres no animation on scrim, or dimming, even when going back"*). `driven` put *"76% of the travel inside the first 120ms"*. `carried` (ζ1, ω7.5, v₀0) was *"UIKit's own presentation spring (damping 1, response ~0.5s)"*. The clock went 420 → 500. Paint (the dim) rode `--motion-easing` on the same duration.
- **2026-09-11: the bottom pane pushed too** (*"The bottom sheet in a shell is different from a dialog sheet. Just like sidebar pushes content side, shell bottom should also push content up, not appear like modal"*). Nothing receded after that. On 2026-09-12 `shellDrawer.scale` and the bottom pane's recession rule were deleted (commit `10b85ae`).

**State at 39f3884** (`shell.css:558–905`, restated for `presentation="auto"` in the narrow media block around `:2140–2280`):
- `.kui-shell` transitioned `transform var(--motion-drawer) carried, overflow 0s var(--motion-drawer) allow-discrete`.
- Children transitioned `translate var(--motion-drawer) carried` through a zero-specificity `:where()`. The bare selector at (0,4,0) had replaced the scrim's own list.
- The pane was `transform: scale(calc(1 / var(--kui-shell-recede))) translate(var(--kui-shell-drawer-x, 0), var(--kui-shell-drawer-y, 0))` on `transform` (carried) plus `visibility` over `--motion-drawer`. Parked offsets: flush ±100%; not flush ±(100% + 2 × gap).
- `.kui-shell-scrim` transitioned `opacity` (easing), `translate` (carried) and `visibility`.
- `::before` (the well) and `::after` (the plane) still declared their transitions.
- Vestigial: `--kui-shell-recede` was pinned at 1, the well stayed transparent, `--scrim-well` and `--motion-spring-driven` were emitted and unused, and nothing changed the root's `overflow`. The CSS itself said *"stays transparent until the recession machinery is removed with the ship pass"*. The header comment still said *"No motion yet"* (stale since 2026-09-06).
- Reduced motion (`shell.css:2734`) set `transition: none` on the root, both pseudos, the scrim, both pane presentations, the bottom-push arms and the pushed children.

#### Sheet (DECISIONS §49, 2026-09-12)

- Built on Base UI's Drawer (swipe-to-dismiss with release velocity, touch scroll locking).
- `.kui-sheet-popup` had `transform: translate(var(--drawer-swipe-movement-x, 0), var(--drawer-swipe-movement-y, 0))` and `transition: transform calc(var(--motion-drawer) * var(--drawer-swipe-strength, 1)) var(--motion-spring-carried)`. Base UI scaled the duration by how hard a swipe was released.
- Starting and ending stamps: `translateY(100%)` down, `translateX(±100%)` sideways, keyed on the PHYSICAL swipe direction. *"Leaving is the same distance on the same clock, which is also where a swipe-dismissed panel continues from."*
- The backdrop faded `opacity: calc(1 - var(--drawer-swipe-progress, 0))` over `--motion-drawer` with `--motion-easing`, and at `0s` while `[data-swiping]`, so the dim followed the finger.
- Leaving panel and scrim took no pointer events. Reduced motion stood the clock and the pose down; *"a drag still follows the finger — that is direct manipulation"*.

### The smaller fades

| Where | What moved | Clock | Notes |
|---|---|---|---|
| Link (`link.css:13-83`) | underline colour, `--color-border` → `currentcolor` under hover | `--motion-duration` (72ms), `--motion-easing` | "Nothing here moves, so the geometry clock has nothing to drive". No ring arrival. Own stand-down, "a clock nothing else can stop" otherwise. |
| Breadcrumb (`breadcrumb.css:75-138`) | colour and underline colour; underline rested `transparent` "so the line's metrics never move and §8's paint clock has a colour to carry — a `text-decoration-line` appearing is a discrete change and would arrive in one frame" | `--motion-duration` | Own stand-down. |
| ScrollArea bar (`scroll-area.css:152-214`) | `opacity` 0 → 1 while `[data-scrolling]`/`[data-hovering]` | in `--motion-hover-in` (48ms), out `--motion-hover-out` (132ms) | "Pure paint is not the exemption it sounds like … The system's answer is one answer, not one per property." (The first claim had been "reduced motion owes nothing here".) |
| Toolbar mirroring title (`toolbar.css:224-242`) | `opacity` 0 → 1 when the page's large title has scrolled away (`[data-collapsed]`) | `--motion-duration` | The collapse flag came from the seventh bounded exception (an IntersectionObserver, DECISIONS §46). The rule's own comment said "`prefers-reduced-motion` has nothing to stand down", and a stand-down block followed it anyway. |
| MessageScroller dock (`message-scroller.css:62-76`) | `opacity` of the jump-to-latest dock | `--motion-hover-out` both ways | "THE FADE IS THE DOCK'S, NOT THE BUTTON'S": a `transition` on the button would tie the skeleton's at (0,1,0) and replace its six channels ("the accordion audit's defect"). 2026-09-17: the button had been lifted with `translate` and "the first hover replaced the lift and threw the button its own height down the transcript" (Kushagra: it *"travels a lot when I hover on it"*); it was re-placed by layout. |
| Shell resize line (`shell.css:2661-2668`) | the drag handle's line `opacity` | `--motion-duration` | stood down in the shell's block |
| Command list ↔ empty (`command.css:530-583`, §44, 2026-09-05) | `opacity` + `filter: blur(var(--done-blur))` | `--motion-mark` with `ease-out` | Kushagra: *"add motion to how the list goes from wherever it is to empty state, preferably blur fade in and out that we use."* The done swap's grammar, "deliberately not the floating family's print, which is licensed by MASS". Keyed on the pane's state, not `@starting-style`, which "fired on neither" element; the emitted clock was 228ms. |
| Carousel (`carousel.tsx:197-203`, 2026-09-18) | `viewport.scrollBy({ behavior })` | browser smooth scroll | `behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"` — "A rail that jumps is a rail whose reader loses their place". Snap was `scroll-snap-type: inline mandatory`. |

The docs site's own fades are in [The docs side](#the-docs-side).

### The content loops, which stayed

The rule, from principle 8 and §8: motion that IS the content keeps its own answer — "slowed, never stopped",
because "a busy indicator that stops moving is information lost, and the vestibular guidance targets large
motion rather than a 16px rotation". They read no motion token and `motionSpeed` did not touch them. The
2026-08-10 suppression law's second answer for any `animation` was exactly this: "motion that IS the content
… owns a guarded block."

| Loop | Mechanism | Duration | Reduced motion |
|---|---|---|---|
| Spinner (`spinner.css`) | `animation: kui-spin 1s steps(8) infinite` rotating an HTML `<span>` wrapper 360° around eight static SVG spokes | 1s per turn, ticking spoke to spoke | `animation-duration: 3s` |
| Progress indeterminate (`progress.css:73-123`) | a 40% segment, `animation: kui-progress-sweep 1.6s linear infinite`, `translate` from `-100%` to `250%` of the segment (`:dir(rtl)` flips a `--kui-progress-sweep` sign) | 1.6s | `animation-duration: 4s` |
| Attachment ring (`attachment.css:103-116`) | `stroke-dasharray: 25 75` with `stroke-dashoffset` → `-100`, a dash travelling the tile's edge | 1.6s linear | `animation-duration: 4s` |
| Docs: Conversation shimmer (`apps/docs/blocks/conversation.css:237-266`) | gradient `background-position` 100% → −100% | 2s linear | `animation-duration: 6s` |
| Docs: specimen bed drift (`apps/docs/app/globals.css:85-106`) | `scale: 1.18` with `translate` −4%/−2% ↔ 4%/2% | 14s ease-in-out alternate | `animation: none` ("the motion is not content, it is a test rig") |

History:
- **Spinner.** 2026-08-02: one element, border-top arc, one rotate keyframe. 2026-08-03: rejected by eye; a
  conic-gradient replacement "failed structurally, because a conic gradient cuts angular wedges and the native
  idiom is parallel-sided bars"; became twelve SVG spokes with `steps(12)` — "the tick from spoke to spoke *is*
  the look". Later eight spokes ("eight halves nothing visually and trims the DOM — Kushagra's call").
  2026-08-06: an external audit found the transform on the `<svg>` root, which "is not reliably composited —
  some engines run it on the main thread", so "a main-thread rotation freezes at exactly the moment it is for";
  the animation moved to an HTML `<span>`. Rejected: `will-change` ("a hint requests a layer; it does not
  change which thread animates an SVG root's transform") and an inner `<g>`. (LOG 2026-08-03; LOG 2026-08-06
  "The spinner gains a wrapper…"; DECISIONS §8 "Loading")
- **Progress.** Shipped 2026-08-08 with the sweep, on the argument that "§8's law bans a `transition` … A
  sweeping segment is motion that IS the content". The 2026-08-31 performance pass found it animated
  `inset-inline-start`, "a LAYOUT property: animating it ran 120.3 layouts and 120.3 style recalculations per
  second on the main thread, measured at 16.55 ms/s against 0.47 ms/s for the identical keyframe written as
  `translate` — and it kept running offscreen and under `prefers-reduced-motion` … Eight bars on one screen
  cost 35.30 ms/s." It moved to `translate`. (progress.css:79-97)
- **Attachment** (§43, 2026-09-01) took "Progress's own indeterminate, motion that IS the content".

### The harness and the laws

The instruments section's short version:

- Motion was the single largest source of test machinery in the repo. It forced a page-wide "stillness" stylesheet onto every browser law (2026-08-09), a way to enter `prefers-reduced-motion` over CDP (2026-08-10), three clock-seizing instruments (2026-08-20), a CI exclusion marker with its own pinning law (2026-08-20), and a node law that forbids reading a gesture's effect on the next line (2026-08-21).
- The hardest problem was never the CSS. It was **time**: laws that read an animation at a moment they did not choose, on a machine whose scheduling they did not control. During the 2026-08-20 deflaking CI was red on 15 of 21 runs while the components were correct every time (LOG 2026-08-20 "A law that must catch a MOMENT does not run where the clock is not ours").
- The repeated failure of the laws themselves was one shape: a law that read a declaration, a token name, a landed state or a degenerate fixture, one step short of the thing that could be wrong. "Every broken axis was one where no law read a computed value" (CLAUDE.md, the 2026-08-03 lesson) was re-learned by motion many times over, and sharpened into "the input matters as much as the output" (LOG 2026-08-20 "A law over the general case needs an input where the general case can be wrong").

What went wrong with the laws themselves, and the CI saga, are in [What went wrong](#what-went-wrong).

The laws lived in `system/recipes.test.ts:1443-1966`, `tokens/tokens.test.ts:2183-2285`, `system/motion.browser.test.tsx` (454 lines) and the per-component `*.browser.test.tsx` files; the harness in `test/browser.tsx` (stillness, `inMotion`, `asksForStillness`, `holdPress`, `watchesFrames`, `KUI_STALL`); the motion bench, which covered the floating clocks only, in `apps/docs/app/preview/motion-panel.tsx` (2026-08-22).

#### The harness (`test/browser.tsx`, 792 lines)

The browser project ran Vitest browser mode on Playwright Chromium, headless, with the viewport pinned wide in `src/test/viewport.ts` (packages/ui/vitest.config.ts @39f3884). The harness installed every shipped stylesheet in the order `styles/index.css` imports them (a law, `test/cascade.test.ts`, compared the two orders position by position from 2026-08-26), mounted real components with `flushSync`, and read computed values. Motion added most of its time-related machinery. The table lists each motion-era instrument; the paragraphs after it give the mechanism, the reason and the known limits.

| Instrument | Where | Date | Motion-specific? | What it did |
|---|---|---|---|---|
| `holdStill()` / `inMotion()` | browser.tsx:214-261, :453 | 2026-08-09 | yes | stilled every transition and animation on the page unless the law opted in |
| `until(cond, ms = 3000)` | :283 | 2026-08-17 | no (general) | polled a condition once per animation frame until it held or a ceiling passed |
| `flushFlight()` | :301 | 2026-08-16 | yes | one microtask, so the entry runner's measurement had landed |
| `sweep(el, property, read, stations = 40)` | :325 | 2026-08-20 | yes | paused one running transition or animation and stepped its own clock |
| `catchDissolve(popup)` | :386 | 2026-08-20 | yes | held a dismissing panel 60% through its exit by pausing its clocks |
| `holdPress(el)` | :436 | 2026-08-22 | no (general) | a real `:active` via a raw CDP `mousePressed` with no release |
| `asksForStillness()` | :476 | 2026-08-10 | yes | made `prefers-reduced-motion: reduce` genuinely match, over CDP |
| `asksForContrast()`, `asksForSolidity()` | :495, :519 | 2026-09-11 | no (siblings) | the same for `prefers-contrast: more` and `prefers-reduced-transparency: reduce` |
| `settle()`, `settleAll()`, `renderSettled()` | :541-567 | 2026-08-09 (menu), promoted 2026-08-10 | yes | landed a floating panel by hand so a law read its arrived state |
| pointer parking in `afterEach` | :574-620 | 2026-08-10, widened 2026-08-16 | no (general) | moved the mouse away after any law that hovered or opened a portal |
| `watchesFrames`, `onCI` | :161, :197 | 2026-08-20 | yes | `it.skipIf(onCI)` for laws whose claim depended on when they looked |
| the stall audit (`__KUI_STALL__`) | :207; vitest.config.ts | 2026-08-20 | yes | CDP CPU throttling to reproduce a starved machine on demand |
| `seizeFlight()` | menu.browser.test.tsx:338 | 2026-08-20 | yes | paused every clock under a panel at the flight's depart edge and stepped them together |
| `test/frames.test.ts` | 99 lines | 2026-08-20 | yes | pinned the set of CI-excluded laws in both directions |
| `test/settling.test.ts` | | 2026-08-21, widened 2026-08-26 | general (born of the same CI flakes) | failed any law that read a gesture's effect in the next statement |

**Stillness by default: `holdStill()` and `inMotion()` (2026-08-09).** One `<style>` element held `*, *::before, *::after { transition: none !important; animation: none !important; }`. `render()` installed it on first mount, and `stillness.disabled = wantsMotion` switched it off only for a law that called `inMotion()`. `afterEach` set `wantsMotion = false` again (browser.tsx:214-261, :574). The reason, in the harness's own words: "The moment those states became eased, six of them started reading the first frame of a transition instead of the value they name — the colour a hover is leaving, not the one it is arriving at. Nothing about those laws was wrong; they were simply reading a moving thing at a moment they never chose." (browser.tsx:214-226; LOG 2026-08-09 "Motion reaches the control layer"). The first spelling of `inMotion()` was position-dependent, "and calling it one line too early silently gave three laws a frozen page again", so it became an order-free flag honoured for the rest of the test (browser.tsx:448-456). At 2026-08-20, 47 laws called it (LOG 2026-08-20 "A law that must catch a MOMENT…"); at `39f3884` there were 124 `inMotion();` statements across 27 law files. The instrument failed in both directions on its first day: a switch-shape law failed until `inMotion()` was taken OFF it, because "with the clock live, a `getBoundingClientRect` right after a change returns the animated value, not the target"; the hover-rise law failed the mirror way, reading "the rise 0ms into a 550ms clock" — "three times in one session, twice by the author who wrote the rule down" (LOG 2026-08-09). The card's first motion law repeated it on 2026-08-17: it opted a whole block into motion and read a correct hover rise as `0px`, "the first sample of a running 550ms spring" (LOG 2026-08-17 "The one component with a full state machine and no motion was the card you can press"). And `inMotion()` had to precede a `defaultOpen` mount: the entry began inside the mount's layout effect and read its release clock off the harness's pinned zeros, so "the flight was cut at 75px and snapped 275 more at release" (LOG 2026-08-15 "The circle comes back"; LOG 2026-08-14 "The entry stops being ported"). Its stated limit: "a mounted reading cannot isolate a component's own stand-down, since the harness's stillness sheet zeroes every transition and under `asksForStillness` the panel never gets a flight" (DECISIONS §42 @39f3884, ContextMenu, 2026-09-02).

**`until()` — wait for a state, never for a duration (2026-08-17).** It polled `condition()` once per `requestAnimationFrame` until it held or `performance.now()` passed a deadline (default 3000ms), and returned the condition rather than throwing, "so the caller still writes the assertion" (browser.tsx:263-288). It was written after "three such laws failed on CI in one morning and none of them could be reproduced here, idle or under full load". Its argument: `setTimeout` is a minimum, and a loaded runner overshoots it; "sampling inverts the failure direction … a slow runner samples LESS often, so an observation lands later, and later can only make 'has it happened yet' easier to satisfy"; "the deadline is a CEILING on something hung, not a timing claim". Roughly 270 lines in the browser suite called `until(` at `39f3884`. **The trap it set:** `until` resolves `false` on timeout, so a bare `await until(...)` with no assertion after it asserts nothing. The accordion's headline travel law ended that way and ran green with `block-size: 0 !important` on the panel and a rendered height of `0px` (accordion.browser.test.tsx:383-388 @39f3884; LOG 2026-08-31 accordion entry, "an `until` with no assertion behind it"; CLAUDE.md, the 2026-09-01 audit).

**`flushFlight()` (2026-08-16).** `await Promise.resolve()`, named. The unified entry runner stamped the pose synchronously and measured in a microtask, "because a ref callback runs before the commit's layout effects and a panel measured that early can be a half-laid-out sliver", so every law that read a flight's numbers had to let that microtask run "or it reads a pose with nothing written into it and measures NaN" (browser.tsx:290-303). Its limit, recorded 2026-09-10: it "turns the runner's own microtask and says nothing about React having committed the mount" — a keyboard-dismissal law that queried for the popup one microtask after a press failed on CI with "this law's own panel never opened" (LOG 2026-09-10 "The runner's clock was an input to the verdict, seven times over").

**`sweep()` — step an arrival by its own clock (2026-08-20).** It found the running `CSSTransition` whose `transitionProperty` matched, or the `CSSAnimation` whose `animationName` matched, read `getComputedTiming().activeDuration`, paused it, set `currentTime` to `clock × station / stations` for 41 stations by default, called `read()` at each, then restored `currentTime` and resumed (browser.tsx:306-356). It threw "nothing is arriving on X — running: …" when nothing matched, and "X has no clock to step through" when the duration was not positive. Two usage rules were written into it: `property` is the PHYSICAL name the engine transitions ("`height`, not `block-size` — the logical property is resolved before the transition is created"), and the subject is left playing so a law can go on watching it. Its reason: every earlier law that asked "does this move?" sampled once per frame and was "a claim about the MACHINE. A loaded runner hands the loop two frames where an idle one hands it thirty, so a perfectly smooth arrival reports the same two values a frozen one does — and those are opposite bugs whose repairs pull in opposite directions" (browser.tsx:306-321). Nine `sweep` call sites at `39f3884`: motion (the focus ring, 100 stations), select (the entry's height), popover and tooltip (scale and opacity), floating (the centred-body skew and the side-panel squeeze), surfaces (the seed's centre through the width's travel).

**`catchDissolve()` — hold a window open instead of racing it (2026-08-20).** Armed before the close, it watched for `data-ending-style` with a `MutationObserver`; in the microtask the stamp landed it paused every animation under the popup (`getAnimations({ subtree: true })`) and set each one's `currentTime` to `delay + activeDuration × 0.6`, then resolved with the box, the opacity, and a `release()` (browser.tsx:357-419). Pausing was also "what holds the popup mounted BY MECHANISM rather than by scheduling luck: Base UI unmounts a closing popup when `Promise.all(getAnimations().map((a) => a.finished))` settles, and a paused animation's `finished` never does". It rejected with "the ending stamp landed with no running exit to catch" when there was nothing to seize. **`release()` was added the same day**, because "holding a clock is borrowing it": a paused transition goes on rendering its held value, so a recovered panel sat "3.1px narrow, which is exactly 1% of its 311px box" — the exit's `scale: 0.99` (LOG 2026-08-20 "Stillness is not arrival — and a borrowed clock has to be given back"). Its stated wrong use: it seizes running ANIMATIONS, "and a transition does not exist until the style change is computed — one style flush after the microtask it arms in. It rejected on correct code" (popover.browser.test.tsx:1181-1183 @39f3884; LOG 2026-08-29 "`data-instant="focus"` is an input class"). Six call sites at `39f3884` (alert-dialog ×2, menu ×2, popover, command).

**`seizeFlight()` — seize a flight at its depart edge (2026-08-20, menu.browser.test.tsx:338-381).** Armed before the press, it observed `data-seed` and fired on the depart edge — "the pose off while the flight attribute stays on" — paused every animation under the panel, and returned `clock` (the longest `endTime`), `at(t)` (set every clock to `t` together) and `land()` (`finish()` on each, "the natural completion path (transitionend, never transitioncancel, which the dismissal listener is armed for)"). It stepped all clocks together because "a flight is MANY clocks on two elements, and stepping one while the others run desynchronizes exactly the relationships under test". Its boundary was stated in its docblock and in LOG: **"FIT FOR RELATIVE CLAIMS ONLY"** — body inside panel, body against the panel's edge — because "the panel's PLACE is floating-ui's, a wall-time loop the seizure cannot step: fast-forward the springs and the box is finished under an early placement, a state the browser never paints (measured: a 1-2px phantom seam in both alignments)" (LOG 2026-08-20 "A flight is seized by its clocks — except where its subject is a wall-time loop"). Three uses: the end-aligned content-slide law, the upward-opening containment law, and the glass-lens-for-the-whole-flight law (menu.browser.test.tsx:2766, :3523, :4363).

**`holdPress()` (2026-08-22).** It moved the mouse to the element's centre and sent a raw CDP `Input.dispatchMouseEvent` `mousePressed` with no release, returning a function that sent `mouseReleased` (browser.tsx:420-444). It corrected a sentence `button.browser.test.tsx` had carried since 2026-08-18 ("`:active` cannot be forced from script"): that was true of the driver, whose `userEvent.click` "fires down and up together", and false of CDP. The pointer was moved first because "a press with no preceding move lands on an element the browser does not consider hovered … so the reading would be of a state no user can produce", and the release was always given back because "a pointer left down leaks into the next law exactly as a parked hover does" (LOG 2026-08-22 "A sabotage that survives is evidence about the LAW"). Its sibling `asksForTouch` "was written, measured, and deleted in the same hour": "Chromium does not emulate the `hover` media feature — `Emulation.setEmulatedMedia` accepts it and `(hover: hover)` still matches" (same LOG entry).

**`asksForStillness()` (2026-08-10).** It sent `Emulation.setEmulatedMedia` with `prefers-reduced-motion: reduce`, so "the shipped `@media` block is the thing under test rather than a block of CSS nobody has ever executed"; `afterEach` reset the emulation (browser.tsx:458-481, :576-579). It existed because the suppression "was asserted by reading the stylesheet for a `prefers-reduced-motion` rule and checking which selectors appeared inside it — every character of which was correct while the focus ring went on landing" (LOG 2026-08-10 "Hover reaches the boundary… and reduced motion turns out never to have worked"). Sixteen call sites at `39f3884`. Its 2026-09-11 siblings (`asksForContrast`, `asksForSolidity`) reused the mechanism for two more preferences and each found a live defect the prop-keyed laws could not see (browser.tsx:483-526).

**`settle()`, `settleAll()`, `renderSettled()` (menu 2026-08-09; promoted to the harness 2026-08-10 on its second consumer, Select).** `settle(popup)` removed `data-starting-style`, `data-seed` and `data-unfurling`, removed `--kui-fly-w/-h/-bw`, and wrote `transition: none !important` inline on the popup and every descendant; `settleAll()` did it to every `.kui-floating, .kui-surface.kui-overlay`; `renderSettled()` was `render()` then `settleAll()` (browser.tsx:527-567). It existed because "a synchronous mount reads the entry's first frame instead: Base UI renders `data-starting-style` in the initial commit and drops it a frame later, so the popup such a law grabs is a 40px seed" — a row measured 68px against its 42px cell, and a two-line row "12px against its 24px cell, exactly the body's 0.5 squish" (browser.tsx:527-540; menu.browser.test.tsx:205-226; LOG 2026-08-09 "Motion ships, on Menu alone"). The menu law file shadowed the harness's `render` with `renderSettled` so "a new law cannot forget to" land its panel, and kept `openUnsettled()` for the laws that were about the entry (menu.browser.test.tsx:221-266). **Its trap, recorded three times:** because `settle()` writes `transition: none !important` inline, a law that used it and then read a clock read zero on a correct package (LOG 2026-08-29 "`data-instant="focus"`…"; DECISIONS §42 on ContextMenu; command.browser.test.tsx:120 and :1952 @39f3884). The surfaces reduced-motion law hand-landed its panel with "the harness's own `settle()` minus its one line that freezes transitions inline, which would poison the very property this law reads" (surfaces.browser.test.tsx:606-640 @39f3884).

**Teardown (browser.tsx:574-620).** After each test the harness reset `wantsMotion`, reset any emulated media, parked the pointer if needed, and unmounted every root. Pointer parking was added 2026-08-10 because "three radio look-axis laws failed exactly this way, and only in a full run: they read a resting border and got the hovered one … Passing alone and failing together is the signature"; it moved the mouse to the far corner of the pinned viewport, guarded on an actual `:hover` "because it is a CDP round trip per test and the suite is over a thousand of them" (LOG 2026-08-10). It was widened 2026-08-16 for portals: overlay laws click portalled buttons that unmount with their popup, "leaving the pointer parked mid-viewport with NOTHING hovered at teardown". The first widening queried for `.kui-portal` at teardown, "precisely the query that answers null in the case the paragraph above describes", so it became a record kept by a `MutationObserver` (`sawPortal`) set when a portal appears (browser.tsx:231-251, :581-611; LOG 2026-08-16 "AlertDialog ships").

**`watchesFrames`, `onCI` and the stall audit (2026-08-20).** `onCI` was `__KUI_CI__`, and `watchesFrames = it.skipIf(onCI)` (browser.tsx:160-197). Both build-time facts were compiled in by `vitest.config.ts` `define` — `__KUI_CI__: Boolean(process.env.CI)`, `__KUI_STALL__: Number(process.env.KUI_STALL ?? 0)` — because "browser mode runs the laws in a real page: there is no `process`, and Vite's `import.meta.env` carries only its own five keys (measured)" (vitest.config.ts @39f3884). When `__KUI_STALL__ > 1` a `beforeAll` sent `Emulation.setCPUThrottlingRate` at that rate, so "a fast machine reproduces a starved one on demand" and the excluded set is "DERIVED, not judged" (browser.tsx:199-211). The criterion for the marker is quoted in full in [The CI saga](#the-ci-saga).

Details from the other two sections. The floating section counts `sweep`'s default as "40 stations" where the paragraph above counts 41 (the parameter is `stations = 40`, stepped from station 0 to station 40); it says `seizeFlight` "paused every animation under the panel at the depart edge and stepped them together through 41 stations"; it records that a motion law that used `settle()` "read a clock of zero on a correct package", that `watchPose()` replaced `seeded()`, which was "a race by construction", and that under full-suite load a whole entry can fit in two frames, so the "decided once" collision law became a `MutationObserver` rather than a frame poll (2026-08-15). The controls section quotes the stillness instrument's error as happening "three times in one session, in both directions", and the parked pointer as "three radio look-axis laws duly failed … and passed perfectly when run alone. **Passing alone and failing together is the signature**" (LOG 2026-08-09; LOG 2026-08-10).

**Helpers that lived in the law files.** The menu file carried most of them (menu.browser.test.tsx @39f3884):

- `press(trigger)` used `userEvent.click`, because "Base UI's reveal test only trusts input the browser itself generated, and hand-built events are `isTrusted: false` — dispatching the full pointerdown/mousedown/click sequence still produced `data-instant` and no pose" (:136-144). The file's header recorded why a bare `element.click()` was never the subject: it "dispatches an activation with no pointer sequence behind it, and Base UI reads that as a non-reveal and stamps `data-instant`" (:127-135; LOG 2026-08-17 "The lab becomes the default" — the passage itself sits in LOG 2026-08-17 "ScrollArea ships as one export, Menu scrolls its list instead of its panel, Select waits on a measurement").
- `watchPose()` was armed before the click and resolved with the runner's `--kui-fly-w` at pose time, because "driving real input takes multiple frames, so by the time an `await press(...)` resolves the entry can already be over" (:146-189). Its hang guard went from 1s to 4s after CI went red at `ee665b7` (2026-08-23), a commit touching only composer files, when "the runner spent 125s of test time in this project" (:155-171).
- `seeded()` was deleted 2026-08-20: "It waited for `data-seed` to APPEAR on a popup handed to it, which reads as a helper and is a race … Its one consumer failed 6 runs of 6 when the file was run alone and passed inside the full file" (:191-197).
- `flightClock(popup)` read "the longest duration-plus-delay on the popup, plus the runner's margin" — "derived rather than written down, so a law about interrupting a flight cannot drift when the clocks are retuned", and read with the pose OFF, because "the pose declares `transition: none`, so a posed read answers zero" (:258-276).
- `departed(popup)` was `flushFlight()` plus three `requestAnimationFrame`s, throwing if the pose had not come off (:277-283). The 2026-09-10 audit called its three frames "a frame count rather than a signal" and checked all nine `departed()` sites: three had the signature of reading something that exists only in flight; one was already excluded, one measured green at stalls 20 and 40 and was left alone, and one ("the rows the flight reveals are the rows the panel rests on") failed at stall 40 and passed at 20 and was recorded rather than repaired, "because its two halves want opposite things" (LOG 2026-09-10).
- `stillWidth(popup)` watched for two identical widths a frame apart with a 2000ms ceiling, "watched, never slept to" (:285-311).
- `curveOn`, `samples`, `still`, `ending` (:1898-1930): `curveOn` read a curve token raw because `tokenOn`'s width probe "answers `0px` for a perfectly healthy `linear()`"; `samples` compared curves stop by stop because "the browser re-serializes `linear(0, 0.021 2.78%, …)` as `linear(0 0%, 0.021 2.78%, …)`"; `still` pinned transitions because "a computed value mid-transition is the ANIMATED value … Every law that reads a VALUE pins first; the ones that read the declared transition list must not, because pinning erases it"; `ending` hand-stamped `data-ending-style` because "the attribute IS the contract".

Elsewhere: select's `openItemAligned()` waited for `data-side="none"` as a state, because Base UI stamps a fallback side first (select.browser.test.tsx @39f3884; LOG 2026-08-20 "The rotation's last four laws…"); the context-menu file's `rightClick()` dispatched a `contextmenu` event with real `clientX/Y` and no `detail` (context-menu.browser.test.tsx:110-131; see the `detail` trap under [Base UI and floating-ui facts](#base-ui-and-floating-ui-facts)); the segmented and tabs files each carried a local `seize(el, at)` (segmented-control.browser.test.tsx:769-776; tabs.browser.test.tsx:524-531).

**`test/frames.test.ts` — the frame-watching laws are a closed, recorded set (2026-08-20).** It walked every `*.browser.test.tsx` for `watchesFrames(` call sites and held four laws: the walk found more than three (the negative control, "if the walk breaks, every assertion below passes by finding nothing"); every marked law is recorded with its transient; every recorded law is still marked ("or the list becomes a place laws go to be forgotten"); every reason is longer than 40 characters and is not the title. Its title extractor was an instrument with a defect of its own: the first spelling's character class `` [^`"']+ `` stopped at the apostrophe in "the panel's own contents", so a correctly marked law was recorded under a truncated title; it matched the quote by backreference from then on — "an extractor is an instrument, and an instrument is calibrated before its output is evidence" (frames.test.ts @39f3884; LOG 2026-08-20). The recorded set at `39f3884`, six titles and seven laws (one title is a template over two alignments), each with its transient:

| Law (file) | The transient it had to catch |
|---|---|
| "nothing jumps on the frame the flight ends — ${where}-aligned (§22)" (menu, ×2) | "the still plateau at the end of a real flight, before the release timer strips it — floating-ui converges in wall time, so the clocks cannot be seized." Its static half ran on CI. |
| "a panel that lands BESIDE its trigger grows out of the SEAM, not out of the row (§22)" (menu) | "the last AIMED SEED frame — a pose that holds about two frames and is hunted by polling." |
| "a dismissal taken back MID-FLIGHT lands on the flight it interrupted (§22, 2026-08-20)" (menu) | "a panel dismissed WHILE AIRBORNE — the premise is a window, not a state." |
| "the FIRST open flies to the settled width — the floor is inside the target (§22)" (select) | "`--kui-anchor-w`, which exists only while the flight does — the runner strips it at release." |
| "the entry moves neither the page nor the panel's own contents (§8, §22)" (select) | "the entry's opening frames, where the page offset is taken and given back." |
| "the seed of a pin-corrected flight never leaves its trigger (§22, 2026-08-25)" (menu) | "the aimed SEED frames of a flight whose positioner pin was corrected … Its deterministic siblings … run on CI." |

The set was five laws on 2026-08-20 ("the release seam (×2 arms), the submenu's aimed-seed frame, the dismissal taken back mid-flight, the select flight-width agreement, and the entry's page-scroll sampler", LOG 2026-08-20). A select law ("the panel's floor is the trigger's RESTING width") was added 2026-08-21 after it failed on CI at "112 against 115.45" (LOG 2026-08-21 "Main went red on two laws that raced a window") and is not in the set at `39f3884`; the pin-corrected seed law joined 2026-08-25.

**`test/settling.test.ts` — a driver gesture resolving is not the browser having settled (2026-08-21, widened 2026-08-26).** A node law that walked every browser law file and failed any `await userEvent.click|dblClick|keyboard|hover|unhover|tab|fill|type|selectOptions|upload` followed, on the next statement, by a read of `getAttribute`, `querySelector`, `.matches(`, `isConnected`, `activeElement`, `hasAttribute`, `textContent` or `.length` that was not awaited. It was written because "this defect has now produced five CI failures over two days, and the previous round SWEPT all eight instances that existed. It came back anyway" — the overlay work of the same week wrote three more, and `dialog.browser.test.tsx`'s `warnings()` helper had been rewritten to wait "while its twin in `alert-dialog.browser.test.tsx` fifty lines away still slept a flat 60ms — and that sleep is the one CI caught" (LOG 2026-08-21 "The shape is forbidden by a law now…"). The one exception was a claim about a NON-event ("this press did NOT close it"), marked `// SETTLED-BY-DESIGN: <why>` with a reason longer than 30 characters; there were three at `39f3884`. The 2026-08-26 widening closed two blind spots that were "the same defect this file exists to forbid, wearing the file's own name": a read not spelled `expect(` (a bare `const popup = document.querySelector(…)` after a click), and a gesture wrapped in a local helper (`press()` in the menu laws, `openByClick()` in both overlay files — eleven call sites invisible). A helper counts as a gesture unless it itself waits (`until` or `expect.poll`; "a raw frame yield is deliberately NOT here: 'one frame is enough' is the bet, restated"). Its vacuity guards counted each arm separately: more than 20 direct gestures, more than 0 helpers, and more than 20 gesture-then-state pairs examined (settling.test.ts @39f3884).

**Timeouts.** The node project took `testTimeout: 30_000` on 2026-09-10 as "a HANG-GUARD, not a claim about speed", because every node law "terminates or it loops forever" and vitest's 5s default "was instead making the machine's load part of the verdict" (vitest.config.ts @39f3884). The same raise was rejected for the browser project: "There a timeout is frequently the finding — 'the panel never opened' is what several laws exist to say" (LOG 2026-09-10).

#### The laws

##### `system/motion.browser.test.tsx` — the cross-component laws (454 lines)

Its header states the two things it held that no component file could: `prefers-reduced-motion`, "which the suite could not enter until 2026-08-10 and therefore had never once executed", and hover across families (motion.browser.test.tsx:1-12).

- **"a button's ring does not land when the system asked for stillness" (:63).** Focused a mounted Button with motion on and asserted `animation-name` was `kui-ring-land`; entered reduce and asserted `matchMedia` really matched; re-focused and asserted `animation-name: none`, while `outline-width` stayed positive and `outline-offset` equalled `--focus-ring-offset` ("stillness removes the travel, never the affordance"). Its comment carries the defect it was written for: `.kui-control:focus-visible:not(input, textarea, .kui-row)` was (0,3,0) because `:not()` takes its most specific argument's weight, the stand-down was (0,2,0), "a media query adds nothing, so the ring landed under `reduce` in every browser, for six days, with the suite green".
- **"and the paint stops with it — suppression is total, not partial (§8)" (:81).** Asserted every entry of `transition-duration` was `0s` under reduce, "because the user who asked for stillness gets it in pieces" otherwise.
- **"the moving PARTS stop too — a selector in the block still has to WIN (§8, 2026-08-10)" (:93).** Mounted a checked checkbox, an indeterminate checkbox, a chosen radio, a checked switch and a slider; calibrated that each part (the tick's stroke, the dash's stroke, the radio's dot, the switch's grip, the slider's grip) had a live clock in motion mode; then asserted each computed `0s` under reduce. The first spelling "pointed at an unchecked radio and a checked box's dash, both of which ride their own instant-out arms … so deleting their stand-downs changed nothing and the sabotage pass caught the law, not the code. An instrument has to be pointed at the state it names."
- **"a button's travels, and it travels in whole pixels — which is the constraint" (:148).** Swept the `kui-ring-land` animation at 100 stations reading `outline-offset`. Asserted it began at `rest + land` (2 + 4 = 6px) and settled at `rest` (2px); that it was drawn at no fewer distinct stations than the pixels it crosses (`≥ land + 1`); that it moved through more than two values; that the travel token `--focus-ring-land` was at least 4px; and that the range crossed equalled `land`. It retried focus up to five times because "a CSS animation is gone from getAnimations() once it has finished and a stalled runner can spend the whole ~200ms between two statements". History: written 2026-08-10 as a frame sampler; CI reported "the ring did not travel at all: expected 2 to be greater than 2"; rewritten on `sweep` 2026-08-20; restated 2026-09-10 from "every station is a whole pixel" to "at least one station per pixel crossed" after Chromium 141 rendered "96 distinct sub-pixel stations" (LOG 2026-09-10 "Three repairs that survived a collision"; DECISIONS §8 @39f3884 line 707).
- **"a field's ring is instant — the one arrival the mechanism cannot carry" (:235).** Focused a TextField's input and a TextArea's inner textarea; asserted `animation-name: none` on each wrapper and a single `outline-offset` value across 200ms of samples.
- **"a control hosted in a field still gets its own ring (§4)" (:260).** A Button in a TextField's `trailing` slot still took `kui-ring-land`, and the field's own outline stayed `none`.
- **"hover is one step in one currency, under a real pointer — ${appearance}" (:288).** In both appearances, hovered a TextField, a TextArea and a Checkbox with `userEvent.hover`, waited for `:hover` as a state, asserted the fill moved and the border did not. The currency changed 2026-08-17 (the fill-first flip deleted the border-mix hover rule), and the law kept "the stronger claim: hover is ONE step … a law that only checked the fill would go green again the day someone re-adds a second channel".
- **"and it steps on the paint clock, not on a spring — a colour is a signal (§8)" (:339).** Read the field wrapper's computed lists: `border-color` had a non-zero duration and an easing that was not `linear(`.
- **"nothing on it travels or scales under a real pointer, and the seal holds" (:358).** Deliberately NOT in motion: a field's `translate` and `scale` stayed `none` at rest and hovered, and its fill moved under the pointer.
- **"a press outranks every rule that lights a control" (:417-452, the 2026-09-01 audit).** Three subjects held down with `holdPress`: an unpressed Toggle, a hovered Row, a `highlighted` Row. Each lit fill had to differ from its pressed fill. The defect: three lit rules had each reached (0,4,0) through `:not()` and beat the shared press; "a plain `<Row>` went rest -> hover -> press all `oklab(0 0 0 / 0.03575)` with `:active` true". The docblock: "IT IS A MEASUREMENT, NOT ARITHMETIC … a selector that is present still has to WIN."

##### The node-project motion laws

These read the shipped stylesheets and the generator's output. They could read a declaration exactly, without frames, on any machine.

**`system/recipes.test.ts` @39f3884:**

- **"every :hover rule is guarded by (hover: hover) — and :active never is" (:1443).** No `:hover` declaration outside a `(hover: hover)` block in any sheet; the shared layer's `:active` unguarded ("Press is the only feedback a touch device gets"). Until 2026-08-26 it read ONE file, so three component guards — "button.css's 1px hover rise, select.css's and link.css's" — were asserted by nothing: "every button pressed on a phone stayed hanging above the page". Vacuity guards in both directions. It was written 2026-08-03, where it first "*passed against a comment*", so comments are stripped first.
- **"the press keeps its colour instant — the 2026-08-03 finding, in CSS (§8)" (:1477).** The press block `.kui-control:active:not([data-disabled]):not([data-loading])` set `--kui-ct-paint: 0s`, `--kui-ct-move: var(--motion-press)` and `--kui-ct-move-ease: var(--motion-spring-stiff)`; the hover block read `var(--motion-hover-in)`. The spelling with two `:not()`s was pinned on purpose (2026-09-01) because the one-list spelling "sat at (0,3,0) and lost to three lit rules that had reached (0,4,0) by the same accident". Structural because, at the time it was written, "`:active` is the one interaction state a headless harness cannot genuinely produce".
- **"a press belongs to the family that owns it (§8, 2026-08-09)" (:1499).** The squash rule named `.kui-switch` out; the select trigger's press stated `--press-travel` and `--press-scale` and its hover `calc(-1 * var(--hover-travel))`; every `--thumb-lean` rule was reached from `.kui-switch:active`, because "`:active` matches the activated element and its ANCESTORS, never its descendants, so a thumb-keyed rule fires only when the pointer happens to land on the grip".
- **`resolveHooks` and `channels()` (:1541-1620).** The two transition laws below substituted a channel's private hook variables before judging it. `resolveHooks` knew only `--kui-ct-` until 2026-08-17, when the interactive surface's `var(--kui-sf-move)` came back unresolved and "a correctly-sprung translate reported as unsprung and a correctly-tokenised duration as hand-typed. Those failures were RIGHT: an unresolvable hook is indistinguishable from an invented one"; it was widened to both stems. From 2026-09-01 a component's channels resolved against the layers too, since components read the skeleton's hooks by membership. From 2026-09-12 a transition list was split at TOP-LEVEL commas by a depth counter: the naive `split(",")` cut `transform calc(var(--motion-drawer) * var(--drawer-swipe-strength, 1)) var(--motion-spring-carried)` at the fallback's comma, and "two laws reading one string disagreed, so the disagreement was the instrument's".
- **"every transition in the package rides a motion token (§8)" (:1621).** For every `transition:` in every sheet, after stripping `var()` references, no literal duration but `0s` survived, and each channel named a clock family: `--motion-*`, `--floating-*`, `--overlay-*`, `--alert-*`, `--dialog-*`, `--tooltip-*`, or `0s`. The strip was the whole law: "the first spelling asked whether the channel mentioned a motion token anywhere, and every channel does — its easing is one. So `scale 150ms var(--motion-spring-stiff)` passed while carrying exactly the hand-typed duration this exists to forbid" (LOG 2026-08-09 "Motion reaches the control layer": "Fifteen sabotage passes, fourteen caught first time. The one that got through…").
- **"geometry rides a spring, paint eases — the two clocks, everywhere (§8)" (:1653).** Paint channels (`background-color`, `border-color`, `color`, `opacity`, `fill`, `stroke`, `box-shadow`, `filter`, `text-decoration-color`, `visibility`) must not name `--motion-spring`; every other channel must name one of `--motion-spring(-driven|-carried|-stiff|-lively|-elastic|-poised)?`. `box-shadow` joined 2026-08-10 ("light, not mass"), `filter` 2026-08-14 ("blur is FOCUS"), `text-decoration-color` 2026-08-21, `visibility` 2026-09-06 ("a DISCRETE property").
- **"a var() without a fallback resolves SOMEWHERE — a dangling name is a disarmed declaration (2026-08-14)" (:1693).** Born of the floating body's counter-squish, which "shipped reading `var(--floating-rise)` — a token that never existed — and because a dangling var() invalidates its whole declaration at computed-value time, the transition was silently absent from the day it shipped". Fallback-bearing reads were hooks and free; runtime-written names carried an allowlist, each with a sentence. `--kui-floating-gap` left the allowlist 2026-08-22 because "an allowlist entry is a promise that a name is read somewhere the law cannot see, so an entry for a name nobody reads is the one thing it must never contain".
- **"nothing moves that is not stood down under reduced motion (§8)" (:1753).** Every rule that declared a non-`none` transition outside a guarded block had to be inside the shared scope (`.kui-control`, `.kui-mark`, the named families) or be named verbatim by some `@media (prefers-reduced-motion: reduce)` block in the package. Until 2026-08-26 it skipped any file that contained the guard string anywhere, "which is every file that has anything to stand down", and "renaming, narrowing or re-ordering that stand-down's selector left all ~1,900 laws green" for the tab rule and the segment thumb. Also found: the old test `/transition\s*:\s*(?!none)/` matched `transition: none` because "`\s*` backtracks to zero width", so every stand-down counted as a declaration. Vacuity: more than 20 declaring rules checked, or the law reports that it "found no clocks at all".
- **"and an ANIMATION is stood down too — the half this law was missing (§8, 2026-08-10)" (:1861).** Every `animation:` either read the `var(--kui-ct-ring)` hook or lived in a sheet with its own guarded block (motion-as-content).
- **"every selector that declares an arrival is a selector that stands it down (§8)" (:1885).** The selectors declaring `--kui-ct-ring` before the guard and inside it had to be the same sorted list: "Standing the HOOK down rather than the rules that read it means the recipe and its stand-down share a selector — so the tie goes to source order and can never again be lost by one point of arithmetic nobody redid."
- **"the panel families are inside the reduced-motion guard at all (§8)" (:1904).** Narrowed 2026-08-16 from a scan for the words `margin, translate, scale, opacity, inline-size, block-size, filter` inside the guarded region, which "was green through the whole life of the two defects the mounted laws found in an afternoon … and it went red on the day those undo rules were correctly DELETED — a law that fails on the fix and passes on the defect is worse than no law". What it kept was membership: `.kui-surface.kui-floating`, `.kui-floating-body`, `.kui-surface.kui-alert-popup`, `.kui-overlay-body` and `.kui-row` named inside the guard, with `transition: none`.
- **"no component source attaches an interaction-time handler (ENGINEERING §1.5)" (:1060).** A regex over component sources for pointer/mouse/touch handlers, `addEventListener` of pointer/mouse/touch/scroll/wheel/keydown, observers, `requestAnimationFrame`, `setInterval`, and (from 2026-08-31) `getComputedStyle`/`getBoundingClientRect`, with a per-file, per-mechanism `EXEMPT` table carrying a sentence for each entry. The floating runner's exemptions were the flight measurement and the content watcher. It was rewritten 2026-08-17 because its first form "asserts that :hover appears in a stylesheet, which was never in doubt"; widened 2026-08-26 because it "could not see an observer", which "is how ALL FOUR of the bounded exceptions the doctrine names are implemented"; and widened 2026-08-31 because `panelSeam`, "a plain function handed to a third-party positioning prop, evaluated three times per position pass and re-run on every ancestor scroll", matched no banned shape "so the law reported the file clean for three weeks". The 2026-08-31 performance handover also recorded that it "cannot see React's `onKeyDown`/`onFocus`/`onScroll`/`onClick` props … does not ban `setTimeout` while banning `setInterval`" (docs/handovers/2026-08-31-glass-motion-perf.md @39f3884); the regex at `39f3884` still did not include those.

**`system/surfaces.test.ts` @39f3884:**

- **"the exit keeps every channel the entry moves alive (§8, §22, §24)" (:565).** For the floating family and the overlay family, every property named in the base rule's transition had to appear in the `[data-ending-style]` transition. "A running transition is CANCELLED the moment its property drops out of `transition-property`" — the floating exit shipped without `box-shadow` for a day, and "a menu dismissed 35ms in snapped 169 → 303px in two frames". So "the list is not trusted, it is DERIVED". Its `transitionOf()` searched every rule with the selector, not the first, because a family "states its identity and its motion in separate blocks under the same selector" (LOG 2026-08-16 "The dialog's entry locks on depth, and the audit before it collapsed two runners into one").
- **"the instant exemption is one set stated twice, and the two agree (§8, §22)" (:954).** Read `const FLIES_ANYWAY = new Set([...])` out of `system/floating.tsx` and the `:not([data-instant="…"])` chain out of surfaces.css, sorted both, required them equal, and required every arm of the stand-down to carry the same chain. The runner decided whether a panel was POSED and the stylesheet whether any CLOCK ran, "so a value exempt in one and not the other is a panel posed and never animated" (LOG 2026-08-29).

**`tokens/tokens.test.ts` — "the springs are physics, and the emitted curve is that physics (§8)" (:2183).** Written 2026-08-16, when "nothing read `springs` or the emitted curves, so `elastic` … could have been replaced by a ringing curve with the suite green, while DECISIONS and CLAUDE.md both claimed a re-derivation law existed" (LOG 2026-08-16). Per spring: the emitted `linear()` had `steps + 1` points, started at exactly 0 and ended at exactly 1, and every interior sample matched a damped step response to two decimals — computed by an independent implementation in the law, "a law that calls the code under test agrees with it by construction", with a critical-damping branch and a launch velocity `v0` added 2026-09-06. Then each curve's claimed behaviour, counted off its own samples: peak under 1.16; at most one upward crossing of the target; `stiff` never above 1; `driven` never above 1 with zero crossings and a first sample above 0.05 ("it LAUNCHES"); and a vacuity guard (more than four samples above 0.5). A separate law asserted every spring in config was emitted and nothing else claimed to be one. The laws' own titles were "every spring in config is emitted, and nothing else claims to be a spring" and, per spring, "the emitted curve is the ζ and ω config states" and "crosses its target at most once". The button's own law read lively's rebound as an amplitude, not a crossing count: peak between 1.05 and 1.2, rebound after the peak above 0.98 — "Over this curve's real travel (a one-pixel hover rise) 1% is a hundredth of a pixel." (button.browser.test.tsx:1257-1290)

**The zero-motion law of 2026-08-03.** Before any motion system existed, a 120ms transition shipped on Button and was withdrawn the same day ("taste-level decisions are not the implementation's to make"). "All transitions removed — every state change instant on both pointer worlds, motion tokens wired but unread, a law asserting the recipe layer names no `transition`" (LOG 2026-08-03 "Button meets a real phone, and three settled answers reverse"). That law was the state of the package until 2026-08-09.

##### The motion laws in the component files

At `39f3884`, 27 of 69 browser law files opted into motion. By title, the motion claims were:

- **Menu** (the richest file, ~2,600 lines of motion laws from :1897): the trigger stays lit and its geometry held pressed while open; the first frame is the trigger's silhouette, opaque, with the body squished `0.95 0.5`, blurred, empty, and the seed casting nothing; a keyboard dismissal dissolves on the same clocks as a pointer's; a controlled menu still flies after an Escape; the floor does not step at release; a glass panel builds its lens at most four times per entry; a mirrored submenu grows out of the seam; a side-opening panel grows from the seam; the box it grows into is measured and, when capped, is the capped box; the glass lens is worn for the whole flight; seeds sit on the nearest edge in RTL and LTR; the body pivots on the edge it is pinned to; an unaimed seed paints nothing; a panel dismissed mid-entry stops answering the pointer; nothing the seed moves is missing from the transition list; the panel falls before it spreads; geometry rides the spring and paint does not; the exit dissolves, holds geometry, and uses the non-overshooting stiff spring faster than the entry; a reopen mid-dissolve is caught, not replayed; the catch resets the list's scroll; suppression is total under reduce; the content does not slide in end-aligned; the flight's pin puts the body where flow does; a constrained top-opening flight anchors to the clamped box; the side is decided once; the measurement survives StrictMode's double ref callback; each trigger gets its own seed; both channels are free to move; the posed content is invisible, molten, and a step below; an upward panel keeps its content inside every frame; the panel clips with `clip`, never `hidden`; the overlay is paint, never layout; the pivot follows side and align; a keyboard open flies.
- **Select**: the flight borrows Base UI's inline height and gives it back; the width floor is the trigger's layout box; the entry's height sweep moves more than two distinct values and more than 20px; the chosen row lands on the trigger; the entry replays on every open; the page does not move.
- **Context menu**: the seed is a zero-size box at the cursor (`--kui-seed-w/h/r` all `0px`), read against a Menu that must publish a real seed; its clocks equal a landed Menu's.
- **Popover / Tooltip**: only depth and paint move (popover, from 2026-09-14) or only scale and paint move (tooltip, from 2026-08-31); the seed is the landed box scaled; the curve is the named spring; the exit returns to the seed; a focus-out dismissal dissolves; a controlled popover still flies after a focus-out; a caught reopen resets only the popup's own viewport.
- **Dialog / AlertDialog / Sheet / Command**: dialog starts a step back in depth, moves no size channel, rides `poised`, focuses its content with the box, dissolves, retargets mid-arrival, and stays centred under reduce; the alert materializes, dissolves, is caught mid-dissolve, stays quiet under reduce, and lets the page answer the hit test while it dissolves; the sheet slides on the drawer's clock with its scrim on one clock, and is simply there under reduce; the command palette's seed is its bar's bottom edge, it flies on the floating family's clocks, and it publishes the layout box it heads to.
- **Controls**: the button's paint clock is one variable read by name, and its geometry has mass (button.browser.test.tsx:1240-1252); the done state swaps glyphs; the checkbox tick draws in on a spring and returns instantly, the dash is its own sentence, a held mark squashes; the radio's dot grows in and vanishes instantly; the switch thumb crosses on the calm spring drawn by both edges, leans from the root, does not lean when dead, stays a capsule while leaning; the slider grip squashes while held and its travel is never sprung; the segmented thumb sits on its seat, stretches mid-flight, never crosses the channel wall, is placed without a flight on first paint, and stops under reduce; the tab rule travels as two edges at two speeds, stretches, never leaves the bar, and lands in the overflow region; the interactive card rises by the button's pixel, sinks by its own distances, lands its ring, and stills under reduce; the accordion panel travels by height, clipped.
- **Content motion**: the spinner ticks spoke to spoke with `steps(8)` on a composited wrapper and slows (1s to 3s) under reduce; the indeterminate progress sweep slows (1.6s to 4s) under reduce and, after the 2026-08-31 performance pass, "moves the segment WITHOUT moving its box".
- **System**: floating.browser.test.tsx swept the centred-body skew and the side-panel squeeze across a seized clock; surfaces.browser.test.tsx read the seed's centre across the width's travel and held that "suppression is total, and it reaches the way OUT" with both the clock arm and the pose arm read together, "and either alone is inert" (surfaces.browser.test.tsx:601-605).
- **Family agreement laws** (the floating section): Select was pinned to the same computed recipe as Menu; ContextMenu's clocks agree with a mounted Menu's; the popover's clocks agree with the dialog tokens. After the ContextMenu audit showed that laws reading the stylesheet had passed on the wrong design, the flight laws read what the runner WROTE (`--kui-seed-*`, `--kui-from-*`) rather than the stylesheet.

##### The shapes a motion law took, and the trap each fell into

**1. Declaration laws in the node project.** They read stylesheet text or generator output. They were exact and machine-independent, and the 2026-08-20 rule sent claims here first: "Where that is impossible, the claim belongs on the animation's SETUP" (ENGINEERING §6 @39f3884). Their traps were all ways of reading text instead of meaning: a token's presence laundered a hand-typed duration (2026-08-09); a selector present in a guard block was taken as a selector that wins (2026-08-10); `transition` was checked and `animation` was not (2026-08-10); "every X" was checked in one file (2026-08-26, the hover-guard law); a whole file was skipped because it contained the guard string (2026-08-26); a regex backtracked `\s*` to zero width (2026-08-26); commas inside `var()` fallbacks split one channel into two (2026-09-12); a hook the resolver did not know looked like an invented one (2026-08-17); and a word scan "fails on the fix and passes on the defect" (2026-08-16).

**2. Computed-declaration laws on a mounted element.** They read `transition-property`, `transition-duration`, `transition-timing-function` or `animation-name` through `getComputedStyle` on a real component. Traps: the seed pose declares `transition: none`, so a list read while posed is empty ("Un-seeded first", menu.browser.test.tsx:3092); `still()` and `settle()` pin `transition: none`, so they must not be used before reading a list; `transition-property` with nothing declared computes to `all`, "which reads like a transition and is not one" (segmented-control.browser.test.tsx:957-958); curves must be compared by samples because the browser re-serializes `linear()`; `tokenOn` answered `0px` for a `linear()` and for unitless tokens (hence `curveOn` and `numberOn`); and reading channels by position is "the degenerate-fixture rule in an assertion: it agrees with the truth only while one incidental fact holds" (button.browser.test.tsx:1243-1248, 2026-09-02). **A stopwatch where the answer was declared** failed on CI: the tooltip law timed its release and required it under `form + 200`; CI measured 580.8ms, which "looks exactly like the defect and was not" — the release deadline fired ~230ms late on a starved runner. It read the longest declared `duration + delay` instead, "where the runner reads it", and was falsified at "the release deadline is 510ms, not the tooltip's 300ms" at every stall level (LOG 2026-09-10).

**3. State-stamping cascade laws.** They wrote the library's own attributes (`data-seed`, `data-aimed`, `data-unfurling`, `data-ending-style`, `data-starting-style`, `data-align`) onto a real panel and read what the cascade answered, with no clock involved. "The stamps are the library's, and a law is allowed to write them" (LOG 2026-08-23 "Two mechanisms that could be deleted with the suite green now have laws"). The trap was choosing the cell: "The obvious spelling of the hit-test law — open, let it land, Escape, read — passes on the defect: `[data-unfurling]` is what forces `auto`, and it is off by the time a settled dismissal is read. So the law stamps both attributes, which is the state a mid-flight dismissal produces and the only one where the two rules disagree" (same entry). The aim-gate law read both states of the same panel because "`opacity: 0` on every seed frame would satisfy a one-sided law, and that is a panel that never appears at all". The static seam law had to supply `--kui-fly-w/h` exactly as the runner did, because "the pin takes the body OUT OF FLOW, so a panel left to size itself collapsed from 215px to nothing", and had to stamp `data-align` because driving it by collision "a landed panel does not reproduce" (menu.browser.test.tsx:3548-3569). The dialog pose law compared the starting pose with the panel's own resting pose, because "`scale: none` and `scale: 1` are the same picture and different strings, and the first spelling of this law asserted the string — it failed on correct code" (dialog.browser.test.tsx:1348-1352). A pose is also "a declared VALUE the transition pins cannot strip", so the alert's exit law landed the entry before hand-stamping the exit (LOG 2026-08-20 "The rotation's last four laws…").

**4. Media-emulation laws.** They entered `prefers-reduced-motion: reduce` over CDP. Traps: a law must calibrate that the media query fired ("without it this law passes when the media feature never fires at all", button.browser.test.tsx:1433-1435); it must point at the part in the state whose clock is live (2026-08-10); per-part calibration must precede the stillness assertion; the clock arm and the pose arm must be read together or a single-arm sabotage survives (surfaces.browser.test.tsx:601-605); and a mounted reading could not isolate a component's own stand-down when the component had none (DECISIONS §42). `hover` could not be emulated at all in Chromium (2026-08-22).

**5. Seized-clock sweeps.** `sweep`, `catchDissolve`, `seizeFlight`, and the local `seize()` in segmented and tabs. They read what the engine renders at chosen instants of a paused clock, "in one synchronous block that no dropped frame can interrupt" (browser.tsx:311-316). Traps: the property name must be the physical one; a finished CSS animation leaves `getAnimations()`, so the ring law retried the focus; stepping one clock of many desynchronizes relationships (so `seizeFlight` pauses all); a seizure cannot step a wall-time loop (floating-ui's placement, a release `setTimeout`, the browser's scroll restoration) and produces "a state the browser never paints"; a seized clock must be released; a transition that has not yet been created cannot be seized; and a sweep needs a calibration half so a tamed spring cannot pass as a clamped one — the segmented wall law required the RAW registered inset still to cross the wall mid-flight, "so a build that quietly swapped calm for a non-overshooting curve fails here instead of shipping a different motion under a green wall" (segmented-control.browser.test.tsx:894-907; LOG 2026-08-25 "The channel has walls").

**6. Delivered-event laws.** A `MutationObserver` armed before the gesture read the element in the microtask a stamp landed, so "it cannot miss the stamps, because they are delivered rather than sampled" (select.browser.test.tsx:1720-1728). This was the second of the three sanctioned mechanisms in `watchesFrames`'s docblock. Traps: arming after the gesture; reading at the seed stamp when "the seed stamp is only the visibility GATE" for a select, whose geometry lands later — the depart edge is "the moment the claim is ABOUT" (LOG 2026-08-20 "The rotation's last four laws…"; CI "70 ≤ 36" reproduced exactly by a pose-skip sabotage); disconnecting on the wrong edge — the side-decided law first ended its watch when `data-unfurling` dropped and "the sabotage's flip lands ~2ms later, so the observer disconnected through the gap" (LOG 2026-08-20 "three different lies about time"); an observer that may never fire, so the pin law kept "an immediate read beside it, because whether the observer ever fires is itself a race … and only one of the two arms needs to win" (LOG 2026-09-10); and a transient attribute toggled and restored by the runner's own probe in one synchronous block, which an observer must skip ("the depart probe toggles the attribute and puts it back in one synchronous block, so by this microtask it is present again", menu.browser.test.tsx:3816-3817). The strongest form was edge-anchoring: "A MutationObserver fires in the strip's own microtask, before anything can repair the geometry it reads, so the pre-fix state … is caught every run or none" (menu.browser.test.tsx:3805-3811).

**7. Real-pointer and real-keyboard laws.** `userEvent` (which drove CDP), `holdPress`, keyboard opens. Traps: see [Base UI and floating-ui facts](#base-ui-and-floating-ui-facts) for the input-class stamps (`data-instant`) a synthetic event produced; `:active` over before a statement could read it; a hover aimed at a trigger still covered by the flying seed, which "hit-tests by design" — waited out with `elementFromPoint` before the pointer was put there (menu.browser.test.tsx:2003-2018); Base UI's backdrop inerted the page behind an open menu, so the hover calibration had to run BEFORE the open ("the first spelling waited fifteen seconds for a twin the backdrop would never surrender", :1971-1975); Base UI's press-drag window ignored a release inside it, so the select laws waited it out (600ms, select.browser.test.tsx:1705-1707); and a `defaultOpen` alert or dialog focused the POPUP, "so the focus law must open by real click" (LOG 2026-08-16 "AlertDialog ships"). The focus-ring laws learned that on a BUTTON, Chrome matched `:focus-visible` after `el.focus()` "only when the last interaction was a key", so the card's ring law tabbed to the card instead (LOG 2026-08-17 card entry).

**8. Frame-watching laws.** `requestAnimationFrame` samplers and real-time plateaus. The first was written 2026-08-09: "click, sample across the whole entry, and assert both axes report more than two distinct sizes with no single frame covering a fifth of the distance", because "nothing that samples a single instant can tell a channel that travelled from one that was pinned at its destination" (LOG 2026-08-09 "Motion ships, on Menu alone"). Its metrics died one by one on CI (menu.browser.test.tsx:4158-4190; LOG 2026-08-20 "three different lies about time"):

  1. "no frame covers more than a fifth of the distance" — "a loaded runner hands the loop one frame where an idle one hands it ten, and the same smooth entry reports a 45px step out of 47";
  2. "no interval exceeds six times the average px/ms" — "unbounded as the interval shrinks. CI: `107 -> 110` across a THREE millisecond gap, three rounded pixels read as 1.07px/ms";
  3. "the box must be seen in the middle third of its travel" — "CI falsified it within one run: `widths 67,67,67,69,73,77,115,112` with `gaps 340,261,12,14,16,192`. The runner stalled 192ms exactly across the band";
  4. the final form made no frame claim at all: it asserted the inline channel had the longer span and was the flight's clock, then probed with transitions pinned off that, in the flight state, a target below the floor was honoured in both axes — "What is asserted is the FREEDOM the channel needs, not a photograph of it being used."

  The diagnosis: "**The sampler runs on the thread that is stalling**, so a smooth entry it failed to watch and an entry that genuinely snapped hand back the same numbers — and the repairs for those two are opposite, which is why every new bound bought one more week." What remained was excluded from CI by `watchesFrames`. At `39f3884` one sampled "passes through the middle" claim sat outside the recorded set: the accordion's travel law, repaired by the 2026-09-01 audit with a rAF sampler requiring a height strictly between the ends (accordion.browser.test.tsx:383-404) — the shape LOG 2026-08-20 records failing on CI in the menu file.

**9. Agreement laws.** Two homes for one fact, compared, so neither could drift: the exit's channel list against the entry's (surfaces.test.ts); `FLIES_ANYWAY` against the CSS stand-down (surfaces.test.ts); ContextMenu's clocks against a landed Menu's (context-menu.browser.test.tsx:548-575); a keyboard dismissal's exit clocks against a pointer's (menu.browser.test.tsx:2083-2189); the accordion heading's transition list against a mounted Button's, because "`transition` is a shorthand and this component states one, so it replaces the skeleton's whole list rather than adding to it" (accordion.browser.test.tsx:407-419); the flying body's pin against its `transform-origin`, read off a single body across dir × align (LOG 2026-08-23 "The flying body pivoted on one edge and was pinned to another"); the tooltip's scale curve against the calm spring's samples; `SIDE_OFFSET` against four source files. Trap: an agreement law is a floor — the §20 portal agreement law "can only ever catch ONE mistake, a dropped stamp", and "an agreement law is a floor, not the whole enforcement" (menu.browser.test.tsx:9-17).

**10. Geometry, hit-test and pixel laws.** `getBoundingClientRect` (the painted, transformed box), `offsetHeight` (the layout box), `elementFromPoint` (the viewer's space), `getScreenCTM` (the tree chevron's apex, "an instrument that assumes an order cannot measure one", tree.browser.test.tsx:480-488), and on 2026-09-06 a screen grab decoded into a canvas. The trap was using the wrong box: "`getBoundingClientRect` reports the transformed border box and says nothing about clipping, so the drawer's rect was correct every single time it was measured while being trimmed" (LOG 2026-09-06 "A drawer slides…"); the command palette's "it is the LAYOUT box, never the painted one" law compared `offsetHeight`, because `getBoundingClientRect()` "carries the popup's 3% pose" (LOG 2026-09-10). The 2026-09-06 pixel law "GRABS THE SCREEN AND READS A PIXEL, because nothing weaker could have caught either half: a computed value cannot see paint order"; its own first spelling sampled under the drawer "and survived both sabotages" (LOG 2026-09-06). No screen-grabbing law remained at `39f3884` (no `captureScreenshot`/`screenshot(` in any test file).

**11. Count laws.** "Counted as DISTINCT INSTALLED VALUES rather than as elapsed time or dropped frames … a count is the same number on a fast machine and a starved one, which is what keeps this law off the frame-watching list" — the glass lens was rebuilt 27 times per menu open before the 2026-08-22 fix, and the law bounded it at four (menu.browser.test.tsx:2391-2449).

**12. Physics and arithmetic laws.** The spring laws (above), and the card's scale law, which "states that arithmetic and carries the calibration that the shared factor must fail it" — 0.975 moves a 400px card's edges 5px, 0.995 moves them 1.0px (LOG 2026-08-17 card entry; card.browser.test.tsx:1506-1528).

**13. Source-reading laws.** The interaction-handler law, the `FLIES_ANYWAY` agreement, the `SIDE_OFFSET` home, `settling.test.ts` and `frames.test.ts`. They caught what no mount could (a staleness at a call site, a second home), and their traps were the regex's reach: a law "narrower than the rule it enforces" (2026-08-26), and the list of shapes it could not see (2026-08-31).

The controls section lists the mounted laws by their own titles:

`system/motion.browser.test.tsx` (454 lines): "reduce means reduce" (the ring does not land under
`asksForStillness`; every transition channel reads `0s`; the moving PARTS — tick, dash, radio dot, switch grip,
slider grip — each calibrated to have a live clock first); "the ring lands where landing reads as motion, and
nowhere else" (button ring: series from `rest + land` to `rest`, at least `land + 1` distinct stations,
`land ≥ 4`; field and textarea: `animation-name: none` and one offset value); "hover reaches every family …
one step in one currency, under a real pointer"; "a field does not move"; "a press outranks every rule that
lights a control" (Toggle, Row, highlighted row).

Per component, among others: button ("held, the button sinks and shrinks", "the two clocks", "it RISES to meet
the pointer", done-state laws); checkbox ("it draws IN on a spring and returns instantly", "held, the mark
squashes"); radio ("it grows on a spring and vanishes instantly"); switch ("the crossing rides the calm spring,
and only the crossing", "the press belongs to the thumb, and reaches it from the ROOT", "a DEAD switch does not
lean", "the grip stays a capsule while it leans"); slider ("a held grip squashes, holds it for the drag, and
stands back up released", "the travel is never sprung"); card ("its paint and its geometry are on the control
layer's two clocks", "it rises … by the SAME pixel a button uses", "it sinks and shrinks under a real press, by
its OWN distances", "its ring LANDS", "stillness reaches every part of it", and the dead card "does not rise …
and does not sink"); segmented and tabs (the lead edge on the shorter clock per direction; the wall laws with a
calibration half — "the RAW inset must still cross the wall mid-flight, so a build that quietly tamed the spring
fails as loudly as one that let the grip escape"; "STRETCHES on the way"; "is PLACED on first paint"; "a RESIZE
re-places it without flying"; "the flight SURVIVES the observers"); accordion ("the panel travels by height on
the spring, clipped", the chevron turn).

#### The rules motion laws earned (ENGINEERING.md §6, lines 111-125)

ENGINEERING §6 ("Testing: laws, not snapshots") carried eight paragraphs earned by motion. In summary, with their own key sentences:

1. **"A media query the suite cannot enter is a media query the suite cannot check (2026-08-10)."** The general clause: "**a law about a conditional block must execute the condition.** Anything else is a law about a string."
2. **"And a stand-down is only stood down if it wins."** The suppression law "walked `transition` declarations and never `animation`"; "Where a recipe and its suppression can be separated by specificity, put the recipe in a **hook** and stand the hook down: then both live on the same selector and the tie goes to source order, which is arithmetic nobody has to redo."
3. **"A law that watches a live animation derives every instant from the RUNNER, never from the clock (2026-08-20)."** "**Stamp the moments from the runner's own observable events** — its departures, its stamps, its releases — and let ceilings be guards against a hang, set where no runner can reach them, never a bound the claim rests on. Where that is impossible, the claim belongs on the animation's SETUP (declared channels, the clock read off the computed transition list, the stamps, the bookkeeping) rather than on its frames."
4. **"And an instrument must be armed before the thing it measures."** "A helper that WAITS FOR a state to appear on an element the caller already found teaches every caller this mistake; one that OBSERVES from before the interaction cannot. `seeded()` was deleted for the first shape and `watchPose()` kept for the second." It calls "passing alone and failing together" inverted "the more dangerous direction: the law appears healthy in CI's own arrangement while asserting nothing about a fast machine".
5. **"A law that must catch a MOMENT does not run where the clock is not ours (2026-08-20, Kushagra: 'lets remove the core cause, dont test animations on ci machine')."** The criterion, the residue ("floating-ui converges in it, a release timer fires in it, the browser restores a scroll offset in it"), the 340ms stalls, and "a uniform 20x CPU throttle reproduces none of it".
6. **"And an exclusion has to be louder than the thing it excludes."** The four carriers (per-law marker, skip count on CI, `frames.test.ts` in both directions, the human's `pnpm run ci`), and the two clauses: "**Reach for an instrument before the marker**" and "**an excluded law owes CI whatever half of it is static**".
7. **"A driver gesture resolving is not the browser having settled — and the rule is ENFORCED, not remembered (2026-08-21)."** "**A lesson that lives only in the lines it repaired stops at the file it was learned in.**"
8. **"The pointer is shared state, and unmounting does not move it."** "**Passing alone and failing together is the signature.** … anything the browser holds outside the DOM (the pointer, an emulated media feature, focus) is teardown's problem, not each law's."

The verbatim paragraphs are in [Appendix A](#a-decisionsmd-passages-moved-out).

### The docs side

#### The consumer chapter: `apps/docs/content/foundations/motion.mdx` (131 lines)

(The full text is [Appendix C](#c-the-docs-sites-motion-chapter-as-it-stood).) Written in ASD-STE100 Simplified Technical English under `content/AUTHORING.md` (2026-08-21), it taught a consumer eight things:

- Motion is two things on two clocks: a colour or opacity change eases (`--motion-duration`, `--motion-easing`), a movement follows a spring baked into a CSS `linear()` curve. "If the two changes use one clock, the colour waits for the movement." It showed a wrong `transition: all 200ms ease` beside a right two-clock declaration.
- A press changes colour immediately, because "a tap lasts approximately 60 milliseconds" and "you only see this on a real phone. Desktop touch emulation doesn't show it." "Any motion that you add later must keep the press immediate." Hover "starts in 80 milliseconds and ends in 220".
- Each family moves its own distance: a button sinks and shrinks together, a pressable card sinks by smaller distances ("scale is relative"), a checkbox squashes, a text field does not move. "No component sets a duration." It showed a Card with a Switch, a Slider and two Buttons in which "nothing … sets a duration, a distance, or an easing", and stated that a hand-typed `150ms` "fails the build".
- "Movement overshoots once, at most … To make a movement more noticeable, make the distance longer. Don't make the spring looser."
- A focus ring needs about four pixels of travel, because "Chrome rounds `outline-offset` to whole pixels … A field's ring has two pixels of space, so it appears immediately."
- Spinners and indeterminate progress slow under reduced motion ("The spinner slows to three seconds") and never stop, "because a busy indicator that stops looks finished".
- Everything else stops under reduced motion; "the stylesheet rule that starts a movement also stops it, on the same selector".
- Nothing runs in JavaScript while you interact, with "three exceptions": a floating panel's one measurement on open, a tab bar's underline re-measure, and the glass lens on mount and resize.

**Drift between the chapter and the code at `39f3884`, stated rather than fixed:** the hover numbers are the judged 80/220ms; the emitted values since 2026-09-14 were 48/132ms, and the chapter never mentions `motionSpeed`. "Both springs pass their target one time at most" names two springs; config carried seven (`calm`, `lively`, `stiff`, `poised`, `elastic`, `driven`, `carried`). The "three exceptions" list is shorter than the count CLAUDE.md records — the segmented thumb was "the FOURTH bounded exception" (2026-08-23) and the Page collapse "the SEVENTH" (2026-09-06). The Chrome whole-pixel sentence is the premise DECISIONS §8 had marked "NO LONGER UNIVERSAL" on 2026-09-10 (DECISIONS @39f3884 line 707).

Two other chapters carried motion: `patterns/feedback.mdx` ("Reduced motion": a spinner and a moving bar "move more slowly and do not stop"; "A shimmer, a pulsing dot and a moving bar all give their message with movement, so they continue to move. A hover colour, a panel that opens and a focus ring that appears are all responses to a change, so they stop."), and `content/AUTHORING.md`, whose worked example of a verbless opener was "Two clocks." rewritten as "Motion runs on two clocks. A colour change lands on the very first frame, and anything that moves follows a spring." The component registry described motion in three blurbs: AccordionPanel ("opens and closes by height on a spring"), Progress (a null value "shows a moving segment"), Spinner ("turns one spoke at a time") (`apps/docs/app/(docs)/components/registry.ts` @39f3884).

#### The motion bench: `apps/docs/app/preview/motion-panel.tsx` (527 lines, 2026-08-22)

Kushagra: *"do it in a way where I can iterate fast"* (motion-panel.tsx:4). It sat beside the environment card on `/preview`, "not inside it: the axes above are the system's public vocabulary and this is the workbench those numbers are judged on" (preview-app.tsx:238-247 @39f3884), next to the lens bench.

**What it re-timed.** Every floating and overlay clock and distance was a plain custom property on `:root`, so the bench re-timed both entries at runtime "with no rebuild and no token regeneration". Its knobs: `--floating-fall`, `-spread`, `-corner`, `-reveal`, `-reveal-delay`, `-dissolve`, `-settle`, `--floating-seed`, `--floating-echo`; `--overlay-materialize`, `-fall`, `-spread`, `-reveal`, `-reveal-delay`, `-print`, `-dissolve`, `-settle`, `--overlay-seed`, `-lift`, `-echo`. Two multipliers (`clocks` and `travel`, 0.3× to 1.6× in 0.05 steps), a `bounce` slider (0 to 1), a "Tune each" panel of per-token sliders (0-1200ms, 0-120px) and per-spring ζ sliders (0.4 to 1.0), "Reset" and "Copy config". It did not cover the control-layer durations (`--motion-hover-in`, `--motion-press`, `--motion-rise` and the rest; a `--motion-rise` knob existed for one day on 2026-08-23), the dialog's `--dialog-*`, the tooltip's `--tooltip-*` or `--floating-paint`.

**How it stayed honest.** "It READS its baseline off the document, never a copy of `config.ts`", so it "cannot go stale and cannot disagree with the build"; and "it writes to `document.documentElement`, not to the canvas `<Theme>`. Popups PORTAL to the body, so a value written on the canvas would reach every specimen except the ones being judged" (:12-19). Its output was config text: "Delete this file the day the values are judged and nothing else moves" (:21-24). A consequence of reading the document: from 2026-09-14 its 1.0× baseline was the emitted, already-0.6× values.

**The springs were inverted from their own curves.** "A spring is not [a number in the document]: what ships is a `linear()` curve … The curve carries them. A damped step response overshoots by exactly `exp(-pi * zeta / sqrt(1 - zeta^2))` and peaks at `pi / (omega * sqrt(1 - zeta^2))`, so reading the curve's highest sample and where it sits inverts back to the pair that made it." `readSpring()` refined the peak with a parabola through the three samples around it, "without this the recovered omega is out by a few percent". Its check, made when elastic was ζ0.62: "elastic recovers 0.620 / 10.78 against a config of 0.62 / 10.835, poised 0.800 / 8.77 against 0.8 / 8.75" (:90-105). `writeSpring()` restated the generator's sampler rather than importing it ("a dev panel importing it would drag the whole token pipeline into the client bundle") and added the critically damped branch, "the 'no elasticity' end of the slider". At rest it wrote nothing, because "the recovered omega carries about half a percent of rounding … close enough to look right and wrong enough to make 'reset' a lie" (:312-316).

**Its own instrument bug.** Registered tokens came back as computed values — "`460ms` comes back as `0.46s`" — and "the first cut parsed the leading number and rounded it, which turned every clock into `0s` — the panel wrote real CSS that switched the animations off, and it looked like a working bench until the values were read back" (:181-192).

**"HOW SHORT THE CLOCKS MAY GO" (2026-08-23, re-measured).** The bench's measurement of how far the floating clocks could be cut is in [How short the clocks could go](#how-short-the-clocks-could-go).

**What it found.** On 2026-08-23 the bench surfaced a borrowed clock: `.kui-floating-body`'s content stretch rode `--motion-rise` (550ms), and "cut them by a quarter and the box lands at 510ms while the content is still stretching at 550 — the content finishes last and the entry reads inside-out". Kushagra: *"it works, but it doesnt work proportionally to how content animates"*. "The motion bench found it, and it found it the way a bench should: by making a proportional change and letting a thing that is not proportional stand out. A knob for `--motion-rise` was added there for a day … marked in the file as a defect rather than a knob and deleted the moment the clock moved" (LOG 2026-08-23 "The panel's content was stretching on the control layer's clock"). The elastic spring's move to ζ0.715 ("bounce also at 0.75x") and the 0.75× floating clocks were judged on it the same day (config.ts:832-844 @39f3884).

#### The preview demos (`apps/docs/app/preview/previews/*.tsx`, `specimens.tsx`)

The per-component preview contract had no motion section (`previews/types.tsx` @39f3884: sizes, states, materials, tones and the rest); motion was judged in live demos whose captions told the eye what to watch:

- **Menu**: "Open, dismiss, and press again before it has faded — the second press must catch it", with a narrow and a 320px trigger "so the flight has further to go"; the four sides with "scroll the page so one has no room: it must flip, and the flight must start from the trigger on the side it actually landed"; "A submenu three deep — each child flies from the seam" (menu.tsx:236-310, :465-475).
- **Select**: "Scroll this to the window's edge and open it — the placement gives way, the entry does not" (select.tsx:241-244).
- **Segmented control**: "The grip travels — click the far segment, then arrow back through it" (320ms against 480, judged), and the hover-wash defect of 2026-08-23 (segmented-control.tsx:183-227).
- **Tabs**: "The long travel — click Overview, then Danger zone, then back"; the same travel from the keyboard; travel × size; travel × overflow ("the cell the both-edges spelling was reverted over"); and "With Reduce Motion on, the rule is placed rather than flown — turn it on in the OS and click through", because the reduce preference was "a cross nothing on this page can flip for you" (tabs.tsx:185-342).
- **Switch**: "Toggle these — and hold one down to see the grip lean before it goes", and the same on glass, "the movement must not change with the pane" (switch.tsx:190-205, :359-365).
- **Slider**: "Drag one, then drag a range — the grip squashes, the travel does not spring" (slider.tsx:159-169).
- **AlertDialog / Dialog / Sheet / Card**: an "Alert entry" beside a "Dialog entry" ("A dialog's entry is depth instead: 3% in z, no travel"); the sheet's "slide on the drawer's clock, swipe-to-dismiss"; pressable card × material × ground, where "the press physics must read on glass as on solid" (alert-dialog.tsx:317-328; dialog.tsx:180; sheet.tsx:1-13; card.tsx:276).
- **specimens.tsx**: the Spinner and indeterminate Progress presented as "one category of motion (content, not a state change)" (specimens.tsx:1540).

#### The material lab (`apps/docs/app/lab2`, 2026-08-14 to 2026-08-16)

The lab was built for glass and doubled as a motion judging surface: the real Menu "wearing the material" (the test being that "material is dress, motion is physics, and they must compose without knowing each other", lab2.css:596-600), `MenuPositions` ("the entry judged from every side the positioner can hold — including CENTER"), the real AlertDialog three times over one scrim, and `DialogBig` ("the materialization at SURFACE-AREA extremes … ~55vw × 55vh … ~88vw × 85vh … where the travel is short but the mass is huge") (lab2/page.tsx:531-560, :710-790 @39f3884). lab2.css carried a "More motion" override for its menus (2026-08-14), judged "here first; if it wins, the values move to config's motion block": `--kui-seed-h: 10px`, fall 460ms, spread 680ms, corner 560ms, reveal 260ms, reveal-delay 60ms, and a livelier 31-point `--motion-spring` whose comment claimed "~9% overshoot with a second visible settle" and whose samples peak at 1.19 and dip to 0.945 (lab2.css:806-856). The dialog's depth entry was tuned on the lab's mass strip at 55vw/55vh and 88vw/85vh (LOG 2026-08-16 "The dialog's entry locks on depth…").

#### Judging surfaces that were never committed

- **The 2026-08-09 grammar demo**: "a throwaway page (plain HTML in a scratchpad, iOS proportions, none of our tokens — deliberately not the package) holding one switch and one button built both ways". Kushagra's verdict on the switch: "no competition" (LOG 2026-08-09 "Motion's grammar is chosen: physics, not clips").
- **`apps/docs/app/motion-lab`**: "the real `<Menu>` three times over with three different exits and nothing else different", on Kushagra's instruction *"do it in a way where its easy to reject and experiment, like a sandbox, and when lock down how it works, we can then do it correct way"* (LOG 2026-08-09 "Motion ships, on Menu alone"). No commit in the repository's history adds a file under that path.
- **Kushagra's "Clip vs Physics" bench**: referenced by config, CSS, laws, DECISIONS and LOG, and not present in the repository at `39f3884`. What the sources say it contained: a travelling highlight "beside the 250ms both-edges-on-one-clock version it replaces" (LOG 2026-08-23 "The traveling highlight"); a segmented stage of "240px track, 3px inset, matched grays" with a lean rule, *"a lean can never cross a boundary: it always points inward"* (LOG 2026-08-25); a keyboard exemption "on the rule that keys are not travel", which the package declined (LOG 2026-08-23); a "Physics" tooltip ("scale 0.9 → 1 from the trigger's edge on a spring, opacity in on a short ease, one object") whose `--spring` "is this package's `--motion-spring` (calm)", and a warm tooltip SLIDE the package recorded open (LOG 2026-08-31 "A tooltip's entry is a lift…"); and a drawer reference whose rule was that presentation is damping 1 with injected velocity and whose 8px settle the package dropped (LOG 2026-09-06; config.ts:845-865 @39f3884).
- **iOS frames**: "His iOS frames settled the direction" on 2026-08-14 (LOG 2026-08-14 "The entry stops being ported and starts being formed — judged against iOS's own frames").

The sections describe `apps/docs/app/motion-lab` differently: the controls section calls it "a throwaway route … (2026-08-09, gone by 39f3884)" and the floating section says it "no longer existed at 39f3884"; the instruments section, which searched the history, found that no commit ever added a file under that path. The controls section also records that `/preview` itself was a judging surface for the control layer, and that the "Clip vs Physics" bench is named in LOG 2026-08-23, 2026-08-25 and 2026-09-06, with its location not recorded in the sources.

#### Motion in the docs site's own chrome

Four blocks and the global stylesheet moved, each on the package's tokens and each with its own reduced-motion stand-down on the declaring selector:

- `apps/docs/blocks/conversation.css:165` — a steps chevron rotated on `--motion-hover-out` + `--motion-easing`; `kb-shimmer` (a text sweep, `2s linear infinite`) "slowed rather than stopped" to 6s under reduce, "the sweep IS the news that something is happening" (:248-266).
- `apps/docs/blocks/footer.css:48-86` and `table-of-contents.css:60-125` — link colour and underline colour on `--motion-duration` + `--motion-easing`, guarded by `(hover: hover)`, "No arrival animation: §8 bounds ring travel below at about four pixels and an inline ring sits closer to its glyphs than that", stood down "on the DECLARING selector … Same selector, later in the file, so the tie goes to source order by construction".
- `apps/docs/app/globals.css:75-105` — `kb-bed-drift`, a 14s alternating pan of the judging backdrop on `scale` and `translate` only, stood down whole under reduce ("the motion is not content, it is a test rig"). lab2 and lab3 carried similar pans (`l2-pan` 60s, `l2-slide` 30s).
- `apps/docs/app/scratch-composer/page.tsx:48` — a scratch picture that hand-typed `transition: translate 300ms …, scale 300ms …, opacity 200ms`, outside the package's laws.

The sections disagree about the Conversation chevron. The paragraph above says each moving part in the docs chrome had "its own reduced-motion stand-down on the declaring selector"; the controls section says the steps chevron "had no reduced-motion stand-down of its own (`conversation.css:160-170`)". The file at `39f3884` bears out the second: `conversation.css:165` declares the chevron's `transition: rotate var(--motion-hover-out) var(--motion-easing)`, and the only reduced-motion block (`:261-266`) slows the shimmer. The controls section also cites the footer and the table of contents at `footer.css:47-86` and `table-of-contents.css:74-124`, and notes that the package's two-clocks law walked package stylesheets only, so none of this was under it.

## Lessons

Every general lesson about building and testing motion that the sources state, grouped, each with its source. The numbered list is the instruments section's; where the controls and floating sections recorded a fact it does not have, the fact follows its group under "Also recorded".

### Time, the machine, and when a law looks

1. **A law that sleeps to a computed instant is measuring the machine.** `setTimeout` is a minimum and a loaded runner overshoots it. Wait for a state instead; a slow runner then only makes "has it happened yet" easier to satisfy (browser.tsx:264-281, 2026-08-17).
2. **Derive every instant from the runner's own observable events** — departures, stamps, releases — never from the test's wall clock, a frame count or a constant. A deadline computed after a law's own waiting grows stricter as the runner grows slower (LOG 2026-08-20 "three different lies about time"; ENGINEERING §6).
3. **A ceiling is a hang-guard, not a bound.** Set it where no runner reaches; "watching longer cannot weaken a claim that the release is LATE" (same entry). A `real + 400` "guard" was the CI failure itself.
4. **A premise that is a window is seized or edge-anchored, never raced.** Hold the window open by pausing its own clocks (`catchDissolve`), or read on the runner's edge that defines the moment (the depart edge); "where neither is possible the premise is not a law's to have" (LOG 2026-08-20 "The rotation's last four laws…"). Learned twice by writing the raced version first (LOG 2026-09-06 drawer).
5. **A clock seizure owns what the engine renders from those clocks and nothing that converges in wall time beside them.** floating-ui's placement, a release timer and the browser's scroll restoration cannot be stepped; seizing past them renders "a state the browser never paints" (LOG 2026-08-20 "A flight is seized by its clocks…").
6. **Seized clocks are borrowed and must be given back.** A paused transition renders its held value indefinitely (LOG 2026-08-20 "Stillness is not arrival").
7. **Stillness cannot tell a box that has ARRIVED from a box that is STUCK.** When the claim is about the destination, the wait must name the destination (same entry). Where the claim is that nothing changes across a strip, a proven-still plateau (three identical frames with the flight attribute still on, "a spring is momentarily still for less than one") is the right premise (menu.browser.test.tsx:3636-3639).
8. **A sampler runs on the thread that stalls**, so a smooth arrival it failed to watch and a real snap return the same numbers; no metric over rAF samples separates them (menu.browser.test.tsx:4158-4190).
9. **A per-interval rate is unbounded as the interval shrinks** — a 3ms gap turned three rounded pixels into 1.07px/ms (LOG 2026-08-20).
10. **A whole entry can finish between two statements**, because driving real input takes several frames and a pose lasts about two. Arm instruments before the gesture; a helper that waits for a state to appear on an element already found teaches the race (LOG 2026-08-20; ENGINEERING §6; menu.browser.test.tsx:191-197).
11. **A driver gesture resolving is not the browser having settled.** Reading its effect in the next statement asserts the effect is synchronous; enforce it with a law, because "a lesson that lives only in the lines it repaired stops at the file it was learned in" (LOG 2026-08-21; settling.test.ts).
12. **A claim about a non-event is the one exception** — waiting could only delay a correct answer, and its strength comes from a negative control (LOG 2026-08-21).
13. **Passing alone and failing together is the signature of shared state** (the pointer, an emulated media feature, focus); teardown owns it (LOG 2026-08-10; ENGINEERING §6). **Passing together and failing alone is worse**: a fixture that only assembles when other tests slow the machine is not a law about the code (LOG 2026-08-20).
14. **A shared CI runner fails laws by bursty scheduling, not by slowness.** A uniform 20× throttle reproduced none of the sampled-animation failures (LOG 2026-08-20). But a wall-clock guard racing a transition does reproduce under throttling, at 8× and above (LOG 2026-09-10).
15. **Calibrate a throttle against a known fault before trusting its green.** A sweep at 4× passed a restored defect (LOG 2026-09-10).
16. **An exclusion must be louder than what it excludes**, pinned in both directions, and must leave CI the static half of the claim; reach for an instrument before the marker (ENGINEERING §6; frames.test.ts).
17. **"Did not run" is a way of not failing.** Turbo's filtered environment made a launch failure read as "8 passed (37)" (LOG 2026-08-20), and a mismatched Chromium build let CI exit 0 over 1,400 laws that never ran (docs/handovers/2026-08-23-four-components.md).
18. **Do not borrow a signal that means something else.** A "the lens may measure again" guard timer is not a landing signal (LOG 2026-09-10).
19. **A stopwatch cannot tell a late timer from a wrong clock**; read the declared clock where the runner reads it (LOG 2026-09-10).
20. **"The claim to avoid is not 'this is fixed' but 'this is the last one'"** (LOG 2026-09-10).

### What a law reads

21. **Read a computed value, not a declaration, a token name, or a reconstruction of the author's arithmetic** (the 2026-08-03 lesson; CLAUDE.md). A computed value **read at one moment** is still not enough for anything that moves: "at the seed frame the width was 40px and correct, at rest it was 112px and correct, and the entry between them was broken" (LOG 2026-08-09 "Motion ships, on Menu alone").
22. **A defect can be wrong in the middle and right at both ends.** Laws comparing the last flight frame with the settled panel cannot see it; read the whole curve on a seized clock (LOG 2026-08-29).
23. **A property can be perfectly specified and still have nowhere to go.** Assert the freedom the channel needs (a floor stood down), not a photograph of it moving (LOG 2026-08-09; menu.browser.test.tsx:4158-4190).
24. **Read the thing a person can see** — the chosen row's distance from its trigger — not the mechanism (an offset, a clip, a margin); three spellings each satisfied a law written beside them (LOG 2026-08-22 "the placement is carried as LAYOUT…").
25. **A law about one axis of a two-axis mechanism is half a law** — `transition` and `animation`; the popup's borrowed height and the positioner's; the block axis and the inline one (ENGINEERING §6; docs/handovers/2026-08-22-floating-motion-audit.md C1).
26. **Every "every X" claim needs a walk, not a file** (LOG 2026-08-26 via recipes.test.ts:1443-1476, :1753-1790).
27. **Strip what could launder the claim before checking it** — `var()` references before hunting for hand-typed durations (LOG 2026-08-09).
28. **Split a transition list at top-level commas**; when two laws disagree about one string, the disagreement is the instrument's (recipes.test.ts:1571-1588, 2026-09-12).
29. **Pick the box that answers the question.** `getBoundingClientRect` carries transforms and says nothing about clipping; `offsetHeight` is layout; `elementFromPoint` is the viewer's space; a computed value cannot see paint order, so a paint-order question needs pixels (LOG 2026-09-06; LOG 2026-09-10).
30. **Compare curves by samples, not strings**; the browser re-serializes `linear()` (menu.browser.test.tsx:1905-1914; LOG 2026-08-31 tooltip).
31. **Pinning a clock erases the declared list; reading a list while a pose holds `transition: none` reads nothing.** Read values pinned and lists un-pinned and un-seeded (menu.browser.test.tsx:1916-1921, :3092). `settle()` writes `transition: none !important` inline, and `[data-unfurling][data-seed]` declares `transition: none`: "two instrument findings that each produce `none` on a correct package" (DECISIONS §42; LOG 2026-08-29).
32. **An agreement law is a floor**, and a law whose subject is chosen by index can compare a thing with itself — "the in-flow twin precedes the portal in document order" (CLAUDE.md, Menu audit 2026-08-09; menu.browser.test.tsx:9-17).
33. **Choose the one open popup, never "the first" or "the last"**; a previous law's panel can still be dissolving, and a select keeps its panel mounted for its whole life. The stale-popup selector caught this package's laws three times (menu.browser.test.tsx:2122-2124; select.browser.test.tsx:971-984; LOG 2026-08-22).
34. **A count is machine-independent where a duration is not** (menu.browser.test.tsx:2391-2449).
35. **A bound belongs in the gap between the mechanism's noise and the smallest real defect**, not at the edge of what passes today (6px between 2.4px of settling and a 21px defect, LOG 2026-08-22); a bound that admits a known residue cannot catch the residue's fix being deleted (8px → 1.5px, menu.browser.test.tsx:3837-3842); a 0.5px tolerance against a 10px defect reported the machine (LOG 2026-08-22).
36. **A comment claiming a law is excluded, or a title claiming a guarantee, is a claim**; a title "had been making a promise its fixture cannot keep" (LOG 2026-08-23; LOG 2026-09-10).

### Fixtures, sabotage and calibration

37. **A law over a general case needs an input where the general and special cases give different answers** (LOG 2026-08-20 "A law over the general case…"). The motion catalogue is in [Degenerate fixtures in the motion laws](#degenerate-fixtures-in-the-motion-laws): eight rows, two rows, `defaultOpen`, a narrow menu, an un-mirrored submenu, LTR only, landed panes only, last-frame-versus-settled only.
38. **Before trusting a law, ask what its fixture would look like if the mechanism were absent; if the answer is "the same", the fixture is the defect** (CLAUDE.md, Notice 2026-08-21).
39. **Point an instrument at the state it names**, with a per-subject calibration that the thing under test is live (LOG 2026-08-10 "The grip squashes when held…").
40. **Calibrate an instrument against a known answer before its output is evidence** (CLAUDE.md, audit 2026-08-08), including extractors (frames.test.ts) and benches (the bench's `0.46s` bug).
41. **A sabotage must change one side of the equation, must actually apply, and must be reverted without destroying uncommitted work** (LOG 2026-08-10; LOG 2026-08-23; CLAUDE.md 2026-09-02).
42. **A surviving sabotage is evidence about the law as often as the code** (LOG 2026-08-22).
43. **A law that fails on the fix and passes on the defect is worse than no law** (LOG 2026-08-16).
44. **Write down what the suite cannot reach**, beside the law, with the numbers a real browser gave (LOG 2026-08-22 on the tall pinned viewport; "`Emulation.setDeviceMetricsOverride` over CDP was tried as a way to shrink the window for one law and does not take in this harness").
45. **A mechanism with no law is one refactor from being gone**; the posed content's rise disappeared with the suite green (menu.browser.test.tsx:4277-4283).
46. **A number restated in three homes drifts in all three** (LOG 2026-08-16, "four motion laws moved verbatim" when three moved and none verbatim).

### Reduced motion and media

47. **A media query the suite cannot enter is a media query the suite cannot check** — emulate it (ENGINEERING §6).
48. **A stand-down only counts if it wins.** `:not()` takes its most specific argument's weight; a media query adds none. Put the recipe in a hook and stand the hook down on the same selector (LOG 2026-08-10).
49. **The sheet that declares a clock stands it down itself, on the declaring selector, at the end of the file**; raising the shared stand-down's specificity "scales" nowhere, because "no spelling wins against an arbitrary component selector by construction" (LOG 2026-08-10 "The grip squashes when held…").
50. **Do not maintain an inverse of every pose in the guard**; it drifted twice. Owe exactly "nothing moves, and nothing is measured", and make the runner refuse under the setting (LOG 2026-08-16).
51. **A reduced-motion guard can itself move things.** `margin: 0` in the guard stood down nothing and beat the `margin: auto` that centred a dialog, so "Reduce Motion was producing the largest movement in the family" (CLAUDE.md, the 2026-08-22 audit; docs/handovers/2026-08-22-floating-motion-audit.md C4).
52. **Motion that IS content slows and never stops**; a busy indicator that freezes "fails its one job" (LOG 2026-08-09 principle 8; spinner.css:42-45; progress.css:119-121).
53. **Chromium does not emulate `hover`** (LOG 2026-08-22).

### CSS and engine facts motion depended on

54. **Dropping a property from `transition-property` cancels its running transition.** Ending rules must restate the entry's geometry channels, and the exit's list should be derived from the entry's (LOG 2026-08-16; surfaces.test.ts:565).
55. **A transition whose start and end values are equal fires no event**, so a release keyed on one channel's `transitionend` can hang forever; release by the clock read off the computed list (LOG 2026-08-10 "The seed becomes the trigger itself").
56. **A CSS transition whose end value changes mid-flight restarts from the current value with the full duration** (LOG 2026-08-23 "The panel measures itself…"). **CSS retargets from the current position but not the current velocity** (LOG 2026-08-09 grammar).
57. **Reading `offsetWidth` flushes style and makes that instant the transition's baseline**; toggling a pose to measure can start the animation backwards (LOG 2026-08-09). **`offsetWidth`/`clientWidth` are integers**: 115.33 → 115 re-broke a row's line (same entry; LOG 2026-08-23 travelling highlight).
58. **A dangling `var()` invalidates its whole declaration at computed-value time**, falling back to the property's initial value, not to the cascade (LOG 2026-08-14; LOG 2026-08-09 on `--anchor-height`). So does an unparseable substitution: `translate()` separates its arguments with a comma, so a two-axis hook written with a space made the substitution unparseable, and the whole declaration dropped (LOG 2026-09-06). A `<length>` registration makes a value containing `100%` invalid, falling back to `0px` silently (LOG 2026-09-09).
59. **An unregistered custom property transitions discretely**; registration is what makes a spring possible on one, and a registered property always resolves, so its fallback arms become dead text (LOG 2026-08-25).
60. **Any non-`none` transform value (`scale: 1` included) makes an element a containing block and a stacking context**; a mark stating a resting transform broke five laws at once (LOG 2026-08-09). **A running `filter` makes an element a containing block** too (LOG 2026-08-16 dialog). **A transformed ancestor is a containing block for fixed descendants** (LOG 2026-09-06).
61. **An absolutely positioned box resolves its insets against its containing block's PADDING box** — "an inset is measured from a box, and it is never the box you were picturing" (LOG 2026-08-10).
62. **An auto margin resolves to zero when the available space is negative**, which is the whole of an entry where the box is smaller than its content (LOG 2026-08-10); **insets plus auto margins over-constrained drop the end inset** (LOG 2026-08-29); **percentage margins resolve against the containing block's inline size on both axes** (same); a block child of a shrink-to-fit absolute box is over-constrained and loses its far margin — "a literal `margin-inline-end: 72px` computed to `0px`" (LOG 2026-08-09).
63. **`transform` composes inside the individual `scale`**, so a centring `translateX(-50%)` was scaled with the box (LOG 2026-08-31 tooltip).
64. **`overflow: hidden` makes a scroll container; `clip` does not.** A focused row inside a flying `hidden` box took a scroll offset (`scrollTop: 57`) that nothing settled at; with `clip` the browser scrolled the page instead (65px), so both doors had to be shut (LOG 2026-08-17 "A select's entry was moving the page…"). **`overflow-y: auto` beside a `visible` inline axis promotes the inline axis to `auto`** (LOG 2026-08-21 sheet). **A scaled element contributes its scaled size to the scrollable overflow**, so a posed body clamps a scroll offset away (LOG 2026-08-22).
65. **`overflow` clips descendants in the element's own box, before the element's transform** (LOG 2026-09-06). **A transformed box still counts as scrollable overflow** (LOG 2026-09-09).
66. **`display` cannot be transitioned**; park with `visibility` and a clock, or flip a discrete property late with `transition-behavior: allow-discrete` (LOG 2026-09-06).
67. **Inside a stacking context a `z-index: -1` child paints above its parent's background** (LOG 2026-09-06), and **positioned descendants paint after every static sibling whatever the DOM order says** (CLAUDE.md, 2026-08-23 segmented).
68. **`inset-inline-end: auto` cannot be animated to**, `aspect-ratio` silently outranked a lean, and `50%` of a non-square box is an ellipse (LOG 2026-08-09).
69. **`:active` matches the activated element and its ancestors, never its descendants** (LOG 2026-08-09).
70. **A browser answers a focus by scrolling the element into view**, which reached the page mid-flight (LOG 2026-08-17).
71. **A `requestAnimationFrame` callback runs after the frame's scroll events**, so a sample taken there cannot show what a scroll handler already undid; the "2151px single-frame flash" was withdrawn for this and for "a file mounting three subjects into one page" (LOG 2026-08-17). A sampler reading between two writes in one frame produced a phantom "seed 200px right and 236px below its trigger" (docs/handovers/2026-08-22-floating-motion-audit.md).
72. **Chrome resolved `outline-offset` to whole CSS pixels** (the basis of the field ring's refusal and the ~4px lower bound on ring travel); **Chromium 141 rendered 96 sub-pixel stations**, making the refusal "conservative rather than forced" (LOG 2026-08-10; DECISIONS §8 line 707; LOG 2026-09-10).
73. **`interpolate-size: allow-keywords` was Chromium-only in August 2026**, and it inherits (LOG 2026-08-09; LOG 2026-09-12). **Chrome will not interpolate `0 → auto` without it** (accordion.browser.test.tsx:390-392).
74. **Two clocks on one curve over different distances open daylight mid-flight** — 2px at 120ms with the landed state correct, "the shape no landed-state law can see" (LOG 2026-09-09).
75. **Registered tokens read back as computed values** (`460ms` as `0.46s`, scale resolved), so a reader must convert units (motion-panel.tsx:181-192).
76. **An animation on a box offset forces layout every frame**; `inset-inline-start` in the progress sweep cost 120.3 layouts/s against 0.47ms/s for the identical `translate` keyframe (docs/handovers/2026-08-31-glass-motion-perf.md, finding 4).

Also recorded:

- **A tap lasts ~60ms**, so any eased press loses the race to its colour; desktop emulation never showed it, and a mouse hides it "because a click holds the button down through the ramp" (LOG 2026-08-03).
- **Touch devices synthesise `:hover` on tap and hold it** until the next tap, and **iOS Safari arms `:active` only while a touch listener is registered** (DECISIONS §8).
- **`el.focus()` and `:focus-visible` were recorded two ways.** On 2026-08-17: "on a BUTTON Chrome matches `:focus-visible` only when the last interaction was a key, so it asserted nothing"; the 2026-08-08 audit had recorded that "programmatic focus does qualify". The two readings came from different preceding interactions.
- **`transition-property: all` never covers a custom property**, and a registered property's `initial-value` is obligatory (2026-08-25).
- **A `ResizeObserver` watches the layout box** and does not fire when only a transform changes; it fires once when it starts observing (2026-08-23); its notifications are dispatched once per frame and coalesced (2026-09-11). `getComputedStyle(el).width` is the border box under `box-sizing: border-box`, and `clientLeft` is an integer like `offsetWidth` and `clientWidth` (2026-08-23, 2026-09-01). `getBoundingClientRect` includes transforms, so a scaled pose passes a laid-out guard and a z-stepped dialog reports its painted box, not its layout box.
- **A `MutationObserver` callback runs at the microtask checkpoint, before paint** (2026-08-23).
- **`transition` is a shorthand**: a component rule restating it replaces the skeleton's whole list (2026-09-01).
- **`interpolate-size: allow-keywords` does not reach a flex item** and cannot animate a content-driven `auto` → `auto` change (2026-09-05). Without it CSS cannot interpolate to `auto`, so a destination had to be measured; the grid `0fr → 1fr` trick forces `max-content` sizing on rows and does not re-resolve when content changes.
- **An `<svg>` with no intrinsic size is 300 × 150**, CSS's replaced-element default (2026-09-02). **An SVG root's transform is not reliably composited** (2026-08-06).
- **The individual `translate`, `rotate` and `scale` properties compose as translate → rotate → scale**, so a mirrored (`scale: -1 1`) chevron must turn the opposite way (2026-08-26).
- **Changing a running transition's target cancels it and starts a new one** from the current value with the full duration; `transitioncancel` is dispatched at a later style update, not synchronously (2026-09-12); an unretargeted transition keeps its original duration when restated (2026-08-22).
- **`parseFloat` of an unresolved `calc(56px * var(--scale))` custom property is NaN** (2026-08-16).
- **A `filter` makes an element a backdrop root**, so every `backdrop-filter` beneath it samples nothing (2026-09-05).
- **`visibility` can be transitioned and flips at the far end** of its transition, which is what a parked drawer and its scrim used (2026-09-06).

### Base UI and floating-ui facts

77. **Base UI stamps `data-instant` on changes it considers "not a reveal"**, and the value names the cause. A synthetic `element.click()` stamped it (LOG 2026-08-17); hand-built events are `isTrusted: false` and a full synthetic pointer sequence still stamped it (menu.browser.test.tsx:137-141). Base UI 1.7 stamped `instantType: "click"` for any press with `nativeEvent.detail === 0`, "which is every keyboard Enter/Space, and every programmatic `.click()`", so the keyboard lost its entry until `click` was exempted (LOG 2026-08-19 "Base UI 1.7 stays"). Menu's store sets `dismiss` "when `reason === escapeKey || reason == null`" (a keyboard or imperative dismissal; exempted 2026-08-22). `PopoverStore.setOpen` stamps `focus` on a focus-out close, and a `triggerFocus` open stamps it too (exempted 2026-08-29). `delay`, `trigger-change` and `tracking-cursor` stayed instant. A real right-click's `contextmenu` carries `detail: 0` ("the mousedown is 1, the contextmenu is 0"), so a fixture with `detail: 1` "produced a state no person can produce" (DECISIONS §42). Two `defaultOpen` tooltips in one document make the second — and with no provider, both — `data-instant="delay"` (LOG 2026-08-31).
78. **`setOpen` is the only writer of `instantType`**; a controlled root syncs through `useControlledProp` and never runs it, so a stale stamp survived into later opens (LOG 2026-08-29; menu.browser.test.tsx:2191-2205).
79. **Base UI unmounts a closing popup when `Promise.all(getAnimations().map((a) => a.finished))` settles** — which is what a paused clock holds open, and what restated keep-alive channels extend (browser.tsx:366-374; LOG 2026-08-23).
80. **A quick reopen mid-dissolve finds the popup still mounted**, with no fresh mount and no starting stamp: "`data-closed` off → `data-open` on → `data-ending-style` off"; Base UI removes the ending stamp "on its own FRAME, not in the reopen's commit" (LOG 2026-08-16 "A quick reopen has no birth").
81. **A menu popup renders `data-starting-style` in the initial commit and drops it a frame later** (browser.tsx:531-535). **A dialog's `defaultOpen` mount is instant**: the stamp never appears on mount (LOG 2026-08-15), and Base UI writes `transition: none !important` inline on a dialog that opens on mount (dialog.browser.test.tsx:1269-1272).
82. **Base UI inerts the page behind an open menu**; its backdrop intercepts the pointer (menu.browser.test.tsx:1972-1976). **The dialog's full-screen viewport sits over the backdrop**, so an outside press lands on the viewport (LOG 2026-08-16). **A `defaultOpen` alert focuses the popup** (same). **A select ignores a pointer release inside its press-drag window** (select.browser.test.tsx:1705-1707). **A select keeps its panel mounted after the first open** (select.browser.test.tsx:971-976).
83. **Base UI writes inline styles the flight must borrow and restore, never enumerate**: on an item-aligned select, `position`, `maxHeight`, `overflowX`, `overflowY` on the popup and `height` on the positioner (LOG 2026-08-22); `position: relative` on a ScrollArea root, which made it the flying body's containing block (menu.browser.test.tsx:4323-4327); `overflow: scroll` on its viewport (menu.browser.test.tsx:4440-4447). An inline declaration beats every stylesheet rule, and `!important` was refused as a fix "because an `!important` in the family's sheet would win and leave the library's intent unstated" (LOG 2026-08-22).
84. **An item-aligned select stamps a fallback side first and replaces it with `data-side="none"`** once the panel's real box is measured (LOG 2026-08-20).
85. **floating-ui publishes the anchor's dimensions asynchronously**, so `--anchor-height`/`--anchor-width` are unset on the first frame (LOG 2026-08-09), and Base UI's seeded `--available-width/-height` read `100vw`/`100vh` until `computePosition` resolves (LOG 2026-08-23). **floating-ui measures anchors with their transforms** and keeps re-measuring as a press spring travels (LOG 2026-08-11; LOG 2026-08-22). The 2026-08-17 claim that Base UI reads `getScale` and normalises was false: "the name appears in its positioning file zero times" (LOG 2026-08-22). The collision answer (`data-align`) can legitimately flip once before a flight departs, because a small seed and a full panel answer differently (LOG 2026-08-20).
86. **Base UI Tabs publishes `data-activation-direction`, with `none` on the first paint**, so direction needed no JavaScript; `--active-tab-right` is computed in the list's SCROLL space and drew zero width on an overflowing bar (LOG 2026-08-23; LOG 2026-08-19).
87. **An uncontrolled RadioGroup holds its value inside Base UI and never re-renders the component**, so an effect keyed on renders fires once per lifetime (LOG 2026-08-23).
88. **Base UI's Slider stamps `data-dragging` from the first pointerdown frame** and it survives the pointer leaving under capture; on a range it is root state (LOG 2026-08-10 "The grip squashes…"). **Its edge alignment hides the input until first layout**, so a law that focuses early skips itself (CLAUDE.md, Radio and Slider 2026-08-06).
89. **Base UI's ScrollArea measures its viewport before it draws**, which pushed the flight's pose one frame later (menu.browser.test.tsx:116-126), and renders its bar a commit late (LOG 2026-09-10).
90. **React StrictMode invokes a ref callback twice**, so a measurement must neutralise its own pose before measuring again (menu.browser.test.tsx:4084-4094; LOG 2026-08-10).

Also recorded:

- **Tabs' `Tabs.Indicator` publishes `--active-tab-left/right/top/bottom/width/height`** as well as `data-activation-direction`, and ships a pre-hydration script.
- **Checkbox's indicator is `keepMounted`**, and `getCheckboxStateAttributesMapping` returns `{}` for `checked` while `indeterminate` is true.
- **Accordion publishes `--accordion-panel-height`**, stamps `data-starting-style`/`data-ending-style`, and in 1.7 declares `loopFocus` without any key handling (measured).
- **Menus open on pointer-DOWN**, so `data-popup-open` lands the instant a press starts.
- **ScrollArea stamps `data-scrolling`/`data-hovering` on the bar**, pins the bar by inline `top`/`bottom`/`inset-inline-end`, and re-renders the viewport on every scroll.
- **`data-starting-style` is written from a layout effect that runs after ref callbacks**, and Base UI removes it on its own clearing frame; Menu's frame and Select's differed (2026-08-10).
- **Unmount waits in `useAnimationsFinished.js:44`**, on `Promise.all(getAnimations().map(a => a.finished))`.
- **An item-aligned Select** writes `positionerElement.style.height`, then `height: 100%` on the popup, sets `scrollTop`, and spreads `LIST_FUNCTIONAL_STYLES` (`position: relative`, `max-height: 100%`, `overflow: hidden auto`) when there is no `Select.List`; `clearStyles` runs only on close; it stamps `data-side="none"` when the overlap is live and drops the overlap for keyboard opens and near viewport edges (2026-08-17, 2026-08-22).
- **`getLogicalSide` returns the logical pair when the side is logical**; a submenu defaults to `inline-end`, and under RTL a physical `right` becomes `inline-start` (2026-08-22/23).
- **The `transformOrigin` middleware writes `--transform-origin`**, and for a cross-axis-shifted panel its y is the anchor point's offset. A context menu's positioner runs `shift({ crossAxis })` with `flip.mainAxis` disabled, and its `contextmenu` suppression covers only the region and its backdrop (2026-09-02).
- **Base UI's positioning reads direction from its own `DirectionProvider` context**, default `ltr` (2026-08-09).
- **Dialog's `initialFocus` resolves `touch ? popup : true`**; Drawer resolves the popup always (2026-09-12).
- **`Tooltip.Root` has no `delay` prop in 1.7**; only the Provider does (2026-08-31).
- **floating-ui's positioner shrink-wraps a menu popup**, so collision was decided against every intermediate size: a seed fits beside a trigger near the right edge and the full panel does not (2026-08-10).
- **A disagreement the sources record and that stood at `39f3884`:** the 2026-08-25 comment in `restingBox` (and the controls section's reading) says floating-ui's autoUpdate "watches element resize and layout shift, never a transform"; the 2026-08-31 performance assessment found that "`observeMove` compares client rects, which include transforms, so the trigger's own press spring drives ~254 position solves per `defaultOpen` (78–86 on a real press)". The comment was not corrected.

### Building and judging

91. **Measure on a real device.** "Every defect in this entry was invisible in desktop Chromium, including its device emulator … The suite asserts what the stylesheet *says*; only a device says how it *feels*" (LOG 2026-08-03 "Button meets a real phone…").
92. **Judge motion from frozen frames, side by side with the reference, at the same times.** The tooltip's second pass was settled "frozen beside the bench's tooltip (its CSS verbatim, in one page, both paused at the same times)" (LOG 2026-08-31); the entry was "judged against iOS's own frames" (LOG 2026-08-14).
93. **A bench finds what is not proportional by making a proportional change** (LOG 2026-08-23). A bench reads its baseline off the document and writes where portalled panels can see it (motion-panel.tsx:12-19).
94. **A judging surface that models a forbidden composition argues against its own rule** (LOG 2026-08-16 "One glass per stack…").
95. **Two homes for one fact drift; collapse them, or pin them with an agreement law that reads both sources** — the two entry runners had drifted four ways in five days (LOG 2026-08-16), the instant set had two homes (LOG 2026-08-29), and `SIDE_OFFSET` had four (LOG 2026-08-29).
96. **When a declaration moves, ask what else it was saying** — "a property pinned across three states is usually a value AND an invariance, and moving the value is not moving the invariance" (CLAUDE.md, segmented 2026-08-23).
97. **A mechanism with no consumer is entropy; delete it rather than leave it behind a flag** (CLAUDE.md, the curtain 2026-08-17; LOG 2026-08-22 on stand-downs proved unreachable).
98. **Build it, measure it, and revert it when it measures as a no-op**, rather than leaving a plausible-looking fix (LOG 2026-08-22, the overlay exit clocks and the portal z-index).
99. **A motion that is wrong is worse than none**; shipping instant and moving later "is honest about being unfinished in a way a borrowed recipe is not" (LOG 2026-08-21 "The sheet's ring was cut…").
100. **Stale builds lie**: the docs site read `dist/styles.css`, so a speed change "was invisible until the package was rebuilt, and 'seems slow still' was the stale build" (LOG 2026-09-14); a size measured "against `dist/` as it sat" reported "zero" (LOG 2026-08-17 card).

### The recurring shape, as the audits named it

The controls section collects the audits' own sentences for the shape their findings kept taking: "the law read the text of the stand-down instead of the value it produces" (2026-08-10); "a law about one axis of a two-axis mechanism is half a law" (2026-08-08, re-applied 2026-08-10); "An instrument has to be pointed at the state it names" (2026-08-10); "when a declaration is moved, ask what ELSE it was saying" (2026-08-23); and the one the 2026-08-09 Menu entry added: "a computed value read at ONE MOMENT is still not enough for anything that moves." The instruments section's version: "Every broken axis was one where no law read a computed value" (CLAUDE.md, the 2026-08-03 lesson), re-learned by motion many times over and sharpened into "the input matters as much as the output" (LOG 2026-08-20 "A law over the general case needs an input where the general case can be wrong").

## What went wrong

This section is built only from what the sources record, and each claim carries its source. It groups facts already told in the layers above; it adds no judgement of its own.

### The audits

- **2026-08-16, the adoption pass** (a six-dimension audit, 22 confirmed findings, each adversarially verified; CLAUDE.md in [Appendix B](#b-claudemd-paragraphs-moved-out)). Its headline was entropy: the anchored runner and the alert's runner, written five days apart, "had drifted four ways" — a laid-out guard dead in one and working in the other (`parseFloat` of an unresolved `calc()` token; dead from 2026-08-10), a flight registered too late to retire, a body measured after the writes that invalidate its layout, and a listener freed on one path of four — four defects that were "nothing but the gap between the twins". The critical find was `box-shadow` missing from the exit's restated channels, which cancelled and snapped a dismissed menu 169 → 303px. Three mechanisms had no law at all: the springs, the flight retirement and the floating family's reduced-motion suppression. Retiring a flight above the bails "meant a begin that could not fly still killed a live flight". (LOG 2026-08-16 "The dialog's entry locks on depth, and the audit before it collapsed two runners into one")
- **2026-08-19, the tab rule.** The both-edges spelling drew a zero-width rule on an overflowing bar; the rule went back to `left` + `width`. (LOG 2026-08-19 "The tab rule goes back to left + width, and the audit that made it necessary")
- **2026-08-22, the floating-motion audit** (33 agents; 102 findings, 96 surviving; 13 critical) — with all suites green at 199/200. Fixed: **C1** a 30-row select settled 188×910 in an 800px window, unscrollable, its chosen row 163px off; **C2** the width step at release; **C3** the flight's clip dead on Select; **C4** reduced motion teleporting dialogs; **M5** 27 lens maps per open; **M6** Escape deleting the menu's exit; **M7** a dismissed alert freezing the page; **M8** a mirrored submenu growing backwards; **M9** a controlled menu losing its entry, and a menu width bound that could not be reached. Root cause of the green suites, named: *"Both Select fixtures used eight options"*. Pattern D: four of the six CI-excluded laws could not fail on the mechanism they named. Two repairs were built, measured as no-ops and reverted: shortening the overlay exit's restated clocks (an unretargeted transition keeps its duration) and a portal z-index. The release deadline being the longest declared clock, and the alert's `corner-shape`, were raised as minor findings and left. (LOG 2026-08-22 "The flight borrows a style, it does not enumerate one — and three other things the suite could not see"; docs/handovers/2026-08-22-floating-motion-audit.md)
- **2026-08-23, the audit's verifier** sabotaged `restingAnchorWidth` "and ran the real suites: with the scale division removed, `CI=1` over the whole browser project reported zero real laws failing", because the one law that caught it was CI-excluded. (LOG 2026-08-23 "A guarantee held only by a law CI does not run")
- **2026-08-26.** The switch leaned when dead (`:active` matches a `<span role="switch" aria-disabled>`); the reduced-motion coverage law skipped every file that contained the guard string, "which is every file that has anything to stand down"; its regex counted `transition: none` as a declaration; the hover-guard law read one file; the interaction-handler law "could not see an observer"; the segmented thumb did not watch its seats. (switch.css:153-173; recipes.test.ts:1443-1476, :1753-1790; segmented-control.tsx:218-233)
- **2026-08-29, Tooltip and Popover.** A centred body could not be centred by auto margins, and "every entry in the family was sliding its content"; `data-instant="focus"` had not been exempted; `SIDE_OFFSET` had four homes; two laws encoded the defect as the guarantee. (LOG 2026-08-29 "A centred body cannot be centred by auto margins, and every entry in the family was sliding its content"; LOG 2026-08-29 "`data-instant="focus"` is an input class, and the family had exempted only two of three"; LOG 2026-08-29 "The floating family's trigger gap had four homes, each commented as if it had one")
- **2026-08-31, the glass-and-motion performance assessment** (docs/handovers/2026-08-31-glass-motion-perf.md). Finding 4: the progress sweep animated a layout property (120.3 layouts and 120.3 style recalculations per second; 16.55 ms/s against 0.47 ms/s as `translate`; eight bars 35.30 ms/s) — fixed. Finding 5: "A glass floating panel runs the whole filter chain per frame over a box that changes size, for the entire 345–600 ms entry", about 104M pixel operations for a 320×263 glass menu at DPR2 over about 31 frames — assessed and left. Finding 6: a dialog or alert entry stacked two (default) or three (glass) filter passes, 2.29 ms/frame against 1.16 baseline, with the body's `blur(6px)` → 0 over about 504×700 for 600ms — assessed and left. It also found the panel seam invisible to the interaction-time law, the page hold's window at five frames rather than four, and floating-ui's `observeMove` driving ~254 position solves per `defaultOpen` from the trigger's own press spring.
- **2026-09-01, the ultracode audit of five new components.** The shared press rule lost to three lit rules that had reached (0,4,0) through `:not()` — a plain `<Row>` went "rest -> hover -> press all `oklab(0 0 0 / 0.03575)` with `:active` true" — and was raised to (0,4,0); the accordion's underline `transition` replaced the skeleton's whole list; ten laws could not fail, the accordion's headline travel law among them. (LOG 2026-09-01 "An ultracode audit of the five new components, and every fix it earned")
- **2026-09-02, ContextMenu.** Three entry cases the flight had never met — `seedSize` leaking into submenus, a shifted panel seeded 107px above the pointer, the catch teleporting a re-summoned panel 289px — and the platform's menu drawing over the panel; five of the fourteen laws could not fail. (LOG 2026-09-02 "The ContextMenu audit — three cases the flight had never met, and five laws that could not fail"; DECISIONS §42)
- **2026-09-10, CI.** "The runner's clock was an input to the verdict, seven times over." (LOG 2026-09-10 "The runner's clock was an input to the verdict, seven times over"; see [The CI saga](#the-ci-saga))

### Defects, by date

#### In the control layer and the travelling highlight

| Date | What | Source |
|---|---|---|
| 2026-08-03 | 120ms eased press dead on a phone; instant press + eased release; then all transitions zeroed | LOG 2026-08-03 "Button meets a real phone…" |
| 2026-08-09 | hover rise withheld on a wrong argument; restored with the lively spring | LOG 2026-08-09 "Motion reaches the control layer…" |
| 2026-08-09 | switch squashed as a mark; named out | same |
| 2026-08-09 | lean 3px and keyed on the thumb's `:active`; 6px, keyed on the root | same |
| 2026-08-09 | `scale: 1` resting on marks broke the 12px stacking rule; five laws failed | same |
| 2026-08-09 | the motion-token law passed `scale 150ms var(--motion-spring-stiff)`; `var()` stripped first | same |
| 2026-08-09 | `:active` could not be produced headlessly; none of four state-behaviour sabotages caught first time | same |
| 2026-08-10 | fields and marks had no hover; boundary hover added (deleted 2026-08-17) | LOG 2026-08-10 "Hover reaches the boundary…" |
| 2026-08-10 | field ring emergence refused ("jaggedy") | same |
| 2026-08-10 | reduced motion never suppressed the ring (six days) | same |
| 2026-08-10 | tick, dot, grip kept clocks under reduce; per-file doctrine | LOG 2026-08-10 "The grip squashes…" |
| 2026-08-10 | open trigger locked at rest, then held press | LOG 2026-08-10 "The seed becomes the trigger itself…" |
| 2026-08-10 | parked pointer made laws pass alone and fail together | LOG 2026-08-10 "Hover reaches the boundary…" |
| 2026-08-11 | held press compressed the panel width 402 → 392 | LOG 2026-08-11 |
| 2026-08-16 | springs had no law though docs said they did | tokens.test.ts:2185 |
| 2026-08-17 | card-as-button had no motion for two months | LOG 2026-08-17 |
| 2026-08-17 | boundary hover moved a field in two currencies ("hover too aggressive"); deleted | DECISIONS §8 |
| 2026-08-19 | tab rule's `--active-tab-right` drew zero width on overflow; reverted to `left` + `width` | LOG 2026-08-19 |
| 2026-08-23 | grip over label; tab touching its line; hover wash over the gliding grip; three hook defects | LOG 2026-08-23 (three entries) |
| 2026-08-23 | the floating body's scale borrowed `--motion-rise` for nine days | LOG 2026-08-23 "The panel's content was stretching on the control layer's clock" |
| 2026-08-25 | grip 14.11px outside the track; walls | LOG 2026-08-25 |
| 2026-08-25 | ~2px pop from the held press spring under a frozen room | LOG 2026-08-25 "The placement's anchor is the trigger's RESTING box…" |
| 2026-08-26 | a dead switch leaned; the coverage law skipped every guarded file; seats unobserved | switch.css:153-173; recipes.test.ts:1764-1776; segmented-control.tsx:218-233 |
| 2026-09-01 | press lost to lit rules (rank); accordion's shorthand replaced the skeleton list; thumb measured through a 0.95 scale | LOG 2026-09-01 (two entries) |
| 2026-09-02 | an icon-only button grew two swaps; the caller's glyph fell to 300 × 150; the positional clock law | LOG 2026-09-02 |
| 2026-09-10 | the ring law asserted an engine's rounding mode; restated as stations ≥ pixels | LOG 2026-09-10 |
| 2026-09-12 | the motion-token laws split transitions at every comma | recipes.test.ts:1572-1590 |
| 2026-09-14 | `motionSpeed` invisible until `dist` was rebuilt; four laws pinned literal durations | LOG 2026-09-14 |
| 2026-09-17 | MessageScroller button's `translate` lift fought Button's hover | message-scroller.css:30-35 |

#### In the floating, overlay and drawer families

| Date | What | Source |
|---|---|---|
| 2026-08-09 | the width floor snapped every entry to 112px on the frame after the seed ("w=40 → 112 in one step, then 112 for the rest of the entry") | LOG 2026-08-09 "Motion ships, on Menu alone" |
| 2026-08-09 | reading a pose-less box during the pose started the animation backwards into its seed | same |
| 2026-08-09 | a rule reading `--anchor-height`, published asynchronously, took its initial value and the corner collapsed to 0px | same |
| 2026-08-09 → 08-14 | the counter-squish read `var(--floating-rise)`, a token that never existed, so the whole declaration was invalid | LOG 2026-08-14 "The entry stops being ported…" |
| 2026-08-10 | Select, the family's second member, found five defects: role, the stamp borrowed from React, specificity, dead pointer region, once per node | LOG 2026-08-10 "The entry becomes the family's…" |
| 2026-08-10 | an end-aligned panel's rows travelled 175px against a start-aligned panel's 21px; `inset: 0` against the padding box made "the inside of the menu jumps after animation finishes" | LOG 2026-08-10 "Why a menu that opens left looks worse…" |
| 2026-08-10 | collision decided against the animating width: `data-align` flipped a third of the way in | same |
| 2026-08-10 → 08-16 | the laid-out guard was dead (`parseFloat` → NaN → `width <= 0`) | LOG 2026-08-16 "The dialog's entry locks on depth…" |
| 2026-08-11 | width compressed 402 → 392 at release (held press) | LOG 2026-08-11 |
| 2026-08-15 | a live list under the seed started translate transitions whose cancellation read as a dismissal: 36.9 → 350 in one frame | LOG 2026-08-15 |
| 2026-08-15 | an unaimed seed painted "one frame at x=2275"; a synchronous aim read a stale positioner (*"going all over the page lol"*) | LOG 2026-08-15 |
| 2026-08-16 | an unplaced positioner at y = −2116 let a focused row scroll the page (*"I click a dropdown menu and then it shifts page"*) | LOG 2026-08-16 |
| 2026-08-16 | `box-shadow` missing from the exit: a menu dismissed 35ms in snapped 169 → 303px in two frames; Escape mid-flight snapped the alert 125 → 560 in one frame | LOG 2026-08-16 |
| 2026-08-16 | the reduced-motion rule one class lighter than the recipe lost the tie and left every clock running; the guard's inverse of every pose missed the aim gate and `min-inline-size` within ten minutes | LOG 2026-08-16 |
| 2026-08-17 | posed before placed, the chosen row settled 66px low (58px from the squish); Base UI's inline height left the block-size channel dead (a 70px panel for the whole entry) | LOG 2026-08-17 "A select's panel is placed by what is inside it…" |
| 2026-08-17 | the flying select panel took `scrollTop: 57`; once clipped, the page took 65px | LOG 2026-08-17 "A select's entry was moving the page…" |
| 2026-08-17 | a top-opening menu's body resolved against an 8px ScrollArea box and clipped for the whole entry (*"the content doesnt load, it comes after animation completes"*) | surfaces.css:3035 |
| 2026-08-17 | a submenu flew 366px while shrinking to a quarter of its width, overshooting to 398 | LOG 2026-08-17 "A submenu flies from the seam…" |
| 2026-08-20 | the quick-reopen replay teleported a dissolving panel 355×98 at 58% to 239×32 at full opacity in one frame (358px → 64px off a short trigger) | LOG 2026-08-20 "A dismissal taken back is CAUGHT…" |
| 2026-08-22 | C1–C4, M5–M9 above; a dismissed panel stayed hit-testable while invisible (Menu 253ms, Select 423ms, AlertDialog 527ms); `margin: 0` in the reduced-motion guard moved a dialog from `360,351 560x98` to `24,24 560x752` for eight frames; Escape took a menu from opacity 1 to 0 "in a single frame and was gone in 29ms"; restoring the popup before the positioner let its height transition carry it 349 → 353px, the maximum scroll offset falling 21 → 17 (*"it scrolls down a bit internally, ever so slightly"*); clearing the negative margin after `scrollTop` "jumped 61px on the frame it landed"; `useClipWarning` warned a plain alert was "208px wider than it is… not reachable" | LOG 2026-08-22 (four entries); docs/handovers/2026-08-22-floating-motion-audit.md |
| 2026-08-23 | a 40-item menu flew to 800px for a panel that settled at 393.4; without the `heldHeight` skip a 48-row select flew to 425 and jumped to 880 (*"this bug is back"*) | LOG 2026-08-23 "The panel measures itself…"; LOG 2026-08-23 "The room clamp…" |
| 2026-08-23 | RTL: the seam opened 2.79px on a 164.8px submenu; a seed painted "85px away on a 141px panel" | LOG 2026-08-23 "A right-to-left menu…" |
| 2026-08-23 | the body pins read `--kui-floating-p`, unset on Popover and Tooltip, so every inset was `auto` | LOG 2026-08-23 "A popover scrolls its own content, and three audit leftovers" |
| 2026-08-23 | "70 of 90 frames carried no `--kui-lens`" (*"the refraction takes place after animation finishes, with a jump"*) | LOG 2026-08-23 "The lens was drawn in the corner of the pane…" |
| 2026-08-25 | a 196px flash (top = −191 for a panel resting at 5); a seed at 651 for a trigger at 450; a seed painting 200px off its trigger at full opacity; the first row at −113 in flight and 41 at rest; a reopened menu at `scrollTop` 196 | LOG 2026-08-25 (five entries) |
| 2026-08-26 | the pin's `inset-block-end` computed 12px against `padding-block-end: 4px` on a tooltip — 8px off its resting line | the 2026-08-26 audit; see [The body](#the-body-surfacescss2776-2824-30723178) |
| 2026-08-29 | a centred body 13.4px from the left edge and 7.4px past the right one on an 88.9px pane; 56px of body holding 60px of words | LOG 2026-08-29 |
| 2026-08-31 | a tooltip's first frame collapsed ~370px of width into a 60px chip; a popover's centre swung 442 → 630 → 623 (`--kui-from-x: 182px`); the auto-margin fix stepped the content 5px; `corner-shape: round` on the seed drew a second circular corner inside | LOG 2026-08-31 (three entries) |
| 2026-09-02 | ContextMenu's pose read as "a twitch — 8% of a panel over 345ms"; the three audit cases above | LOG 2026-09-02 |
| 2026-09-05 | Command's pane had no lens for ~130ms, then four maps in a row; the body's filter made a backdrop root (*"the bg changes and gets thicker in a jump"*); `useStatedFlight` read 98 in the suite and 8 in a real open, and published 303.61px for a pane landing at 313 | LOG 2026-09-05 (two entries) |
| 2026-09-06 | the drawer slide shipped dead (every parked drawer computed `transform: none`) with 2,634 laws green; the clip trimmed the drawer 18px (26.25→673.75 against a box of 8→692); a parked sibling scrolled the page (a 375×700 window reported 663×874); the well turned the page black; the scrim left before the drawer | LOG 2026-09-06 "A drawer slides…" |
| 2026-09-08/09 | a transformed root counted as scrollable overflow; 2px of daylight at 120ms with a one-gap park; a `<length>` registration made the `100%` cap compute 0px; `driven` put 76% of the travel in the first 120ms | LOG 2026-09-09 "A side drawer pushes the frame…" |
| 2026-09-12 | Combobox's seed covered the field being typed into (the popup under the text midline from t=86 to t=140); typing snapped 86 → 56, backspacing left nine rows in an unscrollable 146px box; at rest the height snapped 234 → 162 → 234 | LOG 2026-09-12 "The flight follows its content…" |

### Reversals

- **Transitions:** one 120ms eased transition (2026-08-03) → an instant press with an eased release (same day) → every transition removed (same day) → the two-clock system (2026-08-09) → every transition removed (2026-09-20). (LOG 2026-08-03; DECISIONS §8)
- **The control layer, 2026-08-09, by Kushagra's eye:** the hover rise was withheld on a wrong argument and restored; the switch's mark squash was named out; the lean went from 3px keyed on the thumb's `:active` to 6px keyed on the root. (LOG 2026-08-09 "Motion reaches the control layer…")
- **The open trigger, 2026-08-10:** locked at rest, then made to hold the press within the hour. Principle 12 had reverted a held-sunken trigger in the demo the day before; the sources record no reconciliation, and the Toggle kept principle 12. (LOG 2026-08-10 "The seed becomes the trigger itself…"; DECISIONS §34)
- **Hover on fields and marks:** none (until 2026-08-10) → a boundary hover mixed toward the family's ink (2026-08-10) → deleted with the fill-first flip (2026-08-17). (DECISIONS §8)
- **The field ring:** an emerging arrival built and refused within an hour (2026-08-10); the refusal's engine premise stopped holding on Chromium 141 (2026-09-10), and the refusal stood. (DECISIONS §8)
- **The floating entry:** a designed circle (2026-08-09) → the trigger's own box (2026-08-10) → an opacity-0 overlap window, reversed by the opaque silhouette → the unfurl judged out and three forming recipes built (2026-08-14) → the clip morph rejected and the circle back, 40 → 72 → 56 (2026-08-15) → the silhouette locked (2026-08-15). (LOG 2026-08-10 to 2026-08-15)
- **`pointer-events: none` for the whole flight:** built and reversed within the hour (2026-08-10). (See [While unfurling](#while-unfurling-surfacescss2730-28692988).)
- **Springs:** calm on the floating entry until 2026-08-16 → `elastic` at ζ0.62 (2026-08-16) → ζ0.715 (2026-08-23). A "fluid spring" (2026-08-15) and a "grander overlay spring" (2026-08-16) were minted and deleted. `driven` (2026-09-06) → `carried` (2026-09-08/09). (config.ts:833-874)
- **Clocks:** the menu's clocks off the lab bench (2026-08-16) → 0.75× (2026-08-23) → `motionSpeed` 0.6 (2026-09-14). (See [Panel-family clocks](#panel-family-clocks).)
- **The quick reopen:** replayed (2026-08-16) → caught (2026-08-20) → summoned panels excepted, always flying (2026-09-02). (LOG 2026-08-16; LOG 2026-08-20; DECISIONS §42)
- **The submenu's seed:** a row-height sliver (2026-08-10) → the row's full silhouette (2026-08-15) → the seam beside the row (2026-08-17). (See [Menu, submenus and the trigger that held its press](#menu-submenus-and-the-trigger-that-held-its-press).)
- **The dialog:** a materialization formed on the dialog (2026-08-15) → moved whole to AlertDialog at the split; Dialog took depth (2026-08-16). Its narrow-window sheet arm shipped with motion stood down (2026-08-21, Kushagra: *"it still has same motion as dialog when it opens in sheet. We will design a separate motion system for sheet, so what it has right now is wrong."*). (DECISIONS §24, §25)
- **Select:** a curtain built, law-tested and rejected on sight; the overlap placement restored (2026-08-17). The premise that Base UI normalises anchor rects by `getScale` (2026-08-17) was refuted (2026-08-22). (DECISIONS §23; LOG 2026-08-22)
- **Tabs' rule:** two edges (2026-08-18) → `left` + `width` (2026-08-19) → two edges with the right one derived (2026-08-23). (DECISIONS §26)
- **The segmented control:** no indicator element (2026-08-18) → a travelling thumb with a JS measurement (2026-08-23) → the thumb and the measurement WITHOUT the travel (2026-09-20). Not a reversal: the element stayed, because deleting it changes settled pixels in a squeezed track (see [The exceptions](#the-exceptions-to-no-js-at-interaction-time)). (DECISIONS §26)
- **Popover:** the silhouette (2026-08-23) → a circle on the alert's clocks (2026-08-31) → Dialog's depth (2026-09-14). (DECISIONS §31)
- **Tooltip:** the silhouette (2026-08-23) → a lift (2026-08-31), whose first spring (elastic) became calm on the second pass. (DECISIONS §32)
- **The centred pane:** auto margins for an hour → a `transform` pull (2026-08-31). (LOG 2026-08-31)
- **ContextMenu:** a pose breathing from 0.92 → the family's entry with a zero seed; a cursor-tracking spelling refused by a shipped law (2026-09-02). (DECISIONS §42)
- **The Shell drawer:** a slide with the frame receding (2026-09-06) → a side pane pushing the frame (2026-09-08/09) → the bottom pane pushing too, nothing receding (2026-09-11) → the recession CSS deleted (2026-09-12). (DECISIONS §27)
- **The progress sweep:** `inset-inline-start` → `translate` (2026-08-31). (progress.css:79-97)
- **MessageScroller's jump button:** lifted by `translate` → placed by layout (2026-09-17); its fade moved to the dock (2026-09-19). (DECISIONS §56)

### Laws that could not fail, and other law defects

#### Laws that could not fail, found and repaired or deleted

- The reduced-motion coverage law read selector presence, not victory, and walked `transition` only (2026-08-10).
- "names a motion token" passed `scale 150ms var(--motion-spring-stiff)` (2026-08-09).
- The springs had no law while two documents claimed one (2026-08-16).
- The floating family's reduced-motion "string scan" (2026-08-16).
- "A reopen RETIRES the flight it interrupts" lost its premise when a reopen stopped replaying, and was replaced by the hazard it guarded (2026-08-20).
- "drawn by both edges" read computed insets, "which cannot fail, because getComputedStyle resolves both insets to USED values on a positioned element" (LOG 2026-08-18 "Tabs and the segmented control").
- A guard in the segmented runner "was written, worked, and was then deleted for being unfalsifiable" after the effect stopped being keyed on renders (LOG 2026-08-23 "The traveling highlight").
- The aim gate and the dismissed-panel hit test had no law; "flipping it to `opacity: 1` or deleting it left the whole package green, because the three places that mention `data-aimed` all use it to SELECT a frame to measure" (LOG 2026-08-23).
- The page-hold in the select entry "has never fired": "instrumented in that law's exact fixture … the browser then dispatches ZERO scroll events — so deleting the entire block leaves the suite green", and "no law can be written for a mechanism that never fires" (LOG 2026-08-23 "The page-hold in the select entry has never fired").
- Menu's "the panel's floor is the trigger's LAYOUT width" "never compared the panel to the trigger at all", and adding the measurement to it "PASSED UNDER SABOTAGE — a menu is posed on the mount frame, before the press spring has moved anything"; the claim moved to a `defaultOpen` select (LOG 2026-08-23 "A guarantee held only by a law CI does not run").
- The posed content's rise "went missing and nothing failed … every law here read the BOX" (menu.browser.test.tsx:4271-4283, 2026-08-17).
- ContextMenu's reduced-motion law, written for a pose that was later deleted, "could not fail and took three spellings to learn why" (DECISIONS §42 @39f3884).
- The accordion's travel law ended in a bare `until()` (2026-09-01).
- The progress sweep's law asserted only `animation-name` and `animation-iteration-count` — "no law reads which property animates" — while the sweep animated `inset-inline-start` at "120.3 layouts + 120.3 recalcs/s" (docs/handovers/2026-08-31-glass-motion-perf.md); a law reading the box followed ("the sweep moves the segment WITHOUT moving its box (2026-08-31 performance pass)", progress.browser.test.tsx:301).

#### Laws that encoded the defect as the guarantee

- A select law "asserted `scrollTop <= 1` on every frame, which an item-aligned select is supposed to violate once its list scrolls, so the law had codified the defect as a requirement" (LOG 2026-08-22 "The flight borrows a style…").
- "The per-axis pin law read `inset-inline-start` and expected the pane's padding — which is what the OVER-CONSTRAINT was producing … so the law was reading a defect and calling it the guarantee"; the menu's pivot law decided "is this centred?" by whether the two insets agreed, "true of a spelling that could not centre anything" (LOG 2026-08-29 "A centred body cannot be centred by auto margins").
- The four tabs/segmented laws that pinned `0.32s`/`0.48s` and a seize at 160ms failed on the 2026-09-14 speed change and were moved to read the tokens (LOG 2026-09-14).

#### Degenerate fixtures in the motion laws

"A law over a general case must be built on an input where the general case and the special case give different answers" (LOG 2026-08-20).

- An eight-row select, "the one shape where the whole item-aligned mechanism is a no-op", blinded three laws at once; widened to thirty (LOG 2026-08-22).
- A two-row menu "is never capped — so its natural box and a viewport-sized box are the same number" (LOG 2026-08-23 "The panel measures itself before the browser has told it how much room it has").
- A `defaultOpen` select, where "the trigger is BORN holding the press — no scale transition ever runs", hid the release step that a click produced (LOG 2026-08-11 "The panel compressed at release").
- A narrow menu, where "the row and the seam are nearly the same place — which is exactly how the wrong rule survived being looked at"; and a submenu opened by `defaultOpen`, which "measured 5.8px of pre-fix travel" against the real 366px (menu.browser.test.tsx:2561-2572).
- An un-mirrored submenu, "the one cell that was already right" (menu.browser.test.tsx:2467-2472).
- An RTL law measured against the TRIGGER, "which passed with the fix removed, because a box sitting entirely to the left of a trigger always has its right edge nearer" — "the degenerate-fixture rule inside the measurement rather than inside the mount" (LOG 2026-08-23 "A right-to-left menu…").
- A `defaultOpen` dialog: "Base UI writes `transition: none !important` INLINE on a dialog that opens on mount, so both windows read 'no motion' and a sabotage of the stand-down survives" (dialog.browser.test.tsx:1269-1272, 2026-08-21).
- A drawer suite where "every drawer law in this file reads a LANDED pane", so a drawer that parked where it landed shipped with 2,634 laws green (LOG 2026-09-06).
- A floating family where "every law … compares the last flight frame with the settled panel", so a centred body that was wrong in the middle of every flight shipped with 2,165 laws green (LOG 2026-08-29).
- A squeezed segmented track at 0.55 × natural, below min-content, "the degenerate geometry, not the law's subject" (LOG 2026-08-25).
- An explicit `maxHeight` fixture for the select clamp, thrown away because it "puts the chosen row out of reach of its trigger, so Base UI stops aligning" — "settled 225px off, the same number it 'failed' with, which is the tell" (LOG 2026-08-22 "the placement is carried as LAYOUT while the panel is in the air").

#### Sabotage-pass findings about the sabotage itself

- "A sabotage that changes both sides of an equation tests nothing" — one token spelled both the panel's padding and the insets under test (LOG 2026-08-10 "Why a menu that opens left looks worse…").
- "A sabotage that survives is evidence about the law as often as about the code, and the first question has to be which" (LOG 2026-08-22).
- "A sabotage that does not apply reads exactly like a sabotage that survived" — two sabotages had silently failed to apply "because their indentation was one level off" (LOG 2026-08-23 "The panel measures itself…").
- Reverting a sabotage with `git checkout` destroyed uncommitted work, and "a mismatched delete/restore pair corrupted `menu.css` into something the browser silently dropped — so for several runs a guard was absent while every law about it passed. For a multi-line block, copy the file aside and copy it back" (CLAUDE.md, ContextMenu 2026-09-02; LOG 2026-08-24 glass pass).
- `:active` could not be produced headlessly on 2026-08-09, so "Six sabotage passes on that batch, and NONE of the four state-behaviour ones were caught the first time" (LOG 2026-08-09); `holdPress` closed it 2026-08-22.
- A `KUI_STALL` sweep at 4 was "below the threshold of the fault it was meant to look for": "putting the broken anchor back and re-running measured it PASSING at stalls 2 and 4, and failing at 8, 12 and 20" (LOG 2026-09-10).

Also recorded among the law defects: the ring law asserted an engine's rounding mode and was restated as "at least one station per pixel crossed" (2026-09-10); the transition laws split a list at every comma, cutting one channel in two at a `var()` fallback (2026-09-12); and a tally law (`arms.length >= 3`) kept the dead `:where(.kui-row, .kui-separator)` stand-down arms alive (see [Open at removal](#open-at-removal)).

### The CI saga

The sources: docs/handovers/2026-08-20-ci-deflake.md; LOG 2026-08-20 ("The three flakiest laws…", "The rotation's last four laws…", "A flight is seized by its clocks…", "Stillness is not arrival…", "A law that must catch a MOMENT…", "A check that cannot run is a check that cannot fail"); LOG 2026-08-21 ("A driver gesture resolving…", "The shape is forbidden…", "Main went red on two laws that raced a window…"); LOG 2026-08-23 ("A guarantee held only by a law CI does not run"); LOG 2026-09-10 ("The runner's clock was an input to the verdict, seven times over"); ENGINEERING §6 @39f3884; CLAUDE.md.

**2026-08-17 — the first rule.** Three laws failed on CI in one morning and could not be reproduced idle or loaded. `until()` replaced sleep-then-read ("Wait for a STATE, never for a duration"), and the flight laws armed their watchers before the press, because "real input is slow enough that a whole entry finishes between statements" (CLAUDE.md, 2026-08-17 paragraph; browser.tsx:266-281).

**2026-08-20, morning — "three different lies about time".** "Red on 9 of 13 CI runs, green here, rotating between three laws in `menu.browser.test.tsx`. Bound-tuning had already been tried twice. None of the three defects was the one the failures looked like." Law 2 ("the side it opens on is decided ONCE") forbade any change of `data-align` from a value, but the attribute legitimately flips once before departure — "87ms pose, 93ms flip, 128ms depart at 1x CPU, and 379 / 530 / 755 at 20x" — so whether the observer was installed before or after that flip "was pure scheduling"; the window became "after DEPART". Law 1 ("a reopen RETIRES the flight it interrupts") stamped its deadlines after `departed()`, "~150ms of over-estimate, and every millisecond of it moves the bar later — so the law got stricter exactly as the runner got slower"; its `real + 400` ceiling "was a timing claim wearing a guard's clothes and is the literal `expected 0 to be greater than 0` CI failure"; its comment asserted a ~530ms clock that was 730. Law 3 ("both channels actually MOVE") died of rate metrics, as listed above, and "could not run at all on a fast machine": run alone it failed 6 of 6, because the pose was over before `press()` resolved; "it passed only as part of the full file, because earlier tests had slowed the machine down. **A law whose fixture only assembles when something else is loading the machine is not a law about the code.**" The standing rule: "A law that watches a live animation must derive every instant it reasons about from the RUNNER's own observable events — its departures, its stamps, its releases — and never from the test's wall clock, a frame count, or a constant."

**2026-08-20 — `sweep()`.** The focus-ring law ("expected 2 to be greater than 2") moved onto the animation's own clock; the instrument's docblock names the menu's three sampled metrics that died the same day as the same failure (browser.tsx:306-321).

**2026-08-20 — a check that could not run.** "`pnpm run ci` … could not launch a browser at all" wherever Playwright's browsers lived outside its default cache: "Turbo hands each task a filtered environment, so `PLAYWRIGHT_BROWSERS_PATH` never reached the browser project", and the result read `Test Files 8 passed (37)` — "a launch failure that reads like a pass". With the variable passed through, 1,414 browser laws ran, and "the two-to-three animation-timing laws it newly reveals are pre-existing, rotate between runs" (LOG 2026-08-20; CLAUDE.md). A second instance was recorded 2026-08-23: "Playwright 1.62 wants chromium build 1234 and the image ships 1194, so the browser project could not launch at all — and CI still exited 0 … CI here was reporting green over 1,400 laws that never ran" (docs/handovers/2026-08-23-four-components.md).

**2026-08-20 — "the rotation's last four laws".** "CI still red on 14 of the last 20 runs, rotating between two files." Each premise was a real-time window reached by awaiting toward it. The select replay law "was running TWO gestures, and its three CI failure modes were one defect" — a rewrite armed its observer before a new click and left the old click above it, so "which assertion failed … was pure scheduling: reproduced 3 of 3 under CPU load, in two of the three modes, and 4 of 4 green with the leftover click deleted". "A law's gesture is part of its fixture, and a fixture with two gestures is a law about neither." The silhouette moved to the depart edge. `catchDissolve` held the mid-dissolve window. The open-trigger law waited for the trigger to be reachable; `openItemAligned` waited for `data-side="none"`. "The standing rule gains its second half … a *premise* that is a real-time window closes on its own schedule however faithfully you poll toward it. So: when a law needs the world held in a particular mid-flight state, it either seizes the animation's own clock and holds the window open, or it anchors the read on the runner's edge that defines the moment — and where neither is possible the premise is not a law's to have." The handover records the falsifications: restoring the replay branch failed both CAUGHT laws ("388px -> 66px"); a pose-skip sabotage "fails with CI's own number, 70 vs 36"; tripling the seed height failed at 96 vs 36 (docs/handovers/2026-08-20-ci-deflake.md §3-4).

**2026-08-20 — `seizeFlight()`, and the release seam left unseized.** "The first green merge did not hold: the next two main runs each surfaced another member of the same rotation." The upward-containment law had failed with "the flight was never sampled: expected 4 to be greater than 6 — four frames is all a loaded runner painted". The release-seam law was not seized, because fast-forwarding the springs "renders the finished box under an EARLY placement"; its `before` became "a PROVEN-STILL flying frame … three identical frames with the flight attribute still on", with the gesture re-run rather than asserted "on a stale pair (CI: 'it jumped vertically: expected 27.816 to be less than 1' — 27.8px of legitimate travel between two samples ~200ms apart)". "A clock seizure owns everything the engine renders FROM those clocks — sizes, poses, relative anatomy — and nothing that converges in wall time beside them."

**2026-08-20 — "stillness is not arrival".** Twice on main: "`expected 3.171875 to be less than 2`, then `3.109375` — and both numbers are 1% of the panel, which is the exit's own `scale: 0.99`." The first fix waited for three still frames. "**Stillness cannot tell a box that has ARRIVED from a box that is STUCK** — and a paused transition is perfectly still … A wait must name the DESTINATION when the destination is what the claim is about."

**2026-08-20 — Kushagra's call: "lets remove the core cause, dont test animations on ci machine".** "Four rounds of instrument work in one day — every instant derived from the runner, three separate clock seizures (`sweep`, `catchDissolve`, `seizeFlight`), observers armed before the gesture — and CI went red on a *different* law each round, 15 of 21 runs, with the components correct every single time. Each fix was right and each one only revealed the next-most-fragile law." The measurement that made it structural: "A 20x CPU throttle (`KUI_STALL=20`, new, over CDP) reproduces **none** of the CI failures: the flight laws pass at 20x and only two 24-cell loops time out. So the failure mode is not slowness at all — it is *bursty* scheduling landing inside a specific window, which is exactly what a shared runner does and exactly what no bound can defend against." CI's own printed frame gaps showed stalls of 340ms (browser.tsx:180-184). The criterion, verbatim from the marker's docblock: "a law wears this marker when its claim depends on WHEN it looks — a transient state it has to be looking at while it exists (a pose, a mid-flight box, a plateau), or a series it samples as the animation runs. It is NOT 'the subject animates': 47 laws call `inMotion()` and almost all of them read DECLARATIONS" (browser.tsx:167-176). Two clauses: "reach for an instrument before the marker", and "an excluded law owes CI whatever half of it is static" — the release seam's static half ran on a landed panel and "fails at exactly one padding (4px) against the original bug". Rejected: de-janking the runner ("It lowers the frequency and removes no case"); excluding by `inMotion()` ("a large and silent coverage loss"); a nightly job on the same machines ("the same machine class produces the same non-determinism, one alerting surface further from anyone who would act on it"). "The exclusion is louder than what it excludes": per-law at the call site, counted as skipped on the CI run itself, pinned by `frames.test.ts`, and "still run by the `pnpm run ci` a human owes before pushing" (CLAUDE.md; ENGINEERING §6 @39f3884).

**2026-08-20 — the environment note that was not a flake.** In the remote container used that day the ring law failed "at clean HEAD too — the sandbox ships an older Chromium (Playwright revision 1194) than the repo pins (1234), and that law's very subject is Chrome's whole-pixel quantization of animated `outline-offset`, which differs between those revisions (the failing values are all exact 1/64px LayoutUnit steps). On CI's pinned browser this law ran green on all five runs since its `sweep` rewrite" (docs/handovers/2026-08-20-ci-deflake.md §6). The same failure was recorded as environmental on 2026-08-22 ("5.96875 instead of 6") and 2026-08-23 ("6, 5.96875, 5.95312, 5.9375 … — 1/64px steps. The engine has started interpolating `outline-offset`") (docs/handovers/2026-08-22-floating-motion-audit.md; docs/handovers/2026-08-23-four-components.md). On 2026-09-10 the law was restated to the design constraint rather than the engine's rounding mode (LOG 2026-09-10 "Three repairs that survived a collision").

**2026-08-21 — the settling law, and two more windows.** A menu law failed on main with "the click must have opened it: expected null not to be null"; a scan found seven more of the same shape "rather than by waiting for CI to name them one per run" (LOG 2026-08-21 "A driver gesture resolving…"). Then CI failed on two laws "one day younger than the rule they break": the dialog's name warning (fired inside a rAF; the law slept 60ms) was seized — "the arm expecting a warning returns the moment one arrives and no bound can be too short, while the arms expecting silence wait the full deadline — the fair direction"; the select's release seam (`--kui-anchor-w`, "112 against 115.45") could not be seized "because floating-ui converges in wall time" and was marked. "Stated honestly: I could not reproduce either failure locally. `KUI_STALL=20` passes both" (LOG 2026-08-21 "Main went red on two laws that raced a window…").

**2026-08-23 — a guarantee held only by an excluded law.** The floating-motion audit's verifier sabotaged `restingAnchorWidth` "and ran the real suites: with the scale division removed, `CI=1` over the whole browser project reported zero real laws failing", because the one law that caught it was `watchesFrames`. The guarantee moved into a law that runs on CI, on a `defaultOpen` select, "with a calibration that the two boxes actually differ" (LOG 2026-08-23 "A guarantee held only by a law CI does not run").

**2026-09-10 — "the runner's clock was an input to the verdict, seven times over".** With the lint edge and fonts repaired, CI reached every stage "for the first time in weeks — and then failed three times running on the MACHINE rather than on the code". Turbo "cancels what is in flight, so one timeout reported `docs#build` … and the package's browser project … as not-successful when neither had failed". The repairs: the node project's hang-guard timeout; a keyboard-dismissal law's raced setup (it waited on the panel's own signal instead of being marked, because "marking it `watchesFrames` would have taken a static claim out of CI to fix a setup bug"); a command-palette law that "borrowed a signal that means 'the lens may measure again', not 'this has landed'" (`useStatedFlight` dropped `data-unfurling` on the height `transitionend` OR a guard timer 200ms past the fall, and "on a starved runner it fires first" — the law read 174 against a real 196, and 26 under a heavy stall); the table's ScrollArea law, which "waited exactly two `requestAnimationFrame`s for a ScrollArea's thumb"; the pin law, caught by an observer armed at mount; the tooltip stopwatch; and the glass-lens law, moved onto `seizeFlight`. **The calibration:** "At `KUI_STALL=4` it came back 2,125 green, and that number is nearly worthless … A sweep at 4 was below the threshold of the fault it was meant to look for." Re-run at 8, it found the table law. The 2026-08-20 note that `KUI_STALL=20` reproduces nothing "holds for the class it was written about — laws that SAMPLE an animation, where bursty scheduling and not slowness is the cause. It does not hold here: a wall-clock guard beating a transition reproduces at 8 and above, every run." Also found: "A `WATCHES FRAMES` comment describing a submenu's aimed-seed transient sat above the keyboard-dismissal law, which carries no marker at all … A comment claiming a law is excluded when it is not answers the reader's question wrongly." And a correction worth keeping: "The first of these was written up as 'the last door'. It was not, and the next run disproved it in four minutes … The claim to avoid is not 'this is fixed' but 'this is the last one'."

**2026-09-14 — the speed change.** "Four tabs/segmented laws had pinned `0.32s`/`0.48s` and a seize at 160ms; they read the tokens now" (LOG 2026-09-14).

**At `39f3884`.** The commit's own LOG entry records 58 package laws that had been red on main "for up to a week", fixed on 2026-09-20; none of the causes it lists is motion (NumberField zones, the grey brand, hairline step 6, region glass, the command caption) (LOG 2026-09-20 "The 58 red laws on main"). The frame-watching set held six titles (seven laws), all in the menu and select files.

The section on the floating family adds: of the six recorded CI-excluded laws, the 2026-08-22 audit's Pattern D found that four could not fail on the mechanism they named; and on 2026-09-10 the release-deadline law was found to be a stopwatch (580.8ms against a 300ms clock on a starved runner) and was rewritten to read the maximum declared clock.

### What motion forced into the structure

In the control layer and the travelling highlight:

1. **The two-clock hooks** on every control and interactive surface (`--kui-ct-paint`, `--kui-ct-move`,
   `--kui-ct-move-ease`, `--kui-ct-width`, `--kui-ct-ring`; `--kui-sf-*`), and a node law resolving them.
2. **The switch thumb drawn by both inline edges**, `aspect-ratio` removed, a stated half-diameter corner.
3. **Marks stated no resting transform**; Button, Select trigger, the interactive surface, SplitButton and
   ButtonGroup stated `translate: 0 0; scale: 1`.
4. **Per-file reduced-motion blocks**, each on its declaring selector.
5. **The ring as a hook**, with its `:not()` wrapped in `:where()`; the press split into two `:not()`s at (0,4,0).
6. **A separate thumb element** in the segmented control and the shell bar, a JS measuring hook with three
   observers (the fourth bounded exception), `position: relative` on segments, the chosen segment's fill
   pinned transparent, and `tabInset`.
7. **Registered `@property` lengths** (`--kui-seg-*`, `--kui-tab-*`) to make a spring expressible on a custom
   property, and `max()`/`min()` walls.
8. **The held press** reaching into the floating layer: `heldAnchorWidth` (2026-08-11), the scale division in
   `restingAnchorWidth`, `--kui-anchor-w` kept past release (2026-08-22), `useRestingAnchor` (2026-08-25).
9. **Both done glyphs mounted always**, `system/glyphs.ts`, the `[data-glyph]` arm on the shared icon rule,
   `interpolate-size` scoped to done-capable buttons.
10. **Checkbox's indicator `keepMounted`**, partly so motion had something to animate.
11. **Restated transition lists** where a component added a channel (the accordion trigger).
12. **The MessageScroller jump button placed by layout**, not a transform.
13. **The harness**: stillness default, `inMotion()`, `asksForStillness()`, pointer parking, `holdPress`,
    `sweep`, `watchesFrames`, `KUI_STALL`, and a docs-level node law for frames.

In the floating family, the overlays and the drawers:

- **An extra element in every panel**: `.kui-floating-body`, `.kui-overlay-body`, `.kui-dialog-body` (`role="presentation"`). It existed only so content could squish, print or blur as one unit and hold its width.
- **A JavaScript runner of about 1,600 lines including comments** (`floating.tsx:250–1856`, plus `useStatedFlight` and `OverlayBody`). It carried a `MutationObserver` on the popup, a second on the positioner (the glue), a `ResizeObserver` on the body (Combobox only), a page `scroll` listener, rAF loops capped at 12 and 10 frames, and a release `setTimeout`. The 2026-08-31 assessment counted *"~8 forced style/layout flushes pre-paint; 14 distinct geometry read sites across all phases"* for this package's own reads. Document-wide, including Base UI and floating-ui: *"20-row menu: 5,449 `getComputedStyle`, 1,398 `getBoundingClientRect`, ~254 position solves"*. The lens added its own `ResizeObserver` per glass pane.
- **Borrowing Base UI's inline styles**: height, overflow, scroll offset, and the positioner's width and height, with order-sensitive restoration.
- **Placement bent around the entry**: the positioner pinned at the natural box; a virtual resting anchor for the Positioner; `--kui-anchor-w` outliving the flight; `fitToRoom`/`fitPin`/`fitSink`.
- **Pointer handling**: the transparent held box needed `pointer-events` gymnastics, and dismissed panels needed a `pointer-events: none` keep-alive because restated channels delayed unmount.
- **@property registrations** that existed for motion: `--kui-body-sink`, `--kui-seed-dx`, `--kui-seed-dy`, `--kui-shell-push-x/-y`, `--kui-shell-recede`. Plus the Shell's parking model (`visibility` instead of `display: none`) and a root clip that changed over time.
- **Per-member overrides of the family pose**: Combobox's line seed, Popover's depth pose (and before it the circle), Tooltip's lift, ContextMenu's zero seed, Command's no-runner pane. Each needed a rank dance over the family's (0,5,1) and (0,6,0) arms (`[role]`, `[aria-hidden]`, `[data-side][data-align]` added for rank).
- **Glass**: the lens needed the flight's target box (`--kui-fly-r`), `measureUnlessFlying`, and a stand-down of the dialog body's blur over glass.

### The exceptions to "no JS at interaction time"

Seven bounded exceptions were named by `39f3884` (see ["No JS at interaction time" and its bounded exceptions](#no-js-at-interaction-time-and-its-bounded-exceptions)). **One left the list with motion: the floating layer's flight measurement (the first, 2026-08-09).** The ordinals went with it, and DECISIONS now names the survivors without numbering them.

**The segmented thumb's measurement (the fourth, 2026-08-23) did NOT leave, and that is the one place motion's removal did not take the mechanism motion had created.** It was built both ways on 2026-09-20 and measured: across 342 states the kept thumb is byte-identical to `39f3884`, and a grip painted on the chosen segment again differs in twelve of them — every one a track squeezed below its own min-content, by up to 219/255 over ~1,300 pixels. The cause is the floor the walls left behind: `left`/`right` are `max(measured, --segment-inset)`, so a separate box stops at the channel wall when a seat has left it, and a segment cannot, because its paint IS its layout box (at 140px with the first segment chosen, the seat runs `-0.469 → 53.437` against a floored grip at `26.000 → 53.453`). So the exception survives with its justification changed: granted for the TRAVEL, held now by the wall alone. That change is recorded as an open question in DECISIONS for Kushagra to settle, with the revert fully specified; the Shell's bar thumb (2026-09-09) is the same mechanism's second member and stayed with it.

The other exceptions were bent by motion without being made by it: the lens learned never to measure a pane while it flew (2026-08-22) and to build its map from the flight's target box (2026-08-23), and Tabs' indicator re-measure (the third) carried the travelling rule as well as placing it.

Inside the first exception the runner grew a `MutationObserver` on the popup, a second on the positioner (the glue), a `ResizeObserver` on the body (Combobox only), a page `scroll` listener, rAF loops capped at 12 and 10 frames, and a release `setTimeout`; the 2026-08-31 assessment counted "~8 forced style/layout flushes pre-paint; 14 distinct geometry read sites across all phases" for the package's own reads (docs/handovers/2026-08-31-glass-motion-perf.md). `useStatedFlight` published a flight for a pane with no runner (2026-09-05). The law that enforced the doctrine carried per-file exemptions for "the flight measurement and the content watcher", could not see an observer until 2026-08-26 or `panelSeam` until 2026-08-31, and at `39f3884` still could not see React's `onKeyDown`/`onFocus`/`onScroll`/`onClick` props or `setTimeout` (recipes.test.ts:1060; docs/handovers/2026-08-31-glass-motion-perf.md).

### Bespoke entries, member by member

"One family, one entry" was the rule (2026-08-17); what each member overrode is below. Each override needed "a rank dance over the family's (0,5,1) and (0,6,0) arms (`[role]`, `[aria-hidden]`, `[data-side][data-align]` added for rank)".

| Member | Entry at `39f3884` | What it overrode or added | Source |
|---|---|---|---|
| Menu | the family's silhouette flight (`FLOATING_PLAN`) | the reference member; the trigger held its press | DECISIONS §22 |
| Submenu | the seam: the row's height and corner, the designed seed width, x offset 0 | keyed on `data-side`; `MenuSub` drops `seedSize` | LOG 2026-08-17; DECISIONS §42 |
| ContextMenu | the family's flight from a zero-size seed | `seedSize` on the direction context; y from `--transform-origin`; always flies, never caught | DECISIONS §42 |
| Select | the silhouette, item-aligned (`SELECT_PLAN`) | waits for placement; borrows height, overflow and scroll offset; negative body margin; the page hold | DECISIONS §23 |
| Combobox | a zero-height line at the field's bottom edge that fades (`COMBOBOX_PLAN`) | follows its content in flight; `interpolate-size` at rest | DECISIONS §50 |
| Popover | Dialog's depth, carried by the runner | every pin zeroed, `transform: none`, the body in flow; before it, a circle on the alert's clocks | DECISIONS §31 |
| Tooltip | a lift: the landed box from 0.9 | its own three-channel list on the calm spring; the body's print stood down; pins stood down | DECISIONS §32 |
| Command | Dialog's depth for the column; the results pane falls out of the bar | no runner: `interpolate-size`, `useStatedFlight`; the body's filter stood down; list ↔ empty blur; no ring on the way out | DECISIONS §44 |
| AlertDialog | the materialization (`OVERLAY_PLAN`): a circle rising into the measured card | the body held molten and printed; content motion licensed by its closed anatomy | DECISIONS §25 |
| Dialog | depth, not distance, in CSS alone | no runner, no measurement; a law asserted the absence of size channels | DECISIONS §24 |
| Dialog as a sheet | no motion | clock and pose stood down at matching specificity; the scrim kept its fade | dialog.css:224–260 |
| Shell drawers | a slide that pushes the frame | parked with `visibility`; a root clip on a discrete transition; the recession machinery left inert | DECISIONS §27 |
| Sheet | a slide on the drawer clock | Base UI's swipe; duration scaled by swipe strength | DECISIONS §49 |

### What it cost

- **Bytes (gzipped, as recorded):** the control layer +506 (2026-08-09); Menu's motion with the curves and floating durations +887, 21,684 → 22,571 (2026-08-09); the 2026-08-09/10 system as a whole, budget 20,921 → 23,594 (CLAUDE.md); the interactive surface +74 (2026-08-17); the segmented walls +42, "+57 across both" per CLAUDE.md (2026-08-25); the done state +204 (2026-09-02); the tooltip lift +68; ContextMenu 0 (net −84 against its first version); the drawer comma fix +5; `motionSpeed` no byte change. The 2026-08-31 assessment measured all motion in the stylesheet, library-wide (transitions, `linear()`, clocks, keyframes), at 91 declarations, 8,238 raw bytes and a 1,743-byte gzip delta — 5.0% of the budget; the five `linear()` springs alone were 2,294 bytes / 714 gzipped; the dead stand-down arms 210 raw / 18 gzipped.
- **Runtime:** the runner was about 1,600 lines including comments (`floating.tsx:250–1856`, plus `useStatedFlight` and `OverlayBody`). Document-wide, including Base UI and floating-ui, a 20-row menu cost "5,449 `getComputedStyle`, 1,398 `getBoundingClientRect`, ~254 position solves". Before the 2026-08-22 repair a glass menu open installed 27 lens filters; measured drops were menu glass 18–22 maps and 19–20 of ~40 frames dropped, alert glass 20/62, dialog glass 1 map. Findings 5 and 6 of the performance assessment stood at `39f3884`.
- **Tests:** 47 laws called `inMotion()` by 2026-08-20 and there were 124 `inMotion();` statements across 27 law files at `39f3884`; 27 of 69 browser law files opted into motion; about 270 lines called `until(`; nine `sweep` sites, six `catchDissolve` sites, sixteen `asksForStillness` sites; the menu law file carried ~2,600 lines of motion laws; seven laws (six titles) ran only outside CI.
- **Time:** at least four audits touched the floating family (2026-08-16, 2026-08-22, 2026-08-29, 2026-09-02, plus the 2026-08-31 performance assessment); CI was red on 9 of 13 runs (morning of 2026-08-20), 14 of the last 20, and 15 of 21 across the day's four rounds, "with the components correct every single time"; the CI exclusion registry existed because of it.

### What the removal changed that was never motion's

The three settled outcomes that moved are in DECISIONS §8 ("Three settled outcomes did move"). This
is the one that moves nothing in the package and is only visible to a CALLER, recorded here so the
next person who hits it does not have to re-derive it.

**A resting `translate`/`scale` makes a stacking context and a containing block, and four families
declared one only so the pointer geometry had somewhere to travel from.** `.kui-button`,
`.kui-surface:where(button, a, label:has(.kui-control))`, `.kui-select-trigger` and the floating
popups all rested at `translate: 0 0; scale: 1`. Two effects, and they part company:

- **The stacking context was load-bearing and is restored deliberately.** A glass pane's glint band
  is the pane's `::before`, and without a stacking context on the child it paints ACROSS a control
  sitting in the pane rather than under it — measured on a bled card-as-button in a thick glass pane
  in dark, the band's contribution over the child went from 1,839 pixels at most 7/255 to 2,271 at
  most 36/255. `.kui-button` had this noticed and repaired at the removal; `.kui-surface`'s
  interactive arm and the Select trigger were missed and got the same `isolation: isolate` on
  2026-09-20. With ordinary pane padding nothing reaches the child and the three were identical
  either way, which is why a light, normally-padded fixture cannot see this.
- **The containing block is NOT restored, and only half of it was ever a loss.** `isolation: isolate`
  gives back the stacking context and deliberately not this (measured: an abspos child still resolves
  outward with it applied). So a `position: absolute` child written inside a `<Button>` or a
  `<Card render={<button/>}>` now resolves against an outer positioned ancestor — a change — and a
  `position: fixed` child inside one is no longer captured by it — a correction, because capturing it
  was a side effect nobody designed. No in-package consumer is affected: every absolutely positioned
  descendant in a document holding a loading Button, an icon-only Button wrapping a badged Avatar, a
  card-as-button, a TextField with a hosted Button, an open Menu and an open Select measures the same
  in both trees, and ScrollArea's root states its own `position: relative`, so a popup's scrollbar
  never resolved against the popup.

## Open at removal

What was still open at `39f3884`, merged from the three sections.

### Design questions

- **The button's shadow crossfade** — deferred 2026-08-10, "blocked on the flat/elevated ruling: a cast that does not exist has nothing to step". The loud rung's cast changed in one frame on press (recipes.css:1316). The grammar entry had already left open "how motion's shadow half meets `surfaces='flat' | 'elevated'`" (LOG 2026-08-09 "Motion's grammar is chosen…"; DECISIONS §8).
- **The slider's keyboard-step and track-tap easing** — "a discrete jump has no pointer to track and could ride the recovery spring, iOS's own answer" — and a per-thumb squash on range sliders, which Base UI's stamps cannot key (LOG 2026-08-10 "The grip squashes…").
- **The field ring's instant refusal** — "worth reopening" on an interpolating engine (Chromium 141 rendered 96 sub-pixel stations, 2026-09-10); whether a field's 2px reads as motion is a taste call on a real screen (DECISIONS §8).
- **Velocity handoff** (principle 13) — built only in the demo; "~50 lines of JS, owed only by gestures, decided the day a draggable component exists" (LOG 2026-08-09). Sheet got Base UI's own swipe velocity; the Shell drawer had no drag.
- **The travelling highlight's press lean and grabbable segment**, and a keyboard exemption if a keyboard jump of more than one ever exists (DECISIONS §26).
- **Tooltip's warm slide** between adjacent triggers — a cross-element flight, because Base UI mounts one popup per tooltip; warm tooltips were instant (`data-instant="delay"`) (DECISIONS §32).
- **The Tree's disclosure turn**, never animated (tree.css:63-67).
- **A per-size designed set for the switch lean** "if the eye wants it even across the range" (config.ts:1009-1021).
- **The recorded "next simplification", not taken**: "a single transition list per family with the clocks as variables (it would make the dropped-channel class structurally impossible and is the better design) — recorded here as the next simplification, not taken tonight because it changes the shape of every motion law" (LOG 2026-08-16).
- **Sheet's corner and motion** were judged only on desktop (DECISIONS §25 "Open: the corner").
- **"Every v0 number here"** (DECISIONS §8, 2026-08-10). On 2026-08-23 the project stopped calling judged numbers v0 (LOG 2026-08-23 "The eye pass never happened, because it had been happening all along"; CLAUDE.md: "`v0` is deleted as a label"); config.ts calls the control numbers "judged 2026-08-09 in the motion lab", and the later additions were judged in `/preview` or on Kushagra's bench.

### Mechanisms and defects left standing

- **The select entry's page hold had never fired.** It was kept on judgment — "a passing law here would be the vacuity this repo keeps finding" — as "a safety net for a defect a person actually saw" (LOG 2026-08-23 "The page-hold in the select entry has never fired"). The 2026-08-31 assessment added that its window was five frames, not four, and that it would revert a user's own trackpad flick for up to ~83ms on Popover and Tooltip (non-modal) and on touch-opened Menu and Select.
- **The release deadline was the longest DECLARED clock**, not the flight's. `inline-size` often did not move, so the arrangement was held up to ~730ms (at pre-0.75× clocks) while the box was still for ~285ms (2026-08-22 audit, minor finding). Tooltip escaped only by owning its list.
- **The alert's `corner-shape: round`** was declared only under `[data-seed]`, so every visible frame drew a squircle at 50%; the seed also copied the trigger's radius but not its `corner-shape` (about 5px of overhang for about two frames). Both were raised as minor findings on 2026-08-22 and both rules were still in place.
- **Collision re-decided mid-flight** was fixed by the positioner pin, but DECISIONS §22 still recorded it as open with a `clip-path` candidate.
- **Two floating triggers on one element** (`TooltipTrigger` around `MenuTrigger`) silently mis-anchored the menu (LOG 2026-09-06 "A tooltip around a menu trigger left the menu with no anchor"); whose bug it was, ours or Base UI's, was not established.
- **Vestigial drawer machinery**: `--kui-shell-recede` pinned at 1, the well left transparent, `--scrim-well` and `--motion-spring-driven` emitted and unused, and nothing changing the root's `overflow`. The CSS itself said the well "stays transparent until the recession machinery is removed with the ship pass" (shell.css:558–905).
- **Dead stand-down arms** `:where(.kui-row, .kui-separator)` survived in the `[data-instant]` and reduced-motion rules (210 raw / 18 gzipped bytes); a tally law (`arms.length >= 3`) kept them alive.
- **Performance findings 5 and 6** (a per-frame filter chain on a resizing glass pane; stacked filter passes on overlay entries) were assessed and not acted on (docs/handovers/2026-08-31-glass-motion-perf.md).
- **Whether Base UI's tab indicator suffers the mid-entry scale fault** that the segmented thumb had was stated UNVERIFIED (LOG 2026-09-01 "A box mid-flight is not its own size…").
- **Whether the done state's width actually travelled, and whether the done swap was stood down under reduced motion**, were not measured in the sources (see [Button](#button) and [Reduced motion in the control layer](#reduced-motion-in-the-control-layer)).
- **The menu half of the 2026-08-22 audit's M7** ("a dismissed menu still runs the command") stayed open: it "came from a synthetic `element.click()`, which bypasses hit-testing; a real pointer click was refused by the browser-driver's actionability gate" (docs/handovers/2026-08-22-floating-motion-audit.md).
- **The bench's limit**: below about 0.6× of its baseline the select's chosen row crept after landing. Whether `motionSpeed` 0.6 crossed that line was not re-measured (motion-panel.tsx:24-48).

### Instruments and laws

- **The seven CI-excluded laws** (six titles) ran only in a local `pnpm run ci`.
- **"The rows the flight reveals are the rows the panel rests on"** failed at `KUI_STALL=40` and passed at 20; it was recorded rather than repaired "because its two halves want opposite things", and "It has never failed on CI" (LOG 2026-09-10).
- **The accordion's travel law** sampled "passes through the middle" on a rAF sampler and sat outside the recorded frame-watching set — the shape LOG 2026-08-20 records failing on CI in the menu file (accordion.browser.test.tsx:383-404).
- **The select clamp and creep** could only be verified in a real browser at 420, 500, 620 and 900px, because the suite pinned a tall viewport and "`Emulation.setDeviceMetricsOverride` over CDP was tried as a way to shrink the window for one law and does not take in this harness" (LOG 2026-08-22).
- **The interaction-handler law** did not see React `onKeyDown`/`onFocus`/`onScroll`/`onClick` props or `setTimeout` (docs/handovers/2026-08-31-glass-motion-perf.md).

### Docs

- **The consumer chapter's drift was not corrected**: it gave the judged hover numbers (80/220ms, where the emitted values were 48/132ms and `motionSpeed` goes unmentioned), "both springs" where config carried seven, "three exceptions" where CLAUDE.md counted seven, and the whole-pixel sentence DECISIONS §8 had marked "NO LONGER UNIVERSAL" on 2026-09-10. The text is [Appendix C](#c-the-docs-sites-motion-chapter-as-it-stood).
- **The motion bench** was to be deleted "the day the values are judged"; it was still in the tree, and its 1.0× baseline had become the post-`motionSpeed` values (motion-panel.tsx:21-24).

### Stale or conflicting text at 39f3884

- recipes.css:149-152 still said "No transition ships until the motion system is designed … nothing reads
  them yet."
- switch.css:141-144 still said "Position, not transform, because no transition ships until the motion system
  lands (§8) — the jump is instant either way, and the motion pass will own how this travels."
- progress.css:64-72 said the sweep "may ship while §8 holds every transition at zero … the motion system still
  lands on an empty field"; DECISIONS §43 (2026-09-01) said "§8's zeroed-transition law is untouched" — that law
  was replaced on 2026-08-09/10.
- **The sink was 2px, and several texts said 1px.** `pressTravel: 2` from the first commit (`6af4bb8`) to
  39f3884, and LOG 2026-08-25 measured "§8's held press sinks an open trigger 2px". CLAUDE.md said "a button
  sinks and rises 1px to the pointer"; button.css:77-78 said "A press owns the 1px sink and the 0.975 scale";
  DECISIONS §34 and LOG 2026-08-31 said "a pressed Bold sitting 1px lower". Only the rise (`hoverTravel`) was 1px.
- button.css:127-128 said "The ARRIVING glyph is the one on the long clock and the lively spring"; the rule used
  `--motion-spring` (calm), which DECISIONS §41 also named ("the calm spring").
- DECISIONS §8 said "Both shipped curves cross their target at most once" when seven springs were emitted.
- DECISIONS §8's motion paragraphs were split across the next subsection's heading (see [The rules as DECISIONS §8 stated them at 39f3884](#the-rules-as-decisions-8-stated-them-at-39f3884)).
- config.ts:877-894 placed the floating family's docblock directly above `controlMotion`'s, so the file read
  as if the floating comment described the control clocks.
- toolbar.css:218-222 said "`prefers-reduced-motion` has nothing to stand down" above a stand-down block (238).
- The bounded-exception numbering had "two fifths" for a day (the panel seam and the drag); the drag became
  the sixth (DECISIONS §27).

Also stale at `39f3884`:

- DECISIONS §8 still listed "the floating family's exit (Menu's is open)" as deferred, though the dissolve was chosen on 2026-08-09.
- DECISIONS §22 still recorded the mid-flight collision flip as open with a `clip-path` candidate, though the positioner pin had closed it (the 2026-08-22 audit confirmed `data-align` read `end` in all 40 frames).
- shell.css's header comment still said "No motion yet", stale since 2026-09-06.
- The 2026-08-25 comment in `restingBox` claimed floating-ui's autoUpdate never sees a transform; the 2026-08-31 assessment refuted it, and it was left.
- The floating.tsx comment calls the resting-width division "the 2026-08-10 spelling, restored", while LOG 2026-08-11 says the first reading took the rect "on the open's first frame — before the held-press transition has visibly moved — so it reads the RESTING box"; the sources do not agree about which date's spelling "removed" and which "restored" the division, and the code history in [The width floor and `--kui-anchor-w`](#the-width-floor-and---kui-anchor-w) is what shipped.

## Appendices

### A. DECISIONS.md passages moved out

Moved out of `docs/DECISIONS.md` (and the motion-only rules of `docs/ENGINEERING.md` §6) on 2026-09-20, as they stood at `39f3884`; the text is unchanged, except that this heading replaces the file's title line and its own headings sit two levels lower.

Source: `docs/DECISIONS.md` as it stood at 39f3884 (39f388494fe01c27f0f2aa620359fdc16b62a18b), the last
commit with motion. Removed 2026-09-20 (Kushagra: "Motion needs to be done properly, what we have is not
proper. We can keep a record of it somewhere, in a markdown, but lets go back to instant changes.").

Each section below is headed by where the text stood. Whole paragraphs and subsections are copied
verbatim. Where a paragraph mixed motion with a decision that still holds, only the motion words moved;
those entries quote the removed words and the passage as it now reads. Section numbers are DECISIONS'
own. A short list of wording changes that carried no motion specification follows the DECISIONS
entries, and the ENGINEERING.md rules that existed only for motion laws come last.

#### §8 Variants and interaction states — "Motion: physics, not clips — and it is spent where it was designed" (the subsection, whole; as it stood at 39f3884)

##### Motion: physics, not clips — and it is spent where it was designed (decided 2026-08-03; the system landed 2026-08-09, Kushagra)

**The press keeps its colour instant, and that is the whole reason the control layer can move at all.** An eased press never reaches its colour inside a ~60ms tap, so the control reads dead on a phone — the 2026-08-03 finding that zeroed every transition for six days. It is not overturned, it is separated: paint is one clock and geometry is another, so a tap lands its colour on the first frame while its travel rides a spring underneath. `--kui-ct-paint` is that clock, one variable every control reads, and a press sets it to zero.

**Every duration is scaled by one number (2026-09-14, Kushagra: "keep animation as is, but make them faster").** `motionSpeed` in config multiplies every emitted clock at generation, so the numbers below are the judged RATIOS and the rendered durations are 0.6 of them. The springs are baked per transition and normalised to their own duration, so a shorter clock keeps its curve. The loops (Spinner, the progress and attachment sweeps) are content and do not read it. Laws that name a duration read the token, never a literal.

**Hover is asymmetric.** 80ms in, 220ms out. A symmetric hover reads as a lamp on a switch; this reads as a surface warming under the pointer and cooling after it — and it is the honest asymmetry, because arriving is something the user did and leaving is something they stopped doing.

**Each family says how far it moves; nobody says how long.** Under the finger a button SINKS (down and smaller: only-down reads as sliding, only-smaller as receding), an INTERACTIVE SURFACE sinks too but by its own distances (2026-08-17 — see below), a mark SQUASHES (it has no depth to sink into), and a field does nothing at all — it is the one control the eye rests *inside*, and its box never travels or scales (measured under a real pointer, not asserted). The SELECT TRIGGER is not a field here: it is a button in field dress, and it takes the button family's rise and press verbatim (2026-08-10 — *"its also an onclick trigger"*). **The slider's GRIP is the mark family's last member to answer, and its answer is split down the middle (2026-08-10): distortion on the hold, physics on the travel never.** During a drag the pointer IS the physics — Base UI writes the position inline, and a spring between finger and grip is lag on a direct manipulation, the same category call that keeps a Spinner sweeping — so the grip's transition carries exactly one channel, `scale`, and a law reads the computed list to hold it at one. The squash itself is the family's own (`--press-squash`, no new number), held for the whole drag like the open trigger holds its press, springing back on the recovery clock at release. It is keyed on Base UI's `data-dragging` stamp rather than `:active` — the stamp lands on the first pointerdown frame, thumb press or track grab alike, and survives the pointer leaving the strip under capture, which `:active` is not guaranteed to; the press-clock restate rides the same stamp so deformation and clock arrive atomically (the sabotage pass measured `:active` covering every grab a desktop harness can drive, so the restate is argued on touch timing, not measured). On a RANGE slider the stamp is root state, so both grips squash while either is held — the stamp's granularity, recorded, judged in the playground's range specimen. Keyboard steps stay undecided with the track-tap teleport (a discrete jump with no pointer to track could ride the recovery spring; collected for the eye pass). And a control whose popup is OPEN holds the hover step for as long as the panel is — §21's "in use, not hovered", said by the submenu row, the select trigger and the menu trigger, promoted to the shared layer on the third — **and it HOLDS THE PRESS**: `data-popup-open` pins `press-travel`/`press-scale` — the click latches down, the panel keeps it there, closing lets it back up. One value whether the pointer stays or goes, which is what stills the panel (floating-ui measures the anchor with its transforms, so any hover-dependent geometry on an open trigger drags the anchored panel around on the trigger's own spring). That same fact reaches the panel's WIDTH floor (2026-08-11): "never narrower than the trigger" settles against the trigger's *held* box — 2.5% under its resting rect — so the entry's own synchronous floor measures the trigger AS HELD (the end value of its running scale transition, generic across anchors that deform and rows that never do), or the panel compresses by the difference the frame the flight releases; measured 402 → 392 on the playground's Deliver-to select, and the law that had passed all along opened with `defaultOpen`, where the trigger is born held and no transition runs — the click axis was the broken one. Paint stays live throughout. The clock is the skeleton's, the distance is the family's — which is what keeps a press one sentence per component.

**Glyphs are drawn, not switched on.** A checkbox's tick draws along its own stroke (`pathLength` normalises the path so CSS never measures it), a radio's dot arrives from nothing. Both go IN and never OUT: nobody watches a tick un-draw, and choosing another radio is the answer — watching the old one deflate puts the eye on what was just abandoned.

**The switch thumb is drawn by both its edges**, which is the one structural change motion forced. `inset-inline-end: auto` cannot be animated to, so a thumb pinned by one edge could only teleport; with both ends as lengths it travels, and the lean it takes while held lives in those same two properties — deformation sharing the travel's own channels, so the two cannot sequence. `aspect-ratio` came off with it: the four insets close the square by construction, and left in place it silently outranked the lean.

**The ring ARRIVES, and the direction it arrives from says what happened.** One property — `outline-offset` — travelled two ways. A button's focus came to it *from* somewhere: after a Tab the eye does not know where, so the ring contracts into place from outside, catchable in peripheral vision where one that simply appears is not. After a click it knows exactly, so the same motion would be decoration. No JS is needed because `:focus-visible` already draws that line — except on text-entry elements, where browsers match it on click too.

**A field's ring is instant, and the reason is the mechanism rather than the argument (2026-08-10).** It shipped for an hour emerging from the box's own edge — the same property travelling the opposite way, which is the right story for a focus you *enter* rather than one that arrives at you — and was rejected on sight: *"it grows in steps, like so jaggedy"* (Kushagra). He was reading the engine. Chrome resolves `outline-offset` to whole CSS pixels, so a ring animation renders one frame per pixel of travel however long its clock is: measured, the field's 2px of room is exactly three values (0, 1, 2) across 49 frames, and three steps is a stutter. The landing survives only because it travels twice as far — 6, 5, 4, 3, 2 — which is enough to read as movement on the same clock. **The ring's travel is therefore bounded below by the engine at around 4px**, and a field has no room to spare: its only distance is the offset itself. The colour is instant in both cases regardless — a ring is a truth claim about where keystrokes land, and a truth claim does not fade in.

**AND THE ENGINE'S HALF OF THAT PREMISE IS NO LONGER UNIVERSAL (2026-09-10, measured).** The paragraph above rests on Chrome resolving `outline-offset` to whole CSS pixels, which is what turns a 2px travel into three values. On Chromium 141 the same landing renders **96 distinct sub-pixel stations** across its arrival, so the engine interpolates and the three-step stutter that decided this may simply not exist there. The law that measured it had predicted this in as many words — *"if this ever reports fewer steps than the pixels it crosses, the engine started interpolating and the refusal below is worth reopening"* — and it now states the DESIGN constraint instead: an arrival must be drawn at least one station per pixel it crosses, which a quantising engine satisfies exactly and an interpolating one exceeds. **The refusal stands until it is re-judged on a real screen**, because whether a field's 2px reads as motion is a taste call and not something a law settles; what has changed is that it is now conservative rather than forced. The 4px lower bound on ring travel is unchanged and still law-pinned.

Which arrival a control gets is a hook, `--kui-ct-ring`, so that reduced motion can stand down the recipe rather than the rules that read it.

#### §8 Variants and interaction states — the motion paragraphs that continued under "Hover is one step, in one currency" (as it stood at 39f3884)

**What moves is a panel arriving, and it moves on a spring.** The web animates with *clips*: a duration and a curve, time as the input. Apple attaches a spring to the object — position, velocity, target — and time falls out, which is why an interrupted iOS animation turns around instead of restarting. We cannot ship a solver for every state change (that is JS at interaction time), so the solver's OUTPUT is baked into a `linear()` easing: a damped spring sampled at fixed intervals, costing exactly what a cubic-bezier costs. `config.ts` states the PHYSICS — damping ratio and frequency — and the generator samples it; a law re-derives the emitted curve from the model, so the two homes cannot drift.

**Two clocks, and they are different kinds of thing.** Colour and opacity are *signals*: they ease, and they are short (`--motion-duration`, `--motion-easing`, designed 2026-08-03 and unread until now). Geometry is *physics*: it rides `--motion-spring`, or `--motion-spring-stiff` where nothing may overshoot. Mixing them is what makes a system read as a slideshow. A mounted law walks every channel of every transition and asserts the split.

**Damping is sacred.** Both shipped curves cross their target at most once. A second crossing is a ring, and a ringing interface reads mechanical — the failure that killed three earlier spellings of the switch in the motion lab. When a movement needs to be more visible it gets more TRAVEL, never less damping. The bouncy curve that exists in the lab is the rejected comparison and is deliberately not emitted.

**No duration is ever typed in, and a law reads through the indirection to prove it.** The old zero-transition law walked every sheet and named the one that was allowed to move, which is what kept motion from being accreted a component at a time; when the control layer started moving, naming sheets stopped being the mechanism. What replaces it is that a duration cannot be *written*: every channel of every transition in the package must resolve to a motion token, with `var()` stripped first so that a hand-typed `150ms` cannot hide behind an easing that happens to be one. A component easing something on its own authority fails in CI, not in an audit six weeks later.

**Suppression is total — and for six days it was not, which is the sharpest lesson here (2026-08-10).** Under `prefers-reduced-motion: reduce` the panel is simply there and then simply gone, no control travels, and the JS measurement that only serves the animation is not taken. A suppression that leaves one channel moving is worse than none: the user who asked for stillness gets it in pieces. **The focus ring was that channel.** `:not()` takes the specificity of its most specific *argument* rather than summing the list, so `.kui-control:focus-visible:not(input, textarea, .kui-row)` is (0,3,0) and the stand-down keyed on `.kui-control:focus-visible` is (0,2,0) — a media query adds nothing, and the ring went on landing for every user who had asked their operating system for stillness. Two things let it ship: the suppression law walked `transition` declarations and this is an `animation`, and even for transitions it only asked whether a selector was *present* in the guarded block, never whether it *won*. The fix is structural rather than arithmetic — the stand-down targets the hook, so a recipe and its suppression share a selector and the tie goes to source order — and the law is now mounted: the suite can enter the media query (CDP) and read what a focused control actually computes inside it. **The same lesson had a second verse the same day, in the moving PARTS.** The shared stand-down covers `.kui-control *` at (0,1,0), and every part a component adds — the tick's stroke, the radio's dot, the switch's grip — is declared in a sheet that imports later: the dot's selector outruns (0,1,0) on specificity and the others tie it and win on file order, so all three kept their clocks under `reduce` (the tick's 0.38s, measured) while the coverage law read which selectors *appeared* in the guarded block. The doctrine is now per file: **the sheet that declares a clock stands it down itself, on the declaring selector**, so the tie goes to the stand-down by construction — and the mounted law walks the parts, each subject calibrated to have a live clock first, because its own first spelling pointed at an unchecked radio and a checked box's dash, both riding instant-out arms in every mode, and was caught measuring nothing by its own sabotage pass.

History, because it constrains the future system: an interim 120ms eased transition shipped with Button and failed on a real phone — a tap lasts ~60ms, so an eased press never reaches its colour and the control reads as dead; desktop emulation never showed it. The interim fix was instant press with eased release. Zeroing everything supersedes that, and hands the finding forward as a hard constraint: **whatever motion lands, press stays instant.**

#### §8 Variants and interaction states — the floating family's entry, the silhouette, the centred pin, the label's pose, the seam, the interactive surface's motion and "What is still deferred" (as it stood at 39f3884). The standing law at the end of "The seed is the trigger's silhouette, PLACED" stays in §8 as its own paragraph

**The entry is the FLOATING FAMILY's (2026-08-10, Kushagra: *"can we apply the same animation to select now?"*).** The recipe moved out of menu.css onto the family class — every selector reads `.kui-surface.kui-floating` — and select.css gained no motion CSS at all; Select answers by membership, with an agreement law pinning both panels to one computed recipe. The second member normally self-keys a copy and the third promotes; this promoted at two because the mechanism was family-named end to end before Select existed (the JS finds its panel by the family class, the measured box and the clocks all carry family names) and the only component-level thing was the selector — an accident of Menu shipping first. Two rules the second member forced: the entry begins per OPEN, not per mount (Base UI's per-open starting stamp, observed — a select's panel lifecycle differs from a menu's, and the ref-keyed entry played once per node); and a measurement at or under the seed means "not laid out yet, retry" (a freshly mounted positioner can still be zero-width, and the panel measured as its own padding and flew TOWARD 10px). **And the entry became the MORPH the same day** (Kushagra: *"what happened to the idea that it feels like it morphs from the buttons?"* — the lab's other entry, refused 2026-08-09 because the anchor's box arrives asynchronously): the seed is the TRIGGER'S OWN BOX — its width, height and corner, measured synchronously by the entry itself, sitting exactly over the trigger with no position ever read (the seed is pinned to the panel's anchored corner, and that corner is the trigger's; the travel is its own height plus the stamped gap). The designed circle survives only as the fallback for an entry that never measured; a SUBMENU'S seed claims ADJACENCY rather than overlay (a row-height sliver level with its trigger row, growing down — its row is as wide as the panel it sits in, so an overlay lean meant a full-row flight across the parent), and the half-seed sideways lean is deleted whole — a fixed circle near a variable trigger needed a judged distance, a matching shape needs none. The morph's one structural consequence: the release is now BY THE CLOCK (the popup's own computed transition list), never by a channel's `transitionend` — a select's trigger is routinely exactly as wide as its panel, so the inline channel legitimately never fires.

**The seed is the trigger's silhouette, PLACED (locked 2026-08-15, Kushagra: *"make the circle shape of trigger exactly, and make it start from where the trigger is, thats all"*), and the two days between are LOG's.** The 2026-08-14/15 detour built and retired, each judged by eye: three forming recipes (a near-1 condensation, a deep scale with a droplet corner, a clip-path window morph), the restored designed circle (40 → 72 → 56, with a quadrant growth center and a hold-then-unfurl beat), a fluid spring for the unfurl, a three-stage silhouette→circle→panel choreography, and a covering placement where the panel opened over its own trigger. What locked is the simplest of them: **the panel's first frame is the trigger's own box — width, height, corner — sitting exactly ON the trigger, opaque (a body does not fade in), and the emergence unfurl grows it straight into the panel's box.** The content is held as ONE unit — the body empty and blurred, printing as the shape lands — and the entry finally answers "where did this come from" with the thing that was pressed. Four mechanisms carry it, each earned by a measured failure: the position is **measured, not derived** (`--kui-from-x/y`, a translate and never a margin); the aim runs **after placement** (a microtask past the commit's layout effects, re-checked one frame later — measured synchronously it read a stale positioner and the panel flew across the page); the seed is a **static pose** (`transition: none` — under a live list every aim write started a translate transition whose cancellation at release read as a dismissal, and the panel snapped to full size two frames in, so the release clock is read the frame the seed comes off); and the silhouette is **invisible until aimed** (`data-aimed` — one un-placed painted frame measured at x=2275). The end-aligned content law restated itself for a box that travels: the content moves in screen space WITH the box by design, and what must hold still is its distance from the panel's own end edge. The designed diameter survives only as the anchorless fallback. The body's counter-squish is genuinely running since 2026-08-14 — it shipped reading `var(--floating-rise)`, a token that never existed, and a dangling `var()` invalidates its whole declaration silently. That finding became a standing law: **a `var()` without a fallback must resolve somewhere** (fallback-bearing reads are hooks; JS-written names carry an allowlist), so the `--floating-rise` shape can no longer ship silent.

**A CENTRED panel is held by its middle (2026-08-31, Kushagra: the popover *"for some reason goes left"*).** The flight pins every pane by an edge, and the base rule's edge is the START — right for a start-aligned menu, whose seed sits at that edge, and for an end-aligned one, which has its own arm. Centre is the one alignment where the pinned edge is not the trigger's, so the aim measured a real offset (182px on a default popover) and wrote it onto `translate`, which rides the FALL clock while the width rides the SPREAD clock: the near edge slammed left in 345ms while the far edge was still opening over 510ms, and the centre swung 442 → 630 → 623 in one unfurl. A centred bottom or top pane is now held at the positioner's middle and pulled back half its OWN width by `transform` — a percentage of the box itself, so it holds through the elastic overshoot too, where the auto-margin spelling that shipped for an hour clamped at its start inset and stepped the content 5px sideways — and the pane grows out of its trigger from the middle, which is what the transform-origin table (`--kui-origin-x: center`) had claimed for this cell all along. `transform` and not `translate`, because `translate` is the flight's animated channel and would slide at release. LOG carries the rejected spellings.

**A LABEL does not use the silhouette at all (2026-08-31, §32).** The silhouette answers "where did this come from" by growing the trigger's own box into the panel, which is honest where the panel IS the thing pressed. A tooltip is a label, and a label is not the thing it names: photographing a card and collapsing it into a 28px chip narrates a lineage the chip does not have, and it was the family's largest movement on the smallest pane it draws. The tooltip's pose is its LANDED box — the runner's own `--kui-fly-w/h/r`, published for every anchored flight — scaled a little toward the trigger's edge and faint, so no size, travel or corner channel runs and only scale and paint do. The runner is untouched; the two exceptions the family now carries (the popover's circle, the tooltip's lift) are both self-keyed poses over the one flight, which is the second-member rule holding for motion.

**A panel that lands BESIDE its trigger flies from the SEAM, not the silhouette (2026-08-17, Kushagra: *"the way submenu appears is quite aggressive… it ends up traveling a lot, especially if dropdown menu is wide"*).** The silhouette is honest exactly where the panel LANDS on the thing it came out of — a menu hangs off its button, a select straddles its field, and in both the first frame is the trigger's own body about to lift. A submenu never lands on its row; it lands beside the panel the row sits in, so photographing the row starts the panel somewhere it will never be and the unfurl runs BACKWARDS. Measured on a 365px menu: a 353 x 30 seed at x=10 flying into a 92 x 73 panel at x=376 — 366px of travel while shrinking to a quarter of its width, overshooting to 398 on the way, with both numbers the parent panel's own width (which is why it worsened as the menu widened). The exception is keyed on the PLACEMENT, never on the component: the positioner already publishes `data-side`, so the runner asks the question the placement has answered rather than asking a component what kind of thing it is. A side-opening panel keeps the row's height and corner — that shared edge is real, and the submenu does emerge at the row's own line — drops the width photograph to the family's designed seed, and takes an x offset of ZERO, because the positioner is already holding its start edge at the final place. That zero is what makes it direction-blind for free: no left/right decision is taken, so RTL is the same code. Decided in the aim rather than where the seed is written, which is the first moment the placement is certain and still before any frame can paint. The claim it replaces had shipped in surfaces.css as "the row-shaped seed grows the short, true distance out" — true only for a narrow menu, which is how it survived being looked at.

**An interactive surface moves like a control, at its own scale (2026-08-17, Kushagra: *"should work like button, but because of larger area, perhaps a little different physics"*).** Card-as-button shipped 2026-08-03 with the control layer's state COLOURS, and when the motion system landed six days later it was written against `.kui-control` — so the one component in the library with a full state machine and no motion sat there for two months: measured, `transition-duration: 0s` and `translate: none` on a card whose fill was stepping white-to-grey under the pointer. Nothing failed, because no law read a clock on it. §10 already says an interactive surface REUSES the control state machine rather than inventing a surface one, and that is now as true of how it moves as of what colour it turns: the same two clocks, the same lively recovery and stiff press, the same `kui-ring-land` arrival, the same shared `--hover-travel` for the rise. **Only the DISTANCES are the surface's own, which is this section's rule stated exactly.** The scale is the number that could not be shared, and the reason is that scale is RELATIVE while these boxes are not the same size: a ~64px button at 0.975 moves each edge 0.8px, and a 400px card at the same factor moves each edge 5px, which reads as the page flexing rather than as a press. `--press-scale-surface` is 0.995 — a 400px card at 1.0px per edge, matched to the button's EDGE MOVEMENT, which is what the eye reads, rather than to its ratio, which it does not. The sink halves to 1px for the same reason a heavier thing moves less under the same push. **A separate SPRING was proposed with these and refuted by arithmetic before it was built:** §24's "mass forbids overshoot" argues for `poised` over `lively`, but lively overshoots 10.7% and 10.7% of one pixel is a tenth of a pixel — nothing to see, so nothing to fix, and a second curve would have been entropy bought with a plausible story. Both distances are v0. Found with it: `resolveHooks` in the node laws knew only the control layer's `--kui-ct-` stem, so the surface's channels read as unsprung and hand-typed the moment they existed — right to fail, since an unresolvable hook is indistinguishable from an invented one, and widened to both private stems rather than to a listed exception.

**What is still deferred (2026-08-10):** the floating family's exit (Menu's is open — see LOG), the button's shadow crossfade (blocked on the flat/elevated ruling: a cast that does not exist has nothing to step), the slider's keyboard-step and track-tap easing (the grip's HOLD closed 2026-08-10 — the paragraph above; a discrete jump with no pointer to track is the piece still open), and every v0 number here. The grammar is settled and the tokens exist; what remains is eye-pass work, and each piece lands with its own laws.

#### §9 The component axis model — "And the rule reaches through exactly one box: `.kui-dialog-body`" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> That div exists only so the entry can blur the content (§24)

Replaced there by:

> That div stands between the pane and the caller's children (it was minted to hold a dialog entry's blur, §24, and stays for the layout it carries), so every selector here

#### §9 The component axis model — "A card can be CHOSEN, and a card can be DEAD", the dead card's motion (as it stood at 39f3884)

The motion sentences were removed and the paint sentences kept. The passage as it stood:

> The motion stands down on the same arm, which needs no `:hover`/`:active` blocks of its own: the arm ties with them at (0,2,0) and sits after them, so it wins on source order. **The first cut wrote those blocks anyway and a sabotage pass appeared to prove them unreachable — which was wrong about the hover one and cost a same-day repair (Kushagra: "why does a disabled card respond to hover?").** The MOTION needs no arms: the disabled rule ties with hover and press at (0,2,0) and sits after them, so it wins on source order. The PAINT does: the hover and press rules set `background-color` directly, and a direct declaration beats a custom-property indirection, so re-pointing `--kui-sf-fill-src` never reaches them. The pass was green because the only law watching read travel and scale — the axis that was already right. **A sabotage that survives is evidence about the LAW as often as about the code.**

It now reads:

> **The disabled arm carries its own `:hover`/`:active` blocks, and a sabotage pass once appeared to prove them unreachable — which was wrong about the hover one and cost a same-day repair (Kushagra: "why does a disabled card respond to hover?").** The PAINT needs them: the hover and press rules set `background-color` directly, and a direct declaration beats a custom-property indirection, so re-pointing `--kui-sf-fill-src` never reaches them. **A sabotage that survives is evidence about the LAW as often as about the code.**

#### §10 Surfaces — the lens ("This does not breach \"no JS at interaction time\"") (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> , which is the same seam the floating layer already measures its own box on — **and never while a pane is FLYING (2026-08-22)**. That sentence was true about hover and press and silent about the one gesture that resizes a pane continuously: the entry animates `inline-size` and `block-size` on the exact element the lens is attached to, so every frame was a distinct cache key and every miss ran the whole solve, the PNG encode and the filter graft synchronously inside it. Measured on one glass menu open: 27 distinct filters installed on a single panel, two after. It could not look right while doing it either, each map being generated for frame N's box and applied on frame N+1's. The measurement is DEFERRED rather than skipped — a flight ends by taking its stamp off, which is a signal — so the pane is measured once, at the seam.

Replaced there by: nothing (the surrounding sentence closes over the gap).

#### §11 Per-component defaults — the Accordion trigger row (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> the tree's disclosure glyph in the trailing slot turning on the mark clock; the panel travels by `block-size` on the travel clock and its words start under the label

Replaced there by:

> the tree's disclosure glyph in the trailing slot, turned when open; the panel's words start under the label

#### §11 Per-component defaults — "Progress has no size axis", the indeterminate paragraph (as it stood at 39f3884)

**Indeterminate ships, and it does not touch §8's zeroed-motion law.** That law bans a `transition` — the easing of a state CHANGE, which is what the motion system was deferred to design. A sweeping segment is the other thing entirely: motion that IS the content, the Spinner's category, and therefore the Spinner's reduced-motion answer — *slowed, never stopped*, because a busy indicator that stops moving is information lost. Nothing in the bar reads `--motion-duration` or `--motion-easing`, so the motion system still lands on an empty field.

#### §22 Menu — the width paragraph (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> load-bearing in both directions — it beats the bare `--floating-min-w` a submenu takes, and it LOSES to the flight's own stand-down that lets a panel be narrower than its trigger while it is still unfurling.

Replaced there by:

> load-bearing: it beats the bare `--floating-min-w` a submenu takes.

#### §22 Menu — the width paragraph (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> The anchor term is the entry's own `--kui-anchor-w`, the trigger's LAYOUT box, and it OUTLIVES the flight — see §22's entry.

Replaced there by:

> The anchor term is Base UI's own `--anchor-width`, the trigger's box.

#### §22 Menu — "Refused, and the refusals are the API" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> Motion: the panel unfurls out of a seed and dissolves on dismissal (§8 — Menu is the motion system's first floating consumer; the control layer joined it 2026-08-09).

Replaced there by:

> The panel opens and closes at once (§8); `docs/archive/motion-v1.md` records the entry it had.

#### §22 Menu — "The entry is not settled, and what is open is named" (as it stood at 39f3884)

**The entry is not settled, and what is open is named (2026-08-10).** Two faults co-occur on every menu opening from a trigger near a right edge. The first is fixed: a block child lays out from its container's inline-start, so an END-aligned panel's growing edge and its content's origin are the same edge, and every row travelled the panel's whole width on the way in — measured at 175px against a start-aligned panel's 21px. The body is now pinned, for the whole flight, to the edge the box is *not* growing from (absolutely, not by auto margin: an auto margin resolves to zero when the available space is negative, which is the entire flight). The second is **open**: sampled frame by frame, an end-aligned panel reports `data-align="start"` for its first several frames and flips about a third of the way in — correctly, because a 40px seed does fit beside the trigger and a 209px panel does not. **Collision is being decided against the animating width**, so the panel re-anchors mid-flight with the wrong origin and the wrong lean before it. The candidate fix is a change of mechanism — animate a `clip-path` inset rather than the box's size, so the panel holds its final box from frame zero, collision is decided once, and the body pin becomes unnecessary — and it waits on a judgment, because a panel whose real box (with its backdrop-filter and its shadow) exists at full size from the first frame is a different thing on screen.

#### §23 Select — "Positioning is the system's, whole, and the CHOSEN ROW SITS ON THE TRIGGER" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> — its anchor term being the entry's own `--kui-anchor-w` — the trigger's LAYOUT box, kept for the panel's life rather than handed back at release (2026-08-22: floating-ui keeps re-measuring the anchor as the held press travels, so a floor handed over at release is handed to a number still in motion; measured `--anchor-width` walking 400 → 388 → 390 while the panel sat at 400, then a 10px snap one frame after it had visibly stopped)

Replaced there by:

> — its anchor term being Base UI's own `--anchor-width`, the trigger's box

#### §23 Select — "The entry is the family's, unchanged — what moves is where it LANDS" (as it stood at 39f3884)

**The entry is the family's, unchanged — what moves is where it LANDS, and the ordering that forces.** A select flies out of its trigger exactly as a menu does (§22's silhouette); the difference is that the box it flies into straddles the trigger instead of hanging below it. Base UI computes that overlap from the panel's REAL box, so the panel must be PLACED before it is POSED — the runner's plan carries `placedByContent`, and the entry waits for the box to hold still rather than posing on the mount frame. Nothing is lost by waiting: the pose is transparent until it is aimed. Two consequences are load-bearing. The family's pose rules are keyed on the FLIGHT (`data-unfurling`) and not on the visibility gate (`data-seed`), because a select wears the gate through the placement window and a pose applied there shrinks the box the placement is measured from — 66px of misplacement, of which the body's squish alone was 58. And the flight BORROWS the inline `height: 100%` Base UI writes for an item-aligned panel, restoring it at release: an inline declaration beats every rule in a stylesheet, so with it in place the entry's block-size channel is simply dead.

#### §24 Dialog — "The entry is DEPTH, NOT DISTANCE", inside the "Refused, with the reasons in the registry" paragraph (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> **The entry is DEPTH, NOT DISTANCE (locked 2026-08-16; the materialization it replaced is AlertDialog's, §25).** The recipe that formed here first — a circle of surface rising from below the card's footprint and unfurling into the measured box — was judged at the lab's half-screen and 88vw masses to be an ARRIVAL: travel, overshoot, a point origin, an interruption announcing itself. Correct at alert mass, wrong here, because a dialog is SUMMONED — opened by the user's own hand — and at modal mass that inertia reads as the room moving rather than as a thing arriving. So the panel comes into focus, not into view: **3% in z on the `poised` spring (ζ0.8 — one crossing at ~1.5% of the travel, damping's whole allowance spent on the approach, because mass forbids overshoot), zero travel in x or y, presence as paint on its own faster clock.** The scrim pushing the app back IS the arrival (§10), which is what buys the panel the right to move almost not at all. **The content shares exactly one channel with it and nothing else: blur → sharp, on the box's own clock.** Depth of field is a property of the mass — a page does not come into focus after the page does — and blur is the only channel that presumes nothing about arrangement, which is what makes it the one animation the system may honestly apply to content it does not own (the alert's molten hold and top-down print are legal there precisely because that anatomy is system-owned). The four large-mass principles the lab settled, kept because they predict the next heavy surface rather than describing this one: mass lowers frequency, mass forbids overshoot, mass shortens travel — until at the limit the environment moves instead of the object — and mass softens onset. **Mechanically it is the lightest entry in the system: no measurement, no pose runner, no release clock — Base UI's own transition stamps carry all of it, so a dialog's whole motion is CSS.** The body wrapper exists only to hold the blur (§10's mechanically-forced sanction, Spinner's `<span>` and the floating body's argument). Its own clock family (`dialogMotion`), and the ABSENCE of every size channel is asserted by law, because the absence is the design. The exit is the family dissolve with `scale` still listed, so a dismissal mid-arrival retargets the running spring instead of cancelling it. Reduced motion stands the whole thing down — including the content's focus, since a blurred body is a worse failure than any motion. Values are v0 for the eye pass: the depth, the blur, and both clocks.

Replaced there by:

> A dialog opens and closes at once (§8); `docs/archive/motion-v1.md` records the depth-not-distance entry it had, and the body wrapper that held its blur (`.kui-dialog-body`) stays for the layout it carries (§9).

#### §25 AlertDialog — "The fixed anatomy is licensed by three forcers stacking" (as it stood at 39f3884); rewritten in DECISIONS to say the third forcer left with motion

**The fixed anatomy is licensed by three forcers stacking — §10's criterion, which Card and Dialog each failed differently.** The role wires a name and a description. The behavior forbids outside-press dismissal, so actions must EXIST and initial focus must land on the safest one. And the entry animates the content itself, which the system may only do to content it owns — the exact reason Dialog could not keep the materialization. The cascade is the design: role → closed content → closed box → owned motion. If the slots are ever opened up, the content animation leaves with them.

#### §25 AlertDialog — "The materialization is this component's entry, moved whole" (as it stood at 39f3884)

**The materialization is this component's entry, moved whole (LOG 2026-08-16).** The recipe re-keyed from the family class to the alert's popup, the OverlayBody runner promoted to system/floating.tsx (a JS mechanism's second consumer — the render.ts/PortalScope precedent), and three motion laws moved with it, re-targeted. Dialog is entry-less by sequencing until its large-mass entry lands in the follow-up commit; the recipe was never ownerless.

#### §25 AlertDialog — the narrow (sheet) arm: "It carries NO motion, and the absence is deliberate" (as it stood at 39f3884)

**It carries NO motion, and the absence is deliberate (Kushagra, same day: "we will design a separate motion system for sheet, so what it has right now is wrong").** §24's entry is depth-not-distance, and every word of that argument is about a CENTRED panel at modal mass — the scrim pushing the app back is the arrival, so the panel need only step forward in z. A sheet does not arrive that way; a 3% scale on a box already resting on the bottom edge reads as the wrong gesture rather than a small one. Both halves are stood down — the clock AND the pose — because with no transition the browser still paints one frame at the starting values, which is a 3%-smaller blurred panel popping into place. Menu's precedent: shipped instant, moved the next day. The scrim keeps its fade, which is not an exception — the backdrop's recipe is about the app going back, not about how the panel arrives.

#### §25 AlertDialog — "Open: the corner." (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> It waits for the eye pass, with the sheet's own motion.

Replaced there by:

> It waits for the eye pass.

#### §26 Tabs and the segmented control — "There is no indicator element in the segmented control" (as it stood at 39f3884)

Removed WHOLE, and the segmented control did NOT go back to it — the thumb element survived the
removal (see [The exceptions](#the-exceptions-to-no-js-at-interaction-time) for the 342-state
measurement that kept it). This paragraph was already stale at `39f3884`: it says the absence is the
design, and the travelling highlight had given the control a thumb on 2026-08-23.

> **There is no indicator element in the segmented control, and the absence is the design.** Base UI's Tabs ships one because it measures the active tab for you; RadioGroup ships none, so a gliding thumb here means writing the measurement ourselves — a mechanism whose only consumer is a motion that has not been designed (§8's pass owns it), which is the entropy this repo keeps paying for (the curtain, deleted 2026-08-17). The selected segment paints its own box: no JS at interaction time, and the honest thing to draw when nothing travels.

Replaced there by: DECISIONS §26's "THE GRIP IS ITS OWN ELEMENT, AND IT SURVIVED THE MOTION REMOVAL
ON ONE MEASURED FACT (2026-09-20)", which says the opposite and carries the measurement.

#### §26 Tabs and the segmented control — the Tabs indicator paragraph (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> **It is drawn by `left` + `width`** — Base UI's own spelling, and everyone else's.

Replaced there by:

> **It is placed from `left` and `width`** — `--active-tab-left` and `--active-tab-width`, the pair Base UI computes in one space.

#### §26 Tabs and the segmented control — the Tabs indicator paragraph (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> Two edges is a thing to reach for when a motion needs them, and it will need a coordinate fix first.

Replaced there by: nothing (the surrounding sentence closes over the gap).

#### §26 Tabs and the segmented control — "That indicator re-measures on every selection change" (as it stood at 39f3884); the flight measurement left the list of exceptions

Removed (the passage around it stays in DECISIONS):

> it is the third bounded exception, beside the floating layer's flight measurement and the lens (§10, §22)

Replaced there by:

> it is a bounded exception, beside the lens (§10)

#### §26 Tabs and the segmented control — "THE TRAVELLING HIGHLIGHT", "The recipe is the switch's edge trick", "THE CHANNEL HAS WALLS", "Direction is the one fact CSS cannot see", "The tab rule is drawn by two edges again" (as it stood at 39f3884)

**THE TRAVELLING HIGHLIGHT (2026-08-23, Kushagra, judged in the "Clip vs Physics" bench; §8).** Both ship it now, and the prediction above held in one direction and not the other. Tabs' indicator was already an element of its own, so it needed nothing structural; the segmented control shipped with NO indicator on the recorded argument that a gliding thumb would mean writing a measurement for a motion nobody had designed — and its own comment named the door it was leaving open: *"when the motion pass wants one object gliding between homes, the measuring hook arrives with it."* It has arrived.

**The recipe is the switch's edge trick applied BETWEEN homes.** One object drawn by its two inline edges, and the edge FACING the destination takes the shorter clock — 320ms against 480 — so the highlight stretches toward the tab you picked and gathers itself as the far edge catches up. Both edges ride `calm`, the ~6.8% one-crossing spring: the character is one spring and the asymmetry is entirely in the two durations, which is the only shape that keeps damping sacred (§8). Two edges on one clock is a photograph being slid, which is the motion this replaced. `controlMotion.travel` (420, the switch thumb's channel crossing) is deliberately not reused — a highlight moving a whole segment's width answers a different question, and the new pair straddles the benchmark rather than replacing it.

**THE CHANNEL HAS WALLS (2026-08-25, Kushagra, from the glass preview against the bench).** The calm spring overshoots ~6.8% of travel, and on a flight into an END seat that overshoot has nowhere legal to go: measured, a full first-to-last jump on a 360px track put the grip's edge **14.11px outside the track** at t=170ms — identically in solid and on glass; only the visibility differed (a white grip over a white page against a grip poking out of a ringed pane over a photo backdrop), which is why it was reported as a glass defect. The bench's own lean rule already states the principle — *"a lean can never cross a boundary: it always points inward"* — and the flight now obeys the same wall. **The wall is GEOMETRY, not a second spring**: the two clocks and the calm character are untouched; the spring rides the two REGISTERED `<length>` custom properties the measurement already writes (an unregistered custom property transitions discretely, so the registration is what makes a spring expressible on one at all), and the painted inset is that value floored at the channel inset — `max()` at the point of use. An interior flight never reaches the floor, so every interior flight is byte-identical; a flight into an end seat has its leading edge arrive at the wall and hold while the trailing edge is still flying on its own clock, so the overshoot is spent as a **squash against the wall** instead of an escape through it — what a grip with momentum hitting the end of a real channel does, and iOS's own behaviour at the track ends. Rejected: `overflow: clip` on the track (pins the visible edge at the BOX rather than the channel — the grip would intrude into the inset frame — shaves the grip's cast, and is the bench's rejected side by name), and a non-overshooting curve on wall-bound flights (the component would have to know its destination is an end, and "one character, the asymmetry entirely in the durations" dies with a per-destination spring). The registration retires the old var() fallbacks ("an unmeasured thumb lands on the first seat") by making them unreachable — the `[hidden]`-until-measured gate is the one guard, stated as such. The wall law sweeps a seized flight and carries a calibration half: the RAW inset must still cross the wall mid-flight, so a build that quietly tamed the spring fails as loudly as one that let the grip escape. A track forced below its own min-content puts SEATS outside the channel (the flex line overflows and the skeleton centres it); the grip does not follow them out — that geometry is the caller's break, and the squeezed-fixture law was re-cut to bind the floors without forcing it.

**Direction is the one fact CSS cannot see** — a stylesheet knows the value a property animates TO and never the value it left — so it is stamped. Tabs gets it FREE: Base UI already publishes `data-activation-direction` on its indicator, including the `none` that is exactly the first paint, so the whole of Tabs' motion is CSS and the component gained no JavaScript at all. The segmented control has to write its own, which is the asymmetry that also settles the second edge below.

**The tab rule is drawn by two edges again, with the second one DERIVED.** The 2026-08-19 revert was right about the defect and the file said what a return would need first: `--active-tab-right` is `scrollWidth − left − width` in the list's SCROLL space while CSS resolves `right` against the containing block's PADDING box, so an overflowing bar drew a zero-width rule. `calc(100% - left - width)` derives the same edge from the pair Base UI computes in ONE space, against the `100%` that IS the containing block. Measured on a bar overflowing by 61px: the rule spans 91.69 against a 91.67 tab, where the old spelling drew 0. **The bar gained its WALLS 2026-08-25** (with the segmented channel's, same day, above): the spring rides the registered `--kui-tab-left/right` pair and the painted insets floor through `max()` — the first tab rests at the bar's very start, so every flight back to it used to carry the rule ~14px out of the box. **The floor is ADAPTIVE, `min(target, 0%)` per edge, and that is the half the segmented control did not need**: a static floor at the bar's edge re-commits the coordinate trap above as a clamp, because an overflow-region tab's resting `right` inset is legitimately negative — so the wall is the bar's edge while the destination sits inside the box and the destination's own seat when it sits past it, where a flight arrives with no overshoot at all. The derivation gets one home (`--kui-tab-*-target`, the instant copy) consumed by both the sprung pair and the wall, because one name cannot be both the spring and the target. A flight to the last tab of a bar the tabs do not fill deliberately keeps its overshoot past the last *label*: the rule is ink on a rail and the rail continues — the wall is the box, not the label. Tabs still gains no JavaScript.

#### §26 Tabs and the segmented control — "The segmented thumb costs a measurement", "The chosen segment gave up its fill", "The keyboard is not exempted" (as they stood at 39f3884)

Only the third of these three left the code. **The thumb element, its measurement and the chosen segment's pinned-transparent fill all survive** ([The exceptions](#the-exceptions-to-no-js-at-interaction-time) has the measurement that kept them); what DECISIONS §26 carries now is the same mechanism with the travel struck out and the exception's justification restated. The passages below are the `39f3884` wording, kept for the ordinal, the clocks and the keyboard argument, which are gone.

**The segmented thumb costs a measurement, and it is the FOURTH bounded exception to "no JS at interaction time"** — beside the flight's measurement, the lens and Tabs' own re-measure. Bounded the same way: it runs on a selection change and on a resize, never on hover, press, focus or scroll, and it writes two lengths rather than driving a frame loop. **Arithmetic over an index was the alternative and it is wrong, measured**: `flex: 1 1 0` gives every segment an equal share while the track sizes itself (425.3 / 425.3 / 425.3 for three labels of three lengths), but constrain the track and `min-width: auto` binds on the longest — 62.0 / 62.0 / 72.0 in a 200px box, where the arithmetic answers 65.3. A squeezed track is a toolbar on a narrow window. The selection is watched through `data-checked` rather than through a re-render, because an uncontrolled `RadioGroup` holds its value inside Base UI and never re-renders this component: the first spelling fired its effect once in a component's lifetime and the thumb held 56.9px while another segment was genuinely checked.

**The chosen segment gave up its fill.** Two boxes painting one grip would mean the old segment's fill blinking out as the thumb glided away from it, so the fill and the cast moved to the thumb and the segment keeps only its ink — which switches INSTANTLY while the box travels, §8's split rather than an oversight.

**The keyboard is not exempted, and that is a deliberate departure from the bench.** The bench jumps on arrow keys, on the rule that keys are not travel; its own reason is that gliding across intermediate stops would be false motion, and arrow keys here move exactly one position, so nothing is crossed that was not passed through. Exempting them would cost a modality listener at interaction time to buy a distinction the argument does not make at this step size. Reopen it if a keyboard jump of more than one ever exists.

#### §27 Shell — the resize drag's place in the list of bounded exceptions (as it stood at 39f3884); the flight measurement left the list, so the ordinals went with it

The passage as it stood:

> **A drag is the SIXTH bounded exception to "no JS at interaction time", and it is a different KIND from the five before it.** (It claimed the fifth for a day, which the panel seam already held — the doctrine had two fifths and no sixth until the audit counted them.) The flight's measurement, the lens, Tabs' indicator, the segmented thumb and the panel seam are all measure-once-at-a-seam

It now reads:

> **A drag is a bounded exception to "no JS at interaction time", and it is a different KIND from the ones before it.** The lens, Tabs' indicator, the segmented thumb and the panel seam are all measure-once-at-a-seam

The list lost the flight measurement and kept the segmented thumb; only the numbering went.

#### §27 Shell — "Stacking and motion inherit standing law" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> **Stacking and motion inherit standing law.**

Replaced there by:

> **Stacking inherits standing law.**

#### §27 Shell — "Stacking and motion inherit standing law" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> Motion was the recorded follow-up and SHIPPED 2026-09-06 — the paragraph below; the rest of this sentence is what it was written against and is kept because the two clocks and the reduced-motion hook are exactly what it took. Read as history from here: shell.css declares exactly one transition — the resize boundary's fade, bounded by value in the node law — and everything else in it still moves not at all (this paragraph stated the pane motion in the present tense for one commit, two paragraphs above the sentence saying it ships none — caught by three lenses of the 2026-08-16 audit, and the shortest doc-code drift in this file since the alert's padding). When it lands it takes the two clocks: geometry (the width) on the recovery spring, content legibility as paint, reduced motion standing down a hook (v1 blanket-killed transitions in one media block — the pre-2026-08-10 shape this system already replaced).

Replaced there by: nothing (the surrounding sentence closes over the gap).

#### §27 Shell — the drawer's entrance: "THE DRAWER ARRIVES BY SLIDING", "What only a Shell can add", "A new spring, `driven`", "Four things the build forced", "AND THE RECEDING FRAME TAKES A FILL", "THE SCRIM LEAVES WITH THE DRAWER", "AND THE RECEDED FRAME ROUNDS" (as it stood at 39f3884)

**THE DRAWER ARRIVES BY SLIDING AND THE FRAME RECEDES UNDER IT (2026-09-06, §8; Kushagra, against his own "Clip vs Physics" bench: "The bg should scale down").** A drawer is none of the three entrances this package already has, and saying which is what settled the recipe. It is not a menu — §22's silhouette is honest where a panel lifts off the thing that was pressed, and a drawer is anchored to the window's EDGE rather than to its trigger. It is not a dialog — §24 barely travels because the scrim IS the arrival and the box comes toward you. It slides in from the edge it was parked behind, which is also the cheapest reading in the library: **the distance is the pane's own width, a length CSS already has, so this is the one entrance here that measures nothing and needs no runner.**

**What only a Shell can add is the second half.** Every drawer library portals to the body, so the page is not theirs to move and the recession has to be asked of the app; the Shell owns the header, the rail, the content and the inspector already. The root scales to `--shell-drawer-scale` (0.925), a well appears behind it (`--scrim-well`, painted only while a drawer is live — at rest a near-black rectangle would show through every gap of the grounded posture), and the scrim covers both. **All four ride one clock** (`--motion-drawer`, 420ms), so the world's depth is a property of where the drawer IS rather than a second animation that happens to agree.

**A new spring, `driven`** — critically damped with velocity injected (ζ 1, ω 9, v₀ 1.5), straight off the reference's own rule that presentation is damping 1 and bounce belongs to motion a finger earned. It needed a second closed form in the generator, because the underdamped solution divides by √(1−ζ²) and is undefined at ζ=1. The launch is bounded by CONSTRUCTION rather than by judgment: at critical damping the curve overshoots iff v₀ > ω, so 1.5 against 9 cannot, and the law reads the emitted samples for it. No existing curve moved.

**Four things the build forced, each measured.** **(1) The origin is the drawer's own edge, not the frame's centre.** The frame must recede as ONE object or the header stays put while the content shrinks, so the transform goes on the root — which means the drawer, a descendant, recedes too and has to take the exact inverse. An inverse is only exact when parent and child scale about the same page point, which is what took the side drawers to `grid-row: 1 / -1`: a drawer COVERS, and the full block span is what puts its centre on the frame's. The visible consequence, stated rather than hidden: the gap opens on three sides and not on the drawer's own, which is the side the drawer is covering. **(2) A closed drawer is PARKED, not deleted** — `display: none` cannot be transitioned, so an overlaying pane waits one pane-width plus the gap outside the frame at `visibility: hidden`, which means the same three things (nothing painted, nothing focusable, nothing hit-testable) and can be transitioned. **(3) The frame CLIPS AT REST AND STOPS WHILE A DRAWER IS LIVE**, and the second half of that sentence is a same-day correction (Kushagra: *"the sidebar is also cut"*). Parking obliges the clip — a pane parked on the trailing or bottom edge is real scrollable overflow, measured at 690px on a 375px window. But `overflow` clips descendants in the element's OWN box, BEFORE the element's transform, and while a drawer is live the frame is scaled to 0.925 — so all three things that take its inverse are larger than the box doing the clipping. Measured on a 375×700 frame: the drawer painted 26.25→673.75 where its box is 8→692, cut 18px at the head and the foot; the scrim and the well both stopped at x=347, leaving the trailing 28px of the frame showing raw page under nothing at all — a bright band beside a dimmed app, which inverts the depth the recession is for. **The overflow was real in the frame's space and imaginary in the viewer's.** So the clip is a property of the RESTING frame: `transition-behavior: allow-discrete` on `overflow`, zero duration and the drawer's own clock as the DELAY, so it is gone on the first frame of an entry and returns only once the last drawer has finished leaving. Its price is that a sibling parked drawer would then scroll the page, so a pane that is neither open nor leaving goes back to `display: none` — which is what it was before parking existed; `position: fixed` was measured first and does nothing, because a transformed ancestor is a containing block for fixed descendants. `clip` and never `hidden`, on the flight rules' own argument. **The one thing it gets wrong, stated rather than hidden:** swapping straight from one drawer to another in a single frame gives the arriving one no starting box, so it appears rather than flies. **(4) The reference's 8px settle is DROPPED rather than ported** — it exists to sell a scale about the top edge, and every term added to the root has to be inverted on the drawer as well. One number, one inverse.

**AND THE RECEDING FRAME TAKES A FILL, which is flush's own sentence one level up** (Kushagra: *"Normal white page becomes black when sidebar comes"*). The well sits BEHIND the panes and is sized to the frame's whole box, so through a frame of FLUSH panes — which paint nothing, because a pane level with the page is not a plane (2026-08-21) — the well was simply what a person saw: the app replaced by a near-black slab the moment a drawer opened, with the recession invisible because nothing was left to recede. The frame leaves the page the instant it starts receding, so for exactly as long as it is away from it the frame is a plane and carries the seal; the well then shows only in the ring the recession opened, which is all it was ever for. **It is a second pseudo-element and not the root's own background, and the first spelling proved why**: the root declares `isolation: isolate`, so it is a stacking context, and inside one a `z-index: -1` child paints ABOVE its parent's background. The seal went on the root, measured correctly on the element, and the well went on painting straight over it — Kushagra, on that build: *"The entire page is black there is no ring"*. Two pseudo-elements at one negative layer settle it by ORDER, which is the one thing about them that cannot be got wrong: `::after` paints after `::before`, always. It takes no transform, so it rides the frame's own scale and lands exactly on the receded frame; nothing has to know how wide the ring is. **`--color-surface` and not `--color-page`**: the page is a colour the library has twice declined to own and an app may have painted anything back there, while the seal is a colour the library does own, is what every plane in the system rests on, and in light is the page to the byte. **Its law grabs the screen and reads a pixel**, and it is the only kind that could have caught either half: a computed value cannot see paint order, and both defects were about where a correct declaration painted rather than about what it said. It is the calibration lesson (2026-08-08) one step further — an instrument that reads a declaration is measuring the author's intent, not the reader's screen. Its own first spelling sampled the content pane's centre, which on a narrow window is UNDER the drawer, so it read the drawer's white and survived both sabotages: the degenerate-fixture rule, inside the law written to catch a defect that rule had already let through twice.

**THE SCRIM LEAVES WITH THE DRAWER, NOT BEFORE IT** (Kushagra: *"When I dismiss it, the bg loses its blur instantly making it look weird"*). It was `display: none` at rest and `display: block` while a drawer was live, and `display` cannot be transitioned — so the instant a drawer was dismissed the scrim's pigment AND its defocus vanished in one frame while the pane still had its whole travel left: the app snapping back to full contrast and full sharpness with something still sliding across it, which reads as two events rather than one. It is parked the way the drawer is parked and for the drawer's reason — `opacity` carries the fade, `visibility` takes it out of the tab order and out of hit-testing at both ends and flips at the far end of its own transition. Three shipped laws read the scrim's `display` and are re-keyed to `checkVisibility`, the same repair the parked drawer's own laws took.

**AND THE RECEDED FRAME ROUNDS**, because a plane set back from the page is an object and objects here have corners (Kushagra: *"when the bg scales down, it should have corner radius too"*). It rides the frame's own scale, so the painted corner is the stated one times the recession, which is what makes it read as the same object moving away rather than a second one arriving. It reads the BARE `--radius-surface-3` and not `var(--kui-sf-radius, …)`: that hook inherits, so a Shell composed inside a Card would take the card's corner — §27's own reason for pinning a pane's corner before the panes could stamp their size, and the frame has no `data-size` of its own to spend the way they did. **The squircle knob is the one thing it borrows**, and it borrows it in the shared layer rather than restating it: `.kui-shell::after` joins `.kui-surface` inside surfaces.css's `@supports (corner-shape: squircle)` block, because 1.613 is a judged number with one home and two different corner shapes touching — a squircle drawer against a plain-arc frame — read as two different systems. Its law is an agreement with a mounted Card at that step rather than a number, since the multiplier sits between the token and the painted corner.

#### §27 Shell — "THE SLIDE SHIPPED DEAD AND A PERSON FOUND IT, NOT THE SUITE" (as it stood at 39f3884)

**THE SLIDE SHIPPED DEAD AND A PERSON FOUND IT, NOT THE SUITE (2026-09-06, Kushagra: "there's no slide in and out").** The travel was published as one hook holding both axes — `calc(-100% - gap) 0` — and `translate()` separates its arguments with a COMMA. The substitution was unparseable, which is invalid at computed-value time, which drops the WHOLE declaration rather than the one argument: **every parked drawer computed `transform: none`, sat at its landed position behind `visibility: hidden`, and appeared.** The open state was correct throughout, because there the hook is unset and the `0` fallback parses. It is one hook per axis now, each a single length, with the comma belonging to the sheet. **The reason 2,634 laws were green over it is the fixture and not the assertion**: every drawer law in this file reads a LANDED pane — its dress, its cap, its span, its scrim — so the parked pose was the one state nothing looked at. Three more read the LIVE drawer in the VIEWER's space, by hit-testing, and that is the half no existing law could have had: `getBoundingClientRect` reports the transformed border box and says nothing about clipping, so the drawer's rect was right the whole time it was being trimmed. Three laws read the parked pose, and the one that reads the flight SEIZES its moment (both transitions paused, both clocks set to the same instant) rather than sampling a rAF, because its first spelling passed alone three times and failed inside the full parallel suite: the 2026-08-20 rule that a premise which is a window is seized or edge-anchored, never raced.

#### §27 Shell — "A SIDE PANE PUSHES THE FRAME" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> What the 2026-09-06 entrance got right is the clock and the spring; what it got wrong is that it treated four panes as one gesture.

Replaced there by:

> What the 2026-09-06 entrance got wrong is that it treated four panes as one gesture.

#### §27 Shell — "A SIDE PANE PUSHES THE FRAME", its second measured thing (as it stood at 39f3884); the third was renumbered (2)

Removed (the passage around it stays in DECISIONS):

> **(2) A pane parks exactly one push away**, because the drawer's own travel and the frame's are two clocks on one curve and the two distances must be equal or daylight opens between them mid-flight — measured 2px at 120ms with the landed state correct, which is the shape no landed-state law can see.

Replaced there by: nothing (the surrounding sentence closes over the gap).

#### §27 Shell — "A SIDE PANE PUSHES THE FRAME", the recession (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> **What the recession kept** was the bottom sheet, whole: the scale, the well, the frame's plane and its corner, and the flush stand-down's one exception (a sheet covers, so it paints). *(Dead since 2026-09-11: the bottom pane PUSHES the frame's children up, so the scale, the well and the plane are inert machinery pinned at their no-op values and awaiting deletion; what survives is the flush pane's exception, because a pane that covers still paints.)*

Replaced there by:

> **What survives of the recession** is the flush stand-down's one exception: a pane that covers still paints.

#### §27 Shell — "A SIDE PANE PUSHES THE FRAME", the spring (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> **The spring is new and the old one was the defect** (Kushagra: *"The opening animation is extremely bad, it just jumps to a middle state, and theres no animation on scrim, or dimming"*): `driven` injects launch velocity and puts 76% of the travel inside the first 120ms, which reads as a snap plus a creep once the travel is a screen's width rather than a 7% recession. `carried` is the same critical damping with no launch, on a 500ms clock — UIKit's own presentation spring, and zero-bounce by construction. Paint still eases and geometry still springs (§8), so the dim rides `--motion-easing` on the same duration.

Replaced there by: nothing (the surrounding sentence closes over the gap).

#### §27 Shell — "THE RAIL MEETS A NARROW WINDOW AS A TAB BAR", the grip's travel (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> **The chosen tab is a travelling grip, and it is the segmented control's mechanism self-keyed as its second member** (§26): measured insets, the edge facing the destination on the shorter clock, the calm spring, and the bar's padding as the wall an overshoot squashes against. **Its width is ONE width, read from the widest label in the bar rather than the current one**, so it does not resize as it flies; being out of flow

Replaced there by:

> **The chosen tab wears a grip, and its width is ONE width, read from the widest label in the bar rather than the current one**: being out of flow

#### §27 Shell — "Shipped 2026-08-16, same day as the spec" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> MOTION IS THE RECORDED FOLLOW-UP on Menu's own precedent (shipped instant, moved next day): shell.css declares zero transitions, a node law asserts that absence, and the spring entry above is the next session's work.

Replaced there by: nothing (the surrounding sentence closes over the gap).

#### §30 Composer — "The ring does not, and the composer states it itself" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> it carries the pointer cursor, the 1px rise toward the pointer and the press sink along with the ring.

Replaced there by:

> it carries the pointer cursor and the hover and press fills along with the ring.

#### §30 Composer — Glass (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> The lens applies. A composer does not fly, so it is built on mount and resize like any other pane.

Replaced there by:

> The lens applies, built on mount and resize like any other pane.

#### §31 Popover — "A popover is a CARD that floats" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> (it covers the app, so it casts, it expresses the material, it flies out of its trigger)

Replaced there by:

> (it covers the app, so it casts and it expresses the material)

#### §31 Popover — "What the popover keeps from the floating half is its COVERAGE" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> (unlike Dialog it has no scrim to state coverage for it), the material by construction, and the family's entry. In a FLAT world

Replaced there by:

> (unlike Dialog it has no scrim to state coverage for it) and the material by construction. Its entry was removed with motion on 2026-09-20 (§8); `docs/archive/motion-v1.md` records it. In a FLAT world

#### §31 Popover — "The entry is DIALOG's since 2026-09-14" (under "What it refuses", as it stood at 39f3884)

**The entry is DIALOG's since 2026-09-14 (Kushagra: *"Popover should animate like dialog, because it can be huge and that animation doesnt work for that big a container"*), and the circle below is SUPERSEDED.** A circle growing into a panel half the window tall is the room moving, the exact reading §24 retired at modal mass. The pane is its landed box from the first frame: 3% in z on the poised spring, presence as paint, the content coming into focus with the plane — `--dialog-depth`, `--dialog-settle`, `--dialog-reveal` and `--print-blur`, borrowed rather than restated. It is carried by the tooltip's mechanism (§32): the runner still flies, the pose zeroes every size, travel and corner channel, and the family's centred pin is stood down because a transform composes inside `scale`. **The body stays in flow**: the family lifts it out (absolute, pinned, sunk) so its words cannot re-break while the box grows, and a box that never grows owes none of that — on a panel taller than its room the pin moved the content by most of the panel for the whole entry. The exit is the family's dissolve with a 1% settle. Two laws, falsified against the circle: only scale and paint run, on the dialog's clocks and spring, with a Menu's height flight as the negative control; and the seed is the landed box at the depth with the body static and running only its focus. Three family laws that had used a popover as the member that grows moved to a Menu.

#### §31 Popover — "The seed is a CIRCLE on the trigger's centre, faint" (under "What it refuses", as it stood at 39f3884)

**The seed is a CIRCLE on the trigger's centre, faint (2026-08-31, Kushagra: the entry should *"feel like alert dialog's"*).** §22's silhouette is the right first frame where the panel IS the thing pressed, lifting — a menu is its button's list. A popover's content is the caller's and shares no shape with its trigger, so the trigger's pill swelling into a form read as the button inflating. It takes the alert's seed, paint and CLOCKS — the family's designed circle at `50%` so it stays curvy as it opens, arriving at opacity 0, on the overlay's fall, spread, becoming, reveal and reveal delay re-pointed token for token on the popup — and keeps the floating family's origin: the circle sits on the trigger's centre, which is what still says where the panel came from. Self-keyed in popover.css over the family's pose; the runner is untouched, and two registered hooks (`--kui-seed-dx/dy`) tell the family's seed translate how far inside the measured trigger box the circle sits. The seed does not touch `corner-shape`: the glint's mask reads it on the premise that it never changes in flight. Rejected: the alert's recipe verbatim (rises from below its own footprint and forgets the anchor), a fade on the silhouette alone, and the seed without the clocks (judged: the box was landed before the circle could be seen). Tooltip takes neither grammar: its entry is a LIFT at its own size (§32). LOG carries the three shapes as put to him.

#### §31 Popover — "An arrow." (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> What says where the panel came from is that it is anchored to the trigger and flies out of its silhouette; the system's answer to that question is motion, not a beak.

Replaced there by:

> What says where the panel came from is that it is anchored to the trigger.

#### §31 Popover — "The CONTENT scrolls, the panel never does" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> , and it is why a caller-composed scroller inside a popover is a special case (its scroll position is deliberately not reset by the entry's revocation, which reaches only the direct-child chain).

Replaced there by: nothing (the surrounding sentence closes over the gap).

#### §32 Tooltip — "The entry is a lift, not a silhouette (2026-08-31)" (the subsection, whole; as it stood at 39f3884)

##### The entry is a lift, not a silhouette (2026-08-31)

**Kushagra: the family's unfurl is "way too much, especially when it's on a larger surface, it looks very weird for a tooltip" — and the "Physics" tooltip of the Clip-vs-Physics bench is the reference.** Measured on a 420px card trigger before the change, the chip's first frame was the card's full box collapsing ~370px of width on the spread clock into a 60px chip; on a button it swelled a button into a strip and back. §22's silhouette is honest where the panel IS the thing pressed; a tooltip is a label, and a label is not the thing it names.

**The bench's answer, built out of the family's own channels with nothing new in the runner.** The chip arrives at its own size and shape, already at its resting place, scaled to `--tooltip-seed` (0.9) about the trigger-facing edge — the origin the family's table already answers for every (side, align, dir) cell — and faint; it grows to full size on the family's spring while it paints. Four things are stated in `tooltip.css`, each a re-aim of an existing channel: the pose reads the LANDED box (`--kui-fly-w/h/r`) instead of the trigger's photograph; `translate: 0 0` (the box is already home); the body's molten print is stood down whole (no blur, no fade, no echo, no squish — the chip and its words are one object, since the shape is known from frame one); and the chip states its OWN transition list — three channels, not the family's seven: scale on `--tooltip-form` (300) and the CALM spring, opacity on `--tooltip-paint` (120), the cast on the family's reveal — so the runner's release, which waits for the longest declared clock, lands with the chip instead of holding the pose 200ms past it. **The curve is the second pass** (Kushagra on the first: *"Doesnt seem the same physics tho"*): frozen beside the bench's tooltip at the same times, opacity was identical and scale was not — the family's channel rides the elastic spring (ζ0.715, ω10.8), at 0.995 by 90ms and landed at 120 with no tail, where the bench's `--spring` is this package's `--motion-spring` (calm, ζ0.65, ω7.7; the samples are byte-identical) and is still at 0.983 at 90, crossing 1 near 130 and easing back through 1.004. Same clock, a faster spring — ours popped where the bench settles. An easing is a token NAME inside the family's list and cannot be re-pointed without renaming a system curve on the element, which is why the tooltip owns its list; after the change the two match within 0.001 at every frame. And the exit returns to the SEED (0.9) rather than the family's 2% settle — the bench's distance, on the family's settle clock and its stiff spring rather than the bench's `ease-in` (an exit that ends at maximum velocity slams; at 120ms over a tenth of scale the distance is what the eye reads). A scale rather than a length because scale is relative: 3px on a 28px chip and the same proportion on the widest label the cap allows. Warm groups are untouched: `data-instant="delay"` still zeroes every clock, which is the bench's warm half. Stood down under reduced motion at its own weight — the family's guard names `.kui-surface.kui-floating` and this list outranks it.

**Two things the mechanism forced.** The family's centred pin (`inset-inline-start: 50%` + `transform: translateX(-50%)`) composes INSIDE the individual `scale`, so on a scaled box the half-width pull is scaled with it — measured, the chip's centre 4.4px off at the seed and sliding home; a full-size box in a positioner sized to it needs no pin, so every inset is `0` and the transform `none` for the flight. And the runner's laid-out guard reads the posed rect against the natural one — a pose the same size as its box would read as "not laid out yet" and bail — which the scaled pose passes because a rect includes its transform; the law asserts the flight departs. The tooltip's rules carry `[aria-hidden]` plus the placement stamps for RANK over the family's `[dir="rtl"]` centred arms, `aria-hidden` being the tooltip's own permanent stamp.

**Not built: the bench's warm SLIDE** — one tooltip travelling and resizing between adjacent triggers. Base UI mounts one popup per tooltip, so a slide is a measured cross-element flight and a runner mechanism of its own; a warm tooltip appears instantly today, which is what every platform does. Recorded open.

**Five mounted laws, six sabotage passes each caught by exactly its law** (the pose deleted, the list's spring swapped for the elastic, the exit rule deleted, the body stand-down deleted, the pin stand-down deleted, the clocks borrowed back); the curve law compares the running transition's `linear()` SAMPLES with the token's, because the browser re-serializes the string; the seed is read at station 0 of the SEIZED scale clock rather than raced for, and the fixture is a trigger far wider than the chip, because on a button-sized trigger the silhouette and the landed chip are nearly one box (the degenerate-fixture rule, and the exact case the complaint names). Two floating-family laws that had been written on a tooltip fixture moved to a popover, since the tooltip's box no longer passes through any width or height. +68 bytes gzipped.

#### §33 Tree — "What building settled that the spec had left open" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> - **No motion yet**, Menu's own precedent: the chevron's turn and the reveal's entrance are the recorded follow-up, and `rotate` is used so the motion pass can spring the channel without restating the pose.

Replaced there by:

> - **No motion** (§8): the chevron turns and the children appear at once.

#### §34 Toggle — "It is a Button, and it wears the class" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> the size join, the press travel, the ring, the material,

Replaced there by:

> the size join, the ring, the material,

#### §34 Toggle — "Refused, on record." (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> ; a pressed toggle HOLDING the press travel (proposed on Button's latched-trigger rule, refuted: that rule exists to still a panel hanging from the trigger, and a toggle hangs nothing — a pressed Bold sitting 1px lower than Italic beside it would read as a misprint).

Replaced there by: nothing (the surrounding sentence closes over the gap).

#### §35 Avatar — "Refused, on record." (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> the press machine — ring, travel, disabled remap, the required name — exists once, in Button

Replaced there by:

> the press machine — ring, disabled remap, the required name — exists once, in Button

#### §37 Accordion — "The trigger is a HEADING that wears the control skeleton" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> an underline resting in no colour that takes the ink under the pointer, eased on the paint clock — and the weight

Replaced there by:

> an underline resting in no colour that takes the ink under the pointer — and the weight

#### §37 Accordion — "The trigger is a HEADING that wears the control skeleton" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> turning 90° when the panel opens, on the mark clock, with the tree's own RTL sign flip.

Replaced there by:

> turning 90° when the panel opens, with the tree's own RTL sign flip.

#### §37 Accordion — "The panel travels by height on the spring" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> **The panel travels by height on the spring (§8).** Base UI publishes `--accordion-panel-height`; the panel is that tall open, zero at `data-starting-style`/`data-ending-style`, and `block-size` rides `--motion-travel` on `--motion-spring` — geometry moves on a spring, everywhere. `overflow: clip`, never `hidden` (a hidden box is a scroll container, the select flight's own hazard). The panel's words start UNDER THE LABEL:

Replaced there by:

> **The panel opens and closes at once (§8; `docs/archive/motion-v1.md` records the height travel it had).** The panel's words start UNDER THE LABEL:

#### §37 Accordion — "Seven repairs from the ultracode audit" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> The underline's `transition` was copied verbatim from `link.css`, where the element is not a control — a shorthand, so it REPLACED the skeleton's five channels with one, and the heading's ink stopped easing on any state change; the list is restated in full and a law derives it from a mounted Button's.

Replaced there by:

> (The underline's `transition` repair left with motion; `docs/archive/motion-v1.md` records it.)

#### §39 Breadcrumb — "The underline is a carve-out, not a drift" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> its metrics never move, and §8's paint clock has a colour to carry, where a `text-decoration-line` appearing would arrive in one frame.

Replaced there by:

> its metrics never move.

#### §41 The Button done state — "THE MOTION IS A SWAP, NOT A DRAW", "Kushagra asked for exactly that", "Clocks are §8's existing two", "Both glyphs are mounted always", "THE WIDTH TRAVELS" (as it stood at 39f3884)

**THE MOTION IS A SWAP, NOT A DRAW, and the distinction from the mark family is real.** §8 answers "a tick appears" already: a checkbox's tick draws along its own stroke, `pathLength={1}` so CSS never measures it, IN and never OUT. That is a state you SET and it persists. A done state is a momentary report that reverts, and there are two glyphs rather than one appearing on an empty box — drawing in and out on a two-second round trip reads fussy. So the tick arrives the way a small object arrives: it scales up out of a seed under a blur and paints in, and the button's own glyph leaves the same way.

Kushagra asked for exactly that (*"a small scale down + blur + appear, like we have done motion in other tools"*), and the first counter-proposal — the floating family's own entry recipe — was refused before it was built: that recipe is licensed by MASS (§24 lets a dialog blur because depth of field is a property of a large box, and blur is the only thing the system may honestly animate on content it does not own), and a 16px glyph at a ~1.17px painted stroke has none. `doneBlur` is small on purpose and is the dial most likely to go to zero, with the bench left in — the rim-saturate precedent.

**Clocks are §8's existing two, and no new one is minted**: the fade is paint (short, eased, no spring), the scale is geometry (a spring). In on the tick's own `--motion-mark` and the calm spring, out on `--motion-press` and `stiff` — which is the system's exit spring by name, because an exit that bounces is an object that did not mean to leave. The asymmetry is entirely in the durations, §8's own shape for a pair sharing one character.

**Both glyphs are mounted always, and that is the mechanism.** React would unmount the outgoing one the instant `done` flips, and an unmounted element cannot leave — the exit would simply not exist. Stacked in one grid cell they cannot reflow around each other either. So passing the prop AT ALL, even `false`, is what mounts the tick; a button that never asks renders exactly as it always has, law-asserted as the absence of the anatomy.

**THE WIDTH TRAVELS** (Kushagra's call, put as a choice: travel it or reserve the wider word). `Copy` → `Copied` is a real geometry change, so it rides the geometry clock. `interpolate-size: allow-keywords` is what makes an intrinsic width interpolable at all, and where an engine lacks it the width snaps — which is what it does today, so the feature is additive and its fallback is the current behaviour. The channel lives in the shared control layer as a HOOK (`--kui-ct-width`, `0s`) so the transition list keeps one home and nothing else in the system starts animating: the first spelling put a live `inline-size` in that list and would have animated the width of every field, select trigger and segmented track, which two of the skeleton's own clock laws caught.

#### §41 The Button done state — "Two defects in the first implementation" (as it stood at 39f3884); both were in the swap's two-glyph anatomy, which left with motion along with the `[data-glyph]` arm

Two defects in the first implementation, both found by laws rather than by reading: an icon-only button grew TWO swaps (the leading arm did not exclude `iconOnly`, so a button with no leading slot wrapped `undefined`), and **the caller's own glyph fell out of the shared icon-box rule** — that rule matches an svg one or two levels down, the swap adds a third, and an `<svg>` with no intrinsic size is 300x150 by CSS's replaced-element default. The fix is the shared layer's, not the component's: `[data-glyph]` is a third arm on the icon rule, a structural attribute like `[data-slot]` and never a component's class. `recipes.test.ts` refused the component-local spelling, which is the law that has kept that ladder in one place through four components.

#### §42 ContextMenu — "Not a second family, and the export count is the argument" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> the same glyphs, the same portal contract, the same flight machinery.

Replaced there by:

> the same glyphs, the same portal contract.

#### §42 ContextMenu — "Placement is the system's" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> It deliberately does NOT pass `useRestingAnchor()`: that virtual anchor reports a trigger's resting box, and handing it over would replace the point with the region.

Replaced there by: nothing (the surrounding sentence closes over the gap).

#### §42 ContextMenu — "IT FLIES FROM THE POINT", "So the seed is a SIZE, and it is zero", "That deleted everything the first design invented", "The cursor-tracking spelling was refused", "Two instrument findings", "The laws that mattered did not exist at first", "A reduced-motion law was written for the invented pose" (as it stood at 39f3884); the class-list fact from "That deleted everything" stays in DECISIONS

**IT FLIES FROM THE POINT — the family's entry, unchanged, with the right box.** The first spelling got this wrong and Kushagra caught it by eye (*"something is wrong with animation, and I dont get it, we literally had to copy paste menu"*). I had given the panel a pose of its own — the landed box breathing from 0.92 — on the argument that a region has no silhouette worth flying out of. Half right: the region IS the wrong box, and the answer is to give the flight the right one, not to take the flight away. Measured, the pose read as a twitch — 8% of a panel over 345ms, with no unfurl and no body squish, where a menu grows out of a small box.

**So the seed is a SIZE, and it is zero.** `seedSize` on the direction context is the one thing this component supplies: `anchor` stays "which node is this component's in-flow one" and this is "what does the panel come out of". A size and not a rect, which is the whole of why it needs no event handler — Base UI's positioner has already put the panel's corner on the point, so the silhouette's POSITION is the panel's own corner and there is nothing to measure. The x and y offsets are zero, which is `beside`'s own sentence (§22, 2026-08-17) on both axes rather than one, and direction-blind for the same reason.

**That deleted everything the first design invented**: `CONTEXT_PLAN`, `ContextFloatingBody`, the `kui-menu-point` mark, the self-keyed pose in `menu.css`, `contextEntry` and `--context-seed`. A context menu's panel is now spelled exactly as a submenu's — the family's classes, no mark of its own, no recipe of its own — which is what "copy paste menu" means when it is true, and a law asserts the class list to keep the invented pose from coming back. `kui-floating-anchored` (named `kui-menu-anchored` until the 2026-09-12 promotion, §22) stays off for the reason it is off on a submenu: the width floor means "never narrower than the trigger you pressed", and a point has no width. **Net −84 bytes against the version before it**, which is the evidence the second answer was the simpler one.

**The cursor-tracking spelling was refused by a shipped law, and the law was right.** The first repair recorded the point through `onContextMenu` and `onPointerDown` handlers on the region, and `recipes.test.ts` reported an interaction-time handler — a listener on every press over a canvas, to learn a coordinate the layout already knew. Being refused is what produced the simpler mechanism.

**Two instrument findings, each of which produced `none` on a correct package.** `settle()` lands a panel by writing `transition: none !important` inline, and `[data-unfurling][data-seed]` declares `transition: none` deliberately, because the seed frame must not animate into itself. A motion law here has to decline to settle and wait for the flight to land under its own power. **The third was WRONG and the audit 2026-09-02 corrected it in all three homes:** the laws opened with `detail: 1` under a comment saying a synthetic right-click without it "opens a panel that never animates". `data-instant="click"` has not zeroed a clock since 2026-08-19 — `FLIES_ANYWAY` exempts it in the runner and surfaces.css excludes it in the stylesheet, held in agreement by a law — and a REAL right-click's `contextmenu` carries `detail: 0` (measured: the mousedown is 1, the contextmenu is 0). So the fixture produced a state no person can produce and removed the shipped one from every law in the file. The `detail` is gone.

**The laws that mattered did not exist at first, and their absence was demonstrated.** Under the first design, swapping the panel back onto the family's anchored plan left all thirteen laws green — the seed law read the STYLESHEET (true either way) and the clocks law read a LANDED panel (also true either way), so neither could see which box the entry was posed from, which is the entire decision. They now read what the runner WROTE: `--kui-seed-w/h/r` and `--kui-from-x/y` are all `0px` for a summoned panel and the trigger's real box and offset for an opened one, with a mounted Menu beside them as the vacuity guard. The clocks are asserted as an AGREEMENT with that Menu rather than as a list of their own, which is what "the family's entry, unchanged" means as a claim. Deterministic, where a first-frame measurement would be a race.

**A reduced-motion law was written for the invented pose and went with it.** It is worth recording because it could not fail and took three spellings to learn why: a mounted reading cannot isolate a component's own stand-down, since the harness's stillness sheet zeroes every transition and under `asksForStillness` the panel never gets a flight — so it read `none` on a correct package AND on one with no guard at all. The two source-reading spellings that followed passed against a deleted guard too, one by walking the CSSOM and finding nothing, the other by splitting the stylesheet on `@media` and swallowing the rules that follow the block. With no recipe of its own, the panel takes the family's guard and needs no law here at all.

#### §42 ContextMenu — "Audited 2026-09-02" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> and the four that reach a person are fixed.** Three of them are ONE mistake three times, and it is this repo's most-recorded shape: **a mechanism written correctly for the case its author had in mind, applied to a case they did not.**

Replaced there by:

> and the four that reach a person were fixed.** Three of the four were in the entry and left with motion on 2026-09-20 (`docs/archive/motion-v1.md` records them) — ONE mistake three times, and this repo's most-recorded shape: **a mechanism written correctly for the case its author had in mind, applied to a case they did not.**

#### §42 ContextMenu — the audit's three entry findings: "`seedSize` leaked into every submenu", "\"The corner is on the point\" is true only of an UNSHIFTED panel", "\"Already placed\" is true only of a reopen on the SAME anchor" (as it stood at 39f3884)

**`seedSize` leaked into every submenu.** It means "THIS panel was summoned out of a point", and it is read by every descendant flight — while `MenuSub` builds its context by spreading the parent's (`{ ...parentDir, anchor }`). So a submenu of a context menu wrote `--kui-seed-h: 0px` and `--kui-seed-r: 0px` where the identical markup under a plain Menu writes its trigger ROW's own 15px box and corner, and `--kui-seed-dy` then translated that flat sliver half a seed ABOVE the row it was supposed to come out of — §22's "a side-opening panel keeps the row's height and corner" silently deleted whenever the outer menu was a context menu. `MenuSub` states the field back to its unset meaning; a submenu is never summoned, because it always has a trigger row.

**"The corner is on the point" is true only of an UNSHIFTED panel.** A context menu's positioner runs `shift({ crossAxis })` with `flip.mainAxis` disabled, so a panel that would overflow the bottom slides UP while `data-side` stays `bottom` and nothing in the placement attributes says it moved. Measured in the builder: a click 408px down an 800px window put the panel's top at 301 — 107px above the pointer — with the seed painted at the panel's own corner, so the panel grew out of a point a third of its own height from the cursor. The offsets are no longer literals: Base UI's own `transformOrigin` middleware already detects that state and publishes the anchor point's y in `--transform-origin`, so the runner READS it. That is the honest fix rather than the tempting one — tracking the cursor is exactly the spelling the "no JS at interaction time" law refused when this component was built, and the number is already in the DOM.

**"Already placed" is true only of a reopen on the SAME anchor.** The 2026-08-20 caught-reopen branch continues a panel from where it is rather than replaying its entry, and every member it was written for — menu, select, popover — reopens on its trigger. A summoned panel is the family's first member whose second gesture carries a NEW place, so the catch produced exactly what that reversal was made to stop: measured with a real right-click, the same popup element moved 289px inline and 155px block between two frames, at full opacity, with no seed and no unfurl. A summoned panel has no taken-back gesture to protect — the only way to reopen one is to summon it again — so it always flies.

#### §42 ContextMenu — "And the fourth: the platform's menu drew over our own." (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> The panel prevents it, scoped by a context rather than by `seedSize` — the two are different claims, which is precisely why a submenu must inherit one and not the other.

Replaced there by:

> The panel prevents it, scoped by a context a submenu inherits.

#### §42 ContextMenu — "Five of the fourteen laws could not fail" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> And every fixture opened at one point in a window where no shift can occur, which is why the seed law asserted `--kui-from-x/y === "0px"` as the guarantee — **a law that would have failed on the correct value** in every cell where the panel has to move.

Replaced there by: nothing (the surrounding sentence closes over the gap).

#### §44 Command — "IT IS TWO BLOCKS SINCE 2026-09-05" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> is the scrim, the focus trap, the scroll lock and the entry; every fact

Replaced there by:

> is the scrim, the focus trap and the scroll lock; every fact

#### §44 Command — "IT IS TWO BLOCKS SINCE 2026-09-05" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> wraps its children in that wrapper (§24 mints it to hold the entry's blur), so a flex column

Replaced there by:

> wraps its children in that wrapper (§24), so a flex column

#### §44 Command — "The search bar is a PANE" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> the scrim, the flight and the caret are the announcement.

Replaced there by:

> the scrim and the caret are the announcement.

#### §44 Command — "It is a Dialog, and that is the whole architecture." (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> the scrim, the focus trap, the scroll lock, the portal re-theming (§20), the entry motion, the
> stacking frame

Replaced there by:

> the scrim, the focus trap, the scroll lock, the portal re-theming (§20), the
> stacking frame

#### §44 Command — "AND NOTHING RINGS ON THE WAY OUT" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> **AND NOTHING RINGS ON THE WAY OUT (same day, Kushagra: "Ring still appears briefly on return key press, is that correct?").** It is not, and it is a second thing rather than the same one: Base UI commits the highlighted row by clicking its element, a click on an anchor focuses it, a keyboard activation makes it `:focus-visible` — so the row drew a solid ring for every frame of the dissolve, measured across the exit. The ring is right and the MOMENT is wrong: §8's ring says *keyboard focus is here*, and on a panel that is leaving, where focus sits is bookkeeping rather than a state anybody needs told. Scoped to the ending stamp, so a row that really is focused in a standing palette still rings and the pane still pads for the reach. **It is deliberately not keyed on `:focus-visible`**, which the first spelling was and a shipped law refused — a rule naming that pseudo-class must ring with the designed tokens, so `outline: none` inside one is a focus rule that rings with something else, which is how the BAR's own refusal was pushed onto its resting rule. What is true here is not "not while focused" but that nothing in a leaving palette draws an outline, which is a claim about the exit and belongs on a rule about the exit. Read on a SEIZED exit (`catchDissolve`) rather than sampled, so it is an edge and stays on CI, and both halves are asserted — focus really is on the row, and the row draws no ring while that is true.

Replaced there by: nothing (the surrounding sentence closes over the gap).

#### §44 Command — "THE RESULTS PANE OPENS OUT OF THE SEARCH BAR", "No runner and no measurement", "And it TELLS THE LENS where it is going", "And NOTHING ABOVE A PANE MAY CARRY A FILTER" (as it stood at 39f3884); the backdrop-root constraint stays in DECISIONS as one sentence

**THE RESULTS PANE OPENS OUT OF THE SEARCH BAR (§8, §22 — 2026-09-05, Kushagra: "Can it also open
like a menu? Or a popover, as far as motion goes, with the search bar being the trigger?").** The
column keeps §24's entry whole — the palette is summoned, the scrim pushing the app back is the
arrival — and what that recipe has nothing to say about is the relationship between the two blocks
inside it. That relationship is a menu's: the pane sits directly under the bar, at the bar's own
width, held at its top edge. §22's silhouette is honest exactly where a panel lands ON the thing it
came out of, which is true here in the way it was not for Popover, whose seed became a circle
because the panel shared no shape with its trigger. The pane already IS the bar's width, so there is
no spread to fly and the whole flight is the FALL — the axis the family already says the eye reads
as the direction of travel.

**No runner and no measurement**, which is Tooltip's 2026-08-31 precedent: the family's runner
exists to photograph a trigger whose box is only known at runtime, and here the seed is the bar's
bottom edge, which is where this pane's top edge already is. The flight is a state change on Base
UI's own stamps, over the family's clocks (`--floating-fall` for the height and the travel,
`--floating-paint` for the fade), law-read as the agreement with those tokens rather than against
literals. **`interpolate-size` is what makes the height expressible** — §41's reach for the Button's
travelling label — and where an engine lacks it the height snaps and everything else still runs.
Two spellings were built and measured before it: `grid-template-rows: 0fr → 1fr` unfurls but cannot
carry the list-to-message change (the value does not move when the content does), and it lost to
the system's own (0,3,0) rule making a pane holding a scroller a flex column. **The dialog body
stopped being a flex column for the same measurement**: `interpolate-size` does not reach a FLEX
ITEM — in isolation a block child interpolates 0 → auto (69.3px at 35% of its clock) and a flex item
snaps straight to 200 — so the interval between the blocks is the pane's own top margin now, which
is the same distance and leaves the pane an ordinary block whose height can move.

**And it TELLS THE LENS where it is going (§10 — Kushagra: "the big issue is that after animation
completes, the bg changes and gets thicker in a jump").** That jump is the refraction arriving late,
and it is the 2026-08-22 audit's finding reached from the other side: `refraction.tsx` mints a pane's
displacement map on mount and on resize, and a flight resizes a pane on every frame. Measured on
this pane before the repair — no lens at all for the first ~130ms, then four maps in a row
(`#kui-lens-10`, `-12`, `-14`, `-16`), each generated for the previous frame's box. What a person
sees is glass that is only blur to begin with and gains its bend part-way down. The family's answer
is to publish the box the flight is HEADING TO (`--kui-fly-w/-h/-r`) and mark the flight
(`data-unfurling`), so the map is built once, up front, for the box it will actually bend — and this
pane speaks that vocabulary even though it has no positioner. `useStatedFlight` lives in
`system/floating.tsx` beside the runner's own measurement, because the flight measurement has ONE
home and ENGINEERING §1.5's exception is written for that file; the attribute reaches no CSS, since
every `[data-unfurling]` rule in the surface layer is keyed on `.kui-floating`, `.kui-overlay` or
`.kui-alert-popup`. Three things in it are measurements rather than caution, each of which shipped
wrong first: the seed is LIFTED to read the landed box (React runs a child's layout effects before
its parent's, so a suite that mounts in one pass sees the full height and a real open sees the 8px
seed — 98 and 8 from the same line); the CLOCKS are stood down for that read (lifting the height
starts a transition on the channel the landing watches and restoring it cancels one, so
`transitioncancel` landed the flight before it began and the mark never survived a frame); and the
LAYOUT box is published rather than the painted one (a dialog's entry steps the popup 3% back in z,
so the first spelling published 303.61px for a pane landing at 313 — the 2026-08-22 width-floor
defect one component over). The mark comes off on the height's own `transitionend`, with the fall's
length plus slack as a guard, because a mark left on makes the lens believe the pane is forever in
flight and it must measure again the moment the pane holds the message instead of the list.

**And NOTHING ABOVE A PANE MAY CARRY A FILTER, which is the other half of the same report and the
half that was actually visible.** §24 blurs `.kui-dialog-body` on the way in so the print comes into
focus with the plane — a channel chosen because it presumes nothing about content the system does
not own. It presumes one thing after all: that the content is not GLASS. A `filter` makes an element
a BACKDROP ROOT, so every `backdrop-filter` beneath it stops sampling the page and samples the root,
which is nothing. Measured frame by frame: for the whole entry both panes drew their blur, saturation
and lens on an empty backdrop, and the instant the body's filter reached `none` the real page
appeared behind them — the glass switching ON at the end of the arrival, which is exactly what "gets
thicker in a jump" describes. Until 2026-09-05 the palette had ONE pane and it WAS the popup, so the
body's filter sat inside the glass rather than over it and the conflict could not arise; the
two-block shape puts the panes under the body, so the recipe stands down here. Nothing is lost that
this component had a use for: a dialog blurs its body because its arrival is pure depth and it owns
no content, and this palette's blocks arrive on their own clocks. The law walks from a pane up to the
popup rather than naming one selector, because the rule is about the chain and not about the element
that happened to break it.

#### §44 Command — "The list becomes the message out of a BLUR" (as it stood at 39f3884)

**The list becomes the message out of a BLUR (§41 — Kushagra: "add motion to how the list goes from
wherever it is to empty state, preferably blur fade in and out that we use").** The arriving content
fades in out of `--done-blur` on the mark clock and the leaving one fades into it — the Button done
state's swap, deliberately not the floating family's print, which is licensed by MASS and there is
none here. **It is keyed on the pane's own state, not on `@starting-style`**, and that is the whole
mechanism: neither element is ever inserted — the live region exists on every frame and only gains
children, and the list never leaves — so nothing is "starting", and what runs is a transition
declared on both sides of a selector change. Built the other way first and measured: the message
arrived at full opacity with `blur(0px)`. **The pane's height is not animated with them, and that is
a refusal**: a content-driven height change is `auto` to `auto`, no computed value moves, and the
only way to animate it is to measure and write a length on every keystroke — JS at interaction time
(§8) in the one component where the keystroke IS the interaction.

#### §49 Sheet — the opening line (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> a panel that slides in from an edge of the window over the scrim.

Replaced there by:

> a panel that sits at an edge of the window over the scrim.

#### §49 Sheet — "The edge is LOGICAL" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> and the safe areas and the slide both key on that physical stamp,

Replaced there by:

> and the safe areas key on that physical stamp,

#### §49 Sheet — "The scrim is Dialog's recipe on the DRAWER's clock" (as it stood at 39f3884)

**The scrim is Dialog's recipe on the DRAWER's clock**, because the app going back and the panel coming in are one progress (§27's own drawer sentence). While a finger drags, Base UI publishes how far it has gone and the dim follows the finger with no clock at all.

#### §49 Sheet — "The slide measures nothing." (as it stood at 39f3884)

**The slide measures nothing.** Its own box is the distance — a length CSS already has — so unlike every anchored panel in the library this entry needs no runner and no measurement, which is the Shell drawer's reading one component over. Leaving is the same distance on the same clock, which is also where a swipe-dismissed panel continues from. Reduced motion stands down both the clock and the pose; a drag still follows the finger, because that is direct manipulation rather than motion the system adds.

#### §49 Sheet — "It is a raw scroll container, and it is NAMED with a reason true of a SHEET." (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> The law that sweeps them would have let this copy Dialog's exemption, and Dialog's reason is that the flight blurs that box — a sheet has no flight, so taking that exemption would be an exemption taken on a false premise. The real reasons are two:

Replaced there by:

> The law that sweeps them names each with a reason of its own, and a sheet's are two:

#### §50 Combobox — "FOCUS STAYS IN THE FIELD" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> **FOCUS STAYS IN THE FIELD while the panel is open**, which is the one thing that differs from Select for the floating runner. The runner copes by construction: it poses from the anchor it measured, and its page-scroll hold is armed only for a focus that moves INTO the panel.

Replaced there by:

> **FOCUS STAYS IN THE FIELD while the panel is open.**

#### §50 Combobox — "THE SEED IS A LINE AT THE FIELD'S BOTTOM EDGE" and "THE HEIGHT FOLLOWS THE LIST, in flight and at rest" (as it stood at 39f3884)

**THE SEED IS A LINE AT THE FIELD'S BOTTOM EDGE, not the field's own body (audit C7).** §22's silhouette is the trigger's opaque box lifting, and it is honest wherever the panel LANDS on the thing it came out of. A combobox's field is the one trigger you are still USING while its panel opens: the seed covered it for 60–100ms of every open, so the caret and the letter just typed sat behind a blank capsule — measured, `elementFromPoint` at the input's text midline returning the popup from t=86 to t=140 while `input.value` became "L". An opaque photograph of a box the user is typing into is the one case the morph cannot be. So the seed keeps the field's WIDTH and corner — that edge is real, and the panel does hang from exactly that line — and gives up its height, starting as a zero-tall line and unfurling down. That is Command's zero-height seed, reached from the other direction. And this seed FADES where the family's is opaque from frame one, because the family's reason is that it covers the trigger exactly, and a line with no height covers nothing.

**THE HEIGHT FOLLOWS THE LIST, in flight and at rest, and this is the member that forced both.** In FLIGHT (audit C3): the entry pins a height measured at mount, and a combobox is the first member whose content changes WHILE it flies — you open it by typing into it. Measured at 130ms per key, typing "par" took the list to one row inside an 86px box and snapped 86→56 at t=589; backspacing took it to nine rows inside a 146px box whose `clientHeight` equalled its `scrollHeight`, so the extra rows could not be scrolled to at all, and the box then snapped 146→296. `ComboboxBody` is the family's body with `followsContent`, which re-aims that one number at the list's real height; everything else about the entry is the family's, and the choice is made once in the component that knows it rather than passed down a tree. At REST (audit C9): a settled panel's height is `auto`, and `auto` does not interpolate, so every filter change snapped the box in one frame — measured 234→162→234 with nothing in between — while Command, which this component takes its filtering from, animates the identical change. `interpolate-size: allow-keywords` is scoped to this pane because it INHERITS; where an engine lacks it the height snaps, which is exactly today's behaviour.

#### §51 NumberField — "The steppers are ZONES of the field" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> the quiet rung's fill states and the disabled remap arrive, and the rise and sink never do (measured before, the stepper rose 0.989px and sank 2px, carrying its glyph away from the value).

Replaced there by:

> the quiet rung's fill states and the disabled remap arrive.

#### §53 SplitButton — "It is two Buttons drawn as one box" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> `split-button.css` squares the two inner corners, draws the divider in the label's own ink at 30% (so it reads on every emphasis and tone without a colour of its own), and stands the travel down. **The halves do not rise or sink**: a button moves because it sits on the page, and half of one box moving alone tears the box at the seam; the fill still lights and presses.

Replaced there by:

> `split-button.css` squares the two inner corners and draws the divider in the label's own ink at 30% (so it reads on every emphasis and tone without a colour of its own).

#### §54 ButtonGroup — "It is §53's seam for any number of buttons" (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> `button-group.css` squares every inner corner, draws a divider on each member but the first, and stands the travel down.

Replaced there by:

> `button-group.css` squares every inner corner and draws a divider on each member but the first.

#### §54 ButtonGroup — "Refused, on record." (as it stood at 39f3884)

Removed (the passage around it stays in DECISIONS):

> off-by-one rule at every call site — §39's Breadcrumb refusal), travel (§53), and `tone`/`emphasis`

Replaced there by:

> off-by-one rule at every call site — §39's Breadcrumb refusal), and `tone`/`emphasis`

#### §56 MessageScroller — "The button is placed by layout, never by a transform" (as it stood at 39f3884)

The dock's fade and the Button's hover transform were removed and the layout facts kept. The passage as it stood:

> **The button is placed by layout, never by a transform.** It was first lifted with `translate`, and
> a Button's own hover motion is `translate`, so the first hover threw it a button's height down the
> transcript (Kushagra: it *"travels a lot when I hover on it"*). The dock is a zero-height row that
> aligns its one item to its end; the button overflows upward on its own and its transforms stay the
> Button's. A law reads the computed transform, because a law reading the class would have passed. **And its fade is the DOCK's** (2026-09-19): a `transition` on the button tied the Button skeleton's at (0,1,0) and won on file order, replacing six channels with one — the accordion audit's defect — so its hover and press snapped. The dock outside a surface fell back to `auto` because `--kui-sf-p` had no fallback; it takes page.css's spelling now, and the rows space on the density-aware layout scale.

It now reads:

> **The button is placed by layout, never by a transform.** It was first lifted with `translate`, and
> a Button's own hover motion was `translate` then, so the first hover threw it a button's height down the
> transcript (Kushagra: it *"travels a lot when I hover on it"*). The dock is a zero-height row that
> aligns its one item to its end; the button overflows upward on its own. A law reads the computed
> transform, because a law reading the class would have passed. The dock outside a surface fell back to
> `auto` because `--kui-sf-p` had no fallback (2026-09-19); it takes page.css's spelling now, and the
> rows space on the density-aware layout scale.

#### Wording changes in DECISIONS.md that removed a motion reference but specified no motion

- §8 Variants and interaction states — opening paragraph
  - was: at rest/hover/press, with the same transition, is the whole game.
  - now: at rest/hover/press, is the whole game.

- §9 The component axis model — "Card is a shell", "A pane holds what it contains"
  - was: `clip` and not `hidden`, on the argument the flight rules already won: a `hidden` box
  - now: `clip` and not `hidden`, on an argument the floating panels settled on 2026-08-17: a `hidden` box

- §9 The component axis model — "And the rule reaches through exactly one box"
  - was: Menu and Select put their scroller OUTSIDE the flying body,
  - now: Menu and Select put their scroller OUTSIDE their panel body,

- §11 Per-component defaults — the Sheet / Drawer row
  - was: the overlay family's third member: a modal panel that slides in from an edge over the scrim.
  - now: the overlay family's third member: a modal panel that sits at an edge over the scrim.

- §13 Public token contract — "Two size optimisations the contract refuses"
  - was: — `--kui-ct-`, `--kui-sf-`, `--kui-fly-`, `--kui-material-` and,
  - now: — `--kui-ct-`, `--kui-sf-`, `--kui-material-` and,

- §25 AlertDialog — "The component owns the layout"
  - was: The entry's body is a wrapping row:
  - now: The panel's body is a wrapping row:

- §26 Tabs and the segmented control — the track paragraph
  - was: one value across rest, hover and press (a grip does not fill, it moves)
  - now: one value across rest, hover and press (a grip does not fill)

- §26 Tabs and the segmented control — "The panel seam"
  - was: **The panel seam is the FIFTH bounded exception, and it was found
  - now: **The panel seam is a bounded exception too, and it was found

- §26 Tabs and the segmented control — "The panel seam"
  - was: the clause each of the other four exceptions buys its licence by refusing.
  - now: the clause each of the other exceptions buys its licence by refusing.

- §27 Shell — the drawer's corner
  - was: **And the corner question closed with it** (Kushagra:
  - now: **The drawer's corner question closed the same day** (Kushagra:

- §27 Shell — "A SIDE PANE PUSHES THE FRAME"
  - was: (2026-09-09, and it reverses most of the paragraph above; Kushagra:
  - now: (2026-09-09, and it reversed most of the 2026-09-06 drawer entrance; Kushagra:

- §27 Shell — "A SIDE PANE PUSHES THE FRAME"
  - was: **Three things follow and each was measured.**
  - now: **Two things follow and each was measured.**

- §27 Shell — "A SIDE PANE PUSHES THE FRAME"
  - was: **(3) The push reads the width the pane is WEARING.**
  - now: **(2) The push reads the width the pane is WEARING.**

- §36 Table — "Two elements, TextField's split"
  - was: the case the flight rules' `clip` argument is not about
  - now: the case the surface layer's `clip` argument (§9) is not about

- §42 ContextMenu — the audit's fourth finding
  - was: **And the fourth: the platform's menu drew over our own.**
  - now: **The fourth: the platform's menu drew over our own.**

- §46 Page — "THE COLLAPSE IS A NOTIFICATION"
  - was: **THE COLLAPSE IS A NOTIFICATION, AND IT IS THE SEVENTH BOUNDED EXCEPTION to
  - now: **THE COLLAPSE IS A NOTIFICATION, AND IT IS A BOUNDED EXCEPTION to

- §46 Page — "A floating band measures itself"
  - was: recorded as the ninth bounded exception in the interaction-time law's shell entry
  - now: recorded as a bounded exception in the interaction-time law's shell entry

#### docs/ENGINEERING.md §6 "Testing: laws, not snapshots" — the rules that existed only for motion laws (as they stood at 39f3884)

Five consecutive paragraphs, verbatim. In ENGINEERING they are replaced by one sentence pointing here.

**And a stand-down is only stood down if it wins.** The suppression law walked `transition` declarations and never `animation`, so the second of the two ways CSS moves anything was outside its scope entirely — the same shape as "a law about one axis of a two-axis mechanism is half a law" (2026-08-08), one layer down. Where a recipe and its suppression can be separated by specificity, put the recipe in a **hook** and stand the hook down: then both live on the same selector and the tie goes to source order, which is arithmetic nobody has to redo.

**A law that watches a live animation derives every instant from the RUNNER, never from the clock (2026-08-20).** Three laws in `menu.browser.test.tsx` were red on 9 of 13 CI runs, green here, rotating between them, and bound-tuning had been tried twice. Every one was a different lie about time and none was the defect the failure looked like: one computed both its deadlines off the test's wall clock, so it grew stricter exactly as the runner grew slower; one bounded its watch at a chosen `+400ms`, which reports a legitimately late release as a hang (`expected 0 to be greater than 0`); and one scanned a smoothness series that included the sample taken AFTER the release, where the pins are stripped and the box steps in a single frame — the one shape a per-millisecond rate cannot normalise. The clause: **stamp the moments from the runner's own observable events** — its departures, its stamps, its releases — and let ceilings be guards against a hang, set where no runner can reach them, never a bound the claim rests on. Where that is impossible, the claim belongs on the animation's SETUP (declared channels, the clock read off the computed transition list, the stamps, the bookkeeping) rather than on its frames.

**And an instrument must be armed before the thing it measures.** The same round found a law that pressed, waited a frame, then hunted for a pose that lasts two — so it failed 6 runs of 6 when run alone and passed inside the full file, because the earlier tests had slowed the machine enough for the pose to survive until it looked. That is "passing alone and failing together" inverted, and it is the more dangerous direction: the law appears healthy in CI's own arrangement while asserting nothing about a fast machine. A helper that WAITS FOR a state to appear on an element the caller already found teaches every caller this mistake; one that OBSERVES from before the interaction cannot. `seeded()` was deleted for the first shape and `watchPose()` kept for the second.

**A law that must catch a MOMENT does not run where the clock is not ours (2026-08-20, Kushagra: *"lets remove the core cause, dont test animations on ci machine"*).** The rule above was applied four times in one day — every instant derived from the runner, `sweep`/`catchDissolve`/`seizeFlight` seizing the animation's own clocks, observers armed before the gesture — and CI still went red on a new law each round, 15 of 21 runs, while the components were correct every time. What the rewrites could not reach is a residue whose subject genuinely IS wall time: floating-ui converges in it, a release timer fires in it, the browser restores a scroll offset in it. No instrument makes an observation of wall time deterministic on a machine that stalls for 340ms at a stretch (CI's own printed frame gaps), and the failure is not even slowness — a uniform 20x CPU throttle reproduces none of it, because what breaks these laws is *bursty* scheduling landing inside a specific window. So `watchesFrames` (test/browser.tsx) excludes that residue from CI, and the criterion is narrow: **the marker is for a claim that depends on WHEN it looks — a transient state it must be looking at while it exists, or a series it samples as an animation runs.** Not "the subject animates": 47 laws call `inMotion()` and almost all of them read declarations that persist, which are as true on a starved machine as an idle one.

**And an exclusion has to be louder than the thing it excludes**, because "did not run" is this repo's own favourite way of not failing (the `docs:test` cache hit, 2026-08-08; turbo's filtered environment starving the entire browser project, 2026-08-20). Four things carry it: the marker is per-law at the call site, vitest reports the count as skipped on the CI run itself, `src/test/frames.test.ts` pins the set in both directions and fails until a new opt-out is recorded **with the transient it has to catch**, and every excluded law still runs in the `pnpm run ci` a human owes before pushing. Two clauses come with it. **Reach for an instrument before the marker** — a seizure, a delivered event, or moving the claim onto the setup where `recipes.test.ts` can read it exactly. And **an excluded law owes CI whatever half of it is static**: the release-seam law's defect is a difference between two states, not an event, so the pin is now read on a landed panel with the clocks off (`the flight's pin puts the body where flow puts it`) and it fails at exactly one padding against the original bug — the real-time twin keeps only what a static read cannot see. `KUI_STALL=20 pnpm test` throttles the renderer over CDP, which is how the set is re-derived rather than trusted.


#### docs/ENGINEERING.md §6 — "A driver gesture resolving is not the browser having settled" (as it stood at 39f3884)

The rule stays. One clause named exit animations:

- was: a popup unmounts when its exit animations settle,
- now: a popup unmounts after Base UI finishes closing it,

### B. CLAUDE.md paragraphs moved out

Moved out of `CLAUDE.md` (`## State`) on 2026-09-20, as they stood at `39f3884`; the text is unchanged, except that this heading replaces the file's title line and its own headings sit two levels lower.

Source: `CLAUDE.md` as it stood at 39f3884 (39f388494fe01c27f0f2aa620359fdc16b62a18b), the last commit
with motion. Removed 2026-09-20. Every paragraph below sat under `## State`, in the order given here;
each is copied verbatim. Paragraphs that mixed motion with decisions that still hold were left in
CLAUDE.md under a note marking their motion content as history.

#### "A select's panel is placed by what is inside it 2026-08-17" (CLAUDE.md, ## State, as it stood at 39f3884); the placement and the refused arrows stay in CLAUDE.md as a one-sentence residue

**A select's panel is placed by what is inside it 2026-08-17 (§22, §23, Kushagra) — so it is placed BEFORE it is posed.** The overlap placement returns (`alignItemWithTrigger` back to Base UI's default, the macOS/Radix geometry): the chosen row lands exactly on the value it replaces and the rest of the list falls above and below it. The scroll ARROWS stay refused — wheel, trackpad and keyboard already scroll the panel, and an arrow is a control nobody has designed. **The ENTRY is unchanged** (Kushagra: *"I would expect same animation as dropdown, but only the position changes… I still expect the animation"*) — a curtain was built first, law-tested and judged, and rejected on sight; the family has one entry for anchored panels and a select is a member of it, so what moves is where the flight LANDS. **The mechanism is an ordering.** Base UI computes the overlap from the panel's real box, and the runner poses on the mount frame (§22's own rule), so the placement was computed against a box the size of the trigger — the chosen row settled 66px low. The plan now carries `placedByContent` and the entry waits for the box to hold still; nothing is lost, because the pose is transparent until aimed. **Two pose rules were re-keyed, and one was a latent defect**: the silhouette's geometry and the body's squish were keyed on `data-seed` — the VISIBILITY gate — rather than on `data-unfurling`, the flight, so both applied during the placement window and shrank the box the placement is measured from (the squish alone was 58px). **And the flight BORROWS an inline height**: an item-aligned panel is `height: 100%` of a positioner Base UI sized, and an inline declaration beats every stylesheet rule, so the block-size channel was dead — seed height written, pose matching, panel at full height for every frame of an unfurl. The runner takes the property for the entry and puts it back exactly as found; `!important` was refused (it wins the cascade and leaves the library's intent unstated). **The width step at release was a stale premise**: the entry publishes the panel's floor because floating-ui's `--anchor-width` does not exist on a first open, and `heldAnchorWidth` predicted the trigger's SCALED box on the premise that floating-ui measures anchors with transforms — Base UI 1.6 reads `getScale()` and normalises the rect instead (measured: rect 83px at scale 0.975 against `--anchor-width: 85px`; a wide trigger's panel widened 351 → 360 on the release frame). It publishes the resting box now, law-read as the AGREEMENT between the two floors, and falsified against the old prediction after the obvious sabotage (divide → multiply) proved worthless at scale 1. The curtain was DELETED rather than left behind a flag — a mechanism with no consumer is the entropy this repo keeps paying for. 45 select laws, every new one falsified.

#### "Its entry was moving the page before that" (CLAUDE.md, ## State, as it stood at 39f3884)

**Its entry was moving the page before that, and closing one door moved the symptom to the other (2026-08-17).** A select is the only floating member whose open focuses something inside the panel, and the browser answers a focus by scrolling that element into view. With `overflow: hidden` the flying box is a scroll container, so the PANEL took an offset nothing settles at (measured 57px) and unwound it frame by frame as the box grew — the contents visibly sliding. Refuse it with `overflow: clip` and the browser walks one step out and takes the PAGE (65px, and it stays). Both doors are shut, in two layers: `clip` on the flying box, and the page parked for the entry's opening frames inside the scroll event itself. One law reads both per frame, falsified in both arms. An earlier note claiming a 2151px single-frame flash survived the page hold is WITHDRAWN — that came from a probe reading in the wrong order (a rAF callback runs after the frame's scroll events) and from a file mounting three subjects into one page.

#### "The motion system landed 2026-08-09 and the fields closed it out 2026-08-10" (CLAUDE.md, ## State, as it stood at 39f3884)

**The motion system landed 2026-08-09 and the fields closed it out 2026-08-10 (§8) — the §14 slice's last standing debt, and the 2026-08-03 finding survived it by being SPLIT rather than traded.** An eased press never reaches its colour inside a ~60ms tap, which is why every transition shipped zero for six days; the resolution is two clocks. Paint is a *signal* — it eases, it is short, and a press sets `--kui-ct-paint` to zero, so a tap lands its colour on the first frame. Geometry is *physics* — it rides a damped spring **baked into a `linear()` easing** (config states ζ and ω, the generator samples the model, a law re-derives the emitted curve), so it costs exactly what a cubic-bezier costs and there is still no JS at interaction time. Geometry has two clocks of its own: a press is short and stiff, everything else is the object RECOVERING and is long and lively. **Each family says how far it moves and nobody says how long** — a button sinks and rises 1px to the pointer, a mark squashes, a field's box does not move at all; a checkbox's tick DRAWS along its own stroke (`pathLength` normalises it) and a radio's dot arrives, both IN and never OUT. Damping is sacred: the shipped curves cross their target at most once, and a movement that needs to be more visible gets more TRAVEL. Three structural forcings, each caught by a law: the switch thumb had to be drawn by BOTH its edges (`inset-inline-end: auto` cannot be animated to, and `aspect-ratio` silently outranked the lean), a mark must state NO resting transform (any non-`none` value makes a stacking context, which broke the 12px stacking rule in five laws at once), and the harness had to learn stillness by default (`inMotion()` opts a law back in). Menu is the floating half — the panel unfurls out of a seed and dissolves, with `--floating-w/-h` measured on mount because a `max()` floor beats an animating width. **2026-08-10, the fields:** their answer is mostly a refusal (a field's box does not travel or scale, measured under a real pointer) plus two findings. The field family and the mark family had **no hover state whatsoever** — measured byte-identical at rest and hovered, because the shared rule steps the FILL and those are exactly the two families whose fill is pinned — so the BOUNDARY now steps, mixed toward the family's own ink (the solved edges sit between ladder rungs by construction, so "+1 step" is undefined on them; a mix also carries the tone and needs no second number for dark). And a field's ring is INSTANT by measurement, not by preference: Chrome resolves `outline-offset` to whole CSS pixels, so a ring gets one frame per pixel of travel — the field's 2px of room is three values and reads as a stutter, the button's 4px is five and reads as motion, which bounds ring travel below at ~4px. **The day's real find was that `prefers-reduced-motion` had never worked**: `:not()` takes the specificity of its most specific ARGUMENT, so the ring rule was (0,3,0) against a (0,2,0) stand-down and landed for every user who asked their OS for stillness — invisible because the suppression law walked `transition` (this is an `animation`) and, even there, only asked whether a selector was PRESENT in the guarded block rather than whether it WON. Reduced motion now stands down a HOOK, so a recipe and its suppression share a selector; and the suite can enter a media query for the first time (`asksForStillness()` over CDP), which is what turns that whole story from stylesheet text into a measurement. Same day, one harness fix: a law that hovers left the pointer parked for the next file — three radio laws read a hovered border as a resting one, passing alone and failing together. Budget 20,921 → 23,594 gzipped.

#### "An interactive surface MOVES 2026-08-17" (CLAUDE.md, ## State, as it stood at 39f3884)

**An interactive surface MOVES 2026-08-17 (§8, §10, Kushagra: “should work like button, but because of larger area, perhaps a little different physics”).** Asked whether any component still lacked the motion principles, and the answer took a measurement: a `<Card render={<button/>}>` had `transition-duration: 0s` and `translate: none` while its fill stepped white-to-grey under the pointer. A dating artifact — card-as-button shipped 2026-08-03, the motion system landed six days later written against `.kui-control`, and §8's roster (button, mark, field, select trigger, slider grip) is controls all the way down. §10 had already said an interactive surface REUSES the control state machine, and that is now as true of how it moves as of what colour it turns: same two clocks, same lively recovery and stiff press, same `kui-ring-land` arrival, same shared `--hover-travel` rise. Only the DISTANCES are its own, which is §8's rule stated exactly — and the SCALE is the one that could not be shared, because scale is relative: a ~64px button at 0.975 moves each edge 0.8px and a 400px card at the same factor moves 5px, which reads as the page flexing. 0.995 matches the button's EDGE movement (1.0px at 400px); the sink halves to 1px. A second SPRING was proposed on §24's “mass forbids overshoot” and **refuted by arithmetic before it was built** — lively overshoots 10.7% and 10.7% of one pixel is a tenth of a pixel. Everything else came back covered or refused on purpose (fields by measured decision, Spinner/Progress motion-as-content, the type family stateless). An existing law caught the work and was right to: `resolveHooks` knew only `--kui-ct-`, so the surface's channels read as unsprung and hand-typed — widened to both private stems. Two instrument findings: the first draft opted into motion and read a correct hover rise as `0px` (the first sample of a 550ms spring), and `el.focus()` does not make a BUTTON `:focus-visible` in Chrome, so the ring law asserted nothing. +74 bytes gzipped, measured against a real build.

#### "A panel that lands BESIDE its trigger flies from the SEAM 2026-08-17" (CLAUDE.md, ## State, as it stood at 39f3884)

**A panel that lands BESIDE its trigger flies from the SEAM 2026-08-17 (§22, Kushagra: the submenu “travels a lot, especially if dropdown menu is wide”).** Measured on a 365px menu before anything moved: the seed was the sub-trigger ROW whole — 353 x 30 at x=10 — flying into a 92 x 73 panel at x=376, so 366px of travel while SHRINKING to a quarter of its width, both numbers the parent panel's own. The silhouette is honest only where the panel LANDS on the thing it came out of; a submenu lands beside the panel its row sits in, so photographing the row starts it somewhere it will never be and the unfurl runs backwards. Keyed on the PLACEMENT and never on the component — the positioner already publishes `data-side`, so the runner asks the question the placement answered. A side-opening panel keeps the row's height and corner (that edge is real), drops the width photograph to the family's designed seed, and takes an x offset of ZERO, which also makes it direction-blind for free. Decided in `aim()`, the first moment the placement is certain and still before any frame can paint. The 2026-08-10 refusal and the 2026-08-15 re-opening had both reasoned about this and neither measured the travel at a realistic width; surfaces.css had shipped the opposite claim (“grows the short, true distance out”), true only for a narrow menu. Its law opens by HOVER and reads the LAST seeded frame — `defaultOpen` on the sub measured 5.8px of pre-fix travel and the first aimed frame 10px, against the real 366 — both caught by sabotaging the fix and finding the failure message too small to be the defect.

#### "The entry work of 2026-08-14→16, compressed" (CLAUDE.md, ## State, as it stood at 39f3884)

**The entry work of 2026-08-14→16, compressed (LOG carries each in full).** The floating entry LOCKED as the trigger's own silhouette — three forming recipes (condensation, deep scale, clip-morph), the restored circle and a covering placement all judged out; the panel's first frame is the trigger's box sitting exactly ON it, position measured never derived, the seed a static pose, invisible until aimed. The overlay materialization FORMED against it — a circle rising from below into a MEASURED box — and the family unified on the elastic spring (ζ 0.62, one ~8.4% crossing): box clocks speed-matched to their travel (overlay ~1.7× the menu's), content clocks time-matched to the family (print 380, echo 8px, shared verbatim); it then moved whole to AlertDialog at the split. Two mechanism findings shipped with it: **an ending rule must RESTATE the entry's geometry channels** (dropping a property from `transition-property` cancels its running transition — Escape mid-flight snapped the box 125→560 in one frame before), and **a quick reopen is an open with NO BIRTH** (Base UI hands back the still-mounted popup with no starting stamp — the floating layer's observers read `data-open` returning as the announcement, a new flight retires the old one's release clock, and the menu's cancel listener arms at departure, never at begin) — **the first half of which was REVERSED 2026-08-20 (Kushagra: "on second quick click it does show wrong animation"): a reopen mid-dissolve is CAUGHT, not replayed.** The panel is on screen and already placed, so posing it back onto the trigger's silhouette teleported it — measured 355 x 98 at 58% opacity to 239 x 32 at full opacity in ONE frame, 3/3, and 358px → 64px off a short trigger — before unfurling it again. An entry is how a panel ARRIVES and this one never left; the ending stamp leaving simply takes the exit's targets off and the paint clock carries it back from wherever the dissolve reached — **and since 2026-08-25 that same edge rests the popup's OWN ScrollArea viewport at its top: the catch keeps the box's flight, never the list's browsing** (a fresh mount rests at the top, so timing must not decide what the second press shows; measured, a constrained menu reopened at `scrollTop` 196 with its group label clipped above the panel's edge). The reset rides the REVOCATION because a reset written at the arrival is undone — the exit's posed body contributes its scaled size to the scrollable overflow and the browser takes the offset back as content grows out of it; its reach is the direct-child chain (`:scope > .kui-scroll-area > .kui-scroll-viewport`), so a caller-composed scroller inside a popover keeps its position and a select — whose offset IS the placement — is untouched by construction, both law-pinned and falsified. A reopen is told from an OPEN by what the panel was doing when `data-open` ARRIVED — mid-dissolve the ending stamp is still on, on a real open it is long gone — because deleting the branch outright took a kept-mounted panel's ordinary second open with it (Select's own law: *the entry ran once per lifetime*). There is no second flight, so the menu law that timed two overlapping clocks is replaced by the hazard it really guarded (dismiss WHILE AIRBORNE, take it back, and the interrupted flight's own pending clock must still land the panel). Both "REPLAYS the entry" laws now assert the opposite, falsified against the restored branch. **The adoption pass ran 2026-08-16 behind a six-dimension audit (22 confirmed findings, each adversarially verified), and its headline was ENTROPY: the two entry runners had drifted four ways** — a laid-out guard dead in one and working in the other (`parseFloat` of an unresolved `calc()` token), a flight registered too late to retire, a body measured after the writes that invalidate its layout, a listener freed on one path of four. **They are ONE runner now**, the single real difference (does this panel fly from its trigger?) asked three times and nowhere else, with the two names for the measured box collapsed to `--kui-fly-*`. The critical find was one channel missing from the exit's restatement (`box-shadow`), which cancelled and snapped a dismissed menu 169 → 303px — closed by restating it, by teaching the dismissal listener that only geometry cancellations end a flight, and by a law that DERIVES the exit's channel list from the entry's so the class cannot return. Three mechanisms had no law at all and now do: the springs (emitted curve re-derived from config's physics, plus each curve's claimed overshoot and crossing count read off its own samples), the flight retirement, and the floating family's reduced-motion suppression — which also changed shape: the guard no longer maintains an inverse of every pose (that inverse is what produced two of the defects), it owes only "nothing moves, nothing is measured", both mounted-law-asserted.

### C. The docs site's Motion chapter as it stood

`apps/docs/content/foundations/motion.mdx` at `39f3884` (`git show 39f3884:apps/docs/content/foundations/motion.mdx`); the text is unchanged and its headings sit two levels lower here.

Motion covers two things: a colour change and a movement. Two separate clocks control them. No
component sets a duration. CSS does every transition, so no JavaScript runs while you press a
control.

#### Colour and movement run on separate clocks

A colour or opacity change eases, and it's short. It uses `--motion-duration` and
`--motion-easing`.

A movement follows a spring. The configuration sets the physics. The generator samples that
model and writes the result into a CSS `linear()` curve. The browser does the same amount of
work for this curve as for a `cubic-bezier`.

If the two changes use one clock, the colour waits for the movement. Then the control responds
late.

```css
/* Wrong: one clock for everything. */
.thing {
  transition: all 200ms ease;
}

/* Right: the colour eases, the movement springs. */
.thing {
  transition:
    background-color var(--motion-duration) var(--motion-easing),
    translate var(--motion-press) var(--motion-spring-stiff);
}
```

#### A press changes colour immediately

A tap lasts approximately 60 milliseconds. An eased fill never reaches its colour in that time.
So a person who taps on a phone sees no colour change. You only see this on a real phone.
Desktop touch emulation doesn't show it.

For this reason, a press sets its colour clock to zero. The fill changes on the first frame,
and the movement springs under it. Any motion that you add later must keep the press immediate.

The hover state starts in 80 milliseconds and ends in 220. It starts quickly because the person
did something. It ends slowly because moving away needs no response.

#### Each kind of component moves its own distance

A button sinks when you press it. It moves down and becomes slightly smaller at the same time.
If it only moved down, it would look like a slide. If it only became smaller, it would look
like it moved away.

A card that you can press sinks by its own smaller distances. Scale is relative. If a big card
became smaller by a button's factor, each edge would move several pixels. That looks like the
page bends.

A checkbox squashes instead, because it has no depth to sink into. A text field doesn't move.
You read inside the box, so the box must stay still.

No component sets a duration. The system sets the clocks, and a component sets only its
distances. So two controls of the same size move at the same speed.

Nothing in the example below sets a duration, a distance, or an easing.

```tsx
<Card size="3">
  <Stack gap="4">
    <Heading size="6">Deploy to production</Heading>

    <Flex render={<label />} align="center" gap="3">
      <Switch size="2" />
      <Text size="3">Run the migration first</Text>
    </Flex>

    <Slider defaultValue={[25]} aria-label="Rollout percentage" />

    <Flex gap="3" justify="flex-end">
      <Button emphasis="quiet" bordered>Cancel</Button>
      <Button emphasis="loud">Deploy</Button>
    </Flex>
  </Stack>
</Card>
```

The buttons sink. The switch thumb springs across its track. The slider handle follows your
pointer.

There's no duration prop or easing prop, and nothing is called `animate`. Components can't
write a duration either. Every part of every transition must resolve to a motion token. So a
duration that you type by hand, such as `150ms`, fails the build.

#### Movement overshoots once, at most

Both springs pass their target one time at most. A control that crosses its target two times
wobbles, and a wobble looks mechanical.

To make a movement more noticeable, make the distance longer. Don't make the spring looser. A
looser curve over a short distance looks like a bounce effect. The physics is fixed. The
distance is the only part that a component sets.

#### A focus ring can't animate a short distance

A focus ring needs approximately four pixels of travel before an animation is useful. Chrome
rounds `outline-offset` to whole pixels. So a ring with two pixels of space animates in three
frames, and three frames look like a stutter. A field's ring has two pixels of space, so it
appears immediately.

#### Spinners slow down instead of stopping

A Spinner and a Progress bar with no value are in a different category. Their movement isn't a
transition between two states. It shows that work continues.

If a person asks their operating system for reduced motion, both indicators slow down. The
spinner slows to three seconds. Neither indicator stops, because a busy indicator that stops
looks finished.

#### Reduced motion stops everything else

Every other movement stops when a person asks for reduced motion. A panel appears in its
position and doesn't travel. The system skips the measurements that only supply animations.

The stylesheet rule that starts a movement also stops it, on the same selector. So a new
animation can't arrive without its own off switch.

#### Nothing runs in JavaScript while you interact

Hover, press, focus, and the validity states are all stylesheet rules. They read data
attributes on the element. No handler measures anything while you point at a control. The
package ships no runtime animation library.

There are three exceptions, and none of them occurs while you interact:

- A floating panel measures its destination one time, when it opens.
- A tab bar measures its underline again when the selection changes.
- The system builds the glass effect when a panel mounts and when the window resizes.

### D. LOG.md entries about motion

Built from the entry headings of `docs/LOG.md` at `39f3884` (`git show 39f3884:docs/LOG.md`), chosen by scanning every entry's body for motion and reading the candidates, keeping those whose subject, or one of whose named decisions, is motion; the entries themselves remain in `docs/LOG.md`. Oldest first.

- 2026-08-02 — The pre-Button states close, and loading refuses to eat the label
- 2026-08-03 — Button meets a real phone, and three settled answers reverse
- 2026-08-06 — The spinner gains a wrapper: composited rotation outranks one element
- 2026-08-08 — Progress ships without a size axis — the ladder was asked first and refused
- 2026-08-09 — Motion's grammar is chosen: physics, not clips — judged on a switch and a button
- 2026-08-09 — Motion ships, on Menu alone — and the exit is a dissolve, not the entry reversed
- 2026-08-09 — Motion reaches the control layer, and the press keeps its 2026-08-03 finding by splitting it
- 2026-08-10 — Hover reaches the boundary, the field's ring stays instant because the engine says so, and reduced motion turns out never to have worked
- 2026-08-10 — Why a menu that opens left looks worse than one that opens down — two answers, one fixed and one recorded open
- 2026-08-10 — The entry becomes the family's, and the second member finds the bugs the first could not
- 2026-08-10 — The seed becomes the trigger itself — the morph, unblocked by the machinery built for a different bug
- 2026-08-10 — The grip squashes when held, and finding its key re-measured the suppression the whole layer trusted
- 2026-08-11 — The panel compressed at release, because the two width floors measured different triggers
- 2026-08-14 — The entry stops being ported and starts being formed — judged against iOS's own frames
- 2026-08-15 — The circle comes back — the day of forming recipes ends where the emergence began
- 2026-08-15 — The silhouette locks — the entry answers where the panel came from, and every intermediate is retired
- 2026-08-15 — The dialog materializes — the floating principles cross a family boundary without their animation
- 2026-08-16 — The materialization is tuned into the family — one curve, two speeds, and an exit that keeps becoming
- 2026-08-16 — Alert dialog and dialog split — the materialization is the alert's gesture, and the difference must be built
- 2026-08-16 — A quick reopen has no birth — the popup Base UI hands back, and the flight it interrupts
- 2026-08-16 — AlertDialog ships, and the materialization moves home
- 2026-08-16 — The dialog's entry locks on depth, and the audit before it collapsed two runners into one
- 2026-08-17 — A select's entry was moving the page, and shutting one door moved the symptom to the other
- 2026-08-17 — A select's panel is placed by what is inside it, so it is placed before it is posed
- 2026-08-17 — A submenu flies from the seam, because a silhouette is only honest when the panel lands on its trigger
- 2026-08-17 — The one component with a full state machine and no motion was the card you can press
- 2026-08-17 — ScrollArea ships as one export, Menu scrolls its list instead of its panel, Select waits on a measurement
- 2026-08-18 — Tabs and the segmented control: two objects that look alike, and the role is what separates them
- 2026-08-19 — The tab rule goes back to left + width, and the audit that made it necessary
- 2026-08-19 — Base UI 1.7 stays, and the keyboard keeps the entry flight
- 2026-08-20 — The three flakiest laws in the suite were three different lies about time, and one was measuring an animation it could not see
- 2026-08-20 — A dismissal taken back is CAUGHT, not replayed — the quick reopen reversed
- 2026-08-20 — The rotation's last four laws were each a window the machine could outrun — and a window is held open, not raced
- 2026-08-20 — A flight is seized by its clocks — except where its subject is a wall-time loop
- 2026-08-20 — A law that must catch a MOMENT does not run where the clock is not ours
- 2026-08-20 — Stillness is not arrival — and a borrowed clock has to be given back
- 2026-08-21 — Main went red on two laws that raced a window, one day after the rule against it
- 2026-08-21 — The sheet's ring was cut, and it had borrowed the wrong motion
- 2026-08-22 — the parent is put back before the panel is
- 2026-08-22 — the placement is carried as LAYOUT while the panel is in the air
- 2026-08-22 — an item-aligned panel's scroll offset IS its placement, so the flight keeps it
- 2026-08-22 — A sabotage that survives is evidence about the LAW, not only about the code
- 2026-08-22 — The flight borrows a style, it does not enumerate one — and three other things the suite could not see
- 2026-08-23 — The panel's content was stretching on the control layer's clock
- 2026-08-23 — The panel measures itself before the browser has told it how much room it has
- 2026-08-23 — The room clamp is only the panel's cap where the panel sits on one side of its trigger
- 2026-08-23 — The lens was drawn in the corner of the pane, and it arrived after the panel did
- 2026-08-23 — The page-hold in the select entry has never fired
- 2026-08-23 — A right-to-left menu opened on the far edge and flew backwards onto its trigger
- 2026-08-23 — Two mechanisms that could be deleted with the suite green now have laws
- 2026-08-23 — The flying body pivoted on one edge and was pinned to another
- 2026-08-23 — A guarantee held only by a law CI does not run
- 2026-08-23 — The traveling highlight: one object that stretches toward where it is going
- 2026-08-23 — The grip painted over its own label, and a tab ended on the line it stands on
- 2026-08-23 — A re-key that moved a colour and left its rule behind
- 2026-08-23 — A popover scrolls its own content, and three audit leftovers
- 2026-08-25 — The channel has walls — the segmented thumb's overshoot becomes a squash
- 2026-08-25 — The catch keeps the box's flight, not the list's browsing
- 2026-08-25 — The flight's pin is corrected to the room, and a constrained top-opening menu stops jumping at release
- 2026-08-25 — The flight's body takes a SINK, and the rows the flight reveals become the rows the panel rests on
- 2026-08-25 — The placement's anchor is the trigger's RESTING box, and the last 2px of the release jump goes
- 2026-08-29 — `data-instant="focus"` is an input class, and the family had exempted only two of three
- 2026-08-29 — A centred body cannot be centred by auto margins, and every entry in the family was sliding its content
- 2026-08-31 — A centred panel is held by its middle, or the fall clock carries a distance it was never given
- 2026-08-31 — A popover's seed is a circle on its trigger — the alert's grammar at the floating family's origin
- 2026-08-31 — A tooltip's entry is a lift, not a silhouette — the bench's "Physics" tooltip, built on the family's own channels
- 2026-09-01 — A box mid-flight is not its own size — the segmented thumb measured through an ancestor's scale
- 2026-09-01 — An ultracode audit of the five new components, and every fix it earned
- 2026-09-02 — The done state is a swap, not a draw — and the tick had three homes
- 2026-09-02 — A context menu is a menu, so it ships three exports — and it flies from the point
- 2026-09-02 — The ContextMenu audit — three cases the flight had never met, and five laws that could not fail
- 2026-09-05 — The results pane opens out of the search bar, and the empty state is what it shows
- 2026-09-05 — The glass got thicker in a jump, and the fix is telling the lens where the pane is going
- 2026-09-06 — A drawer slides, the frame recedes under it, and the slide shipped dead
- 2026-09-06 — Tab walked into the search results, and the ring was never the thing to remove
- 2026-09-09 — A rail meets a narrow window as a tab bar
- 2026-09-09 — A side drawer pushes the frame; only a sheet from below recedes it
- 2026-09-10 — Three repairs that survived a collision, and the check that found the other five
- 2026-09-10 — The runner's clock was an input to the verdict, seven times over
- 2026-09-12 — The flight follows its content, and the seed stops covering the field
- 2026-09-14 — Motion runs at 0.6 of its judged clocks; the popover takes the dialog's entry

### E. Laws deleted

**213 laws across 30 law files.** Every one of them existed at `39f3884` and can be read there: `git show 39f3884:<path>` for any file named below. They were deleted rather than skipped because each had motion as its subject — a clock, a spring, a pose, a seed, a flight, a travelling inset, a stand-down under `prefers-reduced-motion`, or a token that only motion declared — so with motion gone there is nothing for them to be about. Titles are verbatim and in vitest's own shape: the `describe` heading, then the `it` sentence.

**A law is deleted when its `it()` sentence is gone, not when its `describe` heading changed.** This appendix said 231 until 2026-09-20, taken from an inventory written mid-pass and keyed on the heading: eighteen of its bullets named laws that are still in the tree under a renamed `describe`, ten of them the segmented control's (which went from 20 listed to 10), and each of the eighteen is present at `39f3884` AND at HEAD, so none is a new law wearing an old name. Re-derived mechanically against the live files; the renamed ones appear in the paragraph below and nowhere else.

The same change also **renamed or added** laws, and almost all of those are repairs of laws that SURVIVED rather than new claims: a title with the travel struck out of it (the segmented control's eleven went from "the grip travels between segments" to "the grip sits on the chosen segment"), or a claim re-keyed onto what is left of its subject (`recipes.test.ts`'s "nothing moves that is not stood down under reduced motion" narrowed to "every animation in the package has a reduced-motion answer", which now has only the three content loops to walk). Two are genuinely new, and both are about a mechanism that survived: `recipes.test.ts`'s "the press rule outranks every lit rule — its selector is split on purpose (§8)", and — added after this inventory was taken — `segmented-control.browser.test.tsx`'s "a seat forced OUT of the channel does not take the grip with it (2026-09-20)", the law for the floor that kept the thumb and that nothing had ever read.


**`packages/ui/src/components/accordion/accordion.browser.test.tsx`** — 2

- the machine: one open by default, many with multiple, and the chevron turns (§37) the heading eases on every channel the skeleton does, plus its own underline
- the machine: one open by default, many with multiple, and the chevron turns (§37) the panel travels by height on the spring, clipped

**`packages/ui/src/components/alert-dialog/alert-dialog.browser.test.tsx`** — 5

- a leaving alert is not a target (§25, 2026-08-22) the page underneath answers the hit test while the panel dissolves
- the panel materializes (§25) a reopen that lands mid-dissolve is CAUGHT, never replayed (§24, 2026-08-20)
- the panel materializes (§25) suppression is total: under reduced motion the panel is simply there (§8)
- the panel materializes (§25) the entry is a BECOMING: a circle of surface at the center, unpainted, content molten — and the clocks split (§8)
- the panel materializes (§25) the exit dissolves — the box holds its size, settles a hair, and leaves as one (§24)

**`packages/ui/src/components/button-group/button-group.browser.test.tsx`** — 1

- one box, several controls (§54) no member travels under the pointer — one moving alone tears the seam

**`packages/ui/src/components/button/button.browser.test.tsx`** — 12

- glass keeps its matter on every rung, and a press still travels (§10, 2026-08-19) a pressed loud glass button has a TIGHTER blast to travel to
- the done state reports an outcome in place (§8, §29) both glyphs are mounted and share one cell, in both states
- the done state reports an outcome in place (§8, §29) the box does not move, because the press already owns it
- the done state reports an outcome in place (§8, §29) the fade is paint and the scale is geometry — §8's two clocks, no new ones
- the done state reports an outcome in place (§8, §29) the waiting glyph sits under a seed and out of focus, and the arriving one does not
- the done state reports an outcome in place (§8, §29) the width travels, and only for a button that has a done state
- the press travels, and its colour does not wait (§8) held, the button sinks and shrinks
- the press travels, and its colour does not wait (§8) hover warms faster than it cools (§8)
- the press travels, and its colour does not wait (§8) it RISES to meet the pointer, and the rise is not the press's clock (§8)
- the press travels, and its colour does not wait (§8) the ring LANDS on a button and never on a text input (§8)
- the press travels, and its colour does not wait (§8) the two clocks: colour eases, the box springs
- the press travels, and its colour does not wait (§8) under a real pointer it actually rises (§8)

**`packages/ui/src/components/card/card.browser.test.tsx`** — 7

- a card you cannot press does not rise to the pointer, and does not sink under a press
- an interactive surface moves like a control, at its own scale (§8, §10) it rises to meet the pointer, by the SAME pixel a button uses
- an interactive surface moves like a control, at its own scale (§8, §10) it sinks and shrinks under a real press, by its OWN distances
- an interactive surface moves like a control, at its own scale (§8, §10) its paint and its geometry are on the control layer's two clocks
- an interactive surface moves like a control, at its own scale (§8, §10) its ring LANDS, the way a button's does and a field's cannot (§8)
- an interactive surface moves like a control, at its own scale (§8, §10) stillness reaches every part of it (§8)
- an interactive surface moves like a control, at its own scale (§8, §10) the surface's distances are its own, and the SCALE is the one that could not be shared

**`packages/ui/src/components/checkbox/checkbox.browser.test.tsx`** — 4

- the tick is drawn, not switched on (§8) held, the mark squashes — it has no depth to sink into (§8)
- the tick is drawn, not switched on (§8) it draws IN on a spring and returns instantly — un-checking is not the reverse
- the tick is drawn, not switched on (§8) the indeterminate dash is the tick's own sentence, not a faded check
- the tick is drawn, not switched on (§8) unchecked the stroke is fully retracted; checked it is fully out

**`packages/ui/src/components/combobox/combobox.browser.test.tsx`** — 4

- the entry: a panel that hangs below the field you are typing into a SETTLED panel animates the same change rather than snapping (C9)
- the entry: a panel that hangs below the field you are typing into poses as a zero-height line, where the family poses as its trigger's box (C7)
- the entry: a panel that hangs below the field you are typing into re-aims its measured height when the list narrows mid-flight (C3)
- the entry: a panel that hangs below the field you are typing into under REDUCED MOTION the panel is simply there (§8)

**`packages/ui/src/components/command/command.browser.test.tsx`** — 8

- the empty state is what the results pane shows, not a pane beside it (§44, 2026-09-05) the message arrives out of a BLUR, and the list does the same coming back
- the machine is the package's, the list is the app's (§44, §33) running a row with ENTER does not ring it on the way out
- the pane tells the LENS where it is going (§10, §22 — 2026-09-05) and the mark comes off, or the lens would never measure again
- the pane tells the LENS where it is going (§10, §22 — 2026-09-05) it is the LAYOUT box, never the painted one
- the pane tells the LENS where it is going (§10, §22 — 2026-09-05) on open it publishes the box it is heading to, and marks itself in flight
- the results pane opens out of the search bar (§8, §22, §44 — 2026-09-05) and it flies on the FLOATING family's clocks, never a second set of numbers
- the results pane opens out of the search bar (§8, §22, §44 — 2026-09-05) reduced motion: it is simply there
- the results pane opens out of the search bar (§8, §22, §44 — 2026-09-05) the seed is the bar's own bottom edge: no rows tall, pulled up, transparent

**`packages/ui/src/components/dialog/dialog.browser.test.tsx`** — 9

- on a narrow window a dialog is a sheet carries NO motion — the dialog's entry is wrong for a sheet, and none is honest
- on a narrow window a dialog is a sheet …and it does not flash the dialog's POSE for a frame either
- the panel comes into focus, not into view (§24) moves no size channel at all — the absence IS the design
- the panel comes into focus, not into view (§24) rides the heavy plane's spring: one slight crossing, never a bounce
- the panel comes into focus, not into view (§24) starts a step back in DEPTH with its content out of focus, and travels nowhere
- the panel comes into focus, not into view (§24) suppression does not MOVE the panel — at either stamp (§8, §24)
- the panel comes into focus, not into view (§24) suppression is total: under reduced motion the panel is simply there (§8)
- the panel comes into focus, not into view (§24) the exit dissolves, and a dismissal mid-arrival RETARGETS rather than snapping
- the panel comes into focus, not into view (§24) two clocks, one mass: the content focuses WITH the box, and is never printed

**`packages/ui/src/components/menu/context-menu.browser.test.tsx`** — 6

- it flies from the POINT — the menu's own entry, with the right box (§42, §22) and a Menu beside it still flies from its trigger
- it flies from the POINT — the menu's own entry, with the right box (§42, §22) and it lands ON the cursor when the panel has to shift up the window
- it flies from the POINT — the menu's own entry, with the right box (§42, §22) its clocks are the family's own, because they ARE the family's
- it flies from the POINT — the menu's own entry, with the right box (§42, §22) the seed is a zero-size box at the cursor, not the region
- what a summoned panel does NOT hand down, and what it re-does (audit 2026-09-02) a second right-click while it is open flies again, it does not teleport
- what a summoned panel does NOT hand down, and what it re-does (audit 2026-09-02) a submenu inside it still flies from its own row

**`packages/ui/src/components/menu/menu.browser.test.tsx`** — 51

- the ScrollArea adoption holds its a11y and its keyboard physics (2026-08-19) a KEYBOARD open flies — Base UI 1.7's instant stamp is exempt for real opens (§8, §22)
- the panel unfurls out of a seed (§22) a CONTROLLED menu still flies on the open after an Escape (§22)
- the panel unfurls out of a seed (§22) a GLASS panel builds its lens once, not once a frame (§8, §10, 2026-08-22)
- the panel unfurls out of a seed (§22) a KEYBOARD dismissal dissolves, exactly like a pointer's (§8, §22)
- the panel unfurls out of a seed (§22) a MIRRORED submenu grows out of the seam too (§22, 2026-08-22)
- the panel unfurls out of a seed (§22) a constrained top-opening flight is anchored to the truth (§22, 2026-08-25) the box does not move on the frame the flight releases — read in the strip's own microtask (§22, 2026-08-25)
- the panel unfurls out of a seed (§22) a constrained top-opening flight is anchored to the truth (§22, 2026-08-25) the pin the flight anchors to is the CLAMPED box, never the 100vh-capped natural (§22, 2026-08-25)
- the panel unfurls out of a seed (§22) a constrained top-opening flight is anchored to the truth (§22, 2026-08-25) the rows the flight reveals are the rows the panel rests on (§22, 2026-08-25)
- the panel unfurls out of a seed (§22) a constrained top-opening flight is anchored to the truth (§22, 2026-08-25) the seed of a pin-corrected flight never leaves its trigger (§22, 2026-08-25)
- the panel unfurls out of a seed (§22) a dismissal taken back MID-FLIGHT lands on the flight it interrupted (§22, 2026-08-20)
- the panel unfurls out of a seed (§22) a glass panel wears its lens for the WHOLE flight, built from where it is going (§10, §22)
- the panel unfurls out of a seed (§22) a left-side menu in an ltr document seeds on the edge NEAREST its trigger (§22)
- the panel unfurls out of a seed (§22) a left-side menu in an rtl document seeds on the edge NEAREST its trigger (§22)
- the panel unfurls out of a seed (§22) a panel dismissed mid-entry stops answering the pointer (§22)
- the panel unfurls out of a seed (§22) a panel that lands BESIDE its trigger grows out of the SEAM, not out of the row (§22)
- the panel unfurls out of a seed (§22) a panel that opens UPWARD keeps its content INSIDE it, every frame (§22, §23)
- the panel unfurls out of a seed (§22) a reopen that lands mid-dissolve is CAUGHT, never replayed (§22, 2026-08-20)
- the panel unfurls out of a seed (§22) a right-side menu in an ltr document seeds on the edge NEAREST its trigger (§22)
- the panel unfurls out of a seed (§22) a right-side menu in an rtl document seeds on the edge NEAREST its trigger (§22)
- the panel unfurls out of a seed (§22) a submenu holds the edge it emerged through, not the one a menu holds (§22)
- the panel unfurls out of a seed (§22) an open trigger's geometry is LOCKED — the panel must not move with a hover settle (§8)
- the panel unfurls out of a seed (§22) an unaimed seed paints nothing (§22)
- the panel unfurls out of a seed (§22) both channels actually MOVE across the entry — declared is not the same as free
- the panel unfurls out of a seed (§22) geometry rides the spring; paint does not (§8's two clocks)
- the panel unfurls out of a seed (§22) nothing jumps on the frame the flight ends — end-aligned (§22)
- the panel unfurls out of a seed (§22) nothing jumps on the frame the flight ends — start-aligned (§22)
- the panel unfurls out of a seed (§22) nothing the seed moves is missing from the transition list (§8)
- the panel unfurls out of a seed (§22) suppression is total: under reduced motion nothing is posed and no clock survives (§8)
- the panel unfurls out of a seed (§22) survives being mounted twice — the measurement is of the PANEL, never of the seed (§22)
- the panel unfurls out of a seed (§22) the box it grows into is measured, and it is the panel's own
- the panel unfurls out of a seed (§22) the catch keeps the box's flight, not the list's browsing (§22, 2026-08-25)
- the panel unfurls out of a seed (§22) the exit decelerates, never bounces, and is faster than the entry (§8)
- the panel unfurls out of a seed (§22) the exit dissolves: geometry HOLDS and the rows stay lit (§22)
- the panel unfurls out of a seed (§22) the first frame is the trigger's SILHOUETTE, sitting exactly on it (§22)
- the panel unfurls out of a seed (§22) the flight's pin puts the body where flow puts it — both arms (§22)
- the panel unfurls out of a seed (§22) the flying body pivots on the edge it is PINNED to — ltr, align center (§22)
- the panel unfurls out of a seed (§22) the flying body pivots on the edge it is PINNED to — ltr, align end (§22)
- the panel unfurls out of a seed (§22) the flying body pivots on the edge it is PINNED to — ltr, align start (§22)
- the panel unfurls out of a seed (§22) the flying body pivots on the edge it is PINNED to — rtl, align center (§22)
- the panel unfurls out of a seed (§22) the flying body pivots on the edge it is PINNED to — rtl, align end (§22)
- the panel unfurls out of a seed (§22) the flying body pivots on the edge it is PINNED to — rtl, align start (§22)
- the panel unfurls out of a seed (§22) the panel clips while it is not its own size (§22)
- the panel unfurls out of a seed (§22) the panel falls before it spreads, and the channels are out of phase (§8)
- the panel unfurls out of a seed (§22) the panel's CONTENT does not slide in from the side when it opens end-aligned (§22)
- the panel unfurls out of a seed (§22) the panel's floor does not step at release (§22)
- the panel unfurls out of a seed (§22) the pivot follows the side and the align, not the default (§22)
- the panel unfurls out of a seed (§22) the posed CONTENT is held: invisible, molten, and a step below where it lands (§8, §22)
- the panel unfurls out of a seed (§22) the seed is EACH trigger's own box — a 28px icon and a wide button get different seeds (§22, 2026-08-15)
- the panel unfurls out of a seed (§22) the side it opens on is decided ONCE, not re-decided as it grows (§22)
- the panel unfurls out of a seed (§22) the silhouette's overlay is PAINT, never layout (§22, 2026-08-15)
- the panel unfurls out of a seed (§22) …and when the panel is capped by the window, the box it grows into is the CAPPED box (§22)

**`packages/ui/src/components/message-scroller/message-scroller.browser.test.tsx`** — 1

- the jump button is placed by layout keeps the Button's own clocks: the fade is the dock's

**`packages/ui/src/components/number-field/number-field.browser.test.tsx`** — 1

- the two steppers are ZONES of the field, edge to edge (§4, 2026-09-13) a zone LIGHTS under the pointer and does not travel — it is not a button

**`packages/ui/src/components/popover/popover.browser.test.tsx`** — 7

- a controlled popover still flies after a focus-out (§22, §31) the second state-driven open is posed, like the first
- a popover dismissed by tabbing out dissolves (§8, §31) the ending frame carries the family's clocks, not zero
- an overlong panel scrolls its content, not itself (§22) a caught reopen resets the popup's OWN viewport and never a scroller the caller composed (§22, 2026-08-25)
- the padding hook the entry flight reads is set on every floating panel (§22) popover, tooltip and menu all resolve it — and the menu's value did not move
- the panel knows its direction and its anchor (§20, §22) only depth and paint move — no size, no travel, no corner — on the dialog's clocks (§31, 2026-09-14)
- the panel knows its direction and its anchor (§20, §22) the flight's anchor is the popover's OWN trigger, standing alone and inside a dialog
- the panel knows its direction and its anchor (§20, §22) the seed is the landed box at the dialog's depth, faint; the words stay in flow and come into focus

**`packages/ui/src/components/radio/radio.browser.test.tsx`** — 3

- the dot arrives, and never leaves in reverse (§8) it grows on a spring and vanishes instantly — the tick's own sentence
- the dot arrives, and never leaves in reverse (§8) it pivots on itself, not on the SVG's origin
- the dot arrives, and never leaves in reverse (§8) unchosen it has no size; chosen it is whole

**`packages/ui/src/components/scroll-area/scroll-area.browser.test.tsx`** — 1

- stillness reaches it too (§8) the fade is stood down when the OS asks — pure paint is not an exemption

**`packages/ui/src/components/segmented-control/segmented-control.browser.test.tsx`** — 10

- the grip travels between segments (§8, §26) STRETCHES on the way — mid-flight it is wider than either end
- the grip travels between segments (§8, §26) a RESIZE re-places it without flying — the box moved, the choice did not
- the grip travels between segments (§8, §26) back: and the OS can stop it — the stand-down nothing verified (§8, audit 2026-08-26)
- the grip travels between segments (§8, §26) back: the edge facing the destination takes the shorter clock
- the grip travels between segments (§8, §26) back: the flight never crosses the channel wall — overshoot is spent as squash
- the grip travels between segments (§8, §26) forward: and the OS can stop it — the stand-down nothing verified (§8, audit 2026-08-26)
- the grip travels between segments (§8, §26) forward: the edge facing the destination takes the shorter clock
- the grip travels between segments (§8, §26) forward: the flight never crosses the channel wall — overshoot is spent as squash
- the grip travels between segments (§8, §26) is PLACED on first paint — no previous seat, so no flight
- the grip travels between segments (§8, §26) the flight SURVIVES the observers watching the box

**`packages/ui/src/components/select/select.browser.test.tsx`** — 12

- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) an item-aligned panel flies to the box BASE UI sized, not to the room on one side (§23)
- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) and it resolves the SAME recipe a menu does — one family, one entry
- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) it lands with the CHOSEN ROW on the trigger — placed before it is posed (§23)
- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) the FIRST open flies to the settled width — the floor is inside the target (§22)
- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) the box actually MOVES across the entry — membership is not the same as motion
- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) the entry moves neither the page nor the panel's own contents (§8, §22)
- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) the entry replays on EVERY open, not only the first (§22)
- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) the first frame is the trigger's SILHOUETTE, and the panel is measured for the flight
- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) the flight BORROWS Base UI's inline height and gives it back (§23)
- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) the panel's floor OUTLIVES the flight, so nothing hands it back (§22)
- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) the trigger rises to a real pointer — a button's gesture in field dress (§8)
- the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23) the width floor is the trigger's LAYOUT box, not the box it is holding a press in (§22)

**`packages/ui/src/components/sheet/sheet.browser.test.tsx`** — 3

- the slide, and the setting that removes it each edge parks its panel behind the edge it comes from — one of its own boxes away
- the slide, and the setting that removes it the slide and its scrim are ONE clock — the drawer's, not the dialog's quick reveal
- the slide, and the setting that removes it under reduced motion it is simply there — no clock, and no pose to flash either

**`packages/ui/src/components/shell/shell.browser.test.tsx`** — 2

- a live drawer is not cut, and neither is the scrim over it (§27, §8, 2026-09-06) the scrim fades out on the drawer's clock, not in one frame
- a parked drawer is off the frame, not merely invisible (§27, §8, 2026-09-06) the drawer and the page it pushed travel on one clock, in lockstep

**`packages/ui/src/components/slider/slider.browser.test.tsx`** — 2

- the grip under drag (§8, 2026-08-10) a held grip squashes, holds it for the drag, and stands back up released
- the grip under drag (§8, 2026-08-10) the travel is never sprung — scale is the only channel, and the hold swaps its clock

**`packages/ui/src/components/split-button/split-button.browser.test.tsx`** — 1

- the halves press as two (§53) neither half travels under the pointer — half a box moving alone tears the seam

**`packages/ui/src/components/switch/switch.browser.test.tsx`** — 5

- the thumb crosses its channel, drawn by both edges (§8) a DEAD switch does not lean — the press response is guarded like every other (§8)
- the thumb crosses its channel, drawn by both edges (§8) both inline edges are LENGTHS in both states — `auto` can only teleport
- the thumb crosses its channel, drawn by both edges (§8) the crossing rides the calm spring, and only the crossing
- the thumb crosses its channel, drawn by both edges (§8) the grip stays a capsule while it leans — 50% would make it an ellipse
- the thumb crosses its channel, drawn by both edges (§8) the press belongs to the thumb, and reaches it from the ROOT (§8)

**`packages/ui/src/components/tabs/tabs.browser.test.tsx`** — 9

- the rule travels as two edges at two speeds (§8, §26) STRETCHES on the way — mid-flight it is wider than either end
- the rule travels as two edges at two speeds (§8, §26) a flight INTO the overflow region still lands on its tab — the wall is adaptive
- the rule travels as two edges at two speeds (§8, §26) back: and the OS can stop it — the stand-down nothing verified (§8, audit 2026-08-26)
- the rule travels as two edges at two speeds (§8, §26) back: the edge facing the destination takes the shorter clock
- the rule travels as two edges at two speeds (§8, §26) back: the flight never leaves the bar — the overshoot squashes against the start
- the rule travels as two edges at two speeds (§8, §26) forward: and the OS can stop it — the stand-down nothing verified (§8, audit 2026-08-26)
- the rule travels as two edges at two speeds (§8, §26) forward: the edge facing the destination takes the shorter clock
- the rule travels as two edges at two speeds (§8, §26) forward: the wall binds at the bar's END where the last tab reaches it
- the rule travels as two edges at two speeds (§8, §26) is PLACED, not flown, before anything has been chosen a second time

**`packages/ui/src/components/tooltip/tooltip.browser.test.tsx`** — 7

- a keyboard-focused tooltip flies like a hovered one (§8, §32) the pose is on and the clocks run, on the one route a keyboard has
- it knows its direction and its anchor (§20, §22) the flight's anchor is the tooltip's OWN trigger, inside a dialog as much as alone
- the entry is a LIFT, not a silhouette (§32, 2026-08-31) only scale and paint move: no size, no travel, no corner — the box is its landed box from frame one
- the entry is a LIFT, not a silhouette (§32, 2026-08-31) the curve is the CALM spring on the tooltip's own clock — the bench's physics, not the family's elastic
- the entry is a LIFT, not a silhouette (§32, 2026-08-31) the exit returns to the seed, not the family's 2% settle
- the entry is a LIFT, not a silhouette (§32, 2026-08-31) the seed is the landed box scaled toward the trigger's edge, faint — and the centre and that edge never move
- the entry is a LIFT, not a silhouette (§32, 2026-08-31) the words ride WITH the chip: no print of their own, and no clock for one

**`packages/ui/src/system/floating.browser.test.tsx`** — 3

- a centre-aligned panel keeps its content centred for every frame (§22) menu: the two gaps stay equal at every width the box passes through
- a panel beside its trigger never squeezes its content (§22) the body holds its words at every height the pane passes through
- the positioner is restored by ONE arm (§22, §23) an item-aligned select goes through the full restore, marker and width included

**`packages/ui/src/system/recipes.test.ts`** — 8

- interaction is stylesheet work, checkably (ENGINEERING §1.5) a press belongs to the family that owns it (§8, 2026-08-09)
- interaction is stylesheet work, checkably (ENGINEERING §1.5) and an ANIMATION is stood down too — the half this law was missing (§8, 2026-08-10)
- interaction is stylesheet work, checkably (ENGINEERING §1.5) every selector that declares an arrival is a selector that stands it down (§8)
- interaction is stylesheet work, checkably (ENGINEERING §1.5) every transition in the package rides a motion token (§8)
- interaction is stylesheet work, checkably (ENGINEERING §1.5) geometry rides a spring, paint eases — the two clocks, everywhere (§8)
- interaction is stylesheet work, checkably (ENGINEERING §1.5) nothing moves that is not stood down under reduced motion (§8)
- interaction is stylesheet work, checkably (ENGINEERING §1.5) the panel families are inside the reduced-motion guard at all (§8)
- interaction is stylesheet work, checkably (ENGINEERING §1.5) the press keeps its colour instant — the 2026-08-03 finding, in CSS (§8)

**`packages/ui/src/system/surfaces.browser.test.tsx`** — 7

- a centred panel grows out of its trigger symmetrically (§22) the seed's inline offset is ~0 and the pane's centre holds through the width's travel
- suppression is total, and it reaches the way OUT (§8) alert: a dismissed panel neither travels nor dissolves under the setting
- suppression is total, and it reaches the way OUT (§8) alert: the same stamp WITHOUT the setting really does move it — the calibration
- suppression is total, and it reaches the way OUT (§8) floating: a dismissed panel neither travels nor dissolves under the setting
- suppression is total, and it reaches the way OUT (§8) floating: the same stamp WITHOUT the setting really does move it — the calibration
- the flight pins the body at the pane's OWN padding, on BOTH axes (§22) a TOOLTIP, whose two axes are priced differently, is pinned right on each of them
- the flight pins the body at the pane's OWN padding, on BOTH axes (§22) and a MENU, whose axes agree, is unmoved by the pair — the control

**`packages/ui/src/system/surfaces.test.ts`** — 7

- the exit keeps every channel the entry moves alive (§8, §22, §24) the floating family: no channel is dropped on the way out
- the exit keeps every channel the entry moves alive (§8, §22, §24) the overlay family: no channel is dropped on the way out
- the flight pins a panel's body at padding every panel HAS (§22) and the size join still DECLARES the override — the two are different jobs
- the flight pins a panel's body at padding every panel HAS (§22) no flight rule reads the floating-only override bare
- the flight pins a panel's body at padding every panel HAS (§22) they read the resolved padding PER AXIS, and never the one-value name
- the instant exemption is one set stated twice, and the two agree (§8, §22) and every arm of the stand-down carries the whole chain
- the instant exemption is one set stated twice, and the two agree (§8, §22) the runner's set and the stylesheet's guard name the same values

**`packages/ui/src/tokens/tokens.test.ts`** — 15

- the springs are physics, and the emitted curve is that physics (§8) calm: crosses its target at most once, and the overshoot is the documented one
- the springs are physics, and the emitted curve is that physics (§8) calm: the emitted curve is the ζ and ω config states
- the springs are physics, and the emitted curve is that physics (§8) carried: crosses its target at most once, and the overshoot is the documented one
- the springs are physics, and the emitted curve is that physics (§8) carried: the emitted curve is the ζ and ω config states
- the springs are physics, and the emitted curve is that physics (§8) driven: crosses its target at most once, and the overshoot is the documented one
- the springs are physics, and the emitted curve is that physics (§8) driven: the emitted curve is the ζ and ω config states
- the springs are physics, and the emitted curve is that physics (§8) elastic: crosses its target at most once, and the overshoot is the documented one
- the springs are physics, and the emitted curve is that physics (§8) elastic: the emitted curve is the ζ and ω config states
- the springs are physics, and the emitted curve is that physics (§8) every spring in config is emitted, and nothing else claims to be a spring
- the springs are physics, and the emitted curve is that physics (§8) lively: crosses its target at most once, and the overshoot is the documented one
- the springs are physics, and the emitted curve is that physics (§8) lively: the emitted curve is the ζ and ω config states
- the springs are physics, and the emitted curve is that physics (§8) poised: crosses its target at most once, and the overshoot is the documented one
- the springs are physics, and the emitted curve is that physics (§8) poised: the emitted curve is the ζ and ω config states
- the springs are physics, and the emitted curve is that physics (§8) stiff: crosses its target at most once, and the overshoot is the documented one
- the springs are physics, and the emitted curve is that physics (§8) stiff: the emitted curve is the ζ and ω config states
