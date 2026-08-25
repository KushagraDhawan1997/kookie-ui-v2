/**
 * The blocks registry — one entry per copy-paste block (2026-08-26).
 *
 * A block is COPIED SOURCE, not published code. That is only safe under one condition,
 * reconciled against THESIS §6 (shadcn's copy-paste is "centerless by construction" — the
 * failure named there): the copied file must make no design decisions of its own. Every
 * colour, distance and step resolves through the package, so the center stays in the
 * dependency and the copy carries only arrangement and behaviour. Behaviour is allowed —
 * state, handlers, an async tokenizer — which is what separates a source block from a
 * builder document (the builder's own law: a document cannot express a handler). Two kinds
 * of block follow: builder-assembled (structure only) and source blocks (behaviour, still
 * zero invented values). This registry holds both; the first entry is a source block.
 *
 * ONE ARRAY, the shape every registry in this repo has (ENGINEERING §1.1): it is the /blocks
 * index, the route table and the subject of the coverage laws at once. `files` is the set a
 * consumer copies, shown on the block's page in order — a block is allowed to be several
 * files (the client half of a server component must be its own module), and the law walks
 * the directory against the union so a file can be neither orphaned nor forgotten.
 */
import * as React from "react";

import { CodeSample } from "./code-sample";
import { Stack } from "@kookie-ui/react";

export type BlockEntry = {
  /** The URL segment, and the block's name in every law message. Kebab-case. */
  slug: string;
  title: string;
  /** What the block is and what it is made of. Real sentences — the anti-hollow law reads
      this, because the cheapest way to satisfy a coverage law is an entry that says nothing. */
  blurb: string;
  /** File names under `apps/docs/blocks/` — the set a consumer copies, in reading order. */
  files: readonly string[];
  /** Renders the block live with sample props. Async because a source block may tokenize or
      read at render time; the page awaits it inside RSC and the law awaits it directly. */
  demo: () => Promise<React.ReactElement> | React.ReactElement;
};

const INSTALL = `git clone https://github.com/KushagraDhawan1997/kookie-ui-v2
cd kookie-ui-v2
pnpm install
pnpm run build
`;

/** The annotation vocabulary, demonstrated in one sample: a diff pair, a highlighted line,
    and a pointed-at word — authored the way a fence would author them. */
const ANNOTATED = `const label = "Sign in" // [!code --]
const label = "Continue" // [!code ++]

export function Submit() {
  return <Button emphasis="loud">{label}</Button> // [!code highlight]
}
`;

export const BLOCKS: readonly BlockEntry[] = [
  {
    slug: "code-sample",
    title: "Code sample",
    blurb:
      "A labelled, copyable, annotatable code figure. A quiet header row names the language or the file, a copy button confirms on its own label, and the code sits in a recessed well that scrolls sideways instead of wrapping. The author can point — highlight a line or a word, dim everything but the part being explained, mark a diff's added and removed lines — with comment notations that never reach the clipboard. Long files take a line bound that scrolls rather than clips, with an expand button when it binds. Highlighting is Shiki over the system's own ink ladder, so every colour is a value the generator already solved against the surface it sits on.",
    files: [
      "code-sample.tsx",
      "code-block.tsx",
      "copy-button.tsx",
      "expandable.tsx",
      "highlight.ts",
      "code.css",
    ],
    demo: async () => (
      <Stack gap="6">
        {await CodeSample({ code: INSTALL, lang: "bash" })}
        {await CodeSample({
          code: ANNOTATED,
          lang: "tsx",
          title: "A diff, a highlight",
          lineNumbers: true,
        })}
      </Stack>
    ),
  },
];

export const BLOCK_BY_SLUG = new Map(BLOCKS.map((block) => [block.slug, block]));
