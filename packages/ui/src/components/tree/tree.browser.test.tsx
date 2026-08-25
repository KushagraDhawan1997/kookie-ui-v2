/**
 * Tree's laws, mounted (§33).
 *
 * The five §33 named before any code existed, plus the machine's own semantics. Two idiom
 * rules carried in from the audits: paint is read with the POINTER NOWHERE NEAR the subject
 * (selection acts happen by keyboard, because a click parks the pointer on the row and a
 * hover-lit row's fill would be read as the selected fill — the 2026-08-09 lesson), and the
 * flat-list fixture places a SIBLING AFTER a nested subtree, because that is the input where
 * a flat renderer and a nested renderer give different answers (the degenerate-fixture rule).
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { SIZES, computed, mounted, tokenOn, until, within } from "../../test/browser.tsx";
import { Tree, type TreeNode } from "./tree.tsx";

/**
 * Alpha holds two children, the second of which holds one more — and Beta follows the WHOLE
 * subtree as Alpha's sibling. Cargo is expandable-but-empty (children present, zero long),
 * the "folder with nothing in it" every file browser has.
 */
const ITEMS: readonly TreeNode[] = [
  {
    id: "a",
    label: "Alpha",
    children: [
      { id: "a1", label: "Anchor" },
      { id: "a2", label: "Apex", children: [{ id: "a2x", label: "Axle" }] },
    ],
  },
  { id: "b", label: "Beta" },
  { id: "c", label: "Cargo", children: [] },
];

const rowsOf = (tree: HTMLElement) =>
  [...tree.querySelectorAll<HTMLElement>("[role='treeitem']")];
const labelOf = (row: HTMLElement) => row.textContent ?? "";

describe("the announcement (§33): a tree is a tree, and only what expands says so", () => {
  it("root and rows carry the pattern's roles, and aria-expanded sits only on expandables", () => {
    const tree = mounted(<Tree items={ITEMS} aria-label="Files" defaultExpandedIds={["a"]} />, {
      theme: {},
      select: ".kui-tree",
    });
    expect(tree.getAttribute("role")).toBe("tree");
    const rows = rowsOf(tree);
    expect(rows.map(labelOf)).toEqual(["Alpha", "Anchor", "Apex", "Beta", "Cargo"]);
    // Alpha is open, Apex and Cargo are closed, and the two LEAVES say nothing at all —
    // a leaf with aria-expanded would announce as an empty openable folder.
    expect(rows[0]!.getAttribute("aria-expanded")).toBe("true");
    expect(rows[1]!.getAttribute("aria-expanded")).toBeNull();
    expect(rows[2]!.getAttribute("aria-expanded")).toBe("false");
    expect(rows[4]!.getAttribute("aria-expanded")).toBe("false");
  });

  it("aria-multiselectable appears exactly when asked for", () => {
    const single = mounted(<Tree items={ITEMS} aria-label="Files" />, { theme: {}, select: ".kui-tree" });
    expect(single.getAttribute("aria-multiselectable")).toBeNull();
    const multi = mounted(<Tree items={ITEMS} aria-label="Files" multiselectable />, {
      theme: {},
      select: ".kui-tree",
    });
    expect(multi.getAttribute("aria-multiselectable")).toBe("true");
  });
});

describe("the flat list (§33): nesting is spelled in attributes, never in DOM", () => {
  it("every visible row is a DIRECT child of the tree, in document order, with the levels the data states", () => {
    // The load-bearing fixture fact: Beta FOLLOWS Alpha's expanded subtree. A nested
    // renderer puts Anchor and Apex inside Alpha's element (their parentElement is not the
    // tree), and a naive flatten that appends children after ALL siblings puts Beta before
    // Apex. Both wrong shapes fail here; the shipped one cannot pass by accident.
    const tree = mounted(
      <Tree items={ITEMS} aria-label="Files" defaultExpandedIds={["a", "a2"]} />,
      { theme: {}, select: ".kui-tree" },
    );
    const rows = rowsOf(tree);
    expect(rows.map(labelOf)).toEqual(["Alpha", "Anchor", "Apex", "Axle", "Beta", "Cargo"]);
    for (const row of rows) expect(row.parentElement, labelOf(row)).toBe(tree);
    expect(rows.map((r) => r.getAttribute("aria-level"))).toEqual(["1", "2", "2", "3", "1", "1"]);
    expect(rows.map((r) => r.getAttribute("aria-posinset"))).toEqual(["1", "1", "2", "1", "2", "3"]);
    expect(rows.map((r) => r.getAttribute("aria-setsize"))).toEqual(["3", "2", "2", "1", "3", "3"]);
  });

  it("a collapsed subtree's rows are NOT rendered — hidden is absent, not styled away", () => {
    const tree = mounted(<Tree items={ITEMS} aria-label="Files" />, { theme: {}, select: ".kui-tree" });
    expect(rowsOf(tree).map(labelOf)).toEqual(["Alpha", "Beta", "Cargo"]);
  });
});

describe("the keyboard (§33): the ARIA tree walk, on visible rows only", () => {
  const mount = () =>
    mounted(<Tree items={ITEMS} aria-label="Files" />, { theme: {}, select: ".kui-tree" });

  const focusIs = (label: string) =>
    until(() => labelOf(document.activeElement as HTMLElement) === label);

  it("Down walks PAST a collapsed subtree; Right opens, then descends; Left closes, then ascends", async () => {
    const tree = mount();
    const first = rowsOf(tree)[0]!;
    first.focus();
    // Down from Alpha lands on Beta — Anchor and Apex are collapsed away.
    await userEvent.keyboard("{ArrowDown}");
    expect(await focusIs("Beta")).toBe(true);
    await userEvent.keyboard("{ArrowUp}");
    expect(await focusIs("Alpha")).toBe(true);
    // Right once: opens without moving. Right again: descends to the first child.
    await userEvent.keyboard("{ArrowRight}");
    expect(
      await until(
        () => (document.activeElement as HTMLElement).getAttribute("aria-expanded") === "true",
      ),
      "Right opens",
    ).toBe(true);
    expect(labelOf(document.activeElement as HTMLElement)).toBe("Alpha");
    await userEvent.keyboard("{ArrowRight}");
    expect(await focusIs("Anchor")).toBe(true);
    // Left from a LEAF ascends to the parent; Left again closes it.
    await userEvent.keyboard("{ArrowLeft}");
    expect(await focusIs("Alpha")).toBe(true);
    await userEvent.keyboard("{ArrowLeft}");
    expect(
      await until(
        () => (document.activeElement as HTMLElement).getAttribute("aria-expanded") === "false",
      ),
      "Left closes",
    ).toBe(true);
  });

  it("Home and End jump to the visible extremes; typeahead lands on the next match", async () => {
    const tree = mount();
    rowsOf(tree)[0]!.focus();
    await userEvent.keyboard("{End}");
    expect(await focusIs("Cargo")).toBe(true);
    await userEvent.keyboard("{Home}");
    expect(await focusIs("Alpha")).toBe(true);
    await userEvent.keyboard("b");
    expect(await focusIs("Beta")).toBe(true);
  });

  it("ONE roving tab stop: exactly one row is tabbable, and it follows focus", async () => {
    const tree = mount();
    const stops = () => rowsOf(tree).filter((r) => r.tabIndex === 0).map(labelOf);
    expect(stops()).toEqual(["Alpha"]);
    rowsOf(tree)[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    await until(() => stops()[0] === "Beta");
    expect(stops()).toEqual(["Beta"]);
  });
});

describe("selection (§33): announced by the machine, painted in the family's own currency", () => {
  it("Enter selects; the row carries aria-selected AND the shared data-selected vocabulary", async () => {
    const tree = mounted(<Tree items={ITEMS} aria-label="Files" />, { theme: {}, select: ".kui-tree" });
    rowsOf(tree)[0]!.focus();
    await userEvent.keyboard("{Enter}");
    const alpha = rowsOf(tree)[0]!;
    expect(alpha.getAttribute("aria-selected")).toBe("true");
    expect(alpha.hasAttribute("data-selected")).toBe(true);
    expect(rowsOf(tree)[1]!.getAttribute("aria-selected")).toBe("false");
  });

  it("SELECTED OUTRANKS HOVERED (§10's clause, 2026-08-26) — the persistent fill is darker than the transient one", async () => {
    // Re-keyed from an agreement with `Row current`, which was true and the wrong thing to
    // want: both resolved the medium rung, but quiet's HOVER also resolved the same pixels,
    // so a selected row and a hovered one were indistinguishable (measured identical,
    // 2026-08-26 — the segmented control's own 2026-08-24 finding one family over). The law
    // now reads the RANKING: select by keyboard, hover an UNSELECTED sibling with a real
    // pointer, and the selected rest must carry more alpha than the hovered transient.
    // INSTRUMENT NOTE: computed fills come back in three spellings here — `rgba(r, g, b, a)`
    // for the transparent rest, `color(srgb r g b / a)` for the resolved soft, and
    // `oklab(l a b / a)` for the mixed hover. The first draft's rgba-only regex read both
    // sides as alpha 1 and the law compared 1 with 1 — the 2026-08-08 calibration lesson: an
    // instrument is calibrated against a known answer before its output is evidence.
    const alphaOf = (color: string): number => {
      const slash = /\/\s*([\d.]+)\s*\)/.exec(color);
      if (slash) return parseFloat(slash[1]!);
      const comma = /^rgba\((?:[^,]+,){3}\s*([\d.]+)\)/.exec(color);
      if (comma) return parseFloat(comma[1]!);
      return 1;
    };
    const tree = mounted(<Tree items={ITEMS} aria-label="Files" />, { theme: {}, select: ".kui-tree" });
    rowsOf(tree)[0]!.focus();
    await userEvent.keyboard("{Enter}");
    const selectedFill = computed(rowsOf(tree)[0]!, "background-color");
    await userEvent.hover(rowsOf(tree)[1]!);
    await until(() => computed(rowsOf(tree)[1]!, "background-color") !== "rgba(0, 0, 0, 0)");
    const hoveredFill = computed(rowsOf(tree)[1]!, "background-color");
    await userEvent.unhover(rowsOf(tree)[1]!);
    // Both are visible — a ranking between two invisibles ranks nothing.
    expect(alphaOf(selectedFill), `selected is invisible: ${selectedFill}`).toBeGreaterThan(0);
    expect(alphaOf(hoveredFill), `hover is invisible: ${hoveredFill}`).toBeGreaterThan(0);
    expect(
      alphaOf(selectedFill),
      `selected (${selectedFill}) must outrank hovered (${hoveredFill})`,
    ).toBeGreaterThan(alphaOf(hoveredFill));
  });

  it("rows with persistent fills get air: the tree's column separates rows by the stated pick", () => {
    const tree = mounted(<Tree items={ITEMS} aria-label="Files" defaultExpandedIds={["a"]} />, {
      theme: {},
      select: ".kui-tree",
    });
    const rows = rowsOf(tree);
    const want = parseFloat(tokenOn(tree, "--layout-space-1"));
    expect(want, "the pick resolves to nothing").toBeGreaterThan(0);
    const a = rows[0]!.getBoundingClientRect();
    const b = rows[1]!.getBoundingClientRect();
    expect(b.top - a.bottom, "adjacent rows touch").toBeCloseTo(want, 1);
  });

  it("multi: Shift-Down extends a range, Cmd toggles one out, plain Enter collapses to one", async () => {
    const seen: string[][] = [];
    const tree = mounted(
      <Tree
        items={ITEMS}
        aria-label="Files"
        multiselectable
        defaultExpandedIds={["a"]}
        onSelectionChange={(ids) => seen.push(ids)}
      />,
      { theme: {}, select: ".kui-tree" },
    );
    rowsOf(tree)[0]!.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
    const selectedLabels = () =>
      rowsOf(tree)
        .filter((r) => r.getAttribute("aria-selected") === "true")
        .map(labelOf);
    expect(selectedLabels()).toEqual(["Alpha", "Anchor", "Apex"]);
    // Cmd/Ctrl-click toggles one member out of the range without touching the rest.
    const anchor = rowsOf(tree)[1]!;
    await userEvent.click(anchor, { modifiers: ["ControlOrMeta"] });
    expect(selectedLabels()).toEqual(["Alpha", "Apex"]);
    // A plain selection act replaces the whole set.
    rowsOf(tree)[3]!.focus();
    await userEvent.keyboard("{Enter}");
    expect(selectedLabels()).toEqual(["Beta"]);
    expect(seen.length).toBeGreaterThan(0);
  });
});

describe("the indent (§33): one level is one icon box, derived and painted", () => {
  it("each level starts exactly one --kui-ct-icon deeper, at every size", () => {
    for (const size of SIZES) {
      const tree = mounted(
        <Tree items={ITEMS} size={size} aria-label="Files" defaultExpandedIds={["a", "a2"]} />,
        { theme: {}, select: ".kui-tree" },
      );
      const rows = rowsOf(tree);
      const pad = (row: HTMLElement) => parseFloat(computed(row, "padding-inline-start"));
      const icon = parseFloat(tokenOn(rows[0]!, "--kui-ct-icon"));
      expect(icon, `${size}: no icon box`).toBeGreaterThan(0);
      // Alpha (level 1) → Anchor (level 2) → Axle (level 3): one box per step.
      expect(pad(rows[1]!) - pad(rows[0]!), `${size}: level 1→2`).toBeCloseTo(icon, 1);
      expect(pad(rows[3]!) - pad(rows[1]!), `${size}: level 2→3`).toBeCloseTo(icon, 1);
      tree.remove();
    }
  });
});

describe("the disclosure: paint, not a control — and it toggles without selecting", () => {
  it("a leaf keeps the hidden box, so labels at one level share a left edge", () => {
    const tree = mounted(<Tree items={ITEMS} aria-label="Files" defaultExpandedIds={["a"]} />, {
      theme: {},
      select: ".kui-tree",
    });
    const rows = rowsOf(tree);
    const glyph = (row: HTMLElement) => within(row, ".kui-tree-disclosure");
    // Anchor is a leaf beside Apex, an expandable: same level, and their LABELS start at
    // the same x because the leaf's glyph box is hidden, not absent.
    expect(computed(glyph(rows[1]!), "visibility")).toBe("hidden");
    expect(computed(glyph(rows[2]!), "visibility")).toBe("visible");
    expect(glyph(rows[1]!).getBoundingClientRect().width).toBeCloseTo(
      glyph(rows[2]!).getBoundingClientRect().width,
      1,
    );
  });

  it("clicking the chevron opens the subtree and selects NOTHING; there is no nested control", async () => {
    const tree = mounted(<Tree items={ITEMS} aria-label="Files" />, { theme: {}, select: ".kui-tree" });
    const alpha = rowsOf(tree)[0]!;
    await userEvent.click(within(alpha, ".kui-tree-disclosure"));
    await until(() => alpha.getAttribute("aria-expanded") === "true");
    expect(alpha.getAttribute("aria-expanded")).toBe("true");
    expect(alpha.getAttribute("aria-selected")).toBe("false");
    // The row IS the button; the glyph must never be a second one nested inside it.
    expect(alpha.querySelector("button, [role='button']")).toBeNull();
  });
});
