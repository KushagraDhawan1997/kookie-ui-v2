/**
 * The reference covers the surface — the playground law's sentence, one route over.
 *
 * `playground.test.ts` enforces that every export is RENDERED somewhere; this enforces that
 * every export is EXPLAINED. The two are different failures: a component can be visible in
 * the playground and undocumented, which is exactly the state the package was in for eleven
 * components before this route existed.
 *
 * IT IMPORTS THE REGISTRY NOW, rather than parsing it as text (2026-08-21). It parsed before
 * for a reason that has since gone away: the registry was a `.tsx` holding live JSX, and the
 * node project has no DOM. Specimens moved to real files in `examples/` — one file rendered
 * and shown, so a reader can copy what they see — which left the registry pure data, so the
 * law reads the values themselves.
 *
 * That is worth more than tidiness. Every assertion below used to run through a regex over
 * source, and this repo has been bitten by that exact shape repeatedly: a `^export \{...\}`
 * anchor that stopped matching the day prettier broke a line, and ~20 `slice(indexOf)` sites
 * that would go green on a rename because a miss returns −1. A regex can only be wrong in the
 * direction of finding nothing, and finding nothing is how a coverage law passes while
 * covering nothing. The package index is still parsed — it genuinely is source we cannot
 * import for its shape — and its vacuity guard stays.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { ENTRIES } from "./registry";
import { EXAMPLES } from "../../../examples";

const here = fileURLToPath(new URL(".", import.meta.url));
const packageIndex = join(here, "../../../../../packages/ui/src/index.ts");

/**
 * Uppercase value exports of the public surface — components, not hooks or types.
 *
 * The brace body may span LINES (fixed 2026-08-16). The first spelling anchored on
 * `^export \{ ... \}` with the whole list on one line, so the day `theme.tsx`'s export grew
 * past the line width and prettier broke it across lines, every name in that block vanished
 * from the coverage set. It failed loudly here only by luck — the registry documents `Theme`,
 * so the REVERSE arm caught it. In the other direction it is silent: a multi-line block of
 * genuinely new components would simply not be seen, and "every export is EXPLAINED" would
 * pass while explaining none of them. That is the failure this whole file exists to prevent,
 * so the parser stops caring about formatting.
 */
function exportedComponents(): string[] {
  const names: string[] = [];
  const source = readFileSync(packageIndex, "utf8");
  for (const m of source.matchAll(/^export \{([^}]*)\}/gms)) {
    for (const entry of m[1]!.split(",")) {
      const raw = entry.trim();
      // Types are EXCLUDED, and now deliberately. They were excluded before by accident — a
      // `type Foo` entry simply failed the uppercase test on its `t` — so the first attempt at
      // this parser "helpfully" stripped the keyword and pulled every `…Props` into the
      // coverage set. The header says components, not hooks or types; it says so in code now.
      if (raw.startsWith("type ")) continue;
      // `Foo as Bar` exports the second name, which is the one a consumer imports.
      const name = raw.split(/\s+as\s+/).pop()!.trim();
      if (/^[A-Z]/.test(name)) names.push(name);
    }
  }
  return names;
}

const documented = ENTRIES.map((entry) => entry.name);
const slugs = ENTRIES.map((entry) => entry.slug);

/** Parts of a compound component (§22, amended with Menu 2026-08-09): an export may be
    EXPLAINED inside its parent's entry rather than on a page of its own — no library ships
    a standalone MenuLabel page, and eleven stub entries is the box-ticking rot the second
    describe below exists to prevent. A part is still held to the anti-stub bar (its blurb
    has a floor), and the reverse direction still binds (a part must be a real export). */
const parts = ENTRIES.flatMap((entry) => entry.parts ?? []);
const partNames = parts.map((part) => part.part);

describe("every exported component has a reference entry", () => {
  const components = exportedComponents();

  it("both sides found something — an empty list on either side audits nothing", () => {
    // The vacuity guard. The package index is still read as text, so a reformat that broke
    // that parser would otherwise turn this whole file green.
    expect(components.length).toBeGreaterThanOrEqual(15);
    expect(components).toContain("Button");
    expect(documented.length).toBeGreaterThanOrEqual(15);
    expect(documented).toContain("Button");
  });

  for (const name of exportedComponents()) {
    it(`${name} is documented`, () => {
      expect(
        documented.includes(name) || partNames.includes(name),
        `${name} is exported by the package but has no entry (and is no entry's part) in registry.ts`,
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
    for (const entry of ENTRIES) {
      expect(
        entry.blurb.length,
        `${entry.slug}: a blurb too short to be saying anything`,
      ).toBeGreaterThan(80);
    }
  });

  it("a part's blurb is a real description", () => {
    // The vacuity guard survives the move to imports: `parts` is optional on an entry, so a
    // registry that dropped every parts list would leave this loop empty. Menu alone ships
    // ≥ 10 parts, so fewer than that is a regression rather than a design.
    expect(parts.length).toBeGreaterThanOrEqual(10);
    for (const part of parts) {
      expect(
        part.blurb.length,
        `part ${part.part}'s blurb says nothing: "${part.blurb}"`,
      ).toBeGreaterThan(40);
    }
  });

  it("every entry states at least one refusal — that is the section that carries the argument", () => {
    for (const entry of ENTRIES) {
      expect(entry.refusals.length, `${entry.slug} lists no refusal`).toBeGreaterThan(0);
      for (const refusal of entry.refusals) {
        expect(
          refusal.why.length,
          `${entry.slug}: refusal "${refusal.name}" gives no reason`,
        ).toBeGreaterThan(40);
      }
    }
  });

  it("every axis note explains what the axis resolves to HERE", () => {
    // The registry's axis notes are the meaning half of the reference — the generated API
    // table already carries names and types. A note that repeats the values is a row that
    // could have been generated, which is the one thing a hand-written table must not be.
    for (const entry of ENTRIES) {
      for (const axis of entry.axes) {
        expect(axis.note.length, `${entry.slug}: axis "${axis.name}" has no note`).toBeGreaterThan(
          20,
        );
      }
    }
  });
});

describe("every entry has a live specimen, and every specimen belongs to an entry", () => {
  // The specimen is keyed by CONVENTION — `examples/<slug>.tsx` — so this is the law that
  // makes the convention safe. Both directions, because the two failures are different: an
  // entry with no example renders a page with nothing to look at, and an example with no
  // entry is a file that compiles, passes lint, and is reachable from nowhere.
  it("every entry", () => {
    const missing = ENTRIES.filter((entry) => !EXAMPLES[entry.slug]).map((entry) => entry.slug);
    expect(missing).toEqual([]);
  });

  it("every example", () => {
    const known = new Set(slugs);
    expect(Object.keys(EXAMPLES).filter((name) => !known.has(name))).toEqual([]);
  });
});
