"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { unwrapLazy } from "../../system/render.ts";

export type TabsProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseTabs.Root>,
  // `orientation` is REFUSED rather than passed through (2026-08-26, audit) — Slider's own
  // sentence one component over, and here it was passing through by omission rather than by
  // decision. Nothing in this package answers `vertical`: tabs.css has no `[data-orientation]`
  // arm at all, the list is a flex ROW with the hairline on its block-end, and the rule is
  // drawn by two INLINE insets against a `--tab-rule` block-size. Base UI would still switch
  // the arrow keys to Up/Down and stamp `data-orientation="vertical"`, so the prop announced a
  // layout the stylesheet has never had — a horizontal bar with vertical keyboard navigation.
  // A vertical bar is a designed geometry (a rail down the inline edge, the rule on it, its
  // own inset), and it ships the day something forces it, as its own set — never as undesigned
  // numbers today.
  "orientation"
>;

/* ── Size context: the list answers `size` and every tab stamps it (§4).
      Menu's own mechanism (2026-08-09), for Menu's own reason: the size join keys
      `[data-size]` per ELEMENT, so a tab that never carries the attribute resolves no cell at
      all and its `min-height` falls back to `auto`. One provider, so a bar cannot hold two
      indices; the stamp is per element, because that is where the cascade reads it. */
const TabsSizeContext = React.createContext<Size>("2");

export type TabsListProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseTabs.List>,
  "className"
> & {
  /**
   * The control height ladder, set on the list and not on the tabs.
   *
   * It is SegmentedControl's decision one component over, and the thing a reader gets wrong exactly
   * once: the bar carries the index, and each tab derives its box from that bar and states no index
   * of its own. A mixed-size bar is therefore not expressible, which is right, and asking every tab
   * to repeat the number is an invitation to disagree.
   *
   * It sits here rather than on `Tabs` because the list is the part that has a box. The root owns
   * no layout at all.
   */
  size?: Size;
  /** Dresses the bar. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
};

export type TabsTabProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>,
  // `tone` and `emphasis` are refused for TextField's reason (§11): a bar where one tab is
  // louder than the next names nothing — the ACTIVE one is already the loud one, and that is
  // a state, not a rung a call site picks. `className` is re-declared below rather than
  // omitted-and-lost.
  "className"
> & {
  /** Dresses the tab. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
};

export type TabsPanelProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>,
  "className"
> & {
  className?: string;
};

/**
 * Tabs (§26) — the tab bar, on Base UI's Tabs.
 *
 * **The part vocabulary diverges from shadcn/ui deliberately.** Menu, Select, Dialog and
 * AlertDialog all adopted shadcn's names with credit, and shadcn's tabs are
 * `Tabs / TabsList / TabsTrigger / TabsContent`. `TabsTrigger` is the one that cannot come
 * across: in this package a *trigger* is the thing that opens a floating layer — MenuTrigger,
 * SelectTrigger, DialogTrigger, AlertDialogTrigger — and a tab opens nothing. `TabsPanel`
 * follows the ARIA name its own role announces. The shape of the composition is shadcn's.
 *
 * The root owns no layout and no appearance: it renders Base UI's div and nothing else, so
 * `render={<Stack gap="4"/>}` is the sanctioned way to make the group BE the layout —
 * RadioGroup's own sentence one component over.
 */
export function Tabs(props: TabsProps) {
  return <BaseTabs.Root {...props} />;
}

/**
 * The bar the tabs sit in, and the one part that carries the size (§4, §26).
 *
 * `size` is on the LIST rather than on each tab, which is Menu's own reversal (Kushagra,
 * 2026-08-09): a bar of tabs at mixed sizes is not a thing anyone means, and asking every
 * tab to repeat the index is an invitation to disagree. It stamps `data-size` and every tab
 * inherits the join's cells through the cascade.
 *
 * It renders Base UI's `Tabs.Indicator` as its LAST child, and that element is deliberately
 * not exported. The indicator is structure, not API: it is what a moving rule needs to exist
 * at all (§8's motion pass owns whether it travels), and a consumer who has to remember to
 * place it is a consumer who will forget. `renderBeforeHydration` is on — without it the
 * rule is absent until React hydrates, which on a server-rendered page is a visible flash of
 * a bar with no active tab.
 */
export function TabsList({ size = "2", className, children, ...props }: TabsListProps) {
  return (
    <BaseTabs.List
      className={className ? `kui-tabs-list ${className}` : "kui-tabs-list"}
      data-size={size}
      {...props}
    >
      <TabsSizeContext.Provider value={size}>{children}</TabsSizeContext.Provider>
      {/* Stamped accent, the binary controls' pattern (§11): the rule needs a family to
          resolve --tone-solid against, and accent is what the system assigns a selected
          thing. The tabs themselves never read it — they wear the foreground roles. */}
      <BaseTabs.Indicator className="kui-tab-rule" data-tone="accent" renderBeforeHydration />
    </BaseTabs.List>
  );
}

/**
 * One tab (§26) — a control on the height ladder wearing the quiet rung.
 *
 * Quiet is §11's own row for the family, and it is the rung that makes a bar of tabs read as
 * a bar rather than as a row of buttons: bare at rest, entering the ramp at hover. What marks
 * the active one is not a louder fill but the RULE beneath it plus the ink stepping from
 * muted to full — the emphasis ladder resolved as foreground roles, which is the type
 * family's resolution of the axis (§15), not the control family's.
 *
 * A tab as a link needs `nativeButton={false}` alongside `render`, which is Base UI's own
 * requirement and the same trap Button records: without it the anchor is announced as a
 * button and Space stops activating it.
 */
export function TabsTab({ className, render, nativeButton, ...props }: TabsTabProps) {
  const size = React.use(TabsSizeContext);
  // An element created in a Server Component crosses the RSC boundary as a lazy node, so it is
  // unwrapped before anything reads `.type` — Button's own 2026-08-07 fix, which was dev-only
  // and therefore invisible to `next build`.
  // `render` may be a callback here (Base UI's other form), which has no element to inspect;
  // only an element can be a lazy RSC node, and only an element can be an anchor.
  const target =
    render === undefined || typeof render === "function"
      ? render
      : (unwrapLazy(render as never) as typeof render);
  const targetType = typeof target === "object" && target !== null ? target.type : undefined;
  return (
    <BaseTabs.Tab
      className={className ? `kui-control kui-tab ${className}` : "kui-control kui-tab"}
      data-size={size}
      data-emphasis="quiet"
      // NEUTRAL, stamped (audit 2026-08-19, D3). Without it a tab had no hover and no press
      // at all: the quiet rung sources both from `--tone-soft`, which exists only inside a
      // `[data-tone]` block, so the declaration was invalid at computed-value time and fell
      // to transparent — measured byte-identical at rest, hovered and pressed, while a quiet
      // Button in the same tree stepped. And worse than absent, it was AMBIENT: `--tone-*`
      // inherits, so the same bar dropped inside a `destructive` section hovered red. Tabs
      // refuse `tone` as an API precisely so a bar cannot say two things at once; the stamp
      // is what makes the refusal true rather than merely unstated.
      data-tone="neutral"
      // Base UI's own requirement for a tab that is not a native button, and the trap this
      // package has closed four times (button.tsx, menu.tsx, dialog.tsx, alert-dialog.tsx).
      // Left to default, `<TabsTab render={<a href/>}>` emitted `type="button"` on an anchor
      // — `button` is not a MIME type — and Space stopped activating the tab (audit D9).
      nativeButton={nativeButton ?? (targetType === undefined || targetType === "button")}
      render={target}
      {...props}
    />
  );
}

/**
 * The panel a tab reveals (§26). Base UI owns the wiring — `aria-labelledby` back to its tab,
 * the hidden attribute, the roving tabindex that makes the panel itself focusable so a
 * keyboard user can reach content that holds no focusable child.
 *
 * It paints nothing. A panel is a region of the page, and a region that draws its own box is
 * a Card — the anatomy criterion's answer everywhere else in this system. All it owes is the
 * focus ring it earns by being focusable.
 */
export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      className={className ? `kui-tab-panel ${className}` : "kui-tab-panel"}
      {...props}
    />
  );
}
