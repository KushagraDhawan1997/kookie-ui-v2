"use client";

import * as React from "react";

/**
 * A FIGURE'S PANE, SHOWN SCROLLED (2026-11-04, Kushagra: "can we show it in scrolled state").
 * Placed in a pane's scroll content just before an element, it scrolls that pane so the element
 * sits at the top (or as far as the pane scrolls), the way the pane looks after someone has
 * scrolled down to it. It draws nothing, and takes no space, so it measures the element after it.
 */
export function ScrolledTo() {
  const anchor = React.useRef<HTMLSpanElement>(null);

  // The scroll area lays itself out over the first frames, so scroll on each frame until the
  // pane has settled; a scroll before then is reset.
  React.useEffect(() => {
    let frames = 0;
    let id = 0;
    const scroll = () => {
      const target = anchor.current?.nextElementSibling;
      const viewport = anchor.current?.closest<HTMLElement>(".kui-scroll-viewport");
      if (target && viewport) viewport.scrollTop += target.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
      if (++frames < 30) id = requestAnimationFrame(scroll);
    };
    id = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(id);
  }, []);

  return <span ref={anchor} hidden />;
}
