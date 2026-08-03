/**
 * Card's laws, mounted (§10, §11, LOG 2026-08-04): a shell — one treatment, no variants,
 * no anatomy. There is no card.css to test; what is asserted is that the shell's fixed
 * identity resolves through the shared surface layer and that the API refuses opinions.
 */
import { describe, expect, it } from "vitest";

import { Theme } from "../../theme/theme.tsx";
import { computed, render } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "./card.tsx";

/** Resolve a token the way a component does — through an element, not through the text. */
function tokenOn(el: Element, name: string): string {
  const probe = document.createElement("div");
  probe.style.color = `var(${name})`;
  el.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

function bgTokenOn(el: Element, name: string): string {
  const probe = document.createElement("div");
  probe.style.backgroundColor = `var(${name})`;
  el.append(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

describe("one treatment, fixed identity (§11, LOG 2026-08-04)", () => {
  it("is always the sealed bordered surface, and nothing casts a shadow", () => {
    const el = render(<Card>Body</Card>);
    expect(computed(el, "background-color")).toBe(bgTokenOn(el, "--color-surface"));
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--neutral-border"));
    expect(computed(el, "box-shadow")).toBe("none");
    expect(computed(el, "backdrop-filter")).toBe("none");
    expect(computed(el, "color")).toBe(tokenOn(el, "--color-text"));
  });

  it("exposes no visual opinion: tone and emphasis are not props", () => {
    // The identity attributes are constants the shell writes for the layer, not API. If this
    // ever fails, someone has re-grown a variant on the one component defined by not having
    // any — the type refusal is the law.
    // @ts-expect-error — tone is not a CardProp
    void (<Card tone="accent">B</Card>);
    // @ts-expect-error — emphasis is not a CardProp
    void (<Card emphasis="loud">B</Card>);
    // @ts-expect-error — bordered is not a CardProp
    void (<Card bordered={false}>B</Card>);
  });

  it("pads from the surface family by the size index, default 3 = 24px (§4)", () => {
    expect(computed(render(<Card>B</Card>), "padding-top")).toBe("24px");
    expect(computed(render(<Card size="1">B</Card>), "padding-top")).toBe("12px");
  });

  it("takes density: a compact app's cards lose air, a comfortable app's gain it (§12)", () => {
    // Density reaches the card through the layout-space layer (§3, §12; the per-family sets
    // that shipped the same morning were superseded by the layer the same day) — otherwise
    // a compact Theme adjusted every control while its cards kept default air.
    const compact = render(
      <Theme density="compact">
        <Card>B</Card>
      </Theme>,
    ).querySelector<HTMLElement>(".kui-card")!;
    expect(computed(compact, "padding-top")).toBe("16px");
    const comfortable = render(
      <Theme density="comfortable">
        <Card>B</Card>
      </Theme>,
    ).querySelector<HTMLElement>(".kui-card")!;
    expect(computed(comfortable, "padding-top")).toBe("32px");
  });
});

describe("the shell SEALS — translucency is material's job alone (§10, LOG 2026-08-04)", () => {
  it("the fill is opaque: a card over media is a surface, not a border on a photo", () => {
    const el = render(<Card>B</Card>);
    // No alpha channel in any spelling (rgb() or the P3 block's color()) — the seal. The
    // earlier alpha fill (--tone-a1) was material's job leaking into the default:
    // invisible over the page, broken over media.
    const fill = computed(el, "background-color");
    expect(fill).not.toContain("rgba");
    expect(fill).not.toContain("/");
  });

  it("nested cards separate by border — the alpha-nesting claim is retracted", () => {
    const outer = render(
      <Card>
        <Card data-testid="inner">B</Card>
      </Card>,
    );
    const inner = outer.querySelector<HTMLElement>('[data-testid="inner"]')!;
    expect(computed(inner, "background-color")).toBe(computed(outer, "background-color"));
    expect(computed(inner, "border-top-style")).toBe("solid");
  });
});

describe("material is backdrop defense, opt-in (§10)", () => {
  it("three thicknesses blur in order; the default never does", () => {
    const thin = render(<Card material="thin">B</Card>);
    const regular = render(<Card material="regular">B</Card>);
    const thick = render(<Card material="thick">B</Card>);
    expect(computed(thin, "backdrop-filter")).toContain("blur(5px)");
    expect(computed(regular, "backdrop-filter")).toContain("blur(16px)");
    expect(computed(thick, "backdrop-filter")).toContain("blur(32px)");
  });

  it("a material fill mixes over the page colour and stays translucent", () => {
    const thin = render(<Card material="thin">B</Card>);
    expect(computed(thin, "background-color")).toBe(bgTokenOn(thin, "--material-thin-fill"));
    expect(computed(thin, "background-color")).not.toMatch(/^rgb\(/);
  });
});

describe("the shell carries context without imposing any (§10, §13)", () => {
  it("a control inside keeps its own resolution", () => {
    const card = render(
      <Card>
        <Button>Act</Button>
      </Card>,
    );
    const inCard = card.querySelector("button")!;
    const alone = render(<Button>Act</Button>);
    expect(computed(inCard, "background-color")).toBe(computed(alone, "background-color"));
    expect(computed(inCard, "color")).toBe(computed(alone, "color"));
  });

  it("containment does not inherit: a button inside a bordered card stays borderless", () => {
    // [data-bordered] declares --kui-border-color on the card, and custom properties inherit
    // by default — every control inside every Card silently grew a border until the
    // @property guard (inherits: false) cut the leak. Loud buttons made it visible.
    const card = render(
      <Card>
        <Button tone="accent" emphasis="loud">
          Act
        </Button>
      </Card>,
    );
    const inCard = card.querySelector("button")!;
    expect(computed(inCard, "border-top-color")).toBe("rgba(0, 0, 0, 0)");
    // And a bordered control inside still gets its own border — the guard kills only
    // the inheritance, never the attribute's own declaration.
    const bordered = render(
      <Card>
        <Button bordered>Act</Button>
      </Card>,
    );
    expect(computed(bordered.querySelector("button")!, "border-top-color")).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
  });

  it("the elevated world dresses the shell; flat stays shadowless; no Card API exists (§5, §10)", () => {
    const flat = render(<Card>B</Card>);
    expect(computed(flat, "box-shadow")).toBe("none");
    const elevated = render(
      <Theme surfaces="elevated">
        <Card>B</Card>
      </Theme>,
    );
    const el = elevated.querySelector<HTMLElement>(".kui-card")!;
    // Depth IS the palette: the elevated card wears exactly row 2 — one lighting model.
    const probe = document.createElement("div");
    probe.style.boxShadow = "var(--shadow-2)";
    el.append(probe);
    expect(computed(el, "box-shadow")).toBe(computed(probe, "box-shadow"));
    probe.remove();
    // Add depth, change nothing else: the border is identical to the flat world's, which
    // is what keeps the edge sharp and inside the contrast system.
    expect(computed(el, "border-top-color")).toBe(computed(flat, "border-top-color"));
    expect(computed(el, "border-top-width")).toBe("1px");
    // The shadow sits on the card element itself, so it follows the surface radius — the
    // whole reason this is a world and not a wrapper.
    // @ts-expect-error — shadow is not a Card prop; the world is the only path
    void (<Card shadow="2">B</Card>);
  });

  it("follows appearance: the same Card resolves differently under a dark Theme", () => {
    const light = render(<Card>B</Card>);
    const dark = render(
      <Theme appearance="dark">
        <Card>B</Card>
      </Theme>,
    );
    const darkCard = dark.querySelector<HTMLElement>(".kui-card")!;
    expect(computed(darkCard, "color")).not.toBe(computed(light, "color"));
    expect(computed(darkCard, "border-top-color")).not.toBe(computed(light, "border-top-color"));
  });
});

describe("the boundary (§3, §13)", () => {
  it("forwards the escapes and keeps its own classes", () => {
    const el = render(
      <Card className="mine" style={{ maxWidth: "300px" }} material="thin">
        B
      </Card>,
    );
    expect(el.className.split(" ").sort()).toEqual(["kui-card", "kui-surface", "mine"]);
    expect(computed(el, "max-width")).toBe("300px");
    expect(el.dataset.material).toBe("thin");
  });

  it("card-as-button: render a button and the surface notices (§10)", () => {
    let clicks = 0;
    const el = render(
      <Card render={<button type="button" onClick={() => (clicks += 1)} />}>Open</Card>,
    );
    const plain = render(<Card>Open</Card>);
    expect(el.tagName).toBe("BUTTON");
    // Rest is pixel-identical to a plain Card — a card is a card until you point at it.
    expect(computed(el, "background-color")).toBe(computed(plain, "background-color"));
    expect(computed(el, "border-top-color")).toBe(computed(plain, "border-top-color"));
    expect(computed(el, "cursor")).toBe("pointer");
    expect(computed(plain, "cursor")).toBe("auto");
    el.click();
    expect(clicks).toBe(1);
  });

  it("render composes: an article that is a card keeps the shell (§5)", () => {
    const el = render(
      <Card render={<article aria-label="post" />} size="2">
        B
      </Card>,
    );
    expect(el.tagName).toBe("ARTICLE");
    expect(el.getAttribute("aria-label")).toBe("post");
    expect(el.className).toContain("kui-surface");
    expect(computed(el, "padding-top")).toBe("16px");
  });
});
