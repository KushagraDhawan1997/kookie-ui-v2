"use client";

import * as React from "react";

import type { Size, Tone } from "../../system/axes.ts";
import { Button } from "../button/button.tsx";

export type NoticeProps = {
  /** §10 — prices the BOX: the padding and the corner, off the ordinary surface size join,
      and the dismiss button the component itself places. It does not price the words: a
      notice holds the caller's text, and text states its own step (§15). Rests at 2 rather
      than a Card's 3, because a notice is a strip across the top of something rather than an
      object in its own right. */
  size?: Size;
  /** §7, §29 — the CATEGORY, never the volume. Rests neutral, and the specimen this component
      was designed from is grey while being a warning: a notice is a condition stated plainly,
      not an alarm. Reach for `warning`, `destructive`, `success` or `info` when the family
      says something the sentence does not already say. */
  tone?: Tone;
  /** The symbol, if the app has an icon set — the package ships none (§8), so the slot is
      empty-safe and a notice with nothing in it simply has no symbol. It carries no meaning
      of its own and is hidden from assistive technology: the words are the message. */
  icon?: React.ReactNode;
  /** ONE action, and it is the one that RESOLVES the condition — "Get more usage", not "OK".
      A `<Button/>` the call site brings, so the system never invents a label. */
  action?: React.ReactNode;
  /**
   * Acknowledgement, which is a different verb from the action: pressing ✕ agrees to stop
   * being told, and changes nothing about whether the condition holds.
   *
   * **The memory is the app's, and that is the whole reason this is a callback.** A notice
   * that dismissed itself would forget on reload, and a ✕ the app cannot honour is a ✕ that
   * lied. Passing nothing renders no dismissal at all, which is right for a condition nobody
   * may wave away.
   */
  onDismiss?: () => void;
  /** The dismissal's accessible name. English by default because the package ships no
      translation layer; state your own and it is stated once, here. */
  dismissLabel?: string;
  /** The message. A sentence, usually — a notice with several paragraphs is a Card. */
  children: React.ReactNode;
  /** Dresses the strip. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** ✕, drawn rather than imported — the system's own glyph vocabulary (§8): 16-grid,
    `currentColor`, 1.5 stroke, round caps, exactly as the tick and the carets are drawn. */
function dismissGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A notice (§29) — a condition that is true right now, stated on the thing it is about.
 *
 * The family was carved before any of it was built, because four industry names overlap on
 * one appearance. Two questions place every member: what is the message about, and what made
 * it appear. A notice is about a REGION and appeared because a CONDITION BECAME TRUE — the
 * person did not cause it — and everything else follows from that pair rather than being
 * chosen. It exists while the condition holds. It takes layout space and never floats,
 * because the condition is true NOW and a floating strip would cover content somebody needs.
 * It announces politely (`role="status"`), because it is not an interruption.
 *
 * **Placement is the caller's**, which is why this is not called Banner. Atlassian needs
 * Banner *and* SectionMessage as two components because their distinction IS where each one
 * sits; in this system a component never owns its outer position (§3), so there is one
 * component and the parent puts it above the region it concerns, or hands it to the Shell to
 * pin at the top of the app.
 *
 * **Two verbs, and they are different kinds of thing.** `action` resolves the condition;
 * `onDismiss` only acknowledges it. Both are optional and at most one of each — a strip with
 * two competing actions is a form, and a notice offering neither is a `<Text>` in a box, so
 * write the sentence and delete the box.
 *
 * **Tone is the category, not the volume.** Neutral rests, and the specimen this was designed
 * from is grey while being a warning — Apple's "nonintrusive label" reasoning, and §11's
 * standing rule for status surfaces. Colour is for what colour means.
 *
 * **What it is not**: not a toast (refused — if an action deserves attention it gets that
 * attention BEFORE it runs, §29), not an aside (an authored "Note:" is content, not state),
 * not a dialog (a decision that blocks is an `AlertDialog`), and not the answer to a
 * background job, which is an object with a lifecycle rather than an event.
 *
 * One per anchor. Two stacked notices means neither is read.
 */
export function Notice({
  size = "2",
  tone = "neutral",
  icon,
  action,
  onDismiss,
  dismissLabel = "Dismiss",
  children,
  className,
  style,
  ref,
  ...props
}: NoticeProps) {
  return (
    <div
      {...props}
      ref={ref}
      role="status"
      className={className ? `kui-surface kui-notice ${className}` : "kui-surface kui-notice"}
      /* The tone-forward rung (§10): the fill is the family's a3 and the foreground context
         re-scopes with it, so a destructive notice reads in destructive ink without the call
         site colouring a word. Always stamped, never inferred — the tone roles exist only
         under `[data-tone]`. */
      data-size={size}
      data-tone={tone}
      data-emphasis="medium"
      style={style}
    >
      {icon ? (
        <span className="kui-notice-icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className="kui-notice-body">{children}</span>
      {action ? <span className="kui-notice-action">{action}</span> : null}
      {onDismiss ? (
        <Button
          size={size}
          emphasis="quiet"
          iconOnly
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="kui-notice-dismiss"
        >
          {dismissGlyph()}
        </Button>
      ) : null}
    </div>
  );
}
