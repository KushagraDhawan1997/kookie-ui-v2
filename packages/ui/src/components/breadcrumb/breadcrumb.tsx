"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import { Button } from "../button/button.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/menu.tsx";
import { glyphStroke } from "../../tokens/config.ts";
import type { TypeSize } from "../text/text.tsx";

export type BreadcrumbProps = Omit<
  React.ComponentPropsWithoutRef<"nav">,
  "color" | "style" | "className"
> & {
  /**
   * A step on the shared ramp, and it reaches every crumb by inheritance — a bar of mixed
   * steps is not a thing anyone means, which is Tabs' own sentence one family over. Defaults
   * to 2, §15's label-and-meta rung: a breadcrumb tells you where you are, and where you are
   * is not the thing you came to read.
   */
  size?: TypeSize;
  /**
   * The landmark's accessible name, which is how a screen reader's landmark list tells this
   * `<nav>` from the app's own. It is a WORD, so a non-English app states its own —
   * `Notice`'s `dismissLabel` is the same prop for the same reason.
   */
  label?: string;
  /** Dresses the `<nav>` — the element you lay out. The list inside it is the system's. */
  className?: string;
  style?: React.CSSProperties;
  /** Reaches the `<nav>`. */
  ref?: React.Ref<HTMLElement>;
};

/**
 * The path to where you are (§11, §39): a `<nav>` landmark holding one ordered list of the
 * places above this one, ending in the place you are.
 *
 * **No primitive.** Base UI has none, and there is nothing for one to do: a breadcrumb has no
 * state, no keyboard machine and nothing to open. What it has is announcements — a landmark,
 * an ordered list, and `aria-current` on the end of it — which is semantic HTML, so this is
 * Table's shape rather than Menu's.
 *
 * **Two elements, one part.** `<nav>` and `<ol>` are both forced and neither is a choice: a
 * breadcrumb is always a landmark holding a list, so nothing here would ever pick between
 * them. shadcn/ui splits them because its parts are styling hooks; the layout is the system's
 * here, so `BreadcrumbList` collapses into this component (TextField's and Table's split —
 * `className`/`style` dress the outer element, and the inner one is not the caller's).
 *
 * **It is not a `.kui-control` and grows no target**, which is Link's argument verbatim: a
 * crumb is a run of text on a line, WCAG 2.2 SC 2.5.8 exempts a target in text, and §16's
 * expansion exists for a mark that has no container.
 *
 * The parts wear shadcn/ui's names (MIT, credited): `BreadcrumbItem`, `BreadcrumbLink`,
 * `BreadcrumbPage`, `BreadcrumbEllipsis`. Two of its seven do not survive §10's anatomy
 * criterion and are refused — see `BreadcrumbItem` for the separator, and above for the list.
 */
export function Breadcrumb({
  size = "2",
  label = "Breadcrumb",
  className,
  style,
  children,
  ref,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      ref={ref}
      aria-label={label}
      data-size={size}
      className={className ? `kui-type kui-breadcrumb ${className}` : "kui-type kui-breadcrumb"}
      style={style}
      {...props}
    >
      <ol className="kui-breadcrumb-list">{children}</ol>
    </nav>
  );
}

export type BreadcrumbItemProps = Omit<
  React.ComponentPropsWithoutRef<"li">,
  "color" | "style" | "className"
> & {
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLLIElement>;
};

/**
 * One place on the path: the `<li>`, forced by the `<ol>` around it — and it draws the
 * chevron that follows it.
 *
 * **`BreadcrumbSeparator` is refused** (2026-09-01, Kushagra's call), and the separator moves
 * in here. shadcn/ui has the caller place one between every pair and omit the last, which is
 * three things this system does not hand to a call site: it is layout wearing a part's name
 * (`Row`'s and `ComposerRow`'s finding, where five of v1's eleven parts were exactly this), it
 * makes the N-1 rule the caller's to maintain by hand, and it lets each call site pick the
 * glyph — where appearance is resolved output. Drawn here it cannot be forgotten, cannot be
 * doubled, and cannot be a slash on one page and a chevron on the next; `:last-child` in the
 * stylesheet is what "and not after the last one" costs.
 *
 * It is a real `<svg>` at `glyphStroke` rather than a `content: "\203A"` on a pseudo-element,
 * because a text chevron is drawn by whatever face the line resolved and would paint at that
 * face's weight beside a Select's chevron drawn at the system's — which is the 2026-08-23
 * two-grids defect arriving by a different road. `aria-hidden`: it is punctuation between two
 * things the list already separates.
 */
export function BreadcrumbItem({ className, style, children, ref, ...props }: BreadcrumbItemProps) {
  return (
    <li
      ref={ref}
      className={className ? `kui-breadcrumb-item ${className}` : "kui-breadcrumb-item"}
      style={style}
      {...props}
    >
      {children}
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className="kui-breadcrumb-separator"
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
    </li>
  );
}

export type BreadcrumbLinkProps = Omit<
  React.ComponentPropsWithoutRef<"a">,
  "color" | "style" | "className"
> & {
  /** Render into your framework's own link component, or an `<a>` carrying `target` and
      `rel`. `BreadcrumbLink` supplies the treatment; where it goes is yours. */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLAnchorElement>;
};

/**
 * A place above this one, and a way back to it.
 *
 * **It is not a `Link`, and the difference is the tone.** `Link` rests on `accent` and always
 * stamps it, because a link's whole job is to be found inside a paragraph — and stamping a
 * family re-scopes the three foreground roles onto that family's ink trio (`type.css`), so a
 * crumb built out of `Link` could only read a family's greys, never the system's. A crumb
 * carries no meaning: it is a location, so it reads the TONE-LESS foreground roles, which is
 * exactly the pair Tabs reads and for the same reason. `tone` is refused with the colour.
 *
 * **The underline is not unconditional here, and that is a carve-out rather than a drift.**
 * `Link`'s is WCAG 1.4.1, whose case — technique F73 — is a link inside a block of text, where
 * hue is the only thing separating it from the words around it. A crumb is not inside prose:
 * it is a whole item in a landmark's list, every item before the last is a link, and the
 * chevrons say so without colour. So the line rests transparent and paints under the pointer,
 * which keeps its metrics constant and lets §8's paint clock carry it.
 */
export function BreadcrumbLink({
  render,
  className,
  style,
  children,
  ref,
  ...props
}: BreadcrumbLinkProps) {
  const merged = {
    ref,
    className: className
      ? `kui-type kui-breadcrumb-link ${className}`
      : "kui-type kui-breadcrumb-link",
    style,
    ...props,
  };

  if (render) return composeRender(render, merged as never, children);

  return <a {...(merged as React.ComponentPropsWithRef<"a">)}>{children}</a>;
}

export type BreadcrumbPageProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "color" | "style" | "className"
> & {
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLSpanElement>;
};

/**
 * Where you are: the end of the path, in the full ink, and `aria-current="page"`.
 *
 * A part because the announcement forces it — `aria-current` is the one thing on the whole
 * component that a reader cannot see and a listener cannot do without.
 *
 * **shadcn/ui's `role="link" aria-disabled="true"` is refused.** It announces a run of text as
 * a link that has been switched off, and neither half is true: there is nothing to follow, and
 * nothing was disabled. `aria-current` on plain text is what the APG's own breadcrumb example
 * carries, and it is what GOV.UK, Spectrum and Apple all ship.
 */
export function BreadcrumbPage({ className, style, children, ref, ...props }: BreadcrumbPageProps) {
  return (
    <span
      ref={ref}
      aria-current="page"
      className={className
        ? `kui-type kui-breadcrumb-page ${className}`
        : "kui-type kui-breadcrumb-page"}
      style={style}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * A level that was dropped from the path — and a way to reach it.
 *
 * A UNION, not four optional fields, so a row with nowhere to go cannot be written. That is
 * the same refusal `items` itself carries one level up: an ellipsis exists to open the levels
 * it hides, and a row that opens nothing is a control promising what it does not have. Written
 * as optional props it type-checked, rendered a focusable `menuitem` that took the highlight,
 * and dismissed the panel on press without going anywhere (ultracode audit 2026-09-01) — which
 * is verbatim the defect the whole component was reversed for, one level down. `tree.tsx`
 * diagnoses the same case in the same words and records the type refusal as owed; this is it.
 */
export type BreadcrumbEllipsisItem = { label: string } & (
  | {
      /** Where it goes. The row becomes an `<a>`, so it is a link a reader can open in a new
          tab — which is what a place, as opposed to a verb, owes. */
      href: string;
      render?: never;
      onClick?: React.MouseEventHandler<HTMLElement>;
    }
  | {
      /** Render the row into your framework's own link component instead. */
      render: RenderElement;
      href?: never;
      onClick?: React.MouseEventHandler<HTMLElement>;
    }
  | {
      /** A place reached by code rather than by a URL. */
      onClick: React.MouseEventHandler<HTMLElement>;
      href?: never;
      render?: never;
    }
);

export type BreadcrumbEllipsisProps = {
  /**
   * The levels you dropped, in path order. REQUIRED, and that is the design: three dots say
   * "there is more here", so an ellipsis that opens nothing is a control promising something
   * it does not have. The component owns the menu so that no call site can ship a dead one.
   */
  items: BreadcrumbEllipsisItem[];
  /** What the hidden stretch is called — the button's accessible name. A WORD, so a
      non-English app states its own. */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * The stretch of the path you are not showing — and the way back into it.
 *
 * **It opens a menu, and it always has one to open.** Three dots are an affordance: they say
 * there is more here. shadcn/ui ships a static span and then wraps it in a dropdown in the one
 * example anybody copies, which leaves an inert marker reachable — and an inert one is what a
 * reader presses first. So the menu is the component: `items` is required, the trigger is a
 * priced icon-only Button, and a dead ellipsis is not expressible.
 *
 * **The rows are PLACES, so they are links.** Each item renders a `MenuItem` into an `<a href>`
 * (or into your framework's link, via `render`), which is what opens `render` on `MenuItem` —
 * a row is still one target, which is why this is a render escape rather than an anchor nested
 * inside the row.
 *
 * **What it does NOT do is decide the truncation.** There is no `maxItems`: which levels to
 * drop depends on the room and on which of them mean anything, and §3 forbids a component
 * owning what it shows. You render the crumbs you are keeping and hand this the rest.
 */
export function BreadcrumbEllipsis({
  items,
  label = "More levels",
  className,
  style,
  ref,
}: BreadcrumbEllipsisProps) {
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            size="2"
            emphasis="quiet"
            iconOnly
            aria-label={label}
            className={className ? `kui-breadcrumb-ellipsis ${className}` : "kui-breadcrumb-ellipsis"}
            {...(style ? { style } : {})}
            {...(ref ? { ref } : {})}
          />
        }
      >
        {/* The glyph is decoration: the button beside it carries the name, and two named nodes
            one inside the other say it twice. */}
        <svg viewBox="0 0 16 16" aria-hidden xmlns="http://www.w3.org/2000/svg">
          <circle cx="3.25" cy="8" r="1.25" fill="currentColor" />
          <circle cx="8" cy="8" r="1.25" fill="currentColor" />
          <circle cx="12.75" cy="8" r="1.25" fill="currentColor" />
        </svg>
      </MenuTrigger>
      <MenuContent>
        {/* Keyed by INDEX, not by `label` (ultracode audit 2026-09-01). A path can legitimately
            hold two levels with one name — `Settings` under two parents — and keying on the
            word made them one row: measured across an `items` change with the panel open, five
            rows rendered for four items with a phantom duplicate, and a removed row stayed on
            screen. `href` is not a total key either, because a level may be reached by code. */}
        {items.map((item, i) => (
          <MenuItem
            key={i}
            {...(item.render
              ? { render: item.render }
              : item.href !== undefined
                ? { render: <a href={item.href} /> }
                : {})}
            {...(item.onClick ? { onClick: item.onClick } : {})}
          >
            {item.label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
