"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { useSize } from "../../system/size.ts";

export type TableProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"table">, "color"> & {
  /**
   * Sets the cell padding and the text size, from `1` to `4`. The padding also follows the
   * theme's density. The default is the `size` of the nearest `Theme`, which is `2` unless you
   * change it.
   */
  size?: Size;
  /** Adds a class to the scroll wrapper around the table, not to the `<table>`. */
  className?: string;
  style?: React.CSSProperties;
  /** A ref to the `<table>` element. */
  ref?: React.Ref<HTMLTableElement>;
  /**
   * The accessible name of the scroll region around the table. Keyboard users reach this
   * region when the table is wider than its container. To name the table itself, use a
   * `TableCaption`.
   */
  "aria-label"?: string;
  /** The id of an element that names the scroll region, usually a heading above the table.
      Use it instead of `aria-label`, not together with it. */
  "aria-labelledby"?: string;
};

/**
 * A static data table (§11, §36): the semantic `<table>`, kept for what it announces, in a
 * wrapper that scrolls sideways when the columns exceed the room — a table is the one block
 * whose content can genuinely exceed its measure, and a page that scrolls sideways because of
 * one table is worse than a table that does. Two elements, so `className`/`style` dress the
 * wrapper and `ref` reaches the table, TextField's own split.
 *
 * It draws the hairlines, the cell inset and the header ink, and nothing else. Rows are inert:
 * a row you can hover, select or open is §11's interactive table row, a member of the row
 * family that has not shipped, and it will arrive as a different component rather than as a
 * prop that turns this one into it.
 *
 * The parts wear shadcn/ui's names (MIT, credited): `TableHeader`, `TableBody`, `TableRow`,
 * `TableHead`, `TableCell`, `TableCaption`.
 */
export function Table({
  size: sizeProp,
  className,
  style,
  ref,
  children,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  ...props
}: TableProps) {
  const size = useSize(sizeProp);
  /* THE NAME LANDS ON THE SCROLLER (2026-09-01, ultracode audit), which is ScrollArea's own
     rule one component over: "the name lands on the viewport, because the viewport is the
     element that scrolls and the element that takes focus". A scrollable box is keyboard
     focusable in every current browser — WCAG 2.1.1 being satisfied, not a bug — and this one
     had the whole attribute set `["data-size", "class"]`, so Tab landed on a node CDP reports
     as `{role: "generic", ignored: false}` with no name, while `aria-label` on `<Table>` rode
     the rest spread onto the `<table>`, where it could not name the thing the user had just
     reached. A `<caption>` still names the TABLE natively; this names the region around it.

     `role="region"` only when there is a name for it — an unnamed region is ignored by every
     screen reader, so stamping one unconditionally adds a landmark that says nothing. And no
     `tabIndex`: the browser makes a scroller focusable exactly when it overflows, which is the
     only time a tab stop here is worth having. */
  const named = label !== undefined || labelledBy !== undefined;
  return (
    <div
      data-size={size}
      className={className ? `kui-type kui-table ${className}` : "kui-type kui-table"}
      style={style}
      {...(named ? { role: "region" } : {})}
      {...(label !== undefined ? { "aria-label": label } : {})}
      {...(labelledBy !== undefined ? { "aria-labelledby": labelledBy } : {})}
    >
      <table ref={ref} className="kui-table-el" {...props}>
        {children}
      </table>
    </div>
  );
}

export type TableHeaderProps = ComponentRefusals & React.ComponentPropsWithoutRef<"thead"> & {
  ref?: React.Ref<HTMLTableSectionElement>;
};
/** The `<thead>`. Its cells are `TableHead`s, set in the muted ink at medium weight. */
export function TableHeader(props: TableHeaderProps) {
  return <thead {...props} />;
}

export type TableBodyProps = ComponentRefusals & React.ComponentPropsWithoutRef<"tbody"> & {
  ref?: React.Ref<HTMLTableSectionElement>;
};
/** The `<tbody>`. Its last row draws no hairline under itself — the table's edge is the end. */
export function TableBody(props: TableBodyProps) {
  return <tbody {...props} />;
}

export type TableRowProps = ComponentRefusals & React.ComponentPropsWithoutRef<"tr"> & {
  ref?: React.Ref<HTMLTableRowElement>;
};
/** A `<tr>`. Inert: no hover, no selection, no press (§36 — the interactive row is a different
 *  component). */
export function TableRow(props: TableRowProps) {
  return <tr {...props} />;
}

type CellAlign = {
  /**
   * Sets the horizontal alignment of the cell content. The default is `start`. Use `end` for
   * numbers, so their digits line up. Set the same value on the head and on every cell of a
   * column.
   */
  align?: "start" | "center" | "end";
};

export type TableHeadProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"th">, "align" | "color"> &
  CellAlign & { ref?: React.Ref<HTMLTableCellElement> };
/** A `<th>` in the header row, with `scope="col"` unless you say otherwise. */
export function TableHead({ align, scope = "col", ...props }: TableHeadProps) {
  return <th scope={scope} data-align={align} {...props} />;
}

export type TableCellProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"td">, "align" | "color"> &
  CellAlign & { ref?: React.Ref<HTMLTableCellElement> };
/** A `<td>`. */
export function TableCell({ align, ...props }: TableCellProps) {
  return <td data-align={align} {...props} />;
}

export type TableCaptionProps = ComponentRefusals & React.ComponentPropsWithoutRef<"caption"> & {
  ref?: React.Ref<HTMLTableCaptionElement>;
};
/** The `<caption>`: what this table is, for everyone, and the table's accessible name. Drawn
 *  under the table in the muted ink. */
export function TableCaption(props: TableCaptionProps) {
  return <caption {...props} />;
}
