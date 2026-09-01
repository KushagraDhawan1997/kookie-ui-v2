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

import { composeRender, slot, useMergedRefs, type RenderElement } from "../../system/render.ts";
import { useWindowClass } from "../../system/window.ts";
import type { Size } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { ScrollArea, type ScrollAreaProps } from "../scroll-area/scroll-area.tsx";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { DEV } from "../../system/dev.ts";

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

    The material is SELECTIVE since 2026-08-17 (§10, merged from main 2026-08-20): a surface
    reads the theme's glass only where a backdrop is stated. **`flush` is what states it
    here** (2026-08-20), which closes the API question this comment used to carry open: a
    pane pulled off the frame has something behind it and a welded one does not, so the
    posture prop already answers the material's question and no second prop is owed. */
function usePaneDress(
  flush: boolean,
  backdrop: boolean | undefined,
  forwarded?: React.Ref<HTMLElement>,
) {
  // THE AUTHOR STATES THE BACKDROP; THE POSTURE NO LONGER INFERS IT (2026-08-29, Kushagra:
  // "all panels should support backdrop prop, we already have precedence for it"). This is
  // Card's line verbatim — the prop when it is stated, the ambient `<Box backdrop>` region
  // when it is not — and taking the precedent means taking it whole, inference included.
  //
  // What it replaces read `useMaterial(flush ? undefined : { backdrop: true })`: a non-flush
  // pane volunteered a backdrop on the argument that "something is behind it either way — the
  // content if it floats, the ground if it does not". The first half is true and the second
  // half was never true of a MATERIAL. A grounded pane sits on the app's ground, which is a
  // flat colour, and §10's selectivity is exactly the rule that a surface expresses glass only
  // where something PASSES behind it. Measured under `material="regular"` before the change: a
  // `flush={false}` content pane resolved a 49% white veil, `blur(4px) saturate(2.07)` and its
  // own lens map — the largest box in the app bending a flat fill, re-minted on every resize.
  //
  // DECISIONS §27 already carried the residue as a recorded open item ("a grounded pane still
  // resolves the theme's glass — the material is decided in JS from `flush` while floating is
  // derived in CSS"). A prop closes it rather than narrowing it: JS never has to guess what
  // CSS will derive, because nothing is derived any more. The inference cannot come back as a
  // default either — a prop whose default is computed from a different prop is the shape this
  // system refuses, and `flush` is now a statement about the FRAME and nothing else.
  //
  // Unset still follows the ambient region, which is what keeps full-window vibrancy reachable:
  // a macOS sidebar is flush against the window edge AND translucent over the wallpaper, and
  // passing a hard `false` here would be the library contradicting an enclosing
  // `<Box backdrop>` in writing. The work area is the ONE pane that does pass `false`, and
  // ShellContent carries the reason.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  const stamps = {
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    // The pane states only its OWN fact. Whether a non-flush pane floats or grounds is
    // derived in the stylesheet, because it depends on a sibling's prop and must be right at
    // first paint — the same reason `auto` is resolved in CSS rather than in JS (§27).
    ...(flush ? { "data-flush": "" } : {}),
    // Solid is the absence of a material, so it writes no attribute (§10).
    ...(material !== "solid" ? { "data-material": material } : {}),
  } as const;
  // THE LENS, added 2026-08-20 (audit): a pane that resolves glass was computing a bare
  // `blur() saturate() brightness()` chain while every other glass-capable surface in the
  // package prepends `url(#kui-lens-N)`. §10's own porting note says the near-clear ladder is
  // not self-sufficient — blur HIDES a backdrop and the lens RE-STATES it — so a shell pane
  // was the one glass in the library defended by blur alone. Same call as Card's — and since
  // 2026-08-23 that call is the material itself, so the rung and the two spellings that bend
  // by nothing are the ladder's question rather than each caller's. This file is why: it
  // shipped one arm short of its siblings for as long as assembling that was the caller's job.
  const ref = useLensRef<HTMLElement>(material, forwarded);
  return { material, stamps, ref };
}

/** Every pane's two questions, and they are independent (2026-08-29): where it sits in the
    FRAME, and whether anything passes BEHIND it. They were briefly wired together — LOG
    2026-08-29 — which is why each doc comment says what it does not decide.

    ONE FLAT TYPE, not `PanePostureProps & { backdrop }`. The intersection is the tidier
    spelling and it is measurably worse: `generate-api.ts` walks the AST depth-capped at 4, so
    one more level of indirection dropped `flush` off the rail's, the sidebar's and the
    inspector's published tables — silently, because the drift law compares the generator's
    output against the generator's output and agrees with itself. `ShellContent` states its
    refusal with `Omit` instead, which the generator handles explicitly and which keeps the
    `flush` sentence in one home. */
type PaneDressProps = {
  /**
   * Is this pane part of the app frame? `flush`, the default, tiles it against its neighbours
   * with one hairline at each seam. `flush={false}` pulls it off the frame, and what happens next
   * is derived rather than chosen: a pane floats if the content is underneath it, and the content
   * is underneath it only when the content is itself flush. Otherwise it grounds, and becomes its
   * own surface resting on the app's ground. One boolean reaches all four arrangements, and it
   * cannot be told a lie a three-value prop could, such as a floating sidebar beside a grounded
   * content card.
   *
   * It also decides the seams. A flush pane draws one hairline on its inner edge, and that edge
   * needs something on the other side of it: pull the content off the frame and every seam
   * facing it goes, because the card's own gap and edge already draw that boundary. A rail
   * beside a flush sidebar keeps its seam — both of those are still in the frame.
   *
   * It says nothing about the material. A pane over a canvas states `backdrop`, whatever its
   * posture — the two questions are independent and were briefly wired together (LOG 2026-08-29).
   */
  flush?: boolean;
  /**
   * Says whether something passes behind this pane: a canvas, a map, a photograph, the work
   * area itself when this pane floats over it. A pane in an ordinary frame sits on the app's
   * ground, where glass blurs a flat colour and still costs a full backdrop read on every
   * paint — and a pane is the largest box in the library, so it is the most expensive place to
   * pay for nothing. By default it renders solid whatever the theme's material is. Unset, it
   * follows the surrounding `<Box backdrop>` region, which is what makes a flush pane
   * translucent over a window-wide wallpaper. The material itself is still the theme's: this
   * prop cannot pick one.
   */
  backdrop?: boolean;
};

/* ── Size context: the panes answer `size`, and every ROW stamps it on its own element ─────
   Menu's shape exactly (§22): one provider on the pane, because a size-4 app must not hold
   size-2 navigation, and the stamp lands per element because the control size join keys
   `[data-size]` per element and its cells are `inherits: false` on purpose. Stating it on
   the pane rather than on each row is the same call Menu made — a column of navigation is
   one size of thing, and asking every row would be asking the call site to keep nine
   answers agreeing.

   ONE CONTEXT SERVES TWO HOPS (2026-08-21). The root provides the app's index, a pane that
   states none resolves to it, and every pane re-provides whatever it resolved to for its own
   rows. The literal below is therefore the default in exactly one place — the root's prop —
   rather than repeated per pane, which is what the builder's port hit: a size-1 editor had
   to say `size="1"` on the sidebar, the rail and the inspector separately, and would have
   discovered the day it added a row that a missed one was silently size 2. */

const ShellSizeContext = React.createContext<Size>("2");

/**
 * The index this pane is priced at: its own if it stated one, otherwise the app's.
 *
 * EVERY pane resolves it, not just the ones with navigation in them (2026-08-21). A pane's
 * size prices its PADDING now — the safe area every pane owes its content — as well as
 * whatever rows it holds, which is the relationship a Card has had all along. So the header,
 * the content pane and the bottom pane each need the index too, and four implementations
 * resolving it four times is how one of them ends up not resolving it at all.
 */
function usePaneSize(stated: Size | undefined): Size {
  const inherited = React.use(ShellSizeContext);
  return stated ?? inherited;
}

/* ── Root ───────────────────────────────────────────────────────────────────────────────── */

export type ShellProps = Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
  /**
   * The control index this app's navigation is drawn at. Every pane inherits it, and any pane can
   * overrule it. It is not the app's type size, and it is not any pane's width: a pane's extent
   * is a statement about your content and has no ladder, which is why `width` is a raw number and
   * this is an index.
   */
  size?: Size;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * The frame. A CSS grid whose areas the panes claim for themselves — no child scanning, no
 * arrangement logic, DOM order free for reading order. Height is the app's: the root fills
 * the parent it is given (`100%`), and an app-frame call site typically sits it in a
 * `100dvh` box. The root paints nothing — in floating mode the gaps show the app's own page,
 * the same relationship a card has to the page anywhere else.
 */
export function Shell({ size = "2", className, style, children, ref, ...props }: ShellProps) {
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

    // …and only then move focus in, ON THE OPENING EDGE AND NOWHERE ELSE.
    //
    // This pass runs on EVERY Shell render (see the note below on the missing dependency
    // array), and the first spelling asked one question per pass — "does live[0] hold focus?"
    // — which is a question about a moment written as if it were a question about a state.
    // While any pane overlaid, every ordinary re-render (a keystroke in a form, a hovered
    // item with state, a route transition) answered it `no` and hauled focus back into
    // live[0]. Two shapes it made unreachable, both ordinary: a SECOND live overlay could not
    // hold focus at all — the two-overlay pointer path §27 names — and any portalled layer
    // opened from inside a pane (a Menu, a Select, a Dialog) lands at body level, outside
    // every pane, so its own focus was taken away from it by the next render of anything.
    //
    // The edge is what the behaviour was always about: focus moves in when a pane BECOMES
    // live, and only when it is not already somewhere the user put it inside the live set.
    // `lastLive` already existed for the closing edge; this reads it for the opening one.
    const previous = lastLive.current;
    const els = live.map((e) => e.el!);
    lastLive.current = els;
    const opened = els.filter((el) => !previous.includes(el));
    const active = document.activeElement;
    if (opened.length > 0 && !els.some((el) => el.contains(active))) {
      opened[0]!.focus({ preventScroll: true });
    }
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

  /**
   * THE PUBLISHED SAFE AREA, CHECKED AGAINST THE REAL ONE (§27, 2026-08-29). Development only,
   * stripped from production builds.
   *
   * The four `--kui-shell-inset-*` lengths are the reach a floating pane leaves, and the
   * stylesheet computes them from the frame's own extents — the `--shell-sidebar-w` token plus
   * the gap either side, or one control row plus the pane's padding and borders. That is exact
   * for a pane taking what the frame gives it, and stale for a pane that overrode its `width`,
   * its `height` or its `size`: those live on the pane, `--kui-shell-w` is registered
   * `inherits: false` on purpose, and no sibling can read another element's inline style.
   *
   * Refusing the override by type was the first proposal and it does not survive: whether
   * anything underlaps a pane depends on `flush` on a DIFFERENT component, which no type can
   * see, so the refusal would have to cover every floating pane — including the many where
   * nothing reaches underneath and there is nothing to be stale about.
   *
   * So it MEASURES rather than inferring. Reading the props would be a proxy for the thing
   * that matters and would go quietly wrong the day a new way to change a pane's extent
   * exists; comparing the published length against where the panes actually are cannot. The
   * underlap itself is measured too — a pane is underlapped when the content's box reaches
   * past it — which is why a flush pane standing between a floating one and the content
   * (where the content does NOT reach, and the inset is correctly zero) raises nothing.
   */
  React.useEffect(() => {
    if (!DEV) return;
    const rootEl = rootRef.current;
    if (!rootEl) return;
    let warned = false;

    const check = () => {
      const content = rootEl.querySelector<HTMLElement>(":scope > .kui-shell-content");
      if (warned || !content || !content.checkVisibility?.()) return;
      const frame = rootEl.getBoundingClientRect();
      const box = content.getBoundingClientRect();
      const style = getComputedStyle(content);

      // Each side: the panes the content actually reaches past, the far edge among them, and
      // the outer spacing of the OUTERMOST one — two adjacent floating panes double their gap
      // at the boundary between them (§27's deferred split), so the frame-edge distance is
      // the only one that is the pane's own.
      const sides = [
        { name: "inline-start", sel: ".kui-shell-rail, .kui-shell-sidebar",
          under: (r: DOMRect) => r.right > box.left + 1,
          reach: (r: DOMRect) => r.right - box.left, edge: (r: DOMRect) => r.left - frame.left },
        { name: "inline-end", sel: ".kui-shell-inspector",
          under: (r: DOMRect) => r.left < box.right - 1,
          reach: (r: DOMRect) => box.right - r.left, edge: (r: DOMRect) => frame.right - r.right },
        { name: "block-start", sel: ".kui-shell-header",
          under: (r: DOMRect) => r.bottom > box.top + 1,
          reach: (r: DOMRect) => r.bottom - box.top, edge: (r: DOMRect) => r.top - frame.top },
        { name: "block-end", sel: ".kui-shell-bottom",
          under: (r: DOMRect) => r.top < box.bottom - 1,
          reach: (r: DOMRect) => box.bottom - r.top, edge: (r: DOMRect) => frame.bottom - r.bottom },
      ] as const;

      for (const side of sides) {
        const panes = [...rootEl.querySelectorAll<HTMLElement>(`:scope > :is(${side.sel})`)]
          .filter((el) => !el.hasAttribute("data-flush") && el.checkVisibility?.())
          // An OVERLAYING pane is lifted out of the frame's flow, so it leaves no reach
          // behind it — read as the position it computes rather than as the attribute it
          // carries, because `auto` resolves to an overlay on a narrow window and the
          // attribute still says `auto` there.
          .filter((el) => getComputedStyle(el).position !== "absolute")
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.width > 0 && r.height > 0 && side.under(r));
        // NOT `continue` when the list is empty, which is the direction that matters most: a
        // pane that has closed, overlaid or been hidden by the window leaves a reach of zero,
        // and a length still claiming 304px is exactly the staleness this guard is for.
        const real = panes.length
          ? Math.max(...panes.map(side.reach)) + Math.min(...panes.map(side.edge))
          : 0;
        const published = parseFloat(style.getPropertyValue(`--kui-shell-inset-${side.name}`));
        if (Math.abs(published - real) <= 1) continue;
        warned = true;
        console.warn(
          `[kookie-ui] --kui-shell-inset-${side.name} says ${Math.round(published)}px, but the ` +
            `floating pane the content reaches under ends ${Math.round(real)}px in. The ` +
            "published safe area is the frame's own extent, so a pane that overrides its " +
            "`width`, `height` or `size` makes it stale — a sibling cannot read another " +
            "pane's inline style. State the extent as `--shell-sidebar-w` (or the inspector " +
            "or bottom token) on the Shell instead, where the pane and the content read one " +
            "number.",
        );
        return;
      }
    };

    // Layout, not mount: the panes have to have been placed. A resize re-runs it because
    // every one of these lengths is a distance in a laid-out frame.
    const frame = requestAnimationFrame(check);
    const resize = new ResizeObserver(check);
    resize.observe(rootEl);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  });

  const setRoot = useMergedRefs(ref, rootRef);
  return (
    <ShellContext.Provider value={ctx}>
      <div
        {...props}
        ref={setRoot}
        className={cx("kui-shell", className)}
        style={style}
      >
        <ShellSizeContext.Provider value={size}>{children}</ShellSizeContext.Provider>
        {/* Root-owned and always mounted; CSS shows it exactly when a pane overlays, keyed on
            the same two attributes the JS mirror reads. Hidden from AT: the root's
            containment pass is what takes the rest of the shell out of the tree. */}
        <div className="kui-shell-scrim" aria-hidden onClick={closeOverlays} />
      </div>
    </ShellContext.Provider>
  );
}

/* ── The static panes: Header and Content ───────────────────────────────────────────────── */

export type ShellHeaderProps = Omit<React.ComponentPropsWithoutRef<"header">, "color"> &
  PaneDressProps & {
    /**
     * The index this header is drawn at: its padding, the height of its row, and anything it holds.
     * It defaults to the app's, like every pane.
     */
    size?: Size;
  };

/** Full-width by definition — the criterion, not an option: if it isn't wide, it's a header
    inside ShellContent. Renders a real `<header>` landmark.

    A HEADER STATES ITS HEIGHT (2026-08-21). Every pane pads now, and a header's box is one
    control row inside that padding — so a header priced at an index is exactly as tall as the
    rail at that index is wide, and the app frame's corner is square. Before this a header was
    as tall as whatever the app happened to drop in it: apps/docs held size-1 buttons and the
    whole frame came out 28px, with the controls against the top edge. */
export function ShellHeader({
  flush = true,
  backdrop,
  size: statedSize,
  className,
  children,
  ...props
}: ShellHeaderProps) {
  // Destructured out of the spread under another name as well as resolved: `size` is not an
  // attribute of `<header>`, so leaving it in `props` writes invalid HTML. `backdrop` is out
  // for the same reason.
  const size = usePaneSize(statedSize);
  const { material, stamps, ref } = usePaneDress(flush, backdrop);
  return (
    <header
      {...props}
      {...stamps}
      ref={ref}
      data-size={size}
      className={cx("kui-surface kui-shell-pane kui-shell-header", className)}
    >
      <GlassScope material={material}>
        <ShellSizeContext.Provider value={size}>{children}</ShellSizeContext.Provider>
      </GlassScope>
    </header>
  );
}

export type ShellContentProps = Omit<React.ComponentPropsWithoutRef<"main">, "color"> &
  // The refusal, stated in the type — see the component's own comment for why the work area is
  // the one pane that never gets glass.
  Omit<PaneDressProps, "backdrop"> & {
    /**
     * The index this pane is drawn at: its padding, and anything it holds. It defaults to the app's.
     */
    size?: Size;
  };

/** The work area — renders `<main>`, scrolls itself, takes whatever room the panes leave.
    It pads like every other pane; a picture or a canvas that wants the full box says
    `m="bleed"`, and a `ShellScroll` inside it reaches the edges on its own (§3, §10).

    IT TAKES NO `backdrop`, AND THAT IS THE ONE ASYMMETRY IN THE FAMILY (2026-08-29, Kushagra:
    "I dont think content should ever get glass, panels are fine"). Not a preference: the
    stylesheet derives floating as *a pane floats if the content is underneath it*, so the
    content is by construction the one pane nothing is ever underneath. Every panel can be over
    something and answers for itself; the work area is the bottom of the stack and has only the
    app's ground behind it, which is a flat colour. Glass there blurs nothing, costs a full
    backdrop read on the largest box on screen, and mints a lens map that is re-minted on every
    resize.

    The escape is the system's own sentence rather than a prop: a solid surface HOSTS glass
    (§10, 2026-08-19), so a `<Box backdrop>` or a `<Card backdrop>` composed INSIDE the content
    resolves the theme's material exactly as it does on a solid Card. A vibrant work area is a
    glass pane placed in the work area — not the work area pretending to be one. */
export function ShellContent({
  flush = true,
  size: statedSize,
  className,
  children,
  ...props
}: ShellContentProps) {
  const size = usePaneSize(statedSize);
  // The hard `false`, where every panel passes its prop through: this is the one pane that
  // contradicts an ambient region on purpose, because a region marked around the whole shell
  // is a claim about what is behind the FRAME and the work area is not in front of it.
  const { material, stamps, ref } = usePaneDress(flush, false);
  return (
    <main
      {...props}
      {...stamps}
      ref={ref}
      data-size={size}
      className={cx("kui-surface kui-shell-pane kui-shell-content", className)}
    >
      <GlassScope material={material}>
        <ShellSizeContext.Provider value={size}>{children}</ShellSizeContext.Provider>
      </GlassScope>
    </main>
  );
}

/* ── The togglable panes ────────────────────────────────────────────────────────────────── */

type PaneState = "auto" | "open" | "closed";

type TogglePaneOwnProps = {
  /**
   * Controlled open state, in the same pattern Dialog uses.
   *
   * Passing it conditionally is supported. `{...(preview ? { open: false } : {})}` pins the pane
   * closed while the flag is on, and hands control straight back when it goes. The uncontrolled
   * state is kept untouched throughout rather than overwritten, so the pane returns to exactly
   * the state the user last left it in.
   */
  open?: boolean;
  /**
   * The starting state when the pane is uncontrolled. Omit both this and `open` and the pane is
   * auto: the stylesheet decides its resting state from the window size, and the first toggle
   * makes the choice explicit.
   */
  defaultOpen?: boolean;
  /**
   * Fires on user-driven changes only: a trigger, Escape, a press on the scrim. It never fires at
   * mount, and never when the window crosses a size boundary, because auto is resolved in CSS and
   * CSS calls nobody.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * How this pane occupies the window while it is open.
   *
   * `auto` answers a question about the room, and it answers it in CSS from the window size, so
   * first paint is right with no script and nothing for hydration to mismatch.
   *
   * Stating a value instead answers a question about the product, and it does more than pin the
   * arrangement: `overlay` also makes the pane rest closed at every width, because an overlay is
   * something you summon rather than live in, where `auto` lets a nav column rest open on a roomy
   * window. So state a value for a pane whose behaviour is a decision, such as a drawer that must
   * never be ambient. Leave it auto for a pane whose behaviour follows from how much window there
   * is.
   */
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
  // Plain useEffect on both refs below, and the reason is local rather than a package rule:
  // nothing here needs PRE-PAINT timing. The registry stamps aria attributes post-mount BY
  // DESIGN, the same honesty as useWindowClass's null, so a layout effect would buy nothing
  // and cost the render path.
  // CHANGES
  // 2026-08-26 — was "this package ships no useLayoutEffect". False on both halves and
  //   read as a ban: segmented-control.tsx measures its travelling thumb in one, because a
  //   measurement that must land before paint is exactly what the hook is for. Stating the
  //   criterion instead, so the next measurement is not pushed onto useEffect + rAF — which
  //   buys a painted frame at the old position.
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
  TogglePaneOwnProps &
  PaneDressProps & {
    /**
     * The pane's width in CSS pixels, and the one place this system sanctions a raw length: a
     * pane's width is your content speaking, and no ladder could size it. It overrides the default
     * by writing the custom property the stylesheet reads, which is also where a future drag-resize
     * will write.
     */
    width?: number;
    /**
     * The control index this pane's own navigation is drawn at: its rows and its squares. It is not
     * the pane's width. A pane's extent is a statement about your content and has no ladder, which
     * is why `width` is a raw number and this is an index.
     */
    size?: Size;
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
    size: statedSize,
    flush = true,
    backdrop,
    id,
    className,
    style,
    children,
    ref,
    ...rest
  } = props;
  // The app's index unless this pane states its own — ONE context serves both hops, because
  // a pane re-provides whatever it resolved to and its rows read the same name (below).
  // Destructured out of `rest` under another name as well as resolved: `size` is not an
  // attribute of `<nav>` or `<aside>`, so leaving it in the spread writes invalid HTML.
  const size = usePaneSize(statedSize);
  const pane = usePane(name, { open, defaultOpen, onOpenChange, presentation: presentation ?? "auto", id });
  // The lens joins the ref chain rather than replacing it: the caller's ref and the registry's
  // both still land (the `render` escape's 2026-08-03 lesson — eight hand-rolled merges is how
  // one of them overwrites another).
  //
  // Memoised by the hook, and it is not hygiene — `useMergedRefs` (system/render.ts) states
  // what an unstable ref costs a lens-bearing pane.
  const composedRef = useMergedRefs(ref, pane.paneRef);
  const { material, stamps, ref: paneRef } = usePaneDress(flush, backdrop, composedRef);
  const Element = element;
  return (
    <Element
      {...rest}
      id={pane.id}
      ref={paneRef}
      className={cx("kui-surface kui-shell-pane", `kui-shell-${name}`, className)}
      {...stamps}
      // The pane wears the index as well as providing it: its own geometry reads it (the
      // rail derives its whole extent from `--control-height-N` at this index), and a
      // context alone reaches only React.
      data-size={size}
      data-state={pane.state}
      data-presentation={pane.presentation}
      // Focus lands here programmatically when the pane overlays — a mode, not a keyboard
      // affordance, the menu popup's sentence.
      tabIndex={-1}
      style={sidePaneStyle(width, style)}
    >
      <GlassScope material={material}>
        <ShellSizeContext.Provider value={size}>{children}</ShellSizeContext.Provider>
      </GlassScope>
    </Element>
  );
}

export type ShellRailProps = Omit<SidePaneProps, "width">;

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
  TogglePaneOwnProps &
  PaneDressProps & {
    /**
     * The bottom pane's height in CSS pixels. It is the `width` prop's sentence turned ninety
     * degrees.
     */
    height?: number;
    /**
     * The index this pane is drawn at: its padding, and anything it holds. It defaults to the app's.
     */
    size?: Size;
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
    size: statedSize,
    flush = true,
    backdrop,
    id,
    className,
    style,
    children,
    ref,
    ...rest
  } = props;
  // Out of the spread under another name as well as resolved — `size` is not an attribute
  // of `<aside>`.
  const size = usePaneSize(statedSize);
  const pane = usePane("bottom", {
    open,
    defaultOpen,
    onOpenChange,
    presentation: presentation ?? "auto",
    id,
  });
  // Memoised for the reason SidePane states in full: an unmemoised merge is a new DOM ref
  // callback per render, which tears the lens down and rebuilds its map.
  const composedRef = useMergedRefs(ref, pane.paneRef);
  const { material, stamps, ref: paneRef } = usePaneDress(flush, backdrop, composedRef);
  return (
    <aside
      {...rest}
      id={pane.id}
      ref={paneRef}
      className={cx("kui-surface kui-shell-pane kui-shell-bottom", className)}
      {...stamps}
      data-size={size}
      data-state={pane.state}
      data-presentation={pane.presentation}
      tabIndex={-1}
      style={
        height === undefined
          ? style
          : ({ "--kui-shell-h": `${height}px`, ...style } as VarStyle)
      }
    >
      <GlassScope material={material}>
        <ShellSizeContext.Provider value={size}>{children}</ShellSizeContext.Provider>
      </GlassScope>
    </aside>
  );
}

/* ── Trigger ────────────────────────────────────────────────────────────────────────────── */

/* ── The pane's scrolling region (§27) ─────────────────────────────────────────────────────
   ONE part, not three. The shell made its panes scroll, so the shell owes the answer — and
   the answer is to mark the single region that scrolls, after which everything else pins by
   being an ordinary-sized child of a column. A pinned header and a pinned footer are not
   parts; they are siblings.

   It is a PANE fact, not a sidebar fact: the inspector has the same pinned-tabs-over-a-
   scrolling-body shape (Figma's Design/Prototype) and so does the bottom pane (VS Code's tab
   strip), so one part serves all of them and the name says so.

   The evidence that it was missing was our own builder, which rebuilt the panel by hand with
   31 raw `style` escapes, five of them `minHeight: 0` — the flexbox incantation an inner
   scroller needs, which everybody gets wrong once and then copies forever. That is the whole
   of what this part deletes, and the builder was ported onto it (2026-08-20 for the panes,
   2026-09-02 for the chrome rows), so the sentence is history rather than a standing case. */

export type ShellScrollProps = ScrollAreaProps;

/**
 * The one region of a pane that scrolls. Put it in a pane beside anything that should stay
 * put; the pane becomes a column, this takes the leftover room, and the pane stops scrolling
 * itself. Custom scrollbars arrive with it because it IS a ScrollArea.
 *
 * A DIRECT child of the pane, deliberately: the stylesheet asks the pane whether it has one
 * (`:has(> …)`) and hands it the leftover room by flex, and neither question survives a
 * wrapper. Wrapping it is the same mistake as wrapping a pane, one level in.
 */
export function ShellScroll({ className, ...props }: ShellScrollProps) {
  return <ScrollArea {...props} className={cx("kui-shell-scroll", className)} />;
}

/* ── The pane's own chrome rows: header and footer, optionally FLOATING (§27, 2026-08-29) ──
   ADDITIVE. The pinned stack stays the default way to build a pane: anything before a
   ShellScroll pins above it and anything after pins below, no part names needed. These parts
   exist for the one arrangement the informal stack cannot express — the row FLOATING over the
   scroller, content passing behind it — because a floating row leaves flow and the content
   needs to know its reach, which is a height only a named part can STATE (one control row at
   the pane's index plus the pane's padding, ShellHeader's own derivation) rather than measure.

   The reach is published as `--kui-pane-inset-block-start` / `-block-end` on the pane — the
   frame's own safe-area pattern one level down (`--kui-shell-inset-*`): the app spends it
   where it wants it, a scroller's content pads by it and a photograph ignores it, and it
   falls to zero when nothing floats. In flow, the parts still earn their keep by stating the
   height: a header is one control row wherever it appears, which is what keeps a pane's
   chrome level with the rail beside it. */

export type ShellPaneHeaderProps = Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
  /**
   * Lift the row out of flow, over the pane's scroller: content passes behind it, and the
   * pane publishes `--kui-pane-inset-block-start` — one control row plus the pane's padding —
   * so what should clear the row can pad by it and what should run behind it can ignore it.
   * Pairs with ScrollArea's `fade`, which is what keeps the passing content legible.
   */
  float?: boolean;
};

/** A pane's own header row: one control row at the pane's index, pinned above the scroller —
    or floating over it with `float`, its reach published for the pane's content to spend. */
export function ShellPaneHeader({ className, float, ...props }: ShellPaneHeaderProps) {
  return (
    <div
      {...props}
      className={cx("kui-pane-header", className)}
      {...(float ? { "data-float": "" } : {})}
    />
  );
}

export type ShellPaneFooterProps = ShellPaneHeaderProps;

/** The same row at the pane's other end; with `float` it publishes `--kui-pane-inset-block-end`. */
export function ShellPaneFooter({ className, float, ...props }: ShellPaneFooterProps) {
  return (
    <div
      {...props}
      className={cx("kui-pane-footer", className)}
      {...(float ? { "data-float": "" } : {})}
    />
  );
}

/* ── Navigation: the sidebar's own vocabulary (§21, §27) ───────────────────────────────────
   OPTIONAL, and the shape has to say so. A sidebar's job is navigation often enough that the
   system owes it a row and a group, and NOT often enough to make them the only legal
   content: Womp puts a layers tree here, our own builder puts a component palette. So these
   are two small parts a pane may contain, never an anatomy it must have — a tree is a
   kookie-block, and what the pane owes it is a box with a real height, the right region
   scrolling, and `m="bleed"` for rows that want to reach the pane's edge. */

export type ShellRailItemProps = Omit<React.ComponentPropsWithoutRef<"button">, "color"> & {
  /** The region you are in. Announced as well as painted, exactly as a nav row's is. */
  current?: boolean;
  /** Be an anchor instead. A rail is primary navigation, and a link is a link. */
  render?: RenderElement;
  /**
   * Required, because the item is icon-only, and an icon with no name is a button nobody can read.
   * If the rail ever grows labels they go under the icon and stay a setting on the pane: one word
   * under one icon and not the next is how a column of icons stops lining up.
   */
  "aria-label": string;
  ref?: React.Ref<HTMLElement>;
};

/**
 * One square in the rail — a REGION, not a row (§27). The rail holds a few high-level
 * places and coexists with the sidebar rather than replacing it: the rail picks, the sidebar
 * shows what was picked, and a sidebar never collapses into one.
 *
 * `current` speaks the same two stamps the nav row does, for the same reason: hover is grey
 * and current is accent, which are different colours rather than two steps on one ramp, so
 * hovering the current square still moves. The edge bar every Microsoft app uses was
 * considered and left as the fallback for an item that cannot be tinted — a workspace
 * avatar, which is exactly why Discord uses one.
 */
export function ShellRailItem({
  current,
  render,
  className,
  children,
  ref,
  ...props
}: ShellRailItemProps) {
  const size = React.use(ShellSizeContext);
  const merged = {
    ...props,
    "data-size": size,
    ...(current
      ? { "aria-current": "page" as const, "data-tone": "accent", "data-emphasis": "medium" }
      : { "data-emphasis": "quiet" }),
    className: cx("kui-control kui-shell-rail-item", className),
    ref,
  };
  if (render) return composeRender(render, merged as never, children);
  return (
    <button {...(merged as React.ComponentPropsWithoutRef<"button">)} type="button">
      {children}
    </button>
  );
}

export type ShellRailListProps = Omit<React.ComponentPropsWithoutRef<"div">, "color">;

/**
 * A run of rail squares. Layout only — the rail owns the distance between its own items the
 * way a nav group owns the distance between its rows, and a rail typically has two of these:
 * the regions at the top, and the account and settings squares pinned at the bottom.
 *
 * Those two runs behave differently and the difference is deliberate: the bottom one holds
 * plain actions that open menus and are never "current", so nothing here makes membership
 * mean selection.
 */
export function ShellRailList({ className, ...props }: ShellRailListProps) {
  return <div {...props} className={cx("kui-shell-rail-list", className)} />;
}

export type ShellNavGroupProps = Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
  /** The group's heading. Omit it for an unlabelled cluster. */
  label?: React.ReactNode;
};

/**
 * A cluster of nav items under a heading. The part exists for the non-visual half (§10's
 * criterion): a heading rendered as a sibling is a heading nobody is told about, so the
 * group carries `role="group"` and points `aria-labelledby` at its own label. Rendering the
 * words is the easy part; connecting them is what forces the component.
 */
export function ShellNavGroup({ label, id, className, children, ...props }: ShellNavGroupProps) {
  const size = React.use(ShellSizeContext);
  const auto = React.useId();
  const labelId = label === undefined ? undefined : `${id ?? auto}-label`;
  return (
    <div
      {...props}
      id={id}
      role="group"
      aria-labelledby={labelId}
      className={cx("kui-shell-nav-group", className)}
    >
      {label === undefined ? null : (
        <div id={labelId} data-size={size} className="kui-control kui-row kui-shell-nav-label">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

export type ShellNavItemProps = Omit<React.ComponentPropsWithoutRef<"button">, "color"> & {
  /**
   * This is the page you are on. It is announced with `aria-current="page"` as well as painted,
   * because "you are here" is information and a colour alone tells nobody who cannot see it.
   */
  current?: boolean;
  /**
   * The row's icon. It rests in the label's neutral ink and takes the ACCENT only on the
   * current row (REVERSED 2026-08-26, Kushagra, judging Finder over the docs sidebar: "make
   * resting icons neutral not accent" — when every icon is accent, accent stops meaning
   * "you are here", and the current row has nothing to pop against). The 2026-08-23 rule
   * this replaces painted them accent always; recipes.css carries the reversal's record.
   */
  leading?: React.ReactNode;
  /** After the label, pushed to the far edge: a count, a chevron, a status dot. */
  trailing?: React.ReactNode;
  /** Be an anchor instead. A nav item usually navigates, and a link is a link. */
  render?: RenderElement;
  ref?: React.Ref<HTMLElement>;
};

/**
 * One row of navigation — the row family's SECOND member (§21), and the one that comes due
 * on its recorded debt.
 *
 * It stands level with a Button, which the menu row deliberately does not: a menu row steps
 * DOWN off the height ladder because it lives in a panel that opens for a second, is scanned
 * and dismissed, with no buttons anywhere near it. A sidebar row gets none of that reason —
 * it is there all day, it sits beside real buttons, and it is a target you hit constantly.
 * So the menu row is the exception and this one is simply unshifted; no new numbers exist.
 */
export function ShellNavItem({
  current,
  leading,
  trailing,
  render,
  className,
  children,
  ref,
  ...props
}: ShellNavItemProps) {
  const size = React.use(ShellSizeContext);
  const merged = {
    ...props,
    "data-size": size,
    // ACCENT IS STAMPED ALWAYS (2026-08-23; still right after the 2026-08-26 icon reversal).
    // The family is what the CURRENT row's icon and label read, and current is decided per
    // render — a conditional stamp would work today, but the unconditional one is what lets
    // the [aria-current] arms resolve the family without a second condition to keep in step.
    //
    // What made it safe is `undilutedTones`: accent's washed roles resolve NEUTRAL, so a
    // stamped row's fill is grey at every rung and only the roles that survive dilution — the
    // glyph and the ink — arrive in colour. Before that change this stamp would have painted
    // every nav row a pale blue. The LABEL is stood back down in shell.css unless the row is
    // current, and since 2026-08-26 the resting ICON simply inherits that stood-down ink
    // (recipes.css — the family arrives only with [aria-current]).
    //
    // Emphasis stays the pair it was: quiet rests transparent and hovers to soft, medium rests
    // at soft and hovers to soft-hover, so the current row still has somewhere to go under the
    // pointer. It is a stamp and not an axis (§21 refuses emphasis on rows — a list of peers
    // ranks nothing; a component stamping its own rung is Card's precedent).
    "data-tone": "accent",
    ...(current
      ? { "aria-current": "page" as const, "data-emphasis": "medium" }
      : { "data-emphasis": "quiet" }),
    // The pointer is this row's only cursor — a sidebar has no roving highlight — so it opts
    // into the family's hover rule (§21, promoted 2026-08-23 with Row). This stamp replaces
    // the private `:hover` rule shell.css carried from the day it shipped.
    "data-hover-lit": "",
    className: cx("kui-control kui-row kui-shell-nav-item", className),
    ref,
  };
  const content = (
    <>
      {slot(leading, "leading")}
      {children}
      {slot(trailing, "trailing")}
    </>
  );
  // `type="button"` only on the button this file renders — a render target keeps its own
  // element semantics (the Button-as-anchor lesson, 2026-08-03).
  if (render) return composeRender(render, merged as never, content);
  return (
    <button {...(merged as React.ComponentPropsWithoutRef<"button">)} type="button">
      {content}
    </button>
  );
}

export type ShellTriggerProps = Omit<React.ComponentPropsWithoutRef<"button">, "color"> & {
  /** Which pane this button drives. */
  target: ShellPaneTarget;
  /**
   * What the press does to `target`. `toggle` is the disclosure button every shell has, and it is
   * the default.
   *
   * The one-way values are for a press that already means something else and must not undo itself.
   * A rail square that re-points the sidebar has to show the sidebar, so it is `open`: as a toggle,
   * pressing a second region would close the panel it had just filled, and picking a region the
   * sidebar is not showing would do nothing visible at all. A dismiss button inside an overlaying
   * pane is `close` for the mirror reason.
   */
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
