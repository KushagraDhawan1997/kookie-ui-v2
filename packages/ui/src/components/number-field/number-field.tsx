"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import * as React from "react";

import type { Size, SlotName } from "../../system/axes.ts";
import { GLYPH_VIEWBOX } from "../../system/glyphs.ts";
import { useMergedRefs } from "../../system/render.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { useSize } from "../../system/size.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { glyphStroke } from "../../tokens/config.ts";
import { Button, type ButtonProps } from "../button/button.tsx";

type RootProps = BaseNumberField.Root.Props;

/**
 * The behaviour Base UI's root owns, as Base UI spells it.
 *
 * IT IS NO LONGER THE COMPONENT'S PUBLIC DOCUMENTATION, and the reason is a defect this shape
 * caused (2026-09-12). The reference tables are generated from the package's own types, and the
 * generator follows a type ALIAS — `NumberFieldRootProps` is an `interface`, so a `Pick` of it
 * resolved to nothing at all and /components/number-field published six props: `backdrop`,
 * `className`, `decrementLabel`, `incrementLabel`, `size` and `style`. Every number this
 * component exists to take — `format`, `locale`, `onValueChange`, `onValueCommitted`,
 * `smallStep`, `largeStep`, `snapOnStep`, `allowOutOfRange` — was in the type, in the editor's
 * completions, and in no document anywhere; `min`, `max`, `step` and `value` survived only by
 * the accident of also being native `<input>` attributes.
 *
 * TEACHING THE GENERATOR WAS THE OTHER REPAIR AND IT IS NOT THE SMALL ONE. The missing arm is
 * an interface arm, ~10 lines — but `NumberFieldRootProps extends Omit<BaseUIComponentProps
 * <'div', State>, 'onChange'>`, so following it walks a dependency's entire internal surface
 * into our table, for every component whose props chain reaches an interface, and prints Base
 * UI's prose as though this package had written it. Small in lines, not small in effect, and
 * against the stance that this package documents its own surface rather than re-exporting
 * someone else's.
 *
 * So the props are DECLARED below, each with the reason the reference exists to carry — and
 * this Pick stays, for the two jobs that are still its own: it is the key list the native input
 * props are omitted against, and it is the anchor `number-field-types.test.tsx` holds those
 * declarations to, so a signature that moves in Base UI fails `tsc` here rather than turning
 * our documentation into a polite fiction.
 */
export type NumberBehaviour = Pick<
  RootProps,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "onValueCommitted"
  | "min"
  | "max"
  | "step"
  | "smallStep"
  | "largeStep"
  | "snapOnStep"
  | "allowOutOfRange"
  | "format"
  | "locale"
  | "disabled"
  | "readOnly"
  | "required"
  | "name"
  | "form"
  | "id"
>;

/**
 * The same behaviour, DECLARED — which is what puts it in the reference (see `NumberBehaviour`).
 *
 * Every member is held to Base UI's own spelling by `number-field-types.test.tsx`, so this is a
 * documentation surface rather than a second source of truth: a signature that moves upstream
 * fails the build here instead of quietly making these sentences wrong.
 */
export type NumberOwnBehaviour = {
  /** The number, when you hold it yourself. `null` is an empty field — not zero. */
  value?: number | null | undefined;
  /** The number it starts at when you do not hold it. Use `value` for a controlled field. */
  defaultValue?: number | undefined;
  /**
   * Fires on every change, with the number (`null` when the field is empty) and what caused it
   * — typing, a stepper press, an arrow key. The value is a NUMBER, which is why there is no
   * `onChange`: a string handler is the half that cannot read a formatted value back.
   */
  onValueChange?:
    | ((value: number | null, eventDetails: BaseNumberField.Root.ChangeEventDetails) => void)
    | undefined;
  /**
   * Fires when the number SETTLES — on blur after typing, or when a press is released — where
   * `onValueChange` fires on every intermediate value. The one to save with.
   */
  onValueCommitted?:
    | ((value: number | null, eventDetails: BaseNumberField.Root.CommitEventDetails) => void)
    | undefined;
  /** The lowest value. The decrease stepper goes disabled on it rather than disappearing. */
  min?: number | undefined;
  /** The highest value. The increase stepper goes disabled on it rather than disappearing. */
  max?: number | undefined;
  /**
   * How far one press or one arrow key moves the value. `"any"` turns off the browser's own
   * step validation; stepping then moves by 1.
   */
  step?: number | "any" | undefined;
  /** How far Alt + an arrow key moves it — the fine adjustment. */
  smallStep?: number | undefined;
  /** How far Shift + an arrow key moves it — the coarse one. Page Up and Page Down do nothing. */
  largeStep?: number | undefined;
  /** Round to a multiple of the step as it moves, rather than stepping from where it was. */
  snapOnStep?: boolean | undefined;
  /**
   * Let TYPING leave the range, so the browser reports it as out of range on submit instead of
   * the field silently correcting it. Stepping still clamps.
   */
  allowOutOfRange?: boolean | undefined;
  /**
   * Intl options — and the reason this component has no adornment slots. A unit, a currency or
   * a percent belongs here (`{ style: "currency", currency: "USD" }`): Intl writes it into the
   * value in the reader's locale, it is announced as part of the number, and it is parsed back
   * out when the person types. A symbol sitting beside the input does none of the three.
   */
  format?: Intl.NumberFormatOptions | undefined;
  /** The locale to format and parse in. Defaults to the reader's own. */
  locale?: Intl.LocalesArgument | undefined;
  /** Stops the field taking input, and stands its whole box down (§8). */
  disabled?: boolean | undefined;
  /** The value is live, selectable and submitted — only the invitation to type is gone. */
  readOnly?: boolean | undefined;
  /** The form will not submit without a number in it. */
  required?: boolean | undefined;
  /** Names the value in the submitted form. It lands on the hidden input that carries the
      number, never on the text the person is reading. */
  name?: string | undefined;
  /** The form this belongs to, when the field is rendered outside it. */
  form?: string | undefined;
  /** Lands on the input, so a `<label for>` and a `Field` both reach the value. */
  id?: string | undefined;
};

export type NumberFieldProps = ComponentRefusals &
  NumberBehaviour &
  NumberOwnBehaviour &
  Omit<
    React.ComponentPropsWithoutRef<"input">,
    | keyof NumberBehaviour
    // `size` is ours — the index (§4), not the platform's character count.
    | "size"
    // A void element has no children, and the slots are the steppers.
    | "children"
    // Always `text` with a computed `inputMode`: a native `type="number"` field formats nothing,
    // parses nothing in the reader's locale, and draws its own spinner inside our box.
    | "type"
    | "inputMode"
    // The value arrives as a number through `onValueChange`. A string `onChange` would be a
    // second spelling of the same fact, and the half that cannot parse a formatted value.
    | "onChange"
    | "color"
    | "style"
    | "className"
  > & {
    /**
     * The control index, the same ladder Button and TextField use: the height, the side padding,
     * the corner, the value's type step and the two steppers all come from one number. Rests at
     * the enclosing `Field`'s index, else the app's.
     */
    size?: Size;
    /**
     * Says content passes behind this control, so the theme's material can show. Unset, it
     * follows the surrounding `<Box backdrop>` region.
     */
    backdrop?: boolean;
    /** The decrease button's name, in your own language. Defaults to "Decrease". */
    decrementLabel?: string;
    /** The increase button's name, in your own language. Defaults to "Increase". */
    incrementLabel?: string;
    /** Applied to the wrapper, which is the element that is the control. */
    className?: string;
    /** Applied to the wrapper, so a `width` sizes the field rather than the digits inside it. */
    style?: React.CSSProperties;
    /** Reaches the visible INPUT — `.focus()`, `.select()`. The number is `value`, not this. */
    ref?: React.Ref<HTMLInputElement>;
  };

/** −, drawn rather than imported (§8): 16-grid, `currentColor`, the derived `glyphStroke`,
    round caps. Local while it has one consumer, which is `glyphs.ts`'s own rule. It is NOT the
    checkbox's indeterminate dash, though it shares that dash's span on purpose so the two read as
    one weight: that dash means "mixed", this one means "less", and one home is for one meaning. */
function minusGlyph() {
  return (
    <svg viewBox={GLYPH_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4.25 8h7.5" stroke="currentColor" strokeWidth={glyphStroke} strokeLinecap="round" />
    </svg>
  );
}

/** +, the same drawing with a second stroke. */
function plusGlyph() {
  return (
    <svg viewBox={GLYPH_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4.25 8h7.5M8 4.25v7.5"
        stroke="currentColor"
        strokeWidth={glyphStroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A field that holds a number (§4, §11, §28). TextField's anatomy with its two slots spent on
 * the steppers: the WRAPPER is the control, the input inside it is bare, and decrease and
 * increase are real Buttons HOSTED in the leading and trailing slots — so the field family's
 * dress, states, invalid and disabled arms, focus ring and glass all arrive by wearing
 * `kui-field`, and the steppers take §4's hosted-control geometry (one `slotInset` on all four
 * sides, the hosted height derived from it) with no rule of this component's own.
 *
 * Base UI owns the number: parsing and formatting in the reader's locale, clamping to
 * `min`/`max`, `step`/`smallStep`/`largeStep` (alt and shift), arrow keys, Home and End,
 * press-and-hold on the steppers, and a hidden native input that carries the value into a form.
 *
 * The steppers are OUT OF THE TAB ORDER, which is Base UI's decision and the right one: the
 * keyboard already steps from the input, so two more tab stops per field would be two ways to
 * do one thing. They keep their names, so a touch screen reader can still press them. A stepper
 * at its bound, or in a read-only field, is DISABLED — it stays in place so nothing shifts, and
 * it stops looking pressable, which is the thing it stopped being.
 *
 * **Three strings to translate, not two.** `decrementLabel` and `incrementLabel` are props
 * because the platform gives a caller no route to two buttons the SYSTEM places. The third is
 * `aria-roledescription`, which Base UI writes on the input as the English "Number field" —
 * and that one is deliberately NOT a prop: the attribute already reaches the input through the
 * ordinary spread (`<NumberField aria-roledescription="Zahlenfeld" />`), and Base UI merges a
 * caller's props AFTER its own, so the caller's value wins. Minting a prop for it would be a
 * second spelling of one fact, which is the fault this repo keeps paying for rather than the
 * fix; the criterion for a label prop is that the platform leaves no route, and here it does.
 *
 * What it deliberately is not:
 *
 * - **No `leading` or `trailing`.** The slots are the steppers. A unit, a currency or a percent
 *   belongs in `format` (`{ style: "currency", currency: "USD" }`, `{ style: "unit", unit:
 *   "kilogram" }`): Intl writes it into the value in the reader's locale, it is announced as
 *   part of the number, and it is parsed back out when the person types. An adornment beside
 *   the input could do none of those three.
 * - **No `emphasis` and no `tone`**, TextField's refusal verbatim — fields do not rank against
 *   each other. Validity is state: `aria-invalid`, or `data-invalid` from a `Field`.
 * - **No `render` escape**, TextField's refusal verbatim — there are two elements and neither
 *   can move.
 * - **No scrubbing, yet.** Base UI's ScrubArea (drag a label to change the value) and wheel
 *   scrubbing are deferred, not refused: both are a pointer gesture with a cursor of their own
 *   and nothing in this system has designed one.
 */
export function NumberField({
  size: sizeProp,
  backdrop,
  decrementLabel = "Decrease",
  incrementLabel = "Increase",
  className,
  style,
  ref,
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min,
  max,
  step,
  smallStep,
  largeStep,
  snapOnStep,
  allowOutOfRange,
  format,
  locale,
  disabled,
  readOnly,
  required,
  name,
  form,
  id,
  ...inputProps
}: NumberFieldProps) {
  // §28 — a Field states the whole unit's index; an explicit prop here always wins.
  const size = useSize(sizeProp);
  // §10 — the wrapper carries the veil, so the steppers inside it are scoped (one glass per
  // stack): a hosted Button in a glass field resolves on-glass, never a second veil.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  const lensRef = useLensRef<HTMLElement>(material, undefined);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const setInput = useMergedRefs(ref, inputRef);

  // TextField's first debt, paid the same way: a press on the padding lands the caret, and
  // anything focusable — the steppers — is left alone to keep its own press. Base UI's steppers
  // already move focus to the input on a mouse press, so the ring lands either way.
  const focusInput = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, label, [tabindex], [contenteditable]"))
      return;
    const input = inputRef.current;
    if (!input) return;
    event.preventDefault();
    input.focus();
  }, []);

  return (
    <BaseNumberField.Root
      // A span, TextField's element: a field is inline-level like the platform input it stands
      // in for, and a <div> inside a sentence is invalid HTML. Base UI's hidden form input
      // renders as this element's SIBLING, so it is never a direct child the state arms read.
      render={<span />}
      ref={lensRef}
      className={className ? `kui-control kui-field kui-number-field ${className}` : "kui-control kui-field kui-number-field"}
      style={style}
      data-size={size}
      // Fixed identity, not API — TextField's reason: the tone indirection needs a family.
      data-tone="neutral"
      data-bordered
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
      onMouseDown={focusInput}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      onValueCommitted={onValueCommitted}
      min={min}
      max={max}
      step={step}
      smallStep={smallStep}
      largeStep={largeStep}
      snapOnStep={snapOnStep}
      allowOutOfRange={allowOutOfRange}
      format={format}
      locale={locale}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      form={form}
      id={id}
    >
      {/* THE INPUT IS FIRST IN THE DOM, and the steppers are placed visually — number-field.css
          gives the leading slot `order: -1`, which is the whole of it.
          `<label>Seats <NumberField/></label>` binds to the first LABELABLE descendant, and a
          `<button>` is labelable: with the decrease stepper written first, the label named a
          stepper, the input went unnamed, and clicking the words focused a button that is not
          even in the tab order. TextField has no such bug because its input is its first child.
          Nothing else reads this order: the steppers are `tabIndex: -1` (Base UI's decision, so
          sequential focus is unmoved either way), and every rule that dresses a slot keys on the
          `data-slot` ATTRIBUTE rather than on a position — the pill correction, the slot inset,
          the hosted geometry and the focus ring are all attribute or child selectors. */}
      <BaseNumberField.Input ref={setInput} className="kui-field-input kui-number-field-input" {...inputProps} />
      <span className="kui-field-slot" data-slot={"leading" satisfies SlotName}>
        <GlassScope material={material}>
          <BaseNumberField.Decrement
            // A render FUNCTION rather than an element, because the disabled state lives in
            // Base UI's state (the bound, and read-only) and a Button has to be told it to stop
            // looking pressable. `focusableWhenDisabled` keeps Base UI's own branch — a stepper
            // that goes natively disabled mid-hold would drop the press it is in.
            render={(props, state) => (
              <Button
                {...(props as ButtonProps)}
                size={size}
                emphasis="quiet"
                iconOnly
                aria-label={decrementLabel}
                disabled={state.disabled || state.readOnly}
                focusableWhenDisabled
              >
                {minusGlyph()}
              </Button>
            )}
          />
        </GlassScope>
      </span>
      <span className="kui-field-slot" data-slot={"trailing" satisfies SlotName}>
        <GlassScope material={material}>
          <BaseNumberField.Increment
            render={(props, state) => (
              <Button
                {...(props as ButtonProps)}
                size={size}
                emphasis="quiet"
                iconOnly
                aria-label={incrementLabel}
                disabled={state.disabled || state.readOnly}
                focusableWhenDisabled
              >
                {plusGlyph()}
              </Button>
            )}
          />
        </GlassScope>
      </span>
    </BaseNumberField.Root>
  );
}
