/**
 * WHICH CSS PROPERTIES THE SYSTEM ACTUALLY OWNS THE VALUE OF, derived from the Box prop table
 * (system/props.ts) rather than listed here.
 *
 * The distinction is the whole rule, and getting it wrong is what made two earlier drafts fire
 * on this repo's own correct code. A prop row with `scale: "space"` resolves an INDEX through
 * the space scale, so writing `style={{ padding: "8px" }}` beside it steps around a token
 * system that has an answer. A prop row with `scale: null` — `width`, `height`, `display`,
 * `flexGrow` — takes a raw CSS string by design ("there is no token scale for widths", says
 * the table itself), so `style={{ maxWidth: "22rem" }}` is not an escape from anything. It is
 * the same value the prop would have carried, and flagging it would be flagging the system.
 *
 * So: owned = the space-scaled rows, and nothing else.
 *
 * Everything below that is not read off the table is CSS grammar, not a fact about this
 * system: a shorthand sets its longhands, and in horizontal-tb ltr `padding-top` is
 * `padding-block-start`. A style object literal cannot express a writing mode, so the
 * horizontal-tb reading is the only one available at a call site.
 */

import { boxProps, type BoxPropName, type PropDef } from "../system/props.ts";

const SPACE_ROWS: ReadonlyArray<readonly [BoxPropName, PropDef]> = Object.entries(boxProps)
  .filter(([, def]) => def.scale === "space")
  .map(([name, def]) => [name as BoxPropName, def] as const);

/** Every longhand a space-scaled prop feeds. */
const OWNED_LONGHANDS: ReadonlySet<string> = new Set(SPACE_ROWS.flatMap(([, def]) => def.css));

/** CSS grammar: the physical side names a padding or margin shorthand can use instead. */
const PHYSICAL_SIDE: Readonly<Record<string, string>> = {
  top: "block-start",
  bottom: "block-end",
  left: "inline-start",
  right: "inline-end",
};

/**
 * The property names that SET a given longhand, longest first: `padding-block-start` is set by
 * `padding`, by `padding-block` and by itself. `row-gap` is the one longhand whose shorthand is
 * not a prefix of its own name, which is CSS's spelling and not ours.
 */
function settersOf(longhand: string): string[] {
  if (longhand.endsWith("-gap")) return ["gap", longhand];
  const parts = longhand.split("-");
  return parts.map((_, index) => parts.slice(0, index + 1).join("-"));
}

/** `paddingBlockStart` and `padding-block-start` are the same property written two ways. */
export const kebab = (styleKey: string): string =>
  styleKey.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** In horizontal-tb ltr a physical padding or margin side IS its logical one. */
export function normalizeProperty(property: string): string {
  const match = /^(padding|margin)-(top|bottom|left|right)$/.exec(property);
  if (!match) return property;
  const [, family, side] = match;
  return `${family}-${PHYSICAL_SIDE[side as string] as string}`;
}

const offsets = ["top", "right", "bottom", "left"];
const ownsEveryOffset = offsets.every((offset) => OWNED_LONGHANDS.has(offset));

/**
 * Every property name a call site could write that lands on space-scaled ground: the longhands,
 * the shorthands that set them, and `inset` — which is CSS's shorthand for the four physical
 * offsets and therefore appears in no longhand's own name.
 */
export const OWNED_PROPERTIES: ReadonlySet<string> = new Set([
  ...[...OWNED_LONGHANDS].flatMap(settersOf),
  ...(ownsEveryOffset ? ["inset", "inset-block", "inset-inline"] : []),
]);

/** Which longhands a written property would set, restricted to the ones we own. */
function reach(property: string): Set<string> {
  if (property === "inset") return new Set(offsets);
  if (property === "inset-block") return new Set(["top", "bottom"]);
  if (property === "inset-inline") return new Set(["left", "right"]);
  return new Set([...OWNED_LONGHANDS].filter((longhand) => settersOf(longhand).includes(property)));
}

const sameSet = (a: Set<string>, b: Iterable<string>): boolean => {
  const other = new Set(b);
  return a.size === other.size && [...a].every((member) => other.has(member));
};

/**
 * The prop that replaces a written property — the row whose longhands are exactly the ones the
 * written property reaches, and failing that the row that covers most of them. A report that
 * cannot name its replacement is a report that tells a call site to stop and not what to do,
 * so this never returns nothing for an owned property.
 */
export function propFor(property: string): BoxPropName | null {
  const reached = reach(property);
  if (reached.size === 0) return null;
  const exact = SPACE_ROWS.find(([, def]) => sameSet(reached, def.css));
  if (exact) return exact[0];
  let best: BoxPropName | null = null;
  let bestOverlap = 0;
  for (const [name, def] of SPACE_ROWS) {
    const overlap = def.css.filter((longhand) => reached.has(longhand)).length;
    if (overlap > bestOverlap) {
      best = name;
      bestOverlap = overlap;
    }
  }
  return best;
}

/** Is this style key one whose value the space scale answers? */
export const isOwnedProperty = (styleKey: string): boolean =>
  OWNED_PROPERTIES.has(normalizeProperty(kebab(styleKey)));
