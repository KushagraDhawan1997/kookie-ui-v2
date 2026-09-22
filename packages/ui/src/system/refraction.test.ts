/**
 * §10 — the LENS's derivation laws (2026-08-23; the FAMILY model since 2026-09-23). What a mounted
 * pane actually wears is read in refraction.browser.test.tsx, where a real filter is minted; these
 * pin what must be true of the FAMILIES and the PROFILE, which is where a mistake would survive a
 * browser test — a lens that bends the wrong amount still bends.
 *
 * Every law here reads `bendAt` and `fitLens`, the functions the map is actually built from.
 * None re-derives the arithmetic: a law that recomputes the intended value from the same
 * inputs the shipped formula uses agrees with the code by construction, which is the shape
 * that let nine defects through the 2026-08-03 audit.
 */
import { describe, expect, it } from "vitest";

import { GLASS_MATERIALS } from "./axes.ts";
import { LIP_SHARE, bendAt, fitLens, floatingFrost, lensFamily, type LensParams, type LensScale } from "./refraction.tsx";
import { scrim } from "../tokens/config.ts";

/** The families, read off the table itself — it is their one home. */
const FAMILIES = Object.keys(lensFamily) as LensScale[];

/** The strongest bend anywhere in the lip, sampled off the shipped curve. */
function peak(p: LensParams, box: number): number {
  const fit = fitLens(p, box);
  if (!fit) return 0;
  let max = 0;
  for (let i = 0; i <= 2000; i++) {
    const m = Math.abs(bendAt(i / 2000, fit.bezel, fit.thickness, p.ior, p.profile));
    if (m > max) max = m;
  }
  return max;
}

/** The bend at a fraction of the way in from the lip, as a share of that family's peak. */
function share(p: LensParams, box: number, at: number): number {
  const fit = fitLens(p, box);
  if (!fit) return 0;
  return Math.abs(bendAt(at, fit.bezel, fit.thickness, p.ior, p.profile)) / peak(p, box);
}

const CARD = 400;

/**
 * THE LENS IS THE COMPONENT'S (§10, 2026-09-23). The rung is how much backdrop comes through; the
 * lens is the shape of the piece of glass, so it is keyed on the family and never on the rung. That
 * a thin and a thick pane draw ONE lens is read on mounted panes in refraction.browser.test.tsx;
 * these hold the shapes the four families were judged at.
 */
describe("the lens is the family's shape (§10)", () => {
  it("a control is a dome: its lip is the whole half of its short side, where a pane's is capped", () => {
    // "If you look at a glass from side view on controls like buttons, think icon button, a glass
    // is a hemisphere." The fixture is a real control height, and the pane beside it is the
    // negative control: on the same box the ordinary cap leaves it a flat middle.
    const BUTTON = 32;
    expect(fitLens(lensFamily.control, BUTTON)!.bezel, "a control is not all lip").toBe(BUTTON / 2);
    expect(fitLens(lensFamily.pane, BUTTON)!.bezel, "the fixture cannot tell a dome from a capped lip").toBeLessThan(BUTTON / 2);
  });

  it("the lip widens with the family: control, rows, pane, region", () => {
    // The refraction DISTANCE is what differs between families. On a box big enough to hold every
    // nominal lip, the order is the model's: a button's dome is the smallest piece of glass, a
    // menu's lip is wider ("menus should have a wider lip still"), a pane's wider again.
    const lips = (["control", "rows", "pane", "region"] as const).map((f) => fitLens(lensFamily[f], CARD)!.bezel);
    for (let i = 1; i < lips.length; i += 1) expect(lips[i], `${lips.join(" / ")} is not a widening`).toBeGreaterThan(lips[i - 1]!);
  });

  it("a menu keeps the control's gradient on its wider lip", () => {
    // "Extend the hemisphere, make it wider and taller, but don't change the gradient of the curve
    // too much": the depth scales with the lip, and the curve is the same curve.
    const ratio = (p: LensParams) => p.thickness / p.bezel;
    expect(ratio(lensFamily.rows)).toBeCloseTo(ratio(lensFamily.control), 2);
    expect(lensFamily.rows.profile ?? null).toBe(lensFamily.control.profile ?? null);
  });

  it("a pane's curve is eased: its bend settles into the body more gradually than a menu's", () => {
    // "Think of a popover or card, the gradient is eased a bit more." Measured at the lip's
    // midpoint, as a share of each family's own peak. By a MARGIN, not a bare inequality: its
    // first spelling was `>` alone, and a pane put back on the menu's curve survived it — two
    // identical shapes give two shares equal up to float noise, and the noise fell the pane's way.
    expect(share(lensFamily.pane, CARD, 0.5) - share(lensFamily.rows, CARD, 0.5)).toBeGreaterThan(0.05);
  });

  it("controls and menus reach less far than panes", () => {
    // 2026-09-22: "controls like buttons etc arent usually as big as surfaces, so they dont need
    // refraction to reach that inside. I like even dropdown menu."
    expect(lensFamily.control.boost).toBeLessThan(lensFamily.pane.boost);
    expect(lensFamily.rows.boost).toBeLessThan(lensFamily.pane.boost);
  });
});

describe("the bezel profile (§10)", () => {
  it("peaks at the lip and ends at nothing, on every family — a bezel, not a wash over the pane", () => {
    // The brightest bend is in the first tenth of the lip and the interior is left true. Eased or
    // not, a family whose bend moved into the body of the pane would be bending the content.
    for (const f of FAMILIES) {
      expect(share(lensFamily[f], CARD, 0.1), `${f} no longer peaks at its lip`).toBeGreaterThan(0.85);
      expect(share(lensFamily[f], CARD, 1), `${f} bends the body of the pane`).toBeLessThan(0.001);
    }
  });
});

describe("a clamped lip takes its depth with it (§10)", () => {
  it("scales the depth by exactly what the lip lost", () => {
    // Stated as the RATIO rather than as a recomputed number: the depth and the lip must shrink
    // together, which is what holds the slope the family was judged at. 8px clamps every family
    // (cap = floor(8 x its share)), so the fixture tells a right implementation from a broken one.
    const CLAMPED = 8;
    for (const f of FAMILIES) {
      const p = lensFamily[f];
      const fit = fitLens(p, CLAMPED)!;
      expect(fit.bezel, `${f}: the premise — this box really does clamp`).toBeLessThan(p.bezel);
      expect(fit.thickness / p.thickness).toBeCloseTo(fit.bezel / p.bezel, 10);
    }
  });

  it("gives a box with no room no lens at all, rather than an inverted one", () => {
    // Under 2px there is no lip to draw — the map's own 3px softening is wider than the band —
    // and a zero or negative bezel would divide the depth by nothing.
    expect(fitLens(lensFamily.pane, 4)).toBeNull();
    expect(fitLens(lensFamily.pane, 0)).toBeNull();
  });
});

/**
 * THE MIRROR PASS (§10, 2026-09-21, Kushagra: "See how it bends in apple's liquid glass?").
 *
 * The bend reaches `boost` LIPS inward, more than the lip is wide, so the rim shows a squeezed,
 * mirrored copy of what sits just inside it. That is only safe while two things hold, and neither
 * is visible in a screenshot of a big card: the sample must stay inside the box (past it the
 * backdrop is transparent, the 2026-08-25 blue band), and a pane's lip must leave a flat middle.
 */
describe("the lip is capped to a share of its box (§10)", () => {
  // Every box from a small control to a wide pane. 9px is the smallest box that fits a lip at
  // all; the fixture must include boxes that CLAMP (small) and boxes that do not (large), or
  // the law reads one branch of `fitLens` and calls it both.
  const BOXES = [9, 16, 24, 32, 44, 64, 110, 160, 240, 480];

  it("an edge pixel never samples past the far edge of its own box", () => {
    let clamped = 0;
    let free = 0;
    for (const f of FAMILIES) {
      const p = lensFamily[f];
      for (const box of BOXES) {
        const fit = fitLens(p, box);
        if (!fit) continue;
        if (fit.bezel < p.bezel) clamped += 1;
        else free += 1;
        // The map clamps the bend at the fitted lip and `boost` multiplies it afterwards, so
        // the furthest any pixel reads is boost lips inward — for the dome as for a pane.
        expect(fit.bezel * p.boost, `${f} at ${box}px reads past its own box`).toBeLessThan(box);
      }
    }
    expect(clamped, "no box in the fixture clamps").toBeGreaterThan(0);
    expect(free, "every box in the fixture clamps").toBeGreaterThan(0);
  });

  it("and leaves the middle of the box unbent — every family but the dome", () => {
    for (const f of FAMILIES) {
      const p = lensFamily[f];
      const share = p.lipShare ?? LIP_SHARE;
      for (const box of BOXES) {
        const fit = fitLens(p, box);
        if (!fit) continue;
        expect(2 * fit.bezel, `${f} at ${box}px takes more than its share`).toBeLessThanOrEqual(box * 2 * share);
      }
    }
    // The share itself: under a third a side, or "a flat middle" is a sliver. Only the control
    // is all lip, because a control is a dome (see the family laws).
    expect(LIP_SHARE).toBeLessThan(1 / 3);
    expect(FAMILIES.filter((f) => lensFamily[f].lipShare !== undefined)).toEqual(["control"]);
  });

  it("the bend really does pass the lip on every family — the mirror is the point, not an accident", () => {
    for (const f of FAMILIES) expect(lensFamily[f].boost, `${f} no longer mirrors at its rim`).toBeGreaterThan(1);
  });
});

/**
 * THE ONE BLUR THE RUNG MOVES (§10, 2026-09-23). A floating pane has no scrim behind it, so it
 * carries a little of the scrim's softening itself, and that amount is part of how much of the
 * backdrop comes through — "Even the blur needs to be less for thin, that should be part of what
 * changes with axis."
 */
describe("a floating pane's blur rises with the rung, under the scrim (§10)", () => {
  it("rises with the rung", () => {
    const frost = GLASS_MATERIALS.map((r) => floatingFrost[r as keyof typeof floatingFrost]);
    for (let i = 1; i < frost.length; i += 1) expect(frost[i], `${frost.join(" / ")} does not rise`).toBeGreaterThan(frost[i - 1]!);
  });

  it("never out-blurs the scrim it stands in for", () => {
    // Its ceiling is the scrim's own blur, read off the scrim's row rather than restated here —
    // every row of the scrim that carries a filter, one per appearance, found not listed.
    const rows = Object.values(scrim).filter((row): row is { filter: string } & typeof row => typeof row === "object" && "filter" in row);
    expect(rows.length, "the scrim has no filter rows to read").toBeGreaterThan(0);
    for (const row of rows) {
      const scrimBlur = Number(row.filter.match(/blur\(([\d.]+)px/)![1]!);
      for (const r of GLASS_MATERIALS) {
        expect(floatingFrost[r as keyof typeof floatingFrost], `${r} adds more than the scrim blurs`).toBeLessThanOrEqual(scrimBlur);
      }
    }
  });
});
