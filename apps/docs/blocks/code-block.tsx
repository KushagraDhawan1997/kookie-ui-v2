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
  /**
   * The block's chrome row, floating over the top of the pane (2026-08-28, Kushagra: "the
   * content doesnt float behind buttons now? It needs to float, else whats the point of
   * glass").
   *
   * A NODE RATHER THAN A FLAG, because the well does not know what its chrome is. It owns the
   * pane, the mono step and the scroller; what sits in the row is `code-sample.tsx`'s.
   */
  topbar?: React.ReactNode;
  /**
   * The block's other floating row, at the BOTTOM of the pane — the expand control.
   *
   * IT LIVES HERE FOR THE SAME REASON THE TOPBAR DOES (2026-09-01, Kushagra: "the button still
   * has more padding than code sample"). It used to hang from a positioned `Box` around this
   * element, which is where all the block's chrome started; the topbar moved inside when the
   * well became the containing block, and this one did not. So the two rows floated against two
   * different boxes — and in a HOSTED well those boxes have different bottoms, because the
   * bleed's negative margin shortens the outer one by exactly the host's inset. Measured: the
   * standalone twin's button sat 16 pixels off its pane wall and the hosted one 41, the host's inset
   * counted twice. One containing block is the fix; compensating from outside it would have
   * been the arithmetic that produced the fault.
   */
  footer?: React.ReactNode;
  /**
   * Does that row SPAN the pane, so the code owes it a safe area? (2026-08-31, Kushagra: "the
   * one with no filename... the top left just looks weird".)
   *
   * A BAND IS RESERVED FOR A ROW THAT REACHES TWO WALLS, NOT FOR ONE CONTROL IN A CORNER. The
   * band was added 2026-08-28 because the first line had nowhere to rest, and that was true of
   * a row with a name at one wall and a copy button at the other: it covers all of line 1. An
   * unlabelled sample has only the copy button, so the same band reserves a full pane's width
   * to clear a control that occupies one corner of it — which is what the empty top-left was.
   *
   * Without it the button hangs in the corner and line 1 passes under the glass, which is what
   * the material is for. The exposure is a first line long enough to reach the button, and it
   * is small: across this site's fences the median first line is 27 characters, and one long
   * enough to reach the corner already overflows the pane and scrolls, where the scroller's own
   * edge fade dissolves it under the chrome.
   *
   * A FLAG HERE AND A NODE ABOVE, deliberately: the well cannot read its chrome's shape off the
   * node (the row is one `Flex` either way, and counting its children would be this file
   * guessing at another file's arrangement). What it can be told is the one geometric fact it
   * needs, by the file that decides it.
   */
  band?: boolean;
  /**
   * The element is already inside a pane, so it draws none of its own (2026-08-29, Kushagra:
   * "the code block inside specimen should not have its own surface").
   *
   * A pane inside a pane of the same kind is two grounds painting one colour, separated by a
   * hairline that says nothing — the fault §10 names when it separates a Card (an object) from
   * a Surface (what an object sits on). A code well is a ground, so a well inside a ground is
   * the same ground twice. Hosted, the HOST's pane is the well: fill, corner, hairline, clip
   * and inset all come from it, and what stays here is the one thing the host cannot give —
   * a positioning context for the floating chrome.
   *
   * It is not a second appearance. The element still renders one arrangement; this says who
   * owns the box around it, the way §4 says a hosted control's geometry comes from its
   * container.
   */
  hosted?: boolean;
};

export function CodeBlock({
  children,
  size = "2",
  className,
  maxLines,
  topbar,
  footer,
  band,
  hosted,
}: CodeBlockProps) {
  // `--line-height-N` is the line box of the size-N Text below — one index, two spellings.
  const lh = `var(--line-height-${size})`;
  /* The chrome's safe area, in the tokens the chrome is built from: its own inset, one control
     height, and that inset again down to the first line. No number is picked here — change the
     row's padding or the control ladder and this follows.

     MINUS THE INSET THE SCROLLER ALREADY GIVES. The viewport re-pads by `--kui-sf-p` after
     bleeding to the pane's walls, so the first spelling stacked that on top of the whole band
     and the code rested three times too far below the buttons. This is the distance still
     OWED, not the distance wanted.

     `max()` because a small enough size could make the pane's own inset the larger of the two,
     and a negative padding is not a thing — there the scroller's re-pad already clears the
     chrome and nothing more is owed. */
  const clearance = `max(0px, calc(2 * var(--layout-space-4) + var(--control-height-${size}) - var(--kui-sf-p, 0px)))`;

  const body = (
    <>
      <ScrollArea
        // The scroll-edge fade (2026-08-29): the lines dissolve under the floating chrome
        // when there is more code that way, and the resting edges stay clean. A mask, so it
        // costs no colour — the well's own fill shows through.
        fade
        // Spread, because ScrollArea's `style` refuses an explicit undefined under
        // exactOptionalPropertyTypes. `--kui-sf-p` is the surface padding the scroller
        // re-states on its viewport.
        {...(maxLines === undefined
          ? {}
          : {
              style: {
                // The bound counts LINES, so the band is added rather than eaten:
                // `maxLines={6}` shows six lines whether or not chrome floats above them.
                // This is also the arrangement that makes the glass do its job — a bounded
                // block scrolls, and the lines pass under the row.
                maxBlockSize: band
                  ? `calc(${maxLines} * ${lh} + 2 * var(--kui-sf-p, 0px) + ${clearance})`
                  : `calc(${maxLines} * ${lh} + 2 * var(--kui-sf-p, 0px))`,
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
          style={{
            fontFamily: "var(--font-mono)",
            // On the PRE, not the pane: `.kd-line` bleeds to the pane's inset and puts it
            // back, so growing the pane's own padding would move every line wash with it.
            ...(band ? { paddingBlockStart: clearance } : {}),
          }}
        >
          <code>{children}</code>
        </Text>
      </ScrollArea>
      {/* AFTER the scroller, and that order is load-bearing rather than tidy. Both boxes are
          positioned — the row absolutely, and `.kui-scroll-area` `relative` for its thumbs —
          and neither states a z-index, so the LATER one paints on top and takes the pointer.
          With the row written first the code well sat over it: measured, `elementFromPoint`
          at the name button's centre returned the `<pre>`, and neither button could be
          pressed. Moving it is the fix rather than a z-index, because a number here would be
          the ladder §20 exists to avoid — and DOM order already says everything needed.

          The pane is the row's containing block: `.kd-code-well` states `position: relative`
          in code.css, beside the rest of the well's own geometry. */}
      {topbar}
      {footer}
    </>
  );

  /* HOSTED IS A PLAIN BOX, and everything it drops is a thing the host already draws. What it
     keeps is `position: relative` (through `.kd-code-well` in code.css) for the floating chrome,
     and it states `--kui-sf-p: 0px` — the hook is deliberately inheriting (it is how `m="bleed"`
     reaches a child), so without this the code would re-pad itself by the HOST's inset and the
     line wash would bleed against a wall that is not there. Zero is the identity, not a chosen
     length: there is no pane inset to undo. */
  return hosted ? (
    /* TWO ELEMENTS, and the outer one is not decoration. The inner box must zero `--kui-sf-p`
       (it has no inset of its own — the host pads), and a custom property cannot read its own
       inherited value on the element that redeclares it: both declarations would resolve
       against the cascaded value on that element, which is the zero. So the outer captures the
       HOST's inset under a name of its own, and the chrome reaches back out by it — which is
       what keeps "floating chrome sits closer to the wall than the code" true in a well that
       has no wall. */
    <div style={{ "--kd-host-p": "var(--kui-sf-p, 0px)" } as React.CSSProperties}>
      <div
        className="kd-code-well kd-code-hosted"
        style={{ "--kui-sf-p": "0px" } as React.CSSProperties}
      >
        {body}
      </div>
    </div>
  ) : (
    <Surface size={size} className="kd-code-well">
      {body}
    </Surface>
  );
}
