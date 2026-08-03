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
  solidPinBounds,
  lowChromaStateScale,
  solidStateDeltas,
  step10Offset,
  tones,
  type Mode,
  type ToneName,
} from "./color-config.ts";

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

/** The emitted form: hex for sRGB, `color(display-p3 ...)` for P3. */
function format(color: Oklch, gamut: Gamut): string {
  if (gamut === "srgb") return formatHex(color)!;
  const { r, g, b } = toP3(color)!;
  const n = (v: number) => Math.min(1, Math.max(0, v)).toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
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
  isLowChroma: boolean;
};

/** The page backdrop each mode's alpha ramp composites over. */
export function pageBackdrop(mode: Mode): string {
  return mode === "light"
    ? "#ffffff"
    : formatHex(toGamut(oklch(lightness.dark[0]!, 0.004, tones.neutral.hue)))!;
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
  const CHROMA_FLOOR = 0.75;
  const spread = hc ? hc.stateSpread : 1;
  const scaleFor = isLowChroma ? lowChromaStateScale : spread;
  const desired = solidStateDeltas.active * scaleFor;
  const reach = (dir: number) => {
    let best = 0;
    for (let d = 0.01; d <= desired; d += 0.005) {
      const l = restL + dir * d;
      if (l !== clampL(l) || available(l) < restC * CHROMA_FLOOR) break;
      best = d;
    }
    return best;
  };

  const preferredReach = reach(preferred);
  const away = isLowChroma || preferredReach < solidStateDeltas.hover ? -preferred : preferred;
  const travel = Math.min(reach(away), desired);
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
      out.push(`  --${tone}-${i + 1}: ${s.steps[i]};`);
    }
    if (s.solid !== normal.solid) out.push(`  --${tone}-solid: ${s.solid};`);
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
  out.push(`  --focus-ring: var(${mode === "dark" ? "--accent-11" : "--accent-solid"});`);

  return out;
}
