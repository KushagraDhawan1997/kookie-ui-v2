/**
 * The five rules every component inherits have ONE home (2026-09-07).
 *
 * They did not. `markdown.ts` exported them under a comment saying so, and the reference page
 * carried the same five sentences as an inline array eleven lines long — the twin and the page
 * agreeing today and free to part company on any edit, which is the failure this repo has
 * recorded more times than any other. Nothing could have caught it: both readers were correct,
 * and correctness is exactly what a second copy looks like on the day it is written.
 *
 * TWO LAWS, because the two ways it can come back are different. The page can stop reading the
 * export — caught by rendering it. Or a THIRD reader can appear with its own copy — caught by
 * scanning the tree for the sentences themselves, which is the check that has no other way to
 * exist.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { EVERYWHERE } from "../../markdown";

/* The page places `<Example>`, which is an async server component, and
   `renderToStaticMarkup` cannot mount one. Everything else on the page is awaited by the page
   itself, so stubbing this one element is what makes the whole tree renderable here — and the
   specimen is not the subject: it has its own laws in `example-frame.test.tsx`. */
vi.mock("../../example", () => ({ Example: () => null }));

const { default: ComponentPage } = await import("./page");

const docsRoot = fileURLToPath(new URL("../../../..", import.meta.url));

/** Every list item the page renders, in order. */
const listItems = (markup: string): string[] =>
  [...markup.matchAll(/<li[^>]*>([^<]*)<\/li>/g)].map((match) => match[1]!);

describe("the page renders the rules from their one home", () => {
  it("the rendered list IS `EVERYWHERE`", async () => {
    // A REAL RENDER of a real page, not a read of its source: a page that imported the export
    // and then mapped over something else would pass a source scan and ship the wrong list.
    const markup = renderToStaticMarkup(
      await ComponentPage({ params: Promise.resolve({ slug: "button" }) }),
    );

    // Vacuity: the render has to have produced the section at all. A page that threw and was
    // caught, or a heading that moved, would otherwise leave the filter below empty and the
    // subset check trivially true.
    expect(markup).toContain("Every component in the system does.");

    const items = listItems(markup);
    expect(
      items.length,
      "the page rendered fewer plain list items than there are rules",
    ).toBeGreaterThanOrEqual(EVERYWHERE.length);

    // The five appear together and in order, which is what makes this a check on the ARRAY
    // rather than on five separate sentences: a page keeping its own copy with one word
    // changed, or the same five shuffled, fails here.
    const start = items.indexOf(EVERYWHERE[0]!);
    expect(start, "the first rule is not on the page").toBeGreaterThanOrEqual(0);
    expect(items.slice(start, start + EVERYWHERE.length)).toEqual(EVERYWHERE);
  }, 60_000);
});

describe("nothing else in the tree writes these sentences down", () => {
  /**
   * Every source file this site is built from.
   *
   * CODE, NOT PROSE. A `.mdx` chapter and `content/AUTHORING.md` both state the system's rules
   * in the system's own words, and one of AUTHORING's — "CSS resolves every state. No
   * JavaScript runs on hover, press or focus." — is verbatim one of these five. That is not a
   * second home for this array: it is a different list, for chapter authors, that shares one
   * sentence with it. Forbidding a documentation site from writing down the rule it documents
   * would be a law about the wrong thing. What this forbids is a second RENDERER with its own
   * copy, which is the defect it was written for.
   */
  const sources = (dir: string, found: string[] = []): string[] => {
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) sources(full, found);
      else if (/\.(ts|tsx)$/.test(name)) found.push(full);
    }
    return found;
  };

  it("only `markdown.ts` contains them", () => {
    const files = sources(docsRoot);
    // Vacuity: a walk that found nothing would report no second home very confidently.
    expect(files.length).toBeGreaterThan(50);
    expect(files.some((file) => file.endsWith("markdown.ts"))).toBe(true);

    const offenders: string[] = [];
    for (const file of files) {
      if (file.endsWith(join("(docs)", "markdown.ts"))) continue;
      const text = readFileSync(file, "utf8");
      for (const line of EVERYWHERE) {
        if (text.includes(line)) offenders.push(`${file.slice(docsRoot.length)}: "${line}"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
