import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next dev` otherwise writes AGENTS.md and a CLAUDE.md into apps/docs on every run. In
  // this repo CLAUDE.md is the governance document — the file an agent session reads as
  // project instructions — so a framework generating one is not untidy, it is a second
  // uninvited voice in the place the rules live. (Observed doing exactly that during the
  // 2026-08-06 audit: a dev run wrote one and the next session picked it up.) The tree
  // stays authored; the Next docs remain in node_modules for anyone who wants them.
  agentRules: false,
  pageExtensions: ["ts", "tsx", "mdx"],
};

/**
 * MDX as a LOADER, not a framework (2026-08-21; LOG).
 *
 * The compiler is the hard, settled, appearance-free thing — the Base UI relationship, one
 * layer over. What a docs framework adds around it (a nav tree from a directory, a table of
 * contents, prev/next, a content watcher) is a bundle of easy things we would be trading a
 * shape for, so the glue is ours and the compiler is theirs.
 *
 * ONE PLUGIN, and it is a syntax plugin rather than an appearance one. GitHub-Flavoured
 * Markdown is what makes `| a | b |` a table; without it a pipe table compiles to literal
 * text, which is how the first colour chapter shipped its ten-family table as a row of pipes
 * (caught 2026-08-21, before publish, by an agent reading the config rather than the page).
 * `mdx-components.tsx` still decides what a table LOOKS like — remark only decides that one
 * exists. Named as a STRING because Turbopack requires plugin options to be JSON-serializable;
 * remark-gfm takes none, so it passes cleanly.
 *
 * HIGHLIGHTING DELIBERATELY DOES NOT RIDE A PLUGIN HERE, and that same serialization rule is
 * why: our Shiki theme is generated from the ten tones, so it can only ever be an OBJECT.
 * `mdx-components.tsx` maps `pre` to the same CodeBlock the component pages use instead, which
 * is the one-home rule arriving by a different road — prose fences and example sources
 * highlight through one function, or they drift.
 */
const withMDX = createMDX({
  // The second plugin is ours (`mdx-plugins/remark-fence-meta.mjs`): MDX drops a fence's
  // meta string, and the fence renderer needs it for `title=` / `lineNumbers` / `{1,3}`.
  // A path STRING for the same serialization reason remark-gfm is one — and an ABSOLUTE
  // path, because Turbopack's loader workers resolve a plugin string as a module specifier
  // from their own context, where a relative one finds nothing (measured: 21 build errors).
  // vitest.config.ts imports the same file — the blocks law holds the two configs to
  // agreement.
  options: {
    remarkPlugins: [
      ["remark-gfm", {}],
      new URL("./mdx-plugins/remark-fence-meta.mjs", import.meta.url).pathname,
    ],
  },
});

export default withMDX(nextConfig);
