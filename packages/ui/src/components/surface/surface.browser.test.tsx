/**
 * Surface's laws, mounted (§10, 2026-08-20): a GROUND — what an object sits on, the seal's
 * opposite number. There is no surface-component stylesheet to test; what is asserted is that
 * the ground's fixed identity resolves through the shared layer, that it is measurably NOT a
 * card, and that the API has no axis to disagree with.
 */
import { describe, expect, it } from "vitest";

import { Theme } from "../../theme/theme.tsx";
import { APPEARANCES, colorOn, computed, mounted, tokenOn as lengthOn, within } from "../../test/browser.tsx";
import { Card } from "../card/card.tsx";
import { Box } from "../box/box.tsx";
import { Surface } from "./surface.tsx";

const tokenOn = (el: Element, name: string): string => colorOn(el, `var(${name})`);
const SIZES = ["1", "2", "3", "4"] as const;

describe("a ground, not an object (§10, 2026-08-20)", () => {
  it("paints the ground role and the family-less hairline, in both appearances", () => {
    for (const appearance of APPEARANCES) {
      const el = mounted(<Surface>Region</Surface>, { theme: { appearance }, select: ".kui-surface" });
      expect(computed(el, "background-color"), `${appearance}: the ground`).toBe(
        tokenOn(el, "--color-ground"),
      );
      // --color-border, not the tone fallback: a ground has no family. Read as a resolved
      // colour rather than a token name, and asserted equal to what a Separator paints — the
      // claim is that they are ONE hairline, which a name comparison could not establish.
      expect(computed(el, "border-top-color"), `${appearance}: the hairline`).toBe(
        tokenOn(el, "--color-border"),
      );
    }
  });

  it("is measurably NOT a card — different ground, and it does not cast", () => {
    // The protection, measured rather than asserted in prose. If a Surface ever resolved the
    // seal it could be composed into something that passes for a Card and then drifts.
    for (const appearance of APPEARANCES) {
      const ground = mounted(<Surface>Region</Surface>, { theme: { appearance }, select: ".kui-surface" });
      const card = mounted(<Card>Body</Card>, { theme: { appearance }, select: ".kui-surface" });
      expect(computed(ground, "background-color"), `${appearance}: a ground must not seal`).not.toBe(
        computed(card, "background-color"),
      );
      // And the DEFAULT world is elevated, so the card really is casting here — without this
      // the line below could pass in a world where nothing casts at all.
      expect(computed(card, "box-shadow"), `${appearance}: the card must cast, or this proves nothing`)
        .not.toBe("none");
      expect(computed(ground, "box-shadow"), `${appearance}: a hole in a plane throws no shadow`)
        .toBe(computed(mounted(<Card>Body</Card>, { theme: { appearance, depth: "flat" }, select: ".kui-surface" }), "box-shadow"));
    }
  });

  it("steps off the page, away from the mode's extreme — and never collapses onto it", () => {
    // The 2026-08-21 rule, replacing "a ground is darker than the page" (which this law used to
    // pin as "in dark the ground IS the page"). That rule was unreachable in dark: the page is
    // the ramp's last rung, so there was nothing below it and the ground was set equal to the
    // page — leaving the hairline and the pane sheen as the only things bounding a region.
    //
    // What the two modes share is not a direction, and claiming one is how the first spelling of
    // this law failed: a ground is NOT between the page and the card in light (page 0.987,
    // ground 0.967, card white). What they share is that a ground steps OFF the page, away from
    // whichever extreme that mode's page sits against — down from near-white in light, up from
    // near-black in dark — and is never equal to the page or to the card.
    //
    // Read as luminance off PAINTED colours, because the claim is an ordering and an ordering is
    // exactly what a token-name comparison cannot check.
    //
    // The channel slice is not hygiene: `color(display-p3 …)` carries a literal 3 in its own
    // colour-space name, so a bare digit scan reads it as the red channel — the calibration bug
    // this repo recorded on 2026-08-08, and which the first draft of this law made again.
    const lum = (c: string): number => {
      const n = c.match(/[\d.]+/g)!.map(Number);
      const ch = c.startsWith("color(") ? n.slice(1, 4) : n.slice(0, 3).map((x) => x / 255);
      return ch.reduce((a, b) => a + b, 0) / 3;
    };
    for (const appearance of APPEARANCES) {
      const ground = mounted(
        <Surface>
          <Card data-testid="held">Body</Card>
        </Surface>,
        { theme: { appearance }, select: ".kui-ground" },
      );
      const page = lum(colorOn(ground, "var(--color-page)"));
      const bed = lum(computed(ground, "background-color"));
      const card = lum(computed(within(ground, "[data-testid='held']"), "background-color"));
      // The collapse this rule exists to end, and its mirror.
      expect(bed, `${appearance}: a ground must not collapse onto the page`).not.toBeCloseTo(page, 4);
      expect(bed, `${appearance}: nor onto the card it holds`).not.toBeCloseTo(card, 4);
      // The direction, per mode — the half a "they differ" assertion would not catch.
      if (appearance === "dark") {
        expect(bed, "dark: the page is the floor, so a ground steps UP").toBeGreaterThan(page);
        expect(bed, "dark: …and stops short of the card").toBeLessThan(card);
      } else {
        expect(bed, "light: the page is white, so a ground steps DOWN").toBeLessThan(page);
        // 2026-08-25: the light page derives from the seal's rest, so card and page share one
        // white BY CONSTRUCTION and a card on the page separates by cast or hairline, never by
        // fill. The old assertion (card strictly lighter than page) pinned the #fcfcfc page.
        expect(card, "light: the card seals at the page's own white").toBeCloseTo(page, 4);
      }
    }
  });

  it("carries no pane lighting — and the cards on it keep theirs", () => {
    // A ground is a bed, not an object catching light, and it is never glass — so the rim's own
    // argument (a pane catches light; glass needs tooth) does not reach it. It was wearing one
    // by inheriting the base rule, and the cost was measured rather than argued: the grain is a
    // fixed white overlay, so it lifts a light ground by 0.002 and a dark one by 0.042 — 28x —
    // against tonal steps of 0.006 and 0.017. The texture was louder than the ladder it sat in.
    //
    // The SECOND half is the law that matters. The first repair stood the rim down through
    // `--kui-sf-light`, which is not registered `inherits: false`, so every pane INSIDE the
    // ground lost its lighting too — measured, the held card went bare. Stating the property
    // directly is what keeps it to the one box.
    for (const appearance of APPEARANCES) {
      const ground = mounted(
        <Surface>
          <Card data-testid="held">Body</Card>
        </Surface>,
        { theme: { appearance }, select: ".kui-ground" },
      );
      expect(computed(ground, "background-image"), `${appearance}: a bed carries no lighting`).toBe("none");
      const held = computed(within(ground, "[data-testid='held']"), "background-image");
      expect(held, `${appearance}: the card on it must keep its own`).not.toBe("none");
      // …and it is the real rim, not some other image: grain and sheen, both.
      expect(held.toLowerCase()).toContain("turbulence");
      expect(held).toContain("gradient");
      // The control that makes the inheritance claim mean something: a card with no ground
      // anywhere resolves the identical lighting.
      const bare = mounted(<Card>Body</Card>, { theme: { appearance }, select: ".kui-card" });
      expect(held, `${appearance}: identical to a card that never met a ground`).toBe(
        computed(bare, "background-image"),
      );
    }
  });

  it("out-rounds the card it holds, at every size", () => {
    // The mistake the builder's hand-painted canvas made: a size-2 corner around size-3 cards.
    // A container must out-round its contents or the nesting reads inside-out.
    for (const size of SIZES) {
      const root = mounted(
        <Surface size={size}>
          <Card size={size} data-testid="held">Body</Card>
        </Surface>,
        { theme: {}, select: ".kui-ground" },
      );
      const held = within(root, "[data-testid='held']");
      expect(
        parseFloat(computed(root, "border-top-left-radius")),
        `size ${size}: the container must out-round what it holds`,
      ).toBeGreaterThan(parseFloat(computed(held, "border-top-left-radius")));
    }
  });

  it("takes the container band, not the card's — the same relationship a dialog has", () => {
    // Shared values, not a second copy of the arithmetic. The PAINTED corner is the token
    // times --kui-corner-k (1.613 under squircle, 1 without), so the law reads the knob off
    // the element rather than pinning either number — the first spelling compared a raw token
    // against a painted 51.6px and failed for the wrong reason.
    for (const size of SIZES) {
      const ground = mounted(<Surface size={size}>x</Surface>, { theme: {}, select: ".kui-surface" });
      const k = parseFloat(computed(ground, "--kui-corner-k") || "1");
      const band = parseFloat(lengthOn(ground, `--radius-overlay-${size}`));
      expect(parseFloat(computed(ground, "border-top-left-radius")), `size ${size}`).toBeCloseTo(
        band * k,
        1,
      );
      // …and the band is genuinely rounder than the card's at the same index, or "the
      // container band" names nothing.
      const card = mounted(<Card size={size}>x</Card>, { theme: {}, select: ".kui-surface" });
      expect(band).toBeGreaterThan(parseFloat(lengthOn(card, `--radius-surface-${size}`)));
    }
  });

  it("has no axis to disagree with — a stamped tone or emphasis changes nothing", () => {
    // The API refuses them at the type level; this is the CSS half. A consumer reaching past
    // the type (or an ancestor stamping a family) must not be able to tint a ground.
    const plain = mounted(<Surface>x</Surface>, { theme: {}, select: ".kui-surface" });
    const hostile = mounted(
      <Theme>
        <Box data-tone="destructive" data-emphasis="loud">
          <Surface>x</Surface>
        </Box>
      </Theme>,
      { select: ".kui-ground" },
    );
    expect(computed(hostile, "background-color")).toBe(computed(plain, "background-color"));
    expect(computed(hostile, "border-top-color")).toBe(computed(plain, "border-top-color"));
  });

  it("gets the layer's own behaviour free: it clips, and a child can bleed to its edge", () => {
    const root = mounted(
      <Surface size="3">
        <Box mx="bleed" mt="bleed" data-testid="bled">Picture</Box>
      </Surface>,
      { theme: {}, select: ".kui-ground" },
    );
    expect(computed(root, "overflow")).toBe("clip");
    const pane = root.getBoundingClientRect();
    const bled = within(root, "[data-testid='bled']").getBoundingClientRect();
    const border = parseFloat(computed(root, "border-left-width"));
    expect(bled.left - pane.left).toBeCloseTo(border, 1);
    // …and it really is padding, or the bleed above proves nothing.
    expect(parseFloat(computed(root, "padding-top"))).toBeGreaterThan(0);
  });

  it("opens no material scope — a card inside a glass region is the card it would have been", () => {
    // A ground expresses no material, so it neither paints a veil nor stands its children
    // down. The card inside must resolve exactly what it resolves with no Surface present.
    // The held card is UNMARKED and reads the ambient `<Box backdrop>` region, which is the
    // only arrangement that can catch this. The first spelling gave it an explicit `backdrop`
    // prop — an explicit statement resolves the theme's material through any pane scope
    // (2026-08-19), so it passed with a GlassScope deliberately transplanted in. A scope reset
    // kills the REGION, so the region is what the law has to depend on.
    const wrapped = mounted(
      <Theme material="regular">
        <Box backdrop>
          <Surface>
            <Card data-testid="held">Body</Card>
          </Surface>
        </Box>
      </Theme>,
      { select: "[data-testid='held']" },
    );
    const bare = mounted(
      <Theme material="regular">
        <Box backdrop>
          <Card data-testid="held">Body</Card>
        </Box>
      </Theme>,
      { select: "[data-testid='held']" },
    );
    // The LENS id is unique per element by construction (a displacement map is built for one
    // box), so the raw strings can never match and comparing them compared the wrong thing.
    // Everything after the lens is the material, which is what this law is about.
    const material = (el: Element) => computed(el, "backdrop-filter").replace(/url\("[^"]*"\)\s*/, "");
    expect(material(wrapped), "the held card must be untouched").toBe(material(bare));
    expect(material(wrapped)).not.toBe("");
    expect(material(wrapped)).not.toBe("none");
    // And the ground itself never filters.
    const ground = within(
      mounted(
        <Theme material="regular">
          <Box backdrop>
            <Surface>x</Surface>
          </Box>
        </Theme>,
        {},
      ),
      ".kui-ground",
    );
    expect(computed(ground, "backdrop-filter")).toBe("none");
  });

  it("composes with a layout on ONE element, like every other surface", () => {
    const el = mounted(<Surface render={<Box display="flex" gap="3" />}>x</Surface>, {
      theme: {},
      select: ".kui-ground",
    });
    expect(computed(el, "display")).toBe("flex");
    expect(parseFloat(computed(el, "row-gap"))).toBeGreaterThan(0);
    // …while the surface keeps the two properties it owns (the measured 2026-08-20 collision).
    expect(parseFloat(computed(el, "padding-top"))).toBeGreaterThan(0);
    expect(computed(el, "overflow")).toBe("clip");
  });
});
