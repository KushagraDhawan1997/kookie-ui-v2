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

describe("the sheet's viewport boundary is config's, verbatim (§18, §24)", () => {
  const css = sheet("components/dialog/dialog.css");

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
