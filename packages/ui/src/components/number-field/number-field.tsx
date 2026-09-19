"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { GLYPH_VIEWBOX } from "../../system/glyphs.ts";
import { useMergedRefs } from "../../system/render.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { useSize } from "../../system/size.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { glyphStroke } from "../../tokens/config.ts";

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
  /** The value of a controlled field. `null` means the field is empty, not zero. */
  value?: number | null | undefined;
  /** The start value of an uncontrolled field. Use `value` for a controlled field. */
  defaultValue?: number | undefined;
  /**
   * Called on every change of the value. It receives the number, or `null` when the field is
   * empty, and details of the cause: typing, a stepper press or an arrow key. Use this in place
   * of `onChange`, which the field doesn't take.
   */
  onValueChange?:
    | ((value: number | null, eventDetails: BaseNumberField.Root.ChangeEventDetails) => void)
    | undefined;
  /**
   * Called when the value is final: on blur after typing, or when a press is released.
   * `onValueChange` also gets each intermediate value. Use this callback to save the value.
   */
  onValueCommitted?:
    | ((value: number | null, eventDetails: BaseNumberField.Root.CommitEventDetails) => void)
    | undefined;
  /** The lowest permitted value. At this value, the decrease button is disabled. */
  min?: number | undefined;
  /** The highest permitted value. At this value, the increase button is disabled. */
  max?: number | undefined;
  /**
   * The amount that one button press or one arrow key adds or removes. `"any"` turns off the
   * browser's step validation, and each step then moves the value by 1.
   */
  step?: number | "any" | undefined;
  /** The amount that Alt + an arrow key adds or removes. Use it for fine changes. */
  smallStep?: number | undefined;
  /** The amount that Shift + an arrow key adds or removes. Use it for large changes. */
  largeStep?: number | undefined;
  /** Rounds the value to a multiple of `step` when it steps. Otherwise, it steps from the current value. */
  snapOnStep?: boolean | undefined;
  /**
   * Lets a typed value go outside `min` and `max`. The browser then reports the value as out of
   * range when the form submits, and the field doesn't correct it. The buttons and arrow keys
   * still stay in range.
   */
  allowOutOfRange?: boolean | undefined;
  /**
   * The `Intl.NumberFormat` options that format the value. Put a unit, a currency or a percent
   * here, for example `{ style: "currency", currency: "USD" }`. The field shows it in the
   * user's locale, screen readers announce it, and typed text is parsed back to a number.
   */
  format?: Intl.NumberFormatOptions | undefined;
  /** The locale that formats and parses the value. The default is the user's locale. */
  locale?: Intl.LocalesArgument | undefined;
  /** Disables the field. It takes no input, and the whole field shows as disabled. */
  disabled?: boolean | undefined;
  /** Prevents changes to the value. The value stays selectable, and the form still submits it. */
  readOnly?: boolean | undefined;
  /** Prevents form submission while the field is empty. */
  required?: boolean | undefined;
  /** The name of the value in the submitted form. The form submits the number, not the formatted text. */
  name?: string | undefined;
  /** The `id` of the form that the field belongs to. Use it when the field is outside the form. */
  form?: string | undefined;
  /** The `id` of the input. A `<label for>` uses it to name the field. */
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
    // parses nothing in the user's locale, and draws its own spinner inside our box.
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
     * The size step of the field, from `"1"` to `"4"`. It sets the height, padding, corner, text
     * size and buttons, the same as a `Button` or `TextField`. The default comes from the
     * enclosing `Field`, then from the theme.
     */
    size?: Size;
    /**
     * Set `backdrop` when the field sits over other content, such as an image. The field then
     * uses the theme's material. If you don't set it, the field follows the nearest
     * `<Box backdrop>`.
     */
    backdrop?: boolean;
    /** The accessible name of the decrease button. The default is "Decrease". Set it to translate the name. */
    decrementLabel?: string;
    /** The accessible name of the increase button. The default is "Increase". Set it to translate the name. */
    incrementLabel?: string;
    /** A class name for the outer element, which draws the field. */
    className?: string;
    /** Inline styles for the outer element. A `width` here sets the width of the whole field. */
    style?: React.CSSProperties;
    /** A ref to the visible input. Use it to call `.focus()` or `.select()`. To read the number, use `value`. */
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
 * A field that holds a number (§4, §11, §28). TextField's anatomy: the WRAPPER is the control
 * and the input inside it is bare, so the field family's dress, states, invalid and disabled
 * arms, focus ring and glass all arrive by wearing `kui-field`. Decrease and increase are ZONES
 * of that box, edge to edge — ( - | 12 | + ) — each one the field's whole end, as wide as the
 * field is tall, lit by the quiet rung and never travelling (see the zone comment below).
 *
 * Base UI owns the number: parsing and formatting in the user's locale, clamping to
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
 *   "kilogram" }`): Intl writes it into the value in the user's locale, it is announced as
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
  // §10 — the wrapper carries the veil, and the zones inside it are scoped (one glass per
  // stack): a zone states no material of its own, so the veil and the lens are the field's.
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
          gives the decrease zone `order: -1`, which is the whole of it.
          `<label>Seats <NumberField/></label>` binds to the first LABELABLE descendant, and a
          `<button>` is labelable: with the decrease stepper written first, the label named a
          stepper, the input went unnamed, and clicking the words focused a button that is not
          even in the tab order. TextField has no such bug because its input is its first child.
          Nothing else reads this order: the steppers are `tabIndex: -1` (Base UI's decision, so
          sequential focus is unmoved either way), and every rule that dresses a zone keys on its
          `data-step` ATTRIBUTE rather than on a position. */}
      <BaseNumberField.Input ref={setInput} className="kui-field-input kui-number-field-input" {...inputProps} />
      <GlassScope material={material}>
        {/* A ZONE, NOT A HOSTED BUTTON (2026-09-13, Kushagra: "the button being used as is is
            wrong… the right layout is ( - | 12 | + ) so that the ( - | button is the entire
            button area, with hover and click spanning entire left and right block").

            Measured before the change, at size 2: a 20 x 20 button inset 4px on every side of a
            256 x 28 field, so a press 3px inside the field's own edge landed on the FIELD. The
            hosted-control rule (§4) put it there and was right to — that rule exists for a
            control a CALL SITE hosts in a field, where the field's box is the container and the
            button is a guest that must not touch its walls. These two are not guests: the
            component places them, they are the only way to work it with a pointer, and what
            they divide is the field's own box. So the field is three zones edge to edge, and the
            hit area is the block rather than a square floating inside it.

            And the MOTION was the same mistake from the other side. `.kui-button` is what
            travels (button.css): it rises to the pointer and sinks 1px into the page on press,
            because a button sits ON a surface and pressing it puts it INTO that surface. A zone
            inside a contained box has nowhere to go — measured, the stepper rose 0.989px on
            hover and sank 2px on press, carrying its glyph away from the value beside it. The
            repair is structural rather than an override: these wear `kui-control` and NOT
            `kui-button`, so the fill states, the disabled remap and the cursor all arrive and
            the travel never does. That is the segmented control's own arrangement, which is the
            component this most resembles — segments in a track, lighting without moving. */}
        <BaseNumberField.Decrement
          // A render FUNCTION rather than an element: the disabled state lives in Base UI's
          // state (the bound, and read-only), and the zone goes NATIVELY disabled from it, which
          // is what lets the shared remap and the `:disabled` cursor reach it. A zone is never a
          // tab stop, so nothing is lost to the keyboard. It is a direct child of the field, so
          // the shared disabled arm must not read it as the field's own state — that arm
          // excludes a child that is itself a control (recipes.css, 2026-09-20).
          render={(props, state) => (
            <button
              type="button"
              {...(props as React.ComponentPropsWithoutRef<"button">)}
              className="kui-control kui-number-field-step"
              data-step="decrement"
              aria-label={decrementLabel}
              disabled={state.disabled || state.readOnly}
            >
              {minusGlyph()}
            </button>
          )}
        />
        <BaseNumberField.Increment
          render={(props, state) => (
            <button
              type="button"
              {...(props as React.ComponentPropsWithoutRef<"button">)}
              className="kui-control kui-number-field-step"
              data-step="increment"
              aria-label={incrementLabel}
              disabled={state.disabled || state.readOnly}
            >
              {plusGlyph()}
            </button>
          )}
        />
      </GlassScope>
    </BaseNumberField.Root>
  );
}
