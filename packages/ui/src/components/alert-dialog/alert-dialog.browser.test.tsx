/**
 * AlertDialog's mounted laws (§10, §20, §25) — the 2026-08-03 standard: computed values
 * through a mounted <Theme>.
 *
 * This file carries the §20 AGREEMENT LAW every portalling component owes, and then the
 * facts that make an alert an alert rather than a small dialog: the ROLE and its behavior
 * (no outside-press dismissal, focus on the safe action), the FIXED width, the size index
 * reaching the TYPE (legal here because the content is the system's own), and the action
 * row's owned layout. The family machinery — scrim tokens, overlay corner band, the entry —
 * is law-tested where it lives; what is asserted here is membership plus the alert's own.
 */
import * as React from "react";
import { flushSync } from "react-dom";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "./alert-dialog.tsx";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../dialog/dialog.tsx";
import { Button } from "../button/button.tsx";
import { Heading } from "../heading/heading.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import {
  render,
  settleAll,
  computed,
  tokenOn,
  probeIn,
  inMotion,
  until,
  catchDissolve,
  asksForStillness,
  SIZES,
} from "../../test/browser.tsx";
import type { Size } from "../../system/axes.ts";
import type { OverlayOpenChangeDetails } from "../../system/floating.tsx";
import { Text } from "../text/text.tsx";

const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  depth: "elevated",
  contrast: "high",
};

/** Mount an OPEN alert under a themed root; LOUD when the panel never mounts. */
function openAlert(theme: ThemeProps, opts: { size?: Size; body?: React.ReactNode } = {}) {
  render(
    <Theme {...theme}>
      <AlertDialog defaultOpen {...(opts.size ? { size: opts.size } : {})}>
        <AlertDialogContent>
          {opts.body ?? (
            <>
              <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
              <AlertDialogDescription>Everything goes with it.</AlertDialogDescription>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </Theme>,
  );
  const popups = document.querySelectorAll<HTMLElement>(".kui-alert-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the panel never mounted — every law below would assert nothing");
  settleAll();
  return {
    popup,
    buttons: [...popup.querySelectorAll<HTMLButtonElement>("button")],
  };
}

function surfaceFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
    border: cs.borderTopColor,
    radius: cs.borderTopLeftRadius,
    padding: cs.paddingTop,
    shadow: cs.boxShadow,
    color: cs.color,
    direction: cs.direction,
  };
}

/* ── The §20 agreement law ────────────────────────────────────────────────────────────── */

describe("the agreement law: portalled ≡ in-flow (§20, §25)", () => {
  function twin(theme: ThemeProps) {
    let panel: HTMLElement | null = null;
    render(
      <Theme {...theme}>
        <div
          ref={(n: HTMLDivElement | null) => void (panel = n)}
          className="kui-surface kui-overlay kui-alert-popup"
          data-size="2"
          data-tone="neutral"
          data-emphasis="quiet"
          data-bordered="true"
        />
      </Theme>,
    );
    if (!panel) throw new Error("twin never mounted");
    return panel as HTMLElement;
  }

  it("computes identical under the hostile axis set", () => {
    const { popup } = openAlert(HOSTILE);
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(twin(HOSTILE)));
    expect(surfaceFacts(twin({}))).not.toEqual(surfaceFacts(twin(HOSTILE)));
  });
});

/* ── The role, and the behavior that comes with it (§25) ──────────────────────────────── */

describe("an alert is an alert, not a small dialog", () => {
  it("wears role=alertdialog, named and described", () => {
    const { popup } = openAlert({});
    expect(popup.getAttribute("role")).toBe("alertdialog");
    const title = document.getElementById(popup.getAttribute("aria-labelledby")!);
    const description = document.getElementById(popup.getAttribute("aria-describedby")!);
    expect(title?.textContent).toBe("Delete workspace?");
    expect(description?.textContent).toBe("Everything goes with it.");
  });

  it("does not dismiss on an outside press — the role's own refusal", async () => {
    const { popup } = openAlert({});
    // A real press outside the panel. The press lands on the VIEWPORT's empty corner — the
    // backdrop sits underneath it and can never receive a pointer, which the first spelling
    // of this law learned by timing out on it.
    const viewport = popup.parentElement!;
    await userEvent.click(viewport, { position: { x: 8, y: 8 } });
    // SETTLED-BY-DESIGN: this claims a NON-event — that the press did NOT close the alert —
    // so there is nothing to wait for, and waiting could only delay a correct answer. A slow
    // machine makes this pass more easily rather than less, which is why the strength here
    // comes from the negative control below (the same press closes an ordinary Dialog) rather
    // than from timing.
    expect(popup.isConnected, "an outside press closed the alert").toBe(true);
    // The negative control, so this law cannot pass in a world where nothing dismisses
    // anything: the same press closes an ordinary Dialog.
    render(
      <Theme>
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Plain dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      </Theme>,
    );
    const dialogs = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
    const dialog = dialogs[dialogs.length - 1]!;
    settleAll();
    await userEvent.click(dialog.parentElement!, { position: { x: 8, y: 8 } });
    // A STATE, not a sleep (`until`, 2026-08-17): the dialog leaves on its exit's own clock,
    // and a stalled runner outlives a fixed 400ms — the focus law next door failed CI's
    // first PR run exactly this way.
    await until(() => !dialog.isConnected, 3000);
    expect(dialog.isConnected, "the dialog control did not dismiss — the instrument is blind").toBe(false);
  });

  it("still dismisses on Escape — 'not now' by keyboard", async () => {
    const { popup } = openAlert({});
    await userEvent.keyboard("{Escape}");
    await until(() => !popup.isConnected, 3000);
    expect(popup.isConnected).toBe(false);
  });

  it("initial focus lands on Cancel, the least destructive action", async () => {
    // Opened by a real click, not defaultOpen: on a mount-open Base UI focuses the popup
    // itself (its touch-safe default), so only an interactive open exercises the
    // first-tabbable rule this law is about. Cancel first in the DOM IS the mechanism —
    // no focus machinery, just document order.
    render(
      <Theme>
        <AlertDialog>
          <AlertDialogTrigger render={<Button>Delete…</Button>} />
          <AlertDialogContent>
            <AlertDialogTitle>Sure?</AlertDialogTitle>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </Theme>,
    );
    await userEvent.click(document.querySelector<HTMLElement>(".kui-button")!);
    settleAll();
    // A STATE, not a sleep (`until`, 2026-08-17): Base UI moves focus into the popup
    // asynchronously, and a 100ms sleep read the TRIGGER still holding it on CI's first
    // PR run ("expected 'Delete…' to be 'Keep it'" — 'Delete…' is the trigger's label).
    // If focus genuinely lands elsewhere, the deadline expires into the same assertion —
    // falsified with Action first in the DOM, which fails here at the full deadline.
    await until(() => document.activeElement?.textContent === "Keep it", 3000);
    expect(document.activeElement?.textContent).toBe("Keep it");
  });

  it("both actions close, and Action fires the caller's handler first", async () => {
    let fired = 0;
    const { popup, buttons } = openAlert({}, {
      body: (
        <>
          <AlertDialogTitle>Sure?</AlertDialogTitle>
          <AlertDialogCancel>Back</AlertDialogCancel>
          <AlertDialogAction onClick={() => void fired++}>Proceed</AlertDialogAction>
        </>
      ),
    });
    await userEvent.click(buttons[1]!);
    await until(() => !popup.isConnected, 3000);
    expect(fired).toBe(1);
    expect(popup.isConnected).toBe(false);
  });
});

/* ── The box: fixed width, the alert's own ladder (§25) ───────────────────────────────── */

describe("the box", () => {
  it("is exactly its designed width at every size — fixed, not a maximum", () => {
    for (const size of SIZES) {
      const { popup } = openAlert({}, { size });
      const designed = parseFloat(tokenOn(popup, `--alert-w-${size}`));
      // Content-independent: the default body is short, and the panel must still stand at
      // the full designed width — which is what "fixed" means and a max would fail.
      expect(popup.getBoundingClientRect().width, `size ${size}`).toBeCloseTo(designed, 1);
      // And strictly narrower than the dialog of the same index: an alert interrupts with a
      // question, it does not host work.
      expect(designed).toBeLessThan(parseFloat(tokenOn(popup, `--overlay-w-${size}`)));
    }
  });

  it("wears the overlay corner of its index, and PADDING one size up with the top held (§25)", () => {
    // The corner band's own sentence, one property over (Kushagra, judged in lab2): a bigger
    // curve wants a bigger inset or the words crowd the sweep. Size 4 holds at p-4 exactly
    // as the corner band's top step holds at 10.
    const bumped = { "1": "2", "2": "3", "3": "4", "4": "4" } as const;
    for (const size of SIZES) {
      const { popup } = openAlert({}, { size });
      // Lab port 2026-08-17: under `@supports (corner-shape: squircle)` every surface DRAWS
      // its authored corner × --kui-corner-k (1.613 — the lab's 0.62 inverted), so the band
      // token alone is one factor short of the painted number. Derived, never restated: the
      // probe reads the same token and the same knob the surface rule does, so a re-priced
      // band or knob moves both sides — and a non-squircle engine resolves the knob's
      // fallback of 1 and this law holds unchanged.
      const expected = probeIn(
        popup,
        (el) => (el.style.borderRadius = `calc(var(--radius-overlay-${size}) * var(--kui-corner-k, 1))`),
        (s) => s.borderTopLeftRadius,
      );
      expect(computed(popup, "border-top-left-radius")).toBe(expected);
      expect(computed(popup, "padding-top")).toBe(tokenOn(popup, `--surface-p-${bumped[size]}`));
    }
  });
});

/* ── Size reaches the type — legal because the content is the system's (§15, §25) ─────── */

describe("the index prices the content", () => {
  it("title, description and buttons all move with size — and match the real components", () => {
    const title = (size: Size) => {
      const { popup } = openAlert({}, { size });
      return document.getElementById(popup.getAttribute("aria-labelledby")!)!;
    };
    // The ends of the ladder differ (the vacuity guard: a map that stopped being read would
    // freeze every step at one value).
    const s1 = parseFloat(getComputedStyle(title("1")).fontSize);
    const s4 = parseFloat(getComputedStyle(title("4")).fontSize);
    expect(s4).toBeGreaterThan(s1);
    // And the size-3 alert IS the confirm card's typography — asserted against a mounted
    // Heading at the composition step, not against a number.
    let heading: HTMLElement | null = null;
    render(
      <Theme>
        <Heading ref={(n: HTMLHeadingElement | null) => void (heading = n)} size="6">x</Heading>
      </Theme>,
    );
    expect(getComputedStyle(title("3")).fontSize).toBe(
      getComputedStyle(heading as unknown as HTMLElement).fontSize,
    );
  });

  it("the buttons take the alert's own index", () => {
    for (const size of ["1", "4"] as const) {
      const { buttons } = openAlert({}, { size });
      let twin: HTMLElement | null = null;
      render(
        <Theme>
          <Button size={size} ref={(n: HTMLButtonElement | null) => void (twin = n)}>x</Button>
        </Theme>,
      );
      expect(computed(buttons[0]!, "min-height")).toBe(
        computed(twin as unknown as HTMLElement, "min-height"),
      );
    }
  });
});

/* ── The owned layout (§25) ───────────────────────────────────────────────────────────── */

describe("the action row", () => {
  it("two actions share the row equally and fill it", () => {
    const { popup, buttons } = openAlert({});
    const [cancel, action] = buttons.map((b) => b.getBoundingClientRect());
    // Same row, equal share, and together they span the panel's content box.
    expect(cancel!.top).toBeCloseTo(action!.top, 1);
    expect(cancel!.width).toBeCloseTo(action!.width, 1);
    const pad = parseFloat(computed(popup, "padding-left"));
    const border = parseFloat(computed(popup, "border-left-width"));
    const content = popup.getBoundingClientRect().width - 2 * (pad + border);
    const gap = action!.left - cancel!.right;
    expect(cancel!.width + action!.width + gap).toBeCloseTo(content, 1);
    // Cancel sits at the start — document order is the mechanism, and it is also what hands
    // Cancel the initial focus.
    expect(cancel!.left).toBeLessThan(action!.left);
  });

  it("a long pair of labels stays INSIDE the panel — the box is not negotiable (§25, 2026-08-26)", () => {
    /**
     * The row shipped as `grid-template-columns: 1fr 1fr`, which is `minmax(auto, 1fr)` twice —
     * and a grid item's automatic minimum is its MIN-CONTENT. A `.kui-button` declares
     * `white-space: nowrap` and a control declares no overflow, so each track was floored at a
     * whole label and the row grew past a panel that states a FIXED width and clips.
     *
     * Measured before the fix at the default density: 334px of row inside 270px of content
     * box, the committing button 39px outside the panel with 39px of it cut off — and 113px at
     * comfortable × coarse, where the padding is widest.
     *
     * Read as PAINTED geometry against the panel's own content box, not as `scrollWidth`: what
     * fails is that a person cannot see the button they are being asked to press.
     */
    for (const theme of [{}, { density: "comfortable", pointer: "coarse" }] as ThemeProps[]) {
      const { popup, buttons } = openAlert(theme, {
        body: (
          <>
            <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
            <AlertDialogDescription>Everything goes with it.</AlertDialogDescription>
            <AlertDialogCancel>No, keep my workspace</AlertDialogCancel>
            <AlertDialogAction tone="destructive">Yes, delete everything</AlertDialogAction>
          </>
        ),
      });
      const box = popup.getBoundingClientRect();
      const pad = parseFloat(computed(popup, "padding-left"));
      const border = parseFloat(computed(popup, "border-left-width"));
      for (const button of buttons) {
        const rect = button.getBoundingClientRect();
        expect(rect.left, `${button.textContent} starts outside the panel`).toBeGreaterThanOrEqual(
          box.left + pad + border - 0.5,
        );
        expect(rect.right, `${button.textContent} runs past the panel`).toBeLessThanOrEqual(
          box.right - pad - border + 0.5,
        );
      }
      // Still 50/50 and still one row: the repair may not become "stack them", which is a
      // different design and one nobody has judged.
      expect(buttons[0]!.getBoundingClientRect().width).toBeCloseTo(
        buttons[1]!.getBoundingClientRect().width,
        1,
      );
      expect(buttons[0]!.getBoundingClientRect().top).toBeCloseTo(
        buttons[1]!.getBoundingClientRect().top,
        1,
      );
      // And the label is INSIDE the button it belongs to — moving the clipping from the box to
      // the words would satisfy every assertion above.
      for (const button of buttons) {
        expect(button.scrollWidth, `${button.textContent} overflows its own box`).toBeLessThanOrEqual(
          button.clientWidth + 1,
        );
      }
    }
  });

  it("and the word that cannot break yields too", () => {
    // The fixture lesson this repo has paid for: a multi-word label breaks at a space whether
    // or not anything was fixed, so the harder case is the one that says whether the repair is
    // total. `overflow-wrap: anywhere` is the declaration under test.
    const { popup, buttons } = openAlert({}, {
      body: (
        <>
          <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
          <AlertDialogDescription>Everything goes with it.</AlertDialogDescription>
          <AlertDialogCancel>Keepmyentireworkspaceplease</AlertDialogCancel>
          <AlertDialogAction tone="destructive">Deleteabsolutelyeverything</AlertDialogAction>
        </>
      ),
    });
    const box = popup.getBoundingClientRect();
    const pad = parseFloat(computed(popup, "padding-left"));
    const border = parseFloat(computed(popup, "border-left-width"));
    for (const button of buttons) {
      expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(box.right - pad - border + 0.5);
      expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth + 1);
    }
  });

  it("a lone action spans the whole row — the acknowledgement alert", () => {
    const { popup, buttons } = openAlert({}, {
      body: (
        <>
          <AlertDialogTitle>Session expired</AlertDialogTitle>
          <AlertDialogDescription>Sign in again to continue.</AlertDialogDescription>
          <AlertDialogAction>OK</AlertDialogAction>
        </>
      ),
    });
    expect(buttons.length).toBe(1);
    const pad = parseFloat(computed(popup, "padding-left"));
    const border = parseFloat(computed(popup, "border-left-width"));
    expect(buttons[0]!.getBoundingClientRect().width).toBeCloseTo(
      popup.getBoundingClientRect().width - 2 * (pad + border),
      1,
    );
  });

  it("the actions stand off from the text further than the text stands from itself", () => {
    // §15's composed steps: title↔description is the tight pair, description↔actions the
    // section break. Measured as distances, not read off the declarations.
    const { popup, buttons } = openAlert({});
    const title = document.getElementById(popup.getAttribute("aria-labelledby")!)!;
    const description = document.getElementById(popup.getAttribute("aria-describedby")!)!;
    const textGap = description.getBoundingClientRect().top - title.getBoundingClientRect().bottom;
    const actionGap = buttons[0]!.getBoundingClientRect().top - description.getBoundingClientRect().bottom;
    expect(actionGap).toBeGreaterThan(textGap);
  });
});

/* ── Motion: the materialization (§8, §25 — moved here 2026-08-16 with the split) ─────────
   Built as the dialog's entry, judged to be the ALERT's gesture (LOG): an arrival — the box
   BECOMES on the spring, presence is paint, the content is one molten unit printing as the
   box lands, the scrim is pure signal, and the exit dissolves. The content print is the
   part the split makes legal: the system animates content HERE because the content is its
   own. These laws moved with the recipe verbatim, re-targeted at the alert's classes. */
describe("the panel materializes (§25)", () => {
  const curveOn = (el: HTMLElement, name: string) =>
    getComputedStyle(el).getPropertyValue(name).trim();
  const samples = (curve: string) =>
    curve
      .slice(curve.indexOf("(") + 1, curve.lastIndexOf(")"))
      .split(",")
      .map((stop) => stop.trim().split(/\s+/)[0]!);
  const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  /** Open by CLICK — the path that transitions — and hand back the flying popup. */
  async function openByClick() {
    render(
      <Theme>
        <AlertDialog>
          <AlertDialogTrigger render={<Button>Open</Button>} />
          <AlertDialogContent>
            <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </Theme>,
    );
    inMotion();
    await userEvent.click(document.querySelector<HTMLElement>(".kui-button")!);
    const popup = document.querySelector<HTMLElement>(".kui-alert-popup");
    if (!popup) throw new Error("the panel never mounted");
    return popup;
  }

  it("the entry is a BECOMING: a circle of surface at the center, unpainted, content molten — and the clocks split (§8)", async () => {
    // A SYNC mount, not the click helper: the entry is ours now (the runner in system/floating.tsx
    // plays per popup birth, defaultOpen included — unlike Base UI's own stamps), and the
    // pose lives exactly one frame, so only a synchronous read can land on it.
    render(
      <Theme>
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </Theme>,
    );
    inMotion();
    const popup = document.querySelector<HTMLElement>(".kui-alert-popup");
    if (!popup) throw new Error("the panel never mounted");
    // Flush the runner's microtask (it measures after the commit's layout effects); the
    // pose then holds until the next frame, which is where every read below lands.
    await new Promise((resolve) => queueMicrotask(() => resolve(null)));
    // The first readable frames hold the pose: the BOX ITSELF is a circle — seed wide,
    // seed tall, half-seed corner (a clip was tried and judged out: a window inside the
    // rectangle flattens against its edges instead of being the box) — centered where the
    // viewport's auto margins hold it, unpainted, content molten.
    const seedPx = parseFloat(tokenOn(popup, "--overlay-seed"));
    expect(seedPx, "the designed diameter must exist").toBeGreaterThan(0);
    expect(popup.hasAttribute("data-seed"), "the read must land on the pose").toBe(true);
    const pose = popup.getBoundingClientRect();
    expect(pose.width, "the box is the circle").toBeCloseTo(seedPx, 0);
    expect(pose.height, "in both axes").toBeCloseTo(seedPx, 0);
    expect(computed(popup, "border-top-left-radius"), "and round — by shape, not by frame").toBe("50%");
    expect(pose.left + pose.width / 2, "at the viewport's center").toBeCloseTo(window.innerWidth / 2, 0);
    // The ORIGIN: born a lift below its resting place, closed as the box unfurls — the
    // dialog's answer to "where did this come from".
    const [, lifted] = computed(popup, "translate").split(" ").map(parseFloat);
    expect(lifted ?? 0, "born below its resting place").toBeGreaterThan(0);
    expect(parseFloat(computed(popup, "opacity")), "a panel with no source fades in").toBeLessThan(0.5);
    // The flight targets the MEASURED card, and the measurement exists.
    expect(parseFloat(popup.style.getPropertyValue("--kui-fly-w")), "measured for the flight").toBeGreaterThan(seedPx);
    const title = popup.querySelector<HTMLElement>(":scope > *")!;
    expect(title.classList.contains("kui-overlay-body"), "the held unit is the body").toBe(true);
    expect(computed(title, "filter"), "the content arrives molten").toMatch(/^blur\(/);
    expect(parseFloat(computed(title, "opacity")), "and empty").toBeLessThan(0.5);
    // The print is DELAYED: the content lands after the box, never with it.
    const childDelay = computed(title, "transition-delay").split(",").map((d) => parseFloat(d));
    expect(Math.max(...childDelay), "the print waits for the box").toBeGreaterThan(0);
    // The two clocks — read un-seeded, because the pose pins `transition: none`: the box
    // channels ride the baked spring, opacity eases (a box on a bezier is a slideshow,
    // paint on a spring wobbles).
    const flightLists = () => {
      const listed = computed(popup, "transition-property").split(",").map((p) => p.trim());
      const easings = computed(popup, "transition-timing-function").split(/,(?![^(]*\))/);
      return { listed, easings };
    };
    await frame(); // the runner releases the seed on the next frame — the flight's own lists apply
    const { listed, easings } = flightLists();
    const spring = curveOn(popup, "--motion-spring-elastic");
    expect(spring.startsWith("linear("), "the spring token is a baked curve").toBe(true);
    for (const channel of ["inline-size", "block-size", "border-radius", "translate"]) {
      expect(samples(easings[listed.indexOf(channel)]!.trim()), `${channel} must ride the spring`).toEqual(samples(spring));
    }
    expect(easings[listed.indexOf("opacity")]!, "paint has no mass").not.toContain("linear(");
    // ONE event: every channel departs with the fade — no hold, no lingering shape
    // (2026-08-16).
    const geometryDelays = computed(popup, "transition-delay").split(",").map((d) => parseFloat(d));
    expect(geometryDelays[listed.indexOf("block-size")], "the growth departs with the fade").toBe(0);
    expect(geometryDelays[listed.indexOf("opacity")], "which begins at once").toBe(0);
    // The scrim is SIGNAL: easing up alongside, never sprung.
    const scrim = document.querySelector<HTMLElement>(".kui-alert-backdrop")!;
    expect(computed(scrim, "transition-timing-function")).not.toContain("linear(");
    expect(computed(scrim, "transition-property")).toContain("opacity");
    // And it actually GROWS — declared is not the same as free (the menu suite's lesson).
    const deadline = performance.now() + 2000;
    let grew = false;
    while (performance.now() < deadline && !grew) {
      await frame();
      grew = popup.getBoundingClientRect().width > seedPx * 1.5;
    }
    expect(grew, "the box never grew").toBe(true);
  });

  it("the exit dissolves — the box holds its size, settles a hair, and leaves as one (§24)", async () => {
    const popup = await openByClick();
    // LANDED first (2026-08-20, CI: "the content dissolves with its box: expected 'blur(6px)'
    // to be 'none'"): the click resolves with the materialization still running, so on a
    // stalled runner the hand stamp below landed on a panel still POSED molten — and a pose is
    // a declared VALUE, not a transition, so the pins below cannot strip it. An exit is read
    // off a panel that has arrived, which is also the gesture this law models.
    await until(() => !popup.hasAttribute("data-seed") && !popup.hasAttribute("data-unfurling"), 3000);
    expect(popup.hasAttribute("data-unfurling"), "the premise: the entry has landed").toBe(false);
    // The ending recipe, read as computed values under the hand-applied stamp (the menu
    // exit law's pattern): lists first with live clocks, then pinned for the pose.
    popup.setAttribute("data-ending-style", "");
    const listed = computed(popup, "transition-property").split(",").map((p) => p.trim());
    const easings = computed(popup, "transition-timing-function").split(/,(?![^(]*\))/);
    const stiff = curveOn(popup, "--motion-spring-stiff");
    expect(samples(easings[listed.indexOf("scale")]!.trim()), "the settle decelerates — an exit never bounces").toEqual(samples(stiff));
    expect(easings[listed.indexOf("opacity")]!, "the dissolve eases").not.toContain("linear(");
    // Pinned — popup AND child, because the child's own print transition is still mid-delay
    // this soon after the open, and an unpinned read reports the value in flight.
    const title = popup.querySelector<HTMLElement>(":scope > *")!;
    popup.style.setProperty("transition", "none", "important");
    title.style.setProperty("transition", "none", "important");
    expect(computed(popup, "opacity")).toBe("0");
    // 0.99, not the entry's 0.96 reversed: leaving is never the entry reversed — the viewer
    // is already looking at the thing they dismissed.
    expect(computed(popup, "scale")).toBe("0.99");
    // The content leaves ABOARD the box: no ending hold puts the children back to molten.
    expect(computed(title, "filter"), "the content dissolves with its box").toBe("none");
  });

  it("a reopen that lands mid-dissolve is CAUGHT, never replayed (§24, 2026-08-20)", async () => {
    /**
     * The menu's finding, one family over, and the reversal with it (measured there, 2026-08-20):
     * a reopen lands on a popup still mounted mid-exit — no fresh mount, no starting stamp —
     * and from 2026-08-16 the runner replayed the whole materialization on that path. The
     * panel has never left, so replaying it teleports the box back to a seed it is nowhere
     * near and forms it again. What a revoked dismissal owes is the dismissal being taken
     * back: the panel recovers from wherever the dissolve reached, on the paint clock.
     *
     * An overlay's box barely travels — it is 3% of scale and a blur, not the menu's unfurl —
     * so the claim here is the MECHANISM rather than a jump in pixels: no pose, no
     * measurement, and the panel returns to full opacity from where it was caught. Falsified
     * against the pre-fix runner (restore the `revoked` branch in floating.tsx).
     */
    let setOpen!: (v: boolean) => void;
    function Host() {
      const [open, set] = React.useState(false);
      setOpen = set;
      return (
        <Theme>
          <AlertDialog open={open} onOpenChange={set}>
            <AlertDialogContent>
              <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </Theme>
      );
    }
    render(<Host />);
    inMotion();
    flushSync(() => setOpen(true));
    const popup = document.querySelector<HTMLElement>(".kui-alert-popup")!;
    // A STATE, not a duration (`until`, 2026-08-17): a flat 1000ms assumes the runner gives
    // the animation as much progress as the wall clock gives the timer, and a loaded one does
    // not — the sibling law measured `blur(0.093377px)` where it expected `none`.
    await until(() => !popup.hasAttribute("data-unfurling"));
    // Asserted, not assumed (2026-08-16 audit): a premise that is only a comment is a premise
    // the law cannot be failed by.
    expect(popup.hasAttribute("data-unfurling"), "the premise: the first flight has landed").toBe(
      false,
    );
    const settled = popup.getBoundingClientRect();

    // Far enough in that the panel is visibly half-gone — the state a replay would discard.
    // HELD there, not polled for (`catchDissolve`, 2026-08-20): the menu's twin failed this
    // premise on CI when a stalled runner outlived the ~200ms fade, and this law is the same
    // gesture one family over.
    const seized = catchDissolve(popup);
    flushSync(() => setOpen(false));
    const { box: dissolving, fading, release } = await seized;
    expect(popup.isConnected, "the premise: the exit is still running").toBe(true);
    expect(fading, "the premise: the panel is visibly mid-dissolve").toBeLessThan(0.9);

    flushSync(() => setOpen(true)); // the quick reopen
    // The borrowed clocks go back the moment the gesture is made: a paused transition keeps
    // rendering its held value, and a panel whose exit was seized can sit at `scale: 0.99`
    // for good — measured on CI as a recovery 3.1px narrow, which is 1% of its 311px box.
    release();
    /**
     * Anchored on the REVOCATION, not on a frame (2026-08-20). The replay this law forbids is
     * triggered by the ending stamp leaving, and how long Base UI takes to remove it is a
     * property of the machine — read one rAF after the click instead and a sabotaged runner
     * passes, because on a quick pass the stamp has not left yet and there is nothing to see.
     * Waiting for the announcement puts the read after the very microtask that would have
     * posed the panel, which is what makes the claim about the mechanism rather than the load.
     */
    await until(() => !popup.hasAttribute("data-ending-style"), 3000);
    expect(popup.isConnected, "the premise: this is the panel that was dissolving").toBe(true);
    expect(popup.hasAttribute("data-ending-style"), "the premise: the dismissal was revoked").toBe(
      false,
    );

    // 1. No flight was begun at all — and the measurement that only serves one was not taken.
    expect(popup.hasAttribute("data-seed"), "no pose: a panel that never left is not re-formed").toBe(
      false,
    );
    expect(popup.hasAttribute("data-unfurling"), "and no flight arrangement").toBe(false);
    expect(popup.style.getPropertyValue("--kui-fly-w"), "not even the measurement").toBe("");

    // 2. The box is caught where it is rather than thrown back to a seed.
    const next = popup.getBoundingClientRect();
    expect(
      Math.abs(next.width - dissolving.width),
      `the reopen must catch the box where it is: ${Math.round(dissolving.width)}px -> ${Math.round(next.width)}px`,
    ).toBeLessThan(20);

    // 3. And the dissolve is revoked, not merely halted: it comes back to full.
    //
    //    WAITED FOR ARRIVAL, NOT FOR STILLNESS (2026-08-20, and this is the second correction
    //    of this passage). "Three consecutive still frames" was meant to outlast the scale
    //    spring, and it cannot: stillness does not distinguish a box that has ARRIVED from one
    //    that is STUCK, and a seized exit left paused is perfectly still at 0.99 forever. CI
    //    read exactly that twice — 3.171875 and 3.109375 against a 2px bound, both of them 1%
    //    of the panel. The box's own destination is the thing being waited for, so it is what
    //    the wait names; a recovery that never arrives expires the deadline into the same
    //    assertion, with the honest number in the message.
    await until(() => parseFloat(computed(popup, "opacity")) === 1, 3000);
    expect(computed(popup, "opacity"), "the dismissal is taken back").toBe("1");
    await until(() => Math.abs(popup.getBoundingClientRect().width - settled.width) < 2, 3000);
    expect(
      Math.abs(popup.getBoundingClientRect().width - settled.width),
      "and it is the box it was already occupying",
    ).toBeLessThan(2);
  });

  it("suppression is total: under reduced motion the panel is simply there (§8)", async () => {
    /**
     * Rewritten 2026-08-16: five of its six assertions could not fail. They read pose values
     * — the panel's scale and opacity, the content's filter — that are only ever set by the
     * runner's `[data-seed]`, which the runner refuses to stamp under this setting, so every
     * one of them was reading a panel that was simply at rest and would have been at rest
     * whatever the guard said. What the guard genuinely owes is asserted instead: no clock
     * anywhere, and no pose and no MEASUREMENT taken (§8's suppression is total — including
     * the work that only serves the animation).
     */
    await asksForStillness();
    const popup = await openByClick();
    const body = popup.querySelector<HTMLElement>(".kui-overlay-body")!;
    const scrim = document.querySelector<HTMLElement>(".kui-alert-backdrop")!;
    for (const el of [popup, body, scrim]) {
      expect(
        computed(el, "transition-duration").split(",").every((d) => parseFloat(d) === 0),
        "no clock survives",
      ).toBe(true);
    }
    expect(popup.hasAttribute("data-seed"), "no pose").toBe(false);
    expect(popup.hasAttribute("data-unfurling"), "no flight arrangement").toBe(false);
    expect(popup.style.getPropertyValue("--kui-fly-w"), "not even the measurement").toBe("");
    // The panel is simply there, which is the point of the setting.
    expect(computed(popup, "opacity")).toBe("1");
    expect(computed(body, "filter")).toBe("none");
  });
});


/* ── What the call site can say to an alert (2026-08-21) ──────────────────────────────── */

describe("a leaving alert is not a target (§25, 2026-08-22)", () => {
  it("the page underneath answers the hit test while the panel dissolves", async () => {
    /**
     * A dismissal mid-entry leaves the ENTRY's transitions running: the exit restates those
     * channels with unchanged values, so nothing retargets and each runs to its own length —
     * up to `--overlay-spread`'s 800ms. Base UI unmounts a closing popup when every animation's
     * `finished` promise settles and `getAnimations()` counts those keep-alives, so the
     * mechanism added to stop a mid-flight snap is also the unmount gate. Measured: invisible
     * at ~158ms, still in the document at 686ms, and for that whole window the scrim covered
     * the viewport and answered the hit test — `elementFromPoint` over an ordinary page corner
     * returned `DIV.kui-alert-backdrop`, so a real click did nothing. "I closed the alert and
     * the app was frozen for half a second." An alert refuses outside-press, so there was not
     * even a dismissal to show for it.
     *
     * The lifetime is deliberately NOT what this law is about — shortening the restated
     * channels to the exit's clock was built and measured as a no-op, because no value changes
     * on them at the exit. What a leaving panel owes is that it stops being a target, and that
     * is what is read here: the browser's own hit test, at a point over a page control, while
     * the panel is provably still mounted.
     */
    inMotion();
    const host = render(
      <Theme>
        <div>
          <button
            id="page"
            /* BOTTOM-left, deliberately: a fixed control at the top-left sits under the
               trigger, which is positioned and later in the DOM, so the hit test answered the
               trigger and the law read a defect that was not there. The point has to belong to
               the page and to nothing else. */
            style={{ position: "fixed", left: 4, bottom: 4, width: 80, height: 40 }}
          >
            page
          </button>
          <AlertDialog>
            <AlertDialogTrigger render={<Button>Delete</Button>} />
            <AlertDialogContent>
              <AlertDialogTitle>Delete this project?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Theme>,
    );
    const page = host.querySelector<HTMLElement>("#page")!;
    const spot = page.getBoundingClientRect();
    const at = { x: Math.round(spot.left + spot.width / 2), y: Math.round(spot.top + spot.height / 2) };

    await userEvent.click(host.querySelector<HTMLElement>(".kui-button")!);
    await until(() => !!document.querySelector(".kui-alert-popup"));
    // THE PREMISE, and it is what makes the reading below mean anything: while the alert is
    // OPEN this point belongs to the scrim. A law whose "before" and "after" agree is measuring
    // a page nothing ever covered.
    const covering = document.elementFromPoint(at.x, at.y) as HTMLElement | null;
    expect(
      covering !== null && covering !== page && !page.contains(covering),
      `while OPEN this point must belong to the alert, or the fixture cannot show the defect — it belongs to ${covering?.className || covering?.id || covering?.tagName}`,
    ).toBe(true);

    // Dismissed MID-ENTRY, which is the case that produces the long tail.
    await userEvent.keyboard("{Escape}");
    const popup = document.querySelector<HTMLElement>(".kui-alert-popup")!;
    const scrim = document.querySelector<HTMLElement>(".kui-alert-backdrop")!;
    const gone = await until(() => parseFloat(getComputedStyle(scrim).opacity) === 0);
    expect(gone, "the scrim never finished fading, so there is no window to read").toBe(true);

    // Still mounted — otherwise the assertion below is satisfied by the node having left, which
    // is a different claim and the one that was already true.
    expect(popup.isConnected, "the panel unmounted before the window this law is about").toBe(true);
    const hit = document.elementFromPoint(at.x, at.y) as HTMLElement | null;
    expect(
      hit === page || page.contains(hit),
      `an invisible leaving alert still owns the page: the hit landed on ${hit?.className || hit?.id || hit?.tagName}`,
    ).toBe(true);
  });
});

describe("what the call site can say to an alert", () => {
  const lastPopup = () => {
    const ps = document.querySelectorAll<HTMLElement>(".kui-alert-popup");
    const p = ps[ps.length - 1];
    if (!p) throw new Error("the panel never mounted — every law below would assert nothing");
    return p;
  };

  /**
   * WAITS FOR THE WARNING, never a flat sleep (2026-08-21, CI on main: "expected +0 to be 1").
   * A dev warning is emitted from an effect after the commit, and 60ms of wall clock on a
   * stalled runner is not "the effect has run" — it is a bet. Dialog's twin of this helper was
   * already written this way; this one had kept the sleep, which is how one file's lesson stops
   * at the file it was learned in. `want` is what makes the wait a wait: a law expecting ZERO
   * warnings has nothing to wait FOR, so it spends the full window and then reports honestly.
   */
  async function warnings(needle: string, want: number, run: () => void): Promise<number> {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const count = () =>
      spy.mock.calls.map((c) => String(c[0])).filter((m) => m.includes(needle)).length;
    try {
      run();
      settleAll();
      for (let waited = 0; waited < 2000; waited += 16) {
        if (want > 0 && count() >= want) break;
        await new Promise((r) => setTimeout(r, 16));
      }
      return count();
    } finally {
      spy.mockRestore();
    }
  }

  it("ordinary props reach the panel — and the system's identity still wins", () => {
    // Every hole Dialog was measured to have on 2026-08-21, this component had too: four
    // declared props and everything else dropped in silence. The two were built the same week
    // by the same author, which is exactly when a defect gets copied rather than inherited.
    render(
      <Theme>
        <AlertDialog defaultOpen>
          <AlertDialogContent aria-label="Confirm" id="confirm-panel" data-testid="panel" data-size="1">
            <AlertDialogDescription>No title here.</AlertDialogDescription>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </Theme>,
    );
    settleAll();
    const p = lastPopup();
    expect(p.getAttribute("aria-label")).toBe("Confirm");
    expect(p.id).toBe("confirm-panel");
    expect(p.getAttribute("data-testid")).toBe("panel");
    expect(p.getAttribute("data-size"), "the index stays the system's").toBe("2");
  });

  it("an alert with no name says so in dev — and names itself in the warning", async () => {
    // `role="alertdialog"` with nothing to announce, measured. The warning names the COMPONENT
    // it fired on, because a shared hook that always said "Dialog" would send an alert's author
    // to the wrong file — the promotion's own risk, and the reason the name is a parameter.
    // The TEXT is read as well as the count, so this one keeps its own spy rather than going
    // through the helper — but it waits the same way the helper does, because the sleep it
    // used to keep is exactly what CI caught ("expected +0 to be 1").
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const said = () =>
      spy.mock.calls.map((c) => String(c[0])).filter((m) => m.includes("accessible name"));
    render(
      <Theme>
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogDescription>No title.</AlertDialogDescription>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </Theme>,
    );
    settleAll();
    await until(() => said().length >= 1, 2000);
    const heard = said();
    spy.mockRestore();
    expect(heard.length).toBe(1);
    expect(heard[0], "it must name AlertDialog, not Dialog").toContain("<AlertDialog>");
    expect(heard[0], "and quote the role it actually has").toContain("alertdialog");

    // `want: 0` — a law expecting silence has nothing to wait for, so it spends the full
    // window and reports what it heard, which is the honest shape for a negative claim.
    const titled = await warnings("accessible name", 0, () =>
      render(
        <Theme>
          <AlertDialog defaultOpen>
            <AlertDialogContent>
              <AlertDialogTitle>Delete it?</AlertDialogTitle>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </Theme>,
      ),
    );
    expect(titled, "a title names it — silence").toBe(0);
  });

  it("says WHY it is closing, and an alert may refuse", async () => {
    // The alert refuses outside-press dismissal by design, so its reachable reasons are fewer
    // than a dialog's — but the two share ONE union because Base UI declares one
    // (`AlertDialogRootChangeEventReason` IS `DialogRoot.ChangeEventReason`). The absence is at
    // runtime, not in the type, and a law that asserted a shorter union would be asserting
    // something Base UI does not say.
    const seen: string[] = [];
    render(
      <Theme>
        <AlertDialog
          defaultOpen
          onOpenChange={(open: boolean, details: OverlayOpenChangeDetails) => {
            seen.push(`${open}:${details.reason}`);
            if (details.reason === "escape-key") details.cancel();
          }}
        >
          <AlertDialogContent>
            <AlertDialogTitle>Delete it?</AlertDialogTitle>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </Theme>,
    );
    settleAll();

    await userEvent.keyboard("{Escape}");
    expect(seen[0], "Escape is reported as Escape").toBe("false:escape-key");
    expect(
      document.querySelectorAll(".kui-alert-popup").length,
      "…and cancel() refused it",
    ).toBeGreaterThan(0);

    const cancel = lastPopup().querySelector<HTMLElement>("button");
    if (!cancel) throw new Error("the cancel button never mounted");
    await userEvent.click(cancel);
    expect(seen[1], "a Cancel press is a close press").toBe("false:close-press");
    // UNMOUNTED is a STATE, not the statement after the click (2026-08-21, CI on main). A
    // popup that is not refused leaves on its exit's own clock — Base UI unmounts it when the
    // animations' `finished` promises settle — so reading the count here asserts the close is
    // INSTANTANEOUS, which is a claim about the machine. A close that is genuinely refused
    // never reaches zero and expires the deadline into the same assertion.
    await until(() => document.querySelectorAll(".kui-alert-popup").length === 0, 3000);
    expect(document.querySelectorAll(".kui-alert-popup").length, "and it was not refused").toBe(0);
  });
});

/* ── One ladder, two members (§15, §24, §25 — 2026-08-21) ─────────────────────────────── */

describe("an alert and a dialog at the same index are the same typography", () => {
  it("the title and the description agree at every size", () => {
    // Kushagra, closing §24's open question: "a small dialog should have a smaller title than
    // a large one". The steps promoted to one home the same hour, so the claim to hold is not
    // "Dialog now has a map" — it is that there is only ONE map, which is what a law reading
    // both mounted components can say and a law reading either one alone cannot.
    for (const size of SIZES) {
      const { popup } = openAlert({}, { size });
      const alertTitle = document.getElementById(popup.getAttribute("aria-labelledby")!);
      const alertDesc = document.getElementById(popup.getAttribute("aria-describedby")!);
      if (!alertTitle || !alertDesc) throw new Error("the alert's parts never wired");

      render(
        <Theme>
          <Dialog defaultOpen size={size}>
            <DialogContent>
              <DialogTitle>Delete workspace</DialogTitle>
              <DialogDescription>This cannot be undone.</DialogDescription>
            </DialogContent>
          </Dialog>
        </Theme>,
      );
      settleAll();
      const popups = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
      const dialog = popups[popups.length - 1];
      if (!dialog) throw new Error("the dialog never mounted");
      const dialogTitle = document.getElementById(dialog.getAttribute("aria-labelledby")!);
      const dialogDesc = document.getElementById(dialog.getAttribute("aria-describedby")!);
      if (!dialogTitle || !dialogDesc) throw new Error("the dialog's parts never wired");

      expect(computed(dialogTitle, "font-size"), `size ${size}: one title ladder`).toBe(
        computed(alertTitle, "font-size"),
      );
      expect(computed(dialogDesc, "font-size"), `size ${size}: one description ladder`).toBe(
        computed(alertDesc, "font-size"),
      );
    }
  });

  it("a small dialog really does carry a smaller title — and a smaller line under it", () => {
    // The vacuity guard, and it is not optional: everything above would pass with a map frozen
    // at one value, because two frozen components still agree. The ENDS must differ.
    const titleAt = (size: Size) => {
      render(
        <Theme>
          <Dialog defaultOpen size={size}>
            <DialogContent>
              <DialogTitle>Delete workspace</DialogTitle>
              <DialogDescription>This cannot be undone.</DialogDescription>
            </DialogContent>
          </Dialog>
        </Theme>,
      );
      settleAll();
      const popups = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
      const p = popups[popups.length - 1]!;
      return {
        title: document.getElementById(p.getAttribute("aria-labelledby")!)!,
        desc: document.getElementById(p.getAttribute("aria-describedby")!)!,
      };
    };
    const small = titleAt("1");
    const large = titleAt("4");
    expect(parseFloat(computed(large.title, "font-size"))).toBeGreaterThan(
      parseFloat(computed(small.title, "font-size")),
    );
    expect(parseFloat(computed(large.desc, "font-size"))).toBeGreaterThan(
      parseFloat(computed(small.desc, "font-size")),
    );
  });

  it("and size 3 is still the confirm card — the anchor nothing was allowed to move", () => {
    // The change moved every index EXCEPT the one that had been judged, and this is what says
    // so. Asserted against a mounted Heading and Text at §15's composition steps, never
    // against a number.
    render(
      <Theme>
        <Dialog defaultOpen size="3">
          <DialogContent>
            <DialogTitle>Delete workspace</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogContent>
        </Dialog>
        <Heading size="6" data-testid="card-title">x</Heading>
        <Text size="3" data-testid="card-body">y</Text>
      </Theme>,
    );
    settleAll();
    const popups = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
    const p = popups[popups.length - 1]!;
    const title = document.getElementById(p.getAttribute("aria-labelledby")!)!;
    const desc = document.getElementById(p.getAttribute("aria-describedby")!)!;
    const cardTitle = document.querySelector<HTMLElement>("[data-testid='card-title']")!;
    const cardBody = document.querySelector<HTMLElement>("[data-testid='card-body']")!;
    expect(computed(title, "font-size")).toBe(computed(cardTitle, "font-size"));
    expect(computed(desc, "font-size")).toBe(computed(cardBody, "font-size"));
  });
});
