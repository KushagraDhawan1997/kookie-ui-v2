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
    expect(block(raw("tokens/tokens.css"), '[data-surface-look="outlined"]')).toContain(
      "--look-surface-fill: var(--color-surface)",
    );
    expect(surfaces).not.toContain("--tone-a1");
  });
});

describe("no elevation axis; the elevated WORLD is the one sanctioned shadow (§5, §10)", () => {
  it("this layer paints one box-shadow, and the world scopes declare what it reads", () => {
    // The elevation axis stays deleted — nothing chooses shadow at a call site. What exists
    // is an app identity: Theme depth="elevated" dresses every surface with one rule, on
    // the element that owns the radius. Flat remains the default and byte-identical to a
    // world where the rule does not exist.
    expect(surfaces).not.toContain("data-elevation");
    // DECLARATIONS, not mentions (respelled 2026-08-10): the floating entry lists box-shadow
    // as a transition CHANNEL — the cast fades up as the panel lifts — and a channel name is
    // not a second place this layer paints a shadow. The colon is what separates them.
    const occurrences = surfaces.match(/box-shadow\s*:/g) ?? [];
    expect(occurrences).toHaveLength(1);
    // The world scopes declare; .kui-surface paints. Routing it through a custom property is
    // what lets `flat` escape an elevated ancestor — a descendant selector had no reset, so a
    // nested flat Theme matched nothing and the outer rule still reached the inner cards.
    const body = block(surfaces, '[data-depth="elevated"]');
    expect(body).toContain("--kui-surface-chrome: var(--surface-chrome)");
    expect(block(surfaces, '[data-depth="flat"]')).toContain("--kui-surface-chrome: none");
    // The world's light reaches controls too (§5 amended 2026-08-07): the control cast and
    // catch are declared in the SAME scopes, and flat stands both down — the escape logic
    // above holds for controls by the same mechanism, or not at all.
    expect(body).toContain("--kui-control-chrome: var(--control-chrome)");
    expect(body).toContain("--kui-control-light: var(--control-light)");
    const flat = block(surfaces, '[data-depth="flat"]');
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
    for (const t of GLASS_MATERIALS) {
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

  it("the floating chrome is declared by BOTH worlds, and flat's is a value, never none (§22)", () => {
    // The §11 amendment made mechanical (2026-08-09): a shadow under a floating pane is
    // INFORMATION about overlap, not the expression this switch governs — so flat quiets
    // the cast (the generator fades the same palette row) but may never remove it. A flat
    // scope declaring `none` here is the defect this law exists to catch.
    const body = block(surfaces, '[data-depth="elevated"]');
    const flat = block(surfaces, '[data-depth="flat"]');
    expect(body).toContain("--kui-floating-chrome: var(--floating-chrome-elevated)");
    expect(flat).toContain("--kui-floating-chrome: var(--floating-chrome-flat)");
    expect(flat).not.toContain("--kui-floating-chrome: none");
  });

  it("the floating paint re-points the ONE cast site and sits last, so it wins every fight (§22)", () => {
    // Same specificity as the glass transmission rules and the reduced-transparency
    // stand-down — source order is the whole mechanism, so the rule must come after BOTH:
    // a glass floating pane casts the floating chrome (not the transmitted row — coverage
    // is a fact even where expression is off), and a sealed floating pane still casts.
    // Anchored on the exact rule OPENING: the floating size join (2026-08-09) begins with
    // the same characters, so a bare indexOf of the selector finds the join's first arm
    // and this law would measure the wrong rule's position — the substring trap the loud
    // parser exists for.
    const paint = surfaces.indexOf("\n.kui-surface.kui-floating {");
    expect(paint).toBeGreaterThan(-1);
    expect(paint).toBeGreaterThan(surfaces.indexOf("prefers-reduced-transparency"));
    expect(paint).toBeGreaterThan(surfaces.lastIndexOf('[data-material="thick"]'));
    const body = block(surfaces, "\n.kui-surface.kui-floating {");
    // A re-point of --kui-sf-cast, never a second box-shadow (the count law's six holds),
    // and the second fallback covers the un-themed document, which behaves as flat.
    expect(body).toContain("--kui-sf-cast: var(--kui-floating-chrome, var(--floating-chrome-flat, none))");
    expect(body).not.toContain("box-shadow");
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

  it("every drop row is the contact-drop-blast anatomy, one light source, depth by reach", () => {
    // The 2026-08-16 redesign in one law (superseding the 2026-08-07 two-layer shape, when
    // the material lab's depth was adopted whole): a drop row is THREE layers — a contact
    // line (what reads sharp, constant across the ladder because contact does not change
    // with height), a drop (the body), and a blast (the far wide reach the palette did not
    // have, and the layer the lab's depth is mostly made of). Both reaching layers pull in
    // with a negative spread, and the ladder is ordered by REACH, so each row's blast offset
    // strictly grows. x is 0 everywhere: the light source does not move sideways, in either
    // mode — nor between them.
    for (const scope of ['[data-appearance="light"]', '[data-appearance="dark"]']) {
      const body = block(tokens, scope);
      let prevReach = 0;
      for (const i of [2, 3, 4, 5]) {
        const line = body.split("\n").find((l) => l.includes(`--shadow-${i}:`))!;
        const layers = line.slice(line.indexOf(":") + 1).split("), ");
        expect(layers.length, `row ${i} is three layers`).toBe(3);
        for (const layer of layers) expect(layer.trimStart().startsWith("0 ")).toBe(true);
        // The contact hugs — no negative spread, or a bright seam opens between the bottom
        // edge and its own shadow (Kushagra's row-2 edge rule, which binds every row).
        expect(layers[0]!, `row ${i}'s contact must not pull in`).not.toMatch(/ -\d/);
        for (const j of [1, 2]) {
          expect(layers[j]!, `row ${i} layer ${j + 1} pulls in`).toMatch(/ -\d+(\.\d+)?px rgb/);
        }
        const reach = parseFloat(layers[2]!.trim().split(" ")[1]!);
        expect(reach, `row ${i} reaches further than row ${i - 1}`).toBeGreaterThan(prevReach);
        prevReach = reach;
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
      // Both transmitted families, each from its own row: panes fade the SURFACE row, glass
      // CONTROLS (fields, buttons) fade row 2 — extended 2026-08-07 when the field family
      // got the pane parts the cards got. The surface row became 5 on 2026-08-16 with the
      // lab's depth; the fade is row-agnostic, which is why only the pointer moved here.
      for (const [rowName, chrome] of [
        ["--shadow-5", "surface-chrome"],
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

  it("flat's floating cast is the elevated row actually faded, in both appearances (§22)", () => {
    // The transmission law's sentence one role over: flat is DERIVED from the same palette
    // row elevated reads, through the same fadeShadow seam, so the two cannot drift. The
    // row itself is READ from the emitted elevated value rather than hand-pinned here —
    // the law's copy of "row 4" went stale the day the chrome moved to row 5 (Kushagra's
    // eye, 2026-08-09), which is the two-homes drift this suite keeps cataloguing. What
    // stays asserted: elevated names exactly one palette row by reference, and flat is
    // that row with every alpha x factor, geometry unchanged — the independent parse,
    // because the copied-regex version of this law is the one the 2026-08-07 audit
    // demonstrated agreeing with a broken fade.
    for (const scope of ['[data-appearance="light"]', '[data-appearance="dark"]']) {
      const body = block(tokens, scope);
      const elevated = valueOf(body, "--floating-chrome-elevated");
      const rowRef = elevated.match(/var\((--shadow-[1-5])\)/);
      if (!rowRef) throw new Error(`floating-chrome-elevated names no palette row: ${elevated}`);
      const source = valueOf(body, rowRef[1]!);
      const sourceAlphas = alphasOf(source);
      expect(sourceAlphas.length).toBeGreaterThan(0);
      const flat = valueOf(body, "--floating-chrome-flat");
      expect(flat, `${scope} flat floating cast is the unfaded row`).not.toBe(source);
      const got = alphasOf(flat);
      expect(got.length, "flat kept every layer").toBe(sourceAlphas.length);
      got.forEach((a, i) => {
        expect(
          Math.abs(a - sourceAlphas[i]! * 0.5),
          `${scope} floating-flat layer ${i}: ${a} is not ${sourceAlphas[i]} x 0.5`,
        ).toBeLessThan(0.001);
        expect(a).toBeGreaterThan(0);
      });
      expect(flat.replace(/rgba?\([^)]*\)/g, "C")).toBe(source.replace(/rgba?\([^)]*\)/g, "C"));
    }
  });

  it("the lifted rim outshines the resting rim, per thickness per mode, and high contrast empties both (§10)", () => {
    for (const scope of ['[data-appearance="light"]', '[data-appearance="dark"]']) {
      const body = block(tokens, scope);
      for (const t of GLASS_MATERIALS) {
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
    // its chrome roles — so there is exactly one source of shadow truth and tuning a row
    // tunes every consumer of that reach. Which rung each role picks moved 2026-08-16 with
    // the lab's depth: the palette is ordered by REACH and the lab prices a cast by the size
    // of the box throwing it, so a card takes the top rung (5) and a menu the middle (3),
    // where before the panel took the top and the card sat below it.
    expect(surfaces).not.toContain("--shadow-");
    expect(tokens).toContain("--surface-chrome: var(--shadow-5)");
    // The floating role names its row too, and the two roles must name DIFFERENT rows —
    // that separation is the whole content of the 2026-08-16 re-point, and asserting only
    // "surface is 5" would pass with every role pointed at 5. The first spelling of this
    // filtered on `--floating-chrome:`, which matches nothing (the emitted names are
    // `-elevated` and `-flat`), so the loop body never ran and the law was vacuous.
    const floatingLines = tokens.split("\n").filter((l) => l.includes("--floating-chrome-elevated:"));
    expect(floatingLines.length, "no floating chrome is emitted to check").toBeGreaterThan(0);
    for (const line of floatingLines) expect(line).toContain("var(--shadow-3)");
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

describe("the exit keeps every channel the entry moves alive (§8, §22, §24)", () => {
  /**
   * The 2026-08-16 audit's structural lesson, made mechanical.
   *
   * A running transition is CANCELLED the moment its property drops out of
   * `transition-property`. Both families' exits therefore restate the entry's channels, so a
   * panel dismissed mid-flight keeps becoming while it dissolves instead of jumping to its
   * target under the fade. That restatement is a hand-maintained list, and a hand-maintained
   * list drifts: the floating exit shipped without `box-shadow` for a day, which is a real
   * channel of that entry (the seed stands the cast down and the flight fades it up), and a
   * menu dismissed 35ms in snapped 169 → 303px in two frames.
   *
   * So the list is not trusted, it is DERIVED: every property named in the family's base
   * transition must appear in its ending transition. The two clocks are free to differ —
   * that is the point of an exit — but the membership is not.
   */
  const channels = (list: string): string[] =>
    list
      // one entry per comma that is not inside a function (a `linear(…)` easing is full of them)
      .split(/,(?![^(]*\))/)
      .map((entry) => entry.trim().split(/\s+/)[0] ?? "")
      .filter((name) => name.length > 0 && !name.startsWith("/*"));

  /**
   * The transition declared at `selector` — searching EVERY rule with that selector, not the
   * first. A family states its identity and its motion in separate blocks under the same
   * selector, and taking the first one found the identity block and reported "no transition"
   * on a sheet that plainly has one. A law that cannot find its subject is a law that fails
   * for the wrong reason, which is the same defect class as one that cannot fail at all.
   */
  const transitionOf = (selector: string): string => {
    for (let at = surfaces.indexOf(selector); at !== -1; at = surfaces.indexOf(selector, at + 1)) {
      const open = surfaces.indexOf("{", at);
      const close = surfaces.indexOf("}", open);
      // comments carry prose full of property names; they are documentation, not declarations
      const body = surfaces.slice(open + 1, close).replace(/\/\*[\s\S]*?\*\//g, "");
      const start = body.indexOf("transition:");
      if (start === -1) continue;
      return body.slice(start + "transition:".length, body.indexOf(";", start));
    }
    throw new Error(`no transition declared at ${selector}`);
  };

  for (const [family, base, ending] of [
    ["the floating family", ".kui-surface.kui-floating {", ".kui-surface.kui-floating[data-ending-style]"],
    ["the overlay family", ".kui-surface.kui-alert-popup {", ".kui-surface.kui-alert-popup[data-ending-style]"],
  ] as const) {
    it(`${family}: no channel is dropped on the way out`, () => {
      const entry = channels(transitionOf(base));
      const exit = channels(transitionOf(ending));
      // Vacuity guards: a parser that returned nothing would pass this law silently, and the
      // entry must genuinely move geometry for the claim to be about anything.
      expect(entry.length, "the entry declares channels").toBeGreaterThan(3);
      expect(exit.length, "the exit declares channels").toBeGreaterThan(3);
      expect(entry, "the entry moves geometry, not only paint").toContain("inline-size");
      for (const channel of entry) {
        expect(exit, `${channel} is cancelled by the exit unless the exit restates it`).toContain(
          channel,
        );
      }
    });
  }
});

describe("the lens is additive, never subtractive (§10, 2026-08-16)", () => {
  const surfacesCss = raw("system/surfaces.css");
  const recipesCss = raw("system/recipes.css");

  it("every glass chain prepends the lens with an EMPTY fallback, in both layers", () => {
    // The one property that makes refraction safe to ship in a package whose glass has to
    // survive three engines. `var(--kui-lens, )` substitutes to nothing when unset, so the
    // declaration is exactly the chain the stylesheet would have had — which is what every
    // non-Chromium browser, and every surface that is not glass, actually gets.
    //
    // Spelled with the fallback or not at all: `var(--kui-lens)` with no fallback is INVALID
    // at computed-value time when unset, and an invalid computed value takes the WHOLE
    // declaration with it — the blur and the saturation included. The usual two-declaration
    // CSS fallback cannot protect a var(), so there is no safety net under this spelling.
    let found = 0;
    for (const css of [surfacesCss, recipesCss]) {
      for (const match of css.matchAll(/backdrop-filter:\s*([^;]+);/g)) {
        const value = match[1]!;
        // `@supports (backdrop-filter: blur(1px)) {` has no semicolon of its own, so a
        // greedy [^;]+ swallows the whole block after it and looks like a declaration that
        // mentions a material. A condition is not a declaration; the brace is what tells
        // them apart. (This law's first run failed on exactly that and not on the code.)
        if (value.includes("{")) continue;
        if (!value.includes("--material-")) continue; // `none` in the reduced-transparency arm
        found += 1;
        expect(value, "a glass chain that does not prepend the lens").toContain("var(--kui-lens, )");
        expect(value.indexOf("var(--kui-lens, )"), "the lens must come FIRST — it bends the\
 backdrop, then the blur softens what it bent; the other order blurs away what there was to bend")
          .toBeLessThan(value.indexOf("--material-"));
      }
    }
    // Six: three thicknesses in the surface layer, three in the control layer.
    expect(found, "no glass chains were checked").toBe(6);
  });

  it("--kui-lens does not inherit — a map is built for ONE box", () => {
    // The fourth time this guard is written and the reason is sharper here than anywhere: a
    // displacement map encodes a specific width, height and corner, so an inherited lens
    // would bend a 40px button's backdrop through a 400px pane's bezel. Registered rather
    // than hoped for.
    const decl = block(surfacesCss, "@property --kui-lens");
    expect(decl).toContain("inherits: false");
  });
});

describe("the pane's own lighting is four layers, not one (§10, 2026-08-16)", () => {
  const tokensCss = raw("tokens/tokens.css");

  it("every rim carries grain, bloom, sheen and the edge catch, in that order", () => {
    // Ported from the material lab, where a pane is LIT rather than tinted: texture so a big
    // pane is not flat vector fill, a bloom where the light enters, the broad wash, then the
    // 1px catch the package already had — which alone is why ported glass read as a
    // rectangle beside the lab it came from.
    //
    // Order is the law, not just presence: these composite top-down, so grain over bloom over
    // sheen. Written as index comparisons rather than a regex on the whole value, because the
    // grain is an inlined SVG full of commas and angle brackets and a pattern over it would
    // be asserting the data URI's spelling.
    let checked = 0;
    for (const scope of ['[data-appearance="light"]', '[data-appearance="dark"]']) {
      const body = block(tokensCss, scope);
      for (const t of GLASS_MATERIALS) {
        for (const variant of ["rim", "rim-lifted"]) {
          const line = body.split("\n").find((l) => l.includes(`--material-${t}-${variant}:`));
          if (!line) throw new Error(`no --material-${t}-${variant} in ${scope}`);
          checked += 1;
          const grain = line.indexOf("feTurbulence");
          const bloom = line.indexOf("radial-gradient");
          const sheen = line.indexOf("linear-gradient(180deg");
          const edge = line.lastIndexOf("linear-gradient(rgb");
          for (const [name, at] of [["grain", grain], ["bloom", bloom], ["sheen", sheen], ["edge", edge]] as const) {
            expect(at, `${scope} ${t} ${variant} has no ${name}`).toBeGreaterThan(-1);
          }
          expect(grain, "grain sits over bloom").toBeLessThan(bloom);
          expect(bloom, "bloom sits over sheen").toBeLessThan(sheen);
          expect(sheen, "the sheen sits over the edge catch").toBeLessThan(edge);
        }
      }
    }
    // Two scopes x three thicknesses x two variants; a shorter walk is a law that stopped
    // looking rather than a system that got simpler.
    expect(checked, "the rim walk covered nothing").toBe(12);
  });

  it("the lifted variant differs from the resting one ONLY at the edge catch", () => {
    // The elevated world catches harder at the very edge; grain, bloom and sheen are what the
    // material IS and do not move with the app's depth. Asserting the difference exists AND
    // that it is confined is what stops the lifted variant drifting into a second recipe.
    for (const scope of ['[data-appearance="light"]', '[data-appearance="dark"]']) {
      const body = block(tokensCss, scope);
      for (const t of GLASS_MATERIALS) {
        const at = (v: string) => {
          const line = body.split("\n").find((l) => l.includes(`--material-${t}-${v}:`))!;
          return line.slice(line.indexOf(":") + 1);
        };
        const rest = at("rim");
        const lifted = at("rim-lifted");
        expect(rest, `${scope} ${t}: the lifted rim is identical to the resting one`).not.toBe(lifted);
        const upTo = (v: string) => v.slice(0, v.lastIndexOf("linear-gradient(rgb"));
        expect(upTo(rest), `${scope} ${t}: depth moved something other than the edge catch`).toBe(upTo(lifted));
      }
    }
  });
});

describe("continuous curvature (§6, ported 2026-08-16)", () => {
  const css = raw("system/surfaces.css");

  it("the shape and its compensation live or die together, inside one @supports block", () => {
    // The rule that makes this safe to ship: an engine without `corner-shape` must be
    // untouched, and it is — the property and the multiplier are declared in the same guarded
    // block, so there is no arrangement in which a browser gets the number without the shape.
    // That is the failure the lab guards with a fallback ratio; here it is structural.
    const guard = from(css, "@supports (corner-shape: squircle)");
    expect(guard).toContain("corner-shape: squircle");
    expect(guard).toContain("--kui-corner-k:");
    // And nowhere else: a squircle declared outside the guard is the lozenge bug.
    const outside = css.replace(guard, "");
    expect(outside, "corner-shape escapes its @supports guard").not.toContain("corner-shape: squircle");
    expect(outside, "the corner multiplier escapes its @supports guard").not.toContain("--kui-corner-k:");
  });

  it("a capsule stays round — squircle math at half-height bulges square", () => {
    // The lab's own carve-out (2026-08-14: the boxy ring inside the pill). At `full` a corner
    // is already its own continuous curve, so the shape has nothing to add and its math has
    // something to break. Both the descendant and self forms, because a Theme stamps
    // [data-radius] on itself and a surface can BE that element.
    const guard = from(css, "@supports (corner-shape: squircle)");
    const capsule = block(guard, '[data-radius="full"] .kui-surface');
    expect(capsule).toContain("corner-shape: round");
    expect(capsule).toContain("--kui-corner-k: 1");
    expect(guard, "a surface that IS the radius scope keeps the capsule carve-out").toContain(
      '[data-radius="full"].kui-surface',
    );
  });

  it("the radius is multiplied at ONE site, so nothing can wear the shape at the wrong number", () => {
    expect(block(css, ".kui-surface {")).toContain(
      "border-radius: calc(var(--kui-sf-radius, var(--radius-surface-3)) * var(--kui-corner-k, 1))",
    );
  });
});
