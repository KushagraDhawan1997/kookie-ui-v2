"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { glyphStroke } from "../../tokens/config.ts";
import { useSize } from "../../system/size.ts";
import { themeDefaults } from "../../theme/theme.tsx";

/* The index travels from the root to its triggers by a private context — the compound's own
   (Menu's and Select's shape: size on the root like Button), NOT `SizeScopeContext`, which is
   Field's one supply and bounded to stay that way (§28). */
/* `themeDefaults.size`, never a literal: this default is only reachable in an invalid tree
   (a part outside its root), and nine private copies of the number 2 is nine claims about a
   rest that the app can now move (2026-09-05). */
const AccordionSizeContext = React.createContext<Size>(themeDefaults.size);

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
 * Base UI 1.7 does not implement them) — and this system carries the headings: every trigger
 * wears the control skeleton, stands on the height ladder like the Button beside it, underlines
 * its label under the pointer, and turns the disclosure chevron the tree draws. NOT a row
 * (2026-09-01): a row is a line in a list you read and PICK, and a heading is pressed to
 * disclose what is under it.
 *
 * It paints no pane. An accordion is a list of headings in whatever surface it sits in; put it
 * in a Card when it wants a boundary. The hairlines between items are the table's.
 */
export function Accordion({ size: sizeProp, className, ...props }: AccordionProps) {
  const size = useSize(sizeProp);
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
 * The section's heading: a heading element holding a button that wears the control SKELETON
 * — `kui-control`, quiet, standing on the height ladder like the Button beside it — with the
 * disclosure chevron in the trailing slot. NOT a row (2026-09-01, Kushagra: "is it a row
 * tho?"): a row is a line in a list you read and pick, lit under the pointer and selectable;
 * this is a heading you press to disclose what is under it — nothing is picked, its siblings
 * are independent, "open" is not "selected". It shipped as `kui-row` for its geometry, and the
 * geometry was the skeleton's all along; what the row added was the fill light, which is the
 * one thing a heading should not do. Under the pointer the label underlines, Link's own
 * mechanism (accordion.css). The chevron points into the reading direction and turns down
 * when the panel is open, the tree's own glyph and turn.
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
        className={
          className ? `kui-control kui-accordion-trigger ${className}` : "kui-control kui-accordion-trigger"
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
  const size = React.use(AccordionSizeContext);
  return (
    <BaseAccordion.Panel
      className={className ? `kui-accordion-panel ${className}` : "kui-accordion-panel"}
      {...props}
    >
      {/* The body wears the type join at the IDENTITY step (2026-09-01, Kushagra: "the
          expanded text doesnt respond to size"): the panel's words take the same step the
          heading row above them takes, so plain text scales with the section — Table's
          sentence for its cells. A `Text` inside still states its own step; ownership of the
          content stays the caller's, only the line it is read in is the section's. */}
      <div className="kui-type kui-accordion-panel-body" data-size={size}>
        {children}
      </div>
    </BaseAccordion.Panel>
  );
}
