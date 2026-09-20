/**
 * Popover's laws, mounted (§20, §22, §31).
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
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as React from "react";

import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import { SIZES, computed, mounted, render, tokenOn } from "../../test/browser.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
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

describe("the pane is a CARD that floats (§10, §31)", () => {
  for (const size of SIZES) {
    it(`size ${size}: the corner is the card's, and the padding is the PANEL band's`, () => {
      // THE MEASUREMENT THIS COMPONENT'S FIRST HOUR TURNED ON. The concentric corner (§6, §22)
      // is a pane's corner derived from the corner of the ROWS inside it — row corner plus the
      // panel's own padding — and it was keyed on `.kui-floating`, which says where a pane sits
      // rather than what it holds. A popover holds content the system did not design, so there
      // are no rows and no term to add: measured through the old selector it came out
      // 42 / 54.25 / 71.75 / 89.25px against a Card's 38.7 / 51.6 / 64.5 / 77.4, rounder than a
      // card at every index. The arm is keyed on `kui-floating-rows` now, and this is the
      // equality that says so.
      /* THE PADDING LEFT THE CARD BAND 2026-09-07, and the corner did not (Kushagra: "we need a
         spacing scale for surfaces that are smaller than cards… command seems to need more, and
         popover seems to need less"). A floating pane is a surface SMALLER than a card, so it
         has its own inset — 8/12/16/24 at the resting density, the command palette's own search
         bar promoted rather than re-invented. What is still a card's is the CORNER, which is the
         claim this law was minted for: a popover holds content the system did not design, so
         there are no rows and no concentric term to add. The two halves are read against
         different sources on purpose, because they now come from different bands. */
      const { popup } = openPopover({}, size);
      const card = mounted(<Card size={size}>x</Card>, { theme: {} });
      expect(
        computed(popup, "border-top-left-radius"),
        `size ${size}: the popover's corner left the card's`,
      ).toBe(computed(card, "border-top-left-radius"));
      expect(
        computed(popup, "padding-top"),
        `size ${size}: the popover left the panel band`,
      ).toBe(tokenOn(popup, "--kui-panel-p"));
      expect(
        computed(popup, "padding-top"),
        `size ${size}: the panel band collapsed onto the card's`,
      ).not.toBe(computed(card, "padding-top"));
    });
  }

  it("and it is NOT the menu's corner — the negative control the equality above needs", () => {
    // Without this, "the popover agrees with a card" would also pass on a day when a card, a
    // menu and a popover had all quietly collapsed onto one corner. A menu hugs rows and must
    // keep its concentric arithmetic.
    //
    // THE PADDING IS NOW SHARED, DELIBERATELY (2026-09-07): both panes are on the panel band,
    // which is the whole point of minting one — a menu and a popover are the same KIND of
    // surface, and only what they hold differs. So the padding half of this control becomes an
    // equality, and the corner half carries the whole negative claim.
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
    expect(
      computed(menu, "border-top-left-radius"),
      "the menu lost its concentric corner",
    ).not.toBe(computed(popup, "border-top-left-radius"));
    expect(
      computed(menu, "padding-top"),
      "the menu and the popover left the one panel band they were put on",
    ).toBe(computed(popup, "padding-top"));
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

describe("the page stays live — the line between this and a Dialog (§24, §31)", () => {
  /** A marker parked in a corner no anchored panel reaches, so "what is over this point" is a
      question about the page rather than about where the positioner happened to land. */
  function withOutsideMarker(panel: React.ReactNode) {
    const host = render(
      <Theme>
        <div
          data-t="outside"
          style={{ position: "fixed", insetInlineStart: 0, insetBlockEnd: 0, inlineSize: "80px", blockSize: "24px" }}
        >
          out
        </div>
        {panel}
      </Theme>,
    );
    const marker = host.querySelector<HTMLElement>('[data-t="outside"]');
    if (!marker) throw new Error("the marker never mounted — the law would assert nothing");
    const box = marker.getBoundingClientRect();
    return { marker, hit: document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2) };
  }

  it("the page is still REACHABLE under an open panel, where a dialog covers it", () => {
    /**
     * THE STRUCTURAL DIFFERENCE, HIT-TESTED (rewritten 2026-08-26, audit).
     *
     * The first spelling asked whether `.kui-dialog-backdrop` was in the document, which is a
     * class exactly one component can emit and this one renders no backdrop element of any
     * kind — so it was null before the component existed and stayed null under every sabotage.
     * Measured: `<BasePopover.Root modal>` scroll-locks the page and disables outside pointer
     * interaction, the precise promise §31 calls the whole line between this and a Dialog, and
     * every assertion in that law still passed.
     *
     * What a modal popover actually does is render a fixed, full-viewport layer of Base UI's
     * own (`InternalBackdrop`) over the page. So the law asks the page directly: with the
     * panel open, is the outside element still the thing under its own centre? The DIALOG in
     * the same run is the calibration — it must answer no, or the instrument is measuring
     * nothing.
     *
     * Scroll lock and inertness were both tried first and neither is observable here: Base UI
     * only locks a document that actually scrolls, and neither component marks an outside
     * subtree `inert` in this harness.
     */
    const live = withOutsideMarker(
      <Popover defaultOpen>
        <PopoverTrigger render={<Button>Open</Button>} />
        <PopoverContent>
          <PopoverTitle>Filters</PopoverTitle>
        </PopoverContent>
      </Popover>,
    );
    expect(
      live.hit,
      "something of the popover's is over the page — the panel went modal",
    ).toBe(live.marker);

    const covered = withOutsideMarker(
      <Dialog defaultOpen>
        <DialogTrigger render={<Button>Open</Button>} />
        <DialogContent aria-label="Body">Body</DialogContent>
      </Dialog>,
    );
    expect(
      covered.hit,
      "an open dialog left the page reachable — this law's calibration is gone",
    ).not.toBe(covered.marker);
  });

  it("an outside press dismisses it", async () => {
    const { popup } = openPopover({}, "2");
    expect(document.body.contains(popup)).toBe(true);
    await userEvent.click(document.body);
    // Base UI unmounts a closed panel, so the panel is gone or its open stamp is: what the law
    // asserts is that the press was HEARD, which the closed stamp says.
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
    const close = popup.querySelector<HTMLElement>("button");
    if (!close) throw new Error("no close button mounted");
    await userEvent.click(close);
    expect(
      popup.getAttribute("data-open") === null || !document.body.contains(popup),
      "the close button did not dismiss the panel",
    ).toBe(true);
  });
});

describe("the parts exist because the wiring forces them (§10, §31)", () => {
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

  it("a panel with no name says so in dev — and a title or a label silences it", async () => {
    /**
     * Base UI's popup renders `role="dialog"`, so a panel with neither a `PopoverTitle` nor an
     * `aria-label` announces as "dialog" and nothing else. That is the measured case
     * `useNameWarning` was written for (2026-08-21), and this component shipped without the
     * call while Dialog and AlertDialog both made it — expensive here rather than theoretical,
     * because a popover with no heading is an ORDINARY shape (a filter panel, a colour picker)
     * where a dialog with no title is a mistake.
     *
     * SEIZED, NOT RACED (Dialog's own harness, 2026-08-21): the name arrives when the Title
     * child registers and the check runs after paint, so expecting a warning this returns the
     * moment one lands, and expecting silence it waits the whole deadline — the fair direction.
     */
    async function warnings(want: number, run: () => void): Promise<number> {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const count = () =>
        spy.mock.calls.map((c) => String(c[0])).filter((m) => m.includes("<Popover>")).length;
      try {
        run();
        for (let waited = 0; waited < 2000; waited += 16) {
          if (want > 0 && count() >= want) break;
          await new Promise((r) => setTimeout(r, 16));
        }
        return count();
      } finally {
        spy.mockRestore();
      }
    }

    const bare = await warnings(1, () => {
      render(
        <Theme>
          <Popover defaultOpen>
            <PopoverTrigger render={<Button>Filters</Button>} />
            <PopoverContent>
              <p className="kui-type">Nothing names this panel.</p>
            </PopoverContent>
          </Popover>
        </Theme>,
      );
    });
    expect(bare, "a nameless popover announces as \"dialog\" and says nothing about it").toBe(1);

    // Both repairs, because the warning names both and a component that dropped `aria-label`
    // would leave one of them dead — the Select audit's blocked-`id` finding, one panel over.
    const titled = await warnings(0, () => {
      render(
        <Theme>
          <Popover defaultOpen>
            <PopoverTrigger render={<Button>Filters</Button>} />
            <PopoverContent>
              <PopoverTitle>Filters</PopoverTitle>
            </PopoverContent>
          </Popover>
        </Theme>,
      );
    });
    expect(titled, "a titled popover is warned about anyway").toBe(0);

    const labelled = await warnings(0, () => {
      render(
        <Theme>
          <Popover defaultOpen>
            <PopoverTrigger render={<Button>Filters</Button>} />
            <PopoverContent aria-label="Filters">
              <p className="kui-type">No visible title.</p>
            </PopoverContent>
          </Popover>
        </Theme>,
      );
    });
    expect(labelled, "aria-label does not reach the panel, so the warning has no repair").toBe(0);
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


/**
 * THE ROOT'S DIRECTION CONTEXT (§20, added 2026-08-26 from the ultracode audit).
 *
 * `PortalScope` stamps `dir` on the portal wrapper from this context — so a component that
 * never provides it takes the context's DEFAULT, and the default was a hard-coded `ltr`.
 * Popover shipped without the provider that Menu, Select, Dialog and AlertDialog all render.
 */
describe("the panel knows its direction (§20)", () => {
  /** The document's own `dir` — an app spells this on `<html>`, and the portal lands under
      `document.body`, so this is the ancestor a portalled panel would otherwise inherit. */
  function inDocumentDirection<T>(dir: string, run: () => T): T {
    const had = document.documentElement.getAttribute("dir");
    document.documentElement.setAttribute("dir", dir);
    try {
      return run();
    } finally {
      if (had === null) document.documentElement.removeAttribute("dir");
      else document.documentElement.setAttribute("dir", had);
    }
  }

  it("an RTL document opens an RTL panel — the stamp states the direction, it does not invent one", () => {
    // The stale-stamp failure of 2026-08-09, reached by a third road: the wrapper stamps
    // `dir` ALWAYS, so a component that hands it no direction hands it `ltr`, and that stamp
    // OVERRIDES the `rtl` the portal would have inherited from the document on its own.
    // Measured before the fix: `dir="ltr"` on the wrapper and `direction: ltr` computed on the
    // panel, inside `<html dir="rtl">`.
    const rtl = inDocumentDirection("rtl", () => {
      const { popup } = openPopover({});
      const portal = popup.closest<HTMLElement>(".kui-portal");
      if (!portal) throw new Error("no portal wrapper — the law would assert nothing");
      return { stamp: portal.getAttribute("dir"), computed: computed(popup, "direction") };
    });
    expect(rtl.stamp, "the wrapper stamped a direction the document does not have").toBe("rtl");
    expect(rtl.computed, "the panel computes the wrong direction").toBe("rtl");

    // The calibration: an LTR document must still come back `ltr`, or the law above passes on
    // a wrapper that had simply stopped stamping anything.
    const ltr = inDocumentDirection("ltr", () => {
      const { popup } = openPopover({});
      const portal = popup.closest<HTMLElement>(".kui-portal")!;
      return { stamp: portal.getAttribute("dir"), computed: computed(popup, "direction") };
    });
    expect(ltr.stamp).toBe("ltr");
    expect(ltr.computed).toBe("ltr");
  });
});


/**
 * THE TRIGGER'S ELEMENT SEMANTICS (§5, added 2026-08-23 from the ultracode audit).
 *
 * Base UI branches its entire a11y contract on `nativeButton` and defaults it to TRUE, so a
 * component that does not forward the answer emits `type="button"` on an anchor — where `type`
 * is the linked resource's MIME type — and a disabled one as a tab stop with an inert
 * `disabled` attribute and no `aria-disabled`. That is the Button defect of 2026-08-03, and
 * Popover was its FOURTH shipping: Button caught it, Menu re-shipped and caught it in the
 * 2026-08-09 audit, Dialog and AlertDialog carry the guard, and this component was written
 * without one. Chromium had been printing Base UI's own warning on that path all along.
 *
 * `Menu` is the negative control, and it is the point: the two components must agree about one
 * node, because the failure that made this a rule was two of them disagreeing.
 */
describe("the trigger keeps its element's semantics (§5)", () => {
  it("as an anchor: no type=button, announced when dead, out of the tab order", () => {
    const host = render(
      <Theme>
        <Popover>
          <PopoverTrigger data-t="live" render={<a href="#live" />}>Open</PopoverTrigger>
          <PopoverContent>body</PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger data-t="dead" disabled render={<a href="#dead" />}>Open</PopoverTrigger>
          <PopoverContent>body</PopoverContent>
        </Popover>
        <Menu>
          <MenuTrigger data-t="menu" disabled render={<a href="#m" />}>Open</MenuTrigger>
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const at = (t: string) => {
      const el = host.querySelector<HTMLElement>(`[data-t="${t}"]`);
      if (!el) throw new Error(`no trigger ${t} — the law would assert nothing`);
      return el;
    };

    // `type` is a MIME type on an anchor. Emitting "button" there is meaningless markup and is
    // the tell that the whole contract went down the native-button branch.
    expect(at("live").getAttribute("type"), "type=button on an anchor").toBeNull();
    expect(at("dead").getAttribute("type"), "type=button on an anchor").toBeNull();

    // A DEAD trigger is announced and unreachable. `disabled` does nothing on an `<a>`, so
    // without the inference these are the two channels that silently vanish.
    expect(at("dead").getAttribute("aria-disabled"), "a dead trigger is announced to nobody").toBe(
      "true",
    );
    expect(at("dead").tabIndex, "a dead trigger is still in the tab order").toBe(-1);

    // AND IT AGREES WITH MENU, node for node. Without this the law passes on a package where
    // every floating trigger is wrong in the same way.
    expect(at("dead").getAttribute("aria-disabled")).toBe(
      at("menu").getAttribute("aria-disabled"),
    );
    expect(at("dead").tabIndex).toBe(at("menu").tabIndex);

    // A LIVE one keeps its reachability, so the law is about `disabled` and not about anchors.
    expect(at("live").getAttribute("aria-disabled")).toBeNull();
    expect(at("live").tabIndex).not.toBe(-1);
  });

  it("as a real button it is left alone, and the nested Button shape is not mistaken for one", () => {
    // `rootsInButton` RECURSES, and this is why: `render={<Button render={<a href/>}/>}` is a
    // component, so a one-level `type === "button"` check answers TRUE and puts the anchor back
    // down the native branch — two components disagreeing about one node, which is the exact
    // shape the menu comment records.
    const host = render(
      <Theme>
        <Popover>
          <PopoverTrigger data-t="plain">Open</PopoverTrigger>
          <PopoverContent>body</PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger data-t="nested" disabled render={<Button render={<a href="#n" />} />}>
            Open
          </PopoverTrigger>
          <PopoverContent>body</PopoverContent>
        </Popover>
      </Theme>,
    );
    const plain = host.querySelector<HTMLElement>('[data-t="plain"]')!;
    const nested = host.querySelector<HTMLElement>('[data-t="nested"]')!;
    expect(plain.tagName, "the default path stopped rendering a button").toBe("BUTTON");
    expect(plain.getAttribute("aria-disabled"), "a live native button was stamped").toBeNull();
    // The nested anchor is still an anchor, and still gets the anchor's contract.
    expect(nested.tagName).toBe("A");
    expect(nested.getAttribute("type"), "the nested shape took the native branch").toBeNull();
    expect(nested.getAttribute("aria-disabled")).toBe("true");
  });
});


/**
 * THE CONTENT SCROLLS, THE PANEL DOES NOT (§22, added 2026-08-23 — Menu's 2026-08-17 adoption,
 * one family member over).
 *
 * The fixture has to OVERFLOW or this law is about nothing: a panel that fits needs no
 * viewport, and every assertion below is satisfied by a short one for the wrong reason. So the
 * viewport is pinned small and the content is made far taller than it, and the first assertion
 * is the calibration that says so.
 */
describe("an overlong panel scrolls its content, not itself (§22)", () => {
  it("the viewport overflows, the pane does not, and the pane keeps its own box", async () => {
    await page.viewport(600, 320);
    const host = render(
      <Theme>
        <Popover defaultOpen>
          <PopoverTrigger render={<Button>Open</Button>} />
          <PopoverContent>
            <PopoverTitle>Filters</PopoverTitle>
            {Array.from({ length: 40 }, (_, i) => (
              <p key={i} style={{ margin: 0 }}>{`row ${i}`}</p>
            ))}
          </PopoverContent>
        </Popover>
      </Theme>,
    );
    const popup = document.querySelector<HTMLElement>(".kui-popover-popup");
    if (!popup) throw new Error("no popup — the law would assert nothing");
    const viewport = popup.querySelector<HTMLElement>(".kui-scroll-viewport");
    if (!viewport) throw new Error("no ScrollArea viewport inside the popup");

    // CALIBRATION: the content genuinely does not fit. Without this the law passes on a short
    // panel, where nothing scrolls and nothing is supposed to.
    expect(
      viewport.scrollHeight,
      "the fixture fits — this law is measuring a panel with no overflow",
    ).toBeGreaterThan(viewport.clientHeight + 20);

    // The VIEWPORT is what scrolls.
    viewport.scrollTop = 40;
    expect(viewport.scrollTop, "the viewport does not scroll").toBeGreaterThan(0);

    // The PANE does not — it clips, and a pane that scrolled would take its own corner and
    // cast with it (the 2026-08-20 `clip` vs `hidden` finding, one component over).
    expect(popup.scrollHeight, "the pane itself scrolls").toBe(popup.clientHeight);

    // And the pane stayed inside the room the positioner reported, which is the thing the
    // caller could never have fixed from outside.
    expect(popup.getBoundingClientRect().bottom).toBeLessThanOrEqual(320);
    expect(host).toBeTruthy();
  });

  it("the scrollable region is reachable by keyboard — Menu's answer inverted, on purpose", async () => {
    // Menu passes `focusable={false}`: it is a roving-focus widget that scrolls its own
    // highlight into view, and a tab stop inside it would be wrong. A popover traps nothing
    // and holds content nobody else will scroll, so its viewport must be reachable (WCAG
    // 2.1.1). Asserted against the MENU in the same run, because "the two differ" is the
    // claim — reading the popover alone would pass whatever Menu does.
    await page.viewport(600, 320);
    render(
      <Theme>
        <Popover defaultOpen>
          <PopoverTrigger render={<Button>Open</Button>} />
          <PopoverContent>
            {Array.from({ length: 40 }, (_, i) => <p key={i} style={{ margin: 0 }}>{`row ${i}`}</p>)}
          </PopoverContent>
        </Popover>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>M</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const pv = document.querySelector<HTMLElement>(".kui-popover-popup .kui-scroll-viewport");
    const mv = document.querySelector<HTMLElement>(".kui-menu-popup .kui-scroll-viewport");
    if (!pv || !mv) throw new Error("a viewport is missing — the comparison would assert nothing");
    expect(pv.hasAttribute("tabindex"), "a popover's scrollable content is unreachable").toBe(true);
    expect(mv.hasAttribute("tabindex"), "the menu grew a tab stop inside its roving focus").toBe(
      false,
    );
  });

  it("a caller's own ScrollArea keeps the height they stated on it (§31, 2026-08-26)", async () => {
    /**
     * THE HEIGHT BOUND IS THE POPUP'S ANATOMY, NOT EVERY VIEWPORT UNDER IT (audit 2026-08-26).
     *
     * The rule that caps the scrolling viewport at the room the positioner reports was written
     * as a DESCENDANT selector, so at (0,2,0) it also landed on any `ScrollArea` the call site
     * composed — and beat `scroll-area.css`'s own `max-block-size: 100%` at (0,1,0). A popover
     * is the one member of this family whose content is explicitly the caller's, and
     * `ScrollArea`'s JSDoc instructs them to state a height on it, so the component overruled
     * the instruction it gives.
     *
     * Both halves in one fixture, because the direct-child spelling and the descendant one
     * agree perfectly about the popup's own viewport — the caller's is the one that tells them
     * apart.
     */
    await page.viewport(600, 320);
    render(
      <Theme>
        <Popover defaultOpen>
          <PopoverTrigger render={<Button>Open</Button>} />
          <PopoverContent>
            <PopoverTitle>Filters</PopoverTitle>
            <ScrollArea style={{ height: "120px" }}>
              {Array.from({ length: 40 }, (_, i) => (
                <p key={i} style={{ margin: 0 }}>{`inner ${i}`}</p>
              ))}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </Theme>,
    );
    const popup = document.querySelector<HTMLElement>(".kui-popover-popup");
    if (!popup) throw new Error("no popup — the law would assert nothing");
    const own = popup.querySelector<HTMLElement>(
      ":scope > .kui-scroll-area > .kui-scroll-viewport",
    );
    if (!own) throw new Error("the popup has no viewport of its own");
    const theirs = own.querySelector<HTMLElement>(".kui-scroll-viewport");
    if (!theirs) throw new Error("the caller's scroller never mounted");

    // CALIBRATION: their content genuinely overflows the height they asked for. Without this
    // every spelling passes, because a scroller with nothing to scroll is bounded by its
    // content and no rule has to do anything.
    expect(
      theirs.scrollHeight,
      "the fixture fits inside 120px — this law is measuring a region with no overflow",
    ).toBeGreaterThan(140);

    expect(
      theirs.clientHeight,
      "the panel overruled the height the caller stated on their own ScrollArea",
    ).toBeLessThanOrEqual(121);

    // And the popup's own viewport still takes the cap, which is what the rule is FOR: without
    // this the law would pass on a day the whole declaration had simply been deleted.
    expect(
      computed(own, "max-block-size"),
      "the popup's own viewport lost its bound on the room the positioner reports",
    ).not.toBe("none");
  });
});

/**
 * THE MATERIAL, WHICH HAD NO LAW AT ALL (§10, §20, §31 — added 2026-08-29, the ultracode audit).
 *
 * Three component-local calls decide what a popover is made of — `useMaterial({ backdrop: true })`,
 * `useLensRef(material, ref)` and `<GlassScope material={material}>` — and until this describe
 * not one of them was read by any law in the suite. The file mentioned "material" three times and
 * all three were in comments; the hostile axis set pushed five axes and not that one; the §20
 * agreement law's twin never stamped `data-material`. Deleting any of the three left twenty-three
 * laws green, which is the whole reason this is here rather than a fourth restatement of a claim
 * that already had a reader.
 *
 * Every clause below is a defect this exact mechanism has already shipped in a sibling: the read
 * outside the portal (menu, 2026-08-16), the pane that scopes its subtree solid (the one-glass-
 * per-stack rule), and a panel that is over content BY CONSTRUCTION rather than by asking
 * (backdrop selectivity, 2026-08-17). A popover is the one member that reproduces all three.
 */
describe("a popover is made of what the app is made of (§10, §31)", () => {
  it("it takes the theme's glass without being asked — a floating pane is always over content", () => {
    // `backdrop` is NOT stated anywhere below. Since 2026-08-17 glass is SELECTIVE: an in-flow
    // Card under a glass theme is solid until it says otherwise, because there may be nothing
    // behind it to bend. A floating pane always has something behind it, which is what
    // `useMaterial({ backdrop: true })` says — so the absence of the prop here is the law.
    let panel: HTMLElement | null = null;
    const host = render(
      <Theme material="regular">
        <Card id="plain-card" />
        <Popover defaultOpen>
          <PopoverTrigger render={<Button>Open</Button>} />
          <PopoverContent ref={(n: HTMLDivElement | null) => void (panel = n)}>
            <PopoverTitle>Filters</PopoverTitle>
          </PopoverContent>
        </Popover>
      </Theme>,
    );
    if (!panel) throw new Error("the panel never mounted — the law would assert nothing");
    const p = panel as HTMLElement;
    expect(p.dataset["material"], "the panel did not take the theme's material").toBe("regular");
    expect(computed(p, "backdrop-filter"), "the panel declares glass and paints none").not.toBe(
      "none",
    );
    // THE NEGATIVE CONTROL, and it is what stops this passing on a package where glass had
    // simply stopped being selective: an unmarked in-flow card under the same theme is solid.
    const card = host.querySelector<HTMLElement>("#plain-card")!;
    expect(card.dataset["material"], "glass stopped being selective — the law proves nothing").toBe(
      undefined,
    );
  });

  it("opened from inside a glass card, it is still glass — context follows the tree, the panel does not", () => {
    // The read has to happen INSIDE `PortalScope`. React context follows the tree, so a popover
    // triggered from within a glass Card is, in React's eyes, inside that card's glass scope and
    // a naive read comes back `solid` — wrong, because the panel paints over the page. The card
    // is the negative control: without it, an app switched wholly to solid would satisfy this.
    let panel: HTMLElement | null = null;
    const host = render(
      <Theme material="regular">
        <Card id="glass-host" backdrop>
          <Popover defaultOpen>
            <PopoverTrigger render={<Button>Open</Button>} />
            <PopoverContent ref={(n: HTMLDivElement | null) => void (panel = n)}>
              <PopoverTitle>Filters</PopoverTitle>
            </PopoverContent>
          </Popover>
        </Card>
      </Theme>,
    );
    expect(host.querySelector<HTMLElement>("#glass-host")!.dataset["material"]).toBe("regular");
    if (!panel) throw new Error("the panel never mounted");
    expect((panel as HTMLElement).dataset["material"]).toBe("regular");
  });

  it("but a card composed INSIDE it is solid — one glass per stack, structurally", () => {
    // `GlassScope` is the third call, and this is the only thing that reads it. A glass pane
    // scopes its subtree solid, so the rule is held by construction rather than asked of a call
    // site — which is what makes "never glass on glass" a guarantee instead of a guideline.
    let panel: HTMLElement | null = null;
    const host = render(
      <Theme material="regular">
        <Popover defaultOpen>
          <PopoverTrigger render={<Button>Open</Button>} />
          <PopoverContent ref={(n: HTMLDivElement | null) => void (panel = n)}>
            <PopoverTitle>Filters</PopoverTitle>
            <Card id="inner" backdrop />
          </PopoverContent>
        </Popover>
      </Theme>,
    );
    if (!panel) throw new Error("the panel never mounted");
    // The pane itself IS glass — without this the law passes on an app that lost glass entirely.
    expect((panel as HTMLElement).dataset["material"]).toBe("regular");
    const inner = host.ownerDocument.querySelector<HTMLElement>("#inner")!;
    expect(inner, "the inner card never rendered").toBeTruthy();
    // `on-glass`, not `solid` (2026-08-19): a glass pane scopes its subtree ON-GLASS, so the
    // card must neither filter (the panel already spent the backdrop) nor seal (a slab punched
    // through the pane). Both halves, because the attribute alone passes on a rule that paints
    // nothing and the filter alone passes on an opaque card. The card states `backdrop`
    // explicitly, which is the strongest form of this: since 2026-08-19 an explicit statement
    // inside a pane resolves the theme's material, and the pane scope is what still overrules it.
    expect(
      inner.dataset["material"],
      "a card inside a glass popover asked for glass and got it — glass is stacking",
    ).toBe("on-glass");
    expect(computed(inner, "backdrop-filter"), "and it is spending the backdrop twice").toBe(
      "none",
    );
    const alpha = (c: string) =>
      c.includes("/") ? parseFloat(c.slice(c.lastIndexOf("/") + 1)) : 1;
    expect(
      alpha(computed(inner, "background-color")),
      "the card sealed itself onto the panel",
    ).toBeLessThan(1);
  });
});
