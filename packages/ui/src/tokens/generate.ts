/**
 * Emits tokens.css from config.ts. The multiplier wiring below IS DECISIONS.md §12's
 * table expressed as code — scale is global zoom, density is control-only, radius-factor
 * is radius-only. Semantic tokens reference palette tokens; they never restate a number
 * (§6: consistency comes from shared reference, not numeric coincidence).
 *
 * Run: node --experimental-strip-types src/tokens/generate.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { generateLayoutCss } from "../system/layout-css.ts";
import { tones, type ToneName } from "./color-config.ts";
import { colorDeclarations, contrastHighDeclarations } from "./color.ts";
import {
  borderWidth,
  coarse,
  controlGap,
  cursor,
  defaultRadiusLevel,
  density,
  typeBands,
  focusRing,
  fontFamily,
  fontSize,
  fontWeight,
  handheldMedia,
  narrowMedia,
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
  inputFontFloor,
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
  lines.push("  /* and the zoom floor (§4), which is zero here: a fine pointer never zooms on focus.");
  lines.push("     The coarse world re-declares it — see pointerWorld(). */");
  put("input-font-floor", "0px");

  lines.push("", "  /* space palette (§3) — layout currency; density never touches it */");
  space.forEach((px, i) => put(`space-${i + 1}`, zoom(px)));

  lines.push("", `  /* radius palette (§6) at the ${defaultRadiusLevel} level */`);
  lines.push(...radiusPalette(defaultRadiusLevel));

  lines.push("", "  /* type (§15) — scale and the type bands (§17) reach it, never density */");
  fontSize.forEach((px, i) => put(`font-size-${i + 1}`, zoom(px)));
  lineHeight.forEach((px, i) => put(`line-height-${i + 1}`, zoom(px)));
  letterSpacing.forEach((em, i) => put(`letter-spacing-${i + 1}`, `${em}em`));
  for (const [name, weight] of Object.entries(fontWeight)) put(`font-weight-${name}`, String(weight));
  put("font-body", fontFamily.body);
  put("font-heading", fontFamily.heading);
  put("font-mono", fontFamily.mono);

  lines.push("", "  /* the icon box (§4) — size-indexed, but never density- or pointer-indexed */");
  iconSize.forEach((px, i) => put(`icon-size-${i + 1}`, zoom(px)));

  lines.push(
    "",
    "  /* chrome widths (§8, §13). These were raw px literals in the hand-authored layers until",
    "     2026-08-03 — the only geometry in a control that did not answer --scale, so a bordered",
    "     button at scale 2 kept a 1px hairline while every other length doubled. */",
  );
  put("border-width", zoom(borderWidth));
  put("focus-ring-width", zoom(focusRing.width));
  put("focus-ring-offset", zoom(focusRing.offset));

  lines.push("", "  /* motion (§8) — designed values with NO consumer: every transition is zeroed until the");
  lines.push("     motion system is designed, and a law pins that. Not a shipped transition. */");
  put("motion-duration", motion.duration);
  put("motion-easing", motion.easing);

  lines.push("", "  /* §8 — pointer feedback; `button` is the contested one, so it is overridable */");
  put("cursor-button", cursor.button);
  put("cursor-loading", cursor.loading);
  put("cursor-disabled", cursor.disabled);
  put("cursor-text", cursor.text);

  lines.push("", "  /* semantic: surface radii by size index, overlay flat (§6, §10) */");
  lines.push(...surfaceRadiusFamily());

  lines.push("", "  /* semantic: control family at the default density (§4, §6, §12); the gap is");
  lines.push("     the label cluster's — size-indexed, never density's (§4) */");
  lines.push(...controlFamily(density.default));
  lines.push(...controlGapFamily("fine"));

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
    `@media ${handheldMedia} {`,
    ...pointerWorld("auto", coarse).map((l) => (l === "" ? l : `  ${l}`)),
    "}",
    "",
  );

  // §17 — the TWO type bands (split 2026-08-05). A band re-prices the palette in place, the
  // radius-level mechanism one family over: re-picking within the family via var() is
  // impossible here, because a band maps step 5 onto step 5's own name and a custom property
  // that references itself is invalid at computed-value time, taking the whole chain down.
  //
  // Each band emits only the steps it MOVES. That is what lets two bands coexist without
  // fighting: `handheld` owns 1-4, `narrow` owns 8-9, and neither can silently overwrite the
  // other's answer on a phone, where both apply.
  //
  // The HANDHELD band rides the pointer axis's own scopes — its declarations are emitted
  // inside pointerWorld() above, not here. Since the `device` prop was dropped (2026-08-05,
  // LOG), coarse means handheld with no daylight between them: pinning `pointer` forces the
  // whole coarse world, type included, and `pointer="fine"` is the escape (it re-declares
  // the identity steps, because an escape that does nothing is not an escape). The fine
  // world deliberately does NOT touch steps 8-9 — being fine says nothing about width.
  const narrow = moved(typeBands.narrow);

  // The NARROW band, and it carries no attribute at all — deliberately. Width is not a device
  // fact and there is nothing here to escape: a Theme pinned to `desktop` inside a 375px
  // window still has a 375px window. It sits on :root and inherits into every Theme scope,
  // because nothing else declares these steps. Last in source order, which is what lets it
  // win the :root-versus-:root tie against the base palette.
  lines.push(
    `@media ${narrowMedia} {`,
    "  :root {",
    ...bandTypePalette(typeBands.narrow, narrow).map((l) => `  ${l}`),
    "  }",
    "}",
    "",
  );

  return lines.join("\n");
}

/**
 * Every block one pointer value needs: the control family per density level, the handheld
 * type band (§17 — since the `device` prop was dropped, coarse means handheld and the band
 * rides these scopes), plus the (pointer x radius x density) cells for the semantic control
 * radii — the same cells the radius x density interaction needed, one axis deeper (§16).
 */
function pointerWorld(pointer: string, sets: Record<DensityLevel, DensitySet>): string[] {
  const P = `[data-pointer="${pointer}"]`;
  const out: string[] = [];

  // The gap re-declares per pointer world (the coarse cluster spreads with its box, §16) —
  // and only per world: density blocks inherit it, which IS the density-invariance.
  // The zoom floor rides the pointer world rather than a bare @media, so it resolves through
  // the same [data-pointer] scopes everything else does — pinnable, escapable, and readable as
  // a computed value in the suite. Raw px: Safari's threshold does not zoom with --scale.
  const zoomFloor = `  --input-font-floor: ${pointer === "fine" ? "0px" : `${inputFontFloor}px`};`;
  // The handheld band, over exactly the steps it owns. `fine` emits the identity — the
  // escape from a coarse ancestor must RE-declare, because a nested scope that declares
  // nothing inherits. Neither world touches steps 8-9: width is the narrow band's question,
  // and a pointer says nothing about how wide the window is.
  const bandSteps = moved(typeBands.handheld);
  const band = bandTypePalette(
    pointer === "fine" ? fontSize.map((_, i) => i + 1) : typeBands.handheld,
    bandSteps,
  );
  out.push(`${P} {`, ...controlFamily(sets.default), ...controlGapFamily(pointer === "fine" ? "fine" : "coarse"), zoomFloor, ...band, "}", "");
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
  // The ink ladder (§15): the type rungs' per-family resolutions. `text` stays what it was —
  // the surface layer consumes it — and ink is the type layer's own trio.
  "ink",
  "ink-muted",
  "ink-faint",
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
    `  /* Tell the UA which world it is painting in (§5). Without it a dark subtree keeps the`,
    `     light scrollbar track, and a consumer's <input> or <select> renders with a white UA`,
    `     background — the one part of the page the token layer cannot reach by itself. */`,
    `  color-scheme: ${mode};`,
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
    `  /* foreground context (§10, §15) — what a surface re-scopes for everything inside it.`,
    `     Three rungs, the type ladder's resolutions: loud reads text, medium muted, quiet`,
    `     faint. Faint is BELOW body-copy contrast by design (a placeholder, a timestamp) —`,
    `     it must never carry a reading-length line, which is the call site's law. */`,
    `  --color-text: var(--neutral-12);`,
    `  --color-text-muted: var(--neutral-11);`,
    `  --color-text-faint: var(--neutral-10);`,
    "",
    `  /* the seal (§10) — a surface without a material is OPAQUE; translucency is material's`,
    `     job alone. Paper above the page, so a card is visible where it lives. The hover and`,
    `     active steps serve the card-as-button pattern: the seal darkening under the pointer. */`,
    `  --color-surface: ${surfaceColor[mode].rest};`,
    `  --color-surface-hover: ${surfaceColor[mode].hover};`,
    `  --color-surface-active: ${surfaceColor[mode].active};`,
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

/** The radius palette for one level (§6). Steps 1-5 control, 6-9 surfaces, 10 the overlay. */
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

/** The four size-indexed control tokens for one designed set (§12, §16). No gap here: the
 * icon-label gap is the label cluster's (§4), size- and pointer-indexed but never density's. */
function controlFamily(set: DensitySet): string[] {
  const out: string[] = [];
  const put = (name: string, value: string) => out.push(`  --${name}: ${value};`);

  set.height.forEach((px, i) => put(`control-height-${i + 1}`, zoom(px)));
  // Raw px, alongside the height it has to hold a fraction of — NOT a pick into the space
  // palette (changed 2026-08-05). The palette's control band grows faster per step than the
  // height ladder does, so an index could not hold that fraction and the padding drifted to
  // half the box at size 4. See the note on `density` in config.ts.
  set.px.forEach((px, i) => put(`control-px-${i + 1}`, zoom(px)));
  set.radius.forEach((step, i) => put(`radius-control-${i + 1}`, `var(--radius-${step})`));

  // The inset a control keeps around anything it hosts in a slot, and the height that leaves
  // for the hosted control. ONE designed number drives both, which is the point: the space
  // above, below and beside a trailing button is the same number, where before the sides came
  // from --control-px (12px at size 2) and the top and bottom came from whatever was left over
  // (~1px) — a 13:1 asymmetry nobody chose.
  //
  // The hosted height is derived rather than designed a second time, because two designed
  // ladders that must agree are two ladders that will drift. It is also what stops a field
  // GROWING past its own size token: a nested control that exceeds the content box stretched
  // the wrapper by 2 x --border-width in 16/16 measured cells.
  set.slotInset.forEach((px, i) => put(`slot-inset-${i + 1}`, zoom(px)));

  return out;
}

/** The icon-label gap for one pointer world (§4, §12): size-indexed, density-invariant. */
function controlGapFamily(world: keyof typeof controlGap): string[] {
  return controlGap[world].map((step, i) => `  --control-gap-${i + 1}: var(--space-${step});`);
}

/** The steps a band actually MOVES — every index whose pick is not the identity. Derived
 * rather than listed, so tuning a pick moves the emitted set with it and a band can never
 * declare a step it does not change (which is what would let two bands fight). */
function moved(picks: readonly number[]): number[] {
  return picks.flatMap((step, i) => (step === i + 1 ? [] : [i]));
}

/** One band of the type palette (§15, §17), over the steps it moves: each pick re-prices the
 * step's designed TRIPLE — font-size, line height, letter spacing move together or not at
 * all. `indices` is passed rather than derived so the fine-pointer ESCAPE can emit the
 * identity over exactly the set its band owns. */
function bandTypePalette(picks: readonly number[], indices: readonly number[]): string[] {
  const at = (i: number) => picks[i]! - 1;
  return [
    ...indices.map((i) => `  --font-size-${i + 1}: ${zoom(fontSize[at(i)]!)};`),
    ...indices.map((i) => `  --line-height-${i + 1}: ${zoom(lineHeight[at(i)]!)};`),
    ...indices.map((i) => `  --letter-spacing-${i + 1}: ${letterSpacing[at(i)]!}em;`),
  ];
}

const here = dirname(fileURLToPath(import.meta.url));

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const artifacts = [
    { path: join(here, "tokens.css"), name: "tokens.css", content: generateTokens() },
    { path: join(here, "../system/layout.css"), name: "layout.css", content: generateLayoutCss() },
  ];

  // `--check` verifies and writes NOTHING. `build` runs it in that mode, because a build that
  // regenerates into src/ silently repairs the very drift the law tests are there to catch:
  // turbo ran build and test as concurrent graph roots, the generator won every race, and the
  // "committed artifact matches the generator" law read a file that had just been rewritten.
  // Ordering the two does not fix it — whichever runs first, build still repairs the evidence.
  // Only a build that does not write can be trusted to leave a hand edit visible.
  if (process.argv.includes("--check")) {
    const drifted = artifacts.filter((a) => readFileSync(a.path, "utf8") !== a.content);
    for (const a of drifted) console.error(`${a.name}: DRIFT — committed file does not match the generator`);
    if (drifted.length) {
      console.error("Run `pnpm --filter @kookie-ui/react run tokens` and commit the result.");
      process.exit(1);
    }
    console.log(`generated files in sync: ${artifacts.map((a) => a.name).join(", ")}`);
  } else {
    for (const a of artifacts) {
      writeFileSync(a.path, a.content);
      console.log(`${a.name}: ${a.content.length} bytes (raw)`);
    }
  }
}
