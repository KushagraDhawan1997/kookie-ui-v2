/**
 * Law tests for the colour layer (§7). These assert the guarantees the generator is supposed
 * to provide — the shared ladder, APCA legibility, the low-chroma remap, the alpha ramp's
 * arithmetic — never specific hex values. A hex here would be a snapshot in disguise.
 */
import { converter, formatHex } from "culori";
import { describe, expect, it } from "vitest";

import { lightness, lowChromaThreshold, tones, type Mode, type ToneName } from "./color-config.ts";
import {
  apcaLc,
  buildScale,
  buildScaleFor,
  colorDeclarations,
  contrastHighDeclarations,
  cuspLightness,
  pageBackdrop,
  resolveTone,
  toneFromColor,
} from "./color.ts";

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
        expect(s.isLowChroma).toBe(resolveTone(tones[tone]).vividness < lowChromaThreshold);
        expect(s.solid).toBe(s.isLowChroma ? s.steps[11] : s.steps[8]);
      }
    }
  });

  it("keys on vividness, not on the name — a desaturated brand accent gets the same fix", () => {
    expect(resolveTone(tones.neutral).vividness).toBeLessThan(lowChromaThreshold);
    expect(resolveTone(tones.accent).vividness).toBeGreaterThan(lowChromaThreshold);
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
    for (const mode of MODES) {
      for (const tone of TONES) {
        const normal = buildScale(tone, mode);
        const high = buildScale(tone, mode, "srgb", "high");
        for (const step of [2, 3, 4]) {
          expect(Math.abs(apcaLc(high.label, high.steps[step]!))).toBeGreaterThanOrEqual(
            Math.abs(apcaLc(normal.label, normal.steps[step]!)) - 0.5,
          );
        }
      }
    }
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
        const map = declared(colorDeclarations(mode));
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
  const NON_TEXT = 45;

  for (const mode of MODES) {
    it(`holds in ${mode}, against every surface the ring can sit on`, () => {
      const accent = buildScale("accent", mode);
      const neutral = buildScale("neutral", mode);
      const ring = mode === "dark" ? accent.steps[10]! : accent.solid;
      // Steps 1-3: the page, the seal, and the soft fill a focused control may rest on.
      for (const step of [0, 1, 2]) {
        expect(
          Math.abs(apcaLc(ring, neutral.steps[step]!)),
          `${mode} ring vs neutral-${step + 1}`,
        ).toBeGreaterThanOrEqual(NON_TEXT);
      }
    });
  }

  it("and the emitted token is the step the law just checked, not a third thing", () => {
    // The law above proves a colour; this proves the stylesheet ships that colour. Without it
    // the two could drift apart silently, which is how --tone-solid got missed in §7.
    for (const mode of MODES) {
      const emitted = colorDeclarations(mode).find((l) => l.includes("--focus-ring:"));
      expect(emitted).toContain(mode === "dark" ? "var(--accent-11)" : "var(--accent-solid)");
    }
  });
});

describe("the soft ladder is §8's +1/+2 rule, in the emitted declarations (§7, §8)", () => {
  // ENGINEERING.md and CLAUDE.md both claim the suite asserts "hover = +1 step, press = +2".
  // Nothing read the mapping: the ladder was emitted at three lines nobody tested, so any of
  // them could be changed to any step and the whole suite stayed green. The rung's feedback
  // amount is the thing being guaranteed — that every rung moves by the SAME amount, so
  // pressing a medium button and pressing a quiet one feel like one gesture.
  it("soft rests on 3, hovers to 4, presses to 5, for every tone", () => {
    for (const mode of MODES) {
      const declared = colorDeclarations(mode);
      for (const tone of TONES) {
        const at = (role: string) => declared.find((l) => l.trimStart().startsWith(`--${tone}-${role}:`));
        expect(at("soft")).toContain(`var(--${tone}-3)`);
        expect(at("soft-hover")).toContain(`var(--${tone}-4)`);
        expect(at("soft-active")).toContain(`var(--${tone}-5)`);
      }
    }
  });
});
