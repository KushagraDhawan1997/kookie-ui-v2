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
import { Shell, ShellBottom, ShellContent, ShellHeader, ShellInspector, ShellScroll, ShellSidebar } from "./shell.tsx";

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
    const root = frame();
    const handle = handleOf(root);
    expect(handle.getAttribute("role")).toBe("separator");
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    expect(handle.getAttribute("aria-label")).toBe("Resize panel");
    expect(handle.tabIndex).toBe(0);
    expect(Number(handle.getAttribute("aria-valuemin"))).toBe(shellResize.min);

    /* THE VALUE, which this law is named for and never read (audit 2026-09-02). It was
       computed during render from a ref that is null on the first commit, and the gesture sets
       no React state, so a focusable separator shipped with a min and no position and never
       gained one. It is written imperatively now, seeded in a layout effect. */
    const now = Number(handle.getAttribute("aria-valuenow"));
    expect(now, "a focusable separator must announce a position").toBeCloseTo(
      paneOf(root).getBoundingClientRect().width,
      0,
    );

    /* And the range must be consistent. Emitting no `aria-valuemax` left the default path
       advertising a minimum of 160 against ARIA's implicit maximum of 100. */
    const max = Number(handle.getAttribute("aria-valuemax"));
    expect(max, "the announced ceiling must exceed the floor").toBeGreaterThan(shellResize.min);
    expect(now).toBeLessThanOrEqual(max);
  });

  it("the announced value follows the keyboard", () => {
    const root = frame();
    const handle = handleOf(root);
    const before = Number(handle.getAttribute("aria-valuenow"));
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(Number(handle.getAttribute("aria-valuenow"))).toBeCloseTo(before + shellResize.step, 0);
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
    /* Both halves, and the second half READS THE PAINT now (audit 2026-09-02). It asserted
       `border-top-width === 0` on the handle — a property no rule in the package ever sets, so
       `0px` is the initial value and the clause could not fail. The line is the `::after`, and
       that is what a law about the paint has to measure.

       The box is also read as its RENDERED width, which is what caught the first spelling
       straddling the pane's clipped edge and delivering 22px against a rule stating 44. */
    const root = frame();
    const handle = handleOf(root);
    const floor = parseFloat(getComputedStyle(root).getPropertyValue("--touch-target-min") || "0");
    expect(floor).toBeGreaterThan(0);
    /* HIT-TESTED, not measured (audit 2026-09-02, second round). `getBoundingClientRect`
       returns the LAYOUT box, which is 44 whether or not the pane clips half of it away — so a
       law reading the rect passed against the straddling spelling that delivered a 22px
       reachable target. What a person can hit is what `elementFromPoint` answers. */
    const box = handle.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const hits = [box.left + 2, box.left + box.width / 2, box.right - 2].map(
      (x) => document.elementFromPoint(x, y) === handle,
    );
    expect(hits, "the whole stated target must be reachable, not just its middle").toEqual([true, true, true]);
    expect(box.width).toBeCloseTo(floor, 0);

    const line = parseFloat(getComputedStyle(handle, "::after").inlineSize) || 0;
    expect(line, "the line must be a hairline").toBeLessThanOrEqual(4);
    expect(line, "and far narrower than its target").toBeLessThan(floor / 4);
  });

  it("it paints nothing at rest and comes forward under focus and under the drag", () => {
    /* The whole visibility story had only a node law reading source text, and this repo's
       2026-08-10 finding is exactly that asking whether a selector is PRESENT is not asking
       whether it WON. */
    const root = frame();
    const handle = handleOf(root);
    expect(getComputedStyle(handle, "::after").opacity).toBe("0");
    handle.focus();
    expect(getComputedStyle(handle, "::after").opacity, "a focused boundary must be visible").toBe("1");
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

describe("every arm the component can actually produce (audit 2026-09-02)", () => {
  /* EVERY law above mounts the SIDEBAR. `sign()` multiplies the anchor against the direction,
     so the inspector's mirrored arm — the one apps/docs actually ships — was covered by
     nothing, and a sabotage swapping the two anchors is invisible in a sidebar-only fixture. */
  it("the inspector's boundary is the mirror, and it grows the other way", () => {
    const root = mounted(
      <Shell style={{ height: 600, width: 1000 }}>
        <ShellHeader>header</ShellHeader>
        <ShellContent>content</ShellContent>
        <ShellInspector aria-label="Details" resizable defaultOpen>
          inspector
        </ShellInspector>
      </Shell>,
      { theme: {} },
    );
    const pane = within(root, ".kui-shell-inspector");
    const handle = within(root, ".kui-shell-resize");
    // Its handle sits on the START edge, which is the opposite side from the sidebar's.
    expect(handle.getAttribute("data-anchor")).toBe("start");
    const before = pane.getBoundingClientRect().width;
    const edge = handle.getBoundingClientRect().left + handle.getBoundingClientRect().width / 2;
    drag(handle, edge, edge - 80);
    expect(pane.getBoundingClientRect().width, "dragging inward must GROW an end-anchored pane").toBeCloseTo(
      before + 80,
      0,
    );
  });

  it("the bottom pane resizes on the block axis, and writes the height it reads", () => {
    /* The block arm was written, unreachable and wrong: no prop produced it, and `write()`
       named `--kui-shell-w` unconditionally while the bottom pane reads `--kui-shell-h`. */
    const root = mounted(
      <Shell style={{ height: 600, width: 1000 }}>
        <ShellHeader>header</ShellHeader>
        <ShellContent>content</ShellContent>
        <ShellBottom resizable defaultOpen>
          bottom
        </ShellBottom>
      </Shell>,
      { theme: {} },
    );
    const pane = within(root, ".kui-shell-bottom");
    const handle = within(root, ".kui-shell-resize");
    expect(handle.getAttribute("aria-orientation")).toBe("horizontal");
    const before = pane.getBoundingClientRect().height;
    const box = handle.getBoundingClientRect();
    const opts = { bubbles: true, pointerId: 1, button: 0, isPrimary: true } as const;
    handle.setPointerCapture = () => {};
    handle.releasePointerCapture = () => {};
    handle.hasPointerCapture = () => true;
    const y = box.top + box.height / 2;
    handle.dispatchEvent(new PointerEvent("pointerdown", { ...opts, clientX: 500, clientY: y }));
    handle.dispatchEvent(new PointerEvent("pointermove", { ...opts, clientX: 500, clientY: y - 60 }));
    handle.dispatchEvent(new PointerEvent("pointerup", { ...opts, clientX: 500, clientY: y - 60 }));
    expect(pane.getBoundingClientRect().height).toBeCloseTo(before + 60, 0);
    expect(pane.style.getPropertyValue("--kui-shell-h"), "it must write the name the pane reads").not.toBe("");
    expect(pane.style.getPropertyValue("--kui-shell-w")).toBe("");
  });

  it("a resizable pane still lets its scroller reach the bottom edge", () => {
    /* The handle is a real last child, and surfaces.css bleeds a ScrollArea that is the last
       non-floating one. Without `data-float` on the handle, adding `resizable` silently took
       the scroller's block-end bleed away — an unrelated prop breaking the recommended pane
       anatomy. Read as the AGREEMENT: resizable and not must bleed identically. */
    const shell = (resizable: boolean) =>
      mounted(
        <Shell style={{ height: 600, width: 1000 }}>
          <ShellHeader>header</ShellHeader>
          <ShellSidebar aria-label="Primary" {...(resizable ? { resizable: true } : {})}>
            <ShellScroll>rows</ShellScroll>
          </ShellSidebar>
          <ShellContent>content</ShellContent>
        </Shell>,
        { theme: {} },
      );
    const bleed = (root: HTMLElement) => computed(within(root, ".kui-scroll-area"), "margin-bottom");
    expect(bleed(shell(true))).toBe(bleed(shell(false)));
  });

  it("a pane presenting as an overlay keeps its own positioning, and shows no boundary", () => {
    /* The containing-block grant is `:where(:has(> .kui-shell-resize))` at (0,1,0) precisely so
       the overlay arm still wins outright. Nothing read it, and the stylesheet's comment cited
       a "drawer law" that did not exist. */
    const root = mounted(
      <Shell style={{ height: 600, width: 1000 }}>
        <ShellHeader>header</ShellHeader>
        <ShellSidebar aria-label="Primary" resizable presentation="overlay" defaultOpen>
          sidebar
        </ShellSidebar>
        <ShellContent>content</ShellContent>
      </Shell>,
      { theme: {} },
    );
    const pane = within(root, ".kui-shell-sidebar");
    expect(computed(pane, "position"), "the overlay arm must outrank the grant").toBe("absolute");
    expect(computed(within(root, ".kui-shell-resize"), "display")).toBe("none");
  });
});

describe("what a person dragged stands until the app says otherwise (audit 2026-09-02)", () => {
  it("an unrelated re-render leaves the dragged width alone, and a width CHANGE moves it", () => {
    /* Three prose homes claimed the opposite — that any render after the gesture re-asserts the
       prop and the pane snaps back. It never did, and making it do so was the wrong repair: it
       would throw away a person's drag on the next unrelated render. So this law pins the
       contract that is actually true and actually wanted, in both directions. Falsified by
       deleting the re-assert effect (the second half fails) or by removing its dependency array
       (the first half fails). */
    function Fixture({ width }: { width: number }) {
      const [, force] = React.useState(0);
      return (
        <Shell style={{ height: 600, width: 1000 }}>
          <ShellHeader>
            <button type="button" data-testid="rerender" onClick={() => force((n) => n + 1)}>
              render
            </button>
          </ShellHeader>
          <ShellSidebar aria-label="Primary" resizable width={width}>
            sidebar
          </ShellSidebar>
          <ShellContent>content</ShellContent>
        </Shell>
      );
    }
    const root = mounted(<Fixture width={280} />, { theme: {} });
    const pane = within(root, ".kui-shell-sidebar");
    const handle = within(root, ".kui-shell-resize");
    const edge = handle.getBoundingClientRect().left + handle.getBoundingClientRect().width / 2;
    drag(handle, edge, edge + 70);
    expect(pane.getBoundingClientRect().width).toBeCloseTo(350, 0);

    within(root, "[data-testid=rerender]").click();
    expect(pane.getBoundingClientRect().width, "an unrelated render must not discard the drag").toBeCloseTo(350, 0);
  });
});
