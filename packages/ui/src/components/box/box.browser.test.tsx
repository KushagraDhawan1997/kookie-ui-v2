/**
 * Box's laws, mounted for real (§2, §3).
 *
 * The stylesheet already had browser laws; the component did not, so the whole React half of
 * the mechanism — prop to custom property, token index to `var(--space-N)`, tier key to tier
 * var — was asserted nowhere. Everything here goes end to end: a prop goes in and a computed
 * pixel value comes out.
 */
import { describe, expect, it } from "vitest";

import { computed, render } from "../../test/browser.tsx";
import { Box } from "./box.tsx";

describe("a prop becomes a rendered value (§2)", () => {
  it("a bare index resolves through the space palette", () => {
    expect(computed(render(<Box p="4" />), "padding-top")).toBe("12px");
  });

  it("zero means zero, not a token that does not exist", () => {
    // `p={0}` used to resolve to `var(--space-0)` — the palette starts at 1 — and an unset
    // custom property falls back to the property's initial value, so this happened to look
    // right for padding and would not have for anything with a non-zero initial value.
    expect(computed(render(<Box p={0} />), "padding-top")).toBe("0px");
  });

  it("a raw value rides the same prop, which is what utility classes could never do", () => {
    expect(computed(render(<Box p="13px" />), "padding-top")).toBe("13px");
  });

  it("the more specific prop wins its longhand and leaves the others to the general one", () => {
    const el = render(<Box p="4" pt="6" />);
    expect(computed(el, "padding-top")).toBe("24px");
    expect(computed(el, "padding-bottom")).toBe("12px");
  });

  it("is a block by default, or nothing else about it would work", () => {
    // An inline box ignores width and height and cannot be a query container, so the whole
    // responsive mechanism silently does not fire (2026-08-02).
    expect(computed(render(<Box />), "display")).toBe("block");
  });
});

describe("responsive objects arbitrate by container (§2)", () => {
  it("a narrow slot keeps the base value", () => {
    const outer = render(
      <Box width="200px">
        <Box p={{ initial: "1", md: "6" }} id="child" />
      </Box>,
    );
    expect(computed(outer.querySelector("#child")!, "padding-top")).toBe("2px");
  });

  it("a wide slot takes the tier value", () => {
    const outer = render(
      <Box width="900px">
        <Box p={{ initial: "1", md: "6" }} id="child" />
      </Box>,
    );
    expect(computed(outer.querySelector("#child")!, "padding-top")).toBe("24px");
  });

  it("a structural prop switches layout on the same pipe", () => {
    const outer = render(
      <Box width="900px">
        <Box display={{ initial: "flex", md: "grid" }} id="child" />
      </Box>,
    );
    expect(computed(outer.querySelector("#child")!, "display")).toBe("grid");
  });
});

describe("the boundary between props and the DOM (§3)", () => {
  it("style props do not leak out as attributes", () => {
    const el = render(<Box p="4" gap="2" direction="column" id="probe" />);
    for (const leaked of ["p", "gap", "direction"]) expect(el.getAttribute(leaked)).toBeNull();
    expect(el.id).toBe("probe");
  });

  it("consumer style merges last, because an escape that loses is not an escape", () => {
    expect(computed(render(<Box p="4" style={{ paddingTop: "99px" }} />), "padding-top")).toBe(
      "99px",
    );
  });

  it("render targets an element you already have instead of adding a wrapper", () => {
    const el = render(<Box p="4" render={<section className="mine" />} />);
    expect(el.tagName).toBe("SECTION");
    expect(el.className.split(" ").sort()).toEqual(["kui-box", "mine"]);
    expect(computed(el, "padding-top")).toBe("12px");
  });

  it("Box does not paint: shadow is not a prop — layout components stay layout (§3)", () => {
    // The palette is reached through `style` (the honest escape) or the Theme world, never
    // through a Box prop; the prop shipped for a day and died as a taxonomy leak.
    // @ts-expect-error — no shadow prop on a layout component
    void (<Box shadow="2" />);
    expect(computed(render(<Box style={{ boxShadow: "var(--shadow-1)" }} />), "box-shadow")).toContain("inset");
  });
});

describe("the two props that shipped dead (§2, requirement 3)", () => {
  // Both were emitted as shorthands in front of their own longhands, so both were no-ops in
  // every browser. Neither had ever been mounted — the type-level tests covered them, which is
  // exactly the kind of coverage that cannot see a cascade defect.
  it("inset stretches an absolute box instead of shrink-wrapping it", () => {
    const parent = render(
      <Box position="relative" width="300px" height="200px">
        <Box position="absolute" inset="0" id="probe" />
      </Box>,
    );
    const box = parent.querySelector("#probe")!;
    expect(computed(box, "top")).toBe("0px");
    expect(computed(box, "left")).toBe("0px");
    expect(computed(box, "width")).toBe("300px");
    expect(computed(box, "height")).toBe("200px");
  });

  it("a longhand still wins over inset, which is what precedence is for", () => {
    const parent = render(
      <Box position="relative" width="300px" height="200px">
        <Box position="absolute" inset="0" top="50px" id="probe" />
      </Box>,
    );
    expect(computed(parent.querySelector("#probe")!, "top")).toBe("50px");
    expect(computed(parent.querySelector("#probe")!, "bottom")).toBe("0px");
  });

  it("overflow clips on both axes", () => {
    const el = render(<Box overflow="hidden" maxHeight="200px" />);
    expect(computed(el, "overflow-x")).toBe("hidden");
    expect(computed(el, "overflow-y")).toBe("hidden");
  });

  it("and an axis prop still overrides it", () => {
    const el = render(<Box overflow="hidden" overflowY="scroll" />);
    expect(computed(el, "overflow-x")).toBe("hidden");
    expect(computed(el, "overflow-y")).toBe("scroll");
  });
});
