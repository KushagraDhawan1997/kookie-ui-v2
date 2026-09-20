/**
 * The floating module's own laws (§20) — the ones whose subject is `system/floating.tsx` itself
 * rather than any one component's behaviour: here, the portal's landing spot and the direction
 * it states.
 */
import { describe, expect, it } from "vitest";

import { FloatingDirectionContext, PortalScope } from "./floating.tsx";
import { Theme } from "../theme/theme.tsx";
import { render } from "../test/browser.tsx";

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
          <FloatingDirectionContext.Provider value={{ direction: "ltr", measure: () => {} }}>
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
