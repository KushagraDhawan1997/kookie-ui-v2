"use client";

/**
 * Menu (§21, §22) — the first floating component, and the row family's first member.
 *
 * The part vocabulary and composition shape follow shadcn/ui's dropdown-menu
 * (https://ui.shadcn.com — MIT), adopted with credit 2026-08-09 (LOG): Root/Trigger/Content/
 * Item/CheckboxItem/RadioGroup/RadioItem/Group/Label/Sub(+SubTrigger/SubContent), with
 * Content owning the wiring nobody should assemble (Portal → Theme → Positioner → Popup).
 * Behavior is Base UI's Menu end to end — roving focus, typeahead, dismissal, nested
 * positioning; what this file adds is the Kookie dressing and the §20 re-theming.
 *
 * Deliberately NOT here (registry carries the refusals): Shortcut (a keyboard hint is the
 * trailing slot holding a <Kbd>), Arrow, Backdrop, Viewport, LinkItem (waits for Sidebar),
 * `inset` (the reserved gutter is geometry's job — checkable items keep their indicator
 * mounted so the gutter holds), collision knobs, `modal`/`openOnHover`.
 */
import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import { mergeRefs, rootsInButton, slot, unwrapLazy, type RenderElement } from "../../system/render.ts";
import {
  FloatingBody,
  FloatingDirectionContext,
  PortalScope,
  useAmbientDirection,
  useRestingAnchor,
} from "../../system/floating.tsx";
import type { Size } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { GlassScope, useMaterial, type SurfaceMaterial } from "../../theme/theme.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { glyphStroke } from "../../tokens/config.ts";

/* ── Designed constants (§22 — the switchInset precedent: Base UI takes numbers, so
      these cannot ride CSS tokens; one home, judged in the playground) ─────────────────── */

/** Gap between the trigger's edge and the popup. (A COVERING default — the panel pulled
    back over its anchor so the trigger visually became the menu — was built and reverted
    2026-08-15, Kushagra: the silhouette departing across the small gap read better than
    the morph-in-place. LOG carries it.) */
const SIDE_OFFSET = 4;

/**
 * A submenu's seam with its parent panel (§22, measured rather than designed since
 * 2026-08-09).
 *
 * It shipped as a hardcoded -4, with a comment saying it "must track `menuPadding`" — which
 * it cannot, because `--floating-p` is a layout-space pick that MOVES with density (2/4/8) and a
 * JS constant does not. It also ignored the panel's border. Measured, the first row aligned
 * with its trigger in NONE of the six density x pointer cells, and "sits flush against its
 * parent panel" was false everywhere: the child overlapped the parent by padding + border.
 *
 * Both offsets are one measurement — the parent panel's own top padding and border, read at
 * position time, so density changes track live rather than at next mount. Read off the DOM
 * instead of parsing the token, because the padding is `max(--floating-p, ring reach)` and
 * re-deriving that here would be the audits' own lesson (a law, or a constant, that
 * reconstructs the author's arithmetic is one indirection short of the thing that can be
 * wrong). Base UI evaluates the function form on every position pass.
 */
const panelSeam = (trigger: HTMLElement | null): number => {
  const panel = trigger?.closest<HTMLElement>(".kui-menu-popup");
  if (!panel) return 0;
  // The two terms come from two ELEMENTS since 2026-08-17, and reading both off the panel is
  // the defect ScrollArea introduced: the list scrolls inside a viewport now, so the padding
  // moved there with the clipping while the border stayed on the pane. Read off the panel
  // alone, `paddingTop` computed 0 and the seam lost its padding term entirely — the child's
  // first row sat exactly one padding above its trigger (measured 4px at compact, and the law
  // that caught it is the one written for this function's FIRST version of the same mistake).
  // The fallback keeps a panel with no viewport positioning rather than throwing at runtime;
  // the law is what makes its absence loud.
  const box = panel.querySelector<HTMLElement>(".kui-scroll-viewport") ?? panel;
  return parseFloat(getComputedStyle(box).paddingTop) + parseFloat(getComputedStyle(panel).borderTopWidth);
};

/* ── Size context: the menu answers `size` like Button (Kushagra, 2026-08-09 — a size-4
      button must not open a size-2 dropdown). One provider on the root; every row stamps
      the index on its own element, because the size join keys [data-size] per element and
      the cells are inherits:false on purpose. Crosses the portal with React (§20). ─────── */

const MenuSizeContext = React.createContext<Size>("2");

/* ── Direction (§20, added 2026-08-09) ──────────────────────────────────────────────────
      RTL is the third thing a portal drops, after the CSS axes and the stacking frame — and
      it is dropped TWICE, in two different layers, which is why it needed two mechanisms.

      The CSS half: `dir` is a platform attribute, not a Kookie axis, so the wrapper Theme has
      nothing to re-stamp. Inside `<div dir="rtl">` the app computed rtl and the portalled
      popup computed ltr, so a shortcut hint or chevron sat on the wrong side of every row —
      measured, the trailing slot 82.44px from the row's start edge in both directions.

      The JS half: Base UI's positioning reads direction from its OWN context, whose default is
      'ltr' and whose only setter is `DirectionProvider` — which nothing in this repo rendered.
      So even under `<html dir="rtl">`, where CSS direction DOES cross the portal and content
      mirrored correctly, submenus still opened to the physical right, overlapping the panel
      they came from.

      One measurement answers both. The trigger is the only element this component owns that
      stands in ordinary flow, so its computed direction IS the ambient direction — the same
      read whether the app spelled it `dir` on an ancestor or `direction` in CSS. It is taken
      once, in a ref callback at commit; LTR apps never see a state change, and the server
      renders the ltr branch that the client's first render also produces. */

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

export type MenuProps = {
  /** The same index the trigger wears. The rows, the glyphs and the type all take it. */
  size?: Size;
  /**
   * Controlled open state, paired with `onOpenChange`, in the pattern the whole library shares. A
   * menu rarely needs it, because opening is the trigger's job.
   */
  open?: boolean;
  /** Uncontrolled starting state. Mutually exclusive with `open`. */
  defaultOpen?: boolean;
  /**
   * Fires on every open and close, controlled or not, including the dismissals the menu handles
   * itself: Escape, an outside press, and choosing a row.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The trigger and the content. Menu renders no DOM of its own, only state and wiring, so this
   * is a `<MenuTrigger>` and a `<MenuContent>`.
   */
  children?: React.ReactNode;
};

/** Renders no DOM — state and wiring only (Base UI Root, the size context, direction). */
export function Menu({ size = "2", open, defaultOpen, onOpenChange, children }: MenuProps) {
  const dir = useAmbientDirection();

  return (
    <MenuSizeContext.Provider value={size}>
      <FloatingDirectionContext.Provider value={dir}>
        {/* Base UI positions from its own direction context, not from CSS (§20). */}
        <DirectionProvider direction={dir.direction}>
          <BaseMenu.Root
            {...(open !== undefined ? { open } : {})}
            {...(defaultOpen !== undefined ? { defaultOpen } : {})}
            {...(onOpenChange !== undefined ? { onOpenChange } : {})}
          >
            {children}
          </BaseMenu.Root>
        </DirectionProvider>
      </FloatingDirectionContext.Provider>
    </MenuSizeContext.Provider>
  );
}

/* ── Trigger ──────────────────────────────────────────────────────────────────────────── */

/**
 * Does this render target bottom out in a real `<button>`? (§5, 2026-08-09.)
 *
 * Button's own one-level check does not transfer, because the element handed to a TRIGGER is
 * usually a COMPONENT — `render={<Button/>}` has `type === Button`, a function, so a check for
 * the string "button" answers false for the commonest shape in the library and stands the
 * native contract down on an ordinary button. The question is one level deeper than Button
 * ever has to ask it: a component that itself takes a `render` escape is transparent, so
 * follow that escape (`<Button render={<a href/>}/>` roots in an anchor) and stop at the first
 * intrinsic element. A component with no escape is opaque and takes Base UI's own default —
 * the `nativeButton` prop is the escape for the case inspection cannot see.
 */
export type MenuTriggerProps = {
  /** Usually a Kookie Button: `<MenuTrigger render={<Button/>}>Open</MenuTrigger>`. */
  render?: RenderElement;
  /**
   * Whether the rendered element really is a `<button>`. It is inferred from `render` exactly as
   * Button infers it, and you almost never pass it. The escape is for a custom component whose own
   * root is a button, which inspection cannot see through.
   */
  nativeButton?: boolean;
  /**
   * Turns the trigger off, so the menu cannot be opened. It reaches whichever accessibility
   * contract `nativeButton` resolved to, which is why that inference exists: on an anchor,
   * `disabled` is an inert attribute and the announcement has to come from `aria-disabled`.
   */
  disabled?: boolean;
  /**
   * The trigger's own label, and it stays yours: a menu never writes back into the button that
   * opened it. Reporting a chosen value on the trigger is Select's job. It lands on the `render`
   * target, so `render={<Button/>}` plus children is one button.
   */
  children?: React.ReactNode;
  /** Your classes, appended rather than replacing the component's own. They land on the trigger,
      and with `render` on the element you rendered into. */
  className?: string;
  /** Inline styles, merged last. They land on the trigger, and with `render` on the element you
      rendered into. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

export function MenuTrigger({ render, nativeButton, ref, ...props }: MenuTriggerProps) {
  // The trigger is the one node a menu owns that stands in ordinary flow, so it is where the
  // ambient direction is read (§20). Both refs get the node — the caller's is not spent.
  const { measure } = React.use(FloatingDirectionContext);
  // Base UI branches its ENTIRE a11y contract on `nativeButton`, which defaults to true —
  // the Button defect of 2026-08-03, re-shipped here and caught by the audit 2026-08-09.
  // Unforwarded, `render={<a href/>}` emitted `type="button"` on an anchor (where `type` is
  // the linked resource's MIME type) and `disabled` as an inert attribute with no
  // `aria-disabled`: a focusable, unannounced dead link, the same sentence one component
  // over. Worse, the blessed nested shape leaked too — `render={<Button render={<a href/>}/>}`
  // wore Button's correct role="button" AND this component's wrong type="button", two
  // components disagreeing about one node.
  //
  // `render` is unwrapped FIRST (§5): an element created in a Server Component crosses the
  // RSC boundary as a lazy node whose `type` answers wrong, silently (facebook/react#32392).
  const target = render === undefined ? undefined : unwrapLazy(render);
  const isNativeButton = nativeButton ?? (target === undefined || rootsInButton(target));
  return (
    <BaseMenu.Trigger
      {...(target ? { render: target } : {})}
      nativeButton={isNativeButton}
      {...props}
      ref={mergeRefs(ref, measure)}
    />
  );
}

/* ── Content: the fold (§22). Portal → bare Theme (§20: context crosses portals, CSS
      attributes do not — the wrapper re-stamps every axis at the landing spot) →
      Positioner (designed defaults) → Popup, which is a SURFACE wearing Card's exact
      identity (stamped, not chosen) plus the floating paint. ──────────────────────────── */

export type MenuContentProps = {
  /** Which edge of the trigger the menu opens from. */
  side?: "top" | "bottom" | "left" | "right";
  /** Which edge it aligns to along that side. */
  align?: "start" | "center" | "end";
  /** Distance from the trigger, px. Designed default; override sparingly. */
  sideOffset?: number;
  /**
   * The panel's rows: `MenuItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuGroup`, `MenuLabel`
   * and `MenuSub`. A divider is the ordinary `<Separator>`, because a menu-specific part would
   * rename a component that already exists. Everything here mounts inside the portal, where the
   * panel re-applies the theme axes of the place it landed rather than the ones it was written
   * under.
   */
  children?: React.ReactNode;
  /** Your classes, appended rather than replacing the component's own. They land on the popup,
      not on the positioner around it, so a width or a max-height you set is the panel's. */
  className?: string;
  /** Inline styles, merged last. They land on the popup, not on the positioner around it, so a
      width or a max-height you set is the panel's. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/* The portal's landing spot and the direction mechanism live in system/floating.tsx (§20) —
   promoted on the second consumer (Select, 2026-08-09). */

/** The popup's surface identity — Card's constants (§10): the tone indirection needs a
    family for --tone-border, the fill is the seal, quiet + bordered is §11's row for
    Menu. data-size IS stamped (reversed 2026-08-09, Kushagra's eye): the panel's corner is
    concentric — row corner + padding — so it moves with the index its rows answer, and
    menu.css re-states the padding the surface size join would otherwise pick. */
function popupProps(
  size: Size,
  material: SurfaceMaterial,
  anchored: boolean,
  className?: string,
) {
  // `kui-menu-anchored` is what carries the --anchor-width floor (§22), and ONLY a top-level
  // panel wears it. A submenu's anchor is its trigger ROW, which is inline-size: 100% of the
  // parent panel — so the floor that means "never narrower than the button you pressed" read
  // as "never narrower than the panel you came from", and it compounded: measured 446.59 ->
  // 437 -> 427 across three levels, a panel holding one character 427px wide (audit
  // 2026-08-09). The argument for the floor is Button-shaped and does not survive the move.
  const identity = anchored
    ? "kui-surface kui-floating kui-floating-rows kui-menu-popup kui-menu-anchored"
    : "kui-surface kui-floating kui-floating-rows kui-menu-popup";
  return {
    "data-size": size,
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    // Solid is the seal and writes no attribute (§10); the value is the THEME's, read
    // inside the portal so it is the world the popup lands in that answers.
    ...(material !== "solid" ? { "data-material": material } : {}),
    className: className ? `${identity} ${className}` : identity,
  } as const;
}

export function MenuContent({
  side = "bottom",
  align = "start",
  sideOffset = SIDE_OFFSET,
  children,
  className,
  style,
  ref,
}: MenuContentProps) {
  /* The placement's anchor is the trigger's RESTING box (§8, §22, 2026-08-25): an open
     trigger holds its press, the press is a transform, and floating-ui's tracking never
     re-solves for one — so a constrained panel's room was frozen mid-spring and the release's
     late re-solve popped the panel's top by the spring's remaining ~2px. The virtual anchor
     makes every solve press-independent; the entry's own glue still measures the real pixels
     (system/floating.tsx carries the whole argument). */
  const anchor = useRestingAnchor();
  return (
    <BaseMenu.Portal>
      <PortalScope>
        <BaseMenu.Positioner side={side} align={align} sideOffset={sideOffset} anchor={anchor}>
          <MenuPopup anchored className={className} style={style} ref={ref}>
            {children}
          </MenuPopup>
        </BaseMenu.Positioner>
      </PortalScope>
    </BaseMenu.Portal>
  );
}

/**
 * The popup itself, split out for ONE reason: `useMaterial()` has to be read INSIDE
 * `PortalScope` (2026-08-16).
 *
 * A menu is portalled, but React context follows the tree, not the DOM — so a menu opened
 * from a trigger inside a glass Card is, in React's eyes, still inside that card's glass
 * scope, and reading the material in `MenuContent`'s own body would resolve `solid`. That is
 * wrong: the panel paints over the page, not inside the card. `PortalScope` renders the bare
 * `<Theme>` §20 already requires, and a Theme resets the glass mark — so reading below it is
 * what makes "glass does not stack" mean the thing it should.
 */
function MenuPopup({
  anchored,
  children,
  className,
  style,
  ref,
}: {
  anchored: boolean;
  children?: React.ReactNode | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  ref?: React.Ref<HTMLDivElement> | undefined;
}) {
  // A floating pane is over content BY CONSTRUCTION (2026-08-17, the backdrop selectivity):
  // it covers the app, so it always has something to bend and always expresses the theme.
  const material = useMaterial({ backdrop: true });
  // §10 — the lens on the pane itself (see Card).
  const lensRef = useLensRef<HTMLDivElement>(material, ref);
  return (
    <BaseMenu.Popup
      {...popupProps(React.use(MenuSizeContext), material, anchored, className)}
      style={style}
      ref={lensRef}
    >
      {/* The list scrolls, the PANEL never does (2026-08-17, ScrollArea): the popup keeps
          its glass, corner and cast; the viewport inside carries the overflow and the ring
          clearance (menu.css moves the physical padding onto it), and the overlay thumb
          replaces the browser's gutter cutting through the pane. `focusable={false}` is
          what makes the wrapper's role="presentation" REAL (audit 2026-08-18): ARIA voids
          presentation on a focusable element, so Base UI's viewport tabindex was exposing a
          generic node between role="menu" and its menuitems and adding a tab stop inside a
          roving-focus widget. The menu scrolls its own highlight into view. */}
      <ScrollArea focusable={false}>
        <FloatingBody>
          <GlassScope material={material}>{children}</GlassScope>
        </FloatingBody>
      </ScrollArea>
    </BaseMenu.Popup>
  );
}

/* ── Rows (§21): every item is `kui-control kui-row` riding the existing control cells,
      quiet by STAMP (emphasis is refused — a menu is a list of peers), neutral unless the
      one meaning with its own ink is asked for. ────────────────────────────────────────── */

function rowProps(size: Size, tone: "destructive" | undefined, part: string, className?: string) {
  return {
    "data-size": size,
    "data-tone": tone ?? "neutral",
    "data-emphasis": "quiet",
    className: className
      ? `kui-control kui-row ${part} ${className}`
      : `kui-control kui-row ${part}`,
  } as const;
}

export type MenuItemProps = {
  /**
   * The one meaning a row may carry. It is not a palette: the list stays this narrow on purpose,
   * and widening it is a decision rather than a default.
   */
  tone?: "destructive";
  /**
   * Turns the row off, so it cannot be chosen. It stays in the list on purpose: a greyed row still
   * says the action exists and where it lives, and removing it says nothing.
   */
  disabled?: boolean;
  /** Close the menu when this item is chosen. On by default, because a menu is a list of verbs. */
  closeOnClick?: boolean;
  /** Typeahead text when children aren't plain text. */
  label?: string;
  /**
   * What choosing the row does. The menu closes around it, so this is where work starts. Anything
   * that has to report back needs a surface that outlives the panel.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /**
   * Artwork at the head of the row, usually an icon. It is the same slot a checkable row's tick
   * occupies, so an icon here and a tick one row down sit in one column. That is also why there is
   * no `inset` prop: a checkable row keeps its indicator mounted whether or not it is ticked, so
   * the gutter holds by geometry rather than by a flag.
   */
  leading?: React.ReactNode;
  /**
   * The tail of the row: a `<Kbd>` shortcut hint, a count, a state glyph. Not a second action. A
   * row is one target, and a control inside it would be a second one.
   */
  trailing?: React.ReactNode;
  /**
   * The row's words, which are the verb. Plain text keeps typeahead working. Anything richer
   * needs a `label`.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

export function MenuItem({ tone, leading, trailing, children, className, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item {...rowProps(React.use(MenuSizeContext), tone, "kui-menu-item", className)} {...props}>
      {slot(leading, "leading")}
      {children}
      {slot(trailing, "trailing")}
    </BaseMenu.Item>
  );
}

/* ── Groups and labels ────────────────────────────────────────────────────────────────── */

/**
 * Is there a group above this label? (§22, added 2026-08-09.)
 *
 * Base UI's `GroupLabel` throws unconditionally when its group context is missing — in BOTH
 * builds, not as a dev guard — and the throw fires when the user OPENS the menu, not at
 * mount, because the portal renders nothing while closed. So a label outside a group walked
 * past every render-only check and took the whole React root down on the first click.
 *
 * That shape is not exotic: it is the one this file's header advertises. shadcn/ui's
 * canonical dropdown puts `<DropdownMenuLabel>` as a direct child of Content above the first
 * group, and Radix's Label is a plain div with no group requirement — the group association
 * is Base UI's addition. Adopting a vocabulary with credit and then crashing on its
 * canonical shape is not a refusal, it is a landmine, so MenuLabel answers both placements:
 * inside a group it stays Base UI's part and keeps the automatic `aria-labelledby` wiring
 * that placement earns; outside one it is a plain heading div, losing only an association it
 * never had.
 */
const MenuInGroupContext = React.createContext(false);

export type MenuGroupProps = {
  /**
   * The rows the group holds, and at most one `MenuLabel` naming them. Putting the label inside
   * the group is what earns the association: Base UI points the group's `aria-labelledby` at it,
   * so the name is announced rather than only printed above the rows.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** Base UI wires the group's aria-labelledby to a nested MenuLabel. Zero CSS. */
export function MenuGroup(props: MenuGroupProps) {
  return (
    <MenuInGroupContext.Provider value>
      <BaseMenu.Group {...props} />
    </MenuInGroupContext.Provider>
  );
}

export type MenuLabelProps = {
  /**
   * The heading's words: what the rows beneath it have in common. Nothing here is pressable. A
   * label that names an action is a `MenuItem` written in the wrong part.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** A heading for rows. Wears the row skeleton so its text lines up with the items below it
    at every (size × density × pointer) cell — then menu.css stands the interactivity down
    (faint ink, regular weight, no pointer). Legal in a group and legal on its own; see
    MenuInGroupContext for why both. */
export function MenuLabel({ className, ...props }: MenuLabelProps) {
  const skeleton = rowProps(React.use(MenuSizeContext), undefined, "kui-menu-label", className);
  if (!React.use(MenuInGroupContext)) return <div {...skeleton} {...props} />;
  return <BaseMenu.GroupLabel {...skeleton} {...props} />;
}

/* ── Checkable rows: the family's selected state (§21 — selected speaks accent). The
      indicator IS the leading slot and stays mounted, so the gutter reserves in both
      states (most of the `inset` question answered by geometry) and motion has something
      to animate when it lands. Artwork is the checkbox's own stroked glyphs (§4): strokes
      scale across the ladder, currentColor inherits the row's ink. ─────────────────────── */

function checkGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4 8.5 6.75 11.25 12 5.75"
        stroke="currentColor"
        strokeWidth={glyphStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function dotGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="8" cy="8" r="3" fill="currentColor" />
    </svg>
  );
}

export type MenuCheckboxItemProps = {
  /**
   * Controlled ticked state, paired with `onCheckedChange`. Ticked shows as the accent colour on
   * the indicator and nothing else, because rows are peers: a chosen row is marked rather than
   * made louder, which is what keeps a menu of ten filters from looking like a ranking.
   */
  checked?: boolean;
  /** Uncontrolled starting state. Mutually exclusive with `checked`. */
  defaultChecked?: boolean;
  /** Fires with the row's new state on every toggle, controlled or not. */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Turns the row off, so the toggle cannot move. Its current state still shows, which is the
   * point: "on, and you may not change it" is information.
   */
  disabled?: boolean;
  /**
   * Close the menu when this row is chosen. Off by default for a checkable row, because toggling
   * several filters is one visit.
   */
  closeOnClick?: boolean;
  /** Typeahead text when children aren't plain text. */
  label?: string;
  /** The tail of the row: a shortcut hint or a count. The head is the tick's reserved gutter. */
  trailing?: React.ReactNode;
  /** The row's words: the thing being toggled, phrased so the ticked state reads as true. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

export function MenuCheckboxItem({ trailing, children, className, ...props }: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem
      {...rowProps(React.use(MenuSizeContext), undefined, "kui-menu-item", className)}
      {...props}
    >
      <BaseMenu.CheckboxItemIndicator keepMounted render={<span data-slot="leading" />}>
        {checkGlyph()}
      </BaseMenu.CheckboxItemIndicator>
      {children}
      {slot(trailing, "trailing")}
    </BaseMenu.CheckboxItem>
  );
}

export type MenuRadioGroupProps = {
  /**
   * Controlled chosen value, paired with `onValueChange`. The group holds the choice and the rows
   * only report it, which is why exclusivity needs no bookkeeping at the call site.
   */
  value?: string;
  /** Uncontrolled starting choice. Mutually exclusive with `value`. */
  defaultValue?: string;
  /** Fires with the newly chosen value. There is no un-choosing: a radio group answers a
      question, and the answer for "none of these" is a row of its own. */
  onValueChange?: (value: string) => void;
  /**
   * Turns every row in the group off at once. One statement rather than the same prop repeated
   * per row, so a group that is momentarily unavailable cannot be half-disabled.
   */
  disabled?: boolean;
  /**
   * The `MenuRadioItem` rows, and at most one `MenuLabel` naming the question. A radio group is a
   * group, so the label is wired to it exactly as `MenuGroup`'s is.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

export function MenuRadioGroup(props: MenuRadioGroupProps) {
  // A radio group is a group: Base UI wires its label the same way, so a MenuLabel inside
  // one takes the part, not the fallback.
  return (
    <MenuInGroupContext.Provider value>
      <BaseMenu.RadioGroup {...props} />
    </MenuInGroupContext.Provider>
  );
}

export type MenuRadioItemProps = {
  /**
   * What this row answers with. The group compares it against its own value to decide which row is
   * marked, so it has to be unique inside the group. Two rows sharing a value are one choice drawn
   * twice.
   */
  value: string;
  /**
   * Turns the row off, so it cannot be chosen. It still shows whether it currently is the choice,
   * which is the case this matters for: the answer you are stuck with.
   */
  disabled?: boolean;
  /**
   * Close the menu when this row is chosen. Off by default, like the checkable row's, because
   * staying open is what lets you watch the dot land where you put it. Turn it on where choosing
   * is the whole visit.
   */
  closeOnClick?: boolean;
  /** Typeahead text when children aren't plain text. */
  label?: string;
  /**
   * The tail of the row: a shortcut hint or a count. The head is the dot's reserved gutter,
   * mounted whether or not this is the chosen row.
   */
  trailing?: React.ReactNode;
  /** The row's words: the option itself, not a sentence about it. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

export function MenuRadioItem({ trailing, children, className, ...props }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem
      {...rowProps(React.use(MenuSizeContext), undefined, "kui-menu-item", className)}
      {...props}
    >
      <BaseMenu.RadioItemIndicator keepMounted render={<span data-slot="leading" />}>
        {dotGlyph()}
      </BaseMenu.RadioItemIndicator>
      {children}
      {slot(trailing, "trailing")}
    </BaseMenu.RadioItem>
  );
}

/* ── Submenus ─────────────────────────────────────────────────────────────────────────── */

/** The submenu's own trigger — the anchor whose panel the seam is measured from. */
const MenuSubTriggerContext = React.createContext<React.RefObject<HTMLElement | null> | null>(
  null,
);

export type MenuSubProps = {
  /**
   * Controlled open state of this submenu, paired with `onOpenChange`. It is independent of the
   * menu the row sits in: a submenu opens and closes on its own row, and closing it leaves the
   * parent panel standing. Rarely needed, because opening is the sub-trigger's job.
   */
  open?: boolean;
  /** Uncontrolled starting state. Mutually exclusive with `open`. */
  defaultOpen?: boolean;
  /** Fires on every open and close of this submenu, including the ones it handles itself
      (the pointer leaving its row, Escape, choosing a row inside it). */
  onOpenChange?: (open: boolean) => void;
  /**
   * The `MenuSubTrigger` row and the `MenuSubContent` panel it opens. MenuSub renders no DOM of
   * its own, only state and wiring, exactly like the root.
   */
  children?: React.ReactNode;
};

export function MenuSub({ open, defaultOpen, onOpenChange, children }: MenuSubProps) {
  const triggerRef = React.useRef<HTMLElement | null>(null);
  /* The submenu's anchor is its trigger ROW, not the root trigger (§22's own width-compounding
     lesson, now applied to the ENTRY's measurement): the floating body reads `anchor()` for
     the floor and the lean, and inheriting the root's would feed a submenu the width of a
     button it does not hang from. Direction and measure stay the root's — a subtree cannot
     change which way the text runs. */
  const parentDir = React.use(FloatingDirectionContext);
  const dir = React.useMemo(
    () => ({ ...parentDir, anchor: () => triggerRef.current }),
    [parentDir],
  );
  return (
    <MenuSubTriggerContext.Provider value={triggerRef}>
    <FloatingDirectionContext.Provider value={dir}>
    <BaseMenu.SubmenuRoot
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
    >
      {children}
    </BaseMenu.SubmenuRoot>
    </FloatingDirectionContext.Provider>
    </MenuSubTriggerContext.Provider>
  );
}

export type MenuSubTriggerProps = {
  /** Turns the row off, so the child menu cannot be opened. */
  disabled?: boolean;
  /** Typeahead text when children aren't plain text. */
  label?: string;
  /**
   * Artwork at the head of the row, in the same reserved gutter every other row uses. Only the
   * head: the tail belongs to the system here, because the chevron that says a child menu exists
   * is not a call-site decision.
   */
  leading?: React.ReactNode;
  /**
   * The row's words: the name of the group of actions inside, not an action itself. Choosing this
   * row opens a panel. It never does anything else.
   */
  children?: React.ReactNode;
  /** Your classes, appended rather than replacing the component's own. They land on the row that
      opens the submenu. */
  className?: string;
  /** Inline styles, merged last. They land on the row that opens the submenu. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** A row that opens a child menu. The chevron is the row's own statement (trailing slot,
    the icon box prices it); while the child is open the row stays lit via
    [data-popup-open] — the shared row rule, not a menu-specific one. */
export function MenuSubTrigger({
  leading,
  children,
  className,
  ref,
  ...props
}: MenuSubTriggerProps) {
  // The child panel measures its seam from the panel this row sits in (§22).
  const captured = React.use(MenuSubTriggerContext);
  return (
    <BaseMenu.SubmenuTrigger
      {...rowProps(React.use(MenuSizeContext), undefined, "kui-menu-item", className)}
      {...props}
      ref={mergeRefs(ref, (node: HTMLElement | null) => {
        if (captured) captured.current = node;
      })}
    >
      {slot(leading, "leading")}
      {children}
      <span data-slot="trailing">
        <svg
          className="kui-menu-chevron"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M6 4.5 L8.7 7.2 Q9.5 8 8.7 8.8 L6 11.5"
            stroke="currentColor"
            strokeWidth={glyphStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </BaseMenu.SubmenuTrigger>
  );
}

export type MenuSubContentProps = {
  /**
   * The child panel's rows, written exactly as a top-level panel's are, including a further
   * `MenuSub`, which nests with no depth limit. What differs is the geometry, and that belongs to
   * the system: the panel takes its width from what is in it rather than from the panel it came
   * out of.
   */
  children?: React.ReactNode;
  /** Your classes, appended rather than replacing the component's own. They land on the popup,
      not on the positioner around it. */
  className?: string;
  /** Inline styles, merged last. They land on the popup, not on the positioner around it. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** The child panel. No positioning props on purpose: a submenu's geometry is the system's
    (opens outward, first row aligned with its trigger), not a call-site choice. */
export function MenuSubContent({ children, className, style, ref }: MenuSubContentProps) {
  const trigger = React.use(MenuSubTriggerContext);
  // One measurement, both axes: flush against the parent PANEL (not against the row, which
  // sits inside the panel's padding), and the child's first row level with the trigger row.
  const seam = () => panelSeam(trigger?.current ?? null);
  return (
    <BaseMenu.Portal>
      <PortalScope>
        <BaseMenu.Positioner sideOffset={seam} alignOffset={() => -seam()}>
          {/* A submenu's seam is measured at open, not knowable at render — its lean crosses
              a full row width, so the seam-sized remainder is invisible and 0 is honest. */}
          <MenuPopup anchored={false} className={className} style={style} ref={ref}>
            {children}
          </MenuPopup>
        </BaseMenu.Positioner>
      </PortalScope>
    </BaseMenu.Portal>
  );
}
