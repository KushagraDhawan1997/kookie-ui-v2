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
import { bendAt, fitLens, lens, type LensParams, type LensThickness } from "./refraction.tsx";

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
  // Half the short side is all the room a lip has, so a small control clamps. What must
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
    // still clamp (cap = floor(8/2) - 2 = 2), and the three ratios it produces differ per
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
    // `- 2` in the clamp goes negative on a tiny box; a negative bezel would flip every
    // normal and bend the backdrop outward.
    expect(fitLens(lens.regular, 4)).toBeNull();
    expect(fitLens(lens.regular, 0)).toBeNull();
  });
});
