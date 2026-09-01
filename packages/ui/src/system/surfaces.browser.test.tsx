/**
 * The surface layer's MOUNTED laws (§10, §22, §24) — added 2026-08-26 out of the audit.
 *
 * surfaces.test.ts beside this file reads the emitted declarations, which is the right
 * instrument for "is this stated". Everything here is the other question — "does it WIN" — and
 * every finding it was written for was a rule that was stated correctly and lost, or a value
 * that arrived from an element no rule had named. Those are cascade outcomes, and a cascade
 * outcome is only visible through a mounted `<Theme>`.
 *
 * Each law carries the arm that makes its fixture non-degenerate, because in every one of these
 * the obvious fixture cannot tell a working mechanism from an absent one: two identical panes,
 * a pane with no material stamped, a pane whose two axes happen to hold the same number.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";

import {
  APPEARANCES,
  GLASS_MATERIALS,
  asksForStillness,
  colorOn,
  computed,
  inMotion,
  mounted,
  probeIn,
  render,
  sweep,
  until,
  within,
} from "../test/browser.tsx";
import { Theme } from "../theme/theme.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "../components/alert-dialog/alert-dialog.tsx";
import { Button } from "../components/button/button.tsx";
import { Card } from "../components/card/card.tsx";
import { Checkbox } from "../components/checkbox/checkbox.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../components/menu/menu.tsx";
import { Notice } from "../components/notice/notice.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover/popover.tsx";
import { Radio, RadioGroup } from "../components/radio/radio.tsx";
import { Text } from "../components/text/text.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip/tooltip.tsx";

/**
 * The alpha of a resolved colour, CALIBRATED before it is used (the 2026-08-08 lesson, and the
 * 2026-08-24 repeat of it): a bare `[\d.]+` sweep reads the *3 in `display-p3`* as a channel,
 * and canvas `fillStyle` answers black for a `color()` it cannot parse. Chromium hands back
 * `color(srgb r g b / a)` here and `rgba(r, g, b, a)` there, so both spellings are read
 * explicitly and anything else throws rather than guessing.
 */
function alphaOf(css: string): number {
  if (!/^(rgba?|color)\(.*\)$/.test(css)) throw new Error(`alphaOf: not a colour — ${css}`);
  const slash = css.lastIndexOf("/");
  if (slash !== -1) return parseFloat(css.slice(slash + 1));
  const fn = /^rgba?\(([^)]*)\)$/.exec(css);
  if (fn) {
    const parts = fn[1]!.split(",").map((s) => s.trim());
    if (parts.length > 3) return parseFloat(parts[3]!);
  }
  // No slash and no fourth component: CSS omits an alpha of 1 when it serialises.
  return 1;
}

/** The no-op shadow pair, as this browser writes it — never a literal string of my own. */
const noCast = (el: Element): string =>
  probeIn(
    el,
    (probe) => (probe.style.boxShadow = "0 0 0 0 transparent, 0 0 0 0 transparent"),
    (s) => s.boxShadow,
  );

describe("the instrument", () => {
  it("alphaOf answers a known input in both spellings this engine emits", () => {
    const host = mounted(<Card>Body</Card>, { theme: {} });
    expect(alphaOf(colorOn(host, "rgb(0 0 0 / 0.5)"))).toBeCloseTo(0.5, 4);
    expect(alphaOf(colorOn(host, "#ffffff"))).toBe(1);
    // And it REFUSES what it cannot read, rather than answering a channel — the failure mode
    // that scored a defect and its fix identically twice in this repo.
    expect(() => alphaOf("none")).toThrow();
  });
});

/* ── The lighting positions against the border box, on panes AND controls (2026-08-30) ──────
   The defect this pins: origin defaults to the padding box while clip defaults to the border
   box and repeat defaults on — so over a transparent border, a sheen gradient's tile ran one
   border-width short of its painted area and REPEAT wrapped the tile's own bright top into
   the bottom strip: a one-pixel light line lying along a dark card's bottom edge, stopping
   where the corner curve leaves it (measured: body L≈27, bottom edge rows 49–51, the top
   sheen's own value). A dark loud Button had the identical wrap from its light catch, one
   layer down. Light mode hid both — a white line on a white seal — which is why the law
   walks both appearances. Falsified by construction: against the pre-fix stylesheets this
   read "padding-box" in every cell. */

describe("a gradient painted over a transparent border cannot wrap (2026-08-30)", () => {
  for (const appearance of APPEARANCES) {
    it(`pane and control lighting originate at the border box (${appearance})`, () => {
      // A real wrapper div: mounted() hands back the FIRST child, and a fragment's first
      // child would be the Card itself — querySelector then searches its descendants and
      // finds neither subject (the 2026-08-08 `within()` finding, caught here by the
      // not-null guard).
      const host = mounted(
        <div>
          <Card>Body</Card>
          <Button tone="accent" emphasis="loud">
            Send
          </Button>
        </div>,
        { theme: { appearance } },
      );
      for (const sel of [".kui-surface", ".kui-button"] as const) {
        const el = host.querySelector<HTMLElement>(sel);
        expect(el, `${sel} mounted`).not.toBeNull();
        const cs = getComputedStyle(el!);
        // Every layer: a multi-layer background resolves one origin per layer, and the wrap
        // returns the moment any gradient layer slips back to the padding box.
        for (const origin of cs.backgroundOrigin.split(",")) {
          expect(origin.trim(), `${sel}'s lighting origin (${appearance})`).toBe("border-box");
        }
      }
    });
  }
});

/* ── A card that is DEAD because the control it labels is (§10, 2026-08-26 audit) ──────────── */

describe("a dead interactive surface is dead in every member, the LABEL included (§10)", () => {
  /** The two cards, in one mount, under one Theme: only the radio's state differs. */
  function pair(appearance: (typeof APPEARANCES)[number]) {
    const host = mounted(
      <RadioGroup>
        <Card render={<label />}>
          <Radio value="dead" disabled />
          <Text>Unavailable on your plan</Text>
        </Card>
        <Card render={<label />}>
          <Radio value="live" />
          <Text>Included</Text>
        </Card>
      </RadioGroup>,
      { theme: { appearance, depth: "elevated" } },
    );
    const cards = [...host.querySelectorAll<HTMLElement>(".kui-card")];
    expect(cards, "the fixture must mount two cards to compare").toHaveLength(2);
    return { dead: cards[0]!, live: cards[1]! };
  }

  for (const appearance of APPEARANCES) {
    it(`${appearance}: the fill recedes, the ink dims, the cursor stops promising, the cast goes`, () => {
      const { dead, live } = pair(appearance);
      // THE PREMISE, asserted rather than assumed: the state really is on the control and never
      // on the surface — which is the whole finding. A `<label>` cannot match `:disabled`, and
      // Base UI stamps `data-disabled` on the radio ROOT, the element wearing `.kui-control`.
      expect(dead.hasAttribute("data-disabled"), "the label must NOT carry the state").toBe(false);
      expect(
        within(dead, ".kui-control").hasAttribute("data-disabled"),
        "the control inside must carry it",
      ).toBe(true);

      // Four channels, each read against the token the layer says it should resolve — not
      // merely "different from the live twin", which a card that dimmed only its ink would
      // satisfy in three of the four.
      expect(computed(dead, "background-color"), "the fill did not recede to the dead step").toBe(
        colorOn(dead, "var(--disabled-fill)"),
      );
      expect(computed(dead, "color"), "the words kept their strength").toBe(
        colorOn(dead, "var(--disabled-ink)"),
      );
      expect(computed(dead, "cursor"), "a dead card still promised a press").toBe(
        tokenCursor(dead),
      );
      expect(computed(dead, "box-shadow"), "a dead card cannot be picked up").toBe(noCast(dead));

      // THE CALIBRATION, and without it every assertion above is satisfiable by a system that
      // has no interactive surface at all: the live twin must genuinely be pressable and lifted,
      // and must differ from the dead one in each channel.
      expect(computed(live, "cursor"), "the live twin is not pressable — the fixture is inert").toBe(
        "pointer",
      );
      expect(computed(live, "box-shadow"), "the live twin does not cast — nothing is being removed")
        .not.toBe(noCast(live));
      expect(computed(live, "background-color")).not.toBe(computed(dead, "background-color"));
      expect(computed(live, "color")).not.toBe(computed(dead, "color"));
    });
  }
});

/** The disabled cursor as the theme resolves it — the token, never the keyword, so a retuned
    `--cursor-disabled` moves the law with it. */
function tokenCursor(el: Element): string {
  return probeIn(el, (probe) => (probe.style.cursor = "var(--cursor-disabled)"), (s) => s.cursor);
}

/* ── A dead pane on GLASS (§5, §10, 2026-08-26 audit) ──────────────────────────────────────── */

describe("a dead pane does not lift, and glass does not give the lift back (§5, §10)", () => {
  function pane(appearance: (typeof APPEARANCES)[number], material: string, disabled: boolean) {
    return mounted(
      <Card backdrop render={disabled ? <button disabled /> : <button />}>
        Body
      </Card>,
      { theme: { appearance, material: material as "thin", depth: "elevated" } },
    );
  }

  for (const appearance of APPEARANCES) {
    for (const material of GLASS_MATERIALS) {
      it(`${appearance}/${material}: the transmitted cast and the pool both go`, () => {
        const dead = pane(appearance, material, true);
        const live = pane(appearance, material, false);
        // The premise: the fixture reached the glass rules at all. Without a stamped material
        // both subjects resolve `solid`, the (0,2,0) rules that defeat the stand-down never
        // match, and this law measures the one cell that was always right.
        expect(dead.getAttribute("data-material"), "the fixture never went glass").toBe(material);
        expect(computed(dead, "box-shadow"), "a dead glass pane still lifts").toBe(noCast(dead));
        // The calibration: the same glass, alive, DOES cast — so "no shadow" is a removal here
        // and not a world that casts nothing.
        expect(computed(live, "box-shadow"), "the live glass pane casts nothing either").not.toBe(
          noCast(live),
        );
      });
    }
  }
});

describe("the dead fill is a VEIL on glass, never a veil of a veil (§10, 2026-08-19's rule)", () => {
  for (const material of GLASS_MATERIALS) {
    it(`${material}: the dead pane's veil is the thickness the ladder was judged at`, () => {
      const dead = mounted(
        <Card backdrop render={<button disabled />}>
          Body
        </Card>,
        { theme: { appearance: "light", material, depth: "elevated" } },
      );
      const live = mounted(
        <Card backdrop render={<button />}>
          Body
        </Card>,
        { theme: { appearance: "light", material, depth: "elevated" } },
      );
      expect(dead.getAttribute("data-material"), "the fixture never went glass").toBe(material);
      // The claim, stated as an AGREEMENT rather than against a recomputed number: the veil is
      // the pane's thickness whatever colour the pane is wearing. `color-mix(src <alpha>,
      // transparent)` assumes an opaque source, so an alpha source multiplies — the dead step
      // is one ramp step (light `#000 3.1%`) and pre-fix a regular dead pane measured
      // `color(srgb 0 0 0 / 0.01519)` against a designed 49%.
      expect(
        alphaOf(computed(dead, "background-color")),
        "the dead fill's alpha multiplied through the veil",
      ).toBeCloseTo(alphaOf(computed(live, "background-color")), 4);
      // The calibration: the two panes must genuinely differ in PIGMENT, or "same alpha" is
      // satisfied by a dead pane that never receded at all.
      expect(computed(dead, "background-color"), "the dead pane never receded").not.toBe(
        computed(live, "background-color"),
      );
    });
  }

  it("and under prefers-reduced-transparency, where the pane's own cast is stood down (§10)", async () => {
    // The cell the reported finding mis-stated and the verdict corrected: that block sets
    // `--kui-sf-cast: initial` for a SEALED pane, live or dead, so the chain falls through to
    // the world's FULL `--kui-surface-chrome` rather than to a transmitted row. A stand-down
    // written only against the pane-local names therefore lands a dead pane on the biggest
    // shadow in the world — which is why the disabled arm names the world's chrome too.
    const { cdp } = await import("vitest/browser");
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
    });
    try {
      const dead = mounted(
        <Card backdrop render={<button disabled />}>
          Body
        </Card>,
        { theme: { appearance: "light", material: "regular", depth: "elevated" } },
      );
      const live = mounted(
        <Card backdrop render={<button />}>
          Body
        </Card>,
        { theme: { appearance: "light", material: "regular", depth: "elevated" } },
      );
      // The premise: the setting really is on, so this is the sealed path and not the glass one.
      expect(computed(dead, "backdrop-filter"), "the setting never reached the pane").toBe("none");
      expect(computed(dead, "box-shadow"), "a dead sealed pane still lifts").toBe(noCast(dead));
      expect(computed(live, "box-shadow"), "the sealed live pane casts nothing either").not.toBe(
        noCast(live),
      );
    } finally {
      await cdp().send("Emulation.setEmulatedMedia", { features: [] });
    }
  });

  it("and the twin STOPS AT THE PANE — an unmarked member inside it keeps the alpha step", () => {
    // The regression the first spelling of the fix shipped, caught by measurement before it
    // left the working tree. Written against `--disabled-fill` (the control layer's own shape)
    // the re-point INHERITED, and a member that stamps no material has no veil to mix an
    // opaque source back down with: a disabled Checkbox inside a glass Card painted the twin
    // raw. The re-point names `--kui-sf-fill-src` instead, which is the pane's own.
    const glass = mounted(
      <Card backdrop>
        <Checkbox disabled />
      </Card>,
      { theme: { appearance: "light", material: "regular" } },
    );
    const mark = within(glass, ".kui-checkbox");
    // The premise, and it is the whole mechanism: this member asks for no material of its own,
    // so nothing here can mix an opaque value back down.
    expect(mark.getAttribute("data-material"), "the mark stamps a material — wrong fixture").toBeNull();
    const solid = mounted(
      <Card>
        <Checkbox disabled />
      </Card>,
      { theme: { appearance: "light" } },
    );
    expect(
      computed(mark, "background-color"),
      "the pane's opaque twin leaked into a member that has no veil",
    ).toBe(computed(within(solid, ".kui-checkbox"), "background-color"));
    // The calibration: the value that must NOT have arrived is a real, different one.
    expect(computed(mark, "background-color")).not.toBe(
      colorOn(mark, "var(--disabled-fill-solid)"),
    );
  });

  it("and a SOLID dead pane keeps the alpha step — the twin is glass's, not the system's", () => {
    // The non-regression arm, and it is the reason the re-point is scoped to `[data-material]`:
    // the 2026-08-17 ramp move made the dead fill an alpha precisely so it composites against
    // its own local ground. Re-pointing it everywhere would be the cheap way to pass the laws
    // above and would flatten a dead card sitting on a Ground.
    const dead = mounted(<Card render={<button disabled />}>Body</Card>, {
      theme: { appearance: "light", depth: "elevated" },
    });
    expect(dead.getAttribute("data-material"), "the fixture must NOT be glass").toBeNull();
    expect(
      alphaOf(computed(dead, "background-color")),
      "the dead step went opaque off glass — it can no longer sit on a Ground",
    ).toBeLessThan(1);
    // Stated against the TWIN and not against `--disabled-fill`: a global re-point moves that
    // name, so a law comparing the fill to it would move with the defect and pass. The twin is
    // the thing that must not have arrived here.
    expect(
      computed(dead, "background-color"),
      "a solid pane took glass's opaque twin",
    ).not.toBe(colorOn(dead, "var(--disabled-fill-solid)"));
  });
});

/* ── ON GLASS: a member's lighting is its own (§10, 2026-08-26 audit) ──────────────────────── */

describe("an on-glass member states its lighting, it does not inherit the pane's (§10)", () => {
  function nested(material: "thin" | "regular" | "thick") {
    const host = mounted(
      <Card backdrop>
        <Notice>Approaching the weekly limit</Notice>
      </Card>,
      { theme: { appearance: "light", material } },
    );
    const inner = within(host, ".kui-notice");
    expect(inner.getAttribute("data-material"), "the inner pane never resolved on-glass").toBe(
      "on-glass",
    );
    return { pane: host, inner };
  }

  it("its rim is the same recipe inside a thin pane and inside a thick one", () => {
    const thin = nested("thin");
    const thick = nested("thick");
    // THE CALIBRATION FIRST, because it is the whole reason the law can say anything: the two
    // ANCESTORS must genuinely wear different rims. Pre-fix the inner panes differed by exactly
    // this amount — a 19.04% bloom and a 13.6% sheen against 35.7% and 25.5% — because the
    // unregistered `--kui-sf-light` reached them by inheritance and nothing declared it here.
    expect(
      computed(thin.pane, "background-image"),
      "the two ancestor panes light identically — the fixture cannot see a leak",
    ).not.toBe(computed(thick.pane, "background-image"));

    expect(
      computed(thin.inner, "background-image"),
      "an on-glass member's lighting changes with an ancestor's thickness",
    ).toBe(computed(thick.inner, "background-image"));
  });

  it("and that recipe is the SOLID rim — a member renders its solid appearance (§10 clause 6)", () => {
    const { inner } = nested("regular");
    const solid = mounted(<Card>Body</Card>, { theme: { appearance: "light" } });
    expect(computed(inner, "background-image")).toBe(computed(solid, "background-image"));
    // …and the pane it sits in does NOT wear that recipe, or the line above is comparing a
    // world with one rim in it against itself.
    const { pane } = nested("regular");
    expect(computed(pane, "background-image")).not.toBe(computed(solid, "background-image"));
  });
});

/* ── The entry flight's body pin, per AXIS (§22, 2026-08-26 audit) ─────────────────────────── */

describe("the flight pins the body at the pane's OWN padding, on BOTH axes (§22)", () => {
  /** Mount airborne and hand back the popup with its body. Read at the mount EDGE: `begin()`
      runs in the mount commit, so the stamp is there synchronously — the premise below is what
      turns "it had not started yet" into a failure rather than a pass. */
  function airborne(ui: React.ReactElement, selector: string) {
    inMotion();
    render(<Theme>{ui}</Theme>);
    const popups = document.querySelectorAll<HTMLElement>(selector);
    const popup = popups[popups.length - 1]!;
    expect(popup, `${selector} never mounted`).toBeTruthy();
    expect(popup.hasAttribute("data-unfurling"), "the premise: the panel is airborne").toBe(true);
    return { popup, body: within(popup, ".kui-floating-body") };
  }

  /** The pin, on whichever edge the placement chose — read off the popup's own stamps rather
      than assumed, so this holds wherever the positioner puts the panel. */
  function pinned(popup: HTMLElement, body: HTMLElement) {
    const side = popup.getAttribute("data-side");
    const align = popup.getAttribute("data-align");
    expect(side, "the positioner stamped no side — the per-side arms cannot apply").toBeTruthy();
    // A CENTRED AXIS HAS NO PADDING PIN, and saying so is what keeps this law from going vacuous
    // (2026-08-29). Both fixtures below state `align="start"` for exactly this reason: on a
    // centre-aligned panel the body is held by its own middle, so the axis `align` governs is
    // pinned at 50% and reading a padding there measures nothing. It used to read 12px and pass,
    // which was the OVER-CONSTRAINT's own output — two insets plus `margin: auto` on a box that
    // did not fit resolve by dropping the end inset, leaving the start one showing the padding.
    // The law was reading a defect and calling it the guarantee.
    expect(align, "a centred axis is pinned by the body's middle, not by a padding").not.toBe(
      "center",
    );
    const blockEnd = side === "top" || align === "end";
    const inlineEnd = align === "end" && (side === "top" || side === "bottom");
    return {
      block: [
        computed(body, blockEnd ? "inset-block-end" : "inset-block-start"),
        computed(popup, blockEnd ? "padding-block-end" : "padding-block-start"),
      ],
      inline: [
        computed(body, inlineEnd ? "inset-inline-end" : "inset-inline-start"),
        computed(popup, inlineEnd ? "padding-inline-end" : "padding-inline-start"),
      ],
    } as const;
  }

  it("a TOOLTIP, whose two axes are priced differently, is pinned right on each of them", () => {
    const { popup, body } = airborne(
      <>
        <div style={{ height: 200 }} />
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button>Undo</Button>} />
          <TooltipContent align="start">Undo the last change</TooltipContent>
        </Tooltip>
      </>,
      ".kui-tooltip-popup",
    );
    const { block, inline } = pinned(popup, body);
    // THE FIXTURE IS THE LAW HERE. A pane whose two insets hold the same number cannot tell a
    // per-axis pin from a one-value one — which is exactly why this shipped: the inline axis
    // coincided at 12 vs 12 and the block axis was 12 against a real 4.
    expect(block[1], "this pane pads its two axes alike — it cannot see a one-axis failure").not.toBe(
      inline[1],
    );
    expect(block[0], "the flight pins the block axis at some other pane's padding").toBe(block[1]);
    expect(inline[0], "the flight pins the inline axis at some other pane's padding").toBe(inline[1]);
  });

  it("and a POPOVER, whose axes agree, is unmoved by the pair — the control", () => {
    const { popup, body } = airborne(
      <>
        <div style={{ height: 200 }} />
        <Popover defaultOpen>
          <PopoverTrigger render={<Button>Open</Button>} />
          <PopoverContent align="start" aria-label="Details">Popover content here</PopoverContent>
        </Popover>
      </>,
      ".kui-popover-popup",
    );
    const { block, inline } = pinned(popup, body);
    expect(block[0]).toBe(block[1]);
    expect(inline[0]).toBe(inline[1]);
    // The pane this one is: an isotropic inset, which is what makes it the control rather than
    // a second copy of the law above.
    expect(block[1]).toBe(inline[1]);
  });
});

/* ── A CENTRED panel grows out of its trigger from the MIDDLE (§22, 2026-08-31) ───────────── */

/**
 * Kushagra: the popover "for some reason goes left". Measured on a default popover (a narrow
 * trigger, a wide panel): the pane was pinned by its START edge — the base flight rule's
 * default, and the one alignment for which the aim's inline offset is not zero by geometry —
 * so `--kui-from-x` read 182px and rode the FALL clock while the width rode the SPREAD clock.
 * The start edge slammed left in 345ms while the far edge was still opening over 510ms, and
 * the pane's centre swung 442 → 630 → 623 across one unfurl.
 *
 * Read as two numbers the fix writes and one it cannot: the seed's offset (which a start-pinned
 * centre cell writes as the half-difference of the two widths, and a centre-pinned one writes
 * as ~0), and the pane's centre across the width's OWN seized clock, which holds only while both
 * insets and auto margins re-centre the box on every layout of that travel. The overshoot
 * stations are named and excluded rather than tolerated: past the landed width the box is
 * over-constrained, the margins clamp at the start inset and the spill goes one way — the
 * elastic spring's own character, not a pin failure — so the law reads only the stations up to
 * the landed width, where a start-pinned pane is out by up to 90px.
 */
describe("a centred panel grows out of its trigger symmetrically (§22)", () => {
  it("the seed's inline offset is ~0 and the pane's centre holds through the width's travel", async () => {
    inMotion();
    // A MENU, centred by prop, because the law is about the family's pin and the menu is the
    // member whose seed is the trigger's silhouette — so `--kui-from-x` is the whole offset.
    // (Popover was the fixture that found it; its seed is a centred circle since the same day
    // and carries its own centring term, so the offset alone would no longer tell the story.)
    render(
      <Theme>
        <div style={{ padding: "200px 0 0 400px" }}>
          <Menu>
            <MenuTrigger render={<Button emphasis="quiet" bordered>Rename</Button>} />
            <MenuContent align="center">
              <MenuItem>This changes the name everywhere it appears in the workspace</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Theme>,
    );
    const trigger = document.querySelector<HTMLElement>("button")!;
    const triggerBox = trigger.getBoundingClientRect();
    trigger.click();
    const departed = await until(() => {
      const p = document.querySelector<HTMLElement>(".kui-menu-popup");
      return !!p && p.hasAttribute("data-unfurling") && !p.hasAttribute("data-seed");
    });
    expect(departed, "the premise: the flight departed").toBe(true);
    const popup = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    expect(popup.getAttribute("data-align"), "the premise: the default alignment is centre").toBe("center");
    const landed = parseFloat(popup.style.getPropertyValue("--kui-fly-w"));
    // THE CALIBRATION: a start pin and a centre pin coincide when the panel is no wider than
    // its trigger, so the fixture must hold a panel far wider than the button that opened it.
    expect(landed - triggerBox.width, "the panel must out-size its trigger to tell the pins apart").toBeGreaterThan(200);

    // The offset is measured from the positioner's MIDDLE (the inset is 50%), so for an
    // unshifted trigger it is exactly minus half the seed's width — the seed arm adds that
    // half back to land the silhouette's start on the trigger's. A start-pinned centre cell
    // measured the half-difference of the two widths here instead: 182px on this fixture.
    const fromX = parseFloat(popup.style.getPropertyValue("--kui-from-x"));
    const seedW = parseFloat(popup.style.getPropertyValue("--kui-seed-w"));
    expect(
      Math.abs(fromX + seedW / 2),
      "the seed was measured off an edge the trigger does not share — the start-pinned offset",
    ).toBeLessThan(2);

    const centre = (triggerBox.left + triggerBox.right) / 2;
    const series = await sweep(popup, "width", () => {
      const b = popup.getBoundingClientRect();
      return { width: b.width, centre: (b.left + b.right) / 2 };
    }, 20);
    // EVERY station, the overshoot included (2026-08-31, later the same day): the first
    // spelling of the pin was auto margins, which centre only while the box fits, so this law
    // excluded the stations past the landed width and called the 5px step there "the spring's
    // character". It was the pin's: an over-constrained box clamps at its start inset. The
    // transform pin cannot be over-constrained, so the calibration is now that the sweep
    // MUST contain overshoot stations, and the centre must hold on them too.
    expect(
      series.filter((s) => s.width > landed + 2).length,
      "the sweep never overshot — the elastic curve's own excursion is the case this law exists for",
    ).toBeGreaterThan(0);
    for (const s of series)
      expect(s.centre, `at width ${s.width.toFixed(1)} the pane's centre left its trigger's`).toBeCloseTo(centre, 0);
  });
});

/* ── Reduced motion reaches the EXITS (§8, 2026-08-26 audit) ───────────────────────────────── */

/**
 * The 2026-08-22 repair added `[data-ending-style]` arms for the floating and the alert families
 * to BOTH reduced-motion blocks, because every exit recipe re-declares `transition` on its own
 * one-attribute-heavier selector and the guard's bare-class arm lost the specificity fight. Only
 * the DIALOG's half of that repair had a mounted law: menu.browser.test.tsx and
 * alert-dialog.browser.test.tsx each read an OPEN panel, which carries no ending stamp, so the
 * arms the audit was written for were invisible to every law in the suite.
 *
 * The two arms are read together on purpose. Block one stands the CLOCK down and block two the
 * POSE, and either alone is inert — deleting only the clock leaves a settled panel with nothing
 * to travel, and deleting only the pose leaves values that never animate. Reading both is what
 * makes the single-arm sabotage fail too.
 */
describe("suppression is total, and it reaches the way OUT (§8)", () => {
  function landed(kind: "floating" | "alert") {
    render(
      <Theme>
        {kind === "floating" ? (
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>One</MenuItem>
              <MenuItem>Two</MenuItem>
            </MenuContent>
          </Menu>
        ) : (
          <AlertDialog defaultOpen>
            <AlertDialogContent>
              <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </Theme>,
    );
    const selector = kind === "floating" ? ".kui-menu-popup" : ".kui-alert-popup";
    const popups = document.querySelectorAll<HTMLElement>(selector);
    const popup = popups[popups.length - 1]!;
    expect(popup, `${selector} never mounted`).toBeTruthy();
    // LANDED BY HAND, not waited for — the harness's own `settle()` minus its one line that
    // freezes transitions inline, which would poison the very property this law reads. Under
    // the setting the runner refuses to fly at all and produces this state itself, so hand-
    // landing is what makes the two arms below comparable rather than a wall-clock race.
    for (const attr of ["data-starting-style", "data-seed", "data-unfurling"]) {
      popup.removeAttribute(attr);
    }
    popup.setAttribute("data-ending-style", "");
    return popup;
  }

  const clocks = (el: Element) =>
    computed(el, "transition-duration")
      .split(",")
      .map((s) => parseFloat(s));

  for (const kind of ["floating", "alert"] as const) {
    it(`${kind}: a dismissed panel neither travels nor dissolves under the setting`, async () => {
      await asksForStillness();
      inMotion();
      const popup = landed(kind);
      const body = within(popup, kind === "floating" ? ".kui-floating-body" : ".kui-overlay-body");
      for (const [what, el] of [["the panel", popup], ["its body", body]] as const) {
        for (const seconds of clocks(el)) {
          expect(seconds, `${what} still runs a clock on the way out`).toBe(0);
        }
      }
      // The POSE, which is the other block and the half that actually moves a panel: an exit
      // sets `opacity: 0` and a settle scale, and a guard that only killed the clock would let
      // both land in one frame instead of not at all.
      expect(computed(popup, "opacity"), "the panel still dissolves").toBe("1");
      expect(computed(popup, "scale"), "the panel still settles").toBe("1");
      expect(computed(popup, "translate"), "the panel still travels").toBe("0px");
    });

    it(`${kind}: the same stamp WITHOUT the setting really does move it — the calibration`, () => {
      // Without this every assertion above is satisfiable by a fixture that never reached the
      // exit recipe: a wrong class, a stamp nothing reads, or the harness's own stillness sheet
      // left on. Here the identical DOM must run a real clock and hold a real pose.
      inMotion();
      const popup = landed(kind);
      const body = within(popup, kind === "floating" ? ".kui-floating-body" : ".kui-overlay-body");
      expect(
        Math.max(...clocks(popup), ...clocks(body)),
        "the fixture never reached an exit recipe — the law above asserts nothing",
      ).toBeGreaterThan(0);
      expect(computed(popup, "opacity"), "the exit does not dissolve — nothing to suppress").toBe(
        "0",
      );
    });
  }
});

/**
 * §10 — A TONE-FORWARD PANE KEEPS ITS FAMILY THROUGH THE GLASS (2026-08-26 audit).
 *
 * The veil is `color-mix(in srgb, <the pane's own fill> <alpha>%, transparent)`, and that
 * formula assumes an OPAQUE source: the percentage IS the veil. The tone-forward rung's source
 * was `--tone-a3`, an alpha, so the two alphas multiplied and a destructive thin strip painted
 * `color(srgb .788 .051 0 / .0255)` against a designed 34% veil — the tint gone, the strip a
 * grey smudge, the one thing a Notice is for. Same defect the soft trio's opaque twins fixed
 * for controls on 2026-08-19; `a3` needed its own twin because `soft` is a wash role (neutral
 * for every family) and is a4's twin in dark.
 *
 * The claim is read in TWO channels, because each alone is satisfiable by a wrong fix: an alpha
 * at the designed veil (a fix that dropped the tint entirely would still pass an alpha check),
 * and chroma that a NEUTRAL notice of the same rung does not have (a fix that went opaque
 * without carrying the family would still pass a chroma-vs-transparent check).
 */
describe("a tone-forward pane keeps its family through the glass (§10)", () => {
  /**
   * Channels out of any computed colour string, calibrated below before it is trusted.
   *
   * The colour-space name is REMOVED by name, not by position — `color(display-p3 …)` puts a
   * digit in that name and `color(srgb …)` does not, so "drop the first number" is right for
   * one and silently shifts every channel for the other. This repo has now made the bare
   * number-sweep mistake three times (2026-08-08, 2026-08-24, and here, in a helper whose own
   * comment warned about it), which is why the calibration arm below is not optional.
   */
  const parse = (value: string): { r: number; g: number; b: number; a: number } => {
    const inner = /^color\(\s*[\w-]+\s+(.*)\)$/.exec(value.trim())?.[1] ?? value;
    const [r, g, b, a] = [...inner.matchAll(/-?\d*\.?\d+(?:e-?\d+)?/g)].map((m) => Number(m[0]));
    return { r: r ?? 0, g: g ?? 0, b: b ?? 0, a: a ?? 1 };
  };

  it("the instrument reads both colour spaces before anything below trusts it", () => {
    expect(parse("color(srgb 0.996552 0.927074 0.92144 / 0.34)")).toEqual({
      r: 0.996552,
      g: 0.927074,
      b: 0.92144,
      a: 0.34,
    });
    // The one that broke it: the `3` in display-p3 is not a channel.
    expect(parse("color(display-p3 0.2111 0.2086 0.2236)")).toEqual({
      r: 0.2111,
      g: 0.2086,
      b: 0.2236,
      a: 1,
    });
    expect(parse("rgba(255, 0, 0, 0.5)")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  for (const appearance of APPEARANCES) {
    for (const material of GLASS_MATERIALS) {
      it(`${appearance}/${material}: the veil is the designed one, and it is still red`, () => {
        const notice = (tone: "destructive" | "neutral") =>
          mounted(
            <Notice tone={tone} backdrop>
              Disk almost full
            </Notice>,
            { theme: { appearance, material }, select: ".kui-notice" },
          );
        const toned = notice("destructive");
        const fill = parse(computed(toned, "background-color"));

        // Calibration: the pane really is glass in this cell, or every claim below is about a
        // solid Notice and the law is measuring the case it was not written for.
        expect(computed(toned, "backdrop-filter"), "the fixture never became glass").not.toBe(
          "none",
        );
        // ONE alpha, not two multiplied — stated as the AGREEMENT with a plain glass Card in
        // the same cell, never as a floor. A Card's fill source is the opaque seal, so the
        // alpha it paints IS this cell's designed veil, whatever the eye pass moves it to.
        //
        // The floor this replaces (`> 0.2`) was half a law: it caught all three light cells
        // and NO dark one, because dark's a3 is opaque enough that 0.478 x 0.52 still clears
        // 0.2. Measured against the restored defect, the floor passed three cells the
        // agreement fails.
        const pane = parse(
          computed(
            mounted(<Card backdrop>Body</Card>, {
              theme: { appearance, material },
              select: ".kui-surface",
            }),
            "background-color",
          ),
        );
        expect(
          fill.a,
          "the veil multiplied — the fill's own alpha went through the mix",
        ).toBeCloseTo(pane.a, 3);

        // And the family survived it. Against a NEUTRAL notice in the same cell, because
        // "has chroma" compares nothing on a grey bed and "is not transparent" is satisfied by
        // any opaque fix that threw the tint away.
        const grey = parse(computed(notice("neutral"), "background-color"));
        expect(
          fill.r - fill.g,
          "a destructive pane is no redder than a neutral one — the family did not survive the veil",
        ).toBeGreaterThan(grey.r - grey.g + 0.01);
      });
    }
  }
});
