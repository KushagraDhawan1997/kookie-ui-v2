"use client";

import type { RadixReflexRefusals } from "../../system/refused.ts";
import { Box, type BoxProps } from "../box/box.tsx";

/**
 * Props for `Stack`. A stack is always a vertical column, so it has no `direction` or `wrap`.
 * Use `gap` for the space between items. For a row, use `Flex`.
 */
export type StackProps = RadixReflexRefusals & Omit<
  BoxProps,
  "display" | "direction" | "wrap" | "gapX" | "gapY" | "columns" | "rows" | "areas" | "flow"
>;

/**
 * Vertical flow with a gap — the most common layout in any interface, named for its intent (§3).
 * Sugar over Box: preset column flexbox, narrowed props, zero CSS of its own.
 */
export function Stack(props: StackProps) {
  return <Box display="flex" direction="column" {...props} />;
}
