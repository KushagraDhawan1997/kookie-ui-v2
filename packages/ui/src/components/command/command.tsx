"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import { Autocomplete } from "@base-ui/react/autocomplete";
import * as React from "react";
import { createPortal } from "react-dom";

import type { Size, SlotName } from "../../system/axes.ts";
import { filled, unwrapLazy, type RenderElement } from "../../system/render.ts";
import { rowProps } from "../../system/rows.ts";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  type DialogProps,
  type DialogTriggerProps,
  type OverlayOpenChangeDetails,
  type OverlayOpenChangeReason,
} from "../dialog/dialog.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { useLensRef } from "../../system/refraction.tsx";
import { useStatedFlight } from "../../system/floating.tsx";
import { GlassScope, useMaterial, themeDefaults } from "../../theme/theme.tsx";
import { Text, type TypeSize } from "../text/text.tsx";
import { useAppSize } from "../../system/size.ts";

/* ── Contexts: the size, and the items the content hands to Base UI ────────────────────── */

/* `themeDefaults.size`, never a literal: this default is only reachable in an invalid tree
   (a part outside its root), and nine private copies of the number 2 is nine claims about a
   rest that the app can now move (2026-09-05). */
const CommandSizeContext = React.createContext<Size>(themeDefaults.size);
const CommandItemsContext = React.createContext<readonly unknown[] | undefined>(undefined);

/**
 * How a row closes the palette (2026-09-05, Kushagra: "command currently doesnt go away when I
 * click on an item").
 *
 * It is a context rather than a prop on the row because the state lives on `Command` and the row
 * is several parts below it, and it is the COMPONENT's job rather than the call site's: a palette
 * is answered by running one row, so a row that runs and leaves the panel standing has not
 * finished. It shipped needing `onClick={() => setOpen(false)}` at every call site, which is a tax
 * the docs site's own search proved nobody pays — its rows navigate and the panel stayed open over
 * the page they navigated to, while the example beside it closed only because it wrote the line.
 * `Command`'s own JSDoc had promised the reason "a row being run" since the day it shipped.
 */
const CommandCloseContext = React.createContext<((event: Event) => void) | null>(null);

/**
 * WHERE THE EMPTY STATE GOES (2026-09-05, Kushagra: "when empty state comes, the shape is again
 * different… make the container same").
 *
 * It was a THIRD pane in the column standing where the results pane had been, and two panes
 * standing in for one thing cannot agree by construction — measured, a 64.52px corner over 24px of
 * inset against the results pane's 33.25 over 4. There is one pane, and the empty state is what it
 * shows when nothing matched: the file's own comment had said exactly that since the day it was
 * written, and the DOM said otherwise.
 *
 * The caller still writes `<CommandEmpty>` beside `<CommandList>` — the shadcn arrangement, and the
 * one every palette's call site is written in — so the part is PLACED rather than re-parented by
 * the app: `CommandList` publishes the node inside its pane and `CommandEmpty` renders into it. A
 * React portal keeps the context, which is what `Autocomplete.Empty` needs to stay Base UI's live
 * region, and puts the element where the box it belongs to actually is.
 */
const CommandSlotContext = React.createContext<{
  slot: HTMLElement | null;
  setSlot: (node: HTMLElement | null) => void;
} | null>(null);

/**
 * THE SEARCH BAR'S TYPE, indexed by the palette's own size (§4, §44 — 2026-09-05, Kushagra:
 * "this search bar needs to be different than text field, it needs more spacing… this isn't an
 * inline element… so this needs its own sizing, the font size was never the issue").
 *
 * It shipped for an afternoon as `size + 1` on the CONTROL ladder — the bar wore `kui-field` and
 * borrowed a text input's cell one step up. That is the wrong mechanism twice over. A palette's
 * search bar is not an inline control that happens to be large: it is a PANE, so its inset comes
 * from the surface join like the results pane's and the two read as one material at one index.
 * And a bump is an exception dressed as a rule — it makes `size="3"` mean something it does not
 * mean anywhere else, which is exactly what a call site was reaching for `size="3"` to get.
 *
 * So the box is the SURFACE ladder (no map at all — `data-size` on a `.kui-surface`, the same
 * attribute the results pane stamps) and only the type needs a table, because a bar you type into
 * reads larger than the rows it filters. One step per index, the `OWNED_*_STEP` genus (§30's
 * ownership rule: the component owns this text, so the index reaches it).
 */
const SEARCH_STEP: Record<Size, TypeSize> = { "1": "3", "2": "4", "3": "5", "4": "6" };

/**
 * THE RESULTS BLOCK STANDS ONE STEP ABOVE THE PALETTE (§4, §21, §44 — 2026-09-06, Kushagra:
 * "I have a feeling as I use it, that the list of command should also use a step + 1. We're
 * doing this mapping with Toolbar, we have a pattern already").
 *
 * The reason is the bar's own, one block over. A palette is not a list you scan while doing
 * something else; it is the one object on the screen, opened over a dimmed app and read from a
 * distance you did not choose. `SEARCH_STEP` already says that about the line you type into, and
 * a menu-scale row under a bar set two steps above it read as a footnote to its own query.
 *
 * DERIVED, never a stated table, which is `BAND_STEP`'s whole argument in `system/size.ts`: a
 * palette's rows are on the very ladder `Theme size` prices, so a flat literal would put the
 * palette and the app on one ladder disagreeing for no reason a reader can see — at
 * `<Theme size="4">` a fixed 3 makes the rows in the palette SMALLER than the rows in the app
 * behind it. Stated against the index, the two can never invert. It ends where the ladder ends,
 * for the same reason a band does: standing level is the right answer when there is no rung left.
 *
 * NOT `BAND_STEP` itself, though the four cells are identical. That table's reason is a chrome
 * band holding unlabelled controls at the edge of the window, which is not this and which would
 * make either component's reason unreadable from the other's name — the `segmentInset` /
 * `switchInset` call (§26), where the second member self-keys and a third would promote.
 *
 * WHAT TAKES IT IS THE PANE AS WELL AS THE ROWS, and that is forced rather than chosen. §22's
 * concentric corner is the ROW's corner plus the pane's own inset, read off the pane's stamped
 * index, and `--kui-sf-row-px` publishes the rows' text inset to the pane from the same place —
 * so a pane left at the palette's index would hug rows it is not shaped for and align a caption
 * to a vertical no row stands on. The pane's INSET does not move with it: a floating pane's
 * padding is `max(--floating-p, the ring's reach)`, which answers a clipping rule rather than a
 * size, so what the stamp really moves is the two numbers that describe the rows.
 */
export const ROW_STEP: Record<Size, Size> = { "1": "2", "2": "3", "3": "4", "4": "4" };

/**
 * The two panes' shared surface wiring (§10). Each of them is a pane in its OWN right since
 * 2026-09-05 — the popup between them paints nothing — so each resolves the theme's material,
 * mints its own lens for its own box, and scopes its subtree so nothing inside stacks a second
 * sheet of glass. They are SIBLINGS, not a nest, which is why two of them is not two panes deep.
 */
function usePane() {
  const material = useMaterial({ backdrop: true });
  const ref = useLensRef<HTMLDivElement>(material, undefined);
  return { material, ref } as const;
}

/**
 * Why the palette closed. The overlay family's own reasons plus one this component can produce
 * and no other overlay can: a row was run.
 */
export type CommandOpenChangeReason = OverlayOpenChangeReason | "item-press";
export type CommandOpenChangeDetails = Omit<OverlayOpenChangeDetails, "reason"> & {
  reason: CommandOpenChangeReason;
};

export type CommandProps = ComponentRefusals & {
  /**
   * The size step of the palette, from `"1"` to `"4"`. It sets the panel, the search field, the
   * rows and the group labels, including their text size. The rows are one step larger than
   * the app's controls at the same step, and the search text is larger again. The default
   * comes from the theme.
   */
  size?: Size;
  /**
   * All the items that the palette can show, before filtering. The palette shows only the items
   * that match the query, so `CommandList` takes a function, not children.
   *
   * Keep this array stable. Declare it at module scope or wrap it in `useMemo`. A new array on
   * each render runs the filter again each time.
   */
  items: readonly unknown[];
  /** Whether the palette is open, for a controlled palette. Use it with `onOpenChange`. Most
      palettes are controlled, because your own key handler opens them. */
  open?: DialogProps["open"];
  /** Whether the palette is open at the start, for an uncontrolled palette. Use it for demos.
      A real palette usually uses `open`, because your key handler opens it. */
  defaultOpen?: DialogProps["defaultOpen"];
  /** Called each time the palette opens or closes. `details.reason` tells the cause, such as
      Escape, an outside press, or `"item-press"` when a row runs. Call `details.cancel()` to keep
      the palette open, for example after a row that doesn't end the task. */
  onOpenChange?: (open: boolean, details: CommandOpenChangeDetails) => void;
  /** A `CommandTrigger`, if there is one, and a `CommandContent`. */
  children: React.ReactNode;
};

/**
 * A command palette (§44) — one field over everything the app can do.
 *
 * **It is a Dialog, and that is the whole architecture.** A palette covers the app, traps
 * focus, locks the page behind it and leaves on Escape — which is the definition of the
 * component this system already shipped, so `Command` composes `Dialog` rather than growing a
 * second overlay. The scrim, the focus trap, the scroll lock, the portal re-theming (§20), the
 * entry motion and the stacking frame all arrive by membership, and this component adds no
 * floating mechanism of its own. That is also why there is no `modal` prop: an open palette IS
 * the interaction.
 *
 * **The machine is the package's, the list is the app's** — Tree's sentence one component
 * over. What a palette owes and an app should never rewrite is the keyboard model: the roving
 * highlight, the highlight surviving a keystroke, Enter running the highlighted row, and the
 * announcement that ties the field to the list. Base UI's `Autocomplete` owns exactly that,
 * and this wraps it. What rows exist, what they mean and what they do stays the app's.
 *
 * **Filtering is Base UI's and is deliberately not a policy this package invents.** Pass
 * `items`, and only matching rows render. An app that wants a different matcher passes
 * `filter` through; an app that wants none passes its own already-narrowed array and the
 * matcher finds everything.
 *
 * **`autoHighlight="always"`, because a palette is answered by Enter.** A row is highlighted
 * from the first frame and re-established after every keystroke, so the most common gesture —
 * type three letters, press Enter — never needs an arrow key first. `keepHighlight` rides with
 * it and is deliberately not credited for that: measured, it is a no-op for the typing gesture,
 * because `autoHighlight` has already re-established the highlight (audit 2026-09-02, where
 * this paragraph credited it and no law read it). What it holds is the highlight across a
 * pointer leaving the list. Refused: opening with a row already RUN, and
 * fuzzy reordering as you type, which is the thing that makes a palette impossible to build
 * muscle memory for.
 */
export function Command({ size: sizeProp, items, open, defaultOpen, onOpenChange, children }: CommandProps) {
  const size = useAppSize(sizeProp);

  /* THE OPEN STATE IS MIRRORED HERE (2026-09-05), and the reason is that a row has to be able to
     close the panel: the state's only handle is this component, and every part that runs a row
     sits below it. Controlled stays controlled — the app's value is what renders and the mirror is
     never read — so an app that states the state is still its one home.

     `cancel()` is honoured on both paths. Base UI refuses the dismissal at its own layer when the
     app calls it, so a mirror that moved anyway would close a panel Base UI kept open — the two
     copies of one fact disagreeing, which is the defect this shape exists to avoid. */
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const controlled = open !== undefined;
  const isOpen = controlled ? open : internalOpen;

  const handleOpenChange = React.useCallback(
    (next: boolean, details: OverlayOpenChangeDetails) => {
      let refused = false;
      const refuse = details.cancel;
      onOpenChange?.(next, {
        ...details,
        cancel: () => {
          refused = true;
          refuse();
        },
      });
      if (!refused && !controlled) setInternalOpen(next);
    },
    [onOpenChange, controlled],
  );

  /* Running a row is a dismissal with its own reason, so it is announced as one rather than
     borrowed from `imperative-action` — an app that has to tell "the user ran something" from
     "something called close()" can, and an app that wants a particular row to leave the panel
     standing refuses this one with `cancel()`. */
  const close = React.useCallback(
    (event: Event) => {
      let refused = false;
      onOpenChange?.(false, {
        reason: "item-press",
        event,
        cancel: () => {
          refused = true;
        },
      });
      if (!refused && !controlled) setInternalOpen(false);
    },
    [onOpenChange, controlled],
  );

  return (
    <CommandSizeContext.Provider value={size}>
      <CommandItemsContext.Provider value={items}>
        <CommandCloseContext.Provider value={close}>
          <Dialog size={size} open={isOpen} onOpenChange={handleOpenChange}>
            {children}
          </Dialog>
        </CommandCloseContext.Provider>
      </CommandItemsContext.Provider>
    </CommandSizeContext.Provider>
  );
}

/** The control that opens it. A palette usually opens on a chord instead, and then this is not
    rendered at all — which is why it is a separate export rather than a prop. */
export type CommandTriggerProps = ComponentRefusals & DialogTriggerProps;
/**
 * The node that opens the palette. It is `DialogTrigger` under another name, because a palette
 * is a dialog and the trigger has nothing of its own to add.
 *
 * Most palettes are opened by a keyboard shortcut and never render one at all.
 */
export function CommandTrigger(props: CommandTriggerProps) {
  return <DialogTrigger {...props} />;
}

export type CommandContentProps = ComponentRefusals & {
  /** The accessible name of the palette. It is required, because the palette has no visible title. */
  "aria-label": string;
  /** A custom function that decides which items match the query. If you don't set it, the
      palette uses Base UI's matcher. Set it to `null` to turn off filtering, for example when
      you filter `items` yourself. */
  filter?: React.ComponentPropsWithoutRef<typeof Autocomplete.Root>["filter"];
  /**
   * Called with the query each time it changes, and with an empty query when the palette closes.
   * You can read the query but not set it. Use it to rank, limit or fetch `items` yourself,
   * which `filter` can't do.
   */
  onQueryChange?: (query: string) => void;
  /** A `CommandInput`, a `CommandList`, and a `CommandEmpty` for when nothing matches. */
  children: React.ReactNode;
  /** A class name for the panel. */
  className?: string;
  style?: React.CSSProperties;
};

/**
 * A CLOSED PALETTE HAS AN EMPTY QUERY, AND IT SAYS SO (2026-09-05, Kushagra: "I type letters, and
 * search results come up. next time I open, results are still there").
 *
 * The field is a fresh one on every open — the panel unmounts with the dialog — so the bar comes
 * back blank. What did not come back is whatever the app derived from the query, because the
 * component reported every keystroke and never reported the reset. The docs site's own search is
 * the shape that breaks: it holds the query in state, computes its results from it and hands them
 * back as `items`, so the palette reopened showing the previous search's matches under an empty
 * field — a list answering a question nobody can see.
 *
 * The rule it is an instance of: a component that owns a value and publishes its changes owes the
 * change that EMPTIES it. Anything else hands the caller a mirror of something the component no
 * longer holds.
 *
 * IT IS A PART, not an effect in `CommandContent`, and that is the whole mechanism. `CommandContent`
 * is rendered by the caller inside `<Command>` and stays mounted for as long as the palette exists
 * — a dialog decides whether to render a PORTAL, not whether its content component runs — so a
 * cleanup there fires when the page navigates away and never when the palette closes. Measured that
 * way first: the popup unmounted, the rows stayed. This renders inside `DialogContent`, which is
 * the only place whose lifetime is the panel's.
 *
 * The handler is held in a ref so the effect runs exactly once per lifetime: an inline arrow at the
 * call site is a new identity on every render, and in a dependency list it would fire this on all
 * of them.
 */
function QueryReset({ report }: { report: ((query: string) => void) | undefined }) {
  const held = React.useRef(report);
  held.current = report;
  React.useEffect(
    () => () => {
      held.current?.("");
    },
    [],
  );
  return null;
}

/**
 * The column. NOT a pane since 2026-09-05 (Kushagra: "we must separate the search block from the
 * results block, this is our stable element… this search block doesnt need a dialog container").
 *
 * It is still a `DialogContent`, because what a dialog carries that nothing else does is the
 * scrim, the focus trap, the scroll lock and the entry — and none of those are the pane. What it
 * no longer does is PAINT: `command.css` stands the surface identity down on this element and the
 * two children each become a pane in their own right, with real air between them.
 *
 * **The field's stability is the whole reason.** A palette's height is its results, and the panel
 * was pinned by a margin at one edge or centred by two — either way a query that returns three
 * rows instead of twelve MOVED the top edge, and the field is at the top. Bottom-anchored on a
 * phone it moved by the whole delta; centred it moved by half. With the field a separate box
 * anchored to the top, the only thing a result count can move is the pane below it.
 *
 * The Autocomplete root must live INSIDE the portal: it wires the field to the list through
 * context, and both are rendered here.
 */
export function CommandContent({
  "aria-label": label,
  filter,
  onQueryChange,
  children,
  className,
  style,
}: CommandContentProps) {
  const items = React.use(CommandItemsContext);
  const [slot, setSlot] = React.useState<HTMLElement | null>(null);
  const slotValue = React.useMemo(() => ({ slot, setSlot }), [slot]);

  return (
    <DialogContent
      aria-label={label}
      className={className ? `kui-command ${className}` : "kui-command"}
      {...(style !== undefined ? { style } : {})}
    >
      <Autocomplete.Root
        open
        inline
        autoHighlight="always"
        items={items ?? []}
        keepHighlight
        {...(filter !== undefined ? { filter } : {})}
        {...(onQueryChange !== undefined ? { onValueChange: onQueryChange } : {})}
      >
        {/* THE SCOPE IS RESET HERE, and it is what makes the two panes panes (§10, the 2026-08-19
            rule that a solid surface HOSTS glass). `DialogPopup` resolves the theme's material and
            scopes its subtree, because a dialog's panel IS normally the pane — so without this
            reset the field and the results pane both resolve `on-glass`, which paints the solid
            dress at the POPUP's alpha and filters nothing. Measured that way once already
            (2026-09-04, on the field): a translucent box that filters nothing is a box you can
            read the moving list straight through. The popup paints nothing here, so it has no
            veil to be a member of, and each pane below states its own. */}
        <QueryReset {...(onQueryChange !== undefined ? { report: onQueryChange } : { report: undefined })} />
        <GlassScope material="solid">
          <CommandSlotContext.Provider value={slotValue}>{children}</CommandSlotContext.Provider>
        </GlassScope>
      </Autocomplete.Root>
    </DialogContent>
  );
}

export type CommandInputProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<typeof Autocomplete.Input>,
  "className" | "render" | "aria-label"
> & {
  /**
   * The accessible name of the search field. It is required, because a placeholder is not a
   * name: it goes away when you type.
   */
  "aria-label": string;
  /** Content before the field, such as a search icon. The package has no icons, so supply your own. */
  leading?: React.ReactNode;
  /** A class name for the search field. */
  className?: string;
};

/**
 * The search bar — a PANE, not a field (§4, §10, §11; reversed 2026-09-05).
 *
 * It has been three things. A bare line under a hairline, then a `kui-control kui-field` on the
 * argument that a bounded box inside a padded pane is an object among objects, and now a pane of
 * its own. What changed is the arrangement around it: it stands alone over the app with air on
 * every side, and the field family is written for a control sitting IN something. Two consequences
 * decided it, and both were visible on screen (Kushagra: "this isn't an inline element, and it
 * needs same material as dialog shell"). A field's well is the dress ramp — an alpha step meant to
 * composite against whatever pane holds it — so over the scrim it read as a recessed grey box
 * beside a lit white one, two materials in one palette. And a field's box is the CONTROL ladder,
 * which prices a thing you put in a form row, not the one object a person is looking at.
 *
 * As a pane it takes the surface join's inset and corner from the same `data-size` the results
 * pane stamps, which is what makes one number price both blocks identically — the thing the
 * one-step bump was faking. Only the type needs a table of its own (`SEARCH_STEP`).
 *
 * NO FOCUS RING, and it is a refusal rather than an omission. §8's ring tells a focused control
 * from the unfocused ones around it, and there is exactly one focusable thing here: the palette
 * opens with the caret in this bar and nothing else in the panel takes focus. The scrim, the
 * flight and the caret are the announcement. Every palette worth copying draws none.
 */
export function CommandInput({ leading, className, ...props }: CommandInputProps) {
  const size = React.use(CommandSizeContext);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { material, ref } = usePane();

  // The pane's first debt, the same one TextField pays: the box is bigger than the input, so a
  // press on the padding or on the magnifier has to land the caret rather than do nothing. The
  // guard is a focusability list — anything the user could have meant to press keeps its own
  // press. `preventDefault` stops the browser moving focus to the wrapper first, which would blur
  // and refocus the input and collapse any selection.
  const focusInput = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, label, [tabindex], [contenteditable]"))
      return;
    const input = inputRef.current;
    if (!input) return;
    event.preventDefault();
    input.focus();
  }, []);

  return (
    <div
      ref={ref}
      className="kui-surface kui-overlay kui-command-search"
      data-size={size}
      data-tone="neutral"
      data-emphasis="quiet"
      data-bordered
      // Solid is the absence of a material, so it writes no attribute (§10).
      {...(material !== "solid" ? { "data-material": material } : {})}
      onMouseDown={focusInput}
    >
      <GlassScope material={material}>
        {filled(leading) ? (
          <span className="kui-command-search-slot" data-slot={"leading" satisfies SlotName} aria-hidden>
            {leading}
          </span>
        ) : null}
        {/* THE STEP IS STAMPED ON THE INPUT, not on the pane, and the two cannot share an
            element: `data-size` on a `.kui-surface` is the four-step surface ladder and
            `data-size` on a `.kui-type` is the nine-step type ramp. Composer settled this the
            same way — the map keeps its single TS home and the type layer resolves the rest. */}
        <Autocomplete.Input
          ref={inputRef}
          /* THE CARET IS THE DESIGN, AND ON iOS IT HAS TO BE CLAIMED IN THE GESTURE
             (2026-09-10, Kushagra: "Why does clicking on search NOT focus the command? The
             keyboard doesnt pop"). The comment above already states that the palette "opens
             with the caret in this bar", and it did — Base UI's focus manager focuses the first
             tabbable thing in the popup, which is this input, so DOM focus landed correctly
             (measured in Chromium: `document.activeElement` is `.kui-command-input`). What did
             not land is the KEYBOARD: iOS raises it only for a `.focus()` called synchronously
             inside the user gesture, and that manager runs in an effect, by which point the tap
             is over.

             React's `autoFocus` is not the DOM attribute — React calls `.focus()` itself during
             the commit phase, and a click is a DISCRETE event, which React flushes
             synchronously. So the mount and the focus both happen inside the tap's own task and
             the keyboard comes up. Before the caller's spread, so an app that wants a palette
             that opens cold can still say `autoFocus={false}`.

             It is not a second focus fighting the first: the manager aims at this same element,
             and moving focus from an input to itself does not dismiss the keyboard. */
          autoFocus
          {...props}
          data-size={SEARCH_STEP[size]}
          className={
            className
              ? `kui-type kui-command-input ${className}`
              : "kui-type kui-command-input"
          }
        />
      </GlassScope>
    </div>
  );
}

export type CommandListProps<T> = ComponentRefusals & {
  /** Called for each item that survives the filter. */
  children: (item: T) => React.ReactNode;
  /** A class name for the list panel. */
  className?: string;
};

/** The list. It scrolls nothing itself — the panel is one scrolling region and `CommandContent`
    places the scroller, so the rows pass behind the field and out at the pane's own wall. */
export function CommandList<T>({ children, className }: CommandListProps<T>) {
  const size = React.use(CommandSizeContext);
  const seat = React.use(CommandSlotContext);
  const paneRef = React.useRef<HTMLDivElement | null>(null);
  const material = useMaterial({ backdrop: true });
  const ref = useLensRef<HTMLDivElement>(material, paneRef);

  /* IT TELLS THE LENS WHERE IT IS GOING (§10, §22 — 2026-09-05, Kushagra: "the big issue is that
     after animation completes, the bg changes and gets thicker in a jump"). That jump is the
     refraction arriving late: the lens mints a map on mount and on resize, and this pane's height
     is what the entry animates, so without an announcement it minted one per frame — each built
     for the previous frame's box, none of them right until after the flight. The mechanism is the
     family's and it lives in `system/floating.tsx` beside the runner's own measurement, because
     the flight measurement has one home. */
  useStatedFlight(paneRef);
  return (
    <div
      ref={ref}
      className={
        className
          ? `kui-surface kui-floating-rows kui-command-panel ${className}`
          : "kui-surface kui-floating-rows kui-command-panel"
      }
      data-size={ROW_STEP[size]}
      data-tone="neutral"
      data-emphasis="quiet"
      data-bordered
      // Solid is the absence of a material, so it writes no attribute (§10).
      {...(material !== "solid" ? { "data-material": material } : {})}
    >
      <GlassScope material={material}>
        {/* `fade` because a bounded list has to END somewhere, and ending at the pane's own hard
            edge is the thing that reads as sliced. What it no longer does is dissolve rows under
            the FIELD: the field is a separate pane with real air between them since 2026-09-05,
            so there is nothing to pass behind and the fade is the pane's own top and bottom. */}
        <ScrollArea fade focusable={false}>
          <Autocomplete.List className="kui-command-list">
            {children as (item: unknown) => React.ReactNode}
          </Autocomplete.List>
        </ScrollArea>
        {/* THE EMPTY STATE'S SEAT, in the pane rather than beside it. The two are never both
            filled — Base UI renders only the rows that survived the filter, and fills the live
            region only when none did — so they stack in ordinary flow and whichever has something
            to say is the pane's height. No stacking context, no grid cell, no `display` switch:
            the mutual exclusion is the machine's own guarantee, not a rule this file writes. */}
        <div className="kui-command-seat" data-float="" ref={seat ? seat.setSlot : null} />
      </GlassScope>
    </div>
  );
}

export type CommandGroupProps = ComponentRefusals & {
  /** The items in this group. The group hides when none of them match the query. */
  items: readonly unknown[];
  /** A `CommandGroupLabel` and a `CommandCollection` for the rows. */
  children: React.ReactNode;
  /** A class name for the group. */
  className?: string;
};

/** A section. It disappears on its own when nothing in it matches, which is the reason groups
    carry their items rather than being pure layout. */
export function CommandGroup({ items, children, className }: CommandGroupProps) {
  return (
    <Autocomplete.Group
      items={items}
      className={className ? `kui-command-group ${className}` : "kui-command-group"}
    >
      {children}
    </Autocomplete.Group>
  );
}

/* The three parts below declare EXPORTED props types rather than inline object literals, and
   that is what lets `ComponentRefusals` reach them (2026-09-07, the audit). Written inline they
   were the only exported components in the package intersecting nothing: `<CommandGroupLabel
   variant="solid" m="4">` got a diagnostic naming no escape, both agent surfaces answered
   "nothing refused", and `api.generated.ts` had no entry at all, so the reference told a reader
   the part declares no props while `CommandCollection`'s children is a required render
   function. `refusal-sets.test.ts` walks the built declarations so a fourth cannot appear. */

export type CommandGroupLabelProps = ComponentRefusals & {
  /** The name of the group. It is text only, and it isn't focusable. */
  children: React.ReactNode;
  className?: string;
};

/** The section's name. A caption, not a row: it is not reachable and it does nothing. */
export function CommandGroupLabel({ children, className }: CommandGroupLabelProps) {
  const size = React.use(CommandSizeContext);
  return (
    <Autocomplete.GroupLabel
      className={className ? `kui-command-group-label ${className}` : "kui-command-group-label"}
    >
      <Text size={size === "1" ? "1" : "2"} emphasis="medium">
        {children}
      </Text>
    </Autocomplete.GroupLabel>
  );
}

export type CommandCollectionProps<T> = ComponentRefusals & {
  /** A function that renders a row for each item in the group that matches the query. */
  children: (item: T) => React.ReactNode;
};

/** Renders each surviving item of the group it sits in. */
export function CommandCollection<T>({ children }: CommandCollectionProps<T>) {
  return <Autocomplete.Collection>{children as (item: unknown) => React.ReactNode}</Autocomplete.Collection>;
}

export type CommandItemProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<typeof Autocomplete.Item>,
  "className" | "render"
> & {
  /**
   * The element to render the row as, such as an `<a href>` or your framework's link component.
   * Use it when a row goes to a page, such as a search result. The row then works as a real
   * link, with open in a new tab and a link role for screen readers.
   */
  render?: RenderElement;
  /** Content before the label, such as an icon or an avatar. */
  leading?: React.ReactNode;
  /** Content at the far end of the row, such as a keyboard shortcut, a category or a count. */
  trailing?: React.ReactNode;
  /** The colour of the row. Set it to `destructive` for a command that deletes something. */
  tone?: "destructive";
  /** A class name for the row. */
  className?: string;
};

/**
 * One command. A row (§21) — the third consumer of the family's identity, which is what
 * promoted `rowProps` into the system layer. Base UI owns the highlight and the activation, so
 * the row is told what it looks like and never what it means.
 */
export function CommandItem({ leading, trailing, tone, render, children, className, onClick, ...props }: CommandItemProps) {
  // Unwrapped FIRST (§5, the 2026-08-07 finding): an element created in a Server Component
  // crosses the RSC boundary as a lazy node whose `type` answers wrong, silently.
  const target = render === undefined ? undefined : unwrapLazy(render);
  const close = React.use(CommandCloseContext);

  /* RUNNING A ROW CLOSES THE PALETTE, and the click is where it is read rather than Base UI's own
     `onOpenChange` (2026-09-05). Two reasons, both measured. Base UI hands the LINK case straight
     back — `handleSelection` returns before it changes state when the row resolves to an `<a>` with
     a non-hash href, on the argument that the navigation is the outcome — so a palette of places,
     which is exactly what the docs site's search is, would have been the one shape the repair
     missed. And a click is the one gesture both routes share: a pointer press is a click, and the
     keyboard commits the highlighted row by clicking its element (`clickHighlightedItem`), so
     reading it here covers Enter without a second mechanism.

     The caller's handler runs FIRST and its return is not consulted: running is running, and a row
     that must leave the panel standing says so through `onOpenChange`'s `cancel()`, where the
     refusal is announced instead of inferred.

     NO `disabled` GUARD, and it is a measurement rather than an omission: one was written and
     survived its own sabotage. Base UI does not fire this handler for a disabled item at all —
     measured with a raw `element.click()` on a row whose `pointer-events` is `auto`, which is the
     gesture a pointer-events gate would have let through. A guard nothing can reach is the dead
     mechanism this repo keeps paying for, so it is gone; the law that a dead row dismisses nothing
     stays, because that guarantee is now the dependency's and a bump can take it away. */
  const handleClick = React.useCallback(
    (event: Parameters<NonNullable<CommandItemProps["onClick"]>>[0]) => {
      onClick?.(event);
      close?.(event.nativeEvent);
    },
    [onClick, close],
  );

  return (
    <Autocomplete.Item
      {...(target ? { render: target } : {})}
      /* A ROW IS NOT A TAB STOP (2026-09-06, Kushagra: "the rows do ring" — measured, and nobody
         had chosen it). A palette's keyboard is one stop: the caret is in the bar, the arrow keys
         move the highlight, Enter runs it, Tab is how you get OUT. That is what a listbox is, and
         it is what this component's own laws already assert — until a row renders as an `<a href>`,
         which the `render` escape opened for a palette of PLACES on 2026-09-04. An anchor is
         focusable by nature and Base UI writes no `tabindex` on an item, so in the one shape this
         repo's own documentation site uses, Tab from the bar landed on the first result and drew
         it a full ring. Measured before and after: `A.kui-command-item` against the input.

         `-1` rather than removing the ring, because the two say different things. The ring is
         right whenever a row really is focused — the skeleton's rule, and nothing here overrules
         it. What was wrong is that Tab could focus one at all. Stated BEFORE the caller's spread,
         so an app that has a reason to put a row in the tab order still can. */
      tabIndex={-1}
      {...props}
      onClick={handleClick}
      {...rowProps(ROW_STEP[React.use(CommandSizeContext)], "kui-command-item", {
        ...(tone !== undefined ? { tone } : {}),
        ...(className !== undefined ? { className } : {}),
      })}
    >
      {leading ? <span data-slot="leading">{leading}</span> : null}
      {children}
      {trailing ? <span data-slot="trailing">{trailing}</span> : null}
    </Autocomplete.Item>
  );
}

/**
 * The content that the list shows when no item matches the query. It sets only the position,
 * not the style. Pass a `Text` for one sentence, or your own block for a full empty state.
 */
export type CommandEmptyProps = ComponentRefusals & {
  /** The content to show when no item matches. It shows inside the list panel. */
  children: React.ReactNode;
  className?: string;
};

/** What the list shows when the query matches nothing. Placed beside `CommandList`, rendered
    inside it — see the file header for why the two are apart. */
export function CommandEmpty({ children, className }: CommandEmptyProps) {
  const seat = React.use(CommandSlotContext);

  /* IT IS NOT A PANE ANY MORE (2026-09-05). It was a third block in the column, wearing
     `kui-surface kui-overlay` — so the thing that stands in for the results pane was boxed like a
     dialog while the results pane is boxed like a menu: 64.52px of corner over 24px of inset
     against 33.25 over 4, two shapes for one place. It renders INSIDE the results pane now, which
     makes them the same box by construction rather than by two tables agreeing.

     The seat may be null for one render — a ref callback runs after the commit, and this part is
     written after `CommandList` in every call site — which costs nothing that matters: an empty
     state is a state the palette reaches, never the frame it opens on, and an `aria-live` region
     announces on the change after it mounts. */
  if (!seat?.slot) return null;

  return createPortal(
    <Autocomplete.Empty
      className={className ? `kui-command-empty ${className}` : "kui-command-empty"}
    >
      {children}
    </Autocomplete.Empty>,
    seat.slot,
  );
}
