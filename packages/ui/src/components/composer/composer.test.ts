/**
 * Composer node laws (§30) — the two claims that live in the SOURCE rather than in a box a
 * browser can measure.
 *
 * A JSDoc block on an exported prop is not decoration here: `apps/docs/scripts/generate-api.ts`
 * lifts it verbatim into the published props table, so it is a second implementation of a claim
 * the mounted laws already assert about the component — and ENGINEERING §6's rule for two
 * implementations of one mechanism is that they owe a law that they AGREE. They did not: the
 * `size` doc said the index "does NOT reach the row" while the component supplied
 * `SizeScopeContext` to that very row, so the published sentence was the exact inverse of the
 * shipped behaviour for three days (audit 2026-08-26). The behaviour half is mounted in
 * `composer.browser.test.tsx`; this is the sentence half.
 */
import { describe, expect, it } from "vitest";

import { raw } from "../../test/stylesheets.ts";

const source = raw("components/composer/composer.tsx");

/**
 * The JSDoc block immediately above a declaration — LOUD when the declaration is missing,
 * which is `block()`'s own reason: a law that reads the empty string passes every negative
 * assertion in it while checking nothing.
 */
function docFor(declaration: string): string {
  const at = source.indexOf(declaration);
  if (at === -1) throw new Error(`docFor(): declaration not found: ${declaration}`);
  const before = source.slice(0, at);
  const open = before.lastIndexOf("/**");
  const close = before.lastIndexOf("*/");
  if (open === -1 || close < open) throw new Error(`docFor(): no JSDoc above: ${declaration}`);
  return before.slice(open, close);
}

describe("the published `size` sentence and the shipped mechanism agree (§28, §30)", () => {
  const doc = docFor("size?: Size;");
  const suppliesTheRow = /<SizeScopeContext\.Provider/.test(source);

  it("the composer really does supply the row's index — the premise, measured from the source", () => {
    // Without this the two laws below are about a component that might not exist: if the
    // provider is ever taken out again, the FIRST thing that should fail is this line, and
    // the doc laws then flip to their other arm rather than silently agreeing with nothing.
    expect(suppliesTheRow).toBe(true);
  });

  it("the sentence names the mechanism it goes through, or does not claim one", () => {
    // The positive half. A doc that never mentions the context cannot be describing the reach
    // it actually has, and this is the half that survives a rewording.
    expect(doc).toMatch(/SizeScopeContext/);
    // And the second bound, which is the whole reason the mechanism is safe to have: an
    // explicit `size` on a control wins. A published sentence promising a reach without
    // promising the escape describes a box that overrules you.
    expect(doc).toMatch(/explicit `size`/);
  });

  it("and it does not carry the retired claim that the index stops at the pane", () => {
    // The exact sentences that shipped, named rather than paraphrased: this is the text the
    // /components/composer table published while the row was already following the index, and
    // re-committing it is what this law exists to catch.
    for (const retired of [/does NOT reach the row/, /and stops there/, /keeps its\s+own index/]) {
      expect(doc, `the retired reach claim is back in the size doc: ${retired}`).not.toMatch(
        retired,
      );
    }
  });
});

describe("the send button's status axis has ONE home (§30)", () => {
  it("nothing in the component restates the four values as a literal", () => {
    // CLAUDE.md 2026-08-16: fourteen private copies of an axis's value list were each a claim
    // that would keep passing the day the axis widened. `COMPOSER_STATUSES` is the home and
    // `ComposerStatus` derives from it, so the union may not be spelled out a second time.
    expect(source).not.toMatch(/"ready"\s*\|\s*"submitted"/);
  });
});
