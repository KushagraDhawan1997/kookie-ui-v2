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
  forEachCell,
  mounted,
  render,
  tokenOn,
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
    it(`${appearance}: the channel paints --color-track and the chosen segment --color-thumb`, () => {
      const root = control({}, { appearance });
      expect(computed(root, "background-color")).toBe(colorOn(root, "var(--color-track)"));
      expect(computed(chosen(root), "background-color")).toBe(
        colorOn(root, "var(--color-thumb)"),
      );
      // And the two are different, or the grip is invisible in its own channel — the
      // switch's 2026-08-08 disabled defect, guarded against at rest.
      expect(computed(chosen(root), "background-color")).not.toBe(
        computed(root, "background-color"),
      );
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
    const rest = computed(chosen(root), "--kui-ct-fill-src");
    expect(computed(chosen(root), "--kui-ct-fill-src-hover")).toBe(rest);
    expect(computed(chosen(root), "--kui-ct-fill-src-active")).toBe(rest);
  });

  it("it is OUTSIDE the look axis — an instrument, with the switch and the bar (§19)", () => {
    // The negative law the instruments all carry: neither look prop may move a pixel of
    // paint, because a well has no boundary-versus-fill trade to make.
    const base = control({}, { surfaceLook: "outlined" });
    const flipped = control({}, { surfaceLook: "filled" });
    expect(computed(flipped, "background-color")).toBe(computed(base, "background-color"));
    expect(computed(chosen(flipped), "background-color")).toBe(
      computed(chosen(base), "background-color"),
    );
    expect(computed(flipped, "border-top-color")).toBe(computed(base, "border-top-color"));
  });
});

describe("the grip casts always, and stands down when dead (§5, §6, §26)", () => {
  for (const depth of DEPTHS) {
    it(`${depth}: the chosen segment casts --grip-cast — the world switch does not reach it`, () => {
      // The seventh box-shadow consumer, and the grips' exception a third time: a grip that
      // does not sit above its rail stops reading as a grip. Asserted in the FLAT world too,
      // which is the half that says "always".
      const root = control({}, { depth });
      expect(computed(chosen(root), "box-shadow")).not.toBe("none");
      expect(computed(other(root), "box-shadow")).toBe("none");
    });
  }

  it("dead, the cast goes and the grip stays findable — the switch's 2026-08-08 correction", () => {
    const root = control({ disabled: true });
    expect(computed(chosen(root), "box-shadow")).toBe("none");
    // It dims rather than melting into its own channel, which is the recorded failure one
    // control over: which segment is chosen must survive the state that says you cannot
    // change it.
    expect(computed(chosen(root), "background-color")).not.toBe(
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
