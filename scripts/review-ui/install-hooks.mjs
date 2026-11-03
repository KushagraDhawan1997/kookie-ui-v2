#!/usr/bin/env node
/* Turns on the two composition hooks in this repo's Claude Code settings. Run it yourself; an
   agent can't change its own settings.

     node scripts/review-ui/install-hooks.mjs

   - PreToolUse `guard-checks`: agents can't edit RULES.md, the screen check, the builder
     reviewer or the hooks. Unlock for a task about them with `touch .claude/checks-unlocked`,
     and delete that file after.
   - Stop `review-before-stop`: a turn that changed UI can't end until the screen check ran. */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const file = join(import.meta.dirname, "../../.claude/settings.json");
const settings = JSON.parse(readFileSync(file, "utf8"));
const hook = (name) => ({ type: "command", command: `node "$CLAUDE_PROJECT_DIR/.claude/hooks/${name}.mjs"` });
settings.hooks = {
  ...settings.hooks,
  PreToolUse: [{ matcher: "Edit|Write|MultiEdit|NotebookEdit|Bash", hooks: [hook("guard-checks")] }],
  Stop: [{ hooks: [hook("review-before-stop")] }],
};
const allow = new Set(settings.permissions?.allow ?? []);
for (const rule of ["Bash(node scripts/review-ui/run.mjs *)", "Bash(node --test scripts/review-ui/*)"]) allow.add(rule);
settings.permissions = { ...settings.permissions, allow: [...allow] };
writeFileSync(file, JSON.stringify(settings, null, 2) + "\n");
console.log("Hooks on. Restart Claude Code sessions in this repo to pick them up.");
