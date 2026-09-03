"use client";
/**
 * Combobox (§20, §21, §45) — a field you type into, over a list you pick from.
 *
 * The floating family's fourth rows-panel and the field family's fifth member, and almost
 * nothing here is new: the FIELD is TextField's own wrapper (seal, edge, ring, material and
 * every state arm by membership — the input inside it is bare, exactly as TextField's is), the
 * PANEL is the anchored pane the menu and the select already share (its padding floor, its
 * concentric corner and its anchor-width floor promoted to the shared layer on this, the third
 * member), and the ROWS are `rowProps`. What Combobox designs is what neither a Select nor a
 * TextField has: a value that is CHOSEN from a list but FOUND by typing.
 *
 * Select's rule decides which to reach for: a Select holds a short closed set you scan; a
 * Combobox holds a set too long to scan, so the field filters it. Base UI's own guideline says
 * the same thing, and adds the other edge: free text is not a Combobox — a search box that
 * accepts anything is Autocomplete, which `Command` wraps for its palette.
 *
 * Part vocabulary follows the package's own floating members (Content / Item / Group / Label,
 * shadcn/ui's select spelling adopted with credit on 2026-08-09) and Command's list parts
 * (List / Collection / Empty, Base UI's own names). Behaviour is Base UI's Combobox end to end.
 */
import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
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
import { GlassScope, useMaterial, type SurfaceMaterial } from "../../theme/theme.tsx";
import { useControlSize } from "../../system/control-size.ts";
import { glyphStroke } from "../../tokens/config.ts";
import { CHECK_PATH, CHEVRON_DOWN_PATH, DISMISS_PATH, GLYPH_VIEWBOX } from "../../system/glyphs.ts";
import { Button } from "../button/button.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { Text } from "../text/text.tsx";

const ComboboxSizeContext = React.createContext<Size>("2");

/* ── Root ─────────────────────────────────────────────────────────────────────────────── */

/** A section of items: Base UI's own group shape, so a grouped list is one array. */
export type ComboboxGroupItems<Value> = { value: string; items: readonly Value[] };

export type ComboboxProps<Value> = {
  /** The same index the field wears. The rows, the glyphs and the type all take it. */
  size?: Size;
  /**
   * Everything the list can offer, before filtering — a flat array, or an array of
   * `{ value, items }` groups. Only the rows that match the typed query render, which is why
   * `ComboboxList` takes a function rather than children.
   *
   * An item is a string, or an object. An object of the shape `{ value, label }` needs no
   * help: `label` is what the field shows and `value` is what a form submits. Any other shape
   * states its words through `itemToStringLabel`.
   *
   * **Hold this array stable.** It crosses to the matcher by identity, so an inline literal
   * re-runs the whole filter pass on every unrelated render of whatever holds the combobox.
   */
  items: readonly Value[] | readonly ComboboxGroupItems<Value>[];
  /** Controlled value, paired with `onValueChange`. `null` is "nothing chosen". */
  value?: Value | null;
  /** Uncontrolled starting value. Mutually exclusive with `value`. */
  defaultValue?: Value | null;
  /**
   * Fires when the chosen item changes — on a pick, and on a clear, where it carries `null`.
   * It never fires on an open, a close or a keystroke: what is TYPED is `onInputValueChange`.
   */
  onValueChange?: (value: Value | null) => void;
  /**
   * Fires with the field's text as it is typed. A list fetched from a server narrows on this;
   * a list already in memory never needs it, because filtering is Base UI's.
   */
  onInputValueChange?: (value: string) => void;
  /** Base UI's matcher, if the app wants a different one. Left alone, it is Base UI's own. */
  filter?: (item: Value, query: string) => boolean;
  /** The words an item shows in the field, for item shapes other than `{ value, label }` or a
      string. Base UI reads `label` from that shape without being told. */
  itemToStringLabel?: (item: Value) => string;
  /** Identifies the field when a form is submitted (Base UI renders the hidden input). */
  name?: string;
  /** Marks the field required for form validation; it lands on the hidden input, so the
      platform does the enforcing. */
  required?: boolean;
  /** Turns the whole control off: the field stops taking keystrokes, the panel cannot open and
      the hidden input stops submitting. */
  disabled?: boolean;
  /** Controlled open state of the panel, paired with `onOpenChange`. Independent of the
      value, because opening chooses nothing. */
  open?: boolean;
  /** Uncontrolled starting state for the panel. Mutually exclusive with `open`. */
  defaultOpen?: boolean;
  /** Fires when the panel opens or closes. Not when the value changes: that is `onValueChange`. */
  onOpenChange?: (open: boolean) => void;
  /** The field and the content: a `<ComboboxInput>` and a `<ComboboxContent>`. */
  children?: React.ReactNode;
};

/**
 * `readOnly` is REFUSED on Select's argument (§23, the checkbox's own one family over): a
 * value that must submit but cannot change is a `disabled` field beside the hidden input the
 * root already renders, or the value rendered as `<Text>`. Base UI accepts the prop and would
 * lock the choice while the field still took a caret — two audiences, two answers.
 *
 * `multiple` is DEFERRED, not refused (§45): a strip of removable chips INSIDE a field is a
 * designed geometry this system has not drawn — a chip at hosted scale, its remove button, the
 * caret's place among them, what the field does when they wrap — and Base UI's chips cannot be
 * adopted without answering each. Withholding is the additive direction. A multi-select today
 * is a list of `Checkbox`es in a `Field`, or Tree's multi-selection.
 */

/** Renders no DOM — state and wiring only (Base UI Root, the size context, direction). */
export function Combobox<Value>({
  size: sizeProp,
  onValueChange,
  onInputValueChange,
  onOpenChange,
  filter,
  children,
  ...props
}: ComboboxProps<Value>) {
  // §28 — a Field states the whole unit's index; an explicit prop here always wins.
  const size = useControlSize(sizeProp);
  const dir = useAmbientDirection();
  return (
    <ComboboxSizeContext.Provider value={size}>
      <FloatingDirectionContext.Provider value={dir}>
        {/* Base UI positions — and walks its list — from its own direction context, not from
            CSS (§20). */}
        <DirectionProvider direction={dir.direction}>
          <BaseCombobox.Root
            {...(onValueChange ? { onValueChange: (v: Value | null) => onValueChange(v) } : {})}
            {...(onInputValueChange ? { onInputValueChange: (v: string) => onInputValueChange(v) } : {})}
            {...(onOpenChange ? { onOpenChange: (o: boolean) => onOpenChange(o) } : {})}
            {...(filter ? { filter: (item: Value, query: string) => filter(item, query) } : {})}
            {...(props as React.ComponentProps<typeof BaseCombobox.Root<Value, false>>)}
          >
            {children}
          </BaseCombobox.Root>
        </DirectionProvider>
      </FloatingDirectionContext.Provider>
    </ComboboxSizeContext.Provider>
  );
}

/* ── The field: a TextField that opens (§45) ──────────────────────────────────────────── */

export type ComboboxInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  // TextField's shape (§4): the platform's own props pass through, and only what this system
  // owns is taken away. `size` is HTML's character-count attribute and would shadow the index;
  // `type` because this is a text input and nothing else; `value`/`defaultValue`/`onChange`
  // because the ROOT owns the value — a controlled field is `Combobox`'s `value`, and what is
  // typed is its `onInputValueChange`.
  "color" | "className" | "style" | "children" | "size" | "type" | "value" | "defaultValue" | "onChange"
> & {
  /** Shown in the muted ink while nothing is chosen and nothing is typed. */
  placeholder?: string;
  /** Before the value: an icon, a unit. Passive — the slot decides where it sits and mutes it. */
  leading?: React.ReactNode;
  /**
   * The name of the button that empties the field, shown only while a value is chosen. The
   * system cannot write it in your language, so it defaults in English and takes yours.
   */
  clearLabel?: string;
  /** The name of the chevron that opens the list. Same rule as `clearLabel`. */
  openLabel?: string;
  /** Says content passes behind this field, so the theme's material can show. Unset, it
      follows the surrounding `<Box backdrop>` region. */
  backdrop?: boolean;
  /** Your classes, appended rather than replacing the component's own. They land on the
      WRAPPER, which is the visible control; `ref` reaches the input. */
  className?: string;
  /** Inline styles, merged last. They land on the wrapper. */
  style?: React.CSSProperties;
  /** The `<input>` — what `.focus()` and `.select()` want. */
  ref?: React.Ref<HTMLInputElement>;
};

/**
 * The field. It is TextField's wrapper worn by membership — `kui-control kui-field`, so the
 * seal, the field edge, the ring keyed on the input holding focus, the material, the disabled
 * and invalid arms, and the hosted-control slot geometry (§4) all arrive from the family's own
 * rules — around Base UI's bare `<input>`, which wears `kui-field-input` exactly as TextField's
 * does. There is exactly one box, one border and one ring however many controls sit in it.
 *
 * **The wrapper is Base UI's `InputGroup`, and that is load-bearing.** Base UI anchors the
 * panel to the group when one exists and to the bare input when none does — so without it the
 * panel's floor would be the INPUT's width, narrower than the box the person sees by every
 * slot, and the entry would fly out of a box that is not the field. The group is also what
 * redirects a press on the field's padding into the caret, TextField's own first debt paid by
 * the primitive.
 *
 * Two controls are hosted in the trailing slot, and both are real Buttons at the slot's
 * derived size (§4): the clear ✕, which exists only while a value is chosen, and the chevron,
 * which opens the list for a pointer that would rather browse than type. Neither is a tab
 * stop — Base UI's own default, and right: the keyboard reaches the list by ArrowDown from
 * the field, and empties it by deleting the text. A `render` escape and `children` are
 * refused on TextField's sentence: there are two elements here and neither can move.
 */
export function ComboboxInput({
  leading,
  clearLabel = "Clear",
  openLabel = "Show options",
  backdrop,
  className,
  style,
  ref,
  ...props
}: ComboboxInputProps) {
  const size = React.use(ComboboxSizeContext);
  // §10 — the app's material (2026-08-16). The wrapper is the visible control, so it carries
  // the veil; the hosted buttons sit INSIDE it and are scoped on-glass.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  // The field is the one in-flow node a combobox owns — where ambient direction is read (§20)
  // and where the entry measures the silhouette it flies out of (§22).
  const { measure } = React.use(FloatingDirectionContext);
  // §10 — the lens on the WRAPPER; on-glass never filters, never bends (see Card).
  const lensRef = useLensRef<HTMLElement>(material, undefined);
  const setGroup = useMergedRefs<HTMLElement>(measure, lensRef);
  const cls = "kui-control kui-field kui-combobox";
  return (
    <BaseCombobox.InputGroup
      // A `<span>` for TextField's reason: the field is an inline-level control that sits in a
      // line of controls, and Base UI's default `<div>` would break the line.
      render={<span />}
      ref={setGroup}
      className={className ? `${cls} ${className}` : cls}
      style={style}
      data-size={size}
      // Fixed identity (the field family's): the tone indirection needs a family to resolve
      // --tone-border against, and a field is always bordered.
      data-tone="neutral"
      data-bordered
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
    >
      {leading ? (
        <span className="kui-field-slot" data-slot={"leading" satisfies SlotName}>
          <GlassScope material={material}>{leading}</GlassScope>
        </span>
      ) : null}
      <BaseCombobox.Input ref={ref} className="kui-field-input" {...props} />
      <span className="kui-field-slot" data-slot={"trailing" satisfies SlotName}>
        <GlassScope material={material}>
          <BaseCombobox.Clear
            className="kui-combobox-clear"
            render={<Button emphasis="quiet" iconOnly aria-label={clearLabel} />}
          >
            <svg viewBox={GLYPH_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d={DISMISS_PATH} stroke="currentColor" strokeWidth={glyphStroke} strokeLinecap="round" />
            </svg>
          </BaseCombobox.Clear>
          <BaseCombobox.Trigger
            className="kui-combobox-trigger"
            render={<Button emphasis="quiet" iconOnly aria-label={openLabel} />}
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
        </GlassScope>
      </span>
    </BaseCombobox.InputGroup>
  );
}

/* ── Content: the fold (§22's sentence, §45's member) ─────────────────────────────────── */

export type ComboboxContentProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "className" | "style"
> & {
  /** `ComboboxEmpty` and `ComboboxList`, in that order. */
  children?: React.ReactNode;
  /** Your classes, appended rather than replacing the component's own. They land on the popup,
      not on the positioner around it. */
  className?: string;
  /** Inline styles, merged last. They land on the popup. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** The panel's surface identity — the anchored pane's constants (§22, §23). `data-size` is
    stamped for the concentric corner; `kui-floating-anchored` carries the anchor-width floor,
    and a combobox is ALWAYS anchored, like a select. */
function popupProps(size: Size, material: SurfaceMaterial, className?: string) {
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

/** Split out so `useMaterial()` is read INSIDE `PortalScope` — a combobox opened from a glass
    card paints over the page, not inside the card (Menu's reasoning, 2026-08-16). */
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
  // A floating pane is over content BY CONSTRUCTION (2026-08-17): it always expresses the theme.
  const material = useMaterial({ backdrop: true });
  const lensRef = useLensRef<HTMLDivElement>(material, ref);
  return (
    <BaseCombobox.Popup
      {...rest}
      {...popupProps(React.use(ComboboxSizeContext), material, className)}
      style={style}
      ref={lensRef}
    >
      {/* The list scrolls, the PANEL never does — Menu's shape (2026-08-17), taken whole: the
          popup keeps its glass, corner and cast, the viewport carries the overflow and the ring
          clearance, and the overlay thumb replaces the browser gutter. A select could not take
          this because its overlap placement cares who the scroll container is; a combobox has
          no overlap — its panel hangs below the field the way a menu's hangs below its
          button — so nothing here is measured against the scroller. `focusable={false}` keeps
          the viewport out of the tab order and its role="presentation" real (audit
          2026-08-18). */}
      <ScrollArea focusable={false}>
        <FloatingBody>
          <GlassScope material={material}>{children}</GlassScope>
        </FloatingBody>
      </ScrollArea>
    </BaseCombobox.Popup>
  );
}

/**
 * No positioning props — a combobox's geometry is the system's: the designed offset, below
 * the field, start-aligned, never narrower than the field that opened it. Base UI flips it
 * above by itself when the room below runs out. Refused with the reasons in the registry: a
 * `Backdrop` (the page stays live behind a combobox), `modal`, the `Arrow`, and `Combobox.Value`
 * (the input IS the value).
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

/* ── The list and its rows ────────────────────────────────────────────────────────────── */

export type ComboboxListProps<Value> = {
  /** Called for each item — or, for a grouped `items`, each group — that survives the filter. */
  children: (item: Value) => React.ReactNode;
  className?: string;
};

/** The listbox. It takes a function rather than children, because the rows that exist are
    the ones that survived the query (Command's own sentence). */
export function ComboboxList<Value>({ children, className }: ComboboxListProps<Value>) {
  return (
    <BaseCombobox.List
      className={className ? `kui-combobox-list ${className}` : "kui-combobox-list"}
    >
      {children as (item: unknown) => React.ReactNode}
    </BaseCombobox.List>
  );
}

export type ComboboxItemProps<Value> = {
  /** The item this row names — the same object or string that sits in `items`. */
  value: Value;
  /** Turns the option off. It stays in the list and stays announced, because a choice that is
      unavailable right now is information. */
  disabled?: boolean;
  /** What the row reads as. The field shows the item's `label` (or `itemToStringLabel`), never
      these words. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** One option row (§21). The indicator stays mounted so chosen and unchosen rows align — the
    reserved gutter — and the tick wears the accent through the family's one selected rule. */
export function ComboboxItem<Value>({ children, className, ...props }: ComboboxItemProps<Value>) {
  return (
    <BaseCombobox.Item
      {...rowProps(React.use(ComboboxSizeContext), "kui-combobox-item", {
        ...(className !== undefined ? { className } : {}),
      })}
      {...props}
    >
      <BaseCombobox.ItemIndicator
        keepMounted
        render={<span data-slot={"leading" satisfies SlotName} />}
      >
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

/* ── Groups, labels, the empty sentence ───────────────────────────────────────────────── */

export type ComboboxGroupProps<Value> = {
  /** This group's own items, so the filter can narrow a section and hide it when it empties. */
  items: readonly Value[];
  /** A `ComboboxGroupLabel` and a `ComboboxCollection`. */
  children: React.ReactNode;
  className?: string;
};

/** A section. It disappears on its own when nothing in it matches, which is why a group
    carries its items rather than being pure layout. Base UI wires `aria-labelledby` to the
    label inside it. */
export function ComboboxGroup<Value>({ items, children, className }: ComboboxGroupProps<Value>) {
  return (
    <BaseCombobox.Group
      items={items}
      className={className ? `kui-combobox-group ${className}` : "kui-combobox-group"}
    >
      {children}
    </BaseCombobox.Group>
  );
}

/** The section's name: the row skeleton for alignment, control-ness stood down, in the muted
    ink — Select's label, one member over. */
export function ComboboxGroupLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <BaseCombobox.GroupLabel
      {...rowProps(React.use(ComboboxSizeContext), "kui-combobox-group-label", {
        ...(className !== undefined ? { className } : {}),
      })}
    >
      {children}
    </BaseCombobox.GroupLabel>
  );
}

/** Renders each surviving item of the group it sits in. */
export function ComboboxCollection<Value>({ children }: { children: (item: Value) => React.ReactNode }) {
  return (
    <BaseCombobox.Collection>{children as (item: unknown) => React.ReactNode}</BaseCombobox.Collection>
  );
}

/** What the panel says when nothing matches. Your words, in your language (Command's rule). */
export function ComboboxEmpty({ children, className }: { children: React.ReactNode; className?: string }) {
  const size = React.use(ComboboxSizeContext);
  return (
    <BaseCombobox.Empty className={className ? `kui-combobox-empty ${className}` : "kui-combobox-empty"}>
      <Text size={size === "1" ? "1" : "2"} emphasis="medium">
        {children}
      </Text>
    </BaseCombobox.Empty>
  );
}
