/**
 * Blockquote's laws, mounted (§11, §15). The component's claim is that it is Text plus a rule
 * and an indent, so the laws are shaped as a comparison against Text wherever the claim is
 * "nothing changed" — a restated assertion would go green against a quote that had quietly
 * grown its own type behaviour.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, colorOn, computed, mounted, tokenOn } from "../../test/browser.tsx";
import { Separator } from "../separator/separator.tsx";
import { Text } from "../text/text.tsx";
import { Blockquote } from "./blockquote.tsx";

describe("it reads exactly as Text reads — the type layer does all of it (§15)", () => {
  it("the ramp, the weights and the family are the shared layer's, at every step checked", () => {
    for (const size of ["1", "3", "6", "9"] as const) {
      const quote = mounted(<Blockquote size={size}>a</Blockquote>, { theme: {} });
      const text = mounted(<Text size={size}>a</Text>, { theme: {} });
      for (const prop of ["font-size", "line-height", "letter-spacing", "font-family"]) {
        expect(computed(quote, prop), `size ${size}: ${prop} diverged from Text`).toBe(
          computed(text, prop),
        );
      }
    }
    // The steps are genuinely different, so the equalities above are not holding trivially.
    const one = mounted(<Blockquote size="1">a</Blockquote>, { theme: {} });
    const nine = mounted(<Blockquote size="9">a</Blockquote>, { theme: {} });
    expect(computed(one, "font-size")).not.toBe(computed(nine, "font-size"));
  });

  it("the UA margin is gone — a <blockquote> is the element that arrives with the most", () => {
    // The non-negotiable, tested where it actually bites: `.kui-type` zeroes it, and the
    // browser's own default for this element is 1em block plus 40px inline.
    const el = mounted(<Blockquote>a</Blockquote>, { theme: {} });
    for (const side of ["top", "bottom", "left", "right"]) {
      expect(computed(el, `margin-${side}`), `margin-${side} survived`).toBe("0px");
    }
  });

  it("the emphasis rungs are the foreground roles, and it rests loud like all type", () => {
    const bare = mounted(<Blockquote>a</Blockquote>, { theme: {} });
    const loud = mounted(<Blockquote emphasis="loud">a</Blockquote>, { theme: {} });
    const quiet = mounted(<Blockquote emphasis="quiet">a</Blockquote>, { theme: {} });
    expect(computed(bare, "color")).toBe(computed(loud, "color"));
    expect(computed(quiet, "color")).not.toBe(computed(loud, "color"));
  });

  it("renders a <blockquote>, and render swaps the element while keeping the dress", () => {
    expect(mounted(<Blockquote>a</Blockquote>, { theme: {} }).tagName).toBe("BLOCKQUOTE");
    const aside = mounted(<Blockquote render={<aside />}>a</Blockquote>, { theme: {} });
    expect(aside.tagName).toBe("ASIDE");
    expect(parseFloat(computed(aside, "border-left-width"))).toBeGreaterThan(0);
  });
});

describe("the rule is the quiet hairline, and it is TONE-LESS (§7's edge order, §11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: it paints --color-border at --border-width, on the leading edge only`, () => {
      const el = mounted(<Blockquote>a</Blockquote>, { theme: { appearance } });
      expect(computed(el, "border-left-width")).toBe(tokenOn(el, "--border-width"));
      expect(computed(el, "border-left-color")).toBe(colorOn(el, "var(--color-border)"));
      for (const side of ["top", "right", "bottom"]) {
        expect(parseFloat(computed(el, `border-${side}-width`)), `${side} grew a border`).toBe(0);
      }
    });

    it(`${appearance}: it is the same paint a Separator wears — one hairline, two components`, () => {
      const quote = mounted(<Blockquote>a</Blockquote>, { theme: { appearance } });
      const rule = mounted(<Separator />, { theme: { appearance } });
      expect(computed(quote, "border-left-color")).toBe(computed(rule, "background-color"));
      // ...and NOT one of the solved tiers. If this ever equals the control edge, the edge
      // order has slipped and cards moved with it.
      expect(computed(quote, "border-left-color")).not.toBe(colorOn(quote, "var(--control-edge)"));
    });

    it(`${appearance}: a chosen tone moves the INK and leaves the rule alone`, () => {
      // §11's rule for this family, stated as a computed value: tone re-scopes the ink trio,
      // full stop. A quote whose bar carried meaning would be a Callout.
      const toned = mounted(<Blockquote tone="destructive">a</Blockquote>, { theme: { appearance } });
      const bare = mounted(<Blockquote>a</Blockquote>, { theme: { appearance } });
      expect(computed(toned, "color")).not.toBe(computed(bare, "color"));
      expect(computed(toned, "border-left-color")).toBe(computed(bare, "border-left-color"));
    });

    it(`${appearance}: an unstamped quote inside a TONED ancestor keeps the neutral rule`, () => {
      // The reason the rule is spelled `--color-border` rather than `var(--tone-border, …)`:
      // custom properties inherit, so the fallback form would have silently taken the
      // ancestor's family here. Mounted because no reading of the source shows it.
      const nested = mounted(
        <Text tone="destructive" render={<div />}>
          <Blockquote>a</Blockquote>
        </Text>,
        { theme: { appearance }, select: ".kui-blockquote" },
      );
      const bare = mounted(<Blockquote>a</Blockquote>, { theme: { appearance } });
      expect(computed(nested, "border-left-color")).toBe(computed(bare, "border-left-color"));
      expect(computed(nested, "border-left-color")).not.toBe(
        colorOn(nested, "var(--destructive-border)"),
      );
    });
  }
});

describe("the indent is a property of the words (§15, the atoms' rule)", () => {
  it("it tracks the type across the ramp, so the rule never crowds or strands the text", () => {
    const ratio = (el: HTMLElement) =>
      parseFloat(computed(el, "padding-left")) / parseFloat(computed(el, "font-size"));
    const small = mounted(<Blockquote size="1">a</Blockquote>, { theme: {} });
    const large = mounted(<Blockquote size="9">a</Blockquote>, { theme: {} });
    expect(ratio(small)).toBeCloseTo(ratio(large), 3);
    expect(parseFloat(computed(large, "padding-left"))).toBeGreaterThan(
      parseFloat(computed(small, "padding-left")) * 3,
    );
  });

  it("the indent is on the leading edge only — a quote is not a padded box", () => {
    const el = mounted(<Blockquote>a</Blockquote>, { theme: {} });
    expect(parseFloat(computed(el, "padding-left"))).toBeGreaterThan(0);
    for (const side of ["top", "right", "bottom"]) {
      expect(parseFloat(computed(el, `padding-${side}`)), `${side} grew padding`).toBe(0);
    }
  });
});
