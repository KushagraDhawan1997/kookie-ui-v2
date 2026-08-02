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
    expect(tokenOn(el, "--kui-fill-hover")).toBe(tokenOn(el, "--tone-soft-hover"));
    expect(tokenOn(el, "--kui-fill-active")).toBe(tokenOn(el, "--tone-soft-active"));
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

describe("loading keeps the label, which is the whole rule (§8)", () => {
  it("announces busy, blocks interaction, and never hides the text", () => {
    const el = render(<Button loading>Save</Button>);
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(computed(el, "pointer-events")).toBe("none");
    expect(el.textContent).toBe("Save");
    expect(el.querySelector(".kui-spinner")).not.toBeNull();
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
    expect(idle.querySelectorAll("svg").length).toBe(1);
    expect(busy.querySelectorAll("svg").length).toBe(0);
    expect(computed(busy, "width")).toBe(computed(idle, "width"));

    const spinner = busy.querySelector(".kui-spinner")!;
    const icon = idle.querySelector("svg")!;
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
    expect(computed(spinner, "border-top-color")).toBe(computed(el, "color"));
  });

  it("loading is not disabled — the control still looks like the thing you pressed", () => {
    const loading = render(<Button loading>Save</Button>);
    const idle = render(<Button>Save</Button>);
    expect(computed(loading, "background-color")).toBe(computed(idle, "background-color"));
    expect(loading.hasAttribute("data-disabled")).toBe(false);
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
