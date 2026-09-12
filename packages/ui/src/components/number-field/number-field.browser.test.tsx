/**
 * NumberField's laws, mounted (§4, §8, §10, §11, §28).
 *
 * Written to the 2026-08-03 standard — computed values through a mounted `<Theme>` — and to
 * the clause the ship audit added to it: the component's own claim is that it OWNS NOTHING.
 * "The box, the dress, the states, the focus ring, the read-only well, the slot geometry and
 * the glass all arrive by wearing `kui-field`" (number-field.css, first paragraph), and a law
 * that asserted any of those against a LITERAL would keep passing on the day the family moved
 * underneath it — which is the same law passing while the component had silently stopped being
 * a field. So the family half of this file is AGREEMENT: every one of those facts is read off
 * a mounted TextField carrying a hosted Button in each slot, which is precisely what a
 * NumberField is, and the assertion is that the two resolve the same value.
 *
 * THE TWIN IS THE FIXTURE, AND THE FIXTURE IS THE LAW. A bare `<TextField/>` is the wrong
 * twin and would have made three of these laws vacuous in the accommodating direction: a bare
 * field pads `--kui-ct-px` where a field with hosted controls pads `--kui-ct-slot-inset`, so
 * "the paddings agree" against a bare twin fails on a correct implementation, and the repair
 * anyone would reach for is to stop asserting padding at all. The twin holds two Buttons
 * because the subject holds two Buttons.
 */
import { describe, expect, it } from "vitest";

import type { Size } from "../../system/axes.ts";
import { Theme } from "../../theme/theme.tsx";
import { coarse, density } from "../../tokens/config.ts";
import {
  APPEARANCES,
  DENSITIES,
  POINTERS,
  SIZES,
  colorOn,
  computed,
  mounted,
  render,
  until,
  within,
} from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Field, FieldLabel } from "../field/field.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { NumberField } from "./number-field.tsx";

/** Every token this file resolves through a scope is a colour; lengths are read off elements. */
const tokenOn = (el: Element, name: string): string => colorOn(el, `var(${name})`);

const inputOf = (el: HTMLElement) => within(el, ".kui-number-field-input") as HTMLInputElement;
/** Decrease sits in the LEADING slot and increase in the TRAILING one — which is a fact about
    the DOM, not about the paint. Where the two land on screen is its own law below. */
const decOf = (el: HTMLElement) => within(el, '[data-slot="leading"] > .kui-button') as HTMLButtonElement;
const incOf = (el: HTMLElement) => within(el, '[data-slot="trailing"] > .kui-button') as HTMLButtonElement;

/**
 * THE TWIN: a TextField hosting a Button in each slot, which is what a NumberField is.
 *
 * Both stepper labels are stated because `iconOnly` requires an accessible name — and that is
 * not test ceremony, it is the same requirement the component itself satisfies with
 * `decrementLabel` / `incrementLabel`.
 */
function twin(props: Record<string, unknown> = {}) {
  return (
    <TextField
      leading={
        <Button iconOnly aria-label="Decrease">
          <svg viewBox="0 0 16 16" />
        </Button>
      }
      trailing={
        <Button iconOnly aria-label="Increase">
          <svg viewBox="0 0 16 16" />
        </Button>
      }
      {...props}
    />
  );
}

/** The pair, mounted under one Theme so nothing about the two mounts can differ. */
function pair(
  subject: React.ReactElement,
  reference: React.ReactElement,
  theme: Record<string, unknown> = {},
): { field: HTMLElement; twin: HTMLElement } {
  const host = render(
    <Theme {...theme}>
      <div data-testid="subject">{subject}</div>
      <div data-testid="reference">{reference}</div>
    </Theme>,
  );
  return {
    field: within(within(host, '[data-testid="subject"]'), ".kui-number-field"),
    twin: within(within(host, '[data-testid="reference"]'), ".kui-field"),
  };
}

describe("it IS a field, and that is asserted as an agreement (§4, §11)", () => {
  /**
   * The whole box, at every index. Walking all four is the degenerate-fixture rule: the
   * control ladder's steps are close enough that two adjacent indexes agree under more than
   * one wrong spelling (Composer shipped 14/14/16/16 twice and passed every two-index law
   * both times, 2026-08-23). Four indexes × both pointer worlds is where a pinned literal
   * finally has nowhere to hide.
   */
  const BOX = [
    "min-height",
    "padding-left",
    "padding-right",
    "border-top-left-radius",
    "border-bottom-right-radius",
    "font-size",
    "column-gap",
    "border-top-width",
    "cursor",
    "justify-content",
  ];

  for (const size of SIZES) {
    it(`size ${size}: every box property agrees with a TextField holding the same two controls`, () => {
      const { field, twin: reference } = pair(<NumberField size={size} />, twin({ size }));
      for (const property of BOX) {
        expect(computed(field, property), `size ${size} disagrees on ${property}`).toBe(
          computed(reference, property),
        );
      }
    });
  }

  it("and the box is the designed set, not merely two components agreeing on a wrong number", () => {
    // The vacuity guard the agreement laws cannot carry: two components reading one broken
    // token agree perfectly. One anchor into the designed geometry is what says the pair is
    // standing on the ladder rather than beside it.
    const el = mounted(<NumberField size="3" />, { theme: { radius: "medium" } });
    expect(computed(el, "min-height")).toBe(`${density.default.height[2]}px`);
    expect(computed(el, "padding-left")).toBe(`${density.default.slotInset[2]}px`);
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: the dress is the family's — well, edge and value colour`, () => {
      const { field, twin: reference } = pair(<NumberField />, twin(), { appearance });
      for (const property of ["background-color", "border-top-color", "color"]) {
        expect(computed(field, property), `${appearance} disagrees on ${property}`).toBe(
          computed(reference, property),
        );
      }
      // Both halves, or the law is satisfied by a family that paints nothing at all.
      expect(computed(field, "background-color")).toBe(colorOn(field, "var(--dress-field-fill)"));
      expect(computed(field, "border-top-color")).toBe(colorOn(field, "var(--dress-field-edge)"));
    });
  }

  it("the input contributes no box of its own — one border, one height, one ring", () => {
    const el = render(<NumberField />);
    const input = inputOf(el);
    expect(computed(input, "border-top-width")).toBe("0px");
    expect(computed(input, "padding-left")).toBe("0px");
    expect(computed(input, "outline-style")).toBe("none");
    expect(computed(input, "background-color")).toBe("rgba(0, 0, 0, 0)");
    // The border is the WRAPPER's, and it is really painted.
    expect(computed(el, "border-top-width")).toBe("1px");
  });

  it("it is NOT a native number input — the platform's spinner is what this replaces", () => {
    // The type's own sentence: "a native `type=\"number\"` field formats nothing, parses
    // nothing in the reader's locale, and draws its own spinner inside our box." Read on the
    // rendered element, because the refusal that matters is what the browser is handed.
    const input = inputOf(render(<NumberField />));
    expect(input.type).not.toBe("number");
    expect(input.inputMode, "a number field must summon a numeric keypad").not.toBe("");
  });
});

describe("the states are the family's too, and each one is read against the twin (§8)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: invalid re-tones the boundary exactly as a TextField's does`, () => {
      const { field, twin: reference } = pair(
        <NumberField aria-invalid="true" />,
        twin({ "aria-invalid": "true" }),
        { appearance },
      );
      expect(computed(field, "border-top-color")).toBe(computed(reference, "border-top-color"));
      expect(computed(field, "border-top-color")).toBe(tokenOn(field, "--invalid-edge"));
      // The value stays legible — the box carries the state, never the number.
      const plain = mounted(<NumberField />, { theme: { appearance } });
      expect(computed(field, "color")).toBe(computed(plain, "color"));
      // Vacuity: an invalid field must actually differ from a valid one.
      expect(computed(field, "border-top-color")).not.toBe(computed(plain, "border-top-color"));
    });

    it(`${appearance}: disabled goes flat by tone and takes the value with it`, () => {
      const { field, twin: reference } = pair(<NumberField disabled />, twin({ disabled: true }), {
        appearance,
      });
      for (const property of ["background-color", "border-top-color", "color", "cursor"]) {
        expect(computed(field, property), `disabled disagrees on ${property}`).toBe(
          computed(reference, property),
        );
      }
      expect(computed(field, "border-top-color")).toBe(tokenOn(field, "--disabled-border"));
      // Never by opacity — the remap is a tone move, which is the whole §8 decision.
      expect(computed(field, "opacity")).toBe("1");
      expect(inputOf(field).disabled).toBe(true);
    });
  }

  it("readOnly drops the well and keeps everything else — the family's own answer", () => {
    const { field, twin: reference } = pair(
      <NumberField readOnly defaultValue={5} />,
      twin({ readOnly: true, defaultValue: "5" }),
    );
    expect(computed(field, "background-color")).toBe(computed(reference, "background-color"));
    expect(computed(field, "background-color")).toBe("rgba(0, 0, 0, 0)");
    // And the rest of it is untouched: bounded, legible, selectable, focusable.
    const live = mounted(<NumberField defaultValue={5} />, { theme: {} });
    expect(computed(field, "border-top-color")).toBe(computed(live, "border-top-color"));
    expect(computed(field, "color")).toBe(computed(live, "color"));
    // The vacuity guard: a live field must have a well for the read-only one to have lost.
    expect(computed(live, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("the ring lands on the WRAPPER when the value takes focus, and there is exactly one", () => {
    // Focus is a MODE for a field, not a keyboard affordance (§8) — and the rule is keyed on
    // the INPUT holding it, never `:focus-within`, precisely because this component always has
    // two focusable buttons inside the box.
    const el = render(<NumberField />);
    expect(computed(el, "outline-style")).toBe("none");
    inputOf(el).focus();
    expect(document.activeElement).toBe(inputOf(el));
    expect(computed(el, "outline-style")).toBe("solid");
    expect(computed(el, "outline-width")).toBe("2px");
    expect(computed(el, "outline-color")).toBe(tokenOn(el, "--focus-ring"));
    expect(computed(inputOf(el), "outline-style")).toBe("none");
    inputOf(el).blur();
  });

  it("a stepper holding focus does NOT light the field's ring (§4)", () => {
    // The 2026-08-05 repair, arriving at the one component that can never be without a hosted
    // control. A `:focus-within` ring here would be lit by `focusableWhenDisabled` alone.
    const el = render(<NumberField />);
    decOf(el).focus();
    expect(document.activeElement).toBe(decOf(el));
    expect(computed(el, "outline-style")).toBe("none");
    decOf(el).blur();
  });
});

describe("the glass is the family's, part for part (§10)", () => {
  it("a glass NumberField resolves byte-identically to a glass TextField holding two controls", () => {
    const { field, twin: reference } = pair(<NumberField backdrop />, twin({ backdrop: true }), {
      material: "regular",
    });
    for (const property of ["backdrop-filter", "background-color", "border-top-color"]) {
      expect(computed(field, property), `glass disagrees on ${property}`).toBe(
        computed(reference, property),
      );
    }
    // The ring is on the annulus for the whole family since 2026-09-02 — asserted as the
    // agreement, and with the vacuity guard that there is a ring at all to agree about.
    const ring = getComputedStyle(reference, "::after").backgroundImage;
    expect(ring, "the twin grew no ring — the law would pass on two blanks").toContain("gradient(");
    expect(getComputedStyle(field, "::after").backgroundImage).toBe(ring);
    // And it really is glass, or every line above compares two opaque controls.
    expect(computed(field, "backdrop-filter")).not.toBe("none");
  });

  it("a hosted stepper refuses the veil structurally — one glass per stack", () => {
    // The React half, which is the stronger claim (2026-08-16): whatever the stylesheet does,
    // a stepper inside a glass field is not ASKING to be glass.
    const field = mounted(<NumberField backdrop />, {
      theme: { material: "regular" },
      select: ".kui-number-field",
    });
    expect(field.dataset["material"]).toBe("regular");
    expect(decOf(field).dataset["material"]).toBe("on-glass");
    expect(incOf(field).dataset["material"]).toBe("on-glass");
    expect(computed(decOf(field), "backdrop-filter")).toBe("none");
  });

  it("state outranks glass: an invalid glass field wears the state's border, ring stood down", () => {
    const invalid = mounted(<NumberField backdrop aria-invalid="true" />, {
      theme: { material: "thin" },
      select: ".kui-number-field",
    });
    expect(computed(invalid, "border-top-color")).toBe(colorOn(invalid, "var(--invalid-edge)"));
    expect(getComputedStyle(invalid, "::after").opacity, "the invalid field kept its ring").toBe("0");
  });
});

describe("the two steppers are hosted controls, and their ladder is read as a ladder (§4)", () => {
  /**
   * §4's hosted-control rule: one designed `slotInset` shows on all four sides and the hosted
   * height is that inset subtracted from the container's own box. The claims below are
   * AGREEMENT and MONOTONICITY rather than arithmetic, deliberately — re-deriving the intended
   * inset from the same inputs the implementation uses is what made `targetBox()` unfalsifiable
   * in the 2026-08-06 audit.
   */
  const sides = (field: HTMLElement, stepper: HTMLElement) => {
    const f = field.getBoundingClientRect();
    const s = stepper.getBoundingClientRect();
    return { top: s.top - f.top, bottom: f.bottom - s.bottom, outer: Math.min(s.left - f.left, f.right - s.right) };
  };

  for (const pointer of POINTERS) {
    it(`${pointer}: the hosted height climbs the whole index, and never repeats a step`, () => {
      // A ladder, read as a ladder. Two adjacent indexes agree under a pinned value, a
      // fraction of the wrong box, and an off-by-one pick — four do not.
      const heights = SIZES.map((size) => {
        const el = mounted(<NumberField size={size} />, { theme: { pointer }, select: ".kui-number-field" });
        return decOf(el).getBoundingClientRect().height;
      });
      for (let i = 1; i < heights.length; i += 1) {
        expect(heights[i], `${pointer}: size ${i + 1} did not grow past size ${i} (${heights.join("/")})`).toBeGreaterThan(
          heights[i - 1]!,
        );
      }
    });

    for (const size of SIZES) {
      it(`${pointer}/size ${size}: the stepper is the size the family hosts, on both sides`, () => {
        const { field, twin: reference } = pair(<NumberField size={size} />, twin({ size }), { pointer });
        const hosted = within(reference, '[data-slot="trailing"] > .kui-button').getBoundingClientRect();
        // AGREEMENT with the family's own hosted control, never a restated number.
        expect(decOf(field).getBoundingClientRect().height).toBeCloseTo(hosted.height, 1);
        expect(incOf(field).getBoundingClientRect().height).toBeCloseTo(hosted.height, 1);
        // Strictly inside the box that contains it: an affordance in a field, not a second
        // field wedged into one (the 2026-08-04 measurement this rule exists for).
        const box = field.getBoundingClientRect();
        expect(decOf(field).getBoundingClientRect().height).toBeLessThan(box.height);
        // Equal air on all four sides, which is the point of ONE designed inset driving the
        // padding and the derived height together.
        for (const stepper of [decOf(field), incOf(field)]) {
          const air = sides(field, stepper);
          expect(Math.abs(air.top - air.bottom), `${pointer}/${size}: vertical air is uneven`).toBeLessThanOrEqual(1);
          expect(Math.abs(air.outer - air.top), `${pointer}/${size}: the outer air is not the vertical air`).toBeLessThanOrEqual(1);
        }
      });
    }

    it(`${pointer}: the field's own height is the designed one — hosting does not stretch it`, () => {
      // The half of the 2026-08-04 defect that was invisible from the button: the CONTAINER
      // had grown 2px past its own size token in 16 of 16 cells.
      const set = pointer === "coarse" ? coarse.default : density.default;
      for (const [index, size] of SIZES.entries()) {
        const el = mounted(<NumberField size={size} />, { theme: { pointer }, select: ".kui-number-field" });
        expect(computed(el, "min-height"), `${pointer}/size ${size}`).toBe(`${set.height[index]}px`);
      }
    });
  }

  for (const level of DENSITIES) {
    it(`${level}: the steppers re-price with density, because both numbers ride the family`, () => {
      const { field, twin: reference } = pair(<NumberField size="2" />, twin({ size: "2" }), {
        density: level,
      });
      const hosted = within(reference, '[data-slot="trailing"] > .kui-button').getBoundingClientRect();
      expect(decOf(field).getBoundingClientRect().height).toBeCloseTo(hosted.height, 1);
    });
  }

  it("a compact stepper is smaller than a comfortable one — the density walk is not a no-op", () => {
    // The vacuity guard the loop above cannot carry: three densities that all resolved the
    // same number would satisfy every cell of it.
    const at = (level: "compact" | "comfortable") =>
      decOf(mounted(<NumberField size="2" />, { theme: { density: level }, select: ".kui-number-field" }))
        .getBoundingClientRect().height;
    expect(at("compact")).toBeLessThan(at("comfortable"));
  });
});

describe("a wrapping <label> names the VALUE, not a button (N1, the ship audit)", () => {
  /**
   * THE DEFECT: `<label>Seats <NumberField/></label>` binds to the first LABELABLE descendant,
   * and a `<button>` is labelable. With the decrease stepper written first, `label.control`
   * was the button, the textbox went unnamed, and clicking the words focused a control that is
   * not even in the tab order. The repair puts the input first in the DOM and places the
   * steppers with CSS `order` — so DOM order and paint order deliberately disagree, and every
   * law here says which of the two it is about.
   */
  const labelled = () =>
    render(
      <Theme>
        <label data-testid="label">
          Seats
          <NumberField defaultValue={2} />
        </label>
      </Theme>,
    );

  it("the label's control is the INPUT, and the input is named by it", () => {
    const host = labelled();
    const label = within(host, '[data-testid="label"]') as HTMLLabelElement;
    const field = within(host, ".kui-number-field");
    // WITHOUT THE FIX this reads BUTTON[Decrease]: the first labelable descendant is whatever
    // the DOM puts first, and the paint order says nothing about it.
    expect(label.control, "the label bound to something other than the value").toBe(inputOf(field));
    // The other direction, because an association has two ends and one of them can be absent:
    // `labels` is what an AT walks to build the textbox's name.
    expect([...inputOf(field).labels!]).toContain(label);
  });

  it("clicking the words lands the caret in the value", () => {
    const host = labelled();
    const label = within(host, '[data-testid="label"]') as HTMLLabelElement;
    const field = within(host, ".kui-number-field");
    label.click();
    expect(document.activeElement).toBe(inputOf(field));
    expect(document.activeElement).not.toBe(decOf(field));
    inputOf(field).blur();
  });

  it("the input really is FIRST in the DOM — the fact the label binding rests on", () => {
    // Stated as its own law because it is the mechanism, and because the geometry law below
    // would be satisfied by a DOM that had drifted back: `order` is what makes the two
    // questions independent, so both are asked.
    const el = render(<NumberField />);
    const children = [...el.children];
    expect(children[0]).toBe(inputOf(el));
    expect(children.indexOf(decOf(el).parentElement!)).toBeGreaterThan(0);
  });

  it("and decrease still paints at the leading edge — the placement is CSS `order`", () => {
    // The half the DOM reorder could have broken silently. Measured in screen coordinates,
    // so a deleted `order: -1` fails here rather than passing on a DOM read.
    const el = render(<NumberField />);
    expect(decOf(el).getBoundingClientRect().left).toBeLessThan(
      incOf(el).getBoundingClientRect().left,
    );
    // The value sits between them, which is the anatomy the whole component is.
    const value = inputOf(el).getBoundingClientRect();
    expect(decOf(el).getBoundingClientRect().right).toBeLessThanOrEqual(value.left + 1);
    expect(incOf(el).getBoundingClientRect().left).toBeGreaterThanOrEqual(value.right - 1);
  });

  it("in RTL decrease paints at the reading edge — `order` runs along the flex main axis", () => {
    // `order` is direction-agnostic: the main axis flips with `dir`, so RTL needs nothing of
    // its own. A spelling that placed the slots with `flex-direction: row-reverse` or a
    // physical property would pass the LTR law above and fail here.
    const rtl = render(
      <Theme>
        <div dir="rtl">
          <NumberField />
        </div>
      </Theme>,
    );
    const field = within(rtl, ".kui-number-field");
    expect(
      decOf(field).getBoundingClientRect().left,
      "decrease did not mirror — it is placed physically, not along the main axis",
    ).toBeGreaterThan(incOf(field).getBoundingClientRect().left);
  });

  it("the steppers stay out of the tab order, in both directions", () => {
    // Base UI's decision and the right one: the keyboard already steps from the input, so two
    // more tab stops per field would be two ways to do one thing. They keep their NAMES, so a
    // touch screen reader can still press them — which is why this is not `aria-hidden`.
    const el = render(<NumberField />);
    for (const stepper of [decOf(el), incOf(el)]) {
      expect(stepper.tabIndex).toBe(-1);
      expect(stepper.getAttribute("aria-hidden")).toBe(null);
      expect(stepper.getAttribute("aria-label")).toBeTruthy();
    }
  });

  it("the two names are the caller's to translate", () => {
    const el = render(<NumberField decrementLabel="Weniger" incrementLabel="Mehr" />);
    expect(decOf(el).getAttribute("aria-label")).toBe("Weniger");
    expect(incOf(el).getAttribute("aria-label")).toBe("Mehr");
  });

  it("and the THIRD string is reachable without a prop (N4)", () => {
    // The JSDoc's load-bearing claim: `aria-roledescription` is deliberately not a prop
    // because the attribute already reaches the input through the ordinary spread, and Base
    // UI merges a caller's props AFTER its own. If that merge order ever reverses, the
    // refusal becomes a defect — so the refusal is law-tested rather than asserted in prose.
    expect(inputOf(render(<NumberField />)).getAttribute("aria-roledescription")).toBe("Number field");
    expect(
      inputOf(render(<NumberField aria-roledescription="Zahlenfeld" />)).getAttribute(
        "aria-roledescription",
      ),
    ).toBe("Zahlenfeld");
  });
});

describe("the value has a floor, and the trailing stepper stays inside the box (N2)", () => {
  /**
   * THE DEFECT, measured before the fix: in a four-column grid on a phone the field was handed
   * 80.25px, the input shrank to 0 and the increase stepper painted 16.75px OUTSIDE the
   * field's own border — a control that had eaten the one thing it exists to show.
   *
   * THE FIXTURE IS THE LAW. A field in ordinary flow shrink-wraps and can never show this;
   * only a STRETCHED item in a track narrower than the component's own anatomy can. Each field
   * is pinned to its own column of a real four-column grid at 390px, which is the audit's own
   * case, and the vacuity guard below asserts the squeeze is real — without it every
   * assertion here passes against a field that was never squeezed at all.
   */
  const PHONE = 390;
  const COLUMNS = 4;
  /**
   * THE TRACK HAS TO BE THE AUDIT'S TRACK, and getting this wrong made these four laws
   * unfalsifiable on their first write (2026-09-12, caught by the sabotage pass). A bare
   * `390 / 4` is 97.5px, which leaves the value room at every index no matter what the floor
   * does — so deleting `min-inline-size` entirely left all four green, and a fixture that
   * cannot tell a correct implementation from a broken one is the defect, not the law.
   *
   * The audit measured 80.25px fields, because a real phone screen has a page inset and the
   * columns have a gutter. With both, the track is (390 - 32 - 3 x 8) / 4 = 83.5px, which is
   * the arrangement the defect was found in and the one where the value's share is genuinely
   * the thing in question.
   */
  const INSET = 16;
  const GUTTER = 8;
  const TIGHT_COLUMNS = 6;
  const track = (columns: number) => (PHONE - 2 * INSET - (columns - 1) * GUTTER) / columns;

  /**
   * TWO ARRANGEMENTS, BECAUSE N2 IS TWO CLAIMS THAT NEED OPPOSITE ONES — and writing it as one
   * made four laws unfalsifiable on the first pass (2026-09-12, caught by the sabotage run).
   *
   * A grid item's automatic minimum is its min-content, so an ORDINARY item refuses to shrink
   * past the box it holds: the field takes its intrinsic width, overflows its track, and
   * everything stays inside its border — whether or not the value has a floor, which is why
   * the floor could be deleted outright with all four green. That arrangement proves
   * CONTAINMENT and cannot prove the floor.
   *
   * The defect the audit measured was the other one: a field handed 80.25px with a 0px value,
   * which requires the item to be SQUEEZABLE (`min-width: 0`, what a phone layout routinely
   * does to a grid cell). There the floor is the only thing standing between the value and
   * nothing, and the overflow it causes is the box's problem rather than the value's.
   */
  const cells = (size: Size, columns: number, squeezable: boolean) => {
    const host = render(
      <Theme>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${GUTTER}px`,
            padding: `${INSET}px`,
            width: `${PHONE}px`,
            boxSizing: "border-box",
          }}
        >
          {Array.from({ length: columns }, (_, i) => (
            <NumberField
              key={i}
              size={size}
              defaultValue={12}
              style={{ gridColumnStart: i + 1, gridRowStart: 1, ...(squeezable ? { minWidth: 0 } : {}) }}
            />
          ))}
        </div>
      </Theme>,
    );
    return [...host.querySelectorAll<HTMLElement>(".kui-number-field")];
  };

  /**
   * THREE DIGIT ADVANCES, MEASURED IN THE VALUE'S OWN FACE — never computed from the token the
   * implementation writes, which would re-derive the answer from the same input. A `ch` IS a
   * digit advance under `tabular-nums`, so the probe carries the input's own resolved font and
   * renders the digits themselves.
   */
  function digitAdvances(field: HTMLElement, n: number): number {
    const s = getComputedStyle(inputOf(field));
    const probe = document.createElement("span");
    probe.style.position = "absolute";
    probe.style.whiteSpace = "pre";
    probe.style.font = `${s.fontWeight} ${s.fontSize} / ${s.lineHeight} ${s.fontFamily}`;
    probe.style.fontVariantNumeric = s.fontVariantNumeric;
    probe.style.letterSpacing = s.letterSpacing;
    probe.textContent = "0".repeat(n);
    field.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  }

  it("the instrument is calibrated before its output is evidence", () => {
    // Two canvas measurements were wrong before they were right in this repo (2026-08-08,
    // 2026-08-24) and both failed silently. A ruler that answers zero, or that is not linear
    // in the number of digits, would make every law below pass.
    const field = render(<NumberField defaultValue={12} />);
    const one = digitAdvances(field, 1);
    expect(one, "the ruler measures nothing").toBeGreaterThan(3);
    expect(digitAdvances(field, 3)).toBeCloseTo(one * 3, 1);
  });

  for (const size of SIZES) {
    it(`size ${size}: a squeezable cell on a 390px window still holds the value (N2)`, () => {
      // THE AUDIT'S OWN CASE. Four columns on a phone, each cell squeezable — the field is
      // handed less room than it needs, and the only question is what pays for it. Before the
      // floor the answer was the value: input 0px, in every cell, from size 2 up.
      //
      // THE LADDER IS WALKED AND IT IS NOT UNIFORM, which is worth stating rather than leaving
      // a reader to discover. Measured with the floor deleted: size 1 keeps its value anyway
      // (its two steppers are small enough that an 83.5px cell still leaves more than three
      // digits), size 2 collapses to 11.5px, and sizes 3 and 4 to 0. So the defect this law
      // exists for is real from the second rung up, and the first rung is here because a law
      // about a ladder that skipped a rung would be a law about the rungs somebody chose.
      const fields = cells(size, COLUMNS, true);
      expect(fields, "the fixture did not render four fields").toHaveLength(COLUMNS);
      for (const [i, field] of fields.entries()) {
        // THE FIXTURE'S OWN VACUITY GUARD: the squeeze must have REACHED the field, or this is
        // a law about a field standing in open space. A cell that refused its track would be
        // the other arrangement, and the other law.
        expect(
          field.getBoundingClientRect().width,
          `size ${size}, field ${i}: the cell was not actually squeezed`,
        ).toBeLessThanOrEqual(track(COLUMNS) + 1);
        // THE CLAIM: two digits and the caret's column survive it.
        expect(
          inputOf(field).getBoundingClientRect().width,
          `size ${size}, field ${i}: the value was squeezed out of the field`,
        ).toBeGreaterThanOrEqual(digitAdvances(field, 3) - 0.5);
      }
    });

    it(`size ${size}: an ordinary cell refuses its track, and nothing paints outside the field`, () => {
      // The other half, and the other arrangement. An ordinary grid item will not shrink past
      // what it holds, so a track narrower than the component's own anatomy is refused rather
      // than absorbed — and the increase stepper, which is what the audit saw 16.75px outside
      // the border, stays inside it.
      const fields = cells(size, TIGHT_COLUMNS, false);
      expect(fields).toHaveLength(TIGHT_COLUMNS);
      for (const [i, field] of fields.entries()) {
        const box = field.getBoundingClientRect();
        // Vacuity: the track has to be the narrower of the two, or nothing was refused.
        expect(
          box.width,
          `size ${size}, field ${i}: the field did not refuse its track`,
        ).toBeGreaterThan(track(TIGHT_COLUMNS));
        expect(
          incOf(field).getBoundingClientRect().right,
          `size ${size}, field ${i}: the increase stepper painted outside the field`,
        ).toBeLessThanOrEqual(box.right + 0.5);
        expect(decOf(field).getBoundingClientRect().left).toBeGreaterThanOrEqual(box.left - 0.5);
      }
    });
  }

  it("it is a FLOOR and not a width — a long value still scrolls inside the box", () => {
    // The half a `min-inline-size` can break: the family's `min-width: 0` is what lets a long
    // value scroll instead of pushing the trailing slot out, and a floor must not undo it.
    const el = render(<NumberField style={{ width: "220px" }} defaultValue={1} />);
    inputOf(el).value = "1".repeat(400);
    expect(incOf(el).getBoundingClientRect().right).toBeLessThanOrEqual(
      el.getBoundingClientRect().right + 1,
    );
  });

  it("and above the floor the value still takes what the slots leave", () => {
    const narrow = render(<NumberField style={{ width: "220px" }} />);
    const wide = render(<NumberField style={{ width: "420px" }} />);
    expect(inputOf(wide).getBoundingClientRect().width).toBeGreaterThan(
      inputOf(narrow).getBoundingClientRect().width,
    );
  });

  it("the floor survives a stated width BELOW the component's own anatomy — the recorded limit", () => {
    // The honest boundary, stated rather than hidden: a call site that pins a field narrower
    // than two steppers and a value gets exactly that, and the overflow is the call site's.
    // What the component still refuses to give up is the value's own room, which is the one
    // thing a number field exists to show.
    const el = render(<NumberField style={{ width: "40px" }} defaultValue={12} />);
    expect(inputOf(el).getBoundingClientRect().width).toBeGreaterThanOrEqual(
      digitAdvances(el, 3) - 0.5,
    );
    // Stated as the measurement it is: the box is smaller than what it holds.
    expect(el.getBoundingClientRect().width).toBeLessThan(
      decOf(el).getBoundingClientRect().width + incOf(el).getBoundingClientRect().width + digitAdvances(el, 3),
    );
  });
});

describe("the value is a number, and it is dressed like one (§15)", () => {
  it("every digit takes one advance — and the field beside it does not", () => {
    /**
     * THIS LAW FOUND A LIVE DEFECT ON ITS FIRST RUN (2026-09-12), and the shape of it is why it
     * measures a RENDERED ADVANCE rather than reading the declaration back. The input computed
     * `font-variant-numeric: normal` — a NumberField had never once rendered tabular figures —
     * because `.kui-field-input` declares `font: inherit` and the `font` SHORTHAND resets every
     * font-variant longhand, at equal specificity and later in the entry order. The declaration
     * was in the stylesheet, spelled correctly, and lost the cascade.
     *
     * So the probe carries the input's RESOLVED variant (never the one the author intended) and
     * renders real digits in the input's own face. "1" and "0" have different advances in this
     * face proportionally and the same advance tabular, which is what makes the measurement able
     * to tell the two apart — and the calibration below is what says so rather than assuming it.
     */
    const el = render(<NumberField />);
    const width = (text: string, variant?: string) => {
      const s = getComputedStyle(inputOf(el));
      const probe = document.createElement("span");
      probe.style.position = "absolute";
      probe.style.whiteSpace = "pre";
      probe.style.font = `${s.fontWeight} ${s.fontSize} / ${s.lineHeight} ${s.fontFamily}`;
      probe.style.fontVariantNumeric = variant ?? s.fontVariantNumeric;
      probe.textContent = text;
      el.append(probe);
      const w = probe.getBoundingClientRect().width;
      probe.remove();
      return w;
    };
    // CALIBRATION FIRST. A face with no tabular set renders both spellings identically, and
    // every assertion below would then pass against a dead declaration — the law would be
    // about the font rather than about the component.
    expect(width("111", "normal"), "the face makes no difference between its figures").not.toBeCloseTo(
      width("000", "normal"),
      1,
    );
    expect(width("111", "tabular-nums")).toBeCloseTo(width("000", "tabular-nums"), 1);
    // THE CLAIM: at the variant the input actually resolves, a 1 is as wide as a 0.
    expect(width("111")).toBeCloseTo(width("000"), 1);
    expect(computed(inputOf(el), "font-variant-numeric")).toBe("tabular-nums");
    // The negative control: the rule is the number field's, not the family's. A TextField's
    // value is prose and keeps the face's proportional figures.
    expect(computed(within(render(twin()), ".kui-field-input"), "font-variant-numeric")).not.toBe(
      "tabular-nums",
    );
  });

  it("the value is centred, and its box sits symmetrically between the two steppers", () => {
    // Two claims, because either alone is satisfied by the broken state: the TEXT is centred
    // inside its box (the platform's `text-align`, read as a computed value), and the BOX is
    // centred between the controls either side of it (the geometry, measured). A field that
    // centred its text inside a box shoved against one stepper would pass the first.
    const el = render(<NumberField defaultValue={7} />);
    expect(computed(inputOf(el), "text-align")).toBe("center");
    const value = inputOf(el).getBoundingClientRect();
    const left = value.left - decOf(el).getBoundingClientRect().right;
    const right = incOf(el).getBoundingClientRect().left - value.right;
    expect(Math.abs(left - right), "the value is not centred between its steppers").toBeLessThanOrEqual(1);
    // The negative control, one component over: a TextField reads from its leading edge.
    expect(computed(within(render(twin()), ".kui-field-input"), "text-align")).not.toBe("center");
  });

  it("the value wears content weight — regular, not the control's medium", () => {
    const el = render(<NumberField defaultValue={7} />);
    expect(computed(inputOf(el), "font-weight")).toBe("400");
    // And the steppers beside it keep the skeleton's own label weight.
    expect(computed(decOf(el), "font-weight")).toBe("500");
  });

  it("`format` is Intl, applied to the rendered value — which is why there are no adornments", () => {
    // The refusal this law licenses: a unit, a currency or a percent belongs in `format`,
    // because Intl writes it into the value in the reader's locale, announces it as part of
    // the number, and parses it back out. An adornment beside the input could do none of the
    // three — so if `format` did not reach the rendered value, the refusal would be a hole.
    const currency = render(
      <NumberField locale="en-US" format={{ style: "currency", currency: "USD" }} defaultValue={1234.5} />,
    );
    expect(inputOf(currency).value).toBe("$1,234.50");
    const percent = render(<NumberField locale="en-US" format={{ style: "percent" }} defaultValue={0.42} />);
    expect(inputOf(percent).value).toBe("42%");
    // The plain case, so "format did something" cannot be mistaken for "the value is always
    // decorated": with no format the number arrives as a number.
    expect(inputOf(render(<NumberField locale="en-US" defaultValue={1234.5} />)).value).toBe("1,234.5");
  });
});

describe("stepping: the buttons, the keyboard, and the bounds (§4)", () => {
  const key = (input: HTMLInputElement, init: KeyboardEventInit) =>
    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));

  /**
   * WAIT FOR THE VALUE, THEN ASSERT IT (ENGINEERING §6, 2026-08-21).
   *
   * A step lands in React state and the input's TEXT is written on the commit that follows, so
   * every law in this block first read the frame its gesture returned on and reported a
   * component that does not step at all. It steps: `onValueChange` fires synchronously with the
   * number, which is how "the read was early" was told apart from "the gesture did nothing".
   * Nothing is lost by waiting — a value that never arrives expires the deadline into the same
   * assertion, with the same string in the message.
   */
  const reads = async (input: HTMLInputElement, value: string): Promise<string> => {
    await until(() => input.value === value);
    return input.value;
  };

  /**
   * A NON-EVENT, given a ceiling rather than raced. The claim is "this gesture changed nothing",
   * and there is nothing to wait FOR — so the wait is inverted: watch for a change for a
   * generous window, and assert the value that survived it. A slower machine can only give a
   * late change more room to appear, never less, which is the one direction that keeps a
   * non-event law honest. The live laws above are what prove the gesture itself is real.
   */
  const stays = async (input: HTMLInputElement, value: string): Promise<string> => {
    await until(() => input.value !== value, 300);
    return input.value;
  };

  /**
   * AND EVERY PRESS IS SETTLED BEFORE THE NEXT ONE, which is not ceremony either. Two gestures
   * fired inside one frame both step from the value React has COMMITTED, so a pair of
   * decrements read 6 -> 5 and then 6 -> 5 again and the law reported a component that steps
   * once and stops. Nobody can press a button twice inside a frame; a law that does is
   * measuring the scheduler. Asserting each rung on the way is the stronger claim anyway — the
   * endpoint alone is satisfied by a step of the wrong size in the right direction.
   */
  it("the steppers step by `step`, in their own directions", async () => {
    const el = render(<NumberField defaultValue={5} step={1} locale="en-US" />);
    const input = inputOf(el);
    incOf(el).click();
    expect(await reads(input, "6")).toBe("6");
    decOf(el).click();
    expect(await reads(input, "5")).toBe("5");
    decOf(el).click();
    expect(await reads(input, "4")).toBe("4");
  });

  it("the arrow keys step from the value, which is why the steppers need no tab stop", async () => {
    const el = render(<NumberField defaultValue={5} step={1} locale="en-US" />);
    const input = inputOf(el);
    input.focus();
    key(input, { key: "ArrowUp" });
    expect(await reads(input, "6")).toBe("6");
    key(input, { key: "ArrowDown" });
    expect(await reads(input, "5")).toBe("5");
    key(input, { key: "ArrowDown" });
    expect(await reads(input, "4")).toBe("4");
    input.blur();
  });

  it("Shift takes the large step and Alt the small one — one key, three amounts", async () => {
    const el = render(<NumberField defaultValue={0} step={1} largeStep={10} smallStep={0.1} locale="en-US" />);
    const input = inputOf(el);
    input.focus();
    key(input, { key: "ArrowUp", shiftKey: true });
    expect(await reads(input, "10"), "Shift did not take the large step").toBe("10");
    key(input, { key: "ArrowDown", altKey: true });
    expect(await reads(input, "9.9"), "Alt did not take the small step").toBe("9.9");
    input.blur();
  });

  it("Home and End jump to the bounds, and only when a bound is stated", async () => {
    const bounded = render(<NumberField defaultValue={5} min={1} max={9} locale="en-US" />);
    const input = inputOf(bounded);
    input.focus();
    key(input, { key: "End" });
    expect(await reads(input, "9")).toBe("9");
    key(input, { key: "Home" });
    expect(await reads(input, "1")).toBe("1");
    input.blur();

    // Unbounded, the keys mean what they mean everywhere else in a text field: move the caret.
    // The vacuity guard for the pair above — without it, a component that ignored Home and End
    // entirely would fail the first half loudly and this half would say nothing.
    const open = render(<NumberField defaultValue={5} locale="en-US" />);
    const free = inputOf(open);
    free.focus();
    key(free, { key: "Home" });
    expect(await stays(free, "5")).toBe("5");
    free.blur();
  });

  it("PageUp and PageDown do NOT step — Base UI binds neither, and this is the record of it", async () => {
    // Measured, not assumed. Base UI 1.7's input handler lets multi-character keys it does not
    // act on through to the browser and names PageUp in its own comment, so the large step is
    // Shift+Arrow and nothing else. Written as a law because the alternative is a reader
    // discovering it by pressing the key: if a future Base UI binds them, this fails and the
    // component owes a decision rather than a silent new behaviour.
    const el = render(<NumberField defaultValue={5} largeStep={10} locale="en-US" />);
    const input = inputOf(el);
    input.focus();
    key(input, { key: "PageUp" });
    key(input, { key: "PageDown" });
    expect(await stays(input, "5")).toBe("5");
    input.blur();
  });

  it("min and max clamp the value, whichever route it arrives by", async () => {
    const el = render(<NumberField defaultValue={9} min={0} max={10} step={5} locale="en-US" />);
    incOf(el).click();
    expect(await reads(inputOf(el), "10"), "a step past the bound was not clamped to it").toBe("10");
    incOf(el).click();
    expect(await stays(inputOf(el), "10")).toBe("10");
  });

  it("a stepper at its bound is DISABLED — it stays in place and stops looking pressable", async () => {
    // The component's own sentence, and both halves are the law: the box must not move (so a
    // column of fields does not reflow as values reach their bounds) and the control must stop
    // promising. The behaviour is read by pressing it, never by reading an attribute.
    const el = render(<NumberField defaultValue={0} min={0} max={10} locale="en-US" />);
    const dec = decOf(el);
    const before = dec.getBoundingClientRect();
    expect(dec.getAttribute("data-disabled") !== null || dec.disabled).toBe(true);
    dec.click();
    expect(await stays(inputOf(el), "0"), "a stepper at its bound still stepped").toBe("0");
    expect(dec.getBoundingClientRect().width).toBeCloseTo(before.width, 1);
    // And its live twin is not disabled, or this law is about a field with two dead buttons.
    expect(incOf(el).getAttribute("data-disabled") !== null || incOf(el).disabled).toBe(false);
    // It stays FOCUSABLE while disabled (`focusableWhenDisabled`), because a stepper that went
    // natively disabled mid-hold would drop the press it is in.
    dec.focus();
    expect(document.activeElement).toBe(dec);
    dec.blur();
  });

  it("a read-only field steps by nothing, and its value is still live", async () => {
    const el = render(<NumberField defaultValue={5} readOnly locale="en-US" />);
    for (const stepper of [decOf(el), incOf(el)]) {
      expect(stepper.getAttribute("data-disabled") !== null || stepper.disabled).toBe(true);
      stepper.click();
    }
    expect(await stays(inputOf(el), "5")).toBe("5");
    // readOnly is not disabled: the value is focusable, selectable and submitted.
    expect(inputOf(el).disabled).toBe(false);
    inputOf(el).focus();
    expect(document.activeElement).toBe(inputOf(el));
    // And the keyboard is refused too, or the steppers are the only thing that was read-only.
    key(inputOf(el), { key: "ArrowUp" });
    expect(await stays(inputOf(el), "5")).toBe("5");
    inputOf(el).blur();
  });

  it("a disabled field steps by nothing either", async () => {
    const el = render(<NumberField defaultValue={5} disabled locale="en-US" />);
    incOf(el).click();
    expect(await stays(inputOf(el), "5")).toBe("5");
  });

  it("reports the number, not a string — the reason `onChange` is refused", () => {
    const seen: unknown[] = [];
    const el = render(
      <NumberField defaultValue={5} step={1} locale="en-US" onValueChange={(v) => seen.push(v)} />,
    );
    incOf(el).click();
    expect(seen).toEqual([6]);
    expect(typeof seen[0]).toBe("number");
  });
});

describe("the unit and the form (§28, §3)", () => {
  it("a Field prices the whole unit, and the control takes its index", () => {
    const unit = mounted(
      <Field size="4">
        <FieldLabel>Seats</FieldLabel>
        <NumberField />
      </Field>,
      { theme: {}, select: ".kui-number-field" },
    );
    const twinFour = mounted(<NumberField size="4" />, { theme: {}, select: ".kui-number-field" });
    const twinTwo = mounted(<NumberField size="2" />, { theme: {}, select: ".kui-number-field" });
    expect(computed(unit, "min-height")).toBe(computed(twinFour, "min-height"));
    // The negative control: if the supply were dead this would be the family's own rest.
    expect(computed(unit, "min-height")).not.toBe(computed(twinTwo, "min-height"));
    // And it reaches the hosted controls too, which is the thing a size context can silently
    // fail to do — the steppers derive from the container, not from an index of their own.
    expect(decOf(unit).getBoundingClientRect().height).toBeCloseTo(
      decOf(twinFour).getBoundingClientRect().height,
      1,
    );
  });

  it("an explicit index still wins over the unit's", () => {
    const el = mounted(
      <Field size="4">
        <FieldLabel>Seats</FieldLabel>
        <NumberField size="1" />
      </Field>,
      { theme: {}, select: ".kui-number-field" },
    );
    expect(computed(el, "min-height")).toBe(
      computed(mounted(<NumberField size="1" />, { theme: {}, select: ".kui-number-field" }), "min-height"),
    );
  });

  it("a Field's label points at the value, and clicking it lands the caret there", () => {
    const root = mounted(
      <Field>
        <FieldLabel>Seats</FieldLabel>
        <NumberField />
      </Field>,
      { theme: {} },
    );
    const label = within(root, "label");
    const input = inputOf(within(root, ".kui-number-field"));
    expect(label.getAttribute("for")).toBe(input.id);
    label.click();
    expect(document.activeElement).toBe(input);
    input.blur();
  });

  it("the NUMBER is what a form submits, never the letters on screen", () => {
    const form = within(
      render(
        <Theme>
          <form>
            <NumberField name="seats" defaultValue={3} locale="en-US" format={{ style: "currency", currency: "USD" }} />
          </form>
        </Theme>,
      ),
      "form",
    ) as HTMLFormElement;
    const field = within(form, ".kui-number-field");
    // The visible value is formatted prose; the submitted one is a number.
    expect(inputOf(field).value).toBe("$3.00");
    expect(new FormData(form).get("seats")).toBe("3");
    // The carrier is a real, hidden, out-of-tab-order input — so `name` is not on the element
    // a person types into and cannot submit the formatted text.
    const hidden = within(form, 'input[type="number"]') as HTMLInputElement;
    expect(hidden.getAttribute("aria-hidden")).toBe("true");
    expect(hidden.tabIndex).toBe(-1);
    expect(inputOf(field).getAttribute("name")).toBe(null);
  });

  it("`required` is the form's constraint, on the element that carries the value", () => {
    const formIn = (ui: React.ReactElement) => within(render(ui), "form") as HTMLFormElement;
    const empty = formIn(
      <Theme>
        <form>
          <NumberField name="seats" required />
        </form>
      </Theme>,
    );
    expect(empty.checkValidity(), "an empty required number field reported itself valid").toBe(false);
    const filled = formIn(
      <Theme>
        <form>
          <NumberField name="seats" required defaultValue={1} />
        </form>
      </Theme>,
    );
    expect(filled.checkValidity()).toBe(true);
  });

  it("ref reaches the visible INPUT — what a caller holds a number field for", () => {
    let node: HTMLInputElement | null = null;
    const el = render(
      <NumberField
        ref={(n) => {
          node = n;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLInputElement);
    expect(node).toBe(inputOf(el));
    node!.focus();
    expect(document.activeElement).toBe(node);
    node!.blur();
  });

  it("className and style dress the WRAPPER, so a width sizes the field not the digits", () => {
    const el = render(<NumberField className="mine" style={{ maxWidth: "300px" }} />);
    expect(el.className.split(" ").sort()).toEqual([
      "kui-control",
      "kui-field",
      "kui-number-field",
      "mine",
    ]);
    expect(computed(el, "max-width")).toBe("300px");
    expect(computed(inputOf(el), "max-width")).not.toBe("300px");
  });

  it("id goes to the input, so a <label for> and Field.Label both land where the platform expects", () => {
    expect(inputOf(render(<NumberField id="probe" />)).id).toBe("probe");
  });
});

describe("the API's closed edges (§3, §4, §11)", () => {
  it("no loudness, no tone, no outer spacing — the field family's refusal verbatim", () => {
    // @ts-expect-error — fields do not rank against each other (§11)
    void (<NumberField emphasis="loud" />);
    // @ts-expect-error — validity is state, not a tone
    void (<NumberField tone="destructive" />);
    // @ts-expect-error — no margin prop on any control (first non-negotiable)
    void (<NumberField m="4" />);
    // @ts-expect-error — `size` is the index, never the platform's character count
    void (<NumberField size={20} />);
  });

  it("no slots — the slots ARE the steppers, and a unit belongs in `format`", () => {
    // @ts-expect-error — the leading slot is the decrease stepper
    void (<NumberField leading={<span>$</span>} />);
    // @ts-expect-error — the trailing slot is the increase stepper
    void (<NumberField trailing={<span>kg</span>} />);
  });

  it("no render escape, no children, and no second spelling of the value", () => {
    // @ts-expect-error — there are two elements here and neither can move (TextField's refusal)
    void (<NumberField render={<div />} />);
    // @ts-expect-error — a void element has no children; the slots are the steppers
    void (<NumberField>5</NumberField>);
    // @ts-expect-error — the value arrives as a number through `onValueChange`
    void (<NumberField onChange={() => {}} />);
    // @ts-expect-error — always text with a computed inputMode; a native number input is what
    // this component exists to replace
    void (<NumberField type="number" />);
    // @ts-expect-error — the keypad is derived from `format`, not stated
    void (<NumberField inputMode="text" />);
  });
});
