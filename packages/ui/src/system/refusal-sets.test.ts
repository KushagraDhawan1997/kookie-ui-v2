/**
 * THE RULE AGREES WITH THE SHIPPED DECLARATIONS (2026-09-07, the audit).
 *
 * `refusal-sets.ts` states in code the sentence `refused.ts` had only stated in prose: every
 * component takes the whole set, the four layouts own the margin row and take the reflexes
 * alone, and Theme additionally refuses Radix Themes' four `<Theme>` props. Both agent surfaces
 * ask it. A rule can disagree with what the components actually declare, and writing it down
 * does not make that impossible — so this reads the DECLARATIONS the package ships and checks
 * them against the rule.
 *
 * IT READS `dist`, not `src`, and that is the whole point: the `.d.ts` a consumer resolves out
 * of `node_modules` is the surface a coding agent meets, and it is the one that can differ from
 * the source through a build. The dts-docs law next door reads the same files for the same
 * reason.
 *
 * IT FAILED WHEN IT WAS WRITTEN, against `CommandGroupLabel`, `CommandCollection` and
 * `CommandEmpty` — three exported components that declared their props inline rather than
 * through an exported type, so they intersected nothing and the whole mechanism was absent on
 * them. `<CommandGroupLabel variant="solid" m="4">` got a diagnostic naming no escape, and both
 * agent surfaces answered that nothing was refused.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { LAYOUT_SYMBOLS, REFUSAL_SETS, refusalSetsFor, typeRefusalsFor } from "./refusal-sets.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(HERE, "../../dist");

/** Every declaration file the build wrote, as one string per file. */
function declarations(): { file: string; text: string }[] {
  const out: { file: string; text: string }[] = [];
  const walk = (dir: string): void => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else if (item.name.endsWith(".d.ts")) out.push({ file: full, text: readFileSync(full, "utf8") });
    }
  };
  walk(DIST);
  return out;
}

describe("the refusal rule and the shipped declarations agree", () => {
  it("dist exists, so this law is reading the package rather than air", () => {
    expect(
      existsSync(path.join(DIST, "index.d.ts")),
      "no dist — run `pnpm --filter @kookie-ui/react build` (turbo's `test` task depends on `build` for this reason)",
    ).toBe(true);
  });

  it("every exported props type intersects the sets the rule says it does", () => {
    const files = declarations();
    expect(files.length).toBeGreaterThan(40);

    // `export type ButtonProps = ComponentRefusals & …` — the head of the declaration, which is
    // where a props type states what it refuses.
    const declared = new Map<string, Set<string>>();
    for (const { text } of files) {
      for (const [, symbol, head] of text.matchAll(
        /(?:export )?(?:declare )?type (\w+)Props(?:<[^=>]*>)?\s*=\s*([^{;]*)/g,
      )) {
        const sets = new Set([...head!.matchAll(/\b(\w+Refusals)\b/g)].map(([, name]) => name!));
        declared.set(symbol!, sets);
      }
    }
    expect(declared.size, "no props types found; the walk has gone stale").toBeGreaterThan(80);
    expect(declared.has("Button")).toBe(true);

    // ONLY THE PUBLIC ONES. `SidePaneProps`, `RenderProps` and `BoxStyleProps` are internal
    // pieces a props type is assembled FROM; they take no refusals because nothing renders
    // them, and the rule is about what a call site can write.
    const index = readFileSync(path.join(DIST, "index.d.ts"), "utf8");
    const exported = new Set(
      [...index.matchAll(/\btype (\w+)Props\b/g)].map(([, symbol]) => symbol!),
    );
    expect(exported.size, "the index exported no props types; this walk is reading air").toBeGreaterThan(80);
    expect(exported.has("Button")).toBe(true);

    const wrong: string[] = [];
    for (const [symbol, sets] of declared) {
      if (!exported.has(symbol)) continue;
      // The rule's answer, minus the one set no type can carry: `color` is refused by this
      // system and omitted from every props type, for the reason `refused.ts` gives at length.
      const expected = refusalSetsFor(symbol).filter((name) => name !== "PlatformOwnedRefusals");
      // A layout takes the reflexes alone; everything else takes the alias. Both spellings are
      // what a declaration really writes, so the comparison is on the sets a reader would see.
      const wanted = new Set(expected);
      const missing = [...wanted].filter((name) => !sets.has(name));
      // A type intersecting MORE than the rule says is also a disagreement: it means the rule
      // would tell an agent surface less than the compiler enforces.
      const extra = [...sets].filter((name) => !wanted.has(name));
      if (missing.length || extra.length) {
        wrong.push(`${symbol}Props: has [${[...sets].join(", ")}], rule says [${[...wanted].join(", ")}]`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it("the four layouts own the margin row and nothing else does", () => {
    for (const layout of LAYOUT_SYMBOLS) {
      const props = typeRefusalsFor(layout).map((row) => row.prop);
      expect(props, layout).not.toContain("m");
      expect(props, layout).toContain("variant");
    }
    expect(typeRefusalsFor("Button").map((row) => row.prop)).toContain("m");
    // Theme is the third shape: the reflexes plus its own four.
    expect(typeRefusalsFor("Theme").map((row) => row.prop)).toContain("accentColor");
    expect(typeRefusalsFor("Theme").map((row) => row.prop)).not.toContain("m");
  });

  it("every set the rule can name is a set that exists", () => {
    for (const symbol of ["Button", "Box", "Theme", "MenuItem"]) {
      for (const name of refusalSetsFor(symbol)) {
        expect(REFUSAL_SETS[name], `${symbol} names a set that does not exist: ${name}`).toBeDefined();
        expect(REFUSAL_SETS[name]!.length).toBeGreaterThan(0);
      }
    }
  });

  it("every refusal carries an escape, which is the point of the mechanism", () => {
    for (const rows of Object.values(REFUSAL_SETS)) {
      for (const row of rows) {
        expect(row.why.length, row.prop).toBeGreaterThan(40);
        // A sentence that only says no. Every one of these names what to write instead, and
        // the cheapest way to check that without pinning prose is that it points somewhere.
        expect(row.why, row.prop).toMatch(/`|Use |Wrap |Pass |set /);
      }
    }
  });
});
