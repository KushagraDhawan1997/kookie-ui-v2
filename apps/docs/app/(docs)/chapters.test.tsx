/**
 * The canon's laws (2026-08-21).
 *
 * A new surface owes a place for its laws before it owes anything else (the 2026-08-06 rule,
 * earned when apps/docs shipped two crash-the-site defects through a green CI because it had
 * no harness). This file was written before the chapters were, and it is the reason the
 * chapters can be trusted to say what the system does.
 *
 * The failure these guard against is specific and it is this project's oldest: DOC–CODE
 * DRIFT. A documentation site is the easiest place in a repo for a sentence to quietly stop
 * being true, because prose has no compiler. What can be checked mechanically is checked
 * here — that every chapter exists, renders, cites a real section of the spec, labels its
 * code, and does not reach for private API — and what cannot (whether the sentence is *right*)
 * is left to review, honestly, rather than dressed up in a law that passes on anything.
 *
 * Two things are deliberately NOT asserted, with reasons, because an unfalsifiable law is
 * worse than an absent one:
 *
 * - **Prose quality.** No word counts, no readability scores. A law that greps for "simply"
 *   would pass on a chapter that says nothing at all.
 * - **That a chapter's claims match the code.** No mechanism can read "rank actions with
 *   emphasis" and check it. What IS checked is the citation: every chapter names the spec
 *   sections it publishes, and every one of those resolves to a real heading — so a chapter
 *   about a decision that was never specified fails, which is the checkable half.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CHAPTERS, READING_ORDER, SECTIONS, type Chapter } from "./chapters";
import { LANGS, isLang, parseMeta, tokenize } from "../../blocks/highlight";
import { tableOfContents } from "./toc";
import { useMDXComponents } from "../../mdx-components";

const here = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(here, "../../../..");
const contentRoot = join(here, "../../content");

const read = (path: string) => readFileSync(path, "utf8");

/** Every `.mdx` under `content/`, as registry-relative paths. The reverse direction of
    coverage needs this: a file nobody registered is a chapter nobody can reach. */
function everyContentFile(dir = contentRoot, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return everyContentFile(join(dir, entry.name), rel);
    return entry.name.endsWith(".mdx") ? [rel] : [];
  });
}

const sourceOf = (chapter: Chapter) => read(join(contentRoot, chapter.source));

/* ── Coverage, both directions ─────────────────────────────────────────────────────────── */

describe("the registry and the content directory describe the same set", () => {
  it("found chapters at all — an empty registry audits nothing", () => {
    // The vacuity guard. Every law below loops the registry, so an empty one turns this whole
    // file green — the shape that made `docs:test` a cache hit in 2026-08-08 and starved the
    // browser project in 2026-08-20. "Did not run" is this repo's favourite way of not
    // failing, and a loop over nothing is the smallest version of it.
    expect(CHAPTERS.length).toBeGreaterThanOrEqual(10);
    expect(everyContentFile().length).toBeGreaterThanOrEqual(10);
  });

  it("every registered chapter has a file", () => {
    const missing = CHAPTERS.filter((chapter) => !everyContentFile().includes(chapter.source));
    expect(missing.map((chapter) => chapter.slug)).toEqual([]);
  });

  it("every file is registered", () => {
    // A chapter written and never wired reaches no navigation, no route and no reader. It is
    // the more likely direction of the two: writing is the work, and registering is the step
    // that gets forgotten.
    const registered = new Set(CHAPTERS.map((chapter) => chapter.source));
    expect(everyContentFile().filter((file) => !registered.has(file))).toEqual([]);
  });

  it("slugs are unique, and say where their file lives", () => {
    const slugs = CHAPTERS.map((chapter) => chapter.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const chapter of CHAPTERS) {
      // `<section>/<name>` — the URL states the section, so a chapter filed under a section
      // it does not belong to is a broken breadcrumb rather than a cosmetic mismatch.
      expect(chapter.slug.split("/")[0], `${chapter.slug} is filed under ${chapter.section}`).toBe(
        chapter.section,
      );
      expect(chapter.source).toBe(`${chapter.slug}.mdx`);
      expect(SECTIONS.map((section) => section.id)).toContain(chapter.section);
    }
  });

  it("reading order holds every chapter exactly once", () => {
    // previous/next walks this, so a chapter missing from it is unreachable by reading
    // straight through — the way most people meet a document like this for the first time.
    expect([...READING_ORDER].map((chapter) => chapter.slug).sort()).toEqual(
      CHAPTERS.map((chapter) => chapter.slug).sort(),
    );
  });
});

/* ── Anti-stub: the cheapest way to satisfy a coverage law is an entry that says nothing ─── */

describe("no entry is a placeholder", () => {
  /**
   * The floor under a blurb, and it is deliberately only the floor.
   *
   * A blurb is the deck under a chapter's title and the line under it in the site index, so it
   * is the most-read prose here — and until 2026-08-25 the law here claimed to check it was "a
   * real sentence" while testing two things that are not sentencehood: that it ran past 40
   * characters and that it ended in a full stop. Sixteen of twenty-five blurbs were headline
   * fragments and every one passed. "The house style. One loud control, different gaps for
   * different groups, a type ladder, and tone used as a vocabulary." is 116 characters, ends in
   * a full stop, and cannot be parsed by a reader.
   *
   * WHAT THIS CHECKS IS ONE DIRECTION ONLY: an opener with no verb anywhere in it is certainly
   * a fragment, because every English sentence has one. That catches "Two clocks.", "The house
   * style." and "An index, not a measurement."
   *
   * WHAT IT CANNOT CHECK — stated because a law nobody knows the limits of gets trusted past
   * them — is a fragment whose verb sits in a subordinate clause. "The package, one stylesheet,
   * a Theme at the root, and the script that sets dark mode before the first paint." is a noun
   * phrase, and `sets` belongs to `that sets …`. Telling a main clause from an embedded one
   * needs a parser, not a regex, and a part-of-speech dependency is not worth it for twenty-five
   * strings. That half of the rule lives in `content/AUTHORING.md`, where a person applies it.
   * Falsified against the pre-2026-08-25 blurbs: this catches eight of the sixteen, and the
   * eight it misses are the reason the prose rule exists.
   *
   * The verb list is a plain enumeration so that widening it is one obvious line. It was widened
   * on its first run, by a real sentence it called a fragment ("This system sorts components
   * before it styles them"), which is the cost of the approach and is preferable to the
   * alternative: a check that passes on everything.
   */
  const FINITE_VERBS = new Set(
    `is are was were be been being has have had does do did can could may might must shall will
     should would sets set holds hold takes take uses use gives give makes make means mean
     shows show tells tell resolves resolve states state carries carry names name opens open
     closes close reads read writes write runs run lets let keeps keep puts put wears wear
     needs need wants want announces announce chooses choose picks pick sits sit stands stand
     lands land follows follow shares share covers cover adapts adapt comes come goes go
     turns turn switches switch works work applies apply belongs belong appears appear
     renders render paints paint draws draw fills fill scrolls scroll submits submit
     supplies supply controls control decides decide learns learn gets get sees see
     grows grow stops stop starts start ships ship adds add removes remove wraps wrap
     sorts sort styles style explains explain buys buy matters matter happens happen
     install build write add set use learn read pick choose decide see get`.split(/\s+/),
  );

  /** The first sentence, which is where a fragment announces itself. */
  const opener = (blurb: string) => blurb.split(/(?<=[.!?])\s/)[0] ?? blurb;

  it("no blurb opens with a verbless fragment", () => {
    for (const chapter of CHAPTERS) {
      const first = opener(chapter.blurb);
      const words = first.toLowerCase().match(/[a-z']+/g) ?? [];
      expect(
        words.some((w) => FINITE_VERBS.has(w)),
        `${chapter.slug}: the blurb opens with a fragment — "${first}"`,
      ).toBe(true);
    }
  });

  it("every blurb is finished prose", () => {
    for (const chapter of CHAPTERS) {
      expect(chapter.blurb.length, `${chapter.slug} blurb`).toBeGreaterThan(40);
      expect(chapter.blurb.trim().endsWith("."), `${chapter.slug} blurb ends mid-thought`).toBe(
        true,
      );
    }
  });

  it("every chapter has content", () => {
    for (const chapter of CHAPTERS) {
      expect(sourceOf(chapter).trim().length, `${chapter.slug}`).toBeGreaterThan(600);
    }
  });

  it("every chapter cites the spec it publishes", () => {
    for (const chapter of CHAPTERS) {
      expect(chapter.spec.length, `${chapter.slug} cites nothing`).toBeGreaterThan(0);
    }
  });
});

/* ── The citations are real ────────────────────────────────────────────────────────────── */

/**
 * Heading numbers actually present in each governance document. Read rather than listed: a
 * hand-kept list of section numbers is a second home for a fact the document already owns,
 * and it would go stale in exactly the direction that matters (a renumbered spec).
 */
function sectionsIn(doc: string): Set<string> {
  const text = read(join(repoRoot, "docs", doc));
  return new Set([...text.matchAll(/^#{1,3}\s+(\d+)(?:\.\d+)?\.?\s/gm)].map((m) => m[1]!));
}

describe("every spec reference resolves to a real section", () => {
  const documents: Record<string, Set<string>> = {
    DECISIONS: sectionsIn("DECISIONS.md"),
    THESIS: sectionsIn("THESIS.md"),
    ENGINEERING: sectionsIn("ENGINEERING.md"),
  };

  it("the documents parsed — an empty section set would accept anything", () => {
    for (const [name, sections] of Object.entries(documents)) {
      expect(sections.size, `${name} parsed no sections`).toBeGreaterThan(3);
    }
  });

  it("resolves each citation", () => {
    // A bare `§N` means DECISIONS.md, which is the spec; anything else names its document.
    // This is the load-bearing law of the file: the site's whole claim is that these pages
    // re-voice a canon that governs the code, and a citation pointing nowhere is that claim
    // failing quietly.
    for (const chapter of CHAPTERS) {
      for (const reference of chapter.spec) {
        const match = /^(?:(THESIS|ENGINEERING|DECISIONS)\s+)?§(\d+)$/.exec(reference.trim());
        expect(match, `${chapter.slug} cites "${reference}", which is not a section reference`)
          .not.toBeNull();
        const [, doc = "DECISIONS", number] = match!;
        expect(
          documents[doc]!.has(number!),
          `${chapter.slug} cites ${doc} §${number}, which does not exist`,
        ).toBe(true);
      }
    }
  });
});

/* ── The shape of a chapter ────────────────────────────────────────────────────────────── */

describe("every chapter is written to the house rules", () => {
  /** Heading lines outside fenced code. Fences are tracked because this system's docs are
      largely about CSS, where a comment beginning `#` is ordinary. */
  function headingLines(markdown: string): string[] {
    const out: string[] = [];
    let inFence = false;
    for (const line of markdown.split("\n")) {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      else if (!inFence && /^#{1,6}\s/.test(line)) out.push(line);
    }
    return out;
  }

  it("no chapter opens an h1 — the page title is the registry's", () => {
    for (const chapter of CHAPTERS) {
      const h1 = headingLines(sourceOf(chapter)).filter((line) => /^#\s/.test(line));
      expect(h1, `${chapter.slug} declares its own h1`).toEqual([]);
    }
  });

  it("no chapter goes deeper than h3", () => {
    // The table of contents reads `##` and `###`. A page that needs `####` is two pages, and
    // the deeper heading would be invisible in the navigation rather than merely small.
    for (const chapter of CHAPTERS) {
      const deep = headingLines(sourceOf(chapter)).filter((line) => /^#{4,6}\s/.test(line));
      expect(deep, `${chapter.slug} goes past h3`).toEqual([]);
    }
  });

  it("no two headings on a page share an anchor", () => {
    // `slugify` has no de-duplicating counter, deliberately: a generated `-1` suffix hides a
    // writing problem and makes every link order-dependent. So the collision is a failure
    // here instead — where it names the chapter and the heading.
    for (const chapter of CHAPTERS) {
      const ids = tableOfContents(sourceOf(chapter)).map((entry) => entry.id);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      expect(duplicates, `${chapter.slug} has colliding anchors`).toEqual([]);
    }
  });

  it("every heading produces a usable anchor", () => {
    // A heading of nothing but punctuation slugifies to "", which is a link to the top of the
    // page wearing a section's name.
    //
    // CHANGES 2026-08-26: the second assertion here was `entry.id === slugify(entry.title)`,
    // which is what `tableOfContents` builds the entry FROM — it compared slugify(title) with
    // slugify(title) and could not fail. The guarantee it was reaching for is asserted below,
    // against the rendered headings, which is the only place the two implementations can
    // actually disagree.
    for (const chapter of CHAPTERS) {
      for (const entry of tableOfContents(sourceOf(chapter))) {
        expect(entry.id, `${chapter.slug}: "${entry.title}" has no anchor`).not.toBe("");
      }
    }
  });

  it("no chapter reaches for private API", () => {
    // `--kui-*` is the private mechanism namespace (ENGINEERING §3): undocumented, unstable,
    // never for consumers. A chapter naming one teaches a reader to depend on something the
    // system reserves the right to rename in a patch — and this repo renames them (the
    // `--kui-h` stem collision, the `--kui-fly-*` collapse).
    for (const chapter of CHAPTERS) {
      const found = [...sourceOf(chapter).matchAll(/--kui-[a-z-]+/g)].map((m) => m[0]);
      expect(found, `${chapter.slug} names private tokens`).toEqual([]);
    }
  });

  it("no chapter teaches an axis the system deleted", () => {
    // `variant` was deleted (§9) and `bold` refused (§15). Both are the sort of word that
    // arrives in prose by muscle memory, from every other design system a writer has used,
    // and a chapter that uses one teaches the opposite of the argument it sits inside.
    for (const chapter of CHAPTERS) {
      const source = sourceOf(chapter);
      expect([...source.matchAll(/\bvariant=/g)].map((m) => m[0]), `${chapter.slug}`).toEqual([]);
      expect([...source.matchAll(/weight="bold"/g)].map((m) => m[0]), `${chapter.slug}`).toEqual(
        [],
      );
    }
  });
});

/* ── Every token a chapter names is a token that exists ────────────────────────────────── */

describe("the public tokens the chapters name are real", () => {
  /**
   * The most dangerous thing a chapter can do is name a token that does not exist. It looks
   * exactly like a token that does, it type-checks nowhere, and a reader who copies it gets a
   * CSS declaration that silently resolves to nothing — the failure mode the generator's own
   * dangling-var law was written for, arriving from the documentation side instead.
   *
   * Reading `tokens.css` rather than a list, for the reason every law in this repo reads its
   * source: a hand-kept vocabulary would be a second home for a fact the generator owns, and
   * it would go stale in the direction that matters (a renamed token).
   */
  const emitted = new Set(
    [...read(join(repoRoot, "packages/ui/src/tokens/tokens.css")).matchAll(/^\s*(--[a-z0-9-]+):/gm)].map(
      (m) => m[1]!,
    ),
  );

  /**
   * Chapters legitimately write LADDER names — `--space-N`, `--radius-control-N` — because
   * that is how the spec itself refers to a scale, and writing out twelve steps in prose
   * would be worse. A generic name is resolved by substituting a real rung; `--{tone}-ink` and
   * similar placeholders are resolved by substituting a real family.
   */
  const resolve = (name: string): string[] => {
    // `--space-N`, and the bare `--space-` a prose sentence sometimes leaves when the rung is
    // written outside the code font. Both mean "this ladder", so both resolve by substituting
    // real rungs — two of them, because a ladder that only has a step 1 is not a ladder.
    const stem = name.endsWith("-N") ? name.slice(0, -1) : name.endsWith("-") ? name : null;
    if (stem) return [`${stem}1`, `${stem}2`];
    return [name];
  };

  it("the token file parsed — an empty vocabulary accepts every name", () => {
    expect(emitted.size).toBeGreaterThan(200);
    expect(emitted.has("--color-text")).toBe(true);
    expect(emitted.has("--space-4")).toBe(true);
  });

  it("every one resolves", () => {
    const unknown: string[] = [];
    for (const chapter of CHAPTERS) {
      const source = sourceOf(chapter);
      for (const match of source.matchAll(/--[a-z][a-z0-9-]*/g)) {
        const name = match[0];
        // Placeholders the prose uses to mean "any family" / "any rung". They are explained
        // where they appear and are not claims about a specific token.
        if (/^--\{/.test(name)) continue;
        // The private namespace has its own law above (a chapter may not name one at all), so
        // skipping here keeps the two failures from being reported as one.
        if (name.startsWith("--kui-")) continue;
        // `--font-body` and friends are consumer-SET, not emitted: the type layer reads them
        // and the app supplies the faces. A chapter naming one is telling the truth.
        if (["--font-body", "--font-heading", "--font-mono"].includes(name)) continue;
        // The docs' own code-theme variables, defined in prose.css and named in the colour
        // chapter's explanation of it.
        if (name.startsWith("--kd-")) continue;
        const candidates = resolve(name);
        if (!candidates.some((candidate) => emitted.has(candidate))) {
          unknown.push(`${chapter.slug}: ${name}`);
        }
      }
    }
    expect(unknown).toEqual([]);
  });
});

/* ── The code in the chapters ──────────────────────────────────────────────────────────── */

/** Every fenced block, with the language it declared. */
function fences(markdown: string): { lang: string; meta: string; code: string }[] {
  // The info string is a language and then a meta string (```json title="package.json").
  // The first spelling required the newline right after the language, so a fence WITH meta
  // silently vanished from the walk — and the scan then took its closing ``` as an opener.
  return [...markdown.matchAll(/^```([a-z]*)([^\n]*)\n([\s\S]*?)^```/gm)].map((m) => ({
    lang: m[1]!,
    meta: m[2]!.trim(),
    code: m[3]!,
  }));
}

describe("every code fence is real code in a language we ship", () => {
  it("found fences at all", () => {
    // Vacuity again, and it bites differently here: the house rules require every chapter to
    // show its rule in real code, so a canon with no fences in it has stopped being a manual.
    const total = CHAPTERS.reduce((sum, chapter) => sum + fences(sourceOf(chapter)).length, 0);
    expect(total).toBeGreaterThanOrEqual(CHAPTERS.length);
  });

  it("labels every fence with a supported language", () => {
    // An unlabelled fence tokenizes as plain text, which renders exactly like a fence nobody
    // got round to labelling — a silent downgrade rather than an error.
    for (const chapter of CHAPTERS) {
      for (const fence of fences(sourceOf(chapter))) {
        expect(fence.lang, `${chapter.slug}: unlabelled fence`).not.toBe("");
        expect(
          isLang(fence.lang),
          `${chapter.slug}: "${fence.lang}" is not in LANGS (${LANGS.join(", ")})`,
        ).toBe(true);
      }
    }
  });

  it("tokenizes every fence", async () => {
    // The fences are checked HERE rather than by rendering the chapter, and that is the
    // stronger arrangement: CodeSample is an async server component, which no non-RSC renderer
    // will mount, and a law that stubbed it out would assert nothing about the code samples
    // at all. Running the real tokenizer over every fence individually names the chapter and
    // the language when one fails.
    for (const chapter of CHAPTERS) {
      for (const fence of fences(sourceOf(chapter))) {
        if (!isLang(fence.lang)) continue;
        // The meta rides through exactly as the fence renderer sends it — the chrome facts
        // parsed away, Shiki's own directives kept — so a bad directive fails the build here
        // with the chapter's name on it.
        const { rest } = parseMeta(fence.meta);
        const { lines } = await tokenize(fence.code, fence.lang, rest || undefined);
        expect(lines.length, `${chapter.slug}: an empty fence`).toBeGreaterThan(0);
      }
    }
  }, 60_000);
});

/**
 * The real component map, with ONE substitution: `pre`. `CodeSample` is async — it awaits the
 * tokenizer — and `renderToStaticMarkup` cannot mount an async component, so the fence is
 * stood in for by a synchronous element that keeps the code visible in the output. Nothing
 * else is stubbed: the headings, paragraphs, lists, links, quotes, tables and inline code that
 * a chapter is otherwise made of are the components the site ships, so a chapter that misuses
 * one fails here.
 *
 * The fences themselves are covered by the tokenize law above. Splitting it this way is the
 * "an excluded law owes CI whatever half of it is static" clause (ENGINEERING §6): what a
 * renderer cannot reach is asserted directly instead of skipped.
 */
const components = useMDXComponents({
  pre: ({ children }: { children?: React.ReactNode }) => <pre>{children}</pre>,
});

const renderChapter = (chapter: Chapter) =>
  renderToStaticMarkup(<chapter.Content components={components} />);

/* ── The page scroller's overflow guard is wired to something ──────────────────────────── */

describe("the narrow-window overflow guard is still connected", () => {
  /**
   * A CSS rule and the class it targets are two halves of one mechanism, and this pair broke a
   * real page: at a 700px window every code-heavy chapter ran off the right edge, because Base
   * UI's ScrollArea puts `min-width: fit-content` on its content wrapper and a fenced block's
   * refusal to shrink propagates out through every ancestor to the page.
   *
   * WHAT THIS LAW IS, HONESTLY. It reads source, which this repo rates below reading a
   * computed value — and rightly, since a rule present in a stylesheet still has to WIN. It
   * cannot see 685 against 784; only a browser can, and the docs app has no browser project.
   * What it CAN see is the failure that actually happens to a pair like this: one half gets
   * renamed or deleted and the other is left pointing at nothing. That is worth catching, and
   * saying plainly what it does not catch is worth more than a law that implies otherwise.
   */
  it("the rule and its class both exist, and name each other", () => {
    const css = read(join(here, "prose.css"));
    const chrome = read(join(here, "docs-chrome.tsx"));
    expect(css).toContain(".kd-scroll > * > .kui-scroll-content");
    expect(css).toMatch(/min-inline-size:\s*0\s*!important/);
    // The class has to be on the CONTENT pane's scroller specifically. Putting it on the
    // sidebar's would neutralise the wrong scroller and leave the page overflowing exactly as
    // before, with the rule sitting there looking applied.
    expect(chrome).toMatch(/<ShellScroll className="kd-scroll"[^>]*>/);
  });
});

/* ── The two compilers are one compiler ────────────────────────────────────────────────── */

describe("the site and the suite compile MDX the same way", () => {
  // "A mechanism with two implementations owes a law that they AGREE" (the 2026-08-06 clause,
  // earned when the docs app shipped two crash-the-site defects). MDX is configured twice
  // here — `next.config.ts` for what ships, `vitest.config.ts` for what the laws mount — and a
  // plugin in one but not the other makes every law below an assertion about a pipeline
  // nobody serves. The divergence is silent in the worst direction: a chapter's table would
  // render in the suite and reach a reader as a row of pipes.
  const configText = (file: string) => read(join(here, "../..", file));

  /**
   * The plugin LIST, not the file's word count (repaired 2026-08-26).
   *
   * This law used to count every `remark…` token over the whole of each file, which counts
   * doc-comment prose and import specifiers alongside the entries that reach the compiler.
   * The two files scored 7 each while configuring two plugins each, so the equality held by
   * coincidence and it was wrong in both directions: deleting a sentence from a comment failed
   * CI for everyone, and adding a third plugin to one file passed as long as the other file's
   * prose happened to mention `remark` once more.
   *
   * So: take the `remarkPlugins: [...]` array by balancing brackets, strip comments, and
   * reduce each entry to a canonical name. The two files spell their plugins differently on
   * purpose — Turbopack needs JSON-serializable strings, the suite imports the modules — so
   * `remark-gfm` and `remarkGfm` have to compare equal, which is what the lowercasing and the
   * hyphen strip are for.
   */
  const remarkPlugins = (source: string): string[] => {
    const at = source.indexOf("remarkPlugins:");
    expect(at, "no remarkPlugins array in this config").toBeGreaterThan(-1);
    const open = source.indexOf("[", at);
    let depth = 0;
    let end = open;
    for (let i = open; i < source.length; i++) {
      if (source[i] === "[") depth++;
      else if (source[i] === "]" && --depth === 0) {
        end = i;
        break;
      }
    }
    const body = source
      .slice(open + 1, end)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "");
    return [...body.matchAll(/remark[A-Za-z-]*/g)]
      .map((m) => m[0]!.toLowerCase().replace(/-/g, ""))
      .sort();
  };

  it("both name the same remark plugins", () => {
    const next = remarkPlugins(configText("next.config.ts"));
    const suite = remarkPlugins(configText("vitest.config.ts"));
    // The vacuity guard: an extractor that found nothing would make the equality below true of
    // two empty lists, which is the shape a bracket-balancing parser fails in.
    expect(next.length).toBeGreaterThanOrEqual(2);
    expect(next).toContain("remarkgfm");
    // Neither may quietly grow one the other lacks, and neither may drop one.
    expect(suite).toEqual(next);
  });

  it("a markdown table becomes a real table", () => {
    // The computed half, and the one that actually caught this: GFM is what turns `| a | b |`
    // into a table, and without it the pipes compile to text. Asserted on rendered output
    // rather than on the config, because the config is what was already believed to be right.
    const withTable = CHAPTERS.find((chapter) => /^\|.+\|$/m.test(sourceOf(chapter)));
    expect(withTable, "no chapter contains a markdown table to check").toBeDefined();
    const html = renderChapter(withTable!);
    expect(html).toContain("<table");
    expect(html).not.toContain("|---");
  });
});

/* ── The chapters render ───────────────────────────────────────────────────────────────── */

describe("every chapter renders", () => {
  for (const chapter of CHAPTERS) {
    it(`${chapter.slug}`, () => {
      const html = renderChapter(chapter);
      // A floor rather than a match: the claim is that the chapter mounted and produced its
      // prose, not that it produced any particular string. Chapters are ~400-900 words, so a
      // few hundred characters of markup means something rendered but the body did not.
      expect(html.length, `${chapter.slug} rendered almost nothing`).toBeGreaterThan(1200);
      expect(html).toContain("kui-text");
    });
  }
});

/* ── The table of contents and the page it indexes ─────────────────────────────────────── */

describe("every table-of-contents link lands on a heading that exists", () => {
  /**
   * The two-implementations law for anchors (2026-08-26). `slug.ts` states the guarantee —
   * the table of contents is built from a chapter's SOURCE and the anchors are written from
   * the RENDERED node, so both call one `slugify` and "a link that scrolls nowhere becomes
   * impossible rather than unlikely". Nothing asserted it. What stood here instead was
   * `entry.id === slugify(entry.title)`, and `tableOfContents` builds the entry as
   * `{ id: slugify(title) }` — the two sides of that equality are the same expression.
   *
   * The sides that CAN disagree are the source scan and the rendered markup, and they
   * disagree over exactly what the scan strips: inline marks are removed from the title by
   * one regex there and resolved into components here, so a heading carrying a link, a
   * `<Code>` span or an entity produces two different anchors and the navigation scrolls
   * nowhere. Read off the emitted `id=` attributes, in document order.
   */
  const renderedAnchors = (chapter: Chapter): string[] =>
    [...renderChapter(chapter).matchAll(/<h([23])[^>]*\bid="([^"]*)"/g)].map((m) => m[2]!);

  it("both sides found something", () => {
    // A chapter with no `##` at all would make every loop below vacuous.
    const total = CHAPTERS.reduce((n, c) => n + tableOfContents(sourceOf(c)).length, 0);
    expect(total).toBeGreaterThanOrEqual(CHAPTERS.length);
    expect(renderedAnchors(CHAPTERS[0]!).length).toBeGreaterThan(0);
  });

  for (const chapter of CHAPTERS) {
    it(`${chapter.slug}`, () => {
      expect(renderedAnchors(chapter)).toEqual(tableOfContents(sourceOf(chapter)).map((e) => e.id));
    });
  }
});

/* ── A chapter does not teach behaviour the package does not have ──────────────────────── */

describe("a chapter's claim about the code is checked against the code", () => {
  /**
   * DOC–CODE DRIFT, made mechanical where it can be (2026-08-26). The header above says
   * plainly that this file does NOT check whether a chapter's claims match the code, and that
   * honesty was right about the general case and too pessimistic about a few particular ones.
   * An audit found three sentences teaching behaviour the package does not ship: a sidebar
   * turning into a bottom bar and hover-reveals becoming permanent (neither exists — a narrow
   * sidebar leaves flow and waits to be summoned), a `Dialog` whose size "never sets the type
   * inside" (its title and description take the index, closed 2026-08-21), and a test in the
   * list of what CI checks that has never been written.
   *
   * WHAT THIS IS, HONESTLY. It cannot read a sentence and decide whether it is true. Each check
   * is a PAIR: an evidence arm reading the package source, and a claim arm that fails if a
   * chapter states the opposite. The evidence arm is what keeps it from being a spelling pinned
   * in place — the day the code changes, the check stops asking.
   */
  const pkg = (rel: string) => read(join(repoRoot, "packages/ui/src/", rel));
  const allProse = CHAPTERS.map((chapter) => sourceOf(chapter)).join("\n");

  it("both sides found something", () => {
    expect(allProse.length).toBeGreaterThan(20000);
  });

  it("a narrow sidebar LEAVES FLOW; no chapter may promise a bottom bar", () => {
    // The evidence: at narrow, an untouched nav pane is hidden and its presentation resolves to
    // overlay. Nothing anywhere re-parents a sidebar into the bottom row — `ShellBottom` is a
    // pane the app places, and a pane claims its grid area by name.
    const shell = pkg("components/shell/shell.css");
    expect(shell).toMatch(/\.kui-surface\.kui-shell-sidebar\[data-state="auto"\]/);
    expect(shell).not.toMatch(/sidebar[^\n]*grid-area:\s*bottom/);
    expect(allProse, "a chapter says a sidebar becomes a bottom bar").not.toMatch(
      /sidebar becomes a bottom bar/i,
    );
  });

  it("nothing converts a hover reveal into a permanent one; no chapter may promise it", () => {
    // The evidence, stated as an absence the code can show: a tooltip is the system's one
    // hover-revealed thing and its answer on touch is to say NOTHING, never to become visible.
    expect(pkg("components/tooltip/tooltip.tsx")).toMatch(/aria-hidden/);
    expect(
      allProse,
      "a chapter promises hover-revealed content becomes permanently visible",
    ).not.toMatch(/appeared on hover has to be visible all\s*\n?\s*the time/i);
  });

  it("a dialog's OWN parts take its size; no chapter may say size never sets type", () => {
    // The evidence: DialogTitle and DialogDescription resolve their step from the index. The
    // rule the sentence was reaching for survives — nothing sizes type the CALL SITE wrote —
    // and ownership is the difference (§24, §25).
    expect(pkg("components/dialog/dialog.tsx")).toContain("OWNED_TITLE_STEP");
    expect(allProse, "a chapter says a dialog's size never sets the type inside").not.toMatch(
      /never sets the type inside|stops at the box, because a dialog/i,
    );
  });

  it("no chapter lists a token-identity test the suite does not have", () => {
    // The evidence: four shipped families deliberately leave the height ladder, so "every size
    // 2 control resolves to the same height" is false as written AND unasserted — the suite has
    // pairwise agreement laws, never a sweep over every control.
    expect(pkg("tokens/tokens.css")).toMatch(/--mark-2:/);
    expect(allProse, "a chapter claims every size 2 control is one height").not.toMatch(
      /Every size 2 control resolves to the same height/i,
    );
  });
});
