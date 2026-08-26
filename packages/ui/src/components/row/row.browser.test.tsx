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
  until,
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
    it(`size ${size}: the same rest and the same dress as a menu row — and NOT the same box`, () => {
      // Family-first was declared when Menu shipped, on the argument that four separately
      // designed rows in one weight class WILL drift. Since 2026-08-26 the family has two
      // POSTURES and one dress: what is shared is the rest fill, the content weight and the
      // state machine; the BOX is the posture's — a floating row takes the judged notch, a
      // standing row rides the ladder. So the fill and weight are asserted equal, and the
      // box is asserted DIFFERENT on purpose: a Row that came out at the menu row's height
      // would mean the notch had leaked back out of its floating scope.
      const row = mounted(<Row size={size}>Duplicate</Row>, { theme: {} });
      const item = menuRow(size);
      expect(computed(row, "background-color")).toBe(computed(item, "background-color"));
      expect(computed(row, "font-weight")).toBe(computed(item, "font-weight"));
      expect(
        row.getBoundingClientRect().height,
        `size ${size}: the standing row took the floating notch`,
      ).toBeGreaterThan(item.getBoundingClientRect().height);
    });
  }

  for (const pointer of POINTERS) {
    it(`${pointer}: a standing row stands LEVEL with the button at its index (2026-08-26)`, () => {
      // The exception flipped owners: the notch below the button was judged on a MENU
      // (2026-08-09, "uncomfortably sparse") and was the family default only because Menu
      // was the first member — the sidebar row opted back out the day it existed, and Tree
      // landed on the menu's number and sat 30 in a column of 32s. A row in a permanent
      // column stands level with the button beside it; only a floating panel's rows keep
      // the notch (the law below). Asserted per cell in both worlds, against a mounted
      // Button rather than a token — the shell's own law made that the family bar.
      for (const size of SIZES) {
        const row = mounted(<Row size={size}>Duplicate</Row>, { theme: { pointer } });
        const button = mounted(<Button size={size}>Duplicate</Button>, { theme: { pointer } });
        expect(
          row.getBoundingClientRect().height,
          `${pointer}/size ${size}: the row is not level with its button`,
        ).toBeCloseTo(button.getBoundingClientRect().height, 1);
      }
    });
  }

  it("the MENU row keeps the notch: its box is the text LINE plus the designed inset", () => {
    // The judged number stays with the member it was judged on. The derivation stated as an
    // equality rather than a bound: box = line + 2 × rowInset, with the border term already
    // ceded in the padding (the checkbox target's audit lesson). A bound would go green on a
    // menu row that had quietly climbed onto the height ladder.
    for (const size of SIZES) {
      const item = menuRow(size);
      const line = parseFloat(computed(item, "line-height"));
      const pad =
        parseFloat(computed(item, "padding-top")) + parseFloat(computed(item, "padding-bottom"));
      const border =
        parseFloat(computed(item, "border-top-width")) +
        parseFloat(computed(item, "border-bottom-width"));
      expect(
        item.getBoundingClientRect().height,
        `size ${size}: the menu row's box is not line + inset`,
      ).toBeCloseTo(line + pad + border, 1);
    }
  });

  it("at radius='full', a standing row is a PILL of the box it actually has (2026-08-26)", () => {
    // The law the 2026-08-26 finding was missing: nothing anywhere read a standing row's
    // corner at the default radius. The bare-family corner re-point handed every row the
    // ROW capsule — half the notch box — so a nav row painted 15px of corner on a 32px box
    // while the tree row beside it was a true pill. The corner follows the height: a
    // standing row wears the control band's entry, which at `full` is half the control
    // height, i.e. half of exactly the box the row renders.
    for (const size of SIZES) {
      const row = mounted(<Row size={size}>Duplicate</Row>, { theme: { radius: "full" } });
      const h = row.getBoundingClientRect().height;
      expect(
        parseFloat(computed(row, "border-top-left-radius")),
        `size ${size}: the standing row's corner is not half its own box`,
      ).toBeCloseTo(h / 2, 1);
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
 * THE CURRENT ROW'S ICON SPEAKS ITS FAMILY; A RESTING ICON KEEPS ITS LABEL'S INK (§7, §21 —
 * reversed 2026-08-26, Kushagra, judging Finder over the docs sidebar: when every icon is
 * accent, accent stops meaning "you are here").
 *
 * The law is a COMPARISON across states rather than assertions about single colours: a rule
 * that painted every icon the family (the 2026-08-23 rule this replaces) must fail the
 * resting arm, and a rule that painted none must fail the current arm.
 */
describe("the leading icon: rests in the label's ink, speaks the family when current (§7, §21)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: resting icons inherit the label; the current row's takes the glyph`, () => {
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

      // A RESTING ICON IS ITS LABEL — both families. The destructive arm is the load-bearing
      // one: under the replaced rule it wore the glyph, so this assertion is exactly what the
      // old stylesheet fails. (The ink carries full chroma since the same day's chromaCurve
      // change, so ink-red is still an actual red — family survives, volume drops.)
      expect(icon("plain"), "a neutral row's icon left the ink").toBe(
        computed(within(root, '[data-t="plain"]'), "color"),
      );
      const destructive = within(root, '[data-t="destructive"]');
      expect(icon("destructive"), "a resting icon still shouts the glyph").toBe(
        computed(destructive, "color"),
      );

      // THE CURRENT ROW'S ICON TAKES THE FAMILY BACK — at --tone-current, the per-mode
      // ink/glyph pick (2026-08-26: "the icon color and label not matching bothers me").
      const current = within(root, '[data-t="current"]');
      expect(icon("current")).toBe(colorOn(current, "var(--accent-current)"));
      expect(icon("current"), "the current icon settled for the neutral ink").not.toBe(
        icon("plain"),
      );
      // AND THE MATCH IS THE POINT: the current row's icon and label are ONE colour, in
      // both appearances — which is what the shared role makes structural.
      expect(icon("current"), "the current icon and label disagree").toBe(
        computed(current, "color"),
      );
    });
  }

  it("a row is MONOCHROME: both slots follow the label, at rest and current alike", () => {
    // The doctrine stated as a measurement: no slot carries a colour of its own — the row's
    // one colour reaches icon, words and trailing punctuation by inheritance, and the STATE
    // decides which colour that is. Asserted on a toned resting row and a current row,
    // because those are the two places the old rules painted a slot separately.
    const root = mounted(
      <div>
        <Row data-t="destructive" tone="destructive" leading={<span>▲</span>} trailing={<span>▶</span>}>
          Delete
        </Row>
        <Row data-t="current" current leading={<span>▲</span>} trailing={<span>▶</span>}>
          Overview
        </Row>
      </div>,
      { theme: {} },
    );
    for (const t of ["destructive", "current"] as const) {
      const row = within(root, `[data-t="${t}"]`);
      const label = computed(row, "color");
      expect(computed(within(row, '[data-slot="leading"]'), "color"), `${t}: leading`).toBe(label);
      expect(computed(within(row, '[data-slot="trailing"]'), "color"), `${t}: trailing`).toBe(label);
    }
  });

  it("a DEAD current row's icon dims with its words", () => {
    // The glyph is a tone ROLE, so `--tone-glyph` sits in the disabled stand-down beside the
    // ink trio (the shape's third appearance: the ink trio 2026-08-09, the slider handle
    // 2026-08-07). A resting dead icon dims by inheritance — it IS the label's ink — so the
    // CURRENT row is where the stand-down is load-bearing: without it a dead current row
    // would paint the live family at full chroma under a dimmed label.
    const root = mounted(
      <div>
        <Row data-t="live" current leading={<span>▲</span>}>Overview</Row>
        <Row data-t="dead" current disabled leading={<span>▲</span>}>Overview</Row>
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

describe("an inert render target does not answer the pointer (§21, audit 2026-08-26)", () => {
  it("a Row rendered as a <div> stays quiet under the pointer — and a wired one still lights", async () => {
    /**
     * `render={<div/>}` is the shape this component's own JSDoc recommends for a list you only
     * read, and it lit under the pointer like every pressable row in the library, because the
     * hover stamp asks "is anybody else driving this" and reads silence as "the pointer is".
     *
     * The three subjects are the law: the plain button is the positive control (without it a
     * component that had gone inert everywhere would pass), and the handled div is the guard
     * against the repair over-reaching — an escape that loses to the default is not an escape.
     *
     * STILL UNREPAIRED and deliberately not asserted here: an inert row keeps `.kui-control`'s
     * `cursor: var(--cursor-button)` and its unselectable text. Both are declared in the shared
     * control skeleton, which this component has no stylesheet of its own to stand down.
     */
    const plain = mounted(<Row>Duplicate</Row>, { theme: {} });
    const inert = mounted(<Row render={<div />}>Read only</Row>, { theme: {} });
    const handled = mounted(<Row render={<div onClick={() => {}} />}>Press me</Row>, { theme: {} });
    expect(inert.tagName, "the fixture's inert subject is not a div").toBe("DIV");

    // PAINT FIRST, because that is what a reader of the list sees and the stamp below is one
    // indirection short of it: the plain row must light and the inert one must not, measured
    // with the pointer really parked on each of them in turn.
    const rest = computed(inert, "background-color");
    await userEvent.hover(plain);
    await until(() => computed(plain, "background-color") !== rest);
    expect(
      computed(plain, "background-color"),
      "the positive control does not light either — the law is measuring nothing",
    ).not.toBe(rest);
    await userEvent.hover(inert);
    await until(() => computed(plain, "background-color") === rest);
    expect(computed(inert, "background-color"), "an inert row washes under the pointer").toBe(rest);
    await userEvent.unhover(inert);

    expect(
      inert.hasAttribute("data-hover-lit"),
      "an unpressable row is stamped as the pointer's own",
    ).toBe(false);
    expect(handled.hasAttribute("data-hover-lit"), "the escape stopped being an escape").toBe(true);
  });
});
