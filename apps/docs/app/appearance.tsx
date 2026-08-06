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

/**
 * Storage access, guarded — and the guard is not defensive habit, it is the difference
 * between a degraded preference and a dead site.
 *
 * Touching `localStorage` THROWS, rather than returning null, wherever the browser denies
 * site data: Safari's "Block all cookies", the Chrome/Firefox equivalents, enterprise
 * policy, a sandboxed frame. The readers below are the `getSnapshot` argument to
 * `useSyncExternalStore`, so they run during RENDER, on every route the header mounts on —
 * which is all of them. Unguarded, that throw escaped to Next's global error boundary and
 * replaced the whole document with "This page couldn't load", unrecoverable by reload.
 *
 * The asymmetry that let it ship: the pre-paint script (appearance-script.ts) has always
 * wrapped these same two reads in try/catch, so the half of the mechanism that fails SAFELY
 * was guarded and the half that kills the page was not. One mechanism, one rule.
 *
 * Degrading to "system"/"auto" is the right failure: matchMedia needs no storage, so a
 * visitor who cannot persist a choice still gets a correct appearance — they just cannot
 * override the OS.
 */
const read = (key: string): string | null => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

/** Writes are guarded for the same reason and one more: a full quota throws here too, and
    persistence failing must never stop the change from being APPLIED (see the setters). */
const write = (key: string, value: string | null) => {
  try {
    if (value === null) globalThis.localStorage?.removeItem(key);
    else globalThis.localStorage?.setItem(key, value);
  } catch {
    /* the choice still applies for this page view; it just will not survive a reload */
  }
};

const appearanceChoice = (): AppearanceChoice => {
  const s = read(APPEARANCE_KEY);
  return s === "light" || s === "dark" ? s : "system";
};

const contrastChoice = (): ContrastChoice => {
  const s = read(CONTRAST_KEY);
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

/* Persist first, then APPLY — and the order is why both are guarded rather than wrapped
   together. Unguarded, a throwing write skipped apply() and emit() entirely, so on a
   storage-exhausted origin clicking "Dark" did nothing at all while "System" kept working
   (it takes the removeItem branch): a toggle that looks half-alive. Applying is the part
   the user asked for; persisting is the part that makes it survive a reload. Losing the
   second must never cost the first. */
export function setAppearance(choice: AppearanceChoice) {
  write(APPEARANCE_KEY, choice === "system" ? null : choice);
  apply();
  emit();
}

export function setContrast(choice: ContrastChoice) {
  write(CONTRAST_KEY, choice === "auto" ? null : choice);
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
    // And the other tab is a second writer to the same storage. Without this a second open
    // tab — likely here, since the matrix is meant to be compared against another page —
    // keeps the old appearance forever AND misreports which chip is active, so clicking the
    // highlighted one writes the stale value back and reverts the first tab's choice.
    // `storage` fires only in the tabs that did not write, which is exactly the set that
    // needs to catch up.
    const onStorage = (e: StorageEvent) => {
      if (e.key === APPEARANCE_KEY || e.key === CONTRAST_KEY || e.key === null) {
        apply();
        emit();
      }
    };
    addEventListener("storage", onStorage);
    return () => {
      mq.removeEventListener("change", onChange);
      removeEventListener("storage", onStorage);
    };
  }, []);

  return { choice, contrast };
}
