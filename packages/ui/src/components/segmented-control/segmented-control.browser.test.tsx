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
    it(`${appearance}: the channel paints --color-track and the grip --color-thumb`, () => {
      const root = control({}, { appearance });
      expect(computed(root, "background-color")).toBe(colorOn(root, "var(--color-track)"));
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
         input the law is built on. The squeeze is proportional because the natural width grows
         with the size index; 0.55 is measured to bind at every one of them. */
      const natural = three({ size }).root.getBoundingClientRect().width;
      const { thumb, segs } = three({ size, style: { inlineSize: `${natural * 0.55}px` } });
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
    ["forward", "right", "left", 2],
    ["back", "left", "right", 0],
  ] as const) {
    it(`${dir}: the edge facing the destination takes the shorter clock`, async () => {
      inMotion();
      const { thumb, segs } = three(dir === "back" ? { defaultValue: "c" } : {});
      const want = dir === "forward" ? "right" : "left";
      await userEvent.click(segs[target]!);
      // Waited for, never assumed: the stamp lands when the MutationObserver sees Base UI move
      // `data-checked`, which a resolved gesture does not promise (test/settling.test.ts).
      await until(() => thumb.getAttribute("data-activation-direction") === want);
      const props = computed(thumb, "transition-property").split(", ");
      const clocks = computed(thumb, "transition-duration").split(", ");
      const at = (name: string) => clocks[props.indexOf(name)];
      expect(at(lead), `${dir}: the leading edge is not on the short clock`).toBe("0.32s");
      expect(at(trail), `${dir}: the trailing edge is not on the long clock`).toBe("0.48s");
      expect(at(lead)).not.toBe(at(trail));
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
