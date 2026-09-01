import { CHAPTERS } from "./chapters";
import { ENTRIES } from "./components/registry";
import { chapterToc } from "./toc";
import type { SearchEntry } from "./search";
import { humanLabel } from "./label";

/**
 * The search index, built at build time out of our own data (2026-08-21; LOG).
 *
 * NOT Pagefind, which was the plan and is the better tool for a big site: it builds a real
 * BM25 index over rendered HTML and loads it in chunks. It wants an HTML directory to crawl
 * AFTER the build and a place to serve the index from, which in this app means a post-build
 * step writing into a directory the build has already finished with. That is a real amount of
 * machinery for a site of roughly fifty pages whose content we already hold as structured
 * data — the chapters, their headings, and every component with its family and blurb.
 *
 * So this is a substring match over titles, headings and blurbs, built here and shipped as
 * JSON. It is honest about what it is: it will not find a word that appears only in the body
 * of a paragraph. When the site outgrows that, Pagefind is the upgrade and this file is what
 * it replaces — the search UI reads a list of results and does not care where they came from.
 */

export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const chapter of CHAPTERS) {
    const headings = chapterToc(chapter.source);
    entries.push({
      title: chapter.title,
      context: chapter.section === "start" ? "Getting started" : capitalize(chapter.section),
      href: `/${chapter.slug}`,
      haystack: `${chapter.title} ${chapter.blurb} ${headings.map((h) => h.title).join(" ")}`.toLowerCase(),
    });
    // Headings are indexed as their own results, because a reader searching "ink ladder"
    // wants the section, not the chapter that contains it eight screens down.
    for (const heading of headings) {
      entries.push({
        title: heading.title,
        context: chapter.title,
        href: `/${chapter.slug}#${heading.id}`,
        haystack: `${heading.title} ${chapter.title}`.toLowerCase(),
      });
    }
  }

  for (const entry of ENTRIES) {
    entries.push({
      title: humanLabel(entry.name),
      context: `${entry.family} component`,
      href: `/components/${entry.slug}`,
      // The refusals are in the haystack deliberately: "no margin prop" and "why can't I set
      // a shadow" are real searches, and the answer is a refusal rather than a feature.
      haystack: `${entry.name} ${entry.blurb} ${entry.refusals.map((r) => r.name).join(" ")}`.toLowerCase(),
    });
  }

  return entries;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
