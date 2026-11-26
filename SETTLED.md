# Settled decisions

Every call Kushagra has made that is not a composition rule. Composition rules are in
`RULES.md`. One line each. Both files ship to every consumer's agent inside `AGENTS.md`
(`apps/docs/scripts/generate-agents.ts` reads them), so an agent sees them before it writes or
answers anything.

Treat each line as decided. Don't argue against it, don't add a caveat to it, and don't apply a
general rule of thumb that it already overrules. If a line looks wrong, say so once and ask;
don't work around it. The reasoning for each is in `docs/DECISIONS.md` (section in brackets).

When Kushagra settles something new, add its line here in the same change.

## Size and touch

- A component given no `size` is size 2, in every family. Text rests at 3 and Heading at 6,
  on their own scale. (§4)
- Size 2 on a touch screen is 44px tall, which is the touch target by default. (§16)
- Size 1, and a denser theme, are deliberate choices. Don't apply touch-target or size rules to
  them, and don't flag them. (§16)
- No invisible hit area added around controls as a system mechanism. The mark family, controls
  that are their own mark such as Checkbox, is the one exception. (§5, §16)

## Type

- No size 1 text on a composed screen. Less important means muted ink, not smaller text. (§15)

## Motion and state

- Nothing animates. Every state change is instant. Only Spinner, Progress and Attachment move,
  because the movement is the information. (§8)
- Disabled is a colour change, never opacity. (§8)
- A loading button keeps its label. (§8)
- One focus ring, one design. (§8)

## Surfaces and shape

- There is no elevation and no shadow prop. The Theme's `depth` sets shadows for the whole app.
  (§10)
- Glass has one anatomy, locked. The app decides where glass goes; the default is solid. (§10)
- Every surface pads at its own size: a card, a shell pane and a dialog of size 2 all use
  padding step 2. A dialog does not pad one size up. The steps are 24, 32, 40 and 48px for
  sizes 1 to 4 (they were 16, 24, 32, 40 until 2026-11-26).
- A scroll edge fades on a curve, not evenly: content stays faint for most of the fade and
  comes back near the end. One value sets it for every fade (`--scrollbar-fade-curve`, 0.8).
- A toolbar inside a glass dialog, sheet or popover has real glass buttons, with no prop: Close,
  the tools beside it, a Navigator's Back, an action row written as a toolbar. This is the one
  exception to "one glass per stack". Other controls in the panel keep the on-glass look.
- A solid notice's own buttons, the action and the X, are real glass with no prop when the
  theme uses glass. A glass notice never holds real glass: its buttons keep the on-glass look.
  Dialogs, sheets and popovers are a different case, because of the scrim behind them.
- A popover's corner is smaller than a dialog's, on purpose: it takes the card's corner, a
  dialog takes the overlay's. The padding and the layout inside are the same. Don't unify them.
- A pane inside a pane has a concentric corner: inner corner = outer corner − outer padding.
  (§6)
- Corners are squircles where the browser can draw them. (§6)

## Colour

- Gray is the default accent. Pink and purple are named families beside blue and green.
  (§7)
- A medium button's fill is neutral gray whatever its tone, on the page. Inside a tinted
  surface such as a Notice it is one solid step darker than that surface, in the surface's own
  colour: darker gray on a gray notice, darker amber on a warning one. Never a gray patch on a
  tinted surface, and never a see-through fill.
- The accent is fixed when the app is built. A section can be tinted with `<Theme accent>`.
  There is no built-in accent picker. (§7)

## Components and patterns

- A dialog becomes a sheet on a narrow window. There is no prop to stop it. (THESIS §7)
- Defaults are opt-out: the right thing happens when you don't think. Overriding needs a reason
  the library can't know. (THESIS §7)
- There is no Banner. An app-wide message is a `ShellNotice`, one at a time, most severe
  first. (§29)
- A dialog's description sits right under the title band, close enough to read as the title's
  line.
- A dialog's top can be written three ways, and all three stay: the title in the toolbar with
  the description under it, the title in the toolbar with content under it, and a toolbar that
  holds only Close and tools (and Back) with the title under it.
- A title's size sets the room above it. A title under a row of controls sits `--title-space-N`
  below that row, where N is the title's type step: 16px for a default dialog title, 48px for a
  Page title, less when a short line shrinks the title. Dialog and Page both read it. There is
  no prop for the gap; don't add space by hand, and don't give a dialog and a Page different
  rules for it.
- A description written straight after a dialog's title sits one small step under it.
- A sheet and a popover space their title and description exactly as a dialog does. The same
  layout never gets a different gap because of which panel it is in.
- A large title under a row of navigation and tools follows `Page`: the row stays in place,
  the title sits below it, and when the title scrolls up behind the row a `ToolbarTitle` in the
  row shows the same words. Check `Page` before asking how a title and its row behave.
- A `Navigator` outside a pane puts each screen's title under its row, never in it. The row
  holds Back and Close and floats over the content. When the title scrolls away, the row shows
  it in its centre, so Back appearing never moves it. There is no prop for any of this, and it
  is the same in a dialog, a sheet and a popover.
- A Navigator's row spaces what follows exactly as a toolbar in a dialog does: the title's own
  room above the title, a small step to a description, a section to content.
- Every title in a row is the row's title size (18px by default), wherever the row is: a
  dialog's title written in the row, and the title a row shows after a page or screen title
  scrolls away. A title under the row keeps its own size.
- A dialog, sheet or popover written as a `Toolbar` and then a `ScrollArea` gets a floating
  row: the content scrolls behind it and fades, and a title under the row shows in the row once
  it scrolls away (put a `ToolbarTitle` with no words in the row). Never wire this by hand with
  positioning, a typed fade or an observer.
- A new Navigator screen opens at the top. The title does not slide between screens.
- The scroll fade stays at 0.8 even where text shows faintly behind a row's title.
- In a Field, the label, the value inside the text field, the description and the error share
  one left edge. The text field's box sticks out past that edge on both sides, by its own
  inner padding. Don't inset the label instead, and don't add padding to line things up.
- In a dialog with a field, the field's box, the buttons and the text end on three different
  right edges (18, 29 and 33px at the default size). That is accepted. Don't flag it or even
  them out.
- Every box in a Field sticks out the same way: text field, select, text area and number field.
  Boxes stacked in a form are the same width. Checkboxes, radios, switches, sliders and
  segmented controls stay on the text edge.
- Two or more fields side by side go in a `FieldRow`. It sets the space between them. Never lay
  fields out in a `Grid` or `Flex` with a gap of your own: their boxes will collide.
  In development the console warns once when it finds two fields side by side outside one.
- A dialog, sheet or popover whose content scrolls can end with a toolbar for its action. That
  toolbar floats over the content like the top one. Give the scroll area `fade`.
- A Notice has two distances, never one gap for everything: its icon and words are one group,
  its action and X are another. Inside a group the gap is small (8px by default); between the
  groups it is two steps bigger (16px). Both follow the notice's size.
- Settled for now (Kushagra, 2026-11-25: "this isn't fixed, i might change my mind", then
  "settled for now"). Follow both; if one looks wrong in practice, say so:
  - A dialog needs no Cancel button, because Close already does that, and its one main action
    sits alone in a toolbar at the bottom, at the trailing edge.
  - In a dialog, sheet or popover the region decides glass, not the kind of control: anything
    in a toolbar, top or bottom, is real glass, and anything in the content keeps the on-glass
    look.

## The linter

- Kookie UI ships a linter, inside the package, at `@kushagradhawan/kookie-ui-react/eslint-plugin`.
  It is no longer limited to what the type checker cannot see: it also checks composition,
  hand-written style and missing pieces. (Kushagra, 2026-11-26)
- Two ready-made sets. `recommended` is the default: an error only when the code is always wrong,
  a warning where a fair exception exists. `strict` holds the same rules, all errors, for agents
  and new projects.
- Every lint message has three parts: what is wrong, what to use instead, and a link to the docs
  page. The wording follows `RULES.md` and this file.
- A comment that turns a Kookie rule off must give a reason after ` -- `. With no reason it is
  an error in both sets.
- A rule fixes the code by itself only when there is exactly one right answer. When the answer
  is a judgement it offers a fix to choose. When it cannot know the answer it only reports.
- Each rule belongs to the earliest checker that can see it. The linter owns what one file of
  code shows. A development console warning covers what is only known while the app runs. The
  screen check covers what only the rendered page shows.
- The rules are written once, in ESLint's rule format, and use no type information, so Oxlint
  can run them too.
