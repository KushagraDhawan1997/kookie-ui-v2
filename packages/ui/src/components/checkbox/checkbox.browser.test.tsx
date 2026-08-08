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
  probeIn,
  render,
  tokenOn,
  within,
} from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Checkbox } from "./checkbox.tsx";

const px = (v: string) => parseFloat(v);

/** The mark element, whether the law mounted it bare or inside a <Theme>. */
const markOf = (el: Element): HTMLElement => within(el, ".kui-checkbox");

/** The mark itself: what the user sees, in both axes (it is square by construction). */
function markBox(el: Element): { w: number; h: number } {
  const styles = getComputedStyle(el);
  return { w: px(styles.width), h: px(styles.height) };
}

/**
 * The TARGET, as the browser actually resolves it: the pseudo-element's own computed height.
 *
 * The first version reconstructed the number from the mark's border box plus the DECLARED
 * inset — the same two inputs the buggy formula used, so it agreed with the bug (the audit's
 * D3): an absolutely positioned box resolves its insets against the PADDING box, the mark
 * wears a real border, and the rendered target was 2 x --border-width short of the rule in
 * all 24 cells while this helper reported it exactly on. A law must read the resolved output,
 * never re-derive the author's arithmetic from the author's inputs.
 */
function targetBox(el: Element): number {
  return px(getComputedStyle(el, "::after").height);
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
  forEachCell(({ pointer, density, size }) => {
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
  });

  it("clears WCAG 2.5.8's 24px minimum in every cell, on paint-independent grounds", () => {
    // The reason the expansion exists at all, and the reason it is not coarse-only: a fine
    // cell's mark is 16px, which is under the minimum wherever a mouse is, and "a mouse is
    // precise" is not what the criterion says.
    forEachCell(({ pointer, density, size }) => {
      const el = render(
        <Theme pointer={pointer} density={density}>
          <Checkbox size={size} />
        </Theme>,
      );
      const mark = markOf(el);
      expect(targetBox(mark), `${pointer}/${density}/${size} is under the floor`).toBeGreaterThanOrEqual(24);
    });
  });

  it("never reaches more than 11px past the mark — the overlap §16 refused to guess at", () => {
    // What makes this expansion legitimate where §16's rejected one was not: the extent is a
    // rule (the control height, capped), so the reach is a KNOWN number in every cell rather
    // than a clamp nobody could size. The bound is (44 - smallest coarse mark) / 2 plus the
    // border term the target owes (D3): 10 + 1.
    forEachCell(({ pointer, density, size }) => {
      const el = render(
        <Theme pointer={pointer} density={density}>
          <Checkbox size={size} />
        </Theme>,
      );
      const mark = markOf(el);
      const reach = -px(getComputedStyle(mark, "::after").top);
      expect(reach, `${pointer}/${density}/${size} reaches ${reach}px`).toBeLessThanOrEqual(11);
    });
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
    for (const pointer of POINTERS) {
      it(`is uniform across the size index at radius="${level}", ${pointer} pointer`, () => {
        // The complaint that found the bug, mounted (Kushagra, by eye: "size 4 looks much more
        // rounded than size 1"). It rode --radius-control-N, designed against the HEIGHT
        // ladder, so the fraction climbed 0.250 -> 0.385 across the index while the box did
        // not. Both pointer worlds since 2026-08-06 (audit D7): the first spelling mounted no
        // Theme pointer, so the coarse world — the phone's default path — was asserted
        // nowhere. Ceiling 1.4; the token law explains why it is not 1.34.
        const fractions = SIZES.map((size) =>
          fractionOf(mounted(<Checkbox size={size} />, { theme: { radius: level, pointer } })),
        );
        expect(Math.max(...fractions) / Math.min(...fractions)).toBeLessThan(1.4);
      });
    }
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
      forEachCell(({ pointer, density, size }) => {
        const mark = mounted(<Checkbox size={size} />, {
          theme: { radius: level, pointer, density },
        });
        expect(
          px(computed(mark, "border-top-left-radius")),
          `${level}/${pointer}/${density}/${size} is a circle`,
        ).toBeLessThan(markBox(mark).h / 2);
      });
    }
  });

  it("holds at `large` when the theme says `full` — the control band pills, a mark must not", () => {
    const full = mounted(<Checkbox size="4" />, { theme: { radius: "full" } });
    const large = mounted(<Checkbox size="4" />, { theme: { radius: "large" } });
    expect(computed(full, "border-top-left-radius")).toBe(
      computed(large, "border-top-left-radius"),
    );
  });

  it('radius="none" still squares it — a kill switch with an exception is not one (§6)', () => {
    const el = mounted(<Checkbox />, { theme: { radius: "none" } });
    expect(computed(el, "border-top-left-radius")).toBe("0px");
  });

  it("the levels still reach it — small is tighter than large", () => {
    const small = mounted(<Checkbox size="3" />, { theme: { radius: "small" } });
    const large = mounted(<Checkbox size="3" />, { theme: { radius: "large" } });
    expect(fractionOf(small)).toBeLessThan(fractionOf(large));
  });
});

describe("neutral off, accent on (§11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: the resting box wears the CONTROL EDGE, and it clears the non-text floor`, () => {
      // "Neutral off" has to survive the element stamping data-tone="accent" for its ON state,
      // and a role token is what makes that possible without a component naming a family. The
      // role moved off --color-border on 2026-08-06 (audit D2): a mark's unchecked state has
      // no identity but this hairline, and the quiet border sat at |Lc| 22.8 against the
      // surface. The floor itself is asserted per mode in color.test.ts, where the hex lives.
      const el = render(
        <Theme appearance={appearance}>
          <Checkbox />
        </Theme>,
      );
      const mark = markOf(el);
      expect(computed(mark, "border-top-color")).toBe(colorOn(el, "var(--control-edge)"));
      expect(computed(mark, "border-top-color")).not.toBe(colorOn(el, "var(--color-border)"));
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
    for (const appearance of APPEARANCES) {
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

describe("a checked mark is the family's loud rung, and loud rungs catch light (§5, §11)", () => {
  // The 2026-08-07 decision, mounted: the checked fill is the mark's emphasis (state IS the
  // mark's rung), so under an elevated world it wears the same gradient a loud button wears
  // over the same accent solid — one material for a form's solid fills. NO cast: a mark is
  // a well that fills, never a raised key. Unchecked is a well and wells are not lit.
  it("checked catches exactly the loud button's light; unchecked never; flat never", () => {
    const checked = markOf(mounted(<Checkbox defaultChecked />, { theme: { surfaces: "elevated" } }));
    const button = mounted(
      <Button tone="accent" emphasis="loud">
        L
      </Button>,
      { theme: { surfaces: "elevated" } },
    );
    expect(computed(checked, "background-image")).toContain("linear-gradient");
    expect(computed(checked, "background-image")).toBe(computed(button, "background-image"));
    expect(computed(checked, "box-shadow")).toBe("none");
    const unchecked = markOf(mounted(<Checkbox />, { theme: { surfaces: "elevated" } }));
    expect(computed(unchecked, "background-image")).toBe("none");
    const flat = markOf(mounted(<Checkbox defaultChecked />, { theme: { surfaces: "flat" } }));
    expect(computed(flat, "background-image")).toBe("none");
  });

  it("disabled stands the catch down, and a mark inside a loud surface does not inherit it", () => {
    const disabled = markOf(
      mounted(<Checkbox defaultChecked disabled />, { theme: { surfaces: "elevated" } }),
    );
    expect(computed(disabled, "background-image")).toBe("none");
    // The leak guard: the emphasis ladder's light tokens INHERIT, so an unchecked mark under
    // ANY loud-emphasis ancestor (the rung selector is bare [data-emphasis]) would wear the
    // ancestor's light if the mark did not declare its own none at rest. Declared, not
    // omitted — this is the law that keeps it declared.
    const hosted = mounted(
      <div data-emphasis="loud">
        <Checkbox />
      </div>,
      { theme: { surfaces: "elevated" } },
    );
    expect(computed(markOf(hosted), "background-image")).toBe("none");
  });
});

describe("the look axis dresses the resting box, never the tick (§19)", () => {
  it.each(APPEARANCES)("%s: filled dresses the box and KEEPS the mark's edge", (appearance) => {
    // Rewritten 2026-08-06. The old spelling asserted the fill equalled `var(--neutral-4)` and
    // the border equalled transparent — both true, both useless: the first compared the mark
    // to the name its author had typed, and the second asserted the defect. `filled` was
    // deleting --control-edge, the boundary audit D2 minted BECAUSE an unchecked box is nothing
    // but its hairline, dropping it to |Lc| 0.0 against the card. Now judged against the
    // other end of the axis, and against the guarantee D2 bought.
    const filled = markOf(mounted(<Checkbox />, { theme: { look: "filled", appearance } }));
    const outlined = markOf(mounted(<Checkbox />, { theme: { look: "outlined", appearance } }));
    expect(
      computed(filled, "background-color"),
      `filled resolves to outlined's fill in ${appearance}`,
    ).not.toBe(computed(outlined, "background-color"));
    expect(
      computed(filled, "border-top-color"),
      "an unchecked mark with no edge is not a control, it is a gap",
    ).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("outlined is the identity — byte-identical to the bare render", () => {
    const bare = markOf(render(<Checkbox />));
    const outlined = markOf(mounted(<Checkbox />, { theme: { look: "outlined" } }));
    for (const prop of ["background-color", "border-top-color"]) {
      expect(computed(outlined, prop)).toBe(computed(bare, prop));
    }
  });

  it("checked is an identity, not dress: identical in both looks", () => {
    const outlined = markOf(mounted(<Checkbox defaultChecked />, { theme: { look: "outlined" } }));
    const filled = markOf(mounted(<Checkbox defaultChecked />, { theme: { look: "filled" } }));
    for (const prop of ["background-color", "border-top-color"]) {
      expect(computed(filled, prop)).toBe(computed(outlined, prop));
    }
  });

  it("invalid outranks dress: the error edge shows through filled's transparent border", () => {
    const el = mounted(<Checkbox aria-invalid="true" />, { theme: { look: "filled" } });
    expect(computed(markOf(el), "border-top-color")).toBe(colorOn(el, "var(--invalid-edge)"));
  });
});

describe("what it inherits from the shared layer, and what it must not (§8)", () => {
  it("stays flat in an elevated world — a mark's box is the state, not a plane (§5)", () => {
    // The negative half of elevation's membership criterion (decided 2026-08-06): the
    // shadow ladder is surface-scale lengths, and nothing is ever behind a mark.
    const el = mounted(<Checkbox />, { theme: { surfaces: "elevated" } });
    expect(computed(markOf(el), "box-shadow")).toBe("none");
  });

  it("goes flat through the tone remap when disabled — the FILL, not just the chrome (§8)", () => {
    // The first spelling asserted opacity and cursor, neither of which could be wrong (audit
    // D6): the resting fill is the surface seal, not a tone role, so the shared arm could not
    // reach it and a disabled unchecked checkbox computed byte-identical to a live one.
    // Widened 2026-08-06 to loop the LOOK as well as the appearance. It had cells for one axis
    // the state interacts with and not the other, so `filled` — which re-points the very fill
    // this arm has to override — was never once disabled in a test. A state must outrank dress
    // in both worlds or the rule is only half true.
    for (const appearance of APPEARANCES) {
      for (const look of ["outlined", "filled"] as const) {
        const at = (props: { disabled?: boolean; defaultChecked?: boolean }) =>
          render(
            <Theme appearance={appearance} look={look}>
              <Checkbox {...props} />
            </Theme>,
          );
        const where = `${appearance}/${look}`;
        const off = at({ disabled: true });
        const on = at({ disabled: true, defaultChecked: true });
        for (const el of [off, on]) {
          expect(computed(markOf(el), "background-color"), where).toBe(
            colorOn(el, "var(--neutral-3)"),
          );
          expect(computed(markOf(el), "opacity"), where).toBe("1");
        }
        // The claim that matters: disabled is DISTINCT from live, in every world. Under a dress
        // that moves the resting fill, "the arm reaches the fill" and "the arm reaches the
        // fill it needs to" are different sentences, and only this one is the rule.
        const live = at({});
        expect(computed(markOf(off), "background-color"), where).not.toBe(
          computed(markOf(live), "background-color"),
        );
      }
    }
    const el = render(<Checkbox disabled />);
    // The arrow, not `not-allowed`: §8 refuses a cursor no native platform uses. Read through
    // the token so this law states the rule rather than a keyword.
    expect(computed(markOf(el), "cursor")).toBe(
      probeIn(el, (p) => (p.style.cursor = "var(--cursor-disabled)"), (s) => s.cursor),
    );
  });

  it("a state outranks dress: checked AND invalid shows the invalid edge (§8, audit D8)", () => {
    // The :where() on the checked rule is what this asserts, and it is the one of the LOG's
    // "two defects the laws caught" that had no law: written with :is(), checked ties with
    // the invalid remap at (0,2,0) and wins on source order — a checked invalid checkbox
    // showed a confident accent box with nothing wrong about it. Falsified against :is()
    // before this was accepted: the law fails under that spelling in all four cells.
    for (const appearance of APPEARANCES) {
      for (const state of [{ defaultChecked: true }, { indeterminate: true }]) {
        const el = render(
          <Theme appearance={appearance}>
            <Checkbox aria-invalid="true" {...state} />
          </Theme>,
        );
        const mark = markOf(el);
        expect(computed(mark, "border-top-color")).toBe(colorOn(el, "var(--invalid-edge)"));
        expect(computed(mark, "border-top-color")).not.toBe(computed(mark, "background-color"));
      }
    }
  });

  it("invalid takes a CHECKED fill as the wash, not the shout (§8, §11 — decided 2026-08-08)", () => {
    // An accent tick inside a destructive border was two chromatic signals arguing on one
    // control (the ring's own argument); Material's full error solid shouts. The error takes
    // the control the way disabled does: destructive's SOFT wash, the family's designed
    // label-on-soft pairing on the glyph, and the solid's light catch stood down.
    for (const appearance of APPEARANCES) {
      const el = render(
        <Theme appearance={appearance} surfaces="elevated">
          <Checkbox aria-invalid="true" defaultChecked />
          <Checkbox defaultChecked />
          <Checkbox aria-invalid="true" />
        </Theme>,
      );
      const [invalid, sound, restingInvalid] = Array.from(
        el.querySelectorAll<HTMLElement>(".kui-checkbox"),
      );
      expect(computed(invalid!, "background-color"), `${appearance}: fill`).toBe(
        colorOn(el, "var(--destructive-soft)"),
      );
      expect(computed(invalid!, "background-color"), `${appearance}: still the accent`).not.toBe(
        computed(sound!, "background-color"),
      );
      // The glyph inherits the label pairing through currentColor.
      expect(computed(invalid!, "color"), `${appearance}: glyph`).toBe(
        colorOn(el, "var(--destructive-label)"),
      );
      // A gradient over a wash is fog — the light stands down even in the elevated world.
      // The sound solid CATCHES it there (the positive control, or this assertion is vacuous).
      expect(
        computed(sound!, "background-image"),
        `${appearance}: the positive control lost its light — the stand-down assertion is vacuous`,
      ).not.toBe("none");
      expect(computed(invalid!, "background-image"), `${appearance}: light`).toBe("none");
      // UNCHECKED invalid keeps its seal: the resting box has nothing to re-fill.
      expect(
        computed(restingInvalid!, "background-color"),
        `${appearance}: the resting box turned red`,
      ).not.toBe(colorOn(el, "var(--destructive-soft)"));
    }
  });

  it("dead outranks wrong in the GLYPH too, not only the fill (§8, audit 2026-08-09)", () => {
    // The half the first spelling missed: the invalid arm declares --kui-ct-label-color as a
    // destructive FAMILY token, and the shared disabled arm rewrites tone ROLES, so it could
    // not reach it — a dead invalid tick rendered the same full-strength red as the LIVE one
    // (measured 3.8x a plain dead tick's contrast, and louder than a live sound tick). The
    // law reads the glyph's colour, which is what currentColor paints.
    for (const appearance of APPEARANCES) {
      const host = render(
        <Theme appearance={appearance}>
          <Checkbox aria-invalid="true" defaultChecked disabled />
          <Checkbox defaultChecked disabled />
          <Checkbox aria-invalid="true" defaultChecked />
        </Theme>,
      );
      const [deadWrong, dead, liveWrong] = Array.from(
        host.querySelectorAll<HTMLElement>(".kui-checkbox"),
      );
      expect(computed(deadWrong!, "color"), `${appearance}: the dead tick shouts`).toBe(
        computed(dead!, "color"),
      );
      // ...and the live invalid tick is genuinely different, so the equality above is not
      // holding because every tick happens to match.
      expect(computed(liveWrong!, "color")).not.toBe(computed(dead!, "color"));
    }
  });

  it("dead outranks wrong: disabled AND invalid reads dead first (§8)", () => {
    // The invalid fill arm sits BEFORE the disabled arm in source on purpose, losing the
    // (0,2,0) tie — a control you cannot touch must recede, whatever else is true of it.
    const host = render(
      <Theme>
        <Checkbox aria-invalid="true" defaultChecked disabled />
        <Checkbox defaultChecked disabled />
      </Theme>,
    );
    const [both, dead] = Array.from(host.querySelectorAll<HTMLElement>(".kui-checkbox"));
    expect(computed(both!, "background-color")).toBe(computed(dead!, "background-color"));
  });

  it("the focus ring is the real ring, and it is absent at rest (§8, audit D9)", () => {
    // The first spelling asserted outline-style !== "auto", which "none" satisfies — the
    // shared ring could be deleted outright and it passed. This one names the ring: solid,
    // the system width, the system colour, and nothing before focus arrives.
    const el = render(<Checkbox />);
    const mark = markOf(el);
    expect(getComputedStyle(mark).outlineStyle).toBe("none");
    mark.focus();
    const focused = getComputedStyle(mark);
    expect(focused.outlineStyle).toBe("solid");
    expect(focused.outlineWidth).toBe(probeIn(el, (p) => (p.style.width = "var(--focus-ring-width)"), (s) => s.width));
    expect(focused.outlineColor).toBe(colorOn(el, "var(--focus-ring)"));
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

describe("the API's closed edges, and the two facts the types state (§3)", () => {
  it("refuses render, children, nativeButton, and the axes it never had", () => {
    // @ts-expect-error — the one element must stay Base UI's root, which owns the hidden
    // input, the form association and the tri-state (§5)
    void (<Checkbox render={<button />} />);
    // @ts-expect-error — the glyph is the component's; the label is a SIBLING
    void (<Checkbox>Accept</Checkbox>);
    // @ts-expect-error — describes an element `render` could have produced, and `render` is
    // refused; reachable, it silently broke Space and the label chain (audit D10)
    void (<Checkbox nativeButton />);
    // @ts-expect-error — loudness ranks actions, and a checkbox is not one (§11)
    void (<Checkbox emphasis="loud" />);
    // @ts-expect-error — the ON state's family is an identity, not an axis (§11)
    void (<Checkbox tone="destructive" />);
    // @ts-expect-error — no margin prop on any control (first non-negotiable)
    void (<Checkbox m="4" />);
    // @ts-expect-error — the platform has no read-only checkbox, and neither does this one
    // (2026-08-06, LOG): Base UI accepts it and draws nothing, which shipped here as a prop
    // that resolved to no appearance at all. Disabled is the state that exists.
    void (<Checkbox readOnly />);
  });

  it("the ref names the element it actually holds — the span, not a button (audit D12)", () => {
    // Typed HTMLButtonElement, this compiled and lied: `ref.current.form` type-checked and
    // was undefined at runtime. The law reads the mounted reality.
    const ref = React.createRef<HTMLSpanElement>();
    const el = render(<Checkbox ref={ref} />);
    expect(ref.current).toBe(markOf(el));
    expect(ref.current!.tagName).toBe("SPAN");
  });

  it("the documented label pairing produces a real accessible name (audit D11)", () => {
    // The comment in checkbox.tsx is the only labelling guidance the component gives; its
    // first spelling named props that do not exist. This mounts the corrected one.
    const host = render(
      <div>
        <Checkbox id="terms" />
        <label htmlFor="terms">Accept the terms</label>
      </div>,
    );
    const mark = host.querySelector(".kui-checkbox")!;
    const labelledBy = mark.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent).toBe("Accept the terms");
  });
});

describe("hosted in a slot, it stays a mark (§4, decided 2026-08-06 — audit D4)", () => {
  // The hosted-control rule pins `height` to the slot's derived box — right for a Button,
  // wrong for a mark: a checkbox in a field's trailing slot measured 20 wide and 24 tall,
  // its corner holding two different fractions of two different axes, which is the exact
  // class of defect the --radius-mark-N fix was written to end.
  for (const pointer of POINTERS) {
    it(`${pointer}: square inside a field's slot, and no larger than the slot allows`, () => {
      const el = render(
        <Theme pointer={pointer}>
          <TextField size="2" trailing={<Checkbox size="2" />} />
        </Theme>,
      );
      const mark = el.querySelector(".kui-checkbox")!;
      const { w, h } = markBox(mark);
      expect(w).toBe(h);
      expect(h).toBeLessThanOrEqual(px(tokenOn(el, "--mark-2")));
    });
  }

  for (const pointer of POINTERS) {
    it(`${pointer}: equidistant — the gap to the field's edge is the gap above and below`, () => {
      // The slot-inset promise ("the same number on all four sides") is written against the
      // hosted BOX. A button fills that box; a mark does not, so it gains the residue
      // vertically while the shrink-wrapped slot held the horizontal gap at bare slot-inset —
      // the mark sat closer to the field's edge than to its top and bottom. The slot claims
      // the full hosted box and centres what it holds; these gaps are equal by construction.
      const el = render(
        <Theme pointer={pointer}>
          <TextField size="2" trailing={<Checkbox size="2" />} />
        </Theme>,
      );
      const field = el.querySelector(".kui-field")!;
      const mark = el.querySelector(".kui-checkbox")!;
      const f = field.getBoundingClientRect();
      const m = mark.getBoundingClientRect();
      const border = px(getComputedStyle(field).borderRightWidth);
      const right = f.right - border - m.right;
      const top = m.top - (f.top + border);
      const bottom = f.bottom - border - m.bottom;
      expect(Math.abs(right - top)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(top - bottom)).toBeLessThanOrEqual(0.5);
    });
  }

  it("gives up its own reach in a slot — one target, and it is the container's rule", () => {
    // Standalone, the mark grows its own invisible target. Hosted, §4's hosted-control rule
    // owns the question (container-matched, coarse only), and a second expander on the same
    // element is how the audit measured a 36px target inside a 32px field.
    const el = render(
      <Theme pointer="fine">
        <TextField size="2" trailing={<Checkbox size="2" />} />
      </Theme>,
    );
    const mark = el.querySelector(".kui-checkbox")!;
    expect(getComputedStyle(mark, "::after").content).toBe("none");
  });

  it("keeps its own target everywhere that is NOT a slot", () => {
    // The exclusion must not leak: a checkbox that merely sits inside a form, a label, or a
    // Card keeps the grown target — only a [data-slot] parent hands the question over.
    const el = render(
      <label>
        <Checkbox size="2" />
      </label>,
    );
    const mark = within(el, ".kui-checkbox");
    expect(getComputedStyle(mark, "::after").content).not.toBe("none");
  });
});

describe("marks in a stack keep their clicks at twelve pixels (§4, decided 2026-08-06)", () => {
  // The audit's D1, and the sentence it replaced shipped false in three places: "a stacked
  // list is clear at ANY layout-space gap the system offers" — the scale starts at 2px, and
  // below the target's reach the LATER sibling owns pixels inside the EARLIER one's painted
  // box (both targets hit-test in tree order). The rule that replaces it: stacked marks need
  // 12 real pixels — one more than the worst reach in any cell (11) — and this law mounts
  // the rule rather than deriving it: two marks at exactly 12px, every point strictly inside
  // the first's paint must belong to the first, in all 24 (pointer x density x size) cells.
  const stack = (pointer: "fine" | "coarse", density: "compact" | "default" | "comfortable", size: "1" | "2" | "3" | "4") =>
    render(
      <Theme pointer={pointer} density={density}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "200px" }}>
          <Checkbox size={size} aria-label="A" />
          <Checkbox size={size} aria-label="B" />
        </div>
      </Theme>,
    );

  /** Every 1px row down the centre of A's painted box, asked who owns it.
   *
   * Scrolled into view FIRST, and a row nobody claims is an error rather than a zero: the
   * first cut of this helper ran after two dozen mounts had pushed the pair below the
   * viewport, elementFromPoint answered null for every row, and 24 cells passed while
   * measuring nothing — the exact vacuity this suite exists to forbid. */
  function stolenRows(host: Element): number {
    const [a, b] = [...host.querySelectorAll(".kui-checkbox")] as HTMLElement[];
    a!.scrollIntoView({ block: "center" });
    const r = a!.getBoundingClientRect();
    let stolen = 0;
    for (let dy = 0.5; dy < r.height; dy += 1) {
      const owner = document.elementFromPoint(r.left + r.width / 2, r.bottom - dy);
      if (owner === b) stolen += 1;
      else if (!owner || !a!.contains(owner)) {
        throw new Error(`the scan is not measuring the pair: row ${dy} belongs to ${owner?.tagName ?? "nothing"}`);
      }
    }
    return stolen;
  }

  for (const pointer of POINTERS) {
    for (const density of DENSITIES) {
      it(`${pointer}/${density}: twelve pixels keep every size's paint its own`, () => {
        for (const size of SIZES) {
          expect(stolenRows(stack(pointer, density, size)), `${pointer}/${density}/${size}`).toBe(0);
        }
      });
    }
  }

  it("and the rule is load-bearing: at 4px the later mark really does own the earlier one's paint", () => {
    // The negative control, so the twelve above cannot rot into decoration. If this ever
    // fails, the overlap mechanism itself changed — retire the 12px rule deliberately, in
    // DECISIONS, not by deleting this law.
    const el = render(
      <Theme pointer="coarse">
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "200px" }}>
          <Checkbox size="2" aria-label="A" />
          <Checkbox size="2" aria-label="B" />
        </div>
      </Theme>,
    );
    expect(stolenRows(el)).toBeGreaterThan(0);
  });
});
