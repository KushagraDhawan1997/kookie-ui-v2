/**
 * The surface layer's laws (§10), same shape as recipes.test.ts one level up: the axes are
 * carried once by the shared file, no rule pairs one axis with another, and the component
 * that fronts it adds nothing — Card ships no stylesheet at all, which is the additivity
 * claim (§2) at its limit. Parsing comes from test/stylesheets.ts: block()/from() are loud
 * on a missing selector, so a renamed rule fails these laws instead of blinding them.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { GLASS_MATERIALS, RUNGS } from "./axes.ts";

import { tones } from "../tokens/color-config.ts";
import { block, from, raw, sheet } from "../test/stylesheets.ts";

const here = dirname(fileURLToPath(import.meta.url));
const surfaces = sheet("system/surfaces.css");

const TONE_NAMES = Object.keys(tones);

describe("Card owns no CSS at all (§2, §10)", () => {
  it("has no stylesheet — the surface layer is the whole of what a Card looks like", () => {
    expect(existsSync(join(here, "../components/card/card.css"))).toBe(false);
  });
});

describe("the surface layer carries each axis once and never multiplies them (§2, §10)", () => {
  it("every rung and material is defined exactly once, for every surface ever", () => {
    for (const [axis, values] of [
      ["data-emphasis", RUNGS],
      ["data-material", GLASS_MATERIALS],
    ] as const) {
      for (const value of values) {
        const occurrences = surfaces.match(new RegExp(`\\[${axis}="${value}"\\]`, "g")) ?? [];
        // Material legitimately appears three times: fallback base, real recipe under
        // @supports, reduced-transparency override — three environments, not three designs.
        // Quiet appears twice since the look axis (§19): its fill and its edge are the two
        // channels the axis dresses, and the edge needs its own rule to route around
        // [data-bordered] (which also serves Button's rank border).
        expect(occurrences.length).toBe(
          axis === "data-material" ? 3 : value === "quiet" ? 2 : 1,
        );
      }
    }
  });

  it("no rule pairs one axis with another", () => {
    expect(surfaces).not.toMatch(/\[data-(emphasis|material|tone|size)="[a-z0-9]+"\]\[data-(emphasis|material|tone|size)=/);
  });

  it("rungs name roles, never a tone family", () => {
    for (const name of TONE_NAMES) expect(surfaces).not.toContain(`--${name}-`);
    expect(surfaces).toContain("--tone-a3");
    expect(surfaces).toContain("--tone-solid");
  });

  it("the default surface seals — alpha belongs to the tone-forward rungs and material", () => {
    // One hop longer since the look axis (§19): quiet reads the look role, and outlined —
    // the default — maps the role to the seal. Both hops asserted, so the identity claim
    // ("the default look is exactly the old chrome") is checked end-to-end, not assumed.
    expect(block(surfaces, '[data-emphasis="quiet"]')).toContain(
      "--kui-sf-fill-src: var(--look-surface-fill)",
    );
    expect(block(raw("tokens/tokens.css"), '[data-look="outlined"]')).toContain(
      "--look-surface-fill: var(--color-surface)",
    );
    expect(surfaces).not.toContain("--tone-a1");
  });
});

describe("no elevation axis; the elevated WORLD is the one sanctioned shadow (§5, §10)", () => {
  it("exactly one box-shadow exists, inside the Theme world scope, reading row 2", () => {
    // The elevation axis stays deleted — nothing chooses shadow at a call site. What exists
    // is an app identity: Theme surfaces="elevated" dresses every surface with one rule, on
    // the element that owns the radius. Flat remains the default and byte-identical to a
    // world where the rule does not exist.
    expect(surfaces).not.toContain("data-elevation");
    const occurrences = surfaces.match(/box-shadow/g) ?? [];
    expect(occurrences).toHaveLength(1);
    // The world scopes declare; .kui-surface paints. Routing it through a custom property is
    // what lets `flat` escape an elevated ancestor — a descendant selector had no reset, so a
    // nested flat Theme matched nothing and the outer rule still reached the inner cards.
    const body = block(surfaces, '[data-surfaces="elevated"]');
    expect(body).toContain("--kui-surface-chrome: var(--surface-chrome)");
    expect(block(surfaces, '[data-surfaces="flat"]')).toContain("--kui-surface-chrome: none");
    // The world's light reaches controls too (§5 amended 2026-08-07): the control cast and
    // catch are declared in the SAME scopes, and flat stands both down — the escape logic
    // above holds for controls by the same mechanism, or not at all.
    expect(body).toContain("--kui-control-chrome: var(--control-chrome)");
    expect(body).toContain("--kui-control-light: var(--control-light)");
    const flat = block(surfaces, '[data-surfaces="flat"]');
    expect(flat).toContain("--kui-control-chrome: none");
    expect(flat).toContain("--kui-control-light: none");
    // Add depth, change nothing else: the edge stays --tone-border, so it keeps its
    // sharpness and contrast="high" reaches it through the tone system. Two dead ends are
    // pinned here: no ring (two lines) and no raw-alpha border (soft, contrast-blind).
    expect(body).not.toContain("border-color");
  });
});

describe("material resolves through tokens only (§10)", () => {
  it("backdrop-filter exists only inside @supports, with the near-sealed fallback outside it", () => {
    const guardStart = surfaces.indexOf("@supports (backdrop-filter");
    expect(guardStart).toBeGreaterThan(-1);
    const before = surfaces.slice(0, guardStart);
    expect(before).not.toContain("backdrop-filter:");
    expect(before).toContain("--material-opaque-alpha");
  });

  it("prefers-reduced-transparency forces the near-seal and kills the blur (§10)", () => {
    const media = from(surfaces, "@media (prefers-reduced-transparency: reduce)");
    expect(media).toContain("--material-opaque-alpha");
    expect(media).toContain("backdrop-filter: none");
    // Cascade order is the mechanism: the accessibility override must come AFTER the recipe.
    expect(surfaces.indexOf("@media (prefers-reduced-transparency")).toBeGreaterThan(
      surfaces.indexOf("@supports (backdrop-filter"),
    );
  });
});

describe("card-as-button: the element brings the interactivity (§10)", () => {
  it("the interactive block keys on element semantics, never on a prop", () => {
    expect(surfaces).toContain(":where(button, a)");
    expect(surfaces).not.toContain("data-interactive");
  });

  it("hover is guarded by (hover: hover); press is not, and reads the surface steps", () => {
    const guardStart = surfaces.indexOf("@media (hover: hover)");
    expect(guardStart).toBeGreaterThan(-1);
    const guardEnd = surfaces.indexOf("\n}", surfaces.indexOf("}", guardStart));
    const outside = surfaces.slice(0, guardStart) + surfaces.slice(guardEnd + 2);
    expect(outside).not.toContain(":hover");
    expect(outside).toContain(":active");
    // The interactive steps route through the look roles since §19 (outlined maps them to
    // --color-surface-hover/-active in tokens.css, asserted in the seal law above).
    expect(surfaces).toContain("--look-surface-fill-hover");
    expect(surfaces).toContain("--look-surface-fill-active");
  });
});

describe("the shadow palette is a resource, not an axis (§13)", () => {
  const tokens = raw("tokens/tokens.css");

  it("five rows, once per appearance scope, and row 1 is the only inset", () => {
    // Three scopes, not two: :root carries the un-themed document, [data-appearance="light"]
    // is the escape a nested light Theme needs (added 2026-08-03 — light lived only at :root,
    // so a light section inside a dark app stayed dark), and [data-appearance="dark"] is the
    // dark world. The count is per scope, not per mode. Five rows since 2026-08-07: row 2 is
    // the control drop (the palette had no rung at button scale, and a bespoke shadow hidden
    // inside a chrome role would have been a second source of shadow truth — Kushagra's
    // refutation, LOG), rows 3-5 are the old 2-4 renumbered.
    for (const i of [1, 2, 3, 4, 5]) {
      const occurrences = tokens.match(new RegExp(`--shadow-${i}:`, "g")) ?? [];
      expect(occurrences.length).toBe(3);
    }
    expect(tokens).not.toContain("--shadow-6");
    for (const line of tokens.split("\n").filter((l) => /--shadow-\d:/.test(l))) {
      expect(line.includes("inset")).toBe(line.includes("--shadow-1:"));
    }
  });

  it("every drop row is the contact-plus-ambient anatomy, one light source, depth by offset", () => {
    // The 2026-08-07 redesign in one law: a drop row is TWO layers — a contact line (small
    // offset, tight blur: what reads sharp) and an ambient halo (negative spread: what reads
    // raised) — and the ladder is ordered by height, so each row's ambient offset strictly
    // grows. x is 0 everywhere: the light source does not move sideways, in either mode.
    for (const scope of ['[data-appearance="light"]', '[data-appearance="dark"]']) {
      const body = block(tokens, scope);
      let prevOffset = 0;
      for (const i of [2, 3, 4, 5]) {
        const line = body.split("\n").find((l) => l.includes(`--shadow-${i}:`))!;
        const layers = line.slice(line.indexOf(":") + 1).split("), ");
        expect(layers.length, `row ${i} is two layers`).toBe(2);
        for (const layer of layers) expect(layer.trimStart().startsWith("0 ")).toBe(true);
        expect(layers[1]!).toMatch(/ -\d+(\.\d+)?px rgb/); // ambient pulls in: negative spread
        const ambientOffset = parseFloat(layers[1]!.trim().split(" ")[1]!);
        expect(ambientOffset, `row ${i} sits higher than row ${i - 1}`).toBeGreaterThan(prevOffset);
        prevOffset = ambientOffset;
      }
    }
  });

  it("the palette's only stylesheet consumers are the world chrome roles", () => {
    // Box's shadow prop died as a taxonomy leak (layout components do not paint); escapes
    // reach the palette through `style`. The elevated world consumes the palette THROUGH
    // its chrome roles — --surface-chrome composes var(--shadow-3), --control-chrome
    // var(--shadow-2) — so there is exactly one source of shadow truth and tuning a row
    // tunes every consumer of that height.
    expect(surfaces).not.toContain("--shadow-");
    expect(tokens).toContain("--surface-chrome: var(--shadow-3)");
    expect(tokens).toContain("--control-chrome: var(--shadow-2)");
    expect(tokens).toContain("inset 0 1px 0");
  });
});

describe("a surface sets foreground context (§10)", () => {
  it("the skeleton reads --color-text, and the tone-forward rungs re-scope it", () => {
    expect(surfaces).toContain("color: var(--color-text)");
    expect(block(surfaces, '[data-emphasis="medium"]')).toContain(
      "--color-text: var(--tone-text)",
    );
    expect(block(surfaces, '[data-emphasis="loud"]')).toContain(
      "--color-text: var(--tone-contrast)",
    );
  });
});
