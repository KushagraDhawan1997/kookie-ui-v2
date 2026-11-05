"use client";

import * as React from "react";

/**
 * A ROW OF DEVICES SCALED TO ITS BAND (2026-11-05). The row is laid out at its real size and drawn
 * smaller with a transform, never CSS `zoom`: zoom snaps borders to device pixels, so the
 * measures would read 32 as 33. The scale is the band's width over the row's, at `share` of the
 * band and never above 1, read again whenever the band changes size. The row's own CSS centres
 * it and sets where it shrinks from.
 */
export function ScaleToBand({ share = 0.94, className, children }: { share?: number; className?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.6);

  React.useLayoutEffect(() => {
    const row = ref.current;
    const band = row?.closest<HTMLElement>(".kd-band");
    if (!row || !band) return;
    const fit = () => setScale(Math.min(1, (band.clientWidth * share) / row.offsetWidth));
    const observer = new ResizeObserver(fit);
    observer.observe(band);
    fit();
    return () => observer.disconnect();
  }, [share]);

  return (
    <div ref={ref} className={className} style={{ scale: String(scale) }}>
      {children}
    </div>
  );
}
