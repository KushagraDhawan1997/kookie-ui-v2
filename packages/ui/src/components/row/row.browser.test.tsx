/**
 * Row's laws, mounted (§21).
 *
 * The component's whole claim is that it is the SAME THING as a menu row and a nav row, so
 * most of these are comparisons against those two rather than restatements of what a row looks
 * like. A restated assertion would go green on a Row that had quietly grown its own geometry,
 * which is the drift the family-first decision was made to prevent.
 *
 * The pair that carries the real weight is the two cursors: an undriven row lights under the
 * pointer, and a driven one does not. Both directions matter and neither is obvious — the
 * first is the defect that made this component's promotion necessary, and the second is the
 * bug the family's stand-down was written for in the first place.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import {
  APPEARANCES,
  POINTERS,
  SIZES,
  computed,
  mounted,
  settle,
  within,
} from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Kbd } from "../kbd/kbd.tsx";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "../menu/menu.tsx";
import { Stack } from "../stack/stack.tsx";
import { Row } from "./row.tsx";

/**
 * A menu, open and SETTLED, with its first row extracted — the family member this one is
 * measured against.
 *
 * Two instrument facts, both learned the hard way in the menu suite and both re-learned here
 * on the first run. Mounts accumulate within one test, so "the popup" is the LAST one, not the
 * first — reading the first made four of these laws compare a row against a row from a
 * previous mount. And a panel FLIES: the entry poses it at the trigger's silhouette and grows
 * it, so a box read on the mount frame is a box mid-flight, which is why size 3 first measured
 * 89px against the row's real 34.
 */
function menuRow(size: (typeof SIZES)[number] = "2"): HTMLElement {
  mounted(
    <Menu defaultOpen size={size}>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem>Duplicate</MenuItem>
        <MenuItem>Rename</MenuItem>
      </MenuContent>
    </Menu>,
    { theme: {} },
  );
  const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the popup never mounted — the law below would assert nothing");
  settle(popup);
  const row = popup.querySelector<HTMLElement>(".kui-menu-item");
  if (!row) throw new Error("no menu row mounted");
  return row;
}

describe("a Row IS a row — the family, not a lookalike (§21)", () => {
  for (const size of SIZES) {
    it(`size ${size}: the same box, the same rest, the same corner as a menu row`, () => {
      // Family-first was declared when Menu shipped, on the argument that four separately
      // designed rows in one weight class WILL drift. This is that claim measured on the
      // member that arrived last — and measured on the RENDERED box rather than on the tokens
      // each one reads, because two rows reading one token and rendering two boxes is exactly
      // the failure worth catching.
      const row = mounted(<Row size={size}>Duplicate</Row>, { theme: {} });
      const item = menuRow(size);
      expect(
        row.getBoundingClientRect().height,
        `size ${size}: the standalone row left the family's box`,
      ).toBeCloseTo(item.getBoundingClientRect().height, 1);
      expect(computed(row, "background-color")).toBe(computed(item, "background-color"));
      expect(computed(row, "border-top-left-radius")).toBe(
        computed(item, "border-top-left-radius"),
      );
      expect(computed(row, "font-weight")).toBe(computed(item, "font-weight"));
    });
  }

  for (const pointer of POINTERS) {
    it(`${pointer}: a row stands SHORTER than the button at its index — it left the ladder`, () => {
      // §21's one geometry departure: a button prices its box for standalone pressing, a row
      // is a line in a list.
      //
      // ONE CELL IS AN EQUALITY AND IT IS ASSERTED AS ONE, not skipped — Switch's coarse size-4
      // wrinkle set that rule. At coarse size 1 the row and the button both render 36px, which
      // is the band's own arithmetic rather than a bug: §21 records the coarse rows as
      // 36/40/44/48 against buttons at 36/44/52/60. A law that asserted `<` everywhere would
      // have to be weakened to `<=`, and a `<=` everywhere is a law that no longer notices a row
      // that has climbed back onto the ladder. So the relationship is stated per cell.
      const level = pointer === "coarse" ? ["1"] : [];
      for (const size of SIZES) {
        const row = mounted(<Row size={size}>Duplicate</Row>, { theme: { pointer } });
        const button = mounted(<Button size={size}>Duplicate</Button>, { theme: { pointer } });
        const [r, b] = [row.getBoundingClientRect().height, button.getBoundingClientRect().height];
        if (level.includes(size)) {
          expect(r, `${pointer}/size ${size}: the recorded equality moved`).toBeCloseTo(b, 1);
        } else {
          expect(r, `${pointer}/size ${size}: the row is not under its button`).toBeLessThan(b);
        }
      }
    });
  }

  it("its box is the text LINE plus the designed inset, and nothing else", () => {
    // The derivation stated as an equality rather than a bound: box = line + 2 × rowInset,
    // with the border term already ceded in the padding (the checkbox target's audit lesson).
    // A bound would go green on a row that had quietly gone back to the height ladder.
    for (const size of SIZES) {
      const row = mounted(<Row size={size}>Duplicate</Row>, { theme: {} });
      const line = parseFloat(computed(row, "line-height"));
      const pad =
        parseFloat(computed(row, "padding-top")) + parseFloat(computed(row, "padding-bottom"));
      const border =
        parseFloat(computed(row, "border-top-width")) +
        parseFloat(computed(row, "border-bottom-width"));
      expect(
        row.getBoundingClientRect().height,
        `size ${size}: the row's box is not line + inset`,
      ).toBeCloseTo(line + pad + border, 1);
    }
  });

  it("emphasis is stamped quiet, and tone reaches the row", () => {
    const plain = mounted(<Row>Duplicate</Row>, { theme: {} });
    expect(plain.getAttribute("data-emphasis")).toBe("quiet");
    expect(plain.getAttribute("data-tone")).toBe("neutral");
    const bad = mounted(<Row tone="destructive">Delete</Row>, { theme: {} });
    expect(computed(bad, "color"), "a destructive row reads no differently").not.toBe(
      computed(plain, "color"),
    );
  });
});

describe("the two cursors: what lights a row is decided once per list (§21)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: a row nobody drives answers the POINTER`, async () => {
      // The defect this component's promotion fixes. Before it, every `.kui-row` was returned
      // to its rest fill under the pointer — right for a menu, and dead for every other list.
      // `ShellNavItem` bought its way back with a private `:hover` rule in shell.css, which is
      // the per-member drift §21's open question predicted in writing.
      const row = mounted(<Row>Duplicate</Row>, { theme: { appearance } });
      const rest = computed(row, "background-color");
      await userEvent.hover(row);
      expect(
        computed(row, "background-color"),
        `${appearance}: an undriven row is dead under the pointer`,
      ).not.toBe(rest);
    });
  }

  it("a row somebody DRIVES does not answer the pointer — the two-cursors bug", async () => {
    // The other direction, and the reason the family stands hover down at all: a list that
    // moves a highlight with the arrow keys would otherwise keep a pointer-rested row lit
    // after the keyboard had moved on. Stating `highlighted` at all is what makes the claim,
    // which is why the fixture states it as FALSE — a controlled `false` still means "I am the
    // cursor here", and a spelling that keyed on the value rather than on the question would
    // pass a law that only ever tested `true`.
    const row = mounted(<Row highlighted={false}>Duplicate</Row>, { theme: {} });
    const rest = computed(row, "background-color");
    await userEvent.hover(row);
    expect(
      computed(row, "background-color"),
      "a driven row lit itself under the pointer — two cursors",
    ).toBe(rest);
  });

  it("and being driven lights it — in the same currency hover would have used", () => {
    const lit = mounted(<Row highlighted>Duplicate</Row>, { theme: {} });
    const dark = mounted(<Row highlighted={false}>Duplicate</Row>, { theme: {} });
    expect(computed(lit, "background-color")).not.toBe(computed(dark, "background-color"));
    // One currency, not two: the driven highlight and the pointer's are the same fill, so a
    // palette and a settings list cannot drift apart in what "lit" looks like.
    const hoverable = mounted(<Row>Duplicate</Row>, { theme: {} });
    expect(computed(hoverable, "background-color")).toBe(computed(dark, "background-color"));
  });

  it("no member takes the pointer's light unless it says so — the promotion's blast radius", () => {
    // THE REGRESSION GUARD, REWRITTEN AFTER ITS FIRST SPELLING MEASURED THE WRONG MECHANISM.
    // It hovered a menu row and asserted the fill did not move — and it moved, because Base UI
    // stamps `data-highlighted` on pointer hover too. That is the family working exactly as
    // designed: the ATTRIBUTE is the single source, and the stand-down's job is that the row
    // goes dark again when the keyboard moves the highlight off a pointer-rested row. The old
    // law was asserting a menu row never lights under the pointer, which was never true and
    // never the claim.
    //
    // What the promotion actually risks is the marker leaking onto a member that must not have
    // it, so that is what is read: the marker's presence, on the DOM, across every member the
    // family has. The driven-row law above supplies the other half — an unmarked row IS dark
    // under a resting pointer — so the two together say menus and labels are unchanged.
    const item = menuRow();
    expect(item.hasAttribute("data-hover-lit"), "a menu row took the pointer's light").toBe(false);

    mounted(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuLabel>Actions</MenuLabel>
          <MenuItem>Duplicate</MenuItem>
        </MenuContent>
      </Menu>,
      { theme: {} },
    );
    const labels = document.querySelectorAll<HTMLElement>(".kui-menu-label");
    const label = labels[labels.length - 1];
    if (!label) throw new Error("no label mounted — this law would assert nothing");
    // A label is a `.kui-row` that is not a control at all, and it is the case that decides
    // which way the marker runs: gating the stand-down instead would have handed hover to every
    // row that never asked, headings included.
    expect(label.hasAttribute("data-hover-lit"), "a label took the pointer's light").toBe(false);

    // And the member that DOES claim it, claims it — otherwise this law passes on a marker
    // nothing ever stamps.
    expect(
      mounted(<Row>Duplicate</Row>, { theme: {} }).hasAttribute("data-hover-lit"),
      "the marker is stamped by nobody, so the assertions above are vacuous",
    ).toBe(true);
  });
});

describe("current is location, and it composes with the pointer (§21, §26)", () => {
  it("rests painted, in a different currency, and still has somewhere to go", async () => {
    // `ShellNavItem`'s law one member over, and its own sabotage lesson is kept: "different
    // from the hover colour" is also true of transparent, so the first assertion is that
    // current is a state AT ALL.
    const host = mounted(
      <Stack gap="0">
        <Row current>Overview</Row>
        <Row>Settings</Row>
      </Stack>,
      { theme: {} },
    );
    const currentRow = within(host, "[aria-current]");
    const plain = within(host, ".kui-row:not([aria-current])");
    const currentRest = computed(currentRow, "background-color");
    expect(currentRest, "the current row rests transparent").not.toContain("rgba(0, 0, 0, 0)");
    expect(currentRest).not.toBe(computed(plain, "background-color"));
    await userEvent.hover(currentRow);
    expect(
      computed(currentRow, "background-color"),
      "hovering the current row has nowhere to go",
    ).not.toBe(currentRest);
  });

  it("a stated tone survives being current — the two compose instead of fighting", () => {
    // `current` picks accent when nobody asked for a family, and never overwrites one that was
    // asked for: the delete row you are standing on is still the delete row. What says
    // "current" in either family is the emphasis STEP, which is why this composes at all —
    // a spelling that stamped a colour would have had to choose between the two.
    const bad = mounted(<Row tone="destructive">Delete</Row>, { theme: {} });
    const badCurrent = mounted(<Row tone="destructive" current>Delete</Row>, { theme: {} });
    expect(badCurrent.getAttribute("data-tone"), "current overwrote a stated tone").toBe(
      "destructive",
    );
    expect(mounted(<Row current>Overview</Row>, { theme: {} }).getAttribute("data-tone")).toBe(
      "accent",
    );
    // And it is a real state in that family rather than a stamp nothing paints.
    expect(computed(badCurrent, "background-color")).not.toBe(computed(bad, "background-color"));
  });

  it("it is ANNOUNCED, not just painted", () => {
    const row = mounted(<Row current>Overview</Row>, { theme: {} });
    expect(row.getAttribute("aria-current")).toBe("true");
    expect(mounted(<Row>Overview</Row>, { theme: {} }).getAttribute("aria-current")).toBeNull();
  });
});

describe("the row's anatomy and its element (§21, ENGINEERING §3)", () => {
  it("a trailing slot goes to the far edge; a leading one keeps the reserved gutter", () => {
    const row = mounted(
      <Row leading={<span>·</span>} trailing={<Kbd>⌘D</Kbd>}>
        Duplicate
      </Row>,
      { theme: {} },
    );
    const box = row.getBoundingClientRect();
    const lead = within(row, '[data-slot="leading"]').getBoundingClientRect();
    const trail = within(row, '[data-slot="trailing"]').getBoundingClientRect();
    expect(lead.left - box.left, "the leading slot lost the gutter").toBeGreaterThan(0);
    // The far edge is the row's own INSET away, not its text padding away (§21, 2026-08-16),
    // so a boxed thing in the trailing slot sits equally off three edges. Measured against the
    // row's block clearance rather than against a number.
    const inset = parseFloat(computed(row, "padding-top")) +
      parseFloat(computed(row, "border-top-width"));
    expect(box.right - trail.right, "the trailing slot is not at the row's own inset").toBeCloseTo(
      inset,
      0,
    );
  });

  it("an empty slot rents no gap", () => {
    const bare = mounted(<Row>Duplicate</Row>, { theme: {} });
    expect(bare.querySelector("[data-slot]")).toBeNull();
    const conditional = mounted(<Row leading={false && <span>·</span>}>Duplicate</Row>, {
      theme: {},
    });
    expect(conditional.querySelector("[data-slot]")).toBeNull();
  });

  it("renders a <button>, and a render target keeps its own semantics", () => {
    const button = mounted(<Row>Duplicate</Row>, { theme: {} });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    // The Button-as-anchor lesson (2026-08-03): a link that announced as a button, with a
    // `type` attribute that means nothing on an anchor.
    const link = mounted(<Row render={<a href="/x" />}>Docs</Row>, { theme: {} });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("type"), "an anchor was handed a button's type").toBeNull();
    // An inert row is a div, and it is still a row.
    const inert = mounted(<Row render={<div />}>Read only</Row>, { theme: {} });
    expect(inert.tagName).toBe("DIV");
    expect(inert.classList.contains("kui-row")).toBe(true);
  });

  it("a keyboard user can see where they are — a standalone row IS a tab stop", () => {
    // A menu row's focus is carried by the roving highlight, so the family's ring ARRIVAL is
    // stood down on rows. The ring itself is not, and it must not be: this row is reached by
    // Tab like any other button, and a tab stop with no visible focus fails outright.
    const row = mounted(<Row>Duplicate</Row>, { theme: {} });
    row.focus();
    expect(computed(row, "outline-style"), "a focused row draws no ring").toBe("solid");
    expect(parseFloat(computed(row, "outline-width"))).toBeGreaterThan(0);
  });

  it("disabled recedes and stops promising a press", () => {
    const live = mounted(<Row>Duplicate</Row>, { theme: {} });
    const dead = mounted(<Row disabled>Duplicate</Row>, { theme: {} });
    expect(computed(dead, "color"), "a dead row reads as a live one").not.toBe(
      computed(live, "color"),
    );
    expect(computed(dead, "cursor")).not.toBe("pointer");
  });
});
