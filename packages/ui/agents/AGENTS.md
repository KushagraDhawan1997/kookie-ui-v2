<!-- GENERATED — do not edit. Source: packages/ui/src/index.ts, packages/ui/src/system/axes.ts,
     packages/ui/src/theme/theme.tsx, apps/docs/app/(docs)/components/registry.ts and
     apps/docs/app/(docs)/markdown.ts, via apps/docs/scripts/generate-agents.ts.
     Regenerate with `pnpm --filter docs run agents`. A law regenerates and compares. -->

# KookieUI, for coding agents

Rules for writing `@kookie-ui/react`. Read this before writing a component; it is short
because it only carries what a lookup cannot tell you.

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

Do not reach for `className` to get past a refusal. Utility classes are not shipped and
there is nothing for them to hook onto. If a value you need has no index, that is a finding
for the system, not a decision for the call site.

### Component axes

Every legal value. A value outside these lists does not compile.

- `size` — `1` · `2` · `3` · `4`
- `tone` — `neutral` · `accent` · `destructive` · `blue` · `green` · `orange` · `amber` · `success` · `warning` · `info`
- `emphasis` — `loud` · `medium` · `quiet`
- `material` — `solid` · `thin` · `regular` · `thick`
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
- `material` — `solid` · `thin` · `regular` · `thick` (default `solid`)

### Responsive tiers

Any responsive prop takes an object keyed by tier. Tiers are CONTAINER-keyed, so they
answer how much room the component has, not how wide the window is.

- `sm` — from 30rem
- `md` — from 48rem
- `lg` — from 64rem

```tsx
<Flex direction={{ initial: "column", md: "row" }} gap="4" />
```

## The components (144)

This list is closed. There are no deep imports — every symbol comes from
`@kookie-ui/react`. If what you want is not here, it is not there, and the answer is
composition rather than a wrapper that re-implements it.

`Accordion` · `AccordionItem` · `AccordionTrigger` · `AccordionPanel` · `AlertDialog` · `AlertDialogTrigger` · `AlertDialogContent` · `AlertDialogTitle` · `AlertDialogDescription` · `AlertDialogCancel` · `AlertDialogAction` · `Avatar` · `AvatarGroup` · `Attachment` · `Badge` · `Chip` · `Breadcrumb` · `BreadcrumbItem` · `BreadcrumbLink` · `BreadcrumbPage` · `BreadcrumbEllipsis` · `Blockquote` · `Box` · `Button` · `Card` · `Checkbox` · `Code` · `CodeBlock` · `Field` · `FieldItem` · `FieldLabel` · `FieldDescription` · `FieldError` · `Command` · `CommandTrigger` · `CommandContent` · `CommandInput` · `CommandList` · `CommandGroup` · `CommandGroupLabel` · `CommandCollection` · `CommandItem` · `CommandEmpty` · `Dialog` · `DialogTrigger` · `DialogContent` · `DialogTitle` · `DialogDescription` · `DialogClose` · `Heading` · `Kbd` · `Link` · `ContextMenu` · `ContextMenuTrigger` · `ContextMenuContent` · `Menu` · `MenuTrigger` · `MenuContent` · `MenuItem` · `MenuGroup` · `MenuLabel` · `MenuCheckboxItem` · `MenuRadioGroup` · `MenuRadioItem` · `MenuSub` · `MenuSubTrigger` · `MenuSubContent` · `Select` · `SelectTrigger` · `SelectContent` · `SelectItem` · `SelectGroup` · `SelectLabel` · `Composer` · `ComposerInput` · `ComposerRow` · `ComposerSend` · `Notice` · `Page` · `Toolbar` · `ToolbarGroup` · `ToolbarButton` · `ToolbarOverflow` · `ToolbarSeparator` · `ToolbarTitle` · `Popover` · `PopoverTrigger` · `PopoverContent` · `PopoverTitle` · `PopoverDescription` · `PopoverClose` · `Progress` · `Radio` · `RadioGroup` · `Separator` · `SegmentedControl` · `SegmentedItem` · `Row` · `Tree` · `NavTree` · `ScrollArea` · `Shell` · `ShellHeader` · `ShellRail` · `ShellSidebar` · `ShellContent` · `ShellInspector` · `ShellBottom` · `ShellScroll` · `ShellPaneHeader` · `ShellPaneFooter` · `ShellRailItem` · `ShellRailList` · `ShellNavGroup` · `ShellNavItem` · `ShellTrigger` · `Slider` · `Switch` · `Table` · `TableHeader` · `TableBody` · `TableRow` · `TableHead` · `TableCell` · `TableCaption` · `Tabs` · `TabsList` · `TabsTab` · `TabsPanel` · `Toggle` · `ToggleGroup` · `Tooltip` · `TooltipProvider` · `TooltipTrigger` · `TooltipContent` · `Text` · `TextArea` · `TextField` · `Spinner` · `Surface` · `Flex` · `Grid` · `Stack` · `Theme`

Also exported, and not components:

`useToolbarOverflow` · `useTheme` · `useMaterial` · `themeDefaults` · `themeAxes` · `useWindowClass` · `windowClassQueries` · `componentAxes` · `iconStroke` · `iconGrid` · `tiers` · `tierNames`

## What each component refuses

These are decisions, not gaps. Asking for one of them is the most common way to write this
system wrong. The reason each one was refused is on the component's own page — see below.

- **Accordion** — A horizontal orientation; `tone` and `emphasis`; An icon slot or a custom chevron; A boundary of its own
- **AlertDialog** — A width prop; Closing on an outside press; Header and Footer; `render` on Cancel and Action; Arbitrary `children`
- **Attachment** — A done state; `tone`; Holding the file; A built-in preview; `emphasis`; A shadow; `render`
- **Avatar** — A shape prop; `emphasis`; `tone`; A status vocabulary; A press; A max count on the group
- **AvatarGroup** — A max count; A spacing prop
- **Badge** — `emphasis`; A status vocabulary; An unnamed dot; A position of its own
- **Blockquote** — A tinted rule; An attribution slot
- **Box** — Utility classes; A bleed prop; Containment by default
- **Breadcrumb** — `BreadcrumbSeparator`; `BreadcrumbList`; `tone` and `emphasis`; `maxItems` and any automatic collapse; An ellipsis that does nothing; Role=link and aria-disabled on the current page
- **Button** — `margin`; `variant`; A shadow prop
- **Card** — A `selected` prop, and an `interactive` one; A card inside a card; A material prop; Tone, emphasis and bordered; A media or cover slot; Header and footer slots
- **Checkbox** — `tone` and `emphasis`; `children`; `readOnly`
- **Chip** — A fill scale, or a variant prop; A dismissal; A count prop; A position; An empty chip
- **Code** — A fill that gets louder with emphasis; Block code
- **CodeBlock** — Highlighting; A switch for wrapping; A copy button, line numbers, and a collapse; `tone` and `emphasis`; A Card as the pane
- **Command** — A footer; `modal`; Fuzzy reordering as you type; A Separator inside the panel; An edge-to-edge panel
- **Composer** — The conversation, and every part of it; The scroller; An attach button; Owning the files; A row of slots; A compact or collapsed mode; `submitOnEnter`
- **ContextMenu** — A parallel set of parts; Side, align and an offset; An appearance for the region; Opening on a left click
- **Dialog** — Header and Footer; A presentation prop, and a drag; A height prop; A close button in the corner; `modal` and `disablePointerDismissal`; A shadow; A size on the title
- **Field** — `FieldControl`; `orientation`; A choice about where the error goes; An error that replaces the description; `Form`
- **Flex** — `margin` on children
- **Grid** — Auto-placement helpers
- **Heading** — A level prop
- **Kbd** — A shadow that follows Theme depth
- **Link** — `emphasis`; A :visited style; A hover-only underline; A target of its own
- **Menu** — `emphasis` on rows; A Shortcut part; `MenuSeparator`; An inset prop; `modal` and `openOnHover`; Arrow, Backdrop, Viewport, LinkItem and collision knobs
- **NavTree** — Role="tree"; Selection; The tree keyboard; An indent prop
- **Notice** — A position, and the name Banner; Toast, and any transient version of this; A title, a description and any fixed anatomy; More than one action; Remembering its own dismissal; A shadow; An icon set
- **Page** — A heading level; A size; Actions beside the title; A width; Collapsing on its own outside a frame
- **Popover** — A modal mode; An arrow; Free positioning; A width that matches the trigger; A drawn close button
- **Progress** — `size`; `tone`
- **Radio** — `tone` and `emphasis`; `readOnly`
- **RadioGroup** — Any visual prop
- **Row** — `emphasis`; A keyboard model; A selected prop; A List component to put these in; The menu row's tighter box
- **ScrollArea** — `size`; `tone` and `emphasis`; `material`; `render`; `orientation`
- **SegmentedControl** — `tone` and `emphasis`; An exported thumb; Multi-select; `nativeButton` and `render`; `readOnly`
- **Select** — `readOnly`; A Separator inside the panel; `emphasis` and `tone` on the trigger; SelectValue as a part; `render` and `children` on the trigger; The scroll arrows; `multiple`
- **Separator** — `children`; A length prop; `decorative`
- **Shell** — A gap prop; A header position axis; A thin sidebar mode; A close-cascade between rail and sidebar; `peek`; `backdrop` on `ShellContent`; A floating or stacked presentation value
- **Slider** — `tone` and `emphasis`; `orientation`
- **Spinner** — A size prop; A colour prop
- **Stack** — `dividers`
- **Surface** — A fill or an edge prop; A border toggle; `material` and `backdrop`; Tone, emphasis and a shadow
- **Switch** — `tone` and `emphasis`; `children`; `readOnly`
- **Table** — A ScrollArea around it; Hover, selection and a press on rows; `tone` and `emphasis`; A sticky header; Sorting and column controls
- **Tabs** — `tone` and `emphasis`; TabsTrigger and TabsContent; `material`; An exported indicator
- **Text** — A colour prop; `margin`; `bold` (700)
- **TextArea** — `emphasis` and `tone`; `resize`; `cols`; `render`
- **TextField** — `emphasis` and `tone`; `render`
- **Theme** — An `accentColor` prop; A scale prop; An elevation axis; A look axis
- **Toggle** — `emphasis`; `loading`; A single-select group; `render`
- **Toolbar** — Tone, emphasis and material on the ROW; A breakpoint on the overflow; Leading, centre and trailing parts; A size on the group; A gap prop
- **Tooltip** — Content that is not a string; A size; `tone` and `emphasis`; A delay you set per tooltip; A touch story; A material; An arrow
- **Tree** — Drag to reorder; Cascade selection; Async children and loading states; Rename-in-place; JSX children; An indent prop

## Looking one up

Every page of the KookieUI docs site is served a second time as plain markdown at the same
path with `.md` on the end. That twin carries the component's abstract, its generated prop
table, its examples and the reason behind every refusal above.

- `<docs-site>/components/<name>.md` — one component
- `<docs-site>/llms.txt` — an index of every page
- `<docs-site>/llms-full.txt` — the whole site in one fetch

A PART IS DOCUMENTED ON ITS PARENT'S PAGE, so the slug is the ROOT component's export name
in kebab-case: `SegmentedControl` is `/components/segmented-control.md`, and `MenuItem`,
`ToolbarButton` and `DialogTitle` are on `/components/menu.md`, `/components/toolbar.md`
and `/components/dialog.md`. The roots are the names above with no parent listed beside
them; asking the MCP server resolves either kind.

The types are the other reference and they need no network: every exported symbol in
`node_modules/@kookie-ui/react/dist/**/*.d.ts` carries the reasoning on the declaration.
