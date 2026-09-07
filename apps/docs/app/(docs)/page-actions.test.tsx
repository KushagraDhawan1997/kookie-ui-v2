/**
 * The Copy Page control (§47).
 *
 * RENDERED, not read. Two of its three claims are decisions a source law would agree with
 * while being wrong: which pages draw it, and what each destination is handed. The third —
 * that the markdown it points at is the markdown the site serves — is the join that the whole
 * feature rests on, and it is the join nothing else in this repo checks.
 */
import { readFileSync } from "node:fs";

import { Toolbar } from "@kookie-ui/react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PAGES, markdownFor } from "./markdown";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const { COPIES, PageActions, DESTINATIONS, askAbout, twinOf } = await import("./page-actions");

const PATHS = PAGES.map((page) => page.path);

/* IN A TOOLBAR, because that is the only place a `ToolbarButton` is legal (§45) — it registers
   with the row's roving tab stop and throws outside one. */
const at = (path: string) => {
  pathname = path;
  return renderToStaticMarkup(
    <Toolbar>
      <PageActions paths={PATHS} />
    </Toolbar>,
  );
};

/** What the row draws inside itself — the row's own markup is not the subject. */
const inside = (path: string) => at(path).replace(/^<div[^>]*>|<\/div>$/g, "");

beforeEach(() => {
  pathname = "/";
});

/**
 * Every control's own opening tag, keyed by what it is.
 *
 * READ AS ELEMENTS, never as slices of the string. Two earlier spellings failed on correct
 * code, each by asking a question the markup does not answer: one split the markup at the
 * group and called the halves "button" and "group", which is a claim about ORDER wearing a
 * claim about rank — and Kushagra swapped the order an hour later; the other walked back from
 * a needle to the nearest `<button`, which finds nothing when the control wears a `render`
 * escape and is an `<a>`, and finds a `<span>` when the needle is a label rather than an
 * attribute. The tags are what the claim is about, so they are what this collects.
 *
 *
 * THE CLASS BOUNDARY IS EXACT. A plain `\b` after `kui-button` matches inside
 * `kui-button-swap` — the done state's two stacked glyphs (§41) — so the first run collected
 * four extra elements and reported the ranks missing on all of them.
 */
const controls = (markup: string) => {
  const tags = [...markup.matchAll(/<[a-z]+\b[^>]*class="[^"]*\bkui-button(?![-\w])[^"]*"[^>]*>/g)].map(
    (match) => match[0],
  );
  const named = (label: string) => {
    const tag = tags.find((candidate) => candidate.includes(`aria-label="${label}"`));
    expect(tag, `no control named ${label}`).toBeTruthy();
    return tag!;
  };
  return { all: tags, named };
};

/** Each `ToolbarGroup` element and its contents, in order. */
const groupsIn = (markup: string): string[] => {
  const groups: string[] = [];
  for (let at = markup.indexOf("kui-toolbar-group"); at > -1; at = markup.indexOf("kui-toolbar-group", at + 1)) {
    const start = markup.lastIndexOf("<div", at);
    let depth = 0;
    for (const match of markup.slice(start).matchAll(/<(\/?)div\b/g)) {
      depth += match[1] ? -1 : 1;
      if (depth === 0) {
        groups.push(markup.slice(start, start + match.index + 6));
        break;
      }
    }
  }
  expect(groups.length, "unbalanced groups").toBeGreaterThan(0);
  return groups;
};



describe("it appears exactly where there is a twin to copy", () => {
  it("a chapter, a component and a block all draw it", () => {
    for (const path of ["/foundations/color", "/components/button", PATHS.find((p) => p.startsWith("/blocks/"))!]) {
      expect(at(path), path).toContain(`aria-label="${COPIES[0]!.label}"`);
    }
  });

  it("and a page with no twin draws NOTHING", () => {
    // A control that copies nothing is the dead-control fault this repo has now found three
    // times — the builder's armed commands, the inert breadcrumb ellipsis, and here.
    for (const path of ["/", "/components", "/blocks", "/matrix"]) {
      expect(inside(path), path).toBe("");
      expect(markdownFor(path), path).toBeNull();
    }
  });

  it("the two answers agree on EVERY page — the control never guesses", () => {
    // The law for the design: the control is handed its list by a server component precisely
    // so that "does this page have a twin" has one implementation. This is what says the list
    // it is handed is that answer.
    for (const path of PATHS) expect(markdownFor(path), path).toBeTruthy();
    expect(PATHS.length).toBe(new Set(PATHS).size);
  });
});

describe("the control draws what it promises", () => {
  const markup = at("/components/button");

  it("two controls that copy, and three that send it somewhere", () => {
    for (const copy of COPIES) expect(markup).toContain(`aria-label="${copy.label}"`);
    for (const destination of DESTINATIONS) {
      expect(markup).toContain(`aria-label="${destination.label}"`);
    }
  });

  it("TWO tracks, split by what the control does", () => {
    // 2026-09-06: one attached pill, then a button beside a group, now two groups. What the
    // split means has been the same throughout — copying puts this page on your clipboard, the
    // marks send it somewhere else — and the gap between the tracks is where the kinds change.
    const groups = groupsIn(markup);
    expect(groups).toHaveLength(2);
    const holding = (label: string) =>
      groups.filter((group) => group.includes(`aria-label="${label}"`));
    for (const destination of DESTINATIONS) {
      expect(holding(destination.label), destination.label).toHaveLength(1);
    }
    for (const copy of COPIES) expect(holding(copy.label), copy.label).toHaveLength(1);
    // …and the two kinds never share a track.
    const marks = holding(DESTINATIONS[0]!.label)[0]!;
    for (const copy of COPIES) {
      expect(marks, `${copy.label} is in the marks' track`).not.toContain(copy.label);
    }
  });

  it("every control is quiet, because every one of them sits in a track", () => {
    // Kushagra's standing rule — medium is the resting rank, quiet is exceptional — met by the
    // parts rather than stated per control. It USED to be the interesting half of this law,
    // when `Copy Page` stood outside a group at medium; with every control in a track the rule
    // is the one §45 already states, and this says no call site has overridden it.
    const { all } = controls(markup);
    expect(all).toHaveLength(DESTINATIONS.length + COPIES.length);
    for (const tag of all) expect(tag).toContain('data-emphasis="quiet"');
  });

  it("every control is a NAMED icon-only one — a glyph announces nothing", () => {
    // The disclosure is gone and so is the last word on the row, so the accessible name is now
    // the whole of what any of these five controls says.
    const { all } = controls(markup);
    for (const tag of all) expect(tag).toMatch(/aria-label="[^"]+"/);
    expect(markup.match(/data-icon-only="true"/g)?.length).toBe(all.length);
  });

  it("a copy control says WHAT it copied, not just that it did", () => {
    // §41 requires the name to change with the glyph, because a tick is a drawing and
    // assistive technology announces a name. With two of them, "Copied" would be one word for
    // two different artefacts.
    expect(new Set(COPIES.map((copy) => copy.done)).size).toBe(COPIES.length);
    for (const copy of COPIES) expect(copy.done).not.toBe(copy.label);
  });

  it("and the control actually WEARS that word when it is done", () => {
    /**
     * READ OFF THE SOURCE, and the reason is that no mount here can answer it.
     *
     * The done word is worn only while `copied` is set, which is internal state reached by a
     * real press and a real clipboard — neither of which exists in a node suite. So the law
     * above, which reads the two strings and finds them different, passes with the render
     * ignoring `done` entirely: its own sabotage proved exactly that, and this is what
     * replaces it. The precedent is the builder's `liveFix` law, written for the same reason —
     * the claim lives at a call site no fixture can reach.
     *
     * A source law is the weaker instrument and it is stated as one: what it can prove is that
     * both names a reader could receive are derived from `done`, not that the state flips.
     */
    const source = readFileSync(new URL("./page-actions.tsx", import.meta.url), "utf8");
    const control = source.slice(source.indexOf("{COPIES.map"), source.indexOf("</ToolbarGroup>", source.indexOf("{COPIES.map")));
    expect(control, "the accessible name must change with the tick").toMatch(
      /aria-label=\{[^}]*\bdone\b[^}]*\}/,
    );
    expect(control, "and so must the tooltip that repeats it").toMatch(
      /<TooltipContent>\{[^}]*\bdone\b[^}]*\}/,
    );
  });

  it("and the done state is mounted before it is needed", () => {
    // §41: both glyphs are mounted always, because React would unmount the outgoing one and an
    // unmounted element cannot leave. A tick that only appears on success has no entry.
    expect(markup).toContain("kui-button-swap-to");
  });
});

/**
 * WHAT EACH DESTINATION IS HANDED.
 *
 * Read as data rather than as markup, and that is forced: the menu is a closed portal, so not
 * one of these appears in a server render. The claim is about a string, so it is checked as
 * one — which is also the only shape that can assert the URL is ABSOLUTE, since the origin
 * only exists after mount.
 */
describe("the destinations are handed the twin's URL", () => {
  const origin = "https://example.test";
  const url = `${origin}${twinOf("/components/button")}`;

  it("every destination carries it", () => {
    expect(DESTINATIONS.length).toBeGreaterThan(0);
    for (const destination of DESTINATIONS) {
      const href = destination.href(url);
      // The twin's reader gets the URL itself; the two that chat get it encoded into a query.
      // A destination whose parameter was dropped opens an empty chat that looks perfectly fine.
      if (href === url) continue;
      expect(href, destination.label).toContain(encodeURIComponent(url));
      expect(new URL(href).search, destination.label).not.toBe("");
    }
  });

  it("and one of them is the twin itself, unwrapped", () => {
    // The plain reader. A menu of ways to send a document somewhere, with no way to just read
    // it, is the shape this whole feature exists to replace.
    expect(DESTINATIONS.some((destination) => destination.href(url) === url)).toBe(true);
  });

  it("and the sentence names the twin and nothing else", () => {
    // The Mintlify finding: a document reaching an agent's context may not carry text that is
    // not the document, and the sentence wrapping it may not carry an instruction of its own.
    const sentence = decodeURIComponent(askAbout(url));
    expect(sentence).toContain(url);
    expect(sentence.length).toBeLessThan(160);
  });

  it("the URL it names is a document the site actually serves", () => {
    // THE JOIN, and nothing else in this file is it: the control builds a path and every law
    // above would pass with the route handler deleted.
    expect(twinOf("/components/button")).toBe("/components/button.md");
    expect(markdownFor("/components/button")).toBeTruthy();
  });
});

describe("what it refuses", () => {
  it("no v0", () => {
    // 2026-09-06, Kushagra. v0 writes React from a prompt, so pointing it at a design system's
    // docs invites code using our components against a package it has not installed.
    for (const destination of DESTINATIONS) {
      expect(destination.href("q"), destination.label).not.toMatch(/v0\.(dev|app)/);
    }
  });

  it("no menu — every destination is reachable without opening anything", () => {
    // 2026-09-06, Kushagra: "we dont need dropdown, everyone knows these logos by now". The
    // markup law is the one that can fail: the data laws above pass with all three hidden
    // behind a trigger, because a destination is a URL either way.
    expect(at("/components/button")).not.toContain('aria-haspopup="menu"');
  });
});

/**
 * IT RENDERS ON A SERVER, and that is a law rather than an assumption.
 *
 * The first spelling read `window.location.origin` inside the menu's children, on the belief
 * that a portal's contents are built when it opens. They are built when the parent renders, so
 * the reference ran during SSR and threw on every page of the site. Nothing in the file above
 * would have caught it — the failure is the RENDER, not what the render produced.
 */
describe("nothing in it touches the browser during render", () => {
  it("every page renders in node with no window", () => {
    expect(typeof globalThis.window).toBe("undefined");
    for (const path of PATHS) expect(() => at(path), path).not.toThrow();
  });
});
