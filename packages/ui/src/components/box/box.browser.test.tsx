/**
 * Box's laws, mounted for real (§2, §3).
 *
 * The stylesheet already had browser laws; the component did not, so the whole React half of
 * the mechanism — prop to custom property, token index to `var(--space-N)`, tier key to tier
 * var — was asserted nowhere. Everything here goes end to end: a prop goes in and a computed
 * pixel value comes out.
 */
import { describe, expect, it, vi } from "vitest";

import { computed, render } from "../../test/browser.tsx";
import type { RenderElement } from "../../system/render.ts";
import { Box } from "./box.tsx";
import { Flex } from "../flex/flex.tsx";
import { Grid } from "../grid/grid.tsx";
import { Stack } from "../stack/stack.tsx";

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
      <Box container width="200px">
        <Box p={{ initial: "1", md: "6" }} id="child" />
      </Box>,
    );
    expect(computed(outer.querySelector("#child")!, "padding-top")).toBe("2px");
  });

  it("a wide slot takes the tier value", () => {
    const outer = render(
      <Box container width="900px">
        <Box p={{ initial: "1", md: "6" }} id="child" />
      </Box>,
    );
    expect(computed(outer.querySelector("#child")!, "padding-top")).toBe("24px");
  });

  it("a structural prop switches layout on the same pipe", () => {
    const outer = render(
      <Box container width="900px">
        <Box display={{ initial: "flex", md: "grid" }} id="child" />
      </Box>,
    );
    expect(computed(outer.querySelector("#child")!, "display")).toBe("grid");
  });
});

describe("containment is opt-in — the `container` prop (§2, decided 2026-08-08)", () => {
  it("the prop is the only road to containment, asserted in both directions", () => {
    expect(computed(render(<Box />), "container-type")).toBe("normal");
    expect(computed(render(<Box container />), "container-type")).toBe("inline-size");
  });

  it("the typed sugar passes it through — a Flex, Grid or Stack can be the measured region", () => {
    expect(computed(render(<Flex container />), "container-type")).toBe("inline-size");
    expect(computed(render(<Grid container />), "container-type")).toBe("inline-size");
    expect(computed(render(<Stack container />), "container-type")).toBe("inline-size");
  });

  it("`container` never reaches the DOM as a React unknown-prop — it travels as data-container", () => {
    const el = render(<Box container />);
    expect(el.getAttribute("container")).toBeNull();
    expect(el.hasAttribute("data-container")).toBe(true);
  });

  it("dev builds warn when a container Box collapses, and stay quiet when it cannot (§2)", async () => {
    // The one composition the opt-in cannot save: a container asked to shrink-wrap. The
    // warning is the third layer of the guidance (JSDoc, registry, this) and the only one
    // that fires at the moment it breaks. Falsified by flipping either fixture.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      render(
        <div style={{ display: "flex", width: "600px" }}>
          <Box container>collapses</Box>
        </div>,
      );
      await vi.waitFor(() => {
        expect(warn.mock.calls.some(([msg]) => String(msg).includes("0px wide"))).toBe(true);
      });

      warn.mockClear();
      render(
        <div style={{ display: "flex", width: "600px" }}>
          <Box container flexGrow="1">
            grows
          </Box>
          <Box>plain, hugs fine</Box>
        </div>,
      );
      // Passive effects for the quiet case need a flush too, or this half asserts nothing.
      await new Promise((r) => setTimeout(r, 50));
      expect(warn.mock.calls.some(([msg]) => String(msg).includes("0px wide"))).toBe(false);
    } finally {
      warn.mockRestore();
    }
  });

  it("and it warns when the collapse arrives AFTER mount — content, or a parent turning into a row", async () => {
    // The gap the audit found (2026-08-08): the effect ran once, guarded by hasChildNodes()
    // and keyed on a boolean that never changes, so the two ordinary async shapes were
    // silent — an empty container Box that fills from a fetch, and a laid-out one whose
    // parent becomes a flex row later. Both are asserted here because they have DIFFERENT
    // root causes (the child guard, and the one-shot effect) and one fix does not imply
    // the other.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fired = () => warn.mock.calls.some(([m]) => String(m).includes("0px wide"));
    try {
      const host = render(
        <div style={{ display: "flex", width: "600px" }}>
          <Box container id="late" />
        </div>,
      );
      await new Promise((r) => setTimeout(r, 30));
      expect(fired(), "an EMPTY container Box must not warn — it has not collapsed").toBe(false);
      host.querySelector("#late")!.append(document.createTextNode("arrived from a fetch"));
      await vi.waitFor(() => expect(fired()).toBe(true));

      warn.mockClear();
      const second = render(
        <div style={{ width: "600px" }}>
          <Box container id="row">
            content that sized it
          </Box>
        </div>,
      );
      await new Promise((r) => setTimeout(r, 30));
      expect(fired(), "a block-context container Box is fine — it is handed a width").toBe(false);
      (second as HTMLElement).style.display = "flex";
      await vi.waitFor(() => expect(fired()).toBe(true));
    } finally {
      warn.mockRestore();
    }
  });

  it("and it stays quiet for a Box that is not laid out at all — a hidden panel is not a collapse", async () => {
    // The false-positive half (audit 2026-08-08): the old guard read the element's own
    // `display`, and CSS display does not inherit — an element under a display:none
    // ancestor still computes `block`, so a closed accordion, an inactive tab panel or a
    // mounted-but-hidden dialog emitted one bogus warning per container Box, telling the
    // developer to "fix" a Box that is correct.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      render(
        <div style={{ display: "none" }}>
          <Box container>hidden, not collapsed</Box>
        </div>,
      );
      render(
        <div hidden>
          <Box container>also hidden</Box>
        </div>,
      );
      await new Promise((r) => setTimeout(r, 50));
      expect(
        warn.mock.calls.some(([m]) => String(m).includes("0px wide")),
        "an unrendered Box was reported as collapsed",
      ).toBe(false);
    } finally {
      warn.mockRestore();
    }
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

  it("render survives the RSC boundary, where the element arrives as a lazy node (§5)", () => {
    // The shape React's Flight deserializer actually hands a client component when a SERVER
    // component creates the element and passes it as a prop: `$$typeof: react.lazy`, no
    // `props`, `isValidElement` false. Built here rather than mocked loosely, because the
    // whole defect was that `render.props` is undefined on precisely this object — reading
    // any other shape would assert nothing.
    //
    // This is DEV-ONLY in React (facebook/react#32392): the production Flight build sends a
    // real element. So `next build` was clean while `next dev` could not render one route,
    // which is exactly how it shipped — and why the law matters more than the fix. The
    // scenario is unreachable from a browser test otherwise; there is no RSC boundary here.
    const inner = <section className="mine" />;
    const lazy = {
      $$typeof: Symbol.for("react.lazy"),
      _payload: inner,
      _init: (payload: unknown) => payload,
    } as unknown as RenderElement;

    const el = render(<Box p="4" render={lazy} />);
    // Pre-fix this threw `Cannot read properties of undefined (reading 'ref')` and nothing
    // below ran. Post-fix the escape behaves exactly as it does with a plain element — which
    // is the real claim: the boundary is invisible to the API.
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
