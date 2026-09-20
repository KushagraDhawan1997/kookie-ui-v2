/**
 * AlertDialog's mounted laws (§10, §20, §25) — the 2026-08-03 standard: computed values
 * through a mounted <Theme>.
 *
 * This file carries the §20 AGREEMENT LAW every portalling component owes, and then the
 * facts that make an alert an alert rather than a small dialog: the ROLE and its behavior
 * (no outside-press dismissal, focus on the safe action), the FIXED width, the size index
 * reaching the TYPE (legal here because the content is the system's own), and the action
 * row's owned layout. The family machinery — scrim tokens, the overlay corner band — is
 * law-tested where it lives; what is asserted here is membership plus the alert's own.
 */
import * as React from "react";
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
  computed,
  tokenOn,
  probeIn,
  until,
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
    await userEvent.click(dialog.parentElement!, { position: { x: 8, y: 8 } });
    // A STATE, not a sleep (`until`, 2026-08-17): Base UI unmounts a dismissed dialog a frame
    // after the press, and a stalled runner outlives a fixed sleep — the focus law next door
    // failed CI's first PR run exactly this way.
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
  /** The panel's content box, the one width the row is laid out in. */
  const contentBox = (popup: HTMLElement) => {
    const box = popup.getBoundingClientRect();
    const inset =
      parseFloat(computed(popup, "padding-left")) + parseFloat(computed(popup, "border-left-width"));
    return { left: box.left + inset, right: box.right - inset, width: box.width - 2 * inset };
  };
  /** A label on ONE line: the button is exactly as tall as its control height. */
  const oneLine = (button: HTMLElement) =>
    expect(
      button.getBoundingClientRect().height,
      `"${button.textContent}" broke onto a second line`,
    ).toBeCloseTo(parseFloat(computed(button, "min-block-size")) || parseFloat(computed(button, "height")), 0);

  it("two short labels sit side by side, fill the row, Cancel at the start", () => {
    const { popup, buttons } = openAlert({});
    const [cancel, action] = buttons.map((b) => b.getBoundingClientRect());
    expect(cancel!.top).toBeCloseTo(action!.top, 1);
    const gap = action!.left - cancel!.right;
    expect(cancel!.width + action!.width + gap).toBeCloseTo(contentBox(popup).width, 1);
    // Cancel sits at the start — the reversed row's `order` undoes the reversal side by side,
    // and document order is what hands Cancel the initial focus.
    expect(cancel!.left).toBeLessThan(action!.left);
    for (const button of buttons) oneLine(button);
  });

  it("ONE label that does not fit stacks BOTH, full width, Action on top — and no label wraps (2026-09-19)", () => {
    /**
     * The row shipped as a 50/50 grid whose labels broke onto a second line (2026-08-26). A
     * label never wraps now; the row wraps instead (iOS's alert). The fixture has ONE long label
     * and one short one on purpose: two long labels stack under a design that stacks only the
     * long one, and a grid with wrapping labels puts both on one row at any length, so only
     * this pair separates "the row decides" from either wrong answer.
     *
     * Falsified: restoring the grid fails the stack; dropping `row-reverse` fails the order;
     * `white-space: normal` on the actions fails one-line.
     */
    for (const theme of [{}, { density: "comfortable", pointer: "coarse" }] as ThemeProps[]) {
      const { popup, buttons } = openAlert(theme, {
        body: (
          <>
            <AlertDialogTitle>Stay signed in?</AlertDialogTitle>
            <AlertDialogDescription>Your session ends in two minutes.</AlertDialogDescription>
            <AlertDialogCancel>Sign out</AlertDialogCancel>
            <AlertDialogAction>Stay signed in for another hour</AlertDialogAction>
          </>
        ),
      });
      const content = contentBox(popup);
      const [cancel, action] = buttons.map((b) => b.getBoundingClientRect());
      expect(action!.bottom, "Action is not above Cancel").toBeLessThanOrEqual(cancel!.top + 0.5);
      for (const rect of [cancel!, action!]) {
        expect(rect.left).toBeCloseTo(content.left, 1);
        expect(rect.width).toBeCloseTo(content.width, 1);
      }
      for (const button of buttons) oneLine(button);
      // Two stacked actions keep the ordinary row gap — the section distance above the actions
      // belongs to the text, never to a button.
      const title = document.getElementById(popup.getAttribute("aria-labelledby")!)!;
      const description = document.getElementById(popup.getAttribute("aria-describedby")!)!;
      const textGap = description.getBoundingClientRect().top - title.getBoundingClientRect().bottom;
      expect(cancel!.top - action!.bottom).toBeCloseTo(textGap, 0);
    }
  });

  it("a word too long for the whole panel still leaves no button outside it", () => {
    // The unbreakable label is caller error the alert cannot fix without wrapping it, which it
    // refuses; what it still owes is its box — a button past the panel is one nobody can see.
    const { popup, buttons } = openAlert({}, {
      body: (
        <>
          <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
          <AlertDialogDescription>Everything goes with it.</AlertDialogDescription>
          <AlertDialogCancel>Keepmyentireworkspacepleaseandthankyouverymuch</AlertDialogCancel>
          <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
        </>
      ),
    });
    const content = contentBox(popup);
    for (const button of buttons) {
      const rect = button.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(content.left - 0.5);
      expect(rect.right).toBeLessThanOrEqual(content.right + 0.5);
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

/* ── What the call site can say to an alert (2026-08-21) ──────────────────────────────── */

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
    // UNMOUNTED is a STATE, not the statement after the click (2026-08-21, CI on main): Base
    // UI unmounts a closing popup a frame after the press, so the law waits for it. A close
    // that is genuinely refused never reaches zero and expires the deadline into the same
    // assertion.
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
