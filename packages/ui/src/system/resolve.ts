/**
 * Turns responsive props into the inline custom properties the generated stylesheet arbitrates.
 * This is the only place a prop value becomes a CSS value, and it is deliberately tiny — the
 * mechanism's whole point is that the stylesheet holds no values and this holds no rules.
 */
import { boxProps, type BoxPropName, type Tier } from "./props.ts";

/**
 * A prop is either one value or a value per tier. `initial` is the base; tier keys layer on
 * top. Tokens and raw CSS ride the same prop, so `gap="4"` and `gap="13px"` both work and
 * neither costs a byte of stylesheet (§2).
 */
export type Responsive<T> = T | ({ initial?: T } & Partial<Record<Tier, T>>);

/** A space token is a bare scale index; anything else is passed through as written. */
const resolveValue = (value: string | number, scale: "space" | null): string => {
  const v = String(value);
  return scale === "space" && /^\d+$/.test(v) ? `var(--space-${v})` : v;
};

export type BoxStyleProps = Partial<Record<BoxPropName, Responsive<string | number>>>;

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
        style[`--kk-${def.var}${suffix}`] = resolveValue(tierValue, def.scale);
      }
    } else {
      style[`--kk-${def.var}`] = resolveValue(value as string | number, def.scale);
    }
  }

  return { style, rest };
}
