import * as React from "react";
import { describe, expect, it } from "vitest";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "../components/menu/menu.tsx";
import { Button } from "../components/button/button.tsx";
import { Theme } from "../theme/theme.tsx";
import { render as mount, inMotion } from "../test/browser.tsx";

describe("C2 after the fix", () => {
  it("a wide trigger's panel does not step at release", async () => {
    inMotion();
    mount(
      <Theme><div style={{ padding: 100 }}>
        <Menu>
          <MenuTrigger render={<Button style={{ width: 400 }}>A deliberately very wide trigger</Button>} />
          <MenuContent><MenuItem>Short</MenuItem><MenuItem>Also short</MenuItem></MenuContent>
        </Menu>
      </div></Theme>,
    );
    const seen: string[] = [];
    let on = true;
    const tick = () => {
      const el = document.querySelector<HTMLElement>(".kui-menu-popup");
      if (el) {
        const line = `painted=${Math.round(el.getBoundingClientRect().width * 100) / 100} anchor-w=${getComputedStyle(el).getPropertyValue("--kui-anchor-w").trim() || "-"} unfurling=${el.hasAttribute("data-unfurling")} minW=${getComputedStyle(el).minWidth}`;
        if (seen[seen.length - 1] !== line) seen.push(line);
      }
      if (on) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const { userEvent } = await import("vitest/browser");
    await userEvent.click(document.querySelector<HTMLElement>(".kui-button")!);
    await new Promise((r) => setTimeout(r, 1600));
    on = false;
    expect(0, "\nC2 AFTER\n  " + seen.join("\n  ") + "\n").toBe(-1);
  });
});
