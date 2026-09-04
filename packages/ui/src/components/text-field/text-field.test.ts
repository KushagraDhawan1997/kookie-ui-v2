/**
 * The field family's glass is ONE spelling, and this is the law that it stayed one
 * (2026-09-02).
 *
 * WHAT THIS FILE USED TO BE. From 2026-08-26 it held the agreement law for a two-branch
 * mechanism: the family's edge was chosen at parse time by `@supports (background-clip:
 * border-area)` — inside, the border went transparent and the conic ring painted in the border
 * band; outside, a flat `--material-*-edge` hairline stood. ENGINEERING §6's clause (a
 * mechanism with two implementations owes a law that they AGREE) had neither half checked,
 * and a node law was the only place it could be settled, because the browser executes exactly
 * one branch and the emitted sheet carries both.
 *
 * WHY IT IS THIS INSTEAD. The fork existed for one reason: a <textarea>, like every form
 * control, renders no generated content, so the family could not paint its ring on an
 * `::after` the way every other glass member does. That stopped being true on 2026-08-25,
 * when TextArea grew TextField's wrapper — and the spelling outlived its reason by eight days.
 * It cost the lip the thing the pane's own ring rule protects: the border band IS the outer
 * boundary, so the ring had the world on one side of it instead of veil on both, which is the
 * geometry built for panes on 2026-08-27 and rejected on sight. The family is on the annulus
 * now, the fork is gone, and `--material-*-edge` is deleted with it.
 *
 * So the claim this file carries is what survives that: the family is named on every glass
 * rule its siblings are named on, both members together, with no branch anywhere. A browser
 * law cannot make it — it reads one mounted element and would pass with a whole selector list
 * missing so long as the one member it mounted was on it.
 */
import { describe, expect, it } from "vitest";

import { GLASS_MATERIALS } from "../../system/axes.ts";
import { sheet } from "../../test/stylesheets.ts";

const recipes = sheet("system/recipes.css");

describe("the field family's glass has one spelling, and it is the family's own", () => {
  it("the border-area fork is gone, and so is the hairline it existed to fall back to", () => {
    // Both halves, because either one alone can be satisfied by an accident. A guard with no
    // field rules in it would pass the first; a token nothing declares would pass the second.
    expect(recipes, "the border-area fork is back").not.toContain("@supports (background-clip: border-area)");
    for (const thickness of GLASS_MATERIALS) {
      expect(recipes, `the flat ${thickness} hairline is back`).not.toContain(`--material-${thickness}-edge`);
    }
    // And the two private hooks the fork needed: the family reads the shared ring tokens
    // directly now, so a hook here means the state arms have two levers again.
    for (const decl of ["--kui-ct-glass-ring:", "--kui-ct-glass-glint:"]) {
      expect(recipes, `${decl} is back — the family has its own light again`).not.toContain(decl);
    }
  });

  for (const thickness of GLASS_MATERIALS) {
    it(`${thickness}: both members are on the annulus and on the band, beside the button`, () => {
      // The rules name their members by hand, so this reads the SELECTOR LISTS. The claim is
      // not "a field has a ring" (a browser law says that, better) — it is that the field and
      // the textarea are on the SAME lists as the member whose geometry they are copying, so
      // one of them cannot be forgotten the way the segmented track was left off the rim list
      // in the 2026-08-26 audit.
      for (const [what, rule] of [
        ["lip", `::after`],
        ["band", `::before`],
      ] as const) {
        const anchor = `.kui-button:where([data-material="${thickness}"])${rule}`;
        const at = recipes.indexOf(anchor);
        expect(at, `no button ${what} rule for ${thickness} — the anchor moved`).toBeGreaterThan(-1);
        // The whole selector list this rule belongs to: back to the previous `}` and forward
        // to the `{`. Brace-anchored rather than sliced by line, so a reformat cannot make it
        // read a fragment (the `slice(indexOf)` failure this repo replaced its parsers over).
        const open = recipes.indexOf("{", at);
        const list = recipes.slice(recipes.lastIndexOf("}", at) + 1, open);
        expect(list, `the field is not on the ${thickness} ${what} list`).toContain(
          `.kui-field:where([data-material="${thickness}"])${rule}`,
        );
        expect(list, `the textarea is not on the ${thickness} ${what} list`).toContain(
          `.kui-textarea:where([data-material="${thickness}"])${rule}`,
        );
      }
    });
  }

  it("the border stands transparent for the family, so the lip is never a second line", () => {
    // §10, 2026-08-07: one line, never two. The annulus paints inside the border box, so a
    // live border beside it is the doubled-edge defect — the reason the button pins its own
    // border transparent, said once for the family that used to get it from the fork.
    const at = recipes.indexOf(`.kui-field:where([data-material="thin"], [data-material="regular"], [data-material="thick"]),`);
    expect(at, "the family's glass block is gone").toBeGreaterThan(-1);
    const body = recipes.slice(at, recipes.indexOf("}", at));
    expect(body).toContain(".kui-textarea:where(");
    expect(body).toContain("--kui-ct-glass-edge: transparent;");
  });
});
