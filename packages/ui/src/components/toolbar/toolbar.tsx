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
 * Toolbar (§45) — the row where an app's controls live.
 *
 * WHY IT IS A COMPONENT AND NOT A `Flex`. Base UI's Toolbar announces `role="toolbar"` and runs
 * a roving tab stop: the whole row is ONE stop and the arrow keys move inside it, which is what
 * every platform toolbar does and what a row of eleven separately-tabbable icon buttons is not.
 * That is a non-visual forcer (§10's criterion), and it is the same reason `Field` exists.
 *
 * WHAT IT STATES is the rhythm — the row's height, its alignment, the gap between clusters, and
 * the index its controls take. What it does NOT state is which controls sit at which end: that
 * is what those controls MEAN, and it is the app's to say (`ComposerRow`'s sentence, §30). So a
 * caller clusters with `Flex` and the row spaces the clusters; one cluster sits at the start,
 * two split, three read leading / centre / trailing.
 *
 * IT SUPPLIES THE SIZE (§4, §28). A toolbar is a unit a person points at and sizes as one
 * thing — Field's argument exactly — so the index reaches every control in the row through
 * `SizeScopeContext`, an explicit prop on any of them still wins, and a `Field` nested inside
 * still beats the row for its own control. What it supplies is ONE STEP ABOVE the app's rest
 * (`BAND_STEP`, system/size.ts): a band holds icon-only controls at the edge of the window, and
 * a default app's band is 3 without a call site saying so.
 *
 * REFUSED: `tone`, `emphasis` and `material`. A toolbar is a ROW, not a pane — it paints
 * nothing of its own, so there is no fill to rank or to make translucent, and the surface it
 * sits in (a `ShellPaneHeader`, a Card, a `ShellHeader`) is what answers the theme. A group
 * inside it is the one thing here that draws a box, and it does not take them either.
 */
export type ToolbarProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
  /**
   * The index every control in the row takes unless it states its own. Defaults to ONE STEP
   * ABOVE the app's own rest — `3` in a default app — because a band holds icon-only controls
   * at the edge of the window and a form holds labelled ones. `BAND_STEP` (system/size.ts)
   * carries the derivation and the reason it is a derivation rather than a literal.
   */
  size?: Size;
  /**
   * The axis the arrow keys walk, and the axis the row lays out on. `vertical` is a real
   * toolbar — an edge strip of tools — and it costs no designed value: the same tokens with
   * the axes swapped, which is Separator's own argument for taking the prop Slider refuses.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Marks the row as a region where content passes BEHIND its controls, so every glass-capable
   * one inside resolves the theme's material instead of solid. Said once for the row rather
   * than on every button (2026-09-06, Kushagra: "backdrop of toolbar should suggest items inside
   * it get backdrop").
   *
   * IT DOES NOT MAKE THE ROW GLASS, and the two are different things rather than a compromise.
   * A material makes a component's own FILL translucent and this component has no fill — which
   * is why `material` stays refused. `backdrop` says something TRUE ABOUT THE SPACE the row
   * occupies, which is exactly what `<Box backdrop>` says and exactly what `float` on a
   * `ShellPaneHeader` makes true. The row still paints nothing; it just stops every control in
   * it from having to repeat the same fact.
   *
   * A control's own prop still wins, and `backdrop={false}` marks the row plain again inside a
   * region that is not. Layout is untouched: this is a React context, not a style.
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
        {/* The region mark rides context, not the DOM — Box's own mechanism, for Box's own
            reason: components resolve their material in React, so an attribute here would be a
            second and unread home for one fact. Nothing is provided when nothing is said, so a
            toolbar inside a marked region keeps that region's answer. */}
        {backdrop === undefined ? (
          children
        ) : (
          <BackdropContext.Provider value={backdrop}>{children}</BackdropContext.Provider>
        )}
      </SizeScopeContext.Provider>
    </BaseToolbar.Root>
  );
}

/**
 * A capsule holding controls that belong together (§45) — the formatting cluster in a macOS
 * toolbar, the alignment set in an editor.
 *
 * It is the segmented control's TRACK with nothing chosen in it (§26): an edgeless well on the
 * control height ladder, hosting its children by §4's rule — the hosted box is the group minus
 * `--toolbar-group-inset` on every side, so the buttons inside stand level with a Button beside
 * the group and the group stands level with both.
 *
 * IT ALWAYS DRAWS. A group that drew nothing would be a `Flex` wearing a part's name, which is
 * the shape `Breadcrumb` and `ComposerRow` both refused — so clustering without a capsule is
 * exactly a `Flex`, and this is what you reach for when the controls should read as one object.
 *
 * It takes no `size`: the group and the buttons in it both read the row's index, which is what
 * makes "the group is as tall as the button beside it" true by construction rather than by
 * two call sites agreeing.
 */
export type ToolbarGroupProps = ComponentRefusals & Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
  /** Turns every control in the group off at once. */
  disabled?: boolean;
  /**
   * Says content passes behind this group, so it shows the theme's material instead of resolving
   * solid. A `<Box backdrop>` region answers it for a whole band; this is the one-off escape.
   *
   * THE ROW REFUSES THIS AND THE GROUP TAKES IT, which is one rule rather than two (§10,
   * 2026-09-06, Kushagra: "I like how a toolbar group looks, it looks similar to a medium
   * emphasis button, so therefore it needs to support backdrop also"). A material makes a
   * component's own FILL translucent, so it is only expressible on something that has one: the
   * toolbar is a row and paints nothing, and this is the one part in it that draws a box. It is
   * the segmented control's track with nothing chosen in it, and that component has taken the
   * prop since materials became selective.
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

/**
 * One control in the row, registered with the toolbar's keyboard (§45).
 *
 * It exists for that registration alone: our `Button` cannot enrol itself in Base UI's composite,
 * so a plain Button in a toolbar is a second tab stop and an arrow key never reaches it. Every
 * Button prop passes through, `render` included — so a toolbar item that navigates is
 * `<ToolbarButton render={<a href="…"/>}>`, and one that opens a menu is a `MenuTrigger`
 * rendering this.
 *
 * IT RESTS WHERE A BUTTON RESTS — `medium` — UNLESS IT IS IN A GROUP, where it rests `quiet`.
 * The group is a well and a control in a well is a mark ON it: two fills stacked read as one
 * thing with a lighter thing inside it (2026-09-06, Kushagra: "not in the toolbar group, because
 * toolbar group has a bg now"). Neither is a call site's job to remember — the group says where
 * its children are, the button reads it, and a stated `emphasis` beats both.
 *
 * The row's own rung (2026-09-06, Kushagra: "make sure we prefer a medium
 * emphasis button whenever, quiet and loud are for exceptional cases"). It defaulted to `quiet`
 * on the argument that a row of filled boxes has no focal point, which is true of a row of
 * WORDS and was never true of the icon-only controls a band actually holds: with no fill, an
 * icon in a band is a glyph floating on the content behind it rather than a thing to press.
 * Deleting the override is also one fewer special case — `medium` is the rung every other
 * control in the system rests at, and a component that quietly re-ranks itself is the kind of
 * exception this system spends its budget removing. A row that genuinely wants bare glyphs says
 * `emphasis="quiet"` per control, which is the escape it always was.
 *
 * IN A FLOATING BAND, STATE `backdrop`. `float` on a `ShellPaneHeader` means the row leaves flow
 * and the document passes underneath it, so the only thing between a paragraph and this button
 * sliding over it is the material on the button — the row paints nothing and cannot supply one.
 * It costs nothing until the app chooses a glass material (§10: expression is placement), and a
 * band that is pinned rather than floating wants none, because nothing passes behind it.
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
  const emphasis = props.emphasis ?? (hosted ? ("quiet" as const) : undefined);
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
      render={<Button {...(props as ButtonProps)} {...(emphasis ? { emphasis } : {})} />}
    />
  );
}

/**
 * The rule between two clusters (§45). Base UI's part for the announcement, our `Separator` for
 * the paint — so a toolbar's rule is the same hairline a Separator draws anywhere else, and its
 * orientation is the toolbar's, flipped: a rule across a horizontal row is a vertical line.
 */
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
 * What the row is about (§45, §46) — the title cluster in the band.
 *
 * IT SITS AT THE LEADING EDGE, where macOS puts a document's name — centred for an hour on
 * 2026-09-06 and reversed the same day (Kushagra: "lets move title to left again, but the title
 * group should have more spacing between action group"). What survived the reversal is the
 * finding underneath it, which was never about centring: a title is a different KIND of thing
 * from the controls beside it, so the row states one step more air around this part than it
 * states between controls. That is written on the part rather than on the row's own gap, which
 * is what lets it sit either as a direct child of the `Toolbar` or inside a leading cluster —
 * a band is written `<Flex>{toggle}{back}{title}</Flex>` as often as it is written flat, and
 * the air has to reach inside the cluster to be worth anything.
 *
 * TWO WAYS TO GET ITS WORDS, and they are the same part because they are the same thing. Given
 * children it says them, which is the permanent title of a pane that has no page under it (the
 * app's name in a `ShellHeader`, "Notes" over a list). Given none, it MIRRORS the `Page` in the
 * same pane: invisible while that page's own large title is on screen, and fading in the moment
 * it scrolls up behind the band. That is the platform's large-title behaviour, and it is the
 * whole reason this part is not just a `Text`.
 *
 * With nothing to say it renders NOTHING — not an empty box, which would still spend the row's
 * gap and leave a hole between two clusters.
 */
export type ToolbarTitleProps = ComponentRefusals & {
  /** The words. Omit them to mirror the `Page` in this pane. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** So a caller can point `aria-labelledby` at the row's own title. */
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
