/**
 * Menu's mounted laws (§21, §22) — the 2026-08-03 standard: computed values through a
 * mounted <Theme>, both appearances where colour is the question.
 *
 * This file carries the §20 AGREEMENT LAW the ENGINEERING §2.1 portalling clause names as
 * its enforcement: the portalled popup (and a row inside it) must compute identical to an
 * in-flow twin wearing the same classes and attributes — the two-implementations rule
 * applied to portals. Every hit on a missing subject THROWS (the vacuity bar).
 *
 * WHAT THAT LAW CAN AND CANNOT SEE (stated 2026-08-09, audit). Its fact lists are properties
 * the token CASCADE delivers, and the wrapper re-stamps the cascade by construction — so on
 * its own it can only ever catch ONE mistake, a dropped stamp, and it was blind to every
 * portal defect the audit found. It has since gained the one comparable fact a portal really
 * does change (`direction`, under an RTL arm — it would have failed before RTL shipped), and
 * everything else a portal supplies rather than inherits now has its own named law below:
 * the un-themed path, tier resolution, the anchor-width floor, the submenu seam. An
 * agreement law is a floor, not the whole enforcement, and pretending otherwise is how nine
 * of fourteen findings sat behind a green suite.
 */
import * as React from "react";
import { afterEach, describe, expect, it, onTestFinished } from "vitest";
import { flushSync } from "react-dom";

import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuGroup,
  MenuLabel,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
} from "./menu.tsx";
import { Button } from "../button/button.tsx";
import { Box } from "../box/box.tsx";
import { Card } from "../card/card.tsx";
import { Kbd } from "../kbd/kbd.tsx";
import { Separator } from "../separator/separator.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import {
  DEPTHS,
  render as mount,
  inMotion,
  computed,
  probeIn,
  tokenOn,
  colorOn,
  ownColor,
  forEachCell,
  APPEARANCES,
  DENSITIES,
  renderSettled,
  settle,
  flushFlight,
  until,
  watchesFrames,
  catchDissolve,
  asksForStillness,
  type Cell,
} from "../../test/browser.tsx";

/** Every axis off its default — a dropped attribute is visible (the §20 constant). */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  depth: "elevated",
};

/** Mount an OPEN menu under a themed root; LOUD when the popup never mounts. */
function openMenu(theme: ThemeProps, ui?: React.ReactNode, size?: "1" | "2" | "3" | "4") {
  const host = render(
    <Theme {...theme}>
      <Menu defaultOpen {...(size ? { size } : {})}>
        <MenuTrigger render={<Button {...(size ? { size } : {})}>Open</Button>} />
        <MenuContent>
          {ui ?? (
            <>
              <MenuItem>Alpha</MenuItem>
              <MenuItem>Beta</MenuItem>
            </>
          )}
        </MenuContent>
      </Menu>
    </Theme>,
  );
  // The LAST popup: mounts accumulate within one test (the harness unmounts afterEach),
  // so "the popup" is the one THIS call opened, not the first one any call did. Reading
  // the first was a live bug in this file's own first cut — stale subjects made four laws
  // compare a popup against itself.
  const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the popup never mounted — every law below would assert nothing");
  settle(popup);
  return { host, popup, pad: padBox(popup), items: [...popup.querySelectorAll<HTMLElement>(".kui-menu-item")] };
}

/**
 * The element carrying the panel's PHYSICAL padding, and the one that clips (2026-08-17).
 *
 * Until ScrollArea the popup was both: it padded its rows and, being `overflow-y: auto`, it
 * was the scroll container whose padding box clipped their ink. The list now scrolls inside a
 * ScrollArea viewport, so the popup keeps the geometry that is about the PANE — its corner,
 * its bounds, its cast — and the viewport took the padding and the clipping with the
 * scrolling. Every law below that used to read `popup` for a distance INSIDE the panel reads
 * this instead; the ones about the pane itself still read the popup, which is the split worth
 * keeping visible. Throws rather than falling back to the popup: a silent fallback would let
 * this whole group go green against a menu that had lost its viewport entirely.
 */
/**
 * Wait until the entry has actually BEGUN, rather than assuming it began on a fixed frame
 * (2026-08-17). The runner poses in a layout effect, but Base UI's ScrollArea measures its
 * viewport before it draws, so adopting it pushed the pose one frame later — and a law that
 * samples "the first frame after the click" then reads the panel at its natural size and
 * reports the entry starting 46.5px wide of its trigger, which is a scheduling artifact
 * wearing a defect's clothes. Waiting on `data-seed` is the same discipline the sampling loop
 * below already applies at the other end (the panel's own signal, never a frame count), and
 * it CANNOT paper over a dead entry: an entry that never begins times out here and the law
 * fails on this line instead of on a number.
 */
/**
 * Open a menu the way a POINTER does (2026-08-17). `element.click()` dispatches an activation
 * with no pointer sequence behind it, and Base UI reads that as a non-reveal and stamps
 * `data-instant` — which the entry runner honours by design (an instant change must not be
 * animated, §22). So a law that opens with a bare click is not testing an entry at all; it is
 * testing the suppression. Measured both ways in a real page: synthetic click → `data-instant`
 * and no pose; a real pointer press → `data-seed` and the panel starting at its trigger's 56px
 * silhouette. This file already opened one law's menu this way (the render-merge law); the
 * flight laws now do the same, which is what makes their subject the flight.
 */
async function press(trigger: HTMLElement): Promise<void> {
  // userEvent, not a dispatched MouseEvent: Base UI's reveal test only trusts input the
  // browser itself generated, and hand-built events are `isTrusted: false` — dispatching the
  // full pointerdown/mousedown/click sequence still produced `data-instant` and no pose.
  // vitest's userEvent drives CDP, so these are the real thing.
  const { userEvent } = await import("vitest/browser");
  await userEvent.click(trigger);
}

/**
 * Capture the runner's own measurement AT POSE TIME (2026-08-17).
 *
 * `seeded()` below waits for a seed that is still on the element; this is for the laws that
 * need a value the release STRIPS (the FLIGHT_VARS). Driving real input takes multiple frames,
 * so by the time an `await press(...)` resolves the entry can already be over — the pose came
 * and went between two statements, and a law that looks afterwards concludes there was never
 * an entry at all. Armed before the click, this sees it happen.
 */
function watchPose(): Promise<{ flyW: number }> {
  return new Promise((resolve, reject) => {
    // A HANG-GUARD, not a bound on the subject — and the distinction matters here, because
    // "raise the number until it passes" is the move this suite forbids (2026-08-20: remove
    // the race, never widen the tolerance).
    //
    // Nothing about this law's claim is a duration. The observer is armed before the gesture
    // and keyed on the stamp, so it cannot miss the pose however long it takes — that is the
    // race already removed, by the second of the three sanctioned mechanisms. What remains is
    // only how long to wait before giving up with a readable message instead of hanging until
    // vitest's own timeout prints a useless one.
    //
    // One second was that number and it was measured on a quiet machine. CI red at ee665b7
    // (2026-08-23) on a commit touching four composer files and nothing else: the runner spent
    // 125s of test time in this project, and driving CDP input plus a React render plus the
    // runner's own measurement does not fit in a second there. Four, under vitest's 5000
    // default so this message still wins the race to report. The assertion below is untouched.
    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error("the entry never posed — no data-seed within 4s"));
    }, 4000);
    const observer = new MutationObserver(() => {
      const posed = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].find((el) =>
        el.hasAttribute("data-seed"),
      );
      if (!posed) return;
      const flyW = parseFloat(posed.style.getPropertyValue("--kui-fly-w"));
      if (Number.isNaN(flyW)) return;
      clearTimeout(timer);
      observer.disconnect();
      resolve({ flyW });
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-seed", "style"] });
  });
}

/* `seeded()` lived here until 2026-08-20 and is deliberately gone rather than kept for a future
   caller. It waited for `data-seed` to APPEAR on a popup handed to it, which reads as a helper
   and is a race: the pose is stamped in the commit and lasts about two frames, so anything that
   found the popup first — every caller did — was already looking after the fact. Its one
   consumer failed 6 runs of 6 when the file was run alone and passed inside the full file,
   which is a helper teaching its callers to depend on the machine. `watchPose()` above is the
   shape that works: armed BEFORE the interaction, so the pose is observed rather than hunted. */

function padBox(popup: HTMLElement): HTMLElement {
  const viewport = popup.querySelector<HTMLElement>(".kui-scroll-viewport");
  if (!viewport) throw new Error("the menu's scroll viewport never mounted — it carries the panel's padding");
  return viewport;
}

/**
 * Land the panel (§22, added 2026-08-09 with motion).
 *
 * Every law below this line is about a panel that HAS ARRIVED — its corner, its rows'
 * geometry, what the portal carried. A synchronous mount reads the entry's first frame
 * instead: the seed attribute is written in the mount commit and comes off a frame
 * later, so the popup these laws grab is a 40px seed, and the row-cell law duly measured a
 * two-line row at 68px against its 42px cell. This is the instrument-calibration lesson from
 * the Slider and Select rounds — a law that reads the wrong moment is not measuring the thing
 * it names.
 *
 * It does by hand exactly what the shipped reduced-motion block does — drop the seed, pin the
 * transitions — rather than waiting 480ms in 24 cells. The motion laws use `openUnsettled`
 * and never come through here.
 */

/**
 * The file's own `render`, and it shadows the harness's on purpose: EVERY law here is about a
 * panel that has arrived, and several mount their own menu rather than going through
 * `openMenu` — which is how three of them read a mid-flight box (a row measured 12px against
 * its 24px cell, exactly the body's 0.5 squish). Landing the panel at the mount point means a
 * new law cannot forget to. `openUnsettled` calls the harness's directly.
 */
const render = renderSettled;

/** The same mount with the entry left alone — the subject of the motion laws. */
async function openUnsettled(theme: ThemeProps = {}, ui?: React.ReactNode, size?: "1" | "2" | "3" | "4") {
  mount(
    <Theme {...theme}>
      <Menu defaultOpen {...(size ? { size } : {})}>
        <MenuTrigger render={<Button {...(size ? { size } : {})}>Open</Button>} />
        <MenuContent>
          {ui ?? (
            <>
              <MenuItem>Alpha</MenuItem>
              <MenuItem>Beta</MenuItem>
            </>
          )}
        </MenuContent>
      </Menu>
    </Theme>,
  );
  const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the popup never mounted — every law below would assert nothing");
  // These laws are ABOUT the entry, so they opt out of the harness's stillness (test/browser).
  inMotion();
  // The runner poses SYNCHRONOUSLY and measures a microtask later (unified 2026-08-16: a ref
  // callback runs before the commit's layout effects, so a synchronous measurement can read a
  // half-laid-out sliver). One turn of the queue is the flight fully armed — without it every
  // law here reads a pose whose numbers have not been written and measures NaN.
  await flushFlight();
  return { popup, body: popup.querySelector<HTMLElement>(".kui-floating-body")! };
}

/** The flight's own deadline in ms, read the way the runner reads it: the longest
    duration-plus-delay on the popup, plus the runner's margin. Derived rather than written
    down, so a law about interrupting a flight cannot drift when the clocks are retuned — as
    they were on 2026-08-16, which is what made two hardcoded waits go stale at once.

    It must be read with the pose OFF, which is the runner's own lesson one file over: the
    pose declares `transition: none`, so a posed read answers zero and every wait derived
    from it collapses — silently turning a law about interrupting a flight into a law about
    nothing. `departed()` below is how a law gets there. */
function flightClock(popup: HTMLElement): number {
  const style = getComputedStyle(popup);
  const delays = style.transitionDelay.split(",");
  const spans = style.transitionDuration
    .split(",")
    .map((d, i) => parseFloat(d) + parseFloat(delays[i % delays.length] ?? "0"));
  return Math.max(...spans, 0) * 1000 + 50;
}

/** The flight in the air: measured, posed, and one frame past the pose coming off. */
async function departed(popup: HTMLElement): Promise<number> {
  await flushFlight();
  for (let i = 0; i < 3; i++) await new Promise((r) => requestAnimationFrame(() => r(null)));
  if (popup.hasAttribute("data-seed")) throw new Error("the pose never came off — the clock would read zero");
  return flightClock(popup);
}

/**
 * The width a panel comes to REST at — watched, never slept to (2026-08-20).
 *
 * The travel law needs the destination to compare its release against, and its own sampling
 * loop cannot supply one: it stops at the release, so the last width it holds IS the released
 * width. Waiting a fixed span for the box to settle would put a statement about the machine
 * inside a statement about the code, which is the failure this file has already recorded three
 * times. Two identical readings a frame apart is the box holding still; the ceiling is a
 * guard against a hung channel, not a timing claim, and a slow runner only reaches the same
 * answer later.
 */
async function stillWidth(popup: HTMLElement): Promise<number> {
  const deadline = performance.now() + 2000;
  let last = -1;
  let steady = 0;
  while (performance.now() < deadline) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const w = Math.round(popup.getBoundingClientRect().width);
    steady = w === last ? steady + 1 : 0;
    last = w;
    if (steady >= 2) return w;
  }
  throw new Error("the panel never stopped changing width — there is no resting box to compare against");
}

/**
 * SEIZE A FLIGHT AT ITS DEPART EDGE (2026-08-20) — armed BEFORE the press, paused in the very
 * microtask the runner releases the pose, so a stalled runner can neither end the entry
 * between two statements (the recorded instrument lesson) nor ration the frames a law gets
 * to see.
 *
 * Two laws in this file sampled the flight once per rAF and made claims about the series,
 * each carrying a calibration a loaded runner fails honestly — four frames is all it painted
 * (CI: "the flight was never sampled: expected 4 to be greater than 6"). The sampler runs on
 * the thread that stalls — `sweep`'s lesson — but a flight is MANY clocks on two elements,
 * and stepping one while the others run desynchronizes exactly the relationships under test.
 * So every clock under the panel is paused at the depart edge and stepped TOGETHER: what
 * `at(t)` renders is what the engine itself would have painted at that instant, at a
 * resolution the host cannot change.
 *
 * FIT FOR RELATIVE CLAIMS ONLY — body-inside-panel, body-against-the-panel's-edge — because
 * the panel's PLACE is floating-ui's, a wall-time loop the seizure cannot step: fast-forward
 * the springs and the box is finished under an early placement, a state the browser never
 * paints (measured: a 1-2px phantom seam in both alignments). Both boxes shift together, so
 * relationships between them survive; absolute positions do not, which is why the
 * release-seam law next door proves a still plateau in real time instead.
 *
 * The runner's release is a wall-clock timer armed at depart and deliberately untouched: a
 * law does its stepping in one synchronous block and then calls `land()` — `finish()`, the
 * natural completion path (transitionend, never transitioncancel, which the dismissal
 * listener is armed for) — so the timer strips the flight attributes on schedule over a
 * panel already rendered at rest.
 */
function seizeFlight(): Promise<{
  popup: HTMLElement;
  clock: number;
  at: (t: number) => void;
  land: () => void;
}> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      watch.disconnect();
      reject(new Error("no flight departed inside 3s — the premise, not a timing claim"));
    }, 3000);
    const watch = new MutationObserver((records) => {
      for (const record of records) {
        const el = record.target as HTMLElement;
        if (record.attributeName !== "data-seed" || !el.classList.contains("kui-menu-popup")) continue;
        // The depart edge: the pose off while the flight attribute stays on. The runner's
        // synchronous probe (stamp-and-remove, floating.tsx) reads as both off by the time
        // this microtask runs, so it cannot be mistaken for a departure.
        if (el.hasAttribute("data-seed") || !el.hasAttribute("data-unfurling")) continue;
        clearTimeout(timer);
        watch.disconnect();
        const flights = el.getAnimations({ subtree: true });
        if (flights.length === 0) return reject(new Error("the flight departed with no clock to seize"));
        for (const a of flights) a.pause();
        resolve({
          popup: el,
          clock: Math.max(...flights.map((a) => Number(a.effect?.getComputedTiming().endTime ?? 0))),
          at: (t: number) => {
            for (const a of flights) a.currentTime = t;
          },
          land: () => {
            for (const a of flights) a.finish();
          },
        });
        return;
      }
    });
    watch.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-seed"] });
  });
}

/** The facts an axis reaches on the popup surface. */
function surfaceFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
    border: cs.borderTopColor,
    radius: cs.borderTopLeftRadius,
    padding: cs.paddingTop,
    shadow: cs.boxShadow,
    // Not cascade-delivered: the wrapper has to carry `dir` itself (§20).
    direction: cs.direction,
  };
}

/** The facts the control cells reach on a row. */
function rowFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    minHeight: cs.minHeight,
    padLeft: cs.paddingLeft,
    gap: cs.gap,
    font: cs.fontSize,
    radius: cs.borderTopLeftRadius,
    color: cs.color,
    bg: cs.backgroundColor,
    direction: cs.direction,
  };
}

afterEach(() => {
  document.documentElement.removeAttribute("data-appearance");
});

/* ── The §20 agreement law ────────────────────────────────────────────────────────────── */

describe("the agreement law: portalled ≡ in-flow (§20, un-marks ENGINEERING §2.1)", () => {
  /** The in-flow twin: the popup's exact classes and attributes, mounted in ordinary flow
      under the same Theme, with the positioner's own variable supplied so min-width
      computes from the same input. */
  /**
   * The class list and the row's, READ OFF A REAL POPUP rather than restated (2026-08-23).
   *
   * The twin used to carry hand-written copies, and the day the popup's identity changed —
   * `kui-floating-rows` joining it when Popover split the concentric corner off `kui-floating`
   * — three of these laws failed on a correct component, because the fixture was the stale
   * half. A fixture that restates what it is comparing against is the second home this repo
   * keeps finding in shipped code, and it is no better in a law.
   */
  function identities(): { popup: string; row: string } {
    const { popup, items } = openMenu({});
    return { popup: popup.className, row: items[0]!.className };
  }

  function twin(theme: ThemeProps) {
    const identity = identities();
    let popupTwin: HTMLElement | null = null;
    let itemTwin: HTMLElement | null = null;
    render(
      <Theme {...theme}>
        <div
          ref={(n: HTMLDivElement | null) => void (popupTwin = n)}
          className={identity.popup}
          data-size="2"
          data-tone="neutral"
          data-emphasis="quiet"
          data-bordered="true"
          style={{ "--anchor-width": "0px" } as React.CSSProperties}
        >
          <div
            ref={(n: HTMLDivElement | null) => void (itemTwin = n)}
            className={identity.row}
            data-size="2"
            data-tone="neutral"
            data-emphasis="quiet"
          >
            Alpha
          </div>
        </div>
      </Theme>,
    );
    if (!popupTwin || !itemTwin) throw new Error("twin never mounted");
    return { popupTwin: popupTwin as HTMLElement, itemTwin: itemTwin as HTMLElement };
  }

  it("computes identical under the hostile axis set — popup and row", () => {
    const { popup, items } = openMenu(HOSTILE);
    const { popupTwin, itemTwin } = twin(HOSTILE);
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(popupTwin));
    expect(rowFacts(items[0]!)).toEqual(rowFacts(itemTwin));
    // The comparison can fail: the same twin under default axes disagrees on the surface.
    const bare = twin({});
    expect(surfaceFacts(bare.popupTwin)).not.toEqual(surfaceFacts(popupTwin));
  });

  /* The UN-THEMED path (§20, audit 2026-08-09): axes carried on the DOM, no React <Theme>
     anywhere — the standalone path the emitted stylesheet promises and card.browser.test.tsx
     already law-enforces. The wrapper used to re-stamp its context DEFAULTS here, and could
     not tell "nobody chose an appearance" from "someone chose light": measured, a dark
     document opened a white menu. Falsified by making PortalScope render <Theme> always. */
  it("a document that stamps its axes on <html> opens a menu that agrees (§20)", () => {
    document.documentElement.setAttribute("data-appearance", "dark");
    document.documentElement.setAttribute("data-depth", "elevated");
    document.documentElement.setAttribute("data-density", "compact");
    try {
      // No <Theme> in the tree at all — the whole point.
      render(
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>,
      );
      const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
      const popup = popups[popups.length - 1];
      if (!popup) throw new Error("the popup never mounted");
      const row = popup.querySelector<HTMLElement>(".kui-menu-item");
      if (!row) throw new Error("no row");

      // The in-flow twin under the SAME document stamps — no Theme on either side.
      let cardEl: HTMLElement | null = null;
      render(<Card ref={(n: HTMLDivElement | null) => void (cardEl = n)}>plain</Card>);
      const card = cardEl as HTMLElement | null;
      if (!card) throw new Error("card twin never mounted");

      // Dark: the popup's seal is the document's, not the default context's white.
      expect(computed(popup, "background-color")).toBe(computed(card, "background-color"));
      // Elevated: the floating cast is the elevated row, not the flat fade.
      expect(computed(popup, "box-shadow")).not.toBe("none");
      // Compact: the row takes the document's density cell, not `default` — the row box is
      // line + 2 x inset (§21, 2026-08-09), and compact's inset (2) differing from default's
      // (4) is what makes this a real comparison.
      expect(row.getBoundingClientRect().height).toBeCloseTo(
        parseFloat(computed(row, "line-height")) + 2 * parseFloat(tokenOn(popup, "--row-inset-2")),
        1,
      );
      expect(tokenOn(popup, "--row-inset-2")).toBe(tokenOn(card, "--row-inset-2"));
    } finally {
      document.documentElement.removeAttribute("data-depth");
      document.documentElement.removeAttribute("data-density");
    }
  });

  /* The arm that makes `direction` a real comparison rather than a constant: both sides
     mount inside an RTL subtree, where CSS direction does NOT reach a body-level portal on
     its own. Falsified by dropping the wrapper's `dir` stamp. */
  it("agrees under RTL, where the cascade does not carry the answer (§20)", () => {
    // The twin takes its identity from the popup THIS law mounts, assigned after the render
    // rather than read from a menu of its own (2026-08-23). Two reasons, and the second is the
    // one that bit: `identities()` mounts a real menu, so calling it inside the JSX replaces
    // the tree being rendered, and calling it before leaves an extra portal in the document —
    // which this law's `document.querySelector(".kui-portal .kui-menu-popup")` then finds
    // FIRST, so the subject became the spare LTR menu. The law's own comment already says an
    // index is not an identification; an anatomy selector is not one either once a second
    // thing shares the anatomy.
    let popupTwin: HTMLElement | null = null;
    render(
      <Theme>
        <div dir="rtl">
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Alpha</MenuItem>
            </MenuContent>
          </Menu>
          <div
            ref={(n: HTMLDivElement | null) => void (popupTwin = n)}
            data-size="2"
            data-tone="neutral"
            data-emphasis="quiet"
            data-bordered="true"
            style={{ "--anchor-width": "0px" } as React.CSSProperties}
          />
        </div>
      </Theme>,
    );
    // By ANATOMY, not by index: the first cut took `popups[length - 2]` and the twin happens
    // to precede the portal in document order, so it compared the twin against itself and
    // survived the sabotage pass. An index is not an identification.
    const popup = document.querySelector<HTMLElement>(".kui-portal .kui-menu-popup");
    const twinEl = popupTwin as HTMLElement | null;
    if (!popup || !twinEl) throw new Error("subject or twin missing");
    if (popup === twinEl) throw new Error("the law is comparing the twin with itself");
    twinEl.className = popup.className;
    // Calibration: the twin really is in the RTL subtree, so a passing comparison means the
    // portal reached rtl rather than both sides sitting at the document's ltr.
    expect(computed(twinEl, "direction")).toBe("rtl");
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(twinEl));
  });

  /* MenuSubContent portals and re-themes too, and NOTHING asserted it: deleting its wrapper
     left the whole suite green while a submenu inside a themed subtree fell back to the
     document (audit 2026-08-09). The child panel is compared against its own PARENT panel,
     which is the twin that matters — two portals, one theme. */
  it("a submenu re-themes as well as its parent does (§20)", async () => {
    render(
      <Theme {...HOSTILE}>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            {/* A plain row in each panel: the sub TRIGGER carries a chevron slot, so
                comparing it against a slotless child row compares two different anatomies
                (the pill-side padding rule) rather than two themings. */}
            <MenuItem>Alpha</MenuItem>
            <MenuSub defaultOpen>
              <MenuSubTrigger>Export as</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>PNG</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const panels = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")];
    if (panels.length < 2) throw new Error("the child panel never mounted");
    const [parent, child] = panels.slice(-2) as [HTMLElement, HTMLElement];
    // Calibration: the hostile axes actually reached the parent, so "identical" is not two
    // panels agreeing on the defaults.
    const bare = openMenu({});
    expect(surfaceFacts(parent)).not.toEqual(surfaceFacts(bare.popup));
    expect(surfaceFacts(child)).toEqual(surfaceFacts(parent));
    const childRow = child.querySelector<HTMLElement>(".kui-menu-item");
    const parentRow = parent.querySelector<HTMLElement>(".kui-menu-item");
    if (!childRow || !parentRow) throw new Error("rows missing");
    expect(rowFacts(childRow)).toEqual(rowFacts(parentRow));
  });

  it("carries contrast=high through the portal", () => {
    const { popup } = openMenu({ appearance: "light", contrast: "high" });
    const { popupTwin } = twin({ appearance: "light", contrast: "high" });
    expect(popup.closest(".kui-theme")!.getAttribute("data-contrast")).toBe("high");
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(popupTwin));
  });
});

/* ── Row geometry: the family rides the control cells (§21) ───────────────────────────── */

describe("rows ride the existing control cells in all 24 cells (§21)", () => {
  function cellRow({ size, density, pointer }: Cell) {
    const { items, popup } = openMenu({ density, pointer }, undefined, size);
    return { row: items[0]!, popup };
  }

  it("min-height, padding, gap, font and corner are the control family's, per cell", () => {
    forEachCell((cell) => {
      const { row, popup } = cellRow(cell);
      const label = `${cell.pointer}/${cell.density}/${cell.size}`;
      // The ONE departure from the control cells (§21, reversed 2026-08-09 — the menu read
      // sparse): the row's box is its text line plus the cell's designed inset, never the
      // height ladder. min-height stands down to auto and the rendered box is asserted as
      // the SUM off the browser's own line-height — which the type bands move under coarse,
      // so this one expression prices all 24 cells.
      // THE FLOOR FIRST, because it is the guarantee and everything after it is the spelling.
      // This assertion is what the law was missing (2026-08-26 audit): the box check below
      // re-derives the very sum the stylesheet computes, so it agreed with the CSS whatever the
      // CSS said — the tautology this repo names as its own defect class. At fine + compact +
      // size 1 that sum is 16 + 2 + 2 = 20 and every assertion here passed on it.
      // §16 tier 1: "No designed cell in any pointer world at any density may fall below it."
      // The 24 is a LITERAL on purpose: reading it from the token would re-import the same
      // circularity, since the token is what the rule under test consumes.
      expect(row.getBoundingClientRect().height, `${label} is under the §16 floor`).toBeGreaterThanOrEqual(24);
      // FLOORED, not `auto`. The skeleton's control height stands down — that is the notch —
      // but the floor does not: `min-height: var(--target-min)`.
      expect(computed(row, "min-height"), label).toBe(tokenOn(popup, "--target-min"));
      const sum =
        parseFloat(computed(row, "line-height")) + 2 * parseFloat(tokenOn(popup, `--row-inset-${cell.size}`));
      expect(row.getBoundingClientRect().height, label).toBeCloseTo(
        Math.max(parseFloat(tokenOn(popup, "--target-min")), sum),
        1,
      );
      // The padding this comment has always named, now asserted (audit 2026-08-09): rows
      // have no leading slot in this mount, so the control skeleton's own side padding
      // applies and the row adds nothing of its own.
      // --control-px-PILL, not --control-px: a side whose content does not start with a
      // [data-slot] wrapper takes the pill padding (§4), and these rows have no slots. The
      // two are equal at every radius level except `full`, which is why naming the wrong one
      // still passed — asserted through the token actually in play, and pinned at `full`
      // below where they diverge.
      expect(computed(row, "padding-left"), label).toBe(
        tokenOn(popup, `--control-px-pill-${cell.size}`),
      );
      expect(computed(row, "padding-right"), label).toBe(computed(row, "padding-left"));
      expect(computed(row, "font-size"), label).toBe(tokenOn(popup, `--font-size-${cell.size}`));
      expect(computed(row, "gap"), label).toBe(tokenOn(popup, `--control-gap-${cell.size}`));
      // --radius-row-N, not --radius-control-N: rows left the height ladder, so at `full`
      // (the DEFAULT) their capsule is their own — the two tokens are equal at every other
      // level, which is exactly how naming the wrong one passed until the default flipped.
      expect(computed(row, "border-top-left-radius"), label).toBe(
        tokenOn(popup, `--radius-row-${cell.size}`),
      );
      // Full width: the row spans the panel's content box exactly.
      const box = padBox(popup);
      expect(row.getBoundingClientRect().width, label).toBeCloseTo(
        box.clientWidth - parseFloat(computed(box, "padding-left")) * 2,
        0,
      );
    });
  });

  it("at radius=full a slotless row takes the PILL padding, not the plain one (§4, §6)", () => {
    const { popup, items } = openMenu({ radius: "full" });
    const row = items[0]!;
    const pill = tokenOn(popup, "--control-px-pill-2");
    const plain = tokenOn(popup, "--control-px-2");
    // Calibration: this is the one level where the two diverge — without it the assertion
    // below is the same tautology the 24-cell law was passing on.
    expect(pill, "pill and plain must differ at full").not.toBe(plain);
    expect(computed(row, "padding-left")).toBe(pill);
  });
});

/* ── States, both appearances (§21) ───────────────────────────────────────────────────── */

describe("row states are the quiet rung's, driven by the highlight attribute (§21)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: highlighted paints the quiet HALF-step; un-highlighted rest is transparent`, () => {
      // Re-keyed 2026-08-26: this law used to pin lit ≡ full --tone-soft, which was the
      // defect stated as a guarantee — full soft is what a SELECTED (medium-resting) row
      // wears, so a hovered row and a selected one were byte-identical. The lit value is now
      // the mixed half-step; the half-step law at the end of this file owns the "less than
      // soft" claim, and this one keeps the two clauses only it can make: the highlight is
      // VISIBLE, and the un-highlighted sibling rests transparent.
      const { popup, items } = openMenu({ appearance });
      // Base UI highlights on keyboard: ArrowDown from the open popup lands on Alpha.
      popup.focus();
      flushSync(() => {
        popup.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      });
      const [alpha, beta] = items;
      if (!alpha || !beta) throw new Error("rows missing");
      expect(alpha.hasAttribute("data-highlighted"), "ArrowDown highlighted the first row").toBe(true);
      const lit = computed(alpha, "background-color");
      expect(lit, "the highlight is invisible").not.toBe("rgba(0, 0, 0, 0)");
      expect(lit, "the mix collapsed back to full soft").not.toBe(colorOn(popup, "var(--tone-soft)"));
      // The un-highlighted sibling rests transparent — quiet's rest, the stand-down's proof.
      expect(computed(beta, "background-color")).toBe("rgba(0, 0, 0, 0)");
    });

    it(`${appearance}: destructive ink, disabled remap, checked accent — computed, not claimed`, () => {
      const { popup } = openMenu({ appearance }, (
        <>
          <MenuItem tone="destructive">Delete</MenuItem>
          <MenuItem disabled>Dead</MenuItem>
          <MenuCheckboxItem defaultChecked>Ticked</MenuCheckboxItem>
          <MenuCheckboxItem defaultChecked disabled>Dead ticked</MenuCheckboxItem>
          <MenuItem>Plain</MenuItem>
        </>
      ));
      const [destructive, dead] = [...popup.querySelectorAll<HTMLElement>(".kui-menu-item")];
      const [ticked, deadTicked] = [...popup.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]')] as HTMLElement[];
      if (!destructive || !dead || !ticked || !deadTicked) throw new Error("rows missing");
      // Destructive: the tone indirection re-scopes the ink — a real red at rest, the
      // family's one designed text colour (§15's trio, which the row family reads since
      // 2026-08-09). NOT --destructive-label, the button-label value: that is #6c3230, a
      // brown, and the law asserted it for as long as the row was on control dress.
      expect(computed(destructive, "color")).toBe(colorOn(popup, "var(--destructive-ink)"));
      // Calibration: the two roles really differ, so naming the wrong one cannot pass.
      expect(colorOn(popup, "var(--destructive-ink)")).not.toBe(
        colorOn(popup, "var(--destructive-label)"),
      );
      // And a PLAIN row reads body ink, not the button label's grey — the other half of the
      // same finding, which no law covered at all.
      const plainRow = [...popup.querySelectorAll<HTMLElement>(".kui-menu-item")].find(
        (el) => el.textContent === "Plain",
      );
      if (!plainRow) throw new Error("plain row missing");
      expect(computed(plainRow, "color")).toBe(colorOn(popup, "var(--color-text)"));
      // Disabled: the shared arm's remap (neutral-8 label + disabled cursor), zero menu CSS.
      expect(computed(dead, "color")).toBe(colorOn(popup, "var(--neutral-8)"));
      expect(computed(dead, "cursor")).toBe(
        probeIn(popup, (el) => (el.style.cursor = "var(--cursor-disabled)"), (cs) => cs.cursor),
      );
      // Checked speaks accent through the INDICATOR (reversed 2026-08-09): the tick wears the
      // family at full chroma and the LABEL stays the row's ordinary ink — the whole-row
      // --accent-label ink read as dark emphasis, not selection.
      //
      // --accent-GLYPH since 2026-08-23, not the mark family's solid. The comment that used to
      // stand here said "the mark family's own bright solid" and justified it by the non-text
      // floor a glyph owes; measured, the solid is one hex in both appearances and misses that
      // floor on the dark page (|Lc| 43.4 against 45). The mark family's ON state does NOT
      // follow, and the divergence is principled rather than an oversight: a checked box is a
      // filled AREA and answers `nonTextLarge` (30), which the solid clears with room. Same
      // family, two floors, because the marks are two sizes.
      const indicator = ticked.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!indicator) throw new Error("indicator slot missing");
      expect(computed(indicator, "color")).toBe(colorOn(popup, "var(--accent-glyph)"));
      const plain = [...popup.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
        (el) => el.textContent === "Plain",
      );
      if (!plain) throw new Error("plain row missing");
      expect(computed(ticked, "color"), "a checked LABEL is ordinary ink").toBe(
        computed(plain, "color"),
      );
      // And a DEAD tick dims: the :not([data-disabled]) on the row stands the accent down,
      // so the indicator falls back to the disabled arm's inherited neutral-8.
      const deadIndicator = deadTicked.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!deadIndicator) throw new Error("dead indicator slot missing");
      expect(computed(deadIndicator, "color")).toBe(colorOn(popup, "var(--neutral-8)"));
      expect(computed(deadTicked, "color")).toBe(colorOn(popup, "var(--neutral-8)"));
      // The reserved gutter: the unchecked twin of a checkable row keeps its slot box.
      expect(indicator.getBoundingClientRect().width).toBeGreaterThan(0);
    });
  }

  it("a checkable row hides its indicator when unchecked — visibility, so the gutter holds", () => {
    const { popup } = openMenu({}, <MenuCheckboxItem>Unticked</MenuCheckboxItem>);
    const indicator = popup.querySelector<HTMLElement>('[data-slot="leading"]');
    if (!indicator) throw new Error("indicator slot missing");
    expect(indicator.hasAttribute("data-unchecked")).toBe(true);
    expect(computed(indicator, "visibility")).toBe("hidden");
    expect(indicator.getBoundingClientRect().width).toBeGreaterThan(0);
  });
});

describe("rows wear content dress, not button dress (§21)", () => {
  it("a row's weight is regular — and a Button's beside it stays medium", () => {
    // The TextField value's sentence one family over: medium is a BUTTON-label decision,
    // and a row is a line in a list you read. The negative half keeps the law honest —
    // if the skeleton ever went regular wholesale, this would be asserting nothing.
    const { items, popup } = openMenu({});
    const weight = (name: string) =>
      probeIn(popup, (el) => (el.style.fontWeight = `var(${name})`), (cs) => cs.fontWeight);
    expect(computed(items[0]!, "font-weight")).toBe(weight("--font-weight-regular"));
    const trigger = document.querySelector<HTMLElement>(".kui-button");
    if (!trigger) throw new Error("trigger missing");
    expect(computed(trigger, "font-weight")).toBe(weight("--font-weight-medium"));
  });
});

/* ── The popup surface (§22) ──────────────────────────────────────────────────────────── */

describe("the popup: smallest surface corner, floating cast in BOTH worlds, glass (§22)", () => {
  it("the panel corner is CONCENTRIC — row corner + panel padding, in every (size × level) cell", () => {
    // The third corner in a week, and the first derived one (Kushagra, 2026-08-09): the
    // overlay band read dialog-round on sight, and the fixed surface-1 that replaced it
    // only matched where row corner + padding happened to land on it (medium × 1-2,
    // large × 3) — a fixed pick CANNOT hold, because the row corner moves with BOTH the
    // size index and the radius level while a surface pick moves with neither. Derived,
    // the two curves share a centre in every cell by construction. Asserted off the
    // BROWSER's resolved values on both boxes — not by rebuilding the calc from tokens,
    // which would be the law agreeing with its own arithmetic (the 2026-08-03 lesson).
    for (const radius of ["small", "medium", "large", "full"] as const) {
      for (const size of ["1", "2", "3", "4"] as const) {
        const { popup, items } = openMenu({ radius }, undefined, size);
        const row = items[0];
        if (!row) throw new Error("row missing");
        const rowCorner = parseFloat(computed(row, "border-top-left-radius"));
        const pad = parseFloat(computed(padBox(popup), "padding-top"));
        // Lab port 2026-08-17: the panel is a SURFACE, and under `@supports (corner-shape:
        // squircle)` a surface draws its authored corner × --kui-corner-k (1.613). The ROW's
        // corner is NOT multiplied — controls never take squircle — so the concentric sum is
        // still authored as rowCorner + pad, and the knob applies once, to the panel's paint.
        // Derived through a probe inside the same panel so a non-squircle engine (knob
        // fallback 1) passes unchanged, and a re-priced knob moves both sides.
        const expected = parseFloat(
          probeIn(
            popup,
            (el) => (el.style.borderRadius = `calc(${rowCorner + pad}px * var(--kui-corner-k, 1))`),
            (s) => s.borderTopLeftRadius,
          ),
        );
        expect(
          parseFloat(computed(popup, "border-top-left-radius")),
          `${radius} × size ${size}`,
        ).toBeCloseTo(expected, 1);
      }
    }
    // Concentric arithmetic is undefined at zero: `none` means square, not "rounded by
    // exactly the padding" — the guard the formula needs, asserted where it bites.
    const { popup } = openMenu({ radius: "none" });
    expect(computed(popup, "border-top-left-radius")).toBe("0px");
  });

  it("padding and min-width are the menu's own designed tokens", () => {
    const { popup, pad } = openMenu({});
    // The padding is the panel's fact and the viewport is where it is SPENT (2026-08-17) —
    // the token is still the menu's own, read on the element that now applies it.
    expect(computed(pad, "padding-top")).toBe(tokenOn(popup, "--floating-p"));
    expect(popup.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      parseFloat(tokenOn(popup, "--floating-min-w")),
    );
  });

  /* The floor's ANCHOR half, which had no law at all: the shipped assertion above is entailed
     by the max() floor, so deleting the --anchor-width term left the whole suite green (audit
     2026-08-09). Both directions, because the defect was that the term reached a panel it
     should not: a wide TRIGGER must widen its menu, and a wide PARENT PANEL must not widen
     its submenu. --anchor-width is supplied directly rather than awaited, so the law states
     the rule instead of racing the positioner's first measurement. */
  it("a wide trigger widens its menu; a wide panel does not widen its submenu (§22)", () => {
    const { popup } = openMenu({});
    const floor = parseFloat(tokenOn(popup, "--floating-min-w"));
    const wide = `${floor + 240}px`;

    // The anchored panel takes the anchor when it is wider than the floor. Injected through
    // --kui-anchor-w — the HEAD of the chain since the entry began writing its own anchor
    // measurement (2026-08-10): the settled panel still carries the entry's value here, and a
    // value injected further down the chain would be shadowed by it.
    popup.style.setProperty("--kui-anchor-w", wide);
    expect(computed(popup, "min-width")).toBe(wide);
    // ...and keeps the floor when the anchor is narrower — max(), not "whatever the anchor is".
    popup.style.setProperty("--kui-anchor-w", "10px");
    expect(parseFloat(computed(popup, "min-width"))).toBe(floor);

    // The child panel ignores it entirely: its anchor is a row, not a trigger.
    const { popup: sub } = openMenu({}, (
      <MenuSub defaultOpen>
        <MenuSubTrigger>Export as</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>PNG</MenuItem>
        </MenuSubContent>
      </MenuSub>
    ));
    const child = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop()!;
    if (child === sub && !child.querySelector(".kui-menu-item")) throw new Error("no child panel");
    expect(child.classList.contains("kui-menu-anchored")).toBe(false);
    child.style.setProperty("--anchor-width", wide);
    expect(parseFloat(computed(child, "min-width")), "a submenu must not inherit panel width").toBe(
      floor,
    );
  });

  /* The floor's CAP half, which had no law at all (2026-08-26 audit). menu.css wraps the
     anchor floor in `min(…, max(--floating-min-w, --available-width))` — the 2026-08-22
     repair for "in CSS a minimum beats a maximum", whose own comment records the measured
     symptom: `side="right"` on a 900px trigger painted 951px at x=967 in a 1280 window, 638px
     off screen with the items unreachable. Nothing read it. The law above is entailed by the
     un-capped floor and the bounds law reads `max-width`, which a minimum overrules — so
     reverting to the pre-2026-08-22 spelling left the whole suite green. Select carries this
     law; the 2026-08-09 audit landed the repair in one sibling only, and this is the same
     sentence in the file that owns the declaration. */
  it("the available room OUTRANKS the anchor — a minimum cannot be capped by a maximum (§22)", () => {
    const { popup } = openMenu({});
    const floor = parseFloat(tokenOn(popup, "--floating-min-w"));
    // --kui-anchor-w is the HEAD of the chain (the entry writes it), so the anchor arm is
    // exercised by supplying it there; --available-width is the positioner's own report.
    popup.style.setProperty("--kui-anchor-w", "900px");
    popup.style.setProperty("--available-width", "300px");
    expect(
      popup.getBoundingClientRect().width,
      "a trigger wider than the room must not push the panel off screen",
    ).toBeLessThanOrEqual(301);
    // ...and the designed floor still holds when the reported room is absurd, so the cap
    // cannot squeeze the panel below the minimum it exists to guarantee. The inner max() is
    // what makes these two claims compatible; a law with only the first half would pass on a
    // panel that had simply become the room.
    popup.style.setProperty("--available-width", "10px");
    expect(
      popup.getBoundingClientRect().width,
      "the designed floor survives an absurd room",
    ).toBeGreaterThanOrEqual(floor);
  });

  it("a flat popup casts NOTHING — flat means flat, floating panes included (2026-08-19)", () => {
    // Reverses this law's own previous claim ("the popup casts in BOTH worlds", the
    // 2026-08-09 coverage-is-information amendment): separation in flat is the hairline's
    // job now, so the half-faded cast retired. The elevated popup is the negative control —
    // the same pane in the other world must still cast a real shadow.
    for (const depth of DEPTHS) {
      let card: HTMLElement | null = null;
      render(
        <Theme depth={depth}>
          <Card ref={(n: HTMLDivElement | null) => void (card = n)}>plain</Card>
        </Theme>,
      );
      const { popup } = openMenu({ depth });
      const cast = computed(popup, "box-shadow");
      if (depth === "flat") {
        // Every layer of the popup's list must be invisible — the pool and the world cast
        // both stand down to no-op layers, and how MANY no-op layers the list holds is
        // mechanism, not appearance. Zero geometry AND zero alpha per layer: a transparent
        // shadow with real offsets would also be invisible today, but it would be a value
        // waiting to paint the moment a color arrives.
        expect(cast, "flat popup resolves a real list").not.toBe("none");
        for (const layer of cast.split(/,(?![^(]*\))/)) {
          expect(layer, "a flat popup layer must be the no-op").toMatch(
            /^\s*rgba\(0, 0, 0, 0\) 0px 0px 0px 0px\s*$/,
          );
        }
        // ...and the flat world itself is intact: the card beside the menu casts nothing
        // either. Seat only (lab port 2026-08-17): flat removes the cast, never the pool.
        const seat = document.createElement("div");
        seat.style.boxShadow = "var(--material-pool-solid), 0 0 0 0 transparent";
        card!.append(seat);
        expect(computed(card!, "box-shadow"), "flat Card must stay flat").toBe(computed(seat, "box-shadow"));
        seat.remove();
      } else {
        expect(cast, "elevated popup still casts").not.toBe("none");
        // Visible means at least one layer with real alpha — a computed no-op list would
        // read rgba(0, 0, 0, 0) only.
        const alphas = [...cast.matchAll(/rgba?\([^)]*?([\d.]+)\)/g)].map((m) => parseFloat(m[1]!));
        expect(Math.max(0, ...alphas), "elevated cast is visible").toBeGreaterThan(0);
      }
    }
  });

  it("a glass popup keeps the floating cast in both worlds — coverage outranks transmission", () => {
    // Since the pool port (2026-08-17) the two popups differ in their FIRST layer by design —
    // glass wears the pane's bottom shade, solid its seat line — so the claim is about the
    // CAST: everything after the pool must be byte-identical, the floating chrome in both
    // worlds. Comparing whole strings again would quietly re-litigate the pool.
    // Lab port 2026-08-17: split on LAYER commas, not on the first "px," — the glass pool
    // serializes as "… -14px inset," (no "px,"), so the old slice ate the pool AND the
    // contact row and compared unequal tails. Commas inside rgb(…) are excluded by the
    // lookahead; layer one is dropped, the cast is the rest.
    const layersOf = (shadow: string) => shadow.split(/,(?![^(]*\))/).map((l) => l.trim());
    const castOf = (shadow: string) => layersOf(shadow).slice(1).join(", ");
    for (const depth of DEPTHS) {
      const { popup: solidPopup } = openMenu({ depth });
      const solidShadow = castOf(computed(solidPopup, "box-shadow"));
      // Fresh mount with glass: the filter engages, the fill goes translucent, and the
      // cast is byte-identical to the solid popup's — the floating chrome, not the
      // transmitted row (which is none in flat, where this assertion has teeth).
      let glass: HTMLElement | null = null;
      render(
        <Theme depth={depth} material="thin">
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent ref={(n: HTMLDivElement | null) => void (glass = n)}>
              <MenuItem>Alpha</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>,
      );
      if (!glass) throw new Error("glass popup never mounted");
      const g = glass as HTMLElement;
      expect(computed(g, "backdrop-filter"), depth).not.toBe("none");
      const glassShadow = computed(g, "box-shadow");
      expect(castOf(glassShadow), `${depth} glass cast`).toBe(solidShadow);
      // And the first layer is the WORLD's surface pool, or the cast comparison above is
      // comparing tails of two one-layer lists and proving nothing. Lab port 2026-08-17:
      // read the first LAYER (the old first-"px," slice never contained the pool at all)
      // against the same token the glass rule consumes — `--kui-surface-pool` rides the
      // world pointers, so elevated resolves the inset shade and flat stands it down to
      // the list-legal no-op ("flat means flat": the pool is matter, and flat quiets it
      // with the same stroke as the chrome).
      const pool = layersOf(glassShadow)[0]!;
      const expectedPool = probeIn(
        g,
        (el) => (el.style.boxShadow = "var(--kui-surface-pool, 0 0 0 0 transparent)"),
        (s) => s.boxShadow,
      );
      expect(pool, `${depth} glass pool is the world's`).toBe(expectedPool);
      // The teeth: in the elevated world that pool really is an inner shade — without this,
      // a world that stopped declaring the pool entirely would satisfy the equality above.
      if (depth === "elevated") expect(pool, "elevated glass pool is inner").toContain("inset");
    }
  });
});

/* ── Behavior smoke (Base UI's machine, one assertion per claim) ──────────────────────── */

/* ── The trigger's type surface (§5, §23's shape — 2026-08-26 audit) ───────────────────── */

describe("MenuTrigger takes the platform's button props, and only the system's are refused", () => {
  /**
   * `MenuTriggerProps` was a hand-written object literal of seven members until 2026-08-26 —
   * the last hand-listed trigger type in the floating family, where `SelectTriggerProps`,
   * `ButtonPartProps` and `DialogTriggerProps` are all `Omit<ComponentPropsWithoutRef<"button">,
   * …>`. It closed the type against `id`, `form`, `tabIndex`, `autoFocus`, `onClick` and the
   * focus handlers while TypeScript's hyphenated-name exemption waved `aria-*` and `data-*`
   * straight through undeclared — so it simultaneously blocked props that work and admitted
   * props it never named. `id` is the load-bearing one: it is what an external `<label for>`
   * and an `aria-controls` need, and the spread has always carried it to the DOM.
   *
   * This is a TYPE law and it fails under `tsc`, not under the runner — the props reached the
   * element either way, which is exactly why the defect was invisible to every mounted law in
   * this file. The runtime half below is the calibration: it proves the type is describing an
   * element that really does take these.
   */
  it("accepts the platform's own props on the trigger", () => {
    void (
      <MenuTrigger
        id="more-actions"
        form="settings"
        tabIndex={-1}
        autoFocus
        onClick={() => {}}
        onFocus={() => {}}
        aria-controls="panel"
      >
        Open
      </MenuTrigger>
    );
  });

  it("still refuses what the system owns", () => {
    // @ts-expect-error — colour is resolved output; a control never takes a raw fill (§9)
    void (<MenuTrigger color="red" />);
    // @ts-expect-error — no margin prop on any control (the first non-negotiable)
    void (<MenuTrigger m="4" />);
  });

  it("an id given to the trigger reaches the button a `<label for>` would point at", () => {
    const host = render(
      <Theme>
        <Menu>
          <MenuTrigger id="more-actions" render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const trigger = host.querySelector<HTMLElement>("button");
    if (!trigger) throw new Error("the trigger never rendered");
    expect(trigger.id, "the id lands on the rendered button").toBe("more-actions");
  });
});

describe("behavior: the platform's menu, not a styled div", () => {
  it("roles are the menu pattern's; Escape closes and unmounts the popup", async () => {
    const { popup, items } = openMenu({});
    expect(popup.getAttribute("role")).toBe("menu");
    expect(items[0]!.getAttribute("role")).toBe("menuitem");
    // A real key through the browser's event pipeline — a synthetic dispatch is not
    // trusted by the dismissal machinery, and a law that presses a key nobody pressed
    // proves nothing about the menu a user closes.
    const { userEvent } = await import("vitest/browser");
    popup.focus();
    await userEvent.keyboard("{Escape}");
    // UNMOUNTED is a STATE, not the next statement (2026-08-20, main's own run: "expected
    // <div data-side=\"bottom\" …> to be null", where the received popup wore
    // `data-ending-style` and `data-instant="dismiss"` — it was mid-exit, and Base UI unmounts
    // a closing popup only once its animations' `finished` promises settle. Reading straight
    // after the key asserts that the exit is INSTANTANEOUS, which is a claim about the machine
    // and not about the menu. A popup that genuinely never unmounts still expires the deadline
    // into the same assertion — falsified with a controlled-open menu, which fails at the full
    // deadline with the honest received node.
    await until(() => document.querySelector(".kui-menu-popup") === null, 3000);
    expect(document.querySelector(".kui-menu-popup")).toBeNull();
  });

  it("a radio item stamps data-checked after selection", () => {
    const { popup } = openMenu({}, (
      <MenuRadioGroup defaultValue="b">
        <MenuRadioItem value="a">A</MenuRadioItem>
        <MenuRadioItem value="b">B</MenuRadioItem>
      </MenuRadioGroup>
    ));
    const [a, b] = [...popup.querySelectorAll<HTMLElement>('[role="menuitemradio"]')];
    if (!a || !b) throw new Error("radio rows missing");
    expect(b.hasAttribute("data-checked")).toBe(true);
    expect(a.hasAttribute("data-checked")).toBe(false);
  });

  it("submenu: the sub trigger row exists, and its open state lights it through the shared rule", async () => {
    const { popup } = openMenu({}, (
      <MenuSub defaultOpen>
        <MenuSubTrigger>More</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>Nested</MenuItem>
        </MenuSubContent>
      </MenuSub>
    ));
    // The settled-frame lesson (Slider, 2026-08-06): Base UI stamps the trigger's open
    // state after first layout — a synchronous read lands one frame early and the law
    // would skip itself.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    // NOT popup.querySelector: with the child panel open, "the last popup" IS the child,
    // and its first row is "Nested". The sub trigger is the row that owns a popup —
    // queried by the contract that makes it one.
    const sub = document.querySelector<HTMLElement>('.kui-menu-item[aria-haspopup="menu"]');
    if (!sub) throw new Error("sub trigger missing");
    expect(sub.hasAttribute("data-popup-open")).toBe(true);
    // 2026-08-26: the lit value became the quiet HALF-step (mixed toward transparent), so
    // this law stopped pinning full --tone-soft and now records the LIT value itself, then
    // proves the popup-open arm reaches it alone. What it must not be: transparent (unlit)
    // or full soft (the mix collapsed).
    const litFill = computed(sub, "background-color");
    expect(litFill).not.toBe("rgba(0, 0, 0, 0)");
    expect(litFill, "the mix collapsed back to full soft").not.toBe(colorOn(popup, "var(--tone-soft)"));
    // ...and it is [data-popup-open] that does it. Base UI sets data-highlighted on this row
    // too, so the assertion above passed with the popup-open arm of the rule DELETED (audit
    // 2026-08-09) — a law naming a mechanism it never reached. Isolated by hand: the
    // attribute alone, on a row the highlight has left.
    sub.removeAttribute("data-highlighted");
    expect(computed(sub, "background-color"), "the popup-open arm must light it alone").toBe(litFill);
    // The child panel mounted, re-themed, wearing the same popup identity.
    const panels = document.querySelectorAll(".kui-menu-popup");
    expect(panels.length).toBe(2);
  });

  it("the trigger composes a real Button: one element, both contracts", () => {
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<Button emphasis="medium">Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const trigger = document.querySelector<HTMLButtonElement>(".kui-button");
    if (!trigger) throw new Error("trigger never mounted");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    // Clicking it opens the menu — the two render layers actually merged.
    flushSync(() => {
      trigger.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
      trigger.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      trigger.click();
    });
    expect(document.querySelector(".kui-menu-popup")).not.toBeNull();
  });

  /* The a11y contract Base UI branches on `nativeButton` (audit 2026-08-09). Unforwarded,
     it defaults true and an anchor trigger shipped `type="button"` plus an inert `disabled`
     with no `aria-disabled` — the Button defect of 2026-08-03, re-shipped. Read off the DOM,
     because the attribute is the thing that was wrong; falsified by deleting the
     `nativeButton={isNativeButton}` line, which restores `type="button"` on both anchors. */
  it("infers nativeButton from `render`: an anchor trigger is not a button (§5)", () => {
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<a href="/settings" />}>Settings</MenuTrigger>
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const link = document.querySelector<HTMLAnchorElement>('a[href="/settings"]');
    if (!link) throw new Error("anchor trigger never mounted");
    // `type` on an <a> is the linked resource's MIME type — a factually wrong attribute.
    expect(link.hasAttribute("type")).toBe(false);
    expect(link.getAttribute("role")).toBe("button");
    expect(link.getAttribute("aria-haspopup")).toBe("menu");
  });

  it("a disabled anchor trigger is announced disabled, not silently dead (§5)", () => {
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<a href="/settings" />} disabled>
            Settings
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const link = document.querySelector<HTMLAnchorElement>('a[href="/settings"]');
    if (!link) throw new Error("anchor trigger never mounted");
    // `disabled` is inert on an anchor: the non-native branch owes aria-disabled and must
    // take the element out of the tab order rather than leaving it focusable and dead.
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.hasAttribute("disabled")).toBe(false);
  });

  it("the nested blessed shape: one anchor, one contract, no disagreement (§5)", () => {
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<Button render={<a href="/docs" />}>Docs</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const link = document.querySelector<HTMLAnchorElement>('a[href="/docs"]');
    if (!link) throw new Error("nested anchor trigger never mounted");
    // Before the fix this node wore Button's role="button" AND MenuTrigger's type="button".
    expect(link.hasAttribute("type")).toBe(false);
    expect(link.getAttribute("role")).toBe("button");
  });

  it("a real button trigger keeps the native contract (the negative control)", () => {
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<Button>Open</Button>} disabled />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const trigger = document.querySelector<HTMLButtonElement>(".kui-button");
    if (!trigger) throw new Error("trigger never mounted");
    expect(trigger.tagName).toBe("BUTTON");
    // A native button takes the inert attribute and NO role/aria-disabled — the branch the
    // inference must not flip for the ordinary case.
    expect(trigger.hasAttribute("disabled")).toBe(true);
    expect(trigger.getAttribute("role")).toBeNull();
  });
});

/* ── The panel's interior (§22) ───────────────────────────────────────────────────────── */

describe("what the panel does to what is inside it (§22)", () => {
  /* The separator is INSET TO THE LABELS (2026-08-31; it was inset to the rows' own extent
     from 2026-08-09, and full-bleed before that — the same argument applied one layer further
     each time). It divides what the reader groups, which is the words, so it starts and ends
     where a bare-edged row's TEXT does. Two facts, and the group arm is why the law exists at
     all — a group is a transparent wrapper, so a separator between one group's rows must land
     exactly where a loose one does. Asserted against a ROW's own computed padding rather than
     a number, so `--kui-sf-row-px` and the control join's pill token cannot drift apart
     silently. Falsified three ways: dropping `margin-inline` lands it on the row's border box,
     restoring the old negative margin lands it on the panel's, and dropping the group arm from
     the selector fails the agreement arm. */
  it("a separator spans the labels, not the rows — in a group or out of one", () => {
    const { popup } = openMenu({}, (
      <>
        <MenuItem>Alpha</MenuItem>
        <Separator />
        <MenuGroup>
          <MenuItem>Beta</MenuItem>
          <Separator />
          <MenuItem>Gamma</MenuItem>
        </MenuGroup>
      </>
    ));
    const [loose, grouped] = [...popup.querySelectorAll<HTMLElement>(".kui-separator")];
    const row = popup.querySelector<HTMLElement>(".kui-menu-item");
    if (!loose || !grouped || !row) throw new Error("both separators and a row must mount");
    // Calibration, both boundaries this law has to tell apart: the panel's padding is a real
    // distance (so "the labels" and "the panel" differ), and so is the row's own (so "the
    // labels" and "the rows" differ — without this the law passes on the pre-fix stylesheet).
    expect(parseFloat(computed(padBox(popup), "padding-left")), "nothing to inset").toBeGreaterThan(0);
    expect(parseFloat(computed(row, "padding-left")), "no label inset to find").toBeGreaterThan(0);
    // The row's CONTENT box — where its label starts and ends — both edges, both separators.
    const rowBox = row.getBoundingClientRect();
    const textLeft = rowBox.left + parseFloat(computed(row, "padding-left"));
    const textRight = rowBox.right - parseFloat(computed(row, "padding-right"));
    for (const [name, el] of [["loose", loose], ["grouped", grouped]] as const) {
      const box = el.getBoundingClientRect();
      expect(Math.abs(box.left - textLeft), `${name} starts where a label does`).toBeLessThanOrEqual(0.5);
      expect(Math.abs(box.right - textRight), `${name} ends where a label does`).toBeLessThanOrEqual(0.5);
    }
    // And BOTH keep the panel's own rhythm above and below — which is now the only thing
    // the group arm of the selector supplies, so asserting it on the loose one alone left
    // that arm unfalsifiable (caught by its own sabotage pass: dropping the group arm from
    // the selector left this law green). A law about one member of a two-member rule is
    // half a law, the same lesson the Progress axis taught.
    for (const [name, el] of [["loose", loose], ["grouped", grouped]] as const) {
      expect(computed(el, "margin-top"), `${name} rhythm above`).toBe(computed(padBox(popup), "padding-top"));
      expect(computed(el, "margin-bottom"), `${name} rhythm below`).toBe(computed(padBox(popup), "padding-top"));
    }
  });

  /* The height half of the positioner's measurements shipped and the width half did not, so
     a menu wider than the room beside its trigger spilled off the viewport. Falsified by
     deleting the max-width declaration. */
  it("the panel is bounded by the room the positioner reports, in BOTH axes", () => {
    const { popup } = openMenu({});
    for (const [axis, prop] of [
      ["width", "max-width"],
      ["height", "max-height"],
    ] as const) {
      popup.style.setProperty(`--available-${axis}`, "137px");
      expect(computed(popup, prop), axis).toBe("137px");
    }
  });

  /* The wrapper is a body-level box the author never wrote, so it must not become the query
     container for the popup's contents (§2, §20). Falsified by deleting the
     `.kui-theme.kui-portal` rule — the tiered Box then reads the viewport and takes `md`. */
  it("a portalled subtree resolves tiers to `initial`, not to the viewport (§2)", () => {
    let inFlow: HTMLElement | null = null;
    const tiered = <Box p={{ initial: "1", md: "9" }} />;
    const { popup } = openMenu({}, (
      <>
        <MenuItem>Alpha</MenuItem>
        {tiered}
      </>
    ));
    const scope = popup.closest<HTMLElement>(".kui-theme");
    if (!scope) throw new Error("the portal scope is missing");
    expect(computed(scope, "container-type")).toBe("normal");

    // The viewport is wide enough that a container-reading Box WOULD take `md` — without
    // this the law would pass on a narrow window for the wrong reason.
    render(
      <Theme>
        <Box container style={{ width: 2000 }}>
          <Box ref={(n: HTMLDivElement | null) => void (inFlow = n)} p={{ initial: "1", md: "9" }} />
        </Box>
      </Theme>,
    );
    const wide = inFlow as HTMLElement | null;
    if (!wide) throw new Error("the in-flow control never mounted");
    expect(computed(wide, "padding-top"), "the control must take the md tier").toBe(
      tokenOn(popup, "--layout-space-9"),
    );

    const portalled = popup.querySelector<HTMLElement>(".kui-box");
    if (!portalled) throw new Error("the tiered box never mounted in the popup");
    expect(computed(portalled, "padding-top")).toBe(tokenOn(popup, "--layout-space-1"));
  });
});

/* ── The submenu's seam (§22) ─────────────────────────────────────────────────────────── */

describe("a trailing chip sits one inset from its three nearest edges (§21, 2026-08-16)", () => {
  it("top, end and bottom clearances match for a Kbd at the row's own size", () => {
    // Kushagra's sentence as a law: "the top, right, and bottom must match for kbd". The
    // row's inline padding is the control px, priced for where TEXT starts; the block
    // clearance is the row's own inset — so before the trailing slot ceded the difference,
    // a boxed chip sat equally off top and bottom and visibly farther from the end. The
    // Kbd is the row's own size so its 1lh face equals the row's line box, which is what
    // makes the three distances one number by construction — and at radius="full" (the
    // default) that equality is capsule-in-capsule CONCENTRICITY, the panel corner's own
    // sentence one nesting deeper.
    const { items } = openMenu({}, <MenuItem trailing={<Kbd size="2">⌘D</Kbd>}>Duplicate</MenuItem>);
    const row = items[0]!;
    const chip = row.querySelector<HTMLElement>(".kui-kbd")!;
    const r = row.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    const top = c.top - r.top;
    const bottom = r.bottom - c.bottom;
    const end = r.right - c.right;
    expect(top).toBeCloseTo(bottom, 0);
    expect(end, "the end clearance must be the block clearance").toBeCloseTo(top, 0);
    // The negative control that keeps this from passing vacuously: the row's TEXT padding
    // is a genuinely different (larger) number, so a slot resting at the text padding
    // cannot satisfy the law.
    expect(parseFloat(computed(row, "padding-inline-end"))).toBeGreaterThan(end + 1);
  });
});

describe("a submenu meets its parent panel where §22 says it does", () => {
  /* Both claims were false in every cell and neither had a law: the offsets were hardcoded
     JS numbers against a padding that MOVES with density (2/4/8), and the panel's border was
     never in the arithmetic at all. Density is the axis that breaks it, so the law walks all
     three — the one-cell lesson. Falsified by putting the constants back. */
  it("the child's first row is level with its trigger row, every density (§22)", async () => {
    for (const density of DENSITIES) {
      render(
        <Theme density={density}>
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 200 }}>
            <Menu defaultOpen>
              <MenuTrigger render={<Button>Open</Button>} />
              <MenuContent>
                <MenuItem>Alpha</MenuItem>
                <MenuSub defaultOpen>
                  <MenuSubTrigger>Export as</MenuSubTrigger>
                  <MenuSubContent>
                    <MenuItem>PNG</MenuItem>
                  </MenuSubContent>
                </MenuSub>
              </MenuContent>
            </Menu>
          </div>
        </Theme>,
      );
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 60));

      const panels = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")];
      if (panels.length < 2) throw new Error(`${density}: the child panel never mounted`);
      const [parent, child] = panels.slice(-2) as [HTMLElement, HTMLElement];
      const trigger = parent.querySelector<HTMLElement>('[aria-haspopup="menu"]');
      const firstRow = child.querySelector<HTMLElement>(".kui-menu-item");
      if (!trigger || !firstRow) throw new Error(`${density}: subject missing`);

      // Calibration: the seam is a real distance in this cell, so an offset of zero would
      // be visibly wrong rather than accidentally right.
      const seam =
        parseFloat(computed(padBox(parent), "padding-top")) +
        parseFloat(computed(parent, "border-top-width"));
      expect(seam, `${density}: nothing to align`).toBeGreaterThan(0);

      expect(
        Math.abs(firstRow.getBoundingClientRect().top - trigger.getBoundingClientRect().top),
        `${density}: the child's first row must sit level with its trigger`,
      ).toBeLessThanOrEqual(1);

      // "Sits flush against its parent panel" — against the PANEL, not against the row,
      // which sits inside the panel's own padding.
      expect(
        Math.abs(child.getBoundingClientRect().left - parent.getBoundingClientRect().right),
        `${density}: the child must sit flush against the parent panel`,
      ).toBeLessThanOrEqual(1);
    }
  });
});

/* ── The focused row (§8, §21) ────────────────────────────────────────────────────────── */

describe("a focused row's ring survives the panel that scrolls it (§8)", () => {
  /* `overflow-y: auto` makes the popup a scroll container, which clips descendant ink at the
     PADDING box in BOTH axes (a `visible` on the other axis computes to `auto`). The ring a
     row paints reaches width+offset outside its border box, so the panel's padding is what
     decides whether it exists — and at compact density it did not: measured 0 red pixels on
     the left and right of every row, and the first row's top band gone too. Density is the
     axis that moves it, so the law walks all three; the assertion is the ring's EXTENT
     against the padding box rather than a colour, because the ring was painting correctly
     and being cut. Falsified by restoring `--kui-sf-p: var(--floating-p)`. */
  it("the ring's outer extent lies inside the panel's padding box, every density", () => {
    for (const density of DENSITIES) {
      const { popup, items } = openMenu({ density });
      const row = items[0]!;
      row.focus();
      const reach =
        parseFloat(computed(row, "outline-width")) + parseFloat(computed(row, "outline-offset"));
      // Calibration: a ring that does not exist cannot be clipped, and would pass vacuously.
      expect(reach, `${density}: no ring to contain`).toBeGreaterThan(0);
      expect(computed(row, "outline-style"), density).toBe("solid");

      // The CLIPPER is the subject, and since 2026-08-17 that is the scroll viewport rather
      // than the popup: clearance has to exist wherever the clipping happens, which is the
      // whole reason the padding moved with the scrolling instead of staying on the pane.
      const box = padBox(popup);
      const pad = parseFloat(computed(box, "padding-left"));
      expect(pad, `${density}: the panel must clear the ring`).toBeGreaterThanOrEqual(reach);
      // Both axes, because both are clipped — the one-sided-law lesson (Progress, 2026-08-08).
      expect(parseFloat(computed(box, "padding-top")), density).toBeGreaterThanOrEqual(reach);
    }
  });

  /* The lit row is a signal, not resting dress, so the conformance surface must reach it
     (§19's rule, amended 2026-08-09). Falsified by deleting the [data-contrast="high"] arm.

     BOTH WORLDS since 2026-08-26. This law's fixture was solid-only, and the glass shape is
     where the arm actually lost: the pane's wash rule (surfaces.css) ties the HC arm at
     (0,4,0) and wins on source order, so a glass menu under contrast="high" kept the wash
     under a label that had already flipped to --tone-contrast — a near-white word on a faint
     wash, found by eye in the docs chrome (Theme material="thin"). The degenerate-fixture
     rule verbatim: the input never held the case where the general claim and the special one
     answer differently. Falsified by deleting the glass HC arm in surfaces.css — the solid
     cells stay green and only the glass cells fail, which is the defect's own shape. */
  it("contrast=high moves the lit fill — both appearances, solid AND glass (§19)", () => {
    for (const appearance of APPEARANCES) {
    for (const material of [undefined, "thin" as const]) {
      const normal = openMenu(material ? { appearance, material } : { appearance });
      const high = openMenu(
        material ? { appearance, contrast: "high", material } : { appearance, contrast: "high" },
      );
      const lit = (m: ReturnType<typeof openMenu>) => {
        const row = m.items[0]!;
        row.setAttribute("data-highlighted", "");
        return computed(row, "background-color");
      };
      const cell = `${appearance}/${material ?? "solid"}`;
      const before = lit(normal);
      const after = lit(high);
      // The ink follows the fill: a fill that moves under ink that does not is the half-fix.
      expect(computed(high.items[0]!, "color"), cell).toBe(
        colorOn(high.popup, "var(--tone-contrast)"),
      );
      // Calibration: the normal-mode fill is a real colour, not the transparent rest.
      // (2026-08-26: the lit value is the quiet half-step, so this stopped pinning full
      // --tone-soft — "not transparent" is the calibration this clause was always for.)
      expect(before, cell).not.toBe("rgba(0, 0, 0, 0)");
      expect(after, `${cell}: high contrast must move the highlight`).not.toBe(before);
      expect(after, cell).toBe(colorOn(high.popup, "var(--tone-solid)"));
    }
    }
  });

  /* The THIRD thing riding that fill (2026-08-10). The law above asserted the fill and the
     label and stopped, so the tick kept standing on the solid rung in --accent-solid: merely
     ugly in light (5.21:1) and a genuine failure in dark, where the row is near-white and the
     blue measures 2.65:1 against the 3:1 a non-text indicator owes — under the floor, on the
     conformance surface. Falsified by deleting the tick arm from recipes.css. */
  it("contrast=high moves EVERY slot on a lit row, not just the indicator (§19, §21)", () => {
    /**
     * ADDED 2026-08-23 (ultracode audit), and the fixture is the whole point.
     *
     * The two laws around this one mount `openMenu()`'s default items, which carry NO leading
     * icon — so when the same day's `.kui-row > [data-slot="leading"]` rule took the icon out
     * of the inherited colour chain, every high-contrast law here stayed green while a lit
     * row's icon painted the glyph ON the solid fill underneath it: measured APCA Lc 0.0 in 14
     * of 20 tone x appearance cells and under the non-text floor in all 20. A degenerate
     * fixture, in the exact sense the 2026-08-20 rule names — the input could not tell a
     * correct implementation from a broken one, because the input had no icon.
     *
     * So this law states its own item WITH an icon, and reads the icon rather than the tick.
     */
    for (const appearance of APPEARANCES) {
      const { popup, items } = openMenu(
        { appearance, contrast: "high" },
        <MenuItem leading={<span data-probe>▲</span>}>Alpha</MenuItem>,
      );
      const row = items[0]!;
      const icon = row.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!icon) throw new Error("no leading slot — the law would assert nothing");

      // Calibration first: the row must actually BE lit, or every assertion below is about an
      // unlit row and passes for the wrong reason.
      row.setAttribute("data-highlighted", "");
      expect(computed(row, "background-color"), `${appearance}: the row is not lit`).toBe(
        colorOn(popup, "var(--tone-solid)"),
      );

      // The icon rides the fill it sits on, exactly as the label does.
      expect(computed(icon, "color"), `${appearance}: the icon did not follow the fill`).toBe(
        colorOn(popup, "var(--tone-contrast)"),
      );
      expect(computed(icon, "color"), `${appearance}: icon and label disagree`).toBe(
        computed(row, "color"),
      );
      // And it is NOT the glyph — the value it wore before the fix, and the one that measured
      // Lc 0.0 against this very fill.
      expect(computed(icon, "color"), `${appearance}: the icon is still the glyph`).not.toBe(
        colorOn(popup, "var(--tone-glyph)"),
      );
    }
  });

  it("contrast=high moves the checked TICK too, in both appearances (§19, §21)", () => {
    for (const appearance of APPEARANCES) {
      const { popup, items } = openMenu(
        { appearance, contrast: "high" },
        <MenuCheckboxItem defaultChecked>Ticked</MenuCheckboxItem>,
      );
      const row = items[0]!;
      const tick = row.querySelector<HTMLElement>('[data-slot="leading"]');
      if (!tick) throw new Error("indicator slot missing — the law would assert nothing");

      // Calibration, and the negative control in one: UNLIT, the tick is still the accent.
      // This is what fails if the new arm is written without its state guard and swallows
      // every checked row in the panel. (--accent-GLYPH since 2026-08-23: a tick is fine
      // detail and owes the non-text floor, which the solid missed on the dark page.)
      expect(computed(tick, "color"), `${appearance}: an unlit tick keeps the accent`).toBe(
        colorOn(popup, "var(--accent-glyph)"),
      );

      row.setAttribute("data-highlighted", "");
      expect(computed(tick, "color"), `${appearance}: a lit tick follows the fill`).toBe(
        colorOn(popup, "var(--tone-contrast)"),
      );
      // It speaks with ONE voice: tick and label land on the same value, which is the whole
      // point — asserting the tick alone would pass if the label regressed underneath it.
      expect(computed(row, "color"), appearance).toBe(computed(tick, "color"));
      // And the two roles really differ, so naming the wrong token cannot pass either.
      expect(colorOn(popup, "var(--tone-contrast)"), appearance).not.toBe(
        colorOn(popup, "var(--accent-glyph)"),
      );
    }
  });
});

/* ── Direction (§20) ──────────────────────────────────────────────────────────────────── */

describe("direction crosses the portal, in both layers (§20)", () => {
  /** Mount inside an RTL subtree — the mixed-direction shape, where CSS direction does NOT
      reach a body-level portal on its own. */
  function inRtlSubtree(ui: React.ReactNode) {
    const host = render(
      <Theme>
        <div dir="rtl">{ui}</div>
      </Theme>,
    );
    const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
    const popup = popups[popups.length - 1];
    if (!popup) throw new Error("the popup never mounted");
    return { host, popup };
  }

  it("a portalled panel takes its author's direction, not the document's (§20)", () => {
    const { host, popup } = inRtlSubtree(
      <Menu defaultOpen>
        <MenuTrigger render={<Button>Open</Button>} />
        <MenuContent>
          <MenuItem trailing={<span>⌘D</span>}>Duplicate</MenuItem>
        </MenuContent>
      </Menu>,
    );
    // Calibration: the app really is RTL, and the document really is not — without both,
    // the assertion below could pass for the wrong reason.
    expect(computed(host.querySelector("div[dir]")!, "direction")).toBe("rtl");
    expect(computed(document.body, "direction")).toBe("ltr");

    expect(computed(popup, "direction")).toBe("rtl");
    // And the row's trailing slot moved to the physical LEFT — the margin is logical, so
    // this is the mirroring actually arriving rather than the attribute merely being set.
    const row = popup.querySelector<HTMLElement>(".kui-menu-item")!;
    const trailing = row.querySelector<HTMLElement>('[data-slot="trailing"]')!;
    const rowBox = row.getBoundingClientRect();
    const slotBox = trailing.getBoundingClientRect();
    expect(slotBox.left - rowBox.left).toBeLessThan(rowBox.width / 2);
  });

  it("an LTR app is unmoved — the trailing slot stays at the physical right", () => {
    const { popup } = openMenu({}, <MenuItem trailing={<span>⌘D</span>}>Duplicate</MenuItem>);
    expect(computed(popup, "direction")).toBe("ltr");
    const row = popup.querySelector<HTMLElement>(".kui-menu-item")!;
    const trailing = row.querySelector<HTMLElement>('[data-slot="trailing"]')!;
    const rowBox = row.getBoundingClientRect();
    const slotBox = trailing.getBoundingClientRect();
    expect(slotBox.left - rowBox.left).toBeGreaterThan(rowBox.width / 2);
  });

  it("the chevron points the way the submenu opens", () => {
    const { popup } = inRtlSubtree(
      <Menu defaultOpen>
        <MenuTrigger render={<Button>Open</Button>} />
        <MenuContent>
          <MenuSub>
            <MenuSubTrigger>Export as</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>PNG</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>,
    );
    const chevron = popup.querySelector<HTMLElement>(".kui-menu-chevron");
    if (!chevron) throw new Error("chevron missing");
    // A mirrored glyph, not a re-drawn one: the transform is the whole mechanism.
    expect(computed(chevron, "transform")).toBe("matrix(-1, 0, 0, 1, 0, 0)");
    // The LTR control leaves it alone.
    const { popup: ltr } = openMenu({}, (
      <MenuSub>
        <MenuSubTrigger>Export as</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>PNG</MenuItem>
        </MenuSubContent>
      </MenuSub>
    ));
    expect(computed(ltr.querySelector(".kui-menu-chevron")!, "transform")).toBe("none");
  });

  it("a submenu opens toward the inline end — leftward under RTL (§20)", async () => {
    async function sides(dir: "ltr" | "rtl") {
      const host = render(
        <Theme>
          <div dir={dir} style={{ display: "flex", justifyContent: "center" }}>
            <Menu defaultOpen>
              <MenuTrigger render={<Button>Open</Button>} />
              <MenuContent>
                <MenuSub defaultOpen>
                  <MenuSubTrigger>Export as</MenuSubTrigger>
                  <MenuSubContent>
                    <MenuItem>PNG</MenuItem>
                  </MenuSubContent>
                </MenuSub>
              </MenuContent>
            </Menu>
          </div>
        </Theme>,
      );
      // The settled-frame lesson: Base UI positions after first layout, and the direction
      // itself lands one commit late (it is measured off the trigger).
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 60));
      const panels = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")];
      if (panels.length < 2) throw new Error(`${dir}: the child panel never mounted`);
      const [parent, child] = panels.slice(-2) as [HTMLElement, HTMLElement];
      return { host, parent: parent.getBoundingClientRect(), child: child.getBoundingClientRect() };
    }

    const ltr = await sides("ltr");
    expect(ltr.child.left, "ltr: the child opens to the right").toBeGreaterThan(ltr.parent.left);

    const rtl = await sides("rtl");
    // Before DirectionProvider was rendered, this measured child.left 875 against
    // parent.right 880 — the same rightward open as LTR, overlapping the parent panel.
    expect(rtl.child.left, "rtl: the child opens to the left").toBeLessThan(rtl.parent.left);
  });
});

/* ── Group semantics ──────────────────────────────────────────────────────────────────── */

describe("groups and labels: the wiring is Base UI's, the dress is the row's", () => {
  it("a label names its group via aria-labelledby, reads faint, and takes no pointer", () => {
    const { popup } = openMenu({}, (
      <MenuGroup>
        <MenuLabel>Section</MenuLabel>
        <MenuItem>Row</MenuItem>
      </MenuGroup>
    ));
    const group = popup.querySelector<HTMLElement>('[role="group"]');
    const label = popup.querySelector<HTMLElement>(".kui-menu-label");
    if (!group || !label) throw new Error("group or label missing");
    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
    expect(computed(label, "color")).toBe(colorOn(popup, "var(--color-text-muted)"));
    expect(computed(label, "pointer-events")).toBe("none");
  });

  /* The shadcn shape — a label as a direct child of Content, above the first group — is what
     this component's header says it adopted, and Base UI's GroupLabel throws unconditionally
     without a group context, in BOTH builds. Mounted OPEN, because the throw fires when the
     portal renders, not at mount: a render-only check walks straight past it. Falsified by
     restoring the bare `BaseMenu.GroupLabel`, which takes the whole root down here. */
  it("a label outside a group is a heading, not a crash (§22)", () => {
    const { popup } = openMenu({}, (
      <>
        <MenuLabel>My Account</MenuLabel>
        <MenuItem>Profile</MenuItem>
      </>
    ));
    const label = popup.querySelector<HTMLElement>(".kui-menu-label");
    if (!label) throw new Error("standalone label missing");
    // Same dress as the in-group label — the skeleton is the row's either way.
    expect(computed(label, "color")).toBe(colorOn(popup, "var(--color-text-muted)"));
    expect(computed(label, "pointer-events")).toBe("none");
    expect(label.getBoundingClientRect().height).toBeCloseTo(
      parseFloat(computed(label, "line-height")) + 2 * parseFloat(tokenOn(popup, "--row-inset-2")),
      1,
    );
    // It is a heading, not a menu row: nothing announces it as an item.
    expect(label.getAttribute("role")).toBeNull();
    // And the rows around it still work — the popup did not lose its subtree.
    expect(popup.querySelectorAll(".kui-menu-item").length).toBe(1);
  });

  /**
   * A PANEL BOUNDARY resets the group question (2026-08-26 audit).
   *
   * `MenuInGroupContext` was set by `MenuGroup` and never reset by a popup, and React context
   * follows the tree rather than the DOM — so a `MenuSub` composed inside a `MenuGroup` (the
   * canonical shadcn dropdown shape this file's component header says it adopted) carried that
   * group across the portal into a panel that is not inside it. A `MenuLabel` in the child
   * panel then took Base UI's GroupLabel part, whose effect registers its id with whatever
   * group context it can see: the PARENT group announced the submenu's heading while the
   * submenu was open, and Base UI's own cleanup (`setLabelId(undefined)`) stripped the group's
   * accessible name outright when the submenu closed. Both halves are read here, because the
   * one that survives a close is the one a screen reader user is left with.
   */
  it("a label in a submenu names its own panel, and leaves the parent group's name alone (§22)", async () => {
    let closeSub: (() => void) | null = null;
    function Nested() {
      const [subOpen, setSubOpen] = React.useState(true);
      closeSub = () => setSubOpen(false);
      return (
        <Theme>
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuGroup>
                <MenuLabel>File</MenuLabel>
                <MenuItem>New</MenuItem>
                <MenuSub open={subOpen}>
                  <MenuSubTrigger>Export as</MenuSubTrigger>
                  <MenuSubContent>
                    <MenuLabel>Format</MenuLabel>
                    <MenuItem>PNG</MenuItem>
                  </MenuSubContent>
                </MenuSub>
              </MenuGroup>
            </MenuContent>
          </Menu>
        </Theme>
      );
    }
    render(<Nested />);
    const group = document.querySelector<HTMLElement>('[role="group"]');
    const labels = [...document.querySelectorAll<HTMLElement>(".kui-menu-label")];
    if (!group) throw new Error("the group never rendered");
    // The fixture must really contain BOTH labels, or the claim below is about one panel.
    expect(labels.map((l) => l.textContent), "both panels rendered a label").toEqual([
      "File",
      "Format",
    ]);
    const [parentLabel, subLabel] = labels as [HTMLElement, HTMLElement];
    expect(
      group.getAttribute("aria-labelledby"),
      "the parent group is named by ITS OWN label, not the submenu's",
    ).toBe(parentLabel.id);
    // The child panel's label is a heading in its own right — it has no group to belong to,
    // so it takes the standalone fallback and announces nothing as a group name.
    expect(subLabel.getAttribute("role")).toBeNull();

    // ...and closing the submenu must not take the parent group's name with it. Base UI's
    // GroupLabel cleanup runs on unmount, which is exactly when a screen reader user would
    // have been left with an unnamed group.
    flushSync(() => closeSub!());
    expect(
      await until(() => document.querySelectorAll(".kui-menu-popup").length === 1),
      "the submenu really unmounted — the cleanup this law is about runs on unmount",
    ).toBe(true);
    expect(
      document.querySelector<HTMLElement>('[role="group"]')!.getAttribute("aria-labelledby"),
      "the group keeps its name after the submenu closes",
    ).toBe(parentLabel.id);
  });

  it("a label inside a radio group keeps the group wiring (§22)", () => {
    const { popup } = openMenu({}, (
      <MenuRadioGroup defaultValue="a">
        <MenuLabel>Sort by</MenuLabel>
        <MenuRadioItem value="a">Name</MenuRadioItem>
      </MenuRadioGroup>
    ));
    const group = popup.querySelector<HTMLElement>('[role="group"]');
    const label = popup.querySelector<HTMLElement>(".kui-menu-label");
    if (!group || !label) throw new Error("radio group or label missing");
    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
  });
});

/* ── Motion: the emergence recipe (§8, §22 — judged 2026-08-09 in the motion lab) ──────── */

describe("the panel unfurls out of a seed (§22)", () => {
  /**
   * A curve token, read RAW. `tokenOn` resolves through a width probe and answers `0px` for a
   * perfectly healthy `linear()` — the same shape as the `numberOn` split one value-type over.
   */
  const curveOn = (el: HTMLElement, name: string) =>
    getComputedStyle(el).getPropertyValue(name).trim();

  /**
   * The samples inside a `linear()`, which is how two curves are compared here. The browser
   * re-serializes `linear(0, 0.021 2.78%, …)` as `linear(0 0%, 0.021 2.78%, …)`, so a string
   * match fails on a curve that is identical in every way that matters.
   */
  const samples = (curve: string) =>
    curve
      .slice(curve.indexOf("(") + 1, curve.lastIndexOf(")"))
      .split(",")
      .map((stop) => stop.trim().split(/\s+/)[0]!);

  /** Pin the clocks. A computed value mid-transition is the ANIMATED value, so reading opacity
      the instant the exit is stamped answers 1 — the first frame of the fade, not what the
      fade is toward. Every law that reads a VALUE pins first; the ones that read the declared
      transition list must not, because pinning erases it. */
  const still = (...els: HTMLElement[]) => {
    for (const el of els) el.style.setProperty("transition", "none", "important");
  };

  /** The state Base UI hands a panel while it leaves. Stamped rather than waited for: the
      attribute IS the contract (MenuPopupDataAttributes.endingStyle), and what is under test
      is what the stylesheet does with it — computed, on a real element, in the real cascade. */
  const ending = (popup: HTMLElement) => {
    popup.removeAttribute("data-seed");
    popup.setAttribute("data-ending-style", "");
  };

  it("an open menu's trigger stays lit — in use, not hovered (§21, promoted 2026-08-10)", () => {
    /**
     * Kushagra: *"just like select trigger continues to be in a selected state, dropdown
     * menus trigger also should remain in the state where it activated the dropdown."* The
     * third control saying §21's sentence, so the rule promoted to the shared layer: a
     * control whose popup is open holds the HOVER step for as long as the panel is.
     */
    const host = render(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
        <Button>Closed twin</Button>
      </Theme>,
    );
    const [trigger, twin] = [...host.querySelectorAll<HTMLElement>(".kui-button")];
    expect(trigger!.getAttribute("data-popup-open"), "Base UI must stamp the state").not.toBeNull();
    expect(
      computed(trigger!, "background-color"),
      "an open trigger does not rest",
    ).not.toBe(computed(twin!, "background-color"));
    // The HOVER step, not a state of its own — the family vocabulary, read off the element's
    // own registered source (inherits: false, so a child probe cannot see it).
    expect(computed(trigger!, "background-color")).toBe(
      ownColor(trigger!, "--kui-ct-fill-src-hover"),
    );
  });

  it("an open trigger's geometry is LOCKED — the panel must not move with a hover settle (§8)", async () => {
    /**
     * Kushagra: *"leaving the mouse off triggers also moves the menu as the button moves back
     * to its OG position."* Not cosmetic: floating-ui measures the anchor WITH its transforms,
     * so the trigger's 1px hover settle — 550ms of lively spring — drags the whole anchored
     * panel with it. While its popup is open, a trigger is a hinge: no rise, no sink. The
     * closed twin is the calibration — the same pointer, the same mount, and it must still
     * rise, or this law is reading a page where hover never works at all.
     */
    // Calibration FIRST, while the menu is closed: Base UI inerts the whole page behind an
    // open menu (its backdrop intercepts the pointer), so nothing but the panel and its
    // trigger can be hovered once it opens — the first spelling waited fifteen seconds for a
    // twin the backdrop would never surrender. The same pointer then opens the menu by
    // clicking the trigger, which leaves it genuinely hovering the thing the law is about.
    const host = render(
      <Theme>
        <Button>Closed twin</Button>
        <Menu>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const [twin, trigger] = [...host.querySelectorAll<HTMLElement>(".kui-button")];
    const { userEvent } = await import("vitest/browser");

    await userEvent.hover(twin!);
    const [, y] = computed(twin!, "translate").split(" ");
    expect(parseFloat(y ?? "0"), "the twin must rise, or hover is broken here").toBeLessThan(0);

    await userEvent.click(trigger!);
    // OPEN is a STATE, not the statement after the click (2026-08-21, CI on main: "the click
    // must have opened it: expected null not to be null"). `data-popup-open` is React state
    // that Base UI commits in a render, and a driver gesture resolving is not that render
    // having happened — reading it here asserts the open is SYNCHRONOUS, which is a claim
    // about the machine. A trigger that genuinely never opens still expires the deadline into
    // the same assertion, with the same null in the message.
    await until(() => trigger!.getAttribute("data-popup-open") !== null, 3000);
    expect(trigger!.getAttribute("data-popup-open"), "the click must have opened it").not.toBeNull();
    // The pointer is PUT there rather than assumed to have stayed (2026-08-20, CI: "the pointer
    // rests on the trigger it pressed: expected false to be true"). Where the driver leaves the
    // mouse after a click is a fact about Playwright, and this law is about what an OPEN trigger
    // does in each pointer state — both of which it goes on to exercise explicitly.
    //
    // And the trigger must be REACHABLE before the pointer is put there (the same CI failure's
    // second cause): the entry's seed is the trigger's own silhouette sitting exactly ON it,
    // and the flight hit-tests by design — so for the seed's frames, and longer on a stalled
    // runner, a hover aimed at the trigger lands on the panel covering it and `:hover` reads
    // false. Waited out as a STATE: the panel rests below its trigger, so the point clears.
    await until(() => {
      const box = trigger!.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return hit !== null && (hit === trigger || trigger!.contains(hit));
    }, 3000);
    await userEvent.hover(trigger!);
    // A STATE, not the statement after the gesture (2026-08-21, the sweep after CI's
    // "the click must have opened it"): a driver gesture resolving is not the browser
    // having settled what the gesture causes. If it never settles, the deadline expires
    // into the same assertion, with the same value in the message.
    await until(() => trigger!.matches(":hover"), 2000);
    expect(trigger!.matches(":hover"), "the pointer must be on the trigger for the held read").toBe(true);
    // HELD DOWN, not locked at rest (revised the same hour): the press put it down, the open
    // panel keeps it there — the click latches. One value whether the pointer stays or goes,
    // which is the half that stills the panel.
    const held = `0px ${tokenOn(trigger!, "--press-travel")}`;
    expect(computed(trigger!, "translate"), "an open trigger stays pressed").toBe(held);
    await userEvent.unhover(trigger!);
    expect(computed(trigger!, "translate"), "pointer off, still pressed — the panel must not move").toBe(held);
  });

  it("the first frame is the trigger's SILHOUETTE, sitting exactly on it (§22)", async () => {
    /**
     * The silhouette (2026-08-15, Kushagra: *"make the circle shape of trigger exactly, and
     * make it start from where the trigger is, thats all"* — the interim circle and its
     * quadrant reverted on sight): the panel's first frame is the trigger's own box sitting
     * ON the trigger, and the unfurl grows it straight into the panel's own — which is what
     * answers where the panel came from.
     *
     * One frame first: the overlay's offset is AIMED after floating-ui places the
     * positioner (a microtask, re-checked on the first frame), and the seed holds for two —
     * so one awaited frame lands between the aim and the release.
     */
    const { popup } = await openUnsettled();
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const trigger = document.querySelector<HTMLElement>(".kui-button")!;
    const box = trigger.getBoundingClientRect();
    expect(popup.hasAttribute("data-seed"), "the read must land on the seed frame").toBe(true);
    const seed = popup.getBoundingClientRect();
    // Within the held press's drift, not to the pixel: the silhouette measured the trigger
    // on the open's first frame, and the trigger then shrank a hair under the held press.
    expect(Math.abs(seed.width - box.width), "the trigger's own width").toBeLessThan(3);
    expect(Math.abs(seed.height - box.height), "the trigger's own height").toBeLessThan(3);
    expect(Math.abs(seed.left - box.left), "sitting exactly on the trigger").toBeLessThan(3);
    expect(Math.abs(seed.top - box.top), "in both axes").toBeLessThan(3);
    expect(
      parseFloat(computed(popup, "border-top-left-radius")),
      "wearing the trigger's own corner",
    ).toBeCloseTo(parseFloat(getComputedStyle(trigger).borderTopLeftRadius), 1);
    // OPAQUE from the first frame: the silhouette covers the trigger exactly, so this is
    // the trigger's own body lifting, and a body does not fade in (2026-08-10, back in
    // force now that the seed overlaps its trigger again).
    expect(computed(popup, "opacity"), "the silhouette is the trigger lifting").toBe("1");
    // And the body is squished, which is the difference between one object unfurling and a
    // shutter opening over a finished page.
    const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;
    expect(computed(body, "scale")).toBe("0.95 0.5");
    // MOLTEN: the content is out of focus while the box is not yet its shape, sharpening as
    // the unfurl lands — and the sharpening is a transition, not a snap.
    expect(computed(body, "filter"), "the content arrives molten").toMatch(/^blur\(/);
    expect(computed(body, "opacity"), "and empty — the body is the held unit").toBe("0");
    expect(
      computed(body, "transition-property").split(",").map((v) => v.trim()),
      "and it resolves on a clock",
    ).toContain("filter");
    expect(computed(popup, "box-shadow"), "the seed sits flat on the page").toBe("none");
    expect(computed(popup, "pointer-events"), "the flight must hit-test").toBe("auto");
  });

  // WATCHES FRAMES: it hunts for the last AIMED SEED frame — a pose that holds about two
  // frames — by polling, so a stalled runner misses the window and reports a submenu that
  // never posed. Local only (test/browser.tsx carries the criterion).
  it("a KEYBOARD dismissal dissolves, exactly like a pointer's (§8, §22)", async () => {
    /**
     * Measured 2026-08-22: pressing Escape removed a menu in ONE FRAME — opacity 1 to 0, gone
     * in 29ms — while the same menu dismissed by an outside press or by choosing a row
     * dissolved over ~220ms. Select, Dialog and AlertDialog all dissolved on Escape; only this
     * family had the arm.
     *
     * Menu's own store sets `instantType` to `dismiss` when `reason === escapeKey || reason ==
     * null`, so the value means a KEYBOARD dismissal or an imperative one — and the flight
     * rule read every value but `click` as "do not animate", at (0,4,0) against the exit
     * recipe's (0,3,0). The comment above that rule described `dismiss` as "a dismissal the
     * pointer already committed to", which is Popover's store rather than Menu's, and had the
     * two exactly backwards: the pointer's dismissal keeps its dissolve, the keyboard's was the
     * one erased. It is the precise inverse of the 2026-08-19 `click` exemption, which was
     * applied to opens and never checked for closes.
     *
     * Read as the AGREEMENT between the two routes rather than against a literal clock, so a
     * retuned exit cannot make this law lie; the pointer route is the control.
     */
    inMotion();
    const { userEvent } = await import("vitest/browser");

    const clocksOnDismissal = async (dismiss: (t: HTMLElement) => Promise<void>) => {
      const host = mount(
        <Theme>
          <div style={{ padding: 120 }}>
            <Menu>
              <MenuTrigger render={<Button>Open</Button>} />
              <MenuContent>
                <MenuItem>Alpha</MenuItem>
                <MenuItem>Beta</MenuItem>
              </MenuContent>
            </Menu>
          </div>
        </Theme>,
      );
      const trigger = host.querySelector<HTMLElement>(".kui-button")!;
      await press(trigger);
      await flushFlight();
      // The OPEN one, never "the first" or "the last" (this file's own instrument scar, twice):
      // a previous law's panel can still be mid-dissolve, and document order says nothing about
      // which panel is this law's.
      const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].find((el) =>
        el.hasAttribute("data-open"),
      )!;
      expect(popup, "this law's own panel never opened").toBeTruthy();
      // LANDED FIRST, and this is not tidiness: the pose carries its own `transition: none`
      // (surfaces.css, the seed block), so a panel dismissed while it is still flying reports
      // no exit clock for a reason that has nothing to do with the rule under test. Passing
      // alone and failing in the file was the signature — the entry had landed by the time the
      // gesture arrived on a quiet machine and had not on a busy one.
      await until(() => !popup.hasAttribute("data-unfurling"));
      expect(popup.hasAttribute("data-seed"), "the panel is still posed, so its clocks are the pose's").toBe(false);
      // Armed BEFORE the gesture and anchored on the stamp: an exit is ~220ms of wall clock and
      // a law that looks afterwards finds an unmounted node.
      const onExit = new Promise<{ clocks: number[]; why: string }>((resolve, reject) => {
        const timer = setTimeout(() => {
          observer.disconnect();
          reject(new Error("the panel never took an ending stamp"));
        }, 2000);
        const observer = new MutationObserver(() => {
          if (!popup.hasAttribute("data-ending-style")) return;
          clearTimeout(timer);
          observer.disconnect();
          const cs = getComputedStyle(popup);
          resolve({
            clocks: cs.transitionDuration.split(",").map((d) => parseFloat(d)),
            why: `channels=${cs.transitionProperty}`,
          });
        });
        observer.observe(popup, { attributes: true, attributeFilter: ["data-ending-style"] });
      });
      await dismiss(trigger);
      const exit = await onExit;
      return { ...exit, instant: popup.getAttribute("data-instant") };
    };

    const keyboard = await clocksOnDismissal(async () => {
      await userEvent.keyboard("{Escape}");
    });
    const pointer = await clocksOnDismissal(async () => {
      await userEvent.click(document.body);
    });

    // THE PREMISE: the keyboard route really does take the stamp this rule keys on. Without it
    // the law passes on a build where Base UI stopped stamping at all, which is agreement by
    // absence rather than by physics.
    expect(keyboard.instant, "Escape no longer carries the stamp this law is about").toBe("dismiss");
    expect(pointer.instant, "an outside press must NOT be stamped, or there is no control").toBeNull();

    const longest = (clocks: number[]) => Math.max(...clocks);
    expect(longest(pointer.clocks), "the control has no exit clock to compare against").toBeGreaterThan(0);
    expect(
      longest(keyboard.clocks),
      `Escape dissolves over ${longest(keyboard.clocks)}s against the pointer's ${longest(pointer.clocks)}s\n  keyboard: ${keyboard.why}\n  pointer:  ${pointer.why}`,
    ).toBeCloseTo(longest(pointer.clocks), 3);
  });

  it("a CONTROLLED menu still flies on the open after an Escape (§22)", async () => {
    /**
     * Base UI recomputes `instantType` only inside its own `setOpen`. A controlled `<Menu open>`
     * driven from app state never calls it, so the `dismiss` written by the previous Escape was
     * still in the store — and still stamped on the popup — at the next mount. Both halves of
     * the old exemption read it as instant: the runner returned before posing, and the
     * stylesheet zeroed every clock. Measured before the fix: state-open fresh flew at w=67,
     * state-open after one Escape did not fly and sat at 112, and a real trigger press flew
     * again. A command palette or a row-actions menu driven from a store lost its animation
     * after the first Escape and looked like it had randomly stopped working.
     *
     * A stamp that means "this CLOSE was not a reveal" says nothing about an open, which is
     * why the fix is one exemption rather than a clearing pass — and why this law drives the
     * SECOND open, not the first.
     */
    inMotion();
    const { userEvent } = await import("vitest/browser");
    let setOpen!: (v: boolean) => void;
    function Controlled() {
      const [open, set] = React.useState(false);
      setOpen = set;
      return (
        <Theme>
          <div style={{ padding: 120 }}>
            <Menu open={open} onOpenChange={set}>
              <MenuTrigger render={<Button>Open</Button>} />
              <MenuContent>
                <MenuItem>Alpha</MenuItem>
                <MenuItem>Beta</MenuItem>
              </MenuContent>
            </Menu>
          </div>
        </Theme>
      );
    }
    mount(<Controlled />);

    // Armed before each open: the pose is stamped in the commit and lasts about two frames, so
    // anything that finds the popup first is already looking after the fact.
    const flew = () =>
      new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => {
          observer.disconnect();
          resolve(false);
        }, 1500);
        const observer = new MutationObserver(() => {
          const posed = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].find((el) =>
            el.hasAttribute("data-seed"),
          );
          if (!posed) return;
          clearTimeout(timer);
          observer.disconnect();
          resolve(true);
        });
        observer.observe(document.body, {
          subtree: true,
          attributes: true,
          attributeFilter: ["data-seed"],
        });
      });

    const first = flew();
    flushSync(() => setOpen(true));
    // THE CALIBRATION: the first state-driven open must fly, or this law is measuring a menu
    // that never animates from state at all and the second read below proves nothing.
    expect(await first, "a controlled menu did not fly on its FIRST open").toBe(true);

    await userEvent.keyboard("{Escape}");
    await until(() => document.querySelectorAll(".kui-menu-popup").length === 0);

    const second = flew();
    flushSync(() => setOpen(true));
    expect(await second, "the stale dismiss stamp ate the entry on the open after an Escape").toBe(
      true,
    );
  });

  it("the panel's floor does not step at release (§22)", async () => {
    /**
     * 2026-08-17 and again 2026-08-22, Kushagra: *"it jumps a bit in width at the end."*
     *
     * The floor is `max(--floating-min-w, --anchor-width)`; `--anchor-width` does not exist
     * until Base UI has placed the panel, so the entry publishes `--kui-anchor-w` and the floor
     * consults that first. The two used to hand over at release and they disagreed — not by
     * arithmetic but by TIME. An open trigger holds its press, the press is a SPRING, and at
     * the instant the entry measures there is no press yet: measured on a 400px button, the
     * entry publishes 400 while floating-ui walks `--anchor-width` 400 → 388 → 390 over the
     * following ~350ms. The release handed the floor to a number still in motion and the box
     * snapped 400 → 390, one frame, about 300ms after it had visibly stopped — which reads as a
     * glitch rather than as the tail of an entry.
     *
     * THIS FILE, and not select's, because the press is what makes the disagreement exist: a
     * select's trigger is field-shaped and a field's box does not travel (§8, 2026-08-10), so
     * its anchor never scales and the same law there measures a handover with nothing to get
     * wrong. Select keeps the mechanism half (the floor survives release); the OUTCOME is here.
     *
     * WHAT THIS LAW DOES NOT PROVE, renamed to match on 2026-08-23: that the published floor is
     * the trigger's LAYOUT width. Its old title said so and none of its assertions did, and the
     * measurement cannot be added here — a menu is posed on the mount frame, before the
     * open-press spring has moved anything, so the rect and the layout box are the same number
     * and a missing scale division is invisible. It was added here first, passed under
     * sabotage, and lives in select's file now, on a `defaultOpen` panel — the one path that
     * waits long enough for the two to disagree.
     */
    inMotion();
    const host = mount(
      <Theme>
        <div style={{ padding: 100 }}>
          <Menu>
            {/* WIDE on purpose: narrower than `--floating-min-w` and `max(floor, anchor)`
                discards both numbers under test, which is how select's own twin came to compare
                112.000 with 112.000 and pass with the mechanism deleted. */}
            <MenuTrigger render={<Button style={{ width: 400 }}>A deliberately wide trigger</Button>} />
            <MenuContent>
              <MenuItem>Short</MenuItem>
              <MenuItem>Also short</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Theme>,
    );
    const trigger = host.querySelector<HTMLElement>(".kui-button")!;
    const triggerWidth = trigger.getBoundingClientRect().width;

    // Armed BEFORE the gesture and anchored on the EDGE the step lived at — the frame the
    // flight stamp leaves — because driving real input takes several frames and a law that
    // looks afterwards finds the entry already over.
    const seam = new Promise<{ flying: number; settled: number }>((resolve, reject) => {
      const timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error("the entry never ran, so there was no seam to read"));
      }, 3000);
      let flying = 0;
      const observer = new MutationObserver(() => {
        // The OPEN one — see the note in the keyboard-dismissal law above.
        const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].find((el) =>
          el.hasAttribute("data-open"),
        );
        if (!popup) return;
        if (popup.hasAttribute("data-unfurling")) {
          flying = popup.getBoundingClientRect().width;
          return;
        }
        if (!flying) return;
        clearTimeout(timer);
        observer.disconnect();
        // One frame PAST the edge: `min-width` is not a transitioned channel, so the handover
        // lands as a style change in the same frame the stamp leaves and the box has not been
        // laid out with it yet — read on the edge itself, a real step measures as none.
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            resolve({ flying, settled: popup.getBoundingClientRect().width }),
          ),
        );
      });
      observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ["data-unfurling"],
      });
    });

    await press(trigger);
    const { flying, settled } = await seam;

    // THE CALIBRATIONS, first: without them the assertion is satisfied by a panel whose floor
    // never mattered, and by a trigger that never pressed.
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].find((el) =>
      el.hasAttribute("data-open"),
    )!;
    // Resolved THROUGH A BOX, never parsed off the property: `--floating-min-w` is
    // `calc(112px * var(--scale))`, so reading it as a custom property answers the unresolved
    // string and `parseFloat` answers NaN — the runner's own scar, where a guard that did
    // exactly this was dead from the day it was written.
    const ruler = document.createElement("div");
    ruler.style.inlineSize = "var(--floating-min-w)";
    popup.append(ruler);
    const floor = ruler.getBoundingClientRect().width;
    ruler.remove();
    expect(floor, "the family's own floor never resolved").toBeGreaterThan(0);
    expect(
      triggerWidth,
      "the trigger must be wider than --floating-min-w, or the anchor floor is not in play",
    ).toBeGreaterThan(floor);
    expect(
      parseFloat(getComputedStyle(trigger).scale) || 1,
      "the trigger must be HOLDING its press, or there is no disagreement to catch",
    ).toBeLessThan(1);


    // One pixel, not half: the defect is a ~2.5% step (10px on this trigger) and sub-pixel
    // layout noise between two frames is not it. `toBeCloseTo(…, 0)` is a 0.5 bound and failed
    // on a 0.5 difference in a full-file run — a tolerance tuned so finely that it reported the
    // machine rather than the mechanism.
    expect(
      Math.abs(settled - flying),
      `the panel stepped ${flying} → ${settled} at release`,
    ).toBeLessThan(1);
  });

  it("a GLASS panel builds its lens once, not once a frame (§8, §10, 2026-08-22)", async () => {
    /**
     * `system/refraction.tsx` opens by stating that the lens is built "on mount and resize,
     * never on hover, press, focus or scroll — the seam the floating layer already uses". That
     * sentence is true about hover and press, and silent about the one gesture that resizes a
     * pane continuously: the entry animates `inline-size` and `block-size` on the exact element
     * the lens is attached to. So every frame was a distinct cache key, and every miss ran a
     * per-pixel Snell solve over up to 320x320, a `toDataURL` PNG encode of ~100k pixels, an
     * eleven-node `<filter>` grafted in and the previous one torn down — synchronously, after
     * layout and before paint. Measured on one glass menu open: 27 distinct filters installed
     * on a single panel; two after the fix. It could not look right while doing it either, since
     * each map is generated for frame N's box and applied on frame N+1's.
     *
     * Counted as DISTINCT INSTALLED VALUES rather than as elapsed time or dropped frames: the
     * cost is one generation per value, and a count is the same number on a fast machine and a
     * starved one, which is what keeps this law off the frame-watching list.
     */
    inMotion();
    const host = mount(
      <Theme material="thin">
        <Box backdrop style={{ padding: 100 }}>
          <Menu>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Duplicate this thing</MenuItem>
              <MenuItem>Rename it</MenuItem>
              <MenuItem>Move somewhere else</MenuItem>
            </MenuContent>
          </Menu>
        </Box>
      </Theme>,
    );

    await press(host.querySelector<HTMLElement>(".kui-button")!);
    await until(() => !!document.querySelector(".kui-menu-popup"));
    const popup = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    const seen = new Set<string>();
    let sampling = true;
    const tick = () => {
      const value = popup.style.getPropertyValue("--kui-lens");
      if (value) seen.add(value);
      if (sampling) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    await until(() => !popup.hasAttribute("data-unfurling"));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    sampling = false;

    // THE PREMISE: this panel really is lensed. Without it the law passes on any build where
    // glass stopped reaching a popup at all, which is agreement by absence.
    expect(popup.getAttribute("data-material"), "the panel is not glass, so it has no lens").toBe("thin");
    expect(seen.size, "no lens was ever installed — this fixture cannot show the defect").toBeGreaterThan(0);
    // A settled panel is allowed to differ from its seed; a panel that rebuilds per frame is
    // not. The bound is generous on purpose — what it forbids is the per-frame class.
    expect(
      seen.size,
      `the lens was rebuilt ${seen.size} times during one entry: ${[...seen].join(" ")}`,
    ).toBeLessThanOrEqual(4);
  });

  it("a MIRRORED submenu grows out of the seam too (§22, 2026-08-22)", async () => {
    /**
     * The 2026-08-17 BESIDE change made a side-opening panel start on the edge it shares with
     * the panel it came out of. It fixed the un-mirrored placement and left the mirrored one
     * live, because the flight's pin block did not contain `[data-side="inline-start"]` at all
     * — Base UI's `getLogicalSide` returns the logical pair whenever the side is logical and a
     * submenu defaults to `inline-end`, so a menu in the RIGHT half of the window flips to
     * `inline-start`, a spelling only the transform-origin block carried. The same block also
     * read `[data-align="end"]` bare, which is the inline axis on a bottom or top panel and the
     * BLOCK axis on a side one, so it moved an axis the alignment says nothing about.
     *
     * Measured on this fixture before the fix: seed `l=917 r=973` against a parent whose left
     * edge — the seam — is at 1029. The panel started 112px clear of the seam and grew
     * TOWARDS it, which is the unfurl running backwards. After: seed `l=973 r=1029`, its right
     * edge exactly on the seam, growing away from it.
     *
     * The existing law two below cannot see this: its fixture mounts `<Menu defaultOpen>` with
     * no wrapper, so the trigger sits at the host's top-left and the submenu can resolve ONLY
     * `inline-end` + `start` — the one cell that was already right — and its geometric claim is
     * measured against the ROW rather than the seam, which evaluates true in the broken cells
     * as well. This one pins the trigger to the right of the window so the placement has to
     * mirror, and asserts against the seam.
     */
    inMotion();
    const { userEvent } = await import("vitest/browser");
    const host = mount(
      <Theme>
        {/* Pinned RIGHT, which is the whole fixture: a submenu only mirrors when there is no
            room for it on the trailing side. */}
        <div style={{ position: "fixed", right: 20, top: 40 }}>
          <Menu>
            <MenuTrigger render={<Button>Actions</Button>} />
            <MenuContent>
              <MenuItem>A fairly long first item label</MenuItem>
              <MenuSub>
                <MenuSubTrigger>More options over here</MenuSubTrigger>
                <MenuSubContent>
                  <MenuItem>Sub A</MenuItem>
                  <MenuItem>Sub B</MenuItem>
                </MenuSubContent>
              </MenuSub>
            </MenuContent>
          </Menu>
        </div>
      </Theme>,
    );

    await press(host.querySelector<HTMLElement>(".kui-button")!);
    await until(() => !!document.querySelector(".kui-menu-popup"));
    const parent = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    await until(() => !parent.hasAttribute("data-unfurling"));
    const seam = parent.getBoundingClientRect();

    // Armed BEFORE the hover and anchored on the AIMED SEED — the pose lasts about two frames,
    // so it is observed rather than hunted.
    let seed: DOMRect | null = null;
    const observer = new MutationObserver(() => {
      const posed = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].find(
        (el) => el !== parent && el.hasAttribute("data-seed") && el.hasAttribute("data-aimed"),
      );
      if (posed) seed = posed.getBoundingClientRect();
    });
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-seed", "data-aimed", "style"],
    });

    const rows = [...parent.querySelectorAll<HTMLElement>(".kui-row")];
    const subTrigger = rows.find((r) => r.textContent?.includes("More options"))!;
    await userEvent.hover(subTrigger);
    await until(() => document.querySelectorAll(".kui-menu-popup").length > 1);
    const sub = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].find((el) => el !== parent)!;
    await until(() => !sub.hasAttribute("data-unfurling"));
    observer.disconnect();

    // THE PREMISE: the placement really did mirror. Without this the law passes on the
    // un-mirrored cell, which was never broken — the exact way the existing law reads as
    // coverage it does not have.
    expect(
      sub.parentElement?.getAttribute("data-side"),
      "the fixture did not mirror, so this law is measuring the cell that already worked",
    ).toBe("inline-start");
    expect(seed, "the submenu's pose was never observed").not.toBeNull();

    // The seam is the parent's own leading edge, because the child lands on THAT side of it.
    const posed = seed as unknown as DOMRect;
    expect(
      posed.right,
      `the seed starts ${Math.round(seam.left - posed.right)}px clear of the seam and grows towards it`,
    ).toBeCloseTo(seam.left, 0);
    expect(sub.getBoundingClientRect().right, "and it lands on the seam").toBeCloseTo(seam.left, 0);
  });

  watchesFrames("a panel that lands BESIDE its trigger grows out of the SEAM, not out of the row (§22)", async () => {
    /**
     * The silhouette's one exception, and it is decided by the placement rather than by the
     * component (2026-08-17, Kushagra: *"the way submenu appears is quite aggressive… it ends
     * up traveling a lot, especially if dropdown menu is wide"*).
     *
     * A silhouette is honest where the panel LANDS on the thing it came out of. A submenu
     * lands beside the panel its row sits in, so the row-shaped seed started it somewhere it
     * will never be: measured on this mount before the fix, a 353 x 30 seed at x=10 flying
     * into a 92 x 73 panel at x=376 — 366px of travel while SHRINKING to a quarter of its
     * width, and both numbers are the parent panel's width, which is what makes it worse the
     * wider the menu is.
     *
     * The parent row is deliberately long. A narrow menu would pass this law with the old
     * code, because there the row and the seam are nearly the same place — which is exactly
     * how the wrong rule survived being looked at.
     *
     * And it is opened by HOVER, not by `defaultOpen` on the sub. That was the first spelling
     * and it measured nothing: mounting both panels in one commit places the child against a
     * parent that has not settled, so the aim read a positioner still sitting near the row and
     * the pre-fix travel came out at 5.8px instead of the 366 a real open produces. A law that
     * cannot see the defect it was written for is worse than no law.
     */
    mount(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Duplicate this whole project into a new workspace</MenuItem>
            <MenuSub>
              <MenuSubTrigger>Export as</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>PNG</MenuItem>
                <MenuItem>SVG</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    inMotion();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const settledParent = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    const subTrigger = [...settledParent.querySelectorAll<HTMLElement>("[role='menuitem']")].find((el) =>
      el.textContent?.includes("Export as"),
    )!;
    const { userEvent } = await import("vitest/browser");
    await userEvent.hover(subTrigger);

    /**
     * The LAST seeded frame, not the first — and the difference is a whole order of magnitude.
     * The runner aims twice (a microtask, then a correcting frame, because floating-ui can
     * place the positioner after the measurement lands), so the first aimed frame is read
     * against a positioner still sitting at the document's origin: the pre-fix offset measured
     * 10px there and 366px one frame later. The frame that starts the flight is the one before
     * the pose comes off, so that is the frame this law is about.
     */
    let child: HTMLElement | undefined;
    let seed: DOMRect | undefined;
    let fromX = "";
    let seedW = "";
    for (let i = 0; i < 40; i++) {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      const panels = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].slice(1);
      const posed = panels.find((el) => el.hasAttribute("data-seed") && el.hasAttribute("data-aimed"));
      if (posed) {
        child = posed;
        seed = posed.getBoundingClientRect();
        fromX = posed.style.getPropertyValue("--kui-from-x");
        seedW = posed.style.getPropertyValue("--kui-seed-w");
      } else if (child) break;
    }
    if (!child || !seed) throw new Error("the submenu never reached an aimed seed frame");

    const rowBox = subTrigger.getBoundingClientRect();
    // Calibration: a short row cannot tell the two rules apart, and this law's whole subject
    // is what happens when the parent is wide.
    expect(rowBox.width, "the parent row must be long enough to matter").toBeGreaterThan(200);
    expect(child.parentElement?.getAttribute("data-side"), "and the panel must land beside it").toMatch(
      /^(inline-start|inline-end|left|right)$/,
    );

    // It starts at the panel's own start edge — no travel across the parent at all. Read as
    // the flight's own offset rather than by differencing two boxes, because that is the one
    // number the fix writes.
    expect(fromX, "no lateral travel").toBe("0px");
    expect(Math.abs(seed.left - rowBox.left), "the pre-fix code sat ON the row").toBeGreaterThan(100);

    // And it GROWS. The width photograph is gone — the seed falls back to the family's
    // designed diameter — while the row's height and corner stay, because that edge is real.
    expect(seedW, "no width photograph").toBe("");
    expect(seed.width, "the seed is the family's designed one").toBeCloseTo(
      parseFloat(tokenOn(child, "--floating-seed")),
      0,
    );
    expect(seed.width, "a fraction of the row it came from").toBeLessThan(rowBox.width / 2);
    expect(Math.abs(seed.height - rowBox.height), "at the row's own height").toBeLessThan(3);

    // The direction of the unfurl, which is the whole complaint: the box must be smaller than
    // what it becomes, in both axes.
    const flyW = parseFloat(child.style.getPropertyValue("--kui-fly-w"));
    const flyH = parseFloat(child.style.getPropertyValue("--kui-fly-h"));
    expect(seed.width, `it must open into ${flyW}px, not shrink to it`).toBeLessThan(flyW);
    expect(seed.height, `and into ${flyH}px`).toBeLessThan(flyH);
  });

  it("the box it grows into is measured, and it is the panel's own", async () => {
    // The cell is chosen, not default: a panel whose natural width lands on a whole pixel
    // cannot test a claim about fractions, and the default one lands exactly on its 112px
    // floor. This mount is the cell where the rounded read actually broke a row.
    const { popup } = await openUnsettled({ density: "comfortable" }, undefined, "4");
    const measured = parseFloat(popup.style.getPropertyValue("--kui-fly-w"));
    expect(measured).toBeGreaterThan(parseFloat(tokenOn(popup, "--floating-seed")));
    // Calibration: without a fraction to lose, every assertion below is vacuous.
    expect(measured % 1, "this cell must have a fractional width to measure").not.toBe(0);
    still(popup);
    popup.removeAttribute("data-seed");
    // And the FLIGHT attribute, which is what "the panel's own width" means (2026-08-10): while
    // it is set the body is lifted out of flow to pin it against the edge the box grows from,
    // so the panel is sized by the measurement rather than by its content — deliberately, and
    // it collapses to its padding if asked to size itself in that state.
    popup.removeAttribute("data-unfurling");
    popup.style.removeProperty("--kui-fly-w");
    // An integer read (offsetWidth) rounds a 115.33px panel to 115, and that third of a pixel
    // re-broke a row's line in one cell of twenty-four.
    expect(measured).toBeCloseTo(popup.getBoundingClientRect().width, 2);
  });

  it("…and when the panel is capped by the window, the box it grows into is the CAPPED box (§22)", async () => {
    /**
     * 2026-08-23, the floating-motion audit, and Kushagra had reported the symptom twice —
     * once on a select and then *"the jumping problem exists in dropdown menu too"*.
     *
     * The runner measures the panel's natural box in a microtask. That is the right moment for
     * React's layout and the wrong one for floating-ui's, whose `computePosition` resolves from
     * a promise — so until it does, Base UI's SEEDED `--available-width/-height` still read
     * `100vw`/`100vh`. A panel with more content than room therefore measured itself through a
     * cap that was still the whole viewport: `--kui-fly-h: 800px` for a panel that settles at
     * ~393.
     *
     * Nothing looks wrong at the start of that flight, which is why the law above passed
     * through three audits: its panel is two rows and is never capped, so its fixture cannot
     * tell a correct measurement from a viewport-sized one — the degenerate-fixture rule. And
     * the cost is not position but the CLOCK: the box reaches its real ceiling at ~56ms of a
     * 460ms `fall` and then stands still while `inline-size` travels for another third of a
     * second, so it drops open and then unfurls sideways with no spring curve left to see.
     *
     * Read at DEPARTURE rather than at the pose, because that is where the correction lives —
     * it is the last moment before `transitioncancel` is armed as the dismissal signal, after
     * which any write to a flight var releases the flight.
     */
    const many = Array.from({ length: 40 }, (_, i) => <MenuItem key={i}>{`Row ${i}`}</MenuItem>);
    const { popup } = await openUnsettled({}, <>{many}</>);
    await departed(popup);

    const positioner = popup.parentElement!;
    const room = parseFloat(getComputedStyle(positioner).getPropertyValue("--available-height"));
    const flyH = parseFloat(popup.style.getPropertyValue("--kui-fly-h"));

    // Landed by hand, the way every motion law here lands one, because the calibration below
    // has to read the panel's CONTENT — and a flying box is clipped with its body lifted out
    // of flow, so a content measurement taken in the air answers the pose, not the panel.
    popup.removeAttribute("data-unfurling");
    popup.style.removeProperty("--kui-fly-h");
    popup.style.removeProperty("--kui-fly-w");
    popup.style.removeProperty("overflow");

    // THE CALIBRATION, and without it this law is the one above with more rows: a panel that
    // FITS its window is never capped, so its natural box and its viewport-sized box are the
    // same number and the assertion below holds whichever one was measured. What makes this
    // cell able to fail is that the content genuinely does not fit — proven by the scroller,
    // not by the row count, so a change to the row height cannot quietly make it vacuous.
    expect(room, "the room must be readable, or the cap under test cannot exist").toBeGreaterThan(0);
    expect(
      room,
      "the room must differ from the viewport, or a viewport-sized measurement and a correct one are the same number",
    ).toBeLessThan(window.innerHeight);
    expect(
      popup.getBoundingClientRect().height,
      "this cell's panel must SIT AT its cap, or its content fits and there is nothing to clamp",
    ).toBeGreaterThanOrEqual(room - 1);

    expect(
      flyH,
      `the flight aims at ${flyH}px for a panel with ${room}px of room — the box finishes early and the entry loses its curve`,
    ).toBeLessThanOrEqual(room + 1);
  });

  it("a glass panel wears its lens for the WHOLE flight, built from where it is going (§10, §22)", async () => {
    /**
     * 2026-08-23, Kushagra: *"material behind menu jumps after it settles — the refraction
     * takes place after animation finishes, with a jump"*.
     *
     * The lens builds a displacement map from a box and a corner, and a flying panel has
     * neither: its rect is a frame out of date the moment a map is generated from it, and its
     * corner is mid-transition between the seed's and its own. The 2026-08-22 audit's repair
     * for the cost of trying anyway — 27 filters minted during one glass menu open — was to
     * build nothing until the flight ended. That is what a person sees as the jump: measured
     * across a real open, 70 of 90 frames carried no `--kui-lens` at all and the value changed
     * on the landing frame, so the backdrop behind the panel snapped into refraction after the
     * panel had visibly finished arriving.
     *
     * Both are fixed by the same fact rather than by trading one for the other: the runner
     * publishes the box the flight is heading to, so the map can be built once, for the geometry
     * the panel will land wearing, and worn the whole way. The seam then costs a cache hit.
     *
     * Read while the panel is FLYING, which is the whole claim — a law that read the settled
     * panel would pass on the defect, since the settled panel always had its lens.
     */
    const { popup } = await openUnsettled(
      { material: "regular" },
      <Box backdrop>
        <MenuItem>Alpha</MenuItem>
        <MenuItem>Beta</MenuItem>
      </Box>,
    );
    await departed(popup);

    // CALIBRATION, both halves. Without the first this law is about a panel that is not
    // flying; without the second it is about a panel with no glass, where an absent lens is
    // correct and the assertion below would be measuring the material axis instead.
    expect(popup.hasAttribute("data-unfurling"), "the panel is not flying — nothing under test").toBe(true);
    expect(
      computed(popup, "backdrop-filter"),
      "this panel must be GLASS, or having no lens is the right answer",
    ).toMatch(/blur\([\d.]+px\)/);

    const reference = popup.style.getPropertyValue("--kui-lens");
    expect(reference, "a flying glass panel has no lens — the refraction arrives after it lands").not.toBe("");
    const filter = document.querySelector(reference.match(/#([\w-]+)/)?.[1] ? `#${reference.match(/#([\w-]+)/)![1]}` : "#none");
    expect(filter, "the lens reference resolves to no filter").toBeTruthy();

    // …AND IT IS THE PANEL'S OWN BOX, not the silhouette it is flying out of. This is the half
    // that makes the seam a cache hit rather than a second filter: a map built from the seed
    // would be replaced on landing, which is the jump wearing a different spelling.
    const seed = parseFloat(popup.style.getPropertyValue("--kui-seed-h"));
    const target = parseFloat(popup.style.getPropertyValue("--kui-fly-h"));
    expect(seed, "the fixture's seed and target must DIFFER, or this cannot tell them apart").toBeLessThan(target - 20);
    const image = filter!.querySelector("feImage")!;
    const href = image.getAttribute("href") ?? "";
    // The map's own pixel height, read out of the PNG it was encoded into: the one place the
    // box it was generated for survives once the filter is size-independent.
    const decoded = await new Promise<number>((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(probe.naturalHeight);
      probe.onerror = () => resolve(-1);
      probe.src = href;
    });
    expect(decoded, `the map is ${decoded}px tall for a panel landing at ${target}px`).toBeCloseTo(target, -1);
  });

  for (const dir of ["ltr", "rtl"] as const) {
    for (const side of ["left", "right"] as const) {
      it(`a ${side}-side menu in an ${dir} document seeds on the edge NEAREST its trigger (§22)`, async () => {
        /**
         * 2026-08-23, the floating-motion audit.
         *
         * Every pin rule states the trigger-adjacent edge with a LOGICAL property, which is
         * right, and selects on a MIX of logical and physical side names, which is not.
         * `inline-start`/`inline-end` are direction-relative by definition, so pairing them
         * with `inset-inline-*` holds in both directions by construction. `left`/`right` are
         * not: `[data-side="left"]` means "physically left of the trigger, so pin the panel's
         * physical RIGHT edge", and under RTL `inset-inline-end` resolves to physical LEFT.
         *
         * Measured before the fix, RTL with `side="left"`: the positioner lands correctly at
         * 896-1037 and the seed painted at 896-952 — 85px from a trigger at 1041, growing back
         * toward the button that opened it. `side="right"` was the mirror. That is the unfurl
         * running backwards, which the 2026-08-22 audit removed for `inline-start` and left
         * live here, and `MenuContentProps.side` is physical-only so every explicitly sided
         * menu in an RTL app took this path.
         *
         * Written as a walk over both directions BECAUSE the LTR cells passed throughout: a law
         * that mounted only LTR is the reason this shipped, and a law that mounted only RTL
         * could be satisfied by breaking LTR.
         */
        mount(
          <Theme>
            <div dir={dir} style={{ padding: "200px" }}>
              <Menu defaultOpen>
                <MenuTrigger render={<Button>T</Button>} />
                <MenuContent side={side}>
                  <MenuItem>Alpha item here</MenuItem>
                  <MenuItem>Beta item here</MenuItem>
                </MenuContent>
              </Menu>
            </div>
          </Theme>,
        );
        inMotion();
        // Two frames, not one microtask: `data-side` is floating-ui's and resolves from a
        // promise, and a seed read before the placement lands is a box at the document origin —
        // which this law's own first run reported as a 238px gap and would have read as the
        // defect it is looking for.
        await flushFlight();
        for (let i = 0; i < 2; i++) await new Promise((r) => requestAnimationFrame(() => r(null)));
        const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
        const popup = popups[popups.length - 1]!;
        expect(
          popup.parentElement!.getAttribute("data-side"),
          "the placement never resolved — every measurement below is of an unplaced box",
        ).toBe(side);
        const seed = popup.getBoundingClientRect();
        const room = popup.parentElement!.getBoundingClientRect();

        // CALIBRATION: the seed must be NARROWER than the room it sits in, or both edges are
        // the same edge and the law cannot tell a correct pin from an inverted one.
        expect(
          seed.width,
          "the seed must be narrower than the positioner, or there is no near and far edge",
        ).toBeLessThan(room.width - 20);

        /**
         * The seed shares the panel's TRIGGER-ADJACENT EDGE, and it must be read against the
         * positioner rather than against the trigger.
         *
         * The first spelling of this law compared the seed's two edges to the trigger and
         * passed with the fix removed — a box sitting entirely to the left of a trigger always
         * has its right edge nearer, whichever edge it is pinned to, so the metric could not
         * tell a correct pin from an inverted one. The degenerate-fixture rule in the
         * measurement rather than in the mount, caught by this law's own sabotage pass.
         *
         * What actually moves is which edge the seed shares with the box it grows into: pinned
         * correctly the near edges coincide and the panel unfurls away from the trigger;
         * inverted, the seed sits a panel-width away and grows back onto the button that opened
         * it (measured before the fix: 85px, on a 141px panel).
         */
        const nearIsRight = side === "left";
        const held = nearIsRight
          ? Math.abs(room.right - seed.right)
          : Math.abs(room.left - seed.left);
        const loose = nearIsRight
          ? Math.abs(room.left - seed.left)
          : Math.abs(room.right - seed.right);
        expect(
          held,
          `the seed is ${Math.round(held)}px off the edge it should share with its panel (and ${Math.round(loose)}px off the far one) — it is pinned to the wrong edge and unfurls backwards onto its trigger`,
        ).toBeLessThan(1);
      });
    }
  }

  for (const dir of ["ltr", "rtl"] as const) {
    for (const align of ["start", "end", "center"] as const) {
      it(`the flying body pivots on the edge it is PINNED to — ${dir}, align ${align} (§22)`, async () => {
        /**
         * 2026-08-23, the floating-motion audit.
         *
         * The body is held against the edge the box is not growing from, and its squish has to
         * collapse toward that same edge: an origin that disagrees with the pin shrinks the
         * content away from its anchor and slides it back on as the box grows. That was already
         * known — the `[data-side="top"]` arm was written for it in 2026-08-17, with 5px
         * measured — and it was answered one cell at a time. The body's origin was `top left`
         * plus one blanket `[dir="rtl"]` arm and one `[data-side="top"]` pair, so `align` never
         * reached it at all.
         *
         * Measured on an ordinary LTR `align="end"` menu — the "…" button near a right edge,
         * which is most of them — the body is pinned `inset-inline-end` and pivoted on its LEFT
         * edge: the gap from the panel's right edge ran 15.10 → 4.19 → 5.00 across the flight,
         * ~2.6px of it at opacity ≥ 0.29. The RTL blanket arm had the mirror of it, forcing
         * `top right` on an RTL `align="end"` panel pinned physically left.
         *
         * The repair is a deletion: the panel's own `--kui-origin-x/-y` table answers this
         * question for every cell and the properties are unregistered, so the body inherits it.
         * This law is what says the two tables agree — it reads the PIN and the ORIGIN off one
         * mounted body and requires them to name the same edge, so neither can be extended
         * without the other.
         */
        mount(
          <Theme>
            <div dir={dir} style={{ padding: "150px" }}>
              <Menu defaultOpen>
                <MenuTrigger render={<Button>T</Button>} />
                <MenuContent align={align}>
                  <MenuItem>Alpha here</MenuItem>
                  <MenuItem>Beta here</MenuItem>
                </MenuContent>
              </Menu>
            </div>
          </Theme>,
        );
        inMotion();
        for (let i = 0; i < 3; i++) await new Promise((r) => requestAnimationFrame(() => r(null)));
        const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
        const popup = popups[popups.length - 1]!;
        const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;
        expect(popup.hasAttribute("data-unfurling"), "the body is not flying — the pin is not on").toBe(true);

        const cs = getComputedStyle(body);
        const start = parseFloat(cs.insetInlineStart);
        const end = parseFloat(cs.insetInlineEnd);
        const originX = parseFloat(cs.transformOrigin);
        const width = body.getBoundingClientRect().width;

        // WHICH EDGE THE PIN NAMES, read rather than assumed: the loose side resolves to a large
        // negative number (the slack in a box wider than the body), the held side to the panel's
        // own padding.
        //
        // CENTRE IS READ AS AN OUTCOME since 2026-08-29, and the old spelling is why. It asked
        // whether the two insets agreed, which was true of `inset-inline: pad` + `margin: auto`
        // — and that spelling could not actually centre anything: the body is held at its landed
        // width while the pane grows into it, so the equation was over-constrained and the
        // cascade dropped the end inset. The insets AGREED as declared and the body sat against
        // its start edge. A centred body is now held by its own middle, so the question is asked
        // of the box: does the body's layout centre sit on the pane's padding-box centre?
        const middle =
          start + parseFloat(cs.marginInlineStart) + body.offsetWidth / 2 - popup.clientWidth / 2;
        const held = Math.abs(middle) < 1 ? "center" : start < end ? "end" : "start";
        // CALIBRATION: a body as wide as its panel is pinned on both sides at once and this law
        // is about nothing.
        if (held !== "center") {
          expect(
            Math.abs(start - end),
            "the body must be NARROWER than its panel, or both edges are the same edge",
          ).toBeGreaterThan(20);
        }

        // …and which edge the ORIGIN names, in the physical terms transform-origin is stated in.
        const pivot = originX < 1 ? "left" : originX > width - 1 ? "right" : "middle";
        const rtl = dir === "rtl";
        const wanted =
          held === "center" ? "middle" : held === "start" ? (rtl ? "right" : "left") : rtl ? "left" : "right";
        expect(
          pivot,
          `the body is pinned at its inline-${held} edge and pivots on its ${pivot} one — the content slides sideways onto the edge it is held against`,
        ).toBe(wanted);
      });
    }
  }

  it("an unaimed seed paints nothing (§22)", async () => {
    /**
     * 2026-08-23, the floating-motion audit: the aim gate had no law at all.
     *
     * `[data-seed]:not([data-aimed])` is what keeps a posed panel invisible until floating-ui
     * has placed the positioner. The recorded measurement for its absence is one frame at
     * x=2275 — a silhouette painted wherever the last layout left it — and on a Select, whose
     * entry waits for the placement to settle, it is up to twelve frames of the fully grown
     * panel before it collapses to its trigger's silhouette and unfurls back out.
     *
     * The three places that mention `data-aimed` all use it to SELECT a frame to measure, so by
     * construction they read a panel that is already aimed and whose opacity is 1 either way.
     * Flipping the rule to `opacity: 1` or deleting it outright left the whole package green.
     *
     * Read as a computed value off a real panel in both states rather than by racing the aim:
     * what the gate IS is a rule, and the two stamps are ours to write.
     */
    const { popup } = await openUnsettled();
    still(popup);
    popup.setAttribute("data-seed", "");
    popup.removeAttribute("data-aimed");
    expect(
      computed(popup, "opacity"),
      "a seed that has not been placed is painted — it appears wherever the last layout left it",
    ).toBe("0");
    // CALIBRATION, and it is the whole law: without it, `opacity: 0` on every seed frame passes
    // just as well, and that is a panel that never appears at all.
    popup.setAttribute("data-aimed", "");
    expect(computed(popup, "opacity"), "an AIMED seed must paint, or nothing ever opens").not.toBe("0");
  });

  it("a panel dismissed mid-entry stops answering the pointer (§22)", async () => {
    /**
     * 2026-08-23, the floating-motion audit: `pointer-events: none` on `[data-ending-style]`
     * had one law for one of its five selectors, and the one it had was the alert's.
     *
     * A menu dismissed mid-entry keeps the entry's restated channels running, so Base UI's
     * unmount gate waits for all of them: measured on an Escape 20ms in, the popup is invisible
     * by ~140ms and still in the document at 682ms. Without this rule that invisible box goes on
     * answering the hit test — measured with the arm removed, ~510ms of a 110x98 box sitting
     * directly under the trigger and swallowing the click that would reopen it.
     *
     * THE CELL IS THE MID-ENTRY ONE, and the difference matters: dismiss a SETTLED menu with
     * the arm deleted and the panel already computes `none`, because `[data-unfurling]` is what
     * forces `auto` and it is off by then. A law written the obvious way — open, land, Escape,
     * read — passes on the defect. So both stamps are on here, which is exactly the state a
     * mid-flight dismissal produces and the only one where the rules disagree.
     */
    const { popup } = await openUnsettled();
    still(popup);
    // The premise, stated at the read: this is a panel that is BOTH still flying and leaving.
    popup.setAttribute("data-unfurling", "");
    expect(
      computed(popup, "pointer-events"),
      "a flying panel must take the pointer, or the calibration below is measuring nothing",
    ).toBe("auto");
    popup.setAttribute("data-ending-style", "");
    expect(
      computed(popup, "pointer-events"),
      "a panel dismissed mid-entry still answers the hit test while it is invisible",
    ).toBe("none");
  });

  it("nothing the seed moves is missing from the transition list (§8)", async () => {
    // The teleport rule as a law rather than a comment. A property the seed changes but the
    // transition never names does not animate — it SNAPS, which is exactly the defect that
    // shipped in the demo when `top` and `left` fell out of the exit list.
    const { popup } = await openUnsettled();
    const read = () => {
      const cs = getComputedStyle(popup);
      return {
        "inline-size": cs.inlineSize,
        "block-size": cs.blockSize,
        "border-radius": cs.borderTopLeftRadius,
        "margin-inline-start": cs.marginInlineStart,
        "margin-block-start": cs.marginBlockStart,
        translate: cs.translate,
        opacity: cs.opacity,
      };
    };
    const seeded = read();
    // The list is the FLIGHT's, read un-seeded and un-stilled: the seed state pins
    // `transition: none` (a held pose — the aim writes into it without starting
    // cancellable transitions) and still() pins the same with importance, so the one
    // moment the base rule's list is readable is between the two.
    popup.removeAttribute("data-seed");
    const listed = computed(popup, "transition-property").split(",").map((p) => p.trim());
    still(popup);
    const settled = read();

    const moved = (Object.keys(seeded) as (keyof ReturnType<typeof read>)[]).filter(
      (property) => seeded[property] !== settled[property],
    );
    // Calibration: a seed that moved nothing would make every assertion below vacuous.
    expect(moved.length, "the seed must actually move things").toBeGreaterThan(2);
    for (const property of moved) {
      expect(listed, `${property} moves but never transitions`).toContain(property);
    }
  });

  it("the panel falls before it spreads, and the channels are out of phase (§8)", async () => {
    const { popup } = await openUnsettled();
    // Un-seeded first: the seed state pins `transition: none`, and these clocks are the
    // flight's — the base rule's.
    popup.removeAttribute("data-seed");
    const durations = computed(popup, "transition-duration").split(",").map((d) => d.trim());
    const listed = computed(popup, "transition-property").split(",").map((p) => p.trim());
    expect(durations.length).toBeGreaterThan(3);
    expect(new Set(durations).size, "one duration everywhere IS a rigid body").toBeGreaterThan(2);
    const at = (property: string) => parseFloat(durations[listed.indexOf(property)]!);
    // The axis that finishes LAST is the one the eye reads as the direction of travel, so the
    // vertical arrives first: a menu drops out of its trigger and then opens (reversed
    // 2026-08-09 by eye — the first spelling gave height the longest clock, and every menu
    // spread sideways and then dropped).
    expect(at("block-size"), "the panel falls first").toBeLessThan(at("inline-size"));
    expect(at("border-radius")).toBeLessThan(at("inline-size"));
  });

  it("geometry rides the spring; paint does not (§8's two clocks)", async () => {
    const { popup } = await openUnsettled();
    // Un-seeded first: the seed state pins `transition: none`, and these curves are the
    // flight's — the base rule's.
    popup.removeAttribute("data-seed");
    const easings = computed(popup, "transition-timing-function").split(/,(?![^(]*\))/);
    const listed = computed(popup, "transition-property").split(",").map((p) => p.trim());
    // The FLUID spring since 2026-08-15 — the family's own curve, minted when calm's
    // front-loaded travel read rigid on a box this large.
    const spring = curveOn(popup, "--motion-spring-elastic");
    expect(spring.startsWith("linear("), "the spring token is a baked curve").toBe(true);
    for (const [index, property] of listed.entries()) {
      const easing = easings[index]!.trim();
      if (property === "opacity" || property === "box-shadow" || property === "filter") {
        // Paint: colour, light AND focus. The cast fades up as the panel lifts
        // (2026-08-10); the container's blur sharpens as it forms (2026-08-15).
        expect(easing, "a signal eases, it has no mass").not.toContain("linear(");
      } else {
        expect(samples(easing), `${property} must ride the spring`).toEqual(samples(spring));
      }
    }
  });

  it("the exit dissolves: geometry HOLDS and the rows stay lit (§22)", async () => {
    const { popup, body } = await openUnsettled();
    const row = popup.querySelector<HTMLElement>(".kui-menu-item")!;
    still(popup, body, row);
    popup.removeAttribute("data-seed");
    const arrived = popup.getBoundingClientRect().width;

    ending(popup);
    expect(computed(popup, "opacity")).toBe("0");
    // A hair of scale toward the anchor, and nothing else: the entry's path is NOT retraced.
    expect(computed(popup, "scale")).toBe("0.98");
    expect(popup.getBoundingClientRect().width).toBeCloseTo(arrived * 0.98, 1);
    expect(computed(popup, "margin-inline-start"), "the pane does not travel out").toBe("0px");
    expect(computed(popup, "margin-block-start"), "the pane does not travel out").toBe("0px");
    // The body does not re-squish and the rows do not fade separately — the pane leaves whole.
    // `none` is `scale`'s initial value, and it is the honest answer: the exit does not touch
    // the body at all, so there is nothing declared on it to read.
    expect(computed(body, "scale")).toBe("none");
    expect(computed(row, "opacity")).toBe("1");
  });

  it("the exit decelerates, never bounces, and is faster than the entry (§8)", async () => {
    const { popup } = await openUnsettled();
    ending(popup);
    const listed = computed(popup, "transition-property").split(",").map((p) => p.trim());
    const easings = computed(popup, "transition-timing-function").split(/,(?![^(]*\))/);
    const stiff = curveOn(popup, "--motion-spring-stiff");
    expect(samples(easings[listed.indexOf("scale")]!)).toEqual(samples(stiff));
    // Read off the CURVE, not off its name: the stiff spring is the one that never crosses its
    // target, because an exit that overshoots is an object that did not mean to leave.
    const values = samples(stiff).map(Number);
    expect(values.length).toBeGreaterThan(8);
    expect(Math.max(...values), "an exit must not overshoot").toBeLessThanOrEqual(1);
    // And it is quicker than the arrival — an exit that takes as long reads as reluctance.
    // The exit's OWN channels (dissolve and settle), not the list max: the ending list also
    // restates the entry's geometry channels so a mid-flight dismissal keeps unfurling
    // under the fade (2026-08-16) — those are keep-alives, and on a settled exit they
    // start nothing.
    const durations = computed(popup, "transition-duration").split(",").map((d) => parseFloat(d));
    for (const own of ["opacity", "scale"]) {
      expect(durations[listed.indexOf(own)]! * 1000, `${own} is the exit's own clock`).toBeLessThan(
        parseFloat(getComputedStyle(popup).getPropertyValue("--floating-spread")),
      );
    }
  });

  it("a reopen that lands mid-dissolve is CAUGHT, never replayed (§22, 2026-08-20)", async () => {
    /**
     * Kushagra, on a real menu: *"on second quick click it does show wrong animation"* — and
     * it did. A quick close→reopen finds the popup still MOUNTED (Base UI flips it back with
     * no fresh mount and no starting stamp: data-closed off → data-open on → data-ending-style
     * off), and from 2026-08-16 the runner treated that as an open that had lost its entry and
     * replayed the whole flight. The pose is the TRIGGER'S silhouette, so what the replay
     * bought was a teleport: measured three times out of three, a panel dissolving at 355 x 98
     * and 58% opacity became 239 x 32 at full opacity in the very next frame — 116px narrower
     * and 66px shorter — and then unfurled again from there.
     *
     * The claim now is the opposite one, and it is deterministic rather than sampled: the
     * frame BEFORE the reopen against the frame AFTER it. Nothing about that pair depends on
     * how fast the runner is, which is the whole reason it is written this way — every law in
     * this describe that reasoned about a RATE across an animation has been rewritten at least
     * once for reading the machine instead of the mechanism.
     *
     * Falsified against the pre-fix runner (restore the `revoked` branch in floating.tsx):
     * the box jumps 116px and the pose lands, so both halves fail.
     */
    let setOpen!: (v: boolean) => void;
    function Host() {
      const [open, set] = React.useState(false);
      setOpen = set;
      return (
        <Theme>
          <Menu open={open} onOpenChange={set}>
            {/* A label wide enough that the trigger's silhouette and the panel's box differ —
                a replay that seeded from an equally wide trigger would jump by nothing. */}
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Alpha</MenuItem>
              <MenuItem>Beta with a much longer label than the trigger has</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>
      );
    }
    mount(<Host />);
    inMotion();
    flushSync(() => setOpen(true));
    const popup = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    // Awaited for its own sake: `departed` THROWS if the pose never came off, so the premise
    // that there WAS a first flight to interrupt is checked rather than assumed.
    await departed(popup);
    await until(() => !popup.hasAttribute("data-unfurling"));
    expect(popup.hasAttribute("data-unfurling"), "the premise: the first flight landed").toBe(false);
    const settled = popup.getBoundingClientRect();

    // Far enough into the dissolve that the panel is visibly half-gone — the state a replay
    // would throw away. HELD there, not polled for (`catchDissolve`, 2026-08-20): the fade is
    // ~200ms of wall clock, and a runner that stalls past it finds the popup already unmounted
    // and fails this law on its own premise (CI: "the premise: the exit is still running:
    // expected false to be true"). Seizing the exit's own clocks the microtask its stamp lands
    // pins the panel mid-dissolve for exactly as long as the gesture takes.
    const seized = catchDissolve(popup);
    flushSync(() => setOpen(false));
    const { box: dissolving, fading, release } = await seized;
    expect(popup.isConnected, "the premise: the exit is still running").toBe(true);
    expect(fading, "the premise: the panel is visibly mid-dissolve").toBeLessThan(0.9);

    flushSync(() => setOpen(true)); // the quick reopen
    // The borrowed clocks go back with the gesture (the alert twin's CI finding): a paused
    // transition keeps rendering its held value, so a seized exit left paused holds the panel
    // a percent small for good, and every measurement after this point would be of the
    // instrument rather than the mechanism.
    release();
    /**
     * Anchored on the REVOCATION, not on a frame. The replay this law forbids is triggered by
     * the ending stamp leaving, and how long Base UI takes to remove it is a property of the
     * machine — read one rAF after the click instead and the sabotage passes, because on a
     * quick runner the stamp has not left yet and there is nothing to see. Waiting for the
     * announcement puts the read after the very microtask that would have posed the panel.
     */
    await until(() => !popup.hasAttribute("data-ending-style"), 3000);
    expect(popup.isConnected, "the premise: the panel is still the one that was dissolving").toBe(true);
    expect(popup.hasAttribute("data-ending-style"), "the premise: the dismissal was revoked").toBe(false);
    const next = popup.getBoundingClientRect();

    // 1. The box does not teleport. The pre-fix pair is 355 -> 239; the bound is wide enough
    //    that it is not the number doing the work.
    expect(
      Math.abs(next.width - dissolving.width),
      `the reopen must catch the box where it is: ${Math.round(dissolving.width)}px -> ${Math.round(next.width)}px`,
    ).toBeLessThan(20);
    expect(
      Math.abs(next.height - dissolving.height),
      `and in the block axis too: ${Math.round(dissolving.height)}px -> ${Math.round(next.height)}px`,
    ).toBeLessThan(20);

    // 2. And it is caught because no flight was begun at all — the mechanism, not its symptom.
    expect(popup.hasAttribute("data-seed"), "no pose: a panel that never left is not re-born").toBe(false);
    expect(popup.hasAttribute("data-unfurling"), "and no flight arrangement").toBe(false);
    expect(popup.style.getPropertyValue("--kui-fly-w"), "not even the measurement").toBe("");

    // 3. It recovers: the dissolve is taken back and the panel returns to the box it left.
    //    Waited out to REST rather than to opacity alone — the paint clock finishes well
    //    before the scale spring does, and a rect read in between is 2.8px short of the box
    //    through no fault of the mechanism.
    await until(() => parseFloat(computed(popup, "opacity")) === 1, 3000);
    expect(computed(popup, "opacity"), "the dismissal is revoked, not merely halted").toBe("1");
    // ARRIVAL, not stillness (2026-08-20, the alert twin's CI failures — 3.17 and 3.11 against
    // a 2px bound, each of them 1% of its panel): a box that is STUCK is perfectly still, so
    // stillness cannot say it got where it was going. The destination is what the wait names,
    // and a recovery that never arrives expires the deadline into the same assertion.
    await until(() => Math.abs(popup.getBoundingClientRect().width - settled.width) < 2, 3000);
    expect(
      Math.abs(popup.getBoundingClientRect().width - settled.width),
      "and it comes back to the box it was already occupying",
    ).toBeLessThan(2);
  });

  it("the catch keeps the box's flight, not the list's browsing (§22, 2026-08-25)", async () => {
    /**
     * Kushagra, on a constrained menu: it reopened "scrolled" — the top rows clipped above
     * the panel's own edge, and only ever on the quick second press. A caught reopen keeps
     * the panel because physics does not teleport (the law above), but the viewport's
     * scroll offset is not physics — it is what the person had browsed to before
     * dismissing. A slow second press gets a fresh mount and the list at its top; a quick
     * one got the stale offset, so TIMING decided what the same gesture showed. Measured
     * live: dismiss a scrolled menu, reopen mid-dissolve, `scrollTop` 196 on arrival —
     * the group label and three rows hidden above the clip — against 0 a beat slower.
     *
     * The runner resets the popup's OWN system viewport when the ending stamp is revoked
     * — that edge, never the arrival, because mid-dissolve the body is posed and a scaled
     * body contributes its SCALED size to the scrollable overflow, so a reset written into
     * that geometry is taken back when the content grows out of it (measured: 0 at the
     * arrival, 132 again by the next frame).
     *
     * The fixture must genuinely scroll — a list that fits makes every spelling pass (the
     * degenerate-fixture rule), which is why the premise is asserted, not assumed.
     * Falsified: delete the `revoked` reset in floating.tsx and the claim reads the full
     * stale offset back.
     */
    let setOpen!: (v: boolean) => void;
    function Host() {
      const [open, set] = React.useState(false);
      setOpen = set;
      return (
        <Theme>
          <Menu open={open} onOpenChange={set}>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              {Array.from({ length: 40 }, (_, i) => (
                <MenuItem key={i}>Row {i + 1}</MenuItem>
              ))}
            </MenuContent>
          </Menu>
        </Theme>
      );
    }
    mount(<Host />);
    inMotion();
    flushSync(() => setOpen(true));
    const popup = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    await departed(popup);
    await until(() => !popup.hasAttribute("data-unfurling"));

    // The popup's own anatomy — the same direct-child chain the runner is scoped to.
    const viewport = popup.querySelector<HTMLElement>(
      ":scope > .kui-scroll-area > .kui-scroll-viewport",
    )!;
    expect(viewport, "the premise: the menu scrolls through its system viewport").not.toBeNull();
    const max = viewport.scrollHeight - viewport.clientHeight;
    expect(max, "the premise: the list overflows — a fitting list proves nothing").toBeGreaterThan(60);
    viewport.scrollTop = max;
    expect(viewport.scrollTop, "the premise: the browsing scroll took").toBeGreaterThan(60);

    const seized = catchDissolve(popup);
    flushSync(() => setOpen(false));
    const { fading, release } = await seized;
    expect(popup.isConnected, "the premise: the exit is still running").toBe(true);
    expect(fading, "the premise: the panel is visibly mid-dissolve").toBeLessThan(0.9);

    flushSync(() => setOpen(true)); // the quick reopen
    release();
    // Anchored on the revocation, the same announcement the law above waits for — it is
    // also the very edge the reset itself rides, so the read lands after the write.
    await until(() => !popup.hasAttribute("data-ending-style"), 3000);
    expect(popup.isConnected, "the premise: the panel is the one that was dissolving").toBe(true);

    // The claim: the caught reopen presents the same menu a fresh mount would.
    expect(
      viewport.scrollTop,
      `a reopened menu rests at its top, not at the last browse (${Math.round(max)}px available)`,
    ).toBe(0);

    // And the reset did not cost the catch: the panel still recovers to rest.
    await until(() => parseFloat(computed(popup, "opacity")) === 1, 3000);
    expect(computed(popup, "opacity"), "the dismissal is still revoked whole").toBe("1");
  });

  it("suppression is total: under reduced motion nothing is posed and no clock survives (§8)", async () => {
    /**
     * The floating family had NO mounted reduced-motion law until 2026-08-16 — only a string
     * scan of the guarded region for the words it expected to find, which never asked which
     * selector carried them or whether it won. That is the shape §8's own suppression bug took
     * in 2026-08-10: `:not()` takes the specificity of its most specific argument, the ring
     * rule outranked its own stand-down, and every user who asked their OS for stillness got
     * the animation anyway while the scan stayed green.
     *
     * Two claims, and the second is the one no stylesheet law can make: the runner does not
     * merely animate nothing, it does not MEASURE either — §8's "suppression is total"
     * includes the work that only serves the animation. Both are falsified against the
     * shipped code: delete the guard's `transition: none` and the first fails; delete the
     * runner's reduced-motion bail and the second does.
     */
    await asksForStillness();
    const { popup, body } = await openUnsettled();

    // 1. No clock anywhere on the panel, its body or its rows.
    const row = popup.querySelector<HTMLElement>(".kui-menu-item")!;
    for (const el of [popup, body, row]) {
      expect(
        computed(el, "transition-duration").split(",").every((d) => parseFloat(d) === 0),
        "no clock survives",
      ).toBe(true);
    }

    // 2. Nothing was posed and nothing was measured — the entry stood down whole.
    expect(popup.hasAttribute("data-seed"), "no pose").toBe(false);
    expect(popup.hasAttribute("data-unfurling"), "no flight arrangement").toBe(false);
    expect(popup.style.getPropertyValue("--kui-fly-w"), "not even the measurement").toBe("");

    // 3. And the guard's own claim about what it does NOT do: the poses are deliberately not
    //    stood down here (surfaces.css says why — an inverse of every pose declaration drifts,
    //    and it had already drifted twice). So there is nothing to assert about a hand-stamped
    //    pose, and asserting one anyway would have been a law about a rule that no longer exists.
  });

  // WATCHES FRAMES: its premise is "dismissed WHILE AIRBORNE" — a window that a stalled
  // runner sleeps through, leaving a landed panel and a premise that fails honestly.
  watchesFrames("a dismissal taken back MID-FLIGHT lands on the flight it interrupted (§22, 2026-08-20)", async () => {
    /**
     * The hardest case the catch has to survive, and it replaces the law that used to live
     * here ("a reopen RETIRES the flight it interrupts").
     *
     * That law drove the same gesture and asserted the opposite outcome: it timed two
     * overlapping flights and checked that the first one's stale clock did not strip the
     * second. There is no second flight any more — a reopen mid-dissolve is CAUGHT rather than
     * replayed (2026-08-20, see the law above) — so its premise is gone. The HAZARD it existed
     * for is not: the interrupted flight's release timer is still pending, still keyed on the
     * very attributes the panel is still wearing, and it is now the ONLY thing coming to land
     * the panel. If catching a reopen left that clock unaccounted for, the panel would sit
     * pinned to a mid-flight box with nothing to release it.
     *
     * So the claim is the outcome rather than the bookkeeping: close a panel while it is still
     * in the air, take the dismissal back, and the panel must finish the flight it was already
     * on — at full opacity, at its natural box, with every flight variable cleared. Timed
     * against nothing: every wait is a state, which is what the three laws in this describe
     * were rewritten for.
     */
    let setOpen!: (v: boolean) => void;
    function Host() {
      const [open, set] = React.useState(false);
      setOpen = set;
      return (
        <Theme>
          <Menu open={open} onOpenChange={set}>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Alpha</MenuItem>
              <MenuItem>Beta with a much longer label than the trigger has</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>
      );
    }
    mount(<Host />);
    inMotion();

    flushSync(() => setOpen(true));
    const popup = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    // THROWS if the pose never came off, so "the flight is in the air" is checked, not assumed.
    await departed(popup);
    expect(popup.hasAttribute("data-unfurling"), "the premise: the first flight is airborne").toBe(true);

    // Dismissed WHILE AIRBORNE — the pins are on, the release timer is pending, and the exit
    // now runs over a box that is still growing.
    flushSync(() => setOpen(false));
    await until(() => popup.hasAttribute("data-ending-style"), 3000);
    expect(popup.hasAttribute("data-unfurling"), "the premise: dismissed mid-flight, not after it").toBe(true);
    expect(popup.isConnected, "the premise: the panel is still mounted").toBe(true);

    // And taken back.
    flushSync(() => setOpen(true));
    await until(() => !popup.hasAttribute("data-ending-style"), 3000);
    expect(popup.isConnected, "the premise: this is the panel that was dissolving").toBe(true);

    // 1. No second flight was begun — the catch, under the one condition where a replay would
    //    have had a live flight to fight with.
    expect(popup.hasAttribute("data-seed"), "no fresh pose").toBe(false);

    // 2. The pending clock is the only one, and it lands: the pins come off and every variable
    //    the flight wrote is cleared. A stale timer that had been retired would leave these on
    //    forever, which is the failure this law inherits.
    await until(() => !popup.hasAttribute("data-unfurling"), 3000);
    expect(
      popup.hasAttribute("data-unfurling"),
      "the interrupted flight's own clock must still land the panel it left airborne",
    ).toBe(false);
    for (const name of ["--kui-fly-w", "--kui-fly-h", "--kui-seed-w", "--kui-seed-h"]) {
      expect(popup.style.getPropertyValue(name), `${name} is cleared at release`).toBe("");
    }

    // 3. And what the user is left looking at is an ordinary open menu.
    await until(() => parseFloat(computed(popup, "opacity")) === 1, 3000);
    expect(computed(popup, "opacity"), "the dismissal was taken back, not merely halted").toBe("1");
    const row = popup.querySelector<HTMLElement>(".kui-menu-item")!;
    expect(
      popup.getBoundingClientRect().width,
      "and the panel is at least as wide as the rows it holds",
    ).toBeGreaterThanOrEqual(row.getBoundingClientRect().width);
  });

  it("the panel's CONTENT does not slide in from the side when it opens end-aligned (§22)", async () => {
    /**
     * Kushagra, on the playground: *"why does a dropdown that opens to the left look and
     * perform so different to the one that opens bottom"*. This is half the answer, and it is
     * a layout fact rather than a motion one.
     *
     * A block child lays out from its container's inline-start, so the body's origin IS the
     * panel's left edge. Start-aligned, that edge stands still and the right edge does the
     * growing — the words sit where they will end up. END-aligned, the growing edge and the
     * content's origin are the same edge, so every row travels the panel's whole width on the
     * way in: measured at 175px against the start-aligned 21px, on a 209px panel.
     */
    render(
      <Theme>
        <div style={{ position: "absolute", top: "40px", right: "8px" }}>
          <Menu>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>Rename something longer</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Theme>,
    );
    inMotion();
    // Seized at the depart edge and stepped by the flight's own clocks (2026-08-20): the rAF
    // sampler ran on the thread that stalls, and its "committed to end-aligned" calibration
    // was a claim about how many frames the host could spare — the upward law's own CI
    // failure, one law down. The alignment is committed before the flight departs (the
    // side-decided law measures exactly that), so every station reads the settled answer.
    const seized = seizeFlight();
    await press(document.querySelector<HTMLElement>(".kui-button")!);
    const { popup, clock, at, land } = await seized;
    const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;

    // RELATIVE to the panel's own end edge since the silhouette (2026-08-15): the whole box
    // now travels from the trigger to its resting place, so the content moves in SCREEN
    // space with it — by design, motion tells the truth about space. What must not happen
    // is the content moving WITHIN the box: end-aligned, the body is pinned to the end
    // edge, and its distance from that edge holding still is exactly "the words sit where
    // they will end up" restated for a box that flies.
    const seen: number[] = [];
    for (let station = 0; station <= 40; station++) {
      at((clock * station) / 40);
      if (popup.getAttribute("data-align") === "end") {
        seen.push(popup.getBoundingClientRect().right - body.getBoundingClientRect().right);
      }
    }
    land();
    expect(seen.length, "the panel never committed to end-aligned").toBeGreaterThan(3);
    const drift = Math.max(...seen) - Math.min(...seen);
    expect(drift, `the content slid ${drift.toFixed(0)}px within the box: ${seen.map((n) => n.toFixed(0)).join(",")}`).toBeLessThan(30);
  });

  /**
   * THE SEAM, AS TWO STATIC STATES — the half that needs no clock at all (2026-08-20).
   *
   * Kushagra: *"the inside of the menu jumps after animation finishes"*. It did, by the
   * panel's own padding, and the cause is that an absolutely positioned box resolves its
   * insets against its containing block's PADDING box — so the body pinned at `inset: 0` sat
   * inside the border and outside the padding for the whole flight, then snapped one padding
   * inward the moment it returned to normal flow.
   *
   * That defect is a DIFFERENCE BETWEEN TWO STATES, not an event in time — the body under the
   * flight's pin against the body in ordinary flow — so it is read as two states on a landed
   * panel with the clocks pinned off, and it runs everywhere, CI included. Its real-time twin
   * below owns only what a static read cannot see: that nothing moves across the actual strip.
   *
   * TWO THINGS THE FIRST DRAFT GOT WRONG, both caught by running it. The pin takes the body
   * OUT OF FLOW, so a panel left to size itself collapsed from 215px to nothing — which is
   * precisely why the flight sizes the panel from its measurement, and why this law has to
   * supply that measurement (`--kui-fly-w/h`) exactly as the runner does. And it drove the
   * alignment by COLLISION, which a landed panel does not reproduce ('start' where the
   * pressed one resolves 'end'): the arms are stamped here instead, which is the same
   * technique as stamping the flight itself and reaches both of them in every mount rather
   * than one per lucky placement.
   */
  it("the flight's pin puts the body where flow puts it — both arms (§22)", () => {
    render(
      <Theme>
        <div style={{ position: "absolute", top: "40px", left: "8px" }}>
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>Rename something longer</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Theme>,
    );
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop();
    if (!popup) throw new Error("the popup never opened");
    const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;

    // The panel in flow, and the box the flight would have measured for it.
    const inFlow = body.getBoundingClientRect();
    const box = popup.getBoundingClientRect();
    expect(box.width, "the panel must have a real box to hold").toBeGreaterThan(40);
    const align = popup.getAttribute("data-align");

    popup.style.setProperty("--kui-fly-w", `${box.width}px`);
    popup.style.setProperty("--kui-fly-h", `${box.height}px`);
    popup.setAttribute("data-unfurling", "");
    try {
      for (const arm of ["start", "end"] as const) {
        popup.setAttribute("data-align", arm);
        const held = popup.getBoundingClientRect();
        // The room must be the same room, or the two body reads are not comparable.
        expect(Math.abs(held.width - box.width), `${arm}: the panel's own box must be held`).toBeLessThan(0.5);
        expect(Math.abs(held.height - box.height), `${arm}: in both axes`).toBeLessThan(0.5);
        const pinned = body.getBoundingClientRect();
        // THE BLOCK AXIS IN BOTH ARMS — pinned identically by both, independent of where the
        // panel sits, and exactly where the padding defect bit (it fails here at 4px, one
        // padding, when the insets are taken from the border box again).
        expect(Math.abs(pinned.top - inFlow.top), `${arm}: the pin moves the body vertically`).toBeLessThan(1);
        // The INLINE axis is claimed for the start arm only, and the restraint is the point.
        // End-aligned, `inset-inline-start: auto` makes the body shrink-to-fit against the end
        // edge by design, and where that edge lands is the POSITIONER's answer — a hand-stamped
        // arm on a panel floating-ui placed as `start` is not that state, and asserting it here
        // would be a law about the reproduction rather than about the system. The end arm's
        // inline behaviour has two homes that can see it honestly: "the panel's CONTENT does
        // not slide in from the side" (clock-seized, on CI) and the real-time twin below.
        if (arm === "start") {
          expect(
            Math.abs(pinned.left - inFlow.left),
            "start: the pinned inline edge is not where flow put it",
          ).toBeLessThan(1);
        }
      }
    } finally {
      popup.removeAttribute("data-unfurling");
      if (align === null) popup.removeAttribute("data-align");
      else popup.setAttribute("data-align", align);
      popup.style.removeProperty("--kui-fly-w");
      popup.style.removeProperty("--kui-fly-h");
    }
  });

  for (const [where, side] of [["start", "left"], ["end", "right"]] as const) {
    /**
     * And the same claim across the REAL release, which is the half no instrument can pin.
     *
     * `before` is a proven-still flying frame — at the natural end of a flight the springs are
     * done and floating-ui has converged, and the release timer strips the attributes a margin
     * later, so stillness is provable (three identical frames; a spring is momentarily still
     * for less than one) while the flight attribute is still on. The strip then changes
     * nothing, which is the claim.
     *
     * It cannot be seized by the clocks (`seizeFlight`): fast-forwarding the springs renders
     * the finished box under an EARLY placement, because the panel's PLACE is floating-ui's —
     * a wall-time loop that is not an Animation — measured as a 1-2px phantom jump the browser
     * never paints. A law whose subject includes a wall-time mechanism must let real time
     * deliver the state it asserts about, which is exactly why it does not run where the clock
     * is not ours: on CI the plateau is a window a stalled runner sleeps through, and it
     * reported 27.816px of ordinary flight travel as a release jump.
     */
    watchesFrames(`nothing jumps on the frame the flight ends — ${where}-aligned (§22)`, async () => {
      render(
        <Theme>
          <div style={{ position: "absolute", top: "40px", [side]: "8px" }}>
            <Menu>
              <MenuTrigger render={<Button>Open</Button>} />
              <MenuContent>
                <MenuItem>Duplicate</MenuItem>
                <MenuItem>Rename something longer</MenuItem>
              </MenuContent>
            </Menu>
          </div>
        </Theme>,
      );
      inMotion();
      await press(document.querySelector<HTMLElement>(".kui-button")!);
      await until(() => document.querySelectorAll(".kui-menu-popup").length > 0);
      const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop();
      if (!popup) throw new Error("the popup never opened");
      const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;

      let last: DOMRect | null = null;
      let still = 0;
      // A one-slot holder rather than a `let`: the assignment happens inside the callback, so
      // TypeScript's flow analysis still believes the variable is its initial `null` at the
      // guard below and types it `never` after it — `error TS2339: Property 'left' does not
      // exist on type 'never'`, which is the compiler being right about what it can see.
      const proven: DOMRect[] = [];
      await until(() => {
        if (!popup.hasAttribute("data-unfurling")) return true; // the flight is over
        const now = body.getBoundingClientRect();
        still =
          last && Math.abs(now.left - last.left) < 0.05 && Math.abs(now.top - last.top) < 0.05
            ? still + 1
            : 0;
        last = now;
        if (still >= 3) proven[0] = now; // the latest proven-still flying frame
        return false;
      }, 4000);
      const before = proven[0];
      if (!before) throw new Error("the flight never held still before the strip");
      // Calibration: a law that never saw the flight would pass trivially.
      expect(popup.getAttribute("data-align")).toBe(where);
      const after = body.getBoundingClientRect();
      expect(Math.abs(after.left - before.left), "it jumped sideways").toBeLessThan(1);
      expect(Math.abs(after.top - before.top), "it jumped vertically").toBeLessThan(1);
    });
  }

  /**
   * THE OTHER AXIS OF THE RELEASE SEAM (§22, 2026-08-25, Kushagra: a constrained menu opening
   * upward, *"after animation completes, it jumps to correct position"*).
   *
   * The seam laws above drive ALIGNMENT on panels small enough to fit — so the side axis was
   * never driven, and it is the side axis that carried the defect: the positioner is pinned at
   * `natural`, `natural` is measured through Base UI's seeded `100vh` before floating-ui's
   * promise resolves, and `fitToRoom` corrected the flight's targets while the PIN kept the
   * unclamped box for the whole flight. Below the trigger the excess extends harmlessly
   * downward; above it the anchored edge is the bottom, so the stale height held the
   * positioner's top exactly the excess too high — measured, the release handed the popup to a
   * positioner at top −191 for a panel that rests at 5, a 196px flash until floating-ui's
   * re-solve landed a frame later. Which is why the defect needs "opens upward" AND "has to
   * scroll" at once: the excess IS natural-minus-room, zero wherever the list fits.
   */
  describe("a constrained top-opening flight is anchored to the truth (§22, 2026-08-25)", () => {
    /** A trigger held near the bottom of any viewport, with a list far taller than the room
        above it: the panel must flip to `top` and must scroll — the two premises the defect
        needs, asserted rather than assumed by every law here. */
    async function openConstrainedUp() {
      render(
        <Theme>
          <div style={{ position: "fixed", bottom: "120px", left: "16px" }}>
            <Menu>
              <MenuTrigger render={<Button>Open</Button>} />
              <MenuContent>
                {Array.from({ length: 40 }, (_, i) => (
                  <MenuItem key={i}>{`Row ${i + 1}`}</MenuItem>
                ))}
              </MenuContent>
            </Menu>
          </div>
        </Theme>,
      );
      inMotion();
      const trigger = document.querySelector<HTMLElement>(".kui-button")!;
      await press(trigger);
      await until(() => document.querySelectorAll(".kui-menu-popup").length > 0);
      const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop();
      if (!popup) throw new Error("the popup never opened");
      return { popup, positioner: popup.parentElement!, trigger };
    }

    it("the pin the flight anchors to is the CLAMPED box, never the 100vh-capped natural (§22, 2026-08-25)", async () => {
      /**
       * The mechanism's own declaration, read mid-flight where it is load-bearing: by the
       * time the flight departs, the positioner's inline height must be the room's answer,
       * not the microtask measurement's. Deterministic — an inline style holds for the whole
       * ~500ms flight. Falsified: delete `fitPin` in floating.tsx and the pin reads the
       * unclamped ~1300px against a room under 700.
       */
      const { popup, positioner } = await openConstrainedUp();
      await departed(popup);
      expect(positioner.getAttribute("data-side"), "the premise: it opened upward").toBe("top");
      const pin = parseFloat(positioner.style.height);
      const room = parseFloat(getComputedStyle(positioner).getPropertyValue("--available-height"));
      expect(Number.isFinite(pin), "the premise: the flight pinned the positioner").toBe(true);
      expect(Number.isFinite(room), "the premise: the room is a real length by departure").toBe(true);
      // Calibration: the list genuinely does not fit — a fitting list makes every spelling
      // pass (the degenerate-fixture rule). scrollHeight is a layout value, so the flight's
      // squish transform cannot hide it.
      const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;
      expect(
        body.scrollHeight,
        "the premise: the content is far taller than the room",
      ).toBeGreaterThan(pin + 100);
      expect(pin, `the pin (${Math.round(pin)}) must be the clamped room (${Math.round(room)})`).toBeLessThanOrEqual(room + 1);
      // And the correction's own observable, which is what the departure gate reads.
      expect(positioner.style.getPropertyValue("--kui-pin-fit"), "the marker the gate keys on").toBeTruthy();
    });

    it("the box does not move on the frame the flight releases — read in the strip's own microtask (§22, 2026-08-25)", async () => {
      /**
       * Edge-anchored, never polled (the 2026-08-20 rule: a premise that is a window is
       * seized or edge-anchored). The flash lives between the release's synchronous strip and
       * floating-ui's next re-solve — one frame — and a polling read sleeps through it on
       * exactly the runner that matters. A MutationObserver fires in the strip's own
       * microtask, before anything can repair the geometry it reads, so the pre-fix state
       * (popup handed to a positioner whose top is the excess too high) is caught every run
       * or none. Falsified: revert `fitPin` and this reads −191 against a rest of 5.
       */
      const { popup } = await openConstrainedUp();
      const stripTop = new Promise<number>((resolve) => {
        const mo = new MutationObserver(() => {
          // The depart probe toggles the attribute and puts it back in one synchronous
          // block, so by this microtask it is present again — only the real strip stays off.
          if (popup.hasAttribute("data-unfurling")) return;
          mo.disconnect();
          resolve(popup.getBoundingClientRect().top);
        });
        mo.observe(popup, { attributes: true, attributeFilter: ["data-unfurling"] });
      });
      await departed(popup);
      const atStrip = await stripTop;
      // The rest position, watched to stillness rather than slept to (stillWidth's argument,
      // one axis over).
      let last = Number.NaN;
      let steady = 0;
      await until(() => {
        const top = Math.round(popup.getBoundingClientRect().top);
        steady = top === last ? steady + 1 : 0;
        last = top;
        return steady >= 2;
      }, 3000);
      const rest = popup.getBoundingClientRect().top;
      // Tightened 8 -> 1.5 on 2026-08-25 with the RESTING ANCHOR (useRestingAnchor,
      // floating.tsx): the first bound was set when a ~2px press-spring residue was a
      // documented cost, and a bound that admits the residue is a bound that cannot catch
      // the anchor correction being deleted. Measured: 0.0 with the virtual anchor, 2.0
      // without — the sabotage this now exists for.
      expect(
        Math.abs(atStrip - rest),
        `the release must hand the popup to a positioner already at the truth: ${Math.round(atStrip)} at the strip against ${Math.round(rest)} at rest`,
      ).toBeLessThan(1.5);
    });

    it("the rows the flight reveals are the rows the panel rests on (§22, 2026-08-25)", async () => {
      /**
       * Kushagra, with two screenshots of one open: *"Just see the shift"* — the flight
       * showed the list's END (the group label clipped above the panel's edge) and the rest
       * frame its TOP, the content teleporting by the overflow on the release frame while
       * every box law stayed green. A bottom-pinned flying body holds the list's last row at
       * the seam; rest is `scrollTop 0`. The sink (fitSink, floating.tsx; the origin and
       * translate arms, surfaces.css) holds the RESTING window's last row at the seam
       * instead, so the landing frame is the resting frame.
       *
       * Both halves are asserted, because each catches a different unmaking: mid-flight the
       * list's end must hang BELOW the clip (without the sink it rides the seam — the first
       * half fails at ~0 against a floor of 50), and the first row must not move across the
       * strip (edge-anchored in the release's own microtask; without the sink it reads the
       * end-window's coordinates against the top-window's rest, ~150px apart).
       */
      const { popup } = await openConstrainedUp();
      const stripRow = new Promise<number>((resolve) => {
        const mo = new MutationObserver(() => {
          if (popup.hasAttribute("data-unfurling")) return; // the probes toggle and restore
          mo.disconnect();
          resolve(popup.querySelector('[role="menuitem"]')!.getBoundingClientRect().top);
        });
        mo.observe(popup, { attributes: true, attributeFilter: ["data-unfurling"] });
      });
      await departed(popup);
      // Mid-flight: the seam carries the resting window, so the list's end is clipped away.
      expect(popup.hasAttribute("data-unfurling"), "the premise: still airborne at the read").toBe(true);
      const rows = popup.querySelectorAll<HTMLElement>('[role="menuitem"]');
      const last = rows[rows.length - 1]!;
      expect(
        last.getBoundingClientRect().bottom - popup.getBoundingClientRect().bottom,
        "the list's END must hang below the clip mid-flight — the seam belongs to the resting window",
      ).toBeGreaterThan(50);
      const atStrip = await stripRow;
      let steady = 0;
      let lastTop = Number.NaN;
      await until(() => {
        const top = Math.round(popup.querySelector('[role="menuitem"]')!.getBoundingClientRect().top);
        steady = top === lastTop ? steady + 1 : 0;
        lastTop = top;
        return steady >= 2;
      }, 3000);
      const rest = popup.querySelector('[role="menuitem"]')!.getBoundingClientRect().top;
      // 8 -> 1.5 with the resting anchor, the box law's own sentence (see above).
      expect(
        Math.abs(atStrip - rest),
        `the content must not move across the release: first row at ${Math.round(atStrip)} at the strip against ${Math.round(rest)} at rest`,
      ).toBeLessThan(1.5);
    });

    watchesFrames("the seed of a pin-corrected flight never leaves its trigger (§22, 2026-08-25)", async () => {
      /**
       * The correction makes floating-ui re-solve the positioner while the seed is showing,
       * and the seed's translate was measured against the box BEFORE it moved — so without
       * the glue observer (floating.tsx) the seed paints wherever the moved box leaves it,
       * measured 651 for a trigger at 450, one frame at full opacity. The glue observer
       * re-lays the offset in the same rendering update that moved the box, so no such frame
       * can exist. Sampled per frame because the stale frame IS the subject; the premise
       * (at least one aimed seed frame) fails honestly on a runner that slept through the
       * window.
       */
      // The watcher is armed BEFORE the press (the file's own instrument lesson: real input
      // is slow enough that a whole seed window fits between two statements — armed after
      // `press` returned, this sampled nothing and failed its premise).
      render(
        <Theme>
          <div style={{ position: "fixed", bottom: "120px", left: "16px" }}>
            <Menu>
              <MenuTrigger render={<Button>Open</Button>} />
              <MenuContent>
                {Array.from({ length: 40 }, (_, i) => (
                  <MenuItem key={i}>{`Row ${i + 1}`}</MenuItem>
                ))}
              </MenuContent>
            </Menu>
          </div>
        </Theme>,
      );
      inMotion();
      const trigger = document.querySelector<HTMLElement>(".kui-button")!;
      const offsets: number[] = [];
      let sampling = true;
      const tick = () => {
        const popup = document.querySelector<HTMLElement>(".kui-menu-popup");
        if (popup?.hasAttribute("data-seed") && popup.hasAttribute("data-aimed")) {
          offsets.push(
            Math.abs(popup.getBoundingClientRect().top - trigger.getBoundingClientRect().top),
          );
        }
        if (sampling) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      await press(trigger);
      await until(() => document.querySelectorAll(".kui-menu-popup").length > 0);
      const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop();
      if (!popup) throw new Error("the popup never opened");
      await departed(popup);
      sampling = false;
      if (!offsets.length) throw new Error("no aimed seed frame was sampled — the premise, not the claim");
      expect(
        Math.max(...offsets),
        "an aimed seed painted away from the trigger it is the silhouette of",
      ).toBeLessThan(8);
    });
  });

  it("the side it opens on is decided ONCE, not re-decided as it grows (§22)", async () => {
    /**
     * Kushagra: *"it opens and then as it animates it realises it must open on the other side,
     * so it switches mid animation"*.
     *
     * The positioner is the box the anchoring library measures, and it shrink-wrapped the
     * panel — so the collision question was re-asked against every intermediate size. The
     * answers were all honest: a 40px seed fits beside a trigger near the right edge and a
     * 209px panel does not, so `data-align` said `start` for the first frames and flipped a
     * third of the way in, taking the transform-origin, the lean and the body's pin with it.
     *
     * The cell is chosen so the SEED fits start-aligned and the panel does not — which is
     * exactly the window the bug lived in, and the calibration below asserts it, because at a
     * trigger where even the seed overflows the panel always said `end` and this law would
     * pass against the pre-fix code.
     */
    render(
      <Theme>
        <div style={{ position: "absolute", top: "40px", right: "8px" }}>
          <Menu>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>Rename something longer</MenuItem>
              <MenuItem>Delete</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Theme>,
    );
    inMotion();
    const trigger = document.querySelector<HTMLElement>(".kui-button")!;
    const triggerLeft = trigger.getBoundingClientRect().left;

    /**
     * THE WINDOW IS THE FLIGHT, and the observer is armed before the press (2026-08-20).
     *
     * This law was red on 9 of 13 CI runs and green here, and both spellings before this one
     * were instruments rather than claims. The observer used to be installed AFTER the pose had
     * been awaited and the click had resolved, and it forbade any change FROM a value — on the
     * premise that the attribute goes straight from absent to its answer.
     *
     * Measured, it does not. Base UI stamps the default `start`, the runner pins the positioner
     * to the panel's real box, and floating-ui then answers `end` — one flip, always, at every
     * throttle rate: 87ms pose → 93ms flip → 128ms depart at 1x, and 379 → 530 → 755 at 20x.
     * That flip is the DECISION, not a re-decide, and whether the old observer arrived before
     * or after it was pure scheduling. That is the whole flake.
     *
     * The defect §22 names is re-deciding AS IT GROWS, so the window is after the flight
     * departs. Sabotaged — the positioner pin removed — the same probe reads depart at 117ms
     * and the flip at 850ms, on the other side of the line. Nothing is loosened by this: the
     * observer now catches flips the old one could not see at all, and the claim moved onto the
     * moment the bug is defined by.
     */
    const timeline: string[] = [];
    let departed = false;
    const late: string[] = [];
    const t0 = performance.now();
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        const el = record.target as HTMLElement;
        const name = record.attributeName!;
        const now = `${(performance.now() - t0).toFixed(0)}ms`;
        // The flight departs when the pose comes off while the flight attribute stays on.
        if (name === "data-seed" && !el.hasAttribute("data-seed") && el.hasAttribute("data-unfurling")) {
          departed = true;
          timeline.push(`${now} DEPART`);
          continue;
        }
        if (name !== "data-side" && name !== "data-align") continue;
        const change = `${now} ${name}: ${record.oldValue} -> ${el.getAttribute(name)}`;
        timeline.push(change);
        // Only a change FROM a value counts, and only after departure: the first stamping of an
        // absent attribute is Base UI deciding, and the pin's own answer lands before the
        // flight starts.
        if (departed && record.oldValue !== null) late.push(change);
      }
    });
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["data-side", "data-align", "data-seed"],
    });
    onTestFinished(() => observer.disconnect());

    const posed = watchPose();
    await press(trigger);
    const { flyW: natural } = await posed;
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop();
    if (!popup) throw new Error("the popup never opened");
    const seed = parseFloat(tokenOn(popup, "--floating-seed"));
    // Calibration, both halves: the seed must fit where the panel does not, or the flip this
    // law exists to forbid was never reachable in this cell.
    expect(triggerLeft + seed, "the seed must fit — else the pre-fix code passes").toBeLessThan(
      window.innerWidth,
    );
    expect(triggerLeft + natural, "the panel must NOT fit").toBeGreaterThan(window.innerWidth);

    /**
     * Watched until the BOX IS AT REST, not until the flight attribute drops — and the
     * difference is the whole sabotage. The defect's signature is the alignment changing while
     * the box is still changing size, and with the pin removed that lands within a frame or
     * two of the release: measured, depart 117ms, release 848ms, flip 850ms. Stopping on the
     * attribute disconnected the observer two milliseconds early and the sabotage walked out
     * through the gap — it failed this law on its calibration instead of on its claim, which is
     * a law passing for the wrong reason waiting to happen.
     *
     * Rest is only recognised AFTER the release, so a spring that plateaus for two frames
     * mid-flight cannot end the watch early. Watching longer can only make this law stricter:
     * every extra frame is another chance to catch a late flip, and there is nothing else in
     * this mount that could move the panel.
     */
    await until(() => departed, 3000);
    await until(() => !popup.hasAttribute("data-unfurling"), 3000);
    await stillWidth(popup);
    observer.disconnect();

    const evidence = `\n  timeline: ${timeline.join("\n            ") || "(nothing observed)"}`;
    // Calibration: a flight nobody saw depart makes every claim below vacuous.
    expect(departed, `the entry never departed${evidence}`).toBe(true);
    expect(
      timeline.some((e) => e.includes("data-align")),
      `the alignment never resolved at all — this cell must exercise a collision${evidence}`,
    ).toBe(true);
    expect(popup.getAttribute("data-align"), `it must settle end-aligned in this cell${evidence}`).toBe("end");
    expect(late, `it re-decided mid-flight${evidence}`).toEqual([]);
  });

  it("survives being mounted twice — the measurement is of the PANEL, never of the seed (§22)", async () => {
    /**
     * StrictMode invokes a ref callback twice, and every Next dev server turns StrictMode on.
     * So the measurement runs a second time on a popup already wearing the seed it set on the
     * first pass — and if it does not neutralise its own key, it measures 40px and pins the
     * panel's destination to its own starting point. Every menu in the app opened as a circle
     * and stayed one (Kushagra, screenshot), while this suite stayed green because a bare
     * mount only ever runs the callback once.
     *
     * The law mounts the real thing under StrictMode rather than calling the mechanism twice by
     * hand, because what is under test is the interaction with React's lifecycle.
     */
    mount(
      <React.StrictMode>
        <Theme>
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>Rename something longer</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>
      </React.StrictMode>,
    );
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop();
    if (!popup) throw new Error("the popup never opened");
    // The runner measures in a microtask, so the numbers land one turn after the mount.
    await flushFlight();
    const seed = parseFloat(tokenOn(popup, "--floating-seed"));
    const measured = parseFloat(popup.style.getPropertyValue("--kui-fly-w"));
    expect(measured, `the destination is the seed itself: ${measured}px`).toBeGreaterThan(seed);
  });

  it("the seed is EACH trigger's own box — a 28px icon and a wide button get different seeds (§22, 2026-08-15)", async () => {
    /**
     * The photograph, asserted at both extremes: the seed is a measurement, not a designed
     * constant, so an icon button conjures a small silhouette and a wide form trigger a wide
     * one — and each sits exactly on its own trigger. The two triggers are the calibration:
     * if both silhouettes measured alike, the seed would be a constant wearing a law that
     * cannot tell.
     */
    const seen: number[] = [];
    for (const trigger of [
      <Button size="1" iconOnly aria-label="More">+</Button>,
      <Button style={{ minWidth: "240px" }}>A wide trigger</Button>,
    ]) {
      mount(
        <Theme>
          <Menu defaultOpen>
            <MenuTrigger render={trigger} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>,
      );
      const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop()!;
      const button = [...document.querySelectorAll<HTMLElement>(".kui-button")].pop()!;
      // The flush lets the measurement and its aim run; the frame then lets the runner's own
      // re-aim land before this reads (floating-ui places the positioner asynchronously).
      await flushFlight();
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      const box = button.getBoundingClientRect();
      const seed = popup.getBoundingClientRect();
      expect(Math.abs(seed.width - box.width), "this trigger's own width").toBeLessThan(3);
      expect(Math.abs(seed.height - box.height), "and height").toBeLessThan(3);
      expect(Math.abs(seed.left - box.left), "sitting on this trigger").toBeLessThan(3);
      expect(Math.abs(seed.top - box.top)).toBeLessThan(3);
      seen.push(seed.width);
    }
    expect(Math.abs(seen[0]! - seen[1]!), "the calibration: two triggers, two seeds").toBeGreaterThan(100);
  });

  it("both channels actually MOVE across the entry — declared is not the same as free", async () => {
    /**
     * THE DEFECT, AND WHY THIS LAW STOPPED WATCHING FRAMES (rewritten 2026-08-20, on CI's own
     * evidence, after three sampled metrics died of the same cause).
     *
     * The inline channel was declared, listed in the transition and riding the spring — and
     * `min-width: max(--floating-min-w, --anchor-width)` beat it outright, so the panel snapped
     * to 112px the frame the seed ended and stayed there for the whole entry. A property can be
     * perfectly specified and still have nowhere to go. The stand-down that fixes it is one
     * declaration, `min-inline-size: 0` under `[data-unfurling]`, and everything below tests
     * exactly that.
     *
     * Three sampled metrics were tried first and all three were claims about the MACHINE:
     *
     *   "no frame covers more than a fifth of the distance" — a loaded runner hands the loop
     *   one frame where an idle one hands it ten, and the same smooth entry reports a 45px step
     *   out of 47.
     *
     *   "no interval exceeds six times the average px/ms" — unbounded as the interval shrinks.
     *   CI: `107 -> 110` across a THREE millisecond gap, three rounded pixels read as 1.07px/ms
     *   on an entry that is visibly a spring.
     *
     *   "the box must be seen in the middle third of its travel" — mine, and CI falsified it
     *   within one run: `widths 67,67,67,69,73,77,115,112` with `gaps 340,261,12,14,16,192`.
     *   The runner stalled 192ms exactly across the band, so a perfectly smooth entry was never
     *   observed there. "Caught by any sampler that looks at all" was simply false.
     *
     * They fail for one reason. **The sampler runs on the thread that is stalling**, so a
     * smooth entry it failed to watch and an entry that genuinely snapped hand back the same
     * numbers — and the repairs for those two are opposite, which is why every new bound bought
     * one more week. No metric over rAF samples can separate them.
     *
     * So the claim is made where it is exact. The floor either stands down for the flight or it
     * does not, and that is a computed value readable in one synchronous measurement with no
     * animation running at all. What is asserted is the FREEDOM the channel needs, not a
     * photograph of it being used.
     */
    // `openUnsettled`, not the file's settled `render`: the settled mount pins `transition: none`
    // by hand (that is what landing a panel means here), and the first read below is of the
    // entry's own transition list. Landed by watching for the flight to end rather than by
    // pinning it, so the list stays the real one.
    const { popup } = await openUnsettled();
    await until(() => !popup.hasAttribute("data-unfurling"), 3000);
    expect(popup.hasAttribute("data-unfurling"), "the entry must finish before its list is read").toBe(false);

    /**
     * THE RELEASE WAITS FOR THE LAST CHANNEL, read off the same computed list the runner reads
     * (`flightClock`). Keying the release on the vertical — which finishes earlier — puts the
     * width floor back while the panel is still widening: the same clamp, arriving late instead
     * of early. Asserted as the relationship between the two spans rather than by watching for
     * it, because a span is a fact about the stylesheet and needs no frames to be true.
     */
    const style = getComputedStyle(popup);
    const props = style.transitionProperty.split(",").map((v) => v.trim());
    const durations = style.transitionDuration.split(",").map((v) => parseFloat(v) * 1000);
    const delays = style.transitionDelay.split(",").map((v) => parseFloat(v) * 1000);
    const span = (name: string) => {
      const i = props.indexOf(name);
      expect(i, `${name} is not in the entry's transition list: ${props.join(" ")}`).toBeGreaterThan(-1);
      return durations[i % durations.length]! + delays[i % delays.length]!;
    };
    const inline = span("inline-size");
    const block = span("block-size");
    expect(inline, "the inline channel must be the longer one — it is what the release waits for").toBeGreaterThan(block);
    expect(
      Math.max(...props.map((_, i) => durations[i % durations.length]! + delays[i % delays.length]!)),
      "the flight's clock IS the longest channel, which is what the runner reads",
    ).toBeCloseTo(inline, 0);

    /**
     * AND THE CHANNEL IS FREE. Probed with transitions pinned off — the runner's own technique —
     * so the box takes the value it is given on the spot and nothing here depends on a frame
     * arriving. `--kui-fly-w` is the name the runner writes; the target is deliberately BELOW
     * the floor, because a target above it proves nothing.
     */
    popup.style.setProperty("transition", "none", "important");
    const floor = parseFloat(tokenOn(popup, "--floating-min-w"));
    expect(floor, "the floor must be a real length or this law is about nothing").toBeGreaterThan(20);
    const target = Math.round(floor / 2);

    // CALIBRATION FIRST: the floor is real, and it bites. Without this, a world where nothing
    // clamps anything passes the claim below for the wrong reason — the fixture would not be
    // able to tell a working stand-down from an absent floor.
    popup.style.setProperty("inline-size", `${target}px`);
    const clamped = popup.getBoundingClientRect().width;
    popup.style.removeProperty("inline-size");
    expect(
      clamped,
      `the floor does not bite: a settled panel asked for ${target}px rendered ${Math.round(clamped)}px, ` +
        `so nothing here is being stood down`,
    ).toBeGreaterThan(floor - 1);

    // THE CLAIM: in the flight state the same request is honoured, in both axes.
    popup.setAttribute("data-unfurling", "");
    popup.style.setProperty("--kui-fly-w", `${target}px`);
    popup.style.setProperty("--kui-fly-h", `${target}px`);
    const free = popup.getBoundingClientRect();
    popup.removeAttribute("data-unfurling");
    popup.style.removeProperty("--kui-fly-w");
    popup.style.removeProperty("--kui-fly-h");
    popup.style.removeProperty("transition");
    expect(
      Math.round(free.width),
      `the width channel is pinned: mid-flight the panel was asked for ${target}px and rendered ` +
        `${Math.round(free.width)}px, which is the floor (${Math.round(floor)}px) beating an animating ` +
        `width — declared, listed, sprung, and with nowhere to go`,
    ).toBe(target);
    expect(
      Math.round(free.height),
      `the height channel is pinned: asked for ${target}px, rendered ${Math.round(free.height)}px`,
    ).toBe(target);
  });

  it("the posed CONTENT is held: invisible, molten, and a step below where it lands (§8, §22)", async () => {
    /**
     * The family's content sentence, all three channels, read on the pose (2026-08-15: the rows
     * must be *"blurred out, empty"* while the box is still becoming, and print as one piece as
     * it lands; the small rise joined on 2026-08-16 so the content ARRIVES rather than merely
     * appearing).
     *
     * It exists because the rise went missing and nothing failed (2026-08-17). It was collateral
     * from a gesture built and then deleted, and the whole suite stayed green: every law here
     * read the BOX, and the three channels the body moves had no law of their own. A mechanism
     * with no law is a mechanism one refactor from being gone.
     */
    const { popup } = await openUnsettled();
    const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;
    expect(popup.hasAttribute("data-seed"), "the read must land on the posed frame").toBe(true);
    expect(parseFloat(computed(body, "opacity")), "the content is not held back").toBe(0);
    expect(computed(body, "filter"), "the content is not molten").toContain("blur");
    // The echo: a step BELOW where it will land, so the print reads as an arrival. Asserted as
    // a downward offset rather than against the token's number — the distance is taste and the
    // claim is the direction.
    const [, y] = computed(body, "translate").split(" ");
    expect(parseFloat(y ?? "0"), "the content does not rise into place").toBeGreaterThan(0);
    /**
     * And it ARRIVES: everything above is a pose, and a pose that never comes off is a panel
     * whose rows never appear.
     *
     * Waited to the VALUES, not to the pose coming off (2026-08-17, after this failed on CI
     * and never here). The pose is stripped on the flight's clock, and the body's own print
     * runs on a clock of its own that is still finishing its last frames at that instant —
     * measured on the runner at `blur(0.093377px)`, a tenth of a pixel short of `none`. The
     * deadline is a ceiling on a print that never lands, not a timing claim: if the content
     * genuinely never sharpens, the loop expires and the assertions below fail holding
     * whatever it was left with.
     */
    const deadline = performance.now() + 3000;
    const arrived = () =>
      !popup.hasAttribute("data-unfurling") &&
      computed(body, "filter") === "none" &&
      computed(body, "translate") === "none";
    while (!arrived() && performance.now() < deadline)
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(parseFloat(computed(body, "opacity")), "the content never printed").toBeCloseTo(1, 1);
    expect(computed(body, "filter"), "the content never sharpened").toBe("none");
    expect(computed(body, "translate"), "the content never landed").toBe("none");
  });

  it("a panel that opens UPWARD keeps its content INSIDE it, every frame (§22, §23)", async () => {
    /**
     * Kushagra: *"whenever menu opens to the top, the content doesnt load, it comes after
     * animation completes."* It loaded on frame one. It was outside the pane.
     *
     * The flight pins the body absolutely so the panel is sized by the measurement rather than
     * by its content, and that pin resolves against the nearest positioned ancestor. ScrollArea
     * landed between the body and the panel on 2026-08-17 and its root is `position: relative`
     * — written INLINE by Base UI, so no stylesheet can take it — which made the scroll area
     * the containing block. Its height is its content's, and the pin has just taken that
     * content out of flow, so it collapses to its own padding: measured, 8px.
     *
     * Bottom-opening panels survived by luck: that 8px box sits at the panel's top, so
     * `inset-block-start` from it lands about where a downward-growing panel wanted the rows.
     * A top-opening panel measures `inset-block-end` from the same box's bottom — four pixels
     * below the panel's TOP — so the body sat above the pane and was clipped for the whole
     * entry. Measured before the fix: 0px of a 92px body inside the panel for the first
     * two-thirds of the flight, 8px at the end, and the rows appearing all at once when the
     * flight released and the body returned to flow.
     *
     * The claim is containment per FRAME, because the defect is invisible in every static
     * read: at rest, before and after, the body is in flow and perfectly placed.
     */
    render(
      <Theme>
        <div style={{ position: "absolute", bottom: "20px", left: "20px" }}>
          <Menu>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Alpha</MenuItem>
              <MenuItem>Beta</MenuItem>
              <MenuItem>Gamma</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Theme>,
    );
    inMotion();
    // Seized at the depart edge and stepped by the flight's own clocks (2026-08-20, CI: "the
    // flight was never sampled — every assertion below is vacuous: expected 4 to be greater
    // than 6"). The rAF sampler was armed before the press for the right reason — a whole
    // entry can finish between two statements — and still lost, because the sampler runs on
    // the thread that stalls: four frames is all a loaded runner painted, and the minimum-
    // sample calibration failed honestly on a perfectly sound flight. Forty-one stations of
    // the engine's own rendering replace however many frames the host could spare; a flight
    // that never departs fails the seizure's own three-second premise instead.
    const seized = seizeFlight();
    await press(document.querySelector<HTMLElement>(".kui-button")!);
    const { popup, clock, at, land } = await seized;
    const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;
    const seen: { side: string | null; panel: number; body: number; inside: number }[] = [];
    for (let station = 0; station <= 40; station++) {
      at((clock * station) / 40);
      const p = popup.getBoundingClientRect();
      const b = body.getBoundingClientRect();
      seen.push({
        side: popup.getAttribute("data-side"),
        panel: p.height,
        body: b.height,
        inside: Math.max(0, Math.min(p.bottom, b.bottom) - Math.max(p.top, b.top)),
      });
    }
    land();

    // Calibration: the case only exists if the panel actually opened upward.
    expect(seen.every((f) => f.side === "top"), `the panel must open upward: ${seen[0]?.side}`).toBe(true);
    expect(Math.max(...seen.map((f) => f.panel)), "and it must actually grow").toBeGreaterThan(
      Math.min(...seen.map((f) => f.panel)) + 20,
    );

    // The claim: once the pane is tall enough to hold the body, the body is in it. Frames where
    // the pane is still smaller than its content are exempt — there the content cannot fit by
    // definition, and the family clips on purpose.
    const holdable = seen.filter((f) => f.panel >= f.body);
    expect(holdable.length, "the pane must reach its content's height while still flying").toBeGreaterThan(2);
    for (const f of holdable)
      expect(
        f.inside,
        `panel ${f.panel.toFixed(0)}px held only ${f.inside.toFixed(0)}px of its ${f.body.toFixed(0)}px body`,
      ).toBeGreaterThan(f.body * 0.9);
  });

  it("the panel clips while it is not its own size (§22)", async () => {
    const { popup } = await openUnsettled();
    expect(popup.hasAttribute("data-unfurling")).toBe(true);
    /**
     * CLIP, not `hidden` (2026-08-17, Kushagra: *"Select still jumps"*). The two clip
     * identically; they differ in whether the box can be SCROLLED, and that difference is the
     * bug. Base UI focuses the selected row while the panel is still mid-flight and
     * deliberately smaller than its content, so the browser scrolls the nearest scrollable
     * ancestor to reveal it — and `hidden` IS one. Measured on an eight-row select with the
     * fifth selected: the panel took `scrollTop: 57`, which nothing settles at (the whole list
     * fits the instant the box finishes growing), so the browser clamped it back down frame by
     * frame and the contents slid under a growing frame. `clip` cannot take an offset at all:
     * measured 0 in every frame.
     *
     * `hidden` was tried FIRST, for the opposite reason and against the same symptom — an
     * unscrollable panel sends the browser one step up and the PAGE moves instead. That half
     * is real and is held in the runner rather than absorbed here (system/floating.tsx), which
     * is what lets this box refuse the scroll outright. Measured both ways: `clip` with no
     * hold leaves the page 65px down, `hidden` with the hold leaves the page still and the
     * contents sliding.
     */
    expect(computed(popup, "overflow-y")).toBe("clip");
    // And it scrolls again once it has arrived — a long menu is why the panel has an overflow
    // at all, and `overflow-y: auto` computes the OTHER axis to auto with it.
    // The width floor is stood down for the whole flight, not only the seed frame: it means
    // "a settled panel is never narrower than its trigger", and a panel mid-unfurl is
    // deliberately narrower than everything.
    expect(computed(popup, "min-width")).toBe("0px");
    popup.removeAttribute("data-unfurling");
    popup.removeAttribute("data-seed");
    // The panel does NOT take its scrolling back (2026-08-17): the list scrolls inside a
    // ScrollArea viewport now, so the popup's clip is permanent — it is the pane's own
    // boundary, not a state of the flight. What the release must restore is the viewport's
    // ability to scroll, which is the claim that replaces this one.
    //
    // `clip` since 2026-08-20, and the word is the point. This line asserted `hidden` while
    // the sentence above it said "clip is permanent" — menu.css had the same split, saying
    // "clips" in prose and `overflow: hidden` in CSS. A hidden box is a scroll container; the
    // pane wants a boundary, not a scrollport it never uses. The declaration is deleted and
    // the base surface rule carries it, which is why this now reads through from the pane.
    expect(computed(popup, "overflow-y")).toBe("clip");
    // `scroll`, not `auto`: Base UI's viewport asks for a permanent scrollport so its own
    // measurements do not change the box they measure, and the custom bar replaces the one
    // that would otherwise always show (scrollbar-width: none, scroll-area.css).
    expect(computed(padBox(popup), "overflow-y")).toBe("scroll");
    expect(parseFloat(computed(popup, "min-width")), "and it comes back").toBeGreaterThan(0);
  });

  it("the silhouette's overlay is PAINT, never layout (§22, 2026-08-15)", async () => {
    // The seed sits on its trigger through a measured TRANSLATE (--kui-from-x/y) and never
    // a margin: a margin is layout — it re-sizes the positioner, which re-solves the
    // panel's position (Kushagra, playground, 2026-08-09).
    const { popup } = await openUnsettled();
    for (const margin of ["margin-block-start", "margin-block-end", "margin-inline-start", "margin-inline-end"]) {
      expect(computed(popup, margin), `${margin}: the overlay must not be layout`).toBe("0px");
    }
    // And the translate is genuinely doing the carrying: the popup's layout box and its
    // painted box must differ while the seed holds, or the overlay is a coincidence of
    // position rather than a mechanism.
    expect(computed(popup, "translate"), "the overlay rides a translate").not.toBe("none");
    // And the pane pivots on the corner the positioner holds, so it settles back into where it
    // grew from rather than into its own middle. The default menu opens below its trigger,
    // aligned to its start: top-left.
    expect(computed(popup, "transform-origin")).toBe("0px 0px");
  });

  it("the pivot follows the side and the align, not the default (§22)", async () => {
    // Calibration for the law above: if every panel pivoted top-left, that assertion would be
    // true for the wrong reason. A menu aligned to its trigger's end holds the OTHER corner.
    // `mount`, not this file's settling `render` — a landed panel has no lean left to read.
    mount(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent align="end">
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop()!;
    expect(popup.getAttribute("data-align")).toBe("end");
    const [x] = computed(popup, "transform-origin").split(" ");
    expect(parseFloat(x!), "an end-aligned panel pivots on its end edge").toBeGreaterThan(0);
    // The measured overlay needs no per-align arm — the same measurement lands the seed on
    // the trigger here too, from the panel's OTHER corner. The flush lets the measurement and
    // its aim run; the frame then lets the runner's own re-aim land before this reads — a bare
    // frame registered before the runner's would be read FIRST and catch the panel unaimed.
    await flushFlight();
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const button = [...document.querySelectorAll<HTMLElement>(".kui-button")].pop()!;
    const box = button.getBoundingClientRect();
    const seed = popup.getBoundingClientRect();
    expect(Math.abs(seed.left - box.left), "on the trigger, end-aligned too").toBeLessThan(3);
    expect(Math.abs(seed.top - box.top)).toBeLessThan(3);
  });

  it("a submenu holds the edge it emerged through, not the one a menu holds (§22)", async () => {
    await openUnsettled({}, (
      <MenuSub defaultOpen>
        <MenuSubTrigger>More</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>Deep</MenuItem>
        </MenuSubContent>
      </MenuSub>
    ));
    // By ANATOMY: the child is the panel that does NOT wear the anchor-width floor, which only
    // a top-level popup carries. An index here is the stale-subject bug this file has been
    // caught by twice.
    const panels = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")];
    const child = panels.find((el) => !el.classList.contains("kui-menu-anchored"));
    const parent = panels.find((el) => el.classList.contains("kui-menu-anchored"));
    if (!child || !parent) throw new Error("the submenu never mounted");
    expect(child).not.toBe(parent);
    // A submenu opens toward the inline END, so the edge its positioner holds is the START
    // one — the axis a top-level menu answers with `align` is the one a submenu answers with
    // `side`, and the pivot follows it without a rule of the submenu's own.
    expect(child.getAttribute("data-side")).toMatch(/right|inline-end/);
    expect(computed(child, "transform-origin")).toBe("0px 0px");
    expect(computed(child, "margin-inline-start")).toBe("0px");
    expect(child.hasAttribute("data-seed"), "the read must land on the seed frame").toBe(true);
    // The seed's own GEOMETRY is no longer this law's subject (2026-08-17). It used to assert
    // the row's silhouette — left, top, width and height all within 3px of the trigger row —
    // and that rule is gone: a panel landing BESIDE its trigger flies from the seam instead
    // (see "a panel that lands BESIDE its trigger grows out of the SEAM"). This law keeps the
    // half that did not change, which is the edge the positioner holds and the pivot that
    // follows it. Splitting them is deliberate: the seam law has to open by hover to measure
    // anything real, and this one is about a fact readable the moment the panel exists.
  });
});

describe("a portalled panel is glass again — the escape the stacking rule needs (§10, §20)", () => {
  it("a menu opened from inside a glass Card still paints its own pane", () => {
    // The subtle half of "glass does not stack". React context follows the TREE, so a menu
    // triggered from inside a glass card is — as far as React is concerned — inside that
    // card's glass scope, and a naive scope would render the panel solid. It is not inside it
    // on screen: the panel paints over the page. `PortalScope` renders the bare Theme §20
    // already requires, a Theme resets the mark, and the panel resolves the app's material.
    //
    // The negative control is the card itself, which must stay glass: without it, a rule that
    // switched the whole app to solid would satisfy the assertion below.
    let panel: HTMLElement | null = null;
    // `backdrop` (lab port 2026-08-17): Cards are SOLID by default even under a glass
    // theme — glass is selective — so the negative control must state the over-content
    // placement to be glass at all. The panel portals out and expresses the theme's glass
    // regardless; without the prop the "card stays glass" half would assert nothing.
    const host = render(
      <Theme material="regular">
        <Card id="host" backdrop>
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent ref={(n: HTMLDivElement | null) => void (panel = n)}>
              <MenuItem>Alpha</MenuItem>
            </MenuContent>
          </Menu>
        </Card>
      </Theme>,
    );
    const card = host.querySelector<HTMLElement>("#host")!;
    expect(card.dataset["material"], "the card is the negative control").toBe("regular");
    if (!panel) throw new Error("the panel never mounted — the law below would assert nothing");
    const p = panel as HTMLElement;
    expect(p.dataset["material"]).toBe("regular");
    expect(computed(p, "backdrop-filter")).not.toBe("none");
  });

  it("but a card composed INSIDE that panel is solid — the rule still holds one level in", () => {
    let panel: HTMLElement | null = null;
    render(
      <Theme material="regular">
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent ref={(n: HTMLDivElement | null) => void (panel = n)}>
            <Card id="inner" />
          </MenuContent>
        </Menu>
      </Theme>,
    );
    if (!panel) throw new Error("the panel never mounted");
    const p = panel as HTMLElement;
    expect(p.dataset["material"]).toBe("regular");
    const inner = p.querySelector<HTMLElement>("#inner")!;
    // `on-glass` (2026-08-16): it must not filter — the panel already spent the backdrop —
    // and it must not seal either, or a card in a glass menu reads as a slab punched through
    // the panel. Both halves, since the attribute alone would pass on a rule that paints
    // nothing and the filter alone would pass on an opaque card.
    expect(inner.dataset["material"]).toBe("on-glass");
    expect(computed(inner, "backdrop-filter")).toBe("none");
    const alpha = (c: string) => (c.includes("/") ? parseFloat(c.slice(c.lastIndexOf("/") + 1)) : 1);
    expect(alpha(computed(inner, "background-color")), "the card sealed itself onto the panel").toBeLessThan(1);
  });
});

describe("the ScrollArea adoption holds its a11y and its keyboard physics (2026-08-19)", () => {
  it("the viewport carries NO tabindex, so role=presentation is real and menu owns menuitem", () => {
    // ARIA's conflict rule voids `presentation` on any focusable element. Base UI stamps a
    // tabindex on the viewport unconditionally (0 scrollable, -1 not), so the first adoption
    // exposed a nameless `generic` between role="menu" and its items and put a tab stop
    // inside a roving-focus widget (audit 2026-08-18, read off the CDP accessibility tree).
    // The menu passes `focusable={false}` and the wrapper strips the attribute — asserted on
    // the attribute because the attribute is the entire mechanism the AX tree keys on.
    const { popup } = openMenu({});
    const viewport = popup.querySelector<HTMLElement>(".kui-scroll-viewport")!;
    expect(viewport.getAttribute("role")).toBe("presentation");
    expect(viewport.hasAttribute("tabindex"), "a focusable viewport voids presentation").toBe(false);
    // The standalone ScrollArea keeps its tab stop — a bare scroll region must be reachable
    // by keyboard, and losing THAT to this fix would trade one a11y defect for another.
  });

  it("a KEYBOARD open flies — Base UI 1.7's instant stamp is exempt for real opens (§8, §22)", async () => {
    // Base UI 1.7 stamps instantType "click" for any trigger press with detail === 0 —
    // every keyboard Enter/Space — and the runner's bail honoured it, so a keyboard user
    // got no entry at all while a mouse user got the full silhouette flight (audit
    // 2026-08-18): a decision this system never made. An open is an open; stillness belongs
    // to reduced-motion, not to the keyboard. The runner and the stylesheet both exempt
    // `data-instant="click"` now, and this law drives a real keyboard.
    render(
      <Theme>
        <Menu>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
            <MenuItem>Beta</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    inMotion();
    const trigger = document.querySelector<HTMLButtonElement>(".kui-button")!;
    const { userEvent } = await import("vitest/browser");
    // Armed BEFORE the press — real input is slow enough that the whole entry can finish
    // between two statements (the recorded instrument lesson).
    const posed = watchPose();
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const { flyW } = await posed;
    expect(flyW, "the keyboard entry posed a real flight").toBeGreaterThan(0);
  });
});

describe("reduced transparency SEALS a floating pane (§10 — audit 2026-08-18)", () => {
  it("the popup's veil goes near-opaque, not just blur-less", async () => {
    // The sealed-veil arm was (0,2,0) and the dark-floating fill rules are (0,3,0), so the
    // preference stripped the blur and LEFT the translucency — a menu stayed ~50% see-through
    // with raw page content reading straight through the rows, strictly worse than leaving
    // the preference off. The restated floating arm seals the veil at the floating rules'
    // own weight.
    const { cdp } = await import("vitest/browser");
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
    });
    try {
      const { popup } = openMenu({ material: "regular" });
      expect(computed(popup, "backdrop-filter")).toBe("none");
      const fill = computed(popup, "background-color");
      const alpha = fill.includes("/") ? parseFloat(fill.split("/")[1]!) : 1;
      expect(alpha, `a sealed pane must be near-opaque, got ${fill}`).toBeGreaterThan(0.85);
    } finally {
      await cdp().send("Emulation.setEmulatedMedia", { features: [] });
    }
  });
});

/**
 * ── THE LIT ROW IS A HALF-STEP (§21, 2026-08-26) ─────────────────────────────────────────
 * A quiet row's transient light mixes `--tone-soft` toward transparent instead of painting
 * it whole (Kushagra: the hover grey "feels darker" — and a tree's selected row, which rests
 * at FULL soft, painted the same pixels as a hovered one, so persistent never outranked
 * transient). This law exists because the mixed arm shipped with no reader: sabotaging the
 * `data-highlighted` mix out of recipes.css failed nothing until this was written — the
 * unfalsifiable-arm shape the audits keep naming, caught before commit this time.
 */
describe("a lit menu row paints LESS than full soft — the quiet half-step (§21)", () => {
  it("the highlighted fill's alpha sits visibly below the resolved soft's", async () => {
    const { popup } = openMenu({});
    const row = popup.querySelector<HTMLElement>(".kui-menu-item");
    if (!row) throw new Error("no row mounted");
    // The keyboard route, the states law's own proven idiom — a synthetic pointermove does
    // not reach Base UI's highlight tracking (measured: the wait below timed out on it).
    popup.focus();
    flushSync(() => {
      popup.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    await until(() => row.hasAttribute("data-highlighted"));
    const alphaOf = (color: string): number => {
      const slash = /\/\s*([\d.]+)\s*\)/.exec(color);
      if (slash) return parseFloat(slash[1]!);
      const comma = /^rgba\((?:[^,]+,){3}\s*([\d.]+)\)/.exec(color);
      if (comma) return parseFloat(comma[1]!);
      return 1;
    };
    const lit = alphaOf(computed(row, "background-color"));
    const soft = alphaOf(colorOn(row, "var(--tone-soft)"));
    expect(lit, "the row never lit").toBeGreaterThan(0);
    expect(soft, "soft resolved to nothing").toBeGreaterThan(0);
    // Visibly below: at least a tenth under, so a rounding difference cannot satisfy it.
    expect(lit, `lit ${lit} vs soft ${soft}`).toBeLessThan(soft * 0.9);
  });
});
