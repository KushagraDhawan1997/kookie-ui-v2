/**
 * Text and Heading, mounted (§3, §5, §11, §15) — one file because they are one type system:
 * the same ramp and weight set through two family slots. Laws read computed values through a
 * mounted Theme, per the 2026-08-03 audit standard; the static half (the layer carries each
 * axis once, tokens only) lives in system/type.test.ts.
 */
import type * as React from "react";
import { describe, expect, it } from "vitest";

import { Theme } from "../../theme/theme.tsx";
import { computed, render } from "../../test/browser.tsx";
import { Card } from "../card/card.tsx";
import { Heading } from "../heading/heading.tsx";
import { Text } from "./text.tsx";

/** Resolve a token the way a component does — through an element, not through the text. */
function tokenOn(el: Element, name: string): string {
  const probe = document.createElement("div");
  probe.style.color = `var(${name})`;
  el.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

describe("a size step joins the three paired scales at one index (§15)", () => {
  it("resolves font-size, line-height and letter-spacing together", () => {
    const body = render(<Text>body</Text>);
    // The anchor step: --font-size-base is step 3, and Text rests on it.
    expect(computed(body, "font-size")).toBe("16px");
    expect(computed(body, "line-height")).toBe("24px");

    const display = render(<Text size="9">display</Text>);
    expect(computed(display, "font-size")).toBe("56px");
    // Paired, not derived: 62/56 ≈ 1.11 — a global 1.5 ratio would have said 84.
    expect(computed(display, "line-height")).toBe("62px");
    // Display sizes tighten; the negative tracking comes from the paired token.
    expect(parseFloat(computed(display, "letter-spacing"))).toBeLessThan(0);
  });

  it("Heading sits on the same ramp — one type system, not two", () => {
    const h = render(<Heading size="4">title</Heading>);
    const t = render(<Text size="4">text</Text>);
    expect(computed(h, "font-size")).toBe(computed(t, "font-size"));
    expect(computed(h, "line-height")).toBe(computed(t, "line-height"));
  });
});

describe("type never takes density or pointer — boxes move, labels hold (§12, §15, §16)", () => {
  it("holds its step under every world a Theme can set", () => {
    for (const worlds of [
      { density: "compact" },
      { density: "comfortable" },
      { pointer: "coarse" },
      { density: "compact", pointer: "coarse" },
    ] as const) {
      const el = render(
        <Theme {...worlds}>
          <Text size="3">held</Text>
        </Theme>,
      ).querySelector(".kui-text")!;
      expect(computed(el, "font-size")).toBe("16px");
      expect(computed(el, "line-height")).toBe("24px");
    }
  });

  it("--scale is the one factor that reaches it, through the tokens (§5, §15)", () => {
    // At the root, deliberately: tokens substitute var(--scale) where they are DECLARED
    // (:root), so global zoom is a root-level knob and a nested --scale re-prices nothing —
    // the substitution-at-declaration behaviour every re-declaring axis block exists to
    // work around. If `scale` ever becomes a Theme prop (§5 defers it), it will need its
    // own re-declaration scope, and this law is the one that starts failing.
    document.documentElement.style.setProperty("--scale", "2");
    try {
      expect(computed(render(<Text size="1">zoomed</Text>), "font-size")).toBe("24px");
    } finally {
      document.documentElement.style.removeProperty("--scale");
    }
  });
});

describe("weight takes token names, never numbers (§15)", () => {
  it("Text rests regular, Heading rests bold, and the prop moves both", () => {
    expect(computed(render(<Text>t</Text>), "font-weight")).toBe("400");
    expect(computed(render(<Heading>h</Heading>), "font-weight")).toBe("700");
    expect(computed(render(<Text weight="semibold">t</Text>), "font-weight")).toBe("600");
    expect(computed(render(<Heading weight="medium">h</Heading>), "font-weight")).toBe("500");
  });
});

describe("the family is the Theme's slot (§5, §15)", () => {
  it("Heading reads --font-heading, which chains to the body stack until an app sets it", () => {
    const chained = render(
      <div>
        <Heading>h</Heading>
        <Text>t</Text>
      </div>,
    );
    const h = chained.querySelector(".kui-heading")!;
    const t = chained.querySelector(".kui-text")!;
    expect(computed(h, "font-family")).toBe(computed(t, "font-family"));

    const split = render(
      <div style={{ "--font-heading": "Georgia, serif" } as React.CSSProperties}>
        <Heading>h</Heading>
        <Text>t</Text>
      </div>,
    );
    expect(computed(split.querySelector(".kui-heading")!, "font-family")).toContain("Georgia");
    expect(computed(split.querySelector(".kui-text")!, "font-family")).not.toContain("Georgia");
  });
});

describe("no tone, no emphasis: text reads the foreground context its surface sets (§11)", () => {
  it("takes the --color-text role inside a plain surface", () => {
    const el = render(
      <Card>
        <Text>inside</Text>
      </Card>,
    ).querySelector(".kui-text")!;
    expect(computed(el, "color")).toBe(tokenOn(el, "--color-text"));
  });

  it("follows a tone-forward surface's re-scope with no prop at all", () => {
    const el = render(
      <div className="kui-surface" data-size="3" data-tone="accent" data-emphasis="loud">
        <Text>on solid accent</Text>
      </div>,
    ).querySelector(".kui-text")!;
    expect(computed(el, "color")).toBe(tokenOn(el, "--tone-contrast"));
  });
});

describe("never owns outer spacing, whatever element it renders (§3, §5)", () => {
  it("the render escape names the flow element and the margin stays zero", () => {
    const p = render(<Text render={<p />}>para</Text>);
    expect(p.tagName).toBe("P");
    expect(computed(p, "margin-top")).toBe("0px");
    expect(computed(p, "margin-bottom")).toBe("0px");

    const h1 = render(<Heading render={<h1 />}>title</Heading>);
    expect(h1.tagName).toBe("H1");
    expect(computed(h1, "margin-top")).toBe("0px");
    expect(computed(h1, "margin-bottom")).toBe("0px");
    // The ramp does not move with the element: outline level and visual size are
    // independent axes, and only `size` prices the type.
    expect(computed(h1, "font-size")).toBe("24px");
  });
});
