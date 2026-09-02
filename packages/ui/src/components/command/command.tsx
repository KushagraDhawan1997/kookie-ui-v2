"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { rowProps } from "../../system/rows.ts";
import { Dialog, DialogContent, DialogTrigger, type DialogProps, type DialogTriggerProps } from "../dialog/dialog.tsx";
import { Text } from "../text/text.tsx";

/* ── Contexts: the size, and the items the content hands to Base UI ────────────────────── */

const CommandSizeContext = React.createContext<Size>("2");
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
export function Command({ size = "2", items, open, defaultOpen, onOpenChange, children }: CommandProps) {
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
  /** Base UI's matcher, if the app wants a different one. Left alone, it is Base UI's own. */
  filter?: React.ComponentPropsWithoutRef<typeof Autocomplete.Root>["filter"];
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
export function CommandContent({ "aria-label": label, filter, children, className, style }: CommandContentProps) {
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
      >
        {children}
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
 * The filter field. It is NOT a `TextField`: a field's job is to be a bounded box with a seal,
 * an edge and a focus ring, and this is a bare line at the top of a panel that is already the
 * focused thing. Wrapping one would draw a box inside a box — Composer's own reasoning for a
 * bare `<textarea>`, and the same conclusion.
 */
export function CommandInput({ leading, className, ...props }: CommandInputProps) {
  return (
    <div className="kui-command-field">
      {leading ? (
        <span className="kui-command-field-icon" aria-hidden>
          {leading}
        </span>
      ) : null}
      <Autocomplete.Input
        {...props}
        className={className ? `kui-command-input ${className}` : "kui-command-input"}
      />
    </div>
  );
}

export type CommandListProps<T> = {
  /** Called for each item that survives the filter. */
  children: (item: T) => React.ReactNode;
  /** Dresses the scrolling list. */
  className?: string;
};

/** The list. It scrolls, because a palette's whole point is that it holds more than fits. */
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
export function CommandItem({ leading, trailing, tone, children, className, ...props }: CommandItemProps) {
  return (
    <Autocomplete.Item
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

/** What the panel says when nothing matches. It is a real element rather than a fallback the
    system writes, because the sentence is the app's — and in its language. */
export function CommandEmpty({ children, className }: { children: React.ReactNode; className?: string }) {
  const size = React.use(CommandSizeContext);
  return (
    <Autocomplete.Empty className={className ? `kui-command-empty ${className}` : "kui-command-empty"}>
      <Text size={size === "1" ? "1" : "2"} emphasis="medium">
        {children}
      </Text>
    </Autocomplete.Empty>
  );
}
