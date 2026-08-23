/**
 * Popover's laws, mounted (§20, §22, §30).
 *
 * Two comparisons carry most of the file, and they are the two halves of what this component
 * IS: a popover is a CARD in everything about its box (corner, padding), and a FLOATING PANE in
 * everything about its coverage (the cast, the material, the portal). Asserting either half on
 * its own would go green on a pane that had taken the wrong identity for the other half — which
 * is exactly what shipped for the first hour, when it wore the concentric corner written for a
 * pane that hugs rows and came out rounder than a card at every index.
 *
 * The §20 agreement law is the one ENGINEERING §2.1 names as owed by every portalling
 * component: a portalled panel must compute identically to an in-flow twin under a hostile axis
 * set, because context crosses a portal and attributes do not.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import { SIZES, computed, mounted, render, settleAll, tokenOn } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Dialog, DialogContent, DialogTrigger } from "../dialog/dialog.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/menu.tsx";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "./popover.tsx";

/** Every axis pushed off its default at once — the set a portal must carry (§20). */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  depth: "elevated",
};

function openPopover(theme: ThemeProps, size?: (typeof SIZES)[number], body?: React.ReactNode) {
  const host = render(
    <Theme {...theme}>
      <Popover defaultOpen {...(size ? { size } : {})}>
        <PopoverTrigger render={<Button>Open</Button>} />
        <PopoverContent>
          {body ?? (
            <>
              <PopoverTitle>Filters</PopoverTitle>
              <PopoverDescription>Narrow the list.</PopoverDescription>
            </>
          )}
        </PopoverContent>
      </Popover>
    </Theme>,
  );
  // The LAST panel — mounts accumulate within one test (the menu suite's lesson, re-learned in
  // Row's own file on the day it shipped).
  const popups = document.querySelectorAll<HTMLElement>(".kui-popover-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the panel never mounted — every law below would assert nothing");
  settleAll();
  return { host, popup };
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

describe("the pane is a CARD that floats (§10, §30)", () => {
  for (const size of SIZES) {
    it(`size ${size}: the corner and the padding are the card's, not the row-hugging panel's`, () => {
      // THE MEASUREMENT THIS COMPONENT'S FIRST HOUR TURNED ON. The concentric corner (§6, §22)
      // is a pane's corner derived from the corner of the ROWS inside it — row corner plus the
      // panel's own padding — and it was keyed on `.kui-floating`, which says where a pane sits
      // rather than what it holds. A popover holds content the system did not design, so there
      // are no rows and no term to add: measured through the old selector it came out
      // 42 / 54.25 / 71.75 / 89.25px against a Card's 38.7 / 51.6 / 64.5 / 77.4, rounder than a
      // card at every index. The arm is keyed on `kui-floating-rows` now, and this is the
      // equality that says so.
      const { popup } = openPopover({}, size);
      const card = mounted(<Card size={size}>x</Card>, { theme: {} });
      expect(
        computed(popup, "border-top-left-radius"),
        `size ${size}: the popover's corner left the card's`,
      ).toBe(computed(card, "border-top-left-radius"));
      expect(computed(popup, "padding-top")).toBe(computed(card, "padding-top"));
    });
  }

  it("and it is NOT the menu's corner — the negative control the equality above needs", () => {
    // Without this, "the popover agrees with a card" would also pass on a day when a card, a
    // menu and a popover had all quietly collapsed onto one corner. A menu hugs rows and must
    // keep its concentric arithmetic.
    const { popup } = openPopover({}, "2");
    const host = render(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    void host;
    const menus = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
    const menu = menus[menus.length - 1]!;
    settleAll();
    expect(
      computed(menu, "border-top-left-radius"),
      "the menu lost its concentric corner",
    ).not.toBe(computed(popup, "border-top-left-radius"));
    expect(computed(menu, "padding-top")).not.toBe(computed(popup, "padding-top"));
  });

  it("but the COVERAGE is the floating family's — it casts what a menu casts, not what a card does", () => {
    // §22's overlap clause: a floating layer always states its coverage, in both worlds. A
    // popover has no scrim to do that for it (which is how Dialog gets away with casting
    // nothing), so the cast is the whole of how it says it is above the page.
    const { popup } = openPopover({}, "2");
    const card = mounted(<Card size="2">x</Card>, { theme: {} });
    expect(computed(popup, "box-shadow"), "the panel casts nothing at all").not.toBe("none");
    expect(
      computed(popup, "box-shadow"),
      "the panel casts a card's shadow — it is not stating coverage",
    ).not.toBe(computed(card, "box-shadow"));
  });

  it("its width floor is the family's, and it is NOT floored at the trigger", () => {
    // Menu floors at `--anchor-width` because "never narrower than the button you pressed" is a
    // size-match argument about a list of that button's own options. A popover holds a form or a
    // summary; tying its width to whatever opened it would make one panel a different shape per
    // call site. The wide trigger is what tells the two apart.
    const wide = (
      <Theme>
        <Popover defaultOpen>
          <PopoverTrigger
            render={<Button style={{ inlineSize: "420px" }}>A very wide trigger indeed</Button>}
          />
          <PopoverContent>
            <PopoverTitle>Filters</PopoverTitle>
          </PopoverContent>
        </Popover>
      </Theme>
    );
    render(wide);
    const popups = document.querySelectorAll<HTMLElement>(".kui-popover-popup");
    const popup = popups[popups.length - 1]!;
    settleAll();
    expect(
      popup.getBoundingClientRect().width,
      "the panel took the trigger's width — it is floored at the anchor",
    ).toBeLessThan(400);
    // ...and the family's own floor still holds it off zero.
    expect(popup.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      parseFloat(tokenOn(popup, "--floating-min-w")) - 0.5,
    );
  });

  it("the room the positioner reports is a hard stop in both axes", () => {
    // A pane clips (§3), so an uncapped panel taller than the window loses its own bottom with
    // no scrollbar anywhere — and the caller cannot fix it, because the room is a fact only the
    // positioner knows.
    const { popup } = openPopover({}, "2");
    for (const prop of ["max-height", "max-width"]) {
      expect(computed(popup, prop), `${prop} is uncapped`).not.toBe("none");
    }
  });
});

describe("the page stays live — the line between this and a Dialog (§24, §30)", () => {
  it("it puts NOTHING between the reader and the page, where a dialog puts a scrim", () => {
    // THE STRUCTURAL DIFFERENCE, MEASURED — and the third measurement tried, which is the part
    // worth recording. Scroll lock was the obvious one and it is not observable here: Base UI
    // only locks a document that actually scrolls, so a dialog and a popover both left
    // `body.style.overflow` untouched and the law's control did not exist. Inertness was the
    // second, and neither component marks an outside subtree `inert` or `aria-hidden` in this
    // harness. What IS true, always, and visible in the DOM is the scrim: a dialog renders one
    // because it must be answered, and a popover renders none because it can be ignored by
    // looking away. Notice's own shape — the absence is the design.
    openPopover({}, "2");
    expect(
      document.querySelector(".kui-dialog-backdrop"),
      "a popover put a scrim over the page",
    ).toBeNull();
    render(
      <Theme>
        <Dialog defaultOpen>
          <DialogTrigger render={<Button>Open</Button>} />
          <DialogContent>Body</DialogContent>
        </Dialog>
      </Theme>,
    );
    settleAll();
    expect(
      document.querySelector(".kui-dialog-backdrop"),
      "the dialog stopped rendering a scrim — this law's control is gone",
    ).not.toBeNull();
  });

  it("an outside press dismisses it", async () => {
    const { popup } = openPopover({}, "2");
    expect(document.body.contains(popup)).toBe(true);
    await userEvent.click(document.body);
    // Base UI unmounts on the exit animation's own promise, so the panel is gone or on its way:
    // what the law asserts is that the press was HEARD, which the closed stamp says.
    expect(
      popup.getAttribute("data-open") === null || !document.body.contains(popup),
      "an outside press did not dismiss the panel",
    ).toBe(true);
  });

  it("a close button dismisses it too", async () => {
    render(
      <Theme>
        <Popover defaultOpen>
          <PopoverTrigger render={<Button>Open</Button>} />
          <PopoverContent>
            <PopoverTitle>Filters</PopoverTitle>
            <PopoverClose render={<Button>Done</Button>} />
          </PopoverContent>
        </Popover>
      </Theme>,
    );
    const popups = document.querySelectorAll<HTMLElement>(".kui-popover-popup");
    const popup = popups[popups.length - 1]!;
    settleAll();
    const close = popup.querySelector<HTMLElement>("button");
    if (!close) throw new Error("no close button mounted");
    await userEvent.click(close);
    expect(
      popup.getAttribute("data-open") === null || !document.body.contains(popup),
      "the close button did not dismiss the panel",
    ).toBe(true);
  });
});

describe("the parts exist because the wiring forces them (§10, §30)", () => {
  it("the title NAMES the panel, and the description describes it", () => {
    // §10's anatomy criterion: the system owns an arrangement only where something non-visual
    // forces it. Here it is `aria-labelledby` and `aria-describedby` — a panel with no title has
    // no accessible name at all, which is Dialog's own reason for the same two parts.
    const { popup } = openPopover({}, "2");
    const labelledBy = popup.getAttribute("aria-labelledby");
    const describedBy = popup.getAttribute("aria-describedby");
    expect(labelledBy, "the panel has no accessible name").toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent).toBe("Filters");
    expect(describedBy, "the panel is not described").toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toBe("Narrow the list.");
  });

  it("and their type answers the index, because the system owns those words", () => {
    // The exception to "a surface never sizes the type inside it": type the SYSTEM owns. These
    // two exist only because the wiring forces them, so the index reaches them — through the
    // shared owned-step map, so a popover, a dialog and an alert at one index are one
    // typography. The caller's own content is untouched, which the negative below states.
    const small = openPopover({}, "1").popup;
    const large = openPopover({}, "4").popup;
    const titleOf = (p: HTMLElement) =>
      parseFloat(computed(p.querySelector<HTMLElement>("h2")!, "font-size"));
    expect(titleOf(large), "the title ignores the index").toBeGreaterThan(titleOf(small));
  });

  it("a caller's own words are NOT sized by the panel", () => {
    // The other half, and the one that keeps §15's rule true: the content is the call site's, so
    // its steps are too. Two panels at opposite ends of the index hold the same paragraph.
    const body = <p className="kui-type">Body</p>;
    const small = openPopover({}, "1", body).popup;
    const large = openPopover({}, "4", body).popup;
    expect(
      computed(large.querySelector<HTMLElement>("p")!, "font-size"),
      "the panel sized the caller's own words",
    ).toBe(computed(small.querySelector<HTMLElement>("p")!, "font-size"));
  });
});

describe("the agreement law: portalled ≡ in-flow (§20, ENGINEERING §2.1)", () => {
  /** The identity read off a real panel rather than restated — the second-home lesson the menu
      and select twins learned the same day this component shipped. */
  function popupIdentity(): string {
    return openPopover({}).popup.className;
  }

  function twin(theme: ThemeProps, identity: string) {
    let el: HTMLElement | null = null;
    render(
      <Theme {...theme}>
        <div
          ref={(n: HTMLDivElement | null) => void (el = n)}
          className={identity}
          data-size="2"
          data-tone="neutral"
          data-emphasis="quiet"
          data-bordered="true"
        />
      </Theme>,
    );
    if (!el) throw new Error("twin never mounted");
    return el as HTMLElement;
  }

  it("computes identical under the hostile axis set", () => {
    const identity = popupIdentity();
    const { popup } = openPopover(HOSTILE);
    const twinEl = twin(HOSTILE, identity);
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(twinEl));
    // The comparison can fail: the same twin under default axes disagrees.
    expect(surfaceFacts(twin({}, identity))).not.toEqual(surfaceFacts(twinEl));
  });

  it("carries contrast=high through the portal", () => {
    const identity = popupIdentity();
    const { popup } = openPopover({ ...HOSTILE, contrast: "high" });
    const twinEl = twin({ ...HOSTILE, contrast: "high" }, identity);
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(twinEl));
    expect(surfaceFacts(twin(HOSTILE, identity))).not.toEqual(surfaceFacts(twinEl));
  });
});
