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
import { decl, indent } from "./emit.ts";
import { tones, type ToneName } from "./color-config.ts";
import { colorDeclarations, contrastHighDeclarations } from "./color.ts";
import {
  borderWidth,
  coarse,
  controlGap,
  cursor,
  defaultRadiusLevel,
  density,
  dress,
  typeBands,
  focusRing,
  fontFamily,
  kbdScale,
  monoScale,
  fontSize,
  fontWeight,
  handheldMedia,
  narrowMedia,
  iconSize,
  layoutSpace,
  letterSpacing,
  lineHeight,
  look,
  markRadius,
  radiusAtom,
  markSteps,
  material,
  motion,
  radiusLevels,
  radiusOverlay,
  radiusSurface,
  controlChrome,
  controlLight,
  floatingChrome,
  floatingFlatFactor,
  floatingMinWidth,
  floatingPadding,
  shadow,
  sliderTrack,
  progressTrack,
  space,
  switchInset,
  switchW,
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
  const put = (name: string, value: string) => lines.push(decl(name, value));

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
  put("mono-scale", String(monoScale));
  put("kbd-scale", String(kbdScale));

  lines.push("", "  /* the icon box (§4) — size-indexed, but never density- or pointer-indexed */");
  iconSize.forEach((px, i) => put(`icon-size-${i + 1}`, zoom(px)));

  lines.push(
    "",
    "  /* the mark family (§4) — the painted box of a control that IS its own mark: checkbox,",
    "     radio, switch track, slider thumb. ONE ladder, and it is the line box: a mark occupies",
    "     exactly one line of the label it sits beside. Emitted as the resolved length rather",
    "     than var(--line-height-N) so a band re-pricing type cannot leave a mark behind — the",
    "     pointer worlds re-declare it below, which is where the coarse rise comes from. */",
  );
  lines.push(...markFamily(markSteps));

  lines.push(
    "",
    "  /* and the mark's own corner (§6) — its own picks into the palette, because riding",
    "     --radius-control-N made it hold a fraction of a box a mark does not have (0.250 ->",
    "     0.385 across the index, and 0.462 at comfortable size 4, a circle in all but name).",
    "     Density never touches it: the box it rounds does not move either. */",
  );
  lines.push(...markRadiusFamily(defaultRadiusLevel));
  lines.push(
    "",
    "  /* The atom corner (§6, §15): EM, one value per radius level — the atoms' box is a",
    "     property of their glyphs, so a palette pick would hold a fraction of a box they do",
    "     not have (the mark family's lesson, reached by inheritance). Resolves at USE, so",
    "     each atom prices the corner against its own font. Density never touches it. */",
  );
  lines.push(...atomRadiusFamily(defaultRadiusLevel));

  lines.push(
    "",
    "  /* the slider's track thickness (§4, §11) — raw designed px per size, ~0.25 of the fine",
    "     mark (the palette has nothing between 4 and 8, the mark's own wall one part over).",
    "     Density- and pointer-invariant: the coarse target is the CONTROL's height, and iOS",
    "     holds its track at 4pt against a 28pt thumb for the same reason. Emitted once at",
    "     :root — no scope below re-prices it, so there is nothing to re-declare. */",
  );
  sliderTrack.forEach((px, i) => lines.push(decl(`slider-track-${i + 1}`, zoom(px))));

  lines.push(
    "",
    "  /* and the progress bar's thickness (§11) — ONE value, no index: the ladder above holds",
    "     a fraction of the MARK, and a bar has no mark, so riding it would round a box the",
    "     component does not have (§6's checkbox-corner sentence, one family over). Separator's",
    "     shape instead: one designed thickness, extent from the container. Emitted at :root",
    "     alone — nothing below re-prices a value no axis reaches. */",
  );
  put("progress-track", zoom(progressTrack));

  lines.push(
    "",
    "  /* the switch's inline width (§4, §6, 2026-08-08) — ONE ladder indexed by the track's",
    "     mark step (the track is mark(n + 1)), priced per pointer world through the SAME band",
    "     picks that price the marks: a coarse switch widens one entry for the same reason it",
    "     rises one step, nothing designed twice. The pointer worlds re-declare it below. */",
  );
  lines.push(...switchFamily(markSteps));

  lines.push(
    "",
    "  /* and its thumb's inset (§4) — one designed value, all sizes, both worlds: the thumb",
    "     is the track minus this, so the diameter derives and the gap never does. */",
  );
  put("switch-inset", zoom(switchInset));

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

  lines.push("", "  /* the menu popup (§22) — padding is a layout-space pick (re-declared per density scope,");
  lines.push("     the surface-padding trap), the width floor rides --scale alone so it lives here only. */");
  lines.push(...floatingPanelFamily());
  lines.push(decl("floating-min-w", zoom(floatingMinWidth)));

  lines.push("", "  /* the look axis (§19) at its default — outlined, the identity: exactly the chrome each");
  lines.push("     one-look family declared before the axis existed. A look role holds a COLOUR, so it");
  lines.push("     repeats in every appearance scope like every other colour role — see the dark block. */");
  lines.push(...lookWorld("outlined"));

  lines.push("", "  /* colour, generated (§7) — light mode */");
  lines.push(...colorDeclarations("light"));

  lines.push(...surfaceWorld("light"));
  lines.push(...dressWorld("light"));

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
    ...dressWorld("light"),
    ...lookWorld("outlined"),
    "}",
    "",
  );

  // The surface declarations repeat inside the dark scope because a var() resolves where it
  // is declared: --color-text baked at :root would carry the LIGHT neutral-12 into a dark
  // subtree (the same lesson --focus-ring taught in §8).
  //
  // The look roles repeat for exactly that reason, and they were MISSING here for half a day
  // (caught by eye in the preview, 2026-08-06): a look role holds a colour — the seal, a
  // neutral step — so declaring it only at :root baked the LIGHT value and every dark section
  // that was not ALSO a look scope inherited a white field, a white card and a white mark.
  // Through Theme this never showed, because Theme stamps data-look beside data-appearance on
  // one element (§5's co-location) and the [data-look] blocks below re-declare there; the
  // preview's hand-written `data-appearance="dark"` sections are the un-themed path, and they
  // are what the promise "an appearance scope works standalone" is about. Consequence stated
  // rather than hidden: a bare appearance scope carries the DEFAULT look, so a raw
  // `[data-appearance]` div inside a filled app resets to outlined until it stamps a look —
  // Theme always stamps both, which is why the sanctioned path cannot hit it.
  lines.push(
    `[data-appearance="dark"] {`,
    ...colorDeclarations("dark"),
    ...surfaceWorld("dark"),
    ...dressWorld("dark"),
    ...lookWorld("outlined"),
    "}",
    "",
  );

  // The look axis (§19) — an app identity: the resting dress of the one-look families.
  // `outlined` re-declares the :root identity for the same reason `light` does: an outlined
  // Theme nested inside a filled region must escape by declaration, and Theme renders a div
  // that :root can never match.
  //
  // ONE block per look, never one per (look x appearance), and that is what forces the
  // `--dress-*` indirection above. Co-location is the reason: Theme stamps data-look beside
  // data-appearance on a single element, so a compound `[data-appearance="dark"][data-look]`
  // would resolve for Theme and MISS the supported un-themed path, where a raw `[data-look]`
  // div hangs under an appearance ancestor and matches neither compound. So these blocks may
  // only hold mode-blind mappings, and every value here is a var() reference resolved at the
  // element — where the appearance scope has already decided what the mode's pigment is.
  //
  // `filled` shipped 2026-08-06 with raw --neutral-N steps here instead, which is the same
  // mistake one level down: a step is not mode-blind. In dark, --neutral-2/3/4 ARE the seal
  // and its two states, so the surface family resolved byte-identically to `outlined` and the
  // axis only deleted the card's hairline. The steps now live per appearance in dressWorld().
  lines.push(`[data-look="outlined"] {`, ...lookWorld("outlined"), "}", "");
  lines.push(`[data-look="filled"] {`, ...lookWorld("filled"), "}", "");

  // P3 rides on top of the sRGB values rather than replacing them, so a narrow-gamut display
  // keeps a complete system. It is worth the bytes where sRGB constrains a hue most: sky,
  // cyan and blue gain 21-31% chroma, while indigo and violet gain 3-5% (§7).
  lines.push(
    "@supports (color: color(display-p3 0 0 0)) {",
    "  :root {",
    ...indent(colorDeclarations("light", "p3")),
    "  }",
    `  [data-appearance="light"] {`,
    ...indent(colorDeclarations("light", "p3")),
    "  }",
    `  [data-appearance="dark"] {`,
    ...indent(colorDeclarations("dark", "p3")),
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
        ? ["@supports (color: color(display-p3 0 0 0)) {", ...indent(body), "}"]
        : body;
    for (const mode of ["light", "dark"] as const) {
      // Light needs BOTH bases. :root carries the un-themed document, but Theme renders a div,
      // so a :root-only block means the prop matches nothing at all in the default appearance
      // — the axis was inert in light until 2026-08-03. The dark base already worked only
      // because Theme co-locates data-appearance and data-contrast on one element (§5, §7).
      const bases = mode === "light" ? [":root", `[data-appearance="light"]`] : [`[data-appearance="dark"]`];
      const decls = [...contrastHighDeclarations(mode, gamut)];
      // High contrast leans on the glass, it does not unmake it (§7, §10, 2026-08-05):
      // each thickness takes its own designed alphaHigh triple — MORE opaque, never fully,
      // so the ladder keeps three distinct thicknesses. Emptying edge and rim sends the
      // border back to the tone system — the glass blocks consume the edge with a
      // var(--tone-border) fallback that resolves AT THE ELEMENT, which is what a scope-level
      // override here could never do. srgb pass only: none of this varies by gamut.
      if (gamut === "srgb") {
        for (const t of ["thin", "regular", "thick"] as const) {
          decls.push(
            ...materialAlpha(t, material[mode][t].alphaHigh),
            decl(`material-${t}-edge`, "initial"),
            decl(`material-${t}-rim`, "initial"),
            // The elevated remap points -rim at -rim-lifted, so the lifted variant must
            // stand down here too or high contrast would resurrect the glint it just removed.
            decl(`material-${t}-rim-lifted`, "initial"),
          );
        }
        // The look axis yields its EDGE for the same reason the material does, and by the same
        // mechanism (§19, 2026-08-06). A dress edge is deliberately soft — that is the whole
        // point of `filled` — and a user who asks for high contrast is asking for the tone
        // system's boundary, not the app's taste. `initial` stands the role down and each
        // consumption site's fallback (var(--tone-border), var(--mark-edge)) resolves AT THE
        // ELEMENT, where the tone lives; a scope-level colour here could never do that.
        //
        // Written because the alternative silently did not work. The first cut picked the soft
        // steps out of `contrastHighBands.border` and claimed that made them reachable — but
        // that band is indexed into the LADDER while token names are 1-based, so
        // contrastHighBands.border = [5, 6, 7] emits as --neutral-6/7/8, and the chosen
        // --neutral-5 edges were never re-declared at all. The law that "proved" it compared
        // 1-indexed names against 0-indexed positions and passed on the mismatch. The
        // replacement law asserts the OUTCOME — the edge a component computes must change when
        // contrast="high" is set — so it holds whichever mechanism delivers it, and cannot be
        // satisfied by an off-by-one.
        for (const [family, slots] of Object.entries(look.filled)) {
          if ("border" in slots) decls.push(decl(`look-${family}-border`, "initial"));
        }
      }
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
          ...indent(decls),
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
      ...floatingPanelFamily(),
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
      ...markRadiusFamily(level),
      ...atomRadiusFamily(level),
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
  // `full` also carries the PILL PADDING as raw designed numbers (§4, §6, decided 2026-08-05):
  // a pill's corner curve swings inward at the text's cap line, so a bare edge pads wider —
  // and unlike the control radii there is no palette indirection to carry the level, so the
  // full cells must state the values themselves, per density and (below) per pointer world.
  for (const level of Object.keys(radiusLevels) as RadiusLevel[]) {
    for (const d of Object.keys(density) as DensityLevel[]) {
      const decls = controlRadiusFamily(density[d], level);
      if (level === "full") decls.push(...pillFamily(density[d]));
      lines.push(`[data-radius="${level}"][data-density="${d}"] {`, ...decls, "}", "");
    }
    if (level !== defaultRadiusLevel) {
      const decls = controlRadiusFamily(density.default, level);
      if (level === "full") decls.push(...pillFamily(density.default));
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
    ...indent(pointerWorld("auto", coarse)),
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
    ...indent(bandTypePalette(typeBands.narrow, narrow)),
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
  const picks = pointer === "fine" ? fontSize.map((_, i) => i + 1) : typeBands.handheld;
  const band = bandTypePalette(picks, bandSteps);
  // The mark family rides the band rather than being designed twice (§4): a checkbox is one
  // line of its label in both worlds, so the coarse rise is the type rise and nothing else.
  // Re-declared here in full — all four steps, not just the moved ones — because these are
  // resolved lengths, and a scope that declares nothing inherits the world above it.
  const marks = markFamily(picks);
  // The switch's width rides the same picks (§4): its track is mark(n + 1), so the world
  // that re-prices the marks re-prices the width through the identical mapping — declared
  // in full beside them, for the same a-scope-that-declares-nothing-inherits reason.
  const switchWidths = switchFamily(picks);
  out.push(`${P} {`, ...controlFamily(sets.default), ...controlGapFamily(pointer === "fine" ? "fine" : "coarse"), zoomFloor, ...band, ...marks, ...switchWidths, "}", "");
  for (const d of Object.keys(sets) as DensityLevel[]) {
    if (d === "default") continue;
    out.push(`${P}[data-density="${d}"] {`, ...controlFamily(sets[d]), "}", "");
  }

  for (const level of Object.keys(radiusLevels) as RadiusLevel[]) {
    for (const d of Object.keys(sets) as DensityLevel[]) {
      const decls = controlRadiusFamily(sets[d], level);
      if (level === "full") decls.push(...pillFamily(sets[d]));
      out.push(`${P}[data-radius="${level}"][data-density="${d}"] {`, ...decls, "}", "");
    }
    const decls = controlRadiusFamily(sets.default, level);
    if (level === "full") decls.push(...pillFamily(sets.default));
    out.push(`${P}[data-radius="${level}"] {`, ...decls, "}", "");
  }

  return out;
}

/** The material alpha triple, spelled once: surfaceWorld() and the contrast="high" loop both
 * emit these three names, and until 2026-08-06 each spelled them by hand — renaming the family
 * meant finding both. */
/** §10's transmission seam: a shadow row with every layer's alpha scaled by what the pane
    lets through. Derivation, not authorship — the palette row stays the one source. */
const fadeShadow = (row: string, factor: number): string =>
  row.replace(/\/ ([0-9.]+)\)/g, (_, a: string) => `/ ${Number((parseFloat(a) * factor).toFixed(3))})`);

/** Which palette row the floating chrome rides, read FROM the config value — the flat
    derivation must fade the same row elevated declares, and a second hand-kept index is the
    two-homes drift this repo keeps re-catching. Loud: an unparseable value throws. */
const floatingRow = (): number => {
  const m = floatingChrome.light.match(/var\(--shadow-([1-5])\)/);
  if (!m) throw new Error(`floatingChrome.light names no shadow row: "${floatingChrome.light}"`);
  return Number(m[1]) - 1;
};

const materialAlpha = (name: string, alpha: readonly number[]): string[] => {
  const [rest, hover, active] = alpha;
  return [
    decl(`material-${name}-alpha`, `${rest}%`),
    decl(`material-${name}-alpha-hover`, `${hover}%`),
    decl(`material-${name}-alpha-active`, `${active}%`),
  ];
};

/** Every role a component may read, bound to one tone family (§7). Exported for the
 * preview, which builds its role table and accent swap FROM this list — an exhaustive
 * switch, so adding a role here fails the preview build until the page can show it. */
export const ROLES = [
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
  return ROLES.map((role) => decl(`tone-${role}`, `var(--${tone}-${role})`));
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
    return [
      ...materialAlpha(name, m[name].alpha),
      decl(`material-${name}-filter`, m[name].filter),
      // The pane's own edge and lighting (§10, 2026-08-05): a hairline of light, not pigment,
      // and a top rim catch painted as a background layer — NOT a shadow, so depth stays the
      // app's identity (surfaces="elevated") and the one-box-shadow law never learns glass
      // exists. A flat world's glass has edge and glint, no lift.
      decl(`material-${name}-edge`, `rgb(255 255 255 / ${m[name].edge})`),
      decl(
        `material-${name}-rim`,
        `linear-gradient(rgb(255 255 255 / ${m[name].rim}) 0 var(--border-width), transparent var(--border-width))`,
      ),
      // The elevated world's brighter glint (§10's catch seam, 2026-08-07): under a sun the
      // pane's edge catches harder. The elevated scope remaps -rim to this; flat never does.
      decl(
        `material-${name}-rim-lifted`,
        `linear-gradient(rgb(255 255 255 / ${m[name].rimLifted}) 0 var(--border-width), transparent var(--border-width))`,
      ),
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
    decl("material-opaque-alpha", `${material.fallbackAlpha}%`),
    "",
    `  /* foreground context (§10, §15) — what a surface re-scopes for everything inside it.`,
    `     Three rungs, the type ladder's resolutions: loud reads text, medium muted, quiet`,
    `     faint. Faint is BELOW body-copy contrast by design (a placeholder, a timestamp) —`,
    `     it must never carry a reading-length line, which is the call site's law. */`,
    decl("color-text", "var(--neutral-12)"),
    decl("color-text-muted", "var(--neutral-11)"),
    decl("color-text-faint", "var(--neutral-10)"),
    "",
    `  /* the seal (§10) — a surface without a material is OPAQUE; translucency is material's`,
    `     job alone. Paper above the page, so a card is visible where it lives. The hover and`,
    `     active steps serve the card-as-button pattern: the seal darkening under the pointer. */`,
    decl("color-surface", surfaceColor[mode].rest),
    decl("color-surface-hover", surfaceColor[mode].hover),
    decl("color-surface-active", surfaceColor[mode].active),
    "",
    `  /* the tone-independent hairline (§7, §11). --tone-border answers "the edge of a thing in`,
    `     THIS family"; this answers "the edge of a thing that has no family" — a Separator, and`,
    `     the resting box of a control whose tone belongs to its ON state alone (Checkbox, Radio,`,
    `     Switch: neutral off, accent on). Without it, such a control has to choose between`,
    `     stamping accent and wearing a tinted edge at rest, or stamping neutral and having no`,
    `     way to name accent when it is checked — and naming a FAMILY in a component stylesheet`,
    `     is what the role-not-family law forbids. Neutral's own border role, exposed. */`,
    decl("color-border", "var(--neutral-border)"),
    "",
    `  /* the shadow palette (§13) — a resource for Box and blocks, never read by a component;`,
    `     elevation stays deleted. Row 1 is the inset well, row 2 the control drop. */`,
    ...shadow[mode].map((row, i) => decl(`shadow-${i + 1}`, row)),
    "",
    `  /* the elevated world's dressing (§5, §10, §19) — composed FROM the palette: surface`,
    `     depth is var(--shadow-3), control depth var(--shadow-2); dark adds only the`,
    `     rim-lights. The edge stays --tone-border. The control light is the CATCH half:`,
    `     background-image layers, not shadow, so flat can declare none (§10's rim). */`,
    decl("surface-chrome", surfaceChrome[mode]),
    decl("control-chrome", controlChrome[mode]),
    decl("control-light", controlLight[mode]),
    `  /* transmission (§10, 2026-08-07) — what a PANE casts is the app's shadow passed`,
    `     through glass: the surface row faded per thickness, DERIVED from the palette so`,
    `     there is exactly one source of shadow truth. Consumed only where the elevated`,
    `     scope hands it to a material surface; flat declares none. */`,
    ...(["thin", "regular", "thick"] as const).map((t) =>
      decl(`surface-chrome-${t}`, fadeShadow(shadow[mode][2]!, material.transmission[t])),
    ),
    `  /* and the CONTROL row transmitted, for glass controls — a glass field or button casts`,
    `     fainter for the same reason a pane does (§10, 2026-08-07). */`,
    ...(["thin", "regular", "thick"] as const).map((t) =>
      decl(`control-chrome-${t}`, fadeShadow(shadow[mode][1]!, material.transmission[t])),
    ),
    `  /* the FLOATING chrome (§22) — what a popup casts. Both variants emitted per appearance`,
    `     because BOTH worlds declare one (overlap is information, not expression): flat is`,
    `     the elevated row faded — derived, one source of shadow truth. */`,
    decl("floating-chrome-elevated", floatingChrome[mode]),
    decl("floating-chrome-flat", fadeShadow(shadow[mode][floatingRow()]!, floatingFlatFactor)),
  ];
}

/** The look axis (§19): one family's resting dress, as roles the member sheets consume.
 *  Role names derive from the config keys — `--look-<family>-<slot>` — so a family or slot
 *  added in config exists in the emitted CSS by construction. */
function lookWorld(name: keyof typeof look): string[] {
  const out: string[] = [];
  for (const [family, slots] of Object.entries(look[name])) {
    for (const [slot, value] of Object.entries(slots) as [string, string][]) {
      out.push(decl(`look-${family}-${slot}`, value));
    }
  }
  return out;
}

/** §19 — what `filled` paints in ONE mode, as the pigment behind the look roles.
 *
 *  This is the half of the axis that cannot live in the `[data-look]` blocks. Those are one
 *  block each by design (co-location — see the emission site), so they can only ever hold
 *  mode-blind mappings; a neutral STEP is not mode-blind, because the ramp runs the opposite
 *  way in the two appearances. So the steps land here, in the appearance scopes, and the look
 *  block reads them by name. Same shape as the seal: `--color-surface` is a role for exactly
 *  this reason, and `filled` needed one too and shipped without it.
 *
 *  Emitted in every appearance scope for the reason every colour role is — a var() bakes
 *  where it is DECLARED, so a single :root copy would carry light's pigment into every dark
 *  region that is not itself a look scope. That is the half-day bug of 2026-08-06, and these
 *  roles are held to the rule the look roles were then held to. */
function dressWorld(mode: "light" | "dark"): string[] {
  const out: string[] = [
    "",
    `  /* the look axis's filled pigment (§19), per appearance: an index means the opposite`,
    `     thing in the two modes, so the ladders are not each other's copy. The edges sit`,
    `     inside contrastHighBands.border, which is what keeps contrast="high" able to reach`,
    `     a filled component's boundary at all. */`,
  ];
  for (const [family, slots] of Object.entries(dress[mode])) {
    for (const [slot, step] of Object.entries(slots) as [string, number][]) {
      out.push(decl(`dress-${family}-${slot}`, `var(--neutral-${step})`));
    }
  }
  return out;
}

/** The radius palette for one level (§6). Steps 1-5 control, 6-9 surfaces, 10 the overlay. */
function radiusPalette(level: RadiusLevel): string[] {
  const { steps, full } = radiusLevels[level];
  const out = steps.map((px, i) => decl(`radius-${i}`, px === 0 ? "0px" : zoom(px)));
  out.push(decl("radius-full", full === 0 ? "0px" : `${full}px`));
  return out;
}

/** Surface radii (§6, §10): size-indexed picks into the surface band, plus the flat overlay. */
function surfaceRadiusFamily(): string[] {
  return [
    ...radiusSurface.map((step, i) => decl(`radius-surface-${i + 1}`, `var(--radius-${step})`)),
    decl("radius-overlay", `var(--radius-${radiusOverlay})`),
  ];
}

/** The mark corner (§6) for one radius level: the family's own picks, density-invariant.
 *
 * At `full` it holds at `large`'s values, which is the surface band's own sentence one band
 * over — full means a corner stops getting rounder, never that it retreats — and here it is
 * also what keeps a checkbox from becoming a radio. The control band cannot serve this: it
 * states the capsule at `full` and, more quietly, it is DENSITY-indexed, so an axis that never
 * touches the mark's box was moving the mark's corner (0.462 of the box at comfortable size 4,
 * measured; the `full` ceiling could not see it because no theme was involved). */
/** The atom corner (§6, §15): one designed EM per level — see config's radiusAtom. The em
 *  is emitted as raw text, so it substitutes at USE and resolves against the consuming
 *  atom's own font-size; nothing here may wrap it in a var() that would bake it early. */
function atomRadiusFamily(level: RadiusLevel): string[] {
  const em = radiusAtom[level];
  return [decl("radius-atom", em === 0 ? "0px" : `${em}em`)];
}

function markRadiusFamily(level: RadiusLevel): string[] {
  const steps = radiusLevels[level === "full" ? "large" : level].steps;
  return markRadius.map((pick, i) => {
    const px = steps[pick]!;
    return decl(`radius-mark-${i + 1}`, px === 0 ? "0px" : zoom(px));
  });
}

/** Layout space for one density level (§3, §12): designed picks into the untouched palette. */
function layoutSpaceFamily(level: DensityLevel): string[] {
  return layoutSpace[level].map((step, i) => decl(`layout-space-${i + 1}`, `var(--space-${step})`));
}

/** Surface padding (§10): fixed picks into layout space — density speaks through the layer. */
function surfacePaddingFamily(): string[] {
  return surfacePadding.map(
    (step, i) => decl(`surface-p-${i + 1}`, `var(--layout-space-${step})`),
  );
}

/** The floating panel's padding (§22, §23): one pick into layout space — a var() bakes where
    it is declared, so this re-emits in every density scope exactly like surface padding does. */
function floatingPanelFamily(): string[] {
  return [decl("floating-p", `var(--layout-space-${floatingPadding})`)];
}

/** The control radii for one designed set at one level (§6). At `full` the band is the rule
 * itself — half the size's control height — rather than the palette's 9999px. A capsule was
 * only ever "half the height", and 9999 reached it by CSS clamping against the RENDERED box,
 * which is the wrong box the moment a control's height is not the token's: a textarea three
 * rows tall became a stadium, its first line deep inside the corner curve. The surface band
 * made this exact move already — full re-prices it to designed large corners, never a capsule
 * (§6) — this is the control band's version. Stated per cell, where the heights are declared
 * on the same element, so substitution-at-declaration picks up each world's own ladder. */
function controlRadiusFamily(set: DensitySet, level: RadiusLevel): string[] {
  if (level === "full")
    return set.radius.map(
      (_, i) => decl(`radius-control-${i + 1}`, `calc(var(--control-height-${i + 1}) / 2)`),
    );
  return set.radius.map((step, i) => decl(`radius-control-${i + 1}`, `var(--radius-${step})`));
}

/** The four size-indexed control tokens for one designed set (§12, §16). No gap here: the
 * icon-label gap is the label cluster's (§4), size- and pointer-indexed but never density's. */
function controlFamily(set: DensitySet): string[] {
  const out: string[] = [];
  const put = (name: string, value: string) => out.push(decl(name, value));

  set.height.forEach((px, i) => put(`control-height-${i + 1}`, zoom(px)));
  // Raw px, alongside the height it has to hold a fraction of — NOT a pick into the space
  // palette (changed 2026-08-05). The palette's control band grows faster per step than the
  // height ladder does, so an index could not hold that fraction and the padding drifted to
  // half the box at size 4. See the note on `density` in config.ts.
  set.px.forEach((px, i) => put(`control-px-${i + 1}`, zoom(px)));
  // The pill padding resolves to the plain padding at every radius level except `full` — this
  // identity is re-declared wherever px is, so it substitutes against the scope's own value
  // (substitution-at-declaration, §6). The `full` cells override it with raw designed numbers.
  set.px.forEach((_, i) => put(`control-px-pill-${i + 1}`, `var(--control-px-${i + 1})`));
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

  // The block air a ROW keeps around its one line of text (§21, 2026-08-09). Per size, but
  // gently — flat at the bottom, a step at the top (a constant inset read cramped at size 4,
  // Kushagra, same day): a row's box is its text line plus this — the height ladder is for
  // controls that stand alone, and the pointer answer arrives through the type bands (coarse
  // raises the line, the same derivation prices both worlds).
  set.rowInset.forEach((px, i) => put(`row-inset-${i + 1}`, zoom(px)));

  return out;
}

/** The icon-label gap for one pointer world (§4, §12): size-indexed, density-invariant. */
function controlGapFamily(world: keyof typeof controlGap): string[] {
  return controlGap[world].map((step, i) => decl(`control-gap-${i + 1}`, `var(--space-${step})`));
}

/** The pill padding for one designed set (§4, §6): what a bare edge pads under `radius="full"`.
 * Raw zoomed lengths, like px — the full level has no palette step to point these at. */
function pillFamily(set: DensitySet): string[] {
  return set.pxPill.map((px, i) => decl(`control-px-pill-${i + 1}`, zoom(px)));
}

/** The steps a band actually MOVES — every index whose pick is not the identity. Derived
 * rather than listed, so tuning a pick moves the emitted set with it and a band can never
 * declare a step it does not change (which is what would let two bands fight). */
function moved(picks: readonly number[]): number[] {
  return picks.flatMap((step, i) => (step === i + 1 ? [] : [i]));
}

/** The mark ladder (§4) for one set of type picks: `--mark-N` is the line box of the step the
 * band actually renders, so the marks rise on a phone for the same reason the label does.
 * `picks` is the band's mapping — the identity in the fine world, `typeBands.handheld` in the
 * coarse one. Resolved to a length here rather than pointing at `--line-height-N`, because a
 * var() bakes where it is declared (§6): a :root-level indirection would carry the desktop
 * line box into the coarse scope, which is the one place this family has to move. */
function markFamily(picks: readonly number[]): string[] {
  return markSteps.map((_, i) => decl(`mark-${i + 1}`, zoom(lineHeight[picks[i]! - 1]!)));
}

/** The switch's width ladder (§4) for one set of type picks. `switchW` is designed against
 * the mark the track IS — entries for mark steps 2 through 5 — and size n's cell reads the
 * entry for the step the band renders at n + 1. The fine world's picks are the identity, so
 * it reads the ladder straight; the coarse world's picks are the handheld band's, so a
 * switch widens exactly one entry where its track rose exactly one step, and the size-4
 * collapse (steps 4 and 5 priced alike) reaches the width for the same reason it reaches
 * the height. */
function switchFamily(picks: readonly number[]): string[] {
  return switchW.map((_, i) => decl(`switch-w-${i + 1}`, zoom(switchW[picks[i + 1]! - 2]!)));
}

/** One band of the type palette (§15, §17), over the steps it moves: each pick re-prices the
 * step's designed TRIPLE — font-size, line height, letter spacing move together or not at
 * all. `indices` is passed rather than derived so the fine-pointer ESCAPE can emit the
 * identity over exactly the set its band owns. */
function bandTypePalette(picks: readonly number[], indices: readonly number[]): string[] {
  const at = (i: number) => picks[i]! - 1;
  return [
    ...indices.map((i) => decl(`font-size-${i + 1}`, zoom(fontSize[at(i)]!))),
    ...indices.map((i) => decl(`line-height-${i + 1}`, zoom(lineHeight[at(i)]!))),
    ...indices.map((i) => decl(`letter-spacing-${i + 1}`, `${letterSpacing[at(i)]!}em`)),
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
