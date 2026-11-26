/**
 * The composition rules one file of code can show (RULES.md, SETTLED.md; SETTLED "The linter").
 *
 * Each rule here is a settled composition call. The screen check already reports most of them
 * on a rendered page, and `Field` warns in the console for one. Those run after the mistake is
 * on screen, and the screen check runs in this repo only. These run while the code is written,
 * in a consumer's editor and in an agent's loop.
 *
 * EVERY RULE READS ONLY WHAT IT CAN SEE. A panel that takes `{children}`, a row filled by a
 * `.map()`, a component of the consumer's own between two of ours: the rule cannot read through
 * any of them, so it says nothing. A missed break costs one screen-check finding later. A false
 * report teaches people to turn the linter off.
 */
import type { Rule } from "eslint";

import { docs } from "./docs.ts";
import {
  attribute,
  childElements,
  createImports,
  descendants,
  elementValue,
  hasSpread,
  kookieName,
  localNameFor,
  readImport,
  stringValue,
  textOf,
  writtenName,
  type Imports,
  type Node,
} from "./jsx.ts";

/** The controls whose box reaches past the field's label (field.tsx, `textBox`). */
const TEXT_BOXES = new Set(["TextField", "TextArea", "Select", "NumberField", "Combobox"]);

const PANELS: Readonly<Record<string, { title: string; close: string }>> = {
  DialogContent: { title: "DialogTitle", close: "DialogClose" },
  SheetContent: { title: "SheetTitle", close: "SheetClose" },
  PopoverContent: { title: "PopoverTitle", close: "PopoverClose" },
};
const PANEL_TITLES = new Set(Object.values(PANELS).map((panel) => panel.title));
const BUTTONS = new Set(["Button", "ToolbarButton"]);

/** Rename an element, both tags, and import the new name when the file does not have it. */
function* rename(
  fixer: Rule.RuleFixer,
  imports: Imports,
  element: Node,
  exported: string,
): Generator<Rule.Fix> {
  const target = localNameFor(imports, exported);
  if (!target) return;
  const opening = element.openingElement as Node;
  yield fixer.replaceText(opening.name as never, target.name);
  const closing = element.closingElement as Node | null;
  if (closing) yield fixer.replaceText(closing.name as never, target.name);
  if (target.importAfter) yield fixer.insertTextAfter(target.importAfter as never, `, ${exported}`);
}

/** Is this a `Field` of ours that holds a text box? Fields with a checkbox or a switch stack fine. */
function isBoxField(imports: Imports, element: Node): boolean {
  if (kookieName(imports, element) !== "Field") return false;
  for (const inner of descendants(element)) {
    const name = kookieName(imports, inner);
    if (name && TEXT_BOXES.has(name)) return true;
  }
  return false;
}

/** Does this `Flex` or `Grid` lay its children in a row, as far as the file says? */
function laysOutInARow(name: string, element: Node): boolean {
  if (name === "Flex") {
    const direction = attribute(element, "direction");
    if (!direction) return true;
    const value = stringValue(direction);
    // A responsive or computed direction is not readable here.
    return value !== null && !value.startsWith("column");
  }
  const columns = attribute(element, "columns");
  // A grid with no `columns` is one column: its children stack.
  if (!columns) return false;
  return stringValue(columns) !== "1";
}

export const preferFieldRow: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    hasSuggestions: true,
    docs: { description: "Two or more fields side by side go in a FieldRow." },
    schema: [],
    messages: {
      sideBySide:
        "Two or more fields sit side by side in `<{{element}}>`. A field's box reaches past its label, so in a row of your own the boxes collide. Use `<FieldRow>`: it sets the space between them and stacks them on a narrow window. Docs: " +
        docs("field"),
      suggestFieldRow: "Replace `<{{element}}>` with `<FieldRow>`.",
    },
  },
  create(context) {
    const imports = createImports();
    return {
      ImportDeclaration(node) {
        readImport(imports, node as unknown as Node);
      },
      JSXElement(node: unknown) {
        const element = node as Node;
        const name = kookieName(imports, element);
        if (name !== "Flex" && name !== "Grid") return;
        if (hasSpread(element) || !laysOutInARow(name, element)) return;
        const children = childElements(element);
        const fields = children.filter((child) => isBoxField(imports, child));
        if (fields.length < 2) return;
        const written = writtenName(element);
        const opening = element.openingElement as Node;
        // The swap is only offered when the row holds fields and nothing else, because a
        // FieldRow gives every child an equal column.
        const canSwap = fields.length === children.length && localNameFor(imports, "FieldRow") !== null;
        context.report({
          node: opening as never,
          messageId: "sideBySide",
          data: { element: written },
          suggest: canSwap
            ? [
                {
                  messageId: "suggestFieldRow",
                  data: { element: written },
                  *fix(fixer) {
                    yield* rename(fixer, imports, element, "FieldRow");
                    // FieldRow owns the gap and the columns. Every prop the row carried was
                    // a layout prop of the container it replaces.
                    for (const entry of (opening.attributes ?? []) as Node[]) {
                      const range = entry.range as [number, number];
                      yield fixer.removeRange([range[0] - 1, range[1]]);
                    }
                  },
                },
              ]
            : [],
        });
      },
    };
  },
};

/** The words on a button, wherever the button is written: itself, or the `render` of a Close. */
function buttonWords(imports: Imports, element: Node): string | null {
  const name = kookieName(imports, element);
  if (name && BUTTONS.has(name)) return textOf(element);
  const rendered = elementValue(attribute(element, "render"));
  if (rendered) {
    const inner = kookieName(imports, rendered);
    if (inner && BUTTONS.has(inner)) return textOf(rendered);
  }
  return textOf(element);
}

/** Is this the panel's X: a Close part that renders an icon-only button? */
function isCloseMark(imports: Imports, element: Node, close: string): boolean {
  if (kookieName(imports, element) !== close) return false;
  const rendered = elementValue(attribute(element, "render"));
  return rendered !== null && attribute(rendered, "iconOnly") !== undefined;
}

export const noDialogCancel: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    hasSuggestions: true,
    docs: { description: "A dialog with a Close button needs no Cancel button." },
    schema: [],
    messages: {
      cancel:
        "This dialog has a Close button and a Cancel button. Close already cancels, so remove Cancel and leave the one main action alone at the bottom. Docs: " +
        docs("dialog"),
      suggestRemove: "Remove the Cancel button.",
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
        if (kookieName(imports, panel) !== "DialogContent") return;
        const inside = [...descendants(panel)];
        if (!inside.some((element) => isCloseMark(imports, element, "DialogClose"))) return;
        const rendered = new Set(
          inside.map((element) => elementValue(attribute(element, "render"))).filter(Boolean),
        );
        for (const element of inside) {
          // A button held in a Close's `render` is reported once, on the Close that owns it.
          if (rendered.has(element)) continue;
          const name = kookieName(imports, element);
          if (name !== "DialogClose" && !(name && BUTTONS.has(name))) continue;
          if (buttonWords(imports, element)?.toLowerCase() !== "cancel") continue;
          context.report({
            node: element as never,
            messageId: "cancel",
            suggest: [{ messageId: "suggestRemove", fix: (fixer) => fixer.remove(element as never) }],
          });
        }
      },
    };
  },
};

export const preferToolbar: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: "A panel's top row is a Toolbar, not a row built by hand." },
    schema: [],
    messages: {
      closeByHand:
        "The Close button of this `<{{panel}}>` is placed by hand. Put it in a `<Toolbar>` as the panel's first child: the toolbar sets its place, its glass and the space under it. Docs: " +
        docs("toolbar"),
      rowByHand:
        "This `<{{row}}>` is a top row built by hand: it holds the panel's title and a button. Use a `<Toolbar>` with a `<ToolbarTitle>` instead. Docs: " +
        docs("toolbar"),
    },
  },
  create(context) {
    const imports = createImports();
    /** Walk the panel, remembering whether a Toolbar is above the current element. */
    function walk(panel: Node, parts: { title: string; close: string }) {
      const visit = (element: Node, inToolbar: boolean): void => {
        for (const child of childElements(element)) {
          const name = kookieName(imports, child);
          // A Navigator draws its own row, and a nested panel is read on its own visit.
          if (name === "Navigator" || (name && name in PANELS)) continue;
          const here = inToolbar || name === "Toolbar";
          if (!here && isCloseMark(imports, child, parts.close)) {
            context.report({
              node: child as never,
              messageId: "closeByHand",
              data: { panel: writtenName(panel) },
            });
          }
          if (!here && (name === "Flex" || name === "Row" || name === null)) {
            const row = childElements(child);
            const hasTitle = row.some((item) => kookieName(imports, item) === parts.title);
            const hasButton = row.some((item) => {
              const itemName = kookieName(imports, item);
              return itemName === parts.close || (itemName !== null && BUTTONS.has(itemName));
            });
            const lower = /^[a-z]/.test(writtenName(child));
            // Only a plain element or a layout of ours is a row we can read. The consumer's
            // own component may be a toolbar of theirs.
            if (hasTitle && hasButton && (name !== null || lower)) {
              context.report({
                node: child.openingElement as never,
                messageId: "rowByHand",
                data: { row: writtenName(child) },
              });
              continue;
            }
          }
          visit(child, here);
        }
      };
      visit(panel, false);
    }
    return {
      ImportDeclaration(node) {
        readImport(imports, node as unknown as Node);
      },
      JSXElement(node: unknown) {
        const panel = node as Node;
        const name = kookieName(imports, panel);
        const parts = name ? PANELS[name] : undefined;
        if (parts) walk(panel, parts);
      },
    };
  },
};

export const preferToolbarTitle: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    hasSuggestions: true,
    docs: { description: "A title in a toolbar is a ToolbarTitle." },
    schema: [],
    messages: {
      title:
        "`<{{element}}>` is a title placed by hand in a `<Toolbar>`. Use `<ToolbarTitle>`: it gives every row title the same size and the right space. Docs: " +
        docs("toolbar"),
      suggestToolbarTitle: "Replace it with `<ToolbarTitle>`.",
      repeated:
        "This `<{{element}}>` repeats the screen's `title`. The Navigator already shows that title under its row, so remove the heading. Docs: " +
        docs("navigator"),
      suggestRemove: "Remove the heading.",
    },
  },
  create(context) {
    const imports = createImports();
    const visitToolbar = (toolbar: Node): void => {
      const visit = (element: Node): void => {
        for (const child of childElements(element)) {
          const name = kookieName(imports, child);
          if (name === "ToolbarTitle" || name === "Toolbar") continue;
          if (name === "Heading" || (name !== null && PANEL_TITLES.has(name))) {
            const written = writtenName(child);
            const target = localNameFor(imports, "ToolbarTitle");
            const closing = child.closingElement as Node | null;
            context.report({
              node: child.openingElement as never,
              messageId: "title",
              data: { element: written },
              suggest:
                target && closing
                  ? [
                      {
                        messageId: "suggestToolbarTitle",
                        *fix(fixer) {
                          const opening = child.openingElement as Node;
                          // A panel's title part stays the element, so the panel keeps its
                          // name. A plain heading's props were its size and weight, which
                          // the row now sets.
                          const render = name === "Heading" ? "" : ` render={<${written} />}`;
                          yield fixer.replaceText(opening as never, `<${target.name}${render}>`);
                          yield fixer.replaceText(closing as never, `</${target.name}>`);
                          if (target.importAfter) {
                            yield fixer.insertTextAfter(target.importAfter as never, ", ToolbarTitle");
                          }
                        },
                      },
                    ]
                  : [],
            });
            continue;
          }
          // Through the clusters a row is written with, and no further.
          if (name === "Flex" || name === "ToolbarGroup") visit(child);
        }
      };
      visit(toolbar);
    };
    return {
      ImportDeclaration(node) {
        readImport(imports, node as unknown as Node);
      },
      JSXElement(node: unknown) {
        const element = node as Node;
        const name = kookieName(imports, element);
        if (name === "Toolbar") visitToolbar(element);
        if (name !== "NavigatorScreen") return;
        const title = stringValue(attribute(element, "title"));
        if (!title) return;
        // The screen's first element, through one layout wrapper.
        let [first] = childElements(element);
        const wrapper = first ? kookieName(imports, first) : null;
        if (first && (wrapper === "Stack" || wrapper === "Box" || wrapper === "Flex")) {
          [first] = childElements(first);
        }
        if (!first || kookieName(imports, first) !== "Heading") return;
        if (textOf(first)?.toLowerCase() !== title.trim().toLowerCase()) return;
        context.report({
          node: first.openingElement as never,
          messageId: "repeated",
          data: { element: writtenName(first) },
          suggest: [{ messageId: "suggestRemove", fix: (fixer) => fixer.remove(first as never) }],
        });
      },
    };
  },
};
