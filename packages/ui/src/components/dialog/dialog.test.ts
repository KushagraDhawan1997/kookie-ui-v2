/**
 * Dialog's NODE laws — what the emitted stylesheet says, where a mount cannot answer.
 *
 * One question so far: the sheet presentation's viewport boundary. CSS cannot `var()` a media
 * query, so the boundary is a literal in the sheet, and this is what keeps that literal from
 * becoming a second home for a number config already owns. Shell's own law, one component
 * over — and the reason it exists there is the reason it exists here: the two files now state
 * the same boundary, and two literals is exactly one more than the system has.
 */
import { describe, expect, it } from "vitest";

import { narrowMedia } from "../../tokens/config.ts";
import { sheet } from "../../test/stylesheets.ts";

const css = sheet("components/dialog/dialog.css");

describe("the sheet's viewport boundary is config's, verbatim (§18, §24)", () => {
  it("the one width query is the narrow boundary — derived here, so a respelled literal fails", () => {
    const queries = css.match(/@media\s*\(max-width:[^)]*\)/g) ?? [];
    expect(queries).toHaveLength(1);
    expect(queries[0]!.replace(/\s+/g, " ")).toBe(`@media ${narrowMedia}`);
  });

  it("and it is the SAME boundary the shell resolves its own panes at", () => {
    // Not a restatement of the law above: that one says dialog.css agrees with config, this
    // says the two consumers agree with EACH OTHER, which is the claim a reader actually
    // cares about — a dialog becomes a sheet at the width a shell pane starts overlaying.
    // Both derive, so this can only fail if one of them stops deriving.
    const shell = sheet("components/shell/shell.css");
    const of = (s: string) => (s.match(/@media\s*\(max-width:[^)]*\)/g) ?? [])[0]?.replace(/\s+/g, " ");
    expect(of(css)).toBe(of(shell));
  });
});

describe("a radius token is spent on a CORNER and nowhere else (the non-negotiable)", () => {
  it("found declarations to read", () => {
    // Vacuity: the walk below is a filter, and an empty sheet passes every filter.
    const all = css.match(/[a-z-]+\s*:[^;{}]*;/g) ?? [];
    expect(all.length).toBeGreaterThan(20);
  });

  it("no `--radius-*` reaches a property that is not a corner", () => {
    /**
     * "Semantic references, not numeric coincidence" — and this file was the rule's own worked
     * example until 2026-08-26: the sheet arm spent `var(--radius-0)` as the viewport's padding
     * and as the panel's bottom margin, because the palette's step 0 happens to be zero. It is
     * a RADIUS palette rung, re-declared inside every `[data-radius]` block, and the band was
     * re-authored wholesale on 2026-08-17 — so a level that gave step 0 a real curve would have
     * moved a gutter and a margin with it.
     *
     * Written as a walk rather than as two pinned lines: the next `--radius-N` spent on a
     * length is the one a pinned law would not see.
     */
    const declarations = css.match(/[a-z-]+\s*:[^;{}]*;/g) ?? [];
    const offenders = declarations.filter((d) => {
      const property = d.slice(0, d.indexOf(":")).trim();
      if (!/var\(--radius-/.test(d)) return false;
      // The corner properties, and only those. `--kui-sf-radius` and `--radius-surface-N`
      // reach a corner through the surface layer's own hook, which is why the custom-property
      // spelling is allowed here too.
      return !(/^border(-[a-z]+)*-radius$/.test(property) || property.startsWith("--"));
    });
    expect(offenders, `a radius token is spent as a length: ${offenders.join(" | ")}`).toEqual([]);
  });
});
