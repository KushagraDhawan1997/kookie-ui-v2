"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { Surface } from "../surface/surface.tsx";
import { Text } from "../text/text.tsx";
import type { Size } from "../../system/axes.ts";
import { useSize } from "../../system/size.ts";

export type CodeBlockProps = ComponentRefusals & {
  /** The code. Plain text, or the spans a highlighter produced from it. */
  children: React.ReactNode;
  /**
   * The size step of the code block, from `1` to `4`. It sets the padding, the corner and the
   * text size of the code. It also sets the height of a line for `maxLines`.
   */
  size?: Size;
  /** A class name for the `<pre>` element. Put a syntax highlighter's classes here. For space
      around the block, wrap it in a `Box` with `m`. */
  className?: string;
  /**
   * The maximum height of the block, in lines of code. Longer code scrolls. No line is
   * hidden, so users can reach all lines with the mouse, the keyboard or a screen reader.
   */
  maxLines?: number;
  /**
   * Content for a row at the top of the block, such as a file name, a language chip or a copy
   * button. The row floats over the code. Pass the content only: the block positions the row.
   * If the row goes across the full width, also set `band`.
   */
  topbar?: React.ReactNode;
  /** Content for a row at the bottom of the block, such as an expand button or a status
      line. Pass the content only: the block positions the row. */
  footer?: React.ReactNode;
  /**
   * Moves the code down so that the `topbar` row doesn't cover the first line. Set it when the
   * row goes across the full width, such as a file name on one side and a button on the other.
   * Don't set it for one button in a corner.
   */
  band?: boolean;
  /**
   * Removes the block's own background, border and padding. Set it when the block is already
   * inside a panel of the same kind, such as a `Surface`. The parent panel then supplies the
   * background, the corner and the padding.
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
  size: sizeProp,
  className,
  maxLines,
  topbar,
  footer,
  band,
  hosted,
  style,
  ref,
}: CodeBlockProps) {
  const size = useSize(sizeProp);
  // `--line-height-N` is the line box of the size-N Text below — one index, two spellings.
  const lh = `var(--line-height-${size})`;
  /* The chrome's safe area, in the tokens the chrome is built from: the row's own inset, one
     control height, and that inset again down to the first line. No number is picked here —
     change the row's padding or the control ladder and this follows.

     AND IT ACTUALLY FOLLOWS NOW. That sentence was false for a day: it named `--layout-space-4`
     while the stylesheet had moved the rows to the pane's inset, so the band came up short by
     twice the difference and the first line of code rested exactly on the controls — zero gap,
     found by eye. `--kui-cb-chrome-p` is the one home for that inset; the rows read it and so
     does this.

     MINUS THE INSET THE SCROLLER ALREADY GIVES. The viewport re-pads by `--kui-sf-p` after
     bleeding to the pane's walls, so stacking the whole band on top of that rests the code
     three times too far below the chrome. This is the distance still OWED, not the distance
     wanted.

     `max()` because a small enough size makes the pane's own inset the larger of the two, and
     a negative padding is not a thing — there the scroller's re-pad already clears the row
     and nothing more is owed. */
  const clearance = `max(0px, calc(2 * var(--kui-cb-chrome-p) + var(--control-height-${size}) - var(--kui-sf-p, 0px)))`;

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
