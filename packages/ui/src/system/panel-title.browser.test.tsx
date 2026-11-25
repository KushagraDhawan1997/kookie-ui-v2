/**
 * A panel's title and its row (2026-11-25): one behaviour mounted in a dialog, a sheet and a
 * popover, because the same layout must not behave differently by which panel holds it.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";

import { mounted, until } from "../test/browser.tsx";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../components/dialog/dialog.tsx";
import { Popover, PopoverClose, PopoverContent, PopoverTitle, PopoverTrigger } from "../components/popover/popover.tsx";
import { ScrollArea } from "../components/scroll-area/scroll-area.tsx";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "../components/sheet/sheet.tsx";
import { Toolbar, ToolbarButton, ToolbarTitle } from "../components/toolbar/toolbar.tsx";

/**
 * A PANEL'S TITLE CONDENSES INTO ITS ROW (2026-11-25, Kushagra, of the title moving into the
 * toolbar on scroll: "Why haven't you shipped this"). A Toolbar and then a ScrollArea is the
 * whole of it: the row floats over the scroller, the title under it keeps its own room, and a
 * `ToolbarTitle` given no words shows the title once it has scrolled behind the row. The same
 * in a dialog, a sheet and a popover.
 */
describe("a panel's title moves into its row on scroll (2026-11-25)", () => {
  const filler = <div style={{ blockSize: "900px" }} />;
  const close = <ToolbarButton iconOnly aria-label="Close">x</ToolbarButton>;
  const hosts: [string, React.ReactElement, string][] = [
    [
      "dialog",
      <Dialog defaultOpen>
        <DialogContent style={{ maxBlockSize: "400px" }}>
          <Toolbar>
            <ToolbarTitle />
            <DialogClose render={close} />
          </Toolbar>
          <ScrollArea fade>
            <DialogTitle>Updated terms</DialogTitle>
            {filler}
          </ScrollArea>
        </DialogContent>
      </Dialog>,
      ".kui-dialog-popup",
    ],
    [
      "sheet",
      <Sheet defaultOpen>
        <SheetContent style={{ maxBlockSize: "400px" }}>
          <Toolbar>
            <ToolbarTitle />
            <SheetClose render={close} />
          </Toolbar>
          <ScrollArea fade>
            <SheetTitle>Updated terms</SheetTitle>
            {filler}
          </ScrollArea>
        </SheetContent>
      </Sheet>,
      ".kui-sheet-popup",
    ],
    [
      "popover",
      <Popover defaultOpen>
        <PopoverTrigger render={<button type="button">Open</button>} />
        <PopoverContent style={{ inlineSize: "320px", maxBlockSize: "400px" }}>
          <Toolbar>
            <ToolbarTitle />
            <PopoverClose render={close} />
          </Toolbar>
          <ScrollArea fade>
            <PopoverTitle>Updated terms</PopoverTitle>
            {filler}
          </ScrollArea>
        </PopoverContent>
      </Popover>,
      ".kui-popover-popup",
    ],
  ];

  it.each(hosts)("in a %s the row floats, the title keeps its room, and the row shows it once it is gone", async (_name, ui, selector) => {
    mounted(ui, { theme: {} });
    expect(await until(() => document.querySelector(`${selector} .kui-toolbar-title[data-mirror]`) !== null)).toBe(true);
    const panel = document.querySelector<HTMLElement>(selector)!;
    const row = panel.querySelector<HTMLElement>(".kui-toolbar")!;
    const button = row.querySelector<HTMLElement>("button")!;
    const title = panel.querySelector<HTMLElement>(".kui-dialog-title")!;
    const mirror = row.querySelector<HTMLElement>(".kui-toolbar-title")!;
    const scroller = panel.querySelector<HTMLElement>(".kui-scroll-area[data-fade] > .kui-scroll-viewport")!;
    const px = (value: string) => {
      const probe = document.createElement("div");
      probe.style.inlineSize = value;
      scroller.append(probe);
      const size = probe.getBoundingClientRect().width;
      probe.remove();
      return size;
    };
    const inPanel = (el: Element) => el.getBoundingClientRect().top - panel.getBoundingClientRect().top;

    // The room above the title is its type step's own, from the row's bottom edge: what the
    // same title gets under a row when nothing scrolls.
    const room = px("var(--kui-title-space)");
    expect(room).toBeGreaterThan(0);
    expect(title.getBoundingClientRect().top - button.getBoundingClientRect().bottom).toBeCloseTo(room, 0);
    // The scroller reaches the panel's top edge, behind the row.
    expect(inPanel(scroller)).toBeLessThan(inPanel(button));
    // The row's title is on the controls' centre line, and silent while the title is on screen.
    const mid = (el: Element) => el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2;
    expect(Math.abs(mid(mirror) - mid(button))).toBeLessThan(1);
    expect(getComputedStyle(mirror).opacity).toBe("0");

    const rowTop = inPanel(button);
    scroller.scrollTop = 200;
    expect(await until(() => getComputedStyle(mirror).opacity === "1")).toBe(true);
    expect(mirror.textContent).toBe("Updated terms");
    expect(inPanel(button)).toBeCloseTo(rowTop, 0);
    // The panel is still named by the title part, not by the row's copy.
    expect(document.getElementById(panel.getAttribute("aria-labelledby") ?? "")).toBe(title);

    scroller.scrollTop = 0;
    expect(await until(() => getComputedStyle(mirror).opacity === "0")).toBe(true);
  });

  it("a title written in the row is the row's title already, and is not shown twice", async () => {
    mounted(
      <Dialog defaultOpen>
        <DialogContent>
          <Toolbar>
            <ToolbarTitle render={<DialogTitle />}>Rename project</ToolbarTitle>
          </Toolbar>
          <Toolbar>
            <ToolbarTitle />
          </Toolbar>
        </DialogContent>
      </Dialog>,
      { theme: {} },
    );
    expect(await until(() => document.querySelector(".kui-dialog-popup .kui-toolbar-title") !== null)).toBe(true);
    const panel = document.querySelector(".kui-dialog-popup")!;
    // One title: the second row's wordless title found nothing to mirror, and the title in the
    // row left no marker.
    expect(panel.querySelectorAll(".kui-toolbar-title")).toHaveLength(1);
    expect(panel.querySelector(".kui-title-marker")).toBeNull();
  });
});
