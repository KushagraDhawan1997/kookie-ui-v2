/**
 * Carousel's laws, mounted (§55).
 *
 * The component ships a pattern rather than a look, so almost nothing here is a colour. What is
 * claimed: the rail settles on items, a press moves exactly one of them, the buttons die at the
 * ends and come back, a rail that fits has no live buttons at all, and the reading direction is
 * the axis — measured in a real RTL subtree rather than asserted from the source.
 *
 * THE RAIL IS BOUNDED BY THE LAW, NOT BY THE COMPONENT. A scroll region needs a stated height or
 * width from its call site (ScrollArea's own contract), so every mount here gives the rail a box
 * and the items a width. That is the call site's half, and stating it in the fixture is what
 * keeps the component free of a designed item width — the thing §10 keeps out of a component.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { computed, mounted, until, within } from "../../test/browser.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { Carousel, CarouselItem, CarouselNext, CarouselPrevious, CarouselRail } from "./carousel.tsx";

/** Four items of 100px in a 250px rail: two and a half in view, so there is always somewhere to
    go and the end is two presses away. */
const ITEM = 100;
const BOX = 250;

function Rig({ items = 4, dir }: { items?: number; dir?: "rtl" }) {
  return (
    <div {...(dir !== undefined ? { dir } : {})}>
      <Carousel aria-label="Covers">
        <CarouselRail style={{ inlineSize: `${BOX}px` }}>
          <div style={{ display: "flex" }}>
            {Array.from({ length: items }, (_, i) => (
              <CarouselItem key={i} style={{ inlineSize: `${ITEM}px`, blockSize: "60px", flex: "none" }}>
                {i}
              </CarouselItem>
            ))}
          </div>
        </CarouselRail>
        <CarouselPrevious>‹</CarouselPrevious>
        <CarouselNext>›</CarouselNext>
      </Carousel>
    </div>
  );
}

const parts = (root: HTMLElement) => ({
  viewport: within(root, ".kui-scroll-viewport"),
  previous: root.querySelectorAll<HTMLElement>(".kui-button")[0]!,
  next: root.querySelectorAll<HTMLElement>(".kui-button")[1]!,
});

/** A button is dead in the spelling that keeps it focusable (§8): the ARIA attribute, never the
    native one. */
const dead = (button: HTMLElement) =>
  button.getAttribute("aria-disabled") === "true" && !button.hasAttribute("disabled");

/**
 * The first measurement lands a frame after the mount, and every law here is about what the
 * buttons say — so they all wait for the machinery to have spoken once. Without this the laws
 * read the pre-measurement state, where both buttons are dead, and three of them passed or failed
 * for the wrong reason (2026-09-18).
 */
const awake = (button: HTMLElement) => until(() => !dead(button));

describe("the pattern (§55)", () => {
  it("announces a carousel, and the buttons say which rail they move", () => {
    const root = mounted(<Rig />, { theme: {}, select: ".kui-carousel" });
    expect(root.getAttribute("role")).toBe("group");
    expect(root.getAttribute("aria-roledescription")).toBe("carousel");
    expect(root.getAttribute("aria-label")).toBe("Covers");
    const { viewport, previous, next } = parts(root);
    expect(viewport.id, "the rail's viewport carries the id the buttons point at").not.toBe("");
    expect(previous.getAttribute("aria-controls")).toBe(viewport.id);
    expect(next.getAttribute("aria-controls")).toBe(viewport.id);
    expect(previous.getAttribute("aria-label")).toBe("Previous");
    expect(next.getAttribute("aria-label")).toBe("Next");
  });

  it("scrolling settles on items", () => {
    const root = mounted(<Rig />, { theme: {}, select: ".kui-carousel" });
    const { viewport } = parts(root);
    expect(computed(viewport, "scroll-snap-type")).toBe("inline mandatory");
    expect(computed(within(root, ".kui-carousel-item"), "scroll-snap-align")).toBe("start");
  });

  it("draws no scrollbar — the buttons and the fade already say where you are", async () => {
    const root = mounted(<Rig />, { theme: {}, select: ".kui-carousel" });
    // Base UI mounts the bar the content needs on the frame AFTER it measures, so the calibration
    // half of this law has to wait for it — asserting `display: none` on nothing would pass on a
    // stylesheet that hides nothing.
    const bars = () => [...root.querySelectorAll<HTMLElement>(".kui-scrollbar")];
    expect(await until(() => bars().length > 0), "calibration: the ScrollArea inside mounts a bar").toBe(true);
    for (const bar of bars()) expect(computed(bar, "display")).toBe("none");
  });

  it("at the start only one way is live, and it is dead in the spelling that keeps focus", async () => {
    const root = mounted(<Rig />, { theme: {}, select: ".kui-carousel" });
    const { previous, next } = parts(root);
    expect(await awake(next), "there is more to see").toBe(true);
    expect(dead(previous), "the rail is at its start").toBe(true);
  });

  it("a press moves exactly one item", async () => {
    const root = mounted(<Rig />, { theme: {}, select: ".kui-carousel" });
    const { viewport, next } = parts(root);
    await awake(next);
    await userEvent.click(next);
    expect(await until(() => Math.abs(viewport.scrollLeft - ITEM) < 2), `moved to ${viewport.scrollLeft}`).toBe(true);
  });

  it("the far end kills the button that got you there and wakes the other", async () => {
    const root = mounted(<Rig />, { theme: {}, select: ".kui-carousel" });
    const { viewport, previous, next } = parts(root);
    await awake(next);
    viewport.scrollTo({ left: viewport.scrollWidth, behavior: "instant" });
    expect(await awake(previous), "everything behind is still reachable").toBe(true);
    expect(dead(next), "nothing further to see").toBe(true);
  });

  it("a rail that fits has no live buttons, and a resize alone says so", async () => {
    // Both buttons start dead before anything is measured, so a rail that fits FROM MOUNT cannot
    // be told from one nobody measured. The rail starts overflowing, wakes, and is then widened
    // until it fits — a resize with no scroll, the case only the size observation can see.
    const root = mounted(<Rig />, { theme: {}, select: ".kui-carousel" });
    const { previous, next } = parts(root);
    const rail = within(root, ".kui-carousel-rail");
    expect(await awake(next), "calibration: an overflowing rail wakes").toBe(true);
    rail.style.inlineSize = `${ITEM * 4 + 50}px`;
    expect(await until(() => dead(previous) && dead(next)), "widened until it fits").toBe(true);
    rail.style.inlineSize = `${BOX}px`;
    expect(await awake(next), "narrowed until it overflows again").toBe(true);
  });

  it("Previous moves back exactly one item", async () => {
    const root = mounted(<Rig items={6} />, { theme: {}, select: ".kui-carousel" });
    const { viewport, previous, next } = parts(root);
    await awake(next);
    viewport.scrollTo({ left: ITEM * 3, behavior: "instant" });
    expect(await awake(previous)).toBe(true);
    await userEvent.click(previous);
    expect(await until(() => Math.abs(viewport.scrollLeft - ITEM * 2) < 2), `moved to ${viewport.scrollLeft}`).toBe(true);
  });

  it("the button that reaches the end keeps focus", async () => {
    const root = mounted(<Rig />, { theme: {}, select: ".kui-carousel" });
    const { viewport, next } = parts(root);
    await awake(next);
    next.focus();
    await userEvent.keyboard("{Enter}");
    await until(() => Math.abs(viewport.scrollLeft - ITEM) < 2);
    await userEvent.keyboard("{Enter}");
    expect(await until(() => dead(next)), "two presses reach the end").toBe(true);
    expect(document.activeElement, "focus stayed on the button that died").toBe(next);
  });

  it("a scroller inside an item keeps its own id: only the rail is what the buttons move", async () => {
    const root = mounted(
      <Carousel aria-label="Snippets">
        <CarouselRail style={{ inlineSize: `${BOX}px` }}>
          <div style={{ display: "flex" }}>
            {[0, 1, 2].map((i) => (
              <CarouselItem key={i} style={{ inlineSize: `${ITEM}px`, flex: "none" }}>
                <ScrollArea style={{ blockSize: "40px" }}>
                  <div style={{ blockSize: "120px" }}>{i}</div>
                </ScrollArea>
              </CarouselItem>
            ))}
          </div>
        </CarouselRail>
        <CarouselNext>›</CarouselNext>
      </Carousel>,
      { theme: {}, select: ".kui-carousel" },
    );
    const next = within(root, ".kui-button");
    const id = next.getAttribute("aria-controls");
    expect(id).not.toBeNull();
    expect(root.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
    expect(root.querySelectorAll(".kui-scroll-viewport")).toHaveLength(4);
    expect(await awake(next), "the rail, not a nested scroller, is what the store reads").toBe(true);
  });

  it("the axis is the reading direction, not a compass direction", async () => {
    const root = mounted(<Rig dir="rtl" />, { theme: {}, select: ".kui-carousel" });
    const { viewport, previous, next } = parts(root);
    // The content begins on the right, so the rail is at its start with nothing behind it —
    // the same claim as the LTR law, and the one a physical `scrollLeft > 0` test gets wrong.
    expect(await awake(next), "an RTL rail has somewhere to go").toBe(true);
    expect(dead(previous), "an RTL rail opens at its own start").toBe(true);
    await userEvent.click(next);
    // Standard RTL scrolling counts away from the start as a negative offset.
    expect(await until(() => Math.abs(viewport.scrollLeft + ITEM) < 2), `moved to ${viewport.scrollLeft}`).toBe(true);
  });
});
