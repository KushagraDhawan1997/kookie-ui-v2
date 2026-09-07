/**
 * The canonical URL answers in markdown when a client asks for it (2026-09-07, §47).
 *
 * THREE ARMS, because the obvious one cannot fail. "Does `Accept: text/markdown` produce a
 * rewrite" is true of a presence check, of a header-contains check, and of the real thing — and
 * presence is the spelling that hands a markdown file to every browser with an extension
 * installed. So the arms are: what the matcher COVERS, read out of the middleware's own source;
 * what the negotiator decides about REAL headers, including two captured off the wire; and
 * whether the body a negotiated request lands on is byte-for-byte the twin's.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET } from "../md/[...slug]/route";
import { PAGES, markdownFor } from "./markdown";
import { alternateLink, markdownRoute, prefersMarkdown } from "./negotiate";
import { config, middleware } from "../../middleware";

/* Next's OWN router compiler, so the agreement arm below measures the thing that really
   decides which requests reach `middleware()` rather than this file's reading of it. The
   specifier is internal to Next and carries no types, which is why it is cast here: if the
   path moves, this import throws and the arm goes red, which is the loud way for a bet on an
   internal to end. */
const { pathToRegexp } = (await import(
  // @ts-expect-error — no type declarations ship with Next's vendored copy.
  "next/dist/compiled/path-to-regexp"
)) as { pathToRegexp: (source: string) => RegExp };

const middlewareSource = readFileSync(
  fileURLToPath(new URL("../../middleware.ts", import.meta.url)),
  "utf8",
);

describe("the matcher covers the pages and nothing else", () => {
  /**
   * COMPILED FROM THE SOURCE, not from an import, and that is the whole point of this arm.
   * Next statically analyses the `matcher` array at build time, so it has to be a literal —
   * which means the one thing that can go wrong is the literal falling behind `PAGES`, and the
   * only way to see that is to read the literal.
   *
   * The entries are written as plain regular expressions with no `:param` in them, so
   * "compiling" one is anchoring it. That is a deliberate constraint on how the matcher may be
   * spelled rather than a convenience: a path-to-regexp parameter would need this law to grow
   * a second implementation of Next's own router, which is a mechanism with two homes.
   */
  const patterns = (): RegExp[] => {
    const block = /export const config = \{([\s\S]*?)\n\};/.exec(middlewareSource);
    expect(block, "no `config` object in middleware.ts").not.toBeNull();
    expect(block![1], "the config object declares no `matcher`").toContain("matcher:");
    // EVERY quoted string in the object, rather than a second regex that tries to find the
    // array's closing bracket: a matcher entry contains `]` — `[^/.]+` — so a bracket scan
    // stops inside the pattern and parses the array as empty. It found nothing and reported
    // nothing, which is the failure this whole law exists to make loud.
    const entries = [...block![1]!.matchAll(/"([^"]+)"/g)].map((match) => match[1]!);
    expect(entries.length, "the matcher parsed as empty").toBeGreaterThan(0);
    for (const entry of entries) {
      // A path-to-regexp parameter, which this law cannot compile. `(?:` is not one, so the
      // lookbehind is load-bearing: without it the alternation in the shipped matcher trips
      // this guard and the arm fails on correct code.
      expect(entry, "a matcher entry carries a `:param`; this law cannot read one").not.toMatch(
        /(?<!\?):[A-Za-z]/,
      );
    }
    return entries.map((entry) => new RegExp(`^${entry}$`));
  };

  const matches = (path: string) => patterns().some((pattern) => pattern.test(path));

  it("every page this site serves a twin for is matched", () => {
    // Vacuity: `PAGES` is three registries concatenated, and a walk over an empty one would
    // make this the most confident law in the file.
    expect(PAGES.length).toBeGreaterThan(30);
    expect(PAGES.filter((page) => !matches(page.path)).map((page) => page.path)).toEqual([]);
  });

  it("the twin's own URL is not matched, in either spelling", () => {
    // Middleware runs BEFORE `next.config.ts`'s rewrites, so `/components/button.md` arrives
    // here as itself. Negotiating on it would rewrite `/md/components/button.md` and 404 the
    // one URL that already worked. And `/md/*` — what the rewrite produces — must not come
    // back through, or a negotiated request would rewrite forever.
    for (const page of PAGES) {
      expect(matches(`${page.path}.md`), `${page.path}.md is matched`).toBe(false);
      expect(matches(markdownRoute(page.path)), `${markdownRoute(page.path)} is matched`).toBe(
        false,
      );
    }
  });

  it("Next's own router agrees with this law about every one of them", () => {
    /**
     * TWO IMPLEMENTATIONS OWE AN AGREEMENT LAW. The arms above compile a matcher entry by
     * anchoring it, which is valid only because the entries carry no `:param` — but the thing
     * that decides which requests actually reach `middleware()` is Next's own path-to-regexp,
     * and a law that agrees with itself proves nothing about the router.
     *
     * A PRIVATE IMPORT, deliberately and with its failure mode chosen: if Next moves this
     * path, the import throws and this arm goes red, which is the loud way for a bet on an
     * internal to end. The alternative — trusting the anchored form — is the quiet one.
     *
     * Next's compiled form ends `[\/#\?]?$`, so it also accepts a trailing slash where this
     * law's `$` does not. Every subject below is written without one, which is the only shape
     * either side is being asked about.
     */
    const routers = config.matcher.map((entry) => pathToRegexp(entry));
    const subjects = [
      ...PAGES.map((page) => page.path),
      ...PAGES.map((page) => `${page.path}.md`),
      ...PAGES.map((page) => markdownRoute(page.path)),
      "/",
      "/components",
      "/builder",
    ];
    expect(subjects.length).toBeGreaterThan(90);
    const disagreed = subjects.filter(
      (path) => routers.some((router) => router.test(path)) !== matches(path),
    );
    expect(disagreed).toEqual([]);
  });

  it("routes that have no twin are not matched", () => {
    // `Vary: Accept` and a `Link` to a `.md` that 404s are both claims, and a route with no
    // twin cannot make either of them. The index pages are the ones a prefix match would
    // swallow if the matcher stopped counting segments.
    for (const path of ["/", "/components", "/blocks", "/builder", "/preview", "/llms.txt"]) {
      expect(matches(path), `${path} is matched`).toBe(false);
    }
  });
});

describe("what a real client's Accept header means", () => {
  /**
   * CAPTURED, not remembered, for the two that decide the feature.
   *
   * The Chromium string was read off a request from a real headless Chromium navigation
   * (playwright, 2026-09-07) and the wildcard off a Node `fetch()` to the same server. Those
   * are the two headers this mechanism meets constantly, and both must come back HTML: the
   * browser's because it ranks `text/html` first and reaches markdown only through a wildcard
   * at q=0.8, and `fetch`'s because a client that expressed no preference did not ask.
   */
  const CHROMIUM =
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";

  const TABLE: [string, string | null, boolean][] = [
    ["a Chromium navigation", CHROMIUM, false],
    ["a Node fetch, and curl", "*/*", false],
    ["no header at all", null, false],
    ["an empty header", "", false],
    ["a type range over text", "text/*", false],
    ["markdown alone", "text/markdown", true],
    ["markdown with a charset parameter", "text/markdown;charset=utf-8", true],
    ["markdown first, html second", "text/markdown,text/html;q=0.9", true],
    ["html first, markdown second, equal q", "text/html,text/markdown", false],
    ["html listed first but ranked lower", "text/html;q=0.9,text/markdown", true],
    ["both at the same lowered q, markdown first", "text/markdown;q=0.5,text/html;q=0.5", true],
    // The specificity rule: an exact range beats a wildcard for the type it names, so a client
    // that took markdown off the table has taken it off the table.
    ["markdown refused beside a wildcard", "text/markdown;q=0, */*", false],
    ["a wildcard preferred over markdown", "*/*, text/markdown;q=0.5", false],
    ["something else entirely", "image/png", false],
    // Specificity beats position on a q tie: html is NAMED, markdown is merely covered.
    ["markdown reached only through text/*", "text/*, text/html", false],
    ["a wildcard first, html named after it", "*/*, text/html", false],
  ];

  it.each(TABLE)("%s", (_name, accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected);
  });

  it("the browser string is not merely unparsed", () => {
    // Vacuity, and it is the one that matters here: a `prefersMarkdown` that threw its input
    // away and returned false would pass every negative row above. The header has to be READ —
    // asking it for markdown at a q it can actually reach proves the parse ran.
    expect(prefersMarkdown(CHROMIUM.replace("*/*;q=0.8", "text/markdown;q=1.0,*/*;q=0.8"))).toBe(
      false,
    );
    expect(prefersMarkdown(`text/markdown,${CHROMIUM}`)).toBe(true);
  });
});

describe("a negotiated request lands on the twin's own bytes", () => {
  /** One of each kind of page, because `markdownFor` branches on the kind and a law that only
      tried a component would be a law about one arm. */
  const SUBJECTS = ["/start/installation", "/components/button", `${PAGES.at(-1)!.path}`];

  const ask = (path: string, accept: string) =>
    middleware(
      new NextRequest(`http://localhost:3000${path}`, { headers: { accept } }),
    );

  it.each(SUBJECTS)("%s", async (path) => {
    const negotiated = ask(path, "text/markdown");
    const rewrite = negotiated.headers.get("x-middleware-rewrite");
    expect(rewrite, `${path} was not rewritten`).not.toBeNull();
    expect(new URL(rewrite!).pathname).toBe(markdownRoute(path));

    // THE SAME HANDLER THE `.md` URL REACHES, driven by the rewrite the middleware just wrote.
    // There is no second renderer to compare against and that is the design: the negotiated
    // response IS the twin's route, so the check is that the middleware aims at it correctly
    // and that what comes back is `markdownFor()` to the byte.
    const slug = new URL(rewrite!).pathname.replace(/^\/md\//, "").split("/");
    const served = await GET(new Request(rewrite!), { params: Promise.resolve({ slug }) });
    const body = await served.text();

    expect(served.status).toBe(200);
    expect(served.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    // Vacuity: an empty twin would satisfy an equality with an empty twin.
    expect(body.length).toBeGreaterThan(200);
    expect(body).toBe(markdownFor(path));
  });

  it("a browser gets the page, with the alternate named", async () => {
    const browsing = ask(
      "/components/button",
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    );
    expect(browsing.headers.get("x-middleware-rewrite")).toBeNull();
    expect(browsing.headers.get("x-middleware-next")).toBe("1");
    expect(browsing.headers.get("Vary")).toBe("Accept");
    expect(browsing.headers.get("Link")).toBe(alternateLink("/components/button"));
  });

  it("the alternate is a relative reference, so no origin is invented", () => {
    // `llms.ts` reads the request's own `Host` rather than naming a site, because this repo
    // states no origin anywhere. A `Link` header carrying one would be the same invention with
    // less to gain: RFC 8288 permits a relative reference and the client resolves it.
    const link = alternateLink("/components/button");
    expect(link).toBe('</components/button.md>; rel="alternate"; type="text/markdown"');
    expect(link).not.toMatch(/https?:/);
  });

  it("both headers are sent whichever way the negotiation goes", () => {
    // `Vary` is the half a cache needs and the half that is easy to send on one branch only:
    // one URL now has two representations, and a proxy that cached the markdown would serve it
    // to the next person with a browser.
    for (const accept of ["text/markdown", "text/html"]) {
      const response = ask("/components/button", accept);
      expect(response.headers.get("Vary"), accept).toBe("Accept");
      expect(response.headers.get("Link"), accept).toBe(alternateLink("/components/button"));
    }
  });
});
