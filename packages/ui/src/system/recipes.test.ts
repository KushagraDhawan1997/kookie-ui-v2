/**
 * §2's additivity claim, asserted structurally rather than by byte count (ENGINEERING §6).
 *
 * "Component CSS is additive, not multiplicative" is the load-bearing size argument of the
 * whole project: total is O(components + rungs + sizes + tones), never their product. A byte
 * measurement cannot prove that — it only tells you today's number. What proves it is that a
 * component's own stylesheet names none of the axes, so adding Input or Select adds structure
 * and nothing else, and adding a tone or a rung touches one shared file.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { GLASS_MATERIALS } from "./axes.ts";

import { tones } from "../tokens/color-config.ts";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * A stylesheet's CODE, comments stripped. Every law in this file asks what a sheet DOES, and
 * the answer is never in its prose — but these are heavily commented files whose comments name
 * the very things the laws forbid, because explaining why a rung, a family or an abandoned
 * stem is absent means writing it down. Scanning raw text made two laws fire on their own
 * documentation, and the cheap fix each time is to delete the sentence, which is the wrong
 * direction for a codebase whose comments are the argument.
 */
const code = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, " ");
const read = (p: string) => code(readFileSync(join(here, p), "utf8"));

const recipes = read("./recipes.css");
const button = read("../components/button/button.css");
const textField = read("../components/text-field/text-field.css");
const textArea = read("../components/text-area/text-area.css");
const TONE_NAMES = Object.keys(tones);

/** Every hand-authored stylesheet the package ships. Generated files are where literals and
    palette references are supposed to bottom out, so they are not in scope. */
function allStylesheets(dir = ".."): string[] {
  return readdirSync(join(here, dir), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? allStylesheets(join(dir, entry.name))
      : entry.name.endsWith(".css") && !["tokens.css", "layout.css"].includes(entry.name)
        ? [join(dir, entry.name)]
        : [],
  );
}

const RUNGS = ["loud", "medium", "quiet"];
// Derived from the exported type, not restated: §9's axis table drifted to three values
// while the code shipped four, and a local literal here would have kept the ladder's hole
// invisible to CI. Adding a thickness now fails these laws until the layer supports it.
const MATERIALS = [...GLASS_MATERIALS];

describe("a component's own CSS names no axis (§2, §9)", () => {
  // Every component stylesheet the package ships — WALKED, not listed (audit D14, 2026-08-06):
  // this was a three-file literal under a comment claiming "all of them", so checkbox.css
  // shipped outside the law and Radio and Switch would have too. The claim is about all of
  // them, so the list is the directory; a stylesheet added tomorrow is audited tomorrow.
  const components: [string, string][] = allStylesheets("../components").map((p) => [
    p.split("/").pop()!,
    read(p),
  ]);

  it("the walk found the components it must — an empty walk audits nothing", () => {
    const names = components.map(([n]) => n);
    for (const known of ["button.css", "checkbox.css", "text-field.css", "text-area.css"]) {
      expect(names).toContain(known);
    }
  });

  for (const [name, css] of components) {
    it(`${name} contains no tone, no rung, no size index, and no material`, () => {
      for (const tone of TONE_NAMES) expect(css).not.toContain(`--${tone}-`);
      for (const rung of RUNGS) expect(css).not.toContain(rung);
      expect(css).not.toMatch(/data-size/);
      expect(css).not.toMatch(/data-material|--material-/);
      // If this ever fails, the recipe layer has stopped absorbing variation and the cost has
      // quietly become multiplicative — which is the moment to fix the layer, not the component.
    });
  }

  it("button.css names no colour token at all — appearance is resolved output (§7)", () => {
    expect(button).not.toMatch(/--(accent|neutral|destructive|tone)-/);
  });

  it("the field family names ROLES where it must, and never a family (§7)", () => {
    // A field is stricter than a button in one way and looser in another, and the difference is
    // worth stating rather than blurring. It declares its own identity — the seal it fills with,
    // the muted hint — so it necessarily names colour, where button.css names none at all. What
    // it must never do is reach past the role layer to a FAMILY: the moment a component knows
    // the word `neutral`, rebinding a tone stops being a Theme's job. TextArea is the same
    // family with the same identity, held to the same line.
    for (const css of [textField, textArea]) {
      expect(css).not.toMatch(/--(accent|neutral|destructive)-/);
      expect(css).toMatch(/--color-surface|--tone-label/);
    }
  });
});

describe("the icon box is a mechanism, declared once (§4, ENGINEERING §4)", () => {
  it("no component restates it — including for adornments in a slot wrapper", () => {
    // A field's icons sit inside `[data-slot]`, so they are grandchildren of the control and
    // the bare `.kui-control > svg` rule misses them. The fix belongs in the shared layer, not
    // in a fourth copy of three declarations when Select ships. Walked like the no-axis law
    // (audit D14), with ONE exemption: spinner.css consumes --kui-ct-icon by design — the
    // spinner IS the icon, so reading the icon box is its job, not a restatement of it.
    expect(recipes).toContain("[data-slot] > svg");
    for (const p of allStylesheets("../components")) {
      const name = p.split("/").pop()!;
      if (name === "spinner.css") continue;
      expect(read(p), `${name} restates the icon box`).not.toContain("--kui-ct-icon");
    }
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
    // Scoped to the RUNG blocks, and to every role rather than two of them. The old form swept
    // the whole file for `--{family}-solid` and `--{family}-soft` only, which is both too wide
    // and too narrow: too wide because a state remap MUST name a family to remap anything (the
    // disabled block has always named raw `--neutral-N` steps), and too narrow because every
    // other role — `-border`, `-label`, `-contrast` — went straight through the hole. The law
    // now says what its title says.
    for (const rung of RUNGS) {
      const start = recipes.indexOf(`[data-emphasis="${rung}"]`);
      const body = recipes.slice(start, recipes.indexOf("}", start));
      for (const name of TONE_NAMES) expect(body).not.toContain(`--${name}-`);
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
    expect(recipes).not.toMatch(/\[data-size="\d"\]\[data-(emphasis|tone|material)=/);
    expect(recipes).not.toMatch(/\[data-material="[a-z]+"\]\[data-(emphasis|tone|size)=/);
    expect(recipes).not.toMatch(/\[data-(emphasis|tone)="[a-z]+"\]\[data-material=/);
  });
});

describe("invalid is a state remap, and it belongs to every control (§8)", () => {
  const code = recipes.replace(/\/\*[\s\S]*?\*\//g, "");

  it("lives in the shared layer, not in the component that happened to need it first", () => {
    // TextField is the first control that can be wrong, but Select, Combobox and NumberField
    // all can be. If this ever moves into a component's stylesheet the remap has become a
    // variant, which is the thing the system refuses.
    expect(code).toMatch(/\[data-invalid\]/);
    // Comments may DISCUSS it; only a rule would mean the remap had moved.
    const componentRules = textField.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(componentRules).not.toContain("invalid");
  });

  it("reads BOTH spellings — Base UI's inside a Field, the platform's standalone", () => {
    expect(code).toContain('[aria-invalid="true"]');
    expect(code).toContain("[data-invalid]");
  });

  it("reaches the wrapper pattern, where the state lands on a child", () => {
    // Without the :has() arm a field's border could never answer its own input's validity.
    expect(code).toMatch(/:has\(>\s*:is\(\[data-invalid\]/);
  });

  it("moves the box and NOTHING else — the value the user typed stays legible", () => {
    // Reversed 2026-08-04: the ring moves WITH the border now, both reading --invalid-edge.
    // This law previously forbade --focus-ring here, pinning the rule that the accent ring
    // measured 6.4x the weight of the error border it surrounded. What it still pins is the
    // real invariant: a state re-tones the BOX, never the content or the fill.
    const start = code.indexOf(".kui-control:is([data-invalid]");
    const body = code.slice(start, code.indexOf("}", start));
    expect(body).toContain("--tone-border: var(--invalid-edge)");
    expect(body).toContain("--focus-ring: var(--invalid-edge)");
    for (const forbidden of ["--tone-label", "--tone-solid", "--tone-soft", "background"]) {
      expect(body).not.toContain(forbidden);
    }
  });
});

describe("material on a control: backdrop defense, three environments (§10)", () => {
  const code = recipes.replace(/\/\*[\s\S]*?\*\//g, "");

  it("each material is defined exactly three times — fallback, recipe, reduced-transparency", () => {
    // Three environments, not three designs — the same shape the surface layer wears.
    for (const m of MATERIALS) {
      const occurrences = code.match(new RegExp(`\\[data-material="${m}"\\]`, "g")) ?? [];
      expect(occurrences).toHaveLength(3);
    }
  });

  it("backdrop-filter exists only inside @supports, with the near-sealed fallback outside it", () => {
    const guardStart = code.indexOf("@supports (backdrop-filter");
    expect(guardStart).toBeGreaterThan(-1);
    expect(code.slice(0, guardStart)).not.toContain("backdrop-filter:");
    expect(code.slice(0, guardStart)).toContain("--material-opaque-alpha");
  });

  it("prefers-reduced-transparency forces the near-seal, kills the blur, and wins by cascade order", () => {
    const media = code.slice(code.indexOf("@media (prefers-reduced-transparency: reduce)"));
    expect(media).toContain("--material-opaque-alpha");
    expect(media).toContain("backdrop-filter: none");
    expect(code.indexOf("@media (prefers-reduced-transparency")).toBeGreaterThan(
      code.indexOf("@supports (backdrop-filter"),
    );
  });

  it("material is a fill MODIFIER: every state derives from the rung's own source (§10)", () => {
    // The veil is the fill the rung already chose, mixed toward transparent at the thickness
    // alpha — tone and loudness ride into the glass for free. Every state a control can paint
    // re-derives from the same source, in the recipe and in both opaque environments alike:
    // a missed one would flash the opaque page-designed fill over glass.
    const supports = code.slice(code.indexOf("@supports (backdrop-filter"));
    for (const m of MATERIALS) {
      const block = supports.slice(supports.indexOf(`[data-material="${m}"]`));
      const body = block.slice(0, block.indexOf("}"));
      expect(body).toContain(
        `--kui-ct-fill: color-mix(in srgb, var(--kui-ct-fill-src) var(--material-${m}-alpha), transparent)`,
      );
      expect(body).toContain(
        `--kui-ct-fill-hover: color-mix(in srgb, var(--kui-ct-fill-src-hover) var(--material-${m}-alpha-hover), transparent)`,
      );
      expect(body).toContain(
        `--kui-ct-fill-active: color-mix(in srgb, var(--kui-ct-fill-src-active) var(--material-${m}-alpha-active), transparent)`,
      );
      expect(body).toContain(`backdrop-filter: var(--material-${m}-filter)`);
    }
    for (const env of [
      code.slice(0, code.indexOf("@supports")),
      code.slice(code.indexOf("@media (prefers-reduced-transparency")),
    ]) {
      for (const state of ["", "-hover", "-active"]) {
        expect(env).toContain(
          `--kui-ct-fill${state}: color-mix(in srgb, var(--kui-ct-fill-src${state}) var(--material-opaque-alpha), transparent)`,
        );
      }
    }
  });

  it("material names no colour and never touches the label — the rung's pairing survives", () => {
    // The modifier reads only the source vars and its own alphas; the rung keeps the fill's
    // designed label (--tone-contrast stays paired to a loud fill that is still there,
    // merely translucent). A material block naming a colour or a label would mean it has
    // quietly become a fill again.
    const materialBlock = code.slice(code.indexOf('[data-material="thin"]'));
    expect(materialBlock).not.toMatch(/--(tone|accent|neutral|destructive|color)-/);
    expect(materialBlock).not.toContain("--kui-ct-label-color");
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

describe("the ring and the chrome are designed once, applied wherever they land (§5, §8)", () => {
  // Both of these were single-site facts that quietly became multi-site ones, and in both cases
  // the doc still claimed "exactly one" while the second and third copies shipped. Counting
  // occurrences in ONE file is what let that happen, so these laws walk every stylesheet the
  // package ships and check the thing that actually matters: not how many rules there are, but
  // that every one of them resolves the same designed value.
  const sheets = allStylesheets().map((f) => [f, read(f).replace(/\/\*[\s\S]*?\*\//g, "")] as const);

  it("every focus rule reads the ring tokens — no literal, no second colour", () => {
    // §8's "one ring, defined once" was already three rules before TextField existed: the
    // control, the interactive surface (card-as-button) and now the field wrapper. One ring
    // never meant one selector — it means one designed value, and THAT is what is asserted.
    let found = 0;
    for (const [file, css] of sheets) {
      for (const match of css.matchAll(/:focus(?:-visible|-within)?[^{]*\{([^}]*)\}/g)) {
        const body = match[1]!;
        if (!body.includes("outline")) continue;
        found += 1;
        expect(body, `${file} rings with something other than the tokens`).toContain(
          "var(--focus-ring-width) solid var(--focus-ring)",
        );
        expect(body).toContain("var(--focus-ring-offset)");
      }
    }
    expect(found).toBeGreaterThanOrEqual(3);
  });

  it("every box-shadow reads the world's chrome — depth is never a component's own idea", () => {
    // The elevated world dresses surfaces AND the controls that are built like them (a field is
    // a bordered box on the page). What no stylesheet may do is invent its own depth: the moment
    // a rule names --shadow-N directly, the fenced resource has become an axis again (§13).
    let found = 0;
    for (const [file, css] of sheets) {
      for (const match of css.matchAll(/box-shadow:\s*([^;]+);/g)) {
        found += 1;
        expect(match[1]!, `${file} paints a shadow of its own`).toContain("--kui-surface-chrome");
      }
      expect(css, `${file} reaches past the chrome to the palette`).not.toContain("--shadow-");
    }
    expect(found).toBeGreaterThanOrEqual(2);
  });
});

describe("tokens only: no raw length literals in a hand-authored stylesheet (non-negotiable)", () => {
  // "No raw px in component CSS; every value resolves through a --* token." This was true of
  // every length except the chrome widths, which sat as `1px` / `2px` literals in recipes.css
  // and surfaces.css — and the consequence was not stylistic: they were the only geometry in a
  // control that ignored --scale, so a bordered button at scale 2 doubled its height, padding,
  // radius and type and kept a 1px hairline. The rule is a law now, not a habit.
  //
  // tokens.css and layout.css are exempt: they are GENERATED, and a generated file is where
  // the literals are supposed to bottom out.
  const walk = (dir: string): string[] =>
    readdirSync(join(here, dir), { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? walk(join(dir, entry.name))
        : entry.name.endsWith(".css") && !["tokens.css", "layout.css"].includes(entry.name)
          ? [join(dir, entry.name)]
          : [],
    );

  it("holds for every hand-authored stylesheet in the package", () => {
    const files = walk("..");
    expect(files.length).toBeGreaterThan(2);
    for (const file of files) {
      const withoutComments = read(file)
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // `initial-value` is a REQUIRED descriptor of an @property registration, not a design
        // value: a registered <length> must declare the value it computes to when the cascade
        // gives it nothing, and that is 0px by definition. Exempting the descriptor rather than
        // the whole @property block, so a real literal inside one still fails.
        .replace(/^\s*initial-value:[^;]*;/gm, "");
      const literals = withoutComments.match(/(?<![-\w(#.])\d+(\.\d+)?px\b/g) ?? [];
      expect(literals, `${file} carries raw px: ${literals.join(", ")}`).toEqual([]);
    }
  });
});

describe("private stems are namespaced per layer (§2, added 2026-08-05)", () => {
  // The layout mechanism generates one `--kui-<shortcode>` per Box prop, so it owns a large,
  // GROWING set of terse names — `--kui-h` for `height`, `--kui-px` for `px`, and so on. The
  // hand-authored layers were reaching into the same space: the control layer used `--kui-h`
  // for control height, `--kui-px` for inline padding, and read `--kui-py`. All three were
  // the same name meaning two different things.
  //
  // It was not theoretical. `--kui-h` is registered `inherits: false` by layout.css, which
  // made it silently ABSENT on any element that does not declare it — that is why the hosted
  // control's height had to be computed on the container and handed through the slot, and it
  // is the second thing the collision broke (the size join leaking onto every Card was the
  // first). The control layer now wears `--kui-ct-`, matching the surface layer's `--kui-sf-`.
  //
  // Not "no shared names" — `--kui-border-color` and `--kui-surface-chrome` are shared on
  // purpose, one idea written once for both layers. The law is narrower and is the one that
  // could not be satisfied by accident: nothing outside the layout mechanism may so much as
  // MENTION a name the layout mechanism declares. Mention, not declare, because reading a
  // stem you do not own is the same defect from the other side, and `--kui-py` was exactly
  // that — read by the control skeleton, declared by Box.
  const names = (css: string) => new Set(css.match(/--kui-[a-z0-9-]+/g) ?? []);

  const layoutOwned = names(code(readFileSync(join(here, "./layout.css"), "utf8")));

  it("the layout mechanism really does own a large terse set — the premise, not an assumption", () => {
    expect(layoutOwned.size).toBeGreaterThan(100);
    for (const stem of ["--kui-h", "--kui-px", "--kui-py"]) expect(layoutOwned.has(stem)).toBe(true);
  });

  for (const path of allStylesheets()) {
    it(`${path.split("/").pop()} names nothing the layout mechanism owns`, () => {
      const shared = [...names(read(path))].filter((n) => layoutOwned.has(n));
      expect(shared, `${path} shares stems with layout.css`).toEqual([]);
    });
  }
});
