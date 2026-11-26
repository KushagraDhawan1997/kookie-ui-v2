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

import { space } from "../tokens/config.ts";
import { docs } from "./docs.ts";

import { LAYOUT_SYMBOLS, typeRefusalsFor } from "../system/refusal-sets.ts";

import { isExactProp, isOwnedProperty, kebab, normalizeProperty, propFor } from "./owned-properties.ts";
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
function styleEntries(
  value: Node | undefined,
): Array<{ key: string; literal: Node; property: Node; object: Node }> {
  if (value?.type !== "JSXExpressionContainer") return [];
  const object = value.expression as Node | undefined;
  if (object?.type !== "ObjectExpression") return [];
  const out: Array<{ key: string; literal: Node; property: Node; object: Node }> = [];
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
    out.push({ key: name, literal, property, object });
  }
  return out;
}


/** A length in CSS pixels, when the file states one: `16`, `"16px"`. Any other unit is not read. */
function pixels(value: string | number): number | null {
  if (typeof value === "number") return value;
  const match = /^(\d+(?:\.\d+)?)px$/i.exec(value.trim());
  return match ? Number(match[1]) : null;
}

/** The steps around a length: the one it equals, or the nearest below and above. */
function stepsFor(px: number): { exact: number | null; near: number[] } {
  const exact = space.indexOf(px as (typeof space)[number]);
  if (exact !== -1) return { exact: exact + 1, near: [] };
  const above = space.findIndex((step) => step > px);
  // The palette rises, so the step below is the one before the first step above.
  const below = above === -1 ? space.length - 1 : above - 1;
  return { exact: null, near: [below, above].filter((index) => index !== -1).map((index) => index + 1) };
}

export const noEscapeAbuse: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    fixable: "code",
    hasSuggestions: true,
    docs: {
      description:
        "An escape reaches the CSS this system does not own. A utility class, or a raw value the system already has a name for, reaches past one that it does.",
    },
    schema: [],
    messages: {
      // Every message names the replacement. A warning that only says "do not" leaves the call
      // site to invent something, and what it invents is usually a wrapper div with a class.
      utility:
        "`{{className}}` on `<{{element}}>` is a utility class, and Kookie UI ships none. Use this instead: {{sentence}}. Docs: " +
        docs("layout"),
      rawColor:
        "`{{property}}: {{value}}` on `<{{element}}>` is a colour written by hand. Use the `tone` and `emphasis` props, or a colour token in `style`, such as `var(--color-text)`. Docs: " +
        docs("color"),
      ownedLength:
        "`{{property}}: {{value}}` on `<{{element}}>` is a length written by hand. Use the `{{prop}}` prop with a step from the space scale. Docs: " +
        docs("layout"),
      // The SAME defect the message above would otherwise commit, one element over: `propFor`
      // reads the Box prop table, and only the four layouts take those props — so telling a
      // Button to "pass `m`" named a prop `refused.ts` refuses on it, which is a report whose
      // repair does not compile (2026-09-07, the audit). The escape is the refusal's own
      // sentence, taken from the one home that states it.
      ownedLengthRefused:
        "`{{property}}: {{value}}` on `<{{element}}>` is spacing written by hand, and `<{{element}}>` takes no `{{prop}}` prop. {{why}} Docs: " +
        docs("layout"),
      suggestStep: "Use `{{prop}}=\"{{step}}\"`, which is {{px}}px at the default density.",
      rawShadow:
        "`box-shadow: {{value}}` on `<{{element}}>` is a shadow written by hand. Kookie UI has no shadow prop: the theme's `depth` sets every shadow in the app. Remove it, or set `depth` on `<Theme>`. Docs: " +
        docs("depth"),
      rawFontSize:
        "`font-size: {{value}}` on `<{{element}}>` is a text size written by hand. Use the `size` prop of `<Text>` or `<Heading>`. Docs: " +
        docs("typography"),
      rawFontWeight:
        "`font-weight: {{value}}` on `<{{element}}>` is a text weight written by hand. Use the `weight` prop of `<Text>` or `<Heading>`. Docs: " +
        docs("typography"),
      ownedLengthInner:
        "`{{property}}: {{value}}` on `<{{element}}>` is spacing written by hand. The space inside a component follows its `size`, so `<{{element}}>` takes no `{{prop}}` prop. To choose the distance yourself, wrap the content in `<Box {{prop}}=\"…\">`. Docs: " +
        docs("layout"),
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
          const entries = styleEntries(attribute.value as Node | undefined);
          for (const { key, literal, property: propertyNode, object } of entries) {
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
            const handWritten =
              property === "box-shadow" && typeof value === "string" && value !== "none" && !value.includes("var(")
                ? "rawShadow"
                : property === "font-size" && isRawLength(value)
                  ? "rawFontSize"
                  : property === "font-weight" && /^(?:\d+|bold|bolder|lighter)$/.test(String(value))
                    ? "rawFontWeight"
                    : null;
            if (handWritten) {
              context.report({
                node: literal as never,
                messageId: handWritten,
                data: { value: String(value), element: elementName },
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

            // THE REPAIR (SETTLED "The linter"): moved to the prop by the rule itself when the
            // length IS a step, offered as a choice when it falls between two, and left to the
            // reader everywhere else. Only on a layout, which takes the prop; only when the
            // prop is not already set, where the two would disagree; and only when the prop
            // sets exactly the sides the property did.
            const attributes = (element.attributes ?? []) as Node[];
            const free = !attributes.some(
              (other) =>
                other.type === "JSXSpreadAttribute" ||
                (other.type === "JSXAttribute" && (other.name as Node).name === prop),
            );
            const px = pixels(value);
            const steps =
              messageId === "ownedLength" && free && px !== null && px > 0 && isExactProp(property, prop)
                ? stepsFor(px)
                : { exact: null, near: [] };
            const move = (step: number) =>
              function* (fixer: Rule.RuleFixer): Generator<Rule.Fix> {
                const source = context.sourceCode;
                if (entries.length === 1 && (object.properties as Node[]).length === 1) {
                  // The style held nothing else, so the prop replaces the whole attribute.
                  yield fixer.replaceText(attribute as never, `${prop}="${step}"`);
                  return;
                }
                const after = source.getTokenAfter(propertyNode as never);
                const before = source.getTokenBefore(propertyNode as never);
                if (after?.value === ",") {
                  const next = source.getTokenAfter(after);
                  yield fixer.removeRange([(propertyNode.range as [number, number])[0], next ? next.range[0] : after.range[1]]);
                } else if (before?.value === ",") {
                  yield fixer.removeRange([before.range[0], (propertyNode.range as [number, number])[1]]);
                } else return;
                yield fixer.insertTextBefore(attribute as never, `${prop}="${step}" `);
              };
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
              ...(steps.exact !== null ? { fix: move(steps.exact) } : {}),
              suggest: steps.near.map((step) => ({
                messageId: "suggestStep",
                data: { prop, step: String(step), px: String(space[step - 1]) },
                fix: move(step),
              })),
            });
          }
        }
      },
    };
  },
};
