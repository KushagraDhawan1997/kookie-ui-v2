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
import { computed, render } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { TextField } from "./text-field.tsx";

/** Resolve a token the way the component does — through an element in the same scope. */
function tokenOn(el: Element, name: string): string {
  const probe = document.createElement("div");
  probe.style.color = `var(${name})`;
  el.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

/** Resolve any colour expression the way the stylesheet would, in this element's scope. */
function bgOn(el: Element, expr: string): string {
  const probe = document.createElement("div");
  probe.style.backgroundColor = expr;
  el.append(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
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
    const compact = render(
      <Theme density="compact">
        <TextField size="2" />
      </Theme>,
    ).querySelector<HTMLElement>(".kui-field")!;
    expect(computed(compact, "min-height")).toBe("28px");

    const touch = render(
      <Theme pointer="coarse">
        <TextField size="2" />
      </Theme>,
    ).querySelector<HTMLElement>(".kui-field")!;
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

  for (const size of ["1", "2", "3", "4"] as const) {
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
    expect(computed(el, "background-color")).toBe(bgOn(el, "var(--color-surface)"));
    expect(computed(el, "background-color")).not.toContain("rgba");

    // The trap this pins, which no rendered screenshot would catch: the shared layer paints
    // `var(--kui-fill, var(--kui-fill-src))` and swaps to the -hover / -active sources on
    // interaction. A field that declared only the rest source would make that declaration
    // INVALID AT COMPUTED-VALUE TIME the moment a pointer touched it, and background-color
    // would fall back to transparent. So resolve the interaction chains the way the hover and
    // press rules will, and assert they land on the same seal rather than on nothing.
    const rest = computed(el, "background-color");
    expect(bgOn(el, "var(--kui-fill-hover, var(--kui-fill-src-hover))")).toBe(rest);
    expect(bgOn(el, "var(--kui-fill-active, var(--kui-fill-src-active))")).toBe(rest);
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
    // :focus-within, not :focus-visible — you do not press a field, you enter it, and the box
    // has to say where the keystrokes land however you arrived.
    expect(computed(el, "outline-style")).toBe("solid");
    expect(computed(el, "outline-width")).toBe("2px");
    expect(computed(el, "outline-color")).toBe(tokenOn(el, "--focus-ring"));
    // And still exactly one ring: the input never grows a second one inside the first.
    expect(computed(inputOf(el), "outline-style")).toBe("none");
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

describe("the placeholder is a designed role, not a UA default (§7)", () => {
  it("reads the muted role at full opacity", () => {
    const el = render(<TextField placeholder="Search" />);
    const input = inputOf(el);
    expect(onPlaceholder(input, "color")).toBe(tokenOn(el, "--color-text-muted"));
    // Firefox ships 0.54 here, which drops the hint below the contrast the role was chosen to
    // clear. Chrome does not, so this law is about what we DECLARE surviving the cascade.
    expect(onPlaceholder(input, "opacity")).toBe("1");
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
  it("the elevated world lifts it; flat casts nothing", () => {
    const flat = render(<TextField />);
    expect(computed(flat, "box-shadow")).toBe("none");

    const elevated = render(
      <Theme surfaces="elevated">
        <TextField />
      </Theme>,
    ).querySelector<HTMLElement>(".kui-field")!;
    const probe = document.createElement("div");
    probe.style.boxShadow = "var(--surface-chrome)";
    elevated.append(probe);
    expect(computed(elevated, "box-shadow")).toBe(computed(probe, "box-shadow"));
    probe.remove();
    // @ts-expect-error — depth is an app identity; no field chooses a shadow
    void (<TextField shadow="2" />);
  });

  it("material re-derives the seal as glass, with no CSS of its own (§10)", () => {
    const glass = render(<TextField material="regular" />);
    expect(computed(glass, "backdrop-filter")).toContain("blur(16px)");
    // The veil is the field's OWN fill made translucent — the fill-modifier model, reached
    // through the shared control layer without text-field.css naming material once.
    expect(computed(glass, "background-color")).toBe(
      bgOn(glass, "color-mix(in srgb, var(--color-surface) var(--material-regular-alpha), transparent)"),
    );
    expect(computed(glass, "background-color")).not.toMatch(/^rgb\(/);
  });

  it("resolves differently under a dark Theme — both directions of every axis", () => {
    const light = render(<TextField />);
    const dark = render(
      <Theme appearance="dark">
        <TextField />
      </Theme>,
    ).querySelector<HTMLElement>(".kui-field")!;
    expect(computed(dark, "background-color")).not.toBe(computed(light, "background-color"));
    expect(computed(dark, "border-top-color")).not.toBe(computed(light, "border-top-color"));
    // The dark seal and its own surface token, not a light value leaking through a var that
    // resolved where it was declared.
    expect(computed(dark, "background-color")).toBe(bgOn(dark, "var(--color-surface)"));
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
  // three equivalents. Material writes --kui-fill/-hover/-active on the element carrying
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
  const px = (v: string) => parseFloat(v);

  for (const size of ["1", "2", "3", "4"] as const) {
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
    const compact = render(
      <Theme density="compact">
        <TextField size="2" trailing={<Button>Show</Button>} />
      </Theme>,
    );
    const dflt = render(<TextField size="2" trailing={<Button>Show</Button>} />);
    const h = (root: HTMLElement) => px(computed(root.querySelector<HTMLElement>(".kui-button")!, "height"));
    expect(h(compact)).toBeLessThan(h(dflt));
  });
});
