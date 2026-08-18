/**
 * ScrollArea's laws, mounted (§8, §11, §12). Written to the 2026-08-03 standard: computed
 * values through a real <Theme>, both appearances where colour is the claim, and the cell
 * walk where the claim is that a number does NOT move.
 *
 * What this component claims, and therefore what is checkable here: the platform keeps the
 * scrolling and the system draws the bar; the bar is an OVERLAY — no track, no gutter, gone
 * at rest; the thumb is a capsule on the alpha ramp; nothing here rides an index.
 */
import { describe, expect, it } from "vitest";

import {
  APPEARANCES,
  asksForStillness,
  type Cell,
  colorOn,
  computed,
  forEachCell,
  inMotion,
  mounted,
  tokenOn,
  within,
} from "../../test/browser.tsx";
import { ScrollArea } from "./scroll-area.tsx";

/** A box short enough that its content genuinely overflows, so the bars have work to do. */
const overflowing = (
  <ScrollArea style={{ height: "80px", width: "120px" }}>
    <div style={{ height: "600px", width: "600px" }} />
  </ScrollArea>
);

/**
 * MEASURED, then drawn — this component's `settle`, and it is not optional.
 *
 * Base UI renders no scrollbar in the mount commit: it measures the viewport first and adds
 * the bars, the thumb extents and the overflow stamps on a later frame. A synchronous law
 * reads a ScrollArea that is a viewport and nothing else, which is how the first cut of this
 * file reported "no bar" twelve times over. Two frames, because the first is the measurement
 * and the second is the commit that carries it.
 */
const laidOut = async (root: HTMLElement): Promise<HTMLElement> => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return root;
};

const vbar = (root: HTMLElement) => within(root, '.kui-scrollbar[data-orientation="vertical"]');
const hbar = (root: HTMLElement) => within(root, '.kui-scrollbar[data-orientation="horizontal"]');

describe("the platform keeps the scrolling; the system only draws the bar (§13)", () => {
  it("the viewport is the scroll container, and the native bar is gone by BOTH spellings", async () => {
    const root = await laidOut(mounted(overflowing, { theme: {} }));
    const viewport = within(root, ".kui-scroll-viewport");
    // `scroll`, not the sheet's `auto`: Base UI writes overflow INLINE, so the stylesheet's
    // declaration never lands. Read as the resolved value rather than as the rule we wrote,
    // which is the difference between a law about this component and a law about our file.
    expect(computed(viewport, "overflow")).toBe("scroll");
    expect(computed(viewport, "scrollbar-width")).toBe("none");
    // The load-bearing half: the content overflows and the viewport gives up NO layout width
    // to a native bar. A UA bar would take ~15px here and clientWidth would fall short.
    expect(viewport.clientWidth).toBe(Math.round(viewport.getBoundingClientRect().width));
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
  });

  it("a bar exists for each axis that overflows, and for neither axis that does not", async () => {
    // Orientation really is the CONTENT's fact rather than a prop — which is what lets the
    // component take no orientation prop — but the mechanism is Base UI mounting the bar it
    // needs, not two inert bars waiting. Both directions asserted, because "always rendered"
    // and "rendered when needed" are indistinguishable from the overflowing case alone.
    const both = await laidOut(mounted(overflowing, { theme: {} }));
    expect(both.querySelectorAll(".kui-scrollbar")).toHaveLength(2);

    const neither = await laidOut(
      mounted(
        <ScrollArea style={{ height: "80px", width: "120px" }}>
          <div style={{ height: "10px", width: "10px" }} />
        </ScrollArea>,
        { theme: {} },
      ),
    );
    expect(neither.querySelectorAll(".kui-scrollbar")).toHaveLength(0);
  });

  it("the wrappers are presentational, so a bar inside a role-bearing panel adds no structure", async () => {
    const root = await laidOut(mounted(overflowing, { theme: {} }));
    for (const el of [root, within(root, ".kui-scroll-viewport"), within(root, ".kui-scroll-content")]) {
      expect(el.getAttribute("role")).toBe("presentation");
    }
  });
});

describe("the bar is an OVERLAY: no track, no gutter, gone at rest (§11)", () => {
  it("rests invisible and appears while scrolling — the paint is the whole state", async () => {
    const root = await laidOut(mounted(overflowing, { theme: {} }));
    const bar = vbar(root);
    expect(computed(bar, "opacity")).toBe("0");
    // The rule, not the library's timing: stamp what Base UI stamps and read what CSS does
    // with it. If the `:where([data-scrolling], [data-hovering])` arm is renamed, this is the
    // assertion that fails rather than a law that quietly reads 0 twice.
    bar.setAttribute("data-scrolling", "");
    expect(computed(bar, "opacity")).toBe("1");
    bar.removeAttribute("data-scrolling");
    bar.setAttribute("data-hovering", "");
    expect(computed(bar, "opacity")).toBe("1");
  });

  it("neither the bar nor the corner paints a track — an overlay meets nothing", async () => {
    const root = await laidOut(mounted(overflowing, { theme: {} }));
    for (const el of [vbar(root), hbar(root), within(root, ".kui-scroll-corner")]) {
      expect(computed(el, "background-color")).toBe("rgba(0, 0, 0, 0)");
      expect(computed(el, "background-image")).toBe("none");
      // No gutter either: a track would be the one thing here with a border.
      expect(computed(el, "border-top-width")).toBe("0px");
    }
  });

  it("it takes no layout room — the content is not narrowed by the bar drawn over it", async () => {
    const root = await laidOut(mounted(overflowing, { theme: {} }));
    const bar = vbar(root);
    expect(computed(bar, "position")).toBe("absolute");
    // The bar is drawn OVER the viewport, not beside it: its painted box lies inside the
    // viewport's own box on both edges. A gutter bar would sit outside that rect, and the
    // viewport would have given up the width to make room for it.
    const barBox = bar.getBoundingClientRect();
    const viewportBox = within(root, ".kui-scroll-viewport").getBoundingClientRect();
    expect(barBox.right).toBeLessThanOrEqual(viewportBox.right + 0.5);
    expect(barBox.left).toBeGreaterThanOrEqual(viewportBox.left - 0.5);
    expect(barBox.width).toBeGreaterThan(0);
  });
});

describe("every number is a token, and none of them rides an index (§4, §12)", () => {
  it("the bar's thickness and inset are the designed tokens, in both orientations", async () => {
    const root = await laidOut(mounted(overflowing, { theme: {} }));
    const size = tokenOn(root, "--scrollbar-size");
    const inset = tokenOn(root, "--scrollbar-inset");
    expect(computed(vbar(root), "width")).toBe(size);
    expect(computed(hbar(root), "height")).toBe(size);
    // The inset is read as a MARGIN, and that is the finding this law was written on
    // (2026-08-17): Base UI pins the bar with inline `top`/`bottom`/`inset-inline-end`, so
    // the same value spelled as an inset resolved to nothing and the bar sat flush in the
    // corner. Reading `right` here — the property the sheet USED to declare — is the version
    // of this law that passes while the bar is against the edge, because the inline `0px` is
    // a perfectly good computed value.
    expect(computed(vbar(root), "margin-right")).toBe(inset);
    expect(computed(hbar(root), "margin-bottom")).toBe(inset);
    // And it lands: the bar's painted box really does stand off the root's own edge.
    expect(root.getBoundingClientRect().right - vbar(root).getBoundingClientRect().right).toBeCloseTo(
      parseFloat(inset),
      1,
    );
  });

  it("the thumb is a capsule — half the bar, so the curve is stated rather than clamped (§6)", async () => {
    const root = await laidOut(mounted(overflowing, { theme: {} }));
    const thumb = within(vbar(root), ".kui-scroll-thumb");
    // `tokenOn`, not `numberOn`: the number probe resolves through `opacity`, which rejects a
    // length and answers a perfectly healthy `1` — the shape of instrument error this repo
    // keeps re-learning, and it would have priced the capsule at half a pixel here.
    const size = parseFloat(tokenOn(root, "--scrollbar-size"));
    expect(size).toBeGreaterThan(0);
    expect(parseFloat(computed(thumb, "border-top-left-radius"))).toBeCloseTo(size / 2, 2);
  });

  it("the thickness holds in all 24 cells — a scrollbar has no box of its own to index", async () => {
    // The refusal, measured (config: "Progress's sentence"). Density and pointer re-price
    // every control family; this one is deliberately outside both, and the fraction bug's
    // history in this repo is what makes "it does not move" worth a walk rather than a claim.
    const cells: Cell[] = [];
    forEachCell((cell) => cells.push(cell));
    expect(cells.length, "the cell walk measured nothing").toBe(24);
    const seen = new Set<string>();
    for (const { size, density, pointer } of cells) {
      const root = await laidOut(mounted(overflowing, { theme: { density, pointer } }));
      expect(size).toBeTruthy();
      seen.add(computed(vbar(root), "width"));
    }
    expect(seen.size, `the bar re-priced itself per cell: ${[...seen].join(", ")}`).toBe(1);
  });
});

describe("the thumb rides the alpha ramp, so one value reads on every bed (§7)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: rests on --scrollbar-thumb and darkens under the grip`, async () => {
      const root = await laidOut(mounted(overflowing, { theme: { appearance } }));
      const thumb = within(vbar(root), ".kui-scroll-thumb");
      expect(computed(thumb, "background-color")).toBe(colorOn(root, "var(--scrollbar-thumb)"));
      // The pressed pair is a designed step, not a mix invented in the sheet — and the two
      // must differ, or "darker under the grip" is a sentence with no pigment behind it.
      expect(colorOn(root, "var(--scrollbar-thumb-active)")).not.toBe(
        colorOn(root, "var(--scrollbar-thumb)"),
      );
    });
  }

  it("the fill is an ALPHA, which is the reason one value serves the page, a card and glass", async () => {
    // Read as a resolved colour with a real alpha channel rather than as the token's name:
    // a solid neutral step here would still satisfy every other law in this file and would
    // go invisible the moment the bar is drawn over something that is not the page.
    const root = await laidOut(mounted(overflowing, { theme: {} }));
    const value = colorOn(root, "var(--scrollbar-thumb)");
    // Two spellings, because Chrome answers this palette in `color(srgb r g b / a)` and the
    // rgba() form only where the value is already sRGB — an `rgba?\(` regex reports "opaque"
    // for a perfectly translucent colour, which is the calibration lesson this repo has now
    // paid for twice (the canvas fillStyle and the `display-p3` digit).
    const alpha = /\/\s*([\d.]+)\s*\)/.exec(value)?.[1] ?? /rgba\([^)]*,\s*([\d.]+)\s*\)/.exec(value)?.[1];
    expect(alpha, `--scrollbar-thumb is opaque: ${value}`).toBeDefined();
    expect(Number(alpha)).toBeLessThan(1);
    expect(Number(alpha)).toBeGreaterThan(0);
  });
});

describe("stillness reaches it too (§8)", () => {
  it("the fade is stood down when the OS asks — pure paint is not an exemption", async () => {
    // `inMotion()` first, or the negative control reads the HARNESS's own stillness rather
    // than the stylesheet's — the suite freezes every page by default, so "0s under reduced
    // motion" is a value this law would have read whether the guard existed or not.
    inMotion();
    const bar = vbar(await laidOut(mounted(overflowing, { theme: {} })));
    expect(computed(bar, "transition-duration")).not.toBe("0s");
    await asksForStillness();
    const still = vbar(await laidOut(mounted(overflowing, { theme: {} })));
    expect(computed(still, "transition-duration")).toBe("0s");
    // And in the lit arm too, which restates the duration and would otherwise survive the
    // guard on source order — the 2026-08-10 `:not()` lesson in its cheapest spelling.
    still.setAttribute("data-scrolling", "");
    expect(computed(still, "transition-duration")).toBe("0s");
  });
});
