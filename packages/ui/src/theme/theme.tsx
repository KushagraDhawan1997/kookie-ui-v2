"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../system/render.ts";

export type Appearance = "light" | "dark" | "inherit";
export type Density = "compact" | "default" | "comfortable";
export type RadiusLevel = "none" | "small" | "medium" | "large" | "full";
export type Contrast = "normal" | "high";
/** §16, §17 — `auto` follows `@media (pointer: coarse)`; pinning forces the whole coarse
    world — geometry AND the handheld type band, which is also how both are judged on a
    desktop. There is no separate `device` prop: coarse means handheld (dropped 2026-08-05,
    LOG records what to bring back if a touch-at-a-distance case ever needs the two apart). */
export type Pointer = "fine" | "coarse" | "auto";
/** §10 — do surfaces sit up, and (since 2026-08-07) do raised controls catch light. The
    semantic is elevation-as-identity; the palette rows behind it — 3 for surfaces, 2 for
    controls — are merely its current resolution. An app choice made once, never a per-card
    knob. */
export type Surfaces = "flat" | "elevated";
/** §19 — the resting dress of the one-look families (surfaces, fields, marks): does the app
    draw their boundary as a hairline or as a darkened well. Border on a CONTROL is rank
    (Button's `bordered`) and stays a prop; this axis never touches ranked chrome. */
export type Look = "outlined" | "filled";

export type ThemeProps = {
  appearance?: Appearance;
  density?: Density;
  radius?: RadiusLevel;
  contrast?: Contrast;
  pointer?: Pointer;
  surfaces?: Surfaces;
  look?: Look;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Put the theme on an element you already have, rather than adding a wrapper (§5).
      Never `<body>` or `<html>`: portals land at `document.body`, and a theme ON the body
      contains its own portals — the stacking frame inverts silently and an app z-index
      covers every popup (§20). A dev-build warning fires if you do. */
  render?: RenderElement;
};

/** Same fold as Box's container warning: bundlers replace NODE_ENV, production drops it. */
const DEV = typeof process === "undefined" || process.env?.NODE_ENV !== "production";

/** §20 — the one Theme placement the stacking frame cannot survive. A portal's home is
    `document.body`; a theme rendered ONTO body (or html) makes every portal its DOM
    descendant, so "portals paint above the app" quietly becomes a z-index war again. */
const warnOnBodyMount = (node: HTMLElement | null) => {
  if (!DEV || !node) return;
  // Tag, not identity against document.body: identity would go quiet exactly where the
  // mistake is made (frameworks own THE body; a test can only ever mount a nested one).
  if (node.tagName === "BODY" || node.tagName === "HTML") {
    console.warn(
      "[kookie-ui] <Theme> is mounted on <body>/<html>. Portalled popups land inside this " +
        "theme, so the stacking frame cannot hold them above app content (§20). Mount the " +
        "theme on an element inside <body> instead.",
    );
  }
};

type Resolved = Required<
  Pick<
    ThemeProps,
    "appearance" | "density" | "radius" | "contrast" | "pointer" | "surfaces" | "look"
  >
>;

const DEFAULTS: Resolved = {
  appearance: "light",
  density: "default",
  radius: "medium",
  contrast: "normal",
  pointer: "auto",
  surfaces: "flat",
  look: "outlined",
};

/**
 * `contrastSet` is not an axis — it records whether anyone ever CHOSE the contrast axis.
 * `@media (prefers-contrast: more)` has to reach a theme that never asked for a contrast, and
 * has to leave alone one that explicitly asked for `normal`. The generated guard spells that
 * as `:not([data-contrast="normal"])`, which only works if an unconfigured Theme stamps no
 * attribute at all — so the flag decides whether the attribute is written (§7).
 */
type Ctx = Resolved & { contrastSet: boolean };

const ThemeContext = React.createContext<Ctx>({ ...DEFAULTS, contrastSet: false });

export const useTheme = (): Resolved => React.use(ThemeContext);

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
  // The internal context, not useTheme(): Theme needs `contrastSet`, which is bookkeeping for
  // the platform-signal guard and deliberately not part of the public shape.
  const parent = React.use(ThemeContext);

  const resolved = React.useMemo<Resolved>(
    () => ({
      appearance: props.appearance ?? parent.appearance,
      density: props.density ?? parent.density,
      radius: props.radius ?? parent.radius,
      contrast: props.contrast ?? parent.contrast,
      pointer: props.pointer ?? parent.pointer,
      surfaces: props.surfaces ?? parent.surfaces,
      look: props.look ?? parent.look,
    }),
    // The seven fields, not `parent` itself: the parent ctx is a fresh object whenever ANY
    // ancestor axis moves, including ones this scope overrides — depending on the identity
    // would rebuild `resolved` (and so re-render every consumer below) on changes that
    // cannot reach it.
    [
      props.appearance,
      props.density,
      props.radius,
      props.contrast,
      props.pointer,
      props.surfaces,
      props.look,
      parent.appearance,
      parent.density,
      parent.radius,
      parent.contrast,
      parent.pointer,
      parent.surfaces,
      parent.look,
    ],
  );

  const contrastSet = props.contrast !== undefined || parent.contrastSet;

  const ctx = React.useMemo<Ctx>(() => ({ ...resolved, contrastSet }), [resolved, contrastSet]);

  // `inherit` means "whatever the nearest ancestor resolved to", so it emits no attribute of
  // its own and lets the outer scope keep applying.
  // Every resolved axis is stamped on ONE element, always — the generated cells select on
  // attribute combinations, and a custom property reference resolves where it is declared,
  // so the pair (or triple) has to co-locate for the combined selector to exist (§6, §16).
  const attrs: Record<string, string> = {
    ...(resolved.appearance !== "inherit" ? { "data-appearance": resolved.appearance } : {}),
    "data-density": resolved.density,
    "data-radius": resolved.radius,
    ...(contrastSet ? { "data-contrast": resolved.contrast } : {}),
    "data-pointer": resolved.pointer,
    "data-surfaces": resolved.surfaces,
    "data-look": resolved.look,
  };

  // kui-theme makes the element a query container (§2): responsive props measure the nearest
  // ancestor Box OR Theme, so a tiered Box directly under a Theme has a slot to read.
  const themeClass = className ? `kui-theme ${className}` : "kui-theme";
  const merged = { ...attrs, className: themeClass, style, ref: warnOnBodyMount };

  return (
    <ThemeContext.Provider value={ctx}>
      {render ? composeRender(render, merged, children) : <div {...merged}>{children}</div>}
    </ThemeContext.Provider>
  );
}
