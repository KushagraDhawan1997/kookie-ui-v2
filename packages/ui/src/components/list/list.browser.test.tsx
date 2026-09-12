/**
 * List's laws, mounted (§15).
 *
 * The component's claim is that it is `Text` plus three things — an indent, the rhythm between
 * items, and the marker's ink — so the first block is written as an AGREEMENT with a mounted
 * `Text` at the same step wherever the claim is "nothing changed". A restated literal there
 * would go green on a list that had quietly grown type behaviour of its own, which is the shape
 * this repo keeps finding.
 *
 * The rest of the file is the three additions, and every one of them is a claim the 2026-09-12
 * audit found FALSE in the values this component inherited from the docs' hand-drawn
 * `.kd-list`: the indent held a marker at one step and let it hang at every other one, the
 * faint rung was argued for bullets and was painting numbers, the nesting rule was a descendant
 * selector reaching into layouts, nesting itself was detected by a React context that crosses a
 * portal, and a nested list stating a tone dropped its parent's rung. Each law below is
 * therefore written to fail against the value that shipped, not merely to describe the value
 * that replaced it.
 */
import { describe, expect, it } from "vitest";
import * as React from "react";

import {
  APPEARANCES,
  DENSITIES,
  colorOn,
  computed,
  mounted,
  render,
  settleAll,
  tokenOn,
} from "../../test/browser.tsx";
import { RUNGS, componentAxes } from "../../system/axes.ts";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import { Box } from "../box/box.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover.tsx";
import { Stack } from "../stack/stack.tsx";
import { Text, type TypeSize, type Weight } from "../text/text.tsx";
import { List, ListItem } from "./list.tsx";

/* THE AXIS LISTS COME FROM THEIR SINGLE HOMES (2026-08-16). Fourteen law files once carried
   their own copy of an axis's values, every one of which would have kept passing the day the
   axis widened. `componentAxes.typeSize` derives from the ramp itself and `RUNGS` is the
   emphasis ladder's own list; the cast is only the `.map` widening `text.tsx` documents. */
const STEPS = componentAxes.typeSize as readonly TypeSize[];
const WEIGHTS = componentAxes.weight as readonly Weight[];

/**
 * THE ROOM THE BROWSER RESERVES FOR A MARKER — measured, never reconstructed.
 *
 * A `::marker` has no box to call `getBoundingClientRect` on, and rebuilding its width from the
 * font metrics would be this repo's own forbidden move: an instrument that redoes the
 * arithmetic under test agrees with it by construction (`targetBox()`, audit 2026-08-06).
 * `list-style-position: inside` lays the SAME marker as an inline box at the start of the
 * item's first line instead of painting it in the room to the left, so the item's first word
 * moves right by exactly the marker's inline size. Two identical lists, one switched, and the
 * difference between where the word starts is the marker.
 *
 * CALIBRATED BEFORE IT WAS TRUSTED, against a source that is not this file: it answers 1.375em
 * for a disc at step 3 and 1.76em for "10.", against the 1.34–1.43em and 1.50–1.84em that
 * `list.css` recorded from its own independent measurement of the same browser. An instrument
 * is calibrated against a known answer before its output is evidence (2026-08-08).
 */
function markerRoom(opts: { ordered?: boolean; size: TypeSize; theme?: ThemeProps }): {
  reserved: number;
  indent: number;
  font: number;
  list: HTMLElement;
  item: HTMLElement;
} {
  const theme = opts.theme ?? {};
  const build = (inside: boolean) => {
    const style = inside ? { listStylePosition: "inside" as const } : undefined;
    return mounted(
      opts.ordered ? (
        // `start={10}` is the two-digit number this component promises to hold — the widest
        // marker an ordered list draws before it stops being prose (list.css).
        <List ordered start={10} size={opts.size} {...(style ? { style } : {})}>
          <ListItem>
            <span data-probe>x</span>
          </ListItem>
        </List>
      ) : (
        <List size={opts.size} {...(style ? { style } : {})}>
          <ListItem>
            <span data-probe>x</span>
          </ListItem>
        </List>
      ),
      { theme },
    );
  };
  const outside = build(false);
  const inside = build(true);
  const wordStart = (el: HTMLElement) =>
    el.querySelector<HTMLElement>("[data-probe]")!.getBoundingClientRect().left;
  return {
    reserved: wordStart(inside) - wordStart(outside),
    indent: parseFloat(computed(outside, "padding-inline-start")),
    font: parseFloat(computed(outside, "font-size")),
    list: outside,
    item: outside.querySelector<HTMLElement>("li")!,
  };
}

/** The marker's own paint, which is the only place an ordered list's numbers can be read: they
    are a pseudo-element, and the accessibility tree exposes them as text ("9. "). */
const markerColor = (item: Element): string => getComputedStyle(item, "::marker").color;

describe("it reads exactly as Text reads — the type layer does all of it (§15)", () => {
  it("the ramp, the weights and the family are the shared layer's, at every step", () => {
    for (const size of STEPS) {
      for (const ordered of [false, true]) {
        const list = mounted(
          ordered ? (
            <List ordered size={size}>
              <ListItem>a</ListItem>
            </List>
          ) : (
            <List size={size}>
              <ListItem>a</ListItem>
            </List>
          ),
          { theme: {} },
        );
        const text = mounted(<Text size={size}>a</Text>, { theme: {} });
        for (const prop of ["font-size", "line-height", "letter-spacing", "font-family"]) {
          expect(
            computed(list, prop),
            `${ordered ? "ol" : "ul"} size ${size}: ${prop} diverged from Text`,
          ).toBe(computed(text, prop));
        }
      }
    }
    // The steps are genuinely different, so the equalities above are not holding trivially.
    const one = mounted(<List size="1">{<ListItem>a</ListItem>}</List>, { theme: {} });
    const nine = mounted(<List size="9">{<ListItem>a</ListItem>}</List>, { theme: {} });
    expect(computed(one, "font-size")).not.toBe(computed(nine, "font-size"));
  });

  it("it rests at step 3 like Text and Blockquote, and states it", () => {
    const bare = mounted(
      <List>
        <ListItem>a</ListItem>
      </List>,
      { theme: {} },
    );
    expect(bare.getAttribute("data-size")).toBe("3");
    expect(computed(bare, "font-size")).toBe(
      computed(mounted(<Text size="3">a</Text>, { theme: {} }), "font-size"),
    );
  });

  it("the UA margin is gone — a <ul> arrives with block margin and 40px of padding", () => {
    // The non-negotiable (§3), tested where it bites: `.kui-type` zeroes the margin, and the
    // INDENT is the component's own, so the padding is asserted separately and must survive.
    for (const ordered of [false, true]) {
      const el = mounted(
        ordered ? (
          <List ordered>
            <ListItem>a</ListItem>
          </List>
        ) : (
          <List>
            <ListItem>a</ListItem>
          </List>
        ),
        { theme: {} },
      );
      for (const side of ["top", "bottom", "left", "right"]) {
        expect(computed(el, `margin-${side}`), `${ordered ? "ol" : "ul"}: margin-${side} survived`).toBe(
          "0px",
        );
      }
      expect(
        parseFloat(computed(el, "padding-inline-start")),
        "the indent went with the UA padding",
      ).toBeGreaterThan(0);
      for (const side of ["top", "bottom", "right"]) {
        expect(parseFloat(computed(el, `padding-${side}`)), `${side} grew padding`).toBe(0);
      }
    }
  });

  it("the emphasis rungs are the foreground roles, and it rests loud like all reading copy", () => {
    for (const rung of RUNGS) {
      const list = mounted(
        <List emphasis={rung}>
          <ListItem>a</ListItem>
        </List>,
        { theme: {} },
      );
      const text = mounted(<Text emphasis={rung}>a</Text>, { theme: {} });
      expect(computed(list, "color"), `${rung}: the rung diverged from Text`).toBe(
        computed(text, "color"),
      );
    }
    const bare = mounted(
      <List>
        <ListItem>a</ListItem>
      </List>,
      { theme: {} },
    );
    const loud = mounted(
      <List emphasis="loud">
        <ListItem>a</ListItem>
      </List>,
      { theme: {} },
    );
    const quiet = mounted(
      <List emphasis="quiet">
        <ListItem>a</ListItem>
      </List>,
      { theme: {} },
    );
    expect(computed(bare, "color")).toBe(computed(loud, "color"));
    expect(computed(quiet, "color")).not.toBe(computed(loud, "color"));
  });

  it("the weights are token names, and it rests regular — a list is copy", () => {
    for (const weight of WEIGHTS) {
      const list = mounted(
        <List weight={weight}>
          <ListItem>a</ListItem>
        </List>,
        { theme: {} },
      );
      const text = mounted(<Text weight={weight}>a</Text>, { theme: {} });
      expect(computed(list, "font-weight"), `${weight}: diverged from Text`).toBe(
        computed(text, "font-weight"),
      );
    }
    const bare = mounted(
      <List>
        <ListItem>a</ListItem>
      </List>,
      { theme: {} },
    );
    expect(computed(bare, "font-weight")).toBe(
      computed(mounted(<Text weight="regular">a</Text>, { theme: {} }), "font-weight"),
    );
    // The weights are genuinely different, so the equalities above are not trivial.
    const semibold = mounted(
      <List weight="semibold">
        <ListItem>a</ListItem>
      </List>,
      { theme: {} },
    );
    expect(computed(semibold, "font-weight")).not.toBe(computed(bare, "font-weight"));
  });

  it("a chosen tone moves the ink onto that family, as it does on Text", () => {
    const toned = mounted(
      <List tone="destructive">
        <ListItem>a</ListItem>
      </List>,
      { theme: {} },
    );
    const bare = mounted(
      <List>
        <ListItem>a</ListItem>
      </List>,
      { theme: {} },
    );
    expect(computed(toned, "color")).toBe(
      computed(mounted(<Text tone="destructive">a</Text>, { theme: {} }), "color"),
    );
    expect(computed(toned, "color")).not.toBe(computed(bare, "color"));
  });

  it("`ordered` is the ELEMENT choice, and start/reversed pass through to it", () => {
    // The one structural choice a list has, and it is a choice of element because that is what
    // a screen reader announces. `start` and `reversed` change what the numbers SAY.
    const ul = mounted(
      <List>
        <ListItem>a</ListItem>
      </List>,
      { theme: {} },
    );
    expect(ul.tagName).toBe("UL");
    const ol = mounted(
      <List ordered start={7} reversed>
        <ListItem>a</ListItem>
        <ListItem>b</ListItem>
      </List>,
      { theme: {} },
    );
    expect(ol.tagName).toBe("OL");
    expect((ol as HTMLOListElement).start).toBe(7);
    expect((ol as HTMLOListElement).reversed).toBe(true);
    // And the attributes reach the element rather than being swallowed by the props spread.
    expect(ol.getAttribute("start")).toBe("7");
    expect(ol.hasAttribute("reversed")).toBe(true);
    expect(mounted(<ListItem value={4}>a</ListItem>, { theme: {} }).tagName).toBe("LI");
  });
});

/**
 * L1 — A BULLET IS FURNITURE; A NUMBER IS NOT (audit 2026-09-12).
 *
 * The faint rung is right for a disc, which says only "this is one of several" and which nobody
 * reads. A NUMBER is read: it is what a procedure is cited by, and the accessibility tree
 * exposes it as text. At the faint rung it measured 1.72:1 against the page in light, with
 * `contrast="high"` moving it to 1.86.
 *
 * THE DANGER IN THIS LAW IS THAT ITS SUBJECT INHERITS. An ordered marker takes the list's ink
 * by the rule SAYING NOTHING, so a marker that inherits by accident and one that inherits by
 * rule look identical at any single reading — which is why the walk is over all three rungs AND
 * a stated tone AND both appearances AND the conformance surface: a `::marker` declaration
 * naming any colour at all disagrees with the item's own ink in at least one of those cells,
 * whichever colour it names. Falsified by restoring the shipped `color: var(--color-text-faint)`
 * to the ordered marker.
 */
describe("L1: a number takes the words' ink, a bullet stays furniture (§15)", () => {
  for (const appearance of APPEARANCES) {
    for (const contrast of ["normal", "high"] as const) {
      // `contrast` and `appearance` travel together: the high-contrast palette is selected by
      // the two on one element, and a Theme that states only the first stamps an attribute
      // nothing selects on (theme.tsx's own dev warning).
      const theme: ThemeProps = { appearance, contrast };
      const where = `${appearance}/${contrast}`;

      it(`${where}: an ordered marker paints the ink its own words paint, at every rung`, () => {
        for (const rung of RUNGS) {
          const ol = mounted(
            <List ordered start={10} emphasis={rung}>
              <ListItem>ten</ListItem>
            </List>,
            { theme },
          );
          const item = ol.querySelector<HTMLElement>("li")!;
          expect(markerColor(item), `${where} ${rung}: the number left its words' rung`).toBe(
            computed(item, "color"),
          );
        }
      });

      it(`${where}: and it follows a chosen FAMILY, without the sheet naming a colour`, () => {
        // The tone indirection carries the marker because the marker says nothing. A rule that
        // named a colour would be right about neutral and wrong here.
        const ol = mounted(
          <List ordered start={10} tone="destructive" emphasis="medium">
            <ListItem>ten</ListItem>
          </List>,
          { theme },
        );
        const item = ol.querySelector<HTMLElement>("li")!;
        expect(markerColor(item)).toBe(computed(item, "color"));
        // ...and it is genuinely the family's ink, not some third colour both happen to share.
        const neutral = mounted(
          <List ordered start={10} emphasis="medium">
            <ListItem>ten</ListItem>
          </List>,
          { theme },
        );
        expect(markerColor(item)).not.toBe(markerColor(neutral.querySelector<HTMLElement>("li")!));
      });

      it(`${where}: a BULLET stays on the faint rung whatever rung the words take`, () => {
        for (const rung of RUNGS) {
          const ul = mounted(
            <List emphasis={rung}>
              <ListItem>disc</ListItem>
            </List>,
            { theme },
          );
          const item = ul.querySelector<HTMLElement>("li")!;
          expect(markerColor(item), `${where} ${rung}: the bullet left the faint role`).toBe(
            colorOn(ul, "var(--color-text-faint)"),
          );
        }
        // The vacuity guard, and it is the half that matters: at the loud rung the faint role
        // is a different colour from the words, so the rule is doing something. Without this a
        // stylesheet whose bullet rule had been deleted would pass every assertion above at the
        // one rung where the item's own ink IS faint.
        const loud = mounted(
          <List emphasis="loud">
            <ListItem>disc</ListItem>
          </List>,
          { theme },
        );
        const item = loud.querySelector<HTMLElement>("li")!;
        expect(markerColor(item), `${where}: the bullet is not standing down at all`).not.toBe(
          computed(item, "color"),
        );
      });
    }
  }
});

/**
 * L2 — THE INDENT IS THE ROOM THE MARKER HANGS IN, SO IT IS THE LIST'S OWN TYPE.
 *
 * It was `--layout-space-5` — 16px at every step, 12 or 24 by density — which is the value the
 * docs judged in open prose at size 3 and which holds the marker at exactly that one step. The
 * two claims below are the two halves of the repair, and both are measured: the room TRACKS THE
 * TYPE (so it holds at every step), and DENSITY NEVER TOUCHES IT (the marker's room is the
 * glyph, not breathing room).
 *
 * Falsified by pointing both rules back at `var(--layout-space-5)`.
 */
describe("L2: the indent holds the marker at every step, and density never moves it (§15)", () => {
  for (const density of DENSITIES) {
    it(`${density}: every step's marker fits the room its own list reserves`, () => {
      for (const size of STEPS) {
        for (const ordered of [false, true]) {
          const { reserved, indent } = markerRoom({ ordered, size, theme: { density } });
          expect(
            reserved,
            `${density} ${ordered ? 'ol "10."' : "ul disc"} size ${size}: the marker hangs ` +
              `${(reserved - indent).toFixed(2)}px outside the list's own box`,
          ).toBeLessThanOrEqual(indent);
        }
      }
    });

    it(`${density}: the indent is a constant share of the list's own font, at every step`, () => {
      for (const ordered of [false, true]) {
        const ratios = STEPS.map((size) => {
          const { indent, font } = markerRoom({ ordered, size, theme: { density } });
          return indent / font;
        });
        for (const [i, ratio] of ratios.entries()) {
          expect(
            ratio,
            `${density} ${ordered ? "ol" : "ul"} step ${STEPS[i]}: the indent stopped tracking the type`,
          ).toBeCloseTo(ratios[0]!, 3);
        }
        expect(ratios[0]!).toBeGreaterThan(1);
      }
    });
  }

  it("the two elements draw different markers, so they reserve different room", () => {
    // The "TWO VALUES" decision, as a computed comparison: a number grows with what it counts
    // and a disc does not, so one value is either short for the numbers or a third of a line of
    // air in front of every bullet. A collapse to one value fails here.
    const disc = markerRoom({ size: "3" });
    const number = markerRoom({ ordered: true, size: "3" });
    expect(number.indent).toBeGreaterThan(disc.indent);
  });

  for (const size of ["1", "3", "9"] as const) {
    it(`density moves nothing about the indent at step ${size}`, () => {
      // Read across the three densities at one step. This is the half that fails loudest
      // against `--layout-space-5`, whose compact and comfortable picks are 12 and 24.
      const indents = DENSITIES.map(
        (density) => markerRoom({ ordered: true, size, theme: { density } }).indent,
      );
      for (const [i, indent] of indents.entries()) {
        expect(indent, `${DENSITIES[i]}: density reached the marker's room`).toBe(indents[0]!);
      }
    });
  }

  it("a two-digit number survives a container with no inset of its own", () => {
    /* THE CLIPPING CASE, and it is why a hanging marker is not merely untidy. A pane CLIPS
       since the bleed shipped (§3, 2026-08-20) and a table cell has no inset at all, so a
       marker painted outside the list's own box has no symptom and no repair from the call
       site: measured in a first column at compact size 1, "10." painted as "0." and the discs
       disappeared entirely.

       Read as PAINTED EDGES rather than as the fitting arithmetic above, because that is the
       thing that was wrong — the marker's left edge against the clipping box's content edge. */
    for (const size of ["1", "9"] as const) {
      const host = render(
        <Theme density="compact">
          <Box width="320px" overflow="clip">
            <List ordered start={10} size={size}>
              <ListItem>ten</ListItem>
            </List>
          </Box>
        </Theme>,
      );
      const box = host.querySelector<HTMLElement>(".kui-box")!;
      const list = host.querySelector<HTMLElement>(".kui-list")!;
      const item = list.querySelector<HTMLElement>("li")!;
      const { reserved } = markerRoom({ ordered: true, size, theme: { density: "compact" } });
      // The item carries no padding of its own, so its border-box start IS where its words
      // begin, and the marker is painted `reserved` to the left of that.
      const markerLeft = item.getBoundingClientRect().left - reserved;
      const clipLeft = box.getBoundingClientRect().left + box.clientLeft;
      expect(
        markerLeft - clipLeft,
        `compact size ${size}: the number is painted ${(clipLeft - markerLeft).toFixed(2)}px ` +
          `outside the box that clips it`,
      ).toBeGreaterThanOrEqual(0);
    }
  });
});

/**
 * L3 — A PORTALLED SUBTREE IS NOT INSIDE THE THING THAT OPENED IT (§15, §20, audit 2026-09-12).
 *
 * Nesting is detected by React context, and React context follows the React tree — a portal is
 * the one place where that tree and the DOM disagree. So a `<List>` in a panel opened from
 * inside a `<ListItem>` read as NESTED: it stamped no step, no weight and no ink, and then had
 * no `<li>` anywhere above it to inherit a line from, which measured 14px at
 * `line-height: normal` against the 16/24 the same list renders at anywhere else.
 *
 * BOTH DIRECTIONS ARE READ, because each fails on its own and a law with only the first is a
 * law that a `nested = false` constant would satisfy: the portalled list must be ORDINARY, and
 * the in-flow nested list must still be NESTED.
 *
 * Falsified by removing the `ListInkContext.Provider value={null}` from `PortalScope`.
 */
describe("L3: a list in a portal is not nested, and one in an <li> still is (§20)", () => {
  function openedFromInsideAList(): { portalled: HTMLElement; outer: HTMLElement } {
    const host = render(
      <Theme>
        <List size="3">
          <ListItem>
            An item
            <Popover defaultOpen>
              <PopoverTrigger render={<Button>Open</Button>} />
              <PopoverContent aria-label="Panel">
                <List>
                  <ListItem>inner</ListItem>
                </List>
              </PopoverContent>
            </Popover>
          </ListItem>
        </List>
      </Theme>,
    );
    settleAll();
    const portalled = document.querySelector<HTMLElement>(".kui-portal .kui-list");
    if (!portalled) throw new Error("no portalled list — the panel did not open");
    return { portalled, outer: host.querySelector<HTMLElement>(".kui-list")! };
  }

  it("the portalled list states its own step and takes the ordinary line", () => {
    const { portalled } = openedFromInsideAList();
    const ordinary = mounted(
      <List>
        <ListItem>inner</ListItem>
      </List>,
      { theme: {} },
    );
    expect(portalled.getAttribute("data-size"), "it read as nested and stamped no step").toBe("3");
    expect(portalled.getAttribute("data-weight")).toBe("regular");
    expect(computed(portalled, "font-size")).toBe(computed(ordinary, "font-size"));
    expect(computed(portalled, "line-height")).toBe(computed(ordinary, "line-height"));
    // The symptom, named: with no step stamped there is no line-height rule to fire, and the
    // ramp's own leading is replaced by the browser's.
    expect(computed(portalled, "line-height"), "the line fell back to the font's own").not.toBe(
      "normal",
    );
  });

  it("and its items are the ordinary line too — the <li> had nothing to inherit from", () => {
    const { portalled } = openedFromInsideAList();
    const ordinary = mounted(
      <List>
        <ListItem>inner</ListItem>
      </List>,
      { theme: {} },
    );
    const height = (list: HTMLElement) =>
      list.querySelector<HTMLElement>("li")!.getBoundingClientRect().height;
    expect(height(portalled)).toBeCloseTo(height(ordinary), 1);
  });

  it("an IN-FLOW nested list is still nested — it states no step and takes the item's", () => {
    // The negative control, and the reason the fix is a reset at the portal rather than a
    // deleted mechanism: without this, `nested = false` everywhere passes the two laws above.
    const outer = mounted(
      <List size="6">
        <ListItem>
          An item
          <List>
            <ListItem>inner</ListItem>
          </List>
        </ListItem>
      </List>,
      { theme: {} },
    );
    const inner = outer.querySelector<HTMLElement>(".kui-list")!;
    expect(inner.hasAttribute("data-size"), "a nested list stamped a step of its own").toBe(false);
    expect(inner.hasAttribute("data-weight")).toBe(false);
    expect(computed(inner, "font-size")).toBe(computed(outer, "font-size"));
    // ...and step 6 is not the default, so the equality above is the inheritance rather than a
    // coincidence of two lists both resting at 3.
    const resting = mounted(
      <List>
        <ListItem>a</ListItem>
      </List>,
      { theme: {} },
    );
    expect(computed(inner, "font-size")).not.toBe(computed(resting, "font-size"));
  });
});

/**
 * L4 — THE DIRECT CHAIN ONLY (audit 2026-09-12).
 *
 * The rhythm rule was `.kui-list .kui-list`, a descendant selector, which in open prose reaches
 * exactly the nested list it was written for and everywhere else reaches past it: a `Stack` or
 * a `Card` inside a list item owns its own spacing (§3) and took 4px of someone else's margin
 * on top of it.
 *
 * Falsified by restoring the descendant selector.
 */
describe("L4: a nested list's rhythm is the parent's rule about its own contents (§3)", () => {
  it("a direct `li > List` keeps the rhythm", () => {
    const outer = mounted(
      <List>
        <ListItem>
          An item
          <List>
            <ListItem>inner</ListItem>
          </List>
        </ListItem>
      </List>,
      { theme: {} },
    );
    const inner = outer.querySelector<HTMLElement>(".kui-list")!;
    expect(computed(inner, "margin-block-start")).toBe(tokenOn(outer, "--layout-space-2"));
    expect(parseFloat(computed(inner, "margin-block-start"))).toBeGreaterThan(0);
  });

  it("and so does the distance between two items", () => {
    const outer = mounted(
      <List>
        <ListItem>one</ListItem>
        <ListItem>two</ListItem>
      </List>,
      { theme: {} },
    );
    const [first, second] = Array.from(outer.querySelectorAll<HTMLElement>("li"));
    expect(computed(first!, "margin-block-start"), "the FIRST item is not pushed off").toBe("0px");
    expect(computed(second!, "margin-block-start")).toBe(tokenOn(outer, "--layout-space-2"));
  });

  it("a List inside a Stack inside an item borrows no margin from the list above it", () => {
    // Measured before the repair: the Stack's first gap read 6px inside an item against 2px
    // outside one — the layout's own gap plus 4px of someone else's margin.
    const outer = mounted(
      <List>
        <ListItem>
          <Stack gap="1">
            <Text>a</Text>
            <List>
              <ListItem>inner</ListItem>
            </List>
          </Stack>
        </ListItem>
      </List>,
      { theme: {} },
    );
    const inner = outer.querySelector<HTMLElement>(".kui-list")!;
    expect(
      computed(inner, "margin-block-start"),
      "a layout that owns its spacing had someone else's margin added to it",
    ).toBe("0px");
  });

  it("nor does one inside a Card inside an item", () => {
    // The second subject, because the first could pass on a selector that happened to exclude
    // flex children: a size-3 Card inside an item measured 37/33 against 33/33 outside one.
    const outer = mounted(
      <List>
        <ListItem>
          <Card size="3">
            <List>
              <ListItem>inner</ListItem>
            </List>
          </Card>
        </ListItem>
      </List>,
      { theme: {} },
    );
    const inner = outer.querySelector<HTMLElement>(".kui-list")!;
    expect(computed(inner, "margin-block-start"), "the pane's own inset grew by 4px").toBe("0px");
  });
});

/**
 * L5 — A NESTED LIST STATING ONLY A TONE KEEPS ITS PARENT'S RUNG (audit 2026-09-12).
 *
 * A nested list used to state no rung and take `color: inherit`, which carries a COLOUR — and a
 * colour carries nothing the moment the nested list states a `tone` of its own, because the
 * tone re-scopes the three ink roles on that element and `.kui-type`'s resting `color` wins
 * there. Measured: a `destructive` sub-list under a `medium` parent painted the family's LOUD
 * ink, which is the opposite of what the `emphasis` prop promises and of §15's rule that
 * choosing a family keeps the rung.
 *
 * Falsified by resolving the rung as `emphasis ?? "loud"` — dropping the inherited one.
 */
describe("L5: choosing a family moves the family, never the rung (§15)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: a toned sub-list under a medium parent reads MEDIUM in that family`, () => {
      const theme: ThemeProps = { appearance };
      const outer = mounted(
        <List emphasis="medium">
          <ListItem>
            An item
            <List tone="destructive">
              <ListItem>inner</ListItem>
            </List>
          </ListItem>
        </List>,
        { theme },
      );
      const inner = outer.querySelector<HTMLElement>(".kui-list")!;
      expect(computed(inner, "color")).toBe(
        computed(
          mounted(
            <Text tone="destructive" emphasis="medium">
              a
            </Text>,
            { theme },
          ),
          "color",
        ),
      );
      expect(
        computed(inner, "color"),
        "the sub-list fell to the family's loud ink",
      ).not.toBe(
        computed(
          mounted(
            <Text tone="destructive" emphasis="loud">
              a
            </Text>,
            { theme },
          ),
          "color",
        ),
      );
      // And the family DID move — without this the law would pass on a sub-list that had
      // simply inherited its parent's neutral medium and ignored the tone entirely.
      expect(computed(inner, "color")).not.toBe(computed(outer, "color"));
    });
  }

  it("a sub-list stating nothing keeps the parent's rung, and its markers follow", () => {
    const outer = mounted(
      <List ordered start={10} emphasis="quiet">
        <ListItem>
          An item
          <List ordered start={10}>
            <ListItem>inner</ListItem>
          </List>
        </ListItem>
      </List>,
      { theme: {} },
    );
    const inner = outer.querySelector<HTMLElement>(".kui-list")!;
    expect(computed(inner, "color")).toBe(computed(outer, "color"));
    const innerItem = inner.querySelector<HTMLElement>("li")!;
    expect(markerColor(innerItem), "the nested number left its list's rung").toBe(
      computed(innerItem, "color"),
    );
    // Quiet is a real move away from the resting rung, so the equality is not trivial.
    const resting = mounted(
      <List>
        <ListItem>a</ListItem>
      </List>,
      { theme: {} },
    );
    expect(computed(inner, "color")).not.toBe(computed(resting, "color"));
  });

  it("an explicit rung on the sub-list still wins over the parent's", () => {
    const outer = mounted(
      <List emphasis="quiet">
        <ListItem>
          An item
          <List emphasis="loud">
            <ListItem>inner</ListItem>
          </List>
        </ListItem>
      </List>,
      { theme: {} },
    );
    const inner = outer.querySelector<HTMLElement>(".kui-list")!;
    expect(computed(inner, "color")).toBe(
      computed(mounted(<Text emphasis="loud">a</Text>, { theme: {} }), "color"),
    );
    expect(computed(inner, "color")).not.toBe(computed(outer, "color"));
  });
});
