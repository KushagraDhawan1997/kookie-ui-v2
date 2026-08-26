/**
 * Tabs' laws, mounted (§7, §8, §11, §15, §26).
 *
 * The control machinery is asserted cell by cell in button.browser.test.tsx; what is asserted
 * here is what is TABS': the bar's hairline and where it takes its colour from, the ink ladder
 * used as a selection state, the rule's thickness and the box it lands on, the two edges it is
 * drawn by, and the pane it deliberately is not. Computed values through a mounted component,
 * both appearances — the 2026-08-03 bar — and every law below was made to fail against a
 * deliberately broken value before it was trusted (the 2026-08-05 addendum).
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import * as React from "react";

import {
  APPEARANCES,
  POINTERS,
  SIZES,
  colorOn,
  computed,
  inMotion,
  mounted,
  numberOn,
  render,
  tokenOn,
  until,
  within,
} from "../../test/browser.tsx";
import { Theme } from "../../theme/theme.tsx";
import { Button } from "../button/button.tsx";
import { SegmentedControl, SegmentedItem } from "../segmented-control/segmented-control.tsx";
import { Separator } from "../separator/separator.tsx";
import { Tabs, TabsList, TabsPanel, TabsTab } from "./tabs.tsx";

const px = (v: string) => parseFloat(v);

function bar(size: "1" | "2" | "3" | "4" = "2", theme = {}) {
  return mounted(
    <Tabs defaultValue="a">
      <TabsList size={size}>
        <TabsTab value="a">Overview</TabsTab>
        <TabsTab value="b">Projects</TabsTab>
      </TabsList>
      <TabsPanel value="a">first</TabsPanel>
      <TabsPanel value="b">second</TabsPanel>
    </Tabs>,
    { theme },
  );
}

const listOf = (root: Element) => within(root, ".kui-tabs-list");
const tabsOf = (root: Element) => [...root.querySelectorAll<HTMLElement>(".kui-tab")];
const ruleOf = (root: Element) => within(root, ".kui-tab-rule");

describe("a tab is a control on the height ladder (§4, §26)", () => {
  for (const pointer of POINTERS) {
    it(`${pointer}: every tab stands at --control-height-N, LESS the bar's inset`, () => {
      /* The ladder claim, re-keyed 2026-08-23 rather than dropped. It read `--control-height-N`
         exactly, which was the shipped behaviour and the defect: a tab at the full cell height
         ends on the hairline, so a hovered tab's fill ran into the line (Kushagra, from the
         playground — "28px instead of 32"). What the ladder actually governs is the BAR, which
         still stands level with the controls in its row; the tab is inset inside it.
    
         Kept per pointer world and per size, which is the half worth keeping: the inset is one
         constant and the cells are not, so this is where a coarse cell forgetting the ladder
         would still show. The bar's own half of the claim is asserted against a mounted Button
         further down this file, where it belongs. */
      for (const size of SIZES) {
        const root = bar(size, { pointer });
        const cell = px(tokenOn(root, `--control-height-${size}`));
        const inset = px(tokenOn(root, "--tab-inset"));
        for (const tab of tabsOf(root)) {
          expect(px(computed(tab, "min-height")), `${pointer}/${size}`).toBe(cell - 2 * inset);
        }
      }
    });
  }

  it("the index is stamped once, on the list — a tab never carries its own", () => {
    // Menu's reversal, inherited (2026-08-09): a bar of tabs at mixed sizes is not a thing
    // anyone means, and asking every tab to repeat the index invites them to disagree. The
    // join keys [data-size] per ELEMENT, so the tabs must still carry the attribute — what
    // the API refuses is the chance to give them different ones.
    const root = bar("3");
    expect(listOf(root).getAttribute("data-size")).toBe("3");
    for (const tab of tabsOf(root)) expect(tab.getAttribute("data-size")).toBe("3");
  });
});

describe("the bar's hairline is the quiet no-family edge (§7, §11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: it resolves the SAME colour a Separator does`, () => {
      // §7's edge order, on the component whose whole bar is one: the line under a tab bar
      // and the line between two things are the same object, so they must not drift apart.
      // Asserted as an agreement between two mounted components rather than against a token
      // name, which is the indirection the 2026-08-03 lesson is about.
      const root = bar("2", { appearance });
      const rule = mounted(<Separator />, { theme: { appearance } });
      expect(computed(listOf(root), "border-block-end-color")).toBe(
        computed(rule, "background-color"),
      );
    });

    it(`${appearance}: and it is NOT the solved control edge — a rule is not a small surface`, () => {
      const root = bar("2", { appearance });
      expect(computed(listOf(root), "border-block-end-color")).not.toBe(
        colorOn(root, "var(--control-edge)"),
      );
    });
  }
});

describe("the active tab is marked by INK, not by loudness (§15, §26)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: active reads the full ink, inactive the muted one, and they differ`, () => {
      const root = bar("2", { appearance });
      const [active, inactive] = tabsOf(root);
      expect(active!.getAttribute("data-active")).not.toBeNull();
      expect(inactive!.getAttribute("data-active")).toBeNull();
      expect(computed(active!, "color")).toBe(colorOn(root, "var(--color-text)"));
      expect(computed(inactive!, "color")).toBe(colorOn(root, "var(--color-text-muted)"));
      // The vacuity guard the audits keep earning: if the two ink roles ever resolved to one
      // colour the pair above would pass while the bar said nothing.
      expect(computed(active!, "color")).not.toBe(computed(inactive!, "color"));
    });

    it(`${appearance}: and neither tab paints a fill — quiet is bare at rest`, () => {
      const root = bar("2", { appearance });
      for (const tab of tabsOf(root)) {
        expect(computed(tab, "background-color")).toBe("rgba(0, 0, 0, 0)");
      }
    });

    it(`${appearance}: the active tab is not heavier — a bar must not reflow when it changes`, () => {
      const root = bar("2", { appearance });
      const [active, inactive] = tabsOf(root);
      expect(computed(active!, "font-weight")).toBe(computed(inactive!, "font-weight"));
    });
  }
});

describe("the rule (§26)", () => {
  it("is --tab-rule thick, at every size — one designed value, no index", () => {
    for (const size of SIZES) {
      const root = bar(size);
      expect(px(computed(ruleOf(root), "height")), size).toBe(px(tokenOn(root, "--tab-rule")));
    }
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: it paints the accent GLYPH — the floor a 2px mark owes`, () => {
      // --accent-glyph since 2026-08-23, and the swap is a dark-mode repair. The rule is fine
      // detail, so it owes `apcaFloors.nonText`; the solid is ONE hex in both appearances and
      // measured |Lc| 43.4 on dark's page, under that floor. The glyph is the floor solved per
      // mode at the family's full chroma — in light it lands within a hair of the solid
      // (#0095fe vs #0094fc), so nothing visible moved there.
      const root = bar("2", { appearance });
      expect(computed(ruleOf(root), "background-color")).toBe(colorOn(root, "var(--accent-glyph)"));
      // In DARK the two genuinely differ, which is what makes this law fail on a revert rather
      // than pass on a coincidence. Light is deliberately not asserted apart: there the solve
      // lands beside the solid, and demanding a difference would pin an accident.
      if (appearance === "dark") {
        expect(
          computed(ruleOf(root), "background-color"),
          "the rule went back to the solid",
        ).not.toBe(colorOn(root, "var(--accent-solid)"));
      }
    });
  }

  it("lands on the ACTIVE tab's box, not on the bar", async () => {
    // The measurement Base UI publishes, read back off the paint: the rule's box must be the
    // active tab's box. Asserted against the SECOND tab too, because a rule pinned at the
    // start of the bar satisfies the first half for the wrong reason — and the two tabs are
    // labelled to different widths on purpose, so "it moved" and "it resized" are separable.
    const root = bar("2");
    const [first, second] = tabsOf(root);
    const rule = ruleOf(root);
    const originLeft = () => listOf(root).getBoundingClientRect().left;

    expect(rule.getBoundingClientRect().width).toBeCloseTo(
      first!.getBoundingClientRect().width,
      0,
    );
    expect(rule.getBoundingClientRect().left - originLeft()).toBeCloseTo(
      first!.getBoundingClientRect().left - originLeft(),
      0,
    );

    // Selection is React state, so the re-measure lands on a later frame than the click. The
    // wait is for the rule to LEAVE, which is a coarse fact; the assertions after it are the
    // exact ones, so this does not wait for the thing it is about to assert.
    const startedAt = rule.getBoundingClientRect().left;
    second!.click();
    await until(() => rule.getBoundingClientRect().left !== startedAt);

    expect(rule.getBoundingClientRect().width).toBeCloseTo(
      second!.getBoundingClientRect().width,
      0,
    );
    expect(rule.getBoundingClientRect().left - originLeft()).toBeCloseTo(
      second!.getBoundingClientRect().left - originLeft(),
      0,
    );
  });

  it("survives an overflowing bar — the coordinate trap the both-edges spelling walked into", () => {
    // It shipped drawn by `left` + `right`, and that was wrong (audit 2026-08-19, D4): Base UI
    // computes `--active-tab-right` as `scrollWidth − left − width`, in the list's SCROLL
    // space, while CSS resolves `right` against the containing block's PADDING box. They agree
    // only while the bar fits, so the rule collapsed to ZERO width the moment it did not.
    //
    // The old law could not see it, because it mounted an unconstrained bar in the suite's
    // pinned 1280px viewport — the one regime where the two spaces coincide. This one forces
    // the overflow, which is the ordinary narrow-window path.
    const host = render(
      <Theme>
        <div style={{ width: "200px" }}>
          <Tabs defaultValue="d">
            <TabsList size="2">
              <TabsTab value="a">Overview</TabsTab>
              <TabsTab value="b">Activity</TabsTab>
              <TabsTab value="c">Members</TabsTab>
              <TabsTab value="d">Settings</TabsTab>
            </TabsList>
          </Tabs>
        </div>
      </Theme>,
    );
    const list = within(host, ".kui-tabs-list");
    const rule = within(host, ".kui-tab-rule");
    const active = within(host, ".kui-tab[data-active]");
    // The premise: this bar really does overflow, or the law is measuring the easy case again.
    expect(list.scrollWidth, "the bar did not overflow — this law tests nothing").toBeGreaterThan(
      list.clientWidth,
    );
    expect(rule.getBoundingClientRect().width).toBeCloseTo(
      active.getBoundingClientRect().width,
      0,
    );
  });

  it("the width edge is load-bearing — the rule is not just parked at the origin", () => {
    // The vacuity guard the old law needed: nudge what Base UI publishes and watch the box
    // answer. A rule that ignored the measurement would satisfy every assertion above by
    // sitting at the first tab and never moving.
    const root = bar("2");
    const rule = ruleOf(root);
    const before = rule.getBoundingClientRect();
    rule.style.setProperty(
      "--active-tab-width",
      `${parseFloat(computed(rule, "--active-tab-width")) - 20}px`,
    );
    expect(rule.getBoundingClientRect().width).toBeCloseTo(before.width - 20, 0);
    rule.style.setProperty(
      "--active-tab-left",
      `${parseFloat(computed(rule, "--active-tab-left")) + 20}px`,
    );
    expect(rule.getBoundingClientRect().left - before.left).toBeCloseTo(20, 0);
  });
});

describe("a tab answers the pointer, and only in its own family (§8, audit 2026-08-19 D3)", () => {
  it("hover and press step the fill — a tab was byte-identical in all three states", () => {
    // It shipped with no hover and no press at all: the quiet rung sources both from
    // `--tone-soft`, which exists only inside a `[data-tone]` block, and TabsTab stamped no
    // tone — so the declaration was invalid at computed-value time and fell to transparent.
    // The old law read the RESTING fill only, which was correct, and so it passed.
    const root = bar("2");
    const tab = tabsOf(root)[1]!;
    const rest = computed(tab, "background-color");
    expect(rest).toBe("rgba(0, 0, 0, 0)");
    return userEvent.hover(tab).then(() => {
      expect(computed(tab, "background-color"), "a tab does not answer hover").not.toBe(rest);
    });
  });

  it("and it hovers in NEUTRAL, whatever family it is dropped inside", () => {
    // Worse than absent, the missing stamp was ambient: `--tone-*` inherits, so the same bar
    // inside a destructive section hovered red. Tabs refuse `tone` as an API precisely so a
    // bar cannot say two things at once.
    const host = render(
      <Theme>
        <div data-tone="destructive">
          <Tabs defaultValue="a">
            <TabsList size="2">
              <TabsTab value="a">One</TabsTab>
              <TabsTab value="b">Two</TabsTab>
            </TabsList>
          </Tabs>
        </div>
      </Theme>,
    );
    const tab = [...host.querySelectorAll<HTMLElement>(".kui-tab")][1]!;
    return userEvent.hover(tab).then(() => {
      const hovered = computed(tab, "background-color");
      expect(hovered).not.toBe("rgba(0, 0, 0, 0)");
      expect(hovered, "the tab took its ancestor's family").toBe(
        colorOn(tab, "var(--neutral-soft)"),
      );
    });
  });
});

describe("a tab as a link is a link (audit 2026-08-19, D9)", () => {
  it("no type attribute on the anchor, and Space still activates it", () => {
    // The trap this package has closed four times and re-shipped a fifth: without inferring
    // `nativeButton`, Base UI emits `type="button"` on an `<a>` — `button` is not a MIME type
    // — and Space stops activating the tab.
    const host = render(
      <Theme>
        <Tabs defaultValue="a">
          <TabsList size="2">
            <TabsTab value="a">One</TabsTab>
            <TabsTab value="b" render={<a href="#two" />}>
              Two
            </TabsTab>
          </TabsList>
        </Tabs>
      </Theme>,
    );
    const anchor = within(host, "a.kui-tab");
    expect(anchor.getAttribute("type")).toBeNull();
    anchor.focus();
    return userEvent.keyboard(" ").then(() => {
      expect(anchor.getAttribute("aria-selected")).toBe("true");
    });
  });
});

describe("a dead tab looks dead (§8, audit 2026-08-26)", () => {
  /** A bar whose tabs are all disabled or all live, with the ACTIVE one controlled so both
      ink rungs are reachable in one fixture — an uncontrolled root refuses to select a
      disabled first tab, which would leave the active rung untested and the law would be
      about the resting one wearing the pair's name. */
  function deadBar(appearance: "light" | "dark", disabled: boolean) {
    return mounted(
      <Tabs value="a">
        <TabsList size="2">
          <TabsTab value="a" disabled={disabled}>
            Overview
          </TabsTab>
          <TabsTab value="b" disabled={disabled}>
            Audit log
          </TabsTab>
        </TabsList>
      </Tabs>,
      { theme: { appearance } },
    );
  }

  const alphaOf = (v: string) => {
    const m = /\/\s*([\d.]+)\s*\)|,\s*([\d.]+)\s*\)$/.exec(v);
    return m ? Number(m[1] ?? m[2]) : 1;
  };

  /** Two computed colours, compared per channel. The expected side is built by handing the
      engine a colour it already computed and asking it to mix again, so the two travel
      through one more parse than each other and land ~1e-6 apart in the fifth decimal — a
      string comparison would be pinning a round-trip, not the claim. Channels rather than a
      digit sweep: `color(srgb …)` carries no digit in its keyword, which is the trap the
      2026-08-08 calibration lesson records for `display-p3`. */
  const sameColor = (actual: string, expected: string, why: string) => {
    const channels = (v: string) => (v.match(/[\d.]+/g) ?? []).map(Number);
    const a = channels(actual);
    const b = channels(expected);
    expect(a.length, `${why} — unreadable colour ${actual} / ${expected}`).toBe(b.length);
    expect(a.length, `${why} — nothing was parsed out of ${actual}`).toBeGreaterThan(2);
    for (const [i, v] of a.entries()) {
      expect(v, `${why} (${actual} vs ${expected})`).toBeCloseTo(b[i]!, 3);
    }
  };

  for (const appearance of APPEARANCES) {
    it(`${appearance}: BOTH ink rungs stand down — the shared remap cannot reach either`, () => {
      /* The shared disabled remap rewrites the TONE vocabulary (--tone-label, --tone-contrast,
         the ink trio, --tone-glyph), and both of this file's ink roles are the TONE-LESS
         foreground pair — chosen two rules up so a bar follows the surface it is dropped on.
         So the remap reached neither: a disabled tab computed byte-identical to a live one in
         colour AND in fill, in both appearances, with `cursor` as the whole of the difference,
         which on a touch screen is nothing at all. The same shape as the slider rail (2026-08-07),
         the card (2026-08-22), the composer (2026-08-23) and this component's own sibling.

         Read at BOTH rungs, because there are two live values and one arm gets the pair wrong:
         a controlled bar can hold `value="a"` while tab a is disabled. */
      const live = deadBar(appearance, false);
      const dead = deadBar(appearance, true);
      const [liveActive, liveResting] = tabsOf(live);
      const [deadActive, deadResting] = tabsOf(dead);
      // The premises, stated so a broken fixture fails as itself rather than as the claim.
      expect(deadActive!.getAttribute("data-disabled")).not.toBeNull();
      expect(deadActive!.getAttribute("data-active")).not.toBeNull();
      expect(deadResting!.getAttribute("data-active")).toBeNull();
      for (const [rung, deadTab, liveTab] of [
        ["the active tab", deadActive!, liveActive!],
        ["a resting tab", deadResting!, liveResting!],
      ] as const) {
        const ink = computed(deadTab, "color");
        expect(ink, `${appearance}: ${rung} is painted as though it were live`).not.toBe(
          computed(liveTab, "color"),
        );
        // And it is the DIM OF THE LIVE VALUE, not some invented dead grey — derived from the
        // live tab that was just measured rather than restated from the declaration under
        // test, so an arm that dimmed the wrong role fails here. `alphaOf` alone cannot say
        // this: the muted role already carries alpha, so a dead resting tab lands at 0.364
        // (0.52 × 0.7) in light and a law reading the factor off the token would be measuring
        // its own arithmetic.
        sameColor(
          ink,
          colorOn(
            dead,
            `color-mix(in srgb, ${computed(liveTab, "color")} var(--disabled-dim), transparent)`,
          ),
          `${appearance}: ${rung} is not the live ink dimmed`,
        );
        // CALIBRATION: the dim really does move a colour, or the line above is `live === live`.
        expect(numberOn(dead, "--disabled-dim")).toBeLessThan(1);
        expect(alphaOf(ink)).toBeLessThan(alphaOf(computed(liveTab, "color")));
      }
      // CALIBRATION: the two live rungs really do differ, so "the dead pair differs from the
      // live pair" above is two claims and not one value read twice.
      expect(computed(liveActive!, "color")).not.toBe(computed(liveResting!, "color"));
    });
  }
});

describe("what Tabs deliberately is not (§10, §26)", () => {
  it("the rule is PAINT, so it takes no pointer (audit 2026-08-26)", () => {
    /* An absolutely positioned box paints after every static sibling whatever the document
       order says (the segmented thumb's own 2026-08-23 finding), and it is hit-testable by
       default: measured, `elementFromPoint` over the bar's bottom rows returned the rule. It
       steals nothing from a tab today only because it sits below the tabs' boxes, which is a
       fact about this geometry rather than a guarantee.

       Read as the pointer test AND as the declaration, because either alone is half: a hit
       scan on today's layout passes with the declaration deleted (the rule is below the tabs),
       and the declaration alone is a token nobody proved reaches the element. */
    const root = bar("2");
    const rule = ruleOf(root);
    expect(computed(rule, "pointer-events")).toBe("none");
    const box = rule.getBoundingClientRect();
    // The fixture has to have something to hit: a rule of no area is a scan that measures
    // nothing (the 2026-08-06 off-viewport lesson — a row nobody claims is an error).
    expect(box.width, "the rule has no box to scan").toBeGreaterThan(1);
    expect(box.height, "the rule has no box to scan").toBeGreaterThan(0);
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    expect(hit, "the scan ran off the viewport and measured nothing").not.toBeNull();
    expect(hit === rule || rule.contains(hit), "a decoration took the pointer").toBe(false);
  });


  it("paints no pane — nothing here expresses the theme's material", () => {
    // A tab bar has no fill and no box: there is nothing to defocus, so glass has nothing to
    // do. Asserted under a glass theme, which is the only state where a mistake shows.
    const root = bar("2", { material: "thin" });
    for (const el of [listOf(root), ...tabsOf(root), ruleOf(root)]) {
      expect(computed(el, "backdrop-filter")).toBe("none");
      expect(el.getAttribute("data-material")).toBeNull();
    }
  });

  it("the panel paints nothing, and still answers focus (WCAG 2.4.7)", () => {
    const root = bar("2");
    const panel = within(root, ".kui-tab-panel");
    expect(computed(panel, "background-color")).toBe("rgba(0, 0, 0, 0)");
    // Base UI makes the panel focusable so a keyboard user can reach content holding no
    // focusable child; a focusable element with no visible focus state is the failure. The
    // ring has to be READ WITH THE ELEMENT FOCUSED — the first spelling of this law read the
    // resting outline and asserted against the UA's `medium`, which is 3px and has nothing to
    // do with us. The width is the system's one ring token, resolved in this scope.
    expect(panel.getAttribute("tabindex")).not.toBeNull();
    panel.focus();
    expect(computed(panel, "outline-width")).toBe(tokenOn(root, "--focus-ring-width"));
    expect(computed(panel, "outline-style")).toBe("solid");
  });
});

describe("the API's closed edges (§3, audit 2026-08-26)", () => {
  it("refuses orientation — vertical is a geometry this package has never drawn", () => {
    /* It passed through by omission rather than by decision: the root's props were Base UI's
       type unnarrowed, so `orientation="vertical"` compiled, switched the arrow keys to
       Up/Down and stamped `data-orientation="vertical"` — onto a stylesheet with no
       `[data-orientation]` arm at all, a flex ROW with its hairline on the block-end, and a
       rule drawn by two INLINE insets. A horizontal bar with vertical keyboard navigation.

       The law is the TYPE, which is where a refusal has to live (the second house rule): a
       comment saying "we do not support vertical" is a warning, and `tsc` is the thing that
       makes it unexpressible. Slider's own sentence one component over. */
    // @ts-expect-error — vertical ships as its own designed set the day something forces it,
    // never as undesigned numbers today (Slider's refusal, same reason)
    void (<Tabs orientation="vertical" />);
    // And the ones the root never had, pinned beside it so the block is the whole edge.
    // @ts-expect-error — no margin prop on any control (first non-negotiable)
    void (<Tabs m="4" />);
    // @ts-expect-error — a bar of tabs has no family to pick: exactly one tab is the one you
    // are on, and that is a state (§11)
    void (<Tabs tone="destructive" />);
    // @ts-expect-error — loudness ranks actions; a tab bar ranks nothing (§11)
    void (<Tabs emphasis="loud" />);
    // The one it DOES take, so the block cannot pass by refusing everything.
    void (<Tabs defaultValue="a" />);
  });
});

/**
 * §8, §26 — THE INK POURS ACROSS AND GATHERS (2026-08-23, judged in the "Clip vs Physics"
 * bench). The rule is drawn by two edges again, and the edge facing the destination takes the
 * shorter clock.
 *
 * The stretch is read by SEIZING the transitions rather than by racing them: `getAnimations()`
 * hands back the running CSSTransitions, pausing them stops the clock the law would otherwise
 * have to sample against, and setting `currentTime` puts the box at a chosen point in the
 * flight. That keeps these on CI, where a law that polled for a mid-flight width could not run
 * (test/frames.test.ts records why the exclusion exists and what it costs).
 */
describe("the rule travels as two edges at two speeds (§8, §26)", () => {
  /** The rule's own running transitions, stopped and moved to a chosen point in the flight. */
  function seize(rule: Element, at: number) {
    const running = rule.getAnimations();
    for (const a of running) {
      a.pause();
      a.currentTime = at;
    }
    return running;
  }

  function bar3(dir: "forward" | "back") {
    const root = mounted(
      <Tabs defaultValue={dir === "forward" ? "a" : "c"}>
        <TabsList>
          <TabsTab value="a">One</TabsTab>
          <TabsTab value="b">Two</TabsTab>
          <TabsTab value="c">Three long</TabsTab>
        </TabsList>
        <TabsPanel value="a">x</TabsPanel>
        <TabsPanel value="b">x</TabsPanel>
        <TabsPanel value="c">x</TabsPanel>
      </Tabs>,
    );
    return {
      rule: within(root, ".kui-tab-rule"),
      tabs: [...root.querySelectorAll(".kui-tab")] as HTMLElement[],
    };
  }

  it("spans the active tab EXACTLY on an OVERFLOWING bar — the 2026-08-19 defect, closed", () => {
    // THE LAW THIS WHOLE SPELLING TURNS ON. The rule shipped drawn by two edges once before and
    // was reverted because the second edge was Base UI's `--active-tab-right`, which is
    // `scrollWidth − left − width` in the list's SCROLL space while CSS resolves `right` against
    // the containing block's PADDING box: measured then, an overflowing bar drew a ZERO-width
    // rule. The second edge is DERIVED now, from the pair Base UI computes in one space.
    //
    // The fixture is the whole law: on a bar that FITS, the two spaces coincide and a broken
    // spelling passes. This one overflows by 60px, which is the input where right and wrong
    // give different answers (the degenerate-fixture rule, 2026-08-20).
    const root = mounted(
      <div style={{ inlineSize: "200px" }}>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTab value="a">Overview here</TabsTab>
            <TabsTab value="b">Projects too</TabsTab>
            <TabsTab value="c">Settings also</TabsTab>
          </TabsList>
          <TabsPanel value="a">x</TabsPanel>
        </Tabs>
      </div>,
    );
    const list = within(root, ".kui-tabs-list");
    const rule = within(root, ".kui-tab-rule");
    const tab = within(root, ".kui-tab[data-active]");
    // CALIBRATION: the premise is that this bar really does overflow. Without it the law is
    // the fitting-bar law under a longer name, and that one cannot fail.
    expect(list.scrollWidth, "the fixture does not overflow").toBeGreaterThan(
      list.clientWidth + 40,
    );
    const seat = tab.getBoundingClientRect();
    const drawn = rule.getBoundingClientRect();
    expect(drawn.width).toBeCloseTo(seat.width, 0);
    expect(drawn.left).toBeCloseTo(seat.left, 0);
  });

  for (const [dir, lead, trail] of [
    ["forward", "--kui-tab-right", "--kui-tab-left"],
    ["back", "--kui-tab-left", "--kui-tab-right"],
  ] as const) {
    it(`${dir}: the edge facing the destination takes the shorter clock`, async () => {
      inMotion();
      const { rule, tabs } = bar3(dir);
      const want = dir === "forward" ? "right" : "left";
      await userEvent.click(tabs[dir === "forward" ? 2 : 0]!);
      // Waited for, never assumed: a driver gesture resolving is not React having committed
      // the render that moves this stamp (test/settling.test.ts enforces the rule).
      await until(() => rule.getAttribute("data-activation-direction") === want);
      // The clocks ride the REGISTERED insets since 2026-08-25 (the bar's wall): the spring
      // runs on the raw value and the painted inset is that value floored at the wall, so the
      // property list names the custom pair rather than `left`/`right`.
      const style = computed(rule, "transition-property").split(", ");
      const clocks = computed(rule, "transition-duration").split(", ");
      const at = (name: string) => clocks[style.indexOf(name)];
      expect(at(lead), `${dir}: the leading edge is not on the short clock`).toBe("0.32s");
      expect(at(trail), `${dir}: the trailing edge is not on the long clock`).toBe("0.48s");
      // …and they are actually DIFFERENT, which is the whole claim: two edges on one clock is
      // a photograph being slid, which is the motion this replaced.
      expect(at(lead)).not.toBe(at(trail));
    });
  }

  it("back: the flight never leaves the bar — the overshoot squashes against the start", async () => {
    /* THE WALL (§8, §26, 2026-08-25, the segmented channel's wall one file over, same day).
       The first tab rests at the bar's very start, so EVERY flight back to it carried the
       rule's leading edge out of the bar's box — the calm spring's ~6.8% overshoot, ~14px on
       a long jump, retracting from outside the thing it underlines.

       Seized and swept, so the assertion covers every point of the curve; the calibration half
       is what keeps it from passing for the wrong reason — the RAW registered inset must still
       cross the wall mid-flight, or the spring was tamed rather than clamped and a different
       motion shipped under a green wall. */
    inMotion();
    const { rule, tabs } = bar3("back");
    const list = tabs[0]!.parentElement as HTMLElement;
    await userEvent.click(tabs[0]!);
    await until(() => rule.getAttribute("data-activation-direction") === "left");
    const anims = rule.getAnimations();
    expect(anims.length, "no flight started").toBeGreaterThan(0);
    for (const a of anims) a.pause();
    const box = list.getBoundingClientRect();
    let sprung = false;
    for (let t = 0; t <= 480; t += 10) {
      for (const a of anims) a.currentTime = t;
      expect(
        rule.getBoundingClientRect().left,
        `t=${t}ms: the rule left the bar`,
      ).toBeGreaterThanOrEqual(box.left - 0.5);
      if (parseFloat(getComputedStyle(rule).getPropertyValue("--kui-tab-left")) < -4)
        sprung = true;
    }
    expect(
      sprung,
      "the raw inset never crossed the wall — the spring was tamed, not clamped",
    ).toBe(true);
  });

  it("forward: the wall binds at the bar's END where the last tab reaches it", async () => {
    // The bar's end binds only when a tab sits against it — tabs do not fill a wide bar, and
    // overshoot past the last LABEL along the hairline is deliberate (ink on a rail, and the
    // rail continues; the wall is the box). `min-content` makes the last tab flush with the
    // bar's end, which is the fixture where the end wall and its absence give different
    // answers.
    inMotion();
    const root = mounted(
      <Tabs defaultValue="a">
        <TabsList style={{ inlineSize: "min-content" }}>
          <TabsTab value="a">One</TabsTab>
          <TabsTab value="b">Two</TabsTab>
          <TabsTab value="c">Three long</TabsTab>
        </TabsList>
        <TabsPanel value="a">x</TabsPanel>
        <TabsPanel value="b">x</TabsPanel>
        <TabsPanel value="c">x</TabsPanel>
      </Tabs>,
    );
    const list = within(root, ".kui-tabs-list");
    const rule = within(root, ".kui-tab-rule");
    const tabs = [...root.querySelectorAll(".kui-tab")] as HTMLElement[];
    // CALIBRATION: the last tab really is flush with the bar's end, or this is the wide-bar
    // fixture where the end wall never binds and the law cannot fail.
    expect(tabs[2]!.getBoundingClientRect().right).toBeCloseTo(
      list.getBoundingClientRect().right,
      0,
    );
    await userEvent.click(tabs[2]!);
    await until(() => rule.getAttribute("data-activation-direction") === "right");
    const anims = rule.getAnimations();
    expect(anims.length, "no flight started").toBeGreaterThan(0);
    for (const a of anims) a.pause();
    const box = list.getBoundingClientRect();
    for (let t = 0; t <= 480; t += 10) {
      for (const a of anims) a.currentTime = t;
      expect(
        rule.getBoundingClientRect().right,
        `t=${t}ms: the rule left the bar`,
      ).toBeLessThanOrEqual(box.right + 0.5);
    }
  });

  it("a flight INTO the overflow region still lands on its tab — the wall is adaptive", async () => {
    /* The half the segmented control did not need. On an overflowing bar a tab's resting
       `right` inset is legitimately NEGATIVE (the 2026-08-19 coordinate trap), so a static
       floor at the bar's edge would clamp the flight short and re-commit that defect as a
       wall: the rule would stop at the visible box's end, off its own tab. The wall is
       `min(target, 0%)` — the destination's own seat out there — and this law is the input
       where the adaptive and static spellings give different answers. */
    inMotion();
    const root = mounted(
      <div style={{ inlineSize: "200px" }}>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTab value="a">Overview here</TabsTab>
            <TabsTab value="b">Projects too</TabsTab>
            <TabsTab value="c">Settings also</TabsTab>
          </TabsList>
          <TabsPanel value="a">x</TabsPanel>
        </Tabs>
      </div>,
    );
    const list = within(root, ".kui-tabs-list");
    const rule = within(root, ".kui-tab-rule");
    const tabs = [...root.querySelectorAll(".kui-tab")] as HTMLElement[];
    expect(list.scrollWidth, "the fixture does not overflow").toBeGreaterThan(
      list.clientWidth + 40,
    );
    await userEvent.click(tabs[2]!);
    await until(() => rule.getAttribute("data-activation-direction") === "right");
    const anims = rule.getAnimations();
    expect(anims.length, "no flight started").toBeGreaterThan(0);
    for (const a of anims) {
      a.pause();
      a.currentTime = 480;
    }
    const seat = tabs[2]!.getBoundingClientRect();
    const drawn = rule.getBoundingClientRect();
    expect(drawn.left, "the flight stopped short of the overflow tab").toBeCloseTo(seat.left, 0);
    expect(drawn.width).toBeCloseTo(seat.width, 0);
  });

  it("STRETCHES on the way — mid-flight it is wider than either end", async () => {
    // The two clocks are declarations; this is what they produce. Seized at 160ms, where the
    // leading edge is halfway through its 320 and the trailing has done a third of its 480, so
    // the box must be longer than the tab it left AND longer than the one it is going to.
    inMotion();
    const { rule, tabs } = bar3("forward");
    const from = rule.getBoundingClientRect().width;
    await userEvent.click(tabs[2]!);
    const running = seize(rule, 160);
    expect(running.length, "nothing is animating — the flight never started").toBeGreaterThan(0);
    const midFlight = rule.getBoundingClientRect().width;
    const to = tabs[2]!.getBoundingClientRect().width;
    expect(midFlight, "it did not stretch past where it came from").toBeGreaterThan(from + 8);
    expect(midFlight, "it did not stretch past where it is going").toBeGreaterThan(to + 8);
  });

  it("is PLACED, not flown, before anything has been chosen a second time", () => {
    // Base UI's `none` — no previous tab — is what makes the first paint land where it belongs
    // instead of flying in from the bar's start, and it is why this component needs no JS of
    // its own. A law rather than a comment because the whole mechanism rests on that value
    // matching neither transition rule.
    inMotion();
    const { rule } = bar3("forward");
    expect(rule.getAttribute("data-activation-direction")).toBe("none");
    // Read as the CLOCK, not as the property list: nothing declares `transition-property` here,
    // so it computes to its initial `all`, which reads like a transition and is not one. `0s`
    // is the thing that means "placed".
    expect(computed(rule, "transition-duration")).toBe("0s");
  });
});

/**
 * §26 — A TAB STANDS OFF ITS RULE (2026-08-23, Kushagra, from the playground: the tabs "have
 * the same height as controls, and so they touch the tab lines… so 28px instead of 32").
 */
describe("a tab stands off the rule it sits on (§4, §26)", () => {
  for (const size of SIZES) {
    it(`size ${size}: the BAR keeps the ladder and the TAB is shorter by the inset`, () => {
      // Two claims that have to hold together, which is why they are one law: a tab bar must
      // still stand level with the controls in its row (the bar's job), and the tab inside it
      // must not run into the hairline (the tab's job). Fixing either alone breaks the other —
      // shrinking the bar drops it below the Button beside it, and leaving the tab at full
      // height is the defect.
      const root = mounted(
        <div>
          <Tabs defaultValue="a">
            <TabsList size={size}>
              <TabsTab value="a">Overview</TabsTab>
              <TabsTab value="b">Projects</TabsTab>
            </TabsList>
            <TabsPanel value="a">first</TabsPanel>
          </Tabs>
          <Button size={size}>Button</Button>
        </div>,
      );
      const list = within(root, ".kui-tabs-list");
      const tab = within(root, ".kui-tab");
      const button = within(root, "button.kui-control:not(.kui-tab)");
      const inset = px(tokenOn(root, "--tab-inset"));
      const border = px(tokenOn(root, "--border-width"));

      // The bar stands level with a mounted Button, hairline included — asserted against the
      // rendered control rather than against the token, which is the point of the rule.
      expect(list.getBoundingClientRect().height).toBeCloseTo(
        button.getBoundingClientRect().height + border,
        0,
      );
      // And the tab is exactly two insets shorter than the box it stands in.
      expect(tab.getBoundingClientRect().height).toBeCloseTo(
        button.getBoundingClientRect().height - 2 * inset,
        0,
      );
      // CALIBRATION: the inset is not zero, or both assertions above are the old behaviour
      // wearing new arithmetic.
      expect(inset, "the inset is zero — this law cannot fail").toBeGreaterThan(0);
    });
  }

  it("its box clears the hairline, so a hovered tab never runs into the line", () => {
    // The defect stated as geometry rather than as a number: the gap between the bottom of the
    // tab's own box and the top of the rule under it. This is what a hover fill is bounded by.
    const root = mounted(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTab value="a">Overview</TabsTab>
          <TabsTab value="b">Projects</TabsTab>
        </TabsList>
        <TabsPanel value="a">first</TabsPanel>
      </Tabs>,
    );
    const list = within(root, ".kui-tabs-list");
    const tab = within(root, ".kui-tab");
    const gap =
      list.getBoundingClientRect().bottom -
      px(computed(list, "border-block-end-width")) -
      tab.getBoundingClientRect().bottom;
    expect(gap).toBeCloseTo(px(tokenOn(root, "--tab-inset")), 0);
    expect(gap, "the tab's box ends on the hairline").toBeGreaterThan(0);
  });

  it("stands off by the same amount a SEGMENT does — the precedent it was asked for", () => {
    // Kushagra named the segmented control as the precedent, so the law reads the two mounted
    // boxes against each other rather than restating 2 in a third place. They agree by
    // arithmetic today and could drift by config tomorrow; this is where that would surface.
    for (const size of SIZES) {
      const root = mounted(
        <div>
          <Tabs defaultValue="a">
            <TabsList size={size}>
              <TabsTab value="a">Overview</TabsTab>
            </TabsList>
            <TabsPanel value="a">first</TabsPanel>
          </Tabs>
          <SegmentedControl size={size} defaultValue="a">
            <SegmentedItem value="a">List</SegmentedItem>
            <SegmentedItem value="b">Grid</SegmentedItem>
          </SegmentedControl>
        </div>,
      );
      expect(
        within(root, ".kui-tab").getBoundingClientRect().height,
        `size ${size}: a tab and a segment do not stand at the same height`,
      ).toBeCloseTo(within(root, ".kui-segment").getBoundingClientRect().height, 0);
    }
  });
});
