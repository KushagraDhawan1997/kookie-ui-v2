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

const typeProps = { size: typeSize, weight, emphasis, tone };

export const CATALOG: Record<string, CatalogEntry> = {
  /* ── Layout ─────────────────────────────────────────────────────────────────────────── */
  Stack: {
    family: "Layout",
    blurb: "A column of things with one stated gap.",
    props: { gap: space, align: { kind: "options", values: ALIGN, optional: true, responsive: true }, justify: { kind: "options", values: JUSTIFY, optional: true, responsive: true }, p: space },
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
    },
    children: "any",
    make: () => node("Flex", { gap: "3", align: "center" }, { children: [] }),
  },
  Grid: {
    family: "Layout",
    blurb: "Equal columns with token gaps.",
    props: { columns: { kind: "options", values: COLUMN_VALUES, labels: COLUMN_LABELS, optional: true, responsive: true }, gap: space, p: space },
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
      m: space,
      mx: space,
      my: space,
      container: {
        kind: "boolean",
        note:
          "Makes THIS box the region per-tier values inside it measure. Mark boxes layout already sizes — a sidebar with a width, a grid cell, a growing column. A container left to shrink-wrap renders 0px wide (the recorded §2 defect that made containment opt-in).",
      },
      backdrop: bool,
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
      (["density", "radius", "pointer", "surfaceLook", "depth", "material"] as const).map((axis) => [
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
    props: { size: size(), tone, emphasis, bordered: bool, loading: bool, disabled: bool },
    children: "text",
    make: () => node("Button", {}, { text: "Button" }),
  },
  TextField: {
    family: "Control",
    blurb: "A single-line field. No emphasis and no tone: a form does not rank its fields.",
    props: { size: size(), placeholder: text, "aria-label": text, disabled: bool, backdrop: bool },
    children: "none",
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
    props: { defaultValue: text },
    children: "any",
    make: () =>
      node("RadioGroup", { defaultValue: "a" }, {
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
    props: { value: text, size: size(), disabled: bool },
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
    props: { size: size() },
    children: { only: ["TabsTab"] },
    partOf: "Tabs",
    make: () => node("TabsList", {}, { children: [node("TabsTab", { value: "one" }, { text: "First" })] }),
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
export const sanitizeNode = (n: BuilderNode): BuilderNode | null => {
  const entry = CATALOG[n.type];
  if (!entry) return null;
  const props: BuilderNode["props"] = {};
  for (const [k, v] of Object.entries(n.props ?? {})) {
    if (k in entry.props) props[k] = v;
  }
  const children = n.children?.map(sanitizeNode).filter((c): c is BuilderNode => c !== null);
  return {
    id: n.id,
    type: n.type,
    props,
    ...(typeof n.text === "string" ? { text: n.text } : {}),
    ...(children ? { children } : {}),
  };
};

/** The general palette: entries that stand on their own. */
export const PALETTE_FAMILIES = ["Layout", "Surface", "Control", "Type", "Indicator"] as const;
export const paletteEntries = (): [string, CatalogEntry][] =>
  Object.entries(CATALOG).filter(([, e]) => !e.partOf);
