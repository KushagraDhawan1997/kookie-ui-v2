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
  controlGap,
  density,
  deviceType,
  fontSize,
  handheldMedia,
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
  it("space spans 12 steps, radius 11 at every level, type 9, controls 4 at every density", () => {
    expect(space).toHaveLength(12);
    for (const level of Object.values(radiusLevels)) expect(level.steps).toHaveLength(11);
    expect(fontSize).toHaveLength(9);
    for (const set of Object.values(density)) {
      for (const family of [set.height, set.px, set.radius]) {
        expect(family).toHaveLength(4);
      }
    }
    for (const world of Object.values(controlGap)) expect(world).toHaveLength(4);
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
      const control = steps.slice(0, radiusSurface[0]);
      const surface = steps.slice(radiusSurface[0]);
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
      expect(declaration(`radius-control-${size}`)).toMatch(/^var\(--radius-\d+\)$/);
      expect(declaration(`radius-surface-${size}`)).toMatch(/^var\(--radius-\d+\)$/);
    }
    expect(declaration("radius-overlay")).toMatch(/^var\(--radius-\d+\)$/);
  });

  // The icon-label gap still resolves through the palette; inline padding no longer does, and
  // that is the point of the 2026-08-05 change — the gap binds two pieces of CONTENT and can
  // take a layout rhythm, where padding has to hold a fraction of a box the palette knows
  // nothing about. §6 forbids restating a number, not naming one that has no palette to name.
  it("the icon-label gap resolves through the space palette", () => {
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`control-gap-${size}`)).toContain("var(--space-");
    }
  });
});

describe("density is a designed set, not a multiplier (§12)", () => {
  it("declares the whole control family at every level", () => {
    for (const level of ["compact", "comfortable"] as const) {
      for (let size = 1; size <= 4; size++) {
        for (const family of ["control-height", "control-px", "radius-control"]) {
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

  it("control innards never route through LAYOUT SPACE — the layer must not double-apply", () => {
    // The boundary (§12): control px answers density through the designed sets alone. Routed
    // through layout space it would compress twice under compact. Since 2026-08-05 it does not
    // route through the raw palette either — it is a designed length, which is a stronger form
    // of the same guarantee, so the assertion moved from "is a space reference" to "references
    // nothing that density has already moved".
    for (const level of ["default", "compact", "comfortable"] as const) {
      for (let size = 1; size <= 4; size++) {
        expect(declaration(`control-px-${size}`, level)).not.toContain("--layout-space-");
        expect(declaration(`control-px-${size}`, level)).not.toContain("--space-");
      }
    }
  });

  it("the icon-label gap is the label cluster's — density never declares it (§4, decided 2026-08-04)", () => {
    // Density grows the box and holds the content: type, the icon box, and the gap binding
    // them move together or not at all. The gap lives at :root and per pointer world only —
    // a density block declaring it would re-open the axis.
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`control-gap-${size}`)).toMatch(/^var\(--space-\d+\)$/);
    }
    for (const level of ["default", "compact", "comfortable"] as const) {
      expect(block(`[data-density="${level}"]`)).not.toContain("--control-gap-");
    }
    // It IS pointer-indexed: the coarse cluster spreads with its box (§16).
    for (const world of [`[data-pointer="fine"]`, `[data-pointer="coarse"]`]) {
      expect(block(world)).toContain("--control-gap-2:");
    }
    expect(controlGap.coarse[1]!).toBeGreaterThan(controlGap.fine[1]!);
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

describe("the inline padding holds a fraction of its box (§4, §12)", () => {
  // The radius bug a second time, found 2026-08-05 and fixed by taking `px` out of the space
  // palette. The palette is a LAYOUT rhythm — through the control band it grows ~1.44x per
  // step against a height ladder that grows ~1.20x — so indexing one with the other could not
  // hold a fraction: default ran 0.286 -> 0.500 and comfortable reached 0.533. Every one of
  // these assertions fails against the config that shipped, which is why they are here.
  //
  // A BAND rather than a spread ratio, because unlike radius the acceptable range is known:
  // v1 of this system used a flat 0.375, Radix runs 0.33-0.42, and the eye pass judged those
  // too loose at the top of the ladder. 0.24-0.38 is where all six sets now sit.
  const FLOOR = 0.24;
  const CEILING = 0.38;

  const worlds: [string, Record<DensityLevel, DensitySet>][] = [
    ["fine", density],
    ["coarse", coarse],
  ];

  for (const [worldName, world] of worlds) {
    for (const [levelName, set] of Object.entries(world)) {
      it(`stays inside the band at ${worldName} x ${levelName}`, () => {
        for (let i = 0; i < 4; i++) {
          const fraction = set.px[i]! / set.height[i]!;
          expect(fraction).toBeGreaterThanOrEqual(FLOOR);
          expect(fraction).toBeLessThanOrEqual(CEILING);
        }
      });

      // coarse/comfortable shipped [16, 24, 32, 32] — it ran out of palette and repeated a
      // step, so a size-4 control was padded no wider than a size-3 one. Absolute monotonicity
      // is the law that would have caught it, and no law covered `px` at all.
      it(`grows with the size index at ${worldName} x ${levelName}`, () => {
        expect(increasing(set.px)).toBe(true);
      });
    }
  }

  it("orders compact < default < comfortable at every size, the way height does", () => {
    for (const world of worlds.map(([, w]) => w)) {
      for (let i = 0; i < 4; i++) {
        expect(world.compact.px[i]!).toBeLessThan(world.default.px[i]!);
        expect(world.default.px[i]!).toBeLessThan(world.comfortable.px[i]!);
      }
    }
  });

  it("emits a scaled length, not a space reference — the palette is layout's, not the control's", () => {
    // The token must also ZOOM: an index resolved to var(--space-N), which already carried
    // --scale. A raw px emitted without zoom() would silently drop a control's padding out of
    // the one geometry that answers the scale escape (§13).
    expect(declaration("control-px-4")).toBe(`calc(${density.default.px[3]}px * var(--scale))`);
    expect(css).not.toContain("--control-px-1: var(--space-");
  });
});

describe("the pointer axis is a second designed geometry (§16)", () => {
  it("coarse places a complete set per density level, same shape as fine", () => {
    for (const level of Object.keys(density) as DensityLevel[]) {
      for (const family of ["height", "px", "radius"] as const) {
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

describe("the device axis re-prices the type palette, and only the type palette (§15, §17)", () => {
  /** The declarations of a scope, trimmed — for comparing two bands independent of indent. */
  const decls = (selector: string) =>
    block(selector)
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("--"));

  it("a handheld step is the palette's designed TRIPLE at the picked index — never a mixed pair", () => {
    // The whole point of re-picking an index rather than scaling a value: font-size, line
    // height and letter spacing arrive as one designed step, so a band cannot ship a 18px
    // face on a 24px line with 16px tracking.
    const body = block(`[data-device="handheld"]`);
    deviceType.handheld.forEach((pick, i) => {
      expect(body).toContain(`--font-size-${i + 1}: calc(${fontSize[pick - 1]}px * var(--scale));`);
      expect(body).toContain(`--line-height-${i + 1}: calc(${lineHeight[pick - 1]}px * var(--scale));`);
      expect(body).toContain(`--letter-spacing-${i + 1}: ${letterSpacing[pick - 1]}em;`);
    });
  });

  it("desktop is the identity, emitted as a real block — an escape that does nothing is not an escape", () => {
    // Theme stamps data-device on every node, so a desktop Theme nested in a handheld region
    // would otherwise inherit the handheld palette (§16's default-escape lesson, one axis over).
    const body = block(`[data-device="desktop"]`);
    fontSize.forEach((px, i) => expect(body).toContain(`--font-size-${i + 1}: calc(${px}px * var(--scale));`));
    lineHeight.forEach((px, i) => expect(body).toContain(`--line-height-${i + 1}: calc(${px}px * var(--scale));`));
  });

  it("auto rides the CONJUNCTION — coarse alone is a touch laptop, narrow alone a squeezed window", () => {
    expect(handheldMedia).toContain("pointer: coarse");
    expect(handheldMedia).toContain("max-width");
    const media = css.indexOf(`@media ${handheldMedia} {`);
    expect(media).toBeGreaterThan(-1);
    expect(css.indexOf(`[data-device="auto"]`)).toBeGreaterThan(media);
    // The auto band IS the handheld band — one designed set, two ways in.
    expect(decls(`[data-device="auto"]`)).toEqual(decls(`[data-device="handheld"]`));
  });

  it("touches nothing but type — geometry is the pointer axis's, spacing is nobody's (§16)", () => {
    for (const scope of [`[data-device="desktop"]`, `[data-device="handheld"]`, `  [data-device="auto"]`]) {
      const body = block(scope);
      for (const stem of ["--space-", "--layout-space-", "--control-", "--radius", "--icon-size-", "--surface-p-"]) {
        expect(body).not.toContain(stem);
      }
    }
    // And the reverse: no other axis re-declares a type token, which is why the device axis
    // needs no interaction cells where pointer needed (pointer x radius x density).
    for (const world of [`[data-pointer="fine"]`, `[data-pointer="coarse"]`]) {
      expect(block(world)).not.toContain("--font-size-");
    }
  });

  it("the band is non-monotonic BY DESIGN: reading sizes rise, display sizes fall, order holds", () => {
    const picks = deviceType.handheld;
    expect(picks).toHaveLength(fontSize.length);
    // Every pick lands inside the palette, and a larger step never renders smaller.
    expect(picks.every((p) => p >= 1 && p <= fontSize.length)).toBe(true);
    expect(picks.every((p, i) => i === 0 || p >= picks[i - 1]!)).toBe(true);
    // The shape is the decision (values are v0): body text rises toward the HIG's 17pt...
    expect(picks[2]!).toBeGreaterThan(3);
    // ...and display text falls — 56px on a 375px screen is seven characters a line.
    expect(picks[8]!).toBeLessThan(9);
  });
});

describe("radius levels are designed palettes, not a factor (§6)", () => {
  const level = (name: RadiusLevel) => block(`[data-radius="${name}"]`);

  it("carries no radius factor anywhere", () => {
    expect(css).not.toContain("var(--radius-factor)");
  });

  it("declares the whole palette at EVERY level, the default included", () => {
    // The default block is the escape (§12's density lesson, one axis over): Theme stamps
    // data-radius on every node, and a nested medium Theme inside a small region otherwise
    // inherits the small palette.
    for (const name of ["none", "small", "medium", "large", "full"] as const) {
      for (let step = 0; step <= 10; step++) {
        expect(level(name)).toMatch(new RegExp(`--radius-${step}:`));
      }
      expect(level(name)).toContain("--radius-full:");
    }
  });

  it("caps surfaces at full so a dialog never becomes a lens", () => {
    const { steps } = radiusLevels.full;
    for (const step of [...radiusSurface, radiusOverlay]) {
      expect(steps[step]).toBeLessThan(100);
    }
    for (let step = 1; step < radiusSurface[0]; step++) {
      expect(steps[step]).toBeGreaterThan(1000);
    }
  });

  it("never gets squarer as the dial turns up, at any step", () => {
    // The bug this exists for: `full` capped surfaces at medium's values, so cards read
    // squarer at full than at large. Turning the dial up must never turn a corner down.
    const ladder = ["none", "small", "medium", "large", "full"] as const;
    for (let step = 0; step <= 10; step++) {
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

  it("writes no CONTROL semantic — density picks that step and the (level x density) cells carry it", () => {
    for (const name of ["none", "small", "medium", "large", "full"] as const) {
      expect(level(name)).not.toContain("--radius-control-");
    }
  });

  it("re-declares the surface semantics in every level block — no density cell carries them", () => {
    // Substitution-at-declaration (§6): --radius-surface-N left in :root alone stays baked
    // to the medium palette inside any [data-radius] subtree, so a nested small Theme's cards
    // would keep medium corners. Surface radii take no density, so the level block itself is
    // the only scope that can re-bake them.
    for (const name of ["none", "small", "medium", "large", "full"] as const) {
      for (let size = 1; size <= 4; size++) {
        expect(level(name)).toContain(`--radius-surface-${size}: var(--radius-${radiusSurface[size - 1]})`);
      }
      expect(level(name)).toContain(`--radius-overlay: var(--radius-${radiusOverlay})`);
    }
  });

  it("surface picks are size-ordered within the band, and the band sits between control and overlay", () => {
    expect([...radiusSurface].every((v, i) => i === 0 || v > radiusSurface[i - 1]!)).toBe(true);
    expect(radiusSurface[0]).toBeGreaterThan(5);
    expect(radiusOverlay).toBeGreaterThan(radiusSurface[3]!);
  });

  it("keeps the control and surface bands disjoint, which is what makes full expressible", () => {
    for (const set of Object.values(density)) {
      for (const step of set.radius) expect(step).toBeLessThan(radiusSurface[0]);
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

  it("control height and padding take scale directly; the gap inherits it through the palette", () => {
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`control-height-${size}`)).toContain("var(--scale)");
      // Padding joined height on 2026-08-05, so it now has to carry the multiplier itself —
      // the space palette is no longer there to carry it (see the padding-fraction laws).
      expect(declaration(`control-px-${size}`)).toContain("var(--scale)");
      expect(declaration(`control-gap-${size}`)).toMatch(/^var\(--space-\d+\)$/);
    }
  });

  it("radius takes scale, never density", () => {
    for (let i = 1; i <= 10; i++) {
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
