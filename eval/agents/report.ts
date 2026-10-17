/**
 * Reads every `score.json` in a batch and prints the comparison as Markdown.
 *
 *   node --experimental-strip-types eval/agents/report.ts <batch-dir> [--json <file>]
 *
 * - per arm: pass rate, mean findings, and the mean of each measure
 * - per task and arm: pass rate and mean findings
 * - per rubric check and arm: how often it passed, of the runs it judged
 * - the wrong props written in arm A, tallied
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { parseArgs } from "./lib/args.ts";
import type { Score } from "./score.ts";

const args = parseArgs(process.argv.slice(2));
const batch = args.rest[0];
if (!batch) {
  console.error("Usage: report.ts <batch-dir> [--json <file>]");
  process.exit(1);
}

const runsDir = path.join(path.resolve(batch), "runs");
const scores: Score[] = readdirSync(runsDir)
  .map((id) => path.join(runsDir, id, "score.json"))
  .filter(existsSync)
  .map((file) => JSON.parse(readFileSync(file, "utf8")) as Score);
if (!scores.length) {
  console.error(`No score.json under ${runsDir}. Run score.ts first.`);
  process.exit(1);
}

const arms = [...new Set(scores.map((s) => s.arm))].sort();
const tasks = [...new Set(scores.map((s) => s.task))].sort();
const mean = (xs: number[]): string => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : "-");
const rate = (xs: boolean[]): string => (xs.length ? `${Math.round((100 * xs.filter(Boolean).length) / xs.length)}%` : "-");
const table = (head: string[], rows: string[][]): string =>
  [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
const rubricFails = (s: Score): number => Object.values(s.rubric).filter((r) => r.status === "fail").length;

const lines: string[] = [];
const meta = path.join(path.resolve(batch), "manifest.json");
if (existsSync(meta)) {
  const manifest = JSON.parse(readFileSync(meta, "utf8")) as { model: string; tarball: { sha256: string } };
  lines.push(`# Agent eval: ${path.basename(path.resolve(batch))}`, "", `Model ${manifest.model}, package ${manifest.tarball.sha256}, ${scores.length} scored runs.`, "");
}

lines.push("## Per arm", "");
lines.push(
  table(
    ["arm", "runs", "pass", "mean findings", "tsc errors", "lint e+w", "checkUsage", "rubric fails", "timeouts", "mean turns"],
    arms.map((arm) => {
      const s = scores.filter((x) => x.arm === arm);
      return [
        arm,
        String(s.length),
        rate(s.map((x) => x.pass)),
        mean(s.map((x) => x.findings)),
        mean(s.map((x) => x.tsc.errors)),
        mean(s.map((x) => x.lint.errors + x.lint.warnings)),
        mean(s.map((x) => x.usage.findings.length)),
        mean(s.map(rubricFails)),
        String(s.filter((x) => x.run?.["timedOut"]).length),
        mean(s.map((x) => Number(x.run?.["turns"] ?? NaN)).filter((n) => !Number.isNaN(n))),
      ];
    }),
  ),
  "",
);

lines.push("## Per task (pass rate / mean findings)", "");
lines.push(
  table(
    ["task", ...arms],
    tasks.map((task) => [
      task,
      ...arms.map((arm) => {
        const s = scores.filter((x) => x.arm === arm && x.task === task);
        return `${rate(s.map((x) => x.pass))} / ${mean(s.map((x) => x.findings))}`;
      }),
    ]),
  ),
  "",
);

lines.push("## Rubric checks (passed / judged)", "");
const checkIds = [...new Set(scores.flatMap((s) => Object.keys(s.rubric)))].sort();
lines.push(
  table(
    ["check", ...arms],
    checkIds.map((id) => [
      id,
      ...arms.map((arm) => {
        const judged = scores.filter((x) => x.arm === arm).map((x) => x.rubric[id]).filter((r) => r && r.status !== "na");
        return judged.length ? `${judged.filter((r) => r!.status === "pass").length}/${judged.length}` : "-";
      }),
    ]),
  ),
  "",
);

lines.push("## Wrong props in arm A", "");
const tally = new Map<string, number>();
for (const s of scores.filter((x) => x.arm === "A")) for (const prop of s.wrongProps) tally.set(prop, (tally.get(prop) ?? 0) + 1);
const sorted = [...tally].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
lines.push(sorted.length ? table(["prop", "times"], sorted.map(([prop, n]) => [prop, String(n)])) : "None.");
lines.push("", `Totals: ${arms.map((arm) => `${arm} ${scores.filter((x) => x.arm === arm).reduce((n, x) => n + x.wrongProps.length, 0)}`).join(", ")}.`);

console.log(lines.join("\n"));

const json = args.values.get("json");
if (json) {
  writeFileSync(json, `${JSON.stringify({ scores: scores.length, arms, tasks, wrongPropsA: Object.fromEntries(sorted) }, null, 2)}\n`);
}
