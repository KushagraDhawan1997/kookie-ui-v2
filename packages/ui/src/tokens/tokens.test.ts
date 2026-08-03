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
  coarse,
  density,
  fontSize,
  layoutSpace,
  letterSpacing,
  lineHeight,
  radiusLevels,
  radiusOverlay,
  radiusSurface,
  space,
  surfacePadding,
  touchTargetMin,
  type DensityLevel,
  type DensitySet,
  type RadiusLevel,
} from "./config.ts";
import { generateLayoutCss } from "../system/layout-css.ts";
import { generateTokens } from "./generate.ts";

const css = generateTokens();
const increasing = (xs: readonly number[]) => xs.every((v, i) => i === 0 || v > xs[i - 1]!);

/** WCAG 2.2 SC 2.5.8 Target Size (Minimum), Level AA. Not 44 — that is SC 2.5.5, Level AAA. */
const TARGET_FLOOR_AA = 24;

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

  it("emits the default level as a real block — an escape that does nothing is not an escape", () => {
    // Theme stamps data-density on every Theme node, so a nested default Theme inside a
    // compact region otherwise INHERITS the compact custom properties — the pointer fine
    // world's bug (§16), one axis over. :root alone cannot fix it; the scope must re-declare.
    const body = block(`[data-density="default"]`);
    for (const family of ["control-height-2", "layout-space-4", "surface-p-1"]) {
      expect(body).toContain(`--${family}:`);
    }
    // Order is load-bearing: the block precedes the pointer worlds, so on a coarse device the
    // later same-specificity [data-pointer] blocks still win the tie and keep coarse geometry.
    expect(css.indexOf(`[data-density="default"] {`)).toBeLessThan(
      css.indexOf(`[data-pointer="fine"]`),
    );
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

  it("control innards read the RAW palette at every level — the layer must not double-apply", () => {
    // The boundary (§12): control px/gap answer density through the designed sets alone.
    // Routed through layout space they would compress twice under compact.
    for (const level of ["default", "compact", "comfortable"] as const) {
      for (let size = 1; size <= 4; size++) {
        expect(declaration(`control-px-${size}`, level)).toMatch(/^var\(--space-\d+\)$/);
        expect(declaration(`control-gap-${size}`, level)).toMatch(/^var\(--space-\d+\)$/);
      }
    }
  });
});

describe("layout space: the density-aware layer over the untouched palette (§3, §12)", () => {
  it("default is the 1:1 identity map — gap=\"4\" at default IS space step 4", () => {
    for (let i = 1; i <= space.length; i++) {
      expect(declaration(`layout-space-${i}`)).toBe(`var(--space-${i})`);
      expect(layoutSpace.default[i - 1]).toBe(i);
    }
  });

  it("every level re-picks all twelve steps from the palette, never restates a number", () => {
    for (const level of ["compact", "comfortable"] as const) {
      for (let i = 1; i <= space.length; i++) {
        expect(declaration(`layout-space-${i}`, level)).toMatch(/^var\(--space-\d+\)$/);
      }
    }
  });

  it("orders compact <= default <= comfortable per step, non-decreasing within a level", () => {
    for (let i = 0; i < space.length; i++) {
      expect(layoutSpace.compact[i]!).toBeLessThanOrEqual(layoutSpace.default[i]!);
      expect(layoutSpace.default[i]!).toBeLessThanOrEqual(layoutSpace.comfortable[i]!);
    }
    for (const picks of Object.values(layoutSpace)) {
      expect(picks.every((v, i) => i === 0 || v >= picks[i - 1]!)).toBe(true);
    }
  });

  it("the gutter band (9-12) holds at identity — density must not collapse page gutters", () => {
    // §12's original protection, kept as a placed choice: the rhythm between components
    // tightens, the page frame does not. Loosen this law only by decision, never by drift.
    for (const picks of Object.values(layoutSpace)) {
      for (let i = 8; i < space.length; i++) expect(picks[i]).toBe(i + 1);
    }
  });

  it("surface padding reads the layer, and is RE-BAKED in every scope that re-picks it", () => {
    // Substitution-at-declaration (§6): --surface-p-N left in :root alone would carry the
    // default rhythm into a compact subtree, because a var() bakes where it is declared.
    for (const level of ["default", "compact", "comfortable"] as const) {
      for (let size = 1; size <= 4; size++) {
        expect(declaration(`surface-p-${size}`, level)).toBe(
          `var(--layout-space-${surfacePadding[size - 1]})`,
        );
      }
    }
  });

  it("the pointer axis never touches the layer — a phone needs more content per inch, not less", () => {
    for (const scope of [`[data-pointer="coarse"]`, `[data-pointer="fine"]`]) {
      expect(block(scope)).not.toContain("--layout-space-");
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

  // Both geometries hold the same law: coarse is a second world, not an exemption (§16).
  const worlds: [string, Record<DensityLevel, DensitySet>][] = [
    ["fine", density],
    ["coarse", coarse],
  ];
  for (const [worldName, world] of worlds) {
    for (const levelName of levels) {
      for (const [densityName, set] of Object.entries(world)) {
        it(`holds across sizes at ${worldName} x ${densityName} x ${levelName}`, () => {
          const ratios = set.radius.map(
            (step, i) => radiusLevels[levelName].steps[step]! / set.height[i]!,
          );
          expect(Math.max(...ratios) / Math.min(...ratios)).toBeLessThanOrEqual(SPREAD);
        });
      }
    }
  }
});

describe("the pointer axis is a second designed geometry (§16)", () => {
  it("coarse places a complete set per density level, same shape as fine", () => {
    for (const level of Object.keys(density) as DensityLevel[]) {
      for (const family of ["height", "px", "gap", "radius"] as const) {
        expect(coarse[level][family]).toHaveLength(4);
      }
      expect(increasing(coarse[level].height)).toBe(true);
    }
  });

  it("coarse never renders a size smaller than fine does — the axis only adds room", () => {
    for (const level of Object.keys(density) as DensityLevel[]) {
      for (let i = 0; i < 4; i++) {
        expect(coarse[level].height[i]!).toBeGreaterThan(density[level].height[i]!);
      }
    }
  });

  it("the default path clears the enhanced 44 target, in geometry alone", () => {
    // What a consumer gets without thinking: default density, size 2, coarse pointer. That is
    // WCAG 2.5.5 / HIG 44 — the AAA target — met by the designed set, with no runtime reserve
    // and therefore no second element inside any control (§16).
    expect(coarse.default.height[1]!).toBeGreaterThanOrEqual(touchTargetMin);
  });

  it("NO designed cell anywhere falls below the WCAG 2.2 AA minimum of 24", () => {
    // The actual locked floor (SC 2.5.8, Level AA). 44 is SC 2.5.5 at AAA and is an opt-out
    // default, not a law: choosing size 1 or a denser theme is a deliberate, informed step
    // below it. 24 is the one nothing may cross, in either pointer world.
    for (const world of [density, coarse]) {
      for (const level of Object.keys(world) as DensityLevel[]) {
        for (const h of world[level].height) expect(h).toBeGreaterThanOrEqual(TARGET_FLOOR_AA);
      }
    }
  });

  it("ships the floor as a token, raw px, unscaled", () => {
    expect(declaration("touch-target-min")).toBe(`${touchTargetMin}px`);
  });

  it("emits all three scopes: pinned coarse, the media-scoped auto, and the fine escape", () => {
    for (const scope of [`[data-pointer="coarse"]`, `[data-pointer="fine"]`]) {
      expect(block(scope)).toContain("--control-height-2:");
    }
    // The fine escape must RE-declare, not merely exist: a nested scope that declares nothing
    // inherits the coarse values, and an escape that does nothing is not an escape.
    expect(css).toContain("@media (pointer: coarse) {");
    expect(block(`  [data-pointer="auto"]`)).toContain("--control-height-2:");
  });

  it("emits the (pointer x radius x density) cells, one axis deeper than radius x density", () => {
    for (const pointer of ["coarse", "fine"]) {
      expect(
        block(`[data-pointer="${pointer}"][data-radius="full"][data-density="compact"]`),
      ).toContain("--radius-control-1:");
    }
  });

  it("never touches the space palette or type — gutters must not inflate on the smaller screen", () => {
    for (const scope of [`[data-pointer="coarse"]`, `[data-pointer="coarse"][data-density="compact"]`]) {
      const body = block(scope);
      expect(body).not.toMatch(/^\s*--space-\d+:/m);
      expect(body).not.toContain("--font-size-");
      expect(body).not.toContain("--line-height-");
    }
  });
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

  // layout.css is generated by the same run and shipped by the same entry point, so leaving it
  // unlawed meant a hand edit to the half of the CSS that carries the responsive mechanism
  // would survive CI while an edit to tokens.css could not.
  it("committed layout.css matches its generator too", () => {
    const committed = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../system/layout.css"),
      "utf8",
    );
    expect(committed).toBe(generateLayoutCss());
  });
});
