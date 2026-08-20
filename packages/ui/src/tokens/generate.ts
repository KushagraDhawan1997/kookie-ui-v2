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
  markRadius,
  radiusAtom,
  markSteps,
  material,
  motion,
  radiusLevels,
  radiusOverlay,
  radiusSurface,
  controlChrome,
  controlChromeActive,
  controlLight,
  disabledDim,
  disabledSteps,
  scrollbar,
  gripCast,
  kbdRelief,
  glassTransmitRows,
  glassInk,
  floatingDark,
  floatingChrome,
  floatingMinWidth,
  controlMotion,
  floatingMotion,
  overlayMotion,
  overlaySeed,
  overlayLift,
  overlayEcho,
  floatingSeed,
  floatingEcho,
  floatingPadding,
  overlayWidth,
  alertWidth,
  dialogInset,
  scrim,
  springs,
  dialogMotion,
  dialogEntry,
  shadow,
  sliderTrack,
  progressTrack,
  space,
  segmentInset,
  switchInset,
  switchW,
  tabRule,
  surfaceChrome,
  surfaceColor,
  groundColor,
  pageColor,
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

/**
 * A damped spring, sampled into a `linear()` easing (§8, 2026-08-09).
 *
 * The step response of a second-order system released from rest at 0 toward 1:
 *
 *     x(t) = 1 − e^(−ζωt) · ( cos(ω_d·t) + (ζω / ω_d)·sin(ω_d·t) ),   ω_d = ω·√(1 − ζ²)
 *
 * `t` is NORMALISED progress, not seconds — which is the whole reason one curve can serve a
 * 480ms panel and a 140ms press. The endpoints are stated rather than sampled: `linear()`
 * must start at 0 and end at 1, and a spring's own value at t=1 is merely close to 1, so
 * sampling the last point would leave a sub-pixel step at the end of every transition.
 */
const springCurve = ({ zeta, omega, steps }: { zeta: number; omega: number; steps: number }) => {
  const damped = omega * Math.sqrt(1 - zeta * zeta);
  const trim = (n: number, places: number) => String(Number(n.toFixed(places)));
  const points = [`0`];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x =
      1 -
      Math.exp(-zeta * omega * t) *
        (Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t));
    points.push(`${trim(x, 3)} ${trim((t * 100), 2)}%`);
  }
  points.push("1 100%");
  return `linear(${points.join(", ")})`;
};

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

  lines.push(
    "",
    "  /* the icon box (§4) — size-indexed and POINTER-indexed (2026-08-10), never density-indexed:",
    "     a glyph is read at the distance the screen is held, and a compact control is the same",
    "     control with less air around it. The pointer worlds re-declare it below; :root carries",
    "     the fine ladder, which is also the un-themed default. */",
  );
  lines.push(...iconFamily("fine"));

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
    "  /* the segmented control's channel inset (§26) — the switch's sentence one control over:",
    "     the SEGMENT is the track minus this, so the box derives and the gap never does. Its own",
    "     entry rather than a share of --switch-inset: the second member of a family self-keys and",
    "     the third promotes, and a shared inset would owe a family name. */",
  );
  put("segment-inset", zoom(segmentInset));

  lines.push(
    "",
    "  /* and the tab rule's thickness (§26) — ONE value, no index, for Progress's reason: the",
    "     thickness that reads as a rule is a perception floor, not a fraction of the tab above",
    "     it. Emitted at :root alone; no axis re-prices it. */",
  );
  put("tab-rule", zoom(tabRule));

  lines.push(
    "",
    "  /* chrome widths (§8, §13). These were raw px literals in the hand-authored layers until",
    "     2026-08-03 — the only geometry in a control that did not answer --scale, so a bordered",
    "     button at scale 2 kept a 1px hairline while every other length doubled. */",
  );
  put("border-width", zoom(borderWidth));
  put("focus-ring-width", zoom(focusRing.width));
  put("focus-ring-offset", zoom(focusRing.offset));

  lines.push("", "  /* motion (§8) — two clocks. Signal (colour, opacity) eases and is short; travel");
  lines.push("     (geometry) rides a baked damped spring, so a state change costs a cubic-bezier and");
  lines.push("     reads like mass. The curves are SAMPLED from the model in config, never pasted. */");
  put("motion-duration", motion.duration);
  put("motion-easing", motion.easing);
  put("motion-spring", springCurve(springs.calm));
  put("motion-hover-in", `${controlMotion.hoverIn}ms`);
  put("motion-hover-out", `${controlMotion.hoverOut}ms`);
  put("motion-press", `${controlMotion.press}ms`);
  put("motion-rise", `${controlMotion.rise}ms`);
  put("hover-travel", zoom(controlMotion.hoverTravel));
  put("motion-mark", `${controlMotion.mark}ms`);
  put("motion-travel", `${controlMotion.travel}ms`);
  put("motion-ring", `${controlMotion.ring}ms`);
  put("focus-ring-land", zoom(controlMotion.ringLand));
  put("press-travel", zoom(controlMotion.pressTravel));
  put("press-scale", String(controlMotion.pressScale));
  put("press-squash", String(controlMotion.pressSquash));
  // The interactive surface's own two distances — same clocks, same springs, bigger box (§8).
  put("press-travel-surface", zoom(controlMotion.surfacePressTravel));
  put("press-scale-surface", String(controlMotion.surfacePressScale));
  put("thumb-lean", zoom(controlMotion.thumbLean));
  put("motion-spring-lively", springCurve(springs.lively));
  put("motion-spring-stiff", springCurve(springs.stiff));
  put("motion-spring-elastic", springCurve(springs.elastic));
  put("motion-spring-poised", springCurve(springs.poised));

  lines.push("", "  /* the floating family's own motion (§22) — the emergence recipe's channels. Time, so");
  lines.push("     no --scale: a panel does not unfurl slower because the interface is zoomed. */");
  put("floating-seed", zoom(floatingSeed));
  put("floating-echo", zoom(floatingEcho));
  put("floating-fall", `${floatingMotion.fall}ms`);
  put("floating-spread", `${floatingMotion.spread}ms`);
  put("floating-corner", `${floatingMotion.corner}ms`);
  put("floating-reveal", `${floatingMotion.reveal}ms`);
  put("floating-reveal-delay", `${floatingMotion.revealDelay}ms`);
  put("floating-dissolve", `${floatingMotion.dissolve}ms`);
  put("floating-settle", `${floatingMotion.settle}ms`);
  put("overlay-seed", zoom(overlaySeed));
  put("overlay-lift", zoom(overlayLift));
  put("overlay-hold", `${overlayMotion.hold}ms`);
  put("overlay-grow", `${overlayMotion.grow}ms`);
  put("overlay-echo", zoom(overlayEcho));
  put("overlay-materialize", `${overlayMotion.materialize}ms`);
  put("overlay-fall", `${overlayMotion.fall}ms`);
  put("overlay-spread", `${overlayMotion.spread}ms`);
  put("overlay-reveal", `${overlayMotion.reveal}ms`);
  put("overlay-reveal-delay", `${overlayMotion.revealDelay}ms`);
  put("overlay-print", `${overlayMotion.print}ms`);
  /* §24 — the dialog's own entry: depth, not distance. */
  put("dialog-settle", `${dialogMotion.settle}ms`);
  put("dialog-reveal", `${dialogMotion.reveal}ms`);
  put("dialog-depth", `${dialogEntry.depth}`);
  put("dialog-blur", `${dialogEntry.blur}px`);
  put("overlay-dissolve", `${overlayMotion.dissolve}ms`);
  put("overlay-settle", `${overlayMotion.settle}ms`);

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
  lines.push(...defaultLevelAnswer(density.default));
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

  lines.push("", "  /* the overlay pane (§24) — a MAXIMUM width per size index, published to the pane by");
  lines.push("     the surface layer's overlay join, and the gutter a dialog keeps from the window");
  lines.push("     edge. The widths ride --scale and answer neither density nor pointer: how wide a");
  lines.push("     modal should be is a question about reading measure, not about air. */");
  lines.push(...overlayWidth.map((px, i) => decl(`overlay-w-${i + 1}`, zoom(px))));
  lines.push("  /* and the ALERT's width (§25) — FIXED, not a maximum: closed content, closed box */");
  lines.push(...alertWidth.map((px, i) => decl(`alert-w-${i + 1}`, zoom(px))));
  lines.push(...dialogFamily());

  lines.push("", "  /* colour, generated (§7) — light mode */");
  lines.push(...colorDeclarations("light"));

  lines.push(...surfaceWorld("light"));
  lines.push(...dressWorld("light"));
  lines.push(...surfaceEdge());

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
    ...surfaceEdge(),
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
    ...dressWorld("dark"),
    ...surfaceEdge(),
    "}",
    "",
  );

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
      /** Stand-downs that must land on the element a LOOK block writes to, not on the element
          data-contrast sits on — see the note at the push site below. */
      const scopedHigh: { attr: string; decls: string[] }[] = [];
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
            // The CONTROL's translucent hairline still stands down (recipes.css reads this
            // name for a glass button, with a var(--tone-border) fallback at the element).
            decl(`material-${t}-edge`, "initial"),
            // THE RIM STAYS (2026-08-20, Kushagra: high contrast made glass look "cheap and
            // incorrect… it's not taste"). It used to be emptied here, and the reason was
            // written beside it: "or high contrast would resurrect the glint it just
            // removed" — the glint being the LIFTED rim variant, which was deleted
            // 2026-08-17 when the ring took the edge. So the stand-down outlived its
            // mechanism and went on deleting a thing nobody was defending against.
            //
            // On its own terms it was also backwards. The rim is a gradient painted INSIDE
            // the pane (grain, bloom, sheen — `--kui-sf-light`, a background-image); it
            // cannot lower the contrast of anything, and removing it only deletes the cue
            // that the pane is a physical thing catching light. An accessibility setting
            // that removes information is wrong in its own terms, not merely to taste.
            //
            // What high contrast still trades on a pane is the EDGE, and that trade is
            // real: the ring is white, so over a bright backdrop it disappears exactly as
            // the veil does (measured 1.00 against a pale sky at any opacity), and a ring
            // plus a pigment border is two lines one pixel apart — the "why am I seeing
            // this thicker top border" defect of 2026-08-07. One line, made of pigment.
          );
        }
        // The resting edges yield for the same reason the material's does, and by the same
        // mechanism (§19's survivor). A dress edge is deliberately soft, and the surface's
        // resting edge is deliberately ABSENT (light is the edge, lab port 2026-08-17) — a
        // user who asks for high contrast is asking for the tone system's boundary, not the
        // app's taste. `initial` stands each role down and the consumption site's fallback
        // (var(--tone-border), var(--mark-edge)) resolves AT THE ELEMENT, where the tone
        // lives and where contrastHighDeclarations has already strengthened both; a
        // scope-level colour here could never do that. Proximity is safe without scoped
        // arms since the look axis died (surfaceLook 2026-08-20, controlLook 2026-08-19):
        // these roles live only in the appearance scopes, and any Theme that re-declares
        // them also co-locates data-contrast, so this compound wins on specificity at that
        // same element. (The look blocks used to land on the Theme element ITSELF and beat
        // this block by inheritance — the 2026-08-17 proximity trap; no look blocks, no trap.)
        decls.push(
          decl("surface-edge", "initial"),
          decl("dress-field-edge", "initial"),
          decl("dress-mark-edge", "initial"),
        );
        // A glass pane's only edge is the conic RING — light, not pigment, so it cannot be
        // strengthened; a user asking for high contrast is asking for a pigment boundary
        // (audit 2026-08-18: HC reached a glass pane's edge with exactly zero effect —
        // border a literal transparent, ring painting unchanged, 1.000:1 on every side).
        // The ring stands down and the pane's border chain picks up --tone-border through
        // the element-scoped arm below.
        decls.push(decl("material-ring-opacity", "0"));
        scopedHigh.push({ attr: "data-material", decls: [decl("kui-glass-hc-edge", "var(--tone-border)")] });
        // Dark floating panes take the same defence as in-flow glass under HC (see the
        // --material-*-alpha-floating emission).
        if (mode === "dark") {
          for (const t of ["thin", "regular", "thick"] as const) {
            decls.push(decl(`material-${t}-alpha-floating`, `${material[mode][t].alphaHigh[0]}%`));
          }
        }
        // The scrim leans the way the glass does (§24): more pigment, and the defocus goes.
        // A blurred backdrop is a legibility AID for the app behind it and a legibility COST
        // for the boundary between the two — a user who asked for high contrast is asking for
        // that boundary, so the dim carries the whole job. `initial` on the filter is the
        // material edge's own spelling: guaranteed-invalid, so the consuming var()'s fallback
        // resolves at the element and the backdrop simply stops filtering.
        decls.push(decl("scrim-fill", scrim[mode].fillHigh), decl("scrim-filter", "initial"));
      }
      // AND a nested appearance scope, which is the case this block was blind to until
      // 2026-08-20 (found by eye: a dark card looked identical at both contrasts, while the
      // glass beside it changed — glass answers through an element-scoped arm below).
      //
      // Every name here is one `colorDeclarations` also writes, and those live in the
      // APPEARANCE scopes. So any `<Theme appearance>` between the element carrying
      // data-contrast and the component re-declares the whole standard palette NEARER to it,
      // and a custom property resolves by proximity — the high-contrast values never arrive.
      // Measured: --control-edge, --field-edge, --neutral-6 and --color-track all equal their
      // standard values inside `<html data-contrast="high"><Theme appearance="dark">`, which
      // is the shape the pre-paint script and every dark section produce.
      //
      // The ancestor half is deliberately NOT mode-keyed: a light Theme can nest inside a dark
      // document, so what matters is only that SOME ancestor asked for high contrast. The
      // descendant carries its own opt-out guard, so a nested `contrast="normal"` still escapes.
      //
      // The platform-signal arm below needs none of this: its base is already
      // `[data-appearance="mode"]:not(...)`, which matches a nested scope on its own. So
      // `prefers-contrast: more` has always worked here and the explicit prop never did,
      // which is why this survived every audit.
      const high = [
        ...bases.map((b) => `${b}[data-contrast="high"]`),
        `[data-contrast="high"] [data-appearance="${mode}"]:not([data-contrast="normal"])`,
      ].join(", ");
      // The platform signal reaches anything that has not explicitly opted out. Theme stamps
      // data-contrast ONLY when the axis was actually chosen, so an unconfigured Theme node
      // carries no attribute and this guard still matches it (§7).
      const auto = bases.map((b) => `${b}:not([data-contrast="normal"])`).join(", ");
      // The scoped arms repeat the same two guards one level down: `[contrast] [data-material]`
      // for the explicit prop, and the platform signal's own `:not([data-contrast="normal"])`
      // base. BOTH forms are needed and neither replaces the other — the block above still
      // covers the co-located case, where these descendant selectors do not match the element
      // itself.
      const scoped = scopedHigh.flatMap(({ attr, decls: d }) => [
        `${bases.map((b) => `${b}[data-contrast="high"] [${attr}]`).join(", ")} {`,
        ...d,
        "}",
      ]);
      const scopedAuto = scopedHigh.flatMap(({ attr, decls: d }) => [
        `  ${bases.map((b) => `${b}:not([data-contrast="normal"]) [${attr}]`).join(", ")} {`,
        ...indent(d),
        "  }",
      ]);
      lines.push(
        ...wrap([
          `${high} {`,
          ...decls,
          "}",
          ...scoped,
          `@media (prefers-contrast: more) {`,
          `  ${auto} {`,
          ...indent(decls),
          "  }",
          ...scopedAuto,
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
      ...dialogFamily(),
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
      lines.push(
        `[data-radius="${level}"][data-density="${d}"] {`,
        ...controlRadiusFamily(density[d], level),
        ...pillAnswer(density[d], level),
        "}",
        "",
      );
    }
    lines.push(
      `[data-radius="${level}"] {`,
      ...controlRadiusFamily(density.default, level),
      ...pillAnswer(density.default, level),
      "}",
      "",
    );
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
  // The icon box joins the world (2026-08-10). It does NOT ride the type picks like the marks
  // do — an icon is drawn on the ecosystem's 16/20/24 grid, and a glyph rastered off-grid
  // blurs — so it is its own designed ladder per world. Declared in full for the same reason
  // the marks are: these are resolved lengths, and a scope that declares nothing inherits.
  const icons = iconFamily(pointer === "fine" ? "fine" : "coarse");
  out.push(`${P} {`, ...controlFamily(sets.default), ...controlGapFamily(pointer === "fine" ? "fine" : "coarse"), zoomFloor, ...band, ...marks, ...switchWidths, ...icons, "}", "");
  for (const d of Object.keys(sets) as DensityLevel[]) {
    if (d === "default") continue;
    out.push(`${P}[data-density="${d}"] {`, ...controlFamily(sets[d]), "}", "");
  }

  for (const level of Object.keys(radiusLevels) as RadiusLevel[]) {
    for (const d of Object.keys(sets) as DensityLevel[]) {
      out.push(`${P}[data-radius="${level}"][data-density="${d}"] {`, ...controlRadiusFamily(sets[d], level), ...pillAnswer(sets[d], level), "}", "");
    }
    out.push(`${P}[data-radius="${level}"] {`, ...controlRadiusFamily(sets.default, level), ...pillAnswer(sets.default, level), "}", "");
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

// chromeRow()/floatingRow() died with the flat fade (2026-08-19, flat casts nothing): they
// read which palette row a chrome role names so a derivation could fade THAT row — the
// two-homes guard that caught the 2026-08-16 stale-literal drift. The floating chrome's
// only derivation now is elevated's direct config value, and a mechanism with no consumer
// is entropy (the curtain's lesson), so the guard went with the fade it guarded. If a
// derived-from-a-role fade ever returns, re-read the row from the role's own value — never
// keep a second hand-kept index.
// The glass TRANSMIT rows come from their own config statement since 2026-08-17 — they used
// to be parsed out of the chrome roles, and the day the solid chrome took the lab's literal
// values (no var(--shadow-N) to parse) that weld either threw here or, worse, silently moved
// the surface transmit down a row with surfaceChrome. Two facts, two homes.
const surfaceRow = () => glassTransmitRows.surface - 1;
const controlRow = () => glassTransmitRows.control - 1;

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
  // The soft trio's opaque twins (2026-08-19): what the glass scopes re-point the trio to,
  // because the material veil multiplies an alpha source (see color.ts).
  "soft-solid",
  "soft-hover-solid",
  "soft-active-solid",
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
/**
 * The GRAIN (§10, ported from the material lab 2026-08-16): barely-there white noise, baked
 * into an SVG turbulence filter at ~4.5% alpha. It is what stops a large pane of glass
 * reading as flat vector fill — real glass has tooth. Inlined as a data URI because it is a
 * texture, not an asset: nothing to fetch, nothing to cache, no request at paint.
 */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.045 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

/**
 * A pane's own lighting, as ONE background-image list (§10). Four layers, painted top down,
 * ported whole from the lab 2026-08-16 — the package had only the last of them, which is why
 * ported glass read as a tinted rectangle beside the lab it came from:
 *
 *   grain   texture, so a big pane is not flat vector fill
 *   bloom   light ENTERING at the top-left corner — the pane is lit from a place, not evenly
 *   sheen   the broad wash down from the top edge
 *   rim     the 1px catch on the very edge (what the package already had)
 *
 * It stays a background-image and never becomes a shadow, for the reason §10 has always
 * given: `none` is illegal inside a shadow list and flat worlds declare `none`, so a shadow
 * rim would mean rewriting every one-box-shadow law. Depth stays the app's.
 */
const rim = (sheen: number): string =>
  [
    GRAIN,
    // At sheen 0 the two wash layers are omitted entirely rather than emitted transparent:
    // a control takes this form, and a fully transparent gradient still costs a paint layer.
    ...(sheen > 0
      ? [
          `radial-gradient(130% 80% at 16% -12%, rgb(255 255 255 / ${Number((sheen * 1.4).toFixed(2))}%), transparent 55%)`,
          `linear-gradient(180deg, rgb(255 255 255 / ${sheen}%), transparent 45%)`,
        ]
      : []),
    // The 1px top edge line is GONE (2026-08-17, Kushagra: the dialog drew "double lines",
    // the loud button a stripe). It predates the ring: since the pane's edge became the
    // conic ::after ring, this background layer was a SECOND edge stacked on the first —
    // the lab's panes have washes and the ring, never a background edge line. the ring
    // owns the edge outright now, and the lifted variant died with the layer (2026-08-17).
  ].join(", ");

/** A rung's WASH on a glass control (lab grid, 2026-08-17): bloom + sheen only — grain
    arrives from the control rim layer, the edge from the ring. */
const wash = (sheen: number): string =>
  [
    `radial-gradient(130% 80% at 16% -12%, rgb(255 255 255 / ${Number((sheen * 1.4).toFixed(2))}%), transparent 55%)`,
    `linear-gradient(180deg, rgb(255 255 255 / ${sheen}%), transparent 45%)`,
  ].join(", ");

/**
 * The RING (§10, ported from the lab 2026-08-17): the pane's 1px conic edge light, built
 * from the mode's four-colour palette — or, for thick, the spectral stops that deep glass
 * splits light into. The from-angle is the light model's fixed 165° + 180 (the ring is lit
 * OPPOSITE the shadow's fall, same source). Emitted as a full background value the ::after
 * ring rule consumes — the geometry (mask, padding) lives once in the stylesheet, only the
 * LIGHT is per mode.
 */
const ringBg = (mode: "light" | "dark", spectral: boolean): string => {
  if (spectral) {
    const [w, r, b, f, warm] = material.ringSpectral[mode];
    return `conic-gradient(from 345deg, ${w}, ${r} 12%, ${b} 24%, ${f} 36%, ${warm} 44%, ${warm} 56%, ${f} 64%, ${b} 76%, ${r} 88%, ${w})`;
  }
  const { a, b, c, d } = material.ring[mode];
  return `conic-gradient(from 345deg, ${a}, ${b} 22%, ${c} 34%, ${d} 44%, ${d} 56%, ${c} 66%, ${b} 78%, ${a})`;
};

function surfaceWorld(mode: "light" | "dark"): string[] {
  const m = material[mode];
  const glass = (name: "thin" | "regular" | "thick") => {
    return [
      ...materialAlpha(name, m[name].alpha),
      decl(`material-${name}-filter`, m[name].filter),
      // The pane's own edge and lighting (§10, 2026-08-05): a hairline of light, not pigment,
      // and a top rim catch painted as a background layer — NOT a shadow, so depth stays the
      // app's identity (depth="elevated") and the one-box-shadow law never learns glass
      // exists. A flat world's glass has edge and glint, no lift.
      decl(`material-${name}-edge`, `rgb(255 255 255 / ${m[name].edge})`),
      decl(`material-${name}-rim`, rim(m[name].sheen)),
      // The CONTROL's lighting is the pane's minus the wash (§10, 2026-08-16). A pane's fill
      // is a near-white veil, so a broad white bloom and sheen read as light lying ON it; a
      // control's fill is its IDENTITY — a loud accent, a destructive red — and the same two
      // layers read as that identity fading. Measured: a loud accent button under the pane
      // recipe went pale blue with a halo, which is what "why is this save button so light"
      // was looking at. Grain and the edge catch survive, because texture and a lit edge are
      // properties of the material; the wash is a property of a pane.
      decl(`material-${name}-rim-control`, rim(0)),
      // CONTROL-scale material (lab 2026-08-14, ported 2026-08-17): the family re-prices the
      // ladder for its box — half the blur, a leaner veil, its own sheen. One alpha, no
      // hover/active steps: on glass, hover is LIGHT (filterHover bumps brightness, the veil
      // holds) — the lab's answer to "hover mode looks weird".
      decl(`material-${name}-control-alpha`, `${m[name].control.alpha}%`),
      decl(`material-${name}-control-filter`, m[name].control.filter),
      decl(`material-${name}-control-filter-hover`, m[name].control.filterHover),
      // LOUD runs its own filter (lab, rendered 2026-08-17: saturate 220% brightness 1.1
      // against the cell's 140-180%): a committed pigment wants the backdrop glowing
      // through it, not politely tinted. Dark's lock: saturate 180%, no brightness lift.
      decl(`material-${name}-control-filter-loud`, m[name].control.filterLoud),
      // Dark FLOATING panes lighten (lab 2026-08-15): the veil lifts toward white. Light's
      // floating veil is the in-flow veil verbatim, so the token exists in both modes and
      // the floating rules stay mode-blind.
      decl(
        `material-${name}-fill-floating`,
        mode === "dark"
          ? `color-mix(in srgb, color-mix(in srgb, var(--color-surface) ${floatingDark.base}%, white) var(--material-${name}-alpha-floating), transparent)`
          : `color-mix(in srgb, var(--color-surface) var(--material-${name}-alpha), transparent)`,
      ),
      // Dark's floating alpha is its own token so contrast="high" can REACH it (audit
      // 2026-08-18: the dark floating veil was baked from literals, so HC strengthened
      // every in-flow pane and left the one actually covering live content at its standard
      // alpha). Light needs no twin — its floating veil already reads --material-*-alpha,
      // which the HC pass re-declares.
      ...(mode === "dark" ? [decl(`material-${name}-alpha-floating`, `${floatingDark.alpha[name]}%`)] : []),
      // The RING: thick's is spectral (deep glass splits light), thin/regular the palette's.
      decl(`material-${name}-ring`, ringBg(mode, name === "thick")),
    ];
  };
  // The SOLID pane's lighting — the lab's matte recipe, NOT the rim() builder's glass one
  // (2026-08-17): grain + one sheen to a 55% stop, no bloom, no top catch. One value for
  // both depth worlds; a matte slab has no lifted glint to catch.
  const solidRim = [GRAIN, `linear-gradient(180deg, rgb(255 255 255 / ${material.sealSheen[mode]}%), transparent 55%)`].join(", ");
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
    // The POOL (§10, ported 2026-08-17): the shade settling at a pane's bottom INSIDE it —
    // matter, not elevation, so it joins the cast in both depth worlds. Solid's is its seat
    // line (dark solid: a no-op layer, list-legal where `none` is not).
    decl("material-pool-surface", material.pool[mode].surface),
    decl("material-pool-control", material.pool[mode].control),
    decl("material-pool-solid", material.pool[mode].solid),
    decl("material-solid-rim", solidRim),
    // The louder rungs' washes on glass controls (lab grid): thickness-invariant, per mode.
    decl("material-control-wash-loud", wash(material.controlWash.loud[mode])),
    decl("material-control-wash-medium", wash(material.controlWash.medium[mode])),
    // Quiet paint on glass is ALPHA (lab 2026-08-15): the pane re-points the quiet ink
    // roles, the border, the row wash and the keycap treatment to these.
    decl("material-ink-muted", glassInk[mode].muted),
    decl("material-ink-faint", glassInk[mode].faint),
    decl("material-glass-border", glassInk[mode].border),
    decl("material-ink-disabled", glassInk[mode].disabled),
    decl("material-row-wash", glassInk[mode].wash),
    decl("material-kbd-fill", glassInk[mode].kbdFill),
    decl("material-kbd-edge", glassInk[mode].kbdEdge),
    decl("material-kbd-ink", glassInk[mode].kbdInk),
    decl("material-ring-opacity", `${material.ring[mode].opacity}`),
    decl("material-on-glass-alpha", `${material.onGlassAlpha}%`),
    "",
    `  /* the scrim (§10, §24) — the dialog backdrop's dim and blur, and NOT a member of the`,
    `     material ladder above: a material defends a foreground by mixing that component's`,
    `     own fill, while this pushes the whole app back so the thing on top of it is`,
    `     unambiguously the thing you are using. Black in both modes on purpose — a scrim`,
    `     mixed from the page colour vanishes in dark, which is where dimming needs the most`,
    `     help, and it is why dark leans harder. contrast="high" and reduced transparency`,
    `     share one answer (see the high-contrast block): drop the blur, take fillHigh. */`,
    decl("scrim-fill", scrim[mode].fill),
    decl("scrim-fill-high", scrim[mode].fillHigh),
    decl("scrim-filter", scrim[mode].filter),
    "",
    `  /* foreground context (§10, §15) — what a surface re-scopes for everything inside it.`,
    `     Three rungs, the type ladder's resolutions: loud reads text, medium muted, quiet`,
    `     faint. These ARE neutral's inks, referenced rather than restated (2026-08-10): the`,
    `     tone-less default is the neutral family, so a second spelling here is a second home`,
    `     for one value — and it was one, right up until the ladder was solved and this block`,
    `     would have kept the old picked steps.`,
    ``,
    `     Muted lands on apcaFloors.body: real information said quietly (a placeholder, a`,
    `     group label, a timestamp). Faint is BELOW the reading floor on purpose — the`,
    `     exception rung, for something deliberately stood down, like an option that cannot`,
    `     be chosen. It must never carry a reading-length line, which is the call site's law.`,
    `     The CAPTION role was deleted the same day: its two consumers (a menu's and a`,
    `     select's group label) are exactly what muted is now for, and a fourth ink nothing`,
    `     reads is the emitted-lever mistake §15 already made once with font-weight-bold. */`,
    decl("color-text", "var(--neutral-ink)"),
    decl("color-text-muted", "var(--neutral-ink-muted)"),
    decl("color-text-faint", "var(--neutral-ink-faint)"),
    "",
    `  /* the seal (§10) — a surface without a material is OPAQUE; translucency is material's`,
    `     job alone. Paper above the page, so a card is visible where it lives. The hover and`,
    `     active steps serve the card-as-button pattern: the seal darkening under the pointer. */`,
    decl("color-surface", surfaceColor[mode].rest),
    decl("color-surface-hover", surfaceColor[mode].hover),
    decl("color-surface-active", surfaceColor[mode].active),
    "",
    `  /* the GROUND (§10, 2026-08-20) — what an object sits ON, the seal's opposite number. A`,
    `     bounded region of a page holding cards, or a bed inside a card holding something`,
    `     quieter. An absolute pair rather than an alpha step: dark's ramp is built from white,`,
    `     so a relative ground would land ABOVE the seal and the cards would be darker than the`,
    `     ground holding them. See config's groundColor for the measurement. */`,
    decl("color-ground", groundColor[mode]),
    "",
    `  /* the PAGE (§10, §13, 2026-08-20) — the ground this library has always presupposed (the`,
    `     seal's comment above calls a card "paper above the page") and never named, so an app`,
    `     painting its background picked a raw palette step. A NAME and nothing more: the page`,
    `     is the app's call, no component reads this, and a law forbids one from starting. A`,
    `     page made of CARDS is --color-ground above — the pair Apple splits into two page`,
    `     colours collapses here, because a ground already is the second one. */`,
    decl("color-page", pageColor[mode]),
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
    // The lit rung's press variant (2026-08-17, the lab's .l2-lit): a press tightens the
    // blast. Consumed through a --kui- pointer the depth scopes declare, so flat stands it
    // down with the world. (The -medium variant was deleted 2026-08-19 — the fourth flip
    // left it consumed by nothing.)
    decl("control-chrome-active", controlChromeActive[mode]),
    decl("control-light", controlLight[mode]),
    // The keycap's base identity (2026-08-17): relief instead of the lit chrome, an alpha
    // edge instead of a drawn hairline — the pane treatment promoted to the default; the
    // pane rule now overrides only the cast (to none).
    decl("kbd-edge", kbdRelief[mode].edge),
    decl("kbd-relief", kbdRelief[mode].relief),
    // The grips' own cast (2026-08-17): cap-scale, read by the slider and switch thumbs in
    // place of the button-priced --control-chrome. A role VALUE, not a world switch — the
    // grip casts always.
    decl("grip-cast", gripCast[mode]),
    // The scrollbar (2026-08-17): overlay thumb on the alpha ramp, designed size/inset.
    decl("scrollbar-size", `${scrollbar.size}px`),
    decl("scrollbar-inset", `${scrollbar.inset}px`),
    decl("scrollbar-thumb", `var(--neutral-a${scrollbar.thumbStep})`),
    decl("scrollbar-thumb-active", `var(--neutral-a${scrollbar.thumbActiveStep})`),
    // The dead dim for non-tone roles (2026-08-17): one factor, see config.
    decl("disabled-dim", `${disabledDim}%`),
    decl("disabled-fill", `var(--neutral-a${disabledSteps[mode].fill})`),
    decl("disabled-fill-solid", `var(--neutral-${disabledSteps[mode].fill})`),
    decl("disabled-border", `var(--neutral-a${disabledSteps[mode].border})`),
    `  /* transmission (§10, 2026-08-07) — what a PANE casts is the app's shadow passed`,
    `     through glass: the surface row faded per thickness, DERIVED from the palette so`,
    `     there is exactly one source of shadow truth. Consumed only where the elevated`,
    `     scope hands it to a material surface; flat declares none. */`,
    ...(["thin", "regular", "thick"] as const).map((t) =>
      decl(`surface-chrome-${t}`, fadeShadow(shadow[mode][surfaceRow()]!, material.transmission[t])),
    ),
    `  /* and the CONTROL row transmitted, for glass controls — a glass field or button casts`,
    `     fainter for the same reason a pane does (§10, 2026-08-07). */`,
    ...(["thin", "regular", "thick"] as const).map((t) =>
      decl(`control-chrome-${t}`, fadeShadow(shadow[mode][controlRow()]!, material.transmission[t])),
    ),
    `  /* and the PRESS tighten transmitted (2026-08-19): a pressed loud glass control was the`,
    `     one caster whose blast never moved — the glass chain resolved before the active`,
    `     variant could be consulted (audit 2026-08-18). Faded like everything glass casts. */`,
    ...(["thin", "regular", "thick"] as const).map((t) =>
      decl(`control-chrome-active-${t}`, fadeShadow(controlChromeActive[mode], material.transmission[t])),
    ),
    `  /* the FLOATING chrome (§22) — what a popup casts. Both variants emitted per appearance`,
    `     because both worlds declare one, and flat's is the list-legal NO-OP: flat casts`,
    `     nothing, floating panes included (2026-08-19 — separation in flat is the hairline's`,
    `     job, not a faded shadow's). */`,
    decl("floating-chrome-elevated", floatingChrome[mode]),
    decl("floating-chrome-flat", "0 0 0 0 transparent"),
  ];
}

/** §19's survivor — the fill-first dress, per appearance: what a field and a mark rest on,
 *  unconditional since the look axis died (controlLook 2026-08-19, surfaceLook 2026-08-20).
 *
 *  Emitted in every appearance scope for the reason every colour role is — a var() bakes
 *  where it is DECLARED, so a single :root copy would carry light's pigment into every dark
 *  region. A neutral STEP is not mode-blind either: the ramp runs the opposite way in the two
 *  appearances, which is why the steps live in config's per-mode `dress` table. */
function dressWorld(mode: "light" | "dark"): string[] {
  const out: string[] = [
    "",
    `  /* the fill-first dress (§19), per appearance: an index means the opposite thing in`,
    `     the two modes, so the ladders are not each other's copy. The edges sit inside`,
    `     contrastHighBands.border, which is what keeps contrast="high" able to reach a`,
    `     dressed component's boundary at all. */`,
  ];
  for (const [family, slots] of Object.entries(dress[mode])) {
    for (const [slot, step] of Object.entries(slots) as [string, number][]) {
      // INNARDS are alpha (2026-08-17, Kushagra — dark cards: "towards the bottom, switch,
      // input etc nothing is visible"). A card's lighting makes its own ground a gradient —
      // sheen at the top, the pool's shade at the bottom — so a field or mark priced as an
      // opaque index against the flat seal vanishes exactly where the pane darkens. The
      // alpha ramp states the same rendered value ON the seal (that is its solve) and
      // composites relative to the local ground everywhere else — the tone-soft move, one
      // layer down.
      out.push(decl(`dress-${family}-${slot}`, `var(--neutral-a${step})`));
      // The alpha dress's opaque twin (2026-08-19), same step said opaquely — the glass
      // scopes re-point to it so the veil's percentage stays the veil (audit 2026-08-18).
      if (!slot.includes("edge")) out.push(decl(`dress-${family}-${slot}-solid`, `var(--neutral-${step})`));
    }
  }
  return out;
}

/** §19's other survivor — the surface family's resting pigment edge, stood DOWN. The pane is
 *  borderless at rest (lab port 2026-08-17: light is the edge — the ring on glass, the pool
 *  and cast on solid), so this role holds a live `transparent` and exists to be re-declared:
 *  the contrast="high" pass and `depth="flat"` each set it to `initial`, and the consumption
 *  fallback (var(--tone-border)) resolves AT THE ELEMENT, where the tone lives — the material
 *  edge's own pattern. Lives in the appearance scopes like the dress, and for the same
 *  proximity reason: any Theme that re-declares it co-locates data-contrast, so the HC
 *  compound wins on specificity at that same element. */
function surfaceEdge(): string[] {
  return [
    "",
    `  /* the surface family's resting edge (§19, §10): stood down — light is the edge. Flat`,
    `     and contrast="high" re-declare this to \`initial\` so var(--tone-border) resolves`,
    `     at the element. */`,
    decl("surface-edge", "transparent"),
  ];
}

/** The radius palette for one level (§6). Steps 1-5 control, 6-9 surfaces, 10 the overlay. */
function radiusPalette(level: RadiusLevel): string[] {
  const { steps, full } = radiusLevels[level];
  const out = steps.map((px, i) => decl(`radius-${i}`, px === 0 ? "0px" : zoom(px)));
  out.push(decl("radius-full", full === 0 ? "0px" : `${full}px`));
  return out;
}

/** Surface and overlay radii (§6, §10, §24): size-indexed picks into their own bands. The
 *  overlay band leans one step up the surface band — a dialog wears the corner of the card
 *  one size up (config's radiusOverlay). Both families re-declare in every level block for
 *  the same reason (substitution-at-declaration, §6). */
function surfaceRadiusFamily(): string[] {
  return [
    ...radiusSurface.map((step, i) => decl(`radius-surface-${i + 1}`, `var(--radius-${step})`)),
    ...radiusOverlay.map((step, i) => decl(`radius-overlay-${i + 1}`, `var(--radius-${step})`)),
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

/** The dialog's gutter from the window edge (§24): one pick into layout space, re-emitted
    per density scope for the same substitution reason as the two families above. */
function dialogFamily(): string[] {
  return [decl("dialog-inset", `var(--layout-space-${dialogInset})`)];
}

/** The control radii for one designed set at one level (§6). At `full` the band is the rule
 * itself — half the size's control height — rather than the palette's 9999px. A capsule was
 * only ever "half the height", and 9999 reached it by CSS clamping against the RENDERED box,
 * which is the wrong box the moment a control's height is not the token's: a textarea three
 * rows tall became a stadium, its first line deep inside the corner curve. The surface band
 * made this exact move already — full re-prices it to designed large corners, never a capsule
 * (§6) — this is the control band's version. Stated per cell, where the heights are declared
 * on the same element, so substitution-at-declaration picks up each world's own ladder. */
/** The default radius level's answer for one designed set — what controlFamily inlines. */
function defaultLevelAnswer(set: DensitySet): string[] {
  return [...controlRadiusFamily(set, defaultRadiusLevel), ...pillAnswer(set, defaultRadiusLevel)];
}

function controlRadiusFamily(set: DensitySet, level: RadiusLevel): string[] {
  if (level === "full")
    return set.radius.flatMap((_, i) => [
      decl(`radius-control-${i + 1}`, `calc(var(--control-height-${i + 1}) / 2)`),
      ...rowRadius(i, level),
    ]);
  return set.radius.flatMap((step, i) => [
    decl(`radius-control-${i + 1}`, `var(--radius-${step})`),
    ...rowRadius(i, level),
  ]);
}

/** The ROW corner (§6, §21, added 2026-08-09 after the audit) — the control band's own `full`
 * sentence, for the family that left the height ladder.
 *
 * A row's box is its text line plus one designed inset, not `--control-height-N`, so at `full`
 * the control band handed it half a box it does not have: measured 18/20/24/28 declared against
 * a row that can only paint 12/14/17/19, and the panel's concentric corner — row corner plus
 * panel padding — inherited the whole error, missing in 21 of 24 cells by up to 9px. This is the
 * same defect the control band fixed for a grown textarea and the mark band fixed for a
 * checkbox: a corner holding a fraction of the wrong box. Third time, one sentence.
 *
 * Every other level is the identity, so nothing but `full` moves. The `full` arm names the row's
 * own two tokens rather than a computed number, because both are re-priced per world (coarse
 * raises the line through the type bands, density moves the inset) — and both are declared on
 * the same element this lands on, where var() resolves against that element's computed values
 * regardless of source order. */
function rowRadius(i: number, level: RadiusLevel): string[] {
  const n = i + 1;
  if (level === "full")
    return [decl(`radius-row-${n}`, `calc((var(--line-height-${n}) + 2 * var(--row-inset-${n})) / 2)`)];
  return [decl(`radius-row-${n}`, `var(--radius-control-${n})`)];
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
  // LEVEL-BLIND on purpose (§6, re-settled 2026-08-09 the hour `full` became the default,
  // after two measured detours — an inheriting binding baked at :root, and a level-flavored
  // family re-created the density-clobbers-radius race the composition law exists to catch).
  // A density or pointer scope may never know the radius level: the pill stays the identity
  // and the radius stays the palette pick, so an outer [data-radius] stamp composes. The
  // LEVEL answers live where level is stated: every (level x density) cell, every level
  // block, and :root for the default (below). The one shape this leaves degraded is a raw
  // [data-density] stamp with NO radius stamp anywhere under a set-dependent default —
  // recorded in §6; Theme and the html-stamp path co-locate, so no real path hits it.
  set.px.forEach((_, i) => put(`control-px-pill-${i + 1}`, `var(--control-px-${i + 1})`));
  set.radius.forEach((step, i) => {
    put(`radius-control-${i + 1}`, `var(--radius-${step})`);
    put(`radius-row-${i + 1}`, `var(--radius-control-${i + 1})`);
  });

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
/** The pill ANSWER for one set at one level (§4, §6): under `full` a bare edge pads the
    designed raw numbers; at every other level the pill token is the plain padding, stated
    as the identity reference so it substitutes against the scope's own px. Emitted
    co-located wherever a scope states a level — never as an inheriting indirection, which
    bakes where it is declared (measured 2026-08-09). */
function pillAnswer(set: DensitySet, level: RadiusLevel): string[] {
  if (level === "full") return set.pxPill.map((px, i) => decl(`control-px-pill-${i + 1}`, zoom(px)));
  return [1, 2, 3, 4].map((n) => decl(`control-px-pill-${n}`, `var(--control-px-${n})`));
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
/** §4 — the icon box for one pointer world. Its own designed ladder rather than a ride on
 *  the line box (the mark family's mechanism): an icon is drawn on a 16/20/24 grid and a
 *  glyph rastered off-grid blurs its strokes, so the value has to land on the grid rather
 *  than wherever a type step puts it. */
function iconFamily(pointer: "fine" | "coarse"): string[] {
  return iconSize[pointer].map((px, i) => decl(`icon-size-${i + 1}`, zoom(px)));
}

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
