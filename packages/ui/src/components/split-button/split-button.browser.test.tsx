/**
 * SplitButton's laws, mounted (§53).
 *
 * Two Buttons drawn as one box. Every law is either an AGREEMENT with a mounted Button (the
 * halves are Buttons, so a restated value would go green on a half that grew its own) or a
 * statement about the SEAM, which is the only thing split-button.css writes.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { APPEARANCES, SIZES, computed, mounted, until, within } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { MenuItem } from "../menu/menu.tsx";
import { SplitButton } from "./split-button.tsx";

const menu = (
  <>
    <MenuItem>Squash and merge</MenuItem>
    <MenuItem>Rebase and merge</MenuItem>
  </>
);

const halves = (root: HTMLElement) => ({
  action: within(root, ".kui-split-button-action"),
  chevron: within(root, ".kui-split-button-menu"),
});

describe("one box, two controls (§53)", () => {
  for (const size of SIZES) {
    it(`size ${size}: both halves stand exactly as tall as a Button at the same index`, () => {
      const root = mounted(
        <SplitButton size={size} menuLabel="More merge options" menu={menu}>
          Merge
        </SplitButton>,
        { theme: {}, select: ".kui-split-button" },
      );
      const button = mounted(<Button size={size}>Merge</Button>, { theme: {} });
      const { action, chevron } = halves(root);
      const h = button.getBoundingClientRect().height;
      expect(action.getBoundingClientRect().height, "the action half").toBeCloseTo(h, 1);
      expect(chevron.getBoundingClientRect().height, "the chevron half").toBeCloseTo(h, 1);
      expect(computed(action, "font-size")).toBe(computed(button, "font-size"));
    });
  }

  it("the inner corners are square and the outer corners are a Button's", () => {
    const root = mounted(
      <SplitButton menuLabel="More" menu={menu}>
        Merge
      </SplitButton>,
      { theme: { radius: "large" }, select: ".kui-split-button" },
    );
    const button = mounted(<Button>Merge</Button>, { theme: { radius: "large" } });
    const outer = computed(button, "border-top-left-radius");
    expect(outer, "calibration: a Button at this level has a corner").not.toBe("0px");
    const { action, chevron } = halves(root);
    expect(computed(action, "border-top-left-radius")).toBe(outer);
    expect(computed(action, "border-top-right-radius"), "the action's seam side").toBe("0px");
    expect(computed(chevron, "border-top-left-radius"), "the chevron's seam side").toBe("0px");
    expect(computed(chevron, "border-top-right-radius")).toBe(outer);
    // Touching: no gap at the seam.
    expect(chevron.getBoundingClientRect().left).toBeCloseTo(action.getBoundingClientRect().right, 1);
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: tone and emphasis reach both halves, as a Button's own fill`, () => {
      const root = mounted(
        <SplitButton emphasis="loud" tone="destructive" menuLabel="More" menu={menu}>
          Delete
        </SplitButton>,
        { theme: { appearance }, select: ".kui-split-button" },
      );
      const button = mounted(
        <Button emphasis="loud" tone="destructive">
          Delete
        </Button>,
        { theme: { appearance } },
      );
      const { action, chevron } = halves(root);
      expect(computed(action, "background-color")).toBe(computed(button, "background-color"));
      expect(computed(chevron, "background-color")).toBe(computed(button, "background-color"));
      expect(computed(chevron, "color")).toBe(computed(button, "color"));
    });
  }

  it("the divider is the label's ink, faint — not the Button's own border colour", () => {
    const root = mounted(
      <SplitButton emphasis="loud" menuLabel="More" menu={menu}>
        Merge
      </SplitButton>,
      { theme: {}, select: ".kui-split-button" },
    );
    const { chevron } = halves(root);
    expect(computed(chevron, "border-left-color")).not.toBe(computed(chevron, "border-right-color"));
    expect(computed(chevron, "border-left-color")).toMatch(/\/ 0\.3\)|, 0\.3\)/);
  });

  it("disabled reaches both halves", () => {
    const root = mounted(
      <SplitButton disabled menuLabel="More" menu={menu}>
        Merge
      </SplitButton>,
      { theme: {}, select: ".kui-split-button" },
    );
    const { action, chevron } = halves(root);
    expect((action as HTMLButtonElement).disabled || action.hasAttribute("data-disabled")).toBe(true);
    expect((chevron as HTMLButtonElement).disabled || chevron.hasAttribute("data-disabled")).toBe(true);
  });
});

describe("the halves press as two (§53)", () => {
  it("the chevron is named, opens the menu, and the action does not", async () => {
    let merged = 0;
    const root = mounted(
      <SplitButton menuLabel="More merge options" menu={menu} onClick={() => merged++}>
        Merge
      </SplitButton>,
      { theme: {}, select: ".kui-split-button" },
    );
    const { action, chevron } = halves(root);
    expect(chevron.getAttribute("aria-label")).toBe("More merge options");
    await userEvent.click(action);
    expect(merged, "the action half did not run the action").toBe(1);
    expect(document.querySelector(".kui-menu-popup"), "the action half opened the menu").toBeNull();
    await userEvent.click(chevron);
    expect(await until(() => !!document.querySelector(".kui-menu-popup")), "the chevron opened nothing").toBe(true);
    expect(merged, "the chevron ran the action").toBe(1);
    await userEvent.keyboard("{Escape}");
  });
});
