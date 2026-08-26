/**
 * Field's laws, mounted (§28). Written to the 2026-08-03 standard: computed values through a
 * real <Theme>, both appearances where colour is the claim — and, for the size mechanism,
 * measured against a MOUNTED TWIN rather than against a token, because the claim is "the same
 * as a control that stated it itself" and a token comparison is one indirection short of that.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, colorOn, computed, mounted, within } from "../../test/browser.tsx";
import { Checkbox } from "../checkbox/checkbox.tsx";
import { Box } from "../box/box.tsx";
import { Flex } from "../flex/flex.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Radio, RadioGroup } from "../radio/radio.tsx";
import { Field, FieldDescription, FieldError, FieldItem, FieldLabel } from "./field.tsx";

/** The whole unit, in the order §28 argues for. */
const unit = (
  <Field>
    <FieldLabel>Email</FieldLabel>
    <TextField type="email" required />
    <FieldDescription>We use this for receipts.</FieldDescription>
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

describe("label on its control, and everything about it underneath (§28)", () => {
  it("the label sits directly ON the control and the description BELOW it, measured", () => {
    const root = mounted(unit, { theme: {} });
    const label = within(root, "label").getBoundingClientRect();
    const control = within(root, ".kui-field").getBoundingClientRect();
    const description = within(root, "p").getBoundingClientRect();
    // Geometry, not document order: `order` or `column-reverse` would keep the DOM right and
    // put the words in the wrong place, which is the thing the decision is about.
    expect(label.bottom).toBeLessThanOrEqual(control.top);
    expect(control.bottom).toBeLessThanOrEqual(description.top);
  });

  it("the error comes last, so it arrives without moving anything already on screen", () => {
    // THE FIXTURE IS THE LAW (2026-08-26). Both frames used to pass `match={true}`, which
    // renders the message unconditionally — so `before` and `after` were the same DOM, they
    // moved together under any reordering, and the law that exists to protect the ordering
    // decision protected nothing. `before` states no `match`, so a valid field renders no
    // error at all and the two frames genuinely differ by the thing under test.
    const before = mounted(
      <Field>
        <FieldLabel>Account number</FieldLabel>
        <TextField />
        <FieldDescription>Eight digits, no spaces.</FieldDescription>
        <FieldError>That is four digits short.</FieldError>
      </Field>,
      { theme: {} },
    );
    // The SAME field, invalid. The error is rendered by state, so this is the two frames a
    // person actually sees — not two arrangements somebody wrote out by hand.
    const after = mounted(
      <Field>
        <FieldLabel>Account number</FieldLabel>
        <TextField aria-invalid />
        <FieldDescription>Eight digits, no spaces.</FieldDescription>
        <FieldError match={true}>That is four digits short.</FieldError>
      </Field>,
      { theme: {} },
    );
    // Vacuity guard: the frames must differ in exactly the thing the law is about. Without
    // this the pair can go back to being two copies of the same DOM and nothing would say so.
    expect(before.textContent).not.toContain("That is four digits short.");
    expect(after.textContent).toContain("That is four digits short.");
    const error = within(after, "[data-tone='destructive']").getBoundingClientRect();
    const control = within(after, ".kui-field").getBoundingClientRect();
    const description = within(after, "p").getBoundingClientRect();
    expect(description.bottom).toBeLessThanOrEqual(error.top);
    expect(control.bottom).toBeLessThanOrEqual(description.top);
    // The claim the order exists FOR: nothing above the error moved when it appeared. Read as
    // offsets from each field's own root, because the two are mounted at different places.
    const offset = (root: HTMLElement, el: Element) =>
      el.getBoundingClientRect().top - root.getBoundingClientRect().top;
    expect(offset(after, within(after, ".kui-field"))).toBeCloseTo(
      offset(before, within(before, ".kui-field")),
      1,
    );
    expect(offset(after, within(after, "p"))).toBeCloseTo(offset(before, within(before, "p")), 1);
  });
});

describe("an error that ARRIVES is announced, not merely described (§28, §10)", () => {
  /**
   * The forcer that makes `FieldError` a part rather than a `<Text>` a caller writes. Base UI's
   * own `Field.Error` is a plain `<div>` with an id — no role, no `aria-live` — so before
   * 2026-08-26 the only wiring was `aria-describedby`, which speaks when focus next lands on
   * the control and is silent for the ordinary case: validate on blur, and the person is
   * already three fields further down when the message appears.
   */
  it("the error carries a live region, so it speaks when it appears", () => {
    const root = mounted(
      <Field>
        <FieldLabel>Account number</FieldLabel>
        <TextField />
        <FieldError match={true}>That is four digits short.</FieldError>
      </Field>,
      { theme: {} },
    );
    const error = within(root, "[data-tone='destructive']");
    // Read the ANNOUNCEMENT, never the element's presence: an error with no role renders
    // perfectly and says nothing, which is exactly what shipped.
    const role = error.getAttribute("role");
    const live = error.getAttribute("aria-live");
    expect(
      role === "alert" || live === "assertive" || live === "polite",
      `the error node carries no live region (role=${role}, aria-live=${live})`,
    ).toBe(true);
  });

  it("and it is still named in the control's aria-describedby — the role ADDS, it does not replace", () => {
    // The half a role change can silently break. An `alert` that dropped out of the description
    // chain would announce once on arrival and never again, so a person tabbing back into the
    // field would hear the label and nothing about why it is red.
    const root = mounted(
      <Field>
        <FieldLabel>Account number</FieldLabel>
        <TextField />
        <FieldError match={true}>That is four digits short.</FieldError>
      </Field>,
      { theme: {} },
    );
    const error = within(root, "[data-tone='destructive']");
    expect(error.id).toBeTruthy();
    expect(within(root, "input").getAttribute("aria-describedby")?.split(/\s+/)).toContain(
      error.id,
    );
  });

  it("a caller can state a quieter register — the role is written before the spread", () => {
    // The bound. A system default that cannot be overruled is an identity, and this one is a
    // default: an app with its own announcement policy states it at the call site.
    const root = mounted(
      <Field>
        <FieldLabel>Account number</FieldLabel>
        <TextField />
        <FieldError match={true} role="status">
          That is four digits short.
        </FieldError>
      </Field>,
      { theme: {} },
    );
    expect(within(root, "[data-tone='destructive']").getAttribute("role")).toBe("status");
  });
});

describe("the root's `render` escape is real, because a refusal rests on it (§28)", () => {
  /**
   * §28 refuses `orientation` and names this as the answer: "a caller who wants a grid brings
   * one." The type omitted `render`, so the documented escape did not compile and the refusal
   * rested on something nobody could write.
   */
  it("a Field renders into the element a caller brings, and keeps being a field", () => {
    const root = mounted(
      <Field render={<section />}>
        <FieldLabel>Email</FieldLabel>
        <TextField />
      </Field>,
      { theme: {} },
    );
    const group = within(root, ".kui-field-group");
    expect(group.tagName).toBe("SECTION");
    // The escape changes the tag and nothing else: the wiring is what the anatomy is FOR, so a
    // law that only read the tag would pass on a render that dropped the field context.
    expect(within(root, "label").getAttribute("for")).toBe(within(root, "input").id);
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

/**
 * A radio group written the way §28 says to write one: the field names the group, and each
 * option carries its own name and its own line of explanation inside an item.
 *
 * TWO options, and every claim below is made about the SECOND — because one option cannot tell
 * a correctly scoped label from an implementation where every label points at the first
 * control in the field, which is exactly what happens without items.
 */
const group = (
  <Field>
    <FieldLabel>Delivery speed</FieldLabel>
    <RadioGroup defaultValue="standard">
      <FieldItem>
        <Radio value="standard" />
        <FieldLabel>Standard</FieldLabel>
        <FieldDescription>Three to five business days.</FieldDescription>
      </FieldItem>
      <FieldItem>
        <Radio value="express" />
        <FieldLabel>Express</FieldLabel>
        <FieldDescription>Next business day before noon.</FieldDescription>
      </FieldItem>
    </RadioGroup>
  </Field>
);

/** The item holding a given option's mark. */
const itemOf = (root: HTMLElement, name: string) =>
  [...root.querySelectorAll<HTMLElement>(".kui-field-item")].find(
    (el) => el.querySelector("label")?.textContent === name,
  )!;

describe("an item names ONE option, and the scope is the whole point (§28)", () => {
  it("an option's label points at its OWN mark, not at the first one in the field", () => {
    const root = mounted(group, { theme: {} });
    const express = itemOf(root, "Express");
    const label = express.querySelector("label")!;
    const input = express.querySelector("input")!;
    expect(label.getAttribute("for")).toBeTruthy();
    expect(label.getAttribute("for")).toBe(input.id);
    // The failure this is written against: without the item's own naming scope every label in
    // the field resolves to the first control, so read the sibling too and require a DIFFERENCE.
    const standardInput = itemOf(root, "Standard").querySelector("input")!;
    expect(label.getAttribute("for")).not.toBe(standardInput.id);
  });

  it("clicking the second option's name selects the second option", () => {
    const root = mounted(group, { theme: {} });
    itemOf(root, "Express").querySelector("label")!.click();
    const checked = (name: string) =>
      itemOf(root, name).querySelector("[role='radio']")!.getAttribute("aria-checked");
    expect(checked("Express")).toBe("true");
    // Both halves, because "everything points at the first radio" also leaves Standard checked
    // and would satisfy a law that only asked about the one it clicked.
    expect(checked("Standard")).toBe("false");
  });

  it("an option is described by the field's description AND its own, in that order", () => {
    const root = mounted(
      <Field>
        <FieldLabel>Delivery speed</FieldLabel>
        <FieldDescription>Charged at checkout.</FieldDescription>
        <RadioGroup defaultValue="standard">
          <FieldItem>
            <Radio value="standard" />
            <FieldLabel>Standard</FieldLabel>
            <FieldDescription>Three to five business days.</FieldDescription>
          </FieldItem>
        </RadioGroup>
      </Field>,
      { theme: {} },
    );
    const mark = root.querySelector("[role='radio']")!;
    const ids = mark.getAttribute("aria-describedby")?.split(/\s+/) ?? [];
    const idOf = (text: string) =>
      [...root.querySelectorAll("p")].find((el) => el.textContent === text)!.id;
    // Chaining is the claim: an option inherits what the field said and adds what it says.
    expect(ids).toContain(idOf("Charged at checkout."));
    expect(ids).toContain(idOf("Three to five business days."));
    expect(ids.indexOf(idOf("Charged at checkout."))).toBeLessThan(
      ids.indexOf(idOf("Three to five business days.")),
    );
  });

  it("`disabled` on one option stands that option down and leaves its sibling alone", () => {
    const root = mounted(
      <Field>
        <RadioGroup defaultValue="standard">
          <FieldItem>
            <Radio value="standard" />
            <FieldLabel>Standard</FieldLabel>
          </FieldItem>
          <FieldItem disabled>
            <Radio value="express" />
            <FieldLabel>Express</FieldLabel>
          </FieldItem>
        </RadioGroup>
      </Field>,
      { theme: {} },
    );
    expect(itemOf(root, "Express").querySelector("input")!.disabled).toBe(true);
    expect(itemOf(root, "Standard").querySelector("input")!.disabled).toBe(false);
  });

  it("`disabled` on the Field reaches every option — a dead field is dead throughout", () => {
    const root = mounted(
      <Field disabled>
        <RadioGroup defaultValue="standard">
          <FieldItem>
            <Radio value="standard" />
            <FieldLabel>Standard</FieldLabel>
          </FieldItem>
          <FieldItem>
            <Radio value="express" />
            <FieldLabel>Express</FieldLabel>
          </FieldItem>
        </RadioGroup>
      </Field>,
      { theme: {} },
    );
    for (const name of ["Standard", "Express"]) {
      expect(itemOf(root, name).querySelector("input")!.disabled).toBe(true);
    }
  });
});

describe("the item's grid: the explanation belongs to the WORDS (§28)", () => {
  it("the mark is beside its name, and the explanation is under the name rather than the mark", () => {
    const root = mounted(group, { theme: {} });
    const item = itemOf(root, "Express");
    const mark = item.querySelector(".kui-control")!.getBoundingClientRect();
    const label = item.querySelector("label")!.getBoundingClientRect();
    const description = item.querySelector("p")!.getBoundingClientRect();
    expect(mark.right).toBeLessThanOrEqual(label.left);
    expect(label.bottom).toBeLessThanOrEqual(description.top);
    // The load-bearing half. A one-column stack, or the explanation auto-placed into the mark's
    // column, both satisfy "below the label" — only the left edges tell them apart.
    expect(description.left).toBeCloseTo(label.left, 1);
    expect(description.left).toBeGreaterThan(mark.right);
  });

  it("a mark lands on the first line of its name, because a mark IS a line box (§4)", () => {
    const root = mounted(group, { theme: {} });
    const item = itemOf(root, "Express");
    const mark = item.querySelector(".kui-control")!.getBoundingClientRect();
    const label = item.querySelector("label")!.getBoundingClientRect();
    expect(mark.top).toBeCloseTo(label.top, 1);
    expect(mark.height).toBeCloseTo(label.height, 1);
  });

  it("an item spans the field, so a long explanation wraps at the field's width", () => {
    // A plain block of a KNOWN width, never a Flex: as a flex ITEM the field shrink-wraps too,
    // so both sides of the comparison collapse together and the law passes on the broken
    // spelling. That fixture was written first and its sabotage pass caught it.
    const root = mounted(
      <Box style={{ inlineSize: "420px" }}>
        <Field>
          <FieldLabel>Delivery speed</FieldLabel>
          <RadioGroup defaultValue="standard">
            <FieldItem>
              <Radio value="standard" />
              <FieldLabel>Standard</FieldLabel>
              <FieldDescription>Three to five days.</FieldDescription>
            </FieldItem>
          </RadioGroup>
        </Field>
      </Box>,
      { theme: {} },
    );
    const field = within(root, ".kui-field-group").getBoundingClientRect();
    // Vacuity guard: the claim only means something while the field is wider than the words.
    expect(field.width).toBeCloseTo(420, 0);
    const item = within(root, ".kui-field-item").getBoundingClientRect();
    // The pre-fix failure: `align-items: flex-start` on the column reached the control by class
    // and reached NOTHING through a group primitive, so the item shrink-wrapped its own words.
    expect(item.width).toBeCloseTo(field.width, 1);
  });

  it("an item's own rows are tighter than the gaps between items — a nested group steps down", () => {
    const root = mounted(group, { theme: {} });
    const inner = Number.parseFloat(computed(within(root, ".kui-field-item"), "row-gap"));
    const outer = Number.parseFloat(computed(within(root, ".kui-field-group"), "row-gap"));
    expect(inner).toBeGreaterThan(0);
    expect(inner).toBeLessThan(outer);
  });

  it("a name inside an item is not a click target across the whole column", () => {
    const root = mounted(group, { theme: {} });
    const item = itemOf(root, "Express");
    const label = item.querySelector("label")!.getBoundingClientRect();
    const description = item.querySelector("p")!.getBoundingClientRect();
    // Against the DESCRIPTION, which does fill the column, and never against the item: the
    // mark's own column makes the label narrower than the item whether it stretches or not,
    // so that comparison passes with the rule deleted. Its sabotage pass caught it.
    expect(label.right).toBeLessThan(description.right);
    expect(description.width).toBeGreaterThan(label.width);
  });
});
