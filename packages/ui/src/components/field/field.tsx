"use client";

import { Field as BaseField } from "@base-ui/react/field";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { ControlSizeContext } from "../../system/control-size.ts";
import { Text } from "../text/text.tsx";

export type FieldProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseField.Root>,
  "className" | "render"
> & {
  /**
   * §28 — the control family's index, priced once for the whole unit: the label, the
   * description, the error AND the control inside it.
   *
   * The type steps are the IDENTITY of the control's own — a field at size 2 sets its label
   * at the step its value is set in, because the control size join is itself the identity map
   * (`--kui-ct-font: var(--font-size-N)`). So nothing is designed twice and a law reads the
   * label's computed size against a mounted control's rather than against a number.
   *
   * It reaches the control by context and an explicit prop on the control wins — see
   * `system/control-size.ts` for the three bounds on that mechanism and why it needs them.
   */
  size?: Size;
  /** Dresses the column. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
};

export type FieldLabelProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseField.Label>,
  "className" | "render"
> & { className?: string };

export type FieldDescriptionProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseField.Description>,
  "className" | "render"
> & { className?: string };

export type FieldErrorProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseField.Error>,
  "className" | "render"
> & { className?: string };

/* The step every part of the field is set in. Read from context rather than passed, because a
   part is a sibling of the control in the caller's markup, not a child of anything that could
   pass it a prop. */
const FieldTypeContext = React.createContext<Size>("2");

/**
 * A field (§28) — the unit that makes one input make sense.
 *
 * A control on its own is a box: it does not carry its own name, it cannot say what it is for,
 * and it cannot say what went wrong. Field supplies those three and wires them to the control
 * so assistive technology reads them as one thing.
 *
 * **It passes §10's anatomy criterion by the widest margin in the library, and that is the
 * whole licence for it existing.** Three non-visual forcers stack: label association by id,
 * `aria-describedby` for the description, and the announced error. Nothing about the
 * arrangement is a visual preference — every part exists because a platform contract needs a
 * node to point at. That is AlertDialog's licence (§25) with more forcers, not fewer.
 *
 * **`FieldControl` is deliberately not exported.** Base UI's is a generic `<input>` for callers
 * who have no other input; every Kookie control already IS a Base UI input, and Base UI's
 * inputs read `Field.Root` context by themselves — the id, the label target, the description
 * target and `data-invalid` all arrive without being passed. A control dropped in here wires
 * itself, so a re-export would be a second spelling of the control already standing there.
 * Same call as `Progress.Track` and the Tabs indicator: structure, not API.
 *
 * **Order is label, description, control, error** — the description above and the error below,
 * because §29's own rule read one level down: instruction before the act, diagnosis after. A
 * description tells you what to enter and is needed before you type; an error tells you what
 * went wrong and is only true afterwards. Both show, and the error never replaces the
 * description: removing the instruction at the exact moment somebody failed to follow it is
 * the wrong trade. §28 records the cost that order carries and whose call it was.
 *
 * **Stacked, always.** `orientation` is refused on Slider's precedent (§11): a horizontal field
 * is not a direction flip — the label aligns to the control's first line and the error must sit
 * under the CONTROL rather than under the label, which makes it a designed grid with its own
 * rules. It ships as its own designed set the day something forces it. `render` stays open on
 * the root, so a caller who wants a grid brings one.
 *
 * `Form` (Base UI's) is deferred, not refused: it distributes a server error map to fields by
 * name and moves focus to the first invalid one, which is non-visual behaviour and the same
 * forcer that licenses this anatomy. It is additive and changes nothing here.
 */
export function Field({ size = "2", className, children, ...props }: FieldProps) {
  return (
    <ControlSizeContext.Provider value={size}>
      <FieldTypeContext.Provider value={size}>
        <BaseField.Root
          {...props}
          className={className ? `kui-field-group ${className}` : "kui-field-group"}
        >
          {children}
        </BaseField.Root>
      </FieldTypeContext.Provider>
    </ControlSizeContext.Provider>
  );
}

/**
 * The field's name (§28). A `<label>` associated by id, so clicking it lands the caret and a
 * screen reader announces it with the control.
 *
 * Medium weight and the tone-less foreground role: a label leads the group it names, and this
 * system carries that with weight and ink rather than with a louder size (§15). It states no
 * step of its own — the field states one for the whole unit.
 */
export function FieldLabel({ className, children, ...props }: FieldLabelProps) {
  const size = React.useContext(FieldTypeContext);
  return (
    <Text
      size={size}
      weight="medium"
      {...(className ? { className } : {})}
      render={<BaseField.Label {...props} />}
    >
      {children}
    </Text>
  );
}

/**
 * What to enter, before you enter it (§28). The muted role, which is what `emphasis="medium"`
 * resolves to for type (§15) — real information said quietly, at `apcaFloors.body` exactly.
 *
 * It sits ABOVE the control on purpose. Base UI wires it into `aria-describedby` wherever it
 * is placed, so the position is a reading decision rather than a wiring one, and the reading
 * decision is §29's: instruction before the act.
 */
export function FieldDescription({ className, children, ...props }: FieldDescriptionProps) {
  const size = React.useContext(FieldTypeContext);
  return (
    <Text
      size={size}
      emphasis="medium"
      {...(className ? { className } : {})}
      render={<BaseField.Description {...props} />}
    >
      {children}
    </Text>
  );
}

/**
 * What went wrong, after it went wrong (§28). The destructive family's ink, and Base UI gives
 * it the announcement — it renders only while the field is invalid and carries the live region,
 * which is the non-visual forcer that makes this a part rather than a `<Text>` a caller writes.
 *
 * `match` is Base UI's and is passed straight through: it keys the message to one
 * `ValidityState` reason, so a field can carry a different sentence for `valueMissing` than for
 * `typeMismatch` without the call site branching.
 *
 * Rendered with no children, it prints the browser's own validation message.
 */
export function FieldError({ className, children, ...props }: FieldErrorProps) {
  const size = React.useContext(FieldTypeContext);
  return (
    <Text
      size={size}
      tone="destructive"
      {...(className ? { className } : {})}
      render={<BaseField.Error {...props} />}
    >
      {children}
    </Text>
  );
}
