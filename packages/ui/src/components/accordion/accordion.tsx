"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { glyphStroke } from "../../tokens/config.ts";

/* The index travels from the root to its triggers by a private context — the compound's own
   (Menu's and Select's shape: size on the root like Button), NOT `ControlSizeContext`, which is
   Field's one supply and bounded to stay that way (§28). */
const AccordionSizeContext = React.createContext<Size>("2");

export type AccordionProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseAccordion.Root>,
  "orientation" | "loopFocus" | "className" | "style" | "render"
> & {
  /**
   * An index into the control family, 1–4. It sets the trigger rows — height, inset, type
   * step, the chevron's box — and the panel's inset with them, so the panel's words start
   * under the trigger's label. Defaults to `2`.
   */
  size?: Size;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * Sections that open and close, one under the other (§11, §37). Base UI carries the machine —
 * the value, one-open or many, `hidden="until-found"` when asked; Tab moves between headers,
 * which is the APG pattern's required keyboard (the arrow keys are its optional half, and
 * Base UI 1.7 does not implement them) — and this system carries the rows: every trigger is a row-family member standing on
 * the height ladder, lit by the pointer, with the disclosure chevron the tree turns.
 *
 * It paints no pane. An accordion is a list of headings in whatever surface it sits in; put it
 * in a Card when it wants a boundary. The hairlines between items are the table's.
 */
export function Accordion({ size = "2", className, ...props }: AccordionProps) {
  return (
    <AccordionSizeContext.Provider value={size}>
      <BaseAccordion.Root
        data-size={size}
        className={className ? `kui-accordion ${className}` : "kui-accordion"}
        {...props}
      />
    </AccordionSizeContext.Provider>
  );
}

export type AccordionItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseAccordion.Item>,
  "className" | "style" | "render"
> & {
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** One section: a trigger and its panel. `value` names it for the root's value array. */
export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <BaseAccordion.Item
      className={className ? `kui-accordion-item ${className}` : "kui-accordion-item"}
      {...props}
    />
  );
}

export type AccordionTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseAccordion.Trigger>,
  "className" | "style" | "render" | "nativeButton"
> & {
  /**
   * The heading level the trigger sits in. An accordion's triggers are headings — that is
   * how a screen reader user finds them — and the level should follow the page's outline.
   * Defaults to `3`.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * The section's heading: a heading element holding a button that is a ROW — `kui-control
 * kui-row`, quiet, lit by the pointer, standing on the height ladder like the Button beside
 * it — with the disclosure chevron in the trailing slot. The chevron points into the reading
 * direction and turns down when the panel is open, the tree's own glyph and turn.
 */
export function AccordionTrigger({ headingLevel = 3, className, children, ...props }: AccordionTriggerProps) {
  const size = React.useContext(AccordionSizeContext);
  const Heading = `h${headingLevel}` as const;
  return (
    <BaseAccordion.Header render={<Heading />}>
      <BaseAccordion.Trigger
        data-size={size}
        data-tone="neutral"
        data-emphasis="quiet"
        data-hover-lit=""
        className={
          className
            ? `kui-control kui-row kui-accordion-trigger ${className}`
            : "kui-control kui-row kui-accordion-trigger"
        }
        {...props}
      >
        {children}
        <span data-slot="trailing" className="kui-accordion-disclosure">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="kui-accordion-chevron"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth={glyphStroke}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

export type AccordionPanelProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseAccordion.Panel>,
  "className" | "style" | "render"
> & {
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * The section's content. It opens and closes by height on the geometry clock (§8 — a box
 * moves on a spring), clipped while it travels, and its words start under the trigger's
 * label. The content inside is yours: a Text, a Stack, a form.
 */
export function AccordionPanel({ className, children, ...props }: AccordionPanelProps) {
  return (
    <BaseAccordion.Panel
      className={className ? `kui-accordion-panel ${className}` : "kui-accordion-panel"}
      {...props}
    >
      <div className="kui-accordion-panel-body">{children}</div>
    </BaseAccordion.Panel>
  );
}
