"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import { CHEVRON_DOWN_PATH, GLYPH_VIEWBOX } from "../../system/glyphs.ts";
import { useSize } from "../../system/size.ts";
import { glyphStroke } from "../../tokens/config.ts";
import { Button, type ButtonProps } from "../button/button.tsx";
import { Menu, MenuContent, MenuTrigger } from "../menu/menu.tsx";

/**
 * A button with a second action attached: the label runs the common case, the chevron opens the
 * rest. One box split in two, each half its own control.
 */
export type SplitButtonProps = ComponentRefusals &
  Omit<ButtonProps, "iconOnly" | "render" | "nativeButton" | "trailing" | "done" | "aria-label" | "aria-labelledby"> & {
    /** The other actions: `MenuItem`s, groups and separators, exactly what `MenuContent` holds. */
    menu: React.ReactNode;
    /** The chevron half's name. Required, because that half has no words of its own. */
    menuLabel: string;
  };

/**
 * A primary action with its alternatives one press away.
 *
 * Both halves are real Buttons at the same size, tone and emphasis, so they read as one control
 * and press as two. The menu opens under the whole button, aligned to its end.
 */
export function SplitButton({
  size: sizeProp,
  menu,
  menuLabel,
  className,
  style,
  disabled,
  ...props
}: SplitButtonProps) {
  const size = useSize(sizeProp);
  const shared = {
    size,
    ...(props.tone === undefined ? {} : { tone: props.tone }),
    ...(props.emphasis === undefined ? {} : { emphasis: props.emphasis }),
    ...(props.bordered === undefined ? {} : { bordered: props.bordered }),
    ...(props.backdrop === undefined ? {} : { backdrop: props.backdrop }),
    ...(disabled === undefined ? {} : { disabled }),
  };
  return (
    <span
      className={className ? `kui-split-button ${className}` : "kui-split-button"}
      data-size={size}
      style={style}
    >
      <Button {...props} {...shared} className="kui-split-button-action" />
      <Menu size={size}>
        <MenuTrigger
          render={
            <Button {...shared} iconOnly aria-label={menuLabel} className="kui-split-button-menu">
              <svg viewBox={GLYPH_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path
                  d={CHEVRON_DOWN_PATH}
                  stroke="currentColor"
                  strokeWidth={glyphStroke}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          }
        />
        <MenuContent align="end">{menu}</MenuContent>
      </Menu>
    </span>
  );
}
