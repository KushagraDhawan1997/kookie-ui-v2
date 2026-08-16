"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../system/render.ts";
import type { Material } from "../system/axes.ts";

export type Appearance = "light" | "dark" | "inherit";
export type Density = "compact" | "default" | "comfortable";
export type RadiusLevel = "none" | "small" | "medium" | "large" | "full";
export type Contrast = "normal" | "high";
/** §16, §17 — `auto` follows `@media (pointer: coarse)`; pinning forces the whole coarse
    world — geometry AND the handheld type band, which is also how both are judged on a
    desktop. There is no separate `device` prop: coarse means handheld (dropped 2026-08-05,
    LOG records what to bring back if a touch-at-a-distance case ever needs the two apart). */
export type Pointer = "fine" | "coarse" | "auto";
/** §10 — does light exist: do surfaces sit up, and (since 2026-08-07) do raised controls catch
    it. The semantic is elevation-as-identity; the palette rows behind it — 3 for surfaces, 2
    for controls — are merely its current resolution. An app choice made once, never a per-card
    knob. Named `depth` since 2026-08-10: it was `surfaces`, which named the family it dresses
    rather than the question it answers, and that name is now needed by the look axis's own
    halves.

    A value LIST as well as a union, for the reason `SIZES` and `RUNGS` are lists in
    system/axes.ts: the laws walk the axis, and eight of them were each restating this
    literal — so a third rung would have shipped covered by nothing, in eight files that
    all still passed. The union derives from the list, so the two cannot disagree. */
export const DEPTHS = ["flat", "elevated"] as const;
export type Depth = (typeof DEPTHS)[number];
/** §19 — the resting dress of a one-look family: does the app draw a boundary as a hairline or
    as a darkened well. Border on a CONTROL is rank (Button's `bordered`) and stays a prop; this
    axis never touches ranked chrome. Asked twice, of two family groups — see the props. */
export type Look = "outlined" | "filled";

export type ThemeProps = {
  /** §10 — OF WHAT MATERIAL IS THIS APP BUILT (2026-08-16, Kushagra; moved here from nine
      component props). One value for the whole scope: a table and a chair made of the same
      oak are the same oak, so a dialog and a menu under one theme are the same glass, and
      there is no per-family rung to walk and no ceiling to hit at `thick`.

      What makes a dialog read heavier than a menu is therefore NOT its material — it is
      coverage and the scrim. The same glass over 900px of application obscures far more than
      the same glass over a 170px menu, and a dialog additionally pushes the page back behind
      a scrim it already owns. Nothing needed a second thickness to say that.

      `solid` is the default and is a material, not the absence of one: it is the rung where
      light stops passing through. That is also why this is not a boolean — `glass` would
      still owe a thickness beside it, which is two props for one fact.

      The value reaches components through CONTEXT and each component stamps its own
      `data-material`; the Theme writes no material attribute of its own. The selectors stay
      element-keyed, which is what the `@property inherits: false` guards in recipes.css were
      built for — a descendant-keyed rule would make every control inside a glass pane paint
      its container's veil, the defect those guards already fixed four times. */
  material?: Material;
  appearance?: Appearance;
  density?: Density;
  radius?: RadiusLevel;
  contrast?: Contrast;
  pointer?: Pointer;
  depth?: Depth;
  /** §19 — how the app draws a resting SURFACE: cards, and the panels that wear a card's
      identity (menus, select). */
  surfaceLook?: Look;
  /** §19 — how the app draws a resting CONTROL: fields and marks, which move together because
      a filled input beside an outlined checkbox reads as an accident. */
  controlLook?: Look;
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
  warnOnFramedAncestor(node);
};

/**
 * §20's SECOND unsurvivable placement (added 2026-08-09, audit).
 *
 * `isolation: isolate` makes the outermost `.kui-theme` a stacking context whose own
 * `z-index` is `auto` — it paints at step 8. An ancestor that is positioned with a POSITIVE
 * z-index paints at step 9, and step 9 beats step 8 regardless of DOM order, so a
 * body-level portal lands underneath app content: exactly the failure the frame exists to
 * prevent, and the frame cannot see it, because a stacking context says nothing about where
 * it paints among its own siblings.
 *
 * CSS cannot fix it — the frame cannot reach outside itself — so the answer is the same one
 * §20 already gives the body case: a dev-build warning at the one moment the shape is
 * visible. Measured boundary, and the warning matches it exactly: `z-index: 1+` inverts;
 * `z-index: 0` does NOT (the shell becomes a stacking context at step 8 too and loses on DOM
 * order, so Tailwind's `z-0` is safe), and neither does a stacking context created without a
 * z-index (`isolation`, `transform`, `opacity`). Warning on those would be noise, and a
 * warning that cries wolf is one nobody reads.
 */
const warnOnFramedAncestor = (node: HTMLElement) => {
  // Only the frame itself: a nested Theme is not the stacking context and has no claim.
  if (!node.matches?.(".kui-theme:not(.kui-theme *)")) return;
  for (let el: HTMLElement | null = node; el && el !== document.body; el = el.parentElement) {
    const cs = getComputedStyle(el);
    const z = Number.parseInt(cs.zIndex, 10);
    if (cs.position === "static" || !Number.isFinite(z) || z <= 0) continue;
    console.warn(
      `[kookie-ui] <Theme> sits inside a positioned element with z-index: ${z} ` +
        `(<${el.tagName.toLowerCase()}>). The stacking frame cannot lift portalled popups ` +
        "above it — they will paint underneath app content (§20). Remove the z-index, or " +
        "set it to 0, or move the Theme outside that element.",
    );
    return;
  }
};

type Resolved = Required<
  Pick<
    ThemeProps,
    "appearance" | "density" | "radius" | "contrast" | "pointer" | "depth" | "surfaceLook" | "controlLook" | "material"
  >
>;

/**
 * What a Theme resolves when nobody chooses (§5). EXPORTED since 2026-08-09, the day the
 * radius default moved to `full` and two docs surfaces kept rendering `medium`: the preview's
 * environment panel and /matrix each held their own copy of these values, which is the
 * two-homes drift in the one place whose job is showing what the system does. A consumer
 * that needs a concrete starting value derives it from here; nobody restates it.
 */
export const themeDefaults: Resolved = {
  appearance: "light",
  density: "default",
  radius: "full",
  contrast: "normal",
  pointer: "auto",
  depth: "flat",
  surfaceLook: "outlined",
  controlLook: "outlined",
  material: "solid",
};

/**
 * `contrastSet` is not an axis — it records whether anyone ever CHOSE the contrast axis.
 * `@media (prefers-contrast: more)` has to reach a theme that never asked for a contrast, and
 * has to leave alone one that explicitly asked for `normal`. The generated guard spells that
 * as `:not([data-contrast="normal"])`, which only works if an unconfigured Theme stamps no
 * attribute at all — so the flag decides whether the attribute is written (§7).
 */
type Ctx = Resolved & { contrastSet: boolean; rooted: boolean };

const ThemeContext = React.createContext<Ctx>({ ...themeDefaults, contrastSet: false, rooted: false });

export const useTheme = (): Resolved => React.use(ThemeContext);

/**
 * Is there a real `<Theme>` above this point? (§20, added 2026-08-09.)
 *
 * `useTheme()` cannot answer it: the default context is a full `Resolved` set, so an
 * un-themed tree and a tree under `<Theme appearance="light">` are indistinguishable — which
 * is exactly what made the portal wrapper a defect. A wrapper that re-stamps every axis is
 * right when a React Theme chose those axes and wrong when nobody did, because the axes are
 * then carried on the DOM (`<html data-appearance="dark">`, the standalone path the emitted
 * stylesheet promises and `card.browser.test.tsx` law-enforces) and `<html>` is an ancestor
 * of the portal's landing spot already. Measured before the fix: a dark, elevated, compact
 * document opened a white, flat, default-density menu.
 *
 * Not exported from the package: a consumer has no use for it, and the question it answers is
 * about our own portalling, not about the theme.
 */
export const useThemeRooted = (): boolean => React.use(ThemeContext).rooted;

/**
 * GLASS DOES NOT STACK ON GLASS (§10, 2026-08-15/16, Kushagra: "generally, glass on glass
 * doesn't be allowed"), enforced structurally rather than by asking a call site.
 *
 * A pane reads as glass because it defocuses what is BEHIND it. Put a second pane on top and
 * there is nothing left to defocus — the backdrop it samples has already been blurred by its
 * parent — so the child spends a full readback to blur an already-blurred image and reads as
 * a sticker. That is a fact about nesting, which is exactly the kind of thing a component
 * cannot know about itself and a consumer should never have to declare.
 *
 * So a member that paints a veil marks its subtree, and every member below it resolves solid.
 * A `<Theme>` RESETS the mark, which is what makes portals correct: `MenuContent` renders a
 * bare Theme inside its portal (§20), so a menu opened from a glass card is glass again — it
 * paints over the page, not inside the card — while a field composed inside that same card is
 * opaque, with nobody having typed anything.
 */
const GlassContext = React.createContext(false);

/**
 * The material this element should stamp — the theme's, or `solid` if a glass ancestor
 * already spent the backdrop.
 *
 * Public, because a consumer's own pane is a first-class case (Kushagra, 2026-08-16: "I want
 * consumers to be easily be able to add materials on their custom components"). The whole of
 * it is `<div className="kui-surface" data-material={useMaterial()} />` — the same shape
 * Kookie's own surfaces use, with the nesting rule already applied.
 */
export function useMaterial(): Material {
  const { material } = React.use(ThemeContext);
  const insideGlass = React.use(GlassContext);
  return insideGlass ? "solid" : material;
}

/** Marks a subtree as sitting on spent backdrop. Rendered by every member that paints a veil;
    the provider is skipped entirely when the material is `solid`, so an opaque card costs
    nothing and does not stand its children down. */
export function GlassScope({ material, children }: { material: Material; children: React.ReactNode }) {
  if (material === "solid") return children;
  return <GlassContext.Provider value={true}>{children}</GlassContext.Provider>;
}

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
      depth: props.depth ?? parent.depth,
      surfaceLook: props.surfaceLook ?? parent.surfaceLook,
      controlLook: props.controlLook ?? parent.controlLook,
      material: props.material ?? parent.material,
    }),
    // The nine fields, not `parent` itself: the parent ctx is a fresh object whenever ANY
    // ancestor axis moves, including ones this scope overrides — depending on the identity
    // would rebuild `resolved` (and so re-render every consumer below) on changes that
    // cannot reach it.
    [
      props.appearance,
      props.density,
      props.radius,
      props.contrast,
      props.pointer,
      props.depth,
      props.surfaceLook,
      props.controlLook,
      props.material,
      parent.appearance,
      parent.density,
      parent.radius,
      parent.contrast,
      parent.pointer,
      parent.depth,
      parent.surfaceLook,
      parent.controlLook,
      parent.material,
    ],
  );

  const contrastSet = props.contrast !== undefined || parent.contrastSet;

  const ctx = React.useMemo<Ctx>(
    () => ({ ...resolved, contrastSet, rooted: true }),
    [resolved, contrastSet],
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
    ...(contrastSet ? { "data-contrast": resolved.contrast } : {}),
    "data-pointer": resolved.pointer,
    "data-depth": resolved.depth,
    "data-surface-look": resolved.surfaceLook,
    "data-control-look": resolved.controlLook,
  };

  // kui-theme makes the element a query container (§2): responsive props measure the nearest
  // ancestor Box OR Theme, so a tiered Box directly under a Theme has a slot to read.
  const themeClass = className ? `kui-theme ${className}` : "kui-theme";
  const merged = { ...attrs, className: themeClass, style, ref: warnOnBodyMount };

  // The glass mark resets here, deliberately: a Theme is a new world, and the portal wrapper
  // IS a bare Theme (§20), which is what lets a menu opened from inside a glass card be glass
  // again while a field composed inside that card stays opaque.
  return (
    <ThemeContext.Provider value={ctx}>
      <GlassContext.Provider value={false}>
        {render ? composeRender(render, merged, children) : <div {...merged}>{children}</div>}
      </GlassContext.Provider>
    </ThemeContext.Provider>
  );
}
