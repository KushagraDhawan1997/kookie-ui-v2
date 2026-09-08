/**
 * The tools this site offers an agent looking at it (§47).
 *
 * READ AS ANSWERS, not as shapes. Every claim below is about what a tool RETURNS for a real
 * input — that a snippet with a bad axis value is reported and a correct one is not, that a
 * component's page arrives, that a token's live value comes back. A law asserting that four
 * tools exist and have names would pass against a set that answers nothing, which is this
 * repo's most-repeated defect.
 *
 * The env is stubbed, which is the point of `buildTools` taking one: the two questions that
 * need a browser are handed in, so everything else is checkable here.
 */
import { readFileSync } from "node:fs";

import { componentAxes } from "@kookie-ui/react";
import { CONFORMANCE_CASES, TOOL_NAMES, WEB_TOOL_PREFIX, webToolName } from "@kookie-ui/react/agent";
import { describe, expect, it } from "vitest";

import {
  FAMILIES,
  buildTools,
  checkSnippet,
  entryFor,
  listComponents,
  matchTokens,
  snippetNotes,
  type ToolEnv,
} from "./agent-tools";
import { ENTRIES } from "./components/registry";
import { API } from "./components/api.generated";
import { candidatesIn, registerTools } from "./webmcp-register";

/** A page that serves twins, a stylesheet with two tokens in it, and nothing else. */
const env: ToolEnv = {
  fetchText: async (path) => {
    if (path === "/components/button.md") return "# Button\n\nthe twin\n";
    throw new Error("404");
  },
  /* THE PAIR IS `--space-3` AND `--layout-space-3`, and both are real tokens this system
     emits. It took two tries to get here and both earlier fixtures were laws about nothing.
     The first was sorted, so the caller's order did the ranking's job. The second dropped the
     sort and kept `--accent-9`/`--accent-9-contrast`, where the exact name is a PREFIX of the
     other — so plain alphabetical order already puts it first and deleting the exact-first
     clause changed nothing. The exact name has to sort LATE among its own matches, or the
     clause under test has no work to do. */
  tokenNames: () => ["--space-3", "--layout-space-3", "--color-surface"],
  resolveToken: (name) => (name === "--space-3" ? "8px" : ""),
};

const tools = buildTools(env);
/** The one problem a snippet raised, asserted to be the only one. Two jobs in one expression
    because "it found this" and "it found nothing else" are both part of every claim below —
    a check that reports a real fault plus two invented ones is not a working check. */
const only = (found: readonly { symbol: string; message: string }[]) => {
  expect(found).toHaveLength(1);
  return found[0]!;
};

const call = (name: string, input: Record<string, unknown>) => {
  const tool = tools.find((t) => t.name === name);
  if (!tool) throw new Error(`no tool ${name}`);
  return tool.execute(input);
};

describe("the catalogue", () => {
  it("lists every component the registry holds", async () => {
    const out = await call(webToolName("list"), {});
    expect(out).toContain(`${ENTRIES.length} of ${ENTRIES.length} components.`);
    for (const entry of ENTRIES) expect(out).toContain(`${entry.name} — ${entry.family}`);
  });

  it("filters by family, and the families come from the entries", async () => {
    expect(FAMILIES).toContain("Control");
    const out = await call(webToolName("list"), { family: "Control" });
    const controls = ENTRIES.filter((e) => e.family === "Control");
    expect(out).toContain(`${controls.length} of ${ENTRIES.length}`);
    // A component from another family must not appear. Surface is the family Card is in, and
    // a fixture where both families held the same names could not tell filtering from not.
    const surface = ENTRIES.find((e) => e.family === "Surface");
    expect(surface).toBeDefined();
    expect(out).not.toContain(`\n${surface!.name} — `);
  });

  /* THE REFUSALS ARE SEARCHABLE, which is the one thing this list does that a generated API
     table cannot. The needle is taken from a real refusal rather than invented, so the law
     cannot pass by matching an abstract that happens to use the same word. */
  /* A QUERY EXCLUDES. Nothing here asserted that until it was measured: with the query arm
     deleted outright — every row returned for every word — all 22 laws stayed green, because
     the refusal law below only asks whether one name is PRESENT in a list that then held every
     name. A word no component matches is the input where filtering and not filtering give
     different answers, which is what the fixture has to be built on. */
  it("excludes what a query does not match, rather than listing everything", async () => {
    const out = await call(webToolName("list"), { query: "zzqxnothing" });
    expect(out).toContain("No component matches");
    expect(out).not.toContain("/components/");
  });

  it("matches a word in a refusal, not only in the abstract", async () => {
    const withRefusal = ENTRIES.find((entry) =>
      entry.refusals.some(
        (r) =>
          /shadow/i.test(r.name) &&
          !/shadow/i.test(entry.abstract) &&
          !/shadow/i.test(entry.name),
      ),
    );
    expect(withRefusal, "no entry refuses a shadow without naming one").toBeDefined();
    const out = await call(webToolName("list"), { query: "shadow" });
    expect(out).toContain(withRefusal!.name);
    // And it narrowed to get there: an unfiltered list contains that name too.
    expect(out).not.toContain(`${ENTRIES.length} of ${ENTRIES.length} components.`);
  });
});

describe("one component", () => {
  it("resolves either name a reader has, and serves the page's own twin", async () => {
    expect(entryFor("Button")?.slug).toBe("button");
    expect(entryFor("button")?.name).toBe("Button");
    expect(await call(webToolName("get"), { name: "Button" })).toBe("# Button\n\nthe twin\n");
  });

  /* THE FALLBACK IS POORER AND SAYS SO. It is reached by asking for a component whose twin
     this stub refuses, which is every component but Button — so the arm is exercised by the
     fixture rather than by a flag. */
  it("falls back to the registry when the twin cannot be fetched", async () => {
    const entry = ENTRIES.find((e) => e.slug !== "button" && API[e.name]?.props.length)!;
    const out = await call(webToolName("get"), { name: entry.name });
    expect(out).toContain("could not be fetched");
    expect(out).toContain(entry.abstract);
    for (const refusal of entry.refusals) expect(out).toContain(refusal.name);
    expect(out).toContain(`\`${API[entry.name]!.props[0]!.name}`);
  });

  it("says so rather than throwing when the name is not a component", async () => {
    const out = await call(webToolName("get"), { name: "Frobnicator" });
    expect(out).toContain("No component called");
  });
});

describe("checking a snippet", () => {
  it("finds nothing wrong with correct code", () => {
    expect(
      checkSnippet(
        `import { Button, Card } from "@kookie-ui/react";
         <Card size="3"><Button size="2" tone="destructive" emphasis="loud">Delete</Button></Card>`,
      ),
    ).toEqual([]);
  });

  it("names an import the package does not export", () => {
    const found = checkSnippet(`import { Button, Stack, Sheet } from "@kookie-ui/react";`);
    expect(only(found).message).toContain("does not export Sheet");
    expect(found[0]!.symbol).toBe("Sheet");
  });

  /* A VALUE OUTSIDE THE AXIS. `size="7"` is legal-looking React, and the list it is wrong
     against is the one the package compiled with. The message must carry the real values, or
     it is a complaint rather than an answer.

     The assertion is on the SUBSTANCE — the prop, the offending value and the legal set — and
     not on the sentence, because the sentence is now the shared checker's. This file used to
     write its own, and the duplicate is exactly what was removed: with both implementations
     live, this snippet reported `Button.size` twice and it was the neighbouring law that said
     so. Pinning a wording here would put a second opinion back, one layer up. */
  it("names a prop value the axis does not hold, and prints the values it does", () => {
    const problem = only(checkSnippet(`<Button size="7">Save</Button>`));
    expect(problem.symbol).toBe("Button.size");
    expect(problem.message).toContain("size");
    expect(problem.message).toContain("7");
    for (const value of componentAxes.size) expect(problem.message).toContain(value);
  });

  it("names a tone that is not one of the system's families", () => {
    const found = checkSnippet(`<Button tone="purple">Save</Button>`);
    expect(found.map((p) => p.symbol)).toEqual(["Button.tone"]);
  });

  /* AN UNKNOWN TAG IS SAID ONCE, AS A NOTE. It was a numbered problem beside real defects
     until the audit: this file cannot tell a typo from a local component, and a hedged entry
     in a list of defects reads as a defect. The server has always printed it as a trailing
     note, and now so does this. Both halves are asserted, because a note that says nothing and
     a note that repeats itself are different failures. */
  it("names an unknown tag once, and not as a problem", () => {
    expect(checkSnippet(`<Widget/><Widget/><Widget/>`)).toEqual([]);
    const notes = snippetNotes(`<Widget/><Widget/><Widget/>`);
    expect(notes.join(" ")).toContain("Widget");
    expect(notes.join(" ").match(/Widget/g)).toHaveLength(1);
  });

  /* A TAG THE SNIPPET IMPORTS FROM SOMEWHERE ELSE IS NOT SAID AT ALL. Over this site's own 65
     example files the tag check raised 18 problems and every one was an icon or a local block,
     so the answer an agent read was noise it had to discard entirely. Both halves are asserted:
     silence with the import, and the SAME tag still named without one — without the second,
     deleting the tag check whole would pass. */
  it("does not name a tag the snippet imports from another module", () => {
    const imported = `import { HugeiconsIcon } from "@hugeicons/react";
         import { Button } from "@kookie-ui/react";
         <Button leading={<HugeiconsIcon/>}>Save</Button>`;
    expect(checkSnippet(imported)).toEqual([]);
    expect(snippetNotes(imported)).toEqual([]);
    expect(snippetNotes(`<HugeiconsIcon/>`).join(" ")).toContain("HugeiconsIcon");
  });

  it("leaves lowercase elements and non-axis props alone", () => {
    expect(checkSnippet(`<div className="x" id="y"><Button aria-label="Save"/></div>`)).toEqual([]);
  });
});

describe("tokens", () => {
  it("ranks an exact name first even where alphabetical order would bury it", () => {
    expect(matchTokens(env.tokenNames(), "space-3")).toEqual(["--space-3", "--layout-space-3"]);
  });

  /* THE OTHER CLAUSE. A query with no exact match falls to alphabetical, which is what stops
     the answer being whatever order the generator happened to emit in. Read separately,
     because a law over a two-clause comparator that only exercises one clause is half a law. */
  it("falls to alphabetical when nothing matches the query exactly", () => {
    expect(matchTokens(env.tokenNames(), "-")).toEqual([
      "--color-surface",
      "--layout-space-3",
      "--space-3",
    ]);
  });

  it("reads the live value, and says so when a token resolves to nothing", async () => {
    const out = await call(webToolName("tokens"), { query: "space-3" });
    expect(out).toContain("--space-3: 8px");
    expect(out).toContain("--layout-space-3: (resolves to nothing in this scope)");
  });

  it("says nothing matches rather than returning an empty list", async () => {
    expect(await call(webToolName("tokens"), { query: "nope" })).toContain("No token matches");
  });
});

/**
 * The registration adaptor.
 *
 * The proposal has moved the object and the call, so what is checked is that this file follows
 * it rather than that it makes one particular call: `document` before `navigator`, per-tool
 * before whole-set, and nothing at all where there is no host.
 */
describe("registering", () => {
  const fake = () => {
    const seen: unknown[] = [];
    return {
      seen,
      container: { registerTool: (tool: unknown) => void seen.push(tool) },
    };
  };

  it("does nothing at all when no browser implements the proposal", async () => {
    expect(candidatesIn({ document: {}, navigator: {} })).toEqual([]);
    expect(await registerTools({ document: {}, navigator: {} }, tools)).toBeNull();
  });

  it("prefers document.modelContext over the older navigator alias", async () => {
    const doc = fake();
    const nav = fake();
    const host = await registerTools(
      { document: { modelContext: doc.container }, navigator: { modelContext: nav.container } },
      tools,
    );
    expect(host).toEqual({ surface: "document", method: "registerTool", registered: tools.length });
    expect(doc.seen).toHaveLength(tools.length);
    expect(nav.seen).toHaveLength(0);
  });

  it("falls back to the whole-set call on a host that only has it", async () => {
    let given: { tools: unknown[] } | null = null;
    const host = await registerTools(
      { navigator: { modelContext: { provideContext: (c: { tools: unknown[] }) => void (given = c) } } },
      tools,
    );
    expect(host).toEqual({
      surface: "navigator",
      method: "provideContext",
      registered: tools.length,
    });
    expect(given!.tools).toHaveLength(tools.length);
  });

  /* A REGISTERED TOOL STILL ANSWERS. Wiring is where a shape gets lost, so the law calls what
     the host was handed rather than only counting it, and reads the result out of the content
     array the wrapper builds. */
  it("hands over tools that run and answer in MCP's content shape", async () => {
    const doc = fake();
    await registerTools({ document: { modelContext: doc.container } }, tools);
    const wired = doc.seen as { name: string; execute: (i: unknown) => Promise<unknown> }[];
    const list = wired.find((t) => t.name === webToolName("list"))!;
    /* THE SHAPE IS WRITTEN OUT, not rebuilt with `asToolResult`. Stated the other way this law
       could not fail: both sides went through the same helper, so replacing it with the
       identity function changed the expectation as well and 22 laws stayed green over a wire
       format that had stopped wrapping anything. Measured. */
    expect(await list.execute({})).toEqual({
      content: [{ type: "text", text: listComponents({}) }],
    });
  });

  it("keeps going when a host refuses one tool", async () => {
    const kept: unknown[] = [];
    const host = await registerTools(
      {
        document: {
          modelContext: {
            registerTool: (tool: { name: string }) => {
              if (tool.name === webToolName("check")) throw new Error("refused");
              kept.push(tool);
            },
          },
        },
      },
      tools,
    );
    expect(host?.registered).toBe(tools.length - 1);
    expect(kept).toHaveLength(tools.length - 1);
  });

  /* EVERY TOOL DECLARES ITSELF READ-ONLY, and it must be true: a host may use the hint to
     decide what runs without asking a person first, so a tool that navigated or submitted
     while claiming this would be a lie with consequences. */
  it("offers only read-only tools, each with a schema and a prefix", () => {
    for (const tool of tools) {
      expect(tool.annotations.readOnlyHint).toBe(true);
      expect(tool.name.startsWith(WEB_TOOL_PREFIX)).toBe(true);
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.description.length).toBeGreaterThan(40);
    }
  });
});

/**
 * ONE CHECKER, TWO SURFACES (2026-09-07).
 *
 * This site and the stdio MCP server both expose a "check this snippet" tool. They used to
 * have a scanner each, checking DIFFERENT rules under the same name — this one read imports,
 * tags and values; the server's read refused props, refused `data-` axes, utility classes and
 * raw values — so the same snippet got two verdicts depending on which surface an agent
 * reached. The rules now live in `@kookie-ui/react/agent` and both callers inject their own
 * facts.
 *
 * The law reads the SOURCE, because behaviour cannot say this: a re-grown local copy would
 * agree with these fixtures on the day it was written and drift afterwards, which is the shape
 * the original divergence had. The server carries the mirror of this law in its own suite.
 */
describe("the snippet checker has one home", () => {
  const source = readFileSync(new URL("./agent-tools.ts", import.meta.url), "utf8");

  it("calls the package's checker", () => {
    expect(source).toContain('from "@kookie-ui/react/agent"');
    expect(source).toContain("checkUsage(code, LIVE)");
  });

  it("writes no scanner and no rule of its own", () => {
    // The scanner's own vocabulary. Any of these reappearing here means the rules came back.
    for (const sign of ["function scanElements", "matchUtility(", "isRawLength(", "isRawColor("]) {
      expect(source, sign).not.toContain(sign);
    }
  });
});

/**
 * THE REGISTRY'S OWN REFUSALS REACH THE CHECKER (2026-09-07).
 *
 * Written because this check shipped DEAD for an afternoon and looked fine. The registry
 * states a refusal as a sentence — "`tone` and `emphasis`" — and the adapter passed that whole
 * sentence through as the prop name, so every lookup compared an attribute against prose and
 * missed. Nothing failed: the tool answered "no problems found" on code the system refuses,
 * which is the worst answer it can give.
 *
 * So the law drives a real refusal end to end rather than asserting the wiring. The fixture is
 * a component whose refusal names its props in backticks, because that is the only shape the
 * prose-to-prop rule can read — and if the registry ever stops spelling them as code, this
 * goes red rather than going quiet.
 */
describe("a registry refusal reaches the snippet checker", () => {
  it("reports a prop the registry refuses, in the registry's own words", () => {
    const found = checkSnippet(`<Accordion tone="destructive" />`);
    const tone = found.find((problem) => problem.symbol === "Accordion.tone");
    expect(tone, `nothing reported for Accordion.tone; got ${JSON.stringify(found)}`).toBeDefined();
    // The sentence is the registry's, carried verbatim — this file writes no reason of its own.
    expect(tone?.message).toContain("no meaning of its own to colour");
  });
});

/**
 * THE CONFORMANCE SUITE, WHICH IS THE LAW THE ONE-HOME CLAIM ACTUALLY OWED (2026-09-07, the
 * audit).
 *
 * The law above reads the source and proves the RULES are shared. It cannot see the facts, and
 * the facts were half-empty here for a day: `LIVE.refusalsFor` read the documentation registry
 * alone while the server merged the registry AND `system/refused.ts`, so this surface answered
 * "No problems found" to `<Button asChild m="4" as="a" highContrast />` and the server answered
 * with five findings. Every law on this side asked this side what it thought, so 508 of them
 * were green over it.
 *
 * `CONFORMANCE_CASES` ships from the package as data for exactly that reason — the server's
 * entry starts a stdio process on import and this one runs in a browser, so the two cannot
 * share a call, only an expectation. `packages/mcp/src/check.test.ts` runs the same cases
 * against its own binding. A case failing here and passing there is the two surfaces diverging
 * again, and it is now the loudest thing in the suite rather than the quietest.
 */
describe("the conformance suite the package ships", () => {
  for (const item of CONFORMANCE_CASES) {
    it(item.why, () => {
      const got = checkSnippet(item.code)
        .map((problem) => problem.symbol)
        .sort();
      expect(got).toEqual([...item.findings].sort());
    });
  }

  it("is not vacuous: some case expects a finding and some expects none", () => {
    expect(CONFORMANCE_CASES.some((item) => item.findings.length > 0)).toBe(true);
    expect(CONFORMANCE_CASES.some((item) => item.findings.length === 0)).toBe(true);
  });
});

/**
 * WHAT THE SCAN COULD NOT SEE IS A NOTE, NOT A PROBLEM (2026-09-07, the audit).
 *
 * A snippet's own `<Icon>` was reported in the numbered problem list beside real defects, and a
 * name imported from this package but not exported by it was reported TWICE — once as an
 * unexported symbol and once again as a foreign tag, the second message telling a reader to
 * ignore the first. The server has always printed both as trailing notes.
 */
describe("foreign tags and spreads are notes", () => {
  it("says nothing about a tag the snippet imported from somewhere else", () => {
    const code = `import { Star } from "./icons";\n<Button leading={<Star />}>Go</Button>`;
    expect(checkSnippet(code)).toEqual([]);
    expect(snippetNotes(code)).toEqual([]);
  });

  it("names an unknown tag once, as a note", () => {
    const notes = snippetNotes(`<Sparkle />`);
    expect(notes.join(" ")).toContain("Sparkle");
    expect(checkSnippet(`<Sparkle />`)).toEqual([]);
  });

  it("says a name imported from this package but not exported ONCE, as a problem", () => {
    const code = `import { Toast } from "@kookie-ui/react";\n<Toast />`;
    const problems = checkSnippet(code).map((problem) => problem.symbol);
    expect(problems).toEqual(["Toast"]);
    // Not repeated as a foreign tag, which is what the second message used to do.
    expect(snippetNotes(code).join(" ")).not.toContain("Toast");
  });

  it("counts a spread on a component, and not every spread in the file", () => {
    // A props destructure and an object spread. Neither hides a JSX attribute.
    const plain = `const { a, ...rest } = props;\nconst merged = { ...rest, b: 1 };\n<Button>Go</Button>`;
    expect(snippetNotes(plain)).toEqual([]);
    expect(snippetNotes(`<Button {...rest}>Go</Button>`).join(" ")).toContain("1 spread");
  });
});

/**
 * THE FOUR TOOLS ARE THE SAME FOUR TOOLS (2026-09-07, the audit).
 *
 * `agents.mdx` and DECISIONS §48 both say the browser offers "the same four tools" as the stdio
 * server. All four differed: two by a prefix, which is real — a page registers into a namespace
 * shared with every other script on the document — and two by their STEM, `check_snippet`
 * against `check_usage` and `lookup_token` against `get_tokens`, which was nothing but two
 * files naming the same thing twice. An agent that had read the documentation asked for a tool
 * that did not exist.
 *
 * The stems have one home in the package now, and this asserts the registered names are that
 * home plus the stated prefix. The server's own suite asserts the unprefixed half.
 */
describe("the browser tools are the package's four names, prefixed", () => {
  const env: ToolEnv = {
    fetchText: async () => "",
    tokenNames: () => [],
    resolveToken: () => "",
  };

  it("registers exactly the four, each with the prefix", () => {
    const names = buildTools(env).map((tool) => tool.name);
    expect(names.sort()).toEqual(
      Object.keys(TOOL_NAMES)
        .map((key) => webToolName(key as keyof typeof TOOL_NAMES))
        .sort(),
    );
    for (const name of names) expect(name.startsWith(WEB_TOOL_PREFIX)).toBe(true);
  });

  it("and the prefix is the only difference", () => {
    const stems = buildTools(env)
      .map((tool) => tool.name.slice(WEB_TOOL_PREFIX.length))
      .sort();
    expect(stems).toEqual(Object.values(TOOL_NAMES).sort());
  });
});

/**
 * A PART RESOLVES TO ITS PARENT'S PAGE (2026-09-07, the audit).
 *
 * `ENTRY_BY_KEY` was built from entry names and slugs only, so 89 of the 143 exported symbols
 * dead-ended — including every symbol this file's OWN checker can name in a finding. It would
 * report `<MenuItem variant="solid">` and its sibling tool would then answer that no component
 * called MenuItem exists. The server's `resolveComponent` has always resolved both kinds.
 *
 * The fixture is the parts, because the roots resolved before the fix and after it: a law over
 * `ENTRIES` alone is a law about the half that already worked.
 */
describe("looking up a part", () => {
  const parts = ENTRIES.flatMap((entry) =>
    (entry.parts ?? []).map((part) => [part.part, entry.name] as const),
  );

  it("there are parts to look up", () => {
    expect(parts.length).toBeGreaterThan(60);
    expect(parts.some(([part]) => part === "MenuItem")).toBe(true);
  });

  it("every part resolves to the entry that documents it", () => {
    const dead = parts.filter(([part, root]) => entryFor(part)?.name !== root);
    expect(dead.map(([part]) => part)).toEqual([]);
  });

  it("and the checker and the lookup agree about what exists", () => {
    // The pair that was contradictory: a finding naming a symbol the sibling tool denied.
    const found = checkSnippet(`<MenuItem variant="solid" />`);
    expect(found.map((problem) => problem.symbol)).toEqual(["MenuItem.variant"]);
    expect(entryFor("MenuItem")?.name).toBe("Menu");
  });
});
