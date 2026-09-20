/**
 * The scroller's laws (§27's pane anatomy, the conversation's half of it).
 *
 * WHAT IS WORTH A LAW HERE. Not that it follows a live edge — that is the primitive's, tested
 * where it is written — but the two claims this package makes ON TOP of it, because both are
 * invisible in a snapshot and both were wrong once:
 *
 *  1. THE SCROLLER BRINGS NO SCROLLER. The ScrollArea inside it becomes the primitive's viewport,
 *     one element wearing both libraries' hands, so a pane keeps exactly the anatomy it had. Two
 *     boxes with `overflow: auto` inside one pane is the failure this rules out, and it is the
 *     arrangement anyone writing this the obvious way ends up with.
 *  2. THE BUTTON IS PLACED BY LAYOUT, NEVER BY A TRANSFORM. A law that read the class would have
 *     passed; this reads the computed transform.
 */

import { describe, expect, it } from "vitest";

import { computed, mounted, until } from "../../test/browser.tsx";
import { Card } from "../card/card.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { Text } from "../text/text.tsx";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
} from "./message-scroller.tsx";

function transcript(turns = 12, { named = true, nested = false, autoScroll = true } = {}) {
  return (
    <Card size="3" style={{ height: "12rem" }}>
      <MessageScroller autoScroll={autoScroll}>
        <ScrollArea fade {...(named ? { "aria-label": "Transcript" } : {})}>
          <MessageScrollerContent>
            {Array.from({ length: turns }, (_, i) => (
              <MessageScrollerItem key={i} messageId={`m${i}`} scrollAnchor={i % 2 === 0}>
                <Text size="3">Turn {i + 1}, long enough that a dozen of them overflow the box.</Text>
                {/* A reply holding a scroller of its own — a code block, a table. */}
                {nested && i === 1 ? (
                  <ScrollArea style={{ height: "3rem" }}>
                    <Text size="3">A nested scroller, taller than its box, so it scrolls too. Line two. Line three.</Text>
                  </ScrollArea>
                ) : null}
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
          <MessageScrollerButton aria-label="Jump to the latest">
            <span aria-hidden>↓</span>
          </MessageScrollerButton>
        </ScrollArea>
      </MessageScroller>
    </Card>
  );
}

describe("the scroller composes the pane's own scroller", () => {
  it("scrolls in ONE box: the ScrollArea's viewport is the primitive's viewport", () => {
    const root = mounted(transcript());
    const scrollable = [...root.querySelectorAll<HTMLElement>("*")].filter((el) => {
      const overflow = computed(el, "overflow-y");
      return overflow === "auto" || overflow === "scroll";
    });
    expect(scrollable).toHaveLength(1);
    const viewport = scrollable[0];
    if (!viewport) throw new Error("no scrollable box at all — the transcript cannot scroll");
    expect(viewport.classList.contains("kui-scroll-viewport")).toBe(true);
  });

  it("keeps the ScrollArea's own anatomy, so a pane's fade and bars are untouched", () => {
    const root = mounted(transcript());
    const area = root.querySelector<HTMLElement>(".kui-scroll-area");
    if (!area) throw new Error("no .kui-scroll-area — the scroller must compose one, not replace it");
    expect(area.hasAttribute("data-fade")).toBe(true);
    expect(area.querySelector(".kui-scroll-viewport > .kui-scroll-content")).not.toBeNull();
  });

  it("puts the transcript in a live region, one row per turn", () => {
    const root = mounted(transcript(3));
    const content = root.querySelector<HTMLElement>(".kui-message-scroller-content");
    if (!content) throw new Error("no .kui-message-scroller-content");
    expect(content.getAttribute("role")).toBe("log");
    expect(root.querySelectorAll(".kui-message-scroller-item")).toHaveLength(3);
  });
});

/** The OUTER viewport: the pane's, the one the transcript scrolls in. */
function outerViewport(root: HTMLElement): HTMLElement {
  const el = root.querySelector<HTMLElement>(".kui-message-scroller-content")?.closest<HTMLElement>(".kui-scroll-viewport");
  if (!el) throw new Error("no viewport around the transcript");
  return el;
}

const atEnd = (el: HTMLElement) => el.scrollHeight - el.clientHeight - el.scrollTop <= 1;

describe("the viewport is wired to the primitive", () => {
  // The one-box law above cannot see this: an unwired ScrollArea still renders one scroller. What
  // only the wiring does is OPEN the transcript at its end and follow it.
  it("opens a saved thread at its end", async () => {
    const root = mounted(transcript());
    const viewport = outerViewport(root);
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    expect(await until(() => atEnd(viewport))).toBe(true);
  });

  it("wires the pane's viewport, never a scroller nested in a reply", async () => {
    const root = mounted(transcript(12, { nested: true }));
    const viewport = outerViewport(root);
    expect(await until(() => atEnd(viewport))).toBe(true);
    const nested = [...root.querySelectorAll<HTMLElement>(".kui-scroll-viewport")].filter((el) => el !== viewport);
    expect(nested).toHaveLength(1);
    // The primitive's viewport marks nothing of its own we can read, but its listeners and its name
    // are what a nested claim would bring: a nested viewport stays a plain ScrollArea's.
    expect(nested[0]?.hasAttribute("aria-label")).toBe(false);
    expect(nested[0]?.getAttribute("role")).toBe("presentation");
  });

  it("wakes the jump button once the reader scrolls up, and hides it at the end", async () => {
    const root = mounted(transcript());
    const viewport = outerViewport(root);
    const button = root.querySelector<HTMLElement>(".kui-message-scroller-button");
    const dock = root.querySelector<HTMLElement>(".kui-message-scroller-dock");
    if (!button || !dock) throw new Error("no button, or no dock");
    expect(await until(() => atEnd(viewport))).toBe(true);
    expect(button.getAttribute("data-active")).toBe("false");
    expect(computed(dock, "opacity")).toBe("0");
    // A reader's scroll, not a script's: the primitive tells the two apart by the wheel.
    viewport.dispatchEvent(new WheelEvent("wheel", { deltaY: -600, bubbles: true }));
    viewport.scrollTop = 0;
    expect(await until(() => button.getAttribute("data-active") === "true")).toBe(true);
    expect(computed(dock, "opacity")).toBe("1");
  });

  /* THE JUMP IS INSTANT, and it is the one animation the motion removal missed (2026-09-20).
     The primitive defaults `behavior` to `"smooth"`, so the button — and only the button, never
     the hook — animated a ~1.3k-pixel scroll: sampled per frame on the shipped spelling,
     `0, 2, 10, 25, 49, 88, 148, …` before it settled. Nothing in this package's CSS could show
     it, which is why every stylesheet sweep came back clean; it has to be pressed.

     The fixture is the load-bearing half. At `autoScroll` (the default) the store follows the
     live edge and snaps the transcript back before the press can be measured — both halves then
     read the settled value on frame one and the law passes against the defect. So: the follow is
     off, the park is a READER's scroll (a wheel, which is how the primitive tells a person from a
     script), and the press waits for the button to wake. */
  it("jumps to the end at once — the button's scroll is not animated", async () => {
    const root = mounted(transcript(40, { autoScroll: false }));
    const viewport = outerViewport(root);
    const button = root.querySelector<HTMLElement>(".kui-message-scroller-button");
    if (!button) throw new Error("no button");
    viewport.dispatchEvent(new WheelEvent("wheel", { deltaY: -600, bubbles: true }));
    viewport.scrollTop = 0;
    expect(await until(() => button.getAttribute("data-active") === "true")).toBe(true);
    const end = viewport.scrollHeight - viewport.clientHeight;
    expect(end).toBeGreaterThan(200);
    button.click();
    const firstFrame = await new Promise<number>((resolve) => {
      requestAnimationFrame(() => resolve(viewport.scrollTop));
    });
    // Frame one IS the destination. On the shipped spelling this read 0.
    expect(Math.round(firstFrame)).toBe(Math.round(end));
  });

  it("never names an unnamed transcript in English", () => {
    const root = mounted(transcript(12, { named: false }));
    const label = outerViewport(root).getAttribute("aria-label");
    // An empty label is no name (accessible-name computation skips it); "Messages" is the leak.
    expect(label === null || label.trim() === "").toBe(true);
  });

  it("keeps a named transcript's own name", () => {
    const root = mounted(transcript());
    expect(outerViewport(root).getAttribute("aria-label")).toBe("Transcript");
  });
});

describe("the jump button is placed by layout", () => {
  it("sticks outside a surface too", () => {
    const root = mounted(
      <div style={{ height: "12rem", display: "flex", flexDirection: "column" }}>
        <MessageScroller>
          <ScrollArea aria-label="Transcript">
            <MessageScrollerContent>
              {Array.from({ length: 12 }, (_, i) => (
                <MessageScrollerItem key={i}>
                  <Text size="3">Turn {i + 1}, long enough that a dozen of them overflow the box.</Text>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
            <MessageScrollerButton aria-label="Jump to the latest">↓</MessageScrollerButton>
          </ScrollArea>
        </MessageScroller>
      </div>,
    );
    const dock = root.querySelector<HTMLElement>(".kui-message-scroller-dock");
    if (!dock) throw new Error("no dock");
    // `auto` is what an invalid-at-computed-value calc falls back to: sticky with no inset.
    expect(computed(dock, "inset-block-end")).not.toBe("auto");
  });

  it("is lifted by its dock's alignment, not by a transform of its own", () => {
    const root = mounted(transcript());
    const button = root.querySelector<HTMLElement>(".kui-message-scroller-button");
    const dock = root.querySelector<HTMLElement>(".kui-message-scroller-dock");
    if (!button || !dock) throw new Error("no button, or no dock");
    /* NEITHER CHANNEL IS SPOKEN FOR — the button sits exactly where layout puts it.
       It read "a zero `translate`" until 2026-09-20, because the Button skeleton declared a
       resting `translate` for its hover to travel from and the computed value was therefore
       `0px` rather than `none`. With the pointer geometry removed nothing declares either
       channel, so the settled value is `none` on both — which is the STRONGER assertion, and
       still the one this law exists for: re-spell the dock's lift as a transform on the button
       and it fails. */
    expect(computed(button, "transform")).toBe("none");
    expect(computed(button, "translate")).toBe("none");
    // The lift is the dock's: a row of no height whose one item hangs off its end.
    expect(computed(dock, "align-items")).toBe("flex-end");
  });

  it("rides the end of the viewport from a dock that takes no room", () => {
    const root = mounted(transcript());
    const dock = root.querySelector<HTMLElement>(".kui-message-scroller-dock");
    if (!dock) throw new Error("no .kui-message-scroller-dock");
    expect(computed(dock, "position")).toBe("sticky");
    expect(computed(dock, "block-size")).toBe("0px");
    // It hands the pointer back to the transcript; only the button takes it.
    expect(computed(dock, "pointer-events")).toBe("none");
    expect(computed(root.querySelector<HTMLElement>(".kui-message-scroller-button") as HTMLElement, "pointer-events")).toBe("auto");
  });
});
