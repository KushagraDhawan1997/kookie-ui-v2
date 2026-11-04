"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SquareLock02Icon,
} from "@hugeicons/core-free-icons";

/**
 * A BROWSER AROUND THE APP (2026-11-04, Kushagra: "I cannot imagine a site without browser
 * chrome ... in both phone + laptop + tablet"). The browser is the device's, not the app's, so it
 * is drawn in plain marks rather than Kookie components: a figure's Kookie UI is the page inside.
 * Desktop and tablet put the address bar at the top; a phone puts it at the bottom, over the home
 * indicator. Only the address is drawn (Kushagra: "just the browser chrome would suffice").
 */
type Kind = "desktop" | "tablet" | "phone";

function Glyph({ icon }: { icon: typeof SquareLock02Icon }) {
  return <HugeiconsIcon icon={icon} size={16} strokeWidth={1.5} aria-hidden />;
}

function Address({ url }: { url: string }) {
  return (
    <span className="kd-browser-address">
      <Glyph icon={SquareLock02Icon} />
      {url}
    </span>
  );
}

/** The bar at the top of a desktop or tablet browser: the address alone, centred (2026-11-04,
 *  Kushagra: "the chrome is too detailed ... Just the url bar would have sufficed"). */
export function BrowserBar({ url }: { kind?: Exclude<Kind, "phone">; url: string }) {
  return (
    <div className="kd-browser-bar">
      <Address url={url} />
    </div>
  );
}

/** A phone browser's address bar, at the bottom of the screen, above the home indicator. */
export function PhoneAddressBar({ url }: { url: string }) {
  return (
    <div className="kd-browser-phone-bar">
      <Address url={url} />
    </div>
  );
}

/**
 * Draws a device at its real size and scales it down, never up, to fit the stage it sits in, so a
 * 16-inch laptop keeps its proportions on any page (2026-11-04, Kushagra: "maintain a 16" Mac
 * proportions. If we need to scale down image to fit, I think that is fine"), to `share` of the
 * stage's width ("lets aim to fit like 80% of space"). Below `min` it stops
 * shrinking and runs off the stage's end, so the UI stays legible on a phone.
 */
export function FitToStage({ min = 0.4, share = 0.8, children }: { min?: number; share?: number; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = React.useState(1);

  React.useLayoutEffect(() => {
    const el = ref.current;
    const stage = el?.parentElement;
    if (!el || !stage) return;
    const fit = () => {
      // The drawn width over the scale in force is the device's real width.
      const natural = el.getBoundingClientRect().width / (parseFloat(el.style.zoom) || 1);
      const room = stage.clientWidth * share;
      const next = Math.max(min, Math.min(1, room / natural));
      setZoom(next);
      // The band around the stage reads the scale too, so its height follows the device's.
      stage.parentElement?.style.setProperty("--kd-fit-zoom", String(next));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [min, share]);

  return (
    <div ref={ref} className="kd-fit" style={{ zoom }}>
      {children}
    </div>
  );
}
