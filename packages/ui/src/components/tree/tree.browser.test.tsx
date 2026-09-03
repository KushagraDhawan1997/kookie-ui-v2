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

import {
  POINTERS,
  SIZES,
  colorOn,
  computed,
  mounted,
  tokenOn,
  until,
  within,
} from "../../test/browser.tsx";
import { NavTree, Tree, type TreeNode } from "./tree.tsx";

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

  it("selected speaks in INK too — parity with the nav member (2026-09-02)", async () => {
    // Kushagra, with Layers open beside the docs sidebar: "why is clicked state not showing
    // accent colored label" — then "lets get parity". The nav member had said the picked row
    // in accent ink since it shipped; the instrument said it in fill alone, so one machine
    // painted its pick two ways depending on which front door you came in by.
    //
    // BOTH APPEARANCES, and both directions: the selected row's ink must BE --tone-current
    // and an unselected sibling's must BE --color-text. Reading only the selected one would
    // pass on a stylesheet that painted the whole panel accent — which is exactly what the
    // bare `[aria-selected]` selector does, since Tree stamps the attribute on every row,
    // false included.
    for (const appearance of ["light", "dark"] as const) {
      const tree = mounted(<Tree items={ITEMS} aria-label="Files" />, {
        theme: { appearance },
        select: ".kui-tree",
      });
      rowsOf(tree)[0]!.focus();
      await userEvent.keyboard("{Enter}");
      const selected = rowsOf(tree)[0]!;
      const resting = rowsOf(tree)[1]!;
      expect(computed(selected, "color"), `${appearance}: selected ink`).toBe(
        colorOn(selected, "var(--tone-current)"),
      );
      expect(computed(resting, "color"), `${appearance}: resting ink`).toBe(
        colorOn(resting, "var(--color-text)"),
      );
      expect(computed(selected, "color")).not.toBe(computed(resting, "color"));
    }
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

/**
 * The NAV member (§33): same machine, different announcement — and the announcement is the
 * whole point, so the first law is the over-claim law. The fixture is a two-section nav with
 * a current page, the docs sidebar's own shallow shape.
 */
const NAV: readonly TreeNode[] = [
  {
    id: "start",
    label: "Getting started",
    children: [
      { id: "install", label: "Installation", href: "/install" },
      { id: "theming", label: "Theming", href: "/theming" },
    ],
  },
  {
    id: "components",
    label: "Components",
    children: [{ id: "button", label: "Button", href: "/components/button" }],
  },
];

describe("NavTree announces as navigation, never as a tree (§33)", () => {
  it("no tree roles anywhere: sections are buttons with aria-expanded, leaves are links", () => {
    const nav = mounted(
      <NavTree items={NAV} defaultExpandedIds={["start", "components"]} currentId="install" />,
      { theme: {}, select: ".kui-tree-nav" },
    );
    // The over-claim law: role="tree" on navigation is the exact thing §33 refuses.
    expect(nav.getAttribute("role")).toBeNull();
    expect(nav.querySelector("[role='tree'], [role='treeitem']")).toBeNull();
    const sections = [...nav.querySelectorAll<HTMLElement>("button[aria-expanded]")];
    expect(sections.map((s) => s.textContent)).toEqual(["Getting started", "Components"]);
    const links = [...nav.querySelectorAll<HTMLElement>("a[href]")];
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/install",
      "/theming",
      "/components/button",
    ]);
    // Exactly one row is the page you are on, and it is announced, not merely painted.
    const current = [...nav.querySelectorAll("[aria-current='page']")];
    expect(current).toHaveLength(1);
    expect(current[0]!.textContent).toBe("Installation");
  });

  it("normal tab order — the roving tabindex is the instrument's, not navigation's", () => {
    const nav = mounted(
      <NavTree items={NAV} defaultExpandedIds={["start", "components"]} currentId="install" />,
      { theme: {}, select: ".kui-tree-nav" },
    );
    for (const el of nav.querySelectorAll<HTMLElement>("a, button")) {
      expect(el.tabIndex, `${el.textContent} left the tab order`).toBeGreaterThanOrEqual(0);
    }
  });

  it("a section row IS the disclosure: pressing it reveals and hides its children", async () => {
    const nav = mounted(<NavTree items={NAV} />, { theme: {}, select: ".kui-tree-nav" });
    expect(nav.querySelectorAll("a[href]")).toHaveLength(0);
    const start = within(nav, "button[aria-expanded]");
    await userEvent.click(start);
    await until(() => nav.querySelectorAll("a[href]").length === 2);
    expect(start.getAttribute("aria-expanded")).toBe("true");
    await userEvent.click(start);
    await until(() => nav.querySelectorAll("a[href]").length === 0);
  });

  it("current speaks in INK — the nav row identity (--tone-current), resting rows the neutral text", () => {
    // ShellNavItem's pair, asserted through the resolved values rather than a mounted Shell:
    // the current link's ink must BE --tone-current and a resting link's must BE --color-text,
    // in both appearances — so the tree's nav member and the shell's nav row cannot disagree
    // while both resolve the same roles.
    for (const appearance of ["light", "dark"] as const) {
      const nav = mounted(
        <NavTree items={NAV} defaultExpandedIds={["start"]} currentId="install" />,
        { theme: { appearance }, select: ".kui-tree-nav" },
      );
      const current = within(nav, "[aria-current='page']");
      const resting = [...nav.querySelectorAll<HTMLElement>("a[href]")].find(
        (a) => !a.hasAttribute("aria-current"),
      )!;
      expect(computed(current, "color"), `${appearance}: current ink`).toBe(
        colorOn(current, "var(--tone-current)"),
      );
      expect(computed(resting, "color"), `${appearance}: resting ink`).toBe(
        colorOn(resting, "var(--color-text)"),
      );
      expect(computed(current, "color")).not.toBe(computed(resting, "color"));
    }
  });

  it("the link escape carries the row's identity onto the app's own element", () => {
    const nav = mounted(
      <NavTree
        items={NAV}
        defaultExpandedIds={["start"]}
        renderLink={(node) => <a data-router="" href={`/base${node.href}`} />}
      />,
      { theme: {}, select: ".kui-tree-nav" },
    );
    const link = within(nav, "[data-router]");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/base/install");
    expect(link.classList.contains("kui-tree-item")).toBe(true);
    expect(link.textContent).toBe("Installation");
  });

  it("the indent is the machine's — a child link starts one icon box past its section", () => {
    const nav = mounted(
      <NavTree items={NAV} defaultExpandedIds={["start"]} />,
      { theme: {}, select: ".kui-tree-nav" },
    );
    const section = within(nav, "button[aria-expanded]");
    const leaf = within(nav, "a[href]");
    const icon = parseFloat(tokenOn(leaf, "--kui-ct-icon"));
    expect(
      parseFloat(computed(leaf, "padding-inline-start")) -
        parseFloat(computed(section, "padding-inline-start")),
    ).toBeCloseTo(icon, 1);
  });
});

/**
 * Where the chevron's apex sits relative to the box it is drawn in, in CLIENT pixels.
 *
 * Read through `getScreenCTM()`, which composes the element's own CSS transforms — calibrated
 * 2026-08-26 against the LTR case, whose answer is already known and asserted below. Composing
 * `rotate` and `scale` off the computed style by hand would re-derive the arithmetic under
 * test: the defect this law was written for IS an ordering, and an instrument that assumes an
 * order cannot measure one.
 */
function apexOffset(glyph: Element): { x: number; y: number } {
  const path = glyph.querySelector("path") as SVGPathElement | null;
  if (!path) throw new Error("no glyph path — the law would compare nothing");
  const apex = path.getPointAtLength(path.getTotalLength() / 2);
  const ctm = (glyph as unknown as SVGGraphicsElement).getScreenCTM();
  if (!ctm) throw new Error("no screen CTM — the law would compare nothing");
  const at = (x: number, y: number) => ({
    x: ctm.a * x + ctm.c * y + ctm.e,
    y: ctm.b * x + ctm.d * y + ctm.f,
  });
  const tip = at(apex.x, apex.y);
  // The viewBox's own centre: a constant of the drawing, not a re-derivation of the pose.
  const middle = at(8, 8);
  return { x: tip.x - middle.x, y: tip.y - middle.y };
}

describe("the chevron's posture, in both reading directions (§33, audit 2026-08-26)", () => {
  for (const dir of ["ltr", "rtl"] as const) {
    it(`${dir}: collapsed leads into the reading direction, expanded points DOWN`, () => {
      const tree = mounted(
        <div dir={dir}>
          <Tree items={ITEMS} aria-label="Files" defaultExpandedIds={["a"]} />
        </div>,
        { theme: {}, select: ".kui-tree" },
      );
      const rows = rowsOf(tree);
      const open = within(rows[0]!, ".kui-tree-disclosure"); // Alpha, expanded
      const shut = within(rows[2]!, ".kui-tree-disclosure"); // Apex, collapsed
      const o = apexOffset(open);
      const s = apexOffset(shut);
      // Collapsed: horizontal, and leading the way the words run.
      expect(Math.abs(s.x), `${dir}: collapsed is not horizontal`).toBeGreaterThan(Math.abs(s.y));
      expect(
        dir === "rtl" ? -s.x : s.x,
        `${dir}: collapsed points against the reading direction (${s.x}, ${s.y})`,
      ).toBeGreaterThan(0);
      // Expanded: DOWN in BOTH directions. The disclosure convention has no mirror — "open"
      // is down everywhere, and up is what every platform reserves for "collapse me".
      expect(Math.abs(o.y), `${dir}: expanded is not vertical`).toBeGreaterThan(Math.abs(o.x));
      expect(o.y, `${dir}: expanded points UP (apex offset ${o.x}, ${o.y})`).toBeGreaterThan(0);
    });
  }
});

describe("the disclosure is a real pointer target (§16, audit 2026-08-26)", () => {
  for (const pointer of POINTERS) {
    for (const size of SIZES) {
      it(`${pointer}/size ${size}: it clears the locked floor — and stops at its designed extent`, () => {
        // Inset from the viewport edge on purpose: the expander reaches OUTSIDE the glyph, and
        // a probe at a negative client x measures nothing at all.
        const tree = mounted(
          <div style={{ padding: "60px" }}>
            <Tree items={ITEMS} size={size} aria-label="Files" defaultExpandedIds={["a"]} />
          </div>,
          { theme: { pointer }, select: ".kui-tree" },
        );
        const row = rowsOf(tree)[0]!;
        const toggle = within(row, ".kui-tree-toggle");
        const box = toggle.getBoundingClientRect();
        const cx = box.left + box.width / 2;
        const cy = box.top + box.height / 2;
        const owns = (x: number, y: number) => {
          const hit = document.elementFromPoint(x, y);
          return hit !== null && (hit === toggle || toggle.contains(hit));
        };
        const floor = parseFloat(tokenOn(row, "--target-min"));
        expect(floor, "the floor token resolves to nothing").toBeGreaterThan(0);
        // The painted glyph is SMALLER than the floor in most cells — which is the whole
        // point, and also what makes this fixture able to tell the two implementations apart.
        const reach = floor / 2 - 1;
        for (const [dx, dy] of [
          [-reach, 0],
          [reach, 0],
          [0, -reach],
          [0, reach],
        ] as const) {
          expect(
            owns(cx + dx, cy + dy),
            `${pointer}/${size}: the target is short at (${dx}, ${dy}); glyph is ${box.width}x${box.height}`,
          ).toBe(true);
        }
        // ...and it is an EXPANSION, not the row. The designed extent is the mark family's —
        // min(--kui-ct-h, --touch-target-min) — so just past it the row answers again, which
        // is what keeps the Finder split (press the row to select, the chevron to open).
        const past =
          Math.min(
            parseFloat(tokenOn(row, "--kui-ct-h")),
            parseFloat(tokenOn(row, "--touch-target-min")),
          ) /
            2 +
          3;
        expect(
          owns(cx + past, cy),
          `${pointer}/${size}: the disclosure swallowed the row's own press`,
        ).toBe(false);
      });
    }
  }

  it("collapsing a folder by its CHEVRON keeps focus inside the tree (audit 2026-08-26)", async () => {
    /**
     * THE ACTIVATION IS SYNTHETIC ON PURPOSE, and choosing it is most of this law.
     *
     * Measured 2026-08-26 both ways against the unrepaired component: under a real Chromium
     * pointer, focus lands correctly — not because the tree repaired it, but because mousedown
     * focuses the button the chevron sits in, and that button happens to be the row the repair
     * moves to. So a `userEvent.click` fixture here cannot tell a repaired tree from a broken
     * one; it is the degenerate-fixture rule wearing a real pointer. Activating the toggle
     * without the browser's incidental focus move is what a programmatic or assistive
     * activation looks like, and it is also what the macOS platform rule produces on every
     * press — Safari and Firefox do not focus a button when you click it. Unrepaired, that
     * route measures `activeElement` as `<body>`.
     */
    const tree = mounted(<Tree items={ITEMS} aria-label="Files" defaultExpandedIds={["a", "a2"]} />, {
      theme: {},
      select: ".kui-tree",
    });
    const rows = rowsOf(tree);
    const alpha = rows[0]!;
    const axle = rows[3]!;
    expect(labelOf(axle)).toBe("Axle");
    axle.focus();
    expect(document.activeElement, "the fixture never got focus onto the doomed row").toBe(axle);
    within(alpha, ".kui-tree-toggle").click();
    await until(() => alpha.getAttribute("aria-expanded") === "false");
    // The roving tab stop repaired itself from the day this shipped; DOM focus did not, and a
    // keyboard user was thrown to the top of the document. Focus lands on the node that was
    // collapsed — the same one the tab stop falls back to, so the two cannot disagree.
    const landed = document.activeElement as HTMLElement | null;
    expect(landed, `focus fell to <${landed?.tagName}>`).toBe(alpha);
    expect(rowsOf(tree).filter((r) => r.tabIndex === 0).map(labelOf)).toEqual(["Alpha"]);
  });
});

describe("a nav leaf with nowhere to go does not pretend to be a link (§33, audit 2026-08-26)", () => {
  const DEAD: readonly TreeNode[] = [
    {
      id: "guides",
      label: "Guides",
      children: [
        { id: "live", label: "Installation", href: "/install" },
        { id: "soon", label: "Coming soon" },
      ],
    },
  ];

  it("no link element, no pointer light, no promise of a press", async () => {
    const nav = mounted(<NavTree items={DEAD} defaultExpandedIds={["guides"]} />, {
      theme: {},
      select: ".kui-tree-nav",
    });
    const rows = [...nav.querySelectorAll<HTMLElement>(".kui-tree-item")];
    const live = rows.find((r) => r.textContent === "Installation")!;
    const soon = rows.find((r) => r.textContent === "Coming soon")!;
    // The row directly above is the positive control, and it carries every assertion the
    // other way round: without it this law would pass just as happily on a NavTree whose
    // whole leaf vocabulary had gone inert.
    expect(live.tagName, "the fixture's live leaf is not a link").toBe("A");
    expect(soon.tagName, "an <a> with no href is not a link, and still says it is").not.toBe("A");
    expect(live.hasAttribute("data-hover-lit")).toBe(true);
    expect(soon.hasAttribute("data-hover-lit")).toBe(false);
    expect(
      computed(soon, "cursor"),
      "a row with nowhere to go still promises a press",
    ).not.toBe(computed(live, "cursor"));

    const rest = computed(soon, "background-color");
    await userEvent.hover(live);
    await until(() => computed(live, "background-color") !== computed(soon, "background-color"));
    await userEvent.hover(soon);
    await until(() => computed(live, "background-color") === rest);
    expect(computed(soon, "background-color"), "it washes under the pointer").toBe(rest);
    await userEvent.unhover(soon);
  });
});

describe("the nav gutter is the LEAF's too (§33, audit 2026-08-26)", () => {
  const MIXED: readonly TreeNode[] = [
    { id: "home", label: "Home", href: "/" },
    { id: "guides", label: "Guides", children: [{ id: "g1", label: "Intro", href: "/g1" }] },
  ];

  /** Where the row's WORDS start — a range over the label's own text node, because the row's
      own box starts at the same padding in both cases and the defect is entirely downstream
      of it. */
  const labelLeft = (row: HTMLElement): number => {
    const text = [...row.childNodes].find(
      (n): n is Text => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() !== "",
    );
    if (!text) throw new Error(`no label text node in "${row.textContent}"`);
    const range = document.createRange();
    range.selectNodeContents(text);
    return range.getBoundingClientRect().left;
  };

  it("a leaf and a section at ONE level share a left edge", () => {
    // The load-bearing fixture fact is that both rows are at level 1: the indent cannot
    // explain the difference, so what is left is the reserved glyph box the leaf was missing.
    const nav = mounted(<NavTree items={MIXED} />, { theme: {}, select: ".kui-tree-nav" });
    const rows = [...nav.querySelectorAll<HTMLElement>(".kui-tree-item")];
    const leaf = rows.find((r) => r.textContent === "Home")!;
    const section = rows.find((r) => r.textContent === "Guides")!;
    expect(
      parseFloat(computed(leaf, "padding-inline-start")),
      "the fixture's two rows are not at one level",
    ).toBeCloseTo(parseFloat(computed(section, "padding-inline-start")), 1);
    expect(labelLeft(leaf), "the leaf's label sits left of its section sibling's").toBeCloseTo(
      labelLeft(section),
      1,
    );
    // The box is KEPT and hidden, which is the mechanism — an absent glyph and a
    // `display: none` one would both leave the labels where the defect had them.
    const glyph = within(leaf, ".kui-tree-disclosure");
    expect(computed(glyph, "visibility")).toBe("hidden");
    expect(glyph.getBoundingClientRect().width).toBeCloseTo(
      within(section, ".kui-tree-disclosure").getBoundingClientRect().width,
      1,
    );
  });
});
