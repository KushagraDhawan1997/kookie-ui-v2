# Composition rules

Read this before you build or change any screen, example, figure or preview made of Kookie
components. These are the rules Kushagra has settled. A screen that breaks one is not done,
however good its parts are.

Each rule says what to do, how to test it, and what enforces it today:

- **default**: the component does it for you. Don't rebuild it by hand.
- **check**: a check reports it. `screen` is the screen check, which reads any rendered page
  (`node scripts/review-ui/run.mjs <url>`). `builder` is the builder reviewer
  (`apps/docs/app/builder/review.ts`), which reads builder documents only.
- **review**: only an eye catches it. You must look at the screenshot.

The composition skill (`.claude/skills/composition`) is the longer version with reasons. The
docs page `/start/composition` is the public version. Where they disagree, this file wins, and
the disagreement is a bug to report.

## How to work

1. Use the component that owns the job. If a component draws a band, a footer, a close button
   or a title, use it. Never hand-build a band, toolbar, header or close button from a `Row`,
   `Flex` or positioned `div`. If no component owns the job, stop and say so. That's a gap in
   the system, not a call-site decision.
2. Never change a check, a test or a law to make your work pass, and never swap one component
   for another to get past a check (a `Card` to a `Surface`, a `Button` to a `div`). If a check
   is wrong, stop, say which check and why, and leave it as it is.
3. Before you show anything, run the screen check on every page you changed, opening dialogs
   and walking flows (`--press`, `--next`), with `--shots <dir>`. Fix every finding. Then look
   at the screenshots, light and dark, against this file, and hand them to the `ui-reviewer`
   agent. Passing the check is necessary, not sufficient: it catches broken rules, not a dull or
   crowded screen.

## Panels: dialog, sheet, popover

1. **Every titled panel has a Close button, always.** It's an X at the trailing edge of the
   panel's band, a glass toolbar button. Other ways out (Cancel, Escape, a press outside) don't
   replace it. Test: every Dialog, Sheet and titled Popover shows an X in its top band.
   Enforced by: default (Navigator screens; panels themselves: coming), check (screen
   `panel-close`).
2. **A panel's band is a real `Toolbar`.** Back at the leading edge, the title, Close at the
   trailing edge, all on one row. The title stays at the panel's own title size. Test: no
   button in the panel's top row is placed by hand, and any title in the band is a
   `ToolbarTitle`, which brings the title's air. Grouping band items in a `Flex` cluster is
   fine; that's how a band is written. Enforced by: default (Navigator), check (screen
   `hand-built-band`, `band-wrapper`).
3. **A band sits one step inside the content edge.** The toolbar's inset is one step closer to
   the panel's edge than the content's padding, measured from the panel's own padding, so it
   moves with the panel's size. Applies to every band: dialogs, sheets, popovers, and Shell
   pane headers and footers, pinned or floating. Enforced by: default (Navigator; pane bands:
   coming), check (screen `band-inset`).
4. **Toolbar buttons are glass.** Controls in a band use the band's material, not an opaque
   fill. Enforced by: default inside `Toolbar`, review.
5. **Everything in a glass panel reads the glass.** Cards and controls inside a glass panel
   take the panel's material. An opaque `Surface` inside glass is a break. Enforced by: check
   (screen `opaque-in-glass`).

## Flows: several screens in one panel

6. **The primary action is full width, on every screen of a flow, including the first.** Same
   place on every screen, at the bottom. Notes sit above it, never beside it. Enforced by:
   check (screen `flow-cta-width`).
7. **Back keeps what was entered, and a finished flow has no Back.** Enforced by: default
   (Navigator), review.

## Focus and emphasis

8. **One loud control per pane.** Each pane or region, such as a Shell pane, a dialog or a
   sheet, gets at most one `emphasis="loud"` action: the one that pane exists for. A dialog
   counts as its own pane. A switch's on state doesn't count (2026-11-03, Kushagra: "The rule
   should be per pane or per region"). Enforced by: check (screen and builder `one-figure`).
9. **The way back is quieter than the way forward.** Enforced by: check (builder
   `way-back-as-loud`).
10. **Tone means something.** `destructive`, `success`, `warning`, `info` carry meaning; the
    colour tones are for data. At most three tones on one surface. Colour never carries a
    message alone; write the words. Enforced by: check (screen `tone-budget`, builder
    `tone-as-decoration`).

## Grouping and space

11. **Distance is relationship.** The gap inside a group is at least two steps smaller than the
    gap around it, compared along the same direction. A screen with one gap top to bottom has
    no structure. Usual steps: label to field 3, group to group 5, section to section 6.
    Enforced by: check (builder `flat-rhythm`).
12. **Space around a heading is asymmetric.** A heading sits closer to what follows it than to
    what comes before. Enforced by: check (builder `heading-space`).
13. **Space groups first; a border only when space can't.** Never both a container and a rule
    around the same group. No card inside a card. (Lines and hover on one list: rule 28.) Enforced by: check (builder
    `nested-card`), review.
14. **Every gap is a step on the scale.** No invented lengths (`13px`, `1.35rem`). Enforced by:
    check (`checkUsage`, ESLint plugin).

## Alignment

15. **One axis.** Everything aligns to the container's edge unless it has a reason. Values in
    label/value rows align on the baseline. In a list, sidebar or group, the group's label (or
    the band's title above it), every row's text or icon, and the separators start on one left
    edge. A selection or hover fill hangs outside that edge; it never pushes the text in.
    Enforced by: default (Row, RowGroup, Sidebar: coming), check (screen `text-axis`).
16. **Nothing floats.** Every icon, arrow and badge belongs to a row or a control. An arrow next
    to a title with no job is a break. Enforced by: review.

## Type and size

17. **Rank text by at least two steps.** Page 8, section 7, card title 6, body 3, label and meta
    2. Enforced by: check (builder `heading-ladder`).
18. **No size 1 text on a composed screen.** Less important means muted ink at size 2 or 3,
    not smaller text. Enforced by: check (screen and builder `size-1-retired`).
19. **Same job, same size.** Controls doing one job on a surface are one size. Controls match
    the surface they sit on: a size 3 dialog holds size 3 fields and buttons. Enforced by:
    check (screen and builder `mixed-control-sizes`, builder `control-scale`).

## Words

20. **Every element has a one-word job** (label, value, action, meta). Cut anything without
    one. Enforced by: review.
21. **Say less.** Helper text carries a consequence, a scope or a limit, never a definition of
    the control. Option cards hold a name, a price or value, and one short line, no more.
    (Dots between facts: rule 27.) Enforced by: check (builder `filler-text`), review.
22. **No eyebrows.** A title carries its own subject. Enforced by: check (builder `eyebrow`).
23. **An action says what it does**, as a verb and its object, and keeps its name through the
    flow (Publish, then Published). Enforced by: check (builder `vague-action`,
    `long-action`).
24. **Real words.** No placeholder copy. A placeholder is not a label and holds no
    instructions. Errors say how to fix it. Enforced by: check (builder `placeholder-as-label`,
    `instructions-in-placeholder`, `generic-error`).


## Choices

25. **Pick the smallest control that fits.** Two to five short options: SegmentedControl. More:
    Select. On or off at once: Switch, which never waits for Save. A radio needs at least two
    siblings. Enforced by: check (builder `single-radio`, `switch-in-a-form`,
    `too-many-choices`).

## Figures and examples

26. **Real screens from real products, built from real components.** No abstract glyphs. Any
    annotation lives in the caption, outside the composed surface. The figure itself passes
    every rule above. Enforced by: review.
    A window may bleed off a figure's band, but words are never cut off. The wrong half of a
    do/don't figure carries the Wrong verdict glyph, and only that half may break a rule.
    Enforced by: check (screen `clipped-text`), review.

## Added 2 and 3 November

27. **No dot between facts.** Never join two facts with `·` or `•` ("Friday · Flights at
    9:40"). Give each fact its own place, or cut one. Kushagra: "less is more". Enforced by:
    check (screen `dot-separator`).
28. **Lines or hover, never both.** A list divided by separators doesn't light its rows on
    hover, and a list that lights its rows draws no lines between them. Enforced by: check
    (screen `hover-with-separators`).
29. **Every control has a name.** An icon-only button carries an `aria-label`, so a screen
    reader says what it does. Enforced by: check (screen `accessible-name`).
