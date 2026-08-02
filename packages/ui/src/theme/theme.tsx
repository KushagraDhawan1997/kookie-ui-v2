"use client";

import * as React from "react";

import type { RenderElement } from "../system/render.ts";

export type Appearance = "light" | "dark" | "inherit";
export type Density = "compact" | "default" | "comfortable";
export type RadiusLevel = "none" | "small" | "medium" | "large" | "full";
export type Contrast = "normal" | "high";
/** §16 — `auto` follows `@media (pointer: coarse)`; pinning forces a geometry, which is also how the coarse matrix is judged on a desktop. */
export type Pointer = "fine" | "coarse" | "auto";

export type ThemeProps = {
  appearance?: Appearance;
  density?: Density;
  radius?: RadiusLevel;
  contrast?: Contrast;
  pointer?: Pointer;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Put the theme on an element you already have, rather than adding a wrapper (§5). */
  render?: RenderElement;
};

type Resolved = Required<
  Pick<ThemeProps, "appearance" | "density" | "radius" | "contrast" | "pointer">
>;

const DEFAULTS: Resolved = {
  appearance: "light",
  density: "default",
  radius: "medium",
  contrast: "normal",
  pointer: "auto",
};

const ThemeContext = React.createContext<Resolved>(DEFAULTS);

export const useTheme = () => React.useContext(ThemeContext);

/**
 * Scopes the design tokens (§5). Nestable, and inherits every prop it is not given, which is
 * what makes a subtree theme cheap: a denser toolbar or an airier hero is a Theme on an element
 * that already exists, via `render`, not a new wrapper and not a per-component prop.
 *
 * It renders a real element because the tokens are scoped by attribute selectors and an
 * attribute needs a node to live on.
 *
 * Each prop maps to one data attribute, and the generated stylesheet does the rest — density
 * re-declares the control family, radius re-prices the palette, contrast shifts the bands.
 * They compose rather than race, because no two of them write the same token (§6, §12).
 */
export function Theme({ children, className, style, render, ...props }: ThemeProps) {
  const parent = useTheme();

  const resolved = React.useMemo<Resolved>(
    () => ({
      appearance: props.appearance ?? parent.appearance,
      density: props.density ?? parent.density,
      radius: props.radius ?? parent.radius,
      contrast: props.contrast ?? parent.contrast,
      pointer: props.pointer ?? parent.pointer,
    }),
    [props.appearance, props.density, props.radius, props.contrast, props.pointer, parent],
  );

  // `inherit` means "whatever the nearest ancestor resolved to", so it emits no attribute of
  // its own and lets the outer scope keep applying.
  // Every resolved axis is stamped on ONE element, always — the generated cells select on
  // attribute combinations, and a custom property reference resolves where it is declared,
  // so the pair (or triple) has to co-locate for the combined selector to exist (§6, §16).
  const attrs: Record<string, string> = {
    ...(resolved.appearance !== "inherit" ? { "data-appearance": resolved.appearance } : {}),
    "data-density": resolved.density,
    "data-radius": resolved.radius,
    "data-contrast": resolved.contrast,
    "data-pointer": resolved.pointer,
  };

  const merged = { ...attrs, className, style };

  return (
    <ThemeContext.Provider value={resolved}>
      {render ? (
        React.cloneElement(render, {
          ...merged,
          className: [render.props.className, className].filter(Boolean).join(" ") || undefined,
          children,
        })
      ) : (
        <div {...merged}>{children}</div>
      )}
    </ThemeContext.Provider>
  );
}
