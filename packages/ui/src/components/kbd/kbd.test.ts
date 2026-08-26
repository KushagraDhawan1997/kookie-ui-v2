/**
 * Kbd node laws (§5, §11) — the one claim that lives in the SOURCE rather than in a box a
 * browser can measure, written 2026-08-26 after the audit found the published sentence naming
 * two things that no longer exist.
 *
 * A JSDoc block on an exported component is not decoration here: `apps/docs` lifts it into the
 * published reference, so it is a SECOND implementation of a claim the stylesheet already
 * makes — and ENGINEERING §6's rule for two implementations of one mechanism is that they owe a
 * law that they AGREE. They did not. The cap's depth sentence said it reads `--control-chrome`
 * and that `surfaces` cannot move it, while the sheet has read `--kbd-relief` since the
 * 2026-08-17 lab port (kbd.css records that reversal in writing, two lines from the
 * declaration) and the Theme prop was renamed `depth` on 2026-08-10. Both halves were false and
 * nothing could tell: a maintainer greps for consumers of `--control-chrome`, finds this cap,
 * and reasons about a token it does not read.
 *
 * The law reads the CLAIM out of the sentence and checks it against the two homes that own the
 * facts — the stylesheet, and `themeAxes` — rather than grepping for a string. A keyword check
 * would go green on a reworded sentence and red on an honest one that explains the history,
 * which this JSDoc now does.
 */
import { describe, expect, it } from "vitest";

import { raw } from "../../test/stylesheets.ts";
import { themeAxes } from "../../theme/theme.tsx";

/** The source with its comment furniture removed, so a claim that wrapped across two lines
    reads as one sentence — a law keyed on where the line breaks fall is a law about the
    formatter. */
const source = raw("components/kbd/kbd.tsx").replace(/\n\s*\*\s?/g, " ");
const css = raw("components/kbd/kbd.css");

/** The claim, lifted from the published sentence — LOUD when it is not there, because a law
    that reads the empty string passes every assertion in it while checking nothing. */
function claim(): { token: string; prop: string } {
  const found = /It reads `(--[a-z-]+)`'s VALUE, never the world switch, so `([a-z]+)` cannot move it/.exec(source);
  if (!found) throw new Error("claim(): the cap's depth sentence is gone or reworded — reword this law with it");
  return { token: found[1]!, prop: found[2]! };
}

describe("the published depth sentence and the shipped cap agree (§5, §11)", () => {
  it("names the role the STYLESHEET reads, never a role it left behind", () => {
    // Extracted from the declaration, never restated: the sheet is the home of this fact, so
    // re-pointing the cap and forgetting the sentence is what has to fail here.
    const declared = /--kui-ct-cast:\s*var\(--kui-kbd-cast,\s*var\((--[a-z-]+)/.exec(css)?.[1];
    expect(declared, "the cap's cast declaration is gone — this law has no subject").toBeTruthy();
    expect(claim().token, "the sentence names a role the cap does not read").toBe(declared);
  });

  it("names a Theme prop that exists", () => {
    // `surfaces` was renamed `depth` on 2026-08-10 and the sentence kept the old spelling, so
    // the one instruction it gave a reader was a type error. `themeAxes` is the single home
    // for what a Theme takes (2026-08-16); this asks it rather than a second copy of the list.
    expect(Object.keys(themeAxes)).toContain(claim().prop);
  });
});
