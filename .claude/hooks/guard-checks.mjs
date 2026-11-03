#!/usr/bin/env node
/* PreToolUse: an agent may not change the composition checks to get its work past them.

   Seen 2 Nov 2026: a docs check flagged a Card, so the agent swapped it for a Surface and broke
   the glass. A check that fights you is either right (fix the work) or wrong (stop and say
   so). Changing it yourself is neither. RULES.md, "How to work", rule 2.

   Kushagra unlocks the checks for a task about the checks by creating `.claude/checks-unlocked`
   and deletes it after. An agent never creates that file. This is a guardrail against a habit,
   not a security boundary. */
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dirname, "../..");
const PROTECTED = ["RULES.md", "scripts/review-ui/", "apps/docs/app/builder/review.ts", ".claude/hooks/"];
const input = JSON.parse(readFileSync(0, "utf8"));
if (existsSync(join(root, ".claude/checks-unlocked"))) process.exit(0);

const hit = (path) => {
  const rel = relative(root, path.startsWith("/") ? path : join(input.cwd ?? root, path));
  return PROTECTED.find((p) => rel === p || rel.startsWith(p));
};

let found;
const { tool_name: tool, tool_input: args = {} } = input;
if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) found = hit(args.file_path ?? args.notebook_path ?? "");
else if (tool === "Bash") {
  const cmd = args.command ?? "";
  // Writes that name a protected path: in-place edits, redirects into it, moves, copies,
  // deletes and scripts that open it. Running the check (`node scripts/review-ui/run.mjs`,
  // `node --test …`) only reads it.
  const writes = /(sed\s+-i|perl\s+-\S*i|\btee\b|\bmv\b|\bcp\b|\brm\b|\bpython3?\b|node\s+-e)/;
  const rest = cmd.replace(/node\s+(--test\s+)?scripts\/review-ui\/\S+/g, "");
  found = PROTECTED.find(
    (p) => (rest.includes(p) && writes.test(rest)) || new RegExp(`>\\s*\\S*${p.replace(/[.\/]/g, "\\$&")}`).test(cmd),
  );
}

if (found) {
  console.error(
    `Blocked: ${found} is a composition check, and agents don't change checks to pass them (RULES.md, How to work, 2). ` +
      `If the check is wrong, stop and tell Kushagra which rule and why. If your task is to change the check, ask him to unlock it.`,
  );
  process.exit(2);
}
