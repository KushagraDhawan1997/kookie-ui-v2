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
  ShellPaneFooter,
  ShellPaneHeader,
  ShellRail,
  ShellRailItem,
  ShellRailList,
  ShellScroll,
  ShellSidebar,
  ShellTabBar,
  ShellTrigger,
} from "./shell.tsx";
import type { Size } from "../../system/axes.ts";
import { Button } from "../button/button.tsx";
import { Row } from "../row/row.tsx";
import { Toolbar, ToolbarButton } from "../toolbar/toolbar.tsx";
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
  inMotion,
  numberOn,
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

/** IS THIS PANE ON SCREEN? Not `display === "none"` any more (2026-09-06): an OVERLAYING pane
    parks at `visibility: hidden` so that its arrival and its exit can be transitioned at all —
    `display` cannot be — and both spellings mean the same three things: nothing painted,
    nothing focusable, nothing hit-testable. `checkVisibility` is the browser's own answer to
    that question, which is why it replaces the string comparison rather than gaining a second
    arm beside it. Its default options answer TRUE for `visibility: hidden`, so the flag is the
    whole of the call. */
const onScreen = (el: HTMLElement) => el.checkVisibility({ checkVisibilityCSS: true });

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
    expect(onScreen(sidebar), "the sidebar is not on screen").toBe(true);
    await narrow();
    expect(onScreen(sidebar), "the sidebar is still on screen").toBe(false);
    // The stamp did not move: the resolution is the stylesheet's, not a re-render's.
    expect(sidebar.dataset.state).toBe("auto");
  });

  it("an untouched inspector and bottom rest closed at every width — detail is asked for", async () => {
    const shell = mountShell();
    expect(onScreen(within(shell, ".kui-shell-inspector")), "inspector on screen").toBe(false);
    expect(onScreen(within(shell, ".kui-shell-bottom")), "bottom on screen").toBe(false);
    await narrow();
    expect(onScreen(within(shell, ".kui-shell-inspector")), "inspector on screen").toBe(false);
  });

  it("an untouched pane with EXPLICIT overlay presentation rests closed — an overlay is summoned, never ambient", () => {
    const shell = mountShell({ sidebar: { presentation: "overlay" } });
    expect(onScreen(within(shell, ".kui-shell-sidebar")), "sidebar on screen").toBe(false);
  });

  it("explicit state beats auto in both directions", async () => {
    const closedAtWide = mountShell({ sidebar: { defaultOpen: false } });
    expect(onScreen(within(closedAtWide, ".kui-shell-sidebar")), "closed at wide").toBe(false);
    await narrow();
    const openAtNarrow = mountShell({ sidebar: { defaultOpen: true } });
    expect(onScreen(within(openAtNarrow, ".kui-shell-sidebar")), "open at narrow").toBe(true);
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
        expect(onScreen(within(shell, ".kui-shell-sidebar")), "sidebar on screen").toBe(false);
      });

      it("an untouched inspector and bottom rest closed", () => {
        const shell = frame(arrangement);
        expect(onScreen(within(shell, ".kui-shell-inspector")), "inspector on screen").toBe(false);
        expect(onScreen(within(shell, ".kui-shell-bottom")), "bottom on screen").toBe(false);
      });

      it("an untouched explicit-overlay pane rests closed", () => {
        const shell = frame(arrangement, { sidebar: { presentation: "overlay" } });
        expect(onScreen(within(shell, ".kui-shell-sidebar")), "sidebar on screen").toBe(false);
      });

      it("an untouched sidebar rests closed on a narrow window — the phone default", async () => {
        const shell = frame(arrangement);
        expect(computed(within(shell, ".kui-shell-sidebar"), "display")).not.toBe("none");
        await narrow();
        expect(onScreen(within(shell, ".kui-shell-sidebar")), "sidebar on screen").toBe(false);
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
        <ShellBottom presentation="overlay" defaultOpen>b</ShellBottom>
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

describe("a side drawer PUSHES the frame; it does not cover it (§27, 2026-09-09)", () => {
  /**
   * THE REVERSAL, AND WHY IT NEEDED NEW LAWS RATHER THAN EDITED ONES (Kushagra: "Treating a
   * left drawer like an iOS sheet which comes from below is different… The content is pushed to
   * right, so sidebar always stays compliant with how desktop works").
   *
   * What stood here read the drawer's dress against a pane the app had pulled OFF the frame,
   * because a covering pane took the surface identity back — its fill, its corner, its four
   * edges. Under the push there is no covering pane: the frame slides aside and the drawer that
   * comes into view is the DESKTOP pane, so the agreement to hold is against the same pane at a
   * wide window. That is a different claim about a different thing, and rewriting the old law's
   * expectations in place would have left its name and its comment arguing for the reverse.
   *
   * Both arms are walked because the treatment is written twice — the explicit
   * `presentation="overlay"` at any width, and `auto` resolved by the narrow media block, which
   * is the path every phone takes and the half this file has twice recorded forgetting.
   */
  const dress = (el: HTMLElement) => ({
    corner: computed(el, "border-top-left-radius"),
    edgeStart: computed(el, "border-left-width"),
    edgeEnd: computed(el, "border-right-width"),
    edgeColor: computed(el, "border-right-color"),
    painted: computed(el, "background-color"),
    light: computed(el, "background-image"),
    casts:
      computed(el, "box-shadow") !== "none" &&
      !/^rgba\(0, 0, 0, 0\) 0px 0px 0px 0px$/.test(computed(el, "box-shadow")),
  });

  const wide = (flush: boolean, size: Size = "2") =>
    mounted(
      <Shell size={size} style={{ height: 400 }}>
        <ShellSidebar aria-label="Primary" flush={flush} defaultOpen>
          nav
        </ShellSidebar>
        <ShellContent flush={flush}>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );

  // Falsified: with the deleted restore arms put back — the fill, the light, the corner and the
  // four edges a covering pane used to take — the flush half fails on `corner` (40px against
  // 0) and on `edgeStart` (1px against 0), which is the card-welded-to-the-window a person saw.
  for (const flush of [true, false] as const) {
    it(`an EXPLICIT overlay ${flush ? "flush" : "floating"} drawer is the wide-window pane, at every size`, () => {
      for (const size of SIZES) {
        const shell = mounted(
          <Shell size={size} style={{ height: 400 }}>
            <ShellSidebar aria-label="Primary" flush={flush} presentation="overlay" defaultOpen>
              nav
            </ShellSidebar>
            <ShellContent flush={flush}>c</ShellContent>
          </Shell>,
          { theme: {}, select: ".kui-shell" },
        );
        expect(dress(within(shell, ".kui-shell-sidebar")), `size ${size}`).toEqual(
          dress(within(wide(flush, size), ".kui-shell-sidebar")),
        );
        shell.remove();
      }
    });
  }

  // Falsified: with the restore arms put back in the narrow block ONLY, this fails and the law
  // above still passes — the half-applied shape the agreement rule exists for.
  it("a drawer on a phone is the same pane too — the resolved arm, not just the explicit one", async () => {
    await narrow();
    const shell = mountShell();
    await userEvent.click(within(shell, ".kui-shell-header button"));
    const sidebar = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => sidebar.dataset.state).toBe("open");
    expect(sidebar.dataset.presentation, "resolved by CSS, not restamped").toBe("auto");
    expect(sidebar.hasAttribute("data-flush"), "the app's statement is untouched").toBe(true);
    expect(dress(sidebar)).toEqual(dress(within(wide(true), ".kui-shell-sidebar")));
  });

  /**
   * THE PUSH ITSELF, read as the one thing that makes it a push rather than a cover: the
   * drawer's trailing edge and the content's leading edge are the SAME line. Two distances
   * ride one clock — the frame's translate and the pane's own — so if either is wrong by a
   * pixel the seam opens, and a seam that opens mid-flight is exactly what the first spelling
   * of the park distance did (measured 2px at 120ms, with the landed state correct, which is
   * the shape no landed-state law can see).
   *
   * Falsified: parking a flush pane at `calc(-100% - var(--shell-gap))` — the pre-push value,
   * which is one gap further out than the push carries — fails at
   * `expected 328 to be close to 336`.
   */
  for (const flush of [true, false] as const) {
    it(`the ${flush ? "flush" : "floating"} drawer lands against the content it pushed`, async () => {
      /* THE TWIN IS MEASURED AT A WIDE WINDOW, WHICH IS THE WHOLE OF THE COMPARISON — and the
         first spelling mounted it AFTER `narrow()`, where its own sidebar resolves to a closed
         drawer and the "wide" seam is a parked pane's distance from the content. It passed, and
         it passed through a sabotage that shortened the push by two gaps: the degenerate-fixture
         rule, in the law written to hold the push to the desktop's own geometry. */
      const expected = (() => {
        const twin = wide(flush);
        const gap =
          within(twin, ".kui-shell-content").getBoundingClientRect().left -
          within(twin, ".kui-shell-sidebar").getBoundingClientRect().right;
        twin.remove();
        return Math.round(gap);
      })();
      await narrow();
      const shell = mountShell({ flush });
      await userEvent.click(within(shell, ".kui-shell-header button"));
      const sidebar = within(shell, ".kui-shell-sidebar");
      await expect.poll(() => sidebar.dataset.state).toBe("open");
      await expect
        .poll(() => Math.round(sidebar.getBoundingClientRect().right))
        .toBeGreaterThan(0);
      /* READ AS AN AGREEMENT WITH THE WIDE WINDOW, not as arithmetic (2026-09-09). The claim
         is that the drawer lands where the desktop pane sits relative to the content — which is
         the whole of "the sidebar on a phone is the desktop sidebar revealed" — and the
         distance between the two boxes is a different number per posture (a flush pane seams,
         a floating one leaves its margin on both sides). Rebuilding that number here would be
         re-deriving the stylesheet's own arithmetic from its own inputs, which is the shape
         this repo's audits keep naming; measuring the same two boxes at a wide window is a
         second, independent source for it. */
      const seam = () =>
        Math.round(
          within(shell, ".kui-shell-content").getBoundingClientRect().left -
            sidebar.getBoundingClientRect().right,
        );
      if (flush) {
        // The exact agreement, which is what "the desktop sidebar revealed" means: a flush pane
        // seams ON the content at both widths, so the number is the same number.
        await expect.poll(seam).toBeCloseTo(expected, 0);
      } else {
        /* A BOUND FOR THE FLOATING POSTURE, and the reason is a real difference rather than a
           weaker law: §27's all-cards regime splits one share of air between two IN-FLOW panes
           (half on the frame's padding, half on each margin), while a drawer is out of flow and
           carries its own whole margin — so the two windows legitimately differ, measured 16
           against 8. What must hold either way is that the pushed page neither laps the drawer
           nor opens a void: at least a hairline of air, and at most two shares of it. */
        const gap = parseFloat(tokenOn(shell, "--shell-gap"));
        await expect.poll(seam).toBeGreaterThan(0);
        expect(seam(), "the page opened a void beside the drawer").toBeLessThanOrEqual(2 * gap);
      }
    });
  }

  /**
   * AND THE PUSHED FRAME OVERFLOWS NOTHING (Kushagra: "when sidebar opens the page is very wide
   * so I can actually scroll"). A transform does not move a box in layout, but a transformed box
   * still counts as scrollable overflow, so pushing the ROOT gave the document a horizontal
   * scroll range the width of the drawer. The children carry the push inside a root that keeps
   * its clip, which moves the same pixels and overflows nothing.
   *
   * Falsified: moving the translate back onto `.kui-shell:has(…)` fails at
   * `expected 711 to be 375` on the document and leaves the frame scrollable.
   */
  it("the push overflows neither the document nor the frame", async () => {
    await narrow();
    const shell = mountShell();
    await userEvent.click(within(shell, ".kui-shell-header button"));
    await expect.poll(() => within(shell, ".kui-shell-sidebar").dataset.state).toBe("open");
    await expect
      .poll(() => Math.round(within(shell, ".kui-shell-sidebar").getBoundingClientRect().right))
      .toBeGreaterThan(0);
    expect(document.documentElement.scrollWidth, "the document grew a scroll range").toBe(
      document.documentElement.clientWidth,
    );
    /* AND THE MECHANISM THAT MAKES IT TRUE, since the frame's own `scrollWidth` is not an
       instrument for this (the 2026-09-06 note one law over): things deliberately hang outside
       the frame in both states, and `scrollWidth` reports that whether or not anything can
       scroll. `clip` is what makes the overflow unreachable, and it is what a side pane must
       not stand down — only the sheet's recession does. */
    expect(computed(shell, "overflow-x"), "the pushed frame stopped clipping").toBe("clip");
  });

  /**
   * NOTHING ABOUT THE FRAME RECEDES FOR A SIDE PANE, and the bottom sheet is the negative
   * control that keeps this from being a law about nothing: a sheet from below is a different
   * gesture and keeps the recession, the well and the plate. Read on the root's own transform,
   * because that is where the recession is declared.
   *
   * Falsified: keying the recession on `.kui-shell-pane` again — its pre-push spelling — fails
   * the side half at `expected 'matrix(0.925, 0, 0, 0.925, 0, 0)' to be 'none'`.
   */
  it("a side pane leaves the frame at its own size; a sheet from below recedes it", async () => {
    await narrow();
    const side = mountShell();
    await userEvent.click(within(side, ".kui-shell-header button"));
    await expect.poll(() => within(side, ".kui-shell-sidebar").dataset.state).toBe("open");
    await expect.poll(() => computed(side, "transform")).toBe("none");
    side.remove();

    const sheet = mountShell({ bottom: { defaultOpen: true } });
    await expect.poll(() => within(sheet, ".kui-shell-bottom").dataset.state).toBe("open");
    await expect.poll(() => computed(sheet, "transform")).not.toBe("none");
  });

  /**
   * THE SCRIM DIMS; IT DOES NOT DEFOCUS (Kushagra: "We have a blur scrim and a scale down,
   * both, which looks odd"). A dim says the page is set aside; a blur says it is behind a
   * material, which is what the glass DRAWER says about the strip it covers and not what a
   * scrim says about a whole screen — and frosting everything made the drawer's own material
   * invisible. Read at both contrasts, because the reduced-transparency arm answers this
   * setting with more pigment and no defocus, and it must not be the only arm that does.
   *
   * Falsified: restoring `backdrop-filter: var(--scrim-filter, none)` fails at
   * `expected 'blur(8px) saturate(0.8)' to be 'none'`.
   */
  it("the scrim carries pigment and no defocus", async () => {
    await narrow();
    const shell = mountShell();
    await userEvent.click(within(shell, ".kui-shell-header button"));
    await expect.poll(() => within(shell, ".kui-shell-sidebar").dataset.state).toBe("open");
    const scrim = within(shell, ".kui-shell-scrim");
    expect(computed(scrim, "backdrop-filter"), "the scrim defocused the page").toBe("none");
    expect(computed(scrim, "background-color"), "and it must still dim").not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    await expect.poll(() => computed(scrim, "opacity")).toBe("1");
  });

  /**
   * A SIDE PANE STATES ITS OWN MATERIAL; THE POSTURE NO LONGER INFERS ONE (§10, 2026-09-09).
   * The covering-panel rule — every popup in this package hardcodes a backdrop because a panel
   * over the page HAS the page behind it — was applied to a drawer while a drawer covered. Under
   * the push it does not cover: the page beside it is the page a wide-window sidebar has beside
   * it, so `backdrop` (or an ambient region) is the only thing that may say glass. The bottom
   * sheet is the negative control, and it still infers.
   *
   * Falsified: passing the posture back into `usePaneDress` fails at
   * `expected 'regular' to be undefined` on the unmarked drawer.
   */
  it("an unmarked drawer is solid under a glass theme; one that asked is not; a sheet still infers", async () => {
    await narrow();
    const plain = mounted(fixture(), { theme: { material: "regular" } });
    await userEvent.click(within(plain, ".kui-shell-header button"));
    await expect.poll(() => within(plain, ".kui-shell-sidebar").dataset.state).toBe("open");
    expect(
      within(plain, ".kui-shell-sidebar").dataset.material,
      "the posture volunteered a material",
    ).toBeUndefined();
    expect(
      within(plain, ".kui-shell-bottom").dataset.material,
      "a sheet over the content is the covering-panel case, and keeps it",
    ).toBe("regular");
    plain.remove();

    const asked = mounted(fixture({ sidebar: { backdrop: true } }), {
      theme: { material: "regular" },
    });
    await userEvent.click(within(asked, ".kui-shell-header button"));
    await expect.poll(() => within(asked, ".kui-shell-sidebar").dataset.state).toBe("open");
    expect(within(asked, ".kui-shell-sidebar").dataset.material, "the app asked and got nothing").toBe(
      "regular",
    );
  });
});

/** THE SCREEN, not a computed value. Grabs one frame, decodes it, and answers "what colour is
    this CSS pixel" — the instrument the drawer's own bugs needed, because both of them were
    about WHERE a correct declaration painted rather than about what it said. Device-pixel
    ratio is divided out against a known viewport width, which is also the calibration: an
    instrument whose scale is guessed is the 2026-08-08 finding waiting to happen. */
async function screenPixels(cssWidth: number) {
  const shot = (await page.screenshot({ base64: true, save: false })) as unknown as string;
  const b64 = typeof shot === "string" ? shot : (shot as { base64: string }).base64;
  const img = new Image();
  await new Promise((done) => {
    img.onload = done;
    img.src = `data:image/png;base64,${b64}`;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const ratio = img.width / cssWidth;
  return (x: number, y: number) => {
    const [r, g, b] = ctx.getImageData(Math.round(x * ratio), Math.round(y * ratio), 1, 1).data;
    return [r, g, b] as [number, number, number];
  };
}

/** A token resolved to the three channels the screen speaks in, so a pixel can be compared
    against the system's own value rather than against a literal nobody would notice going
    stale. */
async function rgbOf(scope: HTMLElement, expr: string) {
  const [r, g, b] = colorOn(scope, expr).match(/\d+/g)!.map(Number);
  return [r, g, b] as [number, number, number];
}

describe("a parked drawer is off the frame, not merely invisible (§27, §8, 2026-09-06)", () => {
  /**
   * THE LAW THE MOTION WORK SHIPPED WITHOUT, and a person found the defect instead (Kushagra:
   * "there's no slide in and out"). Every drawer law in this file reads a LANDED pane — its
   * dress, its cap, its span, its scrim — and the parked pose is the half none of them touch,
   * so 2,634 laws were green over a drawer that did not travel at all.
   *
   * The defect was one character. The slide was published as a single hook holding both axes
   * (`calc(-100% - gap) 0`) and `translate()` separates its arguments with a comma, so the
   * substitution was unparseable — invalid at computed-value time, which drops the WHOLE
   * declaration rather than the one argument. A parked drawer computed `transform: none` and
   * sat at its landed position behind `visibility: hidden`; the OPEN state was correct
   * throughout, because there the hook is unset and the `0` fallback parses. A law reading
   * the open pane cannot see any of that, which is why this one reads the parked one.
   *
   * It reads the POSITION rather than the transform string: `none` is only today's spelling
   * of the fault, and a drawer that parks where it lands is the fault in any spelling.
   */
  const parkedClearOf = (shell: HTMLElement, pane: HTMLElement) => {
    const frame = shell.getBoundingClientRect();
    const box = pane.getBoundingClientRect();
    return { gap: frame.left - box.right, width: box.width };
  };

  // Falsified: with the two axis hooks collapsed back into one space-separated hook, the
  // parked drawer's right edge sits 8px INSIDE the frame instead of on or past its left edge.
  it("an EXPLICIT overlay pane rests one pane-width outside the frame's own edge", () => {
    const shell = mounted(
      <Shell style={{ height: 400 }}>
        <ShellSidebar aria-label="Primary" presentation="overlay">
          nav
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const pane = within(shell, ".kui-shell-sidebar");
    // The premise: it is parked rather than deleted, or there is nothing here to measure.
    expect(computed(pane, "display"), "the drawer left the box model").not.toBe("none");
    expect(onScreen(pane), "the drawer was not parked at all").toBe(false);
    const { gap, width } = parkedClearOf(shell, pane);
    expect(width, "the parked drawer has no box to travel").toBeGreaterThan(100);
    expect(gap, "the parked drawer sits inside the frame it is supposed to fly in from").
      toBeGreaterThanOrEqual(0);
  });

  /**
   * AND ON THE PATH EVERY PHONE TAKES. `auto` is restated in the narrow media block, and this
   * file has recorded a fact reaching the explicit arm and not the resolved one three separate
   * times. Here they were both wrong, which is the only reason one law would have caught it.
   */
  it("a drawer on a phone parks outside too — the resolved arm, not just the explicit one", async () => {
    await narrow();
    const shell = mountShell();
    const pane = within(shell, ".kui-shell-sidebar");
    expect(pane.dataset.presentation, "resolved by CSS, not restamped").toBe("auto");
    expect(onScreen(pane), "the drawer was not parked at all").toBe(false);
    const { gap, width } = parkedClearOf(shell, pane);
    expect(width, "the parked drawer has no box to travel").toBeGreaterThan(100);
    expect(gap, "the parked drawer sits inside the frame it is supposed to fly in from").
      toBeGreaterThanOrEqual(0);
  });

  /**
   * AND IT ARRIVES ON THE FRAME'S OWN CLOCK. The whole point of the recession is that the
   * drawer's travel and the frame's shrink are ONE event, so a mid-flight reading must catch
   * both moving and neither finished — which is also the only reading that can tell a real
   * transition from a one-frame snap. `inMotion()` because the harness stands transitions
   * down by default (2026-08-20), and this is a claim about a clock.
   *
   * THE MID-FLIGHT MOMENT IS SEIZED, NEVER RACED (the 2026-08-20 rule, and this law earned it
   * the honest way: the first spelling read one rAF after the press, passed alone in three
   * consecutive runs and failed inside the full parallel suite, because a loaded machine can
   * put that callback past the whole 420ms). Both transitions are paused and their clocks set
   * to the same instant, so what the law reads does not depend on when it looked.
   *
   * Falsified: with the single-hook spelling restored, the drawer has no transition to seize
   * at all — it is at its landed position from the first frame.
   *
   * REWRITTEN 2026-09-09, and what it reads changed with the gesture: a side pane pushes rather
   * than covering, so the second half of the event is the frame's CHILDREN travelling, not its
   * scale. The claim is unchanged and is the reason the law exists — the two distances are one
   * event, and mid-flight both are moving and neither is finished. A seam that opens mid-flight
   * is what a landed-state law cannot see, and it is the defect the park distance shipped with
   * (measured 2px at 120ms, correct at rest).
   */
  it("the drawer and the page it pushed travel on one clock, in lockstep", async () => {
    inMotion();
    await narrow();
    const shell = mountShell();
    const pane = within(shell, ".kui-shell-sidebar");
    const content = within(shell, ".kui-shell-content");
    const parked = pane.getBoundingClientRect().left;
    const moving = (el: HTMLElement, property: string) =>
      el.getAnimations().filter((a) => (a as CSSTransition).transitionProperty === property);

    await userEvent.click(within(shell, ".kui-shell-header button"));
    await expect.poll(() => pane.dataset.state).toBe("open");
    // The premise, and the thing a defect here deletes: both boxes really are in flight.
    await expect
      .poll(() => moving(pane, "transform").length > 0 && moving(content, "translate").length > 0)
      .toBe(true);

    // Halfway, by the clock rather than by the wall.
    for (const [el, property] of [
      [pane, "transform"],
      [content, "translate"],
    ] as const) {
      for (const a of moving(el, property)) {
        a.pause();
        a.currentTime = 250;
      }
    }
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    const edge = pane.getBoundingClientRect().right;
    const page = content.getBoundingClientRect().left;
    expect(edge, "the drawer arrived in one frame, or never parked outside").toBeLessThan(
      pane.offsetWidth,
    );
    expect(pane.getBoundingClientRect().left, "the drawer never left its park").toBeGreaterThan(parked);
    expect(page, "the page never moved").toBeGreaterThan(0);
    // The whole of it: mid-flight the seam is still a seam.
    expect(page, "daylight opened between the drawer and the page").toBeCloseTo(edge, 0);
  });
});

describe("a live drawer is not cut, and neither is the scrim over it (§27, §8, 2026-09-06)", () => {
  /**
   * KUSHAGRA, ON THE SHIPPED RECESSION: "the sidebar is also cut". It was, and so were the
   * scrim and the well, all by the same line — `overflow: clip` on the frame. The reason is a
   * coordinate space: `overflow` clips descendants in the element's OWN box, BEFORE the
   * element's transform, and while a drawer is live the frame is scaled to 0.925, so all three
   * things that take its inverse are larger than the box doing the clipping. Every one of them
   * lands exactly on the frame's box once it is on screen, so the overflow was real in the
   * frame's space and imaginary in the viewer's.
   *
   * These laws read the VIEWER's space, by hit-testing: `getBoundingClientRect` reports the
   * transformed border box and says nothing about clipping, which is why no existing law could
   * see this — the drawer's rect was right the whole time.
   */
  const topmostAt = (x: number, y: number) => document.elementFromPoint(x, y);

  /** THE SHEET, which is what recedes since 2026-09-09 (§27): a side pane pushes the frame and
      a sheet from below pushes it BACK, so every law about the recession, the well and the
      frame's plane reads the bottom pane. */
  const liveSheet = async () => {
    await narrow();
    const shell = mountShell({ bottom: { defaultOpen: true } });
    const pane = within(shell, ".kui-shell-bottom");
    await expect.poll(() => computed(pane, "position")).toBe("absolute");
    await expect
      .poll(() => (pane.closest(".kui-shell") as HTMLElement).getAnimations().length === 0)
      .toBe(true);
    return { shell, pane };
  };

  const liveNarrowShell = async () => {
    await narrow();
    const shell = mountShell({ sidebar: { defaultOpen: true } });
    const pane = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => computed(pane, "position")).toBe("absolute");
    // Settle the entry: this reads a landed frame, never a moment inside the flight.
    await expect
      .poll(() => (pane.closest(".kui-shell") as HTMLElement).getAnimations().length === 0)
      .toBe(true);
    return { shell, pane };
  };

  // Falsified: with `overflow: clip` restored on the live arm, the pane's own head and foot
  // hit the theme instead of the pane — the 18px the frame was trimming at each end.
  it("the drawer paints its whole box, head and foot", async () => {
    const { pane } = await liveNarrowShell();
    const box = pane.getBoundingClientRect();
    const x = box.left + box.width / 2;
    expect(topmostAt(x, box.top + 2), "the drawer's head is trimmed").toBe(pane);
    expect(topmostAt(x, box.bottom - 2), "the drawer's foot is trimmed").toBe(pane);
  });

  /**
   * AND THE SCRIM REACHES THE FRAME'S TRAILING EDGE. The scrim and the well take the same
   * inverse the drawer does, so they were cut by the same line and by the same amount —
   * measured on a 375px frame, both stopped at x=347 and the trailing 28px showed raw page
   * under nothing at all. This is the half a person sees as a bright band beside a dimmed app,
   * which inverts the depth the recession is for.
   */
  it("the scrim covers the frame's trailing edge, which is where the recession opened", async () => {
    const { shell } = await liveSheet();
    const root = within(shell, ".kui-shell");
    const frame = root.getBoundingClientRect();
    const scrim = within(shell, ".kui-shell-scrim");
    // The premise: the frame really has receded, or there is no trailing gap to cover.
    expect(computed(root, "transform"), "the frame did not recede").not.toBe("none");
    const y = frame.top + frame.height / 2;
    // Just inside the frame's LAYOUT box, past where the receded frame now paints.
    const trailing = root.offsetLeft + root.offsetWidth - 2;
    expect(topmostAt(trailing, y), "the trailing edge is outside the scrim").toBe(scrim);
  });

  /**
   * AND THE APP IS STILL THERE BEHIND THE DRAWER — READ OFF THE PIXELS (Kushagra, twice:
   * "Normal white page becomes black when sidebar comes", then "The entire page is black there
   * is no ring").
   *
   * The well is a pseudo-element behind the panes, sized to the frame's whole box, and a flush
   * pane paints nothing because a pane level with the page is not a plane. So through a frame
   * of flush panes the well was not a ring around a receded app; it WAS the app, replaced by a
   * near-black slab. The frame carries the seal for as long as it is away from the page, which
   * is flush's own rule one level up.
   *
   * THIS LAW GRABS THE SCREEN, and it is the only kind that could have caught either half. The
   * first repair put the seal on the root's own background, which measured perfectly on the
   * element — and painted nowhere, because the root isolates and a `z-index: -1` pseudo paints
   * ABOVE its parent's background. A computed value cannot see paint order; a pixel can. It is
   * the calibration lesson (2026-08-08) taken one step further: an instrument that reads a
   * declaration is measuring the author's intent, not the reader's screen.
   *
   * Falsified twice: with the plane deleted the frame reads 9,9,10 — the well; with the plane
   * moved back onto the root it reads 9,9,10 again, which is the defect this law was written
   * a second time to catch.
   */
  it("a flush frame is still the app when a SHEET opens — in pixels", async () => {
    /* RE-KEYED 2026-09-09: the recession belongs to the sheet from below, so the strip of well
       this law reads opens on the sides rather than past a drawer's trailing edge. Everything
       else about it is unchanged, including the reason it exists — the frame's plane is painted
       by a pseudo-element at a negative layer, and the well is painted by another one at the
       same layer, so an ordering mistake shows as the app disappearing into the well and as
       nothing at all in any computed value. */
    await page.viewport(375, 700);
    const shell = mounted(
      <Shell style={{ height: 700 }}>
        <ShellContent>content</ShellContent>
        <ShellBottom presentation="overlay" defaultOpen>sheet</ShellBottom>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const root = within(shell, ".kui-shell");
    const content = within(shell, ".kui-shell-content");
    // The premise, and the reason this fixture can see the defect at all: the pane paints
    // nothing of its own, so whatever the screen shows there came from behind it.
    expect(computed(content, "background-color"), "the pane paints its own bed").toBe(
      "rgba(0, 0, 0, 0)",
    );
    expect(computed(root, "transform"), "the frame did not recede").not.toBe("none");
    await expect.poll(() => root.getAnimations().length).toBe(0);

    /* THE POINT MATTERS AS MUCH AS THE READING. The subject is the strip of frame the sheet
       does not cover: the recession pulls the frame's leading edge in, so the ring is between
       the root's own wall and where the frame now stops, and the frame itself is just inside
       that. (The degenerate-fixture rule: sampling the middle of the window would read the
       frame in both a correct and a broken build.) */
    const at = await screenPixels(375);
    const recede = numberOn(shell, "--shell-drawer-scale");
    // The recession's origin for a sheet is `50% 100%`, so the frame loses half the shrink at
    // each side; the ring is that half, and the reading sits inside it and just past it.
    const inset = (root.offsetWidth * (1 - recede)) / 2;
    expect(inset, "the recession opened no ring on the sides").toBeGreaterThan(8);
    const y = root.offsetTop + root.offsetHeight / 4;
    const well = at(root.offsetLeft + 2, y);
    const inside = at(root.offsetLeft + inset + 8, y);

    /* READ AS A DISTANCE, because the scrim sits over both regions and neither pixel is its
       token exactly. What the claim has always been is which of the two colours the frame is
       showing, so that is what the law asks: the pixel inside the frame must be nearer the seal
       than the well, and the ring the other way round. The second half is the vacuity guard —
       without a ring there is nothing here to be on the wrong side of. */
    const seal = await rgbOf(shell, "var(--color-surface)");
    const wellToken = await rgbOf(shell, "var(--scrim-well)");
    const near = (px: number[], to: number[]) =>
      Math.hypot(px[0]! - to[0]!, px[1]! - to[1]!, px[2]! - to[2]!);
    expect(
      near(well, wellToken) < near(well, seal),
      `the recession opened no ring, so this law proves nothing (${well})`,
    ).toBe(true);
    expect(
      near(inside, seal) < near(inside, wellToken),
      `the well painted straight through the frame — the app is gone (${inside})`,
    ).toBe(true);
  });

  /**
   * AND THE SCRIM LEAVES WITH THE DRAWER, NOT BEFORE IT (Kushagra: "When I dismiss it, the bg
   * loses its blur instantly making it look weird"). It was `display: none` at rest and
   * `display: block` while a drawer was live, and `display` cannot be transitioned — so the
   * instant a drawer was dismissed the scrim's pigment AND its defocus vanished in one frame
   * while the pane still had its whole travel left. The app snapped back to full contrast and
   * full sharpness with something still sliding across it, which reads as two events rather
   * than one.
   *
   * The moment is SEIZED rather than raced, the 2026-08-20 rule: the exit's own clocks are
   * paused and set to the same instant, so what this reads does not depend on when it looked.
   *
   * Falsified: with the `display` spelling restored, the scrim is off screen on the first
   * frame of the exit and there is no animation to seize at all.
   */
  it("the scrim fades out on the drawer's clock, not in one frame", async () => {
    inMotion();
    await narrow();
    const shell = mountShell({ sidebar: { defaultOpen: true } });
    const scrim = within(shell, ".kui-shell-scrim");
    const pane = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => onScreen(scrim)).toBe(true);
    // The premise: it really is defocusing something, or "loses its blur" names nothing here.
    // Its PIGMENT, since 2026-09-09: the scrim dims and does not blur, so what has to be there
    // before the exit can be read is the fill (its own law states the absence of the defocus).
    expect(computed(scrim, "background-color"), "the scrim dims nothing").not.toBe("rgba(0, 0, 0, 0)");

    pressEscape(pane);
    await expect.poll(() => pane.dataset.state).toBe("closed");
    const fading = () =>
      scrim.getAnimations().filter((a) => (a as CSSTransition).transitionProperty === "opacity");
    await expect.poll(() => fading().length > 0).toBe(true);
    for (const a of fading()) {
      a.pause();
      a.currentTime = 210;
    }
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    const half = Number(computed(scrim, "opacity"));
    expect(half, "the scrim was gone before the drawer was").toBeGreaterThan(0);
    expect(half, "the scrim never started leaving").toBeLessThan(1);
    // And it is still on screen doing its job while the pane travels.
    expect(onScreen(scrim), "the scrim left the screen mid-exit").toBe(true);
    expect(computed(scrim, "background-color"), "the dim went in one frame").not.toBe("rgba(0, 0, 0, 0)");
  });

  /**
   * AND THE RECEDED FRAME IS AN OBJECT, SO IT HAS CORNERS (Kushagra: "when the bg scales down,
   * it should have corner radius too"). Read as an AGREEMENT with a mounted Card at the frame's
   * own step rather than against a number, because the squircle multiplier sits between the
   * token and the painted corner and a literal here would be pinning the multiplier by
   * accident — the shape §27's own pane-corner law already takes.
   */
  it("the frame rounds while it recedes, at the corner a card wears", async () => {
    const { shell } = await liveSheet();
    const root = within(shell, ".kui-shell");
    const plane = getComputedStyle(root, "::after").borderTopLeftRadius;
    expect(plane, "the receding frame is a square slab").not.toBe("0px");
    const card = mounted(<Card size="3">c</Card>, { theme: {}, select: ".kui-surface" });
    expect(plane, "the frame's corner is not the system's").toBe(
      computed(card, "border-top-left-radius"),
    );
  });

  /**
   * AND THE PRICE OF NOT CLIPPING IS PAID BY THE OTHER DRAWERS. Parking is affordable because
   * the frame clips; the frame stops clipping while a drawer is live, and at that moment every
   * OTHER parked pane is real scrollable overflow — measured on a frame with all three, a
   * 375x700 window reported 663x874 and the page gained two scrollbars onto blank space.
   *
   * Falsified: with the sibling stand-down deleted, both dimensions overflow by a pane.
   */
  it("a sibling parked drawer does not scroll the page while another is live", async () => {
    await narrow();
    const shell = mountShell({ sidebar: { defaultOpen: true } });
    const pane = within(shell, ".kui-shell-sidebar");
    await expect.poll(() => computed(pane, "position")).toBe("absolute");
    // The premise: this fixture really does carry the other two overlay panes.
    expect(within(shell, ".kui-shell-inspector")).toBeTruthy();
    expect(within(shell, ".kui-shell-bottom")).toBeTruthy();
    const el = document.documentElement;
    expect(el.scrollWidth, "the page scrolls sideways").toBeLessThanOrEqual(el.clientWidth);
    expect(el.scrollHeight, "the page scrolls down").toBeLessThanOrEqual(el.clientHeight);
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
    expect(onScreen(sidebar), "the sidebar is still on screen").toBe(false);
    // … and the JS half, which nothing read: an overlay is summoned, never ambient.
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("false");
    expect(within(shell, ".kui-shell-content").inert, "the shell contained itself at rest").toBe(false);
    expect(onScreen(within(shell, ".kui-shell-scrim")), "the scrim is up").toBe(false);
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
    expect(onScreen(within(shell, ".kui-shell-scrim")), "the scrim is down").toBe(true);
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
    expect(onScreen(sidebar), "the sidebar is still on screen").toBe(false);
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("false");
    trigger.click();
    await expect.poll(() => sidebar.dataset.state).toBe("open");
    expect(onScreen(sidebar), "the sidebar is not on screen").toBe(true);
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
    expect(onScreen(sidebar), "the sidebar is not on screen").toBe(true);
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
    expect(onScreen(scrim), "the scrim is down").toBe(true);
    // The scrim paints the designed veil, under the pane.
    expect(parseInt(computed(scrim, "z-index"), 10)).toBeLessThan(
      parseInt(computed(sidebar, "z-index"), 10),
    );
    /* IT COVERS THE WHOLE FRAME, header included (2026-09-06). This read "under the header,
       over the content: the pane's top is the header's bottom" — true while the drawer was
       still one of the frame's grid rows, and untrue the moment the frame began receding
       underneath it. A drawer covers, and the full span is also what makes its counter-scale
       exact (it has to share the frame's centre on the axis it does not anchor to). Measured
       in LAYOUT space: painted, the frame is 7.5% smaller than the drawer while a drawer is
       live, so a page-space comparison of the two is a comparison of two different scales. */
    expect(sidebar.offsetTop, "the drawer starts below something").toBeCloseTo(
      parseFloat(computed(sidebar, "margin-top")),
      0,
    );
    expect(
      sidebar.offsetTop + sidebar.offsetHeight + parseFloat(computed(sidebar, "margin-bottom")),
      "the drawer stops short of the frame's foot",
    ).toBeCloseTo(shell.clientHeight, 0);
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
    expect(onScreen(within(shell, ".kui-shell-scrim")), "the scrim is up").toBe(false);
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
    // scrim rules in shell.css, which reads `expected false to be true`.
    expect(
      onScreen(within(shell, ".kui-shell-scrim")),
      "a wrapped drawer contained the whole shell and drew no way out",
    ).toBe(true);
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
      onScreen(within(inner, ".kui-shell-scrim")),
      "the inner frame drew no scrim for its own drawer",
    ).toBe(true);
    expect(
      onScreen(outer.querySelector(":scope > .kui-shell-scrim") as HTMLElement),
      "the outer frame raised a scrim over a drawer it does not contain",
    ).toBe(false);
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
      /* THE FRAME'S OWN BOX, not its painted one (2026-09-06). The root RECEDES while a
         drawer is live, so `getBoundingClientRect` returns a box 7.5% smaller than the room
         the person is actually looking at, and a strip measured against it comes out short by
         the recession rather than by anything the layout did. `offsetWidth` is the layout box,
         which is the frame the cap is written against. */
      const root = { width: shell.clientWidth };
      const pane = { width: sidebar.offsetWidth, left: sidebar.offsetLeft };
      const strip = root.width - pane.width;
      const floor = parseFloat(tokenOn(shell, "--touch-target-min"));
      expect(floor).toBeGreaterThan(0);
      expect(strip, `no dismissal strip at ${width}px`).toBeGreaterThanOrEqual(floor - 0.5);
      // And the strip is really the scrim, not merely empty space.
      const box = shell.getBoundingClientRect();
      const hit = document.elementFromPoint(box.right - 4, box.top + box.height / 2);
      expect(hit?.classList.contains("kui-shell-scrim"), "the strip is not the scrim").toBe(true);
      // THE OTHER END, added 2026-08-20 after the audit. This law was written as a bound in
      // ONE direction and shipped a critical defect underneath it for four days: the cap
      // resolved `100%` against the pane's own collapsed grid area, so every drawer on every
      // narrow screen rendered 1px wide (clientWidth 0) — and a 1px pane leaves a 374px
      // strip, which the assertion above welcomes. A bound with one end is half a bound.
      const designed = parseFloat(tokenOn(shell, "--shell-sidebar-w"));
      expect(designed).toBeGreaterThan(0);
      // THE TERM THE CAP SUBTRACTS, read rather than assumed (2026-09-09). A flush drawer pays
      // no air since it stays flush under the push, and a floating one pays its margin on both
      // sides; `--kui-shell-outer` is what publishes the difference, so reading it is what keeps
      // this law true of both postures instead of true of whichever one it was written against.
      const air = 2 * parseFloat(tokenOn(sidebar, "--kui-shell-outer"));
      expect(pane.width, `the drawer collapsed at ${width}px`).toBeCloseTo(
        Math.min(designed, root.width - floor - air),
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
    const air = 2 * parseFloat(tokenOn(sidebar, "--kui-shell-outer"));
    expect(capped, "the oversized drawer collapsed instead of being capped").toBeCloseTo(
      375 - floor - air,
      0,
    );
    /* THE DOCUMENT, not the shell's own `scrollWidth` (2026-09-06). Things deliberately hang
       outside the frame in both states — a parked drawer at rest, the counter-scaled scrim and
       well while one is live — and `scrollWidth` on the shell reports that whether or not
       anything can scroll, so it stopped being an instrument for this claim. What the claim
       has always been about is whether the PAGE gains a sideways scrollbar.

       The spelling assertion that stood here (`overflow-x === "clip"`) was DELETED the same
       day it was written: the frame stops clipping while a drawer is live, precisely so the
       drawer is not cut, and a law pinning the spelling would have to be wrong in one of the
       two states. The guarantee is the page, in both. */
    expect(
      document.documentElement.scrollWidth,
      "the page scrolls sideways",
    ).toBeLessThanOrEqual(document.documentElement.clientWidth);
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
    /* LAYOUT SPACE, consistently (2026-09-06). The frame RECEDES while a drawer is live and
       the drawer takes the exact inverse, so a rect off the root and a rect off the pane are
       measured in two different scales — mixing them reads a strip 7.5% short of the real
       one. `clientWidth` and `offsetLeft`/`offsetWidth` are the layout box, which is the space
       the cap is written in and the space the person's finger is in once the recession has
       finished. */
    const strip = shell.clientWidth - (sidebar.offsetLeft + sidebar.offsetWidth);
    expect(strip, "the drawer's margin ate the dismissal strip").toBeGreaterThanOrEqual(floor - 0.5);
    // Capped, not collapsed — a bound with one end is half a bound (2026-08-20).
    expect(sidebar.clientWidth, "the drawer collapsed instead of being capped").toBeGreaterThan(
      floor,
    );
    // And the strip is really the scrim, not merely empty space. Read at the frame's own
    // painted edge, because the scrim takes the frame's inverse and covers the whole box.
    const box = shell.getBoundingClientRect();
    const hit = document.elementFromPoint(box.right - 4, box.top + box.height / 2);
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
    await expect.poll(() => onScreen(scrim)).toBe(true);
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
        <ShellBottom presentation="overlay" defaultOpen>b</ShellBottom>
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

  it("...and the geometry is why: the card's own edge is already on the wall", () => {
    // The claim measured as a DISTANCE rather than as a border width, because "the seam is
    // stray" is a statement about where the neighbour is, not about whether a border exists.
    // RE-KEYED 2026-08-30 with the mixed-boundary rules: this law used to assert a >1px gap
    // between the flush sidebar and the card — the void the stray seam floated in — and that
    // void is exactly what those rules deleted. The seam stays dropped, with a sharper
    // reason: the card's edge now lands ON the sidebar's wall, so a sidebar hairline there
    // would be a second line on top of the boundary the card already draws.
    const shell = shellWith(<ShellContent flush={false}>c</ShellContent>);
    const sidebar = within(shell, ".kui-shell-sidebar").getBoundingClientRect();
    const content = within(shell, ".kui-shell-content").getBoundingClientRect();
    expect(
      content.left - sidebar.right,
      "the card pulled away from the wall — the doubled-line argument no longer holds",
    ).toBeCloseTo(0, 1);
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
    // NON-FLUSH SINCE 2026-09-09, and the fixture is the law: a FLUSH drawer stays flush under
    // the push and legitimately draws one seam, so asking it for four borders would be asking
    // for the behaviour this repo reversed. A pane the app pulled off the frame is the one that
    // has four, which is also the pane the specificity hazard is about.
    const shell = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellSidebar aria-label="Primary" flush={false} presentation="overlay" defaultOpen>
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

describe("a mixed boundary gets ONE share of air (§27, 2026-08-30)", () => {
  /* Kushagra: "there's gap between sidebar and shell content, which isn't needed when only
     one of them is flush." A flush pane pads (the safe area), paints no fill and draws no
     hairline toward a card, so its padding reads as air — and the card's margin on top of it
     made the boundary two shares wide, with the sidebar's overlay scrollbar pinned to the
     pane's invisible wall in the middle of the void (measured: rows at 272, card at 296).
     The card stops paying on any side where a flush pane already pays; the flush pane's
     padding is untouchable because it serves the pane's own rows.

     The fixture is per-side MIXED on purpose (the degenerate-fixture rule): every pane flush
     except the content, so all four arms fire at once and the geometry can disagree with the
     margins independently. */
  const mixed = () =>
    mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellHeader>h</ShellHeader>
        <ShellSidebar aria-label="Primary">s</ShellSidebar>
        <ShellContent flush={false}>c</ShellContent>
        <ShellInspector defaultOpen>i</ShellInspector>
        <ShellBottom defaultOpen>b</ShellBottom>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );

  // Falsified: with the five mixed-boundary rules deleted from shell.css, every margin here
  // reads the full gap and every touch reads gap-wide.
  it("the card pays no margin toward a flush pane, on all four sides at once", () => {
    const shell = mixed();
    const content = within(shell, ".kui-shell-content");
    for (const side of [
      "margin-inline-start",
      "margin-block-start",
      "margin-inline-end",
      "margin-block-end",
    ]) {
      expect(computed(content, side), side).toBe("0px");
    }
    // And the geometry agrees: the card's edge lands ON each flush pane's wall, so the only
    // visible air is the flush pane's own padding.
    const c = content.getBoundingClientRect();
    expect(c.left).toBeCloseTo(within(shell, ".kui-shell-sidebar").getBoundingClientRect().right, 1);
    expect(c.top).toBeCloseTo(within(shell, ".kui-shell-header").getBoundingClientRect().bottom, 1);
    expect(c.right).toBeCloseTo(within(shell, ".kui-shell-inspector").getBoundingClientRect().left, 1);
    expect(c.bottom).toBeCloseTo(within(shell, ".kui-shell-bottom").getBoundingClientRect().top, 1);
  });

  /* The rule keys on the NEIGHBOUR, and each of these is one way the neighbour stops being
     one: closed leaves flow entirely, overlay is out of flow, and a non-flush sibling is
     card-against-card (the deferred 2g, deliberately untouched). Falsified together with the
     law above — a rule that dropped its guards passes it and fails these. */
  it("negative controls: a closed, overlaying or non-flush neighbour buys the card no discount", () => {
    const gap = (shell: HTMLElement) => tokenOn(shell, "--shell-gap");

    const closed = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellSidebar aria-label="Primary" defaultOpen={false}>
          s
        </ShellSidebar>
        <ShellContent flush={false}>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    expect(
      computed(within(closed, ".kui-shell-content"), "margin-inline-start"),
      "closed flush sidebar",
    ).toBe(gap(closed));

    const overlay = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellSidebar aria-label="Primary" presentation="overlay" defaultOpen>
          s
        </ShellSidebar>
        <ShellContent flush={false}>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    expect(
      computed(within(overlay, ".kui-shell-content"), "margin-inline-start"),
      "overlaying flush sidebar",
    ).toBe(gap(overlay));

    const cards = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellHeader>h</ShellHeader>
        <ShellSidebar aria-label="Primary" flush={false}>
          s
        </ShellSidebar>
        <ShellContent flush={false}>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const content = within(cards, ".kui-shell-content");
    expect(computed(content, "margin-inline-start"), "non-flush sidebar: card against card").toBe(
      gap(cards),
    );
    // ...while the flush header above the same card still fires its arm — the discount is
    // per-boundary, never per-shell.
    expect(computed(content, "margin-block-start"), "the flush header's own side").toBe("0px");
  });

  it("the rail's arm fires only when it actually borders the content", () => {
    const railOnly = mounted(
      <Shell style={{ height: 600, width: 1280 }}>
        <ShellRail aria-label="Sections">r</ShellRail>
        <ShellContent flush={false}>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const alone = within(railOnly, ".kui-shell-content");
    expect(computed(alone, "margin-inline-start")).toBe("0px");
    expect(alone.getBoundingClientRect().left).toBeCloseTo(
      within(railOnly, ".kui-shell-rail").getBoundingClientRect().right,
      1,
    );

    // An open NON-flush sidebar stands between rail and content: the boundary that matters
    // is card-against-card, and the rail's flushness buys nothing across it.
    const interposed = mounted(
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
      computed(within(interposed, ".kui-shell-content"), "margin-inline-start"),
      "the sidebar between them is a card",
    ).toBe(tokenOn(interposed, "--shell-gap"));
  });

  // Falsified: with the restore dropped from the narrow media block ONLY, this fails and the
  // wide law above stays green — the twice-recorded hazard, a fact stated for the explicit
  // path and forgotten on the path every phone takes.
  it("on a narrow window an auto-presentation neighbour leaves flow, and the card gets its air back", async () => {
    await narrow();
    const shell = mounted(
      <Shell style={{ height: 600 }}>
        <ShellSidebar aria-label="Primary">s</ShellSidebar>
        <ShellContent flush={false}>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    // The untouched flush sidebar rests closed here (display: none), but `:has()` still sees
    // it — which is exactly what the restatement exists to answer.
    expect(computed(within(shell, ".kui-shell-content"), "margin-inline-start")).toBe(
      tokenOn(shell, "--shell-gap"),
    );
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

  /**
   * THE PANE'S OWN CHROME ROWS (§27, 2026-08-29): ShellPaneHeader / ShellPaneFooter. The
   * float posture and its published reach are the frame's safe-area pattern one level down,
   * so the laws are the same shape: agreements against real boxes, never restated arithmetic.
   */
  it("an in-flow pane header is one control row at the pane's index — the stated height", () => {
    for (const size of SIZES) {
      const shell = mounted(
        <Shell style={{ height: 600, width: 900 }} size={size}>
          <ShellSidebar aria-label="Primary">
            <ShellPaneHeader data-testid="ph">
              <span>chrome</span>
            </ShellPaneHeader>
            <ShellScroll>rows</ShellScroll>
          </ShellSidebar>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: {}, select: ".kui-shell" },
      );
      const ph = within(shell, "[data-testid='ph']");
      const rail = mounted(
        <Shell style={{ height: 600, width: 900 }} size={size}>
          <ShellRail aria-label="Sections">r</ShellRail>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: {}, select: ".kui-shell" },
      );
      // The agreement: a pane header is exactly as tall as the rail at that index is wide —
      // ShellHeader's own sentence, now true of the pane's chrome too.
      expect(
        ph.getBoundingClientRect().height,
        `size ${size}: the pane header is not one control row`,
      ).toBeCloseTo(
        parseFloat(computed(within(rail, ".kui-shell-rail"), "inline-size")),
        1,
      );
    }
  });

  it("a FLOATING pane header leaves flow, and the pane publishes exactly its reach (§27)", () => {
    const shell = mounted(
      <Shell style={{ height: 600, width: 900 }}>
        <ShellSidebar aria-label="Primary">
          <ShellPaneHeader float data-testid="ph">
            <span>chrome</span>
          </ShellPaneHeader>
          <ShellScroll>
            <Box data-testid="deep">rows</Box>
          </ShellScroll>
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const pane = within(shell, ".kui-shell-sidebar");
    const ph = within(shell, "[data-testid='ph']");
    const scroller = within(shell, ".kui-shell-scroll");
    // Out of flow: the scroller starts at the pane's top, BEHIND the row.
    expect(scroller.getBoundingClientRect().top, "the scroller did not reach under the row")
      .toBeLessThan(ph.getBoundingClientRect().bottom - 4);
    // The published reach is the row's real box — measured against the pane's edge, and read
    // where the app actually reads it: deep inside the scroller (the inherit is the law).
    const probe = document.createElement("div");
    probe.style.blockSize = "var(--kui-pane-inset-block-start)";
    within(shell, "[data-testid='deep']").appendChild(probe);
    const reach = probe.getBoundingClientRect().height;
    probe.remove();
    expect(reach, "the reach and the row's real box disagree").toBeCloseTo(
      ph.getBoundingClientRect().bottom - pane.getBoundingClientRect().top,
      1,
    );
  });

  it("a floating FOOTER publishes the other end, an in-flow one publishes nothing, and a nested pane resets (§27)", () => {
    const shell = mounted(
      <Shell style={{ height: 600, width: 900 }}>
        <ShellSidebar aria-label="Primary">
          <ShellScroll>
            <Box data-testid="deep">
              <Card data-testid="inner">card content</Card>
            </Box>
          </ShellScroll>
          <ShellPaneFooter float data-testid="pf">
            <span>chrome</span>
          </ShellPaneFooter>
        </ShellSidebar>
        <ShellContent>
          <ShellPaneHeader data-testid="plain">
            <span>in flow</span>
          </ShellPaneHeader>
          <ShellScroll>c</ShellScroll>
        </ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const pane = within(shell, ".kui-shell-sidebar");
    const pf = within(shell, "[data-testid='pf']");
    const read = (host: Element, name: string) => {
      const probe = document.createElement("div");
      probe.style.blockSize = `var(${name})`;
      host.appendChild(probe);
      const v = probe.getBoundingClientRect().height;
      probe.remove();
      return v;
    };
    expect(read(within(shell, "[data-testid='deep']"), "--kui-pane-inset-block-end")).toBeCloseTo(
      pane.getBoundingClientRect().bottom - pf.getBoundingClientRect().top,
      1,
    );
    // An IN-FLOW part takes space instead of covering content, so it owes no reach.
    expect(
      read(within(shell, ".kui-shell-content"), "--kui-pane-inset-block-start"),
      "an in-flow header claimed a reach",
    ).toBe(0);

    // And a NESTED pane resets. The nested Shell sits INSIDE the pane that has the float —
    // the one path the value actually inherits down — because a nested Shell in a different
    // pane reads 0 whether the reset exists or not, which is the degenerate fixture this
    // repo keeps writing down. The guard above proves the value is live on that path;
    // falsified by deleting the pane's `initial` reset, where the inner pane reads 64px.
    const nested = mounted(
      <Shell style={{ height: 600, width: 900 }}>
        <ShellContent>
          <ShellPaneFooter float>chrome</ShellPaneFooter>
          <Box data-testid="beside">
            <Shell data-testid="inner" style={{ height: 300 }}>
              <ShellSidebar aria-label="Inner">n</ShellSidebar>
              <ShellContent>inner</ShellContent>
            </Shell>
          </Box>
        </ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    expect(
      read(nested.querySelector("[data-testid='beside']")!, "--kui-pane-inset-block-end"),
      "the outer pane published no reach on this path, so the reset check proves nothing",
    ).toBeGreaterThan(30);
    expect(
      read(
        nested.querySelector("[data-testid='inner'] .kui-shell-sidebar")!,
        "--kui-pane-inset-block-end",
      ),
      "a nested pane inherited the outer pane's reach",
    ).toBe(0);
  });

  /**
   * THE SCROLLER STILL BLEEDS PAST FLOATING CHROME (2026-08-30). The edge-bleed asks the DOM
   * "first child?", and a floating part is a DOM sibling that occupies no space — so under
   * plain `:first-child` the scroller stopped bleeding the moment chrome floated over it,
   * clipping rows at a hard line inside the very band the float exists to let them pass
   * through (the code block recorded this as a package gap, 2026-08-28). The question is
   * "first IN-FLOW child" now. Both halves read: the scroller's box reaches the pane's edges
   * (the bleed), and the first row rests where it always rested (the re-pad) — a bleed with
   * no re-pad is content against the wall. Falsified by reverting any of the four selectors
   * to the plain spelling.
   */
  it("a scroller bleeds past FLOATING chrome to the pane's edges, and still re-pads (§27)", () => {
    const shell = mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellSidebar aria-label="Primary">
          <ShellPaneHeader float>chrome</ShellPaneHeader>
          <ShellScroll>
            <Box data-testid="row">row</Box>
          </ShellScroll>
          <ShellPaneFooter float>chrome</ShellPaneFooter>
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const pane = within(shell, ".kui-shell-sidebar");
    const scroller = within(shell, ".kui-shell-scroll").getBoundingClientRect();
    const vp = within(shell, ".kui-scroll-viewport");
    const paneBox = pane.getBoundingClientRect();
    const border = parseFloat(computed(pane, "border-top-width"));
    expect(scroller.top - paneBox.top, "the top edge did not bleed past the floating header")
      .toBeCloseTo(border, 1);
    expect(paneBox.bottom - scroller.bottom, "the bottom edge did not bleed past the footer")
      .toBeCloseTo(border, 1);
    // The re-pad: the viewport insets by the pane's own padding, so resting content sits
    // exactly where an unbled pane would have put it.
    expect(parseFloat(computed(vp, "padding-block-start")), "the bleed lost its re-pad")
      .toBeGreaterThan(0);
    expect(parseFloat(computed(vp, "padding-block-end"))).toBeGreaterThan(0);
    // And an IN-FLOW sibling still blocks the bleed — the question is in-flow, not "skip
    // everything": a scroller under a pinned heading must not pull itself up past it.
    const pinned = mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellSidebar aria-label="Primary">
          <ShellPaneHeader data-testid="pinned">chrome</ShellPaneHeader>
          <ShellScroll>rows</ShellScroll>
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const pinnedHeader = within(pinned, "[data-testid='pinned']").getBoundingClientRect();
    expect(
      within(pinned, ".kui-shell-scroll").getBoundingClientRect().top,
      "the scroller bled past an IN-FLOW header",
    ).toBeGreaterThanOrEqual(pinnedHeader.bottom - 1);
  });

  /**
   * A FLOATING ROW CATCHES NOTHING BUT ITS CHILDREN (2026-08-30, found on the docs content
   * pane): the part spans the pane's inline axis and paints nothing, so a click in the empty
   * band must reach the content passing beneath, while the chrome inside it still takes its
   * own presses. Read by hit-test, because pointer-events is exactly the property a computed
   * read cannot prove the consequences of. Falsified by deleting the pointer-events pair —
   * the band then swallows the click.
   */
  it("a floating row's empty band passes the pointer through; its children keep theirs (§27)", () => {
    const shell = mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellContent style={{ position: "relative" }}>
          <ShellPaneHeader float>
            <Button data-testid="chrome">Chrome</Button>
            <Button>Other</Button>
          </ShellPaneHeader>
          <ShellScroll>
            <Box data-testid="under">content that passes beneath the band</Box>
          </ShellScroll>
        </ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const chrome = within(shell, "[data-testid='chrome']");
    const header = within(shell, ".kui-pane-header").getBoundingClientRect();
    // The empty half of the band: right of the one button, inside the row.
    const chromeBox = chrome.getBoundingClientRect();
    const hit = document.elementFromPoint(
      chromeBox.right + (header.right - chromeBox.right) / 2,
      chromeBox.top + chromeBox.height / 2,
    );
    expect(
      within(shell, ".kui-pane-header").contains(hit),
      "the empty band swallowed the click",
    ).toBe(false);
    // And the chrome itself still answers.
    const own = document.elementFromPoint(
      chromeBox.left + chromeBox.width / 2,
      chromeBox.top + chromeBox.height / 2,
    );
    expect(chrome.contains(own), "the chrome lost its own presses").toBe(true);
  });

  it("nothing floating, nothing published (§27)", () => {
    const shell = mountShell();
    const content = within(shell, ".kui-shell-content");
    for (const side of ["inline-start", "inline-end", "block-start", "block-end"] as const) {
      const box = insetProbe(content, side);
      expect(Math.max(box.w, box.h), `${side} claimed a reach in an all-flush frame`).toBe(0);
    }
  });

  it("a grounded content pays the gap only where nothing else does", () => {
    // RE-KEYED 2026-08-30 (this law used to assert the FULL gap on every side, halving being
    // the defect it guarded — and against a flush neighbour that spelling was the double-air
    // defect stated as a guarantee). The mixed regime now: the frame's edges pay nothing, so
    // the card pays there in full; the flush sidebar pays with its own padding, so the card
    // pays nothing across that boundary. One share everywhere, from two different pockets.
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
    expect(content.left - sidebar.right, "the flush pane's padding is the air").toBeCloseTo(0, 1);
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
    expect(onScreen(within(shell, ".kui-shell-scrim")), "the scrim is down").toBe(true);

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

  /* RE-KEYED TO THE BOTTOM PANE 2026-09-09 (§27). Every claim in this block is the
     covering-panel rule — a panel over the page HAS the page behind it, so it resolves the
     theme's glass whatever the call site said — and a SIDE pane stopped being that shape the
     day it started pushing the frame instead of covering it. A sheet from below still covers,
     so the block reads the sheet; the side pane's opposite guarantee (it states its own
     material, and an unmarked one is solid) is a law of its own in the push block above.
     Nothing about the mechanism moved: `usePaneDress` still hands the posture to the bottom
     pane and no longer hands it to the three side panes. */
  describe("a SHEET takes the material by construction (§10, §27, 2026-09-05, re-keyed 2026-09-09)", () => {
    // Kushagra: "like dialog or menu are always glass bc theyre above". Menu, Select, Popover,
    // Dialog and AlertDialog all hardcode `useMaterial({ backdrop: true })`, because a panel
    // over the page HAS the page behind it — §10's selectivity satisfied structurally rather
    // than by a claim. An overlaying pane is that shape, with the scrim under it exactly as a
    // dialog has (scrim z 1, pane z 2), so the shell answers for it and the app is not asked.
    //
    // EVERY FIXTURE HERE CARRIES A FLUSH SIDEBAR THAT STATES NOTHING, and it is not decoration:
    // without it these pass under a theme whose glass reaches every pane unconditionally,
    // which is the degenerate fixture this file has paid for three times. The control is the
    // half that says the mechanism is keyed on the DRAWER.

    // Falsified: with `overlaying` dropped from `usePaneDress`'s material call, the drawer
    // reads `expected undefined to be 'regular'` and the control still passes.
    it("an explicit overlay sheet resolves the theme's glass, having stated no backdrop", () => {
      const shell = mounted(
        <Shell style={{ height: 400 }}>
          <ShellRail aria-label="Sections">r</ShellRail>
          <ShellBottom presentation="overlay" defaultOpen>
            nav
          </ShellBottom>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: { material: "regular" }, select: ".kui-shell" },
      );
      expect(
        within(shell, ".kui-shell-bottom").dataset.material,
        "a pane over the content stayed solid — every other covering panel glasses",
      ).toBe("regular");
      expect(
        within(shell, ".kui-shell-rail").dataset.material,
        "a pane IN THE FRAME took glass it never asked for — the control, and the whole point",
      ).toBeUndefined();
      // Stamped is not painted. The lens joins on the same call, so read the chain too.
      expect(computed(within(shell, ".kui-shell-bottom"), "backdrop-filter")).toContain("blur");
    });

    // Falsified: same deletion fails here with `expected undefined to be 'regular'`. Kept
    // separate from the law above for the reason the drawer's DRESS laws are — the treatment
    // is written twice, and `auto` is the path every phone takes (2026-08-06's agreement
    // clause). This one also proves the resolution runs at all: `useWindowClass()` is null on
    // the server by design, so a drawer that never re-resolved would read solid forever.
    it("...and so does a phone's sheet, the resolved arm", async () => {
      await narrow();
      const shell = mounted(
        <Shell style={{ height: 600 }}>
          <ShellBottom defaultOpen>
            nav
          </ShellBottom>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: { material: "regular" }, select: ".kui-shell" },
      );
      const sheet = within(shell, ".kui-shell-bottom");
      expect(sheet.dataset.presentation, "resolved by CSS, not restamped").toBe("auto");
      await expect
        .poll(() => sheet.dataset.material, {
          timeout: 1000,
        })
        .toBe("regular");
      // The same pane, same props, on a roomy window: it is in the frame there and solid.
      await page.viewport(WIDE.width, WIDE.height);
      await expect.poll(() => sheet.dataset.material).toBeUndefined();
    });

    // Falsified: with the material call reading `backdrop` first, this fails at
    // `expected undefined to be 'regular'` — which is the shape a "let the app override it"
    // spelling would ship.
    it("and the app cannot ask for a solid sheet — Dialog's terms, taken whole", () => {
      const shell = mounted(
        <Shell style={{ height: 400 }}>
          <ShellBottom presentation="overlay" defaultOpen backdrop={false}>
            nav
          </ShellBottom>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: { material: "regular" }, select: ".kui-shell" },
      );
      expect(
        within(shell, ".kui-shell-bottom").dataset.material,
        "a stated `backdrop={false}` unmade a drawer's glass — you cannot ask for a solid menu",
      ).toBe("regular");
    });

    // Falsified: with GlassScope removed from the pane the Card reads `regular` rather than
    // `on-glass` — glass stacking on glass, which is what the scope exists to forbid.
    it("and it scopes its subtree, so nothing inside stacks a second pane of glass", () => {
      const shell = mounted(
        <Shell style={{ height: 400 }}>
          <ShellBottom presentation="overlay" defaultOpen>
            <Card>in the drawer</Card>
          </ShellBottom>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: { material: "regular" }, select: ".kui-shell" },
      );
      expect(within(shell, ".kui-card").dataset.material).toBe("on-glass");
    });

    // ADDED 2026-09-05, and the defect is what earned it (Kushagra, on the first drawer this
    // change made glass: "its still white, only when I remove this bg color do I see glass").
    // Every law above reads the STAMP, the filter and the scope, and all four were green over
    // a pane painting an opaque seal on top of all three — the 2026-08-03 lesson in a shape
    // this file had not met: not a law one indirection short of the computed value, but four
    // laws reading three of the four things that make glass and none of them the fill.
    //
    // The cause: `--kui-sf-fill` is the name a material declares its veil on, the flush rule
    // stood that same hook down, and the drawer exception handed it back with `initial` —
    // which is not silence but an instruction to fall through to `--kui-sf-fill-src`, the
    // opaque seal. Both are properties now.
    //
    // Falsified: with `--kui-sf-fill: initial` back in the drawer exception this reads
    // `expected "rgb(255, 255, 255)" not to be "rgb(255, 255, 255)"`, and the four laws above
    // stay green — which is the whole reason it exists.
    it("and the veil actually PAINTS — the sheet is not an opaque pane wearing a filter", () => {
      const glassDrawer = mounted(
        <Shell style={{ height: 400 }}>
          <ShellBottom presentation="overlay" defaultOpen>
            nav
          </ShellBottom>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: { material: "regular" }, select: ".kui-shell" },
      );
      // The reference is the SEAL a solid drawer paints in the same shell at the same size:
      // a translucent veil cannot be it, and reading against a literal would only pin today's
      // alpha rather than the guarantee.
      const solidDrawer = mounted(
        <Shell style={{ height: 400 }}>
          <ShellBottom presentation="overlay" defaultOpen>
            nav
          </ShellBottom>
          <ShellContent>c</ShellContent>
        </Shell>,
        { theme: {}, select: ".kui-shell" },
      );
      const painted = computed(within(glassDrawer, ".kui-shell-bottom"), "background-color");
      expect(
        painted,
        "a glass drawer painted the opaque seal over its own veil",
      ).not.toBe(computed(within(solidDrawer, ".kui-shell-bottom"), "background-color"));
      expect(painted, "the drawer's fill is opaque, so nothing behind it can be seen").toMatch(
        /^(rgba|color)\(/,
      );
      // And the solid drawer is unmoved by the repair, which is the control: the fill it gets
      // back is still a Card's, so the 2026-08-21 "a drawer has a surface" call stands.
      expect(computed(within(solidDrawer, ".kui-shell-bottom"), "background-color")).toBe(
        computed(mounted(<Card>c</Card>, { theme: {} }), "background-color"),
      );
    });
  });
});


describe("a floating band in the work area clears the frame's safe area (§27, §45, 2026-09-06)", () => {
  /* THE DEFECT: the content pane runs UNDER a floating sidebar, so a band pinned across its top
     starts at the window's edge and its first control sits beneath the column next door. Every
     consumer was closing that by hand with a margin on the band's first child. */
  /* `flush={false}` is what makes a pane FLOAT: the content stays flush (the default), so the
     sidebar lifts off and the work area runs underneath it. A tiled fixture is the negative
     control, and without it every assertion here passes on a shell that floats nothing. */
  const Frame = (props: { flush?: boolean }) => (
    <Shell style={{ height: 400, width: 900 }}>
      <ShellSidebar aria-label="Primary" flush={props.flush ?? false} defaultOpen>
        nav
      </ShellSidebar>
      <ShellContent>
        <ShellPaneHeader float>
          <button data-first type="button">
            Toggle
          </button>
        </ShellPaneHeader>
        <div>body</div>
      </ShellContent>
    </Shell>
  );

  it("the band's first control starts clear of a FLOATING sidebar", () => {
    const root = mounted(<Frame />, { theme: {}, select: ".kui-shell" });
    const sidebar = within(root, ".kui-shell-sidebar").getBoundingClientRect();
    const first = root.querySelector("[data-first]")!.getBoundingClientRect();
    expect(sidebar.width).toBeGreaterThan(0);
    expect(first.left).toBeGreaterThanOrEqual(sidebar.right);
  });

  it("and takes nothing extra when the panes tile — the reach is zero, so the spelling is one", () => {
    const floating = mounted(<Frame />, { theme: {}, select: ".kui-shell" });
    const flush = mounted(<Frame flush />, { theme: {}, select: ".kui-shell" });
    const padOf = (root: HTMLElement) =>
      parseFloat(computed(root.querySelector(".kui-pane-header")!, "padding-inline-start"));
    const surfacePad = parseFloat(
      tokenOn(flush.querySelector(".kui-shell-content")!, "--kui-sf-p"),
    );
    expect(padOf(flush)).toBeCloseTo(surfacePad, 1);
    expect(padOf(floating)).toBeGreaterThan(padOf(flush));
  });

  it("the reach is the WORK AREA's — a sidebar resolves none of it, so its own band cannot move", () => {
    /* Stated against the variable rather than against the padding, because that is where the
       guarantee lives: `--kui-shell-inset-*` is declared on `.kui-shell-content` alone, so a
       sidebar's band would take nothing even from a blanket rule. Reading the padding here
       would have been a law nothing could break — the selector on the rule above is belt and
       braces, and this is the brace that can actually fail. */
    const root = mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellSidebar aria-label="Primary" flush={false} defaultOpen>
          <ShellPaneHeader float>
            <button data-nav type="button">
              New
            </button>
          </ShellPaneHeader>
          <div>rows</div>
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const reachOn = (sel: string) =>
      parseFloat(tokenOn(root.querySelector(sel)!, "--kui-shell-inset-inline-start"));
    expect(reachOn(".kui-shell-content")).toBeGreaterThan(0);
    expect(reachOn(".kui-shell-sidebar")).toBe(0);
  });
});


describe("a pane's chrome takes the pane's index; its content does not (§27, §28, 2026-09-06)", () => {
  /* THE DEFECT: a size-3 sidebar opened with a size-2 button in its own header, because the
     pane's index ran through a context only the shell's own vocabulary reads. The boundary is
     chrome against content — a band is the frame talking, a scroller is the app's. */
  const Frame = () => (
    <Shell style={{ height: 400, width: 900 }}>
      <ShellSidebar aria-label="Primary" size="3" defaultOpen>
        <ShellPaneHeader>
          <Button data-chrome>Search</Button>
        </ShellPaneHeader>
        <ShellScroll>
          <Button data-content>In the page</Button>
        </ShellScroll>
      </ShellSidebar>
      <ShellContent>c</ShellContent>
    </Shell>
  );

  it("a control in the band stands at the PANE's index", () => {
    const root = mounted(<Frame />, { theme: {}, select: ".kui-shell" });
    const three = mounted(<Button size="3">Search</Button>, { theme: {} });
    expect(
      root.querySelector("[data-chrome]")!.getBoundingClientRect().height,
    ).toBeCloseTo(three.getBoundingClientRect().height, 1);
  });

  it("and a control in the SCROLLER does not — a page's own controls are the app's", () => {
    const root = mounted(<Frame />, { theme: {}, select: ".kui-shell" });
    const two = mounted(<Button>In the page</Button>, { theme: {} });
    expect(
      root.querySelector("[data-content]")!.getBoundingClientRect().height,
    ).toBeCloseTo(two.getBoundingClientRect().height, 1);
    // The two Buttons are in ONE pane and must differ, which is the half a same-index fixture
    // could never see.
    expect(root.querySelector("[data-content]")!.getBoundingClientRect().height).not.toBeCloseTo(
      root.querySelector("[data-chrome]")!.getBoundingClientRect().height,
      1,
    );
  });

  it("an explicit prop still wins inside a band — the unit layer's ordinary third rung", () => {
    const root = mounted(
      <Shell style={{ height: 400, width: 900 }}>
        <ShellSidebar aria-label="Primary" size="3" defaultOpen>
          <ShellPaneHeader>
            <Button data-chrome size="1">
              Search
            </Button>
          </ShellPaneHeader>
        </ShellSidebar>
        <ShellContent>c</ShellContent>
      </Shell>,
      { theme: {}, select: ".kui-shell" },
    );
    const one = mounted(<Button size="1">Search</Button>, { theme: {} });
    expect(
      root.querySelector("[data-chrome]")!.getBoundingClientRect().height,
    ).toBeCloseTo(one.getBoundingClientRect().height, 1);
  });
});


describe("a band follows the TOOLBAR in it, and the reach says so (§27, §45, 2026-09-06)", () => {
  /* THE DEFECT: the published safe area is a DERIVATION — one control row at the pane's index —
     which is what keeps first paint right with no script, and a `Toolbar` stating its own index
     broke the sentence underneath it. Measured before the repair: an 88px band over a 64px
     reach, so a page cleared 24px less than the bar it was clearing. */
  const Frame = (props: { size?: Size; footer?: boolean }) => (
    <Shell style={{ height: 400, width: 900 }}>
      <ShellContent>
        <ShellPaneHeader float>
          <Toolbar {...(props.size ? { size: props.size } : {})}>
            <ToolbarButton>One</ToolbarButton>
          </Toolbar>
        </ShellPaneHeader>
        <div>body</div>
        {props.footer ? (
          <ShellPaneFooter float>
            <Toolbar size="1">
              <ToolbarButton>Two</ToolbarButton>
            </Toolbar>
          </ShellPaneFooter>
        ) : null}
      </ShellContent>
    </Shell>
  );

  it("the reach equals the band it is published for, at the toolbar's index", () => {
    const root = mounted(<Frame size="4" />, { theme: {}, select: ".kui-shell" });
    const band = root.querySelector(".kui-pane-header")!.getBoundingClientRect();
    const reach = parseFloat(
      tokenOn(root.querySelector(".kui-shell-content")!, "--kui-pane-inset-block-start"),
    );
    expect(band.height).toBeCloseTo(reach, 1);
  });

  it("a band that states nothing is unchanged — the pane's own row still answers", () => {
    const stated = mounted(<Frame size="4" />, { theme: {}, select: ".kui-shell" });
    const plain = mounted(<Frame />, { theme: {}, select: ".kui-shell" });
    const reachOf = (root: HTMLElement) =>
      parseFloat(tokenOn(root.querySelector(".kui-shell-content")!, "--kui-pane-inset-block-start"));
    expect(reachOf(plain)).toBeLessThan(reachOf(stated));
    expect(reachOf(plain)).toBeCloseTo(
      plain.querySelector(".kui-pane-header")!.getBoundingClientRect().height,
      1,
    );
  });

  it("the two ends are two facts — a tall header does not lend its row to a short footer", () => {
    /* One name for both would have handed the footer the header's row. The fixture is deliberately
       LOPSIDED (a size-4 header over a size-1 footer), which is where one name and two disagree. */
    const root = mounted(<Frame size="4" footer />, { theme: {}, select: ".kui-shell" });
    const pane = root.querySelector(".kui-shell-content")!;
    const start = parseFloat(tokenOn(pane, "--kui-pane-inset-block-start"));
    const end = parseFloat(tokenOn(pane, "--kui-pane-inset-block-end"));
    expect(start).toBeGreaterThan(end);
    expect(end).toBeCloseTo(
      root.querySelector(".kui-pane-footer")!.getBoundingClientRect().height,
      1,
    );
  });
});


describe("the scroller fades across the band it passes under (§27, 2026-09-06)", () => {
  /* The pane's own comment has claimed since 2026-08-29 that the fade is what keeps the passing
     content legible, and it was not: 32px of designed fade against a band up to 88px deep, so
     the lower two thirds of a floating row had full-strength text behind it. */
  const Frame = (props: { float?: boolean }) => (
    <Shell style={{ height: 400, width: 900 }}>
      <ShellContent>
        <ShellPaneHeader {...(props.float ? { float: true } : {})}>
          <button type="button">Toggle</button>
        </ShellPaneHeader>
        <ShellScroll fade>
          <div style={{ blockSize: "2000px" }}>body</div>
        </ShellScroll>
      </ShellContent>
    </Shell>
  );

  it("a floating band hands its reach to the scroller", () => {
    const root = mounted(<Frame float />, { theme: {}, select: ".kui-shell" });
    const pane = root.querySelector(".kui-shell-content")!;
    const scroller = root.querySelector(".kui-shell-scroll")!;
    expect(parseFloat(tokenOn(scroller, "--kui-sa-fade-start"))).toBeCloseTo(
      parseFloat(tokenOn(pane, "--kui-pane-inset-block-start")),
      1,
    );
  });

  it("and the fade it hands over is the whole band, not the designed 32", () => {
    const root = mounted(<Frame float />, { theme: {}, select: ".kui-shell" });
    const scroller = root.querySelector(".kui-shell-scroll")!;
    expect(parseFloat(tokenOn(scroller, "--kui-sa-fade-start"))).toBeGreaterThan(
      parseFloat(tokenOn(scroller, "--scrollbar-fade")),
    );
  });
});

/**
 * THE TAB BAR (§27, 2026-09-09, Kushagra: "iOS also uses tabbar… rail becomes bar on its own…
 * if it has sidebar only, sidebar becomes tab, caller declares a list suitable for tabbar").
 *
 * A rail meets a narrow window as a floating bar across the bottom, its own items carried
 * across; `ShellTabBar` is the bar-only posture, for an app with no rail that wants tabs. The
 * sidebar is untouched by all of it — it is the push drawer at every width, which is what makes
 * the bar the COARSE level and the drawer the fine one rather than two answers to one question.
 */
describe("a rail meets a narrow window as a tab bar (§27, 2026-09-09)", () => {
  const bars = (props?: { only?: boolean; backdrop?: boolean }) =>
    mounted(
      <Shell style={{ height: 600 }}>
        <ShellHeader>
          <ShellTrigger target="sidebar" data-testid="trigger">
            menu
          </ShellTrigger>
        </ShellHeader>
        {props?.only ? (
          <ShellTabBar aria-label="Sections" flush={false} {...(props?.backdrop ? { backdrop: true } : {})}>
            <ShellRailList>
              <ShellRailItem label="One" current render={<a href="#one" />}>
                <svg viewBox="0 0 16 16" />
              </ShellRailItem>
              <ShellRailItem label="Two" render={<a href="#two" />}>
                <svg viewBox="0 0 16 16" />
              </ShellRailItem>
              <ShellRailItem label="Responsiveness" render={<a href="#three" />}>
                <svg viewBox="0 0 16 16" />
              </ShellRailItem>
            </ShellRailList>
            <ShellRailItem label="Search">
              <svg viewBox="0 0 16 16" />
            </ShellRailItem>
          </ShellTabBar>
        ) : (
          <ShellRail aria-label="Sections" flush={false}>
            <ShellRailList>
              <ShellRailItem label="One" current>
                <svg viewBox="0 0 16 16" />
              </ShellRailItem>
              <ShellRailItem label="Two">
                <svg viewBox="0 0 16 16" />
              </ShellRailItem>
            </ShellRailList>
          </ShellRail>
        )}
        <ShellSidebar aria-label="Primary">sidebar</ShellSidebar>
        <ShellContent>
          <ShellScroll>content</ShellScroll>
        </ShellContent>
      </Shell>,
      { theme: props?.backdrop ? { material: "regular" } : {}, select: ".kui-shell" },
    );

  /**
   * THE TWO POSTURES DIFFER ONLY ON A WIDE WINDOW, which is the whole of the API: `auto` is a
   * rail there, `bar` is nothing there, and both are the bar on a phone. Read as the pane's own
   * box, because "is this a rail or a bar" is a question about where it sits and how wide it is,
   * and a token or an attribute would answer neither.
   *
   * Falsified: dropping `.kui-shell-rail[data-bar="only"] { display: none }` fails the wide half
   * at `expected 64 to be 0` — a rail nobody asked for, holding tab labels sideways.
   */
  it("bar-only renders nothing on a wide window; a rail renders a rail", () => {
    const only = bars({ only: true });
    expect(
      within(only, ".kui-shell-rail").getBoundingClientRect().width,
      "a bar-only rail took room on a wide window",
    ).toBe(0);
    only.remove();

    const rail = bars();
    const box = within(rail, ".kui-shell-rail").getBoundingClientRect();
    expect(box.width, "the rail vanished on a wide window").toBeGreaterThan(0);
    expect(box.height, "a rail is a column, not a row").toBeGreaterThan(box.width);
  });

  /**
   * ON A PHONE IT IS A BAR: across the bottom, inside the window, above the safe area, and out
   * of the frame's flow. Both postures, because `auto` and `bar` are one bar and the day they
   * diverge is the day this file records forgetting the resolved arm again.
   *
   * Falsified: deleting `position: absolute` from the bar arm fails at
   * `expected 'static' to be 'absolute'`, with the bar back in the rail's grid column.
   */
  for (const only of [true, false] as const) {
    it(`on a phone the ${only ? "bar-only" : "auto"} rail is a row across the bottom`, async () => {
      await narrow();
      const shell = bars({ only });
      const bar = within(shell, ".kui-shell-rail");
      expect(computed(bar, "position")).toBe("absolute");
      const box = bar.getBoundingClientRect();
      const frame = shell.getBoundingClientRect();
      expect(box.width, "a bar is a row, not a column").toBeGreaterThan(box.height);
      expect(box.width, "the bar reached past the window").toBeLessThanOrEqual(frame.width);
      expect(box.left, "the bar is inset from the leading wall").toBeGreaterThan(frame.left);
      expect(frame.bottom - box.bottom, "the bar sits above the window's floor").toBeGreaterThan(0);
      expect(box.bottom, "the bar is not at the top").toBeGreaterThan(frame.top + frame.height / 2);
    });
  }

  /**
   * EVERY SEAT TAKES THE SAME SPACE, the detached search seat included (Kushagra: "each item
   * should take same space"). The list is `display: contents` in this posture for exactly this
   * reason: with the list as one flex item and the seat as another, the two split the bar in
   * half and the tabs shared what was left.
   *
   * Falsified: giving the list back `flex: 1 1 0` fails at
   * `expected [ 62, 62, 62, 187 ] to have every seat within 1px of the first`.
   */
  it("every seat takes the same space, the search seat included", async () => {
    await narrow();
    const shell = bars({ only: true });
    const widths = [...shell.querySelectorAll<HTMLElement>(".kui-shell-rail-item")].map(
      (seat) => seat.getBoundingClientRect().width,
    );
    expect(widths.length, "the seats are not where this law thinks").toBe(4);
    for (const w of widths) expect(w, `seats: ${widths.map(Math.round).join("/")}`).toBeCloseTo(widths[0]!, 0);
  });

  /**
   * A BAR NEVER SCROLLS (Kushagra: "I can even move the bar freely in any direction inside that
   * shell bar"). The pane's own `overflow: auto` made it one: the rail item's press expander
   * reaches one pane padding past each side, which is right for a rail and 40px of overflow
   * here, and the pane obligingly grew a scroll range for it.
   *
   * TWO HALVES, AND THE SABOTAGE PASS IS WHY. Restoring `overflow: auto` alone changes nothing
   * measurable, because the repair came in two parts and the other part — the expander scoped
   * back inside its seat — also removes the overflow; so the outcome is guaranteed twice and the
   * measured half cannot see the pane's own `auto` reaching a bar again. The mechanism is read
   * as well: a bar is the one pane in the family that must not be a scroll container, and its
   * base rule says `auto` because a nav column has to scroll.
   *
   * Falsified: `overflow: auto` fails the first half; putting the expander's `inset: 0` back to
   * the rail's `inset-inline: calc(-1 * var(--kui-sf-p))` fails the second at
   * `expected 414 to be 374`.
   */
  it("a bar is not a scroll container, and has no scroll range", async () => {
    await narrow();
    const shell = bars({ only: true });
    const bar = within(shell, ".kui-shell-rail");
    expect(computed(bar, "overflow-x"), "the bar can scroll sideways").toBe("clip");
    expect(computed(bar, "overflow-y"), "the bar can scroll").toBe("clip");
    expect(bar.scrollWidth, "something inside the bar overflows it sideways").toBe(bar.clientWidth);
    expect(bar.scrollHeight, "something inside the bar overflows it").toBe(bar.clientHeight);
  });

  /**
   * ONE THUMB WIDTH, WHEREVER IT LANDS (Kushagra: "thumb should always take the same width, but
   * it can take a larger width than a simple grid calc will allow"). It is measured from the
   * WIDEST label in the bar rather than the current one, so it does not resize as it flies; and
   * being out of flow it may be wider than a seat's share, which is what lets the seats stay
   * equal and the words keep their ellipsis unchanged.
   *
   * The fixture's labels differ in length on purpose: with equal words this law could not tell a
   * per-current measurement from a per-bar one, which is the degenerate-fixture rule.
   *
   * Falsified: measuring the CURRENT label instead fails at `expected 39.1 to be close to 55.9`.
   */
  it("the thumb is one width on every tab, and it may be wider than a seat", async () => {
    /* AT 320px, WHICH IS THE WIDTH THE OVEREXTENSION EXISTS FOR — and the calibration this law
       needs. The thumb is `max(seat, widest word + air)`, so on a roomier window the seat floor
       dominates and a per-current measurement and a per-bar one give the same answer: the
       sabotage that swapped them passed at 375px. The share has to be narrower than the longest
       word for the two to be distinguishable at all. */
    await page.viewport(320, 700);
    const shell = bars({ only: true });
    const thumb = within(shell, ".kui-shell-rail-thumb");
    const seats = [...shell.querySelectorAll<HTMLElement>(".kui-shell-rail-item")];
    await expect.poll(() => thumb.hidden).toBe(false);
    /* AN INTERIOR SEAT FOR THE CENTRE, because at an END seat the bar's padding is a WALL the
       overextension squashes against (the segmented control's own rule, one component over), so
       the centre legitimately moves inward there — measured 2px on the first seat. Both claims
       are real; asserting them on one seat would make each the other's excuse. */
    seats[0]!.removeAttribute("aria-current");
    seats[1]!.setAttribute("aria-current", "page");
    await expect.poll(() => seats[1]!.getAttribute("aria-current")).toBe("page");
    const first = thumb.getBoundingClientRect();
    expect(first.width, "the thumb is not on the current seat").toBeGreaterThan(0);
    const seat = seats[1]!.getBoundingClientRect();
    expect((first.left + first.right) / 2, "the thumb is off its seat's centre").toBeCloseTo(
      (seat.left + seat.right) / 2,
      0,
    );

    /* THE WIDTH IS THE WIDEST WORD'S, AND THE CURRENT SEAT'S IS THE SHORTEST — which is what
       makes the two measurements distinguishable at all. The first spelling moved the choice
       from "One" to "Two" and asserted the width held: two three-letter words, so a per-current
       measurement and a per-bar one give the same answer and the sabotage that swapped them
       changed nothing (the degenerate-fixture rule, caught by its own falsification run). */
    /* THE TEXT'S OWN WIDTH, through a Range — `scrollWidth` reports the BOX whenever the word
       fits it, so on a bar whose labels all fit it answers the same number for every seat and
       this law's calibration below could not fail. */
    const words = [...shell.querySelectorAll<HTMLElement>(".kui-shell-rail-label")].map((label) => {
      const range = document.createRange();
      range.selectNodeContents(label);
      return range.getBoundingClientRect().width;
    });
    const widest = Math.max(...words);
    expect(widest, "every label is the same width, so this law cannot tell the two apart").
      toBeGreaterThan(Math.min(...words) + 4);
    expect(first.width, "the thumb is too narrow to host the bar's longest word").
      toBeGreaterThanOrEqual(widest);

    // And it does not resize when the choice moves to the seat that owns that longest word.
    const longest = seats[words.indexOf(widest)]!;
    seats[1]!.removeAttribute("aria-current");
    longest.setAttribute("aria-current", "page");
    await expect
      .poll(() => Math.round(thumb.getBoundingClientRect().left))
      .not.toBe(Math.round(first.left));
    expect(thumb.getBoundingClientRect().width, "the thumb resized as it flew").toBeCloseTo(
      first.width,
      1,
    );
  });

  /**
   * THE BAR'S PADDING IS A WALL (§26's own rule, one component over): an overextending thumb on
   * an end seat spends the overhang as a squash against the wall rather than escaping the bar,
   * so it never paints outside the pane it belongs to.
   *
   * Falsified: dropping the `max(…, var(--layout-space-2))` floor from either inset fails at
   * `expected -6 to be greater than or equal to 4` — the thumb hanging past the capsule's end.
   */
  it("an overextending thumb squashes against the bar's wall rather than escaping it", async () => {
    await page.viewport(320, 700);
    const shell = bars({ only: true });
    const thumb = within(shell, ".kui-shell-rail-thumb");
    const bar = within(shell, ".kui-shell-rail");
    await expect.poll(() => thumb.hidden).toBe(false);
    const seats = [...shell.querySelectorAll<HTMLElement>(".kui-shell-rail-item")];
    const pad = parseFloat(computed(bar, "padding-left"));
    for (const index of [0, seats.length - 1]) {
      for (const seat of seats) seat.removeAttribute("aria-current");
      seats[index]!.setAttribute("aria-current", "page");
      await expect.poll(() => seats[index]!.getAttribute("aria-current")).toBe("page");
      const box = thumb.getBoundingClientRect();
      const frame = bar.getBoundingClientRect();
      expect(box.left - frame.left, `seat ${index} escaped the leading wall`).toBeGreaterThanOrEqual(
        pad - 0.5,
      );
      expect(frame.right - box.right, `seat ${index} escaped the trailing wall`).toBeGreaterThanOrEqual(
        pad - 0.5,
      );
    }
  });

  /**
   * AND NOTHING ABOUT A SEAT CHANGES WHEN IT BECOMES CURRENT (Kushagra: "I dont want layout
   * shift like removal of ellipsis when thumb comes on it"). Read as the seat's box AND its
   * label's clipping, because the shift that shipped was the label losing its ellipsis: a
   * `max-content` current label is the same width in layout terms and a different thing on
   * screen, so a box-only law could not see it.
   *
   * Falsified: restoring `inline-size: max-content; overflow: visible` on the current label
   * fails at `expected false to be true` — the word stops being clipped the moment it is chosen.
   */
  it("becoming current changes neither a seat's box nor its label's clipping", async () => {
    await narrow();
    const shell = bars({ only: true });
    const seats = [...shell.querySelectorAll<HTMLElement>(".kui-shell-rail-item")];
    const read = (seat: HTMLElement) => {
      const label = seat.querySelector<HTMLElement>(".kui-shell-rail-label")!;
      return {
        width: Math.round(seat.getBoundingClientRect().width),
        clipped: label.scrollWidth > label.clientWidth + 0.5,
        labelWidth: Math.round(label.getBoundingClientRect().width),
      };
    };
    const before = read(seats[1]!);
    seats[0]!.removeAttribute("aria-current");
    seats[1]!.setAttribute("aria-current", "page");
    await expect.poll(() => seats[1]!.getAttribute("aria-current")).toBe("page");
    expect(read(seats[1]!)).toEqual(before);
  });

  /**
   * THE THUMB PAINTS IN THE PANE'S CURRENCY (§10 clause 5, Kushagra: "why is selected thing not
   * see through like it is on menu?"). It rested on `--tone-soft`, which a glass pane re-points
   * to its opaque twin for every descendant — the 2026-08-24 finding — so the bar's own veil had
   * nothing to mix it back down and the chosen tab painted solid on a translucent bar. Read as
   * an ALPHA rather than a token name, because that is the half a name cannot see.
   *
   * Falsified: dropping the shared layer's glass arm fails at `expected 1 to be less than 1`.
   */
  it("on glass the thumb is see-through, and on a solid bar it still paints", async () => {
    await narrow();
    const glass = bars({ only: true, backdrop: true });
    /* CALIBRATED, because the obvious instrument is wrong here and this repo has the scar twice
       (2026-08-08 and 2026-08-24): a bare `[\d.]+` sweep over `color(display-p3 0.94 0.94 0.95)`
       takes the *3 in display-p3* as a channel, reports four numbers, and calls a fully opaque
       fill 0.947 transparent. Written by its own author for a third time here, and caught by
       this law's falsification run rather than by reading it. */
    const alpha = (value: string) => {
      const slashed = /\/\s*([\d.]+%?)\s*\)/.exec(value);
      if (slashed) {
        const raw = slashed[1]!;
        return raw.endsWith("%") ? parseFloat(raw) / 100 : Number(raw);
      }
      const rgba = /^rgba?\(([^)]*)\)/.exec(value);
      if (rgba) {
        const parts = rgba[1]!.split(/[,\s/]+/).filter(Boolean);
        return parts.length > 3 ? Number(parts[3]) : 1;
      }
      // A `color()` with no slash states no alpha, which means opaque.
      return 1;
    };
    expect(alpha("color(display-p3 0.944 0.945 0.947)"), "the reader miscounts a colour space").toBe(1);
    expect(alpha("rgba(0, 0, 0, 0.1)"), "the reader cannot read an alpha it is given").toBe(0.1);
    expect(alpha("color(display-p3 1 1 1 / 0.26)"), "the reader cannot read a slashed alpha").toBe(0.26);
    expect(within(glass, ".kui-shell-rail").dataset.material, "the bar is not glass here").toBe(
      "regular",
    );
    expect(
      alpha(computed(within(glass, ".kui-shell-rail-thumb"), "background-color")),
      "an opaque grip on a glass bar",
    ).toBeLessThan(1);
    glass.remove();

    const solid = bars({ only: true });
    expect(
      computed(within(solid, ".kui-shell-rail-thumb"), "background-color"),
      "a solid bar's grip paints nothing",
    ).not.toBe("rgba(0, 0, 0, 0)");
  });

  /**
   * THE BAR PUBLISHES ITS REACH, so the work area scrolls under it and anything the app puts at
   * the bottom of the work area sits above it. Published on the CONTENT pane rather than the
   * root, and that is not a spelling: `--kui-shell-row` lives on the panes, so the first
   * spelling — on the root, where the row is empty — computed the whole length to its 0px
   * initial with every other law green.
   *
   * Falsified: moving the declaration back to `.kui-shell:has(…)` fails at
   * `expected 0 to be greater than 40`.
   */
  it("the bar publishes its reach, and the work area's scroller spends it", async () => {
    await narrow();
    const shell = bars({ only: true });
    const content = within(shell, ".kui-shell-content");
    // Through the width probe: `numberOn` resolves a token through `opacity`, which clamps a
    // length to 1 — a reading that looks like a number and is not one.
    const reach = parseFloat(tokenOn(content, "--kui-shell-inset-block-end"));
    const bar = within(shell, ".kui-shell-rail").getBoundingClientRect();
    expect(reach, "the bar published nothing").toBeGreaterThan(40);
    expect(reach, "the reach must clear the bar it is derived from").toBeGreaterThanOrEqual(
      bar.height,
    );
    const viewport = within(shell, ".kui-scroll-viewport");
    expect(
      parseFloat(computed(viewport, "padding-bottom")),
      "the last line of a page would sit under the bar",
    ).toBeGreaterThanOrEqual(reach);
  });

  /**
   * AND THE BAR RIDES THE PUSH. It is a pane, so it would sit still while the frame slid out
   * from under it unless it were one of the children the push moves — which is why the push's
   * exclusion names the two DRAWER postures rather than the rail as such.
   *
   * Falsified: excluding `.kui-shell-rail` outright from the push fails at
   * `expected 0 to be close to 296` — a bar left behind under a pushed page.
   */
  it("an open drawer pushes the bar with the content", async () => {
    await narrow();
    const shell = bars({ only: true });
    const bar = within(shell, ".kui-shell-rail");
    const before = bar.getBoundingClientRect().left;
    await userEvent.click(within(shell, ".kui-shell-header button"));
    await expect.poll(() => within(shell, ".kui-shell-sidebar").dataset.state).toBe("open");
    const content = within(shell, ".kui-shell-content");
    await expect
      .poll(() => Math.round(content.getBoundingClientRect().left))
      .toBeGreaterThan(10);
    expect(
      bar.getBoundingClientRect().left - before,
      "the bar did not travel with the page",
    ).toBeCloseTo(content.getBoundingClientRect().left, 0);
  });
});
