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
 * SHIPPED 2026-09-01: drag-to-resize, into exactly the room the one-variable width design
 * left for it — the drag writes the same custom property the `width` prop writes, so
 * nothing about that shape was revisited and `minWidth`/`maxWidth` arrive with it, as §27
 * said they would.
 *
 * Deferred, not refused (§27): peek, the `stacked` presentation, the mixed flush/floating
 * posture.
 */
import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import { composeRender, slot, useMergedRefs, type RenderElement } from "../../system/render.ts";
import { useWindowClass } from "../../system/window.ts";
import { PageScope } from "../../system/page.tsx";
import { onPageScrollMediaChange, pageScrollQuery, usePageScrollMedia } from "../../system/page-scroll.ts";
import type { Size } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { ScrollArea, type ScrollAreaProps } from "../scroll-area/scroll-area.tsx";
import { GlassScope, useMaterial, themeDefaults, type SurfaceMaterial } from "../../theme/theme.tsx";
import { DEV } from "../../system/dev.ts";
import { shellResize } from "../../tokens/config.ts";
import { SizeScopeContext, useSize } from "../../system/size.ts";

/** The room the ceiling reserves so a dragged-open pane never carries its own handle off
    the frame. Stated here rather than read off the token, because the clamp runs during a
    gesture and `getComputedStyle` at interaction time is exactly what the doctrine bans. */
const TOUCH_TARGET_FALLBACK = "44";

/* ── The registry: the one thing that crosses the shell ─────────────────────────────────── */

export type ShellPaneTarget = "rail" | "sidebar" | "inspector" | "bottom";

/** How a pane presents when open: in flow (`fixed`), floating over content behind a scrim
    (`overlay`), or the system's resolution (`auto`: fixed on roomy windows, overlay on
    narrow ones — resolved in CSS through §18's boundary, so first paint needs no script). */
export type ShellPresentation = "auto" | "fixed" | "overlay" | "bar";

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
  /** Whether this Shell fills its parent rather than being the window. */
  contained: boolean;
};

/** Set by ShellContent: a ShellScroll here is the work area's, the one region the page takes over
    on a phone. */
const WorkAreaContext = React.createContext(false);


const ShellContext = React.createContext<ShellCtx | null>(null);

function useShellCtx(part: string): ShellCtx {
  const ctx = React.use(ShellContext);
  if (!ctx) throw new Error(`<${part}> must be used within <Shell>`);
  return ctx;
}

/* Every Shell that has a drawer open holds the page; the attribute stays while any of them does. */
let pageLockHolders = 0;
function updatePageLock(delta: 1 | -1) {
  pageLockHolders = Math.max(0, pageLockHolders + delta);
  const doc = document.documentElement;
  if (pageLockHolders > 0) doc.setAttribute("data-kui-shell-lock", "");
  else doc.removeAttribute("data-kui-shell-lock");
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

    The material is SELECTIVE since 2026-08-17 (§10): a surface reads the theme's glass only
    where a backdrop is stated. Two things state it here — the app, through `backdrop`
    (2026-08-29), and the SHELL, for a pane that is overlaying (2026-09-05), on the rule every
    covering panel in the package already follows. This comment said "`flush` is what states
    it" until 2026-08-29 and the sentence is kept dead in the body below, because the reason
    that inference failed is the reason this one holds. */
function usePaneDress(
  flush: boolean,
  backdrop: boolean | undefined,
  forwarded?: React.Ref<HTMLElement>,
  overlaying = false,
) {
  // A DRAWER TAKES THE MATERIAL BY CONSTRUCTION, AND THE CALL SITE IS NOT ASKED (2026-09-05,
  // Kushagra: "like dialog or menu are always glass bc theyre above"). Every covering panel in
  // this package hardcodes `useMaterial({ backdrop: true })` — Menu, Select, Popover, Dialog,
  // AlertDialog — because a panel over the page HAS the page behind it, which is §10's
  // selectivity satisfied structurally rather than by a claim. An overlaying pane is that
  // shape and it has the scrim too, which is Dialog's arrangement exactly (scrim at z 1, pane
  // at z 2), so it resolves the theme's glass whatever the app said.
  //
  // This is NOT the 2026-08-29 inference returning. That one computed a default for the
  // ORDINARY posture out of `flush`, a sibling-dependent fact JS cannot know at first paint;
  // this is the popup rule, keyed on a fact about THIS pane, and it is not a default the app
  // can talk out of — you cannot ask for a solid menu either. `backdrop` still governs every
  // pane that is not overlaying, which is every pane most of the time.
  //
  // The one flash it costs, stated rather than hidden: `presentation="auto"` resolves against
  // `useWindowClass()`, which is honestly null on the server, so a `defaultOpen` drawer on a
  // narrow window paints solid for one frame and corrects. It cannot be closed from here (the
  // window has no size until the client has it) and it is the configuration nobody builds — a
  // drawer is summoned, and an `auto` nav column rests CLOSED at narrow by the resolution two
  // hundred lines down. Every other route in is a press, which is post-mount by construction.
  //
  // Only the four togglable panes pass this. The header is never an overlay and the work area
  // is the pane nothing is ever underneath (ShellContent carries that argument).
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
  const material = useMaterial(
    overlaying ? { backdrop: true } : backdrop === undefined ? undefined : { backdrop },
  );
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
   *
   * It does not reach a pane that is OVERLAYING. A drawer sits over the page with a scrim
   * under it, which is Dialog's arrangement, and every covering panel in this package takes
   * the theme's material without being asked — so this prop answers for the pane in the frame
   * and the shell answers for the drawer. You cannot ask for a solid drawer, in the same sense
   * that you cannot ask for a solid menu.
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

/* `themeDefaults.size`, never a literal: this default is only reachable in an invalid tree
   (a part outside its root), and nine private copies of the number 2 is nine claims about a
   rest that the app can now move (2026-09-05). */
const ShellSizeContext = React.createContext<Size>(themeDefaults.size);

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

export type ShellProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
  /**
   * The control index this app's navigation is drawn at. Every pane inherits it, and any pane can
   * overrule it. It is not the app's type size, and it is not any pane's width: a pane's extent
   * is a statement about your content and has no ladder, which is why `width` is a raw number and
   * this is an index.
   */
  size?: Size;
  /**
   * Put the Shell inside something else instead of making it the window.
   *
   * By default a Shell is the app: it takes the window's height, and on a narrow touch screen the
   * page itself scrolls, so the browser can shrink its toolbars. A contained Shell fills its
   * parent and always scrolls inside itself, on every device. Use it for a Shell in a card, a
   * demo, or a canvas that must keep its own scroll.
   */
  contained?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * The frame. A CSS grid whose areas the panes claim for themselves — no child scanning, no
 * arrangement logic, DOM order free for reading order. By default it is the window: the
 * window's height, and on a narrow touch screen the page scrolls rather than the content pane
 * (§27, 2026-09-11). `contained` makes it fill its parent instead. The root paints nothing — in
 * floating mode the gaps show the app's own page, the same relationship a card has to the page
 * anywhere else.
 */
export function Shell({ size: sizeProp, contained, className, style, children, ref, ...props }: ShellProps) {
  const size = useSize(sizeProp);
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
      contained: contained === true,
    }),
    [store, contained],
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
  /** Whether this Shell is one of the holders of the page lock. */
  const holdsLock = React.useRef(false);
  React.useEffect(
    () => () => {
      if (holdsLock.current) {
        holdsLock.current = false;
        updatePageLock(-1);
      }
    },
    [],
  );

  // THE READING POSITION CROSSES WITH THE POSTURE (2026-09-11, audit). When a touch window crosses
  // the narrow boundary — a phone rotating, an iPad entering Split View — the scroller changes
  // from the content's viewport to the page, and the new one starts at the top. The offset is
  // carried across: remembered from whichever scroller is live, handed to the other once the new
  // layout exists. Remembered on `scroll` rather than read on the change, because by the time the
  // change is reported the old scroller has already been laid out in the new posture and clamped.
  React.useEffect(() => {
    if (contained) return;
    const rootEl = rootRef.current;
    if (!rootEl) return;
    const viewport = () =>
      rootEl.querySelector<HTMLElement>(":scope > .kui-shell-content > .kui-shell-scroll > .kui-scroll-viewport");
    let offset = 0;
    // Only the LIVE scroller is listened to. The one being left reports its own clamp to zero as
    // a scroll — measured arriving after the new scroller had already been handed the offset —
    // and would otherwise overwrite what was carried.
    let pageScrolls = window.matchMedia(pageScrollQuery).matches;
    const fromPage = () => {
      if (pageScrolls) offset = window.scrollY;
    };
    const fromViewport = (event: Event) => {
      if (!pageScrolls && event.target === viewport()) offset = (event.target as HTMLElement).scrollTop;
    };
    window.addEventListener("scroll", fromPage, { passive: true });
    rootEl.addEventListener("scroll", fromViewport, { passive: true, capture: true });
    const stop = onPageScrollMediaChange((matches) => {
      pageScrolls = matches;
      const carried = offset;
      requestAnimationFrame(() => {
        if (matches) window.scrollTo(0, carried);
        else {
          const el = viewport();
          if (el) el.scrollTop = carried;
        }
      });
    });
    return () => {
      window.removeEventListener("scroll", fromPage);
      rootEl.removeEventListener("scroll", fromViewport, { capture: true });
      stop();
    };
  }, [contained]);

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

    // THE PAGE HOLDS STILL UNDER A DRAWER (2026-09-11). A window Shell on a phone scrolls the
    // document, so a finger dragged across the scrim would scroll the page behind it. Held by an
    // ATTRIBUTE the stylesheet reads, counted across every Shell on the page — never by saving and
    // restoring the document's inline `overflow`, which Base UI's own scroll lock writes too: the
    // two saved each other's values and left a phone page unscrollable until reload (audit
    // 2026-09-11).
    const wantsLock = !contained && live.length > 0;
    if (wantsLock !== holdsLock.current) {
      holdsLock.current = wantsLock;
      updatePageLock(wantsLock ? 1 : -1);
    }

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
        // The tab bar publishes a block-end reach of its own (the bar rules), and it is not one of
        // the panes this side compares against, so a Shell with a bar would always disagree here.
        if (
          side.name === "block-end" &&
          rootEl.querySelector<HTMLElement>(':scope > .kui-shell-rail[data-presentation="bar"]')?.checkVisibility?.()
        ) {
          continue;
        }
        const panes = [...rootEl.querySelectorAll<HTMLElement>(`:scope > :is(${side.sel})`)]
          /* `checkVisibilityCSS` since 2026-09-06: a parked drawer is `visibility: hidden`
             rather than `display: none`, and the default options answer TRUE for that — so
             the guard would have measured a pane that is not on screen. */
          .filter((el) => !el.hasAttribute("data-flush") && el.checkVisibility?.({ checkVisibilityCSS: true }))
          // An OVERLAYING pane is lifted out of the frame's flow, so it leaves no reach
          // behind it — read as the position it computes rather than as the attribute it
          // carries, because `auto` resolves to an overlay on a narrow window and the
          // attribute still says `auto` there.
          // `fixed` as well since 2026-09-11: on a phone a window Shell attaches its drawers and
          // its tab bar to the screen, and those leave no reach either.
          .filter((el) => !/^(absolute|fixed)$/.test(getComputedStyle(el).position))
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
        {...(contained ? { "data-contained": "" } : {})}
        style={style}
      >
        <ShellSizeContext.Provider value={size}>
          {/* Reset, so a Shell composed inside another Shell's work area starts outside it. */}
          <WorkAreaContext.Provider value={false}>{children}</WorkAreaContext.Provider>
        </ShellSizeContext.Provider>
        {/* Root-owned and always mounted; CSS shows it exactly when a pane overlays, keyed on
            the same two attributes the JS mirror reads. Hidden from AT: the root's
            containment pass is what takes the rest of the shell out of the tree. */}
        <div className="kui-shell-scrim" aria-hidden onClick={closeOverlays} />
      </div>
    </ShellContext.Provider>
  );
}

/* ── The static panes: Header and Content ───────────────────────────────────────────────── */

export type ShellHeaderProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"header">, "color"> &
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

export type ShellContentProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"main">, "color"> &
  // The refusal, stated in the type — see the component's own comment for why the work area is
  // the one pane that never gets glass.
  Omit<PaneDressProps, "backdrop"> & {
    /**
     * The index this pane is drawn at: its padding, and anything it holds. It defaults to the app's.
     */
    size?: Size;
  };

/** The work area — renders `<main>`, takes whatever room the panes leave, and scrolls inside
    the frame — except in a window Shell on a phone, where the page itself scrolls (2026-09-11).
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
        <ShellSizeContext.Provider value={size}>
          {/* THE PANE IS THE PAGE'S SCOPE (§45, §46). A page's large title lives inside this
              pane's scroller and the band that says it again is a SIBLING of that scroller, so
              the store that carries the title between them has to sit at their common ancestor
              — which is this. It is deliberately per-PANE and not per-Shell: two panes may each
              hold a titled page, and one store above both would let the second overwrite the
              first. `ShellHeader` renders none, which is what keeps the full-width row out of
              the arrangement by construction — a `ToolbarTitle` there can find no page and so
              always speaks for itself. */}
          <WorkAreaContext.Provider value={true}>
            <PageScope>{children}</PageScope>
          </WorkAreaContext.Provider>
        </ShellSizeContext.Provider>
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

  // Is this pane PRESENTED as an overlay — the stylesheet's own question, asked in JS for the
  // one thing the stylesheet cannot answer: the material (2026-09-05). Deliberately not
  // `overlayLive`: what a pane is made of follows its placement, never whether it happens to
  // be open, and a closed drawer costs nothing to dress (it is `display: none`, so the lens
  // measures 0x0 and mints no map — refraction.tsx's `< 8` floor — and re-measures through
  // its ResizeObserver the moment it is shown).
  const overlaying =
    presentation === "overlay" || (presentation === "auto" && windowClass === "narrow");

  const overlayLive = expanded === true && overlaying;

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

  return { id, state, presentation, overlaying, paneRef: setPaneEl, rootRef };
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
    /**
     * Lets a person move this pane's edge. Draws a boundary the pointer can drag and the
     * keyboard can step — `role="separator"` with a value, which is the platform's own window
     * splitter and the reason this is not a bare div with a mousedown on it.
     *
     * The rail cannot take it: a rail's extent is its item's box plus the air around it (§27),
     * so there is nothing free to drag.
     */
    resizable?: boolean;
    /** The floor, in CSS pixels. Defaults to the system's, because a resize with no floor is a
        way to destroy a layout by accident and not be able to get back. */
    minWidth?: number;
    /** The ceiling, in CSS pixels. Unset, the only limit is the frame. */
    maxWidth?: number;
    /**
     * Called once when the gesture ENDS, with the pane's new extent — not on every frame,
     * because the app's job is to remember the number rather than to watch it move.
     *
     * **The memory is yours**, exactly as a Notice's dismissal is. During the drag the DOM
     * leads; afterwards you are told. A pane given `width` is CONTROLLED, so a render after the
     * gesture leaves the dragged width in place. Store what this hands you if you want it to
     * survive a reload; change `width` when you want to move the pane yourself.
     */
    onResize?: (width: number) => void;
    /** The handle's accessible name. English by default because the package ships no
        translation layer; state your own and it is stated once, here. */
    resizeLabel?: string;
    ref?: React.Ref<HTMLElement>;
  };


/** The frame's own name for each resizable pane's extent — the token the reach rules read, and
    the one §27 already names as the app's escape when it wants another width. The rail is
    absent because it does not resize; `header` and `content` because they have no extent of
    their own to move. */
const paneToken: Partial<Record<ShellPaneTarget, string>> = {
  sidebar: "--shell-sidebar-w",
  inspector: "--shell-inspector-w",
  bottom: "--shell-bottom-h",
};

/* ── Resize (§27, 2026-09-01): the pane's extent, moved by hand ─────────────────────────── */

/**
 * A DRAG IS THE FIFTH BOUNDED EXCEPTION TO "no JS at interaction time", and it is a different
 * KIND of exception from the four before it.
 *
 * The flight's measurement, the lens, Tabs' indicator and the segmented thumb are all
 * measure-once-at-a-seam: they read geometry when something has finished happening. This one
 * runs while a finger is moving, which no seam can defer. The non-negotiable's purpose is that
 * STATE styling costs no frames — hover, press and focus are data-attributes and CSS — and a
 * resize is not a state: the gesture IS the value, and there is no CSS that can express "this
 * boundary is where the pointer is". Every system with resizable panes runs script here.
 *
 * So it is bounded instead, four ways, and the second is stated as what is MEASURED rather
 * than as what reads well (corrected by the audit 2026-09-02). Nothing runs unless a pointer
 * is down on the handle. The move writes ONE custom property directly on the pane element and
 * sets no React state, so there is no re-render PER FRAME and the lens never re-mints its map
 * (2026-08-22's finding, where an animating pane minted 27 filters) — there are exactly two
 * re-renders per gesture, at its two ends, from the `dragging` flag the stylesheet reads; the
 * first spelling of this paragraph said "no React state" while the hook plainly calls
 * `useState`, which is a comment describing an intention rather than a mechanism. The
 * listeners live on the handle via pointer capture, are pinned to the pointer that opened the
 * gesture, and leave with it. And `onResize` fires ONCE, at the end, because the app's job is
 * to remember the number rather than to watch it move.
 *
 * WHO OWNS THE WIDTH: the DOM leads during the drag and the app is told at the end. That is
 * `onDismiss`'s rule (§29) — the memory is the app's. What a person dragged then STANDS until
 * the app states a different `width`: an unrelated render does not discard it, and a CHANGE to
 * the prop is what moves the pane. This paragraph claimed a snap-back for a day; it was false
 * (React writes only the style keys whose value changed, and `setProperty` is invisible to
 * that diff), and making it true was tried and thrown away because discarding a drag on the
 * next unrelated render is hostile.
 */
function useResizeHandle(opts: {
  paneRef: React.RefObject<HTMLElement | null>;
  handleRef: React.RefObject<HTMLDivElement | null>;
  axis: "inline" | "block";
  /** Which physical edge the handle sits on in LTR. RTL flips it, read off the pane. */
  anchor: "start" | "end";
  min: number;
  max: number | undefined;
  onResize: ((extent: number) => void) | undefined;
  /** The extent the app is controlling, if it states one. */
  controlledExtent: number | undefined;
  /** The pane's id — what `aria-controls` announces, and the fallback resolution. */
  controls: string;
  /** The frame, where the moved extent is published for readers outside the pane. */
  rootRef: React.RefObject<HTMLDivElement | null> | undefined;
  /** Which pane's extent this is, so the write names the frame's own token for it. */
  paneName: ShellPaneTarget;
}) {
  const { paneRef, handleRef, axis, anchor, min, max, onResize, controlledExtent, controls } = opts;
  const { rootRef, paneName } = opts;
  const [dragging, setDragging] = React.useState(false);

  /** The pane this handle moves, when its ref has not landed yet. */
  const resolvePane = () =>
    controls ? (document.getElementById(controls) as HTMLElement | null) : null;

  const extentOf = (pane: HTMLElement) =>
    axis === "inline" ? pane.getBoundingClientRect().width : pane.getBoundingClientRect().height;

  /** The ceiling when the app states none: the frame less one target, so the boundary can
      always be grabbed back. Uncapped, a drag pushed the pane past the frame and carried the
      handle off-screen — the 2026-08-16 uncapped-overlay finding at the other end, which is
      the same audit `shellResize.min`'s own comment cites as the reason a floor exists. */
  const ceiling = (pane: HTMLElement) => {
    if (max !== undefined) return max;
    const frame = pane.parentElement?.getBoundingClientRect();
    const room = axis === "inline" ? frame?.width : frame?.height;
    return room ? Math.max(min, Math.round(room) - Number.parseFloat(TOUCH_TARGET_FALLBACK)) : undefined;
  };

  const write = (pane: HTMLElement, next: number) => {
    const cap = ceiling(pane);
    const clamped = Math.max(min, cap === undefined ? next : Math.min(cap, next));
    const settled = Math.round(clamped);
    // The pane names its own extent: a column reads `--kui-shell-w`, the bottom pane reads
    // `--kui-shell-h`. Writing the inline name unconditionally is why the block arm could
    // never have worked even once something rendered it.
    pane.style.setProperty(axis === "inline" ? "--kui-shell-w" : "--kui-shell-h", `${settled}px`);
    publishExtent(pane, axis, settled);
    // AND THE FRAME'S PUBLISHED REACH, WHICH IS A SECOND READER OUTSIDE THIS PANE (2026-09-05,
    // Kushagra: "these floating back and sidebar collapse button should be positioned from
    // left to the same width as sidebar, and yet resizing sidebar doesnt move them").
    //
    // `--kui-shell-inset-inline-start` is `calc(var(--shell-sidebar-w) + 2 * var(--shell-gap))`
    // — the TOKEN, because that is the frame's own extent for a pane that takes what the frame
    // gives it. A drag moves the pane and left the reach at 288 forever, so anything a floating
    // pane's content clears by the published number stayed put while the boundary it clears
    // walked away from it.
    //
    // §27 already carried this for the `width` PROP, with an escape written beside it: "an app
    // that wants another width states it as `--shell-sidebar-w` on the Shell, where the pane
    // and the content read one number", and a development guard that measures the two and
    // warns. A DRAG HAS NO SUCH ESCAPE — the app is not the one choosing the number — so the
    // mechanism performs its own documented escape instead of warning about itself.
    //
    // TWO WRITES FOR ONE NUMBER, deliberately, and it is not two homes for a decision: the
    // pane's own name has to keep winning over a stated `width` (an inline declaration on the
    // pane beats an inherited token, so a controlled pane would not move under the pointer),
    // and a SIBLING cannot read that name — it is registered `inherits: false` for the `--kui-h`
    // trap, and an inline style is unreadable from outside anyway. One value, published to the
    // two scopes CSS requires; both are set in this one function, from the same `settled`.
    const root = rootRef?.current;
    if (root && paneToken[paneName]) {
      root.style.setProperty(paneToken[paneName]!, `${settled}px`);
    }
    // THE ANNOUNCED VALUE IS WRITTEN HERE, not rendered (audit 2026-09-02). It was computed
    // during render from `paneRef.current`, which is null on the first commit — so a focusable
    // `role="separator"` shipped with a min and NO current value, and since the gesture sets no
    // React state, nothing ever re-rendered to add one. ARIA marks `aria-valuenow` required on
    // a focusable separator, and the keyboard is the only route this element exists for.
    handleRef.current?.setAttribute("aria-valuenow", String(settled));
    return settled;
  };

  // Seed the value once the pane has a box, and keep it true when the app moves the pane by
  // prop. A layout effect, so no frame ever paints with the attribute missing.
  // THE DRAG WINS UNTIL THE APP STATES A DIFFERENT NUMBER (audit 2026-09-02, and the prose
  // moved rather than the code). Three homes said "a render after the gesture re-asserts the
  // prop, so store what onResize hands you or the pane snaps back". That was false — React
  // writes only the style keys whose VALUE changed between renders, and the drag's
  // `setProperty` is invisible to that diff — and making it true turned out to be the wrong
  // repair: re-asserting on EVERY render discards a person's drag the next time the app
  // re-renders for any unrelated reason, which is hostile. So the honest contract is the one
  // the code already had, now written down: what a person dragged stands until the app states
  // a different `width`, and a CHANGE to that prop is what puts the pane where the app says.
  React.useLayoutEffect(() => {
    const pane = paneRef.current ?? resolvePane();
    if (!pane || controlledExtent === undefined) return;
    pane.style.setProperty(axis === "inline" ? "--kui-shell-w" : "--kui-shell-h", `${controlledExtent}px`);
    publishExtent(pane, axis, controlledExtent);
  }, [controlledExtent, axis, paneRef]);

  React.useLayoutEffect(() => {
    const handle = handleRef.current;
    // THE PANE IS RESOLVED BY THE ID THIS HANDLE ANNOUNCES, not by walking the DOM. React
    // attaches refs and runs layout effects in one bottom-up walk, so a CHILD's layout effect
    // runs before its parent's ref is attached — `paneRef.current` was null here on the first
    // commit, which is how the seeded value went missing after being fixed once. The fallback
    // used to be `handle.parentElement`, true only while the handle was inside the pane; since
    // 2026-09-05 it is the pane's SIBLING and that expression resolves the shell root, which
    // would seed the announced value with the frame's width. `aria-controls` already carries
    // the pane's id, so the fallback reads the thing the element itself points at.
    const pane = paneRef.current ?? resolvePane();
    if (!pane || !handle) return;
    handle.setAttribute("aria-valuenow", String(Math.round(extentOf(pane))));
    // The ceiling too, when the app stated none — it is the frame's, and it is only knowable
    // once the frame has a box, which is why it is published here rather than rendered.
    const cap = ceiling(pane);
    if (max === undefined && cap !== undefined) handle.setAttribute("aria-valuemax", String(cap));
  });

  /** +1 when moving the pointer along the axis GROWS the pane. Read off the pane's own
      resolved direction, because `dir` is a platform attribute this package never stamps and
      a start-anchored pane in Arabic sits on the other side of the window (§20's stale-stamp
      finding, by a different road). */
  const sign = (pane: HTMLElement) => {
    if (axis === "block") return anchor === "start" ? -1 : 1;
    const rtl = getComputedStyle(pane).direction === "rtl";
    const growsRight = anchor === "end" ? !rtl : rtl;
    return growsRight ? 1 : -1;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const pane = paneRef.current;
    if (!pane || event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    // ONE pointer owns the gesture. Neither listener filtered on the id, so a second finger
    // landing on the handle registered a second pair and the first lift ran both — `onResize`
    // fired twice, which is bound (d) failing, and the second capture leaked.
    const owner = event.pointerId;
    handle.setPointerCapture(owner);
    const start = axis === "inline" ? event.clientX : event.clientY;
    const startExtent = extentOf(pane);
    const direction = sign(pane);
    setDragging(true);

    const move = (e: PointerEvent) => {
      if (e.pointerId !== owner) return;
      const now = axis === "inline" ? e.clientX : e.clientY;
      write(pane, startExtent + (now - start) * direction);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== owner) return;
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      if (handle.hasPointerCapture(owner)) handle.releasePointerCapture(owner);
      setDragging(false);
      onResize?.(Math.round(extentOf(pane)));
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  };

  /** The WAI-ARIA window-splitter keyboard. A drag-only boundary is unreachable without a
      pointer, which is not a taste question — it is the same spec argument that made the tree's
      keyboard the package's rather than each app's (§33). */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const pane = paneRef.current;
    if (!pane) return;
    const grow = axis === "inline" ? "ArrowRight" : "ArrowDown";
    const shrink = axis === "inline" ? "ArrowLeft" : "ArrowUp";
    const here = extentOf(pane);
    let next: number | undefined;
    if (event.key === grow) next = here + shellResize.step * sign(pane);
    else if (event.key === shrink) next = here - shellResize.step * sign(pane);
    else if (event.key === "Home") next = min;
    else if (event.key === "End") next = ceiling(pane) ?? here;
    if (next === undefined) return;
    event.preventDefault();
    // The write happens FIRST and unconditionally. `onResize?.(write(...))` short-circuits the
    // WHOLE expression when there is no callback, so the pane never moved unless the app
    // happened to pass one — keyboard resize was dead on the default path (audit 2026-09-02).
    const applied = write(pane, next);
    onResize?.(applied);
  };

  return { dragging, onPointerDown, onKeyDown, extentOf };
}

/** The boundary itself. `role="separator"` with a value is the platform's own window splitter;
    it is focusable BECAUSE it is operable, which is the one case a separator takes a tab stop. */
function ResizeHandle(props: {
  paneRef: React.RefObject<HTMLElement | null>;
  /** Which pane this boundary belongs to. It is a stamp rather than a lookup: the handle is
      the pane's SIBLING since 2026-09-05, so the stylesheet places it in that pane's grid
      area and no `:has()` walk is needed to find out whose edge it is. */
  pane: ShellPaneTarget;
  axis: "inline" | "block";
  anchor: "start" | "end";
  min: number;
  max: number | undefined;
  onResize: ((extent: number) => void) | undefined;
  controlledExtent: number | undefined;
  label: string;
  controls: string;
  state: PaneState;
  presentation: ShellPresentation;
  rootRef: React.RefObject<HTMLDivElement | null> | undefined;
}) {
  const { paneRef, pane, axis, anchor, min, max, onResize, controlledExtent, label, controls } = props;
  const { state, presentation, rootRef } = props;
  const handleRef = React.useRef<HTMLDivElement | null>(null);
  const { dragging, onPointerDown, onKeyDown } = useResizeHandle({
    paneRef,
    handleRef,
    axis,
    anchor,
    min,
    max,
    onResize,
    controlledExtent,
    controls,
    rootRef,
    paneName: pane,
  });
  return (
    <div
      ref={handleRef}
      className="kui-shell-resize"
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-controls={controls}
      aria-orientation={axis === "inline" ? "vertical" : "horizontal"}
      aria-valuemin={min}
      /* THE RANGE IS ALWAYS CONSISTENT. Emitting `aria-valuemax` only when the app stated one
         left the default path advertising a minimum of 160 against ARIA's implicit maximum of
         100 — a range whose floor is above its ceiling. When the app states none, the frame is
         the ceiling and it is announced as such. `aria-valuenow` is written imperatively by
         `write()` and seeded in a layout effect; it is deliberately not rendered, because the
         gesture sets no React state and a rendered value would freeze at the first commit. */
      aria-valuemax={max ?? undefined}
      /* The pane's ScrollArea bleeds to the pane's edge by being its last non-floating child
         (surfaces.css `:nth-last-child(1 of :where(:not([data-float])))`). The handle is a real
         last child, so without this stamp adding `resizable` silently took the scroller's
         block-end bleed away — the recommended pane anatomy, broken by an unrelated prop. */
      data-pane={pane}
      /* THE PANE'S STATE, RESTATED ON THE BOUNDARY (2026-09-05). The hide rules used to read
         it by descent (`.kui-shell-pane[data-state="closed"] .kui-shell-resize`), which a
         sibling cannot satisfy. The alternative was a `:has()` walk per pane per condition —
         eight selectors to ask a question the pane has already answered in this render, so
         the answer is carried rather than re-derived. */
      data-state={state}
      data-presentation={presentation}
      data-axis={axis}
      data-anchor={anchor}
      data-tone="accent"
      {...(dragging ? { "data-dragging": "" } : {})}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    />
  );
}

/** THE ROOT LEARNS WHAT A SIDE PANE IS WEARING (2026-09-08). On a wide window a pane's width
    is a grid column and nothing needs the number; on a phone the frame is pushed by it, and a
    push is a length read on the ROOT, which cannot see the pane's own `--kui-shell-w` (registered
    not to inherit, the `--kui-h` trap). So every writer of that width — the drag, the controlled
    extent, the `width` prop — also publishes it one level up under the pane's own name. */
function publishExtent(pane: HTMLElement, axis: "inline" | "block", px: number) {
  const root = pane.closest<HTMLElement>(".kui-shell");
  if (axis === "block") {
    // The bottom pane pushes too (2026-09-11), so its height has to reach the root the same way.
    root?.style.setProperty("--kui-shell-bottom-h", `${px}px`);
    return;
  }
  const name = pane.classList.contains("kui-shell-inspector") ? "inspector" : "sidebar";
  root?.style.setProperty(`--kui-shell-${name}-w`, `${px}px`);
}

function sidePaneStyle(width: number | undefined, style: React.CSSProperties | undefined) {
  if (width === undefined) return style;
  return { "--kui-shell-w": `${width}px`, ...style } as VarStyle;
}

/** One implementation for the three side panes — rail, sidebar, inspector. */
/* A bare pane opens no material scope: it has no face of its own, so there is no backdrop to
   spend and no region to reset — the two panes inside it each resolve the glass themselves,
   including through an ambient `<Box backdrop>` that a `GlassScope` would have closed. */
function MaybeGlassScope({
  material,
  children,
}: {
  material: SurfaceMaterial | undefined;
  children: React.ReactNode;
}) {
  if (material === undefined) return children;
  return <GlassScope material={material}>{children}</GlassScope>;
}

function SidePane({
  name,
  element,
  props,
  /* A BARE PANE IS A ROW OF PANES (see `ShellBarContext`). It keeps every structural thing a
     pane is — the grid area, the state and presentation stamps, the index, the page scope —
     and gives up the three things a SURFACE is: the class the dress hangs on, the material
     stamp, and the scope that would resolve its children solid. There is nothing to stand
     down, which is the whole reason it is spelled this way: not wearing `.kui-surface` is one
     decision where standing its fill, light, cast, border, filter and ring back down would
     have been six rules each arguing with surfaces.css. The lens goes with them — a map built
     per resize for an element with no filter to put it in. */
  bare,
}: {
  name: ShellPaneTarget;
  element: "nav" | "aside";
  props: SidePaneProps;
  bare?: boolean;
}) {
  const {
    open,
    defaultOpen,
    onOpenChange,
    presentation,
    width,
    resizable,
    minWidth,
    maxWidth,
    onResize,
    resizeLabel = "Resize panel",
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
  // The handle measures the pane, so it needs a handle ON the pane — joined to the chain
  // rather than replacing anything, the `render` escape's 2026-08-03 lesson.
  const ownRef = React.useRef<HTMLElement | null>(null);
  const composedRef = useMergedRefs(ref, pane.paneRef, ownRef);
  // A SIDE PANE PUSHES, IT DOES NOT COVER (2026-09-08, Kushagra: "the content is pushed to
  // right, so sidebar always stays compliant with how desktop works"). Under the push the
  // frame slides aside and the pane is the desktop pane revealed, with the page behind it
  // exactly as on a wide window — so the covering-panel rule in `usePaneDress` does not
  // apply, and only `backdrop` (or an ambient region) states its material. The bottom pane
  // pushes too since 2026-09-11.
  const { material, stamps, ref: paneRef } = usePaneDress(flush, backdrop, composedRef, false);
  // The `width` prop's own publication (see `publishExtent`); a drag or a controlled change
  // overwrites it, which is the same order the pane's own inline width already resolves in.
  React.useLayoutEffect(() => {
    const el = ownRef.current;
    if (!el || width === undefined) return;
    publishExtent(el, "inline", width);
  }, [width]);
  const Element = element;
  const element_ = (
    <Element
      {...rest}
      id={pane.id}
      ref={bare ? composedRef : paneRef}
      className={cx(bare ? "kui-shell-pane" : "kui-surface kui-shell-pane", `kui-shell-${name}`, className)}
      {...(bare ? {} : stamps)}
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
      <MaybeGlassScope material={bare ? undefined : material}>
        <ShellSizeContext.Provider value={size}>
          {/* THE PANE IS THE PAGE'S SCOPE (§45, §46). A page's large title lives inside this
              pane's scroller and the band that says it again is a SIBLING of that scroller, so
              the store that carries the title between them has to sit at their common ancestor
              — which is this. It is deliberately per-PANE and not per-Shell: two panes may each
              hold a titled page, and one store above both would let the second overwrite the
              first. `ShellHeader` renders none, which is what keeps the full-width row out of
              the arrangement by construction — a `ToolbarTitle` there can find no page and so
              always speaks for itself. */}
          <PageScope>{children}</PageScope>
        </ShellSizeContext.Provider>
      </MaybeGlassScope>
    </Element>
  );
  /* THE HANDLE IS THE PANE'S SIBLING, NOT ITS CHILD (2026-09-05, Kushagra: "because of
     resize, I cant click on search icon").

     It lived inside the pane until now, and §27 had recorded the exit in writing on
     2026-09-02: "moving the handle out of the pane entirely would buy back the 44px sliver
     it now overlaps… the day a pane's content reaches its edge". That day arrived in the
     docs site's own sidebar, whose search button sits at the trailing wall. Measured: the
     button spanned x 239-271, the handle 243-287, and `elementFromPoint` at the button's
     CENTRE returned the handle — 28 of its 32 pixels were unreachable.

     Inside the pane it could not straddle, because a pane CLIPS (§3) and the outward half
     was clipped away — which is the 2026-09-02 audit's own finding, and why it was pulled
     fully inside in the first place. So the repair is not a wider box or a narrower one: it
     is the same box, one level out, where the seam actually is. Half the target now falls on
     the neighbour's side and half on the pane's, which is what a splitter is.

     A SIBLING RATHER THAN A ROOT-RENDERED HANDLE, and the difference is what it costs: the
     shell root would have to learn which panes resize and with what bounds, which is a
     registry read and therefore post-mount — §27's whole stance is that first paint is right
     with no script. Returning a fragment keeps the handle server-rendered and keeps every
     prop where the pane already has it, at the price of one `grid-area` stamp so the extra
     root child cannot be auto-placed into a cell of its own.

     `data-float` LEAVES with it. It existed only because the handle was the pane's last child
     and a ScrollArea's bleed rule reads `:nth-last-child(1 of :not([data-float]))` — so adding
     `resizable` used to take the scroller's block-end bleed away. A sibling is not a last
     child; the workaround dissolves rather than moving. */
  const handle =
    resizable && name !== "rail" ? (
      <ResizeHandle
        paneRef={ownRef}
        pane={name}
        axis="inline"
        /* The sidebar opens from the start edge, so its free boundary is the END one; the
           inspector is the mirror. RTL flips both, read off the pane rather than stamped. */
        anchor={name === "inspector" ? "start" : "end"}
        min={minWidth ?? shellResize.min}
        max={maxWidth}
        controlledExtent={width}
        onResize={onResize}
        label={resizeLabel}
        controls={pane.id}
        state={pane.state}
        presentation={pane.presentation}
        rootRef={pane.rootRef}
      />
    ) : null;
  return handle === null ? (
    element_
  ) : (
    <>
      {element_}
      {handle}
    </>
  );
}

/** How a rail meets a narrow window (§27, 2026-09-09). `auto` (the default): a rail on a wide
    window, a floating tab bar across the bottom on a narrow one — the rail's own items, carried
    across. `bar`: the tab bar only, nothing on a wide window (`ShellTabBar` is this by name).
    `rail`: never a bar — a rail on a wide window and a drawer on a narrow one, for a tool rail
    with more items than a bar can hold. `overlay`: always a drawer. */
export type ShellRailPresentation = "auto" | "bar" | "rail" | "overlay";

/* THE BAR IS A ROW OF PANES, NOT A PANE (§27, 2026-09-09, Kushagra: "the search in this case
   is a button trigger so it needs to be 'out' and a separate one which means its an
   anatomical change to tabbars composition no?" — iOS 26's Music app, a mini-player pill with
   a detached search circle beside it).

   It was one pane holding five equal seats, so a search TRIGGER read as a fifth place. What
   it is instead: the rail element is a bare row, `ShellRailList` is the pill of places, and a
   `ShellRailAction` beside it is its own pane at the pill's own box. That DELETES the
   `display: contents` on the list, which only ever existed because the list and the search
   seat were siblings splitting one box in half — the seats are the list's own flex children
   now, equal shares by construction.

   This context is what the two parts read to know they are the panes rather than layout, and
   it carries the `backdrop` the rail was asked for: the rail element no longer wears
   `.kui-surface`, so it can neither paint the glass nor scope its subtree solid, and each of
   the two panes resolves the material for itself. Two panes, two backdrops — which is what
   the reference shows, and what §10's selectivity says anyway (each of them has the page
   passing behind it).

   SCOPED TO THE BAR-ONLY POSTURE, and the boundary is structural rather than a shortcut.
   `presentation="bar"` is a bar at narrow and DISPLAY:NONE at wide, so JS knows what the
   element is and the dress can move to a child once and for all. `presentation="auto"` is a
   RAIL on a wide window, where the element IS the pane and the list is not — and which of
   the two dresses cannot be decided in JS, because the posture is resolved by a media query
   so that first paint needs no script (§27). So an `auto` rail keeps the single-pane bar it
   has, and a detached action there is an ordinary square. */
const ShellBarContext = React.createContext<{ backdrop: boolean | undefined } | null>(null);

export type ShellRailProps = ComponentRefusals & Omit<
  SidePaneProps,
  "width" | "resizable" | "minWidth" | "maxWidth" | "onResize" | "resizeLabel" | "presentation"
> & {
  /** How the rail meets a narrow window. `auto` (the default) is a rail on a wide window and a
      tab bar across the bottom on a narrow one, carrying the rail's own items across. `bar` is
      the tab bar only, and nothing on a wide window. `rail` is never a bar, for a tool rail with
      more items than a bar can hold. `overlay` is always a drawer. */
  presentation?: ShellRailPresentation;
};

/** The narrow icon column — the one that switches sections. Independent of the sidebar:
    nothing excludes anything, because nothing overlaps (§27 deleted v1's thin mode, the
    exclusivity rule and the close-cascade in one renaming). Renders `<nav>`; when two nav
    landmarks are present, give each an `aria-label`. */
/** THE BAR'S THUMB, placed by measurement (2026-09-09) — the segmented control's
    `useTravelingThumb`, self-keyed as its second member: it watches `aria-current` instead of
    `data-checked`, writes `--kui-bar-*`, and its seats are wherever the items sit (the list is
    `display: contents` in the bar). The same visual-scale division, for the same reason: a bar
    inside anything that scales as it opens would be measured mid-entry. */
function useBarThumb(rail: React.RefObject<HTMLElement | null>) {
  const previousLeft = React.useRef<number | null>(null);
  React.useLayoutEffect(() => {
    const el = rail.current;
    if (!el) return;
    // THE PILL, NOT THE BAR (2026-09-09). The rail element is a bare row of panes now, so
    // every box this measurement is about — the containing block the thumb's insets resolve
    // against, the wall its overshoot squashes into, the seats it lands on — belongs to the
    // LIST. Falls back to the rail for the postures where the list is layout and the rail is
    // still the pill (`presentation="auto"` at narrow; see `ShellBarContext`).
    const pill = el.querySelector<HTMLElement>(".kui-shell-rail-list") ?? el;
    const thumb = pill.querySelector<HTMLElement>(":scope > .kui-shell-rail-thumb");
    if (!thumb) return;
    const visualScale = (box: DOMRect, edges: CSSStyleDeclaration) => {
      const layout =
        edges.boxSizing === "border-box"
          ? parseFloat(edges.width)
          : parseFloat(edges.width) +
            parseFloat(edges.paddingLeft) +
            parseFloat(edges.paddingRight) +
            parseFloat(edges.borderLeftWidth) +
            parseFloat(edges.borderRightWidth);
      return layout > 0 ? box.width / layout : 1;
    };
    const place = (flying: boolean) => {
      const chosen = pill.querySelector<HTMLElement>(".kui-shell-rail-item[aria-current]");
      if (!chosen) {
        thumb.hidden = true;
        previousLeft.current = null;
        return;
      }
      const box = pill.getBoundingClientRect();
      const seat = chosen.getBoundingClientRect();
      const edges = getComputedStyle(pill);
      const scale = visualScale(box, edges);
      // ONE WIDTH, AND IT MAY OVEREXTEND (2026-09-09, Kushagra: "thumb should always take the
      // same width, but it can take a larger width than a simple grid calc will allow"). The
      // width is read from the WIDEST label in the bar, not from the current one, so the thumb
      // is the same size wherever it lands — a thumb that resized as it flew would be a second
      // motion nobody asked for. Being out of flow it can be wider than a seat's share without
      // moving anything, which is the whole reason the seats can stay equal; the walls in CSS
      // keep it inside the bar's padding at the two ends. `scrollWidth` is the untruncated
      // word, so an ellipsed label still contributes its real width.
      // THE AIR IS THE SEAT'S OWN PADDING PLUS THE CURVE (2026-09-09, Kushagra: "each selected
      // tab bar item should have some padding because its rounded… when rounded padding should
      // increase we know that and have precedent with buttons etc"). §4 pads a control wider at
      // `full` because its corner swings inward at the label's cap line, and here the thing
      // with the corner is the THUMB: the seat paints nothing, so spending the correction on the
      // seat's padding only ellipses the words (measured — every label on a 390px window).
      // `--kui-shell-row-up-curve` is the pill correction's DELTA rather than the whole pill
      // padding, for the reason its registration in shell.css states: this label is a fraction
      // of the smallest step, so the whole padding priced the air for a word three times its
      // size and the thumb reached into both neighbours' words. Zero below `full`, where the
      // thumb is exactly its seat.
      const seatStyle = getComputedStyle(chosen);
      const air =
        parseFloat(seatStyle.paddingLeft) +
        parseFloat(seatStyle.paddingRight) +
        2 * (parseFloat(seatStyle.getPropertyValue("--kui-shell-row-up-curve")) || 0);
      let widest = 0;
      for (const word of pill.querySelectorAll<HTMLElement>(".kui-shell-rail-label")) {
        widest = Math.max(widest, word.scrollWidth + air);
      }
      const width = Math.max(seat.width, widest);
      const centre = (seat.left + seat.right) / 2;
      const left = (centre - width / 2 - box.left) / scale - parseFloat(edges.borderLeftWidth);
      const right = (box.right - (centre + width / 2)) / scale - parseFloat(edges.borderRightWidth);
      const from = previousLeft.current;
      thumb.hidden = false;
      thumb.dataset.activationDirection =
        !flying || from === null || from === left ? "none" : left > from ? "right" : "left";
      thumb.style.setProperty("--kui-bar-left", `${left}px`);
      thumb.style.setProperty("--kui-bar-right", `${right}px`);
      previousLeft.current = left;
    };
    place(false);
    const selection = new MutationObserver(() => place(true));
    selection.observe(el, { subtree: true, attributes: true, attributeFilter: ["aria-current"] });
    const size = new ResizeObserver(() => place(false));
    size.observe(el);
    // AND THE PILL, because the bar's own box is pinned to the window (`inset-inline`) while
    // the pill's is what the seats share: a detached action changing width moves every seat
    // and the bar never resizes, so the grip would sit on a share that no longer exists.
    if (pill !== el) size.observe(pill);
    const watched = new WeakSet<Element>();
    const watchSeats = () => {
      for (const seat of el.querySelectorAll<HTMLElement>(".kui-shell-rail-item")) {
        if (watched.has(seat)) continue;
        watched.add(seat);
        size.observe(seat);
      }
    };
    watchSeats();
    const seats = new MutationObserver(watchSeats);
    seats.observe(el, { childList: true, subtree: true });
    return () => {
      selection.disconnect();
      size.disconnect();
      seats.disconnect();
    };
  }, [rail]);
}

/** The thin navigation column of squares, and the app's TOP level: on a narrow window it meets
    the viewport as a floating tab bar across the bottom, carrying its own items across (§27,
    2026-09-09). `presentation` says which of the three postures it takes; `ShellTabBar` is the
    bar-only one under a name a caller will look for. Renders `<nav>`; when two nav landmarks
    are present, give each an `aria-label`. */
export function ShellRail({ presentation = "auto", ...props }: ShellRailProps) {
  const railRef = React.useRef<HTMLElement | null>(null);
  useBarThumb(railRef);
  const ref = useMergedRefs(props.ref, railRef);
  // THE RAIL BECOMES THE BAR ON ITS OWN (2026-09-09, Kushagra: "rail becomes bar on its own…
  // if it has sidebar only, sidebar becomes tab, caller declares a list suitable for tabbar").
  // The pane is stamped `bar` for both postures that end in a bar, and `data-bar` says whether
  // a wide window shows a rail (`auto`) or nothing (`only`); `rail` is the pre-2026-09-09
  // behaviour, which the stylesheet still spells as `auto`. Resolved by the same media query
  // as the drawer, so first paint is right with no script.
  const mapped: ShellPresentation = presentation === "rail" ? "auto" : presentation === "overlay" ? "overlay" : "bar";
  const bar = presentation === "auto" ? "auto" : presentation === "bar" ? "only" : undefined;
  const stamps = (bar ? { "data-bar": bar } : {}) as Record<string, string>;
  // THE THUMB BELONGS TO THE LIST IT TRAVELS IN (2026-09-09). It was a direct child of the
  // rail while the rail was the pill; the pill is `ShellRailList` now, and the thumb's insets
  // resolve against its containing block, so the box it is placed against and the box it
  // resolves against have to be the same one — the segmented control's own sentence. So the
  // list renders it and this no longer does.
  const barOnly = presentation === "bar";
  const children = barOnly ? (
    <ShellBarContext.Provider value={{ backdrop: props.backdrop }}>{props.children}</ShellBarContext.Provider>
  ) : (
    props.children
  );
  return (
    <SidePane
      name="rail"
      element="nav"
      bare={barOnly}
      props={{ ...props, ...stamps, ref, children, presentation: mapped } as SidePaneProps}
    />
  );
}

export type ShellTabBarProps = Omit<ShellRailProps, "presentation">;

/** The tab bar for a Shell that has no rail: three to five places across the bottom of a
    narrow window, and nothing on a wide one — the sidebar carries the navigation there. A
    `ShellRailList` holds the tabs; one `ShellRailItem` after it is the detached seat (search).
    Optional: a Shell without one is still responsive, its sidebar is reachable as a drawer. */
export function ShellTabBar(props: ShellTabBarProps) {
  return <ShellRail {...props} presentation="bar" />;
}

export type ShellSidebarProps = ComponentRefusals & SidePaneProps;

/** The wide navigation column. Renders `<nav>`. */
export function ShellSidebar(props: ShellSidebarProps) {
  return <SidePane name="sidebar" element="nav" props={props} />;
}

export type ShellInspectorProps = ComponentRefusals & SidePaneProps;

/** The right-side detail column — rests closed until asked for (`auto` means closed here;
    pass `defaultOpen` for an inspector that starts open). Renders `<aside>`. */
export function ShellInspector(props: ShellInspectorProps) {
  return <SidePane name="inspector" element="aside" props={props} />;
}

export type ShellBottomProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"aside">, "color"> &
  TogglePaneOwnProps &
  PaneDressProps & {
    /**
     * The bottom pane's height in CSS pixels. It is the `width` prop's sentence turned ninety
     * degrees.
     */
    height?: number;
    /**
     * Lets a person move this pane's top edge. The side panes' `resizable`, turned ninety
     * degrees: the same separator, the same keyboard, the same floor.
     */
    resizable?: boolean;
    /** The floor, in CSS pixels. Defaults to the system's. */
    minHeight?: number;
    /** The ceiling, in CSS pixels. Unset, the frame is the ceiling and it is announced. */
    maxHeight?: number;
    /** Called once when the gesture ends, with the pane's new height. The memory is yours. */
    onResize?: (height: number) => void;
    /** The handle's accessible name. */
    resizeLabel?: string;
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
    resizable,
    minHeight,
    maxHeight,
    onResize,
    resizeLabel = "Resize panel",
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
  const ownRef = React.useRef<HTMLElement | null>(null);
  const composedRef = useMergedRefs(ref, pane.paneRef, ownRef);
  // IT PUSHES, IT DOES NOT COVER (2026-09-11, Kushagra: "Just like sidebar pushes content side,
  // shell bottom should also push content up, not appear like modal"). The side panes' sentence
  // turned ninety degrees: the frame moves up and this pane is the frame's bottom pane revealed,
  // so the covering-panel rule does not apply and only `backdrop` (or a region) states its
  // material.
  const { material, stamps, ref: paneRef } = usePaneDress(flush, backdrop, composedRef, false);
  // The `height` prop's own publication, the side panes' `width` one turned ninety degrees.
  React.useLayoutEffect(() => {
    const el = ownRef.current;
    if (!el || height === undefined) return;
    publishExtent(el, "block", height);
  }, [height]);
  const element_ = (
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
        <ShellSizeContext.Provider value={size}>
          {/* THE PANE IS THE PAGE'S SCOPE (§45, §46). A page's large title lives inside this
              pane's scroller and the band that says it again is a SIBLING of that scroller, so
              the store that carries the title between them has to sit at their common ancestor
              — which is this. It is deliberately per-PANE and not per-Shell: two panes may each
              hold a titled page, and one store above both would let the second overwrite the
              first. `ShellHeader` renders none, which is what keeps the full-width row out of
              the arrangement by construction — a `ToolbarTitle` there can find no page and so
              always speaks for itself. */}
          <PageScope>{children}</PageScope>
        </ShellSizeContext.Provider>
      </GlassScope>
    </aside>
  );
  /* A SIBLING, for SidePane's reasons in full — see the note there. The bottom pane's seam is
     horizontal, so what the move buys here is the pane's own top 44px, which is where a
     composer's toolbar or a console's tab strip sits. */
  const handle = resizable ? (
    <ResizeHandle
      paneRef={ownRef}
      pane="bottom"
      axis="block"
      /* The bottom pane opens upward, so its free boundary is the one at the top. */
      anchor="start"
      min={minHeight ?? shellResize.min}
      max={maxHeight}
      controlledExtent={height}
      onResize={onResize}
      label={resizeLabel}
      controls={pane.id}
      state={pane.state}
      presentation={pane.presentation}
      rootRef={pane.rootRef}
    />
  ) : null;
  return handle === null ? (
    element_
  ) : (
    <>
      {element_}
      {handle}
    </>
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

export type ShellScrollProps = ComponentRefusals & ScrollAreaProps;

/**
 * The one region of a pane that scrolls. Put it in a pane beside anything that should stay
 * put; the pane becomes a column, this takes the leftover room, and the pane stops scrolling
 * itself. Custom scrollbars arrive with it because it IS a ScrollArea.
 *
 * In the work area of a window Shell on a phone, the page does the scrolling instead, so the
 * browser can shrink its toolbars. What was pinned stays pinned, and content that cannot wrap
 * needs its own horizontal scroller.
 *
 * A DIRECT child of the pane, deliberately: the stylesheet asks the pane whether it has one
 * (`:has(> …)`) and hands it the leftover room by flex, and neither question survives a
 * wrapper. Wrapping it is the same mistake as wrapping a pane, one level in.
 */
export function ShellScroll({ className, focusable, ...props }: ShellScrollProps) {
  // NOT A TAB STOP WHILE THE PAGE SCROLLS (2026-09-11, audit). On a phone a window Shell hands the
  // work area's scrolling to the page, so this viewport scrolls nothing — and a focusable one is a
  // page-tall presentation box that takes a Tab, draws a ring round the whole page and moves
  // nothing. Resolved after mount (the answer is a media query); an explicit prop still wins.
  const shell = React.use(ShellContext);
  const workArea = React.use(WorkAreaContext);
  const pageScrolls = usePageScrollMedia();
  const inert = workArea && shell !== null && !shell.contained && pageScrolls;
  return (
    <ScrollArea
      {...props}
      focusable={focusable ?? !inert}
      className={cx("kui-shell-scroll", className)}
    />
  );
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

/**
 * A PANE'S CHROME TAKES THE PANE'S INDEX (2026-09-06, Kushagra: "why is search button in sidebar
 * still size 2").
 *
 * The pane already sizes its own parts — a nav row stands as tall as the rail beside it — but
 * that ran through `ShellSizeContext`, which only the shell's own vocabulary reads. Anything
 * ELSE placed in a band (a Button, a `Toolbar`, a search field) resolved the app's index
 * instead, so a size-3 sidebar opened with a size-2 button in its header and the two rows in
 * one frame disagreed.
 *
 * The fix is narrow ON PURPOSE, and the boundary is chrome against content. A band is the
 * PANE's — it is the frame talking — so what sits in it follows the pane, through the general
 * unit layer (`SizeScopeContext`, §28) rather than through a second private one. A pane's
 * SCROLLER is the app's, and nothing here reaches into it: a page's own controls are a
 * composition somebody built and must not be re-sized by the frame around them. Sizing the
 * whole pane was the obvious wider move and is exactly what that would have done — every demo
 * on a documentation page jumping to the frame's index.
 *
 * An explicit prop still wins, and a `Field` inside a band still beats the band for its own
 * control: this is the unit layer's ordinary third rung, not a new rule.
 */
function ChromeSize({ children }: { children: React.ReactNode }) {
  return (
    <SizeScopeContext.Provider value={React.use(ShellSizeContext)}>
      {children}
    </SizeScopeContext.Provider>
  );
}

export type ShellPaneHeaderProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
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
    <ChromeSize>
      <div
        {...props}
        className={cx("kui-pane-header", className)}
        {...(float ? { "data-float": "" } : {})}
      />
    </ChromeSize>
  );
}

export type ShellPaneFooterProps = ComponentRefusals & ShellPaneHeaderProps;

/** The same row at the pane's other end; with `float` it publishes `--kui-pane-inset-block-end`. */
export function ShellPaneFooter({ className, float, ...props }: ShellPaneFooterProps) {
  return (
    <ChromeSize>
      <div
        {...props}
        className={cx("kui-pane-footer", className)}
        {...(float ? { "data-float": "" } : {})}
      />
    </ChromeSize>
  );
}

/* ── Navigation: the sidebar's own vocabulary (§21, §27) ───────────────────────────────────
   OPTIONAL, and the shape has to say so. A sidebar's job is navigation often enough that the
   system owes it a row and a group, and NOT often enough to make them the only legal
   content: Womp puts a layers tree here, our own builder puts a component palette. So these
   are two small parts a pane may contain, never an anatomy it must have — a tree is a
   kookie-block, and what the pane owes it is a box with a real height, the right region
   scrolling, and `m="bleed"` for rows that want to reach the pane's edge. */

export type ShellRailItemProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"button">, "color"> & {
  /** The region you are in. Announced as well as painted, exactly as a nav row's is. */
  current?: boolean;
  /** Be an anchor instead. A rail is primary navigation, and a link is a link. */
  render?: RenderElement;
  /**
   * Required, because the item is icon-only, and an icon with no name is a button nobody can read.
   * If the rail ever grows labels they go under the icon and stay a setting on the pane: one word
   * under one icon and not the next is how a column of icons stops lining up.
   */
  /** The item's name. The rail SPEAKS it (an icon-only square names itself to AT); the tab
      bar SHOWS it under the icon (2026-09-09). */
  label?: string;
  /** The item's name, for an item that predates `label`. State `label` instead: it names the
      item to a screen reader in the rail and shows the word under the icon in the tab bar.
      @deprecated since 2026-09-09 — use `label`. */
  "aria-label"?: string;
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
  label,
  ref,
  ...props
}: ShellRailItemProps) {
  const size = React.use(ShellSizeContext);
  const content = label === undefined ? children : (
    <>
      {children}
      <span className="kui-shell-rail-label" aria-hidden>{label}</span>
    </>
  );
  const merged = {
    ...props,
    "aria-label": label ?? props["aria-label"],
    "data-size": size,
    ...(current
      ? { "aria-current": "page" as const, "data-tone": "accent", "data-emphasis": "medium" }
      : { "data-emphasis": "quiet" }),
    className: cx("kui-control kui-shell-rail-item", className),
    ref,
  };
  if (render) return composeRender(render, merged as never, content);
  return (
    <button {...(merged as React.ComponentPropsWithoutRef<"button">)} type="button">
      {content}
    </button>
  );
}

export type ShellRailListProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"div">, "color">;

/**
 * A run of rail squares. Layout only — the rail owns the distance between its own items the
 * way a nav group owns the distance between its rows, and a rail typically has two of these:
 * the regions at the top, and the account and settings squares pinned at the bottom.
 *
 * Those two runs behave differently and the difference is deliberate: the bottom one holds
 * plain actions that open menus and are never "current", so nothing here makes membership
 * mean selection.
 */
export function ShellRailList({ className, children, ...props }: ShellRailListProps) {
  // IN A BAR-ONLY RAIL THE LIST IS THE PILL (see `ShellBarContext`). Outside one it is layout
  // and nothing else, which is what it has always been. The hooks run either way — a
  // conditional hook is not a thing — and only the stamps and the scope are conditional.
  const bar = React.use(ShellBarContext);
  const material = useMaterial(bar?.backdrop ? { backdrop: true } : undefined);
  const lens = useLensRef<HTMLDivElement>(bar ? material : "solid", null);
  if (!bar) return <div {...props} className={cx("kui-shell-rail-list", className)}>{children}</div>;
  return (
    <div
      {...props}
      ref={lens}
      className={cx("kui-surface kui-shell-rail-list", className)}
      // THE PANE'S OWN THREE STAMPS, and forgetting them is what the dress moving cost
      // (2026-09-09, Kushagra: "The bar and action have different material it seems… And in
      // solid mode they stop showing any boundary?"). `.kui-surface` and `data-material` moved
      // here from the rail and these did not, so the surface layer had nothing to answer:
      // `[data-emphasis="quiet"]` is what declares the SEAL (`--kui-sf-fill-src`) and
      // `[data-bordered]` is what points the border at the edge role. Measured: the pill's fill
      // source was the empty string and it painted `rgba(0, 0, 0, 0)` — no veil at all, so it
      // was blur and rim alone — while the action, being a `.kui-control`, had picked up quiet
      // from its own family and did paint one. Two panes of the same material rendering
      // differently, which is exactly what he saw.
      data-tone="neutral"
      data-emphasis="quiet"
      data-bordered
      // Solid is the ABSENCE of a material, so it writes no attribute (§10) — `usePaneDress`'s
      // own line. Stamped unconditionally it read `data-material="solid"`, which every
      // `[data-material]` rule matches, so a solid bar took the glass grip fill.
      {...(material !== "solid" ? { "data-material": material } : {})}
    >
      <GlassScope material={material}>
        {/* NEUTRAL, STATED (2026-09-09). The grip's fill is `--tone-soft`, and that role is
            declared only inside a `[data-tone]` scope — so an unstamped thumb resolved it to
            nothing and painted `rgba(0, 0, 0, 0)`. It went unseen because the only bar in front
            of us is glass, where surfaces.css re-points the fill to the material's own grip
            ink; on a solid bar the chosen tab had no grip under it at all. Neutral rather than
            the item's `accent`: what the grip says is WHICH seat, and the accent is already
            spent on the label. */}
        <span className="kui-shell-rail-thumb" aria-hidden="true" hidden data-tone="neutral" />
        {children}
      </GlassScope>
    </div>
  );
}

export type ShellRailActionProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"button">, "color"> & {
  /** The button's name — spoken to AT and shown under the glyph, exactly as a tab's is. */
  label: string;
  /** Be an anchor instead, for an action that is really a destination. */
  render?: RenderElement;
  ref?: React.Ref<HTMLElement>;
};

/**
 * A control in the tab bar that is not a PLACE (§27, 2026-09-09) — search, or whatever else
 * an app puts a trigger there for. It sits outside the pill of tabs as its own pane, which is
 * the whole reason it exists: inside the pill it was a fifth equal seat, and a trigger that
 * looks like a tab promises a destination it does not have (the builder's own dead-control
 * finding, in a component).
 *
 * NOT `ShellRailItem` with a prop, and not a `<Button iconOnly backdrop>` at the call site.
 * A rail item is a place: it carries `current` and `aria-current`, and an action never can, so
 * the prop would refuse half its own type on one branch — §26's `TabsTrigger` refusal, which
 * was about a name that lies. And a caller's Button cannot derive the box: this has to stand
 * exactly as tall as the pill beside it, which is the seat's row plus the pill's own air.
 *
 * It carries its LABEL (Kushagra's call, against the reference, which draws a bare circle):
 * with a caption it lines up with the tabs' icon-over-word column and simply does not live in
 * the pill. Outside a bar-only rail it is an ordinary rail square — see `ShellBarContext` for
 * why the posture bounds it.
 */
export function ShellRailAction({ className, children, label, render, ref, ...props }: ShellRailActionProps) {
  const size = React.use(ShellSizeContext);
  const bar = React.use(ShellBarContext);
  const material = useMaterial(bar?.backdrop ? { backdrop: true } : undefined);
  const lens = useLensRef<HTMLElement>(bar ? material : "solid", ref);
  const merged = {
    ...props,
    "aria-label": label,
    "data-size": size,
    "data-emphasis": "quiet",
    // The pane's dress, when it IS one — the pill's own three, with quiet already stated above
    // because this is a control as well as a surface. See `ShellRailList` for what their
    // absence measured.
    ...(bar ? { "data-tone": "neutral", "data-bordered": true } : {}),
    ...(bar && material !== "solid" ? { "data-material": material } : {}),
    className: cx(bar ? "kui-surface" : undefined, "kui-control kui-shell-rail-item kui-shell-rail-action", className),
    ref: bar ? lens : ref,
  };
  const content = (
    <>
      {children}
      <span className="kui-shell-rail-label" aria-hidden>{label}</span>
    </>
  );
  const inner = bar ? <GlassScope material={material}>{content}</GlassScope> : content;
  if (render) return composeRender(render, merged as never, inner);
  return (
    <button {...(merged as React.ComponentPropsWithoutRef<"button">)} type="button">
      {inner}
    </button>
  );
}

export type ShellNavGroupProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
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

export type ShellNavItemProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"button">, "color"> & {
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

export type ShellTriggerProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"button">, "color"> & {
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
