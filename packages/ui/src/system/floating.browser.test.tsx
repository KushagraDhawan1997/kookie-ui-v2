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

import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select/select.tsx";
import { FloatingDirectionContext, PortalScope } from "./floating.tsx";
import { Theme } from "../theme/theme.tsx";
import { inMotion, render, until } from "../test/browser.tsx";

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
