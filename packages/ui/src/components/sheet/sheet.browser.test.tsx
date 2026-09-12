/**
 * Sheet's mounted laws (§10, §11, §20, §24) — the 2026-08-03 standard: computed values and real
 * input through a mounted <Theme>, in both appearances where colour is the question.
 *
 * The file this is written against says a sheet "takes Dialog's a11y whole" and runs on Base UI's
 * DRAWER, and the ship audit found that exactly where those two disagreed, nobody had measured:
 * the initial-focus default came from the Drawer (S1), the close-reason union came from the
 * Dialog (S2), and the height cap came from Dialog's narrow arm, whose reason was touch reach and
 * never safe areas (S3). So the family facts here are asserted as AGREEMENTS with a mounted
 * Dialog rather than as literals — an equality can fail, and "the sheet has a scrim" cannot —
 * and the three the audit found each get a law whose fixture reproduces the defect when the fix
 * is taken out.
 *
 * What is NOT here, because it is law-tested where it lives: the surface rungs, the material
 * recipes, the portal wrapper's own re-stamping, the overlay corner band. What is asserted is
 * that this component wears them.
 */
import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent, page, cdp } from "vitest/browser";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
  type SheetOpenChangeDetails,
  type SheetSide,
} from "./sheet.tsx";
import { Dialog, DialogContent, DialogTitle } from "../dialog/dialog.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/menu.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Box } from "../box/box.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import { VIEWPORT } from "../../test/viewport.ts";
import {
  APPEARANCES,
  DEPTHS,
  SIZES,
  asksForStillness,
  computed,
  inMotion,
  probeIn,
  render,
  settleAll,
  tokenOn,
  until,
} from "../../test/browser.tsx";
import type { Size } from "../../system/axes.ts";

/** Every axis off its default — a dropped attribute is visible (the §20 constant, Dialog's set
    verbatim: seven axes, contrast included, because that is what ENGINEERING §2.1 names). */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  depth: "elevated",
  contrast: "high",
};

type Opened = {
  popup: HTMLElement;
  backdrop: HTMLElement;
  viewport: HTMLElement;
  body: HTMLElement;
};

/** Mount an OPEN sheet under a themed root; LOUD when any part never mounts. */
function openSheet(
  theme: ThemeProps,
  opts: {
    size?: Size;
    side?: SheetSide;
    material?: "thin" | "regular" | "thick";
    body?: React.ReactNode;
  } = {},
): Opened {
  render(
    <Theme {...theme} {...(opts.material ? { material: opts.material } : {})}>
      <Sheet defaultOpen {...(opts.size ? { size: opts.size } : {})} {...(opts.side ? { side: opts.side } : {})}>
        <SheetContent>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the list.</SheetDescription>
          {opts.body}
        </SheetContent>
      </Sheet>
    </Theme>,
  );
  // The LAST panel — mounts accumulate within one test (the menu suite's own lesson).
  const popups = document.querySelectorAll<HTMLElement>(".kui-sheet-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the panel never mounted — every law below would assert nothing");
  const backdrops = document.querySelectorAll<HTMLElement>(".kui-sheet-backdrop");
  const backdrop = backdrops[backdrops.length - 1];
  if (!backdrop) throw new Error("the scrim never mounted");
  const viewport = popup.parentElement;
  if (!viewport?.classList.contains("kui-sheet-viewport"))
    throw new Error("the viewport is not the panel's parent");
  const body = popup.querySelector<HTMLElement>(".kui-sheet-body");
  if (!body) throw new Error("the body never mounted");
  settleAll();
  return { popup, backdrop, viewport, body };
}

/** Mount an OPEN dialog and hand back its panel and scrim — the twin every family law compares
    against, so a family fact is an equality rather than a restated literal. */
function openDialog(theme: ThemeProps, opts: { material?: "thin" | "regular" | "thick" } = {}) {
  render(
    <Theme {...theme} {...(opts.material ? { material: opts.material } : {})}>
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Filters</DialogTitle>
        </DialogContent>
      </Dialog>
    </Theme>,
  );
  const popups = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the dialog never mounted — the comparison would assert nothing");
  const backdrops = document.querySelectorAll<HTMLElement>(".kui-dialog-backdrop");
  const backdrop = backdrops[backdrops.length - 1];
  if (!backdrop) throw new Error("the dialog's scrim never mounted");
  settleAll();
  return { popup, backdrop };
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

/** A FILTER token as the scope resolves it — `tokenOn` probes through `width`, which rejects a
    filter function list and answers a healthy `0px` (Dialog's own instrument finding). */
const filterOn = (scope: Element, name: string): string =>
  probeIn(scope, (el) => (el.style.backdropFilter = `var(${name})`), (s) => s.backdropFilter);

/** The alpha of a computed colour, parsed off the BROWSER's output rather than rebuilt from the
    token (the instrument-calibration lesson, 2026-08-08). Two spellings, because the browser
    answers in two: `rgba(...)` for a declared colour, `color(srgb ... / a)` for a material's mix. */
function alphaOf(color: string): number {
  const slash = color.match(/\/\s*([\d.]+)\s*\)/);
  if (slash) return Number(slash[1]);
  const legacy = color.match(/rgba?\(([^)]+)\)/);
  if (!legacy) throw new Error(`not a colour this parser knows: ${color}`);
  const fields = legacy[1]!.split(",").map((v) => parseFloat(v));
  return fields.length === 4 ? fields[3]! : 1;
}

/** The corner the overlay band DRAWS at this index — band token × the squircle knob, derived
    through the same expression the surface rule uses so a re-priced band moves both sides, and a
    non-squircle engine resolves the knob's fallback of 1 and the law holds unchanged. */
const drawnCorner = (popup: HTMLElement, size: Size): string =>
  probeIn(
    popup,
    (el) => (el.style.borderRadius = `calc(var(--radius-overlay-${size}) * var(--kui-corner-k, 1))`),
    (s) => s.borderTopLeftRadius,
  );

/* ── The §20 agreement law ────────────────────────────────────────────────────────────── */

describe("the agreement law: portalled ≡ in-flow (§20, §24)", () => {
  function twin(theme: ThemeProps) {
    let panel: HTMLElement | null = null;
    render(
      <Theme {...theme}>
        <div
          ref={(n: HTMLDivElement | null) => void (panel = n)}
          className="kui-surface kui-overlay kui-sheet-popup"
          data-size="2"
          data-side="bottom"
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
    // WITHOUT the portal's own <Theme> the panel lands outside every axis attribute and reads
    // the document's, so this pair is the whole of what the wrapper buys: delete PortalScope and
    // the two sides disagree on fill, border, corner and padding at once.
    const { popup } = openSheet(HOSTILE);
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(twin(HOSTILE)));
    // The comparison can fail: the same twin under default axes disagrees.
    expect(surfaceFacts(twin({}))).not.toEqual(surfaceFacts(twin(HOSTILE)));
  });

  it("takes the DOCUMENT's direction when the sheet has no trigger (§20)", () => {
    // A sheet driven by app state is ordinary and owns no in-flow node, so there is nothing for
    // the direction hook to measure — and an unmeasured direction must state NOTHING rather than
    // stamp its `ltr` initial value, which would OVERRIDE the rtl the portal inherits. Dialog's
    // own 2026-08-10 finding, and this component takes the same fallback.
    const html = document.documentElement;
    const before = html.getAttribute("dir");
    try {
      html.setAttribute("dir", "rtl");
      const { popup } = openSheet({});
      expect(computed(popup, "direction")).toBe("rtl");
    } finally {
      if (before === null) html.removeAttribute("dir");
      else html.setAttribute("dir", before);
    }
  });
});

/* ── The edge (§11) ───────────────────────────────────────────────────────────────────── */

describe("which edge it comes from", () => {
  afterEach(async () => {
    await page.viewport(VIEWPORT.width, VIEWPORT.height);
  });

  it("bottom rests on the window's bottom edge, centred, capped at its index's width", () => {
    const { popup, viewport } = openSheet({}, { size: "2" });
    const r = popup.getBoundingClientRect();
    const room = viewport.getBoundingClientRect();
    expect(window.innerHeight - r.bottom, "it rests ON the edge — no gutter below").toBeCloseTo(0, 0);
    // Centred, and read as a measurement rather than off `margin-inline: auto`: the two sides of
    // the window must be equal, which is what "centred" means and what an `auto` on one side
    // only would fail.
    expect(r.left - room.left, "centred: the left gap").toBeCloseTo(room.right - r.right, 0);
    expect(r.left, "and there IS a gap, or 'centred' is not a distinguishable claim").toBeGreaterThan(0);
    expect(r.width).toBeCloseTo(parseFloat(tokenOn(popup, "--overlay-w-2")), 1);
    // Content-tall, not stretched: a short sheet is as tall as what is in it. Without this the
    // law above would equally describe a full-height panel resting on the bottom edge.
    expect(r.height, "a short sheet stays short").toBeLessThan(window.innerHeight / 2);
  });

  it("bottom keeps the corners it is not flush against, and squares the two the window owns", () => {
    const { popup } = openSheet({}, { size: "2" });
    const drawn = drawnCorner(popup, "2");
    expect(parseFloat(drawn), "the band must draw a real curve, or 'squared' says nothing").toBeGreaterThan(0);
    expect(computed(popup, "border-top-left-radius"), "the top is rounded").toBe(drawn);
    expect(computed(popup, "border-top-right-radius")).toBe(drawn);
    expect(computed(popup, "border-bottom-left-radius"), "the bottom edge is the window's").toBe("0px");
    expect(computed(popup, "border-bottom-right-radius")).toBe("0px");
  });

  it("an inline sheet takes the window's height and keeps no corner on the edge it sits against", () => {
    // Both inline edges in one law, because the claim is a MIRROR: a fixture that only ever
    // mounts one side cannot tell a logical rule from a hard-coded physical one.
    const cells = [
      { side: "inline-start", kept: ["top-right", "bottom-right"], flush: ["top-left", "bottom-left"] },
      { side: "inline-end", kept: ["top-left", "bottom-left"], flush: ["top-right", "bottom-right"] },
    ] as const;
    const edges: Record<string, number> = {};
    for (const cell of cells) {
      const { popup, viewport } = openSheet({}, { size: "2", side: cell.side });
      const r = popup.getBoundingClientRect();
      const room = viewport.getBoundingClientRect();
      expect(r.height, `${cell.side}: the window's height`).toBeCloseTo(room.height, 0);
      expect(r.width, `${cell.side}: its index's width`).toBeCloseTo(
        parseFloat(tokenOn(popup, "--overlay-w-2")),
        1,
      );
      const drawn = drawnCorner(popup, "2");
      for (const corner of cell.kept)
        expect(computed(popup, `border-${corner}-radius`), `${cell.side}: ${corner} is kept`).toBe(drawn);
      for (const corner of cell.flush)
        expect(computed(popup, `border-${corner}-radius`), `${cell.side}: ${corner} is flush`).toBe("0px");
      edges[cell.side] = r.left;
    }
    // In LTR the start edge is the left one, and the two sides are genuinely opposite — without
    // this a rule that placed both on the same side would satisfy every assertion above.
    expect(edges["inline-start"], "inline-start hugs the left edge in LTR").toBeCloseTo(0, 0);
    expect(edges["inline-end"], "…and inline-end the right").toBeGreaterThan(edges["inline-start"]!);
  });

  it("the edge is LOGICAL: in RTL the same prop opens on the other side, and swipes the other way", () => {
    // The component refuses `left` and `right` on exactly this argument (SheetSide's own JSDoc),
    // and the refusal is only worth having if the logical spelling really mirrors. Measured as
    // the painted position AND as the physical swipe direction Base UI is given, because those
    // are two mechanisms — the stylesheet's logical margins, and `swipeDirectionFor` in the
    // component — and a law reading one of them is half a law.
    const html = document.documentElement;
    const before = html.getAttribute("dir");
    try {
      const ltr = openSheet({}, { side: "inline-end" });
      expect(ltr.popup.getAttribute("data-swipe-direction"), "LTR: inline-end leaves to the right").toBe("right");
      expect(ltr.popup.getBoundingClientRect().left).toBeGreaterThan(window.innerWidth / 2);

      html.setAttribute("dir", "rtl");
      const rtl = openSheet({}, { side: "inline-end" });
      expect(rtl.popup.getAttribute("data-swipe-direction"), "RTL: it leaves to the left").toBe("left");
      expect(
        rtl.popup.getBoundingClientRect().left,
        "the same prop must open on the other side, or `inline-end` is just `right` misspelt",
      ).toBeCloseTo(0, 0);
    } finally {
      if (before === null) html.removeAttribute("dir");
      else html.setAttribute("dir", before);
    }
  });

  it("on a narrow window a bottom sheet is the whole window's width — and an inline one is not", async () => {
    /**
     * The shipped `@media (max-width: 48rem)` arm, ENTERED rather than read (ENGINEERING §6: a
     * law about a conditional block must execute the condition).
     *
     * THE FIXTURE IS THE LAW, and the obvious one cannot fail. Written first at a phone's 390px
     * with the default index, every assertion below passed with the whole media block DELETED —
     * because a size-2 sheet's cap is 440px and the window is 390, so the cap never binds and
     * `inline-size: 100%` answers 390 either way. Found by sabotage, which is the only thing that
     * finds it: a law whose fixture cannot tell a correct implementation from a broken one is
     * this repo's most-repeated defect, and it reads exactly like a passing law.
     *
     * The distinguishing shape is a window WIDER than the index's designed cap and still inside
     * the band: at 700px a size-1 sheet is 360px with the arm gone, and the window's whole 700
     * with it there.
     */
    const NARROW = 700;
    await page.viewport(NARROW, 844);
    const bottom = openSheet({}, { size: "1" });
    const cap = parseFloat(tokenOn(bottom.popup, "--overlay-w-1"));
    expect(
      cap,
      "the index's cap must be narrower than the window, or this arm is unobservable",
    ).toBeLessThan(NARROW);
    expect(
      bottom.popup.getBoundingClientRect().width,
      "no gutter — on a narrow window a sheet is the window's width",
    ).toBeCloseTo(NARROW, 0);
    expect(bottom.popup.getBoundingClientRect().left).toBeCloseTo(0, 0);

    // The control that makes this a claim about the ARM rather than about narrowness: an inline
    // sheet on the same window keeps its designed width, because the reason the cap goes is that
    // a CENTRED sheet narrower than the glass reads as a card that fell — which is true of the
    // bottom edge and of nothing else.
    const side = openSheet({}, { size: "1", side: "inline-end" });
    expect(
      side.popup.getBoundingClientRect().width,
      "an inline sheet keeps its index's width on the same window",
    ).toBeCloseTo(cap, 1);

    await page.viewport(769, 844);
    const wide = openSheet({}, { size: "1" });
    expect(
      wide.popup.getBoundingClientRect().width,
      "one pixel past the boundary the cap is back (§18 lands downward)",
    ).toBeCloseTo(cap, 1);

    // And the inline cap's OTHER arm, where the window wins: a size-4 sheet on a phone still
    // leaves a strip of scrim to press. Its own premise is asserted, for the reason the whole
    // law was rewritten — an index whose designed width fits the window would prove nothing.
    await page.viewport(390, 844);
    const crowded = openSheet({}, { size: "4", side: "inline-end" });
    const reach = parseFloat(tokenOn(crowded.popup, "--touch-target-min"));
    expect(
      parseFloat(tokenOn(crowded.popup, "--overlay-w-4")),
      "the designed width must exceed the window, or 'the window wins' is not observable",
    ).toBeGreaterThan(390);
    expect(
      crowded.popup.getBoundingClientRect().width,
      "an inline sheet leaves a way out, so a way out is what it gives up",
    ).toBeCloseTo(390 - reach, 0);
  });
});

/* ── The index (§24) ──────────────────────────────────────────────────────────────────── */

describe("the index prices the box", () => {
  it("rests at 2 — the index every 1-4 family rests at", () => {
    const { popup } = openSheet({});
    expect(popup.getAttribute("data-size")).toBe("2");
  });

  it("width, padding and corner all answer the index, and all four rungs are a LADDER", () => {
    /**
     * READ AS A LADDER, at all four indexes. Two adjacent steps agree under more than one wrong
     * spelling — a map frozen at one value, a map read at the wrong end, a join that prices only
     * the ends — which is the composer's own 2026-08-23 lesson, twice in one day: `1` against `4`
     * differs under every spelling anyone has tried here, so no two-index law can tell them apart.
     */
    const width: number[] = [];
    const padding: number[] = [];
    const corner: number[] = [];
    for (const size of SIZES) {
      const { popup } = openSheet({}, { size });
      expect(popup.getAttribute("data-size"), `size ${size} is stamped`).toBe(size);
      // Each fact against the token the shared join picks, never against a number: a sheet.css
      // that restated a value would pass a "has a width" law and fail this one.
      expect(computed(popup, "max-inline-size"), `size ${size}: the overlay ladder`).toBe(
        tokenOn(popup, `--overlay-w-${size}`),
      );
      // ONE SIZE UP with the top held — the overlay family's padding step (2026-08-17), which a
      // sheet inherits by wearing `kui-overlay` rather than by restating.
      const up = size === "4" ? "4" : (String(Number(size) + 1) as Size);
      expect(computed(popup, "padding-top"), `size ${size}: the surface join`).toBe(
        tokenOn(popup, `--surface-p-${up}`),
      );
      expect(computed(popup, "border-top-left-radius"), `size ${size}: the overlay band`).toBe(
        drawnCorner(popup, size),
      );
      width.push(parseFloat(computed(popup, "max-inline-size")));
      padding.push(parseFloat(computed(popup, "padding-top")));
      corner.push(parseFloat(computed(popup, "border-top-left-radius")));
    }
    // The vacuity guard, and it is not optional: every equality above holds just as well against
    // a join whose four arms all pick the same rung.
    expect(width, "the width ladder is flat").toEqual([...width].sort((a, b) => a - b));
    expect(width[3]!, "the width ladder never rises").toBeGreaterThan(width[0]!);
    expect(padding[3]!, "the padding ladder never rises").toBeGreaterThan(padding[0]!);
    expect(corner[3]!, "the corner ladder never rises").toBeGreaterThan(corner[0]!);
  });

  it("the index never reaches type the CALL SITE wrote", () => {
    // §24's line is OWNERSHIP: the system sizes its own words — the title and the description,
    // which move with the index because a dialog, an alert and a sheet at one index are one
    // typography — and never the caller's.
    const own = (size: Size) => {
      const { popup } = openSheet({}, {
        size,
        body: <Box data-testid="mine">mine</Box>,
      });
      const titleId = popup.getAttribute("aria-labelledby")!;
      return {
        title: computed(document.getElementById(titleId)!, "font-size"),
        mine: computed(popup.querySelector<HTMLElement>('[data-testid="mine"]')!, "font-size"),
      };
    };
    const small = own("1");
    const large = own("4");
    expect(parseFloat(large.title), "the owned title does not answer the index").toBeGreaterThan(
      parseFloat(small.title),
    );
    expect(large.mine, "the index reached type the call site wrote").toBe(small.mine);
  });
});

/* ── The overlay family, asserted as agreements (§10, §24) ────────────────────────────── */

describe("it is an overlay, exactly as a dialog is", () => {
  it("covers the window with the SAME scrim a dialog draws, in both appearances", () => {
    // An equality rather than "it has a backdrop": the scrim is the app going back, it is a
    // family fact, and a sheet that quietly picked its own alpha would pass every reasonable
    // "is there a scrim" law. What is deliberately NOT compared is the CLOCK — a sheet's dim
    // rides the SLIDE (§27's drawer sentence) where a dialog's is a quick reveal.
    for (const appearance of APPEARANCES) {
      const sheet = openSheet({ appearance });
      const dialog = openDialog({ appearance });
      const cs = getComputedStyle(sheet.backdrop);
      expect(cs.position, `${appearance}: fixed to the window, not to the page`).toBe("fixed");
      expect(parseFloat(cs.width)).toBe(window.innerWidth);
      expect(parseFloat(cs.height)).toBe(window.innerHeight);
      expect(cs.backgroundColor, `${appearance}: the family's fill`).toBe(
        computed(dialog.backdrop, "background-color"),
      );
      expect(computed(sheet.backdrop, "backdrop-filter"), `${appearance}: the family's defocus`).toBe(
        computed(dialog.backdrop, "backdrop-filter"),
      );
      expect(computed(sheet.backdrop, "backdrop-filter"), `${appearance}: it really does blur`).toMatch(/blur\(/);
    }
    // And it is not a surface: the cheapest wrong fix for any backdrop question is to give it
    // the surface class and inherit machinery it must not have.
    const { backdrop } = openSheet({ depth: "elevated" });
    expect(backdrop.classList.contains("kui-surface")).toBe(false);
    expect(parseFloat(computed(backdrop, "border-top-width"))).toBe(0);
    expect(computed(backdrop, "box-shadow")).toBe("none");
  });

  it("the scrim stands its blur down under contrast=\"high\", and dims harder instead", () => {
    const rest = openSheet({ appearance: "light" });
    const high = openSheet({ appearance: "light", contrast: "high" });
    expect(computed(rest.backdrop, "backdrop-filter")).toMatch(/blur\(/);
    expect(computed(high.backdrop, "backdrop-filter")).toBe("none");
    expect(alphaOf(computed(high.backdrop, "background-color"))).toBeGreaterThan(
      alphaOf(computed(rest.backdrop, "background-color")),
    );
  });

  it("casts what a CARD casts — the scrim is the separation, so the panel floats nothing", () => {
    // §5's plane criterion and §24's coverage clause: the whole viewport going dark IS the
    // statement, so what survives on the panel is the world's ordinary surface chrome.
    for (const depth of DEPTHS) {
      const { popup } = openSheet({ depth });
      let card: HTMLElement | null = null;
      render(
        <Theme depth={depth}>
          <Card ref={(n: HTMLDivElement | null) => void (card = n)} size="3">
            paper
          </Card>
        </Theme>,
      );
      expect(computed(popup, "box-shadow"), `${depth}: a sheet casts a card's cast`).toBe(
        computed(card as unknown as HTMLElement, "box-shadow"),
      );
      // The class carries the concentric corner join AND the floating cast; a sheet wants
      // neither, and this is what keeps a future "make it consistent with Menu" edit from
      // quietly re-pointing both.
      expect(popup.classList.contains("kui-floating")).toBe(false);
    }
    /**
     * The negative control the pair is worth nothing without, in the ELEVATED world where casts
     * are real AND ranked: something in this world genuinely casts, and what a sheet casts is
     * specifically a CARD's rather than whatever every pane happens to share. Dialog's own
     * 2026-08-26 correction — in a flat world every cast is the no-op layer, so the comparison
     * there is not a distinguishable statement.
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
    const menuCast = computed(menus[menus.length - 1]!, "box-shadow");
    const { popup: lifted } = openSheet({ depth: "elevated" });
    expect(
      computed(lifted, "box-shadow"),
      "a sheet and a menu cast the same thing, so 'exactly a card' says nothing",
    ).not.toBe(menuCast);
  });

  it("answers `material` the way a dialog does — the panel is glass, the scrim is unchanged", () => {
    // A covering pane is over content by construction, so it always expresses the theme (§10's
    // selectivity, and `useMaterial({ backdrop: true })` in the component is what states it).
    const sheet = openSheet({ appearance: "light" }, { material: "regular" });
    const dialog = openDialog({ appearance: "light" }, { material: "regular" });
    const stripLens = (v: string) => v.replace(/url\("[^"]*"\)\s*/, "");
    expect(stripLens(computed(sheet.popup, "backdrop-filter")), "the family's filter chain").toBe(
      stripLens(computed(dialog.popup, "backdrop-filter")),
    );
    expect(stripLens(computed(sheet.popup, "backdrop-filter"))).toBe(
      filterOn(sheet.popup, "--material-regular-filter"),
    );
    expect(computed(sheet.popup, "backdrop-filter"), "a glass panel wears the lens").toMatch(/^url\(/);
    expect(alphaOf(computed(sheet.popup, "background-color")), "and a glass veil is translucent").toBeLessThan(1);
    // The dim behind it is the APP's, not the pane's, so it does not move with the material.
    const solid = openSheet({ appearance: "light" });
    expect(computed(sheet.backdrop, "background-color")).toBe(
      computed(solid.backdrop, "background-color"),
    );
  });
});

/* ── The panel is the interaction (§24) ───────────────────────────────────────────────── */

describe("a sheet takes Dialog's a11y whole", () => {
  it("announces as a dialog, named and described by the parts that carry the words", () => {
    const { popup } = openSheet({});
    expect(popup.getAttribute("role")).toBe("dialog");
    const labelledBy = popup.getAttribute("aria-labelledby");
    const describedBy = popup.getAttribute("aria-describedby");
    expect(labelledBy, "with no name a screen reader announces only \"dialog\"").toBeTruthy();
    expect(describedBy).toBeTruthy();
    const title = document.getElementById(labelledBy!);
    expect(title?.textContent).toBe("Filters");
    // A real heading element, not a styled div: the outline level is the reason the part exists.
    expect(title?.tagName).toBe("H2");
    expect(document.getElementById(describedBy!)?.textContent).toBe("Narrow the list.");
  });

  it("traps focus: Tab from the last control stays inside the panel", async () => {
    render(
      <Theme>
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle>Filters</SheetTitle>
            <TextField aria-label="Query" />
            <SheetClose render={<Button>Done</Button>} />
          </SheetContent>
        </Sheet>
        {/* The escape route the trap has to refuse. Without a focusable node OUTSIDE the panel
            this law could not fail: Tab would have nowhere to leak to and "still inside" would
            be true of a page with no trap at all. */}
        <Button data-testid="outside">Page</Button>
      </Theme>,
    );
    settleAll();
    const popups = document.querySelectorAll<HTMLElement>(".kui-sheet-popup");
    const popup = popups[popups.length - 1]!;
    const outside = document.querySelector<HTMLElement>('[data-testid="outside"]')!;
    expect(outside.tabIndex, "the outside control must be reachable, or there is no leak to catch").toBeGreaterThanOrEqual(0);
    const last = [...popup.querySelectorAll<HTMLElement>("button")].at(-1)!;
    // THE PANEL FOCUSES ITSELF FIRST, AND IT ATE THIS LAW'S SETUP (2026-09-12, ship). The sheet
    // lands focus on its first control one effect AFTER the mount that `settleAll()` returns
    // from, so a bare `last.focus()` here was undone before the keystroke ever arrived: probed,
    // the Tab's own keydown reported `target=INPUT.kui-field-input`. The law was therefore
    // tabbing from the FIRST control to the last — a move that never reaches the panel's edge,
    // which is the only place a trap does anything — and it passed identically against a
    // sabotaged trap (`modal={false}` on the Drawer root, which is exactly the prop this
    // component refuses in public). Waiting for that focus to land, and only then taking it, is
    // what makes the gesture start where the sentence above says it starts.
    await until(() => popup.contains(document.activeElement), 3000);
    last.focus();
    expect(document.activeElement, "the gesture must START on the panel's last control").toBe(last);
    await userEvent.keyboard("{Tab}");
    // A STATE, not the statement after the gesture (settling.test.ts, 2026-08-21): the trap
    // moves focus in a handler, and a stalled runner outlives a bare read. A trap that genuinely
    // leaks expires the deadline into the same assertion with the same value in the message.
    //
    // AND THE STATE IS THE DESTINATION, not "it moved" (2026-09-12, ship). Tab is TWO events
    // here: the browser's own default lands focus on the next tabbable node — which is the
    // outside control, because the panel's last button is the panel's last tabbable — and the
    // trap then pulls it back. `activeElement !== last` is true in the gap between them, so the
    // first spelling could resolve on the intermediate frame and read a leak that the trap was
    // about to undo. It passed 28/28 three times alone and failed once inside the full suite,
    // which is the tell: the gap widens under load. Waiting for the LANDED condition is not a
    // weaker claim — a trap that genuinely leaks never satisfies it, expires the deadline, and
    // falls into the same two assertions below with the escape named in the message.
    await until(() => popup.contains(document.activeElement) && document.activeElement !== last, 3000);
    expect(
      popup.contains(document.activeElement),
      `Tab left the panel — focus is on ${(document.activeElement as HTMLElement)?.className || document.activeElement?.tagName}`,
    ).toBe(true);
    expect(document.activeElement, "…and specifically not on the page behind it").not.toBe(outside);
  });

  it("says WHY it is closing, refuses when told to, and hands focus back to its trigger", async () => {
    // The reasons are PROVOKED, never read off a table: they are Base UI's own strings kept as
    // this package's union, so a rename upstream is exactly what this must catch — and only a
    // real Escape and a real press can catch it.
    const seen: string[] = [];
    render(
      <Theme>
        <Sheet
          onOpenChange={(open: boolean, details: SheetOpenChangeDetails) => {
            seen.push(`${open}:${details.reason}`);
            if (details.reason === "escape-key" && seen.length === 2) details.cancel();
          }}
        >
          <SheetTrigger render={<Button>Open</Button>} />
          <SheetContent>
            <SheetTitle>Filters</SheetTitle>
            <SheetClose render={<Button>Done</Button>} />
          </SheetContent>
        </Sheet>
      </Theme>,
    );
    const trigger = document.querySelector<HTMLElement>(".kui-button")!;
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await until(() => !!document.querySelector(".kui-sheet-popup"), 3000);
    expect(seen[0], "the trigger says so").toBe("true:trigger-press");

    await userEvent.keyboard("{Escape}");
    await until(() => seen.length >= 2, 3000);
    expect(seen[1], "Escape is reported as Escape").toBe("false:escape-key");
    // SETTLED-BY-DESIGN: a refusal is a NON-event, so there is nothing to wait for and waiting
    // could only delay a correct answer. Its strength comes from the second Escape below, which
    // is the same gesture unrefused.
    expect(
      document.querySelectorAll(".kui-sheet-popup").length,
      "…and cancel() refused it: the panel is still there",
    ).toBeGreaterThan(0);

    await userEvent.keyboard("{Escape}");
    await until(() => document.querySelectorAll(".kui-sheet-popup").length === 0, 3000);
    expect(document.querySelectorAll(".kui-sheet-popup").length, "…and that one was not refused").toBe(0);
    // Focus RETURN, which is the half a trap is worthless without: a keyboard user who dismisses
    // a panel and lands on `<body>` has lost their place in the page.
    await until(() => document.activeElement === trigger, 3000);
    expect(document.activeElement, "focus came back to the trigger").toBe(trigger);
  });

  it("dismisses on an outside press, and says that is what happened", async () => {
    const seen: string[] = [];
    render(
      <Theme>
        <Sheet
          defaultOpen
          onOpenChange={(open: boolean, details: SheetOpenChangeDetails) =>
            void seen.push(`${open}:${details.reason}`)
          }
        >
          <SheetContent>
            <SheetTitle>Filters</SheetTitle>
          </SheetContent>
        </Sheet>
      </Theme>,
    );
    settleAll();
    const popups = document.querySelectorAll<HTMLElement>(".kui-sheet-popup");
    const popup = popups[popups.length - 1]!;
    // The press lands on the VIEWPORT's empty corner: the backdrop sits underneath it and can
    // never receive a pointer (the alert suite's own finding, one family over).
    await userEvent.click(popup.parentElement!, { position: { x: 8, y: 8 } });
    await until(() => !popup.isConnected, 3000);
    expect(popup.isConnected, "an outside press did not dismiss the sheet").toBe(false);
    expect(seen[0]).toBe("false:outside-press");
  });
});

/* ── Where focus LANDS, per interaction type (S1, the ship audit 2026-09-12) ──────────── */

describe("opening a sheet puts you where a dialog would", () => {
  /** Open by one real interaction and hand back the panel, the trigger and what holds focus. */
  async function openBy(how: "keyboard" | "mouse" | "touch") {
    render(
      <Theme>
        <Sheet>
          <SheetTrigger render={<Button>Filters</Button>} />
          <SheetContent>
            <SheetTitle>Filters</SheetTitle>
            <TextField aria-label="Query" />
            <SheetClose render={<Button>Done</Button>} />
          </SheetContent>
        </Sheet>
      </Theme>,
    );
    const buttons = document.querySelectorAll<HTMLElement>(".kui-button");
    const trigger = buttons[buttons.length - 1]!;
    if (how === "keyboard") {
      trigger.focus();
      await userEvent.keyboard("{Enter}");
    } else if (how === "mouse") {
      await userEvent.click(trigger);
    } else {
      // A real TOUCH, because Base UI branches on `pointerType` off the pointerdown — a
      // `userEvent` click reports `mouse` and would silently take the other arm, which is the
      // one this law exists to separate.
      const r = trigger.getBoundingClientRect();
      const at = { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      await cdp().send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: at.x, y: at.y }],
      } as never);
      await cdp().send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] } as never);
    }
    await until(() => !!document.querySelector(".kui-sheet-popup"), 3000);
    const popups = document.querySelectorAll<HTMLElement>(".kui-sheet-popup");
    const popup = popups[popups.length - 1];
    if (!popup) throw new Error(`a ${how} open never mounted the panel`);
    // A STATE, not a sleep: Base UI moves focus into the popup asynchronously.
    await until(() => document.activeElement !== trigger && document.activeElement !== document.body, 3000);
    return { popup, trigger, focused: document.activeElement as HTMLElement };
  }

  it("keyboard and mouse land on the first CONTROL; touch lands on the panel", async () => {
    /**
     * S1, and the whole fixture is the law. `sheet.tsx` claims a sheet "takes Dialog's a11y
     * whole", and Base UI's two primitives default this one prop differently: Dialog resolves
     * `interactionType === "touch" ? popup : true`, Drawer resolves the popup ALWAYS. Measured
     * before the fix, a keyboard open put focus on the panel DIV — which declares `outline: none`
     * because a panel holding focus is a mode — so a keyboard user landed on a node with no ring
     * and no name, one Tab from the control a dialog would have given them.
     *
     * THREE CELLS, because each wrong implementation is only visible in some of them: Drawer's
     * bare default fails keyboard and mouse, and a flat `initialFocus` of `true` fails touch by
     * raising a soft keyboard over the panel that has just slid up. A law mounting one cell
     * would bless one of the two defects.
     */
    for (const how of ["keyboard", "mouse"] as const) {
      const { popup, focused } = await openBy(how);
      expect(focused, `${how}: focus never entered the panel`).toBeTruthy();
      expect(popup.contains(focused), `${how}: focus is outside the panel`).toBe(true);
      expect(
        focused,
        `${how}: focus landed on the unringed panel instead of its first control`,
      ).not.toBe(popup);
      expect(focused.tagName, `${how}: the first tabbable thing is the field`).toBe("INPUT");
    }

    const touch = await openBy("touch");
    expect(
      touch.focused,
      "touch: focus landed on a field, which raises the keyboard over the panel that just slid up",
    ).toBe(touch.popup);
  });

  it("and what it lands on is what a DIALOG lands on, for the same gesture", async () => {
    // The agreement the header sentence actually claims. Read as a KIND rather than as the same
    // element — the two panels hold different children — and it is the comparison that makes
    // this a family fact rather than a preference the sheet happens to share today.
    let dialogFocused: Element | null = null;
    function Host() {
      const [open, setOpen] = React.useState(false);
      return (
        <Theme>
          <Button data-testid="open-dialog" onClick={() => setOpen(true)}>
            Open
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogTitle>Filters</DialogTitle>
              <TextField aria-label="Query" />
            </DialogContent>
          </Dialog>
        </Theme>
      );
    }
    render(<Host />);
    const opener = document.querySelector<HTMLElement>('[data-testid="open-dialog"]')!;
    opener.focus();
    await userEvent.keyboard("{Enter}");
    await until(() => !!document.querySelector(".kui-dialog-popup"), 3000);
    await until(() => document.activeElement !== opener && document.activeElement !== document.body, 3000);
    dialogFocused = document.activeElement;
    const panel = document.querySelector<HTMLElement>(".kui-dialog-popup")!;
    expect(dialogFocused, "the dialog control did not focus a control — the instrument is blind").not.toBe(panel);
    expect((dialogFocused as HTMLElement).tagName).toBe("INPUT");

    const sheet = await openBy("keyboard");
    expect(sheet.focused.tagName, "a sheet must land where a dialog lands").toBe(
      (dialogFocused as HTMLElement).tagName,
    );
  });
});

/* ── The body: the one box allowed to scroll (§3, §24) ────────────────────────────────── */

describe("the body is the box that scrolls", () => {
  const rows = Array.from({ length: 40 }, (_, i) => (
    <Box key={i} height="2rem">
      Row {i + 1}
    </Box>
  ));

  it("content taller than the window CAPS the panel and scrolls inside it", () => {
    // Two claims that are one: a sheet with no cap runs off the top of the screen with no route
    // back, and a capped pane whose content overflows DELETES it, because a pane clips (§3).
    const { popup, body } = openSheet({}, { size: "2", body: <>{rows}</> });
    const reach = parseFloat(tokenOn(popup, "--touch-target-min"));
    expect(reach, "the reserve must be a real length").toBeGreaterThan(0);
    const r = popup.getBoundingClientRect();
    expect(r.top, "a strip of scrim stays tappable above it").toBeCloseTo(reach, 0);
    expect(r.height).toBeCloseTo(window.innerHeight - reach, 0);
    expect(body.scrollHeight, "the content must overflow, or this proves nothing").toBeGreaterThan(
      body.clientHeight,
    );
    expect(computed(body, "overflow-y"), "…and the reader can reach it").toBe("auto");
    // The PANE itself never scrolls — it clips, which is what the bleed obliges.
    expect(computed(popup, "overflow-y")).toBe("clip");
  });

  it("the pane's inset moves INTO the scroller, so a ring at the edge is not clipped", () => {
    // A scroll container clips at its PADDING box, so with the inset left on the pane the body's
    // box ended exactly where a field's did and every ring inside was sliced (Dialog's narrow
    // arm, measured 2026-08-21). The bleed spelling is what moves it, and it is read as an
    // equality against the pane's own hook rather than as a number.
    const { popup, body } = openSheet({}, { size: "2", body: <>{rows}</> });
    const inset = tokenOn(popup, "--kui-sf-p");
    expect(parseFloat(inset), "the pane must have an inset to move").toBeGreaterThan(0);
    expect(computed(body, "padding-left"), "which moved inside the scroller").toBe(inset);
    expect(parseFloat(computed(body, "margin-left")), "…and back out again, so nothing shifts on screen").toBeCloseTo(
      -parseFloat(inset),
      1,
    );
    const first = popup.querySelector<HTMLElement>("h2")!.getBoundingClientRect();
    const border = parseFloat(computed(popup, "border-left-width"));
    expect(
      first.left - popup.getBoundingClientRect().left - border,
      "so the content still sits in from the panel's edge",
    ).toBeCloseTo(parseFloat(inset), 1);
  });
});

/* ── The safe areas (S3, the ship audit 2026-09-12) ───────────────────────────────────── */

describe("the reserve is the unsafe band PLUS a target", () => {
  /** Put a real device's insets on the page. Chromium resolves `env(safe-area-inset-*)` from
      this, so the law reads PIXELS rather than the declaration it is about — which is the
      difference between measuring the mechanism and measuring the author's arithmetic. */
  async function withInsets(
    insets: { top: number; bottom: number; left: number; right: number },
    run: () => void,
  ) {
    await cdp().send("Emulation.setSafeAreaInsetsOverride" as never, { insets } as never);
    try {
      run();
    } finally {
      await cdp().send("Emulation.setSafeAreaInsetsOverride" as never, {
        insets: { top: 0, bottom: 0, left: 0, right: 0 },
      } as never);
    }
  }

  const rows = Array.from({ length: 40 }, (_, i) => (
    <Box key={i} height="2rem">
      Row {i + 1}
    </Box>
  ));

  it("a bottom sheet stops clear of the status bar, not merely a target short of the glass", async () => {
    /**
     * The cap was `100% - var(--touch-target-min)`, borrowed from Dialog's narrow arm — where the
     * argument was touch REACH and never safe areas. Under `viewport-fit=cover` the viewport is
     * the whole glass, status bar included, so on a phone with a 59px inset the panel's top edge
     * landed at y=44: the top of the sheet INSIDE the status-bar band, and the tappable strip of
     * scrim the cap exists for lying entirely under it, where the system takes the touch. The
     * strip has to be REACHABLE, not merely present.
     *
     * Falsified by restoring the old cap, which puts the top back at 44 against the 103 below.
     */
    await withInsets({ top: 59, bottom: 34, left: 0, right: 0 }, () => {
      const { popup } = openSheet({}, { size: "2", body: <>{rows}</> });
      // CALIBRATION, and the law is worthless without it: if the override did not apply, every
      // `env()` reads 0 and the assertion below is satisfied by the defect.
      const inset = parseFloat(
        probeIn(popup, (el) => (el.style.height = "env(safe-area-inset-top)"), (s) => s.height),
      );
      expect(inset, "the page is not reporting a top inset — this law is measuring nothing").toBeCloseTo(59, 0);
      const reach = parseFloat(tokenOn(popup, "--touch-target-min"));
      const top = popup.getBoundingClientRect().top;
      expect(top, "the panel's top edge sits inside the unsafe band").toBeGreaterThanOrEqual(inset);
      expect(top, "the reserve is the band PLUS a target, not the larger of the two").toBeCloseTo(
        inset + reach,
        0,
      );
    });
  });

  it("and every device without one computes exactly what it did before", () => {
    // The other half of `env()`'s own contract: it is 0 wherever it does not apply, so the fix
    // must be invisible on a desktop. A law that only ever ran with insets could not tell the
    // shipped sum from one that always reserved 59px.
    const { popup } = openSheet({}, { size: "2", body: <>{rows}</> });
    expect(popup.getBoundingClientRect().top).toBeCloseTo(
      parseFloat(tokenOn(popup, "--touch-target-min")),
      0,
    );
  });

  it("an inline sheet pads its body off the bands the WINDOW owns, on the physical edges", async () => {
    // The half that already worked, and it is here because it is what makes the fixture able to
    // tell a reserve from a padding: the bottom sheet moves its BOX, an inline sheet keeps its
    // box and moves its CONTENT. Keyed on the physical swipe direction because `env()` is
    // physical — a home indicator is at the bottom whatever the language.
    await withInsets({ top: 59, bottom: 34, left: 0, right: 0 }, () => {
      const plain = openSheet({}, { size: "2", side: "inline-end" });
      const pane = parseFloat(tokenOn(plain.popup, "--kui-sf-p"));
      expect(pane, "the pane's own inset must exist for max() to have two arms").toBeGreaterThan(0);
      expect(plain.popup.getAttribute("data-swipe-direction")).toBe("right");
      // 59 > the pane's inset, so the top takes the band; 34 is near it, so the bottom takes the
      // larger of the two — read as `max`, which is the rule, rather than as either number.
      expect(parseFloat(computed(plain.body, "padding-top")), "the notch band").toBeCloseTo(
        Math.max(pane, 59),
        0,
      );
      expect(parseFloat(computed(plain.body, "padding-bottom")), "the home indicator's band").toBeCloseTo(
        Math.max(pane, 34),
        0,
      );
    });
  });
});

/* ── The slide (§8) ──────────────────────────────────────────────────────────────────── */

describe("the slide, and the setting that removes it", () => {
  /** Open by a real keyboard press — `defaultOpen` is not a real open for a motion law, because
      Base UI writes `transition: none` inline on a panel that opens on mount, so both windows
      read "no motion" and a sabotage of the stand-down survives (Dialog's own 2026-08-21
      fixture finding). The POSE is then hand-stamped rather than raced: what the starting style
      resolves to is a question about the cascade, not about time. */
  async function openByPress() {
    render(
      <Theme>
        <Sheet size="2">
          <SheetTrigger render={<Button>Filters</Button>} />
          <SheetContent>
            <SheetTitle>Filters</SheetTitle>
          </SheetContent>
        </Sheet>
      </Theme>,
    );
    const buttons = document.querySelectorAll<HTMLElement>(".kui-button");
    const trigger = buttons[buttons.length - 1]!;
    const before = document.querySelectorAll(".kui-sheet-popup").length;
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await until(() => document.querySelectorAll(".kui-sheet-popup").length > before, 3000);
    const popups = document.querySelectorAll<HTMLElement>(".kui-sheet-popup");
    const popup = popups[popups.length - 1];
    if (!popup) throw new Error("the panel never opened");
    const backdrops = document.querySelectorAll<HTMLElement>(".kui-sheet-backdrop");
    return { popup, backdrop: backdrops[backdrops.length - 1]! };
  }

  /**
   * A transform that moves the box NOWHERE, whichever of the two spellings produced it.
   *
   * The resting rule translates by Base UI's swipe offset, which is zero at rest and computes
   * `matrix(1, 0, 0, 1, 0, 0)`; the reduced-motion guard writes `transform: none`. Same picture,
   * different strings — and comparing the two strings is the instrument bug Dialog's own pose law
   * records having shipped once ("it failed on correct code, which is the cheapest kind to find
   * and the easiest to have shipped as a fix"). This one failed the same way on its first run.
   */
  const isIdentity = (t: string) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";

  /**
   * The pose the starting stamp resolves to, and the resting value beside it.
   *
   * HAND-STAMPED ON A STILL PANEL, never raced. What a starting style resolves to is a question
   * about the cascade, not about time — and the first spelling of this read `transform` off a
   * panel with a live 500ms slide running, which reported `matrix(1, 0, 0, 1, 0, 94)` for a box
   * it had just called "resting". That is the 2026-08-20 rule walked into by its own author: a
   * premise that is a window is seized or edge-anchored, never raced. The CLOCK is a separate
   * law, because a transition list persists and a frame does not.
   */
  function poseOf(popup: HTMLElement, backdrop: HTMLElement) {
    const rest = { transform: computed(popup, "transform"), dim: computed(backdrop, "opacity") };
    popup.setAttribute("data-starting-style", "");
    backdrop.setAttribute("data-starting-style", "");
    const start = { transform: computed(popup, "transform"), dim: computed(backdrop, "opacity") };
    popup.removeAttribute("data-starting-style");
    backdrop.removeAttribute("data-starting-style");
    return { rest, start };
  }

  it("each edge parks its panel behind the edge it comes from — one of its own boxes away", () => {
    // Its own box IS the distance, a length CSS already has, so the component measures nothing
    // and needs no runner (the Shell drawer's reading). Read as the panel's OWN box at each of
    // the three edges: one cell cannot tell "parked behind the edge it comes from" from "parked
    // below", which is the sentence this law's title makes.
    const cells = [
      { side: "bottom", x: 0, y: 1 },
      { side: "inline-start", x: -1, y: 0 },
      { side: "inline-end", x: 1, y: 0 },
    ] as const;
    for (const cell of cells) {
      const { popup, backdrop } = openSheet({}, { size: "2", side: cell.side });
      const { rest, start } = poseOf(popup, backdrop);
      expect(isIdentity(rest.transform), `${cell.side}: at rest it sits where it lands — ${rest.transform}`).toBe(true);
      const posed = start.transform.match(/matrix\(1, 0, 0, 1, (-?[\d.]+), (-?[\d.]+)\)/);
      expect(posed, `${cell.side}: the starting pose does not translate — ${start.transform}`).toBeTruthy();
      const box = popup.getBoundingClientRect();
      expect(parseFloat(posed![1]!), `${cell.side}: parked one box away on the inline axis`).toBeCloseTo(
        cell.x * box.width,
        0,
      );
      expect(parseFloat(posed![2]!), `${cell.side}: parked one box away on the block axis`).toBeCloseTo(
        cell.y * box.height,
        0,
      );
      expect(start.dim, `${cell.side}: the scrim starts undimmed`).toBe("0");
    }
  });

  it("the slide and its scrim are ONE clock — the drawer's, not the dialog's quick reveal", async () => {
    /**
     * The CLOCK, read as DECLARATIONS off a really-opened panel: a transition list, its duration
     * and its easing persist, so they are as true on a starved machine as on an idle one, which
     * is what keeps this law off `watchesFrames` while the claim stays real.
     *
     * `defaultOpen` cannot answer it — Base UI writes `transition: none` inline on a panel that
     * opens on mount, so a sabotage of the clock would survive (Dialog's own 2026-08-21 fixture
     * finding) — and `inMotion()` is what lets any clock exist at all, since the harness pins
     * every transition still by default.
     */
    inMotion();
    const { popup, backdrop } = await openByPress();
    expect(computed(popup, "transition-property"), "the slide is a transform").toContain("transform");
    // DERIVED from the drawer token rather than pinned at 500ms: the CSS multiplies it by Base
    // UI's release strength, which rests at 1, so this is the whole expression at rest.
    expect(parseFloat(computed(popup, "transition-duration")) * 1000, "the drawer's clock").toBeCloseTo(
      parseFloat(computed(popup, "--motion-drawer")),
      0,
    );
    // §27's drawer sentence, measured: "one clock for the slide, the recession and the scrim".
    // The app going back and the panel coming in are one progress, which is the whole reason
    // this scrim does not take the dialog's quick reveal.
    expect(parseFloat(computed(backdrop, "transition-duration")), "the scrim rides the slide").toBeCloseTo(
      parseFloat(computed(popup, "transition-duration")),
      3,
    );
    // And the curve is the carried spring — an equality against the token, never a pasted
    // `linear()`: critically damped from rest, so a panel a screen's height long gathers and
    // settles rather than snapping to the middle and creeping.
    //
    // Compared by its STOPS rather than as a string, which is the family's own idiom (dialog,
    // alert) and which this law needed on its first run: Chrome normalises the opening `0` of a
    // `linear()` to `0 0%`, so a whitespace-stripped comparison failed on a curve that was
    // character-for-character the token it came from.
    const samples = (curve: string) =>
      curve
        .slice(curve.indexOf("(") + 1, curve.lastIndexOf(")"))
        .split(",")
        .map((stop) => stop.trim().split(/\s+/)[0]!);
    const easing = computed(popup, "transition-timing-function");
    expect(easing.startsWith("linear("), `geometry is physics, and a spring is a baked curve: ${easing}`).toBe(true);
    expect(samples(easing)).toEqual(samples(computed(popup, "--motion-spring-carried")));
  });

  it("under reduced motion it is simply there — no clock, and no pose to flash either", async () => {
    /**
     * BOTH halves, because either alone is satisfiable by the wrong code. With the clock stood
     * down the starting stamp is gone before any read can land, so deleting the POSE stand-down
     * leaves a duration-only law green — while the browser still paints one frame of a panel a
     * whole screen below where it belongs. And a pose-only law passes against a panel that never
     * moved because the harness was holding it still.
     *
     * `inMotion()` is what makes the first half real: the harness pins `transition: none` on
     * everything by default, so without it every duration reads 0 whatever the stylesheet says.
     * The positive control is the pair of laws above, which read a real clock and a real pose on
     * this same component with the setting off.
     */
    await asksForStillness();
    inMotion();
    const { popup, backdrop } = await openByPress();
    for (const el of [popup, backdrop]) {
      expect(
        computed(el, "transition-duration").split(",").every((d) => parseFloat(d) === 0),
        "no clock survives",
      ).toBe(true);
    }
    const { rest, start } = poseOf(popup, backdrop);
    expect(isIdentity(rest.transform), `at rest — ${rest.transform}`).toBe(true);
    expect(
      isIdentity(start.transform),
      `a sheet under stillness starts exactly where it lands — ${start.transform}`,
    ).toBe(true);
    expect(start.dim, "…and the app is already dimmed behind it").toBe("1");
  });
});
