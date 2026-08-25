import "./code.css";

import { ScrollArea, Surface, Text, type Size } from "@kookie-ui/react";

/**
 * STUB — the block-level code element, standing in for a future `@kookie-ui/react` export
 * (agreed 2026-08-26). The package ships `Code`, the inline atom; this is its block sibling
 * the way `Blockquote` is a block: mono text in a recessed well that scrolls sideways instead
 * of wrapping. Display and position only — no state. Behaviour (copy, expand) lives one file
 * over in `code-sample.tsx`, because behaviour is the block's, not the element's.
 *
 * THE SWAP: the day the package exports `CodeBlock`, `code-sample.tsx` changes one import and
 * this file is deleted in the same commit — one home, never two. A law in `blocks.test.tsx`
 * watches the package's exports and fails the moment `CodeBlock` appears there, so the swap
 * cannot be forgotten.
 *
 * THE STUB'S DISCIPLINE is that it decides nothing the package would not: every value below
 * is a token or a package component's own default. If a chrome design ever needs something
 * this file cannot say in tokens, that is a finding about the package element's design — it
 * does not get hacked in here.
 *
 * SIZE PRICES EVERYTHING (2026-08-26, Kushagra) — the ownership rule (§24/§25/§30: a
 * component that owns its pane and its text prices both): the pane's padding and corner, the
 * mono step, the bound's line height, and — through the block — the chrome's controls all
 * ride one index.
 *
 * THE ELEMENT IS THE WELL AND NOTHING ELSE. The block's floating chrome (glass copy and
 * expand buttons) OVERLAYS the pane from a positioned wrapper OUTSIDE it — it was a `chrome`
 * slot inside the pane for an hour (2026-08-26) and the surface layer's own bleed arms
 * refused it: a sibling after the ScrollArea breaks `:last-child`, so the scroller stopped a
 * pane-inset short of the bottom edge and the horizontal bar floated mid-pane. The wrapper
 * states the same inset token the pane uses, so the pixels are identical and the element
 * stays pure.
 *
 * The composition is the one this repo already settled (2026-08-21, Kushagra, on the
 * builder's export dialog): **a Surface, not a Card** — "the code is not an object sitting on
 * the page, it is a well recessed into it."
 */
export type CodeBlockProps = {
  children: React.ReactNode;
  /** One index for the whole element: pane padding and corner, mono step, bound arithmetic. */
  size?: Size;
  /** Dresses the code element (the `<pre>`). Outer spacing is the caller's Box, never this. */
  className?: string;
  /**
   * The bound (the spec's "a long file must not swallow the page"): the well's maximum
   * height, in LINES of its own code. Bounded means SCROLLABLE, never clipped — every line
   * stays reachable by wheel, keyboard and assistive technology, which is what lets an
   * expand control be a convenience rather than a gate (v1's collapse hid code that was
   * still in the tab order; this shape makes that defect inexpressible). No fade over the
   * last lines — a mask shipped for an hour with the floating expand button and left with it
   * (Kushagra, 2026-08-26): a scrollable well with a visible scrollbar already says "more".
   */
  maxLines?: number;
};

export function CodeBlock({ children, size = "2", className, maxLines }: CodeBlockProps) {
  // `--line-height-N` is the line box of the size-N Text below — one index, two spellings.
  const lh = `var(--line-height-${size})`;
  return (
    <Surface size={size} className="kd-code-well">
      <ScrollArea
        // Spread, because ScrollArea's `style` refuses an explicit undefined under
        // exactOptionalPropertyTypes. `--kui-sf-p` is the surface padding the scroller
        // re-states on its viewport.
        {...(maxLines === undefined
          ? {}
          : {
              style: {
                maxBlockSize: `calc(${maxLines} * ${lh} + 2 * var(--kui-sf-p, 0px))`,
              },
            })}
      >
        {/* `render={<pre/>}` keeps the element the browser and every assistive technology
            already understand as preformatted code, and Text supplies the ramp step and the
            ink. The mono slot is the type layer's third family (§15) — reached here by
            `style` because the family is a token, not a Text prop: `Code` is the inline atom
            and a block is not one. */}
        <Text
          size={size}
          render={<pre />}
          className={className ? `kd-code ${className}` : "kd-code"}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <code>{children}</code>
        </Text>
      </ScrollArea>
    </Surface>
  );
}
