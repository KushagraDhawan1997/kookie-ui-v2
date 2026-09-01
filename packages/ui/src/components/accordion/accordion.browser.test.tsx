/**
 * Accordion's laws, mounted (§11, §37).
 *
 * The trigger is a row-family member, so its laws are AGREEMENTS with a mounted Button at
 * the same index (the height ladder — a standing row rides it) and with the row family's own
 * quiet rest. What is the accordion's alone: the panel's words start under the trigger's
 * label at every index (the join publishes the row's own pick), the hairline between items
 * is the Separator's, the chevron turns when the panel opens, and one-open is the default
 * with `multiple` opening many.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { SIZES, computed, inMotion, mounted, until } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Separator } from "../separator/separator.tsx";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "./accordion.tsx";

function Fixture(props: { size?: "1" | "2" | "3" | "4"; multiple?: boolean; open?: boolean; keepMounted?: boolean }) {
  return (
    <Accordion
      {...(props.size ? { size: props.size } : {})}
      {...(props.multiple ? { multiple: true } : {})}
      {...(props.keepMounted ? { keepMounted: true } : {})}
      {...(props.open ? { defaultValue: ["a"] } : {})}
    >
      <AccordionItem value="a">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionPanel>Orders ship within two days.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionPanel>Thirty days, no questions.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

const triggersOf = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>(".kui-accordion-trigger"));
const openPanels = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(".kui-accordion-panel")).filter((p) => !p.hidden);

describe("the trigger is a row standing on the height ladder (§21, §37)", () => {
  it("is a heading holding a button that announces its panel", () => {
    const root = mounted(<Fixture open />, { theme: {} });
    const trigger = triggersOf(root)[0]!;
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.parentElement!.tagName).toBe("H3");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(root.querySelector(".kui-accordion-panel")!.id);
    expect(trigger.classList.contains("kui-row")).toBe(true);
    expect(trigger.getAttribute("data-emphasis")).toBe("quiet");
  });

  it("the heading level follows the outline when asked", () => {
    const root = mounted(
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger headingLevel={2}>Shipping</AccordionTrigger>
          <AccordionPanel>x</AccordionPanel>
        </AccordionItem>
      </Accordion>,
      { theme: {} },
    );
    expect(triggersOf(root)[0]!.parentElement!.tagName).toBe("H2");
  });

  for (const size of SIZES) {
    it(`size ${size}: the row stands level with a Button, and the panel's words start under its label`, () => {
      const root = mounted(<Fixture size={size} open />, { theme: {} });
      const button = mounted(<Button size={size}>x</Button>, { theme: {} });
      const trigger = triggersOf(root)[0]!;
      expect(computed(trigger, "min-height")).toBe(computed(button, "min-height"));
      expect(computed(trigger, "font-size")).toBe(computed(button, "font-size"));
      expect(trigger.getBoundingClientRect().width).toBeCloseTo(root.getBoundingClientRect().width, 0);
      // The panel body's inline inset IS the row's — read as computed padding on both.
      const body = root.querySelector<HTMLElement>(".kui-accordion-panel-body")!;
      expect(computed(body, "padding-left")).toBe(computed(trigger, "padding-left"));
      expect(parseFloat(computed(body, "padding-left"))).toBeGreaterThan(0);
      expect(parseFloat(computed(body, "padding-bottom"))).toBeGreaterThan(0);
      // The section breathes between its hairline and its row (2026-09-01): the item pads by
      // the join's layout-space pick while the ROW stays on the ladder — air, not box.
      const item = root.querySelector<HTMLElement>(".kui-accordion-item")!;
      expect(computed(item, "padding-top")).toBe(computed(item, "padding-bottom"));
      expect(parseFloat(computed(item, "padding-top"))).toBeGreaterThan(0);
    });
  }

  it("the inset agreement holds at radius=full too, where the row pads for the pill", () => {
    const root = mounted(<Fixture size="3" open />, { theme: { radius: "full" } });
    const medium = mounted(<Fixture size="3" open />, { theme: { radius: "medium" } });
    const body = root.querySelector<HTMLElement>(".kui-accordion-panel-body")!;
    const trigger = triggersOf(root)[0]!;
    expect(computed(body, "padding-left")).toBe(computed(trigger, "padding-left"));
    // And full really does pad wider — or the agreement above was tested at an identity.
    expect(parseFloat(computed(trigger, "padding-left"))).toBeGreaterThan(
      parseFloat(computed(triggersOf(medium)[0]!, "padding-left")),
    );
  });

  it("items are separated by the Separator's hairline, and the first has none above it", () => {
    const root = mounted(<Fixture />, { theme: {} });
    const separator = mounted(<Separator />, { theme: {} });
    const items = Array.from(root.querySelectorAll<HTMLElement>(".kui-accordion-item"));
    expect(computed(items[0]!, "border-top-style")).toBe("none");
    expect(computed(items[1]!, "border-top-width")).toBe(computed(separator, "height"));
    expect(computed(items[1]!, "border-top-color")).toBe(computed(separator, "background-color"));
  });

  it("paints no pane of its own", () => {
    const root = mounted(<Fixture />, { theme: {} });
    expect(computed(root, "background-color")).toBe("rgba(0, 0, 0, 0)");
    expect(computed(root, "box-shadow")).toBe("none");
  });
});

describe("the machine: one open by default, many with multiple, and the chevron turns (§37)", () => {
  it("opens on press, closes the other, and the chevron turns down", async () => {
    const root = mounted(<Fixture />, { theme: {} });
    const [a, b] = triggersOf(root);
    const chevron = a!.querySelector<HTMLElement>(".kui-accordion-chevron")!;
    expect(openPanels(root).length).toBe(0);
    expect(computed(chevron, "rotate")).toBe("0deg");
    await userEvent.click(a!);
    await until(() => a!.getAttribute("aria-expanded") === "true");
    expect(openPanels(root).length).toBe(1);
    expect(a!.hasAttribute("data-panel-open")).toBe(true);
    // `until` resolves false on timeout rather than throwing — the assertion after it is the
    // law (the first spelling had none, and deleting the turn left the suite green).
    await until(() => computed(chevron, "rotate") === "90deg");
    expect(computed(chevron, "rotate")).toBe("90deg");
    await userEvent.click(b!);
    await until(() => b!.getAttribute("aria-expanded") === "true");
    await until(() => a!.getAttribute("aria-expanded") === "false");
    expect(openPanels(root).length).toBe(1);
  });

  it("multiple lets two stay open", async () => {
    const root = mounted(<Fixture multiple />, { theme: {} });
    const [a, b] = triggersOf(root);
    await userEvent.click(a!);
    await until(() => a!.getAttribute("aria-expanded") === "true");
    await userEvent.click(b!);
    await until(() => b!.getAttribute("aria-expanded") === "true");
    expect(a!.getAttribute("aria-expanded")).toBe("true");
    expect(openPanels(root).length).toBe(2);
  });

  it("a closed panel is not in the tree — and with keepMounted it is there, hidden", () => {
    const gone = mounted(<Fixture />, { theme: {} });
    expect(gone.querySelector(".kui-accordion-panel")).toBeNull();
    const kept = mounted(<Fixture keepMounted />, { theme: {} });
    const panel = kept.querySelector<HTMLElement>(".kui-accordion-panel")!;
    expect(panel).not.toBeNull();
    expect(panel.hidden).toBe(true);
  });

  it("the panel travels by height on the spring, clipped", async () => {
    // The harness stills every clock by default; this law is about the clock, so it opts in.
    inMotion();
    const root = mounted(<Fixture />, { theme: {} });
    const [a] = triggersOf(root);
    await userEvent.click(a!);
    await until(() => root.querySelector(".kui-accordion-panel") !== null);
    const panel = root.querySelector<HTMLElement>(".kui-accordion-panel")!;
    expect(computed(panel, "overflow-x")).toBe("clip");
    expect(computed(panel, "transition-property")).toContain("block-size");
    expect(computed(panel, "transition-timing-function")).toContain("linear(");
    await until(() => parseFloat(computed(panel, "height")) > 0);
  });

  it("the type refuses what the machine already owns", () => {
    // @ts-expect-error — no margin prop on any component (first non-negotiable)
    void (<Accordion m="4" />);
    // @ts-expect-error — the axis is vertical; a horizontal accordion is a different thing
    void (<Accordion orientation="horizontal" />);
    // @ts-expect-error — the trigger is a row: no render, its element is the machine's
    void (<AccordionTrigger render={<a />} />);
    // @ts-expect-error — no tone: a heading list has no meaning of its own to colour
    void (<Accordion tone="accent" />);
    expect(true).toBe(true);
  });
});
