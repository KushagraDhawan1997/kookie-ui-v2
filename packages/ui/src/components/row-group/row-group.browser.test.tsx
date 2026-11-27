/**
 * RowGroup's laws, mounted (2026-11-02).
 *
 * The claims a reader would otherwise take on trust: the label names the group, there is one
 * divider between each pair of rows and none at the ends, and the label, the dividers and the
 * rows' text all start on one column.
 */
import { describe, expect, it } from "vitest";

import { SIZES, mounted } from "../../test/browser.tsx";
import { Row } from "../row/row.tsx";
import { Switch } from "../switch/switch.tsx";
import { Field, FieldLabel } from "../field/field.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { RowGroup } from "./row-group.tsx";

function Group(props: { size?: (typeof SIZES)[number] }) {
  return (
    <div style={{ inlineSize: "100%", maxInlineSize: "360px" }}>
      <RowGroup label="Notifications" note="Only about your projects." {...(props.size ? { size: props.size } : {})}>
        <Row render={<label />} trailing={<Switch defaultChecked />} {...(props.size ? { size: props.size } : {})}>
          Email
        </Row>
        <Row render={<label />} trailing={<Switch />} {...(props.size ? { size: props.size } : {})}>
          Push
        </Row>
        <Row render={<label />} trailing={<Switch />} {...(props.size ? { size: props.size } : {})}>
          Weekly summary
        </Row>
      </RowGroup>
    </div>
  );
}

const textStart = (row: HTMLElement) => {
  const node = [...row.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())!;
  const range = document.createRange();
  range.selectNodeContents(node);
  return range.getBoundingClientRect().left;
};

describe("a grouped list", () => {
  it("is a group named by its label", () => {
    const root = mounted(<Group />, { theme: {} });
    const group = root.querySelector<HTMLElement>("[role='group']")!;
    const label = document.getElementById(group.getAttribute("aria-labelledby")!);
    expect(label?.textContent).toBe("Notifications");
  });

  it("draws one divider between each pair of rows, and none at the ends", () => {
    const root = mounted(<Group />, { theme: {} });
    const card = root.querySelector<HTMLElement>(".kui-row-group-rows")!;
    const kids = [...card.children];
    expect(kids.filter((k) => k.classList.contains("kui-separator"))).toHaveLength(2);
    expect(kids[0]!.classList.contains("kui-separator")).toBe(false);
    expect(kids.at(-1)!.classList.contains("kui-separator")).toBe(false);
  });

  it("its rows light on hover, and the fill is the whole row inside the box", () => {
    // 2026-11-27 (Kushagra: "The fill should not stop from edge, inside a pane, hover should be
    // edge to edge, no roundedness of its own"). The 2026-11-02 refusal was of a fill that
    // stopped short of the dividers and read as a second box; a fill that IS the row is not one.
    const root = mounted(<Group />, { theme: {} });
    const plate = root.querySelector<HTMLElement>(".kui-plate")!.getBoundingClientRect();
    const rows = [...root.querySelectorAll<HTMLElement>(".kui-row")];
    expect(rows.length).toBe(3);
    for (const row of rows) {
      expect(row.hasAttribute("data-hover-lit"), "a row in a group answers hover").toBe(true);
      const box = row.getBoundingClientRect();
      expect(Math.abs(box.left - plate.left), "the fill starts at the box's edge").toBeLessThan(1);
      expect(Math.abs(box.right - plate.right), "the fill ends at the box's edge").toBeLessThan(1);
      expect(getComputedStyle(row).borderTopLeftRadius, "no corner of its own").toBe("0px");
    }
    // The first row's fill reaches the box's top and the last row's its bottom, so the box's own
    // corner is what rounds them (it clips).
    expect(Math.abs(rows[0]!.getBoundingClientRect().top - plate.top)).toBeLessThan(2);
    expect(Math.abs(rows[2]!.getBoundingClientRect().bottom - plate.bottom)).toBeLessThan(2);
    expect(getComputedStyle(root.querySelector(".kui-plate")!).overflow).toContain("clip");
  });

  it("the trailing control ends as far from the box as the words start from it", () => {
    const root = mounted(<Group />, { theme: {} });
    const plate = root.querySelector<HTMLElement>(".kui-plate")!.getBoundingClientRect();
    const row = root.querySelector<HTMLElement>(".kui-row")!;
    const trailing = row.querySelector<HTMLElement>('[data-slot="trailing"]')!.getBoundingClientRect();
    expect(Math.abs(textStart(row) - plate.left - (plate.right - trailing.right))).toBeLessThan(1);
  });

  it.each(SIZES)("at size %s, the box sticks out past the words by what a text field's box does", (size) => {
    // 2026-11-27 (Kushagra, of a card that inset its words 36px from the page title: "Yes, and by
    // exact amount", then "as text fields"). Measured against a mounted Field, not a token.
    const root = mounted(
      <div style={{ inlineSize: "360px", paddingInline: "40px" }}>
        <Field size={size}>
          <FieldLabel>Name</FieldLabel>
          <TextField />
        </Field>
        <Group size={size} />
      </div>,
      { theme: {} },
    );
    const field = root.querySelector<HTMLElement>(".kui-field")!.getBoundingClientRect();
    const plate = root.querySelector<HTMLElement>(".kui-plate")!.getBoundingClientRect();
    expect(Math.abs(plate.left - field.left), "the left edges").toBeLessThan(1);
    expect(Math.abs(plate.right - field.right), "the right edges").toBeLessThan(1);
    const label = document.createRange();
    label.selectNodeContents(root.querySelector("label")!);
    expect(Math.abs(textStart(root.querySelector<HTMLElement>(".kui-row")!) - label.getBoundingClientRect().left), "the words").toBeLessThan(1);
    // No shadow, and the system's line for an edge: a box of rows on the page, not a card.
    const style = getComputedStyle(root.querySelector(".kui-plate")!);
    expect(style.boxShadow.replace(/rgba\(0, 0, 0, 0\) 0px 0px 0px 0px,? ?/g, "")).toBe("");
  });

  it("the label and the note keep a field's own distance from the box", () => {
    const root = mounted(
      <div style={{ inlineSize: "360px", paddingInline: "40px" }}>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <TextField />
        </Field>
        <Group />
      </div>,
      { theme: {} },
    );
    const fieldGap =
      root.querySelector<HTMLElement>(".kui-field")!.getBoundingClientRect().top -
      root.querySelector("label")!.getBoundingClientRect().bottom;
    const plate = root.querySelector<HTMLElement>(".kui-plate")!.getBoundingClientRect();
    const label = root.querySelector<HTMLElement>(".kui-row-group-label")!.getBoundingClientRect();
    const note = root.querySelector<HTMLElement>(".kui-row-group-note")!.getBoundingClientRect();
    expect(Math.abs(plate.top - label.bottom - fieldGap), "label to box").toBeLessThan(1);
    expect(Math.abs(note.top - plate.bottom - fieldGap), "box to note").toBeLessThan(1);
  });

  it.each(SIZES)("at size %s, the label, the dividers and the rows' text share one column", (size) => {
    const root = mounted(<Group size={size} />, { theme: {} });
    const rows = [...root.querySelectorAll<HTMLElement>(".kui-row")];
    const column = textStart(rows[0]!);
    for (const row of rows) expect(Math.abs(textStart(row) - column), "a row's text").toBeLessThan(1);
    for (const divider of root.querySelectorAll<HTMLElement>(".kui-row-group-divider")) {
      expect(Math.abs(divider.getBoundingClientRect().left - column), "a divider").toBeLessThan(1);
    }
    const label = root.querySelector<HTMLElement>(".kui-row-group-label")!;
    const labelText = document.createRange();
    labelText.selectNodeContents(label);
    expect(Math.abs(labelText.getBoundingClientRect().left - column), "the label").toBeLessThan(1);
  });
});
