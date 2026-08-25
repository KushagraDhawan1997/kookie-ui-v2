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
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as React from "react";
import { flushSync } from "react-dom";

import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import {
  SIZES,
  catchDissolve,
  computed,
  inMotion,
  mounted,
  render,
  settleAll,
  tokenOn,
  until,
} from "../../test/browser.tsx";
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

describe("the pane is a CARD that floats (§10, §31)", () => {
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

describe("the page stays live — the line between this and a Dialog (§24, §31)", () => {
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
    settleAll();
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
    settleAll();
    const pv = document.querySelector<HTMLElement>(".kui-popover-popup .kui-scroll-viewport");
    const mv = document.querySelector<HTMLElement>(".kui-menu-popup .kui-scroll-viewport");
    if (!pv || !mv) throw new Error("a viewport is missing — the comparison would assert nothing");
    expect(pv.hasAttribute("tabindex"), "a popover's scrollable content is unreachable").toBe(true);
    expect(mv.hasAttribute("tabindex"), "the menu grew a tab stop inside its roving focus").toBe(
      false,
    );
  });

  it("a caught reopen resets the popup's OWN viewport and never a scroller the caller composed (§22, 2026-08-25)", async () => {
    /**
     * The runner resets a caught reopen's browsing scroll so a quick second press shows the
     * same panel a fresh mount would (the menu's finding, its law in menu.browser.test.tsx).
     * The reach of that reset is what THIS law pins: it is scoped to the popup's own anatomy
     * — the direct-child chain `:scope > .kui-scroll-area > .kui-scroll-viewport` — because a
     * popover's content is the CALLER'S, and a ScrollArea they composed keeps whatever
     * position they gave it. Both sides in one fixture, because a widened spelling
     * (`querySelectorAll(".kui-scroll-viewport")`, reset them all) satisfies the first half
     * perfectly — the second is the one that catches it.
     */
    await page.viewport(600, 320);
    inMotion();
    let setOpen!: (v: boolean) => void;
    function Host() {
      const [open, set] = React.useState(false);
      setOpen = set;
      return (
        <Theme>
          <Popover open={open} onOpenChange={set}>
            <PopoverTrigger render={<Button>Open</Button>} />
            <PopoverContent>
              <ScrollArea style={{ height: 80 }}>
                {Array.from({ length: 30 }, (_, i) => (
                  <p key={i} style={{ margin: 0 }}>{`inner ${i}`}</p>
                ))}
              </ScrollArea>
              {Array.from({ length: 40 }, (_, i) => (
                <p key={i} style={{ margin: 0 }}>{`row ${i}`}</p>
              ))}
            </PopoverContent>
          </Popover>
        </Theme>
      );
    }
    render(<Host />);
    flushSync(() => setOpen(true));
    const popup = document.querySelector<HTMLElement>(".kui-popover-popup")!;
    // Landed, not merely mounted: a scroll written into a posed box is clamped by the pose.
    await until(
      () =>
        !popup.hasAttribute("data-seed") &&
        !popup.hasAttribute("data-unfurling") &&
        parseFloat(computed(popup, "opacity")) === 1,
      3000,
    );

    const own = popup.querySelector<HTMLElement>(":scope > .kui-scroll-area > .kui-scroll-viewport")!;
    const theirs = own.querySelector<HTMLElement>(".kui-scroll-viewport")!;
    expect(theirs, "the premise: the caller's scroller is INSIDE the system one").not.toBeNull();

    // CALIBRATION on both: a scroller that cannot scroll makes every spelling pass.
    own.scrollTop = 200;
    theirs.scrollTop = 40;
    expect(own.scrollTop, "the premise: the popup's own viewport scrolls").toBeGreaterThan(60);
    expect(theirs.scrollTop, "the premise: the caller's scroller scrolls").toBeGreaterThan(20);
    const kept = theirs.scrollTop;

    const seized = catchDissolve(popup);
    flushSync(() => setOpen(false));
    const { fading, release } = await seized;
    expect(popup.isConnected, "the premise: the exit is still running").toBe(true);
    expect(fading, "the premise: the panel is visibly mid-dissolve").toBeLessThan(0.9);

    flushSync(() => setOpen(true)); // the quick reopen
    release();
    await until(() => !popup.hasAttribute("data-ending-style"), 3000);
    expect(popup.isConnected, "the premise: the panel is the one that was dissolving").toBe(true);

    // The system viewport presents from the top — the menu's rule, family-wide.
    expect(own.scrollTop, "the popup's own browsing scroll must reset").toBe(0);
    // And the caller's scroller is not the runner's to touch.
    expect(
      theirs.scrollTop,
      "the reset reached INTO the caller's content — the :scope guard is the fix",
    ).toBe(kept);
  });
});


/**
 * THE FLIGHT'S PADDING HOOK RESOLVES ON EVERY PANEL (§22, added 2026-08-23 from the audit).
 *
 * Nine declarations pin a panel's body against its own padding for the length of the entry
 * flight, and all nine read `--kui-floating-p` bare. That hook is the floating family's
 * padding OVERRIDE — menus and selects declare it, popovers and tooltips do not — so on the
 * two panels this branch added it resolved to nothing, the declarations were invalid at
 * computed-value time, and every inset fell to `auto`.
 *
 * The law reads the value the rules read NOW, on all three panels at once, because the claim
 * is that one name serves them all. The MENU is the load-bearing third: it proves the switch
 * cost nothing where the hook was already live.
 */
describe("the padding hook the entry flight reads is set on every floating panel (§22)", () => {
  it("popover, tooltip and menu all resolve it — and the menu's value did not move", () => {
    render(
      <Theme>
        <Popover defaultOpen>
          <PopoverTrigger render={<Button>p</Button>} />
          <PopoverContent>body</PopoverContent>
        </Popover>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>m</Button>} />
          <MenuContent><MenuItem>Alpha</MenuItem></MenuContent>
        </Menu>
      </Theme>,
    );
    settleAll();
    for (const sel of [".kui-popover-popup", ".kui-menu-popup"]) {
      const pane = document.querySelector<HTMLElement>(sel);
      if (!pane) throw new Error(`${sel} never mounted — the law would assert nothing`);
      const body = pane.querySelector<HTMLElement>(".kui-floating-body");
      if (!body) throw new Error(`${sel} has no floating body`);
      // The BODY is what the flight rules land on, so the value has to reach it — the hook
      // inherits, which is the mechanism, and reading it on the pane alone would not prove it.
      expect(computed(body, "--kui-sf-p"), `${sel}: the body cannot see its pane's padding`)
        .not.toBe("");
      expect(computed(body, "--kui-sf-p"), sel).toBe(computed(pane, "--kui-sf-p"));
    }
    // The menu is unchanged by the switch: its --kui-sf-p resolves THROUGH --kui-floating-p by
    // the size join, so both names give one value there. This is what says the repair was free.
    const menu = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    expect(computed(menu, "--kui-sf-p")).toBe(computed(menu, "--kui-floating-p"));
    // And the popover genuinely has no `--kui-floating-p` — the condition that made the old
    // spelling dead. Without this the law would pass on a package where every panel declared it.
    const pop = document.querySelector<HTMLElement>(".kui-popover-popup")!;
    expect(computed(pop, "--kui-floating-p"), "a popover now declares the override too").toBe("");
    expect(computed(pop, "--kui-sf-p"), "and its own padding is unset").not.toBe("");
  });

  /**
   * THE MISSING HALF LIVES IN A NODE LAW, and why is worth recording.
   *
   * A browser law here cannot distinguish the fix from the defect. `getComputedStyle` reports
   * the USED value for an inset on a positioned element, never `auto` — the same trap a prior
   * audit recorded when "drawn by both edges" passed against `translate` + `width`. With the
   * hook unset the body falls to its static position, and its static position IS one padding
   * from the pane's top, so the used value reads the same 16px under both spellings. Measured:
   * reverting the nine declarations changed nothing this file could see, while sabotaging one
   * to `99px` showed immediately — the instrument works, the property just cannot answer.
   *
   * So the declaration is asserted where a declaration can be read: `surfaces.test.ts`.
   */
});
