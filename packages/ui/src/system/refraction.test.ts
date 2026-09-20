/**
 * §10 — the LENS's derivation laws (2026-08-23). What a mounted pane actually wears is read
 * in card.browser.test.tsx, where a real filter is minted and its displacement scale is a
 * computed value; these pin what must be true of the LADDER and the PROFILE, which is where
 * a mistake would survive a browser test — a lens that bends the wrong amount still bends,
 * and every existing browser law asserts only that a glass pane HAS one.
 *
 * Every law here reads `bendAt` and `fitLens`, the functions the map is actually built from.
 * None re-derives the arithmetic: a law that recomputes the intended value from the same
 * inputs the shipped formula uses agrees with the code by construction, which is the shape
 * that let nine defects through the 2026-08-03 audit.
 */
import { describe, expect, it } from "vitest";

import { GLASS_MATERIALS } from "./axes.ts";
import { LIP_SHARE, bendAt, fitLens, floatingFrost, lens, type LensParams, type LensThickness } from "./refraction.tsx";
import { scrim } from "../tokens/config.ts";

/**
 * The ladder in the axis's own order, never restated here — §12 gives every axis value list
 * one home, and a copy that agrees today is the copy that silently disagrees tomorrow. (The
 * law that forbids this caught the first draft of this very file.) `.filter` cannot narrow an
 * element type, so the cast states what the first law below then PROVES: the ladder's keys are
 * exactly these.
 */
const LADDER = GLASS_MATERIALS as readonly LensThickness[];

/** The strongest bend anywhere in the bezel, sampled off the shipped curve. */
function peak(p: LensParams, box: number): number {
  const fit = fitLens(p, box);
  if (!fit) return 0;
  let max = 0;
  for (let i = 0; i <= 2000; i++) {
    const m = Math.abs(bendAt(i / 2000, fit.bezel, fit.thickness, p.ior));
    if (m > max) max = m;
  }
  return max;
}

/** The bend at a fraction of the way in from the lip, as a share of that rung's peak. */
function share(p: LensParams, box: number, at: number): number {
  const fit = fitLens(p, box);
  if (!fit) return 0;
  return Math.abs(bendAt(at, fit.bezel, fit.thickness, p.ior)) / peak(p, box);
}

const CARD = 400;

describe("the lens ladder: three thicknesses bend by three amounts (§10)", () => {
  it("covers exactly the materials that paint a veil", () => {
    // The axis has one home and the ladder must answer all of it: a fourth thickness cannot
    // ship without its own piece of glass, and `solid` can never acquire one.
    expect(Object.keys(lens).sort()).toEqual([...GLASS_MATERIALS].sort());
  });

  it("is monotone in every lever it owns, so thickness reads as ONE dimension", () => {
    // The material recipes are held to exactly this and for exactly this reason. A lever that
    // moved the other way would make one rung deeper glass in one respect and shallower in
    // another, which is not a ladder.
    for (const key of ["bezel", "thickness", "ior", "fringe"] as const) {
      const values = LADDER.map((r) => lens[r][key]);
      expect(values, `${key} is not monotone across the ladder`).toEqual([...values].sort((a, b) => a - b));
      expect(new Set(values).size, `${key} repeats a value: two rungs are one rung`).toBe(LADDER.length);
    }
  });

  it("bends strictly further at every step — the axis the lens could not see until now", () => {
    // The point of the whole change. Before it there was one constant, so these three were
    // byte-identical and this law's subject did not exist.
    const bends = LADDER.map((r) => peak(lens[r], CARD));
    expect(bends[0]).toBeLessThan(bends[1]!);
    expect(bends[1]).toBeLessThan(bends[2]!);
    // And each step is worth seeing: a rung that bends a third of a pixel more than its
    // neighbour is a number, not a material. The floor was 2 until 2026-08-27, when the lip
    // narrowed 4x (the bench's bezel dial at 0.25x) and the whole ladder scaled down with it —
    // the solved steps are 1.46 and 1.93 now, and what reaches the screen is these times
    // `boost`, which the applied law below still holds to the original 2px floor.
    expect(bends[1]! - bends[0]!).toBeGreaterThan(1);
    expect(bends[2]! - bends[1]!).toBeGreaterThan(1);
  });

  it("bends further at every step AFTER `boost`, which is what reaches the screen (§10)", () => {
    /**
     * 2026-08-23, the day `boost` stopped being 1.
     *
     * Every law above reads the PHYSICS — `bendAt`, which knows nothing about `boost` — and the
     * monotonicity law one screen up loops `bezel`, `thickness`, `ior` and `fringe` and not it.
     * That was harmless while the multiplier was 1 on every rung and it is not any more: the
     * eye pass bought its strength with `boost`, because twice the judged bends is over every
     * rung's own clamp and no `thickness` reaches them.
     *
     * So the ladder could be made non-monotone in the one number that reaches a screen, with
     * all nine laws green. This reads the applied bend — the value that becomes the filter's
     * `scale` — and holds it to the same two claims the physics is held to.
     */
    const applied = LADDER.map((r) => peak(lens[r], CARD) * lens[r].boost);
    expect(applied[0]).toBeLessThan(applied[1]!);
    expect(applied[1]).toBeLessThan(applied[2]!);
    // …and each step is still worth seeing once the multiplier is in. A rung whose `boost`
    // undoes the depth it was given is two rungs drawing one lens.
    expect(applied[1]! - applied[0]!).toBeGreaterThan(2);
    expect(applied[2]! - applied[1]!).toBeGreaterThan(2);
    // CALIBRATION: the multiplier must actually be doing something, or this law is the physics
    // law again under a second name.
    expect(
      LADDER.some((r) => lens[r].boost !== 1),
      "no rung boosts — this law is the physics law with extra arithmetic",
    ).toBe(true);
  });

  it("no rung saturates its own clamp, so each one draws the lens it asked for", () => {
    // `physicalMap` clamps the applied scale at the bezel — past that the displacement asks
    // for pixels outside the element's own backdrop and washes out instead of bending. A rung
    // sitting ON its clamp is no longer its designed lens, it is whatever the box allowed.
    for (const r of LADDER) {
      const fit = fitLens(lens[r], CARD)!;
      expect(peak(lens[r], CARD), `${r} saturates its clamp`).toBeLessThan(fit.bezel);
    }
  });
});

describe("the bezel profile: a band of glass, not a line at the lip (§10)", () => {
  it("holds a real share of its bend across the bezel", () => {
    // THE MEASUREMENT THAT DROVE THE CHANGE. At the old exponent the bend peaked 0.6px in from
    // an 18px lip and was down to 13% of its peak by the midpoint and 2% by three quarters —
    // 18px of declared glass rendering a hard 2px line, which is what read as an edge
    // treatment rather than a thickness. These floors sit above what that profile could reach
    // and below what this one does (measured 36-39% and 16-18%).
    for (const r of LADDER) {
      expect(share(lens[r], CARD, 0.5), `${r} collapses by the bezel's midpoint`).toBeGreaterThan(0.3);
      expect(share(lens[r], CARD, 0.75), `${r} has nothing left at three quarters`).toBeGreaterThan(0.12);
    }
  });

  it("still peaks AT the lip and ends at nothing — a bezel, not a wash over the pane", () => {
    // The band must not be bought by flattening the lens into the body of the pane: the
    // brightest bend is still in the first tenth, and the interior is left true.
    for (const r of LADDER) {
      expect(share(lens[r], CARD, 0.1), `${r} no longer peaks at its lip`).toBeGreaterThan(0.85);
      expect(share(lens[r], CARD, 1), `${r} bends the body of the pane`).toBeLessThan(0.001);
    }
  });
});

describe("a clamped lip takes its depth with it (§10)", () => {
  // `LIP_SHARE` of the short side is all the room a lip is given, so a small control clamps. What must
  // survive the clamp is the SLOPE — the lens has to stay the same lens at every box size.
  const SMALL = 24;

  it("keeps the rungs distinguishable on a control-sized box", () => {
    // The law that fails without the depth scaling. Measured on the shipped constant, a 24px
    // box asked for 15.4px of bend against a 10px clamp: regular and thick both saturated and
    // drew an identical 10.0px, so on every small control the ladder was one lens again —
    // which would have made the whole change invisible exactly where the most glass controls
    // are.
    const bends = LADDER.map((r) => peak(lens[r], SMALL));
    expect(bends[0]).toBeLessThan(bends[1]!);
    expect(bends[1]).toBeLessThan(bends[2]!);
    for (const [i, r] of LADDER.entries()) {
      const fit = fitLens(lens[r], SMALL)!;
      expect(bends[i], `${r} saturates its clamp on a ${SMALL}px box`).toBeLessThan(fit.bezel);
    }
  });

  it("scales the depth by exactly what the lip lost", () => {
    // Stated as the RATIO rather than as a recomputed number: the depth and the lip must
    // shrink together, which is what holds the slope the rung was judged at.
    //
    // The fixture shrank with the ladder (2026-08-27): at bezels 3/4.5/6.5 a 24px box no
    // longer clamps ANY rung — the premise assertion below failed on every one, which is the
    // degenerate-fixture rule doing its job. 8px is the largest box where all three rungs
    // still clamp (cap = floor(8 x LIP_SHARE) = 2), and the three ratios it produces differ per
    // rung, so the fixture still tells a right implementation from a broken one.
    const CLAMPED = 8;
    for (const r of LADDER) {
      const p = lens[r];
      const fit = fitLens(p, CLAMPED)!;
      expect(fit.bezel).toBeLessThan(p.bezel); // the premise: this box really does clamp
      expect(fit.thickness / p.thickness).toBeCloseTo(fit.bezel / p.bezel, 10);
    }
  });

  it("gives a box with no room no lens at all, rather than an inverted one", () => {
    // Under 2px there is no lip to draw — the map's own 3px softening is wider than the band —
    // and a zero or negative bezel would divide the depth by nothing.
    expect(fitLens(lens.regular, 4)).toBeNull();
    expect(fitLens(lens.regular, 0)).toBeNull();
  });
});

/**
 * THE MIRROR PASS (§10, 2026-09-21, Kushagra: "See how it bends in apple's liquid glass?").
 *
 * The bend now peaks at `boost` LIPS inward, more than the lip is wide, so the rim shows a
 * squeezed, mirrored copy of what sits just inside it. That is only safe while two things hold,
 * and neither is visible in a screenshot of a big card: the sample must stay inside the box
 * (past it the backdrop is transparent, the 2026-08-25 blue band), and the lip must leave a
 * flat middle (a 110px card at the old half-box bound was ALL lip and warped its whole body).
 */
describe("the lip is capped to a share of its box (§10)", () => {
  // Every box from a small control to a wide pane. 9px is the smallest box that fits a lip at
  // all; the fixture must include boxes that CLAMP (small) and boxes that do not (large), or
  // the law reads one branch of `fitLens` and calls it both.
  const BOXES = [9, 16, 24, 32, 44, 64, 110, 160, 240, 480];

  it("an edge pixel never samples past the far edge of its own box", () => {
    let clamped = 0;
    let free = 0;
    for (const r of LADDER) {
      for (const box of BOXES) {
        const fit = fitLens(lens[r], box);
        if (!fit) continue;
        if (fit.bezel < lens[r].bezel) clamped += 1;
        else free += 1;
        // The map clamps the bend at the fitted lip and `boost` multiplies it afterwards, so
        // the furthest any pixel reads is boost lips inward.
        expect(fit.bezel * lens[r].boost, `${r} at ${box}px reads past its own box`).toBeLessThan(box);
      }
    }
    expect(clamped, "no box in the fixture clamps").toBeGreaterThan(0);
    expect(free, "every box in the fixture clamps").toBeGreaterThan(0);
  });

  it("and leaves the middle of the box unbent", () => {
    for (const r of LADDER) {
      for (const box of BOXES) {
        const fit = fitLens(lens[r], box);
        if (!fit) continue;
        expect(2 * fit.bezel, `${r} at ${box}px is all lip`).toBeLessThanOrEqual(box * 2 * LIP_SHARE);
      }
    }
    // The share itself: under a third a side, or "a flat middle" is a sliver.
    expect(LIP_SHARE).toBeLessThan(1 / 3);
  });

  it("the bend really does pass the lip — the mirror is the point, not an accident", () => {
    for (const r of LADDER) expect(lens[r].boost, `${r} no longer mirrors at its rim`).toBeGreaterThan(1.5);
  });
});

describe("the blur lives in the lens, and it is a ladder (§10)", () => {
  const rises = (xs: readonly number[]) => {
    for (let i = 1; i < xs.length; i += 1) expect(xs[i]!).toBeGreaterThan(xs[i - 1]!);
  };

  it("rises with thickness, on the rung and on what a floating pane adds", () => {
    rises(LADDER.map((r) => lens[r].blur));
    rises(LADDER.map((r) => floatingFrost[r]));
    rises(LADDER.map((r) => lens[r].blur + floatingFrost[r]));
  });

  it("a floating pane never out-blurs the scrim it stands in for", () => {
    // The addition exists because a menu has no scrim; its ceiling is the scrim's own blur,
    // read off the scrim's row rather than restated here.
    // Every row of the scrim that carries a filter — one per appearance, found not listed.
    const rows = Object.values(scrim).filter((row): row is { filter: string } & typeof row => typeof row === "object" && "filter" in row);
    expect(rows.length, "the scrim has no filter rows to read").toBeGreaterThan(0);
    for (const row of rows) {
      const scrimBlur = Number(row.filter.match(/blur\(([\d.]+)px/)![1]!);
      for (const r of LADDER) expect(floatingFrost[r], `${r} adds more than the scrim blurs`).toBeLessThanOrEqual(scrimBlur);
    }
  });
});
