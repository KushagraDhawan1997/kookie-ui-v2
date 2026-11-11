"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import { CHEVRON_BACK_PATH, DISMISS_PATH, GLYPH_VIEWBOX } from "../../system/glyphs.ts";
import { glyphStroke } from "../../tokens/config.ts";
import { setPageCollapsed, useClaimPage, usePageScope } from "../../system/page.tsx";
import { ShellPaneHeader, ShellScroll, useInWorkArea } from "../shell/shell.tsx";
import { Flex } from "../flex/flex.tsx";
import { HostCloseContext, HostTitleContext } from "../../system/host-title.ts";
import { Heading } from "../heading/heading.tsx";
import { Page } from "../page/page.tsx";
import { Row, type RowProps } from "../row/row.tsx";
import { Toolbar, ToolbarButton, ToolbarTitle } from "../toolbar/toolbar.tsx";

/**
 * Navigator (2026-11-02, Kushagra: "we build navigation stack as a pattern"; the name his).
 *
 * A STACK OF SCREENS, ANY DEPTH. Any screen can open another on top of it, and Back removes the
 * top one. The first screen is the root and never goes. That is the whole pattern, and every
 * platform that ships it agrees on it (UINavigationController, SwiftUI's NavigationStack,
 * Android's back stack, WinUI's Frame).
 *
 * THE PATH IS DATA. The screens above the root are a list of values the app owns, and `screen`
 * turns a value into a screen. That is SwiftUI's and Navigation 3's shape, and it is what lets
 * an app keep the path in its URL, restore it, or open three levels deep from a link, none of
 * which this component has an opinion about.
 *
 * IT HAS NO REGION OF ITS OWN. A navigator paints nothing and is the page system for wherever
 * it sits, so it is never placed inside a `Page`. What decides how a screen carries its title
 * is the HOST: in a shell pane, a screen is a `Page`, with the large title that collapses into
 * the pane's band. Anywhere smaller — a card, a popover, a sheet — the host is the region, and
 * the screen gets a header row with Back and a small heading that names it.
 *
 * SCREENS UNDER THE TOP STAY MOUNTED, inside `<Activity mode="hidden">`, so a list keeps its
 * scroll and a composer its draft. Hidden, their effects are cleaned up, which is what keeps a
 * hidden `Page` from claiming the pane's title.
 *
 * Focus: a new screen's title takes focus on push; on pop, focus returns to the control that
 * opened the screen. Escape never goes back — it belongs to whatever overlay holds this.
 */

type NavigatorApi<T> = {
  /** The values above the root, bottom first. Empty at the root. */
  path: readonly T[];
  /** Open a screen on top. */
  push: (value: T) => void;
  /** Close the top screen. Does nothing at the root. */
  pop: () => void;
  /** Close every screen above `depth`, where 0 is the root. */
  popTo: (depth: number) => void;
  /** Whether there is a screen to go back to. */
  canGoBack: boolean;
};

type NavigatorState = NavigatorApi<unknown> & {
  /** Each level's title, so Back can name the screen it returns to. */
  titles: React.MutableRefObject<(string | undefined)[]>;
  version: number;
  setTitle: (depth: number, title: string) => void;
  /** The control that opened each level, so focus can go back to it. */
  openers: React.MutableRefObject<(HTMLElement | null)[]>;
  /** The direction of the last change, which the stylesheet reads to move the new screen. */
  direction: "push" | "pop" | null;
  /** Counts path changes, so the band can tell one arrival from the next. */
  step: number;
  /** The app's words for Back, Close and the band, when it gave any. */
  labels: NavigatorLabels | undefined;
};

/**
 * The words the navigator says itself, for an app in another language. Each one has an English
 * default, so a navigator with no `labels` reads as it always did.
 */
export type NavigatorLabels = {
  /** Back's name when the screen below has no title. The default is "Back". */
  back?: string;
  /** Back's name when the screen below has a title. The default is "Back to" and that title. */
  backTo?: (title: string) => string;
  /** The name of the Close button the navigator draws in a dialog, sheet or popover. The default is "Close". */
  close?: string;
  /** The name of the band the navigator draws in a dialog, sheet or popover. The default is "Navigation". */
  navigation?: string;
};

const backLabel = (labels: NavigatorLabels | undefined, previous: string | null | undefined): string =>
  previous ? (labels?.backTo?.(previous) ?? `Back to ${previous}`) : (labels?.back ?? "Back");

const NavigatorContext = React.createContext<NavigatorState | null>(null);
const LevelContext = React.createContext<number>(0);

export type NavigatorProps<T> = ComponentRefusals & {
  /** The screens above the root, as values. Use it with `onPathChange` to control the path. */
  path?: readonly T[];
  /** The path to start with when the navigator controls its own path. */
  defaultPath?: readonly T[];
  /** Called with the new path whenever a screen opens or closes. */
  onPathChange?: (path: T[]) => void;
  /** Turns a value from the path into its screen, usually a `NavigatorScreen`. */
  screen: (value: T) => React.ReactNode;
  /** The root screen, usually a `NavigatorScreen`. It is always at the bottom and never closes. */
  root: React.ReactNode;
  /** The navigator's own words: Back, Close and the band's name. Set them to translate them. */
  labels?: NavigatorLabels;
  /**
   * The frame around the screens, when you need your own: a band with actions, and a scroller
   * holding `NavigatorOutlet`. Leave it out and the navigator draws the frame for you: in a
   * shell pane, the pane's band with Back and the title, and its scroller; anywhere else, the
   * screens on their own.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * A stack of screens: any screen can open another on top, and Back returns to the one below.
 * `root` is the first screen, `screen` turns each value in the path into its screen, and
 * `children`, when given, is the frame the screens go into through `NavigatorOutlet`.
 */
export function Navigator<T>({
  path: pathProp,
  defaultPath,
  onPathChange,
  screen,
  root,
  labels,
  children,
  className,
  style,
}: NavigatorProps<T>) {
  // In a shell pane with no frame passed, the navigator draws the pane's band and scroller
  // itself, so Back and the title always sit together the way the band wants them.
  const inPane = usePageScope() !== null;
  const [own, setOwn] = React.useState<readonly T[]>(defaultPath ?? []);
  const path = pathProp ?? own;
  // The direction comes from the path itself, so a path the app sets (a controlled `path`)
  // animates and moves focus the same way as one changed by push and pop. Equal length with a
  // new top value is a new screen arriving, so it reads as a push.
  const [seen, setSeen] = React.useState<{ path: readonly T[]; direction: "push" | "pop" | null; step: number }>({
    path,
    direction: null,
    step: 0,
  });
  let direction = seen.direction;
  let step = seen.step;
  // Compared by content, not identity: a controlled `path` may be a new array every render.
  if (seen.path.length !== path.length || seen.path.some((value, i) => !Object.is(value, path[i]))) {
    const before = seen.path;
    direction =
      path.length < before.length
        ? "pop"
        : path.length > before.length || !Object.is(path[path.length - 1], before[before.length - 1])
          ? "push"
          : seen.direction;
    step = seen.step + 1;
    setSeen({ path, direction, step });
  }
  const titles = React.useRef<(string | undefined)[]>([]);
  const openers = React.useRef<(HTMLElement | null)[]>([]);
  const [version, setVersion] = React.useState(0);

  const change = React.useCallback(
    (next: T[]) => {
      if (pathProp === undefined) setOwn(next);
      onPathChange?.(next);
    },
    [pathProp, onPathChange],
  );

  const api = React.useMemo<NavigatorState>(
    () => ({
      path,
      canGoBack: path.length > 0,
      push: (value) => {
        openers.current[path.length + 1] =
          typeof document === "undefined" ? null : (document.activeElement as HTMLElement | null);
        change([...path, value as T]);
      },
      pop: () => {
        if (path.length > 0) change(path.slice(0, -1));
      },
      popTo: (depth) => {
        if (depth < path.length) change(path.slice(0, Math.max(0, depth)));
      },
      titles,
      openers,
      version,
      setTitle: (depth, title) => {
        if (titles.current[depth] === title) return;
        titles.current[depth] = title;
        setVersion((v) => v + 1);
      },
      direction,
      step,
      labels,
    }),
    // The four words rather than the object, so an inline `labels={{…}}` does not remake the
    // state on every render.
    [path, change, version, direction, step, labels?.back, labels?.backTo, labels?.close, labels?.navigation],
  );

  // On pop, focus goes back to the control that opened the screen that just closed.
  const previousDepth = React.useRef(path.length);
  React.useEffect(() => {
    const before = previousDepth.current;
    previousDepth.current = path.length;
    if (path.length < before) {
      const opener = openers.current[before];
      openers.current.length = path.length + 1;
      if (opener && opener.isConnected) opener.focus();
    }
  }, [path.length]);

  const levels = [root, ...path.map((value) => screen(value))];
  const top = levels.length - 1;
  const screens = (
    <div
      className={className ? `kui-navigator ${className}` : "kui-navigator"}
      data-direction={direction ?? undefined}
      style={style}
    >
      {levels.map((level, depth) => (
        // Keyed by depth AND value, so a path that replaces the screen at a depth mounts a new
        // screen instead of handing it the old one's state.
        <React.Activity key={depth === 0 ? "root" : `${depth}:${String(path[depth - 1])}`} mode={depth === top ? "visible" : "hidden"}>
          <LevelContext.Provider value={depth}>
            <div className="kui-navigator-level">{level}</div>
          </LevelContext.Provider>
        </React.Activity>
      ))}
    </div>
  );
  // ONE BAND FOR THE STACK (2026-11-03, Kushagra: "Why is that which is fixed per screen
  // animating?"). Outside a pane the band belongs to the navigator, not to each screen, so
  // what stays the same across a step — Close, and Back after the first — stays still. In a
  // pane the pane's own band does this job.
  const outlet = inPane ? (
    screens
  ) : (
    <>
      <NavigatorBar />
      {screens}
    </>
  );

  return (
    <NavigatorContext.Provider value={api}>
      <OutletContext.Provider value={outlet}>
        {children ?? (inPane ? <PaneFrame /> : outlet)}
      </OutletContext.Provider>
    </NavigatorContext.Provider>
  );
}

const OutletContext = React.createContext<React.ReactNode>(null);

/**
 * THE PANE'S FRAME, OWNED (2026-11-02, Kushagra: "Yes" to the Navigator owning it). Every app
 * wrote the same header by hand, and the one that wrote Back and the title as two loose toolbar
 * children got them split to the two ends of the band. Back and the title are one cluster at
 * the start; the screens go in the pane's scroller. Pass children instead when the band needs
 * actions of its own.
 */
function PaneFrame() {
  return (
    <>
      <ShellPaneHeader>
        <Toolbar>
          <Flex align="center">
            <NavigatorBack />
            <ToolbarTitle />
          </Flex>
        </Toolbar>
      </ShellPaneHeader>
      <ShellScroll>
        <NavigatorOutlet />
      </ShellScroll>
    </>
  );
}

/** Where the screens go, inside a frame passed as the navigator's children. */
export function NavigatorOutlet() {
  return <>{React.use(OutletContext)}</>;
}

function useNavigatorState(): NavigatorState {
  const state = React.use(NavigatorContext);
  if (!state) throw new Error("Kookie: this part must be inside a <Navigator>.");
  return state;
}

/** The navigator around this component: its path, and `push`, `pop` and `popTo`. */
export function useNavigator<T = unknown>(): NavigatorApi<T> {
  return useNavigatorState() as NavigatorApi<T>;
}

/** The title of the screen Back would return to, or null at the root. */
function usePreviousTitle(): string | null {
  const state = useNavigatorState();
  const depth = state.path.length;
  if (depth === 0) return null;
  return state.titles.current[depth - 1] ?? null;
}

function backGlyph() {
  return (
    <svg
      className="kui-navigator-back-glyph"
      viewBox={GLYPH_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d={CHEVRON_BACK_PATH}
        stroke="currentColor"
        strokeWidth={glyphStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function closeGlyph() {
  return (
    <svg viewBox={GLYPH_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d={DISMISS_PATH} stroke="currentColor" strokeWidth={glyphStroke} strokeLinecap="round" />
    </svg>
  );
}

export type NavigatorBackProps = ComponentRefusals & {
  /** The accessible name. The default is the navigator's `labels`, or "Back to" and the previous screen's title. */
  "aria-label"?: string;
};

/**
 * Back, for a toolbar: a chevron that closes the top screen. It is absent at the root rather
 * than disabled, because there is nowhere to go back to. It names the screen it returns to, so
 * a screen reader hears "Back to Settings".
 */
export function NavigatorBack(props: NavigatorBackProps) {
  const state = useNavigatorState();
  const previous = usePreviousTitle();
  if (!state.canGoBack) return null;
  return (
    <ToolbarButton
      iconOnly
      aria-label={props["aria-label"] ?? backLabel(state.labels, previous)}
      onClick={state.pop}
    >
      {backGlyph()}
    </ToolbarButton>
  );
}

export type NavigatorScreenProps = ComponentRefusals & {
  /** The screen's title. In a pane it is the page's large title; elsewhere it names the region. */
  title: string;
  /** The screen's content, under its title. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * One screen in a navigator. The host decides how its title shows: inside a shell pane the
 * screen is a `Page`, and the pane's band carries Back and the collapsed title. Anywhere else the
 * navigator's band carries Back and this title, and the screen is only its content.
 */
export function NavigatorScreen({ title, children, className }: NavigatorScreenProps) {
  const state = useNavigatorState();
  const depth = React.use(LevelContext);
  const inPane = usePageScope() !== null;
  const inWorkArea = useInWorkArea();
  const heading = React.useRef<HTMLDivElement>(null);

  // Before paint, so the band never draws a step without its title.
  React.useLayoutEffect(() => {
    state.setTitle(depth, title);
  }, [state, depth, title]);

  // A pushed screen's title takes focus, so a keyboard and a screen reader start at its top.
  // Outside a pane the title is in the navigator's band, which moves focus itself.
  React.useEffect(() => {
    if (depth === 0 || state.direction !== "push" || !inPane) return;
    // A side pane's title is in the pane's band, outside the screen, so the screen itself takes
    // focus there; the control that opened it has just been hidden with the level below.
    const target = heading.current?.querySelector<HTMLElement>("h1") ?? heading.current;
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
    // Only on arrival: a later re-render must not pull focus back to the title.
  }, []);

  const cls = className ? `kui-navigator-screen ${className}` : "kui-navigator-screen";

  if (inPane && inWorkArea) {
    return (
      <div ref={heading} className={cls}>
        <Page title={title}>{children}</Page>
      </div>
    );
  }
  if (inPane) {
    // A SIDE PANE KEEPS ITS TITLE IN ITS BAND (2026-11-02, review: a page's 9-step title in a
    // 240px inspector dwarfed its three rows). The screen claims the pane's title so the band's
    // `ToolbarTitle` shows it from the start, and draws no large title of its own.
    return (
      <div ref={heading} className={cls}>
        <SidePaneTitle title={title} />
        {children}
      </div>
    );
  }

  return (
    <div ref={heading} className={cls}>
      {children}
    </div>
  );
}

/**
 * THE BAND OUTSIDE A PANE: Back, the title, and the panel's Close, in one Toolbar
 * (2026-11-02, Kushagra: "toolbar sits at a padding closer to the edges").
 *
 * IT MOTIONS WHAT CHANGED, AND ONLY THAT (2026-11-03, Kushagra: "The X and Back button dont
 * have a place to appear, so they fade in, and the title translates/glides to right, fades out
 * as it does, and new one comes in"). Close never moves. Back fades in on the first push and out
 * on the last pop. The title that is leaving is drawn once more over the band, where it was, and
 * glides the way the stack went while it fades; the new one fades in at its place.
 */
function NavigatorBar() {
  const state = useNavigatorState();
  const HostTitle = React.use(HostTitleContext);
  const HostClose = React.use(HostCloseContext);
  const bar = React.useRef<HTMLDivElement>(null);
  const depth = state.path.length;
  const title = state.titles.current[depth];

  // What the band shows, and what it showed before, so a change can draw the old one leaving.
  // Held until the new screen has said its title, which it does before paint.
  const [shown, setShown] = React.useState({ depth, title, step: 0 });
  const [left, setLeft] = React.useState<{ depth: number; title: string; step: number } | null>(null);
  if (title !== undefined && (title !== shown.title || depth !== shown.depth)) {
    if (shown.title !== undefined && state.direction) setLeft({ depth: shown.depth, title: shown.title, step: state.step });
    setShown({ depth, title, step: state.step });
  }

  // A pushed screen's title takes focus, so a keyboard and a screen reader start at its top.
  React.useEffect(() => {
    if (shown.step === 0 || state.direction !== "push") return;
    const target = bar.current?.querySelector<HTMLElement>(":scope > .kui-toolbar > .kui-toolbar-title");
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
    // Only on arrival: a later re-render must not pull focus back to the title.
  }, [shown.step]);

  const previous = depth > 0 ? state.titles.current[depth - 1] : undefined;
  const back =
    depth > 0 ? (
      <ToolbarButton
        key="back"
        className="kui-navigator-back"
        iconOnly
        aria-label={backLabel(state.labels, previous)}
        onClick={state.pop}
      >
        {backGlyph()}
      </ToolbarButton>
    ) : null;
  // The title IS the panel's own title part, so it keeps the panel's step and names the panel.
  const words = shown.title ?? "";
  const heading = HostTitle ? <HostTitle /> : <Heading size="5" render={<h2 />} />;
  const close = HostClose ? (
    <HostClose
      render={
        <ToolbarButton iconOnly aria-label={state.labels?.close ?? "Close"}>
          {closeGlyph()}
        </ToolbarButton>
      }
    />
  ) : null;

  return (
    <div
      ref={bar}
      className="kui-navigator-bar"
      data-direction={state.direction ?? undefined}
    >
      <Toolbar backdrop aria-label={state.labels?.navigation ?? "Navigation"}>
        {back}
        <ToolbarTitle key={`title:${shown.step}`} className="kui-navigator-title" render={heading}>
          {words}
        </ToolbarTitle>
        {close}
      </Toolbar>
      {left ? (
        // The title leaving, drawn where it was: the same row with a Back in it or not, so it
        // starts from its own place before it glides. Back leaving goes with it on the last pop.
        <div key={left.step} className="kui-navigator-leaving" aria-hidden inert>
          <Toolbar aria-label="Leaving">
            {left.depth > 0 ? (
              <ToolbarButton
                iconOnly
                aria-label="Back"
                className={depth === 0 ? "kui-navigator-back-leaving" : "kui-navigator-back-held"}
              >
                {backGlyph()}
              </ToolbarButton>
            ) : null}
            <ToolbarTitle
              className="kui-navigator-title-leaving"
              render={HostTitle ? <HostTitle decorative /> : <Heading size="5" render={<h2 />} />}
            >
              {left.title}
            </ToolbarTitle>
          </Toolbar>
        </div>
      ) : null}
    </div>
  );
}

function SidePaneTitle({ title }: { title: string }) {
  const store = usePageScope();
  useClaimPage(store, title);
  React.useEffect(() => {
    if (!store) return;
    setPageCollapsed(store, true);
    return () => setPageCollapsed(store, false);
  }, [store]);
  return null;
}

export type NavigatorLinkProps<T> = ComponentRefusals &
  Omit<RowProps, "onClick" | "trailing" | "value"> & {
    /** The value pushed onto the path when the row is pressed. */
    value: T;
  };

/** A row that opens the next screen, with the chevron that says so. */
export function NavigatorLink<T>({ value, ...props }: NavigatorLinkProps<T>) {
  const state = useNavigatorState();
  return (
    <Row
      {...props}
      trailing={
        <svg
          className="kui-navigator-link-glyph"
          viewBox={GLYPH_VIEWBOX}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d={CHEVRON_BACK_PATH}
            stroke="currentColor"
            strokeWidth={glyphStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      onClick={() => state.push(value)}
    />
  );
}
