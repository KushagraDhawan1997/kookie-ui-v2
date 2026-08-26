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
import { describe, expect, it, onTestFinished } from "vitest";
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
  until,
  watchesFrames,
  sweep,
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
  it("without `items` the chosen label never reaches the trigger — with it, it does", async () => {
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
      // Base UI's press-drag window, exactly as the choosing law above waits it out.
      await new Promise((r) => setTimeout(r, 600));
      await userEvent.click(beta);
      await expect.poll(() => popup.checkVisibility(), { timeout: 2000 }).toBe(false);
      return host.querySelector(".kui-select-value")!.textContent;
    };
    // The row that was clicked reads "Beta"; the trigger reads the VALUE, because nothing
    // told it otherwise. This is the sentence the corrected JSDoc makes.
    expect(await chooseBeta(), "no map: the trigger paints the raw value").toBe("b");
    // ...and the map is what fixes it, at the same moment, on the same gesture.
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

describe("the entry is the floating family's, and it flies into an item-aligned box (§8, §22, §23)", () => {
  /**
   * Select is the family's second member and it gets the panel's entry by MEMBERSHIP: the
   * recipe moved out of menu.css onto the family class on 2026-08-10, so this file adds no
   * motion CSS at all. What is Select's OWN is where the flight LANDS — Base UI overlaps the
   * trigger so the chosen row sits on the value it replaces (2026-08-17, Kushagra: *"same
   * animation as dropdown, but only the position changes"*) — and the ordering that placement
   * forces: the panel must be PLACED before it is POSED, because Base UI computes the overlap
   * from the panel's real box and a posed panel is the size of its trigger.
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
    // A select is placed before it is posed, so its flight begins FRAMES after the commit
    // rather than on the commit's microtask — a law that reads its numbers has to wait for
    // the pose rather than for `flushFlight()`, which is enough for every other member.
    await flushFlight();
    const popup = popups[popups.length - 1]!;
    // Waited to the AIMED pose — the last moment the panel is still its silhouette — and not
    // merely to the flight's stamp. The two are two frames apart, and under a loaded run those
    // two frames are enough for the whole entry, which is how a law that added a frame of its
    // own came to read a landed panel and call it a seed.
    const deadline = performance.now() + 3000;
    while (!popup.hasAttribute("data-aimed") && performance.now() < deadline) await frame();
    if (!popup.hasAttribute("data-seed")) throw new Error("the panel never posed");
    return popup;
  }

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
   * constraining positioner height, the panel's own `scrollTop` is 0 on every frame, and a
   * 57px trigger is discarded by `max(--floating-min-w, anchor)`. Three separate laws below
   * were asking their question of an input that answers the same whether the mechanism works
   * or not — the degenerate-fixture defect, reached from one line of test data. Thirty rows is
   * past all three thresholds, and each law states its own calibration rather than trusting
   * this comment.
   */
  const LONG_OPTIONS = Array.from({ length: 30 }, (_, i) => `o${i}`);

  async function openItemAligned(OPTIONS: string[] = LONG_OPTIONS, chosen = "o15") {
    inMotion();
    const host = mount(
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

  it("an item-aligned panel flies to the box BASE UI sized, not to the room on one side (§23)", async () => {
    /**
     * 2026-08-23, Kushagra: *"this bug is back"* — measured within the hour, and the defect was
     * mine from earlier the same day.
     *
     * The anchored entry now clamps its target to `--available-height`, because a menu with
     * more content than room used to aim at the whole viewport and finish its opening in a
     * tenth of its clock. `--available-height` is the room on ONE SIDE of the trigger, and that
     * is the panel's cap exactly when the panel sits on one side of it.
     *
     * An item-aligned select does not. The whole point of that placement is that the list
     * extends above AND below the trigger so the chosen row lands on the value it replaces, so
     * Base UI sizes the positioner itself. Measured on a 48-row select in a 900px window: the
     * positioner is 880px, `--available-height` is 425px, and the clamp corrected `--kui-fly-h`
     * from 880 to 425 — the panel landed at 425 and then jumped to 880 the moment the flight
     * released, which is twice its own height, after it had visibly finished arriving.
     *
     * WHY EVERY EXISTING LAW PASSED, and it is this repo's oldest lesson in a new place: they
     * read the chosen ROW. The row was correct throughout — offset spread 0 in flight, landing
     * 2px, no creep — because the placement's scroll offset compensates for the panel being
     * half the size it should be. The axis that was wrong was the panel's HEIGHT, and nothing
     * read it across the seam. So this law reads the box.
     *
     * WHAT THIS FIXTURE STILL CANNOT TELL APART, stated because it is the trap the fix itself
     * fell into first. The guard asks whether BASE UI sized this panel, and there are two
     * places it could be read: the positioner's inline height (`heldHeight`, correct) and the
     * popup's own (`borrowed`, wrong). In the preview app the popup carries no inline height at
     * all — measured `""` while the positioner held `880px` — so guarding on `borrowed` leaves
     * the defect live. In THIS fixture the popup does carry one, so that spelling passes here
     * for the wrong reason. The sabotage pass shows it: removing the guard fails this law,
     * swapping it for `borrowed` does not. Recorded rather than papered over — closing it needs
     * a mount that reproduces the app's Base UI path, and the app is where it was measured.
     */
    const { popup } = await openItemAligned();
    const positioner = popup.parentElement!;
    // PAST DEPARTURE, and the law's first spelling was not — it read at the pose and measured
    // an uncorrected target, so it passed with the guard deleted. The correction lives in
    // `depart()`, which is one frame after the pose comes off: it is the last moment before
    // `transitioncancel` is armed as the dismissal signal, so nothing may write a flight var
    // after it.
    await until(() => !popup.hasAttribute("data-seed"), 3000);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(popup.hasAttribute("data-unfurling"), "the flight is over — the target has been stripped").toBe(true);

    // CALIBRATION, both halves, and without them this law cannot fail. The placement must be
    // the item-aligned one, and the two candidate numbers must DIFFER — a panel whose
    // one-sided room happens to equal its own height agrees with the defect.
    expect(positioner.getAttribute("data-side"), "not the item-aligned placement").toBe("none");
    const room = parseFloat(getComputedStyle(positioner).getPropertyValue("--available-height"));
    const sized = parseFloat(positioner.style.height);
    expect(sized, "Base UI sized no positioner — there is nothing for a clamp to disagree with").toBeGreaterThan(0);
    expect(
      Math.abs(sized - room),
      `the panel (${sized}px) and the room on one side (${room}px) must differ, or a clamp is invisible`,
    ).toBeGreaterThan(20);

    const target = parseFloat(popup.style.getPropertyValue("--kui-fly-h"));
    expect(
      target,
      `the flight aims at ${target}px — the room on ONE side of the trigger — for a panel Base UI sized at ${sized}px, so it lands at half its height and jumps to full when the flight releases`,
    ).toBeCloseTo(sized, 0);
  });

  it("the width floor is the trigger's LAYOUT box, not the box it is holding a press in (§22)", async () => {
    /**
     * 2026-08-23, the floating-motion audit: this guarantee was held by ONE law, and that law
     * is `watchesFrames` — skipped on CI. Sabotaging `restingAnchorWidth` to return the raw
     * rect left the entire package green on a CI run.
     *
     * `restingAnchorWidth` divides the trigger's rect by its computed scale so the published
     * floor is the LAYOUT box whichever way the panel was opened. An open trigger holds its
     * press and the press is a spring, so which box a measurement lands on depends on the
     * gesture: a pointer press has not started travelling when the entry measures, while a
     * panel opened from STATE is already holding it. Remove the division and a state-opened
     * select settles ~2.5% narrower than the same panel opened by click — 10px on a 400px
     * trigger — and permanently, because `--kui-anchor-w` outlives the flight by design.
     *
     * HERE AND NOT IN MENU'S FILE, which is where it was tried first and where it cannot work:
     * a menu is posed on the mount frame, before the open-press spring has moved anything, so
     * the rect and the layout box are the same number and the division is a no-op. The
     * measurement was added to menu's release-step law, passed under sabotage, and moved. Only
     * `placedByContent` waits long enough for the two to disagree.
     *
     * And it needs no frames: the floor survives the flight, so a settled panel still carries
     * the number the entry published.
     */
    inMotion();
    const host = mount(
      <Theme>
        <div style={{ height: "50vh" }} />
        {/* WIDE on purpose: the anchor floor is only in play above `--floating-min-w`. */}
        <div style={{ width: "400px" }}>
          <Select defaultOpen defaultValue="o1" items={{ o1: "One", o2: "Two" }}>
            <SelectTrigger style={{ width: "100%" }} />
            <SelectContent>
              <SelectItem value="o1">One</SelectItem>
              <SelectItem value="o2">Two</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div style={{ height: "50vh" }} />
      </Theme>,
    );
    const trigger = host.querySelector<HTMLElement>(".kui-select-trigger")!;
    let popup: HTMLElement | undefined;
    await until(() => {
      popup = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop();
      return !!popup && !popup.hidden && !!popup.style.getPropertyValue("--kui-anchor-w");
    }, 3000);

    /**
     * THE CALIBRATION, and it is the whole law: the trigger must be HOLDING its press at the
     * moment the entry measured, or the rect and the layout box are the same number and a
     * missing division is invisible. `defaultOpen` is what produces that state — the same
     * fixture opened by click measures at scale 1 and passes either way.
     */
    const scale = parseFloat(getComputedStyle(trigger).scale) || 1;
    expect(scale, "the trigger is not holding a press — there is no disagreement to catch").toBeLessThan(1);
    const rect = trigger.getBoundingClientRect().width;
    expect(
      Math.abs(trigger.offsetWidth - rect),
      "the pressed rect and the layout box must DIFFER, or this law is about nothing",
    ).toBeGreaterThan(2);

    const published = parseFloat(popup!.style.getPropertyValue("--kui-anchor-w"));
    expect(
      published,
      `the floor was published as ${published}px — the trigger's PRESSED rect (${rect}px) rather than its layout box (${trigger.offsetWidth}px), so a panel opened from state settles that much narrower and stays there`,
    ).toBeCloseTo(trigger.offsetWidth, 0);
  });

  it("the first frame is the trigger's SILHOUETTE, and the panel is measured for the flight", async () => {
    // The silhouette, on the family's second member with zero CSS of its own (2026-08-15,
    // Kushagra: the panel must start "exactly the shape of the trigger, and exactly where
    // the trigger is"; menu.browser.test.tsx carries the recipe's own laws, this asserts
    // the membership): the first frame wears the trigger's box ON the trigger, and the
    // measured destination is what makes the unfurl animatable at all.
    const popup = await openFlying();
    const trigger = document.querySelector<HTMLElement>(".kui-select-trigger")!;
    expect(popup.hasAttribute("data-seed")).toBe(true);
    const box = trigger.getBoundingClientRect();
    const seed = popup.getBoundingClientRect();
    // Within the held press's drift, not to the pixel: the silhouette measures the trigger
    // on the open's first frame, and the trigger then shrinks a hair under the held press —
    // so by the time this law reads both rects, the trigger has moved ~1px out from under
    // its own photograph. The claim is overlay, not simultaneity.
    expect(Math.abs(seed.width - box.width), "the trigger's own width").toBeLessThan(3);
    expect(
      Math.abs(seed.height - box.height),
      `the trigger's own height (blockSize=${computed(popup, "block-size")} seedH=${computed(popup, "--kui-seed-h")} matches=${popup.matches(".kui-surface.kui-floating[data-unfurling][data-seed]")} inline=${popup.style.cssText.slice(0, 260)})`,
    ).toBeLessThan(3);
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
    /**
     * Swept by the transition's own clock rather than by frames (2026-08-20). Sampled once per
     * rAF, "more than two distinct heights" is a claim about how many frames the host could
     * spare: a stalling runner reports the two ends of a perfectly smooth entry, which is
     * exactly what a dead channel reports. The menu's twin died of this three times in one day.
     *
     * `height`, not `block-size` — the logical property resolves before the transition object
     * exists — and the read is the RENDERED box, so a channel that is declared, listed and
     * sprung and then clamped by a floor still reports one value here.
     */
    const popup = await openFlying();
    await until(() => !popup.hasAttribute("data-seed"), 3000);
    const heights = await sweep(popup, "height", () => Math.round(popup.getBoundingClientRect().height));
    expect(new Set(heights).size, `it never moved: ${heights.join(",")}`).toBeGreaterThan(2);
    // It travels from the silhouette to the panel, rather than jittering somewhere in between.
    expect(
      Math.max(...heights) - Math.min(...heights),
      `it moved, but not across a panel's worth of travel: ${heights.join(",")}`,
    ).toBeGreaterThan(20);
  });

  it("it lands with the CHOSEN ROW on the trigger — placed before it is posed (§23)", async () => {
    /**
     * 2026-08-17, Kushagra: *"the selected item always appears on top of trigger 1:1, so that
     * the remainder of the list sits a little above and below the trigger depending on the
     * item's position, like radix."* Base UI's own overlap, pinned OFF on 2026-08-09 and back
     * on now — and the reason it needs a law of its own is that this system nearly broke it by
     * accident twice.
     *
     * Base UI computes the overlap from the panel's REAL box. Pose the panel first and it is
     * measured at the size of its trigger, so the chosen row lands wherever a two-line panel
     * would have put it: measured 66px low. The entry therefore waits for the placement before
     * it poses (system/floating.tsx, `placedByContent`), and the family's pose rules are keyed
     * on the flight rather than on the visibility gate so the seed cannot apply during the
     * wait. Both of those are invisible mechanisms whose only symptom is this number.
     */
    const { popup, trigger } = await openItemAligned();

    // Landed, not mid-flight: the row travels with the panel while it opens — that is the
    // gesture — and the claim is about where it comes to rest.
    const deadline = performance.now() + 3000;
    while (popup.hasAttribute("data-unfurling") && performance.now() < deadline) await frame();
    const chosen = popup.querySelector<HTMLElement>(".kui-select-item[data-selected]")!;
    expect(
      Math.abs(chosen.getBoundingClientRect().top - trigger.getBoundingClientRect().top),
      "the chosen row does not sit on the trigger",
    ).toBeLessThan(4);
    // And the case is a real one: the chosen row is deep enough in the list that a panel
    // hanging below the trigger would put it nowhere near this number.
    expect(popup.getBoundingClientRect().top, "the panel must straddle its trigger").toBeLessThan(
      trigger.getBoundingClientRect().top - 20,
    );
  });

  // EXCLUDED FROM CI 2026-08-21, applying the policy rather than making a new one. Its own
  // sibling three laws down ("the FIRST open flies to the settled width") is already recorded
  // for reading `--kui-anchor-w`, which exists only while the flight does — this law reads the
  // same transient AND the width on the release frame, so it is the same kind and was simply
  // never marked. Failed on CI at 112 against 115.45: the flight had not landed on the frame
  // the loop read. floating-ui converges in wall time, so the clocks cannot be seized and no
  // bound is the fix (KUI_STALL reproduces none of it — the cause is bursty scheduling).
  it("the panel's floor OUTLIVES the flight, so nothing hands it back (§22)", async () => {
    /**
     * The floor is `max(--floating-min-w, --anchor-width)`; `--anchor-width` does not exist
     * until Base UI has placed the panel, so the entry publishes `--kui-anchor-w` and the floor
     * consults that first. The two used to hand over at release and they disagreed — not by
     * arithmetic but by TIME. An open trigger holds its press, the press is a spring, and
     * floating-ui keeps re-measuring the anchor the whole way down: measured on a 400px button,
     * `--anchor-width` walking 400 -> 388 -> 390 over ~350ms while the panel sat at 400, then a
     * 10px snap one frame after the release, ~300ms after the box had visibly stopped.
     *
     * THE MECHANISM IS READ HERE, THE OUTCOME IN menu.browser.test.tsx, and the split is forced
     * by the fixtures: a select's trigger is field-shaped and a field's box does not travel
     * (§8, 2026-08-10), so this file's anchor never scales and there is no step for it to catch
     * — a law that watched for one here would be reading frames to assert something the fixture
     * cannot produce. What this file can say is that the floor is still on the panel after it
     * lands, which is a settled-state reading and needs no frame at all.
     *
     * Its predecessor was degenerate twice over: it opened `openItemAligned()`, whose 57px
     * trigger is discarded by `max(--floating-min-w, anchor)` so the assertion compared 112.000
     * with 112.000, and item-aligned is the one placement where floating-ui FREEZES the anchor
     * measurement, so the two floors agreed by construction. Delete the mechanism entirely and
     * it still passed. It was also excluded from CI for watching frames; this one does not.
     */
    inMotion();
    const { userEvent } = await import("vitest/browser");
    const host = mount(
      <Theme>
        <div style={{ height: "40vh" }} />
        {/* WIDE, and that is the fixture's whole job: narrower than `--floating-min-w` and
            `max(floor, anchor)` discards both numbers under test. */}
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
    // `querySelector` and "the one with data-open" answer somebody else's, whose entry ran
    // under different conditions and may carry no floor at all. Passing alone and failing
    // inside the file is the signature, and it fired twice here.
    const before = new Set(document.querySelectorAll(".kui-select-popup"));
    await userEvent.click(trigger);
    const mine = () =>
      [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].find((el) => !before.has(el)) ??
      null;
    await until(() => !!mine());
    const popup = mine()!;
    // THE FLIGHT IS WAITED FOR, THEN ITS END — never just "not flying". An item-aligned select
    // is placed by its own contents, so its entry waits for the box to hold still before it
    // poses: for several frames after mount the panel has no flight stamp because the flight
    // has not STARTED, and a law that reads "not unfurling" as "landed" reads the floor before
    // anything wrote it. Measured as `--kui-anchor-w: NaN` — inside the file, where the
    // placement resolves item-aligned, and never alone, where it did not.
    expect(
      await until(() => popup.hasAttribute("data-unfurling")),
      "the entry never ran, so there is no floor to outlive it",
    ).toBe(true);
    await until(() => !popup.hasAttribute("data-unfurling"));

    // THE CALIBRATION: without a trigger wider than the family floor, `max()` discards the
    // anchor term and every assertion below holds whatever the entry published.
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

    expect(
      parseFloat(popup.style.getPropertyValue("--kui-anchor-w")),
      "the floor was stripped at release and handed back to a travelling --anchor-width",
    ).toBeCloseTo(triggerWidth, 0);
    // And the panel really is standing on it, rather than merely carrying it.
    expect(popup.getBoundingClientRect().width).toBeGreaterThanOrEqual(triggerWidth - 1);
  });

  it("the flight BORROWS Base UI's inline height and gives it back (§23)", async () => {
    /**
     * An item-aligned select is laid out as `height: 100%` of a positioner the library has
     * sized — that is how the panel fills a constrained box and scrolls the chosen row onto
     * the trigger. An inline declaration beats every rule in a stylesheet, so with it in place
     * the entry's block-size channel is simply dead: measured, the seed height written, the
     * pose matching, and the panel its full height for every frame of an unfurl.
     *
     * The flight takes the property for the length of the entry and puts it back exactly as it
     * was found. Both halves are read, because either one alone is a defect: keeping it means
     * a panel that cannot unfurl, and not restoring it means a settled panel that has lost the
     * layout its own scrolling depends on.
     */
    const { popup } = await openItemAligned();
    const deadline = performance.now() + 3000;
    // The case must be a real one, so the borrowed value is read from the panel BEFORE the
    // claim: a law that assumed "100%" would pass on a library that stopped setting it.
    let seen = "";
    while (performance.now() < deadline) {
      if (popup.hasAttribute("data-unfurling")) {
        expect(popup.style.height, "the flight is fighting an inline height").toBe("");
        seen = "flying";
      } else if (seen) break;
      await frame();
    }
    expect(seen, "the entry never ran, so nothing was borrowed").toBe("flying");
    expect(popup.style.height, "the borrowed height was never given back").toBe("100%");

    /**
     * AND THE POSITIONER'S, which is the other half of the same mechanism (2026-08-22 audit).
     *
     * `height: 100%` above is a fraction OF something, and the something is an inline height
     * Base UI writes on the positioner. The runner pins that element for the flight too — and
     * used to `removeProperty` both names at release, on the premise that the positioner
     * "shrink-wraps the popup", which is true of a menu's and false here. So the panel kept
     * its `100%` and lost what it was 100% OF: measured, 910px inside an 800px window,
     * `clientHeight === scrollHeight` so the list could not be scrolled to, and the chosen row
     * 163px from its trigger. This law read one property of a two-property mechanism, and the
     * one it did not read was the one that was wrong.
     *
     * Read as the OUTCOME as well as the property, because a restored string still permits a
     * panel that does not fit: the box is inside the window and the list is reachable.
     */
    const positioner = popup.parentElement!;
    expect(
      positioner.style.height,
      "the positioner's own height was not given back — the panel is 100% of nothing",
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

  // WATCHES FRAMES: `--kui-anchor-w` exists only while the flight does, so the read has to
  // land inside the flight — the runner strips it at release and the law compares NaN.
  watchesFrames("the FIRST open flies to the settled width — the floor is inside the target (§22)", async () => {
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
    await flushFlight();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop()!;
    const trigger = document.querySelector<HTMLElement>(".kui-select-trigger")!;
    const deadline = performance.now() + 3000;
    while (!popup.hasAttribute("data-unfurling") && performance.now() < deadline) await frame();
    // The rect, not the 360 literal: an open trigger HOLDS THE PRESS, and the press scales it
    // — the anchor floating-ui measures is the scaled box, so the scaled box is the number
    // every claim below is about. The calibration only needs it wider than the content.
    const triggerW = trigger.getBoundingClientRect().width;
    expect(triggerW, "the case needs a trigger wider than the content").toBeGreaterThan(300);
    const target = parseFloat(popup.style.getPropertyValue("--kui-fly-w"));
    // EXACTLY the trigger's LAYOUT width, not 97% of its rendered one (2026-08-22 audit). The
    // old bound was written to tolerate the held press, and the press is ~2.5% — so the slack
    // was precisely the size of the defect the law exists to catch, and a target that missed
    // the floor by the whole disagreement satisfied it.
    //
    // The comment it replaces was wrong about the fixture in a way worth recording: it read
    // the rect "because an open trigger HOLDS THE PRESS", and then compared against 97% of
    // that already-scaled number, discounting the same press twice. And a `defaultOpen` panel
    // does not escape it — measured, scale 0.975 with no pointer ever near the trigger,
    // because the press is a property of being OPEN, not of having been clicked.
    //
    // The floor is the trigger's layout box (system/floating.tsx), so that is what the target
    // must contain. Divided out HERE, where the scale is a fact being read off the element,
    // rather than in the runner, where it was a prediction about a spring that had not moved.
    const scale = parseFloat(getComputedStyle(trigger).scale) || 1;
    const layoutWidth = triggerW / scale;
    expect(target, "the measured target must include the trigger floor").toBeGreaterThanOrEqual(
      layoutWidth - 0.5,
    );
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
    // A STATE, not the statement after the gesture (2026-08-21, the sweep after CI's
    // "the click must have opened it"): a driver gesture resolving is not the browser
    // having settled what the gesture causes. If it never settles, the deadline expires
    // into the same assertion, with the same value in the message.
    await until(() => trigger.matches(":hover"), 2000);
    expect(trigger.matches(":hover"), "the harness must really be hovering").toBe(true);
    const [, y] = computed(trigger, "translate").split(" ");
    expect(parseFloat(y ?? "0"), "it must rise toward the pointer").toBeLessThan(0);
  });

  it("the entry replays on EVERY open, not only the first (§22)", async () => {
    /**
     * Kushagra: *"animation on select only once. Next time, its instant."* The entry ran in
     * the body's ref callback — once per DOM node — and nothing re-ran it for an open the
     * framework served without a fresh mount, which is every reopen of a select (its panel
     * stays mounted after the first open, because the mounted options are its label store).
     * The mechanism begins per OPEN now, observed off Base UI's own stamps.
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
    const first = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop()!;

    // Land the first flight for real — this law is about the SECOND one.
    let deadline = performance.now() + 3000;
    while (first.hasAttribute("data-unfurling") && performance.now() < deadline) await frame();
    expect(first.hasAttribute("data-unfurling"), "the first entry must land").toBe(false);

    await userEvent.keyboard("{Escape}");
    deadline = performance.now() + 3000;
    while (document.querySelector(".kui-select-popup:not([hidden])") && performance.now() < deadline)
      await frame();

    // Base UI ignores a pointer release inside its press-drag window; wait it out (the
    // instrument lesson from this file's own choosing law).
    await new Promise((r) => setTimeout(r, 600));

    /**
     * THE REPLAY IS READ AS AN EVENT, NOT SAMPLED (rewritten 2026-08-20, on CI's own failure:
     * "the flight must end in a released panel: expected null not to be null").
     *
     * The old spelling discovered every fact about the second flight by looking at whatever
     * frames the host happened to paint: it found the seed by catching a frame while the
     * attribute was on, and the release by catching one after it went off. A runner that stalls
     * through a 680ms entry paints neither, and then reports a panel that never landed — which
     * is exactly what a panel that genuinely never lands reports. The two are opposite bugs and
     * no bound on a frame count separates them.
     *
     * A mutation observer is armed before the click instead. It cannot miss the stamps, because
     * they are delivered rather than sampled.
     *
     * THE GESTURE IS ONE CLICK (2026-08-20, on the next three CI failures — "never flew",
     * "silhouette 70 ≤ 36", "panel it ends in is a real one: expected 0"). The rewrite armed
     * the observer before a NEW click and left the old reopen click standing above it, so the
     * law reopened the select twice: the first flight ran before the observer was armed, and
     * the second click landed on an OPEN select and closed it. Which of the three assertions
     * failed was a race between the pose, the observer, and the toggle — reproduced 3/3 under
     * CPU load, in two of the three modes. One gesture, observed from before its first frame,
     * is the law's own premise.
     *
     * THE SILHOUETTE IS READ AT THE DEPART EDGE — `data-seed` leaving while `data-unfurling`
     * stays — not at the seed stamp. A select's pose is finished by writes that land AFTER the
     * stamp (the aim, and the borrowed inline height of an item-aligned panel: floating.tsx),
     * so a read in the stamp's own callback raced them and measured the un-posed box (CI: 70
     * against a 32px trigger). The depart edge is the moment the claim is ABOUT: the box
     * rendered there is the value the flight's transition departs from, however long the next
     * paint takes, and it cannot be read too early because the runner itself defines it.
     *
     * What is NOT claimed here any more is the release seam. It was `|last flying frame −
     * resting|`, and the last flying frame is whichever one the host could spare: a stall puts
     * it anywhere in the entry, so the number was a claim about the machine. The seam has a law
     * of its own that reads it exactly ("the panel's floor is the trigger's RESTING width",
     * above), which is where a claim belongs when one law can measure it and another can only
     * photograph it.
     */
    // THE SUBJECT IS THE ELEMENT THAT FLEW, named by the observer that saw it (CI, one push
    // after the rewrite: "and the panel it ends in is a real one: expected 0 to be greater
    // than 48"). Taking the last `.kui-select-popup` in the document is a guess — this file
    // leaves portalled panels behind, a closed one is kept mounted at zero height, and which
    // node the guess lands on depends on what ran before. The observer already holds the
    // right node, so the guess had no reason to exist.
    let flyer: HTMLElement | null = null;
    const posed = new Set<HTMLElement>();
    const departedFrom = new Map<HTMLElement, number>();
    const watch = new MutationObserver((records) => {
      for (const record of records) {
        const el = record.target as HTMLElement;
        if (!el.classList.contains("kui-select-popup")) continue;
        if (record.attributeName === "data-unfurling" && el.hasAttribute("data-unfurling") && !flyer)
          flyer = el;
        if (record.attributeName !== "data-seed") continue;
        if (el.hasAttribute("data-seed")) posed.add(el);
        else if (el.hasAttribute("data-unfurling") && !departedFrom.has(el))
          departedFrom.set(el, el.getBoundingClientRect().height);
      }
    });
    watch.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-seed", "data-unfurling"],
    });
    onTestFinished(() => watch.disconnect());

    const triggerH = document
      .querySelector<HTMLElement>(".kui-select-trigger")!
      .getBoundingClientRect().height;
    await userEvent.click(document.querySelector<HTMLElement>(".kui-select-trigger")!);
    // 5000, not the usual 3000: an item-aligned reopen legitimately spends up to twelve frames
    // waiting for its placement to hold still before it may pose (floating.tsx), and a stalled
    // runner's frames are the slow thing this deadline is a ceiling over.
    await until(() => flyer !== null && departedFrom.has(flyer!), 5000);
    watch.disconnect();

    expect(flyer, "the second open never flew — the entry ran once per lifetime").not.toBeNull();
    const popup = flyer as unknown as HTMLElement;
    // Anchored to the TRIGGER's height (2026-08-15, the silhouette): the seed is the trigger's
    // own box, so a replayed flight must start down at that height — a flight that begins
    // mid-size means the entry did not replay from its seed. Read off the panel that flew, so
    // a stale panel's pose cannot answer for it.
    expect(posed.has(popup), "the replay never posed — there was no silhouette to fly from").toBe(
      true,
    );
    const silhouette = departedFrom.get(popup);
    expect(silhouette, "the flight departed unobserved — the depart edge never fired").toBeDefined();
    expect(silhouette!, "it must fly FROM the silhouette, not from mid-size").toBeLessThanOrEqual(
      triggerH + 4,
    );

    await until(() => !popup.hasAttribute("data-unfurling"), 3000);
    expect(popup.hasAttribute("data-unfurling"), "the flight must end in a released panel").toBe(false);
    expect(popup.hidden, "and it is the OPEN panel, not a kept-mounted closed one").toBe(false);
    expect(popup.getBoundingClientRect().height, "and the panel it ends in is a real one").toBeGreaterThan(
      triggerH * 1.5,
    );
  });

  it("and it resolves the SAME recipe a menu does — one family, one entry", async () => {
    // The agreement law the promotion owes (ENGINEERING §6: a mechanism with two
    // implementations owes a law that they agree). Read as computed values on both panels,
    // because "select.css adds no motion" is exactly the kind of claim that stays true in the
    // stylesheet while a component quietly re-points a clock. Select's entry differs from a
    // menu's in WHERE IT LANDS and in WHEN IT STARTS — never in what it animates, which is
    // what this reads.
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

  // WATCHES FRAMES: a per-frame sampler over the entry's opening frames, where the damage
  // is done and undone — its own "the law measured nothing" calibration is the CI failure
  // shape ("expected 4 to be greater than 6") one file over.
  watchesFrames("the entry moves neither the page nor the panel's own contents (§8, §22)", async () => {
    /**
     * 2026-08-17, Kushagra: *"why is it on preview page, opening some dropdown menus shift or
     * move the page"*, then *"Select still jumps"*.
     *
     * A select is the only floating member whose open FOCUSES something inside the panel —
     * the selected row — and the browser answers a focus by scrolling that element into view.
     * The entry is flying at that instant: the box is the trigger's silhouette, deliberately
     * far smaller than the list it holds. So the reveal has two things it can scroll and both
     * are wrong. The panel (a scroll container under `overflow: hidden`) takes an offset that
     * nothing settles at and unwinds it frame by frame as the box grows, which reads as the
     * contents sliding; refuse the panel and the browser walks one step up and takes the PAGE
     * instead, which reads as the whole document jumping and STAYS, because the panel travels
     * on and the page keeps what it gained.
     *
     * Both halves are held, in different layers: `overflow: clip` on the flying box
     * (surfaces.css) so there is no offset to take, and the parked page in the runner
     * (system/floating.tsx) so the step up finds nothing to move.
     *
     * THIS LAW READS ONE OF THEM (2026-08-23, the floating-motion audit). It used to claim
     * both. The `spread` assertion below catches the clip and is falsifiable; the `drift`
     * assertion is satisfied by a page that was never pushed, and instrumenting this exact
     * fixture shows the runner's hold listener arming and then receiving zero scroll events —
     * so deleting the runner's whole block leaves this law green. The claim is corrected here
     * rather than the assertion removed, because a page that DOES move is still a failure worth
     * catching; what is not true is that this fixture can prove the mechanism defending against
     * it works. The runner's own comment carries the measurement.
     *
     * The case is calibrated: THIRTY rows with a middle one selected, on a page long enough to
     * scroll, with the trigger mid-viewport. Measured before the fix on the eight-row shape —
     * page 65px, panel scrollTop 57 — and widened 2026-08-22, because eight rows fit the
     * available height and a list that fits never scrolls itself at all: the contents half of
     * this law was asking its question of a panel with no offset to lose. The law asserts the
     * overflow below rather than trusting this paragraph.
     */
    const OPTIONS = Array.from({ length: 30 }, (_, i) => `o${i}`);
    inMotion();
    const container = mount(
      <Theme>
        <div style={{ height: "3000px" }} />
        <Select defaultValue="o15" items={Object.fromEntries(OPTIONS.map((v) => [v, v.toUpperCase()]))}>
          <SelectTrigger />
          <SelectContent>
            {OPTIONS.map((v) => (
              <SelectItem key={v} value={v}>
                {v.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div style={{ height: "3000px" }} />
      </Theme>,
    );
    const trigger = container.querySelector<HTMLElement>(".kui-select-trigger")!;
    // Scrolled with an explicit target and WAITED FOR, not scrollIntoView-and-hope: the
    // harness leaves `scroll-behavior` to the page, so a smooth scroll still in flight reads
    // as a page that cannot scroll at all — the law then skips itself. Poll until the number
    // stops moving.
    // Scrolled with an explicit target and RETRIED until it sticks, not scrollIntoView-and-
    // hope. Run after the rest of this file, the first attempt is reverted to zero — a select
    // unmounted at teardown restores the scroll position its own lock saved, and the entry's
    // own page hold lives for four frames — so a single attempt reads as a page that cannot
    // scroll at all and the law skips itself.
    const target = () =>
      window.scrollY + trigger.getBoundingClientRect().top - window.innerHeight / 2;
    for (let tries = 0; tries < 30 && window.scrollY < 100; tries++) {
      window.scrollTo(0, target());
      await frame();
    }
    await frame();
    const parked = window.scrollY;
    expect(parked, "the case needs a page that CAN scroll").toBeGreaterThan(100);

    // Sampled per frame from before the click, because the damage is done in the entry's first
    // frames and a law that only reads the settled state would have passed on the sliding
    // panel — its offset returns to 0 on its own.
    const drift: number[] = [];
    const inner: number[] = [];
    const rowOffsets: number[] = [];
    const settledRows: number[] = [];
    let sampling = true;
    let landed: HTMLElement | null = null;
    const tick = () => {
      const popup = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop();
      drift.push(Math.abs(window.scrollY - parked));
      // ONLY WHILE THE FLIGHT IS RUNNING (2026-08-22 audit). The first spelling read every
      // frame, which made the claim "this panel's offset is zero, always" — and that is false
      // of a CORRECT item-aligned select: the placement's whole mechanism is a scroll offset
      // that puts the chosen row on the trigger, so a settled panel with a scrolling list is
      // SUPPOSED to carry one. The law codified the defect as a requirement and passed only
      // because eight rows never scrolled. What the entry owes is that the offset is not
      // taken and clamped away WHILE the box is deliberately smaller than its list; what the
      // release owes is that the placement's offset is there at the end. Both are read.
      if (popup?.hasAttribute("data-unfurling")) {
        inner.push(popup.scrollTop);
        // WHERE THE CHOSEN ROW IS, which is the only thing a person can see. Every spelling of
        // this mechanism so far has been read through its own implementation — an offset, a
        // clip, a margin — and each time the law went green on the arrangement it was written
        // beside. The row's distance from the trigger is what the placement PROMISES, and it
        // is the same number whichever way the offset is carried.
        const row = popup.querySelector<HTMLElement>("[data-selected]");
        if (row) rowOffsets.push(row.getBoundingClientRect().top - trigger.getBoundingClientRect().top);
      }
      if (popup && !popup.hasAttribute("data-unfurling") && inner.length) {
        landed = popup;
        const row = popup.querySelector<HTMLElement>("[data-selected]");
        if (row) settledRows.push(row.getBoundingClientRect().top - trigger.getBoundingClientRect().top);
      }
      if (sampling) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const { userEvent } = await import("vitest/browser");
    await userEvent.click(trigger);
    await new Promise((r) => setTimeout(r, 900));
    sampling = false;

    expect(inner.length, "the entry never ran — the law measured nothing").toBeGreaterThan(5);
    expect(Math.max(...drift), `the page moved ${Math.max(...drift)}px`).toBeLessThanOrEqual(1);

    /**
     * THE PANEL'S OWN OFFSET MUST NOT MOVE while the box is deliberately smaller than its list
     * — which is not the same claim as "must be zero", and the difference is 2026-08-22.
     *
     * This read `max(inner) <= 1` until then, which pinned the SPELLING of whichever fix was in
     * the file rather than any guarantee. Zero satisfied it, and zero is what one of the two
     * defects looks like. What the entry owes is that the offset does not CHANGE mid-flight:
     * that catches the browser's reveal taking one and the box clamping it away frame by frame
     * (2026-08-17, 165 → 0), and it catches the clamp that a growing box inflicts on a placement
     * written with the pose (2026-08-22, 21 → 15 → 9 → 3 on a panel constrained by the window's
     * top edge). Zero is still allowed; it is simply no longer sufficient.
     */
    const spread = Math.max(...inner) - Math.min(...inner);
    expect(
      spread,
      `the panel's contents slid ${spread}px during the entry (${Math.min(...inner)} → ${Math.max(...inner)})`,
    ).toBeLessThanOrEqual(1);

    /**
     * …AND THE PLACEMENT IS DELIVERED BY THE FLIGHT, NOT AFTER IT.
     *
     * This is the assertion that survives a change of mechanism, and it exists because three
     * spellings in one day each satisfied a law written beside them. An item-aligned select
     * promises one thing a person can see: the chosen row sits on the value it replaces. So the
     * law reads the ROW, not the offset — its distance from the trigger on the last frame the
     * entry is running. Every failure so far shows up here as the same number:
     *
     *   abolish the offset for the flight  → last flying frame ~374px off (the 48-row list)
     *   clamp it away as the box grows     → ~21px off, snapping home on release
     *   carry it as a margin, released in
     *     the wrong order                  → 0px in flight and 61px off ON the landing frame
     *
     * Read on the last FLYING frame rather than after landing on purpose: a jump is precisely a
     * disagreement between those two, and asserting the settled state alone is what let every
     * one of the three through.
     */
    expect(
      rowOffsets.length,
      "the chosen row was never sampled — the law measured nothing",
    ).toBeGreaterThan(5);
    const landing = Math.abs(rowOffsets[rowOffsets.length - 1]!);
    expect(
      landing,
      `the chosen row was ${Math.round(landing)}px from its trigger on the entry's last frame — the placement arrives after the flight, which is the jump`,
      // SIX, and the number is chosen to sit in the gap rather than at the edge of what passes
      // today. The panel is still settling by a fraction on its last flying frame (measured
      // 2.4px), and the smallest real defect this has ever caught is 21px — so anything from
      // about 5 to 15 separates them. A bound set at what currently passes would fail on the
      // next harmless sub-pixel change and teach whoever hits it to widen the bound.
    ).toBeLessThanOrEqual(6);

    // THE CALIBRATION, and it is what makes the assertions here mean anything: a list that
    // fits its box has no offset to lose, so a still panel there is the fixture agreeing with
    // itself rather than the mechanism working (the eight-row fixture this law shipped with).
    const settledPanel = landed ?? document.querySelector<HTMLElement>(".kui-select-popup")!;
    expect(
      settledPanel.scrollHeight,
      "the fixture's list must OVERFLOW, or the offset under test cannot exist",
    ).toBeGreaterThan(settledPanel.clientHeight);
    // And the offset the placement wrote is on the panel once it has landed — the property the
    // flight borrows the box's overflow to protect.
    expect(
      settledPanel.scrollTop,
      "the placement's own offset did not survive the entry",
    ).toBeGreaterThan(1);

    /**
     * AND NOTHING MOVES AFTER THE ENTRY SAYS IT HAS LANDED (2026-08-22, Kushagra: after it
     * "settles, it scrolls down a bit internally, ever so slightly").
     *
     * The jump and the creep are the same defect at two scales, and fixing the first left the
     * second. An item-aligned select's positioner height is Base UI's, re-solved whenever the
     * popup's size changes — and during the flight the popup's size is a lie by construction,
     * so it re-solved against the lie: 349px before takeoff, 353px by release. The panel then
     * finished growing into the newer parent AFTER the entry was over, and on a scrolling list
     * a box growing is the list's own room shrinking, so the maximum offset fell 21 → 17 and
     * dragged the placement down with it, a pixel at a time.
     *
     * Read as the row, like everything else here, and read for STILLNESS rather than for a
     * value: whatever the panel settles at, it must already be there on the first frame after
     * the flight. A law that only checked the final resting place would pass on a panel that
     * spends 100ms crawling into it, which is exactly what was reported.
     */
    expect(
      settledRows.length,
      "no frames were sampled after the entry landed — the law measured nothing",
    ).toBeGreaterThan(3);
    const creep = Math.max(...settledRows) - Math.min(...settledRows);
    expect(
      creep,
      `the panel kept moving ${creep.toFixed(1)}px after the entry finished (${settledRows[0]!.toFixed(1)} → ${settledRows[settledRows.length - 1]!.toFixed(1)})`,
    ).toBeLessThanOrEqual(1);

    // The offset the panel flew with is deliberately NOT compared to the settled one any more.
    // That assertion was written when the placement was carried as a scroll position for the
    // whole flight; it is now carried as layout while the box is in the air, so the flying
    // offset is legitimately zero and the settled one is not. What that comparison was really
    // asking — did the placement arrive during the flight or after it — is asked directly of
    // the ROW above, in the one unit that survives the mechanism changing under it.
  });

  /**
   * WHAT THIS FILE CANNOT REACH, stated so the next person does not conclude it is covered.
   *
   * The law above runs a 30-row list, and a box that never catches its own content never
   * clamps anything. The failure Kushagra reported on 2026-08-22 needs the MIDDLE case: a list
   * only a little taller than the room it has, which is what a trigger near the top of the
   * window produces. There the entry's scaled content is briefly SHORTER than the growing box,
   * the maximum scroll offset collapses to zero, and whatever the placement was carrying is
   * clamped away and handed back on landing.
   *
   * Two separate repairs passed this file while that was still on screen, and a fixture for it
   * was written and thrown away: an explicit `maxHeight` squeezes the panel but also puts the
   * chosen row out of reach of its trigger, so Base UI stops aligning at all and the law
   * measures a panel that was never item-aligned (settled 225px off — the same number it
   * "failed" with, which is the tell). The real condition is a short VIEWPORT, and this suite
   * pins a wide, tall one on purpose.
   *
   * The SAME GAP covers the creep (2026-08-22, second report): a box still growing after the
   * entry ends steals the offset a pixel at a time, and it only grows where the positioner was
   * re-solved against the shrunken flying box — the constrained case again. Both sabotages for
   * it survive this file, which is stated here rather than left for someone to discover.
   *
   * `Emulation.setDeviceMetricsOverride` over CDP was tried as a way to shrink the window for
   * one law and does not take in this harness, so the door is genuinely shut for now.
   *
   * So both were verified in a real browser instead, on /preview/select at window heights of
   * 420, 500, 620 and 900. The jump: the row drifted 21 → 3 across the flight and snapped back
   * 61px on landing; after, the worst landing error is 4px. The creep: `scrollTop` walked
   * 61 → 57 over ~95ms after the entry finished while the box grew 307 → 311; after, both are a
   * single value at every height and the row settles at 0. Written down because a measurement
   * nobody can re-run is a rumour — the day this suite can set a viewport height, this is the
   * fixture to build, and these are the numbers it should reproduce.
   */


});
