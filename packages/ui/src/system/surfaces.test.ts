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
const MATERIALS = ["thin", "regular", "thick"];

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
    expect(quiet.slice(0, quiet.indexOf("}"))).toContain("--kui-sf-fill-src: var(--color-surface)");
    expect(stripped).not.toContain("--tone-a1");
  });
});

describe("no elevation axis; the elevated WORLD is the one sanctioned shadow (§5, §10)", () => {
  it("exactly one box-shadow exists, inside the Theme world scope, reading row 2", () => {
    // The elevation axis stays deleted — nothing chooses shadow at a call site. What exists
    // is an app identity: Theme surfaces="elevated" dresses every surface with one rule, on
    // the element that owns the radius. Flat remains the default and byte-identical to a
    // world where the rule does not exist.
    expect(stripped).not.toContain("data-elevation");
    const occurrences = stripped.match(/box-shadow/g) ?? [];
    expect(occurrences).toHaveLength(1);
    const rule = stripped.slice(stripped.indexOf('[data-surfaces="elevated"]'));
    const body = rule.slice(0, rule.indexOf("}"));
    expect(body).toContain("box-shadow: var(--surface-chrome)");
    // Add depth, change nothing else: the edge stays --tone-border, so it keeps its
    // sharpness and contrast="high" reaches it through the tone system. Two dead ends are
    // pinned here: no ring (two lines) and no raw-alpha border (soft, contrast-blind).
    expect(body).not.toContain("border-color");
  });
});

describe("material resolves through tokens only (§10)", () => {
  it("backdrop-filter exists only inside @supports, with the near-sealed fallback outside it", () => {
    const guardStart = stripped.indexOf("@supports (backdrop-filter");
    expect(guardStart).toBeGreaterThan(-1);
    const before = stripped.slice(0, guardStart);
    expect(before).not.toContain("backdrop-filter:");
    expect(before).toContain("--material-opaque-alpha");
  });

  it("prefers-reduced-transparency forces the near-seal and kills the blur (§10)", () => {
    const media = stripped.slice(stripped.indexOf("@media (prefers-reduced-transparency: reduce)"));
    expect(media).toContain("--material-opaque-alpha");
    expect(media).toContain("backdrop-filter: none");
    // Cascade order is the mechanism: the accessibility override must come AFTER the recipe.
    expect(stripped.indexOf("@media (prefers-reduced-transparency")).toBeGreaterThan(
      stripped.indexOf("@supports (backdrop-filter"),
    );
  });
});

describe("card-as-button: the element brings the interactivity (§10)", () => {
  it("the interactive block keys on element semantics, never on a prop", () => {
    expect(stripped).toContain(":where(button, a)");
    expect(stripped).not.toContain("data-interactive");
  });

  it("hover is guarded by (hover: hover); press is not, and reads the surface steps", () => {
    const guardStart = stripped.indexOf("@media (hover: hover)");
    expect(guardStart).toBeGreaterThan(-1);
    const guardEnd = stripped.indexOf("\n}", stripped.indexOf("}", guardStart));
    const outside = stripped.slice(0, guardStart) + stripped.slice(guardEnd + 2);
    expect(outside).not.toContain(":hover");
    expect(outside).toContain(":active");
    expect(stripped).toContain("--color-surface-hover");
    expect(stripped).toContain("--color-surface-active");
  });
});

describe("the shadow palette is a resource, not an axis (§13)", () => {
  const tokens = readFileSync(join(here, "../tokens/tokens.css"), "utf8");

  it("four rows, once per appearance scope, and row 1 is the only inset", () => {
    // Three scopes, not two: :root carries the un-themed document, [data-appearance="light"]
    // is the escape a nested light Theme needs (added 2026-08-03 — light lived only at :root,
    // so a light section inside a dark app stayed dark), and [data-appearance="dark"] is the
    // dark world. The count is per scope, not per mode.
    for (const i of [1, 2, 3, 4]) {
      const occurrences = tokens.match(new RegExp(`--shadow-${i}:`, "g")) ?? [];
      expect(occurrences.length).toBe(3);
    }
    expect(tokens).not.toContain("--shadow-5");
    for (const line of tokens.split("\n").filter((l) => /--shadow-\d:/.test(l))) {
      expect(line.includes("inset")).toBe(line.includes("--shadow-1:"));
    }
  });

  it("the palette's only stylesheet consumer is the elevated world rule", () => {
    // Box's shadow prop died as a taxonomy leak (layout components do not paint); escapes
    // reach the palette through `style`. The elevated world consumes the palette THROUGH
    // --surface-chrome (which composes var(--shadow-2) in tokens.css): shadow = elevation,
    // one lighting model, row 2 the single source of truth for elevated depth.
    expect(stripped).not.toContain("--shadow-");
    expect(tokens).toContain("--surface-chrome: var(--shadow-2)");
    expect(tokens).toContain("inset 0 1px 0");
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
