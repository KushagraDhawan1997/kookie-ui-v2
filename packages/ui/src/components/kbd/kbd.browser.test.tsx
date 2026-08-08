/**
 * Kbd's laws, mounted (§11, §15). The component's whole claim is "Code plus an edge", so the
 * laws are shaped as a COMPARISON against Code rather than as a second copy of Code's file:
 * a restated assertion would go green on a Kbd that had quietly diverged, which is exactly
 * the drift the self-keyed-second-member rule accepts as a temporary cost.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, colorOn, computed, mounted, tokenOn } from "../../test/browser.tsx";
import { Code } from "../code/code.tsx";
import { Kbd } from "./kbd.tsx";

describe("Kbd is Code plus an edge, and the edge is the whole difference (§11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: same family, same fill, same corner as the chip beside it`, () => {
      const kbd = mounted(<Kbd>⌘K</Kbd>, { theme: { appearance } });
      const code = mounted(<Code>⌘K</Code>, { theme: { appearance } });
      for (const prop of ["font-family", "background-color", "color", "border-top-left-radius"]) {
        expect(computed(kbd, prop), `${appearance}: the cap's ${prop} drifted from the chip`).toBe(
          computed(code, prop),
        );
      }
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

describe("a key cap is not a raised object (§5 — the elevation deletion, held where it is tempting)", () => {
  it("no shadow, in either world — the classic 'just a tiny inset shadow' case, refused", () => {
    for (const surfaces of ["flat", "elevated"] as const) {
      const el = mounted(<Kbd>⌘K</Kbd>, { theme: { surfaces } });
      expect(computed(el, "box-shadow"), `${surfaces} lifted the cap`).toBe("none");
    }
  });
});

describe("it inherits the atom's typography rules, not a second set (§15)", () => {
  it("an unset size takes the line it sits in, and a stated one joins the paired scales", () => {
    const bare = mounted(<Kbd>⌘K</Kbd>, { theme: {} });
    expect(bare.hasAttribute("data-size")).toBe(false);
    const sized = mounted(<Kbd size="2">⌘K</Kbd>, { theme: {} });
    expect(computed(sized, "font-size")).toBe(tokenOn(sized, "--font-size-2"));
    expect(computed(sized, "line-height")).toBe(tokenOn(sized, "--line-height-2"));
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
