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
import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import {
  FloatingBody,
  FloatingDirectionContext,
  PortalScope,
  SIDE_OFFSET,
  useAmbientDirection,
} from "../../system/floating.tsx";
import { useMergedRefs } from "../../system/render.ts";
import type { Size, SlotName } from "../../system/axes.ts";
import { rowProps } from "../../system/rows.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { GlassScope, useMaterial, type SurfaceMaterial, themeDefaults } from "../../theme/theme.tsx";
import { useSize } from "../../system/size.ts";
import { glyphStroke } from "../../tokens/config.ts";
import { CHECK_PATH, CHEVRON_DOWN_PATH, GLYPH_VIEWBOX } from "../../system/glyphs.ts";

/* `themeDefaults.size`, never a literal: this default is only reachable in an invalid tree
   (a part outside its root), and nine private copies of the number 2 is nine claims about a
   rest that the app can now move (2026-09-05). */
const SelectSizeContext = React.createContext<Size>(themeDefaults.size);

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

export type SelectProps = ComponentRefusals & {
  /**
   * Sets the size step of the trigger and the panel. The rows, the icons and the text all use it.
   * Inside a `Field`, the field's size applies when you don't set this.
   */
  size?: Size;
  /**
   * Maps each value to the label that the closed trigger shows. The trigger reads its text only
   * from this map, not from the option you clicked. Without it, the trigger shows the raw value.
   * You can leave it out if each value is the same as its label.
   */
  items?: Record<string, React.ReactNode>;
  /**
   * The chosen value, when you control it. Use it with `onValueChange`. The trigger shows this
   * value, or its label from `items`.
   */
  value?: string;
  /** The value at the start, when the select controls its own value. Don't use it with `value`. */
  defaultValue?: string;
  /**
   * Called when the chosen value changes. It isn't called when the panel opens or closes.
   * The value is `null` when the select clears it. This occurs when the options change and no
   * longer include the current value, for example a region list that changes with the country.
   */
  onValueChange?: (value: string | null) => void;
  /** The name of the field when a form is submitted. The select sends its value through a hidden input. */
  name?: string;
  /** Makes a value necessary before the form can submit, as on a native `<select>`. The browser does the check. */
  required?: boolean;
  /**
   * Turns off the whole control. The panel can't open, and the form doesn't submit the value.
   * There's no `readOnly`. For a value that must submit but can't change, use a disabled select
   * and your own hidden input with the value.
   */
  disabled?: boolean;
  /**
   * Whether the panel is open, when you control it. Use it with `onOpenChange`. Opening the panel
   * doesn't change the value.
   */
  open?: boolean;
  /** Whether the panel is open at the start, when the select controls it. Don't use it with `open`. */
  defaultOpen?: boolean;
  /**
   * Called when the panel opens or closes. It isn't called when the value changes. Use
   * `onValueChange` for that.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * A `<SelectTrigger>` and a `<SelectContent>`. `Select` renders no element of its own.
   */
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
  const size = useSize(sizeProp);
  const dir = useAmbientDirection();
  // CHANGES 2026-08-26: `v == null` guards `String(v)`. Base UI's own value-reset (a dependent
  // select whose option set is replaced) calls back with `null`, and stringifying it reported
  // the literal "null" as a chosen value — which a controlled consumer writes straight back in.
  const report = onValueChange
    ? { onValueChange: (v: unknown) => onValueChange(v == null ? null : String(v)) }
    : {};
  return (
    <SelectSizeContext.Provider value={size}>
      <FloatingDirectionContext.Provider value={dir}>
        {/* Base UI positions from its own direction context, not from CSS (§20). */}
        <DirectionProvider direction={dir.direction}>
          <BaseSelect.Root
            {...report}
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

export type SelectTriggerProps = ComponentRefusals & Omit<
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
  /** The text that the trigger shows, in a muted colour, while no value is chosen. */
  placeholder?: string;
  /**
   * Set `backdrop` when the trigger sits over other content, such as an image. The trigger then
   * uses the theme's material. If you don't set it, the trigger follows the nearest
   * `<Box backdrop>`.
   */
  backdrop?: boolean;
  /** Adds your classes to the trigger. The component's own classes stay. */
  className?: string;
  /** Adds inline styles to the trigger. Your styles apply last. */
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
  const lensRef = useLensRef<HTMLElement>(material, undefined);
  const cls = "kui-control kui-field kui-select-trigger";
  const setTrigger = useMergedRefs(ref, measure, lensRef);
  return (
    <BaseSelect.Trigger
      className={className ? `${cls} ${className}` : cls}
      data-size={size}
      data-tone="neutral"
      // Solid is the absence of a material, so it writes no attribute (§10, TextField's own
      // spelling).
      data-material={material === "solid" ? undefined : material}
      {...props}
      ref={setTrigger}
    >
      <BaseSelect.Value
        className="kui-select-value"
        {...(placeholder !== undefined ? { placeholder } : {})}
      />
      <span className="kui-field-slot" data-slot={"trailing" satisfies SlotName}>
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d={CHEVRON_DOWN_PATH}
            stroke="currentColor"
            strokeWidth={glyphStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </BaseSelect.Trigger>
  );
}

/* ── Content: the fold (§22's sentence, §23's member) ─────────────────────────────────── */

/**
 * Props for the panel. Standard `<div>` props, such as `aria-label`, go to the panel element.
 */
export type SelectContentProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "className" | "style"
> & {
  /**
   * The options: `SelectItem` elements, in `SelectGroup` elements with a `SelectLabel` if you
   * need groups. Don't use a `<Separator>` here. Use groups to divide the options.
   */
  children?: React.ReactNode;
  /** Adds your classes to the panel. The component's own classes stay. A width or a maximum height that you set applies to the panel. */
  className?: string;
  /** Adds inline styles to the panel. Your styles apply last. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** The panel's surface identity — the menu popup's constants, self-keyed (§23). data-size
    is stamped for the concentric corner (the floating size join reads it). */
function popupProps(size: Size, material: SurfaceMaterial, className?: string) {
  // `kui-floating-anchored` carries the width floor since 2026-09-12 (audit C10) — a select's
  // panel is always anchored to its trigger, so the class is unconditional here. The rule it
  // stands for is unchanged and lives in surfaces.css now, where three files had spelled it.
  const identity =
    "kui-surface kui-floating kui-floating-rows kui-floating-anchored kui-select-popup";
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
 * again, which is the macOS and Radix placement: the panel opens with the chosen row already
 * on the value it replaces.
 *
 * Base UI falls back to the ordinary side placement by itself — for keyboard opens, and when
 * the row cannot reach the trigger near a viewport edge — and it stamps `data-side="none"`
 * when the overlap is live. The panel appears at once, already placed. Motion was removed
 * 2026-09-20; docs/archive/motion-v1.md records it.
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
  rest,
}: {
  children?: React.ReactNode | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  ref?: React.Ref<HTMLDivElement> | undefined;
  rest: Record<string, unknown>;
}) {
  // A floating pane is over content BY CONSTRUCTION (2026-08-17, the backdrop selectivity):
  // it covers the app, so it always has something to bend and always expresses the theme.
  const material = useMaterial({ backdrop: true });
  // §10 — the lens on the pane itself (see Card).
  const lensRef = useLensRef<HTMLDivElement>(material, ref);
  return (
    <BaseSelect.Popup
      {...rest}
      {...popupProps(React.use(SelectSizeContext), material, className)}
      style={style}
      ref={lensRef}
    >
      {/* DELIBERATELY no ScrollArea here while Menu has one (2026-08-17, Kushagra: "skip it
          on select for now"). ONE mechanism cares about WHO the scroll container is: the
          overlap placement — Base UI aligns the chosen row on the trigger by controlling its
          own scroller's position and its height, so an interposed viewport moves the very
          thing the placement is computed from. That is a measurement, not an assumption:
          measure the overlap against a ScrollArea viewport before adopting. */}
      <FloatingBody>
        <GlassScope material={material}>{children}</GlassScope>
      </FloatingBody>
    </BaseSelect.Popup>
  );
}

/**
 * The listbox, with its portal, theme and positioner already assembled.
 *
 * It takes no placement props at all, and that is deliberate: a select's panel is placed by what
 * is inside it — the chosen row lands on the value it replaces — so `side` and `align` are not
 * questions a call site gets to answer.
 */
export function SelectContent({ children, className, style, ref, ...rest }: SelectContentProps) {
  return (
    <BaseSelect.Portal>
      <PortalScope>
        <BaseSelect.Positioner side="bottom" align="start" sideOffset={SIDE_OFFSET}>
          <SelectPopup className={className} style={style} ref={ref} rest={rest}>
            {children}
          </SelectPopup>
        </BaseSelect.Positioner>
      </PortalScope>
    </BaseSelect.Portal>
  );
}

/* ── Rows ─────────────────────────────────────────────────────────────────────────────── */

export type SelectItemProps = ComponentRefusals & {
  /** The value of this option. The form submits it, and the trigger shows it or its label from `items`. */
  value: string;
  /**
   * Turns off the option, so you can't choose it. The option stays in the list, and screen
   * readers still announce it.
   */
  disabled?: boolean;
  /**
   * The text of the option in the panel. The closed trigger doesn't show this text. If the label
   * isn't the same as the value, put it in the `items` prop of `Select` too.
   */
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
      {...rowProps(React.use(SelectSizeContext), "kui-select-item", { ...(className !== undefined ? { className } : {}) })}
      {...props}
    >
      {/* The tick is the system's own drawing, not this file's (audit 2026-09-12, X3). It was
          hand-written here — `M3.5 8.5 6.5 11.5 12.5 4.5` — while Checkbox, Menu and now
          Combobox all draw `CHECK_PATH`, so a select's chosen row wore a DIFFERENT tick from
          every other chosen thing in the library, and the glyphs law could not see it because
          it matches only the exact shared string. Combobox is what made the two visible side by
          side: the same panel shape, one row over. */}
      <BaseSelect.ItemIndicator keepMounted render={<span data-slot={"leading" satisfies SlotName} />}>
        <svg viewBox={GLYPH_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d={CHECK_PATH}
            stroke="currentColor"
            strokeWidth={glyphStroke}
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

export type SelectGroupProps = ComponentRefusals & {
  /**
   * The `SelectItem` options in the group, and one `SelectLabel` that names them. Put the label
   * inside the group. Screen readers then announce the group name with its options.
   */
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

export type SelectLabelProps = ComponentRefusals & {
  /**
   * The name of the options below it. You can't choose a label, so don't write it like an option.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** A heading for option rows: the row skeleton for alignment, control-ness stood down.
    Legal in a group and legal on its own; see SelectInGroupContext for why both. */
export function SelectLabel({ className, ...props }: SelectLabelProps) {
  const skeleton = rowProps(React.use(SelectSizeContext), "kui-select-label", { ...(className !== undefined ? { className } : {}) });
  if (!React.use(SelectInGroupContext)) return <div {...skeleton} {...props} />;
  return <BaseSelect.GroupLabel {...skeleton} {...props} />;
}
