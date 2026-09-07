/**
 * Builds `dist/data.json`: the snapshot the server answers out of.
 *
 * WHY A SNAPSHOT AT ALL. Every fact this server serves already has a home, and every one of
 * those homes is inside `apps/docs` or `packages/ui/src`. A published npm package cannot
 * import from a Next.js app — there is no dist to import, the module graph reaches `.mdx` and
 * `.css`, and the app is private and never published. So the choice is between copying the
 * facts, which this repo calls its most-repeated defect, and DERIVING them at build time.
 * This script is the derivation. Nothing in `dist/data.json` is authored, and `src/data.test.ts`
 * re-runs the derivation and fails when the snapshot has drifted from its sources — the same
 * shape as `tokens.css`'s own drift law.
 *
 * HOW IT REACHES INTO THE DOCS. `markdown.ts` is the twin: the exact document the site serves
 * at `/components/<slug>.md`. Reusing it is the whole point, because a second renderer here
 * would be a second opinion about what a component page says. Its module graph pulls the
 * chapter `.mdx` files and the React specimens, so the graph is bundled with esbuild and two
 * loaders stub what a node process cannot execute. Neither stub is reachable from a component
 * twin: a chapter's compiled component is read only by `chapterMarkdown`, and a stylesheet is
 * imported for a side effect that only exists in a browser.
 *
 * HOW IT REACHES INTO THE PACKAGE. Three homes, three ways, each the cheapest that is exact:
 * `componentAxes` and `themeAxes` are public exports and are imported; `boxProps` is internal
 * and is bundled from source; and `refused.ts` states its messages as string LITERAL TYPES,
 * which exist only for the compiler, so it is parsed. `tokens.css` is itself generated from
 * `config.ts` and says so in its header, so reading it is reading the generator's own output
 * rather than re-deriving what the generator already decided.
 */
import { build } from "esbuild";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { ApiEntry, Data, Refusal, TokenRow } from "../src/data.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const DOCS = path.join(ROOT, "apps/docs/app/(docs)");
const UI = path.join(ROOT, "packages/ui/src");
const OUT_DIR = path.join(HERE, "../dist");
/* The intermediate bundle is 12 MB of docs app and package source, and `files` publishes
   `dist`, so it is written to the package's own cache rather than beside the snapshot. */
const CACHE = path.join(HERE, "../node_modules/.cache/kookie-mcp");

/**
 * The single home of every fact this snapshot carries, reported by the server on every tool
 * result that leans on one. A reader who doubts an answer can go and read the source rather
 * than trusting a snapshot they cannot see.
 */
export const SOURCES = {
  registry: "apps/docs/app/(docs)/components/registry.ts",
  api: "apps/docs/app/(docs)/components/api.generated.ts",
  twin: "apps/docs/app/(docs)/markdown.ts",
  axes: "packages/ui/src/system/axes.ts",
  themeAxes: "packages/ui/src/theme/theme.tsx",
  layoutProps: "packages/ui/src/system/props.ts",
  refusals: "packages/ui/src/system/refused.ts",
  tokens: "packages/ui/src/tokens/tokens.css",
} as const;

/** One esbuild pass over both graphs, so the docs' twin and the package's internals arrive
    in this process by the same road. */
async function loadSources(): Promise<{
  ENTRIES: { name: string; slug: string; family: string; abstract: string; parts?: { part: string }[]; refusals: { name: string; why: string }[] }[];
  API: Record<string, ApiEntry>;
  markdownFor: (p: string) => string | null;
  boxProps: Record<string, { scale: string | null }>;
  REFUSED_ATTRIBUTES: ReadonlySet<string>;
  noRefusedAttribute: { meta?: { messages?: Record<string, string> } };
}> {
  const bundle = path.join(CACHE, "sources.mjs");
  mkdirSync(CACHE, { recursive: true });
  await build({
    stdin: {
      contents: `
        export { ENTRIES } from ${JSON.stringify(path.join(DOCS, "components/registry.ts"))};
        export { API } from ${JSON.stringify(path.join(DOCS, "components/api.generated.ts"))};
        export { markdownFor } from ${JSON.stringify(path.join(DOCS, "markdown.ts"))};
        export { boxProps } from ${JSON.stringify(path.join(UI, "system/props.ts"))};
        export { REFUSED_ATTRIBUTES, noRefusedAttribute } from ${JSON.stringify(path.join(UI, "lint/no-refused-attribute.ts"))};
      `,
      resolveDir: DOCS,
      loader: "ts",
    },
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: bundle,
    jsx: "automatic",
    logLevel: "silent",
    plugins: [
      {
        name: "kookie-stubs",
        setup(build) {
          // A chapter's compiled component, read only by `chapterMarkdown`. This script asks
          // for component twins alone, so the stub is never rendered.
          build.onLoad({ filter: /\.mdx$/ }, () => ({
            contents: "export default function Chapter() { return null; }",
            loader: "js",
          }));
          // A stylesheet is imported for a side effect that only exists in a browser.
          build.onLoad({ filter: /\.css$/ }, () => ({ contents: "", loader: "js" }));
        },
      },
    ],
  });
  // THE DOCS APP IS THE WORKING DIRECTORY while its modules load. Three of them read files off
  // `process.cwd()` — the example, chapter and block sources — because Turbopack traces a whole
  // project into the server bundle when it cannot statically bound a filesystem read, and each
  // one says so where it does it. The cwd is part of their contract, and honouring it is
  // cheaper than a second way to find those files.
  const cwd = process.cwd();
  process.chdir(path.join(ROOT, "apps/docs"));
  try {
    return await import(pathToFileURL(bundle).href);
  } finally {
    process.chdir(cwd);
  }
}

/**
 * The refusal sets, parsed out of `refused.ts`.
 *
 * Parsed rather than imported because the sentences are STRING LITERAL TYPES: they exist for
 * the compiler's diagnostic display and there is no value to import at runtime. That is the
 * mechanism the file itself explains, so reading its source is reading the only copy there is.
 */
export function parseRefusals(source: string): Record<string, Refusal[]> {
  const sets: Record<string, Refusal[]> = {};
  for (const [, name, body] of source.matchAll(/export type (\w+Refusals) = \{([\s\S]*?)\n\};/g)) {
    const rows: Refusal[] = [];
    for (const [, prop, message] of body!.matchAll(/^\s{2}(\w+)\?:[^;]*?Refused<"((?:[^"\\]|\\.)*)">/gm)) {
      rows.push({ prop: prop!, why: message!.replace(/\\(["\\])/g, "$1") });
    }
    sets[name!] = rows;
  }
  // The alias, expanded. `refused.ts` states it as `A & B` rather than as a list, and a reader
  // of a tool result should get the props rather than the algebra.
  const merged = [...(sets["RadixReflexRefusals"] ?? []), ...(sets["SpacingRefusals"] ?? [])];
  if (merged.length) sets["ComponentRefusals"] = merged;
  return sets;
}

/**
 * Which refusal sets each exported symbol takes.
 *
 * A component states this itself, in the one line where its props type opens: `export type
 * ButtonProps = ComponentRefusals & …`. Nothing else in the repo knows it, and a list here
 * would go stale the first time a component changed its mind.
 */
export function parseSymbolRefusals(sources: { file: string; text: string }[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const { text } of sources) {
    for (const [, symbol, head] of text.matchAll(/export type (\w+)Props(?:<[^=>]*>)?\s*=\s*([^{;]*)/g)) {
      const sets = [...head!.matchAll(/\b(\w+Refusals)\b/g)].map(([, name]) => name!);
      if (sets.length) out[symbol!] = [...new Set(sets)];
    }
  }
  return out;
}

/** Every `.tsx` under a directory tree. */
function sourcesUnder(dir: string): { file: string; text: string }[] {
  const out: { file: string; text: string }[] = [];
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) out.push(...sourcesUnder(full));
    else if (item.name.endsWith(".tsx") && !item.name.includes(".test.")) {
      out.push({ file: path.relative(ROOT, full), text: readFileSync(full, "utf8") });
    }
  }
  return out;
}

/**
 * The props a registry entry refuses, on top of the universal sets.
 *
 * A refusal is written for a person, so its name is a phrase — "A horizontal orientation",
 * "`tone` and `emphasis`". Only backticked identifiers are taken, because those are the ones
 * the registry has itself spelled as code; a refusal naming no prop yields nothing and is left
 * to `get_component`, where a reader meets the whole sentence. The refusal's own words travel
 * with the prop, so nothing here restates a reason.
 */
export function refusedPropsOf(refusals: { name: string; why: string }[]): Refusal[] {
  const out: Refusal[] = [];
  for (const refusal of refusals) {
    for (const [, code] of refusal.name.matchAll(/`([^`]+)`/g)) {
      // A prop, not a component or an element: lower camel, no spaces.
      if (!/^[a-z][A-Za-z0-9]*$/.test(code!)) continue;
      if (out.some((row) => row.prop === code)) continue;
      out.push({ prop: code!, why: `${refusal.name} — ${refusal.why}` });
    }
  }
  return out;
}

/**
 * Every custom property the generator emitted, with the value it takes at `:root` and the
 * scopes that redeclare it.
 *
 * The `:root` value is what a reader wants, because it is what the token resolves to on the
 * default path, and the scope list is what stops that being a lie: a token redeclared under
 * dark or under a density is a different value there, and naming the scopes is far cheaper
 * than shipping every declaration of all of them.
 */
export function parseTokens(css: string): TokenRow[] {
  const rootValue = new Map<string, string>();
  const anyValue = new Map<string, string>();
  const scopes = new Map<string, Set<string>>();
  // The generator emits no nested rules, so a block is a selector and everything to its
  // closing brace. Comments go first, because they carry braces.
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [, selector, body] of flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const scope = selector!.trim().replace(/\s+/g, " ");
    for (const [, rawName, rawValue] of body!.matchAll(/(--[A-Za-z0-9-]+)\s*:\s*([^;]+);/g)) {
      const name = rawName!;
      const text = rawValue!.trim();
      if (scope === ":root" && !rootValue.has(name)) rootValue.set(name, text);
      if (!anyValue.has(name)) anyValue.set(name, text);
      (scopes.get(name) ?? scopes.set(name, new Set()).get(name)!).add(scope);
    }
  }
  return [...anyValue].map(([name, fallback]) => {
    const others = [...(scopes.get(name) ?? [])].filter((scope) => scope !== ":root");
    const value = rootValue.get(name) ?? fallback;
    return others.length ? { name, value, scopes: others } : { name, value };
  });
}

export async function buildData(): Promise<Data> {
  const { ENTRIES, API, markdownFor, boxProps, REFUSED_ATTRIBUTES, noRefusedAttribute } = await loadSources();
  // The sentence the eslint rule reports, taken whole. `check_usage` refuses the same thing
  // the rule refuses, so writing a second explanation of it here would be two answers to one
  // question — which is what the scanner's own header promises it never does.
  const refusedAttributeMessage = noRefusedAttribute.meta?.messages?.["refused"];
  if (!refusedAttributeMessage) {
    throw new Error("no-refused-attribute states no `refused` message: the sentence has moved");
  }
  const { componentAxes, themeAxes } = await import("@kookie-ui/react");

  const markdown: Record<string, string> = {};
  for (const entry of ENTRIES) {
    const twin = markdownFor(`/components/${entry.slug}`);
    if (!twin) throw new Error(`no markdown twin for ${entry.slug}: the registry and the twin disagree`);
    markdown[entry.slug] = twin;
  }

  const componentRefusals: Record<string, Refusal[]> = {};
  for (const entry of ENTRIES) {
    const rows = refusedPropsOf(entry.refusals);
    if (rows.length) componentRefusals[entry.name] = rows;
  }

  return {
    sources: SOURCES,
    components: ENTRIES.map((entry) => ({
      name: entry.name,
      slug: entry.slug,
      family: entry.family,
      abstract: entry.abstract,
      symbols: [entry.name, ...(entry.parts ?? []).map((part) => part.part)],
    })),
    markdown,
    api: API,
    axes: {
      ...Object.fromEntries(Object.entries(componentAxes).map(([key, values]) => [key, [...values]])),
      ...Object.fromEntries(Object.entries(themeAxes).map(([key, values]) => [`theme.${key}`, [...values as readonly string[]]])),
    },
    typeAxis: {
      Size: "size",
      Tone: "tone",
      Emphasis: "emphasis",
      Material: "material",
      Weight: "weight",
      TypeSize: "typeSize",
      Density: "theme.density",
      Depth: "theme.depth",
      Contrast: "theme.contrast",
      Pointer: "theme.pointer",
      RadiusLevel: "theme.radius",
      Appearance: "theme.appearance",
    },
    // The eslint rule computes this from the same two axis tables; taken from it rather
    // than recomputed, so the two cannot answer differently.
    refusedAttributes: [...REFUSED_ATTRIBUTES].sort(),
    refusedAttributeMessage,
    refusalSets: parseRefusals(readFileSync(path.join(ROOT, SOURCES.refusals), "utf8")),
    symbolRefusals: parseSymbolRefusals([
      ...sourcesUnder(path.join(UI, "components")),
      ...sourcesUnder(path.join(UI, "theme")),
    ]),
    componentRefusals,
    layoutProps: Object.fromEntries(
      Object.entries(boxProps).map(([name, def]) => [name, { scale: def.scale }]),
    ),
    tokens: parseTokens(readFileSync(path.join(ROOT, SOURCES.tokens), "utf8")),
  };
}

// Written only when this file is the entry, so the drift law can import `buildData` and compare.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const data = await buildData();
  const json = JSON.stringify(data);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, "data.json"), json);
  process.stdout.write(
    `data.json: ${data.components.length} components, ` +
      `${Object.keys(data.symbolRefusals).length} symbols with refusals, ` +
      `${data.tokens.length} tokens, ${(Buffer.byteLength(json) / 1024).toFixed(0)} KB\n`,
  );
}
