/**
 * Theme's laws, mounted for real (§5, §6, §12).
 *
 * Nesting is the whole design — a denser toolbar or an airier hero is a nested Theme, not a
 * per-component prop — and nesting is exactly what a string test cannot check, because the
 * question is which declaration an element three levels down actually resolves.
 */
import { describe, expect, it } from "vitest";

import { Box } from "../components/box/box.tsx";
import { APPEARANCES, computed, mounted, render } from "../test/browser.tsx";
import { density, radiusLevels } from "../tokens/config.ts";
import { Theme } from "./theme.tsx";

/** Reads through real properties: a custom property hands back its unresolved token stream. */
const probe = <div id="probe" style={{ height: "var(--control-height-2)", borderRadius: "var(--radius-control-2)" }} />;

describe("the axes render as attributes (§5)", () => {
  it("each prop maps to one data attribute, so the DOM shows the decisions", () => {
    const el = render(<Theme density="compact" radius="large" />);
    expect(el.getAttribute("data-density")).toBe("compact");
    expect(el.getAttribute("data-radius")).toBe("large");
  });

  it("contrast is stamped only when it was chosen, so prefers-contrast can still reach it (§7)", () => {
    // The generated platform-signal guard is `:not([data-contrast="normal"])`. An unconfigured
    // Theme that stamped `normal` anyway would exclude itself from the media query it is
    // supposed to receive — which is exactly what dark mode did until 2026-08-03.
    expect(render(<Theme density="compact" />).hasAttribute("data-contrast")).toBe(false);
    expect(render(<Theme contrast="normal" />).getAttribute("data-contrast")).toBe("normal");
    expect(render(<Theme contrast="high" />).getAttribute("data-contrast")).toBe("high");
  });

  it("render puts the theme on an element that already exists, costing no extra DOM", () => {
    const el = render(
      <Theme density="compact" render={<section className="hero" />}>
        <span />
      </Theme>,
    );
    expect(el.tagName).toBe("SECTION");
    expect(el.className.split(" ").sort()).toEqual(["hero", "kui-theme"]);
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
    const found = mounted(<Theme contrast="high">{probe}</Theme>, {
      theme: { density: "compact", radius: "large" },
      select: "#probe",
    });
    expect(computed(found, "height")).toBe(`${density.compact.height[1]}px`);
    expect(computed(found, "border-top-left-radius")).toBe(
      `${radiusLevels.large.steps[density.compact.radius[1]!]}px`,
    );
  });

  it("a tiered Box directly under a Theme has a slot to read (§2, decided 2026-08-02)", () => {
    // The ancestor-container edge, closed: Theme's element is a query container, so the
    // outermost Box in an app measures its Theme instead of silently sitting at base values.
    const wide = mounted(<Box p={{ initial: "1", md: "6" }} id="probe" />, {
      theme: { style: { width: "900px" } },
    });
    expect(computed(wide, "padding-top")).toBe("24px");

    const narrow = mounted(<Box p={{ initial: "1", md: "6" }} id="probe" />, {
      theme: { style: { width: "300px" } },
    });
    expect(computed(narrow, "padding-top")).toBe("2px");
  });

  it("pinning pointer=coarse renders the coarse geometry (§16)", () => {
    const el = mounted(probe, { theme: { pointer: "coarse" } });
    // Coarse default size 2 anchors at the touch floor by design.
    expect(computed(el, "height")).toBe("44px");
  });

  it("a nested fine escape returns to the fine geometry instead of inheriting coarse", () => {
    const el = mounted(<Theme pointer="fine">{probe}</Theme>, {
      theme: { pointer: "coarse" },
      select: "#probe",
    });
    expect(computed(el, "height")).toBe("32px");
  });

  it("pointer composes with density and radius through the cells (§16)", () => {
    const found = mounted(probe, {
      theme: { pointer: "coarse", density: "compact", radius: "large" },
    });
    expect(computed(found, "height")).toBe("38px");
    // compact-coarse size 2 picks step 3; large prices step 3 at 12px.
    expect(computed(found, "border-top-left-radius")).toBe("12px");
  });

  it("an inner appearance overrides an outer one, so a forced-dark section works", () => {
    const dark = mounted(<Theme appearance="dark">{probe}</Theme>, {
      theme: { appearance: "light" },
      select: "#probe",
    });
    const light = mounted(probe, { theme: { appearance: "light" } });
    expect(computed(dark, "--neutral-1")).not.toBe(
      computed(light, "--neutral-1"),
    );
  });

  it("appearance also tells the UA which world it is painting, both directions (§5)", () => {
    // Scrollbar tracks and a consumer's native <input> are painted by the UA, not by the token
    // layer, so they stayed light inside a dark Theme until color-scheme shipped.
    const dark = mounted(probe, { theme: { appearance: "dark" } });
    expect(computed(dark, "color-scheme")).toBe("dark");
    const nested = mounted(<Theme appearance="light">{probe}</Theme>, {
      theme: { appearance: "dark" },
      select: "#probe",
    });
    expect(computed(nested, "color-scheme")).toBe("light");
  });

  it("and the mirror holds: a light section inside a dark app is not stuck dark (§5)", () => {
    // Light lived only at :root until 2026-08-03, so `light` and `inherit` rendered
    // identically inside a dark tree — an escape that does nothing is not an escape.
    const nested = mounted(<Theme appearance="light">{probe}</Theme>, {
      theme: { appearance: "dark" },
      select: "#probe",
    });
    const plain = mounted(probe, { theme: { appearance: "light" } });
    expect(computed(nested, "--neutral-1")).toBe(
      computed(plain, "--neutral-1"),
    );
  });
});

describe('contrast="high" reaches the tokens, in both appearances (§7)', () => {
  // Asserting the attribute is one indirection short of the thing that can be wrong: light
  // stamped data-contrast="high" correctly for months while resolving no rule at all, because
  // the generated block was :root-scoped and :root only ever matches <html>.
  for (const appearance of APPEARANCES) {
    it(`shifts the value bands under appearance="${appearance}"`, () => {
      const high = mounted(probe, { theme: { appearance, contrast: "high" } });
      const normal = mounted(probe, { theme: { appearance, contrast: "normal" } });
      for (const token of ["--neutral-11", "--accent-11", "--neutral-label"]) {
        expect(computed(high, token)).not.toBe(
          computed(normal, token),
        );
      }
    });
  }
});
