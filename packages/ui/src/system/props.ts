/**
 * §3's prop taxonomy as data. One row per prop; the resolver and the CSS generator both walk
 * this table, so a prop cannot exist in one and not the other.
 *
 * A prop earns a row only if it adds something raw CSS lacks — token resolution, responsive
 * tiers, or a constraint. Everything else is `style`, which already covers all of CSS and
 * always will (ENGINEERING §5).
 */

/**
 * §2 — tiers are container-keyed, few and semantic. Container rather than viewport so a
 * component adapts to its slot: the same Grid is correct in a drawer and in a main column.
 * Three rather than six, following the platforms that have lived with this longest (iOS ships
 * two size classes, Android three window classes, neither has per-prop pixel breakpoints).
 *
 * T-shirt names, NOT §18's room words, on principle (LOG 2026-08-05): normative words need a
 * unique referent. A window is one per app, so "regular" judges it against one norm; a
 * container is everything — sidebar, gallery, pane — and "a regular container" is relative to
 * the particular thing. A size label is semantically empty, which is what makes it true in
 * every slot. That `md` currently equals the NARROW window boundary (48rem) is COINCIDENCE,
 * deliberately unpinned: tiers judge where content breaks, classes judge where shells break,
 * and the eye pass may move them apart. Nothing may rely on the numbers agreeing. (Corrected
 * 2026-08-26, audit: this read "`md`/`lg` currently equal the window boundaries (48/64rem)".
 * `lg` is 64rem and matches no window boundary — `wide` moved to 75rem on 2026-08-05, which
 * is the very drift the sentence exists to warn against, recorded here as fact.)
 */
export const tiers = { sm: "30rem", md: "48rem", lg: "64rem" } as const;
export type Tier = keyof typeof tiers;
export const tierNames = Object.keys(tiers) as Tier[];

/** Which token family a prop resolves through, if any. `null` means a raw CSS value. */
export type Scale = "space" | null;

export type PropDef = {
  /**
   * The CSS longhands this prop feeds. Never a shorthand whose longhands another row also
   * feeds — see `precedence`, and the law in resolve.test.ts that now enforces this rather
   * than leaving it to a comment nobody rereads. `inset` and `overflow` both violated it in
   * silence and both shipped dead.
   */
  css: string[];
  scale: Scale;
  /** Private custom property stem; `--kui-` marks it as plumbing, never a public token (§13). */
  var: string;
  /**
   * How specific this prop is for the longhands it shares: 0 for `p`, 1 for `px`, 2 for `pt`.
   *
   * Shorthands are expanded rather than emitted, because a shorthand followed by longhands does
   * not degrade the way it looks like it should: an unset custom property makes its declaration
   * invalid at computed-value time, and the property falls back to its *initial* value rather
   * than to the earlier shorthand. `padding: var(--kui-p)` followed by `padding-block-start:
   * var(--kui-pt)` therefore renders 0 whenever `pt` is unset. Precedence puts the same ordering
   * inside one var chain per longhand, where it behaves.
   */
  precedence: number;
  /**
   * Innermost fallback, for properties whose CSS initial value is not the sensible default.
   *
   * The same invalid-at-computed-value-time rule bites hardest here: an unset var does not
   * leave the property alone, it resets it to its INITIAL value. For `display` that is
   * `inline`, so a Box with no `display` prop was laid out as an inline box — width and height
   * ignored, block padding collapsed, and `container-type` silently inapplicable, which meant
   * no Box was ever a query container. Everything else's initial value (0, auto, static,
   * visible, row) is already what we want.
   */
  fallback?: string;
};

const space = (css: string[], v: string, precedence = 0): PropDef => ({
  css,
  scale: "space",
  var: v,
  precedence,
});
const raw = (css: string[], v: string, precedence = 0, fallback?: string): PropDef => ({
  css,
  scale: null,
  var: v,
  precedence,
  ...(fallback === undefined ? {} : { fallback }),
});

const BLOCK = ["padding-block-start", "padding-block-end"];
const INLINE = ["padding-inline-start", "padding-inline-end"];
const MBLOCK = ["margin-block-start", "margin-block-end"];
const MINLINE = ["margin-inline-start", "margin-inline-end"];

/**
 * Padding and gap are tokenized; margin is here too but is exposed ONLY on layout primitives
 * (§3). Box is a layout primitive, so it takes them; Button will not.
 */
export const boxProps = {
  p: space([...BLOCK, ...INLINE], "p", 0),
  px: space(INLINE, "px", 1),
  py: space(BLOCK, "py", 1),
  pt: space(["padding-block-start"], "pt", 2),
  pr: space(["padding-inline-end"], "pr", 2),
  pb: space(["padding-block-end"], "pb", 2),
  pl: space(["padding-inline-start"], "pl", 2),

  m: space([...MBLOCK, ...MINLINE], "m", 0),
  mx: space(MINLINE, "mx", 1),
  my: space(MBLOCK, "my", 1),
  mt: space(["margin-block-start"], "mt", 2),
  mr: space(["margin-inline-end"], "mr", 2),
  mb: space(["margin-block-end"], "mb", 2),
  ml: space(["margin-inline-start"], "ml", 2),

  gap: space(["row-gap", "column-gap"], "g", 0),
  gapX: space(["column-gap"], "gx", 1),
  gapY: space(["row-gap"], "gy", 1),

  // Sizing was never a parity race: there is no token scale for widths, so these are raw
  // strings that happen to also get tiers.
  width: raw(["width"], "w"),
  minWidth: raw(["min-width"], "minw"),
  maxWidth: raw(["max-width"], "maxw"),
  height: raw(["height"], "h"),
  minHeight: raw(["min-height"], "minh"),
  maxHeight: raw(["max-height"], "maxh"),
  flexBasis: raw(["flex-basis"], "fb"),

  // `inset` expands like `p` does, for the same reason: emitted as a shorthand it sat in front
  // of its own longhands and every one of them reset it to `auto` the moment their var was
  // unset. Both props shipped dead — <Box position="absolute" inset="0"> shrink-wrapped at its
  // static position instead of stretching.
  inset: space(["top", "right", "bottom", "left"], "in", 0),
  top: space(["top"], "t", 1),
  right: space(["right"], "r", 1),
  bottom: space(["bottom"], "b", 1),
  left: space(["left"], "l", 1),

  // Structural keywords. A custom property holds `column` or `repeat(3, 1fr)` exactly as
  // happily as it holds a length, which is why the remap is not a spacing mechanism (§2).
  display: raw(["display"], "d", 0, "block"),
  position: raw(["position"], "pos"),
  overflow: raw(["overflow-x", "overflow-y"], "ov", 0),
  overflowX: raw(["overflow-x"], "ovx", 1),
  overflowY: raw(["overflow-y"], "ovy", 1),
  flexGrow: raw(["flex-grow"], "fg"),
  flexShrink: raw(["flex-shrink"], "fs"),
  gridArea: raw(["grid-area"], "ga"),

  // Container props: Box is the engine, so it carries them and the named primitives narrow
  // the types over the top (§3). A responsive flex-to-grid switch rides the same pipe.
  direction: raw(["flex-direction"], "fd"),
  align: raw(["align-items"], "ai"),
  justify: raw(["justify-content"], "jc"),
  wrap: raw(["flex-wrap"], "fw"),
  columns: raw(["grid-template-columns"], "gtc"),
  rows: raw(["grid-template-rows"], "gtr"),
  areas: raw(["grid-template-areas"], "gta"),
  flow: raw(["grid-auto-flow"], "gaf"),
} as const;

export type BoxPropName = keyof typeof boxProps;
export const boxPropNames = Object.keys(boxProps) as BoxPropName[];

/**
 * The props that pull a box OUTWARD, and therefore the only ones `"bleed"` means anything on
 * (§3, 2026-08-20). A margin is the one distance in this table that may go negative — padding
 * and gap reject a negative length outright, and `inset` was left out deliberately rather than
 * generalised into: reaching a pane's edge from normal flow is the case that exists, and a
 * second spelling for a case nobody has asked for is entropy bought on credit.
 *
 * Written out rather than derived so the TYPE can name them, and pinned to the table by a law
 * in resolve.test.ts — a margin row added here and forgotten there would take `"bleed"` and
 * emit it as a raw CSS keyword, which is a silent no-op.
 */
export type MarginPropName = "m" | "mx" | "my" | "mt" | "mr" | "mb" | "ml";
export const marginPropNames: MarginPropName[] = ["m", "mx", "my", "mt", "mr", "mb", "ml"];

/** A margin prop's value resolves against the enclosing surface's padding (see `resolveValue`). */
export const isMarginProp = (def: PropDef): boolean =>
  def.css.every((property) => property.startsWith("margin"));
