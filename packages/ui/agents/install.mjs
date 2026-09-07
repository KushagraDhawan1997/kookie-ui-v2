#!/usr/bin/env node
/**
 * `npx @kookie-ui/react init` — put the rules where a coding agent will actually read them.
 *
 * WHY THIS EXISTS AT ALL. `agents/AGENTS.md` ships inside the tarball, and a file in
 * `node_modules` is read by nothing: every agent's file search honours `.gitignore`, and
 * `node_modules` is the canonical ignore. So the rules file is only real once it is inside the
 * consumer's own repo, in one of the four places their tool already loads. Copying it there is
 * this command's whole job.
 *
 * WHY IT WRITES NOTHING BY DEFAULT. This repo has a defect on record for exactly the opposite
 * behaviour — `next dev` writing an unauthored `apps/docs/CLAUDE.md` (audit 2026-08-06) — and
 * an instruction file is the most consequential file in a repo to modify without being asked,
 * because everything the author's agent does afterwards is downstream of it. So the default
 * run PRINTS the plan and changes nothing, and `--write` executes exactly the plan that was
 * printed. There is no third behaviour and no flag that widens the plan.
 *
 * WHY A DELIMITED BLOCK RATHER THAN A FILE. A consumer's `CLAUDE.md` is theirs and already has
 * words in it. The block carries markers, so a second run REPLACES what the first run wrote
 * instead of appending a second copy — which is what makes upgrading the package the same
 * command as installing it.
 *
 * No dependencies, and Node builtins only: this runs through `npx` in a repo that has not
 * installed anything yet.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const BEGIN = "<!-- BEGIN @kookie-ui/react — generated, replaced by `npx @kookie-ui/react init` -->";
export const END = "<!-- END @kookie-ui/react -->";

/**
 * The rules, wrapped so a later run can find them again.
 *
 * The markers are HTML comments because every target is markdown and a comment renders as
 * nothing in all four of them.
 */
export const wrap = (rules) => `${BEGIN}\n\n${rules.trim()}\n\n${END}`;

/**
 * The file's new text: the block replaces the old one where markers exist, and is appended
 * where they do not.
 *
 * Replacement is keyed on the markers rather than on the content, because the content changes
 * every time the package does — matching on it would append a second copy on every upgrade,
 * which is the failure this function exists to prevent.
 */
export function spliceBlock(existing, block) {
  const start = existing.indexOf(BEGIN);
  const end = existing.indexOf(END);
  if (start !== -1 && end > start) {
    const head = existing.slice(0, start);
    const tail = existing.slice(end + END.length);
    return `${head}${block}${tail}`;
  }
  if (!existing.trim()) return `${block}\n`;
  return `${existing.replace(/\s*$/, "")}\n\n${block}\n`;
}

/**
 * The four places an agent reads instructions from, and the one rule about which of them this
 * command touches: it updates what is already there, and creates nothing except in the case
 * where a repo has no instruction file at all.
 *
 * `AGENTS.md` is the fallback because it is the cross-tool convention — Cursor, Copilot,
 * Codex and Claude Code all read it — so a repo that has none of the four gets the one that
 * every tool understands rather than one vendor's.
 *
 * The Cursor entry is a rule FILE in a directory of rule files, so it is only offered where
 * that directory already exists: creating `.cursor/rules/` in a repo that does not use Cursor
 * would be inventing a tool choice on the author's behalf.
 */
export function planFor(exists) {
  const candidates = [
    { file: "AGENTS.md", needsDir: null },
    { file: "CLAUDE.md", needsDir: null },
    { file: ".cursor/rules/kookie-ui.mdc", needsDir: ".cursor/rules" },
    { file: ".github/copilot-instructions.md", needsDir: null },
  ];
  const plan = [];
  for (const candidate of candidates) {
    if (exists(candidate.file)) plan.push({ file: candidate.file, action: "update" });
    else if (candidate.needsDir && exists(candidate.needsDir)) {
      plan.push({ file: candidate.file, action: "create" });
    }
  }
  if (plan.length === 0) plan.push({ file: "AGENTS.md", action: "create" });
  return plan;
}

/** The rules text this package ships, read from beside this file. */
export const rulesText = () =>
  readFileSync(fileURLToPath(new URL("./AGENTS.md", import.meta.url)), "utf8");

/**
 * The same rules with the repository's own banner taken off the front.
 *
 * That banner tells a KookieUI maintainer not to hand-edit the artifact and names the command
 * that regenerates it — `pnpm --filter docs run agents`, which does not exist in the repo this
 * is being copied into. Leaving it in would put an instruction in front of the reader that
 * they cannot follow. The BEGIN marker already carries the sentence that IS true there: this
 * block is generated, and `npx @kookie-ui/react init` replaces it.
 */
export const consumerRules = () => rulesText().replace(/^<!--[\s\S]*?-->\s*/, "");

/**
 * Cursor loads `.cursor/rules/*.mdc` by frontmatter, so a rule file without any is a rule file
 * it may never apply. The two keys below are Cursor's own vocabulary rather than anything this
 * system states, and they are written only when the file is created — a re-run splices the
 * block and leaves whatever the author has since put at the top of their own file.
 */
const MDC_FRONTMATTER =
  "---\ndescription: KookieUI API rules — axes, refusals and where spacing lives.\nalwaysApply: true\n---\n\n";

function run(argv, cwd, out) {
  const write = argv.includes("--write");
  const dirFlag = argv.indexOf("--dir");
  const root = dirFlag !== -1 && argv[dirFlag + 1] ? path.resolve(cwd, argv[dirFlag + 1]) : cwd;

  const block = wrap(consumerRules());
  const plan = planFor((relative) => existsSync(path.join(root, relative)));

  out(`KookieUI rules → ${root}`);
  for (const step of plan) {
    const target = path.join(root, step.file);
    const before =
      step.action === "update"
        ? readFileSync(target, "utf8")
        : step.file.endsWith(".mdc")
          ? MDC_FRONTMATTER
          : "";
    const after = spliceBlock(before, block);
    const verb =
      step.action === "create"
        ? "create"
        : before.includes(BEGIN)
          ? "replace the KookieUI block in"
          : "append a KookieUI block to";
    if (!write) {
      out(`  would ${verb} ${step.file}`);
      continue;
    }
    if (after === before) {
      out(`  unchanged  ${step.file}`);
      continue;
    }
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, after);
    out(`  ${step.action === "create" ? "created" : "updated"}   ${step.file}`);
  }
  if (!write) {
    out("");
    out("Nothing was written. Run the same command with --write to apply exactly this plan.");
  }
  return plan;
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const argv = process.argv.slice(2);
  if (argv[0] !== "init") {
    console.error("Usage: npx @kookie-ui/react init [--write] [--dir <path>]");
    process.exit(1);
  }
  run(argv, process.cwd(), (line) => console.log(line));
}

export { run };
