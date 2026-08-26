/**
 * The API tables cannot drift from the types (2026-08-21).
 *
 * Two laws, and they fail in different directions.
 *
 * The first is the DRIFT law, and it is `tokens.css`'s exactly: regenerate from the package
 * source, compare against the committed artifact, fail on any difference. That is what makes
 * a hand edit fail CI for everyone rather than only the session that made it — and it is why
 * the generator is never run by `build`, which would repair the evidence before the law could
 * read it (the 2026-08-03 hole, where the build regenerated the very files the drift law was
 * checking and won every race).
 *
 * The second is the AGREEMENT law: the generated table and the hand-written registry describe
 * the same components. A generated table can only say what a component HAS; the registry says
 * what it MEANS and what it refuses. They are two halves of one reference and there is exactly
 * one way for them to fail — an entry whose axis notes describe a prop that no longer exists,
 * which is the failure that shipped in 2026-08-08 (a documented `accentColor` that never
 * existed) and was caught by `tsc` only because the page happened to be TSX.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { API } from "./api.generated";
import { propDescription } from "./prop-description";
import { ENTRIES } from "./registry";
import { generatedText, propsOfSource, resolvedPropNames } from "../../../scripts/generate-api";

const here = fileURLToPath(new URL(".", import.meta.url));

describe("the generated API tables are current", () => {
  it("regenerating changes nothing", () => {
    // Compares the TEXT, not a subprocess's exit code. A `execFileSync` spelling would pass
    // its "did it throw" check for reasons that have nothing to do with drift and fail it for
    // reasons that have nothing to do with drift either — and this repo has been bitten twice
    // by a law whose real failure mode was "did not run" (the `docs:test` cache hit, turbo's
    // filtered environment starving the browser project). Importing the generator means the
    // law reads the same values the artifact was written from.
    expect(generatedText()).toBe(readFileSync(join(here, "api.generated.ts"), "utf8"));
  }, 60_000);

  it("carries the banner naming its source", () => {
    // A generated file opens with a header naming the config that produced it (ENGINEERING
    // §2). Editing one is structurally pointless and the header is what says so.
    const text = readFileSync(join(here, "api.generated.ts"), "utf8");
    expect(text).toContain("GENERATED — do not edit");
    expect(text).toContain("generate-api.ts");
  });
});

describe("the generated table and the written reference agree", () => {
  it("both sides found something", () => {
    // Vacuity. The generator walks the package index with an AST, so a change to how the
    // index is written could produce an empty table — and every loop below would pass.
    expect(Object.keys(API).length).toBeGreaterThanOrEqual(20);
    expect(ENTRIES.length).toBeGreaterThanOrEqual(20);
    expect(API.Button?.props.length).toBeGreaterThan(4);
  });

  it("every documented component has a generated table", () => {
    // Not every export needs one — a component whose whole API is its children declares no
    // props of its own — but a MISSING table is almost always a rename the reference has not
    // followed, so the failure names it.
    const missing = ENTRIES.filter((entry) => !API[entry.name]).map((entry) => entry.name);
    expect(missing).toEqual([]);
  });

  it("every prop the reference shows carries a doc comment", () => {
    // The floor under the whole generated half: a prop with no doc comment renders as a bare
    // name and a type, which teaches nothing a reader could not have guessed. ENGINEERING
    // §1.7 requires JSDoc on every exported prop precisely so this table can carry it, and
    // the props that fail are almost always ones added in a hurry.
    //
    // PARTS ARE WALKED TOO (widened 2026-08-21). The first spelling looped `ENTRIES` alone,
    // which lists compound ROOTS — so `MenuItem`, `SelectItem`, every Dialog part and
    // `TabsList.size` were outside it, and 64 undocumented props sat behind a green law. That
    // is the law being narrower than the rule it claims to enforce, which is the same defect
    // as a law that cannot fail, only quieter: it passes for a reason unrelated to the
    // guarantee. `TabsList.size` is the one that shows why it matters — it carries the same
    // decision as SegmentedControl's (the index sits on the list, not on each tab) and was
    // invisible purely because its registry entry is keyed `Tabs`.
    const undocumented: string[] = [];
    const check = (name: string) => {
      for (const prop of API[name]?.props ?? []) {
        // `className`, `style` and `children` are the universal ones, documented once in the
        // reference page's "Everywhere" section rather than 31 times in 31 tables.
        if (prop.name === "className" || prop.name === "style") continue;
        if (prop.doc.length < 10) undocumented.push(`${name}.${prop.name}`);
      }
    };
    for (const entry of ENTRIES) {
      check(entry.name);
      for (const part of entry.parts ?? []) check(part.part);
    }
    expect(undocumented).toEqual([]);
  });

  it("no props table renders an empty description cell", () => {
    /**
     * The half the coverage law above deliberately does not cover, and the half a reader
     * actually meets. That law exempts `className` and `style` because their meaning is one
     * fact and 58 JSDoc copies of it would be 58 things to keep in step. Correct — but the
     * exemption rendered a BLANK CELL for six of every table's rows, so a reader scanning the
     * props learned nothing and had nothing pointing them at the section that would have told
     * them. Found by eye on a table that had shipped that way from the start.
     *
     * This reads what the PAGE will render rather than what the generator emitted, which is
     * the difference that makes it a law about the reader's experience instead of about the
     * data behind it. A prop whose doc is empty and whose name the renderer does not answer
     * fails here.
     */
    const blank: string[] = [];
    for (const [component, entry] of Object.entries(API)) {
      for (const prop of entry.props) {
        if (propDescription(prop).trim().length < 10) blank.push(`${component}.${prop.name}`);
      }
    }
    expect(blank).toEqual([]);
  });

  it("a per-component note is APPENDED to the universal sentence, never a replacement", () => {
    // The failure this catches is the cheap fix: a renderer that returns the JSDoc when there
    // is one and the shared sentence when there is not. A reader of MenuContent would then be
    // told where the class lands and never told what it does, which is the more basic fact.
    const menu = API.MenuContent!.props.find((prop) => prop.name === "className")!;
    expect(menu.doc, "the fixture needs a component that carries its own note").not.toBe("");
    const rendered = propDescription(menu);
    expect(rendered).toContain("appended to the ones this component resolves");
    expect(rendered).toContain("not on the positioner");

    // ...and the universal sentence is not doubled when the note restates its opening.
    expect(rendered.match(/Your classes/g)?.length).toBe(1);
  });

  it("no registry axis describes a prop the types do not have", () => {
    // The `accentColor` failure, made structural. An axis note is prose and can say anything;
    // an axis NAME is a claim about the API, so it is checked.
    //
    // Against the CHECKER's answer, not the AST's, and the difference is the whole law. The
    // generated table shows the props the package DECLARES, which is what a reader wants; a
    // prop can still be perfectly real and absent from it, because it arrived from an
    // imported type (`gap` on Flex, from Box's shared prop table) or from the platform
    // (`rows` on a textarea). Checking the displayed list would have failed on eight true
    // sentences — a law that is wrong about the general case while looking right on the one
    // its author had in mind, which is the shape three audits in this repo have now named.
    //
    // A compound's axis may live on a PART, so parts count too: `size` on Tabs is priced by
    // TabsList, and `backdrop` on Select by SelectTrigger. Axis names that are not bare
    // identifiers ("tone (Action)", "gap / gapX / gapY") are skipped honestly — a law that
    // demanded they parse would be asserting a naming convention rather than a fact.
    const resolved = resolvedPropNames();

    // Vacuity guard, and it is not theoretical: the checker needs the package's tsconfig to
    // resolve, and a program that fails to build returns an empty map — which would make
    // every name below "not wrong" and this the most confident empty law in the repo.
    expect(resolved.size).toBeGreaterThanOrEqual(20);
    expect(resolved.get("Flex")?.has("gap")).toBe(true);

    const wrong: string[] = [];
    for (const entry of ENTRIES) {
      const names = new Set(resolved.get(entry.name) ?? []);
      for (const part of entry.parts ?? []) {
        for (const name of resolved.get(part.part) ?? []) names.add(name);
      }
      for (const axis of entry.axes) {
        if (!/^[a-z][A-Za-z]*$/.test(axis.name)) continue;
        if (!names.has(axis.name)) wrong.push(`${entry.name}.${axis.name}`);
      }
    }
    expect(wrong).toEqual([]);
  }, 120_000);
});

describe("the walk reads a type operator as the operator, not as its target", () => {
  /**
   * Added 2026-08-26, for the half of the `Omit`/`Pick` branch that was never implemented.
   *
   * `Pick` was admitted into the branch on the day the generator shipped and then applied no
   * key filter at all: the target was collected and the keys thrown away, so a `Pick<T, K>`
   * resolved to every declared member of `T` — the operator INVERTED, and the mirror of the
   * `Omit` defect the branch's own comment records repairing ("a law that reports a refusal as
   * a feature is worse than no law").
   *
   * IT NEEDS A FIXTURE, and that is the point rather than a convenience. The only `Pick<` in
   * `packages/ui/src` is an internal alias `propsTypeLocations()` never reaches, so the defect
   * was LATENT: a law reading only what the package writes today could not fail until the day
   * the first narrowed part's API shipped an over-wide table. Neither existing law here can
   * see it either — the drift law compares against the artifact this generator wrote, and the
   * agreement law asks whether the registry's axis names are IN the checker's resolved set,
   * never whether the generated table is a SUBSET of it.
   *
   * The `Omit` arm is the calibration: same fixture, same walk, and it was already right, so a
   * failure in the `Pick` arm alone cannot be the harness misreading the source.
   */
  const FIXTURE = `
    type OwnProps = {
      /** The index. */
      size?: "1" | "2";
      /** The family. */
      tone?: "neutral" | "destructive";
      /** The rung. */
      emphasis?: "loud" | "quiet";
    };
    type NarrowedProps = Pick<OwnProps, "size" | "tone">;
    type WidenedProps = Omit<OwnProps, "emphasis">;
    type PickedNativeProps = Pick<React.ComponentPropsWithoutRef<"button">, "type">;
  `;

  it("`Pick` keeps only its keys, and `Omit` removes only its keys", () => {
    // The two arms answer DIFFERENTLY on one fixture, which is what makes it a fixture about
    // the operator rather than about the target: `Pick<…, "size" | "tone">` and
    // `Omit<…, "emphasis">` name the same two props by opposite routes, and the third prop is
    // what tells a working filter from a missing one. With the filter absent, `Pick` returned
    // all three.
    expect(propsOfSource(FIXTURE, "NarrowedProps").props.map((p) => p.name)).toEqual([
      "size",
      "tone",
    ]);
    expect(propsOfSource(FIXTURE, "WidenedProps").props.map((p) => p.name)).toEqual([
      "size",
      "tone",
    ]);
  });

  it("and a `Pick` of a native element does not claim the whole element", () => {
    // The second manifestation of the same root: `collect` sets the element note when it meets
    // `ComponentPropsWithoutRef<"button">`, and an un-narrowed `Pick` let that escape — so the
    // page would have printed "also takes every button prop" for a type that takes exactly
    // `type`. The picked platform keys are not listed, because their declarations live in
    // React's own lib and this walk reads the package's source; saying nothing is the honest
    // answer, and it is the one that does not overstate the API.
    expect(propsOfSource(FIXTURE, "PickedNativeProps").element).toBeNull();
  });
});
