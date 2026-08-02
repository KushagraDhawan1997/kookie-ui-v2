import * as React from "react";

export type SpinnerProps = Omit<React.ComponentPropsWithoutRef<"span">, "children">;

/**
 * A busy indicator (§8). One element, no SVG, no JS — it reads `currentColor`, so it is
 * already the right colour in every tone, emphasis and appearance.
 *
 * Inside a control it takes the icon box for the resolved size, so swapping it in for an icon
 * shifts no layout. Standalone it falls back to the size-2 box.
 *
 * Decorative by default: `aria-hidden`, because the control that owns it carries `aria-busy`
 * and announcing the same state twice is noise.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-hidden
      className={className ? `kui-spinner ${className}` : "kui-spinner"}
      {...props}
    />
  );
});
