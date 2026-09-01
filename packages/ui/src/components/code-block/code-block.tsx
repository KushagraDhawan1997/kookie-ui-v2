"use client";

import * as React from "react";

import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { Surface } from "../surface/surface.tsx";
import { Text } from "../text/text.tsx";
import type { Size } from "../../system/axes.ts";

export type CodeBlockProps = {
  /** The code. Plain text, or the spans a highlighter produced from it. */
  children: React.ReactNode;
  /**
   * One index for the whole element: the pane's padding and corner, the mono step, and the
   * arithmetic the bound and the chrome's safe area are built from.
   *
   * SIZE PRICES EVERYTHING here for the reason §24/§25/§30 already state: a component that
   * owns its pane AND its text prices both. `Dialog` stops at the box because its content is
   * the caller's; a code well's content is code, and code is the one thing this element knows
   * it is holding.
   */
  size?: Size;
  /** Dresses the code element (the `<pre>`), which is where a highlighter's own classes go.
      Outer spacing is the caller's Box, never this. */
  className?: string;
  /**
   * The bound: the well's maximum height, in LINES of its own code.
   *
   * Bounded means SCROLLABLE, never clipped — every line stays reachable by wheel, keyboard
   * and assistive technology. That is what lets an expand control be a convenience rather
   * than a gate: a collapse that hides code leaves it in the tab order, and this shape makes
   * that defect inexpressible.
   *
   * No fade over the last lines. A scrollable well with a visible scrollbar already says
   * there is more.
   */
  maxLines?: number;
  /**
   * A row floating over the TOP of the pane — a file name, a language chip, a copy button.
   *
   * A NODE RATHER THAN A FLAG, because the well does not know what its chrome is. It owns the
   * pane, the mono step, the scroller and the row's BOX; what sits in the row, and how that
   * content is arranged, belongs to the caller. Pass content, not a positioned element: the
   * element places the row itself, reaching both walls and padding itself back by less than
   * the code's own inset, so the chrome reads as belonging to the pane rather than to the
   * text.
   *
   * It floats rather than sitting in flow because a translucent control exists to be legible
   * with content passing behind it. A glass row with nothing behind it is decoration wearing
   * a material's name. The platform pattern is the same one: a scroll view holds a top
   * content inset and its content passes under a translucent toolbar.
   */
  topbar?: React.ReactNode;
  /** The same row at the BOTTOM of the pane — an expand control, a status line. Both rows
      hang from the pane itself, so in a hosted well they measure from the same box: hanging
      one of them from a wrapper around the element counts the host's inset twice. */
  footer?: React.ReactNode;
  /**
   * Does the top row SPAN the pane, so the code owes it a safe area?
   *
   * A BAND IS RESERVED FOR A ROW THAT REACHES TWO WALLS, NOT FOR ONE CONTROL IN A CORNER. A
   * name at one wall and an action at the other cover the whole of the first line, so the
   * first line needs somewhere else to be. A row holding only an action occupies one corner,
   * and reserving a pane's width of clearance for it puts a hand's width of nothing in the
   * other one.
   *
   * A FLAG HERE AND A NODE ABOVE, deliberately: the well cannot read its chrome's shape off
   * the node — counting the row's children would be this element guessing at the caller's
   * arrangement. What it can be told is the one geometric fact it needs, by the code that
   * decided it.
   */
  band?: boolean;
  /**
   * The element is already inside a pane, so it draws none of its own.
   *
   * A pane inside a pane of the same kind is two grounds painting one colour, separated by a
   * hairline that says nothing — the fault §10 names when it separates a Card (an object)
   * from a Surface (what an object sits on). A code well is a ground, so a well inside a
   * ground is the same ground twice. Hosted, the HOST's pane is the well: fill, corner,
   * hairline, clip and inset all come from it, and what stays here is the one thing the host
   * cannot give — a positioning context for the floating chrome, and a scroller that reaches
   * the host's own walls.
   *
   * It is not a second appearance. The element still renders one arrangement; this says who
   * owns the box around it, the way §4 says a hosted control's geometry comes from its
   * container.
   */
  hosted?: boolean;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * A block of code in a well (§11's inert atoms one scale up, §15's third type family).
 *
 * `Code` is the inline atom — a literal inside a sentence. This is its block sibling, and the
 * two are separate components rather than one with a `block` prop for the reason `Code`'s own
 * doc states: a block owns overflow, a scroll container, a bound and a place for chrome to
 * float, none of which an inline atom can grow into without becoming two components wearing
 * one name.
 *
 * IT IS A SURFACE, NOT A CARD. The code is not an object sitting on the page, it is a well
 * recessed into it — so the pane is the ground the rest of the page's grounds are.
 *
 * DISPLAY AND POSITION ONLY. There is no state here and no behaviour: copying, expanding,
 * naming and highlighting are the caller's, and they reach the pane through `topbar`,
 * `footer` and `className`. The element ships no highlighter — see the token contract in
 * `code-block.css`, which is where a highlighter's own colours are named.
 */
export function CodeBlock({
  children,
  size = "2",
  className,
  maxLines,
  topbar,
  footer,
  band,
  hosted,
  style,
  ref,
}: CodeBlockProps) {
  // `--line-height-N` is the line box of the size-N Text below — one index, two spellings.
  const lh = `var(--line-height-${size})`;
  /* The chrome's safe area, in the tokens the chrome is built from: the row's own inset, one
     control height, and that inset again down to the first line. No number is picked here —
     change the row's padding or the control ladder and this follows.

     MINUS THE INSET THE SCROLLER ALREADY GIVES. The viewport re-pads by `--kui-sf-p` after
     bleeding to the pane's walls, so stacking the whole band on top of that rests the code
     three times too far below the chrome. This is the distance still OWED, not the distance
     wanted.

     `max()` because a small enough size makes the pane's own inset the larger of the two, and
     a negative padding is not a thing — there the scroller's re-pad already clears the row
     and nothing more is owed. */
  const clearance = `max(0px, calc(2 * var(--layout-space-4) + var(--control-height-${size}) - var(--kui-sf-p, 0px)))`;

  const body = (
    <>
      <ScrollArea
        // The scroll-edge fade: the lines dissolve under the floating chrome when there is
        // more code that way, and the resting edges stay clean. A mask, so it costs no colour
        // — the well's own fill shows through.
        fade
        // Spread, because `style` refuses an explicit undefined under
        // exactOptionalPropertyTypes.
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
            ink. The mono family and the syntax token contract are stated in the stylesheet,
            on this element: it is the one box every line of code is inside. */}
        <Text
          size={size}
          render={<pre />}
          className={className ? `kui-code-block-code ${className}` : "kui-code-block-code"}
          {...(band
            ? {
                // On the PRE, not the pane: a highlighter's line washes bleed to the pane's
                // inset and put it back, so growing the pane's own padding would move every
                // wash with it.
                style: { paddingBlockStart: clearance },
              }
            : {})}
        >
          <code>{children}</code>
        </Text>
      </ScrollArea>
      {/* AFTER the scroller, and that order is load-bearing rather than tidy. Both boxes are
          positioned — the rows absolutely, and `.kui-scroll-area` `relative` for its thumbs —
          and neither states a z-index, so the LATER one paints on top and takes the pointer.
          With a row written first the code well sits over it and no control in it can be
          pressed. Order is the fix rather than a z-index, because a number here would be the
          ladder §20 exists to avoid.

          `data-float` is what tells the surface layer these are not in flow, so the scroller
          still counts as the pane's first and last in-flow child and bleeds to both block
          edges. Without it a floating row blocks the bleed and the code can never scroll into
          the band the row is floating over. */}
      {topbar ? (
        <div className="kui-code-block-float" data-float data-edge="start">
          {topbar}
        </div>
      ) : null}
      {footer ? (
        <div className="kui-code-block-float" data-float data-edge="end">
          {footer}
        </div>
      ) : null}
    </>
  );

  /* HOSTED IS A PLAIN BOX, and everything it drops is a thing the host already draws. What it
     keeps is a positioning context for the floating chrome, and it states `--kui-sf-p: 0px` —
     the hook is deliberately inheriting (it is how `m="bleed"` reaches a child), so without
     this the code would re-pad itself by the HOST's inset. Zero is the identity, not a chosen
     length: there is no pane inset to undo.

     TWO ELEMENTS, and the outer one is not decoration. The inner box must zero `--kui-sf-p`,
     and a custom property cannot read its own inherited value on the element that redeclares
     it: both declarations would resolve against the cascaded value on that element, which is
     the zero. So the outer captures the HOST's inset under a name of its own, and the
     scroller and the chrome reach back out by it — which is what keeps "the scroller reaches
     the wall" true in a well that has no wall of its own. */
  if (hosted) {
    return (
      <div style={{ "--kui-cb-host-p": "var(--kui-sf-p, 0px)" } as React.CSSProperties}>
        <div
          ref={ref}
          className="kui-code-block"
          data-hosted=""
          data-size={size}
          style={{ "--kui-sf-p": "0px", ...style } as React.CSSProperties}
        >
          {body}
        </div>
      </div>
    );
  }

  return (
    <Surface
      size={size}
      className="kui-code-block"
      {...(ref ? { ref } : {})}
      {...(style ? { style } : {})}
    >
      {body}
    </Surface>
  );
}
