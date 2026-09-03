/**
 * The segmented control's laws, mounted (§4, §5, §6, §10, §11, §19, §26).
 *
 * The control machinery is asserted cell by cell in button.browser.test.tsx; what is asserted
 * here is what is the SEGMENTED CONTROL'S: the track standing level with a button, the segment
 * deriving from the channel, the well it is and the look axis it therefore leaves, the grip
 * that casts always, the concentric corner, the role it announces, and the one glass per
 * stack. Computed values through a mounted component, both appearances — the 2026-08-03 bar —
 * and every law below was made to fail against a deliberately broken value before it was
 * trusted (the 2026-08-05 addendum).
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import * as React from "react";

import {
  APPEARANCES,
  DEPTHS,
  SIZES,
  asksForStillness,
  colorOn,
  computed,
  inMotion,
  forEachCell,
  mounted,
  render,
  tokenOn,
  until,
  within,
} from "../../test/browser.tsx";
import { Theme } from "../../theme/theme.tsx";
import { Box } from "../box/box.tsx";
import { Button } from "../button/button.tsx";
import { SegmentedControl, SegmentedItem } from "./segmented-control.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Card } from "../card/card.tsx";

const px = (v: string) => parseFloat(v);

function control(props: Record<string, unknown> = {}, theme = {}) {
  return mounted(
    <SegmentedControl defaultValue="list" {...props}>
      <SegmentedItem value="list">List</SegmentedItem>
      <SegmentedItem value="grid">Grid</SegmentedItem>
    </SegmentedControl>,
    { theme },
  );
}

const segments = (root: Element) => [...root.querySelectorAll<HTMLElement>(".kui-segment")];
const chosen = (root: Element) => within(root, ".kui-segment[data-checked]");
const other = (root: Element) => within(root, ".kui-segment:not([data-checked])");
/* THE GRIP is its own element since 2026-08-23 — one thumb that travels, rather than a fill
   switching from one segment's box to the next (§8, §26). Every guarantee below is the one it
   always was; what moved is which element carries it, so the laws are re-keyed rather than
   rewritten, and the ones about the chosen segment's INK still read the segment, because the
   ink did not move. */
const grip = (root: Element) => within(root, ".kui-segment-thumb");

describe("the track is the control, and it stands level (§4, §26)", () => {
  it("its box is --control-height-N — a segmented control matches the Button beside it", () => {
    // Asserted against a mounted Button rather than against the token, which is the point of
    // the rule: the reason the TRACK rides the ladder (and the segments derive) is so the two
    // read as one row in a toolbar.
    for (const size of SIZES) {
      const host = render(
        <Theme>
          <SegmentedControl defaultValue="a" size={size}>
            <SegmentedItem value="a">A</SegmentedItem>
          </SegmentedControl>
          <Button size={size}>Go</Button>
        </Theme>,
      );
      const track = within(host, ".kui-segmented");
      const button = within(host, ".kui-button");
      // RENDERED boxes, not `min-height` (audit 2026-08-19, L1). Both elements are
      // `.kui-control` and both resolve `min-height: var(--kui-ct-h)` from the one size join,
      // so comparing the declarations was a token identity that could not fail — it was green
      // over a track rendering exactly 2px taller than its Button in all 24 cells, and it is
      // the law DECISIONS cites as proof of the invariant.
      expect(
        track.getBoundingClientRect().height,
        `${size}: the track does not stand level with its Button`,
      ).toBeCloseTo(button.getBoundingClientRect().height, 1);
    }
  });

  it("a segment is the channel minus the inset, in every cell (§4's hosted rule, N hosts)", () => {
    forEachCell(({ size, density, pointer }) => {
      {
        const label = `${pointer}/${density}`;
        const root = control({ size }, { density, pointer });
        // The CHANNEL, measured — the track's rendered content box — not the declaration
        // under test re-evaluated from its own two inputs (audit 2026-08-19, L2). The old
        // spelling could not tell "the segment fits the channel" from "the segment states a
        // height and the channel gives way", which is exactly what was happening.
        const style = getComputedStyle(root);
        const channel =
          root.getBoundingClientRect().height -
          px(style.paddingTop) -
          px(style.paddingBottom) -
          px(style.borderTopWidth) -
          px(style.borderBottomWidth);
        for (const seg of segments(root)) {
          expect(seg.getBoundingClientRect().height, `${label}/${size}`).toBeCloseTo(channel, 1);
        }
        // And the channel is the ladder rung minus the two designed insets — the derivation
        // itself, checked once per cell against the token rather than against the rule.
        expect(channel, `${label}/${size} channel`).toBeCloseTo(
          px(tokenOn(root, `--control-height-${size}`)) - 2 * px(tokenOn(root, "--segment-inset")),
          1,
        );
      }
    });
  });

  it("the index is read in ONE place — a segment never stamps its own", () => {
    // The segments inherit the join's cells from the track through the cascade, which is why
    // the two boxes cannot disagree about which size they are.
    const root = control({ size: "4" });
    expect(root.getAttribute("data-size")).toBe("4");
    for (const seg of segments(root)) expect(seg.getAttribute("data-size")).toBeNull();
  });
});

describe("the track is a WELL, and the segment is a grip (§11, §19, §26)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: the channel paints the FIELD's gray and the grip --color-thumb`, () => {
      // The channel left --color-track on 2026-08-24 (Kushagra: "I see no reason for it to be
      // any other color than text fields or areas"): one gray for field, area and this track;
      // --color-track stays the instruments' deeper channel. Asserted as the AGREEMENT with a
      // mounted TextField rather than as the token name alone — the guarantee is "same color
      // as a text field", and a token identity would stay green the day text-field.css
      // stopped reading the same role.
      const host = render(
        <Theme appearance={appearance}>
          <SegmentedControl defaultValue="list">
            <SegmentedItem value="list">List</SegmentedItem>
            <SegmentedItem value="grid">Grid</SegmentedItem>
          </SegmentedControl>
          <TextField />
        </Theme>,
      );
      const root = within(host, ".kui-segmented");
      expect(computed(root, "background-color")).toBe(
        computed(within(host, ".kui-field"), "background-color"),
      );
      expect(computed(root, "background-color")).toBe(colorOn(root, "var(--dress-field-fill)"));
      expect(computed(grip(root), "background-color")).toBe(colorOn(root, "var(--color-thumb)"));
      // And the two are different, or the grip is invisible in its own channel — the
      // switch's 2026-08-08 disabled defect, guarded against at rest.
      expect(computed(grip(root), "background-color")).not.toBe(
        computed(root, "background-color"),
      );
      // The chosen SEGMENT paints nothing of its own any more (2026-08-23): the grip is one
      // travelling object, and a segment that also painted it would blink out from under the
      // thumb the moment it left. This is the half a re-key can silently lose.
      expect(computed(chosen(root), "background-color")).toBe("rgba(0, 0, 0, 0)");
    });

    it(`${appearance}: an unchosen segment paints nothing at all`, () => {
      const root = control({}, { appearance });
      expect(computed(other(root), "background-color")).toBe("rgba(0, 0, 0, 0)");
    });

    it(`${appearance}: the chosen segment reads full ink, the others muted, and they differ`, () => {
      const root = control({}, { appearance });
      expect(computed(chosen(root), "color")).toBe(colorOn(root, "var(--color-thumb-label)"));
      expect(computed(other(root), "color")).toBe(colorOn(root, "var(--color-text-muted)"));
      expect(computed(chosen(root), "color")).not.toBe(computed(other(root), "color"));
      // Against the fill it is PAINTED ON, which is the law that was missing (audit
      // 2026-08-19, D1/L4): the chosen segment wore `--color-text`, and in dark that and
      // `--color-thumb` are the same token by construction — an invisible label, measured
      // 1.00:1, with `contrast="high"` moving neither. The neighbouring law eighteen lines up
      // already reads this fill, on this element, in this loop.
      expect(
        computed(chosen(root), "color"),
        "the chosen label is painted in its own fill",
      ).not.toBe(computed(chosen(root), "background-color"));
    });
  }

  it("the well does not step under the pointer — all three sources are one value", () => {
    // The field's lesson (§8): a rule that declares only rest falls back to the rung's values
    // mid-interaction, and the channel lights up when a pointer crosses it. Read as the three
    // declared sources rather than by faking a hover, which the harness cannot do honestly.
    const root = control();
    const rest = computed(root, "--kui-ct-fill-src");
    expect(computed(root, "--kui-ct-fill-src-hover")).toBe(rest);
    expect(computed(root, "--kui-ct-fill-src-active")).toBe(rest);
  });

  it("an unchosen segment hovers in NEUTRAL — the family the type refuses to let it change", async () => {
    // The stamp shipped as `accent` on a stated reason that was false, and what it actually
    // reached was the quiet rung on every segment: an unchosen one hovered accent blue, and in
    // dark it inverted the direction of the state change into a near-opaque navy block (audit
    // 2026-08-19, D5). No law read the unchosen segment's sources at all — the two laws here
    // read the track's and the CHOSEN one's, which are the two that were right.
    //
    // Measured with a real pointer rather than off the declared sources: the excuse the old
    // law gave for not doing so ("the harness cannot do it honestly") was stale.
    for (const appearance of APPEARANCES) {
      const root = control({}, { appearance });
      const seg = other(root);
      const rest = computed(seg, "background-color");
      await userEvent.hover(seg);
      const hovered = computed(seg, "background-color");
      expect(hovered, `${appearance}: an unchosen segment does not answer hover`).not.toBe(rest);
      expect(hovered, `${appearance}: it hovered in the wrong family`).toBe(
        colorOn(root, "var(--neutral-soft)"),
      );
    }
  });

  it("a grip does not fill either — the chosen segment holds one value across all three", () => {
    const root = control();
    const rest = computed(grip(root), "--kui-ct-fill-src");
    expect(computed(grip(root), "--kui-ct-fill-src-hover")).toBe(rest);
    expect(computed(grip(root), "--kui-ct-fill-src-active")).toBe(rest);
  });

  // The "OUTSIDE the look axis" negative law the instruments carried left with the look axis
  // itself (surfaceLook deleted 2026-08-20): with no prop, there is no look to flip.
});

describe("the grip casts always, and stands down when dead (§5, §6, §26)", () => {
  for (const depth of DEPTHS) {
    it(`${depth}: the chosen segment casts --grip-cast — the world switch does not reach it`, () => {
      // The seventh box-shadow consumer, and the grips' exception a third time: a grip that
      // does not sit above its rail stops reading as a grip. Asserted in the FLAT world too,
      // which is the half that says "always".
      const root = control({}, { depth });
      expect(computed(grip(root), "box-shadow")).not.toBe("none");
      expect(computed(chosen(root), "box-shadow")).toBe("none");
      expect(computed(other(root), "box-shadow")).toBe("none");
    });
  }

  it("dead, the cast goes and the grip stays findable — the switch's 2026-08-08 correction", () => {
    const root = control({ disabled: true });
    expect(computed(grip(root), "box-shadow")).toBe("none");
    // It dims rather than melting into its own channel, which is the recorded failure one
    // control over: which segment is chosen must survive the state that says you cannot
    // change it.
    expect(computed(grip(root), "background-color")).not.toBe(
      computed(root, "background-color"),
    );
  });

  it("and the CHANNEL and both labels stand down with it, in both appearances", () => {
    // The shared disabled arm rewrites tone ROLES, and all three of this component's resting
    // colours are non-tone — so a disabled control measured byte-identical to a live one
    // everywhere except the grip's cast and the cursor (audit 2026-08-19, D6). The old law
    // read the two parts that DID work, and its "the chosen fill differs from the track"
    // assertion passed precisely because the track never moved. This is the slider rail's own
    // defect, three components on.
    for (const appearance of APPEARANCES) {
      const live = control({}, { appearance });
      const dead = control({ disabled: true }, { appearance });
      expect(dead.getAttribute("data-disabled")).not.toBeNull();
      expect(computed(dead, "background-color"), `${appearance}: the channel`).not.toBe(
        computed(live, "background-color"),
      );
      expect(computed(other(dead), "color"), `${appearance}: the unchosen label`).not.toBe(
        computed(other(live), "color"),
      );
      expect(computed(chosen(dead), "color"), `${appearance}: the chosen label`).not.toBe(
        computed(chosen(live), "color"),
      );
    }
  });
});

describe("a box mid-flight is not its own size (2026-09-01)", () => {
  /* THE GRIP LAPPED ITS NEIGHBOUR ON A FIRST OPEN (Kushagra: "when opening it for the first
     time, theres an overlap between two values, but once I click something, then it corrects
     the size of each thumb").

     `getBoundingClientRect` reports the VISUAL box, and this control writes what it reads back
     as LAYOUT insets. Every overlay in this system scales as it opens, so a segmented control
     inside a popover, dialog or alert was measured mid-entry and kept those numbers for the
     rest of its life — nothing re-measures until the selection changes, and the resize
     observers are right not to fire, since the layout box never moved. Measured on the docs'
     props popover: the seat's true insets are 40.078 / 78.156, the first open wrote 38.074 /
     74.248 — the same numbers times the entry's own 0.95 — and the grip sat 5.9px wider than
     its seat.

     AN AGREEMENT, because there is no absolute number to assert: the same control scaled and
     unscaled must write the same two lengths, since the lengths describe a layout that the
     scaling does not touch. The vacuity guard is the half that matters — a scale of 1 makes
     this law pass against any implementation — so the two subjects' RECTS are asserted to
     differ first, which is the one thing the fixture is for.

     Falsified by removing the division: the scaled subject's insets come back at 0.95 of the
     plain one's. */
  const scaled = () =>
    mounted(
      <div style={{ scale: "0.8" }}>
        <SegmentedControl defaultValue="list">
          <SegmentedItem value="list">List</SegmentedItem>
          <SegmentedItem value="grid">Grid</SegmentedItem>
        </SegmentedControl>
      </div>,
      { theme: {} },
    );

  const insets = (root: Element) => {
    const thumb = within(root, ".kui-segment-thumb");
    return [
      px(thumb.style.getPropertyValue("--kui-seg-left")),
      px(thumb.style.getPropertyValue("--kui-seg-right")),
    ] as const;
  };

  it("a control measured inside a scaled ancestor writes the same lengths as one that is not", () => {
    const plain = control();
    const inside = scaled();

    // Vacuity: without a real difference in visual size, any implementation passes below.
    const plainWidth = within(plain, ".kui-segmented").getBoundingClientRect().width;
    const scaledWidth = within(inside, ".kui-segmented").getBoundingClientRect().width;
    expect(scaledWidth, "the fixture is not actually scaled").toBeLessThan(plainWidth - 1);

    const [plainLeft, plainRight] = insets(plain);
    const [scaledLeft, scaledRight] = insets(inside);
    expect(scaledLeft, "the left inset carries the ancestor's scale").toBeCloseTo(plainLeft, 1);
    expect(scaledRight, "the right inset carries the ancestor's scale").toBeCloseTo(plainRight, 1);
  });

  it("and the grip still covers its seat there, in layout terms", () => {
    // The consequence the eye sees, stated on its own: the two lengths leave exactly the seat's
    // share of the track, so the grip cannot lap the segment beside it.
    const inside = scaled();
    const track = within(inside, ".kui-segmented");
    const seat = within(track, ".kui-segment[data-checked]");
    const [left, right] = insets(inside);
    const edges = getComputedStyle(track);
    const layout =
      edges.boxSizing === "border-box"
        ? px(edges.width)
        : px(edges.width) + px(edges.paddingLeft) + px(edges.paddingRight);
    const gripWidth = layout - px(edges.borderLeftWidth) - px(edges.borderRightWidth) - left - right;
    const seatWidth = seat.getBoundingClientRect().width / (track.getBoundingClientRect().width / layout);
    expect(gripWidth, "the grip is not its seat's width").toBeCloseTo(seatWidth, 1);
  });
});

describe("the corner is concentric (§6, §26)", () => {
  it("the segment's radius is the track's minus the inset, at every level and size", () => {
    for (const radius of ["small", "medium", "large", "full"] as const) {
      for (const size of SIZES) {
        const root = control({ size }, { radius });
        // The gap between the two curves must BE the gap between the two boxes — measured,
        // not restated from the declaration under test (audit 2026-08-19, L7). Spelled this
        // way it also fails when the track's own box drifts from its corner, which is how the
        // old spelling silently inherited D2's missing border term.
        const style = getComputedStyle(root);
        const gap = px(style.paddingTop) + px(style.borderTopWidth);
        const outer = px(computed(root, "border-top-left-radius"));
        expect(
          px(computed(chosen(root), "border-top-left-radius")),
          `${radius}/${size}`,
        ).toBeCloseTo(Math.max(outer - gap, 0), 1);
      }
    }
  });

  it("radius=none squares BOTH, and the subtraction never goes negative", () => {
    const root = control({}, { radius: "none" });
    expect(px(computed(root, "border-top-left-radius"))).toBe(0);
    expect(px(computed(chosen(root), "border-top-left-radius"))).toBe(0);
  });
});

describe("it announces a CHOICE — the 2026-08-06 audit's deferred question, answered (§26)", () => {
  it("the track is a radiogroup and the segments are radios that report their state", () => {
    // The docs' own pickers convey a choice through colour alone, so the accessibility tree
    // is byte-identical before and after it changes. This is the fix: a real role, from the
    // primitive. ToggleGroup would have announced `role="group"` holding aria-pressed
    // buttons, which is a different sentence — that one belongs to Toggle Button (§11).
    const root = control();
    expect(root.getAttribute("role")).toBe("radiogroup");
    const [first, second] = segments(root);
    expect(first!.getAttribute("role")).toBe("radio");
    expect(first!.getAttribute("aria-checked")).toBe("true");
    expect(second!.getAttribute("aria-checked")).toBe("false");
  });

  it("choosing another segment moves the reported state, not just the paint", () => {
    const root = control();
    const [first, second] = segments(root);
    second!.click();
    expect(second!.getAttribute("aria-checked")).toBe("true");
    expect(first!.getAttribute("aria-checked")).toBe("false");
  });
});

describe("the segments sit flush (§26, audit 2026-08-19 D7)", () => {
  it("no space between them, in every cell — the skeleton's icon gap does not reach the track", () => {
    // `.kui-segmented` overrode the skeleton's padding and not its `gap`, so the icon-to-label
    // distance was showing between segments: 4/8/8/12 fine and 8/12/12/16 coarse, re-priced by
    // pointer and size while deaf to density, and owned by no config entry, token or law.
    forEachCell(({ size, density, pointer }) => {
      const root = control({ size }, { density, pointer });
      expect(px(computed(root, "column-gap")), `${pointer}/${density}/${size}`).toBe(0);
      const [a, b] = segments(root).map((el) => el.getBoundingClientRect());
      expect(b!.left - a!.right, `${pointer}/${density}/${size} rendered`).toBeCloseTo(0, 1);
    });
  });

  it("and the segments fill the channel — no undesigned well shows at either end", () => {
    const root = control();
    const style = getComputedStyle(root);
    const box = root.getBoundingClientRect();
    const segs = segments(root).map((el) => el.getBoundingClientRect());
    expect(segs[0]!.left - box.left).toBeCloseTo(px(style.paddingLeft) + px(style.borderLeftWidth), 1);
    expect(box.right - segs[segs.length - 1]!.right).toBeCloseTo(
      px(style.paddingRight) + px(style.borderRightWidth),
      1,
    );
  });
});

describe("the refusals are pinned by the TYPE, not merely claimed (audit 2026-08-19, D10)", () => {
  it("a segment refuses what the mark family refuses", () => {
    // The file shipped with zero type probes while the docs registry declared four refusals,
    // and that is how `nativeButton` got back in: set on a segment it renders `type="button"`
    // on a span and the segment can no longer be chosen with Space — audit D10 reproduced on
    // the same Base UI primitive it was closed on. radio.browser.test.tsx and
    // checkbox.browser.test.tsx both pin theirs; this one did not.
    // @ts-expect-error — nativeButton is closed: it breaks keyboard selection on this primitive.
    void (<SegmentedItem value="a" nativeButton />);
    // @ts-expect-error — render is closed: the one element must stay Base UI's root.
    void (<SegmentedItem value="a" render={<div />} />);
    // @ts-expect-error — readOnly is closed: the platform has no read-only selection control.
    void (<SegmentedItem value="a" readOnly />);
    // @ts-expect-error — tone is the family's identity, never a per-segment choice.
    void (<SegmentedItem value="a" tone="destructive" />);
    // @ts-expect-error — and emphasis is not a rung a segment picks.
    void (<SegmentedControl emphasis="loud" />);
  });
});

describe("glass and the grip (§10, §26, 2026-08-24)", () => {
  /** The alpha of a `rgba(r, g, b, a)` / `rgb(r g b / a)` computed value; 1 when opaque. */
  const alphaOf = (v: string) => {
    const m = /\/\s*([\d.]+)\s*\)|,\s*([\d.]+)\s*\)$/.exec(v);
    return m ? Number(m[1] ?? m[2]) : 1;
  };

  for (const appearance of APPEARANCES) {
    it(`${appearance}: on glass the CHOSEN thumb outranks a hovered segment, and neither is opaque`, async () => {
      // Kushagra, 2026-08-24, from the preview: "Week is selected but its barely visible on
      // thin, month is hover and its extremely dark, so much more contrast than the selected
      // thumb." Two defects met in that screenshot and this law reads both.
      //
      // ONE — the thumb was painting --material-row-wash, which IS the hover value, so the
      // persistent state and the transient one were one colour by construction. The claim is
      // a RANKING, so it is read as one: the chosen grip carries more alpha than a hovered
      // segment. Alpha rather than a token name, because the two are opposite directions in
      // light (a white grip against a darkening wash) and a name would not catch them being
      // equal.
      //
      // TWO — the hovered segment was painting FULLY OPAQUE (measured neutral-3 in light,
      // near-black in dark): the 2026-08-19 opaque-twin re-point sits on the element carrying
      // [data-material] and those roles INHERIT, so the glass track handed its segments an
      // opaque source they had no veil to mix back down. The `< 1` assertion is what catches
      // that class of leak, and it is the half a token-name law would have missed.
      const host = render(
        <Theme appearance={appearance} material="thin">
          <Box backdrop>
            <SegmentedControl defaultValue="week" aria-label="Range">
              <SegmentedItem value="day">Day</SegmentedItem>
              <SegmentedItem value="week">Week</SegmentedItem>
              <SegmentedItem value="month">Month</SegmentedItem>
            </SegmentedControl>
          </Box>
        </Theme>,
      );
      const segs = [...host.querySelectorAll<HTMLElement>(".kui-segment")];
      const thumb = within(host, ".kui-segment-thumb");
      const rest = computed(segs[2]!, "background-color");
      await userEvent.hover(segs[2]!);
      await until(() => computed(segs[2]!, "background-color") !== rest, 1000);
      const hover = computed(segs[2]!, "background-color");
      expect(alphaOf(hover), `${appearance}: a hovered glass segment paints opaque — ${hover}`).toBeLessThan(1);
      expect(
        alphaOf(computed(thumb, "background-color")),
        `${appearance}: the chosen grip does not outrank a hover`,
      ).toBeGreaterThan(alphaOf(hover));
      // And the chosen segment still answers no pointer — this rule is (0,2,0) and would
      // otherwise beat the transparent pin, putting back the 2026-08-23 stuck-hover defect.
      await userEvent.hover(segs[1]!);
      expect(computed(segs[1]!, "background-color")).toBe("rgba(0, 0, 0, 0)");
      await userEvent.unhover(segs[1]!);
    });
  }

  for (const appearance of APPEARANCES) {
    it(`${appearance}: DEAD, the chosen label does not follow the pane back to the live ink`, () => {
      /* The glass world states the chosen label at (0,3,0) in surfaces.css ("on a glass TRACK
         … the chosen label returns to the full ink") and this file's disabled arm was (0,2,0)
         — `:where()` contributes nothing — so specificity handed a DEAD label the LIVE ink on
         every glass state, over a grip this file had already dimmed. In dark that is neutral-12
         words on a 70% neutral-12 grip: the 2026-08-19 D1 defect restated by a state (audit
         2026-08-26).

         Read as the AGREEMENT with the solid twin rather than against a token name. The dead
         GRIP does not depend on the material — this file's dim ties the glass grip rule at
         (0,3,0) and wins on source order — so the ink that answers to it must not either, and
         reading both halves is what makes that a claim rather than a coincidence: a repair
         that stood the label down while letting the grip drift fails here too. */
      const host = render(
        <Theme appearance={appearance} material="thin">
          <Box backdrop>
            <SegmentedControl disabled defaultValue="list">
              <SegmentedItem value="list">List</SegmentedItem>
              <SegmentedItem value="grid">Grid</SegmentedItem>
            </SegmentedControl>
          </Box>
        </Theme>,
      );
      const track = within(host, ".kui-segmented");
      // The premises, stated so a fixture that never went glass or never went dead fails as
      // itself rather than as the claim (the 2026-08-21 rule: ask what the fixture would look
      // like if the mechanism were absent).
      expect(track.getAttribute("data-material")).toBe("thin");
      expect(track.getAttribute("data-disabled")).not.toBeNull();
      const solid = control({ disabled: true }, { appearance });
      expect(
        computed(within(host, ".kui-segment-thumb"), "background-color"),
        `${appearance}: the dead grip drifted with the material`,
      ).toBe(computed(grip(solid), "background-color"));
      expect(
        computed(within(host, ".kui-segment[data-checked]"), "color"),
        `${appearance}: the pane handed a dead label the live ink`,
      ).toBe(computed(chosen(solid), "color"));
      // CALIBRATION: the dead ink really is a different value from the live one the pane
      // states, or the agreement above is satisfied by a control that stands nothing down.
      expect(computed(chosen(solid), "color")).not.toBe(colorOn(track, "var(--color-text)"));
    });
  }

  it("a glass TRACK wears the pane's ring — the well has no pigment edge, and the material has a lip", () => {
    // The glass lock (2026-08-24): the well's "no edge" is a decision about PIGMENT rank;
    // the ring is the material's own lip, what glass IS (§10's rim-and-edge sentence). The
    // track rides the button's ::after spelling — its border is stood down BY WIDTH (audit
    // D2), so the field family's border-area layer would have no band to paint in. Asserted
    // as the agreement with a glass Button's ring: the two resolved conics must be
    // byte-identical, so the track cannot drift from the family.
    const host = render(
      <Theme material="regular">
        <Box backdrop>
          <SegmentedControl defaultValue="list">
            <SegmentedItem value="list">List</SegmentedItem>
            <SegmentedItem value="grid">Grid</SegmentedItem>
          </SegmentedControl>
          <Button>b</Button>
        </Box>
      </Theme>,
    );
    const track = within(host, ".kui-segmented");
    const ring = getComputedStyle(track, "::after").backgroundImage;
    expect(ring).toContain("conic-gradient");
    expect(ring).toBe(getComputedStyle(within(host, ".kui-button"), "::after").backgroundImage);
    // And a solid track paints none — the ring is the material's, never the well's.
    const solid = control({});
    expect(getComputedStyle(solid, "::after").backgroundImage).not.toContain("conic-gradient");
  });

  it("a glass TRACK wears the pane's RIM too — the sixth part, added 2026-08-26", () => {
    /**
     * The track joined the ring list at the 2026-08-24 lock and was left off the RIM list in
     * the same change, so it resolved five of §10's six parts. Measured at `thick` over a
     * backdrop before the repair: a glass Button computed
     * `url("data:image/svg+xml;utf8,<svg …feTurbulence…")` — the baked grain — and the track
     * beside it computed `background-image: none`. That is the Button's own 2026-08-16 defect
     * ("the button used to be excluded from this rule entirely rather than composed, so a
     * glass Button had no rim at all") reproduced on the member that joined the ring.
     *
     * Asserted as the AGREEMENT with a glass Button in the same tree, not against a token
     * name: at control scale the rim is `rim(0)` — the grain layer alone — and what the lock
     * forbids is the two panes rendering different material, which only a comparison can say.
     * `thick` is chosen deliberately: it is the rung whose config comment says "thicker glass
     * catches more light", so it is where an absent grain shows most. The Button is QUIET for
     * the same reason the comparison is legitimate at all: a glass button's second background
     * layer is its RUNG's wash (`--kui-ct-light`), which is rank and not material, and a track
     * carries no rank — so a medium button would differ here for a reason §10 permits. Quiet
     * declares that layer `none`, which is what a track's resolves to, leaving the material
     * as the only thing the two stacks can disagree about.
     */
    const host = render(
      <Theme material="thick">
        <Box backdrop>
          <SegmentedControl defaultValue="list">
            <SegmentedItem value="list">List</SegmentedItem>
            <SegmentedItem value="grid">Grid</SegmentedItem>
          </SegmentedControl>
          <Button emphasis="quiet">b</Button>
        </Box>
      </Theme>,
    );
    const track = within(host, ".kui-segmented");
    const button = within(host, ".kui-button");
    // The premise: both really are panes at the same rung, or the comparison below is
    // between two things that agree for the wrong reason.
    expect(track.getAttribute("data-material")).toBe("thick");
    expect(button.getAttribute("data-material")).toBe("thick");
    // The calibration arm: the rim is a real, painted thing here — a repair that deleted the
    // grain from BOTH members would satisfy a bare equality.
    expect(computed(button, "background-image"), "the rim stopped painting at all").toContain(
      "data:image/svg+xml",
    );
    expect(
      computed(track, "background-image"),
      "a glass track rendered a different material from the button beside it",
    ).toBe(computed(button, "background-image"));
    // And a SOLID track still paints none — the rim is the material's, never the well's.
    expect(computed(control({}), "background-image")).toBe("none");
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: on a glass TRACK the thumb is the pane's own GRIP, flat, under full ink`, () => {
      // Kushagra: "When glass, segmented control's thumb should render as neutral gray like
      // hover in menu, and the entire control gets glass." The wash is --material-row-wash —
      // the token a glass menu lights a hovered row with, so the two agree by construction;
      // the cast stands down (a pane has one lift); and the chosen label returns to the full
      // ink, because --color-thumb-label was minted against the near-white fill this thumb
      // no longer has.
      const host = render(
        <Theme appearance={appearance} material="thin">
          <Box backdrop>
            <SegmentedControl defaultValue="list">
              <SegmentedItem value="list">List</SegmentedItem>
              <SegmentedItem value="grid">Grid</SegmentedItem>
            </SegmentedControl>
          </Box>
        </Theme>,
      );
      const track = within(host, ".kui-segmented");
      // The premise, stated so a broken fixture fails as itself rather than as the claim.
      expect(track.getAttribute("data-material")).toBe("thin");
      const thumb = within(host, ".kui-segment-thumb");
      // --material-grip-fill, NOT the row wash (2026-08-24, second pass). It shipped as the
      // wash this morning, which is the HOVER value — so selected and hovered were one colour
      // and the ranking law beside this one could not hold. A grip on a pane is still the
      // pane's own light rather than the solid control's near-white --color-thumb, but it is
      // the pane's light at grip strength.
      expect(computed(thumb, "background-color")).toBe(colorOn(track, "var(--material-grip-fill)"));
      expect(computed(thumb, "background-color")).not.toBe(colorOn(track, "var(--material-row-wash)"));
      expect(computed(thumb, "box-shadow")).toBe("none");
      expect(computed(within(host, ".kui-segment[data-checked]"), "color")).toBe(
        colorOn(track, "var(--color-text)"),
      );
    });

    it(`${appearance}: INSIDE a glass pane the grip speaks the same glass vocabulary, and loses its lift`, () => {
      // REVERSED 2026-08-24, and the reversal is the point (Kushagra, on a segmented control
      // inside a glass Card: "on a card theres no visible difference still"). This law used
      // to assert that an in-pane grip keeps the solid --color-thumb, on the reading that
      // on-glass means "resolve your solid appearance". Measured in that composition, solid
      // meant PURE WHITE on a white pane — the control's one piece of state, invisible.
      //
      // The glass rules had been keyed to the three THICKNESSES, which is the list meaning
      // "this element IS a pane", so a member of someone else's pane matched none of them.
      // They key on [data-material] now, which is every glass STATE and still never a solid
      // control. One vocabulary: whether the track is the glass or merely sits on it, the
      // grip is the pane's grip. The CAST stand-down is unchanged and asserted below.
      const host = render(
        <Theme appearance={appearance} material="regular">
          <Card backdrop>
            <SegmentedControl defaultValue="list">
              <SegmentedItem value="list">List</SegmentedItem>
              <SegmentedItem value="grid">Grid</SegmentedItem>
            </SegmentedControl>
          </Card>
        </Theme>,
      );
      const thumb = within(host, ".kui-segment-thumb");
      expect(computed(thumb, "background-color")).toBe(colorOn(thumb, "var(--material-grip-fill)"));
      // The negative control the old spelling WAS: pure white on a white pane is the defect,
      // so a return to the solid grip fails here rather than passing quietly.
      expect(computed(thumb, "background-color")).not.toBe(colorOn(thumb, "var(--color-thumb)"));
      expect(computed(thumb, "box-shadow")).toBe("none");
      // And the track, which has no border to draw one with (the well stands it down by
      // width), gets its boundary from the annulus: the pane's own pigment hairline, so a
      // control inside a glass card is not a shape you have to guess at.
      const ring = getComputedStyle(within(host, ".kui-segmented"), "::after");
      expect(ring.content).toBe('""');
      expect(ring.backgroundColor).toBe(colorOn(thumb, "var(--material-glass-border)"));
    });
  }
});

describe("one glass per stack, structurally (§10, §26)", () => {
  it("on calm ground it resolves solid and pays nothing", () => {
    // Selectivity, 2026-08-17: a glass control with nothing behind it blurs nothing and still
    // pays a full readback. The theme is glass here and the placement is not.
    const root = control({}, { material: "thin" });
    expect(root.getAttribute("data-material")).toBeNull();
    expect(computed(root, "backdrop-filter")).toBe("none");
  });

  it("in a backdrop region the TRACK is glass and the segments are not", () => {
    // The pane is the track; the segments sit on a backdrop it has already spent. Measured as
    // the thing that costs: exactly one backdrop-filter in the whole control.
    const host = render(
      <Theme material="thin">
        <Box backdrop>
          <SegmentedControl defaultValue="list">
            <SegmentedItem value="list">List</SegmentedItem>
            <SegmentedItem value="grid">Grid</SegmentedItem>
          </SegmentedControl>
        </Box>
      </Theme>,
    );
    const track = within(host, ".kui-segmented");
    expect(track.getAttribute("data-material")).toBe("thin");
    expect(computed(track, "backdrop-filter")).not.toBe("none");
    for (const seg of [...track.querySelectorAll<HTMLElement>(".kui-segment")]) {
      expect(computed(seg, "backdrop-filter")).toBe("none");
    }
  });

  it("and the track SCOPES its subtree — anything inside it resolves on-glass", () => {
    // The rule above holds whether or not the track scopes anything, because a segment never
    // asks for a material in the first place — sabotaged by deleting the scope, that law
    // passed. What the scope actually guarantees is that a material-EXPRESSING component
    // placed inside a glass track does not spend the backdrop a second time, so the law has
    // to put one there. A Button in a track is not an ordinary composition; the invariant is
    // not about this composition, it is about the fact that no call site has to know.
    const host = render(
      <Theme material="thin">
        <Box backdrop>
          <SegmentedControl defaultValue="list">
            <SegmentedItem value="list">List</SegmentedItem>
            <Button>Inside</Button>
          </SegmentedControl>
        </Box>
      </Theme>,
    );
    const track = within(host, ".kui-segmented");
    const button = within(track, ".kui-button");
    expect(button.getAttribute("data-material")).toBe("on-glass");
    expect(computed(button, "backdrop-filter")).toBe("none");
    // Exactly one pane in the whole control — the thing that costs a readback.
    const blurred = [...track.querySelectorAll<HTMLElement>("*")].filter(
      (el) => computed(el, "backdrop-filter") !== "none",
    );
    expect(blurred).toHaveLength(0);
    expect(computed(track, "backdrop-filter")).not.toBe("none");
  });
});

/**
 * §8, §26 — THE GRIP TRAVELS (2026-08-23, judged in the "Clip vs Physics" bench).
 *
 * One thumb gliding between segments, drawn by its two inline edges, with the edge facing the
 * destination on the shorter clock so it stretches across and gathers itself. Unlike Tabs —
 * which gets its direction and its measurement free from Base UI — everything here is measured
 * by the component, so these laws read the measurement's OUTPUT rather than any declaration
 * that describes it.
 *
 * The flight is SEIZED, never raced: pausing the running transitions and setting `currentTime`
 * puts the box at a chosen point, which keeps these on CI (test/frames.test.ts records what the
 * frame-watching exclusion costs and why it is not reached for here).
 */
describe("the grip travels between segments (§8, §26)", () => {
  function seize(el: Element, at: number) {
    const running = el.getAnimations();
    for (const a of running) {
      a.pause();
      a.currentTime = at;
    }
    return running;
  }

  function three(props: Record<string, unknown> = {}) {
    const root = mounted(
      <SegmentedControl defaultValue="a" {...props}>
        <SegmentedItem value="a">One</SegmentedItem>
        <SegmentedItem value="b">Two</SegmentedItem>
        <SegmentedItem value="c">Three much longer</SegmentedItem>
      </SegmentedControl>,
    );
    return {
      root,
      thumb: within(root, ".kui-segment-thumb"),
      segs: [...root.querySelectorAll(".kui-segment")] as HTMLElement[],
    };
  }

  for (const size of SIZES) {
    it(`size ${size}: the thumb sits exactly on the chosen segment`, () => {
      /* The measurement's whole job, read as two boxes rather than as the two lengths it wrote
         — a law that read `--kui-seg-left` back would be agreeing with the arithmetic that
         produced it, which is the shape the 2026-08-03 audit exists to forbid.
    
         THE TRACK IS SQUEEZED, and that is the law rather than a detail of it. Left to size
         itself, `flex: 1 1 0` gives every segment an identical share — measured 425.3 / 425.3 /
         425.3 with labels of three different lengths — so a thumb that simply divided the track
         into thirds would satisfy this at every index, and the fixture could not tell a
         measurement from a division (the degenerate-fixture rule, 2026-08-20). Constrained
         below its natural width the `min-width: auto` floor binds on the longest label and the
         segments diverge: measured 62.0 / 62.0 / 72.0 in a 200px box, where an index would have
         answered 65.3. That divergence is why this component measures at all, so it is the
         input the law is built on.

         THE SQUEEZE STOPS ABOVE MIN-CONTENT (re-cut 2026-08-25, when the channel wall landed).
         The old 0.55 × natural squeezed below the track's own min-content, which puts the SEATS
         outside the channel — the flex line overflows and the skeleton centres it, so seg[0]
         measured 15.5px LEFT of the track's border box — and the wall now correctly refuses to
         follow a seat out of the channel, so the old fixture asserted the thumb onto a seat the
         control no longer covers. That geometry is a caller-forced break (a box below its
         min-content overflows its labels with or without a thumb) and not what this law is
         about. The width is derived from the measured floors instead of hand-tuned: at
         min-content every segment sits at its floor, and halfway between "sum of floors" (below
         which the row overflows) and "three times the largest" (above which no floor binds) the
         longest label's floor binds, the others share the slack equally, and everything stays
         inside the channel — divergence without overflow, guaranteed at every index because the
         labels scale with it. */
      const probe = three({ size, style: { inlineSize: "min-content" } });
      const floors = probe.segs.map((s) => s.getBoundingClientRect().width);
      const chrome = probe.root.getBoundingClientRect().width - floors.reduce((a, b) => a + b, 0);
      const width = (floors.reduce((a, b) => a + b, 0) + 3 * Math.max(...floors)) / 2 + chrome;
      const { thumb, segs } = three({ size, style: { inlineSize: `${width}px` } });
      const seat = segs[0]!.getBoundingClientRect();
      const grip = thumb.getBoundingClientRect();
      expect(grip.left).toBeCloseTo(seat.left, 1);
      expect(grip.right).toBeCloseTo(seat.right, 1);
      expect(grip.width).toBeCloseTo(seat.width, 1);
      // CALIBRATION: the squeeze really did make them differ, or this is the equal-share
      // fixture again under a longer name.
      expect(
        segs[2]!.getBoundingClientRect().width,
        "the segments are equal — the fixture cannot tell a measurement from a division",
      ).toBeGreaterThan(seat.width + 4);
    });
  }

  for (const [dir, lead, trail, target] of [
    ["forward", "--kui-seg-right", "--kui-seg-left", 2],
    ["back", "--kui-seg-left", "--kui-seg-right", 0],
  ] as const) {
    it(`${dir}: the edge facing the destination takes the shorter clock`, async () => {
      inMotion();
      const { thumb, segs } = three(dir === "back" ? { defaultValue: "c" } : {});
      const want = dir === "forward" ? "right" : "left";
      await userEvent.click(segs[target]!);
      // Waited for, never assumed: the stamp lands when the MutationObserver sees Base UI move
      // `data-checked`, which a resolved gesture does not promise (test/settling.test.ts).
      await until(() => thumb.getAttribute("data-activation-direction") === want);
      // The clocks ride the REGISTERED insets since 2026-08-25 (the channel wall): the spring
      // runs on the raw value and the painted inset is that value floored at the wall, so the
      // property list names the custom pair rather than `left`/`right`.
      const props = computed(thumb, "transition-property").split(", ");
      const clocks = computed(thumb, "transition-duration").split(", ");
      const at = (name: string) => clocks[props.indexOf(name)];
      expect(at(lead), `${dir}: the leading edge is not on the short clock`).toBe("0.32s");
      expect(at(trail), `${dir}: the trailing edge is not on the long clock`).toBe("0.48s");
      expect(at(lead)).not.toBe(at(trail));
    });

    it(`${dir}: and the OS can stop it — the stand-down nothing verified (§8, audit 2026-08-26)`, async () => {
      /**
       * The grip's flight is declared on `.kui-segment-thumb[data-activation-direction=…]`,
       * two attributes heavier than the shared `.kui-control *` stand-down, so this file's own
       * guarded block is the only thing that can win — and until this law nothing verified that
       * it does. The node law meant to check it skipped any file carrying a
       * `prefers-reduced-motion` block ANYWHERE (repaired the same day), and the mounted parts
       * list in system/motion.browser.test.tsx names five parts, neither of them this one.
       *
       * Pointed at the state it names: an unstamped grip has no clock to stand down, so the
       * direction has to land first — the same wait the clock law above makes.
       */
      inMotion();
      await asksForStillness();
      const { thumb, segs } = three(dir === "back" ? { defaultValue: "c" } : {});
      const want = dir === "forward" ? "right" : "left";
      await userEvent.click(segs[target]!);
      await until(() => thumb.getAttribute("data-activation-direction") === want);
      expect(
        computed(thumb, "transition-duration"),
        `${dir}: the grip still glides for a user who asked for stillness`,
      ).toBe("0s");
    });
  }

  for (const [dir, target] of [
    ["forward", 2],
    ["back", 0],
  ] as const) {
    it(`${dir}: the flight never crosses the channel wall — overshoot is spent as squash`, async () => {
      /* THE WALL (§8, §26, 2026-08-25, Kushagra from the glass preview, against the bench's own
         lean rule: "a lean can never cross a boundary"). The calm spring overshoots ~6.8% of
         travel, and on a full jump into an end seat that measured the grip's edge 14.11px
         OUTSIDE the track — in solid and on glass identically; glass only made it visible.

         The flight is SEIZED and swept, so the assertion covers every point of the curve rather
         than racing one: at no currentTime does the painted box cross the channel inset. The
         calibration half is what keeps this from passing for the wrong reason: the RAW
         registered inset must still go past the wall mid-flight — the spring was clamped, not
         tamed — so a build that quietly swapped calm for a non-overshooting curve fails here
         instead of shipping a different motion under a green wall. */
      inMotion();
      const { root, thumb, segs } = three(dir === "back" ? { defaultValue: "c" } : {});
      const inset = parseFloat(computed(root, "padding-left"));
      expect(inset).toBeGreaterThan(0);
      await userEvent.click(segs[target]!);
      await until(
        () =>
          thumb.getAttribute("data-activation-direction") === (dir === "forward" ? "right" : "left"),
      );
      const anims = thumb.getAnimations();
      expect(anims.length, "no flight started").toBeGreaterThan(0);
      for (const a of anims) a.pause();
      const box = root.getBoundingClientRect();
      const raw = dir === "forward" ? "--kui-seg-right" : "--kui-seg-left";
      let sprung = false;
      for (let t = 0; t <= 480; t += 10) {
        for (const a of anims) a.currentTime = t;
        const r = thumb.getBoundingClientRect();
        expect(
          r.right,
          `t=${t}ms: the grip's right edge left the channel`,
        ).toBeLessThanOrEqual(box.right - inset + 0.5);
        expect(
          r.left,
          `t=${t}ms: the grip's left edge left the channel`,
        ).toBeGreaterThanOrEqual(box.left + inset - 0.5);
        if (parseFloat(getComputedStyle(thumb).getPropertyValue(raw)) < inset - 4) sprung = true;
      }
      expect(
        sprung,
        "the raw inset never crossed the wall — the spring was tamed, not clamped",
      ).toBe(true);
    });
  }

  it("STRETCHES on the way — mid-flight it is wider than either end", async () => {
    inMotion();
    const { thumb, segs } = three();
    const from = thumb.getBoundingClientRect().width;
    await userEvent.click(segs[2]!);
    const running = seize(thumb, 160);
    expect(running.length, "nothing is animating — the flight never started").toBeGreaterThan(0);
    const midFlight = thumb.getBoundingClientRect().width;
    const to = segs[2]!.getBoundingClientRect().width;
    expect(midFlight, "it did not stretch past where it came from").toBeGreaterThan(from + 8);
    expect(midFlight, "it did not stretch past where it is going").toBeGreaterThan(to + 8);
  });

  it("is PLACED on first paint — no previous seat, so no flight", () => {
    inMotion();
    const { thumb } = three();
    expect(thumb.getAttribute("data-activation-direction")).toBe("none");
    // The clock, not the property list: nothing declares `transition-property` in this state,
    // so it computes to its initial `all` — which reads like a transition and is not one.
    expect(computed(thumb, "transition-duration")).toBe("0s");
  });

  it("a RESIZE re-places it without flying — the box moved, the choice did not", async () => {
    // The guard whose absence was measured: `ResizeObserver` fires the moment you observe, and
    // an unguarded callback rewrote the direction to `none` a frame after every selection —
    // removing the transition and teleporting the thumb. This reads the other half of that
    // guard: a REAL resize must still re-place, and must not fly while doing it.
    inMotion();
    const root = mounted(
      <div style={{ inlineSize: "420px" }}>
        <SegmentedControl defaultValue="b">
          <SegmentedItem value="a">One</SegmentedItem>
          <SegmentedItem value="b">Two</SegmentedItem>
        </SegmentedControl>
      </div>,
    ) as HTMLElement;
    const thumb = within(root, ".kui-segment-thumb");
    const seat = () => within(root, ".kui-segment[data-checked]").getBoundingClientRect();
    const before = thumb.getBoundingClientRect().width;
    root.style.inlineSize = "260px";
    await until(() => thumb.getBoundingClientRect().width !== before);
    expect(thumb.getBoundingClientRect().width).toBeCloseTo(seat().width, 1);
    expect(thumb.getBoundingClientRect().left).toBeCloseTo(seat().left, 1);
    expect(
      thumb.getAttribute("data-activation-direction"),
      "a resize flew the grip — nobody changed the choice",
    ).toBe("none");
  });

  it("a SEAT that moves at CONSTANT track width takes the grip with it", async () => {
    /* THE OBSERVER WATCHED THE TRACK AND NOT THE SEATS (audit 2026-08-26). A resize of the
       CONTROL is not the only way a seat moves: the segments are `flex: 1 1 0` with a
       `min-width: auto` floor, so inside a track whose width its container fixes — a grid cell,
       a `flex: 1` toolbar, a window narrow enough that the track is already clamped — a label
       that grows takes room from its neighbours and every seat moves while the track's own box
       never changes. Nothing fired: the MutationObserver is filtered to `data-checked`, the
       ResizeObserver saw a box that did not move, and there is no re-render to fall back on
       (the value lives inside Base UI's RadioGroup, which is why this hook exists at all).

       The label is grown by a real React state change rather than by writing to the DOM,
       because that is the case the report is about — an async label, a translation, a count —
       and because a hand-written `textContent` would replace the children Base UI put inside
       the segment.

       THE FIXTURE IS THE LAW: the track's width is asserted UNCHANGED, and the seat is
       asserted to have MOVED. Without the first, the existing track observer would cover the
       case and this would be a law about the mechanism it is not testing; without the second,
       a label that changed nothing would satisfy it with the grip standing still. */
    function Growing() {
      const [grown, setGrown] = React.useState(false);
      return (
        <>
          <button type="button" data-grow onClick={() => setGrown(true)}>
            grow
          </button>
          <SegmentedControl defaultValue="b" style={{ inlineSize: "420px" }}>
            <SegmentedItem value="a">{grown ? "Oneeeeeeeeeeeeeeeeeeee" : "One"}</SegmentedItem>
            <SegmentedItem value="b">Two</SegmentedItem>
            <SegmentedItem value="c">Three</SegmentedItem>
          </SegmentedControl>
        </>
      );
    }
    const host = render(
      <Theme>
        <Growing />
      </Theme>,
    );
    const track = within(host, ".kui-segmented");
    const thumb = within(track, ".kui-segment-thumb");
    const seat = () => within(track, ".kui-segment[data-checked]").getBoundingClientRect();
    const before = { track: track.getBoundingClientRect().width, seat: seat().left };
    await userEvent.click(within(host, "button[data-grow]"));
    await until(() => Math.abs(seat().left - before.seat) > 1, 1000);
    // The premise: the CONTROL did not resize, so the observer this law is about is the only
    // one that could have seen anything.
    expect(track.getBoundingClientRect().width, "the track resized — wrong mechanism").toBeCloseTo(
      before.track,
      1,
    );
    // The calibration: the seat genuinely moved, and it moved without leaving the channel (a
    // line that overflows puts the seats outside the wall, which is a caller-forced break and
    // not what this law is about — the 2026-08-25 re-cut, one describe up).
    expect(Math.abs(seat().left - before.seat), "the label change moved nothing").toBeGreaterThan(1);
    expect(seat().right).toBeLessThanOrEqual(track.getBoundingClientRect().right + 0.5);
    await until(() => Math.abs(thumb.getBoundingClientRect().left - seat().left) < 0.5, 1000);
    const grip = thumb.getBoundingClientRect();
    expect(grip.left, "the grip stayed on the seat's old geometry").toBeCloseTo(seat().left, 1);
    expect(grip.right, "the grip stayed on the seat's old geometry").toBeCloseTo(seat().right, 1);
  });

  it("the flight SURVIVES the observers watching the box", async () => {
    /* THE LAW THE FIRST SABOTAGE PASS DEMANDED, and it is the one that catches the defect that
       was actually measured. `ResizeObserver` fires the moment you observe, so an unguarded
       callback re-places the thumb one frame after every selection change and writes `none` —
       which removes the transition and teleports the grip (measured 56.9 → 68.4px in a single
       frame, flat across six samples, with the recipe itself entirely correct).
    
       Every other law here reads the flight SYNCHRONOUSLY after the click, before that callback
       can land, so all five passed against the broken build. This one waits two frames, which
       is past where any observer callback lands and nowhere near the 480ms the flight lasts —
       a state with a long life, not a transient being raced, which is why it stays on CI. */
    inMotion();
    const { thumb, segs } = three();
    await userEvent.click(segs[2]!);
    await until(() => thumb.getAttribute("data-activation-direction") === "right");
    // …and it is STILL that two frames later, which is past where any observer callback lands
    // and nowhere near the 480ms the flight lasts.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    expect(
      thumb.getAttribute("data-activation-direction"),
      "something re-placed the grip mid-flight and took its clock away",
    ).toBe("right");
    expect(
      thumb.getAnimations().length,
      "the flight was cancelled before it could run",
    ).toBeGreaterThan(0);
  });

  it("the chosen segment paints NOTHING under a pointer — the grip is the only paint", async () => {
    /* Kushagra, 2026-08-23, watching a real click: the hover fill "is on top, so as I click on a
       segment, and it animates, the hover continues to stay, which doesn't wobble btw, making
       it look very weird." Exactly right — the segments paint above the thumb by design (that
       is what puts the label over the grip), so a chosen segment that still answered hover left
       a static wash sitting precisely where the grip was travelling to.
    
       The cause was a re-key that dropped half of what it moved. The chosen segment used to
       hold all three fill sources at `--color-thumb`, which carried BOTH the grip's colour and
       the rule that a grip does not fill; moving the colour to the thumb deleted the triple
       rather than re-pointing it, and the segment fell back to the quiet rung's hover step.
    
       Read under a REAL pointer and after the click, which is the state the report is about —
       the resting law two describes up cannot see this, and neither can one that reads the
       declared sources on a segment nobody is pointing at. */
    const root = control();
    const other0 = other(root);
    await userEvent.hover(other0);
    await until(() => computed(other0, "background-color") !== "rgba(0, 0, 0, 0)");
    // CALIBRATION: an UNCHOSEN segment does answer the pointer, so "paints nothing" below is a
    // fact about being chosen and not about the harness failing to hover.
    expect(computed(other0, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
    await userEvent.click(other0);
    await until(() => other0.hasAttribute("data-checked"));
    expect(
      computed(other0, "background-color"),
      "the chosen segment is still painting its hover on top of the grip",
    ).toBe("rgba(0, 0, 0, 0)");
    // All three sources, the field's rule: declaring only rest falls back mid-interaction.
    for (const src of ["--kui-ct-fill-src", "--kui-ct-fill-src-hover", "--kui-ct-fill-src-active"]) {
      expect(computed(other0, src).trim(), `${src} is not stood down`).toBe("transparent");
    }
  });

  it("the chosen LABEL is on top of the grip, not under it", () => {
    /* Shipped white on white for one commit (Kushagra, 2026-08-23, from the playground: the
       chosen segment's word was simply gone). The thumb renders first in the markup and the
       comment beside it claimed document order would therefore paint it underneath — which is
       not how painting works: within one stacking context CSS paints in-flow non-positioned
       content in steps 4-7 and positioned descendants in step 8, so an absolutely positioned
       thumb covers every static sibling no matter where it sits in the DOM.
    
       Read with `elementFromPoint` at the label's own centre rather than by comparing colours,
       because the colours were never wrong: `--color-thumb-label` computed correctly the whole
       time and a paint was sitting on top of it. The instrument has to be the one that can see
       the defect that actually happened. */
    for (const appearance of APPEARANCES) {
      const root = control({}, { appearance });
      const seg = chosen(root);
      const thumb = within(root, ".kui-segment-thumb");
      const box = seg.getBoundingClientRect();
      const onTop = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      expect(
        thumb.contains(onTop) || onTop === thumb,
        `${appearance}: the grip is painted over its own label`,
      ).toBe(false);
      expect(seg.contains(onTop) || onTop === seg, `${appearance}: the label is not on top`).toBe(
        true,
      );
    }
  });

  it("no value, no grip — it is hidden rather than parked somewhere stale", () => {
    const root = mounted(
      <SegmentedControl>
        <SegmentedItem value="a">One</SegmentedItem>
        <SegmentedItem value="b">Two</SegmentedItem>
      </SegmentedControl>,
    );
    const thumb = within(root, ".kui-segment-thumb");
    expect((thumb as HTMLElement).hidden).toBe(true);
    expect(computed(thumb, "display")).toBe("none");
  });
});

describe("the arrows follow the track — direction is React context, and the track supplies it (§26, 2026-09-03)", () => {
  /**
   * The worst instance of the defect §26 recorded open on 2026-08-19: Base UI's composite
   * reads direction from `DirectionContext`, never from the DOM's `dir`, and a radio group's
   * arrows CHOOSE as they move — so under `dir="rtl"` ArrowRight checked the segment on the
   * LEFT. `DirectionProvider` is its only setter and nothing rendered one above the track.
   *
   * A MIRROR claim (Slider's law, one control over): the same gesture under both directions,
   * asserted as geometry first — the newly chosen segment lies to the RIGHT of the one that
   * was — and as DOM identity second. Three segments with the middle one chosen, so the two
   * answers are two different elements in both directions.
   */
  const track3 = (dir: "ltr" | "rtl") =>
    mounted(
      <div dir={dir}>
        <SegmentedControl defaultValue="grid" aria-label="View">
          <SegmentedItem value="list">List</SegmentedItem>
          <SegmentedItem value="grid">Grid</SegmentedItem>
          <SegmentedItem value="table">Table</SegmentedItem>
        </SegmentedControl>
      </div>,
      { theme: {} },
    );

  it("ArrowRight CHOOSES the segment on the RIGHT, under ltr and under rtl alike", async () => {
    for (const dir of ["ltr", "rtl"] as const) {
      const root = track3(dir);
      const track = within(root, ".kui-segmented");
      expect(computed(track, "direction"), `the fixture is not ${dir}`).toBe(dir);
      const [list, grid, table] = segments(track) as [HTMLElement, HTMLElement, HTMLElement];
      expect(chosen(track)).toBe(grid);
      grid.focus();
      expect(document.activeElement).toBe(grid);
      await userEvent.keyboard("{ArrowRight}");
      expect(
        await until(() => chosen(track) !== grid),
        `${dir}: the choice did not move`,
      ).toBe(true);
      const now = chosen(track);
      expect(
        now.getBoundingClientRect().left,
        `${dir}: ArrowRight chose the segment on the LEFT`,
      ).toBeGreaterThan(grid.getBoundingClientRect().left);
      // Right of the middle is the LAST segment in ltr and the FIRST in rtl — the pre-fix
      // track answered `table` in both.
      expect(now).toBe(dir === "ltr" ? table : list);
    }
  });
});
