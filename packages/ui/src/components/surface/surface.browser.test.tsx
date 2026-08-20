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

  it("in dark the ground IS the page, and only the hairline bounds it", () => {
    // Stated in config as a consequence rather than discovered later, so it is pinned: a
    // ground is page-level and the cards are what lift. This is also why the edge cannot be
    // a prop — in dark it is the only thing that makes the region a region.
    const el = mounted(<Surface>Region</Surface>, { theme: { appearance: "dark" }, select: ".kui-surface" });
    expect(computed(el, "background-color")).toBe(tokenOn(el, "--neutral-1"));
    expect(computed(el, "border-top-color")).not.toBe(computed(el, "background-color"));
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
