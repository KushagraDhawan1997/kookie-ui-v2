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
 * bend follows Snell's law across it — air 1.0 into glass ~1.5 — taken on the surface's own
 * slope, with direction the outward normal of a rounded-rect signed distance field. Red
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
 */
function surface(t: number): { height: number; slope: number } {
  const u = 1 - t;
  const u4 = u * u * u * u;
  return {
    height: Math.pow(Math.max(1 - u4, 0), 0.25),
    slope: (u * u * u) / Math.pow(Math.max(1 - u4, 0.04), 0.75),
  };
}

/** The lens's shape, in config terms. Every number is judged, none is derived from taste
    at a call site — a consumer never sees these. */
export type LensParams = {
  /** px of bezel: how far in from the lip the bend reaches. */
  bezel: number;
  /** px of glass the light crosses — the depth that sets how far it can shift. */
  thickness: number;
  /** air 1.0 → glass ~1.5. */
  ior: number;
  /** % scale spread between the R and B channels: the chromatic split at the lip. */
  fringe: number;
  /** × past the derived strength — taste's one override of the physics. */
  boost: number;
};

/**
 * The lab's judged lens, and the one place these live. Extracted 2026-08-16 from the
 * approved lab state, the same way the material ladder was: read off what was on screen.
 */
export const lens: LensParams = { bezel: 18, thickness: 26, ior: 1.5, fringe: 8, boost: 1 };

/** Maps are generated at most this wide/tall and stretched to the box. The bend is a
    low-frequency field, so this is invisible and it is what bounds the cost of a big pane. */
const MAP_CAP = 320;

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
  const bezel = Math.min(p.bezel, Math.floor(Math.min(w, h) / 2) - 2);
  if (bezel <= 0) return { url: "", max: 0 };

  const mags = new Float32Array(w * h);
  const nxs = new Float32Array(w * h);
  const nys = new Float32Array(w * h);
  let maxAbs = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const inside = -sdRoundedRect(x + 0.5, y + 0.5, w, h, r); // > 0 inside
      if (inside < 0 || inside > bezel) continue;
      const t = inside / bezel;
      const { height, slope } = surface(t);
      // Geometric slope: the profile is `thickness` tall over `bezel` wide.
      const geo = (slope * p.thickness) / bezel;
      const theta1 = Math.atan(Math.abs(geo));
      const theta2 = Math.asin(Math.min(Math.sin(theta1) / p.ior, 1));
      // Lateral shift: the deviation over the glass depth below this point of the surface.
      const mag = Math.sign(geo) * p.thickness * height * Math.tan(theta1 - theta2);
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
function acquire(w: number, h: number, r: number, p: LensParams): string | null {
  const key = `${w}x${h}r${r}b${p.bezel}t${p.thickness}i${p.ior}f${p.fringe}s${p.boost}`;
  const hit = filters.get(key);
  if (hit) {
    hit.users += 1;
    return hit.id;
  }
  const { url, max } = physicalMap(w, h, r, p);
  if (!url || max <= 0) return null;

  const id = `kui-lens-${(seq += 1)}`;
  const base = max * p.boost;
  const spread = p.fringe / 100;
  const filter = el("filter", { id, colorInterpolationFilters: "sRGB" });
  filter.appendChild(el("feImage", { href: url, x: 0, y: 0, width: w, height: h, preserveAspectRatio: "none", result: "map" }));
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
export function useLens(active: boolean): (node: HTMLElement | null) => void {
  const state = React.useRef<{
    node: HTMLElement | null;
    id: string | null;
    ro: ResizeObserver | null;
    flight: MutationObserver | null;
  }>({
    node: null,
    id: null,
    ro: null,
    flight: null,
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
        if (s.id) release(s.id);
        if (s.id && s.node) s.node.style.removeProperty("--kui-lens");
        s.id = null;
      };

      detach();
      s.node = node;
      if (!node || !active || !lensSupported()) return;

      const measure = () => {
        const rect = node.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 8) return;
        // The map is generated at a capped resolution and stretched — the bend is a
        // low-frequency field, so this bounds a full-page pane to a small pane's cost.
        const scale = Math.min(1, MAP_CAP / Math.max(rect.width, rect.height));
        const w = Math.max(8, Math.round(rect.width * scale));
        const h = Math.max(8, Math.round(rect.height * scale));
        const cssRadius = parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0;
        const r = Math.min(Math.round(cssRadius * scale), Math.floor(Math.min(w, h) / 2));
        const next = acquire(w, h, r, lens);
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
      const measureUnlessFlying = () => {
        if (flying()) return;
        measure();
      };

      measureUnlessFlying();
      s.ro = new ResizeObserver(measureUnlessFlying);
      s.ro.observe(node);
      s.flight = new MutationObserver(() => {
        if (!flying()) measure();
      });
      s.flight.observe(node, { attributes: true, attributeFilter: ["data-unfurling"] });
    },
    [active],
  );
}

/**
 * The lens composed with whatever ref the caller passed — the one form every glass-capable
 * component uses, so none of them hand-rolls ref merging (eight copies of that is how the
 * `render` escape overwrote a target's ref, audit 2026-08-03).
 */
export function useLensRef<T extends HTMLElement>(
  active: boolean,
  forwarded: React.Ref<T> | undefined,
): (node: T | null) => void {
  const attach = useLens(active);
  return React.useCallback(
    (node: T | null) => {
      attach(node);
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) (forwarded as React.RefObject<T | null>).current = node;
    },
    [attach, forwarded],
  );
}
