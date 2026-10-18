/**
 * Scores every run in a batch and writes `score.json` beside each one.
 *
 *   node --experimental-strip-types eval/agents/score.ts <batch-dir> [--snapshot <data.json>]
 *
 * Four deterministic measures, no model judging:
 * - `tsc --noEmit` error count, with the app's own TypeScript
 * - the package's ESLint plugin, errors and warnings
 * - `checkUsage` findings
 * - the task's rubric checks (lib/checks.ts), each citing the docs sentence it enforces
 *
 * A run PASSES when the agent changed the app, tsc and the plugin report no errors, checkUsage
 * reports no errors, and no rubric check fails.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseArgs } from "./lib/args.ts";
import { runChecks, type Result } from "./lib/checks.ts";
import { installedPackage, TEMPLATE_DIR, UI_PACKAGE } from "./lib/paths.ts";
import { runLint, runTsc, snapshotPath, usageChecker, wrongProps, type Finding, type LintResult, type TscResult } from "./lib/static.ts";
import { loadProject } from "./lib/tree.ts";
import { checksFor, TASKS } from "./tasks.ts";

export type Score = {
  id: string;
  arm: string;
  task: string;
  rep: number;
  /** Which copy of the package's lint plugin and checkUsage scored the run. */
  toolsFrom: string;
  /** The agent changed at least one file under src/. */
  touched: boolean;
  tsc: TscResult;
  lint: LintResult;
  usage: { errors: number; warnings: number; notes: number; findings: (Finding & { file: string })[] };
  rubric: Record<string, Result>;
  wrongProps: string[];
  /** Every finding the four tools report, rubric fails included. */
  findings: number;
  pass: boolean;
  run: Record<string, unknown> | null;
};

function sourceFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (/\.tsx?$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
  }
  return out.sort();
}

function touched(app: string, files: string[]): boolean {
  const template = path.join(TEMPLATE_DIR, "src");
  for (const file of files) {
    const original = path.join(template, path.relative(path.join(app, "src"), file));
    if (!existsSync(original) || readFileSync(original, "utf8") !== readFileSync(file, "utf8")) return true;
  }
  return false;
}

export async function scoreRun(dir: string, snapshot: string): Promise<Score> {
  const meta = JSON.parse(readFileSync(path.join(dir, "meta.json"), "utf8")) as { id: string; arm: string; task: string; rep: number };
  const task = TASKS.find((t) => t.id === meta.task);
  if (!task) throw new Error(`${dir}: unknown task ${meta.task}`);
  const app = path.join(dir, "app");
  // The installed package scores its own run. A dry-run base has no third-party deps, so its
  // copy cannot load (it imports react); the repo's packages/ui stands in, and the score says so.
  const installedOk = existsSync(path.join(app, "node_modules/react"));
  const pkg = installedOk ? installedPackage(app) : UI_PACKAGE;
  const files = sourceFiles(path.join(app, "src"));

  const tsc = runTsc(app);
  const lint = await runLint(files, app, pkg);
  const check = await usageChecker(pkg, snapshot);
  const usageFindings = files.flatMap((file) =>
    check(readFileSync(file, "utf8")).findings.map((finding) => ({ ...finding, file: path.relative(app, file) })),
  );
  const usage = {
    errors: usageFindings.filter((f) => f.severity === "error").length,
    warnings: usageFindings.filter((f) => f.severity === "warning").length,
    notes: usageFindings.filter((f) => f.severity === "note").length,
    findings: usageFindings,
  };
  const rubric = runChecks(loadProject(files, app), checksFor(task));
  const rubricFails = Object.values(rubric).filter((r) => r.status === "fail").length;
  const resultFile = path.join(dir, "result.json");
  const run = existsSync(resultFile) ? (JSON.parse(readFileSync(resultFile, "utf8")) as Record<string, unknown>) : null;
  const changed = touched(app, files);

  return {
    ...meta,
    toolsFrom: installedOk ? "installed package" : "packages/ui (app not installed)",
    touched: changed,
    tsc,
    lint,
    usage,
    rubric,
    wrongProps: wrongProps(usageFindings, tsc.messages),
    findings: tsc.errors + lint.errors + lint.warnings + lint.fatal + usageFindings.length + rubricFails,
    pass: changed && tsc.available && tsc.errors === 0 && lint.errors === 0 && lint.fatal === 0 && usage.errors === 0 && rubricFails === 0,
    run,
  };
}

export async function scoreBatch(batch: string, options: { snapshot?: string | undefined } = {}): Promise<Score[]> {
  const snapshot = snapshotPath(options.snapshot);
  const runsDir = path.join(batch, "runs");
  const scores: Score[] = [];
  for (const id of readdirSync(runsDir).sort()) {
    const dir = path.join(runsDir, id);
    if (!existsSync(path.join(dir, "meta.json"))) continue;
    const score = await scoreRun(dir, snapshot);
    writeFileSync(path.join(dir, "score.json"), `${JSON.stringify(score, null, 2)}\n`);
    const fails = Object.entries(score.rubric).filter(([, r]) => r.status === "fail").map(([k]) => k);
    console.log(
      `${score.pass ? "PASS" : "fail"}  ${id}  tsc ${score.tsc.available ? score.tsc.errors : "n/a"}  lint ${score.lint.errors}e/${score.lint.warnings}w  usage ${score.usage.findings.length}  rubric fails ${fails.length}${fails.length ? ` (${fails.join(", ")})` : ""}`,
    );
    scores.push(score);
  }
  return scores;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const batch = args.rest[0];
  if (!batch) {
    console.error("Usage: score.ts <batch-dir> [--snapshot <data.json>]");
    process.exit(1);
  }
  await scoreBatch(path.resolve(batch), { snapshot: args.values.get("snapshot") });
}
