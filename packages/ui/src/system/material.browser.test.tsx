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

import { APPEARANCES, GLASS_MATERIALS, asksForContrast, asksForSolidity, colorOn, computed, mounted } from "../test/browser.tsx";
import { Card } from "../components/card/card.tsx";
import { Button } from "../components/button/button.tsx";
import { Row } from "../components/row/row.tsx";
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

/**
 * THE ENGINE'S TWO ANSWERS ARE ONE ANSWER SINCE 2026-09-02. The field family's edge used to
 * have two implementations chosen at parse time — inside `@supports (background-clip:
 * border-area)` the ring painted in the border band, outside it a flat hairline stood — and
 * the laws below branched with the cascade because the browser only ever executes one of
 * them. The fork is gone: the family's lip moved onto the same `::after` annulus every other
 * glass member already wore, which is plain CSS on every engine. So the branches below are
 * unconditional again, and `--material-*-edge` — the flat hairline — is deleted.
 */

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
 * dropped from the ::before calc, the then-HC law failed on opacity 1 — that law asserted
 * the band DIES under contrast=high and is REVERSED 2026-08-26 (the edge trade is deleted;
 * the band now stays lit and the law reads equality across contrasts); (c) with
 * recipes.css's ::after re-pointed back to the pane ring, the dark-control law fails
 * byte-equal.
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
      // MODEL-AGNOSTIC SINCE 2026-09-11, and the word it dropped is the point. These read
      // `toContain("conic-gradient")`, which pins the light model's SPELLING rather than the
      // guarantee — that the band wears the mode's own lip gradient and is lit. The lip is a
      // linear gradient since the edge-normal change (a conic is measured from the box's
      // CENTRE, so on a wide pane the catch collapsed into a blob at one end; measured, the
      // top lip's spread across a 540x56 pane went 68% -> 10%). `gradient(` keeps the half
      // that is real — the lip is a gradient, never a flat fill — and the value agreements
      // below are what actually hold the two members and the two pseudos together.
      expect(before.backgroundImage, "the band is not wearing the ring's gradient").toContain("gradient(");
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

    /**
     * A GLOW MAY ONLY ADD LIGHT (§10, 2026-09-02, Kushagra: light glass "looks dirty… blurry
     * and ugly", dark "looks SO good, its sharp").
     *
     * The band and the lip shared one palette from the day the band shipped, and that palette
     * had to carry PIGMENT once light's ring was corrected (2026-08-24) — so the band spread
     * three black arcs across the whole bezel. Measured on a mounted control against the page:
     * with the band alone, a grey wash reaching ~4px inboard of the left, bottom and right
     * edges, up to −12/255 against the pane's own body, with no line anywhere to justify it.
     * The lip that was supposed to be the specular measured SIX units above the body in light
     * against 139 in dark — the same recipe, twenty-three times weaker, because a white catch
     * on a white page is nothing and only the dark half could show.
     *
     * The law is the model, not the numbers: the RING is the edge and may be drawn in pigment,
     * the GLINT is light lying on the bezel and may only ever add light. Both halves are read
     * in one experiment, because a law asserting only the second passes on a package that
     * deleted the pigment from the ring too — which would take the light-mode boundary with it
     * and is the exact defect 2026-08-24 exists to prevent.
     *
     * Falsified 2026-09-02 by pointing `material-*-glint` back at `ringBg` in generate.ts and
     * regenerating: fails on light for all three thicknesses, naming the darkening stop.
     */
    it(`${appearance}: the band only adds LIGHT — the pigment stays on the lip (2026-09-02)`, () => {
      const card = mounted(<Card backdrop>pane</Card>, { theme: { appearance, material: "regular" } });
      const stopsOf = (token: string) =>
        [...imageOn(card, `var(${token})`).matchAll(/(?:rgba?|color)\([^)]*\)/g)]
          .map((m) => rgba(m[0]))
          // A stop at alpha 0 contributes nothing whatever its channels are, and that is how
          // the darkening arcs are stood down — kept in place, at their own colour, so the
          // emitted value still shows which arc went quiet.
          .filter((c) => c.a > 0.02);
      for (const thickness of GLASS_MATERIALS) {
        for (const token of [`--material-${thickness}-glint`, `--material-${thickness}-glint-control`]) {
          const stops = stopsOf(token);
          expect(stops.length, `${token}: no live stops parsed`).toBeGreaterThan(0);
          const darkest = Math.min(...stops.map(luma));
          expect(darkest, `${token} carries a darkening stop — the band is staining, not lighting`).toBeGreaterThan(0.5);
        }
      }
      // …and the vacuity guard, which is the other half of the model: in LIGHT the lip must
      // still own the pigment, or this law is satisfied by a package with no boundary at all.
      if (appearance === "light") {
        const ring = stopsOf("--material-regular-ring");
        expect(
          ring.some((c) => luma(c) < 0.2),
          "light's ring lost its shade side — the band was cleaned by deleting the edge",
        ).toBe(true);
      }
    });

    it(`${appearance}: a solid pane has no band at all`, () => {
      const card = mounted(<Card backdrop>pane</Card>, { theme: { appearance } });
      expect(getComputedStyle(card, "::before").content, "a solid pane grew a glint").toBe("none");
      expect(card.style.getPropertyValue("--kui-glint")).toBe("");
    });

    it(`${appearance}: high contrast leaves the band LIT — the ring's lever never moves (2026-08-26)`, () => {
      // REVERSED 2026-08-26 (Kushagra: "None of normal contrast appearance reduces
      // contrast. We increased veil, why should there any other difference"). This law used
      // to assert the band dies under HC through --material-ring-opacity: 0 — the edge
      // trade, deleted with its premise (the ring carries pigment arcs since 2026-08-24 and
      // is a boundary in both modes; light inside the pane cannot lower any contrast). The
      // band still rides the ring's lever — one shared factor — so this reads EQUALITY with
      // the standard band, which is what catches any HC arm quietly touching the lever again.
      const at = (contrast: "normal" | "high") =>
        mounted(<Card backdrop>pane</Card>, {
          theme: { appearance, material: "regular", contrast },
        });
      const normal = at("normal");
      const high = at("high");
      expect(
        Number(getComputedStyle(high, "::before").opacity),
        "the band died under contrast=high — the deleted trade is back",
      ).toBeGreaterThan(0.5);
      expect(getComputedStyle(high, "::before").opacity).toBe(
        getComputedStyle(normal, "::before").opacity,
      );
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
      // The element stack (rim, light) is the family's, verbatim.
      expect(getComputedStyle(ta).backgroundImage, "the two members' stacks disagree").toBe(
        getComputedStyle(tf).backgroundImage,
      );
      // The hook is JS, not cascade — it mints for this box on every engine, so this half of
      // the parity claim is unconditional.
      expect(ta.style.getPropertyValue("--kui-glint"), "the hook never minted the band").toContain("data:image/png");
      const before = getComputedStyle(ta, "::before");
      expect(before.maskImage, "the band's mask is not the minted image").toContain("data:image/png");
      // The band: the ::before wears the minted mask over the glint conic, and it is lit —
      // the same three facts the field's own band law reads.
      expect(before.backgroundImage, "the band is not wearing the glint gradient").toContain("gradient(");
      expect(before.backgroundImage, "the two members' bands disagree").toBe(
        getComputedStyle(tf, "::before").backgroundImage,
      );
      expect(Number(before.opacity), "the band is dark on a live glass textarea").toBeGreaterThan(0.5);
      // The LIP, since 2026-09-02: the annulus, not a background layer clipped to the border
      // band. Both members must carry it and carry the same one.
      const after = getComputedStyle(ta, "::after");
      expect(after.content, "the textarea grew no annulus").not.toBe("none");
      expect(after.backgroundImage, "the lip is not the ring gradient").toContain("gradient(");
      expect(after.backgroundImage, "the two members' lips disagree").toBe(
        getComputedStyle(tf, "::after").backgroundImage,
      );
      // …and the border is out of the way, or the pane wears two lines (§10, 2026-08-07).
      expect(computed(ta, "border-top-color"), "the flat hairline is back beside the ring").toBe("rgba(0, 0, 0, 0)");
      expect(computed(ta, "border-top-color")).toBe(computed(tf, "border-top-color"));
      // And the box is the band's containing block: without position:relative the ::before
      // insets against some ancestor and paints the band OFF the pane — every computed style
      // above stays identical, which is why this reads the mechanism the paint depends on.
      expect(getComputedStyle(ta).position, "the band has no containing block").toBe("relative");
    });

    it(`${appearance}: a disabled glass textarea stands the band down with the ring`, () => {
      const ta = mounted(<TextArea aria-label="notes" backdrop disabled />, {
        theme: { appearance, material: "regular" },
      });
      const live = mounted(<TextArea aria-label="live" backdrop />, {
        theme: { appearance, material: "regular" },
      });
      const tfDead = mounted(<TextField aria-label="name" backdrop disabled />, {
        theme: { appearance, material: "regular" },
      });
      // The stand-down is `--material-ring-opacity` since 2026-09-02 — one lever for every
      // family's lip and band, where the field used to own two private hooks. The LIVE
      // control is the calibration: an assertion about a dead band is worthless unless the
      // live one is lit.
      expect(Number(getComputedStyle(live, "::before").opacity), "the live band never lit").toBeGreaterThan(0.5);
      expect(Number(getComputedStyle(ta, "::before").opacity), "a dead textarea still wears its band").toBe(0);
      expect(Number(getComputedStyle(live, "::after").opacity), "the live lip never lit").toBeGreaterThan(0.5);
      expect(Number(getComputedStyle(ta, "::after").opacity), "a dead textarea still wears its lip").toBe(0);
      // …and it wears the dead pigment border instead, which is exactly what a dead glass
      // FIELD wears — the parity claim, in the state where the material is gone.
      expect(computed(ta, "border-top-color"), "the state never reached the glass edge").not.toBe(
        computed(live, "border-top-color"),
      );
      expect(computed(ta, "border-top-color"), "a dead textarea and a dead field disagree").toBe(
        computed(tfDead, "border-top-color"),
      );
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

/**
 * §10 — A GLASS PANE'S RING IS ITS OUTERMOST PIXEL (2026-08-27).
 *
 * Kushagra, three readings of the same edge over two days: first "I see the effect at a
 * distance inside, so it makes it seem like I have two outlines", then the DevTools finding
 * that the ring's pseudo is 2px narrower than the card, then "this 1px border on glass, only
 * glass, bothers me". All one defect, and the pixels name it exactly. Scanned across a thick
 * pane's left edge in device pixels, before: page 232, veil 252, RING 223, veil 245 — the
 * ring sat on the padding box, and the transparent border's reserved band painted a pixel of
 * undarkened veil outside it. A lit rim, then a dark one. Two outlines, as reported.
 *
 * The band goes, and only the band: `border-width: 0` under each glass rung, so the padding
 * box IS the border box and the sequence becomes page 232, ring 223, veil 245.
 *
 * TWO OTHER REPAIRS WERE BUILT AND MEASURED FIRST, and both are worth staying rejected.
 * Moving the pseudos out to the border box DELETES the ring rather than moving it (the arc
 * measured 244 against 223 — `overflow: clip` takes the outermost pixel), which is why the
 * first attempt at this read as "lost sharpness". Clipping the fill to the padding box only
 * dims the rim from 252 to 246 and leaves both lines standing.
 *
 * WHAT THIS LAW GUARDS is the state where the rule inverts. A sealed pane (reduced
 * transparency) stands the ring down and hands the boundary to the pigment hairline — so
 * there the band must come BACK, or the setting that exists to make things plainer leaves a
 * pane with no boundary at all. That shipped for the length of one edit and was caught by
 * measuring rather than by the suite: the arm's own law reads the border COLOUR and never its
 * width, so a pigment on a zero-width border satisfied it. Both halves are read here.
 *
 * Falsified in both arms: restoring `border-width` under the glass rungs fails the first with
 * `a glass pane reserves a band outside its ring: expected 1 to be 0`; dropping it from the
 * seal fails the second with `a sealed pane has a colour but no border to paint it on`.
 */
describe("a glass pane's ring is its edge, and the seal takes the band back (§10, 2026-08-27)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: glass reserves no band, so nothing paints outside the ring`, () => {
      const card = mounted(<Card backdrop>pane</Card>, { theme: { appearance, material: "regular" } });
      expect(
        parseFloat(computed(card, "border-top-width")),
        "a glass pane reserves a band outside its ring",
      ).toBe(0);
      // CALIBRATION: a SOLID pane still reserves one, or this law is measuring a system with
      // no borders in it at all rather than the one place they were removed.
      const solid = mounted(<Card>pane</Card>, { theme: { appearance, material: "solid" } });
      expect(
        parseFloat(computed(solid, "border-top-width")),
        "no pane reserves a band — this law no longer distinguishes glass",
      ).toBeGreaterThan(0);
    });

    it(`${appearance}: a SEALED pane takes the band back, because the hairline is its boundary`, async () => {
      const { cdp } = await import("vitest/browser");
      await cdp().send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
      });
      try {
        const sealed = mounted(<Card backdrop>pane</Card>, {
          theme: { appearance, material: "regular" },
        });
        // The premise: the setting really reached the pane, so this is the sealed path.
        expect(computed(sealed, "backdrop-filter"), "the setting never reached the pane").toBe("none");
        const width = parseFloat(computed(sealed, "border-top-width"));
        const color = computed(sealed, "border-top-color");
        expect(color, "a sealed pane lost the pigment hairline").not.toBe("rgba(0, 0, 0, 0)");
        expect(width, "a sealed pane has a colour but no border to paint it on").toBeGreaterThan(0);
      } finally {
        await cdp().send("Emulation.setEmulatedMedia", { features: [] });
      }
    });
  }
});

/**
 * THE LENS-LESS FILTER ROW (§10, 2026-09-11).
 *
 * The near-clear ladder is licensed by the lens, and the lens is Chromium-only — gated off on
 * WebKit outright since 2026-09-08, because WebKit parses `url()` in a backdrop filter and then
 * paints nothing for the whole chain. So the engines that cannot have it were the ones running
 * the ladder built for it. `--material-<t>-filter-frost` is the row the material lab wrote for
 * exactly that tier and the port left behind.
 *
 * What the mechanism owes, and what nothing else in the suite reads: the DEFAULT is the frost
 * row, not the clear one. A server render, a page with JS off and any engine nobody has stamped
 * all get the row that defends — which is only true while the absence of `data-lens` means
 * frost. Inverted, the defended row would be the opt-in and every un-stamped engine would fall
 * back to the ladder it cannot carry.
 *
 * The harness mounts into a document the lens hook has already stamped, so both branches are
 * driven here by toggling that stamp rather than by pretending to be another browser.
 */
describe("the filter row forks on the lens, and the default is the defended one (§10)", () => {
  const stamp = document.documentElement.getAttribute("data-lens");
  const setStamp = (on: boolean) => {
    if (on) document.documentElement.setAttribute("data-lens", "on");
    else document.documentElement.removeAttribute("data-lens");
  };
  const restore = () => {
    if (stamp === null) document.documentElement.removeAttribute("data-lens");
    else document.documentElement.setAttribute("data-lens", stamp);
  };

  for (const appearance of APPEARANCES) {
    for (const material of GLASS_MATERIALS) {
      it(`${appearance}/${material}: unstamped is frost, stamped is the clear row, and frost blurs harder`, () => {
        const card = mounted(<Card backdrop>pane</Card>, { theme: { appearance, material } });
        const blurOf = (chain: string): number => {
          const m = chain.match(/blur\(([\d.]+)px\)/);
          if (!m?.[1]) throw new Error(`no blur in ${chain}`);
          return Number(m[1]);
        };

        setStamp(false);
        const frost = getComputedStyle(card).backdropFilter;
        setStamp(true);
        const clear = getComputedStyle(card).backdropFilter;
        restore();

        // Both are real chains — a fork that resolved to nothing on one side would read as a
        // pass on every "is there a filter" law in the suite.
        expect(frost, `${material} unstamped chain`).toContain("blur(");
        expect(clear, `${material} stamped chain`).toContain("blur(");
        // The whole point: the engine that cannot bend light hides more instead.
        expect(blurOf(frost), `${material} frost does not defend harder than the clear row`).toBeGreaterThan(
          blurOf(clear),
        );
        // And ONLY the blur moves — saturation and brightness are the judged values in both,
        // so this is one lever changing rather than a second material appearing.
        const rest = (chain: string) => chain.replace(/blur\([\d.]+px\)\s*/, "");
        expect(rest(frost), `${material} frost changed more than the blur`).toBe(rest(clear));
      });
    }
  }

  it("a control forks too, and the atom family rides the control's row", () => {
    const btn = mounted(<Button backdrop>b</Button>, { theme: { material: "regular" } });
    setStamp(false);
    const frost = getComputedStyle(btn).backdropFilter;
    setStamp(true);
    const clear = getComputedStyle(btn).backdropFilter;
    restore();
    const blur = (c: string) => Number(c.match(/blur\(([\d.]+)px\)/)?.[1] ?? 0);
    expect(blur(frost), "a glass control never took the frost row").toBeGreaterThan(blur(clear));
  });
});

/**
 * AND THE SEAL STILL WINS OVER BOTH ROWS (§10, 2026-09-11).
 *
 * The fork is a descendant selector, so it outweighs the per-thickness blocks — which is fine
 * for a variable and was NOT fine for the property. Written as a second `backdrop-filter`
 * declaration it also outweighed the reduced-transparency, print and forced-colors arm that
 * says `backdrop-filter: none`, and a sealed pane kept a live blur. Measured before the repair.
 *
 * The fork therefore declares only the HOOK, leaving the seal the single writer of the
 * property. This is what that costs if anyone respells it back.
 */
describe("the seal outranks the filter fork, in both branches (§10)", () => {
  for (const stamped of [false, true]) {
    it(`${stamped ? "stamped" : "unstamped"}: a sealed pane, control and atom carry no filter`, async () => {
      const card = mounted(<Card backdrop>pane</Card>, { theme: { material: "regular" } });
      const btn = mounted(<Button backdrop>b</Button>, { theme: { material: "regular" } });
      if (stamped) document.documentElement.setAttribute("data-lens", "on");
      else document.documentElement.removeAttribute("data-lens");

      // The calibration half: both are LIVE before the preference, or an assertion that they
      // carry no filter afterwards cannot tell a seal from a fork that resolved to nothing.
      expect(getComputedStyle(card).backdropFilter, "the pane had no filter to seal").toContain("blur(");
      expect(getComputedStyle(btn).backdropFilter, "the control had no filter to seal").toContain("blur(");

      await asksForSolidity();

      expect(getComputedStyle(card).backdropFilter, "the sealed pane kept a live blur").toBe("none");
      expect(getComputedStyle(btn).backdropFilter, "the sealed control kept a live blur").toBe("none");
      document.documentElement.removeAttribute("data-lens");
    });
  }

  it("and the seal reaches on-glass, which is the value the arms used to miss", async () => {
    // `on-glass` is what a member sitting ON a pane resolves, and every arm of this preference
    // keyed on the three THICKNESSES — the list that means "this element IS a pane". So the
    // pane sealed and everything on it stayed translucent: the setting doing half its job,
    // which reads worse than doing none because the pane and its contents then disagree.
    const card = mounted(
      <Card backdrop>
        <Button>on the pane</Button>
      </Card>,
      { theme: { material: "regular" } },
    );
    const inner = card.querySelector<HTMLElement>(".kui-button");
    expect(inner, "the fixture grew no hosted control").not.toBeNull();
    expect(inner!.dataset.material, "the fixture's control is not on-glass").toBe("on-glass");
    const before = computed(inner!, "background-color");

    await asksForSolidity();

    // An on-glass member carries no filter of its own (one glass per stack), so what the seal
    // owes it is the FILL — which is exactly the part that stayed see-through.
    expect(computed(inner!, "background-color"), "the on-glass member ignored the seal").not.toBe(before);
  });
});

/**
 * THE LIP SURVIVES A BIG PANE (§10, 2026-09-11).
 *
 * The glint's band is a LENGTH and it rode the lens's resolution cap, so on a large pane it
 * shrank with the map to about one pixel — and a `(1-t)^falloff` ramp sampled once per pixel has
 * no ridge left. Measured at the middle of an edge, which is where a person reads a lip: alpha
 * 159 on a 96x32 button and 18 on a 1400x900 shell pane, an 89% collapse across the size range.
 * On WebKit the lens is gated off, so this IS the glass's light there.
 *
 * Every law about the band read whether it EXISTS and what it wears. None read how strong it is,
 * which is why the same material could arrive as a lit object and as a flat rectangle on one
 * screen. This reads the minted map's own pixels, at the edge midpoint, at two sizes a real app
 * has — and the two must agree, not merely both be non-zero.
 */
describe("the glint's band holds its strength as the pane grows (§10)", () => {
  const edgePeak = async (el: HTMLElement): Promise<number> => {
    const url = el.style.getPropertyValue("--kui-glint").replace(/^url\("?|"?\)$/g, "");
    expect(url, "the hook never minted a mask for this box").toContain("data:image/png");
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext("2d");
    if (!x) throw new Error("no 2d context");
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    // Down a vertical cut at the MIDDLE of the top edge. The corners are where the band
    // overlaps itself, so a whole-map maximum reports the corner and not the lip — which is
    // how this collapse was first measured at 20% instead of 89%.
    const mid = Math.floor(c.width / 2);
    let peak = 0;
    for (let y = 0; y < Math.min(c.height, 40); y += 1) {
      const a = d[(y * c.width + mid) * 4 + 3] ?? 0;
      if (a > peak) peak = a;
    }
    return peak;
  };

  it("a full-window pane's lip is as strong as a small card's", async () => {
    const small = mounted(<Card backdrop style={{ width: 280, height: 180 }} />, {
      theme: { material: "regular" },
    });
    const large = mounted(<Card backdrop style={{ width: 1200, height: 800 }} />, {
      theme: { material: "regular" },
    });
    const a = await edgePeak(small);
    const b = await edgePeak(large);
    // Calibration: the small pane is the judged case and must be a real lip, or "they agree"
    // is satisfied by two panes that both paint nothing.
    expect(a, "the small pane's lip is not lit").toBeGreaterThan(100);
    // And the big one is within a third of it. Before the scale floor this was 18 against 140.
    expect(b, `the large pane's lip collapsed: ${b} against ${a}`).toBeGreaterThan(a * 0.66);
  });
});

/**
 * THE OS CONTRAST SIGNAL REACHES THE LIT ROW (§19, 2026-09-11).
 *
 * The prop path was fixed on 2026-08-09 and the platform path was never wired, so every law
 * here passed while the person the rule exists for — keyboard navigation, low vision — saw a
 * 1.16:1 wash. A law keyed on `contrast="high"` cannot see that.
 */
describe("a highlighted row answers the platform's contrast signal, not only the prop (§19)", () => {
  it("the lit row goes solid under prefers-contrast: more", async () => {
    const lit = mounted(<Row highlighted>Duplicate</Row>, { theme: {} });
    const dark = mounted(<Row highlighted={false}>Duplicate</Row>, { theme: {} });
    const before = computed(lit, "background-color");
    // Calibration: the row is LIT to begin with, and differs from an unlit one — otherwise
    // "the setting changed it" is satisfied by a fixture that was never the subject.
    expect(before, "the fixture's row is not lit at all").not.toBe(computed(dark, "background-color"));

    await asksForContrast();

    const after = computed(lit, "background-color");
    expect(after, "the OS contrast signal never reached the lit row").not.toBe(before);
    // And it lands on the SOLID rung, which is where the prop path lands — the two must agree
    // or the setting means something different depending on who asked for it.
    expect(after, "the platform path landed somewhere the prop path does not").toBe(
      colorOn(lit, "var(--tone-solid)"),
    );
  });
});
