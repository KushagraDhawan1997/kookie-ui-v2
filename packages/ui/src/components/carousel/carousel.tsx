"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import { mergeRefs } from "../../system/render.ts";
import { ViewportAsContext } from "../../system/scroll-viewport.ts";
import { Button } from "../button/button.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import * as React from "react";

/**
 * THE PATTERN, NOT THE CONTENT (2026-09-18, Kushagra: "I don't care what scrolls, I want to ship
 * the pattern"). What a carousel is, once the cards are taken out of it: a snapping scroller, a
 * button each way, and those buttons going dead at the ends. Cards, covers, a filmstrip of frames
 * — the arrangement is the call site's, and a card carousel remains a block.
 *
 * IT IS A SCROLLER, NOT A SLIDESHOW MACHINE. Native scrolling keeps the platform's momentum,
 * wheel, trackpad, touch and keyboard (the bar is hidden — carousel.css says why), and the
 * buttons only ask it to move — which is
 * the same bargain ScrollArea struck in 2026-08-17 and the reason most carousel libraries carry
 * most carousel bugs: they reimplement the scroll they could have asked for. Base UI has no
 * carousel and says it is unlikely to build one (mui/base-ui#4785), so the pattern is ours; the
 * scroller under it stays theirs.
 *
 * WHAT THE STATE COSTS, stated rather than implied. Two booleans — is there more that way, either
 * way — recomputed on scroll and on resize, coalesced into one frame, and published only when a
 * boolean actually FLIPS. A traversal of a rail is therefore two renders of two buttons, not one
 * per frame: `useSyncExternalStore` over a snapshot that is referentially stable while nothing
 * changes. This is machinery in the sense the package already sanctions (ScrollArea's note on Base
 * UI's own listener) — it runs while the content moves, never on hover, press or focus, and it
 * writes no style: CSS resolves every state, and the state it resolves is a disabled Button.
 *
 * `::scroll-button()` IS THE EVENTUAL SPELLING AND IS NOT READY. CSS Overflow 5 generates the
 * buttons on the scroller itself, disables them at the ends with no JavaScript at all, and would
 * delete the store below. Two things hold it: its content is the `content` property, which takes
 * text and images and cannot hold the icon element every call site will pass, and Firefox is
 * partial as of this writing. Recorded the way ScrollArea recorded scroll-timeline: the day it is
 * both Baseline and able to host an element, this component's machinery is deletable.
 *
 * REFUSED, and each refusal is the same sentence twice: autoplay (a timer that moves content
 * under a reader, and the accessible answer to it is a pause button nobody presses), loop (cloned
 * nodes, or a scroll position that lies), and drag-to-scroll on a pointer that already drags to
 * select. Each one is the browser's scrolling replaced by ours, which is the thing this component
 * exists not to do.
 */

/** How far a press moves the rail when no snap point can be found. Four fifths of the box, so the
    item at the edge stays half in view and the eye keeps its place. */
const PAGE_FRACTION = 0.8;

/** Sub-pixel slack. Fractional scroll positions (zoom, retina) leave a tenth of a pixel behind,
    and a button that stays live with 0.4px of travel left is a button that does nothing when
    pressed. */
const EPSILON = 1;

type Reach = { readonly start: boolean; readonly end: boolean };

/** Nothing to scroll: what a rail whose content fits reports, and the server's answer. */
const NO_REACH: Reach = { start: false, end: false };

type CarouselStore = {
  /** Registers the element that scrolls. The rail calls this; nothing else may. */
  readonly attach: (viewport: HTMLElement | null) => void;
  readonly subscribe: (listener: () => void) => () => void;
  readonly snapshot: () => Reach;
  /** Moves one snap point, or one near-page when the content declares none. */
  readonly step: (direction: 1 | -1) => void;
  /** Names the scroller for `aria-controls`, so a button says what it moves. */
  readonly railId: string;
};

const CarouselContext = React.createContext<CarouselStore | null>(null);

/** The store, one per mounted Carousel. Kept out of React state on purpose: a scroll writes it
    many times a second and only a flip is worth a render. */
function useCarouselStore(railId: string): CarouselStore {
  return React.useMemo(() => {
    let viewport: HTMLElement | null = null;
    let reach: Reach = NO_REACH;
    let frame = 0;
    const listeners = new Set<() => void>();

    /** Physical direction the inline axis runs in. `:dir()` rather than a computed style, which
        is the same answer without a style read (and one banned shape fewer — see the exemption
        this file carries in recipes.test.ts). Asked per press rather than cached: a `dir`
        attribute can change under a mounted tree, and a carousel that keeps yesterday's answer
        scrolls the wrong way for the rest of its life. */
    const rtl = () => viewport !== null && viewport.matches(":dir(rtl)");

    /**
     * How far the rail can still travel each way, in the READING sense — "start" is the side the
     * content begins on, which is the right-hand side in Arabic and Hebrew. `scrollLeft` is
     * negative in RTL under the standard behaviour every current engine implements, so the
     * distance from the start is its magnitude either way, and the distance to the end is what is
     * left of the overflow.
     */
    const measure = (): Reach => {
      if (viewport === null) return NO_REACH;
      const travelled = Math.abs(viewport.scrollLeft);
      const overflow = viewport.scrollWidth - viewport.clientWidth;
      if (overflow <= EPSILON) return NO_REACH;
      return { start: travelled > EPSILON, end: overflow - travelled > EPSILON };
    };

    const publish = () => {
      frame = 0;
      const next = measure();
      // The snapshot is compared by VALUE and replaced only on a flip, because
      // `useSyncExternalStore` re-renders on identity: a fresh object per scroll event is the
      // per-frame render this component is written to avoid.
      if (next.start === reach.start && next.end === reach.end) return;
      reach = next;
      for (const listener of listeners) listener();
    };

    const schedule = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(publish);
    };

    /** Content and box both decide whether there is more to see, so both are watched: a rail with
        one card added, or a window narrowed until the same cards overflow, has to wake the
        buttons without anyone scrolling.

        THE TWO DRIVERS OVERLAP, AND THE SABOTAGE PASS SAYS SO (2026-09-18). Removing the scroll
        listener alone leaves every law green, and so does removing this observation alone —
        Base UI writes to the content box as it sizes its thumb, so in Chromium the observer sees
        a scroll indirectly. Removing BOTH goes red. The listener stays because the overlap is the
        host's accident rather than a promise, and the observation stays because a resize with no
        scroll is a case the listener cannot see; what is recorded here is that no law separates
        them. */
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);

    return {
      railId,
      attach(next) {
        if (viewport === next) return;
        if (viewport !== null) {
          viewport.removeEventListener("scroll", schedule);
          observer?.disconnect();
        }
        viewport = next;
        if (viewport !== null) {
          // Passive: this listener never calls preventDefault, and saying so keeps the scroll off
          // the main thread's critical path.
          viewport.addEventListener("scroll", schedule, { passive: true });
          observer?.observe(viewport);
          const content = viewport.firstElementChild;
          if (content !== null) observer?.observe(content);
        }
        schedule();
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
          if (listeners.size === 0 && frame !== 0) {
            cancelAnimationFrame(frame);
            frame = 0;
          }
        };
      },
      snapshot: () => reach,
      step(direction) {
        if (viewport === null) return;
        const flip = rtl() ? -1 : 1;
        /**
         * ONE SNAP POINT, measured off the items rather than assumed. A press that moved a fixed
         * page left the rail parked between two snap points and the scroller pulled it back, so
         * the first press after a resize appeared to do nothing. A rail that marks no items — a
         * strip of one wide picture — has no snap points and takes the page instead.
         *
         * MARKED DESCENDANTS, NOT MARKED CHILDREN, and the first spelling asked for children
         * (2026-09-18, caught by its own law). The layout between the viewport and the items is
         * the call site's — a flex row, a grid, a row per group — so the items are almost never
         * the content box's own children: the fixture put one wrapper in and the query found
         * nothing, which sent every press down the fallback page and moved 150px where the item
         * was 100. A nested carousel is not a case: its own viewport is a different element.
         */
        const items = viewport.querySelectorAll<HTMLElement>("[data-carousel-item]");
        const page = viewport.clientWidth * PAGE_FRACTION;
        let distance = page;
        if (items.length > 0) {
          const viewportEdge = viewport.getBoundingClientRect();
          const edges: number[] = [];
          for (const item of items) {
            const box = item.getBoundingClientRect();
            // Relative to the viewport's own leading edge, in the reading direction.
            edges.push(flip === 1 ? box.left - viewportEdge.left : viewportEdge.right - box.right);
          }
          const target =
            direction === 1
              ? edges.find((edge) => edge > EPSILON)
              : [...edges].reverse().find((edge) => edge < -EPSILON);
          if (target !== undefined) distance = Math.abs(target);
        }
        // The rail moves at once. Motion was removed 2026-09-20; docs/archive/motion-v1.md
        // records it.
        viewport.scrollBy({ left: direction * flip * distance, behavior: "auto" });
      },
    };
  }, [railId]);
}

function useCarousel(part: string): CarouselStore {
  const store = React.use(CarouselContext);
  if (store === null) {
    throw new Error(`[kookie-ui] ${part} must be rendered inside a Carousel.`);
  }
  return store;
}

export type CarouselProps = ComponentRefusals & {
  /** The rail and its buttons. You decide where the buttons go. */
  children?: React.ReactNode;
  /** A class for the root element. To add space around the carousel, wrap it in a `Box`. */
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The name of the carousel for screen readers. Set this or `aria-labelledby`, so that users
   * know what the previous and next buttons move.
   */
  "aria-label"?: string;
  /** The id of an element on the page that names the carousel, usually the heading above it. */
  "aria-labelledby"?: string;
};

/**
 * The pattern's root: a named group, and the state the parts share.
 *
 * It draws nothing, and the one declaration it carries is a position parent for the call site
 * that overlays its buttons on the rail (carousel.css). `role="group"` with `aria-roledescription="carousel"`
 * is the WAI-ARIA pattern's own spelling, and it is the reason this is a part rather than a
 * wrapper the call site could write itself (§10: anatomy is system-owned where something
 * non-visual forces it — here the role, the description and the `aria-controls` join between a
 * button and the rail it moves).
 */
export function Carousel({
  children,
  className,
  style,
  ref,
  "aria-label": label,
  "aria-labelledby": labelledBy,
}: CarouselProps) {
  const railId = React.useId();
  const store = useCarouselStore(railId);
  return (
    <CarouselContext value={store}>
      <div
        className={className ? `kui-carousel ${className}` : "kui-carousel"}
        style={style}
        ref={ref}
        role="group"
        aria-roledescription="carousel"
        {...(label !== undefined ? { "aria-label": label } : {})}
        {...(labelledBy !== undefined ? { "aria-labelledby": labelledBy } : {})}
      >
        {children}
      </div>
    </CarouselContext>
  );
}

export type CarouselRailProps = ComponentRefusals & {
  /** The items. Wrap each item that the rail stops at in a `CarouselItem`. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Fades the content at an edge when more content is past that edge.
   * Use it when the rail runs to the edge of a panel. With buttons at both ends, you may not need it.
   */
  fade?: boolean;
};

/**
 * What scrolls: a ScrollArea that snaps.
 *
 * It brings no scroller of its own. The viewport it wears is the ScrollArea's, through the
 * package's internal `ViewportAsContext` — MessageScroller's mechanism, and for its reason: two
 * scroll containers on one axis fight, and the state above has to read the element that actually
 * moves.
 *
 * ORIENTATION IS THE CONTENT'S, still. ScrollArea refuses the prop because Base UI mounts the bar
 * the content needs, and the snap axis here follows the same fact from the other side: the rail
 * is a row, so the axis is inline, and a column of items that scrolls vertically is a scroll
 * region with a fade, not a carousel with a previous and a next.
 */
export function CarouselRail({ children, className, style, fade }: CarouselRailProps) {
  const store = useCarousel("CarouselRail");
  /**
   * The viewport, rendered as our own element so the store can attach to the thing that scrolls.
   *
   * THE ELEMENT ARRIVES BY REF; THE LISTENERS ARE ATTACHED BY AN EFFECT, and the two are separate
   * on purpose (2026-09-18, found by a sabotage pass that could not go red — twice). A ref
   * callback's identity changes on every render, and Base UI re-renders this viewport on every
   * scroll as it sizes its thumb, so a ref that attached the listeners detached and re-attached
   * them continuously — which measured the rail often enough to keep the buttons right even with
   * the scroll listener deleted. The machinery was being carried by React's churn, and no law
   * could see the difference. An effect runs once per mounted rail, so what keeps the buttons
   * right is now the listener this component ships, and a law that removes it goes red.
   */
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const Viewport = React.useMemo(
    () =>
      function CarouselViewport({ ref, ...props }: React.ComponentPropsWithRef<"div">) {
        return <div {...props} id={store.railId} ref={mergeRefs<HTMLDivElement>(ref, viewportRef)} />;
      },
    [store]
  );
  React.useEffect(() => {
    store.attach(viewportRef.current);
    return () => {
      store.attach(null);
    };
  }, [store]);
  return (
    <ViewportAsContext value={Viewport}>
      <ScrollArea
        className={className ? `kui-carousel-rail ${className}` : "kui-carousel-rail"}
        {...(style !== undefined ? { style } : {})}
        {...(fade !== undefined ? { fade } : {})}
        // The rail is named by the group above it, and a second name on the scroller inside would
        // be announced as a nested region saying the same words. The viewport keeps Base UI's
        // tabIndex either way, so it is still reachable by keyboard.
        focusable
      >
        {children}
      </ScrollArea>
    </ViewportAsContext>
  );
}

export type CarouselItemProps = ComponentRefusals &
  Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
    ref?: React.Ref<HTMLDivElement>;
  };

/**
 * One snap point.
 *
 * It states no layout — no width, no aspect, no gap — because what scrolls is the call site's.
 * What it states is the pair that makes a press land: the item is where scrolling settles
 * (`scroll-snap-align`), and the store measures its edge to know how far one press travels.
 */
export function CarouselItem({ className, ...props }: CarouselItemProps) {
  return (
    <div
      className={className ? `kui-carousel-item ${className}` : "kui-carousel-item"}
      data-carousel-item=""
      {...props}
    />
  );
}

export type CarouselButtonProps = ComponentRefusals & {
  /** The icon, usually an arrow. The library ships no icons, so supply your own. */
  children?: React.ReactNode;
  /** The name of the button for screen readers. The default is `Previous` or `Next`. */
  "aria-label"?: string;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

/** Both buttons, one body: the only difference is which way they move the rail and which end
    kills them. */
function CarouselButton({
  direction,
  fallbackLabel,
  children,
  className,
  style,
  ref,
  "aria-label": label,
  part,
}: CarouselButtonProps & { direction: 1 | -1; fallbackLabel: string; part: string }) {
  const store = useCarousel(part);
  const reach = React.useSyncExternalStore(store.subscribe, store.snapshot, () => NO_REACH);
  const live = direction === 1 ? reach.end : reach.start;
  return (
    <Button
      iconOnly
      {...(className !== undefined ? { className } : {})}
      {...(style !== undefined ? { style } : {})}
      {...(ref !== undefined ? { ref } : {})}
      aria-label={label ?? fallbackLabel}
      aria-controls={store.railId}
      disabled={!live}
      /**
       * DEAD, AND STILL IN THE TAB ORDER. A press that reaches the end would otherwise disable
       * the element under the pointer and take focus with it — the keyboard user loses their
       * place mid-rail — so this takes the Button's own loading branch: `aria-disabled` and
       * Base UI's blocked activation, never the native attribute (§8).
       */
      focusableWhenDisabled
      onClick={() => {
        store.step(direction);
      }}
    >
      {children}
    </Button>
  );
}

/** Back one snap point. Dead while the rail is at its start. */
export function CarouselPrevious(props: CarouselButtonProps) {
  return (
    <CarouselButton
      {...props}
      direction={-1}
      fallbackLabel="Previous"
      part="CarouselPrevious"
    />
  );
}

/** On one snap point. Dead while the rail is at its end. */
export function CarouselNext(props: CarouselButtonProps) {
  return <CarouselButton {...props} direction={1} fallbackLabel="Next" part="CarouselNext" />;
}
