/**
 * Command's laws, mounted (§44).
 *
 * The load-bearing ones are the two claims the component exists to make: it IS a Dialog (so
 * every overlay guarantee arrives by membership rather than by re-implementation), and the
 * keyboard model is the package's while the list stays the app's. The rest reads the one
 * arrangement this component actually states — a field flush at the top of a pane whose
 * padding it does not want.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { APPEARANCES, computed, render, settleAll, until, within } from "../../test/browser.tsx";
import { Theme } from "../../theme/theme.tsx";
import { Dialog, DialogContent, DialogTitle } from "../dialog/dialog.tsx";
import { Button } from "../button/button.tsx";
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

  it("the pane's padding is zero, and the designed inset SURVIVES for the parts to read", () => {
    /* Both halves, because the cheap way to get an edge-to-edge palette is `--kui-sf-p: 0`,
       which takes the number every part below needs to place its own text with it. Falsified
       by zeroing the hook instead of the padding. */
    const { popup } = open({ size: "2" });
    for (const side of ["padding-top", "padding-right", "padding-bottom", "padding-left"] as const) {
      expect(computed(popup, side), `the pane kept ${side}`).toBe("0px");
    }

    // The surviving number, read as the AGREEMENT it exists for: the field's text sits on the
    // vertical a plain Dialog's padding would have put it on. A token name would still pass
    // if the hook resolved to nothing; a resolved distance cannot.
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
    const field = within(popup, ".kui-command-field");
    expect(parseFloat(computed(plain, "padding-left"))).toBeGreaterThan(0);
    expect(computed(field, "padding-left")).toBe(computed(plain, "padding-left"));
  });
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

  it("the field draws no box: a palette is already the focused thing", () => {
    /* A TextField's whole identity is a bounded box with a seal, an edge and a ring. Drawing
       one at the top of a panel puts a box inside a box. Read as paint, not as a class. */
    const { input } = open();
    expect(computed(input, "border-top-width")).toBe("0px");
    expect(computed(input, "background-color")).toBe("rgba(0, 0, 0, 0)");
    // FOCUSED FIRST. `outline-style` is `none` by initial value on an unfocused element, so
    // the clause could not fail where it stood — this repo's own 2026-08-17 lesson about a
    // programmatic open not making anything `:focus-visible`, reproduced in a new law.
    input.focus();
    expect(computed(input, "outline-style"), "a field inside the panel draws no ring of its own").toBe("none");
  });

});

describe("size prices what four documents say it prices (audit 2026-09-02)", () => {
  /* The field's height and font and the captions' inset were pinned at index 2, and every
     size-bearing law ran at index 2 — the one index where the pin is invisible. */
  for (const size of ["1", "3", "4"] as const) {
    it(`${size}: the field stands level with a control at the same index`, () => {
      const { input } = open({ size });
      const bar = render(
        <Theme>
          <Button size={size}>Level</Button>
        </Theme>,
      );
      settleAll();
      expect(computed(input, "block-size")).toBe(computed(within(bar, ".kui-button"), "block-size"));
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
