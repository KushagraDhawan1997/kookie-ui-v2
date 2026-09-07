/**
 * Page's laws, mounted (§46).
 *
 * The component draws two lines of type and one padding, so most of what it claims is an
 * AGREEMENT — the title is the step a `Heading` reads, the deck is the step a `Text` reads —
 * and the assertions are written that way rather than against literals, so a change to §15's
 * ladder moves the component and its law together or fails both.
 *
 * The two claims with real weight are the ones a reader would otherwise have to take on trust:
 * a page clears the band floating over it (which is the defect this component was built to
 * fix), and the band's title arrives when the page's own title has scrolled away.
 */
import { describe, expect, it } from "vitest";

import { SIZES, computed, mounted, ownLength, tokenOn, until } from "../../test/browser.tsx";
import { PAGE_DECK_STEP, PAGE_TITLE_STEP } from "../../system/type-steps.ts";
import { Card } from "../card/card.tsx";
import { Heading } from "../heading/heading.tsx";
import {
  Shell,
  ShellContent,
  ShellPaneFooter,
  ShellPaneHeader,
  ShellScroll,
} from "../shell/shell.tsx";
import { Text } from "../text/text.tsx";
import { Toolbar, ToolbarTitle } from "../toolbar/toolbar.tsx";
import { Page } from "./page.tsx";

function Frame(props: { float?: boolean; size?: "1" | "2" | "3" | "4" }) {
  const band = (
    <ShellPaneHeader {...(props.float ? { float: true } : {})}>
      <Toolbar>
        <ToolbarTitle />
      </Toolbar>
    </ShellPaneHeader>
  );
  return (
    <Shell {...(props.size ? { size: props.size } : {})} style={{ blockSize: "600px" }}>
      <ShellContent>
        {band}
        <ShellScroll>
          <Page title="Dialog" description="Dialog shows a panel over a dimmed app.">
            <div data-body style={{ blockSize: "2000px" }} />
          </Page>
        </ShellScroll>
      </ShellContent>
    </Shell>
  );
}

describe("a page states its title, once, at the house step (§15, §46)", () => {
  it("renders the document's one h1, and the deck as a paragraph under it", () => {
    const root = mounted(<Page title="Dialog" description="A panel." />, { theme: {} });
    const h1 = root.querySelectorAll("h1");
    expect(h1).toHaveLength(1);
    expect(h1[0]!.textContent).toBe("Dialog");
    expect(root.querySelector("p")!.textContent).toBe("A panel.");
  });

  it("the title is the page STEP and the deck is the deck step — read as agreements, not literals", () => {
    const page = mounted(<Page title="Dialog" description="A panel." />, { theme: {} });
    /* THE STEPS COME FROM THEIR ONE HOME, never a literal. A number typed here is a second
       copy of a judged value, and it does not stay equal: the title moved 8 → 9 the day it was
       re-judged on the real site and this law was the only thing left saying 8. What it still
       asserts is the part that can be wrong — the title is a HEADING at the page step and the
       deck a TEXT at the deck step, rather than type this component painted itself. */
    const ladder = mounted(
      <div>
        <Heading size={PAGE_TITLE_STEP}>Dialog</Heading>
        <Text size={PAGE_DECK_STEP}>A panel.</Text>
      </div>,
      { theme: {} },
    );
    const title = page.querySelector("h1")!;
    const deck = page.querySelector("p")!;
    expect(computed(title, "font-size")).toBe(computed(ladder.querySelector(".kui-heading")!, "font-size"));
    expect(computed(title, "line-height")).toBe(computed(ladder.querySelector(".kui-heading")!, "line-height"));
    expect(computed(deck, "font-size")).toBe(computed(ladder.querySelector(".kui-text")!, "font-size"));
  });

  it("the title/deck interval is the one the frame judged, and the interval below is two steps clear", () => {
    /* THE NUMBERS CAME FROM THE DOCUMENTATION SITE, judged by eye over four days before this
       component existed (LOG 2026-08-27 → 2026-08-29). What makes them the system's rather than
       a copy is that they are read here, off the layout-space layer, and that §15's proximity
       rule is checked rather than assumed: a section one step under the deck reads as a third
       line of it. */
    const root = mounted(
      <Page title="Dialog" description="A panel.">
        <div data-body>body</div>
      </Page>,
      { theme: {} },
    );
    const gapOf = (el: Element) => parseFloat(computed(el, "row-gap"));
    const inner = gapOf(root.querySelector(".kui-page-header")!);
    const outer = gapOf(root);
    expect(inner).toBeCloseTo(parseFloat(tokenOn(root, "--layout-space-6")), 1);
    expect(outer).toBeCloseTo(parseFloat(tokenOn(root, "--layout-space-8")), 1);
    expect(outer).toBeGreaterThan(inner);
  });

  it("a mark sits closer to the title than the deck does — the two are a lockup (§15)", () => {
    const root = mounted(
      <Page mark={<span data-mark>M</span>} title="Dialog" description="A panel." />,
      { theme: {} },
    );
    const mark = root.querySelector(".kui-page-mark")!.getBoundingClientRect();
    const title = root.querySelector("h1")!.getBoundingClientRect();
    const deck = root.querySelector("p")!.getBoundingClientRect();
    const lockup = title.top - mark.bottom;
    expect(lockup).toBeCloseTo(parseFloat(tokenOn(root, "--layout-space-4")), 1);
    expect(lockup).toBeLessThan(deck.top - title.bottom);
  });

  it("a page with no mark renders none — the slot is a departure, not an anatomy", () => {
    const root = mounted(<Page title="Dialog" />, { theme: {} });
    expect(root.querySelector(".kui-page-mark")).toBeNull();
  });

  it("a page with no deck renders no paragraph — the deck is optional, not empty", () => {
    const root = mounted(<Page title="Dialog" />, { theme: {} });
    expect(root.querySelector("p")).toBeNull();
  });

  it("the title states no width of its own — one measure is the frame's, never the page's", () => {
    const root = mounted(<Page title="Dialog" description="A panel." />, { theme: {} });
    expect(computed(root, "max-inline-size")).toBe("none");
    expect(computed(root.querySelector("h1")!, "max-inline-size")).toBe("none");
  });
});

describe("a page clears the band floating over it (§27, §46)", () => {
  /* THE DEFECT THIS COMPONENT WAS BUILT TO FIX. The docs site padded a fixed 32px while the
     band reached 64, so every title started underneath the buttons. The clearance is derived
     from the pane's own published reach, so it cannot drift from the band's height. */
  for (const size of SIZES) {
    it(`the title starts below the floating band, and by at least the air — size ${size}`, () => {
      const root = mounted(<Frame float size={size} />, { theme: {} });
      const band = root.querySelector(".kui-pane-header")!.getBoundingClientRect();
      const title = root.querySelector("h1")!.getBoundingClientRect();
      const pane = root.querySelector(".kui-shell-content")!;
      const air = parseFloat(tokenOn(root, "--layout-space-7"));
      const step = parseFloat(tokenOn(root, "--layout-space-6"));
      const inset = parseFloat(tokenOn(pane, "--kui-sf-p"));
      expect(band.height).toBeGreaterThan(0);
      /* A PAGE BEGINS AN INTERVAL BELOW THE BAND (2026-09-06). This asserted `>= band.bottom`
         while the padding double-counted the pane's own inset, so it passed with the title
         sixteen pixels low — an inequality cannot see a distance that is merely too big. Then it
         asserted equality WITH the band's bottom, which is the spelling that left a toolbar and
         a page title sharing the band's own bottom padding as their only air. Read as an
         interval it fails on both: on the double count by a pane inset, and on the flush
         spelling by the interval itself. */
      expect(title.top - band.bottom).toBeCloseTo(step, 0);
      // AND THE SAME NUMBER, READ WHERE THE RULE IS WRITTEN. The reach is a distance from the
      // pane's inner edge and this padding is spent one inset below it, so the declaration is
      // the reach LESS that inset PLUS the interval — the positional assertion above and this
      // one fail together on a re-added double count and separately on everything else.
      const page = root.querySelector(".kui-page")!;
      const reach = parseFloat(tokenOn(pane, "--kui-pane-inset-block-start"));
      expect(reach).toBeGreaterThan(inset);
      expect(parseFloat(computed(page, "padding-block-start"))).toBeCloseTo(
        Math.max(reach - inset + step, air),
        1,
      );
    });
  }

  it("a PINNED band publishes no reach, so the same declaration does not double-count it", () => {
    const floating = mounted(<Frame float />, { theme: {} });
    const pinned = mounted(<Frame />, { theme: {} });
    const reachOf = (root: HTMLElement) =>
      parseFloat(tokenOn(root.querySelector(".kui-shell-content")!, "--kui-pane-inset-block-start"));
    expect(reachOf(floating)).toBeGreaterThan(0);
    expect(reachOf(pinned)).toBe(0);
    // A pinned band is in flow, so the title clears it by the air alone — which is the same
    // padding declaration answering a different posture with no branch anywhere.
    const band = pinned.querySelector(".kui-pane-header")!.getBoundingClientRect();
    const title = pinned.querySelector("h1")!.getBoundingClientRect();
    expect(title.top).toBeGreaterThanOrEqual(band.bottom);
  });

  /* THE BOTTOM EDGE, WHICH NOTHING HAD EVER MOUNTED (2026-09-06, Kushagra: "can toolbar be used
     at bottom?"). It can, and the machinery for it shipped with the top edge — eight
     declarations in `surfaces.css`, four of which no law read, and two arms in `shell.css`. So
     the answer was written and unproven, which is the shape this repo keeps finding: a mechanism
     with two ends and a law over one of them is half a law. Read as the twin of the start edge,
     value for value. */
  it("a footer band is the same mechanism at the other end — it publishes its row, and the page clears it", () => {
    const root = mounted(
      <Shell style={{ blockSize: "600px" }}>
        <ShellContent>
          <ShellScroll>
            <Page title="Dialog">
              <div data-body style={{ blockSize: "2000px" }} />
            </Page>
          </ShellScroll>
          <ShellPaneFooter float>
            {/* A stated index, because the point of the publication is a band that is NOT the
                pane's own row — the reach has to follow the toolbar rather than the shell. */}
            <Toolbar size="4">
              <ToolbarTitle>Tools</ToolbarTitle>
            </Toolbar>
          </ShellPaneFooter>
        </ShellContent>
      </Shell>,
      { theme: {} },
    );
    const pane = root.querySelector(".kui-shell-content")!;
    const band = root.querySelector(".kui-pane-footer")!.getBoundingClientRect();
    /* `ownLength`, NOT `tokenOn` — this name is registered `inherits: false`, and `tokenOn`
       resolves through a child probe, where a non-inheriting property answers its own
       `initial-value`. The first spelling of this law read 0px off a pane publishing 48 and
       reported the mechanism broken. An instrument gets calibrated before its output is
       evidence. */
    const row = ownLength(pane, "--kui-pane-band-row-end");
    const inset = parseFloat(tokenOn(pane, "--kui-sf-p"));
    const reach = parseFloat(tokenOn(pane, "--kui-pane-inset-block-end"));

    // The band published the TOOLBAR's row, not the shell's — which is the whole point, and
    // what fails if only the start edge is spelled.
    expect(row).toBeCloseTo(parseFloat(tokenOn(pane, "--control-height-4")), 1);
    expect(row).toBeGreaterThan(parseFloat(tokenOn(pane, "--kui-shell-row")));
    expect(reach).toBeCloseTo(row + 2 * inset, 1);
    expect(band.height).toBeCloseTo(reach, 1);

    // And the page clears it by the same declaration the top edge uses, less the inset the
    // scroller has already given back.
    const page = root.querySelector(".kui-page")!;
    expect(parseFloat(computed(page, "padding-block-end"))).toBeCloseTo(reach - inset, 1);

    // The start edge is untouched, so the two names are two names.
    expect(ownLength(pane, "--kui-pane-band-row-start")).toBe(0);
    expect(parseFloat(tokenOn(pane, "--kui-pane-inset-block-start"))).toBe(0);
  });

  it("a bottom band rests where a top one does — the step is the toolbar's, not the band's end", () => {
    /* 2026-09-06, Kushagra: "Size 3?" — yes, and it is worth an assertion rather than an
       argument. `BAND_STEP` is read by the TOOLBAR, so which end of the pane it sits at cannot
       reach it; both bands take `ChromeSize`, so both see the same app index and both rest one
       step above it. Read as an agreement between the two ends rather than against the number
       3, so the day the app's index moves this law moves with it. */
    const both = mounted(
      <Shell style={{ blockSize: "600px" }}>
        <ShellContent>
          <ShellPaneHeader float>
            <Toolbar>
              <ToolbarTitle>Top</ToolbarTitle>
            </Toolbar>
          </ShellPaneHeader>
          <ShellScroll>
            <Page title="Dialog">
              <div data-body style={{ blockSize: "2000px" }} />
            </Page>
          </ShellScroll>
          <ShellPaneFooter float>
            <Toolbar>
              <ToolbarTitle>Bottom</ToolbarTitle>
            </Toolbar>
          </ShellPaneFooter>
        </ShellContent>
      </Shell>,
      { theme: {} },
    );
    const pane = both.querySelector(".kui-shell-content")!;
    const start = ownLength(pane, "--kui-pane-band-row-start");
    const end = ownLength(pane, "--kui-pane-band-row-end");
    expect(end).toBeCloseTo(start, 1);
    // And it is the STEP, not the app's own row — the vacuity half.
    expect(end).toBeGreaterThan(parseFloat(tokenOn(pane, "--kui-shell-row")));
    // Both bands are therefore the same depth, which is what makes a page symmetric.
    expect(parseFloat(tokenOn(pane, "--kui-pane-inset-block-end"))).toBeCloseTo(
      parseFloat(tokenOn(pane, "--kui-pane-inset-block-start")),
      1,
    );
  });

  it("outside a frame there is no reach and the page still pads its air — the fallback is the value", () => {
    const root = mounted(
      <Card>
        <Page title="Dialog" />
      </Card>,
      { theme: {} },
    );
    const page = root.querySelector(".kui-page")!;
    const air = parseFloat(tokenOn(root, "--layout-space-7"));
    expect(parseFloat(computed(page, "padding-block-start"))).toBeCloseTo(air, 1);
  });

  it("the marker is out of flow — a page with one measures the same as a page without", () => {
    const root = mounted(<Page title="Dialog" description="A panel." />, { theme: {} });
    const marker = root.querySelector(".kui-page-marker")!;
    expect(computed(marker, "position")).toBe("absolute");
    const header = root.querySelector(".kui-page-header")!.getBoundingClientRect();
    const deck = root.querySelector("p")!.getBoundingClientRect();
    // The block ends at its last LINE, not below the marker.
    expect(header.bottom).toBeCloseTo(deck.bottom, 0);
  });
});

describe("the band says the title again once the page's own has gone (§45, §46)", () => {
  it("the mirroring title is silent while the large title is on screen, and arrives when it is not", async () => {
    const root = mounted(<Frame float />, { theme: {} });
    const mirror = root.querySelector(".kui-toolbar-title")!;
    expect(mirror.textContent).toBe("Dialog");
    // Paint, not room: the box is there either way, so nothing beside it moves on arrival.
    expect(computed(mirror, "opacity")).toBe("0");
    expect(mirror.getBoundingClientRect().width).toBeGreaterThan(0);

    const viewport = root.querySelector(".kui-scroll-viewport")!;
    viewport.scrollTop = 400;
    expect(await until(() => mirror.hasAttribute("data-collapsed"))).toBe(true);
    expect(await until(() => computed(mirror, "opacity") === "1")).toBe(true);

    viewport.scrollTop = 0;
    expect(await until(() => !mirror.hasAttribute("data-collapsed"))).toBe(true);
  });

  it("it collapses when the title passes the BAND, not when it passes the viewport", async () => {
    /* THE MARKER'S OFFSET IS THE WHOLE MECHANISM, and this is the fixture that can see it. The
       band floats OVER the scroller, so a title is already hidden while it is still inside the
       scroller's box — by up to the band's own reach. Scrolled to exactly half that reach, the
       title block's bottom is under the band and out of sight, and the page must say so.

       A marker sitting at the block's bottom with no offset would still be intersecting here,
       which is what makes this law fail on the version of this component that does not shift
       it (falsified by deleting `inset-block-end` from `.kui-page-marker`). */
    const root = mounted(<Frame float />, { theme: {} });
    const mirror = root.querySelector(".kui-toolbar-title")!;
    const viewport = root.querySelector(".kui-scroll-viewport")!;
    const reach = parseFloat(
      tokenOn(root.querySelector(".kui-shell-content")!, "--kui-pane-inset-block-start"),
    );
    const header = root.querySelector(".kui-page-header")!;
    const drop =
      header.getBoundingClientRect().bottom - viewport.getBoundingClientRect().top - reach / 2;
    expect(drop).toBeGreaterThan(reach);
    viewport.scrollTop = drop;
    expect(await until(() => mirror.hasAttribute("data-collapsed"))).toBe(true);
  });

  it("a page in no pane claims nothing — a title with no page renders nothing at all", () => {
    const root = mounted(
      <Card>
        <Toolbar>
          <ToolbarTitle />
        </Toolbar>
        <Page title="Dialog" />
      </Card>,
      { theme: {} },
    );
    expect(root.querySelector(".kui-toolbar-title")).toBeNull();
  });
});

describe("what the type refuses (§46)", () => {
  it("no level, no size, no actions", () => {
    // @ts-expect-error — a page is the document's one h1; a heading that is not the document's
    // subject is a `Heading` inside the page.
    void (<Page title="Dialog" level={2} />);
    // @ts-expect-error — there is one page step in an app (§15).
    void (<Page title="Dialog" size="3" />);
    // @ts-expect-error — actions go in the toolbar, where the frame's other controls are.
    void (<Page title="Dialog" actions={null} />);
    expect(true).toBe(true);
  });
});
