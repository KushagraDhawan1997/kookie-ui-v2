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
 * HOW IT REACHES INTO THE PACKAGE. Everything it needs is now a public export of
 * `@kookie-ui/react` or `@kookie-ui/react/agent` and is imported: the axes, the layout scales,
 * the refusal sentences and the rule for who takes them. It was three ways for a day, the third
 * being a regex over `system/refused.ts` — whose messages were string literal TYPES with no
 * value to import — and that spelling is what left the documentation site, which runs in a
 * browser and can parse nothing, with none of those facts at all. `tokens.css` is itself
 * generated from `config.ts` and says so in its header, so reading it is reading the
 * generator's own output rather than re-deriving what the generator already decided.
 */
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

/* THE REFUSAL SETS ARE IMPORTED, NOT PARSED (2026-09-07, the audit). They were scraped out of
   `system/refused.ts` with two regexes, because the sentences existed only as string literal
   TYPES and there was no value to read. That worked here and could never work on the
   documentation site, which runs in a browser: it had the facts nowhere, so its `check_snippet`
   answered "No problems found" to a snippet this server reported five findings on. The
   sentences are `as const` values now and the rule saying which symbol takes which set is
   `system/refusal-sets.ts`, so both surfaces read one home and the scrape is gone. */


/* `refusedPropsOf` moved to `@kookie-ui/react/agent` on 2026-09-07: the documentation site
   needs the same rule at runtime, and a second copy there was dead on arrival. Re-exported so
   this module's own callers and its laws are unchanged. */
import { REFUSAL_SETS, layoutScales, refusalSetsFor, refusedPropsOf } from "@kookie-ui/react/agent";

export { refusedPropsOf };

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

  // A BRACE STACK, NOT A FLAT REGEX (2026-09-07, the audit). The first spelling matched
  // `selector { body }` with a pattern that could contain no braces, which silently dropped
  // every at-rule wrapper: a `:root` nested inside `@supports (color: color(display-p3 0 0 0))`
  // was recorded as plain `:root` and CLAIMED the root slot, while the real base declaration
  // sits under the comma selector `:root, [data-appearance="light"]`, which `scope === ":root"`
  // never matched. Measured: 195 of 844 tokens printed a value that is not the `:root` value,
  // under a caption saying it is.
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  /** The selectors and at-rule preludes we are currently inside, outermost first. */
  const stack: string[] = [];
  let cursor = 0;
  let head = 0;
  const tidy = (text: string): string => text.trim().replace(/\s+/g, " ");

  while (cursor < source.length) {
    const char = source[cursor];
    if (char === "{") {
      stack.push(tidy(source.slice(head, cursor)));
      cursor += 1;
      head = cursor;
      continue;
    }
    if (char === "}") {
      readDeclarations(source.slice(head, cursor), stack);
      stack.pop();
      cursor += 1;
      head = cursor;
      continue;
    }
    if (char === ";") {
      // An at-statement (`@import`, `@charset`) or a declaration already consumed by the
      // enclosing block's flush. Either way the prelude for the NEXT block starts after it.
      if (stack.length === 0) head = cursor + 1;
      cursor += 1;
      continue;
    }
    cursor += 1;
  }

  /**
   * The declarations of one block, filed under every scope it really applies in.
   *
   * A comma selector is several scopes — `:root, [data-appearance="light"]` declares at the
   * root AND in the light scope — and a block inside an at-rule is CONDITIONAL: its `:root` is
   * not the root, so the condition travels into the scope name rather than being dropped.
   */
  function readDeclarations(body: string, ancestors: string[]): void {
    const own = ancestors[ancestors.length - 1];
    if (own === undefined) return;
    const conditions = ancestors.slice(0, -1).filter((entry) => entry.startsWith("@"));
    const written: string[] = [];
    for (const part of own.split(",")) {
      const selector = tidy(part);
      if (!selector) continue;
      written.push(conditions.length ? `${conditions.join(" ")} { ${selector} }` : selector);
    }
    if (written.length === 0) return;
    for (const [, rawName, rawValue] of body.matchAll(/(--[A-Za-z0-9-]+)\s*:\s*([^;{}]+);/g)) {
      const name = rawName!;
      const text = rawValue!.trim();
      for (const scope of written) {
        if (scope === ":root" && !rootValue.has(name)) rootValue.set(name, text);
        (scopes.get(name) ?? scopes.set(name, new Set()).get(name)!).add(scope);
      }
      if (!anyValue.has(name)) anyValue.set(name, text);
    }
  }

  return [...anyValue].map(([name, fallback]) => {
    const others = [...(scopes.get(name) ?? [])].filter((scope) => scope !== ":root");
    const value = rootValue.get(name) ?? fallback;
    return others.length ? { name, value, scopes: others } : { name, value };
  });
}

export async function buildData(): Promise<Data> {
  const { ENTRIES, API, markdownFor, REFUSED_ATTRIBUTES, noRefusedAttribute } = await loadSources();
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
    refusalSets: Object.fromEntries(
      Object.entries(REFUSAL_SETS).map(([name, rows]) => [name, rows.map((row) => ({ ...row }))]),
    ),
    // Every symbol the registry knows, answered by the package's own rule.
    symbolRefusals: Object.fromEntries(
      [...new Set(ENTRIES.flatMap((entry) => [entry.name, ...(entry.parts ?? []).map((part) => part.part)]))].map((symbol) => [
        symbol,
        refusalSetsFor(symbol),
      ]),
    ),
    componentRefusals,
    layoutProps: Object.fromEntries(
      Object.entries(layoutScales).map(([name, scale]) => [name, { scale }]),
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
