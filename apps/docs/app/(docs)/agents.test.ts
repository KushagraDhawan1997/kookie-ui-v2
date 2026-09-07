/**
 * The rules file the package hands a consumer cannot drift from the system it describes.
 *
 * Three kinds of law, and they fail in different directions.
 *
 * The DRIFT law is `api.test.ts`'s and `tokens.css`'s: regenerate, compare against the
 * committed artifact, fail on any difference. It compares TEXT rather than a subprocess's exit
 * code, because a subprocess that fails to start also exits non-zero, and "did not run" is a
 * way of not failing this repo has met three times.
 *
 * The DERIVATION laws read the artifact back and compare it against the home it claims to come
 * from. Drift alone cannot catch a generator that hardcodes a list — the generated text and the
 * committed text would agree, both wrong — so every list the file states is parsed out of the
 * markdown and deep-equalled against `componentAxes`, `themeAxes`, the package index and the
 * registry. Those are the laws that go red when an axis widens.
 *
 * The AGREEMENT law is over the two documents a person reads: the skill in `.claude/skills/`
 * and the rules file in the package both state the five sentences every component inherits,
 * and `EVERYWHERE` is their one home. A skill that quietly said something else would be the
 * worse half of a two-homes failure, because nothing else in CI reads a skill at all.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// THROUGH THE PACKAGE'S OWN ENTRY, never a relative path into `packages/ui/src`. All four are
// public exports, and reaching past the entry pulls package SOURCE into the docs' TypeScript
// program — where `allowImportingTsExtensions` is false, so every `./config.ts` import inside
// the package fails the docs build with TS5097. Measured: `pnpm run lint` red on seven errors
// in files this app never mentions.
//
// The generator cannot import these two — `theme.tsx` is JSX and Node does not transform it —
// so it reads them out of the TypeScript AST. Vitest CAN import them, which is the whole reason
// they are pulled in here as VALUES: a law that checked the artifact against the generator's own
// parse would agree with a parse that had stopped seeing anything, which is exactly what a
// sabotage of `objectOfLists` demonstrated (the entire theme-axis section vanished, suite green).
import { componentAxes, themeAxes, themeDefaults, tiers } from "@kookie-ui/react";
import { ENTRIES } from "./components/registry";
import { facts, generatedText } from "../../scripts/generate-agents";

const here = fileURLToPath(new URL(".", import.meta.url));
const artifactPath = join(here, "../../../../packages/ui/agents/AGENTS.md");
const skillPath = join(here, "../../../../.claude/skills/kookie-ui/SKILL.md");

const artifact = () => readFileSync(artifactPath, "utf8");
const skill = () => readFileSync(skillPath, "utf8");

/**
 * The values on one `- \`key\` — \`a\` · \`b\`` line, read back out of the markdown.
 *
 * A trailing `(default …)` is dropped: it is a different fact on the same line, and folding it
 * into the value list would make the theme laws compare a list against a list plus one.
 */
function emittedValues(text: string, key: string): string[] {
  const line = text.split("\n").find((candidate) => candidate.startsWith(`- \`${key}\` — `));
  if (!line) return [];
  return [...line.replace(/\s*\(default.*$/, "").matchAll(/`([^`]+)`/g)]
    .slice(1)
    .map((match) => match[1]!);
}

/** A `·`-joined run of backticked values, wherever one appears. */
const RUN = /`[^`]+`(?: · `[^`]+`)+/g;
const valuesIn = (run: string): string[] => [...run.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);

/**
 * The one run of values on its own line after `anchor` — the shape both closed lists are
 * written in.
 *
 * It is matched as a WHOLE line rather than by taking the first backtick, because the prose
 * above each list opens with `` `@kookie-ui/react` `` and would otherwise be read as the list.
 */
function runAfter(text: string, anchor: string): string[] {
  const at = text.indexOf(anchor);
  if (at === -1) return [];
  const line = text
    .slice(at + anchor.length)
    .split("\n")
    .find((candidate) => /^`[^`]+`(?: · `[^`]+`)*$/.test(candidate.trim()));
  return line ? valuesIn(line) : [];
}

describe("the generated rules file is current", () => {
  it("regenerating changes nothing", () => {
    expect(generatedText()).toBe(artifact());
  });

  it("carries the banner naming its sources", () => {
    // A generated file opens with a header naming what produced it (ENGINEERING §2). Editing
    // one is structurally pointless and the header is what says so.
    expect(artifact()).toContain("GENERATED — do not edit");
    expect(artifact()).toContain("generate-agents.ts");
  });
});

describe("every list in the rules file is the system's own", () => {
  it("both sides found something", () => {
    // Vacuity. Every law below reads lines out of markdown, and a renamed heading or a changed
    // bullet would leave each of them comparing two empty arrays.
    const f = facts();
    expect(f.components.length).toBeGreaterThan(100);
    expect(f.everywhere.length).toBeGreaterThanOrEqual(5);
    expect(emittedValues(artifact(), "tone").length).toBeGreaterThan(5);
    expect(artifact().length).toBeGreaterThan(8000);
  });

  it("states every component axis and every value it takes", () => {
    for (const [axis, values] of Object.entries(componentAxes)) {
      expect(emittedValues(artifact(), axis), `axis ${axis}`).toEqual([...values]);
    }
  });

  it("reads the theme's own axes, and not an empty parse of them", () => {
    // `themeAxes` and `themeDefaults` reach the generator through an AST reader, and a reader
    // that silently returns `{}` emits nothing while every law that loops over its output
    // passes. So the parse is compared against the module itself before anything is read back
    // out of the markdown.
    const f = facts();
    expect(f.themeAxes).toEqual(
      Object.fromEntries(Object.entries(themeAxes).map(([axis, values]) => [axis, [...values]])),
    );
    expect(f.themeDefaults).toEqual(themeDefaults);
  });

  it("states every theme axis, with the default the theme actually resolves", () => {
    const text = artifact();
    for (const [axis, values] of Object.entries(themeAxes)) {
      // `size` and `material` are both a component axis and a theme axis, and the component
      // section comes first — so the theme section is read on its own to avoid matching the
      // earlier line.
      const themeSection = text.slice(text.indexOf("### Theme axes"));
      expect(emittedValues(themeSection, axis), `theme axis ${axis}`).toEqual([...values]);
      expect(themeSection).toContain(`(default \`${themeDefaults[axis as keyof typeof themeDefaults]}\`)`);
    }
  });

  it("states every responsive tier at the width `props.ts` gives it", () => {
    // The tiers were emitted and read back by nothing, so dropping the section would have left
    // the artifact silently short of the only thing that makes a responsive prop writable.
    const text = artifact();
    for (const [tier, width] of Object.entries(tiers)) {
      expect(text, `tier ${tier}`).toContain(`- \`${tier}\` — from ${width}`);
    }
  });

  it("names every export, and nothing that is not exported", () => {
    // BOTH directions, because the file's own heading says the list is CLOSED. A generator that
    // added one name would publish an import that does not resolve, and a coverage check that
    // only walks the exports agrees with it — measured: appending `"VStack"` to the emitted list
    // and regenerating left every law in this file green.
    const f = facts();
    const text = artifact();
    expect(runAfter(text, `## The components (${f.components.length})`)).toEqual(f.components);
    expect(runAfter(text, "Also exported, and not components:")).toEqual(f.other);
  });

  it("names no dunder-fenced seam", () => {
    // `__retuneLens` is the material bench's seam and the prefix is what says so. It reached
    // the artifact for a day, under a heading telling an agent these are the symbols it may
    // import.
    const f = facts();
    expect(f.other.filter((name) => name.startsWith("__"))).toEqual([]);
    // Read back out of the markdown too, and only out of the two closed lists — a blanket scan
    // for `__` over the whole file would fire the day a refusal is legitimately spelled with one.
    const listed = [
      ...runAfter(artifact(), `## The components (${f.components.length})`),
      ...runAfter(artifact(), "Also exported, and not components:"),
    ];
    expect(listed.filter((name) => name.startsWith("__"))).toEqual([]);
  });

  it("names every component that refuses something, with its refusals", () => {
    for (const entry of ENTRIES) {
      if (!entry.refusals.length) continue;
      const line = `- **${entry.name}** — ${entry.refusals.map((r) => r.name).join("; ")}`;
      expect(artifact(), `${entry.name}'s refusals`).toContain(line);
    }
  });

  it("the lookup shape it tells an agent to use is the shape the site serves", () => {
    // The file tells a reader to append `.md` to a component path and says the slug is the
    // export name in kebab-case. That sentence is only safe while it is true of every entry.
    const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    const wrong = ENTRIES.filter((entry) => kebab(entry.name) !== entry.slug).map((e) => e.name);
    expect(wrong).toEqual([]);
  });

  it("invents no site origin", () => {
    // `llms.ts` states why: this repo has no site URL, and one written here would be wrong on
    // every deploy but the one it was written for.
    expect(artifact()).not.toMatch(/https?:\/\/(?!localhost)/);
  });
});

describe("the skill and the package rules say the same thing", () => {
  it("both state the five sentences every component inherits, verbatim", () => {
    for (const sentence of facts().everywhere) {
      expect(artifact(), "the rules file").toContain(sentence);
      expect(skill(), "the skill").toContain(sentence);
    }
  });

  it("the two value lists the skill spells out are the axis's own", () => {
    // The skill teaches `emphasis` and `material` by enumerating them, which is a second copy
    // of two lists `componentAxes` owns — so the copy is checked rather than trusted. It does
    // NOT enumerate `tone`: that set has widened twice, and a partial list in a document
    // nothing else reads is the drift this law cannot see coming.
    for (const axis of ["emphasis", "material"] as const) {
      const spelled = componentAxes[axis].map((value) => `\`${value}\``).join(" · ");
      expect(skill(), `the skill's ${axis} row`).toContain(spelled);
    }
  });

  it("the skill spells no partial tone list", () => {
    // Stated as the rule rather than as a phrase. The first spelling of this law forbade one
    // remembered sentence, so writing three of the ten tone values into the skill under a claim
    // of all ten left it green. Any run of values in the skill that reaches into `tone` must
    // therefore BE `tone`.
    for (const match of skill().matchAll(RUN)) {
      const values = valuesIn(match[0]);
      if (!values.some((value) => (componentAxes.tone as readonly string[]).includes(value))) {
        continue;
      }
      expect(values, "a run of tone values in the skill").toEqual([...componentAxes.tone]);
    }
  });

  it("the skill declares the frontmatter a skill declares", () => {
    // Matched against the one skill this repo already ships, rather than against a remembered
    // shape: two skills with different frontmatter is the drift a reader meets first.
    const keysOf = (text: string) =>
      text.split("---")[1]!.split("\n").filter(Boolean).map((line) => line.split(":")[0]);
    const composition = readFileSync(join(here, "../../../../.claude/skills/composition/SKILL.md"), "utf8");
    expect(keysOf(skill())).toEqual(keysOf(composition));
  });
});
