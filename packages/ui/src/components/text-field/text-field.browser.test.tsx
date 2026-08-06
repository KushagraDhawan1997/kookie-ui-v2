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
import { density } from "../../tokens/config.ts";
import { SIZES, colorOn, computed, mounted, render } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
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

describe("the wrapper is the control, and it joins the size index (§4)", () => {
  it("resolves height, padding, radius and type from the shared control family", () => {
    const el = render(<TextField size="3" />);
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
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--neutral-border"));
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

  it("the fill is the opaque seal, and it does not move when you point at it", () => {
    const el = render(<TextField />);
    expect(computed(el, "background-color")).toBe(colorOn(el, "var(--color-surface)"));
    expect(computed(el, "background-color")).not.toContain("rgba");

    // The trap this pins, which no rendered screenshot would catch: the shared layer paints
    // `var(--kui-ct-fill, var(--kui-ct-fill-src))` and swaps to the -hover / -active sources on
    // interaction. A field that declared only the rest source would make that declaration
    // INVALID AT COMPUTED-VALUE TIME the moment a pointer touched it, and background-color
    // would fall back to transparent. So resolve the interaction chains the way the hover and
    // press rules will, and assert they land on the same seal rather than on nothing.
    const rest = computed(el, "background-color");
    expect(colorOn(el, "var(--kui-ct-fill-hover, var(--kui-ct-fill-src-hover))")).toBe(rest);
    expect(colorOn(el, "var(--kui-ct-fill-active, var(--kui-ct-fill-src-active))")).toBe(rest);
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
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--neutral-border"));
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
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--neutral-6"));
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
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--neutral-6"));
  });
});

describe("the placeholder is a designed role, not a UA default (§7, §15)", () => {
  it("reads the FAINT role at full opacity — the role whose definition names the placeholder", () => {
    // Was muted until 2026-08-05: the faint role's own definition ("below body-copy contrast
    // by design — a placeholder, a timestamp") named this case, and the stylesheet disagreed
    // with it. Muted stays the slot colour: an adornment informs, a placeholder invites.
    const el = render(<TextField placeholder="Search" />);
    const input = inputOf(el);
    expect(onPlaceholder(input, "color")).toBe(tokenOn(el, "--color-text-faint"));
    expect(onPlaceholder(input, "color")).not.toBe(tokenOn(el, "--color-text-muted"));
    // Firefox ships 0.54 here, which would stack a second fade on an already-faint role.
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

describe("the app's identities reach the field without it knowing (§5, §10)", () => {
  it("a well casts no shadow — flat in BOTH worlds (§5, reversed 2026-08-06)", () => {
    // The first cut lifted fields with the cards ("depth is the app's identity"), and the
    // sentence was asserted, not judged: elevation separates a plane from what is BEHIND it,
    // and a field is a well — content of a plane, not a plane above one. A recessed thing
    // cannot cast a drop shadow. Material fields are filled or outlined, never raised; no
    // platform shades an input. The elevated set is actual surfaces only.
    const flat = render(<TextField />);
    expect(computed(flat, "box-shadow")).toBe("none");

    const elevated = mounted(<TextField />, { theme: { surfaces: "elevated" } });
    expect(computed(elevated, "box-shadow")).toBe("none");
    // @ts-expect-error — depth is an app identity; no field chooses a shadow
    void (<TextField shadow="2" />);
  });

  it("material re-derives the seal as glass, with no CSS of its own (§10)", () => {
    const glass = render(<TextField material="regular" />);
    expect(computed(glass, "backdrop-filter")).toContain("blur(16px)");
    // The veil is the field's OWN fill made translucent — the fill-modifier model, reached
    // through the shared control layer without text-field.css naming material once.
    expect(computed(glass, "background-color")).toBe(
      colorOn(glass, "color-mix(in srgb, var(--color-surface) var(--material-regular-alpha), transparent)"),
    );
    expect(computed(glass, "background-color")).not.toMatch(/^rgb\(/);
  });

  it("resolves differently under a dark Theme — both directions of every axis", () => {
    const light = render(<TextField />);
    const dark = mounted(<TextField />, { theme: { appearance: "dark" } });
    expect(computed(dark, "background-color")).not.toBe(computed(light, "background-color"));
    expect(computed(dark, "border-top-color")).not.toBe(computed(light, "border-top-color"));
    // The dark seal and its own surface token, not a light value leaking through a var that
    // resolved where it was declared.
    expect(computed(dark, "background-color")).toBe(colorOn(dark, "var(--color-surface)"));
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
  // recipes.css guarded --kui-border-color and nothing else, while surfaces.css guarded its
  // three equivalents. Material writes --kui-ct-fill/-hover/-active on the element carrying
  // [data-material], custom properties inherit, so a Button in the trailing slot of a glass
  // field computed the identical background as the field itself — at rest, on hover and on
  // press — unblurred, reading as one flat shape rather than a control inside a container.
  it("a Button in a material field does not inherit the field's veil", () => {
    const field = render(<TextField material="regular" trailing={<Button size="1">Show</Button>} />);
    const button = field.querySelector("button")!;
    const bare = render(<Button size="1">Show</Button>);
    expect(computed(button, "background-color")).toBe(computed(bare, "background-color"));
    expect(computed(button, "background-color")).not.toBe(computed(field, "background-color"));
  });

  it("and it does not inherit the blur either — one glass per stack (§10)", () => {
    const field = render(<TextField material="regular" trailing={<Button size="1">Show</Button>} />);
    expect(computed(field.querySelector("button")!, "backdrop-filter")).toBe("none");
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
    const withIcon = render(<TextField leading={<svg />} />);
    const plain = render(<TextField />);
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
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--neutral-6"));
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
  it("hover and press resolve to the resting veil, not to the next alpha up the ramp", () => {
    // The three fill SOURCES were pinned to one colour, and that was still not enough: a fill
    // modifier mixes the source toward transparent on a ramp of its own, so what moved was the
    // mix. In light at `regular` that ramp is 64% -> 72% -> 80% of the same white.
    const glass = render(<TextField material="regular" />);
    const rest = computed(glass, "background-color");
    expect(stateFill(glass, "hover")).toBe(rest);
    expect(stateFill(glass, "active")).toBe(rest);
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
    const glassButton = render(<Button emphasis="medium" material="regular">Save</Button>);
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
    expect(computed(ro, "border-top-color")).not.toBe(tokenOn(ro, "--neutral-6"));
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
