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
 * gradient — a scrollable well with a scrollbar already says "more". The overlay hangs from
 * a positioned wrapper OUTSIDE the pane (an overlay inside it breaks the surface layer's
 * scroller bleed — see the element), offset by the same inset token the pane pads with.
 *
 * `aria-expanded` and nothing more: the bounded well still scrolls, so no content is ever
 * hidden from anyone — the button changes how much is in view, not what exists. That is why
 * this is not a disclosure pattern and takes none of its wiring.
 */
import * as React from "react";
import { Box, Button, Flex, type Size } from "@kookie-ui/react";

import { CodeBlock } from "./code-block";

export function Expandable({
  size,
  maxLines,
  lineCount,
  className,
  children,
}: {
  size: Size;
  maxLines: number;
  lineCount: number;
  className?: string | undefined;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <Box style={{ position: "relative" }}>
      <CodeBlock
        size={size}
        {...(expanded ? {} : { maxLines })}
        {...(className ? { className } : {})}
      >
        {children}
      </CodeBlock>
      <Flex
        justify="center"
        style={{
          position: "absolute",
          insetInline: 0,
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
    </Box>
  );
}
