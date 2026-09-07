import { CHAPTERS } from "./chapters";
import { BLOCKS } from "../../blocks";
import { ENTRIES } from "./components/registry";
import { API, type ApiProp } from "./components/api.generated";
import { propDescription, propSummary, propType } from "./components/prop-description";
import { blockLang, readBlockSource } from "./blocks/source";
import { readChapterSource } from "./toc";
import { readExampleSource } from "./example";
import { humanLabel } from "./label";
import { RULES } from "../builder/review";
import type { Entry } from "./components/registry";

/**
 * THE MARKDOWN TWIN: every page on this site, served a second time as plain markdown at the
 * same path with `.md` on the end (2026-09-06, Kushagra, from a Mintlify toolbar: "I see this
 * in every docs site now").
 *
 * The convention is settled and we are late to it rather than early — Next.js, Adobe's React
 * Spectrum and Chakra all serve one, and llmstxt.org names the same spelling. What varies
 * between them is only what the twin CONTAINS, and that is where this file makes its one
 * decision.
 *
 * WHY THE TWIN IS THE FEATURE AND THE MENU IS THE DOORBELL. Every "Open in ChatGPT" link on
 * the web is a query parameter carrying one sentence that names a URL; the model then fetches
 * it. Without a markdown URL to name, the whole pattern is a menu of links to HTML pages,
 * which is the thing it replaced. So this file is the work and `page-actions.tsx` is five buttons.
 *
 * WHAT A TWIN CONTAINS, AND NOTHING ELSE. No attribution line, no "built with", no preamble
 * addressed to the reader's model. Mintlify injects its own name into the markdown people
 * copy and was publicly called out for it as prompt injection, which is the correct name for
 * it: a document that reaches an agent's context may not carry text that is not the document.
 * The page's own words, and the page's own words only.
 *
 * DERIVED, NEVER AUTHORED. Nothing here is a second copy of anything: a chapter's twin IS the
 * `.mdx` file the page compiles, and a component's twin is built out of the same registry,
 * the same generated API and the same example files the page renders. A twin that was written
 * beside the page it mirrors would be this repo's most-repeated defect wearing a new hat.
 */

/** Everything this site serves a twin for. The ORDER is the site's own reading order. */
export type PageRef = { path: string; title: string; context: string; blurb: string };

export const PAGES: PageRef[] = [
  ...CHAPTERS.map((chapter) => ({
    path: `/${chapter.slug}`,
    title: chapter.title,
    context: chapter.section === "start" ? "Getting started" : capitalize(chapter.section),
    blurb: chapter.blurb,
  })),
  ...ENTRIES.map((entry) => ({
    path: `/components/${entry.slug}`,
    title: humanLabel(entry.name),
    context: `${entry.family} component`,
    blurb: entry.abstract,
  })),
  ...BLOCKS.map((block) => ({
    path: `/blocks/${block.slug}`,
    title: block.title,
    context: "Block",
    blurb: block.blurb,
  })),
];

const CHAPTER_BY_SLUG = new Map(CHAPTERS.map((chapter) => [chapter.slug, chapter]));
const ENTRY_BY_SLUG = new Map(ENTRIES.map((entry) => [entry.slug, entry]));
const BLOCK_BY_SLUG = new Map(BLOCKS.map((block) => [block.slug, block]));

/**
 * A path to its markdown, or `null` where this site serves no page.
 *
 * ONE ENTRY POINT for three kinds of page, because the route handler asking "which kind is
 * this" would be a second place that knows the answer. The order of the arms is the order the
 * routes themselves resolve in: a component slug cannot collide with a chapter slug, because
 * a chapter's own slug carries its section.
 */
export function markdownFor(pagePath: string): string | null {
  const slug = pagePath.replace(/^\/+|\/+$/g, "");

  const block = /^blocks\/(.+)$/.exec(slug)?.[1];
  if (block) {
    const found = BLOCK_BY_SLUG.get(block);
    return found ? blockMarkdown(found) : null;
  }

  const component = /^components\/(.+)$/.exec(slug)?.[1];
  if (component) {
    const found = ENTRY_BY_SLUG.get(component);
    return found ? componentMarkdown(found) : null;
  }

  const chapter = CHAPTER_BY_SLUG.get(slug);
  return chapter ? chapterMarkdown(chapter) : null;
}

const fence = (code: string, lang = "tsx"): string => `\`\`\`${lang}\n${code.trim()}\n\`\`\``;

/**
 * A chapter's twin: its title, then the file.
 *
 * The heading is prepended because the page's title lives in `chapters.ts` and not in the
 * `.mdx` — the renderer puts it there, so the twin has to as well or every chapter's markdown
 * opens mid-sentence.
 *
 * TWO COMPONENTS ARE EXPANDED RATHER THAN STRIPPED, and both are cases where the words a
 * reader needs are not in the file. `<ReviewRules />` renders the house style's rules from the
 * linter's own array — dropping it would publish a chapter that says "the rules are" and then
 * stops. `<Example />` renders a live specimen, and a plain-text reader cannot see a rendered
 * panel, so the twin carries the specimen's SOURCE: the same file, in a fence, which is what a
 * reader with no pixels can actually use.
 *
 * Both are expansions rather than a compiler. A law holds that nothing else in `content/` is
 * JSX, so this list grows only when a chapter genuinely needs a component, and the same law
 * fails on a bare tag this function does not know how to expand.
 */
function chapterMarkdown(chapter: { title: string; source: string }): string {
  const source = readChapterSource(chapter.source)
    .replace(/^\s*<ReviewRules\s*\/>\s*$/m, () =>
      RULES.map(
        (rule) => `### ${rule.title}\n\n\`${rule.id}\` · ${rule.severity}\n\n${rule.why}`,
      ).join("\n\n"),
    )
    .replace(/^\s*<Example\s+name="([^"]+)"[^>]*\/>\s*$/gm, (_match, name: string) =>
      fence(readExampleSource(String(name))),
    );
  return `# ${chapter.title}\n\n${source.trim()}\n`;
}

/**
 * A component's twin.
 *
 * THE REFUSALS COME BEFORE THE PROPS, and that is the one place this document departs from the
 * page it mirrors (2026-09-06, Kushagra: "why refusals first?").
 *
 * The page puts them near the end, which is right for a person: someone scanning for a prop
 * name wants the table where their eye already is, and the argument underneath it is for the
 * second visit. A model does not scan. It reads from the top, and it fails one way — by
 * reaching for a prop we do not have. `variant`, `margin`, a shadow prop: every one of those
 * exists in shadcn and in MUI, so it is the likeliest guess in the room. Forty rows of props
 * read first is a picture of the API, and the refusals arriving after it read as trivia
 * appended to a table rather than as the boundary of the thing.
 *
 * It does not come FIRST, which was this file's first spelling and was wrong: a refusal only
 * means anything once you know what the component is. What it is, what it refuses, then what
 * it takes.
 */
function componentMarkdown(entry: Entry): string {
  const out: string[] = [`# ${humanLabel(entry.name)}`, entry.abstract];

  if (entry.declaration) out.push(fence(entry.declaration));

  out.push("## Overview", ...entry.overview);

  out.push(
    "## What it refuses, and why",
    "Each item below is a decision, not an omission. Each one states what to use instead.",
    entry.refusals.map((refusal) => `- ${refusal.name} — ${refusal.why}`).join("\n"),
  );

  if (entry.variants) {
    out.push("## Examples", fence(readExampleSource(entry.slug)));
    for (const variant of entry.variants) {
      out.push(
        `### ${variant.title}`,
        variant.why,
        fence(readExampleSource(`${entry.slug}.${variant.name}`)),
      );
    }
  } else {
    out.push("## Example", fence(readExampleSource(entry.slug)));
  }

  const summaries = new Map<string, string>([
    [entry.name, entry.abstract],
    ...(entry.parts ?? []).map((part) => [part.part, part.blurb] as const),
  ]);

  if (entry.topics) {
    out.push(
      "## Topics",
      "Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.",
    );
    for (const topic of entry.topics) {
      out.push(`### ${topic.title}`);
      for (const name of topic.symbols) {
        out.push(`#### ${name}`, summaries.get(name) ?? "", propsMarkdown(name));
      }
    }
  } else {
    out.push(
      "## Props",
      "Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.",
      propsMarkdown(entry.name),
    );
  }

  out.push(
    "## Everywhere",
    "This component inherits the rules below. Every component in the system does.",
    EVERYWHERE.map((line) => `- ${line}`).join("\n"),
  );

  return `${out.filter(Boolean).join("\n\n")}\n`;
}

/**
 * A fenced block, as ONE string.
 *
 * The blocks above are pushed onto a list joined by blank lines — which is right for
 * paragraphs and wrong inside a fence, where the opening line and the code are one unit. The
 * first spelling pushed three items and every example on the site published with a blank line
 * under its ```tsx. Harmless to a parser, and the sort of thing nobody would ever have seen,
 * since the only readers of this document are machines.
 */

/** The rules every component inherits. One home, read by the page and by the twin. */
export const EVERYWHERE = [
  "It sets no outer spacing. The container sets the gap between siblings. Use a Box to add space.",
  "Its size is an index, not a measurement. The same number means different things on different ladders.",
  "You choose the meaning and the loudness. The theme resolves the colour.",
  "CSS resolves every state. No JavaScript runs on hover, press or focus.",
  "It forwards className and style. Your style merges last, so your value wins.",
];

/**
 * One symbol's props, as a GFM table.
 *
 * THE PIPES ARE ESCAPED. A spelled-out union is an ordinary type in this package's public API
 * — `headingLevel`, `align`, `display`, every `onValueChange` taking `string | null`; twelve
 * components carry at least one — and an unescaped pipe in a cell does not break that cell, it
 * shifts every cell after it, so the description lands in a column that does not exist.
 * Backticks do not protect a pipe in GFM; only the backslash does.
 *
 * The description is `propSummary(propDescription(prop))`, exactly what the page's cell shows.
 * Both functions, in that order, because the first supplies the sentence `className` and
 * `style` share and the second is the split between a table cell and an editor hover.
 */
function propsMarkdown(name: string): string {
  const api = API[name];
  const props = api?.props ?? [];
  if (!props.length) {
    return api?.element
      ? `It declares no props of its own. It takes every prop of a \`<${api.element}>\`.`
      : "It declares no props of its own. What it takes arrives from a shared type or from the primitive it is built on.";
  }
  const rows = props.map(
    (prop: ApiProp) =>
      `| \`${prop.name}${prop.optional ? "?" : ""}\` | \`${cell(propType(prop))}\` | ${cell(propSummary(propDescription(prop)))} |`,
  );
  const table = ["| Prop | Type | What it does |", "| --- | --- | --- |", ...rows].join("\n");
  return api?.element
    ? `${table}\n\nIt also takes every prop of a \`<${api.element}>\`.`
    : table;
}

/** A table cell's text: pipes escaped, newlines flattened. */
const cell = (text: string): string => text.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");

/**
 * A block's twin: what it is, then every file a consumer copies.
 *
 * A block IS its source (they are distributed by copying, not by importing), so the twin is
 * closer to the whole page here than anywhere else on the site — what it loses is the demos,
 * which are pictures.
 */
function blockMarkdown(block: {
  title: string;
  blurb: string;
  files: readonly string[];
}): string {
  const files = block.files.map(
    (file) => `### ${file}\n\n${fence(readBlockSource(file), blockLang(file))}`,
  );
  return `# ${block.title}\n\n${block.blurb}\n\n## Files\n\n${files.join("\n\n")}\n`;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
