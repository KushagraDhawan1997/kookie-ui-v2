"use client";

/**
 * AlertDialog (§10, §20, §25) — the overlay family's second member, split from Dialog on
 * 2026-08-16 (LOG): the two are semantically different, and the difference is the point. A
 * dialog is SUMMONED — opened by the user's own hand, holding the consumer's work — while an
 * alert comes AT you and stops you, which is why the family's arrival entry (the
 * materialization) is this component's gesture and why Base UI ships the pair as separate
 * components (`role="alertdialog"`, no outside-press dismissal).
 *
 * The part vocabulary follows shadcn/ui's alert-dialog (https://ui.shadcn.com — MIT),
 * adopted with credit: Root/Trigger/Content/Title/Description/Cancel/Action. Header and
 * Footer are refused — because here the COMPONENT owns the layout, they have no job: Content
 * arranges title, description and the action row itself, and the caller never writes a Stack.
 *
 * The fixed anatomy is licensed by three forcers stacking (§10's criterion, which Card and
 * Dialog each failed differently): the role wires a name and description; the behavior
 * forbids outside-press dismissal, so actions must EXIST and focus must land on the safest
 * one; and the entry animates the content itself, which the system may only do to content it
 * owns. The cascade is the design: role → closed content → closed box → owned motion. If the
 * slots are ever opened up, the content animation must leave with them.
 *
 * Because the content is closed, `size` prices EVERYTHING — box, corner, padding, the
 * title's and description's type steps, the buttons — where Dialog's size stops at the box.
 * The width is the component's alone: a designed fixed width per index (`--alert-w-N`
 * through the shared overlay join), no prop, and the two actions split it 50/50.
 */
import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import { mergeRefs, unwrapLazy, type RenderElement } from "../../system/render.ts";
import {
  FloatingDirectionContext,
  OverlayBody,
  OVERLAY_BODY_STEP,
  OVERLAY_TITLE_STEP,
  overlayOpenChange,
  useNameWarning,
  type OverlayOpenChangeDetails,
  PortalScope,
  useAmbientDirection,
} from "../../system/floating.tsx";
import { Button } from "../button/button.tsx";
import { Heading } from "../heading/heading.tsx";
import { Text } from "../text/text.tsx";
import type { Size, Tone } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { useClipWarning } from "../../system/clip.tsx";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";

/* ── The closed content is what lets size price the type (§15, §25) ─────────────────────────
      Dialog's size stops at the box because its content is the consumer's; an alert's title
      and description are system parts, so the index reaches them. The steps walk §15's
      composition ladder: size 3 is the confirm card exactly (title 6, body 3), and the
      ladder holds its shape below and above it. Buttons take the index itself — the size-
      match sentence (§22's "a size-4 trigger must not open a size-2 dropdown") applied to
      the alert's own actions. v0 for the eye pass. */

/* The steps moved to system/floating.tsx on their second consumer (2026-08-21): Dialog's own
   title takes the same ladder now, and two copies of one type map is the drift this repo keeps
   finding. An alert and a dialog at the same index must be the same typography. */

const AlertSizeContext = React.createContext<Size>("2");

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

export type AlertDialogProps = {
  /** §4, §25 — prices the whole alert: box, corner, padding, title and description steps,
      and the two buttons. It can reach the type where Dialog's cannot, because the content
      here is the system's own. */
  size?: Size;
  /** Controlled open state, paired with `onOpenChange` — Dialog's pattern, which the whole
      library shares. */
  open?: boolean;
  /** Uncontrolled starting state. Mutually exclusive with `open`. */
  defaultOpen?: boolean;
  /** Fires on every open and close. It carries no dismissal details, and that is the role
      rather than an omission: an alert refuses outside presses (§25), so the only ways out
      are the two buttons and Escape, and Escape IS the Cancel action by another route. */
  onOpenChange?: (open: boolean, details: OverlayOpenChangeDetails) => void;
  /** The trigger and the content. AlertDialog renders no DOM of its own — state and wiring
      only — so this is `<AlertDialogTrigger>` and `<AlertDialogContent>`. */
  children?: React.ReactNode;
};

/**
 * Renders no DOM — state and wiring only. There is no `modal` and no dismissal knob at the
 * type level or under it: Base UI's AlertDialog does not accept them, which is the platform
 * agreeing with §24's refusal — an alert that could be dismissed by clicking elsewhere is a
 * dialog wearing the wrong role. Escape still closes (a keyboard user is answering "not
 * now", which is the Cancel action by another route).
 */
export function AlertDialog({ size = "2", open, defaultOpen, onOpenChange, children }: AlertDialogProps) {
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

/** Menu's own check, on its third consumer (§5): does the render target bottom out in a real
    `<button>`? A component with its own `render` escape is transparent — follow it. */
function rootsInButton(el: RenderElement, depth = 0): boolean {
  const target = unwrapLazy(el);
  if (typeof target.type === "string") return target.type === "button";
  const inner = target.props?.render;
  if (depth < 4 && React.isValidElement(inner)) return rootsInButton(inner as RenderElement, depth + 1);
  return true;
}

export type AlertDialogTriggerProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  /** Usually a Kookie Button: `<AlertDialogTrigger render={<Button/>}>Delete…</AlertDialogTrigger>`. */
  render?: RenderElement;
  /** Whether the rendered element really is a `<button>` — inferred from `render` (§5). */
  nativeButton?: boolean;
  /** Stands the trigger down — the alert cannot be raised from here. */
  disabled?: boolean;
  /** The button's words, and they name what is about to be RISKED rather than the alert:
      "Delete…" opens the confirmation, and the ellipsis is the platform's own promise that a
      question is coming. They land on the `render` target, so a Kookie Button plus children
      is one button. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

export function AlertDialogTrigger({ render, nativeButton, ref, ...props }: AlertDialogTriggerProps) {
  // The one node an alert MAY own in ordinary flow — where ambient direction is read (§20);
  // an alert opened by app state has no trigger, and the hook falls back to the document.
  const { measure } = React.use(FloatingDirectionContext);
  const target = render === undefined ? undefined : unwrapLazy(render);
  const isNativeButton = nativeButton ?? (target === undefined || rootsInButton(target));
  return (
    <BaseAlertDialog.Trigger
      {...(target ? { render: target } : {})}
      nativeButton={isNativeButton}
      {...props}
      ref={mergeRefs(ref, measure)}
    />
  );
}

/* ── Content: the fold, and the layout the component owns (§25) ───────────────────────── */

export type AlertDialogContentProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /** The alert's parts, in reading order: `AlertDialogTitle`, `AlertDialogDescription`, then
      `AlertDialogCancel` and `AlertDialogAction`. A LIST of parts, never a Flex — Content owns
      the layout (§25), which is what lets the entry animate the content and what makes
      Cancel-first mean reading order, start side and initial focus at once. Anything beyond
      those four makes the thing a Dialog. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * Portal → PortalScope → Backdrop → Viewport → Popup → the entry's body, exactly Dialog's
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
  const lensRef = useLensRef<HTMLDivElement>(material !== "solid", ref);
  const nameRef = useNameWarning("AlertDialog");
  // A pane clips (§3, 2026-08-21): content wider than the panel is not reachable at all.
  const clipRef = useClipWarning("<AlertDialog>");
  const identity = "kui-surface kui-overlay kui-alert-popup";
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
      ref={mergeRefs(lensRef, nameRef, clipRef)}
    >
      <OverlayBody>
        <GlassScope material={material}>{children}</GlassScope>
      </OverlayBody>
    </BaseAlertDialog.Popup>
  );
}

/* ── Title and Description: the same forcing as Dialog's, plus the index (§10, §15) ────── */

export type AlertDialogTitleProps = Omit<
  React.ComponentPropsWithoutRef<"h2">,
  "color" | "style" | "className"
> & {
  /** The question, phrased as one. It is the alert's accessible name as well as its heading,
      so it should say what is about to happen and to what — "Delete three files?" — where a
      title naming the widget leaves the buttons underneath meaningless. */
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
    <BaseAlertDialog.Title render={<Heading size={OVERLAY_TITLE_STEP[size]} />} {...props}>
      {children}
    </BaseAlertDialog.Title>
  );
}

export type AlertDialogDescriptionProps = Omit<
  React.ComponentPropsWithoutRef<"p">,
  "color" | "style" | "className"
> & {
  /** What proceeding COSTS — the consequence the title could not fit, said once. It is
      announced together with the title, so it adds (what is lost, whether it comes back)
      rather than restating the question in longer words. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLParagraphElement>;
};

/** The alert's body (`aria-describedby`): what happens if you proceed, in the muted ink. */
export function AlertDialogDescription({ children, ...props }: AlertDialogDescriptionProps) {
  const size = React.use(AlertSizeContext);
  return (
    <BaseAlertDialog.Description render={<Text size={OVERLAY_BODY_STEP[size]} emphasis="medium" render={<p />} />} {...props}>
      {children}
    </BaseAlertDialog.Description>
  );
}

/* ── The two actions: real Buttons the component prices and places (§11, §25) ──────────── */

export type AlertDialogCancelProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  /** The retreat, in words. "Cancel" always reads; naming what staying means often reads
      better ("Keep editing"), and the pair is judged together — two named sides is what makes
      the alert a choice rather than a warning with a dismiss button. */
  children?: React.ReactNode;
  /** Runs on the press, before the alert closes. Cancel ALWAYS closes, so this is for the
      tidying — never for deciding whether to. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Stands the safe way out down. Rarely right: it leaves Escape as the only retreat from a
      panel that refuses outside presses (§25). */
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

export type AlertDialogActionProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  /** The one meaning an action may carry beyond proceeding — `destructive` for the deletes
      this component mostly exists for. Neutral (the accent identity) otherwise. */
  tone?: Tone;
  /** The committing choice, in words — the VERB. "OK" makes the user re-read the title to
      remember what they are agreeing to; "Delete" answers the question where it is pressed. */
  children?: React.ReactNode;
  /** Where the work starts. The alert closes on the same press, because its job ends when a
      choice is made — an action that must await a result and report back belongs to a Dialog
      whose `open` the caller controls. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Stands the committing action down — for a confirmation that is not satisfied yet (a
      typed-name gate, a pending check). Cancel stays live, so this is never a trap. */
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
