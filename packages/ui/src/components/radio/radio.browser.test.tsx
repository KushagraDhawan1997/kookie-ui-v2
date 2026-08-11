/**
 * Radio's laws, mounted (§4, §6, §8, §11).
 *
 * Most of what a radio is arrives from the mark family, whose rules the shared layer now
 * carries — and checkbox.browser.test.tsx asserts that machinery cell by cell. What is
 * asserted here is what is RADIO's: the circle that never squares, the group semantics, and
 * that the family's rules genuinely reach a second member (a promotion that only ever served
 * its first member would be a rename, not a promotion). Computed values through a mounted
 * component, both appearances — the 2026-08-03 bar.
 */
import { describe, expect, it } from "vitest";
import * as React from "react";

import { Theme } from "../../theme/theme.tsx";
import {
  APPEARANCES,
  DENSITIES,
  POINTERS,
  SIZES,
  colorOn,
  computed,
  forEachCell,
  mounted,
  render,
  tokenOn,
  within,
  inMotion,
} from "../../test/browser.tsx";
import { Checkbox } from "../checkbox/checkbox.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Radio, RadioGroup } from "./radio.tsx";

const px = (v: string) => parseFloat(v);

const markOf = (el: Element): HTMLElement => within(el, ".kui-radio");

function markBox(el: Element): { w: number; h: number } {
  const styles = getComputedStyle(el);
  return { w: px(styles.width), h: px(styles.height) };
}

describe("the mark family reaches its second member (§4)", () => {
  for (const size of SIZES) {
    it(`size ${size}: the painted box is one line of its label, square, never the height ladder`, () => {
      const el = render(<Radio value="a" size={size} />);
      const line = px(tokenOn(el, `--line-height-${size}`));
      const { w, h } = markBox(el);
      expect(h).toBe(line);
      expect(w).toBe(h);
      expect(h).toBeLessThan(px(tokenOn(el, `--control-height-${size}`)));
    });
  }

  it("the target is a control of its size capped at the touch floor, in all 24 cells", () => {
    forEachCell(({ pointer, density, size }) => {
      const el = render(
        <Theme pointer={pointer} density={density}>
          <Radio value="a" size={size} />
        </Theme>,
      );
      const mark = markOf(el);
      const height = px(tokenOn(el, `--control-height-${size}`));
      const floor = px(tokenOn(el, "--touch-target-min"));
      expect(
        px(getComputedStyle(mark, "::after").height),
        `${pointer}/${density}/${size}`,
      ).toBeCloseTo(Math.min(height, floor), 1);
    });
  });

  it("hosted in a field's slot it stays a mark and gives up its own reach (§4, audit D4)", () => {
    const el = render(
      <Theme pointer="fine">
        <TextField size="2" trailing={<Radio value="a" size="2" />} />
      </Theme>,
    );
    const mark = el.querySelector(".kui-radio")!;
    const { w, h } = markBox(mark);
    expect(w).toBe(h);
    expect(getComputedStyle(mark, "::after").content).toBe("none");
  });
});

describe("the circle is role semantics, and the radius axis never reaches it (§6)", () => {
  // The checkbox-at-`full` sentence mirrored: a circular checkbox reads as a radio, and a
  // square radio reads as a checkbox — shape is role legibility, and it outranks theme
  // uniformity in BOTH directions. So where the checkbox's corner answers the levels and
  // refuses only the capsule, the radio's corner answers nothing: half the mark at `none`,
  // at `full`, and everywhere between, in every world.
  for (const level of ["none", "small", "medium", "large", "full"] as const) {
    for (const pointer of POINTERS) {
      it(`stays a circle at radius="${level}", ${pointer} pointer`, () => {
        for (const size of SIZES) {
          const mark = mounted(<Radio value="a" size={size} />, {
            theme: { radius: level, pointer },
          });
          expect(
            px(computed(mark, "border-top-left-radius")),
            `${level}/${pointer}/${size}`,
          ).toBeCloseTo(markBox(mark).h / 2, 1);
        }
      });
    }
  }

  for (const density of DENSITIES) {
    it(`${density}: density moves nothing — not the box, not the circle`, () => {
      const el = render(
        <Theme density={density}>
          <Radio value="a" size="3" />
        </Theme>,
      );
      const mark = markOf(el);
      expect(markBox(mark).h).toBe(px(tokenOn(el, "--line-height-3")));
      expect(px(computed(mark, "border-top-left-radius"))).toBeCloseTo(markBox(mark).h / 2, 1);
    });
  }
});

describe("neutral off, accent on — the family identity, not a per-component copy (§11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: rests as the seal wearing the control edge`, () => {
      const el = render(
        <Theme appearance={appearance}>
          <RadioGroup>
            <Radio value="a" />
          </RadioGroup>
        </Theme>,
      );
      const mark = el.querySelector(".kui-radio")!;
      expect(computed(mark, "border-top-color")).toBe(colorOn(el, "var(--control-edge)"));
      expect(computed(mark, "background-color")).toBe(colorOn(el, "var(--color-surface)"));
    });

    it(`${appearance}: selected fills with the accent solid and pairs its dot`, () => {
      const el = render(
        <Theme appearance={appearance}>
          <RadioGroup defaultValue="a">
            <Radio value="a" />
          </RadioGroup>
        </Theme>,
      );
      const mark = el.querySelector(".kui-radio")!;
      expect(computed(mark, "background-color")).toBe(colorOn(el, "var(--accent-solid)"));
      expect(computed(mark, "color")).toBe(colorOn(el, "var(--accent-contrast)"));
    });

    it(`${appearance}: disabled goes flat through the shared tone remap`, () => {
      const el = render(
        <Theme appearance={appearance}>
          <RadioGroup defaultValue="a">
            <Radio value="a" disabled />
          </RadioGroup>
        </Theme>,
      );
      const mark = el.querySelector(".kui-radio")!;
      expect(computed(mark, "background-color")).toBe(colorOn(el, "var(--neutral-3)"));
      expect(computed(mark, "opacity")).toBe("1");
    });
  }

  it("the dot is hidden at rest and visible when selected — nothing faint, nothing resized", () => {
    const off = render(
      <RadioGroup>
        <Radio value="a" />
      </RadioGroup>,
    );
    expect(getComputedStyle(off.querySelector("svg")!).visibility).toBe("hidden");

    const on = render(
      <RadioGroup defaultValue="a">
        <Radio value="a" />
      </RadioGroup>,
    );
    expect(getComputedStyle(on.querySelector("svg")!).visibility).toBe("visible");
    expect(markBox(on.querySelector(".kui-radio")!)).toEqual(
      markBox(off.querySelector(".kui-radio")!),
    );
  });

  it("a state outranks dress: selected AND invalid shows the invalid edge (§8)", () => {
    for (const appearance of APPEARANCES) {
      const el = render(
        <Theme appearance={appearance}>
          <RadioGroup defaultValue="a">
            <Radio value="a" aria-invalid="true" />
          </RadioGroup>
        </Theme>,
      );
      const mark = el.querySelector(".kui-radio")!;
      expect(computed(mark, "border-top-color")).toBe(colorOn(el, "var(--invalid-edge)"));
    }
  });
});

describe("the look axis reaches it through the family, with no rule of its own (§19)", () => {
  // Radio ships one declaration (its circle) and answers the app's dress anyway, because the
  // wiring is on `.kui-mark` in the shared layer. This law is the promotion's dividend stated
  // as a test: the values are the checkbox's, byte for byte, and radio.css never says "look".
  const radio = (theme: object) =>
    render(
      <Theme {...theme}>
        <RadioGroup>
          <Radio value="a" />
        </RadioGroup>
      </Theme>,
    );

  it.each(APPEARANCES)("%s: filled dresses the box and KEEPS the mark's edge", (appearance) => {
    // The checkbox's law, one member over — same rewrite, same reason (see that file). A radio
    // is even more dependent on its hairline: unchecked, the ring IS the entire control.
    const filled = markOf(radio({ controlLook: "filled", appearance }));
    const outlined = markOf(radio({ controlLook: "outlined", appearance }));
    expect(
      computed(filled, "background-color"),
      `filled resolves to outlined's fill in ${appearance}`,
    ).not.toBe(computed(outlined, "background-color"));
    expect(computed(filled, "border-top-color")).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("outlined is the identity — byte-identical to the bare render", () => {
    const bare = markOf(
      render(
        <RadioGroup>
          <Radio value="a" />
        </RadioGroup>,
      ),
    );
    const outlined = markOf(radio({ controlLook: "outlined" }));
    for (const prop of ["background-color", "border-top-color"]) {
      expect(computed(outlined, prop)).toBe(computed(bare, prop));
    }
  });

  it("resolves to exactly what a checkbox resolves to — one family, one answer", () => {
    // The claim the promotion makes. If either component ever grows its own look rule, these
    // two diverge here first.
    for (const look of ["outlined", "filled"] as const) {
      const mark = markOf(radio({ controlLook: look }));
      const box = mounted(<Checkbox />, { theme: { controlLook: look }, select: ".kui-checkbox" });
      for (const prop of ["background-color", "border-top-color"]) {
        expect(computed(mark, prop), `${look}/${prop}`).toBe(computed(box, prop));
      }
    }
  });
});

describe("the group owns the selection (§11)", () => {
  it("one value: selecting is the group's state, and exactly one radio wears it", () => {
    const host = render(
      <RadioGroup defaultValue="b">
        <Radio value="a" />
        <Radio value="b" />
      </RadioGroup>,
    );
    const [a, b] = [...host.querySelectorAll(".kui-radio")];
    expect(a!.hasAttribute("data-checked")).toBe(false);
    expect(b!.hasAttribute("data-checked")).toBe(true);
  });

  it("clicking moves the dot — the group's value, not two independent booleans", () => {
    const host = render(
      <RadioGroup defaultValue="a">
        <Radio value="a" />
        <Radio value="b" />
      </RadioGroup>,
    );
    const [a, b] = [...host.querySelectorAll<HTMLElement>(".kui-radio")];
    b!.click();
    expect(a!.hasAttribute("data-checked")).toBe(false);
    expect(b!.hasAttribute("data-checked")).toBe(true);
  });

  it("a disabled GROUP reaches every mark through the same shared arm", () => {
    const host = render(
      <RadioGroup disabled>
        <Radio value="a" />
        <Radio value="b" />
      </RadioGroup>,
    );
    for (const mark of host.querySelectorAll(".kui-radio")) {
      expect(computed(mark, "background-color")).toBe(colorOn(host, "var(--neutral-3)"));
    }
  });

  it("the group renders the platform's role and no appearance of its own", () => {
    const host = render(
      <RadioGroup>
        <Radio value="a" />
      </RadioGroup>,
    );
    expect(host.getAttribute("role")).toBe("radiogroup");
    expect(computed(host, "background-color")).toBe("rgba(0, 0, 0, 0)");
  });
});

describe("a selected radio is the family's loud rung, and loud rungs catch light (§5, §11)", () => {
  it("selected catches in an elevated world; unselected never; no cast on either", () => {
    // The checkbox's 2026-08-07 law, on the family's second member — one shared ON rule, so
    // a divergence here is the promotion failing, not a radio bug.
    const host = mounted(
      <RadioGroup defaultValue="b">
        <Radio value="a" />
        <Radio value="b" />
      </RadioGroup>,
      { theme: { depth: "elevated" } },
    );
    const [a, b] = [...host.querySelectorAll(".kui-radio")];
    expect(computed(b!, "background-image")).toContain("linear-gradient");
    expect(computed(a!, "background-image")).toBe("none");
    expect(computed(b!, "box-shadow")).toBe("none");
    const flat = mounted(
      <RadioGroup defaultValue="b">
        <Radio value="b" />
      </RadioGroup>,
      { theme: { depth: "flat" } },
    );
    expect(computed(flat.querySelector(".kui-radio")!, "background-image")).toBe("none");
  });
});

describe("what it inherits from the shared layer (§8)", () => {
  it("the focus ring is the real ring, and it is absent at rest", () => {
    const el = render(
      <RadioGroup>
        <Radio value="a" />
      </RadioGroup>,
    );
    const mark = el.querySelector<HTMLElement>(".kui-radio")!;
    expect(getComputedStyle(mark).outlineStyle).toBe("none");
    mark.focus();
    const focused = getComputedStyle(mark);
    expect(focused.outlineStyle).toBe("solid");
    expect(focused.outlineColor).toBe(colorOn(el, "var(--focus-ring)"));
  });

  it("reads the same box a same-size checkbox does — one family, one ladder", () => {
    // The promotion's real claim: two members resolving identical geometry through ONE set of
    // rules, not two components tuned alike. If these ever diverge, the family has split.
    const radio = render(<Radio value="a" size="3" />);
    const checkbox = render(<Checkbox size="3" />);
    expect(markBox(markOf(radio))).toEqual(markBox(checkbox));
  });
});

describe("the API's closed edges (§3)", () => {
  it("refuses render, children, nativeButton, readOnly, and the axes it never had", () => {
    // @ts-expect-error — the one element must stay Base UI's root, which owns the hidden
    // input, the group membership and the ARIA
    void (<Radio value="a" render={<button />} />);
    // @ts-expect-error — the dot is the component's; the label is a SIBLING
    void (<Radio value="a">Pro</Radio>);
    // @ts-expect-error — describes an element `render` could have produced (audit D10)
    void (<Radio value="a" nativeButton />);
    // @ts-expect-error — the platform has no read-only selection control (LOG 2026-08-06);
    // Checkbox refused it and Radio inherits the refusal
    void (<Radio value="a" readOnly />);
    // @ts-expect-error — the group inherits the same refusal one level up
    void (<RadioGroup readOnly />);
    // @ts-expect-error — loudness ranks actions, and a radio is not one (§11)
    void (<Radio value="a" emphasis="loud" />);
    // @ts-expect-error — the ON state's family is an identity, not an axis (§11)
    void (<Radio value="a" tone="destructive" />);
    // @ts-expect-error — no margin prop on any control (first non-negotiable)
    void (<Radio value="a" m="4" />);
  });

  it("the ref names the element it actually holds — a span", () => {
    const ref = React.createRef<HTMLSpanElement>();
    const el = render(
      <RadioGroup>
        <Radio value="a" ref={ref} />
      </RadioGroup>,
    );
    expect(ref.current).toBe(el.querySelector(".kui-radio"));
    expect(ref.current!.tagName).toBe("SPAN");
  });

  it("the documented label pairing produces a real accessible name", () => {
    const host = render(
      <div>
        <RadioGroup>
          <Radio value="pro" id="plan-pro" />
        </RadioGroup>
        <label htmlFor="plan-pro">Pro</label>
      </div>,
    );
    const mark = host.querySelector(".kui-radio")!;
    const labelledBy = mark.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent).toBe("Pro");
  });
});


describe("the shared invalid wash reaches THIS member too (§8, §11 — audit 2026-08-09)", () => {
  // The arm is written on .kui-mark, so it is one rule for checkbox, radio and the switch
  // track — and only checkbox.browser.test.tsx asserted it, which means narrowing the
  // selector to .kui-checkbox would have left the family silently unwashed with every suite
  // green. The family's promotion is only real if each member proves it.
  for (const appearance of APPEARANCES) {
    it(`${appearance}: a selected invalid radio takes the destructive wash, not the accent solid`, () => {
      const host = render(
        <Theme appearance={appearance}>
          <RadioGroup defaultValue="a" aria-label="invalid">
            <Radio value="a" aria-invalid="true" />
          </RadioGroup>
          <RadioGroup defaultValue="a" aria-label="sound">
            <Radio value="a" />
          </RadioGroup>
        </Theme>,
      );
      const [invalid, sound] = Array.from(host.querySelectorAll<HTMLElement>(".kui-radio"));
      expect(computed(invalid!, "background-color"), `${appearance}: fill`).toBe(
        colorOn(host, "var(--destructive-soft)"),
      );
      expect(computed(invalid!, "background-color")).not.toBe(computed(sound!, "background-color"));
      // The dot is the glyph, and it takes the family's designed label-on-soft pairing.
      expect(computed(invalid!, "color"), `${appearance}: glyph`).toBe(
        colorOn(host, "var(--destructive-label)"),
      );
    });
  }
});

/* ── Motion: the dot arrives (§8, 2026-08-09) ──────────────────────────────────────────── */

describe("the dot arrives, and never leaves in reverse (§8)", () => {
  const dot = (el: HTMLElement) => el.querySelector<HTMLElement>("circle")!;

  it("unchosen it has no size; chosen it is whole", () => {
    const off = mounted(<Radio value="a" />, { theme: {}, select: ".kui-radio" });
    inMotion();
    expect(computed(dot(off), "scale"), "an unchosen dot is not there").toBe("0");

    const on = mounted(<RadioGroup defaultValue="a"><Radio value="a" /></RadioGroup>, {
      theme: {},
      select: ".kui-radio",
    });
    inMotion();
    expect(computed(dot(on), "scale"), "a chosen dot is whole").toBe("1");
  });

  it("it grows on a spring and vanishes instantly — the tick's own sentence", () => {
    const on = mounted(<RadioGroup defaultValue="a"><Radio value="a" /></RadioGroup>, {
      theme: {},
      select: ".kui-radio",
    });
    inMotion();
    expect(computed(dot(on), "transition-timing-function"), "arriving has mass").toContain("linear(");
    expect(parseFloat(computed(dot(on), "transition-duration"))).toBeGreaterThan(0);
    // Choosing another radio is the ANSWER; watching the old one deflate puts the eye on what
    // was just abandoned.
    const off = mounted(<Radio value="a" />, { theme: {}, select: ".kui-radio" });
    inMotion();
    expect(computed(dot(off), "transition-duration"), "leaving is instant").toBe("0s");
  });

  it("it pivots on itself, not on the SVG's origin", () => {
    const on = mounted(<RadioGroup defaultValue="a"><Radio value="a" /></RadioGroup>, {
      theme: {},
      select: ".kui-radio",
    });
    inMotion();
    // Without fill-box the scale pivots on the SVG's user space and the dot slides out of the
    // mark while it grows — visible, and impossible to see in a static screenshot.
    expect(computed(dot(on), "transform-box")).toBe("fill-box");
  });
});
