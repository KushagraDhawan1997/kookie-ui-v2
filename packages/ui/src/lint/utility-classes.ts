/**
 * UTILITY-CLASS GRAMMAR, and the answer this system gives instead.
 *
 * `className` is a real escape — a consumer's own class name belongs there and always will —
 * so the rule cannot key on "there is a className". It keys on the SHAPE of the string: a
 * known utility head, a dash, and a value-shaped tail (a number, a fraction, a t-shirt word),
 * or Tailwind's arbitrary-value brackets, which no ordinary class name contains. That is what
 * separates `p-4` and `min-w-[20rem]` from `dashboard-header` and `kd-figure-chrome`, and the
 * separation is load-bearing: a rule that fired on the second kind would be telling this
 * repo's own docs blocks to stop naming their classes.
 *
 * The vocabulary below is TAILWIND'S, not ours, which is why it is written out — it is not a
 * second copy of anything this system owns. What each entry POINTS AT is ours, and is named by
 * key (`prop` in the Box table, `axis` in the theme's or the component's), so a law in
 * lint.test.ts can check every answer still exists. An answer that named a deleted prop would
 * be a report telling a call site to use something that is not there.
 */

import type { BoxPropName } from "../system/props.ts";

export type Answer = {
  /** A row in the Box prop table (system/props.ts) — checked by law. */
  readonly prop?: BoxPropName;
  /** An axis key in `themeAxes` or `componentAxes` — checked by law. */
  readonly axis?: string;
  /** What the report says to do instead. Named, never merely refused. */
  readonly sentence: string;
};

/** A utility head, and the thing this system says instead of it. */
export const UTILITY_HEADS: Readonly<Record<string, Answer>> = {
  p: { prop: "p", sentence: "padding is the `p` prop on a layout primitive, resolved through the space scale" },
  px: { prop: "px", sentence: "inline padding is the `px` prop, resolved through the space scale" },
  py: { prop: "py", sentence: "block padding is the `py` prop, resolved through the space scale" },
  pt: { prop: "pt", sentence: "block-start padding is the `pt` prop, resolved through the space scale" },
  pr: { prop: "pr", sentence: "inline-end padding is the `pr` prop, resolved through the space scale" },
  pb: { prop: "pb", sentence: "block-end padding is the `pb` prop, resolved through the space scale" },
  pl: { prop: "pl", sentence: "inline-start padding is the `pl` prop, resolved through the space scale" },
  m: { prop: "m", sentence: "outer spacing is the `m` prop on a layout primitive — a component never owns its own margin" },
  mx: { prop: "mx", sentence: "inline margin is the `mx` prop on a layout primitive" },
  my: { prop: "my", sentence: "block margin is the `my` prop on a layout primitive" },
  mt: { prop: "mt", sentence: "block-start margin is the `mt` prop on a layout primitive" },
  mr: { prop: "mr", sentence: "inline-end margin is the `mr` prop on a layout primitive" },
  mb: { prop: "mb", sentence: "block-end margin is the `mb` prop on a layout primitive" },
  ml: { prop: "ml", sentence: "inline-start margin is the `ml` prop on a layout primitive" },
  gap: { prop: "gap", sentence: "the distance between children is the `gap` prop on Flex, Stack or Grid" },
  space: { prop: "gap", sentence: "the distance between children is the `gap` prop on Flex, Stack or Grid, not a margin on every child" },
  w: { prop: "width", sentence: "width is the `width` prop, which takes the CSS value directly" },
  h: { prop: "height", sentence: "height is the `height` prop, which takes the CSS value directly" },
  min: { prop: "minWidth", sentence: "a floor is the `minWidth` or `minHeight` prop, which takes the CSS value directly" },
  max: { prop: "maxWidth", sentence: "a ceiling is the `maxWidth` or `maxHeight` prop, which takes the CSS value directly" },
  flex: { prop: "direction", sentence: "a flex row or column is `<Flex>` with `direction`, `align` and `justify`" },
  grid: { prop: "columns", sentence: "a grid is `<Grid>` with `columns`, `rows` and `areas`" },
  items: { prop: "align", sentence: "cross-axis alignment is the `align` prop on a layout primitive" },
  justify: { prop: "justify", sentence: "main-axis alignment is the `justify` prop on a layout primitive" },
  bg: { axis: "tone", sentence: "a fill is resolved output: choose it with `tone` and `emphasis`, or use `material` for a pane" },
  text: { axis: "typeSize", sentence: "type is `<Text>` or `<Heading>` with `size`, `weight` and `emphasis`" },
  font: { axis: "weight", sentence: "a face is the `weight` prop on `<Text>` or `<Heading>`" },
  rounded: { axis: "radius", sentence: "a corner is the theme's `radius` axis — a call site does not pick one" },
  shadow: { axis: "depth", sentence: "elevation does not exist as a per-element choice; the theme's `depth` axis is the one consumer" },
  border: { axis: "emphasis", sentence: "a border is rank rather than decoration: `bordered` on Button is the `emphasis` half-step, and the surface layer draws every other edge" },
};

/** Tail segments that read as a utility value rather than as a word in a class name. */
const SCALE_WORDS = new Set([
  "px", "full", "auto", "none", "screen", "fit", "min", "max", "prose",
  "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl",
  "center", "start", "end", "between", "around", "evenly", "stretch", "baseline",
  "col", "row", "wrap", "nowrap", "reverse", "hidden", "visible", "solid", "dashed", "dotted",
  "left", "right", "top", "bottom", "middle", "justify",
  "thin", "light", "normal", "medium", "semibold", "bold", "black", "extrabold",
]);

const isValueShaped = (segment: string): boolean =>
  /^-?\d+(\.\d+)?$/.test(segment) || /^\d+\/\d+$/.test(segment) || SCALE_WORDS.has(segment);

/** What a matched class is, so a report can name the answer without re-parsing the string. */
export type UtilityMatch = { readonly className: string; readonly head: string; readonly answer: Answer };

/**
 * Read one class name. Variant prefixes (`md:`, `hover:`) and Tailwind's important marker are
 * stripped first, because they modify a utility rather than making one — a class is still a
 * utility when it only applies at a breakpoint.
 */
export function matchUtility(rawClassName: string): UtilityMatch | null {
  const withoutVariants = rawClassName.slice(rawClassName.lastIndexOf(":") + 1);
  const name = withoutVariants.replace(/^[!-]+/, "");
  if (name.length === 0) return null;

  const head = name.split(/[-[]/)[0] ?? "";
  const answer = UTILITY_HEADS[head];
  if (!answer) return null;

  // Arbitrary values are Tailwind's own grammar and appear in no ordinary class name, so a
  // registered head plus a bracket is enough on its own.
  if (name.includes("[") && name.includes("]")) {
    return { className: rawClassName, head, answer };
  }

  const segments = name.split("-");
  const tail = segments[segments.length - 1];
  if (segments.length < 2 || tail === undefined || !isValueShaped(tail)) return null;
  return { className: rawClassName, head, answer };
}
