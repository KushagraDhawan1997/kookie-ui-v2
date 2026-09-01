/**
 * Avatar's laws, mounted (§11, §35).
 *
 * The box is the atom family's, so the box laws are AGREEMENTS with a mounted Kbd — one line
 * tall at every step — and the fill law is an agreement with a Chip. The claims that carry
 * weight are the ones a reader would assume: an avatar in a line of text never spreads that
 * line; the fallback stands in until a picture has loaded and the picture then covers it; and
 * a group's overlap and ring are what make two discs two.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, computed, mounted, until } from "../../test/browser.tsx";
import { avatarBadge, avatarBadgeOut, avatarOverlap, avatarScale, badgeBox } from "../../tokens/config.ts";
import { Chip } from "../chip/chip.tsx";
import { Kbd } from "../kbd/kbd.tsx";
import { Text } from "../text/text.tsx";
import { Badge } from "../badge/badge.tsx";
import { Button } from "../button/button.tsx";
import { Avatar, AvatarGroup } from "./avatar.tsx";

// A 1x1 PNG, so the loaded state is reachable without a network.
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

describe("the box is the atom family's: one line, and a circle (§11, §15, §35)", () => {
  for (const size of ["1", "3", "6", "9"] as const) {
    it(`size ${size}: one line tall, as wide as tall, and it never spreads the line it sits in`, () => {
      const host = mounted(
        <Text size={size} render={<p />}>
          <Avatar fallback="KD" /> Kushagra <Kbd>K</Kbd>
        </Text>,
        { theme: {} },
      );
      const avatar = host.querySelector<HTMLElement>(".kui-avatar")!;
      const kbd = host.querySelector<HTMLElement>(".kui-kbd")!;
      const line = parseFloat(computed(host, "line-height"));
      const box = avatar.getBoundingClientRect();
      expect(box.height, "not one line tall").toBeCloseTo(line, 1);
      expect(box.width, "not a disc").toBeCloseTo(box.height, 1);
      expect(box.height).toBeCloseTo(kbd.getBoundingClientRect().height, 1);
      // The line did not grow around it.
      expect(host.getBoundingClientRect().height).toBeCloseTo(line, 1);
      // And the initials are a SHARE OF THE DISC at every step — read off the config, so the
      // eye can move the number without moving this law; a constant discount on the type
      // step failed exactly here (step 9 filled the disc) before the share was stated.
      const fallback = avatar.querySelector<HTMLElement>(".kui-avatar-fallback")!;
      expect(parseFloat(computed(fallback, "font-size"))).toBeCloseTo(box.height * avatarScale, 0);
    });
  }

  it("a stated size wins over the line, and the group's size reaches its unset members", () => {
    const stated = mounted(<Avatar size="6" fallback="KD" />, { theme: {} });
    const group = mounted(
      <AvatarGroup size="6">
        <Avatar fallback="KD" />
        <Avatar size="2" fallback="MC" />
      </AvatarGroup>,
      { theme: {} },
    );
    const [inherited, own] = Array.from(group.querySelectorAll<HTMLElement>(".kui-avatar"));
    expect(stated.getBoundingClientRect().height).toBeCloseTo(inherited!.getBoundingClientRect().height, 1);
    expect(own!.getBoundingClientRect().height).toBeLessThan(inherited!.getBoundingClientRect().height);
  });

  it("is a circle at every radius level — a person is a disc (§6)", () => {
    for (const radius of ["none", "small", "medium", "large", "full"] as const) {
      const el = mounted(<Avatar size="5" fallback="KD" />, { theme: { radius } });
      expect(computed(el, "border-top-left-radius"), radius).toBe("50%");
    }
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: the fallback face is the atom fill, neutral — there is no tone to move it`, () => {
      const avatar = mounted(<Avatar size="4" fallback="KD" />, { theme: { appearance } });
      const chip = mounted(<Chip size="4">x</Chip>, { theme: { appearance } });
      expect(computed(avatar, "background-color")).toBe(computed(chip, "background-color"));
      expect(computed(avatar, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
      expect(avatar.getAttribute("data-tone")).toBe("neutral");
    });
  }
});

describe("the picture and what stands in for it (§35)", () => {
  it("shows the fallback until the picture has loaded, then the picture covers it", async () => {
    const el = mounted(<Avatar size="5" src={PIXEL} alt="Kushagra" fallback="KD" />, { theme: {} });
    await until(() => el.querySelector("img") !== null);
    const img = el.querySelector<HTMLImageElement>("img")!;
    expect(img.getAttribute("alt")).toBe("Kushagra");
    // Base UI renders the image only once loaded; by then the fallback has gone.
    expect(el.querySelector(".kui-avatar-fallback")).toBeNull();
    // And the picture fills the disc.
    const box = el.getBoundingClientRect();
    const pic = img.getBoundingClientRect();
    expect(pic.width).toBeCloseTo(box.width, 1);
    expect(pic.height).toBeCloseTo(box.height, 1);
    expect(computed(img, "object-fit")).toBe("cover");
    // The picture rounds ITSELF — the root no longer clips, so the group ring can paint outside.
    expect(computed(img, "border-top-left-radius")).toBe("50%");
  });

  it("a broken picture falls back", async () => {
    const el = mounted(<Avatar size="5" src="data:image/png;base64,AAAA" fallback="KD" />, { theme: {} });
    await until(() => el.querySelector(".kui-avatar-fallback") !== null && el.querySelector("img") === null);
    expect(el.querySelector(".kui-avatar-fallback")!.textContent).toBe("KD");
  });

  it("without a picture or initials it draws the generic person, at the derived stroke", () => {
    const el = mounted(<Avatar size="5" />, { theme: {} });
    const glyph = el.querySelector<SVGElement>("svg.kui-avatar-glyph")!;
    expect(glyph).not.toBeNull();
    expect(glyph.getAttribute("aria-hidden")).toBe("true");
    // Sized in the atom's own em, so it lands inside the disc with a face around it.
    const g = glyph.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    expect(g.width).toBeLessThan(box.width);
    expect(g.width).toBeGreaterThan(box.width * 0.4);
  });

  it("the default alt is empty — decorative beside the name it sits next to", async () => {
    const el = mounted(<Avatar size="5" src={PIXEL} fallback="KD" />, { theme: {} });
    await until(() => el.querySelector("img") !== null);
    expect(el.querySelector("img")!.getAttribute("alt")).toBe("");
  });

  it("the type refuses what an avatar is not", () => {
    // @ts-expect-error — an avatar is not louder than another; there is no emphasis
    void (<Avatar emphasis="loud" />);
    // @ts-expect-error — no tone (removed 2026-08-31): a tinted face is the picture's job
    void (<Avatar tone="accent" />);
    // @ts-expect-error — no shape: a person is a disc; a square picture is a picture
    void (<Avatar shape="square" />);
    // @ts-expect-error — no margin prop on any component (first non-negotiable)
    void (<Avatar m="4" />);
    // @ts-expect-error — the size is a type step, not a control index of the wrong ladder
    void (<Avatar size="10" />);
    expect(true).toBe(true);
  });
});

describe("a group overlaps its faces and rings them (§35)", () => {
  it("each later face sits over the one before it, by the stated share of a face", () => {
    const group = mounted(
      <AvatarGroup size="6">
        <Avatar fallback="A" />
        <Avatar fallback="B" />
        <Avatar fallback="C" />
      </AvatarGroup>,
      { theme: {} },
    );
    const [a, b, c] = Array.from(group.querySelectorAll<HTMLElement>(".kui-avatar")).map((el) =>
      el.getBoundingClientRect(),
    );
    const face = a!.width;
    const overlap = face * avatarOverlap;
    expect(b!.left - a!.left).toBeCloseTo(face - overlap, 0);
    expect(c!.left - b!.left).toBeCloseTo(face - overlap, 0);
    // A real overlap: the second starts before the first ends.
    expect(b!.left).toBeLessThan(a!.right);
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: a face in a group wears a ring OUTSIDE its box in the surface colour; alone it wears none`, () => {
      const alone = mounted(<Avatar size="6" fallback="A" />, { theme: { appearance } });
      const group = mounted(
        <AvatarGroup size="6">
          <Avatar fallback="A" />
          <Avatar fallback="B" />
        </AvatarGroup>,
        { theme: { appearance } },
      );
      const ringed = group.querySelector<HTMLElement>(".kui-avatar")!;
      const ring = getComputedStyle(ringed, "::after");
      expect(getComputedStyle(alone, "::after").content).toBe("none");
      expect(parseFloat(ring.borderTopWidth)).toBeGreaterThan(0);
      // The ring is the SURFACE colour, read through the theme, not a literal.
      const probe = mounted(<span style={{ color: "var(--color-surface)" }} />, { theme: { appearance } });
      expect(ring.borderTopColor).toBe(computed(probe, "color"));
      // OUTSIDE: the ring's box starts before the face's edge, and the face itself is the
      // full line — exactly as big as the lone avatar (2026-08-31: a border inside the box
      // had been shrinking every grouped face by 4px).
      expect(parseFloat(ring.top)).toBeLessThan(0);
      expect(ringed.getBoundingClientRect().width).toBeCloseTo(alone.getBoundingClientRect().width, 1);
      expect(parseFloat(computed(ringed, "border-top-width"))).toBe(0);
      // And the picture still rounds without the root clipping.
      expect(computed(ringed, "overflow-x")).toBe("visible");
    });
  }
});

describe("a badge pinned to the disc (§38)", () => {
  it("sits at the top-end corner riding the rim, ringed in the surface colour, priced on the slot's smaller line", () => {
    const el = mounted(<Avatar size="7" fallback="KD" badge={<Badge>3</Badge>} />, { theme: {} });
    const badge = el.querySelector<HTMLElement>(".kui-badge")!;
    const face = el.getBoundingClientRect();
    const b = badge.getBoundingClientRect();
    // Top-end, stepped PAST the box by --avatar-badge-out of the slot's line on both axes so
    // the centre lands on the rim (2026-09-01 — flush at the corner it read stuck on the
    // face). Read through the config numbers so the eye can move the step.
    const slotLine = parseFloat(computed(el, "line-height")) * avatarBadge;
    expect(b.left + b.width / 2).toBeGreaterThan(face.left + face.width / 2);
    expect(b.top + b.height / 2).toBeLessThan(face.top + face.height / 2);
    expect(b.right - face.right).toBeCloseTo(slotLine * avatarBadgeOut, 0);
    expect(face.top - b.top).toBeCloseTo(slotLine * avatarBadgeOut, 0);
    // And the centre sits on the rim, give or take a pixel — the step's whole point.
    const rim = face.width / 2;
    const centre = Math.hypot(b.left + b.width / 2 - (face.left + face.width / 2), b.top + b.height / 2 - (face.top + face.height / 2));
    expect(Math.abs(centre - rim)).toBeLessThan(1.5);
    // A single digit pinned is still a DISC — the ring adds equally on every side.
    expect(b.width).toBeCloseTo(b.height, 0);
    // The cut-out: a surface-coloured ring OUTSIDE the badge, worn only when pinned — a
    // pseudo-element, so the badge's own box is byte-identical to a free one.
    const probe = mounted(<span style={{ color: "var(--color-surface)" }} />, { theme: {} });
    const ring = getComputedStyle(badge, "::after");
    expect(parseFloat(ring.borderTopWidth)).toBeGreaterThan(0);
    expect(ring.borderTopColor).toBe(computed(probe, "color"));
    expect(parseFloat(ring.top)).toBeLessThan(0);
    const free = mounted(<Badge>3</Badge>, { theme: {} });
    expect(getComputedStyle(free, "::after").content).toBe("none");
    expect(parseFloat(computed(badge, "border-top-width"))).toBe(0);
    // Priced on the SLOT's line — the face's line scaled by --avatar-badge — not the face's
    // own: judged 2026-08-31, a badge on the face's line was 60% of the face and covered the
    // initials. Read through both config numbers so the eye can move either.
    const line = parseFloat(computed(el, "line-height"));
    expect(b.height).toBeCloseTo(line * avatarBadge * badgeBox, 0);
    expect(b.height).toBeLessThan(line * badgeBox - 1);
  });

  it("a bare badge on a disc is a dot with a name", () => {
    const el = mounted(<Avatar size="5" fallback="KD" badge={<Badge aria-label="Online" />} />, { theme: {} });
    const badge = el.querySelector<HTMLElement>(".kui-badge")!;
    expect(badge.hasAttribute("data-dot")).toBe(true);
    expect(badge.getAttribute("aria-label")).toBe("Online");
    expect(badge.getBoundingClientRect().width).toBeCloseTo(badge.getBoundingClientRect().height, 1);
  });
});

describe("glass, and the avatar that is a button (§10, §35)", () => {
  it("backdrop puts the theme's material on the fallback face — Chip's wiring, law-equal to a Chip's veil", () => {
    const avatar = mounted(<Avatar size="6" fallback="KD" backdrop />, { theme: { material: "regular" } });
    const chip = mounted(<Chip size="6" backdrop>x</Chip>, { theme: { material: "regular" } });
    const plain = mounted(<Avatar size="6" fallback="KD" />, { theme: { material: "regular" } });
    expect(avatar.getAttribute("data-material")).toBe("regular");
    // The lens map is per box (`url(#kui-lens-N)`), so the agreement is read with the id
    // stripped — what must match is the material, not the map.
    const lensless = (v: string) => v.replace(/url\("#kui-lens-\d+"\)/g, "url(lens)");
    expect(computed(avatar, "backdrop-filter")).not.toBe("none");
    expect(lensless(computed(avatar, "backdrop-filter"))).toBe(lensless(computed(chip, "backdrop-filter")));
    expect(computed(avatar, "background-color")).toBe(computed(chip, "background-color"));
    // Selective (§10): un-marked, an avatar resolves solid and pays nothing.
    expect(plain.hasAttribute("data-material")).toBe(false);
    expect(computed(plain, "backdrop-filter")).toBe("none");
  });

  it("inside an icon-only Button it fills the button, and its initials keep their share of the disc", () => {
    const button = mounted(
      <Button iconOnly aria-label="Kushagra Dhawan" size="2">
        <Avatar fallback="KD" />
      </Button>,
      { theme: {} },
    );
    const avatar = button.querySelector<HTMLElement>(".kui-avatar")!;
    const a = avatar.getBoundingClientRect();
    // The disc fills the button's CONTENT box (inside the skeleton's hairline), and the
    // button keeps its ladder height rather than growing around the disc.
    expect(a.width).toBeCloseTo(button.clientWidth, 0);
    expect(a.height).toBeCloseTo(button.clientHeight, 0);
    expect(a.height).toBeCloseTo(a.width, 1);
    expect(button.getBoundingClientRect().height).toBeCloseTo(parseFloat(computed(button, "min-height")), 0);
    // The disc is the BUTTON's height, not a line of the button's label.
    const line = parseFloat(computed(button, "line-height"));
    expect(a.height).toBeGreaterThan(line + 4);
    const fallback = avatar.querySelector<HTMLElement>(".kui-avatar-fallback")!;
    expect(parseFloat(computed(fallback, "font-size"))).toBeCloseTo(a.height * avatarScale, 0);
  });
});
