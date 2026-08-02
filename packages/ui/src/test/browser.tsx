/**
 * Scaffolding for the browser project. Not part of the public surface — nothing here is
 * reachable from `src/index.ts`, so it is never built or published.
 *
 * It exists because the browser laws come in two kinds that must not be confused: the ones
 * that mount a real component and read what the engine computed, and the ones that write the
 * markup the component is *supposed* to produce. The second kind proves the stylesheet; only
 * the first kind proves the React half, and for a while only the second kind existed.
 */
import type { ReactElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

import layoutCss from "../system/layout.css?raw";
import tokensCss from "../tokens/tokens.css?raw";

let installed = false;

/** The committed artifacts, not the generators: these tests are about what actually ships. */
export function installStyles(): void {
  if (installed) return;
  const sheet = document.createElement("style");
  sheet.textContent = `${tokensCss}\n${layoutCss}`;
  document.head.append(sheet);
  installed = true;
}

/**
 * Mounts into a detached-then-attached host and returns the element the component rendered.
 *
 * `flushSync` rather than an async helper because every assertion downstream is a synchronous
 * `getComputedStyle`, and a test that has to await its own layout invites the race it is
 * supposed to be checking for.
 */
export function render(ui: ReactElement): HTMLElement {
  installStyles();
  const host = document.createElement("div");
  document.body.append(host);
  flushSync(() => createRoot(host).render(ui));
  return host.firstElementChild as HTMLElement;
}

export const computed = (el: Element, prop: string): string =>
  getComputedStyle(el).getPropertyValue(prop).trim();
