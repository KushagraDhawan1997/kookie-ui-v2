"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { useSize } from "../../system/size.ts";
import { Card } from "../card/card.tsx";
import { RowDividedContext } from "../row/row.tsx";
import { Separator } from "../separator/separator.tsx";
import { Text } from "../text/text.tsx";

export type RowGroupProps = ComponentRefusals & {
  /**
   * A short label above the rows, such as "Notifications". It names the group for screen
   * readers too.
   */
  label?: string;
  /**
   * A sentence under the rows that says something the rows can't: a consequence, a limit or
   * who sees it. Leave it out if it would only restate the label.
   */
  note?: React.ReactNode;
  /** The rows, usually `Row`s. A divider is drawn between each pair. */
  children: React.ReactNode;
  /** Sets the size of the rows' box and dividers. If you don't set it, it uses the nearest `Theme`. */
  size?: Size;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * RowGroup (2026-11-02, Kushagra: "We have Row already"). A grouped list: a small label, a card
 * of rows with a divider between each pair, and an optional note under it. The settings list
 * every platform draws, and an inspector's section, which is why it is not called a settings
 * anything.
 *
 * IT OWNS THE GROUP, NOT THE ROWS. The rows are ordinary `Row`s, so a row that toggles is a Row
 * rendered as a `label` with a `Switch` in its trailing slot, and a row that goes somewhere is a
 * Row rendered as a link, or a `NavigatorLink`. Giving Row a second API for "inside a group"
 * would be two ways to write one row.
 *
 * The label, the rows' text, the dividers and the note share one axis: the card's content edge.
 * A row's fill hangs outside its text (recipes.css), so nothing has to be measured to line them
 * up. The dividers are `Separator`s, the system's one hairline.
 */
export function RowGroup({ label, note, children, size: sizeProp, className, style }: RowGroupProps) {
  const size = useSize(sizeProp);
  const id = React.useId();
  const rows = React.Children.toArray(children).filter(React.isValidElement);

  return (
    <div
      role="group"
      aria-labelledby={label ? `${id}-label` : undefined}
      aria-describedby={note ? `${id}-note` : undefined}
      className={className ? `kui-row-group ${className}` : "kui-row-group"}
      data-size={size}
      // The card's padding at this size, which is where the rows' text sits (a row's fill hangs
      // outside its text). Stated here because a component sheet may not key on `data-size`.
      style={{ "--kui-rg-pad": `var(--surface-p-${size})`, ...style } as React.CSSProperties}
    >
      {label ? (
        <Text size="2" emphasis="medium" id={`${id}-label`} className="kui-row-group-label">
          {label}
        </Text>
      ) : null}
      <Card size={size} className="kui-row-group-rows">
        <RowDividedContext.Provider value={true}>
          {rows.map((row, index) => (
            <React.Fragment key={row.key ?? index}>
              {index > 0 ? <Separator className="kui-row-group-divider" /> : null}
              {row}
            </React.Fragment>
          ))}
        </RowDividedContext.Provider>
      </Card>
      {note ? (
        <Text size="2" emphasis="medium" id={`${id}-note`} className="kui-row-group-note">
          {note}
        </Text>
      ) : null}
    </div>
  );
}
