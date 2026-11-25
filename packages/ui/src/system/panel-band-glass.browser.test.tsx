/**
 * A PANEL'S BAND IS GLASS AGAIN (2026-11-25). Inside a glass dialog, sheet or popover the content
 * resolves on-glass, because the panel has spent the backdrop. Its toolbars are the exception:
 * Close, the tools beside it and an action row are chrome that content passes behind, so their
 * controls express the theme's material. Kushagra, on the test dialogs: "Needs glass", then
 * "I think this is good"; and on why a glass notice does NOT get this, "We need to allow it in
 * dialogs popover etc because those have a scrim behind, so its not apples to apples".
 */
import * as React from "react";
import { describe, expect, it } from "vitest";

import { mounted, until } from "../test/browser.tsx";
import { Button } from "../components/button/button.tsx";
import { Card } from "../components/card/card.tsx";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../components/dialog/dialog.tsx";
import { Popover, PopoverClose, PopoverContent, PopoverTitle, PopoverTrigger } from "../components/popover/popover.tsx";
import { SegmentedControl, SegmentedItem } from "../components/segmented-control/segmented-control.tsx";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "../components/sheet/sheet.tsx";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarTitle } from "../components/toolbar/toolbar.tsx";

const materialOf = (el: Element | null) => el?.getAttribute("data-material") ?? null;

function body(Title: React.ComponentType<{ children?: React.ReactNode }>, Close: React.ComponentType<{ render: React.ReactElement }>) {
  return (
    <>
      <Toolbar>
        <ToolbarTitle render={<Title />}>Rename project</ToolbarTitle>
        <ToolbarGroup aria-label="Tools">
          <ToolbarButton data-grouped>Share</ToolbarButton>
        </ToolbarGroup>
        <Close render={<ToolbarButton iconOnly aria-label="Close" data-band>x</ToolbarButton>} />
      </Toolbar>
      <Button data-content>In the content</Button>
      <SegmentedControl defaultValue="a" aria-label="In the content" data-content-track>
        <SegmentedItem value="a">A</SegmentedItem>
        <SegmentedItem value="b">B</SegmentedItem>
      </SegmentedControl>
      <Toolbar aria-label="Actions">
        <SegmentedControl defaultValue="a" aria-label="In the band" data-band-track>
          <SegmentedItem value="a">A</SegmentedItem>
          <SegmentedItem value="b">B</SegmentedItem>
        </SegmentedControl>
        <ToolbarButton emphasis="loud" data-action>Rename</ToolbarButton>
      </Toolbar>
      <Card>
        <Toolbar>
          <ToolbarButton data-carded>On a card</ToolbarButton>
        </Toolbar>
      </Card>
    </>
  );
}

const hosts: [string, React.ReactElement, string][] = [
  ["dialog", <Dialog defaultOpen><DialogContent>{body(DialogTitle, DialogClose as never)}</DialogContent></Dialog>, ".kui-dialog-popup"],
  ["sheet", <Sheet defaultOpen><SheetContent>{body(SheetTitle, SheetClose as never)}</SheetContent></Sheet>, ".kui-sheet-popup"],
  [
    "popover",
    <Popover defaultOpen>
      <PopoverTrigger render={<button type="button">Open</button>} />
      <PopoverContent>{body(PopoverTitle, PopoverClose as never)}</PopoverContent>
    </Popover>,
    ".kui-popover-popup",
  ],
];

describe("a toolbar in a glass panel is glass again, and nothing else in the panel is (2026-11-25)", () => {
  it.each(hosts)("%s, glass theme", async (_name, ui, selector) => {
    mounted(ui, { theme: { material: "3" } });
    expect(await until(() => document.querySelector(`${selector} [data-band]`) !== null)).toBe(true);
    const panel = document.querySelector(selector)!;
    // The guard: the panel is glass, or there is no second glass to speak of.
    expect(materialOf(panel)).toMatch(/^g\d$/);
    const band = panel.querySelector("[data-band]")!;
    // Real glass: the theme's material and its own backdrop filter, not the on-glass veil.
    expect(materialOf(band)).toMatch(/^g\d$/);
    expect(getComputedStyle(band).backdropFilter).not.toBe("none");
    // The panel's content keeps the rule: one glass per stack.
    expect(materialOf(panel.querySelector("[data-content]"))).toBe("on-glass");
    // THE REGION DECIDES, NOT THE KIND OF CONTROL (Kushagra, same day: "the region is what
    // decides glass, making other controls have the same behaviour as button"). A bottom
    // toolbar is a band like the top one, and a segmented control in a band is glass where the
    // same control in the content is not.
    expect(materialOf(panel.querySelector("[data-action]"))).toMatch(/^g\d$/);
    expect(materialOf(panel.querySelector("[data-band-track]"))).toMatch(/^g\d$/);
    expect(materialOf(panel.querySelector("[data-content-track]"))).toBe("on-glass");
    // A group in the band is the glass capsule, and its buttons stand on it.
    expect(materialOf(panel.querySelector("[data-grouped]"))).toBe("on-glass");
    // A toolbar on a card inside the panel is the card's, not the panel's band: the card is
    // a pane of its own, standing on the glass, and nothing on it is glass a second time.
    expect(materialOf(panel.querySelector("[data-carded]"))).not.toMatch(/^g\d$/);
  });

  it.each(hosts)("%s, solid theme: nothing is glass", async (_name, ui, selector) => {
    mounted(ui, { theme: {} });
    expect(await until(() => document.querySelector(`${selector} [data-band]`) !== null)).toBe(true);
    const panel = document.querySelector(selector)!;
    for (const mark of ["[data-band]", "[data-content]", "[data-grouped]", "[data-carded]", "[data-action]", "[data-band-track]"]) {
      expect(materialOf(panel.querySelector(mark)), mark).toBeNull();
    }
  });
});
