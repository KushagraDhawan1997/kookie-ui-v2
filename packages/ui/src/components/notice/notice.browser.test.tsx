/**
 * Notice's laws, mounted (§29). Computed values through a real <Theme>, both appearances where
 * colour is the claim — and the two structural claims (it takes space, it never floats) read as
 * geometry, because they are what separate this component from the one that was refused.
 */
import * as React from "react";
import { flushSync } from "react-dom";
import { describe, expect, it } from "vitest";

import { APPEARANCES, DEPTHS, colorOn, computed, mounted, tokenOn, within } from "../../test/browser.tsx";
import { Box } from "../box/box.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../dialog/dialog.tsx";
import { Stack } from "../stack/stack.tsx";
import { Text } from "../text/text.tsx";
import { Notice } from "./notice.tsx";

describe("it is a condition stated in place: it takes space and never floats (§29)", () => {
  it("it occupies flow — the content under it moves down by the strip's own height", () => {
    const withNotice = mounted(
      <Stack gap="1">
        <Notice>Approaching weekly usage limit</Notice>
        <Text>Body</Text>
      </Stack>,
      { theme: {} },
    );
    const without = mounted(
      <Stack gap="1">
        <Text>Body</Text>
      </Stack>,
      { theme: {} },
    );
    const strip = within(withNotice, ".kui-notice").getBoundingClientRect();
    // The claim is displacement, not merely presence: a floating strip renders and pushes
    // nothing, which is exactly the thing this component is not.
    expect(strip.height).toBeGreaterThan(0);
    expect(withNotice.getBoundingClientRect().height).toBeGreaterThan(
      without.getBoundingClientRect().height + strip.height - 1,
    );
  });

  it("it lifts off nothing — no position, no z-index, no float", () => {
    const el = mounted(<Notice>Approaching weekly usage limit</Notice>, { theme: {} });
    expect(computed(el, "position")).toBe("static");
    expect(computed(el, "z-index")).toBe("auto");
    expect(computed(el, "float")).toBe("none");
  });

  it("it announces politely — a status, never an alert", () => {
    const el = mounted(<Notice>Approaching weekly usage limit</Notice>, { theme: {} });
    expect(el.getAttribute("role")).toBe("status");
  });
});

describe("tone is the category, not the volume (§29, §11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: it rests NEUTRAL — the fill is neutral's a3, not a warning colour`, () => {
      const el = mounted(<Notice>Approaching weekly usage limit</Notice>, { theme: { appearance } });
      expect(el.getAttribute("data-tone")).toBe("neutral");
      expect(computed(el, "background-color")).toBe(colorOn(el, "var(--neutral-a3)"));
    });

    it(`${appearance}: a chosen family reaches the fill AND the words`, () => {
      const el = mounted(<Notice tone="destructive">Payment failed</Notice>, {
        theme: { appearance },
      });
      expect(computed(el, "background-color")).toBe(colorOn(el, "var(--destructive-a3)"));
      // Both halves, because "the box went red and the words stayed grey" is the half-fix that
      // ships: the tone-forward rung re-scopes the foreground context for its children too.
      const body = within(el, ".kui-notice-body");
      expect(computed(body, "color")).toBe(colorOn(el, "var(--destructive-text)"));
      const neutral = mounted(<Notice>Nothing wrong</Notice>, { theme: { appearance } });
      expect(computed(el, "background-color")).not.toBe(computed(neutral, "background-color"));
      expect(computed(body, "color")).not.toBe(
        computed(within(neutral, ".kui-notice-body"), "color"),
      );
    });
  }
});

describe("two verbs, and both are optional (§29)", () => {
  it("no dismissal is rendered unless the app can honour one", () => {
    const el = mounted(<Notice>Approaching weekly usage limit</Notice>, { theme: {} });
    expect(el.querySelector("button")).toBeNull();
  });

  it("onDismiss renders a real, named button and calls back", () => {
    let dismissed = 0;
    const el = mounted(
      <Notice onDismiss={() => (dismissed += 1)}>Approaching weekly usage limit</Notice>,
      { theme: {} },
    );
    const close = within(el, "button");
    // A named button, not a glyph somebody has to guess at.
    expect(close.getAttribute("aria-label")).toBe("Dismiss");
    close.click();
    expect(dismissed).toBe(1);
  });

  it("the name is the caller's when the app does not speak English", () => {
    const el = mounted(
      <Notice onDismiss={() => {}} dismissLabel="Descartar">
        Se acerca el límite semanal
      </Notice>,
      { theme: {} },
    );
    expect(within(el, "button").getAttribute("aria-label")).toBe("Descartar");
  });

  it("the action and the dismissal sit at the trailing edge, and the words keep the slack", () => {
    const el = mounted(
      <Notice action={<Button>Get more usage</Button>} onDismiss={() => {}}>
        Approaching weekly usage limit
      </Notice>,
      { theme: {}, select: ".kui-notice" },
    );
    const body = within(el, ".kui-notice-body").getBoundingClientRect();
    const action = within(el, ".kui-notice-action").getBoundingClientRect();
    const close = within(el, ".kui-notice-dismiss").getBoundingClientRect();
    expect(body.width).toBeGreaterThan(action.width);
    expect(action.left).toBeGreaterThanOrEqual(body.right - 1);
    expect(close.left).toBeGreaterThanOrEqual(action.right - 1);
  });

  it("a long unbroken word does not push the verbs off the end", () => {
    // The word has NO hyphens and no dots, and that is the whole law. The first fixture was
    // `cannot-reach-storage-eu-west-1-replica-seven.internal.example.test`, which a browser
    // breaks after every hyphen — so it wrapped on its own, the assertion held with the flex
    // floor removed, and the law proved nothing. A law over the general case needs an input
    // where the general case and the special case give DIFFERENT answers.
    const el = mounted(
      <Stack style={{ width: "320px" }}>
        <Notice action={<Button>Retry</Button>} onDismiss={() => {}}>
          cannotreachstorageeuwestonereplicaseveninternalexampletesthostname
        </Notice>
      </Stack>,
      { theme: {}, select: ".kui-notice" },
    );
    const strip = el.getBoundingClientRect();
    const close = within(el, ".kui-notice-dismiss").getBoundingClientRect();
    expect(close.right).toBeLessThanOrEqual(strip.right + 1);
  });
});

describe("the box is the surface layer's, not the component's (§10)", () => {
  it("its padding and corner are a surface's at the same index — nothing designed twice", () => {
    const notice = mounted(<Notice size="3">Approaching weekly usage limit</Notice>, { theme: {} });
    const card = mounted(<Card size="3">Body</Card>, { theme: {} });
    expect(computed(notice, "padding-top")).toBe(computed(card, "padding-top"));
    expect(computed(notice, "border-radius")).toBe(computed(card, "border-radius"));
  });

  it("the symbol takes the label cluster's icon box, so it lands on the drawing grid", () => {
    const el = mounted(
      <Notice size="3" icon={<svg viewBox="0 0 16 16" />}>
        Approaching weekly usage limit
      </Notice>,
      { theme: {} },
    );
    const icon = within(el, ".kui-notice-icon");
    expect(computed(icon, "width")).toBe(tokenOn(el, "--icon-size-3"));
  });

  it("the symbol is hidden from assistive technology — the words are the message", () => {
    const el = mounted(
      <Notice icon={<svg viewBox="0 0 16 16" />}>Approaching weekly usage limit</Notice>,
      { theme: {} },
    );
    expect(within(el, ".kui-notice-icon").getAttribute("aria-hidden")).toBe("true");
  });

  it("outer spacing is nobody's but the caller's (the non-negotiable)", () => {
    const el = mounted(<Notice>Approaching weekly usage limit</Notice>, { theme: {} });
    expect(computed(el, "margin-top")).toBe("0px");
    expect(computed(el, "margin-bottom")).toBe("0px");
  });
});

describe("a notice does not cast, and it does answer the material (§5, §10)", () => {
  it("it throws no shadow, in either world — a marker on a plane, not a plane", () => {
    for (const depth of DEPTHS) {
      const notice = mounted(<Notice>Approaching weekly usage limit</Notice>, { theme: { depth } });
      // Read the PAINT, not the token: the world's chrome arrives by inheritance and the pane's
      // own name is consulted first, so a law reading either one alone can miss the other hop.
      expect(computed(notice, "box-shadow")).not.toContain("rgba(0, 0, 0, 0.1)");
    }
    // The negative control, and it is the whole finding: a Card at the same index in the same
    // world DOES cast. Without this, deleting the surface chrome entirely would pass above.
    const card = mounted(<Card>Body</Card>, { theme: { depth: "elevated" } });
    expect(computed(card, "box-shadow")).toContain("rgba(0, 0, 0, 0.1)");
  });

  it("and a GLASS notice throws none either — the cell the stand-down actually loses (2026-08-26)", () => {
    /**
     * This loop is the half the file was missing: every fixture above mounts a SOLID notice,
     * so `data-material` is never stamped and the (0,2,0) material rule that defeats a
     * one-class stand-down never matches. The stand-down could be deleted outright and the
     * suite stayed green on the glass cell.
     *
     * A glass pane keeps its POOL — the seat-line the material HAS — so "no shadow at all" is
     * the wrong claim here. What must be absent is the transmitted CAST, which is the world's
     * chrome; the Card control below is what says the world really is casting.
     */
    for (const depth of DEPTHS) {
      const notice = mounted(<Notice backdrop>Approaching weekly usage limit</Notice>, {
        theme: { depth, material: "regular" },
      });
      expect(notice.getAttribute("data-material"), "the fixture never reached the glass rules").toBe(
        "regular",
      );
      // The expected list, spelled through the WORLD's inheriting name rather than the pane's
      // own `--kui-sf-pool` — that one is registered `inherits: false`, so a child probe reads
      // nothing at all and this law would compare two empty strings.
      const probe = document.createElement("div");
      probe.style.boxShadow = "var(--kui-surface-pool, 0 0 0 0 transparent), 0 0 0 0 transparent";
      notice.append(probe);
      // The POOL, then the no-op where the transmitted cast would be: the pane's own matter,
      // and nothing the app says about height.
      expect(computed(notice, "box-shadow"), `depth=${depth}`).toBe(computed(probe, "box-shadow"));
      probe.remove();
    }
    // The control, and it is the whole finding: the same glass rules DO transmit a cast to a
    // pane that establishes a plane. Read as the difference against that pane's own pool
    // rather than against a literal — the transmitted rows are FADED per thickness, so a
    // hard-coded alpha is a law about one tuning of the shadow palette.
    const card = mounted(<Card backdrop>Body</Card>, { theme: { depth: "elevated", material: "regular" } });
    const bare = document.createElement("div");
    bare.style.boxShadow = "var(--kui-surface-pool, 0 0 0 0 transparent), 0 0 0 0 transparent";
    card.append(bare);
    expect(
      computed(card, "box-shadow"),
      "a glass Card casts nothing either, so the loop above proves nothing",
    ).not.toBe(computed(bare, "box-shadow"));
    bare.remove();
  });

  it("a glass theme reaches it once it says content passes behind", () => {
    const solid = mounted(<Notice>x</Notice>, { theme: { material: "regular" } });
    // In flow with nothing behind it, a notice resolves solid and pays nothing (selectivity).
    expect(solid.getAttribute("data-material")).toBeNull();
    expect(computed(solid, "backdrop-filter")).toBe("none");

    const glass = mounted(<Notice backdrop>x</Notice>, { theme: { material: "regular" } });
    expect(glass.getAttribute("data-material")).toBe("regular");
    expect(computed(glass, "backdrop-filter")).toContain("blur");
  });

  it("an ordinary re-render does not rebuild the map (§10, 2026-08-26)", async () => {
    /**
     * `useLensRef` ALREADY forwards the caller's ref, and this component merged it a second
     * time with `mergeRefs`, which returns a FRESH closure per call. React answers a new ref
     * identity by detaching with `null` and reattaching — and `useLens`'s detach RELEASES the
     * filter, dropping its last user, so the reattach misses `acquire`'s cache and mints a new
     * displacement map: a per-pixel Snell solve, a `toDataURL` encode and an eleven-node
     * `<filter>` graft, for every render of anything above the notice. Card and Shell were
     * found with the identical defect the same day.
     *
     * Read as the filter's IDENTITY rather than as a count of `<filter>` nodes: the churn
     * releases one and mints one, so the pane's own `url(#kui-lens-N)` is the axis that moves.
     */
    let bump!: () => void;
    function App() {
      const [n, setN] = React.useState(0);
      bump = () => flushSync(() => setN((v) => v + 1));
      return (
        <Box backdrop style={{ width: "400px" }}>
          <Notice backdrop data-tick={n}>
            Approaching weekly usage limit
          </Notice>
        </Box>
      );
    }
    const notice = mounted(<App />, { theme: { material: "regular" }, select: ".kui-notice" });
    await new Promise((resolve) => setTimeout(resolve, 200));
    const before = notice.style.getPropertyValue("--kui-lens");
    // THE PREMISE: a lens was really built, or "it did not change" is trivially true — the
    // fixture defect this repo has already paid for more than once.
    expect(before, "no lens was built, so this cannot show the churn").not.toBe("");
    bump();
    await expect.poll(() => notice.getAttribute("data-tick")).toBe("1");
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(
      notice.style.getPropertyValue("--kui-lens"),
      "an ordinary re-render tore the lens down and minted a new map",
    ).toBe(before);
  });

  it("a glass strip scopes its subtree — the action does not paint a second veil", () => {
    // The notice sits in a REGION that says content passes behind it, which is what makes this
    // law able to fail: the action reads that ambient region by itself, so without the strip's
    // own scope it resolves the theme's glass and paints a second veil over the first. The
    // first fixture had no region — the action resolved solid either way and deleting the
    // scope changed nothing, which is a law about a case the mechanism was not built for.
    const el = mounted(
      <Box backdrop>
        <Notice backdrop action={<Button>Retry</Button>}>
          x
        </Notice>
      </Box>,
      { theme: { material: "regular" }, select: ".kui-notice" },
    );
    const action = within(el, "button");
    expect(computed(el, "backdrop-filter")).toContain("blur");
    expect(computed(action, "backdrop-filter")).toBe("none");
  });
});

describe("the message is the system's type, so the index reaches it (§15, §29)", () => {
  it("the words grow with the box", () => {
    const small = mounted(<Notice size="1">x</Notice>, { theme: {} });
    const large = mounted(<Notice size="4">x</Notice>, { theme: {} });
    const step = (el: HTMLElement) => computed(within(el, ".kui-notice-body"), "font-size");
    expect(parseFloat(step(large))).toBeGreaterThan(parseFloat(step(small)));
  });

  it("it is the ALERT's step at the same index — the two may not drift", () => {
    const notice = mounted(<Notice size="3">x</Notice>, { theme: {} });
    mounted(
      <Dialog size="3" defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Body</DialogDescription>
        </DialogContent>
      </Dialog>,
      { theme: {} },
    );
    // Found by its words, not by a panel class: the panel is portalled and its class list is
    // the surface layer's, so a selector guess here would be a law about a spelling.
    const description = [...document.querySelectorAll<HTMLElement>("p")].find(
      (el) => el.textContent === "Body",
    ) ?? null;
    expect(description).not.toBeNull();
    expect(computed(within(notice, ".kui-notice-body"), "font-size")).toBe(
      computed(description!, "font-size"),
    );
  });

  it("a caller who states a step on their own Text still wins", () => {
    const el = mounted(
      <Notice size="4">
        <Text size="1">Small on purpose</Text>
      </Notice>,
      { theme: {} },
    );
    const own = within(el, ".kui-text[data-size='1']");
    expect(parseFloat(computed(own, "font-size"))).toBeLessThan(
      parseFloat(computed(within(el, ".kui-notice-body"), "font-size")),
    );
  });
});
