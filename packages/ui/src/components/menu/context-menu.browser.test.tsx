/**
 * ContextMenu's laws, mounted (§21, §22, §42).
 *
 * The component is deliberately three exports over the menu family's own parts, so most of
 * what it inherits is proven by AGREEMENT with a Menu rather than re-measured: the panel, the
 * rows, the glass, the portal contract. What is genuinely its own is where the panel comes
 * from — a point rather than a control — and that shows up in two places: the placement, and
 * the entry, which cannot be the family's silhouette because a region has no silhouette worth
 * flying out of.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";
import { cdp } from "vitest/browser";

import {
  APPEARANCES,
  computed,
  render as mount,
  settle,
  inMotion,
  until,
} from "../../test/browser.tsx";
import { SIDE_OFFSET } from "../../system/floating.tsx";
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
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
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

/** The box a panel comes to REST in — the flight poses the popup, so a rect read mid-unfurl is
    the silhouette's and not the panel's (10px tall, measured, on this file's own first run). */
async function restingBox(popup: HTMLElement): Promise<DOMRect> {
  await until(() => !popup.hasAttribute("data-unfurling"), 2000);
  settle(popup);
  return popup.getBoundingClientRect();
}

/** A right-click the way a person makes one: through the browser's own hit-testing, so what is
    pressed is whatever is really on top — which is the whole question once a panel is open. */
async function realRightClick(x: number, y: number): Promise<void> {
  const at = { x, y, button: "right" as const, clickCount: 1 };
  await cdp().send("Input.dispatchMouseEvent", { type: "mousePressed", buttons: 2, ...at });
  await cdp().send("Input.dispatchMouseEvent", { type: "mouseReleased", buttons: 0, ...at });
}

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
    /* NO `detail`, AND THAT IS THE REALISTIC SPELLING (corrected by the audit 2026-09-02).
       It shipped as `detail: 1` under a comment claiming a zero `detail` "opens a panel that
       never animates" — false twice over. `data-instant="click"` has not zeroed a clock since
       2026-08-19: `FLIES_ANYWAY` exempts it in the runner and surfaces.css excludes it in the
       stylesheet, held in agreement by a law. And a REAL right-click's `contextmenu` carries
       `detail: 0` (measured in the pinned Chromium: the mousedown is 1, the contextmenu is 0),
       so `detail: 1` produced a state no person can produce and took the shipped one — the
       `data-instant` stamp every real context panel wears — out of every law in this file. */
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
  { settled = true, size }: { settled?: boolean; size?: Size } = {},
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
  if (settled) settle(popup);
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
    settle(moved);
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
      settle(other);
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
});

describe("it flies from the POINT — the menu's own entry, with the right box (§42, §22)", () => {
  it("the seed is a zero-size box at the cursor, not the region", async () => {
    /* THE COMPONENT'S ONE REAL MOTION DECISION, and its first spelling got it wrong: I gave the
       panel a pose of its own — the landed box breathing from 0.92 — on the argument that a
       region has no silhouette worth flying out of. Half right. The region is the wrong box;
       the answer is to give the flight the RIGHT one, not to take the flight away. A context
       menu is a menu, so it unfurls out of what summoned it, and what summoned it is a point.

       Read as what the runner WROTE. `--kui-seed-w/h` are the silhouette the panel grows from,
       so a zero width and height ARE "this came out of a point" — where the region would put
       600 and 400 there. Both, because a seed that were merely small would still be a box. */
    const { popup } = await openContext({}, undefined, AT, { settled: false });
    await until(() => popup.style.getPropertyValue("--kui-seed-w") !== "");
    expect(popup.style.getPropertyValue("--kui-seed-w"), "a point has no width").toBe("0px");
    expect(popup.style.getPropertyValue("--kui-seed-h"), "a point has no height").toBe("0px");
    expect(popup.style.getPropertyValue("--kui-seed-r"), "and no corner").toBe("0px");
    /* AND IT SITS ON THE CURSOR. This asserted the literal `0px` on both axes until the audit
       2026-09-02 — true here only because an unshifted panel's corner IS the point, which made
       it a law that would have FAILED on the correct value in every cell where the panel has to
       move. Stated as the thing it always meant: the seed's resting place is the click. The
       shifted cell is the law below. */
    const fromX = Number.parseFloat(popup.style.getPropertyValue("--kui-from-x"));
    const fromY = Number.parseFloat(popup.style.getPropertyValue("--kui-from-y"));
    /* Read against the LANDED box, and the two moments are both facts: the offset is written
       once, at the aim, and the box it is an offset FROM is where the panel comes to rest. A
       rect taken mid-unfurl is the silhouette's — measured 10px tall — which is the instrument
       error this law made on its first run. `SIDE_OFFSET` is the designed gap the family keeps
       between a panel and what it came out of, so the seed sits that far off the pixel. */
    const landed = await restingBox(popup);
    expect(
      Math.abs(landed.left + fromX - AT.x),
      `seed at ${landed.left + fromX}, cursor at ${AT.x}`,
    ).toBeLessThanOrEqual(SIDE_OFFSET);
    expect(
      Math.abs(landed.top + fromY - AT.y),
      `seed at ${landed.top + fromY}, cursor at ${AT.y}`,
    ).toBeLessThanOrEqual(SIDE_OFFSET);
  });

  it("and it lands ON the cursor when the panel has to shift up the window", async () => {
    /* THE DEGENERATE-FIXTURE HALF, and it was hiding a real defect (audit 2026-09-02). Every
       other law here opens at (220, 180) in a pinned 1280x800 window, where the panel fits
       below the point and no shift can occur — the one place the general case and the special
       case give the same answer, so `--kui-from-y: 0px` read as a guarantee while it was a
       coincidence.

       A context menu's positioner runs `shift({ crossAxis })` with `flip.mainAxis` DISABLED, so
       a panel that would overflow the bottom slides UP while `data-side` stays `bottom` and
       nothing in the placement attributes says it moved. Measured in the builder before the
       fix: a click 408px down an 800px window put the panel's top at 301 — 107px above the
       pointer — with the seed painted at the panel's own corner, so it grew out of a point a
       third of its own height away from the cursor, at full opacity.

       Read as the seed's own resting place: `top + from-y` must land on the click. The fixture
       clicks low enough that a six-row panel cannot fit under it, which is what makes the two
       spellings disagree — sabotage `summonedOriginY` back to a literal 0 and this fails by the
       whole shift. */
    const tall = (
      <>
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuItem>Rename</MenuItem>
        <MenuItem>Delete</MenuItem>
      </>
    );
    const low = { x: 220, y: window.innerHeight - 60 };
    const { popup } = await openContext({}, tall, low, { settled: false });
    await until(() => popup.style.getPropertyValue("--kui-seed-w") !== "");
    const fromY = Number.parseFloat(popup.style.getPropertyValue("--kui-from-y"));
    const landed = await restingBox(popup);
    // The fixture must actually produce the state it is about: a panel that fit under the
    // cursor would make the assertion below true of the broken spelling too.
    expect(low.y - landed.top, "the panel must really have been shifted up").toBeGreaterThan(40);
    expect(
      Math.abs(landed.top + fromY - low.y),
      `panel top ${landed.top}, from-y ${fromY}, click ${low.y}`,
    ).toBeLessThanOrEqual(SIDE_OFFSET);
  });

  it("and a Menu beside it still flies from its trigger", async () => {
    /* The vacuity guard, and it is doing real work: the assertion above passes on a panel that
       publishes no seed at all — which is exactly what the first design did, and what a broken
       `anchorBox` would do again. An anchored menu in the same document must still photograph
       the button it came out of. */
    mount(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Cut</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const panels = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
    const anchored = panels[panels.length - 1]!;
    await until(() => anchored.style.getPropertyValue("--kui-seed-w") !== "");
    expect(
      Number.parseFloat(anchored.style.getPropertyValue("--kui-seed-w")),
      "a button-opened menu must fly from the button",
    ).toBeGreaterThan(0);
  });

  it("it invents no recipe of its own — the panel is the family's, unchanged", async () => {
    /* THE POINT OF THE REWRITE, stated as a law so the invented pose cannot come back. A
       context menu's panel must be spelled exactly as a submenu's: the family's classes, no
       mark of its own, and therefore the family's entry with nothing self-keyed. `kui-menu-
       anchored` is off for the same reason it is off on a submenu — the width floor means
       "never narrower than the trigger you pressed", and a point has no width. */
    const { popup } = await openContext();
    expect([...popup.classList].sort()).toEqual(
      ["kui-surface", "kui-floating", "kui-floating-rows", "kui-menu-popup"].sort(),
    );
    const rules = [...document.styleSheets]
      .flatMap((sheet) => [...(sheet.cssRules ?? [])])
      .map((r) => r.cssText)
      .join("\n");
    expect(rules, "no self-keyed pose may return").not.toContain("kui-menu-point");
  });

  it("its clocks are the family's own, because they ARE the family's", async () => {
    /* Read on a landed panel against a landed Menu: same transition list, same easings. An
       agreement rather than a measurement, which is what "copy paste menu" means when it is
       true. Not settled, and waiting for the flight, because `settle()` writes
       `transition: none !important` inline and the seed frame declares `transition: none`
       deliberately — two instrument findings that each produce `none` on a correct package. */
    const { popup } = await openContext({}, undefined, AT, { settled: false });
    inMotion();
    await until(() => !popup.hasAttribute("data-unfurling"));

    mount(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Cut</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    const panels = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
    const menu = panels[panels.length - 1]!;
    inMotion();
    await until(() => !menu.hasAttribute("data-unfurling"));
    expect(computed(popup, "transition-property")).toBe(computed(menu, "transition-property"));
    expect(computed(popup, "transition-duration")).toBe(computed(menu, "transition-duration"));
    expect(computed(popup, "transition-timing-function")).toBe(
      computed(menu, "transition-timing-function"),
    );
    // Calibration: the family really does declare clocks here, so the agreement above is not
    // two panels agreeing on `none`.
    expect(computed(menu, "transition-property")).not.toBe("none");
  });
});

describe("what a summoned panel does NOT hand down, and what it re-does (audit 2026-09-02)", () => {
  it("a submenu inside it still flies from its own row", async () => {
    /* `seedSize` MEANS "THIS PANEL WAS SUMMONED", and it was read by every descendant flight.
       `MenuSub` builds its context by spreading the parent's (`{ ...parentDir, anchor }`), so
       the flag crossed into every submenu of a context menu and the runner posed it as
       summoned: measured, the sub wrote `--kui-seed-h: 0px` and `--kui-seed-r: 0px` where the
       identical markup under a plain Menu writes its trigger ROW's own 15px box and corner, and
       `--kui-seed-dy` then translated that flat sliver half a seed ABOVE the row it was
       supposed to come out of. §22 says the opposite in as many words: a side-opening panel
       keeps the row's height and corner, because that shared edge is real.

       Read as an AGREEMENT with the same submenu under a plain Menu, rather than against a
       number: the sub-trigger row is the same row in both, so the two must photograph the same
       box, and a number would go stale the day the row ladder moves. */
    const sub = (
      <>
        <MenuItem>Cut</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Move to</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Drafts</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </>
    );

    const seedOf = async (root: HTMLElement) => {
      const trigger = root.querySelector<HTMLElement>(".kui-menu-item[aria-haspopup]")!;
      const before = document.querySelectorAll(".kui-menu-popup").length;
      trigger.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      trigger.dispatchEvent(new PointerEvent("pointermove", { bubbles: true }));
      trigger.click();
      await until(() => document.querySelectorAll(".kui-menu-popup").length > before);
      const panels = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
      const child = panels[panels.length - 1]!;
      await until(() => child.style.getPropertyValue("--kui-seed-h") !== "");
      return {
        height: child.style.getPropertyValue("--kui-seed-h"),
        radius: child.style.getPropertyValue("--kui-seed-r"),
        row: trigger.getBoundingClientRect(),
      };
    };

    const ctx = await openContext({}, sub, AT, { settled: false });
    const summoned = await seedOf(ctx.popup);

    mount(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>{sub}</MenuContent>
        </Menu>
      </Theme>,
    );
    const panels = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
    const anchoredPanel = panels[panels.length - 1]!;
    const anchoredSeed = await seedOf(anchoredPanel);

    // The fixture's own premise: the two sub-trigger rows are the same box, so a disagreement
    // below is about the seed and never about the row.
    expect(summoned.row.height).toBeCloseTo(anchoredSeed.row.height, 0);
    expect(summoned.height, "a submenu photographs its row, wherever it was summoned from").toBe(
      anchoredSeed.height,
    );
    expect(summoned.radius, "and its row's corner").toBe(anchoredSeed.radius);
    // Calibration: the row is a real box, so this is not two panels agreeing on zero.
    expect(Number.parseFloat(anchoredSeed.height)).toBeGreaterThan(0);
  });

  it("a second right-click while it is open flies again, it does not teleport", async () => {
    /* THE CATCH'S PREMISE DIES HERE (2026-08-20, re-argued 2026-09-02). A reopen that lands
       mid-dissolve is CAUGHT rather than replayed, because the panel "is already on screen,
       already at its natural box, already placed" — true of every member the branch was written
       for, since a menu, a select and a popover all reopen on the same anchor. A summoned panel
       is the family's first member whose second gesture carries a NEW place, so "already
       placed" is false and the catch produced exactly what the 2026-08-20 reversal was made to
       stop: measured with a real right-click, the same popup element moved 289px inline and
       155px block between two frames, at full opacity, with no seed and no unfurl.

       Read as the STAMPS, not the distance: the shipped "moves it there" law calls `settle()`
       and asserts the settled box moved, which is identical for a flight and a teleport. What
       tells them apart is whether the runner started a flight at all. */
    const { popup } = await openContext();
    inMotion();
    await until(() => !popup.hasAttribute("data-unfurling"));
    expect(popup.hasAttribute("data-unfurling"), "the first flight has landed").toBe(false);

    let flew = false;
    const watch = new MutationObserver((records) => {
      for (const record of records) if (record.attributeName === "data-unfurling") flew = true;
    });
    watch.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-unfurling"],
    });
    /* A REAL right-click, through CDP, and the gesture is the law's subject rather than its
       convenience: a synthetic `contextmenu` dispatched straight at the region does not make
       Base UI take the popup down and put it back, so `data-open` never leaves and the arrival
       this law is about never happens. The real press does — measured stream, `data-open` null,
       `data-ending-style` on, `data-open` back — which is the close-and-reopen the catch reads.
       It also goes through hit-testing, so it is pressing whatever is really on top. */
    await realRightClick(480, 320);
    await until(() => flew, 600);
    watch.disconnect();
    expect(flew, "a fresh summon is an arrival, so it flies").toBe(true);
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
