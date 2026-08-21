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
import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import { mergeRefs, unwrapLazy, type RenderElement } from "../../system/render.ts";
import {
  FloatingDirectionContext,
  PortalScope,
  useAmbientDirection,
} from "../../system/floating.tsx";
import { Heading } from "../heading/heading.tsx";
import { Text } from "../text/text.tsx";
import type { Size } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { useClipWarning } from "../../system/clip.tsx";
import { GlassScope, useMaterial, type SurfaceMaterial } from "../../theme/theme.tsx";

/* ── Size context: the dialog answers `size` like Menu (Kushagra, 2026-08-10) — the index
      prices the box (width, padding, corner) and nothing else. Type is NOT on it: no surface
      in this system sizes the type inside it, and the parts below state the house steps
      (§15's composition brief) instead. One provider on the root; the popup stamps the index
      on its own element, where the surface size join fires. Crosses the portal with React
      (§20), which is the whole reason it is context rather than a prop on Content. ─────── */

const DialogSizeContext = React.createContext<Size>("3");

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

/**
 * Why a dialog is opening or closing (2026-08-21).
 *
 * The strings are Base UI's own and are kept rather than translated: they are already plain,
 * and a mapping table would be a second home for a fact with one consumer plus a silent way
 * to drift. What is NOT taken from Base UI is the type — this union is declared here, so the
 * API is the package's, and three mounted laws provoke a real Escape, a real outside press
 * and a real close button and read the string back, which is what catches a rename upstream.
 */
export type DialogOpenChangeReason =
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "close-press"
  | "focus-out"
  | "imperative-action"
  | "none";

/**
 * The second argument to `onOpenChange`, and the reason it exists: without it a dialog can be
 * told that it closed and never why, so the most ordinary guard a form dialog owes — "you have
 * unsaved changes" — could not be written at all (measured 2026-08-21, the audit).
 *
 * `cancel()` stops the dismissal. Deliberately narrower than Base UI's own details object: it
 * publishes the three members that mean something at this layer and leaves the rest, so the
 * package's surface is the package's rather than whatever the primitive happens to carry.
 */
export type DialogOpenChangeDetails = {
  /** Why it is changing — an outside press, Escape, a close button, the trigger. */
  reason: DialogOpenChangeReason;
  /** The native event behind it. */
  event: Event;
  /** Refuse the change. A dialog that must ask before closing calls this and asks. */
  cancel: () => void;
};

export type DialogProps = {
  /** §4, §24 — prices the popup's max width, its padding and its corner. */
  size?: Size;
  /** Controlled open state. Pass it with `onOpenChange` — this trio is the library's ONE
      controlled-state pattern, and every floating component and every Shell pane repeats it
      unchanged. */
  open?: boolean;
  /** Uncontrolled starting state, for a dialog whose openness nothing else needs to know
      about. Mutually exclusive with `open`. */
  defaultOpen?: boolean;
  /** Fires on every open and close, controlled or not. The second argument is what makes a
      guard writable: `reason` names what did it (an outside press, Escape, a close button,
      the trigger), `event` is the native event behind it, and `cancel()` refuses that one
      dismissal — so "you have unsaved changes" is a real answer rather than a race. */
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  /** The trigger and the content. Dialog renders no DOM of its own — it is state and wiring —
      so this is `<DialogTrigger>` and `<DialogContent>`, in either order. */
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
export function Dialog({ size = "3", open, defaultOpen, onOpenChange, children }: DialogProps) {
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
            {...(onOpenChange !== undefined
              ? {
                  onOpenChange: (next: boolean, details: { reason: string; event: Event; cancel: () => void }) =>
                    onOpenChange(next, {
                      reason: details.reason as DialogOpenChangeReason,
                      event: details.event,
                      cancel: details.cancel,
                    }),
                }
              : {})}
          >
            {children}
          </BaseDialog.Root>
        </DirectionProvider>
      </FloatingDirectionContext.Provider>
    </DialogSizeContext.Provider>
  );
}

/* ── Trigger and Close: the same button, two jobs ──────────────────────────────────────── */

/**
 * Does this render target bottom out in a real `<button>`? (§5 — Menu's own check, restated
 * on the second consumer.) Base UI branches its entire a11y contract on `nativeButton`, and
 * the element handed to a trigger is usually a COMPONENT (`render={<Button/>}`), so a
 * one-level check for the string "button" answers false for the commonest shape in the
 * library. A component that itself takes a `render` escape is transparent, so follow it and
 * stop at the first intrinsic element; an opaque component takes Base UI's default, and
 * `nativeButton` is the escape for what inspection cannot see.
 */
function rootsInButton(el: RenderElement, depth = 0): boolean {
  const target = unwrapLazy(el);
  if (typeof target.type === "string") return target.type === "button";
  const inner = target.props?.render;
  if (depth < 4 && React.isValidElement(inner)) return rootsInButton(inner as RenderElement, depth + 1);
  return true;
}

type ButtonPartProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  /** Usually a Kookie Button: `<DialogTrigger render={<Button/>}>Delete…</DialogTrigger>`. */
  render?: RenderElement;
  /** Whether the rendered element really is a `<button>` — inferred from `render` (§5). */
  nativeButton?: boolean;
  /** The button's words. They land on the `render` target when there is one, so
      `<DialogClose render={<Button/>}>Cancel</DialogClose>` is a single button carrying a
      single label — not a Button nested inside a second one. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

export type DialogTriggerProps = ButtonPartProps;

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
  return (
    <BaseDialog.Trigger
      {...(target ? { render: target } : {})}
      nativeButton={isNativeButton}
      {...props}
      ref={mergeRefs(ref, measure)}
    />
  );
}

export type DialogCloseProps = ButtonPartProps;

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

/**
 * The dev flag, resolved once and defensively — Box's own spelling and its own scar: an
 * ABSENT `process` means dev, not production, and written the other way round the warning
 * dies in every browser that has no such global (audit 2026-08-08).
 */
const DEV = typeof process === "undefined" || process.env?.NODE_ENV !== "production";

/**
 * A dialog with no name is announced as "dialog" and nothing else (measured 2026-08-21:
 * `role="dialog"`, `aria-labelledby` null, `aria-label` null, no warning anywhere). Base UI
 * wires the name when a `DialogTitle` mounts, and until this change there was no second route
 * — `aria-label` type-checked and was dropped, so the obvious repair silently did nothing.
 *
 * Both halves ship together: the prop reaches the element now, and a dev build says so when
 * neither is there. Not a thrown error, because a name is an accessibility obligation rather
 * than a structural one and a half-built dialog in a scratch file should still render.
 *
 * It reads the DOM rather than the props on purpose. The name can arrive by either route and
 * one of them is Base UI's, so the only place both answers are visible is the element itself.
 */
function useNameWarning(): (node: HTMLDivElement | null) => void {
  const seen = React.useRef(false);
  return React.useCallback((node: HTMLDivElement | null) => {
    if (!DEV || !node || seen.current) return;
    // After paint: Base UI stamps `aria-labelledby` when the Title child registers, which has
    // not happened while the popup's own ref is being attached.
    requestAnimationFrame(() => {
      if (seen.current || !node.isConnected) return;
      if (node.getAttribute("aria-labelledby") || node.getAttribute("aria-label")) return;
      seen.current = true;
      console.warn(
        "[kookie-ui] A <Dialog> has no accessible name: a screen reader announces it as " +
          "\"dialog\" and nothing else. Add a <DialogTitle>, or pass aria-label to " +
          "<DialogContent> when the panel genuinely has no visible title.",
      );
    });
  }, []);
}

/* ── Content: the fold (§24) ───────────────────────────────────────────────────────────── */

/**
 * The panel's own props, and the fix for a hole every part in this file had (2026-08-21, the
 * audit). Four props were declared and everything else was dropped in silence — measured with
 * `id`, `aria-label`, `data-testid` and an `onKeyDown`, none of which reached the element and
 * none of which failed to type-check. That is the Select audit's blocked-`id` finding in a
 * third home, and here it had a second victim: with no `DialogTitle` the panel had NO
 * accessible name and `aria-label` was the obvious repair, accepted and discarded.
 *
 * `style` and `className` are re-declared because they dress the POPUP specifically, and
 * `color` is omitted for the same reason every surface in this package omits it (the HTML
 * presentational attribute, not the CSS property).
 */
export type DialogContentProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /** The panel's whole content, and it belongs to the CONSUMER — which is the line between
      this component and AlertDialog, whose content is the system's (§25). Nothing here is
      arranged for you, so write the layout the screen needs. Two parts are worth reaching
      for: a `DialogTitle`, without which the panel has no accessible name at all, and a
      `DialogClose`, because a trapped screen-reader user needs a reachable way out. */
  children?: React.ReactNode;
  /** Your classes, appended rather than replacing the component's own. They land on the panel,
      not on the scrim and not on the scrollable viewport between them. */
  className?: string;
  /** Inline styles, merged last. They land on the panel, not on the scrim and not on the
      scrollable viewport between them. */
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
  const lensRef = useLensRef<HTMLDivElement>(material !== "solid", ref);
  const nameRef = useNameWarning();
  // A pane clips (§3, 2026-08-21): content wider than the panel is not reachable at all.
  const clipRef = useClipWarning("<Dialog>");
  return (
    <BaseDialog.Popup
      {...rest}
      {...popupProps(size, material, className)}
      {...(style !== undefined ? { style } : {})}
      ref={mergeRefs(lensRef, nameRef, clipRef)}
    >
            {/**
              * The body exists for ONE reason and holds one channel: the content comes into
              * focus with the plane it is printed on (§24's entry — depth of field is a
              * property of the mass), and you cannot blur children without a box holding
              * them. That is §10's mechanically-forced sanction, the same one Spinner's span
              * and the floating body have, and it is invisible to the API.
              *
              * What it deliberately does NOT do is carry the alert's runner. This entry has
              * no measurement, no pose and no release clock — it rides Base UI's own
              * transition stamps, so a dialog's whole motion is CSS. The alert needs the
              * runner because its box BECOMES, which means animating to a length CSS cannot
              * interpolate to; a dialog only steps forward in z, and scale needs no
              * measuring.
              */}
      <div className="kui-dialog-body" role="presentation">
        <GlassScope material={material}>{children}</GlassScope>
      </div>
    </BaseDialog.Popup>
  );
}

/* ── Title and Description: the one anatomy something non-visual forces (§10) ──────────── */

export type DialogTitleProps = Omit<
  React.ComponentPropsWithoutRef<"h2">,
  "color" | "style" | "className"
> & {
  /** The panel's name, in words. It is the visible heading AND the string a screen reader
      announces the dialog by, which is one obligation rather than two: name the task
      ("Rename project"), never the widget ("Dialog"). */
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
 * `size` is deliberately not exposed. The dialog's own index prices its BOX, not the type
 * inside it — no surface in this system sizes its children's type — and a title that could be
 * set per call site is the free index §15's brief exists to prevent. Whether a size-1 dialog
 * should carry a smaller title than a size-4 one is recorded open; it is one line if the eye
 * says yes.
 */
export function DialogTitle({ children, ...props }: DialogTitleProps) {
  return (
    <BaseDialog.Title render={<Heading size="6" />} {...props}>
      {children}
    </BaseDialog.Title>
  );
}

export type DialogDescriptionProps = Omit<
  React.ComponentPropsWithoutRef<"p">,
  "color" | "style" | "className"
> & {
  /** The supporting line: what the panel is asking for, said once. It is announced together
      with the title, so a description that restates it is heard twice — and a panel with
      nothing to add is a panel with no description, not one with a padded sentence. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLParagraphElement>;
};

/**
 * The panel's accessible description (`aria-describedby`), and the same argument as the
 * title: forced by the a11y wiring, dressed by the type layer. Body copy at the composition
 * brief's step, in the MUTED ink — a description supports the title, which is exactly what
 * `emphasis="medium"` says (§15's solved ladder, where medium sits on the body floor).
 */
export function DialogDescription({ children, ...props }: DialogDescriptionProps) {
  return (
    <BaseDialog.Description render={<Text emphasis="medium" render={<p />} />} {...props}>
      {children}
    </BaseDialog.Description>
  );
}
