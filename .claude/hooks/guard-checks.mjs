#!/usr/bin/env node
/* PreToolUse: an agent may not change the composition checks to get its work past them.

   Seen 2 Nov 2026: a docs check flagged a Card, so the agent swapped it for a Surface and broke
   the glass. A check that fights you is either right (fix the work) or wrong (stop and say
   so). Changing it yourself is neither. RULES.md, "How to work", rule 2.

   Kushagra unlocks the checks for a task about the checks by creating `.claude/checks-unlocked`
   and deletes it after. An agent never creates that file. This is a guardrail against a habit,
   not a security boundary. */
import { existsSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

const root = join(import.meta.dirname, "../..");
// The rule list is protected with the checks: a rule's severity in rules.json decides whether
// the check fails, so flipping one to "warning" turned the check off (the 2026-11-03 audit).
const PROTECTED = [
  "RULES.md",
  "scripts/review-ui/",
  "apps/docs/app/builder/review.ts",
  "apps/docs/app/builder/rules.json",
  "apps/docs/app/builder/rules.ts",
  "apps/docs/app/builder/rules.test.ts",
  ".claude/hooks/",
];
const input = JSON.parse(readFileSync(0, "utf8"));
if (existsSync(join(root, ".claude/checks-unlocked"))) process.exit(0);

// The hook also runs for sessions started in the folder above this repo (2026-11-11: it was
// only loaded for sessions started here, and Kushagra's threads start one level up). A shell
// command is matched by the words in it, so it is read only when it is about THIS repo: the
// session is working inside it, or the command names it. Another repo's own RULES.md or hooks
// folder is not this file's to guard.
const repoName = basename(root);
const inRepo = (dir) => dir === root || dir.startsWith(root + "/");

const hit = (path) => {
  const rel = relative(root, path.startsWith("/") ? path : join(input.cwd ?? root, path));
  return PROTECTED.find((p) => rel === p || rel.startsWith(p));
};

let found;
const { tool_name: tool, tool_input: args = {} } = input;
if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) found = hit(args.file_path ?? args.notebook_path ?? "");
else if (tool === "Bash" && (inRepo(input.cwd ?? "") || (args.command ?? "").includes(repoName))) {
  const cmd = args.command ?? "";
  // The unlock is Kushagra's switch; an agent never throws it.
  if (/checks-unlocked/.test(cmd) && /(\btouch\b|>|\bcp\b|\bmv\b|\btee\b|\bln\b)/.test(cmd)) found = ".claude/checks-unlocked";
  // A write is blocked when a protected path is what it writes to, so reading, diffing or
  // copying a protected file somewhere else still works (the 2026-11-03 audit: `cp RULES.md
  // /tmp` and `git diff … | tee` were blocked, and `git checkout -- RULES.md` got through).
  // Running the check (`node scripts/review-ui/run.mjs`, `node --test …`) only reads it.
  const named = (text) => PROTECTED.find((p) => text.includes(p));
  for (const part of cmd.split(/&&|\|\||;|\n/)) {
    const words = part.trim().split(/\s+/);
    const verb = words[0] ?? "";
    const args_ = words.slice(1).join(" ");
    let target = null;
    if (/^(sed|perl)$/.test(verb) && /\s-\S*i/.test(" " + args_)) target = named(args_);
    else if (/^(rm|truncate|ed|ex)$/.test(verb)) target = named(args_);
    else if (/^(cp|mv|install|ln)$/.test(verb)) target = named(words.at(-1) ?? "");
    else if (verb === "git" && /^(checkout|restore|apply|stash|rm|mv)$/.test(words[1] ?? "")) target = named(args_);
    else if (/^(python3?|ruby)$/.test(verb) || (verb === "node" && /^(-e|--eval|-p|--print)$/.test(words[1] ?? ""))) target = named(args_);
    else if (verb === "awk" && /-i\s*inplace/.test(args_)) target = named(args_);
    for (const m of part.matchAll(/(?:>>?|\btee\s+(?:-a\s+)?)\s*(\S+)/g)) target = target ?? named(m[1]);
    if (target) {
      found = target;
      break;
    }
  }
}

if (found) {
  console.error(
    `Blocked: ${found} is a composition check, and agents don't change checks to pass them (RULES.md, How to work, 2). ` +
      `If the check is wrong, stop and tell Kushagra which rule and why. If your task is to change the check, ask him to unlock it.`,
  );
  process.exit(2);
}
