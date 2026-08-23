/**
 * Law tests for the token layer (ENGINEERING.md §6). These assert the system's
 * invariants — step counts, the size-index join, reference-not-coincidence, and
 * §12's multiplier table — never rendered values. No snapshots.
 */
import { readFileSync } from "node:fs";
import { GLASS_MATERIALS } from "../system/axes.ts";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  coarse,
  controlGap,
  defaultRadiusLevel,
  density,
  dress,
  disabledSteps,
  handheldMedia,
  fontSize,
  iconSize,
  narrowMedia,
  typeBands,
  inputFontFloor,
  layoutSpace,
  springs,
  letterSpacing,
  lineHeight,
  material,
  radiusLevels,
  radiusOverlay,
  radiusSurface,
  space,
  surfacePadding,
  floatingPadding,
  floatingMinWidth,
  alertWidth,
  overlayWidth,
  touchTargetMin,
  type DensityLevel,
  type DensitySet,
  type RadiusLevel,
} from "./config.ts";
import { allStylesheets, block as blockIn, sheet, stripped } from "../test/stylesheets.ts";
import { generateLayoutCss } from "../system/layout-css.ts";
import { DILUTED_ROLES, ROLES, generateTokens } from "./generate.ts";
import { tones, undilutedTones } from "./color-config.ts";

const css = generateTokens();
/**
 * The same sheet with its prose removed, for the laws that ask what the generator WROTE.
 *
 * The emitted stylesheet documents itself, so any grep over the raw text is a grep over the
 * comments too — and this file records the rule two describes down ("a law a comment can
 * satisfy is not a law, and one a comment can FAIL is not one either") while three of its own
 * absence checks and its one occurrence COUNT read the raw string. Audit 2026-08-08. Laws that
 * ask about structure (`@media` heads, declaration bodies) keep reading `css`, because those
 * are code either way.
 */
const code = stripped(css);
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
  // A rule may carry a LIST of selectors, so the asked-for scope is matched where it opens
  // the rule (`sel {`) or where it is one member of the list (`sel,`). Widened 2026-08-20:
  // the high-contrast rule grew a third arm for nested appearance scopes, and every law
  // reading it by its old two-selector text died at once — pinning a whole selector list is
  // pinning the generator's spelling, not its guarantee. Still LOUD on a genuine miss, which
  // is the property this helper exists for.
  const start = [` {`, `,`]
    .map((tail) => css.indexOf(`${selector}${tail}`))
    .filter((i) => i !== -1)
    .sort((a, b) => a - b)[0];
  if (start === undefined) throw new Error(`no rule for "${selector}" — the suite would assert nothing`);
  const end = css.indexOf("}", start);
  if (end === -1) throw new Error(`unterminated rule for "${selector}"`);
  return css.slice(start, end);
}

/** A declaration read out of an arbitrary scope block — two mark-family describes had grown
    private near-copies of this regex machinery (audit straggler, merged 2026-08-06). */
const inScope = (scope: string, name: string) =>
  block(scope).match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];

/**
 * EVERY block that scopes this density level, not the first one.
 *
 * `block()` returns the first selector match, and the bare `[data-density="compact"] {` is
 * emitted before the pointer worlds — so a law written against it reads one scope and calls
 * it all of them. The families that answer density inside a pointer world
 * (`[data-pointer="coarse"][data-density="compact"]`) were invisible to the "never rides
 * density" laws, and injecting a density-riding switch width into exactly those cells kept
 * the whole suite green: audit 2026-08-08, the third instance of a law one scope short of
 * the thing that could be wrong.
 */
function everyDensityBlock(level: "compact" | "comfortable"): { selector: string; body: string }[] {
  const marker = `[data-density="${level}"] {`;
  const found: { selector: string; body: string }[] = [];
  for (let at = css.indexOf(marker); at !== -1; at = css.indexOf(marker, at + 1)) {
    const open = css.indexOf("{", at);
    const close = css.indexOf("}", open);
    if (close === -1) throw new Error(`unterminated density rule at ${at}`);
    // Back up to the start of the selector so the failure message names the real scope.
    const lineStart = css.lastIndexOf("\n", at) + 1;
    found.push({ selector: css.slice(lineStart, open).trim(), body: css.slice(open + 1, close) });
  }
  if (found.length === 0) throw new Error(`no [data-density="${level}"] rule — the law asserts nothing`);
  return found;
}

/** Reads a declaration out of a scope: `:root` by default, or a density block. */
function declaration(name: string, level: "default" | "compact" | "comfortable" = "default") {
  const scope = level === "default" ? block(":root") : block(`[data-density="${level}"]`);
  return scope.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];
}

describe("the platform-signal guard agrees with what Theme stamps (§7, added 2026-08-09)", () => {
  // A mechanism with two implementations owes a law that they AGREE (ENGINEERING, the docs
  // audit's own clause). This one has exactly two: Theme stamps `data-contrast` ONLY when the
  // axis was chosen, so a node that never asked carries no attribute — and the generated
  // high-contrast block guards its `prefers-contrast: more` arm with
  // `:not([data-contrast="normal"])` so it still matches that node. The Theme half was
  // law-pinned (theme.browser.test.tsx); the EMITTED half was not, so a guard respelled to
  // `[data-contrast="high"]` — or to a bare selector — would silently either kill the
  // platform signal or make `contrast="normal"` unable to opt out of it, with the whole suite
  // green. The system shipped a version of exactly this defect once already: the block was
  // `:root`-scoped while Theme renders a div, and `prefers-contrast: more` could never fire
  // in dark (audit 2026-08-03).
  const guarded = generateTokens()
    .split("\n")
    .filter((line) => line.includes(":not([data-contrast="));

  it("every prefers-contrast arm excludes the opt-out, and nothing else", () => {
    expect(guarded.length, "the guard exists at all").toBeGreaterThan(0);
    for (const line of guarded) {
      // The exclusion is `normal` — the value a Theme writes ONLY when someone asked for it.
      // `high` here would mean the media query re-applies over an explicit high contrast;
      // anything else would mean the opt-out no longer opts out.
      expect(line.match(/:not\(\[data-contrast="([^"]+)"\]\)/g)?.every((m) => m.includes('"normal"')))
        .toBe(true);
    }
  });

  it("the guard is only used inside the media query, or beside an explicit request", () => {
    // The danger this law is about: a selector whose ONLY qualifier is the guard, sitting
    // outside `prefers-contrast: more`, would apply high-contrast values to every
    // unconfigured theme in the world — the guard matches a node that never asked.
    //
    // Widened 2026-08-20 for the second legitimate use, which is the OPPOSITE job. The
    // nested-scope arm (`[data-contrast="high"] [data-appearance=…]:not([data-contrast="normal"])`)
    // is gated by an ancestor that explicitly asked, and there the guard is an opt-OUT: it
    // lets a nested `contrast="normal"` escape a high-contrast document. Nothing unconfigured
    // can match it, because the explicit request is what admits it in the first place.
    //
    // So the rule is stated as the property rather than the location: a guarded selector is
    // legal outside the media query exactly when it also demands `[data-contrast="high"]`.
    //
    // The module's own `css` (line 48), not a second generation: the generator measures ~4s
    // and this law spent it inside its own 5s timeout, which is a law that fails on a slow
    // runner for a reason that has nothing to do with what it claims.
    for (const line of guarded) {
      if (line.includes('[data-contrast="high"]')) continue;
      const before = css.slice(0, css.indexOf(line));
      const openedMedia = before.lastIndexOf("@media (prefers-contrast: more)");
      expect(openedMedia, `guarded selector outside the media query: ${line}`).toBeGreaterThan(-1);
      // ...and that media block has not been closed before this line: no `}` at column 0
      // between them, which is how this file closes a top-level block.
      expect(before.slice(openedMedia).includes("\n}\n")).toBe(false);
    }
    // The exemption cannot swallow the law: at least one guarded selector must still be
    // sitting inside the media query, or the platform signal has quietly stopped existing.
    expect(
      guarded.some((l) => !l.includes('[data-contrast="high"]')),
      "every guard is now an opt-out — the platform-signal arm is gone",
    ).toBe(true);
  });
});

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

  it("the default world's surface band climbs in EQUAL treads (2026-08-19)", () => {
    // The Card manual audit's first ladder judgment (Kushagra: "size 3 and 4 seems too
    // close, or rather, 1 and 2 aren't rounded enough"): the lab port's band ran +5/+15/+5,
    // because its two cells were judged in isolation and the SEQUENCE never was — four card
    // sizes read as two. Monotonicity above cannot catch that shape; this law pins the
    // decided one: equal treads across the whole surface half (card steps and the
    // overlay-only top). `medium` joined the same day, judged on the LEVEL ladder (the
    // default card ran 8 → 16 → 40 across small/medium/large, so the second jump tripled
    // the first; 12/18/24/30/36 balances it at +16 a side). Small is judged fine as-is and
    // deliberately outside: its +1/+2 treads would fail this law's spelling, and pinning a
    // band nobody re-judged would be the law inventing a judgment.
    for (const name of ["medium", "large", "full"] as const) {
      const steps = radiusLevels[name].steps;
      const band = steps.slice(radiusSurface[0]);
      const tread = band[1]! - band[0]!;
      // The vacuity guard: equal treads of zero would be a flat band wearing this law.
      expect(tread).toBeGreaterThan(0);
      for (let i = 1; i < band.length; i++) {
        expect(
          band[i]! - band[i - 1]!,
          `${name}'s surface band tread ${i} is uneven — the ladder must read as a ladder`,
        ).toBe(tread);
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
      expect(declaration(`radius-overlay-${size}`)).toMatch(/^var\(--radius-\d+\)$/);
    }
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

  it("the row inset is emitted per size and level, and ordered like every other cell value (§21)", () => {
    // Per size since the day it landed (a constant inset read cramped at size 4): a row's
    // box is line + 2 x inset, so this is the whole of what the row family prices; a level
    // that lost a declaration would send rows to the unstyled fallback silently.
    for (let i = 0; i < 4; i++) {
      expect(declaration(`row-inset-${i + 1}`)).toBe(`calc(${density.default.rowInset[i]}px * var(--scale))`);
      for (const level of ["compact", "comfortable"] as const) {
        expect(declaration(`row-inset-${i + 1}`, level)).toBe(
          `calc(${density[level].rowInset[i]}px * var(--scale))`,
        );
      }
    }
    for (const level of ["compact", "default", "comfortable"] as const) {
      for (let i = 0; i < 4; i++) {
        // Air never shrinks as the index grows — gently up, the "less strict" progression.
        if (i > 0) {
          expect(density[level].rowInset[i]!).toBeGreaterThanOrEqual(density[level].rowInset[i - 1]!);
          expect(coarse[level].rowInset[i]!).toBeGreaterThanOrEqual(coarse[level].rowInset[i - 1]!);
        }
        // The coarse world prices its own cells, each above its fine sibling — a finger
        // does not shrink with the font.
        expect(coarse[level].rowInset[i]!).toBeGreaterThan(density[level].rowInset[i]!);
      }
      // Density still orders the cells at every size.
      for (let i = 0; i < 4; i++) {
        expect(density.compact.rowInset[i]!).toBeLessThanOrEqual(density.default.rowInset[i]!);
        expect(density.default.rowInset[i]!).toBeLessThanOrEqual(density.comfortable.rowInset[i]!);
      }
    }
  });

  it("keeps every level's own ladder increasing across sizes", () => {
    for (const set of Object.values(density)) {
      expect(increasing(set.height)).toBe(true);
    }
  });

  it("carries no density multiplier anywhere", () => {
    expect(code).not.toContain("var(--density)");
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

  it("the floating panel's padding reads the layer and re-bakes per density; its width floor rides scale (§22, §23)", () => {
    // The surface-padding sentence at popup scale: one pick, re-emitted in every density
    // scope because a var() bakes where it is declared. The width floor is a raw designed
    // px through --scale (no palette rung at popup scale — the switchW argument), declared
    // once: nothing in it varies by density.
    for (const level of ["default", "compact", "comfortable"] as const) {
      expect(declaration("floating-p", level)).toBe(`var(--layout-space-${floatingPadding})`);
    }
    expect(declaration("floating-min-w")).toBe(`calc(${floatingMinWidth}px * var(--scale))`);
    for (const level of ["compact", "comfortable"] as const) {
      expect(block(`[data-density="${level}"]`)).not.toContain("--floating-min-w");
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
    expect(code).not.toContain("--control-px-1: var(--space-");
  });
});

describe("a bare pill edge pads wider (§4, §6, decided 2026-08-05)", () => {
  // Padding is measured at the vertical midline, where a pill is widest; the eye judges the
  // gap at the text's cap line, where the corner curve has already swung inward. So under
  // `radius="full"` a bare edge takes a wider designed padding. The band is just under the
  // capsule rule of thumb (half the height — text starts where the straight walls do), pulled
  // back at the top of the ladder where full half-height overshoots.
  const FLOOR = 0.38;
  const CEILING = 0.46;

  const worlds: [string, Record<DensityLevel, DensitySet>][] = [
    ["fine", density],
    ["coarse", coarse],
  ];

  for (const [worldName, world] of worlds) {
    for (const [levelName, set] of Object.entries(world)) {
      it(`sits between the plain padding and half the box at ${worldName} x ${levelName}`, () => {
        for (let i = 0; i < 4; i++) {
          // Wider than the plain padding — a pill set equal to its base is the correction
          // not shipping — and never past half the height, where the cap begins.
          expect(set.pxPill[i]!).toBeGreaterThan(set.px[i]!);
          expect(set.pxPill[i]!).toBeLessThanOrEqual(set.height[i]! / 2);
          const fraction = set.pxPill[i]! / set.height[i]!;
          expect(fraction).toBeGreaterThanOrEqual(FLOOR);
          expect(fraction).toBeLessThanOrEqual(CEILING);
        }
      });

      it(`grows with the size index at ${worldName} x ${levelName}`, () => {
        expect(increasing(set.pxPill)).toBe(true);
      });
    }
  }

  it("orders compact < default < comfortable at every size, the way px does", () => {
    for (const world of worlds.map(([, w]) => w)) {
      for (let i = 0; i < 4; i++) {
        expect(world.compact.pxPill[i]!).toBeLessThan(world.default.pxPill[i]!);
        expect(world.default.pxPill[i]!).toBeLessThan(world.comfortable.pxPill[i]!);
      }
    }
  });

  it("resolves to the plain padding at every level except full — the identity is the escape", () => {
    // The identity rides wherever px is declared, so it re-substitutes per scope
    // (substitution-at-declaration, §6); only the full cells state raw numbers.
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`control-px-pill-${size}`)).toBe(`var(--control-px-${size})`);
    }
    expect(block(`[data-radius="full"][data-density="compact"]`)).toContain(
      `--control-px-pill-1: calc(${density.compact.pxPill[0]}px * var(--scale));`,
    );
    // The pointer cells exist, because unlike the control radii there is no palette
    // indirection to carry the level into a pointer world: the values are raw.
    expect(block(`[data-pointer="coarse"][data-radius="full"][data-density="default"]`)).toContain(
      `--control-px-pill-2: calc(${coarse.default.pxPill[1]}px * var(--scale));`,
    );
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

  it("carries the zoom floor as a per-world token, zero where nothing zooms (§4)", () => {
    // Safari zooms the page when a text input under 16px takes focus. It rides the pointer
    // axis rather than a bare @media, so it resolves through the same scopes everything else
    // does — pinnable, escapable, and readable as a computed value in the browser suite.
    // Raw px in both worlds: the threshold is Safari's and does not move with --scale.
    expect(declaration("input-font-floor")).toBe("0px");
    expect(block(`[data-pointer="fine"]`)).toContain("--input-font-floor: 0px;");
    expect(block(`[data-pointer="coarse"]`)).toContain(`--input-font-floor: ${inputFontFloor}px;`);
    expect(block(`  [data-pointer="auto"]`)).toContain(`--input-font-floor: ${inputFontFloor}px;`);
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

  it("never touches the space palette — gutters must not inflate on the smaller screen", () => {
    // Type is deliberately NOT excluded from the world block any more: since the `device`
    // prop was dropped (2026-08-05), the handheld band rides these scopes — the band laws
    // below pin exactly which steps, and the density cells stay type-free.
    for (const scope of [`[data-pointer="coarse"]`, `[data-pointer="coarse"][data-density="compact"]`]) {
      const body = block(scope);
      expect(body).not.toMatch(/^\s*--space-\d+:/m);
      expect(body).not.toMatch(/^\s*--layout-space-\d+:/m);
    }
    expect(block(`[data-pointer="coarse"][data-density="compact"]`)).not.toContain("--font-size-");
  });
});

describe("the two type bands, and only type (§15, §17, split 2026-08-05)", () => {
  /** The declarations of a scope, trimmed — for comparing two bands independent of indent. */
  const decls = (selector: string) =>
    block(selector)
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("--"));

  /** The steps a band moves — the same derivation the generator makes. */
  const moved = (picks: readonly number[]) => picks.flatMap((p, i) => (p === i + 1 ? [] : [i]));

  /** The narrow band's body. Not `block(":root")`: the narrow band is an unattributed :root
   *  rule inside a media query, and so is the P3 @supports block that precedes it — indexOf
   *  would find that one and the laws would assert against the wrong scope. */
  const narrowBand = () => {
    const start = css.indexOf(`@media ${narrowMedia} {`);
    if (start === -1) throw new Error("no narrow band — the suite would assert nothing");
    return css.slice(start, css.indexOf("\n  }", start));
  };

  it("each band emits ONLY the steps it moves — which is what lets two bands coexist", () => {
    // The single band this replaced emitted all nine steps, so two bands would have silently
    // overwritten each other's answer on a phone, where both apply. Handheld owns 1-4 (a held
    // screen is close to the eye), narrow owns 8-9 (a narrow screen is seven characters wide),
    // and 5-7 are nobody's. The handheld band rides the POINTER world's own block — there is
    // no data-device attribute since the prop was dropped (2026-08-05, LOG).
    expect(moved(typeBands.handheld).map((i) => i + 1)).toEqual([1, 2, 3, 4]);
    expect(moved(typeBands.narrow).map((i) => i + 1)).toEqual([8, 9]);
    expect(moved(typeBands.handheld).some((i) => moved(typeBands.narrow).includes(i))).toBe(false);

    for (const step of [1, 4]) {
      expect(block(`[data-pointer="coarse"]`)).toContain(`--font-size-${step}:`);
      expect(narrowBand()).toContain(`--font-size-${step === 1 ? 8 : 9}:`);
    }
    for (const step of [5, 6, 7, 8, 9]) {
      expect(block(`[data-pointer="coarse"]`)).not.toContain(`--font-size-${step}:`);
    }
  });

  it("a band's step is the palette's designed TRIPLE at the picked index — never a mixed pair", () => {
    // The whole point of re-picking an index rather than scaling a value: font-size, line
    // height and letter spacing arrive as one designed step, so a band cannot ship an 18px
    // face on a 24px line with 16px tracking.
    for (const [body, picks] of [
      [block(`[data-pointer="coarse"]`), typeBands.handheld],
      [narrowBand(), typeBands.narrow],
    ] as const) {
      for (const i of moved(picks)) {
        const pick = picks[i]!;
        expect(body).toContain(`--font-size-${i + 1}: calc(${fontSize[pick - 1]}px * var(--scale));`);
        expect(body).toContain(`--line-height-${i + 1}: calc(${lineHeight[pick - 1]}px * var(--scale));`);
        expect(body).toContain(`--letter-spacing-${i + 1}: ${letterSpacing[pick - 1]}em;`);
      }
    }
  });

  it("fine is the identity over the HANDHELD band's steps, and says nothing about width", () => {
    // Theme stamps data-pointer on every node, so a fine Theme nested in a coarse region
    // would otherwise inherit the risen reading sizes (§16's default-escape lesson). It must
    // NOT re-declare 8-9: a pointer says nothing about how wide the window is, and
    // re-declaring them would let a `fine` Theme undo the narrow band inside a 375px viewport.
    const body = block(`[data-pointer="fine"]`);
    for (const i of moved(typeBands.handheld)) {
      expect(body).toContain(`--font-size-${i + 1}: calc(${fontSize[i]}px * var(--scale));`);
      expect(body).toContain(`--line-height-${i + 1}: calc(${lineHeight[i]}px * var(--scale));`);
    }
    for (const i of moved(typeBands.narrow)) {
      expect(body).not.toContain(`--font-size-${i + 1}:`);
    }
  });

  it("handheld rides the POINTER alone, and narrow rides width alone — no conjunction", () => {
    // The conjunction this replaces got the middle of the range wrong in both directions.
    // Apple ships ONE Dynamic Type table for iOS and iPadOS — Body is 17pt on both — so the
    // reading question does not distinguish phone from tablet, and the width half excluded
    // every iPad from a rise it should have had.
    expect(handheldMedia).toBe("(pointer: coarse)");
    expect(handheldMedia).not.toContain("width");
    expect(narrowMedia).toContain("max-width");
    expect(narrowMedia).not.toContain("pointer");

    const media = css.indexOf(`@media ${handheldMedia} {`);
    expect(media).toBeGreaterThan(-1);
    expect(css.indexOf(`[data-pointer="auto"]`)).toBeGreaterThan(media);
    // The auto world IS the coarse world, band included — one designed set, two ways in.
    expect(decls(`  [data-pointer="auto"]`)).toEqual(decls(`[data-pointer="coarse"]`));
  });

  it("the narrow band carries no attribute — width is not a device fact", () => {
    // There is nothing here to escape: a Theme pinned to `fine` inside a 375px window
    // still has a 375px window. It sits on :root and inherits into every Theme scope, and it
    // is emitted LAST so it wins the :root-versus-:root tie against the base palette.
    const narrow = css.indexOf(`@media ${narrowMedia} {`);
    expect(narrow).toBeGreaterThan(-1);
    expect(narrow).toBeGreaterThan(css.indexOf(`[data-pointer="coarse"] {`));
    expect(css.slice(narrow, narrow + 200)).not.toContain("data-pointer");
  });

  it("the narrow band touches nothing but type, and no other axis touches type", () => {
    // Narrow re-prices display steps and nothing else — geometry is the pointer axis's,
    // spacing is nobody's (§16). The handheld band's own footprint is pinned by the
    // emits-only-what-it-moves law above; density and radius never declare a type token,
    // which is why the bands need no interaction cells with either.
    for (const stem of ["--space-", "--layout-space-", "--control-", "--radius", "--icon-size-", "--surface-p-"]) {
      expect(narrowBand()).not.toContain(stem);
    }
    for (const scope of [`[data-density="compact"]`, `[data-density="comfortable"]`, `[data-radius="full"]`]) {
      expect(block(scope)).not.toContain("--font-size-");
      expect(block(scope)).not.toContain("--line-height-");
    }
  });

  it("both bands stay inside the palette and never re-order a step", () => {
    for (const picks of Object.values(typeBands)) {
      expect(picks).toHaveLength(fontSize.length);
      expect(picks.every((p) => p >= 1 && p <= fontSize.length)).toBe(true);
      // A larger step never renders smaller than the one below it, in either band or in
      // their composition — the ladder may collapse, it may not invert.
      expect(picks.every((p, i) => i === 0 || p >= picks[i - 1]!)).toBe(true);
    }
    // The direction of each band is its reason for existing (the values are taste): reading rises
    // toward the HIG's 17pt, display falls because a short line cannot hold 56px.
    expect(typeBands.handheld[2]!).toBeGreaterThan(3);
    expect(typeBands.narrow[8]!).toBeLessThan(9);
    // ...and each band leaves the OTHER's steps alone, which is the split itself.
    expect(typeBands.handheld[8]).toBe(9);
    expect(typeBands.narrow[2]).toBe(3);
  });

  it("composes to the four real cells, and two of them were wrong before the split", () => {
    // The composition is what a device actually gets. Read as: [reading step 3, display 9].
    const px = (band: readonly number[], i: number) => fontSize[band[i]! - 1]!;
    const desktopWide = [px([1, 2, 3, 4, 5, 6, 7, 8, 9], 2), px([1, 2, 3, 4, 5, 6, 7, 8, 9], 8)];
    const phone = [px(typeBands.handheld, 2), px(typeBands.narrow, 8)];
    const tabletLandscape = [px(typeBands.handheld, 2), px([1, 2, 3, 4, 5, 6, 7, 8, 9], 8)];
    const narrowDesktop = [px([1, 2, 3, 4, 5, 6, 7, 8, 9], 2), px(typeBands.narrow, 8)];

    expect(desktopWide).toEqual([16, 56]);
    expect(phone).toEqual([18, 40]);
    // The two the single band got wrong: a tablet rises AND keeps its display size...
    expect(tabletLandscape).toEqual([18, 56]);
    // ...and a squeezed desktop window cuts its display without touching reading sizes.
    expect(narrowDesktop).toEqual([16, 40]);
  });
});

describe("radius levels are designed palettes, not a factor (§6)", () => {
  const level = (name: RadiusLevel) => block(`[data-radius="${name}"]`);

  it("carries no radius factor anywhere", () => {
    expect(code).not.toContain("var(--radius-factor)");
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
    for (const step of [...radiusSurface, ...radiusOverlay]) {
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
      // And the overlay band with it (§24, 2026-08-10): it became size-indexed the day Dialog
      // took the size index, so it has exactly the same substitution problem the line above
      // exists for — a :root-only declaration would leave every dialog inside a [data-radius]
      // subtree wearing the default level's corner.
      for (let size = 1; size <= 4; size++) {
        expect(level(name)).toContain(`--radius-overlay-${size}: var(--radius-${radiusOverlay[size - 1]})`);
      }
    }
  });

  it("surface picks are size-ordered within the band, and the band sits between control and overlay", () => {
    expect([...radiusSurface].every((v, i) => i === 0 || v > radiusSurface[i - 1]!)).toBe(true);
    expect(radiusSurface[0]).toBeGreaterThan(5);
    expect(radiusOverlay[3]).toBeGreaterThan(radiusSurface[3]!);
  });

  it("a dialog is rounder than the card of its own size, at every index and every level (§24)", () => {
    // The overlay band leans one step up the surface band rather than living apart from it,
    // so this is what makes "an overlay is not a card" true in pixels rather than in prose.
    // Read off the emitted PALETTE per level, not off the picks, because `full` re-prices
    // every step and a band that merely picked higher indices could still tie there.
    expect([...radiusOverlay].every((v, i) => i === 0 || v > radiusOverlay[i - 1]!)).toBe(true);
    for (const name of ["small", "medium", "large", "full"] as const) {
      const { steps } = radiusLevels[name];
      for (let size = 1; size <= 4; size++) {
        expect(steps[radiusOverlay[size - 1]!]!).toBeGreaterThan(steps[radiusSurface[size - 1]!]!);
      }
    }
    // Except at `none`, where the kill switch outranks every family (§6).
    for (const step of radiusOverlay) expect(radiusLevels.none.steps[step]).toBe(0);
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

describe("the mark family is the line box, and nothing designed twice (§4)", () => {
  // Checkbox, radio, switch track and slider thumb are one visual weight class, and four
  // separately designed ladders in one weight class drift. The ladder is an identity rather
  // than a ratio: a mark occupies exactly one line of the label it sits beside.
  const markIn = (scope: string, i: number) => inScope(scope, `mark-${i}`);
  const lineIn = (scope: string, i: number) => inScope(scope, `line-height-${i}`);

  it("resolves to the line box at :root and in the fine world — all FIVE steps (§4)", () => {
    // Five, not four, since 2026-08-08: the switch's track is mark(n + 1), so size 4 points
    // one step past the old top and --mark-5 is the line box of type step 5, same sentence.
    for (const scope of [":root", '[data-pointer="fine"]']) {
      for (let i = 1; i <= 5; i++) {
        expect(markIn(scope, i), `${scope} mark ${i}`).toBe(lineIn(":root", i));
      }
    }
  });

  it("rises in the coarse world because the TYPE rose — the handheld band, not a second ladder", () => {
    // The whole argument for sourcing the family from type: Spectrum grows every component
    // 1.25x on touch, and this arrives at the same place with no coarse ladder to maintain.
    // Step 5 is the exception the band itself makes: handheld prices steps 4 and 5 alike,
    // so --mark-5 HOLDS rather than rises — which is exactly the recorded wrinkle (a coarse
    // size-4 switch stands as tall as the checkbox beside it), asserted rather than skipped.
    for (const scope of ['[data-pointer="coarse"]']) {
      for (let i = 1; i <= 5; i++) {
        const band = typeBands.handheld[i - 1]!;
        expect(markIn(scope, i), `${scope} mark ${i}`).toBe(lineIn(":root", band));
        const coarse = parseFloat(markIn(scope, i)!.match(/[\d.]+/)![0]);
        const fine = parseFloat(markIn(":root", i)!.match(/[\d.]+/)![0]);
        if (i === 5) expect(coarse, "the band's own collapse").toBe(fine);
        else expect(coarse).toBeGreaterThan(fine);
      }
    }
  });

  it("is declared in FULL in every pointer scope — a partial re-declaration inherits the world above", () => {
    for (const scope of [":root", '[data-pointer="fine"]', '[data-pointer="coarse"]']) {
      for (let i = 1; i <= 5; i++) expect(markIn(scope, i), `${scope} is missing mark ${i}`).toBeDefined();
    }
  });

  it("never rides density — a mark sits beside a label, and the label does not move either (§4)", () => {
    for (const level of ["compact", "comfortable"] as const) {
      for (const { selector, body } of everyDensityBlock(level)) {
        expect(body, `${selector} moves the mark ladder`).not.toContain("--mark-");
      }
    }
  });

  it("takes --scale like every other length", () => {
    for (let i = 1; i <= 5; i++) expect(markIn(":root", i)).toContain("var(--scale)");
  });
});

describe("the icon box answers the pointer world, and only the pointer world (§4)", () => {
  // Added 2026-08-10, from the playground: the icon was the ONE thing inside a control that
  // the coarse world did not re-price. A size-2 button grew 32 → 44, its label 14 → 16 and its
  // checkbox sibling 16 → 20, while the glyph sat at 16 in both worlds and read thin against
  // all of it. The reason in config was a DENSITY argument ("a compact size 2 and a
  // comfortable size 2 carry the same icon" — true) that had been extended to pointer in the
  // same sentence, and pointer is not breathing room: coarse means the screen is held close,
  // which is why type rises there.
  const iconIn = (scope: string, i: number) => inScope(scope, `icon-size-${i}`);
  const px = (v: string | undefined) => parseFloat(v!.match(/[\d.]+/)![0]);

  it("is declared in FULL by :root and by BOTH worlds — a partial scope inherits the one above", () => {
    for (const scope of [":root", '[data-pointer="fine"]', '[data-pointer="coarse"]']) {
      for (let i = 1; i <= iconSize.fine.length; i++) {
        expect(iconIn(scope, i), `${scope} is missing icon ${i}`).toBeDefined();
      }
    }
  });

  it(":root and the fine world are the same ladder — the un-themed default is the fine one", () => {
    for (let i = 1; i <= iconSize.fine.length; i++) {
      expect(iconIn(":root", i)).toBe(iconIn('[data-pointer="fine"]', i));
    }
  });

  it("coarse is never smaller, and actually rises somewhere — a world that changes nothing is the bug", () => {
    let rose = false;
    for (let i = 1; i <= iconSize.fine.length; i++) {
      const coarse = px(iconIn('[data-pointer="coarse"]', i));
      const fine = px(iconIn(":root", i));
      expect(coarse, `icon ${i} shrank on touch`).toBeGreaterThanOrEqual(fine);
      if (coarse > fine) rose = true;
    }
    // The vacuity guard the mark round taught: every assertion above is satisfied by a coarse
    // ladder identical to the fine one, which is the state this law was written against.
    expect(rose, "the coarse world re-declares the icon box and moves nothing").toBe(true);
  });

  it("never rides density — a compact control is the same control with less air (§4)", () => {
    for (const level of ["compact", "comfortable"] as const) {
      for (const { selector, body } of everyDensityBlock(level)) {
        expect(body, `${selector} moves the icon box`).not.toContain("--icon-size-");
      }
    }
  });

  it("stays on the drawing grid both worlds — an off-grid raster blurs its strokes", () => {
    // The reason sizes 1 and 2 share a value, and the reason coarse tops out at 24 rather
    // than continuing the ladder: 16/20/24 is what the icon sets are drawn for.
    for (const ladder of Object.values(iconSize)) {
      for (const px of ladder) expect([16, 20, 24], `${px} is off the drawing grid`).toContain(px);
    }
  });

  it("takes --scale like every other length", () => {
    for (let i = 1; i <= iconSize.fine.length; i++) {
      expect(iconIn('[data-pointer="coarse"]', i)).toContain("var(--scale)");
    }
  });
});

describe("the switch's width ladder rides the band, and nothing is designed twice (§4)", () => {
  const widthIn = (scope: string, i: number) => inScope(scope, `switch-w-${i}`);
  const value = (decl: string | undefined) => parseFloat(decl!.match(/[\d.]+/)![0]);

  it("emits all four cells in every pointer scope, scaled, monotone across the index", () => {
    for (const scope of [":root", '[data-pointer="fine"]', '[data-pointer="coarse"]']) {
      const values = [1, 2, 3, 4].map((i) => value(widthIn(scope, i)));
      for (let i = 1; i <= 4; i++) {
        expect(widthIn(scope, i), `${scope} is missing switch-w ${i}`).toContain("var(--scale)");
        if (i > 1) expect(values[i - 1]!, `${scope} not monotone at ${i}`).toBeGreaterThanOrEqual(values[i - 2]!);
      }
    }
  });

  it("the coarse cell IS the fine ladder one entry up — the mark's own derivation, not a second design", () => {
    // switchW is indexed by the track's mark step and both worlds read it through the band
    // picks, so coarse size n must equal fine size n+1 with the top cell repeating where
    // the band collapses. If this fails, someone gave a pointer world its own numbers.
    for (let i = 1; i <= 3; i++) {
      expect(value(widthIn('[data-pointer="coarse"]', i))).toBe(
        value(widthIn('[data-pointer="fine"]', i + 1)),
      );
    }
    expect(value(widthIn('[data-pointer="coarse"]', 4))).toBe(
      value(widthIn('[data-pointer="fine"]', 4)),
    );
  });

  it("every cell is wider than its own track — 1.5x to 2x, the capsule's working band", () => {
    // The track at size n is mark(n + 1) in the same world. Under 1.5 the thumb has almost
    // no travel and the control reads as a checkbox; past 2 it reads as a slider. The
    // designed cells sit at 1.67-1.71 (peers: iOS 1.65, Material 1.63, Radix 1.75) but the
    // LAW pins the band, not the taste — the numbers are judged in the preview.
    const markIn = (scope: string, i: number) =>
      value(block(scope).match(new RegExp(`--mark-${i}:\\s*([^;]+);`))?.[1]);
    for (const world of ['[data-pointer="fine"]', '[data-pointer="coarse"]'] as const) {
      for (let i = 1; i <= 4; i++) {
        const ratio = value(widthIn(world, i)) / markIn(world, i + 1);
        expect(ratio, `${world}/size ${i}`).toBeGreaterThan(1.5);
        expect(ratio, `${world}/size ${i}`).toBeLessThan(2);
      }
    }
  });

  it("never rides density — the box it widens does not move either", () => {
    // Every density-scoped block, including the six inside the pointer worlds. The width is
    // emitted at `:root` and in `pointerWorld()` and never in the bare density block, so the
    // first spelling of this law asserted absence in the one scope the family cannot appear
    // in — green by construction (audit 2026-08-08).
    for (const level of ["compact", "comfortable"] as const) {
      for (const { selector, body } of everyDensityBlock(level)) {
        expect(body, `${selector} moves the switch width`).not.toContain("--switch-w-");
      }
    }
  });

  it("the thumb's inset is one designed value, emitted once, scaled", () => {
    expect(declaration("switch-inset")).toContain("var(--scale)");
    expect(code.match(/--switch-inset:/g)).toHaveLength(1);
  });
});

describe("a mark's corner holds a fraction of ITS OWN box (§6)", () => {
  // The law that did not exist when the corner shipped, and the one that would have caught it:
  // it rode --radius-control-N, which is designed against the HEIGHT ladder and is density-
  // indexed, so the fraction climbed 0.250 -> 0.385 across the index and reached 0.462 at
  // comfortable size 4 — a circle in all but name, arrived at by an axis rather than a theme,
  // which is why the `full` ceiling never saw it. Fractions, not values: the picks are taste.
  const value = (decl: string | undefined) => parseFloat(decl!.match(/[\d.]+/)![0]);
  const markIn = (scope: string, i: number) => value(inScope(scope, `mark-${i}`));
  const cornerIn = (scope: string, i: number) => value(inScope(scope, `radius-mark-${i}`));

  for (const level of ["small", "medium", "large", "full"] as const) {
    it(`holds 0.05-0.40 of the box at every size, level ${level}, both pointer worlds`, () => {
      const scope = level === defaultRadiusLevel ? ":root" : `[data-radius="${level}"]`;
      for (const world of [":root", '[data-pointer="coarse"]']) {
        for (let i = 1; i <= 4; i++) {
          const fraction = cornerIn(scope, i) / markIn(world, i);
          // A wide band on purpose: how ROUND a mark is at a given level is the theme's call
          // (`small` runs 0.08-0.13, `large` about 0.31-0.38), and this only catches a corner
          // that has stopped being a corner. The law carrying the actual complaint is the
          // spread one below — a level may be tight or round, but not both at once.
          expect(fraction, `${level}/${world}/size ${i} is ${fraction.toFixed(3)} of its box`)
            .toBeGreaterThanOrEqual(0.05);
          expect(fraction).toBeLessThan(0.4);
        }
      }
    });

    it(`varies by under 1.4x across the index at ${level}, in BOTH pointer worlds`, () => {
      // The complaint that found the bug, stated as a law (Kushagra, by eye: "size 4 looks
      // much more rounded than size 1"). The shipped ladder spread 0.250 -> 0.385, a 54%
      // monotonic climb.
      //
      // Both worlds, because the first spelling of this law pinned the denominator to :root
      // (audit D7) while the sibling laws above and below iterated the coarse scope — so the
      // world the phone actually renders was asserted nowhere, and it ships a 1.3846 spread.
      // The ceiling is 1.4 rather than the 1.34 first written: the coarse spread is a
      // non-monotonic one-notch wobble (size 2 tightest, size 3 roundest, size 4 back at
      // size 1's fraction), not the climb the complaint named, and the palette's granularity
      // cannot do better without a designed raw ladder that would go deaf to the radius
      // levels. Flagged for the eye pass with the rest of the corner numbers.
      const scope = level === defaultRadiusLevel ? ":root" : `[data-radius="${level}"]`;
      for (const world of [":root", '[data-pointer="coarse"]']) {
        const fractions = [1, 2, 3, 4].map((i) => cornerIn(scope, i) / markIn(world, i));
        expect(
          Math.max(...fractions) / Math.min(...fractions),
          `${level} in ${world}`,
        ).toBeLessThan(1.4);
      }
    });
  }

  it("is never half the box — half IS a circle, and a circular checkbox is a radio", () => {
    for (const level of Object.keys(radiusLevels) as RadiusLevel[]) {
      const scope = level === defaultRadiusLevel ? ":root" : `[data-radius="${level}"]`;
      for (const world of [":root", '[data-pointer="coarse"]']) {
        for (let i = 1; i <= 4; i++) {
          expect(cornerIn(scope, i), `${level}/${world}/${i}`).toBeLessThan(markIn(world, i) / 2);
        }
      }
    }
  });

  it("holds at `large` when the theme says `full` — a corner stops getting rounder, never retreats", () => {
    // The surface band's own sentence (§6), one band over.
    for (let i = 1; i <= 4; i++) {
      expect(cornerIn('[data-radius="full"]', i)).toBe(cornerIn('[data-radius="large"]', i));
    }
  });

  it("`none` still squares it — a kill switch with an exception is not a kill switch (§6)", () => {
    for (let i = 1; i <= 4; i++) expect(cornerIn('[data-radius="none"]', i)).toBe(0);
  });

  it("DENSITY never touches it, because density never touches the box it rounds", () => {
    // The half of the defect no theme could have exposed: --radius-control-N is density-indexed,
    // so an axis that leaves the mark's box alone was re-cutting its corner.
    for (const level of ["compact", "comfortable"] as const) {
      expect(block(`[data-density="${level}"]`)).not.toContain("--radius-mark-");
    }
  });

  it("is re-declared in every radius level's own scope (substitution-at-declaration, §6)", () => {
    for (const level of Object.keys(radiusLevels) as RadiusLevel[]) {
      expect(block(`[data-radius="${level}"]`), `${level} inherits a baked corner`).toContain(
        "--radius-mark-1:",
      );
    }
  });
});

describe("the tone-independent hairline (§7, §11)", () => {
  it("is declared in every appearance scope, so a dark subtree does not inherit a light edge", () => {
    for (const scope of [":root", '[data-appearance="light"]', '[data-appearance="dark"]']) {
      expect(block(scope), `${scope} has no --color-border`).toContain("--color-border:");
    }
  });

  it("resolves through neutral's own border role, never a raw step", () => {
    // A role, not a coincidence (§13): if this ever became --neutral-7 directly, a contrast
    // shift that moved the family's border would leave this one behind.
    expect(declaration("color-border")).toBe("var(--neutral-border)");
  });
});

describe("the slider's track: a designed raw ladder held to its thumb (§4, §11)", () => {
  const value = (decl: string | undefined) => parseFloat(decl!.match(/[\d.]+/)![0]);
  const trackAt = (i: number) =>
    value(block(":root").match(new RegExp(`--slider-track-${i}:\\s*([^;]+);`))?.[1]);
  const markIn = (scope: string, i: number) =>
    value(block(scope).match(new RegExp(`--mark-${i}:\\s*([^;]+);`))?.[1]);

  it("emits all four steps, scaled, monotone across the index", () => {
    const values = [1, 2, 3, 4].map(trackAt);
    expect(increasing(values)).toBe(true);
    for (let i = 1; i <= 4; i++) {
      expect(block(":root").match(new RegExp(`--slider-track-${i}:\\s*([^;]+);`))?.[1]).toContain(
        "var(--scale)",
      );
    }
  });

  it("never outweighs its thumb — under half the mark at every size, in BOTH pointer worlds", () => {
    // The track is the bed the thumb runs in, and a bed thicker than half its handle reads as
    // a bar with a bead stuck to it. The ladder is pointer-invariant while the mark is not, so
    // the coarse world is where this could silently fail: the fine fraction (~0.25) loosens
    // there, and this pins that it never crosses the half.
    for (const world of [":root", '[data-pointer="coarse"]']) {
      for (let i = 1; i <= 4; i++) {
        expect(trackAt(i), `${world}/size ${i}`).toBeLessThan(markIn(world, i) / 2);
      }
    }
  });

  it("no density and no pointer scope re-prices it — the coarse target is the control's height", () => {
    // iOS holds its track at 4pt against a 28pt thumb: the finger's allowance is the box, not
    // the line. If a scope ever re-declares this family, that is a decision, not a drift.
    for (const level of ["compact", "comfortable"] as const) {
      expect(block(`[data-density="${level}"]`)).not.toContain("--slider-track-");
    }
    for (const world of ['[data-pointer="fine"]', '[data-pointer="coarse"]']) {
      expect(block(world)).not.toContain("--slider-track-");
    }
  });
});

describe("the track well (§7, §11) — the low neutral bed a value runs in", () => {
  it("is declared in every appearance scope, like the hairline it sits beside", () => {
    for (const scope of [":root", '[data-appearance="light"]', '[data-appearance="dark"]']) {
      expect(block(scope), `${scope} has no --color-track`).toContain("--color-track:");
    }
  });

  it("resolves through a neutral step, never a raw hex — contrast reaches it through the scale", () => {
    // The role exists because §11's "track low" is the checkbox's "neutral off" one control
    // over, and a component that stamps `accent` for its fill can only say neutral through a
    // tone-independent role. A raw hex here would go deaf to contrast="high".
    // The ALPHA ramp joined the accepted forms 2026-08-17: a well is a hollow, and a hollow
    // reads by darkening whatever it is cut into — one solved value that holds on the page,
    // on a card and on glass, where an opaque step is priced against exactly one bed. It is
    // still a step of the neutral scale, which is the whole of what this law guards.
    expect(declaration("color-track")).toMatch(/^var\(--neutral-a?\d+\)$/);
  });
});

describe("the look axis is DELETED; the dress and the surface edge survive it (§19)", () => {
  it("no look attribute or role survives in the artifact — either axis", () => {
    // controlLook died 2026-08-19 (the fill-first flip made its two values byte-identical);
    // surfaceLook died 2026-08-20 (its non-default value was never judged or used). A
    // deletion owes the negative in the ARTIFACT, not just the types: a resurrected
    // [data-*-look] block would compile, stamp nothing (Theme lost both props) and dress
    // nobody — "exists and does nothing", the exact state that got each prop deleted.
    expect(css).not.toContain("data-control-look");
    expect(css).not.toContain("data-surface-look");
    expect(css).not.toContain("--look-");
    // And no hand-authored sheet reads a look role: a consumption site that survived the
    // deletion would resolve its fallback forever — a working page hiding a dead chain.
    const sheets = allStylesheets().map(sheet).join("\n");
    expect(sheets).not.toContain("var(--look-");
    expect(sheets).not.toContain("data-surface-look");
    expect(sheets).not.toContain("data-control-look");
  });

  it("the dress is unconditional: emitted in every base scope, consumed by the sheets", () => {
    // The field and mark dress emitted UNCONDITIONALLY in every base scope (the un-themed
    // document and both appearances), fills on the alpha ramp with their opaque glass twins
    // beside them, edges as the alpha the fill-first flip chose.
    for (const scope of [":root", '[data-appearance="light"]', '[data-appearance="dark"]']) {
      const body = block(scope);
      for (const family of ["field", "mark"] as const) {
        for (const slot of ["fill", "fill-hover", "fill-active"] as const) {
          expect(body, `${scope}: dress-${family}-${slot}`).toMatch(
            new RegExp(`--dress-${family}-${slot}: var\\(--neutral-a\\d+\\);`),
          );
          expect(body, `${scope}: dress-${family}-${slot}-solid`).toMatch(
            new RegExp(`--dress-${family}-${slot}-solid: var\\(--neutral-\\d+\\);`),
          );
        }
        expect(body, `${scope}: dress-${family}-edge`).toMatch(
          new RegExp(`--dress-${family}-edge: var\\(--neutral-a\\d+\\);`),
        );
      }
      // The surface family's dress rows died with surfaceLook: they were `filled`'s pigment
      // and nothing reads them. An emitted role nobody consumes is dead bytes and a lever.
      expect(body, `${scope} re-grew the surface dress`).not.toContain("--dress-surface-");
    }
    // And the sheets actually consume the dress — a dress emitted for families that stopped
    // reading it would be the axis's own death repeated one layer down.
    const sheets = allStylesheets().map(sheet).join("\n");
    for (const name of ["dress-field-fill", "dress-mark-fill", "dress-field-edge", "dress-mark-edge"]) {
      expect(sheets, `nothing consumes --${name}`).toContain(`var(--${name}`);
    }
  });

  it("the surface edge rests transparent, and stands down wherever a pigment line is owed", () => {
    // The lab's pane is borderless at rest (2026-08-17, Kushagra: match the lab): its edge
    // is light — the ring on glass, the pool and cast on solid — never a pigment hairline.
    // `--surface-edge` holds a live `transparent` in every base scope, and exists to be
    // re-declared: `initial` makes the consumption fallback (var(--tone-border)) resolve AT
    // THE ELEMENT, where the tone lives — the material edge's own pattern (§6, §10).
    for (const scope of [":root", '[data-appearance="light"]', '[data-appearance="dark"]']) {
      expect(block(scope), scope).toContain("--surface-edge: transparent;");
    }
    // The conformance surface gets the hairline BACK: both high-contrast scopes re-declare
    // the surface edge AND the two dress edges to `initial`, so each consumption fallback
    // resolves the HC-strength edge exactly where one is owed. Proximity is safe without
    // scoped arms since the look blocks died: these roles live only in the appearance
    // scopes, and any Theme that re-declares them co-locates data-contrast (§5), so the HC
    // compound wins on specificity at that same element.
    for (const scope of [
      ':root[data-contrast="high"], [data-appearance="light"][data-contrast="high"]',
      '[data-appearance="dark"][data-contrast="high"]',
    ]) {
      expect(block(scope), `${scope} must restore the surface edge`).toContain("--surface-edge: initial;");
      expect(block(scope), `${scope} must restore the field edge`).toContain("--dress-field-edge: initial;");
      expect(block(scope), `${scope} must restore the mark edge`).toContain("--dress-mark-edge: initial;");
    }
    // And FLAT restores it at rest (2026-08-19): a flat world has no ring, pool or cast —
    // declaring the boundary away there left an ordinary Card at 1.026:1 against the page
    // with no border and no shadow (audit 2026-08-18).
    expect(blockIn(sheet("system/surfaces.css"), '[data-depth="flat"]')).toContain(
      "--surface-edge: initial;",
    );
    // The consumption site carries the fallback the stand-downs rely on.
    expect(sheet("system/surfaces.css")).toContain("var(--surface-edge, var(--tone-border))");
  });

  /**
   * The dress step a role resolves to, and WHICH LADDER it is on — read off the emitted
   * text, so the generator is in the loop. Both families live on the ALPHA ramp since
   * 2026-08-17: a dressed field or mark composites over whatever it is on, so one value
   * reads on the page, on a card and on glass. `--neutral-4` and `--neutral-a4` are not the
   * same colour and a law that reads only the digit would compare them as if they were —
   * returning the kind is what keeps the hierarchy assertions honest.
   */
  const dressStep = (mode: "light" | "dark", family: string, slot: string) => {
    const scope = mode === "light" ? ":root" : '[data-appearance="dark"]';
    const role = `dress-${family}-${slot}`;
    const decl = block(scope).match(new RegExp(`--${role}:\\s*([^;]+);`))?.[1];
    const m = /^var\(--neutral-(a?)(\d+)\)$/.exec(decl ?? "");
    expect(m, `${role} is not a neutral step in ${mode}: ${decl}`).toBeTruthy();
    return { index: Number(m![2]), ramp: m![1] === "a" };
  };

  it.each(["light", "dark"] as const)(
    "%s: the dress darkens by the hierarchy — field, then mark past it",
    (mode) => {
      // Each family is on the alpha ramp, and that is asserted first — the hierarchy below
      // is a comparison of indices, and comparing an opaque step to a ramp step as though
      // both were "4" is how this law would keep passing through a silent move of one
      // family onto the other's ladder.
      for (const family of ["field", "mark"]) {
        expect(dressStep(mode, family, "fill").ramp, `${family} changed ladders`).toBe(true);
      }
      expect(dressStep(mode, "field", "fill").index).toBeLessThanOrEqual(
        dressStep(mode, "mark", "fill").index,
      );
      // The interactive steps walk upward from their family's rest, so a press is visible.
      for (const family of ["field", "mark"]) {
        expect(dressStep(mode, family, "fill-hover").index).toBeGreaterThan(
          dressStep(mode, family, "fill").index,
        );
        expect(dressStep(mode, family, "fill-active").index).toBeGreaterThan(
          dressStep(mode, family, "fill-hover").index,
        );
      }
    },
  );

  it.each(["light", "dark"] as const)(
    "%s: a dressed mark never lands ON the thing it sits against",
    (mode) => {
      // The general rule this block once guarded for three families: a dressed fill must
      // differ from the fill of whatever it is painted on top of. Since the move to the ramp
      // (2026-08-17) that is guaranteed by construction — an alpha over a bed is never the
      // bed — so what is worth asserting is the construction itself, plus the one value that
      // would break it: a ramp step of a0, or an alpha solved to nothing, is the way
      // "composites over its bed" turns back into "is its bed", and it is the only way left.
      const mark = dressStep(mode, "mark", "fill");
      expect(mark.ramp, "the mark left the ramp — compare it to its bed by hand again").toBe(true);
      expect(mark.index, "a mark dressed at ramp step 0 IS whatever it sits on").toBeGreaterThan(0);
      const rampAlpha = block(mode === "light" ? ":root" : '[data-appearance="dark"]').match(
        new RegExp(`--neutral-a${mark.index}:[^;]*?([\\d.]+)%`),
      );
      expect(rampAlpha, `--neutral-a${mark.index} is not a solved alpha in ${mode}`).toBeTruthy();
      expect(Number(rampAlpha![1]), "the mark's dress composites to nothing").toBeGreaterThan(0);
    },
  );

  it.each(["light", "dark"] as const)("%s: the dress keeps a boundary at all", (mode) => {
    // Reversed 2026-08-06 (Kushagra, by eye): the first design set every dressed border to
    // `transparent` on the theory that a fill REPLACES a hairline. It does not — and the
    // trade had measured costs: an unchecked mark lost the boundary --control-edge was
    // minted for (audit D2), and contrast="high" had no edge left anywhere to strengthen.
    // The dress edges are always live now, so the same trade has no place to hide.
    for (const family of ["field", "mark"]) {
      expect(dressStep(mode, family, "edge").index).toBeGreaterThan(0);
    }
  });

  it("contrast=high stands the glass ring down beside the pigment edges", () => {
    // The pigment stand-downs are asserted in the surface-edge law above; the glass pane's
    // light edge yields to pigment the same way — the ring stands down, and the
    // element-scoped arm (asserted in its own law below) hands the pane --tone-border.
    for (const scope of [
      ':root[data-contrast="high"], [data-appearance="light"][data-contrast="high"]',
      '[data-appearance="dark"][data-contrast="high"]',
    ]) {
      expect(block(scope), `${scope}/ring`).toContain("--material-ring-opacity: 0;");
    }
  });

  it("contrast=high reaches a GLASS pane's edge — the ring yields and pigment arrives at the element", () => {
    // The 2026-08-18 audit measured an HC glass card at 1.000:1 on every side: the border was
    // a literal `transparent`, the conic ring painted unchanged, and the fallback the sheet's
    // comment relied on was unreachable. The repair is two halves and both are asserted: the
    // ring opacity zeroes in the HC scopes (above), and an ELEMENT-scoped arm declares the
    // hairline where the tone can resolve — a scope-level colour could never do that (§6).
    for (const form of [
      ':root[data-contrast="high"] [data-material], [data-appearance="light"][data-contrast="high"] [data-material]',
      '[data-appearance="dark"][data-contrast="high"] [data-material]',
    ]) {
      expect(block(form), form).toContain("--kui-glass-hc-edge: var(--tone-border);");
    }
    // The consumption site: every glass thickness block's border consults the HC arm first.
    const surfacesSheet = sheet("system/surfaces.css");
    const hits = surfacesSheet.match(/--kui-border-color: var\(--kui-glass-hc-edge, transparent\);/g) ?? [];
    expect(hits.length, "the three thickness blocks consume the HC edge").toBeGreaterThanOrEqual(3);
  });

  it("dark's floating veil is reachable by contrast=high — its alpha is a token, not a literal", () => {
    // Audit 2026-08-18: the dark floating fill baked floatingDark.alpha as a literal, so HC
    // strengthened every in-flow pane and left the one actually covering live content at its
    // standard alpha — measured identical at both contrasts while the cards beside it moved.
    const dark = block('[data-appearance="dark"]');
    const darkHigh = block('[data-appearance="dark"][data-contrast="high"]');
    for (const t of GLASS_MATERIALS) {
      expect(dark, `--material-${t}-alpha-floating exists`).toMatch(
        new RegExp(`--material-${t}-alpha-floating: [\\d.]+%;`),
      );
      expect(dark, `${t}: the floating fill reads the token`).toContain(
        `var(--material-${t}-alpha-floating)`,
      );
      expect(darkHigh, `${t}: HC re-declares the floating alpha`).toMatch(
        new RegExp(`--material-${t}-alpha-floating: [\\d.]+%;`),
      );
    }
  });

  it("the dead palette recedes from live in BOTH modes — per-mode steps, one config home", () => {
    // Audit 2026-08-18: the remap's literal a3 was one step under dark's live wells and
    // byte-identical to light's — a disabled button in light computed exactly a live medium
    // button's box in all four painted channels. The rule is now stated where it can be
    // checked: the dead fill sits STRICTLY below the live soft rest in its own mode's ramp,
    // and the dead border at or below the live dress edge.
    for (const mode of ["light", "dark"] as const) {
      const scope = mode === "light" ? ":root" : '[data-appearance="dark"]';
      const body = block(scope);
      expect(body).toContain(`--disabled-fill: var(--neutral-a${disabledSteps[mode].fill});`);
      expect(body).toContain(`--disabled-fill-solid: var(--neutral-${disabledSteps[mode].fill});`);
      expect(body).toContain(`--disabled-border: var(--neutral-a${disabledSteps[mode].border});`);
      const liveSoft = body.match(/--neutral-soft: var\(--neutral-a(\d+)\);/)?.[1];
      expect(liveSoft, `${mode}: the neutral soft rest is on the ramp`).toBeTruthy();
      expect(disabledSteps[mode].fill, `${mode}: dead fill must sit under live a${liveSoft}`).toBeLessThan(
        Number(liveSoft),
      );
      expect(disabledSteps[mode].border, `${mode}: dead border must not out-contrast the live edge`).toBeLessThanOrEqual(
        dress[mode].field.edge,
      );
    }
  });

  it("every dress role emitted is consumed, and every dress role consumed is emitted", () => {
    // The direction the dangling-var law below cannot see: it closes tokens.css over ITSELF,
    // so a role the hand-authored layers read but the generator never writes resolves to
    // nothing at runtime and passes every other law — and a role nobody reads is dead bytes
    // and a false promise. Both sets are computed, never listed. The `-solid` twins are
    // consumed only by the glass re-points, and `--surface-edge` rides along: same genus,
    // same failure mode.
    const scopes = [":root", '[data-appearance="light"]', '[data-appearance="dark"]'];
    const emitted = new Set(
      scopes.flatMap((scope) =>
        [...block(scope).matchAll(/--((?:dress-[\w-]+|surface-edge)):/g)].map((m) => m[1]!),
      ),
    );
    // `sheet()` strips comments, so a role merely NAMED in prose cannot satisfy either set.
    const sheets = allStylesheets().map(sheet).join("\n");
    const consumed = new Set(
      [...sheets.matchAll(/var\(\s*--((?:dress-[\w-]+|surface-edge))/g)].map((m) => m[1]!),
    );
    expect([...consumed].filter((n) => !emitted.has(n)), "consumed but never emitted").toEqual([]);
    expect([...emitted].filter((n) => !consumed.has(n)), "emitted but nothing reads it").toEqual([]);
  });
});

describe("no var() dangles — every reference the generator writes, it also declares (§6, §13)", () => {
  // The generator aliases by NAME in several places — ROLES maps fourteen role names onto
  // `--{tone}-{role}`, the semantic families point at palette steps — and a typo'd name would
  // emit `var(--tone-foo)`, resolve to nothing at runtime, and pass every law that greps for
  // the token it MEANT to write (the thing a name-grep can never catch, ENGINEERING §6). The
  // whole file is closed over its own vocabulary: tokens.css consumes no name it does not
  // declare, so the set of references minus the set of declarations must be empty.
  it("every var(--x) in tokens.css has a declaration in tokens.css", () => {
    // Comments stripped first — the law fired on its own first run against an emitted comment
    // explaining that the mark family is "resolved rather than var(--line-height-N)". A law a
    // comment can satisfy is not a law, and one a comment can FAIL is not one either.
    const code = css.replace(/\/\*[\s\S]*?\*\//g, " ");
    const declared = new Set([...code.matchAll(/--([\w-]+)\s*:/g)].map((m) => m[1]!));
    const referenced = new Set([...code.matchAll(/var\(\s*--([\w-]+)/g)].map((m) => m[1]!));
    const dangling = [...referenced].filter((name) => !declared.has(name));
    expect(dangling, `referenced but never declared: ${dangling.join(", ")}`).toEqual([]);
  });
});


describe("the material ladder is monotone in every lever (§10)", () => {
  // config.ts has stated this invariant in prose since the ladder shipped ("Monotone across
  // thicknesses must hold per column, not just at rest, so thickness still reads as one
  // dimension mid-interaction") — and nothing asserted it. Asserted from the config because
  // the claim is about the designed SET; the emitted spelling is covered by the drift law.
  const THICKNESSES = GLASS_MATERIALS;
  const rises = (values: readonly number[]) => {
    for (let i = 1; i < values.length; i++) expect(values[i]!).toBeGreaterThan(values[i - 1]!);
  };
  for (const mode of ["light", "dark"] as const) {
    it(`${mode}: thickness rises per column, states rise per thickness, high defends harder`, () => {
      for (const key of ["alpha", "alphaHigh"] as const) {
        for (const col of [0, 1, 2]) {
          rises(THICKNESSES.map((th) => material[mode][th][key][col]!));
        }
        for (const th of THICKNESSES) rises(material[mode][th][key]);
      }
      // The pane's own light: edge and rim rise with thickness (thicker glass catches more),
      // and the blur radius rises — thickness is one dimension in the filter too.
      for (const part of ["edge", "rim"] as const) {
        rises(THICKNESSES.map((th) => material[mode][th][part]));
      }
      // Fractional radii are real (2026-08-16: the judged ladder runs 2.4 / 4 / 5.6), and this
      // pattern used to be `\d+`, which does not match "2.4px" — so it returned null and the
      // law CRASHED rather than failing, which is a worse outcome than either. Decimals now.
      rises(THICKNESSES.map((th) => Number(material[mode][th].filter.match(/blur\(([\d.]+)px/)![1]!)));
      // alphaHigh is MORE opaque than normal at every cell and never reaches the seal: past
      // ~.9-and-change you should have used solid, and three thicknesses must stay three.
      for (const th of THICKNESSES) {
        material[mode][th].alpha.forEach((a, i) => {
          expect(material[mode][th].alphaHigh[i]!).toBeGreaterThan(a);
        });
        expect(material[mode][th].alphaHigh[2]!).toBeLessThan(100);
      }
    });
  }
});

describe("the scrim dims by mode and leans under high contrast (§10, §24)", () => {
  /** The alpha out of an `rgb(0 0 0 / A)` string — parsed, never rebuilt from the config
      value, so a respelled row is read as the browser would read it (the transmission law's
      own lesson: a law that reconstructs the generator's arithmetic agrees with its bugs). */
  const alphaOf = (value: string) => {
    const found = value.match(/\/\s*([\d.]+)\s*\)/);
    if (!found) throw new Error(`not an alpha colour: ${value}`);
    return Number(found[1]);
  };

  it("is emitted in both appearances, and dark dims harder than light", () => {
    const light = inScope(`[data-appearance="light"]`, "scrim-fill")!;
    const dark = inScope(`[data-appearance="dark"]`, "scrim-fill")!;
    expect(light).toBeDefined();
    expect(dark).toBeDefined();
    // The reason, stated as a measurement: a 40% veil over a near-black page moves almost
    // nothing, so the dark row has to carry more pigment to do the same job.
    expect(alphaOf(dark)).toBeGreaterThan(alphaOf(light));
    // And it is BLACK in both, never a mix of the page colour — see config's scrim note.
    for (const value of [light, dark]) expect(value).toMatch(/^rgb\(0 0 0 \//);
  });

  it("defocuses and desaturates — recession has a blur, and it is the lab's own (§24)", () => {
    // The ceiling died with the lab's judged scrim (2026-08-17): blur 8 sits ABOVE thick's
    // rendered 5.6, and that is the design, not a defect — the scrim defocuses the whole
    // application AT DISTANCE while a pane defends a readout an inch away; the lab ran the
    // no-defocus experiment (2026-08-15) and blur came back the same day, then judged the
    // depth of it against every material and kept 8. Two prior spellings of a ceiling
    // ("below thin", then "below thick") were both falsified by judged values, which is the
    // tell that no ceiling was ever load-bearing. What binds now: the recession is blur AND
    // desaturation (pigment alone reads as a filter dying), and both modes carry the same
    // designed blur — darkness varies by mode, defocus does not.
    const px = (s: string) => Number(s.match(/blur\(([\d.]+)px/)![1]);
    for (const mode of ["light", "dark"] as const) {
      const filter = inScope(`[data-appearance="${mode}"]`, "scrim-filter")!;
      expect(px(filter)).toBeGreaterThan(0);
      expect(filter).toContain("saturate(0.8)");
    }
    expect(px(inScope('[data-appearance="light"]', "scrim-filter")!)).toBe(
      px(inScope('[data-appearance="dark"]', "scrim-filter")!),
    );
  });

  it("contrast=\"high\" raises the dim and stands the blur down", () => {
    for (const scope of [":root[data-contrast=\"high\"]", `[data-appearance="dark"][data-contrast="high"]`]) {
      const body = css.slice(css.indexOf(`${scope}`));
      const fill = body.match(/--scrim-fill:\s*([^;]+);/)![1]!;
      const filter = body.match(/--scrim-filter:\s*([^;]+);/)![1]!;
      const mode = scope.includes("dark") ? "dark" : "light";
      expect(alphaOf(fill)).toBeGreaterThan(alphaOf(inScope(`[data-appearance="${mode}"]`, "scrim-fill")!));
      // `initial` is guaranteed-invalid on an unregistered custom property, so the consuming
      // var()'s fallback resolves at the element and the backdrop stops filtering — the
      // material edge's own spelling, not a second mechanism.
      expect(filter.trim()).toBe("initial");
    }
  });
});

describe("the alert's width ladder (§25)", () => {
  it("rises with the index, rides --scale, and is strictly narrower than the dialog's at every step", () => {
    const widths = [1, 2, 3, 4].map((n) => declaration(`alert-w-${n}`)!);
    for (const value of widths) expect(value).toMatch(/^calc\(\d+px \* var\(--scale\)\)$/);
    const px = widths.map((v) => Number(v.match(/(\d+)px/)![1]));
    expect(increasing(px)).toBe(true);
    // An alert interrupts with a question; a dialog hosts work. The relationship is the
    // decision, so it is asserted per index rather than once at the ends.
    for (let i = 0; i < 4; i++) {
      expect(alertWidth[i]!).toBeLessThan(overlayWidth[i]!);
      expect(px[i]).toBe(alertWidth[i]);
    }
  });
});

describe("the overlay pane's width ladder (§24)", () => {
  it("rises with the size index and rides --scale, not density", () => {
    const widths = [1, 2, 3, 4].map((n) => declaration(`overlay-w-${n}`)!);
    for (const value of widths) expect(value).toMatch(/^calc\(\d+px \* var\(--scale\)\)$/);
    expect(increasing(widths.map((v) => Number(v.match(/(\d+)px/)![1])))).toBe(true);
    // A width is a reading-measure question, and density is not asking it: no density scope
    // may re-price one. (Written as a walk of EVERY block that scopes the level — the audit's
    // own lesson about a law that reads the first scope and calls it all of them.)
    for (const level of ["compact", "comfortable"] as const) {
      for (const { selector, body } of everyDensityBlock(level)) {
        expect(body, `${selector} re-prices an overlay width`).not.toContain("--overlay-w-");
      }
    }
  });

  it("keeps its window gutter in every density scope — a distance, so the layer owns it", () => {
    // The mirror of the law above, and the substitution trap surface padding taught: the
    // gutter is a layout-space pick, so a :root-only declaration would stay baked at the
    // default rhythm inside every compact subtree.
    expect(declaration("dialog-inset")).toMatch(/^var\(--layout-space-\d+\)$/);
    let checked = 0;
    for (const level of ["compact", "comfortable"] as const) {
      for (const { selector, body } of everyDensityBlock(level)) {
        // Only the scopes that re-bake the RHYTHM owe the pick — the pointer × density cells
        // carry the control family alone and never touch layout space. Counted rather than
        // assumed, so a generator that stopped emitting the rhythm anywhere cannot leave this
        // law walking an empty set (the vacuity guard the Slider round taught).
        if (!body.includes("--layout-space-1:")) continue;
        checked++;
        expect(body, `${selector} forgets the dialog gutter`).toContain("--dialog-inset:");
      }
    }
    expect(checked).toBe(2);
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

describe("the stacking frame (§20)", () => {
  const layout = generateLayoutCss();

  /** Every flat rule whose selector names the theme element. The regex skips at-rule preludes
      (their "body" contains braces), which is fine: .kui-theme rules are all top-level. Loud:
      the filter must find both known rules or the walk is reading nothing. */
  const themeRules = () => {
    const rules = [...layout.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .map((m) => ({ selector: m[1]!.trim(), body: m[2]! }))
      .filter((r) => r.selector.includes(".kui-theme"));
    if (rules.length < 2) throw new Error("theme-rule walk found too little — parser is blind");
    return rules;
  };

  it("the DOM-outermost theme is a stacking context, spelled with isolation and nothing else", () => {
    const frame = themeRules().find((r) => r.selector === ".kui-theme:not(.kui-theme *)");
    if (!frame) throw new Error("the frame rule is gone — portals lose the paint-above guarantee");
    // ONE declaration: the frame must never grow a side effect (a z-index would make the theme
    // participate in an outer context's ordering; anything else is a breaker, next law).
    expect(frame.body.trim()).toBe("isolation: isolate;");
  });

  it("no theme rule ever declares a backdrop-root or containing-block breaker", () => {
    // opacity < 1 makes the theme a backdrop root (glass inside it stops blurring the page —
    // measured 2026-08-08, opacity .99 was the sabotage control that killed the blur);
    // transform/filter/will-change/contain each trap position:fixed descendants or both.
    // `container-type` is required and is NOT `contain:` — the regex bounds the word.
    for (const rule of themeRules()) {
      expect(rule.body).not.toMatch(/(?<![-\w])(?:opacity|transform|filter|will-change|contain)\s*:/);
    }
  });
});

describe("the springs are physics, and the emitted curve is that physics (§8)", () => {
  /**
   * The one thing in the motion system with no law until 2026-08-16 — while DECISIONS §8 and
   * CLAUDE.md both stated that one existed. `elastic` is the easing of every geometry channel
   * in both panel families, so a curve that quietly started ringing would change how the whole
   * system moves with the suite green.
   *
   * Two claims, and the second is the one that could not be made by reading config. First,
   * the EMITTED curve is the physics config states — so editing ζ without regenerating, or
   * hand-editing tokens.css, fails. Second, each spring's emitted samples satisfy the physical
   * claim its own comment makes: how far it overshoots, and that it crosses its target ONCE.
   * "Damping is sacred" (LOG, principle 9) is a sentence in a document until something reads
   * the numbers and counts the crossings.
   */
  const samplesOf = (name: string): number[] => {
    const line = css.split("\n").find((l) => l.includes(`--${name}:`));
    if (!line) throw new Error(`no emitted curve for --${name}`);
    const body = line.slice(line.indexOf("linear(") + "linear(".length, line.lastIndexOf(")"));
    return body.split(",").map((point) => parseFloat(point.trim().split(/\s+/)[0]!));
  };

  /** The step response of a damped second-order system, written out here rather than imported
      from the generator: a law that calls the code under test agrees with it by construction. */
  const stepResponse = (zeta: number, omega: number, t: number): number => {
    const damped = omega * Math.sqrt(1 - zeta * zeta);
    return (
      1 -
      Math.exp(-zeta * omega * t) *
        (Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t))
    );
  };

  const EMITTED: Record<keyof typeof springs, string> = {
    calm: "motion-spring",
    lively: "motion-spring-lively",
    stiff: "motion-spring-stiff",
    elastic: "motion-spring-elastic",
    poised: "motion-spring-poised",
  };

  it("every spring in config is emitted, and nothing else claims to be a spring", () => {
    const emitted = css
      .split("\n")
      .filter((l) => l.includes("linear("))
      .map((l) => l.slice(l.indexOf("--") + 2, l.indexOf(":")));
    expect(emitted.sort()).toEqual(Object.values(EMITTED).sort());
  });

  for (const [name, token] of Object.entries(EMITTED) as [keyof typeof springs, string][]) {
    it(`${name}: the emitted curve is the ζ and ω config states`, () => {
      const { zeta, omega, steps } = springs[name];
      const points = samplesOf(token);
      // Endpoints are STATED, not sampled: `linear()` must start at 0 and end at 1, and a
      // spring's own value at t=1 is merely close to 1.
      expect(points.length).toBe(steps + 1);
      expect(points[0]).toBe(0);
      expect(points.at(-1)).toBe(1);
      for (let i = 1; i < steps; i++) {
        expect(points[i], `sample ${i} of ${name}`).toBeCloseTo(stepResponse(zeta, omega, i / steps), 2);
      }
    });

    it(`${name}: crosses its target at most once, and the overshoot is the documented one`, () => {
      const points = samplesOf(token);
      const peak = Math.max(...points);
      // Every spring in the vocabulary is under-damped except the exits, and no spring is
      // allowed a SECOND visible excursion — that is the tell that reads as mechanical
      // (LOG, principle 9: "when an overshoot is invisible, the fix is more travel").
      expect(peak, `${name} must not fly past its target`).toBeLessThan(1.16);
      // Crossings of the target line, counted off the samples themselves.
      let crossings = 0;
      for (let i = 1; i < points.length - 1; i++) {
        const before = points[i - 1]! - 1;
        const after = points[i]! - 1;
        if (before < 0 && after > 0) crossings += 1;
      }
      expect(crossings, `${name} settles home, it does not ring`).toBeLessThanOrEqual(1);
      // And the exits genuinely never overshoot at all — an exit that bounces is an object
      // that did not mean to leave.
      if (name === "stiff") expect(peak, "an exit never overshoots").toBeLessThanOrEqual(1);
      // Vacuity guard: a curve of all zeros would satisfy every bound above.
      expect(points.filter((v) => v > 0.5).length, `${name} actually travels`).toBeGreaterThan(4);
    });
  }
});


/**
 * ACCENT IS NEVER DILUTED (§7, §11, 2026-08-23) — the doctrine, read off the emitted
 * indirection rather than off the config that produced it.
 *
 * Kushagra: *"an accent never paints a 'faded' background. Accent is pure. You pick accent,
 * and its the vibrant color you pick. Your loudest buttons get it. Its the medium emphasis
 * button, and quiet on hover, that lose that."*
 *
 * The blue block is the LOAD-BEARING half and it is not decoration. `accent` and `blue` are
 * the same recipe — literally `{ hue: 250, vividness: 1 }` twice — so every value in the two
 * blocks was byte-identical until today, and a law that only read the accent block would go
 * green against a generator that had sent EVERY tone's washes to neutral. The two blocks
 * differing at exactly the diluted roles, and agreeing everywhere else, is the whole claim.
 */
describe("the undiluted tones point their washed roles at neutral (§7, §11)", () => {
  /**
   * WHAT COUNTS AS A DILUTION, written out INDEPENDENTLY (2026-08-23, ultracode audit).
   *
   * Every other law in this describe derives its expectation from `DILUTED_ROLES`, which makes
   * them laws about self-consistency rather than about the doctrine: they ask "is everything in
   * the set neutral and everything outside it accent?", which stays true no matter what the set
   * contains. The audit shrank the set from nine entries to two, regenerated, and ran the whole
   * package suite — 1797 passed. Accent's hover fill, its press fill, its three glass twins, its
   * faint ink and its surface tint had all gone back to being faded blue, with nothing red.
   *
   * So the membership is stated here as a second source and checked BOTH ways. This literal is
   * the claim; `DILUTED_ROLES` is the implementation of it. They are allowed to be edited
   * together — deliberately widening the doctrine means editing two places, which is the price
   * of the guarantee — but they may not drift apart silently.
   *
   * The list is Kushagra's own sentence made checkable: *"an accent never paints a 'faded'
   * background... Its the medium emphasis button, and quiet on hover, that lose that."* Every
   * entry is a wash, a wash's opaque twin, a faded ink, or the tone-forward surface tint.
   */
  const DILUTIONS = [
    "soft",              // medium's resting fill
    "soft-hover",        // medium hovered, and quiet's hover
    "soft-active",       // medium pressed, and quiet's press
    "soft-solid",        // the trio's opaque twins — what the glass scopes re-point to
    "soft-hover-solid",
    "soft-active-solid",
    "ink-muted",         // the type ladder's middle rung
    "ink-faint",         // and its quiet one
    "a3",                // the tone-forward surface fill (Notice, a toned Card)
  ] as const;

  it("the set of dilutions is exactly the nine roles the doctrine names", () => {
    // Both directions. A shorter set is a doctrine that stopped covering something, a longer
    // one is a role that lost its colour without anybody deciding it should.
    expect([...DILUTED_ROLES].sort()).toEqual([...DILUTIONS].sort());
  });

  it("each named dilution really is neutral on accent, and its own on blue", () => {
    // The outcome, role by role, read off the emitted CSS rather than through the set. This is
    // the law that fails when an entry is dropped: it names `soft-hover` itself, so removing
    // `soft-hover` from `DILUTED_ROLES` leaves `--tone-soft-hover: var(--accent-soft-hover)`
    // here and this assertion is what says so.
    const accent = block(`[data-tone="accent"]`);
    const blue = block(`[data-tone="blue"]`);
    for (const role of DILUTIONS) {
      expect(accent, `--tone-${role} is still accent's own`).toContain(
        `--tone-${role}: var(--neutral-${role});`,
      );
      // Blue is the control at every single role, not once for the group — a rule that had
      // sent EVERY family's washes to neutral satisfies the line above perfectly.
      expect(blue, `blue lost --tone-${role} too`).toContain(
        `--tone-${role}: var(--blue-${role});`,
      );
    }
  });

  it("and the roles the doctrine does NOT name keep the family — the pigment that survives", () => {
    // The other half, equally independent: the four roles accent must keep. Written out for
    // the same reason, and it is the law that fails if somebody widens the set by hand.
    const accent = block(`[data-tone="accent"]`);
    for (const role of ["solid", "border", "ink", "glyph"] as const) {
      expect(accent, `accent lost --tone-${role}`).toContain(
        `--tone-${role}: var(--accent-${role});`,
      );
    }
  });

  it("every diluted role is a role that exists", () => {
    // A typo here would make the rule a silent no-op — the set is consulted by NAME, so
    // `"soft-hovr"` simply never matches and the wash it was meant to catch ships diluted
    // with the suite green. This is the cheapest law in the file and it guards the whole
    // mechanism.
    for (const role of DILUTED_ROLES) {
      expect(ROLES as readonly string[], `"${role}" is not a role`).toContain(role);
    }
    // And the set is not empty, which every loop below would tolerate.
    expect(DILUTED_ROLES.size).toBeGreaterThan(0);
    expect(undilutedTones.length).toBeGreaterThan(0);
  });

  for (const tone of undilutedTones) {
    it(`${tone} reads neutral where the role is a dilution, and itself everywhere else`, () => {
      const scope = block(`[data-tone="${tone}"]`);
      for (const role of ROLES) {
        const value = scope.match(new RegExp(`--tone-${role}:\\s*([^;]+);`))?.[1];
        expect(value, `--tone-${role} is not declared for ${tone}`).toBeDefined();
        expect(value, `--tone-${role}`).toBe(
          DILUTED_ROLES.has(role) ? `var(--neutral-${role})` : `var(--${tone}-${role})`,
        );
      }
    });
  }

  it("a DILUTED tone still reads itself at every role — accent's twin proves the rule bites", () => {
    // `blue` is accent's own recipe under a different name (LOG 2026-08-05), which makes it
    // the one negative control that cannot be dismissed as a different colour behaving
    // differently. Same pigment, one is an identity and one is data, and only the identity
    // refuses its washes.
    const scope = block(`[data-tone="blue"]`);
    for (const role of ROLES) {
      expect(scope, `--tone-${role} for blue`).toContain(`--tone-${role}: var(--blue-${role});`);
    }
    // Stated as a difference as well as a pair of absolutes, so a generator that renamed the
    // neutral family out from under both blocks still fails.
    const accent = block(`[data-tone="accent"]`);
    const differing = ROLES.filter(
      (role) =>
        accent.match(new RegExp(`--tone-${role}:\\s*([^;]+);`))?.[1] !==
        scope.match(new RegExp(`--tone-${role}:\\s*([^;]+);`))?.[1]?.replace("blue", "accent"),
    );
    expect(new Set(differing)).toEqual(DILUTED_ROLES);
  });

  it("the tones that are MEANINGS keep their washes", () => {
    // The asymmetry is the decision, not an oversight: a pale red still reads danger, so
    // diluting a meaning costs it nothing. Only an identity is destroyed by dilution. If a
    // second tone ever joins `undilutedTones` this law is where that shows up.
    for (const tone of Object.keys(tones)) {
      if ((undilutedTones as readonly string[]).includes(tone)) continue;
      const scope = block(`[data-tone="${tone}"]`);
      expect(scope, `${tone} lost its wash`).toContain(`--tone-soft: var(--${tone}-soft);`);
      expect(scope, `${tone} lost its faded ink`).toContain(
        `--tone-ink-muted: var(--${tone}-ink-muted);`,
      );
    }
  });
});
