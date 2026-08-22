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
   * An index into the control family, never a measurement. One number sets five things at
   * once: the height, the side padding, the corner, the icon box and the label's type step.
   * Every control at the same index stands level with every other, and re-pricing a step is
   * one config line rather than a sweep of call sites. Density and the pointer setting change
   * what the index resolves to. They never change what it means. Defaults to `2`.
   */
  size?: Size;
  /**
   * What the action means, not what colour it is. `destructive` says what the press does, and
   * the theme decides the colour, which is what lets a palette move without a call site being
   * edited. Defaults to `neutral`, so nothing is accent by accident.
   */
  tone?: Tone;
  /**
   * How loud this action is against the actions beside it. It is the only ranking axis in the
   * system, and there is no `variant`: one prop cannot mean colour and prominence at once.
   *
   * On a button it picks a fill. Loud is the tone's solid colour, medium is a soft wash, and
   * quiet has no fill at all. Read a row of actions in the order the fills state. Defaults to
   * `medium`, so a screen earns its one loud button by asking for it.
   */
  emphasis?: Emphasis;
  /** Adds a hairline. It is separate from loudness: quiet with a border is the old outline
   *  button, and it reads half a step above quiet. */
  bordered?: boolean;
  /** Blocks the press and shows a Spinner. The label never goes away. */
  loading?: boolean;
  /**
   * The slot before the label, usually an icon. While `loading` is true the Spinner takes this
   * slot, in the same box, so nothing shifts.
   */
  leading?: React.ReactNode;
  /** The slot after the label: a chevron, a count, or a whole control. The Spinner never
   *  replaces it. */
  trailing?: React.ReactNode;
  /** Keep focus on the button when it becomes disabled part-way through an interaction. */
  focusableWhenDisabled?: boolean;
  /**
   * Whether the rendered element really is a `<button>`. It is inferred from `render`, and you
   * almost never need to pass it. It exists because Base UI decides its whole accessibility
   * contract from this value, and getting it wrong fails silently.
   */
  nativeButton?: boolean;
  /** Says that content passes behind this button, so the theme's material can show. Unset, it
   *  follows the surrounding `<Box backdrop>` region. It cannot pick a material. It only says
   *  there is something behind this to bend. */
  backdrop?: boolean;
  /** Render into an element you already have, such as a link or a `<summary>`. The appearance
      and the behaviour stay this component's, and only the tag changes. Base UI decides its
      accessibility contract from what the result is, which is inferred from what you pass
      here. See `nativeButton` for the case that cannot be inspected. */
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
 * The action control. Base UI supplies the semantics: a real `<button>`, the keyboard
 * behaviour and the disabled state. Every visible decision is this system's, resolved through
 * tokens. `tone` picks a meaning, `emphasis` picks a loudness, `size` sets five scales at one
 * index, and the stylesheet does the rest with no JavaScript at interaction time.
 *
 * There is no margin prop. Outer spacing belongs to the layout that owns the relationship, so
 * write `<Box m="4"><Button/></Box>`.
 *
 * It defaults to `medium` and `neutral`, so nothing is loud and accent by accident and a
 * screen has one focal point unless somebody asks for a second.
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
  const lensRef = useLensRef<HTMLElement>(material, ref);
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
