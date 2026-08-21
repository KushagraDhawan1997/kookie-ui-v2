"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../system/render.ts";
import { CardScopeReset } from "../system/nesting.tsx";
import { MATERIALS, type Material } from "../system/axes.ts";

/**
 * EVERY THEME AXIS AND EVERY VALUE IT TAKES — one home, and the unions derive from it
 * (2026-08-16, generalising the `DEPTHS` move earlier the same day).
 *
 * Each axis used to be a bare union, so a value list existed nowhere and anyone who needed
 * one wrote it out: eight law files each carried their own depth pair, and both docs surfaces
 * carried their own copy of all seven axes. Those copies cannot fail — they agree today and
 * go quietly stale the moment an axis widens, which is precisely what a widened axis needs
 * catching. The docs restated them because they HAD to: the lists were not exported, so the
 * entropy was forced rather than chosen.
 *
 * The shape deliberately mirrors `themeDefaults` below, key for key, and a law asserts the
 * two agree — a default outside its own axis's list would be unreachable.
 *
 * NOT to be confused with the harness's `POINTERS` / `APPEARANCES` in test/browser.tsx, which
 * are a different fact wearing similar names: those are the RESOLVED worlds a law walks
 * (`fine | coarse`, `light | dark`), and they deliberately exclude `auto` and `inherit`,
 * which are instructions about where to look rather than values anything resolves to.
 */
export const themeAxes = {
  appearance: ["inherit", "light", "dark"],
  density: ["compact", "default", "comfortable"],
  radius: ["none", "small", "medium", "large", "full"],
  contrast: ["normal", "high"],
  /** §16, §17 — `auto` follows `@media (pointer: coarse)`; pinning forces the whole coarse
      world — geometry AND the handheld type band, which is also how both are judged on a
      desktop. There is no separate `device` prop: coarse means handheld (dropped 2026-08-05,
      LOG records what to bring back if a touch-at-a-distance case ever needs the two apart). */
  pointer: ["fine", "coarse", "auto"],
  /** §10 — does light exist: do surfaces sit up, and (since 2026-08-07) do raised controls
      catch it. The semantic is elevation-as-identity; the palette rows behind it — 3 for
      surfaces, 2 for controls — are merely its current resolution. An app choice made once,
      never a per-card knob. Named `depth` since 2026-08-10: it was `surfaces`, which named the
      family it dresses rather than the question it answers, and that name was needed by the
      look axis's own halves. */
  depth: ["flat", "elevated"],
  /* The look axis is GONE from this table (§19): `controlLook` deleted 2026-08-19 (the
     fill-first flip made its two values byte-identical), `surfaceLook` deleted 2026-08-20
     (its non-default value was never judged or used — the lab's borderless pane is the one
     surface identity). Fields and marks wear the dress unconditionally; a card rests on the
     seal with `--surface-edge` stood down, and conformance/flat re-declare that role. */
  /** §10 — see the prop's own note below. `solid` is a member: it is the seal, the rung where
      light stops passing through, not the absence of a material. */
  material: MATERIALS,
} as const;

export type Appearance = (typeof themeAxes.appearance)[number];
export type Density = (typeof themeAxes.density)[number];
export type RadiusLevel = (typeof themeAxes.radius)[number];
export type Contrast = (typeof themeAxes.contrast)[number];
export type Pointer = (typeof themeAxes.pointer)[number];
export type Depth = (typeof themeAxes.depth)[number];

/** Kept as its own export because eight law files import it by name; it IS `themeAxes.depth`,
    and a law asserts the two are the same array rather than two lists that agree. */
export const DEPTHS = themeAxes.depth;

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
  /** §5, §7 — which palette this scope resolves against. `inherit` is the third value and it
      is not a no-op: it emits no attribute at all, so the nearest ancestor keeps applying —
      which is exactly what the dark-SSR design needs. A pre-paint inline script owns
      `data-appearance` on `<html>`, the root Theme inherits it, and there is one source of
      truth with no flash and nothing for hydration to mismatch. Set it to pin a section
      against the document: a light panel inside a dark app is `appearance="light"` here. */
  appearance?: Appearance;
  /** §3, §12 — how tightly the app breathes. It re-picks the layout-space steps every
      distance reads and re-declares the control family's designed heights and paddings; it
      deliberately reaches NEITHER type, the icon box, nor a mark, which are content and would
      otherwise answer the same question twice. An app identity chosen once — a denser toolbar
      is a nested Theme on an element that already exists, never a prop per control. */
  density?: Density;
  /** §6 — the corner identity, one app-wide choice. Each level is a designed palette rather
      than a factor, re-declared per family, so `none` squares every corner that is DRESS
      while the four that are role semantics hold their shape (a radio, the two grips, and the
      channel a round grip nests in). `full` STATES the capsule per cell — half the control's
      own height — rather than asking CSS to clamp a huge number against the rendered box. */
  radius?: RadiusLevel;
  /** §7 — the CONFORMANCE surface, not a design knob. At rest a border or a fill is dress,
      judged by eye and held to no floor; `high` is where the floors bind, re-solving the tone
      bands, the control and field edges and the track to their conformance tiers, and leaning
      on the glass rather than unmaking it (§10). Left UNSET the Theme stamps no attribute,
      which is what lets `@media (prefers-contrast: more)` reach the scope; asking for
      `normal` is an explicit opt-out of that platform signal. */
  contrast?: Contrast;
  /** §16, §17 — which pointer world this scope is priced for. `auto` follows
      `@media (pointer: coarse)`. Pinning forces the WHOLE world, not just the touch targets:
      the coarse geometry, the wider control cells, the mark ladder and §17's handheld type
      band all move together, which is both what a phone actually needs and how those cells
      get judged on a desktop. There is no `device` prop — coarse means handheld. */
  pointer?: Pointer;
  /** §5, §10 — does light exist in this app: whether surfaces sit up off the page and raised
      controls catch it. Elevation is an app identity and never a per-card knob — no call site
      chooses a shadow — so this is the one sanctioned consumer of the shadow palette, and
      `flat` spells the no-op layers rather than deleting the rules. */
  depth?: Depth;
  /** The subtree the scope covers. The Theme renders a real element to carry its attributes,
      because the tokens are scoped by attribute selectors and an attribute needs a node. */
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
    "appearance" | "density" | "radius" | "contrast" | "pointer" | "depth" | "material"
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
  /* `elevated` since 2026-08-17 (Kushagra: match the lab). The lab has no flat world —
     contact, drop, blast and the pool are what its material IS, so the resting default
     casts. `depth="flat"` survives as the opt-out. */
  depth: "elevated",
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
 *
 * TRI-STATE since 2026-08-17 (selectivity, Kushagra: "cards have no reason to have thin
 * material, yet if I want dropdown menu to have thin material, I am forced to use it on
 * theme"). The scope now records what kind of pane is above: `"glass"` (backdrop spent —
 * members go on-glass), `"solid"` (an opaque pane — members are on calm ground and resolve
 * solid, paying nothing), or `null` (no pane — the element sits on whatever the app put
 * behind it, and expresses the theme's material if its kind warrants it).
 */
const PaneContext = React.createContext<"glass" | "solid" | null>(null);

/**
 * The resolution a member gets when a glass ancestor already spent the backdrop: the veil's
 * alpha, no backdrop-filter, no lens. It is a RESOLVED value, never an authorable one — it
 * is deliberately absent from `Material` and from `themeAxes`, because nothing may ask for
 * it and a Theme that could set it would be re-introducing glass-on-glass by the back door.
 */
export const ON_GLASS = "on-glass";
export type SurfaceMaterial = Material | typeof ON_GLASS;

/**
 * Marks a REGION where content passes behind the components in it (2026-08-17, Kushagra:
 * "a button should behave non glassy until it's over a hostile background — there is no
 * point of having a glass button unless there is something behind to refract"). Placement
 * is a fact about a PLACE, not about each control: a toolbar floating over a canvas is
 * marked once, and every button, field and select inside it expresses the theme's material;
 * the same toolbar in a sidebar is solid, pays no backdrop-filter and builds no lens.
 * Provided by `<Box backdrop>`; a component's own `backdrop` prop is the one-off escape.
 */
export const BackdropContext = React.createContext<boolean>(false);

/**
 * The material this element should stamp. SELECTIVE since 2026-08-17 (Kushagra): material is
 * priced where a backdrop exists, never everywhere the theme reaches.
 *
 *   on a GLASS pane   → `on-glass` (backdrop spent: the veil's alpha, no filter — 2026-08-16,
 *                       "a glass element acting on top of glass renders solid WITH ALPHA")
 *   on a SOLID pane   → `solid` BY DEFAULT, because the pane resets the ambient region — but
 *                       an explicit statement made inside the pane (the `backdrop` prop, a
 *                       `<Box backdrop>` opened within, the hook's own argument) resolves the
 *                       theme's material: a solid surface HOSTS glass (2026-08-19, Kushagra)
 *   no pane above     → `backdrop ? theme material : solid`. A floating pane is over content
 *                       by construction and always passes true; an in-flow component reads
 *                       its own `backdrop` prop first and the ambient BackdropContext second,
 *                       so a marked region turns a whole toolbar's controls to glass while a
 *                       bare control on calm ground resolves solid and pays nothing. This
 *                       replaced the express-by-default resolution the same day it shipped —
 *                       a glass control on a calm card had nothing to refract and still paid
 *                       a full readback per element.
 *
 * Public, because a consumer's own pane is a first-class case (Kushagra, 2026-08-16: "I want
 * consumers to be easily be able to add materials on their custom components"): the whole of
 * it is `<div className="kui-surface" data-material={useMaterial({ backdrop: true })} />`.
 */
export function useMaterial(opts?: { backdrop?: boolean }): SurfaceMaterial {
  const { material } = React.use(ThemeContext);
  const pane = React.use(PaneContext);
  const region = React.use(BackdropContext);
  if (pane === "glass") return material === "solid" ? "solid" : ON_GLASS;
  // A SOLID pane is not an arm of its own (2026-08-19, Kushagra: "the whole point of a solid
  // surface is to be able to host glass"). Glass-on-glass is physics — the backdrop is spent,
  // so the glass arm above overrides the author. Solid-hosts-nothing was only ever an
  // INFERENCE ("nothing passes behind an opaque pane"), and an explicit `backdrop` — the
  // prop, a `<Box backdrop>` region opened INSIDE the pane, or `useMaterial({backdrop:true})`
  // — is the author contradicting that inference in writing: a map or a feed composed inside
  // a card is exactly §10's case list. The inference survives as the DEFAULT because
  // GlassScope resets BackdropContext below: a region marked OUTSIDE the pane never leaks
  // through it, so an unmarked control on a solid card still resolves solid and pays nothing.
  return (opts?.backdrop ?? region) ? material : "solid";
}

/** Marks a subtree as sitting on a pane. Every member that paints marks — a glass pane so its
    members go on-glass, a solid pane so its members know they stand on calm ground and stop
    expressing the theme's material (the selectivity rule's second half: a button on an opaque
    card never wears glass the card itself refused). */
export function GlassScope({ material, children }: { material: SurfaceMaterial; children: React.ReactNode }) {
  // The pane RESETS the region (2026-08-19): its own face is the ground its members stand on,
  // so a `<Box backdrop>` marked outside it stops at its edge — on a solid pane because the
  // pane sealed that backdrop away, on a glass pane because the backdrop is spent. A member
  // that wants glass INSIDE a pane states its own placement (the prop, or a fresh region
  // opened inside), which is also what keeps a nested <Theme> honest: Theme resets the pane
  // mark for portals, and without this reset that made an in-flow nested Theme inside a glass
  // card re-open glass-on-glass through the stale outer region.
  return (
    <PaneContext.Provider value={material === "solid" ? "solid" : "glass"}>
      <BackdropContext.Provider value={false}>{children}</BackdropContext.Provider>
    </PaneContext.Provider>
  );
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
      material: props.material ?? parent.material,
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
      props.depth,
      props.material,
      parent.appearance,
      parent.density,
      parent.radius,
      parent.contrast,
      parent.pointer,
      parent.depth,
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
  };

  // kui-theme makes the element a query container (§2): responsive props measure the nearest
  // ancestor Box OR Theme, so a tiered Box directly under a Theme has a slot to read.
  const themeClass = className ? `kui-theme ${className}` : "kui-theme";
  const merged = { ...attrs, className: themeClass, style, ref: warnOnBodyMount };

  // The pane mark resets here, deliberately: a Theme is a new world, and the portal wrapper
  // IS a bare Theme (§20), which is what lets a menu opened from inside a glass card be glass
  // again while a field composed inside that card stays opaque.
  return (
    <ThemeContext.Provider value={ctx}>
      <PaneContext.Provider value={null}>
        {/* A Theme is a fresh plane (2026-08-21). The card mark is cleared for the same
            reason the pane mark is: a portalled panel renders its own bare Theme, so a Card
            inside a menu or a dialog opened FROM a card is an ordinary card rather than a
            nested one. Context only, so this adds no DOM. */}
        <CardScopeReset>
          {render ? composeRender(render, merged, children) : <div {...merged}>{children}</div>}
        </CardScopeReset>
      </PaneContext.Provider>
    </ThemeContext.Provider>
  );
}
