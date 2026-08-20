/**
 * The motion system's cross-component laws, mounted (§8).
 *
 * Two things live here that no component file can hold. The first is `prefers-reduced-motion`,
 * which the suite could not enter until 2026-08-10 and therefore had never once executed: the
 * suppression was asserted by READING the stylesheet for a guarded block and checking which
 * selectors appeared inside it, every character of which was correct while the focus ring went
 * on landing for a user who had asked the operating system for stillness. A selector present in
 * a block still has to WIN. The second is what hover does across families, which is a question
 * about the relationship between them: the shared rule steps a fill, and two families do not
 * have a fill that moves.
 */
import { describe, expect, it } from "vitest";

import { Theme } from "../theme/theme.tsx";
import {
  APPEARANCES,
  asksForStillness,
  computed,
  inMotion,
  mounted,
  render,
  sweep,
  tokenOn,
} from "../test/browser.tsx";
import { Button } from "../components/button/button.tsx";
import { Checkbox } from "../components/checkbox/checkbox.tsx";
import { Radio, RadioGroup } from "../components/radio/radio.tsx";
import { Slider } from "../components/slider/slider.tsx";
import { Switch } from "../components/switch/switch.tsx";
import { TextArea } from "../components/text-area/text-area.tsx";
import { TextField } from "../components/text-field/text-field.tsx";

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

/** Watch one property across a whole arrival, bounded by the clock rather than a frame count. */
async function track(el: Element, property: string, ms: number): Promise<string[]> {
  const samples: string[] = [];
  const deadline = performance.now() + ms;
  while (performance.now() < deadline) {
    samples.push(computed(el, property));
    await frame();
  }
  return samples;
}

describe("reduce means reduce (§8)", () => {
  /**
   * The law the defect of 2026-08-10 needed, and the reason it survived: the old one read text.
   *
   * `.kui-control:focus-visible:not(input, textarea, .kui-row)` is (0,3,0) — `:not()` takes the
   * specificity of its most specific ARGUMENT rather than summing the list — and the stand-down
   * `.kui-control:focus-visible { animation: none }` is (0,2,0). A media query adds nothing, so
   * the ring landed under `reduce` in every browser, for six days, with the suite green: the
   * suppression law walked `transition` declarations and this was an `animation`, and even for
   * transitions it only asked whether a selector was PRESENT in the guarded block.
   */
  it("a button's ring does not land when the system asked for stillness", async () => {
    const el = mounted(<Button>Press</Button>, { theme: {} });
    inMotion();
    el.focus();
    expect(computed(el, "animation-name"), "the ring lands by default").toBe("kui-ring-land");

    await asksForStillness();
    expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
    el.blur();
    el.focus();
    expect(computed(el, "animation-name"), "and it must stop when asked").toBe("none");
    // The ring itself does not go away — stillness removes the travel, never the affordance.
    expect(parseFloat(computed(el, "outline-width"))).toBeGreaterThan(0);
    expect(parseFloat(computed(el, "outline-offset"))).toBe(
      parseFloat(tokenOn(el, "--focus-ring-offset")),
    );
  });

  it("and the paint stops with it — suppression is total, not partial (§8)", async () => {
    const el = mounted(<Button>Press</Button>, { theme: {} });
    inMotion();
    expect(computed(el, "transition-duration")).not.toBe("0s");
    await asksForStillness();
    // Every channel, not just the first: a suppression that leaves one moving is worse than
    // none, because the user who asked for stillness gets it in pieces.
    for (const each of computed(el, "transition-duration").split(",")) {
      expect(each.trim(), computed(el, "transition-property")).toBe("0s");
    }
  });

  it("the moving PARTS stop too — a selector in the block still has to WIN (§8, 2026-08-10)", async () => {
    /**
     * The Button law above proves the shared stand-down only for the element whose transition
     * is declared in the SAME file, where the tie goes to source order. Every moving part a
     * component ADDS — the tick's stroke, the radio's dot, the switch's grip — is declared in
     * a component sheet that imports AFTER recipes.css, and the dot's selector
     * (`.kui-radio > svg > circle`, (0,1,2)) outruns the stand-down's `.kui-control *`
     * ((0,1,0)) on specificity alone; the tick and the thumb tie it and win on file order.
     * The coverage law in recipes.test.ts reads which selectors APPEAR inside the guarded
     * block — every character of it true while all three parts kept their clocks under
     * `reduce`. This is that law's mounted half: enter the media query, read the computed
     * duration on the part itself.
     */
    // Every subject is mounted in the STATE whose clock is live — the first spelling of this
    // law pointed at an unchecked radio and a checked box's dash, both of which ride their own
    // instant-out arms (`transition-duration: 0s`) in every mode, so deleting their stand-downs
    // changed nothing and the sabotage pass caught the law, not the code. An instrument has to
    // be pointed at the state it names.
    const host = render(
      <Theme>
        <Checkbox defaultChecked />
        <Checkbox indeterminate />
        <RadioGroup defaultValue="a">
          <Radio value="a" />
        </RadioGroup>
        <Switch defaultChecked />
        <Slider defaultValue={40} aria-label="Motion subject" />
      </Theme>,
    );
    const parts: Array<[string, Element]> = [
      ["the tick's stroke", host.querySelector("svg[data-checked] > .kui-checkbox-check")!],
      ["the dash's stroke", host.querySelector("svg[data-indeterminate] > .kui-checkbox-dash")!],
      ["the radio's dot", host.querySelector(".kui-radio > svg > circle")!],
      ["the switch's grip", host.querySelector(".kui-switch-thumb")!],
      ["the slider's grip", host.querySelector(".kui-slider-thumb")!],
    ];
    inMotion();
    for (const [name, part] of parts) {
      expect(part, name).toBeTruthy();
      // Per-part calibration: each subject must have a real clock while motion is on, or its
      // stillness assertion below is vacuous — which is how the first spelling failed.
      const channels = computed(part, "transition-duration").split(",").map((d) => d.trim());
      expect(channels.some((d) => d !== "0s"), `${name} has no clock to stand down`).toBe(true);
    }

    await asksForStillness();
    for (const [name, part] of parts) {
      for (const each of computed(part, "transition-duration").split(",")) {
        expect(each.trim(), `${name} keeps moving under reduce`).toBe("0s");
      }
    }
  });
});

describe("the ring lands where landing reads as motion, and nowhere else (§8)", () => {
  it("a button's travels, and it travels in whole pixels — which is the constraint", async () => {
    /**
     * The measurement that decided a field gets no arrival at all (2026-08-10).
     *
     * Chrome resolves `outline-offset` to whole CSS pixels, so a ring animation renders as one
     * frame per pixel of travel however long its clock is. The button's 4px (6 down to 2) is
     * five distinct values and reads as movement. A field's only available room is the offset
     * itself — 2px, three values — which Kushagra called on sight as growing "in steps, like so
     * jaggedy". The law pins the mechanism rather than the taste: if this ever reports fewer
     * steps than the pixels it crosses, the engine started interpolating and the refusal below
     * is worth reopening.
     *
     * IT DRIVES THE ANIMATION'S OWN CLOCK, AND UNTIL 2026-08-20 IT WATCHED FRAMES (CI: "the
     * ring did not travel at all: expected 2 to be greater than 2").
     *
     * A sampler only ever sees a value some frame happened to be painted on, so on a loaded
     * runner it reports two — which is what a ring that never moved reports as well. Those are
     * opposite bugs and the metric cannot tell them apart, so no bound on it is evidence for
     * either; that is the whole lesson of the menu's three sampled metrics the same day. The
     * 2026-08-17 pass moved ONE of the claims onto the token and left the other three reading
     * the machine.
     *
     * The animation is paused and stepped instead. What is read is what the engine RENDERS at
     * each station of the arrival — the interpolation question this law actually asks — at a
     * resolution nothing about the host can change, so the series is the same on an idle laptop
     * and a stalling CI runner. It is also a STRONGER instrument: a hundred stations across a
     * 4px travel is where "the engine quantises to whole pixels" can be seen at all, and the
     * frame sampler could never have caught more than a handful of them.
     */
    const el = mounted(<Button>Press</Button>, { theme: {} });
    inMotion();
    el.focus();
    const rest = parseFloat(tokenOn(el, "--focus-ring-offset"));
    const land = parseFloat(tokenOn(el, "--focus-ring-land"));

    // The arrival is grabbed in the statement after the focus that starts it, because a CSS
    // animation is gone from getAnimations() once it has finished and a stalled runner can
    // spend the whole ~200ms between two statements. The re-focus is a retry that costs
    // nothing when the first try works, which is every time.
    const landing = () =>
      el.getAnimations().some((a) => "animationName" in a && a.animationName === "kui-ring-land");
    for (let retry = 0; retry < 5 && !landing(); retry++) {
      el.blur();
      el.focus();
    }
    expect(landing(), "the ring must land by an animation — it is the subject").toBe(true);

    const series = await sweep(el, "kui-ring-land", () => parseFloat(computed(el, "outline-offset")), 100);
    const seen = [...new Set(series)];

    expect(series[0]!, "it must begin outside its resting offset").toBeCloseTo(rest + land, 1);
    expect(series.at(-1)!, "and settle exactly on it").toBeCloseTo(rest, 1);
    // Whole pixels, every one of them — the fact that bounds how short a ring's travel can be.
    // Read across the whole arrival rather than at the frames that happened to land, so a
    // single interpolated station anywhere in it fails here.
    for (const value of seen) expect(value, `${seen.join(",")}`).toBe(Math.round(value));
    // It genuinely moves through values rather than snapping between the two ends. A claim
    // about the ENGINE now, not about how many frames the host could spare.
    expect(seen.length, `the ring did not travel at all: ${seen.join(",")}`).toBeGreaterThan(2);
    // And the travel is stated on the TOKEN (2026-08-17): whole pixels mean a 4px landing
    // renders as five steps and a 2px one as three, so the pixels are the thing that must not
    // shrink. Kept as it was — it was the one claim here that never read the machine.
    expect(land, "a landing needs enough pixels to read as one").toBeGreaterThanOrEqual(4);
    expect(Math.max(...seen) - Math.min(...seen), "and it must cross all of them").toBeCloseTo(land, 1);
  });

  it("a field's ring is instant — the one arrival the mechanism cannot carry", async () => {
    // A refusal, measured rather than asserted: the ring appears at its resting offset and
    // stays there. Both members, because the family answers this together.
    const root = render(
      <Theme>
        <TextField placeholder="type" />
        <TextArea rows={2} />
      </Theme>,
    );
    inMotion();
    const wrapper = root.querySelector<HTMLElement>(".kui-field")!;
    const area = root.querySelector<HTMLElement>(".kui-textarea")!;
    const rest = parseFloat(tokenOn(wrapper, "--focus-ring-offset"));

    root.querySelector<HTMLElement>(".kui-field-input")!.focus();
    expect(computed(wrapper, "animation-name")).toBe("none");
    expect([...new Set(await track(wrapper, "outline-offset", 200))]).toEqual([`${rest}px`]);

    area.focus();
    expect(computed(area, "animation-name")).toBe("none");
    expect([...new Set(await track(area, "outline-offset", 200))]).toEqual([`${rest}px`]);
  });

  it("a control hosted in a field still gets its own ring (§4)", () => {
    const root = render(
      <Theme>
        <TextField placeholder="type" trailing={<Button size="1">Clear</Button>} />
      </Theme>,
    );
    inMotion();
    const wrapper = root.querySelector<HTMLElement>(".kui-field")!;
    const hosted = root.querySelector<HTMLElement>(".kui-button")!;
    expect(wrapper.contains(hosted), "the button must really be inside the field").toBe(true);

    hosted.focus();
    expect(computed(hosted, "animation-name"), "a hosted button still lands").toBe("kui-ring-land");
    // And the field it sits in is not focused by its child holding focus — the 2026-08-05 fix.
    expect(computed(wrapper, "outline-style")).toBe("none");
  });
});

describe("hover reaches every family, including the two with no fill to step (§8)", () => {
  /**
   * Kushagra, on the playground: *"there's no hover darkening of border on text field or
   * checkbox"*. There was not, and it was structural rather than a tuning miss: the shared
   * hover rule steps the FILL, and these are exactly the families whose fill is held still —
   * a field's by an invariant it has carried since 2026-08-04, a mark's because its seal barely
   * moves. Measured before the fix, a hovered field computed byte-identical to its resting
   * self, which is what "no hover state at all" looks like in numbers.
   */
  for (const appearance of APPEARANCES) {
    it(`hover is one step in one currency, under a real pointer — ${appearance}`, async () => {
      const root = render(
        <Theme appearance={appearance}>
          <TextField placeholder="a" />
          <TextArea rows={2} />
          <Checkbox />
        </Theme>,
      );
      const { userEvent } = await import("vitest/browser");
      const subjects: [string, HTMLElement][] = [
        ["field", root.querySelector<HTMLElement>(".kui-field")!],
        ["textarea", root.querySelector<HTMLElement>(".kui-textarea")!],
        ["checkbox", root.querySelector<HTMLElement>(".kui-checkbox")!],
      ];
      // THE CURRENCY CHANGED 2026-08-17, and with it this law's subject property.
      //
      // It was written (2026-08-10) for exactly the two families whose FILL was held still: a
      // field pinned to the seal, a mark stepping invisibly inside it. With no fill to move,
      // their hover had to be carried by the boundary, so the shared layer stepped the border
      // toward the family's ink. The fill-first flip gave both families a dress fill with
      // designed hover and active slots, so the ordinary fill rule reaches them — and keeping
      // the border mix as well made a hovered field move in TWO currencies at once, which is
      // what Kushagra saw as "hover too aggressive". The boundary rule was deleted.
      //
      // What survives is the principle, and it is the stronger claim: hover is ONE step, in
      // the one currency the control's identity is made of. So this asserts the fill moves AND
      // that the border does not — a law that only checked the fill would go green again the
      // day someone re-adds a second channel.
      for (const [name, el] of subjects) {
        const restFill = computed(el, "background-color");
        const restEdge = computed(el, "border-color");
        await userEvent.hover(el);
        expect(el.matches(":hover"), `${name}: the harness must really be hovering`).toBe(true);
        expect(
          computed(el, "background-color"),
          `${name} does not answer the pointer`,
        ).not.toBe(restFill);
        expect(
          computed(el, "border-color"),
          `${name} moves in two currencies at once`,
        ).toBe(restEdge);
        await userEvent.unhover(el);
      }
    });
  }

  it("and it steps on the paint clock, not on a spring — a colour is a signal (§8)", async () => {
    const root = render(
      <Theme>
        <TextField placeholder="a" />
      </Theme>,
    );
    inMotion();
    const wrapper = root.querySelector<HTMLElement>(".kui-field")!;
    const properties = computed(wrapper, "transition-property").split(",").map((p) => p.trim());
    const durations = computed(wrapper, "transition-duration").split(",").map((d) => d.trim());
    const easings = computed(wrapper, "transition-timing-function").split(/,(?![^(]*\))/);
    const at = properties.indexOf("border-color");
    expect(at, "the edge must be on a clock at all").toBeGreaterThan(-1);
    expect(durations[at]).not.toBe("0s");
    expect(easings[at], "paint eases, it does not spring").not.toContain("linear(");
  });
});

describe("a field does not move (§8)", () => {
  it("nothing on it travels or scales under a real pointer, and the seal holds", async () => {
    const root = render(
      <Theme>
        <TextField placeholder="type" />
      </Theme>,
    );
    const wrapper = root.querySelector<HTMLElement>(".kui-field")!;
    const { userEvent } = await import("vitest/browser");
    const restingFill = computed(wrapper, "background-color");

    // Deliberately NOT in motion: this asks about the resting relationship — whether hovering a
    // field changes its BOX at all — and a live clock would answer with an animated value.
    expect(computed(wrapper, "translate"), "a field sits still").toBe("none");
    expect(computed(wrapper, "scale")).toBe("none");

    await userEvent.hover(wrapper);
    expect(wrapper.matches(":hover"), "the harness must really be hovering").toBe(true);
    expect(computed(wrapper, "translate"), "a field has nowhere to go — §8").toBe("none");
    expect(computed(wrapper, "scale")).toBe("none");
    // The fill INVARIANT INVERTED 2026-08-17, and the law is about the box either way. "The
    // border carries a field's states and the seal does not move" was the bordered-box
    // identity's sentence; the field rests on a well now, so its fill is exactly what a
    // pointer moves (one step, one currency — motion's hover law above). What this law owns
    // is the GEOMETRY claim: a field does not travel or scale. The fill assertion stays, with
    // its polarity corrected, so the two laws cannot both be satisfied by a dead control.
    expect(
      computed(wrapper, "background-color"),
      "a field's own currency is its fill, and the pointer moves it",
    ).not.toBe(restingFill);
  });
});
