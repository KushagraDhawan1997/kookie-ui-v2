/**
 * Avatar's laws, mounted (§11, §35).
 *
 * The box is the control ladder at 1-4, so those box laws are AGREEMENTS with a mounted Button
 * at the same index in every cell, and 5-9 read the stated ladder past it. The fill law is an
 * agreement with a Chip. The other claims that carry weight: the fallback stands in until a
 * picture has loaded and the picture then covers it; and a group's overlap and ring are what
 * make two discs two.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, DENSITIES, POINTERS, SIZES, computed, mounted, until } from "../../test/browser.tsx";
import { avatarBadge, avatarBadgeOut, avatarOverlap, avatarScale, avatarSizes, badgeBox } from "../../tokens/config.ts";
import { Chip } from "../chip/chip.tsx";
import { Badge } from "../badge/badge.tsx";
import { Button } from "../button/button.tsx";
import { Avatar, AvatarGroup } from "./avatar.tsx";

// A 1x1 PNG, so the loaded state is reachable without a network.
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

describe("the box is the control ladder, and past it (§4, §35)", () => {
  // EVERY CELL (2026-09-15). Sizes 1-4 ARE the control heights, so the claim is an agreement
  // with a mounted Button at the same index in every density x pointer cell — one cell of the
  // ladder is a law about that cell.
  for (const density of DENSITIES)
    for (const pointer of POINTERS)
      for (const size of SIZES) {
        it(`${density}/${pointer}/${size}: level with a Button at the same index, a disc, initials at their share`, () => {
          const avatar = mounted(<Avatar size={size} fallback="KD" />, { theme: { density, pointer } });
          const button = mounted(<Button size={size}>x</Button>, { theme: { density, pointer }, select: ".kui-button" });
          const box = avatar.getBoundingClientRect();
          expect(box.height).toBeCloseTo(button.getBoundingClientRect().height, 1);
          expect(box.width, "not a disc").toBeCloseTo(box.height, 1);
          // The initials are a SHARE OF THE DISC: the fallback's `1lh` must be the box, which
          // only holds while the avatar re-states its line to its own height.
          const fallback = avatar.querySelector<HTMLElement>(".kui-avatar-fallback")!;
          expect(parseFloat(computed(fallback, "font-size"))).toBeCloseTo(box.height * avatarScale, 0);
        });
      }

  it("5-9 continue the ladder past size 4, at the stated heights", () => {
    const four = mounted(<Avatar size="4" fallback="KD" />, { theme: {} }).getBoundingClientRect().height;
    let previous = four;
    (["5", "6", "7", "8", "9"] as const).forEach((size, i) => {
      const el = mounted(<Avatar size={size} fallback="KD" />, { theme: {} });
      const h = el.getBoundingClientRect().height;
      expect(h, `size ${size}`).toBeCloseTo(avatarSizes[i]!, 1);
      expect(h, `size ${size} does not climb`).toBeGreaterThan(previous);
      const fallback = el.querySelector<HTMLElement>(".kui-avatar-fallback")!;
      expect(parseFloat(computed(fallback, "font-size"))).toBeCloseTo(h * avatarScale, 0);
      previous = h;
    });
  });

  it("unset, it rests at the app's index — and moves with it", () => {
    const at = (size: "1" | "3") => ({
      avatar: mounted(<Avatar fallback="KD" />, { theme: { size } }).getBoundingClientRect().height,
      button: mounted(<Button>x</Button>, { theme: { size }, select: ".kui-button" }).getBoundingClientRect().height,
    });
    const one = at("1");
    const three = at("3");
    expect(one.avatar).toBeCloseTo(one.button, 1);
    expect(three.avatar).toBeCloseTo(three.button, 1);
    // The vacuity guard: two different app indexes must give two different faces.
    expect(three.avatar).toBeGreaterThan(one.avatar);
  });

  it("the group's size reaches its unset members, and a member's own size wins", () => {
    const stated = mounted(<Avatar size="6" fallback="KD" />, { theme: { size: "1" } });
    const group = mounted(
      <AvatarGroup size="6">
        <Avatar fallback="KD" />
        <Avatar size="2" fallback="MC" />
      </AvatarGroup>,
      { theme: { size: "1" } },
    );
    const [inherited, own] = Array.from(group.querySelectorAll<HTMLElement>(".kui-avatar"));
    const alone = mounted(<Avatar size="2" fallback="KD" />, { theme: { size: "1" } });
    expect(inherited!.getBoundingClientRect().height).toBeCloseTo(stated.getBoundingClientRect().height, 1);
    expect(own!.getBoundingClientRect().height).toBeCloseTo(alone.getBoundingClientRect().height, 1);
    // The group is exactly as tall as its tallest face — it adds no line of its own.
    expect(group.getBoundingClientRect().height).toBeCloseTo(inherited!.getBoundingClientRect().height, 1);
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

  for (const size of ["1", "3", "5", "9"] as const) {
    it(`size ${size}: without a picture or initials it draws the generic person, at its stated share`, () => {
      const el = mounted(<Avatar size={size} />, { theme: {} });
      const glyph = el.querySelector<SVGElement>("svg.kui-avatar-glyph")!;
      expect(glyph).not.toBeNull();
      expect(glyph.getAttribute("aria-hidden")).toBe("true");
      // THE DERIVATION, NOT A WINDOW (ultracode audit 2026-09-01). It read `0.4 x box < g <
      // box` at one step, and a window that wide is satisfied by values the rule does not
      // produce: respelling `1.5em` as `1.5rem` — a one-character slip carrying no px, so the
      // tokens-only walk cannot see it — lands inside the window at steps 5 and 7 and breaks
      // the derivation at 1, 3 and 9. The glyph is 1.5 of the fallback's own em, and the
      // fallback is `--avatar-scale` of the disc, so the whole chain is read here.
      const em = parseFloat(computed(el.querySelector<HTMLElement>(".kui-avatar-fallback")!, "font-size"));
      expect(glyph.getBoundingClientRect().width).toBeCloseTo(em * 1.5, 0);
      expect(em).toBeCloseTo(el.getBoundingClientRect().height * avatarScale, 0);
    });
  }

  it("a supplied alt names the FALLBACK too, and an empty one hides it", async () => {
    // The name has to survive the picture not arriving (ultracode audit 2026-09-01). Measured
    // before the fix: `<Avatar src="…broken" alt="Kushagra" fallback="KD"/>` rendered exactly
    // `<span>KD</span>` — a reader heard "K D" and never the name — while the default
    // `alt=""`, documented as decorative, emitted a bare "KD" into the line beside the
    // person's own name. Both arms, because each fails on its own.
    const named = mounted(<Avatar alt="Kushagra Dhawan" fallback="KD" />, { theme: {} });
    const fallback = named.querySelector<HTMLElement>(".kui-avatar-fallback")!;
    expect(fallback.getAttribute("role")).toBe("img");
    expect(fallback.getAttribute("aria-label")).toBe("Kushagra Dhawan");
    expect(fallback.hasAttribute("aria-hidden")).toBe(false);

    const bare = mounted(<Avatar fallback="KD" />, { theme: {} });
    const decorative = bare.querySelector<HTMLElement>(".kui-avatar-fallback")!;
    expect(decorative.getAttribute("aria-hidden")).toBe("true");
    expect(decorative.hasAttribute("aria-label")).toBe(false);
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
    // @ts-expect-error — the ladder stops at 9
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
      // full box — exactly as big as the lone avatar (2026-08-31: a border inside the box
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

  // EVERY CELL, and the audit's reason (2026-09-01): the law mounted default/fine/size 2, the
  // one cell where the button's height, the line and the disc are all 30 — a constant satisfies
  // every assertion there, while the other 23 cells span 22px to 66px. A law that mounts one
  // cell of a 24-cell ladder is a law about that cell.
  for (const density of DENSITIES)
    for (const pointer of POINTERS)
      for (const size of SIZES) {
  it(`${density}/${pointer}/${size}: inside an icon-only Button it fills the button, and its initials keep their share of the disc`, () => {
    const button = mounted(
      <Button iconOnly aria-label="Kushagra Dhawan" size={size}>
        <Avatar fallback="KD" />
      </Button>,
      { theme: { density, pointer } },
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
      }
});
