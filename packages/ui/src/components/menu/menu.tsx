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

import { Theme } from "../../theme/theme.tsx";
import { filled, unwrapLazy, type RenderElement } from "../../system/render.ts";
import type { Size, SlotName } from "../../system/axes.ts";

/* ── Designed constants (§22, v0 — the switchInset precedent: Base UI takes numbers, so
      these cannot ride CSS tokens; one home, judged in the playground) ─────────────────── */

/** Gap between the trigger's edge and the popup. */
const SIDE_OFFSET = 4;
/** Submenus sit flush against their parent panel and align their first row with the
    trigger row: pulled up by the popup's own padding (must track `menuPadding`). */
const SUB_ALIGN_OFFSET = -4;

/* ── Size context: the menu answers `size` like Button (Kushagra, 2026-08-09 — a size-4
      button must not open a size-2 dropdown). One provider on the root; every row stamps
      the index on its own element, because the size join keys [data-size] per element and
      the cells are inherits:false on purpose. Crosses the portal with React (§20). ─────── */

const MenuSizeContext = React.createContext<Size>("2");

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

export type MenuProps = {
  /** §4 — the same index the trigger wears; rows, glyphs and type all price from it. */
  size?: Size;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

/** Renders no DOM — state and wiring only (Base UI Root + the size context). */
export function Menu({ size = "2", open, defaultOpen, onOpenChange, children }: MenuProps) {
  return (
    <MenuSizeContext.Provider value={size}>
      <BaseMenu.Root
        {...(open !== undefined ? { open } : {})}
        {...(defaultOpen !== undefined ? { defaultOpen } : {})}
        {...(onOpenChange !== undefined ? { onOpenChange } : {})}
      >
        {children}
      </BaseMenu.Root>
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
function rootsInButton(el: RenderElement, depth = 0): boolean {
  const target = unwrapLazy(el);
  if (typeof target.type === "string") return target.type === "button";
  const inner = target.props?.render;
  if (depth < 4 && React.isValidElement(inner)) return rootsInButton(inner as RenderElement, depth + 1);
  return true;
}

export type MenuTriggerProps = {
  /** Usually a Kookie Button: `<MenuTrigger render={<Button/>}>Open</MenuTrigger>`. */
  render?: RenderElement;
  /**
   * Whether the rendered element really is a `<button>`. Inferred from `render` exactly as
   * Button infers it, and almost never passed — the escape is for a custom component whose
   * own root is a button, where inspection cannot see through it (§5).
   */
  nativeButton?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

export function MenuTrigger({ render, nativeButton, ...props }: MenuTriggerProps) {
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
  /** §10 — backdrop defense, opt-in always: over a solid parent it blurs nothing. */
  material?: "solid" | "thin" | "regular" | "thick";
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** The popup's surface identity — Card's constants (§10): the tone indirection needs a
    family for --tone-border, the fill is the seal, quiet + bordered is §11's row for
    Menu. NO data-size: the panel's padding does not answer the index (its rows do), and
    stamping it would put the surface size join above menu.css's own declarations. */
function popupProps(
  material: MenuContentProps["material"],
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
    ? "kui-surface kui-floating kui-menu-popup kui-menu-anchored"
    : "kui-surface kui-floating kui-menu-popup";
  return {
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    ...(material && material !== "solid" ? { "data-material": material } : {}),
    className: className ? `${identity} ${className}` : identity,
  } as const;
}

export function MenuContent({
  side = "bottom",
  align = "start",
  sideOffset = SIDE_OFFSET,
  material = "solid",
  children,
  className,
  style,
  ref,
}: MenuContentProps) {
  return (
    <BaseMenu.Portal>
      <Theme>
        <BaseMenu.Positioner side={side} align={align} sideOffset={sideOffset}>
          <BaseMenu.Popup
            {...popupProps(material, true, className)}
            {...(style !== undefined ? { style } : {})}
            {...(ref !== undefined ? { ref } : {})}
          >
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </Theme>
    </BaseMenu.Portal>
  );
}

/* ── Rows (§21): every item is `kui-control kui-row` riding the existing control cells,
      quiet by STAMP (emphasis is refused — a menu is a list of peers), neutral unless the
      one meaning with its own ink is asked for. ────────────────────────────────────────── */

/** Wraps slot content exactly as Button does — the icon box and pill geometry key on the
    wrapper, and `filled()` keeps `{cond && icon}` from renting a gap. */
function slot(content: React.ReactNode, which: SlotName): React.ReactNode {
  return filled(content) ? <span data-slot={which}>{content}</span> : null;
}

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
  /** §21 — the one meaning a row may carry. Not a palette: the union stays this narrow
      on purpose, and a wider vocabulary is a future decision, never a default. */
  tone?: "destructive";
  disabled?: boolean;
  /** Close the menu when this item is chosen. On by default — a menu is a verb list. */
  closeOnClick?: boolean;
  /** Typeahead text when children aren't plain text. */
  label?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
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
        strokeWidth="2"
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
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Checkable rows stay open by default — toggling several filters is one visit. */
  closeOnClick?: boolean;
  label?: string;
  trailing?: React.ReactNode;
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
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
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
  value: string;
  disabled?: boolean;
  closeOnClick?: boolean;
  label?: string;
  trailing?: React.ReactNode;
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

export type MenuSubProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

export function MenuSub({ open, defaultOpen, onOpenChange, children }: MenuSubProps) {
  return (
    <BaseMenu.SubmenuRoot
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
    >
      {children}
    </BaseMenu.SubmenuRoot>
  );
}

export type MenuSubTriggerProps = {
  disabled?: boolean;
  label?: string;
  leading?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** A row that opens a child menu. The chevron is the row's own statement (trailing slot,
    the icon box prices it); while the child is open the row stays lit via
    [data-popup-open] — the shared row rule, not a menu-specific one. */
export function MenuSubTrigger({ leading, children, className, ...props }: MenuSubTriggerProps) {
  return (
    <BaseMenu.SubmenuTrigger
      {...rowProps(React.use(MenuSizeContext), undefined, "kui-menu-item", className)}
      {...props}
    >
      {slot(leading, "leading")}
      {children}
      <span data-slot="trailing">
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d="M6 4 10 8 6 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </BaseMenu.SubmenuTrigger>
  );
}

export type MenuSubContentProps = {
  material?: "solid" | "thin" | "regular" | "thick";
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** The child panel. No positioning props on purpose: a submenu's geometry is the system's
    (opens outward, first row aligned with its trigger), not a call-site choice. */
export function MenuSubContent({ material = "solid", children, className, style, ref }: MenuSubContentProps) {
  return (
    <BaseMenu.Portal>
      <Theme>
        <BaseMenu.Positioner sideOffset={0} alignOffset={SUB_ALIGN_OFFSET}>
          <BaseMenu.Popup
            {...popupProps(material, false, className)}
            {...(style !== undefined ? { style } : {})}
            {...(ref !== undefined ? { ref } : {})}
          >
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </Theme>
    </BaseMenu.Portal>
  );
}
