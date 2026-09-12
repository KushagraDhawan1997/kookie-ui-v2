"use client";

import * as React from "react";

import { windowClassQueries } from "./window.ts";

/**
 * WHEN A WINDOW SHELL LETS THE PAGE SCROLL (§27, 2026-09-11): a narrow window under a coarse
 * pointer. The stylesheet decides it (shell.css, the page-scroll block) so first paint is right
 * with no script; this is the JS mirror, for the few things only script can do when the answer
 * changes — move the reading position between the two scrollers, rebuild the Page title's
 * observer, and take the viewport out of the tab order. Built from the window class's own narrow
 * query so the boundary has one home.
 */
export const pageScrollQuery = `${windowClassQueries.narrow} and (pointer: coarse)`;

let list: MediaQueryList | undefined;
const media = () => (list ??= window.matchMedia(pageScrollQuery));

function subscribe(onChange: () => void): () => void {
  const m = media();
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}

/** True where a window Shell lets the page scroll. False on the server and before hydration,
    which is the frame-scrolls answer — the one the markup does not depend on. */
export function usePageScrollMedia(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => media().matches,
    () => false,
  );
}

/** Subscribe to the answer changing, outside React. */
export function onPageScrollMediaChange(onChange: (matches: boolean) => void): () => void {
  const m = media();
  const handler = () => onChange(m.matches);
  m.addEventListener("change", handler);
  return () => m.removeEventListener("change", handler);
}
