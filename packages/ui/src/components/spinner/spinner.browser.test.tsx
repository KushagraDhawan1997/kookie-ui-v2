/**
 * Spinner's laws, mounted (§4, §8). Written 2026-08-06 with the test-file law: Spinner shipped
 * CSS from day one and was the one stylesheet-bearing component with no mounted law at all —
 * its geometry claims (the icon box, the swap-shifts-nothing promise) were prose.
 */
import { describe, expect, it } from "vitest";

import { SIZES, asksForStillness, computed, mounted, tokenOn, inMotion } from "../../test/browser.tsx";
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

  it("refuses a colour at the type level — it is the label's colour or it is nothing", () => {
    // The published refusal, enforced (2026-08-26 audit). `React.HTMLAttributes` declares the
    // legacy `color` attribute, so Spinner — the one DOM-typed component in the package that
    // did not omit it — accepted `color="red"`, spread it onto the span as an ATTRIBUTE no
    // engine honours there, and drew exactly nothing. tsc is the runner for this half.
    // @ts-expect-error — a spinner has no colour of its own; it fills with currentColor
    void (<Spinner color="red" />);
    // …and the escape that DOES work still compiles, or the refusal above has taken a real
    // capability with it.
    void (<Spinner style={{ color: "red" }} />);
  });

  it("ticks spoke to spoke — steps(8), a composited rotation on the HTML wrapper", () => {
    // Motion-as-content, so this law announces it: the harness holds the page still by
    // default, which is what keeps every APPEARANCE law from reading a transition's first
    // frame (test/browser.tsx). A spinner that stops is information lost, and a law about it
    // has to let it run.
    inMotion();
    const el = mounted(<Spinner />, { theme: {} });
    expect(computed(el, "animation-timing-function")).toBe("steps(8)");
    expect(computed(el, "animation-iteration-count")).toBe("infinite");
    // The wrapper animates, the svg never does (LOG 2026-08-06: an SVG root's transform is
    // not reliably composited, and this control's one job is to keep moving).
    expect(computed(el.querySelector(".kui-spinner-svg")!, "animation-name")).toBe("none");
  });

  it("slowed, never stopped, when the OS asks for stillness (§8, 2026-08-26)", async () => {
    /**
     * §8's one sentence about this component under `prefers-reduced-motion` — "it slows (3s)
     * rather than stops, because a busy indicator that stops moving is information lost" —
     * was asserted by nothing: no law in this file entered the media query, so the block
     * could have been deleted, zeroed, or turned into `animation: none` with the suite green.
     *
     * `inMotion()` first, and it is the negative control as much as the setup: the harness
     * freezes every page by default, so a duration read without it is the HARNESS's stillness
     * and would be the same value whether the guard existed or not.
     *
     * Both halves, because each alone passes for the wrong reason: the NAME catches a
     * stand-down (`animation: none` leaves a duration behind), and the duration catches a
     * block that speeds the indicator up instead of slowing it.
     */
    inMotion();
    const running = mounted(<Spinner />, { theme: {} });
    const fast = parseFloat(computed(running, "animation-duration"));
    expect(fast, "the spinner is not animating at all, so this proves nothing").toBeGreaterThan(0);

    await asksForStillness();
    const still = mounted(<Spinner />, { theme: {} });
    expect(computed(still, "animation-name"), "the busy signal stopped — information lost").toBe("kui-spin");
    expect(computed(still, "animation-play-state")).toBe("running");
    expect(
      parseFloat(computed(still, "animation-duration")),
      "stillness did not SLOW the indicator",
    ).toBeGreaterThan(fast);
  });
});
