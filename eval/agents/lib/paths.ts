/**
 * Where things are. Everything else in the harness asks this file.
 */
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** `eval/agents/`. */
export const EVAL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/** The repository root. */
export const REPO = path.resolve(EVAL_DIR, "../..");
export const UI_PACKAGE = path.join(REPO, "packages/ui");
/** The shipped docs every rubric check cites. */
export const DOCS_DIR = path.join(UI_PACKAGE, "agents/docs");
export const TEMPLATE_DIR = path.join(EVAL_DIR, "template");
export const FIXTURES_DIR = path.join(EVAL_DIR, "fixtures");
export const CACHE_DIR = path.join(EVAL_DIR, ".cache");

/**
 * Run batches live OUTSIDE the repository by default. Claude Code loads every CLAUDE.md from
 * the working directory up to the filesystem root, so a run directory inside this repo would
 * hand every arm the repo's own CLAUDE.md.
 */
export const DEFAULT_OUT = path.join(os.tmpdir(), "kookie-agents-eval");

/** The package name, as a consumer installs it. */
export const PACKAGE_NAME = "@kushagradhawan/kookie-ui-react";

/** `typescript`, resolved from packages/ui: the root of the repo does not depend on it. */
export const requireFromUi = createRequire(path.join(UI_PACKAGE, "package.json"));

/** The installed package inside a consumer app. */
export const installedPackage = (app: string): string =>
  path.join(app, "node_modules", ...PACKAGE_NAME.split("/"));

/**
 * The first directory at or above `dir` that holds any of `names`, or null.
 * Used to refuse a batch directory that would inherit someone else's instructions.
 */
export function findUp(dir: string, names: string[]): string | null {
  let current = path.resolve(dir);
  for (;;) {
    for (const name of names) {
      if (existsSync(path.join(current, name))) return path.join(current, name);
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}
