"use client";

/**
 * Sheet (§10, §11 "Sheet / Drawer", §20, §24) — the overlay family's third member: a MODAL panel
 * that slides in from an edge of the window over the scrim.
 *
 * The part vocabulary is Dialog's, and through it shadcn/ui's sheet (https://ui.shadcn.com —
 * MIT), adopted with credit: Root/Trigger/Content/Title/Description/Close. Behavior is Base UI's
 * Drawer end to end — focus trap, scroll lock, title and description wiring, Escape, outside
 * press, and swipe-to-dismiss. What this file adds is the Kookie dressing, the §20 re-theming at
 * the portal's landing spot, the fold nobody should assemble by hand, and the one fact Base UI
 * spells physically and this package refuses to: which EDGE.
 *
 * A sheet is NOT the Shell's bottom pane. That pane is part of the app frame — it pushes the
 * frame and states no scrim (§27, decided 2026-09-12). This is a task the app pauses for, which
 * is why it takes Dialog's a11y whole: the scrim says the page is out of play and the focus trap
 * makes that true.
 *
 * Why Base UI's Drawer and not its Dialog: the Drawer IS a dialog (it re-uses Dialog's root
 * context and a11y) plus the two things an edge-anchored panel owes that a centred one does
 * not — swipe-to-dismiss with release velocity, and touch scroll locking that tells a scroll
 * inside the panel from a drag of the panel. Rebuilding those on Dialog would be writing a
 * gesture machine this package has no business owning.
 *
 * Deliberately NOT here: a `top` side (see `SheetSide`), physical `left`/`right`, snap points,
 * a swipe-to-OPEN edge area, nested sheets, `modal` and `disablePointerDismissal` (designed
 * defaults, Dialog's own refusal), `initialFocus`/`finalFocus` as PROPS — the component sets
 * the first one internally to Dialog's own resolution, because Drawer's default differs and
 * "takes Dialog's a11y whole" has to be true rather than claimed (see SheetPopup) — Header and
 * Footer, and a corner ✕
 * (Card's anatomy cut, §10, re-argued for Dialog and unchanged here), and `tone`/`emphasis`
 * (a panel ranks nothing).
 */
import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
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
  useAmbientDirection,
  useNameWarning,
  type OverlayOpenChangeReason,
  type TextDirection,
} from "../../system/floating.tsx";
import { OWNED_BODY_STEP, OWNED_TITLE_STEP } from "../../system/type-steps.ts";
import { Heading } from "../heading/heading.tsx";
import { Text } from "../text/text.tsx";
import type { Size } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { useClipWarning } from "../../system/clip.tsx";
import { GlassScope, useMaterial, type SurfaceMaterial } from "../../theme/theme.tsx";
import { useAppSize } from "../../system/size.ts";

/* ── The edge ────────────────────────────────────────────────────────────────────────────── */

/**
 * The edge a sheet enters from. LOGICAL, because the thing a sheet sits beside is the reading
 * direction's end of the window, not a side of the glass: an inspector that opens on the right
 * in English opens on the left in Arabic, and a call site that wrote `right` would be wrong in
 * one of them. `left` and `right` are refused for that reason.
 *
 * `top` is refused on the record rather than pending. The top edge belongs to the platform on
 * every system this package answers to (iOS's and Android's notification shades, macOS's menu
 * bar) and to the app's own toolbar on the web, so a modal arriving from above lands on the
 * chrome the reader navigates by; Material ships no top sheet and iOS has none. The one peer
 * that does (a macOS window sheet) is attached to a window, which a web page is not.
 */
export type SheetSide = "bottom" | "inline-start" | "inline-end";

/** Base UI's swipe direction is the PHYSICAL direction a panel leaves in, which is the edge it
    sits against. Resolved at render from the ambient direction, never at interaction time. */
function swipeDirectionFor(side: SheetSide, direction: TextDirection): "down" | "left" | "right" {
  if (side === "bottom") return "down";
  const startIsLeft = direction !== "rtl";
  if (side === "inline-start") return startIsLeft ? "left" : "right";
  return startIsLeft ? "right" : "left";
}

/* ── Context: the index and the edge, crossing the portal with React (§20) ─────────────── */

type SheetContextValue = { size: Size; side: SheetSide };
const SheetContext = React.createContext<SheetContextValue>({ size: "3", side: "bottom" });

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

/**
 * Why a sheet is opening or closing: the overlay family's reasons plus the TWO a drawer has and
 * a dialog does not.
 *
 * `swipe` is the obvious one. `close-watcher` is the one this union shipped without (2026-09-12,
 * the ship audit), and leaving it out broke the exact thing the reason exists for: Base UI's
 * Drawer root installs a `CloseWatcher` where the platform has one, so on Android the system
 * BACK gesture closes the panel and reports itself — and an exhaustive "you have unsaved
 * changes" guard, written over this union, had no case for the commonest dismissal on that
 * platform. TypeScript would have REJECTED the case that handled it, which is the worst shape a
 * missing union member can take: the guard looks complete and the compiler agrees.
 *
 * It is Sheet's rather than the overlay family's, and that is measured rather than assumed:
 * Base UI's Dialog root declares no `closeWatcher` and installs none, so widening
 * `OverlayOpenChangeReason` would publish a reason Dialog and AlertDialog can never send.
 * Drawer's own union is this one exactly — the overlay seven, plus `swipe`, plus this.
 *
 * Hand-listed rather than aliased to `BaseDrawer.Root.ChangeEventReason`, for the reason every
 * other union in this package is: the published API is Kookie's, so a Base UI minor bump must
 * not silently widen what a consumer's `switch` has to handle. What that costs is exactly the
 * defect above, so the agreement is owed a law rather than a comment — see the note in the
 * report; a node law can assert the two unions are the same set without importing one into the
 * other.
 */
export type SheetOpenChangeReason = OverlayOpenChangeReason | "swipe" | "close-watcher";

/** The second argument to `onOpenChange` — Dialog's shape, with `swipe` and `close-watcher`
    among the reasons. */
export type SheetOpenChangeDetails = {
  /** Why it is changing — a swipe, the Android back gesture (`close-watcher`), an outside
      press, Escape, a close button, the trigger. */
  reason: SheetOpenChangeReason;
  /** The native event behind it. */
  event: Event;
  /** Refuse the change. A sheet that must ask before closing calls this and asks. */
  cancel: () => void;
};

export type SheetProps = ComponentRefusals & {
  /**
   * The edge the sheet enters from. `bottom` (the default) is the platform sheet: a task that
   * rises over the page. `inline-end` and `inline-start` hold a panel beside the page, such as
   * details, filters or a cart. Logical, so the edge follows the reading direction.
   */
  side?: SheetSide;
  /**
   * Sets the panel's width, its padding, its corner, and the two parts the system owns,
   * `SheetTitle` and `SheetDescription`, at the step map a dialog and an alert take. The width
   * is Dialog's ladder: the whole width of a side sheet, and the maximum width of a bottom
   * sheet on a roomy window. Its height is its content, stopped short of the window. It never
   * touches type the call site wrote.
   */
  size?: Size;
  /** Controlled open state. Pass it with `onOpenChange` — the library's one controlled-state
      pattern, unchanged. */
  open?: boolean;
  /** Uncontrolled starting state. Mutually exclusive with `open`. */
  defaultOpen?: boolean;
  /**
   * Fires on every open and close, controlled or not. `reason` names what did it (including
   * `swipe`), `event` is the native event behind it, and `cancel()` refuses that one change —
   * which is what makes "you have unsaved changes" writable.
   */
  onOpenChange?: (open: boolean, details: SheetOpenChangeDetails) => void;
  /** The trigger and the content: a `<SheetTrigger>` and a `<SheetContent>`, in either order.
      Sheet renders no DOM of its own. */
  children?: React.ReactNode;
};

/**
 * Renders no DOM — state and wiring only (Base UI's Drawer root, the index and edge context,
 * direction).
 *
 * `modal` is not exposed and rests at `true`, Dialog's refusal verbatim: an open sheet IS the
 * interaction. A panel beside the page that leaves the page live is a Shell pane, not a flag on
 * this component.
 */
export function Sheet({ side = "bottom", size: sizeProp, open, defaultOpen, onOpenChange, children }: SheetProps) {
  const size = useAppSize(sizeProp);
  const dir = useAmbientDirection();
  const value = React.useMemo(() => ({ size, side }), [size, side]);

  return (
    <SheetContext.Provider value={value}>
      <FloatingDirectionContext.Provider value={dir}>
        <DirectionProvider direction={dir.direction}>
          <BaseDrawer.Root
            swipeDirection={swipeDirectionFor(side, dir.direction)}
            {...(open !== undefined ? { open } : {})}
            {...(defaultOpen !== undefined ? { defaultOpen } : {})}
            {...(onOpenChange !== undefined
              ? {
                  onOpenChange: (next: boolean, details: { reason: string; event: Event; cancel: () => void }) =>
                    onOpenChange(next, {
                      reason: details.reason as SheetOpenChangeReason,
                      event: details.event,
                      cancel: details.cancel,
                    }),
                }
              : {})}
          >
            {children}
          </BaseDrawer.Root>
        </DirectionProvider>
      </FloatingDirectionContext.Provider>
    </SheetContext.Provider>
  );
}

/* ── Trigger and Close: Dialog's two buttons ────────────────────────────────────────────── */

type ButtonPartProps = Omit<React.ComponentPropsWithoutRef<"button">, "color" | "style" | "className"> & {
  /** Usually a Kookie Button: `<SheetTrigger render={<Button/>}>Filters</SheetTrigger>`. */
  render?: RenderElement;
  /** Whether the rendered element really is a `<button>`. It is inferred from `render`. */
  nativeButton?: boolean;
  /** The button's words. They land on the `render` target when there is one, so the result is
      one button carrying one label. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

export type SheetTriggerProps = ComponentRefusals & ButtonPartProps;

/**
 * The node that opens a sheet, when the sheet has one. Optional, as Dialog's is: a sheet driven
 * by `open` has no trigger, and the text direction then falls back to the document.
 */
export function SheetTrigger({ render, nativeButton, ref, ...props }: SheetTriggerProps) {
  // The one in-flow node a sheet may own, so it is where the ambient direction is read (§20).
  const { measure } = React.use(FloatingDirectionContext);
  const target = render === undefined ? undefined : unwrapLazy(render);
  const isNativeButton = nativeButton ?? (target === undefined || rootsInButton(target));
  const setTrigger = useMergedRefs(ref, measure);
  return (
    <BaseDrawer.Trigger
      {...(target ? { render: target } : {})}
      nativeButton={isNativeButton}
      {...props}
      ref={setTrigger}
    />
  );
}

export type SheetCloseProps = ComponentRefusals & ButtonPartProps;

/**
 * The dismissing button, placed by the CALL SITE. No system-drawn ✕ (Dialog's refusal, §24):
 * Escape, an outside press and a swipe all close, and this puts a real Button wherever the
 * composition wants one — which is also what a touch screen-reader user needs to leave a trapped
 * panel, since a swipe is not a gesture VoiceOver passes through.
 */
export function SheetClose({ render, nativeButton, ref, ...props }: SheetCloseProps) {
  const target = render === undefined ? undefined : unwrapLazy(render);
  const isNativeButton = nativeButton ?? (target === undefined || rootsInButton(target));
  return (
    <BaseDrawer.Close
      {...(target ? { render: target } : {})}
      nativeButton={isNativeButton}
      {...props}
      {...(ref !== undefined ? { ref } : {})}
    />
  );
}

/* ── Content: the fold ─────────────────────────────────────────────────────────────────── */

export type SheetContentProps = ComponentRefusals &
  Omit<React.ComponentPropsWithoutRef<"div">, "color" | "style" | "className"> & {
    /**
     * The panel's whole content, and it belongs to you. Reach for a `SheetTitle` (without it the
     * panel has no accessible name) and a `SheetClose`. The panel scrolls its own content when
     * it is taller than the room, and a `ScrollArea` placed directly inside pins whatever sits
     * above and below it.
     */
    children?: React.ReactNode;
    /** Your classes, appended. They land on the panel, not on the scrim or the viewport. */
    className?: string;
    /** Inline styles, merged last. They land on the panel, not on the scrim or the viewport. */
    style?: React.CSSProperties;
    ref?: React.Ref<HTMLDivElement>;
  };

/** The panel's surface identity — Card's, stamped rather than chosen, exactly as Dialog's is.
    `kui-overlay` is what the shared overlay size join keys on: it answers this `data-size` with
    the overlay band's corner, the family's padding and `--kui-overlay-w`. `data-side` is the
    logical edge the sheet's own stylesheet places and rounds by. */
function popupProps(size: Size, side: SheetSide, material: SurfaceMaterial, className?: string) {
  const identity = "kui-surface kui-overlay kui-sheet-popup";
  return {
    "data-size": size,
    "data-side": side,
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    ...(material !== "solid" ? { "data-material": material } : {}),
    className: className ? `${identity} ${className}` : identity,
  } as const;
}

/**
 * Portal → PortalScope → Backdrop → VirtualKeyboardProvider → Viewport → Popup → Content, in one
 * part.
 *
 * The Backdrop is the SCRIM, Dialog's recipe on the drawer's clock. The Viewport is Base UI's
 * swipe surface and positioning container. The keyboard provider is Base UI's answer to a phone
 * keyboard rising over a field in the panel; it does nothing where there is no soft keyboard.
 */
export function SheetContent({ children, className, style, ref, ...rest }: SheetContentProps) {
  return (
    <BaseDrawer.Portal>
      <PortalScope>
        <BaseDrawer.Backdrop className="kui-sheet-backdrop" />
        <BaseDrawer.VirtualKeyboardProvider>
          <BaseDrawer.Viewport className="kui-sheet-viewport">
            <SheetPopup className={className} style={style} ref={ref} rest={rest}>
              {children}
            </SheetPopup>
          </BaseDrawer.Viewport>
        </BaseDrawer.VirtualKeyboardProvider>
      </PortalScope>
    </BaseDrawer.Portal>
  );
}

/** Split out so `useMaterial()` resolves INSIDE `PortalScope` — Dialog's 2026-08-16 split, for
    Dialog's reason: context follows the tree, and a sheet opened from inside a glass card must
    not read that card's scope. */
function SheetPopup({
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
  const { size, side } = React.use(SheetContext);
  // A covering pane is over content by construction, so it always expresses the theme (§10).
  const material = useMaterial({ backdrop: true });
  const lensRef = useLensRef<HTMLDivElement>(material, ref);
  const nameRef = useNameWarning("Sheet");
  const clipRef = useClipWarning("<Sheet>");
  /* WHERE FOCUS LANDS, which this file claimed from Dialog and was getting from Drawer
     (2026-09-12, the ship audit). The header says a sheet "takes Dialog's a11y whole", and on
     every other point it does — but the two primitives default this prop differently, so the
     one sentence that was inherited by accident was the one about focus.

     Base UI's Dialog resolves `interactionType === "touch" ? popup : true`; Drawer resolves the
     popup, always. Measured on a keyboard open, that put focus on the panel DIV — which
     declares `outline: none` (a panel holding focus is a mode, dialog.css's sentence) — so a
     keyboard user opened a sheet and landed on a node with no ring and no name, one Tab away
     from the first control, while a dialog put them on the control itself.

     `true` means Base UI's own default: the first tabbable element, falling back to the popup
     when there is none. The touch arm is the half that must NOT change — focusing a field on
     touch raises the soft keyboard over the panel that just slid up, which is why Dialog carves
     it out and why this is a function rather than a flag.

     Written out rather than imported: Base UI's `createDefaultInitialFocus` is internal. The
     parameter is contextually typed by the prop, so it needs no import of its own. The ref is
     held here because `initialFocus` wants the ELEMENT, which a callback ref does not keep. */
  const popupRef = React.useRef<HTMLDivElement>(null);
  const setPopup = useMergedRefs(lensRef, nameRef, clipRef, popupRef);
  return (
    <BaseDrawer.Popup
      {...rest}
      {...popupProps(size, side, material, className)}
      initialFocus={(interactionType) => (interactionType === "touch" ? popupRef.current : true)}
      {...(style !== undefined ? { style } : {})}
      ref={setPopup}
    >
      {/**
        * The body is Base UI's `Drawer.Content`, and it holds two jobs at once. It is the box
        * that SCROLLS (a sheet is capped by the window, and a pane clips, §3 — so without a
        * scrolling body the overflow would be deleted, the defect Dialog's narrow arm closed),
        * and it is the region Base UI refuses to start a MOUSE drag in, so text in a sheet
        * stays selectable while a touch still swipes it away.
        *
        * It also wears `kui-dialog-body`, which is the shared layer's name for "the one box
        * between a pane and a ScrollArea" (surfaces.css) — so a ScrollArea placed directly in
        * a sheet bleeds and pins exactly as it does in a dialog. That name is Dialog's, and a
        * family name is owed when this ships.
        */}
      <BaseDrawer.Content className="kui-sheet-body kui-dialog-body">
        <GlassScope material={material}>{children}</GlassScope>
      </BaseDrawer.Content>
    </BaseDrawer.Popup>
  );
}

/* ── Title and Description: the anatomy something non-visual forces (§10) ───────────────── */

export type SheetTitleProps = ComponentRefusals &
  Omit<React.ComponentPropsWithoutRef<"h2">, "color" | "style" | "className"> & {
    /** The panel's name, in words: the visible heading and the string a screen reader announces
        the sheet by. Name the task, such as "Filters", never the widget. */
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    ref?: React.Ref<HTMLHeadingElement>;
  };

/** The sheet's accessible name (`aria-labelledby`), at the overlay family's owned title step for
    the sheet's index — the same typography a dialog and an alert take at that index. */
export function SheetTitle({ children, ...props }: SheetTitleProps) {
  const { size } = React.use(SheetContext);
  return (
    <BaseDrawer.Title render={<Heading size={OWNED_TITLE_STEP[size]} />} {...props}>
      {children}
    </BaseDrawer.Title>
  );
}

export type SheetDescriptionProps = ComponentRefusals &
  Omit<React.ComponentPropsWithoutRef<"p">, "color" | "style" | "className"> & {
    /** The supporting line, said once. It is announced with the title, so a description that
        restates the title is heard twice. */
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    ref?: React.Ref<HTMLParagraphElement>;
  };

/** The sheet's accessible description (`aria-describedby`): body copy in the muted ink at the
    owned body step, Dialog's description verbatim. */
export function SheetDescription({ children, ...props }: SheetDescriptionProps) {
  const { size } = React.use(SheetContext);
  return (
    <BaseDrawer.Description
      render={<Text size={OWNED_BODY_STEP[size]} emphasis="medium" render={<p />} />}
      {...props}
    >
      {children}
    </BaseDrawer.Description>
  );
}
