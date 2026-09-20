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
import { APPEARANCES, colorOn, computed, render, tokenOn } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/menu.tsx";
import { Text } from "../text/text.tsx";
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

  it("contrast=high moves it, because it moves one of the two roles it is made of (§11)", () => {
    // §11's row has said "exception: high-contrast inverted" since the defaults table was
    // written, and it costs nothing here — though it is ONE role that moves, not two
    // (corrected 2026-08-29, the ultracode audit). `--color-text` chains to `--neutral-12`,
    // which every high-contrast scope re-declares; `--color-surface` is declared once per
    // appearance, no HC scope touches it, and it has no HC variant in config. So the pair
    // SEPARATES — the fill travels toward the palette's end while the ink is already there —
    // and the outcome this law reads is the same either way, which is exactly why the wrong
    // explanation survived in four homes. What is asserted is still the outcome.
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

  it("and it catches NO PANE LIGHT, because the pane is the mode's other end", () => {
    /**
     * `.kui-surface` paints `--kui-sf-light` — the solid rim, grain plus a white sheen — at
     * every material, and that recipe is written for a pane the colour of the mode's SURFACE.
     * This pane is the colour of the mode's INK, so in light the sheen composited 30% white
     * over a near-black chip: measured
     * `linear-gradient(rgba(255, 255, 255, 0.3), transparent 55%)` over
     * `color(display-p3 0.1223 0.121 0.1291)`, lifting the top of a ~30px chip to roughly
     * #626263 and fading to the fill by mid-height — a visible band across the smallest,
     * highest-contrast object the library draws (audit 2026-08-26).
     *
     * The CARD in the same run is what makes this a law about the tooltip rather than about a
     * package that had stopped lighting panes at all.
     */
    for (const appearance of APPEARANCES) {
      const { popup } = openTooltip({ appearance });
      expect(
        computed(popup, "background-image"),
        `${appearance}: the tooltip paints the surface world's sheen on an inverted pane`,
      ).toBe("none");
      const card = render(
        <Theme appearance={appearance}>
          <Card>x</Card>
        </Theme>,
      ).querySelector<HTMLElement>(".kui-card")!;
      expect(
        computed(card, "background-image"),
        `${appearance}: no pane catches light at all — this law's control is gone`,
      ).not.toBe("none");
    }
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

describe("it knows its direction (§20)", () => {
  /**
   * `PortalScope` stamps `dir` on the portal wrapper out of `FloatingDirectionContext`. Tooltip
   * once provided none, so it took the context's default — a hard-coded `ltr` (audit
   * 2026-08-26). Popover's own law, one family member over, and the defect was identical in
   * both.
   */
  function inDocumentDirection<T>(dir: string, run: () => T): T {
    const had = document.documentElement.getAttribute("dir");
    document.documentElement.setAttribute("dir", dir);
    try {
      return run();
    } finally {
      if (had === null) document.documentElement.removeAttribute("dir");
      else document.documentElement.setAttribute("dir", had);
    }
  }

  it("an RTL document opens an RTL tooltip — the stamp states the direction, it does not invent one", () => {
    // The stamp is written ALWAYS, so an unprovided direction is not "unknown": it is `ltr`,
    // and it OVERRIDES the `rtl` the portal would have inherited from the document on its own.
    const rtl = inDocumentDirection("rtl", () => {
      const { popup } = openTooltip({});
      const portal = popup.closest<HTMLElement>(".kui-portal");
      if (!portal) throw new Error("no portal wrapper — the law would assert nothing");
      return { stamp: portal.getAttribute("dir"), dir: computed(popup, "direction") };
    });
    expect(rtl.stamp, "the wrapper stamped a direction the document does not have").toBe("rtl");
    expect(rtl.dir, "the tooltip computes the wrong direction").toBe("rtl");

    // The calibration: an LTR document still answers `ltr`, or the assertion above passes on a
    // wrapper that had simply stopped stamping.
    const ltr = inDocumentDirection("ltr", () => {
      const { popup } = openTooltip({});
      return {
        stamp: popup.closest<HTMLElement>(".kui-portal")!.getAttribute("dir"),
        dir: computed(popup, "direction"),
      };
    });
    expect(ltr.stamp).toBe("ltr");
    expect(ltr.dir).toBe("ltr");
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

/**
 * THE AGREEMENT LAW: PORTALLED ≡ IN-FLOW (§20, ENGINEERING §2.1 — added 2026-08-29, the
 * ultracode audit).
 *
 * ENGINEERING §2.1 names this as owed by every portalling component, and Tooltip was the only
 * one in the package without it: menu, select, dialog, alert-dialog and popover each write their
 * own, and §32's shipping record neither counted it nor waived it. The mechanism is shared —
 * `PortalScope` renders the bare `<Theme>` that carries the axes across, because React context
 * crosses a portal and DOM attributes do not — but the obligation is per component precisely
 * because the shared walk cannot know which axes a given pane actually consumes.
 *
 * Three axes were already carried here by other laws (appearance, density, contrast) and three
 * were not (radius, pointer, depth) — and `depth` is the one with a visible consequence: a
 * dropped re-stamp means an elevated app's tooltips silently stop casting.
 *
 * The twin's identity is READ OFF a real panel rather than restated, which is the second-home
 * lesson the menu and select twins learned: a hand-copied class list is a second statement of
 * the component's identity and drifts the day the component's does.
 */
describe("the agreement law: portalled ≡ in-flow (§20, §32)", () => {
  /** Every axis pushed off its default at once — the set a portal must carry (§20). */
  const HOSTILE: ThemeProps = {
    appearance: "dark",
    density: "compact",
    radius: "large",
    pointer: "coarse",
    depth: "elevated",
  };

  function facts(el: HTMLElement) {
    const cs = getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      border: cs.borderTopColor,
      radius: cs.borderTopLeftRadius,
      paddingBlock: cs.paddingBlockStart,
      paddingInline: cs.paddingInlineStart,
      shadow: cs.boxShadow,
      direction: cs.direction,
      // The POINTER's own reader, and it is the WORDS rather than the pane. Nothing about a
      // tooltip's box answers that axis — the inset is a layout-space pick (density), the corner
      // is the surface band (density-invariant), and it is not on the control height ladder — so
      // a facts list of box values alone carries five axes of six and goes green on a portal
      // that dropped the sixth. What coarse moves here is the type (§17's handheld band): the
      // pane's own inherited size is 16px in both worlds and its `Text size="2"` is 14 against
      // 16, which is why the twin below places one.
      wordSize: getComputedStyle(el.querySelector<HTMLElement>(".kui-type")!).fontSize,
    };
  }

  function twin(theme: ThemeProps, identity: string) {
    let el: HTMLElement | null = null;
    render(
      <Theme {...theme}>
        <div
          ref={(n: HTMLDivElement | null) => void (el = n)}
          className={identity}
          data-size="1"
          data-tone="neutral"
          data-emphasis="quiet"
        >
          {/* The tooltip places its own words at the system's step (§15's ownership exception),
              so the twin must place the same ones or the pointer axis has no reader on this
              side of the comparison. */}
          <Text size="2">Undo</Text>
        </div>
      </Theme>,
    );
    if (!el) throw new Error("twin never mounted");
    return el as HTMLElement;
  }

  it("computes identical under the hostile axis set", () => {
    const identity = openTooltip({}).popup.className;
    const { popup } = openTooltip(HOSTILE);
    const twinEl = twin(HOSTILE, identity);
    expect(facts(popup)).toEqual(facts(twinEl));
    // The comparison CAN fail: the same twin under default axes disagrees. Without this the law
    // would pass on a package where every axis had stopped reaching either side.
    expect(facts(twin({}, identity))).not.toEqual(facts(twinEl));
  });

  it("carries contrast=high through the portal", () => {
    const identity = openTooltip({}).popup.className;
    const { popup } = openTooltip({ ...HOSTILE, contrast: "high" });
    const twinEl = twin({ ...HOSTILE, contrast: "high" }, identity);
    expect(facts(popup)).toEqual(facts(twinEl));
    expect(facts(twin(HOSTILE, identity))).not.toEqual(facts(twinEl));
  });
});
