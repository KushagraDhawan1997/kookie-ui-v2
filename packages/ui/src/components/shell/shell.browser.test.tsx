/**
 * Shell mounted laws (§27) — computed values through a real <Theme>, per the 2026-08-03
 * standard. The viewport is resized for real where a law is about the window (the
 * window.browser.test.tsx pattern): matchMedia and the media block are the mechanism, and a
 * law that stubs the mechanism it is testing proves nothing.
 *
 * The load-bearing ones were falsified before being trusted (recorded per law): the
 * auto-resolution laws against the narrow media block deleted, the agreement law against a
 * skewed overlay arm, the scrim law against the :has() rule deleted, and the inert law
 * against the effect's inert lines removed.
 */
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import {
  Shell,
  ShellBottom,
  ShellContent,
  ShellHeader,
  ShellInspector,
  ShellNavGroup,
  ShellNavItem,
  ShellRail,
  ShellRailItem,
  ShellRailList,
  ShellScroll,
  ShellSidebar,
  ShellTrigger,
} from "./shell.tsx";
import { Button } from "../button/button.tsx";
import { Box } from "../box/box.tsx";
import { Card } from "../card/card.tsx";
import { Dialog, DialogContent, DialogTitle } from "../dialog/dialog.tsx";
import { computed, mounted, tokenOn, within } from "../../test/browser.tsx";
import { VIEWPORT as WIDE } from "../../test/viewport.ts";

const narrow = () => page.viewport(375, 800);

afterEach(async () => {
  await page.viewport(WIDE.width, WIDE.height);
});

/** A whole shell; every pane present unless a law states its own. */
function fixture(props: {
  /** Applied to EVERY pane: `false` is the all-cards frame, the one regime where the gap
      splits half onto the frame's padding (§27, rewritten 2026-08-20). */
  flush?: boolean;
  sidebar?: React.ComponentProps<typeof ShellSidebar>;
  inspector?: React.ComponentProps<typeof ShellInspector>;
  bottom?: React.ComponentProps<typeof ShellBottom>;
  rail?: boolean;
} = {}) {
  return (
    <Shell style={{ height: 600 }}>
      <ShellHeader flush={props.flush ?? true}>
        <ShellTrigger target="sidebar" data-testid="trigger">
          menu
        </ShellTrigger>
      </ShellHeader>
      {props.rail ? (
        <ShellRail aria-label="Sections" flush={props.flush ?? true}>
          rail
        </ShellRail>
      ) : null}
      <ShellSidebar aria-label="Primary" flush={props.flush ?? true} {...props.sidebar}>
        sidebar
      </ShellSidebar>
      <ShellContent flush={props.flush ?? true}>content</ShellContent>
      <ShellInspector flush={props.flush ?? true} {...props.inspector}>
        inspector
      </ShellInspector>
      <ShellBottom flush={props.flush ?? true} {...props.bottom}>
        bottom
      </ShellBottom>
    </Shell>
  );
}

const mountShell = (props?: Parameters<typeof fixture>[0]) =>
  mounted(fixture(props), { theme: {} });

/**
 * Escape as a USER produces it: dispatched on the element that holds focus, which for an
 * overlaying pane is inside the pane. The first spelling of these laws fired on `document`,
 * which passed against a document-global listener — and a document-global listener is
 * layer-blind: a Dialog opened from inside an overlaying pane portals to body and its own
 * Escape dismissed the pane underneath it too (audit 2026-08-16). The handler is bound to
 * the shell root now, so a realistic dispatch is also the only one that reaches it.
 */
function pressEscape(from: HTMLElement) {
  (from.contains(document.activeElement) ? (document.activeElement as HTMLElement) : from).dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
}

describe("anatomy: the landmarks are by construction (§27)", () => {
  it("header, main, nav, aside — the elements, not roles bolted on", () => {
    const shell = mountShell({ rail: true, inspector: { defaultOpen: true }, bottom: { defaultOpen: true } });
    expect(within(shell, ".kui-shell-header").tagName).toBe("HEADER");
    expect(within(shell, ".kui-shell-content").tagName).toBe("MAIN");
    expect(within(shell, ".kui-shell-rail").tagName).toBe("NAV");
    expect(within(shell, ".kui-shell-sidebar").tagName).toBe("NAV");
    expect(within(shell, ".kui-shell-inspector").tagName).toBe("ASIDE");
    expect(within(shell, ".kui-shell-bottom").tagName).toBe("ASIDE");
  });

  it("a pane IS a surface: its seal and edge are a Card's, computed (§10, §27)", () => {
    const shell = mountShell();
    const card = mounted(<Card>c</Card>, { theme: {} });
    const sidebar = within(shell, ".kui-shell-sidebar");
    expect(computed(sidebar, "background-color")).toBe(computed(card, "background-color"));
    expect(computed(sidebar, "border-top-color")).toBe(computed(card, "border-top-color"));
  });

  it("whatever the shell layers internally stays INSIDE its own isolate (§20)", () => {
    // RESTATED 2026-08-20. This law used to say "no pane carries a positive z-index at rest"
    // and mounted an all-flush shell, where that cannot be false; a floating pane now carries
    // z-index 1 permanently, so the old sentence was false the day the posture landed and the
    // fixture could not tell. The guarantee §20 actually needs is not that the numbers are
    // absent but that they are CONTAINED — the root isolates and takes no z-index of its own,
    // so a portal outside the theme frame still wins on DOM order however the shell layers.
    const flush = mountShell();
    expect(computed(flush, "isolation")).toBe("isolate");
    expect(computed(flush, "z-index"), "the root joined the layering it is supposed to bound").toBe(
      "auto",
    );
    for (const sel of [".kui-shell-header", ".kui-shell-sidebar", ".kui-shell-content"]) {
      expect(computed(within(flush, sel), "z-index"), sel).toBe("auto");
    }
    flush.remove();
    // And the fixture where it CAN be false: a floating pane lifts, and the root still does not.
    const floating = mounted(
      <Shell style={{ height: 300 }}>
        <ShellSidebar aria-label="Primary" flush={false}>
          nav
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    expect(Number(computed(within(floating, ".kui-shell-sidebar"), "z-index"))).toBeGreaterThan(0);
    expect(computed(floating, "isolation")).toBe("isolate");
    expect(computed(floating, "z-index")).toBe("auto");
  });
});

describe("geometry: the header criterion and the columns (§27)", () => {
  it("the header is full-width by definition; the columns sit beneath it", () => {
    const shell = mountShell();
    const header = within(shell, ".kui-shell-header").getBoundingClientRect();
    const root = shell.getBoundingClientRect();
    const sidebar = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    expect(header.width).toBeCloseTo(root.width, 0);
    expect(sidebar.top).toBeCloseTo(header.bottom, 0);
  });

  it("a pane's default width is the designed token, and content takes the remainder", () => {
    const shell = mountShell();
    const sidebar = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    const content = within(shell, ".kui-shell-content").getBoundingClientRect();
    const designed = parseFloat(tokenOn(shell, "--shell-sidebar-w"));
    expect(designed).toBeGreaterThan(0);
    expect(sidebar.width).toBeCloseTo(designed, 1);
    expect(sidebar.width + content.width).toBeCloseTo(shell.getBoundingClientRect().width, 0);
  });

  it("the width prop writes the ONE custom property the stylesheet reads — the resize room (§27)", () => {
    const shell = mountShell({ sidebar: { width: 320 } });
    const sidebar = within(shell, ".kui-shell-sidebar");
    expect(computed(sidebar, "--kui-shell-w")).toBe("320px");
    expect(sidebar.getBoundingClientRect().width).toBeCloseTo(320, 1);
  });

  it("the bottom pane spans the full width at its designed height", () => {
    const shell = mountShell({ bottom: { defaultOpen: true } });
    const bottom = within(shell, ".kui-shell-bottom").getBoundingClientRect();
    expect(bottom.width).toBeCloseTo(shell.getBoundingClientRect().width, 0);
    expect(bottom.height).toBeCloseTo(parseFloat(tokenOn(shell, "--shell-bottom-h")), 1);
  });
});

describe("auto until touched: CSS resolves the untouched pane per window class (§18, §27)", () => {
  // Falsified: with the narrow media block's display rule deleted, the narrow half of the
  // first law reads `block` and fails.
  it("an untouched sidebar rests open on a roomy window and closed on a narrow one", async () => {
    const shell = mountShell();
    const sidebar = within(shell, ".kui-shell-sidebar");
    expect(sidebar.dataset.state).toBe("auto");
    expect(computed(sidebar, "display")).not.toBe("none");
    await narrow();
    expect(computed(sidebar, "display")).toBe("none");
    // The stamp did not move: the resolution is the stylesheet's, not a re-render's.
    expect(sidebar.dataset.state).toBe("auto");
  });

  it("an untouched inspector and bottom rest closed at every width — detail is asked for", async () => {
    const shell = mountShell();
    expect(computed(within(shell, ".kui-shell-inspector"), "display")).toBe("none");
    expect(computed(within(shell, ".kui-shell-bottom"), "display")).toBe("none");
    await narrow();
    expect(computed(within(shell, ".kui-shell-inspector"), "display")).toBe("none");
  });

  it("an untouched pane with EXPLICIT overlay presentation rests closed — an overlay is summoned, never ambient", () => {
    const shell = mountShell({ sidebar: { presentation: "overlay" } });
    expect(computed(within(shell, ".kui-shell-sidebar"), "display")).toBe("none");
  });

  it("explicit state beats auto in both directions", async () => {
    const closedAtWide = mountShell({ sidebar: { defaultOpen: false } });
    expect(computed(within(closedAtWide, ".kui-shell-sidebar"), "display")).toBe("none");
    await narrow();
    const openAtNarrow = mountShell({ sidebar: { defaultOpen: true } });
    expect(computed(within(openAtNarrow, ".kui-shell-sidebar"), "display")).not.toBe("none");
  });

  it("no open/close callback fires at mount or on a window-class crossing — structurally (§27)", async () => {
    const onOpenChange = vi.fn();
    const shell = mountShell({ sidebar: { onOpenChange } });
    // Settle past the registry's post-mount stamping…
    await expect
      .poll(() => within(shell, ".kui-shell-header button").getAttribute("aria-expanded"))
      .toBe("true");
    // …and past a responsive crossing.
    await narrow();
    await expect
      .poll(() => within(shell, ".kui-shell-header button").getAttribute("aria-expanded"))
      .toBe("false");
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

/**
 * THE MIRROR ITSELF (added 2026-08-16, ultracode audit). §27, LOG and shell.css each claimed
 * the CSS/JS agreement was "law-pinned" — and the audit proved it false by sabotage: breaking
 * the mirror's explicit-overlay arm left all 33 laws green while an untouched
 * `presentation="overlay"` pane reported aria-expanded="true" and inerted the whole shell at
 * a desktop width. Every law that existed read `display`, which the CSS answers alone.
 * These read the MIRROR — the aria the JS computes and the containment it drives.
 */
describe("the JS mirror agrees with the stylesheet, and is read (§27)", () => {
  it("an untouched explicit-overlay pane reports closed AND contains nothing, at a wide window", async () => {
    const shell = mounted(
      <Shell style={{ height: 400 }}>
        <ShellHeader>
          <ShellTrigger target="sidebar">nav</ShellTrigger>
        </ShellHeader>
        <ShellSidebar presentation="overlay" aria-label="Primary">s</ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {} },
    );
    const trigger = within(shell, ".kui-shell-header button");
    const sidebar = within(shell, ".kui-shell-sidebar");
    // The CSS half (what the old laws read) …
    expect(computed(sidebar, "display")).toBe("none");
    // … and the JS half, which nothing read: an overlay is summoned, never ambient.
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("false");
    expect(within(shell, ".kui-shell-content").inert, "the shell contained itself at rest").toBe(false);
    expect(computed(within(shell, ".kui-shell-scrim"), "display")).toBe("none");
  });

  it("an OPEN explicit-overlay pane carries the whole obligation at a wide window", async () => {
    const shell = mounted(
      <Shell style={{ height: 400 }}>
        <ShellHeader>
          <ShellTrigger target="sidebar">nav</ShellTrigger>
        </ShellHeader>
        <ShellSidebar presentation="overlay" defaultOpen aria-label="Primary">
          <button type="button">in sidebar</button>
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {} },
    );
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => within(shell, ".kui-shell-content").inert).toBe(true);
    expect(computed(sidebar, "position")).toBe("absolute");
    expect(computed(within(shell, ".kui-shell-scrim"), "display")).toBe("block");
    expect(sidebar.inert).toBe(false);
    pressEscape(sidebar);
    await expect.poll(() => sidebar.dataset.state).toBe("closed");
    expect(within(shell, ".kui-shell-content").inert).toBe(false);
  });
});

describe("the trigger: the one crossing (§27)", () => {
  it("controls its pane by name: aria-controls is the pane's id, aria-expanded its effective state", async () => {
    const shell = mountShell();
    const trigger = within(shell, ".kui-shell-header button");
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(sidebar.id);
    expect(sidebar.id).not.toBe("");
  });

  it("toggling from auto stamps an explicit state; the pane follows; toggling back reopens", async () => {
    const shell = mountShell();
    const trigger = within(shell, ".kui-shell-header button");
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("true");
    trigger.click();
    await expect.poll(() => sidebar.dataset.state).toBe("closed");
    expect(computed(sidebar, "display")).toBe("none");
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("false");
    trigger.click();
    await expect.poll(() => sidebar.dataset.state).toBe("open");
    expect(computed(sidebar, "display")).not.toBe("none");
  });

  it("a controlled pane reports and obeys: onOpenChange fires, the prop stays the truth", async () => {
    const onOpenChange = vi.fn();
    const shell = mountShell({ sidebar: { open: true, onOpenChange } });
    const trigger = within(shell, ".kui-shell-header button");
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("true");
    trigger.click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Nobody moved the prop, so the pane did not move — controlled means controlled.
    expect(sidebar.dataset.state).toBe("open");
    expect(computed(sidebar, "display")).not.toBe("none");
  });

  it("the render escape composes — the trigger's wiring lands on the caller's element", async () => {
    const shell = mounted(
      <Shell style={{ height: 400 }}>
        <ShellContent>
          <ShellTrigger target="sidebar" render={<button className="my-btn" />}>go</ShellTrigger>
        </ShellContent>
        <ShellSidebar>s</ShellSidebar>
      </Shell>,
      { theme: {} },
    );
    const btn = within(shell, ".my-btn");
    await expect.poll(() => btn.getAttribute("aria-expanded")).toBe("true");
    expect(btn.getAttribute("aria-controls")).toBe(within(shell, ".kui-shell-sidebar").id);
  });
});

describe("the overlay treatment: one element, dressed — and its obligations (§27)", () => {
  // Falsified: with the :has() scrim rule deleted the scrim law reads `none`; with the
  // effect's inert lines removed the inert law reads false; with the auto arm's
  // inset-inline-start skewed to 40px the agreement law fails on the inline offset.
  it("auto resolves to overlay on a narrow window: same element, absolute, scrim up", async () => {
    await narrow();
    const shell = mountShell({ sidebar: { defaultOpen: true } });
    const sidebar = within(shell, ".kui-shell-sidebar");
    const scrim = within(shell, ".kui-shell-scrim");
    expect(computed(sidebar, "position")).toBe("absolute");
    expect(computed(scrim, "display")).toBe("block");
    // The scrim paints the designed veil, under the pane.
    expect(parseInt(computed(scrim, "z-index"), 10)).toBeLessThan(
      parseInt(computed(sidebar, "z-index"), 10),
    );
    // Under the header, over the content: the pane's top is the header's bottom.
    const header = within(shell, ".kui-shell-header").getBoundingClientRect();
    expect(sidebar.getBoundingClientRect().top).toBeCloseTo(header.bottom, 0);
  });

  it("explicit overlay ≡ auto-at-narrow — two spellings, one treatment (the agreement law)", async () => {
    // WIDENED 2026-08-20. The first spelling read four properties, none of them the one that
    // could differ: when the collapsed-grid-area repair was applied to the explicit arms and
    // not to the `auto` restatement, the explicit drawer measured 288px and the auto drawer —
    // the path every phone takes — measured 1, and this law was green. It now reads the
    // BOX-DECIDING properties and the rendered width, and it mounts both spellings at the
    // SAME viewport, without which the two boxes were never comparable in the first place.
    const read = (el: Element) => ({
      props: [
        "position",
        "z-index",
        "inset-inline-start",
        "inset-block-start",
        "max-inline-size",
        "grid-column-start",
        "grid-column-end",
      ].map((p) => computed(el, p)),
      width: el.getBoundingClientRect().width,
    });
    await narrow();
    const explicit = mountShell({ sidebar: { presentation: "overlay", defaultOpen: true } });
    const a = read(within(explicit, ".kui-shell-sidebar"));
    explicit.remove();
    const auto = mountShell({ sidebar: { defaultOpen: true } });
    const b = read(within(auto, ".kui-shell-sidebar"));
    expect(a).toEqual(b);
    expect(a.width, "both spellings agree on a drawer nobody can see").toBeGreaterThan(100);
  });

  it("Escape puts it back, and tells the owner", async () => {
    await narrow();
    const onOpenChange = vi.fn();
    const shell = mountShell({ sidebar: { defaultOpen: true, onOpenChange } });
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => computed(sidebar, "position")).toBe("absolute");
    pressEscape(sidebar);
    await expect.poll(() => sidebar.dataset.state).toBe("closed");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(computed(within(shell, ".kui-shell-scrim"), "display")).toBe("none");
  });

  it("a scrim press closes every overlaying pane", async () => {
    await narrow();
    const shell = mountShell({ sidebar: { defaultOpen: true } });
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => computed(sidebar, "position")).toBe("absolute");
    within(shell, ".kui-shell-scrim").click();
    await expect.poll(() => sidebar.dataset.state).toBe("closed");
  });

  it("while a pane overlays, the rest of the shell is inert — and comes back", async () => {
    await narrow();
    const shell = mountShell({ sidebar: { defaultOpen: true } });
    const content = within(shell, ".kui-shell-content");
    const header = within(shell, ".kui-shell-header");
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => content.inert).toBe(true);
    expect(header.inert).toBe(true);
    expect(sidebar.inert).toBe(false);
    pressEscape(sidebar);
    await expect.poll(() => content.inert).toBe(false);
    expect(header.inert).toBe(false);
  });

  it("focus moves into the overlaying pane and returns to the trigger on close", async () => {
    await narrow();
    const shell = mountShell();
    const trigger = within(shell, ".kui-shell-header button");
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("false");
    trigger.focus();
    trigger.click();
    await expect.poll(() => document.activeElement).toBe(sidebar);
    pressEscape(sidebar);
    await expect.poll(() => document.activeElement).toBe(trigger);
  });
});

/**
 * THE PLURAL (added 2026-08-16, ultracode audit). Every overlay law above mounts ONE live
 * overlay, and the fixture's inspector and bottom resolve `auto` -> closed at narrow, so the
 * whole file exercised exactly one — which is why a shell that permanently bricked itself on
 * two shipped with 27/27 green. The repo's own sentence: a law about one axis of a two-axis
 * mechanism is half a law.
 *
 * Falsified against the pre-repair code (per-pane inert effects): every law in this block
 * fails there, and the first two fail on the ordinary pointer path with no controlled props.
 */
describe("two overlays at once — the plural the critical defect lived in (§27)", () => {
  const twoOverlays = () =>
    mounted(
      <Shell style={{ height: 600 }}>
        <ShellHeader>
          <ShellTrigger target="sidebar">nav</ShellTrigger>
          <ShellTrigger target="inspector">details</ShellTrigger>
        </ShellHeader>
        <ShellSidebar aria-label="Primary">
          <button type="button">in sidebar</button>
        </ShellSidebar>
        <ShellContent>
          <button type="button">in content</button>
        </ShellContent>
        <ShellInspector>
          <button type="button">in inspector</button>
        </ShellInspector>
      </Shell>,
      { theme: {} },
    );

  it("a live overlay is never inerted by its sibling — both stay operable", async () => {
    await narrow();
    const shell = twoOverlays();
    const [navTrigger, detailTrigger] = [...shell.querySelectorAll("button")] as HTMLElement[];
    navTrigger!.click();
    detailTrigger!.click();
    const sidebar = within(shell, ".kui-shell-sidebar");
    const inspector = within(shell, ".kui-shell-inspector");
    await expect.poll(() => inspector.dataset.state).toBe("open");
    expect(sidebar.dataset.state).toBe("open");
    // Both are live overlays: neither may be inert, and each must be reachable.
    expect(sidebar.inert, "the sidebar was inerted by its sibling overlay").toBe(false);
    expect(inspector.inert, "the inspector was inerted by its sibling overlay").toBe(false);
    const inSidebar = within(sidebar, "button");
    inSidebar.focus();
    expect(document.activeElement).toBe(inSidebar);
    // …and the rest of the shell is still contained.
    expect(within(shell, ".kui-shell-content").inert).toBe(true);
  });

  it("closing both releases the WHOLE shell — no child is left inert", async () => {
    await narrow();
    const shell = twoOverlays();
    const [navTrigger, detailTrigger] = [...shell.querySelectorAll("button")] as HTMLElement[];
    navTrigger!.click();
    detailTrigger!.click();
    await expect.poll(() => within(shell, ".kui-shell-inspector").dataset.state).toBe("open");
    within(shell, ".kui-shell-scrim").click();
    await expect.poll(() => within(shell, ".kui-shell-sidebar").dataset.state).toBe("closed");
    // The whole point: ONE snapshot, so nothing can restore a value another pass wrote.
    for (const child of [...shell.children]) {
      if (!(child instanceof HTMLElement)) continue;
      expect(child.inert, `${child.className} left inert after every overlay closed`).toBe(false);
    }
    const contentButton = within(shell, ".kui-shell-content button");
    contentButton.focus();
    expect(document.activeElement, "the app is unreachable after dismissal").toBe(contentButton);
  });

  it("a pane the consumer WRAPPED is exempt with its wrapper — containment is by containment", async () => {
    // The critic's finding: identity-matching inerted the wrapper, so the shell inerted its
    // own open drawer. A plain <div> around a pane is an ordinary consumer shape.
    await narrow();
    const shell = mounted(
      <Shell style={{ height: 600 }}>
        <ShellHeader>h</ShellHeader>
        <div data-wrapper>
          <ShellSidebar defaultOpen aria-label="Primary">
            <button type="button">in sidebar</button>
          </ShellSidebar>
        </div>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {} },
    );
    const wrapper = within(shell, "[data-wrapper]");
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => within(shell, ".kui-shell-content").inert).toBe(true);
    expect(wrapper.inert, "the wrapper holding the live overlay was inerted").toBe(false);
    const inSidebar = within(sidebar, "button");
    inSidebar.focus();
    expect(document.activeElement, "the open drawer was made unreachable").toBe(inSidebar);
  });

  it("a child mounted DURING a live overlay is contained on the next pass", async () => {
    await narrow();
    function Late() {
      const [extra, setExtra] = React.useState(false);
      return (
        <div>
        <button type="button" data-add onClick={() => setExtra(true)}>
          add
        </button>
        <Shell style={{ height: 600 }}>
          <ShellHeader>h</ShellHeader>
          <ShellSidebar defaultOpen aria-label="Primary">
            s
          </ShellSidebar>
          <ShellContent>c</ShellContent>
          {extra ? (
            <div data-late>
              <button type="button">late</button>
            </div>
          ) : null}
        </Shell>
        </div>
      );
    }
    const shell = mounted(<Late />, { theme: {}, select: ".kui-shell" });
    await expect.poll(() => within(shell, ".kui-shell-content").inert).toBe(true);
    // The button lives OUTSIDE the shell on purpose: everything inside it is contained, so a
    // trigger in the header could not be pressed to prove this.
    (shell.parentElement!.querySelector("[data-add]") as HTMLElement).click();
    await expect.poll(() => shell.querySelector("[data-late]")).not.toBe(null);
    const late = within(shell, "[data-late]");
    expect(late.inert, "a child mounted behind the scrim was never contained").toBe(true);
  });

  it("Escape is layer-aware: it is the shell's key, not the document's", async () => {
    // The listener is bound to the shell ROOT. A dispatch that never enters the shell — what
    // a portalled Dialog's own Escape looks like — must not dismiss the pane underneath.
    await narrow();
    const shell = mountShell({ sidebar: { defaultOpen: true } });
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => computed(sidebar, "position")).toBe("absolute");
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 40));
    expect(sidebar.dataset.state, "an Escape outside the shell dismissed the pane").toBe("open");
    pressEscape(sidebar);
    await expect.poll(() => sidebar.dataset.state).toBe("closed");
  });
});

describe("an overlay never takes the whole window (§27, audit 2026-08-16)", () => {
  // At 320 CSS px an uncapped overlay measured exactly the root's width: the scrim rendered
  // 0px wide, every hit-test across the shell returned the pane, and with the rest of the
  // shell contained there was no pointer route back at all.
  for (const width of [320, 375]) {
    it(`at ${width}px a dismissal strip survives, and it clears the touch minimum`, async () => {
      await page.viewport(width, 700);
      const shell = mountShell({ sidebar: { defaultOpen: true } });
      const sidebar = within(shell, ".kui-shell-sidebar");
      await expect.poll(() => computed(sidebar, "position")).toBe("absolute");
      const root = shell.getBoundingClientRect();
      const pane = sidebar.getBoundingClientRect();
      const strip = root.width - pane.width;
      const floor = parseFloat(tokenOn(shell, "--touch-target-min"));
      expect(floor).toBeGreaterThan(0);
      expect(strip, `no dismissal strip at ${width}px`).toBeGreaterThanOrEqual(floor - 0.5);
      // And the strip is really the scrim, not merely empty space.
      const hit = document.elementFromPoint(root.right - strip / 2, root.top + root.height / 2);
      expect(hit?.classList.contains("kui-shell-scrim"), "the strip is not the scrim").toBe(true);
      // THE OTHER END, added 2026-08-20 after the audit. This law was written as a bound in
      // ONE direction and shipped a critical defect underneath it for four days: the cap
      // resolved `100%` against the pane's own collapsed grid area, so every drawer on every
      // narrow screen rendered 1px wide (clientWidth 0) — and a 1px pane leaves a 374px
      // strip, which the assertion above welcomes. A bound with one end is half a bound.
      const designed = parseFloat(tokenOn(shell, "--shell-sidebar-w"));
      expect(designed).toBeGreaterThan(0);
      expect(pane.width, `the drawer collapsed at ${width}px`).toBeCloseTo(
        Math.min(designed, root.width - floor),
        0,
      );
      expect(sidebar.clientWidth, "the drawer has no content box").toBeGreaterThan(floor);
    });
  }

  it("an oversized width prop is capped rather than pushing the window sideways", async () => {
    await page.viewport(375, 700);
    const shell = mountShell({ sidebar: { defaultOpen: true, width: 480 } });
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => computed(sidebar, "position")).toBe("absolute");
    const capped = sidebar.getBoundingClientRect().width;
    expect(capped).toBeLessThan(375);
    // Capped, not collapsed — the same one-sided hole as above: `1 < 375` is true too.
    const floor = parseFloat(tokenOn(shell, "--touch-target-min"));
    expect(capped, "the oversized drawer collapsed instead of being capped").toBeCloseTo(375 - floor, 0);
    expect(shell.scrollWidth, "the shell scrolls sideways").toBeLessThanOrEqual(shell.clientWidth);
  });

  it("a NON-FLUSH pane that overlays still outranks the scrim and takes its own presses", async () => {
    // The cascade defect the audit found (2026-08-20): the floating rule was (0,5,0) —
    // `:has()` takes the specificity of its most specific argument — against the overlay
    // arm's (0,2,0), so a pane that was both non-flush and overlaying computed z-index 1,
    // tied with the scrim, and lost to it on tree order. Every press inside the open drawer
    // hit the scrim and dismissed it. The shipped comment asserted the opposite arithmetic
    // rather than measuring it, which is the mistake this file exists to catch.
    await page.viewport(375, 800);
    const shell = mounted(
      <Shell style={{ height: 600 }}>
        <ShellHeader>h</ShellHeader>
        <ShellSidebar aria-label="Primary" presentation="overlay" defaultOpen flush={false}>
          nav
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const sidebar = within(shell, ".kui-shell-sidebar");
    const scrim = shell.querySelector(".kui-shell-scrim") as HTMLElement;
    await expect.poll(() => computed(scrim, "display")).toBe("block");
    expect(Number(computed(sidebar, "z-index")), "the drawer sank into the scrim's band").toBeGreaterThan(
      Number(computed(scrim, "z-index")),
    );
    const box = sidebar.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    expect(sidebar.contains(hit), "a press inside the drawer landed on the scrim").toBe(true);
  });
});

describe("flush and floating: one fact, two postures (§27)", () => {
  it("flush: each seam is ONE hairline — a pane draws its inner edge, content draws none", () => {
    const shell = mountShell();
    const sidebar = within(shell, ".kui-shell-sidebar");
    const content = within(shell, ".kui-shell-content");
    const hairline = tokenOn(shell, "--border-width");
    expect(computed(sidebar, "border-inline-end-width")).toBe(hairline);
    expect(computed(sidebar, "border-inline-start-width")).toBe("0px");
    for (const side of ["top", "right", "bottom", "left"] as const) {
      expect(computed(content, `border-${side}-width`), side).toBe("0px");
    }
    expect(computed(sidebar, "border-radius")).toBe("0px");
    // And the panes touch: no distance between them.
    expect(content.getBoundingClientRect().left).toBeCloseTo(
      sidebar.getBoundingClientRect().right,
      0,
    );
  });

  it("floating IS the gap: pane-to-pane and pane-to-edge distances are equal, and they are the system's", () => {
    const shell = mountShell({ flush: false });
    const gap = parseFloat(tokenOn(shell, "--shell-gap"));
    expect(gap).toBeGreaterThan(0);
    const root = shell.getBoundingClientRect();
    const sidebar = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    const content = within(shell, ".kui-shell-content").getBoundingClientRect();
    expect(content.left - sidebar.right).toBeCloseTo(gap, 1);
    expect(sidebar.left - root.left).toBeCloseTo(gap, 1);
    expect(root.right - content.right).toBeCloseTo(gap, 1);
  });

  it("floating fits INSIDE its container — the frame's own padding is part of its 100%", () => {
    // Audit 2026-08-16: under the initial content-box, the half-gap the frame spends as
    // padding is added outside its declared block-size, so a floating shell in a 600px box
    // rendered 608 tall, the block-end gap read 0 against the frame, and the documented
    // 100dvh posture gained a scrollbar. Measured against the CONTAINER, which is the frame
    // of reference the sibling law below is missing — and the container is rendered IN the
    // tree rather than moved afterwards, because a re-parented percentage height resolves
    // against whatever it lands in (my first spelling of this law measured exactly that and
    // read 336px of "gap").
    const shell = mounted(
      <div data-frame style={{ height: 600, width: 900 }}>
        <Shell style={{ height: "100%" }}>
          <ShellHeader flush={false}>h</ShellHeader>
          <ShellSidebar aria-label="Primary" flush={false}>
            s
          </ShellSidebar>
          <ShellContent flush={false}>c</ShellContent>
          <ShellBottom flush={false} defaultOpen>
            b
          </ShellBottom>
        </Shell>
      </div>,
      { theme: {}, select: ".kui-shell" },
    );
    const frame = shell.closest("[data-frame]") as HTMLElement;
    const gap = parseFloat(tokenOn(shell, "--shell-gap"));
    const f = frame.getBoundingClientRect();
    const header = within(shell, ".kui-shell-header").getBoundingClientRect();
    const bottom = within(shell, ".kui-shell-bottom").getBoundingClientRect();
    // Both axes, against the container: the block-end gap is the one that read zero.
    expect(header.top - f.top).toBeCloseTo(gap, 0);
    expect(f.bottom - bottom.bottom, "the block-end gap collapsed").toBeCloseTo(gap, 0);
    expect(
      shell.getBoundingClientRect().height,
      "the floating shell overflows its own container",
    ).toBeLessThanOrEqual(f.height + 0.5);
  });

  it("a non-flush pane is a card: the full edge and the surface corner come back", () => {
    const shell = mountShell({ flush: false });
    const sidebar = within(shell, ".kui-shell-sidebar");
    const hairline = tokenOn(shell, "--border-width");
    expect(computed(sidebar, "border-inline-start-width")).toBe(hairline);
    expect(computed(sidebar, "border-inline-end-width")).toBe(hairline);
    expect(computed(sidebar, "border-radius")).toBe(tokenOn(shell, "--radius-surface-3"));
  });

  it("the gap answers density through the layer — it IS the layout-space pick, in every scope", () => {
    for (const density of ["compact", "default", "comfortable"] as const) {
      const shell = mountShell({ flush: false });
      const themed = mounted(<div />, { theme: { density } });
      expect(tokenOn(themed, "--shell-gap"), density).toBe(tokenOn(themed, "--layout-space-3"));
      shell.remove();
    }
  });
});

/**
 * PLACEMENT (§27, added 2026-08-16 — Kushagra: "Shell should be able to sit at app root, its
 * designed for it, or be placed in a modal or dialog or whatever too").
 *
 * The shell is designed for the app root, and at the root its containment is complete by
 * construction: contain every child of the shell and you have contained the app. But it must
 * also COMPOSE, and a Shell inside a Dialog is the placement that proves it — measured, the
 * layout and the containment were already right, and exactly one thing was wrong: a single
 * Escape closed the pane AND the dialog around it, the same layer-blindness the audit fixed
 * in the other direction. Falsified against the code without `stopPropagation`.
 */
describe("the derivation: what a non-flush pane BECOMES is read off the content (§27)", () => {
  /* The load-bearing pair. Both mounts are the same shell with the same non-flush sidebar;
     the ONLY difference is one prop on a DIFFERENT pane. That is deliberate — a law over a
     derivation needs an input where the derivation can be wrong, or it is a law about
     whichever branch the fixture happened to pick (LOG 2026-08-20, the builder audit's own
     lesson). Both are falsified: pin the derivation to either answer and exactly one fails. */
  const derived = (contentFlush: boolean) =>
    mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellHeader>h</ShellHeader>
        <ShellSidebar aria-label="Primary" flush={false}>
          nav
        </ShellSidebar>
        <ShellContent flush={contentFlush}>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );

  it("content flush → the sidebar FLOATS: the work area runs out to the frame edge under it", () => {
    const shell = derived(true);
    const frame = shell.getBoundingClientRect();
    const sidebar = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    const content = within(shell, ".kui-shell-content").getBoundingClientRect();
    // The whole point: the content is UNDERNEATH, so its box reaches the frame's own edge
    // and the sidebar sits inside it rather than beside it.
    expect(content.left, "the content stopped at the sidebar instead of running under it").toBeCloseTo(frame.left, 0);
    expect(sidebar.left).toBeGreaterThan(content.left);
    expect(sidebar.right).toBeLessThan(content.right);
  });

  it("content NOT flush → the same sidebar GROUNDS: nothing is behind it, so it sits beside", () => {
    const shell = derived(false);
    const sidebar = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    const content = within(shell, ".kui-shell-content").getBoundingClientRect();
    expect(content.left, "the content ran under a pane with nothing to float over").toBeGreaterThanOrEqual(
      sidebar.right - 0.5,
    );
  });

  it("a floating pane paints ABOVE the content it covers, without a positioned box", () => {
    const shell = derived(true);
    const sidebar = within(shell, ".kui-shell-sidebar");
    const box = sidebar.getBoundingClientRect();
    // Read the browser's own answer rather than a declaration: z-index on a grid item works
    // with `position: static`, which is what keeps the overlay treatment's `absolute`
    // uncontested — so asserting a `position` declaration would measure the wrong thing.
    expect(computed(sidebar, "position"), "a floating pane should not need positioning").toBe("static");
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    expect(sidebar.contains(hit), "the content won the hit-test over the pane on top of it").toBe(true);
  });

  it("the content grows ONLY on the sides something floats on — a flush header still pushes it down", () => {
    const shell = derived(true);
    const header = within(shell, ".kui-shell-header").getBoundingClientRect();
    const content = within(shell, ".kui-shell-content").getBoundingClientRect();
    expect(content.top, "the content slid under a header that never left the frame").toBeCloseTo(
      header.bottom,
      0,
    );
  });

  it("a non-flush pane expresses the theme's material on CALM GROUND; a flush one does not", () => {
    // The one-directional rule (corrected 2026-08-20): a non-flush pane answers for itself
    // because something is behind it either way; a flush pane follows the ambient region,
    // which is what keeps full-window vibrancy — a flush translucent sidebar — reachable.
    const shell = mounted(
      <Shell style={{ height: 300 }}>
        <ShellSidebar aria-label="Primary" flush={false}>
          nav
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: { material: "regular" }, select: ".kui-shell" },
    );
    expect(
      within(shell, ".kui-shell-sidebar").dataset.material,
      "a pane pulled off the frame did not take the material it now has a backdrop for",
    ).toBe("regular");
    expect(
      within(shell, ".kui-shell-content").dataset.material,
      "a welded pane expressed glass with nothing stated behind the shell",
    ).toBeUndefined();
  });

  it("a FLUSH pane standing between a floating one and the content is not buried by it", () => {
    // Audit 2026-08-20. `grid-column-start: rail-start` asked only whether the RAIL floats,
    // so a flush sidebar between the two had the content's area grown straight across it —
    // and the content, later in DOM and at the same `z-index: auto`, painted its opaque seal
    // over 288px of sidebar. The derivation's premise is "the content is underneath THIS
    // pane", and a flush pane in between means it is not, so the rail grounds instead.
    const shell = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellRail aria-label="Sections" flush={false}>
          rail
        </ShellRail>
        <ShellSidebar aria-label="Primary">sidebar</ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const sidebar = within(shell, ".kui-shell-sidebar");
    const box = sidebar.getBoundingClientRect();
    const content = within(shell, ".kui-shell-content").getBoundingClientRect();
    expect(content.left, "the content grew across the flush pane in its way").toBeGreaterThanOrEqual(
      box.right - 0.5,
    );
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + 200);
    expect(sidebar.contains(hit), "the flush pane is painted over and unhittable").toBe(true);
  });

  it("two floating columns tile: the rail's line wins, and BOTH are reachable", () => {
    // The tie the shipped comment leans on — the rail growth rule is stated after the
    // sidebar's and both are equal specificity — had no law at all, so swapping the two
    // blocks changed the shipped geometry with the suite green (audit 2026-08-20). This is
    // also the fixture where the general case and the special case give different answers:
    // with only ONE nav column floating, either ordering produces the same layout.
    const shell = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellRail aria-label="Sections" flush={false}>
          rail
        </ShellRail>
        <ShellSidebar aria-label="Primary" flush={false}>
          sidebar
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const frame = shell.getBoundingClientRect();
    const rail = within(shell, ".kui-shell-rail");
    const sidebar = within(shell, ".kui-shell-sidebar");
    const content = within(shell, ".kui-shell-content").getBoundingClientRect();
    // The rail's line is the outermost one, so the content reaches the frame's own edge —
    // stopping at the sidebar's line would leave the rail sitting on nothing.
    expect(content.left, "the content stopped at the inner column's line").toBeCloseTo(frame.left, 0);
    // And neither column is buried by the other or by the content.
    for (const [name, el] of [
      ["rail", rail],
      ["sidebar", sidebar],
    ] as const) {
      const b = el.getBoundingClientRect();
      const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      expect(el.contains(hit), `the ${name} is not on top of the content it floats over`).toBe(true);
    }
    // They tile rather than stack: the sidebar begins after the rail ends.
    expect(sidebar.getBoundingClientRect().left).toBeGreaterThan(rail.getBoundingClientRect().right);
  });

  it("a grounded content in flush chrome takes the FULL gap on every side", () => {
    // The mixed regime: the frame pays nothing and the flush panes pay nothing, so the one
    // non-flush pane pays in full — which is what makes its gap to the chrome equal to its
    // gap to the window edge. (Halving it is the defect this spelling exists to avoid.)
    const shell = mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellSidebar aria-label="Primary">nav</ShellSidebar>
        <ShellContent flush={false}>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const gap = parseFloat(tokenOn(shell, "--shell-gap"));
    const frame = shell.getBoundingClientRect();
    const sidebar = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    const content = within(shell, ".kui-shell-content").getBoundingClientRect();
    expect(content.left - sidebar.right, "the gap against the chrome").toBeCloseTo(gap, 0);
    expect(frame.right - content.right, "the gap against the window edge").toBeCloseTo(gap, 0);
    expect(content.top - frame.top, "the gap above").toBeCloseTo(gap, 0);
    // And the flush neighbour is still welded to the frame.
    expect(sidebar.left).toBeCloseTo(frame.left, 0);
  });
});

describe("the sidebar's own anatomy: the scrolling region and the nav row (§21, §27)", () => {
  const nav = (props?: { size?: "1" | "2" | "3" | "4"; rows?: number }) =>
    mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellSidebar aria-label="Primary" size={props?.size ?? "2"}>
          <Button size={props?.size ?? "2"}>New project</Button>
          <ShellScroll>
            <ShellNavGroup label="Workspace">
              <ShellNavItem current>Inbox</ShellNavItem>
              {Array.from({ length: props?.rows ?? 1 }, (_, i) => (
                <ShellNavItem key={i}>Row {i}</ShellNavItem>
              ))}
            </ShellNavGroup>
          </ShellScroll>
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );

  const rows = (root: HTMLElement) =>
    [...root.querySelectorAll<HTMLElement>(".kui-shell-nav-item")];

  it("a nav row stands LEVEL with a real Button, at every size", () => {
    // The segmented control's law verbatim (§26) — measured against a mounted Button rather
    // than compared as tokens, because "reads the same height" is a claim about pixels. The
    // menu row is the family's shifted member and its reason (a panel opened for a second,
    // scanned, dismissed, with no buttons near it) does not reach a permanent column that
    // sits beside real buttons all day. So this member simply does not take the stand-down,
    // and it costs no new designed number.
    for (const size of ["1", "2", "3", "4"] as const) {
      const shell = nav({ size });
      const button = within(shell, ".kui-button").getBoundingClientRect().height;
      const row = rows(shell)[0]!.getBoundingClientRect().height;
      expect(button).toBeGreaterThan(0);
      expect(row, `size ${size}: the row and the button beside it disagree`).toBeCloseTo(button, 0);
      shell.remove();
    }
  });

  it("the group's HEADING keeps the family's short box — a caption is not a target", () => {
    const shell = nav();
    const label = within(shell, ".kui-shell-nav-label").getBoundingClientRect().height;
    const row = rows(shell)[0]!.getBoundingClientRect().height;
    expect(label, "the heading grew into a row").toBeLessThan(row);
    expect(label).toBeGreaterThan(0);
  });

  it("hover reaches a nav row — the family's stand-down is about a roving highlight it has none of", async () => {
    // §21's stand-down exists so a pointer-rested row does not stay lit after the keyboard
    // moves on (Base UI folds both into `data-highlighted`). A sidebar has no roving
    // highlight at all, so without this member restating hover the row is simply dead under
    // the pointer — measured, rest and hover byte-identical.
    const shell = nav({ rows: 2 });
    const plain = rows(shell)[1]!;
    const rest = computed(plain, "background-color");
    await userEvent.hover(plain);
    expect(computed(plain, "background-color"), "a nav row does not answer the pointer").not.toBe(
      rest,
    );
  });

  it("current and hover are DIFFERENT currencies, so they compose instead of colliding", async () => {
    // The fills go rest → hover → press; a fourth step would have nowhere to go. Current is
    // not a fourth step, it is another colour — the row stamps `data-tone="accent"`, so grey
    // means the pointer is here and accent means this is where you are. Apple's answer, and
    // the same call the rail's item takes.
    const shell = nav({ rows: 2 });
    const [currentRow, plain] = [rows(shell)[0]!, rows(shell)[1]!];
    const currentRest = computed(currentRow, "background-color");
    const plainRest = computed(plain, "background-color");
    // FIRST: current is a state at all. Without this the law passes for a row that is simply
    // not current — its own sabotage pass caught exactly that, because "different from the
    // hover colour" is also true of transparent.
    expect(currentRest, "the current row rests unpainted").not.toBe(plainRest);
    expect(currentRest, "the current row rests transparent").not.toContain("rgba(0, 0, 0, 0)");
    await userEvent.hover(plain);
    const plainHovered = computed(plain, "background-color");
    expect(currentRest, "the current row is painted in the hover currency").not.toBe(plainHovered);
    // And the current row still MOVES under the pointer rather than being a dead end.
    await userEvent.hover(currentRow);
    expect(
      computed(currentRow, "background-color"),
      "hovering the current row has nowhere to go",
    ).not.toBe(currentRest);
  });

  it("being current is ANNOUNCED, and the heading is CONNECTED to its items", () => {
    // Both are the non-visual halves that force these parts to exist at all (§10's
    // criterion): a colour tells nobody who cannot see it, and a heading rendered as a
    // sibling is a heading nobody is told about.
    const shell = nav();
    expect(rows(shell)[0]!.getAttribute("aria-current")).toBe("page");
    const group = within(shell, ".kui-shell-nav-group");
    const label = within(shell, ".kui-shell-nav-label");
    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("aria-labelledby"), "the heading is not wired to its group").toBe(
      label.id,
    );
    expect(label.id).not.toBe("");
  });

  it("a SHORT list still fills the pane, so anything after the region pins to the bottom", () => {
    // The fixture where flex-GROW can be wrong. With a long list the region is bounded by
    // shrinking, so `flex: 0 1 auto` behaves identically and a law built on overflow proves
    // nothing about growth — its own sabotage pass caught exactly that. A short list is
    // where growth is the only thing holding the footer down, and a pinned footer is half of
    // what "mark the one region that scrolls" is for.
    const shell = mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellSidebar aria-label="Primary">
          <ShellScroll>
            <ShellNavItem>Only row</ShellNavItem>
          </ShellScroll>
          <Button data-testid="footer">Account</Button>
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const pane = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    const footer = within(shell, "[data-testid='footer']").getBoundingClientRect();
    expect(footer.bottom, "the footer floated up under the list instead of pinning").toBeCloseTo(
      pane.bottom,
      0,
    );
  });

  it("the marked region scrolls and the PANE stops scrolling itself", () => {
    // The one part, and the one declaration the builder was hand-writing five times: a flex
    // item's automatic minimum size is its content, so without `min-block-size: 0` a long
    // list refuses to shrink, the pane grows past its own box, and nothing scrolls anywhere.
    const shell = nav({ rows: 60 });
    const pane = within(shell, ".kui-shell-sidebar");
    const region = within(shell, ".kui-shell-scroll");
    const viewport = within(shell, ".kui-scroll-viewport");
    expect(computed(pane, "flex-direction")).toBe("column");
    // The pane is not a scroll container: its content fits, because the region absorbed it.
    expect(pane.scrollHeight, "the pane is scrolling itself").toBeLessThanOrEqual(
      pane.clientHeight + 1,
    );
    // The region really did take the leftover room rather than its content's height.
    expect(region.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(region.getBoundingClientRect().height).toBeLessThan(400);
    // And it is the thing that scrolls.
    expect(viewport.scrollHeight, "nothing overflows the region").toBeGreaterThan(
      viewport.clientHeight,
    );
  });
});

describe("the rail: a column of squares whose width is not the app's to state (§27)", () => {
  const rail = (size: "1" | "2" | "3" | "4") =>
    mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellRail aria-label="Sections" size={size}>
          <ShellRailList>
            <ShellRailItem aria-label="Home" current>
              H
            </ShellRailItem>
            <ShellRailItem aria-label="Search">S</ShellRailItem>
          </ShellRailList>
        </ShellRail>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );

  it("its extent DERIVES from the size it was given — square plus the air, at every index", () => {
    // The decision this law exists for: shipped, the rail was a flat 64 in both pointer
    // worlds while its contents were 32 fine and 44 coarse, so the column did not answer the
    // axis its own contents answer. A width prop can never do this; only a size can.
    const seen = new Set<number>();
    for (const size of ["1", "2", "3", "4"] as const) {
      const shell = rail(size);
      const pane = within(shell, ".kui-shell-rail");
      const square = parseFloat(tokenOn(pane, `--control-height-${size}`));
      const inset = parseFloat(tokenOn(pane, "--shell-nav-inset"));
      expect(square).toBeGreaterThan(0);
      expect(inset).toBeGreaterThan(0);
      // The CONTENT box: the extent is stated as the square plus its air, and the pane's own
      // seam hairline sits outside that rather than eating into it.
      expect(pane.clientWidth, `size ${size}: the rail is not its item's box`).toBeCloseTo(
        square + 2 * inset,
        0,
      );
      seen.add(Math.round(pane.clientWidth));
      shell.remove();
    }
    // And it really MOVES with the index — a rail that answered nothing would pass the
    // arithmetic above at one width four times over.
    expect(seen.size, "the rail is the same width at every size").toBe(4);
  });

  it("the item is a SQUARE, and it stands level with a Button of the same size", () => {
    for (const size of ["1", "2", "3", "4"] as const) {
      const shell = rail(size);
      const box = within(shell, ".kui-shell-rail-item").getBoundingClientRect();
      const h = parseFloat(tokenOn(within(shell, ".kui-shell-rail"), `--control-height-${size}`));
      expect(box.width, `size ${size}: not square`).toBeCloseTo(box.height, 0);
      expect(box.width, `size ${size}: not the control's box`).toBeCloseTo(h, 0);
      shell.remove();
    }
  });

  it("the PAINT is inset and the TARGET is not — a press in the gutter is the item's", () => {
    // Apple's sidebar geometry: the painted rounded rect keeps a margin while the whole
    // column still takes the click. Measured on both members, because the mechanism is one
    // rule shared between them and a law about one of two is half a law.
    const shell = rail("3");
    const pane = within(shell, ".kui-shell-rail");
    const paneBox = pane.getBoundingClientRect();
    const item = within(shell, ".kui-shell-rail-item");
    const box = item.getBoundingClientRect();
    const inset = parseFloat(tokenOn(pane, "--shell-nav-inset"));
    expect(box.left - paneBox.left, "the square is painted edge to edge").toBeCloseTo(inset, 0);
    const hit = document.elementFromPoint(paneBox.left + 1, box.top + box.height / 2);
    expect(item.contains(hit), "the gutter beside the square is dead").toBe(true);
  });

  it("current speaks accent and hover speaks grey here too — one vocabulary, two families", async () => {
    const shell = rail("3");
    const [currentItem, plain] = [
      ...shell.querySelectorAll<HTMLElement>(".kui-shell-rail-item"),
    ];
    const currentRest = computed(currentItem!, "background-color");
    expect(currentRest, "the current square rests transparent").not.toContain("rgba(0, 0, 0, 0)");
    await userEvent.hover(plain!);
    expect(
      computed(plain!, "background-color"),
      "the current square and a hovered one are painted the same",
    ).not.toBe(currentRest);
  });
});

describe("placement: at the root, and composed inside another layer (§27)", () => {
  it("inside a Dialog: the shell lays out, contains its own children, and answers Escape ALONE", async () => {
    const onOpenChange = vi.fn();
    mounted(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Embedded</DialogTitle>
          <div style={{ height: 400 }}>
            <Shell>
              <ShellHeader>
                <ShellTrigger target="sidebar">nav</ShellTrigger>
              </ShellHeader>
              <ShellSidebar presentation="overlay" aria-label="Primary">
                <button type="button">in sidebar</button>
              </ShellSidebar>
              <ShellContent>
                <button type="button">in content</button>
              </ShellContent>
            </Shell>
          </div>
        </DialogContent>
      </Dialog>,
      { theme: {} },
    );
    await expect.poll(() => document.querySelector(".kui-shell")).not.toBe(null);
    const shell = document.querySelector(".kui-shell") as HTMLElement;
    // It lays out inside the panel rather than collapsing or spilling.
    const box = shell.getBoundingClientRect();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeCloseTo(400, 0);

    within(shell, ".kui-shell-header button").click();
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => sidebar.dataset.state).toBe("open");
    // Containment inside the shell is the shell's, and it works here exactly as at the root.
    expect(computed(sidebar, "position")).toBe("absolute");
    expect(within(shell, ".kui-shell-content").inert).toBe(true);
    expect(computed(within(shell, ".kui-shell-scrim"), "display")).toBe("block");

    // ONE key, ONE layer: the pane is the innermost dismissible thing, so it answers and the
    // dialog never hears it.
    pressEscape(sidebar);
    await expect.poll(() => sidebar.dataset.state).toBe("closed");
    expect(document.querySelector(".kui-dialog-popup"), "the dialog closed too").not.toBe(null);
    expect(onOpenChange, "the dialog was told to close").not.toHaveBeenCalled();
    // And with the pane gone, Escape belongs to the dialog again.
    within(shell, ".kui-shell-content button").focus();
    within(shell, ".kui-shell-content button").dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await expect.poll(() => onOpenChange.mock.calls.length).toBeGreaterThan(0);
  });

  it("at the root: containing every child of the shell IS containing the app", async () => {
    // The root placement's own claim, stated as a law so the "containment stops at the shell
    // root" limit in §27 is scoped rather than vague: every child of the root — including one
    // the app rendered itself, not just panes — is contained while a pane overlays.
    await narrow();
    const shell = mounted(
      <Shell style={{ height: 600 }}>
        <ShellHeader>h</ShellHeader>
        <ShellSidebar defaultOpen aria-label="Primary">s</ShellSidebar>
        <ShellContent>c</ShellContent>
        <div data-app-owned>
          <button type="button">app widget</button>
        </div>
      </Shell>,
      { theme: {} },
    );
    await expect.poll(() => within(shell, ".kui-shell-content").inert).toBe(true);
    expect(within(shell, "[data-app-owned]").inert, "an app-owned child escaped containment").toBe(
      true,
    );
    const widget = within(shell, "[data-app-owned] button");
    widget.focus();
    expect(document.activeElement).not.toBe(widget);
  });
});

describe("material reaches the panes as it reaches a Card (§10, §27)", () => {
  // REWRITTEN on the merge with main 2026-08-20. The old law asserted that a glass theme's
  // pane stamps the theme's material — true under the material model the shell was built
  // against, and false since selectivity (§10, 2026-08-17): a surface expresses the theme's
  // glass only where a BACKDROP is stated, and resolves solid on calm ground. The pane was
  // behaving correctly and the law was encoding the old system.
  //
  // It is stated RELATIVELY now, against a Card under identical placement, because "a pane is
  // a card among cards" is the shell's own identity claim (§27) and an absolute assertion here
  // would rot again the next time the material model moves. What it pins is membership, not a
  // value: whatever a Card resolves in a given placement, a pane resolves the same.
  const paneAndCardIn = (backdrop: boolean) => {
    const host = mounted(
      <Box backdrop={backdrop}>
        <Shell style={{ height: 300 }}>
          <ShellSidebar aria-label="Primary">nav</ShellSidebar>
          <ShellContent>c</ShellContent>
        </Shell>
        <Card>beside it</Card>
      </Box>,
      { theme: { material: "regular" }, select: "[data-kui-backdrop], div" },
    );
    const root = host.closest(".kui-theme") ?? host;
    return {
      pane: within(root, ".kui-shell-sidebar"),
      card: within(root, ".kui-card"),
    };
  };

  it("on calm ground both resolve solid — selectivity, and a pane pays nothing for it", () => {
    const { pane, card } = paneAndCardIn(false);
    expect(card.dataset.material, "the reference Card expressed glass on calm ground").toBeUndefined();
    expect(pane.dataset.material, "the pane and the Card disagree on calm ground").toBe(
      card.dataset.material,
    );
  });

  it("inside a marked backdrop region both express the theme's material, identically", () => {
    const { pane, card } = paneAndCardIn(true);
    expect(card.dataset.material, "the reference Card did not express the theme's glass").toBe(
      "regular",
    );
    expect(pane.dataset.material, "the pane and the Card disagree over a backdrop").toBe(
      card.dataset.material,
    );
  });

  it("a glass pane BUILDS THE LENS — glass here is defended like glass everywhere else", () => {
    // Audit 2026-08-20. `usePaneDress` stamped the material and scoped the subtree but never
    // called `useLensRef`, so a glass shell pane computed a bare blur/saturate/brightness
    // chain while Card, Button, TextField, Select, Menu, Dialog and the rest all prepend
    // `url(#kui-lens-N)`. §10's own porting note says the near-clear ladder is NOT
    // self-sufficient — blur hides a backdrop, the lens re-states it — so the shell was the
    // one glass in the library defended by blur alone, on the largest boxes in the library.
    const shell = mounted(
      <Shell style={{ height: 300, width: 600 }}>
        <ShellSidebar aria-label="Primary" flush={false}>
          nav
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: { material: "regular" }, select: ".kui-shell" },
    );
    const pane = within(shell, ".kui-shell-sidebar");
    const filter = computed(pane, "backdrop-filter");
    expect(filter, "the pane declares no material at all").toContain("blur");
    const id = filter.match(/^url\("([^"]+)"\)/)?.[1];
    expect(id, `the glass pane is defended by blur alone: ${filter}`).toBeTruthy();
    // The map is this box's own — a lens encodes ONE rounded rect, which is why the property
    // is non-inheriting and why a shared map would be wrong rather than merely wasteful.
    expect(pane.style.getPropertyValue("--kui-lens")).not.toBe("");
    // And a flush pane in the same shell resolves solid, so it honestly has none.
    expect(within(shell, ".kui-shell-content").style.getPropertyValue("--kui-lens")).toBe("");
  });

  it("a Card composed inside a glass pane goes ON-GLASS — glass does not stack", () => {
    const shell = mounted(
      <Box backdrop>
        <Shell style={{ height: 300 }}>
          <ShellContent>
            <Card>on the pane</Card>
          </ShellContent>
        </Shell>
      </Box>,
      { theme: { material: "regular" }, select: ".kui-shell" },
    );
    expect(within(shell, ".kui-shell-content").dataset.material).toBe("regular");
    expect(within(shell, ".kui-card").dataset.material).toBe("on-glass");
  });
});
