/**
 * Prepares run folders and, behind `--go`, runs headless Claude Code in each one.
 *
 *   node --experimental-strip-types eval/agents/run.ts --dry-run [--install]
 *   node --experimental-strip-types eval/agents/run.ts --go --model <id>
 *
 * One of `--dry-run` or `--go` is required. `--dry-run` packs the package, builds the base app,
 * copies it into every run folder, applies each arm, checks the arms hold what they should, and
 * prints the command each run would execute. It never starts `claude`.
 *
 * Options:
 *   --model <id>      pinned model (default below); recorded in the batch manifest
 *   --out <dir>       where batches go (default: a folder in the OS temp dir, outside any repo)
 *   --batch <name>    batch folder name (default: a timestamp); reuse it to resume a --go
 *   --tasks 1,3       a subset of tasks, by number or id
 *   --arms A,B        a subset of arms
 *   --reps 3          runs per task per arm
 *   --tarball <file>  use this tarball instead of packing packages/ui
 *   --install         run `npm install` in the base app (always on with --go)
 *   --parallel 1      runs at once
 *   --timeout 600     seconds per run
 *   --no-bare         drop --bare (needed with a subscription login; see README)
 *   --no-score        skip scoring after a --go
 */
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { closeSync, cpSync, createWriteStream, existsSync, mkdirSync, openSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARMS, armFacts, EXPECTED, type Arm } from "./arms.ts";
import { parseArgs, pick, shellQuote } from "./lib/args.ts";
import { DEFAULT_OUT, findUp, installedPackage, PACKAGE_NAME, TEMPLATE_DIR, UI_PACKAGE } from "./lib/paths.ts";
import { scoreBatch } from "./score.ts";
import { promptFor, TASKS, type Task } from "./tasks.ts";

/** The pinned model. Change it here or with --model; the manifest records what ran. */
export const PINNED_MODEL = "claude-opus-5-5";

const args = parseArgs(process.argv.slice(2));
const dry = args.flags.has("dry-run");
const go = args.flags.has("go");
if (dry === go) {
  console.error("Pass exactly one of --dry-run or --go. See the header of run.ts or README.md.");
  process.exit(1);
}

const model = args.values.get("model") ?? PINNED_MODEL;
const out = path.resolve(args.values.get("out") ?? DEFAULT_OUT);
const batchName = args.values.get("batch") ?? new Date().toISOString().replace(/[:.]/g, "-");
const tasks = pick(TASKS, args.values.get("tasks"));
const arms = pick(ARMS, args.values.get("arms"));
const reps = Number(args.values.get("reps") ?? 3);
const parallel = Math.max(1, Number(args.values.get("parallel") ?? 1));
const timeoutMs = Number(args.values.get("timeout") ?? 600) * 1000;
const bare = !args.flags.has("no-bare");
const install = go || args.flags.has("install");

// A batch folder inside a repo, or under any instruction file, would hand every arm extra rules.
mkdirSync(out, { recursive: true });
const inherited = findUp(out, [".git", "CLAUDE.md", "AGENTS.md", "CLAUDE.local.md"]);
if (inherited) {
  console.error(`Refusing --out ${out}: ${inherited} sits above it, and Claude Code would read it in every arm.`);
  process.exit(1);
}

const batch = path.join(out, batchName);
mkdirSync(batch, { recursive: true });
console.log(`batch     ${batch}`);
console.log(`model     ${model}`);
console.log(`runs      ${tasks.length} tasks x ${arms.length} arms x ${reps} reps = ${tasks.length * arms.length * reps}`);

// ---------------------------------------------------------------- the package

function tarball(): string {
  const given = args.values.get("tarball");
  if (given) return path.resolve(given);
  const dest = path.join(batch, "pack");
  const existing = existsSync(dest) ? readdirSync(dest).filter((f) => f.endsWith(".tgz")) : [];
  if (existing.length) return path.join(dest, existing[0]!);
  mkdirSync(dest, { recursive: true });
  const packed = spawnSync("pnpm", ["pack", "--pack-destination", dest], { cwd: UI_PACKAGE, encoding: "utf8" });
  if (packed.status !== 0) throw new Error(`pnpm pack failed:\n${packed.stderr}${packed.stdout}`);
  const file = readdirSync(dest).find((f) => f.endsWith(".tgz"));
  if (!file) throw new Error(`pnpm pack wrote no tarball into ${dest}`);
  return path.join(dest, file);
}

const tgz = tarball();
const tgzHash = createHash("sha256").update(readFileSync(tgz)).digest("hex").slice(0, 12);
console.log(`tarball   ${tgz} (${tgzHash})`);

// ---------------------------------------------------------------- the base app

const base = path.join(batch, "base");
if (!existsSync(base)) {
  cpSync(TEMPLATE_DIR, base, { recursive: true, filter: (src) => !src.includes(`${path.sep}node_modules`) });
  const pkg = readFileSync(path.join(base, "package.json"), "utf8").replace("__KOOKIE_TARBALL__", `file:${tgz}`);
  writeFileSync(path.join(base, "package.json"), pkg);
}

const installed = existsSync(path.join(base, "node_modules/typescript"));
if (install && !installed) {
  console.log("install   npm install in the base app");
  const npm = spawnSync("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], { cwd: base, stdio: "inherit" });
  if (npm.status !== 0) throw new Error("npm install failed in the base app");
} else if (!installed) {
  // Without an install, unpack the package alone so the arms have something to change.
  const dest = installedPackage(base);
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
    const tar = spawnSync("tar", ["-xzf", tgz, "-C", dest, "--strip-components=1"], { encoding: "utf8" });
    if (tar.status !== 0) throw new Error(`tar failed: ${tar.stderr}`);
  }
  console.log(`install   skipped: ${PACKAGE_NAME} unpacked alone, no third-party deps (pass --install for a full base)`);
}

// ---------------------------------------------------------------- the runs

type Run = { id: string; arm: Arm; task: Task; rep: number; dir: string; app: string; args: string[] };

/** The `claude` arguments, prompt first so no variadic option can swallow it. */
function claudeArgs(prompt: string, app: string): string[] {
  return [
    "-p",
    prompt,
    "--model",
    model,
    "--output-format",
    "stream-json",
    "--verbose",
    "--tools",
    "Read,Write,Edit,Bash",
    "--allowedTools",
    "Read",
    "Write",
    "Edit",
    "Bash(npx tsc:*)",
    "Bash(npm run typecheck)",
    "--permission-mode",
    "dontAsk",
    "--strict-mcp-config",
    "--no-session-persistence",
    "--disable-slash-commands",
    // --bare skips CLAUDE.md discovery, user memory, hooks and plugins; --add-dir brings the
    // app's own CLAUDE.md back, so the only instructions an arm sees are the ones it was given.
    ...(bare ? ["--bare"] : ["--setting-sources", "project,local"]),
    "--add-dir",
    app,
  ];
}

const printable = (run: Run): string => {
  const shown = run.args.map((arg, i) => (i === 1 ? '"$(cat ../prompt.md)"' : shellQuote(arg)));
  return `cd ${shellQuote(run.app)} && claude ${shown.join(" ")}`;
};

const runs: Run[] = [];
const factsByArm = new Map<string, ReturnType<typeof armFacts>>();
for (let rep = 1; rep <= reps; rep++) {
  for (const task of tasks) {
    for (const arm of arms) {
      const id = `${arm.id}_${task.id}_r${rep}`;
      const dir = path.join(batch, "runs", id);
      const app = path.join(dir, "app");
      const prompt = promptFor(task);
      if (!existsSync(app)) {
        mkdirSync(dir, { recursive: true });
        cpSync(base, app, { recursive: true, verbatimSymlinks: true });
        arm.apply(app);
        writeFileSync(path.join(dir, "prompt.md"), `${prompt}\n`);
      }
      const facts = armFacts(app);
      if (!EXPECTED[arm.id](facts)) throw new Error(`${id}: arm ${arm.id} does not hold what it should: ${JSON.stringify(facts)}`);
      if (!factsByArm.has(arm.id)) factsByArm.set(arm.id, facts);
      const run: Run = { id, arm, task, rep, dir, app, args: claudeArgs(prompt, app) };
      writeFileSync(
        path.join(dir, "meta.json"),
        `${JSON.stringify({ id, arm: arm.id, task: task.id, rep, model, bare, tarball: tgzHash, timeoutMs }, null, 2)}\n`,
      );
      writeFileSync(path.join(dir, "command.sh"), `#!/bin/sh\n# Prepared by run.ts. The runner adds the ${timeoutMs / 1000}s cap.\n${printable(run)}\n`, {
        mode: 0o755,
      });
      runs.push(run);
    }
  }
}

writeFileSync(
  path.join(batch, "manifest.json"),
  `${JSON.stringify(
    {
      created: new Date().toISOString(),
      model,
      bare,
      tarball: { file: tgz, sha256: tgzHash },
      tasks: tasks.map((t) => t.id),
      arms: arms.map((a) => a.id),
      reps,
      timeoutMs,
      runs: runs.map((r) => r.id),
    },
    null,
    2,
  )}\n`,
);

console.log("\narms (first run of each)");
for (const [arm, facts] of factsByArm) {
  console.log(
    `  ${arm}  AGENTS.md block ${facts.agentsMdBlock ? "yes" : "no "}  CLAUDE.md block ${facts.claudeMdBlock ? "yes" : "no "}  agents/ ${facts.agentsDir ? "yes" : "no "}  doc pages ${facts.docPages}`,
  );
}

if (dry) {
  console.log("\ncommands");
  for (const run of runs) console.log(`  [${run.id}] ${printable(run)}`);
  console.log(`\nDry run: ${runs.length} run folders prepared, claude was not started.`);
  process.exit(0);
}

// ---------------------------------------------------------------- --go

if (spawnSync("claude", ["--version"], { encoding: "utf8" }).status !== 0) {
  console.error("`claude` is not on PATH.");
  process.exit(1);
}
if (bare && !process.env["ANTHROPIC_API_KEY"]) {
  console.error("--bare authenticates only with ANTHROPIC_API_KEY. Set it, or pass --no-bare (see README).");
  process.exit(1);
}

/** The child's environment: this shell's, minus the variables a parent Claude Code session sets. */
function childEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (key === "CLAUDECODE" || key.startsWith("CLAUDE_CODE_")) delete env[key];
  return env;
}

function execute(run: Run): Promise<void> {
  const resultFile = path.join(run.dir, "result.json");
  if (existsSync(resultFile)) {
    console.log(`skip  ${run.id} (already ran)`);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const started = Date.now();
    const transcript = createWriteStream(path.join(run.dir, "transcript.jsonl"));
    const stderr = openSync(path.join(run.dir, "stderr.log"), "w");
    const child = spawn("claude", run.args, { cwd: run.app, env: childEnv(), stdio: ["ignore", "pipe", stderr] });
    child.stdout.pipe(transcript);
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 10_000).unref();
    }, timeoutMs);
    child.on("close", (code) => {
      clearTimeout(timer);
      closeSync(stderr);
      transcript.end(() => {
        const summary = lastResult(path.join(run.dir, "transcript.jsonl"));
        writeFileSync(
          resultFile,
          `${JSON.stringify({ exitCode: code, timedOut, durationMs: Date.now() - started, ...summary }, null, 2)}\n`,
        );
        console.log(`done  ${run.id} exit ${code}${timedOut ? " (timed out)" : ""} in ${Math.round((Date.now() - started) / 1000)}s`);
        resolve();
      });
    });
  });
}

/** The final `result` message of a stream-json transcript: turns, cost, error flag. */
function lastResult(file: string): Record<string, unknown> {
  if (!existsSync(file)) return {};
  const lines = readFileSync(file, "utf8").trim().split("\n").reverse();
  for (const line of lines) {
    try {
      const message = JSON.parse(line) as Record<string, unknown>;
      if (message["type"] === "result") {
        return { turns: message["num_turns"], costUsd: message["total_cost_usd"], isError: message["is_error"], subtype: message["subtype"] };
      }
    } catch {
      // A partial line from a killed run.
    }
  }
  return {};
}

const queue = [...runs];
await Promise.all(
  Array.from({ length: parallel }, async () => {
    for (let run = queue.shift(); run; run = queue.shift()) await execute(run);
  }),
);

if (!args.flags.has("no-score")) await scoreBatch(batch, { snapshot: args.values.get("snapshot") });
