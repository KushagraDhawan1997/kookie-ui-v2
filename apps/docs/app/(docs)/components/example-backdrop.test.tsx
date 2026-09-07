/**
 * A control in a floating band states its own backdrop (2026-09-06, Kushagra: "always use
 * backdrop on buttons if content floats behind them").
 *
 * `float` on a `ShellPaneHeader` or `ShellPaneFooter` means one thing: the row leaves flow and
 * the document passes UNDERNEATH it. The band itself paints nothing — it is a row of controls
 * over the content, not a bar across it — so the only thing standing between a paragraph and
 * the button sliding over it is the material on the button. That is §10's selectivity read
 * straight: glass is expressed where something passes behind, and this is that placement.
 *
 * IT IS A CALL-SITE RULE, WHICH IS WHY IT NEEDS A LAW. The package cannot decide it — a pane
 * states its own backdrop and never infers one (2026-08-29) — so the examples are where the
 * rule is taught, and a rule taught by example rots the first time someone copies a band
 * without it. The site's own chrome had it from the day the band floated; the Page example
 * shipped without it, which is the drift this catches.
 *
 * WHAT IT READS, honestly. Not source: `backdrop` is INERT under the solid material every
 * example renders in, so the markup is identical either way. Rendered under a glass Theme it
 * is not — a control that resolves the material stamps `data-material` and one that does not
 * stamps nothing — so the law renders each example into the world where the prop means
 * something and reads what the control announces. Which is the same reason the toolbar's
 * `nativeButton` defect survived twenty-six laws: read what the element says, not what the
 * author wrote.
 */
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Theme } from "@kookie-ui/react";

import { EXAMPLES } from "../../../examples";
import RootLayout from "../../layout";
import DocsLayout from "../../(docs)/layout";

/** Every band in a rendered example, as the markup between a floating part's open tag and its
    close. A regex over rendered HTML rather than a parser: the band is one element with one
    depth of nesting under it, and the alternative is a DOM the docs app has no browser for. */
function floatingBands(html: string): string[] {
  const bands: string[] = [];
  const open = /<div[^>]*class="[^"]*kui-pane-(?:header|footer)[^"]*"[^>]*data-float[^>]*>/g;
  for (let match = open.exec(html); match; match = open.exec(html)) {
    // Walk div depth from the band's open tag to its matching close.
    let depth = 0;
    const tag = /<(\/?)div\b|<div\b/g;
    tag.lastIndex = match.index;
    let end = -1;
    for (let t = tag.exec(html); t; t = tag.exec(html)) {
      depth += t[1] === "/" ? -1 : 1;
      if (depth === 0) {
        end = tag.lastIndex;
        break;
      }
    }
    if (end > 0) bands.push(html.slice(match.index, end));
  }
  return bands;
}

/** Every control's opening tag inside one band. A `.kui-control` is what the shared layer marks
    a pressable box with, so this catches a `Button`, a `ToolbarButton` and a field alike. */
const controlsIn = (band: string): string[] =>
  band.match(/<(?:button|a|div|input)[^>]*class="[^"]*kui-control[^"]*"[^>]*>/g) ?? [];

describe("a control in a floating band states its backdrop (§10, §27, §45)", () => {
  const names = Object.keys(EXAMPLES);
  /* THE FIXTURE IS THE LAW'S OTHER HALF. Under the default solid material nothing stamps
     anything and every assertion below would pass against an example with no `backdrop`
     anywhere — the degenerate fixture this repo keeps finding. `regular` is what makes the
     prop mean something. */
  const render = (name: string) =>
    renderToStaticMarkup(
      <Theme material="regular">{React.createElement(EXAMPLES[name]!)}</Theme>,
    );

  it("at least one shipped example has a floating band — or this law reads nothing", () => {
    const withBands = names.filter((name) => floatingBands(render(name)).length > 0);
    expect(withBands.length).toBeGreaterThan(0);
    // And the bands hold controls, or "every control states it" is vacuously true.
    const withControls = withBands.filter((name) =>
      floatingBands(render(name)).some((band) => controlsIn(band).length > 0),
    );
    expect(withControls.length).toBeGreaterThan(0);
  });

  for (const name of names) {
    it(`every control in a floating band resolves the material — ${name}`, () => {
      for (const band of floatingBands(render(name))) {
        for (const control of controlsIn(band)) {
          expect(control).toMatch(/data-material=/);
        }
      }
    });
  }
});

/* AND THE SITE'S OWN CHROME, which is where the rule is actually LIVED (2026-09-06). The law
   above walks the shipped examples, and it missed a real one for that reason: the sidebar's
   floating footer holds the appearance Select, which states `backdrop`, beside a GitHub button
   that did not — two controls in one band, one glass and one opaque, found by a person looking
   at the site rather than by a suite reading examples. A law narrower than the rule it enforces
   is a law that cannot fail on the case that matters.

   Rendered through the ROOT layout, because the material is the Theme's and a `backdrop` with
   no glass around it stamps nothing — the same fixture point the examples make above. */
describe("the documentation site's own floating bands (§10, §27, §45)", () => {
  it("every control in a floating band on this site resolves the material", () => {
    const out = renderToStaticMarkup(
      RootLayout({ children: DocsLayout({ children: "page" }) }) as never,
    );
    const bands = floatingBands(out);
    // The site has bands, and they hold controls — or the assertion below reads nothing.
    expect(bands.length).toBeGreaterThan(0);
    expect(bands.some((band) => controlsIn(band).length > 0)).toBe(true);
    for (const band of bands) {
      for (const control of controlsIn(band)) {
        expect(control).toMatch(/data-material=/);
      }
    }
  });
});
