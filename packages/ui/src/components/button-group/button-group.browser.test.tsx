/**
 * ButtonGroup's laws, mounted (§54).
 *
 * Buttons drawn as one box. Every law is either an AGREEMENT with a mounted Button (the members
 * are Buttons, so a restated value would go green on a member that grew its own) or a statement
 * about the SEAMS, which are the only thing button-group.css writes.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { APPEARANCES, SIZES, computed, mounted, until } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { ButtonGroup } from "./button-group.tsx";

const members = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>(":scope > .kui-button")];

describe("one box, several controls (§54)", () => {
  it("announces a group", () => {
    const root = mounted(
      <ButtonGroup aria-label="Range">
        <Button>Day</Button>
        <Button>Week</Button>
      </ButtonGroup>,
      { theme: {}, select: ".kui-button-group" },
    );
    expect(root.getAttribute("role")).toBe("group");
  });

  for (const size of SIZES) {
    it(`size ${size}: the group sizes every member to a Button at that index`, () => {
      const root = mounted(
        <ButtonGroup size={size}>
          <Button>Day</Button>
          <Button>Week</Button>
        </ButtonGroup>,
        { theme: {}, select: ".kui-button-group" },
      );
      const button = mounted(<Button size={size}>Day</Button>, { theme: {} });
      for (const m of members(root)) {
        expect(m.getBoundingClientRect().height).toBeCloseTo(button.getBoundingClientRect().height, 1);
        expect(computed(m, "font-size")).toBe(computed(button, "font-size"));
      }
    });
  }

  it("a member's own size beats the group's", () => {
    const root = mounted(
      <ButtonGroup size="1">
        <Button size="4">Day</Button>
      </ButtonGroup>,
      { theme: {}, select: ".kui-button-group" },
    );
    const four = mounted(<Button size="4">Day</Button>, { theme: {} });
    const one = mounted(<Button size="1">Day</Button>, { theme: {} });
    expect(four.getBoundingClientRect().height, "calibration: the two indexes differ").not.toBeCloseTo(
      one.getBoundingClientRect().height,
      0,
    );
    expect(members(root)[0]!.getBoundingClientRect().height).toBeCloseTo(four.getBoundingClientRect().height, 1);
  });

  it("only the outer corners round; every inner corner is square", () => {
    const root = mounted(
      <ButtonGroup>
        <Button>Day</Button>
        <Button>Week</Button>
        <Button>Month</Button>
      </ButtonGroup>,
      { theme: { radius: "large" }, select: ".kui-button-group" },
    );
    const button = mounted(<Button>Day</Button>, { theme: { radius: "large" } });
    const outer = computed(button, "border-top-left-radius");
    expect(outer, "calibration: a Button at this level has a corner").not.toBe("0px");
    const [first, middle, last] = members(root) as [HTMLElement, HTMLElement, HTMLElement];
    expect(computed(first, "border-top-left-radius")).toBe(outer);
    expect(computed(first, "border-top-right-radius")).toBe("0px");
    expect(computed(middle, "border-top-left-radius")).toBe("0px");
    expect(computed(middle, "border-top-right-radius")).toBe("0px");
    expect(computed(last, "border-top-left-radius")).toBe("0px");
    expect(computed(last, "border-top-right-radius")).toBe(outer);
  });

  it("bordered members meet on ONE line: each overlaps the previous by exactly a border", () => {
    const root = mounted(
      <ButtonGroup>
        <Button emphasis="quiet" bordered>Copy</Button>
        <Button emphasis="quiet" bordered>Paste</Button>
      </ButtonGroup>,
      { theme: {}, select: ".kui-button-group" },
    );
    const [a, b] = members(root) as [HTMLElement, HTMLElement];
    const border = parseFloat(computed(b, "border-left-width"));
    expect(border, "calibration: a bordered Button has a border").toBeGreaterThan(0);
    expect(a.getBoundingClientRect().right - b.getBoundingClientRect().left).toBeCloseTo(border, 1);
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: a fill's divider is a gap of the ground, and only between members`, () => {
      const root = mounted(
        <ButtonGroup>
          <Button>Copy</Button>
          <Button>Paste</Button>
        </ButtonGroup>,
        { theme: { appearance }, select: ".kui-button-group" },
      );
      const ground = mounted(<div style={{ color: "var(--color-surface)" }} />, { theme: { appearance } });
      const [a, b] = members(root) as [HTMLElement, HTMLElement];
      expect(computed(b, "border-left-color")).toBe(computed(ground, "color"));
      expect(computed(a, "border-left-color"), "the first member draws no divider").not.toBe(computed(ground, "color"));
    });
  }

  it("a loud fill's gap is the ground at a quarter, not the whole ground", () => {
    const root = mounted(
      <ButtonGroup>
        <Button emphasis="loud">Copy</Button>
        <Button emphasis="loud">Paste</Button>
      </ButtonGroup>,
      { theme: {}, select: ".kui-button-group" },
    );
    const [, b] = members(root) as [HTMLElement, HTMLElement];
    expect(computed(b, "border-left-color")).toMatch(/\/ 0\.25\)|, 0\.25\)/);
  });

  it("a bordered member's seam is its own edge colour, the same as its outer border", () => {
    const root = mounted(
      <ButtonGroup>
        <Button emphasis="quiet" bordered>Copy</Button>
        <Button emphasis="quiet" bordered>Paste</Button>
      </ButtonGroup>,
      { theme: {}, select: ".kui-button-group" },
    );
    const [, b] = members(root) as [HTMLElement, HTMLElement];
    const edge = computed(b, "border-top-color");
    expect(edge, "calibration: the edge is painted").not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    expect(computed(b, "border-left-color")).toBe(edge);
  });

  it("a focused member's ring is on top of the member after it", async () => {
    const root = mounted(
      <ButtonGroup>
        <Button>Day</Button>
        <Button>Week</Button>
        <Button>Month</Button>
      </ButtonGroup>,
      { theme: {}, select: ".kui-button-group" },
    );
    const [, middle, last] = members(root) as [HTMLElement, HTMLElement, HTMLElement];
    middle.focus({ focusVisible: true } as FocusOptions);
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}{Tab}");
    expect(await until(() => document.activeElement === middle), "calibration: the middle member holds focus").toBe(true);
    expect(computed(middle, "outline-style"), "calibration: the ring is drawn").toBe("solid");
    // Hit-testing ignores outlines, so no point query can see the ring; this reads the paint
    // ORDER instead. A positioned member with a z-index paints after its static neighbours.
    // Measured by screenshot before the fix: the trailing arc sat under the next member.
    expect(computed(middle, "position"), "the focused member is not positioned").not.toBe("static");
    expect(Number(computed(middle, "z-index")), "the focused member is not lifted").toBeGreaterThan(0);
    expect(computed(last, "z-index"), "a member at rest is lifted too").toBe("auto");
  });

  it("no member travels under the pointer — one moving alone tears the seam", async () => {
    const root = mounted(
      <ButtonGroup>
        <Button>Day</Button>
        <Button>Week</Button>
      </ButtonGroup>,
      { theme: {}, select: ".kui-button-group" },
    );
    const lone = mounted(<Button>Day</Button>, { theme: {} });
    await userEvent.hover(lone);
    expect(computed(lone, "translate"), "calibration: a hovered Button rises").not.toMatch(/^(none|0px)$/);
    const first = members(root)[0]!;
    await userEvent.hover(first);
    expect(computed(first, "translate")).toMatch(/^(none|0px( 0px)?)$/);
    await userEvent.unhover(first);
  });
});
