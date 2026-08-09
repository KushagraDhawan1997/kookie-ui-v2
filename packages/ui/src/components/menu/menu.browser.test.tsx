/**
 * Menu's mounted laws (§21, §22) — the 2026-08-03 standard: computed values through a
 * mounted <Theme>, both appearances where colour is the question.
 *
 * This file carries the §20 AGREEMENT LAW the ENGINEERING §2.1 portalling clause names as
 * its enforcement: the portalled popup (and a row inside it) must compute identical to an
 * in-flow twin wearing the same classes and attributes — the two-implementations rule
 * applied to portals. Every hit on a missing subject THROWS (the vacuity bar).
 */
import { afterEach, describe, expect, it } from "vitest";
import { flushSync } from "react-dom";

import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuGroup,
  MenuLabel,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
} from "./menu.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import {
  render,
  computed,
  probeIn,
  tokenOn,
  colorOn,
  forEachCell,
  APPEARANCES,
  DENSITIES,
  type Cell,
} from "../../test/browser.tsx";

/** Every axis off its default — a dropped attribute is visible (the §20 constant). */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  surfaces: "elevated",
  look: "filled",
};

/** Mount an OPEN menu under a themed root; LOUD when the popup never mounts. */
function openMenu(theme: ThemeProps, ui?: React.ReactNode, size?: "1" | "2" | "3" | "4") {
  const host = render(
    <Theme {...theme}>
      <Menu defaultOpen {...(size ? { size } : {})}>
        <MenuTrigger render={<Button {...(size ? { size } : {})}>Open</Button>} />
        <MenuContent>
          {ui ?? (
            <>
              <MenuItem>Alpha</MenuItem>
              <MenuItem>Beta</MenuItem>
            </>
          )}
        </MenuContent>
      </Menu>
    </Theme>,
  );
  // The LAST popup: mounts accumulate within one test (the harness unmounts afterEach),
  // so "the popup" is the one THIS call opened, not the first one any call did. Reading
  // the first was a live bug in this file's own first cut — stale subjects made four laws
  // compare a popup against itself.
  const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the popup never mounted — every law below would assert nothing");
  return { host, popup, items: [...popup.querySelectorAll<HTMLElement>(".kui-menu-item")] };
}

/** The facts an axis reaches on the popup surface. */
function surfaceFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
    border: cs.borderTopColor,
    radius: cs.borderTopLeftRadius,
    padding: cs.paddingTop,
    shadow: cs.boxShadow,
  };
}

/** The facts the control cells reach on a row. */
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
  };
}

afterEach(() => {
  document.documentElement.removeAttribute("data-appearance");
});

/* ── The §20 agreement law ────────────────────────────────────────────────────────────── */

describe("the agreement law: portalled ≡ in-flow (§20, un-marks ENGINEERING §2.1)", () => {
  /** The in-flow twin: the popup's exact classes and attributes, mounted in ordinary flow
      under the same Theme, with the positioner's own variable supplied so min-width
      computes from the same input. */
  function twin(theme: ThemeProps) {
    let popupTwin: HTMLElement | null = null;
    let itemTwin: HTMLElement | null = null;
    render(
      <Theme {...theme}>
        <div
          ref={(n: HTMLDivElement | null) => void (popupTwin = n)}
          className="kui-surface kui-floating kui-menu-popup kui-menu-anchored"
          data-tone="neutral"
          data-emphasis="quiet"
          data-bordered="true"
          style={{ "--anchor-width": "0px" } as React.CSSProperties}
        >
          <div
            ref={(n: HTMLDivElement | null) => void (itemTwin = n)}
            className="kui-control kui-row kui-menu-item"
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

  it("computes identical under the hostile axis set — popup and row", () => {
    const { popup, items } = openMenu(HOSTILE);
    const { popupTwin, itemTwin } = twin(HOSTILE);
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(popupTwin));
    expect(rowFacts(items[0]!)).toEqual(rowFacts(itemTwin));
    // The comparison can fail: the same twin under default axes disagrees on the surface.
    const bare = twin({});
    expect(surfaceFacts(bare.popupTwin)).not.toEqual(surfaceFacts(popupTwin));
  });

  /* The UN-THEMED path (§20, audit 2026-08-09): axes carried on the DOM, no React <Theme>
     anywhere — the standalone path the emitted stylesheet promises and card.browser.test.tsx
     already law-enforces. The wrapper used to re-stamp its context DEFAULTS here, and could
     not tell "nobody chose an appearance" from "someone chose light": measured, a dark
     document opened a white menu. Falsified by making PortalScope render <Theme> always. */
  it("a document that stamps its axes on <html> opens a menu that agrees (§20)", () => {
    document.documentElement.setAttribute("data-appearance", "dark");
    document.documentElement.setAttribute("data-surfaces", "elevated");
    document.documentElement.setAttribute("data-density", "compact");
    try {
      // No <Theme> in the tree at all — the whole point.
      render(
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>,
      );
      const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
      const popup = popups[popups.length - 1];
      if (!popup) throw new Error("the popup never mounted");
      const row = popup.querySelector<HTMLElement>(".kui-menu-item");
      if (!row) throw new Error("no row");

      // The in-flow twin under the SAME document stamps — no Theme on either side.
      let cardEl: HTMLElement | null = null;
      render(<Card ref={(n: HTMLDivElement | null) => void (cardEl = n)}>plain</Card>);
      const card = cardEl as HTMLElement | null;
      if (!card) throw new Error("card twin never mounted");

      // Dark: the popup's seal is the document's, not the default context's white.
      expect(computed(popup, "background-color")).toBe(computed(card, "background-color"));
      // Elevated: the floating cast is the elevated row, not the flat fade.
      expect(computed(popup, "box-shadow")).not.toBe("none");
      // Compact: the row takes the document's density cell, not `default`.
      expect(computed(row, "min-height")).toBe(tokenOn(popup, "--control-height-2"));
      expect(computed(row, "min-height")).toBe(tokenOn(card, "--control-height-2"));
    } finally {
      document.documentElement.removeAttribute("data-surfaces");
      document.documentElement.removeAttribute("data-density");
    }
  });

  it("carries contrast=high through the portal", () => {
    const { popup } = openMenu({ appearance: "light", contrast: "high" });
    const { popupTwin } = twin({ appearance: "light", contrast: "high" });
    expect(popup.closest(".kui-theme")!.getAttribute("data-contrast")).toBe("high");
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(popupTwin));
  });
});

/* ── Row geometry: the family rides the control cells (§21) ───────────────────────────── */

describe("rows ride the existing control cells in all 24 cells (§21)", () => {
  function cellRow({ size, density, pointer }: Cell) {
    const { items, popup } = openMenu({ density, pointer }, undefined, size);
    return { row: items[0]!, popup };
  }

  it("min-height, padding, gap, font and corner are the control family's, per cell", () => {
    forEachCell((cell) => {
      const { row, popup } = cellRow(cell);
      const label = `${cell.pointer}/${cell.density}/${cell.size}`;
      expect(computed(row, "min-height"), label).toBe(tokenOn(popup, `--control-height-${cell.size}`));
      // Rows have no leading slot in this mount, so the pill-side padding applies (the
      // control skeleton's own rule — the row adds nothing).
      expect(computed(row, "font-size"), label).toBe(tokenOn(popup, `--font-size-${cell.size}`));
      expect(computed(row, "gap"), label).toBe(tokenOn(popup, `--control-gap-${cell.size}`));
      expect(computed(row, "border-top-left-radius"), label).toBe(
        tokenOn(popup, `--radius-control-${cell.size}`),
      );
      // Full width: the row spans the panel's content box exactly.
      expect(row.getBoundingClientRect().width, label).toBeCloseTo(
        popup.clientWidth - parseFloat(computed(popup, "padding-left")) * 2,
        0,
      );
    });
  });
});

/* ── States, both appearances (§21) ───────────────────────────────────────────────────── */

describe("row states are the quiet rung's, driven by the highlight attribute (§21)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: highlighted paints the quiet-hover fill; un-highlighted rest is transparent`, () => {
      const { popup, items } = openMenu({ appearance });
      // Base UI highlights on keyboard: ArrowDown from the open popup lands on Alpha.
      popup.focus();
      flushSync(() => {
        popup.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      });
      const [alpha, beta] = items;
      if (!alpha || !beta) throw new Error("rows missing");
      expect(alpha.hasAttribute("data-highlighted"), "ArrowDown highlighted the first row").toBe(true);
      expect(computed(alpha, "background-color")).toBe(colorOn(popup, "var(--tone-soft)"));
      // The un-highlighted sibling rests transparent — quiet's rest, the stand-down's proof.
      expect(computed(beta, "background-color")).toBe("rgba(0, 0, 0, 0)");
    });

    it(`${appearance}: destructive ink, disabled remap, checked accent — computed, not claimed`, () => {
      const { popup } = openMenu({ appearance }, (
        <>
          <MenuItem tone="destructive">Delete</MenuItem>
          <MenuItem disabled>Dead</MenuItem>
          <MenuCheckboxItem defaultChecked>Ticked</MenuCheckboxItem>
          <MenuCheckboxItem defaultChecked disabled>Dead ticked</MenuCheckboxItem>
        </>
      ));
      const [destructive, dead] = [...popup.querySelectorAll<HTMLElement>(".kui-menu-item")];
      const [ticked, deadTicked] = [...popup.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]')] as HTMLElement[];
      if (!destructive || !dead || !ticked || !deadTicked) throw new Error("rows missing");
      // Destructive: the tone indirection re-scopes the label — red ink at rest.
      expect(computed(destructive, "color")).toBe(colorOn(popup, "var(--destructive-label)"));
      // Disabled: the shared arm's remap (neutral-8 label + disabled cursor), zero menu CSS.
      expect(computed(dead, "color")).toBe(colorOn(popup, "var(--neutral-8)"));
      expect(computed(dead, "cursor")).toBe(
        probeIn(popup, (el) => (el.style.cursor = "var(--cursor-disabled)"), (cs) => cs.cursor),
      );
      // Checked speaks accent — the family's ON ink, indicator included via currentColor.
      expect(computed(ticked, "color")).toBe(colorOn(popup, "var(--accent-label)"));
      // And DEAD checked dims: the :where() spelling is what lets the disabled arm win.
      expect(computed(deadTicked, "color")).toBe(colorOn(popup, "var(--neutral-8)"));
      // The reserved gutter: the unchecked twin of a checkable row keeps its slot box.
      const indicator = ticked.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!indicator) throw new Error("indicator slot missing");
      expect(indicator.getBoundingClientRect().width).toBeGreaterThan(0);
    });
  }

  it("a checkable row hides its indicator when unchecked — visibility, so the gutter holds", () => {
    const { popup } = openMenu({}, <MenuCheckboxItem>Unticked</MenuCheckboxItem>);
    const indicator = popup.querySelector<HTMLElement>('[data-slot="leading"]');
    if (!indicator) throw new Error("indicator slot missing");
    expect(indicator.hasAttribute("data-unchecked")).toBe(true);
    expect(computed(indicator, "visibility")).toBe("hidden");
    expect(indicator.getBoundingClientRect().width).toBeGreaterThan(0);
  });
});

describe("rows wear content dress, not button dress (§21)", () => {
  it("a row's weight is regular — and a Button's beside it stays medium", () => {
    // The TextField value's sentence one family over: medium is a BUTTON-label decision,
    // and a row is a line in a list you read. The negative half keeps the law honest —
    // if the skeleton ever went regular wholesale, this would be asserting nothing.
    const { items, popup } = openMenu({});
    const weight = (name: string) =>
      probeIn(popup, (el) => (el.style.fontWeight = `var(${name})`), (cs) => cs.fontWeight);
    expect(computed(items[0]!, "font-weight")).toBe(weight("--font-weight-regular"));
    const trigger = document.querySelector<HTMLElement>(".kui-button");
    if (!trigger) throw new Error("trigger missing");
    expect(computed(trigger, "font-weight")).toBe(weight("--font-weight-medium"));
  });
});

/* ── The popup surface (§22) ──────────────────────────────────────────────────────────── */

describe("the popup: smallest surface corner, floating cast in BOTH worlds, glass (§22)", () => {
  it("border-radius is surface-1 at every radius level — and never the overlay's (judged 2026-08-09)", () => {
    // The overlay band was the shipped first cut and Kushagra rejected it on sight: 24px is
    // priced against a DIALOG's box, and a menu panel holds a far larger fraction of it —
    // the fraction wall, caught at the eye pass. surface-1 is the smallest surface corner
    // for the smallest surface, and the concentric answer (row corner + panel padding).
    for (const radius of ["none", "small", "medium", "large", "full"] as const) {
      const { popup } = openMenu({ radius });
      const surface1 = tokenOn(popup, "--radius-surface-1");
      expect(computed(popup, "border-top-left-radius"), radius).toBe(surface1);
      // The rejected candidate stays rejected: never the overlay corner, where they differ.
      const overlay = tokenOn(popup, "--radius-overlay");
      if (overlay !== surface1) {
        expect(computed(popup, "border-top-left-radius"), radius).not.toBe(overlay);
      }
    }
  });

  it("padding and min-width are the menu's own designed tokens", () => {
    const { popup } = openMenu({});
    expect(computed(popup, "padding-top")).toBe(tokenOn(popup, "--menu-p"));
    expect(popup.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      parseFloat(tokenOn(popup, "--menu-min-w")),
    );
  });

  /* The floor's ANCHOR half, which had no law at all: the shipped assertion above is entailed
     by the max() floor, so deleting the --anchor-width term left the whole suite green (audit
     2026-08-09). Both directions, because the defect was that the term reached a panel it
     should not: a wide TRIGGER must widen its menu, and a wide PARENT PANEL must not widen
     its submenu. --anchor-width is supplied directly rather than awaited, so the law states
     the rule instead of racing the positioner's first measurement. */
  it("a wide trigger widens its menu; a wide panel does not widen its submenu (§22)", () => {
    const { popup } = openMenu({});
    const floor = parseFloat(tokenOn(popup, "--menu-min-w"));
    const wide = `${floor + 240}px`;

    // The anchored panel takes the anchor when it is wider than the floor...
    popup.style.setProperty("--anchor-width", wide);
    expect(computed(popup, "min-width")).toBe(wide);
    // ...and keeps the floor when the anchor is narrower — max(), not "whatever the anchor is".
    popup.style.setProperty("--anchor-width", "10px");
    expect(parseFloat(computed(popup, "min-width"))).toBe(floor);

    // The child panel ignores it entirely: its anchor is a row, not a trigger.
    const { popup: sub } = openMenu({}, (
      <MenuSub defaultOpen>
        <MenuSubTrigger>Export as</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>PNG</MenuItem>
        </MenuSubContent>
      </MenuSub>
    ));
    const child = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop()!;
    if (child === sub && !child.querySelector(".kui-menu-item")) throw new Error("no child panel");
    expect(child.classList.contains("kui-menu-anchored")).toBe(false);
    child.style.setProperty("--anchor-width", wide);
    expect(parseFloat(computed(child, "min-width")), "a submenu must not inherit panel width").toBe(
      floor,
    );
  });

  it("the popup casts in BOTH worlds — and a flat Card beside it still does not (§11 amended)", () => {
    for (const surfaces of ["elevated", "flat"] as const) {
      let card: HTMLElement | null = null;
      render(
        <Theme surfaces={surfaces}>
          <Card ref={(n: HTMLDivElement | null) => void (card = n)}>plain</Card>
        </Theme>,
      );
      const { popup } = openMenu({ surfaces });
      const cast = computed(popup, "box-shadow");
      expect(cast, `${surfaces} popup casts`).not.toBe("none");
      if (surfaces === "flat") {
        // The flat world's popup cast is the QUIETER derived value, not elevated's...
        const { popup: elevatedPopup } = openMenu({ surfaces: "elevated" });
        expect(cast).not.toBe(computed(elevatedPopup, "box-shadow"));
        // ...and the flat world itself is intact: the card beside the menu casts nothing.
        expect(computed(card!, "box-shadow"), "flat Card must stay flat").toBe("none");
      }
    }
  });

  it("a glass popup keeps the floating cast in both worlds — coverage outranks transmission", () => {
    for (const surfaces of ["elevated", "flat"] as const) {
      const { popup: solidPopup } = openMenu({ surfaces });
      const solidShadow = computed(solidPopup, "box-shadow");
      // Fresh mount with glass: the filter engages, the fill goes translucent, and the
      // cast is byte-identical to the solid popup's — the floating chrome, not the
      // transmitted row (which is none in flat, where this assertion has teeth).
      let glass: HTMLElement | null = null;
      render(
        <Theme surfaces={surfaces}>
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent
              material="thin"
              ref={(n: HTMLDivElement | null) => void (glass = n)}
            >
              <MenuItem>Alpha</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>,
      );
      if (!glass) throw new Error("glass popup never mounted");
      const g = glass as HTMLElement;
      expect(computed(g, "backdrop-filter"), surfaces).not.toBe("none");
      expect(computed(g, "box-shadow"), `${surfaces} glass cast`).toBe(solidShadow);
    }
  });
});

/* ── Behavior smoke (Base UI's machine, one assertion per claim) ──────────────────────── */

describe("behavior: the platform's menu, not a styled div", () => {
  it("roles are the menu pattern's; Escape closes and unmounts the popup", async () => {
    const { popup, items } = openMenu({});
    expect(popup.getAttribute("role")).toBe("menu");
    expect(items[0]!.getAttribute("role")).toBe("menuitem");
    // A real key through the browser's event pipeline — a synthetic dispatch is not
    // trusted by the dismissal machinery, and a law that presses a key nobody pressed
    // proves nothing about the menu a user closes.
    const { userEvent } = await import("vitest/browser");
    popup.focus();
    await userEvent.keyboard("{Escape}");
    expect(document.querySelector(".kui-menu-popup")).toBeNull();
  });

  it("a radio item stamps data-checked after selection", () => {
    const { popup } = openMenu({}, (
      <MenuRadioGroup defaultValue="b">
        <MenuRadioItem value="a">A</MenuRadioItem>
        <MenuRadioItem value="b">B</MenuRadioItem>
      </MenuRadioGroup>
    ));
    const [a, b] = [...popup.querySelectorAll<HTMLElement>('[role="menuitemradio"]')];
    if (!a || !b) throw new Error("radio rows missing");
    expect(b.hasAttribute("data-checked")).toBe(true);
    expect(a.hasAttribute("data-checked")).toBe(false);
  });

  it("submenu: the sub trigger row exists, and its open state lights it through the shared rule", async () => {
    const { popup } = openMenu({}, (
      <MenuSub defaultOpen>
        <MenuSubTrigger>More</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>Nested</MenuItem>
        </MenuSubContent>
      </MenuSub>
    ));
    // The settled-frame lesson (Slider, 2026-08-06): Base UI stamps the trigger's open
    // state after first layout — a synchronous read lands one frame early and the law
    // would skip itself.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    // NOT popup.querySelector: with the child panel open, "the last popup" IS the child,
    // and its first row is "Nested". The sub trigger is the row that owns a popup —
    // queried by the contract that makes it one.
    const sub = document.querySelector<HTMLElement>('.kui-menu-item[aria-haspopup="menu"]');
    if (!sub) throw new Error("sub trigger missing");
    expect(sub.hasAttribute("data-popup-open")).toBe(true);
    expect(computed(sub, "background-color")).toBe(colorOn(popup, "var(--tone-soft)"));
    // The child panel mounted, re-themed, wearing the same popup identity.
    const panels = document.querySelectorAll(".kui-menu-popup");
    expect(panels.length).toBe(2);
  });

  it("the trigger composes a real Button: one element, both contracts", () => {
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<Button emphasis="medium">Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const trigger = document.querySelector<HTMLButtonElement>(".kui-button");
    if (!trigger) throw new Error("trigger never mounted");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    // Clicking it opens the menu — the two render layers actually merged.
    flushSync(() => {
      trigger.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
      trigger.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      trigger.click();
    });
    expect(document.querySelector(".kui-menu-popup")).not.toBeNull();
  });

  /* The a11y contract Base UI branches on `nativeButton` (audit 2026-08-09). Unforwarded,
     it defaults true and an anchor trigger shipped `type="button"` plus an inert `disabled`
     with no `aria-disabled` — the Button defect of 2026-08-03, re-shipped. Read off the DOM,
     because the attribute is the thing that was wrong; falsified by deleting the
     `nativeButton={isNativeButton}` line, which restores `type="button"` on both anchors. */
  it("infers nativeButton from `render`: an anchor trigger is not a button (§5)", () => {
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<a href="/settings" />}>Settings</MenuTrigger>
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const link = document.querySelector<HTMLAnchorElement>('a[href="/settings"]');
    if (!link) throw new Error("anchor trigger never mounted");
    // `type` on an <a> is the linked resource's MIME type — a factually wrong attribute.
    expect(link.hasAttribute("type")).toBe(false);
    expect(link.getAttribute("role")).toBe("button");
    expect(link.getAttribute("aria-haspopup")).toBe("menu");
  });

  it("a disabled anchor trigger is announced disabled, not silently dead (§5)", () => {
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<a href="/settings" />} disabled>
            Settings
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const link = document.querySelector<HTMLAnchorElement>('a[href="/settings"]');
    if (!link) throw new Error("anchor trigger never mounted");
    // `disabled` is inert on an anchor: the non-native branch owes aria-disabled and must
    // take the element out of the tab order rather than leaving it focusable and dead.
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.hasAttribute("disabled")).toBe(false);
  });

  it("the nested blessed shape: one anchor, one contract, no disagreement (§5)", () => {
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<Button render={<a href="/docs" />}>Docs</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const link = document.querySelector<HTMLAnchorElement>('a[href="/docs"]');
    if (!link) throw new Error("nested anchor trigger never mounted");
    // Before the fix this node wore Button's role="button" AND MenuTrigger's type="button".
    expect(link.hasAttribute("type")).toBe(false);
    expect(link.getAttribute("role")).toBe("button");
  });

  it("a real button trigger keeps the native contract (the negative control)", () => {
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<Button>Open</Button>} disabled />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const trigger = document.querySelector<HTMLButtonElement>(".kui-button");
    if (!trigger) throw new Error("trigger never mounted");
    expect(trigger.tagName).toBe("BUTTON");
    // A native button takes the inert attribute and NO role/aria-disabled — the branch the
    // inference must not flip for the ordinary case.
    expect(trigger.hasAttribute("disabled")).toBe(true);
    expect(trigger.getAttribute("role")).toBeNull();
  });
});

/* ── The focused row (§8, §21) ────────────────────────────────────────────────────────── */

describe("a focused row's ring survives the panel that scrolls it (§8)", () => {
  /* `overflow-y: auto` makes the popup a scroll container, which clips descendant ink at the
     PADDING box in BOTH axes (a `visible` on the other axis computes to `auto`). The ring a
     row paints reaches width+offset outside its border box, so the panel's padding is what
     decides whether it exists — and at compact density it did not: measured 0 red pixels on
     the left and right of every row, and the first row's top band gone too. Density is the
     axis that moves it, so the law walks all three; the assertion is the ring's EXTENT
     against the padding box rather than a colour, because the ring was painting correctly
     and being cut. Falsified by restoring `--kui-sf-p: var(--menu-p)`. */
  it("the ring's outer extent lies inside the panel's padding box, every density", () => {
    for (const density of DENSITIES) {
      const { popup, items } = openMenu({ density });
      const row = items[0]!;
      row.focus();
      const reach =
        parseFloat(computed(row, "outline-width")) + parseFloat(computed(row, "outline-offset"));
      // Calibration: a ring that does not exist cannot be clipped, and would pass vacuously.
      expect(reach, `${density}: no ring to contain`).toBeGreaterThan(0);
      expect(computed(row, "outline-style"), density).toBe("solid");

      const pad = parseFloat(computed(popup, "padding-left"));
      expect(pad, `${density}: the panel must clear the ring`).toBeGreaterThanOrEqual(reach);
      // Both axes, because both are clipped — the one-sided-law lesson (Progress, 2026-08-08).
      expect(parseFloat(computed(popup, "padding-top")), density).toBeGreaterThanOrEqual(reach);
    }
  });

  /* The lit row is a signal, not resting dress, so the conformance surface must reach it
     (§19's rule, amended 2026-08-09). Falsified by deleting the [data-contrast="high"] arm. */
  it("contrast=high moves the lit fill, in both appearances (§19)", () => {
    for (const appearance of APPEARANCES) {
      const normal = openMenu({ appearance });
      const high = openMenu({ appearance, contrast: "high" });
      const lit = (m: ReturnType<typeof openMenu>) => {
        const row = m.items[0]!;
        row.setAttribute("data-highlighted", "");
        return computed(row, "background-color");
      };
      const before = lit(normal);
      const after = lit(high);
      // The ink follows the fill: a fill that moves under ink that does not is the half-fix.
      expect(computed(high.items[0]!, "color"), appearance).toBe(
        colorOn(high.popup, "var(--tone-contrast)"),
      );
      // Calibration: the normal-mode fill is a real colour, not the transparent rest.
      expect(before, appearance).toBe(colorOn(normal.popup, "var(--tone-soft)"));
      expect(after, `${appearance}: high contrast must move the highlight`).not.toBe(before);
      expect(after, appearance).toBe(colorOn(high.popup, "var(--tone-solid)"));
    }
  });
});

/* ── Direction (§20) ──────────────────────────────────────────────────────────────────── */

describe("direction crosses the portal, in both layers (§20)", () => {
  /** Mount inside an RTL subtree — the mixed-direction shape, where CSS direction does NOT
      reach a body-level portal on its own. */
  function inRtlSubtree(ui: React.ReactNode) {
    const host = render(
      <Theme>
        <div dir="rtl">{ui}</div>
      </Theme>,
    );
    const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
    const popup = popups[popups.length - 1];
    if (!popup) throw new Error("the popup never mounted");
    return { host, popup };
  }

  it("a portalled panel takes its author's direction, not the document's (§20)", () => {
    const { host, popup } = inRtlSubtree(
      <Menu defaultOpen>
        <MenuTrigger render={<Button>Open</Button>} />
        <MenuContent>
          <MenuItem trailing={<span>⌘D</span>}>Duplicate</MenuItem>
        </MenuContent>
      </Menu>,
    );
    // Calibration: the app really is RTL, and the document really is not — without both,
    // the assertion below could pass for the wrong reason.
    expect(computed(host.querySelector("div[dir]")!, "direction")).toBe("rtl");
    expect(computed(document.body, "direction")).toBe("ltr");

    expect(computed(popup, "direction")).toBe("rtl");
    // And the row's trailing slot moved to the physical LEFT — the margin is logical, so
    // this is the mirroring actually arriving rather than the attribute merely being set.
    const row = popup.querySelector<HTMLElement>(".kui-menu-item")!;
    const trailing = row.querySelector<HTMLElement>('[data-slot="trailing"]')!;
    const rowBox = row.getBoundingClientRect();
    const slotBox = trailing.getBoundingClientRect();
    expect(slotBox.left - rowBox.left).toBeLessThan(rowBox.width / 2);
  });

  it("an LTR app is unmoved — the trailing slot stays at the physical right", () => {
    const { popup } = openMenu({}, <MenuItem trailing={<span>⌘D</span>}>Duplicate</MenuItem>);
    expect(computed(popup, "direction")).toBe("ltr");
    const row = popup.querySelector<HTMLElement>(".kui-menu-item")!;
    const trailing = row.querySelector<HTMLElement>('[data-slot="trailing"]')!;
    const rowBox = row.getBoundingClientRect();
    const slotBox = trailing.getBoundingClientRect();
    expect(slotBox.left - rowBox.left).toBeGreaterThan(rowBox.width / 2);
  });

  it("the chevron points the way the submenu opens", () => {
    const { popup } = inRtlSubtree(
      <Menu defaultOpen>
        <MenuTrigger render={<Button>Open</Button>} />
        <MenuContent>
          <MenuSub>
            <MenuSubTrigger>Export as</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>PNG</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>,
    );
    const chevron = popup.querySelector<HTMLElement>(".kui-menu-chevron");
    if (!chevron) throw new Error("chevron missing");
    // A mirrored glyph, not a re-drawn one: the transform is the whole mechanism.
    expect(computed(chevron, "transform")).toBe("matrix(-1, 0, 0, 1, 0, 0)");
    // The LTR control leaves it alone.
    const { popup: ltr } = openMenu({}, (
      <MenuSub>
        <MenuSubTrigger>Export as</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>PNG</MenuItem>
        </MenuSubContent>
      </MenuSub>
    ));
    expect(computed(ltr.querySelector(".kui-menu-chevron")!, "transform")).toBe("none");
  });

  it("a submenu opens toward the inline end — leftward under RTL (§20)", async () => {
    async function sides(dir: "ltr" | "rtl") {
      const host = render(
        <Theme>
          <div dir={dir} style={{ display: "flex", justifyContent: "center" }}>
            <Menu defaultOpen>
              <MenuTrigger render={<Button>Open</Button>} />
              <MenuContent>
                <MenuSub defaultOpen>
                  <MenuSubTrigger>Export as</MenuSubTrigger>
                  <MenuSubContent>
                    <MenuItem>PNG</MenuItem>
                  </MenuSubContent>
                </MenuSub>
              </MenuContent>
            </Menu>
          </div>
        </Theme>,
      );
      // The settled-frame lesson: Base UI positions after first layout, and the direction
      // itself lands one commit late (it is measured off the trigger).
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 60));
      const panels = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")];
      if (panels.length < 2) throw new Error(`${dir}: the child panel never mounted`);
      const [parent, child] = panels.slice(-2) as [HTMLElement, HTMLElement];
      return { host, parent: parent.getBoundingClientRect(), child: child.getBoundingClientRect() };
    }

    const ltr = await sides("ltr");
    expect(ltr.child.left, "ltr: the child opens to the right").toBeGreaterThan(ltr.parent.left);

    const rtl = await sides("rtl");
    // Before DirectionProvider was rendered, this measured child.left 875 against
    // parent.right 880 — the same rightward open as LTR, overlapping the parent panel.
    expect(rtl.child.left, "rtl: the child opens to the left").toBeLessThan(rtl.parent.left);
  });
});

/* ── Group semantics ──────────────────────────────────────────────────────────────────── */

describe("groups and labels: the wiring is Base UI's, the dress is the row's", () => {
  it("a label names its group via aria-labelledby, reads faint, and takes no pointer", () => {
    const { popup } = openMenu({}, (
      <MenuGroup>
        <MenuLabel>Section</MenuLabel>
        <MenuItem>Row</MenuItem>
      </MenuGroup>
    ));
    const group = popup.querySelector<HTMLElement>('[role="group"]');
    const label = popup.querySelector<HTMLElement>(".kui-menu-label");
    if (!group || !label) throw new Error("group or label missing");
    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
    expect(computed(label, "color")).toBe(colorOn(popup, "var(--color-text-faint)"));
    expect(computed(label, "pointer-events")).toBe("none");
  });

  /* The shadcn shape — a label as a direct child of Content, above the first group — is what
     this component's header says it adopted, and Base UI's GroupLabel throws unconditionally
     without a group context, in BOTH builds. Mounted OPEN, because the throw fires when the
     portal renders, not at mount: a render-only check walks straight past it. Falsified by
     restoring the bare `BaseMenu.GroupLabel`, which takes the whole root down here. */
  it("a label outside a group is a heading, not a crash (§22)", () => {
    const { popup } = openMenu({}, (
      <>
        <MenuLabel>My Account</MenuLabel>
        <MenuItem>Profile</MenuItem>
      </>
    ));
    const label = popup.querySelector<HTMLElement>(".kui-menu-label");
    if (!label) throw new Error("standalone label missing");
    // Same dress as the in-group label — the skeleton is the row's either way.
    expect(computed(label, "color")).toBe(colorOn(popup, "var(--color-text-faint)"));
    expect(computed(label, "pointer-events")).toBe("none");
    expect(computed(label, "min-height")).toBe(tokenOn(popup, "--control-height-2"));
    // It is a heading, not a menu row: nothing announces it as an item.
    expect(label.getAttribute("role")).toBeNull();
    // And the rows around it still work — the popup did not lose its subtree.
    expect(popup.querySelectorAll(".kui-menu-item").length).toBe(1);
  });

  it("a label inside a radio group keeps the group wiring (§22)", () => {
    const { popup } = openMenu({}, (
      <MenuRadioGroup defaultValue="a">
        <MenuLabel>Sort by</MenuLabel>
        <MenuRadioItem value="a">Name</MenuRadioItem>
      </MenuRadioGroup>
    ));
    const group = popup.querySelector<HTMLElement>('[role="group"]');
    const label = popup.querySelector<HTMLElement>(".kui-menu-label");
    if (!group || !label) throw new Error("radio group or label missing");
    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
  });
});
