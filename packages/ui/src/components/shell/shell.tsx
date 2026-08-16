"use client";

/**
 * Shell (§26) — the app frame, spec'd from v1's corpse (LOG 2026-08-16).
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
 * Deferred, not refused (§26): drag-to-resize (the one-variable width design below is the
 * room left for it), peek, the `stacked` presentation, the mixed flush/floating posture.
 */
import * as React from "react";

import { composeRender, mergeRefs, type RenderElement } from "../../system/render.ts";
import { useWindowClass } from "../../system/window.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import type { Material } from "../../system/axes.ts";

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
  toggle: () => void;
  open: () => void;
  close: () => void;
};

type ShellStore = {
  entries: Map<ShellPaneTarget, PaneEntry>;
  listeners: Set<() => void>;
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
  for (const listener of store.listeners) listener();
};

/* ── Style plumbing ─────────────────────────────────────────────────────────────────────── */

/** React.CSSProperties has no index for custom properties; the width prop writes one. */
type VarStyle = React.CSSProperties & Record<`--${string}`, string>;

const cx = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" ");

/** The surface identity every pane wears — Card's stamps, fixed rather than chosen (§10,
    §26: a pane is a card among cards; seal, edge, look, material and depth all arrive from
    surfaces.css and this file's stylesheet paints nothing). */
function surfaceStamps(material: Material) {
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
   * §26 — are the panes touching? `flush` tiles them edge to edge, each seam one hairline;
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
  const [store] = React.useState<ShellStore>(() => ({ entries: new Map(), listeners: new Set() }));

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

  // The scrim closes every pane that is overlaying — pointer users' "put it back".
  const onScrimClick = React.useCallback(() => {
    for (const entry of store.entries.values()) {
      if (entry.overlayLive) entry.close();
    }
  }, [store]);

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
        {/* Root-owned and always mounted; CSS shows it exactly when a pane overlays (the
            same condition the pane's own JS computes — law-checked agreement). Hidden from
            AT: the pane's inert handling is what takes the page out of the tree. */}
        <div className="kui-shell-scrim" aria-hidden onClick={onScrimClick} />
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
  const { store, rootRef } = useShellCtx(`Shell${name[0]!.toUpperCase()}${name.slice(1)}`);
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

  React.useEffect(() => {
    const entry: PaneEntry = { id, expanded, overlayLive, toggle, open: openPane, close: closePane };
    store.entries.set(name, entry);
    notifyStore(store);
    return () => {
      if (store.entries.get(name) === entry) {
        store.entries.delete(name);
        notifyStore(store);
      }
    };
  }, [store, name, id, expanded, overlayLive, toggle, openPane, closePane]);

  // The overlay obligations (§26): while a pane floats over the page, Escape puts it back,
  // the rest of the shell leaves the tab order and the accessibility tree (`inert` — the
  // scrim already blocks the pointer), and focus moves into the pane and returns on close.
  // Post-mount by construction: an overlay can only be open through an explicit state, so
  // none of this runs at first paint and none of it is needed there.
  const paneRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    if (!overlayLive) return;
    const rootEl = rootRef.current;
    const paneEl = paneRef.current;
    if (!rootEl || !paneEl) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePane();
    };
    document.addEventListener("keydown", onKeyDown);

    // Where focus was is captured BEFORE anything goes inert: making the subtree that holds
    // the trigger inert blurs it, and a capture taken after would remember <body> — focus
    // would never return.
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Siblings only — the pane itself and the scrim stay live. Restoration is by snapshot,
    // which is exact for the ordinary one-overlay case and LIFO stacks; two overlays closed
    // out of order would restore a beat early (accepted: the scrim closes all of them).
    const others = [...rootEl.children].filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el !== paneEl && !el.classList.contains("kui-shell-scrim"),
    );
    const previousInert = others.map((el) => el.inert);
    for (const el of others) el.inert = true;

    if (!paneEl.contains(document.activeElement)) paneEl.focus({ preventScroll: true });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      others.forEach((el, i) => (el.inert = previousInert[i]!));
      const active = document.activeElement;
      if (before && before.isConnected && (paneEl.contains(active) || active === document.body)) {
        before.focus({ preventScroll: true });
      }
    };
  }, [overlayLive, rootRef, closePane]);

  return { id, state, presentation, paneRef };
}

type SidePaneProps = Omit<React.ComponentPropsWithoutRef<"nav">, "color"> &
  TogglePaneOwnProps & {
    /**
     * §26 — the system's first sanctioned raw length: a pane's width is the app's content
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
    nothing excludes anything, because nothing overlaps (§26 deleted v1's thin mode, the
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
    /** §26 — the bottom pane's block extent, the width prop's sentence turned 90°. */
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
 * The one crossing (§26): a button anywhere in the shell drives a pane by name, through the
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
