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

import { SIZES, computed, mounted, tokenOn } from "../../test/browser.tsx";
import { fontWeight } from "../../tokens/config.ts";
import { Box } from "../box/box.tsx";
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

  it("tightens with density, because the inset is layout-space (§12)", () => {
    const loose = mounted(<Fixture size="3" />, { theme: { density: "comfortable" } });
    const tight = mounted(<Fixture size="3" />, { theme: { density: "compact" } });
    const py = (el: HTMLElement) => parseFloat(computed(el.querySelector("td")!, "padding-top"));
    expect(py(tight)).toBeLessThan(py(loose));
  });
});

describe("hairlines and ink (§7, §15, §36)", () => {
  it("every row but the last is underlined in the Separator's colour", () => {
    const el = mounted(<Fixture />, { theme: {} });
    const separator = mounted(<Separator />, { theme: {} });
    const rows = Array.from(el.querySelectorAll<HTMLElement>("tr"));
    const under = (tr: HTMLElement) => tr.firstElementChild as HTMLElement;
    // The Separator IS the hairline (§7's edge order): its paint is the line's colour and its
    // block-size is the line's width, so both halves are read off it rather than a token name.
    for (const tr of rows.slice(0, -1)) {
      expect(computed(under(tr), "border-bottom-width")).toBe(computed(separator, "height"));
      expect(parseFloat(computed(under(tr), "border-bottom-width"))).toBeGreaterThan(0);
      expect(computed(under(tr), "border-bottom-color")).toBe(computed(separator, "background-color"));
    }
    expect(computed(under(rows.at(-1)!), "border-bottom-style")).toBe("none");
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
});
