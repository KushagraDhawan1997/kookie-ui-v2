"use client";

/**
 * Shell (§27) — the app frame, spec'd from v1's corpse (LOG 2026-08-16).
 *
 * Eight flat exports: Shell, ShellHeader, ShellRail, ShellSidebar, ShellContent,
 * ShellInspector, ShellBottom, ShellTrigger. The design is mostly deletions from v1, and each
 * one is a straddle removed:
 *
 * - ONE ELEMENT PER PANE, always mounted. Presentation (`fixed | overlay`) is CSS dress on
 *   the same box, never a component switch — v1's Sidebar early-returned a Sheet on the
 *   overlay branch, so crossing a breakpoint unmounted the nav and half the props silently
 *   died (the agreement-law rule in its unwritable form).
 * - STATE LIVES ON THE PANE, the library's one controlled-state pattern (`open` /
 *   `defaultOpen` / `onOpenChange`, exactly Dialog's). The shell does no width arithmetic —
 *   panes are grid items that state their own inline size and content takes the remainder —
 *   so there is nothing to sync, no child scanning, no init ordering.
 * - THE RESPONSIVE DEFAULT IS CSS-RESOLVED ("auto until touched"): an untouched pane renders
 *   `data-state="auto"` and the stylesheet resolves what auto means per §18 window class, so
 *   first paint is right with zero script on server and client alike, hydration cannot
 *   mismatch, and mount-time open/close callbacks are structurally impossible.
 * - RAIL AND SIDEBAR ARE TWO INDEPENDENT COLUMNS (the rail is the narrow icon column, the
 *   sidebar the wide one). No `thin` mode, no exclusivity rule, no close-cascade: an app that
 *   wants the columns linked writes three lines at the call site.
 * - THE HEADER IS FULL-WIDTH BY DEFINITION (Kushagra: "if it isn't wide it's not shell
 *   header, then it's content header"). One geometry — header row, columns beneath — and the
 *   Linear posture is a shell with no ShellHeader plus a header composed inside Content.
 *
 * What crosses the shell is exactly one thing: a ShellTrigger must find its pane. Each pane
 * registers its toggle by name on mount; the trigger looks it up and stamps
 * `aria-expanded` / `aria-controls`. The registry carries no layout state.
 *
 * Deferred, not refused (§27): drag-to-resize (the one-variable width design below is the
 * room left for it), peek, the `stacked` presentation, the mixed flush/floating posture.
 */
import * as React from "react";

import { composeRender, mergeRefs, type RenderElement } from "../../system/render.ts";
import { useWindowClass } from "../../system/window.ts";
import { GlassScope, useMaterial, type SurfaceMaterial } from "../../theme/theme.tsx";

/* ── The registry: the one thing that crosses the shell ─────────────────────────────────── */

export type ShellPaneTarget = "rail" | "sidebar" | "inspector" | "bottom";

/** How a pane presents when open: in flow (`fixed`), floating over content behind a scrim
    (`overlay`), or the system's resolution (`auto`: fixed on roomy windows, overlay on
    narrow ones — resolved in CSS through §18's boundary, so first paint needs no script). */
export type ShellPresentation = "auto" | "fixed" | "overlay";

type PaneEntry = {
  id: string;
  /** The pane's EFFECTIVE open state — `undefined` while an auto pane cannot know yet
      (before mount, the window class is honestly null; §18). */
  expanded: boolean | undefined;
  /** Open AND presenting as an overlay right now — what the scrim closes. */
  overlayLive: boolean;
  /** The pane's own element. The root's containment effect needs it: only the root can see
      the whole live-overlay SET, and it cannot ask the DOM which node belongs to which pane
      (audit 2026-08-16 — a pane wrapped in a plain `<div>` is not a root child at all). */
  el: HTMLElement | null;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

type ShellStore = {
  entries: Map<ShellPaneTarget, PaneEntry>;
  listeners: Set<() => void>;
  /** A monotonic counter, not the Map, is what a subscriber reads: `useSyncExternalStore`
      re-invokes getSnapshot on every render and requires a stable value between
      notifications. A number is stable by construction; a derived array or object would be a
      fresh identity every render. */
  version: number;
};

type ShellCtx = {
  store: ShellStore;
  subscribe: (cb: () => void) => () => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
};

const ShellContext = React.createContext<ShellCtx | null>(null);

function useShellCtx(part: string): ShellCtx {
  const ctx = React.use(ShellContext);
  if (!ctx) throw new Error(`<${part}> must be used within <Shell>`);
  return ctx;
}

const notifyStore = (store: ShellStore) => {
  store.version += 1;
  for (const listener of store.listeners) listener();
};

/* ── Style plumbing ─────────────────────────────────────────────────────────────────────── */

/** React.CSSProperties has no index for custom properties; the width prop writes one. */
type VarStyle = React.CSSProperties & Record<`--${string}`, string>;

const cx = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" ");

/** The surface identity every pane wears — Card's stamps, fixed rather than chosen (§10,
    §27: a pane is a card among cards; seal, edge, material and depth all arrive from
    surfaces.css and this file's stylesheet paints nothing).

    The material is SELECTIVE since 2026-08-17 (§10, merged from main 2026-08-20): a pane
    reads the theme's glass only where a backdrop is stated — the ambient `<Box backdrop>`
    region — and resolves `solid` on the page's calm ground, `on-glass` inside a glass pane.
    A shell pane sits on the app's own ground, so `solid` is the honest default and costs
    nothing; whether a pane should take `backdrop` of its own is an open API question, and
    the overlay pane is its real case (it is the one with content genuinely behind it). */
function surfaceStamps(material: SurfaceMaterial) {
  return {
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    // Solid is the absence of a material, so it writes no attribute (§10).
    ...(material !== "solid" ? { "data-material": material } : {}),
  } as const;
}

/* ── Root ───────────────────────────────────────────────────────────────────────────────── */

export type ShellProps = Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
  /**
   * §27 — are the panes touching? `flush` tiles them edge to edge, each seam one hairline;
   * `floating` separates them, and the gap and visible corners are just what not-touching
   * looks like. The distance is the system's (`--shell-gap`, a layout-space pick, so it
   * answers density); there is no gap prop, deliberately.
   */
  panes?: "flush" | "floating";
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * The frame. A CSS grid whose areas the panes claim for themselves — no child scanning, no
 * arrangement logic, DOM order free for reading order. Height is the app's: the root fills
 * the parent it is given (`100%`), and an app-frame call site typically sits it in a
 * `100dvh` box. The root paints nothing — in floating mode the gaps show the app's own page,
 * the same relationship a card has to the page anywhere else.
 */
export function Shell({ panes = "flush", className, style, children, ref, ...props }: ShellProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [store] = React.useState<ShellStore>(() => ({
    entries: new Map(),
    listeners: new Set(),
    version: 0,
  }));

  const ctx = React.useMemo<ShellCtx>(
    () => ({
      store,
      subscribe: (cb) => {
        store.listeners.add(cb);
        return () => store.listeners.delete(cb);
      },
      rootRef,
    }),
    [store],
  );

  const closeOverlays = React.useCallback(() => {
    for (const entry of store.entries.values()) {
      if (entry.overlayLive) entry.close();
    }
  }, [store]);

  /** ONE snapshot for the whole shell, filled lazily per element — see the containment note
      below. A Map, not an array of pairs, so a re-entering pass cannot double-record. */
  const [inertSnapshot] = React.useState(() => new Map<HTMLElement, boolean>());
  /** Where focus was when the first overlay opened. */
  const returnFocusTo = React.useRef<HTMLElement | null>(null);
  /** The overlay elements live on the previous pass — read on the closing edge, where the
      browser may not have blurred the pane the user is standing in yet. */
  const lastLive = React.useRef<HTMLElement[]>([]);

  // Subscribed for the RE-RENDER, not for a value: a pane opening or closing must bring the
  // root back so the containment pass below runs. The version is read (not bound) because a
  // number is a stable snapshot between notifications, which is what useSyncExternalStore
  // requires — returning the Map, or anything derived from it, would be a fresh identity on
  // every render and either loop or warn.
  React.useSyncExternalStore(
    ctx.subscribe,
    () => store.version,
    () => 0,
  );

  /**
   * CONTAINMENT IS THE ROOT'S, NOT THE PANE'S (rewritten 2026-08-16 after the ultracode
   * audit; four independent lenses found the same critical defect and the critic found two
   * more of its shape).
   *
   * The first spelling gave each pane its own effect: snapshot every OTHER root child's
   * `inert`, set them all true, restore on close. Every part of that is wrong the moment two
   * panes overlay at once, and two panes overlaying at once is an ordinary pointer path (open
   * the nav drawer, press something in it that opens the inspector):
   *
   *   - Each pane inerted its sibling — including a sibling that was itself a live overlay —
   *     so both visible drawers went dead: not focusable, out of the accessibility tree, and
   *     excluded from hit-testing, so a tap on either fell through to the scrim.
   *   - Each pane's snapshot recorded values the OTHER pane's effect had already written, so
   *     whichever cleanup ran last restored `inert = true` onto the header and the content.
   *     The app was then permanently non-operable — keyboard and pointer — until reload.
   *
   * The comment that used to sit here priced that as "two overlays closed out of order would
   * restore a beat early (accepted)". It was not a beat early; it was forever, and the scrim
   * — the mitigation that sentence named — was the path that produced it.
   *
   * A per-pane effect cannot be fixed by ordering, because it can only ever see itself. Only
   * the root can see the whole live-overlay set and the whole child set, so the obligation
   * moves here, as ONE pass with ONE lazily-populated snapshot:
   *
   *   - Exempt = the scrim, plus the root child CONTAINING each live overlay. Containing, not
   *     equal to: a pane the consumer wrapped in a plain `<div>` is not a root child, and
   *     identity-matching inerted the wrapper — so the shell inerted its own open drawer
   *     (the critic's finding, and the worst kind: a reasonable consumer shape).
   *   - The snapshot is keyed per element and filled the first time that element is inerted,
   *     so a pane (or any child) mounted DURING a live overlay is contained on the next pass
   *     and restored correctly, and nothing restores a value another pass wrote.
   *   - Membership is recomputed on every notification, so a pane that becomes live is
   *     released from containment rather than staying dead behind the scrim.
   *
   * What it does NOT do, honestly: contain anything OUTSIDE the shell root. A shell that is
   * not the whole page leaves the page around it tabbable while a pane overlays. That is
   * recorded open in §27 rather than patched here — it is a design question (does a shell
   * overlay trap like a dialog, or is a shell the page?), and the pointer half is already
   * covered because the scrim spans the root.
   */
  React.useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;

    const live = [...store.entries.values()].filter((e) => e.overlayLive && e.el);
    const snapshot = inertSnapshot;

    if (live.length === 0) {
      for (const [el, previous] of snapshot) {
        if (el.isConnected) el.inert = previous;
      }
      snapshot.clear();
      const before = returnFocusTo.current;
      const leaving = lastLive.current;
      returnFocusTo.current = null;
      lastLive.current = [];
      // Focus goes back if it is nowhere useful OR still inside the pane that just closed.
      // The second half is not belt-and-braces: the pane is hidden by CSS on this commit, and
      // Chromium has not necessarily blurred it by the time this effect runs — so "is focus
      // at <body> yet" is a race that reads false and silently drops the user at <body> for
      // good. Measured exactly that way while repairing the audit's critical finding.
      const active = document.activeElement;
      const stranded =
        active === null || active === document.body || leaving.some((el) => el.contains(active));
      if (before && before.isConnected && stranded) before.focus({ preventScroll: true });
      return;
    }

    // CAPTURE FIRST, and this ordering is the whole reason containment and focus are ONE
    // effect rather than two. Inerting the subtree that holds the trigger blurs it, so a
    // capture taken afterwards remembers `<body>` and focus never returns. Split across two
    // effects, React runs them in declaration order and the containment one wins — which is
    // exactly how this regressed while the audit's own repair was being written, caught by
    // the focus law that already existed. LOG 2026-08-16 records learning it the first time.
    if (returnFocusTo.current === null) {
      returnFocusTo.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    // The root child that CONTAINS each live overlay — a wrapped pane exempts its wrapper.
    const exempt = new Set<Element>();
    for (const entry of live) {
      for (const child of rootEl.children) {
        if (child === entry.el || child.contains(entry.el)) exempt.add(child);
      }
    }

    for (const child of rootEl.children) {
      if (!(child instanceof HTMLElement)) continue;
      if (child.classList.contains("kui-shell-scrim")) continue;
      if (exempt.has(child)) {
        // A child that was contained and has since become (or come to hold) a live overlay
        // is released from the snapshot, not merely skipped.
        if (snapshot.has(child)) {
          child.inert = snapshot.get(child)!;
          snapshot.delete(child);
        }
        continue;
      }
      if (!snapshot.has(child)) snapshot.set(child, child.inert);
      child.inert = true;
    }

    // …and only then move focus in, to the first live overlay that does not already hold it.
    lastLive.current = live.map((e) => e.el!);
    const first = live[0]!.el!;
    if (!first.contains(document.activeElement)) first.focus({ preventScroll: true });
    // NO DEPENDENCY ARRAY, deliberately (audit 2026-08-16, the critic's finding). Membership
    // has two triggers, and only one of them notifies: a PANE opening or closing bumps
    // `version`, but an ordinary child mounted behind the scrim — a conditionally rendered
    // section, a route's own node — notifies nothing, and a one-shot pass left it fully
    // live behind the scrim, reachable by Tab and announced by a screen reader. Children are
    // props of Shell, so a child appearing IS a Shell render; running the pass every time is
    // the one trigger that covers both. It reads and writes a handful of root children and
    // does nothing when the set is already correct, so re-running costs a loop, not a paint.
  });

  const liveCount = [...store.entries.values()].filter((e) => e.overlayLive).length;

  /**
   * Escape closes the overlays, and it is ONE key for ONE layer — in both directions
   * (audit 2026-08-16, then the placement pass).
   *
   * Listened on the ROOT rather than on `document`, because a document listener is blind to
   * what is ABOVE it: a Dialog or Menu opened from inside an overlaying pane portals to
   * `document.body` and takes focus with it, so its own Escape also dismissed the pane
   * underneath. Bound to the root, the key only arrives when focus is genuinely inside the
   * shell.
   *
   * And the event STOPS here when this handler consumes it, because the shell is blind to
   * what is BELOW it in the same way: a Shell placed inside a Dialog is a supported
   * placement (§27 — the shell is designed for the app root and must also compose), and
   * measured before this line existed, one Escape closed the pane AND the dialog around it.
   * The pane is the innermost dismissible thing the user is in, so it answers the key and
   * nothing else hears it. `preventDefault` is deliberately NOT called: this is a dismissal,
   * not a cancelled default, and the flag is what other layers read to know it was handled.
   */
  React.useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl || liveCount === 0) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      closeOverlays();
      event.stopPropagation();
    };
    rootEl.addEventListener("keydown", onKeyDown);
    return () => rootEl.removeEventListener("keydown", onKeyDown);
  }, [liveCount, closeOverlays]);

  return (
    <ShellContext.Provider value={ctx}>
      <div
        {...props}
        ref={mergeRefs(ref, rootRef)}
        className={cx("kui-shell", className)}
        data-panes={panes}
        style={style}
      >
        {children}
        {/* Root-owned and always mounted; CSS shows it exactly when a pane overlays, keyed on
            the same two attributes the JS mirror reads. Hidden from AT: the root's
            containment pass is what takes the rest of the shell out of the tree. */}
        <div className="kui-shell-scrim" aria-hidden onClick={closeOverlays} />
      </div>
    </ShellContext.Provider>
  );
}

/* ── The static panes: Header and Content ───────────────────────────────────────────────── */

export type ShellHeaderProps = Omit<React.ComponentPropsWithoutRef<"header">, "color">;

/** Full-width by definition — the criterion, not an option: if it isn't wide, it's a header
    inside ShellContent. Renders a real `<header>` landmark. */
export function ShellHeader({ className, children, ...props }: ShellHeaderProps) {
  const material = useMaterial();
  return (
    <header
      {...props}
      {...surfaceStamps(material)}
      className={cx("kui-surface kui-shell-pane kui-shell-header", className)}
    >
      <GlassScope material={material}>{children}</GlassScope>
    </header>
  );
}

export type ShellContentProps = Omit<React.ComponentPropsWithoutRef<"main">, "color">;

/** The work area — renders `<main>`, scrolls itself, takes whatever room the panes leave. */
export function ShellContent({ className, children, ...props }: ShellContentProps) {
  const material = useMaterial();
  return (
    <main
      {...props}
      {...surfaceStamps(material)}
      className={cx("kui-surface kui-shell-pane kui-shell-content", className)}
    >
      <GlassScope material={material}>{children}</GlassScope>
    </main>
  );
}

/* ── The togglable panes ────────────────────────────────────────────────────────────────── */

type PaneState = "auto" | "open" | "closed";

type TogglePaneOwnProps = {
  /** Controlled open state — Dialog's pattern exactly. */
  open?: boolean;
  /** Initial state when uncontrolled. Omit BOTH and the pane is `auto`: the stylesheet
      resolves its resting state per window class, and the first user toggle makes it
      explicit. */
  defaultOpen?: boolean;
  /** Fired on user-driven changes only (trigger, Escape, scrim) — never at mount, never on
      a window-class crossing: auto's responsive resolution is CSS's, and CSS calls nobody. */
  onOpenChange?: (open: boolean) => void;
  presentation?: ShellPresentation;
};

/** Everything the four togglable panes share: state, registry, and the overlay obligations. */
function usePane(
  name: ShellPaneTarget,
  props: {
    open: boolean | undefined;
    defaultOpen: boolean | undefined;
    onOpenChange: ((open: boolean) => void) | undefined;
    presentation: ShellPresentation;
    id: string | undefined;
  },
) {
  const { store } = useShellCtx(`Shell${name[0]!.toUpperCase()}${name.slice(1)}`);
  const windowClass = useWindowClass();
  const generatedId = React.useId();
  const id = props.id ?? generatedId;
  const presentation = props.presentation ?? "auto";

  const controlled = props.open !== undefined;
  const [inner, setInner] = React.useState<PaneState>(() =>
    props.defaultOpen === undefined ? "auto" : props.defaultOpen ? "open" : "closed",
  );
  const state: PaneState = controlled ? (props.open ? "open" : "closed") : inner;

  // The JS mirror of the stylesheet's auto resolution — the two implementations of one
  // mechanism, and the mounted agreement law is what keeps them one (rule of 2026-08-06).
  // Auto: nav columns rest open on a roomy window; an explicitly-overlay pane rests closed
  // (an overlay is summoned, never ambient); inspector and bottom rest closed everywhere.
  const expanded: boolean | undefined =
    state === "open"
      ? true
      : state === "closed"
        ? false
        : name === "rail" || name === "sidebar"
          ? presentation === "overlay"
            ? false
            : windowClass === null
              ? undefined
              : windowClass !== "narrow"
          : false;

  const overlayLive =
    expanded === true &&
    (presentation === "overlay" || (presentation === "auto" && windowClass === "narrow"));

  // Stable actions over a latest-values ref, so registry entries change only when the facts
  // they carry change.
  // Plain useEffect on both refs below: this package ships no useLayoutEffect (it warns
  // under server rendering, and nothing here needs pre-paint timing — the registry stamps
  // aria attributes post-mount BY DESIGN, the same honesty as useWindowClass's null).
  const latest = React.useRef({ expanded, controlled, onOpenChange: props.onOpenChange });
  React.useEffect(() => {
    latest.current = { expanded, controlled, onOpenChange: props.onOpenChange };
  });

  const setOpen = React.useCallback(
    (next: boolean) => {
      latest.current.onOpenChange?.(next);
      if (!latest.current.controlled) setInner(next ? "open" : "closed");
    },
    [setInner],
  );
  const toggle = React.useCallback(
    () => setOpen(!(latest.current.expanded ?? false)),
    [setOpen],
  );
  const openPane = React.useCallback(() => setOpen(true), [setOpen]);
  const closePane = React.useCallback(() => setOpen(false), [setOpen]);

  // The pane's whole crossing: it publishes what it IS and how to drive it. Containment,
  // focus and Escape are the ROOT's (see Shell) — a per-pane effect can only ever see itself,
  // which is precisely how two overlaying panes came to inert each other and leave the shell
  // permanently dead (audit 2026-08-16).
  const paneRef = React.useRef<HTMLElement | null>(null);
  const setPaneEl = React.useCallback((node: HTMLElement | null) => {
    paneRef.current = node;
  }, []);

  React.useEffect(() => {
    const entry: PaneEntry = {
      id,
      expanded,
      overlayLive,
      el: paneRef.current,
      toggle,
      open: openPane,
      close: closePane,
    };
    store.entries.set(name, entry);
    notifyStore(store);
    return () => {
      if (store.entries.get(name) === entry) {
        store.entries.delete(name);
        notifyStore(store);
      }
    };
  }, [store, name, id, expanded, overlayLive, toggle, openPane, closePane]);

  return { id, state, presentation, paneRef: setPaneEl };
}

type SidePaneProps = Omit<React.ComponentPropsWithoutRef<"nav">, "color"> &
  TogglePaneOwnProps & {
    /**
     * §27 — the system's first sanctioned raw length: a pane's width is the app's content
     * speaking, and no ladder exists that could price it. In CSS pixels. It overrides the
     * designed default by writing the one custom property the stylesheet reads
     * (`--kui-shell-w`) — which is deliberately the whole future resize architecture: a
     * later drag writes where this writes.
     */
    width?: number;
    ref?: React.Ref<HTMLElement>;
  };

function sidePaneStyle(width: number | undefined, style: React.CSSProperties | undefined) {
  if (width === undefined) return style;
  return { "--kui-shell-w": `${width}px`, ...style } as VarStyle;
}

/** One implementation for the three side panes — rail, sidebar, inspector. */
function SidePane({
  name,
  element,
  props,
}: {
  name: ShellPaneTarget;
  element: "nav" | "aside";
  props: SidePaneProps;
}) {
  const {
    open,
    defaultOpen,
    onOpenChange,
    presentation,
    width,
    id,
    className,
    style,
    children,
    ref,
    ...rest
  } = props;
  const material = useMaterial();
  const pane = usePane(name, { open, defaultOpen, onOpenChange, presentation: presentation ?? "auto", id });
  const Element = element;
  return (
    <Element
      {...rest}
      id={pane.id}
      ref={mergeRefs(ref, pane.paneRef)}
      className={cx("kui-surface kui-shell-pane", `kui-shell-${name}`, className)}
      {...surfaceStamps(material)}
      data-state={pane.state}
      data-presentation={pane.presentation}
      // Focus lands here programmatically when the pane overlays — a mode, not a keyboard
      // affordance, the menu popup's sentence.
      tabIndex={-1}
      style={sidePaneStyle(width, style)}
    >
      <GlassScope material={material}>{children}</GlassScope>
    </Element>
  );
}

export type ShellRailProps = SidePaneProps;

/** The narrow icon column — the one that switches sections. Independent of the sidebar:
    nothing excludes anything, because nothing overlaps (§27 deleted v1's thin mode, the
    exclusivity rule and the close-cascade in one renaming). Renders `<nav>`; when two nav
    landmarks are present, give each an `aria-label`. */
export function ShellRail(props: ShellRailProps) {
  return <SidePane name="rail" element="nav" props={props} />;
}

export type ShellSidebarProps = SidePaneProps;

/** The wide navigation column. Renders `<nav>`. */
export function ShellSidebar(props: ShellSidebarProps) {
  return <SidePane name="sidebar" element="nav" props={props} />;
}

export type ShellInspectorProps = SidePaneProps;

/** The right-side detail column — rests closed until asked for (`auto` means closed here;
    pass `defaultOpen` for an inspector that starts open). Renders `<aside>`. */
export function ShellInspector(props: ShellInspectorProps) {
  return <SidePane name="inspector" element="aside" props={props} />;
}

export type ShellBottomProps = Omit<React.ComponentPropsWithoutRef<"aside">, "color"> &
  TogglePaneOwnProps & {
    /** §27 — the bottom pane's block extent, the width prop's sentence turned 90°. */
    height?: number;
    ref?: React.Ref<HTMLElement>;
  };

/** The bottom pane — terminals, logs. Rests closed; spans the full width below the columns.
    Renders `<aside>`. */
export function ShellBottom(props: ShellBottomProps) {
  const {
    open,
    defaultOpen,
    onOpenChange,
    presentation,
    height,
    id,
    className,
    style,
    children,
    ref,
    ...rest
  } = props;
  const material = useMaterial();
  const pane = usePane("bottom", {
    open,
    defaultOpen,
    onOpenChange,
    presentation: presentation ?? "auto",
    id,
  });
  return (
    <aside
      {...rest}
      id={pane.id}
      ref={mergeRefs(ref, pane.paneRef)}
      className={cx("kui-surface kui-shell-pane kui-shell-bottom", className)}
      {...surfaceStamps(material)}
      data-state={pane.state}
      data-presentation={pane.presentation}
      tabIndex={-1}
      style={
        height === undefined
          ? style
          : ({ "--kui-shell-h": `${height}px`, ...style } as VarStyle)
      }
    >
      <GlassScope material={material}>{children}</GlassScope>
    </aside>
  );
}

/* ── Trigger ────────────────────────────────────────────────────────────────────────────── */

export type ShellTriggerProps = Omit<React.ComponentPropsWithoutRef<"button">, "color"> & {
  /** Which pane this button drives. */
  target: ShellPaneTarget;
  action?: "toggle" | "open" | "close";
  /** Usually a Kookie Button: `<ShellTrigger target="sidebar" render={<Button iconOnly …/>}>`. */
  render?: RenderElement;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * The one crossing (§27): a button anywhere in the shell drives a pane by name, through the
 * registry — no state is lifted for it. Stamps `aria-expanded` (the pane's effective state;
 * omitted while an auto pane honestly cannot know, i.e. before mount) and `aria-controls`.
 */
export function ShellTrigger({
  target,
  action = "toggle",
  render,
  onClick,
  className,
  style,
  children,
  ref,
  ...props
}: ShellTriggerProps) {
  const ctx = useShellCtx("ShellTrigger");
  const getSnapshot = React.useCallback(
    () => ctx.store.entries.get(target),
    [ctx.store, target],
  );
  const entry = React.useSyncExternalStore(ctx.subscribe, getSnapshot, () => undefined);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      const current = ctx.store.entries.get(target);
      if (!current) return;
      if (action === "toggle") current.toggle();
      else if (action === "open") current.open();
      else current.close();
    },
    [onClick, ctx.store, target, action],
  );

  const merged = {
    ...props,
    "aria-expanded": entry?.expanded,
    "aria-controls": entry?.id,
    onClick: handleClick,
    className,
    style,
    ref,
  };

  // `type="button"` only on the button this file renders: a render target keeps its own
  // element semantics (the Button-as-anchor lesson, 2026-08-03 — never stamp a button fact
  // onto an element that may not be one).
  if (render) return composeRender(render, merged as never, children);
  return (
    <button {...merged} type="button">
      {children}
    </button>
  );
}
