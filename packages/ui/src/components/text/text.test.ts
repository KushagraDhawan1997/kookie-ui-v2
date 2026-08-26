/**
 * Text node laws (§12, §15) — the type family's two axis unions, and the one home each of them
 * has. Written 2026-08-26, after the audit found both hand-authored beside the derived lists
 * that describe the same two axes.
 *
 * `system/axes.ts` derives `componentAxes.weight` and `componentAxes.typeSize` from
 * `tokens/config.ts` under a docblock reading "Nothing here is authored: every list DERIVES
 * from the single home that already owns it" — and the TYPES those lists describe were written
 * out by hand one file over. Two homes for one fact, and the copy cannot fail: it agrees today
 * and goes stale on exactly the change that needs catching, because a tenth ramp step widens
 * the list, the builder's inspector and the docs table while the union stays at nine and the
 * prop refuses the step the system now has.
 *
 * Half of this file is checked by `tsc`, not by vitest, and that is the point: a union is a
 * compile-time object, so the runner that can falsify a claim about it is the compiler. The
 * assignments below fail the build when the derivation slips at either end, which is the
 * failure a runtime assertion cannot make.
 */
import { describe, expect, it } from "vitest";

import { raw } from "../../test/stylesheets.ts";
import { componentAxes } from "../../system/axes.ts";
import { fontSize, fontWeight } from "../../tokens/config.ts";
import type { TypeSize, Weight } from "./text.tsx";

const source = raw("components/text/text.tsx");

/** The declaration, without its JSDoc — LOUD when it is gone, because a law that reads the
    empty string passes every negative assertion in it while checking nothing. */
function declaration(name: string): string {
  const found = new RegExp(`export type ${name} = ([^;]+);`).exec(source);
  if (!found) throw new Error(`declaration(): export type ${name} is gone`);
  return found[1]!;
}

describe("the axis unions have ONE home, and it is the config (§12)", () => {
  it("`Weight` derives from `fontWeight` rather than restating it", () => {
    // Falsified by restoring `"regular" | "medium" | "semibold"`: the reference is what fails,
    // and it fails on the spelling that agrees with today's config — which is the whole point,
    // since a copy that agrees is precisely the copy that goes stale later.
    const decl = declaration("Weight");
    expect(decl, "the weight set is written out by hand again").toContain("fontWeight");
    expect(decl, "a literal weight in the union is a second home for the list").not.toMatch(/"[a-z]+"/);
  });

  it("`TypeSize` derives from `fontSize` rather than restating the ramp", () => {
    const decl = declaration("TypeSize");
    expect(decl, "the ramp's steps are written out by hand again").toContain("fontSize");
  });

  it("the runtime lists still describe the same two axes — the premise, measured", () => {
    // Without this the compile-time half below is about a config that might have moved: the
    // derived lists and the derived types read the same two exports, so if either list ever
    // stops covering its axis, THIS is what should fail first.
    expect(componentAxes.weight).toEqual(Object.keys(fontWeight));
    expect(componentAxes.typeSize).toHaveLength(fontSize.length);
  });
});

/**
 * THE COMPILE-TIME HALF — `tsc --noEmit` is the runner. Each line is falsified by the same
 * inverse edit: put the hand-written union back, or slip the derivation by one, and the build
 * fails here rather than silently at a call site.
 */
describe("the unions stay CLOSED, and land exactly on the ramp", () => {
  it("is asserted by the compiler above this line, not by this assertion", () => {
    /** Both ends of the ramp, which is what pins the 1-based derivation: a 0-based slip makes
        the second line fail, and the two refusals below make an off-by-one in the other
        direction fail. `9` is written out because a type cannot be built from a runtime
        length — when the ramp gains a step, the law that catches it is the one above. */
    const first: TypeSize = "1";
    const last: TypeSize = "9";
    // @ts-expect-error — the ramp is 1-based: there is no step 0
    const zero: TypeSize = "0";
    // @ts-expect-error — one past the ramp, and the guard that catches a union widened to `string`
    const past: TypeSize = "10";
    /** And the weight set's own refusal, which the derivation now enforces from config:
        `bold` (700) is not in `fontWeight`, so it is not in the type — and the day somebody
        adds it to the config this line stops compiling, which is the decision being asked for
        again rather than quietly re-entering through a value list. */
    const heaviest: Weight = "semibold";
    // @ts-expect-error — bold is refused system-wide (2026-08-09)
    const bold: Weight = "bold";
    expect([first, last, zero, past, heaviest, bold].join()).toBe("1,9,0,10,semibold,bold");
  });
});
