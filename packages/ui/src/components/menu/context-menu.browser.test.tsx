/**
 * ContextMenu's laws, mounted (§21, §22, §42).
 *
 * The component is deliberately three exports over the menu family's own parts, so most of
 * what it inherits is proven by AGREEMENT with a Menu rather than re-measured: the panel, the
 * rows, the glass, the portal contract. What is genuinely its own is where the panel comes
 * from — a point rather than a control — and that shows up in the placement.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";

import { APPEARANCES, computed, render as mount, until } from "../../test/browser.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import type { Size } from "../../system/axes.ts";
import { Box } from "../box/box.tsx";
import { Button } from "../button/button.tsx";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "./menu.tsx";

/** Every axis off its default — a dropped attribute is visible (the §20 constant). */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "small",
  pointer: "coarse",
  depth: "flat",
  material: "regular",
  // `contrast: "high"` is named by ENGINEERING as part of the owed set and was missing (audit
  // 2026-09-02) — it is the axis that re-declares the whole ink and border palette, so a
  // portal that dropped it would look right in every other cell.
  contrast: "high",
};

const AT = { x: 220, y: 180 };

/** What the theme axes reach on the panel itself — fill, edge, corner, air, lift, direction. */
function paneFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
    border: cs.borderTopColor,
    radius: cs.borderTopLeftRadius,
    padding: cs.paddingTop,
    shadow: cs.boxShadow,
    // Not cascade-delivered — the wrapper has to carry `dir` itself (§20).
    direction: cs.direction,
  };
}

/** What they reach on a row: the control cells, the ink, the row's own box. */
function rowFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    minHeight: cs.minHeight,
    padLeft: cs.paddingLeft,
    gap: cs.gap,
    font: cs.fontSize,
    radius: cs.borderTopLeftRadius,
    color: cs.color,
    direction: cs.direction,
  };
}

function Region({ children }: { children?: React.ReactNode }) {
  return (
    <ContextMenuTrigger>
      <Box style={{ inlineSize: "600px", blockSize: "400px" }}>right-click me</Box>
      {children}
    </ContextMenuTrigger>
  );
}

/** Right-click at a real point, the way a person does — the event carries the coordinates the
    placement is built from, so a synthetic one with no `clientX/Y` would place at the origin
    and every geometry law below would agree with a broken component. */
function rightClick(el: Element, at = AT) {
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    clientX: at.x,
    clientY: at.y,
    button: 2,
    /* NO `detail`, AND THAT IS THE REALISTIC SPELLING (corrected by the audit 2026-09-02): a REAL
       right-click's `contextmenu` carries `detail: 0` (measured in the pinned Chromium: the
       mousedown is 1, the contextmenu is 0), so a `detail: 1` would produce a state no person can
       produce. */
  });
  el.dispatchEvent(event);
  return event;
}

/* ASYNC BY NECESSITY, and the reason is worth stating: the panel is PORTALLED, and Base UI
   mounts a portal on an effect — so nothing exists in the frame the right-click lands in.
   Measured on this file's own first run: zero popups synchronously, one a frame later, and ten
   laws failing against a component that works. `until` polls rather than sleeping, which is
   this repo's rule about premises that are windows. */
async function openContext(
  theme: ThemeProps = {},
  ui?: React.ReactNode,
  at = AT,
  { size }: { size?: Size } = {},
) {
  const host = mount(
    <Theme {...theme}>
      <ContextMenu {...(size ? { size } : {})}>
        <Region />
        <ContextMenuContent>
          {ui ?? (
            <>
              <MenuItem>Cut</MenuItem>
              <MenuItem>Copy</MenuItem>
              <MenuItem>Paste</MenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </Theme>,
  );
  const trigger = host.firstElementChild! as HTMLElement;
  const before = document.querySelectorAll(".kui-menu-popup").length;
  rightClick(trigger, at);
  await until(() => document.querySelectorAll(".kui-menu-popup").length > before);
  const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the panel never mounted — every law below would assert nothing");
  return {
    host,
    trigger,
    popup,
    items: [...popup.querySelectorAll<HTMLElement>(".kui-menu-item")],
  };
}

describe("a right-click summons it, and the platform's own menu does not appear", () => {
  it("opens on contextmenu and prevents the default", async () => {
    /* Both halves, because they are separate failures: a menu that opens beside the browser's
       own is as broken as one that never opens. The prevented default is read off the EVENT,
       which is the only place the answer exists — nothing in the DOM records it. */
    const { popup, trigger } = await openContext();
    expect(popup.isConnected, "the panel is in the document").toBe(true);
    const second = rightClick(trigger, { x: 300, y: 300 });
    expect(second.defaultPrevented, "the browser's own menu must be suppressed").toBe(true);
  });

  it("and it is suppressed over the PANEL too, not just the region", async () => {
    /* THE HOLE THE COMPONENT MADE (audit 2026-09-02). Base UI suppresses `contextmenu` for the
       trigger's region and for its backdrop — a `position: fixed; inset: 0` sibling of the
       positioner — so the suppression covers the whole viewport EXCEPT the one rectangle the
       panel occupies. Measured before the fix: right-click a row and the event came back
       `defaultPrevented: false` while Chrome drew its own menu over the Kookie one, which stays
       open underneath it (a press inside the floating layer dismisses nothing).

       §42 names suppressing the platform's menu as one of the four jobs that license
       `ContextMenuTrigger`; doing it for the region and not for the surface the region draws is
       half a job. The calibration half is what makes this a hole rather than ordinary web
       behaviour: the same synthetic event OUTSIDE the panel is already prevented. */
    const { popup, items, trigger } = await openContext();
    const onRow = rightClick(items[0]!, { x: 240, y: 200 });
    expect(onRow.defaultPrevented, "over a row of the open panel").toBe(true);
    const onPane = rightClick(popup, { x: 240, y: 200 });
    expect(onPane.defaultPrevented, "over the panel itself").toBe(true);
    /* Calibration, and it is aimed at the trigger rather than at the page: Base UI's own
       document listener guards `contains(trigger) || contains(backdrop)`, so an event on
       `document.body` is prevented by nobody and always comes back `false` — a control that
       reads as a failure of this law rather than as the thing it never covered. The REGION is
       the half that was already right, which is what makes the two answers a pair. */
    const onRegion = rightClick(trigger, { x: 240, y: 200 });
    expect(onRegion.defaultPrevented, "and over the region, as it always was").toBe(true);
  });

  it("an ordinary left click does not open it", async () => {
    // The calibration half of the law above: a component that opened on every press would
    // satisfy "opens on contextmenu" and be useless.
    const host = mount(
      <Theme>
        <ContextMenu>
          <Region />
          <ContextMenuContent>
            <MenuItem>Cut</MenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Theme>,
    );
    const before = document.querySelectorAll(".kui-menu-popup").length;
    (host.firstElementChild!.firstElementChild! as HTMLElement).click();
    await until(() => false, 80);
    expect(document.querySelectorAll(".kui-menu-popup").length).toBe(before);
  });
});

describe("it is placed at the POINT, not against the region (§42)", () => {
  it("the panel's corner lands on the cursor", async () => {
    /* The whole reason this component exists: `Menu` anchors to a control, and a point is the
       one placement it cannot express. Read as the DISTANCE from the click to the panel's
       nearest corner — a few pixels of designed offset are allowed, most of a region is not.

       The region is 600x400 and the click is at (220, 180), so a panel placed against the
       region rather than the point would sit at its edge and fail this by hundreds of pixels.
       That gap is what makes the fixture able to tell the two apart. */
    const { popup } = await openContext();
    const box = popup.getBoundingClientRect();
    const dx = Math.min(Math.abs(box.left - AT.x), Math.abs(box.right - AT.x));
    const dy = Math.min(Math.abs(box.top - AT.y), Math.abs(box.bottom - AT.y));
    expect(dx, `panel at ${box.left}..${box.right}, click at ${AT.x}`).toBeLessThan(24);
    expect(dy, `panel at ${box.top}..${box.bottom}, click at ${AT.y}`).toBeLessThan(24);
  });

  it("a second right-click somewhere else moves it there", async () => {
    // A point placement that were computed once would pass the law above and be wrong on
    // every subsequent open, which is the defect a single-open fixture cannot see.
    const { trigger, popup } = await openContext();
    const first = popup.getBoundingClientRect();
    rightClick(trigger, { x: 480, y: 320 });
    await until(() => {
      const p = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
      const last = p[p.length - 1];
      return !!last && Math.abs(last.getBoundingClientRect().left - first.left) > 100;
    });
    const popups = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
    const moved = popups[popups.length - 1]!;
    const second = moved.getBoundingClientRect();
    expect(Math.abs(second.left - first.left) + Math.abs(second.top - first.top)).toBeGreaterThan(
      100,
    );
  });

  it("it takes no side, align or offset — placement is the system's", async () => {
    // The refusal, in the type. §22 owns placement for every member of this family, and here
    // there is nothing a call site could usefully say.
    // @ts-expect-error placement is not the caller's
    void (<ContextMenuContent side="top" />);
    // @ts-expect-error placement is not the caller's
    void (<ContextMenuContent align="end" />);
  });
});

describe("it is the menu family's panel, not a second one", () => {
  it("the pane resolves byte-identically to a Menu's at the same index", async () => {
    /* THE AGREEMENT THAT MAKES THREE EXPORTS HONEST. If the panel differed in fill, corner,
       edge or cast, this would be a second component wearing the family's name — and the
       argument for not shipping fourteen parallel parts would be false. Read across both
       appearances, because a single-mode reading passes on any pair that happens to agree in
       light.

       AT A NON-DEFAULT INDEX, which is the half this law was named for and did not do (audit
       2026-09-02). It said "at the same index" while both sides took index 2, so it was a law
       about the default wearing the general case's name — and `ContextMenu` supplies its OWN
       `MenuSizeContext.Provider`, a path no Menu law can cover. The sabotage that survived:
       delete that provider and all fourteen laws pass while `<ContextMenu size="4">` silently
       renders at index 2 (rows 38 -> 30px, font 18 -> 14, corner 19 -> 15). Size 4 against the
       default 2 is the widest the index goes, so no wrong spelling gives the same answer. */
    for (const appearance of APPEARANCES) {
      const ctx = await openContext({ appearance }, undefined, AT, { size: "4" });
      const menu = mount(
        <Theme appearance={appearance}>
          <Menu size="4" defaultOpen>
            <MenuTrigger render={<Button size="4">Open</Button>} />
            <MenuContent>
              <MenuItem>Cut</MenuItem>
            </MenuContent>
          </Menu>
        </Theme>,
      );
      void menu;
      await until(() => document.querySelectorAll(".kui-menu-popup").length > 0);
      const panels = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
      const other = panels[panels.length - 1]!;
      for (const prop of [
        "background-color",
        "border-radius",
        "border-top-width",
        "border-top-color",
        "box-shadow",
        "padding-top",
      ]) {
        expect(computed(ctx.popup, prop), `${appearance}: ${prop}`).toBe(computed(other, prop));
      }
      // The index reaches the ROWS, which is what a supplied size is for, and it is read
      // against the same index's Menu rather than against a number.
      const ctxRow = ctx.items[0]!;
      const menuRow = other.querySelector<HTMLElement>(".kui-menu-item")!;
      expect(ctxRow.getAttribute("data-size"), "the row wears the index it was given").toBe("4");
      expect(computed(ctxRow, "min-height"), `${appearance}: row height`).toBe(
        computed(menuRow, "min-height"),
      );
      expect(computed(ctxRow, "font-size"), `${appearance}: row type`).toBe(
        computed(menuRow, "font-size"),
      );
      // Calibration: index 4 is genuinely a different row from the default, so the agreement
      // above is not two rows agreeing on the value they would have had anyway.
      const bare = await openContext({ appearance });
      expect(computed(bare.items[0]!, "font-size"), "the index must move the row").not.toBe(
        computed(ctxRow, "font-size"),
      );
    }
  });

  it("Menu's own rows work inside it, unchanged", async () => {
    /* The claim the three-export decision rests on: `MenuItem` is not adapted, wrapped or
       re-registered — Base UI's ContextMenu re-exports the very same part, so a menu item in a
       context menu IS a menu item. Read as the announced role AND the row family's class, so a
       row that rendered but announced nothing would fail. */
    const { items } = await openContext();
    expect(items.length).toBe(3);
    for (const item of items) {
      expect(item.getAttribute("role")).toBe("menuitem");
      expect(item.classList.contains("kui-row"), "the row family").toBe(true);
      expect(item.classList.contains("kui-control")).toBe(true);
    }
  });

  it("the panel re-themes inside the portal (§20)", async () => {
    /* The family's own agreement law, which every portalling member owes — and it shipped
       reading five ATTRIBUTE STRINGS off the wrapper (audit 2026-09-02), under its own
       docstring claiming "the panel must resolve the same ink a row inside the in-flow Theme
       does". An attribute comes back equal because it was written verbatim; nothing about what
       those axes REACH was ever read. The sabotage that survived it: append
       `[data-pointer="coarse"] .kui-menu-popup:not(.kui-floating-anchored) { background-color: red;
       padding-top: 40px }` to menu.css and all fourteen laws stay green while every context
       menu on every touch device is red with 40px of padding.

       So it compares COMPUTED values against an in-flow twin, which is the shape Menu, Select
       and Tooltip each write, and the twin is built from the panel's OWN class list rather than
       a hand-copy — a hand-copied identity is the 2026-08-23 fixture defect, and it goes stale
       the day a class is renamed. */
    const { popup, items } = await openContext(HOSTILE);
    const theme = popup.closest(".kui-theme");
    expect(theme, "the portal must carry a Theme").not.toBeNull();

    const twin = (props: ThemeProps) => {
      let pane: HTMLElement | null = null;
      let row: HTMLElement | null = null;
      mount(
        <Theme {...props}>
          <div
            ref={(n: HTMLDivElement | null) => void (pane = n)}
            className={popup.className}
            data-size="2"
            /* The material is STAMPED by the component (§10 — every glass selector is
               element-keyed on purpose), so it is not something the twin can inherit from the
               Theme it sits in. Copied from the subject rather than written as a literal: the
               law is about what the axes reach, and a hand-written `"regular"` would go stale
               the day HOSTILE changes. */
            data-material={popup.getAttribute("data-material") ?? undefined}
          >
            <div
              ref={(n: HTMLDivElement | null) => void (row = n)}
              className={items[0]!.className}
              data-size="2"
              data-tone="neutral"
              data-emphasis="quiet"
            >
              Cut
            </div>
          </div>
        </Theme>,
      );
      if (!pane || !row) throw new Error("the twin never mounted");
      return { pane: pane as HTMLElement, row: row as HTMLElement };
    };

    const hostile = twin(HOSTILE);
    expect(paneFacts(popup), "the pane under the hostile axes").toEqual(paneFacts(hostile.pane));
    expect(rowFacts(items[0]!), "a row under the hostile axes").toEqual(rowFacts(hostile.row));
    /* The vacuity guard, and this law needs it more than most: two panels that resolved
       NOTHING would agree perfectly. The same twin under the default axes must disagree, which
       is what says these facts move when an axis moves. */
    expect(paneFacts(twin({}).pane), "the axes must reach these facts at all").not.toEqual(
      paneFacts(hostile.pane),
    );
    /* WHAT AN AGREEMENT LAW STILL CANNOT SEE, stated rather than left as a hole: a rule that
       hits BOTH sides. Appending `[data-pointer="coarse"] .kui-menu-popup { background-color:
       red }` to menu.css paints the twin too, so the two go on agreeing — falsified, and the
       result kept. This law's subject is the PORTAL (does an axis cross it), and its real
       sabotage is a wrapper that resets one: `<Theme density="default" render={scope} />` in
       PortalScope fails it on the row's own box. "No rule paints the panel red" is a different
       claim and belongs to the sheet's own laws, not to this one. */
  });

  it("it invents no recipe of its own — the panel is the family's, unchanged", async () => {
    /* A context menu's panel is spelled exactly as a submenu's: the family's classes and no mark
       of its own. `kui-floating-anchored` is off for the same reason it is off on a submenu — the
       width floor means "never narrower than the trigger you pressed", and a point has no width. */
    const { popup } = await openContext();
    expect([...popup.classList].sort()).toEqual(
      ["kui-surface", "kui-floating", "kui-floating-rows", "kui-menu-popup"].sort(),
    );
  });
});

describe("the region announces nothing and paints nothing", () => {
  it("the trigger has no fill, no border and no cursor of its own", async () => {
    /* A right-click is a gesture over content you can already see, so the region is not a
       control and must not read as one. Measured against a bare Box in the same Theme, which
       is what makes this about the TRIGGER rather than about the browser's defaults. */
    const { trigger } = await openContext();
    const bare = mount(
      <Theme>
        <Box style={{ inlineSize: "600px", blockSize: "400px" }} />
      </Theme>,
    ).firstElementChild as HTMLElement;
    for (const prop of ["background-color", "border-top-width", "cursor", "outline-style"]) {
      expect(computed(trigger, prop), prop).toBe(computed(bare, prop));
    }
  });

  it("the region says when its menu is up, and nothing else", async () => {
    // The one thing it does announce, and it is a state rather than a role: Base UI stamps the
    // region while the menu is open, which is what lets an app dress it if it wants to.
    const { trigger } = await openContext();
    expect(trigger.hasAttribute("data-popup-open")).toBe(true);
  });
});
