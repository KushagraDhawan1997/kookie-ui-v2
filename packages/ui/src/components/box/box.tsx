"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import { resolveBoxProps, type BoxStyleProps } from "../../system/resolve.ts";

export type BoxProps = BoxStyleProps &
  Omit<React.ComponentPropsWithoutRef<"div">, keyof BoxStyleProps> & {
    /** Render into an element you already have, instead of adding a wrapper (§5). */
    render?: RenderElement;
    ref?: React.Ref<HTMLElement>;
    /**
     * Make this Box measurable: responsive values (`{ initial, sm, md, lg }`) on anything
     * inside resolve against THIS Box's width instead of the nearest measurable ancestor
     * (the Theme root, absent a nearer one).
     *
     * The trade, imposed by CSS itself: a measurable box can never size itself around its
     * contents — its width must come from outside. Put `container` on things layout already
     * sizes (a sidebar with a width, a main column that grows, a grid cell), or state
     * `width` / `flexGrow` / `flexBasis` yourself. A container Box left to shrink-wrap
     * (e.g. as a plain flex-row item) renders ZERO pixels wide; dev builds warn when that
     * happens (§2).
     */
    container?: boolean;
  };

/**
 * The layout engine and the sanctioned escape hatch (§3).
 *
 * Box carries the full curated prop set, container props included, so a responsive flex-to-grid
 * switch is expressible; Flex, Grid and Stack are typed sugar that preset `display` and narrow
 * these types. It is also where one-off spacing lives: controls own no outer spacing, and
 * `<Box m="4"><Button/></Box>` is the honest spelling of a positioning decision — a wrapper you
 * can see in review rather than a margin prop buried on a control.
 *
 * Anything not in the prop table is one `style={{ }}` away, and consumer `style` merges last:
 * an escape that loses to the default is not an escape.
 */
export function Box(props: BoxProps) {
  const { ref, render, className, style: userStyle, container, ...rest } = props;
  const { style, rest: domProps } = resolveBoxProps(rest);

  // Dev-only: a container Box whose width was worked out from its contents is 0px wide —
  // the one composition the opt-in cannot save (§2). The check fires at the moment it
  // breaks, which docs cannot; stripped from production builds.
  const probeRef = React.useRef<HTMLElement | null>(null);
  const composedRef = React.useCallback(
    (node: HTMLElement | null) => {
      probeRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [ref],
  );
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production" || !container) return;
    const el = probeRef.current;
    if (!el || !el.hasChildNodes()) return;
    const display = getComputedStyle(el).display;
    if (display === "none" || display === "contents") return;
    if (el.getBoundingClientRect().width === 0) {
      console.warn(
        "[kookie-ui] A <Box container> rendered 0px wide. A container can't size itself " +
          "around its contents — give it `width`, `flexGrow`, or a definite grid track, " +
          "or let a column/stack stretch it.",
      );
    }
  }, [container]);

  const merged = {
    ref: process.env.NODE_ENV !== "production" && container ? composedRef : ref,
    className: className ? `kui-box ${className}` : "kui-box",
    style: { ...style, ...userStyle },
    ...(container ? { "data-container": "" } : null),
    ...domProps,
  };

  if (render) return composeRender(render, merged as never);

  return <div {...(merged as React.ComponentPropsWithRef<"div">)} />;
}
