/**
 * Theme's laws, mounted for real (§5, §6, §12).
 *
 * Nesting is the whole design — a denser toolbar or an airier hero is a nested Theme, not a
 * per-component prop — and nesting is exactly what a string test cannot check, because the
 * question is which declaration an element three levels down actually resolves.
 */
import { describe, expect, it } from "vitest";

import { computed, render } from "../test/browser.tsx";
import { density, radiusLevels } from "../tokens/config.ts";
import { Theme } from "./theme.tsx";

/** Reads through real properties: a custom property hands back its unresolved token stream. */
const probe = <div id="probe" style={{ height: "var(--control-height-2)", borderRadius: "var(--radius-control-2)" }} />;

describe("the axes render as attributes (§5)", () => {
  it("each prop maps to one data attribute, so the DOM shows the decisions", () => {
    const el = render(<Theme density="compact" radius="large" />);
    expect(el.getAttribute("data-density")).toBe("compact");
    expect(el.getAttribute("data-radius")).toBe("large");
    expect(el.getAttribute("data-contrast")).toBe("normal");
  });

  it("render puts the theme on an element that already exists, costing no extra DOM", () => {
    const el = render(
      <Theme density="compact" render={<section className="hero" />}>
        <span />
      </Theme>,
    );
    expect(el.tagName).toBe("SECTION");
    expect(el.className).toBe("hero");
    expect(el.getAttribute("data-density")).toBe("compact");
    expect(el.querySelector("span")).not.toBeNull();
  });
});

describe("a nested Theme inherits what it was not given (§5)", () => {
  it("an inner Theme setting one axis keeps the outer value of the others", () => {
    const el = render(
      <Theme density="compact" radius="large">
        <Theme contrast="high" />
      </Theme>,
    );
    const inner = el.firstElementChild!;
    expect(inner.getAttribute("data-density")).toBe("compact");
    expect(inner.getAttribute("data-radius")).toBe("large");
    expect(inner.getAttribute("data-contrast")).toBe("high");
  });

  it("and the inherited pair still reaches the tokens, which is the part that was wrong", () => {
    // The (level x density) cell, exercised through the component rather than through
    // hand-written attributes. Before 2026-08-02 the radius level reached control radii not at
    // all, because `--radius-control-2: var(--radius-2)` had already resolved at :root.
    const el = render(
      <Theme density="compact" radius="large">
        <Theme contrast="high">{probe}</Theme>
      </Theme>,
    );
    const found = el.querySelector("#probe")!;
    expect(computed(found, "height")).toBe(`${density.compact.height[1]}px`);
    expect(computed(found, "border-top-left-radius")).toBe(
      `${radiusLevels.large.steps[density.compact.radius[1]!]}px`,
    );
  });

  it("pinning pointer=coarse renders the coarse geometry (§16)", () => {
    const el = render(<Theme pointer="coarse">{probe}</Theme>);
    // Coarse default size 2 anchors at the touch floor by design.
    expect(computed(el.querySelector("#probe")!, "height")).toBe("44px");
  });

  it("a nested fine escape returns to the fine geometry instead of inheriting coarse", () => {
    const el = render(
      <Theme pointer="coarse">
        <Theme pointer="fine">{probe}</Theme>
      </Theme>,
    );
    expect(computed(el.querySelector("#probe")!, "height")).toBe("32px");
  });

  it("pointer composes with density and radius through the cells (§16)", () => {
    const el = render(
      <Theme pointer="coarse" density="compact" radius="large">
        {probe}
      </Theme>,
    );
    const found = el.querySelector("#probe")!;
    expect(computed(found, "height")).toBe("38px");
    // compact-coarse size 2 picks step 3; large prices step 3 at 12px.
    expect(computed(found, "border-top-left-radius")).toBe("12px");
  });

  it("an inner appearance overrides an outer one, so a forced-dark section works", () => {
    const dark = render(
      <Theme appearance="light">
        <Theme appearance="dark">{probe}</Theme>
      </Theme>,
    );
    const light = render(<Theme appearance="light">{probe}</Theme>);
    expect(computed(dark.querySelector("#probe")!, "--neutral-1")).not.toBe(
      computed(light.querySelector("#probe")!, "--neutral-1"),
    );
  });
});
