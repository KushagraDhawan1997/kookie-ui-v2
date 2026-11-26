/**
 * The pieces a screen cannot do without, where one file of code shows that one is missing
 * (RULES 1, 24, 29; SETTLED "The linter").
 *
 * A control with no name, a field with no label, a dialog with no title. A screen reader says
 * nothing useful for any of them, and a sighted person meets a box that does not say what it is
 * for. The rule cannot invent the words, so none of these has a fix: it reports, and the person
 * or the agent writes the name.
 *
 * "MISSING" IS ONLY SAID WHEN THE WHOLE TREE IS READABLE. A `{children}`, a spread, or a
 * component of the caller's own may carry the piece, so any of them makes the rule silent
 * (`isReadable`, jsx.ts).
 */
import type { Rule } from "eslint";

import { docs } from "./docs.ts";
import {
  attribute,
  createImports,
  descendants,
  hasSpread,
  isReadable,
  kookieName,
  readImport,
  stringValue,
  writtenName,
  type Node,
} from "./jsx.ts";

/** The controls a `Field` names. */
const CONTROLS = new Set([
  "TextField",
  "TextArea",
  "Select",
  "NumberField",
  "Combobox",
  "Checkbox",
  "Switch",
  "Slider",
  "RadioGroup",
  "SegmentedControl",
]);

const ICON_BUTTONS = new Set(["Button", "ToolbarButton"]);

/** The panels that must name themselves, and the part that names each. A popover may go untitled. */
const TITLED: Readonly<Record<string, string>> = {
  DialogContent: "DialogTitle",
  SheetContent: "SheetTitle",
};

/** Does the element name itself for assistive technology? An empty string is not a name. */
function hasName(element: Node): boolean {
  for (const key of ["aria-label", "aria-labelledby"]) {
    const entry = attribute(element, key);
    if (!entry) continue;
    const value = stringValue(entry);
    // A computed value is trusted; a written one must hold a word.
    if (value === null || value.trim().length > 0) return true;
  }
  return false;
}

/** Is a boolean prop on, as far as the file says? `iconOnly` and `iconOnly={true}` are. */
function isOn(element: Node, name: string): boolean {
  const entry = attribute(element, name);
  if (!entry) return false;
  const value = entry.value as Node | null | undefined;
  if (!value) return true;
  if (value.type !== "JSXExpressionContainer") return false;
  const inner = value.expression as Node | undefined;
  return inner?.type === "Literal" && inner.value === true;
}

export const requireAccessibleName: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "An icon-only button has a name (RULES 29)." },
    schema: [],
    messages: {
      iconButton:
        "This icon-only `<{{element}}>` has no name, so a screen reader cannot say what it does. Add `aria-label` with a verb, for example `aria-label=\"Close\"`. Docs: " +
        docs("button"),
    },
  },
  create(context) {
    const imports = createImports();
    // In a TypeScript file the props type already refuses an icon-only button with no name,
    // and prints its own sentence. A second report of it is noise. What the type cannot see
    // is a JavaScript file, and a name that is an empty string.
    const typed = /\.[cm]?tsx?$/.test(context.filename);
    return {
      ImportDeclaration(node) {
        readImport(imports, node as unknown as Node);
      },
      JSXOpeningElement(node: unknown) {
        const element = node as Node;
        const name = kookieName(imports, element);
        if (!name || !ICON_BUTTONS.has(name)) return;
        if (!isOn(element, "iconOnly") || hasSpread(element) || hasName(element)) return;
        const written = attribute(element, "aria-label") ?? attribute(element, "aria-labelledby");
        if (typed && !written) return;
        context.report({
          node: (written ?? element) as never,
          messageId: "iconButton",
          data: { element: writtenName(element) },
        });
      },
    };
  },
};

export const requireFieldLabel: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "A field has a label (RULES 24)." },
    schema: [],
    messages: {
      field:
        "This `<Field>` has no label, so nothing says what the control is for. A placeholder is not a label. Add a `<FieldLabel>` as the field's first child. Docs: " +
        docs("field"),
    },
  },
  create(context) {
    const imports = createImports();
    return {
      ImportDeclaration(node) {
        readImport(imports, node as unknown as Node);
      },
      JSXElement(node: unknown) {
        const field = node as Node;
        if (kookieName(imports, field) !== "Field") return;
        if (hasSpread(field) || !isReadable(imports, field)) return;
        const inside = [...descendants(field)];
        const names = inside.map((element) => kookieName(imports, element));
        if (!names.some((name) => name !== null && CONTROLS.has(name))) return;
        if (names.includes("FieldLabel")) return;
        if (inside.some((element) => hasName(element))) return;
        context.report({ node: field.openingElement as never, messageId: "field" });
      },
    };
  },
};

export const requireDialogTitle: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: "A dialog or a sheet has a title (RULES 1 and 2)." },
    schema: [],
    messages: {
      panel:
        "This `<{{panel}}>` has no title, so it opens without saying what it is. Add a `<Toolbar>` with `<ToolbarTitle render={<{{title}} />}>`, or a `<{{title}}>` under the toolbar. Docs: " +
        docs("dialog"),
    },
  },
  create(context) {
    const imports = createImports();
    return {
      ImportDeclaration(node) {
        readImport(imports, node as unknown as Node);
      },
      JSXElement(node: unknown) {
        const panel = node as Node;
        const name = kookieName(imports, panel);
        const title = name ? TITLED[name] : undefined;
        if (!title) return;
        if (hasSpread(panel) || hasName(panel) || !isReadable(imports, panel)) return;
        const names = [...descendants(panel)].map((element) => kookieName(imports, element));
        // A Navigator names each screen itself, and a ToolbarTitle with no words shows the
        // title of the Page in the panel.
        if (names.includes(title) || names.includes("Navigator") || names.includes("Page")) return;
        context.report({
          node: panel.openingElement as never,
          messageId: "panel",
          data: { panel: writtenName(panel), title },
        });
      },
    };
  },
};
