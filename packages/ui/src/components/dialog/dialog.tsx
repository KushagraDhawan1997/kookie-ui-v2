"use client";

/**
 * Dialog (§10, §20, §24) — the floating family's third member, and the first one that is not
 * anchored to anything.
 *
 * The part vocabulary follows shadcn/ui's dialog (https://ui.shadcn.com — MIT), adopted with
 * credit: Root/Trigger/Content/Title/Description/Close. Behavior is Base UI's Dialog end to
 * end — focus trap, scroll lock, dismissal, the a11y wiring. What this file adds is the
 * Kookie dressing, the §20 re-theming at the portal's landing spot, and the fold nobody
 * should assemble by hand (Portal → PortalScope → Backdrop → Viewport → Popup).
 *
 * Two things it takes from the family and one it deliberately refuses. It takes the portal
 * machinery whole (system/floating.tsx) and it takes the surface identity whole (a dialog IS
 * a Card that covers: seal, edge, look, material and padding all arrive from surfaces.css).
 * It does NOT take `kui-floating` — that class means an anchored pane hugging control-scale
 * rows, and it carries both the concentric corner join and the floating cast, neither of
 * which a dialog wants: a dialog's rows are prose, and its separation is the SCRIM (§10 has
 * said so since elevation was deleted). See dialog.css.
 *
 * Deliberately NOT here (the registry carries the refusals with their reasons): Header and
 * Footer (layout, not anatomy — Card's own cut, §10), a system-drawn corner ✕ (the same
 * positioned slot, refused for the same reason), `modal` and `disablePointerDismissal`
 * (designed defaults), `initialFocus`/`finalFocus`, and AlertDialog (a different role, and a
 * decision, not a variant).
 */
import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import {
  rootsInButton,
  unwrapLazy,
  useMergedRefs,
  type RenderElement,
} from "../../system/render.ts";
import {
  FloatingDirectionContext,
  PortalScope,
  overlayOpenChange,
  useAmbientDirection,
  useNameWarning,
  type OverlayOpenChangeDetails,
} from "../../system/floating.tsx";
import { OWNED_BODY_STEP, OWNED_TITLE_STEP } from "../../system/type-steps.ts";
import { Heading } from "../heading/heading.tsx";
import { Text } from "../text/text.tsx";
import type { Size } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { useClipWarning } from "../../system/clip.tsx";
import { GlassScope, useMaterial, type SurfaceMaterial } from "../../theme/theme.tsx";
import { useAppSize } from "../../system/size.ts";

/* ── Size context: the dialog answers `size` like Menu (Kushagra, 2026-08-10) — the index
      prices the box (width, padding, corner) AND the two parts the system owns, and nothing
      the call site wrote. Ownership is the line (§24 against §25): a surface never sizes type
      it does not own, and `DialogTitle` / `DialogDescription` are the system's own words —
      they took the owned step map on 2026-08-21, so a dialog and an alert at one index are one
      typography. A `<Text>` or a `<Heading>` the caller places is untouched. One provider on
      the root; the popup stamps the index on its own element, where the surface size join
      fires. Crosses the portal with React (§20), which is the whole reason it is context
      rather than a prop on Content.

      CHANGES
      2026-08-26 — this said "nothing else. Type is NOT on it", which stopped being true on
      2026-08-21 and stayed written in three places, the published prop doc included. ────── */

const DialogSizeContext = React.createContext<Size>("3");

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

/* The reason and the refusal are the overlay family's, shared with AlertDialog on the second
   consumer (system/floating.tsx, 2026-08-21). Base UI declares ONE union for both roots, so
   this package does too. */
export type { OverlayOpenChangeReason, OverlayOpenChangeDetails } from "../../system/floating.tsx";

export type DialogProps = ComponentRefusals & {
  /**
   * Sets the size step of the panel: its maximum width, padding and corner.
   * `DialogTitle` and `DialogDescription` follow this size, and match an `AlertDialog` at the
   * same size. A `Text` or `Heading` that you add keeps its own size.
   */
  size?: Size;
  /** Controlled open state. Use it together with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled starting state. Use it when no other code needs to know if the dialog is
      open. Don't use it together with `open`. */
  defaultOpen?: boolean;
  /**
   * Called when the dialog opens or closes.
   * The second argument gives the `reason`, such as an outside press or Escape, and the native
   * `event`. Call `cancel()` on it to keep the dialog open, for example when there are unsaved
   * changes.
   */
  onOpenChange?: (open: boolean, details: OverlayOpenChangeDetails) => void;
  /**
   * The `DialogTrigger` and the `DialogContent`, in either order.
   * `Dialog` renders no element of its own.
   */
  children?: React.ReactNode;
};

/**
 * Renders no DOM — state and wiring only (Base UI Root, the size context, direction).
 *
 * `modal` is not exposed and rests at Base UI's `true`: an open dialog IS the interaction —
 * focus is trapped, the page behind it stops scrolling, and the scrim states that in paint.
 * A non-modal panel that leaves the page live is a different component (a Popover, or a
 * Sheet), not a flag on this one.
 */
export function Dialog({ size: sizeProp, open, defaultOpen, onOpenChange, children }: DialogProps) {
  const size = useAppSize(sizeProp);
  const dir = useAmbientDirection();

  return (
    <DialogSizeContext.Provider value={size}>
      <FloatingDirectionContext.Provider value={dir}>
        {/* Base UI reads direction from its own context, not from CSS (§20). A dialog is not
            anchored, so nothing POSITIONAL depends on it here — it is provided so a Base UI
            part inside the panel resolves the same direction the panel was stamped with. */}
        <DirectionProvider direction={dir.direction}>
          <BaseDialog.Root
            {...(open !== undefined ? { open } : {})}
            {...(defaultOpen !== undefined ? { defaultOpen } : {})}
            {...(onOpenChange !== undefined ? { onOpenChange: overlayOpenChange(onOpenChange) } : {})}
          >
            {children}
          </BaseDialog.Root>
        </DirectionProvider>
      </FloatingDirectionContext.Provider>
    </DialogSizeContext.Provider>
  );
}

/* ── Trigger and Close: the same button, two jobs ──────────────────────────────────────── */

/** Props shared by `DialogTrigger` and `DialogClose`. */
type ButtonPartProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  /** Usually a Kookie Button: `<DialogTrigger render={<Button/>}>Delete…</DialogTrigger>`. */
  render?: RenderElement;
  /**
   * Tells the part if the rendered element is a real `<button>`. By default, the part finds this
   * from `render`. Set it if your own component renders a `<button>` that the part can't detect.
   */
  nativeButton?: boolean;
  /**
   * The button's label. With `render`, the label goes on the rendered element, so
   * `<DialogClose render={<Button/>}>Cancel</DialogClose>` makes one button.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

export type DialogTriggerProps = ComponentRefusals & ButtonPartProps;

/**
 * The node that opens a dialog, when the dialog has one.
 *
 * It is optional in a way a menu's trigger is not: `<Dialog open={…}>` driven by app state has
 * no trigger at all, which is why the text direction falls back to the document rather than to
 * this element. Pass an element to `render` to make an existing control the opener.
 */
export function DialogTrigger({ render, nativeButton, ref, ...props }: DialogTriggerProps) {
  // The trigger is the one node a dialog MAY own in ordinary flow, so it is where the ambient
  // direction is read (§20). It is optional here in a way it never was for Menu or Select —
  // `<Dialog open={…}>` driven by app state has no trigger at all — which is why
  // useAmbientDirection falls back to the document rather than to its initial `ltr`.
  const { measure } = React.use(FloatingDirectionContext);
  // Unwrapped FIRST: an element created in a Server Component crosses the RSC boundary as a
  // lazy node whose `type` answers wrong, silently (facebook/react#32392).
  const target = render === undefined ? undefined : unwrapLazy(render);
  const isNativeButton = nativeButton ?? (target === undefined || rootsInButton(target));
  const setTrigger = useMergedRefs(ref, measure);
  return (
    <BaseDialog.Trigger
      {...(target ? { render: target } : {})}
      nativeButton={isNativeButton}
      {...props}
      ref={setTrigger}
    />
  );
}

export type DialogCloseProps = ComponentRefusals & ButtonPartProps;

/**
 * The dismissing button, placed by the CALL SITE.
 *
 * There is no system-drawn ✕ in the corner, and that is the same refusal Card made about
 * anatomy (§10): a corner glyph is a positioned slot, and blessing one position deprecates
 * every other. What replaces it is this part plus the platform — Escape and an outside press
 * both close, so a dialog with no visible close is still dismissible; a dialog that must NOT
 * be dismissed that way is an alert, which is a decision, not a prop.
 *
 * Base UI's own note is the reason this ships on day one rather than being left to
 * `onOpenChange`: with focus trapped, a touch screen-reader user needs a reachable control
 * inside the popup to escape it.
 */
export function DialogClose({ render, nativeButton, ref, ...props }: DialogCloseProps) {
  const target = render === undefined ? undefined : unwrapLazy(render);
  const isNativeButton = nativeButton ?? (target === undefined || rootsInButton(target));
  return (
    <BaseDialog.Close
      {...(target ? { render: target } : {})}
      nativeButton={isNativeButton}
      {...props}
      {...(ref !== undefined ? { ref } : {})}
    />
  );
}

/* ── Content: the fold (§24) ───────────────────────────────────────────────────────────── */

/**
 * Props for the dialog panel. Other `div` props, such as `id` and `aria-label`, go on the panel.
 */
export type DialogContentProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /**
   * The panel's content. You write the layout yourself.
   * Add a `DialogTitle`, because without it the panel has no accessible name. Add a `DialogClose`,
   * so that screen reader users can leave the dialog.
   */
  children?: React.ReactNode;
  /** Adds your classes to the panel. They don't replace the component's own classes. */
  className?: string;
  /** Adds inline styles to the panel, not to the dimmed background behind it. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** The panel's surface identity — Card's, stamped rather than chosen (§10, §22's sentence at
    overlay scale). `kui-overlay` is the family class the shared layer's overlay size join keys
    on: it reads this same `data-size` and answers with the overlay band's corner and the
    designed maximum width (§24). Per-size spellings live there, never in a component sheet. */
function popupProps(size: Size, material: SurfaceMaterial, className?: string) {
  const identity = "kui-surface kui-overlay kui-dialog-popup";
  return {
    "data-size": size,
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    // Solid is the absence of a material, so it writes no attribute (§10).
    ...(material !== "solid" ? { "data-material": material } : {}),
    className: className ? `${identity} ${className}` : identity,
  } as const;
}

/**
 * Portal → PortalScope → Backdrop → Viewport → Popup, in one part.
 *
 * The Backdrop is the SCRIM (§10, §24): the app's dim and blur, the one part of this
 * component that is neither a surface nor a control. It is a sibling of the viewport rather
 * than a parent of the panel, so nothing the dialog paints sits inside a filtered box.
 *
 * The Viewport is Base UI's scrollable positioning container, and it is why the panel needs
 * no `position: fixed` of its own: a dialog taller than the window scrolls the viewport
 * instead of trapping its own overflow, so the title of a long dialog is reachable by
 * scrolling rather than lost above a clipped box.
 */
export function DialogContent({ children, className, style, ref, ...rest }: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <PortalScope>
        <BaseDialog.Backdrop className="kui-dialog-backdrop" />
        <BaseDialog.Viewport className="kui-dialog-viewport">
          <DialogPopup className={className} style={style} ref={ref} rest={rest}>
            {children}
          </DialogPopup>
        </BaseDialog.Viewport>
      </PortalScope>
    </BaseDialog.Portal>
  );
}

/** Split out so `useMaterial()` resolves INSIDE `PortalScope` (2026-08-16). React context
    follows the tree, not the DOM, so a dialog opened from a trigger inside a glass Card would
    otherwise read that card's glass scope and render solid — wrong, because a dialog covers
    the page rather than sitting on the card. The bare Theme `PortalScope` renders resets the
    mark, which is the whole mechanism. Menu and Select have the identical split. */
function DialogPopup({
  children,
  className,
  style,
  ref,
  rest,
}: {
  children?: React.ReactNode | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  ref?: React.Ref<HTMLDivElement> | undefined;
  rest: Record<string, unknown>;
}) {
  const size = React.use(DialogSizeContext);
  // A floating pane is over content BY CONSTRUCTION (2026-08-17, the backdrop selectivity):
  // it covers the app, so it always has something to bend and always expresses the theme.
  const material = useMaterial({ backdrop: true });
  // §10 — the lens on the pane itself (see Card).
  const lensRef = useLensRef<HTMLDivElement>(material, ref);
  const nameRef = useNameWarning("Dialog");
  // A pane clips (§3, 2026-08-21): content wider than the panel is not reachable at all.
  const clipRef = useClipWarning("<Dialog>");
  const setPopup = useMergedRefs(lensRef, nameRef, clipRef);
  return (
    <BaseDialog.Popup
      {...rest}
      {...popupProps(size, material, className)}
      {...(style !== undefined ? { style } : {})}
      ref={setPopup}
    >
      {/**
        * The body is the one box between the pane and the caller's children. On a narrow
        * window it is the box that scrolls (dialog.css), and a ScrollArea placed directly in
        * it bleeds and pins as it does in any pane (surfaces.css). It is invisible to the API.
        * Motion was removed 2026-09-20; docs/archive/motion-v1.md records it.
        */}
      <div className="kui-dialog-body" role="presentation">
        <GlassScope material={material}>{children}</GlassScope>
      </div>
    </BaseDialog.Popup>
  );
}

/* ── Title and Description: the one anatomy something non-visual forces (§10) ──────────── */

export type DialogTitleProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"h2">,
  "color" | "style" | "className"
> & {
  /**
   * The dialog's name. It is the visible heading, and screen readers announce the dialog by it.
   * Name the task, such as "Rename project", not the type of control.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLHeadingElement>;
};

/**
 * The dialog's accessible name, wired to the panel by Base UI (`aria-labelledby`).
 *
 * This is the case §10's anatomy criterion reserves: a title is a part here — where it is not
 * one on a Card — because something NON-VISUAL forces it. What it looks like is not this
 * component's decision either: it renders a Kookie `Heading` at §15's composition step for a
 * card title, so the dialog and the confirm card in the playground are the same typography by
 * construction rather than by two people picking the same number.
 *
 * `size` is not exposed HERE, and that has not changed: a title the call site could set is the
 * free index §15's brief exists to prevent. What changed 2026-08-21 (Kushagra, closing §24's
 * open question — "a small dialog should have a smaller title than a large one") is that the
 * DIALOG's index now reaches it. The rule "no surface sizes the type inside it" is intact,
 * because this type is not inside it in the sense that rule means: the title and the
 * description are parts the system owns — they exist because the a11y wiring forces them —
 * and everything the call site wrote is untouched. Ownership is the same argument §25 used to
 * let an alert price all of its own content.
 *
 * The steps are the overlay family's, shared with AlertDialog so the two cannot drift
 * (system/floating.tsx). Size 3 is the anchor and keeps what this component shipped with, so
 * the change moved every index except the one anybody had judged.
 */
export function DialogTitle({ children, ...props }: DialogTitleProps) {
  const size = React.use(DialogSizeContext);
  return (
    <BaseDialog.Title render={<Heading size={OWNED_TITLE_STEP[size]} />} {...props}>
      {children}
    </BaseDialog.Title>
  );
}

export type DialogDescriptionProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"p">,
  "color" | "style" | "className"
> & {
  /**
   * The supporting text: what the dialog asks for. Screen readers announce it with the title, so
   * don't repeat the title. If you have nothing to add, leave the description out.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLParagraphElement>;
};

/**
 * The panel's accessible description (`aria-describedby`), and the same argument as the
 * title in both halves: forced by the a11y wiring, dressed by the type layer, and priced by
 * the dialog's own index since 2026-08-21 — a smaller dialog says its supporting line smaller
 * too, or the pair stops reading as a pair. Body copy in the MUTED ink, because a description
 * supports the title, which is exactly what `emphasis="medium"` says (§15's solved ladder,
 * where medium sits on the body floor).
 */
export function DialogDescription({ children, ...props }: DialogDescriptionProps) {
  const size = React.use(DialogSizeContext);
  return (
    <BaseDialog.Description
      render={<Text size={OWNED_BODY_STEP[size]} emphasis="medium" render={<p />} />}
      {...props}
    >
      {children}
    </BaseDialog.Description>
  );
}
