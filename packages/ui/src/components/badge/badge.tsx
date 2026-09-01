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
  /**
   * EMPTY IS NOT THE SAME AS BARE, and the type cannot tell them apart (ultracode audit
   * 2026-09-01). `<Badge>{count > 0 && count}</Badge>` is the commonest spelling of a
   * conditional badge, and at zero — where the caller means "no badge" — `children` is
   * `false`, which the `Counted` arm accepts because `React.ReactNode` admits
   * `false | null | undefined`. Measured: it rendered a 6.3px accent disc with a null
   * `aria-label` and empty text, an unnamed coloured dot, which is WCAG 1.4.1's own case and
   * the one thing this component's type exists to prevent. `{""}` did it without even the
   * `data-dot` stamp.
   *
   * So the runtime closes what the union cannot: a badge with no content renders only if it
   * was NAMED. Named, an empty badge is exactly the dot the bare form means — `<Badge
   * aria-label="Unread" />` and `<Badge aria-label="Unread">{n || null}</Badge>` are the same
   * marker. Unnamed, it renders nothing at all, which is Chip's own answer to the identical
   * four inputs (`chip.tsx`, 2026-08-23) and is what the caller meant by writing the
   * condition. ZERO is content and still renders: `{0}` is a count.
   */
  const empty = children === undefined || children === null || children === false || children === "";
  if (empty && !props["aria-label"]) return null;
  const bare = empty;
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
