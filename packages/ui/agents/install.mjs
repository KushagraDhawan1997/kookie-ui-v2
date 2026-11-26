#!/usr/bin/env node
/**
 * `npx @kushagradhawan/kookie-ui-react init` — put the rules where a coding agent will actually read them.
 *
 * WHY THIS EXISTS AT ALL. `agents/AGENTS.md` ships inside the tarball, and a file in
 * `node_modules` is read by nothing: every agent's file search honours `.gitignore`, and
 * `node_modules` is the canonical ignore. So the rules file is only real once it is inside the
 * consumer's own repo, in one of the four places their tool already loads. Copying it there is
 * this command's whole job.
 *
 * WHY IT WRITES NOTHING BY DEFAULT. This repo has a defect on record for exactly the opposite
 * behaviour — `next dev` writing an unauthored `apps/docs/CLAUDE.md` (audit 2026-08-06) — and
 * an instruction file is the most consequential file in a repo to modify without being asked,
 * because everything the author's agent does afterwards is downstream of it. So the default
 * run PRINTS the plan and changes nothing, and `--write` executes exactly the plan that was
 * printed.
 *
 * THE LINTER AND THE HOOK (Kushagra, 2026-11-26; SETTLED "The linter"). The same run also
 * plans two more things, under the same consent. It adds the linter to an ESLint flat config
 * the repo already has, and where it cannot edit that file safely it prints the two lines and
 * edits nothing. And it offers a Claude Code hook that runs the linter each time the agent
 * tries to finish. The hook is never part of the plan unless `--hook` asks for it, because a
 * hook changes how the author's agent behaves on every task, not only on Kookie code.
 *
 * WHY A DELIMITED BLOCK RATHER THAN A FILE. A consumer's `CLAUDE.md` is theirs and already has
 * words in it. The block carries markers, so a second run REPLACES what the first run wrote
 * instead of appending a second copy — which is what makes upgrading the package the same
 * command as installing it.
 *
 * No dependencies, and Node builtins only: this runs through `npx` in a repo that has not
 * installed anything yet.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const BEGIN = "<!-- BEGIN @kushagradhawan/kookie-ui-react — generated, replaced by `npx @kushagradhawan/kookie-ui-react init` -->";
export const END = "<!-- END @kushagradhawan/kookie-ui-react -->";

/**
 * The rules, wrapped so a later run can find them again.
 *
 * The markers are HTML comments because every target is markdown and a comment renders as
 * nothing in all four of them.
 */
export const wrap = (rules) => `${BEGIN}\n\n${rules.trim()}\n\n${END}`;

/**
 * The file's new text: the block replaces the old one where markers exist, and is appended
 * where they do not.
 *
 * Replacement is keyed on the markers rather than on the content, because the content changes
 * every time the package does — matching on it would append a second copy on every upgrade,
 * which is the failure this function exists to prevent.
 */
export function spliceBlock(existing, block) {
  // Update rules installed under the previous package name in place.
  const legacyBegin = "<!-- BEGIN @kookie-ui/react — generated, replaced by `npx @kookie-ui/react init` -->";
  const legacyEnd = "<!-- END @kookie-ui/react -->";
  const current = existing.includes(BEGIN);
  const start = existing.indexOf(current ? BEGIN : legacyBegin);
  const endMarker = current ? END : legacyEnd;
  const end = existing.indexOf(endMarker, start);
  if (start !== -1 && end > start) {
    const head = existing.slice(0, start);
    const tail = existing.slice(end + endMarker.length);
    return `${head}${block}${tail}`;
  }
  if (!existing.trim()) return `${block}\n`;
  return `${existing.replace(/\s*$/, "")}\n\n${block}\n`;
}

/**
 * The four places an agent reads instructions from, and the one rule about which of them this
 * command touches: it updates what is already there, and creates nothing except in the case
 * where a repo has no instruction file at all.
 *
 * `AGENTS.md` is the fallback because it is the cross-tool convention — Cursor, Copilot,
 * Codex and Claude Code all read it — so a repo that has none of the four gets the one that
 * every tool understands rather than one vendor's.
 *
 * The Cursor entry is a rule FILE in a directory of rule files, so it is only offered where
 * that directory already exists: creating `.cursor/rules/` in a repo that does not use Cursor
 * would be inventing a tool choice on the author's behalf.
 */
export function planFor(exists) {
  const candidates = [
    { file: "AGENTS.md", needsDir: null },
    { file: "CLAUDE.md", needsDir: null },
    { file: ".cursor/rules/kookie-ui.mdc", needsDir: ".cursor/rules" },
    { file: ".github/copilot-instructions.md", needsDir: null },
  ];
  const plan = [];
  for (const candidate of candidates) {
    if (exists(candidate.file)) plan.push({ file: candidate.file, action: "update" });
    else if (candidate.needsDir && exists(candidate.needsDir)) {
      plan.push({ file: candidate.file, action: "create" });
    }
  }
  if (plan.length === 0) plan.push({ file: "AGENTS.md", action: "create" });
  return plan;
}

/** The rules text this package ships, read from beside this file. */
export const rulesText = () =>
  readFileSync(fileURLToPath(new URL("./AGENTS.md", import.meta.url)), "utf8");

/**
 * The same rules with the repository's own banner taken off the front.
 *
 * That banner tells a Kookie UI maintainer not to hand-edit the artifact and names the command
 * that regenerates it — `pnpm --filter docs run agents`, which does not exist in the repo this
 * is being copied into. Leaving it in would put an instruction in front of the reader that
 * they cannot follow. The BEGIN marker already carries the sentence that IS true there: this
 * block is generated, and `npx @kushagradhawan/kookie-ui-react init` replaces it.
 */
export const consumerRules = () => rulesText().replace(/^<!--[\s\S]*?-->\s*/, "");

/**
 * Cursor loads `.cursor/rules/*.mdc` by frontmatter, so a rule file without any is a rule file
 * it may never apply. The two keys below are Cursor's own vocabulary rather than anything this
 * system states, and they are written only when the file is created — a re-run splices the
 * block and leaves whatever the author has since put at the top of their own file.
 */
const MDC_FRONTMATTER =
  "---\ndescription: Kookie UI API rules — axes, refusals and where spacing lives.\nalwaysApply: true\n---\n\n";


/** The specifier the linter is imported from, and the two lines a flat config needs. */
export const LINT_SPECIFIER = "@kushagradhawan/kookie-ui-react/eslint-plugin";
export const LINT_IMPORT = `import kookie from "${LINT_SPECIFIER}";`;
export const LINT_ENTRY = "...kookie.configs.recommended";

/** The flat config files this command can edit. A `.cjs` config has no `import`, so it is only told. */
export const ESLINT_CONFIGS = ["eslint.config.js", "eslint.config.mjs", "eslint.config.ts", "eslint.config.mts"];

/**
 * The index of the bracket that closes the one at `open`, or -1.
 *
 * It steps over strings, template literals and comments, because a `]` inside a glob such as
 * `"app/[id]/page.tsx"` closes nothing. A template literal with a `${}` in it is not followed:
 * this returns -1 and the caller prints the lines instead of guessing.
 */
export function closingBracket(source, open) {
  const pairs = { "[": "]", "(": ")", "{": "}" };
  const stack = [];
  for (let i = open; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (char === "/" && next === "/") {
      i = source.indexOf("\n", i);
      if (i === -1) return -1;
      continue;
    }
    if (char === "/" && next === "*") {
      i = source.indexOf("*/", i + 2);
      if (i === -1) return -1;
      i += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      let j = i + 1;
      for (; j < source.length && source[j] !== char; j += 1) {
        if (source[j] === "\\") j += 1;
        else if (char === "`" && source[j] === "$" && source[j + 1] === "{") return -1;
      }
      i = j;
      continue;
    }
    if (pairs[char]) stack.push(pairs[char]);
    else if (char === "]" || char === ")" || char === "}") {
      if (stack.pop() !== char) return -1;
      if (stack.length === 0) return i;
    }
  }
  return -1;
}

/**
 * A flat config with the linter added, or null when this cannot be done safely.
 *
 * SAFE means one shape only: `export default` followed by an array or by one call
 * (`defineConfig(…)`, `tseslint.config(…)`), with brackets this can match. The entry goes LAST,
 * after the repo's own parser entry, which is where the plugin has to sit because it brings no
 * parser. Anything else — a config built in a variable, a `module.exports`, a name `kookie`
 * already in use — returns null, and the command prints the two lines for a person to place.
 * A config that already imports the linter comes back unchanged.
 */
export function addLinter(source) {
  if (source.includes(LINT_SPECIFIER)) return source;
  if (/\bkookie\b/.test(source)) return null;
  const head = /export\s+default\s+(?:[A-Za-z_$][\w$.]*\s*)?([[(])/.exec(source);
  if (!head) return null;
  const open = head.index + head[0].length - 1;
  const close = closingBracket(source, open);
  if (close === -1) return null;

  const inner = source.slice(open + 1, close);
  const body = inner.replace(/\s+$/, "");
  const comma = body.trim() === "" || body.endsWith(",") ? "" : ",";
  const entry = inner.includes("\n")
    ? `${body}${comma}\n  ${LINT_ENTRY},\n`
    : `${body}${comma}${body.trim() === "" ? "" : " "}${LINT_ENTRY}`;
  const withEntry = `${source.slice(0, open + 1)}${entry}${source.slice(close)}`;

  // After the last import, so the file keeps its imports together.
  const imports = [...withEntry.matchAll(/^import\b[\s\S]*?from\s+["'][^"']+["'];?[ \t]*$/gm)];
  const last = imports.at(-1);
  if (!last) return `${LINT_IMPORT}\n\n${withEntry}`;
  const at = last.index + last[0].length;
  return `${withEntry.slice(0, at)}\n${LINT_IMPORT}${withEntry.slice(at)}`;
}

/** Where the hook lives in the consumer's repo. */
export const HOOK_FILE = ".claude/hooks/kookie-lint.mjs";
export const SETTINGS_FILE = ".claude/settings.json";
export const HOOK_COMMAND = `node "$CLAUDE_PROJECT_DIR/${HOOK_FILE}"`;

/**
 * The hook itself: a script Claude Code runs each time the agent tries to finish.
 *
 * It lints the files the agent changed, with the repo's own linter and config. Exit code 2
 * is Claude Code's "do not stop, and read this": the reports go back to the agent, which
 * fixes them. Warnings count, because an agent treats a warning as optional — this is the
 * strict set's reason, applied without a second config. `stop_hook_active` is the loop
 * guard: when the agent is already continuing because of this hook, the hook lets it stop,
 * so a report the agent cannot fix never holds it forever.
 */
export const HOOK_SCRIPT = `#!/usr/bin/env node
// Written by \`npx @kushagradhawan/kookie-ui-react init --hook\`. Runs the linter when Claude Code
// tries to finish, and sends the reports back to it. Delete this file and its entry in
// .claude/settings.json to remove the hook.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

let input = {};
try {
  input = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {}
// The agent is already continuing because of this hook. Let it stop.
if (input.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const git = (...args) => spawnSync("git", args, { cwd: root, encoding: "utf8" }).stdout || "";
const changed = [
  ...git("diff", "--name-only", "HEAD").split("\\n"),
  ...git("ls-files", "--others", "--exclude-standard").split("\\n"),
].filter((file) => /\\.[cm]?[jt]sx?$/.test(file) && existsSync(path.join(root, file)));
if (changed.length === 0) process.exit(0);

const bin = (name) => path.join(root, "node_modules", ".bin", name);
const linter = existsSync(bin("eslint"))
  ? [bin("eslint"), "--max-warnings", "0", "--no-warn-ignored"]
  : existsSync(bin("oxlint"))
    ? [bin("oxlint"), "--deny-warnings"]
    : null;
if (!linter) process.exit(0);

const run = spawnSync(linter[0], [...linter.slice(1), ...new Set(changed)], { cwd: root, encoding: "utf8" });
if (run.status === 0 || run.status === null) process.exit(0);
process.stderr.write(
  "The linter reports problems in the files you changed. Fix them before you finish. " +
    "Each Kookie UI report says what to use instead and links the page.\\n\\n" +
    (run.stdout || "") + (run.stderr || ""),
);
process.exit(2);
`;

/**
 * The settings file with the hook's entry added, or null when the file is not JSON this can
 * read. Everything else in the file is kept, and a second run adds nothing.
 */
export function addHook(existing) {
  let settings = {};
  if (existing.trim()) {
    try {
      settings = JSON.parse(existing);
    } catch {
      return null;
    }
    if (settings === null || typeof settings !== "object" || Array.isArray(settings)) return null;
  }
  const hooks = settings.hooks ?? {};
  if (typeof hooks !== "object" || Array.isArray(hooks)) return null;
  const stop = hooks.Stop ?? [];
  if (!Array.isArray(stop)) return null;
  if (JSON.stringify(stop).includes(HOOK_FILE)) return existing;
  const next = {
    ...settings,
    hooks: { ...hooks, Stop: [...stop, { hooks: [{ type: "command", command: HOOK_COMMAND }] }] },
  };
  return `${JSON.stringify(next, null, 2)}\n`;
}

function run(argv, cwd, out) {
  const write = argv.includes("--write");
  const dirFlag = argv.indexOf("--dir");
  const root = dirFlag !== -1 && argv[dirFlag + 1] ? path.resolve(cwd, argv[dirFlag + 1]) : cwd;

  const block = wrap(consumerRules());
  const plan = planFor((relative) => existsSync(path.join(root, relative)));

  out(`Kookie UI rules → ${root}`);
  for (const step of plan) {
    const target = path.join(root, step.file);
    const before =
      step.action === "update"
        ? readFileSync(target, "utf8")
        : step.file.endsWith(".mdc")
          ? MDC_FRONTMATTER
          : "";
    const after = spliceBlock(before, block);
    const verb =
      step.action === "create"
        ? "create"
        : before.includes(BEGIN)
          ? "replace the Kookie UI block in"
          : "append a Kookie UI block to";
    if (!write) {
      out(`  would ${verb} ${step.file}`);
      continue;
    }
    if (after === before) {
      out(`  unchanged  ${step.file}`);
      continue;
    }
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, after);
    out(`  ${step.action === "create" ? "created" : "updated"}   ${step.file}`);
  }
  // The linter. An ESLint flat config the repo already has gets the entry; nothing is created,
  // because a repo with no ESLint config has not chosen ESLint.
  const config = ESLINT_CONFIGS.find((file) => existsSync(path.join(root, file)));
  const lines = [`    ${LINT_IMPORT}`, `    ${LINT_ENTRY},   // last in the exported array`];
  if (!config) {
    out("  the linter: no ESLint flat config here. When you add one, it needs these two lines:");
    for (const line of lines) out(line);
  } else {
    const before = readFileSync(path.join(root, config), "utf8");
    const after = addLinter(before);
    if (after === before) out(`  unchanged  ${config} (the linter is already there)`);
    else if (after === null) {
      out(`  the linter: ${config} has a shape this command will not edit. Add these two lines:`);
      for (const line of lines) out(line);
    } else if (!write) out(`  would add the Kookie UI linter to ${config}`);
    else {
      writeFileSync(path.join(root, config), after);
      out(`  updated   ${config} (added the Kookie UI linter)`);
    }
  }

  // The hook, only when asked for by name.
  if (!argv.includes("--hook")) {
    out("  the Claude Code hook: not added. Pass --hook to run the linter each time Claude Code finishes.");
  } else {
    const settingsPath = path.join(root, SETTINGS_FILE);
    const before = existsSync(settingsPath) ? readFileSync(settingsPath, "utf8") : "";
    const after = addHook(before);
    if (after === null) {
      out(`  the Claude Code hook: ${SETTINGS_FILE} is not JSON this command can read. Nothing was changed.`);
    } else if (!write) {
      out(`  would write ${HOOK_FILE}`);
      if (after !== before) out(`  would add a Stop hook to ${SETTINGS_FILE}`);
    } else {
      mkdirSync(path.dirname(path.join(root, HOOK_FILE)), { recursive: true });
      writeFileSync(path.join(root, HOOK_FILE), HOOK_SCRIPT);
      chmodSync(path.join(root, HOOK_FILE), 0o755);
      out(`  wrote     ${HOOK_FILE}`);
      if (after !== before) {
        writeFileSync(settingsPath, after);
        out(`  updated   ${SETTINGS_FILE} (added a Stop hook)`);
      } else out(`  unchanged  ${SETTINGS_FILE}`);
    }
  }

  if (!write) {
    out("");
    out("Nothing was written. Run the same command with --write to apply exactly this plan.");
  }
  return plan;
}

/**
 * Compared by REAL path. `npx` runs this through `node_modules/.bin/kookie-ui`, a symlink, so
 * `argv[1]` names the link while `import.meta.url` names the file it points at. A plain path
 * comparison never matched there, and `init` printed nothing and wrote nothing (2026-10-17,
 * found by the agent eval). macOS's `/var` → `/private/var` is the same failure.
 */
const realOrSelf = (file) => {
  try {
    return realpathSync(file);
  } catch {
    return path.resolve(file);
  }
};
const invokedDirectly =
  process.argv[1] !== undefined &&
  realOrSelf(process.argv[1]) === realOrSelf(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  const argv = process.argv.slice(2);
  if (argv[0] !== "init") {
    console.error("Usage: npx @kushagradhawan/kookie-ui-react init [--write] [--hook] [--dir <path>]");
    process.exit(1);
  }
  run(argv, process.cwd(), (line) => console.log(line));
}

export { run };
