/**
 * Row's PUBLISHED documentation cannot deny its measured geometry (2026-08-26, audit).
 *
 * `row.browser.test.tsx` holds a standing Row level with a mounted Button at every index in
 * both pointer worlds — the geometry has been that since the posture flipped owners. The
 * sentence a CONSUMER reads is generated straight out of this JSDoc into apps/docs' API table,
 * and it said the opposite the whole time: "not the control height ladder", i.e. that the row
 * is deliberately shorter than the button beside it, which is the premise somebody composing a
 * toolbar would build on. Nothing in the suite could catch it. The browser law reads pixels
 * and the drift law reads whether the artifact was regenerated; neither reads prose, and prose
 * is what shipped.
 *
 * So this law is the seam between the two, and it is deliberately a SOURCE law — the text that
 * ships is the thing that was wrong. It cannot judge whether a sentence is well written. What
 * it can do is fail on the exact claim that was retracted, and on a `size` doc that never
 * names the ladder at all, which is what the stale sentence and its likeliest rewrites have in
 * common.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const source = readFileSync(fileURLToPath(new URL("./row.tsx", import.meta.url)), "utf8");

/**
 * The JSDoc block immediately above the `size` declaration, as ONE line of prose.
 *
 * The flattening is load-bearing and was learned by this law's own sabotage pass: the first
 * spelling matched the raw source, and the retracted claim happens to wrap — "…not the control
 * / * height ladder" — so restoring the exact sentence the law was written for changed nothing
 * and the suite stayed green. A law over prose reads the prose, not its line breaks.
 */
function sizeDoc(): string {
  const at = source.indexOf("  size?: Size;");
  expect(at, "row.tsx no longer declares `size` — this law would be reading nothing").toBeGreaterThan(0);
  const before = source.slice(0, at);
  const open = before.lastIndexOf("/**");
  const close = before.lastIndexOf("*/");
  expect(open, "`size` carries no JSDoc at all").toBeGreaterThan(0);
  expect(close, "the block above `size` is not a closed JSDoc").toBeGreaterThan(open);
  return before
    .slice(open, close)
    .replace(/^\s*\/?\*+/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

describe("the published `size` doc agrees with the box the browser law measures (§21)", () => {
  it("it does not carry the retracted claim", () => {
    expect(
      sizeDoc(),
      "the retracted sentence is back in the published API table: a standing row IS on the ladder",
    ).not.toMatch(/not the control height ladder/i);
  });

  it("it still tells a reader which box a standing row gets", () => {
    // The negative clause alone would pass on a doc that simply stopped saying anything, which
    // is the cheapest way to satisfy a law of this shape (the coverage laws' own anti-rot
    // clause, one file over).
    expect(sizeDoc(), "`size` no longer names the ladder its box comes from").toMatch(
      /height ladder/i,
    );
  });
});
