"use client";

/**
 * Figures as photographs (2026-11-06, Kushagra: "why aren't these images?", "Go", then "Lets make
 * all images?"). A live figure could not show what a person sees mid-use: a Select's open panel
 * lives in a portal on the body, outside a scaled figure. So `pnpm figures` shoots each figure live
 * from app/shoot/[name], light and dark at 2x, and the page shows the shot for its appearance.
 * The box around a shot (a figure's band, the hero's window) stays live, so its border and corners
 * turn over with the theme.
 */
import * as React from "react";

import SIZES from "./figure-shots.json";

/** True on a shooting page: there, figures draw themselves live so they can be photographed. */
export const ShootingContext = React.createContext(false);

export function FigureShot({ name }: { name: string }) {
  const size = (SIZES as Record<string, { width: number; height: number } | undefined>)[name];
  return (
    <>
      {(["light", "dark"] as const).map((scheme) => (
        <img
          key={scheme}
          src={`/figures/shots/${name}-${scheme}.webp`}
          alt=""
          {...(size ?? {})}
          loading="lazy"
          decoding="async"
          data-scheme={scheme}
          className="kd-shot"
        />
      ))}
    </>
  );
}

/** A band's inside: its shot on a docs page, the live figure on a shooting page. */
export function BandBody({ name, children }: { name: string; children: React.ReactNode }) {
  return React.use(ShootingContext) ? children : <FigureShot name={name} />;
}
