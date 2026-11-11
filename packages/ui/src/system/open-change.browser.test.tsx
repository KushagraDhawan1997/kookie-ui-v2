/**
 * Every floating panel says WHY it opened or closed, and lets the caller refuse (2026-11-11).
 *
 * Dialog, AlertDialog, Sheet and Command already did. Popover, Menu, ContextMenu, Select,
 * Combobox and Tooltip reported only open or closed, so the guard a Dialog could write ("you
 * have unsaved changes") could not be written on a Popover. Each law provokes a real Escape and
 * reads the reason back, which is also what catches a rename upstream.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { mounted, until } from "../test/browser.tsx";
import { Button } from "../components/button/button.tsx";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "../components/combobox/combobox.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../components/menu/menu.tsx";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../components/popover/popover.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select/select.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/tooltip/tooltip.tsx";

type Seen = { open: boolean; reason: string; hasEvent: boolean };
type Report = (open: boolean, details: { reason: string; event: Event; cancel: () => void }) => void;

/** Each panel, open at the start, with the selector that says it is on screen. */
const PANELS: { name: string; popup: string; ui: (onOpenChange: Report) => React.ReactElement }[] = [
  {
    name: "Popover",
    popup: ".kui-popover-popup",
    ui: (onOpenChange) => (
      <Popover defaultOpen onOpenChange={onOpenChange}>
        <PopoverTrigger render={<Button>Open</Button>} />
        <PopoverContent>
          <PopoverTitle>Filters</PopoverTitle>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    name: "Menu",
    popup: ".kui-menu-popup",
    ui: (onOpenChange) => (
      <Menu defaultOpen onOpenChange={onOpenChange}>
        <MenuTrigger render={<Button>Open</Button>} />
        <MenuContent>
          <MenuItem>Rename</MenuItem>
        </MenuContent>
      </Menu>
    ),
  },
  {
    name: "Select",
    popup: ".kui-select-popup",
    ui: (onOpenChange) => (
      <Select defaultOpen defaultValue="a" onOpenChange={onOpenChange}>
        <SelectTrigger aria-label="Letter" />
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
          <SelectItem value="b">B</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    name: "Combobox",
    popup: ".kui-combobox-popup",
    ui: (onOpenChange) => (
      <Combobox items={["Lisbon", "Madrid"]} defaultOpen onOpenChange={onOpenChange}>
        <ComboboxInput aria-label="City" />
        <ComboboxContent>
          <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    ),
  },
  {
    name: "Tooltip",
    popup: ".kui-tooltip-popup",
    ui: (onOpenChange) => (
      <TooltipProvider>
        <Tooltip defaultOpen onOpenChange={onOpenChange}>
          <TooltipTrigger render={<Button iconOnly aria-label="Undo">U</Button>} />
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
];

const present = (selector: string) => document.querySelectorAll(selector).length;

/** Escape goes to whatever holds focus, so wait until the panel has taken it. A combobox keeps
    focus in its input, and a tooltip never takes it (it listens on the document). */
async function focused(name: string, host: HTMLElement): Promise<void> {
  if (name === "Tooltip") return;
  if (name === "Combobox") {
    host.querySelector<HTMLElement>("input")?.focus();
    return;
  }
  await until(() => document.activeElement?.closest(".kui-floating") != null, 1000);
}

/** A panel can ignore a key for a moment after it opens, so Escape is pressed until it is heard. */
async function escapeUntil(heard: () => boolean): Promise<boolean> {
  for (let tries = 0; tries < 12 && !heard(); tries++) {
    await userEvent.keyboard("{Escape}");
    await until(heard, 250);
  }
  return heard();
}

describe("a floating panel says why it closed, and the caller can refuse (2026-11-11)", () => {
  for (const panel of PANELS) {
    it(`${panel.name}: Escape reports "escape-key" with its event, and closes`, async () => {
      const before = present(panel.popup);
      const seen: Seen[] = [];
      const host = mounted(<div>{panel.ui((open, d) => seen.push({ open, reason: d.reason, hasEvent: d.event instanceof Event }))}</div>, { theme: {} });
      expect(await until(() => present(panel.popup) > before), "vacuity: the panel has to be open").toBe(true);
      await focused(panel.name, host);
      expect(await escapeUntil(() => seen.some((s) => !s.open))).toBe(true);
      const close = seen.find((s) => !s.open)!;
      expect(close.reason).toBe("escape-key");
      expect(close.hasEvent).toBe(true);
      expect(await until(() => present(panel.popup) === before)).toBe(true);
    });

    it(`${panel.name}: cancel() keeps it open`, async () => {
      const before = present(panel.popup);
      let asked = 0;
      const host = mounted(
        <div>
          {panel.ui((open, d) => {
            if (open) return;
            asked += 1;
            d.cancel();
          })}
        </div>,
        { theme: {} },
      );
      expect(await until(() => present(panel.popup) > before), "vacuity: the panel has to be open").toBe(true);
      await focused(panel.name, host);
      expect(await escapeUntil(() => asked > 0)).toBe(true);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      expect(present(panel.popup), "the refused close still closed it").toBeGreaterThan(before);
    });
  }
});
