"use client";

import { Separator as BaseSeparator } from "@base-ui/react/separator";
import * as React from "react";

export type SeparatorProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseSeparator>,
  // `children` — a separator separates; it has no content. The labelled divider ("— or —")
  // is a composition, not a prop: a Flex row of two separators and a Text.
  //
  // No `tone`, `emphasis`, `material` or `size` to refuse: §11's table gives the row no
  // axes at all ("reads a border token"), so the type never grows them. Length is likewise
  // not API — the container decides it, the same sentence that refuses margin everywhere.
  "children" | "className"
> & {
  /** Dresses the line. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * A separator (§11) — the quiet hairline as its own element.
 *
 * The whole component is Base UI's `role="separator"` div wearing two tokens: the tone-less
 * `--color-border` (minted with Checkbox; §11 promised this row "a border token") and the
 * scaled `--border-width`. It is deliberately NOT on the solved control edge — the edge order
 * (§7, 2026-08-07) pins separators with cards to the quiet hairline under both solved tiers,
 * because nothing's identity rests on this line.
 *
 * `orientation` forwards to Base UI (default horizontal), which stamps `data-orientation` for
 * the stylesheet and `aria-orientation` for AT. This does not contradict Slider's refusal of
 * the same prop: that refusal was priced on vertical needing its own designed geometry set,
 * and a vertical hairline is the same two tokens with the axes swapped — zero designed values.
 *
 * `render` stays open (non-interactive, RadioGroup's precedent). Radix's `decorative` is
 * deliberately omitted: a purely visual rule that must not reach AT is not a Separator, it is
 * a styled Box — the escape that already exists.
 */
export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <BaseSeparator
      className={className ? `kui-separator ${className}` : "kui-separator"}
      {...props}
    />
  );
}
