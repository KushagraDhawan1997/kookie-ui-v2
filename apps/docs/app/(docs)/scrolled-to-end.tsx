"use client";

import * as React from "react";

/**
 * A pane shown scrolled near its end, the way it looks while someone scrolls down (after the v2
 * docs' ScrolledTo). `short` stops that many pixels before the end, so the last rows are still
 * passing under what floats over the pane's foot. `top` instead scrolls that far from the start,
 * so the top of the page passes under the floating header. Placed in the scroll content; it
 * draws nothing.
 */
export function ScrolledToEnd({ short = 0, top }: { short?: number; top?: number }) {
  const anchor = React.useRef<HTMLSpanElement>(null);

  // The scroll area lays itself out over the first frames, so scroll on each frame until it has
  // settled; a scroll before then is reset.
  React.useEffect(() => {
    let frames = 0;
    let id = 0;
    const scroll = () => {
      const viewport = anchor.current?.closest<HTMLElement>(".kui-scroll-viewport");
      if (viewport) viewport.scrollTop = top ?? viewport.scrollHeight - viewport.clientHeight - short;
      if (++frames < 30) id = requestAnimationFrame(scroll);
    };
    id = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(id);
  }, [short, top]);

  return <span ref={anchor} hidden />;
}
