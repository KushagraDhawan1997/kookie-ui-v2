/**
 * Shell mounted laws (§26) — computed values through a real <Theme>, per the 2026-08-03
 * standard. The viewport is resized for real where a law is about the window (the
 * window.browser.test.tsx pattern): matchMedia and the media block are the mechanism, and a
 * law that stubs the mechanism it is testing proves nothing.
 *
 * The load-bearing ones were falsified before being trusted (recorded per law): the
 * auto-resolution laws against the narrow media block deleted, the agreement law against a
 * skewed overlay arm, the scrim law against the :has() rule deleted, and the inert law
 * against the effect's inert lines removed.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";

import {
  Shell,
  ShellBottom,
  ShellContent,
  ShellHeader,
  ShellInspector,
  ShellRail,
  ShellSidebar,
  ShellTrigger,
} from "./shell.tsx";
import { Card } from "../card/card.tsx";
import { computed, mounted, tokenOn, within } from "../../test/browser.tsx";
import { VIEWPORT as WIDE } from "../../test/viewport.ts";

const narrow = () => page.viewport(375, 800);

afterEach(async () => {
  await page.viewport(WIDE.width, WIDE.height);
});

/** A whole shell; every pane present unless a law states its own. */
function fixture(props: {
  panes?: "flush" | "floating";
  sidebar?: React.ComponentProps<typeof ShellSidebar>;
  inspector?: React.ComponentProps<typeof ShellInspector>;
  bottom?: React.ComponentProps<typeof ShellBottom>;
  rail?: boolean;
} = {}) {
  return (
    <Shell panes={props.panes ?? "flush"} style={{ height: 600 }}>
      <ShellHeader>
        <ShellTrigger target="sidebar" data-testid="trigger">
          menu
        </ShellTrigger>
      </ShellHeader>
      {props.rail ? <ShellRail aria-label="Sections">rail</ShellRail> : null}
      <ShellSidebar aria-label="Primary" {...props.sidebar}>
        sidebar
      </ShellSidebar>
      <ShellContent>content</ShellContent>
      <ShellInspector {...props.inspector}>inspector</ShellInspector>
      <ShellBottom {...props.bottom}>bottom</ShellBottom>
    </Shell>
  );
}

const mountShell = (props?: Parameters<typeof fixture>[0]) =>
  mounted(fixture(props), { theme: {} });

describe("anatomy: the landmarks are by construction (§26)", () => {
  it("header, main, nav, aside — the elements, not roles bolted on", () => {
    const shell = mountShell({ rail: true, inspector: { defaultOpen: true }, bottom: { defaultOpen: true } });
    expect(within(shell, ".kui-shell-header").tagName).toBe("HEADER");
    expect(within(shell, ".kui-shell-content").tagName).toBe("MAIN");
    expect(within(shell, ".kui-shell-rail").tagName).toBe("NAV");
    expect(within(shell, ".kui-shell-sidebar").tagName).toBe("NAV");
    expect(within(shell, ".kui-shell-inspector").tagName).toBe("ASIDE");
    expect(within(shell, ".kui-shell-bottom").tagName).toBe("ASIDE");
  });

  it("a pane IS a surface: its seal and edge are a Card's, computed (§10, §26)", () => {
    const shell = mountShell();
    const card = mounted(<Card>c</Card>, { theme: {} });
    const sidebar = within(shell, ".kui-shell-sidebar");
    expect(computed(sidebar, "background-color")).toBe(computed(card, "background-color"));
    expect(computed(sidebar, "border-top-color")).toBe(computed(card, "border-top-color"));
  });

  it("no pane carries a positive z-index at rest — internal layering stays inside the shell's isolate (§20)", () => {
    const shell = mountShell();
    expect(computed(shell, "isolation")).toBe("isolate");
    for (const sel of [".kui-shell-header", ".kui-shell-sidebar", ".kui-shell-content"]) {
      expect(computed(within(shell, sel), "z-index"), sel).toBe("auto");
    }
    expect(computed(shell, "z-index")).toBe("auto");
  });
});

describe("geometry: the header criterion and the columns (§26)", () => {
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

  it("the width prop writes the ONE custom property the stylesheet reads — the resize room (§26)", () => {
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

describe("auto until touched: CSS resolves the untouched pane per window class (§18, §26)", () => {
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

  it("no open/close callback fires at mount or on a window-class crossing — structurally (§26)", async () => {
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

describe("the trigger: the one crossing (§26)", () => {
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

describe("the overlay treatment: one element, dressed — and its obligations (§26)", () => {
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

  it("explicit overlay at a wide window ≡ auto at a narrow one — two spellings, one treatment (the agreement law)", async () => {
    const read = (el: Element) =>
      ["position", "z-index", "inset-inline-start", "inset-block-start"].map((p) => computed(el, p));
    const explicit = mountShell({ sidebar: { presentation: "overlay", defaultOpen: true } });
    const a = read(within(explicit, ".kui-shell-sidebar"));
    await narrow();
    const auto = mountShell({ sidebar: { defaultOpen: true } });
    const b = read(within(auto, ".kui-shell-sidebar"));
    expect(a).toEqual(b);
  });

  it("Escape puts it back, and tells the owner", async () => {
    await narrow();
    const onOpenChange = vi.fn();
    const shell = mountShell({ sidebar: { defaultOpen: true, onOpenChange } });
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => computed(sidebar, "position")).toBe("absolute");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
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
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
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
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await expect.poll(() => document.activeElement).toBe(trigger);
  });
});

describe("flush and floating: one fact, two postures (§26)", () => {
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
    const shell = mountShell({ panes: "floating" });
    const gap = parseFloat(tokenOn(shell, "--shell-gap"));
    expect(gap).toBeGreaterThan(0);
    const root = shell.getBoundingClientRect();
    const sidebar = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    const content = within(shell, ".kui-shell-content").getBoundingClientRect();
    expect(content.left - sidebar.right).toBeCloseTo(gap, 1);
    expect(sidebar.left - root.left).toBeCloseTo(gap, 1);
    expect(root.right - content.right).toBeCloseTo(gap, 1);
  });

  it("floating panes are cards: the full edge and the surface corner come back", () => {
    const shell = mountShell({ panes: "floating" });
    const sidebar = within(shell, ".kui-shell-sidebar");
    const hairline = tokenOn(shell, "--border-width");
    expect(computed(sidebar, "border-inline-start-width")).toBe(hairline);
    expect(computed(sidebar, "border-inline-end-width")).toBe(hairline);
    expect(computed(sidebar, "border-radius")).toBe(tokenOn(shell, "--radius-surface-3"));
  });

  it("the gap answers density through the layer — it IS the layout-space pick, in every scope", () => {
    for (const density of ["compact", "default", "comfortable"] as const) {
      const shell = mountShell({ panes: "floating" });
      const themed = mounted(<div />, { theme: { density } });
      expect(tokenOn(themed, "--shell-gap"), density).toBe(tokenOn(themed, "--layout-space-3"));
      shell.remove();
    }
  });
});

describe("material reaches the panes as it reaches a Card (§10, §26)", () => {
  it("a glass theme's pane stamps the material; what sits ON the pane resolves solid", () => {
    const shell = mounted(fixture(), { theme: { material: "regular" } });
    const sidebar = within(shell, ".kui-shell-sidebar");
    expect(sidebar.dataset.material).toBe("regular");
    // GlassScope: a Card composed inside the pane is opaque — glass does not stack.
    const inner = mounted(
      <Shell style={{ height: 300 }}>
        <ShellContent>
          <Card>on the pane</Card>
        </ShellContent>
      </Shell>,
      { theme: { material: "regular" } },
    );
    const card = within(inner, ".kui-card");
    expect(card.dataset.material).toBeUndefined();
  });
});
