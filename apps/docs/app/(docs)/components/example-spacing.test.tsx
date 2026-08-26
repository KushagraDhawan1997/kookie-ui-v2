/**
 * A shipped example never stacks marks closer than the system's own floor (2026-08-26).
 *
 * §4's stacking rule: two marks in a column need 12 real pixels between them. Below that, the
 * later mark's invisible target — which reaches past its painted box, out to the box a control
 * of that size would occupy — covers the earlier one's paint and wins the hit-test, so a click
 * on one checkbox toggles the next. The package holds it with a mounted law at exactly 12px in
 * all 24 cells. `foundations/size.mdx` teaches it, and `Radio`'s own JSDoc names `gap="5"`.
 *
 * The canonical examples for Checkbox, Switch and Radio shipped at `gap="3"` — 8px at default
 * density and 4px at compact — so the three pages a person copies from taught the opposite of
 * the chapter beside them. Nothing could see it: the coverage laws ask whether an example
 * EXISTS and whether it puts a pane in a pane, and a distance is neither.
 *
 * WHAT THIS READS, honestly. Rendered markup, not source: a distance here is `--kui-g` written
 * by the real resolver, so a Stack that stopped emitting one would fail rather than pass. It
 * cannot read PIXELS — the docs app has no browser — so it holds the INDEX, which is the thing
 * an author picks, and the index-to-pixel map is the package's own law. It is scoped to the
 * COLUMN axis, because that is the axis the rule is about: a mark and its label sitting side
 * by side have the label between them.
 */
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Theme } from "@kookie-ui/react";

import { EXAMPLES } from "../../../examples";

/** The floor, as an index. Step 4 is 12px at default density and 8px at compact; step 5 is the
    first that clears 12 in every density scope, which is why the chapter names it. */
const MARK_STACK_FLOOR = 5;

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

type Frame = {
  column: boolean;
  gap: number | null;
  seq: number;
  indexInParent: number;
  marks: number;
  types: number;
  /** Which of this frame's children is a row AS TALL AS ITS MARK. */
  tight: Set<number>;
};

/**
 * Every column layout holding two or more MARK ROWS, with the layout-space index it states.
 *
 * A "mark row" is a child carrying a mark and at most one line of type — which is the shape the
 * rule is about. The gap between two containers is only the gap between their marks when the
 * container is no taller than the mark, and a `FieldItem` (a label with a description under it)
 * is twice that: its marks sit ~44px apart at a gap the rule would otherwise flag. Two marks
 * inside ONE child are side by side, and the label between them is what keeps them apart, so
 * they are credited to the child rather than to the column.
 */
function markStacks(html: string): { gap: number | null }[] {
  const found: { gap: number | null }[] = [];
  const stack: Frame[] = [];
  const count = (tag: string, frame: Frame) => {
    if (/class="[^"]*\bkui-mark\b/.test(tag)) frame.marks++;
    if (/class="[^"]*\bkui-type\b/.test(tag)) frame.types++;
  };
  for (const tag of html.match(/<\/?[a-zA-Z][^>]*>/g) ?? []) {
    const name = /^<\/?\s*([a-zA-Z0-9-]+)/.exec(tag)?.[1]?.toLowerCase();
    if (!name) continue;
    const parent = stack[stack.length - 1];
    if (tag.startsWith("</")) {
      const frame = stack.pop();
      if (!frame) continue;
      if (frame.column && frame.tight.size >= 2) found.push({ gap: frame.gap });
      const above = stack[stack.length - 1];
      if (above) {
        above.marks += frame.marks;
        above.types += frame.types;
        if (frame.marks > 0 && frame.types <= 1) above.tight.add(frame.indexInParent);
      }
      continue;
    }
    if (VOID.has(name) || /\/>$/.test(tag)) {
      // A void element opens nothing, so it never becomes a frame — but it can still BE the
      // thing being counted, and its own index has to be creditable to its parent.
      if (parent) {
        const before = parent.marks;
        count(tag, parent);
        if (parent.marks > before) parent.tight.add(++parent.seq);
      }
      continue;
    }
    const indexInParent = parent ? ++parent.seq : 0;
    const gapVar = /--kui-g:\s*var\(--layout-space-(\d+)\)/.exec(tag);
    const frame: Frame = {
      column: /--kui-fd:\s*column/.test(tag),
      gap: gapVar ? Number(gapVar[1]) : null,
      seq: 0,
      indexInParent,
      marks: 0,
      types: 0,
      tight: new Set(),
    };
    count(tag, frame);
    stack.push(frame);
  }
  return found;
}

const render = (name: string): string =>
  renderToStaticMarkup(React.createElement(Theme, null, React.createElement(EXAMPLES[name]!)));

describe("no shipped example stacks marks under the 12px rule", () => {
  const names = Object.keys(EXAMPLES);

  it("the walk found stacked marks — a law over nothing audits nothing", () => {
    // The vacuity guard, and the calibration: the three examples this was written for must be
    // the ones it sees. If a rename or a rewrite empties this set the law goes quiet, which is
    // the way this repo's coverage laws have failed before.
    const withStacks = names.filter((n) => markStacks(render(n)).length > 0);
    expect(withStacks).toEqual(expect.arrayContaining(["checkbox", "switch", "radio"]));
  });

  for (const name of names) {
    it(`${name}`, () => {
      for (const stackFound of markStacks(render(name))) {
        expect(
          stackFound.gap,
          `${name} stacks marks in a column that states no gap at all`,
        ).not.toBeNull();
        expect(
          stackFound.gap,
          `${name} stacks marks at layout-space ${stackFound.gap}; §4 needs 12 real pixels, which is step ${MARK_STACK_FLOOR} at every density`,
        ).toBeGreaterThanOrEqual(MARK_STACK_FLOOR);
      }
    });
  }
});
