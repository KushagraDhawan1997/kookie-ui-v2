/**
 * Button's laws, mounted (§4, §8, §9, §11). The axis model has been prose since the first day
 * of this project; this is where it either resolves to real pixels or does not.
 */
import { describe, expect, it } from "vitest";

import type { RenderElement } from "../../system/render.ts";
import { coarse, density } from "../../tokens/config.ts";
import {
  GLASS_MATERIALS,
  APPEARANCES,
  SIZES,
  colorOn,
  computed,
  inMotion,
  mounted,
  ownColor,
  probeIn,
  render,
} from "../../test/browser.tsx";
import { Card } from "../card/card.tsx";
import { TextField as TextFieldForButtonTest } from "../text-field/text-field.tsx";
import { Button } from "./button.tsx";

/** Every token this file resolves is a colour, and the harness's tokenOn reads lengths — so
    the name stays, one line over the shared probe. */
const tokenOn = (el: Element, name: string): string => colorOn(el, `var(${name})`);

describe("the DEFAULT radius level renders on the un-themed path (§6, full since 2026-08-09)", () => {
  it("a bare control is a capsule with pill padding — :root carries the default level's answer", () => {
    // The flip's first casualty, law-pinned: the capsule band and pill padding were only
    // emitted into [data-radius] scopes, so a document with no Theme and no stamps rendered
    // the raw 9999px palette and the plain padding — the exact clamping bug §6 closed on
    // 2026-08-05, resurrected by making `full` the default. :root now states the default
    // level's whole answer; deleting that emission fails exactly this law.
    const el = render(<Button size="2">Label</Button>);
    const h = parseFloat(computed(el, "min-height"));
    expect(parseFloat(computed(el, "border-top-left-radius"))).toBeCloseTo(h / 2, 1);
    expect(computed(el, "padding-left")).toBe(`${density.default.pxPill[1]}px`);
  });
});

describe("the size index joins five scales at one number (§4)", () => {
  it("resolves height, padding, gap, radius and type together", () => {
    const el = mounted(<Button size="3">Label</Button>, { theme: { radius: "medium" } });
    // radius="medium" pinned: this law states a palette-legible fact, and the DEFAULT
    // level is `full` since 2026-08-09 (capsules and pill padding — their own laws).
    // Read off the designed set rather than restated: this law is about the JOIN — that one
    // index pulls every family together — so the number it compares against must be the one
    // the config placed, or the law re-freezes a value the eye pass is meant to move.
    expect(computed(el, "min-height")).toBe(`${density.default.height[2]}px`);
    expect(computed(el, "padding-left")).toBe(`${density.default.px[2]}px`);
    expect(computed(el, "column-gap")).toBe("8px");
    expect(computed(el, "border-top-left-radius")).toBe("8px");
    expect(computed(el, "font-size")).toBe("16px");
  });

  it("is min-height, not height — a control grows rather than clipping (§4)", () => {
    expect(computed(render(<Button size="2">Label</Button>), "min-height")).toBe("32px");
    const tall = render(
      <Button size="2">
        <span style={{ display: "block", height: "80px" }}>tall</span>
      </Button>,
    );
    expect(parseFloat(computed(tall, "height"))).toBeGreaterThanOrEqual(80);
  });

  it("follows the density and pointer worlds it is rendered in (§12, §16)", () => {
    const compact = mounted(<Button size="2">Label</Button>, { theme: { density: "compact" } });
    expect(computed(compact, "min-height")).toBe("28px");

    const touch = mounted(<Button size="2">Label</Button>, { theme: { pointer: "coarse" } });
    // The default path: default density, size 2, coarse — the 44 target, in geometry (§16).
    expect(computed(touch, "min-height")).toBe("44px");
  });
});

describe("the axes are orthogonal and resolve through the role layer (§7, §9)", () => {
  it("emphasis picks loudness while tone picks the family, independently", () => {
    // `blue`, not `accent` (2026-08-10). Accent is a CONFIGURED identity that may equal any
    // other family, and it has now been both: blue's own recipe, then neutral's from
    // 2026-08-10, then blue's again from 2026-08-16. That is exactly why it is never a valid
    // probe for "these two differ" — this law asserted three distinct fills with accent as one
    // of them and went red the hour the brand went grey. A named chroma family cannot collapse
    // into neutral without someone editing it on purpose, and the point survives the brand
    // moving back: the fix was to stop probing a rebindable identity, not to wait for it to
    // return to a convenient value.
    const cells = (["neutral", "blue", "destructive"] as const).flatMap((tone) =>
      (["loud", "medium", "quiet"] as const).map((emphasis) => {
        const el = render(
          <Button tone={tone} emphasis={emphasis}>
            Label
          </Button>,
        );
        return { tone, emphasis, fill: computed(el, "background-color") };
      }),
    );

    // Within a rung, every tone is distinct — the tone indirection actually rebinds.
    for (const emphasis of ["loud", "medium"] as const) {
      const fills = cells.filter((c) => c.emphasis === emphasis).map((c) => c.fill);
      expect(new Set(fills).size).toBe(3);
    }
    // Quiet is bare at rest in every tone: its rest is the absence of a fill (§9).
    for (const c of cells.filter((c) => c.emphasis === "quiet")) {
      expect(c.fill).toBe("rgba(0, 0, 0, 0)");
    }
  });

  it("a label is never the raw text token — controls read --tone-label (§7)", () => {
    const el = render(<Button emphasis="medium">Label</Button>);
    expect(computed(el, "color")).toBe(tokenOn(el, "--tone-label"));
    expect(computed(el, "color")).not.toBe(tokenOn(el, "--tone-text"));
  });

  it("loud reads the APCA-chosen contrast for its own fill", () => {
    const el = render(
      <Button tone="destructive" emphasis="loud">
        Delete
      </Button>,
    );
    expect(computed(el, "color")).toBe(tokenOn(el, "--tone-contrast"));
  });

  it("bordered is orthogonal: it composes with every rung without changing the fill", () => {
    for (const emphasis of ["loud", "medium", "quiet"] as const) {
      const plain = render(<Button emphasis={emphasis}>L</Button>);
      const edged = render(
        <Button emphasis={emphasis} bordered>
          L
        </Button>,
      );
      expect(computed(edged, "background-color")).toBe(computed(plain, "background-color"));
      expect(computed(edged, "border-top-color")).toBe(tokenOn(edged, "--tone-border"));
      expect(computed(plain, "border-top-color")).toBe("rgba(0, 0, 0, 0)");
    }
  });
});

describe("states are stylesheet work, and the DOM stays honest (§8, ENGINEERING §1.4)", () => {
  it("renders every axis as a data attribute, so the page reads its own decisions", () => {
    const el = render(
      <Button size="3" tone="accent" emphasis="loud" bordered>
        Label
      </Button>,
    );
    expect(el.dataset.size).toBe("3");
    expect(el.dataset.tone).toBe("accent");
    expect(el.dataset.emphasis).toBe("loud");
    expect(el.dataset.bordered).toBe("true");
    expect(el.tagName).toBe("BUTTON");
  });

  it("hover and press are +1 and +2 on the ramp, declared not scripted", () => {
    const el = render(<Button emphasis="medium">Label</Button>);
    expect(computed(el, "background-color")).toBe(tokenOn(el, "--tone-soft"));
    // The states live in the stylesheet keyed on :hover/:active, so what is asserted here is
    // that the recipe bound them to the right steps — no JS exists to fire at interaction.
    expect(tokenOn(el, "--kui-ct-fill-src-hover")).toBe(tokenOn(el, "--tone-soft-hover"));
    expect(tokenOn(el, "--kui-ct-fill-src-active")).toBe(tokenOn(el, "--tone-soft-active"));
  });

  it("disabled remaps the tone family instead of dropping opacity (§8)", () => {
    const el = render(
      <Button tone="accent" emphasis="loud" disabled>
        Label
      </Button>,
    );
    expect(el.dataset.disabled).toBe("");
    expect(computed(el, "opacity")).toBe("1");
    expect(computed(el, "background-color")).toBe(tokenOn(el, "--neutral-3"));
    expect(computed(el, "color")).toBe(tokenOn(el, "--neutral-8"));
  });

  it("a disabled quiet button stays bare — the remap keeps each rung's shape", () => {
    const el = render(
      <Button emphasis="quiet" disabled>
        Label
      </Button>,
    );
    expect(computed(el, "background-color")).toBe("rgba(0, 0, 0, 0)");
  });
});

describe("material is a fill modifier: the rung's own fill, made translucent (§10, §11)", () => {
  it("solid is the absence of a material — the default writes no attribute", () => {
    expect(render(<Button>Label</Button>).dataset.material).toBeUndefined();
    expect(
      mounted(<Button>Label</Button>, { theme: { material: "solid" } }).dataset.material,
    ).toBeUndefined();
    expect(
      mounted(<Button>Label</Button>, { theme: { material: "regular" } }).dataset.material,
    ).toBe("regular");
  });

  it("the veil is the rung's fill at the thickness alpha, over a real blur", () => {
    const el = mounted(
      <Button emphasis="loud" tone="accent">
        Label
      </Button>,
      { theme: { material: "thin" } },
    );
    expect(computed(el, "background-color")).toBe(
      colorOn(el, "color-mix(in srgb, var(--tone-solid) var(--material-thin-alpha), transparent)"),
    );
    expect(computed(el, "backdrop-filter")).not.toBe("none");
  });

  it("tone and loudness both survive the glass — colour was the point (§7, §9)", () => {
    // A chroma family rather than accent, for the reason given above: accent may be configured
    // to any other family, including neutral, and this law is about two things DIFFERING.
    const cell = (tone: "neutral" | "blue", emphasis: "loud" | "medium") =>
      computed(
        mounted(
          <Button tone={tone} emphasis={emphasis}>
            Label
          </Button>,
          { theme: { material: "thick" } },
        ),
        "background-color",
      );
    expect(cell("blue", "loud")).not.toBe(cell("neutral", "loud"));
    expect(cell("blue", "loud")).not.toBe(cell("blue", "medium"));
  });

  it("quiet glass is bare blur: rest keeps the absence of a fill (§9)", () => {
    const el = mounted(
      <Button emphasis="quiet">
        Label
      </Button>,
      { theme: { material: "regular" } },
    );
    // Mixing transparent toward transparent serialises as color(srgb …/0), not rgba(0,0,0,0);
    // the law is the alpha channel, not the spelling.
    expect(computed(el, "background-color")).toMatch(/(rgba\(0, 0, 0, 0\)|\/ 0\))$/);
    expect(computed(el, "backdrop-filter")).not.toBe("none");
  });

  it("interaction steps the veil from the rung's own hover source, at the hover alpha (§8)", () => {
    const el = mounted(
      <Button emphasis="medium">
        Label
      </Button>,
      { theme: { material: "thin" } },
    );
    expect(ownColor(el, "--kui-ct-fill-hover")).toBe(
      colorOn(el, "color-mix(in srgb, var(--tone-soft-hover) var(--material-thin-alpha-hover), transparent)"),
    );
    expect(ownColor(el, "--kui-ct-fill-active")).toBe(
      colorOn(el, "color-mix(in srgb, var(--tone-soft-active) var(--material-thin-alpha-active), transparent)"),
    );
  });

  it("the rung keeps its own label pairing under glass", () => {
    // The fill is still the rung's — merely translucent — so loud keeps the APCA-chosen
    // contrast and medium keeps the label token. Thin-over-a-bright-photo legibility is
    // §10's deferred brightness-floor branch, not a label swap.
    const loud = mounted(
      <Button tone="accent" emphasis="loud">
        Label
      </Button>,
      { theme: { material: "thick" } },
    );
    expect(computed(loud, "color")).toBe(tokenOn(loud, "--tone-contrast"));
    const medium = mounted(
      <Button tone="accent" emphasis="medium">
        Label
      </Button>,
      { theme: { material: "thick" } },
    );
    expect(computed(medium, "color")).toBe(tokenOn(medium, "--tone-label"));
  });

  it("the fill returns to opaque when the material comes off", () => {
    const glass = mounted(
      <Button emphasis="loud">
        Label
      </Button>,
      { theme: { material: "regular" } },
    );
    const plain = render(<Button emphasis="loud">Label</Button>);
    expect(computed(plain, "background-color")).toBe(tokenOn(plain, "--tone-solid"));
    expect(computed(glass, "background-color")).not.toBe(computed(plain, "background-color"));
  });
});

describe("loading keeps the label, which is the whole rule (§8)", () => {
  it("announces busy, blocks activation, and never hides the text", () => {
    let clicks = 0;
    const el = render(
      <Button loading onClick={() => (clicks += 1)}>
        Save
      </Button>,
    );
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.textContent).toBe("Save");
    expect(el.querySelector(".kui-spinner")).not.toBeNull();

    // The behaviour, not the mechanism: Base UI blocks activation through `aria-disabled`
    // rather than the native attribute, because native `disabled` would drop the button out
    // of the tab order and defeat focusableWhenDisabled.
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(clicks).toBe(0);
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });

  it("shows the busy cursor, which pointer-events: none would have made impossible", () => {
    expect(computed(render(<Button loading>Save</Button>), "cursor")).toBe("progress");
    expect(computed(render(<Button>Save</Button>), "cursor")).toBe("pointer");
    // Disabled drops back to the arrow: the hand promises a response this control won't give.
    expect(computed(render(<Button disabled>Save</Button>), "cursor")).toBe("default");
  });

  it("keeps the keyboard when a press flips it into loading", () => {
    // A click that starts a request must not dump focus, which is what plain `disabled` does.
    expect(render(<Button loading>Save</Button>).getAttribute("tabindex")).not.toBe("-1");
  });

  it("swaps the icon for the spinner in the same box, so nothing shifts", () => {
    const idle = render(
      <Button leading={<svg />} size="3">
        Save
      </Button>,
    );
    const busy = render(
      <Button leading={<svg />} size="3" loading>
        Save
      </Button>,
    );
    // The spinner hosts an svg of its own, so "the icon is gone" has to exclude it by name.
    expect(idle.querySelectorAll("svg:not(.kui-spinner-svg)").length).toBe(1);
    expect(busy.querySelectorAll("svg:not(.kui-spinner-svg)").length).toBe(0);
    expect(computed(busy, "width")).toBe(computed(idle, "width"));

    const spinner = busy.querySelector(".kui-spinner")!;
    const icon = idle.querySelector("svg:not(.kui-spinner-svg)")!;
    expect(computed(spinner, "width")).toBe(computed(icon, "width"));
  });

  it("the icon grows in the coarse world, like everything else in the control (§4, §16)", () => {
    // Found in the playground 2026-08-10 (Kushagra): the icon was the ONE thing inside a
    // control the coarse world did not re-price — a size-2 button grew 32 → 44, its label
    // 14 → 16, its checkbox sibling 16 → 20, and the glyph sat at 16 in both, reading thin.
    // The stroke needed no answer of its own: it lives inside the viewBox and scales with the
    // box, so nothing scaled because the box did not.
    //
    // Read as PAINTED width off a mounted Theme, per size — the standing rule. A law on the
    // token would have passed the day the token existed and said nothing about whether an
    // icon in a real button ever reached it.
    const iconIn = (pointer: "fine" | "coarse", size: (typeof SIZES)[number]) => {
      const el = mounted(
        <Button size={size} leading={<svg />}>
          Save
        </Button>,
        { theme: { pointer }, select: ".kui-button" },
      );
      return parseFloat(computed(el.querySelector("svg")!, "width"));
    };
    let rose = false;
    for (const size of SIZES) {
      const fine = iconIn("fine", size);
      const coarse = iconIn("coarse", size);
      expect(coarse, `size ${size}: the icon shrank on touch`).toBeGreaterThanOrEqual(fine);
      if (coarse > fine) rose = true;
    }
    // The vacuity guard: every assertion above holds for the pre-fix world, where the coarse
    // scope declared no icon box at all and inherited the fine one.
    expect(rose, "no size grew — the coarse world never reaches the icon").toBe(true);
  });

  it("the spinner takes the icon box for the size it is in, and the label's colour", () => {
    const el = render(
      <Button size="4" loading>
        Save
      </Button>,
    );
    const spinner = el.querySelector(".kui-spinner")!;
    expect(computed(spinner, "width")).toBe("24px");
    // It fills with currentColor, so it is the label's colour without naming a token (§8).
    expect(computed(spinner, "fill")).toBe(computed(el, "color"));
    // Motion-as-content, so this law announces it (test/browser.tsx): the harness holds the
    // page still by default so appearance laws cannot read a transition's first frame, and a
    // busy indicator that stops moving is information lost.
    inMotion();
    // Eight spokes, and the stepped tick that separates this from a spinning arc.
    expect(spinner.querySelectorAll("rect").length).toBe(8);
    expect(computed(spinner, "animation-timing-function")).toContain("steps(8");
  });

  it("loading does not LOOK disabled — it is still the thing you pressed", () => {
    // It carries data-disabled (activation is blocked), but the disabled tone remap excludes
    // it, so fill and label stay exactly where they were. Tested on loud/accent, where the
    // disabled neutral is unmistakably different — on medium/neutral the resting fill happens
    // to BE neutral-3 and the comparison proves nothing.
    const loading = render(
      <Button tone="accent" emphasis="loud" loading>
        Save
      </Button>,
    );
    const idle = render(
      <Button tone="accent" emphasis="loud">
        Save
      </Button>,
    );
    const off = render(
      <Button tone="accent" emphasis="loud" disabled>
        Save
      </Button>,
    );
    expect(computed(loading, "background-color")).toBe(computed(idle, "background-color"));
    expect(computed(loading, "background-color")).not.toBe(computed(off, "background-color"));
  });

  it("does not light up on hover while busy", () => {
    const el = render(<Button loading>Save</Button>);
    expect(computed(el, "background-color")).toBe(computed(render(<Button>Save</Button>), "background-color"));
  });
});

describe("the boundary (§3, §13)", () => {
  it("belongs to no dressed family: byte-identical across looks — border is RANK here (§19)", () => {
    // The negative half of the look axis's membership law. Button's border is the emphasis
    // half-step (quiet < quiet+bordered < medium < …), a call-site decision; if the app's
    // dress could move it, the ranking the call sites wrote would shift under them.
    // Widened 2026-08-06: it read the RESTING box only, so the app's dress could have moved a
    // Button's hover or press with the suite green — and the surface family's interactive
    // steps DO ride the look, which is exactly the leak this law exists to catch one component
    // over. The state sources are read rather than the states simulated: hover and active live
    // in the stylesheet keyed on :hover/:active, and these are the variables those rules
    // resolve, so a look that reached them is visible here without synthesising a pointer.
    const PROPS = ["background-color", "border-top-color", "color"] as const;
    const SOURCES = ["--kui-ct-fill-src", "--kui-ct-fill-src-hover", "--kui-ct-fill-src-active"];
    for (const appearance of APPEARANCES) {
      for (const emphasis of ["loud", "medium", "quiet"] as const) {
        const at = (look: "outlined" | "filled") =>
          mounted(
            <Button emphasis={emphasis} bordered>
              Label
            </Button>,
            // BOTH halves of the axis (split 2026-08-10): a component that belongs to no
            // dressed family must be unmoved by either prop, and pinning one would let the
            // other dress a button without a law noticing.
            { theme: { surfaceLook: look, controlLook: look, appearance }, select: ".kui-button" },
          );
        const outlined = at("outlined");
        const filled = at("filled");
        for (const prop of PROPS) {
          expect(computed(filled, prop), `${appearance}/${emphasis} ${prop}`).toBe(
            computed(outlined, prop),
          );
        }
        for (const name of SOURCES) {
          expect(ownColor(filled, name), `${appearance}/${emphasis} ${name}`).toBe(
            ownColor(outlined, name),
          );
        }
      }
    }
  });

  it("is LIT in an elevated world: casts the control row, catches light on top (§5, §19)", () => {
    // DELIBERATE REVERSAL of the 2026-08-06 "stays flat" negative law (the four-worlds
    // frame, 2026-08-07): in a world with a light source a raised control casts and
    // catches. The cast must be exactly the palette's control row — no button owns a
    // shadow of its own — and the catch is a gradient, not a shadow.
    const el = mounted(
      <Button tone="accent" emphasis="loud">
        Label
      </Button>,
      { theme: { depth: "elevated" } },
    );
    // The cast is exactly the world's control chrome (which the node laws pin to row 2
    // plus the inset rim) — no button owns a shadow of its own.
    const probe = document.createElement("div");
    probe.style.boxShadow = "var(--control-chrome)";
    el.append(probe);
    expect(computed(el, "box-shadow")).toBe(computed(probe, "box-shadow"));
    expect(computed(el, "box-shadow")).not.toBe("none");
    probe.remove();
    expect(computed(el, "background-image")).toContain("linear-gradient");
  });

  it("one lift per pane: inside a material surface the cast stands down, the catch stays (§10)", () => {
    // Dark's shadow alphas assume a dark page that swallows them; a pane swallows nothing —
    // the backdrop shows through and the cast lands on it like ink (judged in the preview,
    // 2026-08-07). The pane is the raised thing; its contents sit flush on it.
    const el = mounted(
      <Card>
        <Button tone="accent" emphasis="loud">
          Label
        </Button>
      </Card>,
      { theme: { depth: "elevated", material: "thin" } },
    );
    const button = el.querySelector("button")!;
    expect(computed(button, "box-shadow")).toBe("none");
    expect(computed(button, "background-image")).toContain("linear-gradient");
  });

  it("stays flat in a flat world, and quiet stays bare even when elevated (§5, §19)", () => {
    // Flat is byte-identical to a world where the light rules do not exist — the default
    // path cannot regress. And quiet has nothing to light: no fill, no cast, no catch.
    const flat = mounted(
      <Button tone="accent" emphasis="loud">
        Label
      </Button>,
      { theme: { depth: "flat" } },
    );
    expect(computed(flat, "box-shadow")).toBe("none");
    expect(computed(flat, "background-image")).toBe("none");
    const quiet = mounted(
      <Button tone="accent" emphasis="quiet">
        Label
      </Button>,
      { theme: { depth: "elevated" } },
    );
    expect(computed(quiet, "box-shadow")).toBe("none");
    expect(computed(quiet, "background-image")).toBe("none");
  });

  it("one light for every tone, and disabled stands it down (§5, §19)", () => {
    // The catch paints OVER the fill, so it is tone-independent by construction — a law
    // that fails if a per-tone gradient ever appears. A disabled control makes no promise:
    // it neither hovers above the page nor catches light.
    const accent = mounted(
      <Button tone="accent" emphasis="loud">
        A
      </Button>,
      { theme: { depth: "elevated" } },
    );
    const destructive = mounted(
      <Button tone="destructive" emphasis="loud">
        B
      </Button>,
      { theme: { depth: "elevated" } },
    );
    expect(computed(accent, "background-image")).toBe(computed(destructive, "background-image"));
    expect(computed(accent, "box-shadow")).toBe(computed(destructive, "box-shadow"));
    // Medium is raised, so it casts — but a white wash over a pastel fill reads as fog, so
    // the catch is loud's alone (judged in the preview, three rounds).
    const medium = mounted(
      <Button tone="accent" emphasis="medium">
        M
      </Button>,
      { theme: { depth: "elevated" } },
    );
    expect(computed(medium, "box-shadow")).toBe(computed(accent, "box-shadow"));
    expect(computed(medium, "background-image")).toBe("none");
    const disabled = mounted(
      <Button tone="accent" emphasis="loud" disabled>
        C
      </Button>,
      { theme: { depth: "elevated" } },
    );
    expect(computed(disabled, "box-shadow")).toBe("none");
    expect(computed(disabled, "background-image")).toBe("none");
  });

  it.each(GLASS_MATERIALS)(
    "a disabled %s-glass button stands its cast down too (audit 2026-08-07)",
    (material) => {
      // The law above used a SOLID button and passed while this was broken. A glass control
      // resolves its cast through --kui-ct-cast-glass, which sits first in the chain and reads
      // the three per-thickness world names — so standing --kui-control-chrome down never
      // reached it, and a dead glass button computed a shadow byte-identical to its live self.
      const live = mounted(
        <Button tone="accent" emphasis="loud">
          Save
        </Button>,
        { theme: { depth: "elevated", material } },
      );
      const dead = mounted(
        <Button tone="accent" emphasis="loud" disabled>
          Save
        </Button>,
        { theme: { depth: "elevated", material } },
      );
      // The negative control: without it, a glass button that stopped casting entirely would
      // satisfy the real assertion and hide a different bug.
      expect(computed(live, "box-shadow"), `${material} glass never casts`).not.toBe("none");
      expect(computed(dead, "box-shadow")).toBe("none");
    },
  );

  it("forwards the escape hatches and keeps its own classes", () => {
    const el = render(
      <Button className="mine" style={{ letterSpacing: "3px" }}>
        Label
      </Button>,
    );
    expect(el.className.split(" ").sort()).toEqual(["kui-button", "kui-control", "mine"]);
    expect(computed(el, "letter-spacing")).toBe("3px");
  });

  it("render composes: a link that looks like a button keeps every axis (§1)", () => {
    // Base UI's render prop is the composition escape (§1) — the element changes, the
    // resolved appearance and the data attributes the stylesheet keys on do not.
    const el = render(
      <Button render={<a href="/next" />} tone="accent" emphasis="loud" size="3">
        Go
      </Button>,
    );
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("href")).toBe("/next");
    expect(el.className).toContain("kui-control");
    expect(el.dataset.emphasis).toBe("loud");
    expect(computed(el, "min-height")).toBe("40px");
    // The half this law blessed without checking: it asserted the axes survived and never
    // asked whether the ELEMENT did. `type` on an anchor means the linked resource's MIME
    // type, and Base UI emitted it because nativeButton defaults true and was never forwarded.
    expect(el.hasAttribute("type")).toBe(false);
    expect(el.getAttribute("role")).toBe("button");
    // ...and whether the element DRESSED as one: the UA underlines anchors, and until
    // 2026-08-05 a link-as-button wore that underline into the control dress — the docs
    // nav shipped underlined "buttons" before any law asked. Computed, per the standing rule.
    expect(computed(el, "text-decoration-line")).toBe("none");
  });

  it("render survives the RSC boundary — Button inspects the element, so it must unwrap it (§5)", () => {
    // Box's law one component over, and Button needed its own because it does not compose:
    // it hands `render` to Base UI and separately READS it, to infer `nativeButton`. The
    // 371f5b4 fix reached every composeRender caller and missed the one reader.
    //
    // Same hand-built Flight shape as box.browser.test.tsx — `$$typeof: react.lazy`, no
    // `props`, no `type` — because there is no RSC boundary in a browser test and any looser
    // mock would assert nothing. Dev-only in React (facebook/react#32392), which is exactly
    // what let it ship: `next build` sends a real element and stays clean.
    const lazy = {
      $$typeof: Symbol.for("react.lazy"),
      _payload: <button className="mine" />,
      _init: (payload: unknown) => payload,
    } as unknown as RenderElement;

    const el = render(<Button render={lazy}>Go</Button>);
    // Pre-fix, measured: class was "kui-control kui-button" — the caller's own class silently
    // DROPPED — and role="button" was stamped on a real <button>, because `render.type` read
    // `undefined` off the lazy node so nativeButton inferred false. Base UI logged a warning
    // saying the element it was told about was not the element it received.
    expect(el.tagName).toBe("BUTTON");
    expect(el.className.split(" ")).toContain("mine");
    expect(el.getAttribute("role")).toBe(null);
  });

  it("and a disabled link says so, instead of being a focusable dead end (§1)", () => {
    // Was: <a href="/x" data-disabled type="button" tabindex="0" disabled> — `disabled` is
    // inert on an anchor and ignored by assistive tech, so a screen-reader user heard "Go,
    // link", pressed Enter, and nothing happened with nothing announced.
    const el = render(
      <Button render={<a href="/x" />} disabled>
        Go
      </Button>,
    );
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.hasAttribute("disabled")).toBe(false);
    expect(el.hasAttribute("type")).toBe(false);
  });

  it("a real button is still a real button, and still takes the native attribute", () => {
    const el = render(<Button disabled>Save</Button>);
    expect(el.tagName).toBe("BUTTON");
    expect(el.getAttribute("type")).toBe("button");
    expect((el as HTMLButtonElement).disabled).toBe(true);
  });

  it("consumes only role tokens — no numbered step reaches a rendered property", () => {
    // §13's contract from the component side: a Button never names --accent-9, so rebinding a
    // tone or switching appearance moves it without the component knowing anything changed.
    // The probe is the SOFT fill, not the solid: a hue-authored accent at full vividness
    // legitimately places the same solid in both modes (the generator finds the same cusp —
    // the blue family always did), so the solid stopped being evidence the day the accent
    // became hue-authored (2026-08-05). The soft tint differs by mode for every tone.
    const light = render(<Button tone="accent" emphasis="medium">L</Button>);
    const dark = mounted(
      <Button tone="accent" emphasis="medium">
        L
      </Button>,
      { theme: { appearance: "dark" } },
    );
    expect(computed(dark, "background-color")).not.toBe(
      computed(light, "background-color"),
    );
  });
});

describe("a control refuses outer spacing at the type level (non-negotiable, §3)", () => {
  // ENGINEERING §5 claims a type-level test pins that margin and position props do not exist
  // on control types. It did not exist: all sixteen @ts-expect-error sites were accounted for
  // elsewhere, and button.browser.test.tsx had none at all. The first non-negotiable —
  // "components never own outer spacing" — was guarded by nothing mechanical, and the lint
  // rule ENGINEERING promises for it is still a TODO. This is the guard until that lands.
  it("no margin, no position, no inset on Button or Card", () => {
    // @ts-expect-error — m is not a ButtonProp; <Box m> is the escape
    void (<Button m="4">S</Button>);
    // @ts-expect-error — mt is not a ButtonProp
    void (<Button mt="4">S</Button>);
    // @ts-expect-error — p is not a ButtonProp: padding is the size index's job
    void (<Button p="4">S</Button>);
    // @ts-expect-error — position is not a ButtonProp
    void (<Button position="absolute">S</Button>);
    // @ts-expect-error — top is not a ButtonProp
    void (<Button top="0">S</Button>);
    // @ts-expect-error — m is not a CardProp either
    void (<Card m="4">B</Card>);
    // @ts-expect-error — inset is not a CardProp
    void (<Card inset="0">B</Card>);
  });
});

describe("iconOnly is a square box with a required name (§4, decided 2026-08-04)", () => {
  it("squares the box at every size, and the glyph is the content", () => {
    for (const size of SIZES) {
      const el = render(
        <Button size={size} iconOnly aria-label="Search">
          <svg />
        </Button>,
      );
      const box = el.getBoundingClientRect();
      expect(Math.abs(box.width - box.height), `size ${size} is not square`).toBeLessThanOrEqual(1);
      expect(computed(el, "padding-left")).toBe("0px");
    }
  });

  it("a labelled icon button compiles; an unlabelled one does not", () => {
    // The whole reason the prop exists rather than being inferred. An icon-only control has no
    // visible text, so with no accessible name a screen reader announces "button" and nothing
    // else. A separate IconButton component was v1's answer and was simply forgotten at the
    // call site; a type error cannot be forgotten.
    void (
      <Button iconOnly aria-label="Search">
        <svg />
      </Button>
    );
    void (
      <Button iconOnly aria-labelledby="lbl">
        <svg />
      </Button>
    );
    // @ts-expect-error — iconOnly without an accessible name
    void (<Button iconOnly><svg /></Button>);
  });

  it("hosted in a field, it takes the CONTAINER's height and stays square", () => {
    const field = render(
      <TextFieldForButtonTest
        trailing={
          <Button iconOnly aria-label="Clear">
            <svg />
          </Button>
        }
      />,
    );
    const button = field.querySelector<HTMLElement>(".kui-button")!;
    const box = button.getBoundingClientRect();
    expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(1);
    expect(box.height).toBeLessThan(field.getBoundingClientRect().height);
  });
});

describe("the invalid remap's DIRECT arm — the control that IS the element (§8)", () => {
  // The shared rule has two arms: the element carrying the state, and `:has()` for wrappers.
  // Both of TextField's laws exercised the second one — `aria-invalid` on a field is spread
  // onto the input, so the wrapper matched through `:has()` and the spelling the law was named
  // for was never on the element the direct arm selects. Nothing tested the first arm at all.
  // A Button is that case: it is the element and the box at once, and every control that can
  // be wrong wears this remap, which is why it lives in the shared layer.
  it("aria-invalid re-tones a bordered button's edge and its ring", () => {
    const plain = render(<Button bordered>Save</Button>);
    const invalid = render(
      <Button bordered aria-invalid="true">
        Save
      </Button>,
    );
    expect(invalid.matches('[aria-invalid="true"]')).toBe(true); // the direct arm, not :has()
    expect(computed(invalid, "border-top-color")).toBe(tokenOn(invalid, "--invalid-edge"));
    expect(computed(invalid, "border-top-color")).not.toBe(computed(plain, "border-top-color"));
    // The ring reads the same edge — a state, not a tone (§8, reversed 2026-08-04).
    expect(tokenOn(invalid, "--focus-ring")).toBe(tokenOn(invalid, "--invalid-edge"));
    expect(tokenOn(invalid, "--focus-ring")).not.toBe(tokenOn(plain, "--focus-ring"));
  });

  it("data-invalid is the same arm — what Base UI writes on a control inside a Field.Root", () => {
    const el = render(<Button bordered>Save</Button>);
    const valid = computed(el, "border-top-color");
    el.setAttribute("data-invalid", "");
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--invalid-edge"));
    el.removeAttribute("data-invalid");
    expect(computed(el, "border-top-color")).toBe(valid);
  });
});

describe("a bare pill edge pads wider, per side (§4, §6, decided 2026-08-05)", () => {
  // Padding is measured at the midline, where a pill is widest; the eye reads the gap at the
  // text's cap line, where the corner curve has already swung inward. So under radius="full"
  // a bare edge takes the designed pill padding — and ONLY a bare edge: a slot at that edge
  // (an icon, a hosted control) already stands between the text and the curve.
  const pill = (b: Element) => [computed(b, "padding-left"), computed(b, "padding-right")];

  it("a text-only pill pads wider on both sides; the correction does not exist at other levels", () => {
    const full = mounted(<Button size="2">Save</Button>, { theme: { radius: "full" } });
    expect(pill(full)).toEqual([
      `${density.default.pxPill[1]}px`,
      `${density.default.pxPill[1]}px`,
    ]);

    const medium = mounted(<Button size="2">Save</Button>, { theme: { radius: "medium" } });
    expect(pill(medium)).toEqual([`${density.default.px[1]}px`, `${density.default.px[1]}px`]);
  });

  it("a slotted edge keeps the plain padding; the bare edge opposite still compensates", () => {
    const leading = mounted(
      <Button size="2" leading={<svg />}>
        Save
      </Button>,
      { theme: { radius: "full" } },
    );
    expect(pill(leading)).toEqual([
      `${density.default.px[1]}px`,
      `${density.default.pxPill[1]}px`,
    ]);

    const trailing = mounted(
      <Button size="2" trailing={<svg />}>
        Save
      </Button>,
      { theme: { radius: "full" } },
    );
    expect(pill(trailing)).toEqual([
      `${density.default.pxPill[1]}px`,
      `${density.default.px[1]}px`,
    ]);
  });

  it("follows the pointer and density worlds — the full cells are raw, so every cell must exist", () => {
    // Unlike the control radii there is no palette indirection carrying `full` into a pointer
    // world: a missing cell would silently fall back to the fine value under coarse.
    const touch = mounted(<Button size="2">Save</Button>, {
      theme: { pointer: "coarse", radius: "full" },
    });
    expect(computed(touch, "padding-left")).toBe(`${coarse.default.pxPill[1]}px`);

    const compact = mounted(<Button size="3">Save</Button>, {
      theme: { density: "compact", radius: "full" },
    });
    expect(computed(compact, "padding-left")).toBe(`${density.compact.pxPill[2]}px`);
  });

  it("iconOnly stays square: the pill padding never reaches it", () => {
    const el = mounted(
      <Button iconOnly aria-label="Search">
        <svg />
      </Button>,
      { theme: { radius: "full" } },
    );
    expect(computed(el, "padding-left")).toBe("0px");
    const box = el.getBoundingClientRect();
    expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(1);
  });
});

/* ── Motion: the press travels and the paint does not (§8, 2026-08-09) ─────────────────── */

describe("the press travels, and its colour does not wait (§8)", () => {
  it("held, the button sinks and shrinks", () => {
    const el = mounted(<Button>Press</Button>, { theme: {} });
    inMotion();
    // A resting button states the identity, which is what gives the press somewhere to travel
    // FROM: without it the first press interpolates out of `none` and the spring has no start.
    expect(computed(el, "translate")).toBe("0px");
    expect(computed(el, "scale")).toBe("1");
    // `:active` cannot be forced from script, so the pressed values are read where the
    // stylesheet keeps them — resolved on this element, in this cascade.
    const travel = parseFloat(probeIn(el, (p) => (p.style.width = "var(--press-travel)"), (cs) => cs.width));
    const shrink = Number(getComputedStyle(el).getPropertyValue("--press-scale"));
    expect(travel, "a button with nowhere to go is not pressed").toBeGreaterThan(0);
    // Down AND smaller: only-down reads as sliding, only-smaller reads as receding.
    expect(shrink).toBeLessThan(1);
    expect(shrink).toBeGreaterThan(0.9);
  });

  it("the two clocks: colour eases, the box springs", () => {
    const el = mounted(<Button>Press</Button>, { theme: {} });
    inMotion();
    const listed = computed(el, "transition-property").split(",").map((p) => p.trim());
    const easings = computed(el, "transition-timing-function").split(/,(?![^(]*\))/);
    const durations = computed(el, "transition-duration").split(",").map((d) => d.trim());
    for (const paint of ["background-color", "border-color", "color"]) {
      const at = listed.indexOf(paint);
      expect(at, `${paint} must have a clock`).toBeGreaterThan(-1);
      expect(easings[at], `${paint} is a signal`).not.toContain("linear(");
    }
    for (const geometry of ["translate", "scale"]) {
      const at = listed.indexOf(geometry);
      expect(at, `${geometry} must have a clock`).toBeGreaterThan(-1);
      expect(easings[at], `${geometry} has mass`).toContain("linear(");
    }
    // And the paint's clock is ONE variable, so hover can shorten it and press can zero it
    // without any rule restating which properties are paint.
    expect(new Set(durations.slice(0, 3)).size, "the paint channels share a clock").toBe(1);
  });

  it("it RISES to meet the pointer, and the rise is not the press's clock (§8)", () => {
    const el = mounted(<Button>Press</Button>, { theme: {} });
    inMotion();
    const raw = (name: string) => getComputedStyle(el).getPropertyValue(name);
    // Up on hover, down on press: a button that only ever sinks has no resting relationship
    // with the pointer, which is what separated the judged Key button from the first cut.
    expect(parseFloat(probeIn(el, (p) => (p.style.width = "var(--hover-travel)"), (cs) => cs.width))).toBeGreaterThan(0);
    // The rise is long and lively, the press short and stiff — one clock for both flattens
    // the strike and the recovery into the same gesture.
    expect(parseFloat(raw("--motion-rise"))).toBeGreaterThan(parseFloat(raw("--motion-press")));
    // The hook is read RESOLVED, not as the name it was written with — a custom property
    // computes to its substituted value, which is the thing that has to be right.
    expect(raw("--kui-ct-move").trim(), "at rest the geometry recovers, it does not strike").toBe(
      raw("--motion-rise").trim(),
    );
    expect(raw("--kui-ct-move-ease").trim()).toBe(raw("--motion-spring-lively").trim());
    // And the lively curve is a real spring that crosses its target exactly once — more life
    // than calm, never a ring (§8: damping is the one number never loosened).
    const lively = raw("--motion-spring-lively").trim();
    const samples = lively
      .slice(lively.indexOf("(") + 1, lively.lastIndexOf(")"))
      .split(",")
      .map((stop) => Number(stop.trim().split(/\s+/)[0]));
    // Measured as an AMPLITUDE, not as a crossing count. Lively does return under its target
    // after the peak — by about 1% — and counting crossings would call that a ring when what
    // makes a ring read mechanical is a second excursion the eye can SEE. Over this curve's
    // real travel (a one-pixel hover rise) 1% is a hundredth of a pixel. So the law bounds the
    // rebound instead: overshoot enough to have life, come back close enough to have none.
    const peak = samples.indexOf(Math.max(...samples));
    const rebound = Math.min(...samples.slice(peak));
    expect(Math.max(...samples), "lively must overshoot — that is its whole job").toBeGreaterThan(1.05);
    expect(Math.max(...samples), "and never wildly").toBeLessThan(1.2);
    expect(rebound, `a visible second excursion is a ring: ${rebound}`).toBeGreaterThan(0.98);
  });

  it("under a real pointer it actually rises (§8)", async () => {
    // Deliberately NOT `inMotion()`: the rise takes 550ms, so reading it the instant the
    // pointer lands returns the animated value — about zero. This law asks WHETHER it rises,
    // which is a question about the resting relationship, not about the clock. (Third time
    // this trap has been walked into in one session, twice by me.)
    const el = mounted(<Button>Press</Button>, { theme: {} });
    const { userEvent } = await import("vitest/browser");
    expect(computed(el, "translate"), "at rest it sits on the page").toBe("0px");
    // A REAL hover, not a stamped attribute: `:hover` is the one interaction state this
    // harness can genuinely produce, and every other law here reads a declaration. The
    // sabotage that removed the rise walked past all of them.
    await userEvent.hover(el);
    expect(el.matches(":hover"), "the harness must really be hovering").toBe(true);
    const [, y] = computed(el, "translate").split(" ");
    expect(parseFloat(y ?? "0"), "it must rise toward the pointer, not sink").toBeLessThan(0);
  });

  it("hover warms faster than it cools (§8)", () => {
    const el = mounted(<Button>Press</Button>, { theme: {} });
    inMotion();
    // Read raw: `tokenOn` resolves through a width probe and answers `0px` for a duration.
    const raw = (name: string) => parseFloat(getComputedStyle(el).getPropertyValue(name));
    const cool = raw("--motion-hover-out");
    const warm = raw("--motion-hover-in");
    expect(warm, "arriving is something the user did").toBeLessThan(cool);
    expect(computed(el, "transition-duration").startsWith(`${cool / 1000}s`)).toBe(true);
  });

  it("the ring LANDS on a button and never on a text input (§8)", () => {
    const el = mounted(<Button>Press</Button>, { theme: {} });
    inMotion();
    el.focus();
    expect(el.matches(":focus-visible"), "a focused button is keyboard-focused").toBe(true);
    expect(computed(el, "animation-name")).toBe("kui-ring-land");
    // The landing answers "where did focus go", which only a keyboard move asks. Browsers
    // match `:focus-visible` on a text input even for a click, so those are named out — the
    // rule that earned it: when the viewer already knows, the change is instant.
    const field = mounted(<input className="kui-control" />, { theme: {} });
    inMotion();
    field.focus();
    expect(computed(field, "animation-name")).toBe("none");
  });
});
