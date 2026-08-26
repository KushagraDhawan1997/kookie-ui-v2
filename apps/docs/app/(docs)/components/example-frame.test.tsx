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

/** HTML void elements: they open nothing, so they must not move the depth counter. React's
    server renderer also self-closes them, but an SVG `<path .../>` is the same shape and this
    tree is full of them. */
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

/**
 * Does a card open while a card is still open? Counted rather than pattern-matched, because
 * the panes are separated by whatever the example nests between them.
 *
 * EVERY tag, not just `<div>` (2026-08-26). `depth > 0` means "inside a card": a non-card
 * element opening at depth 0 is outside every pane and is not counted, and once a card has
 * opened everything nested in it is, so the counter comes back to 0 at the card's close.
 */
const panesNested = (html: string): boolean => {
  let depth = 0;
  let nested = false;
  for (const tag of html.match(/<\/?[a-zA-Z][^>]*>/g) ?? []) {
    const name = /^<\/?\s*([a-zA-Z0-9-]+)/.exec(tag)?.[1]?.toLowerCase();
    if (!name) continue;
    if (tag.startsWith("</")) {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (VOID.has(name) || /\/>$/.test(tag)) continue;
    if (/class="[^"]*\bkui-card\b/.test(tag)) {
      if (depth > 0) nested = true;
      depth++;
    } else if (depth > 0) depth++;
  }
  return nested;
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

  it("the scanner sees a card whatever element it is rendered as", () => {
    /**
     * The instrument, calibrated against a known answer before its output is evidence
     * (the 2026-08-08 lesson). Until 2026-08-26 the scan walked `<div>` tags ALONE, and Card's
     * whole documented escape is `render` — `<Card render={<button/>}>` emits
     * `<button class="kui-surface kui-card">`, which the div walk cannot see. So the law was
     * about the special case (a card that happens to be a div) wearing the general one's name,
     * and the nesting it exists to catch was invisible in exactly the arrangement the docs
     * recommend.
     *
     * Both arms, because either alone passes with the scanner broken: a rendered card MUST be
     * caught nested, and two cards side by side must NOT be.
     */
    const nested = renderToStaticMarkup(
      <Theme>
        <Card size="4">
          <Card render={<button />}>inner</Card>
        </Card>
      </Theme>,
    );
    expect(panesNested(nested), "a card rendered as a <button> inside a card").toBe(true);

    const siblings = renderToStaticMarkup(
      <Theme>
        <Card size="4">a</Card>
        <Card render={<button />}>b</Card>
      </Theme>,
    );
    expect(panesNested(siblings), "two cards side by side are not nested").toBe(false);
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
      expect(panesNested(html), `${name} renders a card inside a card`).toBe(false);
    }
  });
});
