"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import type { Size } from "../../system/axes.ts";
import * as React from "react";

import { SizeScopeContext, useSize } from "../../system/size.ts";

/**
 * Buttons drawn as one box: the outer corners round, the inner ones square, a hairline between
 * each pair. The buttons keep every state of their own; the group only joins them.
 */
export type ButtonGroupProps = ComponentRefusals &
  Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
    /** The size step of the buttons in the group, from `1` to `4`. A `size` that you set on
     *  a button wins. */
    size?: Size;
    ref?: React.Ref<HTMLDivElement>;
  };

/**
 * A set of related actions drawn as one control.
 *
 * Put `Button`s inside. The dividers are drawn by the group, so there is no separator to place.
 */
export function ButtonGroup({ size: sizeProp, className, children, ref, ...props }: ButtonGroupProps) {
  const size = useSize(sizeProp);
  return (
    <div
      ref={ref}
      role="group"
      data-size={size}
      className={className ? `kui-button-group ${className}` : "kui-button-group"}
      {...props}
    >
      <SizeScopeContext.Provider value={size}>{children}</SizeScopeContext.Provider>
    </div>
  );
}
