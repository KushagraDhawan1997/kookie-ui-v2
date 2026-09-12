/**
 * List's refusals, as compile errors (ENGINEERING §1.3, §6 "Boundary"), in the shape
 * `popover-types.test.tsx` established: every `@ts-expect-error` fails the build in BOTH
 * directions, so a narrowing that quietly widens is caught the same as one that never existed.
 *
 * WHAT THE `start`/`reversed` DIRECTIVES ACTUALLY ASSERT, recorded because the falsification
 * run disproved the sentence that stood here first (2026-09-12). It claimed those two were "the
 * load-bearing pair", held by the `start?: never` / `reversed?: never` in `UnorderedProps`.
 * They are not: with BOTH `never`s deleted, `tsc` still reports an error on every spelling
 * tried — the plain attribute, a spread of a fresh object literal, and a spread of a non-fresh
 * variable — so neither directive ever goes unused and the deletion is invisible here.
 *
 * The reason is that React's own `ul` typings carry neither attribute, and excess-property
 * checking rejects an unknown one on its own. So these two directives assert THE PLATFORM'S
 * SHAPE — `<List start={3} />` is rejected, which is the guarantee a call site actually meets —
 * and not the component's `never` declarations, which no spelling found here can distinguish
 * the presence of. They are kept for the guarantee and this note is kept for the next person,
 * who should not spend the afternoon I spent looking for the sabotage that moves them.
 */
import * as React from "react";
import { expect, it } from "vitest";

import { List, ListItem } from "./list.tsx";

const refusals = [
  /* `start` AND `reversed` BELONG TO AN ORDERED LIST. Passing either to a `<ul>` is asking a
     set for its numbering, and the platform ignores it — a refusal spelled as silence is not
     one. */
  // @ts-expect-error — `start` is an ordered list's attribute; a bulleted list has no numbering
  <List start={3} />,
  // @ts-expect-error — and `reversed` likewise
  <List reversed />,

  /* `type` IS THE MARKER BY ANOTHER NAME, and the marker is the element's: a disc says "set", a
     number says "sequence", and nesting cycles the glyph by level. A custom glyph is a
     decoration each call site would pick differently (§9 — appearance is resolved output). */
  // @ts-expect-error — `ol`'s own `type` attribute is omitted: it picks a marker glyph
  <List ordered type="a" />,
  // @ts-expect-error — and there is no prop spelling of the same thing
  <List marker="disc" />,

  /* `render` — `ordered` IS the element choice, and a list that is neither `<ul>` nor `<ol>`
     has nothing to announce. */
  // @ts-expect-error — no render escape: the element is what a screen reader reads
  <List render={<div />} />,

  /* THE SHARED REFUSALS REACH THIS COMPONENT (LAW10, audit 2026-09-12). `ComponentRefusals` is
     intersected on `ListProps` directly rather than inside the `ListShared` alias, because
     `refusal-sets.test.ts` reads the HEAD of every exported props declaration and a set reached
     through an alias is a set the law cannot see. It was enforced either way — this directive
     passed before the repair — so the node law is what guards the spelling and this is what
     guards the guarantee. */
  // @ts-expect-error — a component sets no outer spacing (the first non-negotiable)
  <List m="4" />,
  // @ts-expect-error — nor does an item
  <ListItem m="4" />,

  /* THE POSITIVE CONTROLS. Without these, every refusal above would keep passing on a day the
     props were deleted outright, or `ordered` stopped discriminating — which is the direction a
     `@ts-expect-error` file cannot catch on its own. */
  <List ordered start={3} reversed />,
  <List size="9" weight="medium" emphasis="quiet" tone="destructive" />,
  <List>
    <ListItem value={4}>a</ListItem>
  </List>,
];

it("the refusals are compile errors, and this keeps vitest from seeing an empty suite", () => {
  expect(refusals).toHaveLength(10);
});
