/**
 * Select's SOURCE laws (2026-08-26 audit) — the two claims a mounted law cannot reach.
 *
 * Both are about text that a future reader acts on rather than about a computed value, which
 * is exactly why neither had a law: the browser suite reads what the engine resolved, and in
 * both cases the engine resolves the right thing today while the written justification points
 * somewhere else. `row.test.ts` set the precedent one component over — a law over prose reads
 * the prose, and it can only fail on the exact claim that was retracted.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { sheet, raw } from "../../test/stylesheets.ts";

const tsx = readFileSync(fileURLToPath(new URL("./select.tsx", import.meta.url)), "utf8");

/**
 * The trigger's identity must outrank `.kui-field`'s on SPECIFICITY, because source order
 * runs the wrong way.
 *
 * select.css states the trigger's three fill sources on `.kui-control.kui-select-trigger`
 * — (0,2,0) — against text-field.css's (0,1,0) `.kui-field`. Until 2026-08-26 the comment
 * above that rule said the two "TIE ... and win on source order", which is wrong twice: there
 * is no tie, and index.css imports select.css BEFORE text-field.css, so the loser of a tie
 * would be this file. The failure the comment invites is concrete — simplify the selector to
 * `.kui-select-trigger` on the strength of it and the trigger silently inherits the text
 * input's fill behaviour instead of its own. Nothing computes differently today (both files
 * point the sources at the same dress roles), so no mounted law can see it: this is the only
 * shape of law that can.
 */
describe("the trigger's fill sources win on specificity, not on order (§23)", () => {
  it("the selector stays doubled", () => {
    const css = sheet("components/select/select.css");
    const at = css.indexOf("--kui-ct-fill-src:");
    expect(at, "select.css no longer states the trigger's fill sources").toBeGreaterThan(0);
    const selector = css.slice(0, at).split("}").pop() ?? "";
    expect(
      selector,
      "the fill sources moved off `.kui-control.kui-select-trigger` — at (0,1,0) they tie with `.kui-field` and lose on import order",
    ).toContain(".kui-control.kui-select-trigger");
  });

  it("text-field.css really is the (0,1,0) opponent, and really does import later", () => {
    // The negative control the claim rests on. Both halves would have to be re-checked by
    // hand otherwise, which is how the comment came to state the opposite of both.
    const field = sheet("components/text-field/text-field.css");
    const at = field.indexOf("--kui-ct-fill-src:");
    expect(at, "text-field.css no longer pins a fill source").toBeGreaterThan(0);
    const selector = (field.slice(0, at).split("}").pop() ?? "").trim();
    expect(selector, "the field's pin is on the plain class").toContain(".kui-field");
    expect(selector, "the field's pin is not itself doubled").not.toContain(".kui-control.kui-field");

    const index = raw("styles/index.css");
    expect(
      index.indexOf("components/select/select.css"),
      "select.css must import BEFORE text-field.css — the whole reason specificity has to decide",
    ).toBeLessThan(index.indexOf("components/text-field/text-field.css"));
  });
});

/**
 * The ScrollArea refusal may not cite a mechanism that does not exist.
 *
 * The comment on `SelectPopup` named TWO things to measure before adopting the shared
 * ScrollArea: the overlap placement, and "the curtain". The curtain was built, judged and
 * deleted on 2026-08-17 — every other mention in the repository says so — so the instruction
 * could not be carried out, and the refusal read as twice as well founded as it is. A comment
 * is a work instruction here, not decoration.
 */
describe("select.tsx cites no deleted mechanism", () => {
  it("the curtain is not named", () => {
    expect(
      tsx,
      "the curtain came back into select.tsx's prose — it was deleted 2026-08-17 and cannot be measured",
    ).not.toMatch(/curtain/i);
  });

  it("the reason that survives is still stated", () => {
    // The anti-rot half: the cheapest way to satisfy the clause above is to delete the whole
    // refusal, which would leave the next reader with no reason at all.
    expect(tsx, "the ScrollArea refusal lost its remaining reason").toMatch(
      /overlap placement/i,
    );
  });
});
