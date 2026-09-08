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

export type ApiProp = { name: string; type: string; values?: string[]; optional: boolean; doc: string };
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
  const { program, checker } = packageProgram();

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

/**
 * Every prop the PLATFORM gives an element of this kind, resolved the way `tsc` resolves it.
 *
 * The honest half of "this table is not a subset of the type" (2026-09-07, the audit). A props
 * type resolves to hundreds of names and almost all of them are React's: a component that
 * extends `ComponentPropsWithoutRef<"button">` really does take `formAction` and
 * `onPointerEnter`, and the entry says so once with `element` rather than printing four hundred
 * rows. So a law comparing the checker's answer against the table has to subtract these, and it
 * has to subtract them by ASKING rather than by guessing — the first spelling inferred the
 * native surface from what sibling components printed, which is a heuristic that goes wrong in
 * both directions and reported 1,171 platform props as dropped.
 */
export function nativePropNames(element: string): Set<string> {
  const { program, checker } = packageProgram();
  const file = ts.createSourceFile(
    "native.ts",
    `import type * as React from "react";\nexport type Native = React.ComponentPropsWithoutRef<${JSON.stringify(element)}>;`,
    ts.ScriptTarget.Latest,
    true,
  );
  // Resolved inside the package's own program, so React's types are the ones the package
  // itself compiles against rather than whatever another install would supply.
  void program;
  const host = ts.createCompilerHost({});
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (name, ...rest) => (name === "native.ts" ? file : original(name, ...rest));
  const config = ts.readConfigFile(path.join(packageDir, "tsconfig.json"), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, packageDir);
  const small = ts.createProgram(["native.ts"], parsed.options, host);
  const smallChecker = small.getTypeChecker();
  const parsedFile = small.getSourceFile("native.ts");
  const alias = parsedFile?.statements.find(
    (statement): statement is ts.TypeAliasDeclaration =>
      ts.isTypeAliasDeclaration(statement) && statement.name.text === "Native",
  );
  if (!alias) return new Set();
  void checker;
  return new Set(
    smallChecker
      .getTypeAtLocation(alias.name)
      .getProperties()
      .map((symbol) => symbol.getName()),
  );
}

/**
 * The package, compiled once.
 *
 * Two readers need the CHECKER rather than the AST — `resolvedPropNames()` for the inherited
 * names, and the walk below for a prop's legal values — and each was building its own program
 * over the same 63 entry points. Caching it is not a speed decision: two programs are two
 * answers, and the day they disagreed the disagreement would be invisible.
 */
let compiled: { program: ts.Program; checker: ts.TypeChecker } | undefined;
function packageProgram(): { program: ts.Program; checker: ts.TypeChecker } {
  if (!compiled) {
    const config = ts.readConfigFile(path.join(packageDir, "tsconfig.json"), ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, packageDir);
    const program = ts.createProgram([indexPath], parsed.options);
    compiled = { program, checker: program.getTypeChecker() };
  }
  return compiled;
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

/** The string literals in an `Omit`'s or `Pick`'s key argument — one name, or a union of them. */
function literalNames(node: ts.TypeNode): string[] {
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) return [node.literal.text];
  if (ts.isUnionTypeNode(node)) return node.types.flatMap(literalNames);
  return [];
}

/**
 * A union of string literals, IN THE ORDER IT WAS WRITTEN.
 *
 * The checker knows every member and nothing about their order: union constituents are sorted
 * by internal type id, which is the order the literals were first created anywhere in the
 * program, so `Emphasis` came back as `medium | loud | quiet` because `medium` is a default
 * somebody wrote earlier. Every axis in this system is a LADDER — solid, thin, regular, thick
 * — and a reference page that prints its rungs shuffled is worse than one that printed the
 * alias, because the shuffled one looks like information.
 *
 * So the ORDER is read off the syntax, following aliases the way `collect` already does. Three
 * shapes carry it: an inline union, an `as const` array behind `(typeof X)[number]` (the
 * checker hands that back as a tuple, and a tuple is ordered), and `keyof typeof X`, where a
 * symbol table is in declaration order. Anything else — `TypeSize` is an `Exclude` over a
 * spread tuple — falls back to the checker's own list, which is why this returns the SET's
 * order rather than nothing.
 */
function orderedLiterals(
  node: ts.TypeNode,
  checker: ts.TypeChecker,
  depth = 0,
): string[] | undefined {
  if (depth > 6) return undefined;

  if (ts.isParenthesizedTypeNode(node)) return orderedLiterals(node.type, checker, depth + 1);

  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) return [node.literal.text];

  if (ts.isUnionTypeNode(node)) {
    const out: string[] = [];
    for (const member of node.types) {
      const part = orderedLiterals(member, checker, depth + 1);
      if (!part) return undefined;
      out.push(...part);
    }
    return out;
  }

  // `(typeof SIZES)[number]` and `(typeof themeAxes.radius)[number]`.
  if (ts.isIndexedAccessTypeNode(node)) {
    const object = checker.getTypeAtLocation(node.objectType);
    const objectFlags = (object as ts.ObjectType).objectFlags ?? 0;
    if (!(objectFlags & ts.ObjectFlags.Reference)) return undefined;
    const elements = checker.getTypeArguments(object as ts.TypeReference);
    if (!elements.length) return undefined;
    const out: string[] = [];
    for (const element of elements) {
      if (!element.isStringLiteral()) return undefined;
      out.push(element.value);
    }
    return out;
  }

  // `keyof typeof tones` — the properties of an object literal come back in the order the
  // file writes them, which for a tone table is the order the palette was designed in.
  if (ts.isTypeOperatorNode(node) && node.operator === ts.SyntaxKind.KeyOfKeyword) {
    const target = checker.getTypeAtLocation(node.type);
    const names = target.getProperties().map((symbol) => symbol.getName());
    return names.length ? names : undefined;
  }

  if (ts.isTypeReferenceNode(node)) {
    let symbol = checker.getSymbolAtLocation(node.typeName);
    // An imported alias (`Tone` is re-exported from the tone table) resolves to the import
    // itself; the declaration this walk needs is the one it points at.
    if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    const declaration = symbol?.declarations?.find(ts.isTypeAliasDeclaration);
    if (declaration) return orderedLiterals(declaration.type, checker, depth + 1);
  }

  return undefined;
}

/**
 * A prop's LEGAL VALUES, where the checker can name them all.
 *
 * The rendered type used to be the AST's own text, which for `size?: Size` is the word `Size`
 * and nothing else — so the one machine-readable document this system publishes named an
 * opaque alias 38 times and never stated a single value, in a system whose whole claim is that
 * its unions are closed. The alias is a fact about how the package is WRITTEN; a reader needs
 * the fact about what it ACCEPTS.
 *
 * The checker is what makes it possible, and only the checker: `Size` is declared as
 * `(typeof SIZES)[number]`, so the values live in an array in `system/axes.ts` and there is no
 * union to read off the syntax at all. Nothing is authored here — the emitted list IS the
 * package's own, resolved.
 *
 * MEMBERSHIP IS THE CHECKER'S AND ORDER IS THE SYNTAX'S, and the two are checked against each
 * other rather than trusted: if the ordered walk and the resolved union disagree about WHICH
 * values exist, the walk has gone stale against a type shape it does not know, and the
 * checker's answer ships. A shuffled ladder is a blemish; a wrong list is a lie.
 *
 * `undefined` for everything that is not a finite union of string literals, which is what
 * keeps `boolean`, `string`, `Responsive<Size>` and every handler out: a partial list would be
 * worse than the alias it replaced, because a reader would believe it.
 */
function legalValues(
  node: ts.TypeNode | undefined,
  checker: ts.TypeChecker | undefined,
): string[] | undefined {
  if (!node || !checker) return undefined;
  const type = checker.getTypeAtLocation(node);
  const members = type.isUnion() ? type.types : [type];
  const resolved: string[] = [];
  for (const member of members) {
    if (!member.isStringLiteral()) return undefined;
    resolved.push(member.value);
  }
  if (!resolved.length) return undefined;

  const ordered = orderedLiterals(node, checker);
  const agrees =
    ordered !== undefined &&
    ordered.length === resolved.length &&
    new Set(ordered).size === ordered.length &&
    ordered.every((value) => resolved.includes(value));
  return agrees ? ordered : resolved;
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
  checker?: ts.TypeChecker,
): void {
  // Depth-capped against a cycle in aliases. EIGHT, not four: following an alias across files
  // costs real levels — `ToolbarButtonProps` is `ComponentRefusals & ButtonProps`, and
  // `ButtonProps` is itself an intersection holding another alias — so the old cap ran out
  // three levels short and the entry came back empty (2026-09-07, the audit).
  if (depth > 8) return;

  if (ts.isIntersectionTypeNode(node)) {
    for (const member of node.types) collect(member, file, out, depth + 1, checker);
    return;
  }

  if (ts.isParenthesizedTypeNode(node)) {
    collect(node.type, file, out, depth + 1, checker);
    return;
  }

  /**
   * A UNION ARM IS STILL A DECLARATION (2026-09-07, the audit).
   *
   * Four exported props types are written `Base & (A | B)`, which is how this system spells a
   * guarantee the compiler enforces: `iconOnly: true` REQUIRES an accessible name. There was no
   * union arm here, so the parenthesis was unwrapped, the union matched nothing and the walk
   * returned having added none of it. `Button.iconOnly` and `Toggle.iconOnly` were in no table
   * anywhere, `Badge`'s bare-dot naming requirement was missing, and `ComposerInputProps` —
   * whose entire declared surface IS that union — produced an entry with zero props, under
   * which the page then printed "It declares no props of its own" while the type requires
   * `aria-label`. DECISIONS §48 names that guarantee as the reason the refusal codemod
   * intersects rather than `Omit`s: it survived in the types and was missing from every
   * document derived from them.
   *
   * Every arm is walked and the results merge. A prop that is not in every arm is CONDITIONAL,
   * which is a real difference from an optional one — `iconOnly` is required in its arm — so it
   * is marked optional here and its own doc comment carries the condition, which is where a
   * discriminated union states it in prose anyway.
   */
  if (ts.isUnionTypeNode(node)) {
    const seen = new Set(out.props.map((prop) => prop.name));
    const arms = node.types.map((arm) => {
      const armOut = { props: [] as ApiProp[], element: null as string | null };
      collect(arm, file, armOut, depth + 1, checker);
      return armOut;
    });
    const everywhere = (name: string): boolean =>
      arms.every((arm) => arm.props.some((prop) => prop.name === name));
    for (const arm of arms) {
      for (const prop of arm.props) {
        if (seen.has(prop.name)) continue;
        seen.add(prop.name);
        out.props.push(everywhere(prop.name) ? prop : { ...prop, optional: true });
      }
      out.element ??= arm.element;
    }
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
      const values = legalValues(member.type, checker);
      out.props.push({
        name,
        type: typeText(member.type),
        // Absent rather than empty where the checker cannot name every value, so a reader of
        // the artifact can tell "these are all of them" from "we did not ask".
        ...(values ? { values } : {}),
        optional: Boolean(member.questionToken),
        doc: docOf(member),
      });
    }
    return;
  }

  if (ts.isTypeReferenceNode(node)) {
    const name = node.typeName.getText();

    // A REFUSAL MIXIN IS NOT A PROP LIST. `system/refused.ts` states what a component does NOT
    // take, and every props type in the package intersects one — so following it would print
    // `variant` and the whole margin row as declared props on all 143 tables, which is the
    // reference asserting the exact opposite of the design. It resolved to nothing by accident
    // until now (the mixin is a mapped type and the walk has no mapped-type arm); said out
    // loud, it stays right when that accident stops holding.
    if (/Refusals$/.test(name)) return;

    // `Omit<SidePaneProps, "width">` and the bare form.
    //
    // THE OMITTED KEYS ARE REALLY REMOVED, and the first spelling only claimed to be: it
    // collected the target and threw the key list away, so `ShellRail` — which is literally
    // `Omit<SidePaneProps, "width">` — documented a `width` prop it explicitly refuses. Found
    // 2026-08-21, hours after the generator shipped, by an agent reading the code against its
    // own banner. It survived because the other `Omit`s in the package remove keys the target
    // then re-declares (`className`, `style`), so the only visible case was the one nobody had
    // looked at. A law that reports a refusal as a feature is worse than no law.
    // AND `Pick` KEEPS ONLY ITS KEYS — the other half of the same defect, left standing when
    // the `Omit` half was repaired (found 2026-08-26). `Pick` was admitted into this branch on
    // day one and then implemented as a no-op: the target was collected and the key list
    // thrown away, which is the operator INVERTED, and it stayed invisible because the only
    // `Pick<` in the package is an internal alias the walk never reaches. The first exported
    // `*Props` written as `Pick<SomeOwnProps, "size" | "tone">` — the ordinary way to publish
    // a narrowed part's API — would have shipped a table listing every prop of the target, and
    // nothing would have caught it: the drift law compares against the artifact this generator
    // wrote, and the agreement law asks whether the registry's axis names are IN the checker's
    // set, never whether the generated table is a SUBSET of it.
    if (name === "Omit" || name === "Pick") {
      const [target, keys] = node.typeArguments ?? [];
      if (!target) return;
      const before = out.props.length;
      const elementBefore = out.element;
      collect(target, file, out, depth + 1, checker);
      if (keys) {
        const named = new Set(literalNames(keys));
        const keep = (prop: ApiProp) =>
          name === "Omit" ? !named.has(prop.name) : named.has(prop.name);
        out.props = [...out.props.slice(0, before), ...out.props.slice(before).filter(keep)];
      }
      // A `Pick` states its keys exhaustively, so the native-element note a nested
      // `ComponentPropsWithoutRef` would have set does not survive it: `Pick<…<"button">,
      // "type">` takes `type`, not "every button prop". `Omit` is the opposite and keeps it.
      if (name === "Pick") out.element = elementBefore;
      return;
    }
    const element = /^(React\.)?ComponentPropsWithoutRef$/.test(name)
      ? node.typeArguments?.[0]
      : undefined;
    if (element && ts.isLiteralTypeNode(element) && ts.isStringLiteral(element.literal)) {
      out.element ??= element.literal.text;
      return;
    }

    // An alias — followed, so a reader never has to know that `SidePaneProps` was assembled
    // from two internal pieces. THE SAME FILE FIRST, then wherever the checker says the symbol
    // was declared: `ToolbarButtonProps = ComponentRefusals & ButtonProps` and
    // `CommandTriggerProps = ComponentRefusals & DialogTriggerProps` both name a type declared
    // in another file, and a same-file-only lookup silently found nothing and collected
    // nothing — so both entries shipped empty and the page asserted "It declares no props of
    // its own" about a part that takes every prop a Button does (2026-09-07, the audit).
    const local = file.statements.find(
      (statement): statement is ts.TypeAliasDeclaration =>
        ts.isTypeAliasDeclaration(statement) && statement.name.text === name,
    );
    if (local) {
      collect(local.type, file, out, depth + 1, checker);
      return;
    }
    const symbol = checker?.getSymbolAtLocation(node.typeName);
    const target = symbol?.flags && symbol.flags & ts.SymbolFlags.Alias ? checker?.getAliasedSymbol(symbol) : symbol;
    for (const declaration of target?.declarations ?? []) {
      if (!ts.isTypeAliasDeclaration(declaration)) continue;
      collect(declaration.type, declaration.getSourceFile(), out, depth + 1, checker);
      return;
    }
  }
}

/**
 * What one props-type expression resolves to, read out of source TEXT rather than off disk.
 *
 * Exported for the laws, and for one reason the laws cannot get any other way: a law about
 * how the walk handles a type OPERATOR has to be written against a spelling, and the spelling
 * may not be in the package yet — `Pick` was admitted into the walk on the day the generator
 * shipped and implemented as a no-op, and stayed that way because no exported `*Props` type
 * happened to use it. A law that can only read what the package already writes cannot fail
 * until the defect ships, which is the wrong way round.
 */
export function propsOfSource(
  source: string,
  typeName: string,
): { props: ApiProp[]; element: string | null } {
  const file = ts.createSourceFile("fixture.ts", source, ts.ScriptTarget.Latest, true);
  const alias = file.statements.find(
    (statement): statement is ts.TypeAliasDeclaration =>
      ts.isTypeAliasDeclaration(statement) && statement.name.text === typeName,
  );
  if (!alias) throw new Error(`propsOfSource(): no \`type ${typeName}\` in the fixture`);
  const out: { props: ApiProp[]; element: string | null } = { props: [], element: null };
  collect(alias.type, file, out);
  return out;
}

function extract(): Record<string, ApiEntry> {
  const api: Record<string, ApiEntry> = {};
  // THE PROGRAM'S OWN SOURCE FILES, not freshly parsed ones. A node has to be bound to the
  // checker for `legalValues` to resolve `Size` to its four strings; a standalone
  // `createSourceFile` produces the same syntax and an `any` for every type in it.
  const { program, checker } = packageProgram();

  for (const [typeName, file] of [...propsTypeLocations()].sort(([a], [b]) => a.localeCompare(b))) {
    const parsed = program.getSourceFile(file);
    if (!parsed) continue;
    const alias = parsed.statements.find(
      (statement): statement is ts.TypeAliasDeclaration =>
        ts.isTypeAliasDeclaration(statement) && statement.name.text === typeName,
    );
    if (!alias) continue;
    const out: { props: ApiProp[]; element: string | null } = { props: [], element: null };
    collect(alias.type, parsed, out, 0, checker);
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
export type ApiProp = { name: string; type: string; values?: string[]; optional: boolean; doc: string };
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
