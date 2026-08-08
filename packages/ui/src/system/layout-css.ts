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
      return [`--kui-${stem}`, ...tierNames.map((t) => `--kui-${stem}-${t}`)];
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
  let value = base ? `var(--kui-${last}, ${base})` : `var(--kui-${last})`;
  for (let i = stems.length - 2; i >= 0; i--) value = `var(--kui-${stems[i]}, ${value})`;

  for (let t = 0; t < upTo; t++) {
    for (let i = stems.length - 1; i >= 0; i--) {
      value = `var(--kui-${stems[i]}-${tierNames[t]}, ${value})`;
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

  lines.push(".kui-box {");
  for (const longhand of all) lines.push(`  ${longhand}: ${chain(longhand, 0)};`);
  lines.push("}", "");

  // Containment is OPT-IN (§2, decided 2026-08-08 — it shipped on every Box and was the
  // recorded live defect): inline-size containment removes the box's contents from its own
  // width, so a blanket-marked Box computed to ZERO wherever layout asked it to shrink-wrap —
  // a flex-row item being the most ordinary spelling. A tier still asks "how wide is my slot",
  // but the slot is the nearest ancestor that OPTED IN via the `container` prop, falling back
  // to the Theme root — one measurable ancestor is what the mechanism needs, not a mark on
  // every box. inline-size only: containment on the block axis would break height-from-content.
  lines.push(".kui-box[data-container] {", "  container-type: inline-size;", "}", "");

  // Theme IS always a container (§2, decided 2026-08-02; unchanged by the 2026-08-08 opt-in):
  // it is the guaranteed outermost measurable ancestor, so a tier always has something to
  // read — worst case the whole themed area, which behaves like the window. The one caveat:
  // inline-size containment means a Theme's width cannot come from its contents, so a Theme
  // rendered onto a shrink-to-fit element (flex child at width:auto, inline-block) collapses.
  lines.push(".kui-theme {", "  container-type: inline-size;", "}", "");

  // The stacking frame (§20, decided 2026-08-08): the DOM-outermost theme is a stacking
  // context, so every z-index inside the app resolves inside it and a body-level portal —
  // a later sibling — always paints above, with no number ladder for call sites to memorise.
  // DOM-outermost by selector, not a React sentinel: the fact is CSS-expressible, and a
  // portalled Theme wrapper at body level matching too is harmless (it is a later sibling).
  // `isolation` and ONLY `isolation`: relative+z-index:0 (Radix's spelling) would also make
  // the theme a positioning anchor, and opacity/transform/filter/will-change each break
  // something real — a backdrop root under the glass, or a containing block trapping
  // position:fixed. A node law pins the spelling.
  lines.push(".kui-theme:not(.kui-theme *) {", "  isolation: isolate;", "}", "");

  tierNames.forEach((_, i) => {
    lines.push(`@container (min-width: ${tiers[tierNames[i]!]}) {`, "  .kui-box {");
    for (const longhand of all) lines.push(`    ${longhand}: ${chain(longhand, i + 1)};`);
    lines.push("  }", "}", "");
  });

  return lines.join("\n");
}
