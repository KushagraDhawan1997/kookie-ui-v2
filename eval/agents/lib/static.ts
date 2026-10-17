/**
 * The three tools the package itself ships or relies on, run over one app's source:
 * `tsc --noEmit`, the kookie ESLint plugin, and `checkUsage` from `/agent`.
 *
 * Each one is loaded from the INSTALLED package in the app under test, so a run is scored by
 * the version it was given. Tests pass `packages/ui` instead.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { CACHE_DIR, REPO } from "./paths.ts";

// ---------------------------------------------------------------- tsc

export type TscResult = { available: boolean; errors: number; messages: string[] };

export function runTsc(app: string): TscResult {
  const bin = path.join(app, "node_modules/typescript/bin/tsc");
  if (!existsSync(bin)) return { available: false, errors: 0, messages: [] };
  const out = spawnSync(process.execPath, [bin, "--noEmit", "-p", app, "--pretty", "false"], {
    cwd: app,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  const messages = `${out.stdout ?? ""}${out.stderr ?? ""}`
    .split("\n")
    .filter((line) => /error TS\d+/.test(line))
    .map((line) => line.trim());
  return { available: true, errors: messages.length, messages };
}

// ---------------------------------------------------------------- eslint

export type LintResult = {
  errors: number;
  warnings: number;
  /** Files ESLint could not parse. A parse error swallows every finding in that file. */
  fatal: number;
  messages: { file: string; line: number; rule: string | null; severity: number; message: string }[];
};

type EslintModule = typeof import("eslint");

/**
 * Lint with the package's `recommended` config and nothing else, so the counts are the
 * plugin's own findings. `typescript-eslint`'s parser goes first, because the shareable config
 * brings none (its own header says why).
 */
export async function runLint(files: string[], cwd: string, packageDir: string): Promise<LintResult> {
  const { ESLint } = (await import("eslint")) as EslintModule;
  const tseslint = (await import("typescript-eslint")).default;
  const plugin = (await import(pathToFileURL(path.join(packageDir, "dist/lint/index.js")).href)).default;
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: [
      { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } } },
      ...plugin.configs.recommended,
    ],
    errorOnUnmatchedPattern: false,
  });
  const results = await eslint.lintFiles(files);
  const out: LintResult = { errors: 0, warnings: 0, fatal: 0, messages: [] };
  for (const result of results) {
    for (const message of result.messages) {
      if (message.fatal) out.fatal++;
      else if (message.severity === 2) out.errors++;
      else if (message.severity === 1) out.warnings++;
      out.messages.push({
        file: path.relative(cwd, result.filePath),
        line: message.line,
        rule: message.ruleId,
        severity: message.severity,
        message: message.message,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------- checkUsage

/**
 * The snapshot shape `packages/mcp/src/data.ts` reads. Only the fields the lookups below use.
 */
type Refusal = { prop: string; why: string; on?: readonly string[] };
type Snapshot = {
  components: { name: string; symbols: string[] }[];
  api: Record<string, { props: { name: string; type: string }[] }>;
  axes: Record<string, string[]>;
  typeAxis: Record<string, string>;
  refusedAttributes: string[];
  refusedAttributeMessage: string;
  refusalSets: Record<string, Refusal[]>;
  symbolRefusals: Record<string, string[]>;
  componentRefusals: Record<string, Refusal[]>;
  layoutProps: Record<string, { scale: string | null }>;
};

export type Finding = { rule: string; severity: "error" | "warning" | "note"; line: number; tag: string; prop?: string; message: string };
export type UsageResult = { findings: Finding[]; foreign: string[]; spread: number };

type AgentModule = {
  checkUsage: (source: string, data: unknown) => UsageResult;
  refusalReaches: (row: Refusal, symbol: string) => boolean;
};

/**
 * Where the snapshot comes from, first match wins. The snapshot is what `packages/mcp` builds
 * from the docs registry; `snapshot.ts` writes a copy into `.cache/` without touching mcp/dist.
 */
export function snapshotPath(explicit?: string): string {
  const candidates = [
    explicit,
    process.env["KOOKIE_EVAL_SNAPSHOT"],
    path.join(CACHE_DIR, "data.json"),
    path.join(REPO, "packages/mcp/dist/data.json"),
  ].filter((p): p is string => Boolean(p));
  for (const candidate of candidates) if (existsSync(candidate)) return candidate;
  throw new Error(
    "No checkUsage snapshot. Run `node --experimental-strip-types eval/agents/snapshot.ts`, " +
      "or pass --snapshot <data.json>, or set KOOKIE_EVAL_SNAPSHOT.",
  );
}

/**
 * The checker bound to a snapshot. The lookups mirror `packages/mcp/src/data.ts` and
 * `packages/mcp/src/check.ts`, which cannot be imported here: they read the snapshot from
 * mcp's own dist folder at a fixed path.
 */
export async function usageChecker(packageDir: string, snapshotFile: string): Promise<(source: string) => UsageResult> {
  const agent = (await import(pathToFileURL(path.join(packageDir, "dist/agent/index.js")).href)) as AgentModule;
  const data = JSON.parse(readFileSync(snapshotFile, "utf8")) as Snapshot;

  const entryOf = (symbol: string) => data.components.find((row) => row.symbols.includes(symbol));
  const isKookie = (tag: string): boolean => Boolean(data.symbolRefusals[tag]) || Boolean(data.api[tag]) || Boolean(entryOf(tag));
  const refusalsFor = (symbol: string): Refusal[] => {
    const out: Refusal[] = [];
    const seen = new Set<string>();
    const take = (row: Refusal): void => {
      if (seen.has(row.prop)) return;
      seen.add(row.prop);
      out.push(row);
    };
    for (const set of data.symbolRefusals[symbol] ?? []) for (const row of data.refusalSets[set] ?? []) take(row);
    const entry = entryOf(symbol);
    if (entry) {
      const declared = new Set((data.api[symbol]?.props ?? []).map((row) => row.name));
      for (const row of data.componentRefusals[entry.name] ?? []) {
        if (symbol !== entry.name && declared.has(row.prop)) continue;
        if (!agent.refusalReaches(row, symbol)) continue;
        take(row);
      }
    }
    return out;
  };
  const legalValues = (symbol: string, prop: string): string[] | undefined => {
    const declared = data.api[symbol]?.props.find((row) => row.name === prop);
    if (declared) {
      const axis = data.typeAxis[declared.type];
      if (axis) return data.axes[axis];
      const members = declared.type.split("|").map((part) => part.trim());
      if (members.length > 1 && members.every((part) => /^"[^"]*"$/.test(part))) return members.map((part) => part.slice(1, -1));
      return undefined;
    }
    const layout = data.layoutProps[prop];
    if (layout?.scale === "space") {
      if (/^m([xytrbl])?$/.test(prop)) return data.axes["marginSpace"];
      if (/^p([xytrbl])?$/.test(prop)) return data.axes["paddingSpace"];
      return data.axes["space"];
    }
    return undefined;
  };
  const snippetData = {
    isKookie,
    refusalsFor,
    legalValues,
    scaleIndexed: (_symbol: string, prop: string) => data.layoutProps[prop]?.scale === "space",
    refusedAttributes: data.refusedAttributes,
    refusedAttributeMessage: data.refusedAttributeMessage,
  };
  return (source: string) => agent.checkUsage(source, snippetData);
}

// ---------------------------------------------------------------- wrong props

/**
 * `Tag.prop` for every prop the tools say does not belong: checkUsage's refused props, illegal
 * values and refused attributes, plus tsc's "Property 'x' does not exist on type 'XProps'".
 */
export function wrongProps(findings: Finding[], tscMessages: string[]): string[] {
  const out: string[] = [];
  for (const finding of findings) {
    if (["refused-prop", "illegal-value", "refused-attribute"].includes(finding.rule) && finding.prop) {
      out.push(`${finding.tag}.${finding.prop}`);
    }
  }
  for (const message of tscMessages) {
    const prop = /Property '([^']+)' does not exist on type '([^']+)'/.exec(message);
    if (!prop) continue;
    const owner = /(?:^|[\s&<(])([A-Z]\w*?)Props\b/.exec(prop[2]!);
    out.push(`${owner ? owner[1] : "?"}.${prop[1]} (tsc)`);
  }
  return out;
}
