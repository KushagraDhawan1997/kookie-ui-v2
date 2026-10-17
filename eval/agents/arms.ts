/**
 * The three arms. Each one starts from the same installed app and changes only what the agent
 * can find about the package.
 *
 * - A, bare: the package's `agents/` folder is deleted and there is no instruction file.
 * - B, surface: `init --write` puts the rules block into AGENTS.md and CLAUDE.md, and the
 *   shipped docs stay in node_modules.
 * - C, index only: the same block, with `agents/docs` deleted, so the block's links lead nowhere.
 *
 * B and C start with an empty AGENTS.md and CLAUDE.md so `init --write` updates both. Claude Code
 * reads CLAUDE.md; AGENTS.md is the cross-tool file the installer prefers. Both carry one block.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import { installedPackage } from "./lib/paths.ts";

export type ArmId = "A" | "B" | "C";
export type Arm = { id: ArmId; title: string; apply: (app: string) => void };

/** The marker `install.mjs` writes at the top of its block. */
const BLOCK_MARKER = "<!-- BEGIN @kushagradhawan/kookie-ui-react";

function initWrite(app: string): void {
  writeFileSync(path.join(app, "AGENTS.md"), "");
  writeFileSync(path.join(app, "CLAUDE.md"), "");
  const installer = path.join(installedPackage(app), "agents/install.mjs");
  const out = spawnSync(process.execPath, [installer, "init", "--write"], { cwd: app, encoding: "utf8" });
  if (out.status !== 0) throw new Error(`init --write failed in ${app}:\n${out.stderr}${out.stdout}`);
}

export const ARMS: Arm[] = [
  {
    id: "A",
    title: "bare",
    apply(app) {
      rmSync(path.join(installedPackage(app), "agents"), { recursive: true, force: true });
      for (const file of ["AGENTS.md", "CLAUDE.md"]) rmSync(path.join(app, file), { force: true });
    },
  },
  {
    id: "B",
    title: "surface",
    apply(app) {
      initWrite(app);
    },
  },
  {
    id: "C",
    title: "index only",
    apply(app) {
      initWrite(app);
      rmSync(path.join(installedPackage(app), "agents/docs"), { recursive: true, force: true });
    },
  },
];

export type ArmFacts = { agentsMdBlock: boolean; claudeMdBlock: boolean; agentsDir: boolean; docPages: number };

/** What an app folder actually holds, so a dry run can show the arms differ the way they should. */
export function armFacts(app: string): ArmFacts {
  const hasBlock = (file: string): boolean => existsSync(file) && readFileSync(file, "utf8").includes(BLOCK_MARKER);
  const agentsDir = path.join(installedPackage(app), "agents");
  const docs = path.join(agentsDir, "docs");
  return {
    agentsMdBlock: hasBlock(path.join(app, "AGENTS.md")),
    claudeMdBlock: hasBlock(path.join(app, "CLAUDE.md")),
    agentsDir: existsSync(agentsDir),
    docPages: existsSync(docs) ? countMarkdown(docs) : 0,
  };
}

/** What each arm must hold. A mismatch stops the runner before it spends anything. */
export const EXPECTED: Record<ArmId, (facts: ArmFacts) => boolean> = {
  A: (f) => !f.agentsMdBlock && !f.claudeMdBlock && !f.agentsDir && f.docPages === 0,
  B: (f) => f.agentsMdBlock && f.claudeMdBlock && f.agentsDir && f.docPages > 0,
  C: (f) => f.agentsMdBlock && f.claudeMdBlock && f.agentsDir && f.docPages === 0,
};

function countMarkdown(dir: string): number {
  let count = 0;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) count += countMarkdown(full);
    else if (entry.endsWith(".md")) count++;
  }
  return count;
}
