/**
 * Accordion's laws, mounted (§11, §37).
 *
 * The trigger wears the control skeleton (not a row — 2026-09-01), so its laws are AGREEMENTS
 * with a mounted Button at the same index (the height ladder) and with the control family's own
 * quiet rest. What is the accordion's alone: the panel's words start under the trigger's
 * label at every index (the join publishes the row's own pick), the hairline between items
 * is the Separator's, the chevron turns when the panel opens, and one-open is the default
 * with `multiple` opening many.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { SIZES, computed, inMotion, mounted, tokenOn, until } from "../../test/browser.tsx";
import { Badge } from "../badge/badge.tsx";
import { Button } from "../button/button.tsx";
import { Separator } from "../separator/separator.tsx";
import { Text } from "../text/text.tsx";
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
      {/* THREE, so that an INTERIOR section exists (2026-09-01). With two, every item is both
          the first and the last, and a rule about where the air goes cannot be told from a
          rule that puts it everywhere. */}
      <AccordionItem value="c">
        <AccordionTrigger>Warranty</AccordionTrigger>
        <AccordionPanel>Two years on every part.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

/** The join's block pick per index (surfaces.css), as layout-space steps. */
const AC_PY = { "1": "2", "2": "3", "3": "4", "4": "5" } as const;

const triggersOf = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>(".kui-accordion-trigger"));
const openPanels = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(".kui-accordion-panel")).filter((p) => !p.hidden);

describe("the trigger is a heading on the height ladder — a control, not a row (§37)", () => {
  it("is a heading holding a button that announces its panel", () => {
    const root = mounted(<Fixture open />, { theme: {} });
    const trigger = triggersOf(root)[0]!;
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.parentElement!.tagName).toBe("H3");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(root.querySelector(".kui-accordion-panel")!.id);
    // A control, NOT a row (2026-09-01, Kushagra: "is it a row tho?"): a heading you press
    // is not a line you pick, so it neither wears the row class nor asks for the row's light.
    expect(trigger.classList.contains("kui-control")).toBe(true);
    expect(trigger.classList.contains("kui-row")).toBe(false);
    expect(trigger.hasAttribute("data-hover-lit")).toBe(false);
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
      // A heading, not a list line (2026-09-01): it wears Button's weight, and ranks above the
      // panel's words, which read at the same step in the full ink.
      expect(computed(trigger, "font-weight")).toBe(computed(button, "font-weight"));
      const words = root.querySelector<HTMLElement>(".kui-accordion-panel-body")!;
      expect(parseInt(computed(trigger, "font-weight"))).toBeGreaterThan(parseInt(computed(words, "font-weight")));
      expect(trigger.getBoundingClientRect().width).toBeCloseTo(root.getBoundingClientRect().width, 0);
      // The panel body's inline inset IS the row's — read as computed padding on both.
      const body = root.querySelector<HTMLElement>(".kui-accordion-panel-body")!;
      expect(computed(body, "padding-left")).toBe(computed(trigger, "padding-left"));
      expect(parseFloat(computed(body, "padding-left"))).toBeGreaterThan(0);
      expect(parseFloat(computed(body, "padding-bottom"))).toBeGreaterThan(0);
      // THE AIR IS BESIDE A HAIRLINE, AND ONLY THERE (2026-09-01; the assertion rewritten the
      // same day by the ultracode audit). The first spelling read `padding-top === padding-
      // bottom` on one item, which is the two longhands of a single `padding-block`
      // declaration: no value of it, and no missing declaration, could make them differ — the
      // degenerate-fixture rule in one line. It is read against the JOIN's own pick now, and
      // at both ends of the list, where the answers genuinely differ: an interior section
      // breathes on both sides of the line it sits under, and the outer ends of the list carry
      // nothing, because there is no hairline there to breathe from.
      const items = Array.from(root.querySelectorAll<HTMLElement>(".kui-accordion-item"));
      const pick = tokenOn(root, `--layout-space-${AC_PY[size]}`);
      expect(computed(items[1]!, "padding-top"), "an interior section breathes above").toBe(pick);
      expect(computed(items[1]!, "padding-bottom"), "and below").toBe(pick);
      expect(parseFloat(pick)).toBeGreaterThan(0);
      expect(computed(items[0]!, "padding-top"), "the list's first end carries no air").toBe("0px");
      expect(computed(items.at(-1)!, "padding-bottom"), "nor its last").toBe("0px");
    });
  }

  it("a heading that WRAPS still breathes — the padding the row family used to supply", () => {
    // The fix and its law both exist because leaving the row family took this away silently
    // (ultracode audit 2026-09-01): `.kui-row` declared the block padding, `.kui-control`
    // declares `var(--kui-ct-py, 0)` and nothing in the package declares that stem for a
    // button, so the trigger computed `0px/0px`. On ONE line the ladder's `min-height` binds
    // and the flex centring absorbs it, which is why nothing saw it — so the fixture has to be
    // a heading that actually wraps, or it is a law about the case that was never broken.
    const host = mounted(
      <div style={{ width: 220 }}>
        <Accordion>
          <AccordionItem value="a">
            <AccordionTrigger>
              Returns, exchanges and the warranty on every replacement part we ship
            </AccordionTrigger>
            <AccordionPanel>b</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>,
      { theme: {} },
    );
    const trigger = host.querySelector<HTMLElement>(".kui-accordion-trigger")!;
    const line = parseFloat(computed(trigger, "line-height"));
    const lines = Math.round((trigger.getBoundingClientRect().height - 2) / line);
    expect(lines, "the fixture must actually wrap, or this law is about a one-line heading").toBeGreaterThan(1);
    const pad = parseFloat(computed(trigger, "padding-top"));
    expect(pad, "a wrapped heading is not flush against its own border box").toBeGreaterThan(0);
    expect(computed(trigger, "padding-bottom")).toBe(computed(trigger, "padding-top"));
    // The box is its lines PLUS that air, which is what says the padding is real rather than
    // absorbed by the ladder as it is on one line.
    expect(trigger.getBoundingClientRect().height).toBeCloseTo(lines * line + 2 * pad + 2, 0);
  });

  it("a second child in a heading packs beside the label — only the chevron is pushed", () => {
    // `justify-content: space-between` is "label at one end, chevron at the other" only while
    // the heading holds exactly two flex items, and the row family's auto margin on the
    // trailing slot — which spends the free space before `justify-content` ever sees it — left
    // with `.kui-row` (ultracode audit 2026-09-01). Measured: a Badge after the word sat
    // 172.75px into a 320px heading, floating in the middle of it. Nothing in the type says a
    // heading holds one child.
    const host = mounted(
      <div style={{ width: 320 }}>
        <Accordion>
          <AccordionItem value="a">
            <AccordionTrigger>
              Returns <Badge tone="accent">3</Badge>
            </AccordionTrigger>
            <AccordionPanel>b</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>,
      { theme: {} },
    );
    const trigger = host.querySelector<HTMLElement>(".kui-accordion-trigger")!;
    const badge = host.querySelector<HTMLElement>(".kui-badge")!;
    const chevron = host.querySelector<HTMLElement>(".kui-accordion-disclosure")!;
    const box = trigger.getBoundingClientRect();
    const fromStart = badge.getBoundingClientRect().left - box.left;
    // Nearer the words than the far end: the free space belongs to the chevron's margin.
    expect(fromStart, "the badge floats in the middle of the heading").toBeLessThan(box.width / 3);
    expect(
      box.right - chevron.getBoundingClientRect().right,
      "and the chevron is still at the far end",
    ).toBeLessThan(box.width / 8);
  });

  it("a dead heading's chevron recedes with its label", () => {
    // The glyph names a tone-LESS role directly and the shared remap rewrites `--tone-*`, so
    // it could not reach: measured, a disabled item's label went full ink -> dim and its cursor
    // went `default` while the chevron stayed byte-identical (ultracode audit 2026-09-01). Read
    // as the relationship — dead differs from live, and matches what the label does — rather
    // than against a colour literal, which would pass for an invented grey too.
    const live = mounted(<Fixture />, { theme: {} });
    const dead = mounted(
      <Accordion>
        <AccordionItem value="a" disabled>
          <AccordionTrigger>Shipping</AccordionTrigger>
          <AccordionPanel>b</AccordionPanel>
        </AccordionItem>
      </Accordion>,
      { theme: {} },
    );
    const chevron = (root: HTMLElement) =>
      computed(root.querySelector<HTMLElement>(".kui-accordion-disclosure")!, "color");
    const label = (root: HTMLElement) => computed(triggersOf(root)[0]!, "color");
    expect(label(dead), "the label recedes").not.toBe(label(live));
    expect(chevron(dead), "and so does the glyph beside it").not.toBe(chevron(live));
  });

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

  it("under the pointer the label underlines and the box does not fill — Link's hover, not a row's", async () => {
    // The fill light is what a row does because a row is picked from a list; a heading is
    // not, so its hover is the label's (2026-09-01). Read as the two computed values that
    // could each be wrong: the fill must stay transparent, and the underline must take the ink.
    const root = mounted(<Fixture />, { theme: {} });
    const trigger = triggersOf(root)[0]!;
    const ink = computed(trigger, "color");
    expect(computed(trigger, "background-color")).toBe("rgba(0, 0, 0, 0)");
    expect(computed(trigger, "text-decoration-line")).toBe("underline");
    expect(computed(trigger, "text-decoration-color")).toBe("rgba(0, 0, 0, 0)");
    await userEvent.hover(trigger);
    await until(() => computed(trigger, "text-decoration-color") === ink);
    expect(computed(trigger, "text-decoration-color")).toBe(ink);
    expect(computed(trigger, "background-color")).toBe("rgba(0, 0, 0, 0)");
    await userEvent.unhover(trigger);
  });

  it("fills its container, whatever is open — the extent is the container's, never a panel's", () => {
    // Inside a flex ROW (the shape the playground and any toolbar-like composition put it in)
    // a flex column shrink-wraps its widest child, so the list breathed with whichever panel
    // was open (2026-09-01, Kushagra). Table's answer, law-read in the arrangement that fails.
    const host = mounted(
      <div style={{ display: "flex", width: 480 }}>
        <Fixture />
      </div>,
      { theme: {} },
    );
    const root = host.querySelector<HTMLElement>(".kui-accordion")!;
    expect(root.getBoundingClientRect().width).toBeCloseTo(480, 0);

    // WITH A PANEL OPEN, WHICH IS THE HALF THE TITLE NAMES (ultracode audit 2026-09-01). Both
    // fixtures were CLOSED accordions, so the reported symptom — the list breathing with
    // whichever panel is open — was read by nothing: a regression in which an open panel
    // widened the list would have left both numbers at 480. The panel holds an unbreakable
    // run, which is the content that would widen it if anything could.
    const opened = mounted(
      <div style={{ display: "flex", width: 480 }}>
        <Accordion defaultValue={["a"]}>
          <AccordionItem value="a">
            <AccordionTrigger>Aa</AccordionTrigger>
            <AccordionPanel>https://example.com/a/very/long/unbreakable/path/that/exceeds/the/box</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>,
      { theme: {} },
    );
    expect(
      opened.querySelector<HTMLElement>(".kui-accordion")!.getBoundingClientRect().width,
      "an open panel does not widen the list",
    ).toBeCloseTo(480, 0);

    const closed = mounted(
      <div style={{ display: "flex", width: 480 }}>
        <Accordion>
          <AccordionItem value="a">
            <AccordionTrigger>Aa</AccordionTrigger>
            <AccordionPanel>Short</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>,
      { theme: {} },
    );
    expect(closed.querySelector<HTMLElement>(".kui-accordion")!.getBoundingClientRect().width).toBeCloseTo(480, 0);
  });

  for (const size of SIZES) {
    it(`size ${size}: the panel's plain words take the heading's own step`, () => {
      // "The expanded text doesnt respond to size" (2026-09-01): the body wears the type join
      // at the identity step, so words written straight into the panel scale with the section.
      const root = mounted(<Fixture size={size} open />, { theme: {} });
      const text = mounted(<Text size={size}>x</Text>, { theme: {} });
      const body = root.querySelector<HTMLElement>(".kui-accordion-panel-body")!;
      expect(computed(body, "font-size")).toBe(computed(text, "font-size"));
      expect(computed(body, "line-height")).toBe(computed(text, "line-height"));
    });
  }

  it("items are separated by the Separator's hairline, inset to the labels, and the first has none above it", () => {
    const root = mounted(<Fixture />, { theme: {} });
    const separator = mounted(<Separator />, { theme: {} });
    const items = Array.from(root.querySelectorAll<HTMLElement>(".kui-accordion-item"));
    expect(getComputedStyle(items[0]!, "::before").content).toBe("none");
    const line = getComputedStyle(items[1]!, "::before");
    expect(line.height).toBe(computed(separator, "height"));
    expect(line.backgroundColor).toBe(computed(separator, "background-color"));
    // The line divides the LABELS (2026-09-01, the menu's sentence): it starts where the
    // row's text starts and ends where it ends, while the row's own light keeps the full box.
    const trigger = triggersOf(root)[1]!;
    // EACH END AGAINST ITS OWN SIDE (rewritten 2026-09-01 by the ultracode audit). It asserted
    // the two ends were EQUAL, under a comment calling them "the same text inset" — and they
    // are not the same inset: the skeleton resets the trailing padding to the plain pick for
    // any control holding a `[data-slot="trailing"]`, which every heading here does, so one
    // value ended the line 3px inside the chevron it is meant to end level with. The line
    // divides the row's CONTENT, so each end is read against the padding that side wears.
    expect(line.left).toBe(computed(trigger, "padding-left"));
    expect(line.right).toBe(computed(trigger, "padding-right"));
    expect(parseFloat(line.left)).toBeGreaterThan(0);
    expect(parseFloat(line.right)).toBeGreaterThan(0);
    // And they really are different numbers at the default radius, or the law above would be
    // one assertion wearing two.
    expect(line.right).not.toBe(line.left);
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

    // AND THE TRAVEL IS ASSERTED, WHICH IT WAS NOT (ultracode audit 2026-09-01). This law
    // ended in a bare `await until(...)`, and `until` resolves FALSE on timeout — so the one
    // claim in its title was held by nothing, while its three surviving assertions read
    // DECLARATIONS that persist whether or not the box ever moves. Demonstrated: with
    // `block-size: 0 !important` on the panel the law ran green with a rendered height of
    // `0px`. The same file documents the repair of this exact defect 39 lines above.
    //
    // Two heights, sampled, and a growth between them: a snap-open (what a missing
    // `--accordion-panel-height` produces, since Chrome will not interpolate `0 -> auto`) has
    // no in-between, and a frozen panel has no growth at all.
    const heights: number[] = [];
    for (let i = 0; i < 40; i++) {
      heights.push(parseFloat(computed(panel, "height")));
      if (heights.length > 3 && heights.at(-1) === heights.at(-2)) break;
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
    const grew = heights.at(-1)! - heights[0]!;
    expect(grew, "the panel has to actually open").toBeGreaterThan(4);
    expect(
      heights.some((h) => h > 0 && h < heights.at(-1)! - 1),
      "and it has to pass through the middle — a snap is not a travel",
    ).toBe(true);
  });

  it("the heading eases on every channel the skeleton does, plus its own underline", () => {
    // DERIVED FROM A BUTTON'S, never restated here (ultracode audit 2026-09-01, the
    // exit-channel lesson of 2026-08-16 one layer down). `transition` is a shorthand and this
    // component states one, so it replaces the skeleton's whole list rather than adding to it:
    // measured, the trigger computed `text-decoration-color / 0.12s` where a Button computes
    // five channels — the heading's ink had stopped easing on any state change at all. The law
    // reads the Button's list and requires every one of its channels here, so a channel dropped
    // from the copy fails without anyone remembering to update a literal.
    inMotion();
    const root = mounted(<Fixture />, { theme: {} });
    const button = mounted(<Button size="2">x</Button>, { theme: {} });
    const trigger = triggersOf(root)[0]!;
    const channels = (el: HTMLElement) =>
      computed(el, "transition-property")
        .split(",")
        .map((c) => c.trim());
    for (const channel of channels(button)) {
      expect(channels(trigger), `the heading dropped the skeleton's ${channel}`).toContain(channel);
    }
    expect(channels(trigger), "and it adds its own").toContain("text-decoration-color");
  });

  it("the type refuses what the machine already owns", () => {
    // @ts-expect-error — no margin prop on any component (first non-negotiable)
    void (<Accordion m="4" />);
    // @ts-expect-error — the axis is vertical; a horizontal accordion is a different thing
    void (<Accordion orientation="horizontal" />);
    // @ts-expect-error — the trigger has no render: its element is the machine's
    void (<AccordionTrigger render={<a />} />);
    // @ts-expect-error — no tone: a heading list has no meaning of its own to colour
    void (<Accordion tone="accent" />);
    expect(true).toBe(true);
  });
});
