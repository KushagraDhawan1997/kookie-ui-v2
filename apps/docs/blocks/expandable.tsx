"use client";

/**
 * The expand control for a bounded code block. Behaviour, so it lives in the block layer —
 * the element only knows how to BE bounded (`maxLines`, scrollable); whether to lift the
 * bound is a choice, and this is the one piece of state it takes.
 *
 * WHETHER THE BUTTON APPEARS IS DECIDED ON THE SERVER, not by measurement: the caller counts
 * its lines against the bound and only mounts this wrapper when the bound binds. v1 measured
 * `scrollHeight` in an effect with no dependency array — the toggle popped in after first
 * paint and re-ran on every render — and the whole class of defect disappears when the
 * deciding fact is the line count the renderer already holds.
 *
 * THE BUTTON FLOATS BOTTOM-CENTRE OVER THE PANE, AS GLASS (Kushagra, 2026-08-26): a floating
 * control over content takes `backdrop`, so the code passes behind it legibly, and no
 * gradient — a scrollable well with a scrollbar already says "more". It goes to the element as
 * `footer` and hangs from the WELL, beside the topbar (2026-09-01) — the two chrome rows used
 * to float against two different boxes, which is a difference nothing states and which the
 * bleed turns into a visible one.
 *
 * `aria-expanded` and nothing more: the bounded well still scrolls, so no content is ever
 * hidden from anyone — the button changes how much is in view, not what exists. That is why
 * this is not a disclosure pattern and takes none of its wiring.
 */
import * as React from "react";
import { Button, Flex, type Size } from "@kookie-ui/react";

import { CodeBlock } from "./code-block";

export function Expandable({
  size,
  maxLines,
  lineCount,
  className,
  topbar,
  band,
  hosted,
  children,
}: {
  size: Size;
  maxLines: number;
  lineCount: number;
  className?: string | undefined;
  /** Passed straight through — the chrome belongs to the well, and this only bounds it. */
  topbar?: React.ReactNode;
  /** Passed straight through — whether that chrome spans is the block's answer, not the bound's. */
  band?: boolean;
  /** Passed straight through — whether the well draws its own pane is the host's answer. */
  hosted?: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <CodeBlock
      size={size}
      {...(expanded ? {} : { maxLines })}
      {...(topbar ? { topbar } : {})}
      {...(band ? { band } : {})}
      {...(hosted ? { hosted } : {})}
      {...(className ? { className } : {})}
      footer={
        <Flex
          justify="center"
          style={{
            position: "absolute",
            insetInline: 0,
            /* THE PANE'S OWN INSET, AND NO ARITHMETIC (2026-09-01, Kushagra: "the button still
               has more padding than code sample").

               Measured: the standalone twin's button sat 16px off its pane wall and a hosted
               well's sat 41 — the host's inset counted twice, the scrollbar fault of the same
               morning one element over. The cause was the BOX, not the number: this row used to
               hang from a positioned wrapper around the well, and the bleed's negative bottom
               margin COLLAPSES out of the well onto that wrapper (measured: wrapper bottom
               1374, well bottom 1398, pane 1399). So the well's box already coincides with the
               pane's and the wrapper's is short by exactly the inset.

               A compensating term was written first and measured 8px BELOW the pane's wall,
               which is the same mistake being made a third time. Hung from the well, the plain
               inset is right in both arrangements — 16 and 16, from each pane's own padding
               box. */
            insetBlockEnd: `var(--surface-p-${size})`,
          }}
        >
          <Button
            size={size}
            backdrop
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less" : `Show all ${lineCount} lines`}
          </Button>
        </Flex>
      }
    >
      {children}
    </CodeBlock>
  );
}
