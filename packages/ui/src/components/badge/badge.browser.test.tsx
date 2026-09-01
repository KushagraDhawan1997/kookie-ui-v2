/**
 * Badge's laws, mounted (§11, §38).
 *
 * A badge is loud by identity and a share of its line by construction, so its laws read the
 * loud rung's pairing (the tone's solid, the contrast label — asserted as an agreement with a
 * loud Button of the same tone) and the share (against the line it sits in, at four steps,
 * through the config numbers so the eye can move them). The dot is the same disc with no
 * content; the type makes the bare form name itself.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, computed, mounted } from "../../test/browser.tsx";
import { badgeBox, badgeText } from "../../tokens/config.ts";
import { Button } from "../button/button.tsx";
import { Chip } from "../chip/chip.tsx";
import { Text } from "../text/text.tsx";
import { Badge } from "./badge.tsx";

/** The whole type ramp — a badge is a share of ANY line it can sit in. */
const TYPE_STEPS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

describe("a badge is a share of the line it sits in (§38)", () => {
  for (const size of ["1", "3", "6", "9"] as const) {
    it(`size ${size}: the dot is a disc and the count a pill, both --badge-box of the line, digits --badge-text of it`, () => {
      const host = mounted(
        <Text size={size} render={<p />}>
          Inbox <Badge aria-label="Unread" /> <Badge>3</Badge> <Badge>128</Badge>
        </Text>,
        { theme: {} },
      );
      const line = parseFloat(computed(host, "line-height"));
      const [dot, one, many] = Array.from(host.querySelectorAll<HTMLElement>(".kui-badge")).map((el) => ({
        el,
        box: el.getBoundingClientRect(),
      }));
      for (const { box } of [dot!, one!, many!]) expect(box.height).toBeCloseTo(line * badgeBox, 0);
      expect(dot!.box.width).toBeCloseTo(dot!.box.height, 1);
      expect(one!.box.width).toBeCloseTo(one!.box.height, 0);
      expect(many!.box.width).toBeGreaterThan(many!.box.height);
      expect(parseFloat(computed(many!.el, "font-size"))).toBeCloseTo(line * badgeText, 0);
      // The line did not grow around it.
      expect(host.getBoundingClientRect().height).toBeCloseTo(line, 1);
    });
  }

  // THE WHOLE RAMP, and the reason is the audit's (2026-09-01): the first spelling looped
  // steps 1-3, which are the three where a constant fraction of the LINE happens to land on
  // the cap. Measured across all nine it ran -0.27 to -2.41px, so the law was walking the
  // cells that could not fail. A law that walks two or three steps of a nine-step ramp cannot
  // tell a ladder from a constant.
  for (const size of TYPE_STEPS) {
    it(`size ${size}: the centre sits on the CAP centre, dot and count alike`, () => {
      // `vertical-align: middle` alone parked it at half the x-height — measured 4.26px above
      // the baseline against a cap centre of 5.44 at step 3, visibly low beside the capitals
      // (2026-09-01, Kushagra). The claim is visual, so the law reads the painted centre
      // against the parent font's own cap metrics (canvas), not the token that promises it.
      const host = mounted(
        <Text size={size} render={<p />}>
          Inbox <Badge aria-label="Unread" /> <Badge>3</Badge>
        </Text>,
        { theme: {} },
      );
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0";
      host.insertBefore(probe, host.querySelector(".kui-badge"));
      const baseline = probe.getBoundingClientRect().bottom;
      probe.remove();
      const cs = getComputedStyle(host);
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const capCentre = ctx.measureText("H").actualBoundingBoxAscent / 2;
      const centres = Array.from(host.querySelectorAll<HTMLElement>(".kui-badge")).map((el) => {
        const box = el.getBoundingClientRect();
        return baseline - (box.top + box.height / 2);
      });
      for (const centre of centres) expect(Math.abs(centre - capCentre)).toBeLessThan(0.75);
      // Dot and count seat identically — the reason `middle` survived over a baseline length.
      expect(centres[0]).toBeCloseTo(centres[1]!, 1);
    });
  }

  it("a stated size wins over the line — in the BOX and in the DIGITS", () => {
    const host = mounted(
      <Text size="3" render={<p />}>
        <Badge size="7">3</Badge>
      </Text>,
      { theme: {} },
    );
    const alone = mounted(<Badge size="7">3</Badge>, { theme: {} });
    const inLine = host.querySelector<HTMLElement>(".kui-badge")!;
    expect(inLine.getBoundingClientRect().height).toBeCloseTo(alone.getBoundingClientRect().height, 1);
    // THE HALF THIS LAW USED TO SKIP (ultracode audit 2026-09-01). It compared HEIGHT, which is
    // the one property the fault could not reach: the box is `calc(1lh * --badge-box)` off the
    // element's OWN line and was always right, while the join's `.kui-type[data-size]` at
    // (0,2,0) beat the badge's own (0,1,0) font-size — so a stated-size badge drew the full
    // step's digits inside the badge's own pill (56px in a 43.39px box at step 9, at every
    // step of the ramp). Both halves are read now, and the digits are read against the line
    // the box is priced from, so the two cannot be right about different lines.
    for (const el of [inLine, alone]) {
      expect(parseFloat(computed(el, "font-size"))).toBeCloseTo(
        parseFloat(computed(el, "line-height")) * badgeText,
        1,
      );
    }
  });

  it("a stated step and the same step read from the line are one badge", () => {
    // The agreement the two spellings owe each other: `<Badge size="7">` and a badge sitting
    // in a `<Text size="7">` are the same marker, box and digits alike. It is what makes the
    // stated size mean "the line I would have sat in".
    const stated = mounted(<Badge size="7">128</Badge>, { theme: {} });
    const inherited = mounted(
      <Text size="7" render={<p />}>
        x <Badge>128</Badge>
      </Text>,
      { theme: {} },
    ).querySelector<HTMLElement>(".kui-badge")!;
    expect(computed(stated, "font-size")).toBe(computed(inherited, "font-size"));
    expect(stated.getBoundingClientRect().height).toBeCloseTo(inherited.getBoundingClientRect().height, 1);
  });
});

describe("loud by identity, the system's tones (§38)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: wears the tone's solid and the contrast label — a loud Button's own pairing`, () => {
      for (const tone of ["accent", "destructive", "warning", "success", "info", "neutral"] as const) {
        const badge = mounted(<Badge tone={tone}>3</Badge>, { theme: { appearance } });
        const button = mounted(<Button tone={tone} emphasis="loud">x</Button>, { theme: { appearance } });
        expect(computed(badge, "background-color"), tone).toBe(computed(button, "background-color"));
        expect(computed(badge, "color"), tone).toBe(computed(button, "color"));
      }
      // And it is NOT the chip: a chip is a wash with a word, a badge is a solid.
      const badge = mounted(<Badge>3</Badge>, { theme: { appearance } });
      const chip = mounted(<Chip tone="accent">3</Chip>, { theme: { appearance } });
      expect(computed(badge, "background-color")).not.toBe(computed(chip, "background-color"));
    });
  }

  it("the dot and the count are one identity — same fill, same height", () => {
    const host = mounted(
      <Text size="4" render={<p />}>
        <Badge aria-label="Unread" /> <Badge>3</Badge>
      </Text>,
      { theme: {} },
    );
    const [dot, count] = Array.from(host.querySelectorAll<HTMLElement>(".kui-badge"));
    expect(computed(dot!, "background-color")).toBe(computed(count!, "background-color"));
    expect(dot!.getBoundingClientRect().height).toBeCloseTo(count!.getBoundingClientRect().height, 1);
    expect(dot!.hasAttribute("data-dot")).toBe(true);
    expect(count!.hasAttribute("data-dot")).toBe(false);
  });

  it("the type: a bare badge must be named, there is no emphasis, and tone is the closed set", () => {
    // @ts-expect-error — a dot is colour alone; it must carry a name
    void (<Badge />);
    // @ts-expect-error — loud is the identity; nothing lowers it
    void (<Badge emphasis="quiet">3</Badge>);
    // @ts-expect-error — the tone set is the system's closed list, never an app's word
    void (<Badge tone="alert">3</Badge>);
    // @ts-expect-error — no margin prop on any component (first non-negotiable)
    void (<Badge m="2">3</Badge>);
    expect(true).toBe(true);
  });
});


/**
 * AN UNNAMED EMPTY BADGE RENDERS NOTHING (ultracode audit 2026-09-01).
 *
 * The type has two arms — a bare badge that must carry `aria-label`, and a counted one whose
 * content is its name — and `React.ReactNode` admits `false | null | undefined`, so the
 * commonest spelling of a conditional badge (`{count > 0 && count}`) typechecks into the
 * COUNTED arm and then arrives empty. Measured before the guard: a 6.3px accent disc with a
 * null `aria-label` and no text — colour carrying meaning alone, which is the one thing the
 * type exists to prevent, and `{""}` did it without even the `data-dot` stamp.
 *
 * The fixture walks all four inputs because the type closes none of them, and both directions
 * matter: named, an empty badge IS the dot; unnamed, it is nothing. Chip's identical law
 * (`chip.browser.test.tsx`) is one component over, and this is the blind spot that copying it
 * would have carried — Badge's own type law tested `<Badge />`, the one spelling the union
 * does catch.
 */
describe("an empty badge is refused at runtime, because the type cannot refuse it", () => {
  for (const [label, child] of [
    ["a false conditional", false],
    ["an empty string", ""],
    ["null", null],
    ["undefined", undefined],
  ] as const) {
    it(`${label}, unnamed, renders no element at all`, () => {
      const root = mounted(
        <div data-t="host">
          <Badge>{child}</Badge>
        </div>,
        { theme: {} },
      );
      expect(root.querySelector(".kui-badge"), `${label} still drew a marker`).toBeNull();
    });

    it(`${label}, NAMED, is the dot the bare form means`, () => {
      const root = mounted(
        <div data-t="host">
          <Badge aria-label="Unread">{child}</Badge>
        </div>,
        { theme: {} },
      );
      const badge = root.querySelector<HTMLElement>(".kui-badge")!;
      expect(badge, `${label} with a name must still render`).not.toBeNull();
      expect(badge.hasAttribute("data-dot")).toBe(true);
      const box = badge.getBoundingClientRect();
      expect(box.width).toBeCloseTo(box.height, 1);
    });
  }

  it("but ZERO is content, and it renders as a count", () => {
    // The other half, and it is what stops the guard being "render nothing when it looks
    // empty": `0` is a legitimate count and a falsy value, and the guard must not confuse them.
    const root = mounted(
      <div data-t="host">
        <Badge>{0}</Badge>
      </div>,
      { theme: {} },
    );
    const badge = root.querySelector<HTMLElement>(".kui-badge")!;
    expect(badge.textContent).toBe("0");
    expect(badge.hasAttribute("data-dot")).toBe(false);
  });
});
