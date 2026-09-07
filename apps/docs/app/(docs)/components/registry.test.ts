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
import { CHAPTERS } from "../chapters";
import { humanLabel } from "../label";

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

describe("a name a reader sees is written for a reader (2026-08-31)", () => {
  /* `entry.name` is the EXPORTED name — the coverage law's key and the generated API table's
     key — so it stays `AvatarGroup`, and every place a person READS it goes through
     `humanLabel`. The law is over the function rather than the call sites because this app has
     one node project and cannot lay a page out; what it can do is prove the rule holds for
     every name the registry actually carries, which is the input the call sites pass.

     Falsified by dropping either half of the replace: without the split, `AvatarGroup` keeps
     its run; without the leading capital, `size` stays lowercase. */
  it("every compound export name is split, and nothing else moves", () => {
    expect(humanLabel("AvatarGroup")).toBe("Avatar Group");
    expect(humanLabel("SegmentedControl")).toBe("Segmented Control");
    // A prop is the same rule with the first word uncapitalized to begin with.
    expect(humanLabel("size")).toBe("Size");
    expect(humanLabel("lineNumbers")).toBe("Line Numbers");
    // Single words are already right and must not gain a space.
    expect(humanLabel("Shell")).toBe("Shell");
    expect(humanLabel("Kbd")).toBe("Kbd");
  });

  it("no registry name still reads as code once labelled", () => {
    // The general case over the real input: after labelling, no lowercase letter may be
    // followed directly by an uppercase one anywhere in the set.
    const wrong = ENTRIES.map((entry) => humanLabel(entry.name)).filter((label) =>
      /[a-z][A-Z]/.test(label),
    );
    expect(wrong).toEqual([]);
    // Vacuity: the set must actually contain compound names, or the walk above proves nothing.
    expect(ENTRIES.filter((entry) => /[a-z][A-Z]/.test(entry.name)).length).toBeGreaterThan(3);
  });
});

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
  it("every abstract is ONE real sentence, and every overview is real prose", () => {
    // The abstract is the page's deck, the search index's first words and the builder
    // inspector's header. One sentence is the whole register the 2026-09-05 rewrite is about,
    // so it is held rather than encouraged: a four-sentence abstract is the old `blurb` back.
    for (const entry of ENTRIES) {
      const abstract = entry.abstract.trimEnd();
      // THE FLOOR IS LOW ON PURPOSE, and the one-sentence rule below is the real guard.
      // "Text sets body copy." is twenty characters and is exactly the right abstract; a floor
      // set where a placeholder would fail was failing the shortest true sentence in the set.
      expect(abstract.length, `${entry.slug}: an abstract too short to say anything`).toBeGreaterThan(
        18,
      );
      expect(abstract.endsWith("."), `${entry.slug}: an abstract with no full stop`).toBe(true);
      expect(
        abstract.slice(0, -1),
        `${entry.slug}: an abstract of more than one sentence`,
      ).not.toMatch(/[.?!]\s/);
      expect(entry.overview.length, `${entry.slug}: no overview`).toBeGreaterThan(0);
      for (const paragraph of entry.overview) {
        expect(
          paragraph.length,
          `${entry.slug}: an overview paragraph that says nothing`,
        ).toBeGreaterThan(40);
      }
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

  /**
   * `axes` IS DELETED (2026-09-05), and this is what stands where its law did.
   *
   * The field held a hand-written note per axis, and the comment above the old law claimed the
   * notes were "the meaning half — the generated table already carries names and types". They
   * were not: measured across the registry, 109 of 135 axes were also props of the component or
   * one of its parts, and the two texts were the same sentence twice — Button's `size` read "an
   * index into the height scale, not a measurement" beside a generated "An index into the
   * control family, never a measurement". One fact, two homes, and the hand-written one is the
   * one that can go stale.
   *
   * What the notes carried and the table does not is the VALUE LIST: the type column prints
   * `Size`, not `1 | 2 | 3 | 4`. That is one gap in the generator rather than 135 paragraphs,
   * and it is recorded rather than papered over.
   */
  it("no entry carries an axis note any more", () => {
    for (const entry of ENTRIES) {
      expect("axes" in entry, `${entry.slug} still states axes; the props table is their home`).toBe(
        false,
      );
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
    e.abstract,
    ...e.overview,
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
    expect(entry.overview.join(" ")).toMatch(/slides/);
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

  /**
   * VARIANTS RIDE THE SAME CONVENTION (2026-09-05): `examples/<slug>.<variant>.tsx`, declared
   * on the entry, so the file name is still the identity and there is no mapping field.
   *
   * The reverse direction is the half that matters and it is deliberately NOT widened to "any
   * name containing a dot": a specimen nobody links to is a file that compiles, passes lint,
   * and is reachable from no page — which is exactly what this law was written for. So a
   * variant file counts as covered only when its entry names it.
   */
  it("every entry's declared variants have a file", () => {
    const missing = ENTRIES.flatMap((entry) =>
      (entry.variants ?? [])
        .filter((variant) => !EXAMPLES[`${entry.slug}.${variant.name}`])
        .map((variant) => `${entry.slug}.${variant.name}`),
    );
    expect(missing).toEqual([]);
    // Vacuity: the walk above is empty on a registry with no variants at all.
    expect(ENTRIES.filter((entry) => entry.variants).length).toBeGreaterThan(0);
  });

  /**
   * A CHAPTER MAY OWN AN EXAMPLE TOO.
   *
   * `Example` has been in the chapter mapping since the canon shipped, described there as the
   * thing a chapter cannot express in markdown — and until now this law would have rejected
   * any example a chapter added, because the only names it accepted were a component's slug
   * and a variant's. The affordance was offered and forbidden at the same time, which nothing
   * caught because no chapter had tried to use it.
   *
   * A chapter DECLARES its examples (`chapters.ts`) where a component page infers them from
   * its slug. The reason is that a component page renders exactly one specimen, named after
   * the thing it documents, while a chapter renders however many it needs and is named after
   * a subject rather than a component.
   */
  it("every example belongs to a component, a variant, or a chapter", () => {
    const known = new Set([
      ...slugs,
      ...ENTRIES.flatMap((entry) =>
        (entry.variants ?? []).map((variant) => `${entry.slug}.${variant.name}`),
      ),
      ...CHAPTERS.flatMap((chapter) => chapter.examples ?? []),
    ]);
    expect(Object.keys(EXAMPLES).filter((name) => !known.has(name))).toEqual([]);
  });

  /* And the other direction, which is the half that fails when a chapter renames its example
     file: a declared name with no module is a chapter that throws on render. */
  it("every example a chapter declares exists", () => {
    const declared = CHAPTERS.flatMap((chapter) =>
      (chapter.examples ?? []).map((name) => ({ chapter: chapter.slug, name })),
    );
    // The walk has to find something, or both this law and the one above audit nothing.
    expect(declared.length).toBeGreaterThan(0);
    expect(declared.filter(({ name }) => !EXAMPLES[name])).toEqual([]);
  });

  /**
   * AN EXAMPLE PAINTS NOTHING OF ITS OWN (2026-09-05).
   *
   * This site's stance since 2026-08-05 is that every visible pixel is `@kookie-ui/react` — a
   * design system whose docs are built on someone else's UI argues against itself — and an
   * example rooted in a bare `<div>` is that rule broken in the one place a reader COPIES from.
   *
   * It is also how a real defect arrived. The RTL accordion was wrapped in a plain `<div>`, and
   * the specimen stage is a centring flex row, so the div shrink-wrapped and the accordion's
   * own fill-your-container rule filled a box sized by its own content: measured at 264px
   * against 556px for its siblings, and moving. A `Box` is the system's div and does not have
   * that shape by accident — and where the direction can sit on the component itself, no
   * wrapper is needed at all.
   *
   * The walk reads the ROOT only. An example may still place a `<span>` or an `<a>` inside it —
   * `render={<a href/>}` is the point of several of them.
   */
  it("no example is rooted in a bare HTML element", () => {
    const bare: string[] = [];
    for (const name of Object.keys(EXAMPLES)) {
      // Read off disk rather than through `example.tsx`: that module pulls the playground,
      // which is a client component, and a node law has no business mounting one.
      const source = readFileSync(join(here, "../../../examples", `${name}.tsx`), "utf8");
      const root = /return \(\s*\n\s*<(\w+)/.exec(source);
      if (root && /^[a-z]/.test(root[1]!)) bare.push(`${name} → <${root[1]}>`);
    }
    expect(bare).toEqual([]);
    // Vacuity: the regex must be finding roots at all.
    expect(Object.keys(EXAMPLES).length).toBeGreaterThan(50);
  });

  it("a variant says why you would look at it, and is named rather than numbered", () => {
    // The anti-stub bar the coverage laws always owe: the cheapest way to satisfy the one
    // above is a variant whose reason says nothing, and "Example 2" is what an unlabelled
    // departure becomes.
    for (const entry of ENTRIES) {
      for (const variant of entry.variants ?? []) {
        expect(variant.name, `${entry.slug}: a variant name is a file suffix`).toMatch(
          /^[a-z][a-z0-9-]*$/,
        );
        expect(
          variant.title.length,
          `${entry.slug}.${variant.name}: a title too short to name anything`,
        ).toBeGreaterThan(8);
        expect(
          variant.why.length,
          `${entry.slug}.${variant.name}: says nothing about why you would look`,
        ).toBeGreaterThan(60);
      }
    }
  });
});

/**
 * A PAGE'S INDEX MUST INDEX WHAT IT CLAIMS TO (2026-09-04, widened 2026-09-05).
 *
 * A compound component renders its symbols grouped by job, and the grouping is hand-written.
 * An index that has drifted from the thing it indexes is worse than no index: a part left out
 * of every group renders on no page at all, and a symbol named in a group that is not a part
 * renders a heading with an empty sentence under it. Both are silent, and both are one
 * forgotten line away at all times.
 *
 * The pairing with `declaration` is held too, because the two are one decision: a component
 * with parts has a shape to show AND a grouping to make, and one without has neither.
 */
describe("a compound component's topics index every symbol it has, exactly once", () => {
  const compound = ENTRIES.filter((entry) => entry.topics);

  it("the components with parts are the components with topics and a declaration", () => {
    // The vacuity guard and the pairing at once. Every check below loops over `compound`, so a
    // registry that lost the field would pass them all by having nothing to check.
    expect(compound.length).toBeGreaterThan(5);
    for (const entry of ENTRIES) {
      const hasParts = Boolean(entry.parts?.length);
      expect(Boolean(entry.topics), `${entry.slug}: topics and parts disagree`).toBe(hasParts);
      expect(
        Boolean(entry.declaration),
        `${entry.slug}: a declaration shows a composition, so it pairs with having parts`,
      ).toBe(hasParts);
    }
  });

  it("every symbol named in a topic is the component or one of its parts", () => {
    for (const entry of compound) {
      const known = new Set([entry.name, ...(entry.parts ?? []).map((part) => part.part)]);
      for (const topic of entry.topics!) {
        for (const symbol of topic.symbols) {
          expect(
            known.has(symbol),
            `${entry.slug}: topic names "${symbol}", which is not a symbol`,
          ).toBe(true);
        }
      }
    }
  });

  it("every part appears in exactly one topic, and so does the component itself", () => {
    for (const entry of compound) {
      const listed = entry.topics!.flatMap((topic) => topic.symbols);
      const expected = [entry.name, ...(entry.parts ?? []).map((part) => part.part)];
      expect(
        [...listed].sort(),
        `${entry.slug}: the topics do not cover its symbols exactly once`,
      ).toEqual([...expected].sort());
    }
  });

  /**
   * A DECLARATION FITS THE WELL IT IS PRINTED IN (2026-09-05).
   *
   * Code wraps now, so an over-long line is legible rather than clipped — but a declaration is
   * the first thing under the title and a wrapped one reads as a mistake there. Eight of the
   * seventeen were over the measure on the day they were written, including the accordion's,
   * which is what a person saw.
   *
   * 68 is MEASURED, not chosen: at 1440 the well's content box is 556px and its mono advance
   * is 8.06px, so 68 characters is what fits. It is a floor on the writing rather than a claim
   * about the layout — the number moves if the reading measure does, and this comment is where
   * to look when it does.
   */
  it("every declaration line fits the well it is printed in", () => {
    for (const entry of compound) {
      for (const [i, line] of entry.declaration!.split("\n").entries()) {
        expect(
          line.length,
          `${entry.slug}: declaration line ${i + 1} runs past the well and wraps`,
        ).toBeLessThanOrEqual(68);
      }
    }
  });

  it("a declaration shows the component it declares", () => {
    for (const entry of compound) {
      expect(
        entry.declaration,
        `${entry.slug}: a declaration that does not name the component`,
      ).toContain(`<${entry.name}`);
    }
  });
});

describe("the reference page's headings carry the anchors its contents column points at", () => {
  const source = readFileSync(join(here, "[slug]/page.tsx"), "utf8");

  it("every heading it renders has an id", () => {
    // The defect verbatim: `render={<h2 />}` beside a contents entry naming `#overview`.
    const headings = source.match(/render=\{<h[2-6][^>]*\/>\}/g) ?? [];
    expect(headings.length, "no headings found; this walk has gone stale").toBeGreaterThan(2);
    for (const heading of headings) {
      expect(heading, "a heading with no anchor for the contents column to land on").toContain(
        "id=",
      );
    }
  });

  it("no section states its title as a literal", () => {
    // A literal is a title the contents list cannot see. `SECTIONS` is the one home, and both
    // the heading and the entry turn it into an anchor with the same `slugify`.
    expect(source, "a section title written as a literal").not.toMatch(/<Section\s+title="/);
    /* EVERY NAMED SECTION IS USED, which is the real claim. It counted `<Section` occurrences
       against the number of names until 2026-09-05, and that is a proxy rather than the claim:
       the Examples/Example ternary renders one element from two names, so the count went wrong
       on a correct page the day a section learned to change its own title.

       WHAT IT CATCHES, STATED HONESTLY: a name with NO reader left in the file. Its first
       sabotage removed one of the two readers `SECTIONS.examples` has — the heading — and the
       law stayed green off the contents column's use, which is correct behaviour and a weaker
       guarantee than "every name is rendered". Falsified by removing both. */
    const names = [...source.matchAll(/^\s+(\w+): "/gm)].map((m) => m[1]);
    expect(names.length, "no section names found; this walk has gone stale").toBeGreaterThan(5);
    for (const name of names) {
      expect(source, `SECTIONS.${name} is named and never rendered`).toContain(
        `SECTIONS.${name}`,
      );
    }
  });

  /**
   * THE PROPS TABLE READS AT THE PAGE'S OWN STEP (2026-09-04, Kushagra: "Table should be size
   * 3, when rest of the prose is size 3").
   *
   * A table's index prices the cell inset AND the type step, so the default `2` sets the one
   * column that is real prose — what the prop does — two ramp steps under the paragraph above
   * it. It was stated, then LOST on 2026-09-05 when the trial layout and the essay layout were
   * collapsed into one file: the comment saying "SIZE 3, LIKE EVERY OTHER SENTENCE ON THE
   * PAGE" survived the rewrite and the `size` attribute did not, so the page carried a claim
   * and its own contradiction for as long as the file existed. Measured on the running site at
   * 14px against 16px prose.
   *
   * A SOURCE LAW, and the limit is worth stating: the docs project runs in node, so nothing
   * here can read a computed value the way the package's browser laws do. What it pins is that
   * the number is stated at all — which is exactly the failure that happened.
   */
  it("the props table is set at the page's reading step, not the default", () => {
    expect(source, "the props table fell back to Table's default index").toContain(
      '<Table size="3">',
    );
    expect(source, "a table that states no size takes the default").not.toMatch(/<Table>/);
  });

  it("both sides turn a title into an anchor with the same function", () => {
    // If either side ever spells its own slug, the two can disagree silently — which is the
    // failure that shipped. `slug.ts` states why it is a module rather than two inlined lines.
    expect(source).toContain('import { slugify } from "../../slug"');
    expect(source, "a heading anchor spelled by hand").not.toMatch(/id=\{[^}]*replace\(/);
  });
});
