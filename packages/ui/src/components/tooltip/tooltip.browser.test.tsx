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
import { userEvent } from "vitest/browser";

import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import {
  APPEARANCES,
  colorOn,
  computed,
  inMotion,
  render,
  settleAll,
  sweep,
  tokenOn,
  until,
} from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../dialog/dialog.tsx";
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

describe("it knows its direction and its anchor (§20, §22)", () => {
  /**
   * `PortalScope` stamps `dir` on the portal wrapper out of `FloatingDirectionContext`, and
   * the entry flight reads its anchor from the same object. Tooltip provided NEITHER, so both
   * took the context's default — a hard-coded `ltr` and no anchor — and an unprovided context
   * resolves to the nearest ENCLOSING provider rather than to its default, so a tooltip inside
   * a Dialog flew out of the dialog's trigger (audit 2026-08-26). Popover's own pair of laws,
   * one family member over, and the defect was identical in both.
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

  it("the flight's anchor is the tooltip's OWN trigger, inside a dialog as much as alone", async () => {
    /**
     * `--kui-anchor-w` is the persistent half of the runner's `if (trigger)` block — the one
     * flight var the release keeps — written from the very node the seed silhouette is
     * photographed off, so it answers both questions at once: is there an anchor, and is it
     * the right one. With no provider it is never written (measured: the empty string); inside
     * a Dialog it was written from the DIALOG's trigger.
     *
     * The two triggers are deliberately different widths, which is what makes "the wrong
     * anchor" a different number from "the right anchor" rather than the same one twice.
     */
    const host = render(
      <Theme>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button style={{ inlineSize: "300px" }}>Undo</Button>} />
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
      </Theme>,
    );
    const alone = document.querySelectorAll<HTMLElement>(".kui-tooltip-popup");
    const alonePopup = alone[alone.length - 1]!;
    const aloneTrigger = host.querySelector<HTMLElement>("button")!;
    // SEIZED, NOT RACED: the runner writes this on its own frame, so the law waits for the
    // value to EXIST. A tooltip with no anchor never writes it, and the wait runs out.
    await until(() => computed(alonePopup, "--kui-anchor-w") !== "", 3000);
    expect(
      computed(alonePopup, "--kui-anchor-w"),
      "the flight has no anchor at all — the chip grows out of the anchorless seed",
    ).not.toBe("");
    // `offsetWidth` and not the painted box: a flight reads the trigger's resting layout box.
    expect(parseFloat(computed(alonePopup, "--kui-anchor-w"))).toBeCloseTo(
      aloneTrigger.offsetWidth,
      0,
    );

    render(
      <Theme>
        <Dialog defaultOpen>
          <DialogTrigger render={<Button style={{ inlineSize: "500px" }}>Settings…</Button>} />
          <DialogContent>
            <DialogTitle>Settings</DialogTitle>
            <Tooltip defaultOpen>
              <TooltipTrigger render={<Button style={{ inlineSize: "70px" }}>Undo</Button>} />
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
          </DialogContent>
        </Dialog>
      </Theme>,
    );
    const nestedAll = document.querySelectorAll<HTMLElement>(".kui-tooltip-popup");
    const nested = nestedAll[nestedAll.length - 1]!;
    const inner = document.querySelector<HTMLElement>(".kui-dialog-popup button");
    if (!inner) throw new Error("the nested trigger never mounted");
    await until(() => computed(nested, "--kui-anchor-w") !== "", 3000);
    expect(
      parseFloat(computed(nested, "--kui-anchor-w")),
      "the tooltip flew out of the DIALOG's trigger — it read the enclosing direction context",
    ).toBeCloseTo(inner.offsetWidth, 0);
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

/**
 * A KEYBOARD-FOCUSED TOOLTIP FLIES (§8, §22, §32 — added 2026-08-29, the ultracode audit).
 *
 * Base UI's shared open-change path stamps `data-instant="focus"` for a `triggerFocus` open, and
 * the family's instant stand-down exempted only `click` and `dismiss` — so a keyboard user got a
 * chip that snapped into existence and vanished with no clock, where a pointer user got the
 * trigger's own silhouette unfurling. The tooltip is the member this reaches, because focus is
 * its ONLY keyboard route: it opens on hover for a pointer and on focus for everything else.
 *
 * It is the third instance of one defect. `click` was the same sentence in 2026-08-18 (every
 * keyboard Enter and Space lost the entry) and `dismiss` in 2026-08-22 (every keyboard Escape
 * lost the exit). An open is an open, with the same physics for every input.
 *
 * NOT A TIMING LAW, deliberately: it reads the stand-down's own outcome — a clock and a pose —
 * off a mounted popup, which is a static computed-value read and safe on any machine. The
 * `data-instant` assertion is the PREMISE, and without it the law would pass on a package where
 * Base UI had simply stopped stamping the attribute.
 */
describe("a keyboard-focused tooltip flies like a hovered one (§8, §32)", () => {
  it("the pose is on and the clocks run, on the one route a keyboard has", async () => {
    inMotion();
    // Scoped to THIS mount, and the panel taken as the LAST: mounts accumulate across the file,
    // so a bare `querySelector` reads a settled tooltip from an earlier law — the stale-popup
    // trap that has cost this suite three separate instrument bugs.
    const host = render(
      <Theme>
        <div style={{ padding: 200 }}>
          <button type="button">somewhere else</button>
          <Tooltip>
            <TooltipTrigger render={<Button>Undo</Button>} />
            <TooltipContent>Undo the last change</TooltipContent>
          </Tooltip>
        </div>
      </Theme>,
    );
    // A real Tab, not `.focus()`: Base UI's reason is `triggerFocus` only for input it trusts,
    // and a programmatic focus would stamp something else and make this law about nothing.
    host.querySelector<HTMLElement>("button")!.focus();
    await userEvent.keyboard("{Tab}");
    // Selected by its OWN words. Earlier laws in this file leave settled tooltips mounted, so
    // neither "the first" nor "the last" identifies this one — the stale-popup trap that has
    // cost this suite three separate instrument bugs.
    const mine = () =>
      [...document.querySelectorAll<HTMLElement>(".kui-tooltip-popup")].find((el) =>
        el.textContent?.includes("Undo the last change"),
      );
    if (!(await until(() => !!mine())))
      throw new Error("focus opened no tooltip — the law would assert nothing");
    const popup = mine()!;

    // THE PREMISE: this really is the stamped path. Without it the law passes on a Base UI that
    // stopped stamping, which is the case it exists to survive.
    expect(popup.getAttribute("data-instant"), "Base UI no longer stamps a focus open").toBe(
      "focus",
    );
    // The runner POSED it — a stand-down that returns before posing leaves no attribute at all.
    expect(
      popup.hasAttribute("data-unfurling"),
      "the runner stood down: a focus-opened tooltip is never posed, so it cannot fly",
    ).toBe(true);
    // …and there is a clock for the pose to run on. READ AFTER THE SEED COMES OFF, which is not
    // hygiene: `[data-unfurling][data-seed]` declares `transition: none` deliberately — the pose
    // is a HELD one, and the flight's transitions are the base rule's, applying the frame the
    // seed is released. A statement landing inside the seeded window therefore reads zero on a
    // correct package, which is what one run in three did before this line. Waited for by the
    // attribute rather than by a frame count, so no clock of the host's is involved.
    if (!(await until(() => !popup.hasAttribute("data-seed"))))
      throw new Error("the seed never came off — the flight never departed");
    const clocks = computed(popup, "transition-duration")
      .split(",")
      .map((d) => parseFloat(d));
    expect(
      Math.max(...clocks),
      "every clock is zero: the stylesheet still reads a focus open as instant",
    ).toBeGreaterThan(0);
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

/**
 * THE ENTRY IS A LIFT, NOT A SILHOUETTE (§32, 2026-08-31 — Kushagra: the family's unfurl is
 * "way too much, especially when it's on a larger surface"; the Clip-vs-Physics bench's
 * "Physics" tooltip is the reference).
 *
 * Three claims, each read off a SEIZED clock rather than raced: the chip's box never moves
 * (no size or travel channel is running — only scale and paint), the seed is the landed box
 * scaled toward the trigger's edge (station 0 of the scale sweep is the pose itself), and the
 * words ride with the chip rather than printing into it (no blur, no fade of their own).
 *
 * THE FIXTURE IS THE LAW: the trigger is far WIDER than the chip. On a button-sized trigger the
 * silhouette and the landed chip are nearly one box, so a pose that photographed the trigger
 * would pass every assertion below — which is the degenerate-fixture rule, and the exact case
 * the complaint names. A Menu on an identical trigger is the negative control: its width DOES
 * fly, so if the tooltip's box also flew the tooltip's rule reached nothing.
 */
describe("the entry is a LIFT, not a silhouette (§32, 2026-08-31)", () => {
  const WIDE = 420;
  function mountWide() {
    inMotion();
    render(
      <Theme>
        <div style={{ padding: "200px 0 0 200px" }}>
          <Tooltip defaultOpen>
            <TooltipTrigger
              render={
                <Button emphasis="quiet" bordered style={{ width: WIDE }}>
                  A whole card-width trigger
                </Button>
              }
            />
            <TooltipContent>Open this</TooltipContent>
          </Tooltip>
          <Menu>
            <MenuTrigger
              render={
                <Button emphasis="quiet" bordered style={{ width: WIDE }}>
                  The same trigger, a menu
                </Button>
              }
            />
            <MenuContent align="center">
              <MenuItem>Rename</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Theme>,
    );
    const popups = document.querySelectorAll<HTMLElement>(".kui-tooltip-popup");
    const popup = popups[popups.length - 1];
    if (!popup) throw new Error("the tooltip never mounted — the law would read nothing");
    const [trigger, menuTrigger] = [...document.querySelectorAll<HTMLElement>("button")];
    return { popup, trigger: trigger!, menuTrigger: menuTrigger! };
  }
  const channels = (el: Element) =>
    el.getAnimations().map((a) => (a as CSSTransition).transitionProperty);

  it("only scale and paint move: no size, no travel, no corner — the box is its landed box from frame one", async () => {
    const { popup, trigger, menuTrigger } = mountWide();
    // The flight must DEPART — the runner's laid-out guard reads the posed rect against the
    // natural one, and a pose the same size as its box would be read as "not laid out yet" and
    // bail without flying. A scaled rect measures narrower, which is what lets it pass; this
    // line is where that would fail.
    if (!(await until(() => channels(popup).includes("scale"))))
      throw new Error("the entry never departed on the scale channel — the guard bailed, or the pose is gone");
    const running = channels(popup);
    for (const still of ["width", "height", "translate", "border-top-left-radius"])
      expect(running, `${still} is flying — the tooltip's box is not its landed box`).not.toContain(still);
    expect(running, "the chip paints in on its own clock").toContain("opacity");

    // Calibration: the trigger out-sizes the chip by a wide margin, or a silhouette and a lift
    // are the same box.
    const landed = popup.getBoundingClientRect();
    expect(trigger.getBoundingClientRect().width, "the trigger must dwarf the chip").toBeGreaterThan(
      landed.width + 100,
    );

    // The negative control: the family's size channel is alive on the same trigger. HEIGHT,
    // because a menu's floor is its trigger's width and its silhouette IS that box, so on a wide
    // trigger the width never changes — the first run of this law waited for a width clock that
    // a correct menu never starts.
    menuTrigger.click();
    const menu = () => {
      const all = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
      return all[all.length - 1];
    };
    if (!(await until(() => !!menu() && channels(menu()!).includes("height"))))
      throw new Error("the menu's height never flew — the control proves nothing");
  });

  it("the seed is the landed box scaled toward the trigger's edge, faint — and the centre and that edge never move", async () => {
    const { popup, trigger } = mountWide();
    if (!(await until(() => channels(popup).includes("scale"))))
      throw new Error("the entry never departed on the scale channel");
    // LAYOUT width, not the rect: the rect is already scaled by the flight this line is
    // standing inside (measured 79.8 against an 88px chip on the first run of this law).
    const landedWidth = popup.offsetWidth;
    const seedScale = parseFloat(computed(popup, "--tooltip-seed"));
    expect(seedScale, "the seed scale token resolves").toBeGreaterThan(0.5);
    expect(seedScale, "…and is a seed, not full size").toBeLessThan(1);

    // Station 0 of the seized clock IS the pose. Read as a rect, which includes the scale.
    const series = await sweep(popup, "scale", () => {
      const r = popup.getBoundingClientRect();
      return { w: r.width, cx: (r.left + r.right) / 2, bottom: r.bottom, opacity: computed(popup, "opacity") };
    });
    const first = series[0]!;
    // The last station is scale 1 — the landed geometry, read the same way as every other.
    const last = series[series.length - 1]!;
    expect(first.w, "the seed is the chip's own box, scaled — not the trigger's width").toBeCloseTo(
      landedWidth * seedScale,
      0,
    );
    expect(first.w, "…and nowhere near the trigger").toBeLessThan(trigger.getBoundingClientRect().width / 2);
    expect(last.w, "and it lands at full size").toBeCloseTo(landedWidth, 0);
    // The chip lifts from the edge facing its trigger (a tooltip above its trigger grows up
    // from its bottom edge) and stays centred: at EVERY station the centre and that edge hold.
    for (const s of series) {
      expect(Math.abs(s.cx - last.cx), `the centre drifted at w=${s.w.toFixed(1)}`).toBeLessThan(1);
      expect(Math.abs(s.bottom - last.bottom), `the trigger-facing edge moved at w=${s.w.toFixed(1)}`).toBeLessThan(1);
    }
    // Vacuity guard: the sweep genuinely passed through sizes.
    expect(Math.max(...series.map((s) => s.w)) - first.w, "the scale never opened").toBeGreaterThan(2);

    // Faint at the seed, on the PAINT channel — read on its own seized clock.
    const paint = await sweep(popup, "opacity", () => computed(popup, "opacity"), 4);
    expect(paint[0], "the chip arrives faint, not opaque like a silhouette").toBe("0");
    expect(paint[paint.length - 1], "…and paints in").toBe("1");
  });

  it("the words ride WITH the chip: no print of their own, and no clock for one", async () => {
    const { popup } = mountWide();
    if (!(await until(() => channels(popup).includes("scale"))))
      throw new Error("the entry never departed on the scale channel");
    const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;
    // Nothing on the body is animating: the family's molten print (blur, fade, echo, squish)
    // is stood down whole, so the body has no changed channel to run.
    expect(channels(body), "the body is printing on its own — it should be part of the chip").toEqual([]);
    expect(computed(body, "filter"), "the words are not blurred").toBe("none");
    expect(computed(body, "opacity"), "the words carry no fade of their own").toBe("1");
    expect(computed(body, "scale"), "the words are not squished").toBe("none");
  });

  it("the curve is the CALM spring on the tooltip's own clock — the bench's physics, not the family's elastic", async () => {
    const { popup, trigger } = mountWide();
    if (!(await until(() => channels(popup).includes("scale"))))
      throw new Error("the entry never departed on the scale channel");
    const scale = popup.getAnimations().find((a) => (a as CSSTransition).transitionProperty === "scale")!;
    const timing = scale.effect!.getComputedTiming();
    // The curve's SAMPLES, one per stop: the browser re-serializes `linear()` (the first stop
    // comes back as `0 0%`), so the strings never agree and the values are what identify a
    // curve. The bench's `--spring` IS this package's `--motion-spring` — same samples — and
    // the family's channel rides `--motion-spring-elastic`, which is what this law tells apart.
    const samples = (v: string) =>
      v
        .replace(/^linear\(|\)$/g, "")
        .split(",")
        .map((stop) => stop.trim().split(/\s+/)[0] ?? "")
        .join(",");
    expect(samples(timing.easing ?? ""), "the scale rides the elastic spring, not the calm one").toBe(
      samples(computed(popup, "--motion-spring")),
    );
    expect(samples(computed(popup, "--motion-spring")), "calibration: the two curves differ").not.toBe(
      samples(computed(popup, "--motion-spring-elastic")),
    );
    expect(timing.duration, "the scale is on the tooltip's own clock").toBe(parseFloat(computed(popup, "--tooltip-form")));
    const paint = popup.getAnimations().find((a) => (a as CSSTransition).transitionProperty === "opacity")!;
    expect(paint.effect!.getComputedTiming().duration).toBe(parseFloat(computed(popup, "--tooltip-paint")));
    // Calibration: the family's clocks differ, so the list is the tooltip's and not a borrow.
    expect(computed(trigger, "--floating-corner")).not.toBe(computed(trigger, "--tooltip-form"));
    // And the flight RELEASES on that clock: the runner reads the longest declared clock off
    // the element, so left on the family's list a chip landed at 300 sat posed past the 510
    // spread. Bounded well under that and well over the tooltip's own.
    const form = parseFloat(computed(popup, "--tooltip-form"));
    const t0 = performance.now();
    if (!(await until(() => !popup.hasAttribute("data-unfurling"), form * 3)))
      throw new Error("the flight never released");
    expect(performance.now() - t0, "released on the family's long clock, not the tooltip's").toBeLessThan(form + 200);
  });

  it("the exit returns to the seed, not the family's 2% settle", async () => {
    inMotion();
    render(
      <Theme>
        <div style={{ padding: 200 }}>
          <Tooltip defaultOpen>
            <TooltipTrigger render={<Button emphasis="quiet" bordered>Undo</Button>} />
            <TooltipContent>Undo the last change</TooltipContent>
          </Tooltip>
        </div>
      </Theme>,
    );
    const mine = () =>
      [...document.querySelectorAll<HTMLElement>(".kui-tooltip-popup")].find((el) =>
        el.textContent?.includes("Undo the last change"),
      )!;
    if (!(await until(() => !!mine() && !mine().hasAttribute("data-unfurling"))))
      throw new Error("the tooltip never landed");
    const popup = mine();
    const trigger = [...document.querySelectorAll<HTMLElement>("button")].find((b) => b.textContent === "Undo")!;
    // A real leave: the pointer arrives and departs, which is the only way a tooltip closes.
    await userEvent.hover(trigger);
    await userEvent.unhover(trigger);
    if (!(await until(() => popup.hasAttribute("data-ending-style"))))
      throw new Error("the tooltip never began to close");
    // The TARGET, read off the running transition's keyframes — the computed value mid-exit
    // is wherever the clock has got to, and would pass on the family's 0.98 for a frame.
    const scale = popup.getAnimations().find((a) => (a as CSSTransition).transitionProperty === "scale");
    if (!scale) throw new Error("no scale transition on the exit — the exit is not moving");
    const frames = (scale.effect as KeyframeEffect).getKeyframes() as { scale?: string }[];
    expect(parseFloat(frames[frames.length - 1]!.scale ?? ""), "the exit settles somewhere other than the seed").toBeCloseTo(
      parseFloat(computed(popup, "--tooltip-seed")),
      3,
    );
  });
});
