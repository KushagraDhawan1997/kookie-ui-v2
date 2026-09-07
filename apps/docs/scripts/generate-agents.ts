/**
 * The rules file the package hands a consumer's coding agent, generated (2026-09-07).
 *
 * WHY IT IS GENERATED AND NOT WRITTEN. Everything an agent needs to be told about this system
 * is already written down, once each: the closed export list is `packages/ui/src/index.ts`,
 * the axes are `componentAxes` and `themeAxes`, the refusals are the docs registry, and the
 * five sentences every component inherits are `EVERYWHERE`. A hand-written rules file would be
 * a second copy of all four, and this repo knows what that costs — the component reference
 * once documented a `Theme accentColor` prop that had never existed. So nothing here is
 * authored. Every line is read out of the home that already owns it, and a drift law
 * regenerates and compares.
 *
 * WHY IT LIVES IN THE DOCS APP AND WRITES INTO THE PACKAGE. The refusals live in
 * `app/(docs)/components/registry.ts` and the exports and axes live in `packages/ui/src`, so
 * whatever generates this file has to read both. The docs app already depends on the package
 * and already hosts a generator of exactly this shape (`generate-api.ts`), so it reads
 * downward; the package would have to read upward into an app it does not depend on, which
 * would make a published tarball depend on a private workspace. The artifact is committed, so
 * the package ships it without ever running this.
 *
 * WHY THE REFUSALS ARE NAMES AND NOT REASONS. The 218 refusal rows carry 52KB of prose, and
 * this file is meant to sit in an agent's context for a whole session. A name is enough to
 * stop the wrong prop being written; the reason is one fetch away at the page's markdown twin,
 * and the file says how to reach it.
 *
 * WHY NO URL. This repo has no site origin anywhere and `llms.ts` explains why inventing one
 * would be a fact that is wrong on every deploy but one. So the lookup section states the
 * SHAPE of the twin URL and lets the reader supply the host they are already on.
 *
 * Run:   pnpm --filter docs run agents
 * Check: pnpm --filter docs run agents:check   (writes nothing; fails on drift)
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

/**
 * TYPES STATICALLY, VALUES DYNAMICALLY, and the split is forced rather than chosen.
 *
 * Node resolves a TypeScript import only with its extension on, and the docs app's tsconfig
 * sets `allowImportingTsExtensions: false`, so a static `from "…/axes.ts"` runs and does not
 * typecheck while a static `from "…/axes"` typechecks and does not run. A dynamic import of a
 * computed URL is invisible to module resolution, and a type-only import beside it is erased
 * before Node ever sees the file — so both halves get what they need and neither is a cast.
 *
 * AND THE TYPE HALF COMES THROUGH THE PACKAGE ENTRY, never a relative path into
 * `packages/ui/src`. Erased before Node runs is not the same as unread by TypeScript: a
 * type-only import still LOADS the file it names, so pointing one at `system/axes.ts` pulled
 * package source into the docs' program — where `allowImportingTsExtensions` is false, and every
 * extension-bearing import inside the package then failed the docs build with TS5097, in files
 * this app never mentions. The entry's `.d.ts` carries the same shapes with none of that reach,
 * and `MATERIALS`/`SIZES` need no exception: `componentAxes` holds both, so the private names
 * were a second way of saying what the public one already says.
 */
import type { componentAxes as ComponentAxes, tiers as Tiers } from "@kookie-ui/react";
import type * as RegistryModule from "../app/(docs)/components/registry";
import type * as ExportsModule from "../app/package-exports";

const load = <T,>(relative: string): Promise<T> =>
  import(new URL(relative, import.meta.url).href) as Promise<T>;

const { componentAxes } = await load<{ componentAxes: typeof ComponentAxes }>(
  "../../../packages/ui/src/system/axes.ts",
);
const { tiers } = await load<{ tiers: typeof Tiers }>(
  "../../../packages/ui/src/system/props.ts",
);
const { ENTRIES } = await load<typeof RegistryModule>("../app/(docs)/components/registry.ts");
const { parsePackageExports, parseValueExports } = await load<typeof ExportsModule>(
  "../app/package-exports.ts",
);

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.join(here, "../../../packages/ui/src");
const indexPath = path.join(packageRoot, "index.ts");
const themePath = path.join(packageRoot, "theme/theme.tsx");
const markdownPath = path.join(here, "../app/(docs)/markdown.ts");
const outPath = path.join(here, "../../../packages/ui/agents/AGENTS.md");

/**
 * Two of the four homes are IMPORTED and two are PARSED, and the split is not a preference.
 *
 * `axes.ts`, `props.ts` and `registry.ts` are plain TypeScript that Node can strip types from,
 * so their values are read as values — which is the only spelling that survives a list being
 * computed rather than written (`componentAxes.space` is a `map` over the space scale, and an
 * AST would see the map). `theme.tsx` and `markdown.ts` cannot be loaded: one is JSX, which
 * Node does not transform, and the other imports its neighbours without file extensions, which
 * Node does not resolve. Their two facts are literal arrays, so they are read out of the AST —
 * and the reader below THROWS on anything that is not a literal, because a silently empty axis
 * list is exactly how a generated file goes quietly wrong.
 */
const sourceFile = (file: string) =>
  ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);

/** Identifiers a literal array may be spelled as. `themeAxes.size` is `SIZES`, not `["1", …]`. */
const KNOWN: Record<string, readonly string[]> = {
  SIZES: componentAxes.size,
  MATERIALS: componentAxes.material,
};

function stringArray(node: ts.Node, where: string): string[] {
  if (ts.isIdentifier(node)) {
    const known = KNOWN[node.text];
    if (!known) throw new Error(`${where}: ${node.text} is not a list this generator can resolve.`);
    return [...known];
  }
  if (!ts.isArrayLiteralExpression(node)) throw new Error(`${where}: not an array literal.`);
  return node.elements.map((element) => {
    if (!ts.isStringLiteral(element)) throw new Error(`${where}: element is not a string literal.`);
    return element.text;
  });
}

/** A top-level `export const NAME = { … }` or `= [ … ]`, as its initializer. */
function declarationOf(file: ts.SourceFile, name: string): ts.Expression {
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) {
        if (!declaration.initializer) break;
        // `as const` wraps the literal; the literal is what we want.
        return ts.isAsExpression(declaration.initializer)
          ? declaration.initializer.expression
          : declaration.initializer;
      }
    }
  }
  throw new Error(`${path.basename(file.fileName)}: no exported ${name}.`);
}

function objectOfLists(file: ts.SourceFile, name: string): Record<string, string[]> {
  const node = declarationOf(file, name);
  if (!ts.isObjectLiteralExpression(node)) throw new Error(`${name}: not an object literal.`);
  const out: Record<string, string[]> = {};
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = property.name.getText();
    out[key] = stringArray(property.initializer, `${name}.${key}`);
  }
  return out;
}

function objectOfStrings(file: ts.SourceFile, name: string): Record<string, string> {
  const node = declarationOf(file, name);
  if (!ts.isObjectLiteralExpression(node)) throw new Error(`${name}: not an object literal.`);
  const out: Record<string, string> = {};
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    if (!ts.isStringLiteral(property.initializer)) {
      throw new Error(`${name}.${property.name.getText()}: not a string literal.`);
    }
    out[property.name.getText()] = property.initializer.text;
  }
  return out;
}

/** Everything this file states, read from the home that owns it. Exported for the laws. */
export function facts() {
  const theme = sourceFile(themePath);
  return {
    components: parsePackageExports(readFileSync(indexPath, "utf8")),
    // Hooks and the axis tables are exports too, and a rules file that lists only the
    // components would say "this list is closed" while omitting `useMaterial` and
    // `componentAxes`.
    //
    // The dunder prefix is dropped, and it is a convention this repo already states rather than
    // an exception written here: `__retuneLens` is the material bench's seam, fenced by its name
    // precisely because nothing outside the bench may call it. Naming it in a document whose
    // whole purpose is to tell an agent what it may reach for is an invitation, and the filter
    // is on the FENCE rather than on the name, so a second seam is covered the day it exists.
    other: parseValueExports(readFileSync(indexPath, "utf8")).filter(
      (n) => !/^[A-Z]/.test(n) && !n.startsWith("__"),
    ),
    themeAxes: objectOfLists(theme, "themeAxes"),
    themeDefaults: objectOfStrings(theme, "themeDefaults"),
    componentAxes,
    tiers,
    everywhere: stringArray(declarationOf(sourceFile(markdownPath), "EVERYWHERE"), "EVERYWHERE"),
    entries: ENTRIES,
  };
}

const list = (values: readonly string[]) => values.map((value) => `\`${value}\``).join(" · ");

export function generatedText(): string {
  const f = facts();
  const out: string[] = [];

  out.push(
    "<!-- GENERATED — do not edit. Source: packages/ui/src/index.ts, packages/ui/src/system/axes.ts,",
    "     packages/ui/src/theme/theme.tsx, apps/docs/app/(docs)/components/registry.ts and",
    "     apps/docs/app/(docs)/markdown.ts, via apps/docs/scripts/generate-agents.ts.",
    "     Regenerate with `pnpm --filter docs run agents`. A law regenerates and compares. -->",
    "",
    "# KookieUI, for coding agents",
    "",
    "Rules for writing `@kookie-ui/react`. Read this before writing a component; it is short",
    "because it only carries what a lookup cannot tell you.",
    "",
    "## Every component obeys these",
    "",
  );
  // The five sentences the docs already state on every component page and every markdown twin.
  for (const line of f.everywhere) out.push(`- ${line}`);

  out.push(
    "",
    "## The vocabulary",
    "",
    "There is no `variant` prop and there never was. Appearance is three independent axes:",
    "`tone` says what a thing MEANS, `emphasis` says how LOUD it is, `material` says what it is",
    "made of. A component names a family, never a colour; the theme resolves the value.",
    "",
    "There is no elevation, shadow, or `color` prop either, and no component takes a margin.",
    "Spacing between siblings belongs to the container: set `gap` on the `Flex`, `Stack` or",
    "`Grid` around them, or wrap the child in `<Box m=\"4\">`.",
    "",
    "Do not reach for `className` to get past a refusal. Utility classes are not shipped and",
    "there is nothing for them to hook onto. If a value you need has no index, that is a finding",
    "for the system, not a decision for the call site.",
    "",
    "### Component axes",
    "",
    "Every legal value. A value outside these lists does not compile.",
    "",
  );
  for (const [axis, values] of Object.entries(f.componentAxes)) {
    out.push(`- \`${axis}\` — ${list(values)}`);
  }

  out.push(
    "",
    "### Theme axes",
    "",
    "Set on `<Theme>`, once, near the root. These are app identity, not per-call-site knobs.",
    "The default is in brackets.",
    "",
  );
  for (const [axis, values] of Object.entries(f.themeAxes)) {
    const fallback = f.themeDefaults[axis];
    out.push(`- \`${axis}\` — ${list(values)}${fallback ? ` (default \`${fallback}\`)` : ""}`);
  }

  out.push(
    "",
    "### Responsive tiers",
    "",
    "Any responsive prop takes an object keyed by tier. Tiers are CONTAINER-keyed, so they",
    "answer how much room the component has, not how wide the window is.",
    "",
    ...Object.entries(f.tiers).map(([tier, width]) => `- \`${tier}\` — from ${width}`),
    "",
    "```tsx",
    '<Flex direction={{ initial: "column", md: "row" }} gap="4" />',
    "```",
    "",
    `## The components (${f.components.length})`,
    "",
    "This list is closed. There are no deep imports — every symbol comes from",
    "`@kookie-ui/react`. If what you want is not here, it is not there, and the answer is",
    "composition rather than a wrapper that re-implements it.",
    "",
    f.components.map((name) => `\`${name}\``).join(" · "),
    "",
    "Also exported, and not components:",
    "",
    f.other.map((name) => `\`${name}\``).join(" · "),
    "",
    "## What each component refuses",
    "",
    "These are decisions, not gaps. Asking for one of them is the most common way to write this",
    "system wrong. The reason each one was refused is on the component's own page — see below.",
    "",
  );
  for (const entry of f.entries) {
    if (!entry.refusals.length) continue;
    out.push(`- **${entry.name}** — ${entry.refusals.map((refusal) => refusal.name).join("; ")}`);
  }

  out.push(
    "",
    "## Looking one up",
    "",
    "Every page of the KookieUI docs site is served a second time as plain markdown at the same",
    "path with `.md` on the end. That twin carries the component's abstract, its generated prop",
    "table, its examples and the reason behind every refusal above.",
    "",
    "- `<docs-site>/components/<name>.md` — one component",
    "- `<docs-site>/llms.txt` — an index of every page",
    "- `<docs-site>/llms-full.txt` — the whole site in one fetch",
    "",
    "The component slug is its export name in kebab-case: `SegmentedControl` is",
    "`/components/segmented-control.md`.",
    "",
    "The types are the other reference and they need no network: every exported symbol in",
    "`node_modules/@kookie-ui/react/dist/**/*.d.ts` carries the reasoning on the declaration.",
    "",
  );

  return `${out.join("\n").replace(/\n{3,}/g, "\n\n")}`;
}

/** CLI only. Importing this module (the laws do) must not write or exit. */
const invokedDirectly =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const text = generatedText();
  if (process.argv.includes("--check")) {
    if (readFileSync(outPath, "utf8") !== text) {
      console.error(
        "packages/ui/agents/AGENTS.md is out of date. Run `pnpm --filter docs run agents` and commit the result.",
      );
      process.exit(1);
    }
    console.log(`AGENTS.md is current (${facts().components.length} components).`);
  } else {
    writeFileSync(outPath, text);
    console.log(`Wrote packages/ui/agents/AGENTS.md (${text.length} bytes).`);
  }
}
