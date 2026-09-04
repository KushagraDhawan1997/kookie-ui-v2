/**
 * §10 — the map GENERATOR's laws (2026-08-24, the performance audit).
 *
 * The generator was rewritten that day from solve-every-pixel to assembly — the bend memoised
 * on its exact float argument, one corner quadrant mirrored, straight edges filled one value
 * per depth — on the strength of a measurement: 86% of a card's map was visited and discarded,
 * and the Snell solve was asked 17,924 times for 166 distinct answers. The claim that licensed
 * the rewrite is BYTE IDENTITY, and these laws are that claim.
 *
 * The oracle is the 2026-08-23 generator, frozen here verbatim: walk every pixel, solve every
 * band pixel, five SDF samples each. It imports the LIVE physics (`bendAt`, `fitLens`) on
 * purpose — a physics change must flow through oracle and shipped generator alike, because the
 * subject of this file is the ASSEMBLY, not the lens's shape (refraction.test.ts owns that).
 * The two SDF helpers are copied rather than shared: they are the geometry under test.
 *
 * Byte identity is asserted on the PNG data URL — the exact string the filter's feImage and
 * the element's mask consume — which is a pixel comparison with the encoder included. The
 * coverage guard then asserts the sweep exercised BOTH generator paths, in both maps: a sweep
 * that only ever took the fallback would be a law about the special case wearing the general
 * one's name (the 2026-08-20 degenerate-fixture rule).
 */
import { describe, expect, it } from "vitest";
import { cdp } from "@vitest/browser/context";

import { Chip } from "../components/chip/chip.tsx";
import { Button } from "../components/button/button.tsx";
import { Card } from "../components/card/card.tsx";
import { Theme } from "../theme/theme.tsx";
import { render, until } from "../test/browser.tsx";
import { glint } from "../tokens/config.ts";
import {
  __genPaths,
  bendAt,
  fitLens,
  glintMap,
  lens,
  cornerExponent,
  physicalMap,
  type LensParams,
  type LensThickness,
} from "./refraction.tsx";

/* ── the oracle: the 2026-08-23 generator, frozen ──────────────────────────────────────── */

function sd(x: number, y: number, w: number, h: number, r: number): number {
  const qx = Math.abs(x - w / 2) - (w / 2 - r);
  const qy = Math.abs(y - h / 2) - (h / 2 - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

function sdSuper(x: number, y: number, w: number, h: number, r: number, k: number): number {
  if (k === 2) return sd(x, y, w, h, r);
  const qx = Math.abs(x - w / 2) - (w / 2 - r);
  const qy = Math.abs(y - h / 2) - (h / 2 - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  const corner = Math.pow(Math.pow(ox, k) + Math.pow(oy, k), 1 / k);
  return corner + Math.min(Math.max(qx, qy), 0) - r;
}

function oracleMap(w: number, h: number, r: number, p: LensParams): { url: string; max: number } {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { url: "", max: 0 };
  const img = ctx.createImageData(w, h);
  const fit = fitLens(p, Math.min(w, h));
  if (!fit) return { url: "", max: 0 };
  const { bezel, thickness } = fit;
  const mags = new Float32Array(w * h);
  const nxs = new Float32Array(w * h);
  const nys = new Float32Array(w * h);
  let maxAbs = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const inside = -sd(x + 0.5, y + 0.5, w, h, r);
      if (inside < 0 || inside > bezel) continue;
      const mag = bendAt(inside / bezel, bezel, thickness, p.ior);
      const gx = sd(x + 1.5, y + 0.5, w, h, r) - sd(x - 0.5, y + 0.5, w, h, r);
      const gy = sd(x + 0.5, y + 1.5, w, h, r) - sd(x + 0.5, y - 0.5, w, h, r);
      const gl = Math.hypot(gx, gy) || 1;
      mags[i] = mag;
      nxs[i] = gx / gl;
      nys[i] = gy / gl;
      if (Math.abs(mag) > maxAbs) maxAbs = Math.abs(mag);
    }
  }
  for (let i = 0; i < w * h; i++) {
    const m = maxAbs > 0 ? (mags[i] ?? 0) / maxAbs : 0;
    img.data[i * 4] = Math.round(128 + (nxs[i] ?? 0) * m * 127);
    img.data[i * 4 + 1] = Math.round(128 + (nys[i] ?? 0) * m * 127);
    img.data[i * 4 + 2] = 0;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return { url: canvas.toDataURL(), max: Math.min(maxAbs, bezel) };
}

function oracleGlint(w: number, h: number, r: number, band: number, falloff: number, k: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const inside = -sdSuper(x + 0.5, y + 0.5, w, h, r, k);
      if (inside < -0.5 || inside > band) continue;
      const t = Math.max(inside, 0) / band;
      const a = Math.pow(1 - t, falloff) * Math.min(1, inside + 1);
      const i = (y * w + x) * 4;
      img.data[i] = 255;
      img.data[i + 1] = 255;
      img.data[i + 2] = 255;
      img.data[i + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

/* ── the sweep: shapes chosen so both paths and every regime appear ────────────────────────
   Small boxes clamp the bezel; r=0 squares have 18 distinct depths; r=half is a capsule whose
   corner zones meet (the fallback); 320 is the MAP_CAP edge; the rest are the real components'
   own map boxes (card, dialog, menu, button) read off mounted panes during the audit. */
const BOXES: [number, number, number][] = [
  [8, 8, 0],
  [9, 23, 4],
  [12, 40, 6],
  [24, 24, 4],
  [24, 24, 12],
  [32, 120, 16],
  [40, 200, 20],
  [56, 56, 28],
  [60, 320, 19],
  [120, 32, 16],
  [200, 40, 20],
  [238, 320, 22],
  [256, 256, 0],
  [300, 80, 40],
  [320, 224, 21],
  [320, 263, 18],
  [319, 317, 60],
  [320, 320, 160],
];
const RUNGS = Object.keys(lens) as LensThickness[];

describe("the assembled generator is byte-identical to the frozen 2026-08-23 oracle (§10)", () => {
  it("the displacement map: every box, every rung, to the last byte", () => {
    const before = { a: __genPaths.analytic, b: __genPaths.banded };
    for (const [w, h, r] of BOXES) {
      for (const rung of RUNGS) {
        const p = lens[rung];
        const ours = physicalMap(w, h, r, p);
        const ref = oracleMap(w, h, r, p);
        expect(ours.max, `max diverges at ${w}x${h} r${r} ${rung}`).toBe(ref.max);
        expect(ours.url === ref.url, `pixels diverge at ${w}x${h} r${r} ${rung}`).toBe(true);
      }
    }
    // The coverage guard: a sweep that never left one path proves nothing about the other.
    expect(__genPaths.analytic - before.a, "the sweep never took the analytic path").toBeGreaterThan(0);
    expect(__genPaths.banded - before.b, "the sweep never took the banded fallback").toBeGreaterThan(0);
  });

  it("the glint mask: every box, both corner exponents, two feathers, to the last byte", () => {
    const before = { a: __genPaths.glintAnalytic, b: __genPaths.glintBanded };
    for (const [w, h, r] of BOXES) {
      const fit = fitLens(lens.regular, Math.min(w, h));
      if (!fit) continue;
      const band = Math.max(1, fit.bezel * glint.band);
      for (const k of [2, 4]) {
        for (const falloff of [glint.falloff, 2.5]) {
          const ours = glintMap(w, h, r, band, falloff, k);
          const ref = oracleGlint(w, h, r, band, falloff, k);
          expect(ours === ref, `glint diverges at ${w}x${h} r${r} k${k} f${falloff}`).toBe(true);
        }
      }
    }
    expect(__genPaths.glintAnalytic - before.a, "the sweep never took the analytic path").toBeGreaterThan(0);
    expect(__genPaths.glintBanded - before.b, "the sweep never took the banded fallback").toBeGreaterThan(0);
  });

  it("a box with no room still answers empty, exactly as before", () => {
    // fitLens is null at 5px; the generator must return the empty result, not a degenerate map.
    expect(physicalMap(5, 5, 0, lens.regular)).toEqual({ url: "", max: 0 });
  });
});

/* ── the seal: under reduced transparency the hook builds NOTHING (§10, 2026-08-24) ──────
   surfaces.css calls the preference "an accessibility requirement and a performance escape in
   one", and until this law's subject existed only the CSS half of the escape did: the pane
   computed `backdrop-filter: none` while the hook still built both maps, grafted the filter
   and wrote the property — measured, ~16KB of images per pane that nothing could sample. The
   gate reads the CASCADE's computed answer (see target() in refraction.tsx), so this mounts a
   real pane under the real emulated preference and reads what the hook did, both directions:
   the flip back must REBUILD, because a preference is not a mount. */
const filterCount = (): number => document.querySelectorAll("svg[aria-hidden='true'] filter").length;
const rt = (on: boolean) =>
  cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: on ? "reduce" : "" }],
  });

describe("the seal stops the JavaScript, not only the CSS (§10)", () => {
  it("builds nothing under reduced transparency, rebuilds on the flip back, tears down on the flip in", async () => {
    try {
      await rt(true);
      const before = filterCount();
      const host = render(
        <Theme material="regular">
          <Card backdrop style={{ width: 431, height: 293 }}>
            sealed
          </Card>
        </Theme>,
      );
      const pane = host.querySelector<HTMLElement>(".kui-surface")!;
      // The premise, read off the cascade — if this fails, the fixture is not sealed and the
      // law would be vacuously green (the degenerate-fixture rule).
      expect(getComputedStyle(pane).backdropFilter, "the fixture is not actually sealed").toBe("none");
      expect(pane.style.getPropertyValue("--kui-lens"), "a sealed pane minted a lens").toBe("");
      expect(pane.style.getPropertyValue("--kui-glint"), "a sealed pane minted a glint").toBe("");
      expect(filterCount(), "a sealed pane installed a filter").toBe(before);

      // The flip back: the wake-up listener re-measures and the pane gains its glass.
      await rt(false);
      expect(await until(() => pane.style.getPropertyValue("--kui-lens") !== ""), "the flip back never rebuilt").toBe(true);
      expect(pane.style.getPropertyValue("--kui-glint")).not.toBe("");
      expect(filterCount()).toBe(before + 1);

      // And the flip in: the filter is given back, not stranded behind a sealed pane.
      await rt(true);
      expect(await until(() => pane.style.getPropertyValue("--kui-lens") === ""), "the flip in never tore down").toBe(true);
      expect(filterCount(), "the flip in leaked the filter").toBe(before);
    } finally {
      await cdp().send("Emulation.setEmulatedMedia", { features: [] });
    }
  });

  it("high contrast alone skips NOTHING — the negative control", async () => {
    /**
     * HC zeroes the ring's opacity but keeps the filter, and its flip can arrive by a route
     * nothing announces (the app's own toggle writes `data-contrast` onto <html>), so a pane
     * mounted under it must still hold its mask for the flip back. If this law starts
     * failing because someone widened the skip to `ringDown` alone, that person is about to
     * re-commit the hover-continues bug with an accessibility setting as the trigger.
     */
    try {
      await cdp().send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-contrast", value: "more" }],
      });
      const host = render(
        <Theme material="regular">
          <Card backdrop style={{ width: 433, height: 291 }}>
            contrast
          </Card>
        </Theme>,
      );
      const pane = host.querySelector<HTMLElement>(".kui-surface")!;
      expect(pane.style.getPropertyValue("--kui-lens"), "HC lost the lens").not.toBe("");
      expect(pane.style.getPropertyValue("--kui-glint"), "HC lost the glint mask").not.toBe("");
    } finally {
      await cdp().send("Emulation.setEmulatedMedia", { features: [] });
    }
  });
});


describe("a mask is minted only where something samples it (§10, 2026-08-26)", () => {
  /**
   * THE SEAL REPAIR'S OWN SENTENCE, REACHED BY A SECOND ROAD.
   *
   * The glint is a mask on a `::before`, and only five families declare one: `.kui-surface`
   * (surfaces.css) and `.kui-button` / `.kui-segmented` / `.kui-field` / `.kui-textarea`
   * (recipes.css). Chip became glass-capable when it grew `backdrop`, and the atom family
   * declares no pseudo at all — so every glass chip ran a `glintMap` ImageData pass, a
   * `canvas.toDataURL()` PNG encode and a 645-character inline write for a property with
   * nowhere to land. Measured before the fix, on one mount: chip `--kui-glint` 645 chars
   * with `::before` content `none` and mask-image `none`; button 1605 chars with content
   * `""` and mask-image `url("data:image/png…")`.
   *
   * The law is the biconditional, not the chip: a mask is written exactly where the cascade
   * has a layer to put it on. Removing the gate fails the chip arm; widening it to skip
   * everything fails the two sampling arms.
   */
  it("the atom family mints none, and the families that paint one still do", async () => {
    const host = render(
      <Theme material="regular">
        <Chip backdrop>New</Chip>
        <Button backdrop>Go</Button>
        <Card backdrop style={{ width: 320, height: 200 }}>
          pane
        </Card>
      </Theme>,
    );
    const chip = host.querySelector<HTMLElement>(".kui-chip")!;
    const button = host.querySelector<HTMLElement>(".kui-button")!;
    const pane = host.querySelector<HTMLElement>(".kui-surface")!;

    // THE CALIBRATION, and it is the whole fixture. `useMaterial` resolves ON_GLASS inside a
    // pane and `solid` outside a region, and the hook returns early for both — so a chip that
    // is not really glass would satisfy this law with the gate deleted. Measured while writing
    // it: the first fixture put the chip INSIDE the glass Card and read `data-material:
    // "on-glass"`, glint 0, from code that had not been changed yet.
    expect(chip.getAttribute("data-material"), "the chip is not glass — the fixture is the defect").toBe("regular");
    expect(getComputedStyle(chip).backdropFilter, "the chip resolved no material chain").not.toBe("none");

    expect(await until(() => pane.style.getPropertyValue("--kui-glint") !== ""), "the pane never measured").toBe(true);

    for (const [name, el] of [["pane", pane], ["button", button]] as const) {
      expect(getComputedStyle(el, "::before").content, `${name} has no ::before to sample a mask`).not.toBe("none");
      expect(el.style.getPropertyValue("--kui-glint"), `${name} lost its glint`).not.toBe("");
      expect(getComputedStyle(el, "::before").maskImage, `${name}'s band is not masked`).toMatch(/^url\("data:image\/png/);
    }

    expect(getComputedStyle(chip, "::before").content, "the atom family grew a ::before — widen the gate, do not delete it").toBe("none");
    expect(
      chip.style.getPropertyValue("--kui-glint"),
      "a glass chip minted a mask no rule can sample — a canvas pass and a PNG encode for nothing",
    ).toBe("");
    expect(chip.style.getPropertyValue("--kui-glint-on"), "the chip switched a band on that it cannot paint").toBe("");
  });
});

/* ── the bend follows the corner the box PAINTS (§10, 2026-09-05) ────────────────────────────
   Kushagra, on a glass command palette: *"I suddenly see a second circle inside, near corners,
   we fixed it once, why is it back."* Half right, and the half that is wrong is the interesting
   one — what was fixed on 2026-08-24 was the GLINT, whose mask took the superellipse; the LENS
   was left circular on purpose, under a sentence claiming a bent backdrop's corner is not
   visible the way a band of light is.

   That sentence was never measured, and the arithmetic refutes it. On the 45° diagonal a circle
   of radius R sits 0.293R in from the box corner and the squircle it stands in for sits 0.159R,
   so the two contours part by 0.134R — 5-8px at the card band, where the trade was judged and
   where the feather really does absorb it, and 10.4px at the OVERLAY band, which is a second
   arc curving inside the corner. Confirmed by removing this one filter from a mounted palette
   and watching the arc go.

   THE LAW IS A RANKING, NOT A NUMBER, and it is read off the map the HOOK actually minted —
   the generator taking an exponent proves nothing about the pane handing it the right one,
   which is precisely the gap this defect lived in. Falsified by passing `2` at the call site. */
describe("the lens bends the corner the box paints, not a circle standing in for it", () => {
  /** The map the element's own filter samples, decoded to alpha-free displacement bytes. */
  async function mapOf(el: HTMLElement): Promise<{ px: ImageData; w: number; h: number } | null> {
    const id = el.style.getPropertyValue("--kui-lens").match(/#([\w-]+)/)?.[1];
    if (!id) return null;
    const href = document
      .getElementById(id)
      ?.querySelector("feImage")
      ?.getAttribute("href");
    if (!href?.startsWith("data:image")) return null;
    const img = new Image();
    img.src = href;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    return { px: ctx.getImageData(0, 0, img.width, img.height), w: img.width, h: img.height };
  }

  it("the bend's peak on the diagonal sits on the squircle's contour, not the circle's", async () => {
    /* A pane at the OVERLAY band, which is where the gap is biggest and where it was reported.
       A Card at the card band would be the degenerate fixture: 5px of divergence is inside the
       tolerance any reading of a feathered band needs. */
    const root = render(
      <Theme material="thick" appearance="dark">
        <Card size="4" backdrop style={{ inlineSize: "560px", blockSize: "160px" }}>
          pane
        </Card>
      </Theme>,
    );
    const el = root.querySelector<HTMLElement>(".kui-card")!;
    await until(() => el.style.getPropertyValue("--kui-lens").includes("#"), 4000);
    const cs = getComputedStyle(el);
    expect(cs.getPropertyValue("corner-shape"), "the fixture does not paint a squircle").toContain(
      "squircle",
    );

    const map = await mapOf(el);
    expect(map, "the filter carries no image — nothing to read").not.toBeNull();
    const { px, w, h } = map!;
    const rect = el.getBoundingClientRect();
    // The map is generated at a capped resolution and stretched, so distances are read in ITS
    // pixels: the painted radius crosses the same scale the generator used.
    const scale = Math.min(w / rect.width, h / rect.height);
    const R = parseFloat(cs.borderTopLeftRadius) * scale;
    expect(R, "the fixture has no corner to speak of").toBeGreaterThan(12);

    // Walk the 45° diagonal out of the top-left corner and find where the bend is strongest.
    // The red channel carries the x displacement, 128 being straight through.
    const at = (i: number) => Math.abs((px.data[(i * w + i) * 4] ?? 128) - 128);
    let peak = 0;
    let peakAt = 0;
    for (let i = 0; i < Math.min(w, h) / 2; i++) {
      if (at(i) > peak) {
        peak = at(i);
        peakAt = i;
      }
    }
    expect(peak, "the map bends nothing on the diagonal — the reading is vacuous").toBeGreaterThan(2);

    /* The two candidate contours, expressed in the SAME UNIT the walk above counts in — the
       step index along the diagonal, where step i is the pixel (i, i). The first spelling gave
       both of these a √2 because it was thinking in diagonal LENGTH, and the inflation is what
       made the law insensitive: it passed its own sabotage, because scaling both candidates
       apart from the measurement keeps the nearer one nearer. A ranking law has to state its
       two candidates in the measurement's units or it is comparing shapes, not places.

       Corner centre sits at (R, R). The circle meets the diagonal where i = R(1 − 1/√2); the
       superellipse |x|⁴+|y|⁴ = R⁴ meets it where i = R(1 − 2^(−1/4)). At R = 44 that is 12.9
       against 7.0 — a real distance in a map this size, which is the point. */
    const squircleAt = R * (1 - Math.pow(0.5, 1 / 4));
    const circleAt = R * (1 - Math.SQRT1_2);
    expect(
      Math.abs(peakAt - squircleAt) < Math.abs(peakAt - circleAt),
      `the bend peaks at ${peakAt}px on the diagonal — the squircle's lip is ${squircleAt.toFixed(1)} and a circle's ${circleAt.toFixed(1)}`,
    ).toBe(true);
  });

  it("and the exponent is what makes the two maps differ at all", () => {
    // The vacuity guard the ranking above needs: if the generator answered one map for both
    // corners, every clause up there would be true of a lens that ignores the box entirely.
    const p = lens.regular;
    const circular = physicalMap(320, 160, 64, p, 2);
    const squircular = physicalMap(320, 160, 64, p, 4);
    expect(circular.url, "the generator answers one map for both corners").not.toBe(squircular.url);
  });
});

/* ── the corner is PARSED, not keyword-matched (§10, 2026-09-05) ─────────────────────────────
   `corner-shape` takes both a keyword and the function the keyword IS — `squircle` is
   `superellipse(2)` — and which form `getComputedStyle` hands back is the engine's choice, not
   this package's. Chrome 151 answers the keyword for both spellings, so the shipped
   `.includes("squircle")` was correct HERE and silently wrong on any engine that answers the
   functional form: the map still generates, it just describes a shape the box does not paint.
   That is the one-way failure this reads for, and it cannot be caught by mounting a pane in the
   one engine the suite runs. */
describe("the corner exponent is read off any spelling of corner-shape", () => {
  it("every spelling of the same corner answers the same exponent", () => {
    for (const squircle of ["squircle", "superellipse(2)", "  SQUIRCLE  ", "superellipse( 2 )"]) {
      expect(cornerExponent(squircle), `${squircle} is not read as a squircle`).toBe(4);
    }
    for (const circle of ["round", "superellipse(1)", "", "initial", "bevel"]) {
      expect(cornerExponent(circle), `${circle} is not read as a circle`).toBe(2);
    }
  });

  it("and the engine's own answer for this box agrees with the parse", () => {
    // The half a table of strings cannot make: whatever THIS engine serialises, the parse has
    // to land on the exponent the box actually paints with.
    const el = document.createElement("div");
    el.style.cssText = "corner-shape: squircle; border-radius: 40px; width: 100px; height: 100px";
    document.body.appendChild(el);
    const answer = getComputedStyle(el).getPropertyValue("corner-shape");
    expect(answer, "the engine does not support corner-shape — the fixture proves nothing").not.toBe("");
    expect(cornerExponent(answer), `this engine says "${answer}" and the parse read a circle`).toBe(4);
    el.remove();
  });

  it("a shape the generator has no model for answers the circle it always generated", () => {
    // `scoop` is concave and `superellipse(-1)` is its functional form; the map has no model for
    // a corner that curves the other way, so the honest answer is the one that changes nothing.
    for (const odd of ["scoop", "superellipse(-1)", "superellipse(nonsense)", "notch"]) {
      expect(cornerExponent(odd), `${odd} bent the generator somewhere it cannot go`).toBe(2);
    }
  });
});
