/**
 * Law tests for the token layer (ENGINEERING.md §6). These assert the system's
 * invariants — step counts, the size-index join, reference-not-coincidence, and
 * §12's multiplier table — never rendered values. No snapshots.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  density,
  fontSize,
  letterSpacing,
  lineHeight,
  radiusLevels,
  radiusOverlay,
  radiusSurface,
  space,
  type RadiusLevel,
} from "./config.ts";
import { generateTokens } from "./generate.ts";

const css = generateTokens();
const increasing = (xs: readonly number[]) => xs.every((v, i) => i === 0 || v > xs[i - 1]!);

/**
 * The body of one rule, bounded at its closing brace so it cannot bleed into the next block.
 *
 * Throws on a missing selector rather than returning "". Most laws here assert *absence*,
 * and `expect("").not.toContain(x)` passes trivially — so a renamed selector would turn the
 * whole suite green while checking nothing. Failing loudly is the only safe behaviour.
 */
function block(selector: string) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`no rule for "${selector}" — the suite would assert nothing`);
  const end = css.indexOf("}", start);
  if (end === -1) throw new Error(`unterminated rule for "${selector}"`);
  return css.slice(start, end);
}

/** Reads a declaration out of a scope: `:root` by default, or a density block. */
function declaration(name: string, level: "default" | "compact" | "comfortable" = "default") {
  const scope = level === "default" ? block(":root") : block(`[data-density="${level}"]`);
  return scope.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];
}

describe("step counts are set per family, not copied across families (§6)", () => {
  it("space spans 12 steps, radius 8 at every level, type 9, controls 4 at every density", () => {
    expect(space).toHaveLength(12);
    for (const level of Object.values(radiusLevels)) expect(level.steps).toHaveLength(8);
    expect(fontSize).toHaveLength(9);
    for (const set of Object.values(density)) {
      for (const family of [set.height, set.px, set.gap, set.radius]) {
        expect(family).toHaveLength(4);
      }
    }
  });
});

describe("palettes are monotonic", () => {
  it("every scale strictly increases", () => {
    for (const scale of [space, fontSize, lineHeight]) {
      expect(increasing(scale)).toBe(true);
    }
  });

  it("every radius level is non-decreasing within a band", () => {
    // Across the bands it may drop, and at `full` it must: controls go to a pill while
    // surfaces stay capped. That break is the point of splitting the bands.
    for (const { steps } of Object.values(radiusLevels)) {
      const control = steps.slice(0, radiusSurface);
      const surface = steps.slice(radiusSurface);
      for (const band of [control, surface]) {
        expect(band.every((v, i) => i === 0 || v >= band[i - 1]!)).toBe(true);
      }
    }
  });
});

describe("type tokens are paired, not derived (§15)", () => {
  it("every font size has a line height and letter spacing", () => {
    expect(lineHeight).toHaveLength(fontSize.length);
    expect(letterSpacing).toHaveLength(fontSize.length);
    for (let i = 1; i <= fontSize.length; i++) {
      expect(declaration(`font-size-${i}`)).toBeDefined();
      expect(declaration(`line-height-${i}`)).toBeDefined();
      expect(declaration(`letter-spacing-${i}`)).toBeDefined();
    }
  });
});

describe("the size index joins a coherent set (§4)", () => {
  it("every size 1-4 defines height, inline padding, gap, and radius together", () => {
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`control-height-${size}`)).toBeDefined();
      expect(declaration(`control-px-${size}`)).toBeDefined();
      expect(declaration(`control-gap-${size}`)).toBeDefined();
      expect(declaration(`radius-control-${size}`)).toBeDefined();
    }
  });
});

describe("semantic tokens reference palette tokens, never restate numbers (§6)", () => {
  it("control and surface radii resolve through var(--radius-N)", () => {
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`radius-control-${size}`)).toMatch(/^var\(--radius-\d\)$/);
    }
    expect(declaration("radius-surface")).toMatch(/^var\(--radius-\d\)$/);
    expect(declaration("radius-overlay")).toMatch(/^var\(--radius-\d\)$/);
  });

  it("control padding and gap resolve through the space palette", () => {
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`control-px-${size}`)).toContain("var(--space-");
      expect(declaration(`control-gap-${size}`)).toContain("var(--space-");
    }
  });
});

describe("density is a designed set, not a multiplier (§12)", () => {
  it("declares the whole control family at every level", () => {
    for (const level of ["compact", "comfortable"] as const) {
      for (let size = 1; size <= 4; size++) {
        for (const family of ["control-height", "control-px", "control-gap", "radius-control"]) {
          expect(declaration(`${family}-${size}`, level)).toBeDefined();
        }
      }
    }
  });

  it("orders compact < default < comfortable for a given size, and nothing else", () => {
    for (let i = 0; i < 4; i++) {
      expect(density.compact.height[i]!).toBeLessThan(density.default.height[i]!);
      expect(density.default.height[i]!).toBeLessThan(density.comfortable.height[i]!);
    }
  });

  it("keeps every level's own ladder increasing across sizes", () => {
    for (const set of Object.values(density)) {
      expect(increasing(set.height)).toBe(true);
    }
  });

  it("carries no density multiplier anywhere", () => {
    expect(css).not.toContain("var(--density)");
  });

  it("never touches type — a size-2 label is size 2 at every density, which is the axis", () => {
    for (const level of ["compact", "comfortable"] as const) {
      const body = block(`[data-density="${level}"]`);
      for (const family of ["font-size", "line-height", "letter-spacing", "font-weight"]) {
        expect(body).not.toContain(`--${family}-`);
      }
    }
  });

  it("never touches the space or radius palettes — compact must not move page gutters", () => {
    for (const level of ["compact", "comfortable"] as const) {
      const body = block(`[data-density="${level}"]`);
      expect(body).not.toMatch(/^\s*--space-\d+:/m);
      expect(body).not.toMatch(/^\s*--radius-\d+:/m);
    }
  });
});

describe("the corner holds a fraction of its box (§6)", () => {
  // The capsule bug: radius climbed with the size index rather than the box, so default ran
  // 0.14 to 0.25 and comfortable reached 0.40. The invariant is not an absolute band — small
  // is legitimately square and large legitimately round — it is that the ratio stays roughly
  // constant ACROSS SIZES within one configuration. 1.6 is tuned just under the values that
  // shipped the bug (1.79 and 1.67); tighten it if the ladders ever get calmer.
  const SPREAD = 1.6;

  // `none` is 0 by design and `full` is a pill by design; neither has a ratio to hold.
  const levels = ["small", "medium", "large"] as const;

  for (const levelName of levels) {
    for (const [densityName, set] of Object.entries(density)) {
      it(`holds across sizes at ${densityName} x ${levelName}`, () => {
        const ratios = set.radius.map(
          (step, i) => radiusLevels[levelName].steps[step]! / set.height[i]!,
        );
        expect(Math.max(...ratios) / Math.min(...ratios)).toBeLessThanOrEqual(SPREAD);
      });
    }
  }
});

describe("radius levels are designed palettes, not a factor (§6)", () => {
  const level = (name: RadiusLevel) => block(`[data-radius="${name}"]`);

  it("carries no radius factor anywhere", () => {
    expect(css).not.toContain("var(--radius-factor)");
  });

  it("declares the whole palette at every non-default level", () => {
    for (const name of ["none", "small", "large", "full"] as const) {
      for (let step = 0; step <= 7; step++) {
        expect(level(name)).toMatch(new RegExp(`--radius-${step}:`));
      }
      expect(level(name)).toContain("--radius-full:");
    }
  });

  it("caps surfaces at full so a dialog never becomes a lens", () => {
    const { steps } = radiusLevels.full;
    for (const step of [radiusSurface, radiusOverlay]) {
      expect(steps[step]).toBeLessThan(100);
    }
    for (let step = 1; step < radiusSurface; step++) {
      expect(steps[step]).toBeGreaterThan(1000);
    }
  });

  it("never gets squarer as the dial turns up, at any step", () => {
    // The bug this exists for: `full` capped surfaces at medium's values, so cards read
    // squarer at full than at large. Turning the dial up must never turn a corner down.
    const ladder = ["none", "small", "medium", "large", "full"] as const;
    for (let step = 0; step <= 7; step++) {
      for (let i = 1; i < ladder.length; i++) {
        expect(radiusLevels[ladder[i]!].steps[step]!).toBeGreaterThanOrEqual(
          radiusLevels[ladder[i - 1]!].steps[step]!,
        );
      }
    }
  });

  it("squares everything at none, the kill switch", () => {
    expect(radiusLevels.none.steps.every((v) => v === 0)).toBe(true);
    expect(radiusLevels.none.full).toBe(0);
  });

  it("writes no semantic token, so density picks the step and the level prices it", () => {
    for (const name of ["none", "small", "large", "full"] as const) {
      for (const semantic of ["radius-control-", "radius-surface", "radius-overlay"]) {
        expect(level(name)).not.toContain(`--${semantic}`);
      }
    }
  });

  it("keeps the control and surface bands disjoint, which is what makes full expressible", () => {
    for (const set of Object.values(density)) {
      for (const step of set.radius) expect(step).toBeLessThan(radiusSurface);
    }
  });
});

describe("multiplier wiring matches §12's table", () => {
  it("type takes scale, never density", () => {
    for (let i = 1; i <= fontSize.length; i++) {
      for (const family of [`font-size-${i}`, `line-height-${i}`]) {
        expect(declaration(family)).toContain("var(--scale)");
        expect(declaration(family)).not.toContain("var(--density)");
      }
    }
  });

  it("the space palette takes scale, never density — compact must not shrink page gutters", () => {
    for (let i = 1; i <= space.length; i++) {
      expect(declaration(`space-${i}`)).toContain("var(--scale)");
      expect(declaration(`space-${i}`)).not.toContain("var(--density)");
    }
  });

  it("control height takes scale; padding and gap inherit it through the space palette", () => {
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`control-height-${size}`)).toContain("var(--scale)");
      expect(declaration(`control-px-${size}`)).toMatch(/^var\(--space-\d+\)$/);
      expect(declaration(`control-gap-${size}`)).toMatch(/^var\(--space-\d+\)$/);
    }
  });

  it("radius takes scale, never density", () => {
    for (let i = 1; i <= 7; i++) {
      expect(declaration(`radius-${i}`)).toContain("var(--scale)");
      expect(declaration(`radius-${i}`)).not.toContain("var(--density)");
    }
  });
});

describe("generated output is not hand-edited (ENGINEERING §7)", () => {
  it("committed tokens.css matches the generator", () => {
    const committed = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "tokens.css"), "utf8");
    expect(committed).toBe(css);
  });

  it("carries a generated-file header naming its source", () => {
    expect(css).toContain("GENERATED FILE");
    expect(css).toContain("src/tokens/config.ts");
  });
});
