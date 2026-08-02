/**
 * §2's additivity claim, asserted structurally rather than by byte count (ENGINEERING §6).
 *
 * "Component CSS is additive, not multiplicative" is the load-bearing size argument of the
 * whole project: total is O(components + rungs + sizes + tones), never their product. A byte
 * measurement cannot prove that — it only tells you today's number. What proves it is that a
 * component's own stylesheet names none of the axes, so adding Input or Select adds structure
 * and nothing else, and adding a tone or a rung touches one shared file.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { tones } from "../tokens/color-config.ts";

const here = dirname(fileURLToPath(import.meta.url));
const read = (p: string) => readFileSync(join(here, p), "utf8");

const recipes = read("./recipes.css");
const button = read("../components/button/button.css");
const TONE_NAMES = Object.keys(tones);
const RUNGS = ["loud", "medium", "quiet"];

describe("a component's own CSS names no axis (§2, §9)", () => {
  it("button.css contains no tone, no rung, and no size index", () => {
    for (const name of [...TONE_NAMES, ...RUNGS]) expect(button).not.toContain(name);
    expect(button).not.toMatch(/data-size/);
    // If this ever fails, the recipe layer has stopped absorbing variation and the cost has
    // quietly become multiplicative — which is the moment to fix the layer, not the component.
  });

  it("button.css names no colour token at all — appearance is resolved output (§7)", () => {
    expect(button).not.toMatch(/--(accent|neutral|destructive|tone)-/);
  });
});

describe("the shared layer carries the variation, once (§2)", () => {
  it("every rung is defined exactly once, for every component that will ever exist", () => {
    for (const rung of RUNGS) {
      const occurrences = recipes.match(new RegExp(`\\[data-emphasis="${rung}"\\]`, "g")) ?? [];
      expect(occurrences).toHaveLength(1);
    }
  });

  it("the rungs name roles, never a tone — one recipe serves all three families", () => {
    for (const name of TONE_NAMES) {
      expect(recipes).not.toContain(`--${name}-solid`);
      expect(recipes).not.toContain(`--${name}-soft`);
    }
    expect(recipes).toContain("--tone-solid");
    expect(recipes).toContain("--tone-soft");
  });

  it("the size join is one block per index, not one per component", () => {
    for (const size of ["1", "2", "3", "4"]) {
      const occurrences = recipes.match(new RegExp(`\\[data-size="${size}"\\]`, "g")) ?? [];
      expect(occurrences).toHaveLength(1);
    }
  });

  it("no rule multiplies an axis by another", () => {
    // The failure this forbids by name: `[data-emphasis="loud"][data-tone="accent"]`, which is
    // where a system starts paying O(rungs x tones) and never stops.
    expect(recipes).not.toMatch(/\[data-emphasis="[a-z]+"\]\[data-tone=/);
    expect(recipes).not.toMatch(/\[data-tone="[a-z]+"\]\[data-emphasis=/);
    expect(recipes).not.toMatch(/\[data-size="\d"\]\[data-(emphasis|tone)=/);
  });
});

describe("nothing ships a stylesheet the tests cannot see", () => {
  it("the browser scaffolding installs exactly what the entry point imports", () => {
    // A hand-kept second list of stylesheets is a silent-failure machine: the preview page had
    // one and rendered Button as bare native buttons, and the browser suite had one and asserted
    // Button's laws against an empty cascade. The preview now links the entry point directly;
    // the suite cannot, because `?raw` on index.css yields its @import lines rather than their
    // contents — so its list is pinned here instead.
    const entry = read("../styles/index.css");
    const scaffold = read("../test/browser.tsx");
    const imported = [...entry.matchAll(/@import "([^"]+)"/g)].map((m) => m[1]!);
    expect(imported.length).toBeGreaterThan(1);
    for (const path of imported) {
      const file = path.split("/").pop()!;
      expect(scaffold).toContain(`${file}?raw`);
    }
  });
});

describe("interaction is stylesheet work, checkably (ENGINEERING §1.5)", () => {
  it("states are declared as selectors, so no JS runs at interaction time", () => {
    for (const state of [":hover", ":active", ":focus-visible", "[data-disabled]"]) {
      expect(recipes).toContain(state);
    }
  });

  it("every :hover rule is guarded by (hover: hover) — and :active never is", () => {
    // A touch device synthesises :hover on tap and keeps it until you tap elsewhere, so an
    // unguarded hover rule leaves a pressed control stuck in its hover fill. Structural rather
    // than mounted, because the browser project cannot change a media feature mid-run: what is
    // asserted is that no :hover declaration exists outside the guard.
    // Comments are stripped first: the prose explaining the guard naturally mentions :hover,
    // and a law that a comment can satisfy is not a law.
    const code = recipes.replace(/\/\*[\s\S]*?\*\//g, "");
    const guardStart = code.indexOf("@media (hover: hover)");
    expect(guardStart).toBeGreaterThan(-1);
    const guardEnd = code.indexOf("\n}", code.indexOf("}", guardStart));
    const outside = code.slice(0, guardStart) + code.slice(guardEnd + 2);
    expect(outside).not.toContain(":hover");
    // Press is the only feedback a touch device gets; guarding it would remove it entirely.
    expect(outside).toContain(":active");
  });

  it("no transition ships until the motion system is designed (§8, 2026-08-03)", () => {
    // Every state change is instant on both pointer worlds. When motion lands, this law is
    // replaced by the motion system's own — and press must stay instant: an eased press
    // loses the race against a ~60ms tap and the control reads as dead on a phone.
    const code = recipes.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(code).not.toContain("transition");
  });

  it("disabled remaps the family and never reaches for opacity (§8)", () => {
    const block = recipes.slice(recipes.indexOf(".kui-control[data-disabled]"));
    const body = block.slice(0, block.indexOf("}"));
    expect(body).toContain("--tone-label");
    expect(body).not.toContain("opacity");
  });
});
