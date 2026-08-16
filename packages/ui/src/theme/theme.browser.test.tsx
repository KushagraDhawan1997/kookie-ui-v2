/**
 * Theme's laws, mounted for real (§5, §6, §12).
 *
 * Nesting is the whole design — a denser toolbar or an airier hero is a nested Theme, not a
 * per-component prop — and nesting is exactly what a string test cannot check, because the
 * question is which declaration an element three levels down actually resolves.
 */
import { describe, expect, it } from "vitest";

import { Box } from "../components/box/box.tsx";
import { Card } from "../components/card/card.tsx";
import { Checkbox } from "../components/checkbox/checkbox.tsx";
import { TextField } from "../components/text-field/text-field.tsx";
import { APPEARANCES, computed, mounted, render } from "../test/browser.tsx";
import { density, radiusLevels } from "../tokens/config.ts";
import { DEPTHS, Theme, themeAxes, themeDefaults } from "./theme.tsx";

/** Reads through real properties: a custom property hands back its unresolved token stream. */
const probe = <div id="probe" style={{ height: "var(--control-height-2)", borderRadius: "var(--radius-control-2)" }} />;

describe("the axes render as attributes (§5)", () => {
  it("each prop maps to one data attribute, so the DOM shows the decisions", () => {
    const el = render(<Theme density="compact" radius="large" />);
    expect(el.getAttribute("data-density")).toBe("compact");
    expect(el.getAttribute("data-radius")).toBe("large");
  });

  // Both halves of the look axis, each on its own attribute (split 2026-08-10). Looped rather
  // than written twice: the two are one mechanism asked of two family groups, and a law that
  // covered only `surfaceLook` would have let `controlLook` ship un-stamped.
  const LOOK_AXES = [
    { prop: "surfaceLook", attr: "data-surface-look" },
    { prop: "controlLook", attr: "data-control-look" },
  ] as const;

  for (const { prop, attr } of LOOK_AXES) {
    it(`${prop} stamps its default and a nested Theme escapes by declaration (§19)`, () => {
      // Always stamped — unlike contrast there is no platform signal to leave room for, and
      // the outlined scope must exist for a nested outlined Theme to escape a filled ancestor.
      expect(render(<Theme />).getAttribute(attr)).toBe("outlined");
      const outer = render(
        <Theme {...{ [prop]: "filled" }}>
          <Theme density="compact" />
        </Theme>,
      );
      expect(outer.getAttribute(attr)).toBe("filled");
      const inner = outer.querySelector(".kui-theme")!;
      expect(inner.getAttribute(attr)).toBe("filled");
      const escaped = render(
        <Theme {...{ [prop]: "filled" }}>
          <Theme {...{ [prop]: "outlined" }} />
        </Theme>,
      ).querySelector(".kui-theme")!;
      expect(escaped.getAttribute(attr)).toBe("outlined");
    });
  }

  it("the two look halves are independent — a plain card can hold filled controls (§19)", () => {
    // THE law the 2026-08-10 split exists for. Under one axis this cell was unreachable: a
    // white card holding grey filled inputs — the most ordinary form on the web — because
    // `filled` moved the surface and the field together, one neutral step apart.
    //
    // Read as computed paint on real components, not as attributes: the split is only real if
    // the emitted scopes declare disjoint families, and an attribute law would pass on a
    // stylesheet where one block still wrote both.
    const at = (surfaceLook: "outlined" | "filled", controlLook: "outlined" | "filled") => {
      const el = render(
        <Theme surfaceLook={surfaceLook} controlLook={controlLook}>
          <Card>
            <TextField />
          </Card>
        </Theme>,
      );
      return {
        card: computed(el.querySelector(".kui-surface")!, "background-color"),
        field: computed(el.querySelector(".kui-field")!, "background-color"),
      };
    };
    const plain = at("outlined", "outlined");
    const split = at("outlined", "filled");
    const both = at("filled", "filled");

    expect(split.card, "the control half dressed the card").toBe(plain.card);
    expect(split.field, "the control half left the field at rest").not.toBe(plain.field);
    expect(both.card, "the surface half did not reach the card").not.toBe(plain.card);
    // And the cell the whole thing is for: a card that stayed put while its field filled.
    expect(split.field, "a filled field on a plain card is the same colour as the card").not.toBe(
      split.card,
    );
  });

  describe("a filled component's edge answers contrast=high (§7, §19)", () => {
    // THE law for the reachability guarantee, and it is deliberately an OUTCOME law mounted in
    // a browser rather than a check on which step the config picked.
    //
    // The first version of this guarantee was checked by asserting the chosen edge step was a
    // member of `contrastHighBands.border`. That law passed and the guarantee was false:
    // the band indexes the LADDER (0-based) while token names are 1-based, so
    // contrastHighBands.border = [5, 6, 7] emits as --neutral-6/7/8 and the --neutral-5 edges
    // picked for the surface and field families were never re-declared under high contrast at
    // all. The law compared 1-indexed names to 0-indexed positions and agreed with the bug —
    // the exact defect class the 2026-08-06 look audit was about, committed while fixing it.
    //
    // Reading the computed edge off a real component in both contrast states cannot be fooled
    // that way: it does not care whether the answer arrives by band membership, by the
    // stand-down arm, or by something not invented yet.
    const CASES = [
      { name: "surface", ui: <Card>Body</Card>, select: ".kui-surface" },
      { name: "field", ui: <TextField />, select: ".kui-field" },
      { name: "mark", ui: <Checkbox />, select: ".kui-checkbox" },
    ] as const;

    for (const appearance of APPEARANCES) {
      for (const { name, ui, select } of CASES) {
        it(`${appearance}/${name}: the edge moves when high contrast is asked for`, () => {
          const edge = (contrast: "normal" | "high") =>
            computed(
              mounted(ui, {
                // Both halves: the three cases span both family groups, and the stand-down
                // this law is about is written once for every look role.
                theme: { surfaceLook: "filled", controlLook: "filled", appearance, contrast },
                select,
              }),
              "border-top-color",
            );
          const normal = edge("normal");
          const high = edge("high");
          expect(normal, "a filled edge that is not painted cannot be strengthened").not.toBe(
            "rgba(0, 0, 0, 0)",
          );
          expect(
            high,
            `${name}'s filled edge is inert under contrast="high" — the escape does nothing here`,
          ).not.toBe(normal);
        });
      }
    }
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

describe("the axis table is the one home, and the defaults live inside it (§5, §12, 2026-08-16)", () => {
  // `themeAxes` and `themeDefaults` are two shapes describing one set of facts, and the way
  // that pair rots is a default drifting outside its own axis's list — reachable by nothing,
  // failing nowhere, because every law that walks the axis walks the LIST and every law that
  // mounts a Theme takes the DEFAULT. Asserted in both directions so neither table can grow a
  // key the other lacks.
  it("every axis has a default, every default is a member, and neither table has a spare key", () => {
    expect(Object.keys(themeAxes).sort()).toEqual(Object.keys(themeDefaults).sort());
    for (const [axis, values] of Object.entries(themeAxes)) {
      const value = themeDefaults[axis as keyof typeof themeDefaults];
      expect(values as readonly string[], `${axis}: the default is not one of its own values`).toContain(value);
      // A one-value axis is not an axis; a zero-value one is a typo that types cannot see.
      expect((values as readonly string[]).length, `${axis} has fewer than two values`).toBeGreaterThan(1);
      expect(new Set(values as readonly string[]).size, `${axis} lists a value twice`).toBe(
        (values as readonly string[]).length,
      );
    }
  });

  it("DEPTHS IS themeAxes.depth — the same array, not a second list that agrees", () => {
    // Eight law files import DEPTHS by name, so it survives as an export. What must not
    // survive is it becoming a copy: two lists that agree today are the exact shape this whole
    // change deleted. Identity, not equality — `toEqual` would pass on a duplicate.
    expect(DEPTHS).toBe(themeAxes.depth);
  });

  it("a stamped axis writes its own value, and the two non-values stamp nothing", () => {
    // Narrow on purpose. The first version of this law looped every axis asserting the
    // attribute came back equal, which CANNOT FAIL — `data-depth` is written verbatim, so a
    // value nothing implements stamps itself just as happily as one that does. It passed a
    // sabotage that added a third depth rung, which is the whole class of bug the table
    // exists to catch. Whether a value is IMPLEMENTED is a question about the emitted
    // stylesheet, so it moved to a node law in system/recipes.test.ts where the sheets can be
    // read; what is left here is the one thing a mount can actually settle: the two values
    // that are instructions rather than values must stamp NOTHING, and `contrast` must stay
    // unstamped until someone chooses it (the `prefers-contrast` guard depends on it).
    expect(render(<Theme appearance="inherit">x</Theme>).getAttribute("data-appearance")).toBeNull();
    expect(render(<Theme>x</Theme>).getAttribute("data-contrast")).toBeNull();
    expect(render(<Theme contrast="normal">x</Theme>).getAttribute("data-contrast")).toBe("normal");
    // `auto` is the pointer axis's own instruction and DOES stamp, because the media query
    // it defers to is written against that attribute — the asymmetry with `inherit` is real
    // and worth pinning, since making them agree would break one of them.
    expect(render(<Theme pointer="auto">x</Theme>).getAttribute("data-pointer")).toBe("auto");
  });
});
