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
import { Footer } from "./footer";
import { Specimen } from "./specimen";
import { Button, Grid, Heading, Stack } from "@kookie-ui/react";

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

/** The specimen block's own demo source — the code shown IS the code rendered beside it, which
    is the figure's whole claim. Written out rather than read off disk: a block may not reach
    for the filesystem, which is the line that kept this pairing out of the registry until now. */
const SPECIMEN = `import { Button, Grid } from "@kookie-ui/react";

export default function Example() {
  return (
    <Grid columns="repeat(3, minmax(0, 1fr))" gap="3">
      <Button size="1">A</Button>
      <Button size="1">B</Button>
      <Button size="1">C</Button>
    </Grid>
  );
}
`;

/** The footer demo's own content. Four columns of ordinary destinations for a product that
    does not exist — a demo whose links are the docs' own would teach that the block knows
    about this site, and it knows about nothing. */
const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Roadmap", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API reference", href: "#" },
      { label: "SDKs", href: "#" },
      { label: "Examples", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Customers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Follow us",
    links: [
      { label: "GitHub", href: "#" },
      { label: "Bluesky", href: "#" },
      { label: "YouTube", href: "#" },
    ],
  },
] as const;

export const BLOCKS: readonly BlockEntry[] = [
  {
    slug: "specimen",
    title: "Specimen",
    blurb:
      "A live component and its source, as one figure. The ground holds the running thing on paper and its code beneath, so the pair reads as a thing and its source rather than as two boxes that drifted together — the arrangement is the system's own sentence about grounds and objects, and the surface bands make the ground out-round the paper without a number being picked. The code half is the code-sample block whole, so annotations, the copy button, line numbers and the line bound all arrive with it. A specimen that is already a pane says so, because wrapping a card in paper is the fault this figure exists on the right side of.",
    files: ["specimen.tsx"],
    // Awaited rather than rendered as an element, for the reason the entry below documents:
    // `Specimen` is an async server component, and a suspending element cannot be handed to
    // the laws' synchronous renderer.
    demo: async () =>
      Specimen({
        code: SPECIMEN,
        lang: "tsx",
        title: "examples/grid.tsx",
        children: (
          <Grid columns="repeat(3, minmax(0, 1fr))" gap="3">
            <Button size="1">A</Button>
            <Button size="1">B</Button>
            <Button size="1">C</Button>
          </Grid>
        ),
      }),
  },
  {
    slug: "code-sample",
    title: "Code sample",
    blurb:
      "A labelled, copyable, annotatable code figure. A quiet header row names the language or the file, a copy button confirms on its own label, and the code sits in a recessed well that scrolls sideways instead of wrapping. The author can point — highlight a line or a word, dim everything but the part being explained, mark a diff's added and removed lines — with comment notations that never reach the clipboard. Long files take a line bound that scrolls rather than clips, with an expand button when it binds. Highlighting is Shiki over the system's own ink ladder, so every colour is a value the generator already solved against the surface it sits on.",
    files: [
      "code-sample.tsx",
      "copy-button.tsx",
      "expandable.tsx",
      "highlight.ts",
      "code.css",
    ],
    demo: async () => (
      <Stack gap="6">
        {await CodeSample({ code: INSTALL, lang: "bash" })}
        {/* No `title` (2026-08-30, Kushagra: "do I need this 'A diff, a highlight'"). That slot
            means the code IS a file — it is why pressing it copies the path — and this was a
            caption borrowing it for want of anywhere else to put words. The blurb above already
            says the block marks diffs and highlights, so the words were saying it twice and
            claiming a filename while doing so. */}
        {await CodeSample({ code: ANNOTATED, lang: "tsx", lineNumbers: true })}
      </Stack>
    ),
  },
  {
    slug: "footer",
    title: "Footer",
    blurb:
      "The last region of a page: a mark, columns of links, and the line at the bottom. It is data-driven rather than a set of wrapper parts — a column of links is a list, so it is a prop, and the file itself is where the arrangement lives. What it owns beyond the layout is the naming: every column is its own navigation region labelled by its own title, so a screen reader announces where each one goes instead of reading five unnamed navigations in a row. Links rest muted and take the full ink under the pointer, with the underline resting transparent so nothing moves when it appears. Icons, a newsletter and payment marks are refused with reasons — the file is yours, and adding them is editing it.",
    files: ["footer.tsx", "footer.css"],
    demo: () => (
      <Footer
        brand={
          <Heading size="6" render={<span />}>
            Northwind
          </Heading>
        }
        groups={FOOTER_GROUPS}
        note="© 2018 – 2026 Northwind. All rights reserved."
        legal={[
          { label: "Privacy", href: "#" },
          { label: "Terms", href: "#" },
          { label: "Status", href: "#" },
        ]}
      />
    ),
  },
];

export const BLOCK_BY_SLUG = new Map(BLOCKS.map((block) => [block.slug, block]));
