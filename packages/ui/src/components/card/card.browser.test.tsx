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
  it("is always the neutral quiet bordered surface, and nothing casts a shadow", () => {
    const el = render(<Card>Body</Card>);
    expect(computed(el, "background-color")).toBe(bgTokenOn(el, "--neutral-a1"));
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
});

describe("fills are alpha, so nesting differentiates by compositing (§10)", () => {
  it("the fill is translucent, never an opaque step", () => {
    const el = render(<Card>B</Card>);
    expect(computed(el, "background-color")).not.toMatch(/^rgb\(/);
  });

  it("a card in a card reads the same token and still composites distinctly", () => {
    const outer = render(
      <Card>
        <Card data-testid="inner">B</Card>
      </Card>,
    );
    const inner = outer.querySelector<HTMLElement>('[data-testid="inner"]')!;
    expect(computed(inner, "background-color")).toBe(computed(outer, "background-color"));
    // Same declared value, different rendered result: that is what compositing means, and
    // it is why the shell needs no per-level variants to nest.
  });
});

describe("material is backdrop defense, opt-in (§10)", () => {
  it("thin and thick blur; the default never does", () => {
    const thin = render(<Card material="thin">B</Card>);
    const thick = render(<Card material="thick">B</Card>);
    expect(computed(thin, "backdrop-filter")).toContain("blur(12px)");
    expect(computed(thick, "backdrop-filter")).toContain("blur(20px)");
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
