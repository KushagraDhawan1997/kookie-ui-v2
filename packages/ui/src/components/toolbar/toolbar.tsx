"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { rootsInButton, type RenderElement } from "../../system/render.ts";
import { BackdropContext, GlassScope, useMaterial } from "../../theme/theme.tsx";
import { BAND_STEP, SizeScopeContext, useSize } from "../../system/size.ts";
import { BAND_TITLE_STEP } from "../../system/type-steps.ts";
import { usePageMirror, usePageScope, usePageTitle } from "../../system/page.tsx";
import { Button, type ButtonProps } from "../button/button.tsx";
import { Menu, MenuContent, MenuGroup, MenuItem, MenuTrigger } from "../menu/menu.tsx";
import { Separator } from "../separator/separator.tsx";
import { Text } from "../text/text.tsx";

/**
 * Is this control hosted in a capsule? (§45, 2026-09-06, Kushagra: "not in the toolbar group,
 * because toolbar group has a bg now.")
 *
 * The group is a WELL, and a control in a well is a mark ON it rather than a box on a box — two
 * fills stacked read as one thing with a lighter thing inside it, which is what a filled button
 * inside a filled capsule draws. So the row's controls rest at the system's rung and a group's
 * rest quiet, and neither is a decision a call site has to remember: the group says where its
 * children are and the button reads it. A stated `emphasis` still wins in both places.
 */
const InToolbarGroup = React.createContext(false);

/**
 * Is this control being drawn into the overflow MENU rather than into the row? (§45, 2026-09-08.)
 *
 * A control that does not fit is not redrawn as something else — it is the SAME element, asked
 * where it is. `ToolbarButton` answers by rendering a `MenuItem`, `ToolbarGroup` by rendering a
 * `MenuGroup`, and an app's own cluster answers through `useToolbarOverflow()`. That is the same
 * shape `InToolbarGroup` above already has: a part reads where it sits and dresses itself, so a
 * call site never states the same fact twice.
 */
const InOverflow = React.createContext(false);

/* The axis the toolbar's arrow keys walk, for the one control that has to know it: a menu
   button in a VERTICAL toolbar. Base UI's menu trigger opens on ArrowDown/ArrowUp whatever it
   sits in, so in a column those keys opened the menu instead of moving to the next control. */
const ToolbarOrientation = React.createContext<"horizontal" | "vertical">("horizontal");

/**
 * True while this subtree is being drawn into a `ToolbarOverflow`'s menu instead of into the row.
 *
 * The package's own parts answer it themselves — a `ToolbarButton` becomes a menu row and a
 * `ToolbarGroup` becomes a menu group with nothing to write. Reach for this in an app's own
 * cluster, which the toolbar cannot see inside: a `Flex` of two groups is a sensible row and a
 * nonsense menu, so the component that renders it is the one that knows what it should be there.
 */
export function useToolbarOverflow(): boolean {
  return React.use(InOverflow);
}

/**
 * A row of controls with one tab stop. The arrow keys move focus between the controls.
 *
 * Use a `Flex` to group controls into clusters. The toolbar spaces the clusters and gives
 * its `size` to every control inside it. The toolbar has no fill, so it takes no `tone`,
 * `emphasis` or `material`.
 */
export type ToolbarProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
  /**
   * Sets the size step of every control in the row that doesn't set its own `size`.
   * The default is one step above the app's `size`, which is `3` in a default app.
   */
  size?: Size;
  /**
   * Sets the direction of the row and of the arrow keys. The default is `horizontal`.
   * Use `vertical` for a strip of tools along an edge.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Set `backdrop` when content passes behind the row, such as in a floating header.
   * Every control in the row then uses the theme's material. The row itself stays transparent.
   * A `backdrop` prop on a control overrides it.
   */
  backdrop?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * A row of controls with one keyboard tab stop, which is the reason it is a component at all.
 *
 * `role="toolbar"` moves focus between its controls with the arrow keys, so the whole row is one
 * stop rather than one per button. Everything visible follows from that: it is one control row
 * at its index, split with `space-between`, and its `size` reaches every control inside it.
 * What it does not state is the grouping — a `Flex` clusters, and the row spaces the clusters.
 */
export function Toolbar({
  size: sizeProp,
  orientation = "horizontal",
  className,
  backdrop,
  children,
  ...props
}: ToolbarProps) {
  // The APP's index, then the band's step above it — the caller's own value read first, so an
  // explicit `size` still wins the way it does everywhere else. Two statements rather than one
  // expression: `??` short-circuits, so `sizeProp ?? BAND_STEP[useSize()]` skips the hook on
  // every render where a size is stated, which is a conditional hook and breaks the moment a
  // caller's size becomes undefined.
  const app = useSize();
  const size = sizeProp ?? BAND_STEP[app];
  return (
    <BaseToolbar.Root
      orientation={orientation}
      data-size={size}
      className={className ? `kui-toolbar ${className}` : "kui-toolbar"}
      {...props}
    >
      <SizeScopeContext.Provider value={size}>
        <ToolbarOrientation.Provider value={orientation}>
        {/* The region mark rides context, not the DOM — Box's own mechanism, for Box's own
            reason: components resolve their material in React, so an attribute here would be a
            second and unread home for one fact. Nothing is provided when nothing is said, so a
            toolbar inside a marked region keeps that region's answer. */}
        {backdrop === undefined ? (
          children
        ) : (
          <BackdropContext.Provider value={backdrop}>{children}</BackdropContext.Provider>
        )}
        </ToolbarOrientation.Provider>
      </SizeScopeContext.Provider>
    </BaseToolbar.Root>
  );
}

/**
 * A group of controls that belong together, drawn as one capsule.
 *
 * The group has the same height as a button beside it. Buttons inside the group are `quiet`
 * by default. The group takes its size from the toolbar. To group controls without a capsule,
 * use a `Flex`.
 */
export type ToolbarGroupProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
  /** Turns every control in the group off at once. */
  disabled?: boolean;
  /**
   * Set `backdrop` when content passes behind the group. The group then uses the theme's
   * material. If you don't set it, the group follows the nearest `<Box backdrop>` or the toolbar's
   * `backdrop`.
   */
  backdrop?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * A capsule holding controls that belong together.
 *
 * It is a well, so a button inside it rests quiet: two fills stacked read as one thing with a
 * lighter thing inside it. It always draws — a group that painted nothing would be a `Flex`
 * wearing a part's name — and it is the pane for glass, scoping its subtree so one backdrop
 * filter serves the whole capsule.
 */
export function ToolbarGroup({ className, backdrop, ref, children, ...props }: ToolbarGroupProps) {
  const size = useSize();
  // §10 — the group is the PANE here, and the only one. It expresses the theme's material where
  // a backdrop exists and resolves solid everywhere else (selectivity), and it SCOPES its
  // subtree, so a button inside a glass group resolves on-glass: the veil's alpha, no second
  // backdrop-filter, no second lens. One glass per stack, structurally — which also means a
  // band whose loose controls each state `backdrop` does not double up inside a group.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  const lensRef = useLensRef<HTMLDivElement>(material, ref);
  const overflow = React.use(InOverflow);

  /* IN THE MENU IT IS A GROUP, which is the same fact in the other room: a capsule says these
     controls belong together, and so does a menu group. Everything the capsule IS — the well,
     the height ladder, the hosted inset, the glass — is how that fact is drawn in a ROW, and
     none of it means anything in a list of rows. The children are unchanged and answer for
     themselves one line down. */
  if (overflow) {
    return (
      <MenuGroup {...(className === undefined ? {} : { className })}>
        {children}
      </MenuGroup>
    );
  }

  return (
    <BaseToolbar.Group
      ref={lensRef}
      data-size={size}
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
      className={
        className ? `kui-control kui-toolbar-group ${className}` : "kui-control kui-toolbar-group"
      }
      {...props}
    >
      {/* `children` is destructured rather than left in the spread: JSX children do win over
          a spread `children` prop, but relying on that is a mechanism nobody wrote down. */}
      <GlassScope material={material}>
        <InToolbarGroup.Provider value>{children}</InToolbarGroup.Provider>
      </GlassScope>
    </BaseToolbar.Group>
  );
}

/* ── The overflow (§45, 2026-09-08) ───────────────────────────────────────────────────────── */

/**
 * A cluster of controls that moves into a `⋯` menu when the row runs out of room.
 *
 * The controls move into the menu from the end of the cluster. A `ToolbarButton` shows as a
 * menu item there, and uses its `aria-label` as its text. Use `useToolbarOverflow()` in your
 * own components to render a different form in the menu.
 */
export type ToolbarOverflowProps = ComponentRefusals &
  Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
    /** The accessible name of the `⋯` button. The default is `More`. */
    label?: string;
  /** The controls in the cluster, in order. The controls that don't fit show in the `⋯` menu. */
  children?: React.ReactNode;
    ref?: React.Ref<HTMLDivElement>;
  };

/**
 * A cluster that collapses into a `⋯` menu when the row runs out of room.
 *
 * It measures — on mount and on resize, never at interaction time — because how full a band is
 * depends on what the current screen put in it, which no breakpoint can state. Controls that do
 * not fit render inside the menu instead, where a `ToolbarButton` draws itself as a menu row.
 */
export function ToolbarOverflow({
  label = "More",
  className,
  children,
  ref,
  ...props
}: ToolbarOverflowProps) {
  const items = React.Children.toArray(children);
  const count = items.length;

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  /* One natural width per child, measured while that child was in the row. Hiding a child
     erases the very number that decides whether to bring it back, so the cache is the whole
     mechanism rather than an optimisation. */
  const widths = React.useRef<number[]>([]);
  const triggerWidth = React.useRef(0);
  const [shown, setShown] = React.useState(count);
  /* Bumped by the resize observer. State rather than a direct call so the measurement stays in
     one place — the layout effect below — instead of existing twice. */
  const [tick, setTick] = React.useState(0);

  /* A different set of children is a different set of widths. Measured lengths keyed by index
     would otherwise survive a navigation that changed what the band holds. */
  const previousCount = React.useRef(count);
  if (previousCount.current !== count) {
    previousCount.current = count;
    widths.current = [];
  }

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /* The row's children, in order, are the visible SEATS followed by the trigger — one seat per
       child, drawn or not, so position identifies a child exactly and nothing has to carry a
       marker for the measurement to find. */
    const kids = Array.from(root.children) as HTMLElement[];
    const visible = Math.min(shown, count);
    for (let i = 0; i < visible; i++) {
      const el = kids[i];
      if (el) widths.current[i] = el.offsetWidth;
    }
    const trigger = kids[visible];
    if (trigger) triggerWidth.current = trigger.offsetWidth;

    const gap = Number.parseFloat(getComputedStyle(root).columnGap) || 0;
    const available = root.clientWidth;

    let total = 0;
    let counted = 0;
    for (let i = 0; i < count; i++) {
      const width = widths.current[i];
      /* A child nobody has ever seen in the row has no width, and guessing one would be a
         decision made out of nothing. It cannot happen after the first pass, where everything
         starts visible. */
      if (width === undefined) return;
      /* A seat that drew nothing is out of the flex layout entirely, so it spends no gap either.
         Counting one for it would reserve room for a control that does not exist. */
      if (width === 0) continue;
      total += width + (counted > 0 ? gap : 0);
      counted += 1;
    }

    let next = count;
    if (total > available) {
      /* The trigger only exists once something is hidden, so the first pass into this branch has
         no measurement of it. The row's own height is the estimate — an icon-only control is
         about as wide as the row is tall — and the pass that follows this state change corrects
         it exactly, before paint. Nothing oscillates: whether the trigger exists at all is
         decided by `total`, which is arithmetic over widths that never move. */
      const budget = available - (triggerWidth.current || root.clientHeight) - gap;
      let used = 0;
      let drawn = 0;
      next = 0;
      for (let i = 0; i < count; i++) {
        const own = widths.current[i]!;
        /* An empty seat is always "shown": it costs nothing and hiding it would put a child that
           draws nothing into the menu, where it would draw nothing either. */
        if (own > 0) {
          const width = own + (drawn > 0 ? gap : 0);
          if (used + width > budget) break;
          used += width;
          drawn += 1;
        }
        next += 1;
      }
    }
    if (next !== shown) setShown(next);
  }, [shown, count, tick]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setTick((n) => n + 1));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const attach = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  return (
    <div
      ref={attach}
      className={className ? `kui-toolbar-overflow ${className}` : "kui-toolbar-overflow"}
      {...props}
    >
      {items.slice(0, shown).map((item, i) => (
        // THE SEAT IS THE INDEX, not an identity: it is a position in the row, and it must stay
        // put when the child inside it draws nothing. (No disable comment, because this config
        // ships no `react/no-array-index-key` rule to disable — an unknown rule name is itself
        // a lint error, which is how the comment came to fail the build it was meant to quiet.)
        <div key={i} className="kui-toolbar-overflow-seat">
          {item}
        </div>
      ))}
      {shown < count ? (
        <Menu>
          <MenuTrigger
            render={
              <ToolbarButton iconOnly aria-label={label}>
                {/* Self-keyed, the way `BreadcrumbEllipsis` draws its own: the second member of a
                    shape states it and the third promotes it. Filled dots, so there is no stroke
                    for the icon grid to price. */}
                <svg viewBox="0 0 16 16" aria-hidden xmlns="http://www.w3.org/2000/svg">
                  <circle cx="3.25" cy="8" r="1.25" fill="currentColor" />
                  <circle cx="8" cy="8" r="1.25" fill="currentColor" />
                  <circle cx="12.75" cy="8" r="1.25" fill="currentColor" />
                </svg>
              </ToolbarButton>
            }
          />
          <MenuContent align="end">
            <InOverflow.Provider value>{items.slice(shown)}</InOverflow.Provider>
          </MenuContent>
        </Menu>
      ) : null}
    </div>
  );
}

/**
 * A `Button` that joins the toolbar's keyboard navigation. It takes every `Button` prop.
 *
 * It is `medium` by default, and `quiet` inside a `ToolbarGroup`. Set `emphasis` to override
 * both. In a floating header, set `backdrop` so that the button uses the theme's material.
 */
export type ToolbarButtonProps = ComponentRefusals & ButtonProps;

/**
 * A `Button` enrolled in the toolbar's keyboard, and the reason it cannot just be a `Button`.
 *
 * A plain button in a toolbar is its own tab stop, so a row of six is six stops. This one joins
 * the composite instead. It rests quiet inside a `ToolbarGroup` and at the system's rung outside
 * one, and a stated `emphasis` beats both. It throws outside a toolbar rather than degrading.
 */
export function ToolbarButton(props: ToolbarButtonProps) {
  const render = (props as { render?: RenderElement }).render;
  // Quiet inside a capsule, the system's rung outside one — and a stated value beats both.
  const hosted = React.use(InToolbarGroup);
  // Both contexts are read before either branch: a hook that runs on one path and not the other
  // is the oldest way to break a component.
  const overflow = React.use(InOverflow);
  const orientation = React.use(ToolbarOrientation);
  const emphasis = props.emphasis ?? (hosted ? ("quiet" as const) : undefined);

  // In a column, Up and Down belong to the toolbar. A menu trigger rendering this hands its
  // open-on-arrow handler in through `onKeyDown`; those two keys skip it and bubble to the
  // toolbar's own navigation instead.
  const incomingKeyDown = (props as { onKeyDown?: React.KeyboardEventHandler<HTMLElement> }).onKeyDown;
  const onKeyDown =
    orientation === "vertical" && incomingKeyDown
      ? (event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") return;
          incomingKeyDown(event);
        }
      : incomingKeyDown;

  /* IN THE MENU IT IS A ROW, and it already carries everything a row needs. An icon-only control
     in a band says its name in `aria-label` because there is nowhere else to put it — which is
     exactly the words a menu row wants — and its children are the artwork, which is exactly what
     `leading` holds. So nothing is written twice and nothing is converted: the same element
     answers where it is.

     What does NOT come across is every prop that prices a BOX. `iconOnly`, `emphasis`,
     `bordered` and `loading` are the button's rungs and geometry, and a row has none of them; a
     menu ranks by order and wording (menu.tsx says so on `MenuItem`). `tone` crosses only where
     both vocabularies agree, which is `destructive` — the one meaning a row may carry. */
  if (overflow) {
    const { children, disabled, onClick, className, style, tone } = props as ButtonProps & {
      onClick?: React.MouseEventHandler<HTMLElement>;
    };
    const words = (props as { "aria-label"?: string })["aria-label"];
    return (
      <MenuItem
        leading={children}
        {...(render === undefined ? {} : { render })}
        {...(disabled === undefined ? {} : { disabled })}
        {...(onClick === undefined ? {} : { onClick })}
        {...(className === undefined ? {} : { className })}
        {...(style === undefined ? {} : { style })}
        {...(tone === "destructive" ? { tone } : {})}
      >
        {words}
      </MenuItem>
    );
  }

  return (
    <BaseToolbar.Button
      // WHAT THE RENDERED ELEMENT ACTUALLY IS, asked rather than assumed (2026-09-06, found in
      // `pnpm dev` — the command this repo's history says nobody runs). It shipped as a flat
      // `false`, which tells Base UI the element is NOT a native button, so it applies the
      // non-native kit: `role="button"`, `aria-disabled`, a tab index. Our Button renders a real
      // `<button>` unless a `render` says otherwise, so the flat value was a lie in the common
      // case — a control announcing `role="button"` on top of being one, which is the 2026-08-06
      // Button-as-link finding arriving from the other side.
      //
      // `rootsInButton` is the question already written for this (system/render.ts): it follows
      // a chain of `render` props to the element that will exist, and answers false for an
      // anchor. Base UI warns loudly on the mismatch, and warned here — every law in this file
      // was green throughout, because none of them read what the element ANNOUNCES.
      nativeButton={render === undefined ? true : rootsInButton(render)}
      render={
        <Button
          {...(props as ButtonProps)}
          {...(emphasis ? { emphasis } : {})}
          {...(onKeyDown ? { onKeyDown } : {})}
        />
      }
    />
  );
}

/** A thin line between two clusters in a toolbar. Its direction is always opposite to the toolbar's. */
export type ToolbarSeparatorProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<typeof Separator>, "orientation">;

/**
 * A hairline between two clusters, announced as a separator inside the toolbar's keyboard.
 *
 * It is the system's `Separator`, so it resolves the same colour and thickness as every other
 * rule on the page.
 */
export function ToolbarSeparator(props: ToolbarSeparatorProps) {
  return <BaseToolbar.Separator render={<Separator {...props} />} />;
}

/**
 * The title of the toolbar, at the start of the row.
 *
 * If you give it children, it shows them. If you don't, it shows the title of the `Page` in the
 * same panel after that title scrolls out of view. With no words to show, it renders nothing.
 */
export type ToolbarTitleProps = ComponentRefusals & {
  /** The title text. Leave it out to show the title of the `Page` in this panel. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** The id of the title, so that you can point `aria-labelledby` at it. */
  id?: string;
};

/**
 * What the row is about, at the leading edge where macOS puts a document's name.
 *
 * Given no children it MIRRORS the page's title — the large heading that has scrolled out of
 * view — which is the whole reason a band and a page know about each other. Given children it
 * says those instead. Its type step is the row's `size`, one step above the body the system
 * owns, so a title and a message can never drift apart.
 */
export function ToolbarTitle({ className, children, style, id }: ToolbarTitleProps) {
  const size = useSize();
  const store = usePageScope();
  const pageTitle = usePageTitle(store);
  const mirrorRef = usePageMirror(store);
  const mirroring = children === undefined || children === null;
  const words = mirroring ? pageTitle : children;
  if (words === null || words === undefined) return null;
  return (
    <Text
      // The step the SYSTEM owns for a size it also owns (§15, §25): a band's title is one
      // line the component arranges, not a composition somebody built, so it can neither rest
      // at Text's own 3 nor take a prop. It is one step ABOVE the owned body step, which is
      // what a title has over a message — derived, so the two ladders cannot drift.
      size={BAND_TITLE_STEP[size]}
      weight="medium"
      className={className ? `kui-toolbar-title ${className}` : "kui-toolbar-title"}
      {...(style === undefined ? {} : { style })}
      {...(id === undefined ? {} : { id })}
      {...(mirroring ? { "data-mirror": "", ref: mirrorRef } : {})}
    >
      {words}
    </Text>
  );
}
