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
import { DEPTHS, themeAxes } from "../theme/theme.tsx";

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
      // THE RUNG SCAN LOOKS PAST THE WEIGHT LADDER, and it has to (2026-08-25). `medium` names
      // two unrelated things in this system: an emphasis rung, which a component sheet must
      // never branch on, and `--font-weight-medium`, which is a step on the type ladder and
      // has nothing to do with loudness. A bare substring match cannot tell them apart, so it
      // made ONE of the three weight tokens unusable in every component stylesheet — a trap
      // that fires on the author, not on the fault, and it fired the first time a sheet asked
      // for a medium weight. Narrow by construction: the substitution removes the token NAME
      // and nothing else, so `--tone-medium`, `--accent-medium` and `[data-emphasis="medium"]`
      // are all still caught, which is what the sabotage pass confirmed.
      const withoutWeights = css.replaceAll(/--font-weight-[a-z]+/g, "");
      for (const rung of RUNGS) expect(withoutWeights).not.toContain(rung);
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

  it("no law restates an axis's value list — the walk finds the literal wherever it hides", () => {
    // 2026-08-16. Eight law files each carried their own two-value depth array and six their
    // own three-value thickness array — spelled out, as literals, which is why this comment
    // may not spell them: the walk below reads THIS file too, and a law whose own prose
    // trips it is a law that would have to exempt itself. (It did, on the first run.)
    // So the axes were "exhaustively" covered by fourteen private copies of a claim about
    // how many values exist. Widen either axis and
    // every one of those loops keeps passing while covering the new value with nothing — the
    // 2026-08-03 lesson (a law one indirection short of the thing that can be wrong) in its
    // cheapest form. `depth` owns its list beside its union in theme.tsx, the thicknesses have
    // owned one in axes.ts since that file existed, and test/browser.tsx re-exports both.
    //
    // The law reads the SOURCE rather than the values: a list that agrees with the export
    // today is exactly the list that will silently disagree tomorrow, so the assertion is
    // that no second copy exists at all.
    const axisLists: [string, readonly string[]][] = [
      ["depth", DEPTHS],
      ["material thickness", GLASS_MATERIALS],
    ];
    for (const p of walkFiles(".", ".test.ts").concat(walkFiles(".", ".test.tsx"))) {
      // The two files that legitimately declare them, and nowhere else.
      if (p.endsWith("test/browser.tsx")) continue;
      const src = stripped(raw(p));
      for (const [axis, values] of axisLists) {
        for (const order of [values, [...values].reverse()]) {
          const literal = order.map((v) => `"${v}"`).join(", ");
          expect(
            src,
            `${p} restates the ${axis} list — import it (browser laws: test/browser.tsx; ` +
              `node laws: system/axes.ts, theme/theme.tsx)`,
          ).not.toContain(literal);
        }
      }
    }
  });

  it("every axis value the table offers is one the shipped CSS implements", () => {
    // The companion to theme.browser.test.tsx's narrowed law, and the half a MOUNT cannot
    // settle: `<Theme depth="lit">` stamps `data-depth="lit"` perfectly happily, because an
    // attribute is written verbatim whether or not a rule reads it. A browser law asserting
    // "the attribute came back equal" therefore passed a sabotage that added a third depth
    // rung — which is exactly the failure `themeAxes` was created to make impossible. Whether
    // a value is IMPLEMENTED is a question about the emitted stylesheet, so it is asked here.
    //
    // Two named exceptions, both instructions rather than values, both asserted to be absent
    // rather than skipped silently: `appearance: inherit` stamps nothing at all, and
    // `material: solid` is the seal — the rung where the material rules do not apply, which is
    // why it writes no attribute either.
    const ATTR: Record<string, string> = {
      appearance: "data-appearance",
      density: "data-density",
      radius: "data-radius",
      contrast: "data-contrast",
      pointer: "data-pointer",
      depth: "data-depth",
      material: "data-material",
    };
    const ABSENT = new Set(["appearance:inherit", "material:solid"]);
    const all = [raw("tokens/tokens.css"), ...allStylesheets().map((p) => raw(p))].join("\n");
    let checked = 0;
    for (const [axis, values] of Object.entries(themeAxes)) {
      const attr = ATTR[axis]!;
      for (const value of values as readonly string[]) {
        const selector = `[${attr}="${value}"]`;
        if (ABSENT.has(`${axis}:${value}`)) {
          expect(all, `${selector} exists, but ${axis}=${value} is documented as stamping nothing`).not.toContain(selector);
          continue;
        }
        expect(all, `${axis}=${value} is offered by themeAxes and no rule reads ${selector}`).toContain(selector);
        checked += 1;
      }
    }
    // The vacuity guard the first version needed and did not have: an empty or mis-keyed walk
    // would satisfy every assertion above by making none of them. 20 is today's exact count
    // (surfaceLook's two values left with the axis, 2026-08-20); the floor sits just under it.
    expect(checked).toBeGreaterThanOrEqual(20);

    // AND THE REVERSE, because the arm above only catches a value the table INVENTS. Dropping
    // one is the likelier drift and it fails nothing: an axis whose list has lost a value is
    // simply an axis that gets walked less, and every loop over it keeps passing. Demonstrated
    // — deleting `inherit` from the appearance list left this law green until this arm existed.
    // The emitted stylesheet is the independent second source: a selector reading a value the
    // table does not offer means one of the two is wrong, and neither can be trusted to notice.
    // `on-glass` is the one styled value no axis offers, and that is the design (§10,
    // 2026-08-16): it is RESOLVED from nesting — a member whose backdrop a pane below already
    // spent — and nothing may ask for it. A Theme that could set it would be re-introducing
    // glass-on-glass through the front door. Exempted by name, so the exemption is a decision
    // in this file rather than a hole in the walk.
    const RESOLVED_ONLY = new Set(["data-material:on-glass"]);
    for (const [axis, attr] of Object.entries(ATTR)) {
      const offered = new Set(themeAxes[axis as keyof typeof themeAxes] as readonly string[]);
      for (const m of all.matchAll(new RegExp(`\\[${attr}="([a-z-]+)"\\]`, "g"))) {
        const value = m[1]!;
        if (RESOLVED_ONLY.has(`${attr}:${value}`)) continue;
        expect(
          offered.has(value),
          `${attr}="${value}" is styled by the shipped CSS and themeAxes.${axis} does not offer it`,
        ).toBe(true);
      }
    }
    // And the exemption must be REAL: a resolved-only value that no stylesheet reads is a
    // stale carve-out, which is how an exemption list rots into a blindfold.
    for (const key of RESOLVED_ONLY) {
      const [attr, value] = key.split(":");
      expect(all, `${key} is exempted but no rule reads it`).toContain(`[${attr}="${value}"]`);
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
      "--tone-border: var(--dress-mark-edge, var(--control-edge))",
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
      // The one argued exception (§4, §19): the switch's OFF state melts the edge into the
      // well, because a switch's resting identity is a channel felt for rather than a small
      // surface read — the same sentence that took it off the look axis. Removing the edge
      // instead of melting it would shrink the track 2px on every toggle. Named here rather
      // than merely unreached, the radius axis's own rule (e9d7e62).
      //
      // TWO spellings, because the melt has to survive a state: at rest it is the well role,
      // and under `disabled` it is whatever the family's arm dimmed the well TO (--tone-soft),
      // since the shared arms outrank the resting melt and were drawing a hairline on the dead
      // switch that the live one does not have. Both are the same sentence — the edge is the
      // fill — so both are allowed and nothing else is.
      const MELT = ["var(--color-track)", "var(--tone-soft)"];
      for (const decl of css.matchAll(/--tone-border:\s*([^;]+);/g)) {
        expect(
          p.endsWith("switch/switch.css") && MELT.includes(decl[1]!.trim()),
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

describe("the row family lives in the shared layer, once (§21, declared with Menu 2026-08-09)", () => {
  // Declared family-first rather than promoted on the third member (the mark family's own
  // argument): §11 had already named menu item, command item, list item and sidebar button
  // as one family, and four separately designed rows in one visual weight class drift.

  it("the shared layer declares the box, the lit state and the checked ink", () => {
    expect(recipes).toContain(".kui-row {");
    // Full-width and start-aligned — the two facts that make a control a row. Geometry is
    // deliberately ABSENT: the row rides the control cells through the ordinary size join,
    // so a height or padding declared here would be the drift this family exists to prevent.
    const box = block(recipes, ".kui-row {");
    expect(box).toContain("inline-size: 100%");
    expect(box).toContain("justify-content: flex-start");
    // THE NOTCH LEFT THE FAMILY BLOCK (2026-08-26 — the exception flipped owners). The
    // stand-down to line + inset was judged on a MENU (2026-08-09) and sat here as the
    // family default only because Menu was the first member; a standing row (Row, Tree,
    // nav) rides the ladder, so `.kui-row` itself may declare NO height in either
    // direction — the skeleton's min-height applies. The block padding stays the family's
    // breathing and cedes the border term. Everything else still arrives through the size
    // join: no inline padding, no height, no font size may be re-declared here.
    expect(box).not.toContain("min-height");
    expect(box).toContain("padding-block: calc(var(--kui-ct-row-inset) - var(--border-width))");
    expect(box).not.toMatch(/min-block-size|block-size:|[^-]height: var|padding-inline|font-size/);
    // The notch lives in the FLOATING-scoped rule, and only there: keyed on the panel class
    // whose meaning is "hugs rows", so the concentric-corner set and the notch set are one
    // selector. Both facts asserted — the stand-down present in the scoped block, and the
    // corner re-point scoped the same way (a standing row wears the join's control corner,
    // which at `full` is the capsule of the box it actually has).
    const floatingRow = block(recipes, ".kui-floating-rows .kui-row {");
    // FLOORED rather than `auto` (2026-08-26 audit): the notch stands the control HEIGHT down,
    // which is its whole point, and `auto` stood §16's locked 24 down with it — fine + compact
    // + size 1 rendered a 20px row. The floor is a token, never a literal, so the tokens-only
    // rule holds and the number has one home.
    expect(floatingRow).toContain("min-height: var(--target-min)");
    expect(floatingRow, "the stand-down may not come back").not.toContain("min-height: auto");
    expect(recipes).toContain("--kui-ct-radius: var(--kui-ct-row-radius)");
    // The old unscoped spellings may not return: the bare-family re-point handed the row
    // capsule to standing rows (15px of corner on a 32px box, measured 2026-08-26).
    expect(recipes).not.toContain(".kui-control.kui-row {");
    // The lit row reads the state attribute (keyboard and pointer unified by Base UI), and
    // a submenu's open trigger stays lit by the same rule.
    expect(recipes).toContain(".kui-row[data-highlighted]:not([data-disabled])");
    expect(recipes).toContain(".kui-row[data-popup-open]:not([data-disabled])");
    // Checked speaks accent through the INDICATOR (reversed 2026-08-09 from whole-row
    // --accent-label ink: a text ink lives at steps 11-12 and read as dark emphasis, while
    // a glyph owes only the non-text floor). The precedence fact survives the move: the
    // accent is named directly, not a tone role, so the disabled arm's remap cannot reach
    // it — the :not([data-disabled]) on the ROW is what stands a dead tick down to the
    // dimmed inherited ink.
    //
    // --accent-GLYPH since 2026-08-23. The clause this law used to pin said the tick wears
    // "the mark family's own bright solid" and justified it by the non-text floor; measured,
    // that solid is one hex in both appearances and misses the floor on the dark page
    // (|Lc| 43.4 against 45). Same principle, the value that actually keeps it.
    const checked = ".kui-row:where(:not([data-disabled])) > [data-slot]:where([data-checked], [data-selected])";
    expect(recipes).toContain(checked);
    expect(block(recipes, checked)).toContain("color: var(--accent-glyph)");
    // The solid is gone from this rule, not merely joined by the glyph — a rule naming both
    // would satisfy the line above while still painting whichever came second.
    expect(block(recipes, checked)).not.toContain("var(--accent-solid)");
    // And no row rule paints the LABEL accent anymore — the reversal in the negative.
    expect(block(recipes, checked)).not.toContain("--kui-ct-label-color");
    expect(recipes).not.toContain("--kui-ct-label-color: var(--accent-label)");

    // Under contrast="high" that tick stands down with the fill it sits on (2026-08-10). The
    // measured case that forced it was the GREY accent then shipping: one value in both modes,
    // landing near-black in light and near-white in dark on the solid rung, at 2.65:1 against a
    // 3:1 floor. Accent is blue again since 2026-08-16, so that particular number no longer
    // describes the default — but the rule is not about the default: `lowChromaThreshold` is
    // keyed on chroma, not on a family name, so any desaturated brand walks straight back into
    // it. Kept with its history rather than restated for today's palette, and the law below is
    // palette-independent by construction. It has to WIN over
    // the rule above without being reachable at rest, which is specificity plus the state
    // guard — assert both, because either one alone is a different rule.
    //
    // EVERY SLOT since 2026-08-23 (ultracode audit), not just the indicator. The narrow list
    // was correct while a row's other slots reached the contrast ink by INHERITING the label's
    // colour; the same day's `.kui-row > [data-slot="leading"]` rule took the icon out of that
    // chain, and a lit row's icon then painted the glyph ON the solid fill it sits on — Lc 0.0
    // in 14 of 20 tone x appearance cells. Pinning the value, not the spelling: the assertion
    // below reads the SLOT LIST rather than the whole selector text, so widening the state
    // guard later does not kill this law the way pinning a full selector has killed three
    // before (`block()`'s own 2026-08-20 note).
    const litSlot =
      '[data-contrast="high"]\n  .kui-row:where([data-highlighted], [data-popup-open]):not([data-disabled])\n  > [data-slot]';
    expect(recipes).toContain(litSlot);
    expect(block(recipes, litSlot)).toContain("color: var(--tone-contrast)");
    // And it is not narrowed back to the indicator — the defect, stated so it cannot return
    // quietly. A `:where([data-checked]...)` qualifier after `[data-slot]` is exactly what
    // shipped the Lc 0.0 icon.
    expect(recipes, "the lit-row arm is back to indicators only").not.toContain(
      `${litSlot}:where([data-checked], [data-selected])`,
    );
  });

  it("a row reads CONTENT ink, and its rule sits after the emphasis ladder (§15, §21)", () => {
    // The weight reversal's other half (2026-08-09): --tone-label is the button-label ink
    // (#454648 neutral, #6c3230 destructive — a grey and a brown), and a row is a line in a
    // list you read. Both facts are the law, because the first spelling declared the ink in
    // the box block and SILENTLY LOST to the quiet rung at the same (0,1,0).
    //
    // The anchor is the rung's DEFINITION — `[data-emphasis="quiet"] {`, brace included —
    // because a bare attribute search matches any compound selector that mentions the rung,
    // and the 2026-08-26 half-step rules mention it 250 lines earlier: anchored there, the
    // slice's first ".kui-row {" landed inside ".kui-control.kui-row {" (a substring hit)
    // and this law failed on a radius block it was never about.
    const ink = ".kui-row {";
    const rung = recipes.indexOf('[data-emphasis="quiet"] {');
    expect(rung, "the quiet rung's definition is gone").toBeGreaterThan(-1);
    expect(block(recipes.slice(rung), ink)).toContain("--kui-ct-label-color: var(--tone-ink)");
    expect(recipes.lastIndexOf(ink)).toBeGreaterThan(rung);
    // The box block must NOT also declare it — one home, and the losing spelling stays gone.
    expect(block(recipes, ".kui-row {")).not.toContain("--kui-ct-label-color");
  });

  it("the disabled arm stands down BOTH ink vocabularies (§21)", () => {
    // A remap that covers one of two dims whichever controls happen to use that one — the
    // slider-handle shape the 2026-08-07 audit caught. Rows read --tone-ink now, so the arm
    // owes it the same stand-down it always gave --tone-label.
    const arm = block(recipes, ".kui-control[data-disabled]:not([data-loading]),");
    for (const role of ["--tone-label", "--tone-ink"]) {
      // The dead ink is a ROLE since 2026-08-22, not a step written by hand: this file wrote
      // `--neutral-8` five times and surfaces.css could not write it at all, because a rung
      // there may not name a tone family. The law reads the role rather than the step for the
      // same reason the code does — a re-priced dead ink must not need five edits and a law.
      expect(arm, `the disabled arm leaves ${role} live`).toContain(`${role}: var(--disabled-ink)`);
    }
    // And nothing here writes the step by hand any more, which is what makes "one home" true
    // rather than merely tidy. Comments are stripped, so the paragraph explaining the history
    // does not satisfy its own law.
    expect(recipes, "the dead ink has one home").not.toContain("--neutral-8)");
  });

  it("the row stand-down sits AFTER the shared hover rule — it wins on order, not weight", () => {
    // The comment here used to claim (0,4,0) over (0,3,0). It is a TIE: `:not()` takes the
    // specificity of its most specific argument rather than summing its list, so both rules
    // are (0,3,0) and the later one wins. The arithmetic was standing in for a guarantee
    // nothing checked; this checks it. Anchored through indexOf on strings proven present,
    // because a missing anchor would otherwise make the comparison pass at -1.
    const shared = ".kui-control:hover:not([data-disabled], [data-loading])";
    const rowDown = ".kui-row:hover:not([data-highlighted], [data-disabled], [data-loading])";
    expect(recipes, "the shared hover rule is not where this law thinks").toContain(shared);
    expect(recipes, "the row stand-down is not where this law thinks").toContain(rowDown);
    expect(recipes.indexOf(rowDown)).toBeGreaterThan(recipes.indexOf(shared));
  });

  it("rows opt out of raw hover, inside the one guard — the highlight is the single source", () => {
    // The stand-down must live INSIDE the (hover: hover) block: outside it, the rule would
    // repaint the rest fill on touch devices' synthesized hover, which is exactly the stuck
    // state the guard exists to prevent. Read positionally against the guard's close.
    const guardStart = recipes.indexOf("@media (hover: hover)");
    expect(guardStart).toBeGreaterThan(-1);
    const guardEnd = recipes.indexOf("\n}", guardStart);
    const guard = recipes.slice(guardStart, guardEnd);
    expect(guard).toContain(".kui-row:hover:not([data-highlighted], [data-disabled], [data-loading])");
    // And it stands DOWN to the rest fill — not a new colour, not transparent (quiet's rest
    // is transparent today, but the rule must keep saying "rest", not restating its value).
    const standDown = block(recipes, ".kui-row:hover:not([data-highlighted], [data-disabled], [data-loading])");
    expect(standDown).toContain("background-color: var(--kui-ct-fill, var(--kui-ct-fill-src))");
  });

  it("no component stylesheet re-grows the family — the box and the lit state stay here", () => {
    for (const p of allStylesheets("components")) {
      const css = sheet(p);
      expect(css, `${p} restates the row box`).not.toContain(".kui-row {");
      expect(css, `${p} restates the lit state`).not.toContain("[data-highlighted]");
    }
  });
});

describe("the icon box is a mechanism, declared once (§4, ENGINEERING §4)", () => {
  it("no component restates it — including for adornments in a slot wrapper", () => {
    // A field's icons sit inside `[data-slot]`, so they are grandchildren of the control and
    // the bare `.kui-control > svg` rule misses them. The fix belongs in the shared layer, not
    // in a fourth copy of three declarations when Select ships. Walked like the no-axis law
    // (audit D14), with TWO exemptions, each consuming the ladder rather than restating it:
    // spinner.css because the spinner IS the icon, so reading the icon box is its job; and
    // tree.css because the indent DERIVES from the icon box (§33 — one level is one glyph
    // box, so the ladder is the indent's input, and a private indent ladder would be the
    // invented number the derivation exists to avoid). Neither SIZES an adornment.
    expect(recipes).toContain("[data-slot] > svg");
    for (const p of allStylesheets("components")) {
      const name = p.split("/").pop()!;
      if (name === "spinner.css" || name === "tree.css") continue;
      expect(sheet(p), `${name} restates the icon box`).not.toContain("--kui-ct-icon");
    }
  });
});

describe("the shared layer carries the variation, once (§2)", () => {
  it("every rung's RESTING recipe is defined exactly once; glass arms are counted, not free", () => {
    // Re-structured 2026-08-19 (the 2026-08-08 lesson, relearned): this law spent two days
    // as a tally — {loud: 10, medium: 3, quiet: 1} — which fails on any legitimate refactor
    // and passes on ten wrong arms, with only its own comment standing between the two. The
    // claim the tally had buried is structural and is what gets asserted now: the RESTING
    // definition — the bare `[data-emphasis="X"] {` rule — exists exactly once per rung.
    // Every other mention is a compound arm (a glass re-pricing, a press key), and an arm's
    // correctness is each arm's own mounted law's job, not a census's.
    for (const rung of RUNGS) {
      const resting = recipes.match(new RegExp(`^\\[data-emphasis="${rung}"\\] \\{`, "gm")) ?? [];
      expect(resting, `${rung}'s resting definition`).toHaveLength(1);
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
  it("each material appears exactly eight times — three environments plus the pane parts", () => {
    // Three environments, not three designs — the same shape the surface layer wears — plus
    // the mentions for the glass PANE PARTS: two selectors in the field family's shared
    // origin rule, and three in the per-thickness edge/rim rule (2026-08-16, up from two).
    //
    // The button joined that rule when the rim grew from a 1px edge catch into the lab's
    // four-layer lighting. It had been excluded outright rather than composed, because
    // `background-image` on a button is already spoken for by the elevated world's gradient
    // catch — so a glass Button wore no rim at all, while every glass button in the lab wears
    // one. Both layers are listed now, which is legal exactly where it is not for a shadow:
    // `none` is a valid background-image layer, and that asymmetry is why §10 keeps the rim
    // out of the shadow list to begin with.
    // Re-structured 2026-08-19: the tally this held (8, then 16, then 17 — three bumps in
    // two days, each with a paragraph naming its arms) is the count anti-pattern the
    // 2026-08-08 audit retired. The claim that matters is SYMMETRY: the three thicknesses
    // are one recipe at three strengths, so every arm that names one must name all three —
    // a merge that leaves one thickness reading another's tokens breaks the equality, while
    // a refactor that splits an arm for all three moves the counts together and passes.
    const counts = GLASS_MATERIALS.map(
      (m) => (recipes.match(new RegExp(`\\[data-material="${m}"\\]`, "g")) ?? []).length,
    );
    expect(counts[0], "no glass arms at all").toBeGreaterThan(0);
    expect(new Set(counts).size, `the thicknesses diverged: ${GLASS_MATERIALS.join("/")} = ${counts.join("/")}`).toBe(1);
  });

  it("a pressed loud glass control consults the GLASS active chain first (2026-08-19)", () => {
    // The mounted half (button.browser) proves the faded press rows exist and differ from
    // the rest rows; this is the consumption half — the press rule must actually read the
    // glass-active value, or the rows resolve for nobody and the pressed glass cast is the
    // resting one again (the exact defect, audit 2026-08-18).
    expect(recipes).toContain(
      "--kui-ct-cast: var(--kui-ct-cast-glass-active, var(--kui-ct-cast-glass, var(--kui-control-chrome-active, none)));",
    );
    // And every thickness declares the active glass value beside its resting one.
    for (const m of GLASS_MATERIALS) {
      expect(recipes).toContain(
        `--kui-ct-cast-glass-active: var(--kui-control-pool, 0 0 0 0 transparent), var(--kui-control-chrome-active-${m}, 0 0 0 0 transparent);`,
      );
    }
  });

  it("a glass CONTROL is lit without the pane's wash, and keeps the world's catch under it", () => {
    // Two defects, one rule. First: `background-image` on a button is already spoken for by
    // the elevated world's gradient catch, so the button was excluded from the rim rule
    // outright rather than composed into it — a glass Button wore no lighting at all.
    //
    // Second, and the reason a control takes its OWN recipe: a pane's fill is a near-white
    // veil, so a broad white bloom and sheen read as light lying on it. A control's fill is
    // its IDENTITY, and the same two layers read as that identity fading — a loud accent
    // button under the pane recipe measured pale blue with a halo. Grain and the edge catch
    // are the material; the wash is the pane's.
    const supports = from(recipes, "@supports (backdrop-filter");
    for (const m of GLASS_MATERIALS) {
      const body = block(supports, `.kui-button:where([data-material="${m}"])`);
      expect(body, `a glass button has no ${m} lighting`).toContain(`var(--material-${m}-rim-control, none)`);
      expect(body, "the world's catch was displaced by the lighting").toContain("var(--kui-ct-light, none)");
    }
  });

  it("the control recipe is the pane's minus the wash — same grain, same edge, no bloom", () => {
    // Asserted as a RELATIONSHIP, not two independent value checks: the two recipes must
    // share their texture and their edge and differ only in the wash, or "the control's
    // lighting is the pane's minus the wash" becomes two recipes free to drift apart.
    const tokensCss = raw("tokens/tokens.css");
    for (const scope of ['[data-appearance="light"]', '[data-appearance="dark"]']) {
      const body = block(tokensCss, scope);
      const valueOf = (name: string) => {
        const line = body.split("\n").find((l) => l.includes(`${name}:`));
        if (!line) throw new Error(`no ${name} in ${scope}`);
        return line.slice(line.indexOf(":") + 1).trim();
      };
      for (const m of GLASS_MATERIALS) {
        const pane = valueOf(`--material-${m}-rim`);
        const control = valueOf(`--material-${m}-rim-control`);
        expect(control, `${scope} ${m}: the control lost the grain`).toContain("feTurbulence");
        expect(control, `${scope} ${m}: the control kept the bloom`).not.toContain("radial-gradient");
        expect(control, `${scope} ${m}: the control kept the sheen`).not.toContain("linear-gradient(180deg");
        const edge = (v: string) => v.slice(v.lastIndexOf("linear-gradient(rgb"));
        expect(edge(control), `${scope} ${m}: the edges diverged`).toBe(edge(pane));
        expect(pane, "the pane lost its wash").toContain("radial-gradient");
      }
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
      // Named at the RULE, not by the first substring that happens to match (2026-08-17):
      // the pool arm is a `:where(thin, regular, thick)` list declared above the per-thickness
      // blocks, so a substring search found a body holding one unrelated declaration and this
      // law reported the veil missing for two of the three materials. A law that has to guess
      // which rule it meant is one rename away from measuring nothing.
      const body = block(supports, `.kui-control[data-material="${m}"] {`);
      // Control-scale material (2026-08-17): a control prices the ladder at its own box, so
      // the alpha is the CONTROL cell — and it is ONE alpha across rest/hover/active, because
      // on glass hover is light (the filter's hover variant), never a heavier veil. The
      // states still derive from the rung's own -src chain: tone rides in through the SOURCE.
      expect(body).toContain(
        `--kui-ct-fill: color-mix(in srgb, var(--kui-ct-fill-src) var(--material-${m}-control-alpha), transparent)`,
      );
      expect(body).toContain(
        `--kui-ct-fill-hover: color-mix(in srgb, var(--kui-ct-fill-src-hover) var(--material-${m}-control-alpha), transparent)`,
      );
      expect(body).toContain(
        `--kui-ct-fill-active: color-mix(in srgb, var(--kui-ct-fill-src-active) var(--material-${m}-control-alpha), transparent)`,
      );
      // The lens is PREPENDED to the material's chain and never replaces it (§10,
      // 2026-08-16): `var(--kui-lens, )` is empty on every surface that is not glass and in
      // every engine that cannot render an SVG filter in a backdrop-filter, so the chain the
      // stylesheet declares is what those get. Both halves asserted — the empty fallback is
      // what makes the lens additive, and a lens spelled without it could subtract glass.
      expect(body).toContain(`backdrop-filter: var(--kui-lens, ) var(--material-${m}-control-filter)`);
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
    //
    // ONE sanctioned exception since 2026-08-19: the opaque-twin re-point, a declaration of
    // the exact shape `--X: var(--X-solid)` — the same rung said opaquely, because the veil
    // multiplies an alpha source (audit 2026-08-18). It renames no rung, changes no pairing
    // and picks no colour, so it is stripped before the assertion rather than allowed
    // through it: a material block naming any tone role in any OTHER shape still fails.
    const materialBlock = from(recipes, '[data-material="thin"]').replace(
      /--([\w-]+): var\(--\1-solid\);/g,
      "",
    );
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

  it("no component source attaches an interaction-time handler (ENGINEERING §1.5)", () => {
    // REWRITTEN 2026-08-17 (drift audit #24): the law above asserts that :hover appears in a
    // stylesheet, which was never in doubt — it stayed green if every component also added a
    // pointermove handler, so the claim "no JS at interaction time is CHECKABLE" was itself
    // unchecked. This half reads the component SOURCES for the thing that could actually
    // breach it: a hover/move/enter handler, or an interaction-event listener. The named
    // exemptions are the rule's own doctrine, each with its recorded reason — anything new
    // failing here is a decision, not a cleanup.
    const EXEMPT: Record<string, readonly string[]> = {
      // The caret-on-click contract (§4): a click on the wrapper's padding must focus the
      // input. That is a POINTER-DOWN commitment, not per-frame interaction work.
      "components/text-field/text-field.tsx": ["onMouseDown"],
      // The same contract, same reason (2026-08-26): TextArea grew the same wrapper on
      // 2026-08-25 and the debt arrived with the anatomy — the wrapper carries the padding
      // and paints the text cursor over it, and a <span> cannot take focus, so a press in
      // that band landed nowhere. One pointer-down commitment, no per-frame work.
      "components/text-area/text-area.tsx": ["onMouseDown"],
      // The floating layer's seam (§20/§22): the entry runner holds the page during the
      // opening frames and observes its own transitions — mount/flight machinery, the seam
      // the doctrine names, never per-frame pointer tracking.
      "system/floating.tsx": ["addEventListener"],
      // The lens builds on mount and resize (§10's stated seam), never on pointer events.
      "system/refraction.tsx": ["addEventListener"],
    };
    const banned = /on(?:Pointer|Mouse|Touch)(?:Move|Enter|Leave|Over|Out|Down|Up)\s*=|addEventListener\(\s*["'](?:pointer|mouse|touch|scroll|wheel)/g;
    const files = [
      ...walkFiles("components", ".tsx").filter((f) => !f.includes("test")),
      ...walkFiles("system", ".tsx").filter((f) => !f.includes("test")),
      ...walkFiles("theme", ".tsx").filter((f) => !f.includes("test")),
    ];
    expect(files.length, "the walk must find the component sources").toBeGreaterThan(10);
    for (const file of files) {
      const source = stripped(raw(file));
      const hits = [...source.matchAll(banned)].map((m) => m[0]);
      const allowed = EXEMPT[file] ?? [];
      const offending = hits.filter((h) => !allowed.some((a) => h.includes(a)));
      expect(offending, `${file} attaches an interaction-time handler: ${offending.join(", ")}`).toEqual([]);
    }
  });

  it("every :hover rule is guarded by (hover: hover) — and :active never is", () => {
    // A touch device synthesises :hover on tap and keeps it until you tap elsewhere, so an
    // unguarded hover rule leaves a pressed control stuck in its hover fill. Structural rather
    // than mounted, because the browser project cannot change a media feature mid-run: what is
    // asserted is that no :hover declaration exists outside a guard.
    //
    // EVERY guard, not the first (2026-08-17): the control-scale port added a second
    // `@media (hover: hover)` block nested inside @supports, and the old spelling — first
    // block only, with a hand-rolled end-of-block guess — reported that block's own :hover
    // as unguarded. Brace-matched so a guard inside another at-rule strips whole.
    let outside = recipes;
    let start = outside.indexOf("@media (hover: hover)");
    expect(start).toBeGreaterThan(-1);
    while (start !== -1) {
      let depth = 0;
      let i = outside.indexOf("{", start);
      for (; i < outside.length; i += 1) {
        if (outside[i] === "{") depth += 1;
        else if (outside[i] === "}") {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      outside = outside.slice(0, start) + outside.slice(i + 1);
      start = outside.indexOf("@media (hover: hover)");
    }
    expect(outside).not.toContain(":hover");
    // Press is the only feedback a touch device gets; guarding it would remove it entirely.
    expect(outside).toContain(":active");
  });

  it("the press keeps its colour instant — the 2026-08-03 finding, in CSS (§8)", () => {
    // The finding that zeroed every transition for six days: a tap lasts about 60ms, so an
    // eased press never reaches its colour and the control reads dead on a phone. Motion did
    // not overturn it, it separated it — the paint clock is one variable, and press sets it to
    // zero while the geometry keeps its spring. If that variable ever stops being zeroed here,
    // every control in the library goes soft under the thumb.
    const press = block(sheet("system/recipes.css"), ".kui-control:active:not([data-disabled], [data-loading])");
    expect(press).toMatch(/--kui-ct-paint:\s*0s/);
    const hover = block(sheet("system/recipes.css"), ".kui-control:hover:not([data-disabled], [data-loading])");
    expect(hover).toContain("var(--motion-hover-in)");
    // And the press swaps the GEOMETRY clock with it: down hard and fast, up long and lively.
    // Deleting this pair leaves a press that recovers as abruptly as it strikes, which is one
    // gesture where there should be two — and no mounted law can see it, because `:active` is
    // the one interaction state a headless harness cannot genuinely produce.
    expect(press, "a press strikes on its own clock").toContain("--kui-ct-move: var(--motion-press)");
    expect(press).toContain("--kui-ct-move-ease: var(--motion-spring-stiff)");
  });

  it("a press belongs to the family that owns it (§8, 2026-08-09)", () => {
    const recipes = sheet("system/recipes.css");
    // The switch is a mark by FAMILY — it rides the mark ladder — and its press is not the
    // family's. A checkbox and a radio ARE their glyph's box, so a press has nowhere to go but
    // into the box; a switch is a channel with a grip in it, and squashing the channel moves
    // the very thing the thumb is crossing (Kushagra, 2026-08-09).
    // Found by what the rule DECLARES, not by the first selector that looks like it: the mark
    // family opens with the target expander, which wears the same `:where(:not(…))` shape, and
    // matching on that read a rule with nothing to do with pressing.
    const squash = recipes.split("}").find((rule) => rule.includes("--press-squash"));
    expect(squash, "the squash rule must exist at all").toBeDefined();
    expect(
      squash!.slice(squash!.lastIndexOf("*/") + 2, squash!.lastIndexOf("{")),
      "the switch must be named out of the squash",
    ).toContain(".kui-switch");

    // The select trigger takes the BUTTON's distances (2026-08-10, Kushagra: "its also an
    // onclick trigger") — a button in field dress, so its press states the same two tokens
    // button.css states and invents no number of its own. Structural because `:active`
    // cannot be produced headlessly; the rise half has a real-pointer law in the select
    // browser suite.
    const selectCss = sheet("components/select/select.css");
    const triggerPress = selectCss
      .split("}")
      .find((rule) => rule.includes(".kui-select-trigger:active"));
    expect(triggerPress, "the trigger must press like a button").toBeDefined();
    expect(triggerPress!).toContain("var(--press-travel)");
    expect(triggerPress!).toContain("var(--press-scale)");
    expect(selectCss).toContain("calc(-1 * var(--hover-travel))");

    // And the switch's own lean hangs off the ROOT, never off the thumb: `:active` matches the
    // activated element and its ANCESTORS, never its descendants, so a thumb-keyed rule fires
    // only when the pointer happens to land on the grip.
    const switchCss = sheet("components/switch/switch.css");
    expect(switchCss).toContain(".kui-switch:active");
    for (const rule of switchCss.split("}")) {
      if (!rule.includes("--thumb-lean")) continue;
      const selector = rule.slice(rule.lastIndexOf("*/") + 2, rule.lastIndexOf("{"));
      expect(selector, "the lean must be reached from the switch").toContain(".kui-switch:active");
    }
  });

  /**
   * Resolve the control layer's own hooks before judging a channel (§8).
   *
   * `--kui-ct-move` and `--kui-ct-paint` exist so a STATE can restate a clock without
   * restating which properties it governs — press swaps both, hover swaps one. A law that
   * stopped at the hook would be checking the indirection instead of the value behind it, so
   * this substitutes EVERY declaration the sheet gives a hook and requires all of them to
   * hold: a single arm pointing somewhere it should not is what this is for.
   */
  /**
   * BOTH private stems, not just the control layer's (widened 2026-08-17). This was written
   * when `.kui-control` was the only thing in the package that moved, so it knew `--kui-ct-`
   * and nothing else. The day the interactive surface got its two clocks, its channels read
   * `var(--kui-sf-move)` — a hook this could not follow — and the two laws below reported a
   * correctly-sprung translate as unsprung and a correctly-tokenised duration as hand-typed.
   * They were right to fail: an unresolvable hook is indistinguishable from a made-up one.
   * The stems are the layers' own (`ct` control, `sf` surface, §12's namespace rule), so a
   * third layer that starts moving joins here rather than getting a law of its own.
   */
  function resolveHooks(sheetBody: string, channel: string): string {
    return channel.replace(/var\((--kui-(?:ct|sf)-[\w-]+)\)/g, (_, name: string) => {
      const declared = [...sheetBody.matchAll(new RegExp(`${name}:\\s*([^;]+);`, "g"))].map(
        (m) => m[1]!.trim(),
      );
      expect(declared.length, `${name} is used but never declared`).toBeGreaterThan(0);
      return declared.join(" ");
    });
  }

  it("every transition in the package rides a motion token (§8)", () => {
    // The guard against accretion, and it replaces the whitelist it grew out of. While one
    // stylesheet moved, naming that sheet was the whole law; now that the control layer moves,
    // what keeps motion from being invented one component at a time is that a duration cannot
    // be typed in. A raw `150ms` because it "felt right" fails here.
    for (const file of allStylesheets()) {
      for (const declaration of [...sheet(file).matchAll(/[^-\w]transition\s*:([^;]+);/g)]) {
        const body = declaration[1]!;
        if (body.trim() === "none") continue;
        for (const raw of body.split(",")) {
          const channel = resolveHooks(sheet(file), raw);
          // The var() references are STRIPPED before the check, which is the whole law: the
          // first spelling asked whether the channel mentioned a motion token anywhere, and
          // every channel does — its easing is one. So `scale 150ms var(--motion-spring-stiff)`
          // passed while carrying exactly the hand-typed duration this exists to forbid.
          for (const literal of channel.replace(/var\([^)]*\)/g, "").match(/\d*\.?\d+m?s/g) ?? []) {
            expect(literal, `${file}: ${raw.trim()} — hand-typed duration`).toBe("0s");
          }
          // Four clock families: the control clocks (--motion-*), the floating panes'
          // (--floating-*), the alert's materialization (--overlay-*, §24/§25) and the
          // dialog's own entry (--dialog-*, 2026-08-16 — depth, not distance). A family
          // shares the grammar, never the token home; `alert` is listed against the day its
          // prefix is renamed to match the component that owns those clocks.
          expect(channel, `${file}: ${raw.trim()}`).toMatch(/var\(--(motion|floating|overlay|alert|dialog)-[\w-]+\)|\b0s\b/);
        }
      }
    }
  });

  it("geometry rides a spring, paint eases — the two clocks, everywhere (§8)", () => {
    // Widened from the one moving sheet to all of them (2026-08-09). A colour on a spring
    // reads as a wobble and a box on a bezier reads as a slideshow; the split is what makes
    // the system read as physical rather than as a set of tastefully chosen curves.
    // box-shadow is LIGHT, not mass (added 2026-08-10, the morph's opaque seed): the floating
    // cast fades up as the panel lifts, and light on a spring would wobble.
    // `filter` joined 2026-08-14 with the molten pass: blur is FOCUS, a property of the
    // viewer's read, not of the box — a signal, so it eases like the rest of the paint.
    // `text-decoration-color` joined 2026-08-21 with Link, and it is the same category as
    // `border-color` one property over: a colour, on a line the component already draws.
    // It was absent only because nothing in the package had ever moved an underline.
    const PAINT = new Set(["background-color", "border-color", "color", "opacity", "fill", "stroke", "box-shadow", "filter", "text-decoration-color"]);
    for (const file of allStylesheets()) {
      for (const declaration of [...sheet(file).matchAll(/[^-\w]transition\s*:([^;]+);/g)]) {
        const body = declaration[1]!;
        if (body.trim() === "none") continue;
        for (const raw of body.split(",")) {
          const [property] = raw.trim().split(/\s+/);
          if (!property) continue;
          const channel = resolveHooks(sheet(file), raw);
          if (channel.includes("0s") && !channel.includes("--motion-spring")) continue;
          if (PAINT.has(property)) {
            expect(channel, `${file}: ${property} is a signal, it must not spring`).not.toContain("--motion-spring");
          } else {
            expect(channel, `${file}: ${property} moves a box, it must spring`).toMatch(
              /var\(--motion-spring(-stiff|-lively|-elastic|-poised)?\)/,
            );
          }
        }
      }
    }
  });

  it("a var() without a fallback resolves SOMEWHERE — a dangling name is a disarmed declaration (2026-08-14)", () => {
    /**
     * The floating body's counter-squish shipped reading `var(--floating-rise)` — a token
     * that never existed — and because a dangling var() invalidates its whole declaration at
     * computed-value time, the transition was silently absent from the day it shipped while
     * every law read the rules around it (found by Kushagra in the lab: "the text doesn't
     * move or stretch with it"). Nothing walked the sheets for names that resolve nowhere;
     * this is that walk. A var() WITH a fallback is a hook — deliberately undeclared names
     * are how the world tokens, the JS-written measurements and the per-state hooks all
     * work — so the law binds only the fallback-less form, which has no second answer.
     */
    const declared = new Set<string>();
    const declaration = /(?:^|[{;\s])(--[\w-]+)\s*:/g;
    const sources = [
      ...allStylesheets().map((p) => sheet(p)),
      stripped(raw("tokens/tokens.css")),
      stripped(raw("system/layout.css")),
    ];
    for (const body of sources) {
      for (const m of body.matchAll(declaration)) declared.add(m[1]!);
      for (const m of body.matchAll(/@property\s+(--[\w-]+)/g)) declared.add(m[1]!);
    }
    // Names only the runtime writes, read without a fallback on purpose (each is set before
    // the rule that reads it can match). Additions here need the same sentence.
    // --kui-anchor-w: the entry's synchronous width floor, written in begin() before the
    //   floor chains consult it.
    // (--kui-floating-gap left this list 2026-08-22: it was written by MenuContent and
    //   SelectContent and read by NOTHING — four references in the whole tree, two writers and
    //   this allowlist, whose own sentence vouched for a read that did not exist. Both source
    //   comments said "the entry reads it as a var"; the lean became a measured translate on
    //   2026-08-15 and the var was never taken out. An allowlist entry is a promise that a name
    //   is read somewhere the law cannot see, so an entry for a name nobody reads is the one
    //   thing it must never contain.)
    // --scroll-area-thumb-height/-width: Base UI's OWN published measurements, written onto
    //   the thumb it renders (2026-08-17). They are the one case here the library does not
    //   write itself, and they take no fallback on purpose: there is no honest default extent
    //   for a thumb — a guessed one would paint a wrong-length bar on the frame before the
    //   measurement lands, which is worse than the rule not matching at all.
    const runtime = new Set([
      "--kui-anchor-w",
      "--scroll-area-thumb-height",
      "--scroll-area-thumb-width",
    ]);
    let reads = 0;
    for (const file of allStylesheets()) {
      const body = sheet(file);
      for (const m of body.matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) {
        reads += 1;
        if (m[2] === ",") continue; // a fallback makes it a hook
        const name = m[1]!;
        if (runtime.has(name)) continue;
        expect(
          declared.has(name),
          `${file}: var(${name}) has no fallback and no declaration anywhere — the --floating-rise shape`,
        ).toBe(true);
      }
    }
    expect(reads, "the walk read nothing — the regex broke, not the sheets").toBeGreaterThan(200);
  });

  it("nothing moves that is not stood down under reduced motion (§8)", () => {
    // Coverage, not the existence of a block: the cheapest way to satisfy "has a
    // prefers-reduced-motion rule" is one that stands down something else. This law's own
    // first comment claimed the shared `.kui-control *` block covered every moving part a
    // control owns — false by cascade (2026-08-10): a part declared in a later file ties or
    // outruns it, so each sheet that declares a clock now carries its own stand-down on the
    // declaring selector, and the `continue` below is that obligation's shape — a file with
    // transitions either wears the guarded block or declares only inside the shared scope.
    // The PROOF is mounted (motion.browser.test.tsx enters the media query and reads the
    // parts); this law keeps the shape.
    const shared = sheet("system/recipes.css");
    const guard = shared.indexOf("@media (prefers-reduced-motion: reduce)");
    expect(guard, "the shared layer must stand its own motion down").toBeGreaterThan(-1);
    for (const covered of [".kui-control", ".kui-control *", ".kui-mark"]) {
      expect(shared.slice(guard), covered).toContain(covered);
    }
    const COVERED = /\.kui-(control|mark|button|checkbox|radio|switch|field|textarea|slider|row)\b/;
    for (const file of allStylesheets()) {
      const body = sheet(file);
      if (!/[^-\w]transition\s*:/.test(body)) continue;
      if (body.includes("@media (prefers-reduced-motion: reduce)")) continue;
      for (const rule of body.split("}")) {
        if (!/[^-\w]transition\s*:\s*(?!none)/.test(rule)) continue;
        const selector = rule.slice(rule.lastIndexOf("*/") + 2, rule.lastIndexOf("{")).trim();
        expect(selector, `${file}: nothing stands this down`).toMatch(COVERED);
      }
    }
  });

  it("and an ANIMATION is stood down too — the half this law was missing (§8, 2026-08-10)", () => {
    // This law walked `transition` and nothing else, so the focus ring — an `animation`, because
    // there is no previous outline-offset to travel from — was never in its scope at all. It went
    // on landing under `prefers-reduced-motion: reduce` for six days. The mounted law in
    // system/motion.browser.test.tsx is what actually proves the suppression now (it enters the
    // media query and reads the computed value); this one keeps the SHAPE, so a new animation
    // cannot be added without joining one of the two answers the system has.
    for (const file of allStylesheets()) {
      const body = sheet(file);
      for (const declaration of [...body.matchAll(/[^-\w]animation\s*:([^;]+);/g)]) {
        const value = declaration[1]!.trim();
        if (value === "none") continue;
        // Answer one: it reads the arrival hook, which the shared layer stands down below.
        if (value.includes("var(--kui-ct-ring)")) continue;
        // Answer two: it is motion that IS the content (a spinner, an indeterminate bar), which
        // keeps its own answer — slowed, never stopped — and therefore owns a guarded block.
        expect(
          body,
          `${file}: \`${value}\` neither reads the hook nor stands itself down`,
        ).toContain("@media (prefers-reduced-motion: reduce)");
      }
    }
  });

  it("every selector that declares an arrival is a selector that stands it down (§8)", () => {
    // The agreement the specificity bug needed. Standing the HOOK down rather than the rules
    // that read it means the recipe and its stand-down share a selector — so the tie goes to
    // source order and can never again be lost by one point of arithmetic nobody redid. That
    // only holds while the two lists MATCH, which is what this reads.
    const guard = recipes.indexOf("@media (prefers-reduced-motion: reduce)");
    expect(guard).toBeGreaterThan(-1);
    const declarers = (region: string) =>
      [...region.matchAll(/([^{}]+)\{[^{}]*--kui-ct-ring\s*:[^{}]*\}/g)]
        .flatMap((m) => m[1]!.split(","))
        .map((s) => s.slice(s.lastIndexOf("*/") + 2).trim())
        .filter(Boolean)
        .sort();
    const declared = declarers(recipes.slice(0, guard));
    const suppressed = declarers(recipes.slice(guard));
    expect(declared.length, "the arrivals must be declared somewhere").toBeGreaterThan(0);
    expect(suppressed, `declared on ${declared.join(" / ")}`).toEqual(declared);
  });

  it("the panel families are inside the reduced-motion guard at all (§8)", () => {
    /**
     * Narrowed 2026-08-16, and the narrowing is the point. This law used to scan the guarded
     * region for the WORDS the stand-down was expected to contain — margin, translate, scale,
     * opacity, inline-size, block-size, filter — which never asked which selector carried
     * them, whether that selector won, or whether the rule was reachable at all. It was green
     * through the whole life of the two defects the mounted laws found in an afternoon (an
     * aim gate that outweighed its own stand-down; a width floor released by a pose nothing
     * restored), and it went red on the day those undo rules were correctly DELETED — a law
     * that fails on the fix and passes on the defect is worse than no law.
     *
     * What a text scan can honestly claim is membership: both panel families, their bodies
     * and a menu's rows are named inside the guard, and the guard turns their clocks off. What
     * they then COMPUTE is asserted where it can be measured — menu.browser.test.tsx and
     * alert-dialog.browser.test.tsx, "suppression is total", both falsified against the
     * shipped code.
     */
    const body = sheet("system/surfaces.css");
    const guard = body.indexOf("@media (prefers-reduced-motion: reduce)");
    expect(guard, "the guard exists").toBeGreaterThan(-1);
    const suppressed = body.slice(guard);
    expect(suppressed).toMatch(/transition:\s*none/);
    for (const member of [
      ".kui-surface.kui-floating",
      ".kui-floating-body",
      ".kui-surface.kui-alert-popup",
      ".kui-overlay-body",
      ".kui-row",
    ]) {
      expect(suppressed, `${member} is inside the guard`).toContain(member);
    }
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
    // Exactly six declarations — the surface layer's, the control layer's, the field
    // family's (the third flip: a field is a raised control and casts the control row,
    // 2026-08-07), the two grips' ALWAYS-ON casts (the slider thumb's, and the switch
    // thumb's since 2026-08-08 — one exception inherited with the role, not a second one:
    // a grip that does not sit above its rail stops reading as a grip, so both read the
    // palette row's VALUE rather than the world switch), and the key cap's (2026-08-08,
    // the day-one refusal reversed: a cap is a picture of a raised physical key, so depth
    // is role semantics — the grips' sentence one family over).
    //
    // The SEVENTH arrived 2026-08-17 with the segmented control, and it is the grips' own
    // exception a third time rather than a new one: the selected segment is a grip sitting in
    // a channel — the switch's thumb with a label in it — so it reads --grip-cast's VALUE, not
    // the world switch, for the reason the other two do. A grip that does not sit above its
    // rail stops reading as a grip, and in a segmented control the raised segment IS the
    // answer to "which one is chosen". An EIGHTH consumer appearing is a decision, not a
    // drift, and it should fail here first.
    expect(found).toBe(7);
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
