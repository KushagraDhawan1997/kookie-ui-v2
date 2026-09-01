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
import { glint } from "../tokens/config.ts";

/** Signed distance to a rounded-rect border: negative inside, positive outside. */
function sdRoundedRect(x: number, y: number, w: number, h: number, r: number): number {
  const qx = Math.abs(x - w / 2) - (w / 2 - r);
  const qy = Math.abs(y - h / 2) - (h / 2 - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

/**
 * The same distance with a SUPERELLIPSE corner (2026-08-24, the glint's own need): the p-norm
 * replaces the Euclidean one in the corner region, so the contour follows the squircle the
 * pane actually renders (`corner-shape: squircle` is the classic |x|⁴ + |y|⁴ superellipse).
 * A p-norm is not a true metric — bands thin slightly on the diagonal — which the glint's own
 * feather absorbs and a displacement map would not: the LENS keeps the circular corner it was
 * judged with, and this exists because a band of LIGHT detaching from the lip at every corner
 * is visible in a way a bent backdrop's corner never was.
 */
function sdSuperRect(x: number, y: number, w: number, h: number, r: number, k: number): number {
  if (k === 2) return sdRoundedRect(x, y, w, h, r);
  const qx = Math.abs(x - w / 2) - (w / 2 - r);
  const qy = Math.abs(y - h / 2) - (h / 2 - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  const corner = Math.pow(Math.pow(ox, k) + Math.pow(oy, k), 1 / k);
  return corner + Math.min(Math.max(qx, qy), 0) - r;
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
  const P = tuning?.profileP ?? PROFILE_P;
  const u = 1 - t;
  const uP = Math.pow(u, P);
  const sign = tuning?.concave ? -1 : 1;
  return {
    height: Math.pow(Math.max(1 - uP, 0), PROFILE_Q),
    // The 0.04 floor is the shipped guard kept: at the lip the denominator goes to zero and
    // the slope with it would be an infinity the map cannot encode.
    slope:
      (sign * (P * PROFILE_Q * Math.pow(u, P - 1))) /
      Math.pow(Math.max(1 - uP, 0.04), 1 - PROFILE_Q),
  };
}

/* ── The bench seam (2026-08-24) ───────────────────────────────────────────────────────────
   The lens bench could only ever move `boost` and `fringe`, because those are attributes on
   filters that already exist — the lip's width, the depth behind it and the profile are baked
   into each map's pixels, so judging THEM meant editing this file and reloading. That cage is
   what kept the lab's locked refraction (2026-08-14: concave, wide bezel, IOR 2.4) from ever
   being judged in the package. `__retuneLens` is the bench's regeneration handle: it holds a
   multiplier set, bumps a serial that is part of every map's cache key, and asks every mounted
   lens to re-measure. It is a judging tool with the playground's own status — null in every
   app that never imports it, tree-shaken out with the bench — and nothing in the package calls
   it. Laws read the shipped constants, which this never mutates. */
export type LensTuning = {
  /** × on each rung's bezel width (and the glint band that rides it). */
  bezelX: number;
  /** × on each rung's glass depth. */
  thicknessX: number;
  /** overrides every rung's refraction index (null = the ladder's own). */
  ior: number | null;
  /** the surface profile's exponent (2 shipped; 4 is the old spike). */
  profileP: number;
  /** negate the slope — the lab's locked "diamond" profile. */
  concave: boolean;
  /** × on the glint band's width relative to the bezel. */
  glintBandX: number;
  /** the glint's feather exponent (higher = tighter to the lip). */
  glintFalloff: number;
  /** saturation of the backdrop the rim re-emits inside the filter (0 disables the stage). */
  rimSaturate: number;
  /** px of Gaussian blur applied INSIDE the filter, before displacement (0 = none). */
  preBlur: number;
};
let tuning: Partial<LensTuning> | null = null;
let tuningSerial = 0;
const remeasures = new Set<() => void>();

/**
 * The wake-up for the seal (see `target`): a `prefers-reduced-transparency` flip changes the
 * cascade with no resize to announce it, so every mounted lens re-measures and reads the new
 * answer — the gate itself stays in the stylesheet's computed values, never restated here.
 * The list is held in a module ref because an unreferenced MediaQueryList can be collected
 * with its listener still wanted. Lazy, so a server render never touches `matchMedia`.
 */
let sealMql: MediaQueryList | null = null;
function watchSeal(): void {
  if (sealMql || typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  sealMql = window.matchMedia("(prefers-reduced-transparency: reduce)");
  sealMql.addEventListener("change", () => {
    for (const cb of remeasures) cb();
  });
}
export function __retuneLens(next: Partial<LensTuning> | null): void {
  tuning = next;
  tuningSerial += 1;
  for (const cb of remeasures) cb();
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
 * then binary-searched until the rung lands on its target bend — the mechanism
 * `--accent-label` and the solved edges already use. Regular was deliberately the
 * old constant's strength to within 3%, so the DEFAULT rung kept exactly the lens that was
 * approved and gains only the band; thin steps down from it and thick steps up.
 *
 * `boost` is the sanctioned override of the physics, and 2026-08-23 is the eye pass it was
 * reserved for (Kushagra, on the ported lens: *"I need it to be more glassy! more refracting
 * light"*, then 2x bend and 3x fringe judged live on the preview's lens bench, then *"these
 * work"*). It is 2 on every rung — 4 was tried 2026-08-25 (the bench's bend dial at 2x)
 * and REVERTED the same day: at 4 every rung's displacement reaches far past the wash-out
 * clamp below, and sampling outside the element's own backdrop smeared a blue band along
 * the lip — worst on small controls, which are all lip (Kushagra: "text field isnt fixed
 * still... lets go back to what I had").
 *
 * IT HAD TO BE THE MULTIPLIER, and the earlier preference for buying strength with the model
 * instead does not survive the arithmetic. `physicalMap` clamps its returned bend at the bezel
 * — past that the displacement asks for pixels outside the element's own backdrop and washes
 * out — so the reachable bend on any rung is its lip's own width. Twice the judged targets is
 * 14.8 / 26.4 / 46.2px against bezels of 12 / 18 / 26: every rung is over its clamp, and no
 * `thickness` reaches them. Re-solving would have meant widening the lip too, which changes a
 * dimension nobody has judged and which the bench deliberately does not expose. `boost`
 * multiplies the filter's own `scale`, after the clamp, which is exactly what the bench moved.
 * The clamp's own law still holds, because it is stated on the physics.
 *
 * `fringe` is a straight 3x of the judged split. Its own note where the channels are built
 * used to say the three scales stay within ~8% "so the body stays registered"; at 30 they do
 * not, and the split at the lip is the thing that was asked for. Judged in the playground.
 * (A halving to 9/15/24 was tried and reverted 2026-08-25 — the blue band it chased came
 * from a 0.5px pre-blur, not the split; see the pre-blur note in `acquire`.)
 *
 * THE LIP NARROWED 4x ON 2026-08-27 (Kushagra, the bench's bezel dial at 0.25x: bezels
 * 12/18/26 → 3/4.5/6.5). What the bench renders at that dial is a SATURATED lens — each
 * rung's old thickness asks 11/20/34px of bend from a lip that can carry 3/4.5/6.5 — so
 * typing the multiplier verbatim would ship every rung ON its clamp, the exact thing the
 * "no rung saturates" law forbids. `thickness` is re-solved instead, each rung landing at
 * 97% of its own clamp (2.91/4.37/6.30px of bend): within 3% of the pixels that were
 * judged, and still a designed lens rather than whatever the clamp allowed. The glint band
 * rides the bezel and narrows with it, which the same dial also showed.
 */
export const lens: Record<LensThickness, LensParams> = {
  thin: { bezel: 3, thickness: 6.7, ior: 1.45, fringe: 18, boost: 2 },
  regular: { bezel: 4.5, thickness: 9.6, ior: 1.5, fringe: 30, boost: 2 },
  thick: { bezel: 6.5, thickness: 12.6, ior: 1.62, fringe: 48, boost: 2 },
};

/**
 * The rung a material bends at, or null for the two that never do. Asking the ladder is what
 * keeps those two spellings out of TWELVE call sites: every consumer used to hand this hook a
 * boolean it had assembled itself, and `shell` shipped one arm short of the others for
 * exactly as long as that was each caller's job.
 */
function rung(material: SurfaceMaterial): LensParams | null {
  if (material === "solid" || material === ON_GLASS) return null;
  const base = lens[material];
  if (!tuning) return base;
  // The bench's multipliers, applied over the shipped rung — 1.0 everywhere restores it.
  return {
    ...base,
    bezel: base.bezel * (tuning.bezelX ?? 1),
    thickness: base.thickness * (tuning.thicknessX ?? 1),
    ior: tuning.ior ?? base.ior,
  };
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
 * The bend, remembered against its EXACT argument. `bendAt` is the map's most expensive step
 * and it takes one varying input; a memo on the unrounded float returns the value the solve
 * would have returned, to the last bit — there is no approximation to judge. Keyed per rung
 * (the fitted bezel/thickness and the index) and per tuning serial, because the bench's
 * profile dials (`profileP`, `concave`) change `surface()` underneath the physics.
 */
const bendMemos = new Map<string, Map<number, number>>();
function bendMemo(bezel: number, thickness: number, ior: number): Map<number, number> {
  const key = `${bezel}|${thickness}|${ior}|${tuningSerial}`;
  let m = bendMemos.get(key);
  if (!m) {
    if (bendMemos.size > 16) bendMemos.clear();
    m = new Map();
    bendMemos.set(key, m);
  }
  return m;
}

/**
 * Which generator path each map took — read by the identity law's coverage guard, so a sweep
 * that only ever exercised the fallback cannot pass as a law about the general case. Not
 * public API: reachable from the module, never from the package index.
 */
export const __genPaths = { analytic: 0, banded: 0, glintAnalytic: 0, glintBanded: 0 };

/**
 * Build the displacement map for one box. Returns the data URL and the maximum bend in px,
 * which becomes the filter's `scale` — the strength is DERIVED from the physics, not chosen.
 *
 * ASSEMBLED, NOT SOLVED PER PIXEL (2026-08-24, the performance audit; byte-identity is a law).
 * The first generator walked every pixel and ran the Snell solve on each band pixel, and the
 * audit measured both halves of that as repetition: 86% of a card's map is visited and
 * discarded, and the solve takes ONE varying argument — depth into the bezel — so a card
 * asked it 17,924 times for 166 distinct answers (a zero-radius box: 18 answers, 952 times
 * each). Neither is an approximation to trade on: every pixel at one depth gets one bend
 * because that is what the model SAYS, and a pane's straight edges are a handful of depths
 * repeated down their length.
 *
 * So the map is assembled from what the geometry already shares, and every float still comes
 * out of the REAL functions at inputs that provably coincide — nothing is synthesised, which
 * is what makes byte-identity structural rather than lucky:
 *
 *   - the bend is memoised on its EXACT float argument (`bendMemo`): the same input returns
 *     the same value to the last bit. Keyed per rung and per tuning serial, because the
 *     bench's profile dials change `surface()` under it.
 *   - a straight edge realises one field value per depth, and it is read off ONE real SDF
 *     call at a representative pure coordinate: for every pure pixel of a row the x term
 *     loses `max(qx, qy)` (proved in the margin arithmetic below) and never reaches the
 *     result, so the representative's float IS every pixel's float. The finite-difference
 *     gradient on a pure span is (0, ±g) with gx exactly 0 — the two x-neighbours produce
 *     identical floats — so a whole row shares one rounded pixel value, written through a
 *     Uint32 fill.
 *   - the four corners are ONE quadrant solved per pixel and mirrored. Every coordinate
 *     quantity is a multiple of 0.5 far below 2^53, so mirrored inputs are IDENTICAL floats
 *     and the quadrant's outputs transfer exactly; each corner rounds its own bytes from the
 *     sign-flipped floats, because rounding first and flipping bytes is NOT exact at
 *     half-values (Math.round is half-up: 128.5 and 127.5 do not mirror).
 *   - the interior is the constant (128, 128, 0, 255), prefilled through a Uint32 view.
 *
 * A box whose corner zones meet — no pure span exists — takes the banded fallback: the same
 * per-pixel loop the map always ran, minus the interior (a row skips from the bezel to its
 * mirrored column; the field is monotone toward the centre, so the skip is exact) and minus
 * the redundant solves (same memo). Both paths are held byte-identical to the frozen
 * 2026-08-23 generator by refraction.browser.test.tsx, whose coverage guard also asserts the
 * sweep exercises BOTH — a sweep that only ever took the fallback would be a law about the
 * special case wearing the general one's name.
 */
export function physicalMap(w: number, h: number, r: number, p: LensParams): { url: string; max: number } {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { url: "", max: 0 };
  const img = ctx.createImageData(w, h);
  const fit = fitLens(p, Math.min(w, h));
  if (!fit) return { url: "", max: 0 };
  const { bezel, thickness } = fit;
  const memo = bendMemo(bezel, thickness, p.ior);
  const bend = (inside: number): number => {
    let v = memo.get(inside);
    if (v === undefined) {
      v = bendAt(inside / bezel, bezel, thickness, p.ior);
      memo.set(inside, v);
    }
    return v;
  };
  const data = img.data;
  // (128, 128, 0, 255) — straight through on both channels. Little-endian RGBA packs A<<24.
  new Uint32Array(data.buffer).fill(0xff008080);
  let maxAbs = 0;

  /**
   * The corner zone. `max(r, bezel)` is how far a corner's influence reaches along an edge —
   * past the arc (r) and past the reach of the perpendicular edge's own band (bezel, which can
   * exceed r) — and +3 covers the ±1px finite-difference reach with margin. Inside the zone
   * nothing is assumed; outside it, a pixel is PURE: its field value and gradient depend on one
   * edge alone, which is what the span fills below rely on.
   */
  const cz = Math.ceil(Math.max(r, bezel)) + 3;
  if (w - 2 * cz >= 1 && h - 2 * cz >= 1) {
    __genPaths.analytic += 1;
    // ── one corner quadrant, per pixel, exactly the loop the whole map used to run ──
    const cmag = new Float32Array(cz * cz);
    const cnx = new Float32Array(cz * cz);
    const cny = new Float32Array(cz * cz);
    const con = new Uint8Array(cz * cz);
    for (let y = 0; y < cz; y++) {
      for (let x = 0; x < cz; x++) {
        const inside = -sdRoundedRect(x + 0.5, y + 0.5, w, h, r);
        if (inside < 0 || inside > bezel) continue;
        const i = y * cz + x;
        const mag = bend(inside);
        const gx = sdRoundedRect(x + 1.5, y + 0.5, w, h, r) - sdRoundedRect(x - 0.5, y + 0.5, w, h, r);
        const gy = sdRoundedRect(x + 0.5, y + 1.5, w, h, r) - sdRoundedRect(x + 0.5, y - 0.5, w, h, r);
        const gl = Math.hypot(gx, gy) || 1;
        cmag[i] = mag;
        cnx[i] = gx / gl;
        cny[i] = gy / gl;
        con[i] = 1;
        const a = Math.abs(mag);
        if (a > maxAbs) maxAbs = a;
      }
    }
    // ── the spans' per-depth values, off the real field at a representative pure pixel ──
    const px = cz + 0.5;
    const sdRow = (yy: number): number => sdRoundedRect(px, yy + 0.5, w, h, r);
    type Span = { y: number; mag: number; ny: number };
    const rows: Span[] = [];
    for (let y = 0; ; y++) {
      const inside = -sdRow(y);
      if (inside > bezel) break;
      if (inside < 0) continue;
      const mag = bend(inside);
      const gy = sdRow(y + 1) - sdRow(y - 1);
      const gl = Math.hypot(0, gy) || 1;
      rows.push({ y, mag, ny: gy / gl });
      const a = Math.abs(mag);
      if (a > maxAbs) maxAbs = a;
    }
    const sdCol = (xx: number): number => sdRoundedRect(xx + 0.5, cz + 0.5, w, h, r);
    const cols: Span[] = [];
    for (let x = 0; ; x++) {
      const inside = -sdCol(x);
      if (inside > bezel) break;
      if (inside < 0) continue;
      const mag = bend(inside);
      const gx = sdCol(x + 1) - sdCol(x - 1);
      const gl = Math.hypot(gx, 0) || 1;
      cols.push({ y: x, mag, ny: gx / gl });
      const a = Math.abs(mag);
      if (a > maxAbs) maxAbs = a;
    }
    // ── write: corners from mirrored floats, spans as one value per depth ──
    const u32 = new Uint32Array(data.buffer);
    for (let y = 0; y < cz; y++) {
      for (let x = 0; x < cz; x++) {
        const i = y * cz + x;
        if (!con[i]) continue;
        const m = maxAbs > 0 ? (cmag[i] as number) / maxAbs : 0;
        const nx = cnx[i] as number;
        const ny = cny[i] as number;
        const xr = w - 1 - x;
        const yb = h - 1 - y;
        let j = (y * w + x) * 4;
        data[j] = Math.round(128 + nx * m * 127);
        data[j + 1] = Math.round(128 + ny * m * 127);
        data[j + 2] = 0;
        data[j + 3] = 255;
        j = (y * w + xr) * 4;
        data[j] = Math.round(128 - nx * m * 127);
        data[j + 1] = Math.round(128 + ny * m * 127);
        data[j + 2] = 0;
        data[j + 3] = 255;
        j = (yb * w + x) * 4;
        data[j] = Math.round(128 + nx * m * 127);
        data[j + 1] = Math.round(128 - ny * m * 127);
        data[j + 2] = 0;
        data[j + 3] = 255;
        j = (yb * w + xr) * 4;
        data[j] = Math.round(128 - nx * m * 127);
        data[j + 1] = Math.round(128 - ny * m * 127);
        data[j + 2] = 0;
        data[j + 3] = 255;
      }
    }
    for (const { y, mag, ny } of rows) {
      const m = maxAbs > 0 ? mag / maxAbs : 0;
      const gTop = Math.round(128 + ny * m * 127);
      const gBot = Math.round(128 - ny * m * 127);
      const top = (0xff000000 | (gTop << 8) | 128) >>> 0;
      const bot = (0xff000000 | (gBot << 8) | 128) >>> 0;
      u32.fill(top, y * w + cz, y * w + w - cz);
      u32.fill(bot, (h - 1 - y) * w + cz, (h - 1 - y) * w + w - cz);
    }
    for (const { y: x, mag, ny: nx } of cols) {
      const m = maxAbs > 0 ? mag / maxAbs : 0;
      const rL = Math.round(128 + nx * m * 127);
      const rR = Math.round(128 - nx * m * 127);
      const left = (0xff000000 | (128 << 8) | rL) >>> 0;
      const right = (0xff000000 | (128 << 8) | rR) >>> 0;
      const xr = w - 1 - x;
      for (let y = cz; y < h - cz; y++) {
        u32[y * w + x] = left;
        u32[y * w + xr] = right;
      }
    }
  } else {
    __genPaths.banded += 1;
    // ── the banded fallback: the original loop minus the interior and the redundant solves ──
    const mags = new Float32Array(w * h);
    const nxs = new Float32Array(w * h);
    const nys = new Float32Array(w * h);
    const rowC = [new Float64Array(w), new Float64Array(w), new Float64Array(w)];
    const rowM = [new Uint8Array(w), new Uint8Array(w), new Uint8Array(w)];
    // One row of centre samples: scan in until the field leaves the bezel, then jump to the
    // mirrored column — the field is monotone toward the centre, so the jump is exact.
    const scan = (y: number, out: Float64Array, mark: Uint8Array): void => {
      mark.fill(0);
      let x = 0;
      for (; x < w; x++) {
        const v = sdRoundedRect(x + 0.5, y + 0.5, w, h, r);
        out[x] = v;
        mark[x] = 1;
        if (-v > bezel) break;
      }
      for (let x2 = Math.max(w - 1 - x, x); x2 < w; x2++) {
        out[x2] = sdRoundedRect(x2 + 0.5, y + 0.5, w, h, r);
        mark[x2] = 1;
      }
    };
    const at = (row: Float64Array, mk: Uint8Array, x: number, y: number): number =>
      x < 0 || x >= w
        ? sdRoundedRect(x + 0.5, y + 0.5, w, h, r)
        : mk[x]
          ? (row[x] as number)
          : sdRoundedRect(x + 0.5, y + 0.5, w, h, r);
    scan(-1, rowC[0]!, rowM[0]!);
    scan(0, rowC[1]!, rowM[1]!);
    for (let y = 0; y < h; y++) {
      scan(y + 1, rowC[2]!, rowM[2]!);
      const prev = rowC[0]!;
      const cur = rowC[1]!;
      const next = rowC[2]!;
      const mp = rowM[0]!;
      const mc = rowM[1]!;
      const mn = rowM[2]!;
      for (let x = 0; x < w; x++) {
        if (!mc[x]) continue;
        const inside = -(cur[x] as number);
        if (inside < 0 || inside > bezel) continue;
        const i = y * w + x;
        const mag = bend(inside);
        // The four gradient samples ARE the neighbours' centre samples — the rolling rows
        // make them free; out-of-row falls back to the real call, exactly as before.
        const gx = at(cur, mc, x + 1, y) - at(cur, mc, x - 1, y);
        const gy = at(next, mn, x, y + 1) - at(prev, mp, x, y - 1);
        const gl = Math.hypot(gx, gy) || 1;
        mags[i] = mag;
        nxs[i] = gx / gl;
        nys[i] = gy / gl;
        const a = Math.abs(mag);
        if (a > maxAbs) maxAbs = a;
      }
      rowC.push(rowC.shift()!);
      rowM.push(rowM.shift()!);
    }
    for (let i = 0; i < w * h; i++) {
      const m = maxAbs > 0 ? (mags[i] ?? 0) / maxAbs : 0;
      if (m === 0) continue; // the prefill already wrote (128, 128, 0, 255)
      const j = i * 4;
      data[j] = Math.round(128 + (nxs[i] ?? 0) * m * 127);
      data[j + 1] = Math.round(128 + (nys[i] ?? 0) * m * 127);
    }
  }
  ctx.putImageData(img, 0, 0);
  // Clamped at the bezel width: past that the displacement asks for pixels outside the
  // element's own backdrop, and the bend washes out instead of bending.
  return { url: canvas.toDataURL(), max: Math.min(maxAbs, bezel) };
}

/* ── The glint map: the band of light on the bezel (§10, 2026-08-24) ──────────────────────
   A colourless alpha mask — white where the bezel catches light, transparent everywhere else —
   consumed twice: as the mask of the pane's `::before` (whose background is the mode's own
   ring conic, so colour and intensity resolve at the element and an appearance flip needs no
   JS), and as the rim's clip inside the lens filter, where the displaced backdrop is
   re-emitted saturated (the edge catches the content's own colour). Unlike the lens it is a
   plain image, so it renders in every engine — Safari and Firefox get the specular even though
   they never get the bend. */
const glints = new Map<string, string>();

export function glintMap(w: number, h: number, r: number, band: number, falloff: number, k: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(w, h);
  const data = img.data;
  // Feather inward; the half-pixel coverage ramp at the lip is the outer anti-alias. One
  // rounded byte per field value — every float below comes from the real SDF, so pixels that
  // share a depth share a byte and a span is a Uint32 fill (physicalMap's argument, one map
  // over; the p-norm corner only differs from the circular one where both outside terms are
  // live, which is precisely the corner zone the quadrant loop owns).
  const alphaOf = (inside: number): number => {
    const t = Math.max(inside, 0) / band;
    const a = Math.pow(1 - t, falloff) * Math.min(1, inside + 1);
    return Math.round(Math.max(0, Math.min(1, a)) * 255);
  };
  const cz = Math.ceil(Math.max(r, band)) + 2;
  if (w - 2 * cz >= 1 && h - 2 * cz >= 1) {
    __genPaths.glintAnalytic += 1;
    const u32 = new Uint32Array(data.buffer);
    // ── one corner quadrant, mirrored as BYTES — an alpha has no sign to flip ──
    for (let y = 0; y < cz; y++) {
      for (let x = 0; x < cz; x++) {
        const inside = -sdSuperRect(x + 0.5, y + 0.5, w, h, r, k);
        if (inside < -0.5 || inside > band) continue;
        const v = ((alphaOf(inside) << 24) | 0x00ffffff) >>> 0;
        const xr = w - 1 - x;
        const yb = h - 1 - y;
        u32[y * w + x] = v;
        u32[y * w + xr] = v;
        u32[yb * w + x] = v;
        u32[yb * w + xr] = v;
      }
    }
    // ── spans: one field value per depth, read at a representative pure pixel ──
    const px = cz + 0.5;
    for (let y = 0; ; y++) {
      const inside = -sdSuperRect(px, y + 0.5, w, h, r, k);
      if (inside > band) break;
      if (inside < -0.5) continue;
      const v = ((alphaOf(inside) << 24) | 0x00ffffff) >>> 0;
      u32.fill(v, y * w + cz, y * w + w - cz);
      u32.fill(v, (h - 1 - y) * w + cz, (h - 1 - y) * w + w - cz);
    }
    for (let x = 0; ; x++) {
      const inside = -sdSuperRect(x + 0.5, cz + 0.5, w, h, r, k);
      if (inside > band) break;
      if (inside < -0.5) continue;
      const v = ((alphaOf(inside) << 24) | 0x00ffffff) >>> 0;
      const xr = w - 1 - x;
      for (let y = cz; y < h - cz; y++) {
        u32[y * w + x] = v;
        u32[y * w + xr] = v;
      }
    }
  } else {
    __genPaths.glintBanded += 1;
    // ── the banded fallback: scan in, jump the interior to the mirrored column ──
    for (let y = 0; y < h; y++) {
      let x = 0;
      for (; x < w; x++) {
        const inside = -sdSuperRect(x + 0.5, y + 0.5, w, h, r, k);
        if (inside > band) break;
        if (inside < -0.5) continue;
        const i = (y * w + x) * 4;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = alphaOf(inside);
      }
      for (let x2 = Math.max(w - 1 - x, x); x2 < w; x2++) {
        const inside = -sdSuperRect(x2 + 0.5, y + 0.5, w, h, r, k);
        if (inside < -0.5 || inside > band) continue;
        const i = (y * w + x2) * 4;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = alphaOf(inside);
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

/** Mint (or reuse) the glint mask for one box, in map pixels. The memo is dropped whole past
    a bound rather than LRU-tracked: distinct boxes on one page are few, and a data URL held
    by an element's own style survives the memo being emptied. */
function acquireGlint(w: number, h: number, r: number, band: number, k: number): string {
  const falloff = tuning?.glintFalloff ?? glint.falloff;
  const key = `${w}x${h}r${r}b${Math.round(band * 10)}f${falloff}k${k}z${tuningSerial}`;
  const hit = glints.get(key);
  if (hit) return hit;
  const url = glintMap(w, h, r, band, falloff, k);
  if (glints.size > 64) glints.clear();
  if (url) glints.set(key, url);
  return url;
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
function acquire(
  w: number,
  h: number,
  r: number,
  p: LensParams,
  fit: number,
  rim: { url: string; sat: number } | null,
): string | null {
  const key = `${w}x${h}r${r}z${fit}b${p.bezel}t${p.thickness}i${p.ior}f${p.fringe}s${p.boost}q${tuningSerial}rs${rim ? rim.sat : 0}`;
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
  /* The bench's pre-blur (kube's own order): frost applied BEFORE the displacement bends it,
     so the lens's edge stays crisp while the content softens — the stylesheet's chain blurs
     the bent result instead, softening the bend it paid for. Bench-only, and JUDGED OUT as a
     shipped default (0.5px shipped for an hour on 2026-08-25 and painted a blue band over a
     plain ground: a uniform backdrop shows no fringe at any bend, but the blur softens the
     backdrop's clip boundary into gradients, which the channel split then separates into
     colour — Kushagra: "still blue, lets go back"). At 0 the source passes through untouched
     and the shipped chain is byte-identical. */
  const pre = tuning?.preBlur ?? 0;
  const source = pre > 0 ? "presoft" : "SourceGraphic";
  if (pre > 0) {
    filter.appendChild(el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: pre, result: "presoft" }));
  }
  // Three displacements at different scales, one per channel, screened back together: the edge
  // splits light. The spread was ~8% when it was written, which kept the body registered as a
  // side effect rather than as a rule; the judged ladder runs 18 / 30 / 48 (2026-08-23), so the
  // outer channels sit up to half the bend either side of green. What keeps the body registered
  // is the bezel profile, not this number: the bend is ~0 by the lip's inner edge (a law), so
  // all three channels agree everywhere except the band where the split is the point.
  const keep = {
    R: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
    G: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
    B: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
  } as const;
  const scales = { R: base * (1 + spread), G: base, B: base * (1 - spread) } as const;
  for (const ch of ["R", "G", "B"] as const) {
    filter.appendChild(
      el("feDisplacementMap", {
        in: source,
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
  filter.appendChild(el("feBlend", { in: "rg", in2: "cB", mode: "screen", result: "body" }));
  /* THE RIM RE-EMITS THE BACKDROP (§10, 2026-08-24; kube.io's chain, credited): inside the
     glint band the bent backdrop is shown again, hyper-saturated and clipped to the band's own
     mask — so a red photograph's edge catches red, not only white. Over a neutral page the
     stage is invisible by construction (saturating grey is grey), which is exactly why the
     pigment ring exists (2026-08-24's own finding, from the other side). The white/pigment arc
     stays in the element's `::before`, where every engine gets it; this half lives in the lens
     because it needs the displaced result, which only the lens has. */
  if (rim && rim.sat > 0) {
    filter.appendChild(el("feImage", { href: rim.url, preserveAspectRatio: "none", result: "gmask" }));
    filter.appendChild(el("feColorMatrix", { in: "body", type: "saturate", values: rim.sat, result: "vivid" }));
    filter.appendChild(el("feComposite", { in: "vivid", in2: "gmask", operator: "in", result: "rim" }));
    filter.appendChild(el("feComposite", { in: "rim", in2: "body", operator: "over" }));
  }
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
    glint: boolean;
    retune: (() => void) | null;
    ro: ResizeObserver | null;
    flight: MutationObserver | null;
    /** The target box a flight has already been measured for — see `measureUnlessFlying`. */
    flightKey: string | null;
  }>({
    node: null,
    id: null,
    glint: false,
    retune: null,
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
        if (s.retune) remeasures.delete(s.retune);
        s.retune = null;
        if (s.id) release(s.id);
        if (s.id && s.node) s.node.style.removeProperty("--kui-lens");
        s.id = null;
        if (s.glint && s.node) {
          s.node.style.removeProperty("--kui-glint");
          s.node.style.removeProperty("--kui-glint-on");
        }
        s.glint = false;
      };

      detach();
      s.node = node;
      // Which piece of glass this is — or nothing at all. The rung itself re-resolves inside
      // every measure (the bench's multipliers land there); only the membership is fixed.
      if (!node || material === "solid" || material === ON_GLASS) return;
      /** The lens needs Chromium; the GLINT is a plain mask image and does not — Safari and
          Firefox render the specular even though they never render the bend, which is the
          first piece of the glass identity those engines have ever had. */
      const lensOK = lensSupported();
      watchSeal();

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
      const target = (): { w: number; h: number; r: number; k: number; sealed: boolean; ringDown: boolean; glinted: boolean } | null => {
        const rect = node.getBoundingClientRect();
        const cs = getComputedStyle(node);
        /**
         * THE CASCADE IS THE GATE; THE LISTENER BELOW IS ONLY A WAKE-UP (2026-08-24, the
         * performance audit). Under `prefers-reduced-transparency: reduce` every pane computes
         * `backdrop-filter: none` and stands its ring to zero — and this hook used to build
         * both maps, graft the filter and write `--kui-lens` anyway: ~16KB of images per pane
         * that nothing could ever sample, on the preference surfaces.css itself calls "an
         * accessibility requirement and a performance escape in one". The condition is
         * deliberately NOT restated here as a media query — the stylesheet is its one home —
         * so this reads the cascade's answer off the element: SEALED is an engine that could
         * glass (`lensSupported`) whose computed backdrop-filter is nonetheless `none`. The
         * glint additionally requires the ring stood down, because an engine WITHOUT the lens
         * (Safari, Firefox) also computes `none` and its glint is the one piece of the glass
         * identity it has. High contrast is deliberately NOT a skip: it zeroes the ring's
         * opacity but keeps the filter, and a pane mounted under it must hold its mask for the
         * flip back — the app's own toggle writes `data-contrast` onto <html>, which no
         * resize, media event or render announces. Reduced transparency's flip IS announced
         * (`watchSeal`), which is exactly why it is the one condition safe to skip on.
         */
        const sealed = lensSupported() && cs.getPropertyValue("backdrop-filter") === "none";
        const ringDown = cs.getPropertyValue("--material-ring-opacity").trim() === "0";
        // The corner's exponent: `corner-shape: squircle` renders the classic |x|⁴ superellipse,
        // and the glint's contour must follow the corner the box actually paints — a band of
        // light detaching from the lip at every corner is what a circular mask over a squircle
        // clip would draw. corner-shape does not animate, so this is stable through a flight.
        const k = cs.getPropertyValue("corner-shape").includes("squircle") ? 4 : 2;
        /**
         * AND THE SAME GATE FOR THE MASK: IS THERE A LAYER TO PUT IT ON? (2026-08-26, the
         * ultracode audit — the seal repair's own sentence, reached by a second road.)
         *
         * The glint is a mask on a `::before` that the glint families declare (`.kui-surface`
         * in surfaces.css, `.kui-button` / `.kui-segmented` / `.kui-field` / `.kui-textarea`
         * in recipes.css). Chip is glass-capable too since it grew `backdrop` — and the atom
         * family declares no pseudo at all, so a `<Chip backdrop>` ran a full `glintMap`
         * ImageData pass, a `canvas.toDataURL()` PNG encode and a 645-character inline
         * `--kui-glint` write for a property with nowhere to land. Measured on a mounted chip
         * beside a mounted button: chip `::before` content `none`, mask-image `none`, glint
         * 645 chars; button `::before` content `""`, mask-image `url("data:image/png…")`.
         *
         * Read off the CASCADE, not off a class list, for the same reason the seal is: this
         * file may not own a second copy of which families paint what. `content` is the one
         * property that answers "does this pseudo exist" — every glint rule sets `content: ""`
         * on the same selector that installs the mask, so the two cannot drift apart in one
         * family without the other noticing. If a glint rule is ever written onto `::after`
         * instead, widen this read to both; the law below fails first, by name.
         */
        const glinted = getComputedStyle(node, "::before").content !== "none";
        const flight = node.closest("[data-unfurling]");
        // Only when the flying element IS this pane. A lens attached to something INSIDE a
        // flying panel has its own geometry and none of these numbers describe it.
        if (flight === node) {
          const w = parseFloat(node.style.getPropertyValue("--kui-fly-w"));
          const h = parseFloat(node.style.getPropertyValue("--kui-fly-h"));
          const r = parseFloat(node.style.getPropertyValue("--kui-fly-r"));
          if (Number.isFinite(w) && Number.isFinite(h) && w >= 8 && h >= 8) {
            return { w, h, r: Number.isFinite(r) ? r : 0, k, sealed, ringDown, glinted };
          }
          // Published nothing readable — a reduced-motion open bails before writing these, and
          // a pane can carry the stamp for a frame before they land. Waiting is right: the old
          // behaviour, one frame later.
          return null;
        }
        if (rect.width < 8 || rect.height < 8) return null;
        return { w: rect.width, h: rect.height, r: parseFloat(cs.borderTopLeftRadius) || 0, k, sealed, ringDown, glinted };
      };

      const measure = () => {
        const params = rung(material);
        if (!params) return;
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
        /* THE GLINT, before the lens: it is a plain mask image, so it lands in every engine
           and on every box the bezel fits — the lens's own support gate never withholds it. */
        const fit = fitLens(params, Math.min(box.w, box.h));
        const bandX = tuning?.glintBandX ?? glint.band;
        const sat = tuning?.rimSaturate ?? glint.rimSaturate;
        let glintUrl = "";
        // A sealed pane with its ring stood down shows the mask nowhere — see target() for why
        // BOTH conditions, and why high contrast alone never lands here. `box.glinted` is the
        // third way of showing it nowhere: no `::before` to carry it (the atom family). The
        // rim-saturate stage is the mask's OTHER consumer — it re-emits the displaced backdrop
        // through the same alpha inside the filter — so a bench run with `rimSaturate > 0`
        // still needs the map on a pane whose CSS would never sample it.
        if (fit && bandX > 0 && !(box.sealed && box.ringDown) && (box.glinted || sat > 0)) {
          const band = Math.max(1, fit.bezel * bandX * scale);
          glintUrl = acquireGlint(w, h, r, band, box.k);
        }
        if (glintUrl && fit) {
          node.style.setProperty("--kui-glint", `url("${glintUrl}")`);
          node.style.setProperty("--kui-glint-on", "1");
          // `--kui-glint-band` was written here too (the fitted bezel in CSS px, for the bare
          // textarea's flat-band gradients); the write left with its one consumer when
          // TextArea grew the wrapper (2026-08-25) and the approximation was deleted whole.
          s.glint = true;
        } else if (s.glint) {
          node.style.removeProperty("--kui-glint");
          node.style.removeProperty("--kui-glint-on");
          s.glint = false;
        }
        if (!lensOK || box.sealed) {
          // The flip INTO the seal reaches a pane that already wears a filter: give it back,
          // or the reference outlives everything that could ever sample it.
          if (s.id) {
            release(s.id);
            s.id = null;
            node.style.removeProperty("--kui-lens");
          }
          return;
        }
        const fitted: LensParams = {
          ...params,
          bezel: params.bezel * scale,
          thickness: params.thickness * scale,
        };
        const next = acquire(w, h, r, fitted, scale, glintUrl && sat > 0 ? { url: glintUrl, sat } : null);
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
      s.retune = measureUnlessFlying;
      remeasures.add(measureUnlessFlying);
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
