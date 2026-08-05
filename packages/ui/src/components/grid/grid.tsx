"use client";

import { Box, type BoxProps } from "../box/box.tsx";

/**
 * Flexbox's axis vocabulary does not exist here — `direction` and `wrap` are flex concepts a
 * real grid ignores, and the silence is exactly what the named primitives turn into type
 * errors (§3). `align`/`justify` stay: they are shared by both layout models.
 */
export type GridProps = Omit<BoxProps, "display" | "direction" | "wrap"> & {
  /** Grid participates in text flow as `inline-grid`; the tier-switching `display` lives on Box. */
  display?: "grid" | "inline-grid";
};

/**
 * A grid container, typed to grid's vocabulary (§3). Sugar over Box: preset `display`,
 * narrowed props, zero CSS of its own.
 */
export function Grid({ display = "grid", ...props }: GridProps) {
  return <Box display={display} {...props} />;
}
