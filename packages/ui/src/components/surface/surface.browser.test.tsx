/**
 * Surface's laws, mounted (§10, 2026-08-20): a GROUND — what an object sits on, the seal's
 * opposite number. There is no surface-component stylesheet to test; what is asserted is that
 * the ground's fixed identity resolves through the shared layer, that it is measurably NOT a
 * card, and that the API has no axis to disagree with.
 */
import { describe, expect, it } from "vitest";

import { Theme } from "../../theme/theme.tsx";
import { APPEARANCES, colorOn, computed, mounted, tokenOn as lengthOn, within } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Box } from "../box/box.tsx";
import { Surface } from "./surface.tsx";

const tokenOn = (el: Element, name: string): string => colorOn(el, `var(${name})`);
const SIZES = ["1", "2", "3", "4"] as const;

/** sRGB 0-1 plus alpha, from any computed colour the engine hands back.
 *
 * INSTRUMENT NOTE, copied deliberately with its scar (material.browser.test.tsx, 2026-08-24):
 * a bare `[\d.]+` sweep over `color(display-p3 0.98 …)` takes the **3 in display-p3** as the
 * red channel, and the tell is a score that is identical before and after a fix. The
 * colourspace keyword is stripped before any digit is read. */
function rgba(v: string): { r: number; g: number; b: number; a: number } {
  const inner = v.slice(v.indexOf("(") + 1, v.lastIndexOf(")"));
  const [main = "", alphaPart] = inner.split("/");
  const body = main.replace(/^\s*[a-z][\w-]*\s+/i, "");
  const nums = [...body.matchAll(/-?[\d.]+(?:e-?\d+)?/g)].map((m) => Number(m[0]));
  const scale = /^rgba?\(/i.test(v.trim()) ? 255 : 1;
  const [r = 0, g = 0, b = 0] = nums.slice(0, 3).map((n) => n / scale);
  const a = alphaPart !== undefined ? Number(alphaPart) : (nums[3] ?? 1);
  return { r, g, b, a };
}

const luma = (c: { r: number; g: number; b: number }) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

/** What a wash paints once it is composited over the fill behind it. */
const over = (s: { r: number; g: number; b: number; a: number }, b: { r: number; g: number; b: number }) => ({
  r: s.r * s.a + b.r * (1 - s.a),
  g: s.g * s.a + b.g * (1 - s.a),
  b: s.b * s.a + b.b * (1 - s.a),
});

/**
 * The ground's lighting, read as the engine paints it: the stop sitting against the TOP edge
 * and the stop the ramp settles at below it.
 *
 * Both are returned even though the top one is transparent by design — that transparency is
 * the claim (nothing is laid over the wall), so a law that could not see it could not check
 * it. A recipe that stopped emitting a ramp would otherwise read as a ground with no dent and
 * quietly pass the direction law against `undefined`.
 */
function washes(el: Element): { top: ReturnType<typeof rgba>; floor: ReturnType<typeof rgba> } {
  const img = computed(el, "background-image");
  const stops = [...img.matchAll(/(?:rgba?|color)\([^)]*\)/g)].map((m) => rgba(m[0]));
  if (stops.length !== 2) {
    throw new Error(`expected one ramp with two stops in the ground's lighting, got ${stops.length}: ${img}`);
  }
  return { top: stops[0]!, floor: stops[1]! };
}

describe("a ground, not an object (§10, 2026-08-20)", () => {
  it("rests at 2 — the index every 1-4 family rests at (2026-09-05)", () => {
    // A default is a fact and it needs exactly one reader, or moving it is invisible. The
    // ground rested at 3 until 2026-09-05, alone with Card and Dialog while every other
    // component on this ladder rested at 2 (Kushagra: an index has to mean the same thing
    // across families, or the number says nothing). Nothing in this file rides the rest —
    // the size laws below state their index — so this is the only reader it has.
    const el = mounted(<Surface>G</Surface>, { theme: {}, select: ".kui-surface" });
    expect(el.getAttribute("data-size")).toBe("2");
    // A real rung, not a value that happens to equal its neighbour's: the padding moves.
    const three = mounted(<Surface size="3">G</Surface>, { theme: {}, select: ".kui-surface" });
    expect(computed(el, "padding-top")).not.toBe(computed(three, "padding-top"));
  });

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

  it("carries its OWN lighting, never the pane's — and the cards on it keep theirs", () => {
    // REWRITTEN 2026-08-26. The law this replaces asserted `background-image: none`, which was
    // the 2026-08-21 decision stated as a guarantee — and that decision was right about the
    // ingredient and one recipe too wide. The grain is a fixed white overlay, so it lifts a
    // light ground by 0.002 and a dark one by 0.042 — 28x the same token — against tonal steps
    // the ladder actually spends. Standing the WHOLE recipe down to fix the grain left the one
    // opaque box in the library with no light on it at all.
    //
    // Three claims, and the middle one is the reason the ring cannot simply be re-pointed here:
    // a ground is lit, it is not lit like a pane, and it still contains its lighting to itself.
    for (const appearance of APPEARANCES) {
      const ground = mounted(
        <Surface>
          <Card data-testid="held">Body</Card>
        </Surface>,
        { theme: { appearance }, select: ".kui-ground" },
      );
      const bed = computed(ground, "background-image");
      expect(bed, `${appearance}: a bed is lit`).not.toBe("none");
      // NOT the pane's recipe. A ground borrowing the seal's sheen is the mistake this whole
      // entry exists to avoid — it would light a dent from the top, as if it stuck out.
      const bare = mounted(<Card>Body</Card>, { theme: { appearance }, select: ".kui-card" });
      const paneRim = computed(bare, "background-image");
      expect(bed, `${appearance}: a ground is not lit like an object`).not.toBe(paneRim);
      // …and specifically it keeps NO grain: that is the 2026-08-21 measurement kept, not
      // re-argued. A bed has no tooth to catch.
      expect(bed.toLowerCase(), `${appearance}: a bed has no tooth`).not.toContain("turbulence");
      expect(paneRim.toLowerCase(), `${appearance}: …and the pane still does`).toContain("turbulence");

      // THE HALF THAT MATTERS, unchanged from the law this replaces. `--kui-sf-light` is not
      // registered `inherits: false`, so touching it here reaches every pane INSIDE the ground
      // — measured, the held card went bare. Stating the property directly is what keeps the
      // ground's lighting to the one box, and the bare card is the control that makes the claim
      // mean something.
      const held = computed(within(ground, "[data-testid='held']"), "background-image");
      expect(held, `${appearance}: the card on it must keep its own`).not.toBe("none");
      expect(held.toLowerCase()).toContain("turbulence");
      expect(held).toContain("gradient");
      expect(held, `${appearance}: identical to a card that never met a ground`).toBe(paneRim);
    }
  });

  it("is lit as a RECESS, and it LIGHTENS — never darkens (2026-08-26)", () => {
    // The principle, not the numbers — the grip law's own shape one family over, so the values
    // stay taste and the direction stays law. A pane is an object: light lands on its top. A
    // ground is a hole in a plane (which is why it casts nothing, two laws up), so the same
    // light is blocked by the wall above it and reaches the floor below.
    //
    // TWO claims, and the second is Kushagra's correction of the first shipping cut ("not by
    // adding a darker tone ... keep that darker tone as what it is right now, but lighten up
    // the rest"): the dent's direction is top-darker-than-floor, AND it is achieved by lifting
    // the floor rather than by laying shade on the wall. A black wash reads as a band painted
    // ON the box instead of as the box being recessed.
    //
    // This is also the law a re-pointed conic ring would fail twice: the ring's bright arc is
    // its TOP, and its shade arc is pigment laid over the fill.
    for (const appearance of APPEARANCES) {
      const ground = mounted(<Surface>Region</Surface>, { theme: { appearance }, select: ".kui-ground" });
      const { top, floor } = washes(ground);
      const fill = rgba(computed(ground, "background-color"));
      // Nothing is laid over the wall: the top edge is the ground's own colour, full stop.
      expect(top.a, `${appearance}: the wall is the ground's own colour, not a wash over it`).toBeLessThan(0.001);
      // …and every stop that DOES paint, lightens. Read as luminance against the fill rather
      // than as "is it white", so a future edit reaching for a dark pigment fails here.
      expect(
        luma(over(floor, fill)),
        `${appearance}: the floor of a dent catches the light`,
      ).toBeGreaterThan(luma(fill));
      // The dent's direction, stated as the relationship rather than as two colours.
      expect(
        luma(over(top, fill)),
        `${appearance}: the top wall must stay darker than the floor`,
      ).toBeLessThan(luma(over(floor, fill)));
    }
  });

  it("its lit floor stays CLEAR of the page and of the card it holds", () => {
    // The constraint that bounds the lift, and it needed both beds — a sabotage pass proved a
    // one-bed version could not fail where it mattered. Lifting a floor has two ways to go
    // wrong and they are in different modes:
    //
    //   LIGHT — the page is pure white and the ground sits 0.033 under it, so a lift big enough
    //   dissolves the region into the page and only its hairline says it is there. The first
    //   spelling of the ladder law below could not catch that, because in light the ladder step
    //   IS the distance to the page: "moved < step" happily permits arriving AT the page. A 95%
    //   lift (floor 0.9984 against a 1.0 page) passed all fourteen laws.
    //
    //   DARK — the ground sits only ~0.011 UNDER the card standing on it, so a lift past that
    //   puts the cards darker than the ground holding them. That is the nesting inverted, which
    //   §10 records as the reason the ground is an absolute pair rather than a relative step.
    //
    // A strict inequality is not enough for either: 0.9984 < 1.0 is true and useless. The
    // margin is half the tonal step on the side being defended, which is the smallest gap the
    // ladder itself treats as a real difference.
    for (const appearance of APPEARANCES) {
      const ground = mounted(
        <Surface>
          <Card data-testid="held">Body</Card>
        </Surface>,
        { theme: { appearance }, select: ".kui-ground" },
      );
      const fill = rgba(computed(ground, "background-color"));
      const page = rgba(colorOn(ground, "var(--color-page)"));
      const card = rgba(computed(within(ground, "[data-testid='held']"), "background-color"));
      const lit = luma(over(washes(ground).floor, fill));
      // Read as the FRACTION of each gap still unspent, signed — never as a distance. The first
      // spelling used Math.abs() and a sabotage walked straight through it: a floor lifted
      // clean PAST the card is a long way from it, so "far from the card" was satisfied by the
      // exact failure the law exists to catch. A ratio catches crossing (it goes negative) and
      // closing too far (it drops below a half) with one number, and it needs no per-mode
      // arithmetic — the page sits above the ground in light and below it in dark, and the sign
      // carries that by itself.
      for (const [bed, value] of [["page", page], ["card", card]] as const) {
        const gap = luma(value) - luma(fill);
        const left = (luma(value) - lit) / gap;
        expect(
          left,
          `${appearance}: the lit floor (${lit.toFixed(4)}) has spent ${((1 - left) * 100).toFixed(0)}% of its gap to the ${bed} (${luma(value).toFixed(4)}) — a ground must not ${left < 0 ? "cross" : "dissolve into"} what it is not`,
        ).toBeGreaterThan(0.5);
      }
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
    //
    // BOTH ARMS since 2026-08-26 (audit). The comment named two — reaching past the type, and
    // an ancestor stamping a family — and the fixture only ever built the second, which the
    // element-keyed rungs cannot match anyway. The first one was the reachable defect: `data-*`
    // is exempt from TypeScript's excess-property checking, so the attribute compiles on the
    // GROUND itself, and `.kui-surface[data-emphasis="loud"]` is declared after
    // `.kui-surface.kui-ground` at equal specificity — so it won on source order and painted
    // `--tone-solid`. A ground's identity is the absence of an axis, so the component now
    // stamps that absence over the consumer's spread.
    const plain = mounted(<Surface>x</Surface>, { theme: {}, select: ".kui-surface" });
    const ancestor = mounted(
      <Theme>
        <Box data-tone="destructive" data-emphasis="loud">
          <Surface>x</Surface>
        </Box>
      </Theme>,
      { select: ".kui-ground" },
    );
    // No `@ts-expect-error` on the element arm below, and its absence IS the finding: the
    // hyphenated spelling compiles, so the runtime is the only place it can be refused.
    const stamped = mounted(
      <Surface data-tone="destructive" data-emphasis="loud">x</Surface>,
      { theme: {}, select: ".kui-ground" },
    );
    for (const [name, el] of [["ancestor", ancestor], ["element", stamped]] as const) {
      expect(computed(el, "background-color"), `${name}: a ground was tinted`).toBe(
        computed(plain, "background-color"),
      );
      expect(computed(el, "border-top-color"), `${name}: the hairline took a family`).toBe(
        computed(plain, "border-top-color"),
      );
      expect(computed(el, "color"), `${name}: the ink took a family`).toBe(computed(plain, "color"));
    }
    // …and the ground really does refuse the attribute rather than merely surviving it, which
    // is the half a colour comparison cannot tell from a rung that happens to resolve the seal.
    expect(stamped.hasAttribute("data-emphasis")).toBe(false);
    expect(stamped.hasAttribute("data-tone")).toBe(false);
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

  it("CLOSES the region — a card on a ground is not over content (§10, 2026-08-26)", () => {
    /**
     * REVERSED 2026-08-26 (audit). This law used to assert the opposite — that a card inside a
     * marked region is "the card it would have been" with the Surface removed — and that was
     * the defect written down as a guarantee. A ground PAINTS, opaquely and by construction
     * (`--color-ground`; no material arm can reach it), so it seals whatever passes behind it
     * exactly as a solid pane does. Leaking the region through it meant the held card resolved
     * the theme's thickness and rendered real glass: a full backdrop read on every paint, to
     * blur a flat opaque colour. Selectivity exists to stop precisely that.
     *
     * The card is UNMARKED and reads the ambient `<Box backdrop>` region, which is the only
     * arrangement that can catch this: an explicit `backdrop` resolves the theme's material
     * through any scope (2026-08-19), so a marked card would pass either way.
     *
     * Falsified by deleting the `BackdropContext.Provider`: reads
     * `expected 'regular' to be undefined`.
     */
    const held = (tree: Parameters<typeof mounted>[0]) =>
      mounted(tree, { select: "[data-testid='held']" });
    const onGround = held(
      <Theme material="regular">
        <Box backdrop>
          <Surface>
            <Card data-testid="held">Body</Card>
          </Surface>
        </Box>
      </Theme>,
    );
    expect(onGround.dataset["material"], "the region leaked through an opaque ground").toBeUndefined();
    expect(computed(onGround, "backdrop-filter")).toBe("none");
    // THE NEGATIVE CONTROL: the same card with no ground under it IS glass, or "it is solid"
    // is a fact about the fixture rather than about the ground.
    const onPage = held(
      <Theme material="regular">
        <Box backdrop>
          <Card data-testid="held">Body</Card>
        </Box>
      </Theme>,
    );
    expect(onPage.dataset["material"]).toBe("regular");
    expect(computed(onPage, "backdrop-filter")).not.toBe("none");
    // And the escape is untouched: a member that states its OWN placement still gets the
    // theme's material, exactly as it does inside a solid pane (2026-08-19).
    const stated = held(
      <Theme material="regular">
        <Surface>
          <Card backdrop data-testid="held">Body</Card>
        </Surface>
      </Theme>,
    );
    expect(stated.dataset["material"], "a ground vetoed an explicit statement").toBe("regular");
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

  it("…but opens no PANE scope: inside glass, its members stay on-glass (§10)", () => {
    // The half that did NOT change, and the reason the reset above is a bare
    // `BackdropContext` rather than a `GlassScope`: a ground expresses no material, so it must
    // not touch `PaneContext`. A Surface inside a glass card leaves that card's scope exactly
    // as it found it — the members are `on-glass`, never `solid`. The subject is a Button
    // rather than a Card only to keep the dev-time nested-card warning out of the run.
    const inside = mounted(
      <Theme material="regular">
        <Card backdrop>
          <Surface>
            <Button data-testid="held">Go</Button>
          </Surface>
        </Card>
      </Theme>,
      { select: "[data-testid='held']" },
    );
    const withoutGround = mounted(
      <Theme material="regular">
        <Card backdrop>
          <Button data-testid="held">Go</Button>
        </Card>
      </Theme>,
      { select: "[data-testid='held']" },
    );
    expect(withoutGround.dataset["material"], "the held control is not on glass at all").toBe("on-glass");
    expect(inside.dataset["material"], "a ground stood its members down onto calm ground").toBe(
      withoutGround.dataset["material"],
    );
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
