/**
 * Field's laws, mounted (§28). Written to the 2026-08-03 standard: computed values through a
 * real <Theme>, both appearances where colour is the claim — and, for the size mechanism,
 * measured against a MOUNTED TWIN rather than against a token, because the claim is "the same
 * as a control that stated it itself" and a token comparison is one indirection short of that.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, colorOn, computed, mounted, within } from "../../test/browser.tsx";
import { Checkbox } from "../checkbox/checkbox.tsx";
import { Flex } from "../flex/flex.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field.tsx";

/** The whole unit, in the order §28 argues for. */
const unit = (
  <Field>
    <FieldLabel>Email</FieldLabel>
    <FieldDescription>We use this for receipts.</FieldDescription>
    <TextField type="email" required />
    <FieldError>Enter an email address.</FieldError>
  </Field>
);

describe("the wiring is the whole licence for the anatomy (§28, §10)", () => {
  it("the label points at the control, and the control has the id it points at", () => {
    const root = mounted(unit, { theme: {} });
    const label = within(root, "label");
    const input = within(root, "input");
    // Read the RELATIONSHIP, not the presence of a <label>: a label with no `for` and an input
    // with no id both render perfectly and announce nothing.
    expect(label.getAttribute("for")).toBeTruthy();
    expect(label.getAttribute("for")).toBe(input.id);
  });

  it("clicking the label lands the caret — the association is live, not merely declared", () => {
    const root = mounted(unit, { theme: {} });
    within(root, "label").click();
    expect(document.activeElement).toBe(within(root, "input"));
  });

  it("the description is named in the control's aria-describedby", () => {
    const root = mounted(unit, { theme: {} });
    const input = within(root, "input");
    const description = within(root, "p");
    expect(description.id).toBeTruthy();
    expect(input.getAttribute("aria-describedby")?.split(/\s+/)).toContain(description.id);
  });

  it("a valid field renders no error at all — the message is state, never a slot", () => {
    const root = mounted(unit, { theme: {} });
    // The message exists in the markup above and must NOT be in the document, because Base UI
    // renders it only while the field is invalid. A law asserting its COLOUR would pass on an
    // implementation that always shows it.
    expect(root.textContent).not.toContain("Enter an email address.");
  });

  it("a `disabled` Field reaches the control — our wrapper passes the state, not just the box", () => {
    const root = mounted(
      <Field disabled>
        <FieldLabel>Email</FieldLabel>
        <TextField />
      </Field>,
      { theme: {} },
    );
    expect((within(root, "input") as HTMLInputElement).disabled).toBe(true);
  });
});

describe("description above, error below — instruction before the act, diagnosis after (§28, §29)", () => {
  it("the description sits ABOVE the control and the label above that, measured", () => {
    const root = mounted(unit, { theme: {} });
    const label = within(root, "label").getBoundingClientRect();
    const description = within(root, "p").getBoundingClientRect();
    const control = within(root, ".kui-field").getBoundingClientRect();
    // Geometry, not document order: `order` or `column-reverse` would keep the DOM right and
    // put the words in the wrong place, which is the thing the decision is about.
    expect(label.bottom).toBeLessThanOrEqual(description.top);
    expect(description.bottom).toBeLessThanOrEqual(control.top);
  });

  it("the error sits BELOW the control once the field is invalid", () => {
    const root = mounted(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <TextField aria-invalid />
        <FieldError match={true}>Enter an email address.</FieldError>
      </Field>,
      { theme: {} },
    );
    const control = within(root, ".kui-field").getBoundingClientRect();
    const error = within(root, "[data-tone='destructive']").getBoundingClientRect();
    expect(error.top).toBeGreaterThanOrEqual(control.bottom);
  });
});

describe("the field prices the whole unit, and an explicit prop still wins (§28)", () => {
  /** A control's own box, standalone at a stated index — the thing every claim here is against. */
  const twin = (size: "1" | "2" | "3" | "4") =>
    computed(mounted(<TextField size={size} />, { theme: {}, select: ".kui-field" }), "height");

  it("an unstated control takes the field's index", () => {
    const el = mounted(
      <Field size="4">
        <FieldLabel>Email</FieldLabel>
        <TextField />
      </Field>,
      { theme: {}, select: ".kui-field" },
    );
    expect(computed(el, "height")).toBe(twin("4"));
    // The negative control: if the supply were dead, this would be the family's own rest.
    expect(computed(el, "height")).not.toBe(twin("2"));
  });

  it("a control that states its own index keeps it", () => {
    const el = mounted(
      <Field size="4">
        <FieldLabel>Email</FieldLabel>
        <TextField size="1" />
      </Field>,
      { theme: {}, select: ".kui-field" },
    );
    expect(computed(el, "height")).toBe(twin("1"));
  });

  it("the supply reaches a MARK too, not only the box family", () => {
    const el = mounted(
      <Field size="4">
        <FieldLabel>Subscribe</FieldLabel>
        <Checkbox />
      </Field>,
      { theme: {}, select: ".kui-mark" },
    );
    const solo = mounted(<Checkbox size="4" />, { theme: {}, select: ".kui-mark" });
    expect(computed(el, "width")).toBe(computed(solo, "width"));
  });

  it("nothing but a Field supplies it — a control outside one rests at the family's own 2", () => {
    // The bound that makes the mechanism safe (control-size.ts): Theme does not provide it, a
    // Box does not, a surface does not. If any of them ever did, this is what would fail.
    //
    // Both subjects are mounted in ONE tree rather than compared against `twin`, because the
    // axes here are deliberately hostile and a twin under the default theme is a different
    // cell: the first spelling read 28px against 32px and was measuring compact-versus-default,
    // not supplied-versus-unsupplied. A law's two sides must differ in the ONE thing it is about.
    const root = mounted(
      <Flex>
        <TextField />
        <TextField size="2" />
      </Flex>,
      { theme: { appearance: "dark", density: "compact" } },
    );
    const [free, stated] = [...root.querySelectorAll<HTMLElement>(".kui-field")];
    expect(free && stated).toBeTruthy();
    expect(computed(free!, "height")).toBe(computed(stated!, "height"));
  });

  it("the label is set in the step the control's own value is set in — an identity, not a map", () => {
    const root = mounted(
      <Field size="3">
        <FieldLabel>Email</FieldLabel>
        <TextField />
      </Field>,
      { theme: {} },
    );
    // §28's derivation: the control size join is `--kui-ct-font: var(--font-size-N)`, so the
    // field's label needs no designed set of its own. Read against the CONTROL, never a number.
    expect(computed(within(root, "label"), "font-size")).toBe(
      computed(within(root, ".kui-field"), "font-size"),
    );
  });
});

describe("the parts read as type, and the roles are the ones §15 already designed", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: label plain, description muted — and they differ`, () => {
      const root = mounted(unit, { theme: { appearance } });
      const label = within(root, "label");
      const description = within(root, "p");
      expect(computed(label, "color")).toBe(colorOn(label, "var(--color-text)"));
      expect(computed(description, "color")).toBe(colorOn(description, "var(--color-text-muted)"));
      // Vacuity guard: if the two roles ever resolved one colour, both assertions above would
      // still hold and the hierarchy would be gone.
      expect(computed(label, "color")).not.toBe(computed(description, "color"));
    });

    it(`${appearance}: the error carries the destructive family's ink`, () => {
      const root = mounted(
        <Field>
          <FieldLabel>Email</FieldLabel>
          <TextField aria-invalid />
          <FieldError match={true}>Enter an email address.</FieldError>
        </Field>,
        { theme: { appearance } },
      );
      const error = within(root, "[data-tone='destructive']");
      expect(computed(error, "color")).toBe(colorOn(error, "var(--destructive-ink)"));
      // The vacuity guard is against the LABEL, not against `var(--color-text)` resolved here.
      // That was the first spelling and it can never fail: a stamped tone RE-SCOPES the
      // tone-less role names onto the family's ink trio (§15), so inside this element
      // `--color-text` IS the destructive ink and the guard was comparing a value with itself.
      expect(computed(error, "color")).not.toBe(computed(within(root, "label"), "color"));
    });
  }
});

describe("the column is the whole stylesheet (§28)", () => {
  it("the control spans the field and the label does not — the one rule field.css owns", () => {
    const root = mounted(unit, { theme: {} });
    const group = root.getBoundingClientRect();
    const control = within(root, ".kui-field").getBoundingClientRect();
    const label = within(root, "label").getBoundingClientRect();
    expect(control.width).toBeCloseTo(group.width, 1);
    // A stretched label would make a hit target of the empty room beside the words.
    expect(label.width).toBeLessThan(group.width);
  });

  it("outer spacing is nobody's but the caller's (the non-negotiable)", () => {
    const root = mounted(unit, { theme: {} });
    expect(computed(root, "margin-top")).toBe("0px");
    expect(computed(root, "margin-bottom")).toBe("0px");
  });
});
