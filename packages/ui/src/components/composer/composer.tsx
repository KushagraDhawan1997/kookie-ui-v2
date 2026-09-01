"use client";

import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { ControlSizeContext } from "../../system/control-size.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { Button } from "../button/button.tsx";

/** Every value the status takes, in ONE home, so a law walks the axis rather than a tuple
    somebody typed out beside it (the 2026-08-16 rule — a hand-copied list is a list that
    silently stops covering the axis the day it widens). The union derives from it. */
export const COMPOSER_STATUSES = ["ready", "submitted", "streaming", "error"] as const;

/** What the request is doing, which is the only thing the send button reads (§30). */
export type ComposerStatus = (typeof COMPOSER_STATUSES)[number];

/** The two states in which a request is already running, so a send is not what a person means:
    `submitted` is in flight and `streaming` is producing. `error` is not one of them — a retry
    IS the send. */
const BUSY_STATUSES: readonly string[] = ["submitted", "streaming"];

/** Whether the send button this form contains says a request is already running. */
function isBusy(form: HTMLFormElement): boolean {
  const send = form.querySelector(".kui-composer-send");
  return BUSY_STATUSES.includes(send?.getAttribute("data-status") ?? "");
}

export type ComposerProps = Omit<
  React.ComponentPropsWithoutRef<"form">,
  "color" | "onSubmit"
> & {
  /**
   * The index, set once for the whole unit. It prices the pane's padding and corner, the step
   * its own text is set at, AND the controls you compose into the row — a Button, a Select or
   * a field under the text all take it through `ControlSizeContext` (§28), so a composer is
   * sized as one thing.
   *
   * An explicit `size` on a control always wins, so nothing is ever re-sized behind a number
   * somebody typed. The reach stops at the composer's own subtree: a Button beside it keeps
   * the family's rest.
   */
  size?: Size;
  /**
   * Says content passes behind the composer, so the theme's material can show. Unset, it
   * follows the surrounding `<Box backdrop>` region. A composer over a scrolling conversation
   * is the case selectivity exists for (§10).
   */
  backdrop?: boolean;
  /** Fired when the person sends. The event is already `preventDefault`ed. */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  /**
   * Files dropped on the composer or pasted into its input, handed over raw. The system owns
   * the two events that land on its own elements; the app owns the files and everything after
   * (§30). There is no attach button here for the same reason.
   */
  onFiles?: (files: File[]) => void;
  ref?: React.Ref<HTMLFormElement>;
};

/**
 * The box a person types a message into (§30) — the input half of a conversation, and not the
 * conversation.
 *
 * It is a SURFACE, and what decides that is what it holds. A TextField holds shrunken controls
 * in its slots (§4's hosted rule squashes them to fit and caps their hit area at the
 * container); a composer holds full-size Buttons at their own index. A box containing controls
 * is a Card, so the pane's fill, corner, squircle, padding, clip, edge and cast all arrive from
 * the surface layer, and `m="bleed"` works for an attachment strip because surface padding is
 * what it reads.
 *
 * It is a real `<form>`. That is what gives Enter-to-submit and `requestSubmit()` without a
 * prop — v1's Chatbar is a div with `onSubmit` stripped from its props, which is why it needed
 * a `submitOnEnter` that defaulted to off.
 *
 * What it does NOT own: the conversation, the files, and transport. Attachment tiles take
 * their state as a prop and the app holds the File; the attach button is the app's, because a
 * button we cannot draw an icon for (§8 ships no icon set) is a Button.
 */
export function Composer({
  size = "2",
  backdrop,
  onSubmit,
  onFiles,
  className,
  children,
  ref,
  onDragOver,
  onDrop,
  ...props
}: ComposerProps) {
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  const lensRef = useLensRef<HTMLElement>(material, ref as React.Ref<HTMLElement>);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // A composer never navigates. The element is here for Enter and `requestSubmit()`, not for
    // a GET to the current URL.
    event.preventDefault();
    // CHANGES 2026-08-26: a request already in flight refuses the second send. §30's claim is
    // that the key and the button take ONE route, and the route had no idea a request was
    // running: `requestSubmit()` with no submitter submits whatever the submit button says,
    // so Enter sent a second message while the button in front of the person read "Stop".
    //
    // The status is read off the send button's own `data-status` rather than lifted into
    // React state, and that is the constraint rather than a preference: the status is a LEAF's
    // prop, so lifting it means a registration whose state update lands one render after the
    // attribute is already in the DOM. The attribute is written in the same commit as the
    // button, so the form and the button can never disagree.
    if (isBusy(event.currentTarget)) return;
    onSubmit?.(event);
  };

  // Drop and paste are the two file routes that land on OUR elements, so the app cannot reach
  // them without going through our DOM. Paste is wired on the input (it needs the caret's
  // element); drop is the whole pane, because a person aims at the box and not at the text.
  const handleDrop = (event: React.DragEvent<HTMLFormElement>) => {
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length > 0 && onFiles) {
      event.preventDefault();
      onFiles(files);
    }
    onDrop?.(event);
  };
  const handleDragOver = (event: React.DragEvent<HTMLFormElement>) => {
    // Without this the browser opens the file, and the drop handler never runs.
    if (onFiles) event.preventDefault();
    onDragOver?.(event);
  };

  return (
    <GlassScope material={material}>
      <ControlSizeContext.Provider value={size}>
        <ComposerFilesContext.Provider value={onFiles ?? null}>
          <form
            ref={lensRef as React.Ref<HTMLFormElement>}
            data-size={size}
            // Fixed identity, not API — Card's sentence. The tone indirection needs a family to
            // resolve `--tone-border` against, and the fill is the seal rather than a tone alpha.
            data-tone="neutral"
            data-emphasis="quiet"
            data-bordered
            data-material={material === "solid" ? undefined : material}
            className={
              className ? `kui-surface kui-composer ${className}` : "kui-surface kui-composer"
            }
            onSubmit={handleSubmit}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            {...props}
          >
            {children}
          </form>
        </ComposerFilesContext.Provider>
      </ControlSizeContext.Provider>
    </GlassScope>
  );
}

/* The private `ComposerTypeContext` that used to live here is DELETED (2026-08-23). It existed
   for one reason, stated in its own comment: `ControlSizeContext` "would resize a Select somebody
   put in the row while the Button beside it kept its own index — three behaviours in one
   component, and nobody chose the third." That was true, and it was a fact about Button, not
   about the composer — Button now reads the context too, so the row moves as one and the
   objection is gone. The composer supplies the real context and there is one index, not two. */

/** Carries `onFiles` to the input, which is where a paste can be read. */
const ComposerFilesContext = React.createContext<((files: File[]) => void) | null>(null);

type ComposerInputBase = Omit<
  React.ComponentPropsWithoutRef<"textarea">,
  "color" | "children" | "cols"
> & { ref?: React.Ref<HTMLTextAreaElement> };

/**
 * The name, required, and the union is the point of it rather than decoration (§30, ENGINEERING
 * §1.3 — Button's `iconOnly` one family over).
 *
 * This is the one text control in the library that a surrounding `Field` cannot name. Every
 * other input goes through a Base UI primitive that registers itself with `Field.Root` and
 * takes the label's `htmlFor`; a composer's text is a BARE `<textarea>` — the §30 decision that
 * keeps a second box from appearing — so it registers with nothing and a `FieldLabel` above it
 * points at an id no element carries. A placeholder is not a name. With no `aria-label` a
 * screen reader announces "edit text, blank" and nothing else, which is the same defect
 * `iconOnly` refuses, in the same shape. Here it does not compile.
 */
type ComposerInputName = { "aria-label": string } | { "aria-labelledby": string };

export type ComposerInputProps = ComposerInputBase & ComposerInputName;

/**
 * The text a person types (§30). A BARE `<textarea>`, deliberately not our `TextArea`: that
 * brings its own fill, edge and ring, and the composer is already all three, so you would see
 * two boxes. v1 makes the same mistake in reverse — it strips its textarea bare and then sets
 * TextArea padding variables that reach nothing.
 *
 * It is a named part for one non-visual reason: the composer's ring keys on THIS element, so
 * the system has to know which element it is. Pressing a Button inside the composer must not
 * light the whole pane — TextField's own 2026-08-05 repair, one layer up.
 *
 * It grows with `field-sizing: content` and no JavaScript. v1 measures with `getComputedStyle`,
 * `scrollHeight`, `requestAnimationFrame` and a `ResizeObserver` on every keystroke, against a
 * rule that says no JS at interaction time; the mechanism that replaces all of it reached
 * Baseline on 2026-06-16 and did not exist when v1 was written. Where it is missing, `rows`
 * and the stylesheet's `max-block-size` are the fallback and the box simply scrolls.
 *
 * Its STEP is the composer's index, straight — 12/14/16/18 across the four, which is the ladder
 * every other text input in the library uses. It rode `OWNED_BODY_STEP` until 2026-08-23, and
 * that map is for a message the SYSTEM writes to you (a dialog's description, an alert's
 * question, a notice's line): it holds two values across four sizes on purpose, because one
 * sentence of explanation should not grow much. A composer holds a message YOU write, so the
 * compression made sizes 1 and 2 identical and 3 and 4 identical — half the index did nothing
 * (Kushagra, measured off the preview page: 14/14/16/16). That the system chooses the step at
 * all is still the ownership rule (§15, §29): a person types the words, they do not pick the
 * size they are set at.
 *
 * Enter sends and Shift+Enter breaks the line, which is what the element being a form buys.
 * A composition is never interrupted: `isComposing` guards it, because sending mid-composition
 * is silent data loss for anyone typing Japanese, Chinese or Korean.
 */
export function ComposerInput({
  className,
  rows = 1,
  onKeyDown,
  onPaste,
  style,
  ref,
  ...props
}: ComposerInputProps) {
  const onFiles = React.useContext(ComposerFilesContext);
  const size = React.useContext(ControlSizeContext) ?? "2";

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key !== "Enter") return;
    // An IME is mid-word. `nativeEvent.isComposing` is the reliable half — React's synthetic
    // event does not carry it on every browser.
    if (event.nativeEvent.isComposing) return;
    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    const form = event.currentTarget.form;
    if (!form) return;
    // Ask the form, do not call the handler: `requestSubmit()` runs validation and fires the
    // submit event, so ONE route decides whether a send happens. What that route does NOT get
    // for free is the send button's state — `requestSubmit()` with no submitter ignores it
    // entirely — so the refusal while a request is in flight lives on the form's own submit
    // handler, where both the key and the button pass through it (2026-08-26).
    event.preventDefault();
    form.requestSubmit();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    onPaste?.(event);
    if (event.defaultPrevented || !onFiles) return;
    const files = Array.from(event.clipboardData?.files ?? []);
    if (files.length === 0) return;
    // Stop the browser writing a filename into the text as well.
    event.preventDefault();
    onFiles(files);
  };

  return (
    <textarea
      ref={ref}
      rows={rows}
      // `kui-type` is the shared ramp, so the step map stays in one place and this file states
      // no font size of its own.
      className={
        className
          ? `kui-type kui-composer-input ${className}`
          : "kui-type kui-composer-input"
      }
      data-size={size}
      // The iOS zoom floor (§4, 2026-08-05), and it has to be published from here rather than
      // stated in the stylesheet. Safari zooms the viewport when a focused control's text is
      // under 16px and never zooms back out, which is why every other text input in the
      // library writes `max(var(--input-font-floor), <its step>)`. Those read `--kui-ct-font`,
      // a hook the control size join declares — this element is not a `.kui-control`, its step
      // arrives from `.kui-type[data-size]`, and a component stylesheet may not name an axis
      // attribute, so no rule in `composer.css` can see the step in order to floor it.
      //
      // `size N -> --font-size-N` is an IDENTITY and not a second copy of the ramp: it is the
      // same identity `--kui-ct-font` states one layer over, and the line, the tracking and
      // the scale all still come from `kui-type`.
      style={{ ["--kui-cp-font" as string]: `var(--font-size-${size})`, ...style }}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      {...props}
    />
  );
}

export type ComposerRowProps = Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * The row of controls under the text (§30). It states the alignment, the split and the gap,
 * which are the system's rhythm — a caller writing `align="center" justify="between" gap="2"`
 * at every call site is nine opinions per screen, which is §15's whole argument.
 *
 * ONE part, where v1 shipped three (`Row`, `RowStart`, `RowEnd`) plus two more for its closed
 * state. What survives the anatomy criterion is the rhythm, not the grouping: which controls
 * sit left and which sit right is what those controls MEAN, and that is the app's to say. So a
 * caller groups with `Flex`, or puts one flat list here and lets it space evenly.
 */
export function ComposerRow({ className, ref, ...props }: ComposerRowProps) {
  return (
    <div
      ref={ref}
      className={className ? `kui-composer-row ${className}` : "kui-composer-row"}
      {...props}
    />
  );
}

export type ComposerSendProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "iconOnly" | "type" | "children" | "aria-label" | "loading"
> & {
  /** What the request is doing. Defaults to `ready`. */
  status?: ComposerStatus;
  /** Called instead of submitting while `status` is `streaming`. */
  onStop?: () => void;
  /** The accessible name in each state, for an app that is not in English. */
  labels?: Partial<Record<ComposerStatus, string>>;
  /** The glyph in each state. The system ships no icon set (§8), so these are the app's. */
  icons?: Partial<Record<ComposerStatus, React.ReactNode>>;
};

const DEFAULT_LABELS: Record<ComposerStatus, string> = {
  ready: "Send",
  submitted: "Sending",
  streaming: "Stop",
  error: "Retry",
};

/**
 * One button with four meanings (§30). `ready` sends, `submitted` shows it is in flight,
 * `streaming` STOPS, and `error` retries.
 *
 * This is what replaces v1's `sendMode`. That prop decides whether the button is VISIBLE and
 * never what it MEANS, so a person cannot stop a running generation — the largest gap in the
 * v1 component. It also ends v1's split contract, where the Enter key refuses to send an empty
 * message while the button, invisible but still in the tab order, sends one: there is one
 * route now, and both the key and the button go through the form.
 *
 * Stopping is not a submit, so that state renders `type="button"` and calls `onStop`.
 */
export function ComposerSend({
  status = "ready",
  // LOUD by default (2026-08-23, Kushagra: "why is send button not loud?"). It shipped taking
  // Button's `medium`, which was an omission and not a decision — a send button that reads the
  // same as the model picker beside it names no primary action at all.
  //
  // §11 allows exactly one focal point per surface, and the usual reason a component may not
  // default loud is that it cannot know what else is on the surface. AlertDialogAction is the
  // standing exception (§25) and its argument transfers verbatim: the rule is held by ANATOMY.
  // A composer has exactly one send, the component places it, and every other control in the
  // row belongs to the caller — so the one loud thing is the one the system owns.
  emphasis = "loud",
  onStop,
  labels,
  icons,
  onClick,
  disabled,
  className,
  ...props
}: ComposerSendProps) {
  const isStreaming = status === "streaming";
  const label = labels?.[status] ?? DEFAULT_LABELS[status];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (isStreaming) onStop?.();
  };

  return (
    <Button
      // Stopping is an action on the request, not a submission of the form.
      type={isStreaming ? "button" : "submit"}
      iconOnly
      aria-label={label}
      // `submitted` is the one state that is genuinely busy; Button's own spinner says so, and
      // it disables the control for the duration without the caller stating it twice.
      loading={status === "submitted"}
      emphasis={emphasis}
      disabled={disabled}
      className={className ? `kui-composer-send ${className}` : "kui-composer-send"}
      data-status={status}
      onClick={handleClick}
      {...props}
    >
      {icons?.[status] ?? null}
    </Button>
  );
}
