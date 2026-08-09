"use client";
/**
 * Select (§20, §21, §23) — the floating family's second member, and the proof the first one
 * generalised: the fold (Portal → PortalScope → Positioner → Popup), the row family, the
 * floating chrome and the concentric corner all arrive from Menu's mechanisms with nothing
 * re-designed. What is NEW is the trigger — a field-shaped control that reports a value —
 * and the value machinery: a hidden input for forms, a placeholder that invites, a selected
 * row that stays marked.
 *
 * Part vocabulary follows shadcn/ui's select (MIT — https://ui.shadcn.com/docs/components/select),
 * adopted with credit; behavior is Base UI's select end to end. SelectValue is deliberately
 * folded INTO the trigger (`placeholder` prop) — a part whose only job is to stand where the
 * value goes earns a prop, not an element.
 */
import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import {
  FloatingDirectionContext,
  PortalScope,
  useAmbientDirection,
} from "../../system/floating.tsx";
import { mergeRefs } from "../../system/render.ts";
import type { Size, SlotName } from "../../system/axes.ts";

/** Gap between the trigger's edge and the panel — the menu's designed constant, restated
    because the second member self-keys (§23). */
const SIDE_OFFSET = 4;

const SelectSizeContext = React.createContext<Size>("2");

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

export type SelectProps = {
  /** §4 — the same index the trigger wears; rows, glyphs and type all price from it. */
  size?: Size;
  /**
   * value → label, for the CLOSED trigger. Base UI resolves an option's label from its
   * mounted ItemText, and a closed panel has none mounted — without this map a select
   * whose panel never opened displays the raw value string. Optional because an
   * always-open or placeholder-resting select never needs it; pass it whenever a
   * defaultValue can paint before the panel first opens.
   */
  items?: Record<string, React.ReactNode>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Identifies the field when a form is submitted (Base UI renders the hidden input). */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

/** Renders no DOM — state and wiring only (Base UI Root, the size context, direction). */
export function Select({ size = "2", onValueChange, children, ...props }: SelectProps) {
  const dir = useAmbientDirection();
  return (
    <SelectSizeContext.Provider value={size}>
      <FloatingDirectionContext.Provider value={dir}>
        {/* Base UI positions from its own direction context, not from CSS (§20). */}
        <DirectionProvider direction={dir.direction}>
          <BaseSelect.Root
            {...(onValueChange ? { onValueChange: (v: unknown) => onValueChange(String(v)) } : {})}
            {...props}
          >
            {children}
          </BaseSelect.Root>
        </DirectionProvider>
      </FloatingDirectionContext.Provider>
    </SelectSizeContext.Provider>
  );
}

/* ── Trigger: a field that is pressed, not entered (§23) ──────────────────────────────── */

export type SelectTriggerProps = {
  /** Shown, in the faint role, while no value is chosen — an empty select INVITES (§15). */
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * A `<button>` wearing the FIELD identity — `kui-field` is worn so the seal, the field edge,
 * the look axis, material and the family's state arms all arrive from the family's own rules
 * (the third field-shaped control promotes the family, TextArea's recorded rule; membership
 * is worn, not copied). select.css stands the two caret facts back down (cursor, selection).
 * The chevron is the trigger's own statement, muted like every passive adornment; it points
 * DOWN, which no direction mirrors. No `render` and no `children`: the value IS the content,
 * and a trigger that could be re-rooted would re-open the a11y question Base UI already
 * answers with a real button.
 */
export function SelectTrigger({ placeholder, className, ref, ...props }: SelectTriggerProps) {
  const size = React.use(SelectSizeContext);
  // The trigger is the one in-flow node a select owns — where ambient direction is read (§20).
  const { measure } = React.use(FloatingDirectionContext);
  const cls = "kui-control kui-field kui-select-trigger";
  return (
    <BaseSelect.Trigger
      className={className ? `${cls} ${className}` : cls}
      data-size={size}
      data-tone="neutral"
      {...props}
      ref={mergeRefs(ref, measure)}
    >
      <BaseSelect.Value
        className="kui-select-value"
        {...(placeholder !== undefined ? { placeholder } : {})}
      />
      <span className="kui-field-slot" data-slot={"trailing" satisfies SlotName}>
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d="M4 6 8 10 12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </BaseSelect.Trigger>
  );
}

/* ── Content: the fold (§22's sentence, §23's member) ─────────────────────────────────── */

export type SelectContentProps = {
  /** Card's own prop (§10): opaque by default, glass opt-in. */
  material?: "solid" | "thin" | "regular" | "thick";
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** The panel's surface identity — the menu popup's constants, self-keyed (§23). data-size
    is stamped for the concentric corner (the floating size join reads it). */
function popupProps(size: Size, material: SelectContentProps["material"], className?: string) {
  const identity = "kui-surface kui-floating kui-select-popup";
  return {
    "data-size": size,
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    ...(material && material !== "solid" ? { "data-material": material } : {}),
    className: className ? `${identity} ${className}` : identity,
  } as const;
}

/**
 * No positioning props at all — a select's geometry is the system's: below the trigger,
 * start-aligned, the designed offset. `alignItemWithTrigger` is pinned FALSE: Base UI's
 * default overlaps the trigger macOS-style, which needs the scroll-arrow parts and a
 * different height model; the dropdown geometry is the one the menu already designed.
 * Recorded open, with the scroll arrows, in the registry's refusals.
 */
export function SelectContent({ material = "solid", children, className, style, ref }: SelectContentProps) {
  return (
    <BaseSelect.Portal>
      <PortalScope>
        <BaseSelect.Positioner side="bottom" align="start" sideOffset={SIDE_OFFSET} alignItemWithTrigger={false}>
          <BaseSelect.Popup
            {...popupProps(React.use(SelectSizeContext), material, className)}
            {...(style !== undefined ? { style } : {})}
            {...(ref !== undefined ? { ref } : {})}
          >
            {children}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </PortalScope>
    </BaseSelect.Portal>
  );
}

/* ── Rows ─────────────────────────────────────────────────────────────────────────────── */

/** The row identity (§21) — the menu's rowProps, self-keyed on the second member. */
function rowProps(size: Size, part: string, className?: string) {
  const cls = `kui-control kui-row ${part}`;
  return {
    "data-size": size,
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    className: className ? `${cls} ${className}` : cls,
  } as const;
}

export type SelectItemProps = {
  /** The value this option names — what the form submits and the trigger displays. */
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** One option row. The indicator stays mounted so chosen and unchosen rows align (§21's
    reserved gutter); the tick wears the accent solid through the family's one selected
    rule. ItemText is what the trigger's value displays. */
export function SelectItem({ children, className, ...props }: SelectItemProps) {
  return (
    <BaseSelect.Item
      {...rowProps(React.use(SelectSizeContext), "kui-select-item", className)}
      {...props}
    >
      <BaseSelect.ItemIndicator keepMounted render={<span data-slot={"leading" satisfies SlotName} />}>
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </BaseSelect.ItemIndicator>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}

/* ── Groups and labels ────────────────────────────────────────────────────────────────── */

/**
 * Base UI's GroupLabel reads its group context unconditionally — the MenuLabel lesson (§22):
 * a label outside a group must be a heading, not a crash, and shadcn's canonical shape puts
 * one directly under Content. Same defense, same shape.
 */
const SelectInGroupContext = React.createContext(false);

export type SelectGroupProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** Base UI wires the group's aria-labelledby to a nested SelectLabel. Zero CSS. */
export function SelectGroup(props: SelectGroupProps) {
  return (
    <SelectInGroupContext.Provider value>
      <BaseSelect.Group {...props} />
    </SelectInGroupContext.Provider>
  );
}

export type SelectLabelProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** A heading for option rows: the row skeleton for alignment, control-ness stood down.
    Legal in a group and legal on its own; see SelectInGroupContext for why both. */
export function SelectLabel({ className, ...props }: SelectLabelProps) {
  const skeleton = rowProps(React.use(SelectSizeContext), "kui-select-label", className);
  if (!React.use(SelectInGroupContext)) return <div {...skeleton} {...props} />;
  return <BaseSelect.GroupLabel {...skeleton} {...props} />;
}
