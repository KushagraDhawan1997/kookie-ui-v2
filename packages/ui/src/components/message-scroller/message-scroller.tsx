"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import { ViewportAsContext } from "../../system/scroll-viewport.ts";
import { Button } from "../button/button.tsx";
import {
  MessageScroller as Primitive,
  useMessageScroller as usePrimitiveScroller,
  useMessageScrollerScrollable as usePrimitiveScrollable,
  useMessageScrollerVisibility as usePrimitiveVisibility,
  type MessageScrollerDefaultScrollPosition,
} from "@shadcn/react/message-scroller";
import * as React from "react";

export type MessageScrollerProps = ComponentRefusals & {
  /** The pane's own `ScrollArea` (or `ShellScroll`), holding the transcript and the jump button.
      Its viewport becomes the scroller; name it there with `aria-label`. */
  children?: React.ReactNode;
  /**
   * Follow the live edge: while the reader is at the end, new content keeps the end in view.
   * Scrolling up is the reader's opt-out and holds their place until they come back.
   */
  autoScroll?: boolean;
  /** Where a transcript opens: at its end (a saved thread), its start, or the last anchored turn. */
  defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
};

/**
 * The viewport the ScrollArea renders as. The primitive names an unnamed viewport "Messages" —
 * English, in every locale — so an empty name is passed first: accessible-name computation skips
 * an empty `aria-label`, and a ScrollArea that IS named spreads its own over it.
 */
function TranscriptViewport(props: React.ComponentPropsWithRef<"div">) {
  return <Primitive.Viewport aria-label="" {...props} />;
}

/**
 * A transcript that follows its live edge (shadcn/ui's Message Scroller, on `@shadcn/react`'s
 * headless primitive, MIT, credited): streamed replies land in view, a reader who scrolls up is
 * left alone, a new turn can anchor to the top, and a jump button brings them back.
 *
 * IT BRINGS NO SCROLLER. The `ScrollArea` (or `ShellScroll`) placed inside it becomes the
 * viewport: the pane's layout, its floating bands and their fade are exactly what they were, and
 * the scroller only learns to follow a conversation. The transcript itself is a
 * `MessageScrollerContent` in that ScrollArea, one `MessageScrollerItem` per row, with the
 * `MessageScrollerButton` after the content.
 */
export function MessageScroller({
  children,
  autoScroll = true,
  defaultScrollPosition = "end",
}: MessageScrollerProps) {
  return (
    <Primitive.Provider autoScroll={autoScroll} defaultScrollPosition={defaultScrollPosition}>
      <ViewportAsContext value={TranscriptViewport}>{children}</ViewportAsContext>
    </Primitive.Provider>
  );
}

export type MessageScrollerContentProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color"
> & {
  ref?: React.Ref<HTMLDivElement>;
};

/** The transcript: a live region of rows. Every direct child must be a `MessageScrollerItem`. */
export function MessageScrollerContent({ className, ...props }: MessageScrollerContentProps) {
  return (
    <Primitive.Content
      className={className ? `kui-message-scroller-content ${className}` : "kui-message-scroller-content"}
      spacerClassName="kui-message-scroller-spacer"
      {...props}
    />
  );
}

export type MessageScrollerItemProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color"
> & {
  ref?: React.Ref<HTMLDivElement>;
  /** A stable id, so the row can be jumped to and reported visible. */
  messageId?: string;
  /** A turn boundary: when it arrives, the transcript anchors it near the top so the reply that
      follows is read from its start. The person's own message, in a chat. */
  scrollAnchor?: boolean;
};

/** One row of the transcript, the boundary the scroller measures, anchors and tracks. */
export function MessageScrollerItem({ className, ...props }: MessageScrollerItemProps) {
  return (
    <Primitive.Item
      className={className ? `kui-message-scroller-item ${className}` : "kui-message-scroller-item"}
      {...props}
    />
  );
}

export type MessageScrollerButtonProps = ComponentRefusals & {
  /** The button's name, in your own words. The system cannot write them. */
  "aria-label": string;
  /** The glyph. */
  children: React.ReactNode;
  /**
   * Whether something passes behind the button. It floats over the transcript by construction, so
   * it says yes unless told otherwise, and wears the theme's material there; on a solid theme that
   * still resolves solid and costs nothing.
   */
  backdrop?: boolean;
  className?: string;
};

/**
 * Back to the latest: shown only while there is more below, inert otherwise. Placed after the
 * `MessageScrollerContent`, inside the same ScrollArea, it floats at the end of the viewport and
 * clears whatever band floats there.
 */
export function MessageScrollerButton({
  "aria-label": label,
  children,
  backdrop = true,
  className,
}: MessageScrollerButtonProps) {
  return (
    <Primitive.Root className="kui-message-scroller-dock">
      <Primitive.Button
        direction="end"
        render={
          <Button
            iconOnly
            aria-label={label}
            bordered
            backdrop={backdrop}
            className={className ? `kui-message-scroller-button ${className}` : "kui-message-scroller-button"}
          />
        }
      >
        {children}
      </Primitive.Button>
    </Primitive.Root>
  );
}

/**
 * Move the transcript from outside it: to the end, to the start, or to one message by the id its
 * row was given. Each answers whether it could.
 */
export function useMessageScroller(): ReturnType<typeof usePrimitiveScroller> {
  return usePrimitiveScroller();
}

/** Whether there is anything further to scroll to, at each end. For a jump control of your own. */
export function useMessageScrollerScrollable(): ReturnType<typeof usePrimitiveScrollable> {
  return usePrimitiveScrollable();
}

/** Which rows are on screen, and which turn the transcript is anchored to. */
export function useMessageScrollerVisibility(): ReturnType<typeof usePrimitiveVisibility> {
  return usePrimitiveVisibility();
}
