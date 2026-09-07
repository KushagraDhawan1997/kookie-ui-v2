/**
 * The plugin's laws (ENGINEERING §5).
 *
 * These are node tests because the question is what a PARSER sees in source text, which is the
 * one thing about this system a browser cannot answer and `tsc` provably will not: both holes
 * the plugin covers are holes in the type checker itself.
 *
 * Two of the laws below are the load-bearing ones. The first is that the refused-attribute set
 * EQUALS the axis union rather than merely agreeing with it today, so widening an axis without
 * widening the rule fails. The second is the corpus: the rules run over every example and block
 * this repo ships and must report NOTHING, because two earlier drafts of the escape rule fired
 * on the system's own correct code — a documented ScrollArea height, a sanctioned token escape,
 * a consumer's own class name. When that count is not zero the rule is wrong, not the code.
 */
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Linter, RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { componentAxes } from "../system/axes.ts";
import { boxProps, boxPropNames } from "../system/props.ts";
import { themeAxes } from "../theme/theme.tsx";
import path from "node:path";

import plugin, { NAMESPACE, recommended, rules } from "./index.ts";
import { noEscapeAbuse } from "./no-escape-abuse.ts";
import { OWNED_PROPERTIES, propFor } from "./owned-properties.ts";
import { REFUSED_ATTRIBUTES, noRefusedAttribute } from "./no-refused-attribute.ts";
import { UTILITY_HEADS } from "./utility-classes.ts";

const here = fileURLToPath(new URL(".", import.meta.url));

const languageOptions = {
  parser: tseslint.parser as never,
  parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" as const },
};

const tester = new RuleTester({ languageOptions });

/** Every fixture imports the package, because a rule that fired without one would fire on
    a consumer's own components — which is the line both rules are drawn on. */
const withImport = (jsx: string) => `import { Card, Stack } from "@kookie-ui/react";\nconst x = ${jsx};\n`;

describe("no-refused-attribute — the hole TSX leaves open (§9, §12)", () => {
  it("the attribute set IS the axis union, not a copy that agrees today", () => {
    const union = new Set(
      [...Object.keys(themeAxes), ...Object.keys(componentAxes)].map((axis) => `data-${axis}`),
    );
    expect([...REFUSED_ATTRIBUTES].sort()).toEqual([...union].sort());
    // A guard against the law passing on two empty sets, which is how a derivation quietly
    // stops deriving: the axes this repo has argued about the most must be in it.
    expect(REFUSED_ATTRIBUTES.has("data-tone")).toBe(true);
    expect(REFUSED_ATTRIBUTES.has("data-emphasis")).toBe(true);
    expect(REFUSED_ATTRIBUTES.has("data-size")).toBe(true);
    expect(REFUSED_ATTRIBUTES.has("data-material")).toBe(true);
  });

  it("runs", () => {
    tester.run("no-refused-attribute", noRefusedAttribute, {
      valid: [
        // The props themselves, which is the whole point of having them.
        withImport(`<Card tone="destructive" size="3" />`),
        // A consumer's own component wearing the same attribute is their business.
        `const x = <Panel data-tone="destructive" />;`,
        // Attributes that are not axes stay ordinary escapes.
        withImport(`<Card data-testid="pane" data-state="open" />`),
      ],
      invalid: [
        {
          code: withImport(`<Card data-tone="destructive" />`),
          errors: [{ messageId: "refused", data: { attribute: "data-tone", axis: "tone" } }],
        },
        {
          // The pair that actually re-grew the deleted `variant` axis from a call site.
          code: withImport(`<Card data-emphasis="loud" data-tone="destructive" />`),
          errors: [{ messageId: "refused" }, { messageId: "refused" }],
        },
        {
          // A renamed import is still ours; source only ever says the local name.
          code: `import { Card as Pane } from "@kookie-ui/react";\nconst x = <Pane data-size="4" />;\n`,
          errors: [{ messageId: "refused" }],
        },
        {
          code: `import * as Kui from "@kookie-ui/react";\nconst x = <Kui.Card data-material="thin" />;\n`,
          errors: [{ messageId: "refused" }],
        },
      ],
    });
  });
});

describe("no-escape-abuse — an escape used to leave the system (ENGINEERING §5)", () => {
  it("runs", () => {
    tester.run("no-escape-abuse", noEscapeAbuse, {
      valid: [
        // THE NEGATIVE CONTROLS. Each of these is correct code this repo ships, and each one
        // was flagged by an earlier draft of this rule.
        withImport(`<Card style={{ height: "160px" }} />`),
        withImport(`<Card style={{ background: "var(--color-track)" }} />`),
        // A mix over tokens is still a token: the function form is a colour, and what makes
        // this one legitimate is the `var()` inside it.
        withImport(
          `<Card style={{ background: "color-mix(in oklch, var(--tone-solid) 50%, transparent)" }} />`,
        ),
        withImport(`<Card className="dashboard-header" />`),
        withImport(`<Card style={{ width: 240 }} />`),
        // Raw CSS through props that take raw CSS by design — the same value the prop carries.
        withImport(`<Card style={{ maxWidth: "22rem", minBlockSize: "160px", display: "grid" }} />`),
        // A token reached through the space scale's own name is not a raw length.
        withImport(`<Card style={{ padding: "var(--layout-space-4)" }} />`),
        // Someone else's component is someone else's business.
        `const x = <Panel className="p-4" style={{ padding: "8px" }} />;`,
      ],
      invalid: [
        {
          code: withImport(`<Card className="p-4" />`),
          errors: [
            {
              messageId: "utility",
              data: {
                className: "p-4",
                element: "Card",
                sentence: UTILITY_HEADS["p"]?.sentence as string,
              },
            },
          ],
        },
        {
          code: withImport(`<Stack className="md:gap-2 min-w-[20rem]" />`),
          errors: [{ messageId: "utility" }, { messageId: "utility" }],
        },
        {
          code: withImport(`<Card style={{ padding: "8px" }} />`),
          errors: [
            {
              messageId: "ownedLength",
              data: { property: "padding", value: "8px", element: "Card", prop: "p" },
            },
          ],
        },
        {
          // A physical side is the logical one at a call site, so `pt` is still the answer.
          code: withImport(`<Card style={{ paddingTop: 12, gap: "4px" }} />`),
          errors: [
            {
              messageId: "ownedLength",
              data: { property: "padding-top", value: "12", element: "Card", prop: "pt" },
            },
            {
              messageId: "ownedLength",
              data: { property: "gap", value: "4px", element: "Card", prop: "gap" },
            },
          ],
        },
        {
          code: withImport(`<Card style={{ background: "#0b0b0b", color: "white" }} />`),
          errors: [{ messageId: "rawColor" }, { messageId: "rawColor" }],
        },
      ],
    });
  });
});

describe("the owned set IS the space-scaled rows (system/props.ts)", () => {
  const rows = Object.entries(boxProps);
  const spaceRows = rows.filter(([, def]) => def.scale === "space");
  const rawRows = rows.filter(([, def]) => def.scale !== "space");

  /**
   * The escape rule's other derived set, held the way the attribute set is held: by asserting
   * it IS the table rather than that it agrees with it today. Without this, the set can be
   * replaced with a hand-written list that still covers the properties the cases below happen
   * to write — measured, a literal holding only the padding and gap longhands passed every
   * other law in this file while `<Card style={{ marginTop: "8px" }}>` went unreported, which
   * is §3's own non-negotiable arriving through the escape the rule exists to watch.
   *
   * Both directions, because the two mistakes are opposite and each has already been made:
   * narrowing loses margin and inset, and widening reaches `width` and `flexGrow`, whose rows
   * take raw CSS by design and whose escapes this repo ships on purpose.
   */
  it("every space-scaled longhand is owned, and no raw-scaled one is", () => {
    for (const [name, def] of spaceRows) {
      for (const longhand of def.css) {
        expect(OWNED_PROPERTIES.has(longhand), `${name} feeds ${longhand}`).toBe(true);
      }
    }
    for (const [name, def] of rawRows) {
      for (const longhand of def.css) {
        expect(
          OWNED_PROPERTIES.has(longhand),
          `${name} feeds ${longhand}, which takes raw CSS through its own prop`,
        ).toBe(false);
      }
    }
    // The guard against this passing on an empty table, which is how a derivation stops
    // deriving: the families the rule exists for must each be in it.
    for (const property of ["padding", "margin", "gap", "inset"]) {
      expect(OWNED_PROPERTIES.has(property), property).toBe(true);
    }
  });

  /** The header of owned-properties.ts claims this; a report that cannot name its replacement
      tells a call site to stop and not what to do. */
  it("every owned property names a space-scaled prop as its replacement", () => {
    const spaceNames = new Set(spaceRows.map(([name]) => name));
    for (const property of OWNED_PROPERTIES) {
      const prop = propFor(property);
      expect(prop, `${property} has no replacement`).not.toBeNull();
      expect(spaceNames.has(String(prop)), `${property} names ${String(prop)}`).toBe(true);
    }
  });
});

/** Lint one snippet with both rules on, the way a consumer's config would have them. */
function report(code: string, filename = "example.tsx") {
  const linter = new Linter();
  return linter.verify(
    code,
    [
      // Flat config lints a file only when some entry claims it, and these files are handed
      // over under a virtual name outside any project root.
      { files: ["**/*.ts", "**/*.tsx"], languageOptions, plugins: { [NAMESPACE]: plugin as never } },
      ...recommended.map((entry) => ({ ...entry, files: ["**/*.ts", "**/*.tsx"], languageOptions })),
    ],
    filename,
  );
}

describe("a report names its replacement", () => {
  /** The vocabulary a report is allowed to point at: a real prop, or a real axis. */
  const REPLACEMENTS = new Set<string>([
    ...boxPropNames,
    ...Object.keys(themeAxes),
    ...Object.keys(componentAxes),
  ]);

  const namesOne = (message: string) =>
    [...message.matchAll(/`([^`]+)`/g)].some(([, quoted]) => REPLACEMENTS.has(quoted as string));

  it("every answer in the utility table points at a prop or an axis that exists, and says its name", () => {
    for (const [head, answer] of Object.entries(UTILITY_HEADS)) {
      const named = answer.prop ?? answer.axis;
      expect(named, `${head} names nothing`).toBeDefined();
      expect(REPLACEMENTS.has(named as string), `${head} names ${String(named)}`).toBe(true);
      expect(answer.sentence, `${head}'s sentence`).toMatch(/`[^`]+`/);
      expect(namesOne(answer.sentence), `${head}'s sentence names a replacement`).toBe(true);
    }
  });

  it("every message a rule actually emits names a prop or an axis", () => {
    const emitted = [
      ...report(withImport(`<Card data-tone="destructive" />`)),
      ...report(withImport(`<Card style={{ padding: "8px", background: "#0b0b0b" }} />`)),
      ...report(
        withImport(
          `<Card className="p-4 gap-2 w-full bg-red-500 text-sm font-bold rounded-full shadow-lg border-b flex-col grid-cols-3 items-center justify-between space-y-4 min-w-[20rem] max-w-md m-2" />`,
        ),
      ),
    ];
    // The guard against this law passing on an empty list, which is the shape it would take if
    // the rules stopped firing.
    expect(emitted.length).toBeGreaterThan(15);
    for (const message of emitted) {
      expect(namesOne(message.message), message.message).toBe(true);
    }
  });
});

describe("the plugin ships as a plugin", () => {
  it("recommended enables every rule the plugin has, so a new rule cannot ship unrun", () => {
    const enabled = Object.keys(recommended[0]?.rules ?? {});
    expect(enabled.sort()).toEqual(
      Object.keys(rules)
        .map((rule) => `${NAMESPACE}/${rule}`)
        .sort(),
    );
    expect(plugin.configs?.["recommended"]).toBe(recommended);
  });
});

describe("the vacuity guard", () => {
  it("the deliberately wrong fixture goes red, naming both rules", () => {
    const fixture = readFileSync(join(here, "__fixtures__/wrong.tsx"), "utf8");
    // This plugin's findings only: the fixture also carries a disable directive for a rule
    // the package's own config defines and this bare Linter does not, which ESLint reports as
    // an unknown rule and which is not what the guard is about.
    const found = report(fixture, "wrong.tsx").filter((message) =>
      message.ruleId?.startsWith(`${NAMESPACE}/`),
    );
    expect(found.map((message) => message.ruleId).sort()).toEqual([
      `${NAMESPACE}/no-escape-abuse`,
      `${NAMESPACE}/no-refused-attribute`,
    ]);
    expect(found.find((message) => message.ruleId?.endsWith("no-refused-attribute"))?.severity).toBe(2);
    expect(found.find((message) => message.ruleId?.endsWith("no-escape-abuse"))?.severity).toBe(1);
  });
});

describe("the corpus — the rules must be silent on code this repo ships", () => {
  const roots = ["examples", "blocks"].map((directory) =>
    join(here, "../../../../apps/docs", directory),
  );

  const sources = roots.flatMap((root) =>
    readdirSync(root)
      .filter((entry) => entry.endsWith(".tsx") || entry.endsWith(".ts"))
      .map((entry) => join(root, entry)),
  );

  it("finds the corpus at all — a walk over nothing is a law that cannot fail", () => {
    expect(sources.length).toBeGreaterThan(50);
  });

  it("reports nothing on any of it", () => {
    const findings = sources.flatMap((file) =>
      // The basename, because flat config's `files` globs are rooted at the working directory
      // and these live in another package. The path stays in the finding for a human to read.
      report(readFileSync(file, "utf8"), basename(file)).map(
        (message) => `${file}:${message.line} ${message.ruleId ?? ""} ${message.message}`,
      ),
    );
    expect(findings).toEqual([]);
  });
});

/**
 * THE SHIPPED CONFIG ACTUALLY LINTS SOMETHING (2026-09-07).
 *
 * Added after the built plugin was enabled from a scratch consumer and reported nothing at
 * all. Two defects, both invisible from inside this repo because the root config supplies its
 * own `files` and its own parser: a flat config object with no `files` key matches NO file in
 * ESLint 9 — the run printed "File ignored because no matching configuration was supplied"
 * and exited zero — and once it matched, the default parser could not read a `<` because
 * nothing turned JSX on. A plugin whose two rules both read JSX attributes shipped a
 * recommended config that could not parse JSX.
 *
 * Neither is visible to a law that calls a rule directly, which is what every other law in
 * this file does. So this one goes through the real `ESLint` engine with the real exported
 * config and a real filename, because the thing that was broken lives between the rule and
 * the runner.
 */
describe("the recommended config, as a consumer gets it", () => {
  // The path has to sit inside the working directory: ESLint answers "File ignored because
  // outside of base path" for anything else, which arrives as a lint result with a null rule
  // and would read exactly like a clean file. The instrument had that bug before the plugin
  // was cleared of it.
  const run = async (name: string, code: string) => {
    const filePath = path.join(process.cwd(), name);
    const { ESLint } = await import("eslint");
    const engine = new ESLint({ overrideConfigFile: true, overrideConfig: recommended });
    const [result] = await engine.lintText(code, { filePath });
    return result?.messages ?? [];
  };

  it("matches a .tsx file and parses the JSX in it", async () => {
    const messages = await run(
      "a.tsx",
      // The import is load-bearing: both rules only speak about symbols this package exports,
      // so a fixture without one measures a rule that correctly declined to fire.
      'import { Button } from "@kookie-ui/react";\nexport const A = <Button data-tone="destructive" />;\n',
    );
    expect(messages.map((m) => m.message).join("\n")).not.toContain("Parsing error");
    expect(messages.map((m) => m.ruleId)).toContain("kookie/no-refused-attribute");
  });

  it("says nothing about code that uses the escapes correctly", async () => {
    const messages = await run(
      "b.tsx",
      'import { Card } from "@kookie-ui/react";\nexport const B = <Card className="dashboard-header" style={{ height: "160px" }} />;\n',
    );
    expect(messages).toEqual([]);
  });
});
