<!-- GENERATED — do not edit. Source: packages/ui/src/index.ts, packages/ui/src/system/axes.ts,
     packages/ui/src/theme/theme.tsx, apps/docs/app/(docs)/components/registry.ts,
     apps/docs/app/(docs)/markdown.ts and apps/docs/app/(docs)/chapters.ts, via
     apps/docs/scripts/generate-agents.ts, which also writes agents/docs/.
     Regenerate with `pnpm --filter docs run agents`. A law regenerates and compares. -->

# KookieUI, for coding agents

Rules for writing `@kushagradhawan/kookie-ui-react`. Its API is not the one you remember from
Radix Themes, shadcn or MUI, so read this before you write a component.

## Before you build, read the page

The docs for the installed version ship in the package, at
`node_modules/@kushagradhawan/kookie-ui-react/agents/docs/`.
Open the page for your task by its path before you write code. File search skips
`node_modules`, so use the path.

- Any screen with more than one component: `start/composition.md`
- A form, a settings page, or any field with a label: `patterns/forms.md`
- A dialog, alert, popover, menu or sheet: `patterns/modality.md`
- The app frame, page titles and tabs between pages: `patterns/navigation.md`
- Loading, progress, success, error and empty states: `patterns/feedback.md`
- A layout that changes with space, or a touch target: `patterns/responsiveness.md`

Every other page is in the same folder. A link to `/patterns/forms` inside a page is the
file `patterns/forms.md`.

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
- `tone` — `neutral` · `accent` · `destructive` · `blue` · `green` · `orange` · `amber` · `success` · `warning` · `info`
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

## The components (176)

This list is closed. There are no deep imports — every symbol comes from
`@kushagradhawan/kookie-ui-react`. If what you want is not here, it is not there, and the answer is
composition rather than a wrapper that re-implements it.

`Accordion` · `AccordionItem` · `AccordionTrigger` · `AccordionPanel` · `AlertDialog` · `AlertDialogTrigger` · `AlertDialogContent` · `AlertDialogTitle` · `AlertDialogDescription` · `AlertDialogCancel` · `AlertDialogAction` · `Avatar` · `AvatarGroup` · `Attachment` · `Badge` · `Chip` · `Breadcrumb` · `BreadcrumbItem` · `BreadcrumbLink` · `BreadcrumbPage` · `BreadcrumbEllipsis` · `Blockquote` · `Box` · `Button` · `Card` · `Carousel` · `CarouselRail` · `CarouselItem` · `CarouselPrevious` · `CarouselNext` · `Checkbox` · `Code` · `CodeBlock` · `Field` · `FieldItem` · `FieldLabel` · `FieldDescription` · `FieldError` · `Combobox` · `ComboboxInput` · `ComboboxContent` · `ComboboxList` · `ComboboxCollection` · `ComboboxItem` · `ComboboxGroup` · `ComboboxLabel` · `ComboboxEmpty` · `Command` · `CommandTrigger` · `CommandContent` · `CommandInput` · `CommandList` · `CommandGroup` · `CommandGroupLabel` · `CommandCollection` · `CommandItem` · `CommandEmpty` · `Dialog` · `DialogTrigger` · `DialogContent` · `DialogTitle` · `DialogDescription` · `DialogClose` · `Heading` · `Kbd` · `Link` · `List` · `ListItem` · `ContextMenu` · `ContextMenuTrigger` · `ContextMenuContent` · `Menu` · `MenuTrigger` · `MenuContent` · `MenuItem` · `MenuGroup` · `MenuLabel` · `MenuCheckboxItem` · `MenuRadioGroup` · `MenuRadioItem` · `MenuSub` · `MenuSubTrigger` · `MenuSubContent` · `Select` · `SelectTrigger` · `SelectContent` · `SelectItem` · `SelectGroup` · `SelectLabel` · `Composer` · `ComposerInput` · `ComposerRow` · `ComposerSend` · `Confirmation` · `Notice` · `NumberField` · `Page` · `Toolbar` · `ToolbarGroup` · `ToolbarButton` · `ToolbarOverflow` · `ToolbarSeparator` · `ToolbarTitle` · `Popover` · `PopoverTrigger` · `PopoverContent` · `PopoverTitle` · `PopoverDescription` · `PopoverClose` · `Progress` · `MessageScroller` · `MessageScrollerContent` · `MessageScrollerItem` · `MessageScrollerButton` · `Radio` · `RadioGroup` · `Separator` · `Sheet` · `SheetTrigger` · `SheetContent` · `SheetTitle` · `SheetDescription` · `SheetClose` · `SegmentedControl` · `SegmentedItem` · `Row` · `Tree` · `NavTree` · `ScrollArea` · `Shell` · `ShellHeader` · `ShellRail` · `ShellTabBar` · `ShellSidebar` · `ShellContent` · `ShellInspector` · `ShellBottom` · `ShellScroll` · `ShellPaneHeader` · `ShellPaneFooter` · `ShellRailAction` · `ShellRailItem` · `ShellRailList` · `ShellNavGroup` · `ShellNavItem` · `ShellTrigger` · `Slider` · `Switch` · `Table` · `TableHeader` · `TableBody` · `TableRow` · `TableHead` · `TableCell` · `TableCaption` · `Tabs` · `TabsList` · `TabsTab` · `TabsPanel` · `Toggle` · `ToggleGroup` · `ButtonGroup` · `SplitButton` · `Tooltip` · `TooltipProvider` · `TooltipTrigger` · `TooltipContent` · `Text` · `TextArea` · `TextField` · `Spinner` · `Surface` · `Flex` · `Grid` · `Stack` · `Theme`

Also exported, and not components:

`useToolbarOverflow` · `useMessageScroller` · `useMessageScrollerScrollable` · `useMessageScrollerVisibility` · `useTheme` · `useMaterial` · `themeDefaults` · `themeAxes` · `useWindowClass` · `windowClassQueries` · `componentAxes` · `iconStroke` · `iconGrid` · `tiers` · `tierNames`

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
- **Composer** — The conversation; Keeping the conversation scrolled to the bottom; An attach button; Holding the files; Named slots for the start and end of the row; A compact or collapsed mode; `submitOnEnter`
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
- **NavTree** — `role="tree"`; Selection; Arrow-key navigation; An `indent` prop
- **Notice** — A position, and a Banner component; A toast, or any Notice that disappears on its own; A title and description; More than one action; Remembering its own dismissal; A shadow; Built-in icons; A ✕ on a Confirmation
- **NumberField** — `leading` and `trailing`; `emphasis` and `tone`; `render`; The browser's number input; Dragging or scrolling to change the value
- **Page** — A heading level; `size`; Actions beside the title; A width; Collapsing into a toolbar outside a Shell
- **Popover** — A modal mode; An arrow; Free positioning; A width that matches the trigger; A built-in close button
- **Progress** — `size`; `tone`
- **Radio** — `tone` and `emphasis`; `readOnly`
- **RadioGroup** — Visual props; `readOnly`
- **Row** — `emphasis`; A keyboard model; A `selected` prop; A List component; The shorter height of a menu row
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
