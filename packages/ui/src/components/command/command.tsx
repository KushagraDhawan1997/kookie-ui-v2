"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import * as React from "react";

import type { Size, SlotName } from "../../system/axes.ts";
import { filled, unwrapLazy, type RenderElement } from "../../system/render.ts";
import { rowProps } from "../../system/rows.ts";
import { Dialog, DialogContent, DialogTrigger, type DialogProps, type DialogTriggerProps } from "../dialog/dialog.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { useLensRef } from "../../system/refraction.tsx";
import { GlassScope, useMaterial, themeDefaults } from "../../theme/theme.tsx";
import { Text } from "../text/text.tsx";
import { useSize } from "../../system/size.ts";

/* ── Contexts: the size, and the items the content hands to Base UI ────────────────────── */

/* `themeDefaults.size`, never a literal: this default is only reachable in an invalid tree
   (a part outside its root), and nine private copies of the number 2 is nine claims about a
   rest that the app can now move (2026-09-05). */
const CommandSizeContext = React.createContext<Size>(themeDefaults.size);
const CommandItemsContext = React.createContext<readonly unknown[] | undefined>(undefined);

export type CommandProps = {
  /**
   * Sets the panel and everything the component places in it: the box, the filter field, the
   * rows and the group labels. It owns all of it, so the index reaches the type — the rule
   * AlertDialog and Composer both settled on, where a Dialog stops at the box because the
   * content is yours.
   */
  size?: Size;
  /**
   * Everything the palette can offer, before filtering. Base UI matches against these and
   * renders only what survives, which is why `CommandList` takes a function rather than
   * children: the list you write is the list of ALL commands, and the panel decides which of
   * them exist right now.
   *
   * **Hold this array stable.** It crosses to the matcher by identity, so an inline literal —
   * the shape every call site reaches for first — re-runs the whole filter pass on every
   * unrelated render of whatever holds the palette. Module scope, or a `useMemo`.
   */
  items: readonly unknown[];
  /** Open state. A palette is almost always controlled, because the chord that opens it lives
      in the app's own key handler. */
  open?: DialogProps["open"];
  /** Open on the first render and manage itself after that. Useful for a demo; almost never
      what a real palette wants, because the chord that opens it lives in your key handler. */
  defaultOpen?: DialogProps["defaultOpen"];
  /** Called when it opens or closes, with the reason — an Escape, an outside press, or a row
      being run. The second argument carries `cancel()` if you need to refuse the dismissal. */
  onOpenChange?: DialogProps["onOpenChange"];
  /** The trigger, if there is one, and the panel. */
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
  const size = useSize(sizeProp);
  return (
    <CommandSizeContext.Provider value={size}>
      <CommandItemsContext.Provider value={items}>
        <Dialog
          size={size}
          {...(open !== undefined ? { open } : {})}
          {...(defaultOpen !== undefined ? { defaultOpen } : {})}
          {...(onOpenChange !== undefined ? { onOpenChange } : {})}
        >
          {children}
        </Dialog>
      </CommandItemsContext.Provider>
    </CommandSizeContext.Provider>
  );
}

/** The control that opens it. A palette usually opens on a chord instead, and then this is not
    rendered at all — which is why it is a separate export rather than a prop. */
export type CommandTriggerProps = DialogTriggerProps;
export function CommandTrigger(props: CommandTriggerProps) {
  return <DialogTrigger {...props} />;
}

export type CommandContentProps = {
  /** The palette's accessible name. It has no visible title — the field is the affordance —
      so the name is stated here and it is required by the type. */
  "aria-label": string;
  /** Base UI's matcher, if the app wants a different one. Left alone, it is Base UI's own; pass
      `null` to turn filtering off entirely, which is what an app narrowing its own array wants. */
  filter?: React.ComponentPropsWithoutRef<typeof Autocomplete.Root>["filter"];
  /**
   * What has been typed, as it is typed. READ-ONLY: the input stays Base UI's, because the
   * keyboard model is the thing this component exists to own.
   *
   * It closes a hole §44 described and did not implement (2026-09-04). That section already said
   * "an app that wants none hands in an already-narrowed array" — and narrowing needs the query,
   * which nothing handed over, so the sentence named a path no call site could take. A ranked
   * search is the case that forces it: `filter` is a boolean predicate, so it can neither ORDER
   * results by relevance nor cap them, and a docs search that cannot rank is a docs search.
   *
   * §44's refusal of fuzzy reordering is not weakened by this and is worth restating: it is about
   * a palette of COMMANDS, where the order is the table's own and muscle memory is most of what
   * the thing is for. A search over prose has no order of its own to keep.
   */
  onQueryChange?: (query: string) => void;
  /** The field, the list, and the sentence shown when nothing matches. */
  children: React.ReactNode;
  /** Dresses the panel. Outer spacing is not yours to set here — a palette covers the app. */
  className?: string;
  style?: React.CSSProperties;
};

/**
 * The panel. A `DialogContent` — so the surface, the scrim, the corner, the material and the
 * motion are the overlay family's — holding the Autocomplete root, which must live INSIDE the
 * portal: it wires the field to the list through context, and the list is rendered here.
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
        {/* ONE SCROLLING REGION, AND THE FIELD PINS INSIDE IT (2026-09-04, Kushagra: "the content
            should scroll behind"). A scroller around the LIST alone cannot do it: the field would
            be a box the rows stop under, and `position: sticky` needs the scrolling ancestor to be
            the thing it pins inside. With the whole panel in one viewport the rows pass behind the
            field and out at the pane's own rounded wall, which is what a bleed is.

            THE GLASS SCOPE IS RESET HERE, and that is what makes the field a pane rather than a
            member (§10, the 2026-08-19 rule that a solid surface HOSTS glass). Without it the
            palette's own pane is the veil-painter, glass does not stack, and the field resolves
            `on-glass` — which paints its solid dress at the PANE's alpha and filters nothing, so
            the rows read straight through it while they move. That is the right answer for a
            member sitting ON a pane and the wrong one here, because this field is the one element
            in the panel with content passing BEHIND it, which is §10's whole test. The rows do not
            ask for a backdrop, so they stay solid and pay nothing.

            `fade` because the alternative is a cut: content that bleeds still has to end
            somewhere, and ending at the pane's own hard edge is the thing that reads as sliced.
            The mask dissolves the CONTENT toward whichever edge has more behind it and lets the
            pane paint through, so there is no colour to be wrong on glass, on a ground or over a
            photograph — and it costs no JS of this package's. */}
        <GlassScope material="solid">
          <ScrollArea fade focusable={false}>
            {children}
          </ScrollArea>
        </GlassScope>
      </Autocomplete.Root>
    </DialogContent>
  );
}

export type CommandInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Autocomplete.Input>,
  "className" | "render" | "aria-label"
> & {
  /**
   * The field's accessible name, required by the type. It is the palette's one interactive
   * control — a `role="combobox"` — and it shipped nameless whenever the placeholder was
   * omitted, while the panel nobody focuses required a name two exports above. A placeholder
   * is not a name: it disappears the moment anyone types.
   */
  "aria-label": string;
  /** Before the field: a magnifier, if your app draws one. Empty-safe — the package ships no
      icon set. */
  leading?: React.ReactNode;
  /** Dresses the input line. */
  className?: string;
};

/**
 * The filter field — and it IS a field (§4, §11, reversed 2026-09-04, Kushagra: "that should
 * also look like a text field, again with padding around, and no separator").
 *
 * It shipped as a bare line under a hairline, on the argument that a bounded box at the top of a
 * panel that is already the only focused thing puts a box inside a box. That argument was made
 * about a pane with no padding, where the line and the wall were the same edge and a box would
 * have had nowhere to stand. Once the pane pads (§44), there IS somewhere to stand: the field is
 * one object and the list below it is another, and the interval between them is what the hairline
 * used to say.
 *
 * It joins by MEMBERSHIP rather than by imitation, which is SelectTrigger's own move: the wrapper
 * wears `kui-control kui-field`, so the well, the dress edge, the focus-as-a-mode ring, the
 * disabled and invalid arms and the glass arms all arrive from the shared layer and this file
 * states none of them. What it is not is a `TextField` — that component owns an `<input>` it
 * creates, and the input here has to be Base UI's, which is the same two-elements-and-neither-can-
 * move reason TextField refuses `render`.
 *
 * It stamps no `data-material`: glass does not stack (§10), so a field inside the palette's pane
 * resolves solid exactly as a TextField composed there would, and its dress reads the alpha ramp
 * so it still composites against whatever the pane is.
 */
export function CommandInput({ leading, className, ...props }: CommandInputProps) {
  const size = React.use(CommandSizeContext);
  const inputRef = React.useRef<HTMLInputElement>(null);
  /* §10 — content passes behind this field, which is the whole test for whether a material is
     expressed, and it is the only element in the panel that passes it. `CommandContent` resets the
     glass scope above, so this resolves the THEME's material as a pane rather than `on-glass`:
     veil, filter and lens, which is what defends the words from the rows moving under them. */
  const material = useMaterial({ backdrop: true });
  const lensRef = useLensRef<HTMLSpanElement>(material, undefined);
  /* NO MATERIAL, and it was tried both ways (2026-09-04). Content genuinely passes behind this
     field now, which is the test §10 uses for whether a material is expressed — so `backdrop` was
     stated, and measured it renders `on-glass`: the palette's pane is the veil-painter, glass does
     not stack, and an on-glass member paints its solid dress at the PANE's alpha. Over rows that
     are moving, that is a field you can read the list through. One glass per stack is the rule
     doing its job; what it costs here is that a translucent field cannot be the thing content
     hides behind, so the field states nothing and wears its own dress. */

  // The field's first debt, the same one TextField pays: the box is bigger than the input, so a
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
    <span
      ref={lensRef}
      className="kui-control kui-field kui-command-field"
      data-size={size}
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
      // Fixed identity, not API (the Card and TextField pattern): the tone indirection needs a
      // family to resolve --tone-border against, and a field is always bordered.
      data-tone="neutral"
      data-bordered
      onMouseDown={focusInput}
    >
      {filled(leading) ? (
        <span className="kui-field-slot" data-slot={"leading" satisfies SlotName} aria-hidden>
          <GlassScope material={material}>{leading}</GlassScope>
        </span>
      ) : null}
      <Autocomplete.Input
        ref={inputRef}
        {...props}
        className={
          className
            ? `kui-field-input kui-command-input ${className}`
            : "kui-field-input kui-command-input"
        }
      />
    </span>
  );
}

export type CommandListProps<T> = {
  /** Called for each item that survives the filter. */
  children: (item: T) => React.ReactNode;
  /** Dresses the scrolling list. */
  className?: string;
};

/** The list. It scrolls nothing itself — the panel is one scrolling region and `CommandContent`
    places the scroller, so the rows pass behind the field and out at the pane's own wall. */
export function CommandList<T>({ children, className }: CommandListProps<T>) {
  return (
    <Autocomplete.List className={className ? `kui-command-list ${className}` : "kui-command-list"}>
      {children as (item: unknown) => React.ReactNode}
    </Autocomplete.List>
  );
}

export type CommandGroupProps = {
  /** This group's own items, so the filter can narrow a section and hide it when it empties. */
  items: readonly unknown[];
  /** The section's caption and its rows. */
  children: React.ReactNode;
  /** Dresses the section. */
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

/** The section's name. A caption, not a row: it is not reachable and it does nothing. */
export function CommandGroupLabel({ children, className }: { children: React.ReactNode; className?: string }) {
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

/** Renders each surviving item of the group it sits in. */
export function CommandCollection<T>({ children }: { children: (item: T) => React.ReactNode }) {
  return <Autocomplete.Collection>{children as (item: unknown) => React.ReactNode}</Autocomplete.Collection>;
}

export type CommandItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof Autocomplete.Item>,
  "className" | "render"
> & {
  /**
   * Render the row into the element it really is — your framework's link component, or an
   * `<a href>` — for a palette of PLACES rather than of verbs. A search result is a place, and
   * a row that navigates without being a link has no middle-click, no open-in-new-tab, no URL
   * on the status bar and nothing for a screen reader to announce as a link.
   *
   * Opened 2026-09-04 for the docs site's own search, which is the second consumer of the
   * argument `MenuItem` was opened on three days earlier — `BreadcrumbEllipsis` lists places by
   * definition, and so does a search. The row stays ONE target, which is the whole reason this
   * is a render escape rather than an anchor nested inside the row: a link inside would be a
   * second target inside a target, and `trailing` already refuses that.
   */
  render?: RenderElement;
  /** Before the label: an icon, an avatar. */
  leading?: React.ReactNode;
  /** After it, pushed to the far edge: the chord that also runs this, a category, a count. */
  trailing?: React.ReactNode;
  /** The one meaning a row may carry. Not a palette — the list stays this narrow on purpose. */
  tone?: "destructive";
  /** Dresses the row. */
  className?: string;
};

/**
 * One command. A row (§21) — the third consumer of the family's identity, which is what
 * promoted `rowProps` into the system layer. Base UI owns the highlight and the activation, so
 * the row is told what it looks like and never what it means.
 */
export function CommandItem({ leading, trailing, tone, render, children, className, ...props }: CommandItemProps) {
  // Unwrapped FIRST (§5, the 2026-08-07 finding): an element created in a Server Component
  // crosses the RSC boundary as a lazy node whose `type` answers wrong, silently.
  const target = render === undefined ? undefined : unwrapLazy(render);
  return (
    <Autocomplete.Item
      {...(target ? { render: target } : {})}
      {...props}
      {...rowProps(React.use(CommandSizeContext), "kui-command-item", {
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
 * What the panel shows when nothing matches. It states WHERE that goes and nothing about what it
 * looks like, which is the difference between a slot and a wrapper — and it was a wrapper until
 * 2026-09-04 (Kushagra: "no empty state block being used when no results found").
 *
 * It put its children inside a `Text`, so the only thing that could go in it was a sentence: a
 * real empty state — a mark, a title, a line of explanation, a way out — came back with its
 * heading rendered as body copy at the caption's step. §44 already said the words are the app's,
 * in the app's language; an empty REGION is the same claim about the arrangement, and a part that
 * dresses what it is handed cannot make it. So a sentence is now passed as a `Text` and a full
 * empty state as whatever block the app composes, and this places both.
 */
export function CommandEmpty({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Autocomplete.Empty
      /* NOT IN THE FIRST/LAST QUESTION (2026-09-04). The surface layer decides a scroller's block
         bleed by asking whether it is the pane's first or last in-flow child, and this element is
         a DOM sibling that only ever renders when the list is empty — so while it sat there
         unmarked the scroller was never last, never bled at the bottom, and every list ended at a
         hard line one inset short of the wall with dead pane below it. `data-float` is the marker
         that rule already reads (ShellPaneFooter, CodeBlock's chrome rows); this is the third
         consumer and the first that is not absolutely positioned, which is the honest reading of
         the attribute: it says "do not count me", not "I float". */
      data-float=""
      className={className ? `kui-command-empty ${className}` : "kui-command-empty"}
    >
      {children}
    </Autocomplete.Empty>
  );
}
