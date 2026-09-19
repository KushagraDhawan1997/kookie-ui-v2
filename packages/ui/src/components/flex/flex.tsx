"use client";

import type { RadixReflexRefusals } from "../../system/refused.ts";
import { Box, type BoxProps } from "../box/box.tsx";

/**
 * Props for `Flex`. It has no grid props, such as `columns` or `rows`. To change from flex to
 * grid at a width, use `Box`.
 */
export type FlexProps = RadixReflexRefusals & Omit<BoxProps, "display" | "columns" | "rows" | "areas" | "flow"> & {
  /** Set `inline-flex` to place the flex container in a line of text. Defaults to `flex`. For
      a `display` that changes with the width, use `Box`. */
  display?: "flex" | "inline-flex";
};

/**
 * A flex container, typed to flexbox's vocabulary (§3). Sugar over Box: preset `display`,
 * narrowed props, zero CSS of its own.
 */
export function Flex({ display = "flex", ...props }: FlexProps) {
  return <Box display={display} {...props} />;
}
