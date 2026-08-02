/**
 * The surface layer's laws (§10), same shape as recipes.test.ts one level up: the axes are
 * carried once by the shared file, no rule pairs one axis with another, and the component
 * that fronts it adds nothing — Card ships no stylesheet at all, which is the additivity
 * claim (§2) at its limit.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { tones } from "../tokens/color-config.ts";

const here = dirname(fileURLToPath(import.meta.url));
const surfaces = readFileSync(join(here, "./surfaces.css"), "utf8");
const stripped = surfaces.replace(/\/\*[\s\S]*?\*\//g, "");

const TONE_NAMES = Object.keys(tones);
const RUNGS = ["loud", "medium", "quiet"];
const MATERIALS = ["thin", "thick"];

describe("Card owns no CSS at all (§2, §10)", () => {
  it("has no stylesheet — the surface layer is the whole of what a Card looks like", () => {
    expect(existsSync(join(here, "../components/card/card.css"))).toBe(false);
  });
});

describe("the surface layer carries each axis once and never multiplies them (§2, §10)", () => {
  it("every rung and material is defined exactly once, for every surface ever", () => {
    for (const [axis, values] of [
      ["data-emphasis", RUNGS],
      ["data-material", MATERIALS],
    ] as const) {
      for (const value of values) {
        const occurrences = stripped.match(new RegExp(`\\[${axis}="${value}"\\]`, "g")) ?? [];
        // Material legitimately appears three times: fallback base, real recipe under
        // @supports, reduced-transparency override — three environments, not three designs.
        expect(occurrences.length).toBe(axis === "data-material" ? 3 : 1);
      }
    }
  });

  it("no rule pairs one axis with another", () => {
    expect(stripped).not.toMatch(/\[data-(emphasis|material|tone|size)="[a-z0-9]+"\]\[data-(emphasis|material|tone|size)=/);
  });

  it("rungs name roles, never a tone family", () => {
    for (const name of TONE_NAMES) expect(stripped).not.toContain(`--${name}-`);
    expect(stripped).toContain("--tone-a3");
    expect(stripped).toContain("--tone-solid");
  });

  it("the default surface seals — alpha belongs to the tone-forward rungs and material", () => {
    const quiet = stripped.slice(stripped.indexOf('[data-emphasis="quiet"]'));
    expect(quiet.slice(0, quiet.indexOf("}"))).toContain("--kui-sf-fill: var(--color-surface)");
    expect(stripped).not.toContain("--tone-a1");
  });
});

describe("no elevation, no shadows — separation is border and fill (§10, 2026-08-03)", () => {
  it("the surface layer names no shadow and no elevation, ever", () => {
    // Kushagra deleted the axis: nothing ever chose elevation at a call site — §11 fixes it
    // per component — and the ladder existed only to price shadows, which are a no-go.
    // Detachment is a per-component fact, designed when Popover and Dialog are built.
    expect(stripped).not.toContain("box-shadow");
    expect(stripped).not.toContain("--shadow-");
    expect(stripped).not.toContain("data-elevation");
  });
});

describe("material resolves through tokens only (§10)", () => {
  it("backdrop-filter exists only inside @supports, with the opaque fallback outside it", () => {
    const guardStart = stripped.indexOf("@supports (backdrop-filter");
    expect(guardStart).toBeGreaterThan(-1);
    const before = stripped.slice(0, guardStart);
    expect(before).not.toContain("backdrop-filter:");
    expect(before).toContain("--material-opaque-fill");
  });

  it("prefers-reduced-transparency forces opaque and kills the blur (§10)", () => {
    const media = stripped.slice(stripped.indexOf("@media (prefers-reduced-transparency: reduce)"));
    expect(media).toContain("--material-opaque-fill");
    expect(media).toContain("backdrop-filter: none");
    // Cascade order is the mechanism: the accessibility override must come AFTER the recipe.
    expect(stripped.indexOf("@media (prefers-reduced-transparency")).toBeGreaterThan(
      stripped.indexOf("@supports (backdrop-filter"),
    );
  });
});

describe("a surface sets foreground context (§10)", () => {
  it("the skeleton reads --color-text, and the tone-forward rungs re-scope it", () => {
    expect(stripped).toContain("color: var(--color-text)");
    const medium = stripped.slice(stripped.indexOf('[data-emphasis="medium"]'));
    expect(medium.slice(0, medium.indexOf("}"))).toContain("--color-text: var(--tone-text)");
    const loud = stripped.slice(stripped.indexOf('[data-emphasis="loud"]'));
    expect(loud.slice(0, loud.indexOf("}"))).toContain("--color-text: var(--tone-contrast)");
  });
});
