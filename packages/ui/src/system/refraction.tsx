/**
 * §10 — REFRACTION: the lens half of the material, ported from the material lab 2026-08-16.
 *
 * The glass that shipped on 2026-08-16 is near-clear stone — blur 2.4/4/5.6, four to six
 * times sharper than what came before — and it is only legible because the bezel BENDS what
 * is behind it. Blur hides a backdrop; a lens re-states it. Porting the ladder without the
 * lens is what left §10's stated defence floor unmet at every rung, and it is the gap this
 * closes.
 *
 * SINCE 2026-09-21 THE LENS CARRIES THE BLUR TOO (the mirror pass — see the note above `lens`).
 * The stylesheet's chain runs this filter FIRST, so any blur written after it softens the bend;
 * the blur is a primitive in here, on the source, in front of the displacement.
 *
 * THE MODEL (method from kube.io's "Liquid Glass in the Browser", credited; the mathematics
 * re-implemented here, not their code). The bezel is a curved glass surface. Each pixel's
 * bend follows Snell's law across it — air 1.0 into glass at 1.7 — taken on
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
 * never on hover, press, focus or scroll. Nothing here runs while a pointer is moving.
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
 * THE LENS TAKES IT TOO SINCE 2026-09-05, and the sentence that stood here was a measurement
 * nobody had made. It read: the lens keeps the circular corner it was judged with, because a
 * band of LIGHT detaching from the lip is visible in a way a bent backdrop's corner never was.
 * The second half is false, and it is false by ARITHMETIC rather than by taste — on the 45°
 * diagonal a circle of radius R sits 0.293R in from the box corner and the squircle it is
 * standing in for sits 0.159R, so the bend's contour parts from the paint by **0.134R** and
 * that number grows with the corner. At the card band it is 5-8px, which is where the trade
 * was judged and where the feather really does absorb it. At the OVERLAY band it is 10.4px
 * (measured on a command palette: 77.42px of painted radius), which renders as a second arc
 * curving inside the corner — reported as "a second circle inside, near corners" and confirmed
 * by removing this filter alone and watching it go.
 *
 * What survives of the old sentence is its own caveat: a p-norm is not a true metric, so bands
 * thin slightly on the diagonal. That is a real cost and it is the smaller one — a band a few
 * per cent thinner at 45° against a hard edge in the wrong place.
 *
 * `k === 2` short-circuits to the Euclidean form, so a box that does not paint a squircle
 * generates the byte-identical map it always did.
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
 * A BOX HAS FOUR CORNERS, and until 2026-09-12 both maps were built from one of them.
 *
 * The radius was read off `borderTopLeftRadius` alone and mirrored, which is exactly right for
 * every box this file had ever met: a card, a button, a field and a menu all round all four
 * corners the same way. SHEET is the first glass pane that does not — a bottom sheet is
 * 64.52/64.52/0/0, flush to the window's edge, and an inline-start sheet is 0 on the two edges
 * it is pinned to. So a sheet's square corners were handed curved light and curved bend, and an
 * inline-start sheet read r=0 and got a fully square map: no glint at all on the two corners it
 * actually paints. Both maps, both failures, one cause.
 *
 * The field is built PER QUADRANT. Inside the quadrant a corner owns, the distance to the box is
 * the distance to a rounded rect with that corner's radius everywhere — `sdSuperRect` is
 * symmetric in both axes, so restricting it to one quadrant is what makes this exact rather than
 * an approximation. The quadrant is decided by the pixel's own coordinate, so nothing has to be
 * stitched at the seams: along the centre lines the field depends on the edge alone and every
 * candidate radius answers the same number.
 *
 * A UNIFORM BOX MUST GENERATE THE MAP IT ALWAYS DID, to the byte, and that is a law
 * (refraction.browser.test.tsx's oracle, which passes a scalar). Two things make it hold rather
 * than nearly hold: `corners()` below widens a scalar to four equal numbers, so every SDF call
 * takes the same float it took before; and the corner loops solve each corner directly where
 * they used to solve one and mirror it. Mirroring was exact — a mirrored pixel centre is
 * `w - u` against `u`, and `|u - w/2|` is symmetric, so the input floats are identical and the
 * gradient is exactly negated — which is precisely why solving directly returns the same floats
 * and rounds the same bytes. The mirror is dropped rather than kept beside a second path,
 * because two generators for one map is how the two would drift.
 */
export type Corners = readonly [tl: number, tr: number, br: number, bl: number];

/** A scalar radius is the four-corner case where the four agree. */
function corners(r: number | Corners): Corners {
  return typeof r === "number" ? [r, r, r, r] : r;
}

/** Which corner owns this point, and the distance measured on ITS radius. */
function sdCorners(x: number, y: number, w: number, h: number, c: Corners, k: number): number {
  const right = x > w / 2;
  const bottom = y > h / 2;
  return sdSuperRect(x, y, w, h, c[bottom ? (right ? 2 : 3) : right ? 1 : 0], k);
}

/** Do all four agree? The fallback paths scan a row inward from each edge and then JUMP to the
    mirrored column, which is exact only while both ends of the row carry the same corner — so
    where they do not, the row is walked whole. It costs the mixed boxes a full scan and leaves
    the uniform ones byte-identical, which is the trade this file's identity law is about. */
function sameCorners(c: Corners): boolean {
  return c[0] === c[1] && c[1] === c[2] && c[2] === c[3];
}

/** Four corners across the map's generation scale, each capped at the half-side a radius can
    never exceed — the scalar line `measure()` used to write, once per corner. */
function scaleCorners(c: Corners, scale: number, w: number, h: number): Corners {
  const cap = Math.floor(Math.min(w, h) / 2);
  const at = (v: number): number => Math.min(Math.round(v * scale), cap);
  return [at(c[0]), at(c[1]), at(c[2]), at(c[3])];
}

/**
 * The superellipse exponent a computed `corner-shape` describes — 2 (a circle) for anything
 * this file cannot read, which is the value that generates the map it always generated.
 *
 * IT IS A PARSE AND NOT A KEYWORD MATCH, and the difference is a one-way failure (2026-09-05).
 * It shipped as `.includes("squircle") ? 4 : 2`, which is correct only while the engine
 * serialises the keyword it was given: `corner-shape` also takes `superellipse(<number>)`, the
 * keywords ARE that function (`squircle` is `superellipse(2)`, `round` is `superellipse(1)`),
 * and which form comes back out of `getComputedStyle` is the engine's choice rather than this
 * package's. Chrome 151 answers `squircle` for both spellings; an engine that answers the
 * functional form instead would send every squircle pane down the circular branch, and the
 * failure is SILENT — the map still generates, it just describes a shape the box does not
 * paint, which is the arc this whole mechanism exists to prevent.
 *
 * The CSS curvature parameter k is the log of the exponent: |x|^(2^k) + |y|^(2^k) = 1. Clamped
 * because a concave corner (`scoop`, negative k) is a shape this generator has no model for and
 * a huge exponent is a rectangle — both answer "as square as we go" rather than NaN.
 */
export function cornerExponent(value: string): number {
  const v = value.trim().toLowerCase();
  if (v.includes("squircle")) return 4;
  const fn = v.match(/superellipse\(\s*(-?[\d.]+)\s*\)/);
  if (fn) {
    const n = Math.pow(2, Number(fn[1]));
    return Number.isFinite(n) ? Math.min(Math.max(n, 2), 16) : 2;
  }
  if (v.includes("bevel") || v.includes("notch")) return 2;
  return 2;
}

/**
 * The bezel's surface profile: height H(t) and slope H'(t), t running 0 at the lip to 1
 * interior — a superellipse, H = (1 - u^P)^(1/P) with u = 1 - t. The exponent is the FAMILY's
 * (`LensParams.profile`, see `lensFamily`); this is the default.
 *
 * P = 4 CONCENTRATES THE BEND AT THE LIP, AND SINCE THE MIRROR PASS THAT IS THE LOOK. It went to 2
 * on 2026-08-23 because at 4 the whole lens landed in the first pixels of the lip and a pane read
 * as an edge treatment rather than a thickness — true while the bend peaked at one lip. With
 * `boost` carrying it past the lip (2026-09-21), a bend concentrated at the rim is what folds the
 * rim into a mirrored copy of what sits inside it, and a bend spread across the lip only
 * magnifies. It came back to 4 on 2026-09-22 and was judged there ("The bending was good before");
 * a first cut of the family model on circles (P = 2) bent a fifth as far and was reverted within
 * the hour. Panes and regions EASE to 3.
 *
 * H'(t) CARRIES ITS CONSTANT: the slope is the analytic derivative of the height,
 * P*Q*u^(P-1) * (1-u^P)^(Q-1) with Q = 1/P, so P*Q is 1 for every member — and it stays written,
 * because the bench's profile dial may set any P.
 */
const PROFILE_P = 4;
/** The bend points INWARD (2026-09-17) — see `lensFamily`. */
const CONCAVE = true;
/**
 * What a FLOATING pane blurs its backdrop by before the bend, in px (2026-09-21, Kushagra: dialogs
 * and the command palette "get the perfect look" because a blurry scrim sits behind them; "menus
 * and popover should have that"). A menu, select, popover or combobox has no scrim, so it carries a
 * little of that softening itself; no card, dialog or control does.
 *
 * PER RUNG (2026-09-23, Kushagra: "Even the blur needs to be less for thin, that should be part of
 * what changes with axis"): the rung is how much of the backdrop comes through, and the blur is
 * part of that. 3/5/8 at first, then 2/4/6, then 0 while the bend was judged alone, then 2 at every
 * rung, then this. A law holds the ceiling: never more than the scrim blurs. Keyed on
 * `kui-floating`, the class every anchored panel wears.
 */
export const floatingFrost: Record<LensThickness, number> = { thin: 0.75, regular: 2, thick: 3 };
/**
 * The most of a box's short side a lip may take (2026-09-21). The old bound was half the box,
 * which is all the room there is — and at the bend this ladder now carries, a lip that fills
 * the box leaves no flat middle: a 110px card at thick (44px lip) warped its whole body.
 * 0.28 leaves 44% of the short side unbent. It also bounds the sample: the bend peaks at
 * `boost` lips inward, and 2.2 × 0.28 = 0.62 of the short side, so an edge pixel never reads
 * past the far edge of its own box (a law holds the product under 1).
 *
 * The DEFAULT: a control takes the whole half (`lensFamily.control.lipShare`), because a control
 * is a dome — and its reach is 0.6 of a pane's, so its product is 0.66, under 1 by the same law.
 */
export const LIP_SHARE = 0.28;

function surface(t: number, profile?: number): { height: number; slope: number } {
  const P = tuning?.profileP ?? profile ?? PROFILE_P;
  const Q = 1 / P;
  const u = 1 - t;
  const uP = Math.pow(u, P);
  const sign = (tuning?.concave ?? CONCAVE) ? -1 : 1;
  return {
    height: Math.pow(Math.max(1 - uP, 0), Q),
    // The 0.04 floor is the shipped guard kept: at the lip the denominator goes to zero and
    // the slope with it would be an infinity the map cannot encode.
    slope:
      (sign * (P * Q * Math.pow(u, P - 1))) /
      Math.pow(Math.max(1 - uP, 0.04), 1 - Q),
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
  /** overrides every family's profile exponent (4 the default spike, 3 the panes' ease). */
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
  /** × on the REGION family's bezel and depth, over `bezelX`. */
  regionBezelX: number;
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
/**
 * Retune the glass lens at runtime and re-mint every mounted map. A development seam for judging
 * the material by eye, never an API.
 *
 * The dunder name is the fence: it is exported so the material bench at `/preview` can drive the
 * dials live, and nothing in the package or in a consumer's app may call it. Pass `null` to put
 * the judged configuration back.
 */
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
  /** air 1.0 → glass: 1.7 on every family. */
  ior: number;
  /** % scale spread between the R and B channels: the chromatic split at the lip. */
  fringe: number;
  /** × past the derived strength — taste's one override of the physics. */
  boost: number;
  /** px of blur applied to the SOURCE before the bend, inside the filter, so the lip stays crisp
      (2026-09-21, Kushagra: "the blur needs to be uniform, what is on the rim is good amount").
      Resolved per element by `measure()`, never by a family: a floating pane's `floatingFrost`,
      and nothing anywhere else. The families carried their own until 2026-09-23 (0.9 / 1.4 /
      2.2 in the mirror pass, then 0 while the bend was judged alone, and judged there), and
      with it went the rule that a control blurs by the share of its lip it has room for. */
  blur?: number;
  /** The side profile's superellipse exponent (4 the spike, 3 eased). Unset takes `PROFILE_P`. */
  profile?: number;
  /** The most of the box's short side the lip may take. Unset takes `LIP_SHARE`. */
  lipShare?: number;
};

/** The rungs that bend. `solid` is not a member — it is the seal, the absence of a
    material — and neither is `on-glass`, which declares no backdrop-filter to prepend to. */
export type LensThickness = Exclude<Material, "solid">;

/**
 * THE LENS IS THE COMPONENT'S, NOT THE RUNG'S (§10, 2026-09-23, Kushagra: "Controls and components
 * need different varying of refraction 'distance', not glass thickness"). The rung is how much of
 * the backdrop comes through (config `veil`); what BENDS is the shape of the piece of glass, and
 * that is a fact about what the thing is, so a theme at `thin` bends exactly as far as one at
 * `thick`. Until 2026-09-23 every rung was its own lens (a wider lip, more depth, a harder split as
 * the ladder climbed — the 2026-08-23 ladder), and the families were multipliers on it.
 *
 *   - control: a DOME. Seen from the side an icon button is a hemisphere, so its lip is the whole
 *     half of its short side (`lipShare` 0.5), and its reach is 0.6 of a pane's (2026-09-22:
 *     "controls ... dont need refraction to reach that inside").
 *   - rows (menu, select, combobox, the command list): the same curve on a wider lip, with its
 *     depth scaled so the gradient holds — so on a big box the bend sits near the edges. 18 at
 *     first, 22, then 30 ("menus should have a wider lip still").
 *   - pane (card, popover, dialog): the curve EASED — exponent 3 against the spike's 4 — so the
 *     bend runs further in and settles into the flat body gradually.
 *   - region (shell panes, sheet, composer): the pane's curve on twice its lip.
 *
 * EVERY FAMILY CARRIES THE THICK RUNG'S GLASS — depth 1.83× the lip, index 1.7, a 9% split — which
 * is the lens that was judged ("The bending was good before, its way too less now"): a first cut of
 * this model on circles, at a lower depth, bent about a fifth as far and was reverted within the
 * hour. What held through every round, and why:
 *
 *   - THE BEND POINTS INWARD (`CONCAVE`, 2026-09-17). Pointed outward, a lip pixel sampled backdrop
 *     past the box, which clear glass drew as hard coloured lines along the straight edges.
 *   - THE BEND PASSES THE LIP (`boost`, 2026-09-21). While it peaked at one lip every rim pixel
 *     read nearly the same backdrop pixel, which draws streaks; past one lip the rim shows a
 *     squeezed, MIRRORED copy of what sits just inside it, wrapping the corners. `boost` is the
 *     sanctioned override of the physics, applied to the filter's `scale` after the clamp, because
 *     `physicalMap` clamps the returned bend at the lip and no depth can reach past it. At thick's
 *     depth the control and rows families sit ON that clamp (their peak is ~1.17 lips), so their
 *     reach is exactly lip × `boost`; the pane's eased curve peaks just under it.
 *   - `LIP_SHARE` caps the lip per box, and with it the sample: lip × reach stays under the box
 *     (a law), for the dome's 0.5 × 1.32 as for the pane's 0.28 × 2.2.
 *   - The split rides the bend, and the bend is ~0 by the lip's inner side (a law), so the three
 *     channels agree everywhere except the band where the split is the point.
 */
export type LensScale = "control" | "rows" | "pane" | "region";
export const lensFamily: Record<LensScale, LensParams> = {
  control: { bezel: 18, thickness: 32.95, ior: 1.7, fringe: 9, boost: 1.32, lipShare: 0.5 },
  rows: { bezel: 30, thickness: 54.9, ior: 1.7, fringe: 9, boost: 1.32 },
  pane: { bezel: 36, thickness: 65.9, ior: 1.7, fringe: 9, boost: 2.2, profile: 3 },
  region: { bezel: 72, thickness: 131.8, ior: 1.7, fringe: 9, boost: 2.2, profile: 3 },
};

/**
 * The lens a material bends with, or null for the two that never do. Asking here is what
 * keeps those two spellings out of TWELVE call sites: every consumer used to hand this hook a
 * boolean it had assembled itself, and `shell` shipped one arm short of the others for
 * exactly as long as that was each caller's job.
 */
function lensFor(material: SurfaceMaterial, scale: LensScale = "pane"): LensParams | null {
  if (material === "solid" || material === ON_GLASS) return null;
  const at = lensFamily[scale];
  const x = scale === "region" ? (tuning?.regionBezelX ?? 1) : 1;
  const base = x === 1 ? { ...at } : { ...at, bezel: at.bezel * x, thickness: at.thickness * x };
  if (!tuning) return base;
  // The bench's multipliers, applied over the shipped family — 1.0 everywhere restores it.
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

/** Map pixels the glint's band needs to carry its ramp — see the scale floor in `measure()`.
    Three is where the measured edge alpha stops collapsing; the cost of holding it is the
    area cap below, not an unbounded map. */
const GLINT_BAND_PX = 3;
/** And the ceiling on that floor, in map pixels of area: a pane bigger than this gets a band
    thinner than GLINT_BAND_PX rather than a canvas nobody can afford. 640x640 is four times
    MAP_CAP's area and still a fifth of a full-window pane's. */
const GLINT_AREA_CAP = 640 * 640;

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
  const bezel = Math.min(p.bezel, Math.floor(shortSide * (p.lipShare ?? LIP_SHARE)));
  // Under 2px there is no lip to draw: the map's own 3px softening is wider than the band.
  if (bezel < 2) return null;
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
export function bendAt(t: number, bezel: number, thickness: number, ior: number, profile?: number): number {
  const { height, slope } = surface(t, profile);
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
function bendMemo(bezel: number, thickness: number, ior: number, profile?: number): Map<number, number> {
  const key = `${bezel}|${thickness}|${ior}|${profile ?? ""}|${tuningSerial}`;
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
export function physicalMap(w: number, h: number, r: number | Corners, p: LensParams, k = 2): { url: string; max: number } {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { url: "", max: 0 };
  const img = ctx.createImageData(w, h);
  const fit = fitLens(p, Math.min(w, h));
  if (!fit) return { url: "", max: 0 };
  const { bezel, thickness } = fit;
  const memo = bendMemo(bezel, thickness, p.ior, p.profile);
  // The four corners (a scalar is the case where they agree), and the field measured on
  // whichever one owns the point — see `sdCorners`.
  const c = corners(r);
  const uniform = sameCorners(c);
  const maxR = Math.max(c[0], c[1], c[2], c[3]);
  const sd = (x: number, y: number): number => sdCorners(x, y, w, h, c, k);
  const bend = (inside: number): number => {
    let v = memo.get(inside);
    if (v === undefined) {
      v = bendAt(inside / bezel, bezel, thickness, p.ior, p.profile);
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
  const cz = Math.ceil(Math.max(maxR, bezel)) + 3;
  if (w - 2 * cz >= 1 && h - 2 * cz >= 1) {
    __genPaths.analytic += 1;
    /* ── the four corners, each on its own radius ──
       One zone size for all four, taken from the WIDEST corner: a zone that is bigger than a
       corner needs costs a few skipped pixels, and a zone that is too small would let a pixel
       inside somebody's arc be filled as if it were pure. Sizing it on the max is what keeps
       the span fills below honest for every corner at once, and on a uniform box it is the
       number this line has always computed. */
    const cmag = new Float32Array(4 * cz * cz);
    const cnx = new Float32Array(4 * cz * cz);
    const cny = new Float32Array(4 * cz * cz);
    const con = new Uint8Array(4 * cz * cz);
    // Corner q's own block coordinate, placed in the box: 0 tl, 1 tr, 2 br, 3 bl.
    const cxOf = (q: number, x: number): number => (q === 1 || q === 2 ? w - 1 - x : x);
    const cyOf = (q: number, y: number): number => (q === 2 || q === 3 ? h - 1 - y : y);
    for (let q = 0; q < 4; q++) {
      for (let y = 0; y < cz; y++) {
        for (let x = 0; x < cz; x++) {
          const bx = cxOf(q, x);
          const by = cyOf(q, y);
          const inside = -sd(bx + 0.5, by + 0.5);
          if (inside < 0 || inside > bezel) continue;
          const i = (q * cz + y) * cz + x;
          const mag = bend(inside);
          const gx = sd(bx + 1.5, by + 0.5) - sd(bx - 0.5, by + 0.5);
          const gy = sd(bx + 0.5, by + 1.5) - sd(bx + 0.5, by - 0.5);
          const gl = Math.hypot(gx, gy) || 1;
          cmag[i] = mag;
          cnx[i] = gx / gl;
          cny[i] = gy / gl;
          con[i] = 1;
          const a = Math.abs(mag);
          if (a > maxAbs) maxAbs = a;
        }
      }
    }
    // ── the spans' per-depth values, off the real field at a representative pure pixel ──
    const px = cz + 0.5;
    const sdRow = (yy: number): number => sd(px, yy + 0.5);
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
    const sdCol = (xx: number): number => sd(xx + 0.5, cz + 0.5);
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
    /* ── write: each corner from its own floats, spans as one value per depth ──
       The mirror is gone and the bytes are the same, which is the whole argument for removing
       it: a mirrored pixel centre is `w - u` against `u`, `|u - w/2|` is symmetric, so the two
       SDF inputs are the IDENTICAL float and the finite-difference gradient is exactly negated
       — and `128 + (-nx)*m*127` is bit-for-bit `128 - nx*m*127`. Rounding still happens after
       the sign, never before it, for the reason the old note gave: Math.round is half-up, so
       128.5 and 127.5 do not mirror. */
    const u32 = new Uint32Array(data.buffer);
    for (let q = 0; q < 4; q++) {
      for (let y = 0; y < cz; y++) {
        for (let x = 0; x < cz; x++) {
          const i = (q * cz + y) * cz + x;
          if (!con[i]) continue;
          const m = maxAbs > 0 ? (cmag[i] as number) / maxAbs : 0;
          const j = (cyOf(q, y) * w + cxOf(q, x)) * 4;
          data[j] = Math.round(128 + (cnx[i] as number) * m * 127);
          data[j + 1] = Math.round(128 + (cny[i] as number) * m * 127);
          data[j + 2] = 0;
          data[j + 3] = 255;
        }
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
        const v = sd(x + 0.5, y + 0.5);
        out[x] = v;
        mark[x] = 1;
        // The jump is only exact while both ends of the row carry the same corner: it resumes
        // at the MIRROR of where the field left the bezel, and on a box whose two ends round
        // differently the far band can reach further in than that mirror. So a mixed box walks
        // the row whole (`x` ends at `w`, which leaves the second loop nothing to do) and a
        // uniform one keeps the skip it has always taken.
        if (-v > bezel && uniform) break;
      }
      for (let x2 = Math.max(w - 1 - x, x); x2 < w; x2++) {
        out[x2] = sd(x2 + 0.5, y + 0.5);
        mark[x2] = 1;
      }
    };
    const at = (row: Float64Array, mk: Uint8Array, x: number, y: number): number =>
      x < 0 || x >= w
        ? sd(x + 0.5, y + 0.5)
        : mk[x]
          ? (row[x] as number)
          : sd(x + 0.5, y + 0.5);
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

export function glintMap(w: number, h: number, r: number | Corners, band: number, falloff: number, k: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(w, h);
  const data = img.data;
  // Four corners, the same way the displacement map takes them: a sheet's square edge must get
  // no band and its rounded one must get the whole band, and one radius mirrored gave both the
  // wrong answer at once.
  const c = corners(r);
  const uniform = sameCorners(c);
  const maxR = Math.max(c[0], c[1], c[2], c[3]);
  const sd = (x: number, y: number): number => sdCorners(x, y, w, h, c, k);
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
  const cz = Math.ceil(Math.max(maxR, band)) + 2;
  if (w - 2 * cz >= 1 && h - 2 * cz >= 1) {
    __genPaths.glintAnalytic += 1;
    const u32 = new Uint32Array(data.buffer);
    // ── the four corners, each on its own radius (the displacement map's own sentence) ──
    const cxOf = (q: number, x: number): number => (q === 1 || q === 2 ? w - 1 - x : x);
    const cyOf = (q: number, y: number): number => (q === 2 || q === 3 ? h - 1 - y : y);
    for (let q = 0; q < 4; q++) {
      for (let y = 0; y < cz; y++) {
        for (let x = 0; x < cz; x++) {
          const bx = cxOf(q, x);
          const by = cyOf(q, y);
          const inside = -sd(bx + 0.5, by + 0.5);
          if (inside < -0.5 || inside > band) continue;
          u32[by * w + bx] = ((alphaOf(inside) << 24) | 0x00ffffff) >>> 0;
        }
      }
    }
    // ── spans: one field value per depth, read at a representative pure pixel ──
    const px = cz + 0.5;
    for (let y = 0; ; y++) {
      const inside = -sd(px, y + 0.5);
      if (inside > band) break;
      if (inside < -0.5) continue;
      const v = ((alphaOf(inside) << 24) | 0x00ffffff) >>> 0;
      u32.fill(v, y * w + cz, y * w + w - cz);
      u32.fill(v, (h - 1 - y) * w + cz, (h - 1 - y) * w + w - cz);
    }
    for (let x = 0; ; x++) {
      const inside = -sd(x + 0.5, cz + 0.5);
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
        const inside = -sd(x + 0.5, y + 0.5);
        // The jump is exact only while both ends of the row carry the same corner — see the
        // displacement map's own note. A mixed box walks the row whole instead.
        if (inside > band) {
          if (uniform) break;
          continue;
        }
        if (inside < -0.5) continue;
        const i = (y * w + x) * 4;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = alphaOf(inside);
      }
      for (let x2 = Math.max(w - 1 - x, x); x2 < w; x2++) {
        const inside = -sd(x2 + 0.5, y + 0.5);
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
function acquireGlint(w: number, h: number, r: number | Corners, band: number, k: number): string {
  const falloff = tuning?.glintFalloff ?? glint.falloff;
  // ALL FOUR CORNERS IN THE KEY (2026-09-12): two panes of one size whose corners differ need
  // two masks, and without this the first one minted is handed to the second — which is how a
  // bottom sheet and a card of the same box would have shared one band.
  const key = `${w}x${h}r${corners(r).join("_")}b${Math.round(band * 10)}f${falloff}k${k}z${tuningSerial}`;
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
  r: number | Corners,
  p: LensParams,
  fit: number,
  rim: { url: string; sat: number } | null,
  /** The box's corner exponent (2 circular, 4 squircle) — see `sdSuperRect`. It is part of the
      key below because two panes of one size whose corners are shaped differently need two
      maps; without it the first one minted would be handed to the second. */
  k = 2,
): string | null {
  // The corners are ALL of them, for the reason the exponent is here: two panes of one size
  // whose corners are shaped differently need two maps, and a key that names one corner hands
  // the first map to the second pane.
  const key = `${w}x${h}r${corners(r).join("_")}k${k}z${fit}b${p.bezel}t${p.thickness}i${p.ior}f${p.fringe}s${p.boost}u${p.blur ?? 0}P${p.profile ?? ""}L${p.lipShare ?? ""}q${tuningSerial}rs${rim ? rim.sat : 0}`;
  const hit = filters.get(key);
  if (hit) {
    hit.users += 1;
    return hit.id;
  }
  const { url, max } = physicalMap(w, h, r, p, k);
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
    // HYPHENATED, because `el()` applies these with `setAttribute` and SVG attribute names are
    // not the camelCase IDL spellings (2026-09-11 audit). `colorInterpolationFilters` stood here
    // since the lens shipped and set a meaningless attribute, so the chain ran in the filter
    // default, linearRGB — measured `getComputedStyle(filter)` returning `linearrgb`.
    //
    // The map encodes 128 = "no bend" as an sRGB BYTE. Read as linear, 128/255 linearises to
    // 0.216, so `scale * (C - 0.5)` gave every pixel a constant -0.284*scale displacement
    // instead of zero: the whole backdrop seen through a pane sat ~2.4px off the backdrop
    // beside it (regular), and because R and B carry the fringe at different scales their
    // constant offsets differed — a permanent ~1.4px chromatic separation across the pane BODY,
    // not only at the lip. That is the blue band chased on 2026-08-25 and attributed to the
    // pre-blur, and it is why `boost: 4` measured worse rather than stronger: it doubles a
    // separation, not a bend.
    "color-interpolation-filters": "sRGB",
    x: 0,
    y: 0,
    width: "100%",
    height: "100%",
  });
  filter.appendChild(el("feImage", { href: url, preserveAspectRatio: "none", result: "map" }));
  filter.appendChild(el("feGaussianBlur", { in: "map", stdDeviation: 3, result: "soft" }));
  /* THE BLUR RUNS HERE, BEFORE THE BEND (kube's own order; shipped 2026-09-21). `p.blur` as
     the hook resolved it for this element (the rung's, scaled down on a control, raised on a
     floating pane), plus the bench's `preBlur` dial. The stylesheet's lens row carries no blur of its
     own: written there it lands after the displacement and softens the bend.

     This order was JUDGED OUT once (0.5px, 2026-08-25: a blue band over a plain ground, the
     blur softening the backdrop's clip boundary into a gradient the channel split then
     coloured). What changed: the bend points INWARD since 2026-09-17 and peaks at the very
     edge, so the pixels nearest the clip boundary are exactly the ones no rim pixel samples;
     and the filter runs in sRGB since 2026-09-11, which removed the constant channel offset
     that band was mostly made of. */
  const pre = (tuning?.preBlur ?? 0) + (p.blur ?? 0);
  const source = pre > 0 ? "presoft" : "SourceGraphic";
  if (pre > 0) {
    filter.appendChild(el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: pre, edgeMode: "duplicate", result: "presoft" }));
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
  //
  // VERIFIED ON SAFARI 26, AND IT FAILS EXACTLY THAT WAY (2026-09-08, Kushagra from an iPhone:
  // "Glass is inconsistent on mobile safari"). WebKit parses `url()` in backdrop-filter — both
  // supports() calls return true — and then paints NOTHING for the whole chain, blur included:
  // measured on the docs band, a glass button with a lens showed the text under it crisp, and
  // stripping the inline `--kui-lens` alone brought the blur back. So the test is narrowed the
  // way the paragraph above prescribes. `navigator.vendor` is the one string every WebKit
  // browser carries (iOS Chrome and Firefox included, since they are WebKit there) and no Blink
  // or Gecko one does; it is frozen, not removed. The glint does not read this gate and keeps
  // painting, which is the half of the identity WebKit has always had.
  const webkit = typeof navigator !== "undefined" && navigator.vendor === "Apple Computer, Inc.";
  supported =
    !webkit &&
    CSS.supports("backdrop-filter", "blur(1px)") &&
    CSS.supports("backdrop-filter", "url(#a) blur(1px)");
  return supported;
}

/**
 * TELL THE STYLESHEET WHETHER THE LENS IS REAL (2026-09-11).
 *
 * The near-clear blur ladder is licensed by the lens, so the engines that cannot render one
 * need a different row (`--material-<t>-filter-frost`) — and no feature query can ask the
 * question, which is the whole finding of 2026-09-08: WebKit answers `true` to both
 * `CSS.supports` calls and then paints nothing. `lensSupported()` is the only thing in the
 * system that knows, so it is the only thing that can say.
 *
 * The stamp is the POSITIVE, and the absence is the defended default: an engine nobody has
 * stamped, a server render and a page with JS off all keep the frost row. One write, once per
 * document, from a gate that is already memoised — this is not a per-element decision and must
 * never become one, or a nested scope could disagree with the engine it is running on.
 */
let stamped = false;
function stampLens(): void {
  if (stamped || typeof document === "undefined") return;
  stamped = true;
  if (lensSupported()) document.documentElement.setAttribute("data-lens", "on");
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
  }>({
    node: null,
    id: null,
    glint: false,
    retune: null,
    ro: null,
  });

  return React.useCallback(
    (node: HTMLElement | null) => {
      const s = state.current;
      if (s.node === node) return;
      // Before anything measures: the stylesheet's fork needs the answer whether or not THIS
      // element ends up with a lens (a solid pane still sits in a document whose other panes
      // are glass).
      stampLens();

      const detach = () => {
        s.ro?.disconnect();
        s.ro = null;
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

      /** The box the map is built for: the element's own. */
      const target = (): { w: number; h: number; r: Corners; k: number; sealed: boolean; ringDown: boolean; glinted: boolean; scale: LensScale } | null => {
        const rect = node.getBoundingClientRect();
        const cs = getComputedStyle(node);
        // Which piece of glass this is (see `lensFamily`). A region is read off the cascade (the
        // region rule in surfaces.css publishes it, registered non-inheriting so only the pane
        // that IS a region reads it); a control and a panel of rows are read off their classes.
        const scale: LensScale =
          cs.getPropertyValue("--kui-material-scale").trim() === "region"
            ? "region"
            : node.classList.contains("kui-control")
              ? "control"
              : node.classList.contains("kui-floating-rows")
                ? "rows"
                : "pane";
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
        // and BOTH contours must follow the corner the box actually paints — the glint's band,
        // because light detaching from the lip at every corner is what a circular mask over a
        // squircle clip draws, and since 2026-09-05 the lens's bend, for the same reason at a
        // bigger scale (see `sdSuperRect`).
        const k = cornerExponent(cs.getPropertyValue("corner-shape"));
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
        if (rect.width < 8 || rect.height < 8) return null;
        /* ALL FOUR, since 2026-09-12. This read `borderTopLeftRadius` alone and the two maps
           mirrored it, which is right for every box that rounds uniformly and wrong for the
           first one that does not: a bottom Sheet is 64.52/64.52/0/0 and got curved light on
           the two square corners it presses against the window, while an inline-start sheet
           read 0 and got a square map over corners it really paints. A corner is a property of
           the corner, so it is read at the corner. */
        const corner = (v: string): number => parseFloat(v) || 0;
        return {
          w: rect.width,
          h: rect.height,
          r: [
            corner(cs.borderTopLeftRadius),
            corner(cs.borderTopRightRadius),
            corner(cs.borderBottomRightRadius),
            corner(cs.borderBottomLeftRadius),
          ],
          k,
          sealed,
          ringDown,
          glinted,
          scale,
        };
      };

      const measure = () => {
        const box = target();
        if (!box) return;
        const base = lensFor(material, box.scale);
        if (!base) return;
        // The one blur the lens applies: a FLOATING pane's (menu, select, popover, combobox),
        // which has no scrim to soften what is behind it and carries a little of that itself —
        // the rung's amount, `floatingFrost`. Nothing else blurs before the bend (see `blur`).
        const params = {
          ...base,
          blur: node.classList.contains("kui-floating") ? (floatingFrost[material as LensThickness] ?? 0) : 0,
        };
        /**
         * ROUNDED BEFORE ANYTHING READS IT (2026-09-11 audit). `getBoundingClientRect` returns
         * sub-pixel floats, and above the cap `scale` is derived from them and then multiplies
         * every downstream term, so two panes that paint identically — a row of equal cards, a
         * grid of equal panels — carried different keys and each minted its own map and filter.
         * Below the cap `scale` is 1 and the `Math.round`s already collapsed them, which is why
         * the miss only ever showed on the big panes that can least afford it.
         */
        const rect = { width: Math.round(box.w), height: Math.round(box.h) };
        // The map is generated at a capped resolution and stretched to the box — the bend is a
        // low-frequency field, so this bounds a full-page pane to a small pane's cost. The
        // stretch is the filter's job (see `acquire`); what is this function's job is that the
        // PHYSICS crosses the same scale, so a capped map still renders the judged lens.
        const scale = Math.min(1, MAP_CAP / Math.max(rect.width, rect.height));
        const w = Math.max(8, Math.round(rect.width * scale));
        const h = Math.max(8, Math.round(rect.height * scale));
        const r = scaleCorners(box.r, scale, w, h);
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
          /**
           * THE GLINT KEEPS ITS OWN SCALE, and the lens keeps the cap (2026-09-11 audit).
           *
           * Both maps rode `scale`, which is floored on the BOX. The lens survives that — a
           * displacement field is low-frequency, which is the cap's whole argument. The glint
           * does not: its band is a LENGTH, so at the cap it shrinks with the map until it is
           * about one map pixel, and a `(1-t)^falloff` ramp sampled once per pixel across one
           * pixel has no ridge left. Measured at the middle of an edge, where the lip is what
           * a person actually sees: alpha 159 on a 96x32 button, 84 on a phone-width pane, 37
           * on a 1100x64 toolbar and 18 on a 1400x900 shell pane — an 89% collapse across the
           * size range, on the one part of the material WebKit still paints (the lens is gated
           * off there, so on every Apple device this IS the glass's light).
           *
           * Supersampling was refused before it was built: averaging a one-pixel-wide ramp
           * returns its mean, not its peak (1/(falloff+1) of it), so it buys a third of the
           * amplitude and none of the sharpness. A stretched map cannot hold a lip it has no
           * pixels for — the repair has to be resolution.
           *
           * So the glint's scale is floored on the BAND: enough map pixels to carry the ramp,
           * never more than the box, and never past an area cap so a wall-sized pane cannot
           * mint a wall-sized canvas. The lens's own `scale`, `w`, `h` and `r` are untouched.
           */
          // The band keeps the old lip's share of the box: a control's lens is now the whole
          // dome, and a specular that followed it would light half the button.
          const bandCss = Math.min(fit.bezel, Math.floor(Math.min(box.w, box.h) * LIP_SHARE)) * bandX;
          const wanted = bandCss > 0 ? GLINT_BAND_PX / bandCss : 1;
          const area = Math.sqrt(GLINT_AREA_CAP / Math.max(1, rect.width * rect.height));
          const gScale = Math.min(1, Math.max(scale, Math.min(wanted, area)));
          const gw = Math.max(8, Math.round(rect.width * gScale));
          const gh = Math.max(8, Math.round(rect.height * gScale));
          const gr = scaleCorners(box.r, gScale, gw, gh);
          const band = Math.max(1, bandCss * gScale);
          glintUrl = acquireGlint(gw, gh, gr, band, box.k);
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
        const next = acquire(w, h, r, fitted, scale, glintUrl && sat > 0 ? { url: glintUrl, sat } : null, box.k);
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

      measure();
      s.retune = measure;
      remeasures.add(measure);
      /**
       * NOT COALESCED BEHIND A rAF, and that was measured before it was refused (2026-09-11).
       * The 2026-09-11 audit called for one measurement per frame on the four gestures that
       * resize a pane continuously — a shell divider drag, a TextArea resize handle, a phone
       * rotation, a window resize. The premise is that the observer delivers more often than a
       * frame. It does not: a ResizeObserver notification is dispatched once per frame, after
       * layout, and coalesces every size change since the last one. Measured with several
       * synchronous width and height writes inside each of 40 frames: 40 frames, 40 callbacks,
       * 40 records. So a rAF in front of this saves nothing and costs the lens a frame of lag.
       *
       * What WOULD cut the cost is a settle guard — build nothing until the box has held still
       * for a frame — and that is a different thing with a visible price: the lens would trail
       * a drag instead of tracking it. It is a design call, not a repair, and it is not made
       * here.
       */
      s.ro = new ResizeObserver(measure);
      s.ro.observe(node);
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
