"use client";

import * as React from "react";

import type { Emphasis, Size, Tone } from "./axes.ts";
import { useClipWarning } from "./clip.tsx";
import { useLensRef } from "./refraction.tsx";
import { useMergedRefs } from "./render.ts";
import { useSize } from "./size.ts";
import { GlassScope, useMaterial } from "../theme/theme.tsx";

/**
 * What a component of your own asks the system for (2026-11-11, Kushagra: "why cant I
 * programatically extend any react component to inherit the glass, pairing, and checks").
 *
 * Only the system's own words. There is no colour, no corner, no shadow and no border here, and
 * the absence is the design: with those a second way to build a Card would be one call away,
 * and a thing built a second way drifts out of reach of a fix (surface.tsx says the same of
 * a ground).
 */
export type UseSurfaceOptions = {
  /** The size step of the padding and the corner. The default is the size around it. */
  size?: Size;
  /** What the surface means. The default is `neutral`. */
  tone?: Tone;
  /**
   * How loud the fill is. `loud` is the tone's solid fill, `medium` is its soft tint and `quiet`
   * is the plain surface. The text inside always takes the colour that reads on that fill. The
   * default is `quiet`.
   */
  emphasis?: Emphasis;
  /**
   * Set it when the element sits over a picture or other content. It then takes the theme's
   * material, which is glass when the theme's `material` is below `9`. Left out, it follows the
   * region it is in, as every component does.
   */
  backdrop?: boolean;
  /** Your own class for the element's layout. The hook joins it to the system's. */
  className?: string;
  /** Your own ref to the element. The hook needs the element too, so pass yours here. */
  ref?: React.Ref<HTMLElement>;
};

/** What `useSurface` hands back. */
export type SurfaceHandle = {
  /** Spread these on your element. Pass your own class and ref to the hook, not after these. */
  props: {
    ref: (node: HTMLElement | null) => void;
    className: string;
    "data-size": Size;
    "data-tone": Tone;
    "data-emphasis": Emphasis;
    "data-material": string | undefined;
  };
  /**
   * Wrap the element's children in this. It tells the components inside that they sit on this
   * surface, so a button on your glass does not ask for glass a second time.
   */
  scope: (children: React.ReactNode) => React.ReactNode;
};

/**
 * Gives an element of your own what Card, Chip and Button take from the system: the theme's
 * material where it sits over content, a fill for its `tone` and `emphasis` with text that reads
 * on it, and the development warning when its content is clipped.
 *
 * ```tsx
 * function Today({ children }: { children: React.ReactNode }) {
 *   const surface = useSurface({ tone: "accent", emphasis: "loud", backdrop: true });
 *   return <span {...surface.props}>{surface.scope(children)}</span>;
 * }
 * ```
 *
 * The element's layout is yours: its width, its height and where it sits. Its fill, its text
 * colour, its padding step and its corner are the system's.
 */
export function useSurface(options: UseSurfaceOptions = {}): SurfaceHandle {
  const { size: sizeOption, tone = "neutral", emphasis = "quiet", backdrop, className, ref } = options;
  const size = useSize(sizeOption);
  // The component's own resolution, unchanged: an explicit `backdrop` first, the region second.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  const lensRef = useLensRef<HTMLElement>(material, ref);
  const clipRef = useClipWarning("surface made with useSurface");
  const setRef = useMergedRefs(lensRef, clipRef);
  const scope = React.useCallback(
    (children: React.ReactNode) => <GlassScope material={material}>{children}</GlassScope>,
    [material],
  );
  return {
    props: {
      ref: setRef,
      className: className ? `kui-surface ${className}` : "kui-surface",
      "data-size": size,
      "data-tone": tone,
      "data-emphasis": emphasis,
      // Absent on a solid surface, as on every component: solid is the lack of a material.
      "data-material": material === "solid" ? undefined : material,
    },
    scope,
  };
}
