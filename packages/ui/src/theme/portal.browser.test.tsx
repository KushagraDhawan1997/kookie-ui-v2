/**
 * Portals: re-theming and the stacking frame (§20, decided 2026-08-08).
 *
 * The tokens live on the Theme element as data attributes, and a popup portalled to
 * `document.body` is outside every one of them — measured before the mechanism existed: a
 * dark/compact/elevated app's card came back WHITE, wrong corner, wrong padding, no shadow.
 * The failure never throws; it renders a correct-looking light-mode card in a dark app.
 *
 * Two rules close it, and these laws pin both:
 *
 * 1. Portalled content re-themes: a bare `<Theme>` inside the portal re-stamps every resolved
 *    axis, because React context crosses portals while CSS attributes do not. The law is an
 *    AGREEMENT (the two-implementations rule): portalled must compute identical to in-flow.
 * 2. The stacking frame: the DOM-outermost `.kui-theme` is `isolation: isolate`, so an app
 *    z-index resolves inside the app and a body-level portal — a later sibling — paints
 *    above. Without it, a `z-index: 50` header covered the portal (measured; the deleted-rule
 *    sabotage below re-demonstrates it).
 *
 * Every hit-test here follows the vacuity cure (LOG 2026-08-06): a point nobody claims, or a
 * subject that never mounted, is an ERROR, never a passing zero.
 */
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Card } from "../components/card/card.tsx";
import { Theme, type ThemeProps } from "./theme.tsx";
import { installStyles, render } from "../test/browser.tsx";

/** A hostile axis set: every axis off its default, so a dropped attribute is visible. */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  surfaces: "elevated",
  look: "filled",
};

/** The card facts every axis reaches — fill, edge, corner, rhythm, and the elevated cast. */
function facts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
    border: cs.borderTopColor,
    radius: cs.borderTopLeftRadius,
    padding: cs.paddingTop,
    shadow: cs.boxShadow,
  };
}

/** Mount a card in-flow and its twin portalled-with-Theme under one root; return both. */
function twins(theme: ThemeProps): { inFlow: HTMLElement; portalled: HTMLElement } {
  let inFlow: HTMLElement | null = null;
  let portalled: HTMLElement | null = null;
  render(
    <Theme {...theme}>
      <Card ref={(n: HTMLDivElement | null) => void (inFlow = n)}>in-flow</Card>
      {createPortal(
        <Theme>
          <Card ref={(n: HTMLDivElement | null) => void (portalled = n)}>portalled</Card>
        </Theme>,
        document.body,
      )}
    </Theme>,
  );
  if (!inFlow || !portalled) throw new Error("a twin never mounted — the law would compare nothing");
  return { inFlow, portalled };
}

afterEach(() => {
  // Law files own their document mutations; the harness only removes mount hosts.
  document.documentElement.removeAttribute("data-appearance");
});

describe("portalled content re-themes: portal ≡ in-flow (§20)", () => {
  it("computes identical across the hostile axis set", () => {
    const { inFlow, portalled } = twins(HOSTILE);
    expect(portalled.parentElement!.className).toContain("kui-theme");
    expect(facts(portalled)).toEqual(facts(inFlow));
    // The comparison must be able to fail: the same card under default axes disagrees.
    const bare = twins({});
    expect(facts(bare.inFlow)).not.toEqual(facts(inFlow));
  });

  it("carries contrast=high through the portal", () => {
    const { inFlow, portalled } = twins({ appearance: "light", contrast: "high" });
    expect(portalled.parentElement!.getAttribute("data-contrast")).toBe("high");
    expect(facts(portalled)).toEqual(facts(inFlow));
  });

  it("holds under appearance=inherit with the html-stamped dark of apps/docs", () => {
    document.documentElement.setAttribute("data-appearance", "dark");
    const { inFlow, portalled } = twins({ appearance: "inherit" });
    // Honest instrument: this run must actually be dark, not two matching lights.
    const light = getComputedStyle(document.createElement("div")).backgroundColor;
    expect(facts(inFlow).bg).not.toBe(light);
    expect(facts(portalled)).toEqual(facts(inFlow));
  });

  it("the portal wrapper is inert around positioned content: zero height, steals no click", () => {
    // A real popup is POSITIONED (a menu's popover engine sets fixed coordinates), so the
    // wrapper it rides in owns no box — this law mounts that shape, not an in-flow card.
    installStyles();
    const behind = document.createElement("button");
    behind.textContent = "behind";
    behind.style.cssText = "position:fixed;top:200px;left:200px;width:80px;height:40px";
    document.body.append(behind);
    try {
      let popup: HTMLElement | null = null;
      render(
        <Theme {...HOSTILE}>
          {createPortal(
            <Theme>
              <Card
                ref={(n: HTMLDivElement | null) => void (popup = n)}
                style={{ position: "fixed", top: 400, left: 400 }}
              >
                popup
              </Card>
            </Theme>,
            document.body,
          )}
        </Theme>,
      );
      if (!popup) throw new Error("popup never mounted");
      const wrapper = (popup as HTMLElement).parentElement!;
      expect(wrapper.getBoundingClientRect().height).toBe(0);
      behind.scrollIntoView({ block: "center" });
      const owner = document.elementFromPoint(240, 220);
      if (!owner) throw new Error("hit-test saw nothing — probe is off-viewport");
      expect(owner).toBe(behind);
    } finally {
      behind.remove();
    }
  });
});

describe("the stacking frame (§20)", () => {
  it("the outermost theme isolates; a nested theme does not", () => {
    let outer: HTMLElement | null = null;
    let inner: HTMLElement | null = null;
    render(
      <Theme render={<div ref={(n: HTMLDivElement | null) => void (outer = n)} />}>
        <Theme
          density="compact"
          render={<div ref={(n: HTMLDivElement | null) => void (inner = n)} />}
        />
      </Theme>,
    );
    if (!outer || !inner) throw new Error("a theme never mounted");
    expect(getComputedStyle(outer).isolation).toBe("isolate");
    expect(getComputedStyle(inner).isolation).toBe("auto");
  });

  it("a body-level portal paints above an app z-index inside the theme", () => {
    let header: HTMLElement | null = null;
    let popup: HTMLElement | null = null;
    render(
      <Theme>
        <div
          ref={(n: HTMLDivElement | null) => void (header = n)}
          style={{ position: "fixed", top: 100, left: 100, width: 200, height: 200, zIndex: 50 }}
        />
        {createPortal(
          <Theme>
            <div
              ref={(n: HTMLDivElement | null) => void (popup = n)}
              style={{ position: "fixed", top: 150, left: 150, width: 100, height: 100 }}
            />
          </Theme>,
          document.body,
        )}
      </Theme>,
    );
    if (!header || !popup) throw new Error("a subject never mounted");
    const owner = document.elementFromPoint(180, 180);
    if (!owner) throw new Error("hit-test saw nothing — probe is off-viewport");
    // Honest instrument: the header must actually claim territory of its own where the
    // popup is absent, or "popup wins" would also pass with the header never painting.
    const alone = document.elementFromPoint(120, 120);
    expect(alone).toBe(header);
    expect(owner).toBe(popup);
  });

  it("a theme rendered onto <body> warns in dev — the one placement the frame cannot survive", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // Mounting a <body> under the test host is invalid nesting ON PURPOSE (the real mistake
    // happens where a framework owns THE body, which a test cannot reach) — swallow React's
    // nesting complaint so the deliberate probe does not read as suite noise.
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      render(<Theme render={<body />} />);
      const call = warn.mock.calls.find((c) => String(c[0]).includes("stacking frame"));
      if (!call) throw new Error("body-mounted theme warned nothing");
      // And the ordinary shape stays silent — a warning that always fires teaches ignoring it.
      warn.mockClear();
      render(<Theme />);
      expect(warn.mock.calls.filter((c) => String(c[0]).includes("stacking frame"))).toEqual([]);
    } finally {
      warn.mockRestore();
      error.mockRestore();
    }
  });

  it("the frame does not trap position:fixed — a fixed child stays viewport-positioned", () => {
    let fixed: HTMLElement | null = null;
    render(
      <Theme style={{ marginTop: 120, marginLeft: 80 }}>
        <div
          ref={(n: HTMLDivElement | null) => void (fixed = n)}
          style={{ position: "fixed", top: 0, left: 0, width: 10, height: 10 }}
        />
      </Theme>,
    );
    if (!fixed) throw new Error("subject never mounted");
    const r = (fixed as HTMLElement).getBoundingClientRect();
    expect([r.top, r.left]).toEqual([0, 0]);
  });
});
