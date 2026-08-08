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
