"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import { PAGE_DECK_STEP, PAGE_TITLE_STEP } from "../../system/type-steps.ts";
import { setPageCollapsed, useClaimPage, usePageScope } from "../../system/page.tsx";
import { Heading } from "../heading/heading.tsx";
import { Text } from "../text/text.tsx";

export type PageProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"div">, "color" | "title"> & {
  /**
   * What this screen is. It is a string rather than a child element for one reason: the same
   * words are said twice — once large, once in the band after they have scrolled away — and
   * only a value can be rendered in two places. (Select's `items` exists for the same reason.)
   */
  title: string;
  /** The sentence under the title, set well above the body — the most important sentence on
      the page. Optional: a screen whose title says everything needs no deck. */
  description?: React.ReactNode;
  /**
   * Something above the title, in the reading column — an app's own mark on its front door.
   * It is a LOCKUP with the title (§15): the mark says the name in a drawn letter and the
   * title says it in words, so they sit at the closer interval and the deck is the sentence
   * under the pair. Almost no page has one; a page that does has exactly one.
   */
  mark?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * Page (§46) — the screen you navigated to, and its title.
 *
 * A PAGE IS NOT A BAND, and the two words people say when they mean "page header" have
 * different owners. The pinned row with the navigation toggle, the way back and the tools is
 * the PANE's (`ShellPaneHeader`): it stays put while you move from one page to the next. The
 * large title that arrives and leaves with the content is the PAGE's, and it is this.
 *
 * WHAT IT OWNS is exactly three things, each of which was being written by hand at every call
 * site before it existed:
 *
 * 1. **Clearing the band.** A floating chrome row publishes its reach on the pane
 *    (`--kui-pane-inset-block-start`, §27), and a page pads by it. Nothing is measured, and the
 *    same declaration is right in both postures — a pinned band publishes zero.
 * 2. **The title and its deck**, at §15's page steps, with the one interval between them, and
 *    the larger interval to whatever the page begins with.
 * 3. **The collapse.** A marker sits where the title's block ends, shifted up by the band's own
 *    reach, so it crosses the top of the scroller at exactly the moment the title passes behind
 *    the band. When it does, every `ToolbarTitle` in this pane fades its words in.
 *
 * WHAT IT REFUSES:
 *
 * - **A width.** One measure is wrong for two pages out of three — a chapter is a reading
 *   column with a table of contents beside it, a reference page is prose over wide tables — so
 *   the frame around this states its own, as it always did.
 * - **`level`.** A page is a document's one `h1`; a heading that is not the document's subject
 *   is a `Heading` inside the page.
 * - **`size`.** There is one page step in an app (§15). The docs shipped this prop for an hour
 *   and deleted it with the exception that motivated it.
 * - **Actions.** They go in the toolbar, where every other control in the frame already is.
 *   A row of buttons beside a large title is a second toolbar with no keyboard.
 */
export function Page({
  title,
  description,
  mark,
  className,
  children,
  ...props
}: PageProps) {
  const store = usePageScope();
  const marker = React.useRef<HTMLDivElement>(null);
  useClaimPage(store, title);

  React.useEffect(() => {
    const el = marker.current;
    if (!el || !store) return;
    // The scroller is whatever `ShellScroll` (or any `ScrollArea`) put around this; `null`
    // means the document scrolls, which is the ordinary page outside a frame. `closest` is
    // read ONCE, on mount — this is machinery, not interaction handling, and the observer that
    // follows fires twice per visit rather than per frame (§8).
    const root = el.closest(".kui-scroll-viewport");
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        // Gone off the TOP, not merely gone: a marker below the fold is also unintersecting,
        // and a page shorter than its scroller would otherwise open collapsed.
        const top = entry.rootBounds?.top;
        setPageCollapsed(
          store,
          !entry.isIntersecting &&
            (top === undefined || entry.boundingClientRect.top <= top),
        );
      },
      { root, threshold: 0 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      // A page that unmounts takes its collapse with it, or the next route's band opens
      // holding the last one's answer.
      setPageCollapsed(store, false);
    };
  }, [store]);

  return (
    <div className={className ? `kui-page ${className}` : "kui-page"} {...props}>
      <div className="kui-page-header">
        {mark === undefined || mark === null ? null : (
          <div className="kui-page-mark">{mark}</div>
        )}
        <Heading size={PAGE_TITLE_STEP} render={<h1 />}>
          {title}
        </Heading>
        {description === undefined || description === null ? null : (
          <Text size={PAGE_DECK_STEP} render={<p />}>
            {description}
          </Text>
        )}
        {/* Out of flow, so it displaces nothing and a page with no band behaves identically. */}
        <div ref={marker} className="kui-page-marker" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}
