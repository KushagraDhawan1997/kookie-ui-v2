"use client";

import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { ControlSizeContext } from "../../system/control-size.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { mergeRefs } from "../../system/render.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { Button } from "../button/button.tsx";

/** What the request is doing, which is the only thing the send button reads (§30). */
export type ComposerStatus = "ready" | "submitted" | "streaming" | "error";

export type ComposerProps = Omit<
  React.ComponentPropsWithoutRef<"form">,
  "color" | "onSubmit"
> & {
  /**
   * The index. It sets the pane's padding, its corner and the type inside it, and it reaches
   * the controls that read the control-size context (§28) — the input, and any field a caller
   * puts in the row. It deliberately does NOT reach Button, which keeps its own rest at 2.
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
            ref={mergeRefs(lensRef) as React.Ref<HTMLFormElement>}
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

/** Carries `onFiles` to the input, which is where a paste can be read. */
const ComposerFilesContext = React.createContext<((files: File[]) => void) | null>(null);

export type ComposerInputProps = Omit<
  React.ComponentPropsWithoutRef<"textarea">,
  "color" | "children" | "cols"
> & { ref?: React.Ref<HTMLTextAreaElement> };

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
 * Enter sends and Shift+Enter breaks the line, which is what the element being a form buys.
 * A composition is never interrupted: `isComposing` guards it, because sending mid-composition
 * is silent data loss for anyone typing Japanese, Chinese or Korean.
 */
export function ComposerInput({
  className,
  rows = 1,
  onKeyDown,
  onPaste,
  ref,
  ...props
}: ComposerInputProps) {
  const onFiles = React.useContext(ComposerFilesContext);

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
    // submit event, so one route decides whether a send happens and the button's disabled
    // state is honoured for free.
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
      className={className ? `kui-composer-input ${className}` : "kui-composer-input"}
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
