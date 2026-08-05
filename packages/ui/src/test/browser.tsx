/**
 * Scaffolding for the browser project. Not part of the public surface — nothing here is
 * reachable from `src/index.ts`, so it is never built or published.
 *
 * It exists because the browser laws come in two kinds that must not be confused: the ones
 * that mount a real component and read what the engine computed, and the ones that write the
 * markup the component is *supposed* to produce. The second kind proves the stylesheet; only
 * the first kind proves the React half, and for a while only the second kind existed.
 *
 * Deepened 2026-08-06. The harness used to stop at render/computed, and each law file re-grew
 * the rest by hand: four incompatible probe placements (each with its own comment re-learning
 * that `inherits: false` defeats a child probe), six spellings of "the element under the
 * Theme", five hand-written 24-cell walks, and no teardown at all. One designed fact cost ~5
 * lines of ceremony, which is a tax on exactly the laws the 2026-08-03 standard demands. The
 * lessons live here now; a law states its fact.
 */
import type { ReactElement } from "react";
import { afterEach } from "vitest";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";

import { Theme, type ThemeProps } from "../theme/theme.tsx";
import { SIZES, type Size } from "../system/axes.ts";
import { density } from "../tokens/config.ts";

// Every stylesheet the package ships, in the order styles/index.css imports them — order is
// load-bearing, since the recipes read tokens and components read recipes. Keep this list and
// that file in step; a sheet missing here makes laws pass against an empty cascade.
import buttonCss from "../components/button/button.css?raw";
import checkboxCss from "../components/checkbox/checkbox.css?raw";
import spinnerCss from "../components/spinner/spinner.css?raw";
import textAreaCss from "../components/text-area/text-area.css?raw";
import textFieldCss from "../components/text-field/text-field.css?raw";
import layoutCss from "../system/layout.css?raw";
import recipesCss from "../system/recipes.css?raw";
import surfacesCss from "../system/surfaces.css?raw";
import typeCss from "../system/type.css?raw";
import tokensCss from "../tokens/tokens.css?raw";

let installed = false;

/** The committed artifacts, not the generators: these tests are about what actually ships. */
export function installStyles(): void {
  if (installed) return;
  const sheet = document.createElement("style");
  sheet.textContent = [
    tokensCss,
    layoutCss,
    recipesCss,
    surfacesCss,
    typeCss,
    spinnerCss,
    buttonCss,
    checkboxCss,
    textFieldCss,
    textAreaCss,
  ].join("\n");
  document.head.append(sheet);
  installed = true;
}

/** Live roots, unmounted after each test. Mounts made inside ONE test coexist (laws compare
    across mounts); what no longer happens is a file's every mount accumulating in the body
    for the rest of the run. Registered here so no law file has to remember a hook. */
const live: { root: Root; host: HTMLElement }[] = [];

afterEach(() => {
  for (const { root, host } of live.splice(0)) {
    root.unmount();
    host.remove();
  }
});

/**
 * Mounts into a detached-then-attached host and returns the element the component rendered.
 *
 * `flushSync` rather than an async helper because every assertion downstream is a synchronous
 * `getComputedStyle`, and a test that has to await its own layout invites the race it is
 * supposed to be checking for.
 */
export function render(ui: ReactElement): HTMLElement {
  installStyles();
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  flushSync(() => root.render(ui));
  live.push({ root, host });
  return host.firstElementChild as HTMLElement;
}

/**
 * Mount and hand back the SUBJECT — the thing the law is about — rather than whatever sits at
 * the top. `theme` wraps the tree in a real `<Theme>` (the 2026-08-03 standard mounts through
 * one); the subject is then the component under it, not the Theme's div, which is what every
 * law file was re-deriving with its own querySelector idiom. `select` narrows to an inner
 * element (a field's input, a mark in a row) and is LOUD when nothing matches — an extraction
 * miss must fail the law, not hand it a null to pass vacuously against.
 */
export function mounted(
  ui: ReactElement,
  opts: { theme?: ThemeProps; select?: string } = {},
): HTMLElement {
  const root = render(opts.theme !== undefined ? <Theme {...opts.theme}>{ui}</Theme> : ui);
  if (opts.select) {
    const el = root.matches(opts.select) ? root : root.querySelector<HTMLElement>(opts.select);
    if (!el) throw new Error(`mounted(): nothing matches ${opts.select}`);
    return el;
  }
  return opts.theme !== undefined ? (root.firstElementChild as HTMLElement) : root;
}

export const computed = (el: Element, prop: string): string =>
  getComputedStyle(el).getPropertyValue(prop).trim();

/**
 * Resolve something INSIDE the scope under test, through a real element. The probe goes in as
 * a CHILD of the scope rather than a sibling of it, which is not a detail: every mounted law
 * wraps a `<Theme>`, and a probe appended outside it reads the document scope — a coarse cell
 * checked against the fine world's tokens passes for the wrong reason. Positioned absolutely
 * so it cannot participate in the layout it is measuring.
 *
 * This is the harness's ONE probe. It replaces four per-file placements whose comments each
 * re-learned the same fact: a property registered `inherits: false` is invisible to any child
 * probe, so a value declared ON the element must be read off the element (`computed`/`ownColor`)
 * and never through a descendant.
 */
export function probeIn<T>(
  scope: Element,
  apply: (el: HTMLElement) => void,
  read: (s: CSSStyleDeclaration) => T,
): T {
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  apply(probe);
  scope.append(probe);
  const value = read(getComputedStyle(probe));
  probe.remove();
  return value;
}

/** A length/keyword token as the scope resolves it. */
export const tokenOn = (scope: Element, name: string): string =>
  probeIn(scope, (el) => (el.style.width = `var(${name})`), (s) => s.width);

/** A colour expression as the scope resolves it. */
export const colorOn = (scope: Element, expr: string): string =>
  probeIn(scope, (el) => (el.style.backgroundColor = expr), (s) => s.backgroundColor);

/** A colour-valued custom property declared ON the element — the `inherits: false` case: the
    raw value is read off the element itself, then resolved through a child probe. */
export const ownColor = (el: Element, name: string): string =>
  probeIn(el, (probe) => (probe.style.color = computed(el, name)), (s) => s.color);

/** The axes a control law walks. SIZES comes from the vocabulary; densities derive from the
    config (the audit lesson: a restated literal keeps a hole invisible); the worlds are the
    Theme axes' own unions. */
export { SIZES };
export const DENSITIES = Object.keys(density) as (keyof typeof density)[];
export const POINTERS = ["fine", "coarse"] as const;
export const APPEARANCES = ["light", "dark"] as const;

export type Cell = {
  size: Size;
  density: (typeof DENSITIES)[number];
  pointer: (typeof POINTERS)[number];
};

/** The 24 cells (4 sizes × 3 densities × 2 pointer worlds) every control geometry law must
    hold in — was five hand-written triple loops in one file. */
export function forEachCell(fn: (cell: Cell) => void): void {
  for (const pointer of POINTERS) {
    for (const density of DENSITIES) {
      for (const size of SIZES) {
        fn({ size, density, pointer });
      }
    }
  }
}
