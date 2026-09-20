"use client";

/**
 * AlertDialog (§10, §20, §25) — the overlay family's second member, split from Dialog on
 * 2026-08-16 (LOG): the two are semantically different, and the difference is the point. A
 * dialog is SUMMONED — opened by the user's own hand, holding the consumer's work — while an
 * alert comes AT you and stops you, which is why Base UI ships the pair as separate
 * components (`role="alertdialog"`, no outside-press dismissal).
 *
 * The part vocabulary follows shadcn/ui's alert-dialog (https://ui.shadcn.com — MIT),
 * adopted with credit: Root/Trigger/Content/Title/Description/Cancel/Action. Header and
 * Footer are refused — because here the COMPONENT owns the layout, they have no job: Content
 * arranges title, description and the action row itself, and the caller never writes a Stack.
 *
 * The fixed anatomy is licensed by forcers stacking (§10's criterion, which Card and Dialog
 * each failed differently): the role wires a name and description, and the behavior forbids
 * outside-press dismissal, so actions must EXIST and focus must land on the safest one. The
 * cascade is the design: role → closed content → closed box. (The owned entry was a third
 * forcer; motion was removed 2026-09-20, and docs/archive/motion-v1.md records it.)
 *
 * Because the content is closed, `size` prices EVERYTHING — box, corner, padding, the
 * title's and description's type steps, the buttons — where Dialog's size stops at the box.
 * The width is the component's alone: a designed fixed width per index (`--alert-w-N`
 * through the shared overlay join), no prop. The two actions share one row while both labels fit and stack when either does
 * not — a label never wraps (§25, 2026-09-19).
 */
import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import {
  rootsInButton,
  unwrapLazy,
  useMergedRefs,
  type RenderElement,
} from "../../system/render.ts";
import {
  FloatingDirectionContext,
  OverlayBody,
  overlayOpenChange,
  useNameWarning,
  type OverlayOpenChangeDetails,
  PortalScope,
  useAmbientDirection,
} from "../../system/floating.tsx";
import { OWNED_BODY_STEP, OWNED_TITLE_STEP } from "../../system/type-steps.ts";
import { Button } from "../button/button.tsx";
import { Heading } from "../heading/heading.tsx";
import { Text } from "../text/text.tsx";
import type { Size, Tone } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { GlassScope, useMaterial, themeDefaults } from "../../theme/theme.tsx";
import { useAppSize } from "../../system/size.ts";

/* ── The closed content is what lets size price the type (§15, §25) ─────────────────────────
      Dialog's size stops at the box because its content is the consumer's; an alert's title
      and description are system parts, so the index reaches them. The steps walk §15's
      composition ladder: size 3 is the confirm card exactly (title 6, body 3), and the
      ladder holds its shape below and above it. Buttons take the index itself — the size-
      match sentence (§22's "a size-4 trigger must not open a size-2 dropdown") applied to
      the alert's own actions. */

/* The steps moved to system/floating.tsx on their second consumer (2026-08-21): Dialog's own
   title takes the same ladder now, and two copies of one type map is the drift this repo keeps
   finding. An alert and a dialog at the same index must be the same typography. */

/* `themeDefaults.size`, never a literal: this default is only reachable in an invalid tree
   (a part outside its root), and nine private copies of the number 2 is nine claims about a
   rest that the app can now move (2026-09-05). */
const AlertSizeContext = React.createContext<Size>(themeDefaults.size);

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

export type AlertDialogProps = ComponentRefusals & {
  /**
   * Sets the size step of the whole alert.
   * It changes the panel, its corner and padding, the title and description text, and the two
   * buttons.
   */
  size?: Size;
  /** Controlled open state. Use it together with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled starting state. Don't use it together with `open`. */
  defaultOpen?: boolean;
  /**
   * Called when the alert opens or closes.
   * A press outside the alert doesn't close it. Only the two buttons and Escape close it, and
   * Escape does the same as Cancel.
   */
  onOpenChange?: (open: boolean, details: OverlayOpenChangeDetails) => void;
  /**
   * The `AlertDialogTrigger` and the `AlertDialogContent`.
   * `AlertDialog` renders no element of its own.
   */
  children?: React.ReactNode;
};

/**
 * Renders no DOM — state and wiring only. There is no `modal` and no dismissal knob at the
 * type level or under it: Base UI's AlertDialog does not accept them, which is the platform
 * agreeing with §24's refusal — an alert that could be dismissed by clicking elsewhere is a
 * dialog wearing the wrong role. Escape still closes (a keyboard user is answering "not
 * now", which is the Cancel action by another route).
 */
export function AlertDialog({ size: sizeProp, open, defaultOpen, onOpenChange, children }: AlertDialogProps) {
  const size = useAppSize(sizeProp);
  const dir = useAmbientDirection();
  return (
    <AlertSizeContext.Provider value={size}>
      <FloatingDirectionContext.Provider value={dir}>
        <DirectionProvider direction={dir.direction}>
          <BaseAlertDialog.Root
            {...(open !== undefined ? { open } : {})}
            {...(defaultOpen !== undefined ? { defaultOpen } : {})}
            {...(onOpenChange !== undefined ? { onOpenChange: overlayOpenChange(onOpenChange) } : {})}
          >
            {children}
          </BaseAlertDialog.Root>
        </DirectionProvider>
      </FloatingDirectionContext.Provider>
    </AlertSizeContext.Provider>
  );
}

/* ── Trigger ──────────────────────────────────────────────────────────────────────────── */

/** Props for the control that opens the alert. */
export type AlertDialogTriggerProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  /** Usually a Kookie Button: `<AlertDialogTrigger render={<Button/>}>Delete…</AlertDialogTrigger>`. */
  render?: RenderElement;
  /** Tells the trigger if the rendered element is a real `<button>`. By default, the trigger finds this from `render`. */
  nativeButton?: boolean;
  /** Turns the trigger off, so the alert cannot be raised from here. */
  disabled?: boolean;
  /**
   * The button's label. Name the action, not the alert, such as "Delete…".
   * The ellipsis tells people that a question comes next. The label goes on the `render` element.
   */
  children?: React.ReactNode;
  /** Adds your classes to the trigger. With `render`, they go on the element that you rendered. */
  className?: string;
  /** Adds inline styles to the trigger. With `render`, they go on the element that you rendered. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * The node that opens an alert, when the alert has one.
 *
 * An alert raised by app state — a failed save, a session about to expire — has no trigger, so
 * like `DialogTrigger` this part is optional and the direction falls back to the document.
 */
export function AlertDialogTrigger({ render, nativeButton, ref, ...props }: AlertDialogTriggerProps) {
  // The one node an alert MAY own in ordinary flow — where ambient direction is read (§20);
  // an alert opened by app state has no trigger, and the hook falls back to the document.
  const { measure } = React.use(FloatingDirectionContext);
  const target = render === undefined ? undefined : unwrapLazy(render);
  const isNativeButton = nativeButton ?? (target === undefined || rootsInButton(target));
  const setTrigger = useMergedRefs(ref, measure);
  return (
    <BaseAlertDialog.Trigger
      {...(target ? { render: target } : {})}
      nativeButton={isNativeButton}
      {...props}
      ref={setTrigger}
    />
  );
}

/* ── Content: the fold, and the layout the component owns (§25) ───────────────────────── */

export type AlertDialogContentProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /**
   * The alert's parts, in reading order: `AlertDialogTitle`, `AlertDialogDescription`,
   * `AlertDialogCancel`, then `AlertDialogAction`.
   * Put the parts directly inside, not in a `Flex`, because the content sets the layout. Cancel
   * comes first, so it gets focus when the alert opens. If you need more than these four parts,
   * use a `Dialog`.
   */
  children?: React.ReactNode;
  /** Adds your classes to the panel. They don't replace the component's own classes. */
  className?: string;
  /** Adds inline styles to the panel, not to the dimmed background behind it. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * Portal → PortalScope → Backdrop → Viewport → Popup → the body, exactly Dialog's
 * fold — and then one thing Dialog refuses: the LAYOUT. The body is a two-column grid the
 * component's stylesheet owns; title and description span it, the actions take a column
 * each, so the caller writes parts in order and never writes a Flex. Cancel comes first in
 * the DOM: it reads first, sits on the start side (RTL flips it for free), and — because
 * Base UI focuses the first tabbable element — it is what initial focus lands on, which is
 * the APG's "least destructive action" answered by document order rather than machinery.
 */
export function AlertDialogContent({ children, className, style, ref, ...rest }: AlertDialogContentProps) {
  return (
    <BaseAlertDialog.Portal>
      <PortalScope>
        <BaseAlertDialog.Backdrop className="kui-alert-backdrop" />
        <BaseAlertDialog.Viewport className="kui-alert-viewport">
          <AlertPopup className={className} style={style} ref={ref} rest={rest}>
            {children}
          </AlertPopup>
        </BaseAlertDialog.Viewport>
      </PortalScope>
    </BaseAlertDialog.Portal>
  );
}

/** Split out so `useMaterial()` resolves INSIDE `PortalScope` — Dialog's own reasoning, and
    the third copy of the same split (2026-08-16): React context follows the tree, not the DOM,
    so an alert raised from inside a glass card would otherwise inherit that card's glass scope
    and render solid, when in fact it covers the whole page. */
function AlertPopup({
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
  const size = React.use(AlertSizeContext);
  // A floating pane is over content BY CONSTRUCTION (2026-08-17, the backdrop selectivity):
  // it covers the app, so it always has something to bend and always expresses the theme.
  const material = useMaterial({ backdrop: true });
  // §10 — the lens on the pane itself (see Card).
  const lensRef = useLensRef<HTMLDivElement>(material, ref);
  const nameRef = useNameWarning("AlertDialog");
  /* NO CLIP WARNING (2026-08-22 audit). `system/clip.tsx` states as a fact that it is "called
     by the panes that hold content the CALL SITE wrote — Card, Surface, Dialog. Menu, Select
     and AlertDialog own what is inside them, so there is nobody to warn". */
  const identity = "kui-surface kui-overlay kui-alert-popup";
  const setPopup = useMergedRefs(lensRef, nameRef);
  return (
    <BaseAlertDialog.Popup
      // The call site's props go on FIRST, so the identity below cannot be taken from it —
      // Dialog's own spelling, and the reason `data-size="1"` from a caller loses.
      {...rest}
      data-size={size}
      data-tone="neutral"
      data-emphasis="quiet"
      data-bordered
      {...(material !== "solid" ? { "data-material": material } : {})}
      className={className ? `${identity} ${className}` : identity}
      {...(style !== undefined ? { style } : {})}
      ref={setPopup}
    >
      <OverlayBody>
        <GlassScope material={material}>{children}</GlassScope>
      </OverlayBody>
    </BaseAlertDialog.Popup>
  );
}

/* ── Title and Description: the same forcing as Dialog's, plus the index (§10, §15) ────── */

export type AlertDialogTitleProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"h2">,
  "color" | "style" | "className"
> & {
  /**
   * The question that the alert asks. It is the heading, and screen readers announce the alert by it.
   * Say what will happen and to what, such as "Delete three files?".
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLHeadingElement>;
};

/** The alert's accessible name (`aria-labelledby`) — a real heading, priced by the alert's
    own index, which is legal here and not on Dialog because this content is the system's. */
export function AlertDialogTitle({ children, ...props }: AlertDialogTitleProps) {
  const size = React.use(AlertSizeContext);
  return (
    <BaseAlertDialog.Title render={<Heading size={OWNED_TITLE_STEP[size]} />} {...props}>
      {children}
    </BaseAlertDialog.Title>
  );
}

export type AlertDialogDescriptionProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"p">,
  "color" | "style" | "className"
> & {
  /**
   * The result of going ahead, such as what is lost and if it can come back.
   * Screen readers announce it with the title, so don't repeat the question.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLParagraphElement>;
};

/** The alert's body (`aria-describedby`): what happens if you proceed, in the muted ink. */
export function AlertDialogDescription({ children, ...props }: AlertDialogDescriptionProps) {
  const size = React.use(AlertSizeContext);
  return (
    <BaseAlertDialog.Description render={<Text size={OWNED_BODY_STEP[size]} emphasis="medium" render={<p />} />} {...props}>
      {children}
    </BaseAlertDialog.Description>
  );
}

/* ── The two actions: real Buttons the component prices and places (§11, §25) ──────────── */

export type AlertDialogCancelProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  /**
   * The label of the safe choice. "Cancel" is always correct.
   * A label that names what staying means is often better, such as "Keep editing".
   */
  children?: React.ReactNode;
  /**
   * Called on the press, before the alert closes. Cancel always closes the alert, so don't use
   * this to keep it open.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * Turns off the Cancel button. Use it rarely: then only Escape can close the alert without
   * the action.
   */
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * The safe way out — a real Kookie Button the component sizes and dresses: MEDIUM, the
 * fourth and standing setting of a rung that moved four times on 2026-08-16 (Kushagra,
 * all judged in lab2). Quiet+bordered shipped; medium was tried and reverted when the LAB
 * GLASS dressing made it read near-solid in dark; bare quiet followed and the border went
 * with the same glass argument — and when the doctrine re-affirmed one-glass-per-stack and
 * the lab examples returned to the component's own buttons, the ground the earlier verdicts
 * were judged on went with them: on a plain pane, bare quiet is an absence at rest, and
 * medium's soft fill is exactly the visible-but-subordinate standing it was first asked
 * for. The near-solid dark reading was the lab veil's compositing, not the rung's. A rung
 * means one thing system-wide, so if dark's medium ever reads heavy on SHIPPED surfaces,
 * the fix is the rung's dark value at the eye pass — never an alert-local reprice. No
 * `render` escape — the alert owns its actions' size and their row. Both actions close;
 * write it FIRST so it reads first, sits at the start, and takes initial focus.
 */
export function AlertDialogCancel({ children, ...props }: AlertDialogCancelProps) {
  const size = React.use(AlertSizeContext);
  return (
    <BaseAlertDialog.Close
      render={<Button size={size} emphasis="medium" />}
      nativeButton
      {...props}
    >
      {children}
    </BaseAlertDialog.Close>
  );
}

export type AlertDialogActionProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  /**
   * Sets the colour meaning of the action button. Use `destructive` for a delete or another
   * action that you can't undo. The default is neutral.
   */
  tone?: Tone;
  /**
   * The label of the action. Use the verb from the question, such as "Delete", not "OK".
   */
  children?: React.ReactNode;
  /**
   * Called when the action is pressed. The alert closes on the same press.
   * If the action must wait for a result, use a `Dialog` and control its `open` prop.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * Turns off the action button, such as until the person types a name to confirm.
   * Cancel stays on.
   */
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * The committing action: loud, because an alert has exactly ONE — which is §11's "one focal
 * point per context" guaranteed by anatomy rather than self-policing, and why the rung is
 * legal as a default here when no component may default to it. It also closes: the alert's
 * whole job ends when a choice is made, and an action that must first await work is a
 * Dialog's (run the work from `onClick`/`onOpenChange` and control `open` if it must stay).
 */
export function AlertDialogAction({ tone, children, ...props }: AlertDialogActionProps) {
  const size = React.use(AlertSizeContext);
  return (
    <BaseAlertDialog.Close
      render={<Button size={size} emphasis="loud" {...(tone ? { tone } : {})} />}
      nativeButton
      {...props}
    >
      {children}
    </BaseAlertDialog.Close>
  );
}
