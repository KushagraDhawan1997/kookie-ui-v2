/**
 * The escapes, used as escapes from the system rather than escapes to the CSS it does not own.
 *
 * `className` and `style` both exist on purpose. A consumer's own class name belongs on the
 * first, and everything CSS has that this system has no prop for belongs on the second — that
 * is ENGINEERING §5, and it is why this rule warns rather than errors: an escape is not a
 * defect, and only two shapes of it are.
 *
 * THE FIRST is a utility class, which is a whole parallel spacing system arriving one string
 * at a time. The grammar and the answer for each head live in utility-classes.ts.
 *
 * THE SECOND is a raw value where the system already has the number: a colour written out
 * rather than resolved through `tone` and `emphasis`, or a length on a property the space
 * scale owns. Which properties those are is DERIVED from the Box prop table's space-scaled
 * rows (owned-properties.ts) and is deliberately narrow — `width`, `height` and `display` take
 * raw CSS through their own props, so `style={{ maxWidth: "22rem" }}` escapes nothing and this
 * rule must stay silent on it. That silence is not politeness: `<ScrollArea style={{ height:
 * "160px" }}>` is a REQUIRED escape (a scroller has to be told how tall it is, which is why it
 * is the builder's one catalog exclusion), and a rule that flagged it would be wrong about the
 * system rather than about the code.
 */

import type { Rule } from "eslint";

import { LAYOUT_SYMBOLS, typeRefusalsFor } from "../system/refusal-sets.ts";

import { isOwnedProperty, kebab, normalizeProperty, propFor } from "./owned-properties.ts";
import { isRawColor, isRawLength } from "./raw-values.ts";
import { createTracker, isKookieElement, recordImport, type SymbolTracker } from "./kookie-symbols.ts";
import { matchUtility } from "./utility-classes.ts";

type Node = { type: string; [key: string]: unknown };

/** The class names in a `className` we can actually read. An expression is not one. */
function classNamesOf(value: Node | undefined): { names: string[]; node: Node } | null {
  if (!value) return null;
  if (value.type === "Literal" && typeof value.value === "string") {
    return { names: value.value.split(/\s+/).filter(Boolean), node: value };
  }
  if (value.type === "JSXExpressionContainer") {
    const inner = value.expression as Node | undefined;
    if (!inner) return null;
    if (inner.type === "Literal" && typeof inner.value === "string") {
      return { names: inner.value.split(/\s+/).filter(Boolean), node: inner };
    }
    // A template literal with no interpolation is a string written with the other quotes.
    if (inner.type === "TemplateLiteral" && (inner.expressions as unknown[]).length === 0) {
      const quasis = inner.quasis as Array<{ value: { cooked?: string | null } }>;
      const text = quasis.map((quasi) => quasi.value.cooked ?? "").join("");
      return { names: text.split(/\s+/).filter(Boolean), node: inner };
    }
  }
  return null;
}

/** The `{ key: literal }` pairs in a `style`. A spread or a computed key is unreadable. */
function styleEntries(value: Node | undefined): Array<{ key: string; literal: Node }> {
  if (value?.type !== "JSXExpressionContainer") return [];
  const object = value.expression as Node | undefined;
  if (object?.type !== "ObjectExpression") return [];
  const out: Array<{ key: string; literal: Node }> = [];
  for (const property of (object.properties ?? []) as Node[]) {
    if (property.type !== "Property" || property.computed === true) continue;
    const key = property.key as Node;
    const name =
      key.type === "Identifier"
        ? String(key.name)
        : key.type === "Literal" && typeof key.value === "string"
          ? key.value
          : null;
    if (name === null) continue;
    const literal = property.value as Node;
    if (literal.type !== "Literal") continue;
    out.push({ key: name, literal });
  }
  return out;
}

export const noEscapeAbuse: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "An escape reaches the CSS this system does not own. A utility class, or a raw value the system already has a name for, reaches past one that it does.",
    },
    schema: [],
    messages: {
      // Every message names the replacement. A warning that only says "do not" leaves the call
      // site to invent something, and what it invents is usually a wrapper div with a class.
      utility:
        "`{{className}}` is a utility class on `<{{element}}>` — {{sentence}}. Utility classes are not shipped, and one arriving through `className` is a second spacing system.",
      rawColor:
        "`{{property}}: {{value}}` writes a colour out on `<{{element}}>`. Appearance is resolved output: choose it with the `tone` and `emphasis` props, or reach a token through `style` as `var(--color-…)`.",
      ownedLength:
        "`{{property}}: {{value}}` is a raw length on `<{{element}}>` for a property the `{{prop}}` prop owns. Pass `{{prop}}` with a space index; `style` is for the CSS this system has no prop for.",
      // The SAME defect the message above would otherwise commit, one element over: `propFor`
      // reads the Box prop table, and only the four layouts take those props — so telling a
      // Button to "pass `m`" named a prop `refused.ts` refuses on it, which is a report whose
      // repair does not compile (2026-09-07, the audit). The escape is the refusal's own
      // sentence, taken from the one home that states it.
      ownedLengthRefused:
        "`{{property}}: {{value}}` is a raw length on `<{{element}}>`, and `{{prop}}` is not a prop it takes. {{why}}",
      ownedLengthInner:
        "`{{property}}: {{value}}` is a raw length on `<{{element}}>`. Inner spacing is the system's: it is priced per `size` and re-picked per `density`, so a component takes no `{{prop}}`. Wrap the content in a `<Box {{prop}}=\"…\">` if the distance is yours to choose.",
    },
  },
  create(context) {
    const tracker: SymbolTracker = createTracker();
    return {
      ImportDeclaration(node) {
        recordImport(tracker, node as unknown as Node);
      },
      JSXOpeningElement(node: unknown) {
        const element = node as Node;
        if (!isKookieElement(tracker, element.name as Node | undefined)) return;
        const nameNode = element.name as Node;
        const elementName =
          nameNode.type === "JSXIdentifier"
            ? String(nameNode.name)
            : `${String((nameNode.object as Node).name)}.${String((nameNode.property as Node).name)}`;

        for (const attribute of (element.attributes ?? []) as Node[]) {
          if (attribute.type !== "JSXAttribute") continue;
          const name = attribute.name as Node | undefined;
          if (name?.type !== "JSXIdentifier") continue;

          if (name.name === "className") {
            const read = classNamesOf(attribute.value as Node | undefined);
            if (!read) continue;
            for (const className of read.names) {
              const match = matchUtility(className);
              if (!match) continue;
              context.report({
                node: read.node as never,
                messageId: "utility",
                data: {
                  className: match.className,
                  element: elementName,
                  sentence: match.answer.sentence,
                },
              });
            }
            continue;
          }

          if (name.name !== "style") continue;
          for (const { key, literal } of styleEntries(attribute.value as Node | undefined)) {
            const value = literal.value as string | number;
            if (typeof value !== "string" && typeof value !== "number") continue;
            const property = normalizeProperty(kebab(key));
            if (isRawColor(value, property)) {
              context.report({
                node: literal as never,
                messageId: "rawColor",
                data: { property: kebab(key), value: String(value), element: elementName },
              });
              continue;
            }
            if (!isOwnedProperty(key) || !isRawLength(value)) continue;
            const prop = propFor(property);
            if (!prop) continue;
            // Which sentence is the right one depends on whether this element takes the prop
            // the property maps to. The layouts do; everything else refuses the margin row by
            // type and simply has no layout props at all.
            const symbol = elementName.split(".").pop() ?? elementName;
            const refused = typeRefusalsFor(symbol).find((row) => row.prop === prop);
            const messageId = LAYOUT_SYMBOLS.includes(symbol)
              ? "ownedLength"
              : refused
                ? "ownedLengthRefused"
                : "ownedLengthInner";
            context.report({
              node: literal as never,
              messageId,
              data: {
                property: kebab(key),
                value: String(value),
                element: elementName,
                prop,
                why: refused?.why ?? "",
              },
            });
          }
        }
      },
    };
  },
};
