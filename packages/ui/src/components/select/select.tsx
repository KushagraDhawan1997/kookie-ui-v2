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
  FloatingBody,
  FloatingDirectionContext,
  PortalScope,
  useAmbientDirection,
} from "../../system/floating.tsx";
import { mergeRefs } from "../../system/render.ts";
import type { Size, SlotName } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { GlassScope, useMaterial, type SurfaceMaterial } from "../../theme/theme.tsx";

/** Gap between the trigger's edge and the panel — the menu's designed constant, restated
    because the second member self-keys (§23). */
const SIDE_OFFSET = 4;

/** The seed's lean crosses the trigger-to-panel gap; the entry reads it as a var (§22). */
const GAP_VAR = { "--kui-floating-gap": `${SIDE_OFFSET}px` } as React.CSSProperties;

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
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

/**
 * `readOnly` is REFUSED, and researched rather than designed (§8, 2026-08-09 audit — the
 * checkbox's own refusal, one family over). HTML states that `readonly` does not apply to
 * `<select>`: there has never been a read-only dropdown on the platform, so there is no
 * native appearance to inherit and no user expectation to meet. It shipped accepted for a
 * day, and Base UI honoured it by refusing to open while this system drew nothing at all —
 * measured byte-identical to a live trigger across seven properties in both appearances,
 * hand cursor included, while assistive technology was correctly told it was read-only. Two
 * audiences, two answers, which is worse than not having the prop.
 *
 * The gap it leaves is real and has a platform-shaped answer: a value that must submit but
 * cannot change is a `disabled` trigger beside a hidden input carrying the value, or the
 * value rendered as `<Text>` with no control at all. It joins the closed edges rather than
 * getting an appearance nobody has designed.
 */

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

export type SelectTriggerProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  // The TextField shape (§4): the platform's own props pass through, and only what this
  // system owns is taken away. Hand-listing them instead — which is how this shipped — closed
  // the type against `id`, `form`, `tabIndex`, `autoFocus` and the focus handlers while
  // TypeScript's hyphenated-name exemption waved `aria-*` and `data-*` straight through, so
  // the list both blocked props that work and admitted props it never declared. `id` in
  // particular is what `<label for>` needs, and every other component in the package takes it.
  //
  // `children` is refused because the VALUE is the content — a trigger with children would be
  // a trigger that can disagree with what is selected. `type` because a select's trigger is a
  // button and nothing else; `color`/`className`/`style` because those are the system's.
  "color" | "className" | "style" | "children" | "type"
> & {
  /** Shown, in the faint role, while no value is chosen — an empty select INVITES (§15). */
  placeholder?: string;
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
export function SelectTrigger({
  placeholder,
  className,
  ref,
  ...props
}: SelectTriggerProps) {
  const size = React.use(SelectSizeContext);
  // §10 — the app's material (2026-08-16); the trigger stands in flow, so no portal subtlety.
  const material = useMaterial();
  // The trigger is the one in-flow node a select owns — where ambient direction is read (§20).
  const { measure } = React.use(FloatingDirectionContext);
  // §10 — the lens. The trigger IS a member of the field family, so it owes the same glass
  // its TextField sibling wears, lens included — the family-agreement law caught this the
  // moment TextField had one and the trigger did not.
  const lensRef = useLensRef<HTMLElement>(material !== "solid", undefined);
  const cls = "kui-control kui-field kui-select-trigger";
  return (
    <BaseSelect.Trigger
      className={className ? `${cls} ${className}` : cls}
      data-size={size}
      data-tone="neutral"
      // Solid is the absence of a material, so it writes no attribute (§10, TextField's own
      // spelling).
      data-material={material === "solid" ? undefined : material}
      {...props}
      ref={mergeRefs(ref, measure, lensRef)}
    >
      <BaseSelect.Value
        className="kui-select-value"
        {...(placeholder !== undefined ? { placeholder } : {})}
      />
      <span className="kui-field-slot" data-slot={"trailing" satisfies SlotName}>
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d="M4.5 6 L7.2 8.7 Q8 9.5 8.8 8.7 L11.5 6"
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
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** The panel's surface identity — the menu popup's constants, self-keyed (§23). data-size
    is stamped for the concentric corner (the floating size join reads it). */
function popupProps(size: Size, material: SurfaceMaterial, className?: string) {
  const identity = "kui-surface kui-floating kui-select-popup";
  return {
    "data-size": size,
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    ...(material !== "solid" ? { "data-material": material } : {}),
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
/** Split out so `useMaterial()` is read INSIDE `PortalScope` — a select opened from a glass
    card paints over the page, not inside the card, and React context follows the tree rather
    than the DOM. Menu's own reasoning, same shape (2026-08-16). */
function SelectPopup({
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
  const material = useMaterial();
  // §10 — the lens on the pane itself (see Card).
  const lensRef = useLensRef<HTMLDivElement>(material !== "solid", ref);
  return (
    <BaseSelect.Popup
      {...popupProps(React.use(SelectSizeContext), material, className)}
      style={{ ...GAP_VAR, ...style }}
      ref={lensRef}
    >
      <FloatingBody>
        <GlassScope material={material}>{children}</GlassScope>
      </FloatingBody>
    </BaseSelect.Popup>
  );
}

export function SelectContent({ children, className, style, ref }: SelectContentProps) {
  return (
    <BaseSelect.Portal>
      <PortalScope>
        <BaseSelect.Positioner side="bottom" align="start" sideOffset={SIDE_OFFSET} alignItemWithTrigger={false}>
          <SelectPopup className={className} style={style} ref={ref}>
            {children}
          </SelectPopup>
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
