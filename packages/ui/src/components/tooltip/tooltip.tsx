"use client";

import * as React from "react";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import {
  FloatingBody,
  FloatingDirectionContext,
  PortalScope,
  SIDE_OFFSET,
  useAmbientDirection,
} from "../../system/floating.tsx";
import { mergeRefs } from "../../system/render.ts";
import { Text } from "../text/text.tsx";

/**
 * How long the pointer rests before a tooltip appears, and how long it lingers after it leaves.
 *
 * A JS constant rather than a token, on `SIDE_OFFSET`'s precedent: it is a number the component
 * hands to Base UI, not a value the cascade resolves, and the token pipeline is for the second
 * kind. It is deliberately not a prop — a delay that varied per call site would make one product
 * feel like several. v0: Radix rests at 700ms, Material at 500.
 *
 * It lives on the PROVIDER because that is the only place Base UI accepts it (measured: the Root
 * has no `delay` prop in 1.7), which turns out to be the right place anyway — a delay is a
 * property of a REGION of the interface, not of one label.
 */
const DELAY = 600;
const CLOSE_DELAY = 0;

export type TooltipProviderProps = React.ComponentPropsWithoutRef<typeof BaseTooltip.Provider>;

/**
 * Where the system's timing lives, and it belongs once near the root of an app.
 *
 * It does two things, and the second is why it is worth an export. It states the delay — Base
 * UI accepts one only here — and it GROUPS every tooltip inside it, so the first one in a
 * toolbar waits and the rest appear as the pointer travels along the row. Without a group each
 * button re-waits from scratch, which is the difference between a toolbar you can read and one
 * you fight.
 *
 * Nothing requires it: a lone tooltip works, on Base UI's own default timing. Wrapping the app
 * once is how you get the system's.
 */
export function TooltipProvider(props: TooltipProviderProps) {
  return <BaseTooltip.Provider delay={DELAY} closeDelay={CLOSE_DELAY} {...props} />;
}

export type TooltipProps = {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled starting state. */
  defaultOpen?: boolean;
  /** Told when it opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** The trigger and the content, in that order. */
  children?: React.ReactNode;
};

/**
 * A tooltip (§32) — the name of a control, shown to a pointer that rests on it.
 *
 * **It may only restate what the control already announces**, and that is the rule the whole
 * component hangs on rather than a nicety. A tooltip has no keyboard route, no touch route and
 * no reading order: it is an affordance of one input device. So anything that appears only here
 * is information lost to everybody else, and the component is safe exactly to the extent that
 * its words are the accessible name the trigger already carries. An icon-only button with
 * `aria-label="Undo"` and a tooltip reading "Undo" is the shape this exists for.
 *
 * That is also why it has no touch story and does not need one. There is no hover on a phone,
 * so nothing opens — and because the tooltip never carried anything of its own, nothing is
 * missing. A hint that a touch user genuinely needs is a `FieldDescription`, a `Notice`, or
 * words on the screen.
 *
 * **It is INVERTED** (§11's one identity exception, and the only row in that table that ever
 * named one). The panel paints itself in the ink of the mode it sits in and writes on itself in
 * that mode's surface colour, so it is dark on a light page and light on a dark one, at the
 * highest contrast the palette has, in whichever appearance is in effect. No new colour is
 * minted and none can drift: it is the mode's own two ends, swapped.
 *
 * **What it is not**: not a popover (that one holds content, takes focus, and answers a press),
 * not a `FieldDescription` (that is a sentence a form owes you, and it stays on screen), and
 * never a place to put something you cannot say anywhere else.
 */
export function Tooltip({ children, ...props }: TooltipProps) {
  // THE DIRECTION CONTEXT IS NOT OPTIONAL WIRING (§20, added 2026-08-26, ultracode audit) —
  // Popover's sentence, one family member over, and the failure is identical. It carries the
  // direction `PortalScope` STAMPS on the wrapper (unprovided, a tooltip in an
  // `<html dir="rtl">` app opened stamped `dir="ltr"`, which OVERRIDES the direction the
  // portal would otherwise have inherited) and the trigger the entry flight photographs for
  // its seed. And an unprovided context resolves to the nearest ENCLOSING one, so a tooltip
  // inside a Dialog flew out of the dialog's trigger.
  const dir = useAmbientDirection();

  return (
    <FloatingDirectionContext.Provider value={dir}>
      {/* Base UI mirrors an anchored panel's side and alignment from its own direction
          context, not from CSS (§20). */}
      <DirectionProvider direction={dir.direction}>
        <BaseTooltip.Root {...props}>{children}</BaseTooltip.Root>
      </DirectionProvider>
    </FloatingDirectionContext.Provider>
  );
}

/**
 * THE DELAY IS THE SYSTEM'S, AND THE TYPE IS WHERE THAT IS SAID (2026-08-26, ultracode audit).
 *
 * Base UI's trigger accepts its own `delay` and `closeDelay` and honours them over the
 * provider's, so inheriting its props verbatim left the documented refusal — "deliberately not
 * a prop; a delay that varied per call site would make one product feel like several" — stated
 * in four places and enforced in none: `<TooltipTrigger delay={0}/>` compiled and worked. A
 * refusal the type does not express is a comment (ENGINEERING §1.3). The escape, when a region
 * genuinely needs different timing, is a second `TooltipProvider` — which is the right shape
 * anyway, a delay being a property of a REGION rather than of one label.
 */
export type TooltipTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseTooltip.Trigger>,
  "delay" | "closeDelay"
> & {
  ref?: React.Ref<HTMLElement>;
};

/**
 * The control the tooltip names. Pass your own `<Button>` through `render` — the trigger is
 * whatever you already have, and this adds the wiring and the anchor.
 */
export function TooltipTrigger({ ref, ...props }: TooltipTriggerProps) {
  // The one node a tooltip owns that stands in ordinary flow: the ambient direction is read
  // here, and the entry's seed is photographed off it (§20, §22 — Menu's sentence). Both refs
  // get the node, so the caller's is not spent.
  const { measure } = React.use(FloatingDirectionContext);
  return <BaseTooltip.Trigger {...props} ref={mergeRefs(ref, measure)} />;
}

export type TooltipContentProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /** Which side of the trigger to prefer. It flips itself when that side has no room. */
  side?: "top" | "right" | "bottom" | "left";
  /** How it lines up along that side. */
  align?: "start" | "center" | "end";
  /** The gap from the trigger, in pixels. Defaults to the family's own. */
  sideOffset?: number;
  /**
   * The words, and they are a STRING rather than nodes — the one refusal the type carries.
   *
   * A tooltip is a label, and a label is a sentence. What it cannot be is a small composition:
   * an inverted pane cannot invert an arbitrary subtree, because a component that stamps a tone
   * re-declares the ink roles ON ITS OWN ELEMENT, which overrides anything a parent re-scoped —
   * measured, a `Kbd` inside a tooltip kept the page's ink and its own pale fill, and vanished
   * on a near-black pane. Inverting the whole palette instead would mean knowing the current
   * appearance, which under `appearance="inherit"` no React code can.
   *
   * The shortcut case is a string too: `Undo ⌘Z`. Anything that genuinely needs a chip in it is
   * a `Popover`, which holds content because it was built to.
   */
  children?: string;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

export function TooltipContent({
  side = "top",
  align = "center",
  sideOffset = SIDE_OFFSET,
  children,
  className,
  style,
  ref,
  ...props
}: TooltipContentProps) {
  const identity = className
    ? `kui-surface kui-floating kui-tooltip-popup ${className}`
    : "kui-surface kui-floating kui-tooltip-popup";
  return (
    <BaseTooltip.Portal>
      <PortalScope>
        <BaseTooltip.Positioner side={side} align={align} sideOffset={sideOffset}>
          <BaseTooltip.Popup
            // Neutral because the tone indirection needs a family to resolve `--tone-border`,
            // and quiet because the surface rungs need a rung — both stamped, neither exposed:
            // a tooltip has no tone and no loudness, it has a job.
            data-tone="neutral"
            data-emphasis="quiet"
            // The SMALLEST surface corner, stamped even though there is no size axis: without
            // an index the surface join never fires and the pane falls back to the un-indexed
            // default, which is a card's — measured, a 64.52px corner on a 30px chip. Size 1 is
            // the band's own answer for the smallest pane the system draws, and at the roundest
            // radius levels a box this short reaches its own capsule, which is what every other
            // 28px box in the library does at `full`.
            data-size="1"
            /**
             * HIDDEN FROM ASSISTIVE TECHNOLOGY, and this is the restatement rule enforced rather
             * than merely written down (§32).
             *
             * Base UI wires nothing here — measured, the trigger carries no `aria-describedby`
             * and the panel no `role="tooltip"` — so the choice was ours to make either way. A
             * tooltip may only restate the name its control already announces, and announcing
             * that name a second time reads as "Undo, button, Undo". If a tooltip carries
             * something the control does not, hiding it does not create that problem: the
             * problem is already there for every keyboard and touch user, and the repair is to
             * put the words somewhere they live.
             */
            aria-hidden
            // NO `data-material`, ever, and the absence is a decision (§10). The material
            // defends a foreground against what passes behind a pane; a tooltip defends itself
            // by INVERTING, which is the stronger answer, and two defences on one 28px box is
            // the doubled-edge defect's shape. (It DOES carry `data-size="1"` — see the note
            // on that line. This comment claimed the opposite for a day, seventeen lines under
            // the stamp itself: there is no size AXIS, which is a different sentence from
            // carrying no index, and the pane needs one or the surface join never fires.)
            className={identity}
            style={style}
            ref={ref}
            {...props}
          >
            <FloatingBody>
              {/* The step is the system's, because these words are the system's: a tooltip is a
                  label it places, not a composition somebody built (§15's ownership exception,
                  the same one a dialog's title takes). Wrapping in `Text` rather than declaring
                  type facts in the stylesheet is also what makes the inversion reach the words —
                  the body re-scopes the foreground ROLE, and `.kui-type` reads that role. */}
              <Text size="2">{children}</Text>
            </FloatingBody>
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </PortalScope>
    </BaseTooltip.Portal>
  );
}
