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
import { userEvent } from "@vitest/browser/context";

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
import { render, computed, probeIn, tokenOn, colorOn } from "../../test/browser.tsx";

/** Every axis off its default — a dropped attribute is visible (the §20 constant). */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  surfaces: "elevated",
  look: "filled",
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

  it("the chevron is a muted adornment in the trigger's own icon box", () => {
    const { trigger } = mountPair({});
    const slot = trigger.querySelector<HTMLElement>('[data-slot="trailing"]');
    if (!slot) throw new Error("chevron slot missing");
    expect(computed(slot, "color")).toBe(colorOn(trigger, "var(--color-text-muted)"));
    const svg = slot.querySelector("svg")!;
    expect(computed(svg as unknown as HTMLElement, "width")).toBe(tokenOn(trigger, "--icon-size-2"));
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

  it("padding is the floating panel's ring-floored pick, and the floor holds against a wide trigger", async () => {
    const { popup } = openSelect({});
    await settled();
    const floatingP = parseFloat(tokenOn(popup, "--floating-p"));
    const ring =
      parseFloat(tokenOn(popup, "--focus-ring-width")) +
      parseFloat(tokenOn(popup, "--focus-ring-offset"));
    expect(parseFloat(computed(popup, "padding-top"))).toBeCloseTo(Math.max(floatingP, ring), 1);
    // The anchor floor: never narrower than the designed floor, and a wide trigger widens it.
    expect(popup.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      parseFloat(tokenOn(popup, "--floating-min-w")),
    );
    popup.style.setProperty("--anchor-width", "300px");
    expect(popup.getBoundingClientRect().width).toBeGreaterThanOrEqual(300);
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
