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
    expect(el.className.split(" ").sort()).toEqual(["kk-box", "mine"]);
    expect(computed(el, "padding-top")).toBe("12px");
  });
});
