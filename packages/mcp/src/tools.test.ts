/**
 * WHAT AN ANSWER SAYS, as opposed to how long it is (`budget.test.ts`) or what the snapshot
 * holds (`data.test.ts`).
 *
 * The laws here are about the sentences a tool writes on its own account rather than carrying
 * from a source — the miss messages, which are the only prose in this package that is not
 * quoted from somewhere else. That is exactly where a hand-written list grows back, and one
 * had: the token miss message named fifteen families by hand, one of which headed no token and
 * fifty-one of which were missing.
 */
import { describe, expect, it } from "vitest";

import { data } from "./data.ts";
import { families, getComponent, getTokens, listComponents } from "./tools.ts";

describe("a miss points somewhere real", () => {
  it("names every head a token name actually begins with, and no other", () => {
    const message = getTokens({ query: "no-token-is-called-this" });
    const heads = new Set(
      data().tokens.map((token) => token.name.replace(/^--/, "").split("-")[0]!),
    );
    // Both directions. Naming a head that heads nothing sends a reader to an empty answer, and
    // omitting one hides a whole family — the shipped list did both.
    for (const head of heads) expect(message, `${head} is named`).toContain(head);
    const named = message.slice(message.indexOf("one of these: ")).replace("one of these: ", "");
    for (const word of named.replace(/\.$/, "").split(", ")) {
      expect(heads.has(word.trim()), `${word} heads a real token`).toBe(true);
    }
  });

  it("sends a name the system does not have to the ones it does", () => {
    // `Toast` is the question this system answers with a refusal, so a bare "not found" is the
    // one answer that would send a reader off to invent one.
    const answer = getComponent({ name: "Toast" });
    expect(answer).toContain("exports no `Toast`");
    expect(answer).toContain("Notice");
  });
});

describe("the family filter reaches every family there is", () => {
  it("offers exactly the families the registry states", () => {
    // `families()` is what closes the tool's own schema, so a list that fell behind the
    // registry would make a real family unaskable — and a shorter list is just a shorter walk,
    // which is why the sweep below cannot see it. This is the agreement, read from the
    // components rather than from the function under test.
    expect([...families()].sort()).toEqual(
      [...new Set(data().components.map((row) => row.family))].sort(),
    );
  });

  it("lists something for each one the registry states", () => {
    // The families are derived from the components, so this cannot go stale by a list falling
    // behind — what it catches is the filter itself failing to reach one.
    for (const family of new Set(data().components.map((row) => row.family))) {
      expect(listComponents({ family }), family).toContain(`## ${family}`);
    }
  });
});
