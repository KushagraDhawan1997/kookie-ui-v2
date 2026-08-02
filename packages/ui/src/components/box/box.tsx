"use client";

import * as React from "react";

import type { RenderElement } from "../../system/render.ts";
import { resolveBoxProps, type BoxStyleProps } from "../../system/resolve.ts";

export type BoxProps = BoxStyleProps &
  Omit<React.ComponentPropsWithoutRef<"div">, keyof BoxStyleProps> & {
    /** Render into an element you already have, instead of adding a wrapper (§5). */
    render?: RenderElement;
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
export const Box = React.forwardRef<HTMLElement, BoxProps>(function Box(props, ref) {
  const { render, className, style: userStyle, ...rest } = props;
  const { style, rest: domProps } = resolveBoxProps(rest);

  const merged = {
    ref,
    className: className ? `kk-box ${className}` : "kk-box",
    style: { ...style, ...userStyle },
    ...domProps,
  };

  if (render) {
    return React.cloneElement(render, {
      ...merged,
      className: [render.props.className, merged.className].filter(Boolean).join(" "),
      style: { ...merged.style, ...render.props.style },
    });
  }

  return <div {...(merged as React.ComponentPropsWithRef<"div">)} />;
});
