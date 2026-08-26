/**
 * The playground covers the surface (2026-08-08, Kushagra: "we should always add to that,
 * that should be a repo rule").
 *
 * Separator shipped with seven mounted laws, a budget re-record and a LOG entry — and no
 * playground section, because the checklist the walks enforce ends at the package boundary
 * and the playground sits in the app. The rule is the same shape as the package's own
 * "a stylesheet-bearing component ships its mounted laws": what must exist can be walked,
 * so it is a law, not a memory.
 *
 * Every component the package exports must be RENDERED somewhere in the preview route — a
 * JSX open tag, not an import: an import proves someone typed the name, a tag proves the
 * playground shows the thing. No exclusion list: Box and Theme are the playground's own
 * machinery and genuinely render, so the day an export cannot appear here is the day this
 * law earns one, with the reason written beside the name.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { themeDefaults } from "@kookie-ui/react";

import { parsePackageExports, readPackageExports } from "../package-exports";
import { COMPONENT_PREVIEWS } from "./previews";
import { SECTION_ORDER } from "./previews/types";

const here = fileURLToPath(new URL(".", import.meta.url));
const packageIndex = join(here, "../../../../packages/ui/src/index.ts");

/** Every .tsx under the preview route, RECURSIVELY — the per-component spec files live in
    previews/ and the standalone route in [slug]/, and a walk that stopped at the top level
    would un-count every specimen the day it ported (2026-08-19). */
function allPreviewSources(): string {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".tsx")) files.push(full);
    }
  };
  walk(here);
  return files.map((f) => readFileSync(f, "utf8")).join("\n");
}

/**
 * Uppercase value exports of the public surface — components, not hooks or types.
 *
 * CHANGES 2026-08-26: this used ITS OWN regex, anchored on `^export \{ ` with a literal space
 * after the brace, so no MULTI-LINE export block matched — 18 names, `Theme` and all of Shell
 * and Composer among them, were dropped from the set this whole file loops over, and a
 * component added inside one of those blocks and never previewed would have passed. The
 * registry's coverage law had been repaired for exactly this on 2026-08-16 and this copy was
 * not, which is why the parser now has one home.
 */
const exportedComponents = (): string[] => readPackageExports(packageIndex);

describe("every exported component appears in the playground", () => {
  const rendered = allPreviewSources();

  const components = exportedComponents();

  it("the parse found the surface — an empty export list audits nothing", () => {
    expect(components.length).toBeGreaterThanOrEqual(15);
    expect(components).toContain("Button");
    // And it found the MULTI-LINE blocks. `Button` sits on a one-line export, so it vouches
    // for a parser that reads none of them; `Theme` and `Shell` do not, and until 2026-08-26
    // neither reached this loop. Named rather than counted, because a count is the thing that
    // silently agrees when a block is reformatted.
    expect(components).toContain("Theme");
    expect(components).toContain("Shell");
    expect(components).toContain("Composer");
  });

  it("the parser reads a block whatever shape prettier leaves it in", () => {
    // The instrument, calibrated on an input where the general case and the special case give
    // DIFFERENT answers — one-line and multi-line in the same fixture, plus the two spellings
    // that have to be handled: `as` exports the second name, and a `type` entry is not a
    // component.
    const source = [
      'export { Alpha } from "./alpha";',
      "export {",
      "  Beta,",
      "  Gamma as Delta,",
      "  type Epsilon,",
      '} from "./beta";',
      "",
    ].join("\n");
    expect(parsePackageExports(source)).toEqual(["Alpha", "Beta", "Delta"]);
  });

  for (const name of components) {
    it(`${name} is rendered somewhere under /preview`, () => {
      // An open tag, bounded so <Text> never vouches for <TextField>.
      expect(
        new RegExp(`<${name}[\\s/>]`).test(rendered),
        `${name} is exported by the package but never rendered in the playground — add its section to specimens.tsx`,
      ).toBe(true);
    });
  }
});

/**
 * A shipped STATE owes a specimen too (audit 2026-08-09).
 *
 * The export walk above proves a component is on the page; it cannot see that a state the
 * shared layer paints is rendered nowhere. The invalid-CHECKED wash shipped 2026-08-08
 * "judged in the playground" — and every Invalid cell in the three mark matrices was
 * UNCHECKED, the one case the arm deliberately does not touch, so the decision's own judging
 * surface could not show it.
 *
 * The requirement is DERIVED, not listed: the law reads the shipped stylesheet, and only asks
 * for the specimens if the rule is actually there. Delete the CSS arm and the law stops
 * asking; ship the arm without a specimen and it fails.
 */
describe("a state the shared layer paints has a specimen (§8)", () => {
  const recipes = readFileSync(
    join(here, "../../../../packages/ui/src/system/recipes.css"),
    "utf8",
  ).replace(/\/\*[\s\S]*?\*\//g, " ");
  const sources = allPreviewSources();

  const marksHaveCheckedInvalidRule = /\.kui-mark[^{]*data-checked[^{]*(data-invalid|aria-invalid)/.test(
    recipes,
  );

  it("the mark family's checked+invalid rule is what makes this law ask", () => {
    // Stated so the derivation is visible: if this is ever false the assertions below are
    // vacuous BY DESIGN, and this line is where a reader finds that out.
    expect(marksHaveCheckedInvalidRule).toBe(true);
  });

  for (const component of ["Checkbox", "Switch"]) {
    it(`${component} renders a specimen that is BOTH checked and invalid`, () => {
      if (!marksHaveCheckedInvalidRule) return;
      // One tag carrying both attributes — the state the rule paints, not two cells that
      // each carry half of it.
      const tags = sources.match(new RegExp(`<${component}\\b[^>]*>`, "g")) ?? [];
      const both = tags.filter(
        (t) => /aria-invalid/.test(t) && /(defaultChecked|checked)/.test(t),
      );
      expect(
        both.length,
        `no <${component}> specimen is checked AND invalid — the wash cannot be judged`,
      ).toBeGreaterThan(0);
    });
  }

  it("the environment panel DERIVES its defaults — a docs copy of an axis default is drift", () => {
    // Earned 2026-08-09: `full` became the system's default radius and this panel — the one
    // surface whose whole job is showing what the system does — kept opening at `medium`,
    // because it held its own copy of all six axis defaults. /matrix held a seventh. A
    // literal here is indistinguishable from the truth until the truth moves.
    //
    // The AXIS LIST is derived too, since 2026-08-10: it was a hand-written five, and the day
    // `look` split into `surfaceLook` and `controlLook` the list would have gone on naming an
    // axis that no longer exists while missing the two that do — the same drift one level up.
    const app = readFileSync(join(here, "preview-app.tsx"), "utf8");
    const block = app.slice(app.indexOf("const DEFAULT_ENV"), app.indexOf("const AXES"));
    expect(block, "DEFAULT_ENV is not where this law thinks").toContain("appearance");
    // `appearance` and `contrast` are the two the panel does not own: both live in the docs'
    // own store (the pre-paint script stamps them on <html>), so the panel reads them rather
    // than defaulting them. Every other axis must derive.
    const axes = Object.keys(themeDefaults).filter((a) => a !== "appearance" && a !== "contrast");
    expect(axes.length, "themeDefaults carries no axes to check").toBeGreaterThan(4);
    for (const axis of axes) {
      expect(block, `${axis} restates a default instead of deriving it`).toContain(
        `${axis}: themeDefaults.${axis}`,
      );
    }
    // `appearance` is the one deliberate literal: the preview starts by inheriting the docs'
    // own appearance, which is a choice this panel makes rather than a default it copies.
    expect(block).toContain('appearance: "inherit"');
  });

  it("every axis the panel HOLDS, it also drives — a chip and a prop, or it is dead", () => {
    // Earned 2026-08-16, and it is the law above being one indirection short. `material` became
    // a Theme axis, the panel gained the Env field and the derived default — so the derivation
    // law passed, green — and the axis reached NOTHING: no chip to flip it, and the canvas
    // <Theme> was never handed it. The one surface whose job is judging the system's newest
    // decision could not show it. A default that derives is not an axis that works.
    //
    // Both halves, because either alone is half the mechanism: a chip with no prop moves state
    // nothing reads, a prop with no chip is pinned at its default forever.
    // The canvas Theme lives in PreviewShell since 2026-08-19 — the shell both routes share,
    // extracted so the standalone pages could not grow a drifting panel copy.
    const app = readFileSync(join(here, "preview-app.tsx"), "utf8");
    const panel = app.slice(app.indexOf("function EnvPanel"), app.indexOf("export function PreviewApp"));
    const canvas = app.slice(app.indexOf("export function PreviewShell"));
    expect(panel, "EnvPanel is not where this law thinks").toContain("Chips");
    expect(canvas, "the canvas Theme is not where this law thinks").toContain("<Theme");

    // `appearance` and `contrast` are the store's, per the law above: appearance is applied
    // through its own spread arm (a pinned value only), contrast has no Theme prop at all.
    const axes = Object.keys(themeDefaults).filter((a) => a !== "appearance" && a !== "contrast");
    expect(axes.length, "themeDefaults carries no axes to check").toBeGreaterThan(4);
    for (const axis of axes) {
      expect(panel, `no chip flips ${axis} — the panel holds an axis it cannot move`).toContain(
        `options={AXES.${axis}}`,
      );
      expect(canvas, `${axis} never reaches the canvas Theme — flipping its chip does nothing`)
        .toContain(`${axis}={env.${axis}}`);
    }
  });

  it("the showcase renders whole screens, not one more specimen", () => {
    // Earned 2026-08-09 (Kushagra: "preview without examples doesn't make sense", refusing a
    // second route). The export walk proves every component is ON the page; nothing proved the
    // page shows any of them DOING anything. A playground of matrices is a spec sheet, and the
    // faults that actually shipped — a title one step off its body, buttons two rungs under
    // their card, a rule dividing nothing — are invisible in a matrix by construction.
    //
    // The cheapest way to satisfy a law like this is a file that says nothing, so the shape is
    // asserted, not the presence: several fragments, each holding components from more than
    // one family, and no colour or length invented anywhere in it.
    const showcase = readFileSync(join(here, "showcase.tsx"), "utf8");

    // Declared fragments do not count — only the ones the page actually renders. Counting
    // `function X(` would have passed on this file's shared helpers alone.
    const declared = new Set(
      (showcase.match(/^function ([A-Z]\w+)\(/gm) ?? []).map((m) => m.replace(/^function /, "").replace("(", "")),
    );
    const start = showcase.indexOf("export function Showcase");
    expect(start, "the showcase's own entry point is not where this law thinks").toBeGreaterThan(0);
    const rendered = new Set(
      (showcase.slice(start).match(/<([A-Z]\w+)\s*\/>/g) ?? [])
        .map((t) => t.replace(/[<>/\s]/g, ""))
        .filter((name) => declared.has(name)),
    );
    expect(
      rendered.size,
      "the showcase is meant to be several whole screens — it renders almost none",
    ).toBeGreaterThanOrEqual(6);

    // A screen is more than one family in one frame. Any fragment could be a specimen; the
    // set has to reach across the system.
    for (const name of ["TextField", "Select", "Switch", "Checkbox", "Menu", "Slider", "Progress"]) {
      expect(
        new RegExp(`<${name}[\\s/>]`).test(showcase),
        `the showcase never uses ${name} — a screen made of half the system is a specimen`,
      ).toBe(true);
    }

    // Ordinary call sites only: the fragments argue that the system composes, so a fragment
    // reaching past it for a colour is the argument failing quietly. Lengths are allowed
    // (§3 sanctions a stated width on a Box); painted values are not.
    const painted = showcase.match(/(background|color|border|box-shadow)\s*:/g) ?? [];
    expect(
      painted,
      "a showcase fragment paints something itself — the screens are meant to be ordinary call sites",
    ).toEqual([]);
  });

  it("Radio renders one too — where its checked state actually lives, on the GROUP", () => {
    if (!marksHaveCheckedInvalidRule) return;
    // Radio is the member whose selected state is not its own prop: RadioGroup owns the
    // value, so the specimen is a group with a defaultValue wrapping an invalid radio. A
    // law that demanded both attributes on the <Radio> tag would be asking for markup the
    // component does not have — the shape of the assertion has to follow the component.
    const groups =
      sources.match(/<RadioGroup\b[^>]*defaultValue[^>]*>[\s\S]{0,400}?<\/RadioGroup>/g) ?? [];
    const withInvalid = groups.filter((g) => /<Radio\b[^>]*aria-invalid/.test(g));
    expect(
      withInvalid.length,
      "no selected RadioGroup contains an invalid Radio — the wash cannot be judged",
    ).toBeGreaterThan(0);
  });
});

/**
 * The per-component preview structure (2026-08-19, Kushagra: "one thing I hate the most is
 * inconsistency"). One shape, every ported component: six sections in one fixed order, a
 * missing section declared with a written reason, and both routes reading ONE registry so
 * the collection page and the standalone pages cannot drift. These laws import the registry
 * at runtime — the real objects, not a regex over the file — because the claim is about the
 * data both routes consume.
 */
describe("the per-component previews share one structure", () => {
  it("every section states its intent — a name alone invites every demo to improvise", () => {
    // Written the day Nesting drifted through three meanings (2026-08-20): the renderer
    // prints each section's intent under its heading, so the sentence must exist and be a
    // real one for every section in the fixed order.
    for (const { key, name, intent } of SECTION_ORDER) {
      expect(typeof intent, `${key} has no intent`).toBe("string");
      expect(intent.length, `${name}'s intent is too short to be a contract`).toBeGreaterThan(60);
    }
  });

  it("the registry has entries and unique slugs — an empty registry audits nothing", () => {
    expect(COMPONENT_PREVIEWS.length).toBeGreaterThan(0);
    const slugs = COMPONENT_PREVIEWS.map((p) => p.slug);
    expect(new Set(slugs).size, "two previews share a slug — one page would shadow the other").toBe(
      slugs.length,
    );
  });

  it("every spec answers every section — specimens, or a written reason, never silence", () => {
    for (const p of COMPONENT_PREVIEWS) {
      for (const { key } of SECTION_ORDER) {
        const section = p.sections[key];
        expect(section, `${p.slug} is missing the "${key}" section entirely`).toBeTruthy();
        const hasBody = "body" in section && section.body != null;
        const hasAbsent = "absent" in section && typeof section.absent === "string";
        expect(
          hasBody !== hasAbsent,
          `${p.slug}.${key} must carry specimens OR a reason, exactly one — both/neither is a section nobody decided`,
        ).toBe(true);
        // The cheapest way to satisfy a structure law is an empty declaration; a refusal
        // must be a real sentence (the component reference's own anti-rot clause).
        if (hasAbsent) {
          expect(
            (section.absent as string).length,
            `${p.slug}.${key}'s absence reason is too short to be a reason`,
          ).toBeGreaterThan(40);
        }
      }
    }
  });

  it("the standalone route derives its pages from the registry — no second list", () => {
    const route = readFileSync(join(here, "[slug]/page.tsx"), "utf8");
    expect(route, "the route no longer reads the registry").toContain("COMPONENT_PREVIEWS");
    expect(route, "without generateStaticParams the pages are not derived").toContain(
      "generateStaticParams",
    );
    // A hand-written slug literal in the route would be the second list this law forbids.
    expect(route.includes('"card"'), "the route hard-codes a slug beside the registry").toBe(false);
  });

  it("a ported component's collection entry derives from the same spec the standalone page renders", () => {
    const specimens = readFileSync(join(here, "specimens.tsx"), "utf8");
    for (const p of COMPONENT_PREVIEWS) {
      expect(
        specimens.includes(`ported("${p.slug}")`),
        `${p.slug} is in the registry but the collection page does not derive its section — it renders a stale hand copy or nothing`,
      ).toBe(true);
    }
  });
});

/* ── A judging comment names what the code paints ──────────────────────────────────────── */

describe("the preview's judging instructions agree with the shipped code", () => {
  /**
   * /preview is the surface the eye pass runs on, and the authored comments in these files are
   * the INSTRUCTIONS for what to judge (2026-08-26). A stale instruction is worse here than
   * anywhere else on the site: a person reads it, looks at the pixels, and confirms a value the
   * system does not paint — which is how a defect gets signed off.
   *
   * Two were found. The Menu and Select States sections told the reader the checked tick wears
   * `--accent-solid`, which was measured under its own floor in dark and replaced by
   * `--accent-glyph` on 2026-08-23; and the TextArea Nesting section still taught the ONE
   * ELEMENT anatomy that glass reversed on 2026-08-25, pointing the eye at a border that has
   * moved to a wrapper.
   *
   * Each check is a PAIR — evidence from the package, then the claim — for the reason the same
   * shape is written out in `registry.test.ts`: without the evidence arm this is a spelling
   * pinned in place rather than a law about a disagreement.
   */
  const pkg = (rel: string) => readFileSync(join(here, "../../../../packages/ui/src/", rel), "utf8");
  const previews = allPreviewSources();

  it("the row tick is --accent-glyph, and the comments say so", () => {
    // The evidence: the shared row rule paints the indicator with the glyph role. `--accent-solid`
    // is one designed pigment in both appearances and misses the 45 floor a tick is held to on
    // the dark page, which is the whole reason the value moved.
    const recipes = pkg("system/recipes.css");
    expect(recipes).toMatch(/\[data-checked\], \[data-selected\]\)\s*\{\s*\n\s*color: var\(--accent-glyph\)/);
    expect(
      previews,
      "a preview comment tells the eye to judge the tick against --accent-solid",
    ).not.toMatch(/accent SOLID on (the|its) tick/i);
  });

  it("TextArea has a WRAPPER, and no comment says the border stays on the textarea", () => {
    // The evidence: the visible control is the wrapper; the inner element carries a class of its
    // own and none of the paint. A comment claiming otherwise sends the eye to the wrong box.
    const source = pkg("components/text-area/text-area.tsx");
    expect(source).toContain("kui-control kui-textarea");
    expect(source).toContain("kui-textarea-input");
    expect(
      previews,
      "a preview comment still teaches TextArea's deleted one-element anatomy",
    ).not.toMatch(/border\s*\n?\s*stays on the `<textarea>`/i);
  });
});
