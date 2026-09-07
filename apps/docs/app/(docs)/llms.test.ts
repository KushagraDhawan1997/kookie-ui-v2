import { describe, expect, it } from "vitest";

import { PAGES, markdownFor } from "./markdown";
import { llmsFull, llmsIndex, originFrom } from "./llms";

const BASE = "https://example.test";

/**
 * `llms.txt` and `llms-full.txt` (§47).
 *
 * The half of this work that needs nobody to press anything, and therefore the half nobody
 * will ever look at: an index nothing links to, read by clients that report nothing when it is
 * wrong. Every claim below is read off the output.
 */
describe("the index lists the site", () => {
  const out = llmsIndex(BASE);

  it("every page, once, and nothing that is not a page", () => {
    const linked = [...out.matchAll(/^- \[.*?\]\((.*?)\):/gm)].map((match) => match[1]);
    expect(linked).toEqual(PAGES.map((page) => `${BASE}${page.path}.md`));
  });

  it("every link is the TWIN, not the page", () => {
    // The whole reason the file exists. A list of HTML URLs is a sitemap, which this site
    // already has by other means and which no agent can read without parsing markup.
    for (const link of out.matchAll(/\]\((.*?)\)/g)) expect(link[1]).toMatch(/\.md$/);
  });

  it("and each one carries the words that page already states about itself", () => {
    // WHETHER THOSE WORDS ARE ANY GOOD IS NOT THIS FILE'S QUESTION. The registry and the
    // chapter list each hold their own blurbs to a floor, and re-judging them here would be a
    // second home for a rule with an owner — and a worse one, since "Text sets body copy." is
    // a perfectly good abstract that a length floor calls hollow. What this asserts is that
    // the mapping DELIVERS them: a page whose blurb went missing prints a bare link.
    for (const page of PAGES) {
      expect(out, page.path).toContain(`](${BASE}${page.path}.md): ${page.blurb}`);
    }
  });

  it("grouped, and every group has a heading before its first entry", () => {
    let heading = false;
    for (const line of out.split("\n")) {
      if (line.startsWith("## ")) heading = true;
      if (line.startsWith("- [")) expect(heading, line).toBe(true);
    }
    expect(heading).toBe(true);
  });
});

describe("the full text is the whole site", () => {
  const out = llmsFull(BASE);

  it("every page's body is in it", () => {
    for (const page of PAGES) {
      const body = markdownFor(page.path)!;
      // The first heading and a real line of the page, not just its title: a concatenation
      // that dropped every body but kept the headings would read as complete.
      expect(out, page.path).toContain(body.trim().split("\n").slice(0, 3).join("\n"));
    }
  });

  it("and each one is separated and sourced", () => {
    // Concatenation loses the boundary — every page opens at `#`, so without a rule the props
    // table of one page runs into the overview of the next.
    expect(out.split("\n---\n").length).toBe(PAGES.length + 1);
    for (const page of PAGES) expect(out).toContain(`Source: ${BASE}${page.path}`);
  });

  it("it is one fetch, and a big one — an empty concatenation would still pass the above", () => {
    expect(out.length).toBeGreaterThan(200_000);
  });
});

describe("the origin comes from the request", () => {
  it("a proxied host is https", () => {
    expect(originFrom(new Headers({ host: "kookie.dev", "x-forwarded-proto": "https" }))).toBe(
      "https://kookie.dev",
    );
  });

  it("a bare host is https, and localhost is not", () => {
    // The one case a configured constant always gets wrong, which is why there is no constant.
    expect(originFrom(new Headers({ host: "kookie.dev" }))).toBe("https://kookie.dev");
    expect(originFrom(new Headers({ host: "localhost:3000" }))).toBe("http://localhost:3000");
    expect(originFrom(new Headers({ host: "127.0.0.1:3000" }))).toBe("http://127.0.0.1:3000");
  });
});
