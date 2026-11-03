"use client";

import * as React from "react";

/**
 * A FIGURE'S MEASURES (2026-11-02). A purple outline and a size chip on every element inside the
 * band that carries `data-measure` ("height" by default, or "width"). The box and the number are
 * both read from the rendered element, never typed in, so they cannot drift from what the package
 * draws. The number is the element's own CSS size, so a figure drawn smaller still states the real
 * one. The chip sits beside the outline's start, across the card's edge, so it covers none of
 * the screen. Measures mark sizes and edges only, never a caption.
 */
type Measure = { x: number; y: number; w: number; h: number; label: string };

function read(band: HTMLElement): Measure[] {
  const origin = band.getBoundingClientRect();
  return Array.from(band.querySelectorAll<HTMLElement>("[data-measure]")).map((el) => {
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const size = el.dataset.measure === "width" ? style.inlineSize : style.blockSize;
    return {
      // Absolute positions start at the band's padding box, inside its border.
      x: box.left - origin.left - band.clientLeft,
      y: box.top - origin.top - band.clientTop,
      w: box.width,
      h: box.height,
      label: String(Math.round(parseFloat(size))),
    };
  });
}

export function Measures() {
  const anchor = React.useRef<HTMLSpanElement>(null);
  const [measures, setMeasures] = React.useState<Measure[]>([]);

  React.useLayoutEffect(() => {
    const band = anchor.current?.closest<HTMLElement>(".kd-band");
    if (!band) return;
    let done = false;
    let frames = 0;
    let frame = 0;
    // Fonts and the controls settle over the first frames, so the boxes are read for a while
    // rather than once, and again whenever the band changes size.
    const tick = () => {
      if (done) return;
      setMeasures(read(band));
      if (++frames < 120) frame = requestAnimationFrame(tick);
    };
    // One loop at a time: a resize restarts the count rather than starting a second loop.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frames = 0;
      tick();
    });
    observer.observe(band);
    tick();
    return () => {
      done = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <span ref={anchor} aria-hidden>
      {measures.map((m, i) => (
        <React.Fragment key={i}>
          <span className="kd-measure" style={{ left: m.x, top: m.y, width: m.w, height: m.h }}>
            <i style={{ left: -4, top: -4 }} />
            <i style={{ right: -4, top: -4 }} />
            <i style={{ left: -4, bottom: -4 }} />
            <i style={{ right: -4, bottom: -4 }} />
          </span>
          <span className="kd-measure-chip" style={{ left: m.x - 8, top: m.y + m.h / 2 }}>
            {m.label}
          </span>
        </React.Fragment>
      ))}
    </span>
  );
}
