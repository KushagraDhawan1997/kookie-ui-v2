/**
 * Tooltip's laws, mounted (§11, §20, §32).
 *
 * The claim that matters is the INVERSION, and it is asserted as an IDENTITY rather than as a
 * threshold: the pane's fill is exactly the mode's ink and its words are exactly the mode's
 * surface, in both appearances and under `contrast="high"`. A law that only checked "the
 * tooltip is darker than the page" would pass on any dark chip, including one that minted its
 * own colour — which is the thing this design exists to avoid.
 *
 * The second load-bearing claim is that the inversion REACHES A CALLER'S CONTENT. A tooltip
 * paints its fill on the pane and re-scopes the foreground role one element down, and if that
 * second half is missing a `<Kbd>` inside a tooltip paints the page's ink on the page's ink and
 * disappears. That is invisible to any law that reads only the pane.
 */
import { describe, expect, it } from "vitest";

import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import { APPEARANCES, colorOn, computed, render, settleAll, tokenOn } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/menu.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.tsx";

function openTooltip(theme: ThemeProps, body?: string) {
  render(
    <Theme {...theme}>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button>Undo</Button>} />
        <TooltipContent>{body ?? "Undo"}</TooltipContent>
      </Tooltip>
    </Theme>,
  );
  // The LAST panel — mounts accumulate within one test.
  const popups = document.querySelectorAll<HTMLElement>(".kui-tooltip-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the tooltip never mounted — every law below would assert nothing");
  settleAll();
  const body_ = popup.querySelector<HTMLElement>(".kui-floating-body");
  if (!body_) throw new Error("no floating body — the inversion has nowhere to live");
  return { popup, body: body_ };
}

describe("it is INVERTED, and it mints nothing to be (§11, §32)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: the fill IS the mode's ink and the words ARE the mode's surface`, () => {
      // Stated as two identities rather than as "it is darker than the page". A threshold would
      // pass on any dark chip, including one that had quietly minted a colour of its own, and
      // the whole design here is that no colour exists to drift.
      const { popup, body } = openTooltip({ appearance });
      expect(computed(popup, "background-color")).toBe(colorOn(popup, "var(--color-text)"));
      expect(computed(body, "color")).toBe(colorOn(popup, "var(--color-surface)"));
    });

    it(`${appearance}: it is the OPPOSITE of the page it sits on — the calibration`, () => {
      // Without this the identities above hold in a world where `--color-text` and
      // `--color-surface` had collapsed onto one value, which is a tooltip nobody can read.
      const { popup, body } = openTooltip({ appearance });
      const card = render(
        <Theme appearance={appearance}>
          <Card>x</Card>
        </Theme>,
      ).querySelector<HTMLElement>(".kui-card")!;
      expect(
        computed(popup, "background-color"),
        `${appearance}: the tooltip paints what a card paints`,
      ).not.toBe(computed(card, "background-color"));
      expect(computed(body, "color")).not.toBe(computed(card, "color"));
      // And the two ends really are opposite: the tooltip's fill is the card's ink.
      expect(computed(popup, "background-color")).toBe(computed(card, "color"));
    });
  }

  it("the two appearances invert in OPPOSITE directions — one rule, both modes", () => {
    // The half a single-appearance law cannot see: an inversion hard-coded to "dark chip" would
    // pass every assertion above in light and be wrong in dark. This compares the modes.
    const light = openTooltip({ appearance: "light" });
    const dark = openTooltip({ appearance: "dark" });
    expect(
      computed(light.popup, "background-color"),
      "the tooltip paints the same fill in both modes — it is not inverting, it is dark",
    ).not.toBe(computed(dark.popup, "background-color"));
  });

  it("contrast=high moves it, because it moves the two roles it is made of (§11)", () => {
    // §11's row has said "exception: high-contrast inverted" since the defaults table was
    // written, and it costs nothing here: the conformance surface moves `--color-text` and
    // `--color-surface`, so the inversion moves with them and the component knows nothing.
    for (const appearance of APPEARANCES) {
      const normal = openTooltip({ appearance });
      const high = openTooltip({ appearance, contrast: "high" });
      expect(
        computed(high.popup, "background-color"),
        `${appearance}: contrast=high reaches nothing on a tooltip`,
      ).not.toBe(computed(normal.popup, "background-color"));
    }
  });

  it("the inversion reaches the WORDS, which is exactly as far as it can reach", () => {
    // The pane paints the fill and the body re-scopes the foreground role one element down,
    // because a property cannot invert a value its own declaration consumed. That carries the
    // `Text` this component places, and it stops there — a component that stamps a tone
    // re-declares the ink roles ON ITS OWN ELEMENT and outranks any ancestor, which is measured
    // and is why `children` is a string (tooltip-types.test.tsx holds that refusal).
    const { popup, body } = openTooltip({ appearance: "light" }, "Undo the last change");
    const words = popup.querySelector<HTMLElement>(".kui-type");
    if (!words) throw new Error("no words mounted");
    expect(computed(words, "color"), "the words did not invert").toBe(
      colorOn(popup, "var(--color-surface)"),
    );
    expect(computed(words, "color")).toBe(computed(body, "color"));
  });

  it("it draws no hairline — the inverted edge IS the boundary", () => {
    // A border on the highest-contrast object on the screen is the doubled-edge defect
    // (2026-08-07) at a smaller scale. The guarantee is made by the component NOT asking for an
    // edge, so the law reads the outcome — and it needs a control beside it, because "the border
    // is transparent" is also true of a world where nothing draws one. The first spelling had no
    // control and survived its own sabotage.
    //
    // THE CONTROL HAS TO BE IN A WORLD WHERE PANES DRAW EDGES AT ALL, which is the second thing
    // this law got wrong: since the fill-first flip (2026-08-17) a pane's resting pigment edge is
    // a live `transparent` in the elevated world, so a menu measured `rgba(0, 0, 0, 0)` too and
    // the control proved nothing. `depth="flat"` is where the hairline comes back (2026-08-19),
    // so that is where the comparison is made.
    const { popup } = openTooltip({ depth: "flat" });
    expect(computed(popup, "border-top-color")).toBe("rgba(0, 0, 0, 0)");
    render(
      <Theme depth="flat">
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const menus = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
    const menu = menus[menus.length - 1]!;
    settleAll();
    expect(
      computed(menu, "border-top-color"),
      "no pane draws an edge in a flat world — this law's control is gone",
    ).not.toBe("rgba(0, 0, 0, 0)");
  });
});

describe("the box is one line of words (§32)", () => {
  it("block is tighter than inline — a one-line box asks two questions", () => {
    const { popup } = openTooltip({});
    const block = parseFloat(computed(popup, "padding-top"));
    const inline = parseFloat(computed(popup, "padding-left"));
    expect(block, "the tooltip's two axes have collapsed onto one number").toBeLessThan(inline);
    expect(block).toBe(parseFloat(tokenOn(popup, "--tooltip-p-block")));
    expect(inline).toBe(parseFloat(tokenOn(popup, "--tooltip-p-inline")));
  });

  it("density reaches it through the layer, with nothing designed twice", () => {
    const roomy = openTooltip({ density: "comfortable" });
    const tight = openTooltip({ density: "compact" });
    expect(
      parseFloat(computed(roomy.popup, "padding-left")),
      "a compact app gets the same tooltip as a comfortable one",
    ).toBeGreaterThan(parseFloat(computed(tight.popup, "padding-left")));
  });

  it("a long label wraps into a small block rather than a strip", () => {
    const { popup } = openTooltip(
      {},
      "Undo the last change to this document, and every change made after it",
    );
    const cap = parseFloat(tokenOn(popup, "--tooltip-max-w"));
    expect(popup.getBoundingClientRect().width, "the tooltip ran past its cap").toBeLessThanOrEqual(
      cap + 0.5,
    );
    // ...and it really is the cap doing it, not the words happening to be short: the label
    // wrapped, so the chip is taller than the single line it would otherwise be. Read off the
    // TEXT, because the pane sets no line-height of its own and `normal` parses to NaN — which
    // is how the first spelling of this assertion compared 70 against a NaN and passed nothing.
    const line = parseFloat(computed(popup.querySelector<HTMLElement>(".kui-type")!, "line-height"));
    expect(popup.getBoundingClientRect().height).toBeGreaterThan(line * 1.5);
  });

  it("it takes the CARD's corner, not the row-hugging panel's (§31)", () => {
    // A tooltip hugs one line of text, so the concentric arithmetic has nothing to add — the
    // same criterion Popover established, applied to the family's next member. The menu beside
    // it is the negative control, because "everything agrees" would otherwise pass.
    const { popup } = openTooltip({});
    const card = render(
      <Theme>
        <Card size="1">x</Card>
      </Theme>,
    ).querySelector<HTMLElement>(".kui-card")!;
    render(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const menus = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
    const menu = menus[menus.length - 1]!;
    settleAll();
    expect(computed(popup, "border-top-left-radius")).toBe(
      computed(card, "border-top-left-radius"),
    );
    expect(
      computed(menu, "border-top-left-radius"),
      "the menu lost its concentric corner — this law's control is gone",
    ).not.toBe(computed(popup, "border-top-left-radius"));
  });

  it("no size axis, and no material — both absences are the design", () => {
    // The ladder was asked and refused: the only index a tooltip could ride is its TRIGGER's,
    // which it cannot see and which would make one label two sizes. And the material defends a
    // foreground against what passes behind a pane; a tooltip defends itself by inverting, so a
    // veil on it would be a second defence on one 28px box.
    const { popup } = openTooltip({ material: "thick" });
    // The index is FIXED at the smallest surface step, not absent: without a stamp the surface
    // join never fires and the pane falls back to a card's un-indexed corner — measured, 64.52px
    // on a 30px chip. What is refused is the PROP, and that refusal is a compile error
    // (tooltip-types.test.tsx); what is asserted here is that the fixed pick is the one in force.
    expect(popup.getAttribute("data-size"), "the tooltip's fixed index moved").toBe("1");
    expect(popup.getAttribute("data-material"), "a tooltip took the theme's glass").toBeNull();
    expect(computed(popup, "backdrop-filter")).toBe("none");
  });
});

describe("it names a control, and it takes nothing from it (§32)", () => {
  it("it is HIDDEN from assistive technology — the restatement rule, enforced", () => {
    // MEASURED FIRST, then decided. Base UI wires nothing: the trigger carries no
    // `aria-describedby` and the panel no `role="tooltip"`, so the choice was ours either way.
    // A tooltip may only restate the name its control already announces, and announcing that
    // name twice reads as "Undo, button, Undo" — so the panel is hidden and the control keeps
    // its own name, which is the half a law can check.
    render(
      <Theme>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button iconOnly aria-label="Undo">{"\u21A9"}</Button>} />
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
      </Theme>,
    );
    settleAll();
    const popups = document.querySelectorAll<HTMLElement>(".kui-tooltip-popup");
    const popup = popups[popups.length - 1]!;
    const trigger = document.querySelector<HTMLElement>("button.kui-control")!;
    expect(popup.getAttribute("aria-hidden"), "the tooltip announces itself twice").toBe("true");
    // The other half: the control still names itself, so hiding the panel costs nothing.
    expect(trigger.getAttribute("aria-label")).toBe("Undo");
    // And nothing points at the panel, which is what would put it back in the announcement.
    expect(trigger.getAttribute("aria-describedby")).toBeNull();
    expect(trigger.getAttribute("aria-labelledby")).toBeNull();
  });

  it("it never takes focus — there is nothing in it to reach", () => {
    render(
      <Theme>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button>Undo</Button>} />
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
      </Theme>,
    );
    settleAll();
    const popups = document.querySelectorAll<HTMLElement>(".kui-tooltip-popup");
    const popup = popups[popups.length - 1]!;
    expect(popup.contains(document.activeElement), "the tooltip took focus").toBe(false);
    // Base UI marks the panel programmatically focusable (`tabindex="-1"`), which is not a tab
    // stop — the claim is that it never becomes one, so the assertion is on the value rather
    // than on the attribute's absence, which is what the first spelling got wrong.
    const tabindex = popup.getAttribute("tabindex");
    expect(tabindex === null || Number(tabindex) < 0, "the tooltip is a tab stop").toBe(true);
  });
});
