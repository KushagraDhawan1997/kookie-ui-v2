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
  colorOn,
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


/**
 * A ROW'S ICON READS ITS FAMILY (§7, §21, 2026-08-23).
 *
 * One declaration in the shared layer, and the whole claim is that no component needs an
 * exception: each member gets the right answer out of the tone it already stamps. So the law
 * is written as a COMPARISON across three families rather than as three assertions about
 * three colours — asserting "the accent row's icon is accent" alone would pass on a rule that
 * painted every icon accent, which is exactly the rule this is not.
 */
describe("the leading icon speaks the row's family (§7, §21)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: neutral reads the ink, a chosen family reads its glyph`, () => {
      const root = mounted(
        <div>
          <Row data-t="plain" leading={<span>▲</span>}>Rename</Row>
          <Row data-t="destructive" tone="destructive" leading={<span>▲</span>}>Delete</Row>
          <Row data-t="current" current leading={<span>▲</span>}>Overview</Row>
        </div>,
        { theme: { appearance } },
      );
      const icon = (t: string) =>
        computed(within(root, `[data-t="${t}"] [data-slot="leading"]`), "color");

      // A GREY MOVES BY NOTHING, and this is the half that makes the rule safe to state
      // generally. A low-chroma family's glyph IS its ink by construction (there is no chroma
      // to maximise, so the solve would otherwise return the palest legible grey — measured
      // #8f9397 before that remap), which is why a menu row's icon is untouched by this.
      expect(icon("plain"), "a neutral row's icon left the ink").toBe(
        computed(within(root, '[data-t="plain"]'), "color"),
      );

      // A CHROMA FAMILY MOVES, and to the glyph rather than to the ink beside it. An icon owes
      // the non-text floor and prose owes the reading floor, so the ink over-pays and
      // under-saturates: the difference is a brick red against an actual red.
      const el = within(root, '[data-t="destructive"]');
      expect(icon("destructive")).toBe(colorOn(el, "var(--destructive-glyph)"));
      expect(icon("destructive"), "the icon settled for the label's ink").not.toBe(
        computed(el, "color"),
      );

      // And the three genuinely differ, so a rule that painted ONE colour cannot pass.
      expect(new Set([icon("plain"), icon("destructive"), icon("current")]).size).toBe(3);
    });
  }

  it("a TRAILING adornment is punctuation and keeps the label's ink", () => {
    // Leading identifies the row; trailing is a count or a chevron. Asserted because the rule
    // is one selector away from covering both, and the difference would never be noticed on a
    // neutral row — where the two values coincide.
    const root = mounted(
      <Row tone="destructive" leading={<span>▲</span>} trailing={<span>▶</span>}>
        Delete
      </Row>,
      { theme: {} },
    );
    const lead = within(root, '[data-slot="leading"]');
    const trail = within(root, '[data-slot="trailing"]');
    expect(computed(trail, "color"), "the trailing slot took the family too").toBe(
      computed(root, "color"),
    );
    expect(computed(lead, "color")).not.toBe(computed(trail, "color"));
  });

  it("a DEAD row's icon dims with its words", () => {
    // The defect this rule introduced and the shared remap absorbed: the icon reads a tone
    // ROLE, so `--tone-glyph` had to join the disabled stand-down beside the ink trio. Before
    // that a dead row painted the live family at full chroma under a dimmed label. Third time
    // this shape has appeared (the ink trio 2026-08-09, the slider handle 2026-08-07).
    const root = mounted(
      <div>
        <Row data-t="live" tone="destructive" leading={<span>▲</span>}>Delete</Row>
        <Row data-t="dead" tone="destructive" disabled leading={<span>▲</span>}>Delete</Row>
      </div>,
      { theme: {} },
    );
    const icon = (t: string) =>
      computed(within(root, `[data-t="${t}"] [data-slot="leading"]`), "color");
    expect(icon("dead"), "a dead row's icon is still the live family").not.toBe(icon("live"));
    expect(icon("dead"), "the icon did not land on the dimmed ink").toBe(
      colorOn(within(root, '[data-t="dead"]'), "var(--disabled-ink)"),
    );
  });
});


/**
 * A DEAD ROW IS DEAD ON EVERY ELEMENT (§21, added 2026-08-23 from the ultracode audit).
 *
 * `disabled` is not a content attribute on an `<a>`, so this shipped as a complete no-op on
 * the path Row's own JSDoc recommends: full-contrast ink, `pointer` cursor, in the tab order,
 * activatable, announced to nobody. `Button` on the same page got it right, which is the
 * negative control this whole describe is built around — without it the law could pass on a
 * package where nothing is ever disabled properly.
 */
describe("disabled reaches the render target, not only the button (§21)", () => {
  it("a dead LINK is dimmed, announced, out of the tab order and inert", () => {
    const root = mounted(
      <div>
        <Row data-t="live" render={<a href="#live" />}>Live</Row>
        <Row data-t="dead" disabled render={<a href="#dead" />}>Dead</Row>
        <Button data-t="control" disabled render={<a href="#c" />}>Control</Button>
      </div>,
      { theme: {} },
    );
    const dead = within(root, '[data-t="dead"]');
    const live = within(root, '[data-t="live"]');
    const control = within(root, '[data-t="control"]');

    // Calibration: the negative control proves the SHARED arms work, so a failure below is
    // Row's and not the disabled machinery's.
    expect(computed(control, "color")).toBe(colorOn(control, "var(--disabled-ink)"));

    // PAINT — the shared arms only reach it through `data-disabled`, since `:disabled` cannot
    // match an anchor.
    expect(computed(dead, "color"), "a dead link reads like a live one").not.toBe(
      computed(live, "color"),
    );
    expect(computed(dead, "color")).toBe(colorOn(dead, "var(--disabled-ink)"));
    expect(computed(dead, "cursor"), "a dead link still promises a press").not.toBe("pointer");

    // ANNOUNCEMENT and REACHABILITY — the half a colour cannot carry.
    expect(dead.getAttribute("aria-disabled"), "a dead link is announced to nobody").toBe("true");
    expect(dead.tabIndex, "a dead link is still in the tab order").toBe(-1);

    // And a LIVE link keeps every one of them, so the law is about `disabled` rather than
    // about being an anchor.
    expect(live.getAttribute("aria-disabled")).toBeNull();
    expect(live.tabIndex).not.toBe(-1);
    expect(live.hasAttribute("data-disabled")).toBe(false);
  });

  it("a render target that IS a button gains none of it — the element already means it", () => {
    /**
     * The other half, and it is what stops the fix from being a blanket stamp: on a native
     * button `disabled` IS the contract, and `aria-disabled` beside it is the double
     * announcement this repo refuses elsewhere.
     *
     * THE FIXTURE MUST BE `render={<button/>}`, NOT A BARE `<Row disabled>`. The first spelling
     * used the bare row and its own sabotage pass caught it: the guard lives INSIDE the
     * `if (render)` branch, so a bare row never reaches it and removing the `rootsInButton`
     * check changed nothing the law could see. A law about the guard has to mount the path the
     * guard is on — the degenerate-fixture rule (2026-08-20), on the day it was quoted.
     */
    const root = mounted(
      <div>
        <Row data-t="native" disabled render={<button />}>Dead</Row>
        <Row data-t="bare" disabled>Dead</Row>
      </div>,
      { theme: {} },
    );
    for (const t of ["native", "bare"]) {
      const el = within(root, `[data-t="${t}"]`);
      expect(el.tagName, t).toBe("BUTTON");
      expect(el.getAttribute("aria-disabled"), `${t}: a native button was double-announced`).toBeNull();
      expect(el.hasAttribute("data-disabled"), `${t}: a native button was double-stamped`).toBe(false);
      expect(el.tabIndex, `${t}: a native button had its tabindex rewritten`).not.toBe(-1);
      // It is still visibly dead — through `:disabled`, which is what a real button offers.
      expect(computed(el, "color"), t).toBe(colorOn(el, "var(--disabled-ink)"));
    }
  });
});
