/**
 * The floating runner's own laws (§22, §23) — the ones whose subject is `system/floating.tsx`
 * itself rather than any one component's behaviour.
 *
 * Everything else the runner does is law-tested through the five members that use it, which is
 * right: an entry is only judgeable as a menu unfurling or a select landing on its value. What
 * belongs HERE is a claim about the mechanism's own shape, where naming a component in the
 * file would say the wrong thing about which of them it is true of.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { Button } from "../components/button/button.tsx";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../components/popover/popover.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select/select.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip/tooltip.tsx";
import { FloatingDirectionContext, PortalScope } from "./floating.tsx";
import { Theme } from "../theme/theme.tsx";
import { inMotion, render, sweep, until } from "../test/browser.tsx";

describe("the positioner is restored by ONE arm (§22, §23)", () => {
  /**
   * `release()` used to carry a second `else if (positioner && heldHeight)` arm, whose comment
   * named exactly one subject — "an item-aligned select's positioner height is Base UI's" —
   * and which could never run for it. `data-side` is Base UI's PLACED signal, and an
   * item-aligned select stamps the string `none`; `hasAttribute` reads that as present, which
   * is the fact floating.tsx itself records as the reason `data-side` is the wrong
   * discriminator for `fitToRoom`. So the documented case satisfied the FIRST arm and the
   * second had no reachable input (deleted 2026-08-26, the ultracode audit).
   *
   * The law is what that deletion is safe BECAUSE of, and it is deliberately not "the height
   * came back": the height-only arm would deliver that too, so a law reading it cannot tell
   * the two arms apart. It reads the two properties only the FULL arm touches — the pose's
   * inline width, and the `--kui-pin-fit` marker `fitPin` leaves behind. Route this placement
   * to a height-only arm (spell the condition `getAttribute("data-side") !== "none"`, the
   * mistake the file warns about) and both are left on the element, which is what fails here.
   *
   * Measured at the release of this exact fixture, with both arms instrumented:
   * `IF[side=none,held=780px] |h=780px |w=[] |pin=[] |win=800` — the `if` taken, Base UI's own
   * 780px handed back, width and marker gone, `ELSE[…]` never printed once.
   */
  const OPTIONS = Array.from({ length: 30 }, (_, i) => `o${i}`);

  it("an item-aligned select goes through the full restore, marker and width included", async () => {
    // inMotion BEFORE the mount: the entry reads its release clock off computed durations, and
    // under the harness's pinned zeros it schedules a release the flight never survives.
    inMotion();
    const host = render(
      <Theme>
        {/* Half a window of room above the trigger: the overlap placement needs somewhere to
            put the rows that precede the chosen one, and Base UI drops it rather than run off
            the top of the window. */}
        <div style={{ height: "50vh" }} />
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
        <div style={{ height: "50vh" }} />
      </Theme>,
    );
    const trigger = host.querySelector<HTMLElement>(".kui-select-trigger")!;
    expect(trigger.getBoundingClientRect().top, "the trigger must sit clear of the top of the window").toBeGreaterThan(200);
    await userEvent.click(trigger);

    // `data-side` can answer twice — a fallback side is stamped first and the overlap placement
    // replaces it once the panel's real box has been measured — so this waits for the STATE.
    let popup: HTMLElement | undefined;
    await until(() => {
      popup = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop();
      return !!popup && !popup.hidden && popup.getAttribute("data-side") === "none";
    }, 3000);

    // CALIBRATION, three halves, and the law cannot fail without them. The placement must be
    // the item-aligned one; `data-side` must be the literal `none` that makes `hasAttribute`
    // true while `getAttribute` says otherwise (the whole reason the second arm looked
    // necessary); and Base UI must have sized the positioner, or there is nothing to restore
    // and every assertion below is trivially satisfied.
    expect(popup?.getAttribute("data-side"), "the case needs the item-aligned placement").toBe("none");
    const positioner = popup!.parentElement!;
    expect(positioner.hasAttribute("data-side"), "the positioner is not placed — the fixture is the defect").toBe(true);
    expect(positioner.getAttribute("data-side"), "the `none` that reads as present is the premise").toBe("none");

    expect(await until(() => !popup!.hasAttribute("data-unfurling"), 3000), "the flight never released").toBe(true);

    expect(
      positioner.style.height,
      "Base UI's own positioner height was not handed back — the panel is 100% of nothing",
    ).not.toBe("");
    expect(
      positioner.style.width,
      "the pose's inline width is still on the positioner — the height-only arm ran",
    ).toBe("");
    expect(
      positioner.style.getPropertyValue("--kui-pin-fit"),
      "the pin's correction marker outlived the pin — the height-only arm ran",
    ).toBe("");
  });
});


describe("an unmeasured direction states nothing (§20)", () => {
  /**
   * `PortalScope` stamps `dir` on the portal's landing spot, and until 2026-08-26 the context's
   * default direction was the literal `"ltr"` — so a portalling component that did not provide
   * the context did not fall back to "no opinion", it asserted the wrong one. A stamped `ltr`
   * OVERRIDES the `rtl` a portal would otherwise inherit from the document, which this file's
   * own `useAmbientDirection` records twice as strictly worse than doing nothing. Popover and
   * Tooltip both shipped that way and were both repaired the same day; this closes the shape
   * rather than the two instances, because fixing call sites leaves the trap loaded for the next
   * one.
   *
   * The fixture is the scope with NO provider above it, which is exactly the state a forgetful
   * component leaves it in — and the assertion is the computed direction, not the attribute,
   * because "no attribute" is only right if the document's direction actually arrives.
   */
  it("a portal scope with no provider inherits the document instead of overriding it", () => {
    const root = document.documentElement;
    const before = root.getAttribute("dir");
    try {
      root.setAttribute("dir", "rtl");
      const host = render(
        <Theme>
          <PortalScope>
            <span id="carried">مرحبا</span>
          </PortalScope>
        </Theme>,
      );
      const wrapper = host.querySelector<HTMLElement>(".kui-portal")!;
      expect(
        wrapper.getAttribute("dir"),
        "the wrapper stamped a direction nobody measured — a stale stamp is worse than none",
      ).toBeNull();
      expect(
        getComputedStyle(wrapper).direction,
        "the portal did not inherit the document's direction",
      ).toBe("rtl");

      // CALIBRATION: the stamp still works when someone DID measure. Without this the fix could
      // be "never stamp anything", which deletes §20's paint half — the reason the wrapper
      // exists at all.
      const provided = render(
        <Theme>
          <FloatingDirectionContext.Provider value={{ direction: "ltr", measure: () => {}, anchor: () => null }}>
            <PortalScope>
              <span />
            </PortalScope>
          </FloatingDirectionContext.Provider>
        </Theme>,
      );
      const stated = provided.querySelector<HTMLElement>(".kui-portal")!;
      expect(stated.getAttribute("dir"), "a measured direction is no longer stated").toBe("ltr");
      expect(getComputedStyle(stated).direction, "the stated direction did not take").toBe("ltr");
    } finally {
      if (before === null) root.removeAttribute("dir");
      else root.setAttribute("dir", before);
    }
  });
});

/**
 * A CENTRE-ALIGNED PANEL KEEPS ITS CONTENT CENTRED FOR EVERY FRAME OF THE ENTRY (§22, 2026-08-29).
 *
 * The report was a tooltip's: *"the content inside is in wrong pos, it jumps after animation has
 * finished"*. The body is held at its LANDED width for the whole flight so its text cannot
 * re-break mid-air, and it was centred by two insets plus `margin-inline: auto` — which can only
 * centre a box that fits. For the opening half of every entry the body is wider than the pane
 * growing into it, the equation is over-constrained, and the cascade drops the end inset: the
 * words sit against the start edge and hang off the other one. Measured before the fix, at 30%
 * opacity on an 88.9px pane: 13.4px of gap on the left and −7.4px on the right.
 *
 * THE LAW READS THE SKEW, not either gap. A gap is supposed to move — the box is opening — so a
 * law asserting a distance would have to know the spring, and one asserting "the last flight
 * frame equals rest" is exactly the law that was already green over this defect. What may never
 * move is the DIFFERENCE between the two gaps, at any width the box passes through.
 *
 * The clock is SEIZED rather than raced (`sweep`): the pane's own `inline-size` transition is
 * paused and stepped, so the law reads a series of widths rather than whatever frames the runner
 * happened to schedule, and it is CI-safe by construction.
 *
 * Two members, because the claim is the family's and `align="center"` is the DEFAULT of exactly
 * these two. The triggers are deliberately narrow — the seed is the trigger's own silhouette, so
 * a trigger wider than its panel would open by SHRINKING and the centring would hold trivially.
 * The span guard is what says the fixture reached the case at all.
 */
describe("a centre-aligned panel keeps its content centred for every frame (§22)", () => {
  const skew = (pane: HTMLElement) => {
    const body = pane.querySelector<HTMLElement>(".kui-floating-body");
    if (!body) throw new Error("no floating body — the law would read nothing");
    const p = pane.getBoundingClientRect();
    const b = body.getBoundingClientRect();
    return { skew: b.left - p.left - (p.right - b.right), width: p.width };
  };

  const cases = [
    {
      what: "tooltip",
      selector: ".kui-tooltip-popup",
      ui: (
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button iconOnly aria-label="Comment">…</Button>} />
          <TooltipContent>Comment on this revision</TooltipContent>
        </Tooltip>
      ),
    },
    {
      what: "popover",
      selector: ".kui-popover-popup",
      ui: (
        <Popover defaultOpen>
          <PopoverTrigger render={<Button iconOnly aria-label="Filters">…</Button>} />
          <PopoverContent>
            <PopoverTitle>Filters</PopoverTitle>
          </PopoverContent>
        </Popover>
      ),
    },
  ] as const;

  for (const c of cases)
    it(`${c.what}: the two gaps stay equal at every width the box passes through`, async () => {
      inMotion();
      render(
        <Theme>
          <div style={{ padding: 240 }}>{c.ui}</div>
        </Theme>,
      );
      await until(() => !!document.querySelector(c.selector));
      const pane = document.querySelector<HTMLElement>(c.selector)!;
      // Wait for the FLIGHT rather than for a frame count: the entry poses on mount and the
      // box's own transition starts a tick later, so a law that swept on the first settled
      // attribute would find no clock to seize.
      const flying = () =>
        pane
          .getAnimations()
          // `width`, not `inline-size`: Chromium reports a logical size transition under its
          // physical name, which is the same spelling select's own height sweep already uses.
          .some((a) => (a as CSSTransition).transitionProperty === "width");
      if (!(await until(flying))) throw new Error(`${c.what}: the box never began to open`);
      const series = await sweep(pane, "width", () => skew(pane));
      const widths = series.map((s) => s.width);
      // The fixture must actually GROW, or "centred at every width" is a claim about one width.
      expect(Math.max(...widths) - Math.min(...widths), `${c.what}: the box never opened`)
        .toBeGreaterThan(20);
      for (const s of series)
        expect(
          Math.abs(s.skew),
          `${c.what}: at ${s.width.toFixed(1)}px the content sits ${s.skew.toFixed(1)}px off centre`,
        ).toBeLessThan(1);
    });
});

/**
 * …AND A PANEL THAT LANDS BESIDE ITS TRIGGER NEVER SQUEEZES ITS OWN CONTENT (§22, 2026-08-29).
 *
 * The block half of the same defect, and it failed differently because the body's height is
 * `auto`: two block insets did not over-constrain, they FORCED the box to the growing pane's
 * padding box, and the words overflowed it. Measured on a two-line tooltip at 30% opacity —
 * 56px of body holding 60px of words — settling only as the pane caught up.
 *
 * So the law is not a skew, it is a containment: the body's own box may never be shorter than
 * what is inside it, at any height the pane passes through. Read as `offsetHeight` against
 * `scrollHeight`, which are both LAYOUT numbers and therefore unaffected by the squish scale the
 * entry legitimately applies on this axis.
 */
describe("a panel beside its trigger never squeezes its content (§22)", () => {
  it("the body holds its words at every height the pane passes through", async () => {
    inMotion();
    render(
      <Theme>
        <div style={{ padding: 240 }}>
          <Tooltip defaultOpen>
            <TooltipTrigger render={<Button iconOnly aria-label="Restore">…</Button>} />
            <TooltipContent side="left">
              Restore this document to the version saved before the last import
            </TooltipContent>
          </Tooltip>
        </div>
      </Theme>,
    );
    await until(() => !!document.querySelector(".kui-tooltip-popup"));
    const pane = document.querySelector<HTMLElement>(".kui-tooltip-popup")!;
    const body = pane.querySelector<HTMLElement>(".kui-floating-body")!;
    const flying = () =>
      pane.getAnimations().some((a) => (a as CSSTransition).transitionProperty === "height");
    if (!(await until(flying))) throw new Error("the box never began to open");
    const series = await sweep(pane, "height", () => ({
      held: body.offsetHeight,
      wants: body.scrollHeight,
      pane: pane.offsetHeight,
    }));
    // The pane must genuinely GROW past the seed, or "at every height" is one height.
    const panes = series.map((s) => s.pane);
    expect(Math.max(...panes) - Math.min(...panes), "the pane never opened").toBeGreaterThan(20);
    for (const s of series)
      expect(
        s.held,
        `at a ${s.pane}px pane the body held ${s.held}px of a ${s.wants}px body`,
      ).toBeGreaterThanOrEqual(s.wants);
  });
});
