"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import * as React from "react";

import { useLensRef } from "../../system/refraction.tsx";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { glyphStroke } from "../../tokens/config.ts";
import type { TypeSize } from "../text/text.tsx";

export type AvatarProps = Omit<React.ComponentPropsWithoutRef<"span">, "color"> & {
  /**
   * A step on the type ramp, 1–9, and OPTIONAL with no default: unset, an avatar is exactly
   * one line of the text beside it, so the one next to a name in a list is list-sized and the
   * one in a profile header is header-sized with nothing said twice. Set it when the avatar
   * stands alone.
   */
  size?: TypeSize;
  /** The picture. When it has not loaded, or fails, the fallback shows in its place. */
  src?: string;
  /**
   * What the picture is, for someone who cannot see it. Defaults to empty, which marks the
   * image decorative — right when the person's name is written beside it, which is where an
   * avatar usually is. State the name here when the avatar is the only thing naming them.
   */
  alt?: string;
  /**
   * What shows when there is no picture: initials, usually. Unset, a generic person glyph.
   * A string is drawn at the avatar's own type step; anything else is placed as given.
   */
  fallback?: React.ReactNode;
  /**
   * A `Badge` pinned to the top-end of the disc — a count, or a bare dot. The avatar owns
   * the corner and the cut-out (a ring in the surface colour, the group's own); the badge owns
   * only itself. A word beside the avatar is a Chip in the row, not this.
   */
  badge?: React.ReactNode;
  /** Says that content passes behind this avatar, so the theme's material can show through its
   *  fallback face (a picture is opaque and covers it). Unset, it follows the surrounding
   *  `<Box backdrop>` region — Chip's wiring. */
  backdrop?: boolean;
  ref?: React.Ref<HTMLSpanElement>;
};

/* The generic person, on the package's 16-grid at the derived glyph stroke — the tick's and
   the carets' own sentence (§4, §8). A head and shoulders, nothing more. */
function PersonGlyph() {
  return (
    <svg
      className="kui-avatar-glyph"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="8" cy="5.5" r="2.75" stroke="currentColor" strokeWidth={glyphStroke} />
      <path
        d="M2.75 14a5.25 5.25 0 0 1 10.5 0"
        stroke="currentColor"
        strokeWidth={glyphStroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A person, a team or a thing, shown as a small picture with something to fall back to
 * (§11, §35). Base UI carries the loading machine — the image is shown once it has loaded,
 * and the fallback stands in before that and after a failure — and this system carries the
 * box: one line tall, the atom family's own height, a circle, the neutral soft wash under the
 * initials.
 *
 * It is inert. An avatar you can press is a `Button` or a `Card` with an avatar inside it,
 * and a status dot beside one is a `Chip` with a word in it (WCAG 1.4.1: a bare dot is
 * colour carrying meaning on its own).
 */
export function Avatar({
  size,
  src,
  alt = "",
  fallback,
  badge,
  backdrop,
  className,
  ref,
  ...props
}: AvatarProps) {
  // §10 — the app says what things are built of; an avatar only states placement.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  const lensRef = useLensRef<HTMLElement>(material, ref);
  return (
    <BaseAvatar.Root
      ref={lensRef}
      data-size={size}
      // The atom fill reads the tone indirection, so a family is stamped — and it is always
      // neutral: `tone` was a prop for one day (2026-08-31) and moved only the initials' ink,
      // too weak to be the per-person colour anyone wants and the strong version (a tinted
      // wash) is refused system-wide. Colour-as-identity is the picture's job.
      data-tone="neutral"
      data-weight="medium"
      data-material={material === "solid" ? undefined : material}
      className={className ? `kui-type kui-atom kui-avatar ${className}` : "kui-type kui-atom kui-avatar"}
      {...props}
    >
      {src !== undefined ? <BaseAvatar.Image src={src} alt={alt} className="kui-avatar-image" /> : null}
      {/* THE FALLBACK CARRIES THE NAME, OR CARRIES NOTHING (2026-09-01, ultracode audit).
          Whichever of the two is showing has to answer for the same thing, and the fallback
          answered for neither: with `alt="Kushagra"` and a picture that never loaded, the
          element rendered exactly `<span>KD</span>` — a reader heard "K D" and never the name
          the caller supplied; with the default `alt=""`, documented as decorative, the same
          span emitted a bare "KD" into the line beside the person's name. The picture's own
          `alt` is the one place a name is stated, so the fallback reads it: named, it is an
          image OF that person (`role="img"` prunes the initials, which are a rendering of the
          name and not a second fact); unnamed, it is decorative, exactly as the `PersonGlyph`
          inside it has always been. */}
      <BaseAvatar.Fallback
        className="kui-avatar-fallback"
        {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
      >
        {fallback ?? <PersonGlyph />}
      </BaseAvatar.Fallback>
      {badge !== undefined && badge !== null ? (
        <GlassScope material={material}>
          <span className="kui-avatar-badge">{badge}</span>
        </GlassScope>
      ) : null}
    </BaseAvatar.Root>
  );
}

export type AvatarGroupProps = Omit<React.ComponentPropsWithoutRef<"span">, "color"> & {
  /**
   * One step for every avatar in the group. The group is a line of text with no words in
   * it, and each unset avatar takes that line — so the size is said once, here, and an
   * avatar that states its own still wins.
   */
  size?: TypeSize;
  ref?: React.Ref<HTMLSpanElement>;
};

/**
 * Several avatars, overlapped (§35): each later one sits a share of a face over the one
 * before it, wearing a ring in the surface colour so the faces read as separate discs. That
 * is the whole component. How many to show, and the "+3" that stands for the rest, are the
 * caller's — the rest is `<Avatar fallback="+3" />`, which is already the right shape.
 */
export function AvatarGroup({ size, className, ...props }: AvatarGroupProps) {
  return (
    <span
      data-size={size}
      className={className ? `kui-type kui-avatar-group ${className}` : "kui-type kui-avatar-group"}
      {...props}
    />
  );
}
