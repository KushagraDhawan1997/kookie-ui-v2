/**
 * Shell pane resize (§27, 2026-09-01) — its own file, because it is the first mechanism in
 * this package that runs script WHILE a gesture is happening, and the laws that bound it are
 * the whole of the argument for allowing it.
 *
 * The load-bearing ones: the drag writes the pane's own width variable and nothing else, the
 * clamp holds at both ends, `onResize` fires ONCE at the end rather than per frame, the
 * keyboard reaches the same boundary, and the target is the touch minimum while the paint is
 * a hairline.
 */
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { computed, mounted, until, within } from "../../test/browser.tsx";
import { shellResize } from "../../tokens/config.ts";
import { Shell, ShellContent, ShellHeader, ShellSidebar } from "./shell.tsx";

function frame(sidebar: React.ComponentProps<typeof ShellSidebar> = {}) {
  return mounted(
    <Shell style={{ height: 600, width: 1000 }}>
      <ShellHeader>header</ShellHeader>
      <ShellSidebar aria-label="Primary" resizable {...sidebar}>
        sidebar
      </ShellSidebar>
      <ShellContent>content</ShellContent>
    </Shell>,
    { theme: {} },
  );
}

/** A real pointer gesture: down on the handle, some moves, then up. */
function drag(handle: HTMLElement, from: number, to: number, steps = 4) {
  const opts = { bubbles: true, pointerId: 1, button: 0, isPrimary: true } as const;
  handle.setPointerCapture = () => {};
  handle.releasePointerCapture = () => {};
  handle.hasPointerCapture = () => true;
  handle.dispatchEvent(new PointerEvent("pointerdown", { ...opts, clientX: from, clientY: 300 }));
  for (let i = 1; i <= steps; i++) {
    const x = from + ((to - from) * i) / steps;
    handle.dispatchEvent(new PointerEvent("pointermove", { ...opts, clientX: x, clientY: 300 }));
  }
  handle.dispatchEvent(new PointerEvent("pointerup", { ...opts, clientX: to, clientY: 300 }));
}

const handleOf = (root: HTMLElement) => within(root, ".kui-shell-resize");
const paneOf = (root: HTMLElement) => within(root, ".kui-shell-sidebar");

describe("the boundary is a window splitter, not a div with a mousedown (§27)", () => {
  it("it announces as a separator with an orientation and a value", () => {
    const handle = handleOf(frame());
    expect(handle.getAttribute("role")).toBe("separator");
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    expect(handle.getAttribute("aria-label")).toBe("Resize panel");
    expect(handle.tabIndex).toBe(0);
    expect(Number(handle.getAttribute("aria-valuemin"))).toBe(shellResize.min);
  });

  it("a pane that was not asked to resize draws no boundary at all", () => {
    const root = mounted(
      <Shell style={{ height: 600, width: 1000 }}>
        <ShellHeader>header</ShellHeader>
        <ShellSidebar aria-label="Primary">sidebar</ShellSidebar>
        <ShellContent>content</ShellContent>
      </Shell>,
      { theme: {} },
    );
    expect(root.querySelector(".kui-shell-resize")).toBe(null);
  });

  it("the target is the touch minimum and the PAINT is a hairline", () => {
    /* Both halves. A 2px line is the honest width of a boundary and an impossible target, so
       the box is the minimum and the line is drawn inside it — §16's move for the mark family.
       Falsified by sizing the box to the line. */
    const root = frame();
    const handle = handleOf(root);
    const floor = parseFloat(
      getComputedStyle(root).getPropertyValue("--touch-target-min") || "0",
    );
    expect(floor).toBeGreaterThan(0);
    expect(handle.getBoundingClientRect().width).toBeGreaterThanOrEqual(floor - 0.5);
    const line = parseFloat(computed(handle, "border-top-width")) || 0;
    expect(line, "the handle itself must not draw a border — the line is its ::after").toBe(0);
  });
});

describe("the drag writes the pane's own width and nothing else (§27)", () => {
  it("dragging the boundary moves the pane's edge", () => {
    const root = frame();
    const pane = paneOf(root);
    const before = pane.getBoundingClientRect().width;
    const handle = handleOf(root);
    const edge = handle.getBoundingClientRect().left + handle.getBoundingClientRect().width / 2;
    drag(handle, edge, edge + 80);
    expect(pane.getBoundingClientRect().width).toBeCloseTo(before + 80, 0);
    // ONE property, on the pane. Not a class, not an inline width, not a re-render.
    expect(pane.style.getPropertyValue("--kui-shell-w")).toBe(`${Math.round(before + 80)}px`);
  });

  it("the clamp holds at both ends", () => {
    const root = frame({ minWidth: 200, maxWidth: 360 });
    const pane = paneOf(root);
    const handle = handleOf(root);
    const edge = () => handle.getBoundingClientRect().left + handle.getBoundingClientRect().width / 2;

    drag(handle, edge(), edge() - 900);
    expect(pane.getBoundingClientRect().width).toBeCloseTo(200, 0);

    drag(handle, edge(), edge() + 900);
    expect(pane.getBoundingClientRect().width).toBeCloseTo(360, 0);
  });

  it("`onResize` fires ONCE, at the end — the app remembers the number, it does not watch it", () => {
    /* The whole bound on this exception. A per-frame callback is a per-frame re-render, which
       is what re-mints a glass pane's lens map (2026-08-22). Falsified by moving the call into
       the move handler: the count becomes the number of moves. */
    const onResize = vi.fn();
    const root = frame({ onResize });
    const handle = handleOf(root);
    const edge = handle.getBoundingClientRect().left + handle.getBoundingClientRect().width / 2;
    drag(handle, edge, edge + 120, 6);
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize.mock.calls[0]![0]).toBeCloseTo(paneOf(root).getBoundingClientRect().width, 0);
  });
});

describe("the keyboard reaches the same boundary (§27, WAI-ARIA window splitter)", () => {
  it("the keyboard moves the pane with NO onResize — the callback is a report, not the mechanism", async () => {
    /* THE DEGENERATE FIXTURE THIS FILE SHIPPED WITH (audit 2026-09-02). Every keyboard law
       below passes `onResize`, and the bug was `onResize?.(write(...))` — an optional CALL
       short-circuits its whole expression, so `write()` never ran without a callback and the
       pane did not move at all on the default path. The one input where the defect is
       invisible is the one input the law used. Falsified by restoring the short-circuit. */
    const root = frame();
    const pane = paneOf(root);
    const handle = handleOf(root);
    const before = pane.getBoundingClientRect().width;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await until(() => pane.getBoundingClientRect().width > before);
    expect(pane.getBoundingClientRect().width).toBeCloseTo(before + shellResize.step, 0);
  });

  it("an arrow steps it, and Home takes it to the floor", async () => {
    const onResize = vi.fn();
    const root = frame({ minWidth: 200, onResize });
    const pane = paneOf(root);
    const handle = handleOf(root);
    const before = pane.getBoundingClientRect().width;

    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await until(() => pane.getBoundingClientRect().width > before);
    expect(pane.getBoundingClientRect().width).toBeCloseTo(before + shellResize.step, 0);

    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    await until(() => pane.getBoundingClientRect().width <= 201);
    expect(pane.getBoundingClientRect().width).toBeCloseTo(200, 0);
    expect(onResize).toHaveBeenCalledTimes(2);
  });
});

describe("direction is read off the pane, never stamped (§20, §27)", () => {
  it("in RTL the same pointer travel grows the pane the other way", () => {
    const ltr = frame();
    const rtl = frame();
    (rtl.closest("[dir]") ?? rtl).setAttribute("dir", "rtl");
    rtl.setAttribute("dir", "rtl");

    const measure = (root: HTMLElement) => {
      const pane = paneOf(root);
      const handle = handleOf(root);
      const before = pane.getBoundingClientRect().width;
      const edge = handle.getBoundingClientRect().left + handle.getBoundingClientRect().width / 2;
      drag(handle, edge, edge + 60);
      return pane.getBoundingClientRect().width - before;
    };
    // The claim is the SIGN. A stamped direction would give both the same one, which is the
    // defect the 2026-08-09 audit found in three places at once.
    expect(Math.sign(measure(ltr))).toBe(1);
    expect(Math.sign(measure(rtl))).toBe(-1);
  });
});
