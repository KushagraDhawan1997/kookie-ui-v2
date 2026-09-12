"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import type { Emphasis, Tone } from "../../system/axes.ts";
import { ListInkContext } from "../../system/list-context.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

type ListShared = {
  /**
   * A step on the shared ramp. It defaults to 3 like `Text` and `Blockquote`, because a list is
   * a block of copy and sets its own step. A list NESTED in another list has no default: unset,
   * it takes the step of the item it sits in, so a size-2 list's sub-list is size 2 without the
   * call site repeating the index.
   */
  size?: TypeSize;
  /** Token names, never numbers, and semibold is the heaviest. Rests at regular — a list is
      copy. Unset on a nested list, which keeps its parent's weight. */
  weight?: Weight;
  /** Picks an ink colour for the words. It rests loud, as all reading copy does. Unset on a
      nested list, which keeps its parent's rung — including when the nested list states a tone
      of its own, which is the whole of what "keeps its parent's ink" has to mean. A BULLET
      stays in the faint role at every rung, because it is furniture; a NUMBER takes the rung
      the words took, because it is read and cited. */
  emphasis?: Emphasis;
  /** Moves the ink onto that family — the words and the markers together, because both read
      the family's ink roles. Stamped only when chosen. */
  tone?: Tone;
  className?: string;
  style?: React.CSSProperties;
};

type UnorderedProps = Omit<React.ComponentPropsWithoutRef<"ul">, "color" | "style" | "className"> & {
  /** Renders `<ul>`: the items are a set, and their order carries nothing. */
  ordered?: false;
  /** Refused on a bulleted list, because there is no number to start from: `start` is the
      platform's attribute on an `<ol>`, and it reaches the element once the list states
      `ordered`. Stating it here is almost always a list that should have been ordered. */
  start?: never;
  /** Refused on a bulleted list, for the same reason as `start`: reversing a run of discs
      changes nothing a reader can see. State `ordered`, and it passes through to the `<ol>`
      as the platform's own attribute. */
  reversed?: never;
  ref?: React.Ref<HTMLUListElement>;
};

type OrderedProps = Omit<React.ComponentPropsWithoutRef<"ol">, "color" | "style" | "className" | "type"> & {
  /**
   * Renders `<ol>`: the order IS information — steps, a ranking, a sequence someone will
   * follow or cite by number. This is the one structural choice a list has, and it is a choice
   * of ELEMENT because that is what a screen reader announces ("list, 4 items" against a
   * numbered one). `start` and `reversed` pass through: they are the platform's own attributes
   * on an ordered list, they change what the numbers SAY rather than how they look, and a
   * list resumed after a paragraph needs `start` to be true.
   */
  ordered: true;
  ref?: React.Ref<HTMLOListElement>;
};

/**
 * A prose list (§15), bulleted or numbered.
 *
 * The type family's fourth component, and a promotion: the docs drew this list by hand in
 * `prose.css` from 2026-08-21. The item rhythm came across unchanged; the INDENT and the
 * marker's INK did not survive the audit that followed (2026-09-12), because both had been
 * judged in open prose, at one step, in a container with room to spill into — and neither claim
 * held anywhere else. `list.css` states what each one is now and what it measured before.
 *
 * Everything about how it READS is the shared type layer's (the ramp, the weights, the emphasis
 * rungs, the zeroed margin, the body family slot), which is what makes it a type-family member
 * rather than a layout: what `list.css` adds is the indent, the distance between items and the
 * marker's ink.
 *
 * **The browser's list-item layout is kept on purpose.** Items are spaced with a margin between
 * siblings rather than a flex gap, because a flex list stops generating markers — and the
 * platform's layout is also what indents a nested list correctly with no rule of its own and
 * cycles a nested bullet from disc to circle to square.
 *
 * Refused, on the record:
 * - **`marker`, and `ol`'s `type` attribute.** The marker is the element's: a disc says "set", a
 *   number says "sequence", and nesting cycles the glyph by level. A custom glyph is a
 *   decoration each call site would pick differently — appearance is resolved output. A list
 *   with no marker at all is a `Stack`; a list of icon-led rows is `Row`s.
 * - **`render`.** `ordered` is the element choice, and a list that is neither `<ul>` nor `<ol>`
 *   has nothing to announce.
 * - **A gap or density prop.** The item rhythm is the system's (§15's differentiated rhythm);
 *   two lists on one page spaced two ways is the drift it exists to stop.
 * - **A description-list mode.** `<dl>` is a different structure — terms and their details —
 *   and would arrive as a different component rather than a prop that turns this into it.
 */
export function List(props: ListProps) {
  const {
    ordered,
    size,
    weight,
    emphasis,
    tone,
    className,
    style,
    children,
    ref,
    ...rest
  } = props as ListShared & OrderedProps & { ordered?: boolean; ref?: React.Ref<never> };
  const parentRung = React.useContext(ListInkContext);
  const nested = parentRung !== null;

  /* THE RUNG IS RESOLVED IN JS RATHER THAN LEFT TO THE CASCADE (audit 2026-09-12).
     A nested list used to state no rung and take `color: inherit`, which carries a COLOUR — and
     a colour carries nothing the moment the nested list states a `tone` of its own, because the
     tone re-scopes the three ink roles on that element and `.kui-type`'s resting `color` wins
     there. Measured: a `destructive` sub-list under a `medium` parent painted the family's LOUD
     ink, identical to `emphasis="loud"`, which is the opposite of what the `emphasis` prop
     above promises and of §15's rule that choosing a family keeps the rung. Passing the rung
     down means a tone moves the family and the rung stays where the parent put it. */
  const rung: Emphasis = emphasis ?? parentRung ?? "loud";

  const merged = {
    ref,
    // A top-level list states Blockquote's defaults; a nested one states only what the call
    // site chose, so the type join's attribute-presence keys leave the inherited line alone.
    // The RUNG is the exception and is always stated, because it is the one of the three that a
    // nested list cannot inherit correctly through the cascade — see above.
    "data-size": size ?? (nested ? undefined : "3"),
    "data-weight": weight ?? (nested ? undefined : "regular"),
    "data-emphasis": rung,
    "data-tone": tone,
    className: className ? `kui-type kui-list ${className}` : "kui-type kui-list",
    style,
    ...rest,
  };

  return (
    <ListInkContext.Provider value={rung}>
      {ordered ? (
        <ol {...(merged as React.ComponentPropsWithRef<"ol">)}>{children}</ol>
      ) : (
        <ul {...(merged as React.ComponentPropsWithRef<"ul">)}>{children}</ul>
      )}
    </ListInkContext.Provider>
  );
}

/**
 * `ComponentRefusals` is intersected HERE rather than inside `ListShared`, and it is a law that
 * asks for it rather than a preference: `refusal-sets.test.ts` reads the HEAD of every exported
 * props declaration in the built `.d.ts` and counts the refusal sets it names, so a set reached
 * through an alias is a set the law cannot see (audit 2026-09-12). The refusals were enforced
 * either way — `<List m="4" />` has always been rejected — but a guarantee that only the
 * compiler can see is a guarantee nothing checks.
 */
export type ListProps = ComponentRefusals & ListShared & (UnorderedProps | OrderedProps);

export type ListItemProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"li">, "color"> & {
  ref?: React.Ref<HTMLLIElement>;
};

/**
 * A list item: the `<li>`. It inherits the list's step, weight and ink, and a `List` placed
 * inside it indents one level with no prop. `value` passes through, for an ordered list whose
 * numbering jumps.
 */
export function ListItem(props: ListItemProps) {
  return <li {...props} />;
}
