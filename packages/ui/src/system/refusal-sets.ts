/**
 * WHICH REFUSALS REACH WHICH SYMBOL, as a rule rather than as a list (2026-09-07, the audit).
 *
 * `refused.ts` states the sentences. This states who gets them, and it exists because two
 * things outside the compiler need the same answer: the stdio MCP server bakes it into its
 * snapshot, and the documentation site's in-browser tools ask it live. Before this file, the
 * server derived it by scraping every component's source with a regex and the site did not
 * derive it at all — so `check_snippet` on the site answered "No problems found" to
 * `<Button asChild m="4" as="a" highContrast />` while the server answered with five findings
 * and an escape for each. One rule, asked twice, is the repair.
 *
 * THE RULE IS THE ONE `refused.ts` ALREADY STATED IN PROSE: everything takes the whole set;
 * Box, Flex, Stack and Grid own the margin row, so they take the reflex refusals alone; Theme
 * additionally refuses Radix Themes' four `<Theme>` props. Stating it as code rather than
 * collecting a list is what keeps a new component correct on the day it ships instead of on
 * the day someone remembers to add a row.
 *
 * A RULE OWES A LAW, because a rule can disagree with what the components actually declare and
 * nothing about writing it down makes that impossible. `refusal-sets.test.ts` walks the built
 * declarations for every exported component and asserts each refused key really does resolve
 * to `Refused<…>` there — which is the direction that matters, since a symbol this file gets
 * wrong is a symbol an agent surface reports wrongly. It fails today against three Command
 * parts that declare their props inline and so intersect nothing.
 */

import {
  PLATFORM_OWNED_REFUSALS,
  RADIX_REFLEX_REFUSALS,
  SPACING_REFUSALS,
  THEME_REFUSALS,
} from "./refused.ts";

/** A refused prop and the sentence naming what to write instead. */
export type TypeRefusal = { prop: string; why: string };

const rowsOf = (table: Record<string, string>): TypeRefusal[] =>
  Object.entries(table).map(([prop, why]) => ({ prop, why }));

/**
 * The sets by name, each flattened to rows.
 *
 * `ComponentRefusals` is the alias `refused.ts` declares as `A & B`; it is expanded here for
 * the same reason a tool result prints props rather than algebra.
 */
export const REFUSAL_SETS: Readonly<Record<string, readonly TypeRefusal[]>> = {
  RadixReflexRefusals: rowsOf(RADIX_REFLEX_REFUSALS),
  SpacingRefusals: rowsOf(SPACING_REFUSALS),
  ThemeRefusals: rowsOf(THEME_REFUSALS),
  PlatformOwnedRefusals: rowsOf(PLATFORM_OWNED_REFUSALS),
  ComponentRefusals: [...rowsOf(RADIX_REFLEX_REFUSALS), ...rowsOf(SPACING_REFUSALS)],
};

/**
 * The four layouts, which own the margin row.
 *
 * Named rather than detected: a layout is a component whose whole job is to place other
 * things, and there is no property of a props type that says so.
 */
export const LAYOUT_SYMBOLS: readonly string[] = ["Box", "Flex", "Stack", "Grid"];

/** Which sets a symbol's props type takes. */
export function refusalSetsFor(symbol: string): string[] {
  if (symbol === "Theme") return ["ThemeRefusals", "RadixReflexRefusals", "PlatformOwnedRefusals"];
  if (LAYOUT_SYMBOLS.includes(symbol)) return ["RadixReflexRefusals", "PlatformOwnedRefusals"];
  return ["ComponentRefusals", "PlatformOwnedRefusals"];
}

/**
 * Every prop this symbol refuses by TYPE, with the compiler's own sentence.
 *
 * `PLATFORM_OWNED_REFUSALS` rides along even though the type cannot carry it: `color` is
 * refused by this system on every one of these symbols, and the only reason it is not in the
 * props type is that React's `HTMLAttributes` owns the name (see `refused.ts`). An agent
 * surface reports what the system refuses, not what a particular channel is able to refuse,
 * so leaving it out here would make the tools quieter than the design.
 */
export function typeRefusalsFor(symbol: string): TypeRefusal[] {
  const out: TypeRefusal[] = [];
  const seen = new Set<string>();
  for (const set of refusalSetsFor(symbol)) {
    for (const row of REFUSAL_SETS[set] ?? []) {
      if (seen.has(row.prop)) continue;
      seen.add(row.prop);
      out.push(row);
    }
  }
  return out;
}
