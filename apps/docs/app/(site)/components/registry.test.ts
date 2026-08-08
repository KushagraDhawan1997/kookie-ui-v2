/**
 * The reference covers the surface — the playground law's sentence, one route over.
 *
 * `playground.test.ts` enforces that every export is RENDERED somewhere; this enforces that
 * every export is EXPLAINED. The two are different failures: a component can be visible in
 * the playground and undocumented, which is exactly the state the package was in for eleven
 * components before this route existed.
 *
 * It parses the registry as text rather than importing it, for the reason the playground law
 * does: the registry is a `.tsx` holding live JSX, and the node project has no DOM. What is
 * checked is therefore what can be checked from the source — coverage, uniqueness, and that
 * no entry is a stub — and the assertion that would need a browser (that the example renders)
 * is the browser suite's business in the package, where those components already have laws.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = fileURLToPath(new URL(".", import.meta.url));
const packageIndex = join(here, "../../../../../packages/ui/src/index.ts");
const registry = readFileSync(join(here, "registry.tsx"), "utf8");

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

/** Every `name: "X"` in the registry, which is the key the coverage claim is about. */
const documented = [...registry.matchAll(/^\s{4}name: "([A-Za-z]+)",$/gm)].map((m) => m[1]!);
const slugs = [...registry.matchAll(/^\s{4}slug: "([a-z-]+)",$/gm)].map((m) => m[1]!);

/** Parts of a compound component (§22, amended with Menu 2026-08-09): an export may be
    EXPLAINED inside its parent's entry rather than on a page of its own — no library ships
    a standalone MenuLabel page, and eleven stub entries is the box-ticking rot the second
    describe below exists to prevent. A part is still held to the anti-stub bar (its blurb
    has a floor), and the reverse direction still binds (a part must be a real export). */
const parts = [...registry.matchAll(/^\s{8}\{ part: "([A-Za-z]+)", blurb: "((?:[^"\\]|\\.)*)" \}/gm)].map(
  (m) => ({ name: m[1]!, blurb: m[2]! }),
);
const partNames = parts.map((p) => p.name);

describe("every exported component has a reference entry", () => {
  const components = exportedComponents();

  it("both parses found something — an empty list on either side audits nothing", () => {
    // The vacuity guard, and it is not theoretical here: both sides are regexes over source,
    // so a reformat that breaks either one would otherwise turn this whole file green.
    expect(components.length).toBeGreaterThanOrEqual(15);
    expect(components).toContain("Button");
    expect(documented.length).toBeGreaterThanOrEqual(15);
    expect(documented).toContain("Button");
  });

  for (const name of exportedComponents()) {
    it(`${name} is documented`, () => {
      expect(
        documented.includes(name) || partNames.includes(name),
        `${name} is exported by the package but has no entry (and is no entry's part) in registry.tsx`,
      ).toBe(true);
    });
  }

  it("a name has ONE home — an entry of its own or a parent's parts list, never both", () => {
    for (const name of partNames) {
      expect(documented, `${name} is both an entry and a part`).not.toContain(name);
    }
  });

  it("no entry documents something the package does not export", () => {
    // The other direction: a renamed or deleted export must not leave a page behind that
    // describes a component nobody can import. Parts are held to it too.
    for (const name of documented) expect(components).toContain(name);
    for (const name of partNames) expect(components).toContain(name);
  });

  it("slugs are unique, and there is one per entry", () => {
    expect(slugs).toHaveLength(documented.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("an entry that says nothing is worse than no entry", () => {
  // Coverage laws rot into box-ticking: the cheapest way to satisfy the law above is an entry
  // with an empty blurb and no refusals. These make that route fail instead.
  it("every blurb is a real sentence, not a placeholder", () => {
    // Anchored at the entry's own indent (4 spaces): a part's inline blurb lives at 8 and
    // has its own law above — counting it here would double-book the same string.
    const blurbs = [...registry.matchAll(/^\s{4}blurb:\s*\n?\s*"((?:[^"\\]|\\.)*)"/gm)].map((m) => m[1]!);
    expect(blurbs).toHaveLength(documented.length);
    for (const blurb of blurbs) {
      expect(blurb.length, `a blurb is too short to be saying anything: "${blurb}"`).toBeGreaterThan(80);
    }
  });

  it("a part's blurb is a real description, and the parse itself is proven live", () => {
    // The vacuity guard is load-bearing: `parts` is a regex over source, and a reformat
    // that broke it would silently re-demand twelve stub entries' absence — i.e. nothing.
    // Menu ships ≥ 10 parts, so a parse finding fewer is a broken parse, not a design.
    expect(parts.length).toBeGreaterThanOrEqual(10);
    for (const p of parts) {
      expect(p.blurb.length, `part ${p.name}'s blurb says nothing: "${p.blurb}"`).toBeGreaterThan(40);
    }
  });

  it("every entry states at least one refusal — that is the section that carries the argument", () => {
    const blocks = registry.split(/^\s{4}slug: "/gm).slice(1);
    expect(blocks).toHaveLength(documented.length);
    for (const block of blocks) {
      const slug = block.slice(0, block.indexOf('"'));
      const refusals = [...block.matchAll(/^\s{8}why: "/gm), ...block.matchAll(/why: "/g)];
      expect(refusals.length, `${slug} lists no refusal with a reason`).toBeGreaterThan(0);
    }
  });
});
