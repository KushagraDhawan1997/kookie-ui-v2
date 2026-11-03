/**
 * The fifth measure: the screen check, run on the app the agent built, as it renders.
 *
 * The other four read source. This one serves the app with Vite and runs
 * `scripts/review-ui/run.mjs` on it, so it sees what a person would: a dialog with no Close, a
 * band built by hand, a flow whose main action isn't full width, text off its axis. It is the
 * same check every agent runs before showing a screen (RULES.md), so the eval measures whether
 * the agent surface gets screens right the first time, not only whether the props are legal.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";

import { REPO } from "./paths.ts";

export type ScreenFinding = { rule: string; ref: string; severity: string; message: string; step: string; scheme: string };
export type ScreenResult = { available: boolean; errors: number; warnings: number; findings: ScreenFinding[]; reason?: string };

/** How to reach the screen the task is about: buttons to press, and a button that walks a flow. */
export type ScreenSteps = { press?: string[]; next?: string };

const freePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, () => {
      const address = server.address();
      server.close(() => (typeof address === "object" && address ? resolve(address.port) : reject(new Error("no port"))));
    });
  });

async function waitFor(url: string, ms: number): Promise<boolean> {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      if ((await fetch(url)).ok) return true;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

export async function runScreen(app: string, steps: ScreenSteps = {}): Promise<ScreenResult> {
  if (!existsSync(path.join(app, "node_modules/vite")))
    return { available: false, errors: 0, warnings: 0, findings: [], reason: "app not installed" };
  const port = await freePort();
  const url = `http://localhost:${port}/`;
  const server = spawn(path.join(app, "node_modules/.bin/vite"), ["--port", String(port), "--strictPort"], {
    cwd: app,
    stdio: "ignore",
  });
  try {
    if (!(await waitFor(url, 30_000))) return { available: false, errors: 0, warnings: 0, findings: [], reason: "vite did not start" };
    const args = [path.join(REPO, "scripts/review-ui/run.mjs"), url, "--page", "--json"];
    for (const name of steps.press ?? []) args.push("--press", name);
    if (steps.next) args.push("--next", steps.next);
    const run = spawnSync(process.execPath, args, { encoding: "utf8", timeout: 180_000 });
    let results: { step: string; scheme: string; findings: Omit<ScreenFinding, "step" | "scheme">[] }[];
    try {
      results = JSON.parse(run.stdout);
    } catch {
      return { available: false, errors: 0, warnings: 0, findings: [], reason: (run.stderr || run.stdout).slice(0, 400) };
    }
    // The check reviews every step in light and in dark, so a finding that doesn't depend on
    // the mode comes back twice. Count it once.
    const seen = new Set<string>();
    const findings = results
      .flatMap((r) => r.findings.map((f) => ({ ...f, step: r.step, scheme: r.scheme })))
      .filter((f) => {
        const key = JSON.stringify([f.rule, f.message, f.step]);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    return {
      available: true,
      errors: findings.filter((f) => f.severity === "error").length,
      warnings: findings.filter((f) => f.severity !== "error").length,
      findings,
    };
  } finally {
    server.kill();
  }
}
