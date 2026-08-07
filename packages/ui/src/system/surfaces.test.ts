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
  it("this layer paints one box-shadow, and the world scopes declare what it reads", () => {
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
    // Elevation meets the material at two seams (§10, 2026-08-07): the elevated scope hands
    // each thickness its transmitted cast and points the rim at the lifted glint; flat stands
    // the cast down (glass never floats in a flat world) and RESTS the rim rather than
    // removing it (a flat world's glass keeps edge and glint, and loses only the lift).
    //
    // BOTH ends are asserted, and that is the law (audit 2026-08-07). It used to read
    // `expect(flat).not.toContain("--material-${t}-rim:")` — pinning the bug as if it were the
    // design. The elevated scope re-declared the GENERATED name, which is a one-way door: flat
    // had nothing left to point at, so a nested flat Theme kept the brighter glint wherever
    // appearance was inherited and no scope re-declared the name at the element. The rim now
    // rides a --kui- pointer like every other value in these two blocks, and every axis in this
    // system escapes by each scope declaring its own value — so a scope that declares nothing
    // is the defect, never the design.
    for (const t of ["thin", "regular", "thick"]) {
      expect(body).toContain(`--kui-surface-chrome-${t}: var(--surface-chrome-${t})`);
      expect(body).toContain(`--kui-control-chrome-${t}: var(--control-chrome-${t})`);
      expect(body).toContain(`--kui-material-${t}-rim: var(--material-${t}-rim-lifted)`);
      expect(flat).toContain(`--kui-surface-chrome-${t}: none`);
      expect(flat).toContain(`--kui-control-chrome-${t}: none`);
      expect(flat).toContain(`--kui-material-${t}-rim: var(--material-${t}-rim)`);
      // The generated name is READ by these blocks and never re-declared by them: shadowing a
      // token the appearance scopes own is what made the value unrecoverable.
      expect(body).not.toContain(`\n  --material-${t}-rim:`);
      expect(flat).not.toContain(`\n  --material-${t}-rim:`);
    }
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

  /**
   * Every alpha in a shadow row, parsed INDEPENDENTLY of how the generator writes one.
   *
   * This exists because the first version of the law below rebuilt its expected value with
   * `fadeShadow`'s own `.replace(/\/ ([0-9.]+)\)/g, …)`, character for character (audit
   * 2026-08-07). That asks "did the generator run the function", never "does the function do
   * anything": respell a row as `rgba(0, 0, 0, 0.1)` or `rgb(0 0 0 / 10%)` — both valid CSS,
   * neither matched by that pattern — and the generator returns the row untouched, the law
   * computes the same untouched string, and they agree while every thickness silently casts
   * the full solid shadow.
   *
   * So this reads the colour functions and pulls the alpha out of each, handling the comma
   * form and the percentage form the generator does NOT handle. If a row is ever respelled
   * into one of them, this parser still finds the alphas, the arithmetic below no longer
   * matches, and the law fails — which is the entire point.
   */
  const alphasOf = (row: string): number[] =>
    (row.match(/rgba?\([^)]*\)/g) ?? []).map((fn) => {
      const inside = fn.slice(fn.indexOf("(") + 1, -1).trim();
      const raw = inside.includes("/")
        ? inside.slice(inside.lastIndexOf("/") + 1)
        : inside.split(",")[3];
      // No alpha channel written at all means fully opaque.
      if (raw === undefined) return 1;
      const n = parseFloat(raw);
      return raw.trim().endsWith("%") ? n / 100 : n;
    });

  const valueOf = (body: string, name: string): string => {
    const line = body.split("\n").find((l) => l.includes(`${name}:`));
    if (!line) throw new Error(`no declaration of ${name} in scope`);
    return line.slice(line.indexOf(":") + 1).trim().replace(/;$/, "");
  };

  it("a pane's cast is the surface row transmitted — actually fainter, and ordered (§10)", () => {
    // Glass passes light, so its shadow is the palette row with every layer's alpha scaled by
    // the thickness's transmission factor. Three things are asserted, and the first two are
    // the ones the copied-regex version could not make:
    //   1. the fade DID something — the derived row is not the row it came from;
    //   2. every alpha is the source alpha times the factor, checked by an independent parse;
    //   3. the ladder is ordered — thin passes least light through, thick most.
    for (const scope of ['[data-appearance="light"]', '[data-appearance="dark"]']) {
      const body = block(tokens, scope);
      // Both transmitted families, each from its own row: panes fade row 3, glass CONTROLS
      // (fields, buttons) fade row 2 — extended 2026-08-07 when the field family got the
      // pane parts the cards got.
      for (const [rowName, chrome] of [
        ["--shadow-3", "surface-chrome"],
        ["--shadow-2", "control-chrome"],
      ] as const) {
        const source = valueOf(body, rowName);
        const sourceAlphas = alphasOf(source);
        expect(sourceAlphas.length, `${rowName} has alphas to fade`).toBeGreaterThan(0);

        const perThickness: number[][] = [];
        for (const [t, factor] of [["thin", 0.35], ["regular", 0.55], ["thick", 0.75]] as const) {
          const derived = valueOf(body, `--${chrome}-${t}`);
          expect(derived, `${scope} ${chrome}-${t} is the unfaded row`).not.toBe(source);

          const got = alphasOf(derived);
          expect(got.length, `${chrome}-${t} kept every layer`).toBe(sourceAlphas.length);
          got.forEach((a, i) => {
            // ONE unit in the last decimal the generator emits — it rounds each product to
            // three places, and 0.11 x 0.35 lands on 0.0384999… in binary, so a half-step
            // tolerance fails on float representation rather than on anything real. Stated
            // and bounded rather than left to a loose `toBeCloseTo`: the smallest gap this
            // still has to tell apart is two adjacent thicknesses, 0.02 apart, which is
            // twenty times this window.
            expect(
              Math.abs(a - sourceAlphas[i]! * factor),
              `${scope} ${chrome}-${t} layer ${i}: ${a} is not ${sourceAlphas[i]} x ${factor}`,
            ).toBeLessThan(0.001);
          });
          // Geometry is the pane's, unchanged: only the alphas move.
          expect(derived.replace(/rgba?\([^)]*\)/g, "C")).toBe(source.replace(/rgba?\([^)]*\)/g, "C"));
          perThickness.push(got);
        }

        const [thin, regular, thick] = perThickness;
        thin!.forEach((_, i) => {
          expect(thin![i]!, `${scope} ${chrome} thin < regular`).toBeLessThan(regular![i]!);
          expect(regular![i]!, `${scope} ${chrome} regular < thick`).toBeLessThan(thick![i]!);
          expect(thick![i]!, `${scope} ${chrome} thick < solid`).toBeLessThan(sourceAlphas[i]!);
        });
      }
    }
  });

  it("the lifted rim outshines the resting rim, per thickness per mode, and high contrast empties both (§10)", () => {
    for (const scope of ['[data-appearance="light"]', '[data-appearance="dark"]']) {
      const body = block(tokens, scope);
      for (const t of ["thin", "regular", "thick"]) {
        const alpha = (name: string) => {
          const line = body.split("\n").find((l) => l.includes(`--material-${t}-${name}:`))!;
          return parseFloat(line.match(/255 \/ ([0-9.]+)\)/)![1]!);
        };
        expect(alpha("rim-lifted"), `${scope} ${t}`).toBeGreaterThan(alpha("rim"));
      }
    }
    // The elevated remap points -rim at -rim-lifted, so HC must empty the lifted variant
    // too or the setting would resurrect the glint it just removed.
    expect(tokens).toContain("--material-thin-rim-lifted: initial");
    expect(tokens).toContain("--material-regular-rim-lifted: initial");
    expect(tokens).toContain("--material-thick-rim-lifted: initial");
  });

  it("the palette's only stylesheet consumers are the world chrome roles", () => {
    // Box's shadow prop died as a taxonomy leak (layout components do not paint); escapes
    // reach the palette through `style`. The elevated world consumes the palette THROUGH
    // its chrome roles — --surface-chrome composes var(--shadow-3), --control-chrome
    // var(--shadow-2) — so there is exactly one source of shadow truth and tuning a row
    // tunes every consumer of that height.
    expect(surfaces).not.toContain("--shadow-");
    expect(tokens).toContain("--surface-chrome: var(--shadow-3)");
    // The control chrome composes row 2 plus the crisp inset rim, in BOTH modes (the light
    // rim landed 2026-08-07 — the top catch that reads as an edge is a line, not a wash).
    for (const line of tokens.split("\n").filter((l) => l.includes("--control-chrome:"))) {
      expect(line).toContain("var(--shadow-2)");
      expect(line).toContain("inset 0 1px 0 rgb(255 255 255");
    }
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
