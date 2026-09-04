"use client";

import { Field as BaseField } from "@base-ui/react/field";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { SizeScopeContext, useSize } from "../../system/size.ts";
import { Text } from "../text/text.tsx";
import { themeDefaults } from "../../theme/theme.tsx";

/* CHANGES 2026-08-26: `render` is BACK in the root's type. It was omitted alongside
   `className` — the shape every other part here uses — while the JSDoc below and §28 both name
   it as the answer to the `orientation` refusal ("a caller who wants a grid brings one"). The
   escape was documented, spread through to `BaseField.Root` at runtime, and rejected by `tsc`,
   so the refusal it justifies rested on something nobody could write. The parts keep the
   omission: a `FieldLabel` must stay a `<label>` and a `FieldError` must stay the announced
   node, and those are the wiring the anatomy exists for. */
export type FieldProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseField.Root>,
  "className"
> & {
  /**
   * The control index, set once for the whole unit: the label, the description, the error and
   * the control inside it. It reaches the control through React context, and an explicit `size`
   * on the control always wins, so a control is never re-sized behind a number somebody typed.
   */
  size?: Size;
  /** Dresses the column. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
};

export type FieldItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseField.Item>,
  "className" | "render"
> & { className?: string };

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
/* `themeDefaults.size`, never a literal: this default is only reachable in an invalid tree
   (a part outside its root), and nine private copies of the number 2 is nine claims about a
   rest that the app can now move (2026-09-05). */
const FieldTypeContext = React.createContext<Size>(themeDefaults.size);

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
 * **Order is label, control, description, error.** The label sits directly on the control it
 * names, and everything that is *about* that control pools underneath it.
 *
 * The first spelling put the description above, on §29's rule read one level down —
 * instruction before the act, diagnosis after. That reading was retracted 2026-08-21
 * (Kushagra): position inside a single unit is PROXIMITY, not sequence. §29's rule orders
 * things a person meets at different moments — a question asked before an act, a report made
 * after one. A field is met all at once, so the only thing vertical position settles here is
 * what sits beside what, and the pairing that has to survive a form of ten fields is the label
 * on its control.
 *
 * The description comes before the error because an error can then arrive without moving
 * anything already on screen. Both show, and the error never replaces the description:
 * removing the instruction at the exact moment somebody failed to follow it is the wrong
 * trade. §28 records the cost this order carries, which grew with the change.
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
export function Field({ size: sizeProp, className, children, ...props }: FieldProps) {
  const size = useSize(sizeProp);
  return (
    <SizeScopeContext.Provider value={size}>
      <FieldTypeContext.Provider value={size}>
        <BaseField.Root
          {...props}
          className={className ? `kui-field-group ${className}` : "kui-field-group"}
        >
          {children}
        </BaseField.Root>
      </FieldTypeContext.Provider>
    </SizeScopeContext.Provider>
  );
}

/**
 * One option inside a group (§28) — a mark, its own name, and its own line of explanation.
 *
 * A `Field` names ONE control. A checkbox group or a radio group is several controls under one
 * name, and each of them needs a name of its own; "Express" needs to say "next business day"
 * without the group's label having anywhere to put it. `FieldItem` is the scope that makes
 * that work: Base UI opens a fresh naming context inside it, so a `FieldLabel` written here
 * names the mark standing beside it rather than the group, and a `FieldDescription` written
 * here is ADDED to the ones the field already supplies — an option ends up described by the
 * field's description and by its own, in that order, which is the reading a person would give
 * them anyway.
 *
 * **This closes the labelling hole the mark family shipped with.** Checkbox and Radio have
 * always refused to draw their own label (§11 — a mark sits BESIDE its label, so the row owns
 * the space between them and the mark cannot own the row). That was the right refusal and it
 * left nobody holding the row: until now, every checkbox with a name meant a hand-written
 * `id` + `htmlFor` pair at the call site, which is the exact wiring Field exists to remove.
 *
 * **The layout is a two-column grid and that is the whole design.** The mark takes the first
 * column; the name and the explanation stack in the second, so the explanation aligns with the
 * words it belongs to and not with the mark. The mark needs no vertical alignment rule because
 * `--mark-N` IS `--line-height-N` (§4): a mark is exactly one line of its label tall, so it
 * lands on the label's first line by construction.
 *
 * The column gap is `--layout-space-3` — the distance every hand-rolled checkbox row in this
 * repo already used — and the rows inside an item are one step tighter than the field's own
 * rhythm, because a nested group steps down (§15).
 *
 * **Order inside an item is mark, name, explanation.** The field's own order (label, control,
 * description) does not apply, because here the control is beside the words rather than under
 * them; what carries across is that the explanation follows the thing it explains.
 *
 * `disabled` is Base UI's and stands this option down on its own — the `disabled` on `Field`
 * takes precedence, so a dead field cannot be revived one option at a time.
 */
export function FieldItem({ className, children, ...props }: FieldItemProps) {
  return (
    <BaseField.Item
      {...props}
      className={className ? `kui-field-item ${className}` : "kui-field-item"}
    >
      {children}
    </BaseField.Item>
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
 * It sits BELOW the control, above the error. Base UI wires it into `aria-describedby`
 * wherever it is placed, so where it sits is a reading decision and never a wiring one — a
 * screen reader announces it with the control from any position. What position decides is
 * proximity for the eye, and it keeps the label on the control it names (§28).
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
 * What went wrong, after it went wrong (§28). The destructive family's ink, and it is the ONE
 * part whose forcer is an announcement rather than an association: Base UI renders it only
 * while the field is invalid and registers its id into the control's `aria-describedby`, and
 * this component adds `role="alert"`, which is what makes an error that ARRIVES get read out.
 *
 * The role is the fix and not decoration (2026-08-26). Base UI's `Field.Error` is a plain
 * `<div>` with an id — no `role`, no `aria-live` — so the description wiring alone only speaks
 * when focus next lands on the control. Validation on blur is the ordinary case and it is
 * exactly the case where focus has already moved on: the message appeared, the person is three
 * fields further down, and nothing was said. `role="alert"` rather than `aria-live="polite"`
 * because the node is INSERTED at the moment it has something to say, and an inserted polite
 * region is not reliably announced — a live region has to already exist for its content to
 * count as a change, while an inserted `alert` is announced by every screen reader. It is
 * written before the spread, so a caller who wants a quieter register can state one.
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
      render={<BaseField.Error role="alert" {...props} />}
    >
      {children}
    </Text>
  );
}
