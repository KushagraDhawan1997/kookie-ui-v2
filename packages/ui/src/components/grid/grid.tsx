"use client";

import type { RadixReflexRefusals } from "../../system/refused.ts";
import { Box, type BoxProps } from "../box/box.tsx";

/**
 * Props for `Grid`. It has no `direction` or `wrap`, because a grid ignores them. `align` and
 * `justify` work as on `Flex`.
 */
export type GridProps = RadixReflexRefusals & Omit<BoxProps, "display" | "direction" | "wrap"> & {
  /** Set `inline-grid` to place the grid in a line of text. Defaults to `grid`. For a
      `display` that changes with the width, use `Box`. */
  display?: "grid" | "inline-grid";
};

/**
 * A grid container, typed to grid's vocabulary (§3). Sugar over Box: preset `display`,
 * narrowed props, zero CSS of its own.
 */
export function Grid({ display = "grid", ...props }: GridProps) {
  return <Box display={display} {...props} />;
}
