/**
 * `useSurface`, mounted (2026-11-11). A component of the caller's own takes what Card, Chip and
 * Button take: the material where it sits over content, a fill with text that reads on it, and
 * the scope that keeps what is inside from asking for glass twice.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";

import { colorOn, computed, mounted, within } from "../test/browser.tsx";
import { Button } from "../components/button/button.tsx";
import { Card } from "../components/card/card.tsx";
import { Text } from "../components/text/text.tsx";
import { useSurface, type UseSurfaceOptions } from "./use-surface.tsx";

function Mark({ children, ...options }: UseSurfaceOptions & { children?: React.ReactNode }) {
  const surface = useSurface(options);
  return (
    <div data-mark {...surface.props}>
      {surface.scope(children)}
    </div>
  );
}

const mark = (ui: React.ReactElement, theme = {}) => mounted(ui, { theme, select: "[data-mark]" });

describe("an element of your own takes the system's fill and its text (2026-11-11)", () => {
  it("loud paints the tone's solid fill, and the text inside takes the contrast colour", () => {
    const el = mark(
      <Mark tone="accent" emphasis="loud">
        <Text data-words>12</Text>
      </Mark>,
    );
    const button = mounted(<Button tone="accent" emphasis="loud">x</Button>, { theme: {} });
    expect(computed(el, "background-color"), "the fill is not the tone's solid").toBe(computed(button, "background-color"));
    expect(computed(within(el, "[data-words]"), "color")).toBe(colorOn(el, "var(--tone-contrast)"));
  });

  it("the three rungs paint three fills, and the defaults are neutral, quiet and the size around it", () => {
    const fills = (["loud", "medium", "quiet"] as const).map((emphasis) =>
      computed(mark(<Mark tone="accent" emphasis={emphasis} />), "background-color"),
    );
    expect(new Set(fills).size, "two rungs paint the same fill").toBe(3);
    const plain = mark(<Mark />, { size: "3" });
    expect(plain.getAttribute("data-tone")).toBe("neutral");
    expect(plain.getAttribute("data-emphasis")).toBe("quiet");
    expect(plain.getAttribute("data-size")).toBe("3");
  });

  it("the caller's class is joined, and no border is ever stamped: this is not a second Card", () => {
    const el = mark(<Mark className="mine" tone="accent" emphasis="medium" />);
    expect(el.className).toBe("kui-surface mine");
    expect(el.hasAttribute("data-bordered")).toBe(false);
    const card = mounted(<Card>x</Card>, { theme: {} });
    expect(card.hasAttribute("data-bordered"), "vacuity: a Card does stamp its edge").toBe(true);
  });
});

describe("it takes the theme's material where it sits over content (2026-11-11)", () => {
  it("solid by default, glass with `backdrop` under a glass theme, and solid again under a solid one", () => {
    expect(mark(<Mark />, { material: "3" }).hasAttribute("data-material")).toBe(false);
    expect(mark(<Mark backdrop />, { material: "3" }).getAttribute("data-material")).toBe("g3");
    expect(mark(<Mark backdrop />, { material: "9" }).hasAttribute("data-material")).toBe(false);
  });

  // Falsified: with `scope` returning its children bare, the button inside asks for glass again.
  it("what is inside sits ON the glass and never asks for glass a second time", () => {
    const el = mark(
      <Mark backdrop>
        <Button backdrop>Inside</Button>
      </Mark>,
      { material: "3" },
    );
    expect(within(el, ".kui-button").getAttribute("data-material")).toBe("on-glass");
    const bare = mounted(<Button backdrop>Outside</Button>, { theme: { material: "3" } });
    expect(bare.getAttribute("data-material"), "vacuity: outside a surface the same button is glass").toBe("g3");
  });
});

describe("a loud surface on glass keeps a fill its text can stand on (2026-11-11)", () => {
  const alpha = (color: string): number => {
    const parts = color.match(/[\d.]+/g)?.map(Number) ?? [];
    return color.includes("/") || parts.length === 4 ? (parts.at(-1) ?? 1) : 1;
  };

  // Falsified: with the rung's veil alpha removed, the loud fill thins to the pane's alpha.
  it("loud keeps the loud button's alpha on glass, while medium takes the pane's", () => {
    const loud = mark(<Mark tone="accent" emphasis="loud" backdrop />, { material: "3" });
    const medium = mark(<Mark tone="accent" emphasis="medium" backdrop />, { material: "3" });
    const button = mounted(<Button tone="accent" emphasis="loud" backdrop>x</Button>, { theme: { material: "3" } });
    expect(alpha(computed(loud, "background-color"))).toBeCloseTo(alpha(computed(button, "background-color")), 2);
    expect(alpha(computed(medium, "background-color")), "medium did not thin to the pane").toBeLessThan(alpha(computed(loud, "background-color")));
  });

  it("the alpha does not leak to a glass card inside a loud surface", () => {
    const outer = mark(
      <Mark tone="accent" emphasis="loud">
        <Card backdrop data-inner>
          x
        </Card>
      </Mark>,
      { material: "3" },
    );
    const alone = mounted(<Card backdrop>x</Card>, { theme: { material: "3" } });
    const inner = within(outer, "[data-inner]");
    expect(inner.getAttribute("data-material"), "vacuity: the inner card has to be glass").toBe("g3");
    expect(computed(inner, "background-color")).toBe(computed(alone, "background-color"));
  });
});
