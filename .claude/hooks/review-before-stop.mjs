#!/usr/bin/env node
/* Stop: a turn that changed UI doesn't end until the screen check has run on it.

   Reads this session's transcript: if a UI file was edited after the last run of
   `scripts/review-ui/run.mjs`, the agent is sent back once to run it and look at the
   screenshots. A second stop goes through, so a finding the agent can't fix gets reported
   rather than looping. RULES.md, "How to work", rule 3. */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
if (input.stop_hook_active || !input.transcript_path) process.exit(0);

const UI = /(apps\/docs\/(app|examples|content|blocks)\/.*\.(tsx|css|mdx)|packages\/ui\/src\/.*\.(tsx|css))$/;
const TEST = /\.(test|browser\.test)\.tsx?$/;
// A real run: the runner itself, given a page to check. Reading the file or running it with no
// URL is not a review (the 2026-11-03 audit: `cat run.mjs` cleared this gate).
const REVIEW = /(^|[;&|]\s*|\bcd\s+\S+\s*&&\s*)node\s+\S*scripts\/review-ui\/run\.mjs\s+(\S+\s+)*https?:\/\//;
// A UI file written from the shell (sed -i, a heredoc or a redirect) counts as an edit too.
const SHELL_WRITE = /(sed\s+-i|perl\s+-\S*i|>\s*\S+|\btee\b)/;
let lastEdit = -1;
let lastEditAt = 0;
let lastReview = -1;
let edited = "";
const lines = readFileSync(input.transcript_path, "utf8").split("\n");
lines.forEach((line, i) => {
  if (!line.includes("tool_use")) return;
  let entry;
  try {
    entry = JSON.parse(line);
  } catch {
    return;
  }
  for (const item of entry.message?.content ?? []) {
    if (item?.type !== "tool_use") continue;
    const path = item.input?.file_path ?? "";
    const cmd = item.name === "Bash" ? item.input?.command ?? "" : "";
    const shellPath = SHELL_WRITE.test(cmd) ? cmd.split(/\s+/).find((w) => UI.test(w) && !TEST.test(w)) : undefined;
    if ((["Edit", "Write", "MultiEdit"].includes(item.name) && UI.test(path) && !TEST.test(path)) || shellPath) {
      lastEdit = i;
      lastEditAt = Date.parse(entry.timestamp ?? "") || 0;
      edited = shellPath ?? path;
    }
    if (REVIEW.test(cmd)) lastReview = i;
  }
});

// A clean run of the runner stamps `.claude/.ui-reviewed`; one newer than the last edit means
// the work was checked and passed, even from another shell.
const stamp = join(input.cwd ?? process.cwd(), ".claude/.ui-reviewed");
const checkedAfter = lastEditAt > 0 && existsSync(stamp) && statSync(stamp).mtimeMs > lastEditAt;

if (lastEdit > lastReview && !checkedAfter)
  console.log(
    JSON.stringify({
      decision: "block",
      reason:
        `You changed UI (${edited.split("/").slice(-2).join("/")}) and haven't checked it since. ` +
        `Run \`node scripts/review-ui/run.mjs <every page you changed> --shots <dir>\` (add --press/--next to open dialogs and walk flows), ` +
        `fix every finding, look at the screenshots against RULES.md, then hand them to the ui-reviewer agent before you show anyone. ` +
        `If a finding is wrong, say which rule and why instead of working around it.`,
    }),
  );
