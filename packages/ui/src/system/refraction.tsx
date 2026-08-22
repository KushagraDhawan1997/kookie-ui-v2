/**
 * §10 — REFRACTION: the lens half of the material, ported from the material lab 2026-08-16.
 *
 * The glass that shipped on 2026-08-16 is near-clear stone — blur 2.4/4/5.6, four to six
 * times sharper than what came before — and it is only legible because the bezel BENDS what
 * is behind it. Blur hides a backdrop; a lens re-states it. Porting the ladder without the
 * lens is what left §10's stated defence floor unmet at every rung, and it is the gap this
 * closes.
 *
 * THE MODEL (method from kube.io's "Liquid Glass in the Browser", credited; the mathematics
 * re-implemented here, not their code). The bezel is a curved glass surface. Each pixel's
 * bend follows Snell's law across it — air 1.0 into glass, 1.45 to 1.62 by rung — taken on
 * the surface's own slope, with direction the outward normal of a rounded-rect signed
 * distance field. Red
 * encodes the X bend, green the Y, 128 is straight through. The body of the pane stays true;
 * only the bezel lenses, hard at the lip and fading smoothly inward. R, G and B are displaced
 * at slightly different strengths and screened back together, so the edge splits light the
 * way real glass does.
 *
 * WHY THIS IS NOT "JS AT INTERACTION TIME" (§2's non-negotiable). A displacement map is an
 * image the size of the box it bends, so it cannot be a token: the pipeline emits values, and
 * this needs the element's resolved pixel geometry. The work happens on mount and on resize,
 * never on hover, press, focus or scroll — the same seam the floating layer already measures
 * its box on (`--kui-fly-w/h`). Nothing here runs while a pointer is moving.
 *
 * WHAT IT COSTS AND HOW THAT IS BOUNDED. One canvas pass per distinct box, memoised by
 * (w, h, radius, params) so a list of same-sized cards mints ONE filter, and the map is
 * generated at a capped resolution and stretched — the bend is a low-frequency field, so a
 * half-scale map is indistinguishable and a full-page pane costs the same as a small one.
 *
 * WHERE IT DOES NOT APPLY. SVG filters in `backdrop-filter` are Chromium-only. Everything
 * here is additive: the stylesheet's own chain (blur + saturate) is what a surface always
 * declares, and the lens is prepended through a custom property that defaults to EMPTY. A
 * browser without support never has the property set, so it keeps exactly the glass it has
 * today. This is checked at runtime rather than assumed, because `@supports` can parse a
 * value it will not render.
 */
import * as React from "react";

import type { Material } from "./axes.ts";
import { ON_GLASS, type SurfaceMaterial } from "../theme/theme.tsx";

/** Signed distance to a rounded-rect border: negative inside, positive outside. */
function sdRoundedRect(x: number, y: number, w: number, h: number, r: number): number {
  const qx = Math.abs(x - w / 2) - (w / 2 - r);
  const qy = Math.abs(y - h / 2) - (h / 2 - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

/**
 * The bezel's surface profile: height H(t) and slope H'(t), t running 0 at the lip to 1
 * interior. `squircle` is the lab's judged default — the profile that reads as a moulded
 * edge rather than a bead of water.
 *
 * THE EXPONENT WAS 4 AND THE BEND WAS A SPIKE (2026-08-23, measured). At P = 4 the profile
 * rises so fast that the whole lens lands in the first pixel of an eighteen-pixel lip: the
 * bend peaked 0.6px in from the edge and was down to 13% of that peak by the bezel's
 * midpoint and 2% by three quarters. So this file declared 18px of glass and rendered a hard
 * 2px line with a long dead tail — an EDGE TREATMENT, which is what "not glassy enough"
 * turned out to mean. At P = 2 the same physics holds 38% of the peak at the midpoint and
 * 17% at three quarters, and a pane reads as having a thickness rather than a lip. Nothing
 * was traded to buy it: same clamp, same cost, one exponent.
 *
 * H'(t) CARRIES ITS CONSTANT NOW. The slope is the analytic derivative of the height,
 * P*Q*u^(P-1) * (1-u^P)^(Q-1), and P*Q is exactly 1 at the old P = 4 / Q = 0.25 — which is
 * why the shipped spelling could drop the factor and still be right. It is 0.5 at P = 2, so
 * generalising the exponent without it would have quietly halved every slope and left
 * `thickness` no longer meaning a length. The rungs below are solved against this form.
 */
const PROFILE_P = 2;
const PROFILE_Q = 0.25;

function surface(t: number): { height: number; slope: number } {
  const u = 1 - t;
  const uP = Math.pow(u, PROFILE_P);
  return {
    height: Math.pow(Math.max(1 - uP, 0), PROFILE_Q),
    // The 0.04 floor is the shipped guard kept: at the lip the denominator goes to zero and
    // the slope with it would be an infinity the map cannot encode.
    slope:
      (PROFILE_P * PROFILE_Q * Math.pow(u, PROFILE_P - 1)) /
      Math.pow(Math.max(1 - uP, 0.04), 1 - PROFILE_Q),
  };
}

/** The lens's shape, in config terms. Every number is judged, none is derived from taste
    at a call site — a consumer never sees these. */
export type LensParams = {
  /** px of bezel: how far in from the lip the bend reaches. */
  bezel: number;
  /** px of glass the light crosses — the depth that sets how far it can shift. */
  thickness: number;
  /** air 1.0 → glass; the rungs run 1.45 to 1.62, deeper glass bending harder. */
  ior: number;
  /** % scale spread between the R and B channels: the chromatic split at the lip. */
  fringe: number;
  /** × past the derived strength — taste's one override of the physics. */
  boost: number;
};

/** The rungs that bend. `solid` is not a member — it is the seal, the absence of a
    material — and neither is `on-glass`, which declares no backdrop-filter to prepend to. */
export type LensThickness = Exclude<Material, "solid">;

/**
 * The lens LADDER, and the one place these live. Extracted 2026-08-16 from the approved lab
 * state, the same way the material ladder was; made a ladder 2026-08-23.
 *
 * It was ONE constant until then, which meant thin, regular and thick differed in blur, in
 * saturation and in veil alpha and bent their backdrop IDENTICALLY — the one axis where
 * glass most obviously owes a difference was the one axis the lens could not see. Each rung
 * is its own piece of glass now: a wider lip, more depth behind it, and a harder split at
 * the edge as the ladder climbs. The ladder stays monotone in every lever it owns, which is
 * the same rule the material recipes are held to and the same reason: thickness has to read
 * as ONE dimension.
 *
 * The numbers are SOLVED, not typed. `bezel` and `ior` are the judged shape; `thickness` is
 * then binary-searched until the rung lands on its target bend — 7.4 / 13.2 / 23.1px — the
 * mechanism `--accent-label` and the solved edges already use. Regular is deliberately the
 * old constant's strength to within 3%, so the DEFAULT rung keeps exactly the lens that was
 * approved and gains only the band; thin steps down from it and thick steps up.
 *
 * `boost` is the sanctioned override of the physics and stays 1 on every rung: this is
 * bought with the model rather than with a multiplier past it, which leaves the multiplier
 * where it was designed to be — the knob for the eye pass. v0, judged in the playground.
 */
export const lens: Record<LensThickness, LensParams> = {
  thin: { bezel: 12, thickness: 19, ior: 1.45, fringe: 6, boost: 1 },
  regular: { bezel: 18, thickness: 31, ior: 1.5, fringe: 10, boost: 1 },
  thick: { bezel: 26, thickness: 47, ior: 1.62, fringe: 16, boost: 1 },
};

/**
 * The rung a material bends at, or null for the two that never do. Asking the ladder is what
 * keeps those two spellings out of TWELVE call sites: every consumer used to hand this hook a
 * boolean it had assembled itself, and `shell` shipped one arm short of the others for
 * exactly as long as that was each caller's job.
 */
function rung(material: SurfaceMaterial): LensParams | null {
  return material === "solid" || material === ON_GLASS ? null : lens[material];
}

/** Maps are generated at most this wide/tall and stretched to the box. The bend is a
    low-frequency field, so this is invisible and it is what bounds the cost of a big pane. */
const MAP_CAP = 320;

/**
 * The lip a box has ROOM for, and the depth that goes with it — or null for a box with no
 * room at all.
 *
 * A CLAMPED LIP TAKES ITS DEPTH WITH IT (2026-08-23, measured). The bezel is bounded by the
 * box (half the short side is all the room a lip has) and `bendAt` divides the glass depth BY
 * that bezel, so a lip squeezed from 18px to 10px on a 24px control used to keep its full
 * depth and steepen the surface by exactly the ratio it lost. Measured on the shipped
 * constant: a 24px box asked for 15.4px of bend against a 10px clamp, so the lens saturated
 * and drew the maximum the box allowed rather than the lens it was asked for.
 *
 * That is survivable for one constant and fatal for a LADDER — two rungs both pinned to the
 * clamp are one lens — which is why it lands in the same change: at 24px, regular and thick
 * measured an identical 10.0px before and 7.2 / 8.9px after. Scaling the depth with the lip
 * holds the judged SLOPE at every box size, so a small pane bends less in pixels and the same
 * in proportion. It is the same lens, which is the argument `measure()` already makes one
 * scale down.
 */
export function fitLens(p: LensParams, shortSide: number): { bezel: number; thickness: number } | null {
  const bezel = Math.min(p.bezel, Math.floor(shortSide / 2) - 2);
  if (bezel <= 0) return null;
  return { bezel, thickness: p.thickness * (bezel / p.bezel) };
}

/**
 * The lateral shift in px at depth `t` through the bezel — Snell's law taken on the surface's
 * own slope, air into glass and back out over the depth below that point.
 *
 * Exported because the laws read THIS, not a copy of it. Re-deriving the intended value from
 * the same inputs the shipped formula uses is the shape that let nine defects through the
 * 2026-08-03 audit: such a law agrees with the code by construction and cannot fail.
 */
export function bendAt(t: number, bezel: number, thickness: number, ior: number): number {
  const { height, slope } = surface(t);
  // Geometric slope: the profile is `thickness` tall over `bezel` wide.
  const geo = (slope * thickness) / bezel;
  const theta1 = Math.atan(Math.abs(geo));
  const theta2 = Math.asin(Math.min(Math.sin(theta1) / ior, 1));
  // Lateral shift: the deviation over the glass depth below this point of the surface.
  return Math.sign(geo) * thickness * height * Math.tan(theta1 - theta2);
}

/**
 * Build the displacement map for one box. Returns the data URL and the maximum bend in px,
 * which becomes the filter's `scale` — the strength is DERIVED from the physics, not chosen.
 */
function physicalMap(w: number, h: number, r: number, p: LensParams): { url: string; max: number } {
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
      const inside = -sdRoundedRect(x + 0.5, y + 0.5, w, h, r); // > 0 inside
      if (inside < 0 || inside > bezel) continue;
      const mag = bendAt(inside / bezel, bezel, thickness, p.ior);
      const gx = sdRoundedRect(x + 1.5, y + 0.5, w, h, r) - sdRoundedRect(x - 0.5, y + 0.5, w, h, r);
      const gy = sdRoundedRect(x + 0.5, y + 1.5, w, h, r) - sdRoundedRect(x + 0.5, y - 0.5, w, h, r);
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
  // Clamped at the bezel width: past that the displacement asks for pixels outside the
  // element's own backdrop, and the bend washes out instead of bending.
  return { url: canvas.toDataURL(), max: Math.min(maxAbs, bezel) };
}

/* ── The filter registry: one <svg> for the document, one filter per distinct box ──────── */

let defs: SVGSVGElement | null = null;
const filters = new Map<string, { id: string; users: number }>();
let seq = 0;

function host(): SVGSVGElement {
  if (defs?.isConnected) return defs;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  // Out of flow and out of the a11y tree: this element exists only to be referenced.
  svg.style.position = "absolute";
  svg.style.width = "0";
  svg.style.height = "0";
  svg.style.overflow = "hidden";
  document.body.appendChild(svg);
  defs = svg;
  return svg;
}

const el = (name: string, attrs: Record<string, string | number>): SVGElement => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
};

/**
 * Mint (or reuse) the filter for one box and return its id.
 *
 * Chromium resolves a `url(#id)` reference ONCE and neither revives a reference that was
 * dead when it was applied nor watches a live filter's internals mutate — the lab proved
 * both — so a filter is never edited in place. A changed box mints a new id and the old one
 * is released.
 */
function acquire(w: number, h: number, r: number, p: LensParams, fit: number): string | null {
  const key = `${w}x${h}r${r}z${fit}b${p.bezel}t${p.thickness}i${p.ior}f${p.fringe}s${p.boost}`;
  const hit = filters.get(key);
  if (hit) {
    hit.users += 1;
    return hit.id;
  }
  const { url, max } = physicalMap(w, h, r, p);
  if (!url || max <= 0) return null;

  const id = `kui-lens-${(seq += 1)}`;
  // `max` comes back in MAP pixels and the displacement runs in user space, so a map
  // generated at a third of the box would bend a third as far. `fit` is the generation scale,
  // and this is where it is paid back. At or under the cap `fit` is 1 and this is the old
  // arithmetic exactly.
  const base = (max / fit) * p.boost;
  const spread = p.fringe / 100;
  /**
   * THE MAP IS STRETCHED TO THE BOX, and until 2026-08-23 it was not (found by the
   * floating-motion audit, measured three ways).
   *
   * `measure()` generates at a capped resolution, and this file said in three places that the
   * result is "stretched to the box". It never was: the `feImage` carried the map's own
   * generated size as its subregion, in px, and a filter primitive subregion PLACES an image at
   * that size — it does not scale it to the filtered element. So a 600x420 glass card minted a
   * 320x224 map and drew it in the top-left corner. Outside the subregion `in2` is transparent
   * black, which `feDisplacementMap` reads as 0 on both channels and applies as a uniform
   * half-scale shift — so the rest of the pane was not un-bent, it was flatly displaced, with a
   * measured ~3.1px seam down the middle of the box where the map ended, and the pane\'s real
   * right and bottom edges carrying no bend at all.
   *
   * The region is the border box now and the image fills it. `filterUnits` already defaults to
   * `objectBoundingBox`, so `0 0 100% 100%` states the element\'s own box; the primitive then
   * inherits the region, and no size is written in px anywhere — which is what makes this right
   * at every size rather than at one.
   *
   * `primitiveUnits` is deliberately NOT changed. It stays `userSpaceOnUse` so
   * `feDisplacementMap`\'s `scale` keeps meaning pixels: the strength is derived from the
   * physics and has to stay in the unit the physics is in.
   */
  const filter = el("filter", {
    id,
    colorInterpolationFilters: "sRGB",
    x: 0,
    y: 0,
    width: "100%",
    height: "100%",
  });
  filter.appendChild(el("feImage", { href: url, preserveAspectRatio: "none", result: "map" }));
  filter.appendChild(el("feGaussianBlur", { in: "map", stdDeviation: 3, result: "soft" }));
  // Three displacements at slightly different scales, one per channel, screened back
  // together: the edge splits light. Scales stay within ~8% so the body stays registered.
  const keep = {
    R: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
    G: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
    B: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
  } as const;
  const scales = { R: base * (1 + spread), G: base, B: base * (1 - spread) } as const;
  for (const ch of ["R", "G", "B"] as const) {
    filter.appendChild(
      el("feDisplacementMap", {
        in: "SourceGraphic",
        in2: "soft",
        scale: scales[ch],
        xChannelSelector: "R",
        yChannelSelector: "G",
        result: `d${ch}`,
      }),
    );
    filter.appendChild(el("feColorMatrix", { in: `d${ch}`, type: "matrix", values: keep[ch], result: `c${ch}` }));
  }
  filter.appendChild(el("feBlend", { in: "cR", in2: "cG", mode: "screen", result: "rg" }));
  filter.appendChild(el("feBlend", { in: "rg", in2: "cB", mode: "screen" }));
  host().appendChild(filter);
  filters.set(key, { id, users: 1 });
  return id;
}

function release(id: string): void {
  for (const [key, entry] of filters) {
    if (entry.id !== id) continue;
    entry.users -= 1;
    if (entry.users > 0) return;
    filters.delete(key);
    defs?.querySelector(`#${id}`)?.remove();
    return;
  }
}

/* ── Support: measured, never assumed ──────────────────────────────────────────────────── */

let supported: boolean | null = null;

/**
 * Whether this browser renders an SVG filter inside `backdrop-filter`. Chromium does;
 * Safari and Firefox do not, and Safari will PARSE the value it cannot render — which is
 * exactly why `CSS.supports` alone is not the test and why the lens is additive. `null`
 * until asked, so a server render never touches the DOM.
 */
export function lensSupported(): boolean {
  if (supported !== null) return supported;
  if (typeof window === "undefined" || typeof CSS === "undefined" || !CSS.supports) return false;
  // Both halves: the property must exist, and a url() must survive parsing in it. Firefox
  // rejects the second and so never gets here.
  //
  // The first spelling of this also required `"chrome" in window`, on the theory that the
  // parse test alone could be true in an engine that paints nothing. That guard was WRONG in
  // the direction that matters — it is false in headless Chromium, so the lens was disabled
  // in the one engine that renders it, which is how it was caught (zero filters on a page
  // with three glass panes). A sniff that fails closed in the browser it is meant to open is
  // worse than no sniff.
  //
  // WebKit is the open question and it is stated rather than guessed: it may parse this and
  // paint nothing, and because the seam is a var() substitution, an invalid computed value
  // takes the whole declaration with it — the usual two-declaration CSS fallback cannot
  // protect a var(), so that case would cost the blur too. Verify on a real Safari before
  // trusting it there; if it fails, the fix is to narrow this test, not to change the seam.
  supported =
    CSS.supports("backdrop-filter", "blur(1px)") && CSS.supports("backdrop-filter", "url(#a) blur(1px)");
  return supported;
}

/* ── The hook ──────────────────────────────────────────────────────────────────────────── */

/**
 * Attach a lens to one glass element.
 *
 * Returns a ref callback. The element is measured on mount and on resize; the matching
 * filter is minted and prepended to whatever `backdrop-filter` chain the stylesheet already
 * declares, through `--kui-lens`. When the material is `solid`, or the browser cannot render
 * the lens, the property is never set and the element keeps exactly the CSS it would have
 * had — there is no path here that can subtract glass.
 *
 * The radius is read off the element rather than passed: it is a token, it varies with the
 * radius axis and the size index, and the map must match the corner the box actually has.
 */
export function useLens(material: SurfaceMaterial): (node: HTMLElement | null) => void {
  const state = React.useRef<{
    node: HTMLElement | null;
    id: string | null;
    ro: ResizeObserver | null;
    flight: MutationObserver | null;
    /** The target box a flight has already been measured for — see `measureUnlessFlying`. */
    flightKey: string | null;
  }>({
    node: null,
    id: null,
    ro: null,
    flight: null,
    flightKey: null,
  });

  return React.useCallback(
    (node: HTMLElement | null) => {
      const s = state.current;
      if (s.node === node) return;

      const detach = () => {
        s.ro?.disconnect();
        s.ro = null;
        s.flight?.disconnect();
        s.flight = null;
        s.flightKey = null;
        if (s.id) release(s.id);
        if (s.id && s.node) s.node.style.removeProperty("--kui-lens");
        s.id = null;
      };

      detach();
      s.node = node;
      // The rung, resolved once: which piece of glass this is, or nothing at all.
      const params = rung(material);
      if (!node || !params || !lensSupported()) return;

      /**
       * The box the map is built for. Normally the element's own, and during a FLIGHT the box
       * the flight is heading to — which the runner publishes for exactly this reader
       * (`--kui-fly-w/-h/-r`, system/floating).
       *
       * A flying pane's own rect is the wrong box in two ways at once: it is a frame out of
       * date the moment the map is generated from it, and there are sixty of them. Its corner
       * is worse — mid-transition between the seed's and the panel's own — which is why the
       * runner reads that one un-posed and hands it over rather than leaving it to be guessed
       * from a moving element.
       */
      const target = (): { w: number; h: number; r: number } | null => {
        const rect = node.getBoundingClientRect();
        const cs = getComputedStyle(node);
        const flight = node.closest("[data-unfurling]");
        // Only when the flying element IS this pane. A lens attached to something INSIDE a
        // flying panel has its own geometry and none of these numbers describe it.
        if (flight === node) {
          const w = parseFloat(node.style.getPropertyValue("--kui-fly-w"));
          const h = parseFloat(node.style.getPropertyValue("--kui-fly-h"));
          const r = parseFloat(node.style.getPropertyValue("--kui-fly-r"));
          if (Number.isFinite(w) && Number.isFinite(h) && w >= 8 && h >= 8) {
            return { w, h, r: Number.isFinite(r) ? r : 0 };
          }
          // Published nothing readable — a reduced-motion open bails before writing these, and
          // a pane can carry the stamp for a frame before they land. Waiting is right: the old
          // behaviour, one frame later.
          return null;
        }
        if (rect.width < 8 || rect.height < 8) return null;
        return { w: rect.width, h: rect.height, r: parseFloat(cs.borderTopLeftRadius) || 0 };
      };

      const measure = () => {
        const box = target();
        if (!box) return;
        const rect = { width: box.w, height: box.h };
        // The map is generated at a capped resolution and stretched to the box — the bend is a
        // low-frequency field, so this bounds a full-page pane to a small pane's cost. The
        // stretch is the filter's job (see `acquire`); what is this function's job is that the
        // PHYSICS crosses the same scale, so a capped map still renders the judged lens.
        const scale = Math.min(1, MAP_CAP / Math.max(rect.width, rect.height));
        const w = Math.max(8, Math.round(rect.width * scale));
        const h = Math.max(8, Math.round(rect.height * scale));
        const r = Math.min(Math.round(box.r * scale), Math.floor(Math.min(w, h) / 2));
        /**
         * The bezel and the glass depth are LENGTHS, so they are drawn in the map's own pixels
         * and then stretched with it. Left unscaled, an 18px lip on a 320-wide map stretched
         * over a 600px pane renders at 33.75px, and wider again on a bigger one — the lens
         * would stop being the same lens at different sizes, which is precisely what the
         * judged values fix. Scaling them here means the lip is 18 CSS px on every pane, and at
         * or under the cap `scale` is 1 and these are the judged numbers untouched.
         */
        const fitted: LensParams = {
          ...params,
          bezel: params.bezel * scale,
          thickness: params.thickness * scale,
        };
        const next = acquire(w, h, r, fitted, scale);
        if (!next) return;
        // UNCONDITIONALLY, never `s.id !== next` (2026-08-22 audit). `measure()` runs once
        // directly below and the ResizeObserver then delivers its own initial record for the
        // same box, so `acquire` takes the cache-hit branch and puts `users` at 2 — and the
        // old guard skipped the release precisely because the id had not changed, so the
        // second reference was never given back. Measured: mounting and unmounting one glass
        // `<Card>` left one orphaned `<filter>` in the document, bounded by distinct box sizes
        // rather than by mounts. Releasing here is safe in the equal case by construction:
        // `acquire` has already incremented, so this decrements the count it just added.
        if (s.id) release(s.id);
        s.id = next;
        node.style.setProperty("--kui-lens", `url(#${next})`);
      };

      /**
       * NOT WHILE THE PANE IS FLYING (2026-08-22 audit) — the one gesture that resizes a pane
       * continuously.
       *
       * `refraction.tsx`'s own opening paragraph says this is built "on mount and resize, never
       * on hover, press, focus or scroll — the seam the floating layer already uses". That
       * sentence is true about hover and press and silent about the entry, and the entry
       * animates `inline-size` and `block-size` on the very element the lens is attached to. So
       * every frame was a distinct cache key, and every miss ran a per-pixel Snell solve over
       * up to 320x320, a `toDataURL` PNG encode of ~100k pixels, an eleven-node `<filter>`
       * grafted in, the previous one torn down and a fresh `--kui-lens` written — synchronously
       * inside the frame, after layout and before paint. Measured on one glass menu open: 27
       * distinct filters installed on a single panel. It also cannot look right while it does
       * it, because each map is generated for frame N's box and applied on frame N+1's, so the
       * bezel never matches the pane it is bending.
       *
       * A flight ends by taking its stamp off, which is a signal rather than a guess — so the
       * measurement is not skipped, it is DEFERRED to the seam. The `--kui-fly-*` strip at
       * release usually changes the box and would fire the ResizeObserver anyway; this makes
       * the one measurement certain in the case where the settled box happens to match.
       */
      const flying = () => !!node.closest("[data-unfurling]");
      /**
       * A pane that is flying is measured ONCE, from where it is going (see `target`), and the
       * frames in between are skipped — which is the 2026-08-22 deferral kept, with the wait
       * removed. That audit found 27 filters minted during one glass menu open, and its repair
       * was to build nothing until the flight ended; the cost of that was a panel arriving with
       * no refraction and gaining it in a single frame.
       *
       * Both are avoided by the same fact: while the flight runs, the target box does not
       * change, so the cache key does not either. The guard below is what makes that a promise
       * rather than a hope — `acquire` would return the same id on every frame anyway, but
       * reaching it costs a `getComputedStyle` and a map lookup sixty times over, and this file
       * is under the "no JS at interaction time" rule with the flight measurement as its one
       * named exception.
       */
      const measureUnlessFlying = () => {
        if (!flying()) {
          s.flightKey = null;
          return void measure();
        }
        const box = target();
        if (!box) return;
        const key = `${box.w}x${box.h}r${box.r}`;
        if (key === s.flightKey) return;
        s.flightKey = key;
        measure();
      };

      measureUnlessFlying();
      s.ro = new ResizeObserver(measureUnlessFlying);
      s.ro.observe(node);
      // The seam is still watched, and it is still a signal rather than a guess — but what it
      // now does is confirm: the settled box is the box the flight published, so this
      // measurement takes `acquire`'s cache-hit branch and the filter on the element does not
      // change. It stays because the equality is not guaranteed by construction — a panel whose
      // content changes size mid-flight would land somewhere else, and that case must not be
      // left wearing a map for a box it no longer has.
      s.flight = new MutationObserver(() => {
        if (!flying()) {
          s.flightKey = null;
          measure();
        }
      });
      s.flight.observe(node, { attributes: true, attributeFilter: ["data-unfurling"] });
    },
    [material],
  );
}

/**
 * The lens composed with whatever ref the caller passed — the one form every glass-capable
 * component uses, so none of them hand-rolls ref merging (eight copies of that is how the
 * `render` escape overwrote a target's ref, audit 2026-08-03).
 */
export function useLensRef<T extends HTMLElement>(
  material: SurfaceMaterial,
  forwarded: React.Ref<T> | undefined,
): (node: T | null) => void {
  const attach = useLens(material);
  return React.useCallback(
    (node: T | null) => {
      attach(node);
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) (forwarded as React.RefObject<T | null>).current = node;
    },
    [attach, forwarded],
  );
}
