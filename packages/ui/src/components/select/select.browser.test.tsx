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
import * as React from "react";
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
import {
  render,
  computed,
  probeIn,
  tokenOn,
  colorOn,
  until,
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
  /**
   * The popup's class list, READ OFF A REAL PANEL rather than restated (2026-08-23).
   *
   * The twin used to carry a hand-written copy, and it went stale the day `kui-floating-rows`
   * joined the identity — the fixture failing on a correct component, which is the second-home
   * defect this repo keeps finding in shipped code and is no better in a law.
   */
  function identities(): { popup: string; row: string } {
    const { popup, items } = openSelect({});
    return { popup: popup.className, row: items[0]!.className };
  }

  function twin(theme: ThemeProps) {
    const identity = identities();
    let popupTwin: HTMLElement | null = null;
    let itemTwin: HTMLElement | null = null;
    render(
      <Theme {...theme}>
        <div
          ref={(n: HTMLDivElement | null) => void (popupTwin = n)}
          className={identity.popup}
          data-size="2"
          data-tone="neutral"
          data-emphasis="quiet"
          data-bordered="true"
          style={{ "--anchor-width": "0px" } as React.CSSProperties}
        >
          <div
            ref={(n: HTMLDivElement | null) => void (itemTwin = n)}
            className={identity.row}
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
    // The PIN IS GONE (2026-08-17): "a field a caret enters does not move" was the
    // bordered-box identity's sentence — the fill was held still because the border and ring
    // carried the states. The field rests on a well now, so the fill is the one currency its
    // hover has, and both members answer the pointer the same way. What the law still owns is
    // that they answer it TOGETHER: a trigger and the TextField beside it are one family.
    expect(computed(field, "background-color"), "a field answers the pointer too").not.toBe(
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
    // Both state `backdrop` since material became SELECTIVE (2026-08-17): a glass theme no
    // longer makes a control glass on its own, so the pair has to say it stands over content
    // or this law compares two opaque boxes and finds them, correctly, identical.
    let field: HTMLElement | null = null;
    const host = render(
      <Theme material="regular">
        <Select>
          <SelectTrigger backdrop placeholder="Pick one" />
        </Select>
        <TextField backdrop placeholder="Type here" />
      </Theme>,
    );
    const trigger = host.querySelector<HTMLElement>(".kui-select-trigger")!;
    field = host.querySelector<HTMLElement>(".kui-field:not(.kui-select-trigger)");
    if (!field) throw new Error("field missing");
    expect(trigger.getAttribute("data-material")).toBe("regular");
    // The chain must agree, but NOT its lens id: a displacement map is built for one box, so
    // two differently-sized panes reference different filters by construction (§10,
    // 2026-08-16). Compare what the stylesheet declares, and assert the lens separately —
    // this law is what caught the trigger shipping without one while its sibling had it.
    const chain = (el: HTMLElement) => computed(el, "backdrop-filter").replace(/url\("[^"]*"\)\s*/, "");
    expect(chain(trigger)).toBe(chain(field));
    for (const el of [trigger, field]) {
      expect(computed(el, "backdrop-filter"), "a glass field wears the lens").toMatch(/^url\(/);
    }
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
    // Lab port 2026-08-17: the panel is a SURFACE and draws its authored corner ×
    // --kui-corner-k (1.613) under `@supports (corner-shape: squircle)`; the ROW's corner
    // is unmultiplied (controls never take squircle), so the authored concentric sum is
    // still rowCorner + pad and the knob applies once, to the panel. Probe-derived so a
    // non-squircle engine (knob fallback 1) passes unchanged.
    const expected = parseFloat(
      probeIn(
        popup,
        (el) => (el.style.borderRadius = `calc(${rowCorner + pad}px * var(--kui-corner-k, 1))`),
        (s) => s.borderTopLeftRadius,
      ),
    );
    expect(parseFloat(computed(popup, "border-top-left-radius"))).toBeCloseTo(expected, 1);
  });

  it("a flat popup casts NOTHING, and the elevated one casts something visible (2026-08-19)", async () => {
    // REVERSES this law's own previous claim, which was titled "casts in BOTH worlds" and
    // asserted `flatShadow !== "none"` under the message "a floating pane casts in a flat
    // world" (2026-08-26 audit). That premise retired on 2026-08-19 with the half-faded
    // floating cast: in flat, separation is the hairline's job and nothing casts, popups
    // included. `--floating-chrome-flat` is emitted as the list-legal no-op `0 0 0 0
    // transparent`, which is not the string "none" — so the old assertion passed on the very
    // value that disproves it, and it would have gone on passing if a real palette row were
    // pointed back at flat floating panes. Menu's law is the correct shape; this is it,
    // self-keyed on the second member.
    const flat = openSelect({ depth: "flat" });
    await settled();
    const flatShadow = computed(flat.popup, "box-shadow");
    expect(flatShadow, "a flat popup still resolves a real list").not.toBe("none");
    // Zero geometry AND zero alpha per layer: a transparent shadow with real offsets is
    // invisible today and a value waiting to paint the moment a colour arrives.
    for (const layer of flatShadow.split(/,(?![^(]*\))/)) {
      expect(layer, "a flat popup layer must be the no-op").toMatch(
        /^\s*rgba\(0, 0, 0, 0\) 0px 0px 0px 0px\s*$/,
      );
    }
    const elevated = openSelect({ depth: "elevated" });
    await settled();
    const elevatedShadow = computed(elevated.popup, "box-shadow");
    expect(elevatedShadow, "an elevated popup still casts").not.toBe("none");
    expect(elevatedShadow).not.toBe(flatShadow);
    // Visible means at least one layer carrying real alpha — the no-op list reads
    // rgba(0, 0, 0, 0) only, so the negation above is not enough on its own.
    const alphas = [...elevatedShadow.matchAll(/rgba?\([^)]*?([\d.]+)\)/g)].map((m) =>
      parseFloat(m[1]!),
    );
    expect(Math.max(0, ...alphas), "the elevated cast is visible").toBeGreaterThan(0);
    // The negative control: a flat Card beside it casts nothing.
    let card: HTMLElement | null = null;
    render(
      <Theme depth="flat">
        <Card ref={(n: HTMLDivElement | null) => void (card = n)}>plain</Card>
      </Theme>,
    );
    const cardEl = card as unknown as HTMLElement;
    // Seat only: flat removes the cast, never the pool (lab port 2026-08-17).
    const seat = document.createElement("div");
    seat.style.boxShadow = "var(--material-pool-solid), 0 0 0 0 transparent";
    cardEl.append(seat);
    expect(computed(cardEl, "box-shadow")).toBe(computed(seat, "box-shadow"));
    seat.remove();
  });

  it("glass keeps the floating cast", async () => {
    const { popup } = openSelect({ depth: "flat" }, undefined);
    await settled();
    // The cast tail only — the pool differs by design since 2026-08-17 (glass wears the
    // pane's shade, solid the seat); the menu's own law states the rule in full.
    // Lab port 2026-08-17: split on LAYER commas — the glass pool serializes as
    // "… -14px inset," (no "px,"), so a first-"px," slice ate the pool AND the contact row
    // and compared unequal tails. Commas inside rgb(…) are excluded by the lookahead.
    const castOf = (shadow: string) =>
      shadow
        .split(/,(?![^(]*\))/)
        .slice(1)
        .map((l) => l.trim())
        .join(", ");
    const solid = castOf(computed(popup, "box-shadow"));
    const glass = render(
      <Theme depth="flat" material="regular">
        <Select defaultOpen>
          <SelectTrigger placeholder="p" />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    await settled();
    const popups = document.querySelectorAll<HTMLElement>(".kui-select-popup");
    const glassPopup = popups[popups.length - 1]!;
    expect(glassPopup.getAttribute("data-material")).toBe("regular");
    expect(castOf(computed(glassPopup, "box-shadow"))).toBe(solid);
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
      // THE BAND, NOT THE RETIRED FLAT VALUE (2026-09-07). `--floating-p` was one number for
      // every floating pane; the panel band replaced it with a per-index ladder carried by
      // `--kui-panel-p`, which is also where the ring clearance now lives — so this reads the
      // band's DESIGNED rung and the max() below re-derives the floor from it, as before.
      const floatingP = parseFloat(tokenOn(popup, `--panel-p-2`));
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
        // Lab port 2026-08-17: the panel (a SURFACE) draws its authored sum × --kui-corner-k
        // (1.613, squircle compensation); the row's painted corner is unmultiplied because
        // controls never take squircle. `none` stays exactly 0 — the guard, not 0 × knob.
        const expected =
          radius === "none"
            ? 0
            : parseFloat(
                probeIn(
                  popup,
                  (el) => (el.style.borderRadius = `calc(${painted + pad}px * var(--kui-corner-k, 1))`),
                  (s) => s.borderTopLeftRadius,
                ),
              );
        expect(panel, `${radius} × size ${size}`).toBeCloseTo(expected, 1);
      }
    }
  });
});

/* ── Selection: the family's one selected rule (§21) ──────────────────────────────────── */

describe("selected speaks accent through the indicator", () => {
  for (const appearance of ["light", "dark"] as const) {
    it(`${appearance}: the chosen row's tick is the accent GLYPH; its label is ordinary ink`, async () => {
      const { popup, items } = openSelect({ appearance });
      await settled();
      const [alpha, beta] = items;
      if (!alpha || !beta) throw new Error("rows missing");
      expect(beta.getAttribute("data-selected"), "defaultValue=b marks Beta").not.toBeNull();
      const indicator = beta.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!indicator) throw new Error("indicator missing");
      // --accent-GLYPH since 2026-08-23. A tick is fine detail and owes the non-text floor,
      // which the solid missed on the dark page (|Lc| 43.4 against 45) while the comment
      // beside it in recipes.css claimed the floor as its justification. Same principle,
      // finally the value that keeps it.
      expect(computed(indicator, "color")).toBe(colorOn(popup, "var(--accent-glyph)"));
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
    //
    // It walked `popup.children` until 2026-08-26, and could not fail: the popup's ONE child
    // is the floating body, `role="presentation"`, which the filter drops — so the list under
    // test was always empty and the composition this refusal exists to prevent sat one level
    // below, as a grandchild. The walk COLLAPSES presentational wrappers now, which is what
    // the accessibility tree does, and the fixture carries its own negative control: an
    // illegal child put where a caller would put it must be reported.
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
    /** The listbox's children AS THE ACCESSIBILITY TREE SEES THEM: a `presentation`/`none`
        wrapper contributes its own children in its place, an `aria-hidden` subtree
        contributes nothing. */
    const owned = (el: Element): Element[] =>
      [...el.children].flatMap((child) => {
        if (child.hasAttribute("aria-hidden")) return [];
        const role = child.getAttribute("role");
        return role === "presentation" || role === "none" ? owned(child) : [child];
      });
    const illegal = (root: Element) =>
      owned(root)
        .filter((child) => {
          const role = child.getAttribute("role");
          return role !== "option" && role !== "group";
        })
        .map((el) => el.getAttribute("role") ?? el.tagName);
    expect(illegal(popup)).toEqual([]);
    // The walk really does reach past the body — the calibration, without which the empty
    // list above is indistinguishable from a walk that measured nothing. A `<div>` standing
    // in for the refused Separator, planted where a caller would compose one.
    const body = popup.querySelector<HTMLElement>(".kui-floating-body");
    if (!body) throw new Error("the floating body is missing — this law would collapse nothing");
    const intruder = document.createElement("div");
    body.append(intruder);
    expect(illegal(popup), "an illegal child inside the body must be reported").toEqual(["DIV"]);
    intruder.remove();
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

  /**
   * `items` is the ONLY thing that turns a value into words on the trigger (2026-08-26 audit).
   *
   * Four JSDoc blocks said the opposite — that Base UI reads an option's label from its
   * mounted row, so `items` was merely an optimisation for the moment before the panel had
   * first opened. It never did: `Select.Value` resolves through `resolveSelectedLabel(value,
   * store.items, …)`, and `store.items` is the ROOT PROP and nothing else. Without the map the
   * trigger paints the raw value string forever, including straight after a click on a row
   * that says something else. The doc is the thing a consumer builds on, so the law is the
   * behaviour it now describes, measured in BOTH directions — a law that only checked the
   * `items` half would pass on a select that had learned to read its rows.
   */
  /**
   * ONE CASE PER TEST, and that is the instrument (2026-08-26). Both directions first ran
   * inside a single `it`, and Base UI keeps a select's panel MOUNTED after its first open —
   * it is also the label store — so the second mount ran with the first popup still in the
   * document, hidden. `popups[popups.length - 1]` picks the right element, but the click does
   * not take an element: vitest hands Playwright a generated selector, and the text-based one
   * it produced resolved to `div` filtered by /^Beta$/ `.nth(2)` — the STALE row, which is
   * `data-selected` and invisible, so the click retried for 13s against "element is not
   * visible". It passed alone and failed in a full run, which is this repo's own signature for
   * an instrument fault rather than a defect, and the third time the stale-popup selector has
   * caught a law in this package. The harness's afterEach unmounts every root, so the fix is
   * to let it run between the two cases: the same two claims, one popup in the document for
   * each. Split rather than scoped, because a scoped locator would leave the stale panel in
   * the page for every later law in the file to trip over.
   */
  const chooseBeta = async (items?: Record<string, React.ReactNode>) => {
    const host = render(
      <Theme>
        <Select defaultOpen {...(items ? { items } : {})}>
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
    // Base UI's press-drag window, exactly as the choosing law above waits it out. That one IS
    // elapsed time — a store timer with no observable stamp — so it stays a sleep.
    await new Promise((r) => setTimeout(r, 600));
    await userEvent.click(beta);
    await expect.poll(() => popup.checkVisibility(), { timeout: 2000 }).toBe(false);
    return host.querySelector(".kui-select-value")!.textContent;
  };

  it("without `items` the chosen label never reaches the trigger", async () => {
    // The row that was clicked reads "Beta"; the trigger reads the VALUE, because nothing
    // told it otherwise. This is the sentence the corrected JSDoc makes.
    expect(await chooseBeta(), "no map: the trigger paints the raw value").toBe("b");
  });

  it("...and with it, the label does reach the trigger", async () => {
    // The other direction, and the reason both exist: a law that only checked the `items`
    // half would pass on a select that had learned to read its rows.
    expect(await chooseBeta({ a: "Alpha", b: "Beta" }), "the map is what carries the label").toBe(
      "Beta",
    );
  });

  /**
   * `SelectContent` forwards the props it does not declare (2026-08-26 audit).
   *
   * It destructured four names with no rest spread over a CLOSED object type, so every extra
   * was dropped: non-hyphenated names failed to type-check, and TypeScript's hyphenated-name
   * exemption waved `aria-*` and `data-*` straight through to nowhere. The victim is specific
   * — the panel is a bare `role="listbox"` with no accessible name, and `aria-label` was the
   * obvious repair, accepted and discarded. Dialog's own fix, one component over.
   */
  it("SelectContent forwards what it does not declare, and the system still owns the axes", async () => {
    render(
      <Theme>
        <Select defaultOpen size="3">
          <SelectTrigger placeholder="Pick one" />
          <SelectContent aria-label="Regions" data-testid="regions-panel">
            <SelectItem value="a">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    await settled();
    const popups = document.querySelectorAll<HTMLElement>(".kui-select-popup");
    const popup = popups[popups.length - 1]!;
    expect(popup.getAttribute("aria-label"), "the listbox has an accessible name").toBe("Regions");
    expect(popup.getAttribute("data-testid")).toBe("regions-panel");
    // ...and the pass-through cannot take the panel's identity: the axes are stamped AFTER
    // the rest, so a caller writing `data-size` loses to the system.
    expect(popup.getAttribute("data-size"), "the index is still the system's").toBe("3");
  });

  /**
   * Base UI's value-RESET reaches the consumer as `null`, never the word "null" (2026-08-26
   * audit).
   *
   * `SelectPositioner`'s `onMapChange` clears the value when the mounted option set changes
   * and the current value is no longer among it — a dependent pair of selects, where picking a
   * country replaces the region list — and `setValue` reports through `onValueChange` BEFORE
   * applying. The root wrapped that as `String(v)`, so the clear arrived as the five-character
   * string `"null"`: a controlled consumer stores it and hands it straight back as a value.
   */
  it("a value cleared by Base UI reports null, not the string \"null\"", async () => {
    const seen: (string | null)[] = [];
    function Dependent() {
      const [few, setFew] = React.useState(false);
      return (
        <Theme>
          <button type="button" data-testid="shrink" onClick={() => setFew(true)}>
            shrink
          </button>
          <Select defaultOpen defaultValue="c" onValueChange={(v) => seen.push(v)}>
            <SelectTrigger placeholder="Pick one" />
            <SelectContent>
              <SelectItem value="a">Alpha</SelectItem>
              <SelectItem value="b">Beta</SelectItem>
              {few ? null : <SelectItem value="c">Gamma</SelectItem>}
            </SelectContent>
          </Select>
        </Theme>
      );
    }
    const host = render(<Dependent />);
    await settled();
    host.querySelector<HTMLElement>('[data-testid="shrink"]')!.click();
    // The reset runs off Base UI's item-map subscription, not off the click.
    await expect.poll(() => seen.length, { timeout: 2000 }).toBeGreaterThan(0);
    expect(seen, "the clear is a null, not a word").toEqual([null]);
  });
});

describe("an item-aligned panel lands with the chosen row on its trigger (§23)", () => {
  /**
   * Base UI overlaps the trigger so the chosen row sits on the value it replaces (2026-08-17,
   * Kushagra: *"the selected item always appear on top of trigger 1:1"*). The placement is
   * Base UI's own and it is computed from the panel's real box; these laws read where the panel
   * lands and what it lands as.
   */
  /**
   * Open by CLICKING, on a page with room above the trigger — the only way to reach the
   * placement under test. Base UI overlaps the trigger for pointer input and falls back to the
   * ordinary below-the-trigger geometry otherwise (a keyboard open, a `defaultOpen` no pointer
   * ever touched), and it drops the overlap rather than run off the top of the viewport.
   */
  /**
   * The list is LONG ENOUGH TO OVERFLOW, and that is the load-bearing half of this fixture
   * (2026-08-22 audit). Eight rows fit the available height, and a select whose list fits is
   * the one shape where the whole item-aligned mechanism is a no-op: Base UI writes no
   * constraining positioner height, the panel's own `scrollTop` is 0, and a 57px trigger is
   * discarded by `max(--floating-min-w, anchor)`. Thirty rows is past all three thresholds, and
   * each law states its own calibration rather than trusting this comment.
   */
  const LONG_OPTIONS = Array.from({ length: 30 }, (_, i) => `o${i}`);

  async function openItemAligned(OPTIONS: string[] = LONG_OPTIONS, chosen = "o15") {
    const host = render(
      <Theme>
        {/* Half a viewport of room ABOVE the trigger, stated in `vh` and NOT reached by
            scrolling the page (2026-08-17, CI): the overlap needs somewhere to put the rows
            that precede the chosen one and Base UI drops it rather than run off the top of
            the window, so the case has to guarantee that room. Scrolling to it was the first
            spelling and it is not a guarantee — the scroll is undone by whatever the previous
            test left behind, and a helper that then clicks anyway hands every law below the
            fallback placement and a message about the wrong thing. It passed locally and
            failed on the runner, which is the shape this repo keeps re-learning. */}
        <div style={{ height: "50vh" }} />
        <Select defaultValue={chosen} items={Object.fromEntries(OPTIONS.map((v) => [v, v.toUpperCase()]))}>
          <SelectTrigger />
          <SelectContent>
            {OPTIONS.map((v) => (
              <SelectItem key={v} value={v}>
                {v.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div style={{ height: "50vh" }} />
      </Theme>,
    );
    const trigger = host.querySelector<HTMLElement>(".kui-select-trigger")!;
    // The premise, stated: half a window of room above the trigger, in the window as it is
    // now. A law whose SETUP is assumed is a law that reports the wrong failure.
    const seat = trigger.getBoundingClientRect();
    expect(seat.top, "the trigger must sit clear of the top of the window").toBeGreaterThan(200);
    expect(seat.top, "and inside it").toBeLessThan(window.innerHeight);
    await userEvent.click(trigger);
    // `data-side` is Base UI's ANSWER, and it can answer twice: a fallback side is stamped
    // first and the overlap placement replaces it once the panel's real box has been measured.
    // Waited for as a STATE (`until`, 2026-08-17) — reading the first un-hidden frame raced
    // that second answer on a loaded runner (CI: "expected 'bottom' to be 'none'"). A placement
    // that genuinely never resolves item-aligned expires the deadline into the same assertion.
    let popup: HTMLElement | undefined;
    await until(() => {
      popup = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop();
      return !!popup && !popup.hidden && popup.getAttribute("data-side") === "none";
    }, 3000);
    expect(popup?.getAttribute("data-side"), "the case needs the item-aligned placement").toBe("none");
    return { popup: popup!, trigger };
  }

  it("it lands with the CHOSEN ROW on the trigger (§23)", async () => {
    /**
     * 2026-08-17, Kushagra: *"the selected item always appears on top of trigger 1:1, so that
     * the remainder of the list sits a little above and below the trigger depending on the
     * item's position, like radix."* Base UI's own overlap, pinned OFF on 2026-08-09 and back
     * on since. Base UI computes it from the panel's REAL box, so anything that changes that
     * box before the placement runs moves the chosen row off its trigger (measured once at
     * 66px low) — and this number is the only symptom.
     */
    const { popup, trigger } = await openItemAligned();
    const chosen = popup.querySelector<HTMLElement>(".kui-select-item[data-selected]")!;
    const offset = () =>
      Math.abs(chosen.getBoundingClientRect().top - trigger.getBoundingClientRect().top);
    // A STATE, not a moment: Base UI's placement runs after its first positioning pass, a few
    // frames after the panel mounts. If it never lands, the deadline expires into the assertion.
    await until(() => offset() < 4);
    expect(offset(), "the chosen row does not sit on the trigger").toBeLessThan(4);
    // And the case is a real one: the chosen row is deep enough in the list that a panel
    // hanging below the trigger would put it nowhere near this number.
    expect(popup.getBoundingClientRect().top, "the panel must straddle its trigger").toBeLessThan(
      trigger.getBoundingClientRect().top - 20,
    );
  });

  it("a panel opened by a press is never narrower than a wide trigger (§22)", async () => {
    /**
     * The floor is `max(--floating-min-w, --anchor-width)`, read here on the placement a PRESS
     * reaches. Base UI overlaps the trigger for pointer input and still runs its size middleware
     * there, which is what publishes `--anchor-width`; the panel describe above reads the side
     * placement a `defaultOpen` reaches.
     */
    const host = render(
      <Theme>
        <div style={{ height: "40vh" }} />
        {/* WIDE, and that is the fixture's whole job: narrower than `--floating-min-w` and
            `max(floor, anchor)` discards the number under test. */}
        <Select defaultValue="a" items={{ a: "Alpha", b: "Beta" }}>
          <SelectTrigger style={{ width: 400 }} />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
            <SelectItem value="b">Beta</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    const trigger = host.querySelector<HTMLElement>(".kui-select-trigger")!;
    const triggerWidth = trigger.getBoundingClientRect().width;

    // THIS LAW'S OWN PANEL, identified by not having existed before the click — and in this
    // file that is not fussiness. A select keeps its panel MOUNTED for the life of the
    // component, so every law that has already run has left one in the document; both
    // `querySelector` and "the one with data-open" answer somebody else's, which may carry no
    // floor at all. Passing alone and failing inside the file is the signature, and it fired
    // twice here.
    const before = new Set(document.querySelectorAll(".kui-select-popup"));
    await userEvent.click(trigger);
    const mine = () =>
      [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].find((el) => !before.has(el)) ??
      null;
    // A STATE, not a moment, and the moment was masked until 2026-09-20: a select's popup mounts
    // before Base UI lays it out, and a box with no layout gives the ruler below a zero — a claim
    // about the machine rather than about the floor. The entry runner used to force that layout
    // on the frame it posed the panel, so waiting for existence was enough; with the runner gone
    // the wait has to name the state it is really after. It failed exactly once, under a full
    // `turbo run` with the docs build beside it.
    await until(() => (mine()?.getBoundingClientRect().width ?? 0) > 0);
    const popup = mine()!;

    // THE CALIBRATION: without a trigger wider than the family floor, `max()` discards the
    // anchor term and the assertion below holds whatever the positioner published.
    const ruler = document.createElement("div");
    ruler.style.inlineSize = "var(--floating-min-w)";
    popup.append(ruler);
    const floor = ruler.getBoundingClientRect().width;
    ruler.remove();
    expect(floor, "the family's own floor never resolved").toBeGreaterThan(0);
    expect(
      triggerWidth,
      "the trigger must be wider than --floating-min-w, or the anchor floor is not in play",
    ).toBeGreaterThan(floor);

    // A STATE, not a moment: `--anchor-width` is written by Base UI's positioning pass, a few
    // frames after the panel mounts.
    await until(() => popup.getBoundingClientRect().width >= triggerWidth - 1);
    expect(
      popup.getBoundingClientRect().width,
      "the panel is narrower than the trigger that opened it",
    ).toBeGreaterThanOrEqual(triggerWidth - 1);
  });

  it("an item-aligned panel keeps Base UI's own height and fits inside the window (§23)", async () => {
    /**
     * An item-aligned select is laid out as `height: 100%` of a positioner the library has
     * sized — that is how the panel fills a constrained box and scrolls the chosen row onto the
     * trigger. Both halves are read, because `100%` is a fraction OF something: a panel that
     * keeps its `100%` and loses the positioner's height was measured at 910px inside an 800px
     * window, `clientHeight === scrollHeight` so the list could not be scrolled to (2026-08-22
     * audit).
     *
     * Read as the OUTCOME as well as the property, because a present string still permits a
     * panel that does not fit: the box is inside the window and the list is reachable.
     */
    const { popup } = await openItemAligned();
    const positioner = popup.parentElement!;
    // A STATE, not a moment: Base UI writes both heights in its placement pass, after its first
    // positioning pass has run.
    await until(() => popup.style.height === "100%" && positioner.style.height !== "");
    expect(popup.style.height, "the panel lost Base UI's own inline height").toBe("100%");
    expect(
      positioner.style.height,
      "the positioner's own height is missing — the panel is 100% of nothing",
    ).not.toBe("");
    const box = popup.getBoundingClientRect();
    expect(box.bottom, "the settled panel hangs off the bottom of the window").toBeLessThanOrEqual(
      window.innerHeight,
    );
    expect(box.top, "the settled panel hangs off the top of the window").toBeGreaterThanOrEqual(0);
    expect(
      popup.scrollHeight,
      "the fixture's list must OVERFLOW, or a lost constraint changes nothing",
    ).toBeGreaterThan(popup.clientHeight);
  });
});
