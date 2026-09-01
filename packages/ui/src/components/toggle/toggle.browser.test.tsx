/**
 * Toggle's laws, mounted (§11, §34).
 *
 * A toggle is a Button that holds its state, so almost every law here is an AGREEMENT with a
 * mounted Button rather than a restated value: the box at every index, the quiet rung when
 * off, the medium rung when on, the disabled remap. Restating "pressed is --tone-soft" would
 * go green on a toggle that had quietly grown a fill of its own, which is the drift the
 * membership exists to end.
 *
 * The one law that carries real weight is the RANKING: a pressed toggle must out-paint a
 * hovered unpressed one. Before toggle.css existed they were byte-identical (the segmented
 * control's 2026-08-24 finding and the tree's 2026-08-26 finding, a third time), and every
 * agreement law above stays green over that — which is why the ranking is read off a real
 * pointer and never off a token name.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { APPEARANCES, SIZES, computed, mounted, until } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Flex } from "../flex/flex.tsx";
import { Toggle, ToggleGroup } from "./toggle.tsx";

const alphaOf = (color: string): number => {
  // Three spellings come back (tree's instrument note): rgba for transparent rest,
  // color(srgb … / a) for the resolved soft, oklab(… / a) for the mixed hover.
  const slash = /\/\s*([\d.]+)\s*\)/.exec(color);
  if (slash) return parseFloat(slash[1]!);
  const comma = /^rgba\((?:[^,]+,){3}\s*([\d.]+)\)/.exec(color);
  if (comma) return parseFloat(comma[1]!);
  return 1;
};

describe("a toggle is a button that holds its state (§34)", () => {
  it("announces aria-pressed from the primitive, and the emphasis IS the state", async () => {
    const el = mounted(<Toggle>Bold</Toggle>, { theme: {} });
    expect(el.tagName).toBe("BUTTON");
    expect(el.getAttribute("aria-pressed")).toBe("false");
    expect(el.hasAttribute("data-pressed")).toBe(false);
    expect(el.getAttribute("data-emphasis")).toBe("quiet");
    await userEvent.click(el);
    await until(() => el.getAttribute("aria-pressed") === "true");
    expect(el.hasAttribute("data-pressed")).toBe(true);
    expect(el.getAttribute("data-emphasis")).toBe("medium");
    await userEvent.click(el);
    await until(() => el.getAttribute("aria-pressed") === "false");
    expect(el.getAttribute("data-emphasis")).toBe("quiet");
  });

  it("controlled: the parent owns the state and the emphasis follows it", () => {
    const off = mounted(<Toggle pressed={false}>Bold</Toggle>, { theme: {} });
    const on = mounted(<Toggle pressed>Bold</Toggle>, { theme: {} });
    expect(off.getAttribute("data-emphasis")).toBe("quiet");
    expect(on.getAttribute("data-emphasis")).toBe("medium");
  });

  for (const size of SIZES) {
    it(`size ${size}: the box IS a Button's — height, padding, corner, type`, () => {
      const toggle = mounted(<Toggle size={size}>Bold</Toggle>, { theme: {} });
      const button = mounted(<Button size={size}>Bold</Button>, { theme: {} });
      for (const prop of ["min-height", "padding-left", "border-top-left-radius", "font-size", "column-gap"]) {
        expect(computed(toggle, prop), prop).toBe(computed(button, prop));
      }
    });
  }

  it("iconOnly squares the box exactly as Button's does", () => {
    const toggle = mounted(<Toggle iconOnly aria-label="Bold">B</Toggle>, { theme: {} });
    const button = mounted(<Button iconOnly aria-label="Bold">B</Button>, { theme: {} });
    expect(toggle.getBoundingClientRect().width).toBe(button.getBoundingClientRect().width);
    expect(toggle.getBoundingClientRect().width).toBe(toggle.getBoundingClientRect().height);
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: off is the quiet rung and on is the medium rung — Button's own fills`, () => {
      const off = mounted(<Toggle>Bold</Toggle>, { theme: { appearance } });
      const on = mounted(<Toggle defaultPressed>Bold</Toggle>, { theme: { appearance } });
      const quiet = mounted(<Button emphasis="quiet">Bold</Button>, { theme: { appearance } });
      const medium = mounted(<Button emphasis="medium">Bold</Button>, { theme: { appearance } });
      expect(computed(off, "background-color")).toBe(computed(quiet, "background-color"));
      expect(computed(on, "background-color")).toBe(computed(medium, "background-color"));
      expect(computed(on, "color")).toBe(computed(medium, "color"));
      // The negative control: the two rungs differ, or the agreements above agree on nothing.
      expect(computed(on, "background-color")).not.toBe(computed(off, "background-color"));
    });

    it(`${appearance}: a tone reaches the pressed INK, and the wash stays grey — Button's own 2026-08-23 rule`, () => {
      // No family paints a faded wash any more (the tone x emphasis board): the soft trio reads
      // neutral for every tone, so a destructive toggle that is on is a grey wash with a red
      // word — exactly what a medium destructive Button is, asserted as the agreement.
      const neutral = mounted(<Toggle defaultPressed>Bold</Toggle>, { theme: { appearance } });
      const destructive = mounted(<Toggle defaultPressed tone="destructive">Bold</Toggle>, {
        theme: { appearance },
      });
      const button = mounted(<Button tone="destructive">Bold</Button>, { theme: { appearance } });
      expect(computed(destructive, "color")).not.toBe(computed(neutral, "color"));
      expect(computed(destructive, "color")).toBe(computed(button, "color"));
      expect(computed(destructive, "background-color")).toBe(computed(button, "background-color"));
    });

    it(`${appearance}: PRESSED OUTRANKS HOVERED (§10's clause) — the persistent fill carries more than the transient one`, async () => {
      // Without toggle.css: quiet's hover IS --tone-soft, medium's rest IS --tone-soft, and a
      // hovered Italic paints exactly what a pressed Bold paints. Read off a real pointer on
      // an UNPRESSED sibling, never off a token — the agreement laws above are green either way.
      const root = mounted(
        <Flex gap="4">
          <Toggle defaultPressed>Bold</Toggle>
          <Toggle>Italic</Toggle>
        </Flex>,
        { theme: { appearance }, select: ".kui-box" },
      );
      const [bold, italic] = Array.from(root.querySelectorAll<HTMLElement>(".kui-toggle"));
      const pressedFill = computed(bold!, "background-color");
      await userEvent.hover(italic!);
      await until(() => computed(italic!, "background-color") !== "rgba(0, 0, 0, 0)");
      const hoveredFill = computed(italic!, "background-color");
      await userEvent.unhover(italic!);
      expect(alphaOf(pressedFill), `pressed is invisible: ${pressedFill}`).toBeGreaterThan(0);
      expect(alphaOf(hoveredFill), `hover is invisible: ${hoveredFill}`).toBeGreaterThan(0);
      expect(
        alphaOf(pressedFill),
        `pressed (${pressedFill}) must outrank hovered (${hoveredFill})`,
      ).toBeGreaterThan(alphaOf(hoveredFill));
    });

    it(`${appearance}: a pressed toggle still answers the pointer — the medium rung keeps its full step`, async () => {
      const el = mounted(<Toggle defaultPressed>Bold</Toggle>, { theme: { appearance } });
      const rest = computed(el, "background-color");
      await userEvent.hover(el);
      await until(() => computed(el, "background-color") !== rest);
      expect(computed(el, "background-color")).not.toBe(rest);
      await userEvent.unhover(el);
    });

    it(`${appearance}: disabled takes Button's remap, on and off`, () => {
      const on = mounted(<Toggle defaultPressed disabled>Bold</Toggle>, { theme: { appearance } });
      const medium = mounted(<Button emphasis="medium" disabled>Bold</Button>, { theme: { appearance } });
      const off = mounted(<Toggle disabled>Bold</Toggle>, { theme: { appearance } });
      const quiet = mounted(<Button emphasis="quiet" disabled>Bold</Button>, { theme: { appearance } });
      expect(on.hasAttribute("disabled")).toBe(true);
      expect(computed(on, "background-color")).toBe(computed(medium, "background-color"));
      expect(computed(on, "color")).toBe(computed(medium, "color"));
      expect(computed(off, "background-color")).toBe(computed(quiet, "background-color"));
      expect(computed(on, "cursor")).toBe(computed(medium, "cursor"));
    });
  }

  it("the type refuses what the state already says", () => {
    // Type-level laws (ENGINEERING §1.3). If any line stops erroring, a refusal has been lost.
    // @ts-expect-error — emphasis IS the pressed state; nobody else may set it
    void (<Toggle emphasis="loud">x</Toggle>);
    // @ts-expect-error — a toggle does not await; a busy control is a Button
    void (<Toggle loading>x</Toggle>);
    // @ts-expect-error — no render: the primitive's state drives the element's attributes
    void (<Toggle render={<a />}>x</Toggle>);
    // @ts-expect-error — no margin prop on any control (first non-negotiable)
    void (<Toggle m="4">x</Toggle>);
    // @ts-expect-error — an icon-only toggle must be named
    void (<Toggle iconOnly>B</Toggle>);
    // @ts-expect-error — a group is always multiple; one-of-several is SegmentedControl
    void (<ToggleGroup multiple={false} />);
    expect(true).toBe(true);
  });
});

describe("a toggle group is independent toggles with one keyboard (§34)", () => {
  it("announces a group, is multiple by construction, and reports the pressed set", async () => {
    const values: string[][] = [];
    const root = mounted(
      <ToggleGroup aria-label="Format" onValueChange={(v) => values.push([...v])}>
        <Toggle value="b">Bold</Toggle>
        <Toggle value="i">Italic</Toggle>
      </ToggleGroup>,
      { theme: {} },
    );
    expect(root.getAttribute("role")).toBe("group");
    const [bold, italic] = Array.from(root.querySelectorAll<HTMLElement>(".kui-toggle"));
    await userEvent.click(bold!);
    await until(() => bold!.getAttribute("aria-pressed") === "true");
    await userEvent.click(italic!);
    await until(() => italic!.getAttribute("aria-pressed") === "true");
    // Both stay on: pressing one never released the other.
    expect(bold!.getAttribute("aria-pressed")).toBe("true");
    expect(italic!.getAttribute("aria-pressed")).toBe("true");
    expect(values.at(-1)).toEqual(["b", "i"]);
  });

  it("controlled through the group, and the emphasis follows the value array", () => {
    const root = mounted(
      <ToggleGroup value={["i"]} aria-label="Format">
        <Toggle value="b">Bold</Toggle>
        <Toggle value="i">Italic</Toggle>
      </ToggleGroup>,
      { theme: {} },
    );
    const [bold, italic] = Array.from(root.querySelectorAll<HTMLElement>(".kui-toggle"));
    expect(bold!.getAttribute("data-emphasis")).toBe("quiet");
    expect(italic!.getAttribute("data-emphasis")).toBe("medium");
  });

  it("the arrow keys rove focus without pressing anything — a toggle is not a radio", async () => {
    const root = mounted(
      <ToggleGroup aria-label="Format">
        <Toggle value="b">Bold</Toggle>
        <Toggle value="i">Italic</Toggle>
      </ToggleGroup>,
      { theme: {} },
    );
    const [bold, italic] = Array.from(root.querySelectorAll<HTMLElement>(".kui-toggle"));
    bold!.focus();
    await userEvent.keyboard("{ArrowRight}");
    await until(() => document.activeElement === italic);
    expect(document.activeElement).toBe(italic);
    expect(italic!.getAttribute("aria-pressed")).toBe("false");
  });

  it("render lets the group BE the layout", () => {
    const root = mounted(
      <ToggleGroup aria-label="Format" render={<Flex gap="2" />}>
        <Toggle value="b">Bold</Toggle>
      </ToggleGroup>,
      { theme: {} },
    );
    expect(root.classList.contains("kui-box")).toBe(true);
    expect(computed(root, "display")).toBe("flex");
    expect(root.getAttribute("role")).toBe("group");
  });
});
