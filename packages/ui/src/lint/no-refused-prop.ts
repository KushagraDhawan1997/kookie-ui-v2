/**
 * A refused prop the TYPE cannot refuse, and a refused prop hiding inside a spread (2026-09-07).
 *
 * TWO HOLES, ONE SHAPE, and the shape is the plugin's whole scope: something the compiler
 * provably cannot see.
 *
 * THE FIRST IS `color`. Every other refusal in `system/refused.ts` is a branded key on the
 * props type and `tsc` prints its escape. `color` cannot be, because React's own
 * `HTMLAttributes` declares `color?: string` and every Kookie component extends a native
 * element's props — so declaring `color` as anything unsatisfiable stops the ordinary wrapper
 * component compiling:
 *
 *   function SaveButton({ pending, ...rest }: React.ComponentPropsWithoutRef<"button">) {
 *     return <Button loading={pending} {...rest}>Save</Button>;   // `rest.color` is a string
 *   }
 *
 * That shipped for a day and is the audit finding this rule closes. A direct `color="red"` is
 * still a compile error, because each component `Omit`s the key — but the diagnostic is
 * "Property 'color' does not exist", which names the prop and not the door. This prints the
 * door, from the same table `refused.ts` states it in.
 *
 * THE SECOND IS THE SPREAD, and it is why the rule reads more than one attribute. A JSX spread
 * of a variable is not excess-property-checked, so `const props = { variant: "solid" };
 * <Button {...props} />` compiles clean against every branded key in the type. Where the object
 * is written INLINE — `<Button {...{ variant: "solid" }} />` — or is a `const` in the same
 * file, the property is right there in the syntax and can be read.
 *
 * WHAT IT DOES NOT DO is resolve identifiers across files or follow a variable through a
 * function. This is a linter, not a compiler; the same sentence `agent/snippet.ts` opens with.
 */

import type { Rule } from "eslint";

import { REFUSAL_SETS, typeRefusalsFor } from "../system/refusal-sets.ts";
import { createTracker, isKookieElement, recordImport, type SymbolTracker } from "./kookie-symbols.ts";

type Node = { type: string; [key: string]: unknown };

/** The refused names whose sentence NOTHING else prints, because the type cannot carry them. */
export const PLATFORM_OWNED: ReadonlySet<string> = new Set(
  (REFUSAL_SETS["PlatformOwnedRefusals"] ?? []).map((row) => row.prop),
);

/** The element's name as a call site wrote it, `Menu.Item` included. */
function elementName(nameNode: Node): string {
  if (nameNode.type === "JSXIdentifier") return String(nameNode.name);
  const object = nameNode.object as Node | undefined;
  const property = nameNode.property as Node | undefined;
  if (object?.type === "JSXIdentifier" && property) return `${String(object.name)}.${String(property.name)}`;
  return "";
}

/** The last segment, which is the symbol a compound part is exported under. */
const symbolOf = (written: string): string => written.split(".").pop() ?? written;

/** Property keys of an object expression, written plainly enough to read. */
function keysOf(node: Node | undefined): { key: string; node: Node }[] {
  if (node?.type !== "ObjectExpression") return [];
  const out: { key: string; node: Node }[] = [];
  for (const property of (node.properties ?? []) as Node[]) {
    if (property.type !== "Property" || property.computed === true) continue;
    const key = property.key as Node;
    const name =
      key.type === "Identifier"
        ? String(key.name)
        : key.type === "Literal" && typeof key.value === "string"
          ? key.value
          : null;
    if (name !== null) out.push({ key: name, node: property });
  }
  return out;
}

export const noRefusedProp: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "A refused prop the type cannot state, or one hidden inside a spread. Both go past `tsc` and land on the element.",
    },
    schema: [],
    messages: {
      // The sentence is `refused.ts`'s own, passed through verbatim. A second wording here
      // would be a second answer to the same question, which is the defect the whole agent
      // surface exists to close.
      refused: "{{why}}",
      spread:
        "`{{prop}}` is spread onto `<{{element}}>`, and a spread goes past the type — TypeScript excess-property-checks an attribute and not a spread. {{why}}",
    },
  },
  create(context) {
    const tracker: SymbolTracker = createTracker();
    /** `const props = { … }` in this file, so a spread of it can still be read. */
    const locals = new Map<string, Node>();
    return {
      ImportDeclaration(node) {
        recordImport(tracker, node as unknown as Node);
      },
      VariableDeclarator(node: unknown) {
        const declarator = node as Node;
        const id = declarator.id as Node | undefined;
        const init = declarator.init as Node | undefined;
        if (id?.type === "Identifier" && init?.type === "ObjectExpression") {
          locals.set(String(id.name), init);
        }
      },
      JSXOpeningElement(node: unknown) {
        const element = node as Node;
        const nameNode = element.name as Node | undefined;
        if (!nameNode || !isKookieElement(tracker, nameNode)) return;
        const written = elementName(nameNode);
        const refusals = new Map(typeRefusalsFor(symbolOf(written)).map((row) => [row.prop, row.why]));

        for (const attribute of (element.attributes ?? []) as Node[]) {
          if (attribute.type === "JSXAttribute") {
            const name = attribute.name as Node | undefined;
            if (name?.type !== "JSXIdentifier") continue;
            const prop = String(name.name);
            // Only the ones the type cannot state. Everything else already fails to compile
            // WITH its sentence, and a second report of it is noise.
            if (!PLATFORM_OWNED.has(prop)) continue;
            const why = refusals.get(prop);
            if (why) context.report({ node: attribute as never, messageId: "refused", data: { why } });
            continue;
          }
          if (attribute.type !== "JSXSpreadAttribute") continue;
          const argument = attribute.argument as Node | undefined;
          const object =
            argument?.type === "ObjectExpression"
              ? argument
              : argument?.type === "Identifier"
                ? locals.get(String(argument.name))
                : undefined;
          for (const { key, node: property } of keysOf(object)) {
            const why = refusals.get(key);
            if (!why) continue;
            context.report({
              node: property as never,
              messageId: "spread",
              data: { prop: key, element: written, why },
            });
          }
        }
      },
    };
  },
};
