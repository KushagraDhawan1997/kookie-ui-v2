"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import type { Size, Tone } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { OWNED_BODY_STEP } from "../../system/type-steps.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { Button } from "../button/button.tsx";
import { Text } from "../text/text.tsx";
import { DISMISS_PATH, GLYPH_VIEWBOX } from "../../system/glyphs.ts";
import { glyphStroke } from "../../tokens/config.ts";
import { useSize } from "../../system/size.ts";
import { ToneScopeContext } from "../../system/tone-scope.ts";

export type NoticeProps = ComponentRefusals & {
  /**
   * Sets the size of the notice: the padding, the corner, the text and the dismiss button.
   * If you don't set it, the notice uses the size of the nearest `Theme`, which is `2` by
   * default. A `<Text>` that sets its own `size` keeps it.
   */
  size?: Size;
  /**
   * Set `backdrop` when content passes behind the notice, such as a scrolling region. The
   * notice then uses the theme's material. In normal flow it stays solid. If you don't set it,
   * the notice follows the nearest `<Box backdrop>`.
   */
  backdrop?: boolean;
  /**
   * Sets the colour family, which tells the category of the message. The default is `neutral`.
   * Use `warning`, `destructive`, `success` or `info` only when the colour adds a fact that the
   * words don't already give.
   */
  tone?: Tone;
  /**
   * An icon shown before the message. The package has no icons, so bring one from your own
   * icon set. The icon is hidden from assistive technology, so put the meaning in the words.
   */
  icon?: React.ReactNode;
  /**
   * One action that fixes the condition, such as "Get more usage". Pass your own `<Button>`.
   * Don't use a general label such as "OK".
   */
  action?: React.ReactNode;
  /**
   * Called when the person presses the ✕ dismiss button. The button shows only when you set
   * this callback. Dismissing hides the message but doesn't fix the condition. Your app must
   * remove the notice and remember the choice, because the notice keeps no state of its own.
   */
  onDismiss?: () => void;
  /** The accessible name of the dismiss button. The default is "Dismiss". Set it to translate
      the label. */
  dismissLabel?: string;
  /** The message, usually one sentence. For several paragraphs, use a `Card`. */
  children: React.ReactNode;
  /** Adds a class to the notice. To add space around it, wrap it in a `<Box m>`. */
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/** ✕, drawn rather than imported — the system's own glyph vocabulary (§8): 16-grid,
    `currentColor`, the derived `glyphStroke`, round caps, exactly as the tick and the carets
    are drawn.

    CHANGES
    2026-08-26 — this named a literal weight until now. A stroke is stated in VIEWBOX units,
    so the painted weight is `iconStroke × 16 / iconGrid`; the literal stopped being this
    glyph's weight when the stroke was derived (2026-08-23), and a reader copying it into the
    next package glyph would hand-write a heavier line than everything around it. */
function dismissGlyph() {
  return (
    <svg viewBox={GLYPH_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d={DISMISS_PATH}
        stroke="currentColor"
        strokeWidth={glyphStroke}
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
 * One per anchor. Two stacked notices means neither is read. A composer's `notices` column is
 * the one anchor that stacks: everything there is pending on the same next message (§29).
 */
export function Notice({
  size: sizeProp,
  tone = "neutral",
  backdrop,
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
  const size = useSize(sizeProp);
  // §10 — the material is the THEME's, expressed only where a backdrop exists (selectivity,
  // 2026-08-17). Card's wiring verbatim, because a notice is a pane like any other once
  // something scrolls behind it.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  // `useLensRef` ALREADY forwards the caller's ref — it is the one form every glass-capable
  // component uses so none of them hand-rolls a merge. Merging it a second time here handed
  // React a fresh callback identity every render (`mergeRefs` returns a new closure per call),
  // and React answers a new identity by detaching with `null` and reattaching: `useLens`'s
  // detach RELEASES the filter, so the reattach missed the cache and minted a fresh
  // displacement map on every keystroke or hover anywhere above the notice. Card and Shell
  // were found with the identical defect (2026-08-26).
  const lensRef = useLensRef<HTMLElement>(material, ref as React.Ref<HTMLElement>);
  const strip = (
    <div
      {...props}
      ref={lensRef}
      role="status"
      className={className ? `kui-surface kui-notice ${className}` : "kui-surface kui-notice"}
      /* The tone-forward rung (§10): the fill is the family's a3 and the foreground context
         re-scopes with it, so a destructive notice reads in destructive ink without the call
         site colouring a word. Always stamped, never inferred — the tone roles exist only
         under `[data-tone]`. */
      data-size={size}
      data-tone={tone}
      data-emphasis="medium"
      /* Solid is the absence of a material, so it writes no attribute (§10). */
      data-material={material === "solid" ? undefined : material}
      style={style}
    >
      {icon ? (
        <span className="kui-notice-icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      {/* The message is the SYSTEM's type, which is why the index reaches it (§15, §29). A
          surface never sizes the words inside it — except where the anatomy is closed and the
          words are the component's own, which is an alert's licence and a notice is an alert
          that does not interrupt (Kushagra, 2026-08-21). It shares the alert's step map, so the
          two cannot drift. A caller who states a step on their own `<Text>` still wins. */}
      <Text size={OWNED_BODY_STEP[size]} className="kui-notice-body">
        {children}
      </Text>
      <ToneScopeContext.Provider value={tone}>
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
      </ToneScopeContext.Provider>
    </div>
  );

  // A glass strip scopes its subtree: everything inside resolves `on-glass`, so the action
  // button never paints a second backdrop-filter over the notice's own (§10, one glass per
  // stack, structurally). Context only — no DOM.
  return <GlassScope material={material}>{strip}</GlassScope>;
}

export type ConfirmationProps = ComponentRefusals & {
  /** Sets the size of the padding, the corner, the buttons and the text. If you don't set it,
      the confirmation uses the size of the nearest `Theme`. */
  size?: Size;
  /** Set `backdrop` when content passes behind the confirmation. It then uses the theme's
      material. */
  backdrop?: boolean;
  /**
   * Sets the colour family of the request. The default is `neutral`. Use `warning` or
   * `destructive` when saying yes is risky and the words don't already say so.
   */
  tone?: Tone;
  /** An icon from your own icon set, shown before the request. It is hidden from assistive
      technology. */
  icon?: React.ReactNode;
  /** The request, in your words: "Run 4 nodes for $0.32?" */
  children: React.ReactNode;
  /** The yes, in your words: "Run". */
  confirmLabel: string;
  /** The no, in your words: "Not now". */
  cancelLabel: string;
  /** Called when the person presses the confirm button. Set `busy` while the work starts. */
  onConfirm: () => void;
  /** Called when the person presses the cancel button. Remove the confirmation here, because
      it has no dismiss button. */
  onCancel: () => void;
  /** Shows that the work is starting. The confirm button shows a spinner and the cancel button
      is disabled. */
  busy?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * A request waiting for a yes or a no (§29) — Notice's sibling, sharing its strip.
 *
 * A notice is about a condition, and its ✕ only acknowledges it. A confirmation is a question,
 * and closing it without answering is not an answer, so it has no ✕: it has two verbs of the
 * SAME kind, a quiet no and a loud yes, both worded by the app. It exists until one is pressed.
 *
 * It announces politely, as a notice does: the thing waiting for an answer is not an emergency,
 * and focus stays where the person is — in a composer, the text box is also where "no, do this
 * instead" is typed.
 */
export function Confirmation({
  size: sizeProp,
  tone = "neutral",
  backdrop,
  icon,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
  className,
  style,
  ref,
  ...props
}: ConfirmationProps) {
  const size = useSize(sizeProp);
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  const lensRef = useLensRef<HTMLElement>(material, ref as React.Ref<HTMLElement>);
  return (
    <GlassScope material={material}>
      <div
        {...props}
        ref={lensRef}
        role="status"
        className={cx("kui-surface kui-notice kui-confirmation", className)}
        data-size={size}
        data-tone={tone}
        data-emphasis="medium"
        data-material={material === "solid" ? undefined : material}
        style={style}
      >
        {icon ? (
          <span className="kui-notice-icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <Text size={OWNED_BODY_STEP[size]} className="kui-notice-body">
          {children}
        </Text>
        <ToneScopeContext.Provider value={tone}>
        <span className="kui-notice-action">
          <Button size={size} emphasis="quiet" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button size={size} emphasis="loud" loading={busy} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </span>
        </ToneScopeContext.Provider>
      </div>
    </GlassScope>
  );
}

function cx(base: string, extra: string | undefined): string {
  return extra ? `${base} ${extra}` : base;
}
