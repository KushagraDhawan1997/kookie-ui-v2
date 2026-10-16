// Copies the local build into every sibling project that installs this package, so a consumer's
// dev server picks up a change without a publish or a reinstall. It writes into the copy pnpm
// already installed (node_modules/.pnpm/<entry>/node_modules/<name>), which keeps the consumer's
// own React the only React. Files are removed before they are written: pnpm hard-links installed
// files from its global store, and writing through a link would change the store for every project.
//
// Consumers default to the sibling projects listed below; KUI_CONSUMERS (comma-separated paths)
// replaces the list. A missing project or one without an install is skipped.
import { cpSync, existsSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8"));
const code = resolve(pkgRoot, "../../..");
// The package was named @kookie-ui/react before it took its published name, and an install made
// then still carries that name.
const NAMES = [pkg.name, "@kookie-ui/react"];

const consumers = (process.env.KUI_CONSUMERS?.split(",") ?? [
  "kushagradhawan-v3",
  "kookie",
  "kookie-flow",
]).map((p) => resolve(code, p.trim()));

function installedCopies(project) {
  const store = join(project, "node_modules/.pnpm");
  if (!existsSync(store)) return [];
  const copies = [];
  for (const entry of readdirSync(store)) {
    if (!entry.includes("kookie-ui")) continue;
    const scope = join(store, entry, "node_modules");
    for (const dir of [join(scope, pkg.name), join(scope, "@kookie-ui/react")]) {
      const manifest = join(dir, "package.json");
      if (!existsSync(manifest)) continue;
      if (NAMES.includes(JSON.parse(readFileSync(manifest, "utf8")).name)) copies.push(dir);
    }
  }
  return copies;
}

// A build can import a dependency the consumer's install predates. pnpm puts a package's
// dependencies beside it, so a missing sibling means the consumer needs one `pnpm install`.
function missingDeps(dir) {
  const siblings = dirname(dirname(dir)); // both names are scoped: node_modules/@scope/name
  return Object.keys(pkg.dependencies ?? {}).filter((dep) => !existsSync(join(siblings, dep)));
}

// The copies a project actually resolves: its own node_modules and each workspace package's.
// An install left behind by a rename stays in the store and is still updated, but only a copy
// something resolves can be missing a dependency that matters.
function resolvedCopies(project) {
  const roots = [project];
  for (const group of ["apps", "packages"]) {
    const dir = join(project, group);
    if (existsSync(dir)) roots.push(...readdirSync(dir).map((d) => join(dir, d)));
  }
  const links = new Set();
  for (const root of roots) {
    for (const name of NAMES) {
      const link = join(root, "node_modules", name);
      if (existsSync(link)) links.add(realpathSync(link));
    }
  }
  return links;
}

let total = 0;
for (const project of consumers) {
  const resolved = resolvedCopies(project);
  for (const dir of installedCopies(project)) {
    for (const part of pkg.files) {
      const from = join(pkgRoot, part);
      if (!existsSync(from)) continue;
      rmSync(join(dir, part), { recursive: true, force: true });
      cpSync(from, join(dir, part), { recursive: true });
    }
    // The manifest carries the exports map, which moves with the build. The installed name and
    // version stay, because the consumer's lockfile and imports name them.
    const installed = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    rmSync(join(dir, "package.json"));
    writeFileSync(join(dir, "package.json"), JSON.stringify({ ...pkg, name: installed.name, version: installed.version }, null, 2) + "\n");
    total++;
    const missing = resolved.has(realpathSync(dir)) ? missingDeps(dir) : [];
    if (missing.length) console.warn(`sync: ${basename(project)} is missing ${missing.join(", ")}; run pnpm install there`);
  }
}
console.log(`sync: ${total} installed ${total === 1 ? "copy" : "copies"} updated in ${consumers.map((p) => basename(p)).join(", ")}`);
