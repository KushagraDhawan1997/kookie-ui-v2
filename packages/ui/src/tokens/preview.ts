/**
 * Emits preview/density.html: the size-by-density matrix. Twelve control heights across
 * three levels cannot be judged by reading a config file, and the numbers are taste, so
 * the matrix is the gate on correcting them (§12, open questions).
 *
 * It draws boxes from the tokens directly rather than from components, because there are
 * no components yet and because a token preview should not depend on one.
 *
 * Run: node --experimental-strip-types src/tokens/preview.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { tones, type Mode, type ToneName } from "./color-config.ts";
import { buildScale, buildScaleFor, type Scale } from "./color.ts";

import { density, radiusLevels, type DensityLevel } from "./config.ts";

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
        <span class="sweep-name">${name}</span>
        <div class="row">${s.steps.map((hex, i) => `<div class="sw sm" title="${name}-${i + 1} ${hex}" style="background:${hex}"></div>`).join("")}</div>
        <div class="role" style="background:${s.solid};color:${s.contrast}">solid</div>
        <div class="role" style="background:${s.solidActive};color:${s.contrast}">active</div>
        <div class="role" style="background:${s.steps[2]};color:${s.label}">label</div>
      </div>`;
    }).join("")}
  </section>`;
}

const TONES = Object.keys(tones) as ToneName[];

/** Twelve steps, the alpha ramp over the mode's backdrop, and the roles that consume them. */
function scaleRow(tone: string, s: Scale): string {
  const swatch = (bg: string, title: string, label = "") =>
    `<div class="sw" title="${title}" style="background:${bg}">${label}</div>`;

  return `
    <div class="scale">
      <h3>${tone}${s.isLowChroma ? ' <em>low chroma: solid takes step 12</em>' : ""}</h3>
      <div class="row">${s.steps.map((hex, i) => swatch(hex, `${tone}-${i + 1} ${hex}`, String(i + 1))).join("")}</div>
      <div class="row">${s.alpha.map((v, i) => swatch(v, `${tone}-a${i + 1}`)).join("")}</div>
      <div class="row roles">
        ${[
          ["solid", s.solid],
          ["hover", s.solidHover],
          ["active", s.solidActive],
        ]
          .map(
            ([n, hex]) =>
              `<div class="role" style="background:${hex};color:${s.contrast}">${n}</div>`,
          )
          .join("")}
        <div class="role" style="background:${s.steps[2]};color:${s.label}">label on 3</div>
        <div class="role" style="background:${s.steps[4]};color:${s.label}">label on 5</div>
        <div class="role" style="background:${s.steps[2]};color:${s.steps[10]}">text on 3</div>
      </div>
    </div>`;
}

function colorSection(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${mode}</h2>
    ${TONES.map((t) => scaleRow(t, buildScale(t, mode))).join("")}
  </section>`;
}

/** The sweep at the depth the shipped tones get, for judging one hue rather than the family. */
function sweepFull(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>every hue — ${mode}</h2>
    ${SWEEP.map(([name, hue, vividness]) => scaleRow(name, buildScaleFor({ hue, vividness }, mode))).join("")}
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
<html lang="en">
<head>
<meta charset="utf-8">
<title>KookieUI density x size</title>
<link rel="stylesheet" href="../src/tokens/tokens.css">
<style>
  body { font-family: var(--font-body); margin: 0; padding: var(--space-9); background: #fff; color: #111; }
  h1 { font-size: var(--font-size-6); margin: 0 0 var(--space-3); }
  p.note { font-size: var(--font-size-2); color: #666; max-width: 60ch; margin: 0 0 var(--space-9); }
  .grid { display: grid; grid-template-columns: repeat(${LEVELS.length}, max-content); gap: var(--space-10); }
  h2 { font-size: var(--font-size-3); margin: 0 0 var(--space-6); text-transform: lowercase; }
  h2 code { color: #666; font-weight: var(--font-weight-regular); }
  .stack { display: flex; flex-direction: column; align-items: start; gap: var(--space-4); }
  .control {
    display: inline-flex; align-items: center; box-sizing: border-box;
    background: #f1f1f3; border: 1px solid #d8d8de;
    font-weight: var(--font-weight-medium); white-space: nowrap;
  }
  .icon { width: 1em; height: 1em; border-radius: 2px; background: #9a9aa6; flex: none; }
  body:not(.icons) .icon { display: none; }
  .toggle { font-size: var(--font-size-2); color: #666; margin: 0 0 var(--space-9); display: flex; gap: var(--space-7); align-items: center; }
  .toggle label { display: flex; gap: var(--space-3); align-items: center; }
  .surfaces { display: flex; gap: var(--space-6); margin-top: var(--space-10); }
  .surface { background: #f6f6f8; border: 1px solid #e3e3e8; padding: var(--space-6); font-size: var(--font-size-2); color: #666; }
  .mode { margin-top: var(--space-10); padding: var(--space-7); border-radius: var(--radius-surface); }
  .mode.dark { background: #111214; color: #e9ebed; }
  .mode h2 { margin-bottom: var(--space-6); }
  .scale { margin-bottom: var(--space-7); }
  .scale h3 { font-size: var(--font-size-2); font-weight: var(--font-weight-medium); margin: 0 0 var(--space-3); }
  .scale h3 em { color: #999; font-weight: var(--font-weight-regular); font-style: normal; }
  .row { display: flex; gap: 2px; margin-bottom: 2px; }
  .sw { width: 56px; height: 36px; display: flex; align-items: end; justify-content: center;
        font-size: 10px; font-family: var(--font-mono); color: #8888; }
  .row.roles { margin-top: var(--space-3); gap: var(--space-2); }
  .role { padding: var(--space-3) var(--space-4); border-radius: var(--radius-control-2);
          font-size: var(--font-size-2); font-weight: var(--font-weight-medium); }
  .sweep { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
  .sweep-name { width: 70px; font-size: var(--font-size-1); font-family: var(--font-mono); }
  .sw.sm { width: 34px; height: 26px; }
  .sweep .role { padding: var(--space-2) var(--space-3); font-size: var(--font-size-1); }
  .readout { font-family: var(--font-mono); font-size: 11px; color: #888; }
  .ruler { position: relative; }
</style>
</head>
<body>
<h1>density x size</h1>
<div class="toggle">
  <label><input type="checkbox" id="icons"> show icons (the gap token is only visible with one)</label>
  <label>radius
    <select id="radius">${Object.keys(radiusLevels)
      .map((l) => `<option${l === "medium" ? " selected" : ""}>${l}</option>`)
      .join("")}</select>
  </label>
</div>
<p class="note">Every value here is a placed number, not a product. Type is held at the size's own step across all three levels, which is the whole point of the axis: a comfortable size 2 stands as tall as a default size 3 while its label stays size 2. Correct any single cell in <code>src/tokens/config.ts</code> without disturbing its neighbours.</p>

<div class="grid">
${LEVELS.map(
  (level) => `  <section${level === "default" ? "" : ` data-density="${level}"`}>
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

<h1 style="margin-top: var(--space-11)">colour</h1>
<p class="note">Generated from a hue angle and a chroma peak per tone (§7). Steps 1-8 and 11-12 share one lightness ladder across every hue; the solid band leans toward each hue's own cusp, which is the fix for bright hues reading as mud. Every label pairing here is APCA-verified in the suite, not chosen by eye — but the eye is what decides whether it looks right.</p>
${colorSection("light")}
${colorSection("dark")}
${hueSweep("light")}
${hueSweep("dark")}

<h1 style="margin-top: var(--space-11)">every hue, full scale</h1>
<p class="note">The same twelve hues at the depth the shipped tones get: all twelve steps, the alpha ramp beneath them, then the roles a component actually consumes. Nothing here is hand-placed. Every row is one generator with a different hue angle.</p>
${sweepFull("light")}
${sweepFull("dark")}

<script>
  document.getElementById("icons").addEventListener("change", (e) => {
    document.body.classList.toggle("icons", e.target.checked);
  });

  // The radius level prices the palette; density still picks which step each control pulls.
  document.getElementById("radius").addEventListener("change", (e) => {
    document.documentElement.dataset.radius = e.target.value;
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
</script>
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
