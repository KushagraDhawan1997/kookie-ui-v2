/**
 * Command's laws, mounted (§44).
 *
 * The load-bearing ones are the two claims the component exists to make: it IS a Dialog (so
 * every overlay guarantee arrives by membership rather than by re-implementation), and the
 * keyboard model is the package's while the list stays the app's. The rest reads the one
 * arrangement this component actually states — a padded pane holding two objects, a field and
 * a list, with an interval rather than a hairline between them (reversed 2026-09-04).
 */
import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { APPEARANCES, computed, render, settleAll, until, within } from "../../test/browser.tsx";
import { VIEWPORT } from "../../test/viewport.ts";
import { Theme } from "../../theme/theme.tsx";
import { Dialog, DialogContent, DialogTitle } from "../dialog/dialog.tsx";
import { Box } from "../box/box.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { TextField } from "../text-field/text-field.tsx";
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
  return { popup, input, rows: () => [...popup.querySelectorAll<HTMLElement>(".kui-command-item")] };
}

describe("a palette IS a Dialog, so every overlay guarantee arrives by membership (§44, §24)", () => {
  it("it renders the dialog's own panel and scrim, not a second overlay", () => {
    const { popup } = open();
    expect(popup.classList.contains("kui-dialog-popup")).toBe(true);
    expect(document.querySelectorAll(".kui-dialog-backdrop").length).toBeGreaterThan(0);
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: the pane's corner and cast are a Dialog's, unchanged`, () => {
      const { popup } = open({ theme: { appearance } });
      render(
        <Theme appearance={appearance}>
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
      expect(computed(popup, "border-radius")).toBe(computed(plain, "border-radius"));
      expect(computed(popup, "box-shadow")).toBe(computed(plain, "box-shadow"));
    });
  }

  it("the pane PADS, like every other dialog at the same index (reversed 2026-09-04)", () => {
    /* It shipped edge-to-edge, and the argument for that — a lit row reads as a band from wall
       to wall — does not survive the panel it was made about: `--radius-overlay-2` is 40px, so
       the bands at the top and bottom of the list were being eaten by the pane's own corner.

       Read as the AGREEMENT rather than as a number, on both counts. A literal would pass a
       palette that pads by some other inset it invented, and it would go stale the day the
       overlay band moves; what is being claimed is that this pane is a dialog and pads like one.
       Falsified by putting `padding: 0` back. */
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
    // THE VACUITY GUARD FIRST: the whole law is "these two agree", which a pair of zeroes
    // satisfies — and a pair of zeroes is precisely the defect.
    expect(parseFloat(computed(plain, "padding-left"))).toBeGreaterThan(0);
    for (const side of ["padding-top", "padding-right", "padding-bottom", "padding-left"] as const) {
      expect(computed(popup, side), `the palette's ${side} is a dialog's`).toBe(computed(plain, side));
    }
  });

  it("so a band has two ends: the field and every row span the pane's inset box exactly", () => {
    /* The measured half of the reversal, and the one a padding law cannot make on its own —
       a padded pane whose list bled back out to the edges would pass the law above and look
       exactly like the defect. Read off the painted boxes, both walls.

       BOTH DIRECTIONS, and the FIELD is in the list of subjects on purpose. `.kui-control` is
       `inline-flex`, so every member shrink-wraps its content: a law that only forbade reaching
       the wall would pass a field as wide as its own placeholder, and a law that only read the
       field's height would pass it too. */
    const { popup, rows } = open({ size: "2" });
    const pane = popup.getBoundingClientRect();
    /* `clientLeft`/`clientWidth`, not the rect plus `--border-width` — a rect is the BORDER
       box, and rebuilding the padding box by hand came out one pixel wrong here exactly as it
       did in the 2026-08-21 shell round (measured 25 against 24). Read the browser's own
       answer for where the padding box starts. */
    const padLeft = pane.left + popup.clientLeft + parseFloat(computed(popup, "padding-left"));
    const padRight =
      pane.left + popup.clientLeft + popup.clientWidth - parseFloat(computed(popup, "padding-right"));
    for (const el of [within(popup, ".kui-command-field"), ...rows()]) {
      const box = el.getBoundingClientRect();
      expect(box.left, `${el.className}: leading edge`).toBeCloseTo(padLeft, 0);
      expect(box.right, `${el.className}: trailing edge`).toBeCloseTo(padRight, 0);
    }
  });
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

    // AND IT IS STILL A ROW: the render escape swaps the element, never the membership.
    expect(row.classList.contains("kui-row")).toBe(true);
    const bar = render(
      <Theme>
        <Button size="2">Level</Button>
      </Theme>,
    );
    settleAll();
    expect(computed(row, "block-size")).toBe(computed(within(bar, ".kui-button"), "block-size"));
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

    const area = within(popup, ".kui-scroll-area").getBoundingClientRect();
    const pane = popup.getBoundingClientRect();
    const padLeft = pane.left + popup.clientLeft + parseFloat(computed(popup, "padding-left"));
    const wallLeft = pane.left + popup.clientLeft;
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
    const tall = [...document.querySelectorAll<HTMLElement>(".kui-command")].pop()!;
    const tallBox = tall.getBoundingClientRect();
    const tallArea = within(tall, ".kui-scroll-area").getBoundingClientRect();
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
    const field = within(popup, ".kui-command-field");

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

  it("the field sits ONE pane inset from the top and does not move when you scroll", async () => {
    /* Kushagra, 2026-09-04: "its too low… position the search near the top like literally
       everything else". A sticky element moves whenever its resting position and its offset
       differ, and they did — the viewport's own top padding put the field at one inset while the
       offset pinned it at another, so it rested a second inset low and the first row came out
       level with it. The viewport pads nothing above for this pane and the field carries the inset
       as its own margin, which is then read a second time as the offset: one number, so resting
       and pinned are the same place by construction.

       BOTH CLAIMS, and the second is the one that catches a regression: where it sits, and that
       scrolling does not move it. A law reading only the resting position passes a field that
       jumps on the first wheel click. */
    const many = Array.from({ length: 40 }, (_, i) => ({ value: `y${i}`, label: `Command ${i}` }));
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
    const field = within(popup, ".kui-command-field");
    const viewport = within(popup, ".kui-scroll-viewport");
    const inset = parseFloat(computed(popup, "padding-top"));
    expect(inset, "a pane that pads nothing makes this unobservable").toBeGreaterThan(0);

    const wall = popup.getBoundingClientRect().top + popup.clientTop;
    const atRest = field.getBoundingClientRect().top;
    expect(atRest - wall, "the field is not one inset from the pane's top").toBeCloseTo(inset, 0);

    viewport.scrollTop = 200;
    await until(() => viewport.scrollTop > 0);
    settleAll();
    expect(field.getBoundingClientRect().top, "the field moved when the list did").toBeCloseTo(atRest, 0);
  });

  it("and the content really does pass BEHIND it, not stop at it", async () => {
    /* Kushagra, 2026-09-04: "the content should scroll behind". The first repair put the scroller
       around the LIST alone, which made the field a lid the rows stopped under — it looked like a
       bleed at the bottom and was not one at the top. The panel is one scrolling region now and
       the field is `position: sticky` inside it.

       READ AS AN OVERLAP AND A HIT TEST, which is the only way to tell "behind" from "above": a
       row's painted box has to reach INTO the field's box, and the point where they meet has to
       belong to the field. A law that only measured the field's position would pass a lid. */
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
    const field = within(popup, ".kui-command-field");

    viewport.scrollTop = 120;
    await until(() => viewport.scrollTop > 0);
    settleAll();

    const fb = field.getBoundingClientRect();
    const rows = [...popup.querySelectorAll<HTMLElement>(".kui-command-item")];
    const behind = rows.filter((r) => {
      const b = r.getBoundingClientRect();
      return b.top < fb.bottom && b.bottom > fb.top;
    });
    expect(behind.length, "no row reached the field's box — it is a lid, not a pane").toBeGreaterThan(0);

    // And the field is what is painted there: sticky makes it a positioned element, so it takes
    // the point without a z-index.
    const hit = document.elementFromPoint(fb.left + fb.width / 2, fb.top + fb.height / 2);
    expect(hit !== null && field.contains(hit), "a row is painting over the field").toBe(true);
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

    /* IT RIDES THE LADDER, and does not take the menu's notch — the row family's 2026-08-26
       posture: a standing row stands level with the Button beside it, and only a FLOATING
       panel notches, on the sparse-menu judgment. A palette's panel is a Dialog, and its list
       is one you browse rather than a sparse set of actions, so it stands. Asserted against a
       mounted Button, which is what "rides the ladder" means, rather than against a token. */
    const bar = render(
      <Theme>
        <Button size="2">Level</Button>
      </Theme>,
    );
    settleAll();
    const button = within(bar, ".kui-button");
    expect(computed(row, "block-size")).toBe(computed(button, "block-size"));
  });

  it("the field IS a field, and it joins by membership rather than by imitation", () => {
    /* Reversed 2026-09-04. It drew no box on the argument that a bounded box inside a panel
       that is already the only focused thing puts a box inside a box — an argument made about a
       pane with no padding, where the line and the wall were the same edge.

       READ AGAINST A MOUNTED TextField at the same index, not against literals: what is being
       claimed is membership, so a hand-copied well and edge that happened to match today would
       satisfy a value law and drift tomorrow. Falsified by taking the two family classes off. */
    const { popup } = open({ size: "2" });
    const field = within(popup, ".kui-command-field");
    expect(field.classList.contains("kui-control")).toBe(true);
    expect(field.classList.contains("kui-field")).toBe(true);

    const bar = render(
      <Theme>
        <TextField size="2" aria-label="Twin" />
      </Theme>,
    );
    settleAll();
    const twin = within(bar, ".kui-field");
    // The vacuity guard: a family whose well were transparent and whose edge were none would
    // make every clause below true of a bare line as well.
    expect(computed(twin, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
    expect(parseFloat(computed(twin, "border-top-width"))).toBeGreaterThan(0);
    for (const prop of ["background-color", "border-top-width", "border-top-color", "border-radius"] as const) {
      expect(computed(field, prop), `the palette's field states its own ${prop}`).toBe(computed(twin, prop));
    }
  });

  it("and the hairline under it is gone: the interval is the boundary", () => {
    /* The second half of the same reversal. Two regions separated by a real distance do not
       also need a rule drawn between them — and the rule is what made the field read as a
       header band rather than as a control. Both halves, because deleting the border while
       leaving the field flush against the list is a different, worse thing. */
    const { popup } = open({ size: "2" });
    const field = within(popup, ".kui-command-field");
    expect(computed(field, "border-bottom-width"), "the field kept its separator").toBe(
      computed(field, "border-top-width"),
    );
    expect(parseFloat(computed(field, "margin-bottom")), "nothing stands between the field and the list").toBeGreaterThan(0);
  });

  it("its ring is the family's — focus is a MODE, however you arrived", () => {
    /* The field family's one departure from §8's `:focus-visible`: you do not press a field,
       you enter it. A palette focuses its own input on open, so this is the state every real
       palette is in — and it was `none` for the whole of the bare line's life. */
    const { input } = open();
    input.focus();
    expect(computed(input, "outline-style"), "the input drew a second ring inside the field's").toBe("none");
    const field = input.closest(".kui-command-field") as HTMLElement;
    expect(computed(field, "outline-style")).toBe("solid");
    expect(parseFloat(computed(field, "outline-width"))).toBeGreaterThan(0);
  });
});

describe("size prices what four documents say it prices (audit 2026-09-02)", () => {
  /* The field's height and font and the captions' inset were pinned at index 2, and every
     size-bearing law ran at index 2 — the one index where the pin is invisible. */
  for (const size of ["1", "3", "4"] as const) {
    it(`${size}: the field stands level with a control at the same index`, () => {
      /* The FIELD's box, not the input's: the input is `align-self: stretch` inside it, so it
         reports the content box and would agree with a button only by coincidence. */
      const { popup } = open({ size });
      const bar = render(
        <Theme>
          <Button size={size}>Level</Button>
        </Theme>,
      );
      settleAll();
      expect(computed(within(popup, ".kui-command-field"), "block-size")).toBe(
        computed(within(bar, ".kui-button"), "block-size"),
      );
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

describe("on a narrow window the palette is a sheet, and the general bleed is simply true of it", () => {
  /* THE LAW EXISTS BECAUSE A DELETION COULD ONLY BE CHECKED HERE. `dialog.css` carried an
     exception for this component inside the sheet media query — `margin: 0; padding: 0` on a
     palette's body — because the shared bleed cancels a padding the pane did not have, and
     without it the body bled out on all four sides and overflowed its own clipping panel by
     ~23px (audit 2026-09-02, found by measurement and guarded by nothing). The pane pads now, so
     the carve-out deletes; what nothing in the suite could see is whether the general rule is
     actually right about this pane, because the browser suite's viewport is pinned wide.

     Falsified by putting the exception back, which strands the body's re-padding: the field
     lands on the pane's own wall. */
  const PHONE = { width: 390, height: 844 };

  afterEach(async () => {
    await page.viewport(VIEWPORT.width, VIEWPORT.height);
  });

  it("the body bleeds and re-pads, so nothing overflows the pane and nothing sits on its wall", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const { popup, rows } = open({ size: "2" });
    const body = popup.querySelector<HTMLElement>(".kui-dialog-body");
    if (!body) throw new Error("the body never mounted");

    const pane = popup.getBoundingClientRect();
    const inset = parseFloat(computed(popup, "padding-left"));
    expect(inset, "a pane that pads nothing makes every clause below vacuous").toBeGreaterThan(0);

    // The bleed itself: the body reaches the pane's own edges, which is what the negative
    // margin is for, and does not reach past them — the ~23px overflow was the defect.
    const b = body.getBoundingClientRect();
    expect(b.left).toBeCloseTo(pane.left + popup.clientLeft, 0);
    expect(b.width).toBeCloseTo(popup.clientWidth, 0);

    // And the re-padding: the field and the rows still stand one inset off the wall, which is
    // the half a bleed on its own would lose.
    for (const el of [within(popup, ".kui-command-field"), ...rows()]) {
      expect(el.getBoundingClientRect().left - (pane.left + popup.clientLeft), `${el.className}`)
        .toBeCloseTo(inset, 0);
    }
  });
});
