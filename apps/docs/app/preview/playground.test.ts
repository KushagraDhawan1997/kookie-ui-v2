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

const here = fileURLToPath(new URL(".", import.meta.url));
const packageIndex = join(here, "../../../../packages/ui/src/index.ts");

/** Uppercase value exports of the public surface — components, not hooks or types. */
function exportedComponents(): string[] {
  const names: string[] = [];
  for (const m of readFileSync(packageIndex, "utf8").matchAll(/^export \{ ([^}]+) \}/gm)) {
    for (const entry of m[1]!.split(",")) {
      const name = entry.trim();
      if (/^[A-Z]/.test(name)) names.push(name);
    }
  }
  return names;
}

describe("every exported component appears in the playground", () => {
  const rendered = readdirSync(here)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => readFileSync(join(here, f), "utf8"))
    .join("\n");

  const components = exportedComponents();

  it("the parse found the surface — an empty export list audits nothing", () => {
    expect(components.length).toBeGreaterThanOrEqual(15);
    expect(components).toContain("Button");
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
  const sources = readdirSync(here)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => readFileSync(join(here, f), "utf8"))
    .join("\n");

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
