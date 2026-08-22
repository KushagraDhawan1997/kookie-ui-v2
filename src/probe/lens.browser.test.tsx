import * as React from "react";
import { describe, expect, it } from "vitest";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "../components/menu/menu.tsx";
import { Card } from "../components/card/card.tsx";
import { Box } from "../components/box/box.tsx";
import { Button } from "../components/button/button.tsx";
import { Theme } from "../theme/theme.tsx";
import { render as mount, inMotion, until } from "../test/browser.tsx";

const count = () => document.querySelectorAll("filter").length;

describe("the lens during a flight", () => {
  it("how many filters a glass menu mints while it opens", async () => {
    inMotion();
    mount(
      <Theme material="thin">
        <Box backdrop style={{ padding: 100 }}>
          <Menu>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent>
              <MenuItem>Duplicate this thing</MenuItem>
              <MenuItem>Rename it</MenuItem>
              <MenuItem>Move somewhere else</MenuItem>
            </MenuContent>
          </Menu>
        </Box>
      </Theme>,
    );
    const before = count();
    const { userEvent } = await import("vitest/browser");
    await userEvent.click(document.querySelector<HTMLElement>(".kui-button")!);
    await until(() => !!document.querySelector(".kui-menu-popup"));
    const popup = document.querySelector<HTMLElement>(".kui-menu-popup")!;
    const seen = new Set<string>();
    let on = true;
    const tick = () => { seen.add(getComputedStyle(popup).getPropertyValue("--kui-lens").trim()); if (on) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    await new Promise((r) => setTimeout(r, 1400));
    on = false;
    expect(0, `\nLENS\n  filters before open = ${before}\n  filters after open  = ${count()}\n  minted during      = ${count() - before}\n  distinct --kui-lens values seen = ${seen.size}\n  material on popup = ${popup.getAttribute("data-material")}\n`).toBe(-1);
  });

  it("filter refcount after one glass card mounts and unmounts", async () => {
    const before = count();
    const host = mount(<Theme material="thin"><Box backdrop><Card backdrop>hello</Card></Box></Theme>);
    await new Promise((r) => setTimeout(r, 150));
    const during = count();
    host.remove();
    await new Promise((r) => setTimeout(r, 150));
    expect(0, `\nREFCOUNT\n  before=${before} during=${during} after unmount=${count()} (orphans=${count() - before})\n`).toBe(-1);
  });
});
