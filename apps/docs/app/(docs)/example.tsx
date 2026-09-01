import { readFileSync } from "node:fs";
import path from "node:path";
import { Card } from "@kookie-ui/react";

import { Specimen } from "../../blocks/specimen";
import { tokenize } from "../../blocks/highlight";
import { EXAMPLES } from "../../examples";
import { controlsFor, inlineControls, slotKey, slotStates } from "./controls";
import { Playground } from "./playground";

/**
 * A live specimen and its source, from ONE file.
 *
 * The component is imported and rendered; the same file is read off disk and shown. There is
 * no second copy of the code and therefore nothing to keep in step — the oldest failure this
 * repo has, arriving in the one place a docs site is guaranteed to meet it.
 *
 * A NOTE ON WHAT THIS IS NOT: the builder's export path produces JSX from a document, held by
 * a round-trip law, and it was the tempting mechanism here. It cannot be the only one. A
 * builder document has no handlers, no controlled state and no imports of its own, so a docs
 * system built on it could never show a form that submits — and refusing to show people how
 * to handle a submit is not a refusal this system has any argument for. Files are the base
 * mechanism; the builder is the upgrade where the grammar happens to fit.
 */

/** Scoped to a subfolder deliberately: Turbopack traces the WHOLE project into the server
    bundle when it cannot statically bound a filesystem read (the same constraint `toc.ts`
    documents). */
const EXAMPLE_ROOT = path.join(process.cwd(), "examples");

export const readExampleSource = (name: string): string =>
  readFileSync(path.join(EXAMPLE_ROOT, `${name}.tsx`), "utf8");

export type ExampleProps = {
  /** The example's file name, which is also the component's slug — one convention rather than
      a mapping field, so there is no third place for the pairing to go wrong. */
  name: string;
  /** Hide the source. For a page that has already shown it and wants the specimen again. */
  quiet?: boolean;
};

/**
 * Does this example render its own PAPER at the root?
 *
 * Read off the source rather than declared beside it, because a flag would be a second home
 * for a fact the file already states, and the two would part company the first time an example
 * was rewritten. The answer is checked against the RENDERED markup by a law, which is what
 * makes reading source acceptable here: a regex can only be wrong by finding nothing, and
 * finding nothing means wrapping, which is the fault this exists to prevent.
 *
 * CARD, NOT SURFACE (2026-08-29, Kushagra). It matched `Surface` too until now, and that was
 * the wrong shape of answer: a Surface at the root was exempted from the paper, so it landed
 * directly on the figure's own ground — a ground inside a ground, which is the exact fault the
 * figure had just been rebuilt to remove. The rule is that the choice is CARD OR NO CARD and
 * never card-or-something-else: if a container has to be withheld, withhold it, do not swap it
 * for a different one. A Surface inside a Card is fine — a ground on paper is an ordinary
 * arrangement, and it is what a Surface example should show.
 *
 * Composer stays, for the reason recorded 2026-08-23: a composer IS a `.kui-surface` (§30 — a
 * box that holds full-size controls is a Card), so wrapping one puts a pane in a pane.
 */
export const rootsOwnPane = (source: string): boolean =>
  /return\s*\(\s*<(Card|Composer)\b/.test(source);

export async function Example({ name, quiet }: ExampleProps) {
  const Component = EXAMPLES[name];
  if (!Component) {
    // Loud rather than empty. A silently missing specimen is the failure mode a coverage law
    // exists to prevent, and this is its backstop for the moment between writing a page and
    // writing the file.
    throw new Error(`No example named "${name}". Add examples/${name}.tsx and register it.`);
  }
  const specimen = <Component />;
  const source = readExampleSource(name);

  /* ONE FIGURE, AND NOW ONE SURFACE (2026-08-29, Kushagra: "the preview and the code should
     belong to same surface, inside one surface").

     This was a Stack of two siblings — paper, a gap, then the code well — with a comment here
     arguing that the gap was what made them one figure. It was not: two boxes a step apart are
     two boxes, and a comment doing the eye's job is the tell. `Specimen` is the pairing as a
     block, so the shape is stated once and a consumer can copy it; what stays here is the only
     thing a copied file could not carry, which is the filesystem read.

     NO FILENAME (2026-08-30, Kushagra: "do I need the filename... isn't it obvious?"). It read
     `examples/<name>.tsx` until now, which is a path in THIS repo: it tells a reader nothing
     about where the code goes in their app, and because the name is copyable, pressing it put a
     useless string in their clipboard. It looked like information. A block's filenames stay,
     and the difference is that there they are an INSTRUCTION — the files import each other by
     path, so `./code-block` only resolves if you name that file `code-block.tsx`. Nothing is
     downstream of an example's path.

     The language label goes with it, by the same test: this is a React library, so every fence
     that is not a shell command is tsx, and a label that is always true says nothing. `Terminal`
     survives on the blocks pages, where it is the one label that changes what you DO with the
     code — that goes in a shell, not in a file.

     `quiet` still means "the source is already on this page", and with the code inside the
     figure there is no figure left to draw — so the specimen falls back to plain paper rather
     than an empty ground. */
  if (quiet) {
    return rootsOwnPane(source) ? specimen : <Card size="4">{specimen}</Card>;
  }

  /* UNLESS THE EXAMPLE BRINGS ITS OWN PANE (2026-08-21). Four examples root a Card and one a
     Surface, because the component they document IS the pane — and the frame wrapped them
     anyway, which is how this site shipped card-inside-card on four component pages for weeks.
     Nothing static could see it: the frame is one file, the example is another, and the
     nesting only exists in the rendered tree. Derived from the source the component already
     reads rather than a flag beside it, so there is no second place for the answer to go
     stale. The block takes the ANSWER and never the source, which is what keeps it copyable. */
  /* CONTROLS, WHEN THE PAGE HAS ANY (2026-08-30). The example is a real component taking real
     props, so a knob moves the specimen by re-rendering it — and the source shown is rewritten
     from the same values, so the code and the pixels cannot say different things.

     Tokenized HERE and once. `inlineControls` puts a placeholder where each value goes; the
     client swaps that one token's text as knobs move, which is why a page with controls still
     ships no highlighter to the browser. */
  const controls = controlsFor(name, source);
  if (controls.length > 0) {
    // One tokenized variant per slot state (see `slotStates`): a page with no slot knob has one.
    const variants = Object.fromEntries(
      await Promise.all(
        slotStates(controls).map(async (slots) => [
          slotKey(controls, slots),
          await tokenize(inlineControls(source, controls, slots), "tsx"),
        ]),
      ),
    );
    return (
      <Playground
        slug={name}
        controls={controls}
        // The SAME predicate the static path below uses. It was missing here for one commit and
        // the Card page put a card inside a card again — the fault this figure was rebuilt to
        // remove, reintroduced by a second render path that did not ask the question. The law
        // could not see it either: it walked the examples through the static arrangement, which
        // is not the arrangement a controllable page renders.
        pane={!rootsOwnPane(source)}
        variants={variants}
      />
    );
  }

  return (
    <Specimen sources={[{ code: source, lang: "tsx" }]} pane={!rootsOwnPane(source)}>
      {specimen}
    </Specimen>
  );
}
