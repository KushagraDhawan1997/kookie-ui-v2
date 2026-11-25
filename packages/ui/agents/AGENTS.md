<!-- GENERATED — do not edit. Source: packages/ui/src/index.ts, packages/ui/src/system/axes.ts,
     packages/ui/src/theme/theme.tsx, apps/docs/app/(docs)/components/registry.ts,
     apps/docs/app/(docs)/markdown.ts, apps/docs/app/(docs)/chapters.ts, RULES.md and SETTLED.md, via
     apps/docs/scripts/generate-agents.ts, which also writes agents/docs/.
     Regenerate with `pnpm --filter docs run agents`. A law regenerates and compares. -->

# Kookie UI, for coding agents

Rules for writing `@kushagradhawan/kookie-ui-react`. Its API is not the one you remember from
Radix Themes, shadcn or MUI, so read this before you write a component.

## Before you build, read the page

The docs for the installed version ship in the package, at
`node_modules/@kushagradhawan/kookie-ui-react/agents/docs/`.
Open the page for your task by its path before you write code. File search skips
`node_modules`, so use the path.

- Any screen with more than one component: `start/composition.md`
- A button, a menu row or a navigation item with an icon: `foundations/icons.md`
- A form, a settings page, or any field with a label: `patterns/forms.md`
- A dialog, alert, popover, menu or sheet: `patterns/modality.md`
- The app frame, page titles and tabs between pages: `patterns/navigation.md`
- Loading, progress, success, error and empty states: `patterns/feedback.md`
- A layout that changes with space, or a touch target: `patterns/responsiveness.md`
- A chat, an assistant beside the work, or what an AI makes: `patterns/ai.md`
- A screen people use on a phone or tablet: `inputs/touch.md`

Every other page is in the same folder. A link to `/patterns/forms` inside a page is the
file `patterns/forms.md`.

## Settled decisions

Treat each line as decided. Don't argue against it, add a caveat to it, or apply a general
rule of thumb that it overrules. If one looks wrong for your case, say so and ask.

### Composition

- Every titled panel has a Close button, always. It's an X at the trailing edge of the panel's band, a glass toolbar button.
- A panel's band is a real `Toolbar`. Back at the leading edge, the title, Close at the trailing edge, all on one row.
- A band sits one step inside the content edge. The toolbar's inset is one step closer to the panel's edge than the content's padding, measured from the panel's own padding, so it moves with the panel's size.
- Toolbar buttons are glass. Controls in a band use the band's material, not an opaque fill.
- Everything in a glass panel reads the glass. Cards and controls inside a glass panel take the panel's material.
- The primary action is full width, on every screen of a flow, including the first. Same place on every screen, at the bottom.
- Back keeps what was entered, and a finished flow has no Back.
- One loud control per pane. Each pane or region, such as a Shell pane, a dialog or a sheet, gets at most one `emphasis="loud"` action: the one that pane exists for.
- The way back is quieter than the way forward.
- Tone means something. `destructive`, `success`, `warning`, `info` carry meaning; the colour tones are for data.
- Distance is relationship. The gap inside a group is at least two steps smaller than the gap around it, compared along the same direction.
- Space around a heading is asymmetric. A heading sits closer to what follows it than to what comes before.
- Space groups first; a border only when space can't. Never both a container and a rule around the same group.
- Every gap is a step on the scale. No invented lengths (`13px`, `1.35rem`).
- One axis. Everything aligns to the container's edge unless it has a reason.
- Nothing floats. Every icon, arrow and badge belongs to a row or a control.
- Rank text by at least two steps. Page 8, section 7, card title 6, body 3, label and meta 2.
- No size 1 text on a composed screen. Less important means muted ink at size 2 or 3, not smaller text.
- Same job, same size. Controls doing one job on a surface are one size.
- Every element has a one-word job (label, value, action, meta).
- Say less. Helper text carries a consequence, a scope or a limit, never a definition of the control.
- No eyebrows. A title carries its own subject.
- An action says what it does, as a verb and its object, and keeps its name through the flow (Publish, then Published).
- Real words. No placeholder copy.
- Pick the smallest control that fits. Two to five short options: SegmentedControl.
- Real screens from real products, built from real components. No abstract glyphs.
- No dot between facts. Never join two facts with `·` or `•` ("Friday · Flights at 9:40").
- Lines or hover, never both. A list divided by separators doesn't light its rows on hover, and a list that lights its rows draws no lines between them.
- Every control has a name. An icon-only button carries an `aria-label`, so a screen reader says what it does.

### Size and touch

- A component given no `size` is size 2, in every family. Text rests at 3 and Heading at 6,
  on their own scale.
- Size 2 on a touch screen is 44px tall, which is the touch target by default.
- Size 1, and a denser theme, are deliberate choices. Don't apply touch-target or size rules to
  them, and don't flag them.
- No invisible hit area added around controls as a system mechanism. The mark family, controls
  that are their own mark such as Checkbox, is the one exception.

### Type

- No size 1 text on a composed screen. Less important means muted ink, not smaller text.

### Motion and state

- Nothing animates. Every state change is instant. Only Spinner, Progress and Attachment move,
  because the movement is the information.
- Disabled is a colour change, never opacity.
- A loading button keeps its label.
- One focus ring, one design.

### Surfaces and shape

- There is no elevation and no shadow prop. The Theme's `depth` sets shadows for the whole app.
 
- Glass has one anatomy, locked. The app decides where glass goes; the default is solid.
- Every surface pads at its own size: a card, a shell pane and a dialog of size 2 all use
  padding step 2. A dialog does not pad one size up.
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
 
- Corners are squircles where the browser can draw them.

### Colour

- Gray is the default accent. Pink and purple are named families beside blue and green.
 
- A medium button's fill is neutral gray whatever its tone, on the page. Inside a tinted
  surface such as a Notice it is one solid step darker than that surface, in the surface's own
  colour: darker gray on a gray notice, darker amber on a warning one. Never a gray patch on a
  tinted surface, and never a see-through fill.
- The accent is fixed when the app is built. A section can be tinted with `<Theme accent>`.
  There is no built-in accent picker.

### Components and patterns

- A dialog becomes a sheet on a narrow window. There is no prop to stop it.
- Defaults are opt-out: the right thing happens when you don't think. Overriding needs a reason
  the library can't know.
- There is no Banner. An app-wide message is a `ShellNotice`, one at a time, most severe
  first.
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

## Patterns already solved

Before you propose, build or ask about a layout or interaction pattern, check whether one of
these already solves it, and read its page. Reuse its model, even for a case it does not
cover directly, such as a dialog that needs a title row like a `Page`. Ask only when none of
them answers it.

- **Command** — Command is a search field over the actions and pages in your app.
- **Composer** — A Composer is the box people type a message into.
- **Field** — Put each form control in a Field: a `TextField`, a `TextArea`, a `Select`, a `Combobox`, a `NumberField`, or a group of checkboxes or radios.
- **MessageScroller** — Use a MessageScroller for a transcript that grows while people read it, such as a chat, a support thread or a live log.
- **Navigator** — Use a Navigator when people go deeper into something and come back, such as from settings to notifications to email.
- **Page** — Use a Page for each screen someone moves to, such as a settings page or a report.
- **RowGroup** — Use a RowGroup for a list of settings, or for a section of an inspector.
- **Shell** — Use a Shell once, at the root of an app, to hold its frame: a full-width header, a narrow rail of icons, a sidebar, the main content, an inspector and a bottom pane.
- **Toolbar** — A Toolbar is the row that holds an app's controls, such as the buttons at the top of an editor.

## Every component obeys these

- It sets no outer spacing. The container sets the gap between siblings. Use a Box to add space.
- Its size is an index, not a measurement. The same number means different things on different ladders.
- You choose the meaning and the loudness. The theme resolves the colour.
- CSS resolves every state. No JavaScript runs on hover, press or focus.
- It forwards className and style. Your style merges last, so your value wins.

## The vocabulary

There is no `variant` prop and there never was. Appearance is three independent axes:
`tone` says what a thing MEANS, `emphasis` says how LOUD it is, `material` says what it is
made of. A component names a family, never a colour; the theme resolves the value.

There is no elevation, shadow, or `color` prop either, and no component takes a margin.
Spacing between siblings belongs to the container: set `gap` on the `Flex`, `Stack` or
`Grid` around them, or wrap the child in `<Box m="4">`.

Nothing animates. Every state change is instant: no component takes a duration, easing or
animation prop, and a transition you write in `style` or `className` is fighting the system.
The only movement that ships is a loop that IS the content — the Spinner's turn, Progress's
indeterminate sweep, Attachment's upload sweep — and each one slows for reduced motion.

Do not reach for `className` to get past a refusal. Utility classes are not shipped and
there is nothing for them to hook onto. If a value you need has no index, that is a finding
for the system, not a decision for the call site.

### Component axes

Every legal value. A value outside these lists does not compile.

- `size` — `1` · `2` · `3` · `4`
- `tone` — `neutral` · `accent` · `destructive` · `blue` · `green` · `orange` · `amber` · `pink` · `purple` · `success` · `warning` · `info`
- `emphasis` — `loud` · `medium` · `quiet`
- `material` — `1` · `2` · `3` · `4` · `5` · `6` · `7` · `8` · `9`
- `weight` — `regular` · `medium` · `semibold`
- `typeSize` — `1` · `2` · `3` · `4` · `5` · `6` · `7` · `8` · `9`
- `space` — `1` · `2` · `3` · `4` · `5` · `6` · `7` · `8` · `9` · `10` · `11` · `12`
- `marginSpace` — `1` · `2` · `3` · `4` · `5` · `6` · `7` · `8` · `9` · `10` · `11` · `12` · `bleed`
- `paddingSpace` — `1` · `2` · `3` · `4` · `5` · `6` · `7` · `8` · `9` · `10` · `11` · `12` · `bleed`

### Theme axes

Set on `<Theme>`, once, near the root. These are app identity, not per-call-site knobs.
The default is in brackets.

- `appearance` — `inherit` · `light` · `dark` (default `light`)
- `density` — `compact` · `default` · `comfortable` (default `default`)
- `radius` — `none` · `small` · `medium` · `large` · `full` (default `full`)
- `contrast` — `normal` · `high` (default `normal`)
- `size` — `1` · `2` · `3` · `4` (default `2`)
- `pointer` — `fine` · `coarse` · `auto` (default `auto`)
- `depth` — `flat` · `elevated` (default `elevated`)
- `material` — `1` · `2` · `3` · `4` · `5` · `6` · `7` · `8` · `9` (default `9`)

### Responsive tiers

Any responsive prop takes an object keyed by tier. Tiers are CONTAINER-keyed, so they
answer how much room the component has, not how wide the window is.

- `sm` — from 30rem
- `md` — from 48rem
- `lg` — from 64rem

```tsx
<Flex direction={{ initial: "column", md: "row" }} gap="4" />
```

## The components (186)

This list is closed. There are no deep imports — every symbol comes from
`@kushagradhawan/kookie-ui-react`. If what you want is not here, it is not there, and the answer is
composition rather than a wrapper that re-implements it.

`Accordion` · `AccordionItem` · `AccordionTrigger` · `AccordionPanel` · `AlertDialog` · `AlertDialogTrigger` · `AlertDialogContent` · `AlertDialogTitle` · `AlertDialogDescription` · `AlertDialogCancel` · `AlertDialogAction` · `Avatar` · `AvatarGroup` · `Attachment` · `Badge` · `Chip` · `Breadcrumb` · `BreadcrumbItem` · `BreadcrumbLink` · `BreadcrumbPage` · `BreadcrumbEllipsis` · `Blockquote` · `Box` · `Button` · `Card` · `Carousel` · `CarouselRail` · `CarouselItem` · `CarouselPrevious` · `CarouselNext` · `Checkbox` · `Code` · `CodeBlock` · `Field` · `FieldItem` · `FieldLabel` · `FieldDescription` · `FieldError` · `Combobox` · `ComboboxInput` · `ComboboxContent` · `ComboboxList` · `ComboboxCollection` · `ComboboxItem` · `ComboboxGroup` · `ComboboxLabel` · `ComboboxEmpty` · `Command` · `CommandTrigger` · `CommandContent` · `CommandInput` · `CommandList` · `CommandGroup` · `CommandGroupLabel` · `CommandCollection` · `CommandItem` · `CommandEmpty` · `Dialog` · `DialogTrigger` · `DialogContent` · `DialogTitle` · `DialogDescription` · `DialogClose` · `Heading` · `Kbd` · `Link` · `List` · `ListItem` · `ContextMenu` · `ContextMenuTrigger` · `ContextMenuContent` · `Menu` · `MenuTrigger` · `MenuContent` · `MenuItem` · `MenuGroup` · `MenuLabel` · `MenuCheckboxItem` · `MenuRadioGroup` · `MenuRadioItem` · `MenuSub` · `MenuSubTrigger` · `MenuSubContent` · `Select` · `SelectTrigger` · `SelectContent` · `SelectItem` · `SelectGroup` · `SelectLabel` · `Composer` · `ComposerInput` · `ComposerRow` · `ComposerSend` · `Confirmation` · `Notice` · `NumberField` · `NumberFieldGroup` · `Page` · `RowGroup` · `Navigator` · `NavigatorBack` · `NavigatorLink` · `NavigatorOutlet` · `NavigatorScreen` · `Toolbar` · `ToolbarGroup` · `ToolbarButton` · `ToolbarOverflow` · `ToolbarOverflowItem` · `ToolbarSeparator` · `ToolbarTitle` · `Popover` · `PopoverTrigger` · `PopoverContent` · `PopoverTitle` · `PopoverDescription` · `PopoverClose` · `Progress` · `MessageScroller` · `MessageScrollerContent` · `MessageScrollerItem` · `MessageScrollerButton` · `Radio` · `RadioGroup` · `Separator` · `Sheet` · `SheetTrigger` · `SheetContent` · `SheetTitle` · `SheetDescription` · `SheetClose` · `SegmentedControl` · `SegmentedItem` · `Row` · `Tree` · `NavTree` · `ScrollArea` · `Shell` · `ShellNotice` · `ShellHeader` · `ShellRail` · `ShellTabBar` · `ShellSidebar` · `ShellContent` · `ShellInspector` · `ShellBottom` · `ShellScroll` · `ShellPaneHeader` · `ShellPaneFooter` · `ShellRailAction` · `ShellRailItem` · `ShellRailList` · `ShellNavGroup` · `ShellNavItem` · `ShellTrigger` · `ShellBack` · `Slider` · `Switch` · `Table` · `TableHeader` · `TableBody` · `TableRow` · `TableHead` · `TableCell` · `TableCaption` · `Tabs` · `TabsList` · `TabsTab` · `TabsPanel` · `Toggle` · `ToggleGroup` · `ButtonGroup` · `SplitButton` · `Tooltip` · `TooltipProvider` · `TooltipTrigger` · `TooltipContent` · `Text` · `TextArea` · `TextField` · `Spinner` · `Surface` · `Flex` · `Grid` · `Stack` · `Theme`

Also exported, and not components:

`useNavigator` · `useToolbarOverflow` · `useMessageScroller` · `useMessageScrollerScrollable` · `useMessageScrollerVisibility` · `useTheme` · `useMaterial` · `themeDefaults` · `themeAxes` · `useSurface` · `useWindowClass` · `windowClassQueries` · `componentAxes` · `iconStroke` · `iconGrid` · `iconSize` · `tiers` · `tierNames`

## What each component refuses

These are decisions, not gaps. Asking for one of them is the most common way to write this
system wrong. The reason each one was refused is on the component's own page — see below.

- **Accordion** — A horizontal orientation; `tone` and `emphasis`; An icon slot or a custom chevron; A border or background of its own
- **AlertDialog** — A width prop; Closing on an outside press; Header and footer parts; `render` on Cancel and Action; Arbitrary `children`
- **Attachment** — A done state; `tone`; Holding the file; A built-in preview; `emphasis`; A shadow; `render`
- **Avatar** — A shape prop; `emphasis`; `tone`; Built-in status words; A press; A maximum count on the group
- **AvatarGroup** — A maximum count; A spacing prop
- **Badge** — `emphasis`; Built-in status words; An unnamed dot; A position of its own
- **Blockquote** — A coloured line; An attribution slot
- **Box** — Utility classes; A separate bleed prop; Containment by default
- **Breadcrumb** — `BreadcrumbSeparator`; `BreadcrumbList`; `tone` and `emphasis`; `maxItems` and any automatic collapse; An ellipsis that does nothing; Role=link and aria-disabled on the current page
- **Button** — `margin`; `variant`; A shadow prop
- **ButtonGroup** — A separator part; `tone` and `emphasis` on the group
- **Card** — A `selected` prop, and an `interactive` one; A card inside a card; A material prop; Tone, emphasis and bordered; A media or cover slot; Header and footer slots
- **Carousel** — Autoplay; Looping; Drag to scroll; A width, a gap or an aspect ratio for the items; `orientation`; Dots under the rail
- **Checkbox** — `tone` and `emphasis`; `children`; `readOnly`
- **Chip** — A louder fill, or a `variant` prop; A remove button; A count prop; A position of its own; An empty chip
- **Code** — A fill that gets louder with emphasis; Block code
- **CodeBlock** — Highlighting; A switch for wrapping; A copy button, line numbers, and a collapse; `tone` and `emphasis`; A Card as the panel
- **Combobox** — Free text with suggestions; `multiple`; A custom matcher, a result limit and inline completion; `disabled`, `readOnly`, `name`, `required` and `form` on the input; A Separator inside the panel; `render` on the input; A clear button
- **Command** — A footer; `modal`; Re-sorting results as you type; A Separator inside the panel; An edge-to-edge results panel
- **Composer** — The conversation; Keeping the conversation scrolled to the bottom; An attach button; Holding the files; Named slots for the start and end of the row; `submitOnEnter`
- **ContextMenu** — `ContextMenuItem` and a second set of parts; `side`, `align` and an offset; A style for the trigger area; Opening on a left click
- **Dialog** — `DialogHeader` and `DialogFooter`; A prop to choose the presentation, and dragging to close; A height prop; A close button in the corner; `modal` and `disablePointerDismissal`; A shadow of its own; `size` on the title
- **Field** — `FieldControl`; `orientation`; A choice about where the error goes; An error that replaces the description; `Form`
- **Flex** — `margin` on the children
- **Grid** — Shortcut props for auto-placement
- **Heading** — A `level` prop
- **Kbd** — A shadow that follows `depth`
- **Link** — `emphasis`; A style for visited links; An underline that shows only on hover; A larger tap area
- **List** — A custom marker; `render`; A `gap` or density prop; A description list
- **Menu** — `emphasis` on rows; A Shortcut part; `MenuSeparator`; An `inset` prop; `modal` and `openOnHover`; An arrow, a backdrop, a scroll viewport and collision settings
- **MessageScroller** — `size`; A viewport of its own; A default label for the jump button
- **Navigator** — A Navigator inside a Page; A Navigator inside another Navigator in the same region; Escape to go back; A disabled Back on the root; A URL
- **NavTree** — `role="tree"`; Selection; Arrow-key navigation; An `indent` prop
- **Notice** — A position, and a Banner component; A toast, or any Notice that disappears on its own; A title and description; More than one action; Remembering its own dismissal; A shadow; Built-in icons; A ✕ on a Confirmation
- **NumberField** — `leading` and `trailing`; `emphasis` and `tone`; `render`; The browser's number input; Dragging or scrolling to change the value
- **Page** — A heading level; `size`; Actions beside the title; A width; Collapsing into a toolbar outside a Shell
- **Popover** — A modal mode; An arrow; Free positioning; A width that matches the trigger; A built-in close button
- **Progress** — `size`; `tone`
- **Radio** — `tone` and `emphasis`; `readOnly`
- **RadioGroup** — Visual props; `readOnly`
- **Row** — `emphasis`; A keyboard model; A `selected` prop; A List component; The shorter height of a menu row
- **RowGroup** — Its own row props; A divider style; A header action
- **ScrollArea** — `size`; `tone` and `emphasis`; `material`; `render`; `orientation`
- **SegmentedControl** — `tone` and `emphasis`; Selecting more than one option; `nativeButton` and `render`; `readOnly`
- **Select** — `readOnly`; A Separator inside the panel; `emphasis` and `tone` on the trigger; A `SelectValue` part; `render` and `children` on the trigger; Scroll arrows; `multiple`
- **Separator** — `children`; A length prop; `decorative`
- **Sheet** — A top side, and a physical left or right; Header and footer parts, and a close button in the corner; `modal` and `disablePointerDismissal`; Snap points, and a swipe that opens the sheet; A sheet inside a sheet; `tone` and `emphasis`; An extra shadow
- **Shell** — A `gap` prop; A header position option; A narrow mode for the sidebar; Closing the sidebar together with the rail; A half-open `peek` state; An action on `ShellRailItem`; `backdrop` on `ShellContent`; A tab bar built from the sidebar; A tab bar that changes what the sidebar shows; A `presentation` value for floating panes
- **Slider** — `tone` and `emphasis`; `orientation`
- **Spinner** — A size prop; A colour prop
- **SplitButton** — `iconOnly`; `render`
- **Stack** — `dividers`
- **Surface** — A fill or an edge prop; A border toggle; `material` and `backdrop`; Tone, emphasis and a shadow
- **Switch** — `tone` and `emphasis`; `children`; `readOnly`
- **Table** — A ScrollArea around it; Hover, selection and a press on rows; `tone` and `emphasis`; A sticky header; Sorting and column controls
- **Tabs** — `tone` and `emphasis`; TabsTrigger and TabsContent; `material`; An indicator part
- **Text** — A colour prop; `margin`; `bold` (700)
- **TextArea** — `emphasis` and `tone`; `resize`; `cols`; `render`
- **TextField** — `emphasis` and `tone`; `render`
- **Theme** — An `accentColor` prop; A `scaling` prop; A shadow or elevation prop on components; An outlined or filled style
- **Toggle** — `emphasis`; `loading`; A single-select group; `render`
- **Toolbar** — `tone`, `emphasis` and `material` on the row; Leading, centre and trailing parts; `size` on a group; A `gap` prop
- **Tooltip** — Content that is not a string; A size; `tone` and `emphasis`; A delay you set per tooltip; Support for touch screens; A material; An arrow
- **Tree** — Drag to reorder; Selecting a folder's children with it; Loading children on demand; Renaming in place; JSX children; An `indent` prop

## Looking one up

Read the local files first. They match the installed version and need no network.

- `node_modules/@kushagradhawan/kookie-ui-react/agents/docs/components/<name>.md`: one component, with its props, its examples
  and the reason behind every refusal above.
- `node_modules/@kushagradhawan/kookie-ui-react/dist/**/*.d.ts`: every exported symbol carries
  the reasoning on its declaration.

A PART IS DOCUMENTED ON ITS PARENT'S PAGE, so the file is the ROOT component's export name
in kebab-case: `SegmentedControl` is `components/segmented-control.md`, and `MenuItem`,
`ToolbarButton` and `DialogTitle` are in `components/menu.md`, `components/toolbar.md`
and `components/dialog.md`. The roots are the names above with no parent listed beside
them; asking the MCP server resolves either kind.

The docs site serves the same pages: add `.md` to any page's path. `<docs-site>/llms.txt`
lists every page, and `<docs-site>/llms-full.txt` holds the whole site in one fetch.
