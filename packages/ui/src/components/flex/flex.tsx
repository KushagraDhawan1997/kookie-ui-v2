"use client";

import { Box, type BoxProps } from "../box/box.tsx";

/**
 * Grid's container vocabulary does not exist here: raw CSS would accept `grid-template-columns`
 * on a flexbox and ignore it silently, and the named primitives are where that silence becomes
 * a type error (§3). Box remains the escape for a responsive flex-to-grid switch.
 */
export type FlexProps = Omit<BoxProps, "display" | "columns" | "rows" | "areas" | "flow"> & {
  /** Flex participates in text flow as `inline-flex`; the tier-switching `display` lives on Box. */
  display?: "flex" | "inline-flex";
};

/**
 * A flex container, typed to flexbox's vocabulary (§3). Sugar over Box: preset `display`,
 * narrowed props, zero CSS of its own.
 */
export function Flex({ display = "flex", ...props }: FlexProps) {
  return <Box display={display} {...props} />;
}
