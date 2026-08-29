"use client";

import * as React from "react";

import { Popover as BasePopover } from "@base-ui/react/popover";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import type { Size } from "../../system/axes.ts";
import {
  FloatingBody,
  FloatingDirectionContext,
  PortalScope,
  SIDE_OFFSET,
  useAmbientDirection,
  useNameWarning,
  useRestingAnchor,
} from "../../system/floating.tsx";
import { useLensRef } from "../../system/refraction.tsx";
import { mergeRefs, rootsInButton, unwrapLazy, type RenderElement } from "../../system/render.ts";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { OWNED_BODY_STEP, OWNED_TITLE_STEP } from "../../system/type-steps.ts";
import { GlassScope, useMaterial, type SurfaceMaterial } from "../../theme/theme.tsx";
import { Heading } from "../heading/heading.tsx";
import { Text } from "../text/text.tsx";

/* Size crosses the portal by CONTEXT, exactly as Dialog's does — a portalled popup renders
   outside its trigger's DOM position, so an attribute cannot reach it and React context can.
   The popup stamps the index on its own element, which is where the surface size join fires. */
const PopoverSizeContext = React.createContext<Size>("2");

export type PopoverProps = {
  /**
   * The panel's box: its padding and its corner. NOT the type inside it — the content is yours,
   * so its steps are yours to state. That line is Dialog's and it holds here for the same
   * reason: a surface never sizes the words it is holding. What the index does reach is
   * `PopoverTitle` and `PopoverDescription`, because those two exist only because the
   * accessibility wiring forces them, and type the system owns is type the system may size.
   */
  size?: Size;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled starting state. */
  defaultOpen?: boolean;
  /** Told when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** The trigger and the content, in that order. Both are parts of this component rather than
      free children: the trigger is what the panel anchors to, and the content is what portals. */
  children?: React.ReactNode;
};

/**
 * A popover (§31) — an anchored panel holding whatever you put in it, with the page still live
 * behind it.
 *
 * It is the floating family's fourth member and the first whose CONTENT the system does not
 * own. A menu holds rows, a select holds options, an alert holds a fixed question with two
 * answers — each of those is an arrangement the system designed. A popover holds a form, a
 * summary, a colour picker, a filter panel: things only the call site knows the shape of. So
 * what this component owns is the pane and its behaviour, and everything inside it is yours.
 *
 * **The page stays live, and that is the whole distinction from Dialog.** Nothing is trapped,
 * nothing is scrolled-locked, and pressing outside dismisses. A panel that must be answered
 * before anything else can happen is a `Dialog`; a panel that stops you to ask one question is
 * an `AlertDialog`. Those are three different promises and the component you choose is how you
 * make one.
 *
 * **It is anchored, and the anchoring is the system's.** There are no positioning props beyond
 * which side to prefer: a panel that could be placed anywhere is a panel every call site places
 * differently.
 */
export function Popover({ size = "2", children, ...props }: PopoverProps) {
  // THE DIRECTION CONTEXT IS NOT OPTIONAL WIRING (§20, added 2026-08-26, ultracode audit).
  // It carries two facts and this component provided NEITHER, so both took the context's
  // default: `direction` — which `PortalScope` STAMPS on the portal wrapper unconditionally,
  // so an `<html dir="rtl">` app opened a panel stamped `dir="ltr"`, the stale-stamp failure
  // of 2026-08-09 reached by a third road — and `anchor`, which is the node the entry flight
  // photographs for its seed, so a standalone popover grew out of the anchorless square
  // instead of lifting off its trigger.
  //
  // Worse than either alone: an unprovided context RESOLVES TO THE NEAREST ENCLOSING ONE, so
  // a popover inside a Dialog took the DIALOG's anchor and flew out of the dialog's trigger,
  // which is somewhere else on the page entirely.
  const dir = useAmbientDirection();

  return (
    <PopoverSizeContext.Provider value={size}>
      <FloatingDirectionContext.Provider value={dir}>
        {/* Base UI positions from its own direction context, not from CSS (§20) — an anchored
            panel's side and alignment are mirrored there, so the provider is what makes
            `side="left"` mean the reader's left. */}
        <DirectionProvider direction={dir.direction}>
          <BasePopover.Root {...props}>{children}</BasePopover.Root>
        </DirectionProvider>
      </FloatingDirectionContext.Provider>
    </PopoverSizeContext.Provider>
  );
}

/**
 * `render` is narrowed to an ELEMENT (Menu's and Dialog's spelling, restated here 2026-08-26).
 *
 * Base UI also accepts a render FUNCTION, and inheriting its props verbatim let that form
 * type-check while `rootsInButton` — which asks an element what it is — read `.props` off a
 * function and threw. A refusal the type expresses is the house rule (ENGINEERING §1.3); a
 * refusal spelled as a runtime crash is not one. What the function form buys (a trigger that
 * relabels itself by open state) is reachable by reading Base UI's own `data-popup-open`
 * attribute in CSS, which is where this system puts state anyway.
 */
export type PopoverTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof BasePopover.Trigger>,
  "render"
> & {
  /** Usually a Kookie Button: `<PopoverTrigger render={<Button/>}>Filters</PopoverTrigger>`. */
  render?: RenderElement;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * The control that opens it. Pass your own `<Button>` through `render` — the trigger is
 * whatever you already have, and this component only adds the wiring (`aria-expanded`,
 * `aria-haspopup`, the anchor the panel measures itself against).
 */
export function PopoverTrigger({ render, nativeButton, ref, ...props }: PopoverTriggerProps) {
  // The trigger is the one node a popover owns that stands in ordinary flow, so it is where
  // the ambient direction is read and the flight's seed is photographed (§20, §22 — Menu's
  // own sentence). Both refs get the node: the caller's is not spent.
  const { measure } = React.use(FloatingDirectionContext);
  // `nativeButton` INFERRED, not defaulted (added 2026-08-23, ultracode audit). Base UI
  // branches its whole a11y contract on it and defaults it to true, so this component shipped
  // `render={<a href/>}` as `<a type="button" tabindex="0">` — `type` on an anchor being the
  // linked resource's MIME type — and a DISABLED one as a tab stop carrying an inert
  // `disabled` attribute and no `aria-disabled`: a focusable, unannounced dead link.
  //
  // That is the Button defect of 2026-08-03, and this was its FOURTH shipping: Button caught
  // it, Menu re-shipped and caught it in the 2026-08-09 audit, Dialog and AlertDialog carry
  // the same guard, and Popover was written without it. Chromium prints Base UI's own warning
  // twice on the anchor path, which is how long it had been saying so.
  //
  // `rootsInButton` is now shared (system/render.ts) rather than a fifth private copy, and it
  // RECURSES because the blessed shape is `render={<Button render={<a href/>}/>}` — a
  // component, so a one-level check answers wrong and the two components disagree about one
  // node. It unwraps lazily at every level for the RSC boundary (§5).
  const target = render === undefined ? undefined : unwrapLazy(render);
  const isNativeButton = nativeButton ?? (target === undefined || rootsInButton(target));
  return (
    <BasePopover.Trigger
      {...(target ? { render: target } : {})}
      nativeButton={isNativeButton}
      {...props}
      ref={mergeRefs(ref, measure)}
    />
  );
}

export type PopoverContentProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /** Which side of the trigger to prefer. The panel flips itself when that side has no room. */
  side?: "top" | "right" | "bottom" | "left";
  /** How it lines up along that side. */
  align?: "start" | "center" | "end";
  /** The gap from the trigger, in pixels. Defaults to the family's own. */
  sideOffset?: number;
  /**
   * The panel's content, and it belongs to you. One part is worth reaching for: a
   * `PopoverTitle`, without which the panel has no accessible name.
   */
  children?: React.ReactNode;
  /** Your classes, appended rather than replacing the component's own. They land on the panel,
      not on the positioner around it. */
  className?: string;
  /** Inline styles, merged last. They land on the panel, so a width you set is the panel's. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

export function PopoverContent({
  side = "bottom",
  align = "center",
  sideOffset = SIDE_OFFSET,
  children,
  className,
  style,
  ref,
  ...props
}: PopoverContentProps) {
  /* The placement's anchor is the trigger's RESTING box (§8, §22 — Menu's 2026-08-25 fix,
     applied here 2026-08-29 by the ultracode audit). A popover opens on a PRESS, and an open
     trigger holds that press: `scale: 0.975` and a 2px sink, arriving over ~150ms of spring.
     floating-ui's tracking watches resize and layout shift and never re-solves for a transform,
     so the placement froze mid-spring and the release's one late re-solve popped the panel by
     the difference, a frame after the entry had visibly finished — the same "theres a small
     jump still" the menu fix was written for, and a `--available-height` cap solved against a
     box 2.5% smaller than the trigger's real one.

     TOOLTIP DELIBERATELY DOES NOT TAKE THIS, and the difference is the gesture: a tooltip's
     trigger is HOVERED for the whole life of the panel, so its 1px rise is a static fact rather
     than a spring in flight, and anchoring to the resting box would place the tooltip 1px off
     the button a person is looking at. A press springs back; a hover does not. */
  const anchor = useRestingAnchor();
  return (
    <BasePopover.Portal>
      <PortalScope>
        <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} anchor={anchor}>
          <PopoverPopup className={className} style={style} ref={ref} {...props}>
            {children}
          </PopoverPopup>
        </BasePopover.Positioner>
      </PortalScope>
    </BasePopover.Portal>
  );
}

/** The pane's identity: Card's constants plus the floating family's (§10, §22). The tone
    indirection needs a family for `--tone-border`, the fill is the seal, and `data-size` is
    stamped because the surface size join fires on this element. */
function popupProps(size: Size, material: SurfaceMaterial, className?: string) {
  const identity = "kui-surface kui-floating kui-popover-popup";
  return {
    "data-size": size,
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    // Solid is the seal and writes no attribute (§10); the value is the THEME's, read inside
    // the portal so it is the world the popup lands in that answers.
    ...(material !== "solid" ? { "data-material": material } : {}),
    className: className ? `${identity} ${className}` : identity,
  } as const;
}

/**
 * Split out for the reason every floating popup in this package is: `useMaterial()` has to be
 * read INSIDE `PortalScope` (2026-08-16). React context follows the tree and not the DOM, so a
 * popover opened from a trigger inside a glass Card would otherwise resolve that card's glass
 * scope and come back `solid` — wrong, because the panel paints over the page rather than
 * inside the card.
 */
function PopoverPopup({
  children,
  className,
  style,
  ref,
  ...props
}: {
  children?: React.ReactNode | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  ref?: React.Ref<HTMLDivElement> | undefined;
}) {
  // A floating pane is over content BY CONSTRUCTION (2026-08-17, the backdrop selectivity): it
  // covers the app, so it always has something to bend and always expresses the theme.
  const material = useMaterial({ backdrop: true });
  const lensRef = useLensRef<HTMLDivElement>(material, ref);
  // Base UI's popup renders `role="dialog"`, so a panel with no `PopoverTitle` and no
  // `aria-label` announces as "dialog" and nothing else — the measured case `useNameWarning`
  // was written for (2026-08-21), and this component shipped without the call while Dialog and
  // AlertDialog both made it. A popover with no heading is an ORDINARY shape, which is what
  // makes the omission expensive here rather than theoretical (added 2026-08-26, audit).
  const nameRef = useNameWarning("Popover");
  return (
    <BasePopover.Popup
      {...popupProps(React.use(PopoverSizeContext), material, className)}
      style={style}
      ref={mergeRefs(lensRef, nameRef)}
      {...props}
    >
      {/* THE CONTENT SCROLLS, THE PANEL NEVER DOES — Menu's 2026-08-17 adoption, one family
          member over (added 2026-08-23). The popup keeps its glass, corner and cast; the
          viewport inside carries the overflow, so an overlong panel no longer clips its own
          bottom with no way to reach it. Before this the sheet's own comment recommended a
          ScrollArea to the CALLER, which is a component asking a call site to solve a problem
          only the component can see: `--available-height` is a fact the positioner reports to
          the pane, and a caller wrapping its own content cannot read it.

          `focusable` IS LEFT ALONE, and that is the one place this deliberately departs from
          Menu. Menu passes `focusable={false}` because ARIA voids `role="presentation"` on a
          focusable element and because a roving-focus widget must not grow a tab stop inside
          itself — and it can afford to, since the menu scrolls its own highlight into view. A
          popover holds ARBITRARY content and traps nothing, so nothing else will scroll it: a
          keyboard user reaching a scrollable region needs it focusable (WCAG 2.1.1). The two
          answers differ because the two panels differ, which is the whole reason this is
          stated rather than copied. */}
      <ScrollArea>
        <FloatingBody>
          <GlassScope material={material}>{children}</GlassScope>
        </FloatingBody>
      </ScrollArea>
    </BasePopover.Popup>
  );
}

export type PopoverTitleProps = Omit<
  React.ComponentPropsWithoutRef<"h2">,
  "color" | "style" | "className"
> & {
  /**
   * The panel's name, in words. It is the visible heading and the string a screen reader
   * announces the panel by, which is one obligation rather than two. Name the thing, such as
   * "Filters", never the widget.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLHeadingElement>;
};

/** The panel's name. It exists because `aria-labelledby` needs something to point at — the
    §10 anatomy criterion's one sanctioned shape, and the same one Dialog's title has. */
export function PopoverTitle({ children, ...props }: PopoverTitleProps) {
  const size = React.use(PopoverSizeContext);
  return (
    <BasePopover.Title render={<Heading size={OWNED_TITLE_STEP[size]} />} {...props}>
      {children}
    </BasePopover.Title>
  );
}

export type PopoverDescriptionProps = Omit<
  React.ComponentPropsWithoutRef<"p">,
  "color" | "style" | "className"
> & {
  /**
   * The supporting line, said once. It is announced together with the title, so a description
   * that restates the title is heard twice.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLParagraphElement>;
};

export function PopoverDescription({ children, ...props }: PopoverDescriptionProps) {
  const size = React.use(PopoverSizeContext);
  return (
    <BasePopover.Description render={<Text size={OWNED_BODY_STEP[size]} emphasis="medium" />} {...props}>
      {children}
    </BasePopover.Description>
  );
}

/** `render` is an ELEMENT here for the reason it is on the trigger — see PopoverTriggerProps. */
export type PopoverCloseProps = Omit<
  React.ComponentPropsWithoutRef<typeof BasePopover.Close>,
  "render"
> & {
  /** Usually a Kookie Button: `<PopoverClose render={<Button/>}>Done</PopoverClose>`. */
  render?: RenderElement;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * Dismisses the panel. Place a real `<Button>` through `render` — the system draws no ✕ here,
 * for the reason it draws none on a Dialog (§24): this panel has two other ways out, an outside
 * press and Escape, and a corner glyph on a small pane competes with whatever the panel is
 * actually for. Notice draws one because it has neither of those.
 */
export function PopoverClose({ render, nativeButton, ref, ...props }: PopoverCloseProps) {
  // The trigger's fix, one export over and for the same reason: a close button rendered as an
  // anchor is the commonest shape after the trigger, and Base UI's default would give it
  // `type="button"` and an unannounced disabled state.
  const target = render === undefined ? undefined : unwrapLazy(render);
  const isNativeButton = nativeButton ?? (target === undefined || rootsInButton(target));
  return (
    <BasePopover.Close
      {...(target ? { render: target } : {})}
      nativeButton={isNativeButton}
      {...props}
      {...(ref !== undefined ? { ref } : {})}
    />
  );
}
