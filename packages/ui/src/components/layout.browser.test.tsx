/**
 * The named primitives' laws, mounted for real (§3). Each is sugar over Box — preset display,
 * narrowed types, zero CSS — so what needs proving is small: the preset arrives, the narrowing
 * really narrows (see layout-types.test.tsx for the refusals), and nothing else changed.
 */
import { describe, expect, it } from "vitest";

import { computed, render } from "../test/browser.tsx";
import { Flex } from "./flex/flex.tsx";
import { Grid } from "./grid/grid.tsx";
import { Stack } from "./stack/stack.tsx";

describe("typed sugar presets the display and adds nothing else (§3)", () => {
  it("Flex is a flexbox with the shared prop set live", () => {
    const el = render(<Flex gap="4" direction="row-reverse" p="2" />);
    expect(computed(el, "display")).toBe("flex");
    expect(computed(el, "row-gap")).toBe("12px");
    expect(computed(el, "flex-direction")).toBe("row-reverse");
    expect(computed(el, "padding-top")).toBe("4px");
  });

  it("Stack is a column flexbox by construction", () => {
    const el = render(<Stack gap="2" />);
    expect(computed(el, "display")).toBe("flex");
    expect(computed(el, "flex-direction")).toBe("column");
    expect(computed(el, "row-gap")).toBe("4px");
  });

  it("Grid is a grid with grid's vocabulary live", () => {
    const el = render(<Grid columns="repeat(3, 1fr)" gap="3" />);
    expect(computed(el, "display")).toBe("grid");
    expect(computed(el, "grid-template-columns").split(" ").length).toBe(3);
    expect(computed(el, "column-gap")).toBe("8px");
  });

  it("the inline variants exist for text flow", () => {
    expect(computed(render(<Flex display="inline-flex" />), "display")).toBe("inline-flex");
    expect(computed(render(<Grid display="inline-grid" />), "display")).toBe("inline-grid");
  });

  it("responsive props ride through unchanged, because there is only one mechanism", () => {
    const outer = render(
      <Flex container width="900px">
        <Stack gap={{ initial: "1", md: "6" }} id="child" />
      </Flex>,
    );
    expect(computed(outer.querySelector("#child")!, "row-gap")).toBe("24px");
  });

  it("render and the escape hatches survive the wrapper", () => {
    const el = render(<Stack gap="2" render={<nav className="mine" />} />);
    expect(el.tagName).toBe("NAV");
    expect(el.className.split(" ").sort()).toEqual(["kui-box", "mine"]);
    expect(computed(el, "flex-direction")).toBe("column");
  });
});
