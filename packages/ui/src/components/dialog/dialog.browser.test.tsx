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
 * Motion is deliberately absent from the component and from this file. A dialog declares no
 * transition of its own today; the entry is another pass's work, so nothing here calls
 * `inMotion()` and nothing here would pass only in a frozen page.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from "./dialog.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/menu.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Heading } from "../heading/heading.tsx";
import { Text } from "../text/text.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import {
  render,
  settleAll,
  computed,
  colorOn,
  probeIn,
  tokenOn,
  SIZES,
  APPEARANCES,
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
  surfaceLook: "filled",
  contrast: "high",
};

/** Mount an OPEN dialog under a themed root; LOUD when the panel never mounts. */
function openDialog(theme: ThemeProps, opts: { size?: Size; material?: "thin" | "regular" | "thick"; body?: React.ReactNode } = {}) {
  render(
    <Theme {...theme}>
      <Dialog defaultOpen {...(opts.size ? { size: opts.size } : {})}>
        <DialogContent {...(opts.material ? { material: opts.material } : {})}>
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
        expect(computed(popup, "border-top-left-radius"), `size ${size} @ ${radius}`).toBe(overlay);
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
      expect(computed(popup, "padding-top")).toBe(tokenOn(popup, `--surface-p-${size}`));
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

describe("a dialog does not float", () => {
  it("is not a floating pane and never casts the floating chrome", () => {
    for (const depth of ["flat", "elevated"] as const) {
      const { popup } = openDialog({ depth });
      // The class carries the concentric corner join AND the floating cast; a dialog wants
      // neither, and this is the law that keeps a future "make it consistent with Menu" edit
      // from quietly re-pointing both.
      expect(popup.classList.contains("kui-floating")).toBe(false);
      expect(computed(popup, "box-shadow")).not.toBe(tokenOn(popup, "--floating-chrome-elevated"));
      expect(computed(popup, "box-shadow")).not.toBe(tokenOn(popup, "--floating-chrome-flat"));
    }
  });

  it("casts exactly what a CARD casts in the same world — never more, never less", () => {
    // The positive half, and the one that says what a dialog IS: paper, lifted by the app's
    // own identity rather than by a fact about itself. A menu in the same flat world casts;
    // this must not, because coverage is already stated by the scrim.
    for (const depth of ["flat", "elevated"] as const) {
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
    // And the negative control the pair needs: in a FLAT world a menu still states its
    // coverage, so "no shadow anywhere" is not what this suite is measuring.
    render(
      <Theme depth="flat">
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
    expect(computed(menus[menus.length - 1]!, "box-shadow")).not.toBe("none");
  });

  it("still answers `material` — the panel is glass, the scrim is unchanged", () => {
    // Kushagra, 2026-08-10: no cast, but material must be respected. Membership delivers it —
    // the surface layer's own rules — and this asserts the panel actually reached them.
    const { popup, backdrop } = openDialog({ appearance: "light" }, { material: "regular" });
    expect(computed(popup, "backdrop-filter")).toBe(filterOn(popup, "--material-regular-filter"));
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
    expect(document.querySelectorAll(".kui-dialog-popup").length).toBe(1);
  });
});
