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
import { userEvent } from "vitest/browser";

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
  until,
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
    /**
     * WIDENED 2026-08-26. The loop read exactly the three parts Base UI already sets
     * `role="presentation"` on itself (Root, Viewport, Content), so all three `role` props in
     * scroll-area.tsx could be deleted and this law stayed green — while the five parts where
     * the prop is genuinely load-bearing (two scrollbars, two thumbs, the corner) were read by
     * nothing. Those five were landing as roleless children of the host's role, which is the
     * regression this law is named after.
     */
    const root = await laidOut(
      mounted(
        <ScrollArea focusable={false} style={{ height: "80px", width: "120px" }}>
          <div style={{ height: "600px", width: "600px" }} />
        </ScrollArea>,
        { theme: {} },
      ),
    );
    const parts = [
      root,
      within(root, ".kui-scroll-viewport"),
      within(root, ".kui-scroll-content"),
      vbar(root),
      hbar(root),
      within(vbar(root), ".kui-scroll-thumb"),
      within(hbar(root), ".kui-scroll-thumb"),
      within(root, ".kui-scroll-corner"),
    ];
    // Vacuity: `within` throws on a miss, but the count is what says the bars really mounted.
    expect(parts.length).toBe(8);
    for (const el of parts) {
      expect(el.getAttribute("role"), `${el.className} carries no role`).toBe("presentation");
    }
  });

  it("`focusable` is the whole of that sentence: it strips the tab stop, or presentation is void", async () => {
    // ARIA voids `presentation` on ANY focusable element, so the law above is only TRUE of a
    // non-focusable viewport — which is the pair nothing here read. Both directions, because
    // "it has no tabindex" and "it has one" are indistinguishable from one arm.
    const inside = await laidOut(
      mounted(
        <ScrollArea focusable={false} style={{ height: "80px", width: "120px" }}>
          <div style={{ height: "600px", width: "600px" }} />
        </ScrollArea>,
        { theme: {} },
      ),
    );
    expect(within(inside, ".kui-scroll-viewport").hasAttribute("tabindex")).toBe(false);
    const standalone = await laidOut(mounted(overflowing, { theme: {} }));
    expect(within(standalone, ".kui-scroll-viewport").hasAttribute("tabindex")).toBe(true);
  });

  it("a standalone viewport is a tab stop, so it draws the SYSTEM's ring and can be named", async () => {
    /**
     * `focusable` defaults true and no stylesheet drew anything for it, so the one element
     * this component makes reachable by keyboard showed Chrome's own
     * `-webkit-focus-ring-color auto 1px` — a different colour, width and offset from every
     * other focus in the app. And it carried `role="presentation"` with no name, so what a
     * screen-reader user landed on announced as nothing at all.
     *
     * The ring is read as RESOLVED values against the ring tokens, not as "not none": `auto`
     * is a perfectly good non-none outline width, which is the assertion shape this repo
     * deleted from checkbox for exactly this reason (audit D9).
     */
    const root = await laidOut(
      mounted(
        <>
          <button type="button" data-testid="before">
            before
          </button>
          <ScrollArea aria-label="Build log" style={{ height: "80px", width: "120px" }}>
            <div style={{ height: "600px", width: "600px" }} />
          </ScrollArea>
        </>,
        { theme: {}, select: ".kui-scroll-area" },
      ),
    );
    const viewport = within(root, ".kui-scroll-viewport");
    // Named, and announced as a region rather than as a nameless generic node.
    expect(viewport.getAttribute("aria-label")).toBe("Build log");
    expect(viewport.getAttribute("role")).toBe("region");

    // ARRIVED AT BY KEYBOARD, not by `.focus()`. `:focus-visible` is the browser's own
    // modality heuristic and a script focus does not satisfy it (this repo's own instrument
    // finding, 2026-08-17: `el.focus()` does not make a BUTTON `:focus-visible` in Chrome), so
    // a law that focused programmatically would read the resting outline and assert nothing.
    // `getComputedStyle(el, ":focus-visible")` is not the way round it either — the second
    // argument takes a pseudo-ELEMENT, and a pseudo-class there answers the empty string.
    (root.previousElementSibling as HTMLElement).focus();
    await userEvent.keyboard("{Tab}");
    // Waited for, not asserted on the next line: a driver gesture resolving is not the browser
    // having settled (ENGINEERING §6), and `settling.test.ts` fails this shape at authoring
    // time. Nothing is lost — a tab that never arrives expires the deadline into the same
    // assertion, with the same value in the message.
    await until(() => document.activeElement === viewport);
    expect(document.activeElement, "the tab never reached the viewport").toBe(viewport);
    expect(viewport.matches(":focus-visible")).toBe(true);
    expect(computed(viewport, "outline-width")).toBe(tokenOn(root, "--focus-ring-width"));
    expect(computed(viewport, "outline-style")).toBe("solid");
    expect(computed(viewport, "outline-offset")).toBe(tokenOn(root, "--focus-ring-offset"));
    expect(computed(viewport, "outline-color")).toBe(colorOn(root, "var(--focus-ring)"));

    // The unnamed default stays structural: a landmark with no name is worse than none.
    const anonymous = await laidOut(mounted(overflowing, { theme: {} }));
    expect(within(anonymous, ".kui-scroll-viewport").getAttribute("role")).toBe("presentation");
  });
});

describe("a stated bound is definite wherever the scroller sits (2026-09-01)", () => {
  /* THE PROP'S OWN PROMISE, KEPT OUTSIDE A PANE (Kushagra: "how will a consumer get it right").

     `children` says a scroll region needs a bounded height and to state one here through
     `style`. With a `max-block-size` that was true only inside a pane: the root was a block
     box, so its height was `auto` with a clamp on it, and the viewport's `max-block-size: 100%`
     resolved against `auto` — which is `none`. The viewport took its CONTENT height, overflowed
     the clamp, and whatever box was above it clipped the result into something that looked
     bounded while nothing scrolled. A scroller directly inside a `.kui-surface` escaped, and
     only because `surfaces.css` gave it the flex column the viewport needs — so the promise held
     exactly where the caller had done nothing to earn it, and broke where they had.

     THE FIXTURE IS THE LAW. A definite `height` binds under BOTH spellings, and the shipped
     fixture above uses one — which is why 2,300 laws were green over this. The parent here is a
     plain block `<div>`, the bound is a `max-block-size`, and there is no surface anywhere: the
     one arrangement where a right implementation and a wrong one give different answers.

     Falsified by putting `display: block` back on `.kui-scroll-area`: the viewport measures 600
     inside an 80px root and `scrollHeight === clientHeight`, so both assertions fail. */
  const bounded = (
    <div>
      <ScrollArea style={{ maxBlockSize: "80px", width: "120px" }}>
        <div style={{ height: "600px", width: "60px" }} />
      </ScrollArea>
    </div>
  );

  it("a max-height on the root bounds the viewport, with no pane and no flex parent", async () => {
    const root = await laidOut(mounted(bounded, { theme: {} }));
    const area = within(root, ".kui-scroll-area");
    const viewport = within(area, ".kui-scroll-viewport");
    expect(area.getBoundingClientRect().height, "the root took its own bound").toBeLessThanOrEqual(80);
    expect(viewport.clientHeight, "the viewport grew past the bound").toBeLessThanOrEqual(80);
    expect(viewport.scrollHeight, "nothing scrolls, so the bound is a clip").toBeGreaterThan(
      viewport.clientHeight,
    );
  });

  it("and the bound is the caller's number, not one the component invented", async () => {
    // Vacuity: the assertions above are all "no bigger than", which a viewport of zero also
    // satisfies. This is the other side — the region is as tall as it was told to be.
    const root = await laidOut(mounted(bounded, { theme: {} }));
    const viewport = within(root, ".kui-scroll-viewport");
    expect(viewport.clientHeight).toBeGreaterThan(70);
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

/**
 * THE SCROLL-EDGE FADE (2026-08-29, opt-in): content dissolves toward any edge that has more
 * behind it. The mask is pure CSS over Base UI's per-edge overflow distances, so what these
 * laws read is the COMPUTED mask — the vars substituted to real pixel stops — which is the
 * mechanism's resolved output, per the standing rule. Every geometric claim below is stated
 * against the token (`--scrollbar-fade`), never a restated 32.
 */
describe("the scroll-edge fade (2026-08-29)", () => {
  const faded = (
    <ScrollArea fade aria-label="Faded" style={{ height: "120px", width: "160px" }}>
      <div style={{ height: "600px", width: "160px" }} />
    </ScrollArea>
  );
  /** The y layer of the computed mask, with its two inner stops. Chrome normalises
      `to bottom` away, so the y layer is the one with no direction keyword. */
  const yStops = (vp: HTMLElement) => {
    const layers = computed(vp, "mask-image").split("), linear-gradient(");
    const y = layers.find((l) => !l.includes("to right") && !l.includes("to left"));
    const stops = /rgb\(0, 0, 0\) (.+?), rgb\(0, 0, 0\) (.+?), rgba/.exec(y ?? "");
    return { start: stops?.[1], end: stops?.[2] };
  };

  it("without the prop there is no mask at all — the fade is opt-in", async () => {
    const root = await laidOut(mounted(overflowing, { theme: {} }));
    expect(computed(within(root, ".kui-scroll-viewport"), "mask-image")).toBe("none");
  });

  it("an edge fades only while content is hidden behind it, and the fade ramps in", async () => {
    const root = await laidOut(mounted(faded, { theme: {} }));
    const vp = within(root, ".kui-scroll-viewport");
    const fade = tokenOn(root, "--scrollbar-fade");
    expect(parseFloat(fade), "the token must be a real length").toBeGreaterThan(0);

    // At rest at the top: nothing is hidden above, so the start stop is 0 — the resting edge
    // is clean; plenty is hidden below, so the end stop holds the full designed fade.
    let stops = yStops(vp);
    expect(stops.start, "the resting top edge must not fade").toBe("0px");
    expect(stops.end, "the bottom edge must fade by the designed length").toBe(
      `calc(100% - ${fade})`,
    );
    expect(computed(vp, "mask-composite"), "a corner must fade both ways").toContain("intersect");

    // Ten pixels in: the fade IS the distance scrolled — the ramp, and the clamp's negative
    // control (without min() this would read the raw overflow distance).
    vp.scrollTop = 10;
    await laidOut(root);
    expect(yStops(vp).start).toBe("10px");

    // Past the ramp: clamped at the token. Without the min() this reads hundreds of px and
    // the whole viewport is fade — the sabotage this line was falsified with.
    vp.scrollTop = 200;
    await laidOut(root);
    stops = yStops(vp);
    expect(stops.start).toBe(fade);
    expect(stops.end).toBe(`calc(100% - ${fade})`);

    // At the bottom: the end edge is the clean one now.
    vp.scrollTop = 600;
    await laidOut(root);
    // Chrome simplifies calc(100% - 0px) to a plain 100%.
    expect(yStops(vp).end, "the settled bottom edge must not fade").toBe("100%");
  });

  it("content that does not overflow never fades — both stops sit at the edges", async () => {
    const root = await laidOut(
      mounted(
        <ScrollArea fade aria-label="Fits" style={{ height: "200px", width: "200px" }}>
          <div style={{ height: "40px" }}>fits</div>
        </ScrollArea>,
        { theme: {} },
      ),
    );
    const stops = yStops(within(root, ".kui-scroll-viewport"));
    expect(stops.start).toBe("0px");
    expect(stops.end).toBe("100%");
  });

  it("the x layer follows the writing direction — Base UI measures from the INLINE start", async () => {
    const root = await laidOut(mounted(faded, { theme: {} }));
    expect(computed(within(root, ".kui-scroll-viewport"), "mask-image")).toContain("to right");
    const rtl = await laidOut(
      mounted(<div dir="rtl">{faded}</div>, { theme: {}, select: ".kui-scroll-area" }),
    );
    expect(computed(within(rtl, ".kui-scroll-viewport"), "mask-image")).toContain("to left");
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
