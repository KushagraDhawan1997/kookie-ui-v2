"use client";

import * as React from "react";

import type { Size } from "../../system/axes.ts";

export type TableProps = Omit<React.ComponentPropsWithoutRef<"table">, "color"> & {
  /**
   * An index into the control family, 1–4, and it sets two things at once: the cell inset,
   * picked from the layout-space palette so it tightens with density, and the type step the
   * cells read at. Defaults to `2` — the step tables are set at almost everywhere, because a
   * table is dense by nature.
   */
  size?: Size;
  /** Dresses the scroll wrapper, never the table — the wrapper is the element you lay out. */
  className?: string;
  style?: React.CSSProperties;
  /** Reaches the `<table>` element itself. */
  ref?: React.Ref<HTMLTableElement>;
  /**
   * Names the SCROLL REGION around the table — the box a keyboard reaches when the table is
   * wider than its room. DECLARED rather than left to ride the rest spread, both because it
   * has to be pulled off the props that reach the `<table>` and because TypeScript exempts
   * hyphenated attribute names from excess-property checking, which is how a prop can compile,
   * render, and reach the DOM nowhere at all (ScrollArea's own scar, 2026-08-26). A `<caption>`
   * names the table itself, natively, and needs nothing here.
   */
  "aria-label"?: string;
  /** The same, from an element that already carries the words — a heading above the table,
      usually. Mutually exclusive with `aria-label`, as ARIA has it. */
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
  size = "2",
  className,
  style,
  ref,
  children,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  ...props
}: TableProps) {
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

export type TableHeaderProps = React.ComponentPropsWithoutRef<"thead"> & {
  ref?: React.Ref<HTMLTableSectionElement>;
};
/** The `<thead>`. Its cells are `TableHead`s, set in the muted ink at medium weight. */
export function TableHeader(props: TableHeaderProps) {
  return <thead {...props} />;
}

export type TableBodyProps = React.ComponentPropsWithoutRef<"tbody"> & {
  ref?: React.Ref<HTMLTableSectionElement>;
};
/** The `<tbody>`. Its last row draws no hairline under itself — the table's edge is the end. */
export function TableBody(props: TableBodyProps) {
  return <tbody {...props} />;
}

export type TableRowProps = React.ComponentPropsWithoutRef<"tr"> & {
  ref?: React.Ref<HTMLTableRowElement>;
};
/** A `<tr>`. Inert: no hover, no selection, no press (§36 — the interactive row is a different
 *  component). */
export function TableRow(props: TableRowProps) {
  return <tr {...props} />;
}

type CellAlign = {
  /**
   * Where the cell's content sits on the inline axis. Numbers end-align so their digits line
   * up; words start-align. Defaults to `start`. Set it on the head and the cells of a column
   * together, or the column reads as two.
   */
  align?: "start" | "center" | "end";
};

export type TableHeadProps = Omit<React.ComponentPropsWithoutRef<"th">, "align" | "color"> &
  CellAlign & { ref?: React.Ref<HTMLTableCellElement> };
/** A `<th>` in the header row, with `scope="col"` unless you say otherwise. */
export function TableHead({ align, scope = "col", ...props }: TableHeadProps) {
  return <th scope={scope} data-align={align} {...props} />;
}

export type TableCellProps = Omit<React.ComponentPropsWithoutRef<"td">, "align" | "color"> &
  CellAlign & { ref?: React.Ref<HTMLTableCellElement> };
/** A `<td>`. */
export function TableCell({ align, ...props }: TableCellProps) {
  return <td data-align={align} {...props} />;
}

export type TableCaptionProps = React.ComponentPropsWithoutRef<"caption"> & {
  ref?: React.Ref<HTMLTableCaptionElement>;
};
/** The `<caption>`: what this table is, for everyone, and the table's accessible name. Drawn
 *  under the table in the muted ink. */
export function TableCaption(props: TableCaptionProps) {
  return <caption {...props} />;
}
