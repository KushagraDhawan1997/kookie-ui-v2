/**
 * Card's laws, mounted (§10, §11, LOG 2026-08-04): a shell — one treatment, no variants,
 * no anatomy. There is no card.css to test; what is asserted is that the shell's fixed
 * identity resolves through the shared surface layer and that the API refuses opinions.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cdp } from "vitest/browser";

import { Theme } from "../../theme/theme.tsx";
import { APPEARANCES, colorOn, computed, mounted, ownColor, render, within } from "../../test/browser.tsx";
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

  it("a glass card keeps the pane's own edge in the filled look — the material wins (§19, §10)", () => {
    const el = mounted(<Card material="regular">Body</Card>, {
      theme: { surfaceLook: "filled" },
      select: ".kui-surface",
    });
    expect(computed(el, "border-top-color")).toBe(
      colorOn(el, "var(--material-regular-edge)"),
    );
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

describe("material is backdrop defense, opt-in (§10)", () => {
  it("three thicknesses blur in order; the default never does", () => {
    const thin = render(<Card material="thin">B</Card>);
    const regular = render(<Card material="regular">B</Card>);
    const thick = render(<Card material="thick">B</Card>);
    expect(computed(thin, "backdrop-filter")).toContain("blur(5px)");
    expect(computed(regular, "backdrop-filter")).toContain("blur(16px)");
    expect(computed(thick, "backdrop-filter")).toContain("blur(32px)");
  });

  it("a material fill is the shell's own seal made translucent — the modifier, applied (§10)", () => {
    const thin = render(<Card material="thin">B</Card>);
    expect(computed(thin, "background-color")).toBe(
      colorOn(thin, "color-mix(in srgb, var(--color-surface) var(--material-thin-alpha), transparent)"),
    );
    expect(computed(thin, "background-color")).not.toMatch(/^rgb\(/);
  });

  it("a plain card nested in a glass card keeps its seal — the derived fill does not inherit", () => {
    const outer = render(
      <Card material="regular">
        <Card data-testid="inner">B</Card>
      </Card>,
    );
    const inner = outer.querySelector<HTMLElement>('[data-testid="inner"]')!;
    expect(computed(inner, "background-color")).toBe(colorOn(inner, "var(--color-surface)"));
    expect(computed(inner, "backdrop-filter")).toBe("none");
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
    // Depth IS the palette: the elevated card wears exactly row 3 — one lighting model.
    // (Row 3 since 2026-08-07: the ladder gained the control drop at row 2 and renumbered.)
    const probe = document.createElement("div");
    probe.style.boxShadow = "var(--shadow-3)";
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
    const glass = mounted(<Card material="thin">B</Card>, { theme: { depth: "elevated" } });
    const flatGlass = mounted(<Card material="thin">B</Card>, { theme: { depth: "flat" } });
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
    const el = render(
      <Card className="mine" style={{ maxWidth: "300px" }} material="thin">
        B
      </Card>,
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

  it.each(["thin", "regular", "thick"] as const)(
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
          <Card material={material}>
            <Card id="inner">B</Card>
          </Card>,
          { theme: { appearance, depth: "elevated" } },
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
      const sealed = mounted(<Card material="thin">B</Card>, {
        theme: { depth: "elevated" },
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
      <Theme appearance="inherit" depth="elevated">
        <Card material="regular" id="lifted" />
        <Theme depth="flat">
          <Card material="regular" id="rested" />
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
    const topLevel = mounted(<Card material="regular" />, {
      theme: { appearance: "inherit", depth: "flat" },
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
      const glass = mounted(<Card material="regular">Body</Card>, {
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
