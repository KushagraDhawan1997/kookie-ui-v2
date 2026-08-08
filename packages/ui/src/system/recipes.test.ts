/**
 * §2's additivity claim, asserted structurally rather than by byte count (ENGINEERING §6).
 *
 * "Component CSS is additive, not multiplicative" is the load-bearing size argument of the
 * whole project: total is O(components + rungs + sizes + tones), never their product. A byte
 * measurement cannot prove that — it only tells you today's number. What proves it is that a
 * component's own stylesheet names none of the axes, so adding Input or Select adds structure
 * and nothing else, and adding a tone or a rung touches one shared file.
 *
 * Reading and parsing live in test/stylesheets.ts (2026-08-06): the walk, the comment strip
 * and the loud selector lookup are the law layer's own mechanisms, declared once. block() and
 * from() THROW on a missing selector — a renamed selector fails a law instead of blinding it.
 */
import { describe, expect, it } from "vitest";

import { GLASS_MATERIALS, RUNGS, SLOT_NAMES } from "./axes.ts";

import { tones } from "../tokens/color-config.ts";
import { allStylesheets, block, from, raw, sheet, stripped, walkFiles } from "../test/stylesheets.ts";

const recipes = sheet("system/recipes.css");
const button = sheet("components/button/button.css");
const textField = sheet("components/text-field/text-field.css");
const textArea = sheet("components/text-area/text-area.css");
const TONE_NAMES = Object.keys(tones);

describe("a component's own CSS names no axis (§2, §9)", () => {
  // Every component stylesheet the package ships — WALKED, not listed (audit D14, 2026-08-06):
  // this was a three-file literal under a comment claiming "all of them", so checkbox.css
  // shipped outside the law and Radio and Switch would have too. The claim is about all of
  // them, so the list is the directory; a stylesheet added tomorrow is audited tomorrow.
  const components: [string, string][] = allStylesheets("components").map((p) => [
    p.split("/").pop()!,
    sheet(p),
  ]);

  it("the walk found what the entry point ships — an empty walk audits nothing", () => {
    // The negative control was a hand-kept four-name literal — the exact shape audit D14
    // deleted one describe up, aging the same way. The entry stylesheet is an independent
    // second source (imports are load-bearing: an unlisted sheet ships unstyled), so the walk
    // is checked against it instead: everything the entry ships, the walk must have found.
    const names = components.map(([n]) => n);
    const shipped = [...raw("styles/index.css").matchAll(/@import "\.\.\/components\/[^"]*?([^/"]+\.css)"/g)].map(
      (m) => m[1]!,
    );
    expect(shipped.length).toBeGreaterThan(3);
    for (const known of shipped) {
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

describe("the control contract is enforced, not remembered (§9; ENGINEERING §2.1)", () => {
  // The checkbox audit found two defects with the same shape — a component reaching past the
  // shared layer — and its fixes were mounted as CHECKBOX laws, which do not travel. These are
  // the second-value laws (ENGINEERING §6) for the contract itself, walked so Radio and Switch
  // inherit them on the day their stylesheets exist.

  it("a control that re-sources its fill declares the whole triple — a missing state paints transparent", () => {
    // The fill pipeline reads three sources (--kui-ct-fill-src, -src-hover, -src-active), all
    // registered inherits:false: a rule that re-points one and not the three ships a box whose
    // OTHER states resolve no source at all and paint transparent under the pointer. This was
    // prose in three stylesheets ("the trap", text-field.css / text-area.css / checkbox.css)
    // and a law nowhere. Per RULE, not per file: a file-level count would pass a state block
    // that re-sourced only hover.
    let blocks = 0;
    for (const p of allStylesheets()) {
      for (const body of sheet(p).split("}")) {
        const declarations = body.slice(body.indexOf("{") + 1);
        const declared = [
          /--kui-ct-fill-src\s*:/,
          /--kui-ct-fill-src-hover\s*:/,
          /--kui-ct-fill-src-active\s*:/,
        ].filter((r) => r.test(declarations)).length;
        if (declared > 0) blocks += 1;
        expect(declared, `${p}: a rule re-sources the fill partially:\n${declarations}`).toBeOneOf([
          0, 3,
        ]);
      }
    }
    // The negative control: the emphasis rungs alone re-source three times.
    expect(blocks).toBeGreaterThanOrEqual(3);
  });

  it("no component mentions a painted variable — a state remap rewrites ROLES, and it must reach every box", () => {
    // Checkbox audit defect (a): the resting box declared --kui-border-color directly, so the
    // invalid remap — which rewrites --tone-border and expects the paint to follow — could not
    // reach it, and an invalid checkbox rested with a healthy border. A component re-points the
    // role; only the shared layer touches the painted name. Mention, not declare, the same
    // stance as the stem law below: reading a painted name is the defect from the other side.
    for (const p of allStylesheets("components")) {
      expect(sheet(p), `${p} mentions --kui-border-color`).not.toContain("--kui-border-color");
    }
  });

  it("no stylesheet outside tokens.css DECLARES a look role — the axis has one home (§19)", () => {
    // Membership in a look family is CONSUMPTION of the role; a sheet that declared one
    // would be a second author of the app's dress. The two sanctioned exceptions are the
    // shared layer's state arms, which stand the field role down (`initial`) so a state
    // outranks the dress — an arm, not a value: nothing outside tokens.css may put a COLOUR
    // in a look role.
    for (const p of allStylesheets()) {
      const code = sheet(p).replace(/\/\*[\s\S]*?\*\//g, " ");
      for (const m of code.matchAll(/--look-[\w-]+\s*:\s*([^;]+);/g)) {
        expect(m[1]!.trim(), `${p} declares ${m[0]!.trim()}`).toBe("initial");
      }
      if (p.includes("components/")) {
        expect(code, `${p} declares a look role`).not.toMatch(/--look-[\w-]+\s*:/);
      }
    }
  });

  it("every component stylesheet the walk finds is shipped by the entry point", () => {
    // The reverse direction of "nothing ships a stylesheet the tests cannot see" below: that
    // law pins entry → suite, so a sheet the entry ships is one the laws see — but a component
    // .css the entry never @imports ships UNSTYLED while every walk-based law passes on it.
    // This was step one of the new-control checklist, and the only enforcement was memory.
    const entry = raw("styles/index.css");
    for (const p of allStylesheets("components")) {
      expect(entry, `${p} is not imported by styles/index.css`).toContain(`/${p.split("/").pop()!}"`);
    }
  });

  it("data-slot speaks only the SlotName union, in every sheet and every source", () => {
    // The shared layer keys rules on the attribute's presence AND its value: a control writing
    // data-slot="start" would take the wrapper layout and hosted geometry (presence) and
    // silently lose the pill-padding reset and the field's slot inset (value) — a partial,
    // invisible failure with no error anywhere. The union lives in system/axes.ts; this walks
    // everything shipped and asserts no other spelling exists.
    for (const p of allStylesheets()) {
      for (const m of sheet(p).matchAll(/\[data-slot="([^"]+)"\]/g)) {
        expect(SLOT_NAMES, `${p} keys on data-slot="${m[1]}"`).toContain(m[1]);
      }
    }
    for (const p of walkFiles("components", ".tsx").filter((f) => !f.includes(".test."))) {
      for (const m of raw(p).matchAll(/data-slot=\{?"([^"]+)"/g)) {
        expect(SLOT_NAMES, `${p} writes data-slot="${m[1]}"`).toContain(m[1]);
      }
    }
  });

  it("component dress never uses :is() — a state must outrank it, not tie with it", () => {
    // Checkbox audit defect (b), made structural (2026-08-06): its checked rule used :is(),
    // which KEEPS its arguments' specificity — tying with the shared invalid remap and
    // winning on source order, so a checked invalid checkbox looked healthy. :where() zeroes
    // the dress selector's weight, and the state arms (plain specificity, shared layer) then
    // outrank every component rule by construction. In a component sheet everything is
    // skeleton or dress, so the law is total there; the shared layer's own :is() use is
    // deliberate — its states are exactly what must carry weight.
    for (const p of allStylesheets("components")) {
      expect(sheet(p), `${p} uses :is() — dress that can tie with a state remap`).not.toContain(
        ":is(",
      );
    }
  });

  it("a component that ships a stylesheet ships its mounted laws — the file must exist", () => {
    // Decided 2026-08-06 (Kushagra): the 2026-08-03 standard's blind spot was structural —
    // nothing asserted a browser test FILE exists, so Spinner shipped CSS with zero mounted
    // laws and every walk-based law happily audited its stylesheet while its geometry claims
    // stayed prose. The law is about the file, deliberately: what the laws inside it must
    // assert cannot be walked, but "some exist" can be.
    for (const p of allStylesheets("components")) {
      const dir = p.slice(0, p.lastIndexOf("/"));
      const tests = walkFiles(dir, ".browser.test.tsx");
      expect(tests, `${dir} ships ${p.split("/").pop()!} but no browser test file`).not.toEqual(
        [],
      );
    }
  });

  it("every Base UI entry a component imports is pre-bundled for the browser suite (ENGINEERING §7)", () => {
    // An entry discovered mid-run is optimized in a second pass and holds a different React
    // than the page, so every hook inside it reads null — how @base-ui/react/input failed the
    // first time TextField mounted, with a stack that blames React. "Add the entry when you
    // add the component" was a prose rule; the walk makes it a law.
    const config = raw("../vitest.config.ts");
    for (const p of walkFiles("components", ".tsx").filter((f) => !f.includes(".test."))) {
      for (const m of raw(p).matchAll(/from "(@base-ui\/react\/[a-z-]+)"/g)) {
        expect(config, `${m[1]} is missing from optimizeDeps.include`).toContain(`"${m[1]}"`);
      }
    }
  });
});

describe("the mark family lives in the shared layer, once (§4, promoted 2026-08-06)", () => {
  // The box rules sat in checkbox.css under a comment saying the THIRD member would move
  // them (TextArea's rule for the field family). Radio and the slider thumb are the second
  // and third; this pins the promotion so the family cannot quietly re-grow per component —
  // which is exactly how four ladders in one visual weight class start to drift.

  it("the shared layer declares the box, the target, the resting identity and the ON state", () => {
    expect(recipes).toContain(".kui-mark {");
    expect(block(recipes, ".kui-mark {")).toContain("var(--kui-ct-mark)");
    // The family block is the UNDRESSED identity: the seal and the mark edge, and nothing from
    // the look axis (narrowed 2026-08-07 — a mark that IS a control is dressed, a mark that is
    // a PART of one is not). Both halves asserted: the family still owns the resting identity,
    // and that identity is still the mark edge.
    expect(block(recipes, ".kui-mark {")).toContain("--tone-border: var(--control-edge)");
    // And the dress is a SEPARATE rule, reached by the hosted-mark selector. Asserted here so
    // the narrowing cannot be undone by folding the two blocks back together — which would
    // silently re-dress the slider thumb.
    expect(recipes).toContain(".kui-mark:where(:not(.kui-control *)) {");
    expect(block(recipes, ".kui-mark:where(:not(.kui-control *)) {")).toContain(
      "--tone-border: var(--look-mark-border, var(--control-edge))",
    );
    expect(recipes).toContain(".kui-mark:where(:not(.kui-control *))::after");
    expect(recipes).toContain('.kui-mark:where([data-checked], [data-indeterminate])');
  });

  it("no component stylesheet sizes a mark's box or re-points the mark edge", () => {
    // A component may still READ the mark token for its own shape (Radio's circle is
    // calc(mark / 2)) or COMPUTE a different box from it (the switch's hosted width keeps
    // travel: mark, its own width and the hosted height in one expression); what it must not
    // do is restate the family's box AS its own.
    //
    // Both halves of this law were string-blind until audit 2026-08-08, and Switch is the
    // sheet that made both holes load-bearing:
    //  - the box half matched only a BARE `var(--kui-ct-mark)` after the colon, so
    //    `block-size: calc(var(--kui-ct-mark))` — the D4 defect verbatim, a 20x24 hosted
    //    checkbox — passed 57/57. It is read as a variable SET now: a sizing declaration
    //    whose only variables are the mark and its shifted sibling is a restatement,
    //    whatever arithmetic is wrapped around it.
    //  - the edge half grepped for `--control-edge`, but the family's edge is `--tone-border`
    //    POINTED at it (recipes.css), so a component re-points the edge by naming a token
    //    this law never looked for. It reads the declaration that actually carries the edge.
    const MARK_VARS = ["--kui-ct-mark", "--kui-ct-mark-up"];
    for (const p of allStylesheets("components")) {
      const css = sheet(p);
      for (const decl of css.matchAll(/(?:inline-size|block-size|width|height):\s*([^;]+);/g)) {
        const vars = [...decl[1]!.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]!);
        if (vars.length === 0) continue;
        expect(
          vars.every((v) => MARK_VARS.includes(v)),
          `${p} restates the mark box: ${decl[0]!.trim()}`,
        ).toBe(false);
      }
      expect(css, `${p} re-points the mark edge`).not.toContain("--control-edge");
      for (const decl of css.matchAll(/--tone-border:\s*([^;]+);/g)) {
        // The one argued exception (§4, §19): the switch's OFF state melts the edge into the
        // well, because a switch's resting identity is a channel felt for rather than a small
        // surface read — the same sentence that took it off the look axis. Removing the edge
        // instead of melting it would shrink the track 2px on every toggle. Named here rather
        // than merely unreached, the radius axis's own rule (e9d7e62).
        expect(
          p.endsWith("switch/switch.css") && decl[1]!.trim() === "var(--color-track)",
          `${p} re-points the mark edge: ${decl[0]!.trim()}`,
        ).toBe(true);
      }
    }
  });

  it("a mark inside another control never grows its own target — the container owns the question", () => {
    // Generalised from the slot-only exclusion when the slider thumb arrived: a thumb sits
    // inside a control whose whole box is already the target (the root rides the height
    // ladder), and a second expander is how the audit measured a target larger than the
    // field holding it (D4). The exclusion is structural — `.kui-control *` — so it covers
    // the slot case and the thumb case with one sentence.
    expect(recipes).toContain(".kui-mark:where(:not(.kui-control *))::after");
    expect(recipes).not.toContain(":not([data-slot] > *)");
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
    for (const p of allStylesheets("components")) {
      const name = p.split("/").pop()!;
      if (name === "spinner.css") continue;
      expect(sheet(p), `${name} restates the icon box`).not.toContain("--kui-ct-icon");
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
      const body = block(recipes, `[data-emphasis="${rung}"]`);
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
  it("lives in the shared layer, not in the component that happened to need it first", () => {
    // TextField is the first control that can be wrong, but Select, Combobox and NumberField
    // all can be. If this ever moves into a component's stylesheet the remap has become a
    // variant, which is the thing the system refuses.
    expect(recipes).toMatch(/\[data-invalid\]/);
    // Comments may DISCUSS it; only a rule would mean the remap had moved.
    expect(textField).not.toContain("invalid");
  });

  it("reads BOTH spellings — Base UI's inside a Field, the platform's standalone", () => {
    expect(recipes).toContain('[aria-invalid="true"]');
    expect(recipes).toContain("[data-invalid]");
  });

  it("reaches the wrapper pattern, where the state lands on a child", () => {
    // Without the :has() arm a field's border could never answer its own input's validity.
    expect(recipes).toMatch(/:has\(>\s*:is\(\[data-invalid\]/);
  });

  it("moves the box and NOTHING else — the value the user typed stays legible", () => {
    // Reversed 2026-08-04: the ring moves WITH the border now, both reading --invalid-edge.
    // This law previously forbade --focus-ring here, pinning the rule that the accent ring
    // measured 6.4x the weight of the error border it surrounded. What it still pins is the
    // real invariant: a state re-tones the BOX, never the content or the fill.
    const body = block(recipes, ".kui-control:is([data-invalid]");
    expect(body).toContain("--tone-border: var(--invalid-edge)");
    expect(body).toContain("--focus-ring: var(--invalid-edge)");
    for (const forbidden of ["--tone-label", "--tone-solid", "--tone-soft", "background"]) {
      expect(body).not.toContain(forbidden);
    }
  });
});

describe("material on a control: backdrop defense, three environments (§10)", () => {
  it("each material appears exactly seven times — three environments plus the field family's pane parts", () => {
    // Three environments, not three designs — the same shape the surface layer wears —
    // plus four mentions for the FIELD family's glass parts (2026-08-07): two selectors in
    // the shared origin rule and two in the per-thickness edge/rim rule, because a field
    // is bordered by identity and its glass wears the pane's own edge where a button,
    // borderless by rank, needs none.
    for (const m of GLASS_MATERIALS) {
      const occurrences = recipes.match(new RegExp(`\\[data-material="${m}"\\]`, "g")) ?? [];
      expect(occurrences).toHaveLength(7);
    }
  });

  it("backdrop-filter exists only inside @supports, with the near-sealed fallback outside it", () => {
    const guardStart = recipes.indexOf("@supports (backdrop-filter");
    expect(guardStart).toBeGreaterThan(-1);
    expect(recipes.slice(0, guardStart)).not.toContain("backdrop-filter:");
    expect(recipes.slice(0, guardStart)).toContain("--material-opaque-alpha");
  });

  it("prefers-reduced-transparency forces the near-seal, kills the blur, and wins by cascade order", () => {
    const media = from(recipes, "@media (prefers-reduced-transparency: reduce)");
    expect(media).toContain("--material-opaque-alpha");
    expect(media).toContain("backdrop-filter: none");
    expect(recipes.indexOf("@media (prefers-reduced-transparency")).toBeGreaterThan(
      recipes.indexOf("@supports (backdrop-filter"),
    );
  });

  it("material is a fill MODIFIER: every state derives from the rung's own source (§10)", () => {
    // The veil is the fill the rung already chose, mixed toward transparent at the thickness
    // alpha — tone and loudness ride into the glass for free. Every state a control can paint
    // re-derives from the same source, in the recipe and in both opaque environments alike:
    // a missed one would flash the opaque page-designed fill over glass.
    const supports = from(recipes, "@supports (backdrop-filter");
    for (const m of GLASS_MATERIALS) {
      const body = block(supports, `[data-material="${m}"]`);
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
      recipes.slice(0, recipes.indexOf("@supports")),
      from(recipes, "@media (prefers-reduced-transparency"),
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
    const materialBlock = from(recipes, '[data-material="thin"]');
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
    const entry = sheet("styles/index.css");
    const scaffold = sheet("test/browser.tsx");
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
    const guardStart = recipes.indexOf("@media (hover: hover)");
    expect(guardStart).toBeGreaterThan(-1);
    const guardEnd = recipes.indexOf("\n}", recipes.indexOf("}", guardStart));
    const outside = recipes.slice(0, guardStart) + recipes.slice(guardEnd + 2);
    expect(outside).not.toContain(":hover");
    // Press is the only feedback a touch device gets; guarding it would remove it entirely.
    expect(outside).toContain(":active");
  });

  it("no transition ships until the motion system is designed (§8, 2026-08-03)", () => {
    // Every state change is instant on both pointer worlds. When motion lands, this law is
    // replaced by the motion system's own — and press must stay instant: an eased press
    // loses the race against a ~60ms tap and the control reads as dead on a phone.
    expect(recipes).not.toContain("transition");
  });

  it("disabled remaps the family and never reaches for opacity (§8)", () => {
    const body = block(recipes, ".kui-control[data-disabled]");
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
  const sheets = allStylesheets().map((f) => [f, sheet(f)] as const);

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

  it("every box-shadow reads a world chrome role — depth is never a component's own idea", () => {
    // Depth belongs to the world (§5): surfaces cast through --kui-surface-chrome, and since
    // 2026-08-07 raised controls cast through --kui-control-chrome (the four-worlds frame,
    // §19 — the deliberate reversal of "a button stays flat"). What no stylesheet may do is
    // invent its own depth: the moment a rule names --shadow-N directly, the fenced resource
    // has become an axis again (§13).
    let found = 0;
    for (const [file, css] of sheets) {
      for (const match of css.matchAll(/box-shadow:\s*([^;]+);/g)) {
        found += 1;
        expect(match[1]!, `${file} paints a shadow of its own`).toMatch(
          /--kui-(surface-chrome|ct-cast)/,
        );
      }
      expect(css, `${file} reaches past the chrome to the palette`).not.toContain("--shadow-");
    }
    // Exactly five declarations — the surface layer's, the control layer's, the field
    // family's (the third flip: a field is a raised control and casts the control row,
    // 2026-08-07), and the two grips' ALWAYS-ON casts (the slider thumb's, and the switch
    // thumb's since 2026-08-08 — one exception inherited with the role, not a second one:
    // a grip that does not sit above its rail stops reading as a grip, so both read the
    // palette row's VALUE rather than the world switch). A SIXTH consumer appearing is a
    // decision, not a drift, and it should fail here first.
    expect(found).toBe(5);
    // The control indirection stays honest end-to-end: the cast the button paints is the
    // rung's statement, and a lit rung's cast IS the world chrome — nothing in between may
    // substitute its own value.
    const recipesCss = sheets.find(([file]) => file.endsWith("recipes.css"))![1];
    expect(recipesCss).toContain(
      "--kui-ct-cast: var(--kui-ct-cast-glass, var(--kui-control-chrome, none))",
    );
    expect(recipesCss).toContain("--kui-ct-light: var(--kui-control-light, none)");
  });
});

describe("tokens only: no raw length literals in a hand-authored stylesheet (non-negotiable)", () => {
  // "No raw px in component CSS; every value resolves through a --* token." This was true of
  // every length except the chrome widths, which sat as `1px` / `2px` literals in recipes.css
  // and surfaces.css — and the consequence was not stylistic: they were the only geometry in a
  // control that ignored --scale, so a bordered button at scale 2 doubled its height, padding,
  // radius and type and kept a 1px hairline. The rule is a law now, not a habit.
  it("holds for every hand-authored stylesheet in the package", () => {
    const files = allStylesheets();
    expect(files.length).toBeGreaterThan(2);
    for (const file of files) {
      const withoutDescriptors = sheet(file)
        // `initial-value` is a REQUIRED descriptor of an @property registration, not a design
        // value: a registered <length> must declare the value it computes to when the cascade
        // gives it nothing, and that is 0px by definition. Exempting the descriptor rather than
        // the whole @property block, so a real literal inside one still fails.
        .replace(/^\s*initial-value:[^;]*;/gm, "");
      const literals = withoutDescriptors.match(/(?<![-\w(#.])\d+(\.\d+)?px\b/g) ?? [];
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

  const layoutOwned = names(stripped(raw("system/layout.css")));

  it("the layout mechanism really does own a large terse set — the premise, not an assumption", () => {
    expect(layoutOwned.size).toBeGreaterThan(100);
    for (const stem of ["--kui-h", "--kui-px", "--kui-py"]) expect(layoutOwned.has(stem)).toBe(true);
  });

  for (const path of allStylesheets()) {
    it(`${path.split("/").pop()} names nothing the layout mechanism owns`, () => {
      const shared = [...names(sheet(path))].filter((n) => layoutOwned.has(n));
      expect(shared, `${path} shares stems with layout.css`).toEqual([]);
    });
  }
});
