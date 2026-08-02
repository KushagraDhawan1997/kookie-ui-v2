/**
 * §2 — the responsive mechanism, generated. This file emits the entire stylesheet that makes
 * every responsive prop work, and its size is the blocker-1 proof: cost is O(longhands x tiers)
 * and does not grow when tokens are added, because no value ever appears here. Values ride in
 * on the element's inline custom properties; these rules only arbitrate which one wins.
 *
 * v1's equivalent was pregenerated token-by-breakpoint utility classes: 55KB gzipped, and
 * structurally unable to express `gap="13px"`.
 */
import { boxProps, boxPropNames, tiers, tierNames } from "./props.ts";

const HEADER = `/* GENERATED FILE — do not edit.
   Source: src/system/layout-css.ts from src/system/props.ts.
   Hand edits are overwritten by the next build and fail the drift test. */`;

/**
 * Every remap var is registered as non-inheriting. Custom properties inherit by default, so
 * without this a nested Box with no `gap` would silently read its parent's — a value cascading
 * into a component that never asked for it (§2).
 */
function registrations(): string[] {
  return boxPropNames
    .flatMap((name) => {
      const stem = boxProps[name].var;
      return [`--kk-${stem}`, ...tierNames.map((t) => `--kk-${stem}-${t}`)];
    })
    .map((n) => `@property ${n} { syntax: "*"; inherits: false; }`);
}

/** Which prop stems feed one CSS longhand, most specific first (`pt` before `py` before `p`). */
function stemsFor(longhand: string): string[] {
  return boxPropNames
    .filter((name) => (boxProps[name].css as readonly string[]).includes(longhand))
    .sort((a, b) => boxProps[b].precedence - boxProps[a].precedence)
    .map((name) => boxProps[name].var);
}

/**
 * One nested `var()` chain per longhand, resolving in two dimensions at once: the specific prop
 * beats the general one, and the current tier beats the tier below it. Written innermost-out,
 * so the base tier's `p` is the last resort and this tier's `pt` is consulted first.
 */
function chain(longhand: string, upTo: number): string {
  const stems = stemsFor(longhand);
  const base = boxPropNames
    .filter((n) => (boxProps[n].css as readonly string[]).includes(longhand))
    .map((n) => boxProps[n].fallback)
    .find(Boolean);
  const last = stems[stems.length - 1]!;
  let value = base ? `var(--kk-${last}, ${base})` : `var(--kk-${last})`;
  for (let i = stems.length - 2; i >= 0; i--) value = `var(--kk-${stems[i]}, ${value})`;

  for (let t = 0; t < upTo; t++) {
    for (let i = stems.length - 1; i >= 0; i--) {
      value = `var(--kk-${stems[i]}-${tierNames[t]}, ${value})`;
    }
  }
  return value;
}

/** Every longhand any prop touches, in table order so the output is stable and readable. */
function longhands(): string[] {
  const seen = new Set<string>();
  for (const name of boxPropNames) for (const css of boxProps[name].css) seen.add(css);
  return [...seen];
}

export function generateLayoutCss(): string {
  const lines: string[] = [HEADER, "", ...registrations(), ""];
  const all = longhands();

  lines.push(".kk-box {");
  for (const longhand of all) lines.push(`  ${longhand}: ${chain(longhand, 0)};`);
  // A tier asks "how wide is my slot", so every Box is a query container for its children.
  // inline-size only: containment on the block axis would break height-from-content.
  lines.push("  container-type: inline-size;", "}", "");

  tierNames.forEach((_, i) => {
    lines.push(`@container (min-width: ${tiers[tierNames[i]!]}) {`, "  .kk-box {");
    for (const longhand of all) lines.push(`    ${longhand}: ${chain(longhand, i + 1)};`);
    lines.push("  }", "}", "");
  });

  return lines.join("\n");
}
