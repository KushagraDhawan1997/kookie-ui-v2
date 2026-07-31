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

import { density, radiusLevels, type DensityLevel } from "./config.ts";

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
