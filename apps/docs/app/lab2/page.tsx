"use client";

/**
 * Lab 2 — the material, full reign. SCRATCH, never shipped.
 *
 * One rung (Stacked), no sliders: a committed recipe. Three scenes per mode:
 * the drifting backdrop (glass at its most alive), the river (content sliding
 * under a glass toolbar — layering as the app's normal grammar), tinted glass,
 * and the calm bed (the collapse: glass over nothing reads as solid).
 */

import React, { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Flex,
  Heading,
  Kbd,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
  Separator,
  Slider,
  Stack,
  Text,
  Theme,
} from "@kookie-ui/react";

import "./lab2.css";

/**
 * True refraction (Chromium): an SVG displacement map applied as backdrop-filter.
 * The map is COMPUTED from physics — the method from kube.io's "Liquid Glass in the
 * Browser" (credited; the math re-implemented, not their code): the bezel is a curved
 * glass surface, each pixel's bend follows Snell's law (air 1.0 → glass 1.5) on the
 * surface's slope, direction is the outward normal of the rounded-rect distance field.
 * Red encodes X-bend, green Y-bend, 128 = straight through. The body stays true; only
 * the bezel lenses — hard at the lip, fading smoothly inward.
 * Chromatic aberration: R/G/B are displaced at slightly different strengths and
 * screen-blended back — light splitting at the bezel, for real.
 * The honest limit: a map fits one box, so lab cards are fixed-size.
 */

/** Signed distance to a rounded-rect border: negative inside, positive outside. */
function sdRoundedRect(x: number, y: number, w: number, h: number, r: number) {
  const qx = Math.abs(x - w / 2) - (w / 2 - r);
  const qy = Math.abs(y - h / 2) - (h / 2 - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

/** Kube's parameter set: the bezel's surface profile, its width, the glass thickness and
 *  the refractive index. The displacement STRENGTH is derived, not chosen: each sample's
 *  bend is thickness × local depth × tan(θ1 − θ2), Snell over the profile's slope. */
export type Profile = "circle" | "squircle" | "concave" | "lip";
export type LensParams = {
  profile: Profile;
  bezel: number; // px
  thickness: number; // px of glass
  ior: number; // air 1.0 → glass ~1.5
  fringe: number; // % scale spread between R and B channels
  boost: number; // × multiplier past the derived strength — taste's override of physics
};

/** Height H(t) and slope H'(t) of the bezel surface; t: 0 at the lip → 1 interior. */
function surface(profile: Profile, t: number): { height: number; slope: number } {
  const u = 1 - t;
  const circle = {
    height: Math.sqrt(Math.max(1 - u * u, 0)),
    slope: u / Math.sqrt(Math.max(1 - u * u, 0.04)),
  };
  if (profile === "circle") return circle;
  if (profile === "squircle") {
    const u4 = u * u * u * u;
    return {
      height: Math.pow(Math.max(1 - u4, 0), 0.25),
      slope: (u * u * u) / Math.pow(Math.max(1 - u4, 0.04), 0.75),
    };
  }
  if (profile === "concave") return { height: circle.height, slope: -circle.slope };
  // lip: concave at the very edge blending to convex inward (smootherstep).
  const s = t * t * t * (t * (t * 6 - 15) + 10);
  return { height: circle.height, slope: circle.slope * (2 * s - 1) };
}

function physicalMap(
  w: number,
  h: number,
  r: number,
  p: LensParams,
): { url: string; max: number } {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const bezel = Math.min(p.bezel, Math.floor(Math.min(w, h) / 2) - 2);

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
      const { height, slope } = surface(p.profile, t);
      // Geometric slope: the profile is thickness tall over bezel wide.
      const geo = (slope * p.thickness) / bezel;
      const theta1 = Math.atan(Math.abs(geo));
      const theta2 = Math.asin(Math.min(Math.sin(theta1) / p.ior, 1));
      // Lateral shift: deviation over the glass depth below this point of the surface.
      const mag = Math.sign(geo) * p.thickness * height * Math.tan(theta1 - theta2);
      const gx =
        sdRoundedRect(x + 1.5, y + 0.5, w, h, r) - sdRoundedRect(x - 0.5, y + 0.5, w, h, r);
      const gy =
        sdRoundedRect(x + 0.5, y + 1.5, w, h, r) - sdRoundedRect(x + 0.5, y - 0.5, w, h, r);
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
  // Clamped at the bezel width: past that, the displacement asks for pixels outside the
  // element's backdrop and the bend washes out instead of bending.
  return { url: canvas.toDataURL(), max: Math.min(maxAbs, bezel) };
}

function Refractor({
  id,
  map,
  base,
  spread,
  w,
  h,
}: {
  id: string;
  map: string;
  base: number;
  spread: number;
  w: number;
  h: number;
}) {
  // Three displacements at slightly different scales, one per channel, screened back
  // together: the edge splits light. Scales within ~8% so the body stays registered.
  const keepR = "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0";
  const keepG = "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0";
  const keepB = "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0";
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feImage href={map} x={0} y={0} width={w} height={h} preserveAspectRatio="none" result="map" />
      <feGaussianBlur in="map" stdDeviation="3" result="soft" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="soft"
        scale={base * (1 + spread)}
        xChannelSelector="R"
        yChannelSelector="G"
        result="dr"
      />
      <feColorMatrix in="dr" type="matrix" values={keepR} result="cr" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="soft"
        scale={base}
        xChannelSelector="R"
        yChannelSelector="G"
        result="dg"
      />
      <feColorMatrix in="dg" type="matrix" values={keepG} result="cg" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="soft"
        scale={base * (1 - spread)}
        xChannelSelector="R"
        yChannelSelector="G"
        result="db"
      />
      <feColorMatrix in="db" type="matrix" values={keepB} result="cb" />
      <feBlend in="cr" in2="cg" mode="screen" result="rg" />
      <feBlend in="rg" in2="cb" mode="screen" />
    </filter>
  );
}

function RefractionDefs({ params, on }: { params: LensParams; on: boolean }) {
  // Canvas is a browser fact: the maps compute after mount and on every parameter change.
  // Until then the CSS fallback chain serves the pre-refraction glass.
  //
  // Chrome evaluates url(#) references ONCE: it neither revives a reference that was dead
  // when applied nor watches a filter's internals mutate (the menus proved both). So every
  // params change mints NEW filter ids, and the chains are applied by an injected
  // stylesheet AFTER React has committed the filters to the DOM.
  const [maps, setMaps] = useState<{
    card: { url: string; max: number };
    pill: { url: string; max: number };
    mini: { url: string; max: number };
  } | null>(null);
  useEffect(() => {
    setMaps({
      card: physicalMap(340, 210, 64, params),
      pill: physicalMap(330, 56, 26, params),
      mini: physicalMap(200, 96, 40, params),
    });
  }, [params]);

  const key = `${params.profile}-${params.bezel}-${params.thickness}-${Math.round(params.ior * 100)}-${params.fringe}-${Math.round(params.boost * 10)}`;
  const styleRef = useRef<HTMLStyleElement | null>(null);
  useEffect(() => {
    // Refraction OFF: drop the injected chains and let the plain CSS material serve
    // (2026-08-15 — the switch exists to answer whether the bend earns its cost).
    if (!on) {
      styleRef.current?.remove();
      styleRef.current = null;
      return;
    }
    if (!maps) return;
    if (!styleRef.current) {
      styleRef.current = document.createElement("style");
      document.head.appendChild(styleRef.current);
    }
    const chain = (id: string) =>
      `url(#${id}) blur(calc(var(--l2-blur) * var(--l2-blur-x, 1))) saturate(var(--l2-sat)) brightness(var(--l2-bright))`;
    styleRef.current.textContent =
      `.l2-card.l2-glass:not(.l2-mini):not(.l2-sealed){backdrop-filter:${chain(`l2-refract-card-${key}`)};}` +
      `.l2-mini.l2-glass:not(.l2-sealed){backdrop-filter:${chain(`l2-refract-mini-${key}`)};}` +
      `.l2-toolbar.l2-glass{backdrop-filter:${chain(`l2-refract-pill-${key}`)};}`;
  }, [maps, key, on]);
  useEffect(() => () => styleRef.current?.remove(), []);

  if (!maps || !on) return null;
  const spread = params.fringe / 100;
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
      <Refractor
        id={`l2-refract-card-${key}`}
        map={maps.card.url}
        base={maps.card.max * params.boost}
        spread={spread}
        w={340}
        h={210}
      />
      <Refractor
        id={`l2-refract-pill-${key}`}
        map={maps.pill.url}
        base={maps.pill.max * params.boost}
        spread={spread}
        w={330}
        h={56}
      />
      <Refractor
        id={`l2-refract-mini-${key}`}
        map={maps.mini.url}
        base={maps.mini.max * params.boost}
        spread={spread}
        w={200}
        h={96}
      />
    </svg>
  );
}

function CardText({ title, line }: { title: string; line: string }) {
  return (
    <Stack gap="1">
      <Text render={<div />} size="3" weight="semibold">
        {title}
      </Text>
      <Text render={<div />} size="2" emphasis="medium">
        {line}
      </Text>
    </Stack>
  );
}

function HeroCard({
  material,
  title,
  line,
  actions = false,
}: {
  material: string;
  title: string;
  line: string;
  actions?: boolean;
}) {
  const glass = material !== "solid";
  return (
    <div className={`l2-card ${glass ? `l2-glass l2-${material}` : "l2-solid"}`}>
      <Stack gap="3">
        <CardText title={title} line={line} />
        {actions ? (
          <Flex gap="2">
            <Button size="2" tone="accent" emphasis="loud">
              Open
            </Button>
            <Button size="2" emphasis="quiet">
              Later
            </Button>
          </Flex>
        ) : null}
      </Stack>
    </div>
  );
}

const TILES = [
  "linear-gradient(135deg, var(--blue-9), var(--blue-11))",
  "linear-gradient(135deg, var(--orange-9), var(--amber-9))",
  "linear-gradient(135deg, var(--green-9), var(--blue-9))",
  "linear-gradient(135deg, var(--amber-9), var(--orange-11))",
  "linear-gradient(135deg, var(--blue-11), var(--green-9))",
  "linear-gradient(135deg, var(--orange-11), var(--blue-9))",
];

function Pill({ material = "regular" }: { material?: "thin" | "regular" | "thick" | "solid" }) {
  const cls = material === "solid" ? "l2-toolbar l2-solid" : `l2-toolbar l2-glass l2-${material}`;
  return (
    <div className={cls}>
      <Button size="2" emphasis="quiet">
        Library
      </Button>
      <Button size="2" emphasis="quiet">
        For You
      </Button>
      <Button size="2" tone="accent" emphasis="loud">
        Play
      </Button>
    </div>
  );
}

function PillStack() {
  return (
    <div className="l2-pillstack">
      <Pill material="thin" />
      <Pill material="regular" />
      <Pill material="thick" />
      <Pill material="solid" />
    </div>
  );
}

function PillRiver() {
  const run = [...TILES, ...TILES];
  return (
    <div className="l2-pillriver">
      <div className="l2-track">
        {run.map((bg, i) => (
          <div key={i} className="l2-tile" style={{ background: bg }}>
            {String((i % TILES.length) + 1).padStart(2, "0")}
          </div>
        ))}
      </div>
      <PillStack />
    </div>
  );
}

function River() {
  // The track holds the tile run twice; the animation walks -50%, so it loops seamlessly.
  const run = [...TILES, ...TILES];
  return (
    <div className="l2-scene">
      <div className="l2-track">
        {run.map((bg, i) => (
          <div key={i} className="l2-tile" style={{ background: bg }}>
            {String((i % TILES.length) + 1).padStart(2, "0")}
          </div>
        ))}
      </div>
      <Pill />
    </div>
  );
}

function FrameMeter() {
  // Average fps and worst single frame over each half-second window, from rAF deltas.
  const [stats, setStats] = useState({ fps: 0, worst: 0 });
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastPush = last;
    let acc: number[] = [];
    const tick = (t: number) => {
      acc.push(t - last);
      last = t;
      if (t - lastPush > 500 && acc.length > 0) {
        const avg = acc.reduce((a, b) => a + b, 0) / acc.length;
        setStats({ fps: Math.round(1000 / avg), worst: Math.round(Math.max(...acc)) });
        acc = [];
        lastPush = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <Text size="2" weight="semibold">
      {stats.fps} fps · worst frame {stats.worst}ms
    </Text>
  );
}

function StressTest() {
  const [count, setCount] = useState(12);
  const [layered, setLayered] = useState(6);
  const live = Math.min(layered, count);
  const run = [...TILES, ...TILES, ...TILES, ...TILES];
  return (
    <Theme appearance="light">
      <div className="l2-panel">
        <Flex gap="6" p="5" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
          <LensSlider label="Panes" value={count} onChange={setCount} min={1} max={60} step={1} />
          <LensSlider
            label="…of which layered (glass)"
            value={layered}
            onChange={setLayered}
            min={0}
            max={60}
            step={1}
          />
          <FrameMeter />
        </Flex>
        <div className="l2-stress">
          <div className="l2-track">
            {run.map((bg, i) => (
              <div key={i} className="l2-tile" style={{ background: bg }}>
                {String((i % TILES.length) + 1).padStart(2, "0")}
              </div>
            ))}
          </div>
          <div className="l2-stress-grid">
            {Array.from({ length: count }, (_, i) => {
              const glass = i < live;
              return (
                <div
                  key={i}
                  className={`l2-card l2-glass l2-regular l2-mini${glass ? "" : " l2-sealed"}`}
                >
                  <Stack gap="0">
                    <Text render={<div />} size="2" weight="semibold">
                      {glass ? "Layered" : "Sealed"}
                    </Text>
                    <Text render={<div />} size="2" emphasis="medium">
                      {glass ? "True glass — pays the readback." : "Static composite — free."}
                    </Text>
                  </Stack>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Theme>
  );
}

function MenuRow() {
  return (
    <>
      {["thin", "regular", "thick", "solid"].map((m) => (
        <Menu key={m} size="2">
          <MenuTrigger
            render={
              <Button size="2" emphasis="medium">
                {m[0]?.toUpperCase() + m.slice(1)}
              </Button>
            }
          />
          <MenuContent className={`l2-menu l2-menu-${m}`}>
            <MenuGroup>
              <MenuLabel>File</MenuLabel>
              <MenuItem trailing={<Kbd>⌘D</Kbd>}>Duplicate</MenuItem>
              <MenuItem>Rename</MenuItem>
              <MenuItem disabled>Move to…</MenuItem>
            </MenuGroup>
            <Separator />
            <MenuCheckboxItem defaultChecked>Show hidden files</MenuCheckboxItem>
            <MenuCheckboxItem>Compact list</MenuCheckboxItem>
            <Separator />
            <MenuGroup>
              <MenuLabel>Sort by</MenuLabel>
              <MenuRadioGroup defaultValue="name">
                <MenuRadioItem value="name">Name</MenuRadioItem>
                <MenuRadioItem value="date">Date modified</MenuRadioItem>
              </MenuRadioGroup>
            </MenuGroup>
            <Separator />
            <MenuItem tone="destructive">Delete…</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </>
  );
}

/** The entry judged from every side the positioner can hold — including CENTER, whose
    growth axis has no lean at all. */
function MenuPositions() {
  const cells = [
    { label: "Bottom center", side: "bottom", align: "center" },
    { label: "Bottom end", side: "bottom", align: "end" },
    { label: "Top center", side: "top", align: "center" },
    { label: "Top start", side: "top", align: "start" },
    { label: "Right", side: "right", align: "start" },
    { label: "Left", side: "left", align: "start" },
  ] as const;
  return (
    <>
      {cells.map(({ label, side, align }) => (
        <Menu key={label} size="2">
          <MenuTrigger
            render={
              <Button size="2" emphasis="medium">
                {label}
              </Button>
            }
          />
          <MenuContent className="l2-menu l2-menu-regular" side={side} align={align}>
            <MenuGroup>
              <MenuLabel>{label}</MenuLabel>
              <MenuItem trailing={<Kbd>⌘D</Kbd>}>Duplicate</MenuItem>
              <MenuItem>Rename</MenuItem>
              <MenuItem disabled>Move to…</MenuItem>
            </MenuGroup>
            <Separator />
            <MenuItem tone="destructive">Delete…</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </>
  );
}

function ButtonRank() {
  return (
    <Flex gap="3" style={{ alignItems: "center", flexWrap: "wrap" }}>
      <Button size="2" tone="accent" emphasis="loud">
        Continue
      </Button>
      <Button size="2" emphasis="medium">
        Options
      </Button>
      <Button size="2" emphasis="quiet">
        Cancel
      </Button>
      <Button size="2" tone="destructive" emphasis="loud">
        Delete
      </Button>
      {/* Disabled rides along to prove the stand-down: the world tokens go initial, the
          button drops flat with no lab rule saying so. */}
      <Button size="2" tone="accent" emphasis="loud" disabled>
        Disabled
      </Button>
    </Flex>
  );
}

const LOUD_GLASS_TONES = [
  "accent",
  "blue",
  "green",
  "orange",
  "amber",
  "success",
  "warning",
  "info",
  "destructive",
] as const;

function GlassRank() {
  return (
    <>
      <Button size="3" emphasis="quiet" className="l2-btn l2-glass l2-thin l2-btn-medium">
        Thin
      </Button>
      <Button size="3" emphasis="quiet" className="l2-btn l2-glass l2-regular l2-btn-medium">
        Regular
      </Button>
      <Button size="3" emphasis="quiet" className="l2-btn l2-glass l2-thick l2-btn-medium">
        Thick
      </Button>
      {/* Loud through the glass, once per family: the tone prop stamps the indirection,
          one class reads it — no per-color rule anywhere. */}
      {LOUD_GLASS_TONES.map((t) => (
        <Button
          key={t}
          size="3"
          tone={t}
          emphasis="quiet"
          className="l2-btn l2-glass l2-regular l2-btn-loud"
        >
          {t[0]?.toUpperCase() + t.slice(1)}
        </Button>
      ))}
    </>
  );
}

function ButtonRiver() {
  const run = [...TILES, ...TILES];
  return (
    <div className="l2-scene">
      <div className="l2-track">
        {run.map((bg, i) => (
          <div key={i} className="l2-tile" style={{ background: bg }}>
            {String((i % TILES.length) + 1).padStart(2, "0")}
          </div>
        ))}
      </div>
      <div className="l2-btnfloat">
        <GlassRank />
      </div>
    </div>
  );
}

/* One material knob-set per MODE (Kushagra 2026-08-14): light and dark are different
   worlds — dark's solids are milder, its milk reads as grey film — so each panel carries
   its own values and the sliders edit one mode at a time. */
export type MatKnobs = {
  sVeil: number;
  sBlur: number;
  sSat: number;
  sSheen: number;
  cVeil: number;
  cBlur: number;
  cSat: number;
  cSheen: number;
  loudA: number;
  loudC: number;
};

export const MAT_DEFAULTS: Record<"light" | "dark", MatKnobs> = {
  // Light surfaces, reconsidered (2026-08-14, invited): the day's whole direction was
  // near-clear stone — refraction and rim carrying the material, frost pulled to 20% —
  // and the card cells were priced before that turn. Veil down to 85 (the milk was
  // pre-refraction pricing), saturation up to 115 (vibrancy carried every judgment
  // today), sheen down to 85 (the bloom stacks on it; over photos it read as a wash).
  // Controls hold at 100 — their cells were priced TODAY, at their own scale. Loud
  // carries Kushagra's judged pair — 80% alpha, 1.6× chroma.
  light: { sVeil: 85, sBlur: 100, sSat: 115, sSheen: 85, cVeil: 100, cBlur: 100, cSat: 100, cSheen: 100, loudA: 80, loudC: 160 },
  // Dark: vibrancy is GLOW, not chroma — dark solids sit milder by design, so chroma
  // boosts move them little. Surfaces: veil 95 (a touch less black film), saturation 130
  // (a black veil mutes the backdrop harder than a white one), sheen 55 (white milk on
  // dark glass reads as grey film — the strongest cut of the set). Controls: same
  // arguments one scale down. Pigment a touch more opaque so colour doesn't dissolve
  // into the black bed — and the real lever is the lightness lift (loud-l 1.12 vs
  // light's 1.04), carried per-panel below, not on a slider.
  dark: { sVeil: 95, sBlur: 100, sSat: 130, sSheen: 55, cVeil: 100, cBlur: 100, cSat: 125, cSheen: 80, loudA: 85, loudC: 160 },
};

function AlertSizeRow() {
  /** The four sizes side by side — the index prices box, corner, padding, type and buttons
      together, and this row is where that whole chain is judged at once (2026-08-16). */
  return (
    <>
      {(["1", "2", "3", "4"] as const).map((size) => (
        <AlertDialog key={size} size={size}>
          <AlertDialogTrigger
            render={
              <Button size="2" emphasis="medium">
                Size {size}
              </Button>
            }
          />
          <AlertDialogContent className="l2-dlg l2-dlg-regular">
            <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Every project, member and API key goes with it. This cannot be undone.
            </AlertDialogDescription>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </>
  );
}

function DialogRow() {
  /** The REAL AlertDialog since 2026-08-16 — these cells were small Dialogs standing in
      for it while the component did not exist. Wrapped in lab2's own classes so the lab
      treatment (squircle, refraction pricing) applies here exactly as it does to the
      dialog cells; the materialization needs no lab override at all, because the shipped
      entry IS the alert's gesture (LOG 2026-08-16). */
  return (
    <>
      {(["thin", "regular", "thick"] as const).map((m) => (
        <AlertDialog key={m}>
          <AlertDialogTrigger
            render={
              <Button size="2" emphasis="medium">
                {m[0]?.toUpperCase() + m.slice(1)}
              </Button>
            }
          />
          <AlertDialogContent className={`l2-dlg l2-dlg-${m}`}>
            <AlertDialogTitle>Clear this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              The pane is {m} glass. The scrim behind it never changes — it states the
              app&apos;s condition, not the pane&apos;s construction.
            </AlertDialogDescription>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction tone="destructive">Clear</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </>
  );
}

/** The materialization at SURFACE-AREA extremes: the same entry carrying half the screen,
    then most of it — where the travel is short but the mass is huge. */
function DialogBig() {
  const cells = [
    { label: "Large — ~55vw × 55vh", w: "55vw", h: "55vh" },
    { label: "Huge — ~88vw × 85vh", w: "88vw", h: "85vh" },
  ] as const;
  return (
    <>
      {cells.map(({ label, w, h }) => (
        <Dialog key={label}>
          <DialogTrigger
            render={
              <Button size="2" emphasis="medium">
                {label}
              </Button>
            }
          />
          <DialogContent
            className="l2-dlg l2-dlg-regular"
            style={{ maxInlineSize: w, minBlockSize: h }}
          >
            <Stack gap="3">
              <DialogTitle>A pane with real surface area</DialogTitle>
              <DialogDescription>
                The same materialization carrying {label.toLowerCase()} — the seed, the rise
                and the unfurl are unchanged; only the mass differs.
              </DialogDescription>
              <Flex gap="2" style={{ justifyContent: "flex-end", marginBlockStart: "auto" }}>
                <DialogClose
                  render={
                    <Button size="2" emphasis="quiet">
                      Close
                    </Button>
                  }
                />
              </Flex>
            </Stack>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}

const MATERIALS = ["solid", "thin", "regular", "thick"] as const;
const RUNGS = ["quiet", "medium", "loud"] as const;

function MatrixButton({
  material,
  rung,
  tone,
  children,
}: {
  material: (typeof MATERIALS)[number];
  rung: (typeof RUNGS)[number];
  tone?: "accent" | "destructive" | "success" | "warning" | "info";
  children: React.ReactNode;
}) {
  // Solid is the shipped Button, untouched: the rung paints an opaque fill.
  if (material === "solid") {
    return (
      <Button size="2" emphasis={rung} {...(tone ? { tone } : {})}>
        {children}
      </Button>
    );
  }
  // Quiet asks for no fill, so there is nothing for the material to be made of: bare in
  // every material, with the alpha hover wash a translucent world needs.
  if (rung === "quiet") {
    return (
      <Button size="2" emphasis="quiet" {...(tone ? { tone } : {})} className="l2-btn-bare">
        {children}
      </Button>
    );
  }
  // Medium and loud DO ask for a fill, and on glass that fill is carried by the veil —
  // which is what makes material and emphasis independent without them fighting.
  const rungClass = rung === "loud" ? " l2-btn-loud" : " l2-btn-medium";
  return (
    <Button
      size="2"
      emphasis="quiet"
      {...(tone ? { tone } : {})}
      className={`l2-btn l2-glass l2-${material}${rungClass}`}
    >
      {children}
    </Button>
  );
}

function ButtonMatrix({ photo = false }: { photo?: boolean }) {
  return (
    <div className={`l2-matrix${photo ? " l2-matrix-photo" : ""}`}>
      <div />
      {RUNGS.map((r) => (
        <Text key={r} render={<div />} size="2" className="l2-matrix-head">
          {r}
        </Text>
      ))}
      {MATERIALS.map((mat) => (
        <React.Fragment key={mat}>
          <Text render={<div />} size="2" className="l2-matrix-row">
            {mat}
          </Text>
          {RUNGS.map((r) => (
            <div key={r}>
              <MatrixButton material={mat} rung={r} tone="accent">
                Continue
              </MatrixButton>
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

/* Rest / hover / press for all three rungs at once — painted, not pointed at, so the
   bands can be compared side by side. The whole question is whether any cell in one row
   matches a cell in another; if it does, that pair is ambiguous under the pointer. */
function StatesBoard() {
  const STATES = ["rest", "hover", "active"] as const;
  return (
    <div className="l2-matrix l2-states">
      <div />
      {STATES.map((st) => (
        <Text key={st} render={<div />} size="2" className="l2-matrix-head">
          {st}
        </Text>
      ))}
      {RUNGS.map((rung) => (
        <React.Fragment key={rung}>
          <Text render={<div />} size="2" className="l2-matrix-row">
            {rung}
          </Text>
          {STATES.map((st) => (
            <div key={st}>
              <Button
                size="2"
                tone="accent"
                emphasis={rung}
                {...(st === "rest" ? {} : { "data-l2-state": st })}
              >
                Continue
              </Button>
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

function ToneRow({ material }: { material: (typeof MATERIALS)[number] }) {
  return (
    <Flex gap="3" style={{ flexWrap: "wrap", alignItems: "center" }}>
      {(["accent", "info", "success", "warning", "destructive"] as const).map((t) => (
        <MatrixButton key={t} material={material} rung="loud" tone={t}>
          {t[0]?.toUpperCase() + t.slice(1)}
        </MatrixButton>
      ))}
    </Flex>
  );
}

function Panel({ appearance, m }: { appearance: "light" | "dark"; m: MatKnobs }) {
  return (
    <Theme appearance={appearance}>
      <div
        className="l2-panel"
        style={
          {
            "--l2s-veil": m.sVeil / 100,
            "--l2s-blur": m.sBlur / 100,
            "--l2s-sat": m.sSat / 100,
            "--l2s-sheen": m.sSheen / 100,
            "--l2cm-veil": m.cVeil / 100,
            "--l2cm-blur": m.cBlur / 100,
            "--l2cm-sat": m.cSat / 100,
            "--l2cm-sheen": m.cSheen / 100,
            "--l2cm-loud-a": m.loudA / 100,
            "--l2cm-loud-c": m.loudC / 100,
            "--l2cm-loud-l": appearance === "dark" ? 1.12 : 1.04,
          } as React.CSSProperties
        }
      >
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The button grid — material down, emphasis across. Two axes that multiply: a
            rung says how much the action matters, a material says what it is built of
          </Text>
        </div>
        <div className="l2-calm">
          <ButtonMatrix />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The rungs against their own states — a rung must never wear the rung above it,
            so no cell here should match a cell in another row
          </Text>
        </div>
        <div className="l2-calm">
          <StatesBoard />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The same grid over a photograph — where the glass has something to be glass over
          </Text>
        </div>
        <div className="l2-photo-2">
          <ButtonMatrix photo />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The third axis: tone. A colour is a meaning, not a loudness — every family at
            the loud rung, solid then glass
          </Text>
        </div>
        <div className="l2-calm" style={{ display: "block" }}>
          <Stack gap="5">
            <ToneRow material="solid" />
            <ToneRow material="regular" />
          </Stack>
        </div>
        <div className="l2-photo-1" style={{ padding: "var(--layout-space-7)" }}>
          <ToneRow material="regular" />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The backdrop drifts — glass at its most alive
          </Text>
        </div>
        <div className="l2-hero">
          <HeroCard material="thin" title="Quick Look" line="Thin — the lightest touch." />
          <HeroCard
            material="regular"
            title="Now Playing"
            line="Regular — the default. Colour pulled through the milk."
            actions
          />
          <HeroCard
            material="thick"
            title="Notifications"
            line="Thick — the most protected read."
          />
          <HeroCard material="solid" title="Details" line="Solid — matte. Light lands, none passes." />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The river — content slides under the glass; layering is the normal grammar
          </Text>
        </div>
        <River />
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The checker — hard edges, so the pill&apos;s bend has something to prove itself on
          </Text>
        </div>
        <PillRiver />
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The pills over the checker
          </Text>
        </div>
        <div className="l2-checker l2-pillbed">
          <PillStack />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The grid — lines curve at the bezel, straighten in the body
          </Text>
        </div>
        <div className="l2-grid l2-pillbed">
          <PillStack />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            Tinted glass — the veil carries a tone, the ink roles re-scope
          </Text>
        </div>
        <div className="l2-hero">
          <div className="l2-card l2-glass l2-regular l2-tint l2-tint-blue">
            <CardText title="Calendar" line="Wednesday, 3 events." />
          </div>
          <div className="l2-card l2-glass l2-regular l2-tint l2-tint-green">
            <CardText title="Fitness" line="Ring closed. 12,400 steps." />
          </div>
          <div className="l2-card l2-glass l2-regular l2-tint l2-tint-orange">
            <CardText title="Timer" line="14:32 remaining." />
          </div>
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The menu — the shipped motion system wearing the material
          </Text>
        </div>
        <div
          className="l2-hero"
          style={{ minHeight: 460, alignItems: "center", justifyContent: "center" }}
        >
          <MenuRow />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            Positions — the entry from every side, center included
          </Text>
        </div>
        <div
          className="l2-hero"
          style={{ minHeight: 460, alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 12 }}
        >
          <MenuPositions />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The menus over the checker
          </Text>
        </div>
        <div className="l2-checker l2-menubed">
          <MenuRow />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The menus over the grid
          </Text>
        </div>
        <div className="l2-grid l2-menubed">
          <MenuRow />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The menus over photograph one
          </Text>
        </div>
        <div className="l2-photo-1 l2-menubed">
          <MenuRow />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The menus over photograph two
          </Text>
        </div>
        <div className="l2-photo-2 l2-menubed">
          <MenuRow />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The ALERT — the real component since 2026-08-16, three materials over ONE
            scrim; the shipped materialization is its own gesture, no lab override
          </Text>
        </div>
        <div className="l2-photo-1 l2-menubed" style={{ minHeight: 280 }}>
          <DialogRow />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The alert at its four sizes — one index pricing box, corner, padding, type and
            buttons together
          </Text>
        </div>
        <div className="l2-photo-2 l2-menubed" style={{ minHeight: 200 }}>
          <AlertSizeRow />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The dialog at surface-area extremes — half the screen, then most of it
          </Text>
        </div>
        <div className="l2-photo-2 l2-menubed" style={{ minHeight: 200 }}>
          <DialogBig />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The buttons — Stacked keeps controls flat; Lit seats them in the light with the
            same primitives, no borrowed shadow row, no wash
          </Text>
        </div>
        <div className="l2-calm">
          <Stack gap="4">
            <Text render={<div />} size="2" emphasis="medium">
              Stacked — rung 1
            </Text>
            <ButtonRank />
          </Stack>
          <Stack gap="4" className="l2-lit">
            <Text render={<div />} size="2" emphasis="medium">
              Lit — rung 2
            </Text>
            <ButtonRank />
          </Stack>
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            Lit over the grid — the blast is diffuse enough to survive hard lines
          </Text>
        </div>
        <div className="l2-grid l2-menubed l2-lit">
          <ButtonRank />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            Glass buttons on the plain page — over nothing, glass quietly reads as a soft solid
          </Text>
        </div>
        <div className="l2-calm" style={{ alignItems: "center" }}>
          <GlassRank />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            Glass buttons over the river — the moving target, glass at its most alive
          </Text>
        </div>
        <ButtonRiver />
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            Glass buttons over the checker — the material earning its construction
          </Text>
        </div>
        <div className="l2-checker l2-menubed">
          <GlassRank />
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            Glass buttons over the photograph — thin to thick, then loud THROUGH the glass:
            smoke for accent, blood for destructive
          </Text>
        </div>
        <div className="l2-photo-2 l2-menubed">
          <GlassRank />
          <div className="l2-lit">
            <Button size="3" tone="accent" emphasis="loud">
              Play
            </Button>
          </div>
        </div>
        <div className="l2-strip-label">
          <Text size="2" emphasis="quiet">
            The calm bed — glass over nothing quietly reads as solid
          </Text>
        </div>
        <div className="l2-calm">
          <HeroCard material="regular" title="Regular" line="On a calm page." actions />
          <HeroCard material="solid" title="Solid" line="On a calm page." actions />
        </div>
      </div>
    </Theme>
  );
}

/**
 * Menus size to their content, so their maps are built at RUNTIME: when a popup appears,
 * it is measured (offsetWidth/Height — transform-safe while the unfurl plays), a filter
 * is generated for that exact geometry (cached per size), and the popup's paint chain is
 * swapped to include it. Solid menus are skipped. Lens-slider changes apply to menus
 * opened after the change.
 */
function DynamicRefraction({ params, on }: { params: LensParams; on: boolean }) {
  useEffect(() => {
    // OFF means OFF, for the floating families too. This guard was missing when the
    // switch shipped (2026-08-15): the flag reached the signature and nothing read it,
    // so menus and dialogs kept refracting while the pill obeyed — and the comparison
    // that flowed from it was worthless. A flag that is accepted and ignored is worse
    // than no flag: it produces confident, wrong evidence.
    if (!on) return;
    const spread = params.fringe / 100;
    const NS = "http://www.w3.org/2000/svg";
    // A DIRECT svg node, outside React: the filter must exist in the DOM in the same tick
    // that the style starts referencing it — Chrome does not re-resolve a url(#) that was
    // dead when first applied, and a dead reference kills the whole chain (blur included).
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    document.body.appendChild(svg);
    // The chain is applied via a STYLESHEET rule, not inline style — the same mechanism
    // as the working pill. Chromium resolves url(#) filter references differently across
    // the two forms, and the stylesheet form is the one proven on this page.
    const styleEl = document.createElement("style");
    document.head.appendChild(styleEl);

    const keepR = "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0";
    const keepG = "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0";
    const keepB = "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0";
    const cache = new Map<string, string>();

    // Pure DOM construction — createElementNS, no string parsing: the HTML fragment
    // parser is the suspect for camelCase SVG primitives, and the React-rendered static
    // filters (which work) never go through it.
    const mk = (tag: string, attrs: Record<string, string>) => {
      const el = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      return el;
    };
    const makeFilter = (id: string, url: string, base: number, w: number, h: number) => {
      const filter = mk("filter", { id, "color-interpolation-filters": "sRGB" });
      filter.append(
        mk("feImage", {
          href: url,
          x: "0",
          y: "0",
          width: String(w),
          height: String(h),
          preserveAspectRatio: "none",
          result: "map",
        }),
        mk("feGaussianBlur", { in: "map", stdDeviation: "3", result: "soft" }),
        mk("feDisplacementMap", {
          in: "SourceGraphic",
          in2: "soft",
          scale: (base * (1 + spread)).toFixed(2),
          xChannelSelector: "R",
          yChannelSelector: "G",
          result: "dr",
        }),
        mk("feColorMatrix", { in: "dr", type: "matrix", values: keepR, result: "cr" }),
        mk("feDisplacementMap", {
          in: "SourceGraphic",
          in2: "soft",
          scale: base.toFixed(2),
          xChannelSelector: "R",
          yChannelSelector: "G",
          result: "dg",
        }),
        mk("feColorMatrix", { in: "dg", type: "matrix", values: keepG, result: "cg" }),
        mk("feDisplacementMap", {
          in: "SourceGraphic",
          in2: "soft",
          scale: (base * (1 - spread)).toFixed(2),
          xChannelSelector: "R",
          yChannelSelector: "G",
          result: "db",
        }),
        mk("feColorMatrix", { in: "db", type: "matrix", values: keepB, result: "cb" }),
        mk("feBlend", { in: "cr", in2: "cg", mode: "screen", result: "rg" }),
        mk("feBlend", { in: "rg", in2: "cb", mode: "screen" }),
      );
      svg.appendChild(filter);
      const chain = `url(#${id}) blur(calc(var(--l2m-blur, 16px) * var(--l2-blur-x, 1))) saturate(var(--l2m-sat, 1.8)) brightness(var(--l2m-bright, 1.05))`;
      styleEl.sheet?.insertRule(
        `.l2-menu[data-l2-refract="${id}"] { -webkit-backdrop-filter: ${chain}; backdrop-filter: ${chain}; }`,
        styleEl.sheet.cssRules.length,
      );
    };

    // Found 2026-08-14 by driving the page with Playwright: the observer fires when the
    // popup is INSERTED — still 0-sized — and no further mutations ever come, so a
    // one-shot dress never ran (hot reload "fixed" it only because HMR floods the page
    // with mutations while the menu sits open). A popup is therefore dressed by a
    // frame-loop that retries until it has a size, then waits out its animations.
    // The unfurl ANIMATES the popup's width and height (the motion system's design), so a
    // nonzero size is not a final size — the first probe caught an 87×74 box mid-growth.
    // Dress only at a STABLE size: animations drained, two consecutive frames agreeing.
    const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
    const tryDress = async (el: HTMLElement) => {
      // The motion system measures the popup's FINAL box on mount into
      // --kui-fly-w/-h (the unfurl animates toward it) — so the true geometry is
      // knowable on frame one, and the refraction can ride the whole animation instead
      // of popping in after it.
      //
      // RENAMED 2026-08-16: the package collapsed its two entry runners into one and the
      // measured box became `--kui-fly-*`. This read still said `--kui-floating-*`, which
      // no longer resolves — getPropertyValue returns "", parseFloat gives NaN, and
      // `NaN >= 60` is false, so the fast path was dead for all ten frames and every menu
      // fell through to the settle-and-measure fallback below. Measured before the fix: the
      // panel finished growing at ~370ms and refraction landed at ~856ms. It was invisible
      // until the blur fix the same day — an undressed menu used to be frosted 2.8x harder,
      // which looked like glass, so nobody saw it arrive late.
      for (let i = 0; i < 10 && el.isConnected; i++) {
        const cs = getComputedStyle(el);
        const w = Math.round(parseFloat(cs.getPropertyValue("--kui-fly-w")));
        const h = Math.round(parseFloat(cs.getPropertyValue("--kui-fly-h")));
        if (w >= 60 && h >= 60) {
          const key = `${w}x${h}`;
          let id = cache.get(key);
          if (!id) {
            id = `l2-refract-menu-${key}`;
            const m = physicalMap(w, h, Math.min(40, Math.floor(h / 2) - 2), params);
            makeFilter(id, m.url, m.max * params.boost, w, h);
            cache.set(key, id);
          }
          el.dataset["l2Refract"] = id;
          return;
        }
        await frame();
      }
      // Fallback: no measured vars (e.g. reduced motion released them) — settle-and-measure.
      for (let i = 0; i < 240 && el.isConnected; i++) {
        const anims = el.getAnimations();
        if (anims.length > 0) {
          await Promise.allSettled(anims.map((a) => a.finished));
          continue;
        }
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        await frame();
        if (w >= 60 && h >= 60 && el.offsetWidth === w && el.offsetHeight === h) {
          const key = `${w}x${h}`;
          let id = cache.get(key);
          if (!id) {
            id = `l2-refract-menu-${key}`;
            const m = physicalMap(w, h, Math.min(40, Math.floor(h / 2) - 2), params);
            makeFilter(id, m.url, m.max * params.boost, w, h);
            cache.set(key, id);
          }
          el.dataset["l2Refract"] = id;
          return;
        }
      }
      delete el.dataset["l2Seen"];
    };
    const dress = () => {
      document.querySelectorAll<HTMLElement>(".l2-menu:not(.l2-menu-solid)").forEach((el) => {
        if (el.dataset["l2Seen"]) return;
        el.dataset["l2Seen"] = "1";
        void tryDress(el);
      });
    };

    const mo = new MutationObserver(() => {
      // Two frames: the popup measures itself on mount, then lays out.
      requestAnimationFrame(() => requestAnimationFrame(dress));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      svg.remove();
      styleEl.remove();
    };
  }, [params, on]);
  return null;
}

const PROFILES: Profile[] = ["circle", "squircle", "concave", "lip"];

function LensSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <Stack gap="1" style={{ flex: 1, minWidth: 170 }}>
      <Flex gap="2" style={{ justifyContent: "space-between" }}>
        <Text size="2" emphasis="medium">
          {label}
        </Text>
        <Text size="2">{value}</Text>
      </Flex>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(v) => onChange(Array.isArray(v) ? (v[0] ?? value) : v)}
      />
    </Stack>
  );
}

export default function Lab2Page() {
  // Kube's parameter set, live. Squircle is Apple's profile; strength derives from physics.
  // Defaults judged 2026-08-14 (Kushagra) — the material is DIAMOND, not glass: wide
  // bezel, thick, index 2.4, heavy fringe, full specular, frost pulled back to 80%.
  // Locked 2026-08-14 (Kushagra): near-clear diamond — blur pulled to 20%, the
  // refraction and rim carrying the material almost alone.
  const [params, setParams] = useState<LensParams>({
    profile: "concave",
    bezel: 120,
    thickness: 80,
    ior: 2.4,
    fringe: 40,
    boost: 2,
  });
  // Specular is paint, not lens: it drives the rim's opacity in CSS and never
  // regenerates the maps.
  const [spec, setSpec] = useState(100);
  // Frost dial: scales every material's own blur. 100 = the recipe as designed.
  const [blur, setBlur] = useState(20);
  // Surface + control material dials, one knob-set per mode. The sliders edit the mode
  // the toggle points at; BOTH panels always wear their own set.
  const [matMode, setMatMode] = useState<"light" | "dark">("light");
  const [mat, setMat] = useState(MAT_DEFAULTS);
  const setMatKey = (k: keyof MatKnobs) => (v: number) =>
    setMat((m) => ({ ...m, [matMode]: { ...m[matMode], [k]: v } }));
  const knobs = mat[matMode];

  // The refraction switch (2026-08-15). Off: no maps, no injected chains, and the flat
  // material below takes over — the honest "what if we never built the lens" view.
  const [refract, setRefract] = useState(true);
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.l2Flat = refract ? "off" : "on";
    return () => {
      delete el.dataset.l2Flat;
    };
  }, [refract]);

  // No engine probe here, deliberately. A JS feature test for refraction was written and
  // deleted the same hour (2026-08-15): `CSS.supports('backdrop-filter','url(#x)')`
  // answers TRUE in engines that parse the reference filter and then decline to draw it —
  // documented for Firefox (bug 1961378), and demonstrated for Safari by this lab, where
  // the radius fallback landed and the blur fallback did not. A feature query cannot be
  // asked "will you actually render this". The flat-engine material now rides the same
  // `@supports not (corner-shape: squircle)` guard as the radius fallback, in lab2.css.

  // The paint dials live on <html>, not on .l2: menu popups PORTAL outside this tree,
  // and a variable can only reach them from an ancestor they actually have.
  useEffect(() => {
    const s = document.documentElement.style;
    s.setProperty("--l2-spec", String(spec / 100));
    s.setProperty("--l2-blur-x", String(blur / 100));
    return () => {
      s.removeProperty("--l2-spec");
      s.removeProperty("--l2-blur-x");
    };
  }, [spec, blur]);

  // The moving light (kube's specular demo), done properly (2026-08-14: the one-global-
  // angle version jumped — an angle measured from the viewport center swings violently
  // when the pointer crosses the middle, and is wrong for far-away panes). PER-ELEMENT:
  // each rim measures the angle from its own center to the pointer, and EASES toward it
  // with wraparound-aware damping, so a pane the pointer sweeps past turns instead of
  // snapping. Paint-only; reduced motion stands it down.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let px = window.innerWidth / 2;
    let py = -200; // the sun starts above the page
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
    };
    window.addEventListener("pointermove", onMove);

    const angles = new WeakMap<Element, number>();
    let els: HTMLElement[] = [];
    let frame = 0;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      // Re-query every ~30 frames: menus come and go.
      if (frame++ % 30 === 0) {
        els = Array.from(
          document.querySelectorAll<HTMLElement>(".l2-glass, .l2-menu:not(.l2-menu-solid)"),
        );
      }
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Gradient direction points AWAY from the light: pointer → center, extended.
        const target = (Math.atan2(cx - px, -(cy - py)) * 180) / Math.PI;
        const cur = angles.get(el) ?? target;
        // Shortest arc, eased — the damping is what kills the jump.
        const diff = ((target - cur + 540) % 360) - 180;
        const next = Math.abs(diff) < 0.05 ? cur : cur + diff * 0.1;
        if (next !== cur) {
          angles.set(el, next);
          el.style.setProperty("--l2-light-angle", `${next.toFixed(2)}deg`);
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="l2"
      style={{ "--l2-spec": spec / 100, "--l2-blur-x": blur / 100 } as React.CSSProperties}
    >
      <RefractionDefs params={params} on={refract} />
      <DynamicRefraction params={params} on={refract} />
      <div className="l2-controls">
        <Flex gap="6" p="5" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
          <Stack gap="1" style={{ flex: "none" }}>
            <Text size="2" emphasis="medium">
              Refraction
            </Text>
            <Flex gap="1">
              {([true, false] as const).map((v) => (
                <Button
                  key={String(v)}
                  size="1"
                  emphasis={refract === v ? "loud" : "quiet"}
                  tone={refract === v ? "accent" : "neutral"}
                  onClick={() => setRefract(v)}
                >
                  {v ? "on" : "off"}
                </Button>
              ))}
            </Flex>
          </Stack>
          <Stack gap="1" style={{ flex: "none" }}>
            <Text size="2" emphasis="medium">
              Profile
            </Text>
            <Flex gap="1">
              {PROFILES.map((pr) => (
                <Button
                  key={pr}
                  size="1"
                  emphasis={params.profile === pr ? "loud" : "quiet"}
                  tone={params.profile === pr ? "accent" : "neutral"}
                  onClick={() => setParams({ ...params, profile: pr })}
                >
                  {pr}
                </Button>
              ))}
            </Flex>
          </Stack>
          <LensSlider
            label="Bezel (px)"
            value={params.bezel}
            onChange={(v) => setParams({ ...params, bezel: v })}
            min={6}
            max={120}
            step={1}
          />
          <LensSlider
            label="Thickness (px)"
            value={params.thickness}
            onChange={(v) => setParams({ ...params, thickness: v })}
            min={2}
            max={200}
            step={2}
          />
          <LensSlider
            label="Refraction index"
            value={params.ior}
            onChange={(v) => setParams({ ...params, ior: v })}
            min={1.05}
            max={2.4}
            step={0.05}
          />
          <LensSlider
            label="Fringe (%)"
            value={params.fringe}
            onChange={(v) => setParams({ ...params, fringe: v })}
            min={0}
            max={40}
            step={1}
          />
          <LensSlider
            label="Boost (×)"
            value={params.boost}
            onChange={(v) => setParams({ ...params, boost: v })}
            min={0.5}
            max={4}
            step={0.1}
          />
          <LensSlider
            label="Specular (%)"
            value={spec}
            onChange={setSpec}
            min={0}
            max={100}
            step={1}
          />
          <LensSlider label="Blur (%)" value={blur} onChange={setBlur} min={0} max={200} step={5} />
        </Flex>
        {/* The material rows — surface and control cells, one MODE at a time. The toggle
            picks which knob-set the sliders edit; both panels always wear their own. */}
        <Flex gap="6" p="5" style={{ flexWrap: "wrap", alignItems: "flex-end", paddingBlockStart: 0 }}>
          <Stack gap="1" style={{ flex: "none" }}>
            <Text size="2" emphasis="medium">
              Editing
            </Text>
            <Flex gap="1">
              {(["light", "dark"] as const).map((mo) => (
                <Button
                  key={mo}
                  size="1"
                  emphasis={matMode === mo ? "loud" : "quiet"}
                  tone={matMode === mo ? "accent" : "neutral"}
                  onClick={() => setMatMode(mo)}
                >
                  {mo}
                </Button>
              ))}
            </Flex>
          </Stack>
          <LensSlider label="Surface veil (%)" value={knobs.sVeil} onChange={setMatKey("sVeil")} min={0} max={250} step={5} />
          <LensSlider label="Surface blur (%)" value={knobs.sBlur} onChange={setMatKey("sBlur")} min={0} max={300} step={5} />
          <LensSlider label="Surface saturation (%)" value={knobs.sSat} onChange={setMatKey("sSat")} min={0} max={200} step={5} />
          <LensSlider label="Surface sheen (%)" value={knobs.sSheen} onChange={setMatKey("sSheen")} min={0} max={300} step={5} />
          <LensSlider label="Ctl veil (%)" value={knobs.cVeil} onChange={setMatKey("cVeil")} min={0} max={250} step={5} />
          <LensSlider label="Ctl blur (%)" value={knobs.cBlur} onChange={setMatKey("cBlur")} min={0} max={300} step={5} />
          <LensSlider label="Ctl saturation (%)" value={knobs.cSat} onChange={setMatKey("cSat")} min={0} max={200} step={5} />
          <LensSlider label="Ctl sheen (%)" value={knobs.cSheen} onChange={setMatKey("cSheen")} min={0} max={300} step={5} />
          <LensSlider label="Loud pigment (%)" value={knobs.loudA} onChange={setMatKey("loudA")} min={30} max={100} step={1} />
          <LensSlider label="Loud chroma (×100)" value={knobs.loudC} onChange={setMatKey("loudC")} min={100} max={200} step={1} />
        </Flex>
      </div>
      <Stack gap="2" p="5">
        <Heading size="4">The material — lab 2</Heading>
        <Text size="2" emphasis="medium">
          Stacked rung, committed recipe. Blur is the least of it: saturation pulls the
          backdrop&apos;s colour through, the rim is a gradient of entering light, thick glass
          splits a spectral whisper, and shadows follow opacity.
        </Text>
      </Stack>
      <Panel appearance="light" m={mat.light} />
      <Panel appearance="dark" m={mat.dark} />
      <Stack gap="1" p="5">
        <Heading size="4">Stress — where does it break?</Heading>
        <Text size="2" emphasis="medium">
          N frosted panes over moving content. Raise the count until the worst frame passes
          ~16ms; that number, on your slowest target hardware, is the card-tier budget.
        </Text>
      </Stack>
      <StressTest />
    </div>
  );
}
