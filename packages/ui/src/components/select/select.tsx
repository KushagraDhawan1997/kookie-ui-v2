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
  SelectBody,
  FloatingDirectionContext,
  PortalScope,
  useAmbientDirection,
} from "../../system/floating.tsx";
import { mergeRefs } from "../../system/render.ts";
import type { Size, SlotName } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { GlassScope, useMaterial, type SurfaceMaterial } from "../../theme/theme.tsx";
import { useControlSize } from "../../system/control-size.ts";

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
  /** Controlled value, paired with `onValueChange`. The closed trigger paints the matching
      option's LABEL, not this string — see `items` for the case where no option is mounted
      yet to resolve one. */
  value?: string;
  /** Uncontrolled starting value. Mutually exclusive with `value`, and the case `items`
      exists for: it can paint before the panel has ever opened. */
  defaultValue?: string;
  /** Fires when the chosen value changes — a selection, never an open or a close. */
  onValueChange?: (value: string) => void;
  /** Identifies the field when a form is submitted (Base UI renders the hidden input). */
  name?: string;
  /** Marks the field required for form validation, exactly as on a native `<select>`; it
      lands on the hidden input, so the platform does the enforcing. */
  required?: boolean;
  /** Stands the whole control down: the panel cannot open and the hidden input stops
      submitting. It is also the platform-shaped answer for a value that must not change,
      since `readOnly` is refused: HTML never defined it for `<select>`, so a disabled trigger
      beside a hidden input carrying the value is how that case is spelled. */
  disabled?: boolean;
  /** Controlled open state of the PANEL, paired with `onOpenChange` — Dialog's pattern, which
      the whole library shares. Orthogonal to `value`: opening chooses nothing. */
  open?: boolean;
  /** Uncontrolled starting state for the panel. Mutually exclusive with `open`. */
  defaultOpen?: boolean;
  /** Fires when the panel opens or closes. Not when the value changes — that is
      `onValueChange`, and conflating the two is how a select ends up committing on hover. */
  onOpenChange?: (open: boolean) => void;
  /** The trigger and the content. Select renders no DOM of its own — state and wiring only —
      so this is `<SelectTrigger>` and `<SelectContent>`. */
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
export function Select({ size: sizeProp, onValueChange, children, ...props }: SelectProps) {
  // §28 — a Field states the whole unit's index; an explicit prop here always wins.
  const size = useControlSize(sizeProp);
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
  /** §10 — a placement fact (2026-08-17): content passes behind this trigger, so the
   *  theme's material may express. Unset, reads the ambient `<Box backdrop>` region. */
  backdrop?: boolean;
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
  backdrop,
  className,
  ref,
  ...props
}: SelectTriggerProps) {
  const size = React.use(SelectSizeContext);
  // §10 — the app's material (2026-08-16); the trigger stands in flow, so no portal subtlety.
  // It states placement only (backdrop, 2026-08-17): calm ground resolves solid.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  // The trigger is the one in-flow node a select owns — where ambient direction is read (§20).
  const { measure } = React.use(FloatingDirectionContext);
  // §10 — the lens. The trigger IS a member of the field family, so it owes the same glass
  // its TextField sibling wears, lens included; on-glass never filters, never bends.
  const lensRef = useLensRef<HTMLElement>(material !== "solid" && material !== "on-glass", undefined);
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
  /** The option rows — `SelectItem`, divided by `SelectGroup` and named by `SelectLabel`.
      They are mounted only while the panel is open, which is exactly the case the root's
      `items` map exists for: a closed select has no row to read a label off. A `<Separator>`
      is refused here where a menu takes one (§23) — inside a listbox it is markup an
      accessibility check reports, and a group is the divider the role already has. */
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
 * No positioning props at all — a select's geometry is the system's: the designed offset,
 * start-aligned, and the CHOSEN ROW ON THE TRIGGER (2026-08-17, Kushagra: *"the selected item
 * always appear on top of trigger 1:1, so that the remainder of the list sits a little above
 * and below the trigger depending on the item's position"*).
 *
 * `alignItemWithTrigger` was pinned FALSE on 2026-08-09 and is now Base UI's own default
 * again, which is the macOS and Radix placement. The reversal is not a taste swing: the
 * item-aligned panel is what makes a select's entry HONEST. Our panel animates, and the
 * browser reveals the selected row the instant the select opens — so a panel that is still
 * travelling is a panel whose row is somewhere it will not stay, and the page moved to follow
 * it (see LOG 2026-08-17). Welded to the trigger, the row is already where it ends up and
 * there is nothing for the reveal to chase.
 *
 * Base UI falls back to the ordinary side placement by itself — for keyboard opens, and when
 * the row cannot reach the trigger near a viewport edge — and it stamps `data-side="none"`
 * when the overlap is live.
 *
 * The ENTRY is the family's, unchanged: the panel still flies out of the trigger's own box the
 * way a menu does (§22). What the overlap costs is an ORDERING — Base UI computes it from the
 * panel's real box, so the panel must be placed before it is posed (`placedByContent` in
 * system/floating.tsx).
 *
 * Still refused, and still recorded in the registry: the scroll ARROW parts. They are the
 * mouse-only affordance for a list taller than its panel; the panel scrolls by wheel, trackpad
 * and keyboard without them, and an arrow is a control we have not designed.
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
  // A floating pane is over content BY CONSTRUCTION (2026-08-17, the backdrop selectivity):
  // it covers the app, so it always has something to bend and always expresses the theme.
  const material = useMaterial({ backdrop: true });
  // §10 — the lens on the pane itself (see Card).
  const lensRef = useLensRef<HTMLDivElement>(material !== "solid", ref);
  return (
    <BaseSelect.Popup
      {...popupProps(React.use(SelectSizeContext), material, className)}
      style={{ ...GAP_VAR, ...style }}
      ref={lensRef}
    >
      {/* DELIBERATELY no ScrollArea here while Menu has one (2026-08-17, Kushagra: "skip it
          on select for now"). Two mechanisms care about WHO the scroll container is: the
          overlap placement (Base UI aligns the chosen row on the trigger by controlling its
          own scroller's position) and the curtain (the reveal reads row rects, §23). An
          interposed viewport changes both, and that is a measurement, not an assumption —
          measure the overlap and the curtain against a ScrollArea viewport before adopting. */}
      <SelectBody>
        <GlassScope material={material}>{children}</GlassScope>
      </SelectBody>
    </BaseSelect.Popup>
  );
}

export function SelectContent({ children, className, style, ref }: SelectContentProps) {
  return (
    <BaseSelect.Portal>
      <PortalScope>
        <BaseSelect.Positioner side="bottom" align="start" sideOffset={SIDE_OFFSET}>
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
  /** Stands the option down — it cannot be chosen. It stays in the list and stays announced:
      a choice that is unavailable right now is information, where an absent row says nothing
      about why the thing you were looking for is not there. */
  disabled?: boolean;
  /** What the option READS as. This is the ItemText, so it is also what the closed trigger
      paints once the panel has been opened — before that, the root's `items` map is the only
      thing that can resolve a value to these words. */
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
  /** The `SelectItem` rows this group holds, and at most one `SelectLabel` naming them.
      Placing the label INSIDE is what earns the association: Base UI points the group's
      `aria-labelledby` at it, so the name is announced with each option rather than only
      seen above them. */
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
  /** The heading's words — the name of the group below it, never an option. Nothing here is
      choosable, and a label that reads like a choice is the one way this part misleads. */
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
