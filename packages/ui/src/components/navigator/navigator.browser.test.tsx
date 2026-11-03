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
/** The title the band shows: one band for the stack, outside the screens (2026-11-03). */
const bandTitle = (root: Element) => root.querySelector(".kui-navigator-bar h2")?.textContent;

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
    await until(() => card.querySelector(".kui-navigator-bar h2")?.textContent === "Settings");
    card.querySelector<HTMLButtonElement>(".kui-navigator-level button")!.click();
    await until(() => card.querySelector(".kui-navigator-bar h2")?.textContent === "Notifications");
    expect(card.querySelector("[aria-label='Back to Settings']")).not.toBeNull();
    // The pane still belongs to its page: one large title, the page's.
    expect([...root.querySelectorAll("h1")].map((h) => h.textContent)).toEqual(["Billing"]);
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
