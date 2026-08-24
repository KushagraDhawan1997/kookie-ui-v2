"use client";

/**
 * The material bench (2026-08-23 as the lens bench; widened 2026-08-24, Kushagra: "I need a
 * pass at glassness... I look at iOS liquid glass and it is MILES ahead").
 *
 * The first bench could move exactly two levers — `boost` and `fringe`, the attributes a
 * mounted filter exposes — and its own footer admitted the cage: the lip's width, the depth
 * behind it and the profile are baked into each pane's map. That cage is why the lab's LOCKED
 * refraction (2026-08-14: concave profile, wide bezel, IOR 2.4) went unjudged in the package
 * for two months while the shipped lens carried a narrow squircle lip. This bench holds three
 * groups of dials:
 *
 *   LENS      regenerates every mounted pane's displacement map through the package's own
 *             `__retuneLens` seam — bezel width, glass depth, refraction index, the profile's
 *             exponent, the lab's concave flip, and kube's pre-blur order (frost before the
 *             bend, so the lens stays crisp).
 *   GLINT     the specular band's width, feather and the rim-saturate stage (the edge
 *             re-emitting the backdrop's own colour) — same seam, same regeneration.
 *   MATERIAL  multiplies the shipped tokens live — veil, blur, saturation, an appended
 *             contrast term, the sheen wash and the ring's strength — via one injected
 *             stylesheet that lands on every `.kui-theme` element with `!important`, which is
 *             what beats the same element's own token declarations while a nested Theme's
 *             proximity would beat any inline override on the root.
 *
 * Honest the way the motion bench is: every dial is a multiplier OVER what the package ships,
 * read off the shipped tokens themselves (per mode, from probe elements, so a light snapshot
 * is never pushed through dark), and 1.0x everywhere restores the package byte-for-byte.
 * Nothing persists. The readout is the diff for config.ts and refraction.tsx.
 */
import * as React from "react";
import { __retuneLens, Button, Card, Flex, Heading, Stack, Text } from "@kookie-ui/react";

/* ── bend/fringe: live attribute edits on mounted filters (the 2026-08-23 half) ──────────── */

type Recovered = { base: number; fringe: number };

function channels(filter: Element): SVGElement[] {
  return [...filter.querySelectorAll<SVGElement>("feDisplacementMap")];
}

/** What a filter is currently set to, read off its own three channels. G is the unsplit bend;
    R sits a fringe above it and B the same below, so either outer channel recovers the split. */
function recover(filter: Element): Recovered | null {
  const [r, g] = channels(filter);
  if (!r || !g) return null;
  const base = parseFloat(g.getAttribute("scale") ?? "");
  const high = parseFloat(r.getAttribute("scale") ?? "");
  if (!Number.isFinite(base) || !Number.isFinite(high) || base === 0) return null;
  return { base, fringe: (high / base - 1) * 100 };
}

function apply(filter: Element, shipped: Recovered, bend: number, fringe: number) {
  const [r, g, b] = channels(filter);
  if (!r || !g || !b) return;
  const base = shipped.base * bend;
  const spread = (shipped.fringe * fringe) / 100;
  r.setAttribute("scale", String(base * (1 + spread)));
  g.setAttribute("scale", String(base));
  b.setAttribute("scale", String(base * (1 - spread)));
}

/* ── material: shipped tokens, multiplied ────────────────────────────────────────────────── */

const THICKNESSES = ["thin", "regular", "thick"] as const;
const MODES = ["light", "dark"] as const;
type Mode = (typeof MODES)[number];

/** Every token the material dials rewrite. Alphas take the veil dial; filters take blur,
    saturation and the contrast term; the rim takes sheen; the rings take edge. */
const TOKEN_NAMES = THICKNESSES.flatMap((t) => [
  `--material-${t}-alpha`,
  `--material-${t}-alpha-hover`,
  `--material-${t}-alpha-active`,
  `--material-${t}-alpha-floating`,
  `--material-${t}-control-alpha`,
  `--material-${t}-filter`,
  `--material-${t}-control-filter`,
  `--material-${t}-control-filter-hover`,
  `--material-${t}-control-filter-loud`,
  `--material-${t}-rim`,
  `--material-${t}-ring`,
  `--material-${t}-ring-control`,
  `--material-${t}-glint`,
  `--material-${t}-glint-control`,
]);

/** The shipped value of every token, per mode, read off a PROBE — a hidden element carrying
    the mode's own stamp — so the snapshot is the mode's, not whichever appearance the page
    happened to be in when the bench opened. */
function snapshot(): Record<Mode, Map<string, string>> {
  const out = { light: new Map<string, string>(), dark: new Map<string, string>() };
  for (const mode of MODES) {
    const probe = document.createElement("div");
    probe.className = "kui-theme";
    probe.setAttribute("data-appearance", mode);
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    for (const name of TOKEN_NAMES) {
      const v = cs.getPropertyValue(name).trim();
      if (v) out[mode].set(name, v);
    }
    probe.remove();
  }
  return out;
}

type MatDials = { veil: number; blur: number; sat: number; contrast: number; sheen: number; edge: number };
const MAT_DEFAULT: MatDials = { veil: 1, blur: 1, sat: 1, contrast: 1, sheen: 1, edge: 1 };

const scaleNum = (v: number, x: number) => Number((v * x).toFixed(3));

/** One token value under the dials. Percentages inside gradients are the sheen's; alphas
    inside `rgb(... / a)` are the ring's; `blur()`/`saturate()` terms are the filter's own. */
function retoken(name: string, value: string, d: MatDials): string {
  if (name.includes("-ring") || name.includes("-glint")) {
    return value.replace(/\/ ([0-9.]+)\)/g, (_, a: string) => `/ ${Math.min(1, scaleNum(parseFloat(a), d.edge))})`);
  }
  if (name.includes("-rim")) {
    return value.replace(/\/ ([0-9.]+)%/g, (_, a: string) => `/ ${Math.min(100, scaleNum(parseFloat(a), d.sheen))}%`);
  }
  if (name.includes("-filter")) {
    let next = value
      .replace(/blur\(([0-9.]+)px\)/, (_, b: string) => `blur(${scaleNum(parseFloat(b), d.blur)}px)`)
      .replace(/saturate\(([0-9.]+)%\)/, (_, s: string) => `saturate(${scaleNum(parseFloat(s), d.sat)}%)`);
    if (d.contrast !== 1) next = `${next} contrast(${d.contrast})`;
    return next;
  }
  // The alphas: `NN%`.
  return value.replace(/([0-9.]+)%/, (_, a: string) => `${Math.min(100, scaleNum(parseFloat(a), d.veil))}%`);
}

function styleSheet(shipped: Record<Mode, Map<string, string>>, d: MatDials): string {
  const rules: string[] = [];
  for (const mode of MODES) {
    const decls: string[] = [];
    for (const [name, value] of shipped[mode]) {
      const next = retoken(name, value, d);
      if (next !== value) decls.push(`${name}: ${next} !important;`);
    }
    if (decls.length) rules.push(`.kui-theme[data-appearance="${mode}"] {\n${decls.join("\n")}\n}`);
  }
  return rules.join("\n");
}

/* ── the panel ───────────────────────────────────────────────────────────────────────────── */

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (next: number) => void;
}) {
  const id = `lb-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <Stack gap="1">
      <Flex justify="space-between" align="baseline" gap="3">
        <Text size="1" emphasis="quiet" render={<label htmlFor={id} />}>
          {label}
        </Text>
        <Text size="1" emphasis="medium">
          {Math.round(value * 100) / 100}
          {suffix}
        </Text>
      </Flex>
      {/* A native range, for the reason its twin in the motion bench states: the package's own
          Slider is a judged specimen on this page, and driving the bench with the thing under
          test makes a change to it read as a change to the bench. */}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        style={{ width: "100%" }}
      />
    </Stack>
  );
}

const LENS_DEFAULT = { bezelX: 1, thicknessX: 1, ior: 0, profileP: 2, concave: false, preBlur: 0 };
const GLINT_DEFAULT = { glintBandX: 1, glintFalloff: 4, rimSaturate: 0 };

export function LensBench() {
  const [open, setOpen] = React.useState(false);
  const [bend, setBend] = React.useState(1);
  const [fringe, setFringe] = React.useState(1);
  const [lensD, setLensD] = React.useState(LENS_DEFAULT);
  const [glintD, setGlintD] = React.useState(GLINT_DEFAULT);
  const [mat, setMat] = React.useState<MatDials>(MAT_DEFAULT);
  /** The shipped values per filter id, captured the first time each filter is seen — so the
      multipliers are always multiples OF what the package ships, and 1.0x is exact. */
  const shipped = React.useRef(new Map<string, Recovered>());
  const tokens = React.useRef<Record<Mode, Map<string, string>> | null>(null);
  const [seen, setSeen] = React.useState(0);

  /* The regeneration dials: every change re-tunes the package seam, which re-measures every
     mounted lens. Defaults everywhere → null, which IS the shipped package. */
  React.useEffect(() => {
    if (!open) return;
    const lensAtRest =
      lensD.bezelX === 1 && lensD.thicknessX === 1 && lensD.ior === 0 && lensD.profileP === 2 && !lensD.concave && lensD.preBlur === 0;
    const glintAtRest = glintD.glintBandX === 1 && glintD.glintFalloff === 4 && glintD.rimSaturate === 0;
    if (lensAtRest && glintAtRest) {
      __retuneLens(null);
      return;
    }
    __retuneLens({
      bezelX: lensD.bezelX,
      thicknessX: lensD.thicknessX,
      ior: lensD.ior === 0 ? null : lensD.ior,
      profileP: lensD.profileP,
      concave: lensD.concave,
      preBlur: lensD.preBlur,
      glintBandX: glintD.glintBandX,
      glintFalloff: glintD.glintFalloff,
      rimSaturate: glintD.rimSaturate,
    });
  }, [open, lensD, glintD]);
  React.useEffect(() => () => __retuneLens(null), []);

  /* The material dials: one injected sheet, shipped x dial, both modes from their own probes. */
  React.useEffect(() => {
    if (!open) return;
    tokens.current ??= snapshot();
    const tag = document.createElement("style");
    tag.setAttribute("data-lens-bench", "");
    tag.textContent = styleSheet(tokens.current, mat);
    document.head.appendChild(tag);
    return () => tag.remove();
  }, [open, mat]);

  React.useEffect(() => {
    if (!open) return;
    const sweep = () => {
      let count = 0;
      for (const filter of document.querySelectorAll("filter[id^='kui-lens']")) {
        const id = filter.id;
        if (!shipped.current.has(id)) {
          const found = recover(filter);
          if (!found) continue;
          shipped.current.set(id, found);
        }
        apply(filter, shipped.current.get(id)!, bend, fringe);
        count += 1;
      }
      setSeen(count);
    };
    sweep();
    /**
     * Panes come and go — a resize remints a map, a menu opens, a card scrolls past — and a
     * filter minted after a drag carries the config values, so it would sit on screen beside
     * the ones this panel has already moved. Watching for new ones is what keeps the whole
     * document at one setting.
     *
     * THE HOST IS FOUND BY WHAT IT CONTAINS (2026-08-23, Kushagra: the bench "seems to only
     * affect controls or triggers and cards, not menus or dialogs"). The first spelling took
     * `svg[aria-hidden="true"]`, which is what `refraction.tsx` builds its host as — and also
     * what every icon on the page is: measured, 229 of them on `/preview`, so `querySelector`
     * returned an icon inside a span and the observer watched a node that never changes. Panes
     * already on screen were swept once by the call above and looked right; a menu or dialog
     * mints its filter when it OPENS, which is after that sweep, so those never moved at all.
     *
     * Two observers, because the host is created lazily and only when the first glass pane
     * mounts: one on `<body>`, childList only and therefore cheap, to notice it arriving, and
     * one on the host itself for the filters inside it. Re-resolved on every callback rather
     * than captured, so a host torn down and rebuilt is picked up.
     */
    let watched: Element | null = null;
    let inner: MutationObserver | null = null;
    const attach = () => {
      const host = document.querySelector("filter[id^='kui-lens']")?.closest("svg") ?? null;
      if (host === watched) return;
      inner?.disconnect();
      watched = host;
      if (!host) return;
      inner = new MutationObserver(sweep);
      inner.observe(host, { childList: true, subtree: true });
      sweep();
    };
    attach();
    const outer = new MutationObserver(attach);
    outer.observe(document.body, { childList: true });
    return () => {
      outer.disconnect();
      inner?.disconnect();
    };
  }, [open, bend, fringe]);

  const reset = () => {
    setBend(1);
    setFringe(1);
    setLensD(LENS_DEFAULT);
    setGlintD(GLINT_DEFAULT);
    setMat(MAT_DEFAULT);
  };

  /** The diff, stated as the levers to move — every dial maps onto one config line. */
  const readout = () =>
    [
      "// The material bench's settings — each line is one config lever.",
      "// packages/ui/src/system/refraction.tsx:",
      `//   lens ladder: bezel x${lensD.bezelX}, thickness x${lensD.thicknessX}, ior ${lensD.ior === 0 ? "(ladder's own)" : lensD.ior}`,
      `//   PROFILE_P ${lensD.profileP}${lensD.concave ? " CONCAVE" : ""}, pre-blur ${lensD.preBlur}px`,
      `//   glint: band x${glintD.glintBandX}, falloff ${glintD.glintFalloff}, rimSaturate ${glintD.rimSaturate}`,
      `//   bend x${bend} (boost), fringe x${fringe}`,
      "// packages/ui/src/tokens/config.ts (material):",
      `//   veil x${mat.veil}, blur x${mat.blur}, saturate x${mat.sat}, contrast ${mat.contrast === 1 ? "(none)" : `+contrast(${mat.contrast})`}`,
      `//   sheen x${mat.sheen}, ring alphas x${mat.edge}`,
    ].join("\n");

  if (!open) {
    return (
      <Button size="1" emphasis="quiet" bordered onClick={() => setOpen(true)}>
        Material bench
      </Button>
    );
  }

  return (
    <Card size="2">
      <Stack gap="4">
        <Flex justify="space-between" align="center" gap="3">
          <Heading size="2" render={<h2 />}>
            Material bench
          </Heading>
          <Button size="1" emphasis="quiet" onClick={() => setOpen(false)}>
            Close
          </Button>
        </Flex>
        <Text size="1" emphasis="medium">
          Live on every glass pane on the page. Put something busy behind one — the Materials
          section, or a menu over the hostile bed — and drag. 1.0&times; everywhere is the
          shipped package.
        </Text>

        <Heading size="1" render={<h3 />}>
          Lens
        </Heading>
        <Slider label="bezel width" value={lensD.bezelX} min={0.25} max={8} step={0.25} suffix="×" onChange={(v) => setLensD({ ...lensD, bezelX: v })} />
        <Slider label="glass depth" value={lensD.thicknessX} min={0.25} max={8} step={0.25} suffix="×" onChange={(v) => setLensD({ ...lensD, thicknessX: v })} />
        <Slider label="refraction index (0 = ladder)" value={lensD.ior} min={0} max={2.6} step={0.05} suffix="" onChange={(v) => setLensD({ ...lensD, ior: v < 1.1 ? 0 : v })} />
        <Slider label="profile exponent" value={lensD.profileP} min={1} max={6} step={0.5} suffix="" onChange={(v) => setLensD({ ...lensD, profileP: v })} />
        <Slider label="pre-blur (frost before the bend)" value={lensD.preBlur} min={0} max={4} step={0.25} suffix="px" onChange={(v) => setLensD({ ...lensD, preBlur: v })} />
        <Flex gap="2" align="center">
          <Button size="1" emphasis={lensD.concave ? "loud" : "quiet"} bordered onClick={() => setLensD({ ...lensD, concave: !lensD.concave })}>
            Concave (the lab&rsquo;s diamond)
          </Button>
        </Flex>
        <Slider label="bend" value={bend} min={0} max={4} step={0.05} suffix="×" onChange={setBend} />
        <Slider label="fringe" value={fringe} min={0} max={6} step={0.05} suffix="×" onChange={setFringe} />

        <Heading size="1" render={<h3 />}>
          Glint
        </Heading>
        <Slider label="band width (0 = off)" value={glintD.glintBandX} min={0} max={3} step={0.1} suffix="×" onChange={(v) => setGlintD({ ...glintD, glintBandX: v })} />
        <Slider label="feather" value={glintD.glintFalloff} min={0.5} max={6} step={0.1} suffix="" onChange={(v) => setGlintD({ ...glintD, glintFalloff: v })} />
        <Slider label="rim saturate (0 = off)" value={glintD.rimSaturate} min={0} max={9} step={0.5} suffix="" onChange={(v) => setGlintD({ ...glintD, rimSaturate: v })} />

        <Heading size="1" render={<h3 />}>
          Material
        </Heading>
        <Slider label="veil" value={mat.veil} min={0.25} max={1.5} step={0.05} suffix="×" onChange={(v) => setMat({ ...mat, veil: v })} />
        <Slider label="blur" value={mat.blur} min={0} max={3} step={0.1} suffix="×" onChange={(v) => setMat({ ...mat, blur: v })} />
        <Slider label="saturation" value={mat.sat} min={0.5} max={2} step={0.05} suffix="×" onChange={(v) => setMat({ ...mat, sat: v })} />
        <Slider label="contrast term" value={mat.contrast} min={0.7} max={1.4} step={0.05} suffix="" onChange={(v) => setMat({ ...mat, contrast: v })} />
        <Slider label="sheen" value={mat.sheen} min={0} max={2} step={0.1} suffix="×" onChange={(v) => setMat({ ...mat, sheen: v })} />
        <Slider label="edge light" value={mat.edge} min={0} max={3} step={0.1} suffix="×" onChange={(v) => setMat({ ...mat, edge: v })} />

        <Text size="1" emphasis="quiet">
          {seen} lens{seen === 1 ? "" : "es"} on the page.
        </Text>

        <Flex gap="2" align="center" wrap="wrap">
          <Button size="1" emphasis="quiet" bordered onClick={reset}>
            Reset
          </Button>
          <Button size="1" emphasis="quiet" bordered onClick={() => void navigator.clipboard?.writeText(readout())}>
            Copy notes
          </Button>
        </Flex>
      </Stack>
    </Card>
  );
}
