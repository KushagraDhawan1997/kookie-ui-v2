/**
 * Card's laws, mounted (§10, §11): the first surface, and the first component whose entire
 * appearance is shared CSS — there is no card.css to test, only whether the axes resolve.
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

describe("the canonical surface (§11): quiet + bordered, solid — flat, like everything", () => {
  it("defaults resolve without a single prop, and nothing casts a shadow", () => {
    const el = render(<Card>Body</Card>);
    expect(el.dataset.emphasis).toBe("quiet");
    expect(el.dataset.bordered).toBe("true");
    expect(el.dataset.material).toBeUndefined();
    expect(computed(el, "background-color")).toBe(bgTokenOn(el, "--tone-a1"));
    expect(computed(el, "border-top-color")).toBe(tokenOn(el, "--tone-border"));
    // No elevation exists (2026-08-03): separation is border and fill, never a shadow.
    expect(computed(el, "box-shadow")).toBe("none");
    expect(computed(el, "backdrop-filter")).toBe("none");
  });

  it("pads from the surface family by the size index, default 3 = 24px (§4)", () => {
    expect(computed(render(<Card>B</Card>), "padding-top")).toBe("24px");
    expect(computed(render(<Card size="1">B</Card>), "padding-top")).toBe("12px");
  });
});

describe("fills are alpha, so nesting differentiates by compositing (§10)", () => {
  it("a quiet fill is translucent — never an opaque step", () => {
    const el = render(<Card>B</Card>);
    const fill = computed(el, "background-color");
    // An rgba/color() with alpha < 1: compositing is what makes card-in-panel-in-page work.
    expect(fill).not.toMatch(/^rgb\(/);
    expect(fill).toBe(bgTokenOn(el, "--tone-a1"));
  });

  it("a nested card reads the same alpha token and still composites distinctly", () => {
    const outer = render(
      <Card emphasis="medium" tone="accent">
        <Card data-testid="inner">B</Card>
      </Card>,
    );
    const inner = outer.querySelector<HTMLElement>('[data-testid="inner"]')!;
    expect(computed(inner, "background-color")).toBe(bgTokenOn(inner, "--tone-a1"));
    expect(computed(inner, "background-color")).not.toBe(computed(outer, "background-color"));
  });
});

describe("material is backdrop defense, opt-in (§10)", () => {
  it("thin and thick blur; solid never does", () => {
    const thin = render(<Card material="thin">B</Card>);
    const thick = render(<Card material="thick">B</Card>);
    expect(computed(thin, "backdrop-filter")).toContain("blur(12px)");
    expect(computed(thick, "backdrop-filter")).toContain("blur(20px)");
    expect(computed(render(<Card>B</Card>), "backdrop-filter")).toBe("none");
  });

  it("a material fill mixes over the page colour and stays translucent", () => {
    const thin = render(<Card material="thin">B</Card>);
    expect(computed(thin, "background-color")).toBe(bgTokenOn(thin, "--material-thin-fill"));
    expect(computed(thin, "background-color")).not.toMatch(/^rgb\(/);
  });
});

describe("a surface sets foreground context (§10)", () => {
  it("quiet inherits the page's text; tone-forward rungs re-scope it", () => {
    const quiet = render(<Card>B</Card>);
    expect(computed(quiet, "color")).toBe(tokenOn(quiet, "--neutral-12"));

    const medium = render(
      <Card emphasis="medium" tone="destructive">
        B
      </Card>,
    );
    expect(computed(medium, "color")).toBe(tokenOn(medium, "--tone-text"));

    const loud = render(
      <Card emphasis="loud" tone="accent">
        B
      </Card>,
    );
    expect(computed(loud, "color")).toBe(tokenOn(loud, "--tone-contrast"));
  });

  it("a control inside a tone-forward surface keeps its own resolution", () => {
    // The surface re-scopes the FOREGROUND roles, never the tone indirection: a neutral
    // button on an accent card is still a neutral button (§9's orthogonality, nested).
    const card = render(
      <Card emphasis="medium" tone="accent">
        <Button>Act</Button>
      </Card>,
    );
    const inCard = card.querySelector("button")!;
    const alone = render(<Button>Act</Button>);
    expect(computed(inCard, "background-color")).toBe(computed(alone, "background-color"));
    expect(computed(inCard, "color")).toBe(computed(alone, "color"));
  });

  it("follows appearance: the same Card resolves differently under a dark Theme (§13)", () => {
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
  it("renders its axes as data attributes and forwards the escapes", () => {
    const el = render(
      <Card className="mine" style={{ maxWidth: "300px" }} material="thin">
        B
      </Card>,
    );
    expect(el.className.split(" ").sort()).toEqual(["kui-card", "kui-surface", "mine"]);
    expect(computed(el, "max-width")).toBe("300px");
    expect(el.dataset.material).toBe("thin");
  });

  it("render composes: an article that is a card keeps every axis (§5)", () => {
    const el = render(
      <Card render={<article aria-label="post" />} emphasis="medium">
        B
      </Card>,
    );
    expect(el.tagName).toBe("ARTICLE");
    expect(el.getAttribute("aria-label")).toBe("post");
    expect(el.dataset.emphasis).toBe("medium");
    expect(el.className).toContain("kui-surface");
  });
});
