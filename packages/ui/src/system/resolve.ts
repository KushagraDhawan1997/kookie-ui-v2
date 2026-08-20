/**
 * Turns responsive props into the inline custom properties the generated stylesheet arbitrates.
 * This is the only place a prop value becomes a CSS value, and it is deliberately tiny — the
 * mechanism's whole point is that the stylesheet holds no values and this holds no rules.
 */
import { space } from "../tokens/config.ts";
import {
  boxProps,
  isMarginProp,
  type BoxPropName,
  type MarginPropName,
  type PropDef,
  type Tier,
} from "./props.ts";

/**
 * A prop is either one value or a value per tier. `initial` is the base; tier keys layer on
 * top. Tokens and raw CSS ride the same prop, so `gap="4"` and `gap="13px"` both work and
 * neither costs a byte of stylesheet (§2).
 */
export type Responsive<T> = T | ({ initial?: T } & Partial<Record<Tier, T>>);

/**
 * A space token is a bare scale index; anything else is passed through as written.
 *
 * The index has to be bounded, not just numeric. The palette starts at 1, so an unbounded
 * rule turned `p={0}` — the ordinary way to say "no padding" — into `var(--space-0)`, a token
 * that does not exist, and the declaration then fell back to the property's initial value
 * rather than to zero. Out-of-range digits pass through as raw CSS instead, where a wrong
 * value is at least visible.
 */
const DIGITS = /^\d+$/;

/**
 * The one NAMED value on the space scale (§3, 2026-08-20): `mt="bleed"` cancels the enclosing
 * surface's padding, so a child reaches the pane's edge — a picture across the top of a card,
 * a row that runs the full width of a panel. It is the answer to the one card layout this
 * system could not build: padding lives on the surface, `m` only takes scale indexes, and
 * nothing could subtract it.
 *
 * A value and not a prop, which is the whole economy of it. Every per-side and per-tier
 * spelling already exists on the margin rows — `mt`, `mx`, `m`, and each with `sm`/`md`/`lg`
 * — so a picture that bleeds top and sides is `mt="bleed" mx="bleed"` and costs nothing. A
 * `bleed`/`bleedX`/`bleedTop` prop set would have meant seven rows, twenty-eight @property
 * registrations, and a second mechanism writing `margin` that the existing var chain would
 * then have to arbitrate against.
 *
 * `--kui-sf-p` is the surface layer's own padding hook. It is deliberately NOT registered
 * `inherits: false` — a surface declares it and every descendant reads it, which is what lets
 * a child two levels down know how far its pane insets. The nearest surface wins, so a card
 * inside a dialog bleeds to the card. The `0px` fallback is load-bearing and explicit rather
 * than left to invalid-at-computed-value-time: outside any surface the chain must compute a
 * real zero, not reset the whole declaration (this package has been bitten by that twice —
 * see `inset` and `overflow` in props.ts).
 */
const BLEED = "bleed";
const BLEED_VALUE = "calc(-1 * var(--kui-sf-p, 0px))";

const resolveValue = (value: string | number, def: PropDef): string => {
  const v = String(value);
  if (def.scale !== "space") return v;
  // Only where a negative length is meaningful. Elsewhere the word passes through as written,
  // which CSS rejects visibly — the same choice the out-of-range digit rule above makes.
  if (v === BLEED) return isMarginProp(def) ? BLEED_VALUE : v;
  if (!DIGITS.test(v)) return v;
  const step = Number(v);
  // LAYOUT space, not the raw palette (§3, §12): a layout prop names a distance between
  // things, and that rhythm answers density. `gap="4"` means step 4 of the current rhythm,
  // never a frozen alias for the default one — the raw palette is reachable via `gap="16px"`
  // or style, where opting out of the system is at least visible.
  return step >= 1 && step <= space.length ? `var(--layout-space-${step})` : v;
};

/**
 * `| undefined` is explicit rather than implied by `Partial`, because the package compiles with
 * `exactOptionalPropertyTypes` and `<Box p={condition ? "4" : undefined} />` is the ordinary way
 * to write a conditional prop. A type that refuses it would push people to the escape hatch.
 */
/**
 * `"bleed" | (string & {})` rather than plain `string`: the intersection keeps the union from
 * collapsing, so an editor still offers `bleed` on a margin prop while every other string stays
 * legal. Margins are the only rows that take it (see `resolveValue`), and typing it per-row is
 * what makes a value as discoverable as the prop it replaced.
 */
type SpaceValue = string | number;
type MarginValue = typeof BLEED | (string & {}) | number;

export type BoxStyleProps = Partial<
  Record<Exclude<BoxPropName, MarginPropName>, Responsive<SpaceValue> | undefined>
> &
  Partial<Record<MarginPropName, Responsive<MarginValue> | undefined>>;

/**
 * Splits Box's style props off from everything else, returning the inline custom properties
 * and the props that should reach the DOM element untouched.
 */
export function resolveBoxProps<P extends BoxStyleProps & Record<string, unknown>>(
  props: P,
): { style: Record<string, string>; rest: Record<string, unknown> } {
  const style: Record<string, string> = {};
  const rest: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    const def = boxProps[key as BoxPropName];
    if (!def || value === undefined || value === null) {
      if (!def) rest[key] = value;
      continue;
    }

    if (typeof value === "object") {
      for (const [tier, tierValue] of Object.entries(value as Record<string, string | number>)) {
        if (tierValue === undefined || tierValue === null) continue;
        const suffix = tier === "initial" ? "" : `-${tier}`;
        style[`--kui-${def.var}${suffix}`] = resolveValue(tierValue, def);
      }
    } else {
      style[`--kui-${def.var}`] = resolveValue(value as string | number, def);
    }
  }

  return { style, rest };
}
