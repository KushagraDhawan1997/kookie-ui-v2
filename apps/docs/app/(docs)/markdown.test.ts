import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { CHAPTERS } from "./chapters";
import { ENTRIES } from "./components/registry";
import { PAGES, markdownFor } from "./markdown";
import { RULES } from "../builder/review";

/**
 * The markdown twin (§47).
 *
 * What these laws are FOR: a twin is read by machines, so nobody looks at it. The site's other
 * surfaces are judged by eye every week and this one never will be — which makes it exactly
 * the shape this repo's audits keep finding, a mechanism whose only reader cannot report a
 * fault. So the laws read the OUTPUT, not the intent.
 */

describe("every page has a twin, and it is the page", () => {
  it("the index is not empty — an empty walk audits nothing", () => {
    expect(PAGES.length).toBeGreaterThan(70);
  });

  it.each(PAGES.map((page) => page.path))("%s", (pagePath) => {
    const body = markdownFor(pagePath);
    expect(body, `${pagePath} has no twin`).toBeTruthy();
    // A DOCUMENT, not a fragment: one `#` heading, first line, and real content under it. The
    // floor is deliberate — a twin that generated its heading and nothing else would satisfy
    // "is truthy" and is the cheapest way for this mechanism to fail silently.
    expect(body!.split("\n")[0]).toMatch(/^# \S/);
    expect(body!.length).toBeGreaterThan(200);
  });

  it("and nothing else does", () => {
    // The site's own non-page routes. A twin for `/components` would be an index of markdown
    // with nothing in it, and `/` is a landing page whose content is its layout.
    for (const route of ["/", "/components", "/blocks", "/matrix", "/preview", "/builder"]) {
      expect(markdownFor(route), `${route} should have no twin`).toBeNull();
    }
    expect(markdownFor("/components/does-not-exist")).toBeNull();
  });
});

/**
 * THE TWIN CARRIES THE PAGE'S WORDS AND NO OTHERS.
 *
 * This is the law for the decision, not for the mechanism (2026-09-06): Mintlify injects its
 * own name into the markdown people copy and was called out publicly for it as prompt
 * injection, which is the right name for it — a document reaching an agent's context may not
 * carry text that is not the document. A chapter's twin is checkable exactly, because its
 * source is a file: the twin must be the heading, then the file, and nothing may be between
 * them or after it.
 */
describe("a chapter's twin is the chapter", () => {
  const root = path.join(process.cwd(), "content");

  it.each(CHAPTERS.map((chapter) => [chapter.slug, chapter] as const))("%s", (_slug, chapter) => {
    const body = markdownFor(`/${chapter.slug}`)!;
    const source = readFileSync(path.join(root, chapter.source), "utf8").trim();

    /* A chapter with no component in it is checkable exactly, and most are: the twin is the
       heading and then the file, byte for byte. That is the strongest form this law can take,
       so it is kept for every chapter that qualifies rather than weakened to fit the two that
       do not. */
    // Outside fences only: a chapter's code samples are full of `<Theme>` and `<Card>`, which
    // are the subject rather than a tag to expand. The same split the law below uses.
    const outsideFences = (text: string) =>
      text
        .split(/^\s*(?:```|~~~).*$/m)
        .filter((_part, index) => index % 2 === 0)
        .join("\n");
    const tags = outsideFences(source).match(/^\s*<[A-Z][^>]*\/>\s*$/gm) ?? [];
    if (tags.length === 0) {
      expect(body).toBe(`# ${chapter.title}\n\n${source}\n`);
      return;
    }

    /* A chapter that renders a component is checked in three parts, which together say the
       same thing: the prose survived, the tag did not, and whatever the component would have
       shown a reader is in the twin as text. */
    for (const line of source.split("\n")) {
      const text = line.trim();
      if (!text || tags.some((tag) => tag.trim() === text)) continue;
      expect(body, `${chapter.slug}: the twin dropped a line of the chapter`).toContain(text);
    }
    expect(outsideFences(body), `${chapter.slug}: a component tag reached the twin`).not.toMatch(
      /^\s*<[A-Z]/m,
    );

    if (source.includes("<ReviewRules />")) expect(body).toContain(RULES[0]!.why);
    for (const [, name] of source.matchAll(/<Example\s+name="([^"]+)"/g)) {
      // The specimen a reader can see, as the source a reader can read.
      const file = readFileSync(
        path.join(process.cwd(), "examples", `${name}.tsx`),
        "utf8",
      ).trim();
      expect(body, `${chapter.slug}: the twin does not carry ${name}'s source`).toContain(file);
    }
  });

  it("and no twin contains an unexpanded component", () => {
    // The rule that keeps `<ReviewRules />` ONE case rather than the first of many: a chapter
    // that starts using MDX elements would publish markdown with markup in it, and this fails
    // the day it does rather than the day someone reads the output.
    for (const chapter of CHAPTERS) {
      const body = markdownFor(`/${chapter.slug}`)!;
      const outsideFences = body
        .split(/^\s*(?:```|~~~).*$/m)
        .filter((_part, index) => index % 2 === 0)
        .join("\n");
      expect(outsideFences, chapter.slug).not.toMatch(/^\s*<[A-Z]/m);
    }
  });
});

/**
 * THE ORDER IS THE DECISION (2026-09-06, Kushagra: "why refusals first?").
 *
 * A model reads a document from the top and fails one way — by reaching for a prop we do not
 * have, because `variant`, `margin` and a shadow prop all exist in the systems it has read
 * most of. So the boundary comes before the surface. It does NOT come first: a refusal means
 * nothing until you know what the component is, which is what the second assertion holds.
 */
describe("a component's twin states what it refuses before what it takes", () => {
  it.each(ENTRIES.map((entry) => [entry.slug, entry] as const))("%s", (_slug, entry) => {
    const body = markdownFor(`/components/${entry.slug}`)!;
    const refusals = body.indexOf("## What it refuses, and why");
    const props = Math.max(body.indexOf("## Props"), body.indexOf("## Topics"));
    const overview = body.indexOf("## Overview");
    expect(refusals).toBeGreaterThan(-1);
    expect(props).toBeGreaterThan(-1);
    expect(refusals).toBeLessThan(props);
    expect(overview).toBeLessThan(refusals);
    // Every refusal is present with its reason. A section heading with an empty list under it
    // would pass an ordering law and lose the whole argument.
    for (const refusal of entry.refusals) expect(body).toContain(refusal.why);
  });
});

/**
 * THE PIPES ARE ESCAPED, and the first law is what makes the second one mean anything.
 *
 * A twin whose component happens to declare no spelled-out union satisfies the row check with
 * the escaping deleted, which would make this fifty-five laws about the case that cannot fail.
 * Twelve components carry one today; the guard asserts the walk still finds them, so the day
 * the API stops spelling unions this stops claiming to have checked something.
 */
describe("the props tables survive union types", () => {
  it("the walk finds unions — otherwise it proves nothing", () => {
    const unions = ENTRIES.filter((entry) => markdownFor(`/components/${entry.slug}`)!.includes("\\|"));
    expect(unions.length).toBeGreaterThanOrEqual(10);
  });

  it.each(ENTRIES.map((entry) => [entry.slug, entry] as const))("%s", (_slug, entry) => {
    const body = markdownFor(`/components/${entry.slug}`)!;
    for (const line of body.split("\n")) {
      if (!line.startsWith("| ") || line.startsWith("| ---")) continue;
      // A GFM row is three cells: four unescaped delimiters. Anything else is a type that has
      // eaten a column, which renders as a table with the description in the wrong place.
      const delimiters = line.replace(/\\\|/g, "").match(/\|/g)?.length ?? 0;
      expect(delimiters, `${entry.slug}: ${line}`).toBe(4);
    }
  });
});

/**
 * A COMPONENT'S TWIN CARRIES ITS EXAMPLE, and the example is the file the page renders.
 *
 * The site's founding rule for examples is that one file cannot disagree with itself. A twin
 * that restated a snippet would be a third home; this reads the same file, and this law is
 * what says so.
 */
describe("the examples are the example files", () => {
  const root = path.join(process.cwd(), "examples");

  it.each(ENTRIES.map((entry) => [entry.slug, entry] as const))("%s", (_slug, entry) => {
    const body = markdownFor(`/components/${entry.slug}`)!;
    expect(body).toContain(readFileSync(path.join(root, `${entry.slug}.tsx`), "utf8").trim());
    for (const variant of entry.variants ?? []) {
      expect(body).toContain(
        readFileSync(path.join(root, `${entry.slug}.${variant.name}.tsx`), "utf8").trim(),
      );
    }
  });
});

/**
 * TWO WAYS A TWIN GOES QUIETLY WRONG, both found by reading the served output rather than by
 * any law that existed at the time (2026-09-06).
 *
 * Neither has a visible symptom on this site — a markdown document's only readers are machines,
 * so a fence that opens with a blank line and a sentence with a word missing from it both ship
 * looking exactly like a document that is fine.
 */
describe("the markdown is well formed", () => {
  const twins = PAGES.map((page) => [page.path, markdownFor(page.path)!] as const);

  it.each(twins)("%s opens no fence onto a blank line", (_path, body) => {
    // WALKED, not matched. The obvious regex — a fence line followed by a blank one — reads a
    // CLOSING fence with an ordinary paragraph break after it as the fault, which is every
    // page on the site. Only the opening one is the subject, and telling them apart means
    // counting.
    const lines = body.split("\n");
    let open = false;
    lines.forEach((line, index) => {
      if (!/^\s*(?:```|~~~)/.test(line)) return;
      open = !open;
      if (open) expect((lines[index + 1] ?? "").trim(), `line ${index + 1}`).not.toBe("");
    });
    expect(open, "unbalanced fences").toBe(false);
  });

  it.each(twins)("%s states no bare tag where prose is meant", (_path, body) => {
    // `<Box m>` and `<nav>` are identifiers being MENTIONED, and a markdown reader treats them
    // as raw HTML: the words disappear from the sentence. The registry's own prose carried
    // fifteen of them, every one of which was already rendering as unstyled text on the HTML
    // page — so the fix was backticks at the source and this is what holds them there.
    const prose = body
      .split(/^\s*(?:```|~~~).*$/m)
      .filter((_part, index) => index % 2 === 0)
      .join("\n")
      .split("`")
      .filter((_part, index) => index % 2 === 0)
      .join(" ");
    // Anything that looks like an element: a name, then attributes or a close, then `>`.
    expect(prose.match(/<\/?[A-Za-z][A-Za-z0-9]*(?:\s[^<>]*)?\/?>/g) ?? []).toEqual([]);
  });
});
