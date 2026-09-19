"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { ViewportAsContext } from "../../system/scroll-viewport.ts";
import * as React from "react";

export type ScrollAreaProps = ComponentRefusals & {
  /**
   * The content that scrolls. The scroll area must have a limited height. Set one with `style`,
   * or put the scroll area in a container that limits its height, such as a `Shell` panel.
   */
  children?: React.ReactNode;
  /** Adds a class to the outer element. To add space around it, wrap it in a `<Box m>`. */
  className?: string;
  /** Inline styles for the outer element, not for the viewport that scrolls. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Whether keyboard users can tab to the scroll area. The default is `true`, so people can
   * scroll it with the keyboard. Set it to `false` inside a component that already handles
   * keyboard scrolling, such as a menu.
   */
  focusable?: boolean;
  /**
   * The accessible name of the scroll area. Set it on a focusable scroll area, because screen
   * readers announce a tab stop without a name as nothing. With a name, the scroll area is a
   * `region` landmark.
   */
  "aria-label"?: string;
  /** The id of an element that names the scroll area, usually a heading above it. Use it
      instead of `aria-label`, not together with it. */
  "aria-labelledby"?: string;
  /**
   * Fades the content at each edge that has more content beyond it. An edge fades only while
   * content is hidden on that side. The fade shows the background behind it, so it works on
   * any colour or on glass. The default is `false`.
   */
  fade?: boolean;
};

/**
 * Custom scrollbars over NATIVE scrolling (2026-08-17, Kushagra: "minimal — just what
 * custom scrollbars look like"). Base UI's ScrollArea keeps the platform's overflow, wheel
 * and momentum untouched and only draws the bar, which is what keeps this inside "no JS at
 * interaction time" in spirit: the library's scroll listener writes CSS variables the way
 * its positioner writes --anchor-width — machinery, not interaction handling. (The pure-CSS
 * scroll-timeline spelling is the recorded alternative when it leaves Chromium-only.)
 *
 * ONE export, not six parts (§10's anatomy criterion): nothing non-visual forces a caller
 * to reach the viewport, the bar or the corner, so they are assembly, not API. Both
 * scrollbars are declared here and Base UI mounts the ones the content actually needs, on
 * the frame after it measures the viewport — so orientation is a fact the CONTENT decides,
 * not a prop. (Measured 2026-08-17, correcting this sentence's first claim that both are
 * "always rendered — inert without overflow": a ScrollArea with nothing to scroll renders
 * no bar at all, and its laws had to learn to wait a frame for the ones that do.)
 *
 * Refused, each for a reason the system already owns: `size` (one designed thickness —
 * Progress's sentence, a scrollbar has no box of its own to index), `tone`/`emphasis`
 * (an instrument, the slider's sentence — nothing here ranks or means), `material` (it
 * draws over content INSIDE a pane; the pane answers the theme), `render` (the anatomy is
 * Base UI's contract).
 *
 * The wrappers are role="presentation" so a ScrollArea inside a role-bearing widget (a
 * menu's popup) adds no structural children — FloatingBody's own sanction, one layer out.
 * That sentence is only TRUE when `focusable={false}` strips the viewport's tabindex (see
 * the prop): presentation is ignored on a focusable element, which is how the first
 * adoption shipped a generic node between `menu` and `menuitem` with this comment claiming
 * otherwise. The scrollbars and corner carry presentation too — they are drawn instruments,
 * not structure, and they were landing as roleless children of the host's role.
 */
export function ScrollArea({
  children,
  className,
  style,
  ref,
  focusable = true,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  fade,
}: ScrollAreaProps) {
  /* The name lands on the VIEWPORT, because the viewport is the element that scrolls and the
     element that takes focus — a name on the root would describe a box nobody can reach.
     `region` only where the pair is real: a landmark with no name is worse than no landmark,
     and a non-focusable viewport (a menu's) must stay structural whatever it is called. */
  const named = focusable && (label !== undefined || labelledBy !== undefined);
  // A message scroller inside asks the viewport to render as its own element: one div, both
  // libraries' refs and listeners (system/scroll-viewport.ts).
  const Viewport = React.use(ViewportAsContext) ?? "div";
  return (
    <BaseScrollArea.Root
      className={className ? `kui-scroll-area ${className}` : "kui-scroll-area"}
      style={style}
      ref={ref}
      role="presentation"
      {...(fade ? { "data-fade": "" } : {})}
    >
      <BaseScrollArea.Viewport
        className="kui-scroll-viewport"
        role={named ? "region" : "presentation"}
        {...(label !== undefined ? { "aria-label": label } : {})}
        {...(labelledBy !== undefined ? { "aria-labelledby": labelledBy } : {})}
        render={(props: React.ComponentPropsWithRef<"div">) => {
          // Base UI computes tabIndex unconditionally (0 when scrollable, -1 when not); either
          // value makes the element focusable-by-script, and ARIA's conflict rule voids
          // `presentation` on ANY focusable element. Dropping the attribute is the only
          // spelling that keeps the wrapper structural.
          const { tabIndex, style: libraryStyle, ...rest } = props;
          // AND THE OVERFLOW IS THE STYLESHEET'S (2026-09-11). Base UI writes `overflow: scroll`
          // inline, and an inline declaration beats every rule, so a context that needs this box
          // NOT to scroll could not say so without `!important` — which this package refuses.
          // The one that needs it is a window Shell on a phone, where the page scrolls and the
          // viewport must stop being a scroll container or nothing inside it can stick to the
          // page. The stylesheet has always declared `overflow: auto` here, so removing the
          // inline value changes what wins, never what renders: the bars are hidden either way.
          const { overflow: _overflow, ...ownStyle } = libraryStyle ?? {};
          void _overflow;
          return <Viewport {...rest} {...(focusable ? { tabIndex } : {})} style={ownStyle} />;
        }}
      >
        <BaseScrollArea.Content
          className="kui-scroll-content"
          role="presentation"
          render={(props: React.ComponentPropsWithRef<"div">) => {
            // The content's minimum width is the stylesheet's too, for the viewport's reason: Base
            // UI writes `min-width: fit-content` inline, and a window Shell on a phone has to take
            // it away so wide content wraps at the screen instead of widening the page.
            const { style: libraryStyle, ...rest } = props;
            const { minWidth: _minWidth, ...ownStyle } = libraryStyle ?? {};
            void _minWidth;
            return <div {...rest} style={ownStyle} />;
          }}
        >
          {/* The request is for THIS viewport only. A ScrollArea nested inside (a CodeBlock in a
              reply, a menu's popup — context crosses portals) must render a plain div again, or
              every nested viewport claims the outer scroller's id, ref and listeners. */}
          <ViewportAsContext value={null}>{children}</ViewportAsContext>
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar orientation="vertical" className="kui-scrollbar" role="presentation">
        <BaseScrollArea.Thumb className="kui-scroll-thumb" role="presentation" />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Scrollbar orientation="horizontal" className="kui-scrollbar" role="presentation">
        <BaseScrollArea.Thumb className="kui-scroll-thumb" role="presentation" />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Corner className="kui-scroll-corner" role="presentation" />
    </BaseScrollArea.Root>
  );
}
