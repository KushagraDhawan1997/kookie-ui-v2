"use client";

import * as React from "react";

/**
 * The one thing that crosses a pane: what page is in it, and whether its title has scrolled
 * away (§45, §46).
 *
 * A page's large title lives INSIDE the scroller and the band that shows it again lives
 * OUTSIDE, as a sibling — so React context, which only ever flows down, cannot carry it from
 * the one to the other. The store sits at their common ancestor instead, which is the pane,
 * and this is the shell's own registry pattern one level down: `ShellTrigger` finds its pane
 * the same way, and for the same reason.
 *
 * A PANE PROVIDES IT, never the Shell root and never the Theme. Two panes each holding a page
 * is a shape the frame allows (a sidebar with a titled list beside a titled document), and one
 * store above both would make the second page overwrite the first. It is also what keeps the
 * full-width `ShellHeader` out of the arrangement by construction: that row is not inside any
 * pane, so a `ToolbarTitle` in it can never find a page's title and always speaks for itself.
 *
 * OUTSIDE A SHELL THERE IS NO SCOPE, and both halves degrade honestly rather than half-work: a
 * `Page` still draws its heading and a `ToolbarTitle` still shows its own words. The collapse
 * is a property of a FRAME — a band pinned over a scrolling region — and a page in a Card has
 * neither, so there is nothing to be right about.
 */
export type PageStore = {
  /** The words of the page in this pane, or null while nothing has claimed it. */
  title: string | null;
  /** Every `ToolbarTitle` mirroring this pane's page. Held as ELEMENTS, not as React state:
      the collapse is written straight onto them (see `setPageCollapsed`). */
  mirrors: Set<HTMLElement>;
  /** Whether the page's own title has scrolled up behind the band. */
  collapsed: boolean;
  listeners: Set<() => void>;
  /** A monotonic counter is what a subscriber reads — `useSyncExternalStore` re-invokes
      getSnapshot on every render and requires a stable value between notifications, which a
      derived object could never be. The shell store's own note, verbatim. */
  version: number;
};

const PageScopeContext = React.createContext<PageStore | null>(null);

function notify(store: PageStore) {
  store.version += 1;
  for (const listener of store.listeners) listener();
}

/**
 * THE COLLAPSE IS AN ATTRIBUTE WRITE, NOT A RENDER (§8's doctrine, honoured rather than
 * argued around).
 *
 * The signal arrives from an IntersectionObserver, which fires twice per visit to a page — once
 * when the title leaves and once when it comes back — so this is nowhere near per-frame work.
 * It still writes the attribute directly on the elements that answer it rather than calling
 * `setState`, because a React render is the wrong unit for a fact only CSS reads: nothing about
 * the title's WORDS changes when it collapses, only whether it is painted, and the stylesheet
 * is where that is said.
 */
export function setPageCollapsed(store: PageStore, collapsed: boolean): void {
  if (store.collapsed === collapsed) return;
  store.collapsed = collapsed;
  for (const el of store.mirrors) {
    if (collapsed) el.setAttribute("data-collapsed", "");
    else el.removeAttribute("data-collapsed");
  }
}

/** Every pane renders one. It draws nothing — the store is the whole of it. */
export function PageScope({ children }: { children: React.ReactNode }) {
  const store = React.useMemo<PageStore>(
    () => ({ title: null, mirrors: new Set(), collapsed: false, listeners: new Set(), version: 0 }),
    [],
  );
  return <PageScopeContext.Provider value={store}>{children}</PageScopeContext.Provider>;
}

export function usePageScope(): PageStore | null {
  return React.use(PageScopeContext);
}

/**
 * A `Page` claims the pane it is in. The claim lands in an effect rather than during render,
 * because writing to a store while rendering is what makes a subscriber's snapshot disagree
 * with what it just returned; the one frame of lateness costs nothing, since a mirroring title
 * is invisible until the page has been scrolled anyway.
 */
export function useClaimPage(store: PageStore | null, title: string): void {
  React.useEffect(() => {
    if (!store) return;
    store.title = title;
    notify(store);
    return () => {
      if (store.title === title) {
        store.title = null;
        notify(store);
      }
    };
  }, [store, title]);
}

/** What a `ToolbarTitle` shows when it is given no words of its own. */
export function usePageTitle(store: PageStore | null): string | null {
  const subscribe = React.useCallback(
    (cb: () => void) => {
      if (!store) return () => {};
      store.listeners.add(cb);
      return () => store.listeners.delete(cb);
    },
    [store],
  );
  const version = React.useSyncExternalStore(
    subscribe,
    () => store?.version ?? 0,
    () => 0,
  );
  // `version` is read so the subscription actually re-renders this consumer; the value it
  // guards is the title itself, which is not a stable snapshot and so cannot be the snapshot.
  void version;
  return store?.title ?? null;
}

/**
 * Registers a mirroring title's element, and stamps it with whatever the page is doing NOW —
 * a title that mounts after its page has already scrolled must arrive collapsed, which is the
 * ordinary case on a route change.
 */
export function usePageMirror(store: PageStore | null): React.RefCallback<HTMLElement> {
  return React.useCallback(
    (el: HTMLElement | null) => {
      if (!store || !el) return;
      store.mirrors.add(el);
      if (store.collapsed) el.setAttribute("data-collapsed", "");
      return () => {
        store.mirrors.delete(el);
      };
    },
    [store],
  );
}
