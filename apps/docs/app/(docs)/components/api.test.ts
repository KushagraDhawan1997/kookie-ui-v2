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
import { ENTRIES } from "./registry";
import { generatedText, resolvedPropNames } from "../../../scripts/generate-api";

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
