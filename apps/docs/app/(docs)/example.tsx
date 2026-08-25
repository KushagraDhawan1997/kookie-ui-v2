import { readFileSync } from "node:fs";
import path from "node:path";
import { Card, Stack } from "@kookie-ui/react";

import { CodeBlock } from "./code-block";
import { EXAMPLES } from "../../examples";

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
 * Does this example render its own pane at the root?
 *
 * Read off the source rather than declared beside it, because a flag would be a second home
 * for a fact the file already states, and the two would part company the first time an example
 * was rewritten. The answer is checked against the RENDERED markup by a law, which is what
 * makes reading source acceptable here: a regex can only be wrong by finding nothing, and
 * finding nothing means wrapping, which is the fault this exists to prevent.
 */
export const rootsOwnPane = (source: string): boolean =>
  // Composer joined this list on 2026-08-23, and the agreement law is what put it there: a
  // composer IS a `.kui-surface` (§30 — a box that holds full-size controls is a Card), so the
  // frame would have wrapped a pane in a pane. Neither file contains the nesting, which is
  // exactly why the rendered-tree half of the law is the one that caught it.
  /return\s*\(\s*<(Card|Surface|Composer)\b/.test(source);

export function Example({ name, quiet }: ExampleProps) {
  const Component = EXAMPLES[name];
  if (!Component) {
    // Loud rather than empty. A silently missing specimen is the failure mode a coverage law
    // exists to prevent, and this is its backstop for the moment between writing a page and
    // writing the file.
    throw new Error(`No example named "${name}". Add examples/${name}.tsx and register it.`);
  }
  const specimen = <Component />;
  const source = readExampleSource(name);
  // ONE FIGURE, and the gaps are what say so (2026-08-25). The specimen and its source used
  // to sit 8px apart with the source's own label 4px above the well — one step between the
  // two halves and one step inside the second half, so the label belonged to neither and the
  // pair read as two boxes that had drifted into each other rather than as a thing and its
  // code. §15 asks group and sibling distances to differ by two steps at minimum; `code-block`
  // binds its label to its well at 4px, and the 16px here is what separates the specimen from
  // that pair. The figure's air from the prose around it is the chapter renderer's, and it is
  // now 32px a side, which is what lets a tighter inside read as one unit.
  return (
    <Stack gap="5">
      {/* The specimen sits on a CARD — paper above the page, which is where most components
          actually live. A Surface would be the other reading (a ground holding objects) and
          is wrong here for one reason: the code block below is already a well, and two wells
          stacked read as one region rather than as a thing and its source.

          UNLESS THE EXAMPLE BRINGS ITS OWN PANE (2026-08-21). Four examples root a Card and
          one roots a Surface, because the component they document IS the pane — and the frame
          wrapped them anyway, which is how this site shipped card-inside-card on four
          component pages for weeks. Nothing static could see it: the frame is one file, the
          example is another, and the nesting only exists in the rendered tree. Derived from
          the source the component already reads rather than a flag beside it, so there is no
          second place for the answer to go stale. */}
      {rootsOwnPane(source) ? specimen : <Card size="4">{specimen}</Card>}
      {quiet ? null : (
        <CodeBlock code={source} lang="tsx" title={`examples/${name}.tsx`} />
      )}
    </Stack>
  );
}
