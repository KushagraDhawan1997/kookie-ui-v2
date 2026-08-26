/**
 * The barrel's own laws (ENGINEERING §1.6, `index.ts:1` — "every export here is a decision").
 *
 * `index.ts` is the one file whose content IS the public API, and until 2026-08-26 nothing
 * read it against the document that decides what the API may contain. The component-reference
 * coverage law (`apps/docs/.../registry.test.ts`) walks the exports against the registry and
 * asks whether each one is EXPLAINED; it cannot ask whether the spec says the thing should
 * exist at all, and it is green either way — which is how a name DECISIONS refused shipped
 * publicly for three days, was documented as a live part in the reference, and appeared in six
 * preview demos while the spec said twice that it did not exist.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { raw, walkFiles } from "./test/stylesheets.ts";

const here = dirname(fileURLToPath(import.meta.url));
const barrel = readFileSync(join(here, "index.ts"), "utf8");
const decisions = readFileSync(join(here, "../../../docs/DECISIONS.md"), "utf8");

/** Every name the barrel publishes — values and types alike, since a refusal is a refusal of
    the NAME and `export type { X }` publishes it just as surely. */
function published(): Set<string> {
  const names = new Set<string>();
  for (const match of barrel.matchAll(/export\s*(?:type\s*)?\{([^}]*)\}\s*from/g)) {
    for (const entry of match[1]!.split(",")) {
      const raw = entry.trim().replace(/^type\s+/, "");
      if (!raw) continue;
      // `A as B` publishes B.
      const name = raw.split(/\s+as\s+/).pop()!.trim();
      if (name) names.add(name);
    }
  }
  return names;
}

/**
 * Every identifier DECISIONS says is refused, in the document's own canonical phrasing —
 * `` `name` is refused ``, `` `name` refused ``, `` `name` is REFUSED ``, with a short clause
 * allowed in between so "`bold` (700) is refused" and "`render` now refused" are caught.
 *
 * "deferred, not refused" is the one form excluded, because it says the opposite. It is
 * excluded by reading the words rather than by an allowlist: an allowlist is a place for a
 * real refusal to hide.
 */
function refusedInSpec(): Set<string> {
  const names = new Set<string>();
  const pattern = /`([A-Za-z][A-Za-z0-9]*)`([^.`\n]{0,40}?)\b(?:is\s+|are\s+|now\s+)?(refused|REFUSED)\b/g;
  for (const match of decisions.matchAll(pattern)) {
    if (/\bnot\s*$/.test(match[2]!)) continue;
    names.add(match[1]!);
  }
  return names;
}

describe("the spec and the barrel agree about what exists (ENGINEERING §1.6)", () => {
  it("no name DECISIONS refuses is a published export", () => {
    const exported = published();
    const refused = refusedInSpec();

    /**
     * THE VACUITY GUARDS, and both halves are needed. A regex that has stopped matching is a
     * law that has stopped existing — this repo's own favourite way of not failing — and a
     * barrel parser that returned nothing would pass the claim below trivially. The floors are
     * set well under today's counts (12 refusals, 200-odd names) so ordinary editing never
     * touches them, and a phrasing change that empties either scanner fails here by name.
     */
    expect(refused.size, "the refusal scanner found nothing — DECISIONS' phrasing moved and this law stopped reading it").toBeGreaterThan(5);
    expect(exported.size, "the barrel parser found nothing — index.ts' export shape moved").toBeGreaterThan(50);

    /**
     * Most of what the spec refuses is a PROP (`readOnly`, `orientation`, `cols`), which the
     * barrel could never publish anyway; that is the law being satisfied rather than being
     * vacuous, and it is also why the guard above counts the scanner's yield instead of this
     * intersection. The one it caught is the one that matters: `ComposerRow` sat here for three
     * days (2026-08-26), refused in §30 twice and exported at `index.ts:20`.
     *
     * The failure has exactly two honest repairs, and the message names both, because "delete
     * the export" and "amend the spec" are opposite decisions and only a person can pick. What
     * it is NOT is an exemption: if a paragraph needs to describe a refusal it has withdrawn,
     * it says what it used to do rather than re-saying it.
     */
    const both = [...refused].filter((name) => exported.has(name));
    expect(
      both,
      `DECISIONS.md refuses ${both.join(", ")}, and index.ts publishes ${both.length === 1 ? "it" : "them"}. ` +
        "The spec is the tie-breaker (THESIS's read order), so either withdraw the refusal in the same commit — " +
        "with the reason, the way §30 does for ComposerRow — or delete the export. Do not add an exemption here.",
    ).toEqual([]);
  });
});

describe("a re-export the barrel does not forward is a decision that did not take effect", () => {
  /**
   * ENGINEERING §1.6 gives the package ONE entry point and no deep imports, and `package.json`
   * enforces it — `exports` names `.`, `./styles.css` and `./package.json`, and nothing else.
   * So a module that writes `export type { X } from "…"` is stating that X is public, and the
   * statement only takes effect if `index.ts` carries it: otherwise the name is reachable from
   * nowhere at all.
   *
   * `dialog.tsx` did exactly that for `OverlayOpenChangeReason` / `OverlayOpenChangeDetails`,
   * with a comment saying they are "the overlay family's, shared with AlertDialog on the second
   * consumer" — and the barrel carried neither. The consequence was not hypothetical: the
   * generated component reference printed `(open: boolean, details: OverlayOpenChangeDetails)
   * => void` on two pages, naming a type whose only route was
   * `Parameters<NonNullable<DialogProps["onOpenChange"]>>[1]`. Forwarded 2026-08-26.
   *
   * The walk is what makes this a law rather than a note about one file (audit D14): it reads
   * every module the package ships, so the next component that re-exports a type cannot ship
   * the same gap.
   */
  const modules = [
    ...walkFiles("components", ".tsx", []),
    ...walkFiles("system", ".ts", []),
    ...walkFiles("system", ".tsx", []),
    ...walkFiles("theme", ".tsx", []),
  ].filter((path) => !path.includes(".test."));

  it("every cross-module type re-export reaches index.ts", () => {
    const claimed: { file: string; name: string }[] = [];
    for (const path of modules) {
      // Comments first: this repo's files quote their own forbidden shapes, and a law a comment
      // can satisfy is not a law (learned 2026-08-03, learned again 2026-08-05).
      const code = raw(path).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
      for (const match of code.matchAll(/export\s+type\s*\{([^}]*)\}\s*from/g)) {
        for (const entry of match[1]!.split(",")) {
          const name = entry.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()!.trim();
          if (name) claimed.push({ file: path, name });
        }
      }
    }

    // THE VACUITY GUARD, and it is the whole law today: exactly one module makes this claim, so
    // a walk that stopped finding files, or a regex that stopped matching, would pass in
    // silence. Reading the count is what turns "nothing was wrong" into "something was read".
    expect(
      claimed.length,
      "no module re-exports a type any more — either the walk stopped walking or the regex stopped matching",
    ).toBeGreaterThan(0);

    const exported = published();
    const stranded = claimed.filter(({ name }) => !exported.has(name));
    expect(
      stranded.map(({ file, name }) => `${file}: ${name}`),
      "a module re-exports these to make them public and index.ts does not carry them, so the " +
        "single-entry exports map leaves them reachable from nowhere. Forward them, or delete " +
        "the re-export — a name that is not published is not an API.",
    ).toEqual([]);
  });
});
