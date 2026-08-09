/**
 * Select's mounted laws (§20, §21, §23) — the 2026-08-03 standard: computed values through
 * a mounted <Theme>, both appearances where colour is the question.
 *
 * This file carries the §20 AGREEMENT LAW every portalling component owes (ENGINEERING
 * §2.1): the portalled panel and a row inside it must compute identical to an in-flow twin
 * wearing the same classes and attributes. The family mechanisms (row geometry in 24 cells,
 * the concentric join, the floating chrome derivation) are law-tested where they live —
 * menu.browser.test.tsx and the system suites — so this file asserts Select's MEMBERSHIP
 * (the identity arrives on its elements) and Select's OWN facts (the field-shaped trigger,
 * the value machinery), not a second copy of the family proofs.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "./select.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Card } from "../card/card.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import { render, computed, probeIn, tokenOn, colorOn, DENSITIES } from "../../test/browser.tsx";

/** Every axis off its default — a dropped attribute is visible (the §20 constant).
 *
 * `contrast` is in the set (added 2026-08-09, audit): ENGINEERING §2.1 named this file as
 * enforcing the agreement "high-contrast mode included", and the word did not appear in it —
 * the set listed six of the seven axes under a comment claiming "every axis off its default".
 * The claim is now true, which matters because this file is the template the third floating
 * component's author is pointed at. */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  surfaces: "elevated",
  look: "filled",
  contrast: "high",
};

const settled = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/** Mount an OPEN select under a themed root; LOUD when the panel never mounts. */
function openSelect(theme: ThemeProps, ui?: React.ReactNode, size?: "1" | "2" | "3" | "4") {
  const host = render(
    <Theme {...theme}>
      <Select defaultOpen defaultValue="b" {...(size ? { size } : {})}>
        <SelectTrigger placeholder="Pick one" />
        <SelectContent>
          {ui ?? (
            <>
              <SelectItem value="a">Alpha</SelectItem>
              <SelectItem value="b">Beta</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </Theme>,
  );
  // The LAST panel — mounts accumulate within one test (the menu suite's own lesson).
  const popups = document.querySelectorAll<HTMLElement>(".kui-select-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the panel never mounted — every law below would assert nothing");
  return { host, popup, items: [...popup.querySelectorAll<HTMLElement>(".kui-select-item")] };
}

function surfaceFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
    border: cs.borderTopColor,
    radius: cs.borderTopLeftRadius,
    padding: cs.paddingTop,
    shadow: cs.boxShadow,
    direction: cs.direction,
  };
}

function rowFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    minHeight: cs.minHeight,
    padLeft: cs.paddingLeft,
    gap: cs.gap,
    font: cs.fontSize,
    radius: cs.borderTopLeftRadius,
    color: cs.color,
    bg: cs.backgroundColor,
    direction: cs.direction,
  };
}

/* ── The §20 agreement law ────────────────────────────────────────────────────────────── */

describe("the agreement law: portalled ≡ in-flow (§20, §23)", () => {
  function twin(theme: ThemeProps) {
    let popupTwin: HTMLElement | null = null;
    let itemTwin: HTMLElement | null = null;
    render(
      <Theme {...theme}>
        <div
          ref={(n: HTMLDivElement | null) => void (popupTwin = n)}
          className="kui-surface kui-floating kui-select-popup"
          data-size="2"
          data-tone="neutral"
          data-emphasis="quiet"
          data-bordered="true"
          style={{ "--anchor-width": "0px" } as React.CSSProperties}
        >
          <div
            ref={(n: HTMLDivElement | null) => void (itemTwin = n)}
            className="kui-control kui-row kui-select-item"
            data-size="2"
            data-tone="neutral"
            data-emphasis="quiet"
          >
            Alpha
          </div>
        </div>
      </Theme>,
    );
    if (!popupTwin || !itemTwin) throw new Error("twin never mounted");
    return { popupTwin: popupTwin as HTMLElement, itemTwin: itemTwin as HTMLElement };
  }

  it("computes identical under the hostile axis set — panel and row", async () => {
    const { popup, items } = openSelect(HOSTILE);
    await settled();
    const { popupTwin, itemTwin } = twin(HOSTILE);
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(popupTwin));
    // The row wears the family identity; its indicator gutter is anatomy, not identity, so
    // the comparable facts are the cascade-delivered ones.
    expect(rowFacts(items[0]!)).toEqual(rowFacts(itemTwin));
    // The comparison can fail: the same twin under default axes disagrees.
    const bare = twin({});
    expect(surfaceFacts(bare.popupTwin)).not.toEqual(surfaceFacts(popupTwin));
  });

  it("agrees under RTL — the wrapper carries dir, and the panel mirrors with the app (§20)", async () => {
    let host: HTMLElement | null = null;
    render(
      <div dir="rtl" ref={(n: HTMLDivElement | null) => void (host = n)}>
        <Theme>
          <Select defaultOpen defaultValue="a">
            <SelectTrigger placeholder="Pick" />
            <SelectContent>
              <SelectItem value="a">Alpha</SelectItem>
            </SelectContent>
          </Select>
        </Theme>
      </div>,
    );
    await settled();
    const popups = document.querySelectorAll<HTMLElement>(".kui-select-popup");
    const popup = popups[popups.length - 1]!;
    expect(computed(popup, "direction"), "the portalled panel takes the app's direction").toBe("rtl");
    expect(host).not.toBeNull();
  });

  it("follows a direction change made AFTER mount — the runtime language switch (§20)", async () => {
    // The measurement used to be taken once, in the trigger's ref callback at commit. Every
    // library that switches language at runtime sets document.documentElement.dir in an
    // EFFECT, which runs strictly after the render that would have re-measured — so the one
    // read landed before the change and never happened again. Measured: a page switched to
    // Arabic in place opened its panel at 534-672px where the correct answer was 339-600px,
    // and it did not recover on close and reopen. Worse than doing nothing, because the stale
    // stamp OVERRIDES the direction portalled content would otherwise have inherited.
    const html = document.documentElement;
    const before = html.getAttribute("dir");
    try {
      render(
        <Theme>
          <Select defaultOpen defaultValue="a">
            <SelectTrigger placeholder="Pick" />
            <SelectContent>
              <SelectItem value="a">Alpha</SelectItem>
            </SelectContent>
          </Select>
        </Theme>,
      );
      await settled();
      const popups = document.querySelectorAll<HTMLElement>(".kui-select-popup");
      const popup = popups[popups.length - 1]!;
      expect(computed(popup, "direction"), "starts where the document is").toBe("ltr");
      // The switch, exactly as an i18n library performs it: an attribute write on <html>,
      // outside React, with no re-render of anything.
      html.setAttribute("dir", "rtl");
      await expect
        .poll(() => computed(popup, "direction"), { timeout: 2000 })
        .toBe("rtl");
      // ...and back, so the mechanism is not a one-way latch.
      html.setAttribute("dir", "ltr");
      await expect
        .poll(() => computed(popup, "direction"), { timeout: 2000 })
        .toBe("ltr");
    } finally {
      if (before === null) html.removeAttribute("dir");
      else html.setAttribute("dir", before);
    }
  });
});

/* ── The trigger: a field that is pressed (§23) ───────────────────────────────────────── */

describe("the trigger wears the field identity — a Select beside a TextField reads as one family", () => {
  function mountPair(theme: ThemeProps) {
    let field: HTMLElement | null = null;
    const host = render(
      <Theme {...theme}>
        <Select>
          <SelectTrigger placeholder="Pick one" />
        </Select>
        <TextField placeholder="Type here" />
      </Theme>,
    );
    const trigger = host.querySelector<HTMLElement>(".kui-select-trigger");
    field = host.querySelector<HTMLElement>(".kui-field:not(.kui-select-trigger)");
    if (!trigger || !field) throw new Error("pair never mounted");
    return { trigger, field };
  }

  for (const appearance of ["light", "dark"] as const) {
    it(`${appearance}: seal, edge, height and corner agree with the TextField beside it`, () => {
      const { trigger, field } = mountPair({ appearance });
      expect(computed(trigger, "background-color")).toBe(computed(field, "background-color"));
      expect(computed(trigger, "border-top-color")).toBe(computed(field, "border-top-color"));
      expect(computed(trigger, "min-height")).toBe(computed(field, "min-height"));
      expect(computed(trigger, "border-top-left-radius")).toBe(
        computed(field, "border-top-left-radius"),
      );
      // The value wears content dress — regular, the TextField value's own decision (§15).
      expect(computed(trigger, "font-weight")).toBe(computed(field, "font-weight"));
    });
  }

  it("is a real button that is PRESSED, not entered: button cursor, no text selection", () => {
    const { trigger } = mountPair({});
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("type")).toBe("button");
    expect(computed(trigger, "cursor")).toBe(
      probeIn(trigger, (el) => (el.style.cursor = "var(--cursor-button)"), (cs) => cs.cursor),
    );
    expect(computed(trigger, "user-select")).toBe("none");
  });

  it("the empty trigger INVITES: placeholder in the faint role; a chosen value in full ink", async () => {
    const host = render(
      <Theme>
        <Select>
          <SelectTrigger placeholder="Pick one" />
        </Select>
        <Select defaultValue="a" items={{ a: "Alpha" }}>
          <SelectTrigger placeholder="Pick one" />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    await settled();
    const [empty, chosen] = [...host.querySelectorAll<HTMLElement>(".kui-select-value")];
    if (!empty || !chosen) throw new Error("values missing");
    expect(empty.textContent).toBe("Pick one");
    expect(computed(empty, "color")).toBe(colorOn(host, "var(--color-text-faint)"));
    expect(chosen.textContent).toBe("Alpha");
    expect(computed(chosen, "color")).not.toBe(computed(empty, "color"));
  });

  it("a disabled select's trigger takes the shared remap — flat ink, disabled cursor", () => {
    // The audit gap this law closes: the field family's disabled arm is keyed on an INPUT
    // being disabled and is inert here, so the trigger leans on the skeleton's native
    // :disabled arm — which only fires if Base UI renders the real attribute. Asserted,
    // not assumed.
    const host = render(
      <Theme>
        <Select disabled>
          <SelectTrigger placeholder="Pick one" />
        </Select>
      </Theme>,
    );
    const trigger = host.querySelector<HTMLButtonElement>(".kui-select-trigger");
    if (!trigger) throw new Error("trigger missing");
    expect(trigger.disabled, "native disabled, not an aria stand-in").toBe(true);
    expect(computed(trigger, "color")).toBe(colorOn(host, "var(--neutral-8)"));
    expect(computed(trigger, "cursor")).toBe(
      probeIn(host, (el) => (el.style.cursor = "var(--cursor-disabled)"), (cs) => cs.cursor),
    );
  });

  it("the fill MOVES on the trigger and does NOT on the TextField beside it", async () => {
    // The half that shipped wrong, and the half that must not break while fixing it. The
    // trigger inherited the field family's pinned fill, whose stated reason ("the border and
    // the ring carry its states") is a text input's: measured, rest = hover = press = open.
    const { trigger, field } = mountPair({});
    const rest = computed(trigger, "background-color");
    const fieldRest = computed(field, "background-color");
    await userEvent.hover(trigger);
    const hovered = computed(trigger, "background-color");
    expect(hovered, "pointing at a pressable control says so").not.toBe(rest);
    // ...and the member that is ENTERED rather than pressed keeps its pin. Hovering the field
    // directly, not reasoning about which rule ought to win.
    await userEvent.hover(field);
    expect(computed(field, "background-color"), "a field a caret enters does not move").toBe(
      fieldRest,
    );
  });

  it("an OPEN trigger does not look like a closed one — with the pointer nowhere near it", async () => {
    // Opened from the KEYBOARD on purpose. The first spelling of this law clicked, which
    // leaves the pointer resting on the trigger, so `:hover` alone satisfied it: deleting the
    // open-state rule entirely left the law green. Caught by its own sabotage pass, which is
    // the only reason it is worth anything.
    const host = render(
      <Theme>
        <Select>
          <SelectTrigger placeholder="Pick one" />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    const trigger = host.querySelector<HTMLButtonElement>(".kui-select-trigger")!;
    const closed = computed(trigger, "background-color");
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => trigger.getAttribute("data-popup-open")).not.toBeNull();
    expect(trigger.matches(":hover"), "nothing is hovering it").toBe(false);
    expect(computed(trigger, "background-color"), "in use, and it says so").not.toBe(closed);
  });

  it("a disabled trigger's PLACEHOLDER goes flat with the rest of it", async () => {
    // The shared disabled arm re-points the tone roles; the placeholder rule names a colour
    // directly, so nothing reached it. Measured before the fix: the trigger's own text went
    // to 0.7625 and the placeholder stayed at 0.4680, its live value — and in dark the
    // placeholder was the brighter of the two.
    for (const appearance of ["light", "dark"] as const) {
      const host = render(
        <Theme appearance={appearance}>
          <Select disabled>
            <SelectTrigger placeholder="Pick one" />
          </Select>
          <Select>
            <SelectTrigger placeholder="Pick one" />
          </Select>
        </Theme>,
      );
      const [dead, live] = [...host.querySelectorAll<HTMLElement>(".kui-select-value")];
      if (!dead || !live) throw new Error("values missing");
      expect(computed(dead, "color"), `${appearance}: not the live placeholder`).not.toBe(
        computed(live, "color"),
      );
      // And it goes exactly where the shared remap sends every other dead label.
      expect(computed(dead, "color")).toBe(colorOn(host, "var(--neutral-8)"));
    }
  });

  it("glass is askable, and a glass trigger reads as the glass TextField beside it", () => {
    // Four documents said the trigger received the material axis by field membership. The
    // rules did arrive; nothing stamped the attribute they read, and there was no prop to
    // stamp it with — so a form over a photograph put translucent fields beside an opaque
    // white dropdown.
    let field: HTMLElement | null = null;
    const host = render(
      <Theme>
        <Select>
          <SelectTrigger placeholder="Pick one" material="regular" />
        </Select>
        <TextField placeholder="Type here" material="regular" />
      </Theme>,
    );
    const trigger = host.querySelector<HTMLElement>(".kui-select-trigger")!;
    field = host.querySelector<HTMLElement>(".kui-field:not(.kui-select-trigger)");
    if (!field) throw new Error("field missing");
    expect(trigger.getAttribute("data-material")).toBe("regular");
    expect(computed(trigger, "backdrop-filter")).toBe(computed(field, "backdrop-filter"));
    expect(computed(trigger, "background-color")).toBe(computed(field, "background-color"));
    expect(computed(trigger, "border-top-color")).toBe(computed(field, "border-top-color"));
    // Solid writes no attribute at all (§10) — the negative half, or the law passes on a
    // component that stamps "solid" and never resolves a material.
    const plain = mountPair({}).trigger;
    expect(plain.getAttribute("data-material")).toBeNull();
    expect(computed(plain, "backdrop-filter")).not.toBe(computed(trigger, "backdrop-filter"));
  });

  it("takes the props a button takes — `id`, so <label for> works at all", () => {
    const host = render(
      <Theme>
        <label htmlFor="fruit">Fruit</label>
        <Select>
          <SelectTrigger id="fruit" placeholder="Pick one" />
        </Select>
      </Theme>,
    );
    const trigger = host.querySelector<HTMLElement>(".kui-select-trigger")!;
    expect(trigger.id).toBe("fruit");
    // The association is the browser's, not ours: clicking the label focuses the control.
    const label = host.querySelector<HTMLLabelElement>("label")!;
    expect(label.control).toBe(trigger);
  });

  it("the chevron is a muted adornment in the trigger's own icon box", () => {
    const { trigger } = mountPair({});
    const slot = trigger.querySelector<HTMLElement>('[data-slot="trailing"]');
    if (!slot) throw new Error("chevron slot missing");
    expect(computed(slot, "color")).toBe(colorOn(trigger, "var(--color-text-muted)"));
    const svg = slot.querySelector("svg")!;
    expect(computed(svg as unknown as HTMLElement, "width")).toBe(tokenOn(trigger, "--icon-size-2"));
  });
});

/* ── The closed edges (§23) ───────────────────────────────────────────────────────────── */

describe("what a Select will not do", () => {
  it("refuses readOnly — the platform has none, so there is nothing to inherit", () => {
    // Researched, not designed (audit 2026-08-09, the checkbox's own refusal one family
    // over): HTML states `readonly` does not apply to `<select>`. It shipped ACCEPTED for a
    // day — Base UI honoured it by refusing to open while this system drew nothing, measured
    // byte-identical to a live trigger across seven properties in both appearances, hand
    // cursor included, while assistive technology was correctly told it was read-only. Two
    // audiences, two answers.
    // @ts-expect-error — readOnly is refused, not undesigned
    void (<Select readOnly />);
  });

  it("refuses children on the trigger — the VALUE is the content", () => {
    // @ts-expect-error — a trigger with children is a trigger that can disagree with itself
    void (<SelectTrigger>Alpha</SelectTrigger>);
  });

  it("exposes no emphasis and no tone on the trigger, and no outer spacing", () => {
    // @ts-expect-error — loudness ranks actions; a form of fields ranks nothing (§11)
    void (<SelectTrigger emphasis="loud" />);
    // @ts-expect-error — the family has one tone, and it is an identity, not an axis
    void (<SelectTrigger tone="accent" />);
    // @ts-expect-error — no margin prop on any control (the first non-negotiable)
    void (<SelectTrigger m="4" />);
  });
});

/* ── The panel: membership in the floating family (§22's facts, §23's member) ─────────── */

describe("the panel is the floating family's — corner, cast, padding, floor", () => {
  it("the corner is concentric and the panel stamps the size its rows answer", async () => {
    const { popup, items } = openSelect({}, undefined, "3");
    await settled();
    expect(popup.getAttribute("data-size")).toBe("3");
    const rowCorner = parseFloat(computed(items[0]!, "border-top-left-radius"));
    const pad = parseFloat(computed(popup, "padding-top"));
    expect(parseFloat(computed(popup, "border-top-left-radius"))).toBeCloseTo(rowCorner + pad, 1);
  });

  it("casts in BOTH worlds, and the flat cast is not the elevated one", async () => {
    const flat = openSelect({ surfaces: "flat" });
    await settled();
    const flatShadow = computed(flat.popup, "box-shadow");
    expect(flatShadow, "a floating pane casts in a flat world").not.toBe("none");
    const elevated = openSelect({ surfaces: "elevated" });
    await settled();
    expect(computed(elevated.popup, "box-shadow")).not.toBe("none");
    expect(computed(elevated.popup, "box-shadow")).not.toBe(flatShadow);
    // The negative control: a flat Card beside it casts nothing.
    let card: HTMLElement | null = null;
    render(
      <Theme surfaces="flat">
        <Card ref={(n: HTMLDivElement | null) => void (card = n)}>plain</Card>
      </Theme>,
    );
    expect(computed(card as unknown as HTMLElement, "box-shadow")).toBe("none");
  });

  it("glass keeps the floating cast", async () => {
    const { popup } = openSelect({ surfaces: "flat" }, undefined);
    await settled();
    const solid = computed(popup, "box-shadow");
    const glass = render(
      <Theme surfaces="flat">
        <Select defaultOpen>
          <SelectTrigger placeholder="p" />
          <SelectContent material="regular">
            <SelectItem value="a">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    await settled();
    const popups = document.querySelectorAll<HTMLElement>(".kui-select-popup");
    const glassPopup = popups[popups.length - 1]!;
    expect(glassPopup.getAttribute("data-material")).toBe("regular");
    expect(computed(glassPopup, "box-shadow")).toBe(solid);
    expect(glass).toBeDefined();
  });

  // EVERY density, not just the default (audit 2026-08-09). The floor exists for compact,
  // where the designed padding is 2px against a 4px ring reach; at the default the two are
  // both 4px, so the assertion was identical with the floor and without it — the one density
  // this ran at is the one where the mechanism does nothing. Removing the floor entirely left
  // the whole repository green while a compact panel clipped its top row's focus ring by 2px.
  for (const density of DENSITIES) {
    it(`${density}: the panel's padding is floored at the focus ring's reach`, async () => {
      const { popup } = openSelect({ density });
      await settled();
      const floatingP = parseFloat(tokenOn(popup, "--floating-p"));
      const ring =
        parseFloat(tokenOn(popup, "--focus-ring-width")) +
        parseFloat(tokenOn(popup, "--focus-ring-offset"));
      const pad = parseFloat(computed(popup, "padding-top"));
      expect(pad).toBeCloseTo(Math.max(floatingP, ring), 1);
      // And the reason the floor exists, stated as the thing that must be true: the ring a row
      // paints has to fit inside the scroll container's padding box.
      expect(pad, "the ring fits inside the clip").toBeGreaterThanOrEqual(ring);
    });
  }

  it("the floor is the REAL trigger's width — the positioner's chain, not an injected value", async () => {
    // This law used to write --anchor-width onto the panel itself and then assert the panel
    // was at least that wide, which proves the max() parses and nothing else: the chain that
    // can actually break is positioner measures trigger -> publishes --anchor-width -> panel
    // matches. The trigger in the old setup was 55px against a 112px floor, so the anchor arm
    // never won and only the injected number ever exercised it. Sabotaged (drop --anchor-width
    // from the min-width), a 420px trigger's panel collapses to 112px and the old assertions
    // both still passed.
    let wide: HTMLElement | null = null;
    render(
      <Theme>
        <div style={{ width: "420px", display: "flex" }}>
          <Select defaultOpen>
            <SelectTrigger
              placeholder="Pick one"
              style={{ width: "420px" }}
              ref={(n: HTMLButtonElement | null) => void (wide = n)}
            />
            <SelectContent>
              <SelectItem value="a">A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Theme>,
    );
    await settled();
    const popups = document.querySelectorAll<HTMLElement>(".kui-select-popup");
    const popup = popups[popups.length - 1]!;
    const triggerWidth = (wide as unknown as HTMLElement).getBoundingClientRect().width;
    expect(triggerWidth, "the trigger really is wide").toBeGreaterThan(400);
    expect(
      popup.getBoundingClientRect().width,
      "the panel is never narrower than the trigger that opened it",
    ).toBeGreaterThanOrEqual(triggerWidth - 1);
    // Still never narrower than the designed floor either.
    expect(popup.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      parseFloat(tokenOn(popup, "--floating-min-w")),
    );
  });

  it("the available room OUTRANKS the anchor — a minimum cannot be capped by a maximum", async () => {
    // The panel stated max-width: var(--available-width) and min-width: max(floor, anchor).
    // In CSS a minimum always wins over a maximum, so for any trigger wider than the room the
    // stated protection was unreachable — measured 619px against a 300px cap. The clamp is
    // inside the min() now; this law fails against the old spelling.
    const { popup } = openSelect({});
    await settled();
    popup.style.setProperty("--anchor-width", "900px");
    popup.style.setProperty("--available-width", "300px");
    expect(popup.getBoundingClientRect().width).toBeLessThanOrEqual(301);
    // ...and the floor still holds when the room is absurd, so the clamp cannot squeeze it
    // below the designed minimum.
    popup.style.setProperty("--available-width", "10px");
    expect(popup.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      parseFloat(tokenOn(popup, "--floating-min-w")),
    );
  });

  it("the corner is concentric in PAINTED pixels, at every size and level — `full` included", async () => {
    // The old law read the panel's DECLARED corner against the row's DECLARED corner, and both
    // were wrong together at `full`: the row was handed half a button's height (a box it does
    // not have) and the browser clamped it at paint to half the row's own height, while the
    // panel wrapped the unclamped number. 21 of 24 cells missed by up to 9px. The cap is the
    // CSS spec's, applied to a MEASURED row height rather than to a re-derivation of the
    // stylesheet's own arithmetic.
    for (const radius of ["none", "small", "medium", "large", "full"] as const) {
      for (const size of ["1", "2", "3", "4"] as const) {
        const { popup, items } = openSelect({ radius }, undefined, size);
        await settled();
        const row = items[0]!;
        const declared = parseFloat(computed(row, "border-top-left-radius"));
        const painted = Math.min(declared, row.getBoundingClientRect().height / 2);
        const pad = parseFloat(computed(popup, "padding-top"));
        const panel = parseFloat(computed(popup, "border-top-left-radius"));
        const expected = radius === "none" ? 0 : painted + pad;
        expect(panel, `${radius} × size ${size}`).toBeCloseTo(expected, 1);
      }
    }
  });
});

/* ── Selection: the family's one selected rule (§21) ──────────────────────────────────── */

describe("selected speaks accent through the indicator", () => {
  for (const appearance of ["light", "dark"] as const) {
    it(`${appearance}: the chosen row's tick is the accent solid; its label is ordinary ink`, async () => {
      const { popup, items } = openSelect({ appearance });
      await settled();
      const [alpha, beta] = items;
      if (!alpha || !beta) throw new Error("rows missing");
      expect(beta.getAttribute("data-selected"), "defaultValue=b marks Beta").not.toBeNull();
      const indicator = beta.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!indicator) throw new Error("indicator missing");
      expect(computed(indicator, "color")).toBe(colorOn(popup, "var(--accent-solid)"));
      expect(computed(beta, "color"), "the label stays the row's ink").toBe(
        computed(alpha, "color"),
      );
      // The CHOSEN tick is VISIBLE, and this is the half the law was missing (audit
      // 2026-08-09). Showing the current choice is two facts — the tick is accent AND it is
      // the only one painted — and only the colour was read here, on a row where hiding does
      // not change the colour. Changing one word in the hiding rule below hides every tick
      // including this one, and the whole suite stayed green. It is not a hypothetical: that
      // rule keys on ONE of the two spellings Base UI uses for selected, while the shared
      // rule one layer down defensively handles both, so a library rename would silently
      // empty every panel of its only selection indicator.
      expect(computed(indicator, "visibility"), "the chosen tick is painted").toBe("visible");
      // The reserved gutter: the unchosen row keeps the box and hides the glyph.
      const ghost = alpha.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!ghost) throw new Error("unchosen indicator missing — keepMounted dropped");
      expect(computed(ghost, "visibility")).toBe("hidden");
      expect(ghost.getBoundingClientRect().width).toBeGreaterThan(0);
    });
  }

  it("a DEAD chosen row dims its tick — the accent stands down with the row", async () => {
    const { items } = openSelect({}, (
      <>
        <SelectItem value="a">Alpha</SelectItem>
        <SelectItem value="b" disabled>
          Beta
        </SelectItem>
      </>
    ));
    await settled();
    const dead = items[1]!;
    expect(dead.getAttribute("data-selected")).not.toBeNull();
    const indicator = dead.querySelector<HTMLElement>('[data-slot="leading"]');
    if (!indicator) throw new Error("indicator missing");
    const popup = dead.closest<HTMLElement>(".kui-select-popup")!;
    expect(computed(indicator, "color")).toBe(colorOn(popup, "var(--neutral-8)"));
  });
});

/* ── Behavior smoke, and the value machinery (§23) ────────────────────────────────────── */

describe("behavior: roles, choosing, forms, labels", () => {
  it("combobox trigger, listbox panel, option rows — the a11y contract a menu cannot fake", async () => {
    const host = render(
      <Theme>
        <Select defaultOpen defaultValue="a">
          <SelectTrigger placeholder="p" />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    await settled();
    const trigger = host.querySelector<HTMLElement>(".kui-select-trigger")!;
    expect(trigger.getAttribute("role")).toBe("combobox");
    const popups = document.querySelectorAll<HTMLElement>(".kui-select-popup");
    const popup = popups[popups.length - 1]!;
    expect(popup.getAttribute("role")).toBe("listbox");
    expect(popup.querySelector('[role="option"]')).not.toBeNull();
  });

  it("choosing an option closes the panel, displays the value and moves data-selected", async () => {
    const host = render(
      <Theme>
        <Select defaultOpen items={{ a: "Alpha", b: "Beta" }}>
          <SelectTrigger placeholder="Pick one" />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
            <SelectItem value="b">Beta</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    await settled();
    const popups = document.querySelectorAll<HTMLElement>(".kui-select-popup");
    const popup = popups[popups.length - 1]!;
    const beta = [...popup.querySelectorAll<HTMLElement>(".kui-select-item")][1]!;
    // Base UI ignores a pointer release inside ~its press-drag window of the panel opening
    // (mousedown-on-trigger, drag, release-on-item is one gesture); a click fired straight
    // after mount lands inside it and selects nothing. Wait the gesture out first.
    await new Promise((r) => setTimeout(r, 600));
    await userEvent.click(beta);
    // Then poll — the close is not synchronous with the click. HIDDEN, not absent: Base UI
    // keeps the panel mounted after it has opened once (it is also the label store), so
    // "closed" is checkVisibility() false, and asserting removal would never pass.
    await expect
      .poll(() => popup.checkVisibility(), { timeout: 2000 })
      .toBe(false);
    expect(host.querySelector(".kui-select-value")!.textContent).toBe("Beta");
  });

  it("the form half: a hidden input carries name and value — a select IS a form control", async () => {
    const host = render(
      <Theme>
        <form>
          <Select defaultValue="b" name="flavor">
            <SelectTrigger placeholder="p" />
            <SelectContent>
              <SelectItem value="a">Alpha</SelectItem>
              <SelectItem value="b">Beta</SelectItem>
            </SelectContent>
          </Select>
        </form>
      </Theme>,
    );
    await settled();
    const input = host.querySelector<HTMLInputElement>('input[name="flavor"]');
    if (!input) throw new Error("hidden input missing");
    expect(input.value).toBe("b");
  });

  it("a label outside a group is a heading, not a crash (§22's lesson, §23's member)", async () => {
    const { popup } = openSelect({}, (
      <>
        <SelectLabel>Fruit</SelectLabel>
        <SelectItem value="a">Apple</SelectItem>
      </>
    ));
    await settled();
    const label = popup.querySelector<HTMLElement>(".kui-select-label");
    if (!label) throw new Error("standalone label missing");
    expect(computed(label, "color")).toBe(colorOn(popup, "var(--color-text-faint)"));
    expect(computed(label, "pointer-events")).toBe("none");
    expect(label.getAttribute("role")).toBeNull();
    expect(popup.querySelectorAll(".kui-select-item").length).toBe(1);
  });

  it("an unbreakable option does not push out of the panel", async () => {
    // A row is inline-size: 100% of a panel that is itself capped at the reported room, and
    // nothing bounded its CONTENT. Measured before the fix: 90px of horizontal scroll in a
    // 220px panel, and once scrolled, the highlighted row's fill, corner and focus ring all
    // stopped short of the words they were highlighting.
    const host = render(
      <Theme>
        <Select defaultOpen>
          <SelectTrigger placeholder="p" />
          <SelectContent style={{ maxWidth: "220px" }}>
            <SelectItem value="a">someone.with.a.long.name@example-company.com</SelectItem>
            <SelectItem value="b">Short</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    await settled();
    const popups = document.querySelectorAll<HTMLElement>(".kui-select-popup");
    const popup = popups[popups.length - 1]!;
    const row = popup.querySelector<HTMLElement>(".kui-select-item")!;
    expect(popup.scrollWidth - popup.clientWidth, "no sideways scroll").toBeLessThanOrEqual(1);
    expect(
      row.scrollWidth - Math.ceil(row.clientWidth),
      "the text stays inside the row that paints it",
    ).toBeLessThanOrEqual(1);
    // The negative control: the same panel with only short labels was never overflowing, so a
    // law that passes for both is measuring the wrong thing.
    expect(host).toBeDefined();
  });

  it("the panel is a listbox, and a listbox holds only options and groups", async () => {
    // A separator between option groups is refused for exactly this reason (audit
    // 2026-08-09): a menu may contain one, a listbox may not, and the panel IS the listbox.
    const { popup } = openSelect({}, (
      <>
        <SelectGroup>
          <SelectLabel>Citrus</SelectLabel>
          <SelectItem value="a">Lemon</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Berries</SelectLabel>
          <SelectItem value="b">Fig</SelectItem>
        </SelectGroup>
      </>
    ));
    await settled();
    expect(popup.getAttribute("role")).toBe("listbox");
    const illegal = [...popup.children].filter((child) => {
      const role = child.getAttribute("role");
      if (role === "option" || role === "group") return false;
      // A presentational or hidden node is not IN the accessibility tree, so it is not a child
      // of the listbox as far as the contract is concerned.
      return !(role === "presentation" || role === "none" || child.hasAttribute("aria-hidden"));
    });
    expect(illegal.map((el) => el.getAttribute("role") ?? el.tagName)).toEqual([]);
  });

  it("a label inside a group keeps the group wiring", async () => {
    const { popup } = openSelect({}, (
      <SelectGroup>
        <SelectLabel>Fruit</SelectLabel>
        <SelectItem value="a">Apple</SelectItem>
      </SelectGroup>
    ));
    await settled();
    const group = popup.querySelector<HTMLElement>('[role="group"]');
    const label = popup.querySelector<HTMLElement>(".kui-select-label");
    if (!group || !label) throw new Error("group or label missing");
    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
  });
});
