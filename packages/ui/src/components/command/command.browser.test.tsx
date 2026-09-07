/**
 * Command's laws, mounted (§44).
 *
 * The load-bearing ones are the two claims the component exists to make: it IS a Dialog (so
 * every overlay guarantee arrives by membership rather than by re-implementation), and the
 * keyboard model is the package's while the list stays the app's. The rest reads the one
 * arrangement this component actually states — since 2026-09-05 a transparent COLUMN holding two
 * separate panes, a floating field anchored to the top and a results pane under it, with an
 * interval between them. The field's stability is what that shape is for, and it is the one
 * claim in this file that no earlier arrangement could make.
 */
import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { APPEARANCES, asksForStillness, catchDissolve, computed, inMotion, render, settleAll, until, within } from "../../test/browser.tsx";
import { VIEWPORT } from "../../test/viewport.ts";
import { Theme } from "../../theme/theme.tsx";
import { Dialog, DialogContent, DialogTitle } from "../dialog/dialog.tsx";
import { Box } from "../box/box.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/menu.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import {
  Command,
  CommandCollection,
  CommandContent,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTrigger,
  ROW_STEP,
} from "./command.tsx";

type Cmd = { value: string; label: string };
const ACTIONS: Cmd[] = [
  { value: "new", label: "New project" },
  { value: "open", label: "Open recent" },
  { value: "rename", label: "Rename workspace" },
];
const SETTINGS: Cmd[] = [
  { value: "appearance", label: "Appearance" },
  { value: "shortcuts", label: "Keyboard shortcuts" },
];
const GROUPS = [
  { value: "Actions", items: ACTIONS },
  { value: "Settings", items: SETTINGS },
];
const FLAT = [...ACTIONS, ...SETTINGS];

/** One open palette, flat, and the elements every law below reads off it. */
function open(opts: { theme?: Record<string, unknown>; size?: "1" | "2" | "3" | "4" } = {}) {
  render(
    <Theme {...(opts.theme ?? {})}>
      <Command items={FLAT} defaultOpen {...(opts.size ? { size: opts.size } : {})}>
        <CommandContent aria-label="Command palette">
          <CommandInput aria-label="Search commands" placeholder="Search commands…" />
          <CommandList>
            {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
          </CommandList>
          <CommandEmpty>No commands match.</CommandEmpty>
        </CommandContent>
      </Command>
    </Theme>,
  );
  // The LAST panel — mounts accumulate within one test (the menu suite's own lesson).
  const popups = document.querySelectorAll<HTMLElement>(".kui-command");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the palette never mounted — every law below would assert nothing");
  settleAll();
  const input = popup.querySelector<HTMLInputElement>(".kui-command-input");
  if (!input) throw new Error("the field never mounted");
  const field = popup.querySelector<HTMLElement>(".kui-command-search");
  if (!field) throw new Error("the field's box never mounted");
  return {
    popup,
    input,
    field,
    /* TWO PANES SINCE 2026-09-05, and `popup` is neither of them: it is the transparent column
       they stand in. A law that reads a pane's own facts asks for one of these. */
    panel: () => popup.querySelector<HTMLElement>(".kui-command-panel"),
    rows: () => [...popup.querySelectorAll<HTMLElement>(".kui-command-item")],
  };
}

/** A palette whose rows are real links — the `render` escape's own shape, and the only one in
    which a row is focusable at all.

    A HASH href, and that is the harness rather than the subject: a real path navigates the test
    iframe out from under the run (measured — "Cannot connect to the iframe"). What these laws read
    is focusability and the ring, and an anchor is focusable by having an href at all. */
function openLinks(opts: { settle?: boolean } = {}) {
  render(
    <Theme>
      <Command items={FLAT} defaultOpen size="2">
        <CommandContent aria-label="Command palette">
          <CommandInput aria-label="Search commands" placeholder="Search commands…" />
          <CommandList>
            {(item: Cmd) => (
              <CommandItem key={item.value} value={item} render={<a href={`#${item.value}`} />}>
                {item.label}
              </CommandItem>
            )}
          </CommandList>
        </CommandContent>
      </Command>
    </Theme>,
  );
  if (opts.settle !== false) settleAll();
  const popups = document.querySelectorAll<HTMLElement>(".kui-command");
  const popup = popups[popups.length - 1]!;
  const input = popup.querySelector<HTMLInputElement>(".kui-command-input");
  if (!input) throw new Error("the field never mounted");
  return { popup, input, rows: () => [...popup.querySelectorAll<HTMLElement>(".kui-command-item")] };
}

/** A palette that has NOT been settled: `settle()` writes `transition: none !important` on every
    element in the popup, which is exactly what the motion laws below are about. */
function unsettled() {
  render(
    <Theme>
      <Command items={FLAT} defaultOpen size="2">
        <CommandContent aria-label="Command palette">
          <CommandInput aria-label="Search commands" />
          <CommandList>
            {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
          </CommandList>
          <CommandEmpty>No commands match.</CommandEmpty>
        </CommandContent>
      </Command>
    </Theme>,
  );
  const popups = document.querySelectorAll<HTMLElement>(".kui-command");
  const popup = popups[popups.length - 1]!;
  const pane = popup.querySelector<HTMLElement>(".kui-command-panel");
  if (!pane) throw new Error("the results pane never mounted");
  return { popup, pane };
}

describe("a palette IS a Dialog, so every overlay guarantee arrives by membership (§44, §24)", () => {
  it("it renders the dialog's own panel and scrim, not a second overlay", () => {
    const { popup } = open();
    expect(popup.classList.contains("kui-dialog-popup")).toBe(true);
    expect(document.querySelectorAll(".kui-dialog-backdrop").length).toBeGreaterThan(0);
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: the RESULTS pane is boxed like a MENU — it hugs rows (2026-09-05)`, () => {
      /* Reversed. It agreed with a plain Dialog until 2026-09-05, and a dialog's box is wrong
         for what this pane holds: 24px of inset and a 64px corner around a list of rows read as
         a document, not a list (Kushagra: "the padding in search results area seems a bit too
         much, this is almost like a menu isnt it"). It is — so it wears `kui-floating-rows`,
         the class the 2026-08-23 Popover split carved out for "what a pane holds", and takes
         the concentric corner and the padding join with it.

         Read against a real Menu at the same index rather than against numbers: the claim is
         that a palette's list is boxed like a menu's, and two literals would agree today.

         AT THE ROWS' INDEX, NOT THE PALETTE'S (2026-09-06). The pane's corner is its rows' corner
         plus its own inset, so a pane whose rows stand a step above the palette is shaped for
         those rows — the menu it must equal is a menu of the same rows. Reading it at the
         palette's index is what this law said until the rows moved, which is the old behaviour
         stated as a guarantee. */
      const { panel } = open({ theme: { appearance }, size: "2" });
      render(
        <Theme appearance={appearance}>
          <Menu defaultOpen size={ROW_STEP["2"]}>
            <MenuTrigger>open</MenuTrigger>
            <MenuContent>
              <MenuItem>Row</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>,
      );
      settleAll();
      const menus = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
      const menu = menus[menus.length - 1]!;
      const results = panel()!;
      expect(computed(results, "border-radius")).toBe(computed(menu, "border-radius"));
      expect(computed(results, "padding-left")).toBe(computed(menu, "padding-left"));
      // The vacuity guard: a menu that padded nothing would make both clauses trivial.
      expect(parseFloat(computed(menu, "padding-left"))).toBeGreaterThan(0);
    });
  }

  it("and the COLUMN between them paints nothing at all — it is not a pane (2026-09-05)", () => {
    /* The other half, and it is the half a corner agreement cannot make: the popup still wears
       `kui-surface kui-overlay kui-dialog-popup`, because what Command wants from Dialog is all
       of its behaviour and none of its box. Every fact that identity carries is stood down here,
       so this reads the four that would show — a fill, a cast, an inset and a corner.

       Against a real dialog rather than against zero, so the law cannot be satisfied by a plain
       dialog that has itself stopped painting. */
    const { popup } = open({ size: "2" });
    render(
      <Theme>
        <Dialog defaultOpen size="2">
          <DialogContent>
            <DialogTitle>Plain</DialogTitle>
          </DialogContent>
        </Dialog>
      </Theme>,
    );
    settleAll();
    const plains = document.querySelectorAll<HTMLElement>(".kui-dialog-popup:not(.kui-command)");
    const plain = plains[plains.length - 1]!;
    expect(parseFloat(computed(plain, "padding-left")), "a plain dialog pads").toBeGreaterThan(0);
    expect(computed(plain, "background-color"), "a plain dialog is filled").not.toBe("rgba(0, 0, 0, 0)");

    expect(computed(popup, "background-color")).toBe("rgba(0, 0, 0, 0)");
    expect(parseFloat(computed(popup, "padding-left"))).toBe(0);
    expect(parseFloat(computed(popup, "border-top-left-radius"))).toBe(0);
    // A stood-down cast is `0 0 0 0 transparent` through the hook, never `none` (§5, §13).
    expect(computed(popup, "box-shadow")).not.toBe(computed(plain, "box-shadow"));

    /* AND THE MATERIAL'S OWN LIGHT, which a fill and a cast do not reach: a pane's ring and
       glint live on its two pseudo-elements (§10's five parts), and on a glass theme they drew
       a lit rectangle around the whole column — the popup's box traced by a lip on a pane that
       is not there. Read as `content`, because that is the fact: the boxes must not exist. */
    for (const pseudo of ["::before", "::after"] as const) {
      expect(
        getComputedStyle(popup, pseudo).content,
        `the column still paints its ${pseudo} — a pane's lip on a thing that is not a pane`,
      ).toBe("none");
    }
  });

  it("the RESULTS pane pads, like every other dialog at the same index (2026-09-04)", () => {
    /* It shipped edge-to-edge, and the argument for that — a lit row reads as a band from wall
       to wall — does not survive the panel it was made about: `--radius-overlay-2` is 40px, so
       the bands at the top and bottom of the list were being eaten by the pane's own corner.

       Read as the AGREEMENT rather than as a number, on both counts. A literal would pass a
       palette that pads by some other inset it invented, and it would go stale the day the
       overlay band moves; what is being claimed is that this pane is a dialog and pads like one.
       Falsified by putting `padding: 0` back. */
    const { panel } = open({ size: "2" });
    render(
      <Theme>
        <Dialog defaultOpen size="2">
          <DialogContent>
            <DialogTitle>Plain</DialogTitle>
          </DialogContent>
        </Dialog>
      </Theme>,
    );
    settleAll();
    const plains = document.querySelectorAll<HTMLElement>(".kui-dialog-popup:not(.kui-command)");
    const plain = plains[plains.length - 1]!;
    const results = panel()!;
    // THE VACUITY GUARD FIRST: the whole law is "these two agree", which a pair of zeroes
    // satisfies — and a pair of zeroes is precisely the defect.
    expect(parseFloat(computed(plain, "padding-left"))).toBeGreaterThan(0);
    /* AND IT IS A MENU'S INSET, NOT A DIALOG'S (2026-09-05). This read the dialog's until the
       pane stopped being boxed like one; what survives of the old law is the shape of the claim
       — the pane's inset is a FAMILY's and not a number this component invented — and the family
       moved. Four sides, because a pane that padded three of them would satisfy any one of them. */
    for (const side of ["padding-top", "padding-right", "padding-bottom", "padding-left"] as const) {
      expect(parseFloat(computed(results, side)), `the results pane pads nothing on ${side}`).toBeGreaterThan(0);
      expect(
        parseFloat(computed(results, side)),
        `the results pane still pads like a dialog on ${side}`,
      ).toBeLessThan(parseFloat(computed(plain, side)));
    }
  });

  it("so a band has two ends: every row spans the RESULTS pane's inset box exactly", () => {
    /* The measured half of the reversal, and the one a padding law cannot make on its own —
       a padded pane whose list bled back out to the edges would pass the law above and look
       exactly like the defect. Read off the painted boxes, both walls.

       THE FIELD LEFT THIS LIST on 2026-09-05 and got a law of its own below: it is no longer
       inside this pane, so measuring it here would be measuring a sibling. The shrink-wrap
       hazard it was here to catch is unchanged — `.kui-control` is `inline-flex`, so a field as
       wide as its own placeholder is what happens when `inline-size: 100%` goes — and the law
       that catches it now reads the field against the COLUMN. */
    const { popup, rows } = open({ size: "2" });
    const results = popup.querySelector<HTMLElement>(".kui-command-panel")!;
    const pane = results.getBoundingClientRect();
    /* `clientLeft`/`clientWidth`, not the rect plus `--border-width` — a rect is the BORDER
       box, and rebuilding the padding box by hand came out one pixel wrong here exactly as it
       did in the 2026-08-21 shell round (measured 25 against 24). Read the browser's own
       answer for where the padding box starts. */
    const padLeft = pane.left + results.clientLeft + parseFloat(computed(results, "padding-left"));
    const padRight =
      pane.left + results.clientLeft + results.clientWidth - parseFloat(computed(results, "padding-right"));
    for (const el of rows()) {
      const box = el.getBoundingClientRect();
      expect(box.left, `${el.className}: leading edge`).toBeCloseTo(padLeft, 0);
      expect(box.right, `${el.className}: trailing edge`).toBeCloseTo(padRight, 0);
    }
  });
});

  it("the FIELD spans the column, and it is the block that never moves (2026-09-05)", async () => {
    /* THE CLAIM THE WHOLE ARRANGEMENT EXISTS TO MAKE. A palette's height is its results, so a
       panel centred by two auto margins moved its top edge by half of every change and one
       pinned to the bottom moved it by all of it — and the field is at the top. Two panes with
       the column anchored to the top means the only thing a result count can move is the pane
       below.

       Read as a BEFORE and AFTER on one mounted palette rather than as a position: a literal
       would pass a field that is stably in the wrong place, and the defect was never about
       where it starts. Falsified by restoring `margin-block-start: auto` on the column, which
       moves it by tens of pixels between these two readings. */
    const { popup, input, field, rows } = open({ size: "2" });
    expect(rows().length, "the fixture must START with rows, or nothing can shrink").toBeGreaterThan(1);
    const before = field.getBoundingClientRect();
    const paneBefore = popup.getBoundingClientRect().height;

    input.focus();
    await userEvent.keyboard("Rename");
    await until(() => rows().length === 1);
    const after = field.getBoundingClientRect();

    expect(after.top, "the field moved when the list narrowed").toBeCloseTo(before.top, 0);
    expect(after.left).toBeCloseTo(before.left, 0);
    // The vacuity guard: the column really did change height, or this law compares a still
    // palette with itself and would pass under any anchoring at all.
    expect(popup.getBoundingClientRect().height).toBeLessThan(paneBefore - 1);
  });

  it("and the field spans the column — a `.kui-control` shrink-wraps its content otherwise", () => {
    const { popup, field } = open({ size: "2" });
    const col = popup.getBoundingClientRect();
    const box = field.getBoundingClientRect();
    expect(box.left).toBeCloseTo(col.left, 0);
    expect(box.right).toBeCloseTo(col.right, 0);
    // A placeholder is far narrower than the panel, so this cannot pass by coincidence.
    expect(box.width).toBeGreaterThan(200);
  });

  it("and the corner cannot eat one: the LAST band's outer corners are inside the pane", () => {
    /* THE DEFECT ITSELF, measured rather than reconstructed. What went wrong was not "the
       padding was zero" — it was that a rectangle was being drawn into a box with a 40px corner,
       so the first and last bands lost their ends to the curve. The arithmetic for that is two
       tokens and a square root, and rebuilding it here would be a law agreeing with its author
       (the shape this repo has caught itself in more than once); so it asks the browser instead.

       `elementFromPoint` at the band's own outer corner: inside the pane's painted shape it
       answers the row, and outside it the hit falls through to whatever is behind the panel.
       Falsified by `padding: 0`, which puts that point at the pane's own corner — measured, the
       hit comes back as the dialog's viewport. */
    const { rows } = open({ size: "2" });
    const last = rows()[rows().length - 1]!;
    const box = last.getBoundingClientRect();
    /* THE BAND HAS A CORNER OF ITS OWN, and the first spelling of this law probed straight into
       it — a row at `radius="full"` is a capsule, so `(left + 1, bottom - 1)` is outside the ROW
       and the hit came back as the list. The question is about the PANE's corner, so the probes
       sit just clear of the row's own on each edge: one on the leading edge above the row's
       curve, one on the bottom edge past it. Both are inside the band and both are as near the
       pane's corner as the band ever gets. */
    const r = parseFloat(computed(last, "border-bottom-left-radius"));
    const probes = [
      { x: box.left + 1, y: box.bottom - r - 1, name: "leading edge" },
      { x: box.left + r + 1, y: box.bottom - 1, name: "bottom edge" },
    ];
    for (const probe of probes) {
      const hit = document.elementFromPoint(probe.x, probe.y);
      expect(
        hit !== null && (hit === last || last.contains(hit)),
        `${probe.name}: the pane's corner is over this band's end`,
      ).toBe(true);
    }
  });

describe("the machine is the package's, the list is the app's (§44, §33)", () => {
  it("a row is highlighted from the first frame, so Enter needs no arrow key first", () => {
    // `autoHighlight="always"`. Without it a palette's most common gesture — type, press
    // Enter — does nothing at all, which is the defect this claim exists to prevent.
    const { rows } = open();
    const lit = rows().filter((r) => r.hasAttribute("data-highlighted"));
    expect(lit).toHaveLength(1);
    expect(lit[0]).toBe(rows()[0]);
  });

  it("typing narrows the list, and the rows that survive are the matching ones", async () => {
    const { input, rows } = open();
    expect(rows()).toHaveLength(FLAT.length);
    await userEvent.fill(input, "rename");
    await until(() => rows().length === 1);
    expect(rows().map((r) => r.textContent)).toEqual(["Rename workspace"]);
  });

  it("nothing matching renders the app's own sentence, not one the system wrote", async () => {
    const { popup, input, rows } = open();
    await userEvent.fill(input, "zzzzz");
    await until(() => rows().length === 0);
    expect(within(popup, ".kui-command-empty").textContent).toBe("No commands match.");
  });

  it("the field holds focus the moment it opens, so a chord is followed by typing", async () => {
    /* A palette is opened by a chord and answered by typing, with nothing in between. Nothing
       read it: every law that needed the caret in the field put it there itself, which is a law
       proving the browser can focus an input. Read as the ACTIVE ELEMENT rather than as a ring,
       because the ring is a consequence and this is the cause.

       IT IS A GUARD ON BORROWED BEHAVIOUR, and that is stated rather than dressed up: the focus
       is Base UI's dialog trap moving to the first tabbable, so there is no line in this package
       to sabotage. What it would catch is this component putting something focusable in front of
       the input — a clear button in the leading slot is the obvious one — or an upstream change
       to where a trap lands. It is worth its place for the same reason the §20 agreement laws
       are: the behaviour is borrowed, and borrowed is exactly what stops without telling you.

       IT ARRIVES ON A LATER TICK. The first spelling read it straight after `settleAll()` and
       found `<body>`, which looked like a defect and is not: a trap focuses in an effect. The
       wait is swallowed so the assertion below produces the failure message rather than a
       timeout that says nothing about what was focused instead. */
    const { input } = open();
    await until(() => document.activeElement === input, 1500).catch(() => {});
    expect(document.activeElement, "the palette opened with the caret somewhere else").toBe(input);
  });

  it("TAB does not walk into the list, even when the rows are real links", async () => {
    /* 2026-09-06, Kushagra: he asked what had been decided about focus rings on the results, and
       the answer was that nothing had — the reasoning was that focus never leaves the bar, so no
       row could ever draw one. Measured, that was false in the one shape this repo's own
       documentation site uses: the `render` escape (2026-09-04) makes a row a real `<a href>`,
       an anchor is focusable by nature, Base UI writes no `tabindex` on an item, and Tab from
       the bar landed on the first result with the full 2px ring on it.

       THE FIXTURE MUST USE LINKS, and that is the whole law: with plain rows nothing is focusable
       and the assertion holds against a component that fixed nothing. What a palette owes is one
       stop — the caret in the bar, arrows through the results, Tab out. */
    const { input, rows } = openLinks();
    expect(rows().length, "no rows, so Tab has nothing to walk into").toBeGreaterThan(1);
    input.focus();
    expect(document.activeElement, "the fixture never put the caret in the bar").toBe(input);
    await userEvent.tab();
    // SETTLED-BY-DESIGN: a Tab moves focus inside the keydown itself, so there is no later state
    // to wait for — and the only thing an `until` could wait for here is the assertion below,
    // which would turn a law about where focus landed into a law about how long it took.
    const landed = document.activeElement as HTMLElement;
    expect(
      landed.classList.contains("kui-command-item"),
      `Tab walked into the list and landed on ${landed.tagName}.${landed.className}`,
    ).toBe(false);
  });

  it("running a row with ENTER does not ring it on the way out", async () => {
    /* 2026-09-06, Kushagra: "Ring still appears briefly on return key press, is that correct?"
       Measured across the exit's frames before anything moved — the row was `activeElement` and
       drew a solid ring for every frame of the dissolve. Base UI commits the highlighted row by
       clicking its element, a click on an anchor focuses it, and a keyboard activation makes it
       `:focus-visible`; with ordinary rows nothing is focusable, so the fixture must use links.

       READ ON A SEIZED EXIT, never sampled. `catchDissolve` pauses the exit's own clocks, so the
       ending stamp is held on a mounted popup and the read is an EDGE rather than a race — which
       is what keeps this law on CI. Both halves are asserted: focus really is on the row (without
       it the law passes on a palette that simply moved focus away, which is a different repair),
       and the row draws no ring while that is true. */
    inMotion();
    const { input, rows, popup } = openLinks({ settle: false });
    input.focus();
    await userEvent.keyboard("{Enter}");
    const held = await catchDissolve(popup);
    const row = rows()[0];
    expect(row, "the popup unmounted before the exit could be caught").toBeTruthy();
    expect(
      document.activeElement,
      "focus never reached the row, so this law is about a state the component no longer has",
    ).toBe(row);
    expect(computed(row!, "outline-style"), "the leaving row drew its focus ring").toBe("none");
    held.release();
  });

  it("…and the arrow keys still move the highlight, which is the stop Tab gave up", async () => {
    /* The other half, and without it the repair could have been made by anything that breaks the
       list — the ring is only unreachable because the KEYBOARD reaches the rows another way. */
    const { input, rows } = openLinks();
    input.focus();
    const first = () => rows().findIndex((r) => r.hasAttribute("data-highlighted"));
    expect(first(), "nothing is highlighted on the first frame").toBe(0);
    await userEvent.keyboard("{ArrowDown}");
    await until(() => first() === 1);
    expect(first(), "the arrow keys stopped moving the highlight").toBe(1);
  });

  it("ENTER runs the highlighted row — the claim the component exists to make", async () => {
    /* §44's headline is that the keyboard model is the package's, and its most-quoted sentence
       is "type three letters, press Enter". Nothing read it: the shipped law asserted that a row
       carries `data-highlighted` on the first frame, which is one indirection short of the thing
       that could be wrong — a highlight nothing activates is a highlight. Base UI fires an
       item's `onClick` for a pointer press AND for Enter while the input holds focus, so the law
       drives a real keyboard and reads the handler.

       Falsified by taking `autoHighlight` off the root: nothing is highlighted, Enter reaches
       no row, and `ran` stays empty. */
    const ran: string[] = [];
    render(
      <Theme>
        <Command items={FLAT} defaultOpen>
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" placeholder="Search…" />
            <CommandList>
              {(item: Cmd) => (
                <CommandItem key={item.value} value={item} onClick={() => ran.push(item.value)}>
                  {item.label}
                </CommandItem>
              )}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
    const input = popup.querySelector<HTMLInputElement>(".kui-command-input")!;

    // TYPED, not clicked: the gesture the claim is about is three letters and Enter, and a row
    // reached by pointer would prove the pointer path instead.
    input.focus();
    await userEvent.fill(input, "rename");
    await until(() => popup.querySelectorAll(".kui-command-item").length === 1);
    await userEvent.keyboard("{Enter}");
    await until(() => ran.length > 0);
    expect(ran, "Enter ran the row the highlight was on").toEqual(["rename"]);
  });

  it("a row can BE a link, and stays one target while being one (opened 2026-09-04)", async () => {
    /* A palette of PLACES — a docs search — has to produce real anchors, or every result is a
       button that happens to navigate: no middle-click, no open-in-new-tab, no URL on the status
       bar, nothing announced as a link. `MenuItem` was opened on this argument three days ago for
       `BreadcrumbEllipsis`; a search result is the same kind of thing.

       THREE CLAIMS, because the cheap way to get an anchor is to nest one inside the row, which
       is a second target inside a target: the row IS the anchor, it carries the href, and there
       is exactly one of them. Falsified by dropping the render pass-through, which leaves a div. */
    render(
      <Theme>
        <Command items={FLAT} defaultOpen>
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" placeholder="Search…" />
            <CommandList>
              {(item: Cmd) => (
                <CommandItem key={item.value} value={item} render={<a href={`/${item.value}`} />}>
                  {item.label}
                </CommandItem>
              )}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
    const row = popup.querySelector<HTMLElement>(".kui-command-item")!;
    expect(row.tagName, "the row is not the anchor").toBe("A");
    expect(row.getAttribute("href")).toBe("/new");
    expect(row.querySelectorAll("a").length, "a second target inside the target").toBe(0);

    /* ENTER MUST CLICK THE ANCHOR, not merely call a handler, or the escape buys the semantics
       and loses the keyboard: a search answered by Enter is the whole gesture. Read as a NATIVE
       click event on the element, because that is what a browser acts on — the React handler
       firing proves nothing about navigation. The default is prevented so the harness does not
       leave the page mid-suite. */
    /* AND IT IS STILL A ROW: the render escape swaps the element, never the membership. Read
       against its own unrendered sibling rather than against a Button — a palette's rows take
       the floating notch since 2026-09-05, so a control height is no longer their number, and
       what this clause is actually about is that `render` changes nothing but the tag.

       The link row is MEASURED before the Enter and the twin is mounted after it, since
       2026-09-05: running a row dismisses the palette, so a measurement taken afterwards reads a
       detached element and comes back the empty string — not a height that disagrees, no height
       at all. Mounting the twin first is the other order and it is worse: two live palettes means
       two focus traps, and the Enter lands in the wrong one. */
    const linkHeight = computed(row, "block-size");
    expect(linkHeight, "a detached row makes the comparison below vacuous").not.toBe("");

    let nativeClicks = 0;
    row.addEventListener("click", (e) => {
      e.preventDefault();
      nativeClicks += 1;
    });
    const field = popup.querySelector<HTMLInputElement>(".kui-command-input")!;
    field.focus();
    await userEvent.keyboard("{Enter}");
    await until(() => nativeClicks > 0);
    expect(nativeClicks, "Enter did not click the row's anchor").toBe(1);

    const twin = open({ size: "2" });
    expect(linkHeight).toBe(computed(twin.rows()[0]!, "block-size"));
  });

  it("a stated filter is handed the ITEMS, and a grouped list narrows inside its groups", async () => {
    /* The shipped filter law passes `() => false`, which proves the matcher is consulted and
       nothing about what it is consulted WITH — and a matcher handed a group object rather than
       a row is the difference between a working palette and an empty one. It matters because an
       app's matcher is its own (§44 refuses to invent a matching policy), so the shape it
       receives is part of the contract rather than an implementation detail.

       Both halves: what the matcher SAW, and that grouping still narrowed around it. */
    const seen: unknown[] = [];
    render(
      <Theme>
        <Command items={GROUPS} defaultOpen>
          <CommandContent
            aria-label="Command palette"
            filter={(item: unknown, query: string) => {
              seen.push(item);
              const label = (item as Cmd | undefined)?.label ?? "";
              return label.toLowerCase().includes(query.trim().toLowerCase());
            }}
          >
            <CommandInput aria-label="Search commands" placeholder="Search…" />
            <CommandList>
              {(group: { value: string; items: Cmd[] }) => (
                <CommandGroup key={group.value} items={group.items}>
                  <CommandGroupLabel>{group.value}</CommandGroupLabel>
                  <CommandCollection>
                    {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
                  </CommandCollection>
                </CommandGroup>
              )}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
    const input = popup.querySelector<HTMLInputElement>(".kui-command-input")!;
    await userEvent.fill(input, "appearance");
    await until(() => popup.querySelectorAll(".kui-command-item").length === 1);

    // What it was handed: rows, every one of them, and never a group.
    expect(seen.length, "the matcher was never called").toBeGreaterThan(0);
    for (const item of seen) {
      expect(
        typeof (item as Cmd | undefined)?.label,
        `the matcher was handed ${JSON.stringify(item)} — a group, not a row`,
      ).toBe("string");
    }
    // And the grouping held around it: one row left, in the one section that still has one.
    expect([...popup.querySelectorAll(".kui-command-group-label")].map((l) => l.textContent))
      .toEqual(["Settings"]);
  });

  it("an app can be told the query, and narrow its own array with it (2026-09-04)", async () => {
    /* §44 said "an app that wants none hands in an already-narrowed array" and shipped no way to
       do it: narrowing needs the query and nothing handed it over, so the sentence named a path
       no call site could take. The forcing case is a RANKED search — `filter` is a boolean
       predicate, so it can neither order by relevance nor cap, and a docs search that cannot rank
       is not a docs search.

       BOTH HALVES, because the report alone is satisfiable by a dead prop: what was typed reaches
       the app, and `filter={null}` really does stand Base UI's own matching down, so the list is
       the array the app handed in and nothing else. Falsified by dropping the pass-through. */
    let query = "";
    function Ranked() {
      const [q, setQ] = React.useState("");
      // Reversed on purpose: an ORDER Base UI's matcher would never produce, so the law reads
      // the app's array rather than a coincidence.
      const items = q ? [...FLAT].filter((i) => i.label.toLowerCase().includes(q)).reverse() : FLAT;
      return (
        <Theme>
          <Command items={items} defaultOpen>
            <CommandContent
              aria-label="Command palette"
              filter={null}
              onQueryChange={(next) => {
                query = next;
                setQ(next.trim().toLowerCase());
              }}
            >
              <CommandInput aria-label="Search commands" placeholder="Search…" />
              <CommandList>
                {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
              </CommandList>
            </CommandContent>
          </Command>
        </Theme>
      );
    }
    render(<Ranked />);
    settleAll();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
    const input = popup.querySelector<HTMLInputElement>(".kui-command-input")!;
    await userEvent.fill(input, "e");

    await until(() => query === "e");
    expect(query, "the app was never told what was typed").toBe("e");
    const shown = () => [...popup.querySelectorAll(".kui-command-item")].map((r) => r.textContent);
    const expected = FLAT.filter((i) => i.label.toLowerCase().includes("e")).reverse().map((i) => i.label);
    await until(() => shown().length === expected.length);
    expect(shown(), "the list is not the array the app handed in").toEqual(expected);
  });

  it("the SCROLLER bleeds: the thumb rides the wall and the rows keep their inset", async () => {
    /* 2026-09-04, Kushagra: "SCROLL BLEEDS". The list shipped as a raw `overflow-y: auto`, which
       opens a native gutter INSIDE the pane's padding — it stands between the reader and the rows
       it is scrolling, and the first and last rows end at a hard line a few pixels short of a
       40px corner. The system's answer is a ScrollArea that bleeds to the pane's walls and
       re-states the padding inside its viewport; Menu adopted it on 2026-08-17 and this component
       should have arrived with it.

       THREE CLAIMS, because each is separately breakable and two of them look identical from the
       outside. The list is not a scroll container. The scroller REACHES the pane's walls, which
       is the bleed. And the rows are still inset, which is the re-padding — a bleed that forgot
       to re-pad puts the rows on the wall and looks like a different bug entirely. Falsified by
       putting `overflow-y: auto` back on the list, which fails the first, and by taking the
       ScrollArea out, which fails all three. */
    const { popup, rows } = open({ size: "2" });
    const list = within(popup, ".kui-command-list");
    expect(computed(list, "overflow-y"), "the list is scrolling itself again").toBe("visible");

    /* THE PANE IS THE RESULTS PANE since 2026-09-05 — the popup is a transparent column and pads
       nothing, so reading the bleed off it would compare two zeroes. */
    const results = popup.querySelector<HTMLElement>(".kui-command-panel")!;
    const area = within(popup, ".kui-scroll-area").getBoundingClientRect();
    const pane = results.getBoundingClientRect();
    const padLeft = pane.left + results.clientLeft + parseFloat(computed(results, "padding-left"));
    const wallLeft = pane.left + results.clientLeft;
    expect(padLeft, "a pane that pads nothing makes the bleed unobservable").toBeGreaterThan(wallLeft);
    expect(area.left, "the scroller stopped at the padding instead of the wall").toBeCloseTo(wallLeft, 0);

    const row = rows()[0]!.getBoundingClientRect();
    expect(row.left, "the bleed took the rows to the wall with it").toBeCloseTo(padLeft, 0);

    /* AND THE BLOCK END, which is a separate mechanism, was separately broken, and needs a
       DIFFERENT FIXTURE — five rows do not overflow, so a short palette is legitimately shorter
       than its cap and there is pane below it by design ("a palette with four commands in it is
       four rows tall"). The claim is only about a list that runs out of room. That is the
       degenerate-fixture rule again: the law above and this one need inputs where the general and
       the special case give different answers.

       What was broken: the surface layer asks whether the scroller is the pane's LAST in-flow
       child, and `Autocomplete.Root` renders a visually-hidden `<input>` after everything — one
       pixel tall, `display: block`, no attribute that tells it apart — so the answer was no, and
       the list ended at a hard line one inset short of the wall with dead pane below it. Read as
       the painted bottom, because the two declarations that restate the bleed are what a law
       reading declarations would agree with by construction. */
    const many = Array.from({ length: 40 }, (_, i) => ({ value: `x${i}`, label: `Command ${i}` }));
    render(
      <Theme>
        <Command items={many} defaultOpen size="2">
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" placeholder="Search…" />
            <CommandList>
              {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const tallCol = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
    const tall = tallCol.querySelector<HTMLElement>(".kui-command-panel")!;
    const tallBox = tall.getBoundingClientRect();
    const tallArea = within(tallCol, ".kui-scroll-area").getBoundingClientRect();
    const inset = parseFloat(computed(tall, "padding-bottom"));
    expect(inset, "a pane that pads nothing makes the bleed unobservable").toBeGreaterThan(0);
    expect(
      tallBox.top + tall.clientTop + tall.clientHeight - tallArea.bottom,
      "the scroller stopped short of the bottom wall — the rows cut instead of bleeding",
    ).toBeLessThan(inset);
  });

  it("and the viewport pads for the RING, because a scroll container clips at its padding box", () => {
    /* Kushagra, 2026-09-04: "Also focus ring is being cut" — the third time this repo has paid
       for the same rule (the menu's panel 2026-08-09, a sheet's body 2026-08-21). The surface
       layer only re-states the padding on the block sides the scroller actually bled, and this
       scroller has the field above it, so it had no block-start padding and the first row's ring
       was sliced along its top.

       Read as the ring's REACH against the clearance, both off the browser, so re-tuning the ring
       cannot silently re-break the panel. Falsified by removing the padding rule. */
    const { popup, rows } = open({ size: "2" });
    const row = rows()[0]!;
    row.focus();
    const reach =
      parseFloat(computed(row, "outline-width")) + parseFloat(computed(row, "outline-offset"));
    const viewport = within(popup, ".kui-scroll-viewport");
    const clearance =
      row.getBoundingClientRect().top -
      (viewport.getBoundingClientRect().top + viewport.clientTop);
    expect(clearance, `a ring reaching ${reach}px had ${clearance}px of room`).toBeGreaterThanOrEqual(reach);
  });

  it("the field HAS a backdrop, and it is the theme's own material (§10)", () => {
    /* Kushagra, 2026-09-04, twice: "TEXT FIELD SHOULD HAVE BACKDROP". Content passes behind this
       field, which is §10's whole test for whether a material is expressed, and it is the only
       element in the panel that passes it.

       IT MUST BE A PANE, NOT A MEMBER, and that distinction is the law. Inside the palette's own
       glass pane a member resolves `on-glass`, which paints its solid dress at the PANE's alpha
       and filters NOTHING — so the rows read straight through it while they move. `CommandContent`
       resets the glass scope so an explicit backdrop inside resolves the theme's material (the
       2026-08-19 rule that a solid surface HOSTS glass), and what proves it is the FILTER: an
       on-glass field has none. Read against a Card marked `backdrop` under the same theme rather
       than against a literal, because what is claimed is that this is the app's material and not
       some value this component invented. */
    render(
      <Theme material="regular">
        <Command items={FLAT} defaultOpen size="2">
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" placeholder="Search…" />
            <CommandList>
              {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
    const field = within(popup, ".kui-command-search");

    const bar = render(
      <Theme material="regular">
        <Box backdrop>
          <Card backdrop size="2">
            Twin
          </Card>
        </Box>
      </Theme>,
    );
    settleAll();
    const twin = within(bar, ".kui-card");
    // The vacuity guard: a theme whose glass filtered nothing would make every clause true of a
    // bare field as well.
    expect(computed(twin, "backdrop-filter"), "the twin is not glass — this proves nothing").not.toBe("none");
    expect(computed(field, "backdrop-filter"), "the field filters nothing — it is on-glass, not a pane")
      .not.toBe("none");
    expect(field.getAttribute("data-material"), "the field states no material").toBe(
      twin.getAttribute("data-material"),
    );
  });

  it("the field is OUTSIDE the results pane, and the interval is the column's own (2026-09-05)", () => {
    /* The structural half of the split, and the one the stability law depends on: a field pinned
       INSIDE the scrolling pane was the arrangement whose top edge moved. Three claims, because
       each is separately breakable — the field is not a descendant of the pane, it is not a
       descendant of the scroller, and what stands between them is a real distance.

       The distance is read as the PAINTED gap rather than off `gap`, because a declared gap on a
       column whose children have collapsed is still a declared gap. Falsified by putting the
       field back inside `CommandList`'s pane, which makes the first two false, and by removing
       the column's gap, which makes the third zero. */
    const { popup, field, panel } = open({ size: "2" });
    const results = panel()!;
    expect(results.contains(field), "the field is inside the results pane again").toBe(false);
    expect(within(popup, ".kui-scroll-viewport").contains(field), "the field scrolls with the list").toBe(false);
    const between = results.getBoundingClientRect().top - field.getBoundingClientRect().bottom;
    expect(between, "nothing stands between the two blocks").toBeGreaterThan(0);
  });

  it("and nothing passes BEHIND the field any more — that was the price, and it is paid on purpose", async () => {
    /* THE REVERSAL, ASSERTED RATHER THAN LEFT TO ROT (2026-09-05). Until today the panel was one
       scrolling region with the field `position: sticky` inside it, so rows passed under the
       field and out at the pane's wall — Kushagra's own call on 2026-09-04, and a law here read
       it as an overlap plus a hit test. Two separate panes with air between them cannot do that,
       and the field's stability is what the air buys.

       This is the same law inverted, which is deliberate: a claim that quietly stops being true
       is how a component drifts back, and a scroll that put a row under the field again would be
       the old arrangement returning. Read at a real scroll offset, because at rest the list does
       not reach the field either way and the fixture would be degenerate. */
    const many = Array.from({ length: 40 }, (_, i) => ({ value: `x${i}`, label: `Command ${i}` }));
    render(
      <Theme>
        <Command items={many} defaultOpen size="2">
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" placeholder="Search…" />
            <CommandList>
              {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
    const viewport = within(popup, ".kui-scroll-viewport");
    const field = within(popup, ".kui-command-search");

    viewport.scrollTop = 120;
    await until(() => viewport.scrollTop > 0);
    settleAll();
    // The vacuity guard: the list must really be scrolled, or no row could reach anything.
    expect(viewport.scrollTop).toBeGreaterThan(100);

    /* CLAMPED TO WHAT IS ACTUALLY PAINTED, and the first spelling of this law was wrong for
       exactly the reason the old arrangement was interesting: `getBoundingClientRect` reports a
       row's geometry whether or not the scroller clips it, so a scrolled-past row's rect sits
       above the viewport and overlapped the field on paper while nothing of it was on screen.
       Two rows "reached" the field in a build where they cannot. The clip box is the question. */
    const fb = field.getBoundingClientRect();
    const clip = viewport.getBoundingClientRect();
    const reaching = [...popup.querySelectorAll<HTMLElement>(".kui-command-item")].filter((r) => {
      const b = r.getBoundingClientRect();
      const top = Math.max(b.top, clip.top);
      const bottom = Math.min(b.bottom, clip.bottom);
      return bottom > top && top < fb.bottom && bottom > fb.top;
    });
    expect(reaching.length, "a row reached the field's box — the two panes are overlapping").toBe(0);
    // The vacuity guard the clamp obliges: some row must be painted at all.
    expect(
      [...popup.querySelectorAll<HTMLElement>(".kui-command-item")].some((r) => {
        const b = r.getBoundingClientRect();
        return Math.min(b.bottom, clip.bottom) - Math.max(b.top, clip.top) > 1;
      }),
      "no row is painted at all — the clamp made this law vacuous",
    ).toBe(true);
  });

  it("and it takes no room at all while the list has rows", () => {
    /* `Autocomplete.Empty` renders its element on every state — it is an `aria-live` region, so it
       must exist before the message arrives or the message is never announced — and the breath the
       law below gives it was landing on every populated list as 48px of dead pane under the last
       row. Read as the PAINTED height, and with the announcement's own precondition asserted
       beside it, because `display: none` would zero the height and take the live region with it. */
    const { popup, rows } = open({ size: "2" });
    expect(rows().length, "an empty list makes this vacuous").toBeGreaterThan(0);
    const empty = within(popup, ".kui-command-empty");
    expect(empty.getBoundingClientRect().height, "the empty region is padding a list that has rows").toBe(0);
    expect(computed(empty, "display"), "the live region was hidden — the announcement goes with it")
      .not.toBe("none");
  });

  it("the empty region breathes, and a caption does not — they are not the same kind of thing", async () => {
    /* 2026-09-04, Kushagra: "space above nothing matches is too less". They had shared one rule,
       and a caption's breath is deliberately small — it is bound to the rows under it, which is
       proximity doing its job. The empty region replaces the whole list: one object standing
       alone in the room the rows would have filled, with nothing to be near.

       READ AGAINST A REAL CAPTION in a second palette at the same index — a ranking, not a
       number, so it does not go stale the day the rhythm moves. TWO earlier spellings were caught
       by their own sabotage runs and both are worth recording. The first compared the empty region
       against the first ROW, which a caption's own four pixels already beat, so deleting the rule
       changed nothing the law could see. The second compared painted child positions, and the two
       children are not comparable — a caption holds a `Text` span and the empty region holds a
       block that fills it, so the tops answer different questions. The resolved padding is the
       one thing both elements state about themselves, and it is the whole of what changed. The
       row survives as a vacuity guard rather than as the comparison. */
    const { popup, input, rows } = open({ size: "2" });
    await userEvent.fill(input, "zzzzz");
    await until(() => rows().length === 0);
    const empty = within(popup, ".kui-command-empty");
    const emptyPad = parseFloat(computed(empty, "padding-top"));

    render(
      <Theme>
        <Command items={GROUPS} defaultOpen size="2">
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" placeholder="Search…" />
            <CommandList>
              {(group: { value: string; items: Cmd[] }) => (
                <CommandGroup key={group.value} items={group.items}>
                  <CommandGroupLabel>{group.value}</CommandGroupLabel>
                  <CommandCollection>
                    {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
                  </CommandCollection>
                </CommandGroup>
              )}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const grouped = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
    const captionPad = parseFloat(computed(within(grouped, ".kui-command-group-label"), "padding-top"));

    /* The row term is GONE from this law (2026-09-04). It was the vacuity guard, and it stopped
       being one when the field became sticky inside the scroller: a row can now sit behind the
       field, so the distance from the field's bottom to the first row is legitimately negative and
       the guard was asserting a fact about an arrangement that no longer exists. The caption's own
       padding is the guard the law actually needs — a pair of zeroes is what would make the
       ranking below vacuous. */
    expect(captionPad, "a caption must not be the thing that breathes").toBeGreaterThan(0);
    expect(emptyPad, "the empty region is breathing like a caption").toBeGreaterThan(captionPad);
  });

  it("a group disappears when nothing in it matches, and its label goes with it", async () => {
    render(
      <Theme>
        <Command items={GROUPS} defaultOpen>
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" placeholder="Search…" />
            <CommandList>
              {(group: { value: string; items: Cmd[] }) => (
                <CommandGroup key={group.value} items={group.items}>
                  <CommandGroupLabel>{group.value}</CommandGroupLabel>
                  <CommandCollection>
                    {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
                  </CommandCollection>
                </CommandGroup>
              )}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const popups = document.querySelectorAll<HTMLElement>(".kui-command");
    const popup = popups[popups.length - 1]!;
    const labels = () => [...popup.querySelectorAll(".kui-command-group-label")].map((l) => l.textContent);
    expect(labels()).toEqual(["Actions", "Settings"]);

    const input = popup.querySelector<HTMLInputElement>(".kui-command-input")!;
    await userEvent.fill(input, "Appearance");
    await until(() => labels().length === 1);
    expect(labels(), "a group with no surviving rows still drew its caption").toEqual(["Settings"]);
  });
});

describe("a command is a row, and the field is not a field (§21, §44)", () => {
  it("a row stands level with a menu row at the same index, and wears the family's identity", () => {
    const { rows } = open({ size: "2" });
    const row = rows()[0]!;
    expect(row.classList.contains("kui-control")).toBe(true);
    expect(row.classList.contains("kui-row")).toBe(true);
    expect(row.getAttribute("data-emphasis")).toBe("quiet");

    /* IT TAKES THE MENU'S NOTCH, and that reversed on 2026-09-05 with the pane it sits in.
       The row family's 2026-08-26 posture is that a standing row rides the height ladder and
       only a FLOATING panel notches — and this law argued the palette stands, on the ground
       that its panel is a Dialog and its list is one you browse. The pane is boxed like a menu
       now (Kushagra: "this is almost like a menu isnt it"), and the notch, the row capsule and
       the concentric corner are ONE set behind one selector on purpose: the panel corner is
       derived from the row corner, so taking half of it is how a 15px capsule lands on a 32px
       box. Asserted against a mounted menu row, which is what "the notch" means — at the index
       the palette's rows really stand at, which is one above its own since 2026-09-06. */
    render(
      <Theme>
        <Menu defaultOpen size={ROW_STEP["2"]}>
          <MenuTrigger>open</MenuTrigger>
          <MenuContent>
            <MenuItem>Row</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    settleAll();
    const menuRows = document.querySelectorAll<HTMLElement>(".kui-menu-item");
    const menuRow = menuRows[menuRows.length - 1]!;
    expect(computed(row, "block-size")).toBe(computed(menuRow, "block-size"));
    // The vacuity guard: the notch is only interesting if it is NOT the control ladder.
    const bar = render(
      <Theme>
        <Button size={ROW_STEP["2"]}>Level</Button>
      </Theme>,
    );
    settleAll();
    expect(computed(row, "block-size")).not.toBe(computed(within(bar, ".kui-button"), "block-size"));
  });

  it("the search bar is a PANE, and it is the SAME pane the results are in (2026-09-05)", () => {
    /* Reversed twice. It drew no box, then wore `kui-control kui-field`, and now it is a surface
       — because the arrangement around it changed. A field is written for a control sitting IN
       something: its well is the dress ramp, an alpha step meant to composite against a pane, and
       over the scrim that read as a recessed grey box beside a lit white one (Kushagra: "it needs
       same material as dialog shell"). Standing alone over the app, it is a pane.

       READ AS AN AGREEMENT WITH ITS OWN SIBLING, which is the strongest form available: whatever
       the results pane paints at this index, the bar paints. A literal would pass a bar that
       invented a matching value today, and the claim is that there is one material here. */
    const { popup, panel } = open({ size: "2" });
    const bar = within(popup, ".kui-command-search");
    const results = panel()!;
    expect(bar.classList.contains("kui-surface")).toBe(true);
    expect(bar.classList.contains("kui-overlay")).toBe(true);
    expect(bar.classList.contains("kui-field"), "it is a field again").toBe(false);

    // The vacuity guard: a pane whose fill were transparent would make every clause true of a
    // bare line as well.
    expect(computed(results, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
    /* THE MATERIAL, not the geometry. The two blocks are made of the same stuff — that is the
       claim, and it is what "same material as dialog shell" asked for. Their BOX differs on
       purpose since 2026-09-05: a pane holding a list of rows and a pane holding one line of
       type do not want the same air, and only one of them is a pill. Those two live in their
       own laws below, where a change to either fails something. */
    for (const prop of ["background-color", "border-top-width", "border-top-color", "backdrop-filter"] as const) {
      expect(computed(bar, prop), `the bar states its own ${prop}`).toBe(computed(results, prop));
    }
  });

  it("and it is a PILL — clamped, and square when the app says `radius=\"none\"` (2026-09-05)", () => {
    /* Kushagra: "still needs pill shape no?". Read as the CLAMP rather than as a number: what a
       capsule means on a box whose height is one line plus its own inset is "half the shorter
       side", and the browser is the only thing that knows what that is. So the law measures the
       painted corner against half the painted box.

       AND THE STAND-DOWN, which is the half that makes the spelling legitimate rather than a
       literal: the corner is the level's own value multiplied out, so `radius="none"` zeroes it
       by arithmetic instead of by an exception. §6 refused this clamp for a GROWN box — a
       three-row textarea became a stadium — and it is right here for the opposite reason: this
       box is one line by construction. */
    const { popup } = open({ size: "2" });
    const bar = within(popup, ".kui-command-search");
    const box = bar.getBoundingClientRect();
    /* THE COMPUTED VALUE IS NOT THE PAINTED ONE, and that is the whole reason this law reads two
       things. `getComputedStyle` hands back the declaration — 4000px — and the clamp happens at
       used-value time, so a law reading the number alone would pass a box that is not a capsule
       and fail one that is. What the number can prove is that the clamp is REACHED (it overshoots
       half the box); what proves the shape is the browser, asked at the corner. */
    expect(parseFloat(computed(bar, "border-top-left-radius"))).toBeGreaterThan(box.height);
    // A capsule is only interesting on a box that is wider than it is tall.
    expect(box.width).toBeGreaterThan(box.height * 2);
    // The corner itself: a square box owns its own top-left pixel and a capsule does not.
    const corner = document.elementFromPoint(box.left + 1, box.top + 1);
    expect(corner !== null && bar.contains(corner), "the bar's own corner is square").toBe(false);
    // …and the middle of its leading edge IS the bar, so the probe above is reading a corner
    // rather than an element that is simply not there.
    const middle = document.elementFromPoint(box.left + 1, box.top + box.height / 2);
    expect(middle !== null && bar.contains(middle), "the probe missed the bar entirely").toBe(true);

    const squared = render(
      <Theme radius="none">
        <Command items={FLAT} defaultOpen size="2">
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" placeholder="Search…" />
            <CommandList>
              {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    void squared;
    settleAll();
    const none = [...document.querySelectorAll<HTMLElement>(".kui-command-search")].pop()!;
    expect(parseFloat(computed(none, "border-top-left-radius")), "the kill switch does not reach it").toBe(0);
  });

  it("and it draws NO ring — there is nothing here to tell it apart from (§8)", () => {
    /* A refusal, not an omission. §8's ring tells a focused control from the unfocused ones
       around it, and a palette opens with the caret in this bar with nothing else in the panel
       focusable. What is asserted is the UA's own default being gone as well, which is why the
       stylesheet states it on the resting rule rather than on a `:focus` arm.

       The precondition is the load-bearing half: the input must really be focused, or this is a
       law about an unfocused element and would pass against any ring at all. */
    const { popup, input } = open({ size: "2" });
    input.focus();
    expect(document.activeElement, "the bar never took focus — this proves nothing").toBe(input);
    expect(computed(input, "outline-style")).toBe("none");
    const bar = within(popup, ".kui-command-search");
    expect(computed(bar, "outline-style")).toBe("none");
  });
});

describe("size prices what four documents say it prices (audit 2026-09-02)", () => {
  /* The field's height and font and the captions' inset were pinned at index 2, and every
     size-bearing law ran at index 2 — the one index where the pin is invisible. */
  for (const size of ["1", "2", "3", "4"] as const) {
    it(`${size}: one number prices BOTH blocks, identically`, () => {
      /* 2026-09-05, Kushagra: "passing a size to this command should affect both — the search bar
         and search results container — in identical way, without creating an exception for size
         3". The exception he is naming is the one this component briefly shipped: the bar wore a
         CONTROL cell one step up, so `size="3"` was the only way to get a bar that read like a
         bar, and the index meant something here it means nowhere else.

         Both blocks are `.kui-surface .kui-overlay` at the palette's own index now, so the claim
         is an EQUALITY between them at every index rather than a table of numbers. Read across
         all four, because two adjacent steps agree under more than one wrong spelling — this
         component's own 2026-09-02 finding.

         The monotonic guard is what stops the equality from being satisfied by a ladder that
         does not move: a size-1 bar and a size-4 bar must differ. */
      const { popup, panel } = open({ size });
      const bar = within(popup, ".kui-command-search");
      const results = panel()!;
      /* BOTH MOVE, AND THE BAR IS THE TIGHTER ONE. It was an equality until 2026-09-05 and that
         was one claim too strong: the bar pads less than the pane holding the rows, on purpose
         (Kushagra: "maybe padding is bit too much no?"). What the index still owes is that
         neither block is priced by anything but it — a bar with a pinned inset would satisfy an
         equality-free law at every index, which is why the monotonic guard below exists. */
      const barPad = parseFloat(computed(bar, "padding-left"));
      const panePad = parseFloat(computed(results, "padding-left"));
      expect(barPad, `the bar pads nothing at index ${size}`).toBeGreaterThan(0);
      expect(panePad, `the pane pads nothing at index ${size}`).toBeGreaterThan(0);
      /* THEY DIFFER, and which way round is not the law's business — it was "the bar is
         tighter" for an hour and the relation INVERTED on 2026-09-05 when the pane took the
         menu's inset. What the index owes is that neither is the other's number: the air around
         one line of type and the air around a list of rows are two questions. */
      expect(barPad, `the two blocks share one inset at index ${size}`).not.toBe(panePad);
    });
  }

  it("and the index really moves the pair — an equality a flat ladder would satisfy", () => {
    const one = open({ size: "1" });
    const four = open({ size: "4" });
    const barOf = (o: ReturnType<typeof open>) => within(o.popup, ".kui-command-search");
    expect(computed(barOf(four), "padding-left")).not.toBe(computed(barOf(one), "padding-left"));
    /* …and the results pane with it — read on its CORNER, not its inset. A menu's inset is
       index-invariant by design (`max(--floating-p, the ring's reach)` answers a clipping rule,
       not a size), so the pane's own answer to the index is the concentric corner: row corner
       plus that inset, and the row corner is size-indexed. A law reading padding here would have
       been asking the wrong property of a family it had just joined. */
    expect(computed(four.panel()!, "border-radius")).not.toBe(computed(one.panel()!, "border-radius"));
    // …and the bar's TYPE moves with it, which the pane's inset alone would not prove.
    expect(computed(four.input, "font-size")).not.toBe(computed(one.input, "font-size"));
  });

  it("and its glyph is priced off the bar's OWN line, not the pane's (2026-09-05)", () => {
    /* Kushagra, by eye: "why does the icon feel a bit too small?" — and it was, by 2px at the
       default index. The slot read `--kui-sf-icon`, the surface family's box at the PALETTE's
       index, so a 16px magnifier stood beside an 18px line while a menu row's 16px stands beside
       a 16px one. The fraction wall again: a ladder borrowed from a box this element does not
       have.

       TWO CLAUSES, because each catches a different repair going wrong. The glyph is never
       smaller than the type it stands beside — that is the defect. And it still lands on the
       icon ladder, which is what stops the fix from becoming a raw share of a line: §4 is
       explicit that an icon sits on the 16/20/24 drawing grid while a type step lands wherever
       the ramp does, and 0.75 of a 26px line is 19.5. */
    const rungs = (el: HTMLElement) => {
      const probe = document.createElement("div");
      el.append(probe);
      const out = ["1", "2", "3", "4"].map((n) => {
        probe.style.inlineSize = `var(--icon-size-${n})`;
        return computed(probe, "inline-size");
      });
      probe.remove();
      return out;
    };
    for (const size of ["1", "2", "3", "4"] as const) {
      /* ITS OWN FIXTURE, because `open()` places no `leading` and the slot only exists when a
         caller hands one in — the first spelling of this law threw on a missing element, which
         is a law that fails for the wrong reason and whose sabotage pass proves nothing. */
      render(
        <Theme>
          <Command items={FLAT} defaultOpen size={size}>
            <CommandContent aria-label="Command palette">
              <CommandInput
                aria-label="Search commands"
                placeholder="Search…"
                leading={<svg viewBox="0 0 24 24" aria-hidden />}
              />
              <CommandList>
                {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
              </CommandList>
            </CommandContent>
          </Command>
        </Theme>,
      );
      settleAll();
      const popup = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
      const input = within(popup, ".kui-command-input");
      const slot = within(popup, ".kui-command-search-slot");
      const box = parseFloat(computed(slot, "inline-size"));
      expect(box, `at index ${size} the glyph is smaller than the line beside it`).toBeGreaterThanOrEqual(
        parseFloat(computed(input, "font-size")),
      );
      expect(rungs(popup).map(parseFloat), `at index ${size} the glyph left the drawing grid`).toContain(box);
    }
  });

  it("the bar's text is LARGER than the rows it filters, at every index", () => {
    /* The other half of "it needs its own sizing": a bar you type into reads above the rows it
       narrows, which is `SEARCH_STEP` in command.tsx — one step per index, the `OWNED_*_STEP`
       genus, because the component owns this text. Without it the bump was doing the work and
       `size="3"` was the workaround. */
    for (const size of ["1", "2", "3", "4"] as const) {
      const { popup, input, rows } = open({ size });
      const row = rows()[0]!;
      void popup;
      expect(
        parseFloat(computed(input, "font-size")),
        `at index ${size} the bar is not set above its rows`,
      ).toBeGreaterThan(parseFloat(computed(row, "font-size")));
    }
  });

  for (const size of ["1", "2", "3", "4"] as const) {
    it(`${size}: the list stands ONE STEP above the palette (2026-09-06)`, () => {
      /* Kushagra, using it: "I have a feeling as I use it, that the list of command should also
         use a step + 1. We're doing this mapping with Toolbar, we have a pattern already." The
         reason is `SEARCH_STEP`'s one block over — a palette is the one object on the screen, so
         its rows are not priced like the rows in the app behind it.

         READ AS AN AGREEMENT WITH A MENU, never against numbers: what "a step up" means is the
         whole row cell — the notch, the type, the icon box and the pill inset together — and a
         law naming four of them is four chances to read the one that happens to be right. The
         reference is a MENU row rather than a `Row`, because both of these are floating rows and
         a standing row rides a different ladder entirely (§21).

         The guard below is the half that matters: at the palette's OWN index the two must
         disagree, or this law passes against a component that never bumped anything. It is
         skipped at 4 and asserted there instead — the ladder ends, so the step does, and a cap
         that silently became a step would be caught by the same clause it exempts. */
      const { rows } = open({ size });
      const row = rows()[0]!;
      const menuRowAt = (at: "1" | "2" | "3" | "4") => {
        render(
          <Theme>
            <Menu defaultOpen size={at}>
              <MenuTrigger>open</MenuTrigger>
              <MenuContent>
                <MenuItem>Row</MenuItem>
              </MenuContent>
            </Menu>
          </Theme>,
        );
        settleAll();
        const all = document.querySelectorAll<HTMLElement>(".kui-menu-item");
        return all[all.length - 1]!;
      };
      const cell = (el: HTMLElement) =>
        ["block-size", "font-size", "padding-left"].map((p) => computed(el, p)).join(" / ");

      expect(cell(row), `at ${size} the rows are not the cell one step up`).toBe(
        cell(menuRowAt(ROW_STEP[size])),
      );
      const own = cell(menuRowAt(size));
      if (size === "4") {
        expect(own, "the ladder has a rung above 4 — the cap is stale").toBe(cell(row));
      } else {
        expect(own, `at ${size} the rows never left the palette's own index`).not.toBe(cell(row));
      }
    });
  }

  it("a section's caption sits on the vertical its rows' text sits on", () => {
    /* The stylesheet's comment claimed this and nothing measured it; the caption hung 13-24px
       to the right of the rows at every index but 2. Read as the two painted verticals. */
    for (const size of ["1", "2", "3", "4"] as const) {
      render(
        <Theme>
          <Command items={GROUPS} defaultOpen size={size}>
            <CommandContent aria-label="Command palette">
              <CommandInput aria-label="Search commands" placeholder="Search…" />
              <CommandList>
                {(group: { value: string; items: Cmd[] }) => (
                  <CommandGroup key={group.value} items={group.items}>
                    <CommandGroupLabel>{group.value}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
                    </CommandCollection>
                  </CommandGroup>
                )}
              </CommandList>
            </CommandContent>
          </Command>
        </Theme>,
      );
      settleAll();
      const popup = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
      const caption = popup.querySelector<HTMLElement>(".kui-command-group-label .kui-type")!;
      const row = popup.querySelector<HTMLElement>(".kui-command-item")!;
      // The row pads itself, so the row's TEXT starts one row-inset inside its own box.
      const rowText = row.getBoundingClientRect().left + parseFloat(computed(row, "padding-left"));
      expect(
        caption.getBoundingClientRect().left,
        `size ${size}: the caption must line up with the rows it names`,
      ).toBeCloseTo(rowText, 0);
    }
  });
});

describe("the escapes and the dismissal are real (audit 2026-09-02)", () => {
  it("a stated `filter` is what decides which rows exist", async () => {
    render(
      <Theme>
        <Command items={FLAT} defaultOpen>
          <CommandContent aria-label="Command palette" filter={() => false}>
            <CommandInput aria-label="Search commands" placeholder="Search…" />
            <CommandList>
              {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
    // A QUERY FIRST. With an empty field there is nothing to match against, so every row shows
    // whatever the matcher says — which is correct, and which made the first spelling of this
    // law read a list the `filter` prop had never been consulted about.
    expect(popup.querySelectorAll(".kui-command-item").length).toBe(FLAT.length);
    const input = popup.querySelector<HTMLInputElement>(".kui-command-input")!;
    await userEvent.fill(input, "new");
    await until(() => popup.querySelectorAll(".kui-command-item").length === 0);
    expect(
      popup.querySelectorAll(".kui-command-item").length,
      "a matcher refusing everything must empty the list",
    ).toBe(0);
  });
});

describe("the agreement law: portalled ≡ in-flow (§20, §44)", () => {
  /* EVERY portalling component in this package owes one, and this one shipped without it —
     the same omission the 2026-08-29 audit caught in Tooltip. A palette portals through
     DialogContent, so context crosses and attributes do not: the wrapper has to re-stamp every
     axis, and a law has to read them through a real mount rather than trust that it does. */
  const HOSTILE = {
    appearance: "dark",
    density: "compact",
    radius: "large",
    pointer: "coarse",
    depth: "elevated",
    contrast: "high",
  } as const;

  function facts(el: HTMLElement) {
    const cs = getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      border: cs.borderTopColor,
      radius: cs.borderTopLeftRadius,
      shadow: cs.boxShadow,
      direction: cs.direction,
    };
  }

  it("a palette's panel carries every axis across the portal", () => {
    const root = render(
      <Theme {...HOSTILE}>
        <Command items={FLAT} defaultOpen>
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" placeholder="Search…" />
            <CommandList>
              {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const popup = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;

    /* THE TWIN TAKES ITS IDENTITY FROM THE PANEL IT COMPARES AGAINST — Menu's and Select's own
       repair (2026-08-23), after hand-copied class lists drifted from the components they
       claimed to mirror. Copying the popup's own marks and placing the copy IN FLOW is exactly
       the §20 question: does the portal resolve what the tree resolves? */
    const twin = document.createElement("div");
    twin.className = popup.className;
    for (const attr of popup.getAttributeNames()) {
      if (attr.startsWith("data-")) twin.setAttribute(attr, popup.getAttribute(attr)!);
    }
    root.appendChild(twin);

    expect(facts(popup)).toEqual(facts(twin));
    twin.remove();
  });

  it("the ROWS carry the pointer axis too, which a box-only facts list would miss", () => {
    /* Tooltip's own lesson: a facts list of box values alone can carry five axes of six and go
       green on a portal that dropped the sixth. What coarse moves here is the row's height. */
    const fine = open({ theme: { pointer: "fine" } });
    const coarse = open({ theme: { pointer: "coarse" } });
    expect(computed(coarse.rows()[0]!, "block-size")).not.toBe(computed(fine.rows()[0]!, "block-size"));
  });
});

/* ── The SHEET path, which is where the reversal deleted a carve-out (§24, §44) ───────────── */

describe("on a narrow window the palette is NOT a sheet (§18, §24, §44 — 2026-09-05)", () => {
  /* `dialog.css` presents a narrow-window dialog as a bottom sheet, and Command is the second
     deliberate exclusion from that arm (AlertDialog is the first). The reason is the shape
     rather than taste: a sheet grows from a fixed BOTTOM edge, and a palette's height is its
     results — so pinned there, a query returning three rows instead of twelve moves the top by
     the whole delta, and the field is at the top. Kushagra, 2026-09-05: "it being a bottom sheet
     doesnt help since the content is dynamic… the search field should be stable".

     THE BROWSER SUITE'S VIEWPORT IS PINNED WIDE, so this is the only place the narrow arm is
     observable at all, and the exclusion is only a claim here. Falsified by deleting the
     `@media` block in command.css, which drops the palette to the bottom of the phone. */
  const PHONE = { width: 390, height: 844 };

  afterEach(async () => {
    await page.viewport(VIEWPORT.width, VIEWPORT.height);
  });

  it("it stays anchored to the top, and the field is still the block that does not move", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const { popup, input, field, rows } = open({ size: "2" });

    // Anchored to the top: the free space is all below, which is what a sheet inverts.
    const viewport = popup.parentElement!.getBoundingClientRect();
    const col = popup.getBoundingClientRect();
    const above = col.top - viewport.top;
    const below = viewport.bottom - col.bottom;
    expect(below, "the palette is pinned to the bottom — that is the sheet arm").toBeGreaterThan(above);

    // And the same stability claim as at every other width, measured on the phone.
    expect(rows().length).toBeGreaterThan(1);
    const before = field.getBoundingClientRect().top;
    input.focus();
    await userEvent.keyboard("Rename");
    await until(() => rows().length === 1);
    expect(field.getBoundingClientRect().top, "the field moved when the list narrowed").toBeCloseTo(before, 0);
  });

  it("and it is still an OBJECT in the window, not the window's own width", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const { popup } = open({ size: "2" });
    const col = popup.getBoundingClientRect();
    // A sheet is the window's width with the viewport's gutter zeroed; this keeps both.
    expect(col.width, "the palette spans the whole phone — the sheet arm reached it").toBeLessThan(PHONE.width);
    expect(col.left, "and it sits on the window's edge").toBeGreaterThan(0);
  });

  it("the results pane bleeds and re-pads, so the rows stand one inset off its wall", async () => {
    /* The general rule, checked where the suite otherwise cannot: a ScrollArea that is a pane's
       direct child reaches the pane's walls and re-states the padding inside its viewport. A
       bleed that forgot to re-pad puts the rows on the wall and looks like a different bug. */
    await page.viewport(PHONE.width, PHONE.height);
    const { popup, rows } = open({ size: "2" });
    const results = popup.querySelector<HTMLElement>(".kui-command-panel")!;
    const pane = results.getBoundingClientRect();
    const inset = parseFloat(computed(results, "padding-left"));
    expect(inset, "a pane that pads nothing makes every clause below vacuous").toBeGreaterThan(0);

    const area = within(popup, ".kui-scroll-area").getBoundingClientRect();
    expect(area.left).toBeCloseTo(pane.left + results.clientLeft, 0);
    expect(area.width).toBeCloseTo(results.clientWidth, 0);

    for (const row of rows()) {
      expect(row.getBoundingClientRect().left - (pane.left + results.clientLeft), `${row.className}`)
        .toBeCloseTo(inset, 0);
    }
  });
});

describe("running a row closes the palette (§44, 2026-09-05)", () => {
  /* The defect these hold: the component's own JSDoc had promised "a row being run" as a reason
     since the day it shipped, and nothing produced it — a palette answered by Enter stayed
     standing over the thing it had just run, and the only way to dismiss it was a line every call
     site had to remember. The docs site's own search is the proof nobody remembers: its rows
     navigated and the panel stayed open on the page it navigated to, while the example beside it
     closed only because it wrote the line.

     THE LINK ROW IS THE LOAD-BEARING FIXTURE. Base UI's `handleSelection` returns before it
     changes any state when the row resolves to an `<a>` with a non-hash href, on the argument that
     the navigation is the outcome — so a repair written on its `onOpenChange` closes a palette of
     verbs and silently misses a palette of places, which is the only kind the docs site has. A
     suite with plain rows alone cannot tell the two repairs apart. */
  type Place = { value: string; label: string; href?: string; dead?: boolean };
  const PLACES: Place[] = [
    { value: "plain", label: "Rename workspace" },
    { value: "place", label: "Open the reference", href: "/nowhere" },
    { value: "dead", label: "Import from elsewhere", dead: true },
  ];

  /* CONTROLLED for every law but the refusal, and UNCONTROLLED for that one — the distinction is
     the law, not the fixture's convenience. A controlled palette refuses a dismissal by its app
     simply not writing the state, so `cancel()` is unobservable there: the first spelling of the
     refusal law was controlled and it survived a sabotage that ignored `cancel()` outright. The
     bookkeeping this component owns only exists on the uncontrolled path, so that is where the
     claim has to be read. */
  function Palette({
    log,
    refuse = false,
    refuseEscape = false,
  }: {
    log: { open: boolean; reason: string }[];
    refuse?: boolean;
    refuseEscape?: boolean;
  }) {
    const [open, setOpen] = React.useState(true);
    const controlled = !refuse && !refuseEscape;
    return (
      <Theme>
        <Command
          items={PLACES}
          {...(controlled ? { open } : { defaultOpen: true })}
          onOpenChange={(next, details) => {
            log.push({ open: next, reason: details.reason });
            if ((refuse && details.reason === "item-press") || (refuseEscape && details.reason === "escape-key")) {
              details.cancel();
              return;
            }
            if (controlled) setOpen(next);
          }}
        >
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" placeholder="Search commands…" />
            <CommandList>
              {(item: Place) => (
                <CommandItem
                  key={item.value}
                  value={item}
                  {...(item.dead ? { disabled: true } : {})}
                  {...(item.href
                    ? { render: <a href={item.href} onClick={(e: React.MouseEvent) => e.preventDefault()} /> }
                    : {})}
                >
                  {item.label}
                </CommandItem>
              )}
            </CommandList>
            <CommandEmpty>No commands match.</CommandEmpty>
          </CommandContent>
        </Command>
      </Theme>
    );
  }

  function palette(opts: { refuse?: boolean; refuseEscape?: boolean } = {}) {
    const log: { open: boolean; reason: string }[] = [];
    render(
      <Palette
        log={log}
        {...(opts.refuse ? { refuse: true } : {})}
        {...(opts.refuseEscape ? { refuseEscape: true } : {})}
      />,
    );
    settleAll();
    const rows = () => [...document.querySelectorAll<HTMLElement>(".kui-command-item")];
    if (rows().length !== PLACES.length)
      throw new Error("the palette never mounted its rows — every law below would assert nothing");
    const row = (label: string) => {
      const found = rows().find((el) => el.textContent?.includes(label));
      if (!found) throw new Error(`no row reads "${label}"`);
      return found;
    };
    const gone = () => !document.querySelector(".kui-command");
    return { log, rows, row, gone };
  }

  it("a pointer press on a row closes it", async () => {
    const { row, gone } = palette();
    await userEvent.click(row("Rename workspace"));
    expect(await until(gone), "the palette stood over the thing it had just run").toBe(true);
  });

  it("Enter on the highlighted row closes it — the gesture a palette exists for", async () => {
    const { gone } = palette();
    const input = document.querySelector<HTMLInputElement>(".kui-command-input")!;
    input.focus();
    await userEvent.keyboard("Rename");
    await until(() => document.querySelectorAll(".kui-command-item").length === 1);
    await userEvent.keyboard("{Enter}");
    expect(await until(gone), "type, Enter, and the panel never left").toBe(true);
  });

  it("a row that is a LINK closes it too, which Base UI on its own does not", async () => {
    const { row, gone } = palette();
    await userEvent.click(row("Open the reference"));
    expect(await until(gone), "a palette of places kept its panel over the page it opened").toBe(true);
  });

  it("and the reason names it, so an app can tell a run from an Escape", async () => {
    const { row, log, gone } = palette();
    await userEvent.click(row("Rename workspace"));
    await until(gone);
    expect(log.at(-1)).toEqual({ open: false, reason: "item-press" });
  });

  it("a DISABLED row runs nothing, so it closes nothing", async () => {
    const { row, log, gone } = palette();
    await userEvent.click(row("Import from elsewhere"), { force: true });
    await until(gone, 400);
    expect(gone(), "a row that cannot be run dismissed the palette").toBe(false);
    expect(log, "and it announced a dismissal that never happened").toEqual([]);
  });

  it("`cancel()` refuses it, which is how a row that does not end the interaction stays", async () => {
    const { row, log, gone } = palette({ refuse: true });
    await userEvent.click(row("Rename workspace"));
    await until(gone, 400);
    expect(gone(), "the refusal was announced and ignored").toBe(false);
    expect(log.at(-1)?.reason, "the app was never told what it was refusing").toBe("item-press");
  });

  it("a refused Escape leaves it standing — the mirror may not move where Base UI did not", async () => {
    /* The other half of the same bookkeeping, and it needed its own law: the item-press path and
       the dialog-reason path each keep their own copy of "was this refused", and a sabotage that
       dropped the second one left every other law green. Uncontrolled again, for the reason above.

       What it guards is two homes for one fact disagreeing: Base UI refuses the dismissal at its
       layer when the app cancels, and a mirror that closed anyway would take the panel down while
       the primitive still believed it was open. */
    const { gone, log } = palette({ refuseEscape: true });
    document.querySelector<HTMLInputElement>(".kui-command-input")!.focus();
    await userEvent.keyboard("{Escape}");
    await until(gone, 400);
    expect(gone(), "the refusal was announced and the mirror closed it anyway").toBe(false);
    expect(log.at(-1)?.reason).toBe("escape-key");
  });

  it("Escape still closes it, and says so with its own reason", async () => {
    const { log, gone } = palette();
    document.querySelector<HTMLInputElement>(".kui-command-input")!.focus();
    await userEvent.keyboard("{Escape}");
    expect(await until(gone), "the mirror took the dismissal away").toBe(true);
    expect(log.at(-1)).toEqual({ open: false, reason: "escape-key" });
  });
});

describe("the results pane nests its rows at every count (§6, §44, 2026-09-05)", () => {
  it("hugging ONE row it is a capsule, so it is drawn round — the shape the row is", async () => {
    /* The reported defect: "radius is wrong only when theres one element in result". At
       `radius="full"` a row is a capsule, so the concentric sum makes a one-row pane a capsule too
       — 19px of corner on a 38px box, which is the derivation working rather than failing. What
       broke was the SHAPE: `--kui-corner-k` inflates the declaration past the box, the engine
       scales it back, and draws a SQUIRCLE at the capsule limit — flatter than the round capsule
       inside it, so the pane stopped nesting the one thing it held.

       Read as the AGREEMENT between the pane and its row rather than as the string "round": the
       claim is that the two curves are the same kind of curve, and a literal would also pass on a
       pane that had gone round for no reason. The clamp guard is what says the pane really is at
       the capsule limit, without which this law is about a corner that never had to nest. */
    const { popup, input, rows } = open({ size: "2" });
    input.focus();
    await userEvent.keyboard("Rename");
    await until(() => rows().length === 1);

    const pane = popup.querySelector<HTMLElement>(".kui-command-panel")!;
    const row = rows()[0]!;
    const height = pane.getBoundingClientRect().height;
    expect(
      parseFloat(computed(pane, "border-radius")),
      "the pane is not at the capsule limit, so it never had to nest anything",
    ).toBeGreaterThanOrEqual(height / 2);
    expect(computed(pane, "corner-shape")).toBe(computed(row, "corner-shape"));
    expect(computed(pane, "corner-shape")).toBe("round");
  });

  it("holding a LIST it is not, so it keeps the family's squircle and a Menu's corner", () => {
    /* The other half, and the reason the law above is not just "the palette is round": a pane
       whose corner is well inside its own box is an ordinary floating-rows pane and must stay
       byte-identical to a Menu. Without this clause an unconditional stand-down passes. */
    const { popup, rows } = open({ size: "2" });
    expect(rows().length, "a one-row fixture makes this clause vacuous").toBeGreaterThan(1);
    const pane = popup.querySelector<HTMLElement>(".kui-command-panel")!;
    expect(
      parseFloat(computed(pane, "border-radius")),
      "the pane is at the capsule limit, so this clause is about the other law's case",
    ).toBeLessThan(pane.getBoundingClientRect().height / 2);

    render(
      <Theme>
        <Menu defaultOpen size="2">
          <MenuTrigger>open</MenuTrigger>
          <MenuContent>
            <MenuItem>Row</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    settleAll();
    const menus = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
    const menu = menus[menus.length - 1]!;
    expect(computed(pane, "corner-shape")).toBe(computed(menu, "corner-shape"));
    expect(computed(pane, "corner-shape")).toBe("squircle");
  });

  it("a caption above the one row is STILL a capsule, at every index (2026-09-06)", async () => {
    /* REVERSED, and the reversal is the whole point of the law. It read the other way until the
       rows stood a step above the palette, on a measurement that was true by a QUARTER OF A PIXEL
       — 33.25 of corner against a 67px box — which is not a boundary, it is the same case reached
       from underneath. Re-measured with the step: 33.25/66, 36.75/72, 40.25/76 and 40.25/76, so
       the corner is at or past half the box at every index and a squircle there draws the exact
       lozenge the reported defect was.

       READ AT ALL FOUR, because the old spelling was written off one, and the clamp guard is what
       makes each index a measurement rather than a restatement of the selector. */
    for (const size of ["1", "2", "3", "4"] as const) {
      render(
        <Theme>
          <Command items={GROUPS} defaultOpen size={size}>
            <CommandContent aria-label="Command palette">
              <CommandInput aria-label="Search commands" />
              <CommandList>
                {(group: { value: string; items: Cmd[] }) => (
                  <CommandGroup key={group.value} items={group.items}>
                    <CommandGroupLabel>{group.value}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
                    </CommandCollection>
                  </CommandGroup>
                )}
              </CommandList>
            </CommandContent>
          </Command>
        </Theme>,
      );
      settleAll();
      const all = document.querySelectorAll<HTMLElement>(".kui-command");
      const pop = all[all.length - 1]!;
      const field = pop.querySelector<HTMLInputElement>(".kui-command-input")!;
      field.focus();
      await userEvent.keyboard("Rename");
      await until(() => pop.querySelectorAll(".kui-command-item").length === 1);
      const box = pop.querySelector<HTMLElement>(".kui-command-panel")!;
      expect(pop.querySelectorAll(".kui-command-group-label").length, `no caption at ${size}`).toBe(1);
      expect(
        parseFloat(computed(box, "border-radius")),
        `at ${size} the captioned pane is NOT at the capsule limit — the exclusion was right`,
      ).toBeGreaterThanOrEqual(box.getBoundingClientRect().height / 2);
      expect(computed(box, "corner-shape"), `at ${size} a captioned capsule is drawn flat`).toBe("round");
    }
  });

});

describe("the results pane opens out of the search bar (§8, §22, §44 — 2026-09-05)", () => {
  /* Kushagra: "Can it also open like a menu? Or a popover, as far as motion goes, with the search
     bar being the trigger?" It can, and the reason it is honest here is the reason Popover's seed
     had to become a circle instead: §22's silhouette is only true where the panel lands ON the
     thing it came out of, and this pane sits directly under the bar at the bar's own width. So
     there is no spread to fly — the whole flight is the FALL.

     Every law below is STATIC. The pose is read by stamping the attribute Base UI applies for one
     frame and asking the cascade, and the clocks are read off the resting rule — no wall time, so
     none of this belongs to the excluded set `frames.test.ts` keeps. */


  it("the seed is the bar's own bottom edge: no rows tall, pulled up, transparent", () => {
    const { popup, pane } = unsettled();
    const landed = pane.getBoundingClientRect().height;
    expect(landed, "a pane with no height makes every clause below vacuous").toBeGreaterThan(100);

    popup.setAttribute("data-starting-style", "");
    const seed = pane.getBoundingClientRect().height;
    expect(seed, "the pane did not open out of anything — it was already its own size").toBeLessThan(
      landed / 4,
    );
    expect(computed(pane, "opacity")).toBe("0");
    // Pulled UP into the bar rather than sideways: the fall is the only axis, because the pane is
    // already the bar's width and there is nothing to spread.
    const [x, y] = computed(pane, "translate").split(" ");
    expect(x).toBe("0px");
    expect(parseFloat(y ?? "0"), "it does not come from under the bar").toBeLessThan(0);
    popup.removeAttribute("data-starting-style");
  });

  it("and it flies on the FLOATING family's clocks, never a second set of numbers", () => {
    inMotion();
    /* The claim is membership, not a duration: this component invents no motion, it takes the
       family's. Read as the agreement with the tokens rather than against literals, so a retuned
       family moves this with it. */
    const { pane } = unsettled();
    const props = computed(pane, "transition-property").split(", ");
    const times = computed(pane, "transition-duration").split(", ");
    const clock = (name: string) => times[props.indexOf(name)];
    /* Normalised to seconds, which is what `transition-duration` computes to — the token is
       authored in milliseconds and comparing the two strings raw is how this law read `345s`. */
    const secs = (v: string) => (v.trim().endsWith("ms") ? parseFloat(v) / 1000 : parseFloat(v));
    const token = (name: string) => secs(computed(pane, name));

    expect(props, "the height channel is what unfurls it").toContain("height");
    expect(secs(clock("height") ?? "")).toBeCloseTo(token("--floating-fall"), 5);
    expect(secs(clock("translate") ?? "")).toBeCloseTo(token("--floating-fall"), 5);
    // Paint is signal and geometry is physics (§8's two clocks), so they may not share a number.
    expect(secs(clock("opacity") ?? "")).toBeCloseTo(token("--floating-paint"), 5);
    expect(clock("opacity")).not.toBe(clock("height"));
  });

  it("reduced motion: it is simply there", async () => {
    inMotion();
    await asksForStillness();
    const { popup, pane } = unsettled();
    popup.setAttribute("data-starting-style", "");
    expect(computed(pane, "opacity"), "the seed survived a request for stillness").toBe("1");
    expect(computed(pane, "translate")).toBe("none");
    expect(computed(pane, "transition-duration")).toMatch(/^0s(, 0s)*$/);
    popup.removeAttribute("data-starting-style");
  });
});

describe("the empty state is what the results pane shows, not a pane beside it (§44, 2026-09-05)", () => {
  /** A palette filtered down to nothing. */
  async function nothing(size: "1" | "2" | "3" | "4" = "2") {
    const { popup, input, rows } = open({ size });
    input.focus();
    await userEvent.keyboard("zzzzzz");
    await until(() => rows().length === 0);
    const pane = popup.querySelector<HTMLElement>(".kui-command-panel");
    const empty = popup.querySelector<HTMLElement>(".kui-command-empty");
    if (!pane || !empty) throw new Error("the pane or the message never mounted");
    return { popup, pane, empty, rows };
  }

  it("it renders INSIDE the pane, so there is one box and it cannot disagree with itself", async () => {
    /* The defect: it was a third pane in the column wearing `kui-surface kui-overlay`, so the thing
       standing in for a menu-boxed pane was boxed like a dialog — 64.52px of corner over 24px of
       inset against 33.25 over 4. Read as CONTAINMENT rather than as two boxes agreeing, because
       agreement is what two tables can be kept in for a while and containment is what they cannot
       drift out of. */
    const { pane, empty } = await nothing();
    expect(pane.contains(empty), "the message is still a pane of its own").toBe(true);
    expect(empty.classList.contains("kui-surface"), "it is still a pane").toBe(false);
    expect(pane.getBoundingClientRect().height).toBeGreaterThan(0);
  });

  it("so the palette wears ONE pane in both states, at the same corner", async () => {
    const { pane } = await nothing();
    const emptyCorner = computed(pane, "border-radius");
    const { popup } = open({ size: "2" });
    const full = popup.querySelector<HTMLElement>(".kui-command-panel")!;
    expect(emptyCorner).toBe(computed(full, "border-radius"));
    expect(computed(pane, "padding")).toBe(computed(full, "padding"));
  });

  it("and the pane is gone only when it has NEITHER rows nor a message", async () => {
    // A palette narrowed to nothing still has a pane, because the message is in it. What has no
    // pane is a palette with nothing to say at all — the state a search too short to run is in.
    const { pane } = await nothing();
    expect(computed(pane, "display")).not.toBe("none");

    render(
      <Theme>
        <Command items={[]} defaultOpen size="2">
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" />
            <CommandList>{(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}</CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const popups = document.querySelectorAll<HTMLElement>(".kui-command");
    const bare = popups[popups.length - 1]!.querySelector<HTMLElement>(".kui-command-panel")!;
    expect(computed(bare, "display")).toBe("none");
  });

  it("the message arrives out of a BLUR, and the list does the same coming back", async () => {
    /* Kushagra: "add motion to how the list goes from wherever it is to empty state, preferably
       blur fade in and out that we use." Read statically at both ends of the state change, which is
       also the shape of the mechanism: neither element is ever inserted — the live region exists on
       every frame and the list never leaves — so `@starting-style` fires on neither and what runs is
       a transition declared on both sides of a selector change. Built the other way first and
       measured: the message arrived at full opacity with `blur(0px)`. */
    inMotion();
    /* Unsettled on purpose: `settle()` writes `transition: none !important` on every element in the
       popup, which is the declaration this law is about. */
    const { popup } = unsettled();
    const input = popup.querySelector<HTMLInputElement>(".kui-command-input")!;
    input.focus();
    await userEvent.keyboard("zzzzzz");
    await until(() => popup.querySelectorAll(".kui-command-item").length === 0);
    const empty = popup.querySelector<HTMLElement>(".kui-command-empty")!;
    await until(() => computed(empty, "opacity") === "1");
    expect(computed(empty, "filter")).toBe("blur(0px)");
    expect(computed(empty, "transition-property")).toContain("filter");

    const list = popup.querySelector<HTMLElement>(".kui-command-list")!;
    const blurred = computed(list, "filter");
    expect(blurred, "the list is not stood down while the message speaks").not.toBe("blur(0px)");
    expect(computed(list, "opacity")).toBe("0");

    // …and the other end of the same declaration, on a palette that still has rows.
    const { popup: full } = unsettled();
    const shown = full.querySelector<HTMLElement>(".kui-command-list")!;
    expect(computed(shown, "opacity")).toBe("1");
    expect(computed(shown, "filter")).toBe("blur(0px)");
    const hidden = full.querySelector<HTMLElement>(".kui-command-empty")!;
    expect(computed(hidden, "opacity")).toBe("0");
  });
});

describe("the pane tells the LENS where it is going (§10, §22 — 2026-09-05)", () => {
  /* Kushagra: "the big issue is that after animation completes, the bg changes and gets thicker in
     a jump." That jump is the refraction arriving late, and it is the 2026-08-22 audit's finding
     reached from the other side: the lens mints a pane's displacement map on mount and on resize,
     and a flight resizes a pane on every frame. Measured on this pane before the repair: no lens at
     all for the first ~130ms and then four maps in a row, each built for the previous frame's box.
     The family's answer is to publish the box the flight is HEADING TO and mark the flight, so the
     map is built once, up front, for the box it will actually bend — and this pane speaks that
     vocabulary even though it has no positioner and no runner. */

  it("on open it publishes the box it is heading to, and marks itself in flight", () => {
    const { pane } = unsettled();
    expect(pane.hasAttribute("data-unfurling"), "the lens is left to chase a moving box").toBe(true);
    const published = parseFloat(pane.style.getPropertyValue("--kui-fly-h"));
    expect(published, "nothing was published, so the mark says only 'wait'").toBeGreaterThan(0);
    expect(published).toBe(pane.offsetHeight);
    expect(parseFloat(pane.style.getPropertyValue("--kui-fly-w"))).toBe(pane.offsetWidth);
  });

  /** Opened the way a person opens it — by pressing the trigger — which is the only arrangement
      where the popup is already posed when this component's own effect runs. `defaultOpen` mounts
      everything in one commit and React runs a child's layout effects before its parent's, so the
      popup has not been stamped yet and the pane is standing at its full height with no scale on
      it. Two sabotages survived a `defaultOpen` fixture and both were about exactly that gap. */
  async function openedByPress() {
    inMotion();
    render(
      <Theme>
        <Command items={FLAT} size="2">
          <CommandTrigger render={<Button>open</Button>} />
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" />
            <CommandList>
              {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
            </CommandList>
            <CommandEmpty>No commands match.</CommandEmpty>
          </CommandContent>
        </Command>
      </Theme>,
    );
    const trigger = [...document.querySelectorAll<HTMLElement>("button")].filter((b) => b.textContent === "open").at(-1)!;
    trigger.click();
    await until(() => !!document.querySelector(".kui-command-panel"));
    const popups = document.querySelectorAll<HTMLElement>(".kui-command");
    const popup = popups[popups.length - 1]!;
    const pane = popup.querySelector<HTMLElement>(".kui-command-panel")!;
    return { popup, pane };
  }

  it("it is the LAYOUT box, never the painted one", async () => {
    /* A dialog's entry steps the whole popup 3% back in z, so a rect taken through it is the
       scaled box: the first spelling published 303.61px for a pane that lands at 313, and the lens
       re-minted once on arrival — the pop this mechanism exists to remove, made smaller. The
       family's own width-floor defect (2026-08-22) is this mistake one component over. */
    const { pane } = await openedByPress();
    const published = parseFloat(pane.style.getPropertyValue("--kui-fly-h"));
    expect(published, "nothing was published, so this law is the first one again").toBeGreaterThan(0);
    // Read against where it LANDS, which is the only box the published one is a claim about — the
    // pane's own height while it is still flying is neither.
    await until(() => !pane.hasAttribute("data-unfurling"));
    const landed = pane.offsetHeight;
    expect(landed, "it never opened, so the comparison below is two seeds").toBeGreaterThan(100);
    expect(published, "the box was measured through the popup's own 3% pose").toBe(landed);
  });

  it("and the mark comes off, or the lens would never measure again", async () => {
    /* Left on, `flying()` is true forever and the pane keeps its arrival map for the rest of its
       life — which is wrong the moment it holds the message instead of the list, a different box.
       There is a clock behind this and it is a guard rather than the mechanism: an ordinary open
       lands on the height's own `transitionend`. */
    /* ONE SABOTAGE SURVIVES THIS FILE AND IS RECORDED RATHER THAN PAPERED OVER: deleting the
       `transition: none` the effect writes around its own measurement leaves every law here green.
       That defect is real and was measured in a real browser — lifting the height starts a
       transition on the channel this effect watches and restoring it cancels one, so
       `transitioncancel` landed the flight before it began and the mark never survived a single
       frame. A mount cannot reproduce it: the harness commits the palette in one pass and React
       runs a child's layout effects before its parent's, so the popup is not posed yet and the
       pane's height does not change when it is lifted — no transition starts, so none can be
       cancelled. The falsification that does belong here is the one below. */
    const { pane } = await openedByPress();
    expect(pane.hasAttribute("data-unfurling"), "it never marked the flight at all").toBe(true);
    expect(await until(() => !pane.hasAttribute("data-unfurling")), "it never landed").toBe(true);
    expect(pane.style.getPropertyValue("--kui-fly-h"), "the box outlived the flight").toBe("");
  });
});

describe("nothing above a pane may carry a FILTER (§10, §24 — 2026-09-05)", () => {
  it("because a filter is a backdrop root, and the glass under one samples nothing", () => {
    /* The second half of "the bg gets thicker in a jump", and the half that was actually visible.
       §24 blurs `.kui-dialog-body` on the way in so the print comes into focus with the plane — a
       channel chosen because it presumes nothing about content the system does not own. It presumes
       one thing after all: that the content is not GLASS. A `filter` makes an element a backdrop
       root, so every `backdrop-filter` beneath it stops sampling the page. Measured frame by frame:
       for the whole entry the two panes drew their blur, saturation and lens on an empty backdrop,
       and the instant the body's filter reached `none` the page appeared behind them.

       Until 2026-09-05 the palette had ONE pane and it was the popup, so the body's filter sat
       inside the glass rather than over it and this could not happen. Read as a walk from the pane
       to the popup rather than as one selector, because what is wrong is any filter anywhere on
       that chain — the rule is about the chain, not about the element that happened to break it. */
    const { popup, pane } = unsettled();
    // A glass palette, or there is no backdrop to lose and the law is about nothing.
    render(<Theme material="regular" />);
    popup.setAttribute("data-starting-style", "");
    const filters: string[] = [];
    for (let el: HTMLElement | null = pane; el && el !== popup.parentElement; el = el.parentElement) {
      if (el !== pane) filters.push(computed(el, "filter"));
    }
    popup.removeAttribute("data-starting-style");
    expect(filters.length, "the walk found no ancestors, so it asserted nothing").toBeGreaterThan(1);
    expect(filters, "a filter over the palette's panes empties the backdrop their glass samples").toEqual(
      filters.map(() => "none"),
    );
  });

  it("and the panes really are glass, or the clause above is about nothing", () => {
    render(
      <Theme material="regular">
        <Command items={FLAT} defaultOpen size="2">
          <CommandContent aria-label="Command palette">
            <CommandInput aria-label="Search commands" />
            <CommandList>
              {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
            </CommandList>
            <CommandEmpty>No commands match.</CommandEmpty>
          </CommandContent>
        </Command>
      </Theme>,
    );
    settleAll();
    const popups = document.querySelectorAll<HTMLElement>(".kui-command");
    const popup = popups[popups.length - 1]!;
    for (const sel of [".kui-command-search", ".kui-command-panel"]) {
      const pane = popup.querySelector<HTMLElement>(sel)!;
      expect(computed(pane, "backdrop-filter"), `${sel} resolves no material`).not.toBe("none");
    }
  });
});

describe("a closed palette has an empty query, and it says so (§44, 2026-09-05)", () => {
  /* Kushagra: "I type letters, and search results come up. next time I open, results are still
     there." The field itself comes back blank — the panel unmounts with the dialog — but anything
     the app DERIVED from the query does not, because every keystroke was reported and the reset was
     not. The docs site's own search is the shape that breaks: it holds the query, computes its
     results from it and hands them back as `items`, so the palette reopened showing the previous
     search's matches under an empty field. */

  function reported() {
    const log: string[] = [];
    function App() {
      const [open, setOpen] = React.useState(false);
      return (
        <Theme>
          <Command items={FLAT} open={open} onOpenChange={(next) => setOpen(next)}>
            <CommandTrigger render={<Button>open</Button>} />
            <CommandContent aria-label="Command palette" onQueryChange={(q) => log.push(q)}>
              <CommandInput aria-label="Search commands" />
              <CommandList>
                {(item: Cmd) => <CommandItem key={item.value} value={item}>{item.label}</CommandItem>}
              </CommandList>
              <CommandEmpty>No commands match.</CommandEmpty>
            </CommandContent>
          </Command>
        </Theme>
      );
    }
    render(<App />);
    const trigger = [...document.querySelectorAll<HTMLElement>("button")].filter((b) => b.textContent === "open").at(-1)!;
    return { log, trigger };
  }

  it("closing reports the empty query, so nothing derived from it outlives the panel", async () => {
    const { log, trigger } = reported();
    trigger.click();
    await until(() => !!document.querySelector(".kui-command-input"));
    const input = document.querySelector<HTMLInputElement>(".kui-command-input")!;
    input.focus();
    await userEvent.keyboard("Ren");
    await until(() => log.at(-1) === "Ren");

    await userEvent.keyboard("{Escape}");
    expect(await until(() => log.at(-1) === ""), `the last query reported was "${log.at(-1)}"`).toBe(true);
  });

  it("and it is reported when the PANEL goes, not when the component does", async () => {
    /* The mechanism, read as the defect it replaces. `CommandContent` is rendered by the caller
       inside `<Command>` and stays mounted for as long as the palette exists — a dialog decides
       whether to render a PORTAL, not whether its content component runs — so a cleanup written
       there fires on navigation and never on a close. Measured that way first: the popup unmounted
       and the rows stayed. What this asserts is the difference: the reset arrives while the palette
       is still in the page and can be opened again. */
    const { log, trigger } = reported();
    trigger.click();
    await until(() => !!document.querySelector(".kui-command-input"));
    document.querySelector<HTMLInputElement>(".kui-command-input")!.focus();
    await userEvent.keyboard("Ren");
    await userEvent.keyboard("{Escape}");
    await until(() => log.at(-1) === "");
    expect(document.contains(trigger), "the whole palette left the page, so this proves nothing").toBe(true);

    // …and it opens again with a clean query rather than one reset per lifetime.
    trigger.click();
    await until(() => !!document.querySelector(".kui-command-input"));
    document.querySelector<HTMLInputElement>(".kui-command-input")!.focus();
    await userEvent.keyboard("Ap");
    await until(() => log.at(-1) === "Ap");
    await userEvent.keyboard("{Escape}");
    expect(await until(() => log.at(-1) === ""), "the second close reported nothing").toBe(true);
  });
});
