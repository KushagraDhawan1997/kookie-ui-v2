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
  // PAPER, not any pane (2026-08-29). The frame withholds a CARD, and a Surface at the root is
  // not one — it is a ground, which belongs inside the paper like any other content. Reading
  // `kui-surface` here would agree with a predicate that exempted grounds, which is the answer
  // that put a ground inside the figure's own ground. A composer is paper by the same reading
  // as the predicate's (§30 — a box that holds full-size controls is a Card), and it wears its
  // own class rather than `kui-card`, so it is named.
  return /^<[a-z]+[^>]*class="[^"]*\bkui-(card|composer)\b/.test(afterTheme);
};

/** HTML void elements: they open nothing, so they must not move the depth counter. React's
    server renderer also self-closes them, but an SVG `<path .../>` is the same shape and this
    tree is full of them. */
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

/**
 * Does a card open while a card is still open, with no ground between them?
 *
 * Counted rather than pattern-matched, because the panes are separated by whatever the example
 * nests between them.
 *
 * EVERY tag, not just `<div>` (2026-08-26). `depth > 0` means "inside a card": a non-card
 * element opening at depth 0 is outside every pane and is not counted, and once a card has
 * opened everything nested in it is, so the counter comes back to 0 at the card's close.
 *
 * A GROUND RESETS THE COUNT (2026-08-29), and that is a rule about what the fault IS rather
 * than a hole cut for a failing example. Paper on paper is the fault: two panes of the same
 * kind, one inside the other, saying the same thing twice. A ground is the thing that HOLDS
 * paper — §10's own sentence, and Apple's grouped background — so paper, a ground, then paper
 * is an ordinary arrangement and the only one a Surface example can show. Without this the law
 * forbids the component's own meaning from being documented.
 */
const panesNested = (html: string): boolean => {
  let depth = 0;
  let nested = false;
  // Card depths suspended at each open ground, restored when that ground closes. A stack
  // rather than a flag, because a ground may sit inside a ground.
  const suspended: Array<{ at: number; cards: number }> = [];
  let element = 0;
  for (const tag of html.match(/<\/?[a-zA-Z][^>]*>/g) ?? []) {
    const name = /^<\/?\s*([a-zA-Z0-9-]+)/.exec(tag)?.[1]?.toLowerCase();
    if (!name) continue;
    if (tag.startsWith("</")) {
      element = Math.max(0, element - 1);
      if (suspended.length && suspended[suspended.length - 1]!.at === element) {
        depth = suspended.pop()!.cards;
      } else {
        depth = Math.max(0, depth - 1);
      }
      continue;
    }
    if (VOID.has(name) || /\/>$/.test(tag)) continue;
    if (/class="[^"]*\bkui-ground\b/.test(tag)) {
      suspended.push({ at: element, cards: depth });
      depth = 0;
      element++;
      continue;
    }
    element++;
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
    // The threshold is ONE, not a count (2026-08-29). It read `> 2` while the predicate also
    // matched a Surface at the root and while three examples wrapped themselves in a card for
    // no reason; narrowing the predicate to paper and taking those wrappers out left exactly
    // the examples whose SUBJECT is a pane, which is a small set by construction. What the
    // guard is for is that both arms are reached at all — a set that is all one answer proves
    // nothing about the other — and one example on each side does that.
    const paned = names.filter((n) => rootsOwnPane(readExampleSource(n)));
    expect(paned.length, "no example roots a pane; the frame has nothing to skip").toBeGreaterThan(0);
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

describe("an example that hands a component a handler is a client component (audit 2026-09-02)", () => {
  /* `next build` prerenders every component page, and an example that passes an event handler
     while rendering as a Server Component fails at that prerender. It shipped for a day, hidden
     behind the licensed-font failure that makes `docs#build` red in any fresh clone — so the
     one thing that would have caught it was the one thing nobody could read. A habit is not a
     mechanism; this is the mechanism. Falsified by removing the directive from any example
     that passes a handler. */
  it("every example passing an on* prop declares \"use client\"", () => {
    const names = Object.keys(EXAMPLES);
    expect(names.length, "the registry is empty — this law reads nothing").toBeGreaterThan(20);
    const offending = names.filter((name) => {
      const src = readExampleSource(name);
      return /\son[A-Z][A-Za-z]+=\{/.test(src) && !src.trimStart().startsWith('"use client"');
    });
    expect(offending, "these examples pass a handler across the RSC boundary").toEqual([]);
  });
});
