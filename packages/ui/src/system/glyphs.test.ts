/**
 * §4, §8 — one stroke, one home (2026-08-23).
 *
 * The defect this catches is not "the number is wrong". It is the number being written down
 * in ten places, on two different drawing grids, under one literal that made them look alike:
 * every glyph in the repo said `strokeWidth="1.5"`, the package's own on a 16 viewBox and the
 * docs app's Hugeicons on a 24, so a select's chevron painted 1.50px beside a Hugeicon's
 * 1.00px in the same 16px box. Nothing could see it, because both files said 1.5.
 *
 * The painted half is `glyphs.browser.test.tsx`. This is the SOURCE half, and it exists
 * because a literal is how the defect returns: the browser law measures the glyphs it mounts,
 * and the next hand-written chevron is the one it does not.
 */
import { describe, expect, it } from "vitest";

import { glyphStroke, iconGrid, iconStroke } from "../tokens/config.ts";
import { raw, stripped, walkFiles } from "../test/stylesheets.ts";

/** Every source file the package ships, minus its own laws — a walk, never a list (audit D14). */
const sources = walkFiles(".", ".tsx").filter((f) => !f.includes(".test."));

describe("the stroke has one home", () => {
  it("found the package's sources to walk", () => {
    expect(sources.length).toBeGreaterThan(20);
  });

  it("no component writes a stroke width of its own", () => {
    // Comments stripped: this repo's files argue about the very literals its laws forbid, and
    // a law that fires on its own documentation is a law nobody keeps (test/stylesheets.ts).
    const offenders = sources.filter((f) => /strokeWidth\s*=\s*["'{]?\s*[\d.]/.test(stripped(raw(f))));
    expect(offenders, "a hand-written stroke is how the two grids drift apart again").toEqual([]);
  });

  it("every glyph that states a stroke reads the config value", () => {
    // Vacuity: the negative above is satisfied by a package that draws no glyphs at all.
    const drawing = sources.filter((f) => /strokeWidth=\{glyphStroke\}/.test(raw(f)));
    expect(drawing.length, "no glyph reads glyphStroke; the law above proves nothing").toBeGreaterThan(3);
  });
});

describe("the two grids state one painted weight", () => {
  it("glyphStroke is iconStroke restated for the package's own viewBox", () => {
    // The derivation, read as the guarantee rather than the arithmetic: a 16-unit glyph and a
    // 24-unit glyph, drawn into the SAME box, paint the same number of pixels.
    const box = 16;
    expect((glyphStroke * box) / 16).toBeCloseTo((iconStroke * box) / iconGrid, 10);
  });

  it("the ecosystem's grid is the one iconStroke is stated for", () => {
    // Not decoration: a consumer passes `iconStroke` straight to Lucide, Hugeicons, Heroicons
    // or Phosphor, and every one of them draws on 24. If this ever moves, the public number
    // changes meaning without changing value, which is the silent half of a breaking change.
    expect(iconGrid).toBe(24);
  });

  it("the stroke is heavier than the 1.5 that shipped on a 24 grid", () => {
    // The report was "too thin" and the fix must actually answer it. Guards a revert that
    // keeps the new mechanism and quietly restores the old weight.
    expect(iconStroke).toBeGreaterThan(1.5);
  });
});
