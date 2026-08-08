/**
 * Kbd's laws, mounted (§11, §15). The component's whole claim is "Code plus an edge", so the
 * laws are shaped as a COMPARISON against Code rather than as a second copy of Code's file:
 * a restated assertion would go green on a Kbd that had quietly diverged, which is exactly
 * the drift the self-keyed-second-member rule accepts as a temporary cost.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, POINTERS, colorOn, computed, mounted, numberOn, tokenOn } from "../../test/browser.tsx";
import { Code } from "../code/code.tsx";
import { Text } from "../text/text.tsx";
import { Kbd } from "./kbd.tsx";

describe("Kbd shares the chip's fill and tone facts, in its OWN family (§11, §15)", () => {
  it("wears the BODY family, and left the mono slot on purpose — the two must differ", () => {
    // The 2026-08-08 reversal, judged in the playground: a mono cell draws ⌘ compact to
    // fit its fixed advance, and the platform sets shortcuts in the UI sans. Asserted in
    // both directions so neither a cap quietly back on mono nor a chip quietly on sans
    // survives.
    const kbd = mounted(<Kbd>⌘K</Kbd>, { theme: {} });
    const code = mounted(<Code>⌘K</Code>, { theme: {} });
    expect(computed(kbd, "font-family")).toBe(computed(mounted(<Text>x</Text>, { theme: {} }), "font-family"));
    expect(computed(kbd, "font-family")).not.toBe(computed(code, "font-family"));
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: same fill, same ink, same corner RATIO as the chip beside it`, () => {
      const kbd = mounted(<Kbd>⌘K</Kbd>, { theme: { appearance } });
      const code = mounted(<Code>⌘K</Code>, { theme: { appearance } });
      for (const prop of ["background-color", "color"]) {
        expect(computed(kbd, prop), `${appearance}: the cap's ${prop} drifted from the chip`).toBe(
          computed(code, prop),
        );
      }
      // The corner is the atom family's em (§6), so the two agree as a RATIO of their own
      // fonts — the px differ exactly as the scales do, which is the em doing its job.
      const ratio = (el: HTMLElement) =>
        parseFloat(computed(el, "border-top-left-radius")) / parseFloat(computed(el, "font-size"));
      expect(ratio(kbd), `${appearance}: the cap's corner em drifted from the chip's`).toBeCloseTo(
        ratio(code),
        3,
      );
    });

    it(`${appearance}: the cap has a hairline where the chip has none`, () => {
      const kbd = mounted(<Kbd>⌘K</Kbd>, { theme: { appearance } });
      const code = mounted(<Code>⌘K</Code>, { theme: { appearance } });
      expect(computed(kbd, "border-top-width")).toBe(tokenOn(kbd, "--border-width"));
      expect(computed(kbd, "border-top-color")).toBe(colorOn(kbd, "var(--neutral-border)"));
      expect(parseFloat(computed(code, "border-top-width"))).toBe(0);
    });

    it(`${appearance}: it is the TONE-aware border, not one of the solved edges (§7)`, () => {
      // The edge order: `--control-edge` and `--field-edge` were solved for controls whose
      // identity rests on the hairline. A cap has a fill to carry it, and it stamps a tone, so
      // it reads the tone's border. If this ever equals a solved tier, the order has slipped.
      const kbd = mounted(<Kbd>⌘K</Kbd>, { theme: { appearance } });
      expect(computed(kbd, "border-top-color")).not.toBe(colorOn(kbd, "var(--control-edge)"));
      expect(computed(kbd, "border-top-color")).not.toBe(colorOn(kbd, "var(--field-edge)"));
    });

    it(`${appearance}: a tone moves all three of its colours`, () => {
      const toned = mounted(<Kbd tone="accent">⌘K</Kbd>, { theme: { appearance } });
      const bare = mounted(<Kbd>⌘K</Kbd>, { theme: { appearance } });
      expect(computed(toned, "border-top-color")).toBe(colorOn(toned, "var(--accent-border)"));
      expect(computed(toned, "border-top-color")).not.toBe(computed(bare, "border-top-color"));
      expect(computed(toned, "background-color")).not.toBe(computed(bare, "background-color"));
      expect(computed(toned, "color")).not.toBe(computed(bare, "color"));
    });
  }
});

describe("a key cap IS a raised object (§5 — the day-one refusal reversed 2026-08-08)", () => {
  it("casts ALWAYS, both worlds — the grips' exception, inherited for the same reason", () => {
    // A cap is a picture of a raised physical key, so depth is role semantics here, not the
    // app's dial: it reads the palette row's VALUE (--control-chrome), never the world
    // switch, so flat and elevated render the identical cast — the equality is the claim.
    const casts: string[] = [];
    for (const surfaces of ["flat", "elevated"] as const) {
      const el = mounted(<Kbd>⌘K</Kbd>, { theme: { surfaces } });
      const cast = computed(el, "box-shadow");
      expect(cast, `${surfaces}: the cap went flat`).not.toBe("none");
      casts.push(cast);
    }
    expect(casts[0], "the cast moved with the world — 'always' broke").toBe(casts[1]);
  });
});

describe("it inherits the atom's typography rules, not a second set (§15)", () => {
  it("an unset size takes the line it sits in, and a stated one joins the paired scales", () => {
    const bare = mounted(<Kbd>⌘K</Kbd>, { theme: {} });
    expect(bare.hasAttribute("data-size")).toBe(false);
    // Font-size wears the cap's OWN factor (§15, 2026-08-08 — deeper than the chip's, and
    // the two are asserted apart below so one config line collapsing them is caught) while
    // a stated size keeps the join's line box.
    const sized = mounted(<Kbd size="2">⌘K</Kbd>, { theme: {} });
    const scale = numberOn(sized, "--kbd-scale");
    expect(scale).toBeGreaterThan(0);
    expect(scale).toBeLessThan(numberOn(sized, "--mono-scale"));
    expect(parseFloat(computed(sized, "font-size"))).toBeCloseTo(
      parseFloat(tokenOn(sized, "--font-size-2")) * scale,
      1,
    );
    expect(computed(sized, "line-height")).toBe(tokenOn(sized, "--line-height-2"));
  });

  it("the cap is a key, not highlighted text: centered glyphs in a floored box that never wraps", () => {
    // The geometry that landed with the family move (§15, 2026-08-08). The floor is read as
    // the rendered ratio, not the declaration: a one-glyph cap must stand at least its
    // min-inline-size wide, which is what stops K from shrink-wrapping into a sliver.
    const one = mounted(<Kbd>K</Kbd>, { theme: {} });
    expect(computed(one, "white-space")).toBe("nowrap");
    expect(computed(one, "justify-content")).toBe("center");
    const width = parseFloat(computed(one, "width"));
    const font = parseFloat(computed(one, "font-size"));
    expect(width, "a one-glyph cap shrink-wrapped below its floor").toBeGreaterThanOrEqual(
      1.6 * font - 0.5,
    );
  });

  it("an inherited cap NEVER spreads its line — all nine steps, both pointer worlds", () => {
    // Rewritten 2026-08-08 after the audit: the previous spelling looped sizes 1-4 with a
    // 3px bound, and those are exactly the cells where the bound cannot fail. Measured
    // across the full ramp the old geometry grew the line by 3.4 / 4.8 / 7.8 / 13.1px at
    // steps 6-9, because a constant-em cap cannot track a line ratio that falls from 1.33
    // to 1.107. The cap is now `block-size: 1lh`, so the claim is the strong one — flush,
    // not bounded — and it is asserted where it used to break.
    for (const pointer of POINTERS) {
      for (const size of ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const) {
        const host = mounted(
          <div>
            <Text size={size} render={<p />} id="with">
              press <Kbd>⌘K</Kbd> to search
            </Text>
            <Text size={size} render={<p />} id="without">
              press K to search
            </Text>
          </div>,
          { theme: { pointer } },
        );
        const h = (id: string) =>
          host.querySelector<HTMLElement>(`#${id}`)!.getBoundingClientRect().height;
        expect(
          h("with") - h("without"),
          `${pointer}/size ${size}: the cap spread its line`,
        ).toBeCloseTo(0, 1);
      }
    }
  });

  it("and a STATED size is flush in its own line too — the join's pairing, not the parent's", () => {
    for (const size of ["1", "5", "9"] as const) {
      const host = mounted(
        <div>
          <Text size={size} render={<p />} id="with">
            press <Kbd size={size}>⌘K</Kbd> to search
          </Text>
          <Text size={size} render={<p />} id="without">
            press K to search
          </Text>
        </div>,
        { theme: {} },
      );
      const h = (id: string) =>
        host.querySelector<HTMLElement>(`#${id}`)!.getBoundingClientRect().height;
      expect(h("with") - h("without"), `stated size ${size} spread its line`).toBeCloseTo(0, 1);
    }
  });

  it("the cap has a face: its box IS the line box, at every step", () => {
    // The positive direction, restated 2026-08-08 as the mechanism rather than as a
    // threshold. The old spelling asserted height >= 1.4x the font, which could not tell
    // the designed 0.12em padding from the 0.05em it replaced (audit) and would have gone
    // green on any cap that merely happened to be tallish. The claim now is exact: the cap
    // stands one inherited line box tall, which is simultaneously the face (it is taller
    // than its own discounted glyph line) and the reason the line never spreads.
    for (const size of ["1", "3", "6", "9"] as const) {
      const host = mounted(
        <Text size={size} render={<p />}>
          press <Kbd>⌘K</Kbd> to search
        </Text>,
        { theme: {} },
      );
      const cap = host.querySelector<HTMLElement>(".kui-kbd")!;
      const line = parseFloat(computed(host, "line-height"));
      expect(cap.getBoundingClientRect().height, `size ${size}: the cap is not one line tall`)
        .toBeCloseTo(line, 1);
      // ...and that really is a face: the box stands clear of the glyph it holds.
      expect(cap.getBoundingClientRect().height).toBeGreaterThan(
        parseFloat(computed(cap, "font-size")) * 1.1,
      );
    }
  });

  it("its padding tracks its own type, and it is WIDER than the chip's — the border eats room", () => {
    const kbd = mounted(<Kbd size="3">⌘K</Kbd>, { theme: {} });
    const code = mounted(<Code size="3">⌘K</Code>, { theme: {} });
    expect(parseFloat(computed(kbd, "padding-left"))).toBeGreaterThan(
      parseFloat(computed(code, "padding-left")),
    );
    const ratio = (el: HTMLElement) =>
      parseFloat(computed(el, "padding-left")) / parseFloat(computed(el, "font-size"));
    expect(ratio(mounted(<Kbd size="1">x</Kbd>, { theme: {} }))).toBeCloseTo(
      ratio(mounted(<Kbd size="8">x</Kbd>, { theme: {} })),
      3,
    );
  });

  it("renders a <kbd>, and Code renders a <code> — the semantics are the point", () => {
    expect(mounted(<Kbd>⌘K</Kbd>, { theme: {} }).tagName).toBe("KBD");
    expect(mounted(<Code>⌘K</Code>, { theme: {} }).tagName).toBe("CODE");
  });
});
