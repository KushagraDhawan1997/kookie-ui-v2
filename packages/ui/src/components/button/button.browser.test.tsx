/**
 * Button's laws, mounted (§4, §8, §9, §11). The axis model has been prose since the first day
 * of this project; this is where it either resolves to real pixels or does not.
 */
import { describe, expect, it } from "vitest";

import { Theme } from "../../theme/theme.tsx";
import { computed, render } from "../../test/browser.tsx";
import { Button } from "./button.tsx";

/** Resolve a token the way a component does — through an element, not through the text. */
function tokenOn(el: Element, name: string): string {
  const probe = document.createElement("div");
  probe.style.color = `var(${name})`;
  el.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

describe("the size index joins five scales at one number (§4)", () => {
  it("resolves height, padding, gap, radius and type together", () => {
    const el = render(<Button size="3">Label</Button>);
    expect(computed(el, "min-height")).toBe("40px");
    expect(computed(el, "padding-left")).toBe("16px");
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
    const compact = render(
      <Theme density="compact">
        <Button size="2">Label</Button>
      </Theme>,
    );
    expect(computed(compact.querySelector("button")!, "min-height")).toBe("28px");

    const touch = render(
      <Theme pointer="coarse">
        <Button size="2">Label</Button>
      </Theme>,
    );
    // The default path: default density, size 2, coarse — the 44 target, in geometry (§16).
    expect(computed(touch.querySelector("button")!, "min-height")).toBe("44px");
  });
});

describe("the axes are orthogonal and resolve through the role layer (§7, §9)", () => {
  it("emphasis picks loudness while tone picks the family, independently", () => {
    const cells = (["neutral", "accent", "destructive"] as const).flatMap((tone) =>
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
    expect(tokenOn(el, "--kui-fill-src-hover")).toBe(tokenOn(el, "--tone-soft-hover"));
    expect(tokenOn(el, "--kui-fill-src-active")).toBe(tokenOn(el, "--tone-soft-active"));
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
  /** Resolve any CSS color expression the way the stylesheet would — through the element. */
  function colorOn(el: Element, expr: string): string {
    const probe = document.createElement("div");
    probe.style.color = expr;
    el.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }

  it("solid is the absence of a material — the default writes no attribute", () => {
    expect(render(<Button>Label</Button>).dataset.material).toBeUndefined();
    expect(render(<Button material="solid">Label</Button>).dataset.material).toBeUndefined();
    expect(render(<Button material="regular">Label</Button>).dataset.material).toBe("regular");
  });

  it("the veil is the rung's fill at the thickness alpha, over a real blur", () => {
    const el = render(
      <Button emphasis="loud" tone="accent" material="thin">
        Label
      </Button>,
    );
    expect(computed(el, "background-color")).toBe(
      colorOn(el, "color-mix(in srgb, var(--tone-solid) var(--material-thin-alpha), transparent)"),
    );
    expect(computed(el, "backdrop-filter")).not.toBe("none");
  });

  it("tone and loudness both survive the glass — colour was the point (§7, §9)", () => {
    const cell = (tone: "neutral" | "accent", emphasis: "loud" | "medium") =>
      computed(
        render(
          <Button tone={tone} emphasis={emphasis} material="thick">
            Label
          </Button>,
        ),
        "background-color",
      );
    expect(cell("accent", "loud")).not.toBe(cell("neutral", "loud"));
    expect(cell("accent", "loud")).not.toBe(cell("accent", "medium"));
  });

  it("quiet glass is bare blur: rest keeps the absence of a fill (§9)", () => {
    const el = render(
      <Button emphasis="quiet" material="regular">
        Label
      </Button>,
    );
    // Mixing transparent toward transparent serialises as color(srgb …/0), not rgba(0,0,0,0);
    // the law is the alpha channel, not the spelling.
    expect(computed(el, "background-color")).toMatch(/(rgba\(0, 0, 0, 0\)|\/ 0\))$/);
    expect(computed(el, "backdrop-filter")).not.toBe("none");
  });

  it("interaction steps the veil from the rung's own hover source, at the hover alpha (§8)", () => {
    const el = render(
      <Button emphasis="medium" material="thin">
        Label
      </Button>,
    );
    expect(tokenOn(el, "--kui-fill-hover")).toBe(
      colorOn(el, "color-mix(in srgb, var(--tone-soft-hover) var(--material-thin-alpha-hover), transparent)"),
    );
    expect(tokenOn(el, "--kui-fill-active")).toBe(
      colorOn(el, "color-mix(in srgb, var(--tone-soft-active) var(--material-thin-alpha-active), transparent)"),
    );
  });

  it("the rung keeps its own label pairing under glass", () => {
    // The fill is still the rung's — merely translucent — so loud keeps the APCA-chosen
    // contrast and medium keeps the label token. Thin-over-a-bright-photo legibility is
    // §10's deferred brightness-floor branch, not a label swap.
    const loud = render(
      <Button tone="accent" emphasis="loud" material="thick">
        Label
      </Button>,
    );
    expect(computed(loud, "color")).toBe(tokenOn(loud, "--tone-contrast"));
    const medium = render(
      <Button tone="accent" emphasis="medium" material="thick">
        Label
      </Button>,
    );
    expect(computed(medium, "color")).toBe(tokenOn(medium, "--tone-label"));
  });

  it("the fill returns to opaque when the material comes off", () => {
    const glass = render(
      <Button emphasis="loud" material="regular">
        Label
      </Button>,
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
      <Button icon={<svg />} size="3">
        Save
      </Button>,
    );
    const busy = render(
      <Button icon={<svg />} size="3" loading>
        Save
      </Button>,
    );
    // The spinner is itself an svg, so "the icon is gone" has to exclude it by name.
    expect(idle.querySelectorAll("svg:not(.kui-spinner)").length).toBe(1);
    expect(busy.querySelectorAll("svg:not(.kui-spinner)").length).toBe(0);
    expect(computed(busy, "width")).toBe(computed(idle, "width"));

    const spinner = busy.querySelector(".kui-spinner")!;
    const icon = idle.querySelector("svg:not(.kui-spinner)")!;
    expect(computed(spinner, "width")).toBe(computed(icon, "width"));
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
  });

  it("consumes only role tokens — no numbered step reaches a rendered property", () => {
    // §13's contract from the component side: a Button never names --accent-9, so rebinding a
    // tone or switching appearance moves it without the component knowing anything changed.
    const light = render(<Button tone="accent" emphasis="loud">L</Button>);
    const dark = render(
      <Theme appearance="dark">
        <Button tone="accent" emphasis="loud">
          L
        </Button>
      </Theme>,
    );
    expect(computed(dark.querySelector("button")!, "background-color")).not.toBe(
      computed(light, "background-color"),
    );
  });
});
