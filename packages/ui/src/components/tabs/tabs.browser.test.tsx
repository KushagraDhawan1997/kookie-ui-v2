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
  mounted,
  render,
  tokenOn,
  until,
  within,
} from "../../test/browser.tsx";
import { Theme } from "../../theme/theme.tsx";
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
    it(`${pointer}: every tab stands at --control-height-N`, () => {
      for (const size of SIZES) {
        const root = bar(size, { pointer });
        const expected = px(tokenOn(root, `--control-height-${size}`));
        for (const tab of tabsOf(root)) {
          expect(px(computed(tab, "min-height")), `${pointer}/${size}`).toBe(expected);
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
    it(`${appearance}: it paints the accent solid — one selected colour, system-wide`, () => {
      const root = bar("2", { appearance });
      expect(computed(ruleOf(root), "background-color")).toBe(
        colorOn(root, "var(--accent-solid)"),
      );
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

describe("what Tabs deliberately is not (§10, §26)", () => {
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
