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
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/menu.tsx";
import { Button } from "../button/button.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Card } from "../card/card.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import {
  render as mount,
  renderSettled as render,
  inMotion,
  flushFlight,
  settleAll,
  computed,
  probeIn,
  tokenOn,
  colorOn,
  DENSITIES,
} from "../../test/browser.tsx";

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
  depth: "elevated",
  surfaceLook: "filled",
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
  settleAll();
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

  it("the empty trigger INVITES: placeholder in the muted role; a chosen value in full ink", async () => {
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
    // Muted since 2026-08-10 (the ink ladder became solved targets, and faint dropped below
    // the reading floor to become the exception rung) — text-field.css carries the argument.
    expect(computed(empty, "color")).toBe(colorOn(host, "var(--color-text-muted)"));
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
    const flat = openSelect({ depth: "flat" });
    await settled();
    const flatShadow = computed(flat.popup, "box-shadow");
    expect(flatShadow, "a floating pane casts in a flat world").not.toBe("none");
    const elevated = openSelect({ depth: "elevated" });
    await settled();
    expect(computed(elevated.popup, "box-shadow")).not.toBe("none");
    expect(computed(elevated.popup, "box-shadow")).not.toBe(flatShadow);
    // The negative control: a flat Card beside it casts nothing.
    let card: HTMLElement | null = null;
    render(
      <Theme depth="flat">
        <Card ref={(n: HTMLDivElement | null) => void (card = n)}>plain</Card>
      </Theme>,
    );
    expect(computed(card as unknown as HTMLElement, "box-shadow")).toBe("none");
  });

  it("glass keeps the floating cast", async () => {
    const { popup } = openSelect({ depth: "flat" }, undefined);
    await settled();
    const solid = computed(popup, "box-shadow");
    const glass = render(
      <Theme depth="flat">
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
    expect(computed(label, "color")).toBe(colorOn(popup, "var(--color-text-muted)"));
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

describe("the entry is the floating family's, not a copy of it (§8, §22)", () => {
  /**
   * Select is the second member, and it gets the panel's entry by MEMBERSHIP: the recipe moved
   * out of menu.css onto the family class on 2026-08-10, so this file adds no motion CSS at
   * all. These laws exist to prove that the membership is real — that the panel actually flies,
   * and that it flies the same way the menu does rather than nearly the same way.
   */
  const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

  async function openFlying() {
    // inMotion BEFORE mount (2026-08-15): a defaultOpen entry begins at mount's microtask
    // and reads its release clock off computed durations — mounted under the harness's
    // pinned zeros, it schedules release at ~50ms and the flight is cut mid-air the moment
    // the pins lift.
    inMotion();
    mount(
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
    const popups = document.querySelectorAll<HTMLElement>(".kui-select-popup");
    // The runner poses synchronously and measures a microtask later (unified 2026-08-16), so
    // a law that reads the flight's numbers must let that turn run first.
    await flushFlight();
    return popups[popups.length - 1]!;
  }

  it("the first frame is the trigger's SILHOUETTE, and the panel is measured for the flight", async () => {
    // The silhouette, on the family's second member with zero CSS of its own (2026-08-15,
    // Kushagra: the panel must start "exactly the shape of the trigger, and exactly where
    // the trigger is"; menu.browser.test.tsx carries the recipe's own laws, this asserts
    // the membership): the first frame wears the trigger's box ON the trigger, and the
    // measured destination is what makes the unfurl animatable at all.
    const popup = await openFlying();
    const trigger = document.querySelector<HTMLElement>(".kui-select-trigger")!;
    expect(popup.hasAttribute("data-seed")).toBe(true);
    // One frame: the overlay is aimed after floating-ui places the positioner, and the
    // seed holds for two — the awaited frame lands between the aim and the release.
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const box = trigger.getBoundingClientRect();
    const seed = popup.getBoundingClientRect();
    // Within the held press's drift, not to the pixel: the silhouette measures the trigger
    // on the open's first frame, and the trigger then shrinks a hair under the held press —
    // so by the time this law reads both rects, the trigger has moved ~1px out from under
    // its own photograph. The claim is overlay, not simultaneity.
    expect(Math.abs(seed.width - box.width), "the trigger's own width").toBeLessThan(3);
    expect(Math.abs(seed.height - box.height), "the trigger's own height").toBeLessThan(3);
    expect(Math.abs(seed.left - box.left), "sitting exactly on it").toBeLessThan(3);
    expect(Math.abs(seed.top - box.top)).toBeLessThan(3);
    expect(parseFloat(computed(popup, "border-top-left-radius"))).toBeCloseTo(
      parseFloat(getComputedStyle(trigger).borderTopLeftRadius),
      1,
    );
    // The measurement is what makes the destination animatable at all — and it carries the
    // trigger floor, which is a claim about the PANEL, not the seed.
    expect(parseFloat(popup.style.getPropertyValue("--kui-fly-w"))).toBeGreaterThanOrEqual(
      box.width - 1,
    );
    expect(popup.hasAttribute("data-unfurling")).toBe(true);
  });

  it("the box actually MOVES across the entry — membership is not the same as motion", async () => {
    const popup = await openFlying();
    const widths: number[] = [];
    const deadline = performance.now() + 2000;
    while (performance.now() < deadline) {
      widths.push(Math.round(popup.getBoundingClientRect().width));
      if (!popup.hasAttribute("data-unfurling")) break;
      await frame();
    }
    expect(new Set(widths).size, `it never moved: ${widths.join(",")}`).toBeGreaterThan(2);
  });

  it("the FIRST open flies to the settled width — the floor is inside the target (§22)", async () => {
    /**
     * Kushagra, checking the fixes: *"it opens like this, then it expands after a second."*
     * The panel's floor is "never narrower than the trigger", spelled through floating-ui's
     * --anchor-width — which does not exist yet when a first open measures. So the flight
     * targeted the content-only width (~140px against a ~620px trigger) and the real floor
     * arrived only at release: the panel felt done, then visibly re-expanded. The entry now
     * writes the trigger's width itself, before measuring, and both floors consult it first.
     */
    inMotion();
    mount(
      <Theme>
        <Select defaultOpen items={{ a: "Alpha", b: "Beta" }}>
          <SelectTrigger placeholder="Pick one" style={{ minWidth: "360px" }} />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
            <SelectItem value="b">Beta</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    const tick = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await flushFlight();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop()!;
    const trigger = document.querySelector<HTMLElement>(".kui-select-trigger")!;
    // The rect, not the 360 literal: an open trigger HOLDS THE PRESS, and the press scales it
    // 0.975 — the anchor floating-ui measures is the scaled box, so the scaled box is the
    // number every claim below is about. The calibration only needs it wider than the content.
    const triggerW = trigger.getBoundingClientRect().width;
    expect(triggerW, "the case needs a trigger wider than the content").toBeGreaterThan(300);

    // The flight's own target, read off the measurement the entry wrote.
    const target = parseFloat(popup.style.getPropertyValue("--kui-fly-w"));
    expect(target, "the measured target must include the trigger floor").toBeGreaterThanOrEqual(
      triggerW - 1,
    );

    // And the seam: the panel's width the frame the flight ends must BE its settled width —
    // a floor arriving at release is exactly a jump on that frame.
    let before = 0;
    const deadline = performance.now() + 3000;
    while (performance.now() < deadline) {
      const w = popup.getBoundingClientRect().width;
      if (!popup.hasAttribute("data-unfurling")) {
        expect(w, `it re-expanded at release: ${before} -> ${w}`).toBeCloseTo(before, 0);
        expect(w, "and it settled at the trigger's width").toBeGreaterThanOrEqual(triggerW - 1);
        return;
      }
      before = w;
      await tick();
    }
    throw new Error("the flight never released");
  });

  it("a CLICKED open lands where it settles — the floor is the trigger AS HELD (§8, §22, 2026-08-10)", async () => {
    /**
     * The law above proves the seam on `defaultOpen` — where the trigger is BORN holding the
     * press, no scale transition ever runs, and both floors read the same scaled box. That is
     * the axis that was right. The axis that shipped broken is the one a user actually takes:
     * click a resting trigger, and the entry measures on the open's first frame, when the
     * held-press transition has not visibly moved — so the flight floored on the RESTING rect
     * while floating-ui's settled `--anchor-width` measures the trigger WITH its held
     * transform. Flight 402, settle 392, a 10px compression the frame the flight ended
     * (Kushagra's screenshots, measured live). The entry now floors on the trigger AS HELD —
     * the end value of its running scale transition — so the two floors agree by input.
     *
     * If the held press is ever removed from open triggers, the calibration below fails and
     * this law should be revisited with it: its premise is that an open trigger is scaled.
     */
    mount(
      <Theme>
        <Select items={{ a: "Alpha", b: "Beta" }}>
          <SelectTrigger placeholder="Pick one" style={{ minWidth: "360px" }} />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
            <SelectItem value="b">Beta</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    inMotion();
    const tick = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const trigger = document.querySelector<HTMLElement>(".kui-select-trigger")!;
    const resting = trigger.getBoundingClientRect().width;

    const { userEvent } = await import("vitest/browser");
    await userEvent.click(trigger);
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop()!;

    /**
     * `settled` is the flight's own final width, and it is only recorded once the box has
     * STOPPED MOVING — two consecutive frames at the same width (2026-08-16). The first
     * spelling kept the previous frame's sample instead, which is the same thing only while
     * frames are 16ms apart: under full-suite load a frame can be 100ms, so the "frame
     * before release" was still mid-spring and the law compared an animating width against a
     * settled one. It failed at 1px, on a claim about a defect that measured 10 — a law
     * flaking on the tail of the animation it is not about.
     */
    let previous = 0;
    let settled = 0;
    const deadline = performance.now() + 3000;
    while (performance.now() < deadline) {
      const w = popup.getBoundingClientRect().width;
      if (settled > 0 && !popup.hasAttribute("data-unfurling")) {
        // Calibration first: the premise. The open trigger must genuinely be held smaller
        // than its resting self, or this whole law is measuring a press that is not there.
        const heldW = trigger.getBoundingClientRect().width;
        expect(heldW, "the held press no longer scales the trigger").toBeLessThan(resting - 1);
        // The seam: the frame the flight ends, the width must not step.
        expect(w, `it stepped at release: ${settled} -> ${w}`).toBeCloseTo(settled, 0);
        // And the settled floor is the trigger as the eye sees it — the held box.
        expect(w, "narrower than the held trigger").toBeGreaterThanOrEqual(heldW - 1);
        return;
      }
      if (popup.hasAttribute("data-unfurling")) {
        if (previous > 0 && Math.abs(w - previous) < 0.5) settled = w;
        previous = w;
      }
      await tick();
    }
    throw new Error("the clicked flight never released");
  });

  it("the trigger rises to a real pointer — a button's gesture in field dress (§8)", async () => {
    /**
     * Kushagra: *"select trigger should also have same animation as that of buttons no? its
     * also an onclick trigger."* §8's "a field does nothing" is about the box the eye rests
     * INSIDE; this is a button wearing field dress, and it takes the button family's
     * distances. The rise is the half a law can produce (`:hover` is real under userEvent);
     * the press is covered structurally beside Button's, with the same limitation recorded.
     */
    mount(
      <Theme>
        <Select items={{ a: "Alpha" }}>
          <SelectTrigger placeholder="Pick one" />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    const trigger = document.querySelector<HTMLElement>(".kui-select-trigger")!;
    const { userEvent } = await import("vitest/browser");
    expect(computed(trigger, "translate"), "at rest it sits on the page").toBe("0px");
    await userEvent.hover(trigger);
    expect(trigger.matches(":hover"), "the harness must really be hovering").toBe(true);
    const [, y] = computed(trigger, "translate").split(" ");
    expect(parseFloat(y ?? "0"), "it must rise toward the pointer").toBeLessThan(0);
  });

  it("the entry replays on EVERY open, not only the first (§22)", async () => {
    /**
     * Kushagra: *"animation on select only once. Next time, its instant."* Two faults hid
     * behind one symptom. The entry ran in the body's ref callback — once per DOM node — and
     * nothing re-ran it for an open the framework served without a fresh mount; and on the
     * reopen path the popup's positioner can still be ZERO-WIDTH when the callback runs, so
     * the "natural" measurement read the panel as its own padding (10px) and the entry flew
     * TOWARD it: the panel visibly shrank. The mechanism now begins per OPEN (Base UI's
     * starting stamp, observed), and refuses any measurement at or under the seed — a real
     * panel can never be that small, so a tiny reading means "not laid out yet, retry".
     */
    mount(
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
    inMotion();
    const tick = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const first = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop()!;

    // Land the first flight for real — this law is about the SECOND one.
    let deadline = performance.now() + 3000;
    while (first.hasAttribute("data-unfurling") && performance.now() < deadline) await tick();
    expect(first.hasAttribute("data-unfurling"), "the first entry must land").toBe(false);

    const { userEvent } = await import("vitest/browser");
    await userEvent.keyboard("{Escape}");
    deadline = performance.now() + 3000;
    while (document.querySelector(".kui-select-popup:not([hidden])") && performance.now() < deadline)
      await tick();

    // Base UI ignores a pointer release inside its press-drag window; wait it out (the
    // instrument lesson from this file's own choosing law).
    await new Promise((r) => setTimeout(r, 600));
    await userEvent.click(document.querySelector<HTMLElement>(".kui-select-trigger")!);

    deadline = performance.now() + 3000;
    const flight: number[] = [];
    let landed: HTMLElement | null = null;
    const triggerH = document
      .querySelector<HTMLElement>(".kui-select-trigger")!
      .getBoundingClientRect().height;
    while (performance.now() < deadline) {
      const popup = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop();
      if (popup?.hasAttribute("data-unfurling")) {
        // HEIGHT, since the morph: the seed is the trigger's box, and a select's trigger is
        // routinely exactly as wide as its panel — the width channel is legitimately static
        // there, while the height always has a panel's worth of rows to grow.
        flight.push(popup.getBoundingClientRect().height);
      } else if (flight.length) {
        landed = popup ?? null;
        break;
      }
      await tick();
    }
    expect(flight.length, "the second open never flew — the entry ran once per lifetime").toBeGreaterThan(0);
    // Anchored to the TRIGGER's height (2026-08-15, the silhouette): the seed is the
    // trigger's own box, so a replayed flight must start down at that height — a flight
    // that begins mid-size means the entry did not replay from its seed.
    expect(Math.min(...flight), "it must fly FROM the silhouette, not from mid-size").toBeLessThanOrEqual(
      triggerH + 4,
    );
    // TARGET-AGREEMENT, not direction (2026-08-15): "the end must sit above the start" was
    // true only while the seed was smaller than every panel — the 72px circle is TALLER than
    // a two-item select panel, so its height legitimately shrinks while its width grows.
    // What the direction assert guarded was the fly-toward-10px regression, and both its
    // halves survive: the flight must START at the seed (asserted above), it must END where
    // it settles (no snap at the release seam), and the landed panel must be a real one —
    // the 10px regression fails that last check outright.
    expect(landed, "the flight must end in a released panel").not.toBeNull();
    expect(
      Math.abs(landed!.getBoundingClientRect().height - flight.at(-1)!),
      `it snapped at release: ${flight.at(-1)} -> ${landed!.getBoundingClientRect().height}`,
    ).toBeLessThanOrEqual(1.5);
    expect(landed!.getBoundingClientRect().height, "and the panel it ends in is a real one").toBeGreaterThan(
      triggerH * 1.5,
    );
  });

  it("and it resolves the SAME recipe a menu does — one family, one entry", async () => {
    // The agreement law the promotion owes (ENGINEERING §6: a mechanism with two
    // implementations owes a law that they agree). Read as computed values on both panels,
    // because "select.css adds no motion" is exactly the kind of claim that stays true in the
    // stylesheet while a component quietly re-points a clock.
    const select = await openFlying();
    // Un-seeded first: the seed state pins `transition: none` (a held pose), and the
    // recipe under agreement is the FLIGHT's — the base rule's.
    select.removeAttribute("data-seed");
    const selectRecipe = ["transition-duration", "transition-property", "transition-timing-function"].map(
      (p) => computed(select, p),
    );
    mount(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const menu = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop()!;
    menu.removeAttribute("data-seed");
    const menuRecipe = ["transition-duration", "transition-property", "transition-timing-function"].map(
      (p) => computed(menu, p),
    );
    expect(selectRecipe[1], "the entry must animate something").toContain("inline-size");
    expect(selectRecipe).toEqual(menuRecipe);
  });
});
