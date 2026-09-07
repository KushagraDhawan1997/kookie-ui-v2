/**
 * `data-tone` and its siblings, written straight onto one of our components (§9, §12).
 *
 * TSX exempts hyphenated JSX attribute names from excess-property checking, so
 * `<Card data-emphasis="loud" data-tone="destructive">` compiles with no error whatever the
 * props type says. That is not a theoretical hole: it is how the `variant` axis §9 deleted
 * came back from a call site as a solid red card, which is why card.tsx now spreads the
 * consumer's props FIRST and states the reason at length. Spreading first stops the attribute
 * reaching the DOM on the components that thought to do it; this rule stops it being written.
 *
 * THE SET IS COMPUTED, NEVER LISTED. It is `data-` plus every axis key the system owns —
 * `themeAxes` (theme/theme.tsx) for the app-wide ones and `componentAxes` (system/axes.ts)
 * for the per-component ones — because a listed set is a copy that agrees today and goes
 * quietly stale the day an axis is added, which is exactly the day it needs to fire. A law in
 * lint.test.ts asserts this set EQUALS that union, so widening an axis without widening the
 * rule fails rather than passes.
 *
 * The spelling is the KEY, verbatim. No axis today is a two-word key stamped in kebab, and
 * inventing a second spelling here would be inventing a fact: if an axis ever needs one, the
 * axis key is the thing to rename.
 */

import type { Rule } from "eslint";

import { componentAxes } from "../system/axes.ts";
import { themeAxes } from "../theme/theme.tsx";
import { createTracker, isKookieElement, recordImport, type SymbolTracker } from "./kookie-symbols.ts";

/** Every axis the system owns, in the one spelling a call site could write it as. */
export const REFUSED_ATTRIBUTES: ReadonlySet<string> = new Set(
  [...Object.keys(themeAxes), ...Object.keys(componentAxes)].map((axis) => `data-${axis}`),
);

type Node = { type: string; [key: string]: unknown };

export const noRefusedAttribute: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "An axis is chosen with its prop. Writing it as a data attribute goes past the type and re-grows an axis the system deleted.",
    },
    schema: [],
    messages: {
      // The message names the prop because a report that only says "no" leaves the call site
      // to guess, and the guess is usually a wrapper div with a class on it.
      refused:
        "`{{attribute}}` writes the `{{axis}}` axis onto the DOM past the type — TSX does not check hyphenated attributes. Pass the `{{axis}}` prop instead; if this component does not take `{{axis}}`, that refusal is the design and the attribute re-grows what was removed.",
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
        const attributes = (element.attributes ?? []) as Node[];
        for (const attribute of attributes) {
          if (attribute.type !== "JSXAttribute") continue;
          const name = attribute.name as Node | undefined;
          if (name?.type !== "JSXIdentifier") continue;
          const written = String(name.name);
          if (!REFUSED_ATTRIBUTES.has(written)) continue;
          context.report({
            node: attribute as never,
            messageId: "refused",
            data: { attribute: written, axis: written.slice("data-".length) },
          });
        }
      },
    };
  },
};
