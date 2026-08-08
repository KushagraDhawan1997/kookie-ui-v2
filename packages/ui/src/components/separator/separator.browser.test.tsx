/**
 * Separator's laws, mounted (§11). Written to the 2026-08-03 standard: computed values
 * through a real <Theme>, both appearances where colour is the claim.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, colorOn, computed, mounted, tokenOn } from "../../test/browser.tsx";
import { Flex } from "../flex/flex.tsx";
import { Separator } from "./separator.tsx";

describe("the line is the quiet hairline, in both appearances (§11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: paints --color-border, not a solved edge`, () => {
      const el = mounted(<Separator />, { theme: { appearance } });
      expect(computed(el, "background-color")).toBe(colorOn(el, "var(--color-border)"));
      // The edge order (§7): separators sit UNDER the solved tiers. If this ever equals the
      // control edge, the quiet hairline has been re-pointed and cards moved with it.
      expect(computed(el, "background-color")).not.toBe(colorOn(el, "var(--control-edge)"));
    });
  }
});

describe("thickness is the scaled border width, extent is the container's (§11, §12)", () => {
  it("horizontal: --border-width tall, full width of the block that owns it", () => {
    const el = mounted(<Separator />, { theme: {} });
    expect(computed(el, "height")).toBe(tokenOn(el.parentElement!, "--border-width"));
    expect(el.getBoundingClientRect().width).toBeCloseTo(
      el.parentElement!.getBoundingClientRect().width,
      1,
    );
  });

  it("vertical: --border-width wide, stretched to the flex row that owns it", () => {
    const el = mounted(
      <Flex>
        <div style={{ height: "80px", width: "40px" }} />
        <Separator orientation="vertical" />
      </Flex>,
      { theme: {}, select: ".kui-separator" },
    );
    expect(computed(el, "width")).toBe(tokenOn(el.parentElement!, "--border-width"));
    expect(el.getBoundingClientRect().height).toBeCloseTo(80, 1);
  });

  it("a Stack squeezing for room never thins the rule — the item does not flex", () => {
    const el = mounted(
      <Flex direction="column" style={{ height: "20px" }}>
        <div style={{ height: "40px" }} />
        <Separator />
        <div style={{ height: "40px" }} />
      </Flex>,
      { theme: {}, select: ".kui-separator" },
    );
    expect(computed(el, "height")).toBe(tokenOn(el.parentElement!, "--border-width"));
  });
});

describe("the platform sees a separator, and orientation reaches AT (§1)", () => {
  it("horizontal by default: role stamped, aria-orientation horizontal", () => {
    const el = mounted(<Separator />, { theme: {} });
    expect(el.getAttribute("role")).toBe("separator");
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
    expect(el.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("vertical: both spellings move together — the stylesheet and AT read one fact", () => {
    const el = mounted(<Separator orientation="vertical" />, { theme: {} });
    expect(el.getAttribute("aria-orientation")).toBe("vertical");
    expect(el.getAttribute("data-orientation")).toBe("vertical");
  });
});
