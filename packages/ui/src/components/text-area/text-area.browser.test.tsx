/**
 * TextArea's laws, mounted (§4, §8, §10, §11).
 *
 * Same bar as TextField's suite: every law reads a COMPUTED value through a mounted component.
 * What is genuinely new here is the geometry — the first non-fixed-height control, where §4
 * says padding is the dimension — so the geometric laws are the ones that could not have been
 * written before: the derived block padding closing against the control height, one row of
 * textarea sitting exactly where a field's value sits, and growth arriving in whole lines.
 */
import { describe, expect, it } from "vitest";

import { Theme } from "../../theme/theme.tsx";
import { APPEARANCES, SIZES, colorOn, computed, mounted, render } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { TextArea } from "./text-area.tsx";
import { material } from "../../tokens/config.ts";

/** Differs from the harness placement on purpose: a <textarea> renders no children, so the
    probe must sit BESIDE the element — the parent is the nearest scope that can host it. */
const tokenOn = (el: Element, name: string): string =>
  colorOn(el.parentElement!, `var(${name})`);

/** Same sibling placement, for whole colour expressions. */
const bgOn = (el: Element, expr: string): string => colorOn(el.parentElement!, expr);

const px = (v: string) => parseFloat(v);

/**
 * The fill an interaction rule would paint. The field suite's probe trick — append a child and
 * read through inheritance — cannot work here: a <textarea> has no rendered children, and a
 * SIBLING probe inherits nothing the element declared on itself. So both halves of the chain
 * are read off the element's own computed values (custom properties arrive var-substituted),
 * and bgOn only normalises the resulting colour string.
 */
function stateFill(el: Element, state: "hover" | "active"): string {
  const derived = computed(el, `--kui-ct-fill-${state}`);
  return bgOn(el, derived || computed(el, `--kui-ct-fill-src-${state}`));
}

const onPlaceholder = (el: Element, prop: string): string =>
  getComputedStyle(el, "::placeholder").getPropertyValue(prop).trim();

describe("padding is the dimension, and it is ONE inset (§4, reversed 2026-08-05)", () => {
  // The height ladder is for fixed-height controls, and this box grows with its content. The
  // first cut derived the block padding from the height token so a one-row textarea matched a
  // TextField — and the residue read as an accident the moment a second line existed: 13px at
  // the sides, 9px above, chosen by nobody. Every real textarea is a multi-row paragraph, so
  // the paragraph wins outright: the frame is the side padding, all four sides.
  for (const size of SIZES) {
    it(`the frame is uniform at size ${size} — block padding IS the side padding`, () => {
      // At radius="medium": uniformity is a non-full fact — the `full` DEFAULT bumps the
      // sides only, which the roundness law below pins.
      const el = mounted(<TextArea size={size} rows={3} />, { theme: { radius: "medium" } });
      expect(computed(el, "padding-top")).toBe(computed(el, "padding-left"));
      expect(computed(el, "padding-top")).toBe(computed(el, "padding-bottom"));
    });

    it(`shares every joint with a TextField at size ${size} except the height`, () => {
      // The reversal's remainder: the size index still joins the two components everywhere
      // height is not involved. The one-row-equals-field height identity is deliberately
      // gone — a one-row box is TextField's job, and a rows={1} textarea sits taller.
      const area = render(<TextArea size={size} rows={1} />);
      const field = render(<TextField size={size} />);
      for (const property of ["padding-left", "border-top-left-radius", "font-size"]) {
        expect(computed(area, property), `size ${size} disagrees on ${property}`).toBe(
          computed(field, property),
        );
      }
      expect(px(computed(area, "height"))).toBeGreaterThanOrEqual(px(computed(field, "height")));
    });
  }

  it("growth arrives in whole lines — rows is a content-height statement", () => {
    const one = render(<TextArea rows={1} />);
    const four = render(<TextArea rows={4} />);
    const line = px(computed(one, "line-height"));
    expect(px(computed(four, "height")) - px(computed(one, "height"))).toBeCloseTo(3 * line, 1);
  });

  it("the control height survives as a floor, never a ceiling", () => {
    const el = render(<TextArea rows={6} />);
    expect(px(computed(el, "height"))).toBeGreaterThan(px(computed(el, "min-height")));
  });

  it("the frame stays uniform in every density and pointer world (§12, §16)", () => {
    // Written against the family's variables, not any world's numbers, so the worlds'
    // re-declarations cannot split the two axes apart again.
    for (const world of [
      <Theme density="compact" key="c" />,
      <Theme density="comfortable" key="f" />,
      <Theme pointer="coarse" key="p" />,
    ]) {
      const host = render(
        <world.type {...world.props} radius="medium">
          <TextArea size="2" rows={3} />
          <Button size="2">Label</Button>
        </world.type>,
      );
      const area = host.querySelector<HTMLElement>(".kui-textarea")!;
      const button = host.querySelector<HTMLElement>(".kui-button")!;
      expect(computed(area, "padding-top")).toBe(computed(area, "padding-left"));
      expect(computed(area, "min-height")).toBe(computed(button, "min-height"));
    }
  });

  it("no exception for roundness: full bumps the sides only, so radius never buys height", () => {
    // The pill bump corrects text running SIDEWAYS into the corner at its widest swing;
    // vertically the curve has flattened to under half a pixel where the text starts. So at
    // full the sides take the pill value and the block keeps the plain inset — Kushagra's
    // call, judged in the preview.
    const el = mounted(<TextArea size="2" rows={3} />, { theme: { radius: "full" } });
    const plain = mounted(<TextArea size="2" rows={3} />, { theme: { radius: "medium" } });
    expect(px(computed(el, "padding-left"))).toBeGreaterThan(px(computed(plain, "padding-left")));
    expect(computed(el, "padding-top")).toBe(computed(plain, "padding-top"));
    expect(computed(el, "height")).toBe(computed(plain, "height"));
  });
});

describe("one treatment: the field family's identity (§9, §11)", () => {
  it("exposes no emphasis, no tone, and no outer spacing", () => {
    // @ts-expect-error — emphasis is not a TextAreaProp
    void (<TextArea emphasis="loud" />);
    // @ts-expect-error — tone is not a TextAreaProp
    void (<TextArea tone="accent" />);
    // @ts-expect-error — no margin prop on any control (first non-negotiable)
    void (<TextArea m="4" />);
  });

  it("the fill is the well, and it steps when you point at it", () => {
    const el = render(<TextArea />);
    // THE WELL, not the seal (2026-08-17, the fill-first flip): a field's resting identity is
    // the look's dress fill — "a field resolves to a light fill solid, border supplements"
    // (Kushagra) — where it used to be `--color-surface` with a solved hairline carrying it.
    expect(computed(el, "background-color")).toBe(bgOn(el, "var(--dress-field-fill)"));
    expect(computed(el, "background-color")).not.toBe(bgOn(el, "var(--color-surface)"));
    // Same trap as the field: all three sources must resolve, or pointing at the box makes
    // the fill declaration invalid at computed-value time and it vanishes.
    // The pin is gone (2026-08-17), TextField's sentence one member over: the chains must
    // still RESOLVE — that trap survives — and they must now STEP, because the well made the
    // fill the one currency this family's hover has.
    const rest = computed(el, "background-color");
    for (const [name, value] of [["hover", stateFill(el, "hover")], ["active", stateFill(el, "active")]] as const) {
      expect(value, `${name} resolves to nothing`).not.toBe("rgba(0, 0, 0, 0)");
      expect(value, `${name} did not step`).not.toBe(rest);
    }
  });

  it("wears a caret, not a hand; the text is content — selectable, regular weight (§15)", () => {
    const el = render(<TextArea defaultValue="hello" />);
    expect(computed(el, "cursor")).toBe("text");
    expect(computed(el, "user-select")).not.toBe("none");
    expect(computed(el, "font-weight")).toBe("400");
  });

  it("the border is painted, and it is the affordance — bordered by identity", () => {
    const el = render(<TextArea />);
    expect(computed(el, "border-top-width")).toBe("1px");
    // The FIELD EDGE since 2026-08-07 (§7 — solved to APCA's large-element tier of 30): an
    // outlined field's fill is the seal it sits on, so its border is all that identifies it.
    // One tier below the mark's ring, because a field is a large element and the guidance
    // holds large non-text to 30 where fine detail owes 45 — at equal colour the long border
    // of a big box reads far heavier than a mark's ring (Kushagra, judged in the preview).
    // The DRESS edge (2026-08-17, the fill-first flip): the solved --field-edge was what a
    // bordered field was recognised BY, and the well took that job. The solved ladder still
    // exists and conformance still reaches it — contrast="high" stands the dress down.
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--dress-field-edge"));
  });

  it("offers the one resize axis that cannot break a layout, as raw CSS", () => {
    // Vertical only: a horizontal handle makes the element wider than the column that owns
    // it. No prop — resize is plain CSS and `style` already covers all of CSS.
    expect(computed(render(<TextArea />), "resize")).toBe("vertical");
    expect(computed(render(<TextArea style={{ resize: "none" }} />), "resize")).toBe("none");
  });
});

describe("focus is a mode, not a keyboard affordance (§8)", () => {
  it("rings on entry however you arrived — plain :focus, on the one element there is", () => {
    const el = render(<TextArea />) as HTMLTextAreaElement;
    expect(computed(el, "outline-style")).toBe("none");
    el.focus();
    expect(document.activeElement).toBe(el);
    expect(computed(el, "outline-style")).toBe("solid");
    expect(computed(el, "outline-width")).toBe("2px");
    expect(computed(el, "outline-color")).toBe(tokenOn(el, "--focus-ring"));
    el.blur();
  });
});

describe("validity is state, never a prop (§8)", () => {
  it("aria-invalid re-tones the border — the platform spelling, standalone", () => {
    const plain = render(<TextArea />);
    const invalid = render(<TextArea aria-invalid="true" />);
    expect(computed(invalid, "border-top-color")).toBe(tokenOn(invalid, "--invalid-edge"));
    expect(computed(invalid, "border-top-color")).not.toBe(computed(plain, "border-top-color"));
    // The value stays legible: a state re-tones the box, never the content.
    expect(computed(invalid, "color")).toBe(computed(plain, "color"));
  });

  it("data-invalid re-tones it too — what Base UI writes, landing on this element DIRECTLY", () => {
    // No :has() hop here: the control is the element Base UI decorates, so this exercises the
    // shared rule's direct arm — the arm that shipped with no law at all until 2026-08-05.
    const el = render(<TextArea />);
    el.setAttribute("data-invalid", "");
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--invalid-edge"));
    el.removeAttribute("data-invalid");
    // The DRESS edge (2026-08-17, the fill-first flip): the solved --field-edge was what a
    // bordered field was recognised BY, and the well took that job. The solved ladder still
    // exists and conformance still reaches it — contrast="high" stands the dress down.
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--dress-field-edge"));
  });

  it("the ring moves with the border — the invalid state's own reversal of one-ring (§8)", () => {
    const invalid = render(<TextArea aria-invalid="true" />) as HTMLTextAreaElement;
    invalid.focus();
    expect(computed(invalid, "outline-color")).toBe(tokenOn(invalid, "--invalid-edge"));
    invalid.blur();
  });
});

describe("disabled arrives as the native attribute, and the shared remap reads it (§8)", () => {
  it("goes flat by tone through the :disabled arm", () => {
    // The third spelling of the disabled state, added with this component: no wrapper to tell —
    // the element that paints IS the disabled form element, and the native attribute is the
    // truth the arm reads. (Base UI stamps `data-disabled` here too, but the arm must not need
    // it: the next law disables through the attribute alone.) Falsified against the shared
    // layer without the arm: the colour assertions here failed.
    const el = render(<TextArea disabled placeholder="hint" />);
    expect((el as HTMLTextAreaElement).disabled).toBe(true);
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--disabled-border"));
    expect(computed(el, "color")).toBe(tokenOn(el, "--neutral-8"));
    expect(computed(el, "opacity")).toBe("1");
    expect(computed(el, "cursor")).toBe("default");
    // The hint goes flat with the value rather than ending up brighter than it.
    expect(onPlaceholder(el, "color")).toBe(tokenOn(el, "--neutral-8"));
  });

  it("a Field.Root-computed disable reaches it the same way — the attribute is the one truth", () => {
    // Base UI computes `fieldDisabled || disabledProp` at the control; simulate the half that
    // never passes through this component by setting the native attribute directly.
    const el = render(<TextArea />) as HTMLTextAreaElement;
    const live = computed(el, "border-top-color");
    el.disabled = true;
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--disabled-border"));
    el.disabled = false;
    expect(computed(el, "border-top-color")).toBe(live);
  });

  it("disabled outranks invalid, deterministically", () => {
    const el = render(<TextArea disabled aria-invalid="true" />);
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--disabled-border"));
  });
});

describe("readOnly drops the well, and keeps everything else (§8)", () => {
  it("the seal is the one thing gone", () => {
    const plain = render(<TextArea defaultValue="v" />);
    const ro = render(<TextArea defaultValue="v" readOnly />) as HTMLTextAreaElement;
    expect(computed(ro, "background-color")).toBe("rgba(0, 0, 0, 0)");
    expect(computed(plain, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
    expect(computed(ro, "border-top-color")).toBe(computed(plain, "border-top-color"));
    expect(computed(ro, "color")).toBe(computed(plain, "color"));
    expect(computed(ro, "cursor")).toBe("text");
    ro.focus();
    expect(computed(ro, "outline-style")).toBe("solid");
    ro.blur();
  });

  it("does not borrow the disabled vocabulary, and disabled does not borrow this", () => {
    // CSS :read-only matches a disabled control too; the :not(:disabled) guard is what keeps
    // two states from painting one box.
    const off = render(<TextArea disabled />);
    expect(computed(off, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
    const ro = render(<TextArea readOnly />);
    expect(computed(ro, "border-top-color")).not.toBe(tokenOn(ro, "--disabled-border"));
  });
});

describe("the placeholder is a designed role, not a UA default (§7, §15)", () => {
  it("reads the MUTED role at full opacity (faint until 2026-08-10, when faint became the exception rung)", () => {
    const el = render(<TextArea placeholder="Notes" />);
    expect(onPlaceholder(el, "color")).toBe(tokenOn(el, "--color-text-muted"));
    expect(onPlaceholder(el, "color")).not.toBe(tokenOn(el, "--color-text-faint"));
    expect(onPlaceholder(el, "opacity")).toBe("1");
  });
});

describe("the dress is the family's, unconditional (§19 — controlLook deleted 2026-08-19)", () => {
  it.each(APPEARANCES)("%s: matches TextField exactly — one family, one answer", (appearance) => {
    // The family claim survives the axis: the two members compare to EACH OTHER, in paint.
    const area = mounted(<TextArea />, { theme: { appearance }, select: ".kui-textarea" });
    const field = mounted(<TextField />, { theme: { appearance }, select: ".kui-field" });
    for (const prop of ["background-color", "border-top-color"]) {
      expect(computed(area, prop), `the field family disagrees with itself on ${prop}`).toBe(
        computed(field, prop),
      );
    }
    expect(computed(area, "border-top-color")).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("the bare render is the themed render — no axis, no difference", () => {
    const bare = render(<TextArea />);
    const themed = mounted(<TextArea />, { theme: {}, select: ".kui-textarea" });
    for (const prop of ["background-color", "border-top-color"]) {
      expect(computed(themed, prop)).toBe(computed(bare, prop));
    }
  });
});

describe("the app's identities reach it without it knowing (§5, §10)", () => {
  it("does NOT cast in either world — TextField's fourth flip (§5)", () => {
    // The family answers together: a field is a raised control since 2026-08-07, and it
    // casts row 2 through the world token — flat worlds stay shadowless.
    expect(computed(render(<TextArea />), "box-shadow")).toBe("none");
    const host = render(
      <Theme depth="elevated">
        <TextArea />
      </Theme>,
    );
    const el = host.querySelector<HTMLElement>(".kui-textarea")!;
    // The FOURTH flip (2026-08-17): the field family left elevation with the fill-first
    // identity — a well is carved into the plane, not raised off it. TextField's own law
    // carries the reasoning and the both-halves probe; this is the family answering together.
    expect(computed(el, "box-shadow"), "a well is not raised off the plane").toBe("none");
    // @ts-expect-error — depth is an app identity; nothing chooses a shadow
    void (<TextArea shadow="2" />);
  });

  it("material re-derives the seal as glass, with no CSS of its own (§10)", () => {
    const glass = mounted(<TextArea backdrop />, { theme: { material: "regular" } });
    // Derived, not restated: the radius is config's to move (2026-08-16).
    expect(computed(glass, "backdrop-filter")).toContain(
      // The CONTROL cell's blur, not the pane's (control-scale material, lab port
      // 2026-08-17): a 40px box re-prices the ladder — half the blur, a leaner veil.
      `blur(${material.light.regular.control.filter.match(/blur\(([\d.]+)px\)/)![1]}px)`,
    );
    expect(computed(glass, "background-color")).toBe(
      bgOn(
        glass,
        // The OPAQUE twin, not the alpha dress (2026-08-19): the veil multiplies an alpha
        // source, so the glass scopes re-point the sources to the same rung said opaquely —
        // a glass field's designed veil measured 4.1% before (audit 2026-08-18).
        "color-mix(in srgb, var(--dress-field-fill-solid) var(--material-regular-control-alpha), transparent)",
      ),
    );
    // And on glass the veil's ALPHA holds while the SOURCE under it steps (2026-08-17):
    // control-scale material replaced the old three-alpha mix ramp with one alpha and moving
    // sources, which is what let the pin go.
    const derived = getComputedStyle(glass).getPropertyValue("--kui-ct-fill-hover").trim();
    expect(bgOn(glass, derived)).not.toBe(computed(glass, "background-color"));
  });

  it("resolves differently under a dark Theme — both directions of every axis", () => {
    const light = render(<TextArea />);
    const dark = mounted(<TextArea />, { theme: { appearance: "dark" } });
    expect(computed(dark, "background-color")).not.toBe(computed(light, "background-color"));
    expect(computed(dark, "border-top-color")).not.toBe(computed(light, "border-top-color"));
    // THE WELL, not the seal (2026-08-17, the fill-first flip): a field's resting identity is
    // the look's dress fill — "a field resolves to a light fill solid, border supplements"
    // (Kushagra) — where it used to be `--color-surface` with a solved hairline carrying it.
    expect(computed(dark, "background-color")).toBe(bgOn(dark, "var(--dress-field-fill)"));
    expect(computed(dark, "background-color")).not.toBe(bgOn(dark, "var(--color-surface)"));
  });
});

describe("the zoom floor rides the pointer axis (§4, §16)", () => {
  it("floors the type at the platform threshold wherever a finger is", () => {
    const coarse = render(
      <Theme pointer="coarse">
        <TextArea size="1" />
        <TextArea size="2" />
      </Theme>,
    );
    for (const el of coarse.querySelectorAll(".kui-textarea")) {
      expect(px(computed(el, "font-size"))).toBeGreaterThanOrEqual(16);
    }
  });

  it("and is the identity on a fine pointer — nothing is paid where nothing zooms", () => {
    const fine = mounted(<TextArea size="1" />, { theme: { pointer: "fine" } });
    expect(px(computed(fine, "font-size"))).toBeLessThan(16);
    // One element means the floor moves the box's own type where it applies; the line height
    // keeps its token, so the sizes still answer the index where the floor is inert.
    const coarse = render(
      <Theme pointer="coarse">
        <TextArea size="1" />
        <TextArea size="2" />
      </Theme>,
    );
    const [one, two] = [...coarse.querySelectorAll(".kui-textarea")];
    expect(computed(one!, "min-height")).not.toBe(computed(two!, "min-height"));
  });

  it("clears the platform's own dress — appearance is the system's, not iOS's", () => {
    expect(computed(render(<TextArea />), "appearance")).toBe("none");
  });
});

describe("a capsule is half the HEIGHT TOKEN, not half the rendered box (§6, decided 2026-08-05)", () => {
  // `full` used to price the control band at 9999px and let CSS clamping find the capsule —
  // which asks the RENDERED box, and a three-row textarea answered with a stadium, its first
  // line deep inside the corner curve. The band now states the rule itself:
  // --radius-control-N = half the size's control height. These laws read the COMPUTED radius,
  // which was the literal 9999px before the change — every one of them failed against it.
  it("a grown TextArea keeps the one-row curvature instead of scaling with its own height", () => {
    const host = render(
      <Theme radius="full">
        <TextArea size="2" rows={1} />
        <TextArea size="2" rows={4} />
      </Theme>,
    );
    const [one, four] = [...host.querySelectorAll<HTMLElement>(".kui-textarea")];
    const half = px(computed(one!, "min-height")) / 2;
    expect(px(computed(one!, "border-top-left-radius"))).toBeCloseTo(half, 1);
    // The law's whole point: the tall box wears the SAME corner, not half of itself.
    expect(computed(four!, "border-top-left-radius")).toBe(computed(one!, "border-top-left-radius"));
    expect(px(computed(four!, "height"))).toBeGreaterThan(px(computed(one!, "height")));
  });

  it("a fixed-height control renders the identical capsule the clamp used to produce", () => {
    // The change must be invisible where 9999 was giving the right answer.
    const button = mounted(<Button size="2">Label</Button>, { theme: { radius: "full" } });
    expect(px(computed(button, "border-top-left-radius"))).toBeCloseTo(
      px(computed(button, "min-height")) / 2,
      1,
    );
  });

  it("each world derives the capsule from its OWN height ladder", () => {
    // Substitution-at-declaration: the full cells re-state the rule beside each world's
    // heights, so a coarse or compact control halves the height it actually has.
    for (const world of [
      <Theme radius="full" density="compact" key="c" />,
      <Theme radius="full" pointer="coarse" key="p" />,
    ]) {
      const host = render(
        <world.type {...world.props}>
          <TextArea size="2" rows={3} />
        </world.type>,
      );
      const el = host.querySelector<HTMLElement>(".kui-textarea")!;
      expect(px(computed(el, "border-top-left-radius"))).toBeCloseTo(
        px(computed(el, "min-height")) / 2,
        1,
      );
    }
  });

  it("every other radius level is untouched — the rule exists only where the capsule does", () => {
    const medium = mounted(<TextArea size="2" rows={4} />, { theme: { radius: "medium" } });
    expect(px(computed(medium, "border-top-left-radius"))).toBeLessThan(
      px(computed(medium, "min-height")) / 2,
    );
  });
});

describe("the boundary (§3, §5)", () => {
  it("ref reaches the textarea — the one element there is", () => {
    let node: HTMLTextAreaElement | null = null;
    render(
      <TextArea
        ref={(n) => {
          node = n;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLTextAreaElement);
    node!.focus();
    expect(document.activeElement).toBe(node);
    node!.blur();
  });

  it("form props, className and style all land on the element — there is no second place", () => {
    const el = render(
      <TextArea className="mine" style={{ maxWidth: "300px" }} name="notes" id="probe" rows={3} />,
    ) as HTMLTextAreaElement;
    expect(el.className.split(" ").sort()).toEqual(["kui-control", "kui-textarea", "mine"]);
    expect(computed(el, "max-width")).toBe("300px");
    expect(el.name).toBe("notes");
    expect(el.id).toBe("probe");
    expect(el.rows).toBe(3);
  });

  it("accepts a value and reports changes like the native element it is", () => {
    let seen = "";
    const el = render(
      <TextArea defaultValue="hello" onChange={(e) => (seen = e.target.value)} />,
    ) as HTMLTextAreaElement;
    expect(el.value).toBe("hello");
    el.focus();
    // Through the prototype's own setter, because React tracks the value property — the same
    // trap the field's suite documents.
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
      .set!;
    setValue.call(el, "world");
    el.dispatchEvent(new Event("input", { bubbles: true }));
    expect(seen).toBe("world");
    el.blur();
  });

  it("the API's closed edges: no render, no children, no cols", () => {
    // One element that must stay a <textarea> — the platform wiring is the component.
    // @ts-expect-error — refused, deliberately (§5)
    void (<TextArea render={<div />} />);
    // React's contract for form values is defaultValue; two spellings for one fact is drift.
    // @ts-expect-error — children is not the API
    void (<TextArea>hello</TextArea>);
    // The same character-count width hack the field's native `size` attribute is.
    // @ts-expect-error — width belongs to layout
    void (<TextArea cols={40} />);
    // @ts-expect-error — `size` is the index, never a number
    void (<TextArea size={3} />);
  });
});
