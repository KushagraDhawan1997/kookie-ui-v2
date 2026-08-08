/**
 * Code's laws, mounted (§11, §15). Written to the 2026-08-03 standard: computed values
 * through a real `<Theme>`, both appearances where colour is the claim, each law falsified
 * against a sabotaged stylesheet before it was accepted.
 *
 * The claim under most of them is the CHEAP one — that this atom adds almost nothing, because
 * the type layer already resolves the ramp, the weights and the emphasis rungs. A law that
 * only checked Code's own two declarations would leave that claim unasserted, and the whole
 * reason the component is small is that the claim is true.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, colorOn, computed, mounted, numberOn, tokenOn } from "../../test/browser.tsx";
import { Text } from "../text/text.tsx";
import { Code } from "./code.tsx";

describe("the mono family is the atom's own, and the rest is the shared layer's (§15)", () => {
  it("wears --font-mono, where Text wears --font-body", () => {
    const code = mounted(<Code>npm i</Code>, { theme: {} });
    const text = mounted(<Text>npm i</Text>, { theme: {} });
    // Read off the element, not off the document: the Theme is a real scope and a slot it
    // rebound has to be the one the atom picks up. `||` was written here first and deleted —
    // a fallback to the element's own computed value makes the assertion satisfy itself,
    // which is the vacuity the audits keep finding.
    const mono = computed(code, "--font-mono");
    expect(mono).not.toBe("");
    expect(computed(code, "font-family")).toBe(mono);
    // And the comparison that cannot pass by accident: whatever the two resolve to, they must
    // differ — a chip that inherited the body stack would look right beside prose and be
    // wrong about the one thing it exists to say.
    expect(computed(code, "font-family")).not.toBe(computed(text, "font-family"));
  });

  it("the margin is zero, from .kui-type — a <code> arrives with none, but render can bring some", () => {
    const el = mounted(<Code render={<p />}>npm i</Code>, { theme: {} });
    expect(computed(el, "margin-top")).toBe("0px");
    expect(computed(el, "margin-bottom")).toBe("0px");
  });
});

describe("an unset size means the line it sits in, and that is the default (§15)", () => {
  it("bare, it takes its parent's step rather than a step of its own — at the mono discount", () => {
    // The failure this forbids: Text defaults to size 3, so a Code that copied that default
    // would jump a size-1 caption to 16px and nobody would call it a bug — they would just
    // stop using the component inside small text. The factor is the mono optical correction
    // (§15, 2026-08-08): mono glyphs read a step large at the same size, so the chip renders
    // at --mono-scale of the line it sits in, read from the token so a re-judged factor
    // never rots this law.
    const host = mounted(
      <Text size="1">
        run <Code>pnpm ci</Code>
      </Text>,
      { theme: {}, select: ".kui-code" },
    );
    expect(host.hasAttribute("data-size")).toBe(false);
    const scale = numberOn(host, "--mono-scale");
    expect(scale).toBeGreaterThan(0);
    expect(scale).toBeLessThan(1);
    expect(parseFloat(computed(host, "font-size"))).toBeCloseTo(
      parseFloat(tokenOn(host, "--font-size-1")) * scale,
      1,
    );
  });

  it("inside size 6 it is size 6 scaled — the inheritance is real, not a coincidence at one step", () => {
    const host = mounted(
      <Text size="6">
        run <Code>pnpm ci</Code>
      </Text>,
      { theme: {}, select: ".kui-code" },
    );
    expect(parseFloat(computed(host, "font-size"))).toBeCloseTo(
      parseFloat(tokenOn(host, "--font-size-6")) * numberOn(host, "--mono-scale"),
      1,
    );
  });

  it("a stated size resolves the step as Text does — same line box, glyphs at the discount", () => {
    // Compared against Text rather than against the tokens, and the difference matters twice.
    // It is the stronger claim — one type system, one resolution, which is the whole reason
    // this atom ships no ramp of its own. And `--letter-spacing-2` is `0em`, which a probe
    // reads as `0px` while the engine computes `normal`: asserting against the token would
    // have failed on a correct component. Line-height and letter-spacing are EQUAL — the
    // mono correction reaches font-size alone, so a chip sits in unmoved rhythm — and
    // font-size is Text's times --mono-scale, both directions of §15's split.
    for (const size of ["1", "2", "6", "9"] as const) {
      const code = mounted(<Code size={size}>pnpm ci</Code>, { theme: {} });
      const text = mounted(<Text size={size}>pnpm ci</Text>, { theme: {} });
      expect(computed(code, "line-height"), `size ${size}: line-height diverged from Text`).toBe(
        computed(text, "line-height"),
      );
      const scale = numberOn(code, "--mono-scale");
      expect(
        parseFloat(computed(code, "font-size")),
        `size ${size}: font-size is not Text's at the mono discount`,
      ).toBeCloseTo(parseFloat(computed(text, "font-size")) * scale, 1);
      // Letter-spacing is the step's EM value, so in px it follows the discounted glyphs —
      // tracking is a property of the rendered letters, the em-padding argument one property
      // over. Same em, smaller px: asserted as the ratio, with the zero steps compared raw
      // (0em computes as `normal`, which has no ratio to take).
      const ls = computed(text, "letter-spacing");
      if (ls === "normal" || parseFloat(ls) === 0) {
        expect(computed(code, "letter-spacing"), `size ${size}`).toBe(ls);
      } else {
        expect(
          parseFloat(computed(code, "letter-spacing")) / parseFloat(computed(code, "font-size")),
          `size ${size}: letter-spacing em diverged from Text's`,
        ).toBeCloseTo(parseFloat(ls) / parseFloat(computed(text, "font-size")), 4);
      }
    }
    // ...and the steps are genuinely different, so the equality above is not holding trivially.
    const one = mounted(<Code size="1">x</Code>, { theme: {} });
    const nine = mounted(<Code size="9">x</Code>, { theme: {} });
    expect(computed(one, "font-size")).not.toBe(computed(nine, "font-size"));
  });

  it("the discount stops at the chip — Text nested inside a Code takes its full step", () => {
    // The registration half (§2's silent-inheritance lesson, applied before it bit): the
    // scale is non-inheriting with initial 1, so a type member INSIDE a mono atom resolves
    // its step undiscounted rather than quietly wearing the chip's factor.
    const host = mounted(
      <Code size="3">
        <Text size="3" render={<span />}>
          plain again
        </Text>
      </Code>,
      { theme: {}, select: ".kui-text" },
    );
    expect(computed(host, "font-size")).toBe(tokenOn(host, "--font-size-3"));
  });
});

describe("the padding is a property of the glyphs, not of the layout (§3, §15)", () => {
  it("it tracks the type across the ramp — the whole reason it is not a token", () => {
    // A designed constant would hold ONE of these and be wrong at the other end of a 12->56px
    // ramp. The law reads the ratio rather than the value, which is the thing that was chosen.
    const small = mounted(<Code size="1">x</Code>, { theme: {} });
    const large = mounted(<Code size="8">x</Code>, { theme: {} });
    const ratio = (el: HTMLElement) =>
      parseFloat(computed(el, "padding-left")) / parseFloat(computed(el, "font-size"));
    expect(ratio(small)).toBeCloseTo(ratio(large), 3);
    // ...and the two are genuinely different sizes, so the ratio is not holding trivially.
    expect(parseFloat(computed(large, "padding-left"))).toBeGreaterThan(
      parseFloat(computed(small, "padding-left")) * 2,
    );
  });

  it("a wrapped chip keeps its fill on both fragments", () => {
    expect(computed(mounted(<Code>x</Code>, { theme: {} }), "box-decoration-break")).toBe("clone");
  });

  it("the corner tracks the type across the ramp, like the padding beside it (§6)", () => {
    // The fraction wall's sixth instance, caught in the playground (2026-08-08, Kushagra):
    // the chip wore --radius-control-1, a level pick priced for the height ladder the atom
    // is not on, so size 9 wore size 1's 4px. The atom corner is EM — same ratio at every
    // step, and the steps genuinely differ.
    const small = mounted(<Code size="1">x</Code>, { theme: {} });
    const large = mounted(<Code size="8">x</Code>, { theme: {} });
    const ratio = (el: HTMLElement) =>
      parseFloat(computed(el, "border-top-left-radius")) / parseFloat(computed(el, "font-size"));
    expect(ratio(small)).toBeCloseTo(ratio(large), 3);
    expect(ratio(small)).toBeGreaterThan(0);
    expect(parseFloat(computed(large, "border-top-left-radius"))).toBeGreaterThan(
      parseFloat(computed(small, "border-top-left-radius")) * 2,
    );
  });

  it("the corner answers the radius AXIS — none squares it, and the levels order (§6)", () => {
    const corner = (radius: "none" | "small" | "medium" | "large" | "full") =>
      parseFloat(
        computed(mounted(<Code size="3">x</Code>, { theme: { radius } }), "border-top-left-radius"),
      );
    expect(corner("none")).toBe(0);
    const [s, m, l, f] = [corner("small"), corner("medium"), corner("large"), corner("full")];
    expect(s).toBeGreaterThan(0);
    expect(m).toBeGreaterThan(s);
    expect(l).toBeGreaterThan(m);
    expect(f).toBeGreaterThan(l);
  });
});

describe("the fill is an identity and the tone reaches BOTH of the chip's colours (§7, §11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: bare, it is the neutral wash and the neutral ink`, () => {
      const el = mounted(<Code>npm i</Code>, { theme: { appearance } });
      expect(el.dataset.tone).toBe("neutral");
      expect(computed(el, "background-color")).toBe(colorOn(el, "var(--neutral-soft)"));
      expect(computed(el, "color")).toBe(colorOn(el, "var(--neutral-ink)"));
    });

    it(`${appearance}: a chosen tone moves the fill AND the ink — an atom with a fill has two`, () => {
      // The half that is easy to ship broken: `.kui-type[data-tone]` re-scopes the INK trio,
      // so a chip could take a destructive tone, turn its text red and keep a grey box. The
      // fill reads the same indirection, and this is the law that says so.
      const el = mounted(<Code tone="destructive">rm -rf</Code>, { theme: { appearance } });
      const neutral = mounted(<Code>rm -rf</Code>, { theme: { appearance } });
      expect(computed(el, "background-color")).toBe(colorOn(el, "var(--destructive-soft)"));
      expect(computed(el, "color")).toBe(colorOn(el, "var(--destructive-ink)"));
      expect(computed(el, "background-color")).not.toBe(computed(neutral, "background-color"));
      expect(computed(el, "color")).not.toBe(computed(neutral, "color"));
    });

    it(`${appearance}: the fill does NOT climb the emphasis ladder — that axis is the ink's`, () => {
      // §11's "medium" for this row named a FILL rung under the control resolution. The type
      // family resolves emphasis as foreground roles, and one axis read two ways in one
      // element is the incoherence §9 deleted `variant` to avoid.
      const loud = mounted(<Code emphasis="loud">x</Code>, { theme: { appearance } });
      const quiet = mounted(<Code emphasis="quiet">x</Code>, { theme: { appearance } });
      expect(computed(quiet, "background-color")).toBe(computed(loud, "background-color"));
      expect(computed(quiet, "color")).not.toBe(computed(loud, "color"));
    });
  }
});

describe("it is inert — an atom with no states (§11)", () => {
  it("no cursor of its own, no focus ring, no shadow, in either world", () => {
    for (const surfaces of ["flat", "elevated"] as const) {
      const el = mounted(<Code>x</Code>, { theme: { surfaces } });
      expect(computed(el, "box-shadow"), `${surfaces} lifted an inert atom`).toBe("none");
      expect(computed(el, "cursor")).not.toBe(tokenOn(el, "--cursor-button"));
      expect(computed(el, "outline-style")).toBe("none");
    }
  });
});
