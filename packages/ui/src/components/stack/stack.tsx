"use client";

import * as React from "react";

import { Box, type BoxProps } from "../box/box.tsx";

/**
 * Stack is the vertical case, so the axis props do not exist: `direction` would make it a Flex
 * with a different name, `wrap` has no meaning in a single column, and the axis-split gaps
 * (`gapX`/`gapY`) collapse to `gap` when there is only one axis (§3).
 */
export type StackProps = Omit<
  BoxProps,
  "display" | "direction" | "wrap" | "gapX" | "gapY" | "columns" | "rows" | "areas" | "flow"
>;

/**
 * Vertical flow with a gap — the most common layout in any interface, named for its intent (§3).
 * Sugar over Box: preset column flexbox, narrowed props, zero CSS of its own.
 */
export const Stack = React.forwardRef<HTMLElement, StackProps>(function Stack(props, ref) {
  return <Box ref={ref} display="flex" direction="column" {...props} />;
});
