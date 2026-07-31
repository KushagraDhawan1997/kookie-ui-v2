/**
 * Emits tokens.css from config.ts. The multiplier wiring below IS DECISIONS.md §12's
 * table expressed as code — scale is global zoom, density is control-only, radius-factor
 * is radius-only. Semantic tokens reference palette tokens; they never restate a number
 * (§6: consistency comes from shared reference, not numeric coincidence).
 *
 * Run: node --experimental-strip-types src/tokens/generate.ts
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  defaultRadiusLevel,
  density,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  radiusLevels,
  radiusOverlay,
  radiusSurface,
  space,
  type DensityLevel,
  type RadiusLevel,
} from "./config.ts";

const HEADER = `/* GENERATED FILE — do not edit.
   Source: src/tokens/generate.ts from src/tokens/config.ts.
   Hand edits are overwritten by the next build and fail the drift test. */`;

const zoom = (px: number) => `calc(${px}px * var(--scale))`;

export function generateTokens(): string {
  const lines: string[] = [];
  const put = (name: string, value: string) => lines.push(`  --${name}: ${value};`);

  lines.push(HEADER, ":root {");

  lines.push("  /* factor (§5, §12). --scale is reserved, not public: no Theme prop yet. */");
  put("scale", "1");

  lines.push("", "  /* space palette (§3) — layout currency; density never touches it */");
  space.forEach((px, i) => put(`space-${i + 1}`, zoom(px)));

  lines.push("", `  /* radius palette (§6) at the ${defaultRadiusLevel} level */`);
  lines.push(...radiusPalette(defaultRadiusLevel));

  lines.push("", "  /* type (§15) — scale only, never density */");
  fontSize.forEach((px, i) => put(`font-size-${i + 1}`, zoom(px)));
  lineHeight.forEach((px, i) => put(`line-height-${i + 1}`, zoom(px)));
  letterSpacing.forEach((em, i) => put(`letter-spacing-${i + 1}`, `${em}em`));
  for (const [name, weight] of Object.entries(fontWeight)) put(`font-weight-${name}`, String(weight));
  put("font-body", fontFamily.body);
  put("font-heading", fontFamily.heading);
  put("font-mono", fontFamily.mono);

  lines.push("", "  /* semantic: surfaces have no size index — flat tokens (§6) */");
  put("radius-surface", `var(--radius-${radiusSurface})`);
  put("radius-overlay", `var(--radius-${radiusOverlay})`);

  lines.push("", "  /* semantic: control family at the default density (§4, §6, §12) */");
  lines.push(...controlFamily("default"));

  lines.push("}", "");

  // Density is a designed set, not a multiplier: each level re-declares the control family.
  for (const level of Object.keys(density) as DensityLevel[]) {
    if (level === "default") continue;
    lines.push(`[data-density="${level}"] {`, ...controlFamily(level), "}", "");
  }

  // A radius level re-declares only palette values, never a semantic token, so it composes
  // with density instead of racing it in the cascade.
  for (const level of Object.keys(radiusLevels) as RadiusLevel[]) {
    if (level === defaultRadiusLevel) continue;
    lines.push(`[data-radius="${level}"] {`, ...radiusPalette(level), "}", "");
  }

  return lines.join("\n");
}

/** The radius palette for one level (§6). Steps 1-5 are the control band, 6-7 surfaces. */
function radiusPalette(level: RadiusLevel): string[] {
  const { steps, full } = radiusLevels[level];
  const out = steps.map((px, i) => `  --radius-${i}: ${px === 0 ? "0px" : zoom(px)};`);
  out.push(`  --radius-full: ${full === 0 ? "0px" : `${full}px`};`);
  return out;
}

/** The four size-indexed control tokens for one density level (§12). */
function controlFamily(level: DensityLevel): string[] {
  const set = density[level];
  const out: string[] = [];
  const put = (name: string, value: string) => out.push(`  --${name}: ${value};`);

  set.height.forEach((px, i) => put(`control-height-${i + 1}`, zoom(px)));
  set.px.forEach((step, i) => put(`control-px-${i + 1}`, `var(--space-${step})`));
  set.gap.forEach((step, i) => put(`control-gap-${i + 1}`, `var(--space-${step})`));
  set.radius.forEach((step, i) => put(`radius-control-${i + 1}`, `var(--radius-${step})`));

  return out;
}

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "tokens.css");

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFileSync(outPath, generateTokens());
  console.log(`tokens.css: ${generateTokens().length} bytes (raw)`);
}
