/**
 * Telling a raw value from a token escape.
 *
 * `style` is the sanctioned way to reach the CSS this system does not own (ENGINEERING §5),
 * and reaching a TOKEN through it — `style={{ background: "var(--color-track)" }}` — is the
 * documented spelling for a fill the prop table has no row for. So the test is never "is this
 * a style declaration"; it is "is this value a number the system already has a name for".
 * A `var()` is a name. `#0b0b0b` is not.
 */

/** A length written out, rather than reached through a token. A bare `0` has no token to be. */
const LENGTH = /^-?(?:\d+|\d*\.\d+)(?:px|rem|em|ch|ex|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|pt|pc|in|cm|mm|q|%)$/i;

/** Colour functions, in every spelling CSS Color 4 gives them. */
const COLOR_FUNCTION = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/i;

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * The named colours a call site actually reaches for. Deliberately short: this list exists to
 * catch `"white"` and `"red"`, and every entry it does not hold is caught by the hex and
 * function forms. `transparent` and `currentColor` are not here on purpose — neither names a
 * pigment, and both are ordinary CSS.
 */
const NAMED = new Set([
  "white", "black", "gray", "grey", "silver", "red", "green", "blue", "yellow", "orange",
  "purple", "pink", "brown", "navy", "teal", "olive", "lime", "aqua", "cyan", "magenta",
  "fuchsia", "maroon", "gold", "beige", "ivory", "tan", "coral", "salmon", "khaki", "violet",
  "indigo", "turquoise", "crimson", "plum", "orchid", "lavender", "wheat", "azure", "snow",
]);

/** A property whose value is read as a colour, so a bare word like `white` means one. */
export const isColorProperty = (property: string): boolean =>
  /(^|-)color$/.test(property) ||
  ["background", "border", "outline", "fill", "stroke", "box-shadow", "text-shadow"].includes(
    property,
  ) ||
  /^border-(block|inline|top|right|bottom|left)/.test(property);

/** A raw length, as a style value literal. React appends `px` to a bare number. */
export function isRawLength(value: string | number): boolean {
  if (typeof value === "number") return value !== 0;
  const trimmed = value.trim();
  if (trimmed === "0") return false;
  return LENGTH.test(trimmed);
}

/** A raw colour. A `var()` or a `color-mix()` over `var()`s is a token, so it is not one. */
export function isRawColor(value: string | number, property: string): boolean {
  if (typeof value === "number") return false;
  const trimmed = value.trim();
  if (trimmed.includes("var(")) return false;
  if (HEX.test(trimmed)) return true;
  if (COLOR_FUNCTION.test(trimmed)) return true;
  return isColorProperty(property) && NAMED.has(trimmed.toLowerCase());
}
