/**
 * §7 — the colour generator. Turns two knobs per tone into twelve steps per mode, by one law.
 *
 * The browser does zero colour maths at runtime: everything here runs at build time and emits
 * plain values. Nothing is a borrowed value and nothing is hand-placed per hue.
 */
import { converter, formatHex, inGamut } from "culori";

import {
  chromaCurve,
  contrastHigh,
  contrastHighBands,
  labelPosition,
  lightness,
  lowChromaThreshold,
  solidBand,
  solidStateDeltas,
  step10Offset,
  tones,
  type Mode,
  type ToneName,
} from "./color-config.ts";

const toRgb = converter("rgb");
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

/** The emitted form: hex for sRGB, `color(display-p3 ...)` for P3. */
function format(color: Oklch, gamut: Gamut): string {
  if (gamut === "srgb") return formatHex(color)!;
  const { r, g, b } = toP3(color)!;
  const n = (v: number) => Math.min(1, Math.max(0, v)).toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return `color(display-p3 ${n(r)} ${n(g)} ${n(b)})`;
}

/** The lightness at which a hue reaches peak chroma — where the hue is most itself. */
function cuspLightness(hue: number, gamut: Gamut): number {
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
  isLowChroma: boolean;
};

/** The page backdrop each mode's alpha ramp composites over. */
export function pageBackdrop(mode: Mode): string {
  return mode === "light"
    ? "#ffffff"
    : formatHex(toGamut(oklch(lightness.dark[0]!, 0.004, tones.neutral.hue)))!;
}

export type ToneSpec = { hue: number; vividness: number };

/** Convenience over `buildScaleFor` for the shipped tones. */
export function buildScale(
  tone: ToneName,
  mode: Mode,
  gamut: Gamut = "srgb",
  contrast: ContrastLevel = "normal",
): Scale {
  return buildScaleFor(tones[tone], mode, gamut, contrast);
}

/**
 * The generator proper. Takes a hue angle and a chroma peak — the entire per-accent
 * definition (§7) — so an arbitrary brand colour goes through exactly the same law the
 * shipped tones do. That is what the hostile-hue tests exercise.
 */
export function buildScaleFor(
  { hue, vividness }: ToneSpec,
  mode: Mode,
  gamut: Gamut = "srgb",
  contrast_: ContrastLevel = "normal",
): Scale {
  const hc = contrast_ === "high" ? contrastHigh[mode] : null;
  /** The most chroma this hue can hold at this lightness, inside the target gamut. */
  const available = (l: number) => toGamut(oklch(l, 0.5, hue), gamut).c;
  const chromaAt = (l: number, fraction: number) => available(l) * fraction * vividness;
  const ladder = lightness[mode];
  const band = solidBand[mode];
  const cusp = cuspLightness(hue, gamut);

  // Steps 9 and 10 lean toward the hue's own cusp; every other step takes the shared ladder.
  const solidL = ladder[8]! + (cusp - ladder[8]!) * band.cuspPull;
  const stepL = ladder.map((l, i) => {
    const base = i === 8 ? solidL : i === 9 ? solidL + step10Offset : l;
    if (!hc) return base;
    if ((contrastHighBands.border as readonly number[]).includes(i)) return clampL(base + hc.border);
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
  // A near-white or near-black solid has no room left to move away from its label — a dark
  // mode neutral rests at L .94 with a black label. Fall back toward the label there, which
  // still leaves an enormous margin precisely because the fill was at an extreme.
  //
  // The check has to use the SPREAD-multiplied excursion, not the base one: at contrast="high"
  // the spread is 1.6x, and testing the unmultiplied delta let a bright hue's pressed state
  // run past L 1.0, where it formatted as pure white and the chip vanished.
  const spread = hc ? hc.stateSpread : 1;
  const CEILING = 0.97;
  const FLOOR = 0.06;
  const wanted = solidStateDeltas.active * spread;
  const headroom = preferred > 0 ? CEILING - restL : restL - FLOOR;

  // Prefer moving away from the label; move toward it when there is not enough headroom.
  //
  // Compressing the excursion instead was tried and is worse: a fill sitting near its cusp
  // (every bright hue) can only go lighter by shedding chroma, so the pressed state washed out
  // to near-white and stopped being yellow at all. Moving toward the label keeps the hue, and
  // the APCA laws below guarantee it still clears the bar — which is what the laws are for.
  const away = headroom < wanted ? -preferred : preferred;
  const state = (delta: number) =>
    format(toGamut(oklch(clampL(restL + away * delta * spread), restC, hue), gamut), gamut);
  const solidHover = state(solidStateDeltas.hover);
  const solidActive = state(solidStateDeltas.active);

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

  const backdrop = pageBackdrop(mode);
  return {
    steps,
    alpha: steps.map((hex) => alphaOver(hex, backdrop)),
    solid,
    solidHover,
    solidActive,
    contrast,
    label,
    isLowChroma,
  };
}

/** Every shipped scale, both modes. The unit the emitter and the law tests both consume. */
export function buildAllScales(): Record<Mode, Record<ToneName, Scale>> {
  const out = {} as Record<Mode, Record<ToneName, Scale>>;
  for (const mode of Object.keys(lightness) as Mode[]) {
    out[mode] = {} as Record<ToneName, Scale>;
    for (const tone of Object.keys(tones) as ToneName[]) {
      out[mode][tone] = buildScale(tone, mode);
    }
  }
  return out;
}

/**
 * Only what `contrast="high"` actually changes: the border and text bands, the roles that read
 * them, and the widened interaction spread. Re-declaring the whole scale would ship the solid
 * band and the backgrounds again for nothing.
 */
export function contrastHighDeclarations(mode: Mode, gamut: Gamut = "srgb"): string[] {
  const out: string[] = [];
  for (const tone of Object.keys(tones) as ToneName[]) {
    const s = buildScale(tone, mode, gamut, "high");
    for (const i of [...contrastHighBands.border, ...contrastHighBands.text]) {
      out.push(`  --${tone}-${i + 1}: ${s.steps[i]};`);
    }
    out.push(
      `  --${tone}-solid-hover: ${s.solidHover};`,
      `  --${tone}-solid-active: ${s.solidActive};`,
      `  --${tone}-label: ${s.label};`,
    );
  }
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
    s.steps.forEach((hex, i) => out.push(`  --${tone}-${i + 1}: ${hex};`));
    // The alpha ramp stays sRGB in both blocks: its solve assumes sRGB channel compositing,
    // and its job is differentiating nested surfaces, where the wider gamut buys nothing.
    if (gamut === "srgb") s.alpha.forEach((v, i) => out.push(`  --${tone}-a${i + 1}: ${v};`));
    out.push(
      `  --${tone}-soft: var(--${tone}-3);`,
      `  --${tone}-soft-hover: var(--${tone}-4);`,
      `  --${tone}-soft-active: var(--${tone}-5);`,
      `  --${tone}-solid: ${s.solid};`,
      `  --${tone}-solid-hover: ${s.solidHover};`,
      `  --${tone}-solid-active: ${s.solidActive};`,
      `  --${tone}-border: var(--${tone}-7);`,
      `  --${tone}-text: var(--${tone}-11);`,
      `  --${tone}-label: ${s.label};`,
      `  --${tone}-contrast: ${s.contrast};`,
    );
  }
  return out;
}
