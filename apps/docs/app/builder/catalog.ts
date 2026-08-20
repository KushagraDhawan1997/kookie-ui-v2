/**
 * The builder's catalog: what can be placed, what each thing accepts, and which knobs it
 * shows (2026-08-19). ENGINEERING §1.1 applied to the builder itself — the palette, the
 * inspector and the containment checks are all renderers over this one table, and a law
 * walks the package's exports against it so a new component fails CI here the way it
 * already fails the playground.
 *
 * Two rules give the file its shape:
 *
 * 1. NOTHING here authors a value list. Axis props derive from `componentAxes` (the package
 *    export the builder forced) and Theme props from `themeAxes`; the only literals are
 *    designed vocabularies the package types as raw strings on purpose (the flex keywords,
 *    a grid column count) — and those are offered as closed pick-lists, because the whole
 *    point of the builder is that stating a custom value is hard.
 *
 * 2. The containment grammar is data, not judgment in the drop handler. `children` says
 *    what a node accepts; `requiresAncestor` places the parts that may sit anywhere inside
 *    a compound's subtree (a DialogTitle two Stacks deep is legal; one outside a
 *    DialogContent is not); `partOf` keeps parts out of the general palette. The canvas,
 *    the tree and the palette all ask `canContain` — one rule, three surfaces.
 */

import { componentAxes, themeAxes } from "@kookie-ui/react";

import { node, type BuilderNode } from "./model";

/* ── Prop schemas — what the inspector generates from ─────────────────────────────────── */

export type PropSchema =
  /** A closed union the package exports. The inspector derives its options; `optional`
      means unset is meaningful (the component's own default) and gets an explicit choice.
      `responsive` marks the curated layout props that take the package's per-tier object —
      each tier's value is still a pick from the same closed list. `note` is one quiet
      sentence the inspector shows under the control, for props that carry a trap. */
  | { kind: "axis"; axis: keyof typeof componentAxes; optional?: boolean; responsive?: boolean; note?: string }
  /** A designed literal vocabulary the package types as a raw string on purpose. */
  | { kind: "options"; values: readonly string[]; labels?: Record<string, string>; optional?: boolean; responsive?: boolean; note?: string }
  | { kind: "boolean"; note?: string }
  /** Content, not styling: labels, placeholders, values. The one free-text door. */
  | { kind: "text"; note?: string }
  | { kind: "number"; min?: number; max?: number; note?: string };

export type ChildrenMode = "none" | "text" | "any" | { only: readonly string[] };

export type CatalogEntry = {
  /** §11's grouping, for the palette sections. */
  family: "Layout" | "Surface" | "Control" | "Type" | "Indicator";
  /** One palette sentence. The full argument lives in the component reference; the
      inspector links refusals from there rather than restating them. */
  blurb: string;
  props: Record<string, PropSchema>;
  children: ChildrenMode;
  /** Legal only somewhere inside this ancestor's subtree (not necessarily direct). */
  requiresAncestor?: string;
  /** A part of a compound: hidden from the general palette, offered in context. */
  partOf?: string;
  /** Renders no DOM element of its own — the canvas cannot stamp it; the tree selects it. */
  phantom?: boolean;
  /** The component's own interaction IS a pointer drag (the slider's thumb), so the canvas
      never marks it draggable — moving it is the tree's job. */
  dragOwnsPointer?: boolean;
  /** The single child is passed through `render={...}` (the trigger pattern), so the child
      element IS this part's element. Implies phantom for canvas stamping. */
  renderChild?: boolean;
  /** §4's adornment seats this entry offers, if any. A slot holds ONE node and lays out
      inside the control's own box — an icon's place, and the place a hosted control sits. */
  slots?: readonly ("leading" | "trailing")[];
  /** What the palette inserts — a subtree for compounds, so a dropped Menu works on arrival. */
  make: () => BuilderNode;
};

/* Shared schema fragments — spelled once. */
const size = (optional = true): PropSchema => ({ kind: "axis", axis: "size", optional });
const tone: PropSchema = { kind: "axis", axis: "tone", optional: true };
const emphasis: PropSchema = { kind: "axis", axis: "emphasis", optional: true };
const typeSize: PropSchema = { kind: "axis", axis: "typeSize", optional: true };
const weight: PropSchema = { kind: "axis", axis: "weight", optional: true };
/** Layout distances are responsive: the package's curated props all take per-tier values,
    and these are the ones the builder models. */
const space: PropSchema = { kind: "axis", axis: "space", optional: true, responsive: true };
/** Margins take one value padding cannot: `bleed` cancels the enclosing surface's padding, so
    a child reaches the pane's edge — a picture across the top of a card (§3, 2026-08-20). It is
    a separate schema and not a widened `space` because offering it on `p` would be offering a
    negative padding, which CSS rejects outright. */
const marginSpace: PropSchema = { kind: "axis", axis: "marginSpace", optional: true, responsive: true };
const bool: PropSchema = { kind: "boolean" };
const text: PropSchema = { kind: "text" };

/** The flex vocabulary, offered closed. The package types these raw (§3: a custom property
    holds a keyword as happily as a length); the builder narrows them to the values the
    system's own surfaces use, because "hard to state a custom value" is the product. */
const ALIGN = ["flex-start", "center", "flex-end", "stretch", "baseline"] as const;
const JUSTIFY = ["flex-start", "center", "flex-end", "space-between"] as const;

/** Grid columns as a COUNT: the stored value is the full track list (so the interpreter and
    serializer stay dumb), the labels are what a person is choosing. */
const gridColumns = (n: number) => `repeat(${n}, minmax(0, 1fr))`;
const COLUMN_VALUES = [2, 3, 4].map(gridColumns);
const COLUMN_LABELS = Object.fromEntries([2, 3, 4].map((n) => [gridColumns(n), `${n} columns`]));

/** How a layout primitive takes its share of the parent it sits in (2026-08-20) — the other
    half of resize, and the half that is about the PARENT rather than the node.

    Both are `scale: null` props the package types raw (§3's flex-child row), offered closed
    exactly like the flex keywords beside them: `flexGrow` has one useful value, and a span
    is a count. Neither can state a length, which is what keeps them inside the builder's
    grammar — the grid span's own value is a shorthand, not a measurement.

    `auto / span N`, never a bare `span N`: measured on a real 3-column grid, the bare form
    leaves a child 195px (one column) because the shorthand's first slot is the ROW. The
    stored value is the full shorthand so the interpreter and serializer stay dumb, the way
    the column track list already is. */
const spanValue = (n: number) => `auto / span ${n}`;
const SPAN_VALUES = [2, 3, 4].map(spanValue);
const SPAN_LABELS = Object.fromEntries([2, 3, 4].map((n) => [spanValue(n), `spans ${n} columns`]));

/** Both are CHILD props: they say nothing about the node and everything about its seat, so
    they live on every layout primitive and on nothing else. A control cannot carry them —
    §3 keeps layout props off components — and wrapping does not rescue the flex case:
    measured, a `flexGrow` Box grows to 261px while the Button inside it stays 62px, because
    a grown box is not a stretched child. Grid span DOES survive a wrapper (a spanning Box
    carries its Card the full 397px), which is why the two halves reach different places. */
const layoutChildProps = {
  flexGrow: {
    kind: "options",
    values: ["1"],
    labels: { "1": "Fill the row" },
    optional: true,
    responsive: true,
    note: "Takes the free space of a horizontal parent. Unset hugs its contents. On a vertical parent this does nothing — a column's children already stretch across it.",
  },
  gridArea: {
    kind: "options",
    values: SPAN_VALUES,
    labels: SPAN_LABELS,
    optional: true,
    responsive: true,
    note: "How many of the parent grid's columns this takes. Unset is one.",
  },
} satisfies Record<string, PropSchema>;

const typeProps = { size: typeSize, weight, emphasis, tone };

export const CATALOG: Record<string, CatalogEntry> = {
  /* ── Layout ─────────────────────────────────────────────────────────────────────────── */
  Stack: {
    family: "Layout",
    blurb: "A column of things with one stated gap.",
    props: { gap: space, align: { kind: "options", values: ALIGN, optional: true, responsive: true }, justify: { kind: "options", values: JUSTIFY, optional: true, responsive: true }, p: space, ...layoutChildProps },
    children: "any",
    make: () => node("Stack", { gap: "3" }, { children: [] }),
  },
  Flex: {
    family: "Layout",
    blurb: "A row (or column) with the flex vocabulary, distances through tokens.",
    props: {
      gap: space,
      direction: { kind: "options", values: ["row", "column"], optional: true, responsive: true },
      align: { kind: "options", values: ALIGN, optional: true, responsive: true },
      justify: { kind: "options", values: JUSTIFY, optional: true, responsive: true },
      wrap: { kind: "options", values: ["wrap", "nowrap"], optional: true, responsive: true },
      p: space,
      ...layoutChildProps,
    },
    children: "any",
    make: () => node("Flex", { gap: "3", align: "center" }, { children: [] }),
  },
  Grid: {
    family: "Layout",
    blurb: "Equal columns with token gaps.",
    props: { columns: { kind: "options", values: COLUMN_VALUES, labels: COLUMN_LABELS, optional: true, responsive: true }, gap: space, p: space, ...layoutChildProps },
    children: "any",
    make: () => node("Grid", { columns: gridColumns(2), gap: "3" }, { children: [] }),
  },
  Box: {
    family: "Layout",
    blurb: "Token padding and margin around whatever it holds — the one sanctioned outer-spacing escape.",
    props: {
      p: space,
      px: space,
      py: space,
      m: marginSpace,
      mx: marginSpace,
      my: marginSpace,
      container: {
        kind: "boolean",
        note:
          "Makes THIS box the region per-tier values inside it measure. Mark boxes layout already sizes — a sidebar with a width, a grid cell, a growing column. A container left to shrink-wrap renders 0px wide (the recorded §2 defect that made containment opt-in).",
      },
      backdrop: bool,
      ...layoutChildProps,
    },
    children: "any",
    make: () => node("Box", { p: "4" }, { children: [] }),
  },
  Theme: {
    family: "Layout",
    blurb: "A nested identity: re-answer any Theme axis for the subtree inside it.",
    // Derived from themeAxes, never restated — the /preview panel's own rule. `appearance`
    // and `contrast` stay the document store's, exactly as the playground divides them.
    props: Object.fromEntries(
      (["density", "radius", "pointer", "depth", "material"] as const).map((axis) => [
        axis,
        { kind: "options", values: themeAxes[axis], optional: true } satisfies PropSchema,
      ]),
    ),
    children: "any",
    make: () => node("Theme", {}, { children: [] }),
  },

  /* ── Surface ────────────────────────────────────────────────────────────────────────── */
  Card: {
    family: "Surface",
    blurb: "A shell with one fixed treatment. Everything inside it is composition.",
    props: { size: size(), backdrop: bool },
    children: "any",
    make: () =>
      node("Card", { size: "3" }, {
        children: [
          node("Stack", { gap: "2" }, {
            children: [
              node("Text", { size: "3", weight: "medium" }, { text: "A card is a shell" }),
              node("Text", { size: "2", emphasis: "medium" }, { text: "Everything inside it is composition." }),
            ],
          }),
        ],
      }),
  },
  Separator: {
    family: "Surface",
    blurb: "The quiet hairline. Extent is the container's.",
    props: { orientation: { kind: "options", values: ["horizontal", "vertical"], optional: true } },
    children: "none",
    make: () => node("Separator"),
  },

  /* ── Controls ───────────────────────────────────────────────────────────────────────── */
  Button: {
    family: "Control",
    blurb: "tone × emphasis × bordered over the theme's material — never a raw fill.",
    /* `aria-label` is here for the icon-only case, which §4 ships on purpose: a Button with
       no text is a glyph with no name, and the review rule that says so had no remedy to
       point at until this field existed. */
    props: { size: size(), tone, emphasis, bordered: bool, loading: bool, disabled: bool, "aria-label": text },
    children: "text",
    slots: ["leading", "trailing"],
    make: () => node("Button", {}, { text: "Button" }),
  },
  TextField: {
    family: "Control",
    blurb: "A single-line field. No emphasis and no tone: a form does not rank its fields.",
    props: { size: size(), placeholder: text, "aria-label": text, disabled: bool, backdrop: bool },
    children: "none",
    slots: ["leading", "trailing"],
    make: () => node("TextField", { placeholder: "Placeholder", "aria-label": "Field" }),
  },
  TextArea: {
    family: "Control",
    blurb: "A paragraph of input. Height is rows; width is the container's.",
    props: { size: size(), rows: { kind: "number", min: 1, max: 12 }, placeholder: text, "aria-label": text, disabled: bool, backdrop: bool },
    children: "none",
    make: () => node("TextArea", { rows: 3, placeholder: "Write something…", "aria-label": "Notes" }),
  },
  Checkbox: {
    family: "Control",
    blurb: "A mark beside a sibling label. Neutral off, accent on — an identity, not an axis.",
    props: { size: size(), defaultChecked: bool, disabled: bool, "aria-label": text },
    children: "none",
    make: () => node("Checkbox", { "aria-label": "Checkbox" }),
  },
  Switch: {
    family: "Control",
    blurb: "The mark family's shifted member: a grip in a channel.",
    props: { size: size(), defaultChecked: bool, disabled: bool, "aria-label": text },
    children: "none",
    make: () => node("Switch", { "aria-label": "Switch" }),
  },
  RadioGroup: {
    family: "Control",
    blurb: "Wiring for one choice: keyboard and form value. What it looks like is the layout inside it.",
    /* A radiogroup with no accessible name is a real WCAG failure, and this is the one
       family whose label is architecturally a sibling — so the name has to be stated. */
    props: { defaultValue: text, "aria-label": text },
    children: "any",
    make: () =>
      node("RadioGroup", { defaultValue: "a", "aria-label": "Choice" }, {
        children: ["a", "b"].map((v) =>
          node("Flex", { gap: "3", align: "center" }, {
            children: [
              node("Radio", { value: v }),
              node("Text", { size: "2" }, { text: `Option ${v.toUpperCase()}` }),
            ],
          }),
        ),
      }),
  },
  Radio: {
    family: "Control",
    blurb: "One choice's mark. Lives somewhere inside a RadioGroup; its label is a sibling.",
    props: { value: text, size: size(), disabled: bool, "aria-label": text },
    children: "none",
    requiresAncestor: "RadioGroup",
    partOf: "RadioGroup",
    make: () => node("Radio", { value: "a" }),
  },
  Slider: {
    family: "Control",
    blurb: "The whole strip is the control; the thumb is the mark family's grip.",
    props: { size: size(), defaultValue: { kind: "number", min: 0, max: 100 }, "aria-label": text, disabled: bool },
    children: "none",
    dragOwnsPointer: true,
    make: () => node("Slider", { defaultValue: 40, "aria-label": "Value" }),
  },
  SegmentedControl: {
    family: "Control",
    blurb: "One choice among a few, shown all at once — a radio group wearing a track.",
    props: { size: size(), defaultValue: text, "aria-label": text },
    children: { only: ["SegmentedItem"] },
    make: () =>
      node("SegmentedControl", { defaultValue: "list", "aria-label": "View" }, {
        children: [
          node("SegmentedItem", { value: "list" }, { text: "List" }),
          node("SegmentedItem", { value: "grid" }, { text: "Grid" }),
        ],
      }),
  },
  SegmentedItem: {
    family: "Control",
    blurb: "One segment: a control hosted in the channel.",
    props: { value: text, disabled: bool },
    children: "text",
    partOf: "SegmentedControl",
    make: () => node("SegmentedItem", { value: "new" }, { text: "New" }),
  },
  Tabs: {
    family: "Control",
    blurb: "Places you can go, and the one you are on — marked by ink and a rule.",
    props: { defaultValue: text },
    children: { only: ["TabsList", "TabsPanel"] },
    make: () =>
      node("Tabs", { defaultValue: "one" }, {
        children: [
          node("TabsList", {}, {
            children: [
              node("TabsTab", { value: "one" }, { text: "First" }),
              node("TabsTab", { value: "two" }, { text: "Second" }),
            ],
          }),
          node("TabsPanel", { value: "one" }, { children: [node("Text", { size: "2" }, { text: "The first panel." })] }),
          node("TabsPanel", { value: "two" }, { children: [node("Text", { size: "2" }, { text: "The second panel." })] }),
        ],
      }),
  },
  TabsList: {
    family: "Control",
    blurb: "The bar, the hairline, and the one place size is stated.",
    props: { size: size(), "aria-label": text },
    children: { only: ["TabsTab"] },
    partOf: "Tabs",
    make: () => node("TabsList", { "aria-label": "Sections" }, { children: [node("TabsTab", { value: "one" }, { text: "First" })] }),
  },
  TabsTab: {
    family: "Control",
    blurb: "One tab. Active is a state, not a rung.",
    props: { value: text, disabled: bool },
    children: "text",
    partOf: "Tabs",
    make: () => node("TabsTab", { value: "new" }, { text: "New tab" }),
  },
  TabsPanel: {
    family: "Control",
    blurb: "What a tab reveals. Paints nothing — a region that draws its own box is a Card.",
    props: { value: text },
    children: "any",
    partOf: "Tabs",
    make: () => node("TabsPanel", { value: "new" }, { children: [] }),
  },

  /* ── Type ───────────────────────────────────────────────────────────────────────────── */
  Text: {
    family: "Type",
    blurb: "Body copy on the nine-step ramp. Rests loud; meaning through tone, never a colour.",
    props: typeProps,
    children: "text",
    make: () => node("Text", { size: "2" }, { text: "Some body copy." }),
  },
  Heading: {
    family: "Type",
    blurb: "The heading slot on the same ramp. Size prices the type; the outline level is the document's.",
    props: typeProps,
    children: "text",
    make: () => node("Heading", { size: "6" }, { text: "A heading" }),
  },
  Blockquote: {
    family: "Type",
    blurb: "Body copy set apart by a rule and an indent.",
    props: typeProps,
    children: "text",
    make: () => node("Blockquote", { size: "3" }, { text: "Taste is the last layer." }),
  },
  Code: {
    family: "Type",
    blurb: "Inline code: the mono slot in a subtle fill. Unset size takes the line it sits in.",
    props: typeProps,
    children: "text",
    make: () => node("Code", {}, { text: "pnpm run ci" }),
  },
  Kbd: {
    family: "Type",
    blurb: "A key cap. Unset size takes the line, like Code.",
    props: typeProps,
    children: "text",
    make: () => node("Kbd", {}, { text: "⌘K" }),
  },

  /* ── Indicators ─────────────────────────────────────────────────────────────────────── */
  Progress: {
    family: "Indicator",
    blurb: "A rail with no grip. One designed thickness; extent is the container's.",
    props: { value: { kind: "number", min: 0, max: 100 }, "aria-label": text },
    children: "none",
    make: () => node("Progress", { value: 40, "aria-label": "Progress" }),
  },
  Spinner: {
    family: "Indicator",
    blurb: "A busy indicator in currentColor. It takes the icon box of whatever hosts it.",
    props: {},
    children: "none",
    make: () => node("Spinner"),
  },

  /* ── Floating compounds — inserted whole, edited by part ────────────────────────────── */
  Menu: {
    family: "Surface",
    blurb: "A floating list of actions. Dropped as a working menu; edit the rows in the tree.",
    props: { size: size() },
    children: { only: ["MenuTrigger", "MenuContent"] },
    phantom: true,
    make: () =>
      node("Menu", {}, {
        children: [
          node("MenuTrigger", {}, { children: [node("Button", { emphasis: "medium" }, { text: "Actions" })] }),
          node("MenuContent", {}, {
            children: [
              node("MenuItem", {}, { text: "Duplicate" }),
              node("MenuItem", {}, { text: "Rename" }),
              node("Separator"),
              node("MenuItem", { tone: "destructive" }, { text: "Delete…" }),
            ],
          }),
        ],
      }),
  },
  MenuTrigger: {
    family: "Surface",
    blurb: "The button that opens the menu — a real Kookie Button through render.",
    props: {},
    children: { only: ["Button"] },
    partOf: "Menu",
    renderChild: true,
    make: () => node("MenuTrigger", {}, { children: [node("Button", { emphasis: "medium" }, { text: "Actions" })] }),
  },
  MenuContent: {
    family: "Surface",
    blurb: "The floating panel: rows, groups and separators only.",
    props: {},
    children: { only: ["MenuItem", "MenuGroup", "MenuLabel", "MenuCheckboxItem", "MenuRadioGroup", "MenuSub", "Separator"] },
    partOf: "Menu",
    make: () => node("MenuContent", {}, { children: [node("MenuItem", {}, { text: "Action" })] }),
  },
  MenuItem: {
    family: "Surface",
    blurb: "One action row. `destructive` is the one meaning a row may carry.",
    props: { tone: { kind: "options", values: ["destructive"], optional: true }, disabled: bool },
    children: "text",
    slots: ["leading", "trailing"],
    partOf: "Menu",
    make: () => node("MenuItem", {}, { text: "Action" }),
  },
  MenuGroup: {
    family: "Surface",
    blurb: "Rows a label can name.",
    props: {},
    children: { only: ["MenuLabel", "MenuItem", "MenuCheckboxItem"] },
    partOf: "Menu",
    make: () =>
      node("MenuGroup", {}, {
        children: [node("MenuLabel", {}, { text: "Group" }), node("MenuItem", {}, { text: "Action" })],
      }),
  },
  MenuLabel: {
    family: "Surface",
    blurb: "A heading for rows.",
    props: {},
    children: "text",
    partOf: "Menu",
    make: () => node("MenuLabel", {}, { text: "Label" }),
  },
  MenuCheckboxItem: {
    family: "Surface",
    blurb: "A toggleable row; the tick wears the accent solid.",
    props: { defaultChecked: bool },
    children: "text",
    partOf: "Menu",
    make: () => node("MenuCheckboxItem", { defaultChecked: true }, { text: "Show hidden" }),
  },
  MenuRadioGroup: {
    family: "Surface",
    blurb: "One chosen value among its radio rows.",
    props: { defaultValue: text },
    children: { only: ["MenuRadioItem"] },
    partOf: "Menu",
    make: () =>
      node("MenuRadioGroup", { defaultValue: "name" }, {
        children: [
          node("MenuRadioItem", { value: "name" }, { text: "Sort by name" }),
          node("MenuRadioItem", { value: "date" }, { text: "Sort by date" }),
        ],
      }),
  },
  MenuRadioItem: {
    family: "Surface",
    blurb: "One choice in a radio group of rows.",
    props: { value: text },
    children: "text",
    partOf: "Menu",
    make: () => node("MenuRadioItem", { value: "new" }, { text: "New choice" }),
  },
  MenuSub: {
    family: "Surface",
    blurb: "A nested menu: trigger row plus child panel.",
    props: {},
    children: { only: ["MenuSubTrigger", "MenuSubContent"] },
    partOf: "Menu",
    phantom: true,
    make: () =>
      node("MenuSub", {}, {
        children: [
          node("MenuSubTrigger", {}, { text: "Export as" }),
          node("MenuSubContent", {}, {
            children: [node("MenuItem", {}, { text: "PNG" }), node("MenuItem", {}, { text: "SVG" })],
          }),
        ],
      }),
  },
  MenuSubTrigger: {
    family: "Surface",
    blurb: "The row that opens the child menu.",
    props: {},
    children: "text",
    partOf: "Menu",
    make: () => node("MenuSubTrigger", {}, { text: "More" }),
  },
  MenuSubContent: {
    family: "Surface",
    blurb: "The child panel — same vocabulary as the parent's.",
    props: {},
    children: { only: ["MenuItem", "MenuGroup", "MenuLabel", "MenuCheckboxItem", "MenuRadioGroup", "MenuSub", "Separator"] },
    partOf: "Menu",
    make: () => node("MenuSubContent", {}, { children: [node("MenuItem", {}, { text: "Action" })] }),
  },

  Select: {
    family: "Surface",
    blurb: "A form control that holds a choice, in a field-shaped trigger.",
    props: { size: size() },
    children: { only: ["SelectTrigger", "SelectContent"] },
    phantom: true,
    make: () =>
      node("Select", {}, {
        children: [
          node("SelectTrigger", { placeholder: "Pick one" }),
          node("SelectContent", {}, {
            children: [
              node("SelectItem", { value: "one" }, { text: "One" }),
              node("SelectItem", { value: "two" }, { text: "Two" }),
            ],
          }),
        ],
      }),
  },
  SelectTrigger: {
    family: "Surface",
    blurb: "The field-shaped button reporting the choice.",
    props: { placeholder: text, backdrop: bool },
    children: "none",
    partOf: "Select",
    make: () => node("SelectTrigger", { placeholder: "Pick one" }),
  },
  SelectContent: {
    family: "Surface",
    blurb: "The floating listbox: options and groups only.",
    props: {},
    children: { only: ["SelectItem", "SelectGroup"] },
    partOf: "Select",
    make: () => node("SelectContent", {}, { children: [node("SelectItem", { value: "one" }, { text: "One" })] }),
  },
  SelectItem: {
    family: "Surface",
    blurb: "One option row.",
    props: { value: text },
    children: "text",
    partOf: "Select",
    make: () => node("SelectItem", { value: "new" }, { text: "New option" }),
  },
  SelectGroup: {
    family: "Surface",
    blurb: "Options a label can name — the divider a listbox actually has.",
    props: {},
    children: { only: ["SelectLabel", "SelectItem"] },
    partOf: "Select",
    make: () =>
      node("SelectGroup", {}, {
        children: [node("SelectLabel", {}, { text: "Group" }), node("SelectItem", { value: "one" }, { text: "One" })],
      }),
  },
  SelectLabel: {
    family: "Surface",
    blurb: "A heading for option rows.",
    props: {},
    children: "text",
    partOf: "Select",
    make: () => node("SelectLabel", {}, { text: "Label" }),
  },

  Dialog: {
    family: "Surface",
    blurb: "A modal panel over a dimmed app. Dropped whole; the content is yours to compose.",
    props: { size: size() },
    children: { only: ["DialogTrigger", "DialogContent"] },
    phantom: true,
    make: () =>
      node("Dialog", { size: "2" }, {
        children: [
          node("DialogTrigger", {}, { children: [node("Button", { emphasis: "medium" }, { text: "Open dialog" })] }),
          node("DialogContent", {}, {
            children: [
              node("Stack", { gap: "6" }, {
                children: [
                  node("Stack", { gap: "2" }, {
                    children: [
                      node("DialogTitle", {}, { text: "Dialog title" }),
                      node("DialogDescription", {}, { text: "What this dialog is for, said quietly." }),
                    ],
                  }),
                  node("Flex", { gap: "3", justify: "flex-end" }, {
                    children: [
                      node("DialogClose", {}, { children: [node("Button", { emphasis: "quiet", bordered: true }, { text: "Cancel" })] }),
                      node("DialogClose", {}, { children: [node("Button", { emphasis: "loud" }, { text: "Save" })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
  },
  DialogTrigger: {
    family: "Surface",
    blurb: "The button that opens it.",
    props: {},
    children: { only: ["Button"] },
    partOf: "Dialog",
    renderChild: true,
    make: () => node("DialogTrigger", {}, { children: [node("Button", { emphasis: "medium" }, { text: "Open" })] }),
  },
  DialogContent: {
    family: "Surface",
    blurb: "The panel: portals, scrim, focus trap. Its layout is yours.",
    props: {},
    children: "any",
    partOf: "Dialog",
    make: () => node("DialogContent", {}, { children: [] }),
  },
  DialogTitle: {
    family: "Surface",
    blurb: "The panel's accessible name — a real heading at the card-title step.",
    props: {},
    children: "text",
    requiresAncestor: "DialogContent",
    partOf: "Dialog",
    make: () => node("DialogTitle", {}, { text: "Dialog title" }),
  },
  DialogDescription: {
    family: "Surface",
    blurb: "The supporting line, wired as the accessible description.",
    props: {},
    children: "text",
    requiresAncestor: "DialogContent",
    partOf: "Dialog",
    make: () => node("DialogDescription", {}, { text: "The supporting line." }),
  },
  DialogClose: {
    family: "Surface",
    blurb: "A dismissing button, placed wherever the composition wants one.",
    props: {},
    children: { only: ["Button"] },
    requiresAncestor: "DialogContent",
    partOf: "Dialog",
    renderChild: true,
    make: () => node("DialogClose", {}, { children: [node("Button", { emphasis: "quiet", bordered: true }, { text: "Close" })] }),
  },

  AlertDialog: {
    family: "Surface",
    blurb: "A modal question: title, description, two actions — nothing else, on purpose.",
    props: { size: size() },
    children: { only: ["AlertDialogTrigger", "AlertDialogContent"] },
    phantom: true,
    make: () =>
      node("AlertDialog", { size: "2" }, {
        children: [
          node("AlertDialogTrigger", {}, {
            children: [node("Button", { tone: "destructive", emphasis: "medium" }, { text: "Delete…" })],
          }),
          node("AlertDialogContent", {}, {
            children: [
              node("AlertDialogTitle", {}, { text: "Delete this?" }),
              node("AlertDialogDescription", {}, { text: "This cannot be undone." }),
              node("AlertDialogCancel", {}, { text: "Keep it" }),
              node("AlertDialogAction", { tone: "destructive" }, { text: "Delete" }),
            ],
          }),
        ],
      }),
  },
  AlertDialogTrigger: {
    family: "Surface",
    blurb: "The button that opens it.",
    props: {},
    children: { only: ["Button"] },
    partOf: "AlertDialog",
    renderChild: true,
    make: () => node("AlertDialogTrigger", {}, { children: [node("Button", { emphasis: "medium" }, { text: "Open" })] }),
  },
  AlertDialogContent: {
    family: "Surface",
    blurb: "The closed anatomy: the component lays these out itself.",
    props: {},
    children: { only: ["AlertDialogTitle", "AlertDialogDescription", "AlertDialogCancel", "AlertDialogAction"] },
    partOf: "AlertDialog",
    make: () => node("AlertDialogContent", {}, { children: [] }),
  },
  AlertDialogTitle: {
    family: "Surface",
    blurb: "The question, phrased as one.",
    props: {},
    children: "text",
    partOf: "AlertDialog",
    make: () => node("AlertDialogTitle", {}, { text: "Are you sure?" }),
  },
  AlertDialogDescription: {
    family: "Surface",
    blurb: "What proceeding means, said quietly.",
    props: {},
    children: "text",
    partOf: "AlertDialog",
    make: () => node("AlertDialogDescription", {}, { text: "This cannot be undone." }),
  },
  AlertDialogCancel: {
    family: "Surface",
    blurb: "The safe way out — a quiet bordered Button the component prices.",
    props: {},
    children: "text",
    partOf: "AlertDialog",
    make: () => node("AlertDialogCancel", {}, { text: "Cancel" }),
  },
  AlertDialogAction: {
    family: "Surface",
    blurb: "The committing choice — loud, and legal exactly here.",
    props: { tone },
    children: "text",
    partOf: "AlertDialog",
    make: () => node("AlertDialogAction", {}, { text: "Confirm" }),
  },
};

/**
 * Exports the palette cannot place, each with its reason — the registry's refusal rule
 * applied to the builder (the coverage law holds every name to an entry OR a row here,
 * and holds the reason to a sentence).
 */
export const EXCLUDED: { name: string; why: string }[] = [
  {
    name: "Shell",
    why: "The builder composes what goes INSIDE an app frame; the Shell is that frame. It claims the whole window, owns landmarks the canvas already provides, and its panes place themselves by grid area rather than by a drop — so a Shell on this canvas would be an app inside an app. Its parts are excluded for the same reason: none of them means anything outside the frame that arranges them.",
  },
  {
    name: "ShellHeader",
    why: "A part of the Shell, which the builder excludes: the app frame is what this canvas composes inside, not something it places. This part places itself by grid area within that frame, so ShellHeader has no meaning on a canvas with no Shell to arrange it.",
  },
  {
    name: "ShellRail",
    why: "A part of the Shell, which the builder excludes: the app frame is what this canvas composes inside, not something it places. This part places itself by grid area within that frame, so ShellRail has no meaning on a canvas with no Shell to arrange it.",
  },
  {
    name: "ShellSidebar",
    why: "A part of the Shell, which the builder excludes: the app frame is what this canvas composes inside, not something it places. This part places itself by grid area within that frame, so ShellSidebar has no meaning on a canvas with no Shell to arrange it.",
  },
  {
    name: "ShellContent",
    why: "A part of the Shell, which the builder excludes: the app frame is what this canvas composes inside, not something it places. This part places itself by grid area within that frame, so ShellContent has no meaning on a canvas with no Shell to arrange it.",
  },
  {
    name: "ShellInspector",
    why: "A part of the Shell, which the builder excludes: the app frame is what this canvas composes inside, not something it places. This part places itself by grid area within that frame, so ShellInspector has no meaning on a canvas with no Shell to arrange it.",
  },
  {
    name: "ShellBottom",
    why: "A part of the Shell, which the builder excludes: the app frame is what this canvas composes inside, not something it places. This part places itself by grid area within that frame, so ShellBottom has no meaning on a canvas with no Shell to arrange it.",
  },
  {
    name: "ShellTrigger",
    why: "A part of the Shell, which the builder excludes: the app frame is what this canvas composes inside, not something it places. This part places itself by grid area within that frame, so ShellTrigger has no meaning on a canvas with no Shell to arrange it.",
  },
  {
    name: "ShellScroll",
    why: "A part of the Shell, and the one that marks which region of a pane scrolls. It only means anything inside a pane that has given it a bounded column to grow into, which is a frame this canvas composes inside rather than places.",
  },
  {
    name: "ShellRailItem",
    why: "A part of the Shell's rail: one square in the column that switches which region of the app you are in. Regions are the app frame's business, and the frame is what this canvas composes inside rather than something it places.",
  },
  {
    name: "ShellRailList",
    why: "A part of the Shell's rail — the run its squares stack in. It has no meaning outside a rail, and the rail has none outside the app frame this canvas sits inside.",
  },
  {
    name: "ShellNavGroup",
    why: "A part of the Shell's sidebar: a cluster of nav rows wired to its own heading. Navigation belongs to the app frame, and the frame is what this canvas sits inside rather than something it arranges.",
  },
  {
    name: "ShellNavItem",
    why: "A part of the Shell's sidebar. A nav row navigates — it needs a destination and a notion of which page you are on, neither of which a composition canvas has; a Button is what the builder offers for an action that stays on the screen.",
  },
  {
    name: "ScrollArea",
    why: "Its one job needs a stated height, and a stated raw length is exactly what this builder refuses to offer — every distance here is a token index. It joins the palette the day the system gives a scroll region a designed height vocabulary.",
  },
];

/* ── The grammar — one rule, asked by the palette, the tree and the drop handler ──────── */

/** May `childType` be placed directly under `parent` (null = the document root), given the
    ancestor TYPES above the insertion point (nearest last, including the parent itself)? */
export const canContain = (
  parentType: string | null,
  childType: string,
  chainTypes: readonly string[],
): boolean => {
  const child = CATALOG[childType];
  if (!child) return false;
  if (child.requiresAncestor && !chainTypes.includes(child.requiresAncestor)) return false;

  if (parentType === null) return !child.partOf || Boolean(child.requiresAncestor);
  const parent = CATALOG[parentType];
  if (!parent) return false;
  if (parent.children === "none" || parent.children === "text") return false;
  if (parent.children === "any") {
    // Strictly-listed parts (a MenuItem, a TabsTab) never ride "any"; parts placed by
    // ancestor (a DialogTitle in a Stack) do, and the requiresAncestor check above already
    // decided whether the ancestor is there.
    return !child.partOf || Boolean(child.requiresAncestor);
  }
  return parent.children.only.includes(childType);
};

/**
 * A stored document re-read against TODAY's catalog: unknown types are dropped, unknown
 * props stripped. Storage is persistence, not truth (the docs' own storage lesson) — a doc
 * saved under an older catalog must load as the part of it the system still speaks, not
 * crash the interpreter with a throw the serializer means for authoring mistakes.
 */
export const sanitizeNode = (n: BuilderNode, parentType?: string): BuilderNode | null => {
  const entry = CATALOG[n.type];
  if (!entry) return null;
  const props: BuilderNode["props"] = {};
  for (const [k, v] of Object.entries(n.props ?? {})) {
    if (k in entry.props) props[k] = v;
  }
  const children = n.children
    ?.map((c) => sanitizeNode(c, n.type))
    .filter((c): c is BuilderNode => c !== null);
  return {
    id: n.id,
    type: n.type,
    props,
    // A seat survives storage only where the PARENT offers that seat and still accepts this
    // type. The first spelling asked `CATALOG[n.type]`, which the two lines above have
    // already proven truthy — a tautology wearing the comment of a real check, and the one
    // repair path for a slot that has come loose.
    ...(n.slot && parentType && seatsIt(parentType, n.slot, n.type) ? { slot: n.slot } : {}),
    ...(typeof n.text === "string" ? { text: n.text } : {}),
    ...(children ? { children: dedupeSeats(children) } : {}),
  };
};

/** Does `parentType` offer this seat, to this type? Both halves — a Card offers no seat at
    all, and a field's seat refuses a Card. */
const seatsIt = (parentType: string, slot: "leading" | "trailing", childType: string): boolean =>
  slotsFor(parentType).includes(slot) && canSit(parentType, childType);

/** One child per seat. Two children claiming `leading` is a tree only one of them survives —
    `slottedChild` takes the first, so the second was drawn nowhere and exported nowhere
    while still sitting in the document. The first keeps the seat; the rest join the flow. */
const dedupeSeats = (children: BuilderNode[]): BuilderNode[] => {
  // The overwhelmingly common list has no seats at all, and `normalizeSeats` reaches this at
  // EVERY list in the tree on every edit — mapping and discarding allocated an array per
  // list for nothing, which is not what "costs a walk and nothing else" means.
  if (!children.some((c) => c.slot)) return children;
  const taken = new Set<string>();
  let changed = false;
  const out = children.map((c) => {
    if (!c.slot) return c;
    if (taken.has(c.slot)) {
      changed = true;
      const rest: BuilderNode = { ...c };
      delete rest.slot;
      return rest;
    }
    taken.add(c.slot);
    return c;
  });
  return changed ? out : children;
};

/**
 * The whole tree, made legal against the catalog WITHOUT losing identity (2026-08-20).
 *
 * `sanitizeNode` always builds a fresh object, which is right for a load and wrong for an
 * edit: the interpreter is memoized on node identity, so rebuilding every node per keystroke
 * would undo the work that took a 280-node document to 12ms. This returns the SAME node
 * wherever nothing was wrong, so an ordinary edit costs a walk and nothing else.
 *
 * What it repairs is the class of damage no single operation owns: a seat that has come
 * loose. `slot` is a field on the node, not on the edge to its parent, so every operation
 * that carries a node across the tree — a canvas drag, a Layers drag, "move out of
 * container", unwrapping the control it sat in — hands the new parent a child still claiming
 * a seat that parent does not offer. `flowChildren` filters it out, and `flowChildren` is
 * what BOTH the interpreter and the serializer walk: the node is in the tree, in Layers and
 * in storage, and drawn and exported nowhere. Measured, before this existed: a Spinner
 * dragged out of a Button's leading seat vanished from the canvas, and the export imported
 * `Spinner` and never used it.
 *
 * Fixing it in the four operations would be four homes for one rule and no home for the
 * fifth operation somebody writes next. This is one, at the choke point every edit passes.
 */
export const normalizeSeats = (roots: BuilderNode[]): BuilderNode[] => {
  const walk = (list: BuilderNode[], parentType: string | null): BuilderNode[] => {
    let changed = false;
    const mapped = list.map((n) => {
      const kids = n.children ? walk(n.children, n.type) : undefined;
      const loose = Boolean(n.slot) && !(parentType && seatsIt(parentType, n.slot!, n.type));
      if (!loose && (kids === undefined || kids === n.children)) return n;
      const next: BuilderNode = { ...n, ...(kids ? { children: kids } : {}) };
      if (loose) delete next.slot;
      changed = true;
      return next;
    });
    const deduped = dedupeSeats(changed ? mapped : list);
    if (deduped !== (changed ? mapped : list)) return deduped;
    return changed ? mapped : list;
  };
  return walk(roots, null);
};

/* ── What resize may write (2026-08-20, Kushagra: "resize on components increases size") ──
   The canvas handle is a real gesture with no raw length behind it. A component's designed
   size vocabulary IS its `size` index, so dragging a corner steps that index — the one
   answer this system has to "make it bigger". Nothing here is judgment in the drag handler;
   the handler asks this, the way the drop handler asks `canContain`.

   The index is uniform (a size step moves height, padding, type and corner together), which
   is why only the CORNER carries it — Figma's own grammar, where a corner means proportional
   and a side means one axis. A side handle would have to write a width, and a stated raw
   length is the value class this builder refuses (see EXCLUDED, and §3: width/height are
   pass-through CSS with no token scale to pick from). */
export const sizeStepsFor = (type: string): readonly string[] | null => {
  const schema = CATALOG[type]?.props.size;
  return schema?.kind === "axis" ? componentAxes[schema.axis] : null;
};

/** The gap bands' vocabulary (2026-08-20): a layout's own `gap`, which is a token index like
    every other distance here, so dragging a band walks the space scale. Asked of the catalog
    rather than of a list of type names — the same question `sizeStepsFor` asks one axis over. */
export const gapStepsFor = (type: string): readonly string[] | null => {
  const schema = CATALOG[type]?.props.gap;
  return schema?.kind === "axis" ? componentAxes[schema.axis] : null;
};

/** The SIDE handles' half: what a node may say about the seat it sits in. Keyed on the
    node's own type (only a layout primitive carries these props at all — §3 keeps layout
    props off components) and on the parent's real layout, which the caller measures rather
    than infers: `direction` is responsive, so the document cannot answer "is this a row"
    for the tier actually on screen — only the DOM can. */
export type SeatVocabulary = { prop: "flexGrow" | "gridArea"; values: readonly string[] };

export const seatVocabularyFor = (type: string, parentLayout: "row" | "column" | "grid" | null): SeatVocabulary | null => {
  if (parentLayout === null || parentLayout === "column") return null;
  const prop = parentLayout === "grid" ? "gridArea" : "flexGrow";
  const schema = CATALOG[type]?.props[prop];
  return schema?.kind === "options" ? { prop, values: schema.values } : null;
};

/**
 * What a slot may hold (2026-08-20).
 *
 * NOT an icon — and that refusal is the interesting one. §8 ships no icon dependency on
 * purpose: icons are `ReactNode` slots the APP fills, so the builder has no icon component
 * to name, and writing `leading={<SearchIcon/>}` into the export would emit an import the
 * reader's app cannot resolve. This builder's whole claim is that what it exports compiles;
 * a placeholder that does not is a worse answer than a written refusal. An icon goes in by
 * hand, in the one line the export already leaves open.
 *
 * What IS here is everything the closed vocabulary can seat honestly: the busy indicator, a
 * shortcut cap, a hosted control (§4's own case — a field with a button in its trailing
 * seat), and small type.
 */
export const SLOT_ACCEPTS = ["Spinner", "Kbd", "Code", "Text", "Button", "Checkbox", "Switch"] as const;

export const slotsFor = (type: string): readonly ("leading" | "trailing")[] => CATALOG[type]?.slots ?? [];

/** May `childType` sit in a slot of `parentType`? A hosted control keeps its own press, so a
    Button in a field's trailing seat is legal; a Card in one is not. */
export const canSit = (parentType: string, childType: string): boolean =>
  slotsFor(parentType).length > 0 && (SLOT_ACCEPTS as readonly string[]).includes(childType);

/**
 * The props several types SHARE — the multi-selection inspector's question (2026-08-20).
 *
 * Same name is not enough: a knob is one knob only if it means the same thing on every type
 * it is offered for. `size` is an axis on a Button and an axis on a Card, so one picker can
 * write both; a prop that is an axis on one type and free text on another is two knobs
 * wearing one name, and offering it would let one gesture write a value the other type
 * refuses. So the schemas must MATCH, structurally.
 *
 * `note` is deliberately excluded from the comparison and from the result: a note is prose
 * about one component's trap, and the panel has no way to show four of them honestly.
 *
 * This is the gesture the closed unions pay for. In a system where `size` is a number, "make
 * these five the same size" is a guess; here it is a pick from a list every one of them
 * already answers.
 */
const schemaKey = (s: PropSchema): string => {
  const rest: Record<string, unknown> = { ...s };
  delete rest.note;
  return JSON.stringify(rest, Object.keys(rest).sort());
};

export const sharedProps = (types: readonly string[]): Record<string, PropSchema> => {
  const entries = types.map((t) => CATALOG[t]).filter((e): e is CatalogEntry => Boolean(e));
  if (entries.length !== types.length || entries.length === 0) return {};
  const [first, ...rest] = entries as [CatalogEntry, ...CatalogEntry[]];
  const out: Record<string, PropSchema> = {};
  for (const [name, schema] of Object.entries(first.props)) {
    const key = schemaKey(schema);
    if (rest.every((e) => e.props[name] !== undefined && schemaKey(e.props[name]!) === key)) {
      out[name] = schema;
    }
  }
  return out;
};

/** The general palette: entries that stand on their own. */
export const PALETTE_FAMILIES = ["Layout", "Surface", "Control", "Type", "Indicator"] as const;
export const paletteEntries = (): [string, CatalogEntry][] =>
  Object.entries(CATALOG).filter(([, e]) => !e.partOf);
