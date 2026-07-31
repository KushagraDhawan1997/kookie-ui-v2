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
  controlHeight,
  controlPaddingX,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  radius,
  radiusControl,
  radiusOverlay,
  radiusSurface,
  space,
} from "./config.ts";

const HEADER = `/* GENERATED FILE — do not edit.
   Source: src/tokens/generate.ts from src/tokens/config.ts.
   Hand edits are overwritten by the next build and fail the drift test. */`;

/** scale = global zoom. density = control compactness only. radius-factor = the Theme radius prop. */
const zoom = (px: number) => `calc(${px}px * var(--scale))`;
const zoomDense = (px: number) => `calc(${px}px * var(--scale) * var(--density))`;
const zoomRadius = (px: number) => `calc(${px}px * var(--scale) * var(--radius-factor))`;

export function generateTokens(): string {
  const lines: string[] = [];
  const put = (name: string, value: string) => lines.push(`  --${name}: ${value};`);

  lines.push(HEADER, ":root {");

  lines.push("  /* factors — Theme props drive these (§5) */");
  put("scale", "1");
  put("density", "1");
  put("radius-factor", "1");

  lines.push("", "  /* space palette (§3) — layout currency; density never touches it */");
  space.forEach((px, i) => put(`space-${i + 1}`, zoom(px)));

  lines.push("", "  /* radius palette (§6) */");
  radius.forEach((px, i) => put(`radius-${i}`, zoomRadius(px)));
  put("radius-full", "9999px");

  lines.push("", "  /* type (§15) — scale only, never density */");
  fontSize.forEach((px, i) => put(`font-size-${i + 1}`, zoom(px)));
  lineHeight.forEach((px, i) => put(`line-height-${i + 1}`, zoom(px)));
  letterSpacing.forEach((em, i) => put(`letter-spacing-${i + 1}`, `${em}em`));
  for (const [name, weight] of Object.entries(fontWeight)) put(`font-weight-${name}`, String(weight));
  put("font-body", fontFamily.body);
  put("font-heading", fontFamily.heading);
  put("font-mono", fontFamily.mono);

  lines.push("", "  /* semantic: control family, indexed by the size prop (§4, §6) */");
  controlHeight.ratios.forEach((ratio, i) =>
    put(`control-height-${i + 1}`, zoomDense(controlHeight.base * ratio)),
  );
  controlPaddingX.forEach((step, i) =>
    put(`control-px-${i + 1}`, `calc(var(--space-${step}) * var(--density))`),
  );
  radiusControl.forEach((step, i) => put(`radius-control-${i + 1}`, `var(--radius-${step})`));

  lines.push("", "  /* semantic: surfaces have no size index — flat tokens (§6) */");
  put("radius-surface", `var(--radius-${radiusSurface})`);
  put("radius-overlay", `var(--radius-${radiusOverlay})`);

  lines.push("}", "");
  return lines.join("\n");
}

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "tokens.css");

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFileSync(outPath, generateTokens());
  console.log(`tokens.css: ${generateTokens().length} bytes (raw)`);
}
