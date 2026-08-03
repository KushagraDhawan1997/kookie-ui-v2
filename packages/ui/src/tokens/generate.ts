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

import { generateLayoutCss } from "../system/layout-css.ts";
import { tones, type ToneName } from "./color-config.ts";
import { colorDeclarations, contrastHighDeclarations } from "./color.ts";
import {
  coarse,
  cursor,
  defaultRadiusLevel,
  density,
  fontFamily,
  fontSize,
  fontWeight,
  iconSize,
  layoutSpace,
  letterSpacing,
  lineHeight,
  material,
  motion,
  radiusLevels,
  radiusOverlay,
  radiusSurface,
  shadow,
  space,
  surfaceChrome,
  surfaceColor,
  surfacePadding,
  touchTargetMin,
  type DensityLevel,
  type DensitySet,
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

  lines.push("", "  /* the touch floor (§16) — raw px on purpose: a physical floor, not a zoomable length */");
  put("touch-target-min", `${touchTargetMin}px`);

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

  lines.push("", "  /* the icon box (§4) — size-indexed, but never density- or pointer-indexed */");
  iconSize.forEach((px, i) => put(`icon-size-${i + 1}`, zoom(px)));

  lines.push("", "  /* §8's one canonical interaction transition — not a motion scale */");
  put("motion-duration", motion.duration);
  put("motion-easing", motion.easing);

  lines.push("", "  /* §8 — pointer feedback; `button` is the contested one, so it is overridable */");
  put("cursor-button", cursor.button);
  put("cursor-loading", cursor.loading);
  put("cursor-disabled", cursor.disabled);

  lines.push("", "  /* semantic: surface radii by size index, overlay flat (§6, §10) */");
  lines.push(...surfaceRadiusFamily());

  lines.push("", "  /* semantic: control family at the default density (§4, §6, §12) */");
  lines.push(...controlFamily(density.default));

  lines.push("", "  /* layout space (§3, §12) at the default density — the 1:1 identity map. Every distance");
  lines.push("     BETWEEN things (gap, Box p/m, surface padding) reads this layer, never the palette;");
  lines.push("     control innards keep the raw palette because their density answer is the designed set. */");
  lines.push(...layoutSpaceFamily("default"));

  lines.push("", "  /* surface padding (§10) — picks into layout space, so density reaches cards through one lever */");
  lines.push(...surfacePaddingFamily());

  lines.push("", "  /* colour, generated (§7) — light mode */");
  lines.push(...colorDeclarations("light"));

  lines.push(...surfaceWorld("light"));

  lines.push("}", "");

  // `light` gets its own block for the same reason `default` density does: Theme stamps
  // data-appearance on every node, so a light Theme nested inside a dark region would
  // otherwise INHERIT the dark custom properties — an escape that does nothing is not an
  // escape (§5, §16). :root cannot serve as that escape because :root only ever matches
  // <html>, and Theme renders a div.
  lines.push(
    `[data-appearance="light"] {`,
    ...colorDeclarations("light"),
    ...surfaceWorld("light"),
    "}",
    "",
  );

  // The surface declarations repeat inside the dark scope because a var() resolves where it
  // is declared: --color-text baked at :root would carry the LIGHT neutral-12 into a dark
  // subtree (the same lesson --focus-ring taught in §8).
  lines.push(
    `[data-appearance="dark"] {`,
    ...colorDeclarations("dark"),
    ...surfaceWorld("dark"),
    "}",
    "",
  );

  // P3 rides on top of the sRGB values rather than replacing them, so a narrow-gamut display
  // keeps a complete system. It is worth the bytes where sRGB constrains a hue most: sky,
  // cyan and blue gain 21-31% chroma, while indigo and violet gain 3-5% (§7).
  lines.push(
    "@supports (color: color(display-p3 0 0 0)) {",
    "  :root {",
    ...colorDeclarations("light", "p3").map((l) => `  ${l}`),
    "  }",
    `  [data-appearance="light"] {`,
    ...colorDeclarations("light", "p3").map((l) => `  ${l}`),
    "  }",
    `  [data-appearance="dark"] {`,
    ...colorDeclarations("dark", "p3").map((l) => `  ${l}`),
    "  }",
    "}",
    "",
  );

  // contrast="high" is an accessibility setting (§7): it shifts values, it never remaps which
  // step a role reads. Emitted for the explicit prop and for the platform signal, so a user
  // who asked their OS for more contrast gets it without anyone wiring the prop up.
  for (const gamut of ["srgb", "p3"] as const) {
    const wrap = (body: string[]) =>
      gamut === "p3"
        ? ["@supports (color: color(display-p3 0 0 0)) {", ...body.map((l) => `  ${l}`), "}"]
        : body;
    for (const mode of ["light", "dark"] as const) {
      // Light needs BOTH bases. :root carries the un-themed document, but Theme renders a div,
      // so a :root-only block means the prop matches nothing at all in the default appearance
      // — the axis was inert in light until 2026-08-03. The dark base already worked only
      // because Theme co-locates data-appearance and data-contrast on one element (§5, §7).
      const bases = mode === "light" ? [":root", `[data-appearance="light"]`] : [`[data-appearance="dark"]`];
      const decls = contrastHighDeclarations(mode, gamut);
      const high = bases.map((b) => `${b}[data-contrast="high"]`).join(", ");
      // The platform signal reaches anything that has not explicitly opted out. Theme stamps
      // data-contrast ONLY when the axis was actually chosen, so an unconfigured Theme node
      // carries no attribute and this guard still matches it (§7).
      const auto = bases.map((b) => `${b}:not([data-contrast="normal"])`).join(", ");
      lines.push(
        ...wrap([
          `${high} {`,
          ...decls,
          "}",
          `@media (prefers-contrast: more) {`,
          `  ${auto} {`,
          ...decls.map((l) => `  ${l}`),
          "  }",
          "}",
        ]),
        "",
      );
    }
  }

  // Density is a designed set, not a multiplier: each level re-declares the control family
  // and, since 2026-08-04, re-picks the layout-space layer (§12). Surface padding references
  // layout space, so it must be re-declared IN THE SAME SCOPE — the substitution-at-
  // declaration lesson (§6): a var() bakes where it is declared, and a --surface-p-N left in
  // :root would carry the default rhythm into a compact subtree. No pointer cells for either:
  // nothing here varies by pointer (§16 — gutters must not inflate on the smaller screen),
  // and the single-attribute block still matches under any [data-pointer] scope.
  //
  // `default` is emitted too, and it is not redundant with :root: Theme stamps data-density
  // on every Theme node, and a nested default Theme inside a compact region otherwise
  // INHERITS the compact custom properties — the same "an escape that does nothing is not an
  // escape" bug the pointer fine world fixed (§16). Emitted before the pointer worlds, so a
  // coarse device's later [data-pointer] blocks still win the same-specificity tie.
  for (const level of Object.keys(density) as DensityLevel[]) {
    lines.push(
      `[data-density="${level}"] {`,
      ...controlFamily(density[level]),
      ...layoutSpaceFamily(level),
      ...surfacePaddingFamily(),
      "}",
      "",
    );
  }

  // Radius levels re-price the palette. The default level is emitted too — Theme stamps
  // data-radius on every node, so a nested medium Theme inside a small-radius region would
  // otherwise inherit the small palette (the density default-escape bug, one axis over).
  // Each block also re-declares the surface radius semantics IN ITS OWN SCOPE: they are not
  // density-indexed, so no cell carries them, and a :root-only declaration would stay baked
  // to the default palette inside any [data-radius] subtree (substitution-at-declaration, §6).
  for (const level of Object.keys(radiusLevels) as RadiusLevel[]) {
    lines.push(
      `[data-radius="${level}"] {`,
      ...radiusPalette(level),
      ...surfaceRadiusFamily(),
      "}",
      "",
    );
  }

  // ...but the semantic control radii have to be re-declared alongside them, and this is the
  // part that reading the CSS will not tell you: a custom property that references another is
  // substituted WHERE IT IS DECLARED, not where it is used. `--radius-control-2: var(--radius-2)`
  // sitting in `:root` is therefore already baked to the default palette by the time any
  // `[data-radius]` block further down the tree changes `--radius-2`. The earlier claim that
  // the two axes composed because neither wrote the other's token was wrong, and only a browser
  // could say so.
  //
  // Emitting every (radius x density) cell fixes it exactly: the pair is co-located because
  // Theme always writes both attributes on one element, and the combined selector outranks
  // either alone. The single-attribute blocks stay for raw-attribute use.
  for (const level of Object.keys(radiusLevels) as RadiusLevel[]) {
    for (const d of Object.keys(density) as DensityLevel[]) {
      const decls = density[d].radius.map(
        (step, i) => `  --radius-control-${i + 1}: var(--radius-${step});`,
      );
      lines.push(`[data-radius="${level}"][data-density="${d}"] {`, ...decls, "}", "");
    }
    if (level !== defaultRadiusLevel) {
      const decls = density.default.radius.map(
        (step, i) => `  --radius-control-${i + 1}: var(--radius-${step});`,
      );
      lines.push(`[data-radius="${level}"] {`, ...decls, "}", "");
    }
  }

  // The tone indirection (§7's role layer, §9's axes). A component never names a tone: it
  // writes `data-tone` and reads `--tone-*`, so one recipe serves every tone and the CSS cost
  // is O(tones + rungs) instead of O(tones x rungs x components) — §2's additivity claim, at
  // the one place it is actually decided.
  //
  // Safe against the substitution-at-declaration rule (§6) because the direction is right:
  // `data-tone` sits on the control, `data-appearance` on a Theme ABOVE it, so `var(--accent-9)`
  // resolves here against whichever mode is already in scope.
  for (const tone of Object.keys(tones) as ToneName[]) {
    lines.push(`[data-tone="${tone}"] {`, ...toneRoles(tone), "}", "");
  }

  // §16 — the pointer axis. Coarse is a second designed geometry, emitted as cells exactly
  // like density x radius above and for the same substitution-at-declaration reason. Theme
  // stamps every resolved axis on one element, so the combined selectors always co-locate.
  //
  // Three scopes: [data-pointer="coarse"] (pinned), [data-pointer="auto"] under the media
  // query (the default — the correct thing when nobody thinks), and [data-pointer="fine"]
  // (the escape from a coarse ancestor; it must RE-declare the fine sets, because a nested
  // scope that declares nothing inherits the coarse values, not the :root ones).
  lines.push(...pointerWorld("fine", density));
  lines.push(...pointerWorld("coarse", coarse));
  lines.push(
    "@media (pointer: coarse) {",
    ...pointerWorld("auto", coarse).map((l) => (l === "" ? l : `  ${l}`)),
    "}",
    "",
  );

  return lines.join("\n");
}

/**
 * Every block one pointer value needs: the control family per density level, plus the
 * (pointer x radius x density) cells for the semantic control radii — the same cells the
 * radius x density interaction needed, one axis deeper (§16).
 */
function pointerWorld(pointer: string, sets: Record<DensityLevel, DensitySet>): string[] {
  const P = `[data-pointer="${pointer}"]`;
  const out: string[] = [];

  out.push(`${P} {`, ...controlFamily(sets.default), "}", "");
  for (const d of Object.keys(sets) as DensityLevel[]) {
    if (d === "default") continue;
    out.push(`${P}[data-density="${d}"] {`, ...controlFamily(sets[d]), "}", "");
  }

  for (const level of Object.keys(radiusLevels) as RadiusLevel[]) {
    for (const d of Object.keys(sets) as DensityLevel[]) {
      const decls = sets[d].radius.map(
        (step, i) => `  --radius-control-${i + 1}: var(--radius-${step});`,
      );
      out.push(`${P}[data-radius="${level}"][data-density="${d}"] {`, ...decls, "}", "");
    }
    const decls = sets.default.radius.map(
      (step, i) => `  --radius-control-${i + 1}: var(--radius-${step});`,
    );
    out.push(`${P}[data-radius="${level}"] {`, ...decls, "}", "");
  }

  return out;
}

/** Every role a component may read, bound to one tone family (§7). */
const ROLES = [
  "soft",
  "soft-hover",
  "soft-active",
  "solid",
  "solid-hover",
  "solid-active",
  "border",
  "text",
  "label",
  "contrast",
  // The tone-forward surface fill (§10): alpha, visible because it carries chroma — Callout's
  // dressing. The default surface never uses alpha; it seals (--color-surface below).
  "a3",
] as const;

function toneRoles(tone: ToneName): string[] {
  return ROLES.map((role) => `  --tone-${role}: var(--${tone}-${role});`);
}

/**
 * The surface world (§10): material recipes and foreground context roles. No shadows and no
 * elevation anywhere — elevation was deleted as an axis (LOG 2026-08-03); detachment is a
 * per-component fact decided when Popover and Dialog are built. Emitted per mode — every
 * value differs by mode or references a stepped colour that does, and a var() resolves
 * where declared.
 */
function surfaceWorld(mode: "light" | "dark"): string[] {
  const m = material[mode];
  const glass = (name: "thin" | "regular" | "thick") => {
    const [rest, hover, active] = m[name].alpha;
    return [
      `  --material-${name}-alpha: ${rest}%;`,
      `  --material-${name}-alpha-hover: ${hover}%;`,
      `  --material-${name}-alpha-active: ${active}%;`,
      `  --material-${name}-filter: ${m[name].filter};`,
    ];
  };
  return [
    "",
    `  /* material recipes (§10) — material is a fill MODIFIER, not a fill: the consuming`,
    `     layer mixes the component's OWN fill toward transparent at these alphas, so tone`,
    `     and loudness ride into the veil for free. hover/active are §8's steps on glass's`,
    `     one ramp — read by controls and interactive surfaces; a static surface reads the`,
    `     rest alpha alone. */`,
    ...glass("thin"),
    ...glass("regular"),
    ...glass("thick"),
    `  --material-opaque-alpha: ${material.fallbackAlpha}%;`,
    "",
    `  /* foreground context (§10) — what a surface re-scopes for everything inside it */`,
    `  --color-text: var(--neutral-12);`,
    `  --color-text-muted: var(--neutral-11);`,
    "",
    `  /* the seal (§10) — a surface without a material is OPAQUE; translucency is material's`,
    `     job alone. Paper above the page, so a card is visible where it lives. The hover and`,
    `     active steps serve the card-as-button pattern: the seal darkening under the pointer. */`,
    `  --color-surface: ${surfaceColor[mode]};`,
    `  --color-surface-hover: var(--neutral-2);`,
    `  --color-surface-active: var(--neutral-3);`,
    "",
    `  /* the shadow palette (§13) — a resource for Box and blocks, never read by a component;`,
    `     elevation stays deleted. Row 1 is the inset well. */`,
    ...shadow[mode].map((row, i) => `  --shadow-${i + 1}: ${row};`),
    "",
    `  /* the elevated world's dressing (§5, §10) — composed FROM the palette: depth is`,
    `     var(--shadow-2); dark adds only the rim-light. The edge stays --tone-border. */`,
    `  --surface-chrome: ${surfaceChrome[mode]};`,
  ];
}

/** The radius palette for one level (§6). Steps 1-5 are the control band, 6-7 surfaces. */
function radiusPalette(level: RadiusLevel): string[] {
  const { steps, full } = radiusLevels[level];
  const out = steps.map((px, i) => `  --radius-${i}: ${px === 0 ? "0px" : zoom(px)};`);
  out.push(`  --radius-full: ${full === 0 ? "0px" : `${full}px`};`);
  return out;
}

/** Surface radii (§6, §10): size-indexed picks into the surface band, plus the flat overlay. */
function surfaceRadiusFamily(): string[] {
  return [
    ...radiusSurface.map((step, i) => `  --radius-surface-${i + 1}: var(--radius-${step});`),
    `  --radius-overlay: var(--radius-${radiusOverlay});`,
  ];
}

/** Layout space for one density level (§3, §12): designed picks into the untouched palette. */
function layoutSpaceFamily(level: DensityLevel): string[] {
  return layoutSpace[level].map((step, i) => `  --layout-space-${i + 1}: var(--space-${step});`);
}

/** Surface padding (§10): fixed picks into layout space — density speaks through the layer. */
function surfacePaddingFamily(): string[] {
  return surfacePadding.map(
    (step, i) => `  --surface-p-${i + 1}: var(--layout-space-${step});`,
  );
}

/** The four size-indexed control tokens for one designed set (§12, §16). */
function controlFamily(set: DensitySet): string[] {
  const out: string[] = [];
  const put = (name: string, value: string) => out.push(`  --${name}: ${value};`);

  set.height.forEach((px, i) => put(`control-height-${i + 1}`, zoom(px)));
  set.px.forEach((step, i) => put(`control-px-${i + 1}`, `var(--space-${step})`));
  set.gap.forEach((step, i) => put(`control-gap-${i + 1}`, `var(--space-${step})`));
  set.radius.forEach((step, i) => put(`radius-control-${i + 1}`, `var(--radius-${step})`));

  return out;
}

const here = dirname(fileURLToPath(import.meta.url));

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const tokens = generateTokens();
  writeFileSync(join(here, "tokens.css"), tokens);
  console.log(`tokens.css: ${tokens.length} bytes (raw)`);

  const layout = generateLayoutCss();
  writeFileSync(join(here, "../system/layout.css"), layout);
  console.log(`layout.css: ${layout.length} bytes (raw)`);
}
