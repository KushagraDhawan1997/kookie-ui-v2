/**
 * TextField's laws, mounted (§4, §8, §10, §11).
 *
 * Written to the bar the 2026-08-03 audit set: every one of these reads a COMPUTED value
 * through a mounted component, never an attribute string or a token name. The defects that
 * audit found were all in the gap between "the component writes the right attribute" and "the
 * engine resolves the right pixels", and a field — whose visible box is a wrapper around the
 * element that actually holds the state — lives entirely inside that gap.
 */
import { describe, expect, it } from "vitest";

import { Theme } from "../../theme/theme.tsx";
import { density, material } from "../../tokens/config.ts";
import {
  GLASS_MATERIALS, APPEARANCES, SIZES, colorOn, computed, mounted, render } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Checkbox } from "../checkbox/checkbox.tsx";
import { TextField } from "./text-field.tsx";

const px = (v: string) => parseFloat(v);

/** Every token this file resolves is a colour, and the harness's tokenOn reads lengths — so
    the name stays, one line over the shared probe. */
const tokenOn = (el: Element, name: string): string => colorOn(el, `var(${name})`);

/**
 * The fill a state rule would actually paint, resolved the way the cascade resolves it.
 *
 * `colorOn` alone cannot answer this: the derived fills are registered `inherits: false` (so a
 * glass control never paints its veil onto controls nested inside it), and the probe is a
 * CHILD — it sees nothing, falls through to the inheriting source, and reports the seal for
 * every material in the system. So read the derived value off the element itself, and fall
 * back to the source exactly as `var(--kui-fill-X, var(--kui-fill-src-X))` does.
 */
function stateFill(el: Element, state: "hover" | "active"): string {
  const derived = computed(el, `--kui-ct-fill-${state}`);
  return colorOn(el, derived || `var(--kui-ct-fill-src-${state})`);
}

const inputOf = (el: HTMLElement) => el.querySelector("input")!;

/** The placeholder is a real pseudo-element, and the only way to know what it looks like. */
const onPlaceholder = (el: Element, prop: string): string =>
  getComputedStyle(el, "::placeholder").getPropertyValue(prop).trim();

/**
 * THE ENGINE'S OWN ANSWER (2026-08-26). The field family's edge has TWO implementations and
 * the cascade chooses between them at parse time: inside `@supports (background-clip:
 * border-area)` the border goes transparent and the pane's conic RING paints in the band;
 * outside it the pre-lab flat `--material-*-edge` hairline stands, which recipes.css itself
 * calls "the honest fallback". Every law below asserted the first branch unconditionally —
 * so on an engine without the feature (the pinned HeadlessChrome this suite runs on is one)
 * the suite went red for a reason that is not a defect, and the rendering most users get was
 * asserted by nothing at all. Branching here is what makes both halves laws instead of one
 * half a law and the other half a false alarm; the static agreement between the two branches
 * is `text-field.test.ts`'s, where the emitted sheet can be read whatever the engine does.
 */

describe("the wrapper is the control, and it joins the size index (§4)", () => {
  it("resolves height, padding, radius and type from the shared control family", () => {
    const el = mounted(<TextField size="3" />, { theme: { radius: "medium" } });
    // radius="medium" pinned: this law states a palette-legible fact, and the DEFAULT
    // level is `full` since 2026-08-09 (capsules and pill padding — their own laws).
    // The designed set, not a restated number — same reason as the Button law it mirrors.
    expect(computed(el, "min-height")).toBe(`${density.default.height[2]}px`);
    expect(computed(el, "padding-left")).toBe(`${density.default.px[2]}px`);
    expect(computed(el, "border-top-left-radius")).toBe("8px");
    expect(computed(el, "font-size")).toBe("16px");
  });

  it("the input contributes no box of its own — one border, one height, one ring", () => {
    const el = render(<TextField size="3" />);
    const input = inputOf(el);
    expect(computed(input, "border-top-width")).toBe("0px");
    expect(computed(input, "padding-left")).toBe("0px");
    expect(computed(input, "outline-style")).toBe("none");
    expect(computed(input, "background-color")).toBe("rgba(0, 0, 0, 0)");
    // The border is the wrapper's, and it is really painted — a field is bordered by identity.
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

  it.each(APPEARANCES)("%s: one solved ladder of boundaries — mark, then field, then card (§7)", (appearance) => {
    // Rewritten same day it was written: the first form said field == ring, and Kushagra
    // rejected it in the preview — at equal colour, the long border of a large box reads far
    // heavier than a mark's ring, and APCA agrees (large non-text owes 30 where fine detail
    // owes 45). So the claim is an ORDER, not an identity: the ring is the strongest boundary,
    // the field's sits one tier down, the card's quiet hairline under both — and each resolves
    // its own solved role, so none of the three is a rung accident.
    const border = (el: HTMLElement) => computed(el, "border-top-color");
    const field = mounted(<TextField />, { theme: { appearance }, select: ".kui-field" });
    const mark = mounted(<Checkbox />, { theme: { appearance }, select: ".kui-checkbox" });
    const card = mounted(<Card>B</Card>, { theme: { appearance }, select: ".kui-surface" });

    // The DRESS edge since the fill-first flip (2026-08-17): the solved --field-edge was the
    // boundary a bordered field was recognised BY, and the well took that job. The solved
    // ladder still exists and is still what conformance reaches — contrast="high" stands the
    // dress down so the tone system's boundary returns, asserted in the HC law below.
    expect(border(field)).toBe(colorOn(field, "var(--dress-field-edge)"));
    // The mark family moved with the field family (2026-08-17): both rest on a dress well
    // and a dress edge now, so the LADDER this law is about is the dress ladder — mark, then
    // field, then card — not the solved one. That the three are still ORDERED is the claim,
    // and it is asserted below on the values themselves.
    expect(border(mark)).toBe(colorOn(mark, "var(--dress-mark-edge)"));
    // Three distinct tiers — a collapse in either direction is a design regression.
    expect(border(field)).not.toBe(border(mark));
    expect(border(field)).not.toBe(border(card));
  });

  it("follows the density and pointer worlds, like every control (§12, §16)", () => {
    const compact = mounted(<TextField size="2" />, { theme: { density: "compact" } });
    expect(computed(compact, "min-height")).toBe("28px");

    const touch = mounted(<TextField size="2" />, { theme: { pointer: "coarse" } });
    expect(computed(touch, "min-height")).toBe("44px");
  });
});

describe("a field and a button at the same index are the same box (§2, §4)", () => {
  // The strongest statement of the shared-layer claim there is, and the one that has to keep
  // being true as controls are added: if a form's Submit does not line up with the field above
  // it, the size index has stopped being an index. This is a law rather than a screenshot
  // because it compares two components against EACH OTHER — neither side can drift alone, and
  // neither can be satisfied by a hard-coded number.
  const BOX = [
    "min-height",
    "padding-left",
    "padding-right",
    "border-top-left-radius",
    "font-size",
    "column-gap",
    "border-top-width",
  ];

  for (const size of SIZES) {
    it(`agrees on every box property at size ${size}`, () => {
      const button = render(<Button size={size}>Label</Button>);
      const field = render(<TextField size={size} />);
      for (const property of BOX) {
        expect(computed(field, property), `size ${size} disagrees on ${property}`).toBe(
          computed(button, property),
        );
      }
    });
  }

  it("keeps agreeing in every density and pointer world (§12, §16)", () => {
    // The worlds re-declare the control family, so parity has to survive the re-declaration —
    // this is where a component that quietly hard-coded a height would finally show up.
    for (const world of [
      <Theme density="compact" key="c" />,
      <Theme density="comfortable" key="f" />,
      <Theme pointer="coarse" key="p" />,
    ]) {
      const host = render(
        <world.type {...world.props}>
          <Button size="2">Label</Button>
          <TextField size="2" />
        </world.type>,
      );
      const button = host.querySelector<HTMLElement>(".kui-button")!;
      const field = host.querySelector<HTMLElement>(".kui-field")!;
      expect(computed(field, "min-height")).toBe(computed(button, "min-height"));
      expect(computed(field, "border-top-left-radius")).toBe(
        computed(button, "border-top-left-radius"),
      );
    }
  });
});

describe("one treatment: a field has no loudness (§9, §11)", () => {
  it("exposes no emphasis, no tone, and no outer spacing", () => {
    // Loudness ranks actions against their siblings; a form where one field is louder than the
    // next names nothing. The type refusal is the law — the same one Card carries.
    // @ts-expect-error — emphasis is not a TextFieldProp
    void (<TextField emphasis="loud" />);
    // @ts-expect-error — tone is not a TextFieldProp
    void (<TextField tone="accent" />);
    // @ts-expect-error — no margin prop on any control (first non-negotiable)
    void (<TextField m="4" />);
    // @ts-expect-error — `size` is the index, never the native character-count attribute
    void (<TextField size={20} />);
  });

  it("the fill is the well, and it steps when you point at it", () => {
    const el = render(<TextField />);
    // THE WELL, not the seal (2026-08-17, the fill-first flip): a field's resting identity is
    // the look's dress fill — "a field resolves to a light fill solid, border supplements"
    // (Kushagra) — where it used to be `--color-surface` with a solved hairline carrying it.
    expect(computed(el, "background-color")).toBe(colorOn(el, "var(--dress-field-fill)"));
    expect(computed(el, "background-color")).not.toBe(colorOn(el, "var(--color-surface)"));
    expect(computed(el, "background-color")).not.toContain("rgba");

    // The trap this pins, which no rendered screenshot would catch: the shared layer paints
    // `var(--kui-ct-fill, var(--kui-ct-fill-src))` and swaps to the -hover / -active sources on
    // interaction. A field that declared only the rest source would make that declaration
    // INVALID AT COMPUTED-VALUE TIME the moment a pointer touched it, and background-color
    // would fall back to transparent. So resolve the interaction chains the way the hover and
    // press rules will, and assert they land on the same seal rather than on nothing.
    const rest = computed(el, "background-color");
    // The chains must RESOLVE — that is the trap, and it survives the pin's removal. What
    // changed 2026-08-17 is where they land: the pin held both to the resting value because a
    // field's states were carried by its border, and the well made the fill the one currency
    // hover has. So they must now be real, distinct steps rather than the same colour twice —
    // and still never transparent, which is the failure the pin was written against.
    const hover = colorOn(el, "var(--kui-ct-fill-hover, var(--kui-ct-fill-src-hover))");
    const active = colorOn(el, "var(--kui-ct-fill-active, var(--kui-ct-fill-src-active))");
    for (const [name, value] of [["hover", hover], ["active", active]] as const) {
      expect(value, `${name} resolves to nothing`).not.toBe("rgba(0, 0, 0, 0)");
      expect(value, `${name} did not step`).not.toBe(rest);
    }
  });

  it("wears a caret, not a hand, and its text stays selectable", () => {
    const el = render(<TextField />);
    // Both are inherited from the control skeleton and both are wrong for a field: the box is
    // a place to put a caret, and the value inside it is the user's to take.
    expect(computed(el, "cursor")).toBe("text");
    expect(computed(el, "user-select")).not.toBe("none");
    expect(computed(inputOf(el), "user-select")).not.toBe("none");
  });
});

describe("focus is a mode, not a keyboard affordance (§8)", () => {
  it("the ring lands on the WRAPPER when the input inside takes focus", () => {
    const el = render(<TextField />);
    expect(computed(el, "outline-style")).toBe("none");

    inputOf(el).focus();
    expect(document.activeElement).toBe(inputOf(el));
    // Not :focus-visible — you do not press a field, you enter it, and the box has to say
    // where the keystrokes land however you arrived.
    expect(computed(el, "outline-style")).toBe("solid");
    expect(computed(el, "outline-width")).toBe("2px");
    expect(computed(el, "outline-color")).toBe(tokenOn(el, "--focus-ring"));
    // And still exactly one ring: the input never grows a second one inside the first.
    expect(computed(inputOf(el), "outline-style")).toBe("none");
    inputOf(el).blur();
  });

  it("a focused control in a slot rings ITSELF, and the field stays unringed (§4)", () => {
    // The rule was `:focus-within`, which fires for any descendant. Since a control hosted in
    // a slot became a first-class pattern, that descendant is routinely a button — so tabbing
    // to a clear button lit two rings, one nested inside the other, and the outer one claimed
    // a focus the field did not have. Counting rings is the whole law, so both are read.
    const el = render(<TextField trailing={<Button size="1">Clear</Button>} />);
    const button = el.querySelector("button")!;

    button.focus();
    expect(document.activeElement).toBe(button);
    expect(computed(el, "outline-style")).toBe("none");

    // And the field's own ring still works with the button present — the fix narrowed the
    // question, it did not remove the answer.
    inputOf(el).focus();
    expect(computed(el, "outline-style")).toBe("solid");
    inputOf(el).blur();
  });
});

describe("validity is state, never a prop (§8)", () => {
  it("aria-invalid re-tones the border — the platform spelling, standalone", () => {
    const plain = render(<TextField />);
    const invalid = render(<TextField aria-invalid="true" />);
    expect(computed(invalid, "border-top-color")).toBe(tokenOn(invalid, "--invalid-edge"));
    expect(computed(invalid, "border-top-color")).not.toBe(computed(plain, "border-top-color"));
  });

  it("data-invalid re-tones it too — what Base UI writes inside a Field.Root", () => {
    const el = render(<TextField />);
    // The state lands on the INPUT; the border being corrected is the wrapper's. That is the
    // whole reason the rule needs :has(), and reading the wrapper's computed border is the
    // only way to know the hop actually happened.
    inputOf(el).setAttribute("data-invalid", "");
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--invalid-edge"));
    inputOf(el).removeAttribute("data-invalid");
    // The DRESS edge (2026-08-17, the fill-first flip): the solved --field-edge was what a
    // bordered field was recognised BY, and the well took that job. The solved ladder still
    // exists and conformance still reaches it — contrast="high" stands the dress down.
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--dress-field-edge"));
  });

  it("the value stays legible; the box carries the state, border AND ring (§8)", () => {
    const plain = render(<TextField />);
    const invalid = render(<TextField aria-invalid="true" />);
    expect(computed(invalid, "color")).toBe(computed(plain, "color"));

    // Reversed 2026-08-04. The ring was accent on an invalid field, which measured 6.4x the
    // visual weight of the error border beside it — so the error was faintest exactly when the
    // user focused to fix it — and put two chromatic signals in an argument. Both now read
    // --invalid-edge. Asserting the RESOLVED colour, not the token name: reading --focus-ring
    // through the invalid element resolves the remapped value and would pass either way.
    inputOf(plain).focus();
    inputOf(invalid).focus();
    expect(computed(invalid, "outline-color")).toBe(tokenOn(invalid, "--invalid-edge"));
    expect(computed(invalid, "outline-color")).not.toBe(computed(plain, "outline-color"));
    expect(computed(invalid, "border-top-color")).toBe(tokenOn(invalid, "--invalid-edge"));
    inputOf(plain).blur();
    inputOf(invalid).blur();
  });

  it("a destructive-tone Button still rings accent — this is a state, not a tone (§8)", () => {
    // The one-ring rule is reversed for the invalid STATE only; nothing about tone changed.
    // Asserted on the RESOLVED ring colour in each element's own scope rather than by focusing:
    // the control ring is :focus-visible, which a programmatic .focus() does not satisfy, so a
    // rendered-outline assertion here would pass for the wrong reason.
    const plain = render(<TextField />);
    const button = render(
      <Button tone="destructive" emphasis="loud">
        Delete
      </Button>,
    );
    const invalid = render(<TextField aria-invalid="true" />);
    expect(tokenOn(button, "--focus-ring")).toBe(tokenOn(plain, "--focus-ring"));
    expect(tokenOn(button, "--focus-ring")).not.toBe(tokenOn(invalid, "--focus-ring"));
    expect(tokenOn(invalid, "--focus-ring")).toBe(tokenOn(invalid, "--invalid-edge"));
  });
});

describe("disabled arrives through the shared remap (§8)", () => {
  it("goes flat by tone, never by opacity, and takes the input with it", () => {
    const el = render(<TextField disabled placeholder="hint" />);
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--disabled-border"));
    expect(computed(el, "opacity")).toBe("1");
    expect(computed(el, "cursor")).toBe("default");
    expect(inputOf(el).disabled).toBe(true);
    // The typed value goes flat with the control because the field's label colour is the ROLE
    // the remap re-points, not a colour of its own.
    expect(computed(el, "color")).toBe(tokenOn(el, "--neutral-8"));
    // ...and the hint must not end up brighter than the value beside it.
    expect(onPlaceholder(inputOf(el), "color")).toBe(tokenOn(el, "--neutral-8"));
  });

  it("disabled outranks invalid, deterministically", () => {
    const el = render(<TextField disabled aria-invalid="true" />);
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--disabled-border"));
  });
});

describe("the placeholder is a designed role, not a UA default (§7, §15)", () => {
  it("reads the MUTED role at full opacity — a placeholder is information, said quietly", () => {
    // Muted, then faint from 2026-08-05, then muted again 2026-08-10 — and the round trip is
    // not indecision: faint's DEFINITION changed under it. It named the placeholder as its
    // case while it was simply "the quiet one"; it is now the exception rung at Lc 30, below
    // the reading floor, for something deliberately stood down. A placeholder says what the
    // field wants, so it belongs on the rung that lands ON the reading floor.
    const el = render(<TextField placeholder="Search" />);
    const input = inputOf(el);
    expect(onPlaceholder(input, "color")).toBe(tokenOn(el, "--color-text-muted"));
    expect(onPlaceholder(input, "color")).not.toBe(tokenOn(el, "--color-text-faint"));
    // Firefox ships 0.54 here, which would stack a second fade on a role that is already a fade.
    // Chrome does not, so this law is about what we DECLARE surviving the cascade.
    expect(onPlaceholder(input, "opacity")).toBe("1");
  });

  it("the value is content and wears content weight — regular, not the control's medium (§15)", () => {
    // The skeleton's medium was designed for button labels and reached the input through
    // `font: inherit`; a field's value is the user's content, and content rests regular.
    const el = render(<TextField placeholder="Search" defaultValue="hello" />);
    expect(computed(inputOf(el), "font-weight")).toBe("400");
    // The button beside it keeps its own label weight — the skeleton re-declares it.
    const hosted = render(<TextField trailing={<Button>Show</Button>} />);
    expect(computed(hosted.querySelector(".kui-button")!, "font-weight")).toBe("500");
  });
});

describe("the slots are forced anatomy, and they behave like slots (§10)", () => {
  it("a leading icon takes the size index's box and the label's gap", () => {
    const el = render(
      <TextField
        size="3"
        leading={
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
          </svg>
        }
      />,
    );
    const icon = el.querySelector("svg")!;
    expect(computed(icon, "width")).toBe("20px");
    expect(computed(el, "column-gap")).toBe("8px");
    // Passive content is muted so an adornment never competes with the value.
    expect(computed(el.querySelector('[data-slot="leading"]')!, "color")).toBe(
      tokenOn(el, "--color-text-muted"),
    );
  });

  it("clicking the box lands the caret — the wrapper's first debt", () => {
    const el = render(<TextField leading={<span>$</span>} />);
    expect(document.activeElement).not.toBe(inputOf(el));
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(inputOf(el));
    inputOf(el).blur();

    // A passive slot redirects too: the whole box is one target.
    el.querySelector('[data-slot="leading"]')!.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(inputOf(el));
    inputOf(el).blur();
  });

  it("an interactive trailing control keeps its own press — the second debt", () => {
    let clicks = 0;
    const el = render(
      <TextField
        trailing={
          <Button size="1" onClick={() => (clicks += 1)}>
            Clear
          </Button>
        }
      />,
    );
    const button = el.querySelector("button")!;
    button.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    // The field does NOT steal the focus the trailing control was about to take.
    expect(document.activeElement).not.toBe(inputOf(el));
    button.click();
    expect(clicks).toBe(1);
    // And it resolves as its own control, not as part of the field: containment does not leak.
    expect(computed(button, "border-top-color")).toBe("rgba(0, 0, 0, 0)");
  });

  it("a long value scrolls inside the box instead of pushing the trailing slot out", () => {
    const el = render(
      <TextField style={{ width: "200px" }} trailing={<span data-testid="t">×</span>} />,
    );
    inputOf(el).value = "a".repeat(400);
    const slot = el.querySelector<HTMLElement>('[data-testid="t"]')!;
    // min-width: 0 on the input is what makes this true; without it the flex item's automatic
    // minimum is its content and the slot leaves the box.
    expect(slot.getBoundingClientRect().right).toBeLessThanOrEqual(
      el.getBoundingClientRect().right + 1,
    );
  });
});

describe("the dress is the well's identity, and states outrank it (§19)", () => {
  // The look axis is fully DELETED (controlLook 2026-08-19, surfaceLook 2026-08-20): the
  // dress is unconditional, and the laws below keep every guarantee the axis's laws carried.
  it.each(APPEARANCES)("%s: the dressed well keeps a live edge", (appearance) => {
    const field = mounted(<TextField />, { theme: { appearance }, select: ".kui-field" });
    expect(computed(field, "border-top-color")).not.toBe("rgba(0, 0, 0, 0)");
  });

  it.each(APPEARANCES)("%s: a read-only field still paints something", (appearance) => {
    // The cell nobody looped (audit 2026-08-06): readOnly drops the seal by design (it is
    // the invitation to type that goes, not the value), so the edge is what bounds it. The
    // law reads BOTH channels, because either one alone is satisfied by the broken state.
    const el = mounted(<TextField readOnly defaultValue="x" />, {
      theme: { appearance },
      select: ".kui-field",
    });
    const painted =
      computed(el, "background-color") !== "rgba(0, 0, 0, 0)" ||
      computed(el, "border-top-color") !== "rgba(0, 0, 0, 0)";
    expect(painted, "a read-only field is invisible — no fill and no edge").toBe(true);
  });

  it("the bare render is the themed render — no axis, no difference", () => {
    const bare = render(<TextField />);
    const themed = mounted(<TextField />, { theme: {}, select: ".kui-field" });
    for (const prop of ["background-color", "border-top-color"]) {
      expect(computed(themed, prop)).toBe(computed(bare, prop));
    }
  });

  it("invalid outranks dress: the error edge returns through the dress edge", () => {
    // The shared invalid arm stands the dress edge down (`initial`), so the family rule's
    // fallback resolves the re-pointed --tone-border at the element. Without that arm the
    // state would be swallowed exactly where the user needs it.
    const el = mounted(<TextField aria-invalid="true" />, { theme: {}, select: ".kui-field" });
    expect(computed(el, "border-top-color")).toBe(colorOn(el, "var(--invalid-edge)"));
  });

  it("disabled outranks dress too, and the dead edge RECEDES from the live one", () => {
    // Two claims since 2026-08-19: the stand-down still works (the dead border is the
    // remapped --disabled-border, not the dress edge), and the direction is right — the old
    // opaque --neutral-6 OUT-contrasted a live field's alpha edge in dark, making the one
    // disabled control the strongest boundary on the row (audit 2026-08-18).
    const el = mounted(<TextField disabled />, { theme: {}, select: ".kui-field" });
    expect(computed(el, "border-top-color")).toBe(colorOn(el, "var(--disabled-border)"));
    expect(computed(el, "border-top-color")).not.toBe(colorOn(el, "var(--dress-field-edge)"));
  });
});

describe("the app's identities reach the field without it knowing (§5, §10)", () => {
  it("does NOT cast, in either world — the fourth flip (§5)", () => {
    // 2026-08-04 lifted fields with the cards; 2026-08-06 reversed it (a well is content of
    // a plane); 2026-08-07 rejoins at CONTROL scale, which is what both earlier rounds were
    // missing: control-scale light did not exist. A field is a raised control, so it casts
    // exactly what the button casts — row 2 through the world token — never the card's row.
    const flat = render(<TextField />);
    expect(computed(flat, "box-shadow")).toBe("none");

    const elevated = mounted(<TextField />, { theme: { depth: "elevated" } });
    const probe = document.createElement("div");
    // THE FOURTH FLIP (2026-08-17, Kushagra): the field family left elevation. What 2026-08-06
    // rejected was surface-scale depth and 2026-08-07 restored at control scale — both were
    // priced on the bordered-box identity, where a field was a raised control like its button.
    // Its identity is the WELL now, and a well is carved into the plane, not raised off it, so
    // a drop shadow under one is a contradiction the eye reads immediately. The probe is kept
    // and inverted rather than deleted: the world token still exists and this is what catches
    // a field silently rejoining it.
    probe.style.boxShadow = "var(--control-chrome)";
    elevated.append(probe);
    // The probe still resolves the world's control row — the token is alive and an elevated
    // world still hands it out — and the FIELD does not take it. Both halves, so the law
    // cannot go green by the world going flat underneath it.
    expect(computed(probe, "box-shadow"), "the elevated world must still cast something").not.toBe("none");
    expect(computed(elevated, "box-shadow"), "a well is not raised off the plane").toBe("none");
    probe.remove();
    // @ts-expect-error — depth is an app identity; no field chooses a shadow
    void (<TextField shadow="2" />);
  });

  it("material re-derives the seal as glass, with no CSS of its own (§10)", () => {
    const glass = mounted(<TextField backdrop />, { theme: { material: "regular" } });
    // Derived, not restated: the radius is config's to move (2026-08-16).
    expect(computed(glass, "backdrop-filter")).toContain(
      // The CONTROL cell's blur, not the pane's (control-scale material, lab port
      // 2026-08-17): a 40px box re-prices the ladder — half the blur, a leaner veil.
      `blur(${material.light.regular.control.filter.match(/blur\(([\d.]+)px\)/)![1]}px)`,
    );
    // The veil is the field's OWN fill made translucent — the fill-modifier model, reached
    // through the shared control layer without text-field.css naming material once.
    expect(computed(glass, "background-color")).toBe(
      colorOn(glass, // The OPAQUE twin, not the alpha dress (2026-08-19): the veil multiplies an alpha
        // source, so the glass scopes re-point the sources to the same rung said opaquely —
        // a glass field's designed veil measured 4.1% before (audit 2026-08-18).
        "color-mix(in srgb, var(--dress-field-fill-solid) var(--material-regular-control-alpha), transparent)"),
    );
    expect(computed(glass, "background-color")).not.toMatch(/^rgb\(/);
  });

  it("a glass field wears the PANE's parts: edge, rim, and the transmitted cast (§10)", () => {
    // The card's material fix, one layer down (Kushagra, 2026-08-07: "text field and area
    // was left behind"): an opaque tone border on a pane of light is a sticker, so glass
    // fields wear the material's own translucent edge and top rim — and in an elevated
    // world they cast the CONTROL row transmitted, fainter than a solid field's.
    // depth pinned FLAT here (lab port 2026-08-17: the default flipped to elevated, the
    // radius-flip precedent) — this arm is about a flat world's glass never floating.
    const glass = mounted(<TextField backdrop />, { theme: { depth: "flat", material: "thin" } });
    // THE EDGE IS THE RING (2026-08-24, the glass lock — Kushagra: "the border is weird,
    // see how card does it, button does it"), AND SINCE 2026-09-02 IT IS ON THE SAME ANNULUS.
    // This line first asserted the flat --material-thin-edge, which was the defect stated as
    // a guarantee. Then the ring arrived as a background layer clipped to the border band,
    // because a <textarea> renders no generated content and the family shares one spelling —
    // and that band IS the outer boundary, so the lip had the world on one side of it rather
    // than veil on both. TextArea grew a wrapper on 2026-08-25 and the constraint died with
    // it. Asserted as the AGREEMENT with a glass Button's own ring: the resolved conic a
    // Button's ::after paints must be the conic this field's ::after paints.
    const glassBtn = mounted(<Button backdrop>b</Button>, { theme: { depth: "flat", material: "thin" } });
    const ring = getComputedStyle(glassBtn, "::after").backgroundImage;
    expect(ring).toContain("conic-gradient");
    expect(getComputedStyle(glass, "::after").content, "the wrapper grew no annulus").not.toBe("none");
    expect(getComputedStyle(glass, "::after").backgroundImage).toBe(ring);
    expect(computed(glass, "border-top-color")).toBe("rgba(0, 0, 0, 0)");
    // No conic in the element's OWN stack: the border-band layer is gone, not merely joined.
    expect(computed(glass, "background-image")).not.toContain("conic-gradient");
    // The rim still paints — it is the material, not the edge.
    expect(computed(glass, "background-image")).not.toBe("none");
    // Flat: glass never floats — the cast AND the pool are no-op LAYERS (the pool rides the
    // world pointers since 2026-08-17: "flat means flat", so matter stands down with light).
    const noop = document.createElement("div");
    // ONE no-op layer, not two, since the field left elevation (2026-08-17): the list is the
    // pool alone now — the transmitted cast went with the flip — and in a flat world that one
    // layer stands down to its `0 0 0 0 transparent` fallback.
    noop.style.boxShadow = "0 0 0 0 transparent";
    glass.append(noop);
    expect(computed(glass, "box-shadow")).toBe(computed(noop, "box-shadow"));
    noop.remove();

    const elevated = mounted(<TextField backdrop />, { theme: { depth: "elevated", material: "thin" } });
    const solid = mounted(<TextField />, { theme: { depth: "elevated" } });
    const probe = document.createElement("div");
    // The pool leads the transmitted rows in the ONE list (lab port 2026-08-17).
    // The POOL ALONE (2026-08-17): a glass field keeps the shade settling inside the pane —
    // matter — and no longer transmits the control row, which was elevation and left with the
    // fourth flip. The solid twin below is what keeps this honest: it must not cast either.
    probe.style.boxShadow = "var(--material-pool-control)";
    elevated.append(probe);
    expect(computed(elevated, "box-shadow")).toBe(computed(probe, "box-shadow"));
    expect(computed(elevated, "box-shadow")).not.toBe("none");
    expect(computed(elevated, "box-shadow")).not.toBe(computed(solid, "box-shadow"));
    probe.remove();
  });

  it("state outranks glass: an invalid or disabled glass field wears the state's border", () => {
    // The glass edge routes through one private name exactly so these two arms can stand it
    // down with one line each — without this, the brightest hairline in the field's world
    // would keep painting over the error signal.
    const invalid = mounted(<TextField backdrop aria-invalid="true" />, { theme: { material: "thin" } });
    expect(computed(invalid, "border-top-color")).toBe(colorOn(invalid, "var(--invalid-edge)"));
    const disabled = mounted(<TextField backdrop disabled />, { theme: { material: "thin" } });
    expect(computed(disabled, "border-top-color")).toBe(colorOn(disabled, "var(--disabled-border)"));
    // And the RING dies with the edge (2026-08-24): both arms stand --kui-ct-glass-ring down
    // beside --kui-ct-glass-edge, or the error border would paint UNDER a ring of light.
    expect(computed(invalid, "background-image")).not.toContain("conic-gradient");
    expect(computed(disabled, "background-image")).not.toContain("conic-gradient");
  });

  it("contrast=high leaves the field's glass light alone — the trade is deleted (2026-08-26)", () => {
    // REVERSED 2026-08-26 (Kushagra: "None of normal contrast appearance reduces contrast.
    // We increased veil, why should there any other difference"). The HC arm this law used
    // to assert (--kui-glass-hc-edge handing pigment back, --kui-ct-glass-ring stood down)
    // is deleted with its premise: since 2026-08-24 the ring carries pigment arcs and IS a
    // boundary, so replacing light with a flat hairline deleted information — the rim's
    // 2026-08-20 sentence one part over. A glass field under high contrast wears exactly
    // what it wears in standard, on a more sealed veil; the STATE arms above keep their
    // ring stand-down, because a state is a signal and outranks dress at every contrast.
    const at = (contrast: "normal" | "high") =>
      mounted(<TextField backdrop />, { theme: { material: "thin", contrast } });
    const normal = at("normal");
    const high = at("high");
    // The border is identical at both contrasts — in the border-area engine that is
    // transparent outright (the ring is the edge), and the pigment substitute never arrives.
    expect(computed(high, "border-top-color")).toBe(computed(normal, "border-top-color"));
    expect(computed(high, "border-top-color"), "the pigment substitute is back").not.toBe(
      colorOn(high, "var(--tone-border)"),
    );
    // The ring paints under HC exactly as in standard. It is on the ::after since 2026-09-02,
    // so the claim moves there with it — and the element's own stack, which used to carry it,
    // must still agree across contrasts, because the rim and the world's light live there.
    expect(getComputedStyle(high, "::after").backgroundImage, "the field's ring must stay lit").toContain(
      "conic-gradient",
    );
    expect(getComputedStyle(high, "::after").backgroundImage).toBe(
      getComputedStyle(normal, "::after").backgroundImage,
    );
    expect(computed(high, "background-image")).toBe(computed(normal, "background-image"));
  });

  it.each(GLASS_MATERIALS)(
    "a disabled %s-glass field sits flat in an elevated world (audit 2026-08-07)",
    (material) => {
      // The arm above ran in a FLAT theme, where the shadow is `none` whether the state
      // reaches it or not — so it passed with the state never reaching it. The field is also
      // the harder half of this defect: its disabled selector is the `:has()` arm, which ties
      // with the glass rules on specificity and loses on source order, so the fix has to stand
      // down the three world names rather than the glass value itself.
      const live = mounted(<TextField backdrop />, {
        theme: { depth: "elevated", material },
      });
      const dead = mounted(<TextField backdrop disabled />, {
        theme: { depth: "elevated", material },
      });
      // THE LIVE HALF INVERTED 2026-08-17: the field family left elevation, so a glass field
      // no longer transmits a cast either — what survives on glass is the POOL, the shade
      // settling inside the pane, which is matter rather than lift. So `live` is a no-op list
      // too, and the claim this law still owns is the one it was written for: the disabled arm
      // must reach the glass path at all, which the flat arm above cannot prove.
      // A glass field casts NOTHING in either state since the field family left elevation
      // (2026-08-17) — not the transmitted row, and not the pool either, because the pool
      // rides the same world tokens the flip stood down. Live and dead therefore agree, which
      // means this law can no longer prove the disabled arm REACHES the glass path; that
      // guarantee lives on in button.browser.test.tsx, whose rungs still cast. What is left
      // here is the flip itself, asserted in both states so a field silently rejoining
      // elevation fails on the live half.
      // What a glass field keeps is the POOL — the shade settling inside the pane, which is
      // matter rather than lift — and what it lost with the fill-first flip is the transmitted
      // CAST, which was elevation. So live still resolves a real list and dead resolves none,
      // which is what keeps this law able to prove the disabled arm reaches the glass path.
      expect(computed(live, "box-shadow"), `${material} glass keeps its pool`).not.toBe("none");
      // Dead stands the pool down through the same `initial` arm, and with the transmitted
      // row gone the whole declaration is invalid at computed-value time, so the shadow falls
      // to the keyword rather than to a no-op layer list.
      expect(computed(dead, "box-shadow"), `${material} glass must not cast when dead`).toBe("none");
      expect(computed(dead, "box-shadow")).not.toBe(computed(live, "box-shadow"));
    },
  );

  it("resolves differently under a dark Theme — both directions of every axis", () => {
    const light = render(<TextField />);
    const dark = mounted(<TextField />, { theme: { appearance: "dark" } });
    expect(computed(dark, "background-color")).not.toBe(computed(light, "background-color"));
    expect(computed(dark, "border-top-color")).not.toBe(computed(light, "border-top-color"));
    // The dark seal and its own surface token, not a light value leaking through a var that
    // resolved where it was declared.
    // THE WELL, not the seal (2026-08-17, the fill-first flip): a field's resting identity is
    // the look's dress fill — "a field resolves to a light fill solid, border supplements"
    // (Kushagra) — where it used to be `--color-surface` with a solved hairline carrying it.
    expect(computed(dark, "background-color")).toBe(colorOn(dark, "var(--dress-field-fill)"));
    expect(computed(dark, "background-color")).not.toBe(colorOn(dark, "var(--color-surface)"));
  });
});

describe("the boundary (§3, §5)", () => {
  it("ref reaches the INPUT — what a caller actually holds a field for", () => {
    let node: HTMLInputElement | null = null;
    render(
      <TextField
        ref={(n) => {
          node = n;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLInputElement);
    node!.focus();
    expect(document.activeElement).toBe(node);
    node!.blur();
  });

  it("form props land on the input; className and style dress the wrapper", () => {
    const el = render(
      <TextField className="mine" style={{ maxWidth: "300px" }} name="email" placeholder="you@" />,
    );
    expect(el.className.split(" ").sort()).toEqual(["kui-control", "kui-field", "mine"]);
    expect(computed(el, "max-width")).toBe("300px");
    const input = inputOf(el);
    expect(input.name).toBe("email");
    expect(input.placeholder).toBe("you@");
    // The input must stay the labellable, form-associated element: `id` goes to it, so a
    // <label for> and Field.Label both land where the platform expects.
    expect(inputOf(render(<TextField id="probe" />)).id).toBe("probe");
  });

  it("accepts a value and reports changes like the native element it is", () => {
    let seen = "";
    const el = render(<TextField defaultValue="hello" onChange={(e) => (seen = e.target.value)} />);
    const input = inputOf(el);
    expect(input.value).toBe("hello");
    input.focus();
    // Assigning `input.value` directly is NOT typing: React swaps the value property for a
    // tracked one, so a plain assignment updates its cache too and the change it dedupes
    // against never appears. Going through the prototype's own setter is what a keystroke
    // does — and getting this wrong makes a field look inert in a test while working in a
    // browser, or the reverse.
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    setValue.call(input, "world");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(seen).toBe("world");
    input.blur();
  });
});

describe("a control inside a glass control paints its OWN fill (§2, §10)", () => {
  // The field states `backdrop` in every law here, and that is the SELECTIVITY rule rather
  // than a test convenience (2026-08-17): material is priced where a backdrop exists, so a
  // field on calm ground resolves solid no matter what the theme says. A law that mounts a
  // glass theme and no backdrop is now measuring an opaque control and calling it glass.
  // recipes.css guarded --kui-border-color and nothing else, while surfaces.css guarded its
  // three equivalents. Material writes --kui-ct-fill/-hover/-active on the element carrying
  // [data-material], custom properties inherit, so a Button in the trailing slot of a glass
  // field computed the identical background as the field itself — at rest, on hover and on
  // press — unblurred, reading as one flat shape rather than a control inside a container.
  it("a Button in a material field does not inherit the field's veil", () => {
    const field = mounted(<TextField backdrop trailing={<Button size="1">Show</Button>} />, {
      theme: { material: "regular" },
    });
    const button = field.querySelector("button")!;
    // The claim is that it does not take the FIELD's veil, not that it is opaque: a hosted
    // control on glass resolves `on-glass` (2026-08-16), which is its own fill at its own
    // alpha. Compared against the field it sits in, which is what "inherit" would mean.
    expect(computed(button, "background-color")).not.toBe(computed(field, "background-color"));
    const alpha = (c: string) => (c.includes("/") ? parseFloat(c.slice(c.lastIndexOf("/") + 1)) : 1);
    expect(alpha(computed(button, "background-color")), "a hosted control sealed itself onto the glass").toBeLessThan(1);
  });

  it("and it does not inherit the blur either — one glass per stack (§10)", () => {
    const field = mounted(<TextField backdrop trailing={<Button size="1">Show</Button>} />, {
      theme: { material: "regular" },
    });
    expect(computed(field.querySelector("button")!, "backdrop-filter")).toBe("none");
    // The negative control the CSS-only version could not have: the field itself must still be
    // glass, or "the button is not glass" passes because nothing in the tree ever was.
    expect(computed(field, "backdrop-filter")).not.toBe("none");
  });

  it("the hosted button REFUSES the material structurally, not just visually (§10, 2026-08-16)", () => {
    // Since material became the theme's, "one glass per stack" is answered in React rather
    // than by an inheritance guard: a member that paints a veil scopes its subtree, and
    // `useMaterial()` below it resolves `on-glass` — never the theme's thickness. That is a
    // stronger claim than "its computed fill differs", and the one that survives a rewrite of
    // the CSS: whatever the stylesheet does, the button is not asking to be glass.
    const field = mounted(<TextField backdrop trailing={<Button size="1">Show</Button>} />, {
      theme: { material: "regular" },
    });
    expect(field.dataset["material"]).toBe("regular");
    expect(field.querySelector("button")!.dataset["material"]).toBe("on-glass");
  });
});

describe("a control hosted in a slot is sized by its container (§4, decided 2026-08-04)", () => {
  // The system had no rule for a control inside a control, so the call site had to derive the
  // relationship — pick a size index — and the mapping it was asked to infer was non-uniform
  // and undefined at size 1. Everything here is measured geometry, because that is the entire
  // subject: what the numbers ARE is the decision.
  for (const size of SIZES) {
    it(`fits inside the field at size ${size}, with equal air on all four sides`, () => {
      const field = render(
        <TextField size={size} trailing={<Button>Show</Button>} defaultValue="hunter2" />,
      );
      const button = field.querySelector<HTMLElement>(".kui-button")!;
      const fieldBox = field.getBoundingClientRect();
      const buttonBox = button.getBoundingClientRect();

      // 1. The field is the height its own size token says. Before this rule a nested control
      //    exceeded the content box and stretched the wrapper by 2 x --border-width.
      const bare = render(<TextField size={size} />);
      expect(px(computed(field, "height"))).toBe(px(computed(bare, "height")));

      // 2. The hosted control is strictly smaller than its container — it reads as an
      //    affordance inside a box, not as a second box.
      expect(buttonBox.height).toBeLessThan(fieldBox.height);

      // 3. The air is the SAME number on all four sides, which is the point of one designed
      //    inset driving both the padding and the derived height.
      const top = buttonBox.top - fieldBox.top;
      const bottom = fieldBox.bottom - buttonBox.bottom;
      const right = fieldBox.right - buttonBox.right;
      expect(Math.abs(top - bottom)).toBeLessThanOrEqual(1);
      expect(Math.abs(right - top)).toBeLessThanOrEqual(1);
    });
  }

  it("an ICON slot keeps the field's own text inset — an icon is not a hosted control", () => {
    // The guard that makes the rule above safe: an icon has no box of its own and wants to line
    // up with the value beside it, so it must NOT get the tighter slot inset.
    // Compared at radius="medium", where bare and slotted edges share the plain inset; under
    // the `full` DEFAULT a bare edge pads the pill while the slotted edge keeps plain — the
    // pill laws own that split.
    const withIcon = mounted(<TextField leading={<svg />} />, { theme: { radius: "medium" } });
    const plain = mounted(<TextField />, { theme: { radius: "medium" } });
    expect(computed(withIcon, "padding-left")).toBe(computed(plain, "padding-left"));
  });

  it("re-sizes with density, because both numbers ride the control family (§12)", () => {
    const compact = mounted(<TextField size="2" trailing={<Button>Show</Button>} />, {
      theme: { density: "compact" },
    });
    const dflt = render(<TextField size="2" trailing={<Button>Show</Button>} />);
    const h = (root: HTMLElement) => px(computed(root.querySelector<HTMLElement>(".kui-button")!, "height"));
    expect(h(compact)).toBeLessThan(h(dflt));
  });
});

describe("a bare pill edge pads wider, and only a bare edge (§4, §6, decided 2026-08-05)", () => {
  // The Password/Search pair that decided the per-side rule: a pill field whose text meets the
  // corner curve directly pads wider on that side alone. A leading icon or a trailing control
  // already stands between the text and the curve, so those sides keep what they had.
  it("a bare field compensates both sides; every other radius level is untouched", () => {
    const full = mounted(<TextField size="2" />, { theme: { radius: "full" } });
    expect(computed(full, "padding-left")).toBe(`${density.default.pxPill[1]}px`);
    expect(computed(full, "padding-right")).toBe(`${density.default.pxPill[1]}px`);

    const medium = mounted(<TextField size="2" />, { theme: { radius: "medium" } });
    expect(computed(medium, "padding-left")).toBe(`${density.default.px[1]}px`);
  });

  it("the Password case: leading text compensates, the trailing control keeps the slot inset", () => {
    const field = mounted(<TextField size="2" trailing={<Button size="1">Show</Button>} />, {
      theme: { radius: "full" },
    });
    expect(computed(field, "padding-left")).toBe(`${density.default.pxPill[1]}px`);
    expect(computed(field, "padding-right")).toBe(`${density.default.slotInset[1]}px`);
  });

  it("the Search case: a leading icon keeps the plain padding under a pill", () => {
    const field = mounted(<TextField size="2" leading={<svg />} />, {
      theme: { radius: "full" },
    });
    expect(computed(field, "padding-left")).toBe(`${density.default.px[1]}px`);
  });
});

describe("the wrapper's four JS debts, paid (§4, audited 2026-08-05)", () => {
  it("a Field.Root-disabled field greys out — the wrapper is told by the input, not the prop", () => {
    // The component stamped data-disabled from ITS OWN prop and claimed that was sufficient
    // "because we own the prop". It is not: Base UI computes `fieldDisabled || disabledProp`
    // at the input, so a disabled fieldset never passes through this component at all and the
    // element that paints — the wrapper — was never told. Simulated by disabling the input
    // directly, which is exactly the state Field.Root produces.
    const el = render(<TextField />);
    const live = computed(el, "border-top-color");

    inputOf(el).disabled = true;
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--disabled-border"));
    expect(computed(el, "border-top-color")).not.toBe(live);
    expect(computed(el, "cursor")).toBe("default");
    // And the hint goes flat with the value, rather than ending up brighter than it.
    expect(onPlaceholder(inputOf(el), "color")).toBe(tokenOn(el, "--tone-label"));

    inputOf(el).disabled = false;
    expect(computed(el, "border-top-color")).toBe(live);
  });

  it("a disabled control HOSTED in a slot does not grey out the field containing it", () => {
    // The `:has()` arm is direct-child only, and this is why: a clear button that has gone
    // disabled is a grandchild, and a field is not disabled because something inside it is.
    const el = render(<TextField trailing={<Button disabled>Clear</Button>} />);
    const plain = render(<TextField />);
    expect(computed(el, "border-top-color")).toBe(computed(plain, "border-top-color"));
  });

  it("clicking the box lands the caret in THIS field's input, not the first one in the box", () => {
    // The redirect did `currentTarget.querySelector("input")`, which is document order — a
    // leading slot holding an input of its own (a country code, a unit) is earlier in the
    // tree, so clicking the padding put the caret in the adornment instead of the value.
    const el = render(<TextField leading={<input data-testid="adornment" size={2} />} />);
    const adornment = el.querySelector<HTMLInputElement>('[data-testid="adornment"]')!;
    expect(inputOf(el)).toBe(adornment); // document order: the trap, made visible

    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(el.querySelector(".kui-field-input"));
    expect(document.activeElement).not.toBe(adornment);
    (document.activeElement as HTMLElement).blur();
  });

  it("a falsy adornment renders no slot at all — not an empty one buying a gap", () => {
    // `{isSearch && <Icon/>}` evaluates to `false` and `""` is what a unit slot holds before
    // the caller has one. Both passed the old `!== undefined && !== null` guard, and each
    // rendered an empty span that still took a full gap of dead space beside the value.
    for (const empty of [false, "", null, undefined] as const) {
      const el = render(<TextField leading={empty} trailing={empty} />);
      expect(el.querySelectorAll("[data-slot]")).toHaveLength(0);
    }
    // 0 is content, and stays.
    expect(render(<TextField leading={0} />).querySelectorAll("[data-slot]")).toHaveLength(1);
  });

  it("children is not part of the API — a void element has none", () => {
    // It was typed on the props and spread onto the `<input>`: it compiled clean and threw at
    // render. The law is the type error, which `tsc --noEmit` runs over this file.
    // @ts-expect-error — the slots are the way in (§4)
    void (<TextField>hello</TextField>);
  });
});

describe("a glass field's fill really does not move (§10)", () => {
  it("hover and press move the SOURCE under the veil, never the veil's own alpha", () => {
    // The three fill SOURCES were pinned to one colour, and that was still not enough: a fill
    // modifier mixes the source toward transparent on a ramp of its own, so what moved was the
    // mix. In light at `regular` that ramp is 64% -> 72% -> 80% of the same white.
    const glass = mounted(<TextField backdrop />, { theme: { material: "regular" } });
    // THE PIN IS GONE (2026-08-17). Its reason was real and is now spent: the 2026-08-05 ramp
    // moved the MIX (64% -> 72% -> 80% of one colour), so a field lightened under a pointer
    // that only crossed it. Control-scale material replaced that ramp with ONE alpha and
    // moving SOURCES, and the fill-first flip gave the field designed steps to move through —
    // so on glass the veil's alpha holds while the source underneath it steps, which is the
    // claim that replaces this one.
    const rest = computed(glass, "background-color");
    expect(stateFill(glass, "hover"), "the veil stopped answering the pointer").not.toBe(rest);
    expect(stateFill(glass, "active"), "press must move too").not.toBe(rest);
    // Still glass, not the seal — pinning the states must not have flattened the material.
    expect(rest).not.toBe(computed(render(<TextField />), "background-color"));
  });

  it("and pinning it does not reach a control that IS supposed to move", () => {
    // The pin is unguarded — where nothing derives a fill the reference is invalid at
    // computed-value time and the shared fallback chain takes over. A plain Button proves the
    // chain still steps, so the mechanism cannot have leaked past the field.
    const button = render(<Button emphasis="medium">Save</Button>);
    expect(stateFill(button, "hover")).not.toBe(computed(button, "background-color"));
    // Including one that DOES derive a fill, which is the case the pin could actually reach.
    const glassButton = mounted(<Button emphasis="medium">Save</Button>, {
      theme: { material: "regular" },
    });
    expect(stateFill(glassButton, "hover")).not.toBe(computed(glassButton, "background-color"));
  });
});

describe("the input's own facts (§4)", () => {
  it("clears the platform's inset shadow and corner — appearance is the system's, not iOS's", () => {
    // Shipped behaviour with no law until 2026-08-05. iOS paints its own inset shadow and
    // radius on every text input and ignores the background until appearance is cleared —
    // the same class of platform default as the tap highlight, and just as invisible from a
    // desktop, which is precisely why it needs a law rather than an eye.
    expect(computed(inputOf(render(<TextField />)), "appearance")).toBe("none");
  });

  it("the value is the field's type and the surface's foreground — the thing it exists to show", () => {
    const el = render(<TextField size="3" defaultValue="hello" />);
    const input = inputOf(el);
    expect(computed(input, "font-size")).toBe(computed(el, "font-size"));
    expect(computed(input, "font-family")).toBe(computed(el, "font-family"));
    expect(computed(input, "letter-spacing")).toBe(computed(el, "letter-spacing"));
    expect(computed(input, "color")).toBe(computed(el, "color"));
  });
});

describe("the zoom floor: a field must not move the page under a finger (§4, §16)", () => {
  // Safari zooms the whole page when a text input under 16px takes focus. The handheld band
  // lifts the type ladder far enough that sizes 2+ clear it wherever the pointer is coarse —
  // but size 1 is under the threshold in every band there is, so the floor is still needed,
  // and it rides the same pointer world the band does (found when the band was width-gated
  // and an iPad in landscape fell out of it; the gate is gone, the floor stays).
  const size = (root: HTMLElement, s: "1" | "2") =>
    root.querySelector<HTMLElement>(`.kui-field[data-size="${s}"]`)!;

  const world = (pointer: "fine" | "coarse") =>
    render(
      <Theme pointer={pointer}>
        <TextField size="1" />
        <TextField size="2" />
      </Theme>,
    );

  it("floors the input at the platform threshold wherever a finger is", () => {
    const coarse = world("coarse");
    for (const s of ["1", "2"] as const) {
      const field = size(coarse, s);
      expect(parseFloat(computed(inputOf(field), "font-size"))).toBeGreaterThanOrEqual(16);
    }
  });

  it("and is the identity on a fine pointer — nothing is paid where nothing zooms", () => {
    const fine = world("fine");
    for (const s of ["1", "2"] as const) {
      const field = size(fine, s);
      expect(computed(inputOf(field), "font-size")).toBe(computed(field, "font-size"));
    }
    expect(parseFloat(computed(inputOf(size(fine, "1")), "font-size"))).toBeLessThan(16);
  });

  it("lands on the INPUT alone — the box and the label keep their designed step", () => {
    // Otherwise the floor becomes a second type axis: a size-1 field would render a size-2
    // label, and the control-vs-type parity that the whole size index rests on would break.
    const coarse = world("coarse");
    const one = size(coarse, "1");
    const two = size(coarse, "2");
    expect(computed(one, "font-size")).not.toBe(computed(two, "font-size"));
    expect(parseFloat(computed(one, "min-height"))).toBeLessThan(
      parseFloat(computed(two, "min-height")),
    );
  });
});

describe("readOnly is a state with a resolved appearance (§8, added 2026-08-05)", () => {
  it("drops the well and keeps everything else", () => {
    const plain = render(<TextField defaultValue="v" />);
    const ro = render(<TextField defaultValue="v" readOnly />);
    // The seal is what makes a field read as a place to put a caret. It is the one thing gone.
    expect(computed(ro, "background-color")).toBe("rgba(0, 0, 0, 0)");
    expect(computed(plain, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
    // Everything a read-only field still IS: bounded, legible, selectable, focusable.
    expect(computed(ro, "border-top-color")).toBe(computed(plain, "border-top-color"));
    expect(computed(ro, "color")).toBe(computed(plain, "color"));
    expect(computed(ro, "cursor")).toBe("text");
    inputOf(ro).focus();
    expect(document.activeElement).toBe(inputOf(ro));
    expect(computed(ro, "outline-style")).toBe("solid");
    inputOf(ro).blur();
  });

  it("does not borrow the disabled vocabulary, and disabled does not borrow this", () => {
    // CSS :read-only matches anything that is not :read-write, which INCLUDES a disabled
    // input — so without the :not(:disabled) guard every disabled field would lose its fill
    // on top of the disabled remap: two states painting one box.
    const off = render(<TextField disabled />);
    expect(computed(off, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
    const ro = render(<TextField readOnly />);
    expect(computed(ro, "border-top-color")).not.toBe(tokenOn(ro, "--disabled-border"));
  });
});

describe("the API's closed edges (§3, §4)", () => {
  it("type is a closed union — hidden and the non-text controls are refused", () => {
    // Unconstrained, `type="hidden"` rendered a VISIBLE empty bordered box: the wrapper draws
    // the border and the height, and it cannot honour a type it was never told about.
    // @ts-expect-error — hidden renders no box; it is not a field
    void (<TextField type="hidden" />);
    // @ts-expect-error — a different control with its own anatomy
    void (<TextField type="checkbox" />);
    // @ts-expect-error — that is a Button
    void (<TextField type="submit" />);
    void (<TextField type="email" />);
    void (<TextField type="password" />);
  });

  it("there is no render escape, and the type is where that is enforced", () => {
    // Every other component's `render` swaps the one element that IS the component. Here
    // there are two and neither can move: the wrapper holds a border the input cannot hold
    // once a slot is inside it, and the input must stay an <input> or the platform wiring
    // this component exists to preserve goes with it.
    // @ts-expect-error — refused, deliberately (§5)
    void (<TextField render={<textarea />} />);
  });
});

describe("slot content reaches the accessibility tree (§4, added 2026-08-05)", () => {
  it("an adornment DESCRIBES the field rather than floating beside it", () => {
    const el = render(<TextField leading={<span>$</span>} trailing={<span>USD</span>} />);
    const ids = inputOf(el).getAttribute("aria-describedby")!.split(" ");
    expect(ids).toHaveLength(2);
    // Resolve them the way an AT would: the ids must actually name the slots.
    const text = ids.map((id) => el.querySelector(`#${CSS.escape(id)}`)!.textContent);
    expect(text).toEqual(["$", "USD"]);
  });

  it("describes, never labels — an adornment qualifies the value, it does not name the field", () => {
    const el = render(<TextField leading={<span>$</span>} />);
    expect(inputOf(el).getAttribute("aria-labelledby")).toBe(null);
  });

  it("appends to the caller's description instead of replacing it", () => {
    // A field inside a Field.Root already carries a description id, and losing it would trade
    // one accessibility defect for another.
    const el = render(<TextField aria-describedby="hint" trailing={<span>USD</span>} />);
    const ids = inputOf(el).getAttribute("aria-describedby")!.split(" ");
    expect(ids[0]).toBe("hint");
    expect(ids).toHaveLength(2);
  });

  it("says nothing when there is nothing to say", () => {
    expect(inputOf(render(<TextField />)).getAttribute("aria-describedby")).toBe(null);
  });
});

describe("late binding: the look's edge resolves at the ELEMENT, not the Theme (§6, §19)", () => {
  // Blind spot from the look audit. The `initial` spelling had exactly one guard, and it
  // asserted the STRING "initial" appears in the emitted text — so it pinned the mechanism the
  // docs credit, while the failure that spelling exists to prevent had no law at all.
  //
  // And the critic's other half is confirmed rather than repaired: that documented failure is
  // UNREACHABLE today. Tried directly — set outlined's field border to `var(--tone-border)` in
  // config, regenerate, run — and the suite stays green, because the shared state arms already
  // stand the role down, so the frozen value never survives to paint. A law for it would be a
  // law for nothing.
  //
  // What IS reachable, and had no law: those arms are the only thing making a state outrank
  // the dress, and nothing checked them per LOOK. So the assertion is the outcome the arms
  // exist to produce — invalid must move the edge, in both looks and both appearances.
  // Mutation-tested by deleting the invalid arm: both `filled` cells fail.
  // One look loop fewer since the controlLook deletion (2026-08-19) — the dress the state
  // must outrank is unconditional now.
  {
    for (const appearance of APPEARANCES) {
      it(`${appearance}: a state re-pointing the tone still reaches the edge`, () => {
        const at = (invalid: boolean) =>
          mounted(invalid ? <TextField aria-invalid="true" /> : <TextField />, {
            theme: { appearance },
            select: ".kui-field",
          });
        const valid = at(false);
        const invalid = at(true);
        expect(computed(valid, "border-top-color"), "a field with no edge proves nothing").not.toBe(
          "rgba(0, 0, 0, 0)",
        );
        expect(
          computed(invalid, "border-top-color"),
          "the edge is frozen at the Theme scope — a state cannot reach it",
        ).not.toBe(computed(valid, "border-top-color"));
        expect(computed(invalid, "border-top-color")).toBe(tokenOn(invalid, "--tone-border"));
      });
    }
  }
});
