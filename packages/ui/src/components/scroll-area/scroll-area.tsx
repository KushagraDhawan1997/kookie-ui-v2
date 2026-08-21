"use client";

import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import * as React from "react";

export type ScrollAreaProps = {
  /**
   * The content that scrolls. It lands inside the viewport, never beside the bars, because the
   * viewport, the scrollbars and the corner are assembly rather than API. A scroll region needs a
   * bounded height to be a scroll region: state one here through `style`, or let a Shell pane or a
   * menu's panel bound it.
   */
  children?: React.ReactNode;
  /** Dresses the root. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
  /** Inline styles, merged last. They land on the root, not on the viewport that scrolls. */
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Whether the viewport is a keyboard tab stop. It defaults to true, because a standalone scroll
   * region has to be reachable in order to scroll by keyboard. Pass false from a component that
   * already owns keyboard scrolling, such as Menu: ARIA drops `role="presentation"` from any
   * focusable element, so a focusable viewport inside a menu would appear as a nameless node
   * between the menu and its items, and would add a stray tab stop.
   */
  focusable?: boolean;
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
export function ScrollArea({ children, className, style, ref, focusable = true }: ScrollAreaProps) {
  return (
    <BaseScrollArea.Root
      className={className ? `kui-scroll-area ${className}` : "kui-scroll-area"}
      style={style}
      ref={ref}
      role="presentation"
    >
      <BaseScrollArea.Viewport
        className="kui-scroll-viewport"
        role="presentation"
        render={
          focusable
            ? undefined
            : (props: React.ComponentPropsWithRef<"div">) => {
                // Base UI computes tabIndex unconditionally (0 when scrollable, -1 when
                // not); either value makes the element focusable-by-script, and ARIA's
                // conflict rule voids `presentation` on ANY focusable element. Dropping
                // the attribute is the only spelling that keeps the wrapper structural.
                const { tabIndex: _tabIndex, ...rest } = props;
                void _tabIndex;
                return <div {...rest} />;
              }
        }
      >
        <BaseScrollArea.Content className="kui-scroll-content" role="presentation">
          {children}
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
