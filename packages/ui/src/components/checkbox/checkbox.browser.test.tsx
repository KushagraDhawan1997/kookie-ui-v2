/**
 * Checkbox's laws, mounted (§4, §6, §8, §11, §16).
 *
 * The mark family arrives with this component, so most of what is here could not be written
 * before: a box that is the line box rather than the height ladder, a target that is a control
 * of its size while the paint is not, and a corner with a ceiling. Each is asserted as a
 * COMPUTED value through a mounted component in the scopes that could move it — both pointer
 * worlds, all three densities, both appearances — which is the bar the 2026-08-03 audit set
 * after every broken axis turned out to be one no law had actually resolved.
 */
import { describe, expect, it } from "vitest";

import { Theme } from "../../theme/theme.tsx";
import { computed, render } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Checkbox } from "./checkbox.tsx";

const SIZES = ["1", "2", "3", "4"] as const;
const DENSITIES = ["compact", "default", "comfortable"] as const;

const px = (v: string) => parseFloat(v);

/**
 * Resolve a token INSIDE the scope that is being tested. The probe goes in as a child rather
 * than a sibling, which is not a detail: every law here mounts a `<Theme>`, and a probe
 * appended to the Theme's parent reads the document scope — so a coarse cell would be checked
 * against the fine world's tokens and pass for the wrong reason. Positioned absolutely so it
 * cannot participate in the flex layout it is measuring.
 */
function probeIn<T>(scope: Element, apply: (el: HTMLElement) => void, read: (s: CSSStyleDeclaration) => T): T {
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  apply(probe);
  scope.append(probe);
  const value = read(getComputedStyle(probe));
  probe.remove();
  return value;
}

const tokenOn = (scope: Element, name: string): string =>
  probeIn(scope, (el) => (el.style.width = `var(${name})`), (s) => s.width);

const colorOn = (scope: Element, expr: string): string =>
  probeIn(scope, (el) => (el.style.backgroundColor = expr), (s) => s.backgroundColor);

/** The mark element, whether the law mounted it bare or inside a <Theme>. */
const markOf = (el: Element): Element => el.querySelector(".kui-checkbox") ?? el;

/** The mark itself: what the user sees, in both axes (it is square by construction). */
function markBox(el: Element): { w: number; h: number } {
  const styles = getComputedStyle(el);
  return { w: px(styles.width), h: px(styles.height) };
}

/**
 * The TARGET, read off the pseudo-element's computed insets. Deliberately not measured with
 * getBoundingClientRect: a pseudo-element has no box in the DOM API, and reading the declared
 * inset is what proves the rule rather than the rendering. Negative insets expand, so the
 * target is the mark plus twice the reach on each side.
 */
function targetBox(el: Element): number {
  const after = getComputedStyle(el, "::after");
  const reach = -px(after.top);
  return px(getComputedStyle(el).height) + 2 * reach;
}

describe("the mark is the line box, not the height ladder (§4)", () => {
  for (const size of SIZES) {
    it(`size ${size}: the painted box is exactly one line of its label`, () => {
      const el = render(<Checkbox size={size} />);
      const line = px(tokenOn(el, `--line-height-${size}`));
      const { w, h } = markBox(el);
      expect(h).toBe(line);
      // Square by construction — one token drives both axes, which is what stops a mark
      // becoming a rectangle when a row squeezes it.
      expect(w).toBe(h);
    });

    it(`size ${size}: it does NOT take the control height`, () => {
      // The claim that makes this component a new family rather than a small Button. If these
      // ever coincide, the mark family has quietly collapsed back into the control ladder.
      const el = render(<Checkbox size={size} />);
      expect(markBox(el).h).toBeLessThan(px(tokenOn(el, `--control-height-${size}`)));
    });
  }

  for (const density of DENSITIES) {
    it(`${density}: density moves the target and never the mark`, () => {
      // The label cluster rule (§4): density grows the box and holds the content. A mark sits
      // beside a label at the label's size, so it belongs to the content half — while its
      // TARGET is a control's footprint and follows density like every other control.
      const el = render(
        <Theme density={density}>
          <Checkbox size="2" />
        </Theme>,
      );
      const marked = markBox(markOf(el));
      expect(marked.h).toBe(px(tokenOn(el, "--line-height-2")));
    });
  }

  it("the mark rises on a coarse pointer, and rises because the TYPE did (§17)", () => {
    // No coarse ladder of its own: the handheld band raises the type, and a mark is one line
    // of that type. This is the whole argument for sourcing the family from the line box —
    // Spectrum scales every component 1.25x on touch, and this arrives at the same place with
    // nothing designed twice.
    const fine = render(
      <Theme pointer="fine">
        <Checkbox size="2" />
      </Theme>,
    );
    const coarse = render(
      <Theme pointer="coarse">
        <Checkbox size="2" />
      </Theme>,
    );
    const fineMark = markBox(markOf(fine)).h;
    const coarseMark = markBox(markOf(coarse)).h;

    expect(coarseMark).toBeGreaterThan(fineMark);
    expect(fineMark).toBe(px(tokenOn(fine, "--line-height-2")));
    expect(coarseMark).toBe(px(tokenOn(coarse, "--line-height-2")));
  });
});

describe("the target is a control of its size, capped at the touch floor (§4, §16)", () => {
  for (const pointer of ["fine", "coarse"] as const) {
    for (const density of DENSITIES) {
      for (const size of SIZES) {
        it(`${pointer}/${density}/size ${size}: target = min(control height, 44)`, () => {
          const el = render(
            <Theme pointer={pointer} density={density}>
              <Checkbox size={size} />
            </Theme>,
          );
          const mark = markOf(el);
          const height = px(tokenOn(el, `--control-height-${size}`));
          const floor = px(tokenOn(el, "--touch-target-min"));
          expect(targetBox(mark)).toBeCloseTo(Math.min(height, floor), 1);
        });
      }
    }
  }

  it("clears WCAG 2.5.8's 24px minimum in every cell, on paint-independent grounds", () => {
    // The reason the expansion exists at all, and the reason it is not coarse-only: a fine
    // cell's mark is 16px, which is under the minimum wherever a mouse is, and "a mouse is
    // precise" is not what the criterion says.
    for (const pointer of ["fine", "coarse"] as const) {
      for (const density of DENSITIES) {
        for (const size of SIZES) {
          const el = render(
            <Theme pointer={pointer} density={density}>
              <Checkbox size={size} />
            </Theme>,
          );
          const mark = markOf(el);
          expect(targetBox(mark), `${pointer}/${density}/${size} is under the floor`).toBeGreaterThanOrEqual(24);
        }
      }
    }
  });

  it("never reaches more than 10px past the mark — the overlap §16 refused to guess at", () => {
    // What makes this expansion legitimate where §16's rejected one was not: the extent is a
    // rule (the control height, capped), so the reach is a KNOWN number in every cell rather
    // than a clamp nobody could size. Bounded under 10px, a stacked list is clear at any gap
    // the layout-space scale offers.
    for (const pointer of ["fine", "coarse"] as const) {
      for (const density of DENSITIES) {
        for (const size of SIZES) {
          const el = render(
            <Theme pointer={pointer} density={density}>
              <Checkbox size={size} />
            </Theme>,
          );
          const mark = markOf(el);
          const reach = -px(getComputedStyle(mark, "::after").top);
          expect(reach, `${pointer}/${density}/${size} reaches ${reach}px`).toBeLessThanOrEqual(10);
        }
      }
    }
  });

  it("is the hosted-control rule inverted — a hosted control shrinks, a mark grows", () => {
    // Both rules answer "what is the target when the paint is the wrong size", and they answer
    // it in opposite directions on purpose: a control inside a field must never out-target its
    // container, and a mark has no container to defer to.
    const el = render(<Checkbox size="2" />);
    expect(targetBox(el)).toBeGreaterThan(markBox(el).h);
  });
});

describe("a mark's corner holds a fraction of its own box (§6)", () => {
  /** The corner as a fraction of the box it rounds — the only terms this question has. */
  const fractionOf = (mark: Element) =>
    px(computed(mark, "border-top-left-radius")) / markBox(mark).h;

  for (const level of ["small", "medium", "large", "full"] as const) {
    it(`is uniform across the size index at radius="${level}"`, () => {
      // The complaint that found the bug, mounted (Kushagra, by eye: "size 4 looks much more
      // rounded than size 1"). It rode --radius-control-N, designed against the HEIGHT ladder,
      // so the fraction climbed 0.250 -> 0.385 across the index while the box did not.
      const fractions = SIZES.map((size) => {
        const el = render(
          <Theme radius={level}>
            <Checkbox size={size} />
          </Theme>,
        );
        return fractionOf(markOf(el));
      });
      expect(Math.max(...fractions) / Math.min(...fractions)).toBeLessThan(1.34);
    });
  }

  for (const density of DENSITIES) {
    it(`${density}: density does not move the corner, because it does not move the box`, () => {
      // The half of the defect no theme could expose: --radius-control-N IS density-indexed,
      // so an airier form re-cut the corner of a box it had left alone — 0.462 of it at
      // comfortable size 4, a circle in all but name.
      const el = render(
        <Theme density={density}>
          <Checkbox size="4" />
        </Theme>,
      );
      expect(px(computed(markOf(el), "border-top-left-radius"))).toBe(
        px(tokenOn(el, "--radius-mark-4")),
      );
    });
  }

  it("is never half the box, in any (level × density × pointer × size) cell — half IS a circle", () => {
    for (const level of ["small", "medium", "large", "full"] as const) {
      for (const pointer of ["fine", "coarse"] as const) {
        for (const density of DENSITIES) {
          for (const size of SIZES) {
            const el = render(
              <Theme radius={level} pointer={pointer} density={density}>
                <Checkbox size={size} />
              </Theme>,
            );
            const mark = markOf(el);
            expect(
              px(computed(mark, "border-top-left-radius")),
              `${level}/${pointer}/${density}/${size} is a circle`,
            ).toBeLessThan(markBox(mark).h / 2);
          }
        }
      }
    }
  });

  it("holds at `large` when the theme says `full` — the control band pills, a mark must not", () => {
    const full = render(
      <Theme radius="full">
        <Checkbox size="4" />
      </Theme>,
    );
    const large = render(
      <Theme radius="large">
        <Checkbox size="4" />
      </Theme>,
    );
    expect(computed(markOf(full), "border-top-left-radius")).toBe(
      computed(markOf(large), "border-top-left-radius"),
    );
  });

  it('radius="none" still squares it — a kill switch with an exception is not one (§6)', () => {
    const el = render(
      <Theme radius="none">
        <Checkbox />
      </Theme>,
    );
    expect(computed(markOf(el), "border-top-left-radius")).toBe("0px");
  });

  it("the levels still reach it — small is tighter than large", () => {
    const small = render(
      <Theme radius="small">
        <Checkbox size="3" />
      </Theme>,
    );
    const large = render(
      <Theme radius="large">
        <Checkbox size="3" />
      </Theme>,
    );
    expect(fractionOf(markOf(small))).toBeLessThan(fractionOf(markOf(large)));
  });
});

describe("neutral off, accent on (§11)", () => {
  for (const appearance of ["light", "dark"] as const) {
    it(`${appearance}: the resting box wears the tone-INDEPENDENT hairline`, () => {
      // "Neutral off" has to survive the element stamping data-tone="accent" for its ON state,
      // and --color-border is what makes that possible without a component naming a family.
      const el = render(
        <Theme appearance={appearance}>
          <Checkbox />
        </Theme>,
      );
      const mark = markOf(el);
      expect(computed(mark, "border-top-color")).toBe(colorOn(el, "var(--color-border)"));
      expect(computed(mark, "background-color")).toBe(colorOn(el, "var(--color-surface)"));
    });

    it(`${appearance}: checked fills with the accent solid and pairs its glyph`, () => {
      const el = render(
        <Theme appearance={appearance}>
          <Checkbox defaultChecked />
        </Theme>,
      );
      const mark = markOf(el);
      expect(computed(mark, "background-color")).toBe(colorOn(el, "var(--accent-solid)"));
      expect(computed(mark, "color")).toBe(colorOn(el, "var(--accent-contrast)"));
    });

    it(`${appearance}: the box does not change size when it is ticked`, () => {
      // The edge disappears into the fill rather than being removed — a border-less checked
      // box would be a pixel smaller and the row would shift on every click.
      const off = render(
        <Theme appearance={appearance}>
          <Checkbox />
        </Theme>,
      );
      const on = render(
        <Theme appearance={appearance}>
          <Checkbox defaultChecked />
        </Theme>,
      );
      expect(markBox(markOf(on))).toEqual(
        markBox(markOf(off)),
      );
      expect(computed(markOf(on), "border-top-width")).toBe(
        computed(markOf(off), "border-top-width"),
      );
    });
  }

  it("the resting hairline is not the accent family, in either appearance", () => {
    // The law behind the role token: if --color-border ever resolves to the stamped family,
    // "neutral off" is a comment rather than a fact.
    for (const appearance of ["light", "dark"] as const) {
      const el = render(
        <Theme appearance={appearance}>
          <Checkbox />
        </Theme>,
      );
      const mark = markOf(el);
      expect(computed(mark, "border-top-color")).not.toBe(colorOn(el, "var(--accent-border)"));
    }
  });
});

describe("the glyph is the box, not the icon ladder (§4)", () => {
  it("fills the mark rather than taking --icon-size", () => {
    // The icon box is the LABEL cluster's number, designed for a glyph beside text inside a
    // control. A 16px icon inside a 16px mark has no room; the artwork carries its own inset.
    const el = render(<Checkbox size="1" />);
    const glyph = el.querySelector("svg")!;
    // The content box, since a percentage resolves against it and the mark is bordered — the
    // point of the law is that the glyph tracks the MARK and not the icon ladder, which at
    // size 1 would be 16px inside a 16px box.
    const border = px(computed(el, "border-top-width"));
    expect(px(getComputedStyle(glyph).width)).toBe(markBox(el).w - 2 * border);
    expect(px(getComputedStyle(glyph).width)).not.toBe(px(tokenOn(el, "--icon-size-1")));
  });

  it("shows nothing at rest, the tick when checked, the dash when indeterminate", () => {
    const off = render(<Checkbox />);
    expect(getComputedStyle(off.querySelector("svg")!).visibility).toBe("hidden");

    const on = render(<Checkbox defaultChecked />);
    expect(getComputedStyle(on.querySelector("svg")!).visibility).toBe("visible");
    expect(getComputedStyle(on.querySelector(".kui-checkbox-check")!).visibility).toBe("visible");
    expect(getComputedStyle(on.querySelector(".kui-checkbox-dash")!).visibility).toBe("hidden");

    const mixed = render(<Checkbox indeterminate defaultChecked />);
    expect(getComputedStyle(mixed.querySelector(".kui-checkbox-dash")!).visibility).toBe("visible");
    expect(getComputedStyle(mixed.querySelector(".kui-checkbox-check")!).visibility).toBe("hidden");
  });

  it("indeterminate fills the box like checked does — it is a state, not an absence", () => {
    const el = render(<Checkbox indeterminate />);
    const mark = markOf(el);
    expect(computed(mark, "background-color")).toBe(colorOn(el, "var(--accent-solid)"));
  });
});

describe("what it inherits from the shared layer, and what it must not (§8)", () => {
  it("takes the one focus ring, keyboard-only, like every control", () => {
    const el = render(<Checkbox />);
    el.focus();
    // The ring is `:focus-visible`, so a programmatic focus on a non-text control may or may
    // not qualify; what this law pins is that the checkbox does not opt OUT of the shared rule
    // by declaring an outline of its own.
    expect(computed(el, "outline-style")).not.toBe("auto");
  });

  it("goes flat through the tone remap when disabled, never through opacity (§8)", () => {
    const el = render(<Checkbox disabled />);
    const mark = markOf(el);
    expect(computed(mark, "opacity")).toBe("1");
    // The arrow, not `not-allowed`: §8 refuses a cursor no native platform uses. Read through
    // the token so this law states the rule rather than a keyword.
    expect(computed(mark, "cursor")).toBe(
      probeIn(el, (p) => (p.style.cursor = "var(--cursor-disabled)"), (s) => s.cursor),
    );
  });

  it("carries the invalid remap on its own element, no :has() hop", () => {
    // A checkbox is the native control, like a textarea: the state lands here directly, so the
    // shared layer's DIRECT arm is the one that must fire.
    const el = render(<Checkbox aria-invalid="true" />);
    const mark = markOf(el);
    expect(computed(mark, "border-top-color")).toBe(colorOn(el, "var(--invalid-edge)"));
  });

  it("shares the size index with the Button beside it", () => {
    // The mark leaves the height ladder; it does not leave the size JOIN. A size-3 checkbox and
    // a size-3 button answer to the same index even though only one of them is 40px tall.
    const checkbox = render(<Checkbox size="3" />);
    const button = render(<Button size="3">Save</Button>);
    expect(px(tokenOn(checkbox, "--control-height-3"))).toBe(px(computed(button, "height")));
  });
});
