"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import { Button as BaseButton } from "@base-ui/react/button";
import * as React from "react";
import { ToneScopeContext } from "../../system/tone-scope.ts";

import type { Emphasis, Size, Tone } from "../../system/axes.ts";
import { useSize } from "../../system/size.ts";
import { CHECK_PATH, GLYPH_VIEWBOX } from "../../system/glyphs.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { rootsInButton, slot, unwrapLazy, type RenderElement } from "../../system/render.ts";
import { Spinner } from "../spinner/spinner.tsx";
import { glyphStroke } from "../../tokens/config.ts";

type ButtonBase = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  /**
   * Sets the size step of the button, from `1` to `4`.
   * The step sets the height, the side padding, the corner, the icon size and the label size together.
   * Controls with the same `size` stand level with each other. If you don't set it, the button
   * uses the `size` of the nearest `Theme`, which is `2` by default.
   */
  size?: Size;
  /**
   * Sets what the action means, and the theme picks the colour.
   * For example, use `destructive` for an action that deletes something. The default is `neutral`.
   */
  tone?: Tone;
  /**
   * Sets how prominent the button is next to the buttons beside it.
   * `loud` uses the solid colour of the tone, `medium` uses a soft fill, and `quiet` has no fill.
   * The default is `medium`. Use `loud` for the one main action on a screen.
   */
  emphasis?: Emphasis;
  /** Adds a thin border. A `quiet` button with a border looks a little more prominent than a
   *  `quiet` button without one. */
  bordered?: boolean;
  /** Shows a spinner and blocks the press while an action runs. The label stays visible. On an
   *  `iconOnly` button, the spinner replaces the icon. */
  loading?: boolean;
  /**
   * Shows a tick in place of the icon to say that the action finished. The tick replaces the
   * icon at once, in the same box, and the icon comes back as soon as `done` is false again.
   * Use it for actions with no other visible result, such as copy. You hold the value and clear
   * it yourself. Unlike `loading`, it doesn't block the press. Also change the label or
   * `aria-label` (for example, `Copy` to `Copied`), because screen readers don't announce the tick.
   */
  done?: boolean;
  /**
   * Content before the label, usually an icon. While `loading` is true, the spinner takes this
   * place, so nothing moves.
   */
  leading?: React.ReactNode;
  /** Content after the label, such as a chevron, a count or a control. The spinner never
   *  replaces it. */
  trailing?: React.ReactNode;
  /** Keep focus on the button when it becomes disabled part-way through an interaction. */
  focusableWhenDisabled?: boolean;
  /**
   * Says whether the rendered element is a real `<button>`. The value comes from `render`, so
   * you almost never need to set it. Set it only when `render` passes a component that renders
   * a `<button>`, because a wrong value breaks accessibility without a warning.
   */
  nativeButton?: boolean;
  /** Set `backdrop` when the button sits over other content, such as an image. The button then
   *  uses the theme's material. If you don't set it, the button follows the nearest
   *  `<Box backdrop>`. */
  backdrop?: boolean;
  /** Renders the button as a different element, such as a link. The appearance and behaviour
      stay the same. See `nativeButton` if you pass a component. */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * Props for a button that shows only an icon.
 * Put the icon in `children`. You must also give an accessible name with `aria-label` or
 * `aria-labelledby`, because the button has no visible text.
 */
export type IconOnly =
  | {
      /** Makes the button square and shows only the icon in `children`. You must also set
          `aria-label` or `aria-labelledby`. */
      iconOnly: true;
      /** The name of the button for screen readers. Required when `iconOnly` is set. */
      "aria-label": string;
    }
  | {
      /** Makes the button square and shows only the icon in `children`. You must also set
          `aria-label` or `aria-labelledby`. */
      iconOnly: true;
      /** The id of an element on the page that names this button. Use it instead of
          `aria-label`. One of the two is required with `iconOnly`. */
      "aria-labelledby": string;
    };

export type ButtonProps = ComponentRefusals & ButtonBase & (IconOnly | { iconOnly?: false | undefined });

/**
 * The tick the done state shows in place of the button's own glyph (§29).
 *
 * Only the glyph that is showing is rendered: the tick while done, the caller's glyph
 * otherwise. It sits where that glyph sits and takes the same icon box through the shared
 * layer's slot rule, so the swap is instant and nothing reflows around it — `loading`'s own
 * "same box, zero shift" sentence, one state over. `aria-hidden` because a drawing is not a
 * name: what a screen reader hears is the label the call site changed, which is why the prop's
 * doc asks for one.
 */
function Tick() {
  return (
    <svg
      className="kui-button-tick"
      viewBox={GLYPH_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d={CHECK_PATH}
        stroke="currentColor"
        strokeWidth={glyphStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  size: sizeProp,
  tone: toneProp,
  emphasis = "medium",
  bordered = false,
  loading = false,
  done,
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
  // The strip it sits in lends its tone when this states none (system/tone-scope.ts).
  const tone = toneProp ?? React.use(ToneScopeContext) ?? "neutral";
  // The index of the UNIT this button sits in, when it states none of its own (§28, widened
  // to Button 2026-08-23). `control-size.ts` excluded Button by name, and its argument was
  // that "a button beside that control is a sibling in the form's layout" — which describes
  // a button OUTSIDE the Field, and React context cannot reach one. What the exclusion did
  // reach was a button inside a composer's row, where `<Composer size="4">` left every
  // control at 2. An explicit `size` still wins, which is the mechanism's second bound.
  const size = useSize(sizeProp);
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
  // `rootsInButton`, never a one-level `type === "button"` (2026-08-26 audit). The shallow
  // check answers FALSE for any component target — `render={<MyButton/>}`, the ordinary reason
  // to reach for `render` with something other than an element — so Base UI took the
  // non-native branch and stamped `role="button"` on a real <button>, dropped its `type`
  // (making it a submit inside a form) and, when disabled, wrote `aria-disabled` where the
  // native attribute belongs. The shared helper recurses through `render={<Button render={<a/>}/>}`
  // and answers `true` for a component it cannot see inside, which is the honest default here:
  // an unforwardable case is one where Base UI's own default is what we would have chosen.
  // One exception (2026-08-27): a component handed an `href` is a link by declaration — a
  // router's `<Link>` is the commonest render target of all — and answers `false`.
  const isNativeButton = nativeButton ?? (target === undefined || rootsInButton(target));
  // §10 — the app says what things are built of; a control never does (2026-08-16). It only
  // states placement (backdrop, 2026-08-17): on calm ground it resolves solid and pays nothing.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  // §10 — the lens, prepended to the control layer's own material chain (see Card).
  const lensRef = useLensRef<HTMLElement>(material, ref);
  // The Spinner takes the icon's place when there is one — same box, zero shift — and joins
  // the label when there is not. The label never goes: a button that stops saying what it is
  // doing is worse than one that changes width (§8).
  const leading =
    loading && !iconOnly
      ? <Spinner />
      : done && !iconOnly
        ? <Tick />
        : leadingSlot;
  // AN ICON-ONLY BUTTON'S GLYPH IS `children`, so the Spinner has to replace THAT (2026-08-26
  // audit). Substituting only the leading slot put the Spinner BESIDE the glyph inside a box
  // `aspect-ratio: 1` gives no room to grow — two icon boxes plus the label gap in a square
  // the size of one — so a busy icon button showed the thing it was busy doing, squashed. The
  // slot stays untouched, which is why this is a second expression rather than a wider one.
  const content =
    loading && iconOnly
      ? <Spinner />
      : done && iconOnly
        ? <Tick />
        : children;

  // Slots wear the system's adornment wrapper (`data-slot`, ENGINEERING §3) since 2026-08-05.
  // The wrapper is what lets the shared layer read structure off the DOM instead of asking the
  // component: the pill-padding rule keys "this edge starts with a slot" on it (§4, §6), and a
  // control hosted in a trailing slot gets §4's slot-inset geometry through the same selector —
  // which TextField had and Button, without the wrapper, silently did not.

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
      // The state, stamped like every other one, so the page reads its own decisions.
      data-done={done || undefined}
      className={className ? `kui-control kui-button ${className}` : "kui-control kui-button"}
      {...props}
    >
      {/* THE WHOLE CHILD LIST, slots included (2026-08-26 audit). Wrapping only `children`
          left a control hosted in a slot outside the scope, so a Button inside a glass
          Button's trailing slot read the theme's thickness and painted a second
          backdrop-filter over the first — glass stacked through the one composition §4
          designed the slot geometry for. TextField wraps both of its slots for this reason;
          Button had the same anatomy and half the scope. Context only, so no DOM. */}
      <GlassScope material={material}>
        {slot(leading, "leading")}
        {content}
        {slot(trailing, "trailing")}
      </GlassScope>
    </BaseButton>
  );
}
