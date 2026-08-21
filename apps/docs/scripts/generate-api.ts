/**
 * The API tables, generated from the package's own types (2026-08-21).
 *
 * A hand-written prop table is a second home for a fact the types already own, and this repo
 * knows precisely what that costs — the component reference shipped a documented `accentColor`
 * prop that had never existed, and only `tsc` caught it because the page was TSX. So the
 * mechanical half of the reference is not written at all: it is read out of the source, and a
 * drift law regenerates and compares, exactly as `tokens.css` has been protected since the
 * day it existed.
 *
 * WHAT IS EXTRACTED, AND WHY IT IS NOT EVERYTHING. Every component's props type is an
 * intersection of the props KookieUI designed with the native element's own
 * (`React.ComponentPropsWithoutRef<"button">`). Expanding that through the type checker yields
 * several hundred DOM attributes, which buries the six props that carry the design under
 * `onAnimationIterationCapture`. The generator therefore reads the AST and takes only the
 * members the package DECLARES, and records the native element separately as one sentence. A
 * reader wants to know what Kookie added; the platform's own props are the platform's to
 * document.
 *
 * Local aliases are followed (`SidePaneProps` is built from `TogglePaneOwnProps` and
 * `PaneDressProps` in the same file), because a prop's home inside a component file is an
 * authoring convenience and a reader should never have to know about it.
 *
 * Run: pnpm --filter docs run api
 * Check: pnpm --filter docs run api:check   (writes nothing; fails on drift)
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.join(here, "../../../packages/ui");
const packageRoot = path.join(packageDir, "src");
const indexPath = path.join(packageRoot, "index.ts");
const outPath = path.join(here, "../app/(docs)/components/api.generated.ts");

type ApiProp = { name: string; type: string; optional: boolean; doc: string };
type ApiEntry = { element: string | null; props: ApiProp[] };

/**
 * Every prop name a component's type resolves to, INHERITED ONES INCLUDED — the type checker's
 * answer rather than the AST's.
 *
 * Not part of the generated artifact, and deliberately: `FlexProps` resolves to 324 names once
 * the DOM's own are folded in, so committing them for 74 components would be half a megabyte
 * of noise to display none of. It exists for one law — that no hand-written axis in the
 * registry names a prop the component does not have — which is exactly the check the AST
 * cannot make, because a prop can arrive from an imported type (`gap` from Box's shared prop
 * table) or from the platform (`rows` on a textarea) and be no less real for it.
 *
 * Building a program is seconds of work, so this is called once by the law and never by the
 * page. Exported from here rather than rewritten there, so the two halves of the reference
 * are read out of one place.
 */
export function resolvedPropNames(): Map<string, Set<string>> {
  const config = ts.readConfigFile(path.join(packageDir, "tsconfig.json"), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, packageDir);
  const program = ts.createProgram([indexPath], parsed.options);
  const checker = program.getTypeChecker();

  const resolved = new Map<string, Set<string>>();
  for (const [typeName, file] of propsTypeLocations()) {
    const parsedFile = program.getSourceFile(file);
    if (!parsedFile) continue;
    const alias = parsedFile.statements.find(
      (statement): statement is ts.TypeAliasDeclaration =>
        ts.isTypeAliasDeclaration(statement) && statement.name.text === typeName,
    );
    if (!alias) continue;
    const names = checker
      .getTypeAtLocation(alias.name)
      .getProperties()
      .map((symbol) => symbol.getName());
    resolved.set(typeName.replace(/Props$/, ""), new Set(names));
  }
  return resolved;
}

const sourceFile = (file: string) =>
  ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);

/** `export { Button, type ButtonProps } from "./components/button/button.tsx";` — which props
    type lives in which file. Read from the public index, so a type that is not exported is
    not documented, which is the correct coupling: the public surface is the documented one. */
function propsTypeLocations(): Map<string, string> {
  const found = new Map<string, string>();
  const index = sourceFile(indexPath);
  index.forEachChild((node) => {
    if (!ts.isExportDeclaration(node) || !node.moduleSpecifier) return;
    if (!ts.isStringLiteral(node.moduleSpecifier)) return;
    const target = path.join(packageRoot, node.moduleSpecifier.text);
    const clause = node.exportClause;
    if (!clause || !ts.isNamedExports(clause)) return;
    for (const element of clause.elements) {
      const name = element.name.text;
      if (name.endsWith("Props")) found.set(name, target);
    }
  });
  return found;
}

/** The doc comment on a member, flattened to one paragraph. JSDoc is required on every
    exported prop (ENGINEERING §1.7) precisely so it can serve as the reference. */
function docOf(node: ts.Node): string {
  const jsDoc = (node as { jsDoc?: ts.JSDoc[] }).jsDoc;
  if (!jsDoc?.length) return "";
  return (
    jsDoc
      .map((doc) =>
        typeof doc.comment === "string" ? doc.comment : (ts.getTextOfJSDocComment(doc.comment) ?? ""),
      )
      .join(" ")
      .replace(/\s*\n\s*/g, " ")
      // `{@link Foo}` is an editor affordance; the compiler keeps it as literal text, so it
      // reached the rendered table as braces and an at-sign. Unwrapped to the name it points
      // at — the reference has no cross-linking to resolve it to, and printing the raw tag is
      // the one outcome that helps nobody. Found 2026-08-21, already shipping on TextField.type.
      .replace(/\{@link\s+([^}|\s]+)(?:\s*\|\s*([^}]+))?\}/g, (_, target: string, label?: string) =>
        (label ?? target).trim(),
      )
      .trim()
  );
}

/** The string literals in an `Omit`'s key argument — one name, or a union of them. */
function literalNames(node: ts.TypeNode): string[] {
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) return [node.literal.text];
  if (ts.isUnionTypeNode(node)) return node.types.flatMap(literalNames);
  return [];
}

/** Collapse whitespace in a rendered type so a multi-line union reads as one cell. */
const typeText = (node: ts.TypeNode | undefined): string =>
  node ? node.getText().replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ") : "unknown";

/**
 * Walk a type expression, collecting declared members and the native element it extends.
 *
 * Depth-capped, because a cycle in local aliases would otherwise hang the build — and a
 * generator that hangs is worse than one that reports less, since the first fails silently in
 * CI while the second fails loudly here.
 */
function collect(
  node: ts.TypeNode,
  file: ts.SourceFile,
  out: { props: ApiProp[]; element: string | null },
  depth = 0,
): void {
  if (depth > 4) return;

  if (ts.isIntersectionTypeNode(node)) {
    for (const member of node.types) collect(member, file, out, depth + 1);
    return;
  }

  if (ts.isParenthesizedTypeNode(node)) {
    collect(node.type, file, out, depth + 1);
    return;
  }

  if (ts.isTypeLiteralNode(node)) {
    for (const member of node.members) {
      if (!ts.isPropertySignature(member) || !member.name) continue;
      const name = ts.isIdentifier(member.name)
        ? member.name.text
        : ts.isStringLiteral(member.name)
          ? member.name.text
          : member.name.getText();
      // `ref` is React plumbing on every component and says nothing about the design.
      if (name === "ref") continue;
      out.props.push({
        name,
        type: typeText(member.type),
        optional: Boolean(member.questionToken),
        doc: docOf(member),
      });
    }
    return;
  }

  if (ts.isTypeReferenceNode(node)) {
    const name = node.typeName.getText();

    // `Omit<SidePaneProps, "width">` and the bare form.
    //
    // THE OMITTED KEYS ARE REALLY REMOVED, and the first spelling only claimed to be: it
    // collected the target and threw the key list away, so `ShellRail` — which is literally
    // `Omit<SidePaneProps, "width">` — documented a `width` prop it explicitly refuses. Found
    // 2026-08-21, hours after the generator shipped, by an agent reading the code against its
    // own banner. It survived because the other `Omit`s in the package remove keys the target
    // then re-declares (`className`, `style`), so the only visible case was the one nobody had
    // looked at. A law that reports a refusal as a feature is worse than no law.
    if (name === "Omit" || name === "Pick") {
      const [target, keys] = node.typeArguments ?? [];
      if (!target) return;
      const before = out.props.length;
      collect(target, file, out, depth + 1);
      if (name === "Omit" && keys) {
        const omitted = new Set(literalNames(keys));
        out.props = [
          ...out.props.slice(0, before),
          ...out.props.slice(before).filter((prop) => !omitted.has(prop.name)),
        ];
      }
      return;
    }
    const element = /^(React\.)?ComponentPropsWithoutRef$/.test(name)
      ? node.typeArguments?.[0]
      : undefined;
    if (element && ts.isLiteralTypeNode(element) && ts.isStringLiteral(element.literal)) {
      out.element ??= element.literal.text;
      return;
    }

    // A local alias in the same file — follow it, so a reader never has to know that
    // `SidePaneProps` was assembled from two internal pieces.
    const alias = file.statements.find(
      (statement): statement is ts.TypeAliasDeclaration =>
        ts.isTypeAliasDeclaration(statement) && statement.name.text === name,
    );
    if (alias) collect(alias.type, file, out, depth + 1);
  }
}

function extract(): Record<string, ApiEntry> {
  const api: Record<string, ApiEntry> = {};
  const files = new Map<string, ts.SourceFile>();

  for (const [typeName, file] of [...propsTypeLocations()].sort(([a], [b]) => a.localeCompare(b))) {
    if (!files.has(file)) files.set(file, sourceFile(file));
    const parsed = files.get(file)!;
    const alias = parsed.statements.find(
      (statement): statement is ts.TypeAliasDeclaration =>
        ts.isTypeAliasDeclaration(statement) && statement.name.text === typeName,
    );
    if (!alias) continue;
    const out: { props: ApiProp[]; element: string | null } = { props: [], element: null };
    collect(alias.type, parsed, out);
    // The component name, not the props type's: that is what a reader imports and what the
    // registry keys on.
    api[typeName.replace(/Props$/, "")] = {
      element: out.element,
      // Declaration order is authoring order, which groups related props but varies by file.
      // Alphabetical is the order a reader can search.
      props: out.props.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }
  return api;
}

const banner = `/**
 * GENERATED — do not edit. Source: packages/ui/src/**, via apps/docs/scripts/generate-api.ts.
 *
 * Regenerate with \`pnpm --filter docs run api\`. A law regenerates and compares, so a hand
 * edit fails CI for everyone rather than only the session that made it.
 *
 * Only the props the package DECLARES are here. Every component also takes its native
 * element's props; \`element\` names which one.
 */
export type ApiProp = { name: string; type: string; optional: boolean; doc: string };
export type ApiEntry = { element: string | null; props: ApiProp[] };

export const API: Record<string, ApiEntry> = `;

/** The artifact's exact text. Exported so the drift law compares VALUES rather than shelling
    out and reading an exit code — a subprocess that fails to start also exits non-zero, which
    is the "did not run is a way of not failing" shape this repo keeps meeting. */
export function generatedText(): string {
  return `${banner}${JSON.stringify(extract(), null, 2)};\n`;
}

/** CLI only. Importing this module (the laws do) must not write or exit. */
const invokedDirectly =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const text = generatedText();
  const count = Object.keys(extract()).length;
  if (process.argv.includes("--check")) {
    if (readFileSync(outPath, "utf8") !== text) {
      console.error(
        "api.generated.ts is out of date. Run `pnpm --filter docs run api` and commit the result.",
      );
      process.exit(1);
    }
    console.log(`api.generated.ts is current (${count} components).`);
  } else {
    writeFileSync(outPath, text);
    console.log(`Wrote api.generated.ts (${count} components).`);
  }
}
