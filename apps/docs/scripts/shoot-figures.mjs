/**
 * `pnpm figures` — photographs every figure's window from its shooting page (app/shoot/[name])
 * in light and dark, and writes public/figures/shots/<name>-<light|dark>.webp. Run it against the
 * dev server whenever a component the figures show changes, or the figures show the old look.
 *
 * Playwright is borrowed from packages/ui and sharp from Next, as nothing else here needs them.
 */
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = createRequire(path.join(here, "../../../packages/ui/package.json"))("playwright");
const sharp = createRequire(require.resolve("next/package.json"))("sharp");

const BASE = process.env.FIGURES_URL ?? "http://localhost:1403";
const OUT = path.join(here, "../public/figures/shots");
const FIGURES = path.join(here, "../app/(docs)/principle-figures.tsx");
const SIZES = path.join(here, "../app/(docs)/figure-shots.json");

/** Each shot and what to do before the picture: `open` is a trigger to click, so its panel is
 *  in the picture, as a person would see it. The docs figures are every name in
 *  PRINCIPLE_FIGURES, read from the source so a new figure is shot without being listed here. */
const SHOTS = { editor: { open: '[aria-label="Viewer zoom"].kui-select-trigger' } };
const source = await readFile(FIGURES, "utf8");
const list = source.slice(source.indexOf("export const PRINCIPLE_FIGURES = {"), source.indexOf("} as const;"));
for (const [, name] of list.matchAll(/^  (\w+Figure):/gm)) SHOTS[name] = {};
const sizes = JSON.parse(await readFile(SIZES, "utf8"));

const only = process.argv.slice(2);
await mkdir(OUT, { recursive: true });
// Headless Chromium's default GPU budget runs out on a 2x window full of glass filters and leaves
// whole panes unpainted, at random (2026-11-06); a larger budget paints them every time.
const browser = await chromium.launch({ args: ["--force-gpu-mem-available-mb=8192"] });
for (const [name, { open }] of Object.entries(SHOTS)) {
  if (only.length && !only.includes(name)) continue;
  for (const scheme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 2, colorScheme: scheme });
    await page.goto(`${BASE}/shoot/${name}?theme=${scheme}`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    });
    // The dev server streams the page in; give every pane time to paint before the picture.
    await page.waitForTimeout(2500);
    if (open) {
      await page.locator(open).click();
      await page.locator("[data-open][role=listbox]").waitFor();
      // Opening repaints every glass pane behind the panel; a picture taken at once caught some
      // panes still blank (2026-11-06).
      await page.waitForTimeout(2000);
    }
    // The box's border and corners are drawn live on the docs page, so the picture is its inside:
    // a figure's band, or the hero's window.
    const target = (await page.locator(".kd-shoot .kd-band").count()) ? ".kd-shoot .kd-band" : ".kd-shoot > *";
    const clip = await page.locator(target).first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      const b = parseFloat(getComputedStyle(el).borderTopWidth);
      return { x: r.left + b, y: r.top + b, width: r.width - 2 * b, height: r.height - 2 * b };
    });
    // The whole viewport, then cropped: a clipped capture at 2x left panes unpainted behind the
    // open Select (measured 2026-11-06), the full one does not.
    const png = await sharp(await page.screenshot())
      .extract({ left: Math.round(clip.x * 2), top: Math.round(clip.y * 2), width: Math.round(clip.width * 2), height: Math.round(clip.height * 2) })
      .png()
      .toBuffer();
    const file = path.join(OUT, `${name}-${scheme}.webp`);
    const webp = await sharp(png).webp({ quality: 86 }).toBuffer();
    await writeFile(file, webp);
    sizes[name] = { width: Math.round(clip.width), height: Math.round(clip.height) };
    console.log(`${path.relative(process.cwd(), file)}  ${Math.round(webp.length / 1024)} KB`);
    await page.close();
  }
}
await browser.close();
// The figures read each shot's size from here, so the page keeps its place before a shot loads.
await writeFile(SIZES, JSON.stringify(Object.fromEntries(Object.entries(sizes).sort()), null, 2) + "\n");
