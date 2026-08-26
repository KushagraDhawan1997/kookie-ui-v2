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

import { readPackageExports } from "../../package-exports";
import { ENTRIES } from "./registry";
import { EXAMPLES } from "../../../examples";

const here = fileURLToPath(new URL(".", import.meta.url));
const packageIndex = join(here, "../../../../../packages/ui/src/index.ts");
const decisions = join(here, "../../../../../docs/DECISIONS.md");

/**
 * Uppercase value exports of the public surface — components, not hooks or types.
 *
 * The parser moved to `app/package-exports.ts` on 2026-08-26. It lived here, correct, while
 * `preview/playground.test.ts` kept a copy that had never been repaired: that one still
 * anchored on `^export \{ ` with a literal space, so every multi-line block matched nothing
 * and 18 exports sat outside its coverage. Two copies of one claim is how a repair reaches
 * one law and not the other.
 */
const exportedComponents = (): string[] => readPackageExports(packageIndex);

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

describe("a cited § points at the section it claims", () => {
  /**
   * The `spec` field is the reference's one pointer OUT of the docs app, and nothing checked it
   * until 2026-08-26 — when Composer was found citing §31, which is Popover. A cited number is a
   * claim about another file, so it can only rot from the other side: renumber a section and every
   * pointer past it is silently wrong, with the reader the one who finds out.
   *
   * Existence alone is too weak to catch that — §31 exists. So the second law is the one that
   * bites: where DECISIONS.md has a section NAMED for a component, that component's entry must
   * cite it. The heading is the independent source; the registry is the copy under test.
   */
  const headings = [...readFileSync(decisions, "utf8").matchAll(/^## (\d+)\.(.*)$/gm)].map(
    (m) => ({ n: m[1]!, title: m[2]! }),
  );
  const numbers = new Set(headings.map((h) => h.n));

  it("both sides found something", () => {
    // Vacuity guard: DECISIONS.md is read as text, so a change of heading style would otherwise
    // leave the set empty and every citation below unresolvable-but-unchecked.
    expect(numbers.size).toBeGreaterThanOrEqual(20);
    expect(ENTRIES.length).toBeGreaterThanOrEqual(15);
    // And the naming arm must have subjects, or it is a loop over nothing.
    expect(headings.filter((h) => /\bComposer\b/.test(h.title))).toHaveLength(1);
  });

  for (const entry of ENTRIES) {
    it(`${entry.slug}`, () => {
      const cited = [...entry.spec.matchAll(/§(\d+)/g)].map((m) => m[1]!);
      expect(cited.length, `${entry.slug}: spec "${entry.spec}" cites no section`).toBeGreaterThan(
        0,
      );
      for (const n of cited) {
        expect(
          numbers.has(n),
          `${entry.slug} cites §${n}, which is not a section of DECISIONS.md`,
        ).toBe(true);
      }
      const named = headings.filter((h) =>
        new RegExp(`\\b${entry.name}\\b`).test(h.title),
      );
      if (named.length > 0) {
        expect(
          named.some((h) => cited.includes(h.n)),
          `${entry.slug} cites ${entry.spec}, but DECISIONS.md's section for ${entry.name} is ` +
            named.map((h) => `§${h.n}`).join(" or "),
        ).toBe(true);
      }
    });
  }
});

describe("a claim about the code is checked against the code", () => {
  /**
   * DOC–CODE DRIFT, made mechanical where it can be (2026-08-26). The reference explains the
   * system in prose, and prose has no compiler — an audit found four sentences here describing
   * behaviour the package had changed or never had: a menu casting in a flat theme (retired
   * 2026-08-19), rows that never open on hover (a submenu row does, by Base UI's default),
   * a refused indicator two lines under a blurb describing the one that ships, and a textarea
   * padding equally on four sides under the default radius, where it does not.
   *
   * WHAT THIS IS, HONESTLY. It cannot read a sentence and decide whether it is true. Each check
   * below is a PAIR: an evidence arm that reads the package source or the emitted tokens, and a
   * claim arm that fails if the reference states the opposite. The evidence arm is what stops it
   * being a spelling pinned in place — the day the code changes back, the check stops asking.
   */
  const pkg = (rel: string) => readFileSync(join(here, "../../../../../packages/ui/src/", rel), "utf8");

  /** Every sentence the reference publishes, as one corpus. */
  const prose = ENTRIES.flatMap((e) => [
    e.blurb,
    ...e.axes.map((a) => a.note),
    ...e.refusals.flatMap((r) => [r.name, r.why]),
    ...(e.parts ?? []).map((part) => part.blurb),
  ]).join("\n");

  it("both sides found something", () => {
    expect(prose.length).toBeGreaterThan(5000);
  });

  it("flat casts NOTHING, so no entry may say a panel casts in a flat theme", () => {
    // The evidence: the generator emits the flat floating chrome as a no-op layer. `flat` means
    // flat for every pane since 2026-08-19; the hairline is what draws a covering pane's edge.
    expect(pkg("tokens/tokens.css")).toMatch(/--floating-chrome-flat:\s*0 0 0 0 transparent/);
    expect(prose, "an entry says a panel casts in a flat theme").not.toMatch(
      /casts? a shadow even in a flat theme/i,
    );
  });

  it("a submenu row DOES open on hover, so no entry may say rows never do", () => {
    // The evidence: Menu hands `SubmenuTrigger` no `openOnHover`, so it takes Base UI's own
    // default, which is true. The prop is not exposed precisely because the platform's answer
    // is the designed one — which is a different sentence from "never on hover".
    const menu = pkg("components/menu/menu.tsx");
    expect(menu).toContain("BaseMenu.SubmenuTrigger");
    expect(menu, "Menu now states openOnHover; this claim needs re-reading").not.toMatch(
      /openOnHover=\{/,
    );
    // The claim arm is POSITIVE, because the sentence that was wrong here was a denial and a
    // denial is cheap to respell. The refusal that names the prop is the one place a reader
    // goes to learn the designed default, so it has to state what the default IS.
    const hover = ENTRIES.find((e) => e.slug === "menu")!.refusals.find((r) =>
      /openOnHover/.test(r.name),
    );
    expect(hover, "Menu no longer refuses openOnHover; this claim needs re-reading").toBeDefined();
    expect(
      hover!.why,
      "the openOnHover refusal does not say that a submenu row opens on hover",
    ).toMatch(/submenu[^.]*opens? on hover/i);
  });

  it("the segmented control SHIPS a travelling thumb, so its entry may not refuse one", () => {
    // The evidence: the component renders and measures the tile. The refusal that stood here
    // said the opposite in the one section that exists to tell a deliberate refusal from an
    // unbuilt gap — and said it two lines under a blurb describing the tile.
    const source = pkg("components/segmented-control/segmented-control.tsx");
    expect(source).toContain("kui-segment-thumb");
    const entry = ENTRIES.find((e) => e.slug === "segmented-control")!;
    expect(entry.blurb).toMatch(/slides/);
    for (const refusal of entry.refusals) {
      expect(
        `${refusal.name} ${refusal.why}`,
        `segmented-control refuses "${refusal.name}", which it ships`,
      ).not.toMatch(/does not measure the selection|nobody has designed/i);
    }
  });

  it("the pill correction makes a control's inline padding wider, so nothing may call it uniform", () => {
    // The evidence: the skeleton pads the inline sides through `--kui-ct-px-pill`, and at the
    // DEFAULT radius level (`full` since 2026-08-09) that token is a wider designed value than
    // the plain `--control-px-N` the block sides take.
    expect(pkg("system/recipes.css")).toMatch(/padding-inline-start:\s*var\(--kui-ct-px-pill\)/);
    expect(pkg("tokens/tokens.css")).toMatch(/--control-px-pill-2:\s*calc\(\d/);
    expect(prose, "an entry calls a control's padding uniform on all four sides").not.toMatch(
      /same on all four sides/i,
    );
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
