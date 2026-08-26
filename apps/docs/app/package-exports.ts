/**
 * The package's public component names, parsed from `packages/ui/src/index.ts`.
 *
 * ONE HOME, because there are two coverage laws over the same list and they drifted
 * (2026-08-26). `registry.test.ts` asks whether every export is EXPLAINED and
 * `preview/playground.test.ts` asks whether every export is RENDERED; each carried its own
 * parser, and the playground's still anchored on `^export \{ ` with a literal space, so every
 * MULTI-LINE export block matched nothing — 18 names, `Theme` and all of Shell and Composer
 * among them, were outside a law whose header says "every component the package exports".
 * The registry's parser had already been repaired for exactly this on 2026-08-16, which is
 * the whole argument for the shared home: a copy that agrees today is the copy that silently
 * disagrees tomorrow.
 *
 * The index genuinely is source we cannot import for its SHAPE — importing it yields values,
 * not the set of names the module declares — so it is read as text, and every caller owes the
 * vacuity guard that goes with reading text.
 */
import { readFileSync } from "node:fs";

/** Uppercase VALUE exports — components, not hooks or types. */
export function parsePackageExports(source: string): string[] {
  const names: string[] = [];
  for (const m of source.matchAll(/^export \{([^}]*)\}/gms)) {
    for (const entry of m[1]!.split(",")) {
      const raw = entry.trim();
      // Types are excluded deliberately: a `type Foo` entry would otherwise be stripped of its
      // keyword by the `as` split below and pulled into the coverage set.
      if (!raw || raw.startsWith("type ")) continue;
      // `Foo as Bar` exports the second name, which is the one a consumer imports.
      const name = raw.split(/\s+as\s+/).pop()!.trim();
      if (/^[A-Z]/.test(name)) names.push(name);
    }
  }
  return names;
}

export const readPackageExports = (indexPath: string): string[] =>
  parsePackageExports(readFileSync(indexPath, "utf8"));
