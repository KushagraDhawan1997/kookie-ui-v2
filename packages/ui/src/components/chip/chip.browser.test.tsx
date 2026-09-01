/**
 * Chip's laws, mounted (§11, §15).
 *
 * The component is the atom family's third member, so its laws are shaped as COMPARISONS —
 * against `Kbd`, whose box it now shares, and against `Code`, whose fill it shares. That is
 * deliberate and it is the promotion's own proof: restating "the fill is --tone-soft" here
 * would go green on a chip that had quietly grown its own fill, which is exactly the drift
 * the third member exists to end.
 *
 * The two claims that carry real weight are the ones a reader would assume rather than check:
 * a chip NEVER spreads the line it sits beside (Kbd's `1lh` finding, now the family's), and a
 * chip is FLAT where a cap is raised — asserted against a mounted Kbd, because "nothing casts
 * anywhere" passes for the second one otherwise.
 */
import { describe, expect, it } from "vitest";

import {
  APPEARANCES,
  POINTERS,
  colorOn,
  computed,
  mounted,
  numberOn,
  tokenOn,
  within,
} from "../../test/browser.tsx";
import { Card } from "../card/card.tsx";
import { Code } from "../code/code.tsx";
import { Kbd } from "../kbd/kbd.tsx";
import { Text } from "../text/text.tsx";
import { Chip } from "./chip.tsx";

const RAMP = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

describe("Chip is the atom family's third member (§11, §15)", () => {
  it("wears the BODY family, like the cap and unlike the chip", () => {
    // A chip names a state in the interface's own voice. Asserted in both directions so
    // neither a chip quietly on mono nor a chip quietly on sans survives.
    const chip = mounted(<Chip>Live</Chip>, { theme: {} });
    const text = mounted(<Text>x</Text>, { theme: {} });
    const code = mounted(<Code>x</Code>, { theme: {} });
    expect(computed(chip, "font-family")).toBe(computed(text, "font-family"));
    expect(computed(chip, "font-family")).not.toBe(computed(code, "font-family"));
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: the fill is the family's, not a second one`, () => {
      // The promotion's proof from the fill side: all three atoms resolve ONE background,
      // because one rule declares it. A chip that grew its own would fail here even if the
      // colour it grew happened to match today.
      const chip = mounted(<Chip>Live</Chip>, { theme: { appearance } });
      const code = mounted(<Code>x</Code>, { theme: { appearance } });
      const kbd = mounted(<Kbd>K</Kbd>, { theme: { appearance } });
      expect(computed(chip, "background-color")).toBe(colorOn(chip, "var(--tone-soft)"));
      expect(computed(chip, "background-color")).toBe(computed(code, "background-color"));
      expect(computed(chip, "background-color")).toBe(computed(kbd, "background-color"));
      // And it is a real fill, not a transparent one — without this the law above is
      // satisfied by three components painting nothing.
      expect(computed(chip, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
    });

    it(`${appearance}: a tone moves the INK, and the chip stays grey`, () => {
      /**
       * REVERSED 2026-08-23 (Kushagra, from the tone x emphasis board: "why do these buttons
       * continue to have a light filter?"). This law used to assert the opposite in its own
       * words — "an atom carrying a fill has a second thing to tint" — and the fill is what
       * went. No family paints a faded wash any more: the soft trio reads neutral for every
       * tone, so a chip's chip is grey and the category arrives in the letters.
       *
       * Notice deliberately did NOT follow, and that is the line this widening was drawn along:
       * a chip's chip reads `--tone-soft`, a Notice's box reads `--tone-a3`, and only the
       * first moved. Same-day laws in `tokens.test.ts` hold the second.
       */
      const neutral = mounted(<Chip>Failed</Chip>, { theme: { appearance } });
      const toned = mounted(
        <Chip tone="destructive">Failed</Chip>,
        { theme: { appearance } },
      );
      expect(computed(toned, "color"), "the tone reaches nothing at all").not.toBe(
        computed(neutral, "color"),
      );
      expect(computed(toned, "background-color"), "the chip is tinted again").toBe(
        computed(neutral, "background-color"),
      );
      // The chip still EXISTS — a chip that stopped painting a box satisfies the line above
      // for the wrong reason, and this family's whole shape is a word in a box.
      expect(computed(toned, "background-color")).toBe(colorOn(toned, "var(--tone-soft)"));
      expect(computed(toned, "background-color")).not.toContain("rgba(0, 0, 0, 0)");
    });

    it(`${appearance}: emphasis moves the INK and never the fill`, () => {
      // Tone is the category, not the volume (§29's sentence, one family over). There is no
      // fill ladder here: emphasis takes the TYPE resolution, which is foreground roles. A
      // chip whose box climbed a rung while its letters read the same axis would be reading
      // one axis two ways in one element — §9's reason for deleting `variant`.
      const loud = mounted(<Chip emphasis="loud">Live</Chip>, { theme: { appearance } });
      const quiet = mounted(<Chip emphasis="quiet">Live</Chip>, { theme: { appearance } });
      expect(computed(loud, "color")).not.toBe(computed(quiet, "color"));
      expect(computed(loud, "background-color")).toBe(computed(quiet, "background-color"));
    });

    it(`${appearance}: it is FLAT where the cap is raised — the argument for two components`, () => {
      // The absence is the design. A key cap is a picture of a physical object standing proud
      // of the surface (§5's role-semantics exception, the grips'); a chip is printed onto the
      // thing it marks. Both halves are asserted against a mounted Kbd in the same world,
      // because "nothing casts anywhere" and "nothing has an edge anywhere" would each pass
      // for this on their own.
      const chip = mounted(<Chip>Live</Chip>, { theme: { appearance } });
      const kbd = mounted(<Kbd>K</Kbd>, { theme: { appearance } });
      expect(computed(chip, "box-shadow")).toBe("none");
      expect(computed(kbd, "box-shadow"), "the negative control stopped casting").not.toBe("none");
      expect(parseFloat(computed(chip, "border-top-width"))).toBe(0);
      expect(computed(kbd, "border-top-width")).toBe(tokenOn(kbd, "--border-width"));
    });
  }
});

describe("it takes the line it sits beside, and never moves it (§15)", () => {
  it("an unset size is the parent's step at the chip's own discount", () => {
    const host = mounted(
      <Text size="6" render={<p />}>
        Deploy <Chip>Live</Chip>
      </Text>,
      { theme: {} },
    );
    const chip = host.querySelector<HTMLElement>(".kui-chip")!;
    const parent = parseFloat(computed(host, "font-size"));
    const scale = numberOn(chip, "--chip-scale");
    expect(parseFloat(computed(chip, "font-size"))).toBeCloseTo(parent * scale, 2);
  });

  it("a stated size joins the paired scales, and wins over the line it sits in", () => {
    const host = mounted(
      <Text size="6" render={<p />}>
        Deploy <Chip size="2">Live</Chip>
      </Text>,
      { theme: {} },
    );
    const chip = host.querySelector<HTMLElement>(".kui-chip")!;
    const scale = numberOn(chip, "--chip-scale");
    expect(parseFloat(computed(chip, "font-size"))).toBeCloseTo(
      parseFloat(tokenOn(chip, "--font-size-2")) * scale,
      2,
    );
    expect(parseFloat(computed(chip, "font-size"))).not.toBeCloseTo(
      parseFloat(computed(host, "font-size")) * scale,
      1,
    );
  });

  it("an inherited chip NEVER spreads its line — all nine steps, both pointer worlds", () => {
    // Kbd's finding (audit 2026-08-08), now the family's: a constant-em box cannot track a
    // line ratio that falls from 1.33 at step 1 to 1.107 at step 9, so it fits the small steps
    // and overflows the large ones. `block-size: 1lh` is why the claim here is the strong one —
    // flush, not bounded — and the full ramp is looped deliberately, because sizes 1-4 are the
    // cells where a bound cannot fail.
    for (const pointer of POINTERS) {
      for (const size of RAMP) {
        const host = mounted(
          <div>
            <Text size={size} render={<p />} id="with">
              Deploy <Chip>Live</Chip> now
            </Text>
            <Text size={size} render={<p />} id="without">
              Deploy Live now
            </Text>
          </div>,
          { theme: { pointer } },
        );
        const h = (id: string) =>
          host.querySelector<HTMLElement>(`#${id}`)!.getBoundingClientRect().height;
        expect(
          h("with") - h("without"),
          `${pointer}/size ${size}: the chip spread its line`,
        ).toBeCloseTo(0, 1);
      }
    }
  });

  it("the pill has a face: its box IS the line box, and it stands clear of its own glyphs", () => {
    for (const size of ["1", "3", "6", "9"] as const) {
      const host = mounted(
        <Text size={size} render={<p />}>
          Deploy <Chip>Live</Chip>
        </Text>,
        { theme: {} },
      );
      const chip = host.querySelector<HTMLElement>(".kui-chip")!;
      const line = parseFloat(computed(host, "line-height"));
      expect(
        chip.getBoundingClientRect().height,
        `size ${size}: the chip is not one line tall`,
      ).toBeCloseTo(line, 1);
      expect(chip.getBoundingClientRect().height).toBeGreaterThan(
        parseFloat(computed(chip, "font-size")) * 1.1,
      );
    }
  });

  it("a chip and a cap at one size are one box — the promotion, measured", () => {
    // The point of moving the geometry into `.kui-atom-box`: two members, one box. Asserted on
    // the rendered heights rather than on the declaration, because a shared declaration that
    // resolves differently is the failure this is worth catching.
    for (const size of ["1", "4", "9"] as const) {
      const chip = mounted(<Chip size={size}>W</Chip>, { theme: {} });
      const kbd = mounted(<Kbd size={size}>W</Kbd>, { theme: {} });
      expect(
        chip.getBoundingClientRect().height,
        `size ${size}: the chip and the cap stopped agreeing on the box`,
      ).toBeCloseTo(kbd.getBoundingClientRect().height, 1);
    }
  });
});

describe("the box holds its shape (§6, §15)", () => {
  it("a long unbroken state never wraps — and the fixture has nowhere to break", () => {
    // The degenerate-fixture rule (2026-08-20, and Notice's own sabotage that survived on
    // 2026-08-21): a browser breaks a line after a hyphen, so a hyphenated fixture wraps on its
    // own and proves nothing about `white-space`. This string has no break opportunity in it,
    // so the assertion below is about the declaration and not about the browser's typography.
    const host = mounted(
      <div style={{ inlineSize: "60px" }}>
        <Chip>QueuedAwaitingCapacity</Chip>
      </div>,
      { theme: {} },
    );
    const chip = host.querySelector<HTMLElement>(".kui-chip")!;
    expect(computed(chip, "white-space")).toBe("nowrap");
    // One line, measured: the box is exactly as tall as it would be holding one character.
    const one = mounted(<Chip>Q</Chip>, { theme: {} });
    expect(chip.getBoundingClientRect().height).toBeCloseTo(
      one.getBoundingClientRect().height,
      1,
    );
  });

  it("a narrow single character stands at its floor — which is the count case", () => {
    // Apple's chip is a number on a container, and a character that shrink-wrapped would be a
    // sliver rather than a chip.
    //
    // THE FIXTURE IS THE LAW HERE, and the first spelling of it proved nothing. It used `1`,
    // which measures 1.634em wide — CONTENT-driven, a hair over the floor it was meant to
    // demonstrate — so deleting `min-inline-size` altogether changed the rendered width by less
    // than the tolerance and the sabotage survived. Kbd's own floor law had the same shape with
    // `K` (1.654em) and survived the same sabotage, which is how this was found: copying a law
    // copied its blind spot. Measured across the glyphs, `i` and `.` are the only ones the floor
    // actually binds (1.599em, the floor itself), and `W` overruns it at 1.987em.
    //
    // So the assertion is EXACT rather than bounded, on a glyph the floor really sets, with the
    // wide glyph beside it as the calibration that this is a floor and not a fixed width.
    const narrow = mounted(<Chip>i</Chip>, { theme: {} });
    const font = parseFloat(computed(narrow, "font-size"));
    expect(
      parseFloat(computed(narrow, "width")) / font,
      "a narrow chip is no longer standing at its floor",
    ).toBeCloseTo(1.6, 2);
    const wide = mounted(<Chip>W</Chip>, { theme: {} });
    expect(
      parseFloat(computed(wide, "width")) / parseFloat(computed(wide, "font-size")),
      "the floor became a fixed width",
    ).toBeGreaterThan(1.7);
    expect(computed(narrow, "justify-content")).toBe("center");
  });

  it("the corner answers the radius AXIS, and it is EM like the rest of the family (§6)", () => {
    // No new exception (§6 has four and they are role semantics — a circle only nests in a
    // curve). A chip is not one of them: it rides the axis, so `none` squares it.
    const none = mounted(<Chip>Live</Chip>, { theme: { radius: "none" } });
    expect(parseFloat(computed(none, "border-top-left-radius"))).toBe(0);
    const full = mounted(<Chip>Live</Chip>, { theme: { radius: "full" } });
    expect(parseFloat(computed(full, "border-top-left-radius"))).toBeGreaterThan(0);
    // EM: the corner tracks the chip's own type across the ramp, so the ratio holds where
    // the pixels do not.
    const ratio = (el: HTMLElement) =>
      parseFloat(computed(el, "border-top-left-radius")) / parseFloat(computed(el, "font-size"));
    expect(ratio(mounted(<Chip size="1">x</Chip>, { theme: {} }))).toBeCloseTo(
      ratio(mounted(<Chip size="8">x</Chip>, { theme: {} })),
      3,
    );
  });

  it("owns no outer spacing, and renders a <span> unless told otherwise (§3)", () => {
    const chip = mounted(<Chip>Live</Chip>, { theme: {} });
    expect(chip.tagName).toBe("SPAN");
    for (const side of ["top", "right", "bottom", "left"]) {
      expect(parseFloat(computed(chip, `margin-${side}`))).toBe(0);
    }
    const rendered = mounted(<Chip render={<em />}>Live</Chip>, { theme: {} });
    expect(rendered.tagName).toBe("EM");
    expect(computed(rendered, "background-color")).toBe(colorOn(rendered, "var(--tone-soft)"));
  });
});


/**
 * AN EMPTY CHIP RENDERS NOTHING (added 2026-08-23 from the ultracode audit).
 *
 * The refusal — "an empty chip, or a bare dot" — was documented in the component reference
 * and enforced nowhere. Measured before the fix: `<Chip tone="success">{false && "New"}</Chip>`
 * rendered a 23.03 x 16 green lozenge with empty `textContent`. A coloured dot is colour
 * carrying meaning alone, which is what the refusal is about.
 *
 * The fixture walks the four ways a caller lands there, because the TYPE closes none of them:
 * `{cond && "…"}` is `string | false` and is the commonest spelling of a conditional chip.
 */
describe("an empty chip is refused at runtime, because the type cannot refuse it", () => {
  for (const [label, child] of [
    ["a false conditional", false],
    ["an empty string", ""],
    ["null", null],
    ["undefined", undefined],
  ] as const) {
    it(`${label} renders no element at all`, () => {
      const root = mounted(
        <div data-t="host">
          <Chip tone="success">{child}</Chip>
        </div>,
        { theme: {} },
      );
      expect(root.querySelector(".kui-chip"), `${label} still drew a lozenge`).toBeNull();
    });
  }

  it("but ZERO is content, and a real word still renders", () => {
    // The other half, and it is what stops the guard being "render nothing, ever". `0` is a
    // count somebody meant to show — `filled()`'s own rule — and without this the law passes
    // on a Chip that had stopped rendering entirely.
    const root = mounted(
      <div>
        <Chip data-t="zero">{0}</Chip>
        <Chip data-t="word">New</Chip>
      </div>,
      { theme: {} },
    );
    expect(within(root, '[data-t="zero"]').textContent, "a zero count vanished").toBe("0");
    expect(within(root, '[data-t="word"]').textContent).toBe("New");
    expect(root.querySelectorAll(".kui-chip")).toHaveLength(2);
  });
});

describe("Chip `backdrop` — the floating chip takes the theme's material (§10, 2026-08-26)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: over glass the fill becomes a veil and the filter is real`, () => {
      // The stamp, the veil and the filter in one experiment, against the solid twin in the
      // SAME theme — so what is measured is the prop, not the theme.
      const glass = mounted(<Chip backdrop>Live</Chip>, {
        theme: { appearance, material: "thin" },
      });
      const solid = mounted(<Chip>Live</Chip>, { theme: { appearance, material: "thin" } });
      expect(glass.getAttribute("data-material")).toBe("thin");
      expect(solid.getAttribute("data-material")).toBeNull();
      expect(computed(glass, "background-color")).not.toBe(computed(solid, "background-color"));
      expect(computed(glass, "backdrop-filter")).not.toBe("none");
      expect(computed(solid, "backdrop-filter")).toBe("none");
    });
  }

  it("on calm ground the prop costs nothing", () => {
    // Selectivity's negative control: under a solid theme, `backdrop` resolves solid, stamps
    // nothing, and the chip is byte-identical to a plain one.
    const marked = mounted(<Chip backdrop>Live</Chip>, { theme: {} });
    const plain = mounted(<Chip>Live</Chip>, { theme: {} });
    expect(marked.getAttribute("data-material")).toBeNull();
    expect(computed(marked, "background-color")).toBe(computed(plain, "background-color"));
    expect(computed(marked, "backdrop-filter")).toBe("none");
  });

  it("a glass chip scopes its subtree — one glass per stack", () => {
    // The fixture is contrived on purpose and NOT degenerate (the Notice lesson): the child
    // must be something that CAN ask for glass, or the law passes with the scope deleted.
    // A backdrop-marked Card inside a glass chip resolves ON-GLASS (§10, 2026-08-17: glass
    // never renders on glass — the pane's scope hands its subtree the solid appearance at
    // the pane's own alpha), never a second veil. With the scope deleted it stamps "thin",
    // which is what the falsification run shows.
    const chip = mounted(
      <Chip backdrop>
        <Card backdrop>x</Card>
      </Chip>,
      { theme: { material: "thin" } },
    );
    expect(chip.getAttribute("data-material")).toBe("thin");
    expect(chip.querySelector(".kui-surface")?.getAttribute("data-material")).toBe("on-glass");
  });
});
