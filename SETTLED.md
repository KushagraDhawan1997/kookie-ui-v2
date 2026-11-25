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
  padding step 2. A dialog does not pad one size up.
- A scroll edge fades on a curve, not evenly: content stays faint for most of the fade and
  comes back near the end. One value sets it for every fade (`--scrollbar-fade-curve`, 0.8).
- A pane inside a pane has a concentric corner: inner corner = outer corner − outer padding.
  (§6)
- Corners are squircles where the browser can draw them. (§6)

## Colour

- Gray is the default accent. Pink and purple are named families beside blue and green.
  (§7)
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
- The action row of a dialog is a plain `Flex` today. Whether actions and Close move into a
  navigation bar is still open. Don't decide it.
