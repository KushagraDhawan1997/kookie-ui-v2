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
