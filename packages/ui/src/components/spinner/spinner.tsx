import * as React from "react";

export type SpinnerProps = Omit<React.ComponentPropsWithoutRef<"svg">, "children">;

/** Eight spokes on a 24-unit grid: a 2-wide rounded bar from radius 4.5 out to radius 10. */
const SPOKES = Array.from({ length: 8 }, (_, i) => ({
  angle: i * 45,
  // The trail. It stops at 0.15 rather than 0 because the faintest spokes still carry the
  // shape — a ring that fades to nothing reads as a comet, not as an indicator.
  opacity: (1 - (i / 8) * 0.85).toFixed(2),
}));

/**
 * A busy indicator (§8): eight spokes with a fading trail, ticking one spoke at a time.
 *
 * Drawn as geometry rather than gradients, because a conic gradient can only make angular
 * wedges and this shape is parallel-sided bars — the earlier gradient version was the wrong
 * primitive, not a tuning problem. The eight rects are static: they rasterise once and then
 * animate as a single composited rotation, so the per-frame cost is one transform regardless.
 *
 * It fills with `currentColor`, so it is the label's colour in every tone, emphasis and
 * appearance without referencing a token of its own. Inside a control it takes the icon box
 * for the resolved size, so swapping it in for an icon shifts no layout; standalone it falls
 * back to the size-2 box.
 *
 * Decorative by default: `aria-hidden`, because the control that owns it carries `aria-busy`
 * and announcing the same state twice is noise.
 */
export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
  { className, ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      aria-hidden
      className={className ? `kui-spinner ${className}` : "kui-spinner"}
      {...props}
    >
      {SPOKES.map(({ angle, opacity }) => (
        <rect
          key={angle}
          x="11"
          y="2"
          width="2"
          height="5.5"
          rx="1"
          opacity={opacity}
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  );
});
