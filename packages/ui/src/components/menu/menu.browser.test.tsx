/**
 * Menu's mounted laws (§21, §22) — the 2026-08-03 standard: computed values through a
 * mounted <Theme>, both appearances where colour is the question.
 *
 * This file carries the §20 AGREEMENT LAW the ENGINEERING §2.1 portalling clause names as
 * its enforcement: the portalled popup (and a row inside it) must compute identical to an
 * in-flow twin wearing the same classes and attributes — the two-implementations rule
 * applied to portals. Every hit on a missing subject THROWS (the vacuity bar).
 *
 * WHAT THAT LAW CAN AND CANNOT SEE (stated 2026-08-09, audit). Its fact lists are properties
 * the token CASCADE delivers, and the wrapper re-stamps the cascade by construction — so on
 * its own it can only ever catch ONE mistake, a dropped stamp, and it was blind to every
 * portal defect the audit found. It has since gained the one comparable fact a portal really
 * does change (`direction`, under an RTL arm — it would have failed before RTL shipped), and
 * everything else a portal supplies rather than inherits now has its own named law below:
 * the un-themed path, tier resolution, the anchor-width floor, the submenu seam. An
 * agreement law is a floor, not the whole enforcement, and pretending otherwise is how nine
 * of fourteen findings sat behind a green suite.
 */
import * as React from "react";
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
import { Box } from "../box/box.tsx";
import { Card } from "../card/card.tsx";
import { Kbd } from "../kbd/kbd.tsx";
import { Separator } from "../separator/separator.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import {
  DEPTHS,
  render as mount,
  inMotion,
  computed,
  probeIn,
  tokenOn,
  colorOn,
  ownColor,
  forEachCell,
  APPEARANCES,
  DENSITIES,
  renderSettled,
  settle,
  flushFlight,
  asksForStillness,
  type Cell,
} from "../../test/browser.tsx";

/** Every axis off its default — a dropped attribute is visible (the §20 constant). */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  depth: "elevated",
  surfaceLook: "filled",
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
  settle(popup);
  return { host, popup, items: [...popup.querySelectorAll<HTMLElement>(".kui-menu-item")] };
}

/**
 * Land the panel (§22, added 2026-08-09 with motion).
 *
 * Every law below this line is about a panel that HAS ARRIVED — its corner, its rows'
 * geometry, what the portal carried. A synchronous mount reads the entry's first frame
 * instead: the seed attribute is written in the mount commit and comes off a frame
 * later, so the popup these laws grab is a 40px seed, and the row-cell law duly measured a
 * two-line row at 68px against its 42px cell. This is the instrument-calibration lesson from
 * the Slider and Select rounds — a law that reads the wrong moment is not measuring the thing
 * it names.
 *
 * It does by hand exactly what the shipped reduced-motion block does — drop the seed, pin the
 * transitions — rather than waiting 480ms in 24 cells. The motion laws use `openUnsettled`
 * and never come through here.
 */

/**
 * The file's own `render`, and it shadows the harness's on purpose: EVERY law here is about a
 * panel that has arrived, and several mount their own menu rather than going through
 * `openMenu` — which is how three of them read a mid-flight box (a row measured 12px against
 * its 24px cell, exactly the body's 0.5 squish). Landing the panel at the mount point means a
 * new law cannot forget to. `openUnsettled` calls the harness's directly.
 */
const render = renderSettled;

/** The same mount with the entry left alone — the subject of the motion laws. */
async function openUnsettled(theme: ThemeProps = {}, ui?: React.ReactNode, size?: "1" | "2" | "3" | "4") {
  mount(
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
  const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the popup never mounted — every law below would assert nothing");
  // These laws are ABOUT the entry, so they opt out of the harness's stillness (test/browser).
  inMotion();
  // The runner poses SYNCHRONOUSLY and measures a microtask later (unified 2026-08-16: a ref
  // callback runs before the commit's layout effects, so a synchronous measurement can read a
  // half-laid-out sliver). One turn of the queue is the flight fully armed — without it every
  // law here reads a pose whose numbers have not been written and measures NaN.
  await flushFlight();
  return { popup, body: popup.querySelector<HTMLElement>(".kui-floating-body")! };
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
    // Not cascade-delivered: the wrapper has to carry `dir` itself (§20).
    direction: cs.direction,
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
    direction: cs.direction,
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
          data-size="2"
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
    document.documentElement.setAttribute("data-depth", "elevated");
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
      // Compact: the row takes the document's density cell, not `default` — the row box is
      // line + 2 x inset (§21, 2026-08-09), and compact's inset (2) differing from default's
      // (4) is what makes this a real comparison.
      expect(row.getBoundingClientRect().height).toBeCloseTo(
        parseFloat(computed(row, "line-height")) + 2 * parseFloat(tokenOn(popup, "--row-inset-2")),
        1,
      );
      expect(tokenOn(popup, "--row-inset-2")).toBe(tokenOn(card, "--row-inset-2"));
    } finally {
      document.documentElement.removeAttribute("data-depth");
      document.documentElement.removeAttribute("data-density");
    }
  });

  /* The arm that makes `direction` a real comparison rather than a constant: both sides
     mount inside an RTL subtree, where CSS direction does NOT reach a body-level portal on
     its own. Falsified by dropping the wrapper's `dir` stamp. */
  it("agrees under RTL, where the cascade does not carry the answer (§20)", () => {
    let popupTwin: HTMLElement | null = null;
    render(
      <Theme>
        <div dir="rtl">
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Alpha</MenuItem>
            </MenuContent>
          </Menu>
          <div
            ref={(n: HTMLDivElement | null) => void (popupTwin = n)}
            className="kui-surface kui-floating kui-menu-popup kui-menu-anchored"
            data-size="2"
            data-tone="neutral"
            data-emphasis="quiet"
            data-bordered="true"
            style={{ "--anchor-width": "0px" } as React.CSSProperties}
          />
        </div>
      </Theme>,
    );
    // By ANATOMY, not by index: the first cut took `popups[length - 2]` and the twin happens
    // to precede the portal in document order, so it compared the twin against itself and
    // survived the sabotage pass. An index is not an identification.
    const popup = document.querySelector<HTMLElement>(".kui-portal .kui-menu-popup");
    const twinEl = popupTwin as HTMLElement | null;
    if (!popup || !twinEl) throw new Error("subject or twin missing");
    if (popup === twinEl) throw new Error("the law is comparing the twin with itself");
    // Calibration: the twin really is in the RTL subtree, so a passing comparison means the
    // portal reached rtl rather than both sides sitting at the document's ltr.
    expect(computed(twinEl, "direction")).toBe("rtl");
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(twinEl));
  });

  /* MenuSubContent portals and re-themes too, and NOTHING asserted it: deleting its wrapper
     left the whole suite green while a submenu inside a themed subtree fell back to the
     document (audit 2026-08-09). The child panel is compared against its own PARENT panel,
     which is the twin that matters — two portals, one theme. */
  it("a submenu re-themes as well as its parent does (§20)", async () => {
    render(
      <Theme {...HOSTILE}>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            {/* A plain row in each panel: the sub TRIGGER carries a chevron slot, so
                comparing it against a slotless child row compares two different anatomies
                (the pill-side padding rule) rather than two themings. */}
            <MenuItem>Alpha</MenuItem>
            <MenuSub defaultOpen>
              <MenuSubTrigger>Export as</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>PNG</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const panels = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")];
    if (panels.length < 2) throw new Error("the child panel never mounted");
    const [parent, child] = panels.slice(-2) as [HTMLElement, HTMLElement];
    // Calibration: the hostile axes actually reached the parent, so "identical" is not two
    // panels agreeing on the defaults.
    const bare = openMenu({});
    expect(surfaceFacts(parent)).not.toEqual(surfaceFacts(bare.popup));
    expect(surfaceFacts(child)).toEqual(surfaceFacts(parent));
    const childRow = child.querySelector<HTMLElement>(".kui-menu-item");
    const parentRow = parent.querySelector<HTMLElement>(".kui-menu-item");
    if (!childRow || !parentRow) throw new Error("rows missing");
    expect(rowFacts(childRow)).toEqual(rowFacts(parentRow));
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
      // The ONE departure from the control cells (§21, reversed 2026-08-09 — the menu read
      // sparse): the row's box is its text line plus the cell's designed inset, never the
      // height ladder. min-height stands down to auto and the rendered box is asserted as
      // the SUM off the browser's own line-height — which the type bands move under coarse,
      // so this one expression prices all 24 cells.
      // `auto` serializes as 0px on a non-flex-item; both mean "stood down".
      expect(["auto", "0px"], label).toContain(computed(row, "min-height"));
      expect(row.getBoundingClientRect().height, label).toBeCloseTo(
        parseFloat(computed(row, "line-height")) + 2 * parseFloat(tokenOn(popup, `--row-inset-${cell.size}`)),
        1,
      );
      // The padding this comment has always named, now asserted (audit 2026-08-09): rows
      // have no leading slot in this mount, so the control skeleton's own side padding
      // applies and the row adds nothing of its own.
      // --control-px-PILL, not --control-px: a side whose content does not start with a
      // [data-slot] wrapper takes the pill padding (§4), and these rows have no slots. The
      // two are equal at every radius level except `full`, which is why naming the wrong one
      // still passed — asserted through the token actually in play, and pinned at `full`
      // below where they diverge.
      expect(computed(row, "padding-left"), label).toBe(
        tokenOn(popup, `--control-px-pill-${cell.size}`),
      );
      expect(computed(row, "padding-right"), label).toBe(computed(row, "padding-left"));
      expect(computed(row, "font-size"), label).toBe(tokenOn(popup, `--font-size-${cell.size}`));
      expect(computed(row, "gap"), label).toBe(tokenOn(popup, `--control-gap-${cell.size}`));
      // --radius-row-N, not --radius-control-N: rows left the height ladder, so at `full`
      // (the DEFAULT) their capsule is their own — the two tokens are equal at every other
      // level, which is exactly how naming the wrong one passed until the default flipped.
      expect(computed(row, "border-top-left-radius"), label).toBe(
        tokenOn(popup, `--radius-row-${cell.size}`),
      );
      // Full width: the row spans the panel's content box exactly.
      expect(row.getBoundingClientRect().width, label).toBeCloseTo(
        popup.clientWidth - parseFloat(computed(popup, "padding-left")) * 2,
        0,
      );
    });
  });

  it("at radius=full a slotless row takes the PILL padding, not the plain one (§4, §6)", () => {
    const { popup, items } = openMenu({ radius: "full" });
    const row = items[0]!;
    const pill = tokenOn(popup, "--control-px-pill-2");
    const plain = tokenOn(popup, "--control-px-2");
    // Calibration: this is the one level where the two diverge — without it the assertion
    // below is the same tautology the 24-cell law was passing on.
    expect(pill, "pill and plain must differ at full").not.toBe(plain);
    expect(computed(row, "padding-left")).toBe(pill);
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
          <MenuItem>Plain</MenuItem>
        </>
      ));
      const [destructive, dead] = [...popup.querySelectorAll<HTMLElement>(".kui-menu-item")];
      const [ticked, deadTicked] = [...popup.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]')] as HTMLElement[];
      if (!destructive || !dead || !ticked || !deadTicked) throw new Error("rows missing");
      // Destructive: the tone indirection re-scopes the ink — a real red at rest, the
      // family's one designed text colour (§15's trio, which the row family reads since
      // 2026-08-09). NOT --destructive-label, the button-label value: that is #6c3230, a
      // brown, and the law asserted it for as long as the row was on control dress.
      expect(computed(destructive, "color")).toBe(colorOn(popup, "var(--destructive-ink)"));
      // Calibration: the two roles really differ, so naming the wrong one cannot pass.
      expect(colorOn(popup, "var(--destructive-ink)")).not.toBe(
        colorOn(popup, "var(--destructive-label)"),
      );
      // And a PLAIN row reads body ink, not the button label's grey — the other half of the
      // same finding, which no law covered at all.
      const plainRow = [...popup.querySelectorAll<HTMLElement>(".kui-menu-item")].find(
        (el) => el.textContent === "Plain",
      );
      if (!plainRow) throw new Error("plain row missing");
      expect(computed(plainRow, "color")).toBe(colorOn(popup, "var(--color-text)"));
      // Disabled: the shared arm's remap (neutral-8 label + disabled cursor), zero menu CSS.
      expect(computed(dead, "color")).toBe(colorOn(popup, "var(--neutral-8)"));
      expect(computed(dead, "cursor")).toBe(
        probeIn(popup, (el) => (el.style.cursor = "var(--cursor-disabled)"), (cs) => cs.cursor),
      );
      // Checked speaks accent through the INDICATOR (reversed 2026-08-09): the tick wears
      // the mark family's own bright solid, and the LABEL stays the row's ordinary ink —
      // the whole-row --accent-label ink read as dark emphasis, not selection.
      const indicator = ticked.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!indicator) throw new Error("indicator slot missing");
      expect(computed(indicator, "color")).toBe(colorOn(popup, "var(--accent-solid)"));
      const plain = [...popup.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
        (el) => el.textContent === "Plain",
      );
      if (!plain) throw new Error("plain row missing");
      expect(computed(ticked, "color"), "a checked LABEL is ordinary ink").toBe(
        computed(plain, "color"),
      );
      // And a DEAD tick dims: the :not([data-disabled]) on the row stands the accent down,
      // so the indicator falls back to the disabled arm's inherited neutral-8.
      const deadIndicator = deadTicked.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!deadIndicator) throw new Error("dead indicator slot missing");
      expect(computed(deadIndicator, "color")).toBe(colorOn(popup, "var(--neutral-8)"));
      expect(computed(deadTicked, "color")).toBe(colorOn(popup, "var(--neutral-8)"));
      // The reserved gutter: the unchecked twin of a checkable row keeps its slot box.
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
  it("the panel corner is CONCENTRIC — row corner + panel padding, in every (size × level) cell", () => {
    // The third corner in a week, and the first derived one (Kushagra, 2026-08-09): the
    // overlay band read dialog-round on sight, and the fixed surface-1 that replaced it
    // only matched where row corner + padding happened to land on it (medium × 1-2,
    // large × 3) — a fixed pick CANNOT hold, because the row corner moves with BOTH the
    // size index and the radius level while a surface pick moves with neither. Derived,
    // the two curves share a centre in every cell by construction. Asserted off the
    // BROWSER's resolved values on both boxes — not by rebuilding the calc from tokens,
    // which would be the law agreeing with its own arithmetic (the 2026-08-03 lesson).
    for (const radius of ["small", "medium", "large", "full"] as const) {
      for (const size of ["1", "2", "3", "4"] as const) {
        const { popup, items } = openMenu({ radius }, undefined, size);
        const row = items[0];
        if (!row) throw new Error("row missing");
        const rowCorner = parseFloat(computed(row, "border-top-left-radius"));
        const pad = parseFloat(computed(popup, "padding-top"));
        expect(
          parseFloat(computed(popup, "border-top-left-radius")),
          `${radius} × size ${size}`,
        ).toBeCloseTo(rowCorner + pad, 1);
      }
    }
    // Concentric arithmetic is undefined at zero: `none` means square, not "rounded by
    // exactly the padding" — the guard the formula needs, asserted where it bites.
    const { popup } = openMenu({ radius: "none" });
    expect(computed(popup, "border-top-left-radius")).toBe("0px");
  });

  it("padding and min-width are the menu's own designed tokens", () => {
    const { popup } = openMenu({});
    expect(computed(popup, "padding-top")).toBe(tokenOn(popup, "--floating-p"));
    expect(popup.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      parseFloat(tokenOn(popup, "--floating-min-w")),
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
    const floor = parseFloat(tokenOn(popup, "--floating-min-w"));
    const wide = `${floor + 240}px`;

    // The anchored panel takes the anchor when it is wider than the floor. Injected through
    // --kui-anchor-w — the HEAD of the chain since the entry began writing its own anchor
    // measurement (2026-08-10): the settled panel still carries the entry's value here, and a
    // value injected further down the chain would be shadowed by it.
    popup.style.setProperty("--kui-anchor-w", wide);
    expect(computed(popup, "min-width")).toBe(wide);
    // ...and keeps the floor when the anchor is narrower — max(), not "whatever the anchor is".
    popup.style.setProperty("--kui-anchor-w", "10px");
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
    for (const depth of DEPTHS) {
      let card: HTMLElement | null = null;
      render(
        <Theme depth={depth}>
          <Card ref={(n: HTMLDivElement | null) => void (card = n)}>plain</Card>
        </Theme>,
      );
      const { popup } = openMenu({ depth });
      const cast = computed(popup, "box-shadow");
      expect(cast, `${depth} popup casts`).not.toBe("none");
      if (depth === "flat") {
        // The flat world's popup cast is the QUIETER derived value, not elevated's...
        const { popup: elevatedPopup } = openMenu({ depth: "elevated" });
        expect(cast).not.toBe(computed(elevatedPopup, "box-shadow"));
        // ...and the flat world itself is intact: the card beside the menu casts nothing.
        expect(computed(card!, "box-shadow"), "flat Card must stay flat").toBe("none");
      }
    }
  });

  it("a glass popup keeps the floating cast in both worlds — coverage outranks transmission", () => {
    for (const depth of DEPTHS) {
      const { popup: solidPopup } = openMenu({ depth });
      const solidShadow = computed(solidPopup, "box-shadow");
      // Fresh mount with glass: the filter engages, the fill goes translucent, and the
      // cast is byte-identical to the solid popup's — the floating chrome, not the
      // transmitted row (which is none in flat, where this assertion has teeth).
      let glass: HTMLElement | null = null;
      render(
        <Theme depth={depth} material="thin">
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent ref={(n: HTMLDivElement | null) => void (glass = n)}>
              <MenuItem>Alpha</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>,
      );
      if (!glass) throw new Error("glass popup never mounted");
      const g = glass as HTMLElement;
      expect(computed(g, "backdrop-filter"), depth).not.toBe("none");
      expect(computed(g, "box-shadow"), `${depth} glass cast`).toBe(solidShadow);
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
    // ...and it is [data-popup-open] that does it. Base UI sets data-highlighted on this row
    // too, so the assertion above passed with the popup-open arm of the rule DELETED (audit
    // 2026-08-09) — a law naming a mechanism it never reached. Isolated by hand: the
    // attribute alone, on a row the highlight has left.
    sub.removeAttribute("data-highlighted");
    expect(computed(sub, "background-color"), "the popup-open arm must light it alone").toBe(
      colorOn(popup, "var(--tone-soft)"),
    );
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

/* ── The panel's interior (§22) ───────────────────────────────────────────────────────── */

describe("what the panel does to what is inside it (§22)", () => {
  /* The separator is INSET to the rows' own extent (reversed 2026-08-09 from a full bleed):
     it divides rows, and the rows sit inside the panel's padding, so a line wider than they
     are divides the panel instead. Two facts, and the group arm is why the law exists at all —
     a group is a transparent wrapper, so a separator between one group's rows must land
     exactly where a loose one does. Asserted against a ROW rather than a number, so the
     designed padding stays the single source. Falsified both ways: restoring the negative
     margin fails the row-extent arm, dropping the group arm from the selector fails the
     agreement arm. */
  it("a separator spans the rows, not the panel — in a group or out of one", () => {
    const { popup } = openMenu({}, (
      <>
        <MenuItem>Alpha</MenuItem>
        <Separator />
        <MenuGroup>
          <MenuItem>Beta</MenuItem>
          <Separator />
          <MenuItem>Gamma</MenuItem>
        </MenuGroup>
      </>
    ));
    const [loose, grouped] = [...popup.querySelectorAll<HTMLElement>(".kui-separator")];
    const row = popup.querySelector<HTMLElement>(".kui-menu-item");
    if (!loose || !grouped || !row) throw new Error("both separators and a row must mount");
    // Calibration: the panel's padding is a real distance, so "spans the rows" and "spans
    // the panel" are distinguishable answers in this cell.
    expect(parseFloat(computed(popup, "padding-left")), "nothing to inset").toBeGreaterThan(0);
    // The rows' extent, both edges, both separators.
    const rowBox = row.getBoundingClientRect();
    for (const [name, el] of [["loose", loose], ["grouped", grouped]] as const) {
      const box = el.getBoundingClientRect();
      expect(Math.abs(box.left - rowBox.left), `${name} starts where a row does`).toBeLessThanOrEqual(0.5);
      expect(Math.abs(box.right - rowBox.right), `${name} ends where a row does`).toBeLessThanOrEqual(0.5);
    }
    // And BOTH keep the panel's own rhythm above and below — which is now the only thing
    // the group arm of the selector supplies, so asserting it on the loose one alone left
    // that arm unfalsifiable (caught by its own sabotage pass: dropping the group arm from
    // the selector left this law green). A law about one member of a two-member rule is
    // half a law, the same lesson the Progress axis taught.
    for (const [name, el] of [["loose", loose], ["grouped", grouped]] as const) {
      expect(computed(el, "margin-top"), `${name} rhythm above`).toBe(computed(popup, "padding-top"));
      expect(computed(el, "margin-bottom"), `${name} rhythm below`).toBe(computed(popup, "padding-top"));
    }
  });

  /* The height half of the positioner's measurements shipped and the width half did not, so
     a menu wider than the room beside its trigger spilled off the viewport. Falsified by
     deleting the max-width declaration. */
  it("the panel is bounded by the room the positioner reports, in BOTH axes", () => {
    const { popup } = openMenu({});
    for (const [axis, prop] of [
      ["width", "max-width"],
      ["height", "max-height"],
    ] as const) {
      popup.style.setProperty(`--available-${axis}`, "137px");
      expect(computed(popup, prop), axis).toBe("137px");
    }
  });

  /* The wrapper is a body-level box the author never wrote, so it must not become the query
     container for the popup's contents (§2, §20). Falsified by deleting the
     `.kui-theme.kui-portal` rule — the tiered Box then reads the viewport and takes `md`. */
  it("a portalled subtree resolves tiers to `initial`, not to the viewport (§2)", () => {
    let inFlow: HTMLElement | null = null;
    const tiered = <Box p={{ initial: "1", md: "9" }} />;
    const { popup } = openMenu({}, (
      <>
        <MenuItem>Alpha</MenuItem>
        {tiered}
      </>
    ));
    const scope = popup.closest<HTMLElement>(".kui-theme");
    if (!scope) throw new Error("the portal scope is missing");
    expect(computed(scope, "container-type")).toBe("normal");

    // The viewport is wide enough that a container-reading Box WOULD take `md` — without
    // this the law would pass on a narrow window for the wrong reason.
    render(
      <Theme>
        <Box container style={{ width: 2000 }}>
          <Box ref={(n: HTMLDivElement | null) => void (inFlow = n)} p={{ initial: "1", md: "9" }} />
        </Box>
      </Theme>,
    );
    const wide = inFlow as HTMLElement | null;
    if (!wide) throw new Error("the in-flow control never mounted");
    expect(computed(wide, "padding-top"), "the control must take the md tier").toBe(
      tokenOn(popup, "--layout-space-9"),
    );

    const portalled = popup.querySelector<HTMLElement>(".kui-box");
    if (!portalled) throw new Error("the tiered box never mounted in the popup");
    expect(computed(portalled, "padding-top")).toBe(tokenOn(popup, "--layout-space-1"));
  });
});

/* ── The submenu's seam (§22) ─────────────────────────────────────────────────────────── */

describe("a trailing chip sits one inset from its three nearest edges (§21, 2026-08-16)", () => {
  it("top, end and bottom clearances match for a Kbd at the row's own size", () => {
    // Kushagra's sentence as a law: "the top, right, and bottom must match for kbd". The
    // row's inline padding is the control px, priced for where TEXT starts; the block
    // clearance is the row's own inset — so before the trailing slot ceded the difference,
    // a boxed chip sat equally off top and bottom and visibly farther from the end. The
    // Kbd is the row's own size so its 1lh face equals the row's line box, which is what
    // makes the three distances one number by construction — and at radius="full" (the
    // default) that equality is capsule-in-capsule CONCENTRICITY, the panel corner's own
    // sentence one nesting deeper.
    const { items } = openMenu({}, <MenuItem trailing={<Kbd size="2">⌘D</Kbd>}>Duplicate</MenuItem>);
    const row = items[0]!;
    const chip = row.querySelector<HTMLElement>(".kui-kbd")!;
    const r = row.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    const top = c.top - r.top;
    const bottom = r.bottom - c.bottom;
    const end = r.right - c.right;
    expect(top).toBeCloseTo(bottom, 0);
    expect(end, "the end clearance must be the block clearance").toBeCloseTo(top, 0);
    // The negative control that keeps this from passing vacuously: the row's TEXT padding
    // is a genuinely different (larger) number, so a slot resting at the text padding
    // cannot satisfy the law.
    expect(parseFloat(computed(row, "padding-inline-end"))).toBeGreaterThan(end + 1);
  });
});

describe("a submenu meets its parent panel where §22 says it does", () => {
  /* Both claims were false in every cell and neither had a law: the offsets were hardcoded
     JS numbers against a padding that MOVES with density (2/4/8), and the panel's border was
     never in the arithmetic at all. Density is the axis that breaks it, so the law walks all
     three — the one-cell lesson. Falsified by putting the constants back. */
  it("the child's first row is level with its trigger row, every density (§22)", async () => {
    for (const density of DENSITIES) {
      render(
        <Theme density={density}>
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 200 }}>
            <Menu defaultOpen>
              <MenuTrigger render={<Button>Open</Button>} />
              <MenuContent>
                <MenuItem>Alpha</MenuItem>
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
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 60));

      const panels = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")];
      if (panels.length < 2) throw new Error(`${density}: the child panel never mounted`);
      const [parent, child] = panels.slice(-2) as [HTMLElement, HTMLElement];
      const trigger = parent.querySelector<HTMLElement>('[aria-haspopup="menu"]');
      const firstRow = child.querySelector<HTMLElement>(".kui-menu-item");
      if (!trigger || !firstRow) throw new Error(`${density}: subject missing`);

      // Calibration: the seam is a real distance in this cell, so an offset of zero would
      // be visibly wrong rather than accidentally right.
      const seam =
        parseFloat(computed(parent, "padding-top")) +
        parseFloat(computed(parent, "border-top-width"));
      expect(seam, `${density}: nothing to align`).toBeGreaterThan(0);

      expect(
        Math.abs(firstRow.getBoundingClientRect().top - trigger.getBoundingClientRect().top),
        `${density}: the child's first row must sit level with its trigger`,
      ).toBeLessThanOrEqual(1);

      // "Sits flush against its parent panel" — against the PANEL, not against the row,
      // which sits inside the panel's own padding.
      expect(
        Math.abs(child.getBoundingClientRect().left - parent.getBoundingClientRect().right),
        `${density}: the child must sit flush against the parent panel`,
      ).toBeLessThanOrEqual(1);
    }
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
     and being cut. Falsified by restoring `--kui-sf-p: var(--floating-p)`. */
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

  /* The THIRD thing riding that fill (2026-08-10). The law above asserted the fill and the
     label and stopped, so the tick kept standing on the solid rung in --accent-solid: merely
     ugly in light (5.21:1) and a genuine failure in dark, where the row is near-white and the
     blue measures 2.65:1 against the 3:1 a non-text indicator owes — under the floor, on the
     conformance surface. Falsified by deleting the tick arm from recipes.css. */
  it("contrast=high moves the checked TICK too, in both appearances (§19, §21)", () => {
    for (const appearance of APPEARANCES) {
      const { popup, items } = openMenu(
        { appearance, contrast: "high" },
        <MenuCheckboxItem defaultChecked>Ticked</MenuCheckboxItem>,
      );
      const row = items[0]!;
      const tick = row.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!tick) throw new Error("indicator slot missing — the law would assert nothing");

      // Calibration, and the negative control in one: UNLIT, the tick is still the accent.
      // This is what fails if the new arm is written without its state guard and swallows
      // every checked row in the panel.
      expect(computed(tick, "color"), `${appearance}: an unlit tick keeps the accent`).toBe(
        colorOn(popup, "var(--accent-solid)"),
      );

      row.setAttribute("data-highlighted", "");
      expect(computed(tick, "color"), `${appearance}: a lit tick follows the fill`).toBe(
        colorOn(popup, "var(--tone-contrast)"),
      );
      // It speaks with ONE voice: tick and label land on the same value, which is the whole
      // point — asserting the tick alone would pass if the label regressed underneath it.
      expect(computed(row, "color"), appearance).toBe(computed(tick, "color"));
      // And the two roles really differ, so naming the wrong token cannot pass either.
      expect(colorOn(popup, "var(--tone-contrast)"), appearance).not.toBe(
        colorOn(popup, "var(--accent-solid)"),
      );
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
    expect(computed(label, "color")).toBe(colorOn(popup, "var(--color-text-muted)"));
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
    expect(computed(label, "color")).toBe(colorOn(popup, "var(--color-text-muted)"));
    expect(computed(label, "pointer-events")).toBe("none");
    expect(label.getBoundingClientRect().height).toBeCloseTo(
      parseFloat(computed(label, "line-height")) + 2 * parseFloat(tokenOn(popup, "--row-inset-2")),
      1,
    );
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

/* ── Motion: the emergence recipe (§8, §22 — judged 2026-08-09 in the motion lab) ──────── */

describe("the panel unfurls out of a seed (§22)", () => {
  /**
   * A curve token, read RAW. `tokenOn` resolves through a width probe and answers `0px` for a
   * perfectly healthy `linear()` — the same shape as the `numberOn` split one value-type over.
   */
  const curveOn = (el: HTMLElement, name: string) =>
    getComputedStyle(el).getPropertyValue(name).trim();

  /**
   * The samples inside a `linear()`, which is how two curves are compared here. The browser
   * re-serializes `linear(0, 0.021 2.78%, …)` as `linear(0 0%, 0.021 2.78%, …)`, so a string
   * match fails on a curve that is identical in every way that matters.
   */
  const samples = (curve: string) =>
    curve
      .slice(curve.indexOf("(") + 1, curve.lastIndexOf(")"))
      .split(",")
      .map((stop) => stop.trim().split(/\s+/)[0]!);

  /** Pin the clocks. A computed value mid-transition is the ANIMATED value, so reading opacity
      the instant the exit is stamped answers 1 — the first frame of the fade, not what the
      fade is toward. Every law that reads a VALUE pins first; the ones that read the declared
      transition list must not, because pinning erases it. */
  const still = (...els: HTMLElement[]) => {
    for (const el of els) el.style.setProperty("transition", "none", "important");
  };

  /** The state Base UI hands a panel while it leaves. Stamped rather than waited for: the
      attribute IS the contract (MenuPopupDataAttributes.endingStyle), and what is under test
      is what the stylesheet does with it — computed, on a real element, in the real cascade. */
  const ending = (popup: HTMLElement) => {
    popup.removeAttribute("data-seed");
    popup.setAttribute("data-ending-style", "");
  };

  it("an open menu's trigger stays lit — in use, not hovered (§21, promoted 2026-08-10)", () => {
    /**
     * Kushagra: *"just like select trigger continues to be in a selected state, dropdown
     * menus trigger also should remain in the state where it activated the dropdown."* The
     * third control saying §21's sentence, so the rule promoted to the shared layer: a
     * control whose popup is open holds the HOVER step for as long as the panel is.
     */
    const host = render(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
        <Button>Closed twin</Button>
      </Theme>,
    );
    const [trigger, twin] = [...host.querySelectorAll<HTMLElement>(".kui-button")];
    expect(trigger!.getAttribute("data-popup-open"), "Base UI must stamp the state").not.toBeNull();
    expect(
      computed(trigger!, "background-color"),
      "an open trigger does not rest",
    ).not.toBe(computed(twin!, "background-color"));
    // The HOVER step, not a state of its own — the family vocabulary, read off the element's
    // own registered source (inherits: false, so a child probe cannot see it).
    expect(computed(trigger!, "background-color")).toBe(
      ownColor(trigger!, "--kui-ct-fill-src-hover"),
    );
  });

  it("an open trigger's geometry is LOCKED — the panel must not move with a hover settle (§8)", async () => {
    /**
     * Kushagra: *"leaving the mouse off triggers also moves the menu as the button moves back
     * to its OG position."* Not cosmetic: floating-ui measures the anchor WITH its transforms,
     * so the trigger's 1px hover settle — 550ms of lively spring — drags the whole anchored
     * panel with it. While its popup is open, a trigger is a hinge: no rise, no sink. The
     * closed twin is the calibration — the same pointer, the same mount, and it must still
     * rise, or this law is reading a page where hover never works at all.
     */
    // Calibration FIRST, while the menu is closed: Base UI inerts the whole page behind an
    // open menu (its backdrop intercepts the pointer), so nothing but the panel and its
    // trigger can be hovered once it opens — the first spelling waited fifteen seconds for a
    // twin the backdrop would never surrender. The same pointer then opens the menu by
    // clicking the trigger, which leaves it genuinely hovering the thing the law is about.
    const host = render(
      <Theme>
        <Button>Closed twin</Button>
        <Menu>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const [twin, trigger] = [...host.querySelectorAll<HTMLElement>(".kui-button")];
    const { userEvent } = await import("vitest/browser");

    await userEvent.hover(twin!);
    const [, y] = computed(twin!, "translate").split(" ");
    expect(parseFloat(y ?? "0"), "the twin must rise, or hover is broken here").toBeLessThan(0);

    await userEvent.click(trigger!);
    expect(trigger!.getAttribute("data-popup-open"), "the click must have opened it").not.toBeNull();
    expect(trigger!.matches(":hover"), "the pointer rests on the trigger it pressed").toBe(true);
    // HELD DOWN, not locked at rest (revised the same hour): the press put it down, the open
    // panel keeps it there — the click latches. One value whether the pointer stays or goes,
    // which is the half that stills the panel.
    const held = `0px ${tokenOn(trigger!, "--press-travel")}`;
    expect(computed(trigger!, "translate"), "an open trigger stays pressed").toBe(held);
    await userEvent.unhover(trigger!);
    expect(computed(trigger!, "translate"), "pointer off, still pressed — the panel must not move").toBe(held);
  });

  it("the first frame is the trigger's SILHOUETTE, sitting exactly on it (§22)", async () => {
    /**
     * The silhouette (2026-08-15, Kushagra: *"make the circle shape of trigger exactly, and
     * make it start from where the trigger is, thats all"* — the interim circle and its
     * quadrant reverted on sight): the panel's first frame is the trigger's own box sitting
     * ON the trigger, and the unfurl grows it straight into the panel's own — which is what
     * answers where the panel came from.
     *
     * One frame first: the overlay's offset is AIMED after floating-ui places the
     * positioner (a microtask, re-checked on the first frame), and the seed holds for two —
     * so one awaited frame lands between the aim and the release.
     */
    const { popup } = await openUnsettled();
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const trigger = document.querySelector<HTMLElement>(".kui-button")!;
    const box = trigger.getBoundingClientRect();
    expect(popup.hasAttribute("data-seed"), "the read must land on the seed frame").toBe(true);
    const seed = popup.getBoundingClientRect();
    // Within the held press's drift, not to the pixel: the silhouette measured the trigger
    // on the open's first frame, and the trigger then shrank a hair under the held press.
    expect(Math.abs(seed.width - box.width), "the trigger's own width").toBeLessThan(3);
    expect(Math.abs(seed.height - box.height), "the trigger's own height").toBeLessThan(3);
    expect(Math.abs(seed.left - box.left), "sitting exactly on the trigger").toBeLessThan(3);
    expect(Math.abs(seed.top - box.top), "in both axes").toBeLessThan(3);
    expect(
      parseFloat(computed(popup, "border-top-left-radius")),
      "wearing the trigger's own corner",
    ).toBeCloseTo(parseFloat(getComputedStyle(trigger).borderTopLeftRadius), 1);
    // OPAQUE from the first frame: the silhouette covers the trigger exactly, so this is
    // the trigger's own body lifting, and a body does not fade in (2026-08-10, back in
    // force now that the seed overlaps its trigger again).
    expect(computed(popup, "opacity"), "the silhouette is the trigger lifting").toBe("1");
    // And the body is squished, which is the difference between one object unfurling and a
    // shutter opening over a finished page.
    const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;
    expect(computed(body, "scale")).toBe("0.95 0.5");
    // MOLTEN: the content is out of focus while the box is not yet its shape, sharpening as
    // the unfurl lands — and the sharpening is a transition, not a snap.
    expect(computed(body, "filter"), "the content arrives molten").toMatch(/^blur\(/);
    expect(computed(body, "opacity"), "and empty — the body is the held unit").toBe("0");
    expect(
      computed(body, "transition-property").split(",").map((v) => v.trim()),
      "and it resolves on a clock",
    ).toContain("filter");
    expect(computed(popup, "box-shadow"), "the seed sits flat on the page").toBe("none");
    expect(computed(popup, "pointer-events"), "the flight must hit-test").toBe("auto");
  });

  it("the box it grows into is measured, and it is the panel's own", async () => {
    // The cell is chosen, not default: a panel whose natural width lands on a whole pixel
    // cannot test a claim about fractions, and the default one lands exactly on its 112px
    // floor. This mount is the cell where the rounded read actually broke a row.
    const { popup } = await openUnsettled({ density: "comfortable" }, undefined, "4");
    const measured = parseFloat(popup.style.getPropertyValue("--kui-fly-w"));
    expect(measured).toBeGreaterThan(parseFloat(tokenOn(popup, "--floating-seed")));
    // Calibration: without a fraction to lose, every assertion below is vacuous.
    expect(measured % 1, "this cell must have a fractional width to measure").not.toBe(0);
    still(popup);
    popup.removeAttribute("data-seed");
    // And the FLIGHT attribute, which is what "the panel's own width" means (2026-08-10): while
    // it is set the body is lifted out of flow to pin it against the edge the box grows from,
    // so the panel is sized by the measurement rather than by its content — deliberately, and
    // it collapses to its padding if asked to size itself in that state.
    popup.removeAttribute("data-unfurling");
    popup.style.removeProperty("--kui-fly-w");
    // An integer read (offsetWidth) rounds a 115.33px panel to 115, and that third of a pixel
    // re-broke a row's line in one cell of twenty-four.
    expect(measured).toBeCloseTo(popup.getBoundingClientRect().width, 2);
  });

  it("nothing the seed moves is missing from the transition list (§8)", async () => {
    // The teleport rule as a law rather than a comment. A property the seed changes but the
    // transition never names does not animate — it SNAPS, which is exactly the defect that
    // shipped in the demo when `top` and `left` fell out of the exit list.
    const { popup } = await openUnsettled();
    const read = () => {
      const cs = getComputedStyle(popup);
      return {
        "inline-size": cs.inlineSize,
        "block-size": cs.blockSize,
        "border-radius": cs.borderTopLeftRadius,
        "margin-inline-start": cs.marginInlineStart,
        "margin-block-start": cs.marginBlockStart,
        translate: cs.translate,
        opacity: cs.opacity,
      };
    };
    const seeded = read();
    // The list is the FLIGHT's, read un-seeded and un-stilled: the seed state pins
    // `transition: none` (a held pose — the aim writes into it without starting
    // cancellable transitions) and still() pins the same with importance, so the one
    // moment the base rule's list is readable is between the two.
    popup.removeAttribute("data-seed");
    const listed = computed(popup, "transition-property").split(",").map((p) => p.trim());
    still(popup);
    const settled = read();

    const moved = (Object.keys(seeded) as (keyof ReturnType<typeof read>)[]).filter(
      (property) => seeded[property] !== settled[property],
    );
    // Calibration: a seed that moved nothing would make every assertion below vacuous.
    expect(moved.length, "the seed must actually move things").toBeGreaterThan(2);
    for (const property of moved) {
      expect(listed, `${property} moves but never transitions`).toContain(property);
    }
  });

  it("the panel falls before it spreads, and the channels are out of phase (§8)", async () => {
    const { popup } = await openUnsettled();
    // Un-seeded first: the seed state pins `transition: none`, and these clocks are the
    // flight's — the base rule's.
    popup.removeAttribute("data-seed");
    const durations = computed(popup, "transition-duration").split(",").map((d) => d.trim());
    const listed = computed(popup, "transition-property").split(",").map((p) => p.trim());
    expect(durations.length).toBeGreaterThan(3);
    expect(new Set(durations).size, "one duration everywhere IS a rigid body").toBeGreaterThan(2);
    const at = (property: string) => parseFloat(durations[listed.indexOf(property)]!);
    // The axis that finishes LAST is the one the eye reads as the direction of travel, so the
    // vertical arrives first: a menu drops out of its trigger and then opens (reversed
    // 2026-08-09 by eye — the first spelling gave height the longest clock, and every menu
    // spread sideways and then dropped).
    expect(at("block-size"), "the panel falls first").toBeLessThan(at("inline-size"));
    expect(at("border-radius")).toBeLessThan(at("inline-size"));
  });

  it("geometry rides the spring; paint does not (§8's two clocks)", async () => {
    const { popup } = await openUnsettled();
    // Un-seeded first: the seed state pins `transition: none`, and these curves are the
    // flight's — the base rule's.
    popup.removeAttribute("data-seed");
    const easings = computed(popup, "transition-timing-function").split(/,(?![^(]*\))/);
    const listed = computed(popup, "transition-property").split(",").map((p) => p.trim());
    // The FLUID spring since 2026-08-15 — the family's own curve, minted when calm's
    // front-loaded travel read rigid on a box this large.
    const spring = curveOn(popup, "--motion-spring-elastic");
    expect(spring.startsWith("linear("), "the spring token is a baked curve").toBe(true);
    for (const [index, property] of listed.entries()) {
      const easing = easings[index]!.trim();
      if (property === "opacity" || property === "box-shadow" || property === "filter") {
        // Paint: colour, light AND focus. The cast fades up as the panel lifts
        // (2026-08-10); the container's blur sharpens as it forms (2026-08-15).
        expect(easing, "a signal eases, it has no mass").not.toContain("linear(");
      } else {
        expect(samples(easing), `${property} must ride the spring`).toEqual(samples(spring));
      }
    }
  });

  it("the exit dissolves: geometry HOLDS and the rows stay lit (§22)", async () => {
    const { popup, body } = await openUnsettled();
    const row = popup.querySelector<HTMLElement>(".kui-menu-item")!;
    still(popup, body, row);
    popup.removeAttribute("data-seed");
    const arrived = popup.getBoundingClientRect().width;

    ending(popup);
    expect(computed(popup, "opacity")).toBe("0");
    // A hair of scale toward the anchor, and nothing else: the entry's path is NOT retraced.
    expect(computed(popup, "scale")).toBe("0.98");
    expect(popup.getBoundingClientRect().width).toBeCloseTo(arrived * 0.98, 1);
    expect(computed(popup, "margin-inline-start"), "the pane does not travel out").toBe("0px");
    expect(computed(popup, "margin-block-start"), "the pane does not travel out").toBe("0px");
    // The body does not re-squish and the rows do not fade separately — the pane leaves whole.
    // `none` is `scale`'s initial value, and it is the honest answer: the exit does not touch
    // the body at all, so there is nothing declared on it to read.
    expect(computed(body, "scale")).toBe("none");
    expect(computed(row, "opacity")).toBe("1");
  });

  it("the exit decelerates, never bounces, and is faster than the entry (§8)", async () => {
    const { popup } = await openUnsettled();
    ending(popup);
    const listed = computed(popup, "transition-property").split(",").map((p) => p.trim());
    const easings = computed(popup, "transition-timing-function").split(/,(?![^(]*\))/);
    const stiff = curveOn(popup, "--motion-spring-stiff");
    expect(samples(easings[listed.indexOf("scale")]!)).toEqual(samples(stiff));
    // Read off the CURVE, not off its name: the stiff spring is the one that never crosses its
    // target, because an exit that overshoots is an object that did not mean to leave.
    const values = samples(stiff).map(Number);
    expect(values.length).toBeGreaterThan(8);
    expect(Math.max(...values), "an exit must not overshoot").toBeLessThanOrEqual(1);
    // And it is quicker than the arrival — an exit that takes as long reads as reluctance.
    // The exit's OWN channels (dissolve and settle), not the list max: the ending list also
    // restates the entry's geometry channels so a mid-flight dismissal keeps unfurling
    // under the fade (2026-08-16) — those are keep-alives, and on a settled exit they
    // start nothing.
    const durations = computed(popup, "transition-duration").split(",").map((d) => parseFloat(d));
    for (const own of ["opacity", "scale"]) {
      expect(durations[listed.indexOf(own)]! * 1000, `${own} is the exit's own clock`).toBeLessThan(
        parseFloat(getComputedStyle(popup).getPropertyValue("--floating-spread")),
      );
    }
  });

  it("a reopen that lands mid-dissolve REPLAYS the entry (§22, 2026-08-16)", async () => {
    /**
     * Probed before it was fixed: a quick close→reopen finds the popup still MOUNTED —
     * Base UI flips it back with no starting stamp at all (the measured stream is
     * data-closed off → data-open on → data-ending-style off), so an observer keyed on
     * data-starting-style alone missed the open entirely and the panel merely recovered
     * from its half-dissolved pose: a bit of scale and fade, no entry. The open
     * announcement on this path is data-open returning while the ending attribute leaves.
     */
    let setOpen!: (v: boolean) => void;
    function Host() {
      const [open, set] = React.useState(false);
      setOpen = set;
      return (
        <Theme>
          <Menu open={open} onOpenChange={set}>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Alpha</MenuItem>
              <MenuItem>Beta</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>
      );
    }
    mount(<Host />);
    inMotion();
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    flushSync(() => setOpen(true));
    const popup = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    await wait(600); // land the first flight
    flushSync(() => setOpen(false));
    await wait(60); // mid-dissolve (the dissolve clock is 140ms)
    expect(popup.isConnected, "the premise: the exit is still running").toBe(true);
    expect(popup.hasAttribute("data-ending-style"), "the premise: mid-dissolve").toBe(true);
    flushSync(() => setOpen(true)); // the quick reopen
    // Not a microtask wait: Base UI removes the ending stamp on its own FRAME (probed —
    // at 0ms the announcement has not landed yet), and the begin follows it.
    await wait(50);
    expect(
      popup.hasAttribute("data-seed") || popup.hasAttribute("data-unfurling"),
      "the reopen begins a fresh flight, not a recovery from the half-dissolved pose",
    ).toBe(true);
    await wait(600); // and it LANDS — the new flight's own clock releases it
    expect(popup.hasAttribute("data-unfurling"), "the stale clock did not strip the new flight").toBe(false);
    expect(computed(popup, "opacity")).toBe("1");
  });

  it("suppression is total: under reduced motion nothing is posed and no clock survives (§8)", async () => {
    /**
     * The floating family had NO mounted reduced-motion law until 2026-08-16 — only a string
     * scan of the guarded region for the words it expected to find, which never asked which
     * selector carried them or whether it won. That is the shape §8's own suppression bug took
     * in 2026-08-10: `:not()` takes the specificity of its most specific argument, the ring
     * rule outranked its own stand-down, and every user who asked their OS for stillness got
     * the animation anyway while the scan stayed green.
     *
     * Two claims, and the second is the one no stylesheet law can make: the runner does not
     * merely animate nothing, it does not MEASURE either — §8's "suppression is total"
     * includes the work that only serves the animation. Both are falsified against the
     * shipped code: delete the guard's `transition: none` and the first fails; delete the
     * runner's reduced-motion bail and the second does.
     */
    await asksForStillness();
    const { popup, body } = await openUnsettled();

    // 1. No clock anywhere on the panel, its body or its rows.
    const row = popup.querySelector<HTMLElement>(".kui-menu-item")!;
    for (const el of [popup, body, row]) {
      expect(
        computed(el, "transition-duration").split(",").every((d) => parseFloat(d) === 0),
        "no clock survives",
      ).toBe(true);
    }

    // 2. Nothing was posed and nothing was measured — the entry stood down whole.
    expect(popup.hasAttribute("data-seed"), "no pose").toBe(false);
    expect(popup.hasAttribute("data-unfurling"), "no flight arrangement").toBe(false);
    expect(popup.style.getPropertyValue("--kui-fly-w"), "not even the measurement").toBe("");

    // 3. And the guard's own claim about what it does NOT do: the poses are deliberately not
    //    stood down here (surfaces.css says why — an inverse of every pose declaration drifts,
    //    and it had already drifted twice). So there is nothing to assert about a hand-stamped
    //    pose, and asserting one anyway would have been a law about a rule that no longer exists.
  });

  it("a reopen RETIRES the flight it interrupts, so no stale clock strips the new one (§22, 2026-08-16)", async () => {
    /**
     * The second half of the quick-reopen repair, and the half the replay law above cannot
     * see: that one lets the first flight LAND before closing, so its release has already
     * fired and there is no stale clock to disarm — deleting the retirement leaves it green.
     *
     * Here the reopen interrupts a flight that is still airborne. Each flight schedules its
     * release off its own clock (~530ms: the 480 spread plus the runner's margin), so the
     * interrupted one is due ~290ms after the reopen and the flight that replaced it ~530ms
     * after. Without the retirement the first timer lands inside the second flight, strips
     * the pins, and the box jumps to its natural size a quarter of a second before it should
     * have arrived. The claim is therefore made in the gap between the two deadlines — past
     * the stale one, short of the real one — and it is simply: the panel is still becoming.
     *
     * One law for both families because there is now one runner (unified 2026-08-16); before
     * that this mechanism existed twice and would have needed asserting twice.
     */
    let setOpen!: (v: boolean) => void;
    function Host() {
      const [open, set] = React.useState(false);
      setOpen = set;
      return (
        <Theme>
          <Menu open={open} onOpenChange={set}>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Alpha</MenuItem>
              <MenuItem>Beta</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>
      );
    }
    mount(<Host />);
    inMotion();
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    flushSync(() => setOpen(true));
    const popup = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    await flushFlight();
    await wait(200); // mid-flight: the entry runs to ~480ms
    expect(popup.hasAttribute("data-unfurling"), "the premise: the first flight is airborne").toBe(true);
    flushSync(() => setOpen(false));
    await wait(40); // mid-dissolve (the dissolve clock is 140ms)
    expect(popup.hasAttribute("data-ending-style"), "the premise: dismissed, not yet gone").toBe(true);
    flushSync(() => setOpen(true));
    await flushFlight();
    expect(popup.hasAttribute("data-seed") || popup.hasAttribute("data-unfurling")).toBe(true);
    // Past the interrupted flight's own deadline (~290 from here), short of this one's (~530).
    await wait(400);
    expect(
      popup.hasAttribute("data-unfurling"),
      "the interrupted flight's clock must not land on the flight that replaced it",
    ).toBe(true);
  });

  it("the panel's CONTENT does not slide in from the side when it opens end-aligned (§22)", async () => {
    /**
     * Kushagra, on the playground: *"why does a dropdown that opens to the left look and
     * perform so different to the one that opens bottom"*. This is half the answer, and it is
     * a layout fact rather than a motion one.
     *
     * A block child lays out from its container's inline-start, so the body's origin IS the
     * panel's left edge. Start-aligned, that edge stands still and the right edge does the
     * growing — the words sit where they will end up. END-aligned, the growing edge and the
     * content's origin are the same edge, so every row travels the panel's whole width on the
     * way in: measured at 175px against the start-aligned 21px, on a 209px panel.
     */
    render(
      <Theme>
        <div style={{ position: "absolute", top: "40px", right: "8px" }}>
          <Menu>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>Rename something longer</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Theme>,
    );
    inMotion();
    document.querySelector<HTMLElement>(".kui-button")!.click();
    const tick = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await tick();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop();
    if (!popup) throw new Error("the popup never opened");
    const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;

    // Sampled from the point the positioner has COMMITTED its alignment. Before that the panel
    // is still narrow enough to fit start-aligned and the attribute genuinely says so — which
    // is the OTHER half of the answer, recorded open in LOG: collision is being decided against
    // an animating width. This law is about what happens once the question is settled.
    // RELATIVE to the panel's own end edge since the silhouette (2026-08-15): the whole box
    // now travels from the trigger to its resting place, so the content moves in SCREEN
    // space with it — by design, motion tells the truth about space. What must not happen
    // is the content moving WITHIN the box: end-aligned, the body is pinned to the end
    // edge, and its distance from that edge holding still is exactly "the words sit where
    // they will end up" restated for a box that flies.
    const seen: number[] = [];
    const deadline = performance.now() + 2000;
    while (performance.now() < deadline) {
      if (popup.getAttribute("data-align") === "end") {
        seen.push(popup.getBoundingClientRect().right - body.getBoundingClientRect().right);
      }
      if (!popup.hasAttribute("data-unfurling")) break;
      await tick();
    }
    expect(seen.length, "the panel never committed to end-aligned").toBeGreaterThan(3);
    const drift = Math.max(...seen) - Math.min(...seen);
    expect(drift, `the content slid ${drift.toFixed(0)}px within the box: ${seen.map((n) => n.toFixed(0)).join(",")}`).toBeLessThan(30);
  });

  for (const [where, side] of [["start", "left"], ["end", "right"]] as const) {
    it(`nothing jumps on the frame the flight ends — ${where}-aligned (§22)`, async () => {
      /**
       * Kushagra: *"the inside of the menu jumps after animation finishes"*. It did, by the
       * panel's own padding, and the cause is that an absolutely positioned box resolves its
       * insets against its containing block's PADDING box — so the body pinned at `inset: 0`
       * sat inside the border and outside the padding for the whole flight, then snapped one
       * padding inward the moment it returned to normal flow.
       *
       * The law is deliberately about the SEAM rather than about the padding: any property
       * that differs between the flying state and the settled one produces exactly this, and a
       * law that named the padding would only ever catch the spelling I already fixed.
       */
      render(
        <Theme>
          <div style={{ position: "absolute", top: "40px", [side]: "8px" }}>
            <Menu>
              <MenuTrigger render={<Button>Open</Button>} />
              <MenuContent>
                <MenuItem>Duplicate</MenuItem>
                <MenuItem>Rename something longer</MenuItem>
              </MenuContent>
            </Menu>
          </div>
        </Theme>,
      );
      inMotion();
      document.querySelector<HTMLElement>(".kui-button")!.click();
      const tick = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await tick();
      const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop();
      if (!popup) throw new Error("the popup never opened");
      const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;

      let last: DOMRect | null = null;
      let atRelease: { before: DOMRect; after: DOMRect } | null = null;
      const deadline = performance.now() + 2000;
      while (performance.now() < deadline) {
        const flying = popup.hasAttribute("data-unfurling");
        const now = body.getBoundingClientRect();
        if (!flying && last) {
          atRelease = { before: last, after: now };
          break;
        }
        last = now;
        await tick();
      }
      if (!atRelease) throw new Error("the panel never released");
      // Calibration: a law that never saw the flight would pass trivially.
      expect(popup.getAttribute("data-align")).toBe(where);
      expect(Math.abs(atRelease.after.left - atRelease.before.left), "it jumped sideways").toBeLessThan(1);
      expect(Math.abs(atRelease.after.top - atRelease.before.top), "it jumped vertically").toBeLessThan(1);
    });
  }

  it("the side it opens on is decided ONCE, not re-decided as it grows (§22)", async () => {
    /**
     * Kushagra: *"it opens and then as it animates it realises it must open on the other side,
     * so it switches mid animation"*.
     *
     * The positioner is the box the anchoring library measures, and it shrink-wrapped the
     * panel — so the collision question was re-asked against every intermediate size. The
     * answers were all honest: a 40px seed fits beside a trigger near the right edge and a
     * 209px panel does not, so `data-align` said `start` for the first frames and flipped a
     * third of the way in, taking the transform-origin, the lean and the body's pin with it.
     *
     * The cell is chosen so the SEED fits start-aligned and the panel does not — which is
     * exactly the window the bug lived in, and the calibration below asserts it, because at a
     * trigger where even the seed overflows the panel always said `end` and this law would
     * pass against the pre-fix code.
     */
    render(
      <Theme>
        <div style={{ position: "absolute", top: "40px", right: "8px" }}>
          <Menu>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>Rename something longer</MenuItem>
              <MenuItem>Delete</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Theme>,
    );
    inMotion();
    const trigger = document.querySelector<HTMLElement>(".kui-button")!;
    const triggerLeft = trigger.getBoundingClientRect().left;
    trigger.click();
    const tick = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await tick();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop();
    if (!popup) throw new Error("the popup never opened");

    const seed = parseFloat(tokenOn(popup, "--floating-seed"));
    const natural = parseFloat(popup.style.getPropertyValue("--kui-fly-w"));
    // Calibration, both halves: the seed must fit where the panel does not, or the flip this
    // law exists to forbid was never reachable in this cell.
    expect(triggerLeft + seed, "the seed must fit — else the pre-fix code passes").toBeLessThan(
      window.innerWidth,
    );
    expect(triggerLeft + natural, "the panel must NOT fit").toBeGreaterThan(window.innerWidth);

    // OBSERVED, not frame-sampled (2026-08-15): the first spelling polled per rAF and asked
    // for six samples, which is a frame-count wait wearing a calibration's clothes — under a
    // loaded full suite the whole entry fits in two frames and the law failed for
    // scheduling. A MutationObserver is the honest instrument AND the stronger one: a flip
    // between two sampled frames was invisible to the poll, and is a record here. The first
    // stamping of an absent attribute is Base UI deciding; a change FROM a value is Base UI
    // re-deciding, which is the defect.
    const flips: string[] = [];
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.oldValue !== null) {
          flips.push(`${record.attributeName}: ${record.oldValue} -> ${popup.getAttribute(record.attributeName!)}`);
        }
      }
    });
    observer.observe(popup, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["data-side", "data-align"],
    });
    const deadline = performance.now() + 2000;
    let watched = 0;
    while (performance.now() < deadline) {
      if (popup.hasAttribute("data-unfurling")) watched += 1;
      else if (watched > 0) break;
      await tick();
    }
    observer.disconnect();
    expect(watched, "the entry must actually have run").toBeGreaterThan(0);
    expect(popup.getAttribute("data-align"), "it must settle end-aligned in this cell").toBe("end");
    expect(flips, `it re-decided mid-flight: ${flips.join(" | ")}`).toEqual([]);
  });

  it("survives being mounted twice — the measurement is of the PANEL, never of the seed (§22)", async () => {
    /**
     * StrictMode invokes a ref callback twice, and every Next dev server turns StrictMode on.
     * So the measurement runs a second time on a popup already wearing the seed it set on the
     * first pass — and if it does not neutralise its own key, it measures 40px and pins the
     * panel's destination to its own starting point. Every menu in the app opened as a circle
     * and stayed one (Kushagra, screenshot), while this suite stayed green because a bare
     * mount only ever runs the callback once.
     *
     * The law mounts the real thing under StrictMode rather than calling the mechanism twice by
     * hand, because what is under test is the interaction with React's lifecycle.
     */
    mount(
      <React.StrictMode>
        <Theme>
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>Rename something longer</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>
      </React.StrictMode>,
    );
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop();
    if (!popup) throw new Error("the popup never opened");
    // The runner measures in a microtask, so the numbers land one turn after the mount.
    await flushFlight();
    const seed = parseFloat(tokenOn(popup, "--floating-seed"));
    const measured = parseFloat(popup.style.getPropertyValue("--kui-fly-w"));
    expect(measured, `the destination is the seed itself: ${measured}px`).toBeGreaterThan(seed);
  });

  it("the seed is EACH trigger's own box — a 28px icon and a wide button get different seeds (§22, 2026-08-15)", async () => {
    /**
     * The photograph, asserted at both extremes: the seed is a measurement, not a designed
     * constant, so an icon button conjures a small silhouette and a wide form trigger a wide
     * one — and each sits exactly on its own trigger. The two triggers are the calibration:
     * if both silhouettes measured alike, the seed would be a constant wearing a law that
     * cannot tell.
     */
    const seen: number[] = [];
    for (const trigger of [
      <Button size="1" iconOnly aria-label="More">+</Button>,
      <Button style={{ minWidth: "240px" }}>A wide trigger</Button>,
    ]) {
      mount(
        <Theme>
          <Menu defaultOpen>
            <MenuTrigger render={trigger} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>,
      );
      const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop()!;
      const button = [...document.querySelectorAll<HTMLElement>(".kui-button")].pop()!;
      // The flush lets the measurement and its aim run; the frame then lets the runner's own
      // re-aim land before this reads (floating-ui places the positioner asynchronously).
      await flushFlight();
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      const box = button.getBoundingClientRect();
      const seed = popup.getBoundingClientRect();
      expect(Math.abs(seed.width - box.width), "this trigger's own width").toBeLessThan(3);
      expect(Math.abs(seed.height - box.height), "and height").toBeLessThan(3);
      expect(Math.abs(seed.left - box.left), "sitting on this trigger").toBeLessThan(3);
      expect(Math.abs(seed.top - box.top)).toBeLessThan(3);
      seen.push(seed.width);
    }
    expect(Math.abs(seen[0]! - seen[1]!), "the calibration: two triggers, two seeds").toBeGreaterThan(100);
  });

  it("both channels actually MOVE across the entry — declared is not the same as free", async () => {
    /**
     * The one law here that watches real frames, and it exists because every static law in
     * this file passed while the entry was visibly broken (Kushagra, playground: *"it starts
     * at a certain width… then it goes down and it shrinks, and then when it reaches the
     * correct vertical position it expands again"*).
     *
     * The inline channel was declared, listed in the transition, and riding the spring — and
     * `min-width: max(--floating-min-w, --anchor-width)` beat it outright, so the panel
     * snapped to 112px the frame the seed ended and stayed there for the whole entry. A
     * property can be perfectly specified and still have nowhere to go; nothing that reads one
     * moment can tell the difference.
     */
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
            <MenuItem>Beta</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    inMotion();
    const restingBox = document.querySelector<HTMLElement>(".kui-button")!.getBoundingClientRect();
    document.querySelector<HTMLElement>(".kui-button")!.click();
    const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await frame();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop();
    if (!popup) throw new Error("the popup never opened");

    // Sampled across the WHOLE entry, not its first frames: the floor that clamped the width
    // could also come back mid-flight, and a short window cannot see the difference between a
    // channel that finished and one that was cut off.
    //
    // Bounded by the CLOCK and by the panel's own signal, never by a frame count. Thirty-four
    // frames is 566ms on an idle machine and considerably less work than that under a loaded
    // suite, where this law duly failed on its first full run for no reason but scheduling.
    const widths: number[] = [];
    const heights: number[] = [];
    let released = -1;
    const deadline = performance.now() + 2000;
    while (performance.now() < deadline) {
      const box = popup.getBoundingClientRect();
      widths.push(Math.round(box.width));
      heights.push(Math.round(box.height));
      if (!popup.hasAttribute("data-unfurling")) {
        released = widths.length - 1;
        break;
      }
      await frame();
    }
    // The first sampled frame is the trigger's SILHOUETTE (2026-08-15): the entry begins as
    // the trigger's own box and unfurls straight into the panel's.
    expect(
      Math.abs(widths[0]! - restingBox.width),
      "the entry begins at the trigger's own width",
    ).toBeLessThanOrEqual(3);
    expect(
      Math.abs(heights[0]! - restingBox.height),
      "and its height",
    ).toBeLessThanOrEqual(3);
    // Three distinct values is what "it travelled" looks like; a pinned channel reports two
    // (the seed frame, then its destination) and a dead one reports one.
    expect(new Set(widths).size, `width never moved: ${widths.join(",")}`).toBeGreaterThan(2);
    expect(new Set(heights).size, `height never moved: ${heights.join(",")}`).toBeGreaterThan(2);
    // And it grew rather than jumping: no single frame covers most of the distance.
    const distance = Math.max(...widths) - Math.min(...widths);
    const jump = Math.max(...widths.slice(1).map((w, i) => w - widths[i]!));
    // A spring's fastest frame covers about a tenth of the distance at 60fps. A fifth means
    // something let go — the floor coming back mid-flight snaps whatever is left in one frame.
    expect(jump, `width jumped ${jump}px of ${distance}px in one frame`).toBeLessThan(
      distance * 0.2,
    );
    // And the flight is released only once the LAST channel has landed. Keying the release on
    // the vertical (which finishes 160ms earlier) puts the width floor back while the panel is
    // still widening, and the floor beats an animating width — the same clamp, arriving late
    // instead of early. Asserted against the attribute rather than against a duration, so a
    // dropped frame cannot make it flaky.
    expect(released, "the panel never stopped unfurling").toBeGreaterThan(0);
    expect(widths.length, "too few samples to say anything about travel").toBeGreaterThan(5);
    expect(
      Math.abs(widths[released]! - widths[widths.length - 1]!),
      `released at ${widths[released]}px with ${widths[widths.length - 1]}px still to reach`,
    ).toBeLessThanOrEqual(1);
  });

  it("the panel clips while it is not its own size (§22)", async () => {
    const { popup } = await openUnsettled();
    expect(popup.hasAttribute("data-unfurling")).toBe(true);
    expect(computed(popup, "overflow-y")).toBe("clip");
    // And it scrolls again once it has arrived — a long menu is why the panel has an overflow
    // at all, and `overflow-y: auto` computes the OTHER axis to auto with it.
    // The width floor is stood down for the whole flight, not only the seed frame: it means
    // "a settled panel is never narrower than its trigger", and a panel mid-unfurl is
    // deliberately narrower than everything.
    expect(computed(popup, "min-width")).toBe("0px");
    popup.removeAttribute("data-unfurling");
    popup.removeAttribute("data-seed");
    expect(computed(popup, "overflow-y")).toBe("auto");
    expect(parseFloat(computed(popup, "min-width")), "and it comes back").toBeGreaterThan(0);
  });

  it("the silhouette's overlay is PAINT, never layout (§22, 2026-08-15)", async () => {
    // The seed sits on its trigger through a measured TRANSLATE (--kui-from-x/y) and never
    // a margin: a margin is layout — it re-sizes the positioner, which re-solves the
    // panel's position (Kushagra, playground, 2026-08-09).
    const { popup } = await openUnsettled();
    for (const margin of ["margin-block-start", "margin-block-end", "margin-inline-start", "margin-inline-end"]) {
      expect(computed(popup, margin), `${margin}: the overlay must not be layout`).toBe("0px");
    }
    // And the translate is genuinely doing the carrying: the popup's layout box and its
    // painted box must differ while the seed holds, or the overlay is a coincidence of
    // position rather than a mechanism.
    expect(computed(popup, "translate"), "the overlay rides a translate").not.toBe("none");
    // And the pane pivots on the corner the positioner holds, so it settles back into where it
    // grew from rather than into its own middle. The default menu opens below its trigger,
    // aligned to its start: top-left.
    expect(computed(popup, "transform-origin")).toBe("0px 0px");
  });

  it("the pivot follows the side and the align, not the default (§22)", async () => {
    // Calibration for the law above: if every panel pivoted top-left, that assertion would be
    // true for the wrong reason. A menu aligned to its trigger's end holds the OTHER corner.
    // `mount`, not this file's settling `render` — a landed panel has no lean left to read.
    mount(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent align="end">
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop()!;
    expect(popup.getAttribute("data-align")).toBe("end");
    const [x] = computed(popup, "transform-origin").split(" ");
    expect(parseFloat(x!), "an end-aligned panel pivots on its end edge").toBeGreaterThan(0);
    // The measured overlay needs no per-align arm — the same measurement lands the seed on
    // the trigger here too, from the panel's OTHER corner. The flush lets the measurement and
    // its aim run; the frame then lets the runner's own re-aim land before this reads — a bare
    // frame registered before the runner's would be read FIRST and catch the panel unaimed.
    await flushFlight();
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const button = [...document.querySelectorAll<HTMLElement>(".kui-button")].pop()!;
    const box = button.getBoundingClientRect();
    const seed = popup.getBoundingClientRect();
    expect(Math.abs(seed.left - box.left), "on the trigger, end-aligned too").toBeLessThan(3);
    expect(Math.abs(seed.top - box.top)).toBeLessThan(3);
  });

  it("a submenu holds the edge it emerged through, not the one a menu holds (§22)", async () => {
    await openUnsettled({}, (
      <MenuSub defaultOpen>
        <MenuSubTrigger>More</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>Deep</MenuItem>
        </MenuSubContent>
      </MenuSub>
    ));
    // By ANATOMY: the child is the panel that does NOT wear the anchor-width floor, which only
    // a top-level popup carries. An index here is the stale-subject bug this file has been
    // caught by twice.
    const panels = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")];
    const child = panels.find((el) => !el.classList.contains("kui-menu-anchored"));
    const parent = panels.find((el) => el.classList.contains("kui-menu-anchored"));
    if (!child || !parent) throw new Error("the submenu never mounted");
    expect(child).not.toBe(parent);
    // A submenu opens toward the inline END, so the edge its positioner holds is the START
    // one — the axis a top-level menu answers with `align` is the one a submenu answers with
    // `side`, and the pivot follows it without a rule of the submenu's own.
    expect(child.getAttribute("data-side")).toMatch(/right|inline-end/);
    expect(computed(child, "transform-origin")).toBe("0px 0px");
    expect(computed(child, "margin-inline-start")).toBe("0px");
    // A submenu's seed is its trigger ROW's silhouette (2026-08-15) — the same measured
    // overlay every anchor gets, no arm of its own. The 2026-08-10 morph refused this
    // (its lean flew the row in from the side); measurement removed the objection.
    expect(child.hasAttribute("data-seed"), "the read must land on the seed frame").toBe(true);
    // One frame for the aim.
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const row = parent.querySelector<HTMLElement>(".kui-menu-sub-trigger, [data-popup-open]")!;
    const rowBox = row.getBoundingClientRect();
    const seed = child.getBoundingClientRect();
    expect(Math.abs(seed.left - rowBox.left), "sitting on its own trigger row").toBeLessThan(3);
    expect(Math.abs(seed.top - rowBox.top)).toBeLessThan(3);
    expect(Math.abs(seed.width - rowBox.width), "the row's own width").toBeLessThan(3);
    expect(Math.abs(seed.height - rowBox.height), "and height").toBeLessThan(3);
  });
});

describe("a portalled panel is glass again — the escape the stacking rule needs (§10, §20)", () => {
  it("a menu opened from inside a glass Card still paints its own pane", () => {
    // The subtle half of "glass does not stack". React context follows the TREE, so a menu
    // triggered from inside a glass card is — as far as React is concerned — inside that
    // card's glass scope, and a naive scope would render the panel solid. It is not inside it
    // on screen: the panel paints over the page. `PortalScope` renders the bare Theme §20
    // already requires, a Theme resets the mark, and the panel resolves the app's material.
    //
    // The negative control is the card itself, which must stay glass: without it, a rule that
    // switched the whole app to solid would satisfy the assertion below.
    let panel: HTMLElement | null = null;
    const host = render(
      <Theme material="regular">
        <Card id="host">
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent ref={(n: HTMLDivElement | null) => void (panel = n)}>
              <MenuItem>Alpha</MenuItem>
            </MenuContent>
          </Menu>
        </Card>
      </Theme>,
    );
    const card = host.querySelector<HTMLElement>("#host")!;
    expect(card.dataset["material"], "the card is the negative control").toBe("regular");
    if (!panel) throw new Error("the panel never mounted — the law below would assert nothing");
    const p = panel as HTMLElement;
    expect(p.dataset["material"]).toBe("regular");
    expect(computed(p, "backdrop-filter")).not.toBe("none");
  });

  it("but a card composed INSIDE that panel is solid — the rule still holds one level in", () => {
    let panel: HTMLElement | null = null;
    render(
      <Theme material="regular">
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent ref={(n: HTMLDivElement | null) => void (panel = n)}>
            <Card id="inner" />
          </MenuContent>
        </Menu>
      </Theme>,
    );
    if (!panel) throw new Error("the panel never mounted");
    const p = panel as HTMLElement;
    expect(p.dataset["material"]).toBe("regular");
    const inner = p.querySelector<HTMLElement>("#inner")!;
    expect(inner.dataset["material"]).toBeUndefined();
    expect(computed(inner, "backdrop-filter")).toBe("none");
  });
});
