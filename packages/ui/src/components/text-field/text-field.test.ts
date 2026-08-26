/**
 * The field family's EDGE has two implementations, and this is the law that they agree
 * (2026-08-26). ENGINEERING §6's own clause: a mechanism with two implementations owes a law
 * that they AGREE — and this one had neither half checked. Three browser laws asserted the
 * `background-clip: border-area` branch unconditionally, which means on an engine without the
 * feature the suite went red for a reason that is not a defect, while the branch most readers
 * actually render — the flat `--material-*-edge` hairline recipes.css calls "the honest
 * fallback" — was asserted nowhere at all.
 *
 * A node law is the only place this can be settled: the browser executes exactly ONE branch,
 * so the engine under test decides which half of the mechanism is checkable. The emitted sheet
 * carries both.
 */
import { describe, expect, it } from "vitest";

import { GLASS_MATERIALS } from "../../system/axes.ts";
import { sheet } from "../../test/stylesheets.ts";

const recipes = sheet("system/recipes.css");
const GUARD = "@supports (background-clip: border-area)";

/** The guard's own body, brace-matched — `indexOf("}")` would stop at the first nested rule,
    which is the `slice(indexOf)` failure this repo replaced its ad-hoc parsers over. */
function guardBody(css: string): string {
  const start = css.indexOf(GUARD);
  if (start === -1) throw new Error(`the border-area guard is gone from recipes.css`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error("the border-area guard never closes");
}

const inside = guardBody(recipes);
const outside = recipes.replace(inside, "");

describe("the field family's edge is branched, and BOTH branches are declared", () => {
  it("found a real guard with a real body", () => {
    // Vacuity: every claim below is about where a declaration sits, and an empty body would
    // satisfy the "outside" half of all of them.
    expect(inside.length).toBeGreaterThan(200);
    expect(GLASS_MATERIALS.length).toBe(3);
  });

  for (const thickness of GLASS_MATERIALS) {
    it(`${thickness}: the FALLBACK hairline is declared outside the guard`, () => {
      // The branch an engine without `border-area` renders. If this declaration ever moves
      // inside the guard, every such engine draws a glass field with NO edge at all — and no
      // browser law in this package could report it, because the browser only ever executes
      // the branch its own engine took.
      const fallback = `--kui-ct-glass-edge: var(--material-${thickness}-edge);`;
      expect(outside, `the ${thickness} fallback edge is not declared outside the guard`).toContain(
        fallback,
      );
      expect(inside).not.toContain(fallback);
    });

    it(`${thickness}: the RING branch is declared only inside the guard`, () => {
      // And the other direction: the ring paints in the border band, which is the one thing
      // `background-clip: border-area` buys. Declared outside the guard it would wash conic
      // across the whole field on every engine that cannot clip it to the band.
      const ring = `--kui-ct-glass-ring: var(--material-${thickness}-ring-control);`;
      expect(inside, `the ${thickness} ring is not declared inside the guard`).toContain(ring);
      expect(outside).not.toContain(ring);
    });

    it(`${thickness}: the two branches disagree about the border, which is what makes them two`, () => {
      // The agreement is a SUBSTITUTION, not a coincidence: inside the guard the border is
      // handed to the ring by going transparent, outside it the border IS the edge. Both
      // spellings must exist, or one branch is silently the other.
      expect(inside).toContain("--kui-ct-glass-edge: transparent;");
      expect(inside).toContain("background-clip: border-area, border-box, border-box;");
    });
  }

  it("both members of the family take the same branch — a field and a textarea are one anatomy (§10)", () => {
    // The glass lock: a component may vary WHERE a part is painted, never WHAT it is. The
    // ring rules name their members by hand, so a member left off one list would render a
    // different glass from its sibling — which is the defect the lock was written after.
    for (const half of [inside, outside]) {
      const fields = (half.match(/\.kui-field:where\(\[data-material=/g) ?? []).length;
      const areas = (half.match(/\.kui-textarea:where\(\[data-material=/g) ?? []).length;
      expect(fields, "the branch names no field rules at all").toBeGreaterThan(0);
      expect(areas).toBe(fields);
    }
  });
});
