#!/usr/bin/env node
/* Stop: a turn that changed UI doesn't end until the screen check has run on it.

   Reads this session's transcript: if a UI file was edited after the last run of
   `scripts/review-ui/run.mjs`, the agent is sent back once to run it and look at the
   screenshots. A second stop goes through, so a finding the agent can't fix gets reported
   rather than looping. RULES.md, "How to work", rule 3. */
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
if (input.stop_hook_active || !input.transcript_path) process.exit(0);

const UI = /(apps\/docs\/(app|examples|content|blocks)\/.*\.(tsx|css|mdx)|packages\/ui\/src\/.*\.(tsx|css))$/;
const TEST = /\.(test|browser\.test)\.tsx?$/;
let lastEdit = -1;
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
    if (["Edit", "Write", "MultiEdit"].includes(item.name) && UI.test(path) && !TEST.test(path)) {
      lastEdit = i;
      edited = path;
    }
    if (item.name === "Bash" && /review-ui\/run\.mjs/.test(item.input?.command ?? "")) lastReview = i;
  }
});

if (lastEdit > lastReview)
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
