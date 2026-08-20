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
import { cdp } from "@vitest/browser/context";
import { afterEach } from "vitest";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";

import { Theme, DEPTHS, type ThemeProps } from "../theme/theme.tsx";
import { SIZES, GLASS_MATERIALS, type Size } from "../system/axes.ts";
import { VIEWPORT } from "./viewport.ts";
import { density } from "../tokens/config.ts";

// Every stylesheet the package ships, in the order styles/index.css imports them — order is
// load-bearing, since the recipes read tokens and components read recipes. Keep this list and
// that file in step; a sheet missing here makes laws pass against an empty cascade.
import alertDialogCss from "../components/alert-dialog/alert-dialog.css?raw";
import blockquoteCss from "../components/blockquote/blockquote.css?raw";
import buttonCss from "../components/button/button.css?raw";
import checkboxCss from "../components/checkbox/checkbox.css?raw";
import codeCss from "../components/code/code.css?raw";
import dialogCss from "../components/dialog/dialog.css?raw";
import kbdCss from "../components/kbd/kbd.css?raw";
import menuCss from "../components/menu/menu.css?raw";
import selectCss from "../components/select/select.css?raw";
import progressCss from "../components/progress/progress.css?raw";
import radioCss from "../components/radio/radio.css?raw";
import scrollAreaCss from "../components/scroll-area/scroll-area.css?raw";
import segmentedControlCss from "../components/segmented-control/segmented-control.css?raw";
import separatorCss from "../components/separator/separator.css?raw";
import shellCss from "../components/shell/shell.css?raw";
import sliderCss from "../components/slider/slider.css?raw";
import spinnerCss from "../components/spinner/spinner.css?raw";
import switchCss from "../components/switch/switch.css?raw";
import tabsCss from "../components/tabs/tabs.css?raw";
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
    alertDialogCss,
    blockquoteCss,
    buttonCss,
    checkboxCss,
    codeCss,
    dialogCss,
    kbdCss,
    menuCss,
  selectCss,
    progressCss,
    radioCss,
    scrollAreaCss,
    segmentedControlCss,
    separatorCss,
    shellCss,
    sliderCss,
    switchCss,
    tabsCss,
    textFieldCss,
    textAreaCss,
  ].join("\n");
  document.head.append(sheet);
  installed = true;
}

/**
 * STILLNESS, and why it is the default (added 2026-08-09, when motion reached the control
 * layer).
 *
 * Almost every law in this suite asks what a control LOOKS like in some state: the invalid
 * remap's colour, the disabled fill, the ring's extent. The moment those states became eased,
 * six of them started reading the first frame of a transition instead of the value they name
 * — the colour a hover is leaving, not the one it is arriving at. Nothing about those laws was
 * wrong; they were simply reading a moving thing at a moment they never chose.
 *
 * So the harness holds the page still, and a law that is ABOUT motion says so by calling
 * `inMotion()`. That is the honest default: appearance laws get a settled control without
 * having to know that motion exists, and the ones that do know announce it.
 */
let stillness: HTMLStyleElement | null = null;
let wantsMotion = false;
let emulating = false;

/** Did a portal exist at any point in this test? (2026-08-16.) A popup dismissed by its own
    portalled button is gone before teardown can look, so the signal has to be recorded when it
    happens rather than read at the end — see the pointer-parking guard below. One observer for
    the whole run, started lazily so a node suite never installs it. */
let sawPortal = false;
let portalWatch: MutationObserver | null = null;
function watchForPortals(): void {
  if (portalWatch) return;
  portalWatch = new MutationObserver((records) => {
    if (sawPortal) return;
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof HTMLElement && (node.classList.contains("kui-portal") || node.querySelector(".kui-portal"))) {
          sawPortal = true;
          return;
        }
      }
    }
  });
  portalWatch.observe(document.body, { childList: true, subtree: true });
}

function holdStill(): void {
  if (!stillness) {
    stillness = document.createElement("style");
    stillness.textContent =
      "*, *::before, *::after { transition: none !important; animation: none !important; }";
    document.head.append(stillness);
  }
  stillness.disabled = wantsMotion;
}

/**
 * Wait for a STATE, never for a duration (2026-08-17).
 *
 * Every motion law that sleeps to a computed instant and reads once is measuring the machine.
 * `setTimeout` is a minimum, and a loaded runner overshoots it — so a law that sleeps into a
 * window ("mid-dissolve", "between the two deadlines") wakes up after the window has closed
 * and reports a defect that is not there. Three such laws failed on CI in one morning and
 * none of them could be reproduced here, idle or under full load.
 *
 * Sampling inverts the failure direction, which is the whole point: a slow runner samples LESS
 * often, so an observation lands later, and later can only make "has it happened yet" easier
 * to satisfy — never harder. It cannot make a law weaker either. If the thing genuinely never
 * happens, no amount of waiting invents it and the deadline expires into the same assertion
 * the law always made.
 *
 * The deadline is a CEILING on something hung, not a timing claim, so it is set generously
 * against the clock in question rather than tuned to it. The condition is returned rather than
 * thrown on so the caller still writes the assertion — a helper that threw would move the
 * law's own claim in here, where its failure message could not name it.
 */
export async function until(condition: () => boolean, ms = 3000): Promise<boolean> {
  const deadline = performance.now() + ms;
  while (!condition() && performance.now() < deadline)
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  return condition();
}

/**
 * One turn of the microtask queue — the entry runner fully armed (2026-08-16).
 *
 * The unified runner stamps the pose synchronously and measures in a microtask, because a ref
 * callback runs before the commit's layout effects and a panel measured that early can be a
 * half-laid-out sliver. Every law that reads a flight's numbers — its measured box, its
 * silhouette, its aimed position — must therefore let that microtask run first, or it reads a
 * pose with nothing written into it and measures NaN. Named rather than spelled inline, so a
 * law says what it is waiting for instead of awaiting a bare promise for reasons a reader has
 * to reconstruct.
 */
export async function flushFlight(): Promise<void> {
  await Promise.resolve();
}

/**
 * SWEEP AN ARRIVAL BY ITS OWN CLOCK, not by the host's frames (2026-08-20).
 *
 * Every law in this suite that asked "does this actually move?" sampled the rendered box once
 * per `requestAnimationFrame` and then made a claim about the series. All of them are claims
 * about the MACHINE. A loaded runner hands the loop two frames where an idle one hands it
 * thirty, so a perfectly smooth arrival reports the same two values a frozen one does — and
 * those are opposite bugs whose repairs pull in opposite directions, which is why every new
 * bound bought one more week and then went red again (menu: three metrics in one day; the
 * focus ring: "expected 2 to be greater than 2").
 *
 * A running transition or animation is an object with a clock of its own. Pause it, put its
 * clock where you want it, and read what the engine RENDERS there — the whole curve, at a
 * resolution the host cannot change, in one synchronous block that no dropped frame can
 * interrupt. Sabotaging the thing under test moves the numbers; loading the runner does not.
 *
 * `property` is the PHYSICAL name the engine transitions (`height`, not `block-size` — the
 * logical property is resolved before the transition is created), or a keyframe animation's
 * name. The subject is left playing from where it was, so a law may go on watching it.
 */
export async function sweep<T>(
  el: Element,
  property: string,
  read: () => T,
  stations = 40,
): Promise<T[]> {
  const named = (a: Animation) =>
    (a as CSSTransition).transitionProperty === property ||
    (a as CSSAnimation).animationName === property;
  const arrival = el.getAnimations().find(named);
  if (!arrival)
    throw new Error(
      `nothing is arriving on ${property} — running: ` +
        el
          .getAnimations()
          .map((a) => (a as CSSTransition).transitionProperty ?? (a as CSSAnimation).animationName)
          .join(", "),
    );
  const clock = Number(arrival.effect!.getComputedTiming().activeDuration);
  if (!(clock > 0)) throw new Error(`${property} has no clock to step through`);
  const was = arrival.currentTime;
  arrival.pause();
  const series: T[] = [];
  for (let station = 0; station <= stations; station++) {
    arrival.currentTime = (clock * station) / stations;
    series.push(read());
  }
  arrival.currentTime = was;
  arrival.play();
  return series;
}

/**
 * CATCH A DISSOLVE MID-AIR, by seizing its own clock (2026-08-20).
 *
 * The "a reopen that lands mid-dissolve is CAUGHT" laws need a panel that is visibly half-gone
 * and still mounted — a real-time window about 200ms wide. Polling into it is the `until`
 * lesson inverted: the window is wall clock, so a runner that stalls past it finds the popup
 * already unmounted and the law fails on its own premise (CI: "the premise: the exit is still
 * running: expected false to be true").
 *
 * So the window is not raced, it is HELD OPEN — `sweep`'s lesson pointed at a window instead
 * of a series. Armed BEFORE the close; the microtask the ending stamp lands, every exit
 * animation is paused and its clock is set 60% in, which is also what holds the popup mounted
 * BY MECHANISM rather than by scheduling luck: Base UI unmounts a closing popup when
 * `Promise.all(getAnimations().map((a) => a.finished))` settles, and a paused animation's
 * `finished` never does. The revocation the law then performs retargets the paused
 * transitions — the browser cancels them and travels back from the held value, exactly as it
 * does to a live dissolve; TIME is the only thing the instrument changed.
 *
 * Resolves with the box and opacity rendered at the held instant. Rejects if the stamp lands
 * with no clock to seize — an exit with no running dissolve cannot be caught mid-dissolve,
 * and that premise failure deserves its own message rather than whichever assertion trips
 * downstream of it.
 */
export function catchDissolve(popup: HTMLElement): Promise<{ box: DOMRect; fading: number }> {
  return new Promise((resolve, reject) => {
    const seize = () => {
      const exits = popup.getAnimations({ subtree: true });
      if (exits.length === 0)
        return reject(new Error("the ending stamp landed with no running exit to catch"));
      for (const exit of exits) {
        exit.pause();
        const timing = exit.effect?.getComputedTiming();
        const span = Number(timing?.activeDuration ?? 0);
        if (Number.isFinite(span) && span > 0)
          exit.currentTime = Number(timing?.delay ?? 0) + span * 0.6;
      }
      resolve({
        box: popup.getBoundingClientRect(),
        fading: parseFloat(getComputedStyle(popup).opacity),
      });
    };
    if (popup.hasAttribute("data-ending-style")) return seize();
    const watch = new MutationObserver(() => {
      if (!popup.hasAttribute("data-ending-style")) return;
      watch.disconnect();
      seize();
    });
    watch.observe(popup, { attributes: true, attributeFilter: ["data-ending-style"] });
  });
}

/**
 * Let this test's subject move. Order-free on purpose — it sets a flag the harness honours on
 * every render for the rest of the test, rather than a switch a later `render` would flip back:
 * the first spelling was position-dependent, and calling it one line too early silently gave
 * three laws a frozen page again.
 */
export function inMotion(): void {
  wantsMotion = true;
  holdStill();
}

/**
 * Ask the BROWSER for stillness, the way an operating system does (2026-08-10).
 *
 * `inMotion` above and the stylesheet it toggles are the harness deciding whether a law wants a
 * moving page. This is the other thing entirely: it makes `prefers-reduced-motion: reduce`
 * genuinely match, so the shipped `@media` block is the thing under test rather than a block of
 * CSS nobody has ever executed.
 *
 * It is worth the CDP round trip because that is exactly what happened. The suppression was
 * asserted by reading the stylesheet for a `prefers-reduced-motion` rule and checking which
 * selectors appeared inside it — every character of which was correct while the focus ring went
 * on landing, because a selector present in the block still has to WIN, and that one lost by
 * one specificity point to the rule it was written to stand down. A media query the suite
 * cannot enter is a media query the suite cannot check.
 *
 * Reset by the afterEach below, so a law that asks for stillness cannot leave the next file
 * running in it.
 */
export async function asksForStillness(): Promise<void> {
  emulating = true;
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
}

/**
 * LANDING a floating panel (promoted from menu.browser.test.tsx 2026-08-10, on its second
 * consumer — Select).
 *
 * Every law about a panel's corner, its rows' geometry or what the portal carried is about a
 * panel that HAS ARRIVED. A synchronous mount reads the entry's first frame instead: Base UI
 * renders `data-starting-style` in the initial commit and drops it a frame later, so the popup
 * such a law grabs is a 40px seed. Menu learned this when motion landed (a row measured 68px
 * against its 42px cell); Select's laws reported it the moment the same entry reached them —
 * seven of them at once, reading a mid-flight corner and a mid-flight width.
 *
 * It does by hand exactly what the shipped reduced-motion block does — drop the seed, pin the
 * transitions — rather than waiting out the entry in twenty-four cells. Laws that are ABOUT
 * the entry use the plain `render` and never come through here.
 */
export function settle(popup: HTMLElement): void {
  popup.removeAttribute("data-starting-style");
  popup.removeAttribute("data-seed");
  popup.removeAttribute("data-unfurling");
  popup.style.removeProperty("--kui-fly-w");
  popup.style.removeProperty("--kui-fly-h");
  popup.style.removeProperty("--kui-fly-bw");
  for (const el of [popup, ...popup.querySelectorAll<HTMLElement>("*")]) {
    el.style.setProperty("transition", "none", "important");
  }
}

/** Every panel on the page with a flight in progress, including ones opened after the initial
    render: the anchored families and the overlay ones run one shared runner, so both stamp the
    same attributes and an unsettled panel of either kind is its seed, not its box. (The
    materialization is AlertDialog's since 2026-08-16 — a Dialog has no entry until its own
    large-mass one lands, so this reaches the alert, not the dialog.) */
export function settleAll(): void {
  for (const popup of document.querySelectorAll<HTMLElement>(".kui-floating, .kui-surface.kui-overlay")) settle(popup);
}

/** Mount, then land whatever floated. The shape both law files had reinvented. */
export function renderSettled(ui: ReactElement): HTMLElement {
  const host = render(ui);
  settleAll();
  return host;
}

/** Live roots, unmounted after each test. Mounts made inside ONE test coexist (laws compare
    across mounts); what no longer happens is a file's every mount accumulating in the body
    for the rest of the run. Registered here so no law file has to remember a hook. */
const live: { root: Root; host: HTMLElement }[] = [];

afterEach(async () => {
  wantsMotion = false;
  if (emulating) {
    emulating = false;
    await cdp().send("Emulation.setEmulatedMedia", { features: [] });
  }
  /**
   * Park the pointer if this test left it resting on something (2026-08-10).
   *
   * Unmounting a host does not move the mouse, and the next file mounts at the same
   * coordinates — so a law that hovered handed the following file a control that was already
   * `:hover` before it read anything. Three radio look-axis laws failed exactly this way, and
   * only in a full run: they read a resting border and got the hovered one, which the boundary
   * step had just made a different colour. Passing alone and failing together is the signature.
   *
   * Guarded on an actual hover rather than run unconditionally, because it is a CDP round trip
   * per test and the suite is over a thousand of them. Parked at the far corner of the pinned
   * viewport, which no mount reaches.
   *
   * Widened 2026-08-16 (the alert laws): the overlay suites click PORTALLED buttons, which
   * land at body level — outside every host, invisible to the host query — and a clicked
   * element that unmounts with its popup leaves the pointer parked mid-viewport with
   * NOTHING hovered at teardown, exactly where the next file's mount appears. A portal
   * having existed this test is therefore itself the signal: it implies pointer work at
   * coordinates a later mount will reuse, whether or not anything is still under the
   * pointer to say so.
   *
   * And it is a RECORD of the test, not a reading taken at its end (corrected the same day):
   * the first spelling asked `document.querySelector(".kui-portal")` here, which is precisely
   * the query that answers null in the case the paragraph above describes — a popup dismissed
   * by its own button is gone before teardown looks. `sawPortal` is set the moment one
   * appears, by an observer that costs nothing per test.
   */
  if (sawPortal || live.some(({ host }) => host.querySelector(":hover"))) {
    await cdp().send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: VIEWPORT.width - 1,
      y: VIEWPORT.height - 1,
    });
  }
  sawPortal = false;
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
  holdStill();
  watchForPortals();
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
 * The element a law is about, found from a mount — LOUD when nothing matches.
 *
 * `mounted({ select })` already throws; the per-file helpers did not, and that gap was worth
 * a finding (audit 2026-08-08). Four law files carried
 * `const markOf = (el) => el.querySelector(".kui-checkbox") ?? el`, which reads as "the mark
 * inside, or the root if the root IS the mark" and is in fact neither: the root carries the
 * family class, `querySelector` searches DESCENDANTS only, so the query arm never once
 * matched and every call took the fallback. Rename the class and the helper still hands back
 * the root — every law in the file keeps passing while no longer identifying its subject.
 *
 * This is the node laws' own lesson arriving in the browser project. `test/stylesheets.ts`
 * exists because ~20 `slice(indexOf(...))` sites went green on a renamed selector; `block()`
 * throws for exactly this reason. The browser harness had the loud idiom in `mounted` and
 * nowhere else.
 */
export function within(root: Element, selector: string): HTMLElement {
  if (root.matches(selector)) return root as HTMLElement;
  const el = root.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`within(): nothing matches ${selector}`);
  return el;
}

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

/** A NUMBER token as the scope resolves it — through opacity, because the width probe above
    rejects a unitless value as invalid and answers 0px for a perfectly healthy token. */
export const numberOn = (scope: Element, name: string): number =>
  parseFloat(probeIn(scope, (el) => (el.style.opacity = `var(${name})`), (s) => s.opacity));

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
/** DEPTHS and GLASS_MATERIALS are RE-EXPORTS, never restatements (2026-08-16): eight law
    files each carried their own `["flat", "elevated"] as const` and six carried their own
    `["thin", "regular", "thick"]`, so a widened axis would have shipped covered by nothing
    while all fourteen still passed. `depth` owns its list beside its union in theme.tsx;
    the glass thicknesses have owned one in system/axes.ts since that file existed and were
    simply never reached for. A node law below forbids either literal from coming back. */
export { DEPTHS };
export { GLASS_MATERIALS };

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
