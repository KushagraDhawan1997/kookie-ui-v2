/**
 * Slider's laws, mounted (§4, §8, §11, §16).
 *
 * The claims that are the component's own: the ROOT is the control — so the height ladder is
 * the target and no new mechanism exists — the thumb is the mark family's third member, the
 * track is the neutral well at a designed thickness, and the fill is the accent identity
 * resolving through the tone indirection. Computed values through a mounted component, both
 * appearances, every cell that could move a number — the 2026-08-03 bar.
 */
import { describe, expect, it } from "vitest";
import * as React from "react";

import { Theme } from "../../theme/theme.tsx";
import {
  APPEARANCES,
  DENSITIES,
  POINTERS,
  SIZES,
  colorOn,
  computed,
  forEachCell,
  mounted,
  render,
  tokenOn,
} from "../../test/browser.tsx";
import { Checkbox } from "../checkbox/checkbox.tsx";
import { Slider } from "./slider.tsx";

const px = (v: string) => parseFloat(v);

/**
 * Base UI resolves the edge-aligned geometry after first layout — until then the thumb (and
 * its input) sit `visibility: hidden`, and a hidden input refuses focus. A law that read the
 * pre-settled frame would skip itself, so every geometry and interaction law waits here first.
 *
 * It waits on the CONDITION, not on a frame count (corrected 2026-08-06). Two `requestAnimation
 * Frame`s is the same wrong shape as the checkbox scan that ran off-viewport: it looks like a
 * wait and is really a guess, and under a full-suite load the measurement lands after them
 * roughly two runs in five — a law that fails 40% of the time in CI and passes alone teaches
 * nobody anything. Polling the thumb's own visibility is the real signal, and the deadline
 * THROWS rather than proceeding: never measure a frame that has not arrived.
 */
async function settled(host: Element): Promise<void> {
  const thumb = thumbOf(host);
  for (let i = 0; i < 200; i++) {
    if (getComputedStyle(thumb).visibility !== "hidden") return;
    await new Promise((r) => requestAnimationFrame(r));
  }
  throw new Error("slider never settled: the thumb stayed hidden for 200 frames");
}

const rootOf = (el: Element): HTMLElement =>
  (el.querySelector(".kui-slider") ?? el) as HTMLElement;
const thumbOf = (el: Element): HTMLElement => el.querySelector(".kui-slider-thumb")!;
const trackOf = (el: Element): HTMLElement => el.querySelector(".kui-slider-track")!;

/** Mounted with a width, because a track has no intrinsic one: the root fills its container. */
const slider = (props: React.ComponentProps<typeof Slider> = {}, theme?: object) => {
  const ui = (
    <div style={{ width: "240px" }}>
      <Slider aria-label="Amount" defaultValue={40} {...props} />
    </div>
  );
  return render(theme ? <Theme {...theme}>{ui}</Theme> : ui);
};

describe("the root is the control, and the height ladder is the target (§4, §16)", () => {
  it("stands exactly as tall as the Button beside it, in all 24 cells", () => {
    // The slider's entire target story: no pseudo-expansion, no reserve — the box you press
    // IS a control of its size, so it inherits §16's guarantees the way every control does.
    forEachCell(({ pointer, density, size }) => {
      const el = slider({ size }, { pointer, density });
      const root = rootOf(el);
      expect(
        px(getComputedStyle(root).height),
        `${pointer}/${density}/${size}`,
      ).toBe(px(tokenOn(el, `--control-height-${size}`)));
    });
  });

  it("carries the 44 target on the coarse default path, and the 24 floor everywhere", () => {
    // Rewritten to measure the box that ANSWERS a press, not the box that declares a height
    // (audit R4, 2026-08-06). Base UI's handlers live on .kui-slider-control, which stretched
    // to the root's CONTENT box — two border widths short — so the live strip was 43px inside
    // a 44px control and 23px inside the 24px cell, under the WCAG 2.5.8 minimum this repo
    // pins as a non-negotiable. The old law read getComputedStyle(root).height, saw 44 and 24,
    // and could never fail while the pressable box was 43 and 23.
    //
    // Two instruments, because each covers the other's blind spot. The rect comparison runs in
    // all 24 cells and needs no viewport, so it cannot be defeated by where the page scrolled.
    // The hit-test proves the box is genuinely pressable — not covered, not pointer-events
    // none — and runs on the two cells that carry the actual claims, because elementFromPoint
    // is viewport-relative and 24 stacked cells run off the bottom of the page.
    const pressBox = (el: HTMLElement) =>
      rootOf(el).querySelector<HTMLElement>(".kui-slider-control")!.getBoundingClientRect();

    const scanRows = (el: HTMLElement) => {
      const root = rootOf(el);
      root.scrollIntoView({ block: "center" });
      const r = root.getBoundingClientRect();
      // Anything not fully on screen would make elementFromPoint answer null for rows that are
      // really there, so the scan refuses to run rather than reporting a short count. A prior
      // audit shipped a law that scanned off-viewport and passed 24 cells measuring nothing.
      if (r.top < 0 || r.bottom > window.innerHeight) {
        throw new Error("slider target scan ran off-viewport");
      }
      let live = 0;
      for (let y = Math.ceil(r.top); y < r.bottom; y++) {
        const hit = document.elementFromPoint(r.left + r.width / 2, y + 0.5);
        if (!hit) throw new Error("slider target scan hit nothing");
        if (root.contains(hit) && hit.closest(".kui-slider-control")) live++;
      }
      return live;
    };

    const coarse = slider({ size: "2" }, { pointer: "coarse" });
    expect(px(getComputedStyle(rootOf(coarse)).height)).toBe(44);
    expect(Math.round(pressBox(coarse).height), "the coarse default path").toBe(44);
    expect(scanRows(coarse), "44 rows genuinely answer a press").toBe(44);

    // The floor cell: the smallest box the system can produce, which is exactly 24 and so has
    // no slack at all — this is the cell that shipped at 23.
    const floor = slider({ size: "1" }, { pointer: "fine", density: "compact" });
    expect(Math.round(pressBox(floor).height), "the 24px floor cell").toBe(24);
    expect(scanRows(floor), "24 rows genuinely answer a press").toBe(24);

    forEachCell(({ pointer, density, size }) => {
      const el = slider({ size }, { pointer, density });
      const where = `${pointer}/${density}/${size}`;
      const declared = px(getComputedStyle(rootOf(el)).height);
      expect(declared, where).toBeGreaterThanOrEqual(24);
      // The floor is about the box that answers a press, never the box that declares a height.
      const pressed = Math.round(pressBox(el).height);
      expect(pressed, `${where}: pressable box under the 24px floor`).toBeGreaterThanOrEqual(24);
      expect(pressed, `${where}: pressable box short of the control`).toBe(declared);
    });
  });

  it("fills its container's inline size — a track has no intrinsic width", () => {
    const el = slider();
    expect(px(getComputedStyle(rootOf(el)).width)).toBe(240);
  });
});

describe("the thumb is the mark family's third member (§4, §6)", () => {
  for (const size of SIZES) {
    for (const pointer of POINTERS) {
      it(`${pointer}/size ${size}: the family's square box — same painted size as the checkbox beside it`, () => {
        // Read as the PAINTED box (audit R1, 2026-08-06 — getBoundingClientRect is the border
        // box, the thing a user aims at). The grip is BACK ON the family's square (the capsule
        // tried 2026-08-07, reverted 2026-08-08 — Kushagra, by eye: too wide): both axes the
        // mark ladder, the one weight class beside a checkbox, no designed set of its own.
        //
        // BOTH pointer worlds since audit 2026-08-08: this ran through the bare `slider()`
        // helper, which stamps no Theme, so it only ever entered fine/default — and the
        // sibling radius law below compares the corner to height/2, which a horizontal
        // capsule satisfies exactly as a circle does. Re-shipping the reverted capsule on
        // every coarse cell passed the whole suite. Coarse is where the mark ladder's
        // numbers differ, and it was the world neither shape law entered.
        const el = slider({ size }, { pointer });
        const thumb = thumbOf(el).getBoundingClientRect();
        const checkbox = render(
          <Theme pointer={pointer}>
            <Checkbox size={size} />
          </Theme>,
        )
          .querySelector(".kui-checkbox")!
          .getBoundingClientRect();
        expect(thumb.height, `${pointer}/${size} block`).toBe(checkbox.height);
        expect(thumb.width, `${pointer}/${size} is square`).toBe(thumb.height);
      });
    }
  }

  it("rises on a coarse pointer because the type rose — the family's one coarse story", () => {
    const fine = slider({}, { pointer: "fine" });
    const coarse = slider({}, { pointer: "coarse" });
    expect(px(getComputedStyle(thumbOf(coarse)).height)).toBeGreaterThan(
      px(getComputedStyle(thumbOf(fine)).height),
    );
  });

  for (const level of ["none", "small", "medium", "large", "full"] as const) {
    it(`stays a circle at radius="${level}" — role semantics, Radio's own sentence`, () => {
      // Half the box — a square mark at h/2 IS a circle. The radius axis never reaches it,
      // `none` included: a square handle reads as a bead that stuck.
      const el = slider({}, { radius: level });
      const thumb = thumbOf(el);
      expect(px(computed(thumb, "border-top-left-radius"))).toBeCloseTo(
        px(getComputedStyle(thumb).height) / 2,
        1,
      );
      // Half the HEIGHT is what a capsule satisfies too, so the corner alone cannot tell the
      // two apart — the reverted shape passed this law unchanged (audit 2026-08-08). The box
      // is asserted here as well, so a capsule reintroduced at one radius level (below the
      // reach of the default-radius square law above) fails on the level it was hidden in.
      expect(px(getComputedStyle(thumb).width), `${level} squareness`).toBeCloseTo(
        px(getComputedStyle(thumb).height),
        1,
      );
    });
  }

  for (const appearance of APPEARANCES) {
    it(`${appearance}: rests on its own fill role, wearing the control edge`, () => {
      // The thumb left the seal 2026-08-07 (§11, "dark shouldn't be dark"): a grip must be
      // the most findable object on the rail, so dark goes near-white — iOS's own posture —
      // while light keeps the seal through the same role.
      const el = slider({}, { appearance });
      const thumb = thumbOf(el);
      expect(computed(thumb, "background-color")).toBe(colorOn(el, "var(--color-thumb)"));
      expect(computed(thumb, "border-top-color")).toBe(colorOn(el, "var(--control-edge)"));
      if (appearance === "dark") {
        // The decision, not the wiring: dark's handle must NOT be the seal it used to wear.
        expect(computed(thumb, "background-color")).not.toBe(colorOn(el, "var(--color-surface)"));
        expect(computed(thumb, "background-color")).toBe(colorOn(el, "var(--neutral-12)"));
      }
    });

    it(`${appearance}: the thumb casts ALWAYS — flat world included (§5, §6)`, () => {
      // The kill switch's second named exception, beside the circle: depth as role
      // semantics. The cast is the palette's control row read as a VALUE, so neither the
      // flat world nor a glass pane's one-lift rule can strip it.
      const flat = slider({}, { appearance, surfaces: "flat" });
      const probe = document.createElement("div");
      probe.style.boxShadow = "var(--control-chrome)";
      flat.append(probe);
      const expected = computed(probe, "box-shadow");
      expect(computed(thumbOf(flat), "box-shadow")).toBe(expected);
      expect(computed(thumbOf(flat), "box-shadow")).not.toBe("none");
      probe.remove();
      const elevated = slider({}, { appearance, surfaces: "elevated" });
      expect(computed(thumbOf(elevated), "box-shadow")).not.toBe("none");
    });
  }

  it.each(APPEARANCES)("%s: the thumb does NOT take the app's dress (§19)", (appearance) => {
    // REVERSED 2026-08-07 (Kushagra, from the preview: "the handle / thumb also shouldn't
    // subscribe to look axis"). This used to assert the opposite — that the thumb resolves the
    // same computed pair as a checkbox in both looks — and that was the axis landing on the
    // family rather than on a component, which was the right shape for the wrong members.
    //
    // A checkbox at rest is a small empty surface with a boundary, and the app's identity is a
    // statement about how resting surfaces are drawn, so it takes the dress like a card does.
    // A handle is not a surface you read, it is a grip you move, and its job is to stay the
    // same recognisable object while everything behind it changes. Button belongs to no dressed
    // family for the same reason; the thumb lands in Button's category despite sharing the
    // checkbox's geometry. The family shares its BOX, not its DRESS.
    const at = (look: "outlined" | "filled") => thumbOf(slider({}, { look, appearance }));
    for (const prop of ["background-color", "border-top-color"]) {
      expect(computed(at("filled"), prop), `the look reached the thumb's ${prop}`).toBe(
        computed(at("outlined"), prop),
      );
    }
    // The negative control, and it is the whole point of the narrowing: a checkbox in the same
    // two worlds must still MOVE, or the axis has simply been switched off for the family.
    const box = (look: "outlined" | "filled") =>
      computed(mounted(<Checkbox />, { theme: { look, appearance }, select: ".kui-checkbox" }), "background-color");
    expect(box("filled"), "the checkbox stopped answering the app's identity").not.toBe(
      box("outlined"),
    );
  });

  it.each(APPEARANCES)("%s: the WHOLE slider is outside the look axis (§19)", (appearance) => {
    // Settled 2026-08-07 after three passes, and the reversals are recorded in LOG because the
    // next value control meets the same fork. Kushagra: "slider has basically no reason to
    // subscribe to look axis, like button has no role."
    //
    // The axis dresses things whose resting state is a surface with a boundary — a card, a
    // field, a checkbox — where "how does this app draw a resting surface" has an answer. A
    // slider has no resting surface: it is a rail, a fill and a grip, an instrument shaped by
    // what it does. Progress will land here too.
    //
    // Every painted part, both looks, asserted together: a component leaves an axis completely
    // or it does not leave it, and a law that checked only the rail would have missed the thumb
    // (which was dressed until the day before this) and vice versa.
    const parts = (look: "outlined" | "filled") => {
      const el = slider({}, { look, appearance });
      return {
        rail: computed(trackOf(el), "background-color"),
        railEdge: computed(trackOf(el), "border-top-color"),
        fill: computed(el.querySelector(".kui-slider-fill")!, "background-color"),
        thumb: computed(thumbOf(el), "background-color"),
        thumbEdge: computed(thumbOf(el), "border-top-color"),
      };
    };
    const outlined = parts("outlined");
    const filled = parts("filled");
    for (const key of Object.keys(outlined) as (keyof typeof outlined)[]) {
      expect(filled[key], `the app's look reached the slider's ${key}`).toBe(outlined[key]);
    }
    // The negative control: the axis must still be doing its job elsewhere in the same app, or
    // this law passes in a world where `look` simply stopped working.
    const box = (look: "outlined" | "filled") =>
      computed(
        mounted(<Checkbox />, { theme: { look, appearance }, select: ".kui-checkbox" }),
        "background-color",
      );
    expect(box("filled"), "the checkbox stopped answering the app's identity").not.toBe(
      box("outlined"),
    );
  });

  it.each(APPEARANCES)("%s: the thumb is never its own rail", (appearance) => {
    // The defect the exclusion caused, and the reason the reversal is worth its bytes. The
    // thumb reads --look-mark-fill and the track read --color-track, and BOTH resolved to
    // --neutral-4 in both appearances — so a filled slider's handle was its rail at 1.000:1,
    // a control that cannot be seen or aimed at. Neither the mark laws nor the track law could
    // see it: each compared its own element to the token name its author had typed, and the
    // two were never compared to EACH OTHER.
    for (const look of ["outlined", "filled"] as const) {
      const el = slider({}, { look, appearance });
      expect(
        computed(thumbOf(el), "background-color"),
        `${look}/${appearance}: the thumb is invisible on its own track`,
      ).not.toBe(computed(trackOf(el), "background-color"));
    }
  });

  it("grows no target of its own — the root's box owns the question", () => {
    // A thumb with its own expander would out-target the control holding it (the audit's D4
    // inversion), and two range thumbs' invisible reaches would fight over track presses in
    // tree order rather than by proximity, which is Base UI's call to make.
    const el = slider();
    expect(getComputedStyle(thumbOf(el), "::after").content).toBe("none");
  });
});

describe("track low, fill accent (§11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: the track is the neutral well, the fill the accent solid`, () => {
      const el = slider({}, { appearance });
      expect(computed(trackOf(el), "background-color")).toBe(colorOn(el, "var(--color-track)"));
      expect(computed(el.querySelector(".kui-slider-fill")!, "background-color")).toBe(
        colorOn(el, "var(--accent-solid)"),
      );
      // The well is not the accent family: "track low" means neutral, and it must survive the
      // element stamping accent for its fill.
      expect(computed(trackOf(el), "background-color")).not.toBe(
        colorOn(el, "var(--accent-3)"),
      );
    });
  }

  for (const size of SIZES) {
    it(`size ${size}: the track is the designed thickness, under half its thumb`, () => {
      const el = slider({ size });
      const track = trackOf(el);
      expect(px(getComputedStyle(track).height)).toBe(px(tokenOn(el, `--slider-track-${size}`)));
      expect(px(getComputedStyle(track).height)).toBeLessThan(
        px(getComputedStyle(thumbOf(el)).height) / 2,
      );
    });
  }

  for (const density of DENSITIES) {
    it(`${density}: density moves the box, never the line or the handle`, () => {
      const el = slider({ size: "2" }, { density });
      expect(px(getComputedStyle(trackOf(el)).height)).toBe(px(tokenOn(el, "--slider-track-2")));
      expect(px(getComputedStyle(thumbOf(el)).height)).toBe(px(tokenOn(el, "--mark-2")));
    });
  }

  it("the fill spans the value's share of the track, thumb inside the ends", async () => {
    // `thumbAlignment="edge"` insets the geometry by the measured thumb, so Base UI resolves
    // the fill and handle positions after first layout — the law waits for the settled frame
    // rather than asserting against the pre-measurement one.
    const el = slider({ defaultValue: 50 });
    await settled(el);
    const track = trackOf(el).getBoundingClientRect();
    const fill = el.querySelector(".kui-slider-fill")!.getBoundingClientRect();
    const thumb = thumbOf(el).getBoundingClientRect();
    expect(fill.width).toBeGreaterThan(0);
    expect(fill.width).toBeLessThan(track.width);
    // The handle never overhangs the rail's ends — the alignment identity, measured.
    expect(thumb.left).toBeGreaterThanOrEqual(track.left);
    expect(thumb.right).toBeLessThanOrEqual(track.right + 0.5);
  });

  it("a range value renders one thumb per entry, same component", () => {
    const el = slider({ defaultValue: [20, 60] });
    expect(el.querySelectorAll(".kui-slider-thumb")).toHaveLength(2);
  });
});

describe("states arrive from the shared layer (§8)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: disabled greys the FILL through the one remap — and never the grip`, () => {
      // The fill is a surface and stands down with every other surface in the system. The GRIP
      // does not, since 2026-08-08: a grip is the tick, and its position is the value, so
      // greying it erases the reading rather than dimming it — the argument that kept
      // --color-thumb on the switch's thumb the day Switch shipped, applied here when the
      // audit measured the two grips landing at opposite ends of the lightness scale under
      // one state. In dark the remapped grip was darker than its own rail: the invisible
      // handle that minting --color-thumb existed to prevent, returning under `disabled`.
      const el = slider({ disabled: true, defaultValue: 50 }, { appearance });
      expect(computed(el.querySelector(".kui-slider-fill")!, "background-color")).toBe(
        colorOn(el, "var(--neutral-3)"),
      );
      expect(computed(thumbOf(el), "background-color")).toBe(colorOn(el, "var(--color-thumb)"));
      expect(computed(thumbOf(el), "background-color")).not.toBe(
        computed(el.querySelector(".kui-slider-track")!, "background-color"),
      );
      expect(computed(rootOf(el), "opacity")).toBe("1");
    });

    for (const surfaces of ["flat", "elevated"] as const) {
      it(`${appearance}/${surfaces}: a dead grip stops hovering — disabled takes the cast (audit 2026-08-07)`, () => {
        // "The thumb casts ALWAYS" is a statement about the WORLD, not about state. Reading the
        // palette row's VALUE is what makes it survive a flat app and a glass pane — and it also
        // walked the thumb out of the shared disabled arm, which stands the world switch down.
        // So this was the one control in the system that stayed lifted while dead: full shadow,
        // white top line, sitting next to a disabled Button that had correctly gone flat.
        //
        // Both worlds, because the bug was invisible in neither: flat is where "always" does the
        // work, elevated is where every other control also casts.
        const live = slider({}, { appearance, surfaces });
        const dead = slider({ disabled: true }, { appearance, surfaces });
        expect(computed(thumbOf(live), "box-shadow")).not.toBe("none");
        expect(computed(thumbOf(dead), "box-shadow")).toBe("none");
      });
    }
  }

  it("the ring lands on the thumb, real and token-valued, when the hidden input holds focus", async () => {
    const el = slider();
    await settled(el);
    const thumb = thumbOf(el);
    expect(getComputedStyle(thumb).outlineStyle).toBe("none");
    const input = thumb.querySelector("input")!;
    input.focus();
    expect(document.activeElement).toBe(input);
    const focused = getComputedStyle(thumb);
    expect(focused.outlineStyle).toBe("solid");
    expect(focused.outlineColor).toBe(colorOn(el, "var(--focus-ring)"));
    expect(focused.outlineWidth).toBe(tokenOn(el, "--focus-ring-width"));
  });

  it("keyboard moves the value — the platform wiring survives the dress", async () => {
    // A real key press, not a synthetic event: an untrusted KeyboardEvent cannot drive a
    // native range input's default action, so a dispatchEvent version passes only when the
    // wiring is bypassed — the vacuity this suite forbids.
    const { userEvent } = await import("vitest/browser");
    const el = slider({ defaultValue: 40, step: 5 });
    await settled(el);
    const input = thumbOf(el).querySelector("input")!;
    expect(input.type).toBe("range");
    expect(px(input.value)).toBe(40);
    input.focus();
    expect(document.activeElement).toBe(input);
    await userEvent.keyboard("{ArrowRight}");
    expect(px(input.value)).toBe(45);
  });

  it("an invalid slider's focus ring reads the invalid edge, inherited from the root's remap", () => {
    const el = slider({ "aria-invalid": true } as never);
    const root = rootOf(el);
    expect(root.getAttribute("aria-invalid")).toBe("true");
    expect(colorOn(root, "var(--focus-ring)")).toBe(colorOn(el, "var(--invalid-edge)"));
  });
});

describe("the API's closed edges (§3)", () => {
  it("refuses children, render, orientation, thumbAlignment, and the axes it never had", () => {
    // @ts-expect-error — the anatomy is the component's: five elements wired by Base UI,
    // none of which can move (TextField's argument, with more elements)
    void (<Slider>content</Slider>);
    // @ts-expect-error — same refusal from the other side
    void (<Slider render={<div />} />);
    // @ts-expect-error — horizontal is the designed geometry; vertical ships as its own
    // designed set the day something forces it, never as undesigned numbers today
    void (<Slider orientation="vertical" />);
    // @ts-expect-error — the thumb stays inside the rail's ends: an identity, not a knob
    void (<Slider thumbAlignment="center" />);
    // @ts-expect-error — a value is not an action; loudness ranks actions (§11)
    void (<Slider emphasis="loud" />);
    // @ts-expect-error — the fill's family is an identity, not an axis (§11)
    void (<Slider tone="destructive" />);
    // @ts-expect-error — a 5px line of blur is a 5px line (§10)
    void (<Slider material="thin" />);
    // @ts-expect-error — no margin prop on any control (first non-negotiable)
    void (<Slider m="4" />);
  });

  it("the ref names the root div — what className and style dress", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <div style={{ width: "200px" }}>
        <Slider ref={ref} aria-label="Amount" />
      </div>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current!.classList.contains("kui-slider")).toBe(true);
  });

  it("the accessible name reaches the range input", () => {
    const el = slider({ "aria-label": "Volume" });
    expect(thumbOf(el).querySelector("input")!.getAttribute("aria-label")).toBe("Volume");
  });
});

describe("the rail is a well, and the radius axis DOES reach it (§6, audit R8)", () => {
  // Fixed 2026-08-07 (Kushagra: "we need to fix this"). The rail's corner was
  // calc(track / 2) — a designed px with no palette token anywhere in the chain — so it stayed
  // a capsule under `radius="none"` while the root, Button, Checkbox and TextField all squared
  // off. §6 claimed exactly two corners escape the kill switch, the radio and the thumb, both
  // on role-legibility grounds. The rail was a silent third, escaping by arithmetic rather
  // than by argument, and nothing in LOG's exhaustive slider entry ever mentioned it.
  const LEVELS = ["none", "small", "medium", "large", "full"] as const;

  for (const size of SIZES) {
    it(`size ${size}: squares at none, and keeps its capsule everywhere else`, () => {
      const none = slider({ size }, { radius: "none" });
      expect(
        px(computed(trackOf(none), "border-top-left-radius")),
        "the kill switch does not reach the rail",
      ).toBe(0);
      // The fill rides the rail's corner, so it must square with it or the accent part paints
      // a rounded cap inside a square well.
      expect(px(computed(none.querySelector(".kui-slider-fill")!, "border-top-left-radius"))).toBe(0);

      // Everywhere else the end cap is HALF THE RAIL, unchanged by the level — a well's cap is
      // a property of its own thickness, not a pick into the box palette. These cells render
      // byte-identically to the pre-fix build, which is what makes `min()` the whole fix.
      for (const level of LEVELS.filter((l) => l !== "none")) {
        const el = slider({ size }, { radius: level });
        const half = px(computed(trackOf(el), "block-size")) / 2;
        expect(
          px(computed(trackOf(el), "border-top-left-radius")),
          `${level}/size ${size}: the cap is no longer half the rail`,
        ).toBeCloseTo(half, 1);
      }
    });
  }

  it("and the two role circles still escape, which is the exception §6 actually names", () => {
    // The negative control for the law above: squaring the rail must NOT have squared the
    // thumb, whose circle is role semantics and survives `none` on purpose.
    const el = slider({}, { radius: "none" });
    const thumb = px(computed(thumbOf(el), "border-top-left-radius"));
    expect(thumb, "the thumb lost its circle").toBeGreaterThan(0);
  });
});
