/**
 * Law tests for the colour layer (§7). These assert the guarantees the generator is supposed
 * to provide — the shared ladder, APCA legibility, the low-chroma remap, the alpha ramp's
 * arithmetic — never specific hex values. A hex here would be a snapshot in disguise.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { converter, formatHex } from "culori";
import { describe, expect, it } from "vitest";

import {
  apcaFloors,
  lightness,
  lowChromaThreshold,
  controlEdgeLc,
  inkLc,
  tones,
  type Mode,
  type ToneName,
} from "./color-config.ts";
import { dress, groundColor, pageColor, surfaceColor } from "./config.ts";
import {
  alphaBackdrop,
  apcaLc,
  buildScale,
  buildScaleFor,
  colorDeclarations,
  contrastHighDeclarations,
  cuspLightness,
  p3Decimals,
  resolveTone,
  solveRing,
  toneFromColor,
  type Scale,
} from "./color.ts";
import { generateTokens } from "./generate.ts";

// Generated ONCE, at module scope (2026-08-20). `generateTokens()` solves its contrast
// targets by search and measures ~4s — most of a law's 5s timeout on an idle machine — so a
// call inside an `it` is a law that answers on this laptop and TIMES OUT on a two-core
// runner, which is what CI reported. The generator is pure, so one result serves every law
// in the file and the cost lands in the collection phase, where the runner accounts for it.
const emitted = generateTokens();

const toOklch = converter("oklch");
const toRgb = converter("rgb");

const MODES = Object.keys(lightness) as Mode[];
const TONES = Object.keys(tones) as ToneName[];

/**
 * The emitted colour declarations for a mode, generated ONCE (2026-08-17).
 *
 * `colorDeclarations` regenerates the whole palette on every call — every family solved
 * against its beds — and the laws below reach for it inside their loops, so one of them was
 * paying for it forty times (two modes × ten tones × two rungs). Measured 1.56s locally and
 * 9.06s on a CI runner, which is past vitest's 5s default: the law that failed the build was
 * not wrong, it was slow, and it had been slow since the ink ladder was rewritten.
 *
 * A cache and not a hoist, because the call sites are spread across a dozen laws and hoisting
 * one loop leaves the next author to rediscover this. The generator is pure — the same mode
 * answers the same lines — so memoising it is stating that, not assuming it.
 */
const DECLARATIONS = new Map<Mode, string[]>();
function declarationsFor(mode: Mode): string[] {
  let lines = DECLARATIONS.get(mode);
  if (!lines) {
    lines = colorDeclarations(mode);
    DECLARATIONS.set(mode, lines);
  }
  return lines;
}

/** APCA's body-text target — read from the config, where the generator reads it too, and
    pinned by its own law below: shared home, standard-anchored values. */
const BODY = apcaFloors.body;

/** The floors are WCAG-anchored, not tuning knobs: a single home in color-config means the
    generator's flip gate and these laws can never drift apart — and THIS pin is what stops
    the single home from becoming a single silent lever. Changing a floor is an accessibility
    decision that must edit a law. */
it("the APCA floors are the standard's numbers", () => {
  // 45 = fine-detail non-text (the WCAG 3:1 equivalent); 30 = APCA's tier for LARGE/solid
  // non-text, added 2026-08-07 when the field family's boundary moved to it.
  expect(apcaFloors).toEqual({ body: 60, aaa: 75, nonText: 45, nonTextLarge: 30 });
});

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
        expect(s.isLowChroma).toBe(resolveTone(tones[tone]).vividness < lowChromaThreshold);
        expect(s.solid).toBe(s.isLowChroma ? s.steps[11] : s.steps[8]);
      }
    }
  });

  it("keys on vividness, not on the name — a desaturated brand accent gets the same fix", () => {
    // Rewritten 2026-08-10, the day `accent` became grey. The old spelling proved "not on the
    // name" by contrasting the configured neutral (below the threshold) with the configured
    // accent (above it) — which is a claim about what the palette happens to be, not about
    // what the generator does, and it failed the moment the palette changed. It could also
    // never have caught the defect it was written for: a branch keyed on `tone === "neutral"`
    // passes both of those assertions.
    //
    // The rule is now read off CONSTRUCTED tones — one hue, two vividness values either side
    // of the threshold, neither of them named in the config — so the law measures the
    // mechanism and holds whatever accent is set to.
    for (const mode of MODES) {
      const desaturated = buildScaleFor({ hue: 250, vividness: 0.04 }, mode);
      const chromatic = buildScaleFor({ hue: 250, vividness: 1 }, mode);
      expect(desaturated.isLowChroma).toBe(true);
      expect(desaturated.solid).toBe(desaturated.steps[11]);
      expect(chromatic.isLowChroma).toBe(false);
      expect(chromatic.solid).toBe(chromatic.steps[8]);
    }
    // And the threshold is the thing being crossed, not a coincidence of those two numbers.
    expect(0.04).toBeLessThan(lowChromaThreshold);
    expect(1).toBeGreaterThan(lowChromaThreshold);
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

describe("a brand colour goes in and a system-correct tone comes out (§7)", () => {
  // The headline claim of the section: accent is *your* colour, not one of our thirty.
  const BRANDS = {
    "radix violet": "#6E56CF",
    "vercel blue": "#0070F3",
    "linear indigo": "#5E6AD2",
    "radix red": "#E5484D",
    "radix yellow": "#FFE629",
    teal: "#00C8B4",
  } as const;

  for (const [name, hex] of Object.entries(BRANDS)) {
    it(`${name} reproduces exactly at step 9 in light mode`, () => {
      const s = buildScaleFor(toneFromColor(hex), "light");
      expect(s.steps[8]!.toLowerCase()).toBe(hex.toLowerCase());
    });

    it(`${name} still satisfies every legibility law`, () => {
      // Pinning must not buy brand fidelity at the cost of the guarantees. This is the test
      // that makes the intake a system rather than a colour picker.
      for (const mode of MODES) {
        const s = buildScaleFor(toneFromColor(hex), mode);
        for (const fill of [s.solid, s.solidHover, s.solidActive]) {
          expect(Math.abs(apcaLc(s.contrast, fill))).toBeGreaterThanOrEqual(BODY);
        }
        for (const step of [2, 3, 4]) {
          expect(Math.abs(apcaLc(s.label, s.steps[step]!))).toBeGreaterThanOrEqual(BODY);
        }
        expect(Math.abs(apcaLc(s.steps[10]!, s.steps[2]!))).toBeGreaterThanOrEqual(BODY);
      }
    });
  }

  it("keeps the shared ladder outside the solid band, whatever colour came in", () => {
    const reference = buildScale("neutral", "light");
    for (const hex of Object.values(BRANDS)) {
      const s = buildScaleFor(toneFromColor(hex), "light");
      for (const step of [0, 1, 2, 3, 4, 5, 6, 7, 10, 11]) {
        expect(Math.abs(L(s.steps[step]!) - L(reference.steps[step]!))).toBeLessThan(0.02);
      }
    }
  });

  it("dark mode re-derives rather than pinning — no promise was made about a dark solid", () => {
    const s = buildScaleFor(toneFromColor("#FFE629"), "dark");
    expect(s.steps[8]!.toLowerCase()).not.toBe("#ffe629");
  });

  it("a near-black or near-white brand colour snaps instead of producing an unusable solid", () => {
    for (const hex of ["#111111", "#fdfdfd"]) {
      const s = buildScaleFor(toneFromColor(hex), "light");
      for (const fill of [s.solid, s.solidHover, s.solidActive]) {
        expect(Math.abs(apcaLc(s.contrast, fill))).toBeGreaterThanOrEqual(BODY);
      }
    }
  });

  it("round-trips: any generated solid, fed back in, reproduces its own scale", () => {
    // The property that makes the preview usable as a picker — every step 9 on the page is a
    // hex you can paste in as your accent and get that exact scale back.
    for (const hue of [25, 80, 100, 130, 150, 195, 230, 250, 267, 290, 340]) {
      const original = buildScaleFor({ hue, vividness: 1 }, "light");
      const round = buildScaleFor(toneFromColor(original.steps[8]!), "light");
      expect(round.steps[8]).toBe(original.steps[8]);
    }
  });

  it("rejects a colour it cannot parse rather than emitting something wrong", () => {
    expect(() => toneFromColor("not-a-colour")).toThrow();
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
  const AAA = apcaFloors.aaa;

  it("clears the AAA-equivalent bar where normal only has to clear AA", () => {
    // SCOPE, stated because it used to be implied (2026-08-26, audit): this is the TEXT-BAND
    // half of the bar. The loud rung — `contrast` on `solid` — cannot reach 75 and is held to
    // `body` by the law directly below, which is where that carve-out is argued.
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

  it("holds the LOUD rung to body, because 75 is unreachable on it by construction", () => {
    // The header of `contrastHigh` said "the label pairings must clear the AAA-equivalent Lc
    // 75 rather than the AA-equivalent Lc 60, which is law-tested", without qualification —
    // and for the most prominent label pairing the system paints, a loud Button's own, that
    // sentence was false in the code AND false about the law surface. Measured at high
    // contrast: orange 60.8 light / 60.5 dark, blue and info 63.3, amber and warning 68.3,
    // destructive 70.9 / 70.3 — six of ten families under 75, every one of them byte-identical
    // to its standard-mode value, because a chromatic solid never moves. The law above could
    // not have caught it: it reads `label` against the soft steps and `steps[10]` against
    // `steps[2]`, and never touches the solid rung at all.
    //
    // The bar there is `body`, and this law pins WHY rather than just asserting the number:
    // there is nothing left to spend. The label is already whichever of black and white reads
    // harder on that fill — asserted here, from two emitted values rather than from the
    // generator's own arithmetic — and the fill is the brand colour, which "leaves a chromatic
    // solid alone" pins as untouched. Raising this pairing therefore means moving the brand,
    // which the setting refuses. §7 and `contrastHigh`'s header now say the same thing.
    let underTheAaaBar = 0;
    for (const mode of MODES) {
      for (const tone of TONES) {
        const s = buildScale(tone, mode, "srgb", "high");
        const harder =
          Math.abs(apcaLc("#ffffff", s.solid)) >= Math.abs(apcaLc("#000000", s.solid))
            ? "#ffffff"
            : "#000000";
        expect(
          s.contrast,
          `${mode}/${tone}: the loud label is not the harder of black and white on its own ` +
            `fill, so the 75 carve-out's reason does not hold`,
        ).toBe(harder);
        expect(
          Math.abs(apcaLc(s.contrast, s.solid)),
          `${mode}/${tone}: the loud label is under the body floor`,
        ).toBeGreaterThanOrEqual(BODY);
        if (Math.abs(apcaLc(s.contrast, s.solid)) < AAA) underTheAaaBar++;
      }
    }
    // And the carve-out is REAL rather than a theoretical allowance — the pattern "a band with
    // no headroom stays put, and that is the setting working" one law over. If a later change
    // ever does put every loud label over 75, this fails and sends the author back to the two
    // documents that state the carve-out, instead of leaving a dead sentence behind in both.
    expect(
      underTheAaaBar,
      "every loud label now clears AAA at high contrast — the documented carve-out is stale",
    ).toBeGreaterThan(0);
  });

  it("moves the label pairing by a visible amount, not a token gesture", () => {
    // At +7 Lc the two palettes were indistinguishable side by side, which is how a
    // high-contrast mode ends up shipping as decoration. The text band is the one place the
    // ladder structurally guarantees headroom — steps 11 and 12 sit far from either extreme —
    // so it is where the gain must show even when every other band is pinned.
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

  it("never lowers contrast anywhere — equal is allowed, worse is not", () => {
    // The claim is "as much contrast as this colour permits", not "always different". A band
    // already at its limit is right to stay put; only a regression is a failure.
    //
    // WIDENED 2026-08-26 (audit). The law was named "anywhere" and read ONE pairing — the
    // label on the soft steps — while the pairing `contrast="high"` actually moves is the
    // LABEL ON THE SOLID: the flip solve walks hover and press, and nothing here or anywhere
    // else compared those against their standard-mode twins. Measured through the generator
    // with the old bound (`apcaFloors.body`), `green` and `success` came out 74.55 -> 70.70 at
    // hover and 67.37 -> 60.35 at press, in BOTH appearances — a loud Button's press 7 Lc
    // LESS legible with the accessibility setting on, landing 0.35 above the body floor, which
    // is the only bar the neighbouring law holds it to. That is the one outcome §7 names as a
    // failure, shipped, with the suite green.
    //
    // THE FIXTURE IS HALF THE LAW. A hue whose preferred side affords the full 1.6x excursion
    // never consults the flip solve at all, so a palette of blue-class families is an input on
    // which this cannot fail whatever the generator does. The subjects therefore include
    // CONSTRUCTED cusp-parked hues that are not in the config, and the guard at the bottom
    // asserts that some subject really does travel toward its own label — so the day green
    // leaves the tone set, this law says so instead of going quietly vacuous.
    const CUSP_PARKED = {
      "neon green h150": { hue: 150, vividness: 1 },
      "lemon h100": { hue: 100, vividness: 0.95 },
      "cyan h195": { hue: 195, vividness: 1 },
    } as const;
    let towardItsLabel = 0;

    for (const mode of MODES) {
      const subjects: Array<[string, Scale, Scale]> = [
        ...TONES.map(
          (t) =>
            [t, buildScale(t, mode), buildScale(t, mode, "srgb", "high")] as [string, Scale, Scale],
        ),
        ...Object.entries(CUSP_PARKED).map(
          ([name, spec]) =>
            [name, buildScaleFor(spec, mode), buildScaleFor(spec, mode, "srgb", "high")] as [
              string,
              Scale,
              Scale,
            ],
        ),
      ];
      for (const [name, normal, high] of subjects) {
        for (const step of [2, 3, 4]) {
          expect(
            Math.abs(apcaLc(high.label, high.steps[step]!)),
            `${mode}/${name}: label on step ${step + 1} lost contrast under contrast="high"`,
          ).toBeGreaterThanOrEqual(Math.abs(apcaLc(normal.label, normal.steps[step]!)) - 0.5);
        }
        // The solid rung, per state. `contrast` is the label a loud Button paints on this fill
        // (recipes.css's `[data-emphasis="loud"]`), so this pairing is the most prominent one
        // in the system — and it is the one the flip solve moves.
        const states = ["rest", "hover", "press"] as const;
        const fills = (s: Scale) => [s.solid, s.solidHover, s.solidActive];
        fills(high).forEach((fill, i) => {
          const before = Math.abs(apcaLc(normal.contrast, fills(normal)[i]!));
          const after = Math.abs(apcaLc(high.contrast, fill));
          expect(
            after,
            `${mode}/${name}: the loud label on ${states[i]} went ${before.toFixed(2)} -> ` +
              `${after.toFixed(2)} Lc when contrast="high" was turned ON`,
          ).toBeGreaterThanOrEqual(before - 0.5);
        });
        // Vacuity guard: does this subject exercise the flip at all? "Toward the label" is
        // read off the OUTPUT — a black label with a darkening press, or a white one with a
        // lightening press — never off the generator's own direction arithmetic.
        const towards =
          (high.contrast === "#000000") === (L(high.solidActive) < L(high.solid));
        if (towards && !high.isLowChroma) towardItsLabel++;
      }
    }
    expect(
      towardItsLabel,
      "no subject travels toward its own label, so the flip solve this law guards is untested",
    ).toBeGreaterThan(0);
  });

  it("a band with no headroom stays put, and that is the setting working", () => {
    // Bright hues sit at their cusp, so the border band cannot darken without turning to mud.
    // High contrast leaves it alone and takes the gain in the text band instead. This is
    // asserted rather than merely tolerated, so nobody later "fixes" the no-op by forcing a
    // shift and reintroducing the olive.
    for (const spec of [
      { hue: 100, vividness: 1 },
      { hue: 130, vividness: 1 },
      { hue: 195, vividness: 1 },
    ]) {
      const normal = buildScaleFor(spec, "light");
      const high = buildScaleFor(spec, "light", "srgb", "high");
      expect(high.steps[6]).toBe(normal.steps[6]);
    }
  });

  it("but a band with headroom does use it", () => {
    for (const spec of [
      { hue: 250, vividness: 1 },
      { hue: 25, vividness: 1 },
    ]) {
      const normal = buildScaleFor(spec, "light");
      const high = buildScaleFor(spec, "light", "srgb", "high");
      expect(high.steps[6]).not.toBe(normal.steps[6]);
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
        const high = buildScale(tone, mode, "srgb", "high");
        expect(high.solid).toBe(normal.solid);
        // AND ITS LABEL, which is a load-bearing premise rather than a bonus (2026-08-26):
        // the flip solve's high-contrast floor is standard mode's own pairing, computed
        // inside the high pass by re-running the excursion at the resting size. That is
        // exact only because the rest fill and the label it carries do not move with the
        // setting. If either ever does, the "floor" stops being standard mode's answer and
        // silently becomes something else — so the premise is asserted where it is made.
        expect(high.contrast, `${mode}/${tone}: the loud label moved with the setting`).toBe(
          normal.contrast,
        );
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

  it("keeps the interaction spread perceptible — wider where the hue has room", () => {
    // Re-keyed 2026-08-26: the strict `>` refused every bright brand, and the setting's own
    // contract is "as much contrast as each colour permits — a band that stays put is the
    // setting working, not failing" (color-config's high-contrast header). A cusp-parked
    // yellow's HIGH solid moves toward the extreme, and at the gamut's edge its state travel
    // legitimately compresses below normal's. What must never give is DISTINGUISHABILITY:
    // the high states hold the same state floor the resting palette is held to (the
    // mud-guard's own number). Blue — a hue with room — is additionally held to the strict
    // widening, so a dead high-contrast spread mechanism still fails loudly here.
    for (const mode of MODES) {
      const high = buildScale("accent", mode, "srgb", "high");
      const spread = (s: typeof high) => Math.abs(L(s.solidActive) - L(s.solid));
      // Two state steps live inside the rest→active spread, so the floor is two of them.
      expect(spread(high)).toBeGreaterThanOrEqual(2 * 0.035);
      const blueNormal = buildScale("blue", mode);
      const blueHigh = buildScale("blue", mode, "srgb", "high");
      expect(spread(blueHigh)).toBeGreaterThan(spread(blueNormal));
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
  // De-tautologized 2026-08-06: this law used to composite against the emitter's own
  // pageBackdrop — the same value the solve consumed, so a divergence between the backdrop
  // and what the fill actually sits on was invisible by construction. The backdrop now
  // derives HERE from config's surfaceColor (the seal the ramp officially composites over,
  // decided 2026-08-06): a literal is used directly, dark's var(--neutral-2) resolves
  // through the generated scale. If the emitter's backdrop ever diverges from the seal,
  // this recomposition misses its step.
  const seal = (mode: Mode): string => {
    const rest: string = surfaceColor[mode].rest;
    if (!rest.startsWith("var(")) return rest;
    return buildScale("neutral", mode).steps[Number(rest.match(/--neutral-(\d+)/)![1]!) - 1]!;
  };
  it("every alpha value lands on its solid step over the seal it sits on", () => {
    for (const mode of MODES) {
      const backdrop = toRgb(seal(mode))!;
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

describe("the interaction ladder is monotone in the EMITTED declarations (§7, §8)", () => {
  // buildScale() agreeing with itself proves nothing here. `--tone-solid` is emitted as a
  // literal rather than var(--tone-12), so a high-contrast block that re-declares the STEPS
  // but not the ROLE leaves rest frozen while hover and active move beneath it. That shipped:
  // the neutral loud button pressed LIGHTER than it rested, and on the opposite side of hover,
  // underneath an assertion that compared two Scale objects and passed. So this law reads the
  // declaration text the generator actually emits, and applies the high block over the base
  // exactly as the cascade does.
  const declared = (lines: string[]) => {
    const map = new Map<string, string>();
    for (const line of lines) {
      const m = /^\s*(--[\w-]+):\s*(.+);$/.exec(line);
      // var() references are followed by the browser, not by us; only literals carry a value.
      if (m && !m[2]!.startsWith("var(")) map.set(m[1]!, m[2]!);
    }
    return map;
  };

  for (const mode of MODES) {
    for (const level of ["normal", "high"] as const) {
      it(`${mode}, contrast="${level}": rest -> hover -> active moves one way, every tone`, () => {
        const map = declared(declarationsFor(mode));
        if (level === "high") {
          for (const [k, v] of declared(contrastHighDeclarations(mode))) map.set(k, v);
        }
        for (const tone of TONES) {
          const trio = ["solid", "solid-hover", "solid-active"].map((role) =>
            map.get(`--${tone}-${role}`),
          );
          expect(trio.every((v) => typeof v === "string")).toBe(true);
          const [rest, hover, active] = trio.map((hex) => L(hex!));
          const direction = Math.sign(hover! - rest!);
          expect(direction).not.toBe(0);
          expect(Math.sign(active! - hover!)).toBe(direction);
        }
      });
    }
  }
});

describe("the focus ring clears its contrast floor against the page (§8, WCAG 2.4.11)", () => {
  // §8 has claimed since 2026-08-02 that this "is a law, asserted with APCA against steps 1-2
  // in both modes". It was not: --focus-ring was emitted and asserted nowhere, and the dark
  // ring had been failing the whole time — step 9 is a deep violet on a near-black page, |Lc|
  // 22.3, a focus indicator you effectively cannot see. The step is picked per mode now.
  //
  // Lc 45 is the non-text floor: below it a boundary stops reading as a boundary. Both modes
  // clear it with room (74.7 light, 66.3 dark) — the assertion is the guarantee, not the taste.
  const NON_TEXT = apcaFloors.nonText;

  for (const mode of MODES) {
    it(`holds in ${mode}, against every surface the ring can sit on`, () => {
      // THE SUBJECT IS THE EMITTED TOKEN (re-keyed 2026-08-26, when the ring learned to
      // solve): the law resolves whatever --focus-ring ships — the picked step's var() for a
      // brand whose step clears, a solved hex for a bright brand — and holds THAT to the
      // floor. Reading the pick directly would go green while the stylesheet shipped
      // something else, and would be unwritable for a solved brand at all.
      const accent = buildScale("accent", mode);
      const neutral = buildScale("neutral", mode);
      const emitted = declarationsFor(mode).find((l) => l.includes("--focus-ring:"))!;
      const value = /--focus-ring:\s*([^;]+);/.exec(emitted)![1]!.trim();
      const ring = value.startsWith("var(")
        ? value === "var(--accent-solid)"
          ? accent.solid
          : accent.steps[Number(/--accent-(\d+)/.exec(value)![1]!) - 1]!
        : value;
      // Steps 1-3: the page, the seal, and the soft fill a focused control may rest on.
      for (const step of [0, 1, 2]) {
        expect(
          Math.abs(apcaLc(ring, neutral.steps[step]!)),
          `${mode} ring vs neutral-${step + 1}`,
        ).toBeGreaterThanOrEqual(NON_TEXT);
      }
    });
  }

  it("the emission is the pick when the pick clears, and the solve only when it cannot", () => {
    // The complete spec, brand-independent (re-keyed 2026-08-26 from a blue-pinned spelling
    // that a bright brand was expected to break): whichever branch the current brand takes,
    // the OTHER branch must be the reason — a var() may ship only because the pick clears,
    // a hex only because it does not, so a third thing (or the right thing for the wrong
    // reason) fails either way.
    for (const mode of MODES) {
      const accent = buildScale("accent", mode);
      const neutral = buildScale("neutral", mode);
      const pick = mode === "dark" ? accent.steps[10]! : accent.solid;
      const pickClears = [0, 1, 2].every(
        (step) => Math.abs(apcaLc(pick, neutral.steps[step]!)) >= NON_TEXT,
      );
      const emitted = declarationsFor(mode).find((l) => l.includes("--focus-ring:"))!;
      if (pickClears) {
        expect(emitted).toContain(mode === "dark" ? "var(--accent-11)" : "var(--accent-solid)");
      } else {
        expect(emitted).toContain(solveRing(mode));
      }
    }
  });

  it("a bright brand's ring solves down the hue instead of refusing (§8, 2026-08-26)", () => {
    // Apple's own arrangement, as a mechanism: yellow cannot be a ring at its solid's
    // lightness, so the ring is the most chromatic yellow that still clears every bed. The
    // fixture is the hue that FORCED this — an input where the solved and picked answers
    // differ (the degenerate-fixture rule): for blue they coincide in effect, and a law run
    // there would prove nothing.
    const yellow = { hue: 100, vividness: 0.95 };
    for (const mode of MODES) {
      const neutral = buildScale("neutral", mode);
      const solved = solveRing(mode, "srgb", yellow);
      for (const step of [0, 1, 2]) {
        expect(
          Math.abs(apcaLc(solved, neutral.steps[step]!)),
          `${mode} solved yellow ring vs neutral-${step + 1}`,
        ).toBeGreaterThanOrEqual(NON_TEXT);
      }
    }
  });
});

describe("the soft ladder is §8's +1/+2 rule, in the emitted declarations (§7, §8)", () => {
  // ENGINEERING.md and CLAUDE.md both claim the suite asserts "hover = +1 step, press = +2".
  // Nothing read the mapping: the ladder was emitted at three lines nobody tested, so any of
  // them could be changed to any step and the whole suite stayed green. The rung's feedback
  // amount is the thing being guaranteed — that every rung moves by the SAME amount, so
  // pressing a medium button and pressing a quiet one feel like one gesture.
  // The ladder moved onto the ALPHA ramp 2026-08-17 (an opaque indexed step is priced against
  // one bed, and a dark panel one step from the page swallowed it), and it re-bases per mode:
  // light rests on a3, dark on a4. What the law guarantees is unchanged and is the reason it
  // exists — the DELTA, not the index. Rest, +1, +2, identically for every tone, so pressing a
  // medium button and pressing a quiet one stay one gesture. The resting index is pinned too,
  // or a silent re-base of the whole ladder reads as compliance.
  const softBase = { light: 3, dark: 4 } as const;

  it("soft rests on the mode's ramp step, hovers +1, presses +2, for every tone", () => {
    for (const mode of MODES) {
      const declared = declarationsFor(mode);
      const base = softBase[mode as keyof typeof softBase];
      for (const tone of TONES) {
        const at = (role: string) => declared.find((l) => l.trimStart().startsWith(`--${tone}-${role}:`));
        // `-a`, asserted explicitly: an opaque `var(--tone-3)` here satisfies every +1/+2
        // arithmetic below and is exactly the thing this move was made to stop shipping.
        expect(at("soft"), `${mode}/${tone}`).toContain(`var(--${tone}-a${base})`);
        expect(at("soft-hover"), `${mode}/${tone}`).toContain(`var(--${tone}-a${base + 1})`);
        expect(at("soft-active"), `${mode}/${tone}`).toContain(`var(--${tone}-a${base + 2})`);
        // The OPAQUE twins ride beside the trio (2026-08-19): the same rung said opaquely,
        // for the glass scopes — the material veil is color-mix(source alpha%, transparent)
        // and an alpha source multiplies through it (a glass field's 62% veil measured 4.1%,
        // audit 2026-08-18). Same indices, no `a`: by the recomposition law they are the
        // trio's own colours on the seal.
        expect(at("soft-solid"), `${mode}/${tone}`).toContain(`var(--${tone}-${base})`);
        expect(at("soft-hover-solid"), `${mode}/${tone}`).toContain(`var(--${tone}-${base + 1})`);
        expect(at("soft-active-solid"), `${mode}/${tone}`).toContain(`var(--${tone}-${base + 2})`);
      }
    }
  });

  it("and the two modes differ only in where the ladder starts — the same three-step walk", () => {
    // The per-mode base is a fact about compression at black, not a second design: if dark
    // ever grew a wider or narrower walk than light, the rungs would stop feeling like one
    // gesture across appearances and nothing above would notice.
    const walk = (mode: "light" | "dark") => {
      const declared = declarationsFor(mode);
      const step = (role: string) =>
        Number(/-a(\d+)\)/.exec(declared.find((l) => l.trimStart().startsWith(`--accent-${role}:`))!)![1]);
      return [step("soft"), step("soft-hover"), step("soft-active")];
    };
    const [light, dark] = [walk("light"), walk("dark")];
    expect(dark.map((n, i) => n - light[i]!), "the modes drifted apart mid-ladder").toEqual([1, 1, 1]);
  });
});

describe("the control edge renders its stated targets, and the floors bind under high contrast (§5, §7, WCAG 1.4.11)", () => {
  // D2's law, rewritten twice the same day. First for the SOLVED edge: the step-picked
  // version guaranteed a floor and nothing else, and dark's ladder made that a trap — the
  // first passing rung sat at Lc 66.5, a resting ring Kushagra read, correctly, as a
  // high-contrast value. Then for the MODE SPLIT (Kushagra: "taste over APCA rules in
  // standard"): the normal-mode assertions below are DRIFT checks — the emitted hex must be
  // the config's stated taste value, floor and ceiling around the target, so neither the
  // solve nor a hand edit can move the rendered edge away from the stated number. They are
  // not a conformance guarantee; that lives in the high-contrast law, where the floors bind.
  // Both directions read the EMITTED hex, so the solve is in the loop.
  const hexOf = (mode: (typeof MODES)[number], name: string) => {
    const line = declarationsFor(mode).find((l) => l.includes(`--${name}:`))!;
    return line.match(/#[0-9a-fA-F]{6}/)![0];
  };
  /**
   * The beds, derived HERE from config rather than borrowed from the solver — the alpha ramp's
   * own de-tautologization. A `var(--neutral-N)` resolves through the generated scale, a
   * literal is used as-is, so if the solver's idea of a bed ever diverges from what the system
   * paints, these laws miss their targets instead of agreeing with the divergence.
   */
  const bedsFor = (mode: (typeof MODES)[number]) => {
    const neutral = buildScale("neutral", mode);
    const resolve = (value: string) =>
      value.startsWith("var(")
        ? neutral.steps[Number(value.match(/--neutral-(\d+)/)![1]!) - 1]!
        : value;
    return {
      // FROM `pageColor`, NOT rung 1 (2026-08-28). This read `neutral.steps[0]` — true of both
      // modes until 2026-08-25, when light's page took the seal's own pure white and dark's
      // stayed on the rung. Nothing failed, because the two values are 0.013 apart and every
      // floor here cleared on either: the solve had simply been measuring its edges against a
      // page the site does not paint. Surfaced by moving the GROUND onto rung 1, which made
      // this law's page and its ground the same string and fired the assertion below.
      //
      // Read through the config's own export so a third mode, or another move of the page,
      // cannot leave this behind again.
      page: resolve(pageColor[mode]),
      seal: resolve(surfaceColor[mode].rest),
      ground: resolve(groundColor[mode]),
    };
  };
  const FAMILIES = [
    { role: "control-edge", lc: controlEdgeLc.mark },
    // One tier down for the field family (2026-08-07): a field is a LARGE element, and the
    // guidance holds large non-text to 30 where fine detail owes 45.
    { role: "field-edge", lc: controlEdgeLc.field },
  ] as const;

  for (const mode of MODES) {
    for (const { role, lc } of FAMILIES) {
      it(`${mode}/${role}: renders the stated taste value against both beds — floor AND ceiling`, () => {
        // TWO beds, deliberately, and it is the split that says so: a resting edge is DRESS,
        // held to no floor, and these two are the surfaces it was judged on. The ground is
        // not among them because adding it would MOVE a value taste owns (2026-08-26 audit —
        // where the ground lands at rest is printed by the advisory dress report instead).
        const { page, seal } = bedsFor(mode);
        const edge = hexOf(mode, role);
        const worst = Math.min(...[seal, page].map((sf) => Math.abs(apcaLc(edge, sf))));
        expect(worst, `${mode} ${role} under its stated target`).toBeGreaterThanOrEqual(lc.normal[mode]);
        expect(worst, `${mode} ${role} overshoots — the solve regressed to a pick`).toBeLessThanOrEqual(
          lc.normal[mode] + 4,
        );
      });

      it(`${mode}/${role}: the high-contrast variant clears its tier on EVERY bed the system paints`, () => {
        // THREE beds since 2026-08-26 (audit), and the third is the finding. `--color-ground`
        // was minted 2026-08-20 as a paintable bed — `.kui-surface.kui-ground` fills with it,
        // and `<Surface>` holding a `<TextField>` is a composition the preview already ships —
        // and it was never added to the search. Measured: light's high-contrast field edge
        // `#a6a5aa` sat at |Lc| 43.37 on a ground against `apcaFloors.nonText`, the floor this
        // setting is DEFINED to bind to, while measuring 48.15 on the seal and 46.35 on the
        // page. So the miss was invisible to every check in the package, because every check —
        // this one included — read the two beds the solve already knew.
        const beds = bedsFor(mode);
        const edge = contrastHighDeclarations(mode)
          .find((l) => l.includes(`--${role}:`))!
          .match(/#[0-9a-fA-F]{6}/)![0];
        for (const [name, bed] of Object.entries(beds)) {
          expect(
            Math.abs(apcaLc(edge, bed)),
            `${mode} ${role} ${edge} misses its high-contrast tier on the ${name} (${bed})`,
          ).toBeGreaterThanOrEqual(lc.high);
        }
        const worst = Math.min(...Object.values(beds).map((bed) => Math.abs(apcaLc(edge, bed))));
        expect(worst, `${mode} ${role} overshoots — the solve regressed to a pick`).toBeLessThanOrEqual(
          lc.high + 4,
        );
        // Conformance, stated as itself rather than inferred from the tier: `high` is the
        // surface WCAG 1.4.11 is answered on, so the emitted edge clears the non-text floor
        // on every bed even if a later eye pass moves the tier numbers around.
        expect(worst).toBeGreaterThanOrEqual(apcaFloors.nonText);
      });
    }
  }

  it("the ground is a bed of its own, so the three-bed law above is not three copies of one", () => {
    // The calibration arm. If `--color-ground` ever collapsed onto the page or the seal, the
    // law above would keep passing while measuring two beds under three names — the
    // degenerate-fixture failure, arriving by a config edit rather than by a test edit. In
    // LIGHT the ground is the HARDEST of the three (it is a step off the page, and every
    // solved edge is darker than all three beds), which is exactly why it binds there and why
    // the finding was a light-mode one; in dark it sits between the page and the seal and
    // legitimately never binds, so only light is asserted.
    const { page, seal, ground } = bedsFor("light");
    expect(ground).not.toBe(page);
    expect(ground).not.toBe(seal);
    const edge = contrastHighDeclarations("light")
      .find((l) => l.includes("--field-edge:"))!
      .match(/#[0-9a-fA-F]{6}/)![0];
    const on = (bed: string) => Math.abs(apcaLc(edge, bed));
    expect(
      on(ground),
      "the ground is no longer the hardest light bed, so the three-bed law may be vacuous",
    ).toBeLessThan(Math.min(on(page), on(seal)));
  });

  it("the floors bind the HIGH targets; the normal targets are taste (the 2026-08-07 mode split)", () => {
    // Kushagra: "APCA rule checks for high contrast mode, taste over APCA rules in
    // standard" — scope, borders and fills. So the anchor law moved: nothing here holds a
    // normal target to a floor (the eye pass may move it anywhere), and contrast="high" is
    // the conformance surface, so ITS targets are the anchored ones. Every family's high
    // answer clears the fine-detail floor, and steps up from its own resting value so the
    // setting always does something.
    expect(controlEdgeLc.mark.high).toBeGreaterThanOrEqual(apcaFloors.nonText);
    expect(controlEdgeLc.field.high).toBeGreaterThanOrEqual(apcaFloors.nonText);
    for (const mode of MODES) {
      expect(controlEdgeLc.mark.high).toBeGreaterThan(controlEdgeLc.mark.normal[mode]);
      expect(controlEdgeLc.field.high).toBeGreaterThan(controlEdgeLc.field.normal[mode]);
    }
  });

  it("dark rests softer than light — the taste decision, not an accident (2026-08-07)", () => {
    // Equal Lc across modes renders a heavier line in dark (a mid-grey glows on a dark
    // bed), so dark's resting targets sit under light's by decision. Direction only —
    // the values themselves are taste and the eye pass moves them freely.
    expect(controlEdgeLc.mark.normal.dark).toBeLessThan(controlEdgeLc.mark.normal.light);
    expect(controlEdgeLc.field.normal.dark).toBeLessThan(controlEdgeLc.field.normal.light);
  });});

describe("the ink ladder renders its stated targets, in every family and both modes (§15)", () => {
  // THE law for the 2026-08-10 rewrite. The rungs used to be picked — neutral took steps
  // 12/11/10, every chroma family faded a fixed 74%/52% — so nothing in the system knew what
  // contrast any of them landed on, and measured, they landed all over: light ran 103/78/65
  // (a 26-point gap then a 13-point one) while dark ran 94/67/36.
  //
  // Read through the EMITTED declaration, never the config: the percentage is solved, so a
  // law that recomputed it from `inkLc` would agree with any solver, including a broken one.
  // Composited by hand in sRGB because that is what the browser does with an alpha — a
  // `color-mix(…, transparent)` IS an alpha, and reading the mix as an oklab interpolation is
  // the mistake that would make every number here plausible and wrong.
  const chan = (hex: string) =>
    [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
  const over = (ink: string, bed: string, a: number) => {
    const [ir, ig, ib] = chan(ink);
    const [br, bg, bb] = chan(bed);
    const m = (i: number, b: number) => Math.round(i * a + b * (1 - a));
    return `#${[m(ir, br), m(ig, bg), m(ib, bb)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;
  };
  const fadeOf = (mode: Mode, tone: ToneName, slot: "muted" | "faint") => {
    const line = declarationsFor(mode).find((l) => l.includes(`--${tone}-ink-${slot}:`))!;
    const m = line.match(/var\(--[\w-]+\)\s+(\d+)%/);
    expect(m, `${tone}-ink-${slot} is not a solved fade: ${line}`).toBeTruthy();
    return Number(m![1]) / 100;
  };

  for (const mode of MODES) {
    for (const tone of TONES) {
      it(`${mode}/${tone}: muted and faint land on their targets against both beds`, () => {
        const scale = buildScale(tone, mode);
        // Neutral's loud is step 12 (a gray scale has twelve grays); a chroma family's is 11,
        // its one designed text colour. Derived from the same rule the emitter uses, so a
        // family that changed its loud step fails here rather than being silently re-measured.
        const ink = scale.steps[(tone === "neutral" ? 12 : 11) - 1]!;
        const neutral = buildScale("neutral", mode);
        const beds = [mode === "dark" ? neutral.steps[1]! : "#ffffff", neutral.steps[0]!];
        for (const [slot, target] of [
          ["muted", inkLc.muted],
          ["faint", inkLc.faint],
        ] as const) {
          const a = fadeOf(mode, tone, slot);
          const worst = Math.min(...beds.map((bed) => Math.abs(apcaLc(over(ink, bed, a), bed))));
          expect(worst, `${tone} ${slot} sits under its target`).toBeGreaterThanOrEqual(target);
          // The ceiling is what makes this a target rather than a floor: a fade rounded up
          // too far, or a rung quietly restored to a picked step, overshoots and fails here.
          expect(worst, `${tone} ${slot} overshoots — the solve regressed to a pick`).toBeLessThanOrEqual(
            target + 4,
          );
        }
      });
    }

    it(`${mode}: loud is NOT solved — it stays the family's own designed text colour`, () => {
      // Kushagra's call, 2026-08-10, and the law exists because the obvious "finish the job"
      // edit is to solve all three. Loud is the accessible resting state for reading; putting
      // the system's most-used ink at the mercy of a target number is the change this refuses.
      for (const tone of TONES) {
        const step = tone === "neutral" ? 12 : 11;
        const line = declarationsFor(mode).find((l) => l.includes(`--${tone}-ink:`))!;
        expect(line, `${tone}'s loud ink is not the designed step`).toContain(
          `var(--${tone}-${step})`,
        );
        expect(line, `${tone}'s loud ink was faded`).not.toContain("color-mix");
      }
    });
  }

  // An explicit timeout, because this law RUNS THE SOLVER — twenty ink solves (2 modes × 10
  // tones via colorDeclarations) — and sits at ~5s of honest compute on a slow container,
  // exactly where the 5s default cuts it off (measured 2026-08-16: 5.05–5.09s across three
  // runs on a CI sandbox, passing everywhere faster). A law that measures compute may not
  // assume a fast machine; the number is headroom, not a target.
  it("no family is an exception — every ink rung reaches its value the same way", { timeout: 20_000 }, () => {
    // The shape the rewrite was FOR. Neutral used to take designed steps while the chroma
    // families faded, which is how one family's ladder came to answer a different question
    // from the others'. If neutral ever goes back to picking rungs, this is the law that says
    // so, and it says it about the mechanism rather than about a measured number.
    for (const mode of MODES) {
      for (const tone of TONES) {
        for (const slot of ["muted", "faint"] as const) {
          const line = declarationsFor(mode).find((l) => l.includes(`--${tone}-ink-${slot}:`))!;
          expect(line, `${mode}/${tone} ${slot} is not a fade of its own ink`).toMatch(
            new RegExp(`color-mix\\(in oklab, var\\(--${tone}-\\d+\\) \\d+%, transparent\\)`),
          );
        }
      }
    }
  });

  it("the tone-less text roles ARE neutral's inks, referenced rather than restated", () => {
    // The second home this rewrite closed: `--color-text*` used to spell neutral's steps a
    // second time, which is exactly how it would have kept the old picked ladder while every
    // family moved. A law rather than a comment, because the restatement is one edit away.
    const css = emitted;
    for (const [role, ink] of [
      ["color-text", "neutral-ink"],
      ["color-text-muted", "neutral-ink-muted"],
      ["color-text-faint", "neutral-ink-faint"],
    ]) {
      expect(css, `${role} restates a value it should reference`).toContain(
        `--${role}: var(--${ink});`,
      );
    }
    // And the caption role is GONE (deleted the same day): its two consumers were group
    // labels, which is what muted is now for, and an emitted ink nothing reads is the
    // font-weight-bold mistake one axis over.
    expect(css, "the caption ink came back with no consumer").not.toContain("--color-text-caption");
  });
});

describe("the standard-mode dress report — measured to know, never to validate (§5, §7)", () => {
  // The mode split's second clause (Kushagra, 2026-08-07: "we still run checks, but not to
  // validate, but to catch how off we are, its always good to know"). Standard mode's resting
  // borders and fills are taste, so nothing here can fail on a contrast number — but every
  // run prints where each one sits, on BOTH meters, because the meters disagree exactly where
  // this palette works (light greys on white: the solved ring clears APCA 46 while measuring
  // 2.44:1 in WCAG 2 terms). A slide toward invisible should be visible in the test output
  // the day it happens, not discovered in a preview argument later. The only assertions are
  // that every measurement is a real number — a row that stops measuring is a bug, a row
  // that measures low is information.
  const wcagRatio = (a: string, b: string) => {
    const lum = (hex: string) => {
      const { r, g, b: bl } = toRgb(hex)!;
      const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bl);
    };
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi! + 0.05) / (lo! + 0.05);
  };

  for (const mode of MODES) {
    it(`prints where ${mode}'s resting dress sits against the tiers`, () => {
      const neutral = buildScale("neutral", mode);
      const step = (n: number) => neutral.steps[n - 1]!;
      const page = step(1);
      const seal = mode === "dark" ? step(2) : "#ffffff";
      // The GROUND joins the report's bed set 2026-08-26 (audit). The resting edges are solved
      // against the page and the seal — deliberately, because a resting value is dress and
      // adding a bed to that solve would MOVE it — but `--color-ground` is a third surface the
      // system paints (`.kui-surface.kui-ground`), and where the edge lands on it is exactly
      // the kind of thing this report exists to keep visible rather than to fail on. It was
      // the invisible half of the conformance miss the high-contrast law now catches.
      const ground = groundColor[mode].startsWith("var(")
        ? step(Number(groundColor[mode].match(/--neutral-(\d+)/)![1]!))
        : groundColor[mode];
      const emitted = (name: string) =>
        declarationsFor(mode)
          .find((l) => l.includes(`--${name}:`))!
          .match(/#[0-9a-fA-F]{6}/)![0];
      /**
       * A role whose emitted value is a REFERENCE rather than a literal, resolved one hop.
       *
       * The two value-control roles point at the palette instead of carrying a hex, so
       * `emitted()` — which reads the hex out of the declaration — throws on them. Resolving
       * from the generator's own output keeps the report honest: re-point `--color-track` at
       * a different step and this follows, where a hard-coded step would keep printing the
       * old one and the report would quietly describe a palette that is no longer shipped.
       */
      const role = (name: string, over: string): string => {
        const declared = (n: string) =>
          declarationsFor(mode)
            .find((l) => l.includes(`--${n}:`))!
            .split(":")
            .slice(1)
            .join(":")
            .replace(";", "")
            .trim();
        const value = declared(name);
        const hex = value.match(/#[0-9a-fA-F]{6}/);
        if (hex) return hex[0];
        const neutral = value.match(/var\(--neutral-(\d+)\)/);
        if (neutral) return step(Number(neutral[1]));
        if (value === "var(--color-surface)") return seal;
        // The ALPHA ramp (2026-08-17): the well left the opaque steps, so a role can now point
        // at a translucent value and there is no hex to read. Composite it over the bed the
        // caller says it sits on — which is what the ramp MEANS, and the only resolution that
        // keeps this report measuring the colour a person actually sees. Throwing instead
        // (the first behaviour) took the report offline the day the well moved: two laws that
        // print rather than assert, dark for the one axis the report exists to watch.
        const ramp = value.match(/var\(--neutral-(a\d+)\)/);
        if (ramp) {
          const mix = /color-mix\(in srgb,\s*(#[0-9a-fA-F]{6})\s*([\d.]+)%/.exec(
            declared(`neutral-${ramp[1]}`),
          );
          if (!mix) throw new Error(`the dress report cannot read the ramp step --neutral-${ramp[1]}`);
          const [fg, bg, a] = [toRgb(mix[1]!)!, toRgb(over)!, Number(mix[2]) / 100];
          const channel = (f: number, b: number) =>
            Math.round((f * a + b * (1 - a)) * 255)
              .toString(16)
              .padStart(2, "0");
          return `#${channel(fg.r, bg.r)}${channel(fg.g, bg.g)}${channel(fg.b, bg.b)}`;
        }
        throw new Error(`the dress report cannot resolve --${name}: ${value}`);
      };
      // Resolved once, in dependency order: the well sits on the page, the grip sits on the well.
      const well = role("color-track", page);
      const grip = role("color-thumb", well);
      const d = dress[mode];

      // Each row: the colour, what it is measured against, and the advisory tier that gives
      // the number a scale — 45 fine detail, 30 large non-text, 15 bare discernibility.
      const rows: Array<[label: string, fg: string, bg: string, tier: number]> = [
        ...(["control-edge", "field-edge"] as const).flatMap((edge) => {
          const hex = emitted(edge);
          const tier = edge === "control-edge" ? apcaFloors.nonText : apcaFloors.nonTextLarge;
          const beds = { seal, page, ground };
          const worstBed = Object.entries(beds).sort(
            (a, b) => Math.abs(apcaLc(hex, a[1])) - Math.abs(apcaLc(hex, b[1])),
          )[0]!;
          return [
            [`${edge} vs worst bed (${worstBed[0]})`, hex, worstBed[1], tier],
            // Printed separately as well as through "worst": which bed is hardest changes
            // per mode, and a row that only ever names the winner hides the losers.
            [`${edge} vs ground`, hex, ground, tier],
          ] as Array<[string, string, string, number]>;
        }),
        // The surface rows died with surfaceLook (2026-08-20): the dress table no longer has
        // a surface family — a card rests on the seal, measured everywhere else.
        ["dress field edge vs its fill", step(d.field.edge), step(d.field.fill), 15],
        ["dress field fill vs seal", step(d.field.fill), seal, 15],
        ["dress mark edge vs its fill", step(d.mark.edge), step(d.mark.fill), 15],
        ["dress mark fill vs seal", step(d.mark.fill), seal, 15],
        // The value-control family's two roles, added 2026-08-08. They were the faintest
        // resting dress in the system and the report named neither — which is how an OFF
        // switch (a control made ENTIRELY of the well, with the grip as its only other
        // surface) shipped at ~1.2:1 against the page in light with a white grip on it. The
        // rows are advisory like the rest; what makes them matter is that these two are the
        // only resting colours a whole control can consist of, so "a well is subtle by
        // design" stops being a complete answer the moment nothing else is painted.
        ["well vs page", well, page, 15],
        ["grip vs well", grip, well, 15],
      ];

      for (const [label, fg, bg, tier] of rows) {
        const lc = Math.abs(apcaLc(fg, bg));
        const ratio = wcagRatio(fg, bg);
        expect(Number.isFinite(lc), label).toBe(true);
        expect(Number.isFinite(ratio), label).toBe(true);
        const delta = lc - tier;
        // The APCA implementation clamps |Lc| < 10 to 0 — say so, or the report re-creates
        // the "it's zero????" confusion the 2026-08-07 LOG entry records.
        const lcText =
          lc === 0 && fg !== bg
            ? `Lc <10 (clamped; tier ${tier})`
            : `Lc ${lc.toFixed(1)} (tier ${tier}, ${delta >= 0 ? "+" : ""}${delta.toFixed(1)})`;
        // process.stdout directly: the runner intercepts console.* and drops it for passing
        // tests, and a report that only prints on failure is a report that never prints.
        process.stdout.write(`[dress ${mode}] ${label}: ${fg} — ${lcText} | wcag ${ratio.toFixed(2)}:1\n`);
      }
    });
  }
});

describe("the invalid edge clears the non-text floor, in both modes (§8, WCAG 1.4.11)", () => {
  // The shipped invalid border was --destructive-border, i.e. step 7 — and step 7 shares its
  // lightness with every other tone BY LAW (the shared-ladder test at the top of this file).
  // So the entire validity signal was a hue rotation at CONSTANT LUMINANCE: measured against
  // the field's own fill, 22.8 -> 23.9 Lc in light, and 10.3 -> 9.8 in dark, i.e. going invalid
  // made the border FAINTER than the resting one it replaced. At constant luminance it is also
  // close to invisible to a red-green colourblind user. No law covered it; this is that law.
  const NON_TEXT = apcaFloors.nonText;

  for (const mode of MODES) {
    it(`holds in ${mode}, against the field fill and the page`, () => {
      const destructive = buildScale("destructive", mode);
      const neutral = buildScale("neutral", mode);
      const edge = mode === "dark" ? destructive.steps[10]! : destructive.solid;
      // --color-surface is the field's fill: white in light, neutral-2 in dark.
      const surfaces = [mode === "dark" ? neutral.steps[1]! : "#ffffff", neutral.steps[0]!];
      for (const surface of surfaces) {
        expect(Math.abs(apcaLc(edge, surface)), `${mode} invalid edge vs ${surface}`).toBeGreaterThanOrEqual(
          NON_TEXT,
        );
      }
      // And it must be a real step up from the resting border, not a hue swap at equal weight.
      const resting = neutral.steps[6]!;
      const restingLc = Math.abs(apcaLc(resting, surfaces[0]!));
      expect(Math.abs(apcaLc(edge, surfaces[0]!))).toBeGreaterThan(restingLc * 2);
    });
  }

  it("and the emitted token is the step the law just checked", () => {
    for (const mode of MODES) {
      const emitted = declarationsFor(mode).find((l) => l.includes("--invalid-edge:"));
      expect(emitted).toContain(mode === "dark" ? "var(--destructive-11)" : "var(--destructive-solid)");
    }
  });
});


/**
 * THE GLYPH (§7, §11, 2026-08-23) — the family's own colour, placed where a small mark is
 * visible on this mode's page.
 *
 * The role exists because the two obvious candidates both fail, and BOTH failures are pinned
 * below rather than described. The SOLID misses the non-text floor on the dark page, so a
 * mark cannot wear the fill. The INK clears it everywhere and is therefore the tempting
 * answer — "just use the ink" was my own first proposal — but it is solved for READING, and
 * meeting a higher bar costs saturation, so an accent icon in the ink is a muted navy rather
 * than the colour somebody chose.
 */
describe("the glyph clears the floor a small mark owes, at the family's own chroma", () => {
  const chromaOf = (hex: string) => toOklch(hex)!.c ?? 0;

  for (const mode of MODES) {
    it(`${mode}: every family's glyph clears the non-text floor on BOTH beds`, () => {
      const page = buildScaleFor(resolveTone(tones.neutral), mode, "srgb").steps[0]!;
      const seal = alphaBackdrop(mode);
      for (const tone of TONES) {
        const { glyph } = buildScale(tone, mode);
        for (const [bed, name] of [[page, "page"], [seal, "seal"]] as const) {
          expect(
            Math.abs(apcaLc(glyph, bed)),
            `${tone}'s glyph on the ${name}`,
          ).toBeGreaterThanOrEqual(apcaFloors.nonText);
        }
      }
    });

    it(`${mode}: it is the FAMILY, not a value that merely clears the floor`, () => {
      // The guard that stops the law above being satisfied by black. A solve that returned
      // the darkest thing available would pass every contrast assertion in this file and
      // would be useless — so the glyph is held to most of the chroma the hue can hold at its
      // own cusp, which is the property the role is FOR.
      for (const tone of TONES) {
        const t = resolveTone(tones[tone]);
        if (t.vividness < lowChromaThreshold) continue; // a grey has no chroma to keep
        const { glyph, steps } = buildScale(tone, mode);
        expect(chromaOf(glyph), `${tone}'s glyph went grey`).toBeGreaterThan(0.05);
        // And more chromatic than the ink, which is the entire reason it is not the ink.
        expect(chromaOf(glyph), `${tone}'s glyph is no more vivid than its ink`).toBeGreaterThan(
          chromaOf(steps[10]!),
        );
      }
    });
  }

  it("a GREY takes its ink, because the solve is answering the wrong question there", () => {
    // `solveGlyph` maximises chroma at the minimum legible contrast. For a colour that is the
    // point — the most saturated blue a person can still see. For a grey there is no chroma
    // to maximise, so the same solve returns the PALEST legible grey: `--neutral-glyph` was
    // emitted at #8f9397 against an ink of #1f1f20 before this remap, and the first plain row
    // to read the role would have rendered a washed-out icon.
    //
    // Keyed on CHROMA, not on the name "neutral" (§7's requirement, and `--accent-solid`'s own
    // remap one role over), so a consumer's desaturated brand gets the same correction.
    for (const tone of TONES) {
      const t = resolveTone(tones[tone]);
      if (t.vividness >= lowChromaThreshold) continue;
      for (const mode of MODES) {
        const { glyph, steps } = buildScale(tone, mode);
        expect(glyph, `${tone}/${mode}: a grey's glyph is not its ink`).toBe(steps[11]!);
      }
    }
    // The remap is REACHED — a threshold nothing falls under is a branch that never runs, and
    // this law would pass on a tone set with no greys in it at all.
    expect(
      TONES.filter((t) => resolveTone(tones[t]).vividness < lowChromaThreshold),
      "no shipped family is low-chroma, so the remap above tested nothing",
    ).not.toHaveLength(0);
  });

  it("the SOLID is what fails — the measurement the role was minted for", () => {
    /**
     * THE INPUT MATTERS AS MUCH AS THE OUTPUT (2026-08-20). Every assertion above is a floor,
     * and a floor law passes on a system that never had a problem — so this law measures the
     * thing that was BROKEN and asserts it is still broken, which is what makes the others
     * mean something. If the solid ever starts clearing the non-text floor everywhere, the
     * glyph role has become redundant and somebody should find out here rather than never.
     *
     * Dark is where it bites for our own blue (|Lc| 43.4 against a floor of 45), and the
     * general case is worse: a brand yellow, green or pale pink measures 19, 27 and 23 as a
     * light-mode icon. No single hex is legible on both white and black, which is why a fill
     * can never be a glyph — a property of colour, not of this palette.
     */
    const misses: string[] = [];
    for (const mode of MODES) {
      const page = buildScaleFor(resolveTone(tones.neutral), mode, "srgb").steps[0]!;
      for (const tone of TONES) {
        const { solid } = buildScale(tone, mode);
        if (Math.abs(apcaLc(solid, page)) < apcaFloors.nonText) misses.push(`${tone}/${mode}`);
      }
    }
    expect(misses, "no shipped solid misses the glyph floor any more").not.toHaveLength(0);
    // Anchored on the DATA family, not the brand (re-keyed 2026-08-26): `accent/dark` was
    // the forcing case only while accent ≡ blue — a bright brand's dark solid CLEARS the
    // floor, and pinning the brand here made re-branding fail a law about the glyph role's
    // reason to exist. Blue is a closed-set family and misses at |Lc| 43.4 regardless of
    // what the brand is.
    expect(misses, "blue's dark solid is the stable forcing case").toContain("blue/dark");
  });

  it("and the emitted role carries it — accent included, because a glyph is PLACED not faded", () => {
    for (const mode of MODES) {
      const lines = declarationsFor(mode);
      for (const tone of TONES) {
        const { glyph } = buildScale(tone, mode);
        expect(lines, `--${tone}-glyph`).toContain(`  --${tone}-glyph: ${glyph};`);
      }
    }
    // The indirection hands accent its OWN glyph rather than neutral's: chroma is held at the
    // family's maximum and only lightness moves, which is exactly what `undilutedTones`
    // permits. A glyph in neutral would be the doctrine misread as "accent appears less".
    expect(emitted).toContain("--tone-glyph: var(--accent-glyph);");
  });
});

describe("the generator ships no dead exports (ENGINEERING §7's entropy audit)", () => {
  // `buildAllScales` sat here unreferenced with a JSDoc reading "the unit the emitter and the
  // law tests both consume" — a dead export AND a false factual claim about who consumes it.
  // Both named consumers exist and neither used it: `generate.ts` imports `colorDeclarations`
  // and `contrastHighDeclarations`, and this file imports `buildScale`/`buildScaleFor` and
  // re-derives the per-tone loop by hand at a dozen call sites. So the comment asserted an
  // agreement between two implementations that did not exist, which is the claimed-versus-
  // actual class at comment scope, and `tsc` cannot see it: an unused EXPORT is not an unused
  // local. Nothing else could see it either — `color.ts` is not re-exported from `index.ts`,
  // so the symbol never even reached `dist`.
  //
  // RUNTIME exports only. A type in an exported signature has to be exported whether or not
  // anything names it, so including types would make this law noise; `Gamut`, `ContrastLevel`,
  // `ToneSpec` and `ToneInput` are all in that position today.
  const here = dirname(fileURLToPath(import.meta.url));
  const src = join(here, "..");
  const source = readFileSync(join(here, "color.ts"), "utf8");
  const exported = [...source.matchAll(/^export (?:function|const) (\w+)/gm)].map((m) => m[1]!);

  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return /\.tsx?$/.test(entry.name) && full !== join(here, "color.ts") ? [full] : [];
    });
  // COMMENTS ARE STRIPPED, and that is not tidiness — the first spelling of this law PASSED
  // its own sabotage run (`buildAllScales` re-added, suite green), because the paragraph you
  // are reading names the symbol and the walk reads this very file. `test/stylesheets.ts`
  // records the same lesson for the CSS laws: "two laws learned to strip comments so they
  // stop firing on their own documentation". Stripping can only REMOVE text, so it can only
  // make this law stricter, never blind it.
  const code = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
  const elsewhere = walk(src).map((f) => code(readFileSync(f, "utf8")));

  const usesOf = (name: string) =>
    elsewhere.filter((text) => new RegExp(`\\b${name}\\b`).test(text)).length;

  it("every runtime export of color.ts has a consumer somewhere in src", () => {
    // Calibration first: a walk that found nothing would satisfy nothing, and a law whose
    // corpus is empty passes for the wrong reason.
    expect(elsewhere.length, "the source walk found no files — the corpus is empty").toBeGreaterThan(50);
    expect(usesOf("buildScale"), "the walk cannot see a known-live export").toBeGreaterThan(0);
    expect(exported.length, "no runtime exports were parsed out of color.ts").toBeGreaterThan(5);

    const dead = exported.filter((name) => usesOf(name) === 0);
    expect(dead, `dead export(s) in color.ts: ${dead.join(", ")}`).toEqual([]);
  });
});

/**
 * The P3 block is the largest thing in the artifact after the component rules, and until
 * 2026-09-01 every channel in it carried a fourth decimal no display can resolve. The claim
 * the change makes is a BOUND, not "nothing moved", so the law states the bound.
 */
describe("the P3 block spends no digit a display can show (§7, 2026-09-01)", () => {
  const generated = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "tokens.css"), "utf8");

  /**
   * A DRIFT law, and its reach is narrower than it looks: it reads the same constant the
   * generator writes from, so raising `p3Decimals` moves the law with it and this arm stays
   * green. What it catches is the artifact disagreeing with the generator — a hand-edited or
   * stale `tokens.css` — which is falsified by editing one channel in the committed file.
   * Spending the digits again is caught by the BUDGET gate, not here: the file grows and the
   * regression ratchet fails. Two mechanisms, one for each way this can go wrong.
   */
  it("every emitted channel carries at most `p3Decimals` decimals", () => {
    const channels = [...generated.matchAll(/color\(display-p3([^)]*)\)/g)].flatMap((m) =>
      m[1].trim().split(/\s+/),
    );
    // Calibration: a corpus of nothing satisfies any negative assertion.
    expect(channels.length, "no display-p3 channels found — this law reads nothing").toBeGreaterThan(500);

    const tooFine = channels.filter((c) => (c.split(".")[1] ?? "").length > p3Decimals);
    expect(tooFine.slice(0, 8), `${tooFine.length} channels finer than ${p3Decimals} decimals`).toEqual([]);
  });

  it("that precision cannot move an 8-bit code, which is what makes it not a visual change", () => {
    // The rounding error is half the emitted quantum. It has to stay under half an 8-bit
    // step or a channel could land on a different code and the claim would be false.
    // At 3 decimals: 5e-4 against 1.96e-3. At 2 it would be 5e-3, and this fails.
    expect(0.5 * 10 ** -p3Decimals).toBeLessThan(0.5 * (1 / 255));
  });
});
