"use client";

import * as React from "react";

import type { Tone } from "../../system/axes.ts";
import type { TypeSize } from "../text/text.tsx";

type BadgeBase = Omit<React.ComponentPropsWithoutRef<"span">, "color" | "children"> & {
  /**
   * A step on the type ramp, 1–9, and OPTIONAL with no default: unset, a badge is a share of
   * the line it sits in — the tab label, the row, the avatar it is pinned to — so it is never
   * priced twice. Set it only when it stands alone.
   */
  size?: TypeSize;
  /**
   * What the badge means, in the system's own vocabulary: `accent` (the default) for
   * "something is here", `destructive` for "something needs you", `warning`, `success`, `info`
   * or any family. It is the same closed set every tone-carrying component reads, so an app
   * maps its own words onto it — "alert" is `destructive` — and the system never learns them.
   */
  tone?: Tone;
  ref?: React.Ref<HTMLSpanElement>;
};

/**
 * A bare badge is a DOT, and a dot is colour alone, so it must be named: what a sighted
 * reader infers from the marker, the accessible name states. With content — a count, a short
 * word — the content is the name and no label is required.
 */
type Bare = { children?: undefined; "aria-label": string };
type Counted = { children: React.ReactNode; "aria-label"?: string };

export type BadgeProps = BadgeBase & (Bare | Counted);

/**
 * The platform's badge (§11, §38): a count or a dot that waits on a thing until you look —
 * the red number on an app icon, the unread dot on a tab. Bare, it is a dot; with a number
 * it is a pill; both are LOUD by identity (a marker that whispers is not one), sized as a
 * share of the line they sit in, and there is no emphasis to lower and no tone beyond the two
 * meanings a waiting marker has.
 *
 * It is not a label. "Paid", "Failed", "Beta" beside a row are a `Chip`, which carries the
 * full tone set and reads as a word. A badge counts, or points.
 *
 * Pinned to something, the host places it: `<Avatar badge={<Badge>3</Badge>} />` — the host
 * owns the corner and the cut-out, the badge owns only itself.
 */
export function Badge({ size, tone = "accent", className, children, ...props }: BadgeProps) {
  const bare = children === undefined || children === null || children === false;
  return (
    <span
      data-size={size}
      data-tone={tone}
      data-dot={bare || undefined}
      className={className ? `kui-type kui-badge ${className}` : "kui-type kui-badge"}
      {...props}
    >
      {bare ? null : children}
    </span>
  );
}
