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
import { GlassScope, useMaterial, type SurfaceMaterial } from "../../theme/theme.tsx";

/* ── Size context: the dialog answers `size` like Menu (Kushagra, 2026-08-10) — the index
      prices the box (width, padding, corner) and nothing else. Type is NOT on it: no surface
      in this system sizes the type inside it, and the parts below state the house steps
      (§15's composition brief) instead. One provider on the root; the popup stamps the index
      on its own element, where the surface size join fires. Crosses the portal with React
      (§20), which is the whole reason it is context rather than a prop on Content. ─────── */

const DialogSizeContext = React.createContext<Size>("3");

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

export type DialogProps = {
  /** §4, §24 — prices the popup's max width, its padding and its corner. */
  size?: Size;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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
            {...(onOpenChange !== undefined ? { onOpenChange } : {})}
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

type ButtonPartProps = {
  /** Usually a Kookie Button: `<DialogTrigger render={<Button/>}>Delete…</DialogTrigger>`. */
  render?: RenderElement;
  /** Whether the rendered element really is a `<button>` — inferred from `render` (§5). */
  nativeButton?: boolean;
  disabled?: boolean;
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

/* ── Content: the fold (§24) ───────────────────────────────────────────────────────────── */

export type DialogContentProps = {
  children?: React.ReactNode;
  className?: string;
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
export function DialogContent({ children, className, style, ref }: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <PortalScope>
        <BaseDialog.Backdrop className="kui-dialog-backdrop" />
        <BaseDialog.Viewport className="kui-dialog-viewport">
          <DialogPopup className={className} style={style} ref={ref}>
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
}: {
  children?: React.ReactNode | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  ref?: React.Ref<HTMLDivElement> | undefined;
}) {
  const size = React.use(DialogSizeContext);
  const material = useMaterial();
  // §10 — the lens on the pane itself (see Card).
  const lensRef = useLensRef<HTMLDivElement>(material !== "solid", ref);
  return (
    <BaseDialog.Popup
      {...popupProps(size, material, className)}
      {...(style !== undefined ? { style } : {})}
      ref={lensRef}
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

export type DialogTitleProps = {
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

export type DialogDescriptionProps = {
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
