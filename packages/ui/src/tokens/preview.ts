/**
 * Emits preview/density.html: the size-by-density matrix. Twelve control heights across
 * three levels cannot be judged by reading a config file, and the numbers are taste, so
 * the matrix is the gate on correcting them (§12, open questions).
 *
 * The density matrix draws boxes from the tokens directly — a token preview should not
 * depend on a component. The layout section goes one layer up: the real resolver against
 * the shipped stylesheet, since the runner cannot parse JSX to mount the components
 * themselves (those are covered in the browser suite).
 *
 * Run: node --experimental-strip-types src/tokens/preview.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { tones, type Mode, type ToneName } from "./color-config.ts";
import { buildScale, buildScaleFor, toneFromColor, type Scale } from "./color.ts";

import { density, radiusLevels, type DensityLevel } from "./config.ts";
import { resolveBoxProps, type BoxStyleProps } from "../system/resolve.ts";

/**
 * A Box the way the components make one: the REAL resolver emits the inline custom
 * properties, the shipped stylesheet arbitrates them. Only React itself is absent from this
 * page (the runner cannot parse JSX), so what the layout section proves is the whole
 * mechanism minus the element wrapper the browser suite already covers.
 */
function kuiBox(props: BoxStyleProps, body: string): string {
  const { style } = resolveBoxProps(props);
  const inline = Object.entries(style)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
  return `<div class="kui-box" style="${inline}">${body}</div>`;
}

/**
 * A sweep of arbitrary brand hues, none of them shipped tones. This is where the one-law
 * thesis is actually visible: if a single generator handles yellow and navy without either
 * being hand-placed, the sweep reads as one family. Bright hues are the ones to distrust.
 */
const SWEEP: Array<[string, number, number]> = [
  ["yellow", 100, 1],
  ["amber", 80, 1],
  ["lime", 130, 1],
  ["green", 150, 1],
  ["teal", 175, 1],
  ["cyan", 195, 1],
  ["sky", 230, 1],
  ["blue", 250, 1],
  ["indigo", 267, 1],
  ["violet", 290, 1],
  ["magenta", 340, 1],
  ["red", 25, 1],
];

function hueSweep(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>hue sweep — ${mode}</h2>
    ${SWEEP.map(([name, hue, vividness]) => {
      const s = buildScaleFor({ hue, vividness }, mode);
      return `<div class="sweep">
        <span class="sweep-name">${name}<br><span class="sweep-hex">${s.steps[8]}</span></span>
        <div class="row">${s.steps.map((hex, i) => `<div class="sw sm" title="${name}-${i + 1} ${hex}" style="background:${hex}"></div>`).join("")}</div>
        <div class="role" style="background:${s.solid};color:${s.contrast}">solid</div>
        <div class="role" style="background:${s.solidActive};color:${s.contrast}">active</div>
        <div class="role" style="background:${s.steps[2]};color:${s.label}">label</div>
      </div>`;
    }).join("")}
  </section>`;
}

const TONES = Object.keys(tones) as ToneName[];

const EMPHASES = ["loud", "medium", "quiet"] as const;

/** The Spinner's markup, mirroring the component (this file cannot parse JSX). */
function spinner(style = ""): string {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const opacity = (1 - (i / 8) * 0.85).toFixed(2);
    return `<rect x="11" y="2" width="2" height="5.5" rx="1" opacity="${opacity}" transform="rotate(${i * 45} 12 12)"/>`;
  }).join("");
  return `<svg viewBox="0 0 24 24" aria-hidden class="kui-spinner"${style ? ` style="${style}"` : ""}>${spokes}</svg>`;
}

/**
 * A Button as the component renders it: same classes, same data attributes, same stylesheet.
 * Written by hand here only because this file cannot parse JSX — the mounted component is
 * covered by the browser suite, and what this page is for is the eye.
 */
function button(
  attrs: { size?: string; tone?: string; emphasis?: string; bordered?: boolean; loading?: boolean },
  label: string,
): string {
  const { size = "2", tone = "neutral", emphasis = "medium", bordered, loading } = attrs;
  return `<button class="kui-control kui-button" data-size="${size}" data-tone="${tone}" data-emphasis="${emphasis}"${
    bordered ? ' data-bordered="true"' : ""
  }${loading ? ' data-loading="true" aria-busy="true"' : ""}>${
    loading ? spinner() : ""
  }${label}</button>`;
}

/**
 * The axis model in one grid: every tone against every rung, plain and bordered, plus the two
 * states. `bordered` is orthogonal (§10) — containment, not loudness — so it has to be legible
 * on all three rungs rather than only on the one it used to be shown with.
 */
function buttonMatrix(
  mode: Mode,
  tones: readonly string[] = TONES,
  heading: string = mode,
): string {
  // No loud + border column: judged useless by eye (2026-08-03) — a step-7 border against a
  // solid step-9 fill has no containment job, the fill already separates itself (§10).
  const columns = EMPHASES.flatMap((e) => [
    { label: e, emphasis: e, bordered: false },
    ...(e === "loud" ? [] : [{ label: `${e} + border`, emphasis: e, bordered: true }]),
  ]);
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${heading}</h2>
    <table class="axis-table">
      <thead><tr><th></th>${columns.map((c) => `<th>${c.label}</th>`).join("")}<th>disabled</th><th>loading</th></tr></thead>
      <tbody>
      ${tones
        .map(
          (tone) => `<tr>
          <th>${tone}</th>
          ${columns
            .map(
              (c) =>
                `<td>${button({ tone, emphasis: c.emphasis, bordered: c.bordered }, "Label")}</td>`,
            )
            .join("")}
          <td><button class="kui-control kui-button" data-size="2" data-tone="${tone}" data-emphasis="medium" data-disabled disabled>Label</button></td>
          <td>${button({ tone, emphasis: "medium", loading: true }, "Saving")}</td>
        </tr>`,
        )
        .join("")}
      </tbody>
    </table>
  </section>`;
}

/**
 * The same grid under a different brand accent, to answer the question the token preview
 * cannot: does an arbitrary hue survive being a *control* — every rung, every state, both
 * modes — or only look right as a swatch?
 *
 * The accent family is overridden on a wrapper; because `[data-tone="accent"]` resolves
 * `--tone-*` at the button, which sits below, the buttons inside simply pick it up. That is
 * §7's rebindable-accent claim doing real work rather than being asserted.
 */
function accentSwap(name: string, hex: string, mode: Mode): string {
  const t = toneFromColor(hex);
  const vars = (s: Scale) =>
    [
      `--accent-soft: ${s.steps[2]}`,
      `--accent-soft-hover: ${s.steps[3]}`,
      `--accent-soft-active: ${s.steps[4]}`,
      `--accent-solid: ${s.solid}`,
      `--accent-solid-hover: ${s.solidHover}`,
      `--accent-solid-active: ${s.solidActive}`,
      `--accent-border: ${s.steps[6]}`,
      `--accent-text: ${s.steps[10]}`,
      `--accent-label: ${s.label}`,
      `--accent-contrast: ${s.contrast}`,
    ].join("; ");
  // Class rules rather than an inline style: a baked inline value is unreachable by the
  // page-wide contrast toggle, which made these blocks the one place contrast="high"
  // silently did nothing. The high variant is baked beside the normal one instead.
  const cls = `swap-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${mode}`;
  // The second selector is load-bearing: custom properties resolve from the NEAREST ancestor,
  // and the dark section carries data-appearance="dark", where tokens.css re-declares the
  // whole theme accent family — closer than this wrapper, so a wrapper-only rule loses and
  // every dark block silently rendered theme violet. Re-asserting below the appearance
  // boundary is exactly what a nested Theme with its own accent would do.
  return `<style>
    .${cls}, .${cls} [data-appearance] { ${vars(buildScaleFor(t, mode))} }
    :root[data-contrast="high"] .${cls}, :root[data-contrast="high"] .${cls} [data-appearance] { ${vars(buildScaleFor(t, mode, "srgb", "high"))} }
  </style><div class="${cls}">${buttonMatrix(mode, ["accent"], `${name} — ${hex} — ${mode}`)}</div>`;
}

/** The static markup Card produces (LOG 2026-08-04): a shell — identity, not options. */
function card(body: string, style = "", material?: string): string {
  return `<div class="kui-surface kui-card" data-size="3" data-tone="neutral" data-emphasis="quiet" data-bordered${
    material ? ` data-material="${material}"` : ""
  }${style ? ` style="${style}"` : ""}>${body}</div>`;
}

/**
 * The shell, one mode per block (§10, §14 step 6): alpha nesting three deep, and the material
 * recipes over a deliberately hostile backdrop — the judgment §10 said could only happen
 * against real backdrops, not in prose. No variants to show, which is the point: everything a
 * Card can be is on this screen.
 */
function surfaceSection(mode: Mode): string {
  const muted = `style="color: var(--color-text-muted)"`;
  const nesting = card(
    `outer — <span ${muted}>--tone-a1 over the page</span>
      ${card(`nested — <span ${muted}>the same token, composited darker</span>
        ${card(`third level`, "margin-top: var(--space-4)")}`, "margin-top: var(--space-4)")}`,
    "flex: 1",
  );
  const hostile =
    "background: radial-gradient(circle at 20% 30%, #ff5f6d 0 12%, transparent 40%)," +
    " radial-gradient(circle at 75% 20%, #ffc371 0 18%, transparent 45%)," +
    " radial-gradient(circle at 60% 80%, #2bc0e4 0 15%, transparent 42%)," +
    " linear-gradient(115deg, #841e57, #144e68 55%, #1db954);" +
    " padding: var(--space-7); border-radius: var(--radius-surface);" +
    " display: flex; gap: var(--space-5); flex-wrap: wrap;";
  const materials = ["solid", "thin", "thick"]
    .map((m) =>
      card(
        `<strong>${m}</strong><div ${muted}>does the label survive?</div>
         <div style="margin-top: var(--space-4)">${button({ tone: "accent", emphasis: "loud" }, "Label")} ${button({}, "Label")}</div>`,
        "flex: 1; min-width: 200px",
        m === "solid" ? undefined : m,
      ),
    )
    .join("");
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${mode}</h2>
    <h3>alpha nesting — one token, three distinct levels (§10)</h3>
    <div style="display: flex; gap: var(--space-5)">${nesting}</div>
    <h3 style="margin-top: var(--space-7)">material over a hostile backdrop — v0 recipes (§10)</h3>
    <div style="${hostile}">${materials}</div>
  </section>`;
}

const swatch = (bg: string, title: string, label = "") =>
  `<div class="sw" title="${title}" style="background:${bg}">${label}</div>`;

/** Steps and the roles that read them. Rendered twice per scale: normal, then contrast=high. */
function stepsAndRoles(tone: string, s: Scale, withAlpha: boolean): string {
  return `
      <div class="row">${s.steps.map((hex, i) => swatch(hex, `${tone}-${i + 1} ${hex}`, String(i + 1))).join("")}</div>
      ${withAlpha ? `<div class="row">${s.alpha.map((v, i) => swatch(v, `${tone}-a${i + 1}`)).join("")}</div>` : ""}
      <div class="row roles">
        ${[
          ["solid", s.solid],
          ["hover", s.solidHover],
          ["active", s.solidActive],
        ]
          .map(([n, hex]) => `<div class="role" style="background:${hex};color:${s.contrast}">${n}</div>`)
          .join("")}
        <div class="role" style="background:${s.steps[2]};color:${s.label}">label on 3</div>
        <div class="role" style="background:${s.steps[4]};color:${s.label}">label on 5</div>
        <div class="role" style="background:${s.steps[2]};color:${s.steps[10]}">text on 3</div>
      </div>`;
}

/**
 * One scale at full depth, with its high-contrast variant directly beneath it. The swatches
 * are generator output rather than `var()` references, so the two states have to be rendered
 * side by side — a page-wide toggle cannot reach a baked value.
 */
function scaleRow(tone: string, normal: Scale, high: Scale): string {
  return `
    <div class="scale">
      <h3>${tone}${normal.isLowChroma ? ' <em>low chroma: solid takes step 12</em>' : ""}</h3>
      ${stepsAndRoles(tone, normal, true)}
      <div class="hc-label">contrast="high"</div>
      ${stepsAndRoles(tone, high, false)}
    </div>`;
}

function colorSection(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${mode}</h2>
    ${TONES.map((t) => scaleRow(t, buildScale(t, mode), buildScale(t, mode, "srgb", "high"))).join("")}
  </section>`;
}

/**
 * The role layer written out: what each token resolves to and what consumes it. Components
 * only ever touch this column, never the numbered steps (§7).
 */
const ROLE_MAP: Array<[string, string, string]> = [
  ["--tone-1, -2", "steps 1-2", "page and app backgrounds"],
  ["--tone-soft", "step 3", "medium emphasis, resting fill"],
  ["--tone-soft-hover", "step 4", "medium emphasis, hover (+1 step)"],
  ["--tone-soft-active", "step 5", "medium emphasis, pressed (+2 steps)"],
  ["--tone-border", "step 7", "the bordered boolean, separators"],
  ["--tone-solid", "step 9, or step 12 when low chroma", "loud emphasis, resting fill"],
  ["--tone-solid-hover", "generated, away from the label", "loud emphasis, hover"],
  ["--tone-solid-active", "generated, away from the label", "loud emphasis, pressed"],
  ["--tone-contrast", "white or black, chosen by APCA", "the label ON a loud fill"],
  ["--tone-text", "step 11", "links and prose on a tint"],
  ["--tone-label", "generated between 11 and 12", "control labels — a label is not a link"],
  ["--tone-a1 … -a12", "each step as alpha over the page", "nested surfaces, fills over media"],
];

/** What `contrast="high"` rewrites, and what it deliberately leaves alone (§7). */
const CONTRAST_MAP: Array<[string, string]> = [
  ["steps 6-8 (borders)", "pushed toward the extreme, so an edge separates harder"],
  ["steps 11-12 (text)", "pushed toward the extreme"],
  ["--tone-label", "follows the text band; must clear Lc 75, not 60"],
  ["--tone-solid-hover / -active", "spread widened 1.6x so states stay distinguishable"],
  ["--tone-solid (chromatic)", "untouched — that value is the brand colour"],
  ["--tone-solid (low chroma)", "deepens: it reads step 12, and a grey has no hue to protect"],
  ["steps 1-5, alpha ramp", "untouched"],
];

function roleMap(): string {
  const s = buildScale("accent", "light");
  const sample: Record<string, string> = {
    "--tone-soft": s.steps[2]!,
    "--tone-soft-hover": s.steps[3]!,
    "--tone-soft-active": s.steps[4]!,
    "--tone-border": s.steps[6]!,
    "--tone-solid": s.solid,
    "--tone-solid-hover": s.solidHover,
    "--tone-solid-active": s.solidActive,
    "--tone-contrast": s.contrast,
    "--tone-text": s.steps[10]!,
    "--tone-label": s.label,
  };
  return `<table class="roles-table">
    <thead><tr><th></th><th>token</th><th>resolves to</th><th>consumed by</th></tr></thead>
    <tbody>${ROLE_MAP.map(
      ([token, resolves, used]) =>
        `<tr><td>${sample[token] ? `<span class="chip" style="background:${sample[token]}"></span>` : ""}</td>
          <td><code>${token}</code></td><td>${resolves}</td><td>${used}</td></tr>`,
    ).join("")}</tbody>
  </table>`;
}

/**
 * Real brand colours through the intake (§7). Each is a hex someone actually ships, and light
 * mode reproduces it exactly at step 9 — the swatch marked 9 IS the hex beside the name. Edit
 * `BRANDS` here, or set `tones.accent` in color-config.ts, then re-run `pnpm run preview`.
 */
const BRANDS: Array<[string, string]> = [
  ["Radix violet", "#6E56CF"],
  ["Vercel blue", "#0070F3"],
  ["Linear indigo", "#5E6AD2"],
  ["Stripe indigo", "#635BFF"],
  ["Spotify green", "#1DB954"],
  ["Radix yellow", "#FFE629"],
  ["Radix red", "#E5484D"],
  ["teal", "#00C8B4"],
];

function brandSection(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>brand colours — ${mode}</h2>
    ${BRANDS.map(([name, hex]) => {
      const s = buildScaleFor(toneFromColor(hex), mode);
      const pinned = s.steps[8]!.toLowerCase() === hex.toLowerCase();
      return scaleRow(
        `${name} <em>${hex}${mode === "light" ? (pinned ? " — pinned exactly at step 9" : " — snapped, out of band") : " — re-derived, no pin in dark"}</em>`,
        s,
        buildScaleFor(toneFromColor(hex), mode, "srgb", "high"),
      );
    }).join("")}
  </section>`;
}

/** The sweep at the depth the shipped tones get, for judging one hue rather than the family. */
function sweepFull(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>every hue — ${mode}</h2>
    ${SWEEP.map(([name, hue, vividness]) =>
      scaleRow(
        name,
        buildScaleFor({ hue, vividness }, mode),
        buildScaleFor({ hue, vividness }, mode, "srgb", "high"),
      ),
    ).join("")}
  </section>`;
}

const LEVELS = Object.keys(density) as DensityLevel[];
const SIZES = [1, 2, 3, 4] as const;

/** A fake control: the real tokens, an icon square, a label at the size's own font step. */
const control = (size: number) => `
      <div class="control" data-size="${size}" style="
        height: var(--control-height-${size});
        padding-inline: var(--control-px-${size});
        gap: var(--control-gap-${size});
        border-radius: var(--radius-control-${size});
        font-size: var(--font-size-${size});
        line-height: 1;
      ">
        <span class="icon"></span>
        <span>Size ${size}</span>
      </div>
      <code class="readout" data-for="${size}"></code>`;

export function generatePreview(): string {
  return `<!doctype html>
<html lang="en" data-pointer="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KookieUI density x size</title>
<!-- The entry point, not a hand-kept list: it @imports every sheet the package ships, so a new
     component stylesheet reaches this page without anyone remembering to add it here. It did
     not, once, and the Button grid rendered as bare native buttons. -->
<link rel="stylesheet" href="../src/styles/index.css">
<style>
  /* The preview consumes the system it displays: every colour is a neutral or accent token,
     every distance a space step, every text style a (size, line-height, spacing) triple.
     The dark colour sections carry data-appearance="dark" and get their surface for free —
     the same rule, the tokens re-declared. Hard-coded values below are structural only. */
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--neutral-1); color: var(--neutral-12);
         font: var(--font-weight-regular) var(--font-size-2)/var(--line-height-2) var(--font-body); }
  main { max-width: 1240px; margin: 0 auto; padding: clamp(16px, 4vw, 48px); }
  code { font-family: var(--font-mono); font-size: 0.92em; }

  /* chrome */
  header { position: sticky; top: 0; z-index: 10; background: var(--neutral-1);
           border-bottom: 1px solid var(--neutral-4); }
  .bar { max-width: 1240px; margin: 0 auto; padding: var(--space-4) clamp(16px, 4vw, 48px);
         display: flex; flex-wrap: wrap; gap: var(--space-4) var(--space-8); align-items: center; }
  .brand { font-weight: var(--font-weight-semibold); font-size: var(--font-size-2); }
  .brand em { font-style: normal; color: var(--neutral-10); font-weight: var(--font-weight-regular); }
  nav.toc { display: flex; flex-wrap: wrap; gap: var(--space-5); font-size: var(--font-size-1);
            margin-right: auto; }
  nav.toc a { color: var(--neutral-11); text-decoration: none; }
  nav.toc a:hover { color: var(--neutral-12); }
  .toggle { display: flex; flex-wrap: wrap; gap: var(--space-3) var(--space-6); align-items: center;
            font-size: var(--font-size-1); color: var(--neutral-11); }
  .toggle label { display: flex; gap: var(--space-2); align-items: center; }

  /* rhythm: one heading scale, one note style, one section gap */
  h1 { font: var(--font-weight-semibold) var(--font-size-5)/var(--line-height-5) var(--font-body);
       letter-spacing: var(--letter-spacing-5); margin: var(--space-12) 0 var(--space-3);
       scroll-margin-top: 96px; }
  main > h1:first-child { margin-top: var(--space-8); }
  h2 { font: var(--font-weight-medium) var(--font-size-3)/var(--line-height-3) var(--font-body);
       margin: 0 0 var(--space-6); text-transform: lowercase; }
  h2 code { color: var(--neutral-11); font-weight: var(--font-weight-regular); }
  p.note { font-size: var(--font-size-2); color: var(--neutral-11); max-width: 64ch;
           margin: 0 0 var(--space-7); }

  /* the density matrix */
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, max-content));
          gap: var(--space-8) var(--space-10); margin-top: var(--space-9); }
  .stack { display: flex; flex-direction: column; align-items: start; gap: var(--space-4); }
  .control { display: inline-flex; align-items: center;
             background: var(--neutral-3); border: 1px solid var(--neutral-7);
             font-weight: var(--font-weight-medium); white-space: nowrap; }
  .icon { width: 1em; height: 1em; border-radius: 2px; background: var(--neutral-8); flex: none; }
  body:not(.icons) .icon { display: none; }
  .readout { font-family: var(--font-mono); font-size: 11px; color: var(--neutral-10); }
  .surfaces { display: flex; flex-wrap: wrap; gap: var(--space-6); margin-top: var(--space-10); }
  .surface { background: var(--neutral-2); border: 1px solid var(--neutral-6);
             padding: var(--space-6); font-size: var(--font-size-2); color: var(--neutral-11); }

  /* the layout rigs */
  .rig-meta { font-family: var(--font-mono); font-size: var(--font-size-1); color: var(--neutral-10);
              margin-top: var(--space-5); }
  .rig { resize: horizontal; overflow: auto; width: min(900px, 100%); min-width: 240px; max-width: 100%;
         border: 1px dashed var(--neutral-8); border-radius: var(--radius-surface);
         margin: var(--space-3) 0 var(--space-8); }
  .cell { padding: var(--space-4); background: var(--accent-3); border: 1px solid var(--accent-6);
          border-radius: var(--radius-control-2); color: var(--accent-text); text-align: center;
          font: var(--font-weight-medium) var(--font-size-2)/var(--line-height-2) var(--font-body); }

  /* the button axis grid */
  .axis-table { border-collapse: separate; border-spacing: var(--space-4) var(--space-3); }
  .axis-table th { font-size: var(--font-size-1); font-weight: var(--font-weight-medium);
                   color: var(--neutral-10); text-align: left; text-transform: lowercase; }
  .row-controls { display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: center;
                  margin-bottom: var(--space-9); }

  /* tables */
  .roles-table { border-collapse: collapse; font-size: var(--font-size-2); margin-bottom: var(--space-9);
                 display: block; overflow-x: auto; max-width: 100%; }
  .roles-table th { text-align: left; font-weight: var(--font-weight-medium); color: var(--neutral-10);
                    padding: var(--space-2) var(--space-5) var(--space-3) 0; font-size: var(--font-size-1); }
  .roles-table td { padding: var(--space-3) var(--space-5) var(--space-3) 0;
                    border-top: 1px solid var(--neutral-4); vertical-align: middle; }
  .roles-table code { font-size: var(--font-size-1); }
  .roles-table td:nth-child(3), .roles-table td:nth-child(4) { color: var(--neutral-11); }
  .chip { display: block; width: 22px; height: 22px; border-radius: var(--radius-2);
          border: 1px solid var(--neutral-a3); }
  .live { display: flex; gap: var(--space-3); flex-wrap: wrap; margin-bottom: var(--space-9); }
  .live > div { padding: var(--space-3) var(--space-5); border-radius: var(--radius-control-2);
                font-size: var(--font-size-2); font-weight: var(--font-weight-medium); }

  /* colour sections — the dark ones restyle themselves through their own data-appearance */
  /* Sections sit at the page level, both modes: their job is to stand in for an app page,
     which is neutral-1 (§7's role table). neutral-2 styled them as cards and judged every
     control against a backdrop one step grayer than the one it ships on. */
  .mode { margin-top: var(--space-9); padding: var(--space-7); border-radius: var(--radius-surface);
          overflow-x: auto; background: var(--neutral-1); color: var(--neutral-12);
          border: 1px solid var(--neutral-4); }
  .scale { margin-bottom: var(--space-7); }
  .scale h3 { font-size: var(--font-size-2); font-weight: var(--font-weight-medium); margin: 0 0 var(--space-3); }
  .scale h3 em { color: var(--neutral-10); font-weight: var(--font-weight-regular); font-style: normal; }
  .row { display: flex; gap: 2px; margin-bottom: 2px; }
  .sw { width: 56px; height: 36px; display: flex; align-items: end; justify-content: center;
        font-size: 10px; font-family: var(--font-mono); color: var(--neutral-a8); }
  .row.roles { margin-top: var(--space-3); gap: var(--space-2); }
  .role { padding: var(--space-3) var(--space-4); border-radius: var(--radius-control-2);
          font-size: var(--font-size-2); font-weight: var(--font-weight-medium); }
  .sweep { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
  .sweep-name { width: 78px; font-size: var(--font-size-1); font-family: var(--font-mono); line-height: 1.4; }
  .sweep-hex { color: var(--neutral-10); font-size: 10px; }
  .sw.sm { width: 34px; height: 26px; }
  .sweep .role { padding: var(--space-2) var(--space-3); font-size: var(--font-size-1); }
  .hc-label { font-size: var(--font-size-1); font-family: var(--font-mono); color: var(--neutral-10);
              margin: var(--space-4) 0 var(--space-2); }
</style>
</head>
<body>
<header><div class="bar">
  <span class="brand">KookieUI <em>tokens</em></span>
  <nav class="toc">
    <a href="#matrix">matrix</a>
    <a href="#button">button</a>
    <a href="#layout">layout</a>
    <a href="#roles">roles</a>
    <a href="#colour">colour</a>
    <a href="#hues">hues</a>
    <a href="#brand">brand</a>
  </nav>
  <div class="toggle">
    <label><input type="checkbox" id="icons"> icons</label>
    <label><input type="checkbox" id="hc"> contrast="high"</label>
    <label>radius
      <select id="radius">${Object.keys(radiusLevels)
        .map((l) => `<option${l === "medium" ? " selected" : ""}>${l}</option>`)
        .join("")}</select>
    </label>
  <label>pointer
      <select id="pointer"><option selected>auto</option><option>fine</option><option>coarse</option></select>
    </label>
  </div>
</div></header>
<main>
<h1 id="matrix">density x size</h1>
<p class="note">Every value here is a placed number, not a product. Type is held at the size's own step across all three levels, which is the whole point of the axis: a comfortable size 2 stands as tall as a default size 3 while its label stays size 2. Correct any single cell in <code>src/tokens/config.ts</code> without disturbing its neighbours.</p>

<div class="grid">
${LEVELS.map(
  (level) => `  <section data-pointer="auto"${level === "default" ? "" : ` data-density="${level}"`}>
    <h2>${level}${level === "default" ? " <code>(:root)</code>" : ""}</h2>
    <div class="stack">${SIZES.map(control).join("")}
    </div>
  </section>`,
).join("\n")}
</div>

<div class="surfaces">
  <div class="surface" style="border-radius: var(--radius-surface)">--radius-surface (card, popover)</div>
  <div class="surface" style="border-radius: var(--radius-overlay)">--radius-overlay (dialog, sheet)</div>
</div>

<h1 id="button">Button — the axis model</h1>
<p class="note">Every cell below is the same component: <code>tone</code> chooses a family, <code>emphasis</code> chooses a loudness, and neither knows about the other. The CSS behind it is one block per rung and one per size, shared by every control that will ever exist — which is what makes the cost additive rather than the product of the axes (§2, §9). Hover and press are stylesheet work; nothing here runs JavaScript. The toggles above drive it: change <em>radius</em>, <em>pointer</em> or <em>contrast</em> and the whole grid follows.</p>
${buttonMatrix("light")}
${buttonMatrix("dark")}

<h2 style="margin-top: var(--space-10)">the same button under other brand accents</h2>
<p class="note">Nothing below is configured or hand-tuned: each block overrides only the accent family, generated from the hex beside it, and the buttons inside pick it up because a rung reads <code>--tone-*</code> and never a colour. This is the question a swatch cannot answer — a hue can look fine in a scale and fail as a control, where its solid has to carry an APCA-chosen label through hover and press, its soft fill has to hold a legible label, and its border has to separate from the page. Yellow is the one to distrust.</p>
${BRANDS.slice(0, 5)
  .map(([name, hex]) => accentSwap(name, hex, "light"))
  .join("")}
${BRANDS.slice(0, 5)
  .map(([name, hex]) => accentSwap(name, hex, "dark"))
  .join("")}

<p class="note">The size index, at the default rung — five scales moving on one number (§4).</p>
<div class="row-controls">${SIZES.map((s) => button({ size: String(s) }, `Size ${s}`)).join("")}</div>
<p class="note">Loading never hides the label: the spinner takes the icon's box when there is one, and joins the text when there is not (§8).</p>
<div class="row-controls">
  ${button({ emphasis: "loud", tone: "accent" }, "Save")}
  ${button({ emphasis: "loud", tone: "accent", loading: true }, "Save")}
  ${button({ size: "4", emphasis: "loud", tone: "accent", loading: true }, "Save")}
</div>

<h1 id="card">Card — the shell</h1>
<p class="note">A shell: one treatment, no variants, no anatomy — <code>size × material</code> and children, and Card ships not one line of its own CSS (§10). A surface without a material is opaque — translucency is material's job alone — and separation between nested surfaces is the border, not the fill. No shadows anywhere. Titled layouts are blocks, not components. The glass values are v0, judged on this page; expect them to move.</p>
${surfaceSection("light")}
${surfaceSection("dark")}

<p class="note">The Spinner alone, at each icon box and blown up — eight static spokes with a fading trail, rotated as a whole by a stepped tick. Judge it at 16px, which is where it actually lives; the large one is only here to show the shape.</p>
<div class="row-controls">
  ${[1, 2, 3, 4].map((s) => spinner(`--kui-icon: var(--icon-size-${s})`)).join("")}
  ${spinner("--kui-icon: 96px")}
</div>

<h1 id="layout">the responsive mechanism, live</h1>
<p class="note">Rendered through the real resolver against the shipped stylesheet — the exact markup Flex, Grid and Stack produce. Values ride on each element as inline custom properties; the stylesheet only arbitrates which tier's value wins. <strong>Drag a handle</strong>: tiers key on the slot's width (<code>sm</code> 30rem, <code>md</code> 48rem), never the window's — the same Grid is correct in a drawer and a main column (§2). Each demo sits inside a plain Box, because a tier reads the <em>nearest ancestor</em> Box — the slot — and a Box with no ancestor container stays at its base values.</p>

<p class="note">A Grid: <code>columns={{ initial: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}</code>, gap steps up at md.</p>
<div class="rig-meta">slot <span class="w">—</span></div>
<div class="rig">
${kuiBox(
  {},
  kuiBox(
    {
      display: "grid",
      columns: { initial: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
      gap: { initial: "3", md: "5" },
      p: "4",
    },
    Array.from({ length: 8 }, (_, i) => `<div class="cell">${i + 1}</div>`).join(""),
  ),
)}
</div>

<p class="note">A Flex switching axis: <code>direction={{ initial: "column", md: "row" }}</code> — a structural keyword riding the same pipe as spacing, which is why this is not a spacing mechanism.</p>
<div class="rig-meta">slot <span class="w">—</span></div>
<div class="rig">
${kuiBox(
  {},
  kuiBox(
    { display: "flex", direction: { initial: "column", md: "row" }, gap: "3", p: "4" },
    ["nav", "content", "aside"].map((n) => `<div class="cell" style="flex: 1">${n}</div>`).join(""),
  ),
)}
</div>

<h1 id="roles">the role layer</h1>
<p class="note">Components reference these, never the numbered steps and never the generator. <code>tone</code> stands for whichever of neutral, accent or destructive the component resolved to. Swatches show the accent scale in light mode.</p>
${roleMap()}

<h2 style="margin-top: var(--space-9)">contrast="high"</h2>
<p class="note">An accessibility setting, not a design knob: it shifts values, it never remaps which step a role reads. Applied by the Theme prop or by <code>prefers-contrast: more</code> unless explicitly opted out. Toggle it on the whole page below.</p>
<table class="roles-table">
  <thead><tr><th>what</th><th>happens</th></tr></thead>
  <tbody>${CONTRAST_MAP.map(([a, b]) => `<tr><td><code>${a}</code></td><td>${b}</td></tr>`).join("")}</tbody>
</table>

<p class="note">Below is the only strip on this page reading the emitted CSS variables rather than generator output, so the toggle above proves the shipped stylesheet works end to end. Every other swatch is a baked value and shows its high-contrast variant inline instead.</p>
<div class="live">
  <div style="background: var(--accent-solid); color: var(--accent-contrast)">accent solid</div>
  <div style="background: var(--accent-3); color: var(--accent-label)">accent label on 3</div>
  <div style="background: var(--accent-3); color: var(--accent-text)">accent text on 3</div>
  <div style="background: var(--accent-1); color: var(--accent-label); border: 1px solid var(--accent-border)">accent border</div>
  <div style="background: var(--destructive-solid); color: var(--destructive-contrast)">destructive solid</div>
  <div style="background: var(--neutral-solid); color: var(--neutral-contrast)">neutral solid</div>
</div>

<h1 id="colour">colour</h1>
<p class="note">Generated from a hue angle and a chroma peak per tone (§7). Steps 1-8 and 11-12 share one lightness ladder across every hue; the solid band leans toward each hue's own cusp, which is the fix for bright hues reading as mud. Every label pairing here is APCA-verified in the suite, not chosen by eye — but the eye is what decides whether it looks right.</p>
${colorSection("light")}
${colorSection("dark")}
${hueSweep("light")}
${hueSweep("dark")}

<h1 id="hues">every hue, full scale</h1>
<p class="note">The same twelve hues at the depth the shipped tones get: all twelve steps, the alpha ramp beneath them, then the roles a component actually consumes. Nothing here is hand-placed. Every row is one generator with a different hue angle.</p>
${sweepFull("light")}
${sweepFull("dark")}

<h1 id="brand">brand colours through the intake</h1>
<p class="note">Somebody hands the system a hex; the system makes it correct. In light mode step 9 comes back identical to what went in — compare the swatch numbered 9 against the hex in the heading. Everything else is generated around it, and every one of these passes the same legibility laws the shipped tones do.</p>
${brandSection("light")}
${brandSection("dark")}

<script>
  // iOS Safari arms :active only while a touch listener exists somewhere on the page. Every
  // real app has one (a hydrated React root registers touch listeners at mount), so the
  // library ships nothing - but this page is otherwise JS-free static HTML, the one
  // environment where the press state would silently never fire on an iPhone.
  document.addEventListener("touchstart", () => {}, { passive: true });

  document.getElementById("icons").addEventListener("change", (e) => {
    document.body.classList.toggle("icons", e.target.checked);
  });

  // The radius level prices the palette; density still picks which step each control pulls.
  document.getElementById("hc").addEventListener("change", (e) => {
    document.documentElement.dataset.contrast = e.target.checked ? "high" : "normal";
  });

  document.getElementById("radius").addEventListener("change", (e) => {
    document.documentElement.dataset.radius = e.target.value;
    readout();
  });

  // The coarse matrix (§16). The attribute goes on the root AND on each density section:
  // the (pointer x density) cells select on both attributes on one element, which Theme
  // guarantees in an app and this page has to arrange by hand.
  document.getElementById("pointer").addEventListener("change", (e) => {
    for (const el of [document.documentElement, ...document.querySelectorAll(".grid > section")]) {
      el.dataset.pointer = e.target.value;
    }
    readout();
  });

  // Resolved pixels, so the matrix shows what actually renders rather than what was authored.
  function readout() {
    for (const el of document.querySelectorAll(".control")) {
      const s = getComputedStyle(el);
      const size = el.dataset.size;
      el.parentElement.querySelector('[data-for="' + size + '"]').textContent =
        [s.height, "pad " + s.paddingLeft, "gap " + s.columnGap, "r " + s.borderTopLeftRadius, s.fontSize]
          .map((v) => v.replace("px", ""))
          .join("  /  ");
    }
  }
  readout();

  // Live slot readout per rig: width and which tier is active, so "slot not window" is
  // visible rather than argued. Thresholds are the tiers: sm 30rem = 480px, md 48rem = 768px.
  for (const rig of document.querySelectorAll(".rig")) {
    const label = rig.previousElementSibling.querySelector(".w");
    new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      const tier = w >= 768 ? "md" : w >= 480 ? "sm" : "base";
      label.textContent = w + "px — tier " + tier + (tier === "md" ? " (drag narrower)" : "");
    }).observe(rig);
  }
</script>
</main>
</body>
</html>
`;
}

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "../../preview/density.html");

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, generatePreview());
  console.log(`preview: ${outPath}`);
}
