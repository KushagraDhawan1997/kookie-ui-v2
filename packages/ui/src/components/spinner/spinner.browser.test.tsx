/**
 * Spinner's laws, mounted (§4, §8). Written 2026-08-06 with the test-file law: Spinner shipped
 * CSS from day one and was the one stylesheet-bearing component with no mounted law at all —
 * its geometry claims (the icon box, the swap-shifts-nothing promise) were prose.
 */
import { describe, expect, it } from "vitest";

import { SIZES, computed, mounted, tokenOn } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Spinner } from "./spinner.tsx";

describe("the spinner wears the icon box, so swapping it in shifts nothing (§4)", () => {
  it("standalone it falls back to the size-2 box", () => {
    const el = mounted(<Spinner />, { theme: {} });
    const box = tokenOn(el.parentElement!, "--icon-size-2");
    expect(computed(el, "width")).toBe(box);
    expect(computed(el, "height")).toBe(box);
  });

  for (const size of SIZES) {
    it(`inside a size-${size} control it takes the control's resolved icon box`, () => {
      const el = mounted(
        <Button size={size} loading>
          Label
        </Button>,
        { theme: {}, select: ".kui-spinner" },
      );
      const box = tokenOn(el.closest(".kui-control")!, `--icon-size-${size}`);
      expect(computed(el, "width")).toBe(box);
      expect(computed(el, "height")).toBe(box);
    });
  }
});

describe("it is the label's colour, with no token of its own (§8, §11)", () => {
  it("fills with currentColor — the tone's label reaches the svg through inheritance", () => {
    const el = mounted(
      <Button tone="accent" emphasis="loud" loading>
        Label
      </Button>,
      { theme: {}, select: ".kui-spinner" },
    );
    // fill is declared as currentColor on the wrapper; computed, both resolve to the same
    // colour, and that colour is the control's own label colour — no spinner token exists.
    expect(computed(el, "fill")).toBe(computed(el, "color"));
    expect(computed(el, "color")).toBe(computed(el.closest(".kui-control")!, "color"));
  });
});

describe("one busy signal, not two (§8)", () => {
  it("the spinner is decorative; the control that owns it carries aria-busy", () => {
    const el = mounted(
      <Button loading>Label</Button>,
      { theme: {}, select: ".kui-spinner" },
    );
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.closest(".kui-control")!.getAttribute("aria-busy")).toBe("true");
  });

  it("ticks spoke to spoke — steps(8), a composited rotation on the HTML wrapper", () => {
    const el = mounted(<Spinner />, { theme: {} });
    expect(computed(el, "animation-timing-function")).toBe("steps(8)");
    expect(computed(el, "animation-iteration-count")).toBe("infinite");
    // The wrapper animates, the svg never does (LOG 2026-08-06: an SVG root's transform is
    // not reliably composited, and this control's one job is to keep moving).
    expect(computed(el.querySelector(".kui-spinner-svg")!, "animation-name")).toBe("none");
  });
});
