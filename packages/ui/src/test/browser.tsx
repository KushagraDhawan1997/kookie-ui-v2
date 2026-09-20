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
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { cdp } from "vitest/browser";
import { afterEach } from "vitest";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";

import { Theme, DEPTHS, type ThemeProps } from "../theme/theme.tsx";
import { SIZES, GLASS_MATERIALS, type Size } from "../system/axes.ts";
import { VIEWPORT } from "./viewport.ts";
import { density } from "../tokens/config.ts";

// Every stylesheet the package ships, installed below in the order styles/index.css imports
// them — order is load-bearing, since the recipes read tokens, components read recipes, and
// this system settles same-specificity ties by source order routinely.
//
// KEEPING THE TWO IN STEP IS A LAW, NOT A HABIT (2026-08-26). It was a habit until six of the
// thirty-four positions had drifted — the harness resolved every scroll-area/segmented-
// control/select/popover/progress/radio tie the opposite way from the artifact a consumer
// loads — while both existing laws stayed green, because both are MEMBERSHIP laws and a
// `toContain` never reads an index. `test/cascade.test.ts` compares the two orders position
// by position; `recipes.test.ts` still owns membership in both directions.
import accordionCss from "../components/accordion/accordion.css?raw";
import alertDialogCss from "../components/alert-dialog/alert-dialog.css?raw";
import attachmentCss from "../components/attachment/attachment.css?raw";
import avatarCss from "../components/avatar/avatar.css?raw";
import badgeCss from "../components/badge/badge.css?raw";
import chipCss from "../components/chip/chip.css?raw";
import blockquoteCss from "../components/blockquote/blockquote.css?raw";
import breadcrumbCss from "../components/breadcrumb/breadcrumb.css?raw";
import buttonCss from "../components/button/button.css?raw";
import checkboxCss from "../components/checkbox/checkbox.css?raw";
import codeCss from "../components/code/code.css?raw";
import codeBlockCss from "../components/code-block/code-block.css?raw";
import comboboxCss from "../components/combobox/combobox.css?raw";
import commandCss from "../components/command/command.css?raw";
import dialogCss from "../components/dialog/dialog.css?raw";
import fieldCss from "../components/field/field.css?raw";
import kbdCss from "../components/kbd/kbd.css?raw";
import linkCss from "../components/link/link.css?raw";
import listCss from "../components/list/list.css?raw";
import menuCss from "../components/menu/menu.css?raw";
import messageScrollerCss from "../components/message-scroller/message-scroller.css?raw";
import composerCss from "../components/composer/composer.css?raw";
import noticeCss from "../components/notice/notice.css?raw";
import numberFieldCss from "../components/number-field/number-field.css?raw";
import pageCss from "../components/page/page.css?raw";
import popoverCss from "../components/popover/popover.css?raw";
import selectCss from "../components/select/select.css?raw";
import progressCss from "../components/progress/progress.css?raw";
import radioCss from "../components/radio/radio.css?raw";
import scrollAreaCss from "../components/scroll-area/scroll-area.css?raw";
import segmentedControlCss from "../components/segmented-control/segmented-control.css?raw";
import separatorCss from "../components/separator/separator.css?raw";
import sheetCss from "../components/sheet/sheet.css?raw";
import shellCss from "../components/shell/shell.css?raw";
import sliderCss from "../components/slider/slider.css?raw";
import spinnerCss from "../components/spinner/spinner.css?raw";
import switchCss from "../components/switch/switch.css?raw";
import tableCss from "../components/table/table.css?raw";
import tabsCss from "../components/tabs/tabs.css?raw";
import textAreaCss from "../components/text-area/text-area.css?raw";
import toggleCss from "../components/toggle/toggle.css?raw";
import splitButtonCss from "../components/split-button/split-button.css?raw";
import buttonGroupCss from "../components/button-group/button-group.css?raw";
import toolbarCss from "../components/toolbar/toolbar.css?raw";
import tooltipCss from "../components/tooltip/tooltip.css?raw";
import textFieldCss from "../components/text-field/text-field.css?raw";
import treeCss from "../components/tree/tree.css?raw";
import carouselCss from "../components/carousel/carousel.css?raw";
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
    accordionCss,
    alertDialogCss,
    attachmentCss,
    avatarCss,
    badgeCss,
    chipCss,
    blockquoteCss,
    breadcrumbCss,
    buttonCss,
    checkboxCss,
    codeCss,
    codeBlockCss,
    dialogCss,
    comboboxCss,
    commandCss,
    fieldCss,
    kbdCss,
    linkCss,
    listCss,
    menuCss,
    messageScrollerCss,
    composerCss,
    noticeCss,
    numberFieldCss,
    pageCss,
    scrollAreaCss,
    segmentedControlCss,
    selectCss,
    popoverCss,
    progressCss,
    radioCss,
    separatorCss,
    sheetCss,
    shellCss,
    sliderCss,
    switchCss,
    tableCss,
    tabsCss,
    textFieldCss,
    tooltipCss,
    textAreaCss,
    toggleCss,
    splitButtonCss,
    buttonGroupCss,
    toolbarCss,
    treeCss,
    carouselCss,
  ].join("\n");
  document.head.append(sheet);
  installed = true;
}

/**
 * STILLNESS, and why it is the default — now that the package itself is still (2026-09-20).
 *
 * The motion system was removed: no stylesheet transitions, no entry or exit animation, no
 * pointer geometry. Three loops survive because each IS the content rather than a response to
 * a state change — the Spinner's rotation, the indeterminate Progress sweep and the
 * Attachment's upload sweep — and those three are the only things left on this page that can
 * be caught mid-flight.
 *
 * So the harness still holds the page still by default, and it is still the honest default: an
 * appearance law reads a settled control without having to know that anything anywhere moves,
 * and the handful of laws that are ABOUT one of the three loops announce it by calling
 * `inMotion()`. That call is also their negative control — a loop asserted to be running has
 * to be let run first, or the assertion is vacuous.
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
 * A law that sleeps to a computed instant and reads once is measuring the machine. `setTimeout`
 * is a minimum, and a loaded runner overshoots it — so a law that sleeps into a window wakes up
 * after the window has closed and reports a defect that is not there. Three such laws failed on
 * CI in one morning and none of them could be reproduced here, idle or under full load. What
 * still needs waiting on is asynchronous STATE the package does not control the timing of: a
 * scroller reaching its end, a popup mounting, a driver gesture the browser has not settled yet.
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
 * HOLD A PRESS on an element, and give back the release (2026-08-22).
 *
 * `userEvent.click` fires down and up together, so `:active` is over before any statement can
 * read it — which is why a law about a pressed appearance had, until now, to read the chain
 * values where the stylesheet keeps them instead of the state itself. button.browser.test.tsx
 * still says "`:active` cannot be forced from script"; that was true of the driver and is not
 * true of CDP, which dispatches a raw `mousePressed` with no release. Measured: `:active`
 * matches and the pressed fill computes.
 *
 * The pointer is MOVED first. A press with no preceding move lands on an element the browser
 * does not consider hovered, and on the surface layer hover and press are two different
 * declarations — so the reading would be of a state no user can produce.
 *
 * Always release. A pointer left down leaks into the next law exactly as a parked hover does
 * (the 2026-08-10 lesson), and the guard for that one cost three radio laws.
 */
export async function holdPress(el: Element): Promise<() => Promise<void>> {
  const { cdp } = await import("vitest/browser");
  const r = el.getBoundingClientRect();
  const at = { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  await cdp().send("Input.dispatchMouseEvent", { type: "mouseMoved", ...at, button: "none", buttons: 0 });
  await cdp().send("Input.dispatchMouseEvent", { type: "mousePressed", ...at, button: "left", buttons: 1, clickCount: 1 });
  return async () => {
    await cdp().send("Input.dispatchMouseEvent", { type: "mouseReleased", ...at, button: "left", buttons: 0, clickCount: 1 });
  };
}

/**
 * Let this test's subject move — which, since 2026-09-20, means one of the three content loops
 * (the Spinner's rotation, the indeterminate Progress sweep, the Attachment's upload sweep).
 *
 * Order-free on purpose: it sets a flag the harness honours on every render for the rest of the
 * test, rather than a switch a later `render` would flip back. The first spelling was
 * position-dependent, and calling it one line too early silently gave three laws a frozen page
 * again.
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
 * It is worth the CDP round trip because that is exactly what happened once: a suppression was
 * asserted by reading the stylesheet for a `prefers-reduced-motion` rule and checking which
 * selectors appeared inside it, every character of which was correct while the thing it named
 * went on moving — a selector present in a block still has to WIN. A media query the suite
 * cannot enter is a media query the suite cannot check.
 *
 * SINCE 2026-09-20 IT HAS EXACTLY THREE SUBJECTS. The package answers this preference in three
 * stylesheets and nowhere else, because three loops are all that is left moving: the Spinner,
 * the indeterminate Progress bar and the Attachment's upload sweep. Each SLOWS rather than
 * stopping — a busy indicator that freezes is information lost — so what a law reads here is a
 * longer duration, never `none`. Everything else is instant at every setting, which
 * `system/stillness.test.ts` holds structurally.
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
 * Ask the browser for MORE CONTRAST, the way an operating system does (2026-09-11).
 *
 * The third preference this suite can enter, and the one whose absence hid a live defect: the
 * generator emits every token-level conformance move under BOTH `[data-contrast="high"]` and
 * `@media (prefers-contrast: more)`, but the three rules that make a highlighted ROW legible
 * existed only in the prop form. So a person who turns the setting on at the OS level got the
 * tone bands, the solved edges, the track and the veil — and not the one thing they are
 * arrowing through. Measured when the prop path was fixed: 1.16:1 light, 1.08:1 dark.
 *
 * A law keyed on the prop cannot see that, because the prop path was always right.
 */
export async function asksForContrast(): Promise<void> {
  emulating = true;
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-contrast", value: "more" }],
  });
}

/**
 * Ask the browser to SEAL the glass, the way iOS and Windows do (2026-09-11).
 *
 * `asksForStillness` above, one preference over. The material's seal arm answers three media
 * conditions at once — `prefers-reduced-transparency: reduce`, `print` and
 * `forced-colors: active` — because a sealed pane is what all three want, and none of them was
 * enterable from this suite: every law about the seal read the STYLESHEET and none had ever
 * executed the block.
 *
 * That mattered the moment the filter row forked on the lens. The fork is a descendant selector,
 * so written as a `backdrop-filter` declaration it outweighed the seal arm and a sealed pane
 * kept a live blur — a defect no declaration-reading law could see, in the block that exists for
 * the person who asked the OS for less.
 *
 * Reset by the same afterEach that resets stillness, so a law that seals cannot leave the next
 * file sealed.
 */
export async function asksForSolidity(): Promise<void> {
  emulating = true;
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
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
/**
 * The px a glass element's LENS blurs its backdrop by — read off the mounted filter's own graph.
 *
 * Since 2026-09-21 a lensed pane's `backdrop-filter` carries no `blur()`: the chain runs the lens
 * first, so a stylesheet blur lands after the displacement and erases the bend. The blur is a
 * primitive inside the filter, on the source, and this is where a law about "how much does this
 * glass blur" has to look. Throws rather than answering 0: an element with no lens, or a lens
 * that does not blur its source, is an error in the fixture or the package, never a number.
 */
export function lensBlurOf(el: Element): number {
  const id = getComputedStyle(el).backdropFilter.match(/url\("?#([^")]+)/)?.[1];
  if (!id) throw new Error(`no lens on .${el.className}: ${getComputedStyle(el).backdropFilter}`);
  const soften = [...(document.getElementById(id)?.children ?? [])].find(
    (n) => n.tagName === "feGaussianBlur" && n.getAttribute("in") === "SourceGraphic",
  );
  if (!soften) throw new Error(`the lens on .${el.className} does not blur its source`);
  return Number(soften.getAttribute("stdDeviation"));
}

export const tokenOn = (scope: Element, name: string): string =>
  probeIn(scope, (el) => (el.style.width = `var(${name})`), (s) => s.width);

/** A NUMBER token as the scope resolves it — through opacity, because the width probe above
    rejects a unitless value as invalid and answers 0px for a perfectly healthy token. */
export const numberOn = (scope: Element, name: string): number =>
  parseFloat(probeIn(scope, (el) => (el.style.opacity = `var(${name})`), (s) => s.opacity));

/** A colour expression as the scope resolves it. */
export const colorOn = (scope: Element, expr: string): string =>
  probeIn(scope, (el) => (el.style.backgroundColor = expr), (s) => s.backgroundColor);

/**
 * A family role, replaced by a colour nothing in the palette can produce (2026-09-20). A law
 * that says "the current row reads the accent" used to prove it by asserting the row is NOT the
 * neutral text — which only holds while the brand is a pigment. With a grey brand the two are the
 * same pixels in dark, and the law failed on a correct stylesheet (the brand went grey on
 * 2026-09-19 as one config line, and seven laws broke with it).
 *
 * Marking the role makes the reading observable whatever the brand is: a subject that reads the
 * role paints `MARKER`, one that reads anything else does not. Declared on a wrapper INSIDE the
 * mounted Theme, so it beats the appearance scope by proximity. Name the role the subject reads
 * DIRECTLY: `--accent-current` is itself `var(--accent-ink)` in light, substituted at the Theme
 * scope, so marking the ink would not reach it.
 */
export const MARKER = "rgb(255, 0, 255)";

export function Marked({ roles, children }: { roles: string[]; children: ReactNode }) {
  return <div style={Object.fromEntries(roles.map((role) => [role, MARKER])) as CSSProperties}>{children}</div>;
}

/** A colour-valued custom property declared ON the element — the `inherits: false` case: the
    raw value is read off the element itself, then resolved through a child probe. */
export const ownColor = (el: Element, name: string): string =>
  probeIn(el, (probe) => (probe.style.color = computed(el, name)), (s) => s.color);

/** A LENGTH-valued custom property declared ON the element — `ownColor`'s sibling, and the
    instrument `tokenOn` cannot be for a registered `inherits: false` name (2026-09-06).
    `tokenOn` resolves through a CHILD probe, which is right for the inheriting names it was
    written for and silently answers the property's `initial-value` for a non-inheriting one —
    a healthy `--kui-pane-band-row-end` of 48px read back as 0px, and the law that found it
    failed as if the mechanism were broken. Read off the element itself; a registered `<length>`
    computes to a length, so there is nothing to resolve through a probe. */
export const ownLength = (el: Element, name: string): number =>
  parseFloat(computed(el, name));

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
