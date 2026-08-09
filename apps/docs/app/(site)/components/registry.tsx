/**
 * The component reference, as DATA (ENGINEERING §1.1: the system is data, code is a small
 * interpreter). One entry per exported component; the page is a renderer over these entries,
 * so adding a component means adding a row rather than writing a page.
 *
 * The section that matters most here is `refusals`. What a component will not do is the
 * system's actual argument — margin, `variant`, a shadow prop, a size on a hairline — and it
 * is the part no generated API table can carry, because a missing prop looks the same as an
 * oversight until someone writes down which it is. Every refusal names its reason.
 *
 * A law (`registry.test.ts`) walks the package's exports against this file, so a component
 * cannot ship undocumented — the same shape as the playground law, for the same reason.
 */
import * as React from "react";
import {
  Blockquote,
  Box,
  Button,
  Card,
  Checkbox,
  Code,
  Flex,
  Grid,
  Heading,
  Kbd,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuGroup,
  MenuLabel,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  Progress,
  Radio,
  RadioGroup,
  Separator,
  Slider,
  Spinner,
  Stack,
  Switch,
  Text,
  TextArea,
  TextField,
  Theme,
} from "@kookie-ui/react";

export type Entry = {
  /** URL segment. */
  slug: string;
  /** The exported name, and the key the coverage law matches on. */
  name: string;
  /** Which family it belongs to — the §11 grouping. */
  family: "Layout" | "Control" | "Surface" | "Type" | "Indicator";
  /** DECISIONS.md sections this component implements. */
  spec: string;
  /** What it is, in two or three sentences. */
  blurb: string;
  /** The axes it exposes, with what each resolves to here. */
  axes: { name: string; values: string; note: string }[];
  /** What it refuses, and why. The system's argument. */
  refusals: { name: string; why: string }[];
  /** Parts of a compound component (§22): exports explained here rather than on stub pages
      of their own. The coverage law accepts either home, and holds part blurbs to a floor. */
  parts?: { part: string; blurb: string }[];
  /** A live specimen. */
  example: React.ReactNode;
};

export const ENTRIES: Entry[] = [
  {
    slug: "blockquote",
    name: "Blockquote",
    family: "Type",
    spec: "§11, §15",
    blurb:
      "Body copy set apart by a rule and an indent. Everything about how it reads comes from the shared type layer; what it adds is the quiet hairline down its leading edge and the indent that keeps the words off it.",
    axes: [
      { name: "size", values: "1–9", note: "anchors at 3 — a quote is a block, so it states its own step" },
      { name: "weight", values: "regular | medium | semibold | bold", note: "token names, never numbers" },
      { name: "emphasis", values: "loud | medium | quiet", note: "the foreground roles; rests loud" },
      { name: "tone", values: "any family", note: "re-scopes the ink trio — and only the ink" },
    ],
    refusals: [
      {
        name: "a tinted rule",
        why: "A chosen tone moves the words, not the bar. §7's edge order puts a quote's rule where a separator's sits — under both solved tiers, carrying no identity. A quote whose bar must carry meaning is a Callout.",
      },
      {
        name: "an attribution slot",
        why: "The footer under a quote is a sibling <Text>. Anatomy is system-owned only where something non-visual forces it, and nothing here does.",
      },
    ],
    example: (
      <Stack gap="3">
        <Blockquote size="3">
          Taste is the last layer. If the infrastructure is right, taste can be added later.
        </Blockquote>
        <Text size="1" emphasis="medium">— the standing rule</Text>
      </Stack>
    ),
  },
  {
    slug: "box",
    name: "Box",
    family: "Layout",
    spec: "§2, §3",
    blurb:
      "The layout engine every other primitive is typed sugar over. It accepts the full curated prop set — spacing, sizing, display, container props — each resolving through tokens, each responsive via container tiers rather than utility classes.",
    axes: [
      { name: "p / m / px / py …", values: "layout space steps", note: "the density-aware layer, never the raw palette" },
      { name: "any prop", values: "value | { initial, sm, md, lg }", note: "container-query tiers, compiled to variable remaps" },
      {
        name: "container",
        values: "boolean",
        note: "makes THIS Box the region responsive values inside it measure; absent, they measure the nearest marked ancestor, ultimately the Theme root",
      },
    ],
    refusals: [
      {
        name: "utility classes",
        why: "Values ride inline custom properties into fixed arbitration rules, so tokens and raw strings cost the same and the stylesheet never grows with the value set.",
      },
      {
        name: "containment by default",
        why: "It shipped that way and was the recorded zero-width defect: a measurable box can never size itself around its contents (the no-loop rule container queries are built on), so every Box in a flex row collapsed to nothing. A plain Box hugs like a div; `container` opts in, and belongs on things layout already sizes — a sidebar with a width, a growing column, a grid cell. A container Box left to shrink-wrap renders 0px wide, and dev builds warn when it happens.",
      },
    ],
    example: (
      <Box p="5" style={{ background: "var(--color-track)", borderRadius: "var(--radius-surface-2)" }}>
        <Text size="2">A Box with token padding.</Text>
      </Box>
    ),
  },
  {
    slug: "button",
    name: "Button",
    family: "Control",
    spec: "§4, §8, §9",
    blurb:
      "The control layer's first citizen, and the component the shared skeleton was written for. Loudness is the only ranking axis; appearance is always the resolved output of tone × emphasis × bordered × material, never set directly.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "an index into the height ladder, not a measurement" },
      { name: "tone", values: "any family", note: "picks the hue; accent resolves through the Theme" },
      { name: "emphasis", values: "loud | medium | quiet", note: "three rungs, because a rung must earn a visible step" },
      { name: "bordered", values: "boolean", note: "containment, and honestly half a rung: medium+bordered reads louder than medium" },
      { name: "material", values: "solid | thin | regular | thick", note: "backdrop defense; correct only over media or scrolling content" },
      { name: "leading / trailing", values: "ReactNode", note: "an icon, or a whole hosted control" },
    ],
    refusals: [
      { name: "margin", why: "Components never own outer spacing. The escape is <Box m>." },
      {
        name: "variant",
        why: "It fuses loudness with meaning, so it cannot express a quiet destructive action. tone and emphasis are separate axes for exactly that reason.",
      },
      {
        name: "a shadow prop",
        why: "Elevation is deleted. Depth is an app identity, set once by Theme surfaces, never chosen per call site.",
      },
    ],
    example: (
      <Flex gap="3" wrap="wrap" align="center">
        <Button tone="accent" emphasis="loud">Save</Button>
        <Button emphasis="medium">Cancel</Button>
        <Button emphasis="quiet" bordered>More</Button>
        <Button tone="destructive" emphasis="quiet">Delete</Button>
      </Flex>
    ),
  },
  {
    slug: "card",
    name: "Card",
    family: "Surface",
    spec: "§9, §10",
    blurb:
      "A shell, deliberately: one fixed treatment — an opaque seal and a border — with size and material as its only props, and no stylesheet of its own. It was stripped back to this on the finding that a card with tone, emphasis and anatomy slots was a layout pretending to be a component.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "padding and corner, not height" },
      { name: "material", values: "solid | thin | regular | thick", note: "the seal, or glass over what scrolls behind it" },
    ],
    refusals: [
      {
        name: "tone, emphasis, bordered",
        why: "A card ranks nothing against its siblings. Its border is identity, not a rung.",
      },
      {
        name: "header / footer slots",
        why: "Anatomy is system-owned only where something non-visual forces it — Dialog's focus wiring, Callout's status role. A card's regions are a layout, and layouts are blocks.",
      },
    ],
    example: (
      <Card size="3">
        <Stack gap="2">
          <Text size="3" weight="medium">A card is a shell</Text>
          <Text size="2" emphasis="medium">Everything inside it is composition.</Text>
        </Stack>
      </Card>
    ),
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    family: "Control",
    spec: "§4, §6, §11",
    blurb:
      "The first control that is its own mark. Its box is one line of its label's type, so it aligns with the text beside it by construction and grows on a phone with nothing designed twice — and its hit area extends to a control of its size, painted or not.",
    axes: [{ name: "size", values: "1 | 2 | 3 | 4", note: "an index into the mark ladder, which is the line-height ladder" }],
    refusals: [
      {
        name: "tone and emphasis",
        why: "Neutral off, accent on is an identity, not an axis — the family has one meaning and one way to show it.",
      },
      {
        name: "children",
        why: "A mark sits beside its label, so the label is a sibling and the row owns the space between them.",
      },
      {
        name: "readOnly",
        why: "The platform does not define it for checkboxes, and every library that accepts it draws it identically to a live control. A state with no appearance is worse than no state.",
      },
    ],
    example: (
      <Stack gap="3">
        <Flex gap="3" align="center">
          <Checkbox defaultChecked id="c1" />
          <Text size="2" render={<label htmlFor="c1" />}>Ship it</Text>
        </Flex>
        <Flex gap="3" align="center">
          <Checkbox id="c2" />
          <Text size="2" render={<label htmlFor="c2" />}>Hold for review</Text>
        </Flex>
      </Stack>
    ),
  },
  {
    slug: "code",
    name: "Code",
    family: "Type",
    spec: "§11, §15",
    blurb:
      "Inline code: the type system's mono family slot wearing a subtle fill. Its size is optional and unset means the line it sits in, so a literal inside small text stays small without the call site repeating the index.",
    axes: [
      { name: "size", values: "1–9, optional", note: "unset inherits the surrounding line — the atom's own rule" },
      { name: "emphasis", values: "loud | medium | quiet", note: "the ink's axis, not the fill's" },
      { name: "tone", values: "any family", note: "moves both the ink and the fill" },
    ],
    refusals: [
      {
        name: "a fill that climbs the ladder",
        why: "Emphasis resolves for type as foreground roles. A chip whose fill also climbed would be reading one axis two ways in one element.",
      },
      {
        name: "block code",
        why: "A code block owns overflow, wrapping and a scroll container. It is a different component, not a mode of this one.",
      },
    ],
    example: (
      <Stack gap="3">
        <Text size="3">
          Run <Code>pnpm run ci</Code> before claiming a task done.
        </Text>
        <Text size="1">
          The flag is <Code>--experimental-strip-types</Code>.
        </Text>
      </Stack>
    ),
  },
  {
    slug: "flex",
    name: "Flex",
    family: "Layout",
    spec: "§3",
    blurb:
      "Box with display: flex preset and the flex props narrowed. It ships no CSS of its own — the named primitives are where the library adds enforcement over raw CSS, not decoration on top of it.",
    axes: [
      { name: "direction / align / justify / wrap", values: "the flex vocabulary", note: "responsive like every curated prop" },
      { name: "gap", values: "layout space steps", note: "the distance between things, always through the density-aware layer" },
    ],
    refusals: [{ name: "margin on children", why: "Distance between siblings is the container's gap, so it is stated once and cannot drift." }],
    example: (
      <Flex gap="4" align="center">
        <Button size="2">One</Button>
        <Button size="2">Two</Button>
        <Button size="2">Three</Button>
      </Flex>
    ),
  },
  {
    slug: "grid",
    name: "Grid",
    family: "Layout",
    spec: "§3",
    blurb: "Box with display: grid preset and the grid props narrowed. Same mechanism as Flex, same zero additional CSS.",
    axes: [
      { name: "columns / rows", values: "track lists", note: "raw track strings ride the same pipe as tokens" },
      { name: "gap / gapX / gapY", values: "layout space steps", note: "" },
    ],
    refusals: [{ name: "auto-placement helpers", why: "A prop earns existence only if it adds token resolution, tiers or constraint. Everything else is style." }],
    example: (
      <Grid columns="repeat(3, minmax(0, 1fr))" gap="3">
        <Button size="1">A</Button>
        <Button size="1">B</Button>
        <Button size="1">C</Button>
      </Grid>
    ),
  },
  {
    slug: "heading",
    name: "Heading",
    family: "Type",
    spec: "§15",
    blurb:
      "The heading family slot on the same nine-step ramp Text uses. Visual size and outline level are independent axes on purpose: size prices the type, render names the document structure.",
    axes: [
      { name: "size", values: "1–9", note: "defaults to 6 — the level a section actually reaches for" },
      { name: "weight", values: "regular | medium | semibold | bold", note: "defaults to bold" },
      { name: "emphasis", values: "loud | medium | quiet", note: "the foreground roles" },
      { name: "tone", values: "any family", note: "re-scopes the ink trio" },
    ],
    refusals: [
      {
        name: "a level prop",
        why: "An h1 is a document fact, not a visual one. render={<h1/>} says it where a reader can see the two decisions are separate.",
      },
    ],
    example: (
      <Stack gap="2">
        <Heading size="7" render={<h3 />}>A section</Heading>
        <Heading size="4" render={<h4 />}>A subsection</Heading>
      </Stack>
    ),
  },
  {
    slug: "kbd",
    name: "Kbd",
    family: "Type",
    spec: "§11, §15",
    blurb:
      "A key cap: Code's fill and tone facts in the BODY family and a centered, floored cap box — a key names a key, it does not quote code, and the sans draws ⌘ full-size where a mono cell draws it compact. The hairline is the tone-aware border rather than one of the solved edge tiers — those were solved for controls whose identity rests on the edge, and a cap has a fill to carry it.",
    axes: [
      { name: "size", values: "1–9, optional", note: "unset inherits the line, like Code" },
      { name: "emphasis", values: "loud | medium | quiet", note: "the ink's axis" },
      { name: "tone", values: "any family", note: "moves the ink, the fill and the edge" },
    ],
    refusals: [
      {
        name: "a world-switched shadow",
        why: "The cap casts ALWAYS — flat world included — because a key cap is a picture of a raised physical object, so depth here is role semantics (the slider and switch grips' own exception), never the app's elevation dial. What stays refused is the cast moving with Theme surfaces.",
      },
    ],
    example: (
      <Text size="3">
        Press <Kbd>⌘K</Kbd> to search, <Kbd>Esc</Kbd> to dismiss.
      </Text>
    ),
  },
  {
    slug: "menu",
    name: "Menu",
    family: "Surface",
    spec: "§20, §21, §22",
    blurb:
      "A floating list of actions: the first portalled component and the row family's first member. The popup is a Card that floats — same seal, same edge, the smallest surface corner (the dialog-scale overlay corner was tried and rejected by eye) — and it casts in BOTH surfaces worlds, because a shadow under a floating pane is information about overlap, not the expression the app switch governs. The part vocabulary follows shadcn/ui's dropdown-menu (MIT), adopted with credit; behavior is Base UI's menu end to end.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "on the root, like Button — a size-4 trigger must not open a size-2 dropdown; rows price from the same control cells" },
      { name: "material (Content)", values: "solid | thin | regular | thick", note: "Card's own prop: opaque by default, glass opt-in — and a glass menu still casts the floating chrome in a flat world" },
      { name: "tone (Item)", values: "destructive", note: "a union of one — the single meaning a row may carry; not a palette, and widening it is a decision, never a default" },
      { name: "side / align / sideOffset (Content)", values: "designed defaults", note: "bottom / start / 4 — the only positioning vocabulary that is public" },
    ],
    refusals: [
      {
        name: "emphasis on rows",
        why: "A menu is a list of peers: emphasis ranks actions, and ranking rows inside a dropdown names nothing — the TextField sentence one family over. Quiet is the family's fixed identity, stamped, not chosen.",
      },
      {
        name: "Shortcut",
        why: "A keyboard hint is the row's trailing slot holding a <Kbd> — both already exist, and a part that renames existing vocabulary earns no row.",
      },
      {
        name: "MenuSeparator",
        why: "Base UI's menu separator is a re-export of the standalone one; ours would be too. Use <Separator> — the menu's stylesheet spaces it inside the popup.",
      },
      {
        name: "inset",
        why: "Icon-less rows aligning with icon'd neighbours is geometry's job, not a per-row prop the caller must remember: checkable rows keep their indicator mounted so the gutter reserves. Recorded open for plain items.",
      },
      {
        name: "modal / openOnHover",
        why: "Designed defaults, not call-site choices. An open menu IS modal — Base UI's default, and Radix's under shadcn/ui, whose vocabulary this component adopts: a transparent full-viewport press-catcher is what makes light-dismiss work, and locking page scroll keeps the panel attached to the anchor it is positioned against. There is no visible scrim. Rows open on click, never on hover.",
      },
      {
        name: "Arrow, Backdrop, Viewport, LinkItem, collision knobs",
        why: "Menus don't point; light-dismiss needs no scrim; long menus scroll inside the panel via the positioner's own measurements; navigation rows arrive with Sidebar; collision handling is a designed default.",
      },
    ],
    parts: [
        { part: "MenuTrigger", blurb: "The button that opens the menu — usually render={<Button/>}, so the trigger IS a Kookie Button; what the render target roots in decides the a11y contract, inferred through the escape rather than assumed" },
        { part: "MenuContent", blurb: "The floating panel: portals, positions, re-applies the theme (§20) and wears the surface identity" },
        { part: "MenuItem", blurb: "One action row — the row family's member: control cells, quiet identity, highlight not hover" },
        { part: "MenuGroup", blurb: "Groups rows so a label can name them; wires the group's accessible name automatically" },
        { part: "MenuLabel", blurb: "A heading for rows: the row skeleton for alignment, with the control-ness stood down — legal inside a group, where it names it, and legal on its own" },
        { part: "MenuCheckboxItem", blurb: "A toggleable row — the family's selected state; its indicator stays mounted so the gutter holds" },
        { part: "MenuRadioGroup", blurb: "Holds one chosen value among its radio rows; the value API is Base UI's, unchanged" },
        { part: "MenuRadioItem", blurb: "One choice in a radio group, marked by the mounted dot indicator when chosen" },
        { part: "MenuSub", blurb: "A nested menu's root: state and wiring only, no element of its own, like the root" },
        { part: "MenuSubTrigger", blurb: "The row that opens a child menu; stays lit while it is open, chevron is its own statement" },
        { part: "MenuSubContent", blurb: "The child panel: opens outward, first row aligned with its trigger — geometry is the system's" },
    ],
    example: (
      <Menu>
        <MenuTrigger render={<Button emphasis="medium">Actions</Button>} />
        <MenuContent>
          <MenuGroup>
            <MenuLabel>File</MenuLabel>
            <MenuItem trailing={<Kbd>⌘D</Kbd>}>Duplicate</MenuItem>
            <MenuItem>Rename</MenuItem>
          </MenuGroup>
          <Separator />
          <MenuCheckboxItem defaultChecked>Show hidden</MenuCheckboxItem>
          <MenuRadioGroup defaultValue="name">
            <MenuRadioItem value="name">Sort by name</MenuRadioItem>
            <MenuRadioItem value="date">Sort by date</MenuRadioItem>
          </MenuRadioGroup>
          <Separator />
          <MenuSub>
            <MenuSubTrigger>Export as</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>PNG</MenuItem>
              <MenuItem>SVG</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuItem tone="destructive">Delete…</MenuItem>
        </MenuContent>
      </Menu>
    ),
  },
  {
    slug: "progress",
    name: "Progress",
    family: "Indicator",
    spec: "§11, §19",
    blurb:
      "A rail with no grip: a neutral well and an accent level. It sits outside the look axis for the instrument rule — the axis dresses things whose resting state is a surface, and a bar has none — and it grows no hit area, because nothing hits it.",
    axes: [
      { name: "value", values: "number | null", note: "null is indeterminate, and sweeps" },
      { name: "min / max", values: "number", note: "defaults 0 and 100" },
    ],
    refusals: [
      {
        name: "size",
        why: "The slider's track ladder holds a fraction of the mark, and a bar has no mark — riding it would size the bar against a box it does not have. One designed thickness instead. Whether a bar earns the index is recorded open.",
      },
      {
        name: "tone",
        why: "Left closed rather than decided: a failed upload in destructive is real vocabulary, but adding an axis the day the component ships is assignment, not derivation.",
      },
    ],
    example: (
      <Stack gap="4">
        <Progress value={35} aria-label="Thirty-five percent" />
        <Progress value={85} aria-label="Eighty-five percent" />
        <Progress value={null} aria-label="Loading" />
      </Stack>
    ),
  },
  {
    slug: "radio",
    name: "Radio",
    family: "Control",
    spec: "§4, §6, §11",
    blurb:
      "The checkbox's shape sibling, and the third member that promoted the mark family into the shared layer. Its circle is role semantics: a square radio reads as a checkbox, so the radius axis never reaches it — one of only four corners in the system that no theme can square.",
    axes: [{ name: "size", values: "1 | 2 | 3 | 4", note: "the mark ladder, shared with Checkbox and the slider thumb" }],
    refusals: [
      { name: "tone and emphasis", why: "Inherited from Checkbox: neutral off, accent on is an identity." },
      { name: "readOnly", why: "Inherited from Checkbox — the platform does not define it." },
    ],
    example: (
      <RadioGroup defaultValue="b">
        <Stack gap="3">
          {["a", "b", "c"].map((v) => (
            <Flex key={v} gap="3" align="center">
              <Radio value={v} id={`r-${v}`} />
              <Text size="2" render={<label htmlFor={`r-${v}`} />}>Option {v.toUpperCase()}</Text>
            </Flex>
          ))}
        </Stack>
      </RadioGroup>
    ),
  },
  {
    slug: "radio-group",
    name: "RadioGroup",
    family: "Control",
    spec: "§11",
    blurb:
      "Base UI's roving-focus group wrapped with zero CSS. It exists for the keyboard and the form value, not for a look — render is open so the group can BE a Stack.",
    axes: [{ name: "value / defaultValue", values: "string", note: "the group owns the selection" }],
    refusals: [{ name: "any visual prop", why: "The group is wiring. What it looks like is the layout you render it as." }],
    example: (
      <RadioGroup defaultValue="y">
        <Flex gap="4">
          <Flex gap="2" align="center">
            <Radio value="y" id="g-y" />
            <Text size="2" render={<label htmlFor="g-y" />}>Yes</Text>
          </Flex>
          <Flex gap="2" align="center">
            <Radio value="n" id="g-n" />
            <Text size="2" render={<label htmlFor="g-n" />}>No</Text>
          </Flex>
        </Flex>
      </RadioGroup>
    ),
  },
  {
    slug: "separator",
    name: "Separator",
    family: "Surface",
    spec: "§11",
    blurb:
      "The quiet hairline as its own element: one paint and one thickness, both already designed. Its extent is the container's — the outer-spacing rule applied to length.",
    axes: [{ name: "orientation", values: "horizontal | vertical", note: "the one prop; a vertical hairline is the same two tokens with the axes swapped" }],
    refusals: [
      { name: "children", why: "A labelled divider is a composition — two separators and a Text — not a prop." },
      { name: "a length prop", why: "The container decides extent, the same sentence that refuses margin everywhere." },
      { name: "decorative", why: "A rule that must hide from assistive tech is not a Separator; it is a styled Box." },
    ],
    example: (
      <Card size="3">
        <Stack gap="4">
          <Text size="2" weight="medium">Above</Text>
          <Separator />
          <Text size="2" emphasis="medium">Below</Text>
        </Stack>
      </Card>
    ),
  },
  {
    slug: "slider",
    name: "Slider",
    family: "Control",
    spec: "§4, §11",
    blurb:
      "The first value control, and the one that needed no target mechanism: the root IS the control, so the whole strip rides the height ladder and a slider stands exactly as tall a target as the Button beside it. Range sliders are the same component — pass an array and a thumb renders per entry.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "the height ladder for the target, the mark ladder for the thumb" },
      { name: "value / defaultValue", values: "number | number[]", note: "an array makes it a range" },
    ],
    refusals: [
      { name: "tone and emphasis", why: "A value is not an action, and a form where one slider is louder than the next names nothing." },
      {
        name: "orientation",
        why: "Vertical needs its own designed geometry set — thumb travel, track pricing, the cells. It ships the day something forces it, not as a prop that renders undesigned geometry today.",
      },
      { name: "material", why: "A 5px line of blur is a 5px line." },
    ],
    example: (
      <Stack gap="5">
        <Slider defaultValue={40} aria-label="Value" />
        <Slider defaultValue={[20, 65]} aria-label="Range" />
      </Stack>
    ),
  },
  {
    slug: "spinner",
    name: "Spinner",
    family: "Indicator",
    spec: "§8",
    blurb:
      "A busy indicator that costs one composited transform and no JS. The spokes are geometry rather than a gradient, and the animated element is the wrapper rather than the SVG — an SVG root's transform is not reliably composited, and this control's one job is to keep moving while the main thread is busy.",
    axes: [{ name: "—", values: "none", note: "it takes the icon box of whatever control hosts it" }],
    refusals: [
      {
        name: "a size prop",
        why: "It occupies the icon box, so swapping a spinner in for an icon shifts nothing. Standalone, it takes the size-2 box.",
      },
      { name: "a colour prop", why: "It draws in currentColor, which is correct in every context with no token at all." },
    ],
    example: (
      <Flex gap="4" align="center">
        <Spinner />
        <Button loading>Saving</Button>
        <Button emphasis="quiet" loading>Refreshing</Button>
      </Flex>
    ),
  },
  {
    slug: "stack",
    name: "Stack",
    family: "Layout",
    spec: "§3",
    blurb: "Box with a column flex preset. The most common layout in any app, named so it stops being re-derived.",
    axes: [{ name: "gap / align / justify", values: "the flex vocabulary", note: "gap through the layout-space layer" }],
    refusals: [{ name: "dividers", why: "A rule between rows is a Separator you place, not a prop that guesses where you wanted one." }],
    example: (
      <Stack gap="3">
        <Button size="2">First</Button>
        <Button size="2">Second</Button>
      </Stack>
    ),
  },
  {
    slug: "switch",
    name: "Switch",
    family: "Control",
    spec: "§4, §6, §11, §19",
    blurb:
      "The mark family's shifted member: its track is mark(n + 1), the identity every peer arrives at by hand. Off is the neutral well with its edge melted in — a channel felt for rather than a small surface read — which is why the whole control sits outside the look axis with the slider.",
    axes: [{ name: "size", values: "1 | 2 | 3 | 4", note: "one index up the mark ladder, with its own width ladder" }],
    refusals: [
      { name: "tone and emphasis", why: "Inherited from the family: neutral off, accent on." },
      { name: "children", why: "The label is a sibling, as for every mark." },
      {
        name: "readOnly",
        why: "The same answer Checkbox gives — a read-only switch is a disabled one with a different name.",
      },
    ],
    example: (
      <Stack gap="3">
        <Flex gap="3" align="center">
          <Switch defaultChecked id="s1" />
          <Text size="2" render={<label htmlFor="s1" />}>Notifications</Text>
        </Flex>
        <Flex gap="3" align="center">
          <Switch id="s2" />
          <Text size="2" render={<label htmlFor="s2" />}>Beta features</Text>
        </Flex>
      </Stack>
    ),
  },
  {
    slug: "text",
    name: "Text",
    family: "Type",
    spec: "§15",
    blurb:
      "Body copy. A step on the ramp joins three designed pairs — font size, line height, letter spacing — at one index, and the family is the Theme's body slot. It renders a span: flow is the layout layer's job, so a paragraph is render={<p/>}.",
    axes: [
      { name: "size", values: "1–9", note: "defaults to 3, the anchor step" },
      { name: "weight", values: "regular | medium | semibold | bold", note: "token names, never numbers" },
      { name: "emphasis", values: "loud | medium | quiet", note: "rests LOUD — full contrast is the accessible resting state for reading" },
      { name: "tone", values: "any family", note: "re-scopes the ladder onto the family's ink trio" },
    ],
    refusals: [
      { name: "a colour prop", why: "tone says the meaning and the theme resolves the pigment. A raw colour rides style, spelled where review sees it." },
      { name: "margin", why: "Type owns no outer spacing; the margin is zeroed whatever element render names." },
    ],
    example: (
      <Stack gap="2">
        <Text size="3">Loud rests at full contrast.</Text>
        <Text size="3" emphasis="medium">Medium is the muted role.</Text>
        <Text size="3" emphasis="quiet">Quiet is below body-copy contrast by design.</Text>
      </Stack>
    ),
  },
  {
    slug: "text-area",
    name: "TextArea",
    family: "Control",
    spec: "§4, §11",
    blurb:
      "One element, no wrapper, no slots — the anatomy criterion answered by subtraction. TextField needs a wrapper because a slot forces the border off the input; a textarea has no slots, so the border stays on the element and every wrapper debt never exists. It is the first control whose padding is the dimension: one inset, all four sides.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "control height survives as a min-height; growth is rows" },
      { name: "material", values: "solid | thin | regular | thick", note: "" },
      { name: "rows", values: "number", note: "the height, because a composer is its own component" },
    ],
    refusals: [
      { name: "emphasis and tone", why: "A form where one field is louder than the next is incoherent — TextField's argument." },
      { name: "resize", why: "It renames raw CSS. Vertical-only is the shipped behaviour; style is the escape." },
      { name: "cols", why: "Width is the container's." },
    ],
    example: <TextArea rows={3} defaultValue="A textarea is a paragraph." aria-label="Notes" />,
  },
  {
    slug: "text-field",
    name: "TextField",
    family: "Control",
    spec: "§4, §9, §11",
    blurb:
      "The visible control is a WRAPPER around the input, and that is what makes its slots legitimate anatomy: a field that can hold an icon inside its border cannot keep that border on the input, and the wrapper then owes caret-on-click, slot-aware layout, and a trailing control that keeps its own press. ref goes to the input; className dresses the wrapper.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "" },
      { name: "material", values: "solid | thin | regular | thick", note: "" },
      { name: "leading / trailing", values: "ReactNode", note: "an icon, or a hosted control that keeps its own press" },
    ],
    refusals: [
      { name: "emphasis and tone", why: "Loudness ranks actions. A form where one field is louder than the next names nothing." },
      {
        name: "render",
        why: "Everywhere else render swaps the one element that IS the component. Here there are two and neither can move — the wrapper holds a border the input cannot, and the input must stay an input or the platform wiring goes with it.",
      },
    ],
    example: (
      <Stack gap="3" style={{ maxWidth: "22rem" }}>
        <TextField placeholder="Search" aria-label="Search" />
        <TextField placeholder="Invalid" aria-label="Invalid" aria-invalid="true" />
      </Stack>
    ),
  },
  {
    slug: "theme",
    name: "Theme",
    family: "Layout",
    spec: "§5, §7, §12, §19",
    blurb:
      "Where an app states its identity. Seven axes, each re-pricing tokens for everything beneath it — and they nest, so a section can override the page. Nothing about a Theme is decoration: every prop answers a question the call sites are then forbidden from answering one at a time.",
    axes: [
      { name: "appearance", values: "inherit | light | dark", note: "resolved output, never a colour" },
      { name: "contrast", values: "normal | high", note: "an accessibility setting, not a design knob — the conformance surface for edges and signals" },
      { name: "radius", values: "none | small | medium | large | full", note: "selects a designed palette per level, not a factor" },
      { name: "density", values: "compact | default | comfortable", note: "control-only: airiness, never type" },
      { name: "pointer", values: "auto | fine | coarse", note: "two complete geometries, the way there are two colour modes" },
      { name: "look", values: "outlined | filled", note: "the resting dress of the one-look families" },
      { name: "surfaces", values: "flat | elevated", note: "the one sanctioned consumer of the shadow palette" },
    ],
    refusals: [
      {
        name: "an accentColor prop",
        why: "Accent is hue-authored in config and baked by the generator, so it is one app-wide identity rather than a per-subtree choice. A runtime prop would mean shipping every family's ladder for every subtree — the named extra-accent slot is recorded open, and it will be a config entry when it lands.",
      },
      {
        name: "a scale prop",
        why: "The factor stays wired and the prop is deferred. It reopens the day a real need names the steps, and ships as designed steps rather than a free multiplier.",
      },
      {
        name: "an elevation axis",
        why: "Deleted. Nothing ever varied it per call site — it was a component fact wearing an axis's clothes, and surfaces is what survived of its logic.",
      },
    ],
    example: (
      <Flex gap="4" wrap="wrap" align="center">
        <Theme radius="full">
          <Button tone="accent" emphasis="loud">radius full</Button>
        </Theme>
        <Theme radius="none">
          <Button tone="accent" emphasis="loud">radius none</Button>
        </Theme>
        <Theme density="compact">
          <Button emphasis="medium">compact</Button>
        </Theme>
        <Theme density="comfortable">
          <Button emphasis="medium">comfortable</Button>
        </Theme>
      </Flex>
    ),
  },
];

export const BY_SLUG = new Map(ENTRIES.map((e) => [e.slug, e]));
