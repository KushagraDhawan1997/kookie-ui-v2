/**
 * `npx @kushagradhawan/kookie-ui-react init` may not write a file nobody asked for.
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
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
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
  it("upgrades rules installed under the previous package name in place", () => {
    const old = "# Mine\n<!-- BEGIN @kookie-ui/react — generated, replaced by `npx @kookie-ui/react init` -->\nOLD\n<!-- END @kookie-ui/react -->\nTail\n";
    const next = cli.spliceBlock(old, cli.wrap("NEW"));
    expect(next).toBe(`# Mine\n${cli.wrap("NEW")}\nTail\n`);
    expect(cli.spliceBlock(next, cli.wrap("NEW"))).toBe(next);
  });

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
    expect(twice.match(/BEGIN @kushagradhawan\/kookie-ui-react/g)).toHaveLength(1);
    expect(twice).toContain("# My rules");
  });

  it("is byte-identical on a second run with the same rules", () => {
    const once = cli.spliceBlock("# My rules\n", cli.wrap("RULES"));
    expect(cli.spliceBlock(once, cli.wrap("RULES"))).toBe(once);
  });
});

describe("the command line", () => {
  it("runs when reached through the bin symlink npx uses", () => {
    // Every other law calls `run` directly, so none of them could see that the entry check
    // never matched behind `node_modules/.bin`: `init` exited 0 having printed and written
    // nothing. This one spawns Node the way npx does, through a link to the file.
    const root = scratch();
    const link = join(root, "kookie-ui");
    symlinkSync(fileURLToPath(new URL("../../agents/install.mjs", import.meta.url)), link);
    const out = spawnSync(process.execPath, [link, "init", "--write"], { cwd: root, encoding: "utf8" });
    expect(out.status).toBe(0);
    expect(out.stdout).toContain("Kookie UI rules");
    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toContain("Kookie UI, for coding agents");
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
    expect(text).toContain("Kookie UI, for coding agents");
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
    expect(written).toContain("npx @kushagradhawan/kookie-ui-react init");
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

describe("the linter in a flat config (SETTLED \"The linter\")", () => {
  const withBoth = (source: string) => {
    const out = cli.addLinter(source) as string | null;
    expect(out, source).not.toBeNull();
    expect(out).toContain(cli.LINT_IMPORT);
    expect(out).toContain(cli.LINT_ENTRY);
    return out as string;
  };

  it("adds the entry last in a plain array, and the import after the imports", () => {
    const out = withBoth(`import js from "@eslint/js";\n\nexport default [\n  js.configs.recommended,\n  { files: ["app/[id]/page.tsx"] },\n];\n`);
    expect(out).toBe(
      `import js from "@eslint/js";\n${cli.LINT_IMPORT}\n\nexport default [\n  js.configs.recommended,\n  { files: ["app/[id]/page.tsx"] },\n  ${cli.LINT_ENTRY},\n];\n`,
    );
  });

  it("adds it as the last argument of the one call a config exports", () => {
    const out = withBoth(`import tseslint from "typescript-eslint";\nexport default tseslint.config(\n  ...tseslint.configs.recommended\n);\n`);
    expect(out).toContain(`  ...tseslint.configs.recommended,\n  ${cli.LINT_ENTRY},\n);`);
    expect(withBoth(`export default [];\n`)).toBe(`${cli.LINT_IMPORT}\n\nexport default [${cli.LINT_ENTRY}];\n`);
    expect(withBoth(`export default [a, b];\n`)).toContain(`[a, b, ${cli.LINT_ENTRY}]`);
  });

  it("leaves a config that already has the linter byte-identical", () => {
    const once = withBoth(`export default [\n  a,\n];\n`);
    expect(cli.addLinter(once)).toBe(once);
  });

  it("refuses a shape it cannot edit safely, rather than guessing", () => {
    // A config built in a variable, a CommonJS one, a name already taken, a bracket it cannot match.
    expect(cli.addLinter(`const config = [a];\nexport default config;\n`)).toBeNull();
    expect(cli.addLinter(`module.exports = [a];\n`)).toBeNull();
    expect(cli.addLinter(`const kookie = 1;\nexport default [a];\n`)).toBeNull();
    expect(cli.addLinter("export default [{ files: [`${root}/**`] }];\n")).toBeNull();
  });

  it("a dry run names the config and changes nothing; --write edits only that", () => {
    const root = scratch();
    writeFileSync(join(root, "eslint.config.mjs"), `export default [\n  a,\n];\n`);
    const before = listing(root);
    const dry: string[] = [];
    cli.run(["init"], root, (line: string) => dry.push(line));
    expect(listing(root)).toBe(before);
    expect(dry.join("\n")).toContain("would add the Kookie UI linter to eslint.config.mjs");

    cli.run(["init", "--write"], root, silent);
    expect(readFileSync(join(root, "eslint.config.mjs"), "utf8")).toContain(cli.LINT_ENTRY);
    const after = listing(root);
    cli.run(["init", "--write"], root, silent);
    expect(listing(root)).toBe(after);
  });

  it("creates no ESLint config in a repo that has none", () => {
    const root = scratch();
    cli.run(["init", "--write"], root, silent);
    expect(readdirSync(root)).toEqual(["AGENTS.md"]);
  });
});

describe("the Claude Code hook", () => {
  it("is never written unless --hook asks for it, and says so", () => {
    const root = scratch();
    const lines: string[] = [];
    cli.run(["init", "--write"], root, (line: string) => lines.push(line));
    expect(readdirSync(root)).toEqual(["AGENTS.md"]);
    expect(lines.join("\n")).toContain("Pass --hook");
  });

  it("--hook without --write still writes nothing", () => {
    const root = scratch();
    const before = listing(root);
    const lines: string[] = [];
    cli.run(["init", "--hook"], root, (line: string) => lines.push(line));
    expect(listing(root)).toBe(before);
    expect(lines.join("\n")).toContain(`would write ${cli.HOOK_FILE}`);
  });

  it("keeps everything else in the settings file, and adds itself once", () => {
    const mine = { permissions: { allow: ["Bash(npm test)"] }, hooks: { Stop: [{ hooks: [{ type: "command", command: "say done" }] }], PreToolUse: [] } };
    const once = cli.addHook(JSON.stringify(mine)) as string;
    const parsed = JSON.parse(once);
    expect(parsed.permissions).toEqual(mine.permissions);
    expect(parsed.hooks.PreToolUse).toEqual([]);
    expect(parsed.hooks.Stop).toHaveLength(2);
    expect(parsed.hooks.Stop[0]).toEqual(mine.hooks.Stop[0]);
    expect(parsed.hooks.Stop[1].hooks[0].command).toBe(cli.HOOK_COMMAND);
    expect(cli.addHook(once)).toBe(once);
  });

  it("refuses a settings file it cannot read, and leaves it as it is", () => {
    expect(cli.addHook("{ not json")).toBeNull();
    expect(cli.addHook("[]")).toBeNull();
    const root = scratch();
    mkdirSync(join(root, ".claude"));
    writeFileSync(join(root, ".claude/settings.json"), "{ not json");
    cli.run(["init", "--hook", "--write"], root, silent);
    expect(readFileSync(join(root, ".claude/settings.json"), "utf8")).toBe("{ not json");
  });

  it("the script sends lint reports back with exit code 2, and lets a second stop through", () => {
    const root = scratch();
    cli.run(["init", "--hook", "--write"], root, silent);
    const hook = join(root, cli.HOOK_FILE);
    const git = (...args: string[]) => spawnSync("git", args, { cwd: root, encoding: "utf8" });
    git("init", "-q");
    // A stand-in linter that fails on any file, so the law reads the hook and not ESLint.
    mkdirSync(join(root, "node_modules/.bin"), { recursive: true });
    writeFileSync(join(root, "node_modules/.bin/eslint"), `#!/bin/sh\necho "page.tsx: kookie/no-dialog-cancel"\nexit 1\n`, { mode: 0o755 });
    writeFileSync(join(root, ".gitignore"), "node_modules\n");
    // The repo as its author committed it, hook included: nothing is changed yet.
    git("add", "-A");
    git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "start");
    const stop = (input: object) =>
      spawnSync(process.execPath, [hook], { cwd: root, encoding: "utf8", input: JSON.stringify(input), env: { ...process.env, CLAUDE_PROJECT_DIR: root } });

    // Nothing the linter reads has changed: the agent may stop.
    expect(stop({}).status).toBe(0);

    writeFileSync(join(root, "page.tsx"), "export const x = 1;\n");
    const blocked = stop({});
    expect(blocked.status).toBe(2);
    expect(blocked.stderr).toContain("kookie/no-dialog-cancel");
    // The loop guard: already continuing because of this hook.
    expect(stop({ stop_hook_active: true }).status).toBe(0);
  });
});
