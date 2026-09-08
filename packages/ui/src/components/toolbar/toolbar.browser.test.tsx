/**
 * Toolbar's laws, mounted (§45).
 *
 * The row's whole claim is that it is the system's rhythm rather than nine opinions per
 * screen, so nearly every law here is an AGREEMENT with something already shipped: the band is
 * as tall as a Button at its index, a group is as tall as the Button beside it, a group's well
 * is the same well a segmented control's track wears, a rule in it is the hairline a Separator
 * draws. Written that way, a change to the ladder moves the component and the law together or
 * fails both.
 *
 * The one thing that is NOT an agreement is the keyboard, and it is the reason this exists as a
 * component: `role="toolbar"` with one tab stop and arrow keys inside it.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, SIZES, computed, mounted, tokenOn, until, within } from "../../test/browser.tsx";
import type { Size } from "../../system/axes.ts";
import { Box } from "../box/box.tsx";
import { Flex } from "../flex/flex.tsx";
import { BAND_STEP } from "../../system/size.ts";
import { themeDefaults } from "../../theme/theme.tsx";
import { Button } from "../button/button.tsx";
import { SegmentedControl, SegmentedItem } from "../segmented-control/segmented-control.tsx";
import { Separator } from "../separator/separator.tsx";
import { Text } from "../text/text.tsx";
import { BAND_TITLE_STEP, OWNED_BODY_STEP } from "../../system/type-steps.ts";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarOverflow, ToolbarSeparator, ToolbarTitle } from "./toolbar.tsx";

/* THE INDEX A DEFAULT APP'S BAND RESTS AT, derived rather than written as `3` (2026-09-06).
   Three laws below compared an unsized toolbar against `--control-height-2` and against
   `BAND_TITLE_STEP["2"]`, which was the old default written as a literal in the law — so when
   the default moved they failed, correctly, and a literal `3` here would only move the same
   problem one step along. */
const BAND = BAND_STEP[themeDefaults.size];

const Row = (props: { size?: Size; children?: React.ReactNode }) => (
  <Toolbar {...(props.size ? { size: props.size } : {})}>
    {props.children ?? (
      <>
        <ToolbarButton>One</ToolbarButton>
        <ToolbarButton>Two</ToolbarButton>
        <ToolbarButton>Three</ToolbarButton>
      </>
    )}
  </Toolbar>
);

describe("a toolbar is a row that announces itself (§45)", () => {
  it("says role=toolbar and its orientation — the non-visual forcer that makes it a component", () => {
    const row = mounted(<Row />, { theme: {} });
    expect(row.getAttribute("role")).toBe("toolbar");
    expect(row.getAttribute("aria-orientation")).toBe("horizontal");
    const vertical = mounted(<Toolbar orientation="vertical"><ToolbarButton>a</ToolbarButton></Toolbar>, {
      theme: {},
    });
    expect(vertical.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("ONE tab stop for the whole row — the arrow keys move inside it", () => {
    const row = mounted(<Row />, { theme: {} });
    const buttons = [...row.querySelectorAll("button")];
    expect(buttons).toHaveLength(3);
    expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(1);
    expect(buttons.filter((b) => b.tabIndex === -1)).toHaveLength(2);
  });

  it("a registered control ANNOUNCES as the element it is, and adds nothing on top of it", () => {
    /* THE DEFECT THIS CATCHES shipped for a day and no law here could see it (2026-09-06,
       found in `pnpm dev`): `nativeButton` was a flat `false`, which tells Base UI the rendered
       element is not a native button, so it applied the non-native kit — `role="button"` on a
       real `<button>`, plus `aria-disabled` — and warned about it in the console while all 26
       laws passed. Every one of them read geometry or the keyboard; none read what the control
       says it IS, which is the 2026-08-03 lesson in its accessibility spelling. */
    const row = mounted(
      <Toolbar>
        <ToolbarButton>One</ToolbarButton>
      </Toolbar>,
      { theme: {} },
    );
    const button = row.querySelector("button")!;
    const plain = mounted(<Button>One</Button>, { theme: {} });
    // THE DEFECT ITSELF: a native `<button>` that also claims `role="button"`.
    expect(button.getAttribute("role")).toBeNull();
    expect(button.tagName).toBe("BUTTON");
    // Live, and saying so. `aria-disabled="false"` is Base UI's spelling for an item that stays
    // focusable when disabled, which is the toolbar pattern the APG asks for — a roving tab stop
    // that skipped its dead items would strand the keyboard on the way past them.
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    // And it announces exactly what the same Button announces outside a row: the registration
    // is the only thing this part adds to the accessibility tree.
    expect(button.getAttribute("role")).toBe(plain.getAttribute("role"));
    expect(button.tagName).toBe(plain.tagName);
  });

  it("a plain Button in the row is NOT registered, which is what ToolbarButton exists for", () => {
    // The refusal, measured rather than argued: our Button cannot enrol itself in Base UI's
    // composite, so a row of them is a row of tab stops. This is the law that says the thin
    // wrapper is load-bearing and not ceremony.
    const row = mounted(
      <Toolbar>
        <Button>One</Button>
        <Button>Two</Button>
      </Toolbar>,
      { theme: {} },
    );
    expect([...row.querySelectorAll("button")].filter((b) => b.tabIndex === -1)).toHaveLength(0);
  });
});

describe("the row is one control row, at its own index (§4, §45)", () => {
  for (const size of SIZES) {
    it(`stands exactly as tall as a Button at size ${size} — the identity the shell's safe area rests on`, () => {
      const row = mounted(<Row size={size} />, { theme: {} });
      const button = mounted(<Button size={size}>One</Button>, { theme: {} });
      expect(row.getBoundingClientRect().height).toBeCloseTo(
        button.getBoundingClientRect().height,
        1,
      );
    });
  }

  it("a vertical toolbar swaps the axes and states the same extent across", () => {
    const row = mounted(
      <Toolbar orientation="vertical">
        <ToolbarButton iconOnly aria-label="One">
          <svg />
        </ToolbarButton>
      </Toolbar>,
      { theme: {} },
    );
    expect(computed(row, "flex-direction")).toBe("column");
    // The extent it STATES swaps with the axes; the extent it TAKES is the container's, which
    // is the same sentence that refuses a length prop everywhere else in this package.
    expect(parseFloat(computed(row, "min-inline-size"))).toBeCloseTo(
      parseFloat(tokenOn(row, `--control-height-${BAND}`)),
      1,
    );
    expect(parseFloat(computed(row, "min-block-size"))).toBe(0);
  });
});

describe("a toolbar button ranks where a button ranks (§11, §45)", () => {
  /* 2026-09-06, Kushagra: "prefer a medium emphasis button whenever, quiet and loud are for
     exceptional cases." It rested at `quiet` until now and NO LAW READ IT — the override could
     have been deleted at any point in the component's life with the suite green, which is the
     absence that let it be a silent special case rather than a decision. Read as an agreement
     with a mounted Button, so the day the system's resting rung moves they move together. */
  it("an unstated ToolbarButton paints exactly what an unstated Button paints", () => {
    const row = mounted(
      <Toolbar>
        <ToolbarButton>One</ToolbarButton>
      </Toolbar>,
      { theme: {} },
    );
    const inRow = row.querySelector(".kui-control")!;
    const plain = mounted(<Button size={BAND}>One</Button>, { theme: {} });
    expect(computed(inRow, "background-color")).toBe(computed(plain, "background-color"));
    expect(computed(inRow, "color")).toBe(computed(plain, "color"));
  });

  it("and it is a REAL rung, not an agreement between two transparent boxes", () => {
    // The vacuity half: `quiet` rests on nothing, so the law above would pass on the old default
    // if a plain Button also rested on nothing. It does not.
    const plain = mounted(<Button size={BAND}>One</Button>, { theme: {} });
    const quiet = mounted(<Button size={BAND} emphasis="quiet">One</Button>, { theme: {} });
    expect(computed(plain, "background-color")).not.toBe(computed(quiet, "background-color"));
  });

  it("a control IN A GROUP rests quiet — a mark on the well, not a box on a box", () => {
    /* 2026-09-06, Kushagra: "not in the toolbar group, because toolbar group has a bg now."
       The group draws a fill, so a filled control inside it stacks two of them. Read as an
       agreement against a quiet Button AND against the loose control in the same row, so the
       law fails whichever half breaks. */
    const row = mounted(
      <Toolbar>
        <ToolbarButton>Loose</ToolbarButton>
        <ToolbarGroup>
          <ToolbarButton>Hosted</ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
      { theme: {} },
    );
    const loose = row.querySelector(":scope > .kui-control:not(.kui-toolbar-group)")!;
    const hosted = row.querySelector(".kui-toolbar-group .kui-control")!;
    const quiet = mounted(<Button size={BAND} emphasis="quiet">x</Button>, { theme: {} });
    const plain = mounted(<Button size={BAND}>x</Button>, { theme: {} });
    expect(computed(hosted, "background-color")).toBe(computed(quiet, "background-color"));
    expect(computed(loose, "background-color")).toBe(computed(plain, "background-color"));
    // And the two are genuinely different, or the pair above is one assertion twice.
    expect(computed(hosted, "background-color")).not.toBe(computed(loose, "background-color"));
  });

  it("a stated emphasis beats the capsule, the same way it beats the row", () => {
    const row = mounted(
      <Toolbar>
        <ToolbarGroup>
          <ToolbarButton emphasis="loud">Hosted</ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
      { theme: {} },
    );
    const hosted = row.querySelector(".kui-toolbar-group .kui-control")!;
    const loud = mounted(<Button size={BAND} emphasis="loud">x</Button>, { theme: {} });
    expect(computed(hosted, "background-color")).toBe(computed(loud, "background-color"));
  });

  it("a control that wants no fill still says so, per control", () => {
    const row = mounted(
      <Toolbar>
        <ToolbarButton emphasis="quiet">One</ToolbarButton>
      </Toolbar>,
      { theme: {} },
    );
    const inRow = row.querySelector(".kui-control")!;
    const quiet = mounted(<Button size={BAND} emphasis="quiet">One</Button>, { theme: {} });
    expect(computed(inRow, "background-color")).toBe(computed(quiet, "background-color"));
  });
});

describe("the row supplies the index, and never overrules a stated one (§4, §28)", () => {
  it("a control in the row takes the row's size", () => {
    const row = mounted(<Row size="4" />, { theme: {} });
    const button = mounted(<Button size="4">One</Button>, { theme: {} });
    expect(row.querySelector("button")!.getBoundingClientRect().height).toBeCloseTo(
      button.getBoundingClientRect().height,
      1,
    );
  });

  it("an explicit size on a control still wins — the caller's value is read first", () => {
    const row = mounted(
      <Toolbar size="4">
        <ToolbarButton size="1">One</ToolbarButton>
      </Toolbar>,
      { theme: {} },
    );
    const small = mounted(<Button size="1">One</Button>, { theme: {} });
    expect(row.querySelector("button")!.getBoundingClientRect().height).toBeCloseTo(
      small.getBoundingClientRect().height,
      1,
    );
  });

  /* A BAND RESTS ONE STEP ABOVE THE APP (2026-09-06, Kushagra: "I think it should be size 3 by
     default on toolbar, not subscribing to theme's size"). This law read the opposite until
     now — it mounted a row under `theme: { size: "3" }` and asserted it stood level with a
     Button at 3, which is the default that made both bands on the documentation site write
     `size="3"` over it by hand. Read across ALL FOUR app indexes, because two adjacent steps
     agree under more than one wrong spelling and the shipped one was found by a person reading
     a ladder as a ladder. */
  for (const app of SIZES) {
    it(`a toolbar with no size stands one step above the app's own rest — app ${app}`, () => {
      const row = mounted(<Row />, { theme: { size: app } });
      const band = mounted(<Button size={BAND_STEP[app]}>One</Button>, { theme: { size: app } });
      expect(row.getBoundingClientRect().height).toBeCloseTo(
        band.getBoundingClientRect().height,
        1,
      );
    });
  }

  it("and the step is a real one, or the law above is an agreement with nothing", () => {
    // The vacuity guard: at every index but the last, the band must be TALLER than a control at
    // the app's own rest — which is what a flat `useSize(sizeProp)` would fail and what a flat
    // literal `3` would fail at app index 4, where it comes out shorter instead.
    for (const app of SIZES) {
      const row = mounted(<Row />, { theme: { size: app } }).getBoundingClientRect().height;
      const content = mounted(<Button>One</Button>, { theme: { size: app } })
        .getBoundingClientRect().height;
      if (app === "4") expect(row).toBeCloseTo(content, 1);
      else expect(row).toBeGreaterThan(content);
      // And it NEVER inverts, which is the whole reason the step is derived and not a literal.
      expect(row).toBeGreaterThanOrEqual(content);
    }
  });
});

describe("a group is the segmented control's track with nothing chosen in it (§26, §45)", () => {
  const Grouped = (props: { size?: Size }) => (
    <Toolbar {...(props.size ? { size: props.size } : {})}>
      <ToolbarGroup>
        <ToolbarButton iconOnly aria-label="Left"><svg /></ToolbarButton>
        <ToolbarButton iconOnly aria-label="Centre"><svg /></ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  );

  for (const size of SIZES) {
    it(`stands level with the Button beside it, and hosts its own by the inset — size ${size}`, () => {
      const row = mounted(<Grouped size={size} />, { theme: {} });
      const button = mounted(<Button size={size}>One</Button>, { theme: {} });
      const group = row.querySelector(".kui-toolbar-group")!;
      const inset = parseFloat(tokenOn(group, "--toolbar-group-inset"));
      expect(inset).toBeGreaterThan(0);
      // The group IS the rung — the skeleton's border stood down by width, which is the
      // segmented control's D2: a transparent border still occupies layout.
      expect(group.getBoundingClientRect().height).toBeCloseTo(
        button.getBoundingClientRect().height,
        1,
      );
      // And the hosted control is the group minus two insets, §4's rule with N hosts.
      expect(group.querySelector("button")!.getBoundingClientRect().height).toBeCloseTo(
        group.getBoundingClientRect().height - 2 * inset,
        1,
      );
    });
  }

  for (const appearance of APPEARANCES) {
    it(`wears the same well a segmented track wears — ${appearance}`, () => {
      const row = mounted(<Grouped />, { theme: { appearance } });
      const segmented = mounted(
        <SegmentedControl defaultValue="a">
          <SegmentedItem value="a">A</SegmentedItem>
          <SegmentedItem value="b">B</SegmentedItem>
        </SegmentedControl>,
        { theme: { appearance } },
      );
      expect(computed(row.querySelector(".kui-toolbar-group")!, "background-color")).toBe(
        computed(segmented, "background-color"),
      );
    });
  }

  it("the corner inside is concentric — the outer minus the inset between them", () => {
    const row = mounted(<Grouped size="3" />, { theme: { radius: "medium" } });
    const group = row.querySelector(".kui-toolbar-group")!;
    const inset = parseFloat(tokenOn(group, "--toolbar-group-inset"));
    const outer = parseFloat(computed(group, "border-top-left-radius"));
    const inner = parseFloat(computed(group.querySelector("button")!, "border-top-left-radius"));
    expect(outer).toBeGreaterThan(inset);
    expect(inner).toBeCloseTo(outer - inset, 1);
  });

  it("squares with the radius axis rather than subtracting past zero", () => {
    const row = mounted(<Grouped size="3" />, { theme: { radius: "none" } });
    const group = row.querySelector(".kui-toolbar-group")!;
    expect(parseFloat(computed(group.querySelector("button")!, "border-top-left-radius"))).toBe(0);
  });
});

describe("the row paints nothing, so it catches nothing (§45)", () => {
  it("a click in the gap between two clusters reaches what is behind the row", () => {
    const root = mounted(
      <Box data-behind style={{ inlineSize: "400px" }}>
        <Toolbar>
          <ToolbarButton>One</ToolbarButton>
          <ToolbarButton>Two</ToolbarButton>
        </Toolbar>
      </Box>,
      { theme: {} },
    );
    const row = root.querySelector(".kui-toolbar")!.getBoundingClientRect();
    const hit = document.elementFromPoint(row.left + row.width / 2, row.top + row.height / 2);
    expect(hit).not.toBeNull();
    // The row itself must NOT be the answer: a floating band's empty middle is a row's worth
    // of dead page, which is the 2026-08-30 finding this rule inherits.
    expect(hit!.classList.contains("kui-toolbar")).toBe(false);
    expect(hit!.hasAttribute("data-behind")).toBe(true);
  });

  it("and the controls take the pointer straight back", () => {
    const row = mounted(<Row />, { theme: {} });
    const button = row.querySelector("button")!.getBoundingClientRect();
    const hit = document.elementFromPoint(
      button.left + button.width / 2,
      button.top + button.height / 2,
    );
    expect(hit!.closest("button")).not.toBeNull();
  });
});

describe("a rule between clusters is the Separator's hairline (§11, §45)", () => {
  it("draws the same colour a Separator draws, and stands at the glyphs rather than the band", () => {
    const row = mounted(
      <Toolbar size="3">
        <ToolbarButton>One</ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton>Two</ToolbarButton>
      </Toolbar>,
      { theme: {} },
    );
    const rule = row.querySelector(".kui-separator")!;
    const plain = mounted(<Separator orientation="vertical" />, { theme: {} });
    expect(computed(rule, "background-color")).toBe(computed(plain, "background-color"));
    expect(rule.getAttribute("data-orientation")).toBe("vertical");
    const glyph = parseFloat(tokenOn(row, "--kui-tb-glyph"));
    expect(glyph).toBeGreaterThan(0);
    expect(rule.getBoundingClientRect().height).toBeCloseTo(glyph, 1);
    expect(rule.getBoundingClientRect().height).toBeLessThan(row.getBoundingClientRect().height);
  });
});

describe("a title stands apart from the controls beside it (§45, 2026-09-06)", () => {
  /* CENTRED WAS TRIED AND REVERSED the same day. What survives is the finding underneath it: a
     title is a different KIND of thing from the buttons it sits among, so the distance around it
     is not the distance between two of them — and it is the ROW that states that, not whichever
     `Flex` the caller happened to group with. */
  it("takes MORE air than the row's own gap, and takes it from the row", () => {
    const row = mounted(
      <Toolbar>
        <ToolbarButton iconOnly aria-label="Back">
          <svg />
        </ToolbarButton>
        <ToolbarTitle>Nature Walks</ToolbarTitle>
      </Toolbar>,
      { theme: {} },
    );
    const title = row.querySelector(".kui-toolbar-title")!;
    const gap = parseFloat(tokenOn(row, "--kui-tb-gap"));
    const air = parseFloat(tokenOn(row, "--kui-tb-title-gap"));
    expect(air).toBeGreaterThan(gap);
    expect(parseFloat(computed(title, "margin-inline-start"))).toBeCloseTo(air, 1);
  });

  it("and it reaches INSIDE a cluster, which is how a band is usually written", () => {
    const row = mounted(
      <Toolbar>
        <Flex align="center" gap="2">
          <ToolbarButton iconOnly aria-label="Back">
            <svg />
          </ToolbarButton>
          <ToolbarTitle>Nature Walks</ToolbarTitle>
        </Flex>
      </Toolbar>,
      { theme: {} },
    );
    const title = row.querySelector(".kui-toolbar-title")!;
    expect(parseFloat(computed(title, "margin-inline-start"))).toBeCloseTo(
      parseFloat(tokenOn(row, "--kui-tb-title-gap")),
      1,
    );
  });

  it("a title that starts the row takes none — air belongs between things, not against a wall", () => {
    const row = mounted(
      <Toolbar>
        <ToolbarTitle>Nature Walks</ToolbarTitle>
        <ToolbarButton>Done</ToolbarButton>
      </Toolbar>,
      { theme: {} },
    );
    const title = row.querySelector(".kui-toolbar-title")!;
    expect(parseFloat(computed(title, "margin-inline-start"))).toBe(0);
    expect(parseFloat(computed(title, "margin-inline-end"))).toBeCloseTo(
      parseFloat(tokenOn(row, "--kui-tb-title-gap")),
      1,
    );
  });

  it("the row is still a line with the split — a title does not change how it is arranged", () => {
    const row = mounted(
      <Toolbar style={{ inlineSize: "600px" }}>
        <Flex align="center" gap="2">
          <ToolbarButton iconOnly aria-label="Back">
            <svg />
          </ToolbarButton>
          <ToolbarTitle>Nature Walks</ToolbarTitle>
        </Flex>
        <ToolbarButton>Done</ToolbarButton>
      </Toolbar>,
      { theme: {} },
    );
    expect(computed(row, "display")).toBe("flex");
    const band = row.getBoundingClientRect();
    const title = row.querySelector(".kui-toolbar-title")!.getBoundingClientRect();
    const done = [...row.querySelectorAll("button")].at(-1)!.getBoundingClientRect();
    // Leading, not centred — the reversal, stated as a measurement.
    expect(title.left - band.left).toBeLessThan(band.width / 3);
    expect(band.right - done.right).toBeLessThan(1);
  });
});

describe("the title says the row's words, or the page's, or nothing (§45, §46)", () => {
  it("given children it says them", () => {
    const row = mounted(
      <Toolbar>
        <ToolbarTitle>Notes</ToolbarTitle>
      </Toolbar>,
      { theme: {} },
    );
    const title = row.querySelector(".kui-toolbar-title")!;
    expect(title.textContent).toBe("Notes");
    // Its own words are permanent: no mirror stamp, so nothing hides them.
    expect(title.hasAttribute("data-mirror")).toBe(false);
    expect(computed(title, "opacity")).toBe("1");
  });

  it("with no words and no page it renders NOTHING — not an empty box spending the row's gap", () => {
    const row = mounted(
      <Toolbar>
        <ToolbarTitle />
      </Toolbar>,
      { theme: {} },
    );
    expect(row.querySelector(".kui-toolbar-title")).toBeNull();
  });

  it("reads one step above the words the system writes in a message — a title names, a message says", () => {
    const row = mounted(
      <Toolbar>
        <ToolbarTitle>Notes</ToolbarTitle>
      </Toolbar>,
      { theme: {} },
    );
    const title = row.querySelector(".kui-toolbar-title")!;
    const body = mounted(<Text size={OWNED_BODY_STEP[BAND]}>Notes</Text>, { theme: {} });
    const step = mounted(<Text size={BAND_TITLE_STEP[BAND]}>Notes</Text>, { theme: {} });
    expect(computed(title, "font-size")).toBe(computed(step, "font-size"));
    expect(parseFloat(computed(title, "font-size"))).toBeGreaterThan(
      parseFloat(computed(body, "font-size")),
    );
    // And it still fits the band it is in: a title that grew the row would move every safe area
    // the shell publishes from it.
    const button = mounted(<Button size={BAND}>One</Button>, { theme: {} });
    expect(row.getBoundingClientRect().height).toBeCloseTo(
      button.getBoundingClientRect().height,
      1,
    );
  });

  it("truncates rather than wrapping — a band is one control row tall", () => {
    const row = mounted(
      <Toolbar style={{ inlineSize: "120px" }}>
        <ToolbarTitle>An extremely long document title that cannot fit in this band</ToolbarTitle>
      </Toolbar>,
      { theme: {} },
    );
    const title = row.querySelector(".kui-toolbar-title")!;
    expect(computed(title, "text-overflow")).toBe("ellipsis");
    expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
    const button = mounted(<Button size={BAND}>One</Button>, { theme: {} });
    expect(row.getBoundingClientRect().height).toBeCloseTo(
      button.getBoundingClientRect().height,
      1,
    );
  });
});

describe("the group is the pane, and the row is not (§10, §45)", () => {
  /* 2026-09-06, Kushagra: "I like how a toolbar group looks, it looks similar to a medium
     emphasis button, so therefore it needs to support backdrop also." A material makes a
     component's own FILL translucent, so it is expressible exactly where there is one — the
     row paints nothing, the group draws a box, and that asymmetry is the rule rather than an
     inconsistency. Read against a mounted `SegmentedControl`, because the group IS that track
     with nothing chosen in it and the two must not drift. */
  it("a group with `backdrop` resolves the theme's material, and the row around it never does", () => {
    const root = mounted(
      <Toolbar>
        <ToolbarGroup backdrop>
          <ToolbarButton iconOnly aria-label="One">
            <svg />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
      { theme: { material: "regular" } },
    );
    const group = root.querySelector(".kui-toolbar-group")!;
    // The ROOT is the toolbar — `querySelector` searches descendants, and a `.kui-toolbar`
    // query on it has never matched anything (the 2026-08-08 `within()` finding, reproduced
    // here by its own author on the first run).
    const row = root;
    expect(group.getAttribute("data-material")).toBe("regular");
    // The pane is the group; the row is a row. It states no material even inside a glass theme,
    // which is the half a `data-material` on the wrong element would quietly break.
    expect(row.getAttribute("data-material")).toBeNull();
    expect(computed(group, "backdrop-filter")).not.toBe("none");
  });

  it("a glass group wears every part a glass pane wears — the ring, the glint and the rim", () => {
    /* 2026-09-06, Kushagra, from the preview over a photograph: "why does the group material
       seem different to button? Group doesnt have that ring." It did not: the ring, glint and
       rim rules ENUMERATE their members, and a component that draws a pane and is not in the
       list gets the veil, the blur and the lens and nothing else — three of §10's five parts,
       silently. The contract says every pane resolves all five identically, so this reads them
       as PAINT rather than as selectors. */
    const group = mounted(
      <Toolbar>
        <ToolbarGroup backdrop>
          <ToolbarButton iconOnly aria-label="One">
            <svg />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
      { theme: { material: "regular" } },
    ).querySelector(".kui-toolbar-group")!;
    const ring = getComputedStyle(group, "::after");
    const glint = getComputedStyle(group, "::before");
    // The lip and its catch are both drawn, and both are real boxes rather than empty rules.
    expect(ring.content, "the ring is drawn").not.toBe("none");
    expect(ring.background, "the ring carries the material's conic").not.toBe("");
    expect(ring.background).toContain("gradient");
    expect(glint.content, "the glint is drawn").not.toBe("none");
    // The rim is the pane's own lighting, on the element — grain, bloom and sheen, so it is a
    // layer stack rather than a single gradient and the honest assertion is that it is THERE.
    expect(computed(group, "background-image"), "the rim is painted").not.toBe("none");
    // And the pseudo-elements resolve against THIS box, which is what `position` buys.
    expect(computed(group, "position")).toBe("relative");
  });

  it("and every one of them is the segmented track's, character for character", () => {
    /* The group IS that track with nothing chosen in it, so parity is an AGREEMENT rather than
       a set of values repeated here — a law with literals would have gone stale the first time
       the ladder moved, and could not have caught three missing parts either. */
    const group = mounted(
      <Toolbar>
        <ToolbarGroup backdrop>
          <ToolbarButton iconOnly aria-label="One">
            <svg />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
      { theme: { material: "regular" } },
    ).querySelector(".kui-toolbar-group")!;
    const track = mounted(
      <SegmentedControl backdrop defaultValue="a" aria-label="View">
        <SegmentedItem value="a">A</SegmentedItem>
      </SegmentedControl>,
      { theme: { material: "regular" } },
    );
    for (const part of ["::after", "::before"] as const) {
      expect(getComputedStyle(group, part).background, `${part} agrees`).toBe(
        getComputedStyle(track, part).background,
      );
    }
    expect(computed(group, "background-image")).toBe(computed(track, "background-image"));
  });

  it("and it agrees with the segmented track it is a copy of", () => {
    const group = mounted(
      <Toolbar>
        <ToolbarGroup backdrop>
          <ToolbarButton iconOnly aria-label="One">
            <svg />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
      { theme: { material: "regular" } },
    ).querySelector(".kui-toolbar-group")!;
    const track = mounted(
      <SegmentedControl backdrop defaultValue="a" aria-label="View">
        <SegmentedItem value="a">A</SegmentedItem>
      </SegmentedControl>,
      { theme: { material: "regular" } },
    );
    // The LENS is per-box — each pane mints its own displacement map and references it by id —
    // so the filter strings differ in exactly one term by construction. The agreement is about
    // the material, so the ids are stripped and the rest must match character for character.
    const chain = (el: Element) => computed(el, "backdrop-filter").replace(/url\("#[^"]*"\)\s*/, "");
    expect(chain(group)).toBe(chain(track));
    expect(chain(group)).not.toBe("");
    expect(group.getAttribute("data-material")).toBe(track.getAttribute("data-material"));
  });

  it("a glass group scopes its buttons — one glass per stack, and nobody types it", () => {
    /* The fixture is the load-bearing half: a button inside a SOLID group would carry no
       material either, so the subject has to be a button that ASKS for one. It states
       `backdrop` and must still resolve on-glass rather than opening a second pane. */
    const root = mounted(
      <Toolbar>
        <ToolbarGroup backdrop>
          <ToolbarButton backdrop iconOnly aria-label="One">
            <svg />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
      { theme: { material: "regular" } },
    );
    const button = root.querySelector(".kui-toolbar-group .kui-control")!;
    expect(button.getAttribute("data-material")).toBe("on-glass");
    expect(computed(button, "backdrop-filter")).toBe("none");
  });

  it("`backdrop` on the ROW reaches every control in it, said once instead of per button", () => {
    /* 2026-09-06, Kushagra: "backdrop of toolbar should suggest items inside it get backdrop."
       The row marks a REGION — it still paints nothing and takes no material of its own — which
       is `<Box backdrop>`'s mechanism and the fact `float` on a pane band already makes true. */
    const root = mounted(
      <Toolbar backdrop>
        <ToolbarButton iconOnly aria-label="One">
          <svg />
        </ToolbarButton>
        <ToolbarGroup>
          <ToolbarButton iconOnly aria-label="Two">
            <svg />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
      { theme: { material: "regular" } },
    );
    const loose = root.querySelector(":scope > .kui-control:not(.kui-toolbar-group)")!;
    const group = root.querySelector(".kui-toolbar-group")!;
    // The loose control and the group both take the region, with neither stating a prop.
    expect(loose.getAttribute("data-material")).toBe("regular");
    expect(group.getAttribute("data-material")).toBe("regular");
    // And the ROW is still not a pane: it marks the space, it does not paint in it.
    expect(root.getAttribute("data-material")).toBeNull();
    expect(computed(root, "backdrop-filter")).toBe("none");
  });

  it("a control's own answer still wins over the row's region", () => {
    // The bound that makes an ambient mark safe, and it is `<Box backdrop>`'s own: nothing is
    // decided FOR a control that has decided for itself.
    const root = mounted(
      <Toolbar backdrop>
        <ToolbarButton backdrop={false} iconOnly aria-label="One">
          <svg />
        </ToolbarButton>
      </Toolbar>,
      { theme: { material: "regular" } },
    );
    const button = root.querySelector(".kui-control")!;
    expect(button.getAttribute("data-material")).toBeNull();
    expect(computed(button, "backdrop-filter")).toBe("none");
  });

  it("no backdrop, no material — selectivity, and it costs nothing where nothing passes behind", () => {
    const root = mounted(
      <Toolbar>
        <ToolbarGroup>
          <ToolbarButton iconOnly aria-label="One">
            <svg />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
      { theme: { material: "regular" } },
    );
    const group = root.querySelector(".kui-toolbar-group")!;
    expect(group.getAttribute("data-material")).toBeNull();
    expect(computed(group, "backdrop-filter")).toBe("none");
  });
});

describe("what the row refuses (§45)", () => {
  it("no tone, no emphasis, no material — a toolbar is a row, and the surface answers the theme", () => {
    // @ts-expect-error — nothing here paints, so there is no fill to rank.
    void (<Toolbar tone="destructive" />);
    // @ts-expect-error — same.
    void (<Toolbar emphasis="loud" />);
    // @ts-expect-error — the pane it sits in states the backdrop (§10).
    void (<Toolbar material="thin" />);
    // @ts-expect-error — the group and its buttons both read the ROW's index.
    void (<ToolbarGroup size="3" />);
    expect(true).toBe(true);
  });
});

/* ── The overflow (§45, 2026-09-08) ──────────────────────────────────────────────────────────
   A fixture of FIXED-WIDTH seats, so a law states a width rather than discovering one. Real
   toolbar children are icon-only controls whose width comes from the ladder; pinning it here
   is what lets a law say "at 260 exactly two fit" and mean it. */
const SEAT = 80;
const seats = ["alpha", "beta", "gamma"];
const Seat = ({ label }: { label: string }) => (
  <ToolbarButton
    iconOnly
    aria-label={label}
    style={{ inlineSize: `${SEAT}px`, minInlineSize: `${SEAT}px` }}
  >
    <svg viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="4" fill="currentColor" />
    </svg>
  </ToolbarButton>
);

/** The row inside a box of a stated width — the only way to vary "how much room is there"
    while the suite's viewport stays pinned. */
const Band = ({ width, children }: { width: number; children?: React.ReactNode }) => (
  <Box style={{ inlineSize: `${width}px` }}>
    <Toolbar>
      <ToolbarOverflow>
        {children ?? seats.map((label) => <Seat key={label} label={label} />)}
      </ToolbarOverflow>
    </Toolbar>
  </Box>
);

/* A CLUSTER THAT DRAWS NOTHING, and it has to be a COMPONENT rather than a literal `null`
   (2026-09-08, caught by this law's first run). `React.Children.toArray` STRIPS literal nulls,
   so a `{null}` child never reaches the seats at all and the fixture would be testing a row of
   two children that agrees with itself. The real case is a component that returns null — the
   docs' walk outside the reading order, its page actions on a route with no twin — which is an
   element at the seat's level and empty only once it has rendered. The two inputs give
   different answers, which is what makes this the one worth mounting. */
const Absent = () => null;

const overflowIn = (root: Element): HTMLElement => within(root, ".kui-toolbar-overflow");
const seatsIn = (root: Element): HTMLElement[] => [
  ...overflowIn(root).querySelectorAll<HTMLElement>(":scope > .kui-toolbar-overflow-seat"),
];
const triggerIn = (root: Element): HTMLElement | null =>
  overflowIn(root).querySelector<HTMLElement>('[aria-label="More"]');
/** A seat that is actually IN the row: rendered, and not the `:empty` stand-down. */
const drawn = (root: Element): HTMLElement[] =>
  seatsIn(root).filter((seat) => seat.getBoundingClientRect().width > 0);

describe("the overflow measures, because no breakpoint can answer this (§45)", () => {
  it("what fits stands in the row; what does not is in the menu instead", () => {
    const wide = mounted(<Band width={900} />, { theme: {} });
    expect(drawn(wide)).toHaveLength(seats.length);
    expect(triggerIn(wide), "everything fits, so there is nothing to open").toBeNull();

    const narrow = mounted(<Band width={200} />, { theme: {} });
    expect(drawn(narrow).length).toBeLessThan(seats.length);
    expect(triggerIn(narrow), "something was hidden, so there is a way to reach it").not.toBeNull();
  });

  it("and NOTHING runs off the end of the row — the defect this was built for", () => {
    // The screenshot that started it: eight controls in a 390px band, the last sliced in half at
    // the window's edge with no route to it. Read as paint, not as a count: every seat still in
    // the row ends inside the box, at every width, including the ones where a control was cut.
    for (const width of [900, 520, 360, 260, 200, 140]) {
      const root = mounted(<Band width={width} />, { theme: {} });
      const box = overflowIn(root).getBoundingClientRect();
      for (const seat of drawn(root)) {
        expect(
          Math.round(seat.getBoundingClientRect().right),
          `a seat runs past the row at ${width}px`,
        ).toBeLessThanOrEqual(Math.round(box.right) + 1);
      }
    }
  });

  it("the room it measures is the row's LEFTOVER, so hiding a control cannot change it", () => {
    // The anti-feedback property, and `flex-grow` is what carries it (toolbar.css). A box that
    // hugged its contents would shrink as it hid things, free room, show them again and hide
    // them once more — the measurement chasing its own effect. Read where the two spellings give
    // DIFFERENT answers: a row with a leading cluster, collapsed, where a content-hugging box
    // would sit narrow and a leftover-taking one still reaches the row's end.
    //
    // The first spelling of this law mounted the same width twice and compared the two, which
    // is a tautology, and its sabotage pass said so.
    const root = mounted(
      <Box style={{ inlineSize: "260px" }}>
        <Toolbar>
          <Flex className="lead">
            <ToolbarButton style={{ inlineSize: "60px", minInlineSize: "60px" }}>L</ToolbarButton>
          </Flex>
          <ToolbarOverflow>
            {seats.map((label) => <Seat key={label} label={label} />)}
          </ToolbarOverflow>
        </Toolbar>
      </Box>,
      { theme: {} },
    );
    expect(drawn(root).length, "the fixture must actually be collapsed").toBeLessThan(seats.length);
    const row = within(root, ".kui-toolbar").getBoundingClientRect();
    const box = overflowIn(root).getBoundingClientRect();
    const lead = within(root, ".lead").getBoundingClientRect();
    const gap = Number.parseFloat(computed(within(root, ".kui-toolbar"), "column-gap"));
    expect(
      Math.round(box.width),
      "it takes what the row has left, not what its contents want",
    ).toBe(Math.round(row.width - lead.width - gap));
    expect(Math.round(box.right)).toBe(Math.round(row.right));
  });

  it("gives the pointer back over its empty middle — it now spans a row that floats over the page", () => {
    // `.kui-toolbar > *` takes the pointer, and this child spans every pixel the row does not
    // use, so a floating band would hand back a full row of dead page. The row's own rule, one
    // level in.
    const root = mounted(<Band width={900} />, { theme: {} });
    const box = overflowIn(root).getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + 4, box.top + box.height / 2);
    expect(hit).not.toBe(overflowIn(root));
    expect(computed(overflowIn(root), "pointer-events")).toBe("none");
    for (const seat of drawn(root)) expect(computed(seat, "pointer-events")).toBe("auto");
  });
});

describe("a seat holds the index, so a cluster that draws nothing cannot shift the row (§45)", () => {
  it("a child rendering null keeps its place, and the widths stay on their own children", () => {
    // THE FIXTURE IS THE LAW. A band's clusters are conditional in real use — a walk with
    // nowhere to go next, a page with nothing to export — so the FIRST child rendering nothing
    // is the ordinary case, and it is the one input where reading `children[i]` directly and
    // reading the seat give different answers: without seats the second child's width is cached
    // under the first child's name and every later decision is made from the wrong number.
    const root = mounted(
      <Band width={900}>
        <Absent />
        <Seat label="beta" />
        <Seat label="gamma" />
      </Band>,
      { theme: {} },
    );
    const all = seatsIn(root);
    expect(all, "one seat per child, drawn or not — that is what holds the index").toHaveLength(3);
    expect(computed(all[0]!, "display"), "an empty seat leaves the layout entirely").toBe("none");
    expect(all[0]!.getBoundingClientRect().width).toBe(0);
    expect(all[1]!.querySelector('[aria-label="beta"]')).not.toBeNull();
    expect(all[2]!.querySelector('[aria-label="gamma"]')).not.toBeNull();
  });

  it("and an empty seat spends no gap either — it costs nothing at all", () => {
    // `display: none` rather than a zero width, because a zero-width flex item still takes a gap
    // on each side of itself. Read as the distance between the two seats that DID draw: it must
    // be one gap, not two.
    const root = mounted(
      <Band width={900}>
        <Absent />
        <Seat label="beta" />
        <Seat label="gamma" />
      </Band>,
      { theme: {} },
    );
    const [beta, gamma] = drawn(root);
    const gap = Number.parseFloat(computed(overflowIn(root), "column-gap"));
    expect(gap).toBeGreaterThan(0);
    expect(
      Math.round(gamma!.getBoundingClientRect().left - beta!.getBoundingClientRect().right),
      "the empty seat is not spending a gap of its own",
    ).toBe(Math.round(gap));
  });
});

describe("the measurement is bounded, and the bounds are what make it legal (§45)", () => {
  it("collapses and RESTORES on resize — which is the cached width proving it exists", () => {
    // The cache is the whole mechanism, not an optimisation: a hidden child has no measurable
    // width, so restoring it can only be decided from the number read while it was in the row.
    // A run with no cache cannot come back — it has nothing to come back from — so "widen it
    // again and everything returns" is the one observable that distinguishes the two.
    const root = mounted(<Band width={900} />, { theme: {} });
    const box = root as HTMLElement;
    expect(drawn(root)).toHaveLength(seats.length);

    box.style.inlineSize = "200px";
    return until(() => drawn(root).length < seats.length).then(async (collapsed) => {
      expect(collapsed, "a resize is what the observer is for").toBe(true);
      expect(triggerIn(root)).not.toBeNull();

      box.style.inlineSize = "900px";
      const restored = await until(() => drawn(root).length === seats.length);
      expect(restored, "a width read once, while the child was in the row, is what brings it back").toBe(true);
      expect(triggerIn(root), "nothing is hidden, so nothing offers to open it").toBeNull();
    });
  });

  /* THROWN AWAY, AND THE REASON IS RECORDED (2026-09-08). There was a law here asserting that
     the collapse is decided BEFORE the first paint — `useLayoutEffect` rather than `useEffect`,
     so no frame is ever drawn with the row overflowing. It could not fail: swapping the hook for
     `useEffect` left all 59 green, because `mounted()` drives React through `flushSync` and the
     passive effect has run by the time any assertion reads the DOM. A law that cannot tell the
     two hooks apart is not a law about which hook is used, and its two useful halves — that the
     row collapses, and that nothing overflows — are already asserted above by laws whose
     sabotage passes do fail. The hook still matters in a real browser; this harness simply
     cannot see it, which is worth saying once rather than leaving a green test implying it can. */
});

describe("in the menu a control is the same element, asked where it is (§45)", () => {
  /** Open what did not fit, the way a pointer does. */
  const openOverflow = async (root: Element) => {
    const trigger = triggerIn(root);
    expect(trigger, "nothing collapsed, so this fixture proves nothing").not.toBeNull();
    trigger!.click();
    await until(() => document.querySelector(".kui-menu-popup") !== null);
    const popup = document.querySelector<HTMLElement>(".kui-menu-popup");
    expect(popup, "the menu never opened").not.toBeNull();
    return popup!;
  };

  it("a ToolbarButton is a ROW whose words are the aria-label it was already carrying", async () => {
    // Nothing is written twice, and nothing is converted. An icon-only control in a band says
    // its name in `aria-label` because there is nowhere else to put it — which is exactly the
    // words a menu row wants — and its children are the artwork, which is exactly what `leading`
    // holds. Read as the rendered row: the label is the text, and the glyph is in the slot.
    const root = mounted(<Band width={140} />, { theme: {} });
    const popup = await openOverflow(root);
    const rows = [...popup.querySelectorAll<HTMLElement>(".kui-menu-item")];
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(seats, `a row says something no control in this band says`).toContain(row.textContent?.trim());
      expect(row.querySelector('[data-slot="leading"] svg'), "the control's own artwork").not.toBeNull();
    }
    // Every seat is in exactly one of the two places, and never in both.
    const inRow = drawn(root).map((s) => s.querySelector("[aria-label]")!.getAttribute("aria-label"));
    const inMenu = rows.map((r) => r.textContent?.trim());
    expect([...inRow, ...inMenu].sort()).toEqual([...seats].sort());
  });

  it("a ToolbarGroup is a menu GROUP, not a capsule — the capsule is how a ROW says it", async () => {
    // The fact is the same in both rooms: these controls belong together. Everything the capsule
    // IS — the well, the height ladder, the hosted inset — is how that fact is drawn in a row,
    // and none of it means anything in a list of rows.
    const root = mounted(
      <Band width={140}>
        <Seat label="alpha" />
        <ToolbarGroup>
          <Seat label="beta" />
          <Seat label="gamma" />
        </ToolbarGroup>
      </Band>,
      { theme: {} },
    );
    const popup = await openOverflow(root);
    const group = popup.querySelector<HTMLElement>('[role="group"]');
    expect(group, "the group came across as a group").not.toBeNull();
    expect(group!.classList.contains("kui-toolbar-group"), "and left the capsule in the row").toBe(false);
    expect(computed(group!, "background-color"), "a menu group paints nothing of its own").toBe("rgba(0, 0, 0, 0)");
    expect(group!.querySelectorAll(".kui-menu-item")).toHaveLength(2);
  });
});
