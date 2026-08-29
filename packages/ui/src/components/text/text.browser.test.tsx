/**
 * Text and Heading, mounted (§3, §5, §11, §15) — one file because they are one type system:
 * the same ramp and weight set through two family slots. Laws read computed values through a
 * mounted Theme, per the 2026-08-03 audit standard; the static half (the layer carries each
 * axis once, tokens only) lives in system/type.test.ts.
 */
import type * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { VIEWPORT } from "../../test/viewport.ts";

import { Theme } from "../../theme/theme.tsx";
import {
  APPEARANCES,
  POINTERS,
  SIZES,
  colorOn,
  computed,
  mounted,
  render,
} from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Heading } from "../heading/heading.tsx";
import { Text, type TypeSize } from "./text.tsx";

/** Every token this file resolves is a colour, and the harness's tokenOn reads lengths — so
    the name stays, one line over the shared probe. */
const tokenOn = (el: Element, name: string): string => colorOn(el, `var(${name})`);

describe("a size step joins the three paired scales at one index (§15)", () => {
  it("resolves font-size, line-height and letter-spacing together", () => {
    const body = render(<Text>body</Text>);
    // The anchor step: --font-size-base is step 3, and Text rests on it.
    expect(computed(body, "font-size")).toBe("16px");
    expect(computed(body, "line-height")).toBe("24px");

    const display = render(<Text size="9">display</Text>);
    expect(computed(display, "font-size")).toBe("56px");
    // Paired, not derived: 62/56 ≈ 1.11 — a global 1.5 ratio would have said 84.
    expect(computed(display, "line-height")).toBe("62px");
    // Display sizes tighten; the negative tracking comes from the paired token.
    expect(parseFloat(computed(display, "letter-spacing"))).toBeLessThan(0);
  });

  it("Heading sits on the same ramp — one type system, not two", () => {
    const h = render(<Heading size="4">title</Heading>);
    const t = render(<Text size="4">text</Text>);
    expect(computed(h, "font-size")).toBe(computed(t, "font-size"));
    expect(computed(h, "line-height")).toBe(computed(t, "line-height"));
  });
});

describe("type never takes density — boxes move, labels hold (§12, §15, §16)", () => {
  it("holds its step under every density a Theme can set", () => {
    // Pointer left this list 2026-08-05: the handheld band rides the pointer axis now (§17,
    // the device prop is dropped), so pinning coarse legitimately moves the reading steps.
    // Density is the invariance that remains, in both pointer worlds — and in the coarse
    // world the held step it must hold is the BAND's, not the desktop one.
    for (const worlds of [
      { density: "compact" },
      { density: "comfortable" },
    ] as const) {
      const el = mounted(<Text size="3">held</Text>, { theme: worlds });
      expect(computed(el, "font-size")).toBe("16px");
      expect(computed(el, "line-height")).toBe("24px");
    }
    for (const density of ["compact", "comfortable"] as const) {
      const el = mounted(<Text size="3">held</Text>, { theme: { pointer: "coarse", density } });
      expect(computed(el, "font-size")).toBe("18px");
      expect(computed(el, "line-height")).toBe("26px");
    }
  });

  it("--scale is the one factor that reaches it, through the tokens (§5, §15)", () => {
    // At the root, deliberately: tokens substitute var(--scale) where they are DECLARED
    // (:root), so global zoom is a root-level knob and a nested --scale re-prices nothing —
    // the substitution-at-declaration behaviour every re-declaring axis block exists to
    // work around. If `scale` ever becomes a Theme prop (§5 defers it), it will need its
    // own re-declaration scope, and this law is the one that starts failing.
    document.documentElement.style.setProperty("--scale", "2");
    try {
      expect(computed(render(<Text size="1">zoomed</Text>), "font-size")).toBe("24px");
    } finally {
      document.documentElement.style.removeProperty("--scale");
    }
  });
});

describe("the HANDHELD band: coarse re-picks the reading steps, fine is the escape (§15, §17)", () => {
  const triple = ["font-size", "line-height", "letter-spacing"] as const;

  it("a handheld step computes exactly the desktop triple at its picked index — designed, not scaled", () => {
    // size → pick, from config's typeBands.handheld. Equality against another RENDERED step
    // rather than restated numbers: the law is "a band re-picks the palette", so the palette
    // itself is the reference. Both appearances, per the audit standard. The band rides the
    // pointer axis since the device prop was dropped (2026-08-05, LOG): pinning coarse is
    // pinning handheld.
    //
    // Step 9 maps to ITSELF here, and that is the split of 2026-08-05 (LOG): a held screen is
    // close to the eye, which is a reason to raise reading sizes and no reason at all to cut
    // display sizes. Cutting them is a line-length fact, and line length is width — so the
    // display steps moved to their own band and an iPad keeps its 56px heading.
    for (const appearance of APPEARANCES) {
      for (const [size, pick] of [
        ["1", "2"],
        ["3", "4"],
        ["5", "5"],
        ["9", "9"],
      ] as [TypeSize, TypeSize][]) {
        const handheld = mounted(<Text size={size}>h</Text>, {
          theme: { appearance, pointer: "coarse" },
        });
        const desktop = mounted(<Text size={pick}>d</Text>, {
          theme: { appearance, pointer: "fine" },
        });
        for (const prop of triple) {
          expect(computed(handheld, prop), `size ${size} → step ${pick}, ${prop}`).toBe(
            computed(desktop, prop),
          );
        }
      }
    }
  });

  it("a fine Theme nested in a coarse region resets — an escape that does nothing is not an escape", () => {
    const reference = render(<Text size="3">ref</Text>);
    const host = render(
      <Theme pointer="coarse">
        <Text size="3">outer</Text>
        <Theme pointer="fine">
          <Text size="3">inner</Text>
        </Theme>
      </Theme>,
    );
    const [outer, inner] = [...host.querySelectorAll(".kui-text")];
    expect(computed(inner!, "font-size")).toBe(computed(reference, "font-size"));
    expect(computed(outer!, "font-size")).not.toBe(computed(inner!, "font-size"));
  });

  it("auto resolves desktop type on a fine pointer, whatever the width", () => {
    // This browser is fine-pointer, so auto must be the identity here — and after the split
    // it must stay the identity at ANY width, which is the whole correction: the old rule
    // asked `coarse AND narrow`, so a wide iPad fell out of a rise it should have had while
    // a narrow desktop window was safe for the wrong reason. The coarse side of the query
    // needs real hardware; the emitted-declarations law pins that auto IS the coarse world.
    const auto = mounted(<Text size="3">a</Text>, { theme: {} });
    const desktop = mounted(<Text size="3">d</Text>, { theme: { pointer: "fine" } });
    for (const prop of triple) expect(computed(auto, prop)).toBe(computed(desktop, prop));
  });

  it("a control's label IS type at the size join — same triple, both worlds (§4, §15)", () => {
    // The parity law: there is one definition of what a size step means, and the control
    // join consumes it. This is also what carries the band into control labels through the
    // same pointer world that grows their boxes (§16, §17).
    for (const pointer of POINTERS) {
      for (const size of SIZES) {
        const host = render(
          <Theme pointer={pointer}>
            <Button size={size}>b</Button>
            <Text size={size}>t</Text>
          </Theme>,
        );
        const button = host.querySelector(".kui-control")!;
        const text = host.querySelector(".kui-text")!;
        for (const prop of triple) {
          expect(computed(button, prop), `${pointer} size ${size}, ${prop}`).toBe(
            computed(text, prop),
          );
        }
      }
    }
  });
});

describe("the NARROW band: a short line cuts the display steps (§15, §17, split 2026-08-05)", () => {
  // The other half of the band that used to be one. Its justification was always line length
  // — "56px on a 375px screen is seven characters" — which is a width fact and has nothing to
  // do with how far the screen is from your eyes. Welded to the held band it fired on phones
  // only; on its own it fires wherever the line is short, a squeezed desktop window included.
  //
  // The viewport is resized for real rather than simulated: a media query is the mechanism,
  // and a law that stubs the mechanism it is testing proves nothing.
  const WIDE = VIEWPORT;
  const NARROW = { width: 375, height: 800 };

  async function at(size: { width: number; height: number }, read: () => string[]) {
    await page.viewport(size.width, size.height);
    return read();
  }

  afterEach(async () => {
    await page.viewport(WIDE.width, WIDE.height);
  });

  it("cuts step 9 when the window is narrow, and restores it when it is not", async () => {
    const step9 = () => [computed(render(<Heading size="9">h</Heading>), "font-size")];
    expect(await at(NARROW, step9)).not.toEqual(await at(WIDE, step9));
    // Down, never up: the whole reason the band exists.
    const [narrow] = await at(NARROW, step9);
    const [wide] = await at(WIDE, step9);
    expect(parseFloat(narrow!)).toBeLessThan(parseFloat(wide!));
  });

  it("leaves the READING steps alone — that is the other band's question", async () => {
    // The bug this pins is the one the split fixed from the other side: a narrow desktop
    // window is not held, so its body copy must not grow. Before the split the two moved
    // together or not at all.
    const body = () => [computed(render(<Text size="3">t</Text>), "font-size")];
    expect(await at(NARROW, body)).toEqual(await at(WIDE, body));
  });

  it("a Theme pinned to `fine` does NOT undo it — width is not a device fact", async () => {
    // The escape re-declares the handheld band's steps and deliberately not the display
    // steps. A pointer says nothing about how wide the window is, and a `fine` Theme inside
    // a 375px viewport still has a 375px viewport.
    const pinned = () => [
      computed(mounted(<Heading size="9">h</Heading>, { theme: { pointer: "fine" } }), "font-size"),
    ];
    expect(await at(NARROW, pinned)).not.toEqual(await at(WIDE, pinned));
  });
});

describe("weight takes token names, never numbers (§15)", () => {
  it("Text rests regular, Heading rests semibold, and the prop moves both", () => {
    expect(computed(render(<Text>t</Text>), "font-weight")).toBe("400");
    expect(computed(render(<Heading>h</Heading>), "font-weight")).toBe("600");
    expect(computed(render(<Text weight="semibold">t</Text>), "font-weight")).toBe("600");
    expect(computed(render(<Heading weight="medium">h</Heading>), "font-weight")).toBe("500");
  });

  it("700 is unreachable — a heading's resting weight is the TOP of the ladder (§15)", () => {
    // The mounted half of the refusal. `bold` is gone from the union, so the only way back to
    // 700 is a hand-written declaration; this asserts the ladder's ceiling is what ships, in
    // both families and at both ends of the ramp.
    for (const el of [
      <Text size="9" weight="semibold">t</Text>,
      <Heading size="9">h</Heading>,
      <Heading size="1">h</Heading>,
    ]) {
      expect(Number(computed(render(el), "font-weight"))).toBeLessThanOrEqual(600);
    }
  });
});

describe("the family is the Theme's slot (§5, §15)", () => {
  it("Heading reads --font-heading, which chains to the body stack until an app sets it", () => {
    const chained = render(
      <div>
        <Heading>h</Heading>
        <Text>t</Text>
      </div>,
    );
    const h = chained.querySelector(".kui-heading")!;
    const t = chained.querySelector(".kui-text")!;
    expect(computed(h, "font-family")).toBe(computed(t, "font-family"));

    const split = render(
      <div style={{ "--font-heading": "Georgia, serif" } as React.CSSProperties}>
        <Heading>h</Heading>
        <Text>t</Text>
      </div>,
    );
    expect(computed(split.querySelector(".kui-heading")!, "font-family")).toContain("Georgia");
    expect(computed(split.querySelector(".kui-text")!, "font-family")).not.toContain("Georgia");
  });
});

describe("no tone: text reads the foreground context, and emphasis picks the role (§9, §11, §15)", () => {
  it("rests loud — the --color-text role inside a plain surface", () => {
    const el = render(
      <Card>
        <Text>inside</Text>
      </Card>,
    ).querySelector(".kui-text")!;
    expect(computed(el, "color")).toBe(tokenOn(el, "--color-text"));
  });

  it("the ladder resolves three distinct colours, in both appearances", () => {
    for (const appearance of APPEARANCES) {
      const host = render(
        <Theme appearance={appearance}>
          <Text emphasis="loud">a</Text>
          <Text emphasis="medium">b</Text>
          <Text emphasis="quiet">c</Text>
        </Theme>,
      );
      const colours = [...host.querySelectorAll(".kui-text")].map((el) => computed(el, "color"));
      expect(new Set(colours).size).toBe(3);
      const el = host.querySelector('[data-emphasis="medium"]')!;
      expect(computed(el, "color")).toBe(tokenOn(el, "--color-text-muted"));
    }
  });

  it("on a loud surface the tone-less ladder collapses to the APCA-chosen contrast (§10)", () => {
    const host = render(
      <div className="kui-surface" data-size="3" data-tone="accent" data-emphasis="loud">
        <Text emphasis="loud">a</Text>
        <Text emphasis="medium">b</Text>
        <Text emphasis="quiet">c</Text>
      </div>,
    );
    for (const el of host.querySelectorAll(".kui-text")) {
      expect(computed(el, "color")).toBe(tokenOn(el, "--tone-contrast"));
    }
  });
});

describe("colour reaches text as tone — a family, never a colour name (§7, §15)", () => {
  it("a chroma family's loud rung is its designed text colour, and the ladder stays distinct", () => {
    for (const appearance of APPEARANCES) {
      const host = render(
        <Theme appearance={appearance}>
          <Text tone="destructive" emphasis="loud">a</Text>
          <Text tone="destructive" emphasis="medium">b</Text>
          <Text tone="destructive" emphasis="quiet">c</Text>
        </Theme>,
      );
      const els = [...host.querySelectorAll(".kui-text")];
      const colours = els.map((el) => computed(el, "color"));
      expect(new Set(colours).size).toBe(3);
      // Loud is the family's ONE designed text colour (11) — not 12, which is the
      // high-contrast variant: an error message should read red, not near-black.
      expect(colours[0]).toBe(tokenOn(els[0]!, "--destructive-text"));
    }
  });

  it("tone='neutral' is exactly the tone-less resting state — one ladder, not two", () => {
    const host = render(
      <div>
        <Text>plain</Text>
        <Text tone="neutral">named</Text>
      </div>,
    );
    const [plain, named] = [...host.querySelectorAll(".kui-text")];
    expect(computed(named!, "color")).toBe(computed(plain!, "color"));
  });

  it("an explicit tone survives a loud surface's collapse — a choice is respected", () => {
    const host = render(
      <div className="kui-surface" data-size="3" data-tone="accent" data-emphasis="loud">
        <Text tone="destructive">explicit</Text>
        <Text>ambient</Text>
      </div>,
    );
    const [explicit, ambient] = [...host.querySelectorAll(".kui-text")];
    expect(computed(explicit!, "color")).toBe(tokenOn(explicit!, "--destructive-text"));
    expect(computed(ambient!, "color")).toBe(tokenOn(ambient!, "--tone-contrast"));
  });
});

describe("never owns outer spacing, whatever element it renders (§3, §5)", () => {
  it("the render escape names the flow element and the margin stays zero", () => {
    const p = render(<Text render={<p />}>para</Text>);
    expect(p.tagName).toBe("P");
    expect(computed(p, "margin-top")).toBe("0px");
    expect(computed(p, "margin-bottom")).toBe("0px");

    const h1 = render(<Heading render={<h1 />}>title</Heading>);
    expect(h1.tagName).toBe("H1");
    expect(computed(h1, "margin-top")).toBe("0px");
    expect(computed(h1, "margin-bottom")).toBe("0px");
    // The ramp does not move with the element: outline level and visual size are
    // independent axes, and only `size` prices the type.
    expect(computed(h1, "font-size")).toBe("24px");
  });
});


describe("a word longer than its line WRAPS, because a pane deletes what it cannot hold (§3, 2026-08-21)", () => {
  it("every family inherits the break from the Theme root, in flow and in a portal", () => {
    // A surface clips since the bleed shipped (2026-08-20), which turned an overflow from a
    // visible spill into a silent deletion — an ordinary share link measured 481px inside a
    // 440px dialog with the tail simply gone. The declaration is on the Theme root because it
    // INHERITS: one rule covers text a component wrote, text a call site wrote, and text
    // inside a portal, which renders its own bare Theme (§20).
    const text = mounted(<Text>word</Text>, { theme: {}, select: ".kui-text" });
    expect(computed(text, "overflow-wrap")).toBe("break-word");
    const heading = mounted(<Heading>word</Heading>, { theme: {}, select: ".kui-heading" });
    expect(computed(heading, "overflow-wrap"), "a heading breaks too — a long name is a name").toBe("break-word");
  });

  it("is `break-word` and NOT `anywhere` — the difference is a measurement, not a spelling", () => {
    // `anywhere` also lets a long word shrink an element's MIN-CONTENT width, which would
    // quietly change how every flex and grid item in the library is sized. `break-word` breaks
    // at paint and leaves intrinsic sizing alone. The law reads the value rather than merely
    // asserting "something is set", because the wrong one of the two would satisfy that.
    const text = mounted(<Text>word</Text>, { theme: {}, select: ".kui-text" });
    expect(computed(text, "overflow-wrap")).not.toBe("anywhere");
  });

  it("does not reach content that must not wrap — that is a ScrollArea's job", () => {
    // The scope, and the negative control. `white-space: pre` beats a wrap rule, which is
    // correct: code and tables keep their shape and go in a scroller. A law that only checked
    // the wrapping half would pass with a rule that broke a `<pre>` apart.
    const card = mounted(
      <Card size="3"><pre data-testid="pre">{"a b"}</pre></Card>,
      { theme: {}, select: ".kui-card" },
    );
    const pre = card.querySelector<HTMLElement>("[data-testid='pre']");
    if (!pre) throw new Error("the pre never mounted");
    expect(computed(pre, "white-space"), "a pre still refuses to wrap").toBe("pre");
  });
});

describe("text is antialiased, so a weight reads at the weight it was drawn", () => {
  it("both smoothing properties resolve on any text, through inheritance from the Theme", () => {
    // WHY IT IS A DECISION, not a preference. macOS renders with SUBPIXEL antialiasing by
    // default, which lays colour along every stem and reads about half a weight heavier than
    // the face was drawn. This ladder is three adjacent steps — 400, 500, 600 — so half a
    // weight is most of the distance between two of them.
    //
    // On the Theme root because both properties INHERIT: one declaration covers text a
    // component wrote, text a call site wrote, and text inside a portal, which is the same
    // argument `overflow-wrap` is placed by directly above.
    const text = mounted(<Text>word</Text>, { theme: {}, select: ".kui-text" });
    expect(computed(text, "-webkit-font-smoothing")).toBe("antialiased");
    // The Firefox half is deliberately NOT read here. `-moz-osx-font-smoothing` is not a
    // property Chromium exposes to getComputedStyle — it comes back as the empty string, so a
    // law asserting it in this engine fails against correct CSS. It is checked where it can
    // be, in type.test.ts, which reads the emitted declaration.

    const heading = mounted(<Heading>word</Heading>, { theme: {}, select: ".kui-heading" });
    expect(computed(heading, "-webkit-font-smoothing"), "a heading inherits it too").toBe("antialiased");
  });

  it("WHAT THIS LAW CANNOT PROVE, stated so nobody reads more into it than it says", () => {
    // It reads the DECLARATION and stops there, which for every other appearance rule in this
    // repo would be one indirection short of the thing that could be wrong. Here it is the
    // end of the road: headless Chromium renders grayscale-only — 0 colour-fringed pixels in
    // 10,080 sampled — so the suite cannot tell a page it changed from one it did not, and a
    // law claiming to have measured the effect would be a law measuring nothing.
    //
    // The consequence is judged by eye at /matrix, not here. It also lands on the ink ladder:
    // grayscale puts less ink on screen than subpixel, so every rung reads slightly lighter
    // than it did when the rungs were judged. The APCA solve is untouched — it measures
    // colour, and no colour moves — but apparent contrast at small sizes does.
    const text = mounted(<Text>word</Text>, { theme: {}, select: ".kui-text" });
    expect(computed(text, "-webkit-font-smoothing")).not.toBe("auto");
  });
});
