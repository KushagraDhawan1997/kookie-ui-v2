/**
 * THE HARNESS INSTALLS THE CASCADE THE PACKAGE SHIPS — IN ORDER (2026-08-26).
 *
 * `installStyles()` (test/browser.tsx) concatenates every stylesheet into one `<style>`, and
 * says so in its own words: "in the order styles/index.css imports them — order is
 * load-bearing". That sentence was a claim about memory, and memory had already failed: six
 * of the thirty-four positions had drifted (scroll-area, segmented-control, select, popover,
 * progress and radio installed in a different relative order than the entry point imports
 * them), so every mounted law in this package was resolving same-specificity ties the
 * OPPOSITE way from the artifact a consumer loads.
 *
 * Nothing caught it, because both existing laws are MEMBERSHIP laws in the two directions —
 * `recipes.test.ts` asserts every walked stylesheet appears in the entry, and that every
 * entry import appears in the harness — and a `toContain` never reads an index. The exposure
 * was latent rather than live on the day it was found (the only class two of the six share is
 * `.kui-scroll-viewport`, and those two rules differ in specificity), which is precisely the
 * shape this repo keeps paying for: a wrong instrument that happens to give the right answer
 * until the next rule is added. This system settles same-specificity ties by source order
 * routinely and in writing.
 *
 * So the order is a law now rather than a comment. It reads the two files as text — the
 * committed artifacts, the same thing `installStyles()` reads — and compares them position by
 * position, because "same set" is what was already true while the cascade was wrong.
 */
import { describe, expect, it } from "vitest";

import { raw } from "./stylesheets.ts";

/** The order `styles/index.css` imports the sheets in — the order Lightning concatenates them
 *  into `dist/styles.css`, verified against the built artifact when this law was written. */
function entryOrder(): string[] {
  const files = [...raw("styles/index.css").matchAll(/@import\s+"([^"]+)"/g)].map((m) =>
    m[1]!.split("/").pop()!,
  );
  // LOUD on a parse that finds nothing, for the reason stylesheets.ts's `block()` is loud:
  // two empty lists compare equal, and a law that passes because its parser broke is the
  // defect it exists to catch.
  if (files.length === 0) throw new Error("entryOrder(): no @import found in styles/index.css");
  return files;
}

/** The order `installStyles()` joins them in. Read through the `?raw` import bindings, so a
 *  law about ORDER cannot be satisfied by a rename: the identifier has to resolve to a file. */
function harnessOrder(): string[] {
  const source = raw("test/browser.tsx");
  const bindings = new Map(
    [...source.matchAll(/import\s+(\w+)\s+from\s+"([^"]+)\?raw"/g)].map((m) => [
      m[1]!,
      m[2]!.split("/").pop()!,
    ]),
  );
  if (bindings.size === 0) throw new Error("harnessOrder(): no `?raw` stylesheet imports found");
  const open = source.indexOf("sheet.textContent = [");
  if (open === -1) throw new Error("harnessOrder(): the install array was not found");
  const close = source.indexOf("].join", open);
  if (close === -1) throw new Error("harnessOrder(): the install array is unterminated");
  const files = [...source.slice(open, close).matchAll(/^\s*(\w+),\s*$/gm)]
    .map((m) => bindings.get(m[1]!))
    .filter((file): file is string => file !== undefined);
  if (files.length === 0) throw new Error("harnessOrder(): the install array named no sheets");
  return files;
}

describe("the browser harness installs the shipped cascade, in the shipped order (2026-08-26)", () => {
  const entry = entryOrder();
  const harness = harnessOrder();

  it("both lists parsed — an empty comparison agrees with everything", () => {
    // The negative control. Both readers throw rather than return `[]`, but the count is what
    // says the readers are reading the whole file and not its first line.
    expect(entry.length, "the entry point imports almost nothing").toBeGreaterThan(20);
    expect(harness.length, "the harness installs almost nothing").toBeGreaterThan(20);
  });

  it("position by position, the harness order IS the entry order", () => {
    // Positional, not set-wise: `toEqual` on sorted copies is the law that was already there
    // in two spellings and passed for six days over a wrong cascade.
    const drift = entry
      .map((file, i) => [i + 1, file, harness[i] ?? "—"] as const)
      .filter(([, want, got]) => want !== got)
      .map(([position, want, got]) => `  position ${position}: entry ${want} / harness ${got}`);
    expect(
      drift,
      `the harness resolves same-specificity ties differently from the artifact a consumer ` +
        `loads. Re-order the array in test/browser.tsx to match styles/index.css:\n${drift.join("\n")}`,
    ).toEqual([]);
  });
});
