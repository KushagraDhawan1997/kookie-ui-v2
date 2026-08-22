import * as React from "react";
import { describe, expect, it } from "vitest";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "../components/menu/menu.tsx";
import { Button } from "../components/button/button.tsx";
import { Theme } from "../theme/theme.tsx";
import { render as mount, inMotion } from "../test/browser.tsx";

describe("what the trigger is doing while its menu opens", () => {
  it("trigger scale and rect, frame by frame", async () => {
    inMotion();
    mount(
      <Theme><div style={{ padding: 100 }}>
        <Menu>
          <MenuTrigger render={<Button style={{ width: 400 }}>A deliberately very wide trigger</Button>} />
          <MenuContent><MenuItem>Short</MenuItem><MenuItem>Also short</MenuItem></MenuContent>
        </Menu>
      </div></Theme>,
    );
    const trigger = document.querySelector<HTMLElement>(".kui-button")!;
    const seen: string[] = [];
    let on = true;
    const t0 = performance.now();
    const tick = () => {
      const popup = document.querySelector<HTMLElement>(".kui-menu-popup");
      const cs = getComputedStyle(trigger);
      const body = `scale=${cs.scale} rect=${Math.round(trigger.getBoundingClientRect().width * 100) / 100} anchorWidth=${popup ? getComputedStyle(popup).getPropertyValue("--anchor-width").trim() : "-"} popupW=${popup ? Math.round(popup.getBoundingClientRect().width) : "-"}`;
      const prev = seen[seen.length - 1];
      if (!prev || prev.slice(5) !== body) seen.push(`${String(Math.round(performance.now() - t0)).padStart(4)} ${body}`);
      if (on) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const { userEvent } = await import("vitest/browser");
    await userEvent.click(trigger);
    await new Promise((r) => setTimeout(r, 1800));
    on = false;
    expect(0, "\nTRIGGER\n  " + seen.slice(0, 26).join("\n  ") + "\n").toBe(-1);
  });
});
