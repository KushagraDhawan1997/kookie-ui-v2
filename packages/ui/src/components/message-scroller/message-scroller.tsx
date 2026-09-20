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
  /** A `ScrollArea` or a `ShellScroll` that holds the transcript and the jump button. Its
      viewport becomes the scroller. Give that scroll area an `aria-label`. */
  children?: React.ReactNode;
  /**
   * Keeps the newest content in view while the user is at the end. The default is `true`.
   * If the user scrolls up, the transcript stays where they are until they return to the end.
   */
  autoScroll?: boolean;
  /** Where the transcript opens: at the end, at the start, or at the last anchored message.
      The default is `end`. */
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
  /** A stable id for the message. Use it to scroll to the message and to know when it is
      visible. */
  messageId?: string;
  /** Scrolls this message near the top when it arrives, so the user sees the reply from its
      start. In a chat, set it on the person's own message. */
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
  /** The accessible name of the button, such as "Jump to latest". */
  "aria-label": string;
  /** The icon of the button. */
  children: React.ReactNode;
  /**
   * Whether content passes behind the button. The default is `true`, because the button floats
   * over the transcript. The button then uses the theme's material. With a solid theme it stays
   * solid.
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
        /* The jump is INSTANT (2026-09-20). The primitive defaults `behavior` to `"smooth"`,
           which is a ~2.6k-pixel animated scroll the package never asked for — the last
           animation left in shipped code after motion was removed, and the one thing the
           removal's own sweep missed because it lives in a dependency's default rather than
           in a stylesheet. The hook path beside it (`scrollToEnd`) has always passed `"auto"`,
           and so has Carousel; this is the same value said out loud. Scrolling is the
           browser's, and this package does not change it. */
        behavior="auto"
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
