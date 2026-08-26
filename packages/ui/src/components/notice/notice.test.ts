/**
 * Notice's NODE laws — what the SOURCE says, where a mount cannot answer.
 *
 * The one question so far is the dismiss glyph's documented weight. `system/glyphs.test.ts`
 * already forbids a hand-written `strokeWidth` and pins `glyphStroke` to config — but it reads
 * `stripped(raw(file))`, which deletes every comment before it looks, so a COMMENT stating a
 * weight is outside its reach entirely. That is how this file came to document "1.5 stroke"
 * beside a `strokeWidth={glyphStroke}` drawing 1.1667: the number was correct until the stroke
 * was derived (2026-08-23) and then documented the wrong glyph for three days, in the one place
 * a reader adding the next glyph would copy from.
 */
import { describe, expect, it } from "vitest";

import { raw } from "../../test/stylesheets.ts";

const source = raw("components/notice/notice.tsx");

describe("the glyph's documented weight is the TOKEN, never a number (§4, §8)", () => {
  it("found the source, and it really does draw a glyph", () => {
    // Vacuity: every assertion below is a negative, and a negative over an empty string holds.
    expect(source.length).toBeGreaterThan(1000);
    expect(source).toContain("strokeWidth={glyphStroke}");
  });

  it("no comment in it states a stroke width of its own", () => {
    // The COMMENTS, which is the half the shared glyph law cannot see. A stroke is stated in
    // viewBox units, so a literal here is a claim about a painted weight that moves whenever
    // `iconStroke` or `iconGrid` does — and this file is the nearest worked example of how a
    // package glyph is drawn.
    const comments = source.match(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g) ?? [];
    expect(comments.length, "the comment scan found nothing to read").toBeGreaterThan(5);
    const offenders = comments.filter((c) => /[\d.]+\s*stroke\b|stroke(?:-|\s+)width\s*[:=]?\s*[\d.]/i.test(c));
    expect(offenders, `a comment states a stroke width: ${offenders.join(" | ")}`).toEqual([]);
  });
});
