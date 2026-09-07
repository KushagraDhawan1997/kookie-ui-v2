/**
 * EVERY PUBLIC EXPORT CARRIES ITS DOC INTO THE SHIPPED ARTIFACT (2026-09-07).
 *
 * It reads `dist`, and reading the built output rather than the source is the entire point.
 * Measured on the day this was written: `button.tsx` held a correct paragraph naming the
 * margin escape — "write `<Box m=\"4\"><Button/></Box>`" — and `dist/components/button/
 * button.d.ts` declared `Button` bare, because `DoneSwap`'s own block had been written between
 * that paragraph and the export it describes. A source-level law passes on that file. Twenty-
 * three more exports were undocumented outright, among them every Menu part, every Toolbar
 * part and `useTheme`.
 *
 * WHY IT MATTERS MORE THAN IT LOOKS. A person reads the reference site. A coding agent writing
 * against this package in someone else's repository usually does not: it resolves
 * `node_modules/@kookie-ui/react/dist/**.d.ts` and reads what is there. That file is the one
 * documentation surface which needs no network, no fetch and no adoption — so a sentence that
 * does not reach it is, for that reader, a sentence nobody wrote.
 */
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const dist = path.resolve("dist");

/** Every value this package exports by name. Types are excluded — a `type` re-export carries
    its doc from the declaration, which is a different file and a different question. */
function exportedValues(): string[] {
  const source = fs.readFileSync(path.resolve("src/index.ts"), "utf8");
  const names = new Set<string>();
  for (const block of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of (block[1] ?? "").split(",")) {
      const spec = part.trim();
      if (!spec || spec.startsWith("type ")) continue;
      names.add((spec.split(" as ").pop() ?? "").trim());
    }
  }
  names.delete("");
  return [...names];
}

function declarationFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) declarationFiles(p, out);
    else if (entry.name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

describe("the shipped declarations", () => {
  it("were built — a law that reads a missing directory is a law that cannot fail", () => {
    expect(fs.existsSync(dist), "run `pnpm run build` before this suite").toBe(true);
  });

  it("document every value the package exports", () => {
    const wanted = new Set(exportedValues());
    expect(wanted.size).toBeGreaterThan(50);

    const undocumented: string[] = [];
    const seen = new Set<string>();
    for (const file of declarationFiles(dist)) {
      const lines = fs.readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        const declared = /^declare (?:function|const|class) (\w+)/.exec(line);
        const name = declared?.[1];
        if (!name || !wanted.has(name)) return;
        seen.add(name);
        // The comment has to END on the line before the declaration. That is the whole
        // mechanism TypeScript uses to attach a doc, and it is exactly what Button's block
        // stopped satisfying when another block was written underneath it.
        if (!(lines[i - 1] ?? "").trim().endsWith("*/")) {
          undocumented.push(`${name} (${path.relative(dist, file)}:${i + 1})`);
        }
      });
    }

    // A name that never appears as a declaration is a stale export or a stale build, and
    // either way this law would otherwise pass by looking at nothing.
    const missing = [...wanted].filter((n) => !seen.has(n));
    expect(missing, "exported but not declared in dist — stale build?").toEqual([]);
    expect(undocumented, "public exports with no doc comment in the shipped .d.ts").toEqual([]);
  });
});
