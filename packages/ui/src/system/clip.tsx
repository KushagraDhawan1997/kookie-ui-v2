"use client";

/**
 * The clipping warning (§3, §10 — 2026-08-21, the Dialog audit).
 *
 * A pane clips. That is what lets a child reach the pane's edge — a photograph across the top
 * of a card, a list running under the corner — without squaring the corner it sits in, and it
 * has been true of every `.kui-surface` since `m="bleed"` shipped (2026-08-20). The cost was
 * never priced: content wider than the pane stops being cut off *visibly* and starts being
 * deleted. Measured in a size-2 dialog — a 12-column table at 718px inside a 440px panel, a
 * `<pre>` at 952px — no bar, no spill, no error, four hundred pixels of content simply absent.
 *
 * Two halves ship against that. Text that CAN wrap now does (`overflow-wrap: break-word` on
 * the Theme root, type.css), which covers the ordinary cases — a URL, a path, a hash. What is
 * left is content that must not wrap, where the system's answer is a ScrollArea and the pane
 * rule makes it work. This is what makes that answer discoverable: without it the composition
 * that loses your table looks exactly like the one that does not.
 *
 * A warning and not a repair, because there is no repair to make. The two axes cannot be
 * spelled differently — CSS resolves `overflow-x: auto` beside a clipped `overflow-y` to
 * `hidden`, which is a scroll container, which is the thing the flight rules spent two days
 * keeping panes out of. So the pane keeps its clip and the author is told.
 *
 * Called by the panes that hold content the CALL SITE wrote — Card, Surface, Dialog. Menu,
 * Select and AlertDialog own what is inside them, so there is nobody to warn.
 */
import * as React from "react";

/** Box's own spelling and its own scar: an ABSENT `process` means dev (audit 2026-08-08). */
const DEV = typeof process === "undefined" || process.env?.NODE_ENV !== "production";

export function useClipWarning(what: string): (node: HTMLElement | null) => void {
  const seen = React.useRef<HTMLElement | null>(null);
  const attach = React.useCallback((node: HTMLElement | null) => {
    seen.current = node;
  }, []);
  // A callback ref that opened a ResizeObserver would have nothing to close it: the store-then
  // -observe split is Box's (box.tsx), and it is what gives the observer a cleanup at all.
  React.useEffect(() => {
    if (!DEV) return;
    const node = seen.current;
    if (!node) return;
    let warned = false;
    const check = () => {
      if (warned || !node.isConnected) return;
      // A pane that is not LAID OUT is not a pane that clips — Box's lesson at audit
      // 2026-08-08: an element under a `display: none` ancestor still computes its own
      // display, so asking CSS cannot tell the two apart.
      if (typeof node.checkVisibility === "function" && !node.checkVisibility()) return;
      // 1px of slack: sub-pixel layout rounds, and a warning that fires on rounding is a
      // warning people learn to ignore.
      if (node.scrollWidth <= node.clientWidth + 1) return;
      warned = true;
      console.warn(
        `[kookie-ui] Content inside a ${what} is ${node.scrollWidth - node.clientWidth}px ` +
          "wider than it is, and a pane clips — so that content is not reachable, not even " +
          "by scrolling. Wrap it in a <ScrollArea>, or let it wrap.",
      );
    };
    // Once now and again on every resize: content arrives from a fetch, and a pane narrows
    // long after it mounted. One shot at mount is silent for both (Box, audit 2026-08-08).
    //
    // The check runs in a FRAME rather than inside the observer's own callback, and that is
    // not hygiene: measuring layout during delivery is what makes Chromium raise
    // "ResizeObserver loop completed with undelivered notifications", which the suite reports
    // as an error on the page. Measured — zero such errors on the shipped code, one per run
    // with the read moved back inline. Box's observer never hit it because it observes only
    // the handful of boxes that opted into containment.
    let frame = 0;
    const schedule = () => {
      if (frame || warned) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        check();
      });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(node);
    schedule();
    return () => {
      resize.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [what]);
  return attach;
}
