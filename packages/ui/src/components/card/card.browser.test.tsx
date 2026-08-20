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
  GLASS_MATERIALS, APPEARANCES, colorOn, computed, inMotion, mounted, numberOn, render, tokenOn as lengthOn, within, until } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Box } from "../box/box.tsx";
import { Spinner } from "../spinner/spinner.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";
import { Stack } from "../stack/stack.tsx";
import { Flex } from "../flex/flex.tsx";
import { Grid } from "../grid/grid.tsx";
import type * as React from "react";
import { Card } from "./card.tsx";

/** Every token this file resolves is a colour, and the harness's tokenOn reads lengths — so
    the name stays, one line over the shared probe. */
const tokenOn = (el: Element, name: string): string => colorOn(el, `var(${name})`);

describe("one treatment, fixed identity (§11, LOG 2026-08-04)", () => {
  it("is always the sealed surface, and the DEFAULT world casts the surface row", () => {
    const el = render(<Card>Body</Card>);
    expect(computed(el, "background-color")).toBe(colorOn(el, "var(--color-surface)"));
    // TRANSPARENT, not the tone hairline (lab port 2026-08-17, §19): the lab's pane is
    // borderless — its edge is light (the cast on solid, the ring on glass), never pigment.
    // contrast="high" re-declares the role to `initial` so the hairline returns there.
    expect(computed(el, "border-top-color")).toBe("rgba(0, 0, 0, 0)");
    // The DEFAULT world casts (lab port 2026-08-17): themeDefaults.depth is "elevated" — the
    // lab has no flat world — so a card under a default Theme wears the dead solid seat
    // (pool.solid is a no-op layer since the doubled-bottom-line finding) plus the surface
    // chrome role. Derived through the roles, never a restated row. Measured under a real
    // default Theme: the depth scope is `[data-depth]`, which only a Theme stamps — the
    // un-themed card above resolves the no-op fallbacks on both hops.
    const themed = mounted(<Card>Body</Card>, { theme: {}, select: ".kui-surface" });
    const seat = document.createElement("div");
    seat.style.boxShadow = "var(--material-pool-solid), var(--surface-chrome)";
    themed.append(seat);
    expect(computed(themed, "box-shadow")).toBe(computed(seat, "box-shadow"));
    seat.remove();
    expect(computed(themed, "box-shadow"), "the default world stopped casting").not.toBe(
      computed(el, "box-shadow"), // the un-themed no-op list — the cast must actually exist
    );
    expect(computed(el, "backdrop-filter")).toBe("none");
    expect(computed(el, "color")).toBe(tokenOn(el, "--color-text"));
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: the resting identity — the seal fill, and a borderless edge since the lab port (§10, §19)`, () => {
      // The one resting surface identity since the look axis died (surfaceLook deleted
      // 2026-08-20): the seal fill, and NO pigment hairline — the lab's pane is borderless,
      // its edge carried by light (ring on glass, pool and cast on solid). The tone hairline
      // survives in the contrast="high" scopes and in depth="flat", which re-declare
      // `--surface-edge` to `initial` (their own laws).
      const bare = render(<Card>Body</Card>);
      const themed = mounted(<Card>Body</Card>, {
        theme: { appearance },
        select: ".kui-surface",
      });
      expect(computed(themed, "background-color")).toBe(colorOn(themed, "var(--color-surface)"));
      expect(
        computed(themed, "border-top-color"),
        "the resting hairline returned — the 2026-08-17 borderless reversal is undone",
      ).toBe("rgba(0, 0, 0, 0)");

      if (appearance === "light") {
        // And the un-themed document resolves the same chrome the themed scope does.
        expect(computed(bare, "background-color")).toBe(computed(themed, "background-color"));
        expect(computed(bare, "border-top-color")).toBe(computed(themed, "border-top-color"));
      }
    });
  }

  it("a bare appearance scope re-prices the seal — a dark section is not white (§19, §5)", () => {
    // The defect this law was written against, caught by eye in the preview: a surface role
    // holds a COLOUR, and a var() inside a custom property substitutes where it is DECLARED.
    // Emitted only at :root, the seal baked WHITE, and every dark region inherited it —
    // white cards, white fields, white marks, in a dark app. Theme hid it by co-locating its
    // stamps; this law uses the UN-THEMED path on purpose, which is the one the emitted
    // stylesheet promises works standalone. It fails against the pre-fix generator.
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

  it("the rung reaches THROUGH the glass — material is a fill modifier, not a fill (§10, §19)", () => {
    // The 2026-08-16 port audit reported this broken, and it was — in the LAB, whose veil is
    // built from `--color-surface` directly. The package mixes `--kui-sf-fill-src`, the
    // surface's OWN fill source, which is what "material is a fill modifier, never a fill of
    // its own" means. Nothing proved it, though, which is why an auditor reading the lab could
    // not tell the two apart: the claim had no law, so it was indistinguishable from the bug.
    //
    // The instrument was the look axis until it died (surfaceLook deleted 2026-08-20); the
    // rungs are the source that still varies — a quiet pane's veil is the seal, a
    // tone-forward pane's veil carries its own chroma, and a veil built from the seal
    // directly would render both identical (the lab's exact defect, transplantable). The
    // subjects are raw panes (the sanctioned `useMaterial()` consumer shape), because Card
    // rightly refuses tone and this law is about the surface LAYER.
    for (const appearance of APPEARANCES) {
      const pane = (attrs: Record<string, string>) =>
        mounted(<div className="kui-surface" data-material="regular" {...attrs} />, {
          theme: { appearance },
          select: ".kui-surface",
        });
      const quiet = pane({ "data-emphasis": "quiet" });
      const toned = pane({ "data-emphasis": "medium", "data-tone": "destructive" });
      const a = computed(quiet, "background-color");
      const b = computed(toned, "background-color");
      expect(a, `${appearance}: the rung never reached the pane`).not.toBe(b);
      const alphaOf = (c: string) => c.slice(c.lastIndexOf("/") + 1).replace(")", "").trim();
      expect(alphaOf(a), `${appearance}: the veil is opaque`).not.toBe("1");
    }
  });

  it("a glass pane keeps its OWN edge — the one-look revert that went too far (§10)", () => {
    // History, because this law has now pointed both ways in one day and the next reader
    // needs to know why THIS direction is the settled one. Convergence ("one border at every
    // material") was shipped on 2026-08-16 and reverted within the hour: on a calm bed it is
    // right, and on a HOSTILE bed a grey tone hairline on a pane of light reads as a sticker
    // — the original 2026-08-05 finding, re-proven by making the change and looking at it.
    // No single colour reads on both a white page and a photograph; grey vanishes on one,
    // white on the other. So the edge stays the material's, and convergence over calm ground
    // is carried by the LIGHTING, which is backdrop-independent.
    // Since the ring port (2026-08-17) the pane's edge is the ::after ring — a 1px conic
    // LIGHT, the lab's own edge — and every surface border stands down to transparent so
    // the ring is the only line (§19's borderless reversal covers the SOLID card too: its
    // edge is the cast, not pigment). Both halves per pane: a transparent border with no
    // ring is a pane with no edge at all, the failure mode this law keeps impossible.
    // `backdrop` because an in-flow card is solid by selectivity (lab port 2026-08-17).
    const solid = mounted(<Card backdrop>Body</Card>, {
      theme: { material: "solid" },
      select: ".kui-surface",
    });
    expect(computed(solid, "border-top-color"), "the solid slab regrew a hairline").toBe(
      "rgba(0, 0, 0, 0)",
    );
    // The negative control: the ring is the GLASS pane's own anatomy — a matte slab wears none.
    expect(getComputedStyle(solid, "::after").backgroundImage).not.toContain("conic-gradient");
    for (const m of GLASS_MATERIALS) {
      const el = mounted(<Card backdrop>B</Card>, {
        theme: { material: m },
        select: ".kui-surface",
      });
      expect(computed(el, "border-top-color"), `${m}: the border competes with the ring`).toBe(
        "rgba(0, 0, 0, 0)",
      );
      const ring = getComputedStyle(el, "::after");
      expect(ring.backgroundImage, `${m} lost the ring`).toContain("conic-gradient");
      expect(parseFloat(ring.opacity), `${m}: the ring is invisible`).toBeGreaterThan(0.5);
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
    // DERIVED since the lab port (2026-08-17, §6): under `@supports (corner-shape: squircle)`
    // every surface corner is the authored band pick TIMES --kui-corner-k (1.613 — the
    // squircle needs the bigger number for the same visual weight), so a pinned px literal
    // is a claim about the engine, not the band. The probe reads the same token and the same
    // knob the rule does; what this law still pins is that the CARD follows its size index.
    const at = (node: React.ReactElement) =>
      render(<Theme radius="medium">{node}</Theme>).querySelector(".kui-surface") as HTMLElement;
    const drawn = (el: HTMLElement, step: string) => {
      const probe = document.createElement("div");
      probe.style.borderRadius = `calc(var(--radius-surface-${step}) * var(--kui-corner-k, 1))`;
      el.append(probe);
      const v = computed(probe, "border-top-left-radius");
      probe.remove();
      return v;
    };
    const s1 = at(<Card size="1">B</Card>);
    expect(computed(s1, "border-top-left-radius")).toBe(drawn(s1, "1"));
    const s3 = at(<Card>B</Card>);
    expect(computed(s3, "border-top-left-radius")).toBe(drawn(s3, "3"));
    const s4 = at(<Card size="4">B</Card>);
    expect(computed(s4, "border-top-left-radius")).toBe(drawn(s4, "4"));
    // And the band really is size-indexed — the derivation must not have collapsed to one
    // value, or the probe comparison above is comparing a constant with itself.
    expect(computed(s1, "border-top-left-radius")).not.toBe(computed(s4, "border-top-left-radius"));
  });

  it("follows a nested radius Theme — the level blocks re-bake the surface semantics (§6)", () => {
    // The bug this pins: --radius-surface-N declared only in :root stays baked to the medium
    // palette (substitution-at-declaration), so a nested small Theme re-priced the palette
    // and the card's corner ignored it.
    // Derived through the corner knob (lab port 2026-08-17, §6): the squircle multiplies the
    // authored band by --kui-corner-k in Chromium, so the law compares against a probe reading
    // the same token + knob instead of pinning the arc literal. `none` still means none —
    // 0 × k is 0, and the probe derivation proves it rather than assuming it.
    const drawn = (el: HTMLElement) => {
      const probe = document.createElement("div");
      probe.style.borderRadius = "calc(var(--radius-surface-3) * var(--kui-corner-k, 1))";
      el.append(probe);
      const v = computed(probe, "border-top-left-radius");
      probe.remove();
      return v;
    };
    const small = mounted(<Card>B</Card>, { theme: { radius: "small" } });
    expect(computed(small, "border-top-left-radius")).toBe(drawn(small));
    const none = mounted(<Card>B</Card>, { theme: { radius: "none" } });
    expect(computed(none, "border-top-left-radius")).toBe("0px");
    // The nested scope really re-baked: small's corner is not the default (`full`) band's.
    const dflt = mounted(<Card>B</Card>, { theme: {} });
    expect(computed(small, "border-top-left-radius")).not.toBe(
      computed(dflt, "border-top-left-radius"),
    );
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
  it("selectivity: an in-flow card resolves SOLID at every theme material (lab port 2026-08-17)", () => {
    // The 2026-08-17 split of the old "a card takes the app's material without being told"
    // law. An in-flow card sits on the page's calm ground, where glass blurs nothing and
    // still pays a full backdrop readback — so by default it renders solid at EVERY theme
    // material: no data-material stamp, no filter, the opaque seal. The theme's material is
    // not gone; it is expressed only where a backdrop can exist (see the law below).
    for (const m of GLASS_MATERIALS) {
      const plain = mounted(<Card>B</Card>, { theme: { material: m } });
      expect(plain.dataset["material"], `${m}: an in-flow card expressed glass`).toBeUndefined();
      expect(computed(plain, "backdrop-filter"), `${m}: an in-flow card filters`).toBe("none");
      expect(
        computed(plain, "background-color"),
        `${m}: an in-flow card lost its seal`,
      ).toBe(colorOn(plain, "var(--color-surface)"));
    }
  });

  it("backdrop is the placement fact that opts into the theme's material — and the prop refusal stands", () => {
    // `backdrop` (lab port 2026-08-17) states a PLACEMENT — this card sits over content
    // the page makes hostile — and takes the theme's material exactly as Card used to.
    const glass = mounted(<Card backdrop>B</Card>, { theme: { material: "thick" } });
    expect(glass.dataset["material"]).toBe("thick");
    expect(computed(glass, "backdrop-filter")).toContain("blur(");
    // It is never a material CHOICE: over content in a solid app there is still no glass,
    // because the material is the theme's alone.
    const solid = mounted(<Card backdrop>B</Card>, { theme: { material: "solid" } });
    expect(solid.dataset["material"]).toBeUndefined();
    expect(computed(solid, "backdrop-filter")).toBe("none");
    // @ts-expect-error — material is the Theme's; a card that could override it would be a
    // second home for the app's own identity (§12).
    void (<Card material="thin" />);
  });

  it("a nested Theme re-answers it, which is the ONLY per-subtree escape", () => {
    // The escape every other axis already has, and deliberately the same one: a subtree that
    // must differ says so with a Theme, not with a prop nobody can find later.
    // Both cards say `backdrop` (lab port 2026-08-17: in-flow cards are solid by
    // selectivity), so what differs between them is ONLY the nested Theme's re-answer.
    const host = render(
      <Theme material="regular">
        <Card id="outer" backdrop />
        <Theme material="solid">
          <Card id="inner" backdrop />
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
    // The root pane states `backdrop` (lab port 2026-08-17, selectivity); the members
    // deliberately do NOT — the pane context is what resolves them, and a glass pane above
    // resolves a member on-glass whether or not it claims a placement of its own.
    const host = mounted(
      <Card id="l1" backdrop>
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
    // The inner card needs BOTH escapes since the lab port (2026-08-17): the nested Theme
    // resets the solid pane's scope, and `backdrop` states the placement that lets it
    // express the nested theme's glass — without it, selectivity would render it solid and
    // this law could not tell "the scope stood it down" from "nobody opted in".
    const host = mounted(
      <Card id="outer">
        <Theme material="thin">
          <Card id="inner" backdrop />
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
    // `backdrop` since the lab port (2026-08-17): an in-flow card is solid by selectivity,
    // so a law about the glass ladder must state the placement that expresses it.
    const thin = mounted(<Card backdrop>B</Card>, { theme: { material: "thin" } });
    const regular = mounted(<Card backdrop>B</Card>, { theme: { material: "regular" } });
    const thick = mounted(<Card backdrop>B</Card>, { theme: { material: "thick" } });
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
    // backdrop: selectivity (lab port 2026-08-17) — an in-flow card would be solid here.
    const thin = mounted(<Card backdrop>B</Card>, { theme: { material: "thin" } });
    expect(computed(thin, "background-color")).toBe(
      colorOn(thin, "color-mix(in srgb, var(--color-surface) var(--material-thin-alpha), transparent)"),
    );
    expect(computed(thin, "background-color")).not.toMatch(/^rgb\(/);
  });

  it("a plain card nested in a glass card keeps its seal — the derived fill does not inherit", () => {
    // The outer pane opts over content (lab port 2026-08-17, selectivity); the inner one is
    // the pane's MEMBER and stays plain — the glass scope, not a prop, is what resolves it.
    const outer = mounted(
      <Card backdrop>
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

  it("the elevated world dresses the shell; flat must now be ASKED for; no Card API exists (§5, §10)", () => {
    // depth defaults to "elevated" since the lab port (2026-08-17) — the lab has no flat
    // world — so a law that needs flat behavior pins the theme explicitly (the 2026-08-09
    // radius-default precedent: eleven default-implicit laws learned the same lesson).
    const flat = mounted(<Card>B</Card>, { theme: { depth: "flat" } });
    // Flat is a NO-OP list, not `none` (lab port 2026-08-17): the solid seat pool is DEAD
    // (config pool.solid = "0 0 0 0 transparent" — paired with the contact shadow it drew a
    // doubled bottom line), so flat resolves two no-op layers, visually nothing.
    const seat = document.createElement("div");
    seat.style.boxShadow = "var(--material-pool-solid), 0 0 0 0 transparent";
    flat.append(seat);
    expect(computed(flat, "box-shadow")).toBe(computed(seat, "box-shadow"));
    seat.remove();
    const el = mounted(<Card>B</Card>, { theme: { depth: "elevated" } });
    // Depth IS the palette, derived through the ROLE (--surface-chrome), never a restated
    // row: the role moved rungs twice (3 → 5 on 2026-08-16, 5 → 4 on 2026-08-17 — the lab's
    // solid card casts the single 24/64 drop, and row 5's stacked drops belong to glass), and
    // a law that names the row is the law that goes red on the next taste move.
    const probe = document.createElement("div");
    probe.style.boxShadow = "var(--material-pool-solid), var(--surface-chrome)";
    el.append(probe);
    expect(computed(el, "box-shadow")).toBe(computed(probe, "box-shadow"));
    probe.remove();
    expect(computed(el, "box-shadow"), "the elevated world stopped casting").not.toBe(
      computed(flat, "box-shadow"),
    );
    // The worlds part ways at the BORDER since 2026-08-19: elevated is borderless (the
    // lab's pane — ring, pool and cast are its edge), while FLAT gets the hairline BACK.
    // "Light replaces line" has a premise, light; a flat outlined world declares all of it
    // away and an ordinary Card measured 1.026:1 against the page with no border and no
    // shadow — an invisible rectangle (audit 2026-08-18).
    expect(computed(el, "border-top-color"), "an elevated card is borderless").toBe("rgba(0, 0, 0, 0)");
    expect(computed(flat, "border-top-color"), "a flat card must draw SOME boundary").not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    expect(computed(flat, "border-top-color")).toBe(colorOn(flat, "var(--tone-border)"));
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
    // backdrop: an in-flow card is solid by selectivity (lab port 2026-08-17).
    const glass = mounted(<Card backdrop>B</Card>, {
      theme: { depth: "elevated", material: "thin" },
    });
    const flatGlass = mounted(<Card backdrop>B</Card>, {
      theme: { depth: "flat", material: "thin" },
    });
    const probe = document.createElement("div");
    // Pool + transmitted cast: the pane's own bottom shade rides in front of whatever the
    // world lets through (lab port 2026-08-17).
    probe.style.boxShadow = "var(--material-pool-surface), var(--surface-chrome-thin)";
    glass.append(probe);
    expect(computed(glass, "box-shadow")).toBe(computed(probe, "box-shadow"));
    probe.remove();
    expect(computed(glass, "box-shadow")).not.toBe("none");
    expect(computed(glass, "box-shadow")).not.toBe(computed(solid, "box-shadow"));
    // Flat means flat (lab port 2026-08-17, Kushagra): the pools ride the WORLD pointers now,
    // so flat stands down the pane's pool with the same stroke as its cast — the earlier
    // "matter survives the style switch" sentence is reversed, and flat glass resolves the
    // no-op layers the flat scope declares. Derived from those pointers, not restated.
    const flatProbe = document.createElement("div");
    flatProbe.style.boxShadow =
      "var(--kui-surface-pool, 0 0 0 0 transparent), var(--kui-surface-chrome-thin, 0 0 0 0 transparent)";
    flatGlass.append(flatProbe);
    expect(computed(flatGlass, "box-shadow")).toBe(computed(flatProbe, "box-shadow"));
    flatProbe.remove();
    // The catch: both worlds paint the pane's rim, and it is ONE recipe (lab port 2026-08-17:
    // the lifted variant is RETIRED — the ring owns the edge, so the rim no longer brightens
    // with depth). A remap that silently stopped resolving fails the not-none halves first.
    expect(computed(glass, "background-image")).not.toBe("none");
    expect(computed(flatGlass, "background-image")).not.toBe("none");
    expect(
      computed(glass, "background-image"),
      "the lifted rim returned — depth re-grew a second lighting recipe",
    ).toBe(computed(flatGlass, "background-image"));
  });

  it("follows appearance: the same Card resolves differently under a dark Theme", () => {
    const light = render(<Card>B</Card>);
    const darkCard = mounted(<Card>B</Card>, { theme: { appearance: "dark" } });
    expect(computed(darkCard, "color")).not.toBe(computed(light, "color"));
    // The FILL, not the border (lab port 2026-08-17): the resting border is transparent in
    // both modes — the pane is borderless — so the border channel can no longer witness the
    // appearance switch. The seal can, and always could.
    expect(computed(darkCard, "background-color")).not.toBe(computed(light, "background-color"));
  });
});

describe("the boundary (§3, §13)", () => {
  it("forwards the escapes and keeps its own classes", () => {
    // backdrop so the material stamp exists to forward (lab port 2026-08-17, selectivity).
    const el = mounted(
      <Card className="mine" style={{ maxWidth: "300px" }} backdrop>
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

  it("an interactive card is the plain card's own BOX — display computes block on all three elements (§10)", () => {
    // Closed 2026-08-19 (DECISIONS' open list since 2026-08-06): the interactive arm reset
    // seven UA properties and not `display`, so `<Card render={<a/>}>` computed `inline` —
    // and an inline box holding block children shatters into per-line fragments. Every
    // specimen to date sat in a grid, whose items are blockified for free, which is how the
    // suite stayed green while the pattern §10 names by hand was broken in plain flow; the
    // per-component preview's in-use demo left the grid and showed it the same day. The law
    // reads the COMPUTED display in plain flow on all three elements, because the claim is
    // "the same box whatever the element renders it".
    const plain = render(<Card>B</Card>);
    const button = render(<Card render={<button type="button" />}>B</Card>);
    const link = render(<Card render={<a href="/post" />}>B</Card>);
    expect(computed(plain, "display")).toBe("block");
    expect(computed(button, "display")).toBe("block");
    expect(computed(link, "display")).toBe("block");
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
    // Flat means no CAST; the seat (pool) is matter and stays — the probe is what flat
    // actually paints since the lab port (2026-08-17).
    const seatOf = (el: HTMLElement) => {
      const probe = document.createElement("div");
      probe.style.boxShadow = "var(--material-pool-solid), 0 0 0 0 transparent";
      el.append(probe);
      const v = computed(probe, "box-shadow");
      probe.remove();
      return v;
    };
    // Was a descendant selector with no reset, so the nested flat matched nothing and the
    // ancestor's rule still reached these cards. Every other axis escapes by declaration.
    const nested = render(
      <Theme depth="elevated">
        <Theme depth="flat">
          <Card id="probe" />
        </Theme>
      </Theme>,
    );
    const card = nested.querySelector<HTMLElement>("#probe")!;
    expect(computed(card, "box-shadow")).toBe(seatOf(card));
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
        // The outer pane opts over content (lab port 2026-08-17, selectivity). The inner
        // card resolves ON-GLASS now, and the claim narrows with it: on-glass means the
        // pane's member drops the pane's MACHINERY (fill alpha, no filter, no transmitted
        // cast of its own) — but the world's chrome still reaches it by inheritance, exactly
        // what the 2026-08-07 audit fix guaranteed, so it casts what the solid card beside
        // the pane casts.
        const nested = mounted(
          <Card backdrop>
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
      // backdrop (lab port 2026-08-17): without the placement fact the card is solid by
      // selectivity and this law would be measuring the wrong stand-down entirely.
      const sealed = mounted(<Card backdrop>B</Card>, {
        theme: { depth: "elevated", material: "thin" },
        select: ".kui-surface",
      });
      expect(computed(sealed, "backdrop-filter")).toBe("none"); // the pane really is sealed
      expect(computed(solid, "box-shadow")).not.toBe("none"); // and the world really is lit
      // Full cast, own pool: sealing stands the TRANSMISSION down (the cast returns to the
      // world's whole row), while the pool is the pane's own matter and stays.
      const probe = document.createElement("div");
      probe.style.boxShadow = "var(--material-pool-surface), var(--surface-chrome)";
      sealed.append(probe);
      expect(computed(sealed, "box-shadow")).toBe(computed(probe, "box-shadow"));
      probe.remove();
    } finally {
      await cdp().send("Emulation.setEmulatedMedia", { features: [] });
    }
  });

  it("the pane's light is ONE recipe in both worlds, with appearance inherited (lab port 2026-08-17)", () => {
    // Rewritten 2026-08-17. The law this replaces pinned the OPPOSITE: an elevated pane
    // glinted brighter (--material-*-rim-lifted) and a nested flat Theme had to escape back
    // to the resting rim (audit 2026-08-07). The lab port RETIRED the lifted variant — the
    // ::after ring owns the edge now, and the rim is one bloom+sheen recipe regardless of
    // depth — so the escape has nothing left to escape and the law pins the convergence
    // instead. appearance="inherit" stays: it is how apps/docs mounts its root, and it is
    // the path where the generated fallback (not an appearance scope) must resolve the rim.
    // backdrop on both cards: in-flow cards are solid by selectivity (lab port).
    const nested = render(
      <Theme appearance="inherit" depth="elevated" material="regular">
        <Card id="lifted" backdrop />
        <Theme depth="flat">
          <Card id="rested" backdrop />
        </Theme>
      </Theme>,
    );
    const lifted = computed(nested.querySelector("#lifted")!, "background-image");
    const rested = computed(nested.querySelector("#rested")!, "background-image");
    // Both worlds paint the glint — a rim that silently stopped resolving fails here first.
    expect(rested).not.toBe("none");
    expect(lifted).not.toBe("none");
    expect(lifted, "depth re-grew a second lighting recipe — the lifted rim is back").toBe(
      rested,
    );
    // And it is the GLASS recipe, not the seal's matte one — the convergence must not have
    // been reached by every pane falling back to the solid lighting.
    const solid = mounted(<Card />, {
      theme: { appearance: "inherit", depth: "elevated", material: "solid" },
      select: ".kui-surface",
    });
    expect(lifted).not.toBe(computed(solid, "background-image"));
  });
});

describe("high contrast leans on the glass, it does not unmake it (§7, §10)", () => {
  // The sentence has been in config since 2026-08-05 and the code stopped honouring it: the
  // rim was emptied under contrast="high", so a glass pane lost the grain, bloom and sheen
  // that make it read as a physical thing catching light, and kept only a flat pigment line.
  // Kushagra, from the playground (2026-08-20): "cheap and incorrect… it's not taste".
  //
  // Mounted rather than read off the stylesheet, because the token half was ALREADY law-
  // pinned — in the wrong direction, and confidently. What could not be faked is whether a
  // real pane still paints.
  for (const appearance of APPEARANCES) {
    it(`${appearance}: a glass pane keeps its light under contrast="high"`, () => {
      const pane = (contrast: "normal" | "high") =>
        mounted(<Card backdrop>Body</Card>, {
          theme: { appearance, contrast, material: "regular" },
          select: ".kui-surface",
        });
      const normal = pane("normal");
      const high = pane("high");
      // The rim is a background-image (grain / bloom / sheen). `none` is what emptying it
      // computed to, and it is the exact failure this law exists for.
      expect(computed(normal, "background-image"), "the pane paints no light at rest").not.toBe("none");
      expect(
        computed(high, "background-image"),
        "high contrast deleted the pane's light — the 2026-08-20 reversal is undone",
      ).not.toBe("none");
      // …and it is the SAME recipe, not a lesser one: the setting trades the edge, not this.
      expect(computed(high, "background-image")).toBe(computed(normal, "background-image"));
      // The trade it does make, asserted beside it so "keeps its light" cannot quietly become
      // "changes nothing": the veil thickens, and the edge becomes pigment.
      expect(computed(high, "background-color"), "the veil never thickened").not.toBe(
        computed(normal, "background-color"),
      );
      expect(computed(high, "border-top-color"), "no pigment boundary arrived").not.toBe(
        "rgba(0, 0, 0, 0)",
      );
    });
  }
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
    it(`${appearance}: a sealed pane trades its light for the tone hairline`, async () => {
      await emulate([{ name: "prefers-reduced-transparency", value: "reduce" }]);
      // The glass mount really asks for glass (theme material + backdrop since the lab
      // port 2026-08-17 — an in-flow card under a glass theme is otherwise solid and this
      // law compares a card with itself).
      const glass = mounted(<Card backdrop>Body</Card>, {
        theme: { appearance, material: "thin" },
        select: ".kui-surface",
      });

      // The negative control, and it is not optional: without it this law passes when the
      // media query never fires at all, which is the failure mode a media-emulating test is
      // most likely to have. No blur means the reduce block really is the one painting.
      expect(computed(glass, "backdrop-filter"), "the reduce block never fired").toBe("none");

      // A sealed pane has no light left to speak with — no ring, no veil — so the pigment
      // line is its boundary (audit 2026-08-18: the pre-fix chain handed it no edge at
      // all). Deliberately NOT the plain card's rest, which is borderless by design.
      expect(computed(glass, "border-top-color")).toBe(colorOn(glass, "var(--tone-border)"));
      expect(computed(glass, "border-top-color")).not.toBe("rgba(0, 0, 0, 0)");
    });
  }
});

describe("the interactive sources are live — a pressable card can actually step (§10, §19)", () => {
  // The look-audit blind spot's descendant: the interactive sources only exist because a
  // Card can be a button, and no resting-state law reads them. Read as the roles the
  // :hover/:active rules resolve, which is where a broken source shows up without
  // synthesising a pointer. Each must resolve, and differ from the rest — a hover that is
  // the rest is a press nobody can see.
  for (const appearance of APPEARANCES) {
    it(`${appearance}: the seal's hover and press steps resolve and differ from rest`, () => {
      const el = mounted(<Card>Body</Card>, { theme: { appearance }, select: ".kui-surface" });
      const rest = colorOn(el, "var(--color-surface)");
      for (const role of ["--color-surface-hover", "--color-surface-active"]) {
        const value = colorOn(el, `var(${role})`);
        expect(value, `${role} resolves to nothing`).not.toBe("");
        expect(value, `${role} is the resting seal — the step paints nothing`).not.toBe(rest);
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
    // backdrop: selectivity (lab port 2026-08-17) — an in-flow card resolves solid and
    // would honestly have no lens, which is not the absence this law is about.
    const glass = mounted(<Card backdrop>G</Card>, { theme: { material: "regular" } });
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
    // backdrop on the container only (lab port 2026-08-17): the inner card is the pane's
    // member and resolves on-glass, which never filters and so can carry no lens.
    const outer = mounted(
      <Card backdrop>
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

  it("convergence is now STRUCTURAL: an in-flow card over the calm bed IS the seal, at every material", () => {
    // Rewritten 2026-08-17 (lab port). The old law asserted glass and solid PAINT the same
    // lighting over calm ground; the lab's solid is matte (grain + one sheen, no bloom) while
    // glass keeps its full bloom+sheen, so paint-convergence is false BY DESIGN now. What
    // replaced it is selectivity: over calm ground an in-flow card does not become glass at
    // all — it resolves the solid look wholesale, so "material is invisible on a calm bed"
    // is enforced by the resolution, not by two recipes agreeing pixel for pixel.
    const solid = bed("solid");
    expect(computed(solid, "background-image"), "the seal has no lighting").not.toBe("none");
    for (const m of GLASS_MATERIALS) {
      const el = bed(m);
      expect(computed(el, "background-image"), `${m}: an in-flow card left the matte recipe`).toBe(
        computed(solid, "background-image"),
      );
      expect(computed(el, "background-color"), `${m}: the in-flow fill moved`).toBe(
        computed(solid, "background-color"),
      );
      expect(computed(el, "backdrop-filter"), `${m}: an in-flow card filters`).toBe("none");
      expect(computed(el, "box-shadow"), `${m}: the in-flow cast moved`).toBe(
        computed(solid, "box-shadow"),
      );
    }
  });

  it("what a pane OVER CONTENT changes: alpha, filter — and, by design now, the lighting", () => {
    // The other half, or "they converge" would be satisfied by material doing nothing at all.
    // Alpha and the backdrop-filter are still the only FUNCTIONAL differences over calm
    // ground; since the lab port (2026-08-17) the lighting differs too, by design — glass is
    // grain + bloom (radial) + sheen (linear), the solid slab is matte grain + one sheen,
    // no bloom. The bloom layer is the discriminator this law reads.
    const overBed = (m: "solid" | (typeof GLASS_MATERIALS)[number]) => {
      const host = render(
        <Theme material={m}>
          <div style={{ background: "var(--neutral-1)", padding: "24px" }}>
            <Card backdrop>Body</Card>
          </div>
        </Theme>,
      );
      return host.querySelector<HTMLElement>(".kui-surface")!;
    };
    const solid = overBed("solid");
    expect(computed(solid, "backdrop-filter")).toBe("none");
    expect(computed(solid, "background-image"), "the matte slab grew a bloom").not.toContain(
      "radial-gradient",
    );
    const glass = overBed("thick");
    expect(computed(glass, "backdrop-filter"), "glass stopped filtering").not.toBe("none");
    expect(computed(glass, "background-image"), "glass lost its bloom").toContain(
      "radial-gradient",
    );
    const alphaOf = (c: string) => (c.includes("/") ? parseFloat(c.slice(c.lastIndexOf("/") + 1)) : 1);
    expect(alphaOf(computed(solid, "background-color")), "the seal is not opaque").toBe(1);
    expect(alphaOf(computed(glass, "background-color")), "glass is opaque").toBeLessThan(1);
  });
});

describe("continuous curvature reaches the DEFAULT world (§6, 2026-08-17)", () => {
  it("an ordinary card under an ordinary Theme paints a squircle, radius unmoved", () => {
    // The law the carve-out bug proved was missing. The node laws asserted the squircle RULE
    // existed; nothing asked whether any surface a user actually renders resolves it — and
    // for a day none did, because a carve-out keyed on [data-radius="full"], which is the
    // DEFAULT radius. "The rule is in the stylesheet" and "the default world renders it" are
    // separated by exactly one selector, which is where this died.
    // Under a REAL default Theme — `theme: {}` is load-bearing, not decoration. The first
    // spelling omitted it, which mounts the card bare: no Theme, no [data-radius] ancestor,
    // and the carve-out this law exists to catch had nothing to match. It passed with the
    // bug re-added — the sabotage run is what caught the law, not the law the bug.
    const el = mounted(<Card>B</Card>, { theme: {}, select: ".kui-surface" });
    expect(computed(el, "corner-shape"), "the default world lost the squircle").toBe("squircle");
    // The drawn corner is the band's pick TIMES the corner knob (1.613 since 2026-08-17,
    // Kushagra: match the lab): the band is authored as arcs and the squircle needs the
    // bigger number for the same visual weight — the default card draws the lab's 64
    // (40 × 1.613). Derived, never restated: the probe reads the same token and the same
    // knob the rule does, so a re-priced band moves both sides of this assertion.
    const probe = document.createElement("div");
    el.append(probe);
    probe.style.borderRadius = "calc(var(--radius-surface-3) * var(--kui-corner-k, 1))";
    expect(computed(el, "border-radius")).toBe(computed(probe, "border-radius"));
    probe.remove();
  });
});


/* ── An interactive surface MOVES (§8, 2026-08-17) ────────────────────────────────────────
 *
 * Card-as-button shipped 2026-08-03 with the control layer's state COLOURS and, when the
 * motion system landed six days later against `.kui-control`, none of its motion. Measured
 * before the fix: `transition-duration: 0s` and `translate: none` on a card whose fill was
 * stepping white-to-grey under the pointer. Nothing failed, because no law here read a clock.
 *
 * Stillness is the DEFAULT in these laws and that is deliberate: with the harness's transitions
 * off, a hovered or pressed value lands on the frame it is asked for, so what is read is the
 * rule the browser resolved rather than the first sample of a running spring. The two laws that
 * are about the clocks themselves opt back in — and the first draft did not, which is why a
 * correct hover rise measured 0px and looked like a missing rule.
 */
describe("an interactive surface moves like a control, at its own scale (§8, §10)", () => {
  /** A card-as-button, and a plain Card beside it as the negative control. */
  function pair() {
    const host = render(
      <Theme>
        <Card render={<button type="button" />}>Pressable</Card>
        <Card>Inert</Card>
      </Theme>,
    );
    const [pressable, inert] = [...host.querySelectorAll<HTMLElement>(".kui-surface")];
    if (!pressable || !inert) throw new Error("both cards must mount");
    return { host, pressable, inert };
  }

  it("its paint and its geometry are on the control layer's two clocks", () => {
    const { pressable, inert } = pair();
    inMotion();
    const properties = computed(pressable, "transition-property")
      .split(",")
      .map((v) => v.trim());
    for (const channel of ["background-color", "border-color", "color", "translate", "scale"]) {
      expect(properties, `${channel} must be on the list`).toContain(channel);
    }
    // TWO clocks, and they are the control layer's own values — read resolved, never as the
    // token names they were written with, which is the whole reason this was wrong for six
    // days with the colours correct.
    const raw = (name: string) => getComputedStyle(pressable).getPropertyValue(name).trim();
    // Milliseconds either way: `transition-duration` computes to seconds and the token is
    // written in ms, and comparing the STRINGS was the first spelling — a law that fails on a
    // unit rather than on a value.
    const ms = (v: string) => (v.endsWith("ms") ? parseFloat(v) : parseFloat(v) * 1000);
    const durations = computed(pressable, "transition-duration").split(",").map((v) => ms(v.trim()));
    expect(new Set(durations).size, `two clocks, not one: ${durations.join(" ")}`).toBe(2);
    expect(durations.slice(0, 3), "paint eases").toEqual(Array(3).fill(ms(raw("--motion-hover-out"))));
    expect(durations.slice(3), "geometry springs").toEqual(Array(2).fill(ms(raw("--motion-rise"))));
    expect(raw("--kui-sf-move-ease"), "at rest the geometry recovers, it does not strike").toBe(
      raw("--motion-spring-lively"),
    );
    // A card is a card until you point at it: an inert one has no state machine to clock.
    expect(computed(inert, "transition-duration"), "a plain card does not move").toBe("0s");
    expect(computed(inert, "translate"), "nor sit on a transform").toBe("none");
  });

  it("it rises to meet the pointer, by the SAME pixel a button uses", async () => {
    const { pressable } = pair();
    const { userEvent } = await import("vitest/browser");
    expect(computed(pressable, "translate"), "at rest it sits still").toBe("0px");
    await userEvent.hover(pressable);
    // The applied value, not the token: one pixel UP. Shared with the button on purpose —
    // an absolute distance means the same thing on both boxes, unlike a ratio.
    const travel = parseFloat(lengthOn(pressable, "--hover-travel"));
    expect(travel, "calibration: the rise must be a real distance").toBeGreaterThan(0);
    expect(computed(pressable, "translate")).toBe(`0px ${-travel}px`);
    await userEvent.unhover(pressable);
  });

  it("it sinks and shrinks under a real press, by its OWN distances", async () => {
    const { pressable } = pair();
    const box = pressable.getBoundingClientRect();
    // HELD, through CDP: `:active` cannot be forced from script, and a click's press state is
    // over before anything can read it. Pressed and never released, so the state is live for
    // the reads below — released in the same law so the pointer does not leak into the next
    // file (the 2026-08-10 parked-pointer lesson).
    const at = { x: Math.round(box.left + box.width / 2), y: Math.round(box.top + box.height / 2) };
    await cdp().send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...at });
    expect(pressable.matches(":active"), "the press must be live or every read below is vacuous").toBe(true);

    const sink = parseFloat(lengthOn(pressable, "--press-travel-surface"));
    const scale = numberOn(pressable, "--press-scale-surface");
    expect(computed(pressable, "translate"), "down toward the page").toBe(`0px ${sink}px`);
    expect(computed(pressable, "scale"), "and smaller with it").toBe(String(scale));
    // The press's own clock, restated on the state so the RELEASE takes the base clock back.
    const raw = (name: string) => getComputedStyle(pressable).getPropertyValue(name).trim();
    expect(raw("--kui-sf-move"), "down hard and fast").toBe(raw("--motion-press"));
    expect(raw("--kui-sf-move-ease")).toBe(raw("--motion-spring-stiff"));
    expect(raw("--kui-sf-paint"), "and the colour lands on the first frame of a tap").toBe("0s");

    await cdp().send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...at });
  });

  it("the surface's distances are its own, and the SCALE is the one that could not be shared", () => {
    const { pressable } = pair();
    const surfaceScale = numberOn(pressable, "--press-scale-surface");
    const controlScale = numberOn(pressable, "--press-scale");
    const surfaceSink = parseFloat(lengthOn(pressable, "--press-travel-surface"));
    const controlSink = parseFloat(lengthOn(pressable, "--press-travel"));
    expect(surfaceScale, "a surface shrinks LESS than a button").toBeGreaterThan(controlScale);
    expect(surfaceScale, "but it does shrink").toBeLessThan(1);
    expect(surfaceSink, "and sinks less far").toBeLessThan(controlSink);
    expect(surfaceSink, "though it does sink").toBeGreaterThan(0);
    /**
     * The claim the number was chosen to make, stated as arithmetic rather than as a comment:
     * scale is RELATIVE, so sharing the button's 0.975 would move a 400px card's edge 5px
     * against the button's 0.8 and read as the page flexing. These are matched on EDGE
     * MOVEMENT, which is what the eye reads — within a pixel of each other.
     */
    const cardEdge = (400 * (1 - surfaceScale)) / 2;
    const buttonEdge = (64 * (1 - controlScale)) / 2;
    expect(Math.abs(cardEdge - buttonEdge), `card ${cardEdge}px vs button ${buttonEdge}px`).toBeLessThan(1);
    // And the calibration that makes the law non-vacuous: the SHARED factor must fail it.
    const shared = (400 * (1 - controlScale)) / 2;
    expect(Math.abs(shared - buttonEdge), "sharing the button's factor must be visibly wrong").toBeGreaterThan(3);
  });

  it("its ring LANDS, the way a button's does and a field's cannot (§8)", async () => {
    const { pressable } = pair();
    inMotion();
    // The hook, not the animation: the reduced-motion stand-down shares this selector, which is
    // the 2026-08-10 `:not()` lesson made structural.
    expect(getComputedStyle(pressable).getPropertyValue("--kui-sf-ring"), "the arrival is declared").toMatch(
      /kui-ring-land/,
    );
    // Reached by KEYBOARD, and that is not ceremony: on a button Chrome matches
    // `:focus-visible` only when the last interaction was a key — `el.focus()` alone leaves it
    // false, so a law written that way would assert nothing and report the ring missing.
    const { userEvent } = await import("vitest/browser");
    await userEvent.tab();
    expect(document.activeElement, "the card must be the first tab stop").toBe(pressable);
    expect(pressable.matches(":focus-visible"), "the ring must be live to read it").toBe(true);
    expect(computed(pressable, "animation-name"), "and it runs").toBe("kui-ring-land");
    expect(parseFloat(computed(pressable, "animation-duration")) * 1000).toBe(
      parseFloat(getComputedStyle(pressable).getPropertyValue("--motion-ring")),
    );
    // The one shared arrival, not a second one: the keyframes live in recipes.css.
    expect(computed(pressable, "outline-style"), "and the ring itself is drawn").toBe("solid");
  });

  it("stillness reaches every part of it (§8)", async () => {
    const { pressable } = pair();
    inMotion();
    // Calibration first: without it, the harness's own stillness would make this law pass
    // against a surface that never moved at all.
    expect(computed(pressable, "transition-duration"), "it must be moving to be stilled").not.toBe("0s");
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    expect(computed(pressable, "transition-duration"), "no clocks").toBe("0s");
    const { userEvent } = await import("vitest/browser");
    await userEvent.tab();
    expect(computed(pressable, "animation-name"), "and no arrival").toBe("none");
    await cdp().send("Emulation.setEmulatedMedia", { features: [] });
  });
});

describe("the render escape stays inside the pane scope (§5, §10 — audit 2026-08-18)", () => {
  it("a control kept by the render target resolves on-glass, exactly like a children control", () => {
    // The scope used to wrap only `children`, and composeRender keeps the render TARGET's
    // own children when the caller passes none — so those children rendered outside any
    // pane scope and a Button inside `<Card render={<article><Button/></article>}/>` on a
    // glass card painted a SECOND backdrop-filter over the card's (measured: full glass,
    // its own lens, versus on-glass for the identical markup spelled with children). The
    // scope now wraps the composed result, and the two spellings must be one answer.
    const host = render(
      <Theme material="regular">
        <Box backdrop>
          <Card
            render={
              <article>
                <Button>Read more</Button>
              </article>
            }
          />
        </Box>
      </Theme>,
    );
    const viaRender = host.querySelector("button")!;
    expect(viaRender.dataset.material, "the render path escaped the pane scope").toBe("on-glass");
    expect(computed(viaRender, "backdrop-filter"), "a second filter inside the pane").toBe("none");

    const twin = render(
      <Theme material="regular">
        <Box backdrop>
          <Card>
            <article>
              <Button>Read more</Button>
            </article>
          </Card>
        </Box>
      </Theme>,
    );
    const viaChildren = twin.querySelector("button")!;
    expect(viaRender.dataset.material).toBe(viaChildren.dataset.material);
  });
});

describe("contrast=high reaches a GLASS pane — pigment replaces the ring (§7, §10, 2026-08-19)", () => {
  it.each(APPEARANCES)("%s: the HC glass edge is the tone hairline, and the ring yields", (appearance) => {
    // Measured 2026-08-18: an HC glass card had border rgba(0,0,0,0), the conic ring
    // painting byte-identical to standard, and 1.000:1 edge contrast on every side — the
    // fallback the sheet's comment relied on was unreachable. The repair is two halves,
    // read together here: the element-scoped HC arm hands the pane var(--tone-border) where
    // the tone resolves, and --material-ring-opacity: 0 stands the light edge down.
    const at = (contrast: "normal" | "high") =>
      mounted(<Card backdrop>B</Card>, {
        theme: { material: "regular", appearance, contrast },
        select: ".kui-surface",
      });
    const normal = at("normal");
    expect(computed(normal, "border-top-color"), "standard glass stays borderless").toBe(
      "rgba(0, 0, 0, 0)",
    );
    expect(getComputedStyle(normal, "::after").opacity).toBe("1");
    const high = at("high");
    expect(computed(high, "border-top-color"), "HC must draw a pigment edge").not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    expect(computed(high, "border-top-color")).toBe(tokenOn(high, "--tone-border"));
    expect(getComputedStyle(high, "::after").opacity, "the ring must yield to pigment").toBe("0");
  });
});

/**
 * The corner is a SHAPE, and `bleed` is the child's half of it (§3, §10, 2026-08-20).
 *
 * These two shipped together on purpose and neither is complete alone: without clipping a
 * picture reaching the edge squares off the corner it sits in, and without `bleed` nothing
 * can reach the edge in the first place — the padding lives on the surface, margin only took
 * scale indexes, and no arithmetic in the system could subtract one from the other. It was
 * the one ordinary card layout this library could not build.
 */
describe("a pane holds what it contains, and a child may reach its edge (§3, §10, 2026-08-20)", () => {
  it("every surface clips, and clips rather than hides", () => {
    // `hidden` would pass a naive "does it clip" law and be wrong in the way that matters: a
    // hidden box is a scroll container, which is how a select's panel came to slide its own
    // contents under a growing frame (2026-08-17). The keyword is the assertion.
    expect(computed(render(<Card>Body</Card>), "overflow")).toBe("clip");
  });

  it("a bled child sits exactly on the pane's inner edge, at every size", () => {
    for (const size of ["1", "2", "3", "4"] as const) {
      const card = mounted(
        <Card size={size}>
          <Box mt="bleed" mx="bleed" data-testid="bled">
            Picture
          </Box>
        </Card>,
        { theme: {}, select: ".kui-card" },
      );
      const pane = card.getBoundingClientRect();
      const bled = within(card, "[data-testid='bled']").getBoundingClientRect();
      // The inner edge is the PADDING box — a bleed cancels padding, never the border, so the
      // hairline contrast="high" restores still draws around the picture rather than under it.
      const border = parseFloat(computed(card, "border-top-width"));
      expect(bled.left - pane.left, `size ${size}: the inline start edge`).toBeCloseTo(border, 1);
      expect(pane.right - bled.right, `size ${size}: the inline end edge`).toBeCloseTo(border, 1);
      expect(bled.top - pane.top, `size ${size}: the block start edge`).toBeCloseTo(border, 1);
      // …and the pane still pads, which is what makes the negative margin a real cancellation
      // rather than a card that never padded. Falsified by deleting `padding` from the base
      // rule: the bleed then pulls the child OUT of the pane and this line is what catches it.
      expect(parseFloat(computed(card, "padding-top"))).toBeGreaterThan(0);
    }
  });

  it("an unbled sibling is untouched — the child states this, the card never does", () => {
    const card = mounted(
      <Card size="3">
        <Box data-testid="plain">Body</Box>
      </Card>,
      { theme: {}, select: ".kui-card" },
    );
    const pane = card.getBoundingClientRect();
    const plain = within(card, "[data-testid='plain']").getBoundingClientRect();
    const inset = parseFloat(computed(card, "padding-left")) + parseFloat(computed(card, "border-left-width"));
    expect(plain.left - pane.left).toBeCloseTo(inset, 1);
  });

  it("outside any surface it computes a real zero, never a pull", () => {
    // The `0px` fallback, measured. Written bare — `calc(-1 * var(--kui-sf-p))` — the
    // declaration goes invalid at computed-value time and margin resets to its initial value,
    // which happens to be 0 too; this law cannot tell those apart and does not try. What it
    // forbids is the third outcome: a box that pulls itself sideways by some inherited number.
    const loose = mounted(<Box mx="bleed">Body</Box>, { theme: {}, select: ".kui-box" });
    expect(computed(loose, "margin-left")).toBe("0px");
    expect(computed(loose, "margin-right")).toBe("0px");
  });

  it("the NEAREST surface wins — a card inside a dialog bleeds to the card", () => {
    // --kui-sf-p is deliberately not registered `inherits: false`, which is the whole delivery
    // mechanism; the risk that buys is a child reading a pane it is not touching. It reads the
    // closest one, so nesting behaves: the outer pane's padding is a larger number, and taking
    // it would tear the inner child clean out of its own card.
    const outer = mounted(
      <Card size="4">
        <Card size="1" data-testid="inner">
          <Box mx="bleed" data-testid="bled">Row</Box>
        </Card>
      </Card>,
      { theme: {}, select: ".kui-card" },
    );
    const inner = within(outer, "[data-testid='inner']");
    const bled = within(outer, "[data-testid='bled']").getBoundingClientRect();
    const innerBox = inner.getBoundingClientRect();
    const border = parseFloat(computed(inner, "border-left-width"));
    expect(bled.left - innerBox.left).toBeCloseTo(border, 1);
    // …and the two paddings really do differ, or the assertion above is a coincidence.
    expect(parseFloat(computed(outer, "padding-left"))).toBeGreaterThan(
      parseFloat(computed(inner, "padding-left")),
    );
  });

  it("a clipping pane clears the focus ring in every cell it pads", () => {
    // The obligation clipping creates, checked where it is tightest. A control resting against
    // the inside of the padding paints its ring OUTSIDE its own border box; if the pane's
    // padding is shorter than that reach, the clip takes the ring's outer edge. The menu's
    // panel hit this in 2026-08-09 and answers it with a max() against these same tokens; the
    // surface band clears it outright, and this law is what keeps that true through a re-tune
    // of either the ring or the padding picks.
    for (const density of ["compact", "default", "comfortable"] as const) {
      for (const size of ["1", "2", "3", "4"] as const) {
        const card = mounted(<Card size={size}>Body</Card>, {
          theme: { density },
          select: ".kui-card",
        });
        const reach =
          parseFloat(lengthOn(card, "--focus-ring-width")) +
          parseFloat(lengthOn(card, "--focus-ring-offset"));
        expect(reach, "the ring must actually reach past a control's box").toBeGreaterThan(0);
        expect(
          parseFloat(computed(card, "padding-top")),
          `${density}/${size}: the clip would cut a child's ring`,
        ).toBeGreaterThanOrEqual(reach);
      }
    }
  });
});

/**
 * A scroll region inside a pane (§3, §10, 2026-08-20) — the shared surface layer's rule, so
 * its laws sit here beside `bleed`'s rather than in ScrollArea's file: nothing about a
 * scrollbar is under test, only what a PANE does to a scroller it contains directly.
 *
 * The claim in one sentence: the box is the pane's and the padding is the content's. Every
 * law below reads geometry off a mounted browser, because the whole mechanism is a cascade of
 * margins and paddings whose declared values are individually unremarkable and whose sum is
 * the thing that can be wrong.
 */
describe("a scroll region inside a pane (§3, §10, 2026-08-20)", () => {
  const ROWS = Array.from({ length: 14 }, (_, i) => `Row ${i + 1}`);
  const list = (
    <Box>
      {ROWS.map((r) => (
        <Box key={r} data-row={r} height="2rem">{r}</Box>
      ))}
    </Box>
  );
  /** The scroller's viewport, measured against the pane's PADDING box — the same reference
      the bleed laws use, because a bleed cancels padding and never the border. */
  const insets = (card: HTMLElement) => {
    const vp = within(card, ".kui-scroll-viewport");
    const c = card.getBoundingClientRect();
    const v = vp.getBoundingClientRect();
    const b = parseFloat(computed(card, "border-left-width"));
    return {
      top: v.top - c.top - b,
      right: c.right - v.right - b,
      bottom: c.bottom - v.bottom - b,
      left: v.left - c.left - b,
      scrolls: vp.scrollHeight > vp.clientHeight,
    };
  };

  it("a pane's only child fills its box, and the content keeps the pane's own padding", () => {
    // The minimal composition — a card that IS a list — at every size, so a re-tuned padding
    // pick cannot make one cell disagree. The height is the call site's one word.
    for (const size of ["1", "2", "3", "4"] as const) {
      const card = mounted(
        <Card size={size} style={{ height: "12rem" }}>
          <ScrollArea>{list}</ScrollArea>
        </Card>,
        { theme: {}, select: ".kui-card" },
      );
      const i = insets(card);
      for (const side of ["top", "right", "bottom", "left"] as const) {
        expect(i[side], `size ${size}: the scroller must reach the pane's ${side} edge`).toBeCloseTo(0, 1);
      }
      expect(i.scrolls, `size ${size}: it must actually scroll, or this proves nothing`).toBe(true);
      // …and the content is still inset by exactly the pane's padding, which is the half that
      // makes this different from simply deleting the padding.
      const pad = parseFloat(lengthOn(card, `--surface-p-${size}`));
      expect(pad, "the pane must have padding to move").toBeGreaterThan(0);
      const first = within(card, "[data-row='Row 1']").getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const b = parseFloat(computed(card, "border-left-width"));
      expect(first.left - c.left - b, `size ${size}: the content keeps the pane's inset`).toBeCloseTo(pad, 1);
    }
  });

  it("with neighbours only the INLINE axis is reclaimed, and their gap survives", () => {
    // The DOM is what decides which block edges bleed: this scroller touches neither the
    // pane's top nor its bottom, so it takes neither — and a law that only ever mounted the
    // only-child case would be a law about the special case wearing the general one's name.
    const card = mounted(
      <Card size="3" render={<Stack gap="4" />} style={{ height: "18rem" }}>
        <Box data-testid="head" height="2rem">Head</Box>
        <ScrollArea>{list}</ScrollArea>
        <Box data-testid="foot" height="2rem">Foot</Box>
      </Card>,
      { theme: {}, select: ".kui-card" },
    );
    const i = insets(card);
    expect(i.left, "the inline axis is reclaimed").toBeCloseTo(0, 1);
    expect(i.right, "the inline axis is reclaimed").toBeCloseTo(0, 1);
    expect(i.top, "a scroller with something above it does not reach the top").toBeGreaterThan(10);
    expect(i.bottom, "…nor the bottom, with something below it").toBeGreaterThan(10);
    expect(i.scrolls).toBe(true);
    // The gap is the composition's, and reclaiming a block edge here would have eaten it.
    const head = within(card, "[data-testid='head']").getBoundingClientRect();
    const area = within(card, ".kui-scroll-area").getBoundingClientRect();
    const gap = parseFloat(computed(card, "row-gap"));
    expect(gap, "the pane must have a gap for this to be about").toBeGreaterThan(0);
    expect(area.top - head.bottom, "the neighbour's gap survives").toBeCloseTo(gap, 1);
  });

  it("its content may be wider than it is too — both bars, both inside the pane", async () => {
    // The law the first cut did not have, and the defect it would have caught (2026-08-20,
    // Kushagra by eye). The only-child pane becomes the flex container, and DIRECTION decides
    // which axis `flex: 1` sizes and which `min-*: auto` floors. As a row, `flex: 1` sized the
    // width while `min-inline-size: auto` refused to go below the content's min-content — so a
    // wide list made the scroller as wide as its content, the pane clipped it, and BOTH bars
    // disappeared: the horizontal one because nothing overflowed any more, the vertical one
    // because it was drawn at the scroller's right edge, outside the pane.
    //
    // The INPUT is the whole point: content that overflows only vertically cannot tell a row
    // from a column, so a law mounted on that content is a law about the special case.
    const card = mounted(
      // The pane is narrowed on purpose: a full-width mount is wider than the content, and a
      // law whose "wide" content is not wide is a law that measures nothing.
      <Box width="24rem">
        <Card size="3" style={{ height: "13rem" }}>
          <ScrollArea>
            <Box width="48rem">{list}</Box>
          </ScrollArea>
        </Card>
      </Box>,
      { theme: {}, select: ".kui-card" },
    );
    const vp = within(card, ".kui-scroll-viewport");
    expect(vp.scrollWidth, "the content must actually be wider").toBeGreaterThan(vp.clientWidth);
    expect(vp.scrollHeight, "…and taller").toBeGreaterThan(vp.clientHeight);
    // Base UI mounts a bar on the frame after it measures its viewport.
    await until(() => card.querySelectorAll(".kui-scrollbar").length === 2, 1500);
    const bars = Array.from(card.querySelectorAll<HTMLElement>(".kui-scrollbar"));
    expect(bars.length, "an overflow on each axis owes a bar on each axis").toBe(2);
    const c = card.getBoundingClientRect();
    for (const bar of bars) {
      const r = bar.getBoundingClientRect();
      const orientation = bar.getAttribute("data-orientation");
      expect(r.right, `the ${orientation} bar is drawn outside the pane`).toBeLessThanOrEqual(c.right + 1);
      expect(r.bottom, `the ${orientation} bar is drawn outside the pane`).toBeLessThanOrEqual(c.bottom + 1);
    }
  });

  it("first-but-not-last and last-but-not-first — the cells where the two selectors DISAGREE", () => {
    // The audit's own finding about these laws (2026-08-20): every other law here mounts either
    // the only-child case (first AND last true) or head/scroller/foot (both false), so the
    // fixture could not tell this spelling from a wrong `:where(:first-child, :last-child)`
    // one — a law about the general case built on an input where the general case and the
    // special case give the same answer. These are the two inputs where they must differ.
    const pane = (children: React.ReactNode) =>
      mounted(
        <Card size="3" render={<Stack gap="4" />} style={{ height: "18rem" }}>{children}</Card>,
        { theme: {}, select: ".kui-card" },
      );
    const foot = <Box key="f" data-testid="foot" height="2rem">Foot</Box>;
    const head = <Box key="h" data-testid="head" height="2rem">Head</Box>;

    // FIRST but not last: reclaims the top, must NOT reclaim the bottom.
    const top = pane([<ScrollArea key="s">{list}</ScrollArea>, foot]);
    const ti = insets(top);
    expect(ti.top, "a scroller against the pane's top takes it").toBeCloseTo(0, 1);
    expect(ti.bottom, "…and must not take the bottom, where its neighbour is").toBeGreaterThan(10);
    const tv = within(top, ".kui-scroll-viewport");
    expect(parseFloat(computed(tv, "padding-top")), "the side that bled must pad").toBeGreaterThan(0);
    expect(parseFloat(computed(tv, "padding-bottom")), "the side that did not bleed must not pad").toBe(0);

    // LAST but not first: the mirror.
    const bottom = pane([head, <ScrollArea key="s">{list}</ScrollArea>]);
    const bi = insets(bottom);
    expect(bi.bottom, "a scroller against the pane's bottom takes it").toBeCloseTo(0, 1);
    expect(bi.top, "…and must not take the top").toBeGreaterThan(10);
    const bv = within(bottom, ".kui-scroll-viewport");
    expect(parseFloat(computed(bv, "padding-bottom"))).toBeGreaterThan(0);
    expect(parseFloat(computed(bv, "padding-top"))).toBe(0);
  });

  it("a pane sized with `max-height` scrolls exactly as one sized with `height`", () => {
    // The audit's worst finding (2026-08-20). `max-block-size: 100%` on the viewport cannot
    // resolve against an indefinite parent, so a `max-height` pane handed the viewport its
    // CONTENT's height: it never scrolled, drew no bar, and `overflow: clip` removed the
    // overflow in silence. `height` worked, which is what made it a trap rather than a bug
    // anyone would find. The viewport takes a flex height now, which needs no definite parent.
    const of = (style: React.CSSProperties) =>
      mounted(
        <Box width="24rem">
          <Card size="3" style={style}>
            <ScrollArea>{list}</ScrollArea>
          </Card>
        </Box>,
        { theme: {}, select: ".kui-card" },
      );
    const fixed = of({ height: "10rem" });
    const capped = of({ maxHeight: "10rem" });
    for (const [name, card] of [["height", fixed], ["max-height", capped]] as const) {
      const vp = within(card, ".kui-scroll-viewport");
      expect(vp.scrollHeight, `${name}: the content must overflow, or this proves nothing`)
        .toBeGreaterThan(vp.clientHeight);
      expect(
        card.getBoundingClientRect().height,
        `${name}: the pane must be capped`,
      ).toBeCloseTo(160, 0);
    }
    // …and the two agree, which is the actual claim.
    expect(within(capped, ".kui-scroll-viewport").clientHeight).toBe(
      within(fixed, ".kui-scroll-viewport").clientHeight,
    );
  });

  it("an ONLY child is safe in any direction — the arm that needs no guard", () => {
    // The rule assumes a column and cannot check (see surfaces.css). This arm is the part that
    // needs no assumption: an only child touches all four of the pane's edges whatever the axis,
    // so the same margins are right in a row, a column and a grid. Mounted in all three, because
    // a law that only mounts the column would be a law about the case the rule already assumes.
    for (const [name, render_] of [
      ["column", <Stack />],
      ["row", <Flex />],
      ["grid", <Grid columns="1fr" />],
    ] as const) {
      const card = mounted(
        <Box width="24rem">
          <Card size="3" render={render_} style={{ height: "12rem" }}>
            <ScrollArea>{list}</ScrollArea>
          </Card>
        </Box>,
        { theme: {}, select: ".kui-card" },
      );
      const i = insets(card);
      for (const side of ["top", "right", "bottom", "left"] as const) {
        expect(i[side], `${name}: the only child reaches the pane's ${side} edge`).toBeCloseTo(0, 1);
      }
      expect(i.scrolls, `${name}: and it scrolls`).toBe(true);
      const vp = within(card, ".kui-scroll-viewport");
      expect(parseFloat(computed(vp, "padding-left")), `${name}: content keeps the inset`).toBeGreaterThan(0);
    }
  });

  it("a plain pane with NEIGHBOURS becomes the column itself — nobody has to say so", () => {
    // Measured broken 2026-08-21, in the most ordinary composition the library has: a card
    // stating a height, holding a heading, a list and an action. `flex: 1` is inert in a block
    // container, so the scroller took its CONTENT's height — a 1440px viewport inside a 300px
    // pane, never a scroll container, no bar — and `overflow: clip` removed the Save button
    // from the page in silence. Every sibling law above mounts `render={<Stack/>}`, which is
    // already a column, so the fixture could not tell a working rule from a dead one: the
    // degenerate-fixture lesson (2026-08-20), and this is the input where they differ.
    const card = mounted(
      <Card size="3" style={{ height: "18rem" }}>
        <Box data-testid="head" height="2rem">Head</Box>
        <ScrollArea>{list}</ScrollArea>
        <Box data-testid="foot" height="2rem">Foot</Box>
      </Card>,
      { theme: {}, select: ".kui-card" },
    );
    expect(computed(card, "flex-direction"), "the system supplies the column").toBe("column");
    const i = insets(card);
    expect(i.scrolls, "the scroller must actually be a scroll container").toBe(true);
    // The claim is not really about the scroller: it is that the thing UNDER it survives.
    const foot = within(card, "[data-testid='foot']").getBoundingClientRect();
    const c = card.getBoundingClientRect();
    expect(foot.bottom, "the control below the list is inside its own pane").toBeLessThanOrEqual(c.bottom + 0.5);
  });

  it("…but a pane that STATED its layout is never overruled", () => {
    // The scope, and the half that keeps the rule honest. A row or grid pane holding a
    // scroller is the arrangement surfaces.css records as unsupported; supplying a column
    // there would silently contradict the call site's own word, which is worse than the
    // limit. The system answers only where nobody chose — `:not(.kui-box)` is that question,
    // not a spelling test: a hand-written `<Box display="flex">` card is excluded because it
    // chose, exactly as a `<Flex>` one is.
    for (const [name, render_, axis] of [
      ["row", <Flex direction="row" />, "row"],
      ["grid", <Grid columns="1fr 1fr" />, "row"],
    ] as const) {
      const card = mounted(
        <Box width="30rem">
          <Card size="3" render={render_} style={{ height: "18rem" }}>
            <Box height="2rem">Head</Box>
            <ScrollArea>{list}</ScrollArea>
          </Card>
        </Box>,
        { theme: {}, select: ".kui-card" },
      );
      expect(computed(card, "flex-direction"), `${name}: the call site's axis stands`).toBe(axis);
    }
  });

  it("a scroller that is not the pane's DIRECT child is untouched", () => {
    // The negative control, and the reason the rule is safe to make automatic: nesting is how
    // a composition opts out, and two scrollers side by side in a row are nobody's only child.
    const card = mounted(
      <Card size="3" style={{ height: "12rem" }}>
        <Box height="100%">
          <ScrollArea style={{ height: "100%" }}>{list}</ScrollArea>
        </Box>
      </Card>,
      { theme: {}, select: ".kui-card" },
    );
    const pad = parseFloat(computed(card, "padding-left"));
    expect(pad).toBeGreaterThan(0);
    const i = insets(card);
    expect(i.left, "a nested scroller answers to its own container").toBeCloseTo(pad, 1);
    expect(i.top).toBeCloseTo(pad, 1);
  });
});
