/**
 * The specimen frame does not put a pane inside a pane (2026-08-21).
 *
 * This site shipped card-inside-card on four component pages, and the reason it survived every
 * existing law is the reason it needs this one: the nesting CROSSES A COMPONENT BOUNDARY. The
 * frame renders a `<Card>` in one file; the example exports a card from another; neither file
 * contains a nested card. Only the rendered tree does, so the rendered tree is what this reads.
 *
 * `rootsOwnPane` decides by reading source, which this repo rates below reading output — and
 * that is exactly why the agreement below is the law rather than the predicate's own answer.
 * One implementation reads the file, the other renders the module, and they must say the same
 * thing (the two-implementations rule, ENGINEERING §6).
 */
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Card, Theme } from "@kookie-ui/react";

import { readExampleSource, rootsOwnPane } from "../example";
import { EXAMPLES } from "../../../examples";

/** What the module actually renders at its root, as the browser would see it. */
const rootIsPane = (name: string): boolean => {
  const Component = EXAMPLES[name]!;
  const html = renderToStaticMarkup(
    React.createElement(Theme, null, React.createElement(Component)),
  );
  // The Theme's own div is first; the example's root is the element after it.
  const afterTheme = html.slice(html.indexOf(">", html.indexOf("kui-theme")) + 1);
  return /^<[a-z]+[^>]*class="[^"]*\bkui-(card|surface)\b/.test(afterTheme);
};

describe("the specimen frame agrees with what the example renders", () => {
  const names = Object.keys(EXAMPLES);

  it("found examples to walk", () => {
    expect(names.length).toBeGreaterThan(20);
  });

  it("some examples root a pane and some do not — both arms are exercised", () => {
    // Vacuity: an agreement law over a set that is all one answer proves nothing about the
    // other. Named here so a future change that flattens the set fails loudly.
    const paned = names.filter((n) => rootsOwnPane(readExampleSource(n)));
    expect(paned.length, "no example roots a pane; the frame has nothing to skip").toBeGreaterThan(2);
    expect(paned.length).toBeLessThan(names.length);
  });

  it("the source predicate and the rendered root say the same thing", () => {
    const disagree = names.filter((n) => rootsOwnPane(readExampleSource(n)) !== rootIsPane(n));
    expect(disagree, "the frame would wrap the wrong examples").toEqual([]);
  });

  it("no example inside the frame puts a pane inside a pane", () => {
    // The guarantee itself, read off markup. Only the examples the frame WOULD wrap are
    // wrapped here, which is the composition the page actually renders.
    for (const name of names) {
      const Component = EXAMPLES[name]!;
      const bare = rootsOwnPane(readExampleSource(name));
      const specimen = React.createElement(Component);
      const html = renderToStaticMarkup(
        React.createElement(
          Theme,
          null,
          bare ? specimen : React.createElement(Card, { size: "4" }, specimen),
        ),
      );
      // A card that opens while a card is still open. Counted rather than pattern-matched,
      // because the panes are separated by whatever the example nests between them.
      let depth = 0;
      let nested = false;
      for (const tag of html.match(/<div[^>]*>|<\/div>/g) ?? []) {
        if (tag.startsWith("</")) depth = Math.max(0, depth - 1);
        else {
          if (/class="[^"]*\bkui-card\b/.test(tag)) {
            if (depth > 0) nested = true;
            depth++;
          } else if (depth > 0) depth++;
        }
      }
      expect(nested, `${name} renders a card inside a card`).toBe(false);
    }
  });
});
