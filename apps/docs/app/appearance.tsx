"use client";

/**
 * The client half of the appearance mechanism: a tiny external store over the same two
 * localStorage keys the pre-paint script reads (appearance-script.ts). The <html> element is
 * the single source of truth — the store only ever writes attributes there and persists the
 * choice; it never mirrors appearance into React state that could disagree with the DOM.
 *
 * `useSyncExternalStore` with a server snapshot of the defaults is what makes hydration safe:
 * the server renders the toggles in their "system"/"auto" position, and the first client
 * render corrects them without a mismatch error — the next-themes shape.
 */
import * as React from "react";

import { APPEARANCE_KEY, CONTRAST_KEY } from "./appearance-script";

export type AppearanceChoice = "system" | "light" | "dark";
export type ContrastChoice = "auto" | "normal" | "high";

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const emit = () => {
  for (const l of listeners) l();
};

const appearanceChoice = (): AppearanceChoice => {
  const s = localStorage.getItem(APPEARANCE_KEY);
  return s === "light" || s === "dark" ? s : "system";
};

const contrastChoice = (): ContrastChoice => {
  const s = localStorage.getItem(CONTRAST_KEY);
  return s === "high" || s === "normal" ? s : "auto";
};

/** Re-derive the <html> attributes from storage + the platform — the script's logic, live. */
const apply = () => {
  const el = document.documentElement;
  const a = appearanceChoice();
  const dark = a === "system" ? matchMedia("(prefers-color-scheme: dark)").matches : a === "dark";
  el.setAttribute("data-appearance", dark ? "dark" : "light");
  const c = contrastChoice();
  // `auto` removes the attribute rather than writing "normal": Theme's own rule — the
  // platform's `prefers-contrast: more` must still reach a page that never chose (§7).
  if (c === "auto") el.removeAttribute("data-contrast");
  else el.setAttribute("data-contrast", c);
};

export function setAppearance(choice: AppearanceChoice) {
  if (choice === "system") localStorage.removeItem(APPEARANCE_KEY);
  else localStorage.setItem(APPEARANCE_KEY, choice);
  apply();
  emit();
}

export function setContrast(choice: ContrastChoice) {
  if (choice === "auto") localStorage.removeItem(CONTRAST_KEY);
  else localStorage.setItem(CONTRAST_KEY, choice);
  apply();
  emit();
}

export function useAppearance() {
  const choice = React.useSyncExternalStore(subscribe, appearanceChoice, () => "system" as const);
  const contrast = React.useSyncExternalStore(subscribe, contrastChoice, () => "auto" as const);

  // While the choice is "system", the OS can flip underneath us — track it live.
  React.useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (appearanceChoice() === "system") apply();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return { choice, contrast };
}
