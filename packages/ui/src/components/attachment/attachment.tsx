"use client";

import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { DISMISS_PATH, GLYPH_VIEWBOX } from "../../system/glyphs.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { OWNED_BODY_STEP } from "../../system/type-steps.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { Button } from "../button/button.tsx";
import { Progress } from "../progress/progress.tsx";
import { Text } from "../text/text.tsx";
import { glyphStroke } from "../../tokens/config.ts";
import { useSize } from "../../system/size.ts";

/**
 * What the file is doing, set by the app and drawn by the system.
 *
 * **Four values, not the five §30 named — `done` is dropped, and the spec's own sentence is
 * why.** That section says "a file about to be sent and a file already sent are the same
 * tile", which makes `done` and `idle` one appearance; a value that cannot be told from
 * another is not a value, and this system has deleted a whole axis for exactly that reason
 * (`controlLook`, 2026-08-19: both values emitted identical declarations). What separates a
 * pending attachment from a sent one is what the app puts IN the tile — a remove button
 * before, a download after — not a state the system draws. Re-adding `done` is additive if a
 * real screen ever wants a distinct terminal drawing, which is the direction that keeps the
 * decision cheap.
 */
export type AttachmentState = "idle" | "uploading" | "processing" | "error";

export type AttachmentProps = {
  /**
   * Prices the tile: padding, corner, the symbol's box, the remove button and the file's own
   * name. It owns all of that, so the index reaches the words — the composer's rule (§30,
   * 2026-08-23): a component that owns its content sizes it, one that hosts yours does not.
   */
  size?: Size;
  /**
   * What is happening to this file. **The system draws the state; the app owns the file**
   * (§30). Nothing here starts a timer, holds a `File`, or mints an object URL — v1 did the
   * last of those and revoked the URL one commit after handing it to `onSubmit`, so the
   * preview of the message you just sent was already broken.
   */
  state?: AttachmentState;
  /**
   * How far, 0 to 1, and read only while `state="uploading"`. Omit it and the bar sweeps
   * instead of filling, which is the honest drawing when nobody is counting bytes.
   * `processing` never reads it: a server working on a file reports no fraction, and that
   * difference is the whole reason these are two states rather than one busy flag.
   */
  progress?: number;
  /**
   * The file's symbol or thumbnail, if your app has one. The package ships no icon set, so
   * the slot is safe when empty. It carries no meaning of its own and is hidden from
   * assistive technology, because the name is what identifies the file.
   */
  icon?: React.ReactNode;
  /**
   * The file's name, and the tile's accessible name. Typed `string` rather than `ReactNode`
   * because the sentence "it is text" has to be enforced by something: the name is announced,
   * and it is composed into the remove control's name so a list of attachments is not a column
   * of buttons all called "Remove".
   */
  children: string;
  /**
   * The second line — a size, a type, a failure reason. Muted and one step down, because it
   * describes the name rather than competing with it, and tied to the tile with
   * `aria-describedby` so it is announced with it rather than found separately.
   *
   * **An `error` tile's reason belongs here.** The state paints the tile in the destructive
   * family, and colour alone is not a message (WCAG 1.4.1) — the system cannot write the reason
   * because it is in your language and about your file, which is §41's own sentence for the
   * Button done state. A failed attachment with no `meta` says "this one is red".
   */
  meta?: React.ReactNode;
  /**
   * Removes the file. Renders the ✕ only when given: an attachment nobody may detach should
   * not draw a control that does nothing. **The list is the app's**, exactly as a Notice's
   * dismissal is — a tile that removed itself would disagree with the array it came from.
   */
  onRemove?: () => void;
  /** The remove control's accessible name. English by default, because the package ships no
      translation layer; state your own and it is stated once, here. */
  removeLabel?: string;
  /**
   * Says content passes behind this tile, so the theme's material can show. Unset, it follows
   * the surrounding `<Box backdrop>` region. Card's wiring verbatim.
   */
  backdrop?: boolean;
  /** Dresses the tile. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

const BUSY: readonly AttachmentState[] = ["uploading", "processing"];

/**
 * An attachment (§30, §43) — one file, and what is happening to it.
 *
 * **It is not part of the Composer, and that separation is the design.** A file about to be
 * sent and a file already sent are the same tile, so the tile cannot belong to the thing that
 * sends. It sits in a composer's strip today and in a message tomorrow, and neither owns it.
 *
 * **The system draws the state; the app owns the file.** Every value here is a prop the caller
 * sets from state it already has. Nothing is inferred, nothing is timed, and nothing is held:
 * this component never sees a `File`.
 *
 * **The state is the category, so there is no `tone`.** `error` stamps `destructive` and the
 * tile's fill and ink move with it through the tone indirection, at zero cost here. A second
 * colour axis would let a call site paint `success` on a failed upload, which is a sentence
 * the system should not be able to write.
 *
 * **It does not cast** (§5). The plane criterion: elevation dresses boxes that establish a
 * plane of their own, and a tile in a strip is content ON the composer's plane, the same
 * reading that keeps a Notice flat. The pool survives on glass, because that is what the
 * material HAS rather than what the app says.
 *
 * Refused: `tone` (above), `emphasis` (a tile has no rung to climb — it is one thing at one
 * volume), `render` (there are two elements here, the tile and its name, and neither can
 * move — TextField's sentence), and a built-in preview (an image is `icon`, and a component
 * that fetched or decoded one would own the file it is not allowed to own).
 */
export function Attachment({
  size: sizeProp,
  state = "idle",
  progress,
  icon,
  children,
  meta,
  onRemove,
  removeLabel = "Remove",
  backdrop,
  className,
  style,
  ref,
  ...props
}: AttachmentProps) {
  const size = useSize(sizeProp);
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  const metaId = React.useId();
  // `useLensRef` already forwards the caller's ref — merging a second time hands React a fresh
  // callback identity every render, and the detach RELEASES the lens filter, so the reattach
  // misses the cache and mints a displacement map per keystroke (Notice, Card and Shell were
  // all found with that defect, 2026-08-26).
  const lensRef = useLensRef<HTMLElement>(material, ref as React.Ref<HTMLElement>);
  const busy = BUSY.includes(state);

  const tile = (
    <div
      {...props}
      ref={lensRef}
      className={className ? `kui-surface kui-attachment ${className}` : "kui-surface kui-attachment"}
      /* A NAMED REGION, because a bare `<div>` maps to `role=generic` and naming a generic is
         prohibited — so the tile shipped with a documented accessible name it could not have
         (audit 2026-09-02). A group can carry one, and what it carries is the file's name.
         The second line describes it rather than being a separate stop. */
      role="group"
      aria-label={children}
      {...(meta ? { "aria-describedby": metaId } : {})}
      data-size={size}
      data-state={state}
      /* THE STATE IS THE FAMILY, and the pair is always stamped (measured 2026-09-01).
         A `.kui-surface` resolves its fill from `[data-tone]` and `[data-emphasis]` together —
         leaving either off paints nothing at all, which is what the first draft did: a resting
         tile computed a transparent box and an `error` one computed the SAME transparent box,
         so `destructive` reached the ink and the card was never there. Both laws caught it.

         So the tile rests as a CARD — neutral at the quiet rung, that component's identity at
         tile scale — and reports failure as a NOTICE does, the tone-forward `medium` rung,
         because reporting a condition is what a notice is for. Two states, two rungs, and the
         call site can reach neither. */
      data-tone={state === "error" ? "destructive" : "neutral"}
      data-emphasis={state === "error" ? "medium" : "quiet"}
      data-material={material === "solid" ? undefined : material}
      /* A busy tile announces itself busy. `aria-busy` is the platform's word for exactly this
         and needs no live region: the app's own reader hears the state change when the prop
         does, which is the same place the drawing changes. */
      aria-busy={busy || undefined}
      style={style}
    >
      <div className="kui-attachment-row">
        {icon ? (
          <span className="kui-attachment-icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="kui-attachment-body">
          <Text size={OWNED_BODY_STEP[size]} className="kui-attachment-name">
            {children}
          </Text>
          {meta ? (
            <Text id={metaId} size={OWNED_BODY_STEP[size]} emphasis="medium" className="kui-attachment-meta">
              {meta}
            </Text>
          ) : null}
        </span>
        {onRemove ? (
          <Button
            size={size}
            emphasis="quiet"
            iconOnly
            /* Named with the file it removes. Every remove control in a list was called
               "Remove", with no tie to its tile, so a screen reader's control list was a column
               of identical buttons. `removeLabel` stays the translatable half. */
            aria-label={`${removeLabel} ${children}`}
            onClick={onRemove}
            className="kui-attachment-remove"
          >
            <svg viewBox={GLYPH_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d={DISMISS_PATH} stroke="currentColor" strokeWidth={glyphStroke} strokeLinecap="round" />
            </svg>
          </Button>
        ) : null}
      </div>
      {/* One bar, two meanings, and the difference is whether anyone is counting. `uploading`
          with a fraction fills; `uploading` without one and `processing` sweep, which is
          Progress's own indeterminate — motion that IS the content, so §8's zeroed-transition
          law is untouched and reduced motion slows it rather than stopping it. */}
      {busy ? (
        <Progress
          className="kui-attachment-progress"
          value={state === "uploading" && progress !== undefined ? progress : null}
          max={1}
          /* Hidden from AT, and the tile's `aria-busy` is why: the bar RESTATES what the tile
             already announces, which is Tooltip's rule one component over. A fraction says
             more than "busy" — and the words for it are the app's, not ours, so an app that
             wants 40% announced writes "40%" into `meta`, in its own language, where it is
             read as part of the tile's own text. The alternative was a system-invented English
             label on a bar nobody can act on. */
          aria-hidden
        />
      ) : null}
    </div>
  );

  // A glass tile scopes its subtree: the remove button never paints a second backdrop-filter
  // over the tile's own (§10, one glass per stack, structurally). Context only — no DOM.
  return <GlassScope material={material}>{tile}</GlassScope>;
}
