/** A small argv reader: `--flag`, `--key value`, `--key=value`. */
export type Args = { flags: Set<string>; values: Map<string, string>; rest: string[] };

export function parseArgs(argv: string[]): Args {
  const flags = new Set<string>();
  const values = new Map<string, string>();
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (!arg.startsWith("--")) {
      rest.push(arg);
      continue;
    }
    const eq = arg.indexOf("=");
    if (eq > 0) {
      values.set(arg.slice(2, eq), arg.slice(eq + 1));
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--") && VALUED.has(arg.slice(2))) {
      values.set(arg.slice(2), next);
      i++;
      continue;
    }
    flags.add(arg.slice(2));
  }
  return { flags, values, rest };
}

/** Options that take a value. Everything else is a flag. */
const VALUED = new Set(["model", "out", "batch", "tasks", "arms", "reps", "tarball", "parallel", "timeout", "snapshot", "json"]);

/** `"1,3"` against a list of ids: an id matches by its full name or its leading number. */
export function pick<T extends { id: string }>(all: T[], spec: string | undefined): T[] {
  if (!spec) return all;
  const wanted = spec.split(",").map((s) => s.trim()).filter(Boolean);
  const out = all.filter((item) => wanted.some((w) => item.id === w || item.id.startsWith(`${w.padStart(2, "0")}-`)));
  if (out.length !== wanted.length) throw new Error(`unknown id in "${spec}"; known: ${all.map((i) => i.id).join(", ")}`);
  return out;
}

/** Quote one argument for a POSIX shell, for printing a command a person can paste. */
export const shellQuote = (arg: string): string => (/^[\w@%+=:,./-]+$/.test(arg) ? arg : `'${arg.replace(/'/g, `'\\''`)}'`);
