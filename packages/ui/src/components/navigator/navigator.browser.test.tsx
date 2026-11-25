/**
 * Navigator's laws, mounted (2026-11-02).
 *
 * What a reader would otherwise take on trust: the stack goes as deep as the path says, the
 * screens underneath stay mounted but hidden, Back is absent at the root and names where it
 * goes, a pushed screen's title takes focus, and in a pane only the top screen claims the band.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";

import { mounted, until } from "../../test/browser.tsx";
import { Shell, ShellContent, ShellPaneHeader, ShellScroll } from "../shell/shell.tsx";
import { Toolbar, ToolbarTitle } from "../toolbar/toolbar.tsx";
import { Dialog, DialogContent } from "../dialog/dialog.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover.tsx";
import { Sheet, SheetContent } from "../sheet/sheet.tsx";
import {
  Navigator,
  NavigatorBack,
  NavigatorLink,
  NavigatorOutlet,
  NavigatorScreen,
} from "./navigator.tsx";

const LEVELS = ["Settings", "Notifications", "Email", "Digest"];

function screen(title: string) {
  const next = LEVELS[LEVELS.indexOf(title) + 1];
  return (
    <NavigatorScreen title={title}>
      {next ? <NavigatorLink value={next}>{next}</NavigatorLink> : <span data-end>{title}</span>}
      <input data-draft aria-label={`${title} draft`} />
    </NavigatorScreen>
  );
}

/** The band and the screens are siblings, so the test holds both in one box. */
const mountedNav = (ui: React.ReactElement) => mounted(<div>{ui}</div>, { theme: {} });
/** The title of the screen on show. It sits under the row, in the screen (2026-11-25). */
const bandTitle = (root: Element) =>
  [...root.querySelectorAll(".kui-navigator-heading > :first-child")].find((el) => el.checkVisibility())?.textContent;

const visibleLevels = (root: Element) =>
  [...root.querySelectorAll(".kui-navigator > .kui-navigator-level")].filter(
    (el) => getComputedStyle(el).display !== "none",
  );

describe("a stack of screens, any depth", () => {
  it("opens the path it is given, and shows only the top screen", async () => {
    const root = mountedNav(
      <Navigator defaultPath={["Notifications", "Email", "Digest"]} root={screen("Settings")} screen={screen} />,
    );
    await until(() => root.querySelectorAll(".kui-navigator-level").length === 4);
    expect(visibleLevels(root)).toHaveLength(1);
    expect(visibleLevels(root)[0]!.querySelector("[data-end]")!.textContent).toBe("Digest");
    expect(bandTitle(root)).toBe("Digest");
  });

  it("keeps what was typed on a screen underneath", async () => {
    const root = mountedNav(<Navigator root={screen("Settings")} screen={screen} />);
    const draft = root.querySelector<HTMLInputElement>("[data-draft]")!;
    draft.value = "kept";
    root.querySelector<HTMLButtonElement>(".kui-navigator-level button")!.click();
    await until(() => bandTitle(root) === "Notifications");
    root.querySelector<HTMLButtonElement>(".kui-navigator-bar button")!.click();
    await until(() => bandTitle(root) === "Settings");
    expect(visibleLevels(root)[0]!.querySelector<HTMLInputElement>("[data-draft]")!.value).toBe("kept");
  });
});

describe("Back", () => {
  it("is absent at the root and names the screen it returns to", async () => {
    const root = mountedNav(<Navigator root={screen("Settings")} screen={screen} />);
    expect(root.querySelector(".kui-navigator-bar button")).toBeNull();
    root.querySelector<HTMLButtonElement>(".kui-navigator-level button")!.click();
    await until(() => root.querySelector(".kui-navigator-bar button") != null);
    expect(root.querySelector(".kui-navigator-bar button")!.getAttribute("aria-label")).toBe("Back to Settings");
  });

  it("moves focus to the new title on push", async () => {
    const root = mountedNav(<Navigator root={screen("Settings")} screen={screen} />);
    root.querySelector<HTMLButtonElement>(".kui-navigator-level button")!.click();
    await until(() => document.activeElement?.textContent === "Notifications");
    expect(document.activeElement!.tagName).toBe("H2");
  });
});

describe("in a pane, the band speaks for the top screen only", () => {
  it("the band's title follows the top screen, and Back sits in the band", async () => {
    const root = mounted(
      <Shell contained style={{ blockSize: "400px" }}>
        <ShellContent>
          <Navigator root={screen("Settings")} screen={screen}>
            <ShellPaneHeader>
              <Toolbar>
                <NavigatorBack />
                <ToolbarTitle />
              </Toolbar>
            </ShellPaneHeader>
            <ShellScroll>
              <NavigatorOutlet />
            </ShellScroll>
          </Navigator>
        </ShellContent>
      </Shell>,
      { theme: {} },
    );
    expect(root.querySelector("[aria-label^='Back']")).toBeNull();
    visibleLevels(root)[0]!.querySelector<HTMLButtonElement>("button")!.click();
    await until(() => root.querySelector("[aria-label='Back to Settings']") != null);
    // One large title on screen, and it is the top screen's.
    const titles = [...root.querySelectorAll("h1")].filter((h) => h.offsetParent !== null);
    expect(titles.map((h) => h.textContent)).toEqual(["Notifications"]);
  });
});

describe("in a pane with no frame passed, the navigator draws the band itself (2026-11-02)", () => {
  it("puts Back and the title together at the start of the band", async () => {
    const { ShellInspector } = await import("../shell/shell.tsx");
    const root = mounted(
      <Shell contained style={{ blockSize: "400px", inlineSize: "900px" }}>
        <ShellContent>work</ShellContent>
        <ShellInspector aria-label="Settings" defaultOpen presentation="fixed">
          <Navigator root={screen("Settings")} screen={screen} />
        </ShellInspector>
      </Shell>,
      { theme: {} },
    );
    await until(() => root.querySelector(".kui-pane-header .kui-toolbar-title")?.textContent === "Settings");
    root.querySelector<HTMLButtonElement>(".kui-shell-scroll button")!.click();
    await until(() => root.querySelector("[aria-label='Back to Settings']") != null);
    const back = root.querySelector<HTMLElement>("[aria-label='Back to Settings']")!.getBoundingClientRect();
    const title = root.querySelector<HTMLElement>(".kui-pane-header .kui-toolbar-title")!.getBoundingClientRect();
    expect(title.left - back.right, "the title split away from Back").toBeLessThan(40);
  });
});

describe("in a card, the navigator keeps to the card (2026-11-03)", () => {
  it("draws its own band in the card and leaves the pane's title alone", async () => {
    const { Card } = await import("../card/card.tsx");
    const { Page } = await import("../page/page.tsx");
    const root = mounted(
      <Shell contained style={{ blockSize: "500px" }}>
        <ShellContent>
          <Page title="Billing">
            <Card>
              <Navigator root={screen("Settings")} screen={screen} />
            </Card>
          </Page>
        </ShellContent>
      </Shell>,
      { theme: {} },
    );
    const card = root.querySelector(".kui-card")!;
    await until(() => bandTitle(card) === "Settings");
    card.querySelector<HTMLButtonElement>(".kui-navigator-level button")!.click();
    await until(() => bandTitle(card) === "Notifications");
    expect(card.querySelector("[aria-label='Back to Settings']")).not.toBeNull();
    // The pane still belongs to its page: one large title, the page's.
    expect([...root.querySelectorAll("h1")].map((h) => h.textContent)).toEqual(["Billing"]);
  });
});

describe("the path takes strings and numbers (2026-11-11)", () => {
  async function warningsFor(path: readonly unknown[]): Promise<string[]> {
    const warnings: string[] = [];
    const original = console.warn;
    console.warn = (...args: unknown[]) => {
      warnings.push(String(args[0]));
    };
    try {
      mountedNav(
        <Navigator<unknown>
          path={path}
          root={<NavigatorScreen title="Root">root</NavigatorScreen>}
          screen={() => <NavigatorScreen title="Next">next</NavigatorScreen>}
        />,
      );
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    } finally {
      console.warn = original;
    }
    return warnings.filter((w) => w.includes("<Navigator> path"));
  }

  // Falsified: with the check removed, an object in the path says nothing.
  it("an object in the path is named in development, and a string or a number is not", async () => {
    expect((await warningsFor([{ id: "a" }])).length).toBe(1);
    expect((await warningsFor(["settings", 2])).length).toBe(0);
  });
});

describe("the navigator's own words can be translated (2026-11-11)", () => {
  // Falsified: with `labels` not read, the band still says "Back to Settings", "Close" and
  // "Navigation" under German labels.
  it("Back, Close and the band's name come from `labels`, and default to English", async () => {
    mounted(
      <Dialog defaultOpen>
        <DialogContent>
          <Navigator
            root={screen("Settings")}
            screen={screen}
            labels={{ back: "Zurück", backTo: (title) => `Zurück zu ${title}`, close: "Schließen", navigation: "Navigation DE" }}
          />
        </DialogContent>
      </Dialog>,
      { theme: {} },
    );
    expect(await until(() => document.querySelector('[role="dialog"] .kui-navigator-bar') !== null)).toBe(true);
    const bar = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"] .kui-navigator-bar')).at(-1)!;
    expect(bar.querySelector(":scope > .kui-toolbar")!.getAttribute("aria-label")).toBe("Navigation DE");
    expect(bar.querySelector('[aria-label="Schließen"]')).not.toBeNull();
    expect(bar.querySelector('[aria-label="Close"]')).toBeNull();
    bar.parentElement!.querySelector<HTMLButtonElement>(".kui-navigator-level button")!.click();
    expect(await until(() => bar.querySelector('[aria-label="Zurück zu Settings"]') !== null)).toBe(true);
    expect(bar.querySelector('[aria-label="Back to Settings"]')).toBeNull();
  });
});

describe("in a dialog, only the top screen names the panel (2026-11-03)", () => {
  it("push and pop move the dialog's name, and no id is shared with a hidden screen", async () => {
    mounted(
      <Dialog defaultOpen>
        <DialogContent>
          <Navigator root={screen("Settings")} screen={screen} />
        </DialogContent>
      </Dialog>,
      { theme: {} },
    );
    expect(await until(() => document.querySelector('[role="dialog"]') !== null)).toBe(true);
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    const labelledBy = () => dialog.getAttribute("aria-labelledby") ?? "";
    const name = () => document.getElementById(labelledBy())?.textContent;
    const shared = () => dialog.querySelectorAll(`[id="${labelledBy()}"]`).length;
    // The panel's title part stamps an id; a hidden screen's plain heading carries none, so one
    // titled heading means only the top screen holds the panel's title.
    const titles = () => dialog.querySelectorAll("h2[id]").length;
    // A hidden screen's button is not on screen; `checkVisibility` says so where `offsetParent`
    // cannot, inside a fixed-position panel.
    const visible = (label: string) =>
      [...dialog.querySelectorAll<HTMLElement>(`[aria-label="${label}"], button`)].find(
        (b) => (b.getAttribute("aria-label") === label || b.textContent === label) && b.checkVisibility(),
      );
    expect(await until(() => name() === "Settings")).toBe(true);

    visible("Notifications")!.click();
    expect(await until(() => name() === "Notifications")).toBe(true);
    expect(shared()).toBe(1);
    expect(titles()).toBe(1);

    visible("Back to Settings")!.click();
    expect(await until(() => name() === "Settings")).toBe(true);
    expect(shared()).toBe(1);
    expect(titles()).toBe(1);
  });
});

/**
 * THE ROW FLOATS AND THE TITLE SITS UNDER IT (2026-11-25, Kushagra: "it should be center, no
 * prop. On default, title under row by default, and on scroll, center"; "Navigator should follow
 * whatever we have so far with toolbar"). Outside a pane the navigator is its own frame, and it
 * is the same frame in a dialog, a sheet and a popover.
 */
describe("outside a pane, the title sits under the row and the row shows it on scroll (2026-11-25)", () => {
  const long = (title: string) => {
    const next = LEVELS[LEVELS.indexOf(title) + 1];
    return (
      <NavigatorScreen title={title}>
        <div data-filler style={{ blockSize: "900px" }} />
        {next ? <NavigatorLink value={next}>{next}</NavigatorLink> : null}
      </NavigatorScreen>
    );
  };
  const nav = <Navigator root={long("Settings")} screen={long} />;
  const hosts: [string, React.ReactElement, string][] = [
    ["dialog", <Dialog defaultOpen><DialogContent style={{ maxBlockSize: "400px" }}>{nav}</DialogContent></Dialog>, ".kui-dialog-popup"],
    ["sheet", <Sheet defaultOpen><SheetContent style={{ maxBlockSize: "400px" }}>{nav}</SheetContent></Sheet>, ".kui-sheet-popup"],
    [
      "popover",
      <Popover defaultOpen>
        <PopoverTrigger render={<button type="button">Open</button>} />
        <PopoverContent style={{ inlineSize: "320px", maxBlockSize: "400px" }}>{nav}</PopoverContent>
      </Popover>,
      ".kui-popover-popup",
    ],
  ];
  /** What a length written in tokens comes to, inside this panel. */
  const px = (panel: Element, value: string) => {
    const probe = document.createElement("div");
    probe.style.inlineSize = value;
    panel.querySelector(".kui-navigator-scroll")!.append(probe);
    const size = probe.getBoundingClientRect().width;
    probe.remove();
    return size;
  };
  const open = async (ui: React.ReactElement, selector: string) => {
    mounted(ui, { theme: {} });
    expect(await until(() => document.querySelector(`${selector} .kui-navigator-heading`) !== null)).toBe(true);
    const panel = document.querySelector<HTMLElement>(selector)!;
    const row = () => panel.querySelector<HTMLElement>(".kui-navigator-bar > .kui-toolbar")!;
    const title = () =>
      [...panel.querySelectorAll<HTMLElement>(".kui-navigator-heading > :first-child")].find((el) => el.checkVisibility())!;
    const mirror = () => panel.querySelector<HTMLElement>(".kui-navigator-bar .kui-toolbar-title")!;
    const scroller = () => panel.querySelector<HTMLElement>(".kui-navigator-scroll > .kui-scroll-viewport")!;
    return { panel, row, title, mirror, scroller };
  };

  it.each(hosts)("in a %s the title takes its own room under the row, and the row stays put", async (_name, ui, selector) => {
    const { panel, row, title, mirror, scroller } = await open(ui, selector);
    await until(() => mirror() !== null);
    // The room above a title is the room its type step carries: the rule a dialog's title and a
    // Page's title follow, read from the same token.
    const room = px(panel, "var(--kui-title-space)");
    expect(room).toBeGreaterThan(0);
    expect(title().getBoundingClientRect().top - row().getBoundingClientRect().bottom).toBeCloseTo(room, 0);
    // The row sits one step closer to the panel's edges than the content, as any band does.
    const step = px(panel, "var(--layout-space-2)");
    expect(title().getBoundingClientRect().left - row().getBoundingClientRect().left).toBeCloseTo(step, 0);

    // While the title is on screen the row does not say it again.
    expect(getComputedStyle(mirror()).opacity).toBe("0");
    // Measured from the panel, which a popover may move as the window changes under it.
    const inPanel = () => row().getBoundingClientRect().top - panel.getBoundingClientRect().top;
    const rowTop = inPanel();
    scroller().scrollTop = 200;
    expect(await until(() => getComputedStyle(mirror()).opacity === "1")).toBe(true);
    expect(mirror().textContent).toBe("Settings");
    // The row floats: the content moved and it did not.
    expect(inPanel()).toBeCloseTo(rowTop, 0);
    expect(title().getBoundingClientRect().bottom).toBeLessThan(row().getBoundingClientRect().bottom);
  });

  it("the row's title is in the middle of the row with Back and without it", async () => {
    const { panel, row, mirror, scroller } = await open(hosts[0]![1], hosts[0]![2]);
    await until(() => mirror() !== null);
    const off = () => {
      const m = mirror().getBoundingClientRect();
      const r = row().getBoundingClientRect();
      return m.left + m.width / 2 - (r.left + r.width / 2);
    };
    expect(panel.querySelector(".kui-navigator-back")).toBeNull();
    expect(Math.abs(off())).toBeLessThan(1);
    scroller().scrollTop = scroller().scrollHeight;
    [...panel.querySelectorAll<HTMLButtonElement>(".kui-navigator-level button")].find((b) => b.checkVisibility())!.click();
    expect(await until(() => panel.querySelector(".kui-navigator-back") !== null && mirror().textContent === "Notifications")).toBe(true);
    expect(Math.abs(off())).toBeLessThan(1);
    // A new screen opens at its top, not where the last one was left.
    expect(scroller().scrollTop).toBe(0);
  });
});
