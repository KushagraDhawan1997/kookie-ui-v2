"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { DISMISS_PATH, GLYPH_VIEWBOX } from "../../system/glyphs.ts";

/** A file with a folded corner — the Attachment's generic face when the app supplies no
    thumbnail or symbol (§43). Avatar's fallback rule one family over: the system draws a
    stand-in so a file is never a blank square.

    It lives
    HERE and not in `system/glyphs.ts` because that file's rule is that a drawing shared by two
    components has one home, and this one has a single consumer: a path with one reader in a
    shared module is a claim about sharing that nothing is making. It moves there the day a
    second component draws it. */
const FILE_PATH = "M4.5 1.5h4.5l3.5 3.5v9.5h-8zM9 1.5v3.5h3.5";
import { useLensRef } from "../../system/refraction.tsx";
import { OWNED_BODY_STEP } from "../../system/type-steps.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { Button } from "../button/button.tsx";
import { Text } from "../text/text.tsx";
import { glyphStroke } from "../../tokens/config.ts";
import { useSize } from "../../system/size.ts";

/**
 * What is happening to the file. Your app sets it, and the tile shows it.
 *
 * There's no `done` value. A file that is sent looks the same as a file that is ready to send
 * (`idle`). To show the difference, put different controls in the tile, such as a remove
 * button before sending and a download link after.
 */
export type AttachmentState = "idle" | "uploading" | "processing" | "error";

export type AttachmentProps = ComponentRefusals & {
  /**
   * The size step of the tile, from `1` to `4`. It sets the padding, the corner, the icon, the
   * remove button and the text size of the name.
   */
  size?: Size;
  /**
   * What is happening to the file: `idle`, `uploading`, `processing` or `error`. Defaults to
   * `idle`. The tile only shows the state. Your app holds the file and changes the state.
   */
  state?: AttachmentState;
  /**
   * The upload progress, from 0 to 1. The tile uses it only when `state` is `uploading`. If
   * you don't know the progress, leave it out: the bar then moves without a value. The
   * `processing` state never shows a value.
   */
  progress?: number;
  /**
   * An icon or a thumbnail for the file. It's optional. Screen readers skip it, because the
   * name identifies the file.
   */
  icon?: React.ReactNode;
  /**
   * The file name. It must be a string. It is also the accessible name of the tile, and it is
   * added to the name of the remove button, such as "Remove report.pdf".
   */
  children: string;
  /**
   * A second line of text, such as the file size, the file type or an error message. It shows
   * smaller and quieter than the name, and screen readers read it with the tile.
   *
   * If `state` is `error`, put the reason here. Colour alone doesn't tell the user what went
   * wrong.
   */
  meta?: React.ReactNode;
  /**
   * Called when the user presses the remove button. The button shows only when you set this
   * prop. The tile doesn't remove itself: remove the file from your own list.
   */
  onRemove?: () => void;
  /** The accessible name of the remove button. Defaults to `"Remove"`. Set it to translate
      the label. */
  removeLabel?: string;
  /**
   * Set `backdrop` when the tile sits over other content, such as an image. The tile then uses
   * the theme's material. Unset, it follows the nearest `<Box backdrop>`.
   */
  backdrop?: boolean;
  /** A class name for the tile. For space around the tile, wrap it in a `Box` with `m`. */
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
      /* A bordered pane: the tile has no cast, so the line is its whole boundary (surfaces.css,
         the tile join). */
      data-bordered
      data-material={material === "solid" ? undefined : material}
      /* A busy tile announces itself busy. `aria-busy` is the platform's word for exactly this
         and needs no live region: the app's own reader hears the state change when the prop
         does, which is the same place the drawing changes. */
      aria-busy={busy || undefined}
      style={style}
    >
      {/* THE FACE (2026-09-08). The file's picture: its thumbnail if the app has one, its
          symbol if not, and the system's own file glyph if neither. A square as tall as the
          two lines beside it, so it is the file's face the way an Avatar is a person's — and
          the state is drawn ON it, because the state belongs to the file too: a filling ring
          while a fraction is known, the Spinner while nothing is counted, and the tile's tint
          on error. The tile's box is byte-identical across all four states. */}
      {/* The face and the slot WEAR THE TEXT'S STEP (`kui-type` + the same data-size the two lines
          take), so their square is two of that step's lines by arithmetic — never by stretching
          to the row. Stretching was measured cyclic: an aspect-ratio box has no height while
          the row's width is being worked out, so it counted for half its size and the NAME paid
          the difference, truncating "brief.pdf" to "b" in a strip that had room. */}
      <span className="kui-type kui-attachment-face" data-size={OWNED_BODY_STEP[size]} aria-hidden data-busy={busy || undefined}>
        <span className="kui-attachment-picture">
          {icon ?? (
            <svg viewBox={GLYPH_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d={FILE_PATH} stroke="currentColor" strokeWidth={glyphStroke} strokeLinejoin="round" />
            </svg>
          )}
        </span>
        {/* THE RING IS THE FACE'S OWN EDGE. One rect the size of the face, its corner the
            face's corner, drawn with the progress bar's thickness and the outer half clipped
            away by the face — so the bar wraps the container rather than floating inside it.
            `pathLength` normalises the outline to 100: a known fraction is a dash of that
            length, an unknown one is a short dash that sweeps the edge (Progress's own
            indeterminate, motion that IS the content). */}
        {busy ? (
          <svg
            className="kui-attachment-ring"
            data-tone="accent"
            data-sweep={state === "uploading" && progress !== undefined ? undefined : true}
          >
            <rect className="kui-attachment-ring-track" width="100%" height="100%" pathLength={100} />
            <rect
              className="kui-attachment-ring-fill"
              width="100%"
              height="100%"
              pathLength={100}
              {...(state === "uploading" && progress !== undefined
                ? { strokeDasharray: 100, strokeDashoffset: 100 - Math.max(0, Math.min(1, progress)) * 100 }
                : {})}
            />
          </svg>
        ) : null}
      </span>
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
        <span className="kui-attachment-slot" data-slot="trailing">
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
        </span>
      ) : null}
    </div>
  );

  // A glass tile scopes its subtree: the remove button never paints a second backdrop-filter
  // over the tile's own (§10, one glass per stack, structurally). Context only — no DOM.
  return <GlassScope material={material}>{tile}</GlassScope>;
}
