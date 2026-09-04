/**
 * Table's laws, mounted (§11, §36).
 *
 * A static table's guarantees are mostly agreements: its hairline is the Separator's colour,
 * its header ink is the muted role a `Text emphasis="medium"` reads, its cell inset is the
 * layout-space pick the join publishes at each index, and its type step is the one a `Text`
 * at that step reads. The two claims with real weight are the ones a reader would assume: a
 * wide table scrolls INSIDE its own box rather than widening the page, and the last row draws
 * no line under itself.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, SIZES, computed, mounted, tokenOn } from "../../test/browser.tsx";
import { fontWeight } from "../../tokens/config.ts";
import { Box } from "../box/box.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { Separator } from "../separator/separator.tsx";
import { Text } from "../text/text.tsx";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table.tsx";

const PY = { "1": "2", "2": "3", "3": "4", "4": "5" } as const;
const PX = { "1": "3", "2": "4", "3": "5", "4": "6" } as const;

function Fixture(props: { size?: "1" | "2" | "3" | "4"; wide?: boolean; caption?: boolean }) {
  return (
    <Table size={props.size ?? "2"}>
      {props.caption ? <TableCaption>Invoices this month</TableCaption> : null}
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>{props.wide ? "INV-0001-" + "x".repeat(120) : "INV-0001"}</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell align="end">$250.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>INV-0002</TableCell>
          <TableCell>Pending</TableCell>
          <TableCell align="end">$150.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("a table is the semantic element in a scroller (§36)", () => {
  it("renders <table>, <thead>, <tbody>, <tr>, <th scope=col>, <td>, <caption>", () => {
    const el = mounted(<Fixture caption />, { theme: {} });
    expect(el.classList.contains("kui-table")).toBe(true);
    const table = el.querySelector("table")!;
    expect(table).not.toBeNull();
    expect(table.querySelector("thead")).not.toBeNull();
    expect(table.querySelector("tbody")).not.toBeNull();
    expect(table.querySelectorAll("tr").length).toBe(3);
    expect(table.querySelector("th")!.getAttribute("scope")).toBe("col");
    expect(table.querySelectorAll("td").length).toBe(6);
    expect(table.querySelector("caption")!.textContent).toBe("Invoices this month");
    expect(computed(table.querySelector("caption")!, "caption-side")).toBe("bottom");
  });

  it("the caption starts where the first column's text does", () => {
    /* THE NAME LINES UP WITH THE THING IT NAMES (2026-09-01, Kushagra: "table caption should be
       padded so that its visually inline with table item text"). It stated only the block inset,
       so it began at the table's own edge while every cell began one `--kui-tb-px` in —
       measured, x=196 under a first column starting at 222, which reads as a stray line of
       prose under the figure rather than as its name.

       AN AGREEMENT, not a number: the caption and the cell read the SAME published token, and a
       law that pinned a length would pass while the two drifted apart. Read as painted left
       edges rather than as declarations, since that is the thing that was wrong. Falsified by
       deleting the `padding-inline`, which puts the caption back at the table's own edge. */
    const el = mounted(<Fixture caption />, { theme: {} });
    const table = el.querySelector("table")!;
    const caption = table.querySelector("caption")!;
    const cell = table.querySelector("tbody td")!;
    const textStart = (node: Element) =>
      node.getBoundingClientRect().left + parseFloat(computed(node, "padding-left"));
    expect(parseFloat(computed(cell, "padding-left")), "no cell inset to line up with").toBeGreaterThan(0);
    expect(textStart(caption)).toBeCloseTo(textStart(cell), 1);
  });

  it("a wide table scrolls inside its own box — the room around it never widens", () => {
    // 240px of room, one unbreakable 120-character cell. Without the wrapper's scroll the
    // table would push its parent wide; with it, the parent holds and the wrapper scrolls.
    const box = mounted(
      <Box width="240px">
        <Fixture wide />
      </Box>,
      { theme: {} },
    );
    const wrapper = box.querySelector<HTMLElement>(".kui-table")!;
    expect(box.getBoundingClientRect().width).toBeCloseTo(240, 0);
    expect(wrapper.clientWidth).toBeLessThanOrEqual(240);
    expect(wrapper.scrollWidth, "the table did not overflow the wrapper").toBeGreaterThan(240);
    expect(computed(wrapper, "overflow-x")).toBe("auto");
  });

  it("the type refuses what a static table is not", () => {
    // @ts-expect-error — no margin prop on any component (first non-negotiable)
    void (<Table m="4" />);
    // @ts-expect-error — a table has no tone; a cell's words may
    void (<Table tone="accent" />);
    // @ts-expect-error — no emphasis: a table is not louder than the one beside it
    void (<Table emphasis="loud" />);
    // @ts-expect-error — align is a closed word, never a physical direction
    void (<TableCell align="left" />);
    expect(true).toBe(true);
  });
});

describe("the size join publishes the inset and the step (§4, §36)", () => {
  for (const size of SIZES) {
    it(`size ${size}: the cell inset is the layout-space pick and the step is Text's`, () => {
      const el = mounted(<Fixture size={size} />, { theme: {} });
      const text = mounted(<Text size={size}>x</Text>, { theme: {} });
      const td = el.querySelector<HTMLElement>("td")!;
      const th = el.querySelector<HTMLElement>("th")!;
      expect(computed(td, "padding-top")).toBe(tokenOn(el, `--layout-space-${PY[size]}`));
      expect(computed(td, "padding-left")).toBe(tokenOn(el, `--layout-space-${PX[size]}`));
      expect(computed(th, "padding-top")).toBe(computed(td, "padding-top"));
      expect(parseFloat(computed(td, "padding-top"))).toBeGreaterThan(0);
      expect(computed(td, "font-size")).toBe(computed(text, "font-size"));
      expect(computed(td, "line-height")).toBe(computed(text, "line-height"));
    });
  }

  it("tightens with density on BOTH axes, because the inset is layout-space (§12)", () => {
    // BOTH, and the audit's reason (2026-09-01): this read `padding-top` alone while the
    // per-size law above ran at the one density where `--layout-space-N` and `--space-N` are
    // identical at every index — so §36's stated choice of layout-space was proven for the
    // block inset and unread for the inline one. Demonstrated: pointing `--kui-tb-px` at
    // `--space-4` left the inline inset constant at 16px across compact and comfortable
    // (against a correct 12 and 24) with both laws green. A law about one axis of a two-axis
    // mechanism is half a law.
    const loose = mounted(<Fixture size="3" />, { theme: { density: "comfortable" } });
    const tight = mounted(<Fixture size="3" />, { theme: { density: "compact" } });
    const pad = (el: HTMLElement, side: "top" | "left") =>
      parseFloat(computed(el.querySelector("td")!, `padding-${side}`));
    expect(pad(tight, "top"), "the block inset tightens").toBeLessThan(pad(loose, "top"));
    expect(pad(tight, "left"), "and so does the inline one").toBeLessThan(pad(loose, "left"));
  });
});

describe("hairlines and ink (§7, §15, §36)", () => {
  it("every row but the last is underlined in the Separator's colour", () => {
    const el = mounted(<Fixture />, { theme: {} });
    const separator = mounted(<Separator />, { theme: {} });
    const rows = Array.from(el.querySelectorAll<HTMLElement>("tr"));
    // EVERY CELL OF THE ROW (ultracode audit 2026-09-01). It read `tr.firstElementChild` —
    // one cell of three — so a rule restoring the border on cells 2 and 3 of the last row
    // drew a visibly broken line under the table's bottom edge with the law green. A line is
    // a property of the ROW, and the fixture already has the columns to prove it.
    const cells = (tr: HTMLElement) => Array.from(tr.children) as HTMLElement[];
    // The Separator IS the hairline (§7's edge order): its paint is the line's colour and its
    // block-size is the line's width, so both halves are read off it rather than a token name.
    for (const tr of rows.slice(0, -1))
      for (const cell of cells(tr)) {
        expect(computed(cell, "border-bottom-width")).toBe(computed(separator, "height"));
        expect(parseFloat(computed(cell, "border-bottom-width"))).toBeGreaterThan(0);
        expect(computed(cell, "border-bottom-color")).toBe(computed(separator, "background-color"));
      }
    for (const cell of cells(rows.at(-1)!)) expect(computed(cell, "border-bottom-style")).toBe("none");
  });

  it("the header reads the muted role, the body reads the text role", () => {
    const el = mounted(<Fixture />, { theme: {} });
    const muted = mounted(<Text emphasis="medium">x</Text>, { theme: {} });
    const loud = mounted(<Text>x</Text>, { theme: {} });
    expect(computed(el.querySelector("th")!, "color")).toBe(computed(muted, "color"));
    expect(computed(el.querySelector("td")!, "color")).toBe(computed(loud, "color"));
    expect(computed(el.querySelector("th")!, "color")).not.toBe(computed(el.querySelector("td")!, "color"));
    expect(computed(el.querySelector("th")!, "font-weight")).toBe(String(fontWeight.medium));
  });

  it("align is a closed word and it lands on the head and the cell alike", () => {
    const el = mounted(<Fixture />, { theme: {} });
    const ths = el.querySelectorAll<HTMLElement>("th");
    const tds = el.querySelectorAll<HTMLElement>("td");
    expect(computed(ths[0]!, "text-align")).toBe("start");
    expect(computed(ths[2]!, "text-align")).toBe("end");
    expect(computed(tds[2]!, "text-align")).toBe("end");
  });

  it("and `center` is a value of that word, not a documented one nothing reads", () => {
    // `center` had two mentions in the whole component — the rule and the union member — and
    // none in this file, so deleting its rule left the suite green while a documented value of
    // a closed union computed `start` (ultracode audit 2026-09-01).
    const el = mounted(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead align="center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell align="center">Paid</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
      { theme: {} },
    );
    expect(computed(el.querySelector<HTMLElement>("th")!, "text-align")).toBe("center");
    expect(computed(el.querySelector<HTMLElement>("td")!, "text-align")).toBe("center");
  });

  it("the table's edge is the end, whichever section the last row is in", () => {
    // A raw `<tfoot>` is ordinary markup a caller can pass, and the rule read `tbody
    // tr:last-child` — the BODY's last row, not the table's — so a footer inverted the
    // sentence: no line between the body and the footer, and one under the table's own bottom
    // edge (ultracode audit 2026-09-01).
    const el = mounted(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Acme</TableCell>
          </TableRow>
        </TableBody>
        <tfoot>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </tfoot>
      </Table>,
      { theme: {} },
    );
    const [bodyRow, footRow] = Array.from(el.querySelectorAll<HTMLElement>("tr"));
    expect(
      parseFloat(computed(bodyRow!.firstElementChild as HTMLElement, "border-bottom-width")),
      "the body's last row still divides itself from the footer",
    ).toBeGreaterThan(0);
    expect(
      computed(footRow!.firstElementChild as HTMLElement, "border-bottom-style"),
      "and the table's own bottom edge draws nothing",
    ).toBe("none");
  });
});


/**
 * THE SCROLL REGION CAN BE NAMED (ultracode audit 2026-09-01).
 *
 * A box that scrolls is keyboard focusable in every current browser, which is WCAG 2.1.1 being
 * satisfied rather than a defect — but the wrapper's entire attribute set was
 * `["data-size", "class"]`, so Tab landed on a node CDP reports as `{role: "generic", ignored:
 * false}` with no name, and `aria-label` on `<Table>` rode the rest spread onto the `<table>`
 * where it could not name the thing the user had just reached. ScrollArea states this system's
 * rule verbatim one component over — "a tab stop with no name is announced as nothing" — and
 * this component hand-rolls a second scroll region.
 *
 * Both directions are read, because each fails on its own: the name has to REACH the wrapper,
 * and the `role` has to stay off it when there is no name to give (an unnamed region is a
 * landmark that says nothing).
 */
describe("the scroller is nameable, and unnamed it claims nothing (§36)", () => {
  it("a name reaches the WRAPPER, with the region role", () => {
    const el = mounted(
      <Table aria-label="Invoices">
        <TableBody>
          <TableRow>
            <TableCell>Acme</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
      { theme: {} },
    );
    expect(el.getAttribute("aria-label")).toBe("Invoices");
    expect(el.getAttribute("role")).toBe("region");
    // And not on the table, where it would name something that never takes focus.
    expect(el.querySelector("table")!.hasAttribute("aria-label")).toBe(false);
  });

  it("aria-labelledby reaches it too", () => {
    const el = mounted(
      <Table aria-labelledby="heading-id">
        <TableBody>
          <TableRow>
            <TableCell>Acme</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
      { theme: {} },
    );
    expect(el.getAttribute("aria-labelledby")).toBe("heading-id");
    expect(el.getAttribute("role")).toBe("region");
  });

  it("unnamed, it is a plain box — no role, no landmark", () => {
    const el = mounted(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Acme</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
      { theme: {} },
    );
    expect(el.hasAttribute("role")).toBe(false);
    expect(el.hasAttribute("aria-label")).toBe(false);
  });

  it("and it pads the focus ring it would otherwise clip", () => {
    // Declaring one overflow axis promotes the other to `auto`, so this box clips the BLOCK
    // axis — which cannot be scrolled to bring anything back. Read as the ring's own reach.
    const el = mounted(<Fixture size="1" />, { theme: { density: "compact" } });
    const reach =
      parseFloat(tokenOn(el, "--focus-ring-width")) + parseFloat(tokenOn(el, "--focus-ring-offset"));
    expect(parseFloat(computed(el, "padding-top"))).toBeCloseTo(reach, 1);
    expect(parseFloat(computed(el, "padding-bottom"))).toBeCloseTo(reach, 1);
  });
  /**
   * THE TWO SCROLLERS PAINT ONE THUMB (2026-09-04).
   *
   * A table scrolls natively — see `table.css` for the two measured reasons it is not a
   * ScrollArea — so the library draws a scroller two ways, and the only thing that keeps that
   * from being two appearances is that both read the same token. Asserting the declaration
   * says `var(--scrollbar-thumb)` would pass on a stylesheet where that token resolves to
   * anything at all, so this reads a MOUNTED ScrollArea's thumb and requires the table's
   * scrollbar to resolve the same colour.
   *
   * BOTH APPEARANCES, because the palette is where a pair like this comes apart.
   */
  it("its native scrollbar resolves the colour a ScrollArea's thumb paints", async () => {
    for (const appearance of APPEARANCES) {
      const table = mounted(<Fixture size="2" />, { theme: { appearance } });
      const area = mounted(
        // Genuinely overflowing, and read two frames later: Base UI renders no bar in the
        // mount commit — it measures the viewport first, which is `scroll-area`'s own
        // `laidOut` and the reason a synchronous read here found nothing at all.
        <ScrollArea style={{ height: "80px", width: "120px" }}>
          <div style={{ height: "600px", width: "600px" }} />
        </ScrollArea>,
        { theme: { appearance } },
      );
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const thumb = area.querySelector(".kui-scroll-thumb");
      expect(thumb, "no ScrollArea thumb to compare against").not.toBeNull();

      const painted = computed(thumb as HTMLElement, "background-color");
      // `scrollbar-color` computes as "<thumb> <track>"; the track is transparent because a
      // ScrollArea draws none.
      const [thumbColour, ...track] = computed(table, "scrollbar-color").split(") ");
      expect(`${thumbColour})`, `${appearance}: the table's thumb is not the system's`).toBe(
        painted,
      );
      expect(track.join(") "), `${appearance}: the table draws a track`).toMatch(
        /transparent|rgba\(0, 0, 0, 0\)/,
      );
      expect(computed(table, "scrollbar-width")).toBe("thin");
    }
  });
});
