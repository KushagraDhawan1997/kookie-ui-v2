"use client";

import * as React from "react";

import { Popover as BasePopover } from "@base-ui/react/popover";

import type { Size } from "../../system/axes.ts";
import { FloatingBody, PortalScope } from "../../system/floating.tsx";
import { useLensRef } from "../../system/refraction.tsx";
import { OWNED_BODY_STEP, OWNED_TITLE_STEP } from "../../system/type-steps.ts";
import { GlassScope, useMaterial, type SurfaceMaterial } from "../../theme/theme.tsx";
import { Heading } from "../heading/heading.tsx";
import { Text } from "../text/text.tsx";

/* The gap between the trigger and the panel. Menu's number, deliberately shared rather than
   re-picked: two panels that open from two buttons on one toolbar must sit at one distance, and
   a second constant would be a value nobody judged pretending to be a decision. */
const SIDE_OFFSET = 4;

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
 * A popover (§30) — an anchored panel holding whatever you put in it, with the page still live
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
  return (
    <PopoverSizeContext.Provider value={size}>
      <BasePopover.Root {...props}>{children}</BasePopover.Root>
    </PopoverSizeContext.Provider>
  );
}

export type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof BasePopover.Trigger>;

/**
 * The control that opens it. Pass your own `<Button>` through `render` — the trigger is
 * whatever you already have, and this component only adds the wiring (`aria-expanded`,
 * `aria-haspopup`, the anchor the panel measures itself against).
 */
export function PopoverTrigger(props: PopoverTriggerProps) {
  return <BasePopover.Trigger {...props} />;
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
  return (
    <BasePopover.Portal>
      <PortalScope>
        <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset}>
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
  return (
    <BasePopover.Popup
      {...popupProps(React.use(PopoverSizeContext), material, className)}
      style={style}
      ref={lensRef}
      {...props}
    >
      <FloatingBody>
        <GlassScope material={material}>{children}</GlassScope>
      </FloatingBody>
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

export type PopoverCloseProps = React.ComponentPropsWithoutRef<typeof BasePopover.Close>;

/**
 * Dismisses the panel. Place a real `<Button>` through `render` — the system draws no ✕ here,
 * for the reason it draws none on a Dialog (§24): this panel has two other ways out, an outside
 * press and Escape, and a corner glyph on a small pane competes with whatever the panel is
 * actually for. Notice draws one because it has neither of those.
 */
export function PopoverClose(props: PopoverCloseProps) {
  return <BasePopover.Close {...props} />;
}
