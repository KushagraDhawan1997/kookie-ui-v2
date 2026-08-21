"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import * as React from "react";

import type { Emphasis, Size, SlotName, Tone } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { filled, unwrapLazy, type RenderElement } from "../../system/render.ts";
import { Spinner } from "../spinner/spinner.tsx";

type ButtonBase = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  /**
   * §4 — an index into the control family, never a measurement. One number joins five
   * independent scales at once — the height ladder, the inline padding, the corner, the icon
   * box and the label's type step — so every control at the same index stands level with
   * every other, and re-pricing a step is one config line rather than a sweep of call sites.
   * `2` is the baseline. Density and the pointer world re-price what the index resolves to;
   * they never change what it means.
   */
  size?: Size;
  /**
   * §7 — the semantic family, and a MEANING rather than a colour: `destructive` says what
   * the press does and the theme decides the pigment, which is what lets a palette move
   * without a single call site being edited. Rests `neutral` (§11), so nothing is accent by
   * accident — an accent button is always something somebody asked for.
   */
  tone?: Tone;
  /**
   * §9 — loudness, and the only ranking axis in the system: there is no `variant`, and the
   * deletion is load-bearing — one axis cannot mean colour and prominence at once.
   *
   * Resolved for a CONTROL as fills (surfaces take the same ladder as dressing, type as
   * foreground roles): loud is the tone's solid, medium its soft wash, quiet bare. So the
   * rung ranks this button against the ones beside it, and a row of actions is read in the
   * order the fills state. Rests `medium` (§11): a screen earns one loud button by asking.
   */
  emphasis?: Emphasis;
  /** §10 — containment, orthogonal to loudness: `quiet + bordered` is the old outline. */
  bordered?: boolean;
  /** Blocks interaction and shows a Spinner, without ever hiding the label (§8). */
  loading?: boolean;
  /**
   * Leading slot. Swapped for the Spinner while loading, so nothing shifts (§8).
   *
   * Named `leading`/`trailing` rather than `icon`/`iconEnd` (renamed 2026-08-04): ENGINEERING §3
   * forbids two spellings for one axis, and TextField had already shipped the better pair. It is
   * better on the merits too — the names are RTL-correct where `End` is not, and a trailing slot
   * frequently holds a button rather than an icon, which `iconEnd` misdescribes.
   */
  leading?: React.ReactNode;
  /** Trailing slot — a chevron, a count, a control. Never replaced by the Spinner. */
  trailing?: React.ReactNode;
  /** Keep focus when the button becomes disabled mid-interaction. */
  focusableWhenDisabled?: boolean;
  /**
   * Whether the rendered element really is a `<button>`. Inferred from `render` and almost
   * never worth passing: it exists because Base UI branches its whole a11y contract on it, and
   * getting it wrong is silent. See the note on the `render` escape below.
   */
  nativeButton?: boolean;
  /** §10 — a placement fact (2026-08-17): content passes behind this button, so the theme's
   *  material may express. Unset, reads the ambient `<Box backdrop>` region. Cannot choose
   *  a material — only state that there is something to bend. */
  backdrop?: boolean;
  /** Render into an element you already have — a link, a `<summary>` (§5). The dress and the
      behaviour stay this component's; only the tag changes. Base UI branches its whole a11y
      contract on whether the result is a real `<button>`, which is inferred from what is
      passed here — see `nativeButton` for the case that cannot be inspected. */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * `iconOnly` squares the box and drops the label — the glyph goes in `children`, because for
 * this button the glyph IS the content, not an adornment beside one. That is why it is not
 * spelled through `leading`, which means "the thing to the left of a label" and would have to mean
 * two different things depending on a boolean.
 *
 * A separate `IconButton` component was the v1 answer and it failed in a specific way worth
 * recording: it was opt-in by memory, so both people and agents reached for `Button` and got a
 * pill where they wanted a square. One component cannot be forgotten.
 *
 * The union is the point of the prop, not decoration: an icon-only control has no visible text,
 * so without an accessible name a screen reader announces "button" and nothing else — the single
 * most common a11y defect in any component library. Here it does not compile. ENGINEERING §1.3:
 * types are the refusals, enforced.
 */
type IconOnly =
  | { iconOnly: true; "aria-label": string }
  | { iconOnly: true; "aria-labelledby": string };

export type ButtonProps = ButtonBase & (IconOnly | { iconOnly?: false | undefined });

/**
 * The primary control (§9, §11). Base UI supplies the semantics — real `<button>`, keyboard
 * behaviour, `data-disabled` — and every visible decision is ours, resolved through the token
 * layer: `tone` picks a family, `emphasis` picks a loudness, `size` joins five scales at one
 * index, and the stylesheet does the rest with no JS at interaction time.
 *
 * No margin prop, by construction (§3): outer spacing belongs to the layout that owns the
 * relationship. `<Box m="4"><Button/></Box>` is the honest spelling.
 *
 * Defaults are `medium` and `neutral` (§11): nothing is loud-and-accent by accident, so a
 * screen has one focal point unless somebody deliberately asks for a second.
 */
export function Button({
  size = "2",
  tone = "neutral",
  emphasis = "medium",
  bordered = false,
  loading = false,
  backdrop,
  disabled = false,
  focusableWhenDisabled,
  iconOnly,
  nativeButton,
  render,
  leading: leadingSlot,
  trailing,
  children,
  className,
  ref,
  ...props
}: ButtonProps) {
  // Base UI branches its ENTIRE a11y contract on `nativeButton`, which defaults to true, and
  // we never forwarded it — so `render={<a/>}`, a composition our own laws bless, shipped
  // `type="button"` on an anchor (where `type` means the linked resource's MIME type) and, when
  // disabled, the inert `disabled` attribute with no `aria-disabled` and tabindex 0: a
  // focusable, unannounced dead link. With it false, Base UI emits role + aria-disabled
  // instead. Inferred from the render element, overridable for the custom-component case we
  // cannot inspect.
  //
  // `render` is unwrapped FIRST (§5, 2026-08-06). An element created in a Server Component
  // crosses the RSC boundary as a lazy node — `props` undefined, `type` undefined,
  // `isValidElement` false — so both readers below get the wrong answer from it, silently and
  // in dev only. Measured against the shipped code: `render={<button className="mine"/>}` from
  // a server component rendered `class="kui-control kui-button"` with the caller's `mine`
  // DROPPED, and `role="button"` stamped onto a real <button>, with Base UI logging a warning
  // that the element it was told about is not the element it got. The fix that landed for
  // composeRender's readers (371f5b4) never reached here, because Button forwards to Base UI
  // rather than composing, and so was the one component that inspects a render element
  // without first asking what it is.
  const target = render === undefined ? undefined : unwrapLazy(render);
  const isNativeButton = nativeButton ?? (target === undefined || target.type === "button");
  // The Spinner takes the icon's place when there is one — same box, zero shift — and joins
  // the label when there is not. The label never goes: a button that stops saying what it is
  // doing is worse than one that changes width (§8).
  // §10 — the app says what things are built of; a control never does (2026-08-16). It only
  // states placement (backdrop, 2026-08-17): on calm ground it resolves solid and pays nothing.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  // §10 — the lens, prepended to the control layer's own material chain (see Card).
  const lensRef = useLensRef<HTMLElement>(material !== "solid" && material !== "on-glass", ref);
  const leading = loading ? <Spinner /> : leadingSlot;

  // Slots wear the system's adornment wrapper (`data-slot`, ENGINEERING §3) since 2026-08-05.
  // The wrapper is what lets the shared layer read structure off the DOM instead of asking the
  // component: the pill-padding rule keys "this edge starts with a slot" on it (§4, §6), and a
  // control hosted in a trailing slot gets §4's slot-inset geometry through the same selector —
  // which TextField had and Button, without the wrapper, silently did not.
  const slot = (content: React.ReactNode, which: SlotName) =>
    filled(content) ? <span data-slot={which}>{content}</span> : null;

  return (
    <BaseButton
      ref={lensRef}
      render={target}
      nativeButton={isNativeButton}
      // Loading blocks activation WITHOUT the native attribute: focusableWhenDisabled is forced
      // true here, which sends Base UI down the aria-disabled branch, and activation is stopped
      // by its preventDefault handlers instead. That is deliberate — the control stays focusable
      // and keeps its place in the tab order when a press flips it into loading (§8). Unlike
      // `pointer-events: none` the element still hit-tests, which is what makes the busy cursor
      // show. The plain `disabled` path does write the native attribute.
      disabled={disabled || loading}
      focusableWhenDisabled={focusableWhenDisabled ?? loading}
      aria-busy={loading || undefined}
      data-size={size}
      data-tone={tone}
      data-emphasis={emphasis}
      data-bordered={bordered || undefined}
      // Squares the box in the shared layer; the glyph is children, so nothing else changes.
      data-icon-only={iconOnly || undefined}
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
      data-loading={loading || undefined}
      className={className ? `kui-control kui-button ${className}` : "kui-control kui-button"}
      {...props}
    >
      {slot(leading, "leading")}
      <GlassScope material={material}>{children}</GlassScope>
      {slot(trailing, "trailing")}
    </BaseButton>
  );
}
