/**
 * The search index points at pages that exist (2026-08-21).
 *
 * A search index is the one part of a docs site that fails completely silently. Nothing
 * renders wrong, no build breaks, no type complains — a reader types a word, gets a result,
 * clicks it and lands on a 404, and the only person who ever finds out is them. So every href
 * this index can produce is resolved here against the routes the site actually generates.
 *
 * The generator is `buildSearchIndex()`, the same function the chrome calls, rather than a
 * reconstruction of what it probably does. A law that rebuilt the index its own way would be
 * asserting the correctness of the copy.
 */
import { describe, expect, it } from "vitest";

import { CHAPTERS } from "./chapters";
import { ENTRIES } from "./components/registry";
import { buildSearchIndex } from "./search-index";
import { searchEntries } from "./search";
import { chapterToc } from "./toc";

const index = buildSearchIndex();

/** Every path the site generates a page for, plus the anchors on each chapter. */
const routes = new Set<string>([
  "/",
  "/components",
  ...CHAPTERS.map((chapter) => `/${chapter.slug}`),
  ...ENTRIES.map((entry) => `/components/${entry.slug}`),
]);

const anchors = new Set<string>(
  CHAPTERS.flatMap((chapter) =>
    chapterToc(chapter.source).map((entry) => `/${chapter.slug}#${entry.id}`),
  ),
);

describe("every search result goes somewhere", () => {
  it("the index was built — an empty index matches nothing and passes everything", () => {
    // The vacuity guard, and it is the whole risk here: every assertion below loops the
    // index, so an index that failed to build is a green file. The floor is set against the
    // real content rather than at 1, so a build that produced only component entries (the
    // half that needs no filesystem read) still fails.
    expect(index.length).toBeGreaterThan(CHAPTERS.length + ENTRIES.length);
  });

  it("every href resolves to a page or an anchor on one", () => {
    const broken = index
      .map((entry) => entry.href)
      .filter((href) => !routes.has(href) && !anchors.has(href));
    expect(broken).toEqual([]);
  });

  it("every entry has something to match on and something to show", () => {
    for (const entry of index) {
      expect(entry.title.length, `${entry.href} has no title`).toBeGreaterThan(0);
      expect(entry.context.length, `${entry.href} has no context`).toBeGreaterThan(0);
      // Lowercased at build time, which the matcher depends on: it lowercases the QUERY and
      // then compares, so a haystack with capitals silently never matches those words.
      expect(entry.haystack).toBe(entry.haystack.toLowerCase());
    }
  });
});

describe("the matcher finds what the site is searched for", () => {
  it("an exact component name comes first", () => {
    // The ranking's whole job. `Button` also appears in the haystack of most chapters, so
    // without the title-equality rung the component's own page loses to whichever chapter
    // mentions it earliest — which is the failure this ordering exists to prevent, and it is
    // invisible unless a law names the expected winner.
    expect(searchEntries(index, "Button")[0]?.href).toBe("/components/button");
    expect(searchEntries(index, "Card")[0]?.href).toBe("/components/card");
  });

  it("a refused prop finds the component that refuses it", () => {
    // The claim the search dialog makes in its own description, asserted. Refusals are in the
    // haystack on purpose: "why can't I set a margin" is a real search, and the answer is a
    // refusal rather than a feature.
    const hrefs = searchEntries(index, "margin").map((entry) => entry.href);
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs).toContain("/components/button");
  });

  it("a one-character query matches nothing", () => {
    // Not politeness: every entry's haystack contains most single letters, so a one-character
    // query would return the first twelve entries in registry order and read as a broken
    // index rather than an unfinished one.
    expect(searchEntries(index, "a")).toEqual([]);
    expect(searchEntries(index, " ")).toEqual([]);
  });
});
