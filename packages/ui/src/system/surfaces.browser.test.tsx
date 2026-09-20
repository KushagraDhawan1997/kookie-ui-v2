/**
 * The surface layer's MOUNTED laws (§5, §10) — added 2026-08-26 out of the audit.
 *
 * surfaces.test.ts beside this file reads the emitted declarations, which is the right
 * instrument for "is this stated". Everything here is the other question — "does it WIN" — and
 * every finding it was written for was a rule that was stated correctly and lost, or a value
 * that arrived from an element no rule had named. Those are cascade outcomes, and a cascade
 * outcome is only visible through a mounted `<Theme>`.
 *
 * Each law carries the arm that makes its fixture non-degenerate, because in every one of these
 * the obvious fixture cannot tell a working mechanism from an absent one: two identical panes,
 * or a pane with no material stamped.
 */
import { describe, expect, it } from "vitest";

import {
  APPEARANCES,
  GLASS_MATERIALS,
  colorOn,
  computed,
  mounted,
  probeIn,
  within,
} from "../test/browser.tsx";
import { Button } from "../components/button/button.tsx";
import { Card } from "../components/card/card.tsx";
import { Checkbox } from "../components/checkbox/checkbox.tsx";
import { Notice } from "../components/notice/notice.tsx";
import { Radio, RadioGroup } from "../components/radio/radio.tsx";
import { Text } from "../components/text/text.tsx";

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

  it("and the twin STOPS AT THE PANE — an unmarked member inside it keeps the ramp step", () => {
    /* REBASED 2026-09-09, and the fixture is the whole edit. The mechanism is unchanged and is
       still the reason the re-point is scoped to `[data-material]`: a pane converts the alpha
       ramp to its opaque twins for ITSELF, because the material veil is
       `color-mix(source alpha%, transparent)` and an alpha source multiplies through it — but a
       member inside the pane has no veil of its own, so an opaque value handed down would arrive
       raw.

       What moved is the ROLE this law read. It used the disabled FILL, and that fill left the
       alpha ramp on 2026-09-08 ("solid means solid": a control is an object, and content passing
       behind one is what `backdrop` says) — so `--disabled-fill` and `--disabled-fill-solid`
       became the same value and the law's own calibration ("the value that must NOT have arrived
       is a real, different one") could no longer be true. A law whose two sides are equal by
       construction cannot fail, so it reads a role that IS still on the ramp: the dress EDGE,
       which is the half of the fill-first flip that was never about a control's body. */
    const glass = mounted(
      <Card backdrop>
        <Checkbox />
      </Card>,
      { theme: { appearance: "light", material: "regular" } },
    );
    const mark = within(glass, ".kui-checkbox");
    // The premise, and it is the whole mechanism: this member asks for no material of its own,
    // so nothing here can mix an opaque value back down.
    expect(mark.getAttribute("data-material"), "the mark stamps a material — wrong fixture").toBeNull();
    const solid = mounted(
      <Card>
        <Checkbox />
      </Card>,
      { theme: { appearance: "light" } },
    );
    const solidMark = within(solid, ".kui-checkbox");
    expect(
      computed(mark, "border-top-color"),
      "the pane's opaque twin leaked into a member that has no veil",
    ).toBe(computed(solidMark, "border-top-color"));
    // The calibration: the value that must NOT have arrived is a real, different one, and the
    // ramp is where that is still true.
    expect(alphaOf(computed(solidMark, "border-top-color")), "the dress edge left the ramp too").
      toBeLessThan(1);
    expect(computed(mark, "border-top-color")).not.toBe(
      colorOn(mark, "var(--dress-mark-edge-solid, var(--neutral-3))"),
    );
  });

  it("and the dead fill is an OPAQUE step on both, which is what a control being an object means", () => {
    /* REVERSED 2026-09-08 ("solid means solid"), and stated rather than deleted. This arm read
       "a solid dead pane keeps the alpha step", on the 2026-08-17 argument that an alpha
       composites against whatever bed it sits on so a dead control still reads on a Ground. The
       measurement that ended it was the other direction: a medium button over a photograph
       showed the photograph through its fill. A control is an OBJECT, and content passing behind
       one is what `backdrop` says — so the dead fill is an opaque step in both places, and what
       has to hold instead is that it still RECEDES from the pane it sits on. */
    const dead = mounted(<Card render={<button disabled />}>Body</Card>, {
      theme: { appearance: "light", depth: "elevated" },
    });
    expect(dead.getAttribute("data-material"), "the fixture must NOT be glass").toBeNull();
    expect(
      alphaOf(computed(dead, "background-color")),
      "the dead fill went back to the alpha ramp",
    ).toBe(1);
    // The recession, which is what the alpha was there to guarantee: a dead pane must not be
    // the seal it sits on, or there is nothing to see.
    expect(
      computed(dead, "background-color"),
      "a dead pane IS the seal — the recession is gone",
    ).not.toBe(colorOn(dead, "var(--color-surface)"));
    // And the twin is an identity now rather than a second value, which is what makes the arm
    // above readable at all: on glass the same name would arrive unchanged.
    expect(computed(dead, "background-color")).toBe(colorOn(dead, "var(--disabled-fill-solid)"));
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
