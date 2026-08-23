/**
 * §4, §8 — a package glyph and the app's icon set paint the same weight (2026-08-23).
 *
 * This is the law the source-side one cannot make. `strokeWidth` is stated in VIEWBOX units,
 * so the same literal paints two different weights on two different grids — which is exactly
 * what shipped: the package draws on a 16 viewBox and every icon set the docs could install
 * draws on 24, both said `1.5`, and a select's chevron painted 50% heavier than the Hugeicon
 * in the button beside it. Reading either number alone says nothing. What has to be measured
 * is the pixels.
 *
 * painted stroke = computed stroke-width x (rendered box / viewBox units)
 *
 * The FIXTURE is the load-bearing part (the 2026-08-21 rule: ask what this would look like if
 * the mechanism were absent). Comparing two package glyphs cannot fail — they move together
 * — so the subject is a real package glyph against a 24-grid glyph carrying the public
 * `iconStroke`, which is the composition a consumer actually builds.
 */
import { describe, expect, it } from "vitest";

import { Button } from "../components/button/button.tsx";
import { Notice } from "../components/notice/notice.tsx";
import { iconGrid, iconStroke } from "../tokens/config.ts";
import { SIZES } from "./axes.ts";
import { mounted, within } from "../test/browser.tsx";

/** What a glyph actually paints, in CSS pixels, whatever grid it was drawn on. */
function paintedStroke(svg: SVGSVGElement): number {
  const viewBox = svg.getAttribute("viewBox");
  if (!viewBox) throw new Error("paintedStroke(): the svg states no viewBox");
  const units = Number(viewBox.split(/\s+/)[2]);
  const path = svg.querySelector("path, polyline, line");
  if (!path) throw new Error("paintedStroke(): the svg draws nothing");
  const stated = Number(getComputedStyle(path).strokeWidth.replace("px", ""));
  const box = svg.getBoundingClientRect().width;
  if (!box) throw new Error("paintedStroke(): the svg has no painted box");
  return (stated * box) / units;
}

/** A glyph as an icon set draws one: the ecosystem's grid, carrying the public number. */
const SetGlyph = () => (
  <svg viewBox={`0 0 ${iconGrid} ${iconGrid}`} fill="none" aria-hidden>
    <path d="M5 12h14" stroke="currentColor" strokeWidth={iconStroke} strokeLinecap="round" />
  </svg>
);

describe("one weight across the two grids", () => {
  it("a package glyph paints what the app's set paints, at every index", () => {
    for (const size of SIZES) {
      // Notice draws the package's own dismiss glyph on a 16 viewBox; the Button holds a
      // 24-grid glyph at `iconStroke`. Same index, so the surface and control size joins
      // publish the same icon box and the boxes cannot be what differs.
      const ours = within(
        mounted(<Notice size={size} onDismiss={() => {}}>Message</Notice>, { theme: {} }),
        "svg",
      ) as unknown as SVGSVGElement;
      const theirs = within(
        mounted(<Button size={size} iconOnly aria-label="Add"><SetGlyph /></Button>, { theme: {} }),
        "svg",
      ) as unknown as SVGSVGElement;

      // The boxes must agree first, or the stroke comparison is measuring the wrong thing.
      expect(
        ours.getBoundingClientRect().width,
        `size ${size}: the two icon boxes differ, so this law is not about the stroke`,
      ).toBeCloseTo(theirs.getBoundingClientRect().width, 1);

      expect(
        paintedStroke(ours),
        `size ${size}: a package glyph and an installed icon set paint different weights`,
      ).toBeCloseTo(paintedStroke(theirs), 2);
    }
  });

  it("the painted weight grows with the icon box", () => {
    // Vacuity guard. The agreement above holds just as well if every glyph paints zero, or if
    // the stroke were pinned to one absolute width across the ladder — which is the thing the
    // config claims it is NOT (a stroke lives inside the viewBox, so it rides `iconSize`).
    const at = (size: (typeof SIZES)[number]) =>
      paintedStroke(
        within(
          mounted(<Notice size={size} onDismiss={() => {}}>Message</Notice>, { theme: {} }),
          "svg",
        ) as unknown as SVGSVGElement,
      );
    const small = at("1");
    const large = at("4");
    expect(small).toBeGreaterThan(0);
    expect(large, "the stroke does not ride the icon box").toBeGreaterThan(small);
  });
});
