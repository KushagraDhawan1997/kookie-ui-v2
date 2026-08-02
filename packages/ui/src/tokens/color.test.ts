/**
 * Law tests for the colour layer (§7). These assert the guarantees the generator is supposed
 * to provide — the shared ladder, APCA legibility, the low-chroma remap, the alpha ramp's
 * arithmetic — never specific hex values. A hex here would be a snapshot in disguise.
 */
import { converter, formatHex } from "culori";
import { describe, expect, it } from "vitest";

import { lightness, lowChromaThreshold, tones, type Mode, type ToneName } from "./color-config.ts";
import { apcaLc, buildScale, buildScaleFor, cuspLightness, pageBackdrop } from "./color.ts";

const toOklch = converter("oklch");
const toRgb = converter("rgb");

const MODES = Object.keys(lightness) as Mode[];
const TONES = Object.keys(tones) as ToneName[];

/** APCA's body-text target. Lc 45 is large text, 60 is body, 75 is preferred. */
const BODY = 60;

const L = (hex: string) => toOklch(hex)!.l;

describe("the shared ladder is what makes a step mean something (§7)", () => {
  it("every tone lands on the identical lightness at every non-solid step", () => {
    for (const mode of MODES) {
      const scales = TONES.map((t) => buildScale(t, mode));
      // Steps 9 and 10 are excluded on purpose: the solid band is hue-aware by design.
      for (const step of [0, 1, 2, 3, 4, 5, 6, 7, 10, 11]) {
        const ls = scales.map((s) => L(s.steps[step]!));
        expect(Math.max(...ls) - Math.min(...ls)).toBeLessThan(0.02);
      }
    }
  });

  it("the solid band moves per hue, which is the one designed exception", () => {
    const ls = TONES.map((t) => L(buildScale(t, "light").steps[8]!));
    expect(Math.max(...ls) - Math.min(...ls)).toBeGreaterThan(0.02);
  });

  it("background, border and text bands descend in light mode and ascend in dark", () => {
    for (const mode of MODES) {
      for (const tone of TONES) {
        const band = buildScale(tone, mode).steps.slice(0, 8).map(L);
        const ordered = band.every((l, i) => i === 0 || (mode === "light" ? l < band[i - 1]! : l > band[i - 1]!));
        expect(ordered).toBe(true);
      }
    }
  });
});

describe("APCA legibility is computed, never assumed (§7)", () => {
  it("the contrast token clears body text on every solid", () => {
    for (const mode of MODES) {
      for (const tone of TONES) {
        const s = buildScale(tone, mode);
        expect(Math.abs(apcaLc(s.contrast, s.solid))).toBeGreaterThanOrEqual(BODY);
      }
    }
  });

  it("it also clears on solid hover and active, where a label silently fails otherwise", () => {
    for (const mode of MODES) {
      for (const tone of TONES) {
        const s = buildScale(tone, mode);
        for (const fill of [s.solidHover, s.solidActive]) {
          expect(Math.abs(apcaLc(s.contrast, fill))).toBeGreaterThanOrEqual(BODY);
        }
      }
    }
  });

  it("the label clears every background in its rung, not just at rest (§8)", () => {
    // medium rests on step 3, hovers to 4, presses to 5. The press state is where a label
    // that only passed at rest fails silently.
    for (const mode of MODES) {
      for (const tone of TONES) {
        const s = buildScale(tone, mode);
        for (const step of [2, 3, 4]) {
          expect(Math.abs(apcaLc(s.label, s.steps[step]!))).toBeGreaterThanOrEqual(BODY);
        }
      }
    }
  });

  it("the text role clears body text on the soft fill it sits on", () => {
    for (const mode of MODES) {
      for (const tone of TONES) {
        const s = buildScale(tone, mode);
        expect(Math.abs(apcaLc(s.steps[10]!, s.steps[2]!))).toBeGreaterThanOrEqual(BODY);
      }
    }
  });
});

describe("prominence comes from chroma or from lightness (§7)", () => {
  it("a low-chroma scale takes step 12 as its solid, a chromatic one takes step 9", () => {
    for (const mode of MODES) {
      for (const tone of TONES) {
        const s = buildScale(tone, mode);
        expect(s.isLowChroma).toBe(tones[tone].vividness < lowChromaThreshold);
        expect(s.solid).toBe(s.isLowChroma ? s.steps[11] : s.steps[8]);
      }
    }
  });

  it("keys on vividness, not on the name — a desaturated brand accent gets the same fix", () => {
    expect(tones.neutral.vividness).toBeLessThan(lowChromaThreshold);
    expect(tones.accent.vividness).toBeGreaterThan(lowChromaThreshold);
  });

  it("keeps rest, hover and press visibly apart, and a grey further apart than a hue", () => {
    // Neutral's three states were 0.24 / 0.20 / 0.16 and read as one flat black. A chromatic
    // fill also shifts saturation as it moves, so it says the same thing in less lightness;
    // a grey has only lightness and needs the wider step.
    for (const mode of MODES) {
      for (const tone of TONES) {
        const s = buildScale(tone, mode);
        const floor = s.isLowChroma ? 0.07 : 0.035;
        expect(Math.abs(L(s.solidHover) - L(s.solid))).toBeGreaterThanOrEqual(floor);
        expect(Math.abs(L(s.solidActive) - L(s.solidHover))).toBeGreaterThanOrEqual(floor);
      }
    }
  });

  it("a low-chroma solid still moves under interaction, since the ramp ran out at 12", () => {
    for (const mode of MODES) {
      const s = buildScale("neutral", mode);
      expect(s.solidHover).not.toBe(s.solid);
      expect(s.solidActive).not.toBe(s.solidHover);
      // Rest, hover and active stay evenly spaced by construction.
      const gap1 = Math.abs(L(s.solidHover) - L(s.solid));
      const gap2 = Math.abs(L(s.solidActive) - L(s.solidHover));
      expect(Math.abs(gap1 - gap2)).toBeLessThan(0.03);
    }
  });
});

describe("interaction never desaturates a hue out of recognition (§7)", () => {
  it("no state sheds more than a third of the resting chroma", () => {
    // Moving a fill away from its cusp costs chroma, and past a point the hue stops being
    // itself: yellow's pressed state read as olive. Capping the loss caps the mud, whatever
    // combination of spread, direction and headroom produced the excursion.
    for (const mode of MODES) {
      for (const contrast of ["normal", "high"] as const) {
        for (const spec of [
          { hue: 100, vividness: 1 },
          { hue: 130, vividness: 1 },
          { hue: 195, vividness: 1 },
          { hue: 250, vividness: 1 },
          { hue: 25, vividness: 1 },
        ]) {
          const s = buildScaleFor(spec, mode, "srgb", contrast);
          const restC = toOklch(s.solid)!.c;
          for (const fill of [s.solidHover, s.solidActive]) {
            expect(toOklch(fill)!.c).toBeGreaterThanOrEqual(restC * 0.66);
          }
        }
      }
    }
  });
});

describe("the label sits between the text steps, and is not one of them (§7)", () => {
  it("lands between 11 and 12 in lightness", () => {
    for (const mode of MODES) {
      for (const tone of TONES) {
        const s = buildScale(tone, mode);
        const [lo, hi] = [L(s.steps[10]!), L(s.steps[11]!)].sort((a, b) => a - b);
        expect(L(s.label)).toBeGreaterThan(lo!);
        expect(L(s.label)).toBeLessThan(hi!);
      }
    }
  });

  it("keeps chroma that step 12 has given up, so it still says accent rather than ink", () => {
    for (const tone of ["accent", "destructive"] as const) {
      const s = buildScale(tone, "light");
      expect(toOklch(s.label)!.c).toBeGreaterThan(toOklch(s.steps[11]!)!.c);
    }
  });
});

describe("the label colour is a design decision, not a per-display one (§7)", () => {
  it("resolves the same in sRGB and P3, so a wide-gamut monitor cannot flip it", () => {
    // It did: destructive's more saturated P3 solid tipped APCA to black, so the same button
    // rendered white-on-red on one display and black-on-red on another.
    for (const mode of MODES) {
      for (const tone of TONES) {
        expect(buildScale(tone, mode, "p3").contrast).toBe(buildScale(tone, mode, "srgb").contrast);
      }
    }
  });
});

describe("hostile hues survive the same law (§7)", () => {
  // Accent is an arbitrary user hue, so the generator has to hold for the colours that break
  // fixed-ladder systems, not only for the well-behaved blue we happened to ship.
  const HOSTILE = {
    "brand yellow": { hue: 100, vividness: 1 },
    "neon lime": { hue: 130, vividness: 1 },
    "hot magenta": { hue: 340, vividness: 1 },
    cyan: { hue: 195, vividness: 0.9 },
    "near-black navy": { hue: 265, vividness: 0.55 },
    "near-grey accent": { hue: 250, vividness: 0.1 },
  } as const;

  for (const [name, spec] of Object.entries(HOSTILE)) {
    for (const mode of MODES) {
      it(`${name} in ${mode}: label survives every fill it lands on`, () => {
        const s = buildScaleFor(spec, mode);
        for (const fill of [s.solid, s.solidHover, s.solidActive]) {
          expect(Math.abs(apcaLc(s.contrast, fill))).toBeGreaterThanOrEqual(BODY);
        }
        for (const step of [2, 3, 4]) {
          expect(Math.abs(apcaLc(s.label, s.steps[step]!))).toBeGreaterThanOrEqual(BODY);
        }
        expect(Math.abs(apcaLc(s.steps[10]!, s.steps[2]!))).toBeGreaterThanOrEqual(BODY);
      });

      it(`${name} in ${mode}: keeps the shared ladder outside the solid band`, () => {
        const s = buildScaleFor(spec, mode);
        const reference = buildScale("accent", mode);
        for (const step of [0, 1, 2, 3, 4, 5, 6, 7, 10, 11]) {
          expect(Math.abs(L(s.steps[step]!) - L(reference.steps[step]!))).toBeLessThan(0.02);
        }
      });
    }
  }

  it("a bright hue's solid rises well above a deep hue's — the mud fix, measured", () => {
    const yellow = L(buildScaleFor(HOSTILE["brand yellow"], "light").steps[8]!);
    const navy = L(buildScaleFor(HOSTILE["near-black navy"], "light").steps[8]!);
    expect(yellow).toBeGreaterThan(navy + 0.15);
    // Radix hand-places bright solids around .85; the generated one should be in that country.
    expect(yellow).toBeGreaterThan(0.7);
  });

  it("a bright solid flips its label to dark, which is what makes the fix usable", () => {
    expect(buildScaleFor(HOSTILE["brand yellow"], "light").contrast).toBe("#000000");
    expect(buildScaleFor(HOSTILE["neon lime"], "light").contrast).toBe("#000000");
  });

  it("a near-grey brand accent gets the low-chroma solid, not just the tone named neutral", () => {
    const s = buildScaleFor(HOSTILE["near-grey accent"], "light");
    expect(s.isLowChroma).toBe(true);
    expect(s.solid).toBe(s.steps[11]);
  });
});

describe("contrast=high shifts values, it never remaps a role (§7)", () => {
  const AAA = 75;

  it("clears the AAA-equivalent bar where normal only has to clear AA", () => {
    for (const mode of MODES) {
      for (const tone of TONES) {
        const s = buildScale(tone, mode, "srgb", "high");
        for (const step of [2, 3, 4]) {
          expect(Math.abs(apcaLc(s.label, s.steps[step]!))).toBeGreaterThanOrEqual(AAA);
        }
        expect(Math.abs(apcaLc(s.steps[10]!, s.steps[2]!))).toBeGreaterThanOrEqual(AAA);
      }
    }
  });

  it("moves the label pairing by a visible amount, not a token gesture", () => {
    // At +7 Lc the two palettes were indistinguishable side by side, which is how a
    // high-contrast mode ends up shipping as decoration. The bar is a perceptible step.
    for (const mode of MODES) {
      for (const tone of TONES) {
        const normal = buildScale(tone, mode);
        const high = buildScale(tone, mode, "srgb", "high");
        const gain =
          Math.abs(apcaLc(high.label, high.steps[2]!)) - Math.abs(apcaLc(normal.label, normal.steps[2]!));
        expect(gain).toBeGreaterThanOrEqual(9);
      }
    }
  });

  it("never lets a solid state run out of the lightness range", () => {
    // A pressed state that formatted as flat white: the room check tested the unmultiplied
    // delta while the spread multiplied it 1.6x, so the excursion ran past L 1.0.
    for (const mode of MODES) {
      for (const tone of TONES) {
        const s = buildScale(tone, mode, "srgb", "high");
        for (const fill of [s.solidHover, s.solidActive]) {
          expect(L(fill)).toBeGreaterThan(0.02);
          expect(L(fill)).toBeLessThan(0.99);
        }
      }
    }
  });

  it("only ever increases contrast, for every pairing", () => {
    for (const mode of MODES) {
      for (const tone of TONES) {
        const normal = buildScale(tone, mode);
        const high = buildScale(tone, mode, "srgb", "high");
        for (const step of [2, 4]) {
          expect(Math.abs(apcaLc(high.label, high.steps[step]!))).toBeGreaterThan(
            Math.abs(apcaLc(normal.label, normal.steps[step]!)),
          );
        }
      }
    }
  });

  it("never pushes a border further from its hue's cusp, where the hue turns to mud", () => {
    // A darkened yellow is olive: in light mode the border shift reintroduced exactly the mud
    // the solid band's cusp rule exists to prevent, so bright hues barely move there and take
    // their gain in the text band instead. In dark mode the same shift travels TOWARD the cusp
    // and is welcome, which is why the invariant is about distance from the cusp, not direction.
    for (const mode of MODES) {
      for (const spec of [
        { hue: 100, vividness: 1 },
        { hue: 130, vividness: 1 },
        { hue: 250, vividness: 1 },
      ]) {
        const cusp = cuspLightness(spec.hue, "srgb");
        const normal = buildScaleFor(spec, mode);
        const high = buildScaleFor(spec, mode, "srgb", "high");
        for (const step of [5, 6, 7]) {
          const before = Math.abs(L(normal.steps[step]!) - cusp);
          const after = Math.abs(L(high.steps[step]!) - cusp);
          expect(after).toBeLessThanOrEqual(before + 0.005);
        }
      }
    }
  });

  it("leaves a chromatic solid alone — that value is the brand colour", () => {
    for (const mode of MODES) {
      for (const tone of TONES) {
        const normal = buildScale(tone, mode);
        if (normal.isLowChroma) continue;
        expect(buildScale(tone, mode, "srgb", "high").solid).toBe(normal.solid);
      }
    }
  });

  it("but a low-chroma solid does deepen, because there is no hue to protect", () => {
    // Neutral's solid IS step 12, so it follows the text band. Nothing is being traded away:
    // a grey has no brand value to preserve, and the label gains contrast.
    for (const mode of MODES) {
      const normal = buildScale("neutral", mode);
      const high = buildScale("neutral", mode, "srgb", "high");
      expect(high.solid).not.toBe(normal.solid);
      expect(Math.abs(apcaLc(high.contrast, high.solid))).toBeGreaterThan(
        Math.abs(apcaLc(normal.contrast, normal.solid)),
      );
    }
  });

  it("widens the interaction spread rather than narrowing it", () => {
    for (const mode of MODES) {
      const normal = buildScale("accent", mode);
      const high = buildScale("accent", mode, "srgb", "high");
      expect(Math.abs(L(high.solidActive) - L(high.solid))).toBeGreaterThan(
        Math.abs(L(normal.solidActive) - L(normal.solid)),
      );
    }
  });

  it("still resolves the label away from the fill, so nothing regressed", () => {
    for (const mode of MODES) {
      for (const tone of TONES) {
        const s = buildScale(tone, mode, "srgb", "high");
        for (const fill of [s.solid, s.solidHover, s.solidActive]) {
          expect(Math.abs(apcaLc(s.contrast, fill))).toBeGreaterThanOrEqual(BODY);
        }
      }
    }
  });
});

describe("the alpha ramp composites back to its step (§10)", () => {
  it("every alpha value lands on its solid step over the page backdrop", () => {
    for (const mode of MODES) {
      const backdrop = toRgb(pageBackdrop(mode))!;
      for (const tone of TONES) {
        const s = buildScale(tone, mode);
        s.alpha.forEach((value, i) => {
          if (value === "transparent") return;
          const [, hex, pct] = value.match(/color-mix\(in srgb, (#[0-9a-f]+) ([\d.]+)%/)!;
          const overlay = toRgb(hex!)!;
          const a = Number(pct) / 100;
          const composited = formatHex({
            mode: "rgb",
            r: a * overlay.r + (1 - a) * backdrop.r,
            g: a * overlay.g + (1 - a) * backdrop.g,
            b: a * overlay.b + (1 - a) * backdrop.b,
          })!;
          // Within one 8-bit step per channel; the alpha solve rounds through hex twice.
          const diff = Math.abs(L(composited) - L(s.steps[i]!));
          expect(diff).toBeLessThan(0.02);
        });
      }
    }
  });
});
