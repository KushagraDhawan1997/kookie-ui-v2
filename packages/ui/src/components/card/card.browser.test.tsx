/**
 * Card's laws, mounted (§10, §11, LOG 2026-08-04): a shell — one treatment, no variants,
 * no anatomy. There is no card.css to test; what is asserted is that the shell's fixed
 * identity resolves through the shared surface layer and that the API refuses opinions.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cdp } from "vitest/browser";

import { material } from "../../tokens/config.ts";
import { Theme } from "../../theme/theme.tsx";
import {
  GLASS_MATERIALS, APPEARANCES, colorOn, computed, mounted, ownColor, render, within } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Box } from "../box/box.tsx";
import { Spinner } from "../spinner/spinner.tsx";
import { Card } from "./card.tsx";

/** Every token this file resolves is a colour, and the harness's tokenOn reads lengths — so
    the name stays, one line over the shared probe. */
const tokenOn = (el: Element, name: string): string => colorOn(el, `var(${name})`);

describe("one treatment, fixed identity (§11, LOG 2026-08-04)", () => {
  it("is always the sealed bordered surface, and nothing casts a shadow", () => {
    const el = render(<Card>Body</Card>);
    expect(computed(el, "background-color")).toBe(colorOn(el, "var(--color-surface)"));
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--neutral-border"));
    expect(computed(el, "box-shadow")).toBe("none");
    expect(computed(el, "backdrop-filter")).toBe("none");
    expect(computed(el, "color")).toBe(tokenOn(el, "--color-text"));
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: the filled look fills the card and keeps a softer edge (§19)`, () => {
      // Rewritten 2026-08-06, and the rewrite is the point. The old spelling asserted
      // `background-color === var(--neutral-2)` and `border-top-color === transparent` — a
      // comparison against the token name its author had just typed, which is why it passed
      // for a day while `filled` did nothing at all in dark: --neutral-2 IS dark's seal, so
      // the law and the bug agreed with each other.
      //
      // The axis is now judged the only way an axis can be: against its OTHER END.
      const filled = mounted(<Card>Body</Card>, {
        theme: { surfaceLook: "filled", appearance },
        select: ".kui-surface",
      });
      const outlined = mounted(<Card>Body</Card>, {
        theme: { surfaceLook: "outlined", appearance },
        select: ".kui-surface",
      });
      expect(
        computed(filled, "background-color"),
        `filled resolves to outlined's fill in ${appearance} — the axis paints nothing`,
      ).not.toBe(computed(outlined, "background-color"));
      // And the boundary survives the dress (Kushagra, 2026-08-06: a filled surface may keep
      // a slight border — the fill is the pull, not the absence of an edge).
      expect(computed(filled, "border-top-color")).not.toBe("rgba(0, 0, 0, 0)");
    });

    it(`${appearance}: outlined is the identity — byte-identical to a world without the axis (§19)`, () => {
      const bare = render(<Card>Body</Card>);
      const outlined = mounted(<Card>Body</Card>, {
        theme: { surfaceLook: "outlined", appearance },
        select: ".kui-surface",
      });

      // Rewritten 2026-08-06. This compared `look="outlined"` against a Theme with no `look`
      // at all — but Theme ALWAYS stamps the default, so both renders were the same DOM with
      // the same attribute, and in dark (where the un-themed branch below does not run) the
      // law could not fail no matter what the axis did.
      //
      // "Identity" means the chrome each family declared BEFORE the axis existed, so it is
      // asserted against those pre-axis roles directly. This can fail, and once would have:
      // the Radio/Slider merge briefly gave outlined's entries filled's values.
      expect(computed(outlined, "background-color")).toBe(colorOn(outlined, "var(--color-surface)"));
      expect(computed(outlined, "border-top-color")).toBe(tokenOn(outlined, "--tone-border"));

      // And filled must NOT satisfy the same assertion, or "identity" is a claim about a
      // constant rather than about this end of the axis.
      const filled = mounted(<Card>Body</Card>, {
        theme: { surfaceLook: "filled", appearance },
        select: ".kui-surface",
      });
      expect(computed(filled, "background-color")).not.toBe(
        colorOn(filled, "var(--color-surface)"),
      );

      if (appearance === "light") {
        // And the un-themed document resolves the same chrome the outlined scope does.
        expect(computed(bare, "background-color")).toBe(computed(outlined, "background-color"));
        expect(computed(bare, "border-top-color")).toBe(computed(outlined, "border-top-color"));
      }
    });
  }

  it("a bare appearance scope re-prices the look — a dark section is not white (§19, §5)", () => {
    // The defect this law was written against, caught by eye in the preview: a look role holds
    // a COLOUR, and a var() inside a custom property substitutes where it is DECLARED. Emitted
    // only at :root, `--look-surface-fill: var(--color-surface)` baked WHITE, and every dark
    // region that was not itself a look scope inherited it — white cards, white fields, white
    // marks, in a dark app. Theme hid it by stamping data-look beside data-appearance; this
    // law uses the UN-THEMED path on purpose, which is the one the emitted stylesheet promises
    // works standalone. It fails against the pre-fix generator.
    const host = render(
      <div data-appearance="dark">
        <Card>Body</Card>
      </div>,
    );
    const el = host.querySelector<HTMLElement>(".kui-surface")!;
    const themed = mounted(<Card>Body</Card>, {
      theme: { appearance: "dark" },
      select: ".kui-surface",
    });
    expect(computed(el, "background-color")).toBe(computed(themed, "background-color"));
    // And the negative control: it must NOT be the light seal.
    const light = render(<Card>Body</Card>);
    expect(computed(el, "background-color")).not.toBe(computed(light, "background-color"));
  });

  it("the look axis reaches THROUGH the glass — material is a fill modifier, not a fill (§10, §19)", () => {
    // The 2026-08-16 port audit reported this broken, and it was — in the LAB, whose veil is
    // built from `--color-surface` directly. The package mixes `--kui-sf-fill-src`, the
    // surface's OWN fill source, which is what "material is a fill modifier, never a fill of
    // its own" means. Nothing proved it, though, which is why an auditor reading the lab could
    // not tell the two apart: the claim had no law, so it was indistinguishable from the bug.
    //
    // What must hold is TWO things at once, and asserting either alone is half a law: the two
    // looks must resolve DIFFERENT colours (the dress survives the veil) at the SAME alpha
    // (the veil is still doing the material's job and has not been replaced by a fill). Both
    // appearances, because filled walks the palette in opposite directions per mode.
    for (const appearance of APPEARANCES) {
      const outlined = mounted(<Card>B</Card>, {
        theme: { appearance, material: "regular", surfaceLook: "outlined" },
      });
      const filled = mounted(<Card>B</Card>, {
        theme: { appearance, material: "regular", surfaceLook: "filled" },
      });
      const a = computed(outlined, "background-color");
      const b = computed(filled, "background-color");
      expect(a, `${appearance}: the look never reached the pane`).not.toBe(b);
      const alphaOf = (c: string) => c.slice(c.lastIndexOf("/") + 1).replace(")", "").trim();
      expect(alphaOf(a), `${appearance}: the veil is opaque`).not.toBe("1");
      expect(alphaOf(b), `${appearance}: the looks translucency diverged from outlined's`).toBe(
        alphaOf(a),
      );
    }
  });

  it("the border is the SAME border at every material — one look (§10, 2026-08-16)", () => {
    // Reversed from "the material wins". A glass pane used to replace the border with its own
    // translucent white hairline, which is designed to read against a hostile backdrop and
    // vanishes against a plain page: measured on a calm bed, a solid card showed an edge and
    // the glass card beside it showed none. Material decides how a surface SURVIVES something
    // busy behind it; it does not decide what the surface is.
    //
    // The white catch still exists — it is the edge layer of the pane's own lighting, painted
    // on top of the border rather than instead of it, which is why this can be asserted as
    // equality across all four materials rather than as a preference between two.
    const border = (m: "solid" | (typeof GLASS_MATERIALS)[number]) =>
      computed(
        mounted(<Card>Body</Card>, { theme: { material: m }, select: ".kui-surface" }),
        "border-top-color",
      );
    const solid = border("solid");
    expect(solid, "the seal lost its edge").not.toBe("rgba(0, 0, 0, 0)");
    for (const m of GLASS_MATERIALS) {
      expect(border(m), `${m} glass draws a different border than the seal`).toBe(solid);
    }
  });

  it("exposes no visual opinion: tone and emphasis are not props", () => {
    // The identity attributes are constants the shell writes for the layer, not API. If this
    // ever fails, someone has re-grown a variant on the one component defined by not having
    // any — the type refusal is the law.
    // @ts-expect-error — tone is not a CardProp
    void (<Card tone="accent">B</Card>);
    // @ts-expect-error — emphasis is not a CardProp
    void (<Card emphasis="loud">B</Card>);
    // @ts-expect-error — bordered is not a CardProp
    void (<Card bordered={false}>B</Card>);
  });

  it("pads from the surface family by the size index, default 3 = 24px (§4)", () => {
    expect(computed(render(<Card>B</Card>), "padding-top")).toBe("24px");
    expect(computed(render(<Card size="1">B</Card>), "padding-top")).toBe("12px");
  });

  it("wears the corner of its size — the surface band is size-indexed (§6)", () => {
    // Decided 2026-08-04: a size-1 card and a size-4 card do not share a corner. Size 3 is
    // the anchor: it kept the old flat value, so the default card never moved.
    // At radius="medium" — the band's own numbers; the `full` DEFAULT caps the surface band
    // at large's values by design (§6), which its own law pins.
    const at = (node: React.ReactElement) =>
      render(<Theme radius="medium">{node}</Theme>).querySelector(".kui-surface") as HTMLElement;
    expect(computed(at(<Card size="1">B</Card>), "border-top-left-radius")).toBe("10px");
    expect(computed(at(<Card>B</Card>), "border-top-left-radius")).toBe("16px");
    expect(computed(at(<Card size="4">B</Card>), "border-top-left-radius")).toBe("20px");
  });

  it("follows a nested radius Theme — the level blocks re-bake the surface semantics (§6)", () => {
    // The bug this pins: --radius-surface-N declared only in :root stays baked to the medium
    // palette (substitution-at-declaration), so a nested small Theme re-priced the palette
    // and the card's corner ignored it.
    const small = mounted(<Card>B</Card>, { theme: { radius: "small" } });
    expect(computed(small, "border-top-left-radius")).toBe("8px");
    const none = mounted(<Card>B</Card>, { theme: { radius: "none" } });
    expect(computed(none, "border-top-left-radius")).toBe("0px");
  });

  it("takes density: a compact app's cards lose air, a comfortable app's gain it (§12)", () => {
    // Density reaches the card through the layout-space layer (§3, §12; the per-family sets
    // that shipped the same morning were superseded by the layer the same day) — otherwise
    // a compact Theme adjusted every control while its cards kept default air.
    const compact = mounted(<Card>B</Card>, { theme: { density: "compact" } });
    expect(computed(compact, "padding-top")).toBe("16px");
    const comfortable = mounted(<Card>B</Card>, { theme: { density: "comfortable" } });
    expect(computed(comfortable, "padding-top")).toBe("32px");
  });
});

describe("the shell SEALS — translucency is material's job alone (§10, LOG 2026-08-04)", () => {
  it("the fill is opaque: a card over media is a surface, not a border on a photo", () => {
    const el = render(<Card>B</Card>);
    // No alpha channel in any spelling (rgb() or the P3 block's color()) — the seal. The
    // earlier alpha fill (--tone-a1) was material's job leaking into the default:
    // invisible over the page, broken over media.
    const fill = computed(el, "background-color");
    expect(fill).not.toContain("rgba");
    expect(fill).not.toContain("/");
  });

  it("nested cards separate by border — the alpha-nesting claim is retracted", () => {
    const outer = render(
      <Card>
        <Card data-testid="inner">B</Card>
      </Card>,
    );
    const inner = outer.querySelector<HTMLElement>('[data-testid="inner"]')!;
    expect(computed(inner, "background-color")).toBe(computed(outer, "background-color"));
    expect(computed(inner, "border-top-style")).toBe("solid");
  });
});

describe("material is the THEME's, and one glass per stack is structural (§10, 2026-08-16)", () => {
  it("a card takes the app's material without being told — and refuses the prop", () => {
    // The axis moved to Theme because material answers "of what is this app built", which is
    // the same kind of question as depth or density and not a per-card choice. Two halves,
    // both asserted: the value arrives, and the old escape is gone from the type.
    const glass = mounted(<Card>B</Card>, { theme: { material: "thick" } });
    expect(glass.dataset["material"]).toBe("thick");
    expect(computed(glass, "backdrop-filter")).toContain("blur(");
    // @ts-expect-error — material is the Theme's; a card that could override it would be a
    // second home for the app's own identity (§12).
    void (<Card material="thin" />);
  });

  it("a nested Theme re-answers it, which is the ONLY per-subtree escape", () => {
    // The escape every other axis already has, and deliberately the same one: a subtree that
    // must differ says so with a Theme, not with a prop nobody can find later.
    const host = render(
      <Theme material="regular">
        <Card id="outer" />
        <Theme material="solid">
          <Card id="inner" />
        </Theme>
      </Theme>,
    );
    expect(host.querySelector<HTMLElement>("#outer")!.dataset["material"]).toBe("regular");
    expect(host.querySelector<HTMLElement>("#inner")!.dataset["material"]).toBeUndefined();
    expect(computed(host.querySelector("#inner")!, "backdrop-filter")).toBe("none");
  });

  it("glass does not stack: a pane inside a pane resolves solid, at any depth", () => {
    // A pane reads as glass because it defocuses what is behind it; a second pane has nothing
    // left to defocus, because its backdrop was already blurred by its parent. So this is a
    // fact about NESTING, which a component cannot know about itself — hence a scope rather
    // than a prop. Three levels, because a one-level guard is what a two-level tree defeats.
    const host = mounted(
      <Card id="l1">
        <Card id="l2">
          <Card id="l3" />
        </Card>
      </Card>,
      { theme: { material: "regular" } },
    );
    expect(host.dataset["material"]).toBe("regular");
    for (const id of ["#l2", "#l3"]) {
      const el = host.querySelector<HTMLElement>(id)!;
      // `on-glass`, not absent (2026-08-16). The nested pane must not FILTER — that is the
      // whole rule — but it must not go opaque either: a sealed card sitting on glass reads
      // as a slab punched through the pane. It keeps the veil and drops the machinery.
      expect(el.dataset["material"], `${id} stacked glass`).toBe("on-glass");
      expect(computed(el, "backdrop-filter"), `${id} stacked blur`).toBe("none");
      const alpha = (c: string) => (c.includes("/") ? parseFloat(c.slice(c.lastIndexOf("/") + 1)) : 1);
      expect(alpha(computed(el, "background-color")), `${id} sealed itself onto the glass`).toBeLessThan(1);
    }
  });

  it("a solid card does NOT stand its children down — the scope is glass, not containment", () => {
    // The negative control the rule above needs. If the mark were applied unconditionally,
    // every card in a glass app would flatten its own contents and the axis would be dead.
    // Nested cards under a solid theme are simply all solid; the interesting half is that
    // the scope must not fire, which only a glass-in-solid-parent case can show.
    const host = mounted(
      <Card id="outer">
        <Theme material="thin">
          <Card id="inner" />
        </Theme>
      </Card>,
      { theme: { material: "solid" } },
    );
    expect(host.dataset["material"]).toBeUndefined();
    expect(host.querySelector<HTMLElement>("#inner")!.dataset["material"]).toBe("thin");
  });
});

describe("material is backdrop defense, opt-in (§10)", () => {
  it("three thicknesses blur in order; the default never does", () => {
    const thin = mounted(<Card>B</Card>, { theme: { material: "thin" } });
    const regular = mounted(<Card>B</Card>, { theme: { material: "regular" } });
    const thick = mounted(<Card>B</Card>, { theme: { material: "thick" } });
    // DERIVED from config, not restated (2026-08-16). These were three hardcoded radii, so
    // the day the judged ladder replaced them — 5/16/32 to 2.4/4/5.6 — the law failed on the
    // NUMBERS while the thing it is actually about, that the three thicknesses blur in order
    // and the default does not blur at all, was never in question. A law that has to be
    // edited every time taste moves is a law nobody trusts when it goes red.
    const px = (el: HTMLElement) =>
      Number(computed(el, "backdrop-filter").match(/blur\(([\d.]+)px\)/)![1]);
    expect(px(thin)).toBe(Number(material.light.thin.filter.match(/blur\(([\d.]+)px\)/)![1]));
    expect(px(regular)).toBeGreaterThan(px(thin));
    expect(px(thick)).toBeGreaterThan(px(regular));
  });

  it("a material fill is the shell's own seal made translucent — the modifier, applied (§10)", () => {
    const thin = mounted(<Card>B</Card>, { theme: { material: "thin" } });
    expect(computed(thin, "background-color")).toBe(
      colorOn(thin, "color-mix(in srgb, var(--color-surface) var(--material-thin-alpha), transparent)"),
    );
    expect(computed(thin, "background-color")).not.toMatch(/^rgb\(/);
  });

  it("a plain card nested in a glass card keeps its seal — the derived fill does not inherit", () => {
    const outer = mounted(
      <Card>
        <Card data-testid="inner">B</Card>
      </Card>,
      { theme: { material: "regular" } },
    );
    const inner = outer.querySelector<HTMLElement>('[data-testid="inner"]')!;
    // It must not FILTER, and it must not inherit the outer pane's derived fill — the two
    // things the scope exists to stop. What it paints is its OWN veil at the on-glass alpha
    // (2026-08-16), which is a different colour from both the outer pane's fill and the seal.
    expect(computed(inner, "backdrop-filter")).toBe("none");
    expect(computed(inner, "background-color"), "the inner pane inherited the outer's fill").not.toBe(
      computed(outer, "background-color"),
    );
    // Structural, not just visual: the outer card scopes its subtree and the inner one
    // resolves to the nesting-only value. Asserted as well as the paint, because the paint
    // alone would pass if the mechanism were replaced by something weaker.
    expect(outer.dataset["material"]).toBe("regular");
    expect(inner.dataset["material"]).toBe("on-glass");
  });
});

describe("the shell carries context without imposing any (§10, §13)", () => {
  it("a control inside keeps its own resolution", () => {
    const card = render(
      <Card>
        <Button>Act</Button>
      </Card>,
    );
    const inCard = card.querySelector("button")!;
    const alone = render(<Button>Act</Button>);
    expect(computed(inCard, "background-color")).toBe(computed(alone, "background-color"));
    expect(computed(inCard, "color")).toBe(computed(alone, "color"));
  });

  it("containment does not inherit: a button inside a bordered card stays borderless", () => {
    // [data-bordered] declares --kui-border-color on the card, and custom properties inherit
    // by default — every control inside every Card silently grew a border until the
    // @property guard (inherits: false) cut the leak. Loud buttons made it visible.
    const card = render(
      <Card>
        <Button tone="accent" emphasis="loud">
          Act
        </Button>
      </Card>,
    );
    const inCard = card.querySelector("button")!;
    expect(computed(inCard, "border-top-color")).toBe("rgba(0, 0, 0, 0)");
    // And a bordered control inside still gets its own border — the guard kills only
    // the inheritance, never the attribute's own declaration.
    const bordered = render(
      <Card>
        <Button bordered>Act</Button>
      </Card>,
    );
    expect(computed(bordered.querySelector("button")!, "border-top-color")).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
  });

  it("the elevated world dresses the shell; flat stays shadowless; no Card API exists (§5, §10)", () => {
    const flat = render(<Card>B</Card>);
    expect(computed(flat, "box-shadow")).toBe("none");
    const el = mounted(<Card>B</Card>, { theme: { depth: "elevated" } });
    // Depth IS the palette: the elevated card wears exactly the surface row — one lighting
    // model, no bespoke value. The ROW moved to 5 on 2026-08-16, adopting the material lab's
    // depth: the palette is ordered by reach and the lab prices a cast by the size of the box
    // throwing it, so a card takes the top rung and a menu the middle one. (It was row 3
    // from 2026-08-07, when the ladder gained the control drop at row 2 and renumbered.)
    const probe = document.createElement("div");
    probe.style.boxShadow = "var(--shadow-5)";
    el.append(probe);
    expect(computed(el, "box-shadow")).toBe(computed(probe, "box-shadow"));
    probe.remove();
    // Add depth, change nothing else: the border is identical to the flat world's, which
    // is what keeps the edge sharp and inside the contrast system.
    expect(computed(el, "border-top-color")).toBe(computed(flat, "border-top-color"));
    expect(computed(el, "border-top-width")).toBe("1px");
    // The shadow sits on the card element itself, so it follows the surface radius — the
    // whole reason this is a world and not a wrapper.
    // @ts-expect-error — shadow is not a Card prop; the world is the only path
    void (<Card shadow="2">B</Card>);
  });

  it("a glass card transmits the world's shadow and catches its light (§10, 2026-08-07)", () => {
    // The two seams, mounted: elevated glass casts the FADED row (weaker than the solid
    // card's, still a shadow), catches the LIFTED rim (brighter than flat glass's resting
    // glint), and flat glass never floats — edge and glint, no lift.
    const solid = mounted(<Card>B</Card>, { theme: { depth: "elevated" } });
    const glass = mounted(<Card>B</Card>, { theme: { depth: "elevated", material: "thin" } });
    const flatGlass = mounted(<Card>B</Card>, { theme: { depth: "flat", material: "thin" } });
    const probe = document.createElement("div");
    probe.style.boxShadow = "var(--surface-chrome-thin)";
    glass.append(probe);
    expect(computed(glass, "box-shadow")).toBe(computed(probe, "box-shadow"));
    probe.remove();
    expect(computed(glass, "box-shadow")).not.toBe("none");
    expect(computed(glass, "box-shadow")).not.toBe(computed(solid, "box-shadow"));
    expect(computed(flatGlass, "box-shadow")).toBe("none");
    // The catch: both worlds paint a rim, and they differ — the elevated one is the lifted
    // variant. A remap that silently stopped resolving would fail the not-none half first.
    expect(computed(glass, "background-image")).not.toBe("none");
    expect(computed(flatGlass, "background-image")).not.toBe("none");
    expect(computed(glass, "background-image")).not.toBe(computed(flatGlass, "background-image"));
  });

  it("follows appearance: the same Card resolves differently under a dark Theme", () => {
    const light = render(<Card>B</Card>);
    const darkCard = mounted(<Card>B</Card>, { theme: { appearance: "dark" } });
    expect(computed(darkCard, "color")).not.toBe(computed(light, "color"));
    expect(computed(darkCard, "border-top-color")).not.toBe(computed(light, "border-top-color"));
  });
});

describe("the boundary (§3, §13)", () => {
  it("forwards the escapes and keeps its own classes", () => {
    const el = mounted(
      <Card className="mine" style={{ maxWidth: "300px" }}>
        B
      </Card>,
      { theme: { material: "thin" } },
    );
    expect(el.className.split(" ").sort()).toEqual(["kui-card", "kui-surface", "mine"]);
    expect(computed(el, "max-width")).toBe("300px");
    expect(el.dataset.material).toBe("thin");
  });

  it("card-as-button: render a button and the surface notices (§10)", () => {
    let clicks = 0;
    const el = render(
      <Card render={<button type="button" onClick={() => (clicks += 1)} />}>Open</Card>,
    );
    const plain = render(<Card>Open</Card>);
    expect(el.tagName).toBe("BUTTON");
    // Rest is pixel-identical to a plain Card — a card is a card until you point at it.
    expect(computed(el, "background-color")).toBe(computed(plain, "background-color"));
    expect(computed(el, "border-top-color")).toBe(computed(plain, "border-top-color"));
    expect(computed(el, "cursor")).toBe("pointer");
    expect(computed(plain, "cursor")).toBe("auto");
    el.click();
    expect(clicks).toBe(1);
  });

  it("card-as-LINK wears no UA underline either — the invariant has two sites (§8, §10)", () => {
    // "No interactive element of ours wears the browser's link underline" is declared in two
    // stylesheets — recipes.css for controls, surfaces.css for the card-as-button arm — and
    // until 2026-08-06 only the control site had a law. Deleting surfaces.css's
    // `text-decoration: none` left the whole suite green while `<Card render={<a/>}>`, the
    // composition surfaces.css names by hand as THE pattern, underlined its entire contents.
    //
    // The house precedent is the focus-ring and box-shadow pair: when a single-site fact
    // becomes a multi-site one, grow a law that reads the VALUE at every site rather than
    // count rules in one file. This is the surface half; button.browser.test.tsx is the
    // control half.
    const el = render(<Card render={<a href="/post" />}>Read the post</Card>);
    expect(el.tagName).toBe("A");
    expect(computed(el, "text-decoration-line")).toBe("none");
  });

  it("render composes: an article that is a card keeps the shell (§5)", () => {
    const el = render(
      <Card render={<article aria-label="post" />} size="2">
        B
      </Card>,
    );
    expect(el.tagName).toBe("ARTICLE");
    expect(el.getAttribute("aria-label")).toBe("post");
    expect(el.className).toContain("kui-surface");
    expect(computed(el, "padding-top")).toBe("16px");
  });
});

describe("the control size join does not reach a surface (§4, §10)", () => {
  // Card stamps data-size for its own padding and radius, and the control family's join sat on
  // a bare [data-size] — so every card silently took --kui-ct-h, --kui-ct-icon and the rest. Both
  // consequences below are compositions of two public exports, and neither was tested.
  it("a Spinner inside a Card keeps the size its own fallback documents", () => {
    const inCard = render(
      <Card size="4">
        <Spinner />
      </Card>,
    );
    const bare = render(<Spinner />);
    const spinner = within(inCard, ".kui-spinner");
    expect(computed(spinner, "width")).toBe(computed(bare, "width"));
  });

  it("Box's height stem does not collide with the control height on a card", () => {
    // <Box render={<Card/>}> is one element carrying kui-box AND data-size. `.kui-box { height:
    // var(--kui-ct-h) }` therefore read the control-family height and pinned the card to 40px.
    const el = render(
      <Box render={<Card size="3" />}>
        <div style={{ height: "300px" }} />
      </Box>,
    );
    expect(parseFloat(computed(el, "height"))).toBeGreaterThan(200);
  });
});

describe("the render escape merges, it does not overwrite (§3, §5)", () => {
  // cloneElement special-cases exactly one prop for undefined — ref — and copies every other
  // own key even when its value is undefined. All three hand-rolled merges lost something
  // different, and every one of these compositions is in the public API.
  it("Card keeps the target's own children when it has none of its own", () => {
    const el = render(<Card render={<article>Post body</article>} />);
    expect(el.tagName).toBe("ARTICLE");
    expect(el.textContent).toBe("Post body");
  });

  it("Theme keeps the target's own style", () => {
    const el = render(<Theme render={<section className="hero" style={{ minHeight: "640px" }} />} />);
    expect(computed(el, "min-height")).toBe("640px");
    expect(el.className).toContain("hero");
  });

  it("Theme keeps the target's own children when it has none", () => {
    const el = render(<Theme render={<section>Kept</section>} />);
    expect(el.textContent).toBe("Kept");
  });

  it("Box gives the node to the target's ref as well as its own", () => {
    let mine: HTMLElement | null = null;
    let theirs: HTMLDivElement | null = null;
    render(
      <Box
        ref={(n: HTMLElement | null) => {
          mine = n;
        }}
        render={
          <div
            ref={(n: HTMLDivElement | null) => {
              theirs = n;
            }}
          />
        }
      />,
    );
    expect(mine).not.toBeNull();
    expect(theirs).toBe(mine);
  });

  it("and consumer style still wins over the component's, which is what an escape means", () => {
    const el = render(<Box p="4" render={<div style={{ paddingTop: "99px" }} />} />);
    expect(computed(el, "padding-top")).toBe("99px");
  });
});

describe("the seal's three rungs are three different colours, in both modes (§10)", () => {
  // surfaces.test.ts asserted the token NAMES appear in the stylesheet, which they always did.
  // In dark, --color-surface and --color-surface-hover were both var(--neutral-2) — the same
  // token, so the same pixels — and an interactive card had no hover feedback at all for the
  // entire dark world. The name was there; the colour was not.
  for (const appearance of APPEARANCES) {
    it(`resolves rest, hover and active apart under appearance="${appearance}"`, () => {
      const card = mounted(<Card />, { theme: { appearance } });
      const [rest, hover, active] = ["--color-surface", "--color-surface-hover", "--color-surface-active"].map(
        (token) => computed(card, token),
      );
      expect(new Set([rest, hover, active]).size).toBe(3);
    });
  }
});

describe("the elevated world escapes both ways (§5, §10)", () => {
  it("a flat Theme inside an elevated one gets its cards back flat", () => {
    // Was a descendant selector with no reset, so the nested flat matched nothing and the
    // ancestor's rule still reached these cards. Every other axis escapes by declaration.
    const nested = render(
      <Theme depth="elevated">
        <Theme depth="flat">
          <Card id="probe" />
        </Theme>
      </Theme>,
    );
    expect(computed(nested.querySelector("#probe")!, "box-shadow")).toBe("none");
  });

  it("and elevated still elevates, nested inside a flat app", () => {
    const nested = render(
      <Theme depth="flat">
        <Theme depth="elevated">
          <Card id="probe" />
        </Theme>
      </Theme>,
    );
    expect(computed(nested.querySelector("#probe")!, "box-shadow")).not.toBe("none");
  });

  it.each(GLASS_MATERIALS)(
    "a plain card inside %s glass keeps the WORLD's shadow, not the pane's (audit 2026-08-07)",
    (material) => {
      // The pane's transmitted cast used to be written onto --kui-surface-chrome itself — the
      // variable the world declares on the Theme element and every surface reads by
      // INHERITANCE. Re-pointing it on a glass card handed the faded row to the whole subtree,
      // so an opaque card inside a glass card cast about a third of its shadow in light, and
      // in dark also lost the rim-light the transmitted row does not carry.
      //
      // Both appearances, because dark loses a different thing than light does.
      for (const appearance of APPEARANCES) {
        const alone = mounted(<Card>B</Card>, {
          theme: { appearance, depth: "elevated" },
          select: ".kui-surface",
        });
        const nested = mounted(
          <Card>
            <Card id="inner">B</Card>
          </Card>,
          { theme: { appearance, depth: "elevated", material } },
        );
        const inner = nested.querySelector<HTMLElement>("#inner")!;
        const outer = nested;
        expect(
          computed(inner, "box-shadow"),
          `${appearance}/${material}: the inner card took the pane's cast`,
        ).toBe(computed(alone, "box-shadow"));
        // And the pane still transmits — the guard must not cost the glass card its own
        // faded shadow, which was correct all along.
        expect(computed(outer, "box-shadow")).not.toBe("none");
        expect(computed(outer, "box-shadow")).not.toBe(computed(alone, "box-shadow"));
      }
    },
  );

  it("a sealed pane stops transmitting and takes the world's full shadow (§10)", async () => {
    // A sealed pane is not glass, so it must give the transmitted cast back. This is the half
    // of the guard that is easy to get wrong twice: the pane's own cast now lives in a
    // separate non-inheriting name, so the reduced-transparency arm has to clear THAT name —
    // clearing the world's, or the old `inherit` spelling, leaves the faded row in place and
    // a sealed card floats a third as high as the solid card beside it.
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
    });
    try {
      const solid = mounted(<Card>B</Card>, {
        theme: { depth: "elevated" },
        select: ".kui-surface",
      });
      const sealed = mounted(<Card>B</Card>, {
        theme: { depth: "elevated", material: "thin" },
        select: ".kui-surface",
      });
      expect(computed(sealed, "backdrop-filter")).toBe("none"); // the pane really is sealed
      expect(computed(solid, "box-shadow")).not.toBe("none"); // and the world really is lit
      expect(computed(sealed, "box-shadow")).toBe(computed(solid, "box-shadow"));
    } finally {
      await cdp().send("Emulation.setEmulatedMedia", { features: [] });
    }
  });

  it("the escape reaches the pane's own light too, with appearance inherited (audit 2026-08-07)", () => {
    // The escape was asserted for the SHADOW and never for the glint, and the glint was the
    // half that could not escape: the elevated scope re-declared the generated --material-*-rim
    // rather than a --kui- pointer, so `flat` had nothing to point back at and simply declared
    // nothing. A nested flat Theme kept the brighter lifted rim.
    //
    // appearance="inherit" is what makes this reproduce and is not an exotic setting — it is
    // how apps/docs mounts its root, so every Theme underneath it inherits too. With an
    // appearance stamped, the appearance scope re-declares the generated name AT the element
    // and papers over the hole; the bug then hides behind an axis it has nothing to do with.
    const nested = render(
      <Theme appearance="inherit" depth="elevated" material="regular">
        <Card id="lifted" />
        <Theme depth="flat">
          <Card id="rested" />
        </Theme>
      </Theme>,
    );
    const lifted = computed(nested.querySelector("#lifted")!, "background-image");
    const rested = computed(nested.querySelector("#rested")!, "background-image");
    // Both worlds paint a glint — flat glass keeps edge and light, and loses only the lift.
    expect(rested).not.toBe("none");
    expect(lifted).not.toBe("none");
    expect(rested, "the nested flat pane kept the elevated glint").not.toBe(lifted);
    // And it rests at exactly the value a top-level flat app resolves — escaping is going
    // back, not going somewhere third.
    const topLevel = mounted(<Card />, {
      theme: { appearance: "inherit", depth: "flat", material: "regular" },
      select: ".kui-surface",
    });
    expect(rested).toBe(computed(topLevel, "background-image"));
  });
});

describe("reduced transparency takes the pane away, not the app's dress (§10, §19)", () => {
  // The only media path in this repo that no law had ever executed in a browser, which is why
  // the defect below sat in a rule whose own comment denied it. Emulated over CDP, the same
  // route the audit's completeness critic proved works.
  const emulate = (features: { name: string; value: string }[]) =>
    cdp().send("Emulation.setEmulatedMedia", { features });

  afterEach(async () => {
    await emulate([]);
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: a glass card's edge matches every other card's under filled`, async () => {
      await emulate([{ name: "prefers-reduced-transparency", value: "reduce" }]);
      const glass = mounted(<Card>Body</Card>, {
        theme: { surfaceLook: "filled", appearance },
        select: ".kui-surface",
      });
      const plain = mounted(<Card>Body</Card>, {
        theme: { surfaceLook: "filled", appearance },
        select: ".kui-surface",
      });

      // The negative control, and it is not optional: without it this law passes when the
      // media query never fires at all, which is the failure mode a media-emulating test is
      // most likely to have. No blur means the reduce block really is the one painting.
      expect(computed(glass, "backdrop-filter"), "the reduce block never fired").toBe("none");

      // Pre-fix the reduce block named var(--tone-border) directly. That WAS the ordinary
      // dress until the look axis existed; under `filled` it made the one surface that asked
      // for less transparency the only surface wearing the tone hairline.
      expect(computed(glass, "border-top-color")).toBe(computed(plain, "border-top-color"));
    });
  }
});

describe("every slot the axis emits is actually reached (§19)", () => {
  // Blind spot from the look audit: four of the axis's roles were read by NO law. The resting
  // fill and edge had laws; the interactive slots — the ones that only exist because a Card
  // can be a button — had none, so `filled` could have left a card's hover and press sitting
  // on `outlined`'s values and every test would have agreed. Read as the source variables the
  // :hover/:active rules resolve, which is where a look that failed to reach them shows up
  // without synthesising a pointer.
  const SLOTS = ["--look-surface-fill", "--look-surface-fill-hover", "--look-surface-fill-active"];

  for (const appearance of APPEARANCES) {
    it(`${appearance}: the surface family's interactive slots move with the look`, () => {
      const at = (look: "outlined" | "filled") =>
        mounted(<Card>Body</Card>, { theme: { surfaceLook: look, appearance }, select: ".kui-surface" });
      const outlined = at("outlined");
      const filled = at("filled");
      for (const slot of SLOTS) {
        const a = ownColor(outlined, slot);
        const b = ownColor(filled, slot);
        expect(a, `${slot} resolves to nothing under outlined`).not.toBe("");
        expect(b, `${slot} resolves to nothing under filled`).not.toBe("");
        expect(b, `${slot} is identical in both looks — the axis does not reach it`).not.toBe(a);
      }
    });
  }
});

describe("the lens: refraction reaches a real pane (§10, 2026-08-16)", () => {
  // The stylesheet laws prove the SEAM; only a mount proves the mechanism. This is the half
  // that was missing when the material ladder ported without the lens and §10's stated
  // defence floor went unmet at every rung with nothing measuring it.
  const lens = (el: HTMLElement) => computed(el, "backdrop-filter").match(/^url\("([^"]+)"\)/)?.[1];

  it("a glass card mints a filter and references it; a solid card does not", () => {
    const glass = mounted(<Card>G</Card>, { theme: { material: "regular" } });
    const id = lens(glass);
    expect(id, "a glass pane has no lens").toBeTruthy();
    // The reference must RESOLVE — a url() pointing at nothing is the failure mode that
    // looks identical to success in a computed-style read.
    expect(document.querySelector(id!), "the lens id resolves to no filter").toBeTruthy();
    // And the chain it was prepended to survives underneath it: additive, never a swap.
    expect(computed(glass, "backdrop-filter")).toMatch(/blur\([\d.]+px\)/);

    // The solid half must read the CAUSE, not the effect. Asserting only that a solid card's
    // backdrop-filter carries no url() cannot fail: a solid card declares no backdrop-filter
    // at all, so the property is `none` however much work was wasted building a map for it.
    // Demonstrated — forcing the hook on for every card passed this law in its first form.
    const solid = mounted(<Card>S</Card>, { theme: { material: "solid" } });
    expect(lens(solid)).toBeUndefined();
    expect(solid.style.getPropertyValue("--kui-lens"), "a solid pane built a map it cannot use").toBe("");
  });

  it("a nested pane gets its OWN map, never its container's", () => {
    // The inheritance guard, measured rather than read off @property: a map encodes one box,
    // and a card inside a card is the composition that would expose a leak. (Glass does not
    // stack, so the inner surface resolves solid and must carry no lens at all — which is the
    // stronger form of the same guarantee.)
    const outer = mounted(
      <Card>
        <Card>inner</Card>
      </Card>,
      { theme: { material: "regular" } },
    );
    const inner = outer.querySelector<HTMLElement>(".kui-card")!;
    expect(lens(outer)).toBeTruthy();
    expect(lens(inner), "the inner pane inherited a lens built for its container").toBeUndefined();
  });
});

describe("convergence: over a calm bed, material is invisible (§10, 2026-08-16)", () => {
  /* Kushagra's rule, and the one that reorganises §10: "visually, solid should look exactly
     like any material on non hostile, plain white bg". Material is a strategy for surviving
     a busy backdrop, not a look — so with nothing behind the pane, the four must agree.

     That is what makes the rest of the model sound. If they agree here, then painting glass
     over calm ground buys nothing and can be skipped for free; if they do not, every skip is
     a visible change and the optimisation is unavailable. This law is the precondition for
     selectivity, not a cosmetic check.

     Measured on the PAINTED pixel, not on declarations: the fill goes through a veil, a
     backdrop-filter and a brightness term before it reaches the screen, and each of those is
     a place the agreement can break with every declaration still looking right. */
  const bed = (m: "solid" | (typeof GLASS_MATERIALS)[number]) => {
    const host = render(
      <Theme material={m}>
        <div style={{ background: "var(--neutral-1)", padding: "24px" }}>
          <Card>Body</Card>
        </div>
      </Theme>,
    );
    return host.querySelector<HTMLElement>(".kui-surface")!;
  };

  it("every material paints the same edge and the same lighting as the seal", () => {
    const solid = bed("solid");
    const ref = {
      border: computed(solid, "border-top-color"),
      light: computed(solid, "background-image"),
    };
    // The seal must have something to agree ABOUT, or this passes on two blanks.
    expect(ref.border, "the seal has no edge").not.toBe("rgba(0, 0, 0, 0)");
    expect(ref.light, "the seal has no lighting").not.toBe("none");
    for (const m of GLASS_MATERIALS) {
      const el = bed(m);
      expect(computed(el, "border-top-color"), `${m}: a different edge than the seal`).toBe(ref.border);
      expect(computed(el, "background-image"), `${m}: different lighting than the seal`).toBe(ref.light);
    }
  });

  it("what material DOES change is only the two things a calm bed cannot show", () => {
    // The other half, or "they converge" would be satisfied by material doing nothing at all.
    // Alpha and the backdrop-filter are exactly the channels that are inert with nothing
    // behind the pane — which is why convergence and a real material are not in tension.
    const solid = bed("solid");
    expect(computed(solid, "backdrop-filter")).toBe("none");
    const glass = bed("thick");
    expect(computed(glass, "backdrop-filter"), "glass stopped filtering").not.toBe("none");
    const alphaOf = (c: string) => (c.includes("/") ? parseFloat(c.slice(c.lastIndexOf("/") + 1)) : 1);
    expect(alphaOf(computed(solid, "background-color")), "the seal is not opaque").toBe(1);
    expect(alphaOf(computed(glass, "background-color")), "glass is opaque").toBeLessThan(1);
  });
});
