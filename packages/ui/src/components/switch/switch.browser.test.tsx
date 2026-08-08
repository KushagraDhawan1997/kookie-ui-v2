/**
 * Switch's laws, mounted (§4, §5, §6, §8, §11, §19).
 *
 * The family's machinery is asserted cell by cell in checkbox.browser.test.tsx; what is
 * asserted here is what is the SWITCH's: the one-index shift and where it goes inert, the
 * width ladder riding the band picks, the capsule and the circle the radius axis never
 * reaches, the off state as a well outside the look axis, and the grip that casts always.
 * Computed values through a mounted component, both appearances — the 2026-08-03 bar, and
 * every law below was made to fail against a deliberately broken value before it was
 * trusted (the 2026-08-05 addendum).
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
import { Slider } from "../slider/slider.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Switch } from "./switch.tsx";

const px = (v: string) => parseFloat(v);

const markOf = (el: Element): Element => el.querySelector(".kui-switch") ?? el;
const thumbOf = (el: Element): Element => markOf(el).querySelector(".kui-switch-thumb")!;

function box(el: Element): { w: number; h: number } {
  const styles = getComputedStyle(el);
  return { w: px(styles.width), h: px(styles.height) };
}

describe("the shifted member: the track is mark(n + 1), by identity (§4)", () => {
  for (const pointer of POINTERS) {
    it(`${pointer}: the track's height is the mark one index up, at every size`, () => {
      for (const size of SIZES) {
        const el = render(
          <Theme pointer={pointer}>
            <Switch size={size} />
          </Theme>,
        );
        const up = px(tokenOn(el, `--mark-${Number(size) + 1}`));
        expect(box(markOf(el)).h, `${pointer}/${size}`).toBe(up);
      }
    });
  }

  it("stands one step taller than the checkbox beside it — except where the band collapses", () => {
    // The recorded wrinkle, asserted in BOTH directions rather than papered over: the
    // handheld band prices type steps 4 and 5 alike, so at coarse size 4 the shift is
    // inert and the two controls stand level. Everywhere else the shift is real.
    for (const pointer of POINTERS) {
      for (const size of SIZES) {
        const host = render(
          <Theme pointer={pointer}>
            <Switch size={size} />
            <Checkbox size={size} />
          </Theme>,
        );
        const sw = box(host.querySelector(".kui-switch")!).h;
        const cb = box(host.querySelector(".kui-checkbox")!).h;
        if (pointer === "coarse" && size === "4") {
          expect(sw, "the collapse is a fact, not a bug").toBe(cb);
        } else {
          expect(sw, `${pointer}/${size}`).toBeGreaterThan(cb);
        }
      }
    }
  });

  it("the width rides the same band picks as the height — one designed ladder, two worlds", () => {
    // Coarse size n renders fine size n+1's width for the same reason its track renders
    // that size's height: the band moved the pick, nothing was designed twice. The top
    // cell repeats where the band collapses, like the height it belongs to.
    const at = (pointer: "fine" | "coarse", size: "1" | "2" | "3" | "4") =>
      box(
        markOf(
          render(
            <Theme pointer={pointer}>
              <Switch size={size} />
            </Theme>,
          ),
        ),
      ).w;
    expect(at("coarse", "1")).toBe(at("fine", "2"));
    expect(at("coarse", "2")).toBe(at("fine", "3"));
    expect(at("coarse", "3")).toBe(at("fine", "4"));
    expect(at("coarse", "4")).toBe(at("fine", "4"));
    // And the ladder is genuinely wider than tall in every cell — a switch that is not is
    // a checkbox (the failure this whole ladder exists to prevent).
    forEachCell(({ pointer, density, size }) => {
      const el = render(
        <Theme pointer={pointer} density={density}>
          <Switch size={size} />
        </Theme>,
      );
      const { w, h } = box(markOf(el));
      expect(w, `${pointer}/${density}/${size}`).toBeGreaterThan(h * 1.5);
    });
  });

  it("the rendered width IS its own cell of the ladder — the join is read, not assumed", () => {
    // The law the audit of 2026-08-08 found missing, and the reason it was missing is the
    // one this repo keeps relearning: every OTHER width assertion here is relative. The
    // cross-world equalities above are invariant under a uniform join error (one join
    // serves both pointer worlds, so a wrong pick moves both sides), the band ratio is
    // pinned on the TOKENS in tokens.test.ts and never sees the join, and `w > h * 1.5`
    // has no upper bound. Collapsing all four entries of the size join onto --switch-w-4
    // rendered every switch 48px wide and the whole suite stayed green.
    //
    // So this reads the size join's only output the way the height law reads its own:
    // the painted box against the token that size is supposed to pick. It is the single
    // place `--kui-ct-sw-w` is proved to carry the right cell.
    forEachCell(({ pointer, density, size }) => {
      const el = render(
        <Theme pointer={pointer} density={density}>
          <Switch size={size} />
        </Theme>,
      );
      expect(box(markOf(el)).w, `${pointer}/${density}/${size}`).toBeCloseTo(
        px(tokenOn(el, `--switch-w-${size}`)),
        1,
      );
    });
  });

  it("the target is a control of its size capped at the touch floor, in all 24 cells", () => {
    forEachCell(({ pointer, density, size }) => {
      const el = render(
        <Theme pointer={pointer} density={density}>
          <Switch size={size} />
        </Theme>,
      );
      const height = px(tokenOn(el, `--control-height-${size}`));
      const floor = px(tokenOn(el, "--touch-target-min"));
      const cell = `${pointer}/${density}/${size}`;
      const after = getComputedStyle(markOf(el), "::after");
      expect(px(after.height), cell).toBeCloseTo(Math.min(height, floor), 1);
      // And the INLINE extent, which had no law until audit 2026-08-08 (§16, §4). The family's
      // expander is one uniform `inset` shorthand written for a square box; the switch is the
      // first mark that is not square, so the same inset grows the target on both axes and the
      // reach past each inline edge is a number nobody stated. §16 permits invisible expansion
      // only because "the extent is not guessed" — it is the box a control of that size already
      // occupies — so the inline extent owes the same sentence: the target may not reach past
      // the painted width by more than it reaches past the painted height.
      const painted = box(markOf(el));
      const blockReach = px(after.height) - painted.h;
      const inlineReach = px(after.width) - painted.w;
      expect(inlineReach, `${cell}: the target reaches further sideways than it does vertically`)
        .toBeCloseTo(blockReach, 1);
    });
  });

  it("density moves nothing — not the track, not the width, not the thumb", () => {
    const boxes = DENSITIES.map((density) => {
      const el = render(
        <Theme density={density}>
          <Switch size="3" />
        </Theme>,
      );
      return { track: box(markOf(el)), thumb: box(thumbOf(el)) };
    });
    for (const b of boxes.slice(1)) expect(b).toEqual(boxes[0]);
  });

  it("hosted in a field's slot it stays a SWITCH — wider than tall, its own reach given up (§4, D4)", () => {
    const el = render(
      <Theme pointer="fine">
        <TextField size="2" trailing={<Switch size="1" />} />
      </Theme>,
    );
    const sw = el.querySelector(".kui-switch")!;
    const { w, h } = box(sw);
    // The family's hosted floor squares a mark; the switch keeps its travel instead. The
    // designed identity holds because a size-1 track fits a size-2 slot.
    expect(h).toBe(px(tokenOn(el, "--mark-2")));
    expect(w).toBeGreaterThan(h * 1.5);
    expect(getComputedStyle(sw, "::after").content).toBe("none");
    // And the thumb derives from the box it sits in, so it cannot overflow a floored cell.
    expect(box(thumbOf(el)).h).toBeLessThan(h);
  });

  it("a genuinely tighter slot shortens the channel WITHOUT stretching its aspect (§4)", () => {
    // The law above mounts the one pairing where the hosted rule is inert: a size-1 track
    // fits a size-2 slot, so `min(mark, hosted-height)` returns the mark and both variable
    // halves of the expression cancel. Deleting the floor outright, or dropping its
    // travel-compensation term (which renders a hosted switch 59% too wide and stretches
    // the field around it), passed every law in this file — audit 2026-08-08.
    //
    // The claim the CSS actually makes is a RELATION between two renders, so it is measured
    // as one rather than rebuilt from the tokens the CSS itself consumes: whatever the slot
    // takes off the height, it takes off the width too. Travel — the distance the thumb
    // crosses — is what must survive, and travel is (w − h).
    let floored = 0;
    forEachCell(({ pointer, density, size }) => {
      // A field one index BELOW the switch it hosts is the tight case; sizes 2-4 give the
      // field a smaller rung to be.
      if (size === "1") return;
      const fieldSize = String(Number(size) - 1) as typeof size;
      const host = render(
        <Theme pointer={pointer} density={density}>
          <TextField size={fieldSize} trailing={<Switch size={size} />} />
          <Switch size={size} />
        </Theme>,
      );
      const [hosted, bare] = Array.from(host.querySelectorAll(".kui-switch")).map(box);
      const cell = `${pointer}/${density}/field ${fieldSize} + switch ${size}`;
      if (hosted!.h >= bare!.h) return; // the slot is roomy here; the floor is a no-op by design
      floored += 1;
      expect(bare!.h - hosted!.h, `${cell}: the width did not follow the height`).toBeCloseTo(
        bare!.w - hosted!.w,
        1,
      );
      // And it stays a switch rather than becoming the square the family's floor would make.
      expect(hosted!.w, `${cell}: aspect lost`).toBeGreaterThan(hosted!.h * 1.5);
    });
    // Without this the law is a scan over cells that may all skip — the vacuity the 2026-08-06
    // fix batch shipped once already (an overlap scan off-viewport, 24 cells passing on null).
    expect(floored, "no cell actually floored — the law measured nothing").toBeGreaterThan(0);
  });
});

describe("the capsule and its circle are role semantics — the radius axis never reaches them (§6)", () => {
  // The chain: a square grip reads as a bead that stuck (the slider thumb's sentence), and
  // a round grip can only nest in a curve — a circle in a square channel reads as a bead in
  // a rail, which is a SLIDER. The rail's own min() escape does not transfer: half a
  // 20-28px track dwarfs the control radius at the mid levels, so min() would flatten the
  // capsule exactly where the rail's never moved.
  for (const level of ["none", "small", "medium", "large", "full"] as const) {
    for (const pointer of POINTERS) {
      it(`stays a capsule with a round thumb at radius="${level}", ${pointer} pointer`, () => {
        for (const size of SIZES) {
          const el = mounted(<Switch size={size} />, {
            theme: { radius: level, pointer },
            select: ".kui-switch",
          });
          const track = box(el);
          expect(
            px(computed(el, "border-top-left-radius")),
            `track ${level}/${pointer}/${size}`,
          ).toBeCloseTo(track.h / 2, 1);
          // The thumb's circle is stated relationally — 50% of its own box — so the radius
          // computes as the percentage; the circle is the percentage AND the square box,
          // asserted together (an ellipse is exactly what 50% on a non-square would hide).
          const thumb = el.querySelector(".kui-switch-thumb")!;
          expect(computed(thumb, "border-top-left-radius"), `thumb ${level}/${pointer}/${size}`).toBe("50%");
          expect(box(thumb).w, `thumb ${level}/${pointer}/${size} squareness`).toBeCloseTo(box(thumb).h, 1);
        }
      });
    }
  }
});

describe("the thumb is the track minus the designed inset, and it crosses (§4)", () => {
  it("diameter = track − 2 × inset, and the resting gap is the inset from the painted edge", () => {
    for (const size of SIZES) {
      const el = render(<Switch size={size} />);
      const track = markOf(el);
      const thumb = thumbOf(el);
      const inset = px(tokenOn(el, "--switch-inset"));
      expect(box(thumb).h, `size ${size}`).toBeCloseTo(box(track).h - 2 * inset, 1);
      expect(box(thumb).w).toBeCloseTo(box(thumb).h, 1);
      const gap = thumb.getBoundingClientRect().left - track.getBoundingClientRect().left;
      expect(gap, `size ${size} resting gap`).toBeCloseTo(inset, 1);
    }
  });

  it("checked, it sits the same inset from the OTHER end — position is state, in CSS", () => {
    const el = render(<Switch size="2" defaultChecked />);
    const track = markOf(el).getBoundingClientRect();
    const thumb = thumbOf(el).getBoundingClientRect();
    const inset = px(tokenOn(el, "--switch-inset"));
    expect(track.right - thumb.right).toBeCloseTo(inset, 1);
    // The CENTER crosses the midline — the thumb itself is half the track wide, so its left
    // edge never can (the first spelling of this law asked for exactly that and was wrong).
    expect(thumb.left + thumb.width / 2).toBeGreaterThan(track.left + track.width / 2);
  });

  it("the grip fills its channel and still has somewhere to go — the inset's own bounds", () => {
    // Every other law about the inset computes its expectation FROM --switch-inset, the same
    // token the stylesheet consumes, so the value itself was anchored to nothing: set it to
    // 8px and each of those laws agrees with the new number while the grip becomes a pea in a
    // trough. Audit 2026-08-08 — the width has had a band pinned on it since the day it
    // shipped (tokens.test.ts, 1.5-2x) and the inset never did.
    //
    // Two bounds, both about what the part IS rather than what it measures. A grip is the
    // control's face, so it must occupy most of its channel — under ~0.7 it reads as a bead in
    // a rail, which is a slider. And a switch is travel, so the distance it crosses must be
    // worth crossing: at least a third of its own diameter, or the two states differ by a
    // nudge. Both hold in all 24 cells with room to spare; they exist to catch a designed
    // value drifting far, not to pin it.
    forEachCell(({ pointer, density, size }) => {
      const el = render(
        <Theme pointer={pointer} density={density}>
          <Switch size={size} />
        </Theme>,
      );
      const track = box(markOf(el));
      const thumb = box(thumbOf(el));
      const cell = `${pointer}/${density}/${size}`;
      expect(thumb.h / track.h, `${cell}: the grip is a bead in a trough`).toBeGreaterThan(0.7);
      expect(thumb.h, `${cell}: the grip overflows its channel`).toBeLessThan(track.h);
      const travel = track.w - track.h;
      expect(travel / thumb.w, `${cell}: the states differ by a nudge`).toBeGreaterThan(0.33);
    });
  });

  it("clicking toggles — the platform's switch, not a styled div", () => {
    const el = render(<Switch size="2" />);
    const root = markOf(el) as HTMLElement;
    expect(root.getAttribute("role")).toBe("switch");
    expect(root.hasAttribute("data-unchecked")).toBe(true);
    root.click();
    expect(root.hasAttribute("data-checked")).toBe(true);
  });
});

describe("off is a WELL, on is the family's accent identity (§11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: rests as the track well with the edge melted into it — not the seal, not the dress`, () => {
      const el = render(
        <Theme appearance={appearance}>
          <Switch />
        </Theme>,
      );
      const mark = markOf(el);
      expect(computed(mark, "background-color")).toBe(colorOn(el, "var(--color-track)"));
      // The edge melts INTO the well (the checked rule's own sentence): same colour, so the
      // geometry never shifts, and no hairline — an off switch is felt for, not read.
      expect(computed(mark, "border-top-color")).toBe(colorOn(el, "var(--color-track)"));
    });

    it(`${appearance}: checked fills with the accent solid through the family's ON rule`, () => {
      const el = render(
        <Theme appearance={appearance}>
          <Switch defaultChecked />
        </Theme>,
      );
      const mark = markOf(el);
      expect(computed(mark, "background-color")).toBe(colorOn(el, "var(--accent-solid)"));
      expect(computed(mark, "border-top-color")).toBe(colorOn(el, "var(--accent-solid)"));
    });

    it(`${appearance}: the grip is --color-thumb in both states — findable, never tinted`, () => {
      for (const checked of [false, true]) {
        const el = render(
          <Theme appearance={appearance}>
            <Switch defaultChecked={checked} />
          </Theme>,
        );
        expect(computed(thumbOf(el), "background-color"), `checked=${checked}`).toBe(
          colorOn(el, "var(--color-thumb)"),
        );
      }
    });

    it(`${appearance}: disabled dims the track and drops the cast — the grip stays findable`, () => {
      // Corrected 2026-08-08, judged in the playground the day it shipped: the first cut
      // sent the thumb to the track's own remapped grey and the grip vanished — "Disabled"
      // and "On, disabled" rendered as one indistinguishable capsule. The thumb's position
      // IS the state, so like the checkbox's tick it survives the remap: --color-thumb in
      // every state, and only the shadow says dead.
      const el = render(
        <Theme appearance={appearance} surfaces="elevated">
          <Switch disabled defaultChecked />
        </Theme>,
      );
      expect(computed(markOf(el), "background-color")).toBe(colorOn(el, "var(--neutral-3)"));
      expect(computed(thumbOf(el), "background-color")).toBe(colorOn(el, "var(--color-thumb)"));
      expect(
        computed(thumbOf(el), "background-color"),
        "the grip must not melt into its own channel",
      ).not.toBe(computed(markOf(el), "background-color"));
      expect(computed(thumbOf(el), "box-shadow"), "a dead grip makes no promise").toBe("none");
    });
  }

  it("stays melted when DEAD — a dimmed channel must not become a drawn one (§8)", () => {
    // The two shared state arms both outrank the melt (the mark family's fill arm at (0,2,0),
    // the control layer's --tone-border at (0,2,0), against the melt's (0,1,0)), so a disabled
    // off switch grew a hairline the live one does not have: the only off switch in the system
    // with a visible boundary, and a state that ADVANCES where every other disabled control
    // recedes. Audit 2026-08-08.
    //
    // Asserted as the melt's own property — edge equals fill — rather than against a colour,
    // so it keeps holding whatever the disabled well dims to.
    //
    // BOTH ends of the channel (caught in the playground the day after): the first fix was
    // scoped [data-unchecked], so an ON disabled switch kept the drawn hairline the off one
    // had just lost — the same two arms, one state over.
    for (const appearance of APPEARANCES) {
      const host = render(
        <Theme appearance={appearance}>
          <Switch />
          <Switch disabled />
          <Switch disabled defaultChecked />
        </Theme>,
      );
      const [live, dead, deadOn] = Array.from(host.querySelectorAll(".kui-switch"));
      for (const [el, name] of [
        [dead, "off"],
        [deadOn, "on"],
      ] as const) {
        expect(
          computed(el!, "border-top-color"),
          `${appearance}: the dead ${name} well is drawn`,
        ).toBe(computed(el!, "background-color"));
      }
      // And it really is the DISABLED look, not the live one leaking through — the state still
      // has to say something, it just says it with the fill.
      expect(computed(dead!, "background-color"), `${appearance}: disabled did not dim`).not.toBe(
        computed(live!, "background-color"),
      );
    }
  });

  it("a state outranks dress: invalid shows the invalid edge over the melted one (§8)", () => {
    for (const appearance of APPEARANCES) {
      const el = render(
        <Theme appearance={appearance}>
          <Switch aria-invalid="true" />
        </Theme>,
      );
      expect(computed(markOf(el), "border-top-color")).toBe(colorOn(el, "var(--invalid-edge)"));
    }
  });

  it("the well does not step under the pointer — the state that changes is the thumb's side", () => {
    // All three interaction sources are pinned to one value, so the shared layer's hover
    // swap resolves the identical colour. Asserted on the sources the swap actually reads.
    const mark = markOf(render(<Switch />));
    const styles = getComputedStyle(mark);
    for (const src of ["-hover", "-active"]) {
      expect(styles.getPropertyValue(`--kui-ct-fill-src${src}`).trim()).toBe(
        styles.getPropertyValue("--kui-ct-fill-src").trim(),
      );
    }
  });
});

describe("the WHOLE switch is outside the look axis — an instrument, like the slider (§19)", () => {
  it.each(APPEARANCES)("%s: every painted part is byte-identical across looks", (appearance) => {
    const at = (look: "outlined" | "filled") => {
      const el = mounted(<Switch />, { theme: { look, appearance }, select: ".kui-switch" });
      return {
        track: computed(el, "background-color"),
        edge: computed(el, "border-top-color"),
        thumb: computed(el.querySelector(".kui-switch-thumb")!, "background-color"),
      };
    };
    const outlined = at("outlined");
    const filled = at("filled");
    for (const key of Object.keys(outlined) as (keyof typeof outlined)[]) {
      expect(filled[key], `the app's look reached the switch's ${key}`).toBe(outlined[key]);
    }
    // The tautology guard (the slider's own): prove the axis was ALIVE in this mount, so
    // this law cannot pass in a world where `look` simply stopped working.
    const cb = (look: "outlined" | "filled") =>
      computed(
        mounted(<Checkbox />, { theme: { look, appearance }, select: ".kui-checkbox" }),
        "background-color",
      );
    expect(cb("filled")).not.toBe(cb("outlined"));
  });
});

describe("depth: the grip casts always, the well never, the checked capsule catches (§5)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: the thumb casts in a FLAT world — the role's exception, inherited not re-argued`, () => {
      const el = mounted(<Switch />, {
        theme: { appearance, surfaces: "flat" },
        select: ".kui-switch",
      });
      const probe = document.createElement("div");
      el.parentElement!.append(probe);
      probe.style.boxShadow = "var(--control-chrome)";
      expect(computed(thumbOf(el.parentElement!), "box-shadow")).toBe(
        getComputedStyle(probe).boxShadow,
      );
      expect(computed(thumbOf(el.parentElement!), "box-shadow")).not.toBe("none");
    });
  }

  it("the track itself never casts, and checked catches the loud rung's light (elevated world)", () => {
    const host = render(
      <Theme surfaces="elevated">
        <Switch defaultChecked />
        <Switch />
      </Theme>,
    );
    const [on, off] = [...host.querySelectorAll(".kui-switch")];
    expect(computed(on!, "background-image"), "a checked mark is the loud rung").toContain(
      "linear-gradient",
    );
    expect(computed(off!, "background-image")).toBe("none");
    for (const mark of [on!, off!]) {
      expect(computed(mark, "box-shadow"), "a well fills, it is never a raised key").toBe("none");
    }
  });
});

describe("one form, one family — the switch beside its siblings (§4)", () => {
  it("reads the same ladder a checkbox one size up reads, except the width", () => {
    // The identity stated the other way around: switch(n) and checkbox(n+1) are the same
    // mark, so their heights agree BY CONSTRUCTION in the fine world. If this diverges,
    // someone designed a second ladder.
    for (const [swSize, cbSize] of [
      ["1", "2"],
      ["2", "3"],
      ["3", "4"],
    ] as const) {
      const host = render(
        <Theme pointer="fine">
          <Switch size={swSize} />
          <Checkbox size={cbSize} />
        </Theme>,
      );
      expect(box(host.querySelector(".kui-switch")!).h).toBe(
        box(host.querySelector(".kui-checkbox")!).h,
      );
    }
  });

  it("its grip and the slider's are one role: same fill, same cast, in both appearances", () => {
    for (const appearance of APPEARANCES) {
      const host = render(
        <Theme appearance={appearance}>
          <Switch />
          <Slider defaultValue={50} />
        </Theme>,
      );
      const sw = host.querySelector(".kui-switch-thumb")!;
      const sl = host.querySelector(".kui-slider-thumb")!;
      expect(computed(sw, "background-color"), appearance).toBe(
        computed(sl, "background-color"),
      );
      expect(computed(sw, "box-shadow"), appearance).toBe(computed(sl, "box-shadow"));
    }
  });

  it("...and they stay one role when DEAD — the state the claim above never rendered", () => {
    // The law above asserts one role at REST, which is the state in which the two grips were
    // never going to differ. Under `disabled` they did, in opposite directions: the switch's
    // kept --color-thumb (the same-day correction — the grip is the tick, and a tick is never
    // erased) while the slider's, being a .kui-mark, took the family's --tone-soft arm and in
    // dark landed NEARER BLACK THAN ITS OWN RAIL. Audit 2026-08-08; closed by giving the
    // slider the switch's answer (slider.css), because the argument was always about grips.
    for (const appearance of APPEARANCES) {
      const host = render(
        <Theme appearance={appearance}>
          <Switch disabled />
          <Slider defaultValue={50} disabled />
        </Theme>,
      );
      const sw = host.querySelector(".kui-switch-thumb")!;
      const sl = host.querySelector(".kui-slider-thumb")!;
      expect(computed(sw, "background-color"), `${appearance} disabled fill`).toBe(
        computed(sl, "background-color"),
      );
      // Both stand the cast down: "always" is about the world, never about state.
      expect(computed(sw, "box-shadow"), `${appearance} disabled cast`).toBe("none");
      expect(computed(sl, "box-shadow"), `${appearance} disabled cast`).toBe("none");
      // And the grip is still findable against the rail it sits on — the whole reason
      // --color-thumb was minted, which the family's grey arm had been undoing.
      const rail = host.querySelector(".kui-slider-track")!;
      expect(computed(sl, "background-color"), `${appearance} grip vs rail`).not.toBe(
        computed(rail, "background-color"),
      );
    }
  });
});

describe("the off well answers contrast=high — a conformance surface reaches every resting boundary (§7)", () => {
  // The well had no high-contrast answer at all (audit 2026-08-08). For the SLIDER that was an
  // argued exemption — a well is a region the APCA-passing fill moves through. An off switch
  // has no fill portion: the well IS the control, so `contrast="high"` reached nothing, and in
  // light that left a ~1.2:1 track under a white thumb on a white page.
  //
  // Read off the rendered control in both contrast states rather than off the token, so it
  // does not matter whether the answer arrives by band membership, by re-pointing the role, or
  // by something not invented yet — the idiom theme.browser.test.tsx arrived at for the same
  // class of bug (§7, 2026-08-07).
  for (const appearance of APPEARANCES) {
    it(`${appearance}: the off track and its melted edge both move`, () => {
      const at = (contrast: "normal" | "high") => {
        const el = mounted(<Switch />, { theme: { appearance, contrast }, select: ".kui-switch" });
        return {
          fill: computed(el, "background-color"),
          edge: computed(el, "border-top-color"),
          thumb: computed(el.querySelector(".kui-switch-thumb")!, "background-color"),
        };
      };
      const normal = at("normal");
      const high = at("high");
      expect(high.fill, `${appearance}: the well is deaf to the conformance axis`).not.toBe(
        normal.fill,
      );
      expect(high.edge, `${appearance}: the melted edge is deaf`).not.toBe(normal.edge);
      // The melt survives the strengthening: an off switch that grew a hairline under high
      // contrast would be the one off switch in the system with a visible boundary, and would
      // shift the row by 2px on toggle — the reason the edge melts rather than being removed.
      expect(high.edge, `${appearance}: high contrast unmelted the edge`).toBe(high.fill);
      // And the grip is what the user actually reads position from, so it must separate from
      // the strengthened well too — the light/white-on-white case that made this a defect.
      expect(high.thumb, `${appearance}: grip vs strengthened well`).not.toBe(high.fill);
    });
  }
});

describe("what it inherits from the shared layer (§8)", () => {
  it("the focus ring is the real ring, and it is absent at rest", () => {
    const el = render(<Switch />);
    const mark = markOf(el) as HTMLElement;
    expect(getComputedStyle(mark).outlineStyle).toBe("none");
    mark.focus();
    const focused = getComputedStyle(mark);
    expect(focused.outlineStyle).toBe("solid");
    expect(focused.outlineColor).toBe(colorOn(el, "var(--focus-ring)"));
  });
});

describe("the API's closed edges (§3)", () => {
  it("refuses render, children, nativeButton, readOnly, and the axes it never had", () => {
    // @ts-expect-error — the one element must stay Base UI's root, which owns the hidden
    // input, the form association and the role="switch" ARIA
    void (<Switch render={<button />} />);
    // @ts-expect-error — the thumb is the component's; the label is a SIBLING
    void (<Switch>Wi-Fi</Switch>);
    // @ts-expect-error — describes an element `render` could have produced (audit D10)
    void (<Switch nativeButton />);
    // @ts-expect-error — the platform has no read-only selection control (LOG 2026-08-06);
    // DECISIONS named the switch as the same question, and it takes the same answer
    void (<Switch readOnly />);
    // @ts-expect-error — loudness ranks actions, and a switch is not one (§11)
    void (<Switch emphasis="loud" />);
    // @ts-expect-error — the ON state's family is an identity, not an axis (§11)
    void (<Switch tone="destructive" />);
    // @ts-expect-error — a 24px capsule of blur is a 24px capsule (§10)
    void (<Switch material="thin" />);
    // @ts-expect-error — no margin prop on any control (first non-negotiable)
    void (<Switch m="4" />);
  });

  it("the ref names the element it actually holds — a span", () => {
    const ref = React.createRef<HTMLSpanElement>();
    const el = render(<Switch ref={ref} />);
    expect(ref.current).toBe(markOf(el));
    expect(ref.current!.tagName).toBe("SPAN");
  });

  it("the documented label pairing produces a real accessible name", () => {
    const host = render(
      <div>
        <Switch id="wifi" />
        <label htmlFor="wifi">Wi-Fi</label>
      </div>,
    );
    const mark = host.querySelector(".kui-switch")!;
    const labelledBy = mark.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent).toBe("Wi-Fi");
  });
});
