/**
 * Dialog's mounted laws (§10, §20, §24) — the 2026-08-03 standard: computed values through a
 * mounted <Theme>, both appearances where colour is the question.
 *
 * This file carries the §20 AGREEMENT LAW every portalling component owes (ENGINEERING §2.1),
 * and then the three facts that are the dialog's own rather than the family's: the SCRIM, the
 * overlay CORNER, and the box (a maximum width the window can win). The family mechanisms —
 * the portal wrapper's re-stamping, the surface rungs, the material recipes — are law-tested
 * where they live; what is asserted here is that this component wears them.
 *
 * Motion LEFT this file 2026-08-16 (LOG, the dialog/alert split): the materialization was
 * judged to be the alert's gesture, so the recipe, the runner and its laws moved to
 * AlertDialog whole. A dialog opens with no entry until its own large-mass entry lands —
 * the follow-up commit — which is a sequencing fact, not a design one.
 */
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent, page } from "vitest/browser";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
  type OverlayOpenChangeDetails,
} from "./dialog.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/menu.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Box } from "../box/box.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { VIEWPORT } from "../../test/viewport.ts";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "../alert-dialog/alert-dialog.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { Heading } from "../heading/heading.tsx";
import { Text } from "../text/text.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import {
  DEPTHS,
  asksForStillness,
  inMotion,
  render,
  settleAll,
  computed,
  colorOn,
  probeIn,
  tokenOn,
  SIZES,
  APPEARANCES,
  until,
} from "../../test/browser.tsx";
import type { Size } from "../../system/axes.ts";

/** Every axis off its default — a dropped attribute is visible (the §20 constant, Select's
    set verbatim: seven axes, contrast included, because that is what ENGINEERING §2.1 names). */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  depth: "elevated",
  contrast: "high",
};

/** Mount an OPEN dialog under a themed root; LOUD when the panel never mounts. */
function openDialog(theme: ThemeProps, opts: { size?: Size; material?: "thin" | "regular" | "thick"; body?: React.ReactNode } = {}) {
  render(
    <Theme {...theme} {...(opts.material ? { material: opts.material } : {})}>
      <Dialog defaultOpen {...(opts.size ? { size: opts.size } : {})}>
        <DialogContent>
          <DialogTitle>Delete workspace</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
          {opts.body}
        </DialogContent>
      </Dialog>
    </Theme>,
  );
  // The LAST panel — mounts accumulate within one test (the menu suite's own lesson).
  const popups = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the panel never mounted — every law below would assert nothing");
  const backdrops = document.querySelectorAll<HTMLElement>(".kui-dialog-backdrop");
  const backdrop = backdrops[backdrops.length - 1];
  if (!backdrop) throw new Error("the backdrop never mounted");
  const viewport = popup.parentElement;
  if (!viewport?.classList.contains("kui-dialog-viewport")) throw new Error("the viewport is not the panel's parent");
  settleAll();
  return { popup, backdrop, viewport };
}

function surfaceFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
    border: cs.borderTopColor,
    radius: cs.borderTopLeftRadius,
    padding: cs.paddingTop,
    shadow: cs.boxShadow,
    color: cs.color,
    direction: cs.direction,
  };
}

/** A FILTER token as the scope resolves it — `tokenOn` probes through `width`, which rejects
    a filter function list and answers a healthy `0px`, and two laws here quietly compared
    real filters against it before this existed (caught on first run). */
const filterOn = (scope: Element, name: string): string =>
  probeIn(scope, (el) => (el.style.backdropFilter = `var(${name})`), (s) => s.backdropFilter);

/** The alpha of a computed `rgba(...)`, or 1 for an opaque colour. Parsed off the BROWSER's
    output, never rebuilt from the token — the instrument-calibration lesson (2026-08-08). */
function alphaOf(color: string): number {
  // Two spellings, because the browser answers in two: `rgba(r, g, b, a)` for a plain
  // declared colour and `color(srgb r g b / a)` for the color-mix a material derives. The
  // first cut knew only the first and threw on the glass panel — the instrument, not the
  // subject, which is the calibration lesson this repo has now learned three times.
  const slash = color.match(/\/\s*([\d.]+)\s*\)/);
  if (slash) return Number(slash[1]);
  const legacy = color.match(/rgba?\(([^)]+)\)/);
  if (!legacy) throw new Error(`not a colour this parser knows: ${color}`);
  const fields = legacy[1]!.split(",").map((v) => parseFloat(v));
  return fields.length === 4 ? fields[3]! : 1;
}

/* ── The §20 agreement law ────────────────────────────────────────────────────────────── */

describe("the agreement law: portalled ≡ in-flow (§20, §24)", () => {
  function twin(theme: ThemeProps) {
    let panel: HTMLElement | null = null;
    render(
      <Theme {...theme}>
        <div
          ref={(n: HTMLDivElement | null) => void (panel = n)}
          className="kui-surface kui-overlay kui-dialog-popup"
          data-size="3"
          data-tone="neutral"
          data-emphasis="quiet"
          data-bordered="true"
        />
      </Theme>,
    );
    if (!panel) throw new Error("twin never mounted");
    return panel as HTMLElement;
  }

  it("computes identical under the hostile axis set", () => {
    const { popup } = openDialog(HOSTILE);
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(twin(HOSTILE)));
    // The comparison can fail: the same twin under default axes disagrees.
    expect(surfaceFacts(twin({}))).not.toEqual(surfaceFacts(twin(HOSTILE)));
  });

  it("takes the DOCUMENT's direction when the dialog has no trigger (§20, 2026-08-10)", () => {
    // Every floating component before this one owned a trigger, so ambient direction was
    // always readable off an in-flow node. A dialog need not have one — `<Dialog open>` driven
    // by app state is ordinary — and with nothing measured the hook rested at its `ltr`
    // initial value, which is not "unknown": PortalScope STAMPS what it holds, so a stamped
    // ltr OVERRIDES the rtl the portal would have inherited. Worse than doing nothing, which
    // is the same sentence the runtime-switch fix earned one component over.
    const html = document.documentElement;
    const before = html.getAttribute("dir");
    try {
      html.setAttribute("dir", "rtl");
      const { popup } = openDialog({});
      expect(computed(popup, "direction")).toBe("rtl");
    } finally {
      if (before === null) html.removeAttribute("dir");
      else html.setAttribute("dir", before);
    }
  });
});

/* ── The scrim (§10, §24) ─────────────────────────────────────────────────────────────── */

describe("the scrim: the app goes back", () => {
  it("covers the viewport and dims harder in dark than in light", () => {
    const alphas = APPEARANCES.map((appearance) => {
      const { backdrop } = openDialog({ appearance });
      const cs = getComputedStyle(backdrop);
      expect(cs.position).toBe("fixed");
      // The whole viewport, not the page: a scrolled document must not show an undimmed strip.
      expect(parseFloat(cs.width)).toBe(window.innerWidth);
      expect(parseFloat(cs.height)).toBe(window.innerHeight);
      expect(cs.backgroundColor).toMatch(/^rgba\(0, 0, 0,/);
      return alphaOf(cs.backgroundColor);
    });
    // A 40% veil over a near-black page moves almost nothing, which is why the dark row leans.
    expect(alphas[1]!).toBeGreaterThan(alphas[0]!);
  });

  it("blurs at rest and stops blurring under contrast=\"high\" — the dim carries it instead", () => {
    const rest = openDialog({ appearance: "light" });
    expect(computed(rest.backdrop, "backdrop-filter")).toMatch(/blur\(/);
    const high = openDialog({ appearance: "light", contrast: "high" });
    // `--scrim-filter: initial` is guaranteed-invalid, so the consuming var()'s fallback
    // resolves AT THE ELEMENT and the backdrop simply stops filtering (§24).
    expect(computed(high.backdrop, "backdrop-filter")).toBe("none");
    expect(alphaOf(computed(high.backdrop, "background-color"))).toBeGreaterThan(
      alphaOf(computed(rest.backdrop, "background-color")),
    );
  });

  it("is not a surface: no fill of its own, no border, no radius", () => {
    // The scrim is the one part of this component that is neither a surface nor a control,
    // and the law is here because the cheapest wrong fix for any backdrop question would be
    // to give it the surface class and inherit machinery it must not have.
    const { backdrop } = openDialog({ depth: "elevated" });
    expect(backdrop.classList.contains("kui-surface")).toBe(false);
    const cs = getComputedStyle(backdrop);
    expect(parseFloat(cs.borderTopWidth)).toBe(0);
    expect(parseFloat(cs.borderTopLeftRadius)).toBe(0);
    expect(cs.boxShadow).toBe("none");
  });
});

/* ── The box (§24) ────────────────────────────────────────────────────────────────────── */

describe("the panel's box", () => {
  it("wears the overlay corner at every size — rounder than the card of that size", () => {
    for (const size of SIZES) {
      for (const radius of ["small", "medium", "large", "full"] as const) {
        const { popup } = openDialog({ radius }, { size });
        const overlay = tokenOn(popup, `--radius-overlay-${size}`);
        const surface = tokenOn(popup, `--radius-surface-${size}`);
        // Lab port 2026-08-17: under `@supports (corner-shape: squircle)` every surface
        // DRAWS its authored corner × --kui-corner-k (1.613 — the lab's 0.62 inverted), so
        // the band token alone is one factor short of the painted number. Probe-derived
        // through the same token and knob the surface rule reads: a non-squircle engine
        // resolves the knob's fallback of 1 and this law holds unchanged.
        const drawn = probeIn(
          popup,
          (el) => (el.style.borderRadius = `calc(var(--radius-overlay-${size}) * var(--kui-corner-k, 1))`),
          (s) => s.borderTopLeftRadius,
        );
        expect(computed(popup, "border-top-left-radius"), `size ${size} @ ${radius}`).toBe(drawn);
        // The band leans one step up the surface band, which is what makes "an overlay is not
        // a card" true in pixels rather than in prose (§6's Card amendment, one band over).
        expect(parseFloat(overlay), `size ${size} @ ${radius}`).toBeGreaterThan(parseFloat(surface));
      }
    }
  });

  it("squares at radius=none, the kill switch — the overlay band is not an exception", () => {
    for (const size of SIZES) {
      const { popup } = openDialog({ radius: "none" }, { size });
      expect(parseFloat(computed(popup, "border-top-left-radius"))).toBe(0);
    }
  });

  it("takes its padding from the SURFACE size join, not from a restated value", () => {
    // Membership is worn, not copied: the popup carries `kui-surface` and `data-size`, so the
    // padding arrives from the same join a Card's does. Asserted as an equality against the
    // token the join picks — a dialog.css that restated a number would pass a "has padding"
    // law and fail this one.
    for (const size of SIZES) {
      const { popup } = openDialog({}, { size });
      // ONE SIZE UP since 2026-08-17 (Kushagra: "dialog seems to have less padding than it
      // should"), and the step is the whole overlay family's now — it used to live on the
      // alert's own arms, where the reasoning was never alert-specific: an overlay wears the
      // corner of the card one size up, and a bigger curve wants a bigger inset or the words
      // crowd the sweep. Size 4 holds at the top pick, exactly as the corner band's does.
      const up = size === "4" ? "4" : String(Number(size) + 1);
      expect(computed(popup, "padding-top")).toBe(tokenOn(popup, `--surface-p-${up}`));
    }
  });

  it("is as wide as its size allows, and the WINDOW wins when there is less room", () => {
    for (const size of SIZES) {
      const { popup, viewport } = openDialog({}, { size });
      const max = parseFloat(tokenOn(popup, `--overlay-w-${size}`));
      expect(popup.getBoundingClientRect().width).toBeCloseTo(max, 1);
      // Now take the room away. The viewport is what holds the gutter, so squeezing it is the
      // narrow-window case exactly: the panel must give up its designed width rather than
      // overflow, which is the whole reason the width is a MAXIMUM and not a width.
      const inset = parseFloat(computed(viewport, "padding-left"));
      viewport.style.width = "300px";
      // The room READ OFF THE BOX, not rebuilt from the number that was written: the viewport
      // is content-box, so `width: 300px` is not the outer 300 an arithmetic law would assume
      // — which is exactly the shape of mistake the audits keep finding in laws that
      // reconstruct their own subject.
      const room = viewport.clientWidth - 2 * inset;
      expect(room).toBeLessThan(max);
      expect(popup.getBoundingClientRect().width).toBeCloseTo(room, 1);
      viewport.style.removeProperty("width");
    }
  });

  it("keeps its window gutter through the layout-space layer, so density reaches it", () => {
    const loose = openDialog({ density: "comfortable" });
    const tight = openDialog({ density: "compact" });
    const gutterOf = (v: HTMLElement) => parseFloat(computed(v, "padding-left"));
    expect(gutterOf(loose.viewport)).toBe(parseFloat(tokenOn(loose.viewport, "--dialog-inset")));
    expect(gutterOf(tight.viewport)).toBeLessThan(gutterOf(loose.viewport));
  });

  it("centres by auto margins, so a panel taller than the window is still reachable", () => {
    // `align-items: center` on a scroll container overflows equally in both directions and the
    // top becomes unreachable — the container cannot scroll to it. Auto margins distribute only
    // the space that exists. Measured rather than read off the declaration: a tall panel's top
    // edge must land inside the viewport's own box.
    const tall = <div style={{ blockSize: "4000px" }} />;
    const { popup, viewport } = openDialog({}, { body: tall });
    const panel = popup.getBoundingClientRect();
    const room = viewport.getBoundingClientRect();
    expect(panel.top).toBeGreaterThanOrEqual(room.top);
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
  });
});

/* ── Separation: the scrim, never a floating cast (§10, §24) ──────────────────────────── */

/**
 * A SHADOW token as the scope resolves it (2026-08-26). The harness's `tokenOn` probes through
 * `width`, which is the right channel for a length and a silent no-op for a shadow list: an
 * empty absolutely-positioned div given `width: var(--floating-chrome-elevated)` rejects the
 * declaration and computes `0px`, so `expect(box-shadow).not.toBe(tokenOn(…))` compared a
 * shadow string against `0px` and could not fail however the popup was re-pointed. Read
 * through the property the value is FOR.
 */
const shadowOn = (scope: Element, expr: string): string =>
  probeIn(scope, (el) => (el.style.boxShadow = expr), (s) => s.boxShadow);

/** The whole list a FLOATING pane computes in a given world — the pane's own pool, then the
    floating chrome. The surface layer always paints two layers (`var(--kui-sf-pool, …),
    var(--kui-sf-cast, …)`), so a single-token comparison is a category error: no popup's
    `box-shadow` can ever equal one chrome value, which is the second reason the pair below
    could not fail. The pool term resolves identically on the probe and on the popup, because
    `--kui-sf-pool` is registered `inherits: false` and neither a solid popup nor a probe
    declares it. */
const floatingList = (scope: Element, depth: string): string =>
  shadowOn(
    scope,
    `var(--kui-sf-pool, var(--material-pool-solid, 0 0 0 0 transparent)), var(--floating-chrome-${depth})`,
  );

describe("a dialog does not float", () => {
  it("is not a floating pane and never casts the floating chrome", () => {
    for (const depth of DEPTHS) {
      const { popup } = openDialog({ depth });
      // The class carries the concentric corner join AND the floating cast; a dialog wants
      // neither, and this is the law that keeps a future "make it consistent with Menu" edit
      // from quietly re-pointing both.
      expect(popup.classList.contains("kui-floating")).toBe(false);
    }
    /**
     * The CAST half is asked in the elevated world only, and the restriction is the claim
     * rather than a convenience. Since 2026-08-19 flat's floating chrome IS the no-op layer —
     * nothing casts in flat, popups included — so in that world a dialog wearing the floating
     * cast and a dialog wearing the surface cast compute the identical list, and "it is not
     * the floating one" is not a distinguishable statement. Measured: both sides come out
     * `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`.
     */
    const { popup } = openDialog({ depth: "elevated" });
    const floating = floatingList(popup, "elevated");
    // THE PREMISE, and the one the old spelling was missing twice over: the comparison must be
    // against a value that is REACHABLE. A dialog re-pointed at `--kui-floating-chrome`
    // computes exactly this list — pool then chrome — so that is what "not the floating cast"
    // has to mean. The old form compared a two-layer list against a single token resolved
    // through `width`, which answers `0px`: two reasons it could not fail, stacked.
    expect(floating, "the floating chrome resolved to nothing").not.toBe("none");
    expect(computed(popup, "box-shadow")).not.toBe(floating);
  });

  it("casts exactly what a CARD casts in the same world — never more, never less", () => {
    // The positive half, and the one that says what a dialog IS: paper, lifted by the app's
    // own identity rather than by a fact about itself. A menu in the same flat world casts;
    // this must not, because coverage is already stated by the scrim.
    for (const depth of DEPTHS) {
      const { popup } = openDialog({ depth });
      let card: HTMLElement | null = null;
      render(
        <Theme depth={depth}>
          <Card ref={(n: HTMLDivElement | null) => void (card = n)} size="3">
            paper
          </Card>
        </Theme>,
      );
      expect(computed(popup, "box-shadow")).toBe(computed(card as unknown as HTMLElement, "box-shadow"));
    }
    /**
     * And the negative control the pair needs, MOVED into the elevated world (2026-08-26).
     *
     * It used to mount the menu under `depth="flat"` and assert its shadow was not the string
     * `none`, commented "in a FLAT world a menu still states its coverage". That stopped being
     * true on 2026-08-19 — flat's floating chrome is the no-op layer, nothing casts in flat
     * including popups — and the assertion could not fail either way, because a stood-down
     * cast computes `rgba(0, 0, 0, 0) 0px 0px 0px 0px` and never the keyword. So the whole
     * pair above could have gone green with nothing in the document casting anything.
     *
     * Elevated is where casts are real AND ranked, so the control says both things at once:
     * something in this world genuinely casts, and what a dialog casts is specifically a
     * CARD's rather than whatever every pane happens to share.
     */
    render(
      <Theme depth="elevated">
        <Menu defaultOpen>
          <MenuTrigger render={<Button>open</Button>} />
          <MenuContent>
            <MenuItem>Row</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    settleAll();
    const menus = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
    const menu = menus[menus.length - 1]!;
    const menuCast = computed(menu, "box-shadow");
    const noop = document.createElement("div");
    noop.style.boxShadow = "0 0 0 0 transparent";
    menu.append(noop);
    expect(menuCast, "nothing casts in this world, so the law above measured nothing").not.toBe(
      computed(noop, "box-shadow"),
    );
    noop.remove();
    const { popup: lifted } = openDialog({ depth: "elevated" });
    expect(
      computed(lifted, "box-shadow"),
      "a dialog and a menu cast the same thing, so 'exactly a card' says nothing",
    ).not.toBe(menuCast);
  });

  it("still answers `material` — the panel is glass, the scrim is unchanged", () => {
    // Kushagra, 2026-08-10: no cast, but material must be respected. Membership delivers it —
    // the surface layer's own rules — and this asserts the panel actually reached them.
    const { popup, backdrop } = openDialog({ appearance: "light" }, { material: "regular" });
    // The declared chain, with the lens stripped: a displacement map is built for one box, so
    // its filter id is per-pane and cannot be compared against a token (§10, 2026-08-16). The
    // lens is asserted as its own fact rather than folded into this one.
    expect(computed(popup, "backdrop-filter").replace(/url\("[^"]*"\)\s*/, "")).toBe(
      filterOn(popup, "--material-regular-filter"),
    );
    expect(computed(popup, "backdrop-filter"), "a glass panel wears the lens").toMatch(/^url\(/);
    expect(alphaOf(computed(popup, "background-color"))).toBeLessThan(1);
    // The dim behind it is the APP's, not the pane's, so it does not move with the material.
    const solid = openDialog({ appearance: "light" });
    expect(computed(backdrop, "background-color")).toBe(computed(solid.backdrop, "background-color"));
  });
});

/* ── The one anatomy something non-visual forces (§10) ────────────────────────────────── */

describe("title and description", () => {
  it("name and describe the panel, wired to the elements that carry them", () => {
    const { popup } = openDialog({});
    const labelledBy = popup.getAttribute("aria-labelledby");
    const describedBy = popup.getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    const title = document.getElementById(labelledBy!);
    const description = document.getElementById(describedBy!);
    expect(title?.textContent).toBe("Delete workspace");
    expect(description?.textContent).toBe("This cannot be undone.");
    // The title is a real heading element, not a styled div: the outline level is the reason
    // this part exists at all.
    expect(title?.tagName).toBe("H2");
  });

  it("wears the type layer's own steps — the same Heading and Text a composition would use", () => {
    const { popup } = openDialog({});
    const labelledBy = popup.getAttribute("aria-labelledby")!;
    const describedBy = popup.getAttribute("aria-describedby")!;
    let heading: HTMLElement | null = null;
    let text: HTMLElement | null = null;
    render(
      <Theme>
        <Heading ref={(n: HTMLHeadingElement | null) => void (heading = n)} size="6">
          Delete workspace
        </Heading>
        <Text ref={(n: HTMLSpanElement | null) => void (text = n)} emphasis="medium">
          This cannot be undone.
        </Text>
      </Theme>,
    );
    const typeFacts = (el: HTMLElement) => {
      const cs = getComputedStyle(el);
      return { size: cs.fontSize, line: cs.lineHeight, weight: cs.fontWeight, family: cs.fontFamily, color: cs.color, margin: cs.marginTop };
    };
    // An equality against the components themselves, not against numbers: the parts must not
    // be able to drift from the type layer, and a number here would let them.
    expect(typeFacts(document.getElementById(labelledBy)!)).toEqual(typeFacts(heading as unknown as HTMLElement));
    expect(typeFacts(document.getElementById(describedBy)!)).toEqual(typeFacts(text as unknown as HTMLElement));
    // And the description is the MUTED ink — a description supports the title (§15).
    expect(computed(document.getElementById(describedBy)!, "color")).toBe(
      colorOn(popup, "var(--color-text-muted)"),
    );
  });

  it("dismisses from a button the call site placed — there is no system ✕", () => {
    let closed = 0;
    render(
      <Theme>
        <Dialog defaultOpen onOpenChange={(open) => void (open ? null : closed++)}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogClose render={<Button>Cancel</Button>} />
          </DialogContent>
        </Dialog>
      </Theme>,
    );
    const popups = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
    const popup = popups[popups.length - 1]!;
    // The panel draws no dismissing glyph of its own (Card's anatomy refusal, §10) — what it
    // has is exactly what the caller wrote, and that button is a real Kookie Button.
    const buttons = popup.querySelectorAll("button");
    expect(buttons.length).toBe(1);
    expect(buttons[0]!.classList.contains("kui-button")).toBe(true);
    buttons[0]!.click();
    expect(closed).toBe(1);
  });

  it("a trigger that renders a Kookie Button stays a real button (§5)", async () => {
    render(
      <Theme>
        <Dialog>
          <DialogTrigger render={<Button>Open</Button>} />
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      </Theme>,
    );
    const trigger = document.querySelector<HTMLElement>(".kui-button")!;
    expect(trigger.tagName).toBe("BUTTON");
    // Base UI branches its whole a11y contract on `nativeButton`: unforwarded, a component
    // render target answers false and the trigger takes the div contract (Menu's own 2026-08-09
    // finding, restated here because this component repeats the inference).
    expect(trigger.getAttribute("role")).toBeNull();
    // A real press, not `.click()`: the open is React state, and a synchronous DOM click leaves
    // the assertion running before the commit that would mount the panel.
    await userEvent.click(trigger);
    // A STATE, not the statement after the gesture (2026-08-21, the sweep after CI's
    // "the click must have opened it"): a driver gesture resolving is not the browser
    // having settled what the gesture causes. If it never settles, the deadline expires
    // into the same assertion, with the same value in the message.
    await until(() => document.querySelectorAll(".kui-dialog-popup").length === 1, 3000);
    expect(document.querySelectorAll(".kui-dialog-popup").length).toBe(1);
  });
});

describe("what the index prices, and what it leaves alone (§24)", () => {
  it("the two OWNED parts move with size; type the call site wrote does not", () => {
    /**
     * Three shipped homes said "it never sets the type inside" — the axis comment, the
     * published `size` doc and the component reference — and all three had been false since
     * 2026-08-21, when the title and description took the owned step map so that a dialog and
     * an alert at one index are one typography. §24's line is OWNERSHIP, not "no type": the
     * system sizes its own words and never the caller's.
     *
     * Read as the PAINTED font size at two indexes rather than as the step map's own numbers,
     * because a law that re-derives `OWNED_TITLE_STEP[size]` is a law about the author's
     * arithmetic; and at two indexes rather than one, because one index cannot tell "it moves"
     * from "it is pinned" (the composer's own 2026-08-23 lesson, twice in one day).
     */
    const fontOf = (id: string | null) => computed(document.getElementById(id!)!, "font-size");
    const small = openDialog({}, { size: "1" });
    const large = openDialog({}, { size: "4" });
    const titleOf = (d: { popup: HTMLElement }) => fontOf(d.popup.getAttribute("aria-labelledby"));
    const descOf = (d: { popup: HTMLElement }) => fontOf(d.popup.getAttribute("aria-describedby"));
    expect(parseFloat(titleOf(large)), "the title does not answer the index").toBeGreaterThan(
      parseFloat(titleOf(small)),
    );
    expect(parseFloat(descOf(large)), "the description does not answer the index").toBeGreaterThan(
      parseFloat(descOf(small)),
    );

    // And the other half, which is the half the deleted sentence was reaching for: a Text the
    // CALL SITE placed keeps its own step at every index. Without this the law above would
    // equally describe a dialog that sizes everything it contains.
    const own = (size: Size) => {
      const { popup } = openDialog(
        {},
        {
          size,
          body: (
            <Text size="3" data-testid="mine">
              mine
            </Text>
          ),
        },
      );
      return computed(popup.querySelector<HTMLElement>('[data-testid="mine"]')!, "font-size");
    };
    expect(own("4"), "the index reached type the call site wrote").toBe(own("1"));
  });
});

describe("the panel comes into focus, not into view (§24)", () => {
  const curveOn = (el: HTMLElement, name: string) => getComputedStyle(el).getPropertyValue(name).trim();
  const samples = (curve: string) =>
    curve
      .slice(curve.indexOf("(") + 1, curve.lastIndexOf(")"))
      .split(",")
      .map((stop) => stop.trim().split(/\s+/)[0]!);
  const tokenPx = (el: HTMLElement, name: string) => parseFloat(getComputedStyle(el).getPropertyValue(name));

  /** Open by CLICK — the path Base UI transitions — and hand back the arriving popup. */
  async function openByClick() {
    render(
      <Theme>
        <Dialog>
          <DialogTrigger render={<Button>Open</Button>} />
          <DialogContent>
            <DialogTitle>Delete workspace</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogContent>
        </Dialog>
      </Theme>,
    );
    inMotion();
    await userEvent.click(document.querySelector<HTMLElement>(".kui-button")!);
    await until(() => !!document.querySelector(".kui-dialog-popup"));
    const popup = document.querySelector<HTMLElement>(".kui-dialog-popup");
    if (!popup) throw new Error("the panel never mounted");
    return popup;
  }

  const channels = (el: HTMLElement) =>
    computed(el, "transition-property")
      .split(",")
      .map((p) => p.trim());

  it("starts a step back in DEPTH with its content out of focus, and travels nowhere", async () => {
    const popup = await openByClick();
    const body = popup.querySelector<HTMLElement>(".kui-dialog-body")!;
    // Base UI's starting stamp is the pose, and it lives one frame — read it by hand so the
    // claim is about the values rather than about catching the frame.
    popup.setAttribute("data-starting-style", "");
    popup.style.setProperty("transition", "none", "important");
    body.style.setProperty("transition", "none", "important");

    // DEPTH: a scale, and the one config states.
    expect(parseFloat(computed(popup, "scale"))).toBeCloseTo(
      parseFloat(getComputedStyle(popup).getPropertyValue("--dialog-depth")),
      3,
    );
    // NOT DISTANCE: the panel does not travel, in either axis. This is the whole split from
    // the alert's materialization, and it is asserted as an absence because that is what it is.
    expect(["none", "0px", "0px 0px"], "a summoned surface has nowhere to travel from").toContain(
      computed(popup, "translate"),
    );
    expect(computed(popup, "opacity"), "presence is paint").toBe("0");
    // And the content is out of focus by exactly the designed distance — sharing the plane's
    // arrival, because depth of field is a property of the mass.
    expect(computed(body, "filter")).toBe(`blur(${tokenPx(popup, "--dialog-blur")}px)`);
  });

  it("moves no size channel at all — the absence IS the design", async () => {
    const popup = await openByClick();
    const listed = channels(popup);
    // The materialization animates the BOX (block-size, inline-size, border-radius, padding,
    // translate) because an alert arrives. A dialog does not, and if any of these ever appear
    // here the split has quietly been undone — which would not show up in any law about what
    // the entry DOES.
    for (const forbidden of [
      "block-size",
      "inline-size",
      "width",
      "height",
      "padding",
      "border-radius",
      "border-top-left-radius",
      "translate",
    ]) {
      expect(listed, `${forbidden} is the alert's gesture, not this one`).not.toContain(forbidden);
    }
    // Vacuity guard: the law must be reading a real list, not an empty one.
    expect(listed).toContain("scale");
    expect(listed).toContain("opacity");
  });

  it("rides the heavy plane's spring: one slight crossing, never a bounce", async () => {
    const popup = await openByClick();
    const listed = channels(popup);
    const easings = computed(popup, "transition-timing-function").split(/,(?![^(]*\))/);
    const poised = curveOn(popup, "--motion-spring-poised");
    expect(samples(easings[listed.indexOf("scale")]!.trim()), "geometry is physics").toEqual(
      samples(poised),
    );
    // Read off the CURVE, not off its name: mass forbids overshoot, so the arrival crosses its
    // target once and barely — the whole of damping's allowance spent on the approach.
    const values = samples(poised).map(Number);
    expect(Math.max(...values), "a heavy plane does not bounce").toBeLessThan(1.03);
    expect(Math.max(...values), "but it is alive — it does cross").toBeGreaterThan(1);
    // Paint is signal: the fade eases and never springs.
    expect(easings[listed.indexOf("opacity")]!, "presence eases").not.toContain("linear(");
  });

  it("two clocks, one mass: the content focuses WITH the box, and is never printed", async () => {
    const popup = await openByClick();
    const body = popup.querySelector<HTMLElement>(".kui-dialog-body")!;
    const listed = channels(popup);
    const durations = computed(popup, "transition-duration").split(",").map((d) => parseFloat(d) * 1000);
    const settle = parseFloat(getComputedStyle(popup).getPropertyValue("--dialog-settle"));
    const reveal = parseFloat(getComputedStyle(popup).getPropertyValue("--dialog-reveal"));
    expect(durations[listed.indexOf("scale")]).toBeCloseTo(settle, 0);
    expect(durations[listed.indexOf("opacity")]).toBeCloseTo(reveal, 0);

    // The content is part of the mass, so it takes the BOX's clock, not a print clock.
    expect(parseFloat(computed(body, "transition-duration")) * 1000).toBeCloseTo(settle, 0);
    // And it is NOT printed: one channel, and it is focus. A dialog's content is the
    // consumer's — the system may not animate an arrangement it does not own.
    expect(channels(body), "blur is the only thing the system may honestly do here").toEqual([
      "filter",
    ]);
    expect(computed(body, "transition-delay"), "and it arrives with the box, not after it")
      .toBe("0s");
  });

  it("the exit dissolves, and a dismissal mid-arrival RETARGETS rather than snapping", async () => {
    const popup = await openByClick();
    popup.setAttribute("data-ending-style", "");
    const listed = channels(popup);
    // `scale` stays listed, which is what lets a running arrival be retargeted instead of
    // cancelled — dropping a property from the list kills its transition mid-flight.
    expect(listed, "the arrival's own channel survives the dismissal").toContain("scale");
    const easings = computed(popup, "transition-timing-function").split(/,(?![^(]*\))/);
    expect(samples(easings[listed.indexOf("scale")]!.trim())).toEqual(
      samples(curveOn(popup, "--motion-spring-stiff")),
    );
    popup.style.setProperty("transition", "none", "important");
    expect(computed(popup, "opacity")).toBe("0");
    // Settling back a hair, not retracing the arrival: leaving answers nothing.
    expect(computed(popup, "scale")).toBe("0.99");
  });

  it("suppression is total: under reduced motion the panel is simply there (§8)", async () => {
    await asksForStillness();
    const popup = await openByClick();
    const body = popup.querySelector<HTMLElement>(".kui-dialog-body")!;
    for (const el of [popup, body]) {
      expect(
        computed(el, "transition-duration").split(",").every((d) => parseFloat(d) === 0),
        "no clock survives",
      ).toBe(true);
    }
    // And the pose itself is stood down, which here is reachable in a way it is not for the
    // alert: Base UI stamps the starting style regardless of what the user asked their OS for.
    popup.setAttribute("data-starting-style", "");
    expect(computed(popup, "opacity")).toBe("1");
    expect(["none", "1"]).toContain(computed(popup, "scale"));
    expect(computed(body, "filter"), "and its content is legible").toBe("none");
  });

  it("suppression does not MOVE the panel — at either stamp (§8, §24)", async () => {
    /**
     * The guard used to declare `margin: 0` (2026-08-22 audit), and it stood down nothing: the
     * only auto margins in the poses are `margin-inline: auto` on the BODY elements, which the
     * guard's popup selectors never reach. What it did reach is the `margin: auto` that CENTRES
     * this panel inside Base UI's scrollable viewport — one specificity step against four — and
     * losing a cross-axis auto margin releases the stretch with it. Measured: a dialog open at
     * `360,351 560x98` became `24,24 560x752` at full opacity the frame the ending stamp landed,
     * and the exit's own clock (which the guard also failed to reach, one attribute heavier) held
     * it there for ~130ms. The setting that exists to remove motion produced the largest
     * movement in the family.
     *
     * The law that stood here read `opacity`, `scale` and the body's `filter`. The guard writes
     * five properties; three were read, and the two that were not are the two that were wrong.
     * So this one reads the BOX, which is the only thing "nothing moves" can mean, at BOTH
     * stamps — the entry's and the exit's — because the defect was on the arm nobody looked at.
     */
    await asksForStillness();
    const popup = await openByClick();
    const centred = popup.getBoundingClientRect();
    // The premise: this panel is genuinely centred, so an un-centring has somewhere to move TO.
    // Against a panel already at the viewport's edge the assertion below would hold either way.
    expect(centred.left, "the fixture's panel must be centred to catch an un-centring").toBeGreaterThan(40);
    expect(centred.height, "and short enough that a stretch would show").toBeLessThan(window.innerHeight / 2);

    for (const stamp of ["data-starting-style", "data-ending-style"] as const) {
      popup.setAttribute(stamp, "");
      const box = popup.getBoundingClientRect();
      expect(box.left, `${stamp} moved the panel sideways`).toBeCloseTo(centred.left, 0);
      expect(box.top, `${stamp} moved the panel down the page`).toBeCloseTo(centred.top, 0);
      expect(box.height, `${stamp} stretched the panel`).toBeCloseTo(centred.height, 0);
      expect(
        computed(popup, "transition-duration").split(",").every((d) => parseFloat(d) === 0),
        `${stamp} kept a clock, so whatever it moved stays on screen`,
      ).toBe(true);
      popup.removeAttribute(stamp);
    }
  });
});

/* ── A scroll region inside the panel (§3, §10, 2026-08-21) ───────────────────────────── */

describe("a scroll region inside the panel", () => {
  const list = (
    <Box>
      {Array.from({ length: 24 }, (_, i) => (
        <Box key={i} data-row={i} height="2rem">Row {i + 1}</Box>
      ))}
    </Box>
  );

  /** An open dialog holding title / scroller / action, sized by the call site. */
  function scrolling(style: React.CSSProperties) {
    render(
      <Theme>
        <Dialog defaultOpen size="3">
          <DialogContent style={style}>
            <DialogTitle>Pick a thing</DialogTitle>
            <ScrollArea>{list}</ScrollArea>
            <DialogClose render={<Button />}>Save</DialogClose>
          </DialogContent>
        </Dialog>
      </Theme>,
    );
    settleAll();
    const popups = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
    const popup = popups[popups.length - 1];
    if (!popup) throw new Error("the panel never mounted");
    const vp = popup.querySelector<HTMLElement>(".kui-scroll-viewport");
    if (!vp) throw new Error("the scroller never mounted");
    return { popup, vp, save: popup.querySelector<HTMLElement>("button")! };
  }

  it("scrolls, and the control below the list stays inside the panel", () => {
    // Measured broken 2026-08-21, under BOTH spellings — a 400px panel holding a 1440px
    // viewport that was never a scroll container, with the Save button at y=1705 and
    // `overflow: clip` removing it from the page. The cause is one box: `.kui-dialog-body`
    // exists only so the entry can blur the content (§24) and it stands between the pane and
    // the caller's children, so every rule in the surface layer's scroll block — each of
    // which asks about a DIRECT child — stopped at it.
    for (const [name, style] of [
      ["height", { height: "25rem" }],
      ["max-height", { maxHeight: "60dvh" }],
    ] as const) {
      const { popup, vp, save } = scrolling(style);
      expect(vp.scrollHeight, `${name}: the content must overflow, or this proves nothing`)
        .toBeGreaterThan(vp.clientHeight);
      const p = popup.getBoundingClientRect();
      expect(vp.getBoundingClientRect().height, `${name}: the viewport takes the room that is left`)
        .toBeLessThan(p.height);
      expect(save.getBoundingClientRect().bottom, `${name}: the action is inside its own panel`)
        .toBeLessThanOrEqual(p.bottom + 0.5);
    }
  });

  it("reaches the panel's inline edges, and the rows keep the panel's own inset", () => {
    // The bleed half — the pane rule reaching through the body. Inline only: this scroller has
    // a title above it and an action below it, so it touches neither block edge and takes
    // neither, which is the same DOM question a Card asks.
    const { popup, vp } = scrolling({ height: "25rem" });
    const p = popup.getBoundingClientRect();
    const v = vp.getBoundingClientRect();
    const b = parseFloat(computed(popup, "border-left-width"));
    expect(v.left - p.left - b, "the scroller runs to the panel's left edge").toBeCloseTo(0, 1);
    expect(p.right - v.right - b, "…and its right").toBeCloseTo(0, 1);
    const pad = parseFloat(computed(popup, "padding-left"));
    expect(pad, "the panel must have padding to move").toBeGreaterThan(0);
    expect(parseFloat(computed(vp, "padding-left")), "which moved inside the viewport").toBeCloseTo(pad, 1);
    const first = popup.querySelector<HTMLElement>("[data-row='0']")!.getBoundingClientRect();
    expect(first.left - p.left - b, "so the rows still sit in from the edge").toBeCloseTo(pad, 1);
    // The block edges are the neighbours', and reclaiming one would have eaten the gap.
    expect(v.top - p.top - b, "a scroller with a title above it does not reach the top").toBeGreaterThan(10);
  });

  it("a dialog with no scroller is untouched — the body is still a plain block", () => {
    // The scope, and the negative control the repair is worth nothing without: the body
    // becomes a column only when it holds a scroller, because the one input where a block and
    // a flex column disagree is loose inline content directly inside DialogContent, which a
    // column would shatter into stacked runs (the card-as-link defect, one component over).
    const { popup } = openDialog({});
    const body = popup.querySelector<HTMLElement>(".kui-dialog-body");
    if (!body) throw new Error("the body never mounted");
    expect(computed(body, "display"), "no scroller, no column").toBe("block");
    expect(computed(popup, "display"), "and the panel is the block it has always been").toBe("block");
  });
});


/* ── The panel's own props, its name, and why it closed (2026-08-21, the audit) ────────── */

describe("what the call site can say to a dialog", () => {
  const lastPopup = () => {
    const ps = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
    const p = ps[ps.length - 1];
    if (!p) throw new Error("the panel never mounted — every law below would assert nothing");
    return p;
  };

  /** Warnings raised while `run` executes, filtered to the one being asked about. */
  /**
   * SEIZED, NOT RACED (2026-08-21). Both warnings are deliberately post-paint — the name
   * arrives when the Title child registers, and the clip check runs in an effect — so reading
   * at the statement after the mount measures nothing and passes whatever the code does. The
   * first spelling answered that with `await setTimeout(60)`, which is a WINDOW: it held on a
   * quiet machine and failed on CI, where the frame had not run inside 60ms and the arm that
   * must warn counted zero. That is the 2026-08-20 rule (*a premise that is a window is
   * seized or edge-anchored, never raced*) walked into one day after it was written.
   *
   * `want` is what makes it seizable. Expecting a warning, this returns the moment one
   * arrives, so no bound can be too short. Expecting silence, it waits the whole deadline
   * before answering — the fair direction, and the one where a late warning would be a real
   * defect rather than a slow machine.
   */
  async function warnings(needle: string, want: number, run: () => void): Promise<number> {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const count = () =>
      spy.mock.calls.map((c) => String(c[0])).filter((m) => m.includes(needle)).length;
    try {
      run();
      settleAll();
      const deadline = 2000;
      for (let waited = 0; waited < deadline; waited += 16) {
        if (want > 0 && count() >= want) break;
        await new Promise((r) => setTimeout(r, 16));
      }
      return count();
    } finally {
      spy.mockRestore();
    }
  }

  it("ordinary props reach the panel — and the system's identity still wins", () => {
    // Measured broken 2026-08-21: `DialogContent` declared four props and dropped every other
    // one in silence, so `id`, `aria-label`, `data-*` and event handlers all type-checked and
    // vanished. That is the Select audit's blocked-`id` finding in a third home, and here it
    // also took away the only repair for a dialog with no title.
    render(
      <Theme>
        <Dialog defaultOpen>
          {/* `data-size` is the system's own stamp, and the call site must not be able to take
              it: the props are spread BEFORE the identity, so a hostile value loses. */}
          <DialogContent aria-label="Rename" id="rename-panel" data-testid="panel" data-size="1">
            <Text>Body</Text>
          </DialogContent>
        </Dialog>
      </Theme>,
    );
    settleAll();
    const p = lastPopup();
    expect(p.getAttribute("aria-label"), "aria-label reaches the element").toBe("Rename");
    expect(p.id, "so does id — what a `label for` needs, and every other component takes").toBe("rename-panel");
    expect(p.getAttribute("data-testid"), "and arbitrary data attributes").toBe("panel");
    expect(p.getAttribute("data-size"), "but the size index stays the system's").toBe("3");
  });

  it("a dialog with no name says so in dev — and a title or a label silences it", async () => {
    // The defect this exists for: `role="dialog"` with no `aria-labelledby` and no
    // `aria-label`, which a screen reader announces as "dialog" and nothing else. Measured,
    // with no warning anywhere. All three arms, because a warning that never stops is worse
    // than none — a law that only mounted the failing case could not tell the two apart.
    const bare = await warnings("accessible name", 1, () =>
      render(
        <Theme>
          <Dialog defaultOpen>
            <DialogContent><Text>No title</Text></DialogContent>
          </Dialog>
        </Theme>,
      ),
    );
    expect(bare, "no title and no label — warn once").toBe(1);

    const titled = await warnings("accessible name", 0, () =>
      render(
        <Theme>
          <Dialog defaultOpen>
            <DialogContent><DialogTitle>Named</DialogTitle></DialogContent>
          </Dialog>
        </Theme>,
      ),
    );
    expect(titled, "a title names it — silence").toBe(0);

    const labelled = await warnings("accessible name", 0, () =>
      render(
        <Theme>
          <Dialog defaultOpen>
            <DialogContent aria-label="Named"><Text>x</Text></DialogContent>
          </Dialog>
        </Theme>,
      ),
    );
    expect(labelled, "an explicit label names it too — silence").toBe(0);
  });

  it("says WHY it is closing, and a dialog may refuse", async () => {
    // Without this a dialog is told that it closed and never why, so the guard every form
    // dialog owes — "you have unsaved changes" — could not be written (measured 2026-08-21).
    //
    // The reasons are provoked, never asserted from a table: they are Base UI's own strings
    // kept as this package's union, so a rename upstream is exactly the failure this must
    // catch, and only a real Escape and a real press can catch it.
    const seen: string[] = [];
    render(
      <Theme>
        <Dialog
          defaultOpen
          onOpenChange={(open: boolean, details: OverlayOpenChangeDetails) => {
            seen.push(`${open}:${details.reason}`);
            if (details.reason === "escape-key") details.cancel();
          }}
        >
          <DialogContent>
            <DialogTitle>Unsaved</DialogTitle>
            <DialogClose render={<Button />}>Discard</DialogClose>
          </DialogContent>
        </Dialog>
      </Theme>,
    );
    settleAll();

    await userEvent.keyboard("{Escape}");
    expect(seen[0], "Escape is reported as Escape").toBe("false:escape-key");
    expect(
      document.querySelectorAll(".kui-dialog-popup").length,
      "…and cancel() refused it: the panel is still there",
    ).toBeGreaterThan(0);

    const close = lastPopup().querySelector<HTMLElement>("button");
    if (!close) throw new Error("the close button never mounted");
    await userEvent.click(close);
    expect(seen[1], "a close button is a different reason").toBe("false:close-press");
    // UNMOUNTED is a STATE, not the statement after the click (2026-08-21, CI on main). A
    // popup that is not refused leaves on its exit's own clock — Base UI unmounts it when the
    // animations' `finished` promises settle — so reading the count here asserts the close is
    // INSTANTANEOUS, which is a claim about the machine. A close that is genuinely refused
    // never reaches zero and expires the deadline into the same assertion.
    await until(() => document.querySelectorAll(".kui-dialog-popup").length === 0, 3000);
    expect(
      document.querySelectorAll(".kui-dialog-popup").length,
      "…and that one was not refused",
    ).toBe(0);
  });

  it("warns when content is wider than the panel, because a pane clips it away", async () => {
    // A `<pre>` cannot wrap, so it overflows a panel that clips — and since the bleed shipped
    // (2026-08-20) that is a silent deletion rather than a visible spill: measured 952px of
    // content inside a 440px panel, no bar, no overflow, no error. There is no repair to make
    // — CSS resolves `overflow-x: auto` beside a clipped `overflow-y` to `hidden`, which is a
    // scroll container — so what ships is the warning that makes the ScrollArea findable.
    const clipped = await warnings("wider than it is", 1, () =>
      render(
        <Theme>
          <Dialog defaultOpen size="2">
            <DialogContent>
              <DialogTitle>Log</DialogTitle>
              <pre>{"const url = 'https://example.com/a/path/that/never/breaks/anywhere-at-all-ok'"}</pre>
            </DialogContent>
          </Dialog>
        </Theme>,
      ),
    );
    expect(clipped, "content that cannot wrap and cannot be reached").toBe(1);

    // The other half, and the one that makes this a law rather than a tripwire: ordinary prose
    // with an unbreakable word in it now WRAPS (type.css), so it must not warn.
    const prose = await warnings("wider than it is", 0, () =>
      render(
        <Theme>
          <Dialog defaultOpen size="2">
            <DialogContent>
              <DialogTitle>Share</DialogTitle>
              <Text>https://example.com/a/path/that/never/breaks/anywhere-at-all-whatsoever</Text>
            </DialogContent>
          </Dialog>
        </Theme>,
      ),
    );
    expect(prose, "a long word wraps, so there is nothing to warn about").toBe(0);
  });
});


/* ── A dialog presents as a SHEET on a narrow window (§18, §24 — 2026-08-21) ───────────── */

describe("on a narrow window a dialog is a sheet", () => {
  // The viewport is resized for real. A media query IS the mechanism here, and a law that
  // stubs the mechanism it is testing proves nothing (the type bands' own rule, §17).
  const PHONE = { width: 390, height: 844 };

  afterEach(async () => {
    await page.viewport(VIEWPORT.width, VIEWPORT.height);
  });

  const rows = Array.from({ length: 30 }, (_, i) => (
    <Box key={i} height="2rem">Row {i + 1}</Box>
  ));

  function openOn(children: React.ReactNode) {
    render(
      <Theme>
        <Dialog defaultOpen size="3">
          <DialogContent>{children}</DialogContent>
        </Dialog>
      </Theme>,
    );
    settleAll();
    const ps = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
    const p = ps[ps.length - 1];
    if (!p) throw new Error("the panel never mounted");
    return p;
  }

  it("takes the window's width and sits on its bottom edge", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const p = openOn(
      <>
        <DialogTitle>Rename</DialogTitle>
        <DialogDescription>Short.</DialogDescription>
      </>,
    );
    const r = p.getBoundingClientRect();
    expect(r.left, "no gutter — a sheet is the window's width").toBeCloseTo(0, 0);
    expect(r.width).toBeCloseTo(PHONE.width, 0);
    expect(window.innerHeight - r.bottom, "and it rests on the bottom edge").toBeCloseTo(0, 0);
    // A SHORT sheet is only as tall as its content — pinned, not stretched. Mounted with long
    // content below, because a law that only ever measures the capped case cannot tell a
    // pinned sheet from a full-height one.
    expect(r.height, "a short sheet stays short").toBeLessThan(PHONE.height / 2);
  });

  it("rounds its top corners only, and by the same arithmetic a card rounds by", async () => {
    // The bug this caught while it was being written: the surface layer's corner is
    // `calc(--kui-sf-radius * --kui-corner-k)` — the squircle multiplier lives in the
    // ARITHMETIC, not in the token — so a bare `var(--kui-sf-radius)` drew 48px where the
    // same panel one pixel wider paints 77.4. The law reads BOTH windows for that reason.
    await page.viewport(PHONE.width, PHONE.height);
    const sheet = openOn(<DialogTitle>Rename</DialogTitle>);
    const top = computed(sheet, "border-top-left-radius");
    expect(computed(sheet, "border-bottom-left-radius"), "the bottom edge is the screen's")
      .toBe("0px");
    expect(parseFloat(top), "the top is rounded").toBeGreaterThan(0);

    await page.viewport(VIEWPORT.width, VIEWPORT.height);
    const centred = openOn(<DialogTitle>Rename</DialogTitle>);
    expect(top, "and it is the corner this panel paints at any width").toBe(
      computed(centred, "border-top-left-radius"),
    );
  });

  it("stops one touch target short of the top, and scrolls rather than clipping", async () => {
    // Two claims that are really one: a sheet with no cap runs off the top of the screen with
    // no route back, and a capped pane whose content overflows DELETES it, because a pane
    // clips (§3, closed 2026-08-21 and walked into again by a rule written a day later).
    await page.viewport(PHONE.width, PHONE.height);
    const p = openOn(
      <>
        <DialogTitle>Pick</DialogTitle>
        {rows}
      </>,
    );
    const r = p.getBoundingClientRect();
    const reach = parseFloat(tokenOn(p, "--touch-target-min"));
    expect(reach, "the cap must be a real length").toBeGreaterThan(0);
    expect(r.top, "a strip of scrim stays tappable").toBeCloseTo(reach, 0);
    const body = p.querySelector<HTMLElement>(".kui-dialog-body");
    if (!body) throw new Error("the body never mounted");
    expect(body.scrollHeight, "the content must overflow, or this proves nothing")
      .toBeGreaterThan(body.clientHeight);
    expect(computed(body, "overflow-y"), "…and the reader can reach it").toBe("auto");
  });

  it("an ALERT on the same window stays centred — the exclusion is the design", async () => {
    // Every platform keeps an alert centred: it is a question that stops you, not a surface
    // you work on, and its fixed narrower width is already the phone-shaped answer. The
    // negative control, and without it "a dialog becomes a sheet" would pass just as well
    // written as "every overlay becomes a sheet".
    await page.viewport(PHONE.width, PHONE.height);
    render(
      <Theme>
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogTitle>Delete it?</AlertDialogTitle>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </Theme>,
    );
    settleAll();
    const ps = document.querySelectorAll<HTMLElement>(".kui-alert-popup");
    const alert = ps[ps.length - 1];
    if (!alert) throw new Error("the alert never mounted");
    const r = alert.getBoundingClientRect();
    expect(r.left, "it keeps its gutter").toBeGreaterThan(0);
    expect(window.innerHeight - r.bottom, "and it floats rather than resting on the edge")
      .toBeCloseTo(r.top, 0);
    expect(parseFloat(computed(alert, "border-bottom-left-radius")), "corners all round")
      .toBeGreaterThan(0);
  });

  it("a focused control's ring is not cut off — the scroll container pads it", async () => {
    // Kushagra, by eye on the sign-in sheet: "focus is being cut". The cause is a CSS
    // promotion nobody writes down: `overflow-y: auto` beside a `visible` inline axis resolves
    // that axis to `auto` too, so the body became a scroll container on BOTH axes — and a
    // scroll container clips at its own padding box. With the padding on the POPUP, the body's
    // box ended exactly where the field's did (measured 0px of clearance) and every ring
    // inside a sheet was sliced at both edges.
    //
    // The general rule is a day old and stated for panes: a clipping box must pad at least the
    // ring's reach. This is its second consumer.
    await page.viewport(PHONE.width, PHONE.height);
    render(
      <Theme>
        <Dialog defaultOpen size="3">
          <DialogContent>
            <DialogTitle>Sign in</DialogTitle>
            <TextField placeholder="you@company.com" aria-label="Email" />
          </DialogContent>
        </Dialog>
      </Theme>,
    );
    settleAll();
    const ps = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
    const p = ps[ps.length - 1];
    if (!p) throw new Error("the panel never mounted");
    const body = p.querySelector<HTMLElement>(".kui-dialog-body");
    const field = p.querySelector<HTMLElement>(".kui-field");
    const input = p.querySelector<HTMLInputElement>("input");
    if (!body || !field || !input) throw new Error("the field never mounted");
    input.focus();
    settleAll();

    // The ring's real reach, read off the browser rather than rebuilt from tokens.
    const reach =
      parseFloat(computed(field, "outline-width")) + parseFloat(computed(field, "outline-offset"));
    expect(reach, "the field must actually draw a ring, or this proves nothing")
      .toBeGreaterThan(0);
    const br = body.getBoundingClientRect();
    const fr = field.getBoundingClientRect();
    expect(fr.left - br.left, "room on the left for the ring to be painted in")
      .toBeGreaterThanOrEqual(reach);
    expect(br.right - fr.right, "…and on the right").toBeGreaterThanOrEqual(reach);
    // And the content is still inset from the PANEL by the pane's own padding: the fix moves
    // where the padding lives, it does not delete it.
    const pr = p.getBoundingClientRect();
    const pad = parseFloat(computed(body, "padding-left"));
    expect(pad, "the padding moved onto the body").toBeGreaterThan(0);
    expect(fr.left - pr.left, "so nothing moved on screen").toBeCloseTo(
      pad + parseFloat(computed(p, "border-left-width")),
      0,
    );
  });

  it("carries NO motion — the dialog's entry is wrong for a sheet, and none is honest", async () => {
    // Kushagra, 2026-08-21: "we will design a separate motion system for sheet, so what it has
    // right now is wrong". §24's entry is depth-not-distance, and every word of that argument
    // is about a CENTRED panel at modal mass — a 3% scale on a box already resting on the
    // bottom edge reads as the wrong gesture rather than a small one. Menu's precedent:
    // shipped instant, moved the next day.
    //
    // THE FIXTURE IS THE LAW. `defaultOpen` cannot answer this: Base UI writes
    // `transition: none !important` INLINE on a dialog that opens on mount, so both windows
    // read "no motion" and a sabotage of the stand-down survives. Measured, and it survived —
    // this opens from the keyboard, which is a real open, and reads the starting frame.
    inMotion();

    const openByPress = async () => {
      render(
        <Theme>
          <Dialog size="3">
            <DialogTrigger render={<Button>Open</Button>} />
            <DialogContent>
              <DialogTitle>Rename</DialogTitle>
            </DialogContent>
          </Dialog>
        </Theme>,
      );
      settleAll();
      const buttons = document.querySelectorAll<HTMLElement>("button");
      const trigger = buttons[buttons.length - 1];
      if (!trigger) throw new Error("the trigger never mounted");
      const before = document.querySelectorAll(".kui-dialog-popup").length;
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      // WAIT for the panel, never assume the gesture resolving means React has committed
      // (settling.test.ts, 2026-08-21). A state that never arrives expires the deadline into
      // the same failure, with the same message.
      await until(() => document.querySelectorAll(".kui-dialog-popup").length > before);
      const ps = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
      const p = ps[ps.length - 1];
      if (!p) throw new Error("the panel never opened");
      const b = p.querySelector<HTMLElement>(".kui-dialog-body");
      if (!b) throw new Error("the body never mounted");
      return { panel: p, body: b };
    };

    // WIDE first, and it is not a control for politeness: it is what makes the narrow reading
    // mean anything. Both halves in one law, because the claim is a difference.
    const wide = await openByPress();
    expect(computed(wide.panel, "transition-property"), "a centred dialog still comes into focus")
      .toBe("scale, opacity");
    expect(computed(wide.panel, "scale"), "…from a step back in z").not.toBe("none");
    expect(computed(wide.body, "transition-property"), "…with its content sharpening").toBe("filter");

    await page.viewport(PHONE.width, PHONE.height);
    const sheet = await openByPress();
    expect(computed(sheet.panel, "transition-property"), "a sheet moves nothing").toBe("none");
    expect(computed(sheet.body, "transition-property"), "…and its content has no clock either")
      .toBe("none");
  });

  it("…and it does not flash the dialog's POSE for a frame either", async () => {
    // The half the law above cannot see, and its sabotage pass is what said so: with the clock
    // stood down, `data-starting-style` is gone by the time any read lands, so deleting the
    // pose stand-downs left the suite green. The pose still matters — with no transition the
    // browser paints one frame at the starting values before the attribute is removed, which
    // is a 3%-smaller blurred panel popping into place.
    //
    // So the attribute is SET rather than waited for. That is not a workaround: the claim here
    // is about what the starting pose resolves to, which is a question about the cascade and
    // not about time — and a law that raced the frame would be the timing shape this repo has
    // already removed five times (`watchesFrames`, 2026-08-20).
    const poseOf = async (viewport: { width: number; height: number }) => {
      await page.viewport(viewport.width, viewport.height);
      render(
        <Theme>
          <Dialog defaultOpen size="3">
            <DialogContent>
              <DialogTitle>Rename</DialogTitle>
            </DialogContent>
          </Dialog>
        </Theme>,
      );
      settleAll();
      const ps = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
      const p = ps[ps.length - 1];
      if (!p) throw new Error("the panel never mounted");
      const b = p.querySelector<HTMLElement>(".kui-dialog-body");
      if (!b) throw new Error("the body never mounted");
      // Read against the panel's OWN resting pose rather than against a literal. `scale: none`
      // and `scale: 1` are the same picture and different strings, and the first spelling of
      // this law asserted the string — it failed on correct code, which is the cheapest kind
      // of instrument bug to find and the easiest to have shipped as a "fix".
      const rest = { scale: computed(p, "scale"), blur: computed(b, "filter") };
      p.setAttribute("data-starting-style", "");
      const start = { scale: computed(p, "scale"), blur: computed(b, "filter") };
      p.removeAttribute("data-starting-style");
      return { rest, start };
    };

    const wide = await poseOf(VIEWPORT);
    expect(wide.start.scale, "a centred dialog starts a step back in z").not.toBe(wide.rest.scale);
    expect(wide.start.blur, "…with its content out of focus").not.toBe(wide.rest.blur);

    const sheet = await poseOf(PHONE);
    expect(sheet.start.scale, "a sheet starts exactly where it lands").toBe(sheet.rest.scale);
    expect(sheet.start.blur, "…and its content is never blurred").toBe(sheet.rest.blur);
  });

  it("a window one pixel wider is the centred panel, unchanged", async () => {
    // The boundary lands DOWNWARD (§18), and the whole point of a media query is that the
    // other side of it is untouched. A law about a switch that never reads the off position
    // is half a law.
    await page.viewport(769, 844);
    const p = openOn(<DialogTitle>Rename</DialogTitle>);
    const r = p.getBoundingClientRect();
    expect(r.left, "the gutter is back").toBeGreaterThan(0);
    expect(window.innerHeight - r.bottom, "and it is centred, not pinned").toBeCloseTo(r.top, 0);
    expect(parseFloat(computed(p, "border-bottom-left-radius"))).toBeGreaterThan(0);
  });
});
