/**
 * Theme's laws, mounted for real (§5, §6, §12).
 *
 * Nesting is the whole design — a denser toolbar or an airier hero is a nested Theme, not a
 * per-component prop — and nesting is exactly what a string test cannot check, because the
 * question is which declaration an element three levels down actually resolves.
 */
import { describe, expect, it } from "vitest";

import { Box } from "../components/box/box.tsx";
import { Card } from "../components/card/card.tsx";
import { Checkbox } from "../components/checkbox/checkbox.tsx";
import { TextField } from "../components/text-field/text-field.tsx";
import { cdp } from "vitest/browser";

import { APPEARANCES, colorOn, computed, mounted, render } from "../test/browser.tsx";
import tokensCss from "../tokens/tokens.css?raw";
import { density, radiusLevels } from "../tokens/config.ts";
import { DEPTHS, Theme, themeAxes, themeDefaults, useMaterial } from "./theme.tsx";
import { Button } from "../components/button/button.tsx";

/** Reads through real properties: a custom property hands back its unresolved token stream. */
const probe = <div id="probe" style={{ height: "var(--control-height-2)", borderRadius: "var(--radius-control-2)" }} />;

describe("the axes render as attributes (§5)", () => {
  it("each prop maps to one data attribute, so the DOM shows the decisions", () => {
    const el = render(<Theme density="compact" radius="large" />);
    expect(el.getAttribute("data-density")).toBe("compact");
    expect(el.getAttribute("data-radius")).toBe("large");
  });

  it("the look axis is DELETED — nothing stamps either attribute, and the split's cell is the only state (§19)", () => {
    // controlLook died 2026-08-19, surfaceLook 2026-08-20 (both Kushagra). The 2026-08-10
    // split's cell — a plain card holding dressed inputs — is now the ONLY state: fields and
    // marks wear the dress unconditionally and a card rests on the seal. Two assertions
    // carry it: neither dead attribute ever renders, and the cell itself still exists.
    const el = render(
      <Theme>
        <Card>
          <TextField />
        </Card>
      </Theme>,
    );
    expect(el.hasAttribute("data-control-look"), "the deleted axis re-stamped").toBe(false);
    expect(el.hasAttribute("data-surface-look"), "the deleted axis re-stamped").toBe(false);
    expect(
      computed(el.querySelector(".kui-field")!, "background-color"),
      "a field on a plain card is the same colour as the card",
    ).not.toBe(computed(el.querySelector(".kui-surface")!, "background-color"));
  });

  describe("a dressed component's edge answers contrast=high (§7, §19)", () => {
    // THE law for the reachability guarantee, and it is deliberately an OUTCOME law mounted in
    // a browser rather than a check on which step the config picked.
    //
    // The first version of this guarantee was checked by asserting the chosen edge step was a
    // member of `contrastHighBands.border`. That law passed and the guarantee was false:
    // the band indexes the LADDER (0-based) while token names are 1-based, so
    // contrastHighBands.border = [5, 6, 7] emits as --neutral-6/7/8 and the --neutral-5 edges
    // picked for the surface and field families were never re-declared under high contrast at
    // all. The law compared 1-indexed names to 0-indexed positions and agreed with the bug —
    // the exact defect class the 2026-08-06 look audit was about, committed while fixing it.
    //
    // Reading the computed edge off a real component in both contrast states cannot be fooled
    // that way: it does not care whether the answer arrives by band membership, by the
    // stand-down arm, or by something not invented yet.
    // The surface family's resting edge is deliberately ABSENT since the lab port (light is
    // the edge), so its case asserts the edge APPEARS under high contrast; the dressed
    // families rest on a live soft edge, so theirs assert it MOVES. Both shapes end at the
    // same place: a painted, tone-strength boundary when one is asked for.
    const CASES = [
      { name: "surface", ui: <Card>Body</Card>, select: ".kui-surface", restsPainted: false },
      { name: "field", ui: <TextField />, select: ".kui-field", restsPainted: true },
      { name: "mark", ui: <Checkbox />, select: ".kui-checkbox", restsPainted: true },
    ] as const;

    for (const appearance of APPEARANCES) {
      for (const { name, ui, select, restsPainted } of CASES) {
        it(`${appearance}/${name}: the edge answers when high contrast is asked for`, () => {
          const edge = (contrast: "normal" | "high") =>
            computed(mounted(ui, { theme: { appearance, contrast }, select }), "border-top-color");
          const normal = edge("normal");
          const high = edge("high");
          if (restsPainted) {
            expect(normal, "a dressed edge that is not painted cannot be strengthened").not.toBe(
              "rgba(0, 0, 0, 0)",
            );
          } else {
            expect(normal, "the pane rests borderless — light is the edge").toBe("rgba(0, 0, 0, 0)");
          }
          expect(high, `${name}'s edge is inert under contrast="high"`).not.toBe(normal);
          expect(high, "high contrast must paint a boundary, not remove one").not.toBe(
            "rgba(0, 0, 0, 0)",
          );
        });
      }
    }

    // …AND THE SAME THING ONE ELEMENT APART, which is the arrangement every law above is
    // blind to (2026-08-20, Kushagra, by eye: a dark card looked identical at both contrasts
    // while the glass beside it changed).
    //
    // Every law here co-locates the two axes on one Theme, because that is what `mounted`
    // builds. The SUPPORTED path does not: the pre-paint script stamps appearance and
    // contrast on `<html>` (§5's co-location requirement is about those two, and it holds
    // there), and then the app renders `<Theme appearance="dark">` for a section. That Theme
    // re-declares the whole standard palette NEARER to the component than `<html>` is, and a
    // custom property resolves by proximity — so contrast="high" reached NOTHING below it.
    // Measured before the fix: --control-edge, --field-edge, --neutral-6 and --color-track
    // all equal their standard values, and the card painted no boundary at all.
    //
    // The law drives the DOM directly rather than through `mounted`, because the shape it is
    // about is precisely the one the harness cannot express.
    for (const { name, select } of CASES) {
      it(`${name}: high contrast survives a nested appearance Theme — the supported page shape`, () => {
        const root = document.documentElement;
        const before = { a: root.dataset.appearance, c: root.dataset.contrast };
        try {
          root.dataset.appearance = "dark";
          const edge = (contrast: string) => {
            root.dataset.contrast = contrast;
            const host = render(
              <Theme appearance="dark">
                <Card>Body</Card>
                <TextField />
                <Checkbox />
              </Theme>,
            );
            return computed(host.querySelector<HTMLElement>(select)!, "border-top-color");
          };
          const normal = edge("normal");
          const high = edge("high");
          expect(high, `${name} is deaf to contrast="high" one element away`).not.toBe(normal);
          expect(high, "high contrast must paint a boundary").not.toBe("rgba(0, 0, 0, 0)");

          // And the escape still escapes: a nested Theme that explicitly asks for `normal`
          // inside a high-contrast document keeps the standard dress. Without this the fix
          // would be a rule that cannot be turned off, which is the opposite failure.
          root.dataset.contrast = "high";
          const optOut = computed(
            render(
              <Theme appearance="dark" contrast="normal">
                <Card>Body</Card>
                <TextField />
                <Checkbox />
              </Theme>,
            ).querySelector<HTMLElement>(select)!,
            "border-top-color",
          );
          expect(optOut, `${name}: an explicit contrast="normal" was overridden`).toBe(normal);
        } finally {
          if (before.a === undefined) delete root.dataset.appearance;
          else root.dataset.appearance = before.a;
          if (before.c === undefined) delete root.dataset.contrast;
          else root.dataset.contrast = before.c;
        }
      });
    }
  });

  it("contrast is stamped only when it was chosen, so prefers-contrast can still reach it (§7)", () => {
    // The generated platform-signal guard is `:not([data-contrast="normal"])`. An unconfigured
    // Theme that stamped `normal` anyway would exclude itself from the media query it is
    // supposed to receive — which is exactly what dark mode did until 2026-08-03.
    expect(render(<Theme density="compact" />).hasAttribute("data-contrast")).toBe(false);
    expect(render(<Theme contrast="normal" />).getAttribute("data-contrast")).toBe("normal");
    expect(render(<Theme contrast="high" />).getAttribute("data-contrast")).toBe("high");
  });

  it("render puts the theme on an element that already exists, costing no extra DOM", () => {
    const el = render(
      <Theme density="compact" render={<section className="hero" />}>
        <span />
      </Theme>,
    );
    expect(el.tagName).toBe("SECTION");
    expect(el.className.split(" ").sort()).toEqual(["hero", "kui-theme"]);
    expect(el.getAttribute("data-density")).toBe("compact");
    expect(el.querySelector("span")).not.toBeNull();
  });
});

describe("a nested Theme inherits what it was not given (§5)", () => {
  it("an inner Theme setting one axis keeps the outer value of the others", () => {
    const el = render(
      <Theme density="compact" radius="large">
        <Theme contrast="high" />
      </Theme>,
    );
    const inner = el.firstElementChild!;
    expect(inner.getAttribute("data-density")).toBe("compact");
    expect(inner.getAttribute("data-radius")).toBe("large");
    expect(inner.getAttribute("data-contrast")).toBe("high");
  });

  it("and the inherited pair still reaches the tokens, which is the part that was wrong", () => {
    // The (level x density) cell, exercised through the component rather than through
    // hand-written attributes. Before 2026-08-02 the radius level reached control radii not at
    // all, because `--radius-control-2: var(--radius-2)` had already resolved at :root.
    const found = mounted(<Theme contrast="high">{probe}</Theme>, {
      theme: { density: "compact", radius: "large" },
      select: "#probe",
    });
    expect(computed(found, "height")).toBe(`${density.compact.height[1]}px`);
    expect(computed(found, "border-top-left-radius")).toBe(
      `${radiusLevels.large.steps[density.compact.radius[1]!]}px`,
    );
  });

  it("a tiered Box directly under a Theme has a slot to read (§2, decided 2026-08-02)", () => {
    // The ancestor-container edge, closed: Theme's element is a query container, so the
    // outermost Box in an app measures its Theme instead of silently sitting at base values.
    const wide = mounted(<Box p={{ initial: "1", md: "6" }} id="probe" />, {
      theme: { style: { width: "900px" } },
    });
    expect(computed(wide, "padding-top")).toBe("24px");

    const narrow = mounted(<Box p={{ initial: "1", md: "6" }} id="probe" />, {
      theme: { style: { width: "300px" } },
    });
    expect(computed(narrow, "padding-top")).toBe("2px");
  });

  it("pinning pointer=coarse renders the coarse geometry (§16)", () => {
    const el = mounted(probe, { theme: { pointer: "coarse" } });
    // Coarse default size 2 anchors at the touch floor by design.
    expect(computed(el, "height")).toBe("44px");
  });

  it("a nested fine escape returns to the fine geometry instead of inheriting coarse", () => {
    const el = mounted(<Theme pointer="fine">{probe}</Theme>, {
      theme: { pointer: "coarse" },
      select: "#probe",
    });
    expect(computed(el, "height")).toBe("32px");
  });

  it("pointer composes with density and radius through the cells (§16)", () => {
    const found = mounted(probe, {
      theme: { pointer: "coarse", density: "compact", radius: "large" },
    });
    expect(computed(found, "height")).toBe("38px");
    // compact-coarse size 2 picks step 3; large prices step 3 at 12px.
    expect(computed(found, "border-top-left-radius")).toBe("12px");
  });

  it("an inner appearance overrides an outer one, so a forced-dark section works", () => {
    const dark = mounted(<Theme appearance="dark">{probe}</Theme>, {
      theme: { appearance: "light" },
      select: "#probe",
    });
    const light = mounted(probe, { theme: { appearance: "light" } });
    expect(computed(dark, "--neutral-1")).not.toBe(
      computed(light, "--neutral-1"),
    );
  });

  it("appearance also tells the UA which world it is painting, both directions (§5)", () => {
    // Scrollbar tracks and a consumer's native <input> are painted by the UA, not by the token
    // layer, so they stayed light inside a dark Theme until color-scheme shipped.
    const dark = mounted(probe, { theme: { appearance: "dark" } });
    expect(computed(dark, "color-scheme")).toBe("dark");
    const nested = mounted(<Theme appearance="light">{probe}</Theme>, {
      theme: { appearance: "dark" },
      select: "#probe",
    });
    expect(computed(nested, "color-scheme")).toBe("light");
  });

  it("and the mirror holds: a light section inside a dark app is not stuck dark (§5)", () => {
    // Light lived only at :root until 2026-08-03, so `light` and `inherit` rendered
    // identically inside a dark tree — an escape that does nothing is not an escape.
    const nested = mounted(<Theme appearance="light">{probe}</Theme>, {
      theme: { appearance: "dark" },
      select: "#probe",
    });
    const plain = mounted(probe, { theme: { appearance: "light" } });
    expect(computed(nested, "--neutral-1")).toBe(
      computed(plain, "--neutral-1"),
    );
  });
});

describe('contrast="high" reaches the tokens, in both appearances (§7)', () => {
  // Asserting the attribute is one indirection short of the thing that can be wrong: light
  // stamped data-contrast="high" correctly for months while resolving no rule at all, because
  // the generated block was :root-scoped and :root only ever matches <html>.
  for (const appearance of APPEARANCES) {
    it(`shifts the value bands under appearance="${appearance}"`, () => {
      const high = mounted(probe, { theme: { appearance, contrast: "high" } });
      const normal = mounted(probe, { theme: { appearance, contrast: "normal" } });
      for (const token of ["--neutral-11", "--accent-11", "--neutral-label"]) {
        expect(computed(high, token)).not.toBe(
          computed(normal, token),
        );
      }
    });
  }
});

describe("the light palette reaches all four of its cases from ONE rule (§5, §7, 2026-08-26)", () => {
  // The palette used to ship twice — a full copy in `:root` and a byte-identical one in
  // `[data-appearance="light"]` — and it is now one rule carrying both selectors. The two
  // selectors exist for two different reasons, and this law is the proof that grouping them
  // kept both: `:root` is the UN-THEMED document (it only ever matches <html>, so it cannot
  // serve a nested light Theme), and `[data-appearance="light"]` is the STATED light (which
  // is what a light region inside a dark document needs, and what `:root` can never be).
  //
  // Read EXHAUSTIVELY, off the rule itself, rather than through a handful of witnesses: the
  // failure this guards against is "one case lost some of the palette", and a sampled law
  // answers that with whichever names the sampler happened to like. The names come from the
  // CSSOM and the reader is LOUD when the rule is missing, so a rename fails the law instead
  // of blinding it.
  const tokenNames = (el: Element): string[] => {
    const names = [...(getComputedStyle(el) as unknown as Iterable<string>)].filter(
      // The PUBLIC contract (§13). `--kui-*` is private plumbing, most of it registered
      // `inherits: false`, so it answers about the probe element rather than about the scope.
      (n) => n.startsWith("--") && !n.startsWith("--kui-"),
    );
    if (names.length < 400) throw new Error(`only ${names.length} tokens resolve here — the law would assert nothing`);
    return names;
  };
  const readAll = (el: Element, names: string[]) => {
    const s = getComputedStyle(el);
    return names.map((n) => `${n}: ${s.getPropertyValue(n).trim()}`);
  };
  /** The roles that INDIRECT (`--color-surface: var(--neutral-1)`) read identically in both
      appearances as raw token streams, so the resolved arm is what tells light from dark. */
  const resolved = (el: Element) =>
    ["--color-surface", "--color-text", "--color-page", "--dress-field-fill", "--tone-solid"].map(
      (n) => `${n}: ${colorOn(el, `var(${n})`)}`,
    );

  it("un-themed, stated-light, light-inside-dark and OS-dark all resolve the identical palette", async () => {
    expect(
      document.documentElement.hasAttribute("data-appearance"),
      "a previous law left <html> stamped, so `un-themed` is not un-themed",
    ).toBe(false);

    // (1) THE UN-THEMED DOCUMENT — no Theme anywhere, no stamp on <html>. This is the case
    // `:root` exists for, and the only one it can serve. Mounted first because `render()` is
    // what installs the sheets the CSSOM walk below reads.
    const bare = render(<div />);
    const names = tokenNames(bare);
    const expectedRaw = readAll(bare, names);
    const expectedResolved = resolved(bare);
    expect(computed(bare, "color-scheme")).toBe("light");

    // (2) A STATED LIGHT THEME — the default path: `themeDefaults.appearance` is "light", so
    // every bare <Theme> in the library lands here rather than on :root.
    const stated = render(
      <Theme appearance="light">
        <div />
      </Theme>,
    );
    expect(readAll(stated, names), "a stated light Theme lost part of the palette").toEqual(expectedRaw);
    expect(resolved(stated)).toEqual(expectedResolved);

    // (3) LIGHT NESTED INSIDE A DARK DOCUMENT — the case `:root` cannot reach, because Theme
    // renders a div. Without the light selector this subtree INHERITS dark, which is what
    // "an escape that does nothing is not an escape" means here.
    document.documentElement.setAttribute("data-appearance", "dark");
    try {
      const escaped = render(
        <Theme appearance="light">
          <div />
        </Theme>,
      );
      expect(readAll(escaped, names), "a light Theme inside a dark document inherited dark").toEqual(expectedRaw);
      expect(resolved(escaped)).toEqual(expectedResolved);

      // THE CALIBRATION ARM, and the reason cases 1-3 agreeing means anything: an unescaped
      // element under the same dark document must NOT agree. Without it "all four resolve the
      // same" is satisfied by a palette that never changes at all.
      const inDark = render(<div />);
      expect(readAll(inDark, names)).not.toEqual(expectedRaw);
      expect(resolved(inDark)).not.toEqual(expectedResolved);
      expect(computed(inDark, "color-scheme")).toBe("dark");
    } finally {
      document.documentElement.removeAttribute("data-appearance");
    }

    // (4) THE OS ASKS FOR DARK AND NOBODY STAMPED. The package answers the signal in JS (the
    // app's pre-paint script stamps data-appearance); it emits no `prefers-color-scheme`
    // block, so the un-themed document stays light — stated as a MEASUREMENT rather than an
    // argument, because "the stylesheet has no media branch" is exactly the kind of claim
    // that is true until someone adds one.
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value: "dark" }],
    });
    try {
      expect(matchMedia("(prefers-color-scheme: dark)").matches, "the emulation did not take").toBe(true);
      const osDark = render(<div />);
      expect(readAll(osDark, names), "the stylesheet grew a prefers-color-scheme branch").toEqual(expectedRaw);
      expect(resolved(osDark)).toEqual(expectedResolved);
    } finally {
      await cdp().send("Emulation.setEmulatedMedia", { features: [] });
    }
  });
});

describe("the axis table is the one home, and the defaults live inside it (§5, §12, 2026-08-16)", () => {
  // `themeAxes` and `themeDefaults` are two shapes describing one set of facts, and the way
  // that pair rots is a default drifting outside its own axis's list — reachable by nothing,
  // failing nowhere, because every law that walks the axis walks the LIST and every law that
  // mounts a Theme takes the DEFAULT. Asserted in both directions so neither table can grow a
  // key the other lacks.
  it("every axis has a default, every default is a member, and neither table has a spare key", () => {
    expect(Object.keys(themeAxes).sort()).toEqual(Object.keys(themeDefaults).sort());
    for (const [axis, values] of Object.entries(themeAxes)) {
      const value = themeDefaults[axis as keyof typeof themeDefaults];
      expect(values as readonly string[], `${axis}: the default is not one of its own values`).toContain(value);
      // A one-value axis is not an axis; a zero-value one is a typo that types cannot see.
      expect((values as readonly string[]).length, `${axis} has fewer than two values`).toBeGreaterThan(1);
      expect(new Set(values as readonly string[]).size, `${axis} lists a value twice`).toBe(
        (values as readonly string[]).length,
      );
    }
  });

  it("DEPTHS IS themeAxes.depth — the same array, not a second list that agrees", () => {
    // Eight law files import DEPTHS by name, so it survives as an export. What must not
    // survive is it becoming a copy: two lists that agree today are the exact shape this whole
    // change deleted. Identity, not equality — `toEqual` would pass on a duplicate.
    expect(DEPTHS).toBe(themeAxes.depth);
  });

  it("a stamped axis writes its own value, and the two non-values stamp nothing", () => {
    // Narrow on purpose. The first version of this law looped every axis asserting the
    // attribute came back equal, which CANNOT FAIL — `data-depth` is written verbatim, so a
    // value nothing implements stamps itself just as happily as one that does. It passed a
    // sabotage that added a third depth rung, which is the whole class of bug the table
    // exists to catch. Whether a value is IMPLEMENTED is a question about the emitted
    // stylesheet, so it moved to a node law in system/recipes.test.ts where the sheets can be
    // read; what is left here is the one thing a mount can actually settle: the two values
    // that are instructions rather than values must stamp NOTHING, and `contrast` must stay
    // unstamped until someone chooses it (the `prefers-contrast` guard depends on it).
    expect(render(<Theme appearance="inherit">x</Theme>).getAttribute("data-appearance")).toBeNull();
    expect(render(<Theme>x</Theme>).getAttribute("data-contrast")).toBeNull();
    expect(render(<Theme contrast="normal">x</Theme>).getAttribute("data-contrast")).toBe("normal");
    // `auto` is the pointer axis's own instruction and DOES stamp, because the media query
    // it defers to is written against that attribute — the asymmetry with `inherit` is real
    // and worth pinning, since making them agree would break one of them.
    expect(render(<Theme pointer="auto">x</Theme>).getAttribute("data-pointer")).toBe("auto");
  });
});

describe("only the outermost Theme is a query container (§2, narrowed 2026-08-16)", () => {
  /* Earned by a shipped regression. `.kui-theme` carried `container-type: inline-size`
     unconditionally, with the collapse written down beside it as an accepted caveat — and it
     WAS acceptable while a nested Theme only ever re-scoped an axis on a region that already
     had a width. `material` became a Theme property on 2026-08-16, which made
     <Theme material="thin"> the ordinary way to put one pane behind glass; every glass
     specimen in the playground then rendered zero pixels wide, stacked on its neighbours,
     from the commit that shipped it. Nothing failed: 1300 laws passed on both sides of the
     fix, because not one of them read a nested Theme's width or its containment.

     The measurement is the WIDTH, not `container-type`. A law reading the property would be
     the 2026-08-03 lesson again — one indirection short of the thing that was actually
     wrong, which was a box with nothing in it. */
  const inRow = (child: React.ReactNode) =>
    render(<Theme><div style={{ display: "flex", width: "600px" }}>{child}</div></Theme>);

  it("a nested Theme in a flex row is as wide as its content, not 0px", () => {
    const row = inRow(<Theme material="thin"><Card size="2">Glass</Card></Theme>);
    const nested = row.querySelector<HTMLElement>(".kui-theme");
    if (!nested) throw new Error("the nested Theme never mounted");
    expect(nested.getBoundingClientRect().width, "the nested Theme collapsed").toBeGreaterThan(40);
    expect(computed(nested, "container-type")).toBe("normal");

    // The negative control, or the law passes for the wrong reason on an empty row: a Box
    // that DID opt in collapses in the same slot, so the row itself is a shrink-wrapping one.
    const opted = inRow(<Box container>Glass</Box>).querySelector<HTMLElement>("[data-container]");
    expect(opted!.getBoundingClientRect().width).toBe(0);
  });

  it("the root Theme is still the container a tier falls back to", () => {
    // The floor §2 asks for: narrowing containment must not leave a tier with nothing to
    // read. Falsified by narrowing the selector to exclude the root as well.
    const root = render(
      <Theme style={{ width: "900px" }}>
        <Box p={{ initial: "1", md: "9" }} />
        <Box p="9" />
      </Theme>,
    );
    expect(computed(root, "container-type")).toBe("inline-size");
    const [tiered, reference] = [...root.querySelectorAll<HTMLElement>(".kui-box")];
    // Against a mounted reference rather than a token string: `--layout-space-9` hands back
    // `calc(48px * 1)` unresolved, and comparing an unresolved stream to a resolved length is
    // how a law ends up asserting the spelling instead of the width.
    expect(computed(tiered!, "padding-top")).toBe(computed(reference!, "padding-top"));
    expect(computed(tiered!, "padding-top")).not.toBe("0px");
  });

  it("a nested Theme still carries every axis it was given — containment was the only loss", () => {
    // The narrowing is about MEASUREMENT and must not touch what a nested Theme is for.
    // `backdrop` (lab port 2026-08-17): a Card under a glass theme resolves SOLID by
    // default — glass is selective, and a card is the page's calm ground unless the call
    // site states the over-content placement. A plain Card here would stamp nothing and
    // this law would be reading the selectivity rule, not whether the axis crossed.
    const row = inRow(
      <Theme density="compact" radius="none" material="thick">
        <Card size="2" backdrop>x</Card>
      </Theme>,
    );
    const nested = row.querySelector<HTMLElement>(".kui-theme")!;
    expect(nested.getAttribute("data-density")).toBe("compact");
    expect(nested.getAttribute("data-radius")).toBe("none");
    // `material` is the one axis with no attribute on the Theme itself: it travels by React
    // context and each component stamps its own, so all 28 selectors stay element-keyed
    // (2026-08-16). Read where it actually lands, or this asserts the wrong element.
    expect(row.querySelector(".kui-surface")?.getAttribute("data-material")).toBe("thick");
  });
});

describe("a solid surface HOSTS glass — the pane scopes the region, never the author (§10, 2026-08-19)", () => {
  // Kushagra, closing the 2026-08-18 audit's headline: "the whole point of a solid surface
  // is to be able to host glass." The old solid-pane arm returned `solid` unconditionally,
  // which silently vetoed the `backdrop` prop, the `<Box backdrop>` region and the public
  // useMaterial({backdrop:true}) alike — every documented placement statement was
  // unexpressible inside any Card, and since panes default solid, that was the ordinary
  // case. Now the pane RESETS the ambient region (its face is the ground its members stand
  // on) and an explicit statement made INSIDE it resolves the theme's material.

  it("an explicit region inside a solid pane expresses the theme's material", () => {
    const host = render(
      <Theme material="thin">
        <Card>
          <Box backdrop>
            <Button>Zoom</Button>
          </Box>
        </Card>
      </Theme>,
    );
    const button = host.querySelector("button")!;
    expect(button.dataset.material, "the region was swallowed by the pane").toBe("thin");
    expect(computed(button, "backdrop-filter")).not.toBe("none");
  });

  it("but a region marked OUTSIDE the pane stops at its edge — calm ground by default", () => {
    // The pane here must actually BE solid to test the reset — a bare Card inside a marked
    // region correctly expresses glass itself (placement is a fact about a place), so the
    // mount pins it solid with its own prop. Without the reset, the button would read the
    // stale outer region and go glass on the solid card's calm face.
    const host = render(
      <Theme material="thin">
        <Box backdrop>
          <Card backdrop={false}>
            <Button>Label</Button>
          </Card>
        </Box>
      </Theme>,
    );
    expect(host.querySelector(".kui-surface")!.getAttribute("data-material"), "the pinned card must be solid").toBeNull();
    const button = host.querySelector("button")!;
    expect(button.dataset.material, "the outer region leaked through the pane").toBeUndefined();
    expect(computed(button, "backdrop-filter")).toBe("none");
  });

  it("the public hook's own argument wins inside a pane too", () => {
    function Probe() {
      return <div data-probe data-material={useMaterial({ backdrop: true })} />;
    }
    const host = render(
      <Theme material="regular">
        <Card>
          <Probe />
        </Card>
      </Theme>,
    );
    expect(host.querySelector<HTMLElement>("[data-probe]")!.dataset.material).toBe("regular");
  });

  it("a nested Theme inside a GLASS pane resolves solid — the reset closed the glass-on-glass escape", () => {
    // Theme resets the pane mark for portals; before the pane also reset the REGION, an
    // in-flow nested Theme inside a glass card re-opened the stale outer region and put
    // full glass on glass — double blur, double readback (audit 2026-08-18). The member
    // must re-state its own placement to get glass back.
    const host = render(
      <Theme material="thin">
        <Box backdrop>
          <Card backdrop>
            <Theme>
              <Button>Label</Button>
            </Theme>
          </Card>
        </Box>
      </Theme>,
    );
    const button = host.querySelector("button")!;
    expect(button.dataset.material, "glass-on-glass through the nested-Theme escape").toBeUndefined();
    // The control case that must keep working: WITHOUT the nested Theme, the same member is
    // the pane's on-glass content — proof the mount can see the scope at all.
    const control = render(
      <Theme material="thin">
        <Box backdrop>
          <Card backdrop>
            <Button>Label</Button>
          </Card>
        </Box>
      </Theme>,
    );
    expect(control.querySelector("button")!.dataset.material).toBe("on-glass");
  });
});


describe('contrast="high" needs an appearance beside it, and says so (§7)', () => {
  /**
   * MEASURED FIRST, and the measurement is the finding (2026-08-26, ultracode audit).
   *
   * Under `<html data-appearance="dark">` — the documented dark-SSR shape, and what
   * `apps/docs/app/layout.tsx` renders — a `<Theme appearance="inherit" contrast="high">` stamps
   * `data-contrast="high"` with NO `data-appearance`, because `inherit` writes no attribute. Every
   * emitted high-contrast token arm needs the appearance on the element, on `:root`, or on a
   * DESCENDANT; here it is on an ANCESTOR. Measured, `normal` against `high` on that shape:
   * `--neutral-6` `color(display-p3 0.2111 0.2086 0.2236)` both times, and a TextField's painted
   * border `color(srgb 0.933333 0.933333 1 / 0.065)` both times. The prop is a silent no-op.
   *
   * The palette repair is an emitted-CSS change (`tokens/generate.ts` — an arm for an ANCESTOR
   * appearance) and is NOT in this commit. What is in it is the thing §20 does for its own two
   * unsurvivable placements: the mechanism is right, and now something says so when it is absent.
   * These two laws are the "two implementations owe a law that they AGREE" clause — one drives the
   * page and reads the warning, the other reads the emitted selectors, so the day the CSS gains
   * the missing arm the second law fails and names the warning to delete.
   */
  const withDocumentAppearance = <T,>(mode: string, run: () => T): T => {
    const root = document.documentElement;
    const before = { a: root.dataset.appearance, c: root.dataset.contrast };
    try {
      root.dataset.appearance = mode;
      delete root.dataset.contrast;
      return run();
    } finally {
      if (before.a === undefined) delete root.dataset.appearance;
      else root.dataset.appearance = before.a;
      if (before.c === undefined) delete root.dataset.contrast;
      else root.dataset.contrast = before.c;
    }
  };

  /** Collects console.warn for one mount, and restores the real one whatever happens. */
  const warningsWhile = (run: () => void): string[] => {
    const said: string[] = [];
    const real = console.warn;
    console.warn = (...args: unknown[]) => said.push(args.join(" "));
    try {
      run();
    } finally {
      console.warn = real;
    }
    return said;
  };

  it("the split pair warns, and every shape that actually works stays quiet", () => {
    const contrastWarnings = (ui: React.ReactElement) =>
      warningsWhile(() => render(ui)).filter((line) => line.includes("high-contrast palette selects nothing"));

    // THE DEFECT: appearance inherited from <html>, contrast asked for here.
    expect(
      withDocumentAppearance("dark", () =>
        contrastWarnings(
          <Theme appearance="inherit" contrast="high">
            <TextField />
          </Theme>,
        ),
      ),
      "a Theme whose contrast reaches nothing said nothing about it",
    ).toHaveLength(1);

    // AND THE NEGATIVE CONTROLS, which are what stop this being a warning that cries wolf.
    // Each is a shape the emitted CSS genuinely serves, so a warning here would be a false
    // alarm — and without them the guard could be "warn whenever contrast is high" and pass.
    expect(
      contrastWarnings(
        <Theme appearance="dark" contrast="high">
          <TextField />
        </Theme>,
      ),
      "the co-located pair is the ordinary working shape",
    ).toEqual([]);
    expect(
      withDocumentAppearance("dark", () =>
        contrastWarnings(
          // `appearance="inherit"` on the OUTER one is load-bearing (caught by this law's own
          // sabotage run): without it the outer Theme resolves `light` from `themeDefaults` and
          // stamps its own appearance, so the guard returns on the co-location check and the
          // descendant arm is never reached — a fixture that cannot tell the two apart.
          <Theme appearance="inherit" contrast="high">
            <Theme appearance="dark">
              <TextField />
            </Theme>
          </Theme>,
        ),
      ),
      "the descendant-appearance arm works (added 2026-08-20) and must not be warned about",
    ).toEqual([]);
    expect(
      withDocumentAppearance("dark", () =>
        contrastWarnings(
          <Theme appearance="inherit" contrast="normal">
            <TextField />
          </Theme>,
        ),
      ),
      "asking for `normal` is an opt-out, not a broken high-contrast scope",
    ).toEqual([]);
  });

  it("no emitted arm matches a bare data-contrast — which is WHY the warning exists", () => {
    /**
     * The agreement half. `warnOnSplitContrast` encodes a fact about the stylesheet, and a
     * warning that outlives its fact is noise — so the fact is read here rather than trusted.
     *
     * Every selector group that opens a high-contrast TOKEN block must demand `data-appearance`
     * somewhere: on the element, on `:root` (which is `<html>`, where the appearance lives on the
     * un-themed path), or on a descendant. The three `[data-contrast="high"] .kui-row…` rules are
     * not token blocks and legitimately need only an ancestor's contrast — they are excluded by
     * reading what they select, not by name.
     */
    // Selector groups are read by walking to each `{` from the previous brace, so a group split
    // across lines is one group — a line-anchored regex was this law's first spelling and its own
    // sabotage caught it: adding the arm on a line of its own left the scanner reading the line
    // that happened to carry the brace, and the law passed over the very shape it exists to see.
    const css = tokensCss.replace(/\/\*[\s\S]*?\*\//g, " ");
    const groups: string[] = [];
    for (let open = css.indexOf("{"); open !== -1; open = css.indexOf("{", open + 1)) {
      const start = Math.max(css.lastIndexOf("}", open), css.lastIndexOf("{", open - 1)) + 1;
      const selector = css.slice(start, open).trim();
      if (selector.includes("[data-contrast")) groups.push(selector);
    }
    expect(groups.length, "the scanner found no high-contrast selectors at all").toBeGreaterThan(2);

    const tokenBlocks = groups.filter((g) => !g.includes(".kui-"));
    expect(tokenBlocks.length, "the scanner found no TOKEN blocks — tokens.css' shape moved").toBeGreaterThan(1);

    /**
     * THE SUBJECT is what matters, not whether the arm mentions an appearance ANYWHERE — this
     * law's second spelling read the whole arm and passed its own sabotage, because the arm that
     * would close the hole (`[data-appearance="dark"] [data-contrast="high"]`) of course mentions
     * one: on the ANCESTOR. Declarations land on the rightmost compound, so the question is
     * whether THAT element carries the appearance, or is `:root` (the un-themed document, where
     * `<html>` carries both).
     */
    const subject = (arm: string) => arm.trim().split(/\s+/).pop() ?? "";
    const bare = tokenBlocks.flatMap((group) =>
      group
        .split(",")
        .map(subject)
        .filter((s) => s.includes("[data-contrast") && !s.includes("[data-appearance") && !s.startsWith(":root")),
    );
    expect(
      bare,
      "an emitted arm now reaches an element carrying data-contrast alone. If that arm pairs the " +
        "contrast with an ANCESTOR appearance, the appearance=\"inherit\" hole is closed — delete " +
        "`warnOnSplitContrast` in theme.tsx and the law above it, and amend the `contrast` JSDoc.",
    ).toEqual([]);
  });
});
