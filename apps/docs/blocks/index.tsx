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
import { EmptyState } from "./empty-state";
import { Footer } from "./footer";
import { Specimen } from "./specimen";
import { TableOfContents } from "./table-of-contents";
import { Button, Grid, Stack, iconStroke } from "@kookie-ui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FolderLibraryIcon, NoInternetIcon } from "@hugeicons/core-free-icons";
import { Wordmark } from "../app/(docs)/wordmark";

export type BlockEntry = {
  /** The URL segment, and the block's name in every law message. Kebab-case. */
  slug: string;
  title: string;
  /** What the block is and what it is made of. Real sentences — the anti-hollow law reads
      this, because the cheapest way to satisfy a coverage law is an entry that says nothing. */
  blurb: string;
  /** File names under `apps/docs/blocks/` — the set a consumer copies, in reading order. */
  files: readonly string[];
  /**
   * The block, running. Several of them, and the plural is the design (2026-09-01, Kushagra:
   * "each block page can feature many blocks, no? how do I think about footer, there is no
   * 'one' footer, is it?").
   *
   * He is right that there is no one footer, and wrong-in-a-useful-way about what follows from
   * it. shadcn answers the same observation with `sidebar-01` through `sidebar-16` — sixteen
   * FILES, each a whole copy of the same arrangement, which is THESIS §6's "centerless by
   * construction" said in numbers: fix a bug in one and fifteen still have it.
   *
   * A block here is a SHAPE, so the range lives in what you hand it. Nearly every footer people
   * draw differs only in its data — one column or seven, a sign-off or none, a mark or none —
   * and the one shape difference that is left, the minimal single-line footer, DERIVES from the
   * data too (no columns, so there is nothing to stack). So the page shows several demos of ONE
   * file, each labelled with what it is showing, and the reader copies the same file whichever
   * they liked. If a variation ever needs a second file, that is the signal it was a different
   * block.
   *
   * WHICH BOUNDS WHAT A DEMO MAY SHOW: every demo here must be reachable from the file beside
   * it. A figure whose picture takes an edit to reproduce is a copy button handing over
   * something that does not make the picture — which is why the mark-beside-the-columns
   * arrangement is on neither list.
   *
   * Async because a source block may tokenize or read at render time; the page awaits each
   * inside RSC and the law awaits them directly.
   */
  demos: readonly {
    /** What this one is showing. A real phrase — it appears above the demo and the anti-hollow
        law reads it, because "Example 2" is what an unlabelled variant becomes. */
    label: string;
    /**
     * Does the figure put this demo on paper? `false` for a demo that already draws a card of
     * its own — the pane-in-pane fault the Example frame states for component pages, and which
     * the package warns about at runtime. A demo that draws a GROUND keeps the paper, because
     * a ground on paper is an ordinary arrangement and a ground on a ground is one colour twice.
     *
     * Stated rather than detected: the demo is an already-rendered element by the time the page
     * has it, and reading a rendered tree to decide how to frame it is the guessing this prop
     * exists instead of.
     */
    pane?: boolean;
    /**
     * Does the demo take the figure's whole measure? `true` for anything whose own layout
     * answers to how much room it has — a footer, a section, a frame — because the stage
     * otherwise centres it and it shrink-wraps to its content, then lays itself out against
     * the width it just chose. `specimen.tsx` carries the measurement.
     */
    fill?: boolean;
    render: () => Promise<React.ReactElement> | React.ReactElement;
  }[];
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

/** The footer demos' own content (2026-09-02, Kushagra: "lets please have some standard blocks,
    look at Apple, Figma, look at some good footer compositions").
 
    THREE COMPOSITIONS, AND EVERY DIFFERENCE BETWEEN THEM IS DATA. What recurs across the sites
    worth reading — Apple's directory, Figma's and Linear's product footer, the single line at the
    bottom of an app — is how MUCH a footer is carrying, not a different arrangement: a mark over
    five columns, a mark over eight, or no columns at all. The block draws each of them from the
    props below without a branch a call site has to know about, which is the claim the page makes
    by showing them side by side.
 
    THE MARK IS OURS, AND THE WORDS AROUND IT FOLLOW IT (2026-09-02, Kushagra: "use the same font
    as wordmark, and use Kookie only"). `brand` takes a node because a mark is the one thing in a
    footer that is unarguably the app's, so the honest way to demonstrate the slot is to put this
    site's own mark in it — which is also the only mark this site has. The second half of that
    instruction is the `Wordmark`'s own refusal read back: it takes a closed `form` and not
    `children`, deliberately, so that no call site can set arbitrary words in that face. It can
    say "Kookie" or it can say the long form, and nothing else — so the copyright lines say Kookie
    too, because a mark and a sign-off naming two different companies is a demo contradicting
    itself.

    THE LINKS ARE STILL INVENTED, and that is the half that has not changed: a demo whose
    destinations were this site's own would teach that the block knows about this site, and it
    knows about nothing.

    THE GROUP COUNTS ARE CHOSEN, and it is worth saying why rather than letting it read as an
    accident. A column layout draws as many columns as the room allows and then distributes whole
    groups into them, so a set that does not divide by that count comes out ragged — measured in
    this figure at three columns, five groups left the first one holding a single short list
    beside two columns carrying two each, which reads as a mistake rather than as a footer. Six
    and nine divide, so each composition is even where it is shown. A consumer's own footer is
    ragged wherever their groups do not divide by their width, which is true of every footer on
    the web and is not something this file can decide for them.
 
*/
const PRODUCT_GROUPS = [
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
    title: "Resources",
    links: [
      { label: "Guides", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "#" },
      { label: "Contact us", href: "#" },
      { label: "System status", href: "#" },
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

/** The directory: eight short columns and no mark, which is the shape a large site's footer
    takes once its footer has become its site map. The columns wrap into as many rows as the room
    needs — the arrangement multicol was chosen for, and the one a grid cannot hold without
    leaving a hole under every short column. */
const DIRECTORY_GROUPS = [
  {
    title: "Platform",
    links: [
      { label: "Overview", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "Security", href: "#" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Startups", href: "#" },
      { label: "Enterprise", href: "#" },
      { label: "Agencies", href: "#" },
      { label: "Education", href: "#" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API reference", href: "#" },
      { label: "SDKs", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Guides", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "#" },
      { label: "Community", href: "#" },
      { label: "Contact support", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Licences", href: "#" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "Directory", href: "#" },
      { label: "Become a partner", href: "#" },
      { label: "Affiliates", href: "#" },
    ],
  },
  {
    title: "Follow us",
    links: [
      { label: "GitHub", href: "#" },
      { label: "Bluesky", href: "#" },
      { label: "YouTube", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
] as const;

export const BLOCKS: readonly BlockEntry[] = [
  {
    slug: "specimen",
    title: "Specimen",
    blurb:
      "A live component and its source, as one figure, with a tab per file when the subject is more than one. The ground holds the running thing on paper and its code beneath, so the pair reads as a thing and its source rather than as two boxes that drifted together — the arrangement is the system's own sentence about grounds and objects, and the surface bands make the ground out-round the paper without a number being picked. The code half is the code-sample block whole, so annotations, the copy button, line numbers and the line bound all arrive with it. A specimen that is already a pane says so, because wrapping a card in paper is the fault this figure exists on the right side of.",
    /* `file-tabs.tsx` joined on 2026-09-01: the code half takes tabs when a block is several
       files, and the state that picks one is a client component, so it is the specimen's second
       file rather than the code sample's. Which also means this block now documents itself with
       the thing it just grew — its own figure shows two tabs. */
    files: ["specimen.tsx", "file-tabs.tsx"],
    // Awaited rather than rendered as an element, for the reason the entry below documents:
    // `Specimen` is an async server component, and a suspending element cannot be handed to
    // the laws' synchronous renderer.
    demos: [
      {
        label: "A component and its source",
        /* The demo IS a figure — a ground holding paper — so the page must not put it on more
           paper. Measured before this line existed: the package's own dev warning fired,
           "A <Card> is rendering inside another <Card>". */
        pane: false,
        /* The figure is a GROUND, so it answers to the room like the footer below it: measured
           at 504px inside a 718px stage before this line existed, centred, with two bands of
           empty pane either side of a block whose whole subject is how it fills a page. */
        fill: true,
        render: async () =>
      Specimen({
        sources: [{ code: SPECIMEN, lang: "tsx" }],
        children: (
          <Grid columns="repeat(3, minmax(0, 1fr))" gap="3">
            <Button size="1">A</Button>
            <Button size="1">B</Button>
            <Button size="1">C</Button>
          </Grid>
        ),
      }),
      },
    ],
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
    demos: [
      {
        label: "A shell command, and an annotated sample",
        /* A code well takes the measure it is given — it scrolls sideways rather than wrapping,
           so a shrink-wrapped one is narrower for no reason a reader can see. Measured at 554px
           in a 684px stage. */
        fill: true,
        render: async () => (
      <Stack gap="6">
        {await CodeSample({ code: INSTALL, lang: "bash", lineNumbers: true })}
        {/* No `title` (2026-08-30, Kushagra: "do I need this 'A diff, a highlight'"). That slot
            means the code IS a file — it is why pressing it copies the path — and this was a
            caption borrowing it for want of anywhere else to put words. The blurb above already
            says the block marks diffs and highlights, so the words were saying it twice and
            claiming a filename while doing so. */}
        {await CodeSample({ code: ANNOTATED, lang: "tsx", lineNumbers: true })}
      </Stack>
    ),
      },
    ],
  },
  {
    slug: "empty-state",
    title: "Empty state",
    blurb:
      "What a region shows when it has nothing to show: a mark, a title naming what is absent, a sentence, and one thing to do. The arrangement and the rank are the file's — two named action slots rather than a list, because three buttons in an empty state is the failure this exists to prevent, and the type is what enforces it. What it does not carry is a reason prop: the three states a region can be empty for — nothing created yet, a filter that matched nothing, something that failed or is not yours to see — differ in words and in rank rather than in arrangement, so they are demos and prose rather than a switch. Offering \u201cCreate your first project\u201d under a search that returned nothing is the mistake most libraries ship, and the second demo below is what not shipping it looks like. It draws no pane and states no height: it centres in whatever region it is handed and hugs when that region has none.",
    files: ["empty-state.tsx", "empty-state.css"],
    demos: [
      {
        /* NOTHING YET. The mark earns its place here and nowhere else in this list: a first-use
           state is the one a reader meets before they know what the region is for. */
        label: "Nothing yet: the action creates the first one",
        fill: true,
        render: () => (
          <EmptyState
            mark={<HugeiconsIcon icon={FolderLibraryIcon} strokeWidth={iconStroke} aria-hidden />}
            title="No projects yet"
            description="A project holds your files, your team and everything they ship."
            action={<Button emphasis="loud">New project</Button>}
            secondary={<Button emphasis="quiet">Import from GitHub</Button>}
          />
        ),
      },
      {
        /* NOTHING MATCHED, AND THIS DEMO IS THE POINT OF THE BLOCK. No mark — there is nothing to
           introduce, the reader already knows what a project is. The action CLEARS the filter and
           is quiet, because it takes something away; a loud "New project" here answers a question
           nobody asked and is what most libraries ship. */
        label: "Nothing matched: the action clears the filter",
        fill: true,
        render: () => (
          <EmptyState
            title={"No projects match \u201cinvoice\u201d"}
            description="Try a shorter search, or clear the filters you have on."
            action={<Button emphasis="quiet">Clear filters</Button>}
          />
        ),
      },
      {
        /* NOTHING AVAILABLE. It failed, or it is not yours to see. The action RETRIES, and the
           words say what happened rather than what you did wrong. */
        label: "Nothing available: the action tries again",
        fill: true,
        render: () => (
          <EmptyState
            mark={<HugeiconsIcon icon={NoInternetIcon} strokeWidth={iconStroke} aria-hidden />}
            title="Could not load your projects"
            description="The connection dropped. Nothing was lost."
            action={<Button emphasis="medium">Try again</Button>}
          />
        ),
      },
    ],
  },
  {
    slug: "footer",
    title: "Footer",
    blurb:
      "The last region of a page: a mark, columns of links, and the line at the bottom. It is data-driven rather than a set of wrapper parts — a column of links is a list, so it is a prop, and the file itself is where the arrangement lives. What it owns beyond the layout is the naming: every column is its own navigation region labelled by its own title, so a screen reader announces where each one goes instead of reading five unnamed navigations in a row. Links rest muted and take the full ink under the pointer, with the underline resting transparent so nothing moves when it appears. A footer with no columns is a line: the mark comes down into the sign-off row, which is the minimal shape every app footer takes and is derived from the data rather than asked for. It draws no pane of its own: what a footer sits on is the page's business, so a footer that wants a ground is wrapped in a Surface by whoever wants one. Icons, a newsletter and payment marks are refused with reasons — the file is yours, and adding them is editing it.",
    files: ["footer.tsx", "footer.css"],
    demos: [
      {
        /* THE PRODUCT FOOTER — a mark, the columns, the line that closes the page. The shape
           Figma, Linear, Stripe and Vercel all draw, and the one this block was designed
           against. */
        label: "A mark, the columns, and a sign-off",
        fill: true,
        render: () => (
          <Footer
            /* One step under the site's own footer mark, which carries the long form and has a
               wider column to carry it in. */
            brand={<Wordmark size="8" />}
            groups={PRODUCT_GROUPS}
            note="© 2018 – 2026 Kookie. All rights reserved."
            legal={[
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Status", href: "#" },
            ]}
          />
        ),
      },
      {
        /* THE DIRECTORY — Apple's own footer, and GitHub's: enough columns that the footer is
           the site map, no mark, and one quiet line under it. Nothing is switched on to get
           here; there are simply more groups and no `brand`. */
        label: "A site map, and one quiet line under it",
        fill: true,
        render: () => (
          <Footer
            groups={DIRECTORY_GROUPS}
            note="© 2026 Kookie. Made in Bengaluru."
          />
        ),
      },
      {
        /* THE LINE — the footer of an app or a one-page site, and the block's one derived
           shape: no `groups`, so there are no columns for the mark to stand over and it comes
           down into the row. Not a variant, and not a prop — see `footer.tsx`. */
        label: "No columns at all: a mark and a line",
        fill: true,
        render: () => (
          <Footer
            /* The same step as the columned footers above it (2026-09-02, Kushagra: "stick to
               8"). It shipped at `7` on the argument that a mark on one line is a signature
               rather than a masthead — which reasons about the ROLE and ignores that it is the
               same mark in the same block at the same width, and a footer that shrinks its own
               name when it has less to say reads as two marks rather than one. */
            brand={<Wordmark size="8" />}
            groups={[]}
            note="© 2026 Kookie"
            legal={[
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Status", href: "#" },
            ]}
          />
        ),
      },
    ],
  },
  {
    slug: "table-of-contents",
    title: "Table of contents",
    blurb:
      "The headings of the page you are reading, in the gutter, with the one you are at marked. It is Tabs turned vertical: a list of places where exactly one is current, marked by ink and a rule and never by a fill — a fill would make it a row you pick from a list, which is what the sidebar on the other side of the page already is. The rail is drawn by the entries themselves rather than by a measured indicator under them, so the lit segment is exactly the entry it marks and there is nothing to keep in sync. Sub-headings are told apart by where they start, not by a third ink. Uncontrolled it watches the page with an IntersectionObserver and marks the last heading you have passed, which is the case a plain topmost-visible-heading spelling leaves blank; hand it a `current` and it marks that instead. What it does not decide is the column — the width, the stickiness and the window where two columns stop fitting are the page's layout rather than this block's box, so they arrive on the class you pass in.",
    files: ["table-of-contents.tsx", "table-of-contents.css"],
    demos: [
      {
        /* THE ORDINARY CASE: a page of sections, one of them the one you are in. `current` is
           stated because a figure does not scroll — the demo shows the RANK, which is the thing
           a reader is deciding about, and the observer is what puts a real page's answer into
           the same prop. */
        label: "A page of sections, with the one you are at marked",
        render: () => (
          <TableOfContents
            entries={[
              { id: "toc-demo-meaning", title: "Say what you mean, not which colour", level: 2 },
              { id: "toc-demo-families", title: "The ten families", level: 2 },
              { id: "toc-demo-roles", title: "Components use roles, not steps", level: 2 },
              { id: "toc-demo-tints", title: "Tints and borders are grey in every family", level: 2 },
              { id: "toc-demo-icons", title: "Icons use their own colour", level: 2 },
              { id: "toc-demo-text", title: "The three text colours", level: 2 },
            ]}
            current="toc-demo-roles"
          />
        ),
      },
      {
        /* TWO LEVELS. The sub-heading is indented and reads at the same rank as its siblings,
           which is the decision worth showing: the level is geometry, so a reader learns the
           shape once and nothing else has to change colour to say it. */
        label: "Two levels: a sub-heading is told by where it starts",
        render: () => (
          <TableOfContents
            entries={[
              { id: "toc-nested-meaning", title: "Say what you mean, not which colour", level: 2 },
              { id: "toc-nested-families", title: "The ten families", level: 2 },
              { id: "toc-nested-nickname", title: "success is not a nickname for green", level: 3 },
              { id: "toc-nested-accent", title: "The accent goes grey in two more places", level: 3 },
              { id: "toc-nested-roles", title: "Components use roles, not steps", level: 2 },
            ]}
            current="toc-nested-nickname"
          />
        ),
      },
    ],
  },
];

export const BLOCK_BY_SLUG = new Map(BLOCKS.map((block) => [block.slug, block]));
