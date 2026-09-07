/**
 * THE CEILING, SWEPT.
 *
 * A client truncates a tool result at roughly 25,000 tokens. MUI's MCP server has an open bug
 * from exactly this, and the failure mode is the bad kind: the answer ends mid-sentence and
 * nothing says it was cut. So the claim this server makes — that no tool can produce one — is
 * checked against every answer it can give rather than against the one a demo happened to ask
 * for. Every component, every family, and a token query that matches everything.
 *
 * The budget is in characters because a server cannot tokenize the client's model. Three
 * characters to a token is the pessimistic end for prose with code in it, so the assertion is
 * made in both currencies: under the character ceiling, and under 25,000 tokens at that rate.
 */
import { describe, expect, it } from "vitest";

import { data } from "./data.ts";
import { CEILING, budgeted, checkCode, families, getComponent, getTokens, listComponents } from "./tools.ts";

const TOKEN_CAP = 25_000;
const CHARS_PER_TOKEN = 3;

const measure = (label: string, text: string): number => {
  expect(text.length, `${label} is under the character ceiling`).toBeLessThanOrEqual(CEILING);
  expect(
    Math.ceil(text.length / CHARS_PER_TOKEN),
    `${label} is under ${TOKEN_CAP} tokens at ${CHARS_PER_TOKEN} chars/token`,
  ).toBeLessThan(TOKEN_CAP);
  return text.length;
};

describe("no answer this server can give reaches the client's cap", () => {
  it("holds for every component reference", () => {
    let worst = { name: "", size: 0 };
    for (const row of data().components) {
      const size = measure(`get_component(${row.name})`, getComponent({ name: row.name }));
      if (size > worst.size) worst = { name: row.name, size };
    }
    // Printed rather than merely asserted: the number that matters is how much room is left,
    // and a law that only says "under" hides the day it stops being comfortably under.
    expect(worst.size).toBeGreaterThan(0);
    console.log(
      `largest component reference: ${worst.name} at ${worst.size} chars ≈ ${Math.ceil(worst.size / CHARS_PER_TOKEN)} tokens`,
    );
  });

  it("holds for the whole component list and for every family", () => {
    measure("list_components()", listComponents({}));
    for (const family of families()) measure(`list_components(${family})`, listComponents({ family }));
  });

  it("holds for a token query that matches every token at the largest limit", () => {
    // `--` is in every token name, and 200 is the schema's own maximum, so this is the widest
    // answer the tool can be made to give.
    const widest = getTokens({ query: "--", limit: 200 });
    measure("get_tokens(--, 200)", widest);
    expect(widest).toContain("more matched");
  });

  it("holds for a check over a large file", () => {
    // Every finding carries a paragraph, so the output grows with the mistakes rather than
    // with the input. A file with a thousand refused props is the shape that overflows.
    const code = Array.from({ length: 1000 }, () => `<Button variant="solid" m="4" />`).join("\n");
    measure("check_usage(1000 refusals)", checkCode({ code }));
  });
});

describe("the trim, when it happens, says so", () => {
  it("cuts to the ceiling INCLUDING the sentence that says it cut", () => {
    // Exercised on a string past the ceiling, because nothing this server answers today is
    // long enough to trim and the first spelling of this law simply re-measured a short answer
    // — it passed with `budgeted` replaced by the identity function, which is a law about
    // nothing. What must never happen is a silent cut, and the second thing that must never
    // happen is a trim that overflows: the notice is reserved out of the budget rather than
    // appended to it, so the result is under the ceiling WITH the sentence in it.
    const trimmed = budgeted("x".repeat(CEILING * 2));
    expect(trimmed.length).toBeLessThanOrEqual(CEILING);
    expect(trimmed).toContain("Trimmed here");
    // And it leaves a short answer alone, byte for byte, so the trim cannot fire on the
    // answers this server actually gives.
    const short = getTokens({ query: "radius-control", limit: 200 });
    expect(budgeted(short)).toBe(short);
  });
});
