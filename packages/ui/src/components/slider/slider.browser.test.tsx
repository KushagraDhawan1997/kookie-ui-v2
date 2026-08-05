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
  SIZES,
  colorOn,
  computed,
  forEachCell,
  render,
  tokenOn,
} from "../../test/browser.tsx";
import { Checkbox } from "../checkbox/checkbox.tsx";
import { Slider } from "./slider.tsx";

const px = (v: string) => parseFloat(v);

/** Base UI resolves the edge-aligned geometry after first layout — until then the thumb (and
 * its input) sit `visibility: hidden`, and a hidden input refuses focus. Interaction laws
 * wait for the settled frame; a law that focused the pre-settled input would skip itself. */
const settled = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

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
    const coarse = slider({ size: "2" }, { pointer: "coarse" });
    expect(px(getComputedStyle(rootOf(coarse)).height)).toBe(44);
    forEachCell(({ pointer, density, size }) => {
      const el = slider({ size }, { pointer, density });
      expect(px(getComputedStyle(rootOf(el)).height)).toBeGreaterThanOrEqual(24);
    });
  });

  it("fills its container's inline size — a track has no intrinsic width", () => {
    const el = slider();
    expect(px(getComputedStyle(rootOf(el)).width)).toBe(240);
  });
});

describe("the thumb is the mark family's third member (§4, §6)", () => {
  for (const size of SIZES) {
    it(`size ${size}: the thumb IS the mark — the same box a checkbox of this size paints`, () => {
      const el = slider({ size });
      const thumb = thumbOf(el);
      const checkbox = render(<Checkbox size={size} />);
      const styles = getComputedStyle(thumb);
      expect(px(styles.height)).toBe(px(getComputedStyle(checkbox).height));
      expect(px(styles.width)).toBe(px(styles.height));
    });
  }

  it("rises on a coarse pointer because the type rose — the family's one coarse story", () => {
    const fine = slider({}, { pointer: "fine" });
    const coarse = slider({}, { pointer: "coarse" });
    expect(px(getComputedStyle(thumbOf(coarse)).height)).toBeGreaterThan(
      px(getComputedStyle(thumbOf(fine)).height),
    );
  });

  for (const level of ["none", "small", "medium", "large", "full"] as const) {
    it(`stays a circle at radius="${level}" — role semantics, Radio's sentence verbatim`, () => {
      const el = slider({}, { radius: level });
      const thumb = thumbOf(el);
      expect(px(computed(thumb, "border-top-left-radius"))).toBeCloseTo(
        px(getComputedStyle(thumb).height) / 2,
        1,
      );
    });
  }

  for (const appearance of APPEARANCES) {
    it(`${appearance}: rests as every mark rests — the seal wearing the mark edge`, () => {
      const el = slider({}, { appearance });
      const thumb = thumbOf(el);
      expect(computed(thumb, "background-color")).toBe(colorOn(el, "var(--color-surface)"));
      expect(computed(thumb, "border-top-color")).toBe(colorOn(el, "var(--mark-edge)"));
    });
  }

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
    await settled();
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
    it(`${appearance}: disabled greys the fill AND the thumb through the one remap`, () => {
      const el = slider({ disabled: true, defaultValue: 50 }, { appearance });
      expect(computed(el.querySelector(".kui-slider-fill")!, "background-color")).toBe(
        colorOn(el, "var(--neutral-3)"),
      );
      expect(computed(thumbOf(el), "background-color")).toBe(colorOn(el, "var(--neutral-3)"));
      expect(computed(rootOf(el), "opacity")).toBe("1");
    });
  }

  it("the ring lands on the thumb, real and token-valued, when the hidden input holds focus", async () => {
    const el = slider();
    await settled();
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
    await settled();
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
