/**
 * §10 — the glass ring must DRAW A BOUNDARY on the ground it sits on (2026-08-24).
 *
 * The gap this file closes: 1,895 laws were green while a glass segmented control, text
 * field and card were all invisible on a light page. Every ring stop in light was WHITE
 * (0.95 / 0.34 / 0.1 / 0.26) — a lit lip photographed against a dark room. Over a photograph
 * it read; over the page it was white on white, and the element had no edge at all. Dark
 * never showed it, because there a white lip IS the boundary.
 *
 * Kushagra, pointing at iOS's Edit button and its All/Missed control: "if they didnt have
 * that hairline, they would blend with background too."
 *
 * Every law that could have caught this asserted AGREEMENT — that a field's ring equals a
 * button's, that the ladder is monotone, that HC stands it down. All true, all of them, of a
 * ring nobody could see. The claim nothing held is the one a person actually makes: it is
 * VISIBLE. So this reads the ring's own stops against the page it is drawn on, in both
 * appearances, and asks whether any of them is far enough from that ground to be a line.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, GLASS_MATERIALS, colorOn, mounted } from "../test/browser.tsx";
import { Card } from "../components/card/card.tsx";
import { Button } from "../components/button/button.tsx";
import { TextArea } from "../components/text-area/text-area.tsx";
import { TextField } from "../components/text-field/text-field.tsx";

/** sRGB channels 0-1 plus alpha, from any computed colour the engine hands back.
 *
 * INSTRUMENT NOTE, and it is this repo's own 2026-08-08 lesson reproduced by its author: a
 * bare `[\d.]+` sweep over `color(display-p3 0.98 …)` takes the **3 in display-p3** as the
 * red channel. The first draft of this file did exactly that, and the visibility law then
 * scored 0.3939 both before AND after the fix — identical numbers on opposite code, which is
 * the tell. The colourspace keyword is stripped before any digit is read.
 */
function rgba(v: string): { r: number; g: number; b: number; a: number } {
  const inner = v.slice(v.indexOf("(") + 1, v.lastIndexOf(")"));
  const [main = "", alphaPart] = inner.split("/");
  const body = main.replace(/^\s*[a-z][\w-]*\s+/i, "");
  const nums = [...body.matchAll(/-?[\d.]+(?:e-?\d+)?/g)].map((m) => Number(m[0]));
  // rgb()/rgba() resolve 0-255; every color() form resolves 0-1.
  const scale = /^rgba?\(/i.test(v.trim()) ? 255 : 1;
  const [r = 0, g = 0, b = 0] = nums.slice(0, 3).map((n) => n / scale);
  const a = alphaPart !== undefined ? Number(alphaPart) : (nums[3] ?? 1);
  return { r, g, b, a };
}

const luma = (c: { r: number; g: number; b: number }) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

/** A gradient token resolved where the element actually paints it. `colorOn` cannot: a
    gradient is an <image>, and asking the engine to resolve it as a colour yields
    transparent — which is how the first draft of this file failed on correct code. */
function imageOn(el: Element, value: string): string {
  const probe = document.createElement("div");
  el.append(probe);
  probe.style.backgroundImage = value;
  const painted = getComputedStyle(probe).backgroundImage;
  probe.remove();
  return painted;
}

/** What a stop actually paints once it is composited over the ground behind it. */
function over(stop: string, ground: { r: number; g: number; b: number }) {
  const s = rgba(stop);
  return {
    r: s.r * s.a + ground.r * (1 - s.a),
    g: s.g * s.a + ground.g * (1 - s.a),
    b: s.b * s.a + ground.b * (1 - s.a),
  };
}

describe("a glass pane's ring draws a boundary on the ground it sits on (§10)", () => {
  for (const appearance of APPEARANCES) {
    for (const thickness of GLASS_MATERIALS) {
      it(`${appearance}/${thickness}: some arc of the ring is visibly not the page`, () => {
        // The subject is a real mounted pane, so the ring token resolves through the same
        // cascade a component gets — and the ground is the PAGE, the ordinary calm bed where
        // this failed. (Over a photograph almost any ring reads; the page is the hard case
        // and the one that shipped broken.)
        const card = mounted(<Card>pane</Card>, { theme: { appearance, material: thickness } });
        const page = rgba(colorOn(card, "var(--color-page)"));
        // INSTRUMENT NOTE: a conic-gradient is not a COLOUR, so `colorOn` resolves it to
        // rgba(0, 0, 0, 0) and every parse below finds one stop. The first draft of this law
        // did exactly that and failed on correct code — read it where it is actually used,
        // as a background-image.
        const ring = imageOn(card, `var(--material-${thickness}-ring)`);
        // The resolved gradient string, with its colour stops read back out. Reading the
        // STOPS rather than the token name is the whole point: the old value was a perfectly
        // valid ring that happened to be the colour of the thing behind it.
        const stops = [...ring.matchAll(/(?:rgba?|color)\([^)]*\)/g)].map((m) => m[0]);
        expect(stops.length, `${thickness}: no colour stops parsed from ${ring.slice(0, 60)}`).toBeGreaterThan(3);
        const best = Math.max(...stops.map((s) => Math.abs(luma(over(s, page)) - luma(page))));
        // The floor is set from the MEASUREMENT, both sides of it. Against the light page the
        // shipped defect scored 0.0125 on thin and regular — a boundary you cannot see, which
        // is the whole report — and 0.0773 on thick, whose spectral stop was the only arc
        // showing (Kushagra spotted exactly that: "segmented control has a hairline like a
        // conic gradient when glass"). The corrected ring scores 0.1480 on all three. 0.10
        // sits above every failing value and below every passing one, so this law fails on
        // the code that shipped and passes on the code that fixed it — checked in both
        // directions rather than assumed.
        expect(best, `${appearance}/${thickness}: no arc of the ring separates it from the page`).toBeGreaterThan(0.1);
      });
    }
  }

  it("the GRIP obeys the same rule — each mode moves away from its own ground", () => {
    // Added 2026-08-24 when the grip's own sabotage pass survived: reverting light's grip to
    // white broke nothing, because the ring laws below only ever read the ring. The grip went
    // white first on the solid control's relationship (the track recedes, the grip catches
    // light) and that is the ring's mistake one component over — on a LIGHT ground there is
    // no headroom above the pane to be lightened into. Kushagra, against iOS's All/Missed:
    // "the selected thumb is still very white, see iOS's", where the chosen segment is a
    // subtle grey DARKER than the capsule holding it.
    //
    // Stated as the shared principle rather than as two numbers, so the values stay taste
    // and the direction stays law: whatever a mode's ground is, its states move away from it.
    const light = mounted(<Card>pane</Card>, { theme: { appearance: "light", material: "regular" } });
    const dark = mounted(<Card>pane</Card>, { theme: { appearance: "dark", material: "regular" } });
    const gripOf = (el: Element) => rgba(colorOn(el, "var(--material-grip-fill)"));
    const washOf = (el: Element) => rgba(colorOn(el, "var(--material-row-wash)"));
    expect(luma(gripOf(light)), "light's grip is not shade — a white grip on a light pane is invisible").toBeLessThan(0.2);
    expect(luma(gripOf(dark)), "dark's grip is not light — a dark grip on a dark pane is invisible").toBeGreaterThan(0.8);
    // Each mode's grip pulls the SAME way its own hover does — one direction per ground, or
    // the two states argue about which way "more" is.
    expect(luma(gripOf(light)) < 0.5).toBe(luma(washOf(light)) < 0.5);
    expect(luma(gripOf(dark)) < 0.5).toBe(luma(washOf(dark)) < 0.5);
    // …and further, which is the ranking the segmented laws read as alpha.
    expect(gripOf(light).a).toBeGreaterThan(washOf(light).a);
    expect(gripOf(dark).a).toBeGreaterThan(washOf(dark).a);
  });

  it("light draws its boundary with SHADE and dark with LIGHT — the lip is lit, not painted", () => {
    // The correction of 2026-08-24 stated as the rule it is, so a future edit that makes
    // light's ring white again fails here with its reason rather than only in the visibility
    // law above. A lip is bright where the light hits it and dark where it does not; which
    // half draws the edge depends on what is behind it.
    const light = mounted(<Card>pane</Card>, { theme: { appearance: "light", material: "regular" } });
    const dark = mounted(<Card>pane</Card>, { theme: { appearance: "dark", material: "regular" } });
    const stopsOf = (el: Element) =>
      [...imageOn(el, "var(--material-regular-ring)").matchAll(/(?:rgba?|color)\([^)]*\)/g)]
        .map((m) => rgba(m[0]))
        .filter((c) => c.a > 0.02);
    // Light must own at least one genuinely dark stop — that arc is its boundary…
    expect(
      stopsOf(light).some((c) => luma(c) < 0.2),
      "light's ring has no shade side — a white lip on a white page is invisible",
    ).toBe(true);
    // …and must keep its catch, or the lip stops reading as glass and becomes a border.
    expect(
      stopsOf(light).some((c) => luma(c) > 0.8),
      "light's ring lost its light-facing catch and is now just a pigment hairline",
    ).toBe(true);
    // Dark's boundary is the catch itself; it needs no shade, because the page is the shade.
    expect(
      stopsOf(dark).some((c) => luma(c) > 0.8),
      "dark's ring has no light-facing catch",
    ).toBe(true);
  });
});

/**
 * §10 — THE GLINT: the ring's band (2026-08-24, the "MILES ahead" pass).
 *
 * The specular was a 1px annulus, which is why it kept vanishing at pane scale. The band is
 * a per-box alpha mask minted by the lens hook from the same signed-distance field the lens
 * bends with, coloured by the mode's own ring conic at the element. These laws read the
 * mounted result — the mask on the ::before, the conic behind it, the opacity gates — because
 * the write happens in JS on a measured box, which is exactly the kind of mechanism that can
 * silently not run while every token law stays green.
 *
 * Falsified 2026-08-24: (a) with the hook's two setProperty calls removed, the presence law
 * fails on opacity 0 and an empty mask in all four cells; (b) with the ring-opacity factor
 * dropped from the ::before calc, the HC law fails on opacity 1; (c) with recipes.css's
 * ::after re-pointed back to the pane ring, the dark-control law fails byte-equal.
 */
describe("the glint band exists, wears the mode's ring, and stands down with it (§10)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: a glass pane's ::before is the band — mask minted, conic lit`, () => {
      const card = mounted(<Card backdrop>pane</Card>, { theme: { appearance, material: "regular" } });
      // The hook ran: the element carries the mask it minted for this box…
      expect(card.style.getPropertyValue("--kui-glint"), "the hook never wrote a mask").toContain("data:image/png");
      const before = getComputedStyle(card, "::before");
      // …the pseudo is masked by it, coloured by the glint conic, and actually lit.
      expect(before.maskImage, "the band's mask is not the minted image").toContain("data:image/png");
      expect(before.backgroundImage, "the band is not wearing the ring's conic").toContain("conic-gradient");
      expect(Number(before.opacity), "the band is dark on an ordinary glass pane").toBeGreaterThan(0.5);
      // The spectral fold is DELETED (2026-08-25) — its red/blue stops read as pink haze
      // across the band (2026-08-24) and as a blue hairline at the 1px lip on plain grounds
      // the day after, so neither the ring nor the band may carry them anywhere. The old
      // spelling asserted band ≠ ring, which held only WHILE the ring was spectral; with one
      // shared palette the two are identical by construction, so the law reads the stops.
      const thick = mounted(<Card backdrop>pane</Card>, { theme: { appearance, material: "thick" } });
      const band = imageOn(thick, getComputedStyle(thick, "::before").backgroundImage);
      const ring = imageOn(thick, "var(--material-thick-ring)");
      for (const [what, v] of [["band", band], ["ring", ring]] as const) {
        expect(v, `thick's ${what} carries a spectral stop — the fold returns`).not.toMatch(/rgba?\(\s*1[678]\d[,\s]+2[01]\d[,\s]+255/);
      }
    });

    it(`${appearance}: a solid pane has no band at all`, () => {
      const card = mounted(<Card backdrop>pane</Card>, { theme: { appearance } });
      expect(getComputedStyle(card, "::before").content, "a solid pane grew a glint").toBe("none");
      expect(card.style.getPropertyValue("--kui-glint")).toBe("");
    });

    it(`${appearance}: high contrast stands the band down through the ring's own lever`, () => {
      const card = mounted(<Card backdrop>pane</Card>, {
        theme: { appearance, material: "regular", contrast: "high" },
      });
      // The pigment edge takes over under HC and the ring dies with it (--material-ring-opacity
      // is 0 there); the band must die through the SAME lever, or the accessibility surface
      // gains a decorative light no setting can remove.
      expect(Number(getComputedStyle(card, "::before").opacity), "the band survived contrast=high").toBe(0);
    });
  }
});

/**
 * §10 — DARK CONTROLS CARRY MORE SPECULAR (lab 2026-08-15, Kushagra: "not enough"; ported
 * 2026-08-24). A small dark pane's rim is most of its evidence, and the shipped ring was the
 * lab's CARD row — the judged "roughly double" button row never left the lab. Light shares
 * the pane's ring VERBATIM (emitted from the same source), so the claim is a per-mode pair:
 * light equal, dark stronger.
 */
describe("a dark glass control's ring is the lab's doubled row (§10)", () => {
  const rings = () => {
    const root = mounted(
      <div>
        <Button data-t="btn" backdrop>
          Save
        </Button>
        <Card data-t="card" backdrop>pane</Card>
      </div>,
      { theme: { appearance: "dark", material: "regular" } },
    );
    const btn = root.querySelector('[data-t="btn"]')!;
    const card = root.querySelector('[data-t="card"]')!;
    return { root, btn, card };
  };

  it("dark: the button's ::after ring differs from the pane's, in the brighter direction", () => {
    const { btn, card } = rings();
    const btnRing = imageOn(btn, getComputedStyle(btn, "::after").backgroundImage);
    const cardRing = imageOn(card, getComputedStyle(card, "::after").backgroundImage);
    expect(btnRing, "the control ring is the pane's — the lab's doubled row is lost again").not.toBe(cardRing);
    // Brighter, not merely different: the catch stop's alpha roughly doubles (0.34 → 0.72).
    const alphaOf = (img: string) => {
      const stops = [...img.matchAll(/(?:rgba?|color)\([^)]*\)/g)].map((m) => rgba(m[0]));
      return Math.max(...stops.map((s) => s.a));
    };
    expect(alphaOf(btnRing), "dark control catch is not stronger than the pane's").toBeGreaterThan(
      alphaOf(cardRing) * 1.5,
    );
  });

  it("light: the two are byte-identical — the lab never split light, and the emission shares the source", () => {
    const root = mounted(
      <div>
        <Button data-t="btn" backdrop>
          Save
        </Button>
        <Card data-t="card" backdrop>pane</Card>
      </div>,
      { theme: { appearance: "light", material: "regular" } },
    );
    const btn = root.querySelector('[data-t="btn"]')!;
    const card = root.querySelector('[data-t="card"]')!;
    expect(imageOn(btn, getComputedStyle(btn, "::after").backgroundImage)).toBe(
      imageOn(card, getComputedStyle(card, "::after").backgroundImage),
    );
  });
});

/**
 * §10 — TEXTAREA PARITY (2026-08-25, Kushagra: "Still doesnt have full parity"). The flat-band
 * approximation is DELETED: a form control renders no generated content and a mask on the
 * element takes its text, so a bare <textarea> could never paint the material's band — and
 * two rounds of gradient approximation (a full-width bar, then a top-centre ellipse) were each
 * judged short. TextArea grew TextField's wrapper instead, and the glass now arrives through
 * the field family's own rules. These laws assert the parity BY COMPARISON — the two members
 * mounted side by side must resolve one glass — because an approximation law can only measure
 * distance from the real thing, and an agreement law makes the distance zero or red.
 */
describe("a glass textarea is a glass field — parity by construction (§10)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: wrapper stack, ring and band all agree with TextField's`, () => {
      const ta = mounted(<TextArea aria-label="notes" backdrop />, {
        theme: { appearance, material: "regular" },
      });
      const tf = mounted(<TextField aria-label="name" backdrop />, {
        theme: { appearance, material: "regular" },
      });
      // The element stack (ring under border-area, rim, light) is the family's, verbatim.
      expect(getComputedStyle(ta).backgroundImage, "the two members' stacks disagree").toBe(
        getComputedStyle(tf).backgroundImage,
      );
      expect(getComputedStyle(ta).backgroundClip.startsWith("border-area")).toBe(true);
      // The band: the hook minted a mask for this box, the ::before wears it over the glint
      // conic, and it is lit — the same three facts the field's own band law reads.
      expect(ta.style.getPropertyValue("--kui-glint"), "the hook never minted the band").toContain("data:image/png");
      const before = getComputedStyle(ta, "::before");
      expect(before.maskImage, "the band's mask is not the minted image").toContain("data:image/png");
      expect(before.backgroundImage, "the band is not wearing the glint conic").toBe(
        getComputedStyle(tf, "::before").backgroundImage,
      );
      expect(Number(before.opacity), "the band is dark on a live glass textarea").toBeGreaterThan(0.5);
      // And the box is the band's containing block: without position:relative the ::before
      // insets against some ancestor and paints the band OFF the pane — every computed style
      // above stays identical, which is why this reads the mechanism the paint depends on.
      expect(getComputedStyle(ta).position, "the band has no containing block").toBe("relative");
    });

    it(`${appearance}: a disabled glass textarea stands the band down with the ring`, () => {
      const ta = mounted(<TextArea aria-label="notes" backdrop disabled />, {
        theme: { appearance, material: "regular" },
      });
      // The state arms stand --kui-ct-glass-glint down, and the ::before's background reads
      // through it — one stand-down, both renderings, TextField's own behaviour.
      expect(getComputedStyle(ta, "::before").backgroundImage, "a dead textarea still wears its band").toBe("none");
    });
  }
});

/**
 * §10 — high contrast's floor reaches the CONTROL-scale veil (2026-08-26).
 *
 * alphaHigh raised every SURFACE pane and never named the control cell, so a glass button
 * under contrast="high" kept its normal 30-66% veil — as see-through as ever over the
 * hostile bed (Kushagra: "glass is also broken in HC in controls"). The generator now
 * derives the control floor (the control's designed offset from the surface's resting
 * alpha, carried onto the surface's own floor — a derivation, never a second judged
 * number), and this law reads the PAINTED fill of a mounted glass Button in every
 * (appearance x thickness) cell: under high contrast the veil is MORE opaque than under
 * normal, and never fully opaque — high contrast leans on the glass, it does not unmake
 * it. Falsified by reverting the generator's control-alpha line: all six cells fail.
 */
describe("high contrast raises the control veil's floor (§10)", () => {
  it("a glass button's fill is more opaque under contrast=high, never fully", () => {
    for (const appearance of APPEARANCES) {
      for (const m of GLASS_MATERIALS) {
        const veil = (contrast?: "high") => {
          const btn = mounted(
            <Button data-t="btn" backdrop>
              Save
            </Button>,
            {
              theme: contrast
                ? { appearance, material: m, contrast }
                : { appearance, material: m },
              select: '[data-t="btn"]',
            },
          );
          return rgba(getComputedStyle(btn).backgroundColor).a;
        };
        const cell = `${appearance}/${m}`;
        const normal = veil();
        const high = veil("high");
        // Calibration: the normal-mode veil is a real translucency, or this compares nothing.
        expect(normal, `${cell}: the glass fill never mixed`).toBeGreaterThan(0.1);
        expect(normal, `${cell}: the normal veil is already opaque`).toBeLessThan(0.95);
        expect(high, `${cell}: high contrast never reached the control veil`).toBeGreaterThan(normal + 0.05);
        expect(high, `${cell}: the floor unmade the glass`).toBeLessThan(1);
      }
    }
  });
});
