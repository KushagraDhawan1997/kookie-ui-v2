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
  render,
  computed,
  probeIn,
  tokenOn,
  colorOn,
  ownColor,
  forEachCell,
  APPEARANCES,
  DENSITIES,
  until,
  type Cell,
} from "../../test/browser.tsx";

/** Every axis off its default — a dropped attribute is visible (the §20 constant). */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  depth: "elevated",
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
  return { host, popup, pad: padBox(popup), items: [...popup.querySelectorAll<HTMLElement>(".kui-menu-item")] };
}

/**
 * The element carrying the panel's PHYSICAL padding, and the one that clips (2026-08-17).
 *
 * Until ScrollArea the popup was both: it padded its rows and, being `overflow-y: auto`, it
 * was the scroll container whose padding box clipped their ink. The list now scrolls inside a
 * ScrollArea viewport, so the popup keeps the geometry that is about the PANE — its corner,
 * its bounds, its cast — and the viewport took the padding and the clipping with the
 * scrolling. Every law below that used to read `popup` for a distance INSIDE the panel reads
 * this instead; the ones about the pane itself still read the popup, which is the split worth
 * keeping visible. Throws rather than falling back to the popup: a silent fallback would let
 * this whole group go green against a menu that had lost its viewport entirely.
 */
function padBox(popup: HTMLElement): HTMLElement {
  const viewport = popup.querySelector<HTMLElement>(".kui-scroll-viewport");
  if (!viewport) throw new Error("the menu's scroll viewport never mounted — it carries the panel's padding");
  return viewport;
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
  /**
   * The class list and the row's, READ OFF A REAL POPUP rather than restated (2026-08-23).
   *
   * The twin used to carry hand-written copies, and the day the popup's identity changed —
   * `kui-floating-rows` joining it when Popover split the concentric corner off `kui-floating`
   * — three of these laws failed on a correct component, because the fixture was the stale
   * half. A fixture that restates what it is comparing against is the second home this repo
   * keeps finding in shipped code, and it is no better in a law.
   */
  function identities(): { popup: string; row: string } {
    const { popup, items } = openMenu({});
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
    // The twin takes its identity from the popup THIS law mounts, assigned after the render
    // rather than read from a menu of its own (2026-08-23). Two reasons, and the second is the
    // one that bit: `identities()` mounts a real menu, so calling it inside the JSX replaces
    // the tree being rendered, and calling it before leaves an extra portal in the document —
    // which this law's `document.querySelector(".kui-portal .kui-menu-popup")` then finds
    // FIRST, so the subject became the spare LTR menu. The law's own comment already says an
    // index is not an identification; an anatomy selector is not one either once a second
    // thing shares the anatomy.
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
    twinEl.className = popup.className;
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
      // THE FLOOR FIRST, because it is the guarantee and everything after it is the spelling.
      // This assertion is what the law was missing (2026-08-26 audit): the box check below
      // re-derives the very sum the stylesheet computes, so it agreed with the CSS whatever the
      // CSS said — the tautology this repo names as its own defect class. At fine + compact +
      // size 1 that sum is 16 + 2 + 2 = 20 and every assertion here passed on it.
      // §16 tier 1: "No designed cell in any pointer world at any density may fall below it."
      // The 24 is a LITERAL on purpose: reading it from the token would re-import the same
      // circularity, since the token is what the rule under test consumes.
      expect(row.getBoundingClientRect().height, `${label} is under the §16 floor`).toBeGreaterThanOrEqual(24);
      // FLOORED, not `auto`. The skeleton's control height stands down — that is the notch —
      // but the floor does not: `min-height: var(--target-min)`.
      expect(computed(row, "min-height"), label).toBe(tokenOn(popup, "--target-min"));
      const sum =
        parseFloat(computed(row, "line-height")) + 2 * parseFloat(tokenOn(popup, `--row-inset-${cell.size}`));
      expect(row.getBoundingClientRect().height, label).toBeCloseTo(
        Math.max(parseFloat(tokenOn(popup, "--target-min")), sum),
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
      /* Full width: the row spans the panel's content box exactly.

         MEASURED IN ONE CURRENCY (2026-09-10). This subtracted the padding from `clientWidth`,
         which is an INTEGER, and compared it against a rect width, which is not — so the two
         sides could disagree by up to a pixel for no reason but rounding. It survived while the
         numbers happened to land whole and failed the day the panel band moved the inset:
         `fine/default/3: expected 81.5 to be close to 82`, a difference of exactly the
         tolerance, with nothing wrong on screen. Both sides are fractional now and come from
         the same source. */
      const box = padBox(popup);
      const boxRect = box.getBoundingClientRect();
      const inset = (side: "left" | "right") =>
        parseFloat(computed(box, `padding-${side}`)) + parseFloat(computed(box, `border-${side}-width`));
      expect(row.getBoundingClientRect().width, label).toBeCloseTo(
        boxRect.width - inset("left") - inset("right"),
        1,
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
    it(`${appearance}: highlighted paints the quiet HALF-step; un-highlighted rest is transparent`, () => {
      // Re-keyed 2026-08-26: this law used to pin lit ≡ full --tone-soft, which was the
      // defect stated as a guarantee — full soft is what a SELECTED (medium-resting) row
      // wears, so a hovered row and a selected one were byte-identical. The lit value is now
      // the mixed half-step; the half-step law at the end of this file owns the "less than
      // soft" claim, and this one keeps the two clauses only it can make: the highlight is
      // VISIBLE, and the un-highlighted sibling rests transparent.
      const { popup, items } = openMenu({ appearance });
      // Base UI highlights on keyboard: ArrowDown from the open popup lands on Alpha.
      popup.focus();
      flushSync(() => {
        popup.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      });
      const [alpha, beta] = items;
      if (!alpha || !beta) throw new Error("rows missing");
      expect(alpha.hasAttribute("data-highlighted"), "ArrowDown highlighted the first row").toBe(true);
      const lit = computed(alpha, "background-color");
      expect(lit, "the highlight is invisible").not.toBe("rgba(0, 0, 0, 0)");
      expect(lit, "the mix collapsed back to full soft").not.toBe(colorOn(popup, "var(--tone-soft)"));
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
      // Checked speaks accent through the INDICATOR (reversed 2026-08-09): the tick wears the
      // family at full chroma and the LABEL stays the row's ordinary ink — the whole-row
      // --accent-label ink read as dark emphasis, not selection.
      //
      // --accent-GLYPH since 2026-08-23, not the mark family's solid. The comment that used to
      // stand here said "the mark family's own bright solid" and justified it by the non-text
      // floor a glyph owes; measured, the solid is one hex in both appearances and misses that
      // floor on the dark page (|Lc| 43.4 against 45). The mark family's ON state does NOT
      // follow, and the divergence is principled rather than an oversight: a checked box is a
      // filled AREA and answers `nonTextLarge` (30), which the solid clears with room. Same
      // family, two floors, because the marks are two sizes.
      const indicator = ticked.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!indicator) throw new Error("indicator slot missing");
      expect(computed(indicator, "color")).toBe(colorOn(popup, "var(--accent-glyph)"));
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
        const pad = parseFloat(computed(padBox(popup), "padding-top"));
        // Lab port 2026-08-17: the panel is a SURFACE, and under `@supports (corner-shape:
        // squircle)` a surface draws its authored corner × --kui-corner-k (1.613). The ROW's
        // corner is NOT multiplied — controls never take squircle — so the concentric sum is
        // still authored as rowCorner + pad, and the knob applies once, to the panel's paint.
        // Derived through a probe inside the same panel so a non-squircle engine (knob
        // fallback 1) passes unchanged, and a re-priced knob moves both sides.
        const expected = parseFloat(
          probeIn(
            popup,
            (el) => (el.style.borderRadius = `calc(${rowCorner + pad}px * var(--kui-corner-k, 1))`),
            (s) => s.borderTopLeftRadius,
          ),
        );
        expect(
          parseFloat(computed(popup, "border-top-left-radius")),
          `${radius} × size ${size}`,
        ).toBeCloseTo(expected, 1);
      }
    }
    // Concentric arithmetic is undefined at zero: `none` means square, not "rounded by
    // exactly the padding" — the guard the formula needs, asserted where it bites.
    const { popup } = openMenu({ radius: "none" });
    expect(computed(popup, "border-top-left-radius")).toBe("0px");
  });

  it("padding and min-width are the menu's own designed tokens", () => {
    const { popup, pad } = openMenu({});
    // The padding is the panel's fact and the viewport is where it is SPENT (2026-08-17) —
    // read on the element that now applies it. The NAME moved 2026-09-07: `--floating-p` was one
    // flat value for every floating pane, and the panel band replaced it with a ladder the whole
    // family reads through `--kui-panel-p`. A law still reading the retired name asserts nothing,
    // because an unset token resolves to zero through the width probe and 0 is not 12.
    expect(computed(pad, "padding-top")).toBe(tokenOn(popup, "--kui-panel-p"));
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

    // The anchored panel takes the anchor when it is wider than the floor. Injected on the popup
    // itself, which overrides the value the positioner hands down.
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
    expect(child.classList.contains("kui-floating-anchored")).toBe(false);
    child.style.setProperty("--anchor-width", wide);
    expect(parseFloat(computed(child, "min-width")), "a submenu must not inherit panel width").toBe(
      floor,
    );
  });

  /* The floor's CAP half, which had no law at all (2026-08-26 audit). menu.css wraps the
     anchor floor in `min(…, max(--floating-min-w, --available-width))` — the 2026-08-22
     repair for "in CSS a minimum beats a maximum", whose own comment records the measured
     symptom: `side="right"` on a 900px trigger painted 951px at x=967 in a 1280 window, 638px
     off screen with the items unreachable. Nothing read it. The law above is entailed by the
     un-capped floor and the bounds law reads `max-width`, which a minimum overrules — so
     reverting to the pre-2026-08-22 spelling left the whole suite green. Select carries this
     law; the 2026-08-09 audit landed the repair in one sibling only, and this is the same
     sentence in the file that owns the declaration. */
  it("the available room OUTRANKS the anchor — a minimum cannot be capped by a maximum (§22)", () => {
    const { popup } = openMenu({});
    const floor = parseFloat(tokenOn(popup, "--floating-min-w"));
    // Both are the positioner's own reports, supplied on the popup so each arm is exercised
    // directly: --anchor-width is the trigger's width, --available-width is the room.
    popup.style.setProperty("--anchor-width", "900px");
    popup.style.setProperty("--available-width", "300px");
    expect(
      popup.getBoundingClientRect().width,
      "a trigger wider than the room must not push the panel off screen",
    ).toBeLessThanOrEqual(301);
    // ...and the designed floor still holds when the reported room is absurd, so the cap
    // cannot squeeze the panel below the minimum it exists to guarantee. The inner max() is
    // what makes these two claims compatible; a law with only the first half would pass on a
    // panel that had simply become the room.
    popup.style.setProperty("--available-width", "10px");
    expect(
      popup.getBoundingClientRect().width,
      "the designed floor survives an absurd room",
    ).toBeGreaterThanOrEqual(floor);
  });

  it("a flat popup casts NOTHING — flat means flat, floating panes included (2026-08-19)", () => {
    // Reverses this law's own previous claim ("the popup casts in BOTH worlds", the
    // 2026-08-09 coverage-is-information amendment): separation in flat is the hairline's
    // job now, so the half-faded cast retired. The elevated popup is the negative control —
    // the same pane in the other world must still cast a real shadow.
    for (const depth of DEPTHS) {
      let card: HTMLElement | null = null;
      render(
        <Theme depth={depth}>
          <Card ref={(n: HTMLDivElement | null) => void (card = n)}>plain</Card>
        </Theme>,
      );
      const { popup } = openMenu({ depth });
      const cast = computed(popup, "box-shadow");
      if (depth === "flat") {
        // Every layer of the popup's list must be invisible — the pool and the world cast
        // both stand down to no-op layers, and how MANY no-op layers the list holds is
        // mechanism, not appearance. Zero geometry AND zero alpha per layer: a transparent
        // shadow with real offsets would also be invisible today, but it would be a value
        // waiting to paint the moment a color arrives.
        expect(cast, "flat popup resolves a real list").not.toBe("none");
        for (const layer of cast.split(/,(?![^(]*\))/)) {
          expect(layer, "a flat popup layer must be the no-op").toMatch(
            /^\s*rgba\(0, 0, 0, 0\) 0px 0px 0px 0px\s*$/,
          );
        }
        // ...and the flat world itself is intact: the card beside the menu casts nothing
        // either. Seat only (lab port 2026-08-17): flat removes the cast, never the pool.
        const seat = document.createElement("div");
        seat.style.boxShadow = "var(--material-pool-solid), 0 0 0 0 transparent";
        card!.append(seat);
        expect(computed(card!, "box-shadow"), "flat Card must stay flat").toBe(computed(seat, "box-shadow"));
        seat.remove();
      } else {
        expect(cast, "elevated popup still casts").not.toBe("none");
        // Visible means at least one layer with real alpha — a computed no-op list would
        // read rgba(0, 0, 0, 0) only.
        const alphas = [...cast.matchAll(/rgba?\([^)]*?([\d.]+)\)/g)].map((m) => parseFloat(m[1]!));
        expect(Math.max(0, ...alphas), "elevated cast is visible").toBeGreaterThan(0);
      }
    }
  });

  it("a glass popup keeps the floating cast in both worlds — coverage outranks transmission", () => {
    // Since the pool port (2026-08-17) the two popups differ in their FIRST layer by design —
    // glass wears the pane's bottom shade, solid its seat line — so the claim is about the
    // CAST: everything after the pool must be byte-identical, the floating chrome in both
    // worlds. Comparing whole strings again would quietly re-litigate the pool.
    // Lab port 2026-08-17: split on LAYER commas, not on the first "px," — the glass pool
    // serializes as "… -14px inset," (no "px,"), so the old slice ate the pool AND the
    // contact row and compared unequal tails. Commas inside rgb(…) are excluded by the
    // lookahead; layer one is dropped, the cast is the rest.
    // The pool is not one layer (2026-09-17: bottom shade, rim glow, top catch), so the cut
    // is the POOL'S OWN layer count read off the token the glass rule consumes — a number
    // written here would be a second home for how many layers matter has.
    const layersOf = (shadow: string) => shadow.split(/,(?![^(]*\))/).map((l) => l.trim());
    const poolLayers = (el: HTMLElement) =>
      layersOf(
        probeIn(
          el,
          (probe) => (probe.style.boxShadow = "var(--kui-surface-pool, 0 0 0 0 transparent)"),
          (st) => st.boxShadow,
        ),
      ).length;
    const castOf = (shadow: string, n: number) => layersOf(shadow).slice(n).join(", ");
    for (const depth of DEPTHS) {
      const { popup: solidPopup } = openMenu({ depth });
      // The solid popup's first layer is its seat line — one layer, whatever the glass pool is.
      const solidShadow = castOf(computed(solidPopup, "box-shadow"), 1);
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
      const glassShadow = computed(g, "box-shadow");
      const n = poolLayers(g);
      expect(castOf(glassShadow, n), `${depth} glass cast`).toBe(solidShadow);
      // And the first layer is the WORLD's surface pool, or the cast comparison above is
      // comparing tails of two one-layer lists and proving nothing. Lab port 2026-08-17:
      // read the first LAYER (the old first-"px," slice never contained the pool at all)
      // against the same token the glass rule consumes — `--kui-surface-pool` rides the
      // world pointers, so elevated resolves the inset shade and flat stands it down to
      // the list-legal no-op ("flat means flat": the pool is matter, and flat quiets it
      // with the same stroke as the chrome).
      const pool = layersOf(glassShadow).slice(0, n).join(", ");
      const expectedPool = probeIn(
        g,
        (el) => (el.style.boxShadow = "var(--kui-surface-pool, 0 0 0 0 transparent)"),
        (s) => s.boxShadow,
      );
      expect(pool, `${depth} glass pool is the world's`).toBe(expectedPool);
      // The teeth: in the elevated world that pool really is an inner shade — without this,
      // a world that stopped declaring the pool entirely would satisfy the equality above.
      if (depth === "elevated") expect(pool, "elevated glass pool is inner").toContain("inset");
    }
  });
});

/* ── Behavior smoke (Base UI's machine, one assertion per claim) ──────────────────────── */

/* ── The trigger's type surface (§5, §23's shape — 2026-08-26 audit) ───────────────────── */

describe("MenuTrigger takes the platform's button props, and only the system's are refused", () => {
  /**
   * `MenuTriggerProps` was a hand-written object literal of seven members until 2026-08-26 —
   * the last hand-listed trigger type in the floating family, where `SelectTriggerProps`,
   * `ButtonPartProps` and `DialogTriggerProps` are all `Omit<ComponentPropsWithoutRef<"button">,
   * …>`. It closed the type against `id`, `form`, `tabIndex`, `autoFocus`, `onClick` and the
   * focus handlers while TypeScript's hyphenated-name exemption waved `aria-*` and `data-*`
   * straight through undeclared — so it simultaneously blocked props that work and admitted
   * props it never named. `id` is the load-bearing one: it is what an external `<label for>`
   * and an `aria-controls` need, and the spread has always carried it to the DOM.
   *
   * This is a TYPE law and it fails under `tsc`, not under the runner — the props reached the
   * element either way, which is exactly why the defect was invisible to every mounted law in
   * this file. The runtime half below is the calibration: it proves the type is describing an
   * element that really does take these.
   */
  it("accepts the platform's own props on the trigger", () => {
    void (
      <MenuTrigger
        id="more-actions"
        form="settings"
        tabIndex={-1}
        autoFocus
        onClick={() => {}}
        onFocus={() => {}}
        aria-controls="panel"
      >
        Open
      </MenuTrigger>
    );
  });

  it("still refuses what the system owns", () => {
    // @ts-expect-error — colour is resolved output; a control never takes a raw fill (§9)
    void (<MenuTrigger color="red" />);
    // @ts-expect-error — no margin prop on any control (the first non-negotiable)
    void (<MenuTrigger m="4" />);
  });

  it("an id given to the trigger reaches the button a `<label for>` would point at", () => {
    const host = render(
      <Theme>
        <Menu>
          <MenuTrigger id="more-actions" render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const trigger = host.querySelector<HTMLElement>("button");
    if (!trigger) throw new Error("the trigger never rendered");
    expect(trigger.id, "the id lands on the rendered button").toBe("more-actions");
  });
});

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
    // UNMOUNTED is a STATE, not the next statement: Base UI takes the popup down a frame or
    // more after the key, once its own exit bookkeeping has run. A popup that genuinely never
    // unmounts still expires the deadline into the same assertion — falsified with a
    // controlled-open menu, which fails at the full deadline with the honest received node.
    await until(() => document.querySelector(".kui-menu-popup") === null, 3000);
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
    // 2026-08-26: the lit value became the quiet HALF-step (mixed toward transparent), so
    // this law stopped pinning full --tone-soft and now records the LIT value itself, then
    // proves the popup-open arm reaches it alone. What it must not be: transparent (unlit)
    // or full soft (the mix collapsed).
    const litFill = computed(sub, "background-color");
    expect(litFill).not.toBe("rgba(0, 0, 0, 0)");
    expect(litFill, "the mix collapsed back to full soft").not.toBe(colorOn(popup, "var(--tone-soft)"));
    // ...and it is [data-popup-open] that does it. Base UI sets data-highlighted on this row
    // too, so the assertion above passed with the popup-open arm of the rule DELETED (audit
    // 2026-08-09) — a law naming a mechanism it never reached. Isolated by hand: the
    // attribute alone, on a row the highlight has left.
    sub.removeAttribute("data-highlighted");
    expect(computed(sub, "background-color"), "the popup-open arm must light it alone").toBe(litFill);
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
});

/* ── The panel's interior (§22) ───────────────────────────────────────────────────────── */

describe("what the panel does to what is inside it (§22)", () => {
  /* The separator is INSET TO THE LABELS (2026-08-31; it was inset to the rows' own extent
     from 2026-08-09, and full-bleed before that — the same argument applied one layer further
     each time). It divides what the reader groups, which is the words, so it starts and ends
     where a bare-edged row's TEXT does. Two facts, and the group arm is why the law exists at
     all — a group is a transparent wrapper, so a separator between one group's rows must land
     exactly where a loose one does. Asserted against a ROW's own computed padding rather than
     a number, so `--kui-sf-row-px` and the control join's pill token cannot drift apart
     silently. Falsified three ways: dropping `margin-inline` lands it on the row's border box,
     restoring the old negative margin lands it on the panel's, and dropping the group arm from
     the selector fails the agreement arm. */
  it("a separator spans the labels, not the rows — in a group or out of one", () => {
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
    // Calibration, both boundaries this law has to tell apart: the panel's padding is a real
    // distance (so "the labels" and "the panel" differ), and so is the row's own (so "the
    // labels" and "the rows" differ — without this the law passes on the pre-fix stylesheet).
    expect(parseFloat(computed(padBox(popup), "padding-left")), "nothing to inset").toBeGreaterThan(0);
    expect(parseFloat(computed(row, "padding-left")), "no label inset to find").toBeGreaterThan(0);
    // The row's CONTENT box — where its label starts and ends — both edges, both separators.
    const rowBox = row.getBoundingClientRect();
    const textLeft = rowBox.left + parseFloat(computed(row, "padding-left"));
    const textRight = rowBox.right - parseFloat(computed(row, "padding-right"));
    for (const [name, el] of [["loose", loose], ["grouped", grouped]] as const) {
      const box = el.getBoundingClientRect();
      expect(Math.abs(box.left - textLeft), `${name} starts where a label does`).toBeLessThanOrEqual(0.5);
      expect(Math.abs(box.right - textRight), `${name} ends where a label does`).toBeLessThanOrEqual(0.5);
    }
    // And BOTH keep the panel's own rhythm above and below — which is now the only thing
    // the group arm of the selector supplies, so asserting it on the loose one alone left
    // that arm unfalsifiable (caught by its own sabotage pass: dropping the group arm from
    // the selector left this law green). A law about one member of a two-member rule is
    // half a law, the same lesson the Progress axis taught.
    for (const [name, el] of [["loose", loose], ["grouped", grouped]] as const) {
      expect(computed(el, "margin-top"), `${name} rhythm above`).toBe(computed(padBox(popup), "padding-top"));
      expect(computed(el, "margin-bottom"), `${name} rhythm below`).toBe(computed(padBox(popup), "padding-top"));
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

  it("the panel's clip is permanent, and the viewport inside it is what scrolls (§22)", () => {
    const { popup } = openMenu({});
    // The list scrolls inside a ScrollArea viewport, so the popup's clip is the pane's own
    // boundary rather than a scrollport. `clip`, and the word is the point: a hidden box is a
    // scroll container, and the pane wants a boundary it never scrolls. The declaration is the
    // base surface rule's, which is why this reads through from the pane.
    expect(computed(popup, "overflow-y")).toBe("clip");
    // `auto` since 2026-09-11, and the word is the point again. Base UI writes `overflow:
    // scroll` INLINE on its viewport, and an inline declaration beats every rule — so a
    // context that needs this box not to scroll could not say so without `!important`, which
    // this package refuses. The one that needs it is a window Shell on a phone, where the
    // page scrolls and the viewport must stop being a scroll container or nothing inside it
    // can stick (§27). The ScrollArea's render function strips the inline value, and
    // scroll-area.css has always declared `auto` here, so what moved is which declaration
    // wins — never what renders, because the native bar is hidden in both spellings
    // (scrollbar-width: none) and the custom thumb is what a reader sees.
    expect(computed(padBox(popup), "overflow-y")).toBe("auto");
    expect(parseFloat(computed(popup, "min-width")), "the width floor holds").toBeGreaterThan(0);
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
        parseFloat(computed(padBox(parent), "padding-top")) +
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

  it("a MIRRORED submenu lands on the seam too (§22, 2026-08-22)", async () => {
    /**
     * Base UI's `getLogicalSide` returns the logical pair whenever the side is logical and a
     * submenu defaults to `inline-end`, so a menu in the RIGHT half of the window flips to
     * `inline-start`. The child then has to sit against the parent's LEADING edge — the seam —
     * with its own right edge on it.
     *
     * The law above cannot see this: its fixture sits in the middle of the window, so the
     * submenu can resolve ONLY `inline-end` — the one cell that was already right. This one
     * pins the trigger to the right of the window so the placement has to mirror, and asserts
     * against the seam.
     */
    const { userEvent } = await import("vitest/browser");
    render(
      <Theme>
        {/* Pinned RIGHT, which is the whole fixture: a submenu only mirrors when there is no
            room for it on the trailing side. */}
        <div style={{ position: "fixed", right: 20, top: 40 }}>
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Actions</Button>} />
            <MenuContent>
              <MenuItem>A fairly long first item label</MenuItem>
              <MenuSub>
                <MenuSubTrigger>More options over here</MenuSubTrigger>
                <MenuSubContent>
                  <MenuItem>Sub A</MenuItem>
                  <MenuItem>Sub B</MenuItem>
                </MenuSubContent>
              </MenuSub>
            </MenuContent>
          </Menu>
        </div>
      </Theme>,
    );

    // Opened by HOVER alone, never a click: a press would leave the page in pointer modality,
    // and the ring law below reads `:focus-visible` off a programmatic focus.
    const parent = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop()!;
    const rows = [...parent.querySelectorAll<HTMLElement>(".kui-row")];
    const subTrigger = rows.find((r) => r.textContent?.includes("More options"))!;
    await userEvent.hover(subTrigger);
    await until(() => document.querySelectorAll(".kui-menu-popup").length > 1);
    const sub = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].find((el) => el !== parent)!;
    // Placement is floating-ui's and resolves from a promise, so the landing is waited for as a
    // state; a submenu that never lands on the seam expires the deadline into the same assertion.
    const offSeam = () => Math.abs(sub.getBoundingClientRect().right - parent.getBoundingClientRect().left);
    await until(() => sub.parentElement?.getAttribute("data-side") === "inline-start" && offSeam() < 0.5);

    // THE PREMISE: the placement really did mirror. Without this the law passes on the
    // un-mirrored cell, which the law above already covers.
    expect(
      sub.parentElement?.getAttribute("data-side"),
      "the fixture did not mirror, so this law is measuring the cell that already worked",
    ).toBe("inline-start");
    expect(sub.getBoundingClientRect().right, "it lands on the seam").toBeCloseTo(
      parent.getBoundingClientRect().left,
      0,
    );
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

      // The CLIPPER is the subject, and since 2026-08-17 that is the scroll viewport rather
      // than the popup: clearance has to exist wherever the clipping happens, which is the
      // whole reason the padding moved with the scrolling instead of staying on the pane.
      const box = padBox(popup);
      const pad = parseFloat(computed(box, "padding-left"));
      expect(pad, `${density}: the panel must clear the ring`).toBeGreaterThanOrEqual(reach);
      // Both axes, because both are clipped — the one-sided-law lesson (Progress, 2026-08-08).
      expect(parseFloat(computed(box, "padding-top")), density).toBeGreaterThanOrEqual(reach);
    }
  });

  /* The lit row is a signal, not resting dress, so the conformance surface must reach it
     (§19's rule, amended 2026-08-09). Falsified by deleting the [data-contrast="high"] arm.

     BOTH WORLDS since 2026-08-26. This law's fixture was solid-only, and the glass shape is
     where the arm actually lost: the pane's wash rule (surfaces.css) ties the HC arm at
     (0,4,0) and wins on source order, so a glass menu under contrast="high" kept the wash
     under a label that had already flipped to --tone-contrast — a near-white word on a faint
     wash, found by eye in the docs chrome (Theme material="thin"). The degenerate-fixture
     rule verbatim: the input never held the case where the general claim and the special one
     answer differently. Falsified by deleting the glass HC arm in surfaces.css — the solid
     cells stay green and only the glass cells fail, which is the defect's own shape. */
  it("contrast=high moves the lit fill — both appearances, solid AND glass (§19)", () => {
    for (const appearance of APPEARANCES) {
    for (const material of [undefined, "thin" as const]) {
      const normal = openMenu(material ? { appearance, material } : { appearance });
      const high = openMenu(
        material ? { appearance, contrast: "high", material } : { appearance, contrast: "high" },
      );
      const lit = (m: ReturnType<typeof openMenu>) => {
        const row = m.items[0]!;
        row.setAttribute("data-highlighted", "");
        return computed(row, "background-color");
      };
      const cell = `${appearance}/${material ?? "solid"}`;
      const before = lit(normal);
      const after = lit(high);
      // The ink follows the fill: a fill that moves under ink that does not is the half-fix.
      expect(computed(high.items[0]!, "color"), cell).toBe(
        colorOn(high.popup, "var(--tone-contrast)"),
      );
      // Calibration: the normal-mode fill is a real colour, not the transparent rest.
      // (2026-08-26: the lit value is the quiet half-step, so this stopped pinning full
      // --tone-soft — "not transparent" is the calibration this clause was always for.)
      expect(before, cell).not.toBe("rgba(0, 0, 0, 0)");
      expect(after, `${cell}: high contrast must move the highlight`).not.toBe(before);
      expect(after, cell).toBe(colorOn(high.popup, "var(--tone-solid)"));
    }
    }
  });

  /* The THIRD thing riding that fill (2026-08-10). The law above asserted the fill and the
     label and stopped, so the tick kept standing on the solid rung in --accent-solid: merely
     ugly in light (5.21:1) and a genuine failure in dark, where the row is near-white and the
     blue measures 2.65:1 against the 3:1 a non-text indicator owes — under the floor, on the
     conformance surface. Falsified by deleting the tick arm from recipes.css. */
  it("contrast=high moves EVERY slot on a lit row, not just the indicator (§19, §21)", () => {
    /**
     * ADDED 2026-08-23 (ultracode audit), and the fixture is the whole point.
     *
     * The two laws around this one mount `openMenu()`'s default items, which carry NO leading
     * icon — so when the same day's `.kui-row > [data-slot="leading"]` rule took the icon out
     * of the inherited colour chain, every high-contrast law here stayed green while a lit
     * row's icon painted the glyph ON the solid fill underneath it: measured APCA Lc 0.0 in 14
     * of 20 tone x appearance cells and under the non-text floor in all 20. A degenerate
     * fixture, in the exact sense the 2026-08-20 rule names — the input could not tell a
     * correct implementation from a broken one, because the input had no icon.
     *
     * So this law states its own item WITH an icon, and reads the icon rather than the tick.
     */
    for (const appearance of APPEARANCES) {
      const { popup, items } = openMenu(
        { appearance, contrast: "high" },
        <MenuItem leading={<span data-probe>▲</span>}>Alpha</MenuItem>,
      );
      const row = items[0]!;
      const icon = row.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!icon) throw new Error("no leading slot — the law would assert nothing");

      // Calibration first: the row must actually BE lit, or every assertion below is about an
      // unlit row and passes for the wrong reason.
      row.setAttribute("data-highlighted", "");
      expect(computed(row, "background-color"), `${appearance}: the row is not lit`).toBe(
        colorOn(popup, "var(--tone-solid)"),
      );

      // The icon rides the fill it sits on, exactly as the label does.
      expect(computed(icon, "color"), `${appearance}: the icon did not follow the fill`).toBe(
        colorOn(popup, "var(--tone-contrast)"),
      );
      expect(computed(icon, "color"), `${appearance}: icon and label disagree`).toBe(
        computed(row, "color"),
      );
      // And it is NOT the glyph — the value it wore before the fix, and the one that measured
      // Lc 0.0 against this very fill.
      expect(computed(icon, "color"), `${appearance}: the icon is still the glyph`).not.toBe(
        colorOn(popup, "var(--tone-glyph)"),
      );
    }
  });

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
      // every checked row in the panel. (--accent-GLYPH since 2026-08-23: a tick is fine
      // detail and owes the non-text floor, which the solid missed on the dark page.)
      expect(computed(tick, "color"), `${appearance}: an unlit tick keeps the accent`).toBe(
        colorOn(popup, "var(--accent-glyph)"),
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
        colorOn(popup, "var(--accent-glyph)"),
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

  /**
   * A PANEL BOUNDARY resets the group question (2026-08-26 audit).
   *
   * `MenuInGroupContext` was set by `MenuGroup` and never reset by a popup, and React context
   * follows the tree rather than the DOM — so a `MenuSub` composed inside a `MenuGroup` (the
   * canonical shadcn dropdown shape this file's component header says it adopted) carried that
   * group across the portal into a panel that is not inside it. A `MenuLabel` in the child
   * panel then took Base UI's GroupLabel part, whose effect registers its id with whatever
   * group context it can see: the PARENT group announced the submenu's heading while the
   * submenu was open, and Base UI's own cleanup (`setLabelId(undefined)`) stripped the group's
   * accessible name outright when the submenu closed. Both halves are read here, because the
   * one that survives a close is the one a screen reader user is left with.
   */
  it("a label in a submenu names its own panel, and leaves the parent group's name alone (§22)", async () => {
    let closeSub: (() => void) | null = null;
    function Nested() {
      const [subOpen, setSubOpen] = React.useState(true);
      closeSub = () => setSubOpen(false);
      return (
        <Theme>
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuGroup>
                <MenuLabel>File</MenuLabel>
                <MenuItem>New</MenuItem>
                <MenuSub open={subOpen}>
                  <MenuSubTrigger>Export as</MenuSubTrigger>
                  <MenuSubContent>
                    <MenuLabel>Format</MenuLabel>
                    <MenuItem>PNG</MenuItem>
                  </MenuSubContent>
                </MenuSub>
              </MenuGroup>
            </MenuContent>
          </Menu>
        </Theme>
      );
    }
    render(<Nested />);
    const group = document.querySelector<HTMLElement>('[role="group"]');
    const labels = [...document.querySelectorAll<HTMLElement>(".kui-menu-label")];
    if (!group) throw new Error("the group never rendered");
    // The fixture must really contain BOTH labels, or the claim below is about one panel.
    expect(labels.map((l) => l.textContent), "both panels rendered a label").toEqual([
      "File",
      "Format",
    ]);
    const [parentLabel, subLabel] = labels as [HTMLElement, HTMLElement];
    expect(
      group.getAttribute("aria-labelledby"),
      "the parent group is named by ITS OWN label, not the submenu's",
    ).toBe(parentLabel.id);
    // The child panel's label is a heading in its own right — it has no group to belong to,
    // so it takes the standalone fallback and announces nothing as a group name.
    expect(subLabel.getAttribute("role")).toBeNull();

    // ...and closing the submenu must not take the parent group's name with it. Base UI's
    // GroupLabel cleanup runs on unmount, which is exactly when a screen reader user would
    // have been left with an unnamed group.
    flushSync(() => closeSub!());
    expect(
      await until(() => document.querySelectorAll(".kui-menu-popup").length === 1),
      "the submenu really unmounted — the cleanup this law is about runs on unmount",
    ).toBe(true);
    expect(
      document.querySelector<HTMLElement>('[role="group"]')!.getAttribute("aria-labelledby"),
      "the group keeps its name after the submenu closes",
    ).toBe(parentLabel.id);
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
    // `backdrop` (lab port 2026-08-17): Cards are SOLID by default even under a glass
    // theme — glass is selective — so the negative control must state the over-content
    // placement to be glass at all. The panel portals out and expresses the theme's glass
    // regardless; without the prop the "card stays glass" half would assert nothing.
    const host = render(
      <Theme material="regular">
        <Card id="host" backdrop>
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
    // `on-glass` (2026-08-16): it must not filter — the panel already spent the backdrop —
    // and it must not seal either, or a card in a glass menu reads as a slab punched through
    // the panel. Both halves, since the attribute alone would pass on a rule that paints
    // nothing and the filter alone would pass on an opaque card.
    expect(inner.dataset["material"]).toBe("on-glass");
    expect(computed(inner, "backdrop-filter")).toBe("none");
    const alpha = (c: string) => (c.includes("/") ? parseFloat(c.slice(c.lastIndexOf("/") + 1)) : 1);
    expect(alpha(computed(inner, "background-color")), "the card sealed itself onto the panel").toBeLessThan(1);
  });
});

describe("the ScrollArea adoption holds its a11y and its keyboard physics (2026-08-19)", () => {
  it("the viewport carries NO tabindex, so role=presentation is real and menu owns menuitem", () => {
    // ARIA's conflict rule voids `presentation` on any focusable element. Base UI stamps a
    // tabindex on the viewport unconditionally (0 scrollable, -1 not), so the first adoption
    // exposed a nameless `generic` between role="menu" and its items and put a tab stop
    // inside a roving-focus widget (audit 2026-08-18, read off the CDP accessibility tree).
    // The menu passes `focusable={false}` and the wrapper strips the attribute — asserted on
    // the attribute because the attribute is the entire mechanism the AX tree keys on.
    const { popup } = openMenu({});
    const viewport = popup.querySelector<HTMLElement>(".kui-scroll-viewport")!;
    expect(viewport.getAttribute("role")).toBe("presentation");
    expect(viewport.hasAttribute("tabindex"), "a focusable viewport voids presentation").toBe(false);
    // The standalone ScrollArea keeps its tab stop — a bare scroll region must be reachable
    // by keyboard, and losing THAT to this fix would trade one a11y defect for another.
  });
});

describe("reduced transparency SEALS a floating pane (§10 — audit 2026-08-18)", () => {
  it("the popup's veil goes near-opaque, not just blur-less", async () => {
    // The sealed-veil arm was (0,2,0) and the dark-floating fill rules are (0,3,0), so the
    // preference stripped the blur and LEFT the translucency — a menu stayed ~50% see-through
    // with raw page content reading straight through the rows, strictly worse than leaving
    // the preference off. The restated floating arm seals the veil at the floating rules'
    // own weight.
    const { cdp } = await import("vitest/browser");
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
    });
    try {
      const { popup } = openMenu({ material: "regular" });
      expect(computed(popup, "backdrop-filter")).toBe("none");
      const fill = computed(popup, "background-color");
      const alpha = fill.includes("/") ? parseFloat(fill.split("/")[1]!) : 1;
      expect(alpha, `a sealed pane must be near-opaque, got ${fill}`).toBeGreaterThan(0.85);
    } finally {
      await cdp().send("Emulation.setEmulatedMedia", { features: [] });
    }
  });
});

/**
 * ── THE LIT ROW IS A HALF-STEP (§21, 2026-08-26) ─────────────────────────────────────────
 * A quiet row's transient light mixes `--tone-soft` toward transparent instead of painting
 * it whole (Kushagra: the hover grey "feels darker" — and a tree's selected row, which rests
 * at FULL soft, painted the same pixels as a hovered one, so persistent never outranked
 * transient). This law exists because the mixed arm shipped with no reader: sabotaging the
 * `data-highlighted` mix out of recipes.css failed nothing until this was written — the
 * unfalsifiable-arm shape the audits keep naming, caught before commit this time.
 */
describe("a lit menu row paints LESS than full soft — the quiet half-step (§21)", () => {
  it("the highlighted fill's alpha sits visibly below the resolved soft's", async () => {
    const { popup } = openMenu({});
    const row = popup.querySelector<HTMLElement>(".kui-menu-item");
    if (!row) throw new Error("no row mounted");
    // The keyboard route, the states law's own proven idiom — a synthetic pointermove does
    // not reach Base UI's highlight tracking (measured: the wait below timed out on it).
    popup.focus();
    flushSync(() => {
      popup.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    await until(() => row.hasAttribute("data-highlighted"));
    const alphaOf = (color: string): number => {
      const slash = /\/\s*([\d.]+)\s*\)/.exec(color);
      if (slash) return parseFloat(slash[1]!);
      const comma = /^rgba\((?:[^,]+,){3}\s*([\d.]+)\)/.exec(color);
      if (comma) return parseFloat(comma[1]!);
      return 1;
    };
    const lit = alphaOf(computed(row, "background-color"));
    const soft = alphaOf(colorOn(row, "var(--tone-soft)"));
    expect(lit, "the row never lit").toBeGreaterThan(0);
    expect(soft, "soft resolved to nothing").toBeGreaterThan(0);
    // Visibly below: at least a tenth under, so a rounding difference cannot satisfy it.
    expect(lit, `lit ${lit} vs soft ${soft}`).toBeLessThan(soft * 0.9);
  });
});

describe("a row can BE a link — the render escape (§21, 2026-09-01)", () => {
  /**
   * `MenuItem` gained `render` for `BreadcrumbEllipsis`, which opens a menu of PLACES rather
   * than of verbs. The change shipped with no law of its own — the ultracode audit's own
   * completeness critic named it, and it is the change the slice made to a component that was
   * already shipped, which is the riskiest kind.
   *
   * The claim in its JSDoc is that the row stays ONE target. That is the whole reason this is a
   * render escape rather than an anchor nested inside the row: `trailing`'s note already refuses
   * a control inside a row, and a link inside one would be a second target inside a target.
   */
  it("renders INTO the anchor, keeping the row's role, class and one target", async () => {
    const el = render(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Go</Button>} />
          <MenuContent>
            <MenuItem render={<a href="/docs" />}>Docs</MenuItem>
            <MenuItem>Plain</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const rows = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    expect(rows.length).toBe(2);
    const [link, plain] = rows;

    // The row IS the anchor — not a div holding one, which is the shape that would make two.
    expect(link!.tagName).toBe("A");
    expect(link!.getAttribute("href")).toBe("/docs");
    expect(link!.querySelectorAll("a").length, "the row holds a second link inside itself").toBe(0);
    // ONE target: nothing focusable inside the row but the row.
    expect(
      link!.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])').length,
      "a second focusable node inside the row",
    ).toBe(0);

    // ...and it is still a ROW: same role, same class list, same paint as the plain one beside
    // it. Read as an agreement, so a render that quietly dropped the row identity fails here.
    expect(link!.className).toBe(plain!.className);
    expect(computed(link!, "block-size")).toBe(computed(plain!, "block-size"));
    expect(computed(link!, "padding-inline-start")).toBe(computed(plain!, "padding-inline-start"));
    expect(el).toBeTruthy();
  });

  it("the highlight still reaches it, so the keyboard can walk onto a link row", () => {
    render(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Go</Button>} />
          <MenuContent>
            <MenuItem render={<a href="/docs" />}>Docs</MenuItem>
            <MenuItem render={<a href="/more" />}>More</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    // `data-highlighted` is the row family's own lit state (§21 — lit by the stamp, never by
    // :hover), so a render escape that lost it would leave a keyboard user with no cursor.
    // The popup-focus + dispatched keydown idiom is this file's own: a synthetic pointermove
    // does not reach Base UI's highlight tracking, and `userEvent.keyboard` alone lands
    // nowhere because a `defaultOpen` popup is not focused.
    const popup = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    popup.focus();
    flushSync(() => {
      popup.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    const lit = document.querySelectorAll('[role="menuitem"][data-highlighted]');
    expect(lit.length, "no row is lit after an arrow key").toBe(1);
    expect(lit[0]!.tagName).toBe("A");
  });
});
