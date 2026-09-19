"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import type { Emphasis, Tone } from "../../system/axes.ts";
import { ListInkContext } from "../../system/list-context.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

type ListShared = {
  /**
   * Sets the text size, from `1` to `9`. The default is `3`, as on `Text`. A nested list without
   * a `size` uses the size of the list that holds it.
   */
  size?: TypeSize;
  /** Sets the font weight. The default is `regular`, and `semibold` is the heaviest. A nested
      list without a `weight` uses its parent's weight. */
  weight?: Weight;
  /** Sets how strong the text colour is. The default is `loud`, which is full contrast. A
      nested list without an `emphasis` keeps its parent's level, also when it sets its own
      `tone`. Bullets always stay faint. Numbers use the same level as the words. */
  emphasis?: Emphasis;
  /** Sets the colour family of the words and the markers. */
  tone?: Tone;
  className?: string;
  style?: React.CSSProperties;
};

type UnorderedProps = Omit<React.ComponentPropsWithoutRef<"ul">, "color" | "style" | "className"> & {
  /** Renders a bulleted `<ul>`. Use it when the order of the items has no meaning. */
  ordered?: false;
  /** Not available on a bulleted list, because there is no number to start from. Set
      `ordered` to use `start`. */
  start?: never;
  /** Not available on a bulleted list, because bullets have no order to reverse. Set `ordered`
      to use `reversed`. */
  reversed?: never;
  ref?: React.Ref<HTMLUListElement>;
};

type OrderedProps = Omit<React.ComponentPropsWithoutRef<"ol">, "color" | "style" | "className" | "type"> & {
  /**
   * Renders a numbered `<ol>`. Use it when the order has meaning, such as steps or a ranking.
   * You can then set the `start` and `reversed` attributes. Use `start` to continue a list
   * after a paragraph.
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
 * Props for `List`. Set `ordered` for a numbered list. Without it, the list has bullets.
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
