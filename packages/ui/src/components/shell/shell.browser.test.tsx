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
import { flushSync } from "react-dom";
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
import type { Size } from "../../system/axes.ts";
import { Button } from "../button/button.tsx";
import { Row } from "../row/row.tsx";
import { Separator } from "../separator/separator.tsx";
import { Box } from "../box/box.tsx";
import { Card } from "../card/card.tsx";
import { Dialog, DialogContent, DialogTitle } from "../dialog/dialog.tsx";
import {
  APPEARANCES,
  DEPTHS,
  SIZES,
  colorOn,
  computed,
  mounted,
  render,
  tokenOn,
  within,
} from "../../test/browser.tsx";
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

  /**
   * REVERSED 2026-08-21 (Kushagra: "flush should have no background at all, it's flush to
   * page"). This law used to assert that a FLUSH pane's seal is a Card's, and it was true —
   * measured, header and sidebar and content all painting the identical value a Card paints,
   * which is exactly why the fill was carrying no information. A pane level with the page is
   * not a plane, so it has no fill; the surface identity is what a pane wears when it LEAVES
   * the frame, which is the half this law states now.
   *
   * The edge is deliberately still compared: `border-width: 0` leaves the surface's border
   * COLOR in place so a seam stays reachable by contrast="high", and that has not changed.
   *
   * Falsified: with the flush stand-down removed, the first half reads the seal and fails;
   * with the non-flush pane's fill left standing down, the second half fails.
   */
  it("a flush pane paints nothing; a pane off the frame paints a Card's seal (§10, §27)", () => {
    const shell = mountShell();
    const card = mounted(<Card>c</Card>, { theme: {} });
    const flush = within(shell, ".kui-shell-sidebar");
    expect(computed(flush, "background-color"), "a flush pane is level with the page").toBe(
      "rgba(0, 0, 0, 0)",
    );
    // A fill is one of THREE things a plane does, and reading only the fill is how a flush
    // pane went on catching light and casting a shadow with this law green (2026-08-21).
    expect(computed(flush, "background-image"), "a flush pane catches no light").toBe("none");
    expect(
      computed(flush, "box-shadow").replace(/rgba\(0, 0, 0, 0\) 0px 0px 0px 0px/g, "").replace(/[\s,]/g, ""),
      "a flush pane throws no shadow",
    ).toBe("");
    // …while a pane off the frame does all three.
    expect(computed(within(shell, ".kui-shell-content"), "background-image"), "content too").toBe(
      "none",
    );
    // Its EDGE is deliberately not a Card's any more (2026-08-21): a card's boundary in the
    // elevated world is its cast, which a flush pane no longer has, so the seam is a RULE —
    // pinned to a Separator's colour by its own laws below rather than restated here.

    const off = mounted(
      <Shell style={{ height: 400 }}>
        <ShellSidebar aria-label="Primary" flush={false}>
          nav
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const pulled = within(off, ".kui-shell-sidebar");
    expect(computed(pulled, "background-color"), "a pane off the frame IS a card").toBe(
      computed(card, "background-color"),
    );
    expect(computed(pulled, "border-top-color")).toBe(computed(card, "border-top-color"));
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
 * NOT BEING DISPLAYED OUT-RANKS BEING LAID OUT (2026-08-20, found by porting the builder onto
 * this frame — not by a law, which is the finding worth keeping).
 *
 * Every law above reads `display` on a pane holding a TEXT NODE, and a pane holding a text
 * node is the one composition where the hide has no opponent. The recommended anatomy — a
 * `ShellScroll` in the pane — has two, both at (0,2,0) and both landing later in the cascade:
 * this file's own column rule, and surfaces.css's `:has(> .kui-scroll-area:only-child)`. So
 * the whole hiding mechanism was dead on the shape the JSDoc tells people to write, with 46
 * laws green: a closed pane stayed on screen at every width, and a sidebar rested OPEN on a
 * phone.
 *
 * This is the degenerate-fixture lesson (2026-08-20) on the other side of the repo: the laws
 * asserted the right thing about the wrong input. So these repeat all four hide conditions on
 * the input where a right implementation and a wrong one give DIFFERENT answers — and on both
 * scroller arrangements, because the only-child arm and the sibling arm are beaten by two
 * different rules and a law over one says nothing about the other.
 *
 * Falsified: with `.kui-surface` taken back off the four hide selectors, FIVE of the eight
 * fail and every law above still passes. The three that survive are named rather than
 * trimmed, because which ones they are is the finding: both explicit-overlay cases (that arm
 * already carried two attributes, so it was the one hide never out-ranked), and the narrow
 * window with the scroller as a SIBLING — there the only opponent is this file's own column
 * rule, which the media block already beat on source order. Keeping them is what makes the
 * pair of arrangements a real sweep instead of a claim about the harder one.
 */
describe("a pane that holds a scroller still hides (§27)", () => {
  /** The pane's content in the two arrangements the shared rules distinguish. */
  const scroller = (arrangement: "only" | "sibling") => (
    <>
      {arrangement === "sibling" ? <Box p="3">pinned</Box> : null}
      <ShellScroll>
        <Box p="3">rows</Box>
      </ShellScroll>
    </>
  );

  const frame = (arrangement: "only" | "sibling", props: Parameters<typeof fixture>[0] = {}) =>
    mounted(
      <Shell style={{ height: 600 }}>
        <ShellHeader>
          <ShellTrigger target="sidebar">menu</ShellTrigger>
        </ShellHeader>
        <ShellSidebar aria-label="Primary" {...props.sidebar}>
          {scroller(arrangement)}
        </ShellSidebar>
        <ShellContent>content</ShellContent>
        <ShellInspector {...props.inspector}>{scroller(arrangement)}</ShellInspector>
        <ShellBottom {...props.bottom}>{scroller(arrangement)}</ShellBottom>
      </Shell>,
      { theme: {} },
    );

  for (const arrangement of ["only", "sibling"] as const) {
    describe(`the scroller is the pane's ${arrangement === "only" ? "only child" : "second child"}`, () => {
      it("an explicitly closed pane is gone", () => {
        const shell = frame(arrangement, { sidebar: { defaultOpen: false } });
        expect(computed(within(shell, ".kui-shell-sidebar"), "display")).toBe("none");
      });

      it("an untouched inspector and bottom rest closed", () => {
        const shell = frame(arrangement);
        expect(computed(within(shell, ".kui-shell-inspector"), "display")).toBe("none");
        expect(computed(within(shell, ".kui-shell-bottom"), "display")).toBe("none");
      });

      it("an untouched explicit-overlay pane rests closed", () => {
        const shell = frame(arrangement, { sidebar: { presentation: "overlay" } });
        expect(computed(within(shell, ".kui-shell-sidebar"), "display")).toBe("none");
      });

      it("an untouched sidebar rests closed on a narrow window — the phone default", async () => {
        const shell = frame(arrangement);
        expect(computed(within(shell, ".kui-shell-sidebar"), "display")).not.toBe("none");
        await narrow();
        expect(computed(within(shell, ".kui-shell-sidebar"), "display")).toBe("none");
      });
    });
  }
});

/**
 * ── THE PINNED STACK BREATHES AT THE PANE'S RHYTHM (§27, 2026-08-26) ──────────────────────
 * A pane holding a scroller and pinned siblings is a flex column, and until this change the
 * column had no gap: a sidebar's wordmark sat flush on the first nav row (found by Kushagra
 * in the docs chrome, the pattern's first real consumer). The gap is `--kui-sf-p` — the air
 * a pane gives its walls is the air between its regions, one currency, no new number.
 *
 * The negative control is the minimal composition: a scroller that is the pane's FIRST child
 * bleeds that block edge, so it has no neighbour above and the gap has nothing to separate —
 * a pane that IS a list must render exactly as it did before the declaration existed.
 */
describe("pinned siblings and the scroller are separated by the pane's own padding (§27)", () => {
  const app = (pinned: boolean) =>
    mounted(
      <Shell style={{ height: 600, width: 1200 }}>
        <ShellHeader>h</ShellHeader>
        <ShellSidebar aria-label="Primary">
          {pinned ? <Box data-testid="head">pinned head</Box> : null}
          <ShellScroll>
            <Box p="3">rows</Box>
          </ShellScroll>
          {pinned ? <Box data-testid="foot">pinned foot</Box> : null}
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );

  // Falsified: with the `gap` declaration removed from the pane column rule, both distances
  // measure 0 and the first two assertions fail.
  it("a pinned block and the scroller sit one safe-area apart, both sides", () => {
    const shell = app(true);
    const pane = within(shell, ".kui-shell-sidebar");
    const want = parseFloat(tokenOn(pane, "--kui-sf-p"));
    expect(want, "the pane states no padding").toBeGreaterThan(0);
    const head = within(pane, "[data-testid='head']").getBoundingClientRect();
    const foot = within(pane, "[data-testid='foot']").getBoundingClientRect();
    const scroll = within(pane, ".kui-shell-scroll").getBoundingClientRect();
    expect(scroll.top - head.bottom, "above the scroller").toBeCloseTo(want, 1);
    expect(foot.top - scroll.bottom, "below the scroller").toBeCloseTo(want, 1);
  });

  it("the minimal composition is untouched: a lone scroller still bleeds to the walls", () => {
    const shell = app(false);
    const pane = within(shell, ".kui-shell-sidebar");
    const paneRect = pane.getBoundingClientRect();
    const scroll = within(pane, ".kui-shell-scroll").getBoundingClientRect();
    // The bleed reaches the border box's inside edge; a gap wrongly applied to a lone child
    // could not move it (gap needs two items), so what this guards is the bleed surviving
    // the column gaining a gap — the two declarations sit on one rule now.
    expect(scroll.top - paneRect.top, "top").toBeCloseTo(pane.clientTop, 1);
    expect(paneRect.bottom - scroll.bottom, "bottom").toBeCloseTo(pane.clientTop, 1);
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
/**
 * ADDED 2026-08-21, both from the builder's port — one gap it reported and one behaviour it
 * was leaning on with nothing to say it was allowed to.
 */
/**
 * ── A PANE IS A SURFACE, AND IT PADS (§27, §10, 2026-08-21) ────────────────────────────────
 * Kushagra: "all shell panes must have padding all around… consider it as a safe area". Every
 * pane said `padding: 0` from the day it shipped and the frame had no air anywhere.
 */
describe("a pane pads like any other surface (§27)", () => {
  const PANES = [
    ".kui-shell-header",
    ".kui-shell-rail",
    ".kui-shell-sidebar",
    ".kui-shell-content",
    ".kui-shell-inspector",
    ".kui-shell-bottom",
  ] as const;

  const app = (size: Size) =>
    mounted(
      <Shell size={size} style={{ height: 600, width: 1200 }}>
        <ShellHeader>h</ShellHeader>
        <ShellRail aria-label="Sections">
          <ShellRailItem aria-label="Files" />
        </ShellRail>
        <ShellSidebar aria-label="Primary">s</ShellSidebar>
        <ShellContent>c</ShellContent>
        <ShellInspector defaultOpen>i</ShellInspector>
        <ShellBottom defaultOpen>b</ShellBottom>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );

  // Falsified: with `padding: 0` restored on `.kui-shell-pane`, every pane measures 0 and
  // the first assertion fails six times over; with the join's old `--kui-sf-p: 0` stand-down
  // put back, the hook and the paint disagree and the second fails.
  it("EVERY pane pads on all four sides, off the surface ladder", () => {
    const shell = app("2");
    for (const sel of PANES) {
      const pane = within(shell, sel);
      const want = tokenOn(pane, "--surface-p-2");
      expect(parseFloat(want), `${sel}: no ladder value`).toBeGreaterThan(0);
      for (const side of ["top", "right", "bottom", "left"] as const) {
        expect(computed(pane, `padding-${side}`), `${sel} ${side}`).toBe(want);
      }
      // And the HOOK agrees with the paint, which is what every reader of it depends on —
      // the bleed, the scroller, the nav expander. A pane that pads while claiming not to is
      // the 2026-08-20 defect in the other direction.
      expect(tokenOn(pane, "--kui-sf-p"), `${sel}: the hook contradicts the paint`).toBe(want);
    }
  });

  // Falsified: with the `data-size` stamp removed from the header, the content pane or the
  // bottom pane, that pane holds one value across every index and the set collapses.
  it("and the padding answers the INDEX, on every pane", () => {
    for (const sel of PANES) {
      const seen = new Set<string>();
      for (const size of ["1", "2", "3", "4"] as const) {
        const shell = app(size);
        const pane = within(shell, sel);
        expect(pane.dataset.size, `${sel} at ${size}: the index never reached the pane`).toBe(size);
        expect(computed(pane, "padding-top"), `${sel} at ${size}`).toBe(
          tokenOn(pane, `--surface-p-${size}`),
        );
        seen.add(computed(pane, "padding-top"));
        shell.remove();
      }
      expect(seen.size, `${sel}: the padding is the same at every index`).toBe(4);
    }
  });
});

/**
 * ── AND A CHILD MAY REACH THE PANE'S WALL (§3, §27, 2026-08-21) ────────────────────────────
 * The other half of the padding decision, and the half that made it safe to take. `m="bleed"`
 * is the picture-in-a-card mechanism (§3): it resolves to the negative of `--kui-sf-p`, the
 * surface padding hook, which inherits deliberately so the NEAREST surface wins. A shell pane
 * is a surface and declares that hook, so a canvas in the content pane or a tree row in the
 * sidebar reaches the edge without the pane having to give up its safe area for everyone.
 *
 * It was claimed in four places — the stylesheet, DECISIONS §27, the component reference and
 * the state notes — and tested in none, which is the claimed-versus-actual shape this repo
 * has paid for repeatedly. Measured before writing this: it works, and the law is owed anyway.
 */
describe("a child may bleed to a pane's wall (§3, §27)", () => {
  // THE FIXTURE IS THE LAW. A bleeding child alone proves nothing: with the pane's padding
  // gone, `bleed` resolves to zero and the child reaches the wall for the wrong reason —
  // passing with the mechanism deleted. So a PLAIN sibling is measured beside it, and the
  // law is the difference between them.
  //
  // Falsified: with the pane's padding restored to 0, the two children measure identically
  // and the "one is inset" arm fails; with the bleed margin re-pointed at a literal, the
  // bleeding child stops short of the wall.
  it("the bleeding child reaches it and its plain sibling does not", () => {
    const shell = mounted(
      <Shell size="2" style={{ height: 400, width: 900 }}>
        <ShellSidebar aria-label="Primary">
          <Box data-testid="plain" style={{ height: 20 }} />
          <Box m="bleed" data-testid="bled" style={{ height: 20 }} />
        </ShellSidebar>
        <ShellContent>
          <Box data-testid="c-plain" style={{ height: 20 }} />
          <Box m="bleed" data-testid="c-bled" style={{ height: 20 }} />
        </ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    for (const [sel, a, b] of [
      [".kui-shell-sidebar", "plain", "bled"],
      [".kui-shell-content", "c-plain", "c-bled"],
    ] as const) {
      const pane = within(shell, sel);
      const pad = parseFloat(tokenOn(pane, "--kui-sf-p"));
      expect(pad, `${sel}: no padding, so this fixture cannot tell the two apart`).toBeGreaterThan(0);

      // The padding box, read off the browser: which sides of a flush pane carry a seam is a
      // fact about its neighbours, not something a law should restate.
      const wall = pane.getBoundingClientRect().left + pane.clientLeft;
      const plain = within(shell, `[data-testid="${a}"]`).getBoundingClientRect();
      const bled = within(shell, `[data-testid="${b}"]`).getBoundingClientRect();

      expect(plain.left - wall, `${sel}: a plain child is not inside the safe area`).toBeCloseTo(pad, 0);
      expect(bled.left - wall, `${sel}: the bleeding child stopped inside the padding`).toBeCloseTo(0, 0);
      expect(bled.width, `${sel}: the bleeding child is no wider than a plain one`).toBeCloseTo(
        pane.clientWidth,
        0,
      );
    }
  });

  // The pane's own index is what it bleeds past, not some ancestor's — the hook inherits, so
  // a pane that failed to declare its own would silently hand its children the value of
  // whatever surface the shell was composed inside. Falsified: delete the content pane's
  // `data-size` stamp and it bleeds by the size-2 rest at every index.
  it("it bleeds by the PANE's padding, at whatever index the pane was given", () => {
    for (const size of ["1", "3", "4"] as const) {
      const shell = mounted(
        <Shell size="2" style={{ height: 400, width: 900 }}>
          <ShellContent size={size}>
            <Box m="bleed" data-testid="bled" style={{ height: 20 }} />
          </ShellContent>
        </Shell>,
        { theme: {}, select: ".kui-shell" },
      );
      const pane = within(shell, ".kui-shell-content");
      expect(computed(within(shell, '[data-testid="bled"]'), "margin-left"), size).toBe(
        `-${tokenOn(pane, `--surface-p-${size}`)}`,
      );
      shell.remove();
    }
  });
});

/**
 * ── A HEADER STATES ITS HEIGHT (§27, 2026-08-21) ───────────────────────────────────────────
 * Before this it was as tall as whatever the app put in it: apps/docs held size-1 buttons and
 * the whole app frame came out 28px, controls flush against the top edge.
 */
describe("a header's box is a control row inside the pane's padding (§27)", () => {
  // THE FIXTURE IS THE LAW. A size-2 button in a size-2 header cannot tell a stated height
  // from a derived one, because the two agree — so the header is priced at 2 and given a
  // size-1 button, which is the case the defect was measured on.
  //
  // Falsified three ways: delete `min-block-size` and the header measures the button; put
  // `box-sizing` back to border-box and the stated row stops binding, so it measures the
  // button again; delete `align-content` and the button rests on the top edge.
  it("a shorter control centres in the row rather than defining it", () => {
    const shell = mounted(
      <Shell size="2" style={{ height: 400 }}>
        <ShellHeader>
          <Button size="1" data-testid="short">
            file
          </Button>
        </ShellHeader>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const header = within(shell, ".kui-shell-header");
    const button = within(shell, '[data-testid="short"]');
    const pad = parseFloat(tokenOn(header, "--kui-sf-p"));
    const row = parseFloat(tokenOn(header, "--control-height-2"));

    // Without this the fixture proves nothing: the two boxes have to disagree.
    expect(button.getBoundingClientRect().height).toBeLessThan(row);

    // The row is the CONTENT box; the padding and the seam sit outside it.
    expect(header.clientHeight, "the header is not its index's row").toBeCloseTo(row + 2 * pad, 0);

    // And the short control is centred in it, not resting on the top edge.
    const box = header.getBoundingClientRect();
    const mark = button.getBoundingClientRect();
    const above = mark.top - (box.top + header.clientTop);
    const below = box.top + header.clientTop + header.clientHeight - mark.bottom;
    expect(above, "the control rests on the top edge").toBeCloseTo(below, 0);
    expect(above).toBeGreaterThan(pad);
  });

  // Falsified: swap `min-block-size` for `block-size` and the header stays at its row while
  // clipping the taller control — a cap where the design says floor.
  it("the row is a FLOOR: something taller grows the header", () => {
    const shell = mounted(
      <Shell size="1" style={{ height: 400 }}>
        <ShellHeader>
          <Button size="4" data-testid="tall">
            file
          </Button>
        </ShellHeader>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const header = within(shell, ".kui-shell-header");
    const tall = within(shell, '[data-testid="tall"]').getBoundingClientRect().height;
    const pad = parseFloat(tokenOn(header, "--kui-sf-p"));
    expect(tall).toBeGreaterThan(parseFloat(tokenOn(header, "--control-height-1")));
    expect(header.clientHeight).toBeCloseTo(tall + 2 * pad, 0);
  });

  // The construction the two derivations buy: at one index a header is as tall as the rail
  // is wide, so the app frame's corner is square. Falsified by re-pointing either extent at
  // a neighbouring index.
  it("a header is as TALL as the rail at that index is WIDE", () => {
    for (const size of ["1", "2", "3", "4"] as const) {
      const shell = mounted(
        <Shell size={size} style={{ height: 600, width: 1200 }}>
          <ShellHeader>h</ShellHeader>
          <ShellRail aria-label="Sections">
            <ShellRailItem aria-label="Files" />
          </ShellRail>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: {}, select: ".kui-shell" },
      );
      expect(
        within(shell, ".kui-shell-header").clientHeight,
        `size ${size}: the frame's corner is not square`,
      ).toBeCloseTo(within(shell, ".kui-shell-rail").clientWidth, 0);
      shell.remove();
    }
  });
});

describe("the app states its size once, and control may be handed back (§27)", () => {
  // Falsified: with the root's provider removed, the sidebar's row measures the size-2 cell
  // against a root that said `1`.
  it("a pane takes the app's index unless it states its own, and the ROWS follow", () => {
    const shell = mounted(
      <Shell size="1" style={{ height: 400 }}>
        <ShellSidebar aria-label="Primary">
          <ShellNavItem data-testid="inherited">files</ShellNavItem>
        </ShellSidebar>
        <ShellInspector size="3" defaultOpen>
          <ShellNavItem data-testid="stated">details</ShellNavItem>
        </ShellInspector>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    expect(within(shell, ".kui-shell-sidebar").dataset.size, "inherited from the root").toBe("1");
    expect(within(shell, ".kui-shell-inspector").dataset.size, "stated on the pane").toBe("3");

    // And the index is not decoration: the row it prices is a different height in each pane,
    // read off the RENDERED box rather than off the stamp that asked for it.
    const px = (el: HTMLElement) => `${el.getBoundingClientRect().height}px`;
    expect(px(within(shell, '[data-testid="inherited"]'))).toBe(tokenOn(shell, "--control-height-1"));
    expect(px(within(shell, '[data-testid="stated"]'))).toBe(tokenOn(shell, "--control-height-3"));
  });

  // Falsified: with usePane's `controlled` branch made unconditional (`inner` written on
  // every controlled render), the pane comes back CLOSED at the end instead of open — the
  // uncontrolled state having been overwritten while the pin was on.
  it("`open` may be passed conditionally: control comes back where the user left it", async () => {
    function App() {
      const [pinned, setPinned] = React.useState(false);
      return (
        <Shell style={{ height: 400 }}>
          <ShellHeader>
            <ShellTrigger target="sidebar">nav</ShellTrigger>
            <button data-testid="pin" onClick={() => setPinned((p) => !p)}>
              pin
            </button>
          </ShellHeader>
          <ShellSidebar aria-label="Primary" {...(pinned ? { open: false } : {})}>
            <ShellScroll>rows</ShellScroll>
          </ShellSidebar>
          <ShellContent>c</ShellContent>
        </Shell>
      );
    }
    const shell = mounted(<App />, { theme: {}, select: ".kui-shell" });
    const sidebar = within(shell, ".kui-shell-sidebar");
    const trigger = within(shell, ".kui-shell-header button");
    const pin = within(shell, '[data-testid="pin"]');

    // The user closes it and opens it again, so the uncontrolled state is an explicit `open`
    // rather than the `auto` it mounted with — the distinction the law needs, since `auto`
    // already resolves open at this width and could not tell a restored state from a reset.
    await userEvent.click(trigger);
    await expect.poll(() => sidebar.dataset.state).toBe("closed");
    await userEvent.click(trigger);
    await expect.poll(() => sidebar.dataset.state).toBe("open");
    // …the pin goes on and forces it closed…
    await userEvent.click(pin);
    await expect.poll(() => sidebar.dataset.state).toBe("closed");
    // …and when the pin goes, the pane is where the USER left it, not where the pin was.
    await userEvent.click(pin);
    await expect.poll(() => sidebar.dataset.state).toBe("open");
  });
});

/**
 * ADDED 2026-08-21. `flush` is the app's statement about the FRAME, and a pane sitting over
 * the content is not in the frame while it does so — so it takes the surface identity back,
 * whatever the app asked for. Before this, a drawer on a phone was a square, borderless slab
 * with the app having said nothing at all: `[data-flush]` was still stamped and the frame
 * dress still applied (measured, corner 0px and border 0px against 40px and 1px on a pane the
 * app had pulled off the frame itself).
 *
 * Both arms are walked because the treatment is written twice — the explicit
 * `presentation="overlay"` at any width, and `auto` resolved by the narrow media block, which
 * is the path every phone takes and the half the 2026-08-16 width-cap repair forgot.
 *
 * The corner is read as an AGREEMENT rather than against a number: the drawer's rule restates
 * surfaces.css's own expression, and what has to stay true is that it lands where a pane the
 * app pulled off the frame lands, at the same size.
 */
/**
 * ADDED 2026-08-21 (Kushagra: "what is not so trivial is separation between shell panes when
 * they are flush… we have used hairline for exactly this"). The per-side widths were always
 * right — each pane draws only its INNER edge, so two neighbours can never double one — and
 * the pigment went missing when the pane stopped being a plane: `--surface-edge` rests at a
 * live `transparent` in the elevated world because there a pane's boundary IS its cast, so
 * with the cast gone the seam measured 1px of nothing and only appeared under `depth="flat"`.
 *
 * These read the PAINTED colour in both worlds, and pin it to the value a Separator resolves
 * — the system's own answer for a rule between regions, the same pinning Tabs' bar carries.
 *
 * Falsified (re-run 2026-08-26): with `border-color: var(--color-border)` removed from
 * `.kui-shell-pane[data-flush]` the elevated half of the first law reads
 * `elevated .kui-shell-header bottom colour: expected 'rgba(0, 0, 0, 0)' to be 'color(...)'`
 * in both appearances, while the flat half still passes — exactly the shape that let this ship.
 *
 * (The declaration was named here as `--kui-border-color` until 2026-08-26. There is no such
 * line in shell.css and there cannot be: a component sheet may not so much as mention the
 * painted name, which is why the flush rule sets the PROPERTY — the rule's own comment argues
 * it. A falsification record naming a line that does not exist cannot be re-run, and an
 * un-re-runnable record is the same as none.)
 */
describe("a flush seam is a hairline, and exactly one pane owns each (§7, §27)", () => {
  const frame = (depth: (typeof DEPTHS)[number], appearance: (typeof APPEARANCES)[number]) =>
    mounted(
      <Shell style={{ height: 300 }}>
        <ShellHeader>h</ShellHeader>
        <ShellRail aria-label="Sections">r</ShellRail>
        <ShellSidebar aria-label="Primary">s</ShellSidebar>
        <ShellContent>c</ShellContent>
        <ShellInspector defaultOpen>i</ShellInspector>
      </Shell>,
      { theme: { appearance, depth }, select: ".kui-shell" },
    );

  for (const appearance of APPEARANCES) {
    it(`the seam resolves a Separator's own colour, in BOTH worlds — ${appearance}`, () => {
      for (const depth of DEPTHS) {
        const shell = frame(depth, appearance);
        const rule = computed(
          mounted(<Separator />, { theme: { appearance, depth } }),
          "background-color",
        );
        for (const [sel, side] of [
          [".kui-shell-header", "bottom"],
          [".kui-shell-rail", "right"],
          [".kui-shell-sidebar", "right"],
          [".kui-shell-inspector", "left"],
        ] as const) {
          const el = within(shell, sel);
          expect(computed(el, `border-${side}-width`), `${depth} ${sel} ${side} width`).toBe("1px");
          expect(computed(el, `border-${side}-color`), `${depth} ${sel} ${side} colour`).toBe(rule);
        }
        shell.remove();
      }
    });
  }

  // Falsified: giving the content pane an inline-start edge fails this at the sidebar seam —
  // two panes drawing one boundary is the doubling the inner-edge rule exists to prevent.
  it("exactly one pane draws each boundary — the content draws none at all", () => {
    const shell = frame("elevated", "light");
    const content = within(shell, ".kui-shell-content");
    for (const side of ["top", "right", "bottom", "left"] as const) {
      expect(computed(content, `border-${side}-width`), `content ${side}`).toBe("0px");
    }
    // …and the two boundaries Kushagra named are each owned once: rail|sidebar by the rail's
    // inner edge, sidebar|content by the sidebar's.
    expect(computed(within(shell, ".kui-shell-rail"), "border-left-width"), "rail outer").toBe("0px");
    expect(computed(within(shell, ".kui-shell-sidebar"), "border-left-width"), "sidebar outer").toBe(
      "0px",
    );
  });
});

describe("a drawer is not part of the frame, whatever the app asked (§27)", () => {
  const offFrame = (size: Size) =>
    mounted(
      <Shell size={size} style={{ height: 400 }}>
        <ShellSidebar aria-label="Primary" flush={false} defaultOpen>
          nav
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );

  /**
   * EVERYTHING A PLANE DOES, not just its fill (widened 2026-08-21, second pass). The first
   * spelling read the fill, the corner and the edge — and a flush pane went on catching light
   * and casting a shadow with all three laws green, which is what a person actually saw. The
   * cast is read as a boolean rather than a value because the drawer sits over a scrim and
   * only has to HAVE one; the light is read whole, because it is the restated expression.
   */
  const dress = (el: HTMLElement) => ({
    corner: computed(el, "border-top-left-radius"),
    edge: computed(el, "border-left-width"),
    painted: computed(el, "background-color"),
    edgeColor: computed(el, "border-left-color"),
    light: computed(el, "background-image"),
    casts: computed(el, "box-shadow") !== "none" && !/^rgba\(0, 0, 0, 0\) 0px 0px 0px 0px$/.test(computed(el, "box-shadow")),
  });

  // Falsified: with the restore dropped from the explicit arms, corner reads 0px and the
  // pane paints rgba(0, 0, 0, 0) — a see-through, square drawer over the content.
  it("an EXPLICIT overlay pane wears the surface, at a roomy window and at every size", () => {
    for (const size of ["1", "2", "3", "4"] as const) {
      const shell = mounted(
        <Shell size={size} style={{ height: 400 }}>
          <ShellSidebar aria-label="Primary" presentation="overlay" defaultOpen>
            nav
          </ShellSidebar>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: {}, select: ".kui-shell" },
      );
      expect(shell.querySelector(".kui-shell-sidebar")!.hasAttribute("data-flush"), size).toBe(true);
      expect(dress(within(shell, ".kui-shell-sidebar")), `size ${size}`).toEqual(
        dress(within(offFrame(size), ".kui-shell-sidebar")),
      );
    }
  });

  // Falsified: with the restore dropped from the narrow media block ONLY, this fails and the
  // law above still passes — which is the half-applied shape the agreement rule exists for.
  it("a drawer on a phone wears it too — the resolved arm, not just the explicit one", async () => {
    await narrow();
    const shell = mountShell();
    await userEvent.click(within(shell, ".kui-shell-header button"));
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => sidebar.dataset.state).toBe("open");
    expect(sidebar.dataset.presentation, "resolved by CSS, not restamped").toBe("auto");
    expect(sidebar.hasAttribute("data-flush"), "the app's statement is untouched").toBe(true);

    const off = within(offFrame("2"), ".kui-shell-sidebar");
    expect(dress(sidebar)).toEqual(dress(off));
    // And the thing a person actually meets: you cannot read the page through the menu.
    expect(computed(sidebar, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
  });
});

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
    // AND THE SCRIM IS UP (added 2026-08-26, audit). Containment and the scrim were asking
    // two different questions of the same shape — the pass takes "the root child CONTAINING
    // each live overlay" while both scrim rules asked a DIRECT-CHILD `:has()`. So this exact
    // fixture got full modal containment (every other root child inert) with no scrim drawn:
    // no click-to-dismiss, no visible modality, and on a phone no Escape key either. The bad
    // half of both mechanisms at once. Falsified by deleting the wrapped arm from the two
    // scrim rules in shell.css, which reads `expected "none" to be "block"`.
    expect(
      computed(within(shell, ".kui-shell-scrim"), "display"),
      "a wrapped drawer contained the whole shell and drew no way out",
    ).toBe("block");
  });

  it("a NESTED shell's drawer does not raise the OUTER frame's scrim", async () => {
    // The wrapped arm's guard, measured. `:has()` cannot ask "the nearest .kui-shell ancestor
    // of this pane is me", so a descendant question also matches a Shell composed INSIDE this
    // one — and the outer scrim would then grey out and swallow a drawer it neither owns nor
    // contains (the outer root's containment pass reads its OWN registry, so it holds nothing
    // here). The arm stands down where a nested shell exists, which is exactly the behaviour
    // before it and never worse.
    //
    // Falsified by dropping `:not(:has(.kui-shell))` from the wrapped arm: the outer scrim
    // computes `block` and this reads `expected "block" to be "none"`.
    await narrow();
    const outer = mounted(
      <Shell style={{ height: 600 }}>
        <ShellHeader>h</ShellHeader>
        <ShellContent>
          <Shell style={{ height: 300 }} data-inner>
            <ShellSidebar defaultOpen aria-label="Inner">inner</ShellSidebar>
            <ShellContent>c</ShellContent>
          </Shell>
        </ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const inner = within(outer, "[data-inner]");
    // The premise: the inner drawer really is overlaying, or nothing here is being tested.
    await expect.poll(() => computed(within(inner, ".kui-shell-sidebar"), "position")).toBe(
      "absolute",
    );
    expect(
      computed(within(inner, ".kui-shell-scrim"), "display"),
      "the inner frame drew no scrim for its own drawer",
    ).toBe("block");
    expect(
      computed(outer.querySelector(":scope > .kui-shell-scrim")!, "display"),
      "the outer frame raised a scrim over a drawer it does not contain",
    ).toBe("none");
  });

  it("a re-render while a pane overlays does NOT haul focus back into it", async () => {
    /**
     * ADDED 2026-08-26 (audit). The containment pass runs on every Shell render — deliberately,
     * so a child mounted behind the scrim is contained — and its last statement asked one
     * question per pass: "does live[0] hold focus?" That is a question about a MOMENT written
     * as a question about a state, so every ordinary re-render (a keystroke in a form, a
     * hovered item with state, a route transition) answered `no` and pulled focus back.
     *
     * Two ordinary shapes it made unreachable: a SECOND live overlay could never hold focus,
     * and any portalled layer opened from inside a pane — a Menu, a Select, a Dialog — lands
     * at body level, outside every pane, and lost its focus to the next render of anything.
     *
     * The subject here is that portalled position, modelled with a body-level button, because
     * that is exactly the DOM place a popup's focus sits. The premise is POSITIVE and not a
     * sleep: the re-render mounts a new root child, and the pass inerting it is proof the pass
     * ran — the inert loop and the focus decision are the same synchronous effect, so once the
     * child is inert the decision has already been made.
     *
     * Falsified: restore `if (!first.contains(document.activeElement)) first.focus(...)` and
     * this reads `expected <nav class="kui-surface kui-shell-pane…"> to be <button>`.
     */
    await narrow();
    let add!: () => void;
    function App() {
      const [extra, setExtra] = React.useState(false);
      add = () => setExtra(true);
      return (
        <Shell style={{ height: 600 }}>
          <ShellHeader>h</ShellHeader>
          <ShellSidebar defaultOpen aria-label="Primary">
            s
          </ShellSidebar>
          <ShellContent>c</ShellContent>
          {extra ? <div data-late>late</div> : null}
        </Shell>
      );
    }
    const shell = mounted(<App />, { theme: {}, select: ".kui-shell" });
    await expect.poll(() => within(shell, ".kui-shell-content").inert).toBe(true);
    const outside = document.createElement("button");
    outside.type = "button";
    outside.textContent = "in a portalled layer";
    document.body.append(outside);
    try {
      outside.focus();
      expect(document.activeElement, "the fixture never took focus").toBe(outside);
      add();
      await expect.poll(() => shell.querySelector("[data-late]")?.hasAttribute("inert")).toBe(true);
      expect(
        document.activeElement,
        "an ordinary re-render hauled focus out of the layer above the pane",
      ).toBe(outside);
    } finally {
      outside.remove();
    }
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

  it("a NON-FLUSH drawer's own margin does not eat the strip the cap just bought", async () => {
    /**
     * ADDED 2026-08-26 (audit). The cap bounds a drawer's BORDER box against the frame; a
     * non-flush pane then pays `--shell-gap` of margin OUTSIDE that box, and nothing in the six
     * overlay arms restated or zeroed it. So the strip the cap exists to guarantee came out
     * `--touch-target-min` MINUS the margin — measured 36px against a 44px floor at 320px —
     * which is below the floor this repo enforces on every other target in the library.
     *
     * MIXED POSTURE is the fixture and it is load-bearing: with EVERY pane non-flush the frame
     * spends half the gap as its own padding and the margin is the other half, so the two
     * cancel and the strip measures exactly the floor — the all-cards regime cannot show this
     * defect at all. The premise below asserts the drawer really pays outer spacing, because a
     * fixture where it pays none is a fixture where the fix is invisible.
     *
     * Falsified: with the caps back at `calc(100% - var(--touch-target-min))` this reads
     * `expected 36 to be greater than or equal to 43.5`.
     */
    await page.viewport(320, 700);
    const shell = mounted(
      <Shell style={{ height: 600 }}>
        <ShellHeader>h</ShellHeader>
        <ShellSidebar aria-label="Primary" defaultOpen flush={false}>
          nav
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => computed(sidebar, "position")).toBe("absolute");
    const floor = parseFloat(tokenOn(shell, "--touch-target-min"));
    expect(floor).toBeGreaterThan(0);
    expect(
      parseFloat(computed(sidebar, "margin-inline-start")),
      "the drawer pays no outer spacing, so this fixture cannot show the defect",
    ).toBeGreaterThan(0);
    const root = shell.getBoundingClientRect();
    const pane = sidebar.getBoundingClientRect();
    // From the drawer's OUTER edge to the frame's, which is where the finger actually goes.
    const strip = root.right - pane.right;
    expect(strip, "the drawer's margin ate the dismissal strip").toBeGreaterThanOrEqual(floor - 0.5);
    // Capped, not collapsed — a bound with one end is half a bound (2026-08-20).
    expect(sidebar.clientWidth, "the drawer collapsed instead of being capped").toBeGreaterThan(
      floor,
    );
    // And the strip is really the scrim, not merely empty space.
    const hit = document.elementFromPoint(root.right - strip / 2, root.top + root.height / 2);
    expect(hit?.classList.contains("kui-shell-scrim"), "the strip is not the scrim").toBe(true);
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

  // The corner is read as an AGREEMENT with a real Card at the same index, not against a
  // token: the squircle multiplier sits between `--radius-surface-N` and the painted corner,
  // which is the instrument bug this repo has already paid for once (38.712px against 40).
  // Walked at every index because the pane's corner answers the index since 2026-08-21 —
  // it was pinned to the size-3 step, so the name of this law was true and its value was one.
  //
  // Falsified: restore `border-radius: var(--radius-surface-3)` on `.kui-shell-pane` and
  // three of the four cells disagree with their Card; delete the pane's `data-size` and the
  // set of corners collapses to one.
  it("a non-flush pane is a card: the full edge and the surface corner come back", () => {
    const seen = new Set<string>();
    for (const size of ["1", "2", "3", "4"] as const) {
      const shell = mounted(
        <Shell size={size} style={{ height: 400, width: 900 }}>
          <ShellSidebar aria-label="Primary" flush={false}>
            s
          </ShellSidebar>
          <ShellContent flush={false}>
            <Card size={size} data-testid="peer">
              c
            </Card>
          </ShellContent>
        </Shell>,
        { theme: {}, select: ".kui-shell" },
      );
      const sidebar = within(shell, ".kui-shell-sidebar");
      const hairline = tokenOn(shell, "--border-width");
      expect(computed(sidebar, "border-inline-start-width"), size).toBe(hairline);
      expect(computed(sidebar, "border-inline-end-width"), size).toBe(hairline);
      expect(
        computed(sidebar, "border-radius"),
        `size ${size}: a pane off the frame does not wear its own index's corner`,
      ).toBe(computed(within(shell, '[data-testid="peer"]'), "border-radius"));
      seen.add(computed(sidebar, "border-radius"));
      shell.remove();
    }
    // And it really MOVES: a pinned corner agrees with a Card at exactly one index.
    expect(seen.size, "the pane wears one corner at every index").toBe(4);
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
describe("a seam needs something on the other side of it (§27, 2026-08-29)", () => {
  // Kushagra: "Say content is not flush, and the sidebar is. Then the separator looks weird,
  // no? Idea is if one is not flush, maybe it shouldn't have separator." Measured before the
  // fix: the sidebar's hairline at x=288, the content card's left edge at x=296, 8px of bare
  // page between them — and a flush pane paints no fill, so both sides of that line are page.
  //
  // The condition is the CONTENT, which falls out of the posture derivation: when the content
  // is flush every non-flush pane floats and the content grows underneath it, so every seam
  // still meets it; when the content is not flush nothing floats and every seam faces a gap.

  const seam = (el: HTMLElement, side: string) => computed(el, `border-${side}-width`);

  /** Every pane flush unless named, so each law changes exactly one thing. */
  const shellWith = (content: React.ReactElement, extra?: React.ReactNode) =>
    mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellHeader>h</ShellHeader>
        {extra}
        <ShellSidebar aria-label="Primary">s</ShellSidebar>
        {content}
        <ShellInspector defaultOpen>i</ShellInspector>
        <ShellBottom defaultOpen>b</ShellBottom>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );

  it("a flush frame draws every seam — the control, without which the rest proves nothing", () => {
    // The positive read. A law that only ever asserts 0px passes against a stylesheet that
    // draws no seams at all, which is the degenerate fixture this file has paid for twice.
    const shell = shellWith(<ShellContent>c</ShellContent>);
    expect(seam(within(shell, ".kui-shell-header"), "bottom")).toBe("1px");
    expect(seam(within(shell, ".kui-shell-sidebar"), "right")).toBe("1px");
    expect(seam(within(shell, ".kui-shell-inspector"), "left")).toBe("1px");
    expect(seam(within(shell, ".kui-shell-bottom"), "top")).toBe("1px");
  });

  it("a grounded content takes every seam facing it with it", () => {
    const shell = shellWith(<ShellContent flush={false}>c</ShellContent>);
    for (const [name, side] of [
      ["header", "bottom"],
      ["sidebar", "right"],
      ["inspector", "left"],
      ["bottom", "top"],
    ] as const) {
      expect(
        seam(within(shell, `.kui-shell-${name}`), side),
        `the ${name} drew a seam against a content that had pulled off the frame`,
      ).toBe("0px");
    }
  });

  it("...and the geometry is why: the line had a gap on both sides of it", () => {
    // The claim measured as a DISTANCE rather than as a border width, because "the seam is
    // stray" is a statement about where the neighbour is, not about whether a border exists.
    const shell = shellWith(<ShellContent flush={false}>c</ShellContent>);
    const sidebar = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    const content = within(shell, ".kui-shell-content").getBoundingClientRect();
    expect(
      content.left - sidebar.right,
      "the content is touching the sidebar, so there was never a gap to argue about",
    ).toBeGreaterThan(1);
  });

  it("a FLOATING pane keeps every seam — the content grew underneath it", () => {
    // The case the condition must not over-reach into. A non-flush sidebar over flush content
    // floats, and the content's area grows across its column, so the rail's hairline meets the
    // content rather than a gap — measured at x=65 on both.
    const shell = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellHeader>h</ShellHeader>
        <ShellRail aria-label="Sections">r</ShellRail>
        <ShellSidebar aria-label="Primary" flush={false}>
          s
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const rail = within(shell, ".kui-shell-rail");
    expect(seam(rail, "right"), "a floating neighbour took the rail's seam away").toBe("1px");
    expect(
      within(shell, ".kui-shell-content").getBoundingClientRect().left,
      "the content did not grow under the floating pane, so this proves nothing",
    ).toBeCloseTo(rail.getBoundingClientRect().right, 0);
  });

  it("rail|sidebar survives a grounded content — both panes are still in the frame", () => {
    const shell = shellWith(
      <ShellContent flush={false}>c</ShellContent>,
      <ShellRail aria-label="Sections">r</ShellRail>,
    );
    expect(
      seam(within(shell, ".kui-shell-rail"), "right"),
      "the rail lost a seam it draws against a sidebar that never left the frame",
    ).toBe("1px");
    expect(
      seam(within(shell, ".kui-shell-sidebar"), "right"),
      "the sidebar kept a seam against a content that had pulled away",
    ).toBe("0px");
  });

  it("...but not when the sidebar has pulled away too, or is absent", () => {
    // Two arrangements, one claim: the rail's seam goes when the thing across it is not a
    // welded pane. Guarded rather than assumed — the same sibling question `grid-column-start`
    // got wrong in the 2026-08-16 audit.
    const grounded = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellRail aria-label="Sections">r</ShellRail>
        <ShellSidebar aria-label="Primary" flush={false}>
          s
        </ShellSidebar>
        <ShellContent flush={false}>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    expect(
      seam(within(grounded, ".kui-shell-rail"), "right"),
      "the rail drew a seam against a sidebar that had pulled off the frame",
    ).toBe("0px");

    const noSidebar = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellRail aria-label="Sections">r</ShellRail>
        <ShellContent flush={false}>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    expect(
      seam(within(noSidebar, ".kui-shell-rail"), "right"),
      "with no sidebar the rail faces the content directly, and it has pulled away",
    ).toBe("0px");
  });

  it("A DRAWER KEEPS ALL FOUR — the overlay exception outranks the stand-down", () => {
    // The hazard this could have introduced: an overlaying pane takes the surface identity
    // back at (0,3,0), and `:has()` carries its most specific argument's weight — so a
    // stand-down written without `:where()` lands at (0,5,0) and zeroes one border of a
    // drawer sliding over a grounded content. Falsify by removing the `:where()`, not by
    // removing a `:not([data-presentation="overlay"])` guard: the first spelling had one and
    // it was decoration, which this law's own sabotage pass is what proved.
    const shell = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellSidebar aria-label="Primary" presentation="overlay" defaultOpen>
          s
        </ShellSidebar>
        <ShellContent flush={false}>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const drawer = within(shell, ".kui-shell-sidebar");
    for (const side of ["top", "right", "bottom", "left"]) {
      expect(seam(drawer, side), `the drawer lost its ${side} border to the seam stand-down`).toBe(
        "1px",
      );
    }
  });
});

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

  it("POSTURE DOES NOT BUY THE MATERIAL — a pane pulled off the frame is still solid", () => {
    // REWRITTEN 2026-08-29 (Kushagra: "all panels should support backdrop prop, we already
    // have precedence for it"). This law used to assert the opposite, because `flush={false}`
    // used to state `backdrop: true` on the argument that "something is behind it either
    // way — the content if it floats, the ground if it does not". The second half was never
    // true of a MATERIAL: a grounded pane sits on the app's ground, a flat colour, and §10's
    // selectivity is the rule that glass is expressed only where something PASSES behind.
    //
    // The FIXTURE is what makes this a law rather than a spelling: the same pane, in the same
    // shell, under the same glass theme, is read twice — once without the prop and once with
    // it. Without the second read, a theme whose glass never resolved at all would satisfy the
    // first, which is the degenerate fixture this file has already paid for twice.
    const shellOf = (backdrop?: boolean) =>
      mounted(
        <Shell style={{ height: 300 }}>
          <ShellSidebar aria-label="Primary" flush={false} {...(backdrop ? { backdrop } : {})}>
            nav
          </ShellSidebar>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: { material: "regular" }, select: ".kui-shell" },
      );
    expect(
      within(shellOf(), ".kui-shell-sidebar").dataset.material,
      "the posture volunteered a backdrop the pane does not have",
    ).toBeUndefined();
    expect(
      within(shellOf(true), ".kui-shell-sidebar").dataset.material,
      "the pane stated a backdrop and still resolved solid — the theme's glass is unreachable",
    ).toBe("regular");
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

  /**
   * THE SAFE AREA A FLOATING PANE LEAVES (§27, 2026-08-29). The underlap is deliberate — a
   * floating pane needs something to float over — and until these four lengths existed an app
   * had no way to say "this paragraph clears the sidebar, that photograph does not". Nothing
   * published the reach, so the only route was to restate the frame's own arithmetic at the
   * call site, which is the four-spellings defect the header's height already paid for.
   *
   * The law is an AGREEMENT and reads no token: a box padded by the published inset must
   * begin exactly where the floating pane's own margin box ends, which is the line the
   * content column would have started at. Restating `288 + 2 * 8` here would prove only that
   * I can copy a `calc()` from one file into another.
   *
   * The pane's outer spacing is read as its distance from the FRAME's edge, not from its
   * neighbour: two adjacent non-flush panes each pay in full and therefore double at the
   * boundary between them (§27's deferred split, recorded in shell.css), so the rail|sidebar
   * case has to take the frame-edge gap or it measures the deferred bug rather than the
   * inset.
   *
   * Falsified against the pre-fix stylesheet, where every one of these reads 0px against a
   * reach of 82–386.
   */
  const insetProbe = (content: Element, side: string) => {
    const probe = document.createElement("div");
    probe.style.position = "absolute";
    probe.style.insetInlineStart = "0";
    probe.style.insetBlockStart = "0";
    probe.style.inlineSize = `var(--kui-shell-inset-${side})`;
    probe.style.blockSize = `var(--kui-shell-inset-${side})`;
    content.appendChild(probe);
    const box = probe.getBoundingClientRect();
    probe.remove();
    return { w: box.width, h: box.height };
  };

  it("a floating SIDEBAR publishes exactly the reach it takes (§27)", () => {
    const shell = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellSidebar aria-label="Primary" flush={false}>
          s
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const frame = shell.getBoundingClientRect();
    const sidebar = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    const content = within(shell, ".kui-shell-content");
    expect(
      content.getBoundingClientRect().left,
      "the content is not underlapping, so the inset has nothing to answer for",
    ).toBeCloseTo(frame.left, 0);
    expect(insetProbe(content, "inline-start").w).toBeCloseTo(
      sidebar.right - frame.left + (sidebar.left - frame.left),
      0,
    );
  });

  it("a floating INSPECTOR and BOTTOM publish theirs, on the other two sides (§27)", () => {
    const shell = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellContent>c</ShellContent>
        <ShellInspector flush={false} defaultOpen>
          i
        </ShellInspector>
        <ShellBottom flush={false} defaultOpen>
          b
        </ShellBottom>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const frame = shell.getBoundingClientRect();
    const content = within(shell, ".kui-shell-content");
    const inspector = within(shell, ".kui-shell-inspector").getBoundingClientRect();
    const bottom = within(shell, ".kui-shell-bottom").getBoundingClientRect();
    expect(insetProbe(content, "inline-end").w).toBeCloseTo(
      frame.right - inspector.left + (frame.right - inspector.right),
      0,
    );
    expect(insetProbe(content, "block-end").h).toBeCloseTo(
      frame.bottom - bottom.top + (frame.bottom - bottom.bottom),
      0,
    );
  });

  /**
   * The RAIL and the HEADER are priced differently from the three panes above — they are one
   * control row, content-box, plus the pane's padding and its two borders — so they get their
   * own law rather than riding the sidebar's. Both indexes are walked because the row is the
   * one term that answers `size`, and a law that reads one index cannot tell a ladder from a
   * constant (the 2026-08-23 composer finding).
   */
  it("a floating RAIL and HEADER publish a row's reach, at every index (§27)", () => {
    for (const size of SIZES) {
      const shell = mounted(
        <Shell style={{ height: 600, width: 1280 }} size={size}>
          <ShellHeader flush={false}>h</ShellHeader>
          <ShellRail aria-label="Sections" flush={false}>
            r
          </ShellRail>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: {}, select: ".kui-shell" },
      );
      const frame = shell.getBoundingClientRect();
      const rail = within(shell, ".kui-shell-rail").getBoundingClientRect();
      const header = within(shell, ".kui-shell-header").getBoundingClientRect();
      const content = within(shell, ".kui-shell-content");
      expect(insetProbe(content, "inline-start").w, `rail at size ${size}`).toBeCloseTo(
        rail.right - frame.left + (rail.left - frame.left),
        0,
      );
      expect(insetProbe(content, "block-start").h, `header at size ${size}`).toBeCloseTo(
        header.bottom - frame.top + (header.top - frame.top),
        0,
      );
    }
  });

  /**
   * TWO FLOATING COLUMNS ARE ONE REACH, and this is the case a single rule gets wrong. The
   * content grows to the RAIL's line when both float, so the inset owes both tracks — the
   * sidebar's rule alone answers 304 where the real reach is 386, and the rail's alone
   * answers 82. It is stated as two mutually exclusive selectors in the stylesheet, and this
   * law is the one that fails if either is dropped.
   */
  it("rail + sidebar floating: the inset is BOTH columns, not the outer one (§27)", () => {
    const shell = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellRail aria-label="Sections" flush={false}>
          r
        </ShellRail>
        <ShellSidebar aria-label="Primary" flush={false}>
          s
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const frame = shell.getBoundingClientRect();
    const rail = within(shell, ".kui-shell-rail").getBoundingClientRect();
    const sidebar = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    const content = within(shell, ".kui-shell-content");
    const reach = insetProbe(content, "inline-start").w;
    expect(reach).toBeCloseTo(sidebar.right - frame.left + (rail.left - frame.left), 0);
    // The vacuity guard: the two columns must be far enough apart that answering only one of
    // them would be a different number, or this law passes on a stylesheet that answers one.
    expect(reach - (rail.right - frame.left + (rail.left - frame.left))).toBeGreaterThan(100);
  });

  /**
   * IT REACHES THE PLACE THE APP ACTUALLY USES IT. The region an app wants inset is under a
   * scroller and inside a page's own frame, which is why the property inherits rather than
   * being registered `inherits: false` like every other private name in this file. The reset
   * on the shell ROOT is the other half: a Shell composed inside another Shell's content must
   * not hand the outer frame's reach to its own panes, and it is the root that stops it.
   *
   * Falsified both ways: `inherits: false` reads 0px at depth, and dropping the root's reset
   * reads the outer frame's 304px inside the nested shell's sidebar.
   */
  it("the inset inherits to depth, and a nested Shell resets it (§27)", () => {
    const shell = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellHeader flush={false}>h</ShellHeader>
        <ShellSidebar aria-label="Primary" flush={false}>
          s
        </ShellSidebar>
        <ShellContent>
          <ShellScroll>
            <Box data-testid="deep">
              <Shell data-testid="nested" style={{ height: 200 }}>
                <ShellSidebar aria-label="Inner">n</ShellSidebar>
                <ShellContent>inner</ShellContent>
              </Shell>
            </Box>
          </ShellScroll>
        </ShellContent>
        <ShellInspector flush={false} defaultOpen>
          i
        </ShellInspector>
        <ShellBottom flush={false} defaultOpen>
          b
        </ShellBottom>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const deep = shell.querySelector("[data-testid='deep']")!;
    const inner = shell.querySelector("[data-testid='nested'] .kui-shell-sidebar")!;
    // ALL FOUR SIDES, and that is the law's own repair: the first spelling read only
    // `inline-start`, so three of the four resets on the shell root could be deleted with
    // the suite green — the "a law about one axis of a two-axis mechanism is half a law"
    // finding (2026-08-08), here with four.
    for (const side of ["inline-start", "inline-end", "block-start", "block-end"] as const) {
      const axis = side.startsWith("inline") ? "w" : "h";
      const outer = insetProbe(within(shell, ".kui-shell-content"), side)[axis];
      expect(outer, `the outer frame published no ${side} reach, so this proves nothing`)
        .toBeGreaterThan(60);
      expect(
        insetProbe(deep, side)[axis],
        `the ${side} reach did not survive a scroller and a Box`,
      ).toBeCloseTo(outer, 0);
      expect(
        insetProbe(inner, side)[axis],
        `a nested Shell inherited the outer frame's ${side} reach`,
      ).toBe(0);
    }
  });

  /**
   * AND THE STALE CASE WARNS, because the published length is the FRAME's extent and a pane
   * that states its own `width` is stating something only that pane can see. The guard
   * MEASURES — it compares the published length against where the floating panes actually
   * are — rather than reading the props, so it cannot go quietly wrong the day a new way to
   * change a pane's extent exists, and a flush pane standing between a floating one and the
   * content (where nothing underlaps and the inset is correctly zero) raises nothing.
   *
   * Falsified by flipping the fixture: at the token's own 288 the warning does not fire.
   */
  it("dev builds warn when a pane's own width makes the published inset stale (§27)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stale = (msg: unknown) => String(msg).includes("--kui-shell-inset-inline-start");
    try {
      render(
        <Shell style={{ height: 400, width: 900 }}>
          <ShellSidebar aria-label="Primary" flush={false} width={200}>
            s
          </ShellSidebar>
          <ShellContent>c</ShellContent>
        </Shell>,
      );
      await vi.waitFor(() => {
        expect(warn.mock.calls.some(([msg]) => stale(msg))).toBe(true);
      });

      warn.mockClear();
      render(
        <Shell style={{ height: 400, width: 900 }}>
          <ShellSidebar aria-label="Primary" flush={false}>
            s
          </ShellSidebar>
          <ShellContent>c</ShellContent>
        </Shell>,
      );
      // The quiet case needs a flush of its own, or this half asserts nothing.
      await new Promise((r) => setTimeout(r, 50));
      expect(warn.mock.calls.some(([msg]) => stale(msg))).toBe(false);
    } finally {
      warn.mockRestore();
    }
  });

  /**
   * A PANE THAT IS NOT STANDING IN THE FRAME LEAVES NO REACH, and this is why the four
   * lengths are NOT declared on the placement rules beside them. A placement is a no-op when
   * its pane is absent — the track collapses and `sidebar-start` IS `content-start` — so the
   * grid rules never needed the question asked. A LENGTH is simply wrong: a closed sidebar
   * that still published 304px would push every inset region a sidebar's width off the edge
   * of a frame with no sidebar in it.
   *
   * Three ways a floating pane stops standing in the frame, and all three are here because
   * each is a different rule: `closed` is the state, `overlay` is the presentation, and a
   * NARROW window resolves an `auto` nav column to an overlay — the last being the path every
   * phone takes, and the one this file already records being forgotten twice.
   *
   * Falsified: dropping any one of the three guards publishes 304 where 0 is measured.
   */
  it("a closed, overlaying or narrow-window pane publishes no reach (§27)", async () => {
    const closed = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellSidebar aria-label="Primary" flush={false} open={false}>
          s
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    expect(
      insetProbe(within(closed, ".kui-shell-content"), "inline-start").w,
      "a closed sidebar still claimed its column",
    ).toBe(0);

    const overlaying = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellSidebar aria-label="Primary" flush={false} presentation="overlay" defaultOpen>
          s
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    expect(
      insetProbe(within(overlaying, ".kui-shell-content"), "inline-start").w,
      "an overlaying sidebar left a reach behind it",
    ).toBe(0);
    // The vacuity guard: the same pane in the same frame, standing in flow, DOES publish —
    // otherwise the two reads above pass on a stylesheet that publishes nothing at all.
    const standing = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellSidebar aria-label="Primary" flush={false}>
          s
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    expect(insetProbe(within(standing, ".kui-shell-content"), "inline-start").w).toBeGreaterThan(
      100,
    );

    await narrow();
    const phone = mounted(
      <Shell style={{ height: 600 }}>
        <ShellSidebar aria-label="Primary" flush={false}>
          s
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    expect(
      insetProbe(within(phone, ".kui-shell-content"), "inline-start").w,
      "an auto nav column overlays on a narrow window, so it leaves no reach",
    ).toBe(0);
  });

  it("a detail pane resting SHUT publishes no reach (§27)", () => {
    // `auto` means shut for an inspector and a bottom pane, where it means open for a nav
    // column — which is why only these two exclude `auto` in the stylesheet, and why reading
    // one of the four sides would not have caught a missing arm on the other.
    const shell = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellContent>c</ShellContent>
        <ShellInspector flush={false}>i</ShellInspector>
        <ShellBottom flush={false}>b</ShellBottom>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const content = within(shell, ".kui-shell-content");
    expect(insetProbe(content, "inline-end").w).toBe(0);
    expect(insetProbe(content, "block-end").h).toBe(0);
  });

  it("nothing floating, nothing published (§27)", () => {
    const shell = mountShell();
    const content = within(shell, ".kui-shell-content");
    for (const side of ["inline-start", "inline-end", "block-start", "block-end"] as const) {
      const box = insetProbe(content, side);
      expect(Math.max(box.w, box.h), `${side} claimed a reach in an all-flush frame`).toBe(0);
    }
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

  it("a scroller reaches the pane's WALL and re-pads its own inside (§10)", () => {
    // INVERTED 2026-08-21, and the inversion is the point. This law used to assert that the
    // padding hook stood DOWN to zero, so a scroller bled to nothing — the right answer while
    // a pane claimed to have no padding, and a defect the moment it had some. Every pane pads
    // now, so the guarantee is the one Card has always given: the scroller's own box reaches
    // the pane's wall, which is what puts the scrollbar on the edge instead of floating it in
    // the padding, and its VIEWPORT pads back inside so the content still sits in the safe
    // area. Both halves, because a bleed with no re-pad is content against the wall.
    //
    // Read on a pane holding a sibling and one holding the scroller alone: the shared rule
    // makes a pane a column two different ways, and only one of them was ever exercised here.
    const shell = mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellSidebar aria-label="Primary">
          <Button>New</Button>
          <ShellScroll>
            <div style={{ height: 900 }}>tall</div>
          </ShellScroll>
        </ShellSidebar>
        <ShellContent>
          <ShellScroll>
            <div style={{ height: 900 }}>tall</div>
          </ShellScroll>
        </ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    for (const sel of [".kui-shell-sidebar", ".kui-shell-content"]) {
      const pane = within(shell, sel);
      const scroller = pane.querySelector<HTMLElement>(".kui-scroll-area")!;
      const viewport = pane.querySelector<HTMLElement>(".kui-scroll-viewport")!;
      const pad = parseFloat(tokenOn(pane, "--kui-sf-p"));
      // The fixture is only a fixture if the pane HAS padding — this law says nothing
      // otherwise, which is exactly the state it was written to replace.
      expect(pad, `${sel}: the pane has no padding to bleed past`).toBeGreaterThan(0);

      const p = pane.getBoundingClientRect();
      const b = scroller.getBoundingClientRect();
      // The PADDING box, read off the browser rather than rebuilt from the seam token: a
      // flush pane draws one border, on its inner edge only, so which sides carry one is a
      // fact about the pane's neighbours and not something a law should be restating.
      const wallStart = p.left + pane.clientLeft;
      const wallEnd = wallStart + pane.clientWidth;
      expect(b.left - wallStart, `${sel}: the scroller stopped inside the padding`).toBeCloseTo(0, 0);
      expect(wallEnd - b.right, `${sel}: the scroller stopped inside the padding`).toBeCloseTo(0, 0);
      // And never PAST it: bleeding further is the 2026-08-20 defect by the other road.
      expect(b.left, `${sel}: the scroller hangs past the start edge`).toBeGreaterThanOrEqual(p.left - 0.5);
      expect(b.right, `${sel}: the scroller hangs past the end edge`).toBeLessThanOrEqual(p.right + 0.5);

      // The other half: the content is back inside the safe area.
      expect(
        parseFloat(computed(viewport, "padding-left")),
        `${sel}: the scroller bled and never re-padded`,
      ).toBeCloseTo(pad, 0);
    }
  });

  it("a nav row stands LEVEL with a real Button, at every size", () => {
    // The segmented control's law verbatim (§26) — measured against a mounted Button rather
    // than compared as tokens, because "reads the same height" is a claim about pixels.
    // Since 2026-08-26 this is the FAMILY default rather than this member's carve-out (the
    // notch is scoped to floating panels in recipes.css), so shell.css declares no height —
    // this law is now the shell-side reader of the family guarantee, kept because a member
    // that quietly re-grew a private height would fail here first.
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

  it("rows with persistent fills get air: the nav group separates rows by the stated pick (2026-08-26)", () => {
    // The tree's own gap law one container over — the pick is shared (`--layout-space-1`),
    // the declaration is each container's. Falsified: with the gap removed from
    // `.kui-shell-nav-group`, the distance measures 0 and this fails.
    const shell = nav({ rows: 2 });
    const [first, second] = rows(shell);
    const want = parseFloat(tokenOn(shell, "--layout-space-1"));
    expect(want, "the pick resolves to nothing").toBeGreaterThan(0);
    const a = first!.getBoundingClientRect();
    const b = second!.getBoundingClientRect();
    expect(b.top - a.bottom, "adjacent nav rows touch").toBeCloseTo(want, 1);
  });

  it("current is said in INK, not in fill — and the persistent fill now OUTRANKS the transient one", async () => {
    /**
     * REWRITTEN 2026-08-23, and again 2026-08-26 — the second rewrite is the re-opening the
     * first one demanded.
     *
     * 2026-08-23 (Kushagra: *"an accent never paints a 'faded' background… render selected
     * state with neutral background + accent label"*): accent went undiluted, the medium
     * rung resolved neutral, and a current row at rest was byte-identical to any row under
     * the pointer. That collision was PINNED here with the message "re-open the decision
     * before changing this".
     *
     * 2026-08-26 IS that re-opening (Kushagra, from the tree: a selected row painted the
     * same pixels as a hovered one, and "the grey for hover feels darker" anyway). The
     * repair went the direction his eye asked: the QUIET rung's transient light became a
     * half-step — soft mixed toward transparent, §8's boundary-hover precedent, correct in
     * both modes where a lighter rung does not exist (dark's a2 is transparent) — while a
     * medium row still rests at full soft. So the ranking §10 demands now holds for free:
     * current/selected rest > plain hover, with no fourth rung minted and no darker value
     * anywhere. The INK half of the 2026-08-23 decision is untouched and still asserted.
     */
    const shell = nav({ rows: 2 });
    const [currentRow, plain] = [rows(shell)[0]!, rows(shell)[1]!];
    const currentRest = computed(currentRow, "background-color");
    const plainRest = computed(plain, "background-color");
    // FIRST: current is a state at all. Without this the law passes for a row that is simply
    // not current — its own sabotage pass caught exactly that, because "different from the
    // hover colour" is also true of transparent.
    expect(currentRest, "the current row rests unpainted").not.toBe(plainRest);
    expect(currentRest, "the current row rests transparent").not.toContain("rgba(0, 0, 0, 0)");
    // AND IT IS THE FAMILY'S ARM THAT CARRIES IT, not a copy in this member (2026-08-26
    // audit). shell.css held a local `.kui-shell-nav-item[aria-current]` restating the shared
    // declaration — (0,2,0) against the family's (0,2,0), identical value — so it decided
    // nothing and could only ever drift from what it duplicated, while making the two
    // impossible to tell apart. Deleted; this is what now holds them one. Falsified by raising
    // the member's resting stand-down to (0,2,0), which is the only way it can beat the
    // family's arm: the current row then reads `--color-text` and both halves fail.
    const bareRow = mounted(<Row current>Inbox</Row>, { theme: {} });
    expect(
      computed(currentRow, "color"),
      "a current nav row and a current Row do not resolve one colour",
    ).toBe(computed(bareRow, "color"));
    // THE CURRENT COLOUR is the signal, and it is the family's — read through the stamp, so
    // a row that lost `data-tone="accent"` and fell back to neutral fails here rather than
    // passing on a role name that resolves to whatever is in scope. (--tone-current since
    // 2026-08-26: the per-mode ink/glyph pick the icon shares.)
    expect(computed(currentRow, "color"), "the current row's label is not accent").toBe(
      colorOn(currentRow, "var(--accent-current)"),
    );
    expect(
      computed(currentRow, "color"),
      "current and plain rows read the same ink, so nothing says which is current",
    ).not.toBe(computed(plain, "color"));
    // THE RANKING, stated as a measurement: a hovered plain row paints LESS than the current
    // row's rest — visible, but visibly lighter.
    const alphaOf = (color: string): number => {
      const slash = /\/\s*([\d.]+)\s*\)/.exec(color);
      if (slash) return parseFloat(slash[1]!);
      const comma = /^rgba\((?:[^,]+,){3}\s*([\d.]+)\)/.exec(color);
      if (comma) return parseFloat(comma[1]!);
      return 1;
    };
    await userEvent.hover(plain);
    const plainHover = computed(plain, "background-color");
    expect(plainHover, "the plain row never lit").not.toBe(plainRest);
    expect(
      alphaOf(plainHover),
      `hovered (${plainHover}) must sit BELOW the current rest (${currentRest}) — the 2026-08-26 ranking`,
    ).toBeLessThan(alphaOf(currentRest));
    // And the current row still MOVES under the pointer rather than being a dead end.
    await userEvent.hover(currentRow);
    expect(
      computed(currentRow, "background-color"),
      "hovering the current row has nowhere to go",
    ).not.toBe(currentRest);
  });

  for (const appearance of APPEARANCES)
  it(`${appearance}: only the CURRENT nav icon is the accent; a resting icon keeps the label's grey`, () => {
    /**
     * REVERSED 2026-08-26 (Kushagra, with Finder held over the docs sidebar: "make resting
     * icons neutral not accent"). The 2026-08-23 rule painted every nav icon accent, always,
     * and the diff against the platform showed the cost: when every row is accent, accent
     * stops meaning "you are here" — the current row has nothing to pop against. Apple's own
     * sidebar is near-black icons with ONE vivid row.
     *
     * Both arms are load-bearing: the resting arm is exactly what the replaced rule fails,
     * and the current arm is what a rule painting NO icon would fail. BOTH appearances,
     * and dark is the one that can fail alone: --tone-current is the ink in light, so a
     * consumer quietly reverted to --tone-ink is invisible there and only dark — where the
     * pick is the glyph — can tell the role from its candidate (the sabotage that taught
     * this: the shell arm reverted to ink and the light-only law stayed green).
     */
    // Its own mount rather than the shared `nav()` fixture: the fixture's rows carry no icon,
    // and adding one there would perturb twenty geometry laws to serve this one.
    const shell = mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellSidebar aria-label="Primary">
          <ShellNavGroup label="Workspace">
            <ShellNavItem current leading={<span>▲</span>}>Inbox</ShellNavItem>
            <ShellNavItem leading={<span>▲</span>}>Drafts</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: { appearance }, select: ".kui-shell" },
    );
    const [currentRow, plain] = [...shell.querySelectorAll<HTMLElement>(".kui-shell-nav-item")];
    if (!currentRow || !plain) throw new Error("nav rows missing — the law would assert nothing");
    const icon = (row: HTMLElement) =>
      computed(within(row, '[data-slot="leading"]'), "color");
    // A resting icon IS its stood-down label — the neutral ink, not the family.
    expect(icon(plain), "a row you are not on still shouts the accent").toBe(
      computed(plain, "color"),
    );
    // The current row's icon takes the family back — at --tone-current, the per-mode
    // ink/glyph pick, and it MATCHES the label beside it (2026-08-26: "the icon color and
    // label not matching bothers me").
    expect(icon(currentRow), "the current icon is not the family's current colour").toBe(
      colorOn(currentRow, "var(--accent-current)"),
    );
    expect(icon(currentRow), "the current icon and label disagree").toBe(
      computed(currentRow, "color"),
    );
    expect(icon(currentRow), "current and resting icons agree — nothing says here").not.toBe(
      icon(plain),
    );
  });

  it("the LABEL stands back down, so a sidebar is not a column of blue words", () => {
    // The other half of stamping accent always. `.kui-row` points a label at `--tone-ink`, so
    // without shell.css's stand-down every nav row's text would be accent — which is both ugly
    // and a lie, since it would stop saying which row is current. The current row takes the
    // family back, and that IS what says "you are here" now that the fill is grey at every rung.
    const shell = nav({ rows: 2 });
    const [currentRow, plain] = [rows(shell)[0]!, rows(shell)[1]!];
    expect(computed(plain, "color"), "an ordinary nav label went accent").toBe(
      colorOn(plain, "var(--color-text)"),
    );
    expect(computed(currentRow, "color")).toBe(colorOn(currentRow, "var(--accent-current)"));
    expect(computed(currentRow, "color")).not.toBe(computed(plain, "color"));
  });

  it("a group HEADING is not a group member — it carries a weight step", () => {
    // The law this file has never had, and its absence is why the defect shipped: a heading
    // and a member were 14px/400 in the same case, apart in ink alone, so five groups read as
    // one column of links. Measured on the docs site 2026-08-25.
    //
    // THE TWO ARE READ AGAINST EACH OTHER, never against a literal alone. Asserting the label
    // is `500` passes just as happily on a stylesheet that sent every ROW to 500, which is the
    // same fault wearing the fix's clothes — and the fixture holds both, so they can disagree.
    // The size assertion is the other half and it is not decoration: it pins WHICH property
    // buys the distinction, because a size step would buy the same rank and break the shared
    // left edge the label's own comment exists to protect.
    const shell = mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellSidebar aria-label="Primary">
          <ShellNavGroup label="Workspace">
            <ShellNavItem>Inbox</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const label = within(shell, ".kui-shell-nav-label");
    const item = within(shell, ".kui-shell-nav-item");
    expect(
      computed(label, "font-weight"),
      "the heading and its members are one treatment",
    ).not.toBe(computed(item, "font-weight"));
    expect(computed(label, "font-weight"), "the heading is not the medium step").toBe("500");
    expect(computed(item, "font-weight"), "a row stopped being content dress").toBe("400");
    expect(
      computed(label, "font-size"),
      "the heading bought its rank with size, which breaks the shared left edge",
    ).toBe(computed(item, "font-size"));
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: a DEAD nav row dims its words, not only its icon`, () => {
      // The law this file has never had (ultracode audit 2026-08-23: `grep -c disabled` on this
      // file returned zero). The stand-down that keeps an ordinary nav label out of the accent
      // put it in a role the disabled remap cannot reach, so a dead row kept live words between
      // a dead icon and a dead cursor.
      //
      // `<Row disabled>` is the negative control and it is load-bearing: it is the same family
      // with no shell override, so it proves the remap works and isolates the defect to this
      // member. Without it the law could pass on a package where nothing dims at all.
      const shell = mounted(
        <Shell style={{ height: 400, width: 900 }}>
          <ShellSidebar aria-label="Primary">
            <ShellNavGroup label="Workspace">
              <ShellNavItem data-t="live">Inbox</ShellNavItem>
              <ShellNavItem data-t="dead" disabled>Archive</ShellNavItem>
            </ShellNavGroup>
          </ShellSidebar>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: { appearance }, select: ".kui-shell" },
      );
      const live = within(shell, '[data-t="live"]');
      const dead = within(shell, '[data-t="dead"]');
      expect(computed(dead, "color"), "a dead nav row reads like a live one").not.toBe(
        computed(live, "color"),
      );
      expect(computed(dead, "color")).toBe(colorOn(dead, "var(--disabled-ink)"));
      // And the CURRENT arm still wins where it should — it reads --tone-ink too, so a dead
      // current row must dim rather than keep the accent.
      const both = mounted(
        <Shell style={{ height: 400, width: 900 }}>
          <ShellSidebar aria-label="Primary">
            <ShellNavItem data-t="dc" current disabled>Inbox</ShellNavItem>
          </ShellSidebar>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: { appearance }, select: ".kui-shell" },
      );
      const dc = within(both, '[data-t="dc"]');
      expect(computed(dc, "color"), "a dead CURRENT row kept the accent").toBe(
        colorOn(dc, "var(--disabled-ink)"),
      );
    });
  }

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
    const sidebar = within(shell, ".kui-shell-sidebar");
    const pane = sidebar.getBoundingClientRect();
    const footer = within(shell, "[data-testid='footer']").getBoundingClientRect();
    // The pane's own safe area sits between them — the footer pins to the padding's inner
    // edge, not to the pane's wall (2026-08-21: panes pad). The padding box is read off the
    // browser, because which sides of a flush pane carry a seam is its neighbours' business.
    const pad = parseFloat(tokenOn(sidebar, "--kui-sf-p"));
    const wallBottom = pane.top + sidebar.clientTop + sidebar.clientHeight;
    expect(footer.bottom, "the footer floated up under the list instead of pinning").toBeCloseTo(
      wallBottom - pad,
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
      // The air is the pane's own padding since 2026-08-21 — the rail states the square and
      // nothing else, and `shellNavInset` is deleted rather than renamed.
      const pad = parseFloat(tokenOn(pane, "--kui-sf-p"));
      expect(square).toBeGreaterThan(0);
      expect(pad).toBeGreaterThan(0);
      // The CONTENT box: the extent is stated as the square, the padding is the air either
      // side of it, and the pane's own seam hairline sits outside both rather than eating in.
      // `clientWidth` is the padding box — content plus padding, border excluded.
      expect(pane.clientWidth, `size ${size}: the rail is not its item's box`).toBeCloseTo(
        square + 2 * pad,
        0,
      );
      seen.add(Math.round(pane.clientWidth));
      shell.remove();
    }
    // And it really MOVES with the index — a rail that answered nothing would pass the
    // arithmetic above at one width four times over.
    expect(seen.size, "the rail is the same width at every size").toBe(4);
  });

  it("squares with persistent fills get air: the rail list separates them by the stated pick", () => {
    // ADDED 2026-08-26 (audit). The list declared `display: flex; flex-direction: column` and
    // nothing else, under a comment claiming it "owns the distance between them for the same
    // reason the group owns the distance between its rows" — so two squares touched, and a
    // current square edge-to-edge with a hovered neighbour reads as one taller lozenge rather
    // than two squares. The nav group's own gap law, one container over; the pick is shared and
    // the declaration is each container's.
    //
    // Falsified: with `gap` removed from `.kui-shell-rail-list` the distance measures 0 and
    // this reads
    // `expected +0 to be close to 2, received difference is 2`.
    const shell = rail("2");
    const items = [...shell.querySelectorAll<HTMLElement>(".kui-shell-rail-item")];
    expect(items.length, "the rail fixture has nothing to separate").toBe(2);
    const want = parseFloat(tokenOn(shell, "--layout-space-1"));
    expect(want, "the pick resolves to nothing").toBeGreaterThan(0);
    const a = items[0]!.getBoundingClientRect();
    const b = items[1]!.getBoundingClientRect();
    expect(b.top - a.bottom, "adjacent rail squares touch").toBeCloseTo(want, 1);
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
    // The inset is the pane's PADDING now, and the expander reads the same hook — so the
    // two are one number by construction rather than two kept equal by hand.
    const inset = parseFloat(tokenOn(pane, "--kui-sf-p")) + pane.clientLeft;
    expect(inset).toBeGreaterThan(0);
    expect(box.left - paneBox.left, "the square is painted edge to edge").toBeCloseTo(inset, 0);
    const hit = document.elementFromPoint(paneBox.left + 1, box.top + box.height / 2);
    expect(item.contains(hit), "the gutter beside the square is dead").toBe(true);
  });

  it("current speaks accent in its GLYPH, and the fill collides here too (2026-08-23)", async () => {
    // The rail's item is the nav row's own decision at square scale, and it lands better here
    // than it does one pane over: a rail item has no words, so the thing that carries "you are
    // here" is the icon — which reads `currentColor` and therefore the family ink — while the
    // fill is the same neutral wash a hovered square takes. One signal, no competition.
    const shell = rail("3");
    const [currentItem, plain] = [
      ...shell.querySelectorAll<HTMLElement>(".kui-shell-rail-item"),
    ];
    const currentRest = computed(currentItem!, "background-color");
    expect(currentRest, "the current square rests transparent").not.toContain("rgba(0, 0, 0, 0)");
    // `--accent-INK` since 2026-08-23, and the change is the point rather than a rename. This
    // read `--accent-label` because a rail square is not a `.kui-row` and so never took the row
    // family's 2026-08-09 re-point onto the content ink — the two vocabularies had genuinely
    // split. They are one again: the control layer's own rungs moved to the ink that day, for
    // the reason the rows moved (on a chroma family `--tone-label` is a brown), so a square, a
    // row and a button now name one colour.
    expect(computed(currentItem!, "color"), "the current square's glyph is not accent").toBe(
      colorOn(currentItem!, "var(--accent-current)"),
    );
    expect(computed(currentItem!, "color")).not.toBe(computed(plain!, "color"));
    await userEvent.hover(plain!);
    expect(
      computed(plain!, "background-color"),
      "the fills have separated again — re-open the 2026-08-23 decision before changing this",
    ).toBe(currentRest);
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
        {/* `backdrop` since 2026-08-29: the posture no longer states one for the pane. */}
        <ShellSidebar aria-label="Primary" flush={false} backdrop>
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

  it("an ordinary re-render does NOT rebuild the pane's lens", async () => {
    /**
     * ADDED 2026-08-26 (audit). `mergeRefs` returns a FRESH closure per call and `useLensRef`
     * memoises the DOM ref callback on that closure, so an unmemoised merge handed React a new
     * ref identity every render. React answers a new ref by detaching (`null`) and reattaching
     * — and `useLens`'s detach path RELEASES the filter, which drops the last reference, so
     * `acquire` misses its cache and mints a whole new displacement map: a per-pixel Snell
     * solve, a `toDataURL` encode and an eleven-node `<filter>` graft, on the largest boxes in
     * the library, for every keystroke, hovered-with-state item or route change anywhere above
     * the shell. That is the thing refraction.tsx's "on mount and resize, never at interaction
     * time" rule exists to forbid.
     *
     * Read as the filter's IDENTITY rather than as a count of `<filter>` nodes: the churn
     * releases one and mints one, so the document's total is the axis that stays right while
     * the pane's own `url(#kui-lens-N)` changes underneath it.
     *
     * Falsified: pass `mergeRefs(ref, pane.paneRef)` straight to `usePaneDress` again and this
     * reads `expected 'url(#kui-lens-3)' to be 'url(#kui-lens-2)'`.
     */
    let bump!: () => void;
    function App() {
      const [n, setN] = React.useState(0);
      bump = () => flushSync(() => setN((v) => v + 1));
      return (
        <Shell style={{ height: 300, width: 600 }} data-tick={n}>
          <ShellSidebar aria-label="Primary" flush={false} backdrop>
            nav
          </ShellSidebar>
          <ShellContent>c</ShellContent>
          {/* BOTH pane implementations, because they are two code paths: `SidePane` serves
              rail/sidebar/inspector and `ShellBottom` is its own function, and each merges
              its own refs. A law that mounts one is a law about one of them. */}
          <ShellBottom flush={false} backdrop defaultOpen>
            b
          </ShellBottom>
        </Shell>
      );
    }
    const shell = mounted(<App />, { theme: { material: "regular" }, select: ".kui-shell" });
    const panes = [".kui-shell-sidebar", ".kui-shell-bottom"].map((sel) => within(shell, sel));
    // Settled rather than polled: the direct measurement and the ResizeObserver's own initial
    // record both land, and a poll that stops at the first map returns before the second.
    await new Promise((resolve) => setTimeout(resolve, 200));
    const before = panes.map((pane) => pane.style.getPropertyValue("--kui-lens"));
    // THE PREMISE: a lens was really built on EACH, or "it did not change" is trivially true —
    // the exact fixture defect this file has already paid for twice.
    for (const [i, value] of before.entries()) {
      expect(value, `${panes[i]!.className}: no lens was built, so this cannot show the churn`)
        .not.toBe("");
    }
    bump();
    await expect.poll(() => shell.getAttribute("data-tick")).toBe("1");
    await new Promise((resolve) => setTimeout(resolve, 200));
    for (const [i, pane] of panes.entries()) {
      expect(
        pane.style.getPropertyValue("--kui-lens"),
        `${pane.className}: an ordinary re-render tore the lens down and minted a new map`,
      ).toBe(before[i]);
    }
  });

  it("a Card composed inside a glass pane goes ON-GLASS — glass does not stack", () => {
    // RE-TARGETED 2026-08-29 onto a PANEL. The subject is glass-does-not-stack, and it needs a
    // glass pane to stack on; the content pane used to be the cheapest one to reach and is now
    // the one pane in the family that never resolves glass at all (the law below states why).
    const shell = mounted(
      <Shell style={{ height: 300 }}>
        <ShellSidebar aria-label="Primary" backdrop>
          <Card>on the pane</Card>
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: { material: "regular" }, select: ".kui-shell" },
    );
    expect(within(shell, ".kui-shell-sidebar").dataset.material).toBe("regular");
    expect(within(shell, ".kui-card").dataset.material).toBe("on-glass");
  });

  it("EVERY PANEL takes the prop — five components, not one code path", () => {
    // 2026-08-29. `SidePane` serves rail/sidebar/inspector while `ShellHeader` and
    // `ShellBottom` are their own functions, each destructuring and forwarding its own props:
    // a law that mounts one is a law about one of them (this file's own sentence, from the
    // lens-churn audit). The rail is included even though it shares SidePane's body, because
    // what is under test is the prop reaching the DOM through each export.
    const shell = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellHeader backdrop>h</ShellHeader>
        <ShellRail aria-label="Sections" backdrop>
          r
        </ShellRail>
        <ShellSidebar aria-label="Primary" backdrop>
          s
        </ShellSidebar>
        <ShellContent>c</ShellContent>
        <ShellInspector backdrop defaultOpen>
          i
        </ShellInspector>
        <ShellBottom backdrop defaultOpen>
          b
        </ShellBottom>
      </Shell>,
      { theme: { material: "regular" }, select: ".kui-shell" },
    );
    for (const name of ["header", "rail", "sidebar", "inspector", "bottom"]) {
      expect(
        within(shell, `.kui-shell-${name}`).dataset.material,
        `${name} did not express the theme's material for a backdrop it stated`,
      ).toBe("regular");
    }
  });

  describe("the work area never gets glass (§10, §27, 2026-08-29)", () => {
    // Kushagra: "I dont think content should ever get glass, panels are fine". Structural, not
    // a preference: shell.css derives floating as "a pane floats if the content is underneath
    // it", so the content is the one pane nothing is ever underneath. Every panel can be over
    // something; the work area is the bottom of the stack.
    //
    // The prop itself is refused in the TYPE (shell-types.test.tsx), which is the half of this
    // that no mount can assert. These two read the two runtime routes to glass that remain.

    it("a marked region reaches every panel and stops at the work area", () => {
      // The positive control is the point of the fixture: a sidebar in the SAME region must
      // go glass, or this passes under a theme whose glass never resolved and proves nothing.
      const shell = mounted(
        <Box backdrop>
          <Shell style={{ height: 300 }}>
            <ShellSidebar aria-label="Primary">nav</ShellSidebar>
            <ShellContent>c</ShellContent>
          </Shell>
        </Box>,
        { theme: { material: "regular" }, select: ".kui-shell" },
      );
      expect(
        within(shell, ".kui-shell-sidebar").dataset.material,
        "the marked region never reached the panes, so the content's silence proves nothing",
      ).toBe("regular");
      expect(
        within(shell, ".kui-shell-content").dataset.material,
        "the work area took glass from a region marked around the whole frame",
      ).toBeUndefined();
      // And it pays none of the cost: no filter, and no lens map for the largest box on screen.
      expect(computed(within(shell, ".kui-shell-content"), "backdrop-filter")).toBe("none");
      expect(within(shell, ".kui-shell-content").style.getPropertyValue("--kui-lens")).toBe("");
    });

    it("...at either posture — pulling it off the frame does not buy it either", () => {
      const shell = mounted(
        <Shell style={{ height: 300 }}>
          <ShellSidebar aria-label="Primary" flush={false} backdrop>
            nav
          </ShellSidebar>
          <ShellContent flush={false}>c</ShellContent>
        </Shell>,
        { theme: { material: "regular" }, select: ".kui-shell" },
      );
      expect(within(shell, ".kui-shell-sidebar").dataset.material).toBe("regular");
      expect(
        within(shell, ".kui-shell-content").dataset.material,
        "a grounded work area resolved glass over the app's flat ground",
      ).toBeUndefined();
    });

    it("but it HOSTS glass — the escape is the system's own sentence, not a prop", () => {
      // §10, 2026-08-19: a solid surface hosts glass. So a vibrant region inside the work area
      // is reachable and is what a caller wanting one actually composes — the refusal above is
      // the pane declining to pretend it is that region, never the library withholding glass.
      const shell = mounted(
        <Shell style={{ height: 300 }}>
          <ShellContent>
            <Card backdrop>over the canvas</Card>
          </ShellContent>
        </Shell>,
        { theme: { material: "regular" }, select: ".kui-shell" },
      );
      expect(within(shell, ".kui-shell-content").dataset.material).toBeUndefined();
      expect(
        within(shell, ".kui-card").dataset.material,
        "a solid pane refused to host the glass composed inside it",
      ).toBe("regular");
    });
  });
});
