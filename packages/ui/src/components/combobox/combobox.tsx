"use client";
/**
 * Combobox (§20, §21, §22, §23, §28, §44) — a field you type into that narrows a list, and picks
 * a VALUE from it.
 *
 * It is Select's sibling and Command's cousin, and it takes one thing from each. From Select:
 * the panel (the fold, the row family, the concentric corner, the reserved tick gutter, the width
 * floored at the control that opened it) and the value machinery (a hidden input, `name`,
 * `required`, a value that is one of the options). From Command: the filtering, which is Base
 * UI's and invents no matching policy, and the list shape that follows from it — `items` in,
 * a render function out, because the list you write is every option and the machine decides
 * which of them exist right now.
 *
 * What is its own is the FIELD. A select's trigger is a field that is pressed; a combobox's is a
 * field that is ENTERED — so it is TextField's wrapper, wearing `kui-control kui-field`, with Base
 * UI's input as the bare `kui-field-input` inside it. The seal, the edge, the focus-as-a-mode
 * ring, material, and the disabled/invalid/read-only arms all arrive by membership; nothing here
 * re-states them.
 *
 * THE BOUNDARY WITH AUTOCOMPLETE. Base UI ships both, and they answer different questions. A
 * Combobox picks a value that IS one of the options: typing narrows the list, and what the field
 * submits is the chosen option, never the letters. An Autocomplete (free text with suggestions —
 * a search box, a tag input, an address line) submits whatever was typed and treats the list as
 * help. That second shape is not this component and is not a prop on it; Command wraps Base UI's
 * Autocomplete for the palette case, and a free-text field with suggestions is recorded open.
 *
 * Part vocabulary follows shadcn/ui's combobox (MIT — https://ui.shadcn.com/docs/components/combobox),
 * adopted with credit. `ComboboxList` and `ComboboxCollection` are Command's own parts one
 * component over: the list is a render function, and a grouped list renders each group's
 * survivors through a collection.
 *
 * FOCUS STAYS IN THE FIELD while the panel is open — Base UI's combobox keeps the caret in the
 * input and moves only the highlight — which is the one thing that differs from Select for the
 * floating runner. The runner already copes: it poses from the anchor it measured (the field
 * wrapper), its page-scroll hold is armed only for a focus that moves into the panel, and a
 * combobox never moves it there.
 */
import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import {
  ComboboxBody,
  FloatingDirectionContext,
  PortalScope,
  SIDE_OFFSET,
  useAmbientDirection,
} from "../../system/floating.tsx";
import { filled, useMergedRefs } from "../../system/render.ts";
import type { Size, SlotName } from "../../system/axes.ts";
import { rowProps } from "../../system/rows.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { GlassScope, useMaterial, type SurfaceMaterial, themeDefaults } from "../../theme/theme.tsx";
import { useSize } from "../../system/size.ts";
import { glyphStroke } from "../../tokens/config.ts";
import { CHECK_PATH, CHEVRON_DOWN_PATH, GLYPH_VIEWBOX } from "../../system/glyphs.ts";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";

/* `themeDefaults.size`, never a literal — the Select/Command sentence: this default is only
   reachable in an invalid tree (a part outside its root). */
const ComboboxSizeContext = React.createContext<Size>(themeDefaults.size);

/**
 * The field's own `<input>`, published by the root so the LIST can borrow the name it already
 * has (audit 2026-09-12, C4).
 *
 * The listbox is `ComboboxList`, and it had no accessible name in the ordinary call site: the
 * name a caller writes goes on the FIELD — `aria-label` on `<ComboboxInput>`, or a `<Field>`'s
 * label, which Base UI resolves onto the input as `aria-labelledby` — and nothing carried it
 * across to the element that holds `role="listbox"`. C4's repair made a name POSSIBLE by
 * accepting the two aria props on `ComboboxList`; it left the ordinary case unnamed, and asking
 * every caller to write the same word twice is the kind of duplication that simply does not get
 * written (measured on /preview/combobox: `aria-label=null, aria-labelledby=null` on every open
 * listbox, including the demos written specifically to name one).
 *
 * A REF RATHER THAN A VALUE, because the name is not knowable during render. `aria-labelledby`
 * is Base UI's, resolved from its own field context, so the only place BOTH routes are visible
 * is the element — which is `useNameWarning`'s own stated reason for reading the DOM one layer
 * up. Published as a ref, so nothing re-renders and the list reads it when it mounts.
 */
const ComboboxFieldContext = React.createContext<React.RefObject<HTMLInputElement | null> | null>(
  null,
);

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

/**
 * What an option may be. A string is its own label and its own submitted value; an object
 * carries both, and Base UI reads `label` for the field's text and `value` for the form without
 * being told. Anything else would need a stringifier prop, and a combobox whose field can paint
 * `[object Object]` is a combobox waiting to — so the shape is closed here instead.
 */
export type ComboboxOption = string | { value: string; label: string };

/** A group of options: the section's name and its own options, which is what lets the filter
    empty a section and hide it rather than leave a heading over nothing. */
export type ComboboxOptionGroup<T extends ComboboxOption = ComboboxOption> = {
  value: string;
  items: readonly T[];
};

export type ComboboxProps<T extends ComboboxOption = ComboboxOption> = ComponentRefusals & {
  /** The same index the field wears. The rows, the glyphs and the type all take it; inside a
      `Field`, the field states it and an explicit value here still wins. */
  size?: Size;
  /**
   * Every option before filtering — flat, or as groups (`{ value, items }`). Base UI matches the
   * typed text against each option's label and renders only what survives, which is why
   * `ComboboxList` takes a function rather than children.
   *
   * **Hold this array stable.** It crosses to the matcher by identity, so an inline literal
   * re-runs the whole filter pass on every unrelated render. Module scope, or a `useMemo`.
   */
  // One array type rather than `T[] | Group<T>[]`: inferring through a union of two ARRAY types
  // makes TypeScript try the group shape as T and fail the constraint, where a union of ELEMENT
  // types infers T from the group's own `items` first.
  items: readonly (T | ComboboxOptionGroup<T>)[];
  /** Controlled value, paired with `onValueChange`. `null` is the empty field. */
  value?: T | null;
  /** Uncontrolled starting value. Mutually exclusive with `value`. */
  defaultValue?: T | null;
  /**
   * Fires when the chosen option changes — on a pick, and with `null` when the field is cleared.
   * It never fires for typing: the letters narrow the list, they are not a value.
   */
  onValueChange?: (value: T | null) => void;
  /** Identifies the field when a form is submitted (Base UI renders the hidden input). */
  name?: string;
  /** Marks the field required for form validation; it lands on the hidden input. */
  required?: boolean;
  /**
   * The `id` of the form this field belongs to, for a combobox rendered outside it. It lands on
   * the HIDDEN input, which is the element that carries the value — which is why it is stated
   * here and refused on `ComboboxInput`: on the visible input it would enrol the letters in the
   * form and leave the chosen option out of it.
   */
  form?: string;
  /** Turns the whole control off: no typing, no panel, nothing submitted. */
  disabled?: boolean;
  /**
   * The value is shown and submitted but cannot change: the panel does not open and the field
   * drops its well, exactly as a read-only TextField does. Unlike Select, this is not refused —
   * the platform defines `readonly` on a text `<input>`, and the field here is one.
   */
  readOnly?: boolean;
  /** Controlled open state of the panel, paired with `onOpenChange`. Opening chooses nothing. */
  open?: boolean;
  /** Uncontrolled starting state for the panel. */
  defaultOpen?: boolean;
  /** Fires when the panel opens or closes — never when the value changes. */
  onOpenChange?: (open: boolean) => void;
  /** The field and the panel: a `<ComboboxInput>` and a `<ComboboxContent>`. Combobox renders no
      DOM of its own, only state and wiring. */
  children?: React.ReactNode;
};

/**
 * REFUSED on the root, each with its reason, so the absences are decisions rather than gaps:
 *
 * - `multiple` — DEFERRED, not refused. A multi-value combobox is chips inside the field, and a
 *   chip inside a field is a hosted control this system has not designed (§4's hosted rule was
 *   written for one control in a slot, not a wrapping row of them). It arrives as its own
 *   decision with its own geometry.
 * - `autoComplete` (Base UI's list/both/inline/none) — the mode is fixed at `list`: the letters
 *   filter, the field never rewrites itself under the caret. Inline completion is a different
 *   gesture and a different component's question.
 * - `autoHighlight` — fixed ON: once you type, the first match is highlighted, so type-three-
 *   letters-and-Enter picks it. Opening by click highlights nothing, because nothing was asked.
 * - `filter`, `limit`, `locale` — Base UI's defaults (a locale-aware "contains" over the label);
 *   an app that wants to narrow differently hands in an already-narrowed `items`. Deferred until
 *   a real case needs a matcher, which is the order Command took.
 * - `modal`, `openOnInputClick`, `grid`, `virtualized`, `inline`, `itemToStringLabel` — designed
 *   defaults or closed by `ComboboxOption`'s shape.
 * - `isItemEqualToValue` — SUPPLIED rather than refused (see `sameOption` below). It was listed
 *   here as "closed by ComboboxOption's shape" and that was false: the shape closes what a
 *   comparison has to READ, not whether one is needed. Base UI's default is `Object.is`.
 */
/**
 * Two options are the same option when they name the same VALUE (audit 2026-09-12, C6).
 *
 * Base UI compares the selected value against each item with `Object.is`, so an object option
 * equal by content but built fresh — `defaultValue={{ value: "Asia/Tokyo", label: "Tokyo" }}`
 * written inline, a controlled `value` rebuilt from a fetch, a list re-mapped on render — matched
 * nothing: measured, every row `aria-selected=false`, no tick anywhere, and ArrowDown starting at
 * the first row, while the field displayed the label and the form submitted it correctly. Half
 * the component agreed the option was chosen and the other half did not.
 *
 * The closed `ComboboxOption` shape is what makes ONE comparator always right here, which is why
 * this is a supplied default rather than a prop: an option is a string or `{ value, label }`, so
 * its identity is its value and there is nothing else it could be. A label is a rendering of that
 * value, so two options with one value and two labels are a call site's own bug, not a case this
 * has to hold open. `Object.is` still answers the string arm identically.
 */
function optionKey(option: unknown): unknown {
  return typeof option === "object" && option !== null && "value" in option
    ? (option as { value: unknown }).value
    : option;
}
const sameOption = (a: unknown, b: unknown) => Object.is(optionKey(a), optionKey(b));

/**
 * A field you type into that narrows a list, and picks a VALUE from it.
 *
 * It holds the state and the wiring and renders no DOM of its own: the field is a
 * `<ComboboxInput>`, the panel a `<ComboboxContent>` holding a `<ComboboxList>`. The letters
 * narrow the list and never become the value — what a form receives is the chosen option, which
 * is the whole boundary with an autocomplete (see the file header).
 *
 * ```tsx
 * <Combobox items={REGIONS} name="region">
 *   <ComboboxInput placeholder="Search regions" />
 *   <ComboboxContent>
 *     <ComboboxEmpty>No region matches.</ComboboxEmpty>
 *     <ComboboxList>{(r: string) => <ComboboxItem key={r} value={r}>{r}</ComboboxItem>}</ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 * ```
 *
 * `disabled`, `readOnly`, `name`, `required` and `form` live HERE and nowhere else — the state
 * is in this root's store and the value is in a hidden input, so a copy of any of them on
 * `ComboboxInput` reaches an element the fact does not live on (audit 2026-09-12, C1/C2). Hold
 * `items` stable; it crosses to the matcher by identity.
 */
export function Combobox<T extends ComboboxOption = ComboboxOption>({
  size: sizeProp,
  onValueChange,
  items,
  children,
  ...props
}: ComboboxProps<T>) {
  // §28 — a Field states the whole unit's index; an explicit prop here always wins.
  const size = useSize(sizeProp);
  const dir = useAmbientDirection();
  // The field's input, for the list to borrow its name from (see `ComboboxFieldContext`). The
  // ROOT owns it because it is the one element both parts can see from.
  const field = React.useRef<HTMLInputElement | null>(null);
  const report = onValueChange
    ? { onValueChange: (v: unknown) => onValueChange((v ?? null) as T | null) }
    : {};
  return (
    <ComboboxSizeContext.Provider value={size}>
      <ComboboxFieldContext.Provider value={field}>
        <FloatingDirectionContext.Provider value={dir}>
          {/* Base UI positions from its own direction context, not from CSS (§20). */}
          <DirectionProvider direction={dir.direction}>
            <BaseCombobox.Root
              items={items as readonly unknown[]}
              autoHighlight
              isItemEqualToValue={sameOption}
              {...report}
              {...(props as Record<string, unknown>)}
            >
              {children}
            </BaseCombobox.Root>
          </DirectionProvider>
        </FloatingDirectionContext.Provider>
      </ComboboxFieldContext.Provider>
    </ComboboxSizeContext.Provider>
  );
}

/* ── The field: TextField's wrapper, entered rather than pressed (§4, §23) ─────────────── */

export type ComboboxInputProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"input">,
  // TextField's shape: the platform's own props pass through and only what the system owns is
  // taken away. `value`/`defaultValue` are the ROOT's — the letters in the field are Base UI's
  // to write (they become the chosen label on a pick), and a second home for them would be a
  // field that can disagree with its own selection. `type` because a combobox is text.
  //
  // AND SO ARE THE STATE AND THE FORM (audit 2026-09-12, C1/C2). Five more props were borrowed
  // from TextField's shape along with everything else, and the borrow is the mistake TextField's
  // own reason exposes: TextField OWNS its input, so a prop on it is a prop on the control. A
  // combobox's state lives in the root's store and its VALUE lives in a hidden input, so every
  // one of these reached an element that is not where the fact lives, and the type promised
  // something the component could not do.
  //
  //   `disabled`  — painted the field dead while the chevron still opened the list, the keyboard
  //                 still changed the value and the form still submitted it (measured: a chevron
  //                 click on a `<ComboboxInput disabled>` opened 3 options and picking Paris gave
  //                 FormData `city=Paris`).
  //   `readOnly`  — same shape: the CSS reads `:read-only` on the input and drops the well, while
  //                 Base UI reads the store and keeps the list live. Escape cleared the value.
  //   `name`      — submitted the LETTERS. Typing "zzz" gave `region=zzz`, and with object options
  //                 a correct pick of London submitted "London" instead of "eu-west" — which is
  //                 the exact thing this component's header promises never happens.
  //   `required`  — validated that something was TYPED, so `checkValidity()` passed with no option
  //                 chosen.
  //   `form`      — enrolled the visible input in the target form and left the hidden one out, so
  //                 the field submitted nothing at all.
  //
  // All five are the ROOT's, and all five behave correctly there. Refused here rather than
  // forwarded: forwarding would put one fact in two places and let them disagree, which is the
  // same "two sources for one state" the audit found in the stylesheet's half of `readOnly`.
  | "disabled"
  | "readOnly"
  | "name"
  | "required"
  | "form"
  | "color" | "className" | "style" | "size" | "children" | "type" | "value" | "defaultValue"
> & {
  /** Before the value: an icon, a unit. Passive; clicking it lands the caret. Empty-safe — the
      package ships no icon set. */
  leading?: React.ReactNode;
  /**
   * Says content passes behind this field, so the theme's material can show. Unset, it follows
   * the surrounding `<Box backdrop>` region.
   */
  backdrop?: boolean;
  /** Applied to the wrapper, which is the element that is the control. */
  className?: string;
  /** Applied to the wrapper, so a `width` sizes the field rather than the text inside it. */
  style?: React.CSSProperties;
  /** Reaches the INPUT — `.focus()`, `.select()`. */
  ref?: React.Ref<HTMLInputElement>;
};

/**
 * The field. The visible control is the WRAPPER (Base UI's input group, which is also what the
 * panel anchors to), and the input inside it is bare — TextField's anatomy criterion met the same
 * way: the chevron sits inside the border, so the border cannot stay on the `<input>`.
 *
 * The chevron is Base UI's TRIGGER rendered AS the trailing slot, not an icon inside one. It is
 * the pointer's way to open the list without typing, and Base UI keeps it out of the tab order
 * (`tabIndex={-1}`) because the keyboard already has ArrowDown in the field — so it is also kept
 * out of the accessibility tree: an unreachable, unnamed button is noise, and the input's own
 * `role="combobox"` already announces that a list is there. It rests in the slot's muted role
 * and points down, which no direction mirrors.
 *
 * "UNREACHABLE" WAS TRUE OF THE KEYBOARD ALONE, and `aria-hidden` on a focusable element is a
 * real violation rather than a tidy fiction (audit 2026-09-12, C5). Base UI's own trigger calls
 * `preventDefault()` on its mousedown — which is what stops a button taking focus — for every
 * pointer type EXCEPT touch, deliberately, because on touch it also declines to focus the input
 * (focusing it would raise the on-screen keyboard for a gesture that asked for a list). The cost
 * it did not intend is that nothing then stops the BUTTON taking focus instead: measured on a
 * Pixel 7, a tap put `document.activeElement` on the `aria-hidden` trigger, Chrome logged
 * "Blocked aria-hidden on an element because its descendant retained focus", and the
 * accessibility tree exposed a focused button named "". A mouse click was correct throughout.
 *
 * So the press keeps its default prevented on every pointer type, which restores the mouse's own
 * behaviour on touch: the button opens the list and focus stays where it was. The alternative the
 * audit offered — drop `aria-hidden` and name the button — was refused because it would make the
 * package ship an English string for a control this component's design says should not be
 * announced at all, and because it fixes the announcement while leaving the stray focus.
 *
 * This is the file's second interaction-time handler and it needs the same recorded exemption the
 * first one has (`recipes.test.ts`'s EXEMPT list, which TextField and TextArea already carry for
 * `focusInput`): the rule is about state styling, and neither of these paints anything.
 *
 * No `render`, on TextField's recorded reason: there are two elements and neither can move.
 * No `trailing`: the trailing edge is the chevron's, and a clear button there would be a second
 * control competing for the one slot a combobox has. Recorded open rather than refused — a clear
 * affordance is real (Base UI ships `Combobox.Clear`); it waits for its geometry beside the
 * chevron.
 */
export function ComboboxInput({
  leading,
  backdrop,
  className,
  style,
  ref,
  "aria-describedby": describedBy,
  ...props
}: ComboboxInputProps) {
  const size = React.use(ComboboxSizeContext);
  // §10 — the app's material; the wrapper is the visible control, so it carries the veil and
  // scopes its slot, exactly as TextField does.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  const lensRef = useLensRef<HTMLDivElement>(material, undefined);
  // The wrapper is the one in-flow node a combobox owns — where ambient direction is read, and
  // what the entry flies out of (§20, §22).
  const { measure } = React.use(FloatingDirectionContext);
  const setWrapper = useMergedRefs<HTMLDivElement>(measure, lensRef);

  const inputRef = React.useRef<HTMLInputElement>(null);
  // …and the ROOT's copy, which is what lets the listbox be named by the field's own label
  // without the caller writing that word twice (see `ComboboxFieldContext`).
  const setInput = useMergedRefs(ref, inputRef, React.use(ComboboxFieldContext));
  const slotId = React.useId();

  // TextField's first debt, verbatim: a press on the padding or the leading adornment lands the
  // caret. The chevron is a `button`, so it keeps its own press and opens the list.
  const focusInput = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, label, [tabindex], [contenteditable]"))
      return;
    const input = inputRef.current;
    if (!input) return;
    event.preventDefault();
    input.focus();
  }, []);

  // C5, above: Base UI prevents this default for every pointer type but touch, and a tap then
  // lands focus on an `aria-hidden` button. Base UI merges a caller's handlers to run FIRST, so
  // this only adds the prevention and takes nothing away — its own mousedown still opens the list.
  const keepFocusOffTrigger = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const hasLeading = filled(leading);
  const describedByAll =
    [describedBy, hasLeading && `${slotId}-l`].filter(Boolean).join(" ") || undefined;

  return (
    <BaseCombobox.InputGroup
      ref={setWrapper}
      className={className ? `kui-control kui-field kui-combobox-field ${className}` : "kui-control kui-field kui-combobox-field"}
      style={style}
      data-size={size}
      // Fixed identity, not API (TextField's): the field is always bordered, neutral.
      data-tone="neutral"
      data-bordered
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
      onMouseDown={focusInput}
    >
      {hasLeading ? (
        <span className="kui-field-slot" data-slot={"leading" satisfies SlotName} id={`${slotId}-l`}>
          <GlassScope material={material}>{leading}</GlassScope>
        </span>
      ) : null}
      <BaseCombobox.Input
        ref={setInput}
        className="kui-field-input"
        aria-describedby={describedByAll}
        {...props}
      />
      <BaseCombobox.Trigger
        className="kui-field-slot kui-combobox-trigger"
        data-slot={"trailing" satisfies SlotName}
        aria-hidden
        onMouseDown={keepFocusOffTrigger}
      >
        <svg viewBox={GLYPH_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d={CHEVRON_DOWN_PATH}
            stroke="currentColor"
            strokeWidth={glyphStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </BaseCombobox.Trigger>
    </BaseCombobox.InputGroup>
  );
}

/* ── Content: the fold (§22's sentence; Select's panel, anchored below) ───────────────── */

export type ComboboxContentProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"div">,
  // `aria-label`/`aria-labelledby` are the LIST's (audit 2026-09-12, C4). They type-checked here
  // and landed on the popup, which Base UI renders as `role="presentation"` — so the name went
  // onto a node the accessibility tree does not expose and the `role="listbox"` inside it stayed
  // nameless, in a demo written specifically to give it one. Select's 2026-08-26 audit is the
  // same defect one component over, and this is the half of it that survived the copy: there the
  // repair was to stop hand-listing props, here it is to put the name on the element that has
  // the role.
  "color" | "className" | "style" | "aria-label" | "aria-labelledby"
> & {
  /** A `<ComboboxList>` and, beside it, a `<ComboboxEmpty>`. A `<Separator>` is refused here as
      in Select: the list is a `listbox`, and a group is the divider a listbox has. */
  children?: React.ReactNode;
  /** Your classes, appended; they land on the popup, not the positioner around it. */
  className?: string;
  /** Inline styles, merged last; they land on the popup. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** The panel's surface identity — Select's, self-keyed. `data-size` is stamped for the
    concentric corner the floating-rows join derives. */
function popupProps(size: Size, material: SurfaceMaterial, className?: string) {
  // `kui-floating-anchored` is the family's width floor since 2026-09-12 (audit C10): "never
  // narrower than the trigger that opened it" was written out in menu.css, select.css and here,
  // byte-identical, with menu.css's own copy carrying the note that the THIRD member is the one
  // that moves it. A combobox is always anchored, so it wears the class unconditionally — only
  // Menu has a panel (a submenu) for which the floor would be wrong.
  const identity =
    "kui-surface kui-floating kui-floating-rows kui-floating-anchored kui-combobox-popup";
  return {
    "data-size": size,
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    ...(material !== "solid" ? { "data-material": material } : {}),
    className: className ? `${identity} ${className}` : identity,
  } as const;
}

/** Split out so `useMaterial()` is read INSIDE `PortalScope` — Menu's and Select's reason: a
    combobox opened from a glass card paints over the page, not inside the card. */
function ComboboxPopup({
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
  // A floating pane is over content by construction, so it always expresses the theme (§10).
  const material = useMaterial({ backdrop: true });
  const lensRef = useLensRef<HTMLDivElement>(material, ref);
  return (
    <BaseCombobox.Popup
      {...rest}
      {...popupProps(React.use(ComboboxSizeContext), material, className)}
      style={style}
      ref={lensRef}
    >
      {/* The list scrolls, the PANEL never does — Menu's arrangement (2026-08-17), not
          Select's. Select withholds the ScrollArea because its item-aligned placement IS a
          scroll offset; a combobox is never item-aligned (it hangs below the field you are
          typing into, so the list can move under the caret without moving the field), which
          leaves nothing for an interposed viewport to break. `focusable={false}` for Menu's
          reason: a presentation wrapper that takes focus is a generic node inside a listbox. */}
      <ScrollArea focusable={false}>
        {/* The anchored family's plan, not Select's: a combobox panel is placed against its
            field and nothing inside it, so it is posed on the mount frame like a menu.

            Its own body rather than the family's, for the one thing that IS this member's
            (audit 2026-09-12, C3): the flight pins a measured height, and a combobox is the
            first member whose content changes WHILE it flies — you open it by typing into it.
            `ComboboxBody` is `FloatingBody` with `followsContent`, which re-aims that one
            number at the list's real height. Everything else about the entry is the family's. */}
        <ComboboxBody>
          {/* A panel boundary resets the group question (Menu's 2026-08-26 audit sentence). */}
          <ComboboxInGroupContext.Provider value={false}>
            <GlassScope material={material}>{children}</GlassScope>
          </ComboboxInGroupContext.Provider>
        </ComboboxBody>
      </ScrollArea>
    </BaseCombobox.Popup>
  );
}

/**
 * The listbox panel, with its portal, theme and positioner already assembled.
 *
 * No placement props. It hangs BELOW the field, start-aligned, at the family's offset, never
 * narrower than the field — and it is never item-aligned the way Select's panel is: the chosen
 * row cannot sit on the field, because the field is where you are typing.
 */
export function ComboboxContent({ children, className, style, ref, ...rest }: ComboboxContentProps) {
  return (
    <BaseCombobox.Portal>
      <PortalScope>
        <BaseCombobox.Positioner side="bottom" align="start" sideOffset={SIDE_OFFSET}>
          <ComboboxPopup className={className} style={style} ref={ref} rest={rest}>
            {children}
          </ComboboxPopup>
        </BaseCombobox.Positioner>
      </PortalScope>
    </BaseCombobox.Portal>
  );
}

/* ── The list and its collection (Command's parts, one component over) ─────────────────── */

export type ComboboxListProps<T> = ComponentRefusals & {
  /** Called for each option (or group) that survives the filter. Static children are refused by
      the type: they would render every option whatever was typed. */
  children: (item: T, index: number) => React.ReactNode;
  /**
   * What the list of options is CALLED. This element carries `role="listbox"`, so this is the
   * only place a name for it can land — a label on `ComboboxContent` reaches the popup around
   * it, which is `role="presentation"`.
   *
   * **Usually unnecessary, and deliberately so.** With neither this nor `aria-labelledby`, the
   * list takes the name the FIELD already has — the `aria-label` on `<ComboboxInput>`, or the
   * `<Field>` label Base UI resolves onto the input — so the ordinary call site names the
   * listbox by naming the combobox, and nobody writes the same word twice. State one here only
   * to give the list a name DIFFERENT from the field's.
   */
  "aria-label"?: string;
  /** The `id` of an element that names the list, where the words are already on screen. */
  "aria-labelledby"?: string;
  className?: string;
  style?: React.CSSProperties;
};

/** The listbox. It renders the survivors of the filter through the function you hand it. */
export function ComboboxList<T = ComboboxOption>({
  children,
  className,
  style,
  "aria-label": label,
  "aria-labelledby": labelledBy,
}: ComboboxListProps<T>) {
  const field = React.use(ComboboxFieldContext);
  const list = React.useRef<HTMLDivElement>(null);
  const stated = label !== undefined || labelledBy !== undefined;

  /**
   * THE LIST TAKES THE NAME THE FIELD ALREADY HAS (audit 2026-09-12, C4).
   *
   * A combobox is ONE thing to a person, and the word that names it is written once, on the
   * field. The listbox is a separate element with a separate role, so the accessibility tree
   * asks it for its own name and got nothing — measured on every open listbox in the preview,
   * `aria-label` and `aria-labelledby` both null, in demos written specifically to name one.
   *
   * MIRRORED FROM THE ELEMENT, not rebuilt from the props, because only one of the two routes
   * is ours: `aria-label` is the caller's prop on `<ComboboxInput>`, while `aria-labelledby` is
   * Base UI's, resolved from a `<Field>`'s label id inside its own render. The input is the one
   * place both answers exist, which is the same reason `useNameWarning` reads the DOM.
   *
   * `aria-labelledby` FIRST, because it is the stronger claim: it points at words that are on
   * screen, and where both are present the platform's own name computation prefers it too — so
   * mirroring in the other order would give the list a different name from its own field.
   *
   * Un-keyed on purpose (`useAmbientDirection`'s precedent): it re-syncs after every render, so
   * a label that changes — a Field's label edited, a locale swapped — reaches the list, at the
   * cost of two `getAttribute` calls. It writes only when the caller stated nothing, so a stated
   * name is never overwritten by the field's.
   *
   * WHAT IT DOES NOT REACH, stated rather than left to be discovered: a bare
   * `<label for={id}>` pointing at the input. There the name is computed from the label ELEMENT
   * and the input carries neither attribute, so there is no id to point the list at — and
   * minting one onto the caller's own `<label>` is a mutation of a node React owns. That call
   * site names the combobox correctly and leaves the listbox unnamed; `aria-label` here is its
   * escape.
   */
  React.useLayoutEffect(() => {
    if (stated) return;
    const el = list.current;
    const input = field?.current;
    if (!el || !input) return;
    const by = input.getAttribute("aria-labelledby");
    const own = input.getAttribute("aria-label");
    if (by) el.setAttribute("aria-labelledby", by);
    else if (own) el.setAttribute("aria-label", own);
  });

  return (
    <BaseCombobox.List
      ref={list}
      className={className ? `kui-combobox-list ${className}` : "kui-combobox-list"}
      {...(style !== undefined ? { style } : {})}
      {...(label !== undefined ? { "aria-label": label } : {})}
      {...(labelledBy !== undefined ? { "aria-labelledby": labelledBy } : {})}
    >
      {children as (item: unknown, index: number) => React.ReactNode}
    </BaseCombobox.List>
  );
}

export type ComboboxCollectionProps<T> = ComponentRefusals & {
  /** Called once per surviving option of the group it sits in. */
  children: (item: T, index: number) => React.ReactNode;
};

/** Renders each surviving option of the `ComboboxGroup` it sits in. */
export function ComboboxCollection<T = ComboboxOption>({ children }: ComboboxCollectionProps<T>) {
  return (
    <BaseCombobox.Collection>
      {children as (item: unknown, index: number) => React.ReactNode}
    </BaseCombobox.Collection>
  );
}

/* ── Rows ─────────────────────────────────────────────────────────────────────────────── */

export type ComboboxItemProps = ComponentRefusals & {
  /** The option this row picks — the item handed to your render function, as it is. */
  value: ComboboxOption;
  /** Turns the option off. It stays in the list and stays announced (Select's sentence). */
  disabled?: boolean;
  /** What the row reads as. The field shows the option's own label on a pick, never these
      words — so write the label here, or what the field shows will differ from the row. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** One option row — SelectItem's anatomy: the indicator stays mounted so chosen and unchosen rows
    align (§21's reserved gutter), and the tick wears the accent glyph through the family's one
    selected rule. */
export function ComboboxItem({ children, className, ...props }: ComboboxItemProps) {
  return (
    <BaseCombobox.Item
      {...rowProps(React.use(ComboboxSizeContext), "kui-combobox-item", {
        ...(className !== undefined ? { className } : {}),
      })}
      {...props}
    >
      <BaseCombobox.ItemIndicator keepMounted render={<span data-slot={"leading" satisfies SlotName} />}>
        <svg viewBox={GLYPH_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d={CHECK_PATH}
            stroke="currentColor"
            strokeWidth={glyphStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </BaseCombobox.ItemIndicator>
      {children}
    </BaseCombobox.Item>
  );
}

/* ── Groups and labels ────────────────────────────────────────────────────────────────── */

/** The MenuLabel lesson (§22): a label outside a group must be a heading, not a crash. */
const ComboboxInGroupContext = React.createContext(false);

export type ComboboxGroupProps = ComponentRefusals & {
  /** This group's own options, so the filter can narrow the section and hide it when it empties. */
  items: readonly ComboboxOption[];
  /** A `ComboboxLabel` naming the section, and a `ComboboxCollection` rendering its options. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** A section. It disappears on its own when nothing in it matches. Zero CSS. */
export function ComboboxGroup(props: ComboboxGroupProps) {
  return (
    <ComboboxInGroupContext.Provider value>
      <BaseCombobox.Group {...props} />
    </ComboboxInGroupContext.Provider>
  );
}

export type ComboboxLabelProps = ComponentRefusals & {
  /** The section's name — never an option. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** A heading for option rows: the row skeleton for alignment, control-ness stood down (Select's
    label, self-keyed). Legal in a group and on its own. */
export function ComboboxLabel({ className, ...props }: ComboboxLabelProps) {
  const skeleton = rowProps(React.use(ComboboxSizeContext), "kui-combobox-label", {
    ...(className !== undefined ? { className } : {}),
  });
  if (!React.use(ComboboxInGroupContext)) return <div {...skeleton} {...props} />;
  return <BaseCombobox.GroupLabel {...skeleton} {...props} />;
}

/* ── Empty ────────────────────────────────────────────────────────────────────────────── */

export type ComboboxEmptyProps = ComponentRefusals & {
  /** What the panel says when nothing matches — your words, in your app's language. A sentence
      goes in as a `<Text>`; the part places it and dresses nothing (Command's 2026-09-04 rule). */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * What the panel shows when the typed text matches nothing. Base UI renders the element on every
 * state — it is a live region, so it must exist before the message arrives or the message is
 * never announced — and fills it only when the list is empty; the stylesheet gives it room only
 * then (Command's `:empty` measurement).
 */
export function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return (
    <BaseCombobox.Empty
      className={className ? `kui-combobox-empty ${className}` : "kui-combobox-empty"}
      {...props}
    />
  );
}
