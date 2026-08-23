"use client";

import * as React from "react";

import type { Size, SlotName, Tone } from "../../system/axes.ts";
import { composeRender, filled, type RenderElement } from "../../system/render.ts";

export type RowProps = Omit<React.ComponentPropsWithoutRef<"button">, "color"> & {
  /**
   * The row's box, which is its text line plus one designed inset (§21) — not the control
   * height ladder. It rests at 2, like every other control in the library.
   */
  size?: Size;
  /**
   * The one meaning a row carries beyond being itself. A `destructive` row is the delete in a
   * list of verbs. It is a narrow vocabulary on purpose: a list of peers where three rows wear
   * three families is a list that has stopped being a list.
   */
  tone?: Tone;
  /** Before the label: an icon, an avatar, a tick. */
  leading?: React.ReactNode;
  /** After it, pushed to the far edge: a shortcut, a count, a chevron. */
  trailing?: React.ReactNode;
  /**
   * Lights the row from OUTSIDE — for a list that moves a highlight with the arrow keys while
   * focus stays somewhere else, which is what a command palette and a search field's results
   * both are.
   *
   * **Passing it at all changes how the row answers the pointer**, and that is the point.
   * A list with a roving highlight has two cursors — the keyboard's and the pointer's — and a
   * row that answered both would stay lit under a resting pointer after the keyboard had moved
   * on. So a row you drive is driven only by you: state `highlighted` and hover stops painting;
   * leave it unset and the pointer is the only cursor, which is what an ordinary list wants.
   */
  highlighted?: boolean;
  /**
   * This is the thing you are looking at now — the page you are on, the file that is open.
   * It is LOCATION, not selection: it announces `aria-current` and it is not a form value.
   *
   * For "the one I picked out of several", use a `RadioGroup`: picking one of several is a
   * radio group (§26), and a row that faked it with an attribute would be the exact shape that
   * decision refused.
   */
  current?: boolean;
  /** Turns the row off. It stays in the list: a dead row still says the thing exists. */
  disabled?: boolean;
  /**
   * Be a link, or be inert. A row that navigates should be an `<a>`, and a row in a list you
   * only read should be a `<div>` — the element is the semantics, and this is how you say so.
   */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLElement>;
};

/** The family's slot wrapper (ENGINEERING §3), exactly as Button and MenuItem write it: the
    icon box and the trailing edge's clearance both key on it, and `filled()` keeps
    `{cond && icon}` from renting a gap it never fills. */
function slot(content: React.ReactNode, which: SlotName): React.ReactNode {
  return filled(content) ? <span data-slot={which}>{content}</span> : null;
}

/**
 * One row in a list (§21) — the row family's standalone member.
 *
 * The family was declared family-first when Menu shipped: menu item, command item, list item,
 * sidebar button, one CSS contract on day one, because four separately designed rows in one
 * visual weight class will drift. Three of those members existed and the fourth did not, so a
 * list of search results or of commands had nowhere to go: the docs site's own search rendered
 * its results as full-width quiet Buttons and said in a comment that it was standing in for
 * this, and the builder's command palette painted its highlighted row with a raw palette step.
 * This is that row.
 *
 * It is a control wearing a container: full width, start-aligned, the one control state
 * machine, riding the existing control cells — and its box is its text LINE plus one designed
 * inset rather than the height ladder, which is what makes a list of these read as a list
 * instead of as a column of buttons.
 *
 * **Emphasis is refused**, as it is on every row: actions rank, and a list of peers ranks
 * nothing. Quiet is the family's identity and the component stamps it.
 *
 * **What lights it is a decision you make once per list.** Unset `highlighted` and the pointer
 * is the only cursor, so the row lights on hover like every other control. State it and the
 * row is yours to drive, hover goes quiet, and the two cursors cannot fight. That is the whole
 * of what a roving list needs from this component: the keyboard model belongs to the list,
 * because the list is the only thing that knows what its items mean.
 */
export function Row({
  size = "2",
  tone,
  leading,
  trailing,
  highlighted,
  current,
  render,
  className,
  children,
  ref,
  ...props
}: RowProps) {
  const merged = {
    ...props,
    "data-size": size,
    // `tone` is left UNDEFAULTED so being current and carrying a meaning compose rather than
    // fight: current picks the family when nobody asked for one, and a stated tone always
    // wins. A `destructive` row that is also the one you are on stays destructive — the
    // meaning it carries is not the system's to overwrite, and the emphasis step below is
    // what says "current" in either family.
    "data-tone": tone ?? (current ? "accent" : "neutral"),
    // TWO STAMPS AND NO CSS, which is `ShellNavItem`'s mechanism one member over: quiet rests
    // transparent and lights to soft, medium rests at soft and lights to soft-hover — so a
    // plain row and the current row move in the same currency and still read apart, and the
    // current row has somewhere left to go under the pointer. Naming a colour here instead
    // would freeze it, which is the defect that member's own law caught.
    ...(current
      ? { "aria-current": "true" as const, "data-emphasis": "medium" }
      : { "data-emphasis": "quiet" }),
    // The row's cursor, declared once (§21). A row nobody drives answers the pointer; a row
    // somebody drives answers only them. `highlighted === undefined` is the question being
    // asked — not its value — because a controlled `false` still means "I am the cursor here".
    ...(highlighted === undefined
      ? { "data-hover-lit": "" }
      : highlighted
        ? { "data-highlighted": "" }
        : {}),
    // No per-component class, and the absence is honest: every other member wears one
    // because it is a PART of something — `kui-menu-item`, `kui-select-item`,
    // `kui-shell-nav-item` — and a standalone row is a part of nothing. It is the family and
    // nothing else, so `kui-control kui-row` is the whole of what it is. It also ships no
    // stylesheet at all, Card's own limit case one family over.
    className: className ? `kui-control kui-row ${className}` : "kui-control kui-row",
    ref,
  };

  const content = (
    <>
      {slot(leading, "leading")}
      {children}
      {slot(trailing, "trailing")}
    </>
  );

  // `type="button"` only on the button this file renders — a render target keeps its own
  // element semantics (the Button-as-anchor lesson, 2026-08-03).
  if (render) return composeRender(render, merged as never, content);
  return (
    <button {...(merged as React.ComponentPropsWithoutRef<"button">)} type="button">
      {content}
    </button>
  );
}
