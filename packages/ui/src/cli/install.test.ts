/**
 * `npx @kookie-ui/react init` may not write a file nobody asked for.
 *
 * The load-bearing law is the CONSENT one, and it reads the filesystem rather than the code: a
 * default run must leave the directory byte-identical. This repo has the opposite behaviour on
 * record as a defect — `next dev` writing an unauthored `apps/docs/CLAUDE.md` (audit
 * 2026-08-06) — and an instruction file is the one file where writing without being asked
 * changes everything the author's agent does afterwards.
 *
 * The second is IDEMPOTENCE, which is what makes upgrading the package the same command as
 * installing it. Running twice must leave what running once left; the failure it guards is a
 * second copy of the rules appended below the first, which nothing else would ever notice.
 *
 * The CLI is `.mjs` and stays that way: it runs through `npx` in a repo that has installed
 * nothing, so it cannot be built and cannot import anything. It is reached here through a
 * dynamic import of a URL rather than a static specifier, because the package builds no
 * declarations for it and a hand-written `.d.mts` beside it would be a second home for every
 * signature below.
 */
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const cli = await import(new URL("../../agents/install.mjs", import.meta.url).href);

const roots: string[] = [];
const scratch = (): string => {
  const dir = mkdtempSync(join(tmpdir(), "kookie-init-"));
  roots.push(dir);
  return dir;
};
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

const silent = () => {};
const listing = (root: string) =>
  readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .sort()
    .map((file) => `${file}\n${readFileSync(file, "utf8")}`)
    .join("\n---\n");

describe("the plan", () => {
  it("updates the instruction files a repo already has, and creates none of the others", () => {
    const plan = cli.planFor((file: string) => file === "CLAUDE.md");
    expect(plan).toEqual([{ file: "CLAUDE.md", action: "update" }]);
  });

  it("writes a Cursor rule only where Cursor's rules directory already exists", () => {
    // Creating `.cursor/rules/` would be choosing a tool on the author's behalf.
    expect(cli.planFor((file: string) => file === ".cursor/rules")).toContainEqual({
      file: ".cursor/rules/kookie-ui.mdc",
      action: "create",
    });
    expect(cli.planFor(() => false)).not.toContainEqual(
      expect.objectContaining({ file: ".cursor/rules/kookie-ui.mdc" }),
    );
  });

  it("falls back to AGENTS.md, and only when a repo has no instruction file at all", () => {
    expect(cli.planFor(() => false)).toEqual([{ file: "AGENTS.md", action: "create" }]);
    // With any target present, the fallback must not fire — otherwise every repo with a
    // CLAUDE.md also grows an AGENTS.md it never asked for.
    expect(cli.planFor((file: string) => file === "CLAUDE.md")).toHaveLength(1);
  });
});

describe("the block", () => {
  it("appends below what is already there, keeping it", () => {
    const out = cli.spliceBlock("# My rules\n\nUse tabs.\n", cli.wrap("RULES"));
    expect(out).toContain("Use tabs.");
    expect(out.indexOf("Use tabs.")).toBeLessThan(out.indexOf("RULES"));
  });

  it("replaces its own block rather than appending a second one", () => {
    const once = cli.spliceBlock("# My rules\n", cli.wrap("OLD"));
    const twice = cli.spliceBlock(once, cli.wrap("NEW"));
    expect(twice).toContain("NEW");
    expect(twice).not.toContain("OLD");
    expect(twice.match(/BEGIN @kookie-ui\/react/g)).toHaveLength(1);
    expect(twice).toContain("# My rules");
  });

  it("is byte-identical on a second run with the same rules", () => {
    const once = cli.spliceBlock("# My rules\n", cli.wrap("RULES"));
    expect(cli.spliceBlock(once, cli.wrap("RULES"))).toBe(once);
  });
});

describe("consent", () => {
  it("a run without --write leaves the directory byte-identical", () => {
    const root = scratch();
    writeFileSync(join(root, "CLAUDE.md"), "# Mine\n");
    mkdirSync(join(root, ".cursor/rules"), { recursive: true });
    const before = listing(root);

    const lines: string[] = [];
    cli.run(["init"], root, (line: string) => lines.push(line));

    expect(listing(root)).toBe(before);
    expect(lines.join("\n")).toContain("Nothing was written");
    // It must still SAY what it would do, or the flag is a coin toss rather than consent.
    expect(lines.join("\n")).toContain("CLAUDE.md");
  });

  it("--write applies exactly the plan that a dry run printed", () => {
    const root = scratch();
    writeFileSync(join(root, "CLAUDE.md"), "# Mine\n");

    const dry: string[] = [];
    cli.run(["init"], root, (line: string) => dry.push(line));
    cli.run(["init", "--write"], root, silent);

    const written = readdirSync(root);
    expect(written).toEqual(["CLAUDE.md"]);
    const text = readFileSync(join(root, "CLAUDE.md"), "utf8");
    expect(text).toContain("# Mine");
    expect(text).toContain("KookieUI, for coding agents");
    // The dry run named one file; the write touched one file.
    expect(dry.filter((line) => line.startsWith("  would ")).length).toBe(1);
  });

  it("a second --write changes nothing", () => {
    const root = scratch();
    cli.run(["init", "--write"], root, silent);
    const after = listing(root);
    cli.run(["init", "--write"], root, silent);
    expect(listing(root)).toBe(after);
  });

  it("carries the rules the package generated, not a summary of them", () => {
    const root = scratch();
    cli.run(["init", "--write"], root, silent);
    const written = readFileSync(join(root, "AGENTS.md"), "utf8");
    expect(written).toContain(cli.consumerRules().trim());
    // Every refusal reaches the consumer. The block is the rules, not an abridgement of them.
    expect(written).toContain("What each component refuses");
  });

  it("does not hand a consumer an instruction only this repo can follow", () => {
    // The artifact's own banner names `pnpm --filter docs run agents`, a script that exists in
    // no repo this is copied into. The BEGIN marker carries the sentence that is true there.
    const root = scratch();
    cli.run(["init", "--write"], root, silent);
    const written = readFileSync(join(root, "AGENTS.md"), "utf8");
    expect(cli.rulesText()).toContain("pnpm --filter docs run agents");
    expect(written).not.toContain("pnpm --filter docs run agents");
    expect(written).toContain("npx @kookie-ui/react init");
  });

  it("gives a Cursor rule the frontmatter Cursor loads it by", () => {
    const root = scratch();
    mkdirSync(join(root, ".cursor/rules"), { recursive: true });
    cli.run(["init", "--write"], root, silent);
    const rule = readFileSync(join(root, ".cursor/rules/kookie-ui.mdc"), "utf8");
    expect(rule.startsWith("---\n")).toBe(true);
    expect(rule).toContain("alwaysApply: true");
    // And a second run must not stack a second frontmatter block on top of the first.
    cli.run(["init", "--write"], root, silent);
    const again = readFileSync(join(root, ".cursor/rules/kookie-ui.mdc"), "utf8");
    expect(again).toBe(rule);
  });
});
