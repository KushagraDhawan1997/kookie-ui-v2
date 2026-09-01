/**
 * §7 — the colour generator. Turns two knobs per tone into twelve steps per mode, by one law.
 *
 * The browser does zero colour maths at runtime: everything here runs at build time and emits
 * plain values. Nothing is a borrowed value and nothing is hand-placed per hue.
 */
import { decl } from "./emit.ts";
import { converter, formatHex, inGamut } from "culori";

import {
  chromaCurve,
  apcaFloors,
  chromaFloor,
  contrastHigh,
  contrastHighBands,
  focusRingStep,
  inkLc,
  currentInk,
  invalidEdgeStep,
  labelPosition,
  lightness,
  lowChromaThreshold,
  controlEdgeLc,
  thumbFill,
  thumbLabel,
  codeTheme,
  trackWellStep,
  trackWellStepHigh,
  solidBand,
  solidPinBounds,
  lowChromaStateScale,
  solidStateDeltas,
  step10Offset,
  tones,
  type Mode,
  type ToneName,
} from "./color-config.ts";
import { groundColor, surfaceColor } from "./config.ts";

const toRgb = converter("rgb");
const toOklch = converter("oklch");
const toP3 = converter("p3");
const fits = { srgb: inGamut("rgb"), p3: inGamut("p3") } as const;

/**
 * Which boundary chroma is measured against. sRGB is what ships in `:root`; P3 rides in an
 * `@supports` block on top (§7). It is a parameter rather than a constant because chroma is
 * expressed as a fraction of what the gamut holds, so widening the gamut is the entire change.
 */
export type Gamut = keyof typeof fits;

type Oklch = { mode: "oklch"; l: number; c: number; h: number };

/**
 * Lightness is a 0-1 coordinate, and the ends are degenerate: past them everything formats as
 * flat white or black, losing hue and any distinction between neighbouring steps. Held just
 * inside so a shifted band cannot collapse — contrast="high" pushes dark neutral's step 12
 * past 1.0 on its own.
 */
const clampL = (l: number) => Math.min(0.985, Math.max(0.02, l));
const oklch = (l: number, c: number, h: number): Oklch => ({ mode: "oklch", l, c, h });

/**
 * Hold lightness, reduce chroma (§7). Lightness is the consistency guarantee, so it can never
 * move to absorb a clamp; chroma is the give. Binary search rather than letting the browser
 * clamp per hue at runtime, which would vary by engine.
 */
function toGamut(color: Oklch, gamut: Gamut = "srgb"): Oklch {
  const inside = fits[gamut];
  if (inside(color)) return color;
  let lo = 0;
  let hi = color.c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inside(oklch(color.l, mid, color.h))) lo = mid;
    else hi = mid;
  }
  return oklch(color.l, lo, color.h);
}

/**
 * The emitted form: hex for sRGB, `color(display-p3 ...)` for P3.
 *
 * **Three decimals, not four (2026-09-01), and the bound is the argument.** The P3 block is
 * the single largest thing in the artifact after the component rules — 678 literals, 5,507
 * gzipped bytes — and every channel was carrying a digit no display can show. A third
 * decimal bounds the error at 5e-4: an eighth of an 8-bit step (1/255 = 3.9e-3) and about
 * half of a 10-bit one (1/1023 = 9.8e-4), so an ordinary panel cannot resolve it at all and
 * the best available panel can differ by at most one least-significant code. That is orders
 * of magnitude under the perceptual threshold, and it is stated as a bound rather than as
 * "no change" because a bound is the true claim and can be checked.
 *
 * Measured: -571 gzipped bytes, and it is spent at the generator rather than as a regex over
 * the built artifact, so `tokens.css` shrinks with it and the drift law still reads one home.
 * A fourth decimal buys nothing; a second (max error 5e-3) crosses the 8-bit step and would.
 */
export const p3Decimals = 3;

function format(color: Oklch, gamut: Gamut): string {
  if (gamut === "srgb") return formatHex(color)!;
  const { r, g, b } = toP3(color)!;
  const n = (v: number) =>
    Math.min(1, Math.max(0, v)).toFixed(p3Decimals).replace(/0+$/, "").replace(/\.$/, "");
  return `color(display-p3 ${n(r)} ${n(g)} ${n(b)})`;
}

/** The lightness at which a hue reaches peak chroma — where the hue is most itself. */
export function cuspLightness(hue: number, gamut: Gamut): number {
  let bestL = 0.5;
  let bestC = 0;
  for (let l = 0.02; l < 1; l += 0.01) {
    const c = toGamut(oklch(l, 0.4, hue), gamut).c;
    if (c > bestC) {
      bestC = c;
      bestL = l;
    }
  }
  return bestL;
}

/**
 * APCA-W3 (0.1.9) lightness contrast. Used instead of WCAG 2 ratios because we left sRGB for
 * being perceptually wrong and WCAG 2 carries the same wrongness (§7).
 */
export function apcaLc(textHex: string, bgHex: string): number {
  const Y = (hex: string) => {
    const { r, g, b } = toRgb(hex)!;
    const lin = (v: number) => Math.pow(v, 2.4);
    return 0.2126729 * lin(r) + 0.7151522 * lin(g) + 0.072175 * lin(b);
  };
  const clamp = (y: number) => (y > 0.022 ? y : y + Math.pow(0.022 - y, 1.414));
  const txt = clamp(Y(textHex));
  const bg = clamp(Y(bgHex));
  if (Math.abs(bg - txt) < 0.0005) return 0;

  let lc: number;
  if (bg > txt) {
    lc = (Math.pow(bg, 0.56) - Math.pow(txt, 0.57)) * 1.14;
    lc = lc < 0.1 ? 0 : lc - 0.027;
  } else {
    lc = (Math.pow(bg, 0.65) - Math.pow(txt, 0.62)) * 1.14;
    lc = lc > -0.1 ? 0 : lc + 0.027;
  }
  return lc * 100;
}

/** Whichever of white or black reads harder on this fill. Computed, never a threshold guess. */
function contrastOn(fill: string): string {
  return Math.abs(apcaLc("#ffffff", fill)) >= Math.abs(apcaLc("#000000", fill))
    ? "#ffffff"
    : "#000000";
}

/**
 * The least-alpha overlay that composites to `target` over `backdrop` (§10: surfaces nest, so
 * their fills must be alpha or each level needs per-level colour maths). Minimising alpha
 * maximises the overlay's own saturation, which is what makes the ramp survive over images.
 */
function alphaOver(targetHex: string, backdropHex: string): string {
  const t = toRgb(targetHex)!;
  const b = toRgb(backdropHex)!;
  const channels: Array<["r" | "g" | "b", number, number]> = [
    ["r", t.r, b.r],
    ["g", t.g, b.g],
    ["b", t.b, b.b],
  ];

  let alpha = 0;
  for (const [, tc, bc] of channels) {
    const needed = tc <= bc ? (bc === 0 ? 0 : (bc - tc) / bc) : bc === 1 ? 0 : (tc - bc) / (1 - bc);
    alpha = Math.max(alpha, needed);
  }
  if (alpha < 0.0001) return "transparent";
  alpha = Math.min(1, alpha);

  const solve = (tc: number, bc: number) => Math.min(1, Math.max(0, (tc - (1 - alpha) * bc) / alpha));
  const hex = formatHex({
    mode: "rgb",
    r: solve(t.r, b.r),
    g: solve(t.g, b.g),
    b: solve(t.b, b.b),
  })!;
  return `color-mix(in srgb, ${hex} ${(alpha * 100).toFixed(1)}%, transparent)`;
}

export type ContrastLevel = "normal" | "high";

export type Scale = {
  steps: string[];
  alpha: string[];
  solid: string;
  solidHover: string;
  solidActive: string;
  contrast: string;
  label: string;
  /** The family's own colour, placed where a small MARK is visible on this mode's page. */
  glyph: string;
  isLowChroma: boolean;
};

/**
 * The backdrop each mode's alpha ramp composites over — the SURFACE SEAL, not the page
 * (decided 2026-08-06, Kushagra). An alpha fill's usual home is a sealed surface — a card, a
 * field — so the ramp solves against what it actually sits on. Before this the two modes told
 * different stories (light solved against white ≡ the seal; dark against a hand-made page
 * approximation the law then re-used, a tautology), and the page colour was stated three
 * near-identical ways. Now the seal is read from config's surfaceColor: a literal is used
 * directly, and dark's `var(--neutral-2)` resolves through the same generator that emits it,
 * so the backdrop and the seal cannot drift apart.
 */
/**
 * The PAGE, memoised per mode (2026-08-23, ultracode audit).
 *
 * Three solvers measure their target against the page and the seal, and all three rebuilt the
 * entire neutral scale to get one hex — inside a bisection loop, forty iterations deep, for
 * every family in both modes. Measured, `generateTokens()` went from 1229ms to 2381ms when the
 * glyph role landed, and most of that is this.
 *
 * A cache and not a hoist, for `backdropCache`'s own stated reason one function down: the call
 * sites are spread across three solvers, and hoisting one leaves the next author to rediscover
 * it. The generator is pure — the same mode answers the same hex — so memoising is stating that
 * rather than assuming it. `stepsOnly` is what keeps this out of the cycle it would otherwise
 * make: the page is a STEP, and steps do not depend on the backdrop.
 */
const pageCache: Partial<Record<Mode, string>> = {};
function pageColor(mode: Mode): string {
  pageCache[mode] ??= buildScaleFor(
    resolveTone(tones.neutral),
    mode,
    "srgb",
    "normal",
    true,
  ).steps[0]!;
  return pageCache[mode]!;
}

const backdropCache: Partial<Record<Mode, string>> = {};
export function alphaBackdrop(mode: Mode): string {
  const rest: string = surfaceColor[mode].rest;
  if (!rest.startsWith("var(")) return rest;
  if (!backdropCache[mode]) {
    const step = Number(rest.match(/--neutral-(\d+)/)![1]!);
    backdropCache[mode] = buildScaleFor(resolveTone(tones.neutral), mode, "srgb", "normal", true)
      .steps[step - 1]!;
  }
  return backdropCache[mode]!;
}

export type ToneSpec = {
  hue: number;
  /** Chroma as a fraction of what the gamut holds — 1 is as vivid as the display allows. */
  vividness: number;
  /** Light-mode solid lightness, when the tone came from a supplied brand colour. */
  pinL?: number;
};

/**
 * §7 — the intake: a brand colour in, a system-correct tone out. This is what makes accent
 * "your colour" rather than "one of our thirty".
 *
 * Hue is taken as-is. Vividness is the colour's chroma measured against what its own lightness
 * could hold, so "as saturated as they drew it" survives being replotted anywhere on the ladder.
 * `pinL` carries the input's lightness so light mode can reproduce the colour exactly at step 9
 * rather than normalising it to the cusp — a brand colour that comes out a shade off is not the
 * brand colour. Dark mode takes the hue and chroma shape and re-derives, since no promise was
 * made about a dark solid.
 */
export function toneFromColor(css: string): ToneSpec {
  const c = toOklch(css);
  if (!c) throw new Error(`accentColor is not a colour this browser or build understands: ${css}`);
  const hue = c.h ?? 0;
  const headroom = toGamut(oklch(c.l, 0.5, hue), "srgb").c;
  return {
    hue,
    vividness: headroom > 0 ? Math.min(1, (c.c ?? 0) / headroom) : 0,
    pinL: c.l,
  };
}

/** A tone is authored either as a brand colour or, for greys, as a hue and a vividness. */
export type ToneInput = ToneSpec | { color: string };

/**
 * The GROUND resolved to a hex (§10, minted 2026-08-20), memoised the way the seal is.
 *
 * `groundColor` states it per mode and the two modes state it differently — light as a neutral
 * step, dark as a literal between two rungs — so it resolves exactly the way `alphaBackdrop`
 * resolves the seal: a literal is used directly, a `var(--neutral-N)` goes back through the
 * generator that emits it, so the bed and the emitted role cannot drift apart.
 */
const groundCache: Partial<Record<Mode, string>> = {};
function groundBed(mode: Mode): string {
  const value: string = groundColor[mode];
  if (!value.startsWith("var(")) return value;
  groundCache[mode] ??= buildScaleFor(resolveTone(tones.neutral), mode, "srgb", "normal", true)
    .steps[Number(value.match(/--neutral-(\d+)/)![1]!) - 1]!;
  return groundCache[mode]!;
}

/** The beds a RESTING edge is measured on: the page and the surface seal. */
const restingBeds = (mode: Mode): readonly string[] => [pageColor(mode), alphaBackdrop(mode)];

/**
 * The beds a CONFORMANCE floor is measured on — every ground the system paints, which is the
 * two above plus `--color-ground`.
 */
const conformanceBeds = (mode: Mode): readonly string[] => [...restingBeds(mode), groundBed(mode)];

/**
 * The control edge (§7, §11, decided 2026-08-07) — the resting hairline of a control whose
 * identity needs it under the outlined look: the mark family (an unchecked checkbox IS its
 * border — audit D2) and the field family (an outlined field's fill is the seal it sits on,
 * so the border is likewise all there is). SOLVED to `controlEdgeLc`, never picked from the
 * ladder: dark has no rung near the floor — step 9 misses at Lc 42.1 and the scale folds
 * back before 11 — so picking rungs shipped a resting ring at Lc 66.5, which Kushagra read,
 * correctly, as a high-contrast value at rest. The `--accent-label` precedent, generalised.
 *
 * Binary search on the neutral recipe's lightness for the value that JUST clears the target
 * against the HARDEST of the beds it sits on. Chroma is the neutral tint at the border band's
 * fraction — a hairline is a tinted grey like every other neutral, not a pure one. Monotonic
 * in L away from the bed, so bisection is exact.
 *
 * THE BED SET IS THE CALLER'S, and it is per CONTRAST LEVEL (2026-08-26, audit) — `solveSignal`'s
 * own arrangement one solver over, for the same reason: the beds are the only thing two callers
 * of one walk disagree about. The split is the 2026-08-07 one. A RESTING edge is taste, held to
 * no floor, so it keeps the two beds it was judged on. `contrast="high"` is the CONFORMANCE
 * surface, and a floor that does not hold on every ground the system paints is not a floor —
 * `--color-ground` became a third paintable bed on 2026-08-20 (Surface) and was never added to
 * the search. Measured before the fix: light's high-contrast field edge `#a6a5aa` sat at |Lc|
 * 43.37 on a ground against the 45 the setting is defined to bind to, while measuring 48.15 on
 * the seal — so nothing could see the miss, because every check read the two beds the solve
 * already knew. The resting values are deliberately NOT re-solved: they are dress, and moving
 * dress is a taste edit this repair has no mandate for.
 */
function solveControlEdge(
  mode: Mode,
  gamut: Gamut,
  target: number,
  beds: readonly string[],
): string {
  const { hue, vividness } = resolveTone(tones.neutral);
  const grey = (l: number, g: Gamut) => {
    const cMax = toGamut(oklch(l, 0.4, hue), "srgb").c;
    return format(toGamut(oklch(l, cMax * vividness, hue), g), g);
  };
  const worst = (l: number) =>
    Math.min(...beds.map((bed) => Math.abs(apcaLc(grey(l, "srgb"), bed))));
  // Light beds: darker edge = more contrast, so search downward from the bed; dark: upward.
  let lo: number;
  let hi: number;
  if (mode === "light") {
    lo = 0.02; hi = 0.99; // worst(lo) high, worst(hi) ~0 — find the LIGHTEST l clearing target
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (worst(mid) >= target) lo = mid; else hi = mid;
    }
    return grey(lo, gamut);
  }
  lo = 0.02; hi = 0.99; // dark: worst(hi) high — find the DARKEST l clearing target
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (worst(mid) >= target) hi = mid; else lo = mid;
  }
  return grey(hi, gamut);
}

/**
 * THE GLYPH (§7, §11, decided 2026-08-23) — the most saturated version of a family's hue that
 * a person can still see as a small mark on this mode's page.
 *
 * It exists because the SOLID does not survive as an icon and the INK is the wrong instrument.
 * Measured against `apcaFloors.nonText`, `--accent-solid` misses on the dark page (|Lc| 43.4
 * against 45) and a brand yellow, green or pale pink misses on the light one (19, 27, 23) —
 * so the fill can never be the icon colour, because no single hex is legible on both white and
 * black. That is not a property of our blue; it is a property of colour.
 *
 * The ink clears the floor everywhere, which made "just use the ink" the obvious answer, and
 * measuring killed it: the ink is solved for READING (Lc 60+, and its muted rung is solved
 * against `inkLc`), and meeting a higher bar costs saturation — darkening away from the cusp
 * sheds chroma by gamut geometry. When this was decided the gap was **1.3x to 2.2x in every
 * family and both modes** (`#0095fe` against an ink of `#2a6caa` in light — a vivid blue
 * beside a muted navy, the whole difference between an accent and a value that merely has a
 * hue). The 2026-08-26 chromaCurve change closed most of that gap (the ink was ALSO paying a
 * designed taper on top of the geometric cost, and stopped); the glyph remains the vivid end
 * by construction, because it darkens least.
 *
 * WHAT IT IS, stated as the rule rather than as arithmetic: the accent, moved only as far as
 * the page forces. In light it lands within a hair of the solid (`#0095fe` vs `#0094fc`)
 * because the solid already clears the floor there; in dark it lifts, because that is the
 * only direction legibility exists. That is `undilutedTones`' own distinction made concrete —
 * chroma is held at the family's maximum and only LIGHTNESS moves.
 *
 * Chroma peaks at the hue's cusp and falls away from it in both directions, while contrast
 * rises monotonically away from the bed. So the answer is the cusp when the cusp clears, and
 * otherwise the nearest point to it that does — which is exactly what bisection finds, and
 * why this needs no scan. `solveControlEdge`'s shape with the family's own hue in place of
 * neutral's, measured against the harder of the seal and the page for its reason: a floor
 * that only holds on one of the two surfaces every app puts marks on is not a floor.
 *
 * Contrast is read on the sRGB rendering even when emitting P3 (the `contrast` decision's own
 * sentence — the choice belongs to the design, not to the monitor), and no `contrast="high"`
 * variant exists because none is owed: Lc 45 IS the WCAG 1.4.11 non-text bar, so the glyph
 * already conforms at rest in standard mode.
 */
function solveGlyph(hue: number, vividness: number, mode: Mode, gamut: Gamut): string {
  return solveSignal(hue, vividness, mode, gamut, [pageColor(mode), alphaBackdrop(mode)]);
}

/**
 * The shared walk under `solveGlyph` and `solveRing` (generalised 2026-08-26, when the ring
 * learned to solve): the most chromatic placement of a hue that clears the non-text floor
 * against EVERY bed it is measured on. The beds are the caller's, because that is the only
 * thing the two signals disagree about — a glyph sits on the page or the seal, a ring can
 * also land on a focused control's soft fill.
 */
function solveSignal(
  hue: number,
  vividness: number,
  mode: Mode,
  gamut: Gamut,
  beds: readonly string[],
): string {
  const target = apcaFloors.nonText;
  const at = (l: number, g: Gamut) => {
    const cMax = toGamut(oklch(l, 0.5, hue), "srgb").c;
    return format(toGamut(oklch(l, cMax * vividness, hue), g), g);
  };
  const worst = (l: number) =>
    Math.min(...beds.map((bed) => Math.abs(apcaLc(at(l, "srgb"), bed))));
  const cusp = cuspLightness(hue, gamut);
  if (worst(cusp) >= target) return at(cusp, gamut);
  // The cusp is too close to the bed, so walk AWAY from it — darker on a light page, lighter
  // on a dark one — and stop at the first lightness that clears. Nearest-to-cusp is
  // most-chromatic, so the boundary point is the answer rather than merely an answer.
  let lo: number;
  let hi: number;
  if (mode === "light") {
    lo = 0.02;
    hi = cusp; // worst() falls as l rises here: find the LIGHTEST l still clearing
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (worst(mid) >= target) lo = mid;
      else hi = mid;
    }
    return at(lo, gamut);
  }
  lo = cusp;
  hi = 0.98; // dark: worst() rises with l — find the DARKEST l still clearing
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (worst(mid) >= target) hi = mid;
    else lo = mid;
  }
  return at(hi, gamut);
}

/**
 * The RING, solved for a bright brand (§8, 2026-08-26 — Kushagra: "I need green and yellow
 * tones to work; Apple makes it work"). Apple's own arrangement, read structurally: a bright
 * brand's FILL carries dark text, and everywhere the brand must be a LINE — focus above all —
 * the platform uses a darker cut of the same hue, never the bright fill. The mechanism is the
 * glyph solve with the ring's own beds: the page, the seal, and the soft fill a focused
 * control can rest on (the three surfaces the ring law has always measured).
 *
 * The emission consults this ONLY when the picked step misses a bed — a brand whose solid
 * already clears (blue, violet, rose) passes through as the `var()` it always was, byte for
 * byte, so the solve is dormant machinery until a bright brand exists.
 */
export function solveRing(
  mode: Mode,
  gamut: Gamut = "srgb",
  // Parameterized so a law can hand it the hue that forced it (yellow) while the shipped
  // brand's pick still clears — the emission always calls it with the real accent.
  spec: ToneSpec = resolveTone(tones.accent),
): string {
  const neutral = buildScaleFor(resolveTone(tones.neutral), mode, "srgb");
  return solveSignal(spec.hue, spec.vividness, mode, gamut, [
    neutral.steps[0]!,
    neutral.steps[1]!,
    neutral.steps[2]!,
  ]);
}

/**
 * The ink ladder's fade, solved (§15, 2026-08-10). How much of a family's loud ink is left
 * standing so the rung lands on its target contrast.
 *
 * A percentage in a `color-mix(… , transparent)` IS an alpha, and the browser composites it
 * against whatever is behind — so the model here is a plain sRGB alpha blend over the bed, not
 * an oklab interpolation. Contrast falls monotonically as alpha falls (the ink walks toward
 * the bed it is measured against), so bisection is exact.
 *
 * The bed is the HARDER of the seal and the page, `solveControlEdge`'s own rule: a target that
 * only holds on one of the two surfaces every app puts text on is not a floor.
 */
export function solveInkFade(inkHex: string, mode: Mode, target: number): number {
  const page = pageColor(mode);
  const seal = alphaBackdrop(mode);
  const channels = (hex: string) =>
    [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
  const over = (bed: string, a: number) => {
    const [ir, ig, ib] = channels(inkHex);
    const [br, bg, bb] = channels(bed);
    const mix = (i: number, b: number) => Math.round(i * a + b * (1 - a));
    return `#${[mix(ir, br), mix(ig, bg), mix(ib, bb)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;
  };
  const worst = (a: number) =>
    Math.min(Math.abs(apcaLc(over(seal, a), seal)), Math.abs(apcaLc(over(page, a), page)));
  // At alpha 1 the ink is itself (its loud contrast); at 0 it is the bed (zero). If even the
  // undiluted ink misses the target, there is nothing to fade — hand back the whole thing
  // rather than silently emitting a rung that pretends to hit a number it cannot reach.
  if (worst(1) <= target) return 100;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (worst(mid) >= target) hi = mid;
    else lo = mid;
  }
  // Round UP to whole percent: the target is a floor, and a rounded-down alpha would sit under
  // it by construction in every family at once.
  return Math.ceil(hi * 100);
}

export function resolveTone(input: ToneInput): ToneSpec {
  return "color" in input ? toneFromColor(input.color) : input;
}

/** Convenience over `buildScaleFor` for the shipped tones. */
export function buildScale(
  tone: ToneName,
  mode: Mode,
  gamut: Gamut = "srgb",
  contrast: ContrastLevel = "normal",
): Scale {
  return buildScaleFor(resolveTone(tones[tone]), mode, gamut, contrast);
}

/**
 * The generator proper. Takes a hue angle and a chroma peak — the entire per-accent
 * definition (§7) — so an arbitrary brand colour goes through exactly the same law the
 * shipped tones do. That is what the hostile-hue tests exercise.
 */
export function buildScaleFor(
  { hue, vividness, pinL }: ToneSpec,
  mode: Mode,
  gamut: Gamut = "srgb",
  contrast_: ContrastLevel = "normal",
  stepsOnly = false,
): Scale {
  const hc = contrast_ === "high" ? contrastHigh[mode] : null;
  /** The most chroma this hue can hold at this lightness, inside the target gamut. */
  const available = (l: number) => toGamut(oklch(l, 0.5, hue), gamut).c;
  const chromaAt = (l: number, fraction: number) => available(l) * fraction * vividness;
  const ladder = lightness[mode];
  const band = solidBand[mode];
  const cusp = cuspLightness(hue, gamut);

  // Steps 9 and 10 lean toward the hue's own cusp; every other step takes the shared ladder.
  // Unless the tone came from a supplied brand colour, in which case light mode pins to it so
  // the colour someone chose is the colour they get (§7). Dark mode always re-derives.
  const solidL =
    pinL !== undefined && mode === "light"
      ? Math.min(solidPinBounds.max, Math.max(solidPinBounds.min, pinL))
      : ladder[8]! + (cusp - ladder[8]!) * band.cuspPull;
  const stepL = ladder.map((l, i) => {
    const base = i === 8 ? solidL : i === 9 ? solidL + step10Offset : l;
    if (!hc) return base;
    if ((contrastHighBands.border as readonly number[]).includes(i)) {
      // Never below the cusp. Below it a hue stops reading as itself — a darkened yellow is
      // olive, which is the same mud the solid band's cusp rule exists to prevent. Bright hues
      // therefore barely move here; they take their high-contrast gain in the text band.
      const shifted = base + hc.border;
      return clampL(hc.border < 0 ? Math.max(shifted, Math.min(base, cusp)) : Math.min(shifted, Math.max(base, cusp)));
    }
    if ((contrastHighBands.text as readonly number[]).includes(i)) return clampL(base + hc.text);
    return base;
  });

  const steps = stepL.map((l, i) => format(toGamut(oklch(l, chromaAt(l, chromaCurve[i]!), hue), gamut), gamut));

  const isLowChroma = vividness < lowChromaThreshold;

  // Prominence comes from chroma or from lightness; at zero chroma lightness does all the work,
  // so a low-chroma scale's solid role is step 12 rather than step 9 (§7).
  const solid = isLowChroma ? steps[11]! : steps[8]!;
  const restL = isLowChroma ? stepL[11]! : solidL;
  const restC = chromaAt(restL, isLowChroma ? chromaCurve[11]! : chromaCurve[8]!);

  // The label is decided on the resting fill, then hover and press move AWAY from it, so the
  // interaction states are strictly more legible than rest and only rest has to clear the bar.
  // Decided on the sRGB rendering even when emitting P3, so a wide-gamut display cannot flip
  // a button's label from white to black. The choice belongs to the design, not to the monitor.
  const contrast = contrastOn(formatHex(toGamut(oklch(restL, restC, hue), "srgb"))!);
  const preferred = contrast === "#ffffff" ? -1 : 1;


  // A low-chroma solid sits at an extreme (step 12) and has no chroma cue to separate its
  // states, so lightness does all the work and must travel further; it moves TOWARD its label,
  // the visible direction, safe because it started at an end.
  //
  // For everything else the states move away from the label — but bounded by what the HUE can
  // take, not by a fixed delta. A fill at its cusp is hemmed in on both sides: yellow washed
  // out to near-white going up (shedding 54% of its chroma) and went olive going down. So the
  // excursion runs as far as it can while the hue still holds most of its saturation, and the
  // direction is chosen by which way affords more of that travel.
  const spread = hc ? hc.stateSpread : 1;

  /** The two moving states, as fractions of the full excursion: hover, then press. */
  const stateFractions = [solidStateDeltas.hover / solidStateDeltas.active, 1] as const;
  /** A state's fill, read in sRGB always — the label decision is sRGB's (`contrast`, above). */
  const fillAt = (dir: number, t: number, fraction: number) =>
    formatHex(toGamut(oklch(clampL(restL + dir * t * fraction), restC, hue), "srgb"))!;

  /**
   * One excursion resolved: which way the states move, and how far.
   *
   * `scaleFor` sizes it — 1 is the resting excursion, `hc.stateSpread` the widened one — and
   * `floors` is the label pairing each state must still clear, ONE NUMBER PER STATE, because
   * hover and press are held to different bars the moment the bar becomes "no worse than
   * standard mode" rather than a single constant.
   *
   * "Which way affords more travel" is the rule, and for a while the code implemented less of
   * it: it flipped direction only when the preferred side could not even reach the hover step,
   * so a hue parked AT its cusp (dark-mode green: away affords .055, toward affords the full
   * excursion) kept the short side and compressed both states below the visibility floor. The
   * flip is a trade — toward-label travel spends label contrast — so it is GATED on the label
   * law. Away-from-label wins whenever it affords the full excursion; a hue that can afford
   * neither (amber: away washes out, toward drops the label under its floor) simply cannot
   * ship as a tone, and the separation law is what says so. Both laws hold; membership in the
   * tone set is what gives.
   *
   * `solveDown` picks the gate. Standard mode is all-or-nothing — test the full excursion,
   * flip only if it clears, the shipped and judged behaviour. HIGH CONTRAST SOLVES INSTEAD
   * (2026-08-26, the bright-brand work): its 1.6× excursion can overshoot what the label can
   * absorb, and the all-or-nothing gate then refused the only direction with room, so the
   * widened spread came out NARROWER than standard mode's. Under high the gate walks down from
   * the full excursion to the LARGEST travel that still clears every floor.
   */
  const excursion = (scaleFor: number, floors: readonly number[], solveDown: boolean) => {
    const desired = solidStateDeltas.active * scaleFor;
    const reach = (dir: number) => {
      let best = 0;
      for (let d = 0.01; d <= desired; d += 0.005) {
        const l = restL + dir * d;
        if (l !== clampL(l) || available(l) < restC * chromaFloor) break;
        best = d;
      }
      return best;
    };
    const preferredReach = reach(preferred);
    const oppositeReach = reach(-preferred);
    const clearsAt = (t: number) =>
      stateFractions.every(
        (f, i) => Math.abs(apcaLc(contrast, fillAt(-preferred, t, f))) >= floors[i]!,
      );
    const flipTravel = () => {
      const max = Math.min(oppositeReach, desired);
      if (max <= preferredReach) return 0;
      if (!solveDown) return clearsAt(max) ? max : 0;
      for (let t = max; t > preferredReach; t -= 0.005) if (clearsAt(t)) return t;
      return 0;
    };
    const flipT = flipTravel();
    const away = isLowChroma
      ? -preferred
      : preferredReach >= desired || flipT <= 0
        ? preferred
        : -preferred;
    // A solved flip travels exactly the distance the solve found — reach() would re-extend it
    // past the label floor the solve just honoured.
    const travel =
      !isLowChroma && away === -preferred && preferredReach < desired && flipT > 0
        ? flipT
        : Math.min(reach(away), desired);
    return { away, travel };
  };

  // THE HIGH-CONTRAST FLOOR IS STANDARD MODE'S OWN PAIRING (2026-08-26, audit).
  //
  // The solved flip was bounded below by `apcaFloors.body`, and that let the widened excursion
  // buy spread with legibility: green and success — cusp-parked hues whose preferred side
  // cannot afford the 1.6× travel — walked their states TOWARD the black label until they hit
  // 60, so the setting shipped a press at Lc 60.3 where standard mode's measured 67.4. Turning
  // an accessibility setting ON made a pairing WORSE, which is the one outcome this file names
  // as a failure ("a band that stays put is the setting working, not failing. The only real
  // failure is a pairing that gets worse"). The `apcaFloors.aaa` term that looked like the
  // guard could never bind: clearing 75 always permits LESS travel than clearing 60, and the
  // `Math.max` took whichever permitted MORE — so the AAA branch was arithmetically dead in
  // every call. It is deleted rather than repaired, because 75 is unreachable on this pairing
  // by construction: the label is already whichever of black and white reads harder, and a
  // chromatic solid never moves, so there is nothing left to spend. See `contrastHigh`.
  //
  // The floor is instead the pairing this same hue produces at the RESTING excursion, per
  // state: high contrast may travel as far toward the label as it likes, provided every state
  // stays at least as legible as the one it replaces. A hue with room widens exactly as it did
  // before; a hue with none keeps standard mode's spread, which is the setting working.
  //
  // Computed by calling `excursion` again rather than by a second formula — the SAME function
  // at `scaleFor` 1 — and exact because `restL`, `restC`, `contrast` and `preferred` do not
  // move with the setting for a chromatic tone (a chromatic solid is untouched by high
  // contrast; that is its own law). A low-chroma tone never consults it: its direction is
  // fixed, its excursion never flips, and its rest fill IS step 12, which high contrast does
  // move — so the baseline would not be standard mode's answer there and is not asked for.
  const standard =
    hc && !isLowChroma ? excursion(1, [apcaFloors.body, apcaFloors.body], false) : null;
  const floors = standard
    ? stateFractions.map((f) =>
        Math.abs(apcaLc(contrast, fillAt(standard.away, standard.travel, f))),
      )
    : [apcaFloors.body, apcaFloors.body];
  const { away, travel } = excursion(isLowChroma ? lowChromaStateScale : spread, floors, spread > 1);
  const step = (fraction: number) =>
    format(toGamut(oklch(clampL(restL + away * travel * fraction), restC, hue), gamut), gamut);
  const solidHover = step(solidStateDeltas.hover / solidStateDeltas.active);
  const solidActive = step(1);

  // A UI label is not a link: between 11 and 12, keeping chroma that step 12 has given up.
  const label = format(
    toGamut(
      oklch(
        stepL[10]! + (stepL[11]! - stepL[10]!) * labelPosition,
        chromaAt(
          stepL[10]! + (stepL[11]! - stepL[10]!) * labelPosition,
          chromaCurve[10]! + (chromaCurve[11]! - chromaCurve[10]!) * labelPosition,
        ),
        hue,
      ),
      gamut,
    ),
    gamut,
  );

  // stepsOnly exists for alphaBackdrop's own neutral lookup: the seal is a neutral step, the
  // steps do not depend on the backdrop, and skipping the alpha solve breaks the cycle.
  const backdrop = stepsOnly ? "" : alphaBackdrop(mode);
  return {
    steps,
    alpha: stepsOnly ? [] : steps.map((hex) => alphaOver(hex, backdrop)),
    solid,
    solidHover,
    solidActive,
    contrast,
    label,
    // Behind the same `stepsOnly` guard the alpha ramp is behind, and for the same reason:
    // the solve reads the neutral page and the seal, both of which are built by this very
    // function, so computing it on the steps-only pass is the cycle that guard exists to cut.
    //
    // AND AT LOW CHROMA THE SOLVE IS ANSWERING THE WRONG QUESTION, so a grey takes its INK
    // instead — `--accent-solid`'s own remap four lines up, keyed on chroma rather than on
    // the name "neutral", exactly as §7 requires. `solveGlyph` maximises chroma at the
    // minimum legible contrast, which is right for a colour (the most saturated blue a person
    // can still see) and degenerates for a grey, where there is no chroma to maximise: it
    // returns the PALEST legible grey. Measured, `--neutral-glyph` shipped at #8f9397 against
    // an ink of #1f1f20 — so the moment a plain row's icon read this role it would have gone
    // washed out, which is the defect the icon work found before it could ship. §7's sentence
    // for the solid covers this case verbatim: prominence comes from chroma or from
    // lightness, and at zero chroma lightness does all the work.
    glyph: stepsOnly ? "" : isLowChroma ? steps[11]! : solveGlyph(hue, vividness, mode, gamut),
    isLowChroma,
  };
}

/**
 * Only what `contrast="high"` actually changes: the border and text bands, the roles that read
 * them, and the widened interaction spread. Re-declaring the whole scale would ship the solid
 * band and the backgrounds again for nothing.
 *
 * `--tone-solid` is the exception that has to be spelled out, because it is baked as a literal
 * rather than `var(--tone-12)`: re-declaring the step it was built from cannot reach it. Left
 * out, a low-chroma rest fill stayed at its normal-contrast value while hover and active moved
 * beneath it — the neutral loud button's press came out LIGHTER than its rest, on the opposite
 * side of hover (§7, §8). Chromatic solids are the brand colour and do not move, so the
 * declaration is emitted only where the value actually changed.
 */
export function contrastHighDeclarations(mode: Mode, gamut: Gamut = "srgb"): string[] {
  const out: string[] = [];
  for (const tone of Object.keys(tones) as ToneName[]) {
    const s = buildScale(tone, mode, gamut, "high");
    const normal = buildScale(tone, mode, gamut, "normal");
    for (const i of [...contrastHighBands.border, ...contrastHighBands.text]) {
      out.push(decl(`${tone}-${i + 1}`, s.steps[i]!));
    }
    if (s.solid !== normal.solid) out.push(decl(`${tone}-solid`, s.solid));
    out.push(
      decl(`${tone}-solid-hover`, s.solidHover),
      decl(`${tone}-solid-active`, s.solidActive),
      decl(`${tone}-label`, s.label),
    );
  }
  // The control edge's high-contrast answer is DESIGNED, not inherited from a band (§7,
  // 2026-08-07): solved one tier up, so the request strengthens every control boundary the
  // same amount. Before this, dark's pick moved only because its step happened to sit in a
  // re-priced band, and light's never moved at all.
  out.push(
    decl("control-edge", solveControlEdge(mode, gamut, controlEdgeLc.mark.high, conformanceBeds(mode))),
  );
  out.push(
    decl("field-edge", solveControlEdge(mode, gamut, controlEdgeLc.field.high, conformanceBeds(mode))),
  );
  // The track well answers the axis too (§7, 2026-08-08). It is the only resting role a
  // control can be made ENTIRELY of — an off switch is its well — so leaving it out of this
  // block left one control deaf to the one setting the system calls the conformance surface.
  // See trackWellStepHigh for why a band step and not a solve.
  out.push(decl("color-track", `var(--neutral-${trackWellStepHigh[mode]})`));
  /* And the syntax theme, for the same reason and by the same rule (§15, 2026-09-01): this
     scope re-declares every family's ink, and a custom property is substituted where it is
     DECLARED — so without this line a code sample inside `contrast="high"` paints the standard
     inks while every other word on the page has moved. */
  for (const [name, value] of Object.entries(codeTheme)) out.push(decl(`code-${name}`, value));
  return out;
}

/** The CSS declarations for one mode: raw steps, the alpha ramp, and the role layer (§7). */
export function colorDeclarations(
  mode: Mode,
  gamut: Gamut = "srgb",
  contrast: ContrastLevel = "normal",
): string[] {
  const out: string[] = [];
  const scales = Object.keys(tones) as ToneName[];

  for (const tone of scales) {
    const s = buildScale(tone, mode, gamut, contrast);
    out.push(`  /* ${tone} */`);
    s.steps.forEach((hex, i) => out.push(decl(`${tone}-${i + 1}`, hex)));
    // The alpha ramp stays sRGB in both blocks: its solve assumes sRGB channel compositing,
    // and its job is differentiating nested surfaces, where the wider gamut buys nothing.
    if (gamut === "srgb") s.alpha.forEach((v, i) => out.push(decl(`${tone}-a${i + 1}`, v)));
    out.push(
      // The soft trio is the ALPHA ramp since 2026-08-17 (Kushagra, off the dark AlertDialog:
      // "the Keep it button barely has any bg... we have solved it by how we do hover states
      // on dropdown — why are buttons not?"). An opaque indexed step is priced against ONE
      // bed, so a dark panel one step from the page swallowed it; the alpha solve composites
      // the SAME rendered colour over the seal and lifts on any other ground by construction —
      // the menu row wash's principle, promoted. Dark sits one step up: its 2→3 delta is
      // under a noticeable difference on the panel bed (a3 there is ~4% white), which is a
      // fact about compression at black, not a taste asymmetry — the focus ring's own
      // per-mode precedent. The ramp is sRGB in both gamut blocks on purpose (its own note
      // above), so these resolve the sRGB solve everywhere.
      decl(`${tone}-soft`, `var(--${tone}-a${mode === "dark" ? 4 : 3})`),
      decl(`${tone}-soft-hover`, `var(--${tone}-a${mode === "dark" ? 5 : 4})`),
      decl(`${tone}-soft-active`, `var(--${tone}-a${mode === "dark" ? 6 : 5})`),
      // The trio's OPAQUE twins (2026-08-19), for the one bed where an alpha source is a
      // defect: GLASS. The material veil is color-mix(source alpha%, transparent) and that
      // formula assumes an opaque source — the percentage IS the veil. An alpha source
      // multiplies through it (audit 2026-08-18: a glass field's designed 62% veil rendered
      // at 4.1%, a photo passing straight through the input's box). By the recomposition
      // law aN over the seal IS step N, so the twin is the same rung said opaquely; the
      // glass scopes re-point the generic roles to these.
      decl(`${tone}-soft-solid`, `var(--${tone}-${mode === "dark" ? 4 : 3})`),
      decl(`${tone}-soft-hover-solid`, `var(--${tone}-${mode === "dark" ? 5 : 4})`),
      decl(`${tone}-soft-active-solid`, `var(--${tone}-${mode === "dark" ? 6 : 5})`),
      // AND a3's OWN twin (2026-08-26). The soft trio's twins above cannot serve the
      // tone-forward SURFACE rung, for two independent reasons: `soft` is a WASH_ROLE, so it
      // resolves neutral for every family (no tone paints a faded fill, 2026-08-23) — and a
      // Notice's tint is the one place the family MUST survive; and `soft` is a4's twin in
      // dark, one rung off. So the same recomposition argument gets its own name, and unlike
      // `soft` it does not shift by mode: a3 over the bed IS step 3 in both. Measured before
      // it existed: a destructive thin strip painted color(srgb .788 .051 0 / .0255) against
      // a designed 34% veil — the family gone, the strip a grey smudge.
      decl(`${tone}-a3-solid`, `var(--${tone}-3)`),
      decl(`${tone}-solid`, s.solid),
      decl(`${tone}-solid-hover`, s.solidHover),
      decl(`${tone}-solid-active`, s.solidActive),
      decl(`${tone}-border`, `var(--${tone}-7)`),
      decl(`${tone}-text`, `var(--${tone}-11)`),
      decl(`${tone}-label`, s.label),
      decl(`${tone}-contrast`, s.contrast),
      // The GLYPH (solved above): the family placed where a small mark is visible. Sits
      // beside `contrast` because both are solved rather than picked off the ladder, and
      // both answer a legibility question the steps cannot.
      decl(`${tone}-glyph`, s.glyph),
      // The ink ladder (§15) — what the type emphasis rungs read when this family is chosen.
      // Loud is the family's ONE designed text colour: neutral 12 (a gray scale has twelve
      // grays), a chroma family's 11 (12 is its high-contrast variant, and 9/10 are solid
      // fills — the steps below the text step are MORE vivid, not less).
      //
      // The two rungs below it FADE that ink toward transparent, and the amount is solved to
      // a target contrast rather than picked (2026-08-10, `inkLc`). Neutral goes through the
      // identical path: it used to take steps 11 and 10, which is how one family's ladder came
      // to answer a different question from every other family's — measured, its light rungs
      // sat 26 and 13 apart while the chroma families sat wherever 74% and 52% happened to
      // land. One rule, ten families, no exception.
      ...(() => {
        const loud = tone === "neutral" ? 12 : 11;
        // Solved off the sRGB rendering of the ink, always — the alpha model is sRGB channel
        // compositing (the alpha ramp's own note, one role over), and the P3 block must carry
        // the SAME percentage or the two gamuts would ship two different ladders.
        const ink = buildScale(tone, mode, "srgb", contrast).steps[loud - 1]!;
        const fade = (target: number) =>
          `color-mix(in oklab, var(--${tone}-${loud}) ${solveInkFade(ink, mode, target)}%, transparent)`;
        return [
          decl(`${tone}-ink`, `var(--${tone}-${loud})`),
          decl(`${tone}-ink-muted`, fade(inkLc.muted)),
          decl(`${tone}-ink-faint`, fade(inkLc.faint)),
        ];
      })(),
      // The CURRENT colour (§21, 2026-08-26): what a current row's icon AND label both wear,
      // one value so the two cannot mismatch. A per-mode pick between the family's ink and
      // its glyph — see currentInk in color-config.ts for the judgment and its stated cost.
      // For a grey the two candidates coincide, so this resolves identically either way.
      decl(`${tone}-current`, `var(--${tone}-${currentInk[mode]})`),
    );
  }

  // The focus ring (§8). One ring system-wide, always the accent, because "where is focus" is
  // one question and a per-tone ring would answer two at once. It lives here rather than in the
  // recipe layer so the shared control CSS names no colour family at all — and it has to be
  // re-declared per mode, since a `var()` resolves where it is declared and a single :root copy
  // would bake light's accent into dark (§6).
  // The step is chosen per mode because the ring's job is a CONTRAST guarantee against the page
  // it sits on, and the solid band cannot keep that promise in dark: `--accent-solid` is step 9,
  // which in dark is a deep violet sitting on a near-black page at |Lc| 22.3 — a focus indicator
  // that is very nearly invisible, and a WCAG 2.4.11 failure that shipped because §8's stated
  // "≥3:1 against adjacent surfaces" law was never actually written (found 2026-08-03). Step 11
  // is the band designed to be legible against the page, and it clears the same floor light's
  // solid already did: 74.7 light, 66.3 dark, against --neutral-1.
  //
  // AND THE PICK IS GUARDED (2026-08-26): a bright brand's picked step cannot clear the floor
  // at any vividness — yellow's solid on white is the canonical case — so when the pick misses
  // any of the ring's three beds, the emission solves down the hue instead (see solveRing).
  // For every brand whose pick clears, this branch is dormant and the var() ships unchanged.
  {
    const accentScale = buildScaleFor(resolveTone(tones.accent), mode, "srgb");
    const neutralScale = buildScaleFor(resolveTone(tones.neutral), mode, "srgb");
    const pick =
      focusRingStep[mode] === "solid"
        ? accentScale.solid
        : accentScale.steps[Number(focusRingStep[mode]) - 1]!;
    const clears = [neutralScale.steps[0]!, neutralScale.steps[1]!, neutralScale.steps[2]!].every(
      (bed) => Math.abs(apcaLc(pick, bed)) >= apcaFloors.nonText,
    );
    out.push(
      decl("focus-ring", clears ? `var(--accent-${focusRingStep[mode]})` : solveRing(mode, gamut)),
    );
  }

  // The edge a control wears while it is INVALID — both its border and its ring (§8, decided
  // 2026-08-04). One token because it is one answer: "this control is wrong" is a single
  // question, the way "where is focus" is.
  //
  // Picked per mode for the same reason the ring is, and the numbers are why the border band
  // could not serve: --destructive-border is step 7, which shares its LIGHTNESS with every
  // other tone at that step by law, so the shipped invalid state was a hue rotation at constant
  // luminance — APCA 23.9 light and 9.8 dark against the field fill, versus 22.8 / 10.3 for the
  // resting border it replaces. In dark, being invalid LOWERED contrast. Step 9 clears the
  // Lc 45 non-text floor in light (65.4) but not in dark (36.1); step 11 does (65.2).
  out.push(decl("invalid-edge", `var(--destructive-${invalidEdgeStep[mode]})`));

  // The control edge (§7, §11, 2026-08-07; supersedes the mark edge's per-mode step picks) —
  // solved to the non-text floor rather than picked from the ladder, because dark has no rung
  // near it and the nearest passing pick read as high-contrast at rest. Worn by the mark
  // family and, under the outlined look, the field family. See solveControlEdge.
  out.push(
    decl(
      "control-edge",
      solveControlEdge(mode, gamut, controlEdgeLc.mark.normal[mode], restingBeds(mode)),
    ),
  );
  // The field family's boundary sits one APCA tier down (2026-08-07): a field is a LARGE
  // element, and the guidance holds large/solid non-text to 30 where fine detail owes 45 —
  // at equal colour, the long border of a big box reads far heavier than a mark's ring.
  out.push(
    decl(
      "field-edge",
      solveControlEdge(mode, gamut, controlEdgeLc.field.normal[mode], restingBeds(mode)),
    ),
  );

  // The track well (§7, §11, decided 2026-08-06 with Slider) — the low neutral bed a value
  // runs in: the slider's track now, the switch's off-track and progress/meter when they
  // land. §11's "track low" is the checkbox's "neutral off" one control over, and neutral
  // needs a role here for the same reason the mark edge did: the component stamps `accent`
  // for its fill, so its off part can only be neutral through a tone-independent role.
  // Deliberately quieter than the mark edge — a well is a region the fill moves through,
  // not a hairline identity, and every platform ships it subtle.
  // ALPHA since 2026-08-17 (with the dress innards): a track runs inside panes whose own
  // lighting shades their ground, and an opaque low step vanishes at a dark card's bottom —
  // the off switches in the dark settings card, measured invisible. The a-step renders
  // identically on the seal and lifts relative to any local ground. HC keeps its opaque
  // step below: conformance wants the designed contrast, not adaptation.
  out.push(decl("color-track", `var(--neutral-a${trackWellStep[mode]})`));

  // The thumb's fill (§11, 2026-08-07) — the family's third role: a grip must be the most
  // findable object on the rail, so dark goes near-white (iOS's own posture) where light
  // keeps the seal. See thumbFill's comment in color-config.ts.
  out.push(decl("color-thumb", thumbFill[mode]));
  // And the ink that pairs with it (§26, 2026-08-19). Emitted beside the fill because it
  // answers to the fill: a grip that carries a label needs one, and the two must move together
  // or the label goes invisible the next time the grip is re-priced.
  out.push(decl("color-thumb-label", thumbLabel[mode]));

  /* The syntax theme (§15, 2026-09-01, shipped with `CodeBlock`) — the one role block whose
     consumer is OUTSIDE this package. A highlighter pointed at the `--code-` prefix lands on
     these names, and every one of them is a family's SOLVED ink, so a code sample is held to
     the same contrast targets as the prose around it.

     IN EVERY SCOPE THAT MOVES THE INKS, and the first spelling emitted it once at `:root` on
     the argument that it names ROLES and a role is what carries the mode. The argument is
     wrong in this system for the oldest reason in it: a custom property is substituted where
     it is DECLARED (§6), so a `--code-token-keyword: var(--accent-ink)` written at the root
     bakes the root's accent, and a light `<Theme>` inside a dark document then paints a code
     sample in the dark family's inks. Measured, and caught by the law that walks all four of
     the light palette's cases — which is the fourth time that rule has had to be re-learned.

     Emitted here rather than in the component's stylesheet, and that is not a filing
     preference: a component sheet may not name a family (`recipes.test.ts` walks every one of
     them, and it is the law that caught the first spelling of this), because §7's tone
     indirection exists so that a component never reaches past it. A theme is a cross-family
     assignment, so it belongs where the families are declared. The assignments live in
     `color-config.ts`, with everything else that is taste. */
  for (const [name, value] of Object.entries(codeTheme)) out.push(decl(`code-${name}`, value));

  return out;
}
