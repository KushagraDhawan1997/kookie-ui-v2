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
/** Margins and paddings each take one value plain distances cannot: `bleed`. On a margin it
    cancels the enclosing surface's padding, so a child reaches the pane's edge — a picture
    across the top of a card (§3, 2026-08-20). On a padding it re-applies the same inset
    (2026-08-29), so a bled region hands the pane's own air back to its content — bleed the
    tabs, re-pad the panel. Separate schemas and not one widened `space`, because `gap` takes
    neither and must not offer the word. */
const marginSpace: PropSchema = { kind: "axis", axis: "marginSpace", optional: true, responsive: true };
const paddingSpace: PropSchema = { kind: "axis", axis: "paddingSpace", optional: true, responsive: true };
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
    props: { gap: space, align: { kind: "options", values: ALIGN, optional: true, responsive: true }, justify: { kind: "options", values: JUSTIFY, optional: true, responsive: true }, p: paddingSpace, ...layoutChildProps },
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
      p: paddingSpace,
      ...layoutChildProps,
    },
    children: "any",
    make: () => node("Flex", { gap: "3", align: "center" }, { children: [] }),
  },
  Grid: {
    family: "Layout",
    blurb: "Equal columns with token gaps.",
    props: { columns: { kind: "options", values: COLUMN_VALUES, labels: COLUMN_LABELS, optional: true, responsive: true }, gap: space, p: paddingSpace, ...layoutChildProps },
    children: "any",
    make: () => node("Grid", { columns: gridColumns(2), gap: "3" }, { children: [] }),
  },
  Box: {
    family: "Layout",
    blurb: "Token padding and margin around whatever it holds — the one sanctioned outer-spacing escape.",
    props: {
      p: paddingSpace,
      px: paddingSpace,
      py: paddingSpace,
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
  Surface: {
    family: "Surface",
    blurb: "A ground — what a card sits ON. One fixed treatment, no fill or edge to pick.",
    props: { size: size() },
    children: "any",
    make: () =>
      node("Surface", { size: "3" }, {
        children: [
          node("Stack", { gap: "3" }, {
            children: [
              node("Card", { size: "2" }, {
                children: [node("Text", { size: "2" }, { text: "A card on a ground" })],
              }),
              node("Card", { size: "2" }, {
                children: [node("Text", { size: "2" }, { text: "And another" })],
              }),
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
    props: { size: size(), tone, emphasis, bordered: bool, loading: bool, disabled: bool, backdrop: bool, "aria-label": text },
    children: "text",
    slots: ["leading", "trailing"],
    make: () => node("Button", {}, { text: "Button" }),
  },
  Field: {
    family: "Control",
    blurb: "The unit that makes one input make sense: a label, a description, the control and an error, wired so they are read as one thing. The index prices all four.",
    props: { size: size(), disabled: bool },
    children: { only: ["FieldLabel", "FieldItem", "FieldDescription", "FieldError", "TextField", "TextArea", "Checkbox", "Switch", "Select", "SegmentedControl", "Slider", "RadioGroup"] },
    make: () =>
      node("Field", {}, {
        children: [
          node("FieldLabel", {}, { text: "Email" }),
          node("TextField", { placeholder: "mira@kookie.dev", "aria-label": "Email" }),
          node("FieldDescription", {}, { text: "We use this for receipts." }),
        ],
      }),
  },
  FieldItem: {
    family: "Control",
    blurb: "One option in a group: a mark, its own name, its own line. The label inside names the mark beside it, not the group.",
    props: { disabled: bool },
    children: { only: ["FieldLabel", "FieldDescription", "Checkbox", "Radio", "Switch"] },
    requiresAncestor: "Field",
    partOf: "Field",
    make: () =>
      /* A checkbox and not a radio: an item dropped on its own has no RadioGroup around it,
         and the grammar refuses a Radio without one — which is the law catching this preset
         before a person could have built an export that throws. */
      node("FieldItem", {}, {
        children: [
          node("Checkbox", {}),
          node("FieldLabel", {}, { text: "Send a copy to me" }),
          node("FieldDescription", {}, { text: "One message, to the address above." }),
        ],
      }),
  },
  FieldLabel: {
    family: "Control",
    blurb: "The field's name, associated by id — clicking it lands the caret.",
    props: {},
    children: "text",
    requiresAncestor: "Field",
    partOf: "Field",
    make: () => node("FieldLabel", {}, { text: "Label" }),
  },
  FieldDescription: {
    family: "Control",
    blurb: "What to enter. Sits under the control, above the error — everything about a control pools below it.",
    props: {},
    children: "text",
    requiresAncestor: "Field",
    partOf: "Field",
    make: () => node("FieldDescription", {}, { text: "What to enter here." }),
  },
  FieldError: {
    family: "Control",
    blurb: "What went wrong, after it went wrong. Last in the field, so it arrives without moving anything already on screen, and only while the field is invalid.",
    props: {},
    children: "text",
    requiresAncestor: "Field",
    partOf: "Field",
    make: () => node("FieldError", {}, { text: "That is not a valid entry." }),
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
  Breadcrumb: {
    family: "Type",
    blurb: "The path to where you are: a named landmark holding an ordered list of the places above this one.",
    // `size` is stated ONCE, on the nav, and every crumb inherits it — a path of mixed steps
    // is not a thing anyone means, so no part below carries one.
    props: { size: typeSize, label: text },
    children: { only: ["BreadcrumbItem"] },
    make: () =>
      node("Breadcrumb", {}, {
        children: [
          node("BreadcrumbItem", {}, {
            children: [node("BreadcrumbLink", { href: "#" }, { text: "Home" })],
          }),
          node("BreadcrumbItem", {}, {
            children: [node("BreadcrumbLink", { href: "#" }, { text: "Components" })],
          }),
          node("BreadcrumbItem", {}, {
            children: [node("BreadcrumbPage", {}, { text: "Breadcrumb" })],
          }),
        ],
      }),
  },
  BreadcrumbItem: {
    family: "Type",
    blurb: "One place on the path. It draws the chevron after itself, and the last one's is not drawn.",
    props: {},
    /* NOT `BreadcrumbEllipsis`: it is EXCLUDED (see below), and a grammar that still offered
       it would put an insert on the menu that cannot render. */
    children: { only: ["BreadcrumbLink", "BreadcrumbPage"] },
    partOf: "Breadcrumb",
    make: () =>
      node("BreadcrumbItem", {}, { children: [node("BreadcrumbLink", { href: "#" }, { text: "Level" })] }),
  },
  BreadcrumbLink: {
    family: "Type",
    blurb: "A place above this one, and a way back to it. Muted at rest, coming forward with its underline under the pointer.",
    props: { href: text },
    children: "text",
    partOf: "Breadcrumb",
    make: () => node("BreadcrumbLink", { href: "#" }, { text: "Level" }),
  },
  BreadcrumbPage: {
    family: "Type",
    blurb: "Where you are: the end of the path, in the full ink. Not a link, because there is nothing to follow.",
    props: {},
    children: "text",
    partOf: "Breadcrumb",
    make: () => node("BreadcrumbPage", {}, { text: "This page" }),
  },
  Table: {
    family: "Type",
    blurb: "Rows and columns as the real table element, scrolling sideways in its own box. Inert rows.",
    props: { size: size() },
    children: { only: ["TableHeader", "TableBody", "TableCaption"] },
    make: () =>
      node("Table", {}, {
        children: [
          node("TableHeader", {}, {
            children: [
              node("TableRow", {}, {
                children: [
                  node("TableHead", {}, { text: "Name" }),
                  node("TableHead", { align: "end" }, { text: "Amount" }),
                ],
              }),
            ],
          }),
          node("TableBody", {}, {
            children: [
              node("TableRow", {}, {
                children: [
                  node("TableCell", {}, { text: "Acme Studio" }),
                  node("TableCell", { align: "end" }, { text: "$1,250.00" }),
                ],
              }),
              node("TableRow", {}, {
                children: [
                  node("TableCell", {}, { text: "Northwind" }),
                  node("TableCell", { align: "end" }, { text: "$640.00" }),
                ],
              }),
            ],
          }),
        ],
      }),
  },
  TableHeader: {
    family: "Type",
    blurb: "The head section: a row of TableHeads.",
    props: {},
    children: { only: ["TableRow"] },
    partOf: "Table",
    make: () => node("TableHeader", {}, { children: [node("TableRow", {}, { children: [node("TableHead", {}, { text: "Name" })] })] }),
  },
  TableBody: {
    family: "Type",
    blurb: "The body section: rows of TableCells.",
    props: {},
    children: { only: ["TableRow"] },
    partOf: "Table",
    make: () => node("TableBody", {}, { children: [node("TableRow", {}, { children: [node("TableCell", {}, { text: "Cell" })] })] }),
  },
  TableRow: {
    family: "Type",
    blurb: "One row, inert.",
    props: {},
    children: { only: ["TableHead", "TableCell"] },
    partOf: "Table",
    make: () => node("TableRow", {}, { children: [node("TableCell", {}, { text: "Cell" })] }),
  },
  TableHead: {
    family: "Type",
    blurb: "A header cell, in the muted ink.",
    props: { align: { kind: "options", values: ["start", "center", "end"], optional: true } },
    children: "text",
    partOf: "Table",
    make: () => node("TableHead", {}, { text: "Name" }),
  },
  TableCell: {
    family: "Type",
    blurb: "A body cell.",
    props: { align: { kind: "options", values: ["start", "center", "end"], optional: true } },
    children: "text",
    partOf: "Table",
    make: () => node("TableCell", {}, { text: "Cell" }),
  },
  TableCaption: {
    family: "Type",
    blurb: "What the table is, drawn under it. Also its accessible name.",
    props: {},
    children: "text",
    partOf: "Table",
    make: () => node("TableCaption", {}, { text: "Invoices this month" }),
  },
  Toggle: {
    family: "Control",
    blurb: "A button that stays pressed. Off is quiet, on is the medium wash; the tone says what on means.",
    props: { size: size(), tone, bordered: bool, defaultPressed: bool, disabled: bool, backdrop: bool, value: text },
    children: "text",
    make: () => node("Toggle", {}, { text: "Bold" }),
  },
  ToggleGroup: {
    family: "Control",
    blurb: "Shared state for independent toggles: one value array, arrow keys between them. Draws nothing.",
    props: { "aria-label": text },
    children: { only: ["Toggle"] },
    make: () =>
      node("ToggleGroup", { "aria-label": "Format" }, {
        children: [
          node("Toggle", { value: "bold" }, { text: "Bold" }),
          node("Toggle", { value: "italic" }, { text: "Italic" }),
        ],
      }),
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
    /* The hand-written pairing above is what a group looks like OUTSIDE a Field. Inside one,
       FieldItem does the wiring and the layout, which is the shape the docs teach. */
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
    props: { size: size(), defaultValue: text, backdrop: bool, "aria-label": text },
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
  Accordion: {
    family: "Control",
    blurb: "Sections that open and close under headings that are rows. One open at a time unless multiple.",
    props: { size: size(), multiple: bool },
    children: { only: ["AccordionItem"] },
    make: () =>
      node("Accordion", {}, {
        children: [
          node("AccordionItem", { value: "a" }, {
            children: [
              node("AccordionTrigger", {}, { text: "Shipping" }),
              node("AccordionPanel", {}, { children: [node("Text", { size: "2", emphasis: "medium" }, { text: "Orders ship within two business days." })] }),
            ],
          }),
          node("AccordionItem", { value: "b" }, {
            children: [
              node("AccordionTrigger", {}, { text: "Returns" }),
              node("AccordionPanel", {}, { children: [node("Text", { size: "2", emphasis: "medium" }, { text: "Thirty days from delivery." })] }),
            ],
          }),
        ],
      }),
  },
  AccordionItem: {
    family: "Control",
    blurb: "One section: a trigger and its panel.",
    props: { value: text, disabled: bool },
    children: { only: ["AccordionTrigger", "AccordionPanel"] },
    partOf: "Accordion",
    make: () =>
      node("AccordionItem", { value: "new" }, {
        children: [
          node("AccordionTrigger", {}, { text: "Section" }),
          node("AccordionPanel", {}, { children: [node("Text", { size: "2", emphasis: "medium" }, { text: "Content." })] }),
        ],
      }),
  },
  AccordionTrigger: {
    family: "Control",
    blurb: "The section's heading: a row with the disclosure chevron.",
    props: {},
    children: "text",
    partOf: "Accordion",
    make: () => node("AccordionTrigger", {}, { text: "Section" }),
  },
  AccordionPanel: {
    family: "Control",
    blurb: "The section's content; its words start under the heading's label.",
    props: {},
    children: "any",
    partOf: "Accordion",
    make: () => node("AccordionPanel", {}, { children: [node("Text", { size: "2", emphasis: "medium" }, { text: "Content." })] }),
  },
  Avatar: {
    family: "Type",
    blurb: "A person or a thing as a round picture, with initials standing in. One line of the text beside it.",
    props: { size: typeSize, fallback: text, src: text, alt: text, backdrop: bool },
    children: "none",
    make: () => node("Avatar", { fallback: "KD" }),
  },
  AvatarGroup: {
    family: "Type",
    blurb: "Several avatars overlapped and ringed. A size here reaches every avatar that states none.",
    props: { size: typeSize },
    children: { only: ["Avatar"] },
    make: () =>
      node("AvatarGroup", { size: "5" }, {
        children: [
          node("Avatar", { fallback: "KD" }),
          node("Avatar", { fallback: "MC" }),
          node("Avatar", { fallback: "+3" }),
        ],
      }),
  },
  Badge: {
    family: "Type",
    blurb: "The count or the dot that waits on a thing. Loud by nature; a share of its line.",
    props: { size: typeSize, tone, "aria-label": text },
    children: "text",
    make: () => node("Badge", {}, { text: "3" }),
  },
  Chip: {
    family: "Type",
    blurb: "A word or a count stating what the thing beside it is. Tone is the category, not the volume; unset size takes the line it sits beside.",
    // NOT bare `typeProps`: a chip is the one member of that shared set that carries a FILL, so
    // it is the one that can be asked for the theme's material. Code, Kbd and Badge take the
    // set as it stands.
    props: { ...typeProps, backdrop: bool },
    children: "text",
    make: () => node("Chip", { tone: "success" }, { text: "Live" }),
  },
  Code: {
    family: "Type",
    blurb: "Inline code: the mono slot in a subtle fill. Unset size takes the line it sits in.",
    props: typeProps,
    children: "text",
    make: () => node("Code", {}, { text: "pnpm run ci" }),
  },
  CodeBlock: {
    family: "Type",
    blurb:
      "A block of code in a recessed well that scrolls sideways instead of wrapping. Size sets the pane and the code together.",
    props: { size: size(false), hosted: bool },
    children: "text",
    make: () =>
      node(
        "CodeBlock",
        { size: "2" },
        { text: 'const theme = { appearance: "dark" }' },
      ),
  },
  Link: {
    family: "Type",
    blurb: "A link. Unset size takes the line it sits in; tone rests on accent.",
    // NOT `typeProps`: the type family's shared set carries `emphasis`, and Link refuses it
    // (the ink ladder's lower rungs sit at and below the reading floor, and a link that has
    // faded is the one element whose job it was to be found).
    props: { size: typeSize, weight, tone, href: text },
    children: "text",
    make: () => node("Link", { href: "#" }, { text: "Read the argument" }),
  },
  Kbd: {
    family: "Type",
    blurb: "A key cap. Unset size takes the line, like Code.",
    props: typeProps,
    children: "text",
    make: () => node("Kbd", {}, { text: "⌘K" }),
  },

  Row: {
    family: "Control",
    blurb: "One row in a list: search results, commands, settings, files. Its height is its text line plus an inset, not a button's.",
    props: { size: size(), tone, current: bool, disabled: bool },
    children: "text",
    make: () => node("Row", {}, { text: "Deployments" }),
  },

  /* ── Indicators ─────────────────────────────────────────────────────────────────────── */
  Notice: {
    family: "Surface",
    blurb: "A condition that is true right now, on the region it is about. Takes space, never floats; tone is the category, not the volume.",
    props: { size: size(), tone, backdrop: bool },
    children: "text",
    make: () => node("Notice", { tone: "warning" }, { text: "Your certificate expires in six days." }),
  },
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

  Popover: {
    family: "Surface",
    blurb: "An anchored panel with the page still live behind it. Dropped whole; the content is yours to compose.",
    props: { size: size() },
    children: { only: ["PopoverTrigger", "PopoverContent"] },
    phantom: true,
    make: () =>
      node("Popover", { size: "2" }, {
        children: [
          node("PopoverTrigger", {}, { children: [node("Button", { emphasis: "quiet", bordered: true }, { text: "Open popover" })] }),
          node("PopoverContent", {}, {
            children: [
              node("Stack", { gap: "4" }, {
                children: [
                  node("Stack", { gap: "1" }, {
                    children: [
                      node("PopoverTitle", {}, { text: "Popover title" }),
                      node("PopoverDescription", {}, { text: "What this panel is for, said quietly." }),
                    ],
                  }),
                  node("Flex", { gap: "3", justify: "flex-end" }, {
                    children: [
                      node("PopoverClose", {}, { children: [node("Button", { emphasis: "quiet" }, { text: "Cancel" })] }),
                      node("PopoverClose", {}, { children: [node("Button", { emphasis: "loud" }, { text: "Save" })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
  },
  PopoverTrigger: {
    family: "Surface",
    blurb: "The button that opens it.",
    props: {},
    children: { only: ["Button"] },
    partOf: "Popover",
    renderChild: true,
    make: () => node("PopoverTrigger", {}, { children: [node("Button", { emphasis: "quiet", bordered: true }, { text: "Open" })] }),
  },
  PopoverContent: {
    family: "Surface",
    blurb: "The panel: portals, anchors itself, dismisses on an outside press. Its layout is yours.",
    props: {},
    children: "any",
    partOf: "Popover",
    make: () => node("PopoverContent", {}, { children: [] }),
  },
  PopoverTitle: {
    family: "Surface",
    blurb: "The panel's accessible name — a real heading at the card-title step.",
    props: {},
    children: "text",
    requiresAncestor: "PopoverContent",
    partOf: "Popover",
    make: () => node("PopoverTitle", {}, { text: "Popover title" }),
  },
  PopoverDescription: {
    family: "Surface",
    blurb: "The supporting line, announced with the title.",
    props: {},
    children: "text",
    requiresAncestor: "PopoverContent",
    partOf: "Popover",
    make: () => node("PopoverDescription", {}, { text: "What this panel is for, said quietly." }),
  },
  PopoverClose: {
    family: "Surface",
    blurb: "Dismisses the panel. Wrap a real Button.",
    props: {},
    children: { only: ["Button"] },
    requiresAncestor: "PopoverContent",
    partOf: "Popover",
    renderChild: true,
    make: () => node("PopoverClose", {}, { children: [node("Button", { emphasis: "quiet" }, { text: "Close" })] }),
  },
  Tooltip: {
    family: "Surface",
    blurb: "The name of a control, shown to a pointer resting on it. Dropped whole.",
    props: {},
    children: { only: ["TooltipTrigger", "TooltipContent"] },
    phantom: true,
    make: () =>
      node("Tooltip", {}, {
        children: [
          node("TooltipTrigger", {}, { children: [node("Button", { emphasis: "quiet" }, { text: "Undo" })] }),
          node("TooltipContent", {}, { text: "Undo" }),
        ],
      }),
  },
  TooltipTrigger: {
    family: "Surface",
    blurb: "The control the tooltip names.",
    props: {},
    children: { only: ["Button"] },
    partOf: "Tooltip",
    renderChild: true,
    make: () => node("TooltipTrigger", {}, { children: [node("Button", { emphasis: "quiet" }, { text: "Undo" })] }),
  },
  TooltipContent: {
    family: "Surface",
    blurb: "The words. One short line, and it may only restate the control's own name.",
    props: {},
    children: "text",
    requiresAncestor: "Tooltip",
    partOf: "Tooltip",
    make: () => node("TooltipContent", {}, { text: "Undo" }),
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
    name: "ContextMenu",
    why: "A context menu is opened by right-clicking a region, and on this canvas right-click already belongs to the editor: it selects what is under the pointer and opens the editor's own menu. A ContextMenu placed here could never be opened, which makes it a control that promises something it does not have. Its trigger and content are excluded with it, because neither means anything outside the pair.",
  },
  {
    name: "ContextMenuTrigger",
    why: "ContextMenu's own exclusion, inherited: a region that answers a right-click is nothing without the menu it opens.",
  },
  {
    name: "ContextMenuContent",
    why: "ContextMenu's own exclusion, inherited: the panel exists only for the gesture that summons it.",
  },
  {
    name: "TooltipProvider",
    why: "Configuration for a REGION rather than a thing that goes in one: it states the delay every tooltip inside it waits and groups them so a row of buttons reads as one row. It belongs once near the root of an app, which is outside anything this canvas composes. Every Tooltip placed here works without it, on the library's own timing.",
  },
  {
    name: "Composer",
    why: "A composer is a form, and its whole point is the handler it submits to — onSubmit, onFiles, and a status the app drives while a reply streams. The builder exports JSX and cannot express a handler, so a placeable Composer would export a form that submits nowhere, holding a send button that says it is sending when nothing is. Its parts are excluded with it: an input, a row and a send button mean nothing outside the form that wires them.",
  },
  {
    name: "ComposerInput",
    why: "A part of the Composer, which the builder excludes. It is the one element the composer's focus ring watches and the one the form submits from, so outside a Composer it is a bare textarea with no box, no ring and nothing to send to.",
  },
  {
    name: "ComposerRow",
    why: "A part of the Composer, which the builder excludes. It states a composer's own rhythm — the alignment, the split and the spacing under the text — so on a canvas with no composer it is a Flex that has stopped saying why.",
  },
  {
    name: "ComposerSend",
    why: "A part of the Composer, which the builder excludes. Its four states are read off a status the app drives, and stopping a reply is an action on a request the builder cannot express, so a placed one would be a button permanently claiming to be ready.",
  },
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
    name: "ShellPaneHeader",
    why: "A part of the Shell: a pane's own chrome row, whose height and floating reach both derive from the pane it sits in. Outside a pane there is nothing to derive from, and the frame is what this canvas composes inside rather than places.",
  },
  {
    name: "ShellPaneFooter",
    why: "A part of the Shell, the pane chrome row's other end. The same derivations, the same reason.",
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
  {
    name: "NavTree",
    why: "Tree's own exclusion, inherited with the machine: its hierarchy is data (`items`), which the canvas cannot edit.",
  },
  {
    name: "BreadcrumbEllipsis",
    why: "The levels it opens are DATA (`items`), and they are REQUIRED — the component exists so that an ellipsis opening nothing cannot be written. The canvas has no way to edit a list of places, so a placeable one could only ever be built with no items: it would throw where it stands, and the exported JSX would not compile. Tree's exclusion, arriving one component over. It joins the palette the day `items` has a canvas-editable shape.",
  },
  {
    name: "Tree",
    why: "Its hierarchy is DATA (`items`), not children — the machine renders visible nodes as a flat list from a value — and this builder composes JSX trees. A placeable Tree would need the inspector to be a tree editor for the prop, which is a second builder inside this one. It joins the palette if `items` ever gains a canvas-editable shape.",
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

  // A card does not go inside a card (2026-08-21). A Card is an object with its own plane, so
  // two stacked states a relationship the system does not have — and unlike most of what this
  // grammar refuses, the mistake is easy to make and invisible once made, because a nested
  // card renders as a perfectly ordinary card.
  //
  // Read against the whole ANCESTOR CHAIN rather than the immediate parent, which is the same
  // reach the package's runtime guard has: a card three layouts deep inside a card is the
  // shape people actually write. The two answers must agree, so a law drives both.
  //
  // A DIALOG's chain holds no Card, so a card inside a panel stays placeable — matching the
  // package, where a portal's own Theme resets the plane.
  if (childType === "Card" && (parentType === "Card" || chainTypes.includes("Card"))) return false;

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
