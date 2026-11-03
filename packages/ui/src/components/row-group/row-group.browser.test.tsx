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
import { RowGroup } from "./row-group.tsx";

function Group(props: { size?: (typeof SIZES)[number] }) {
  return (
    <div style={{ inlineSize: "360px" }}>
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

  it("its rows answer no hover, because a fill that stops at a divider reads as a second box", () => {
    const root = mounted(<Group />, { theme: {} });
    for (const row of root.querySelectorAll<HTMLElement>(".kui-row")) {
      expect(row.hasAttribute("data-hover-lit"), "a row in a group answers hover").toBe(false);
    }
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
