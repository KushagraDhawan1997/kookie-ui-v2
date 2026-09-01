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

describe("a drawing shared by two components has one home (2026-09-02)", () => {
  /**
   * `glyphs.ts` holds the handful of paths the package draws ITSELF and more than one component
   * needs — today the tick, which is a checkbox's checked mark and a Button's done state,
   * because those mean the same thing.
   *
   * THE SOURCE HALF, for the reason the stroke's source half exists. A mounted law comparing
   * the two `d` attributes cannot fail once both import the constant: it proves they AGREE,
   * which they do by construction, and it would go on agreeing if one of them went back to a
   * literal that happened to match. Its own sabotage caught that — editing `CHECK_PATH` left it
   * green, because both sides moved together. What is checkable is that nobody writes the path
   * down: a literal is how the second home returns.
   */
  it("no component hand-writes a path that glyphs.ts already owns", () => {
    const shared = Object.entries(
      Object.fromEntries(
        [...raw("system/glyphs.ts").matchAll(/export const ([A-Z_]+_PATH) = "([^"]+)"/g)].map(
          (m) => [m[1]!, m[2]!],
        ),
      ),
    );
    // Vacuity: a renamed export or a changed spelling would empty this and the walk below
    // would assert nothing at all.
    expect(shared.length, "glyphs.ts publishes no paths; this law stopped reading").toBeGreaterThan(0);

    const offenders: string[] = [];
    for (const file of sources) {
      if (file.endsWith("system/glyphs.ts")) continue;
      const source = stripped(raw(file));
      for (const [name, d] of shared) {
        if (source.includes(`"${d}"`)) offenders.push(`${file}: writes ${name} as a literal`);
      }
    }
    expect(offenders, "a path in two files is one drawing with two homes").toEqual([]);
  });

  it("every path glyphs.ts publishes has at least two consumers", () => {
    /* The rule that keeps this module from becoming a dumping ground: a drawing moves here on
       its SECOND consumer, and one that has fallen back to a single consumer is a fact with a
       home it does not need. Read by import site, which is the only thing a source law can
       honestly count. */
    const names = [...raw("system/glyphs.ts").matchAll(/export const ([A-Z_]+_PATH)\b/g)].map(
      (m) => m[1]!,
    );
    for (const name of names) {
      const users = sources.filter(
        (f) => !f.endsWith("system/glyphs.ts") && new RegExp(`\\b${name}\\b`).test(raw(f)),
      );
      expect(users.length, `${name} has ${users.length} consumer(s): ${users.join(", ")}`).toBeGreaterThan(1);
    }
  });
});

describe("a stroked glyph is not a filled one (ultracode audit 2026-09-01)", () => {
  /**
   * SVG's initial `fill` is absolute black, not `currentColor`. So a stroked glyph that omits
   * `fill="none"` paints as a solid wedge AND stops following the ink role it was drawn to
   * follow — wrong in light, and wrong in a second way in dark.
   *
   * Nothing read it. Deleting `fill="none"` from breadcrumb's chevron left 29 breadcrumb laws,
   * 611 node laws and 31 glyph laws green while the path computed `fill: rgb(0, 0, 0)`; a grep
   * for `"fill"` across every test in the package found it asserted on Spinner alone. Twelve
   * hand-written glyphs carry the declaration and none of them had a reader.
   *
   * The SOURCE half, for the reason the stroke's source half exists: the browser laws measure
   * the glyphs they mount, and the next chevron is the one they do not.
   */
  it("every svg that strokes a path states fill=\"none\" on itself", () => {
    // PER SVG, not per stroke: `fill` inherits, so one declaration on the root covers every
    // path inside it — the checkbox draws two ticks in one svg and the avatar a head and
    // shoulders, and a per-stroke count called both of them defects on the law's first run.
    const offenders: string[] = [];
    for (const file of sources) {
      const body = stripped(raw(file));
      if (!/strokeWidth=\{glyphStroke\}/.test(body)) continue;
      for (const chunk of body.split("<svg").slice(1)) {
        const el = chunk.slice(0, chunk.indexOf("</svg>") + 1 || undefined);
        if (!/strokeWidth=\{glyphStroke\}/.test(el)) continue;
        // The attribute belongs to the svg's own opening tag, not to a path inside it.
        const openTag = el.slice(0, el.indexOf(">") + 1);
        if (!/fill="none"/.test(openTag)) offenders.push(`${file}: <svg${openTag.trim()}`);
      }
    }
    expect(offenders, "a stroked glyph with no fill paints a solid black wedge").toEqual([]);
  });

  it("...and the walk really reaches the files that draw", () => {
    // Vacuity: the loop above is satisfied by a walk that finds nothing to check.
    const drawing = sources.filter((f) => /strokeWidth=\{glyphStroke\}/.test(raw(f)));
    expect(drawing.length).toBeGreaterThan(3);
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
