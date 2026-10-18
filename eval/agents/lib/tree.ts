/**
 * A screen as a tree of JSX elements, read with the TypeScript AST.
 *
 * The rubric checks ask questions about the RENDERED screen ("is this control inside a Field",
 * "how many loud buttons can be on screen at once"), and an agent splits a screen into local
 * components. So the tree is built from the roots down, and a local component used as a tag is
 * expanded in place: its returned JSX replaces the tag, and the JSX it was handed (`children`,
 * or any prop holding JSX) lands where the component reads that prop.
 *
 * Two markers keep "what can be on screen at once" honest:
 * - `choice`: a ternary, `&&`, `||`, several `return`s, or `map[key]` over a JSX object. Only
 *   one option shows at a time.
 * - `repeat`: the body of a `.map()` callback. It shows more than once.
 *
 * It resolves only what it can see. A prop read through a spread, a value computed at runtime
 * or a component imported from outside the project is left alone. A check can therefore miss
 * something, and should never invent something.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type * as TS from "typescript";

import { requireFromUi } from "./paths.ts";

const ts = requireFromUi("typescript") as typeof TS;

export type Attr = {
  name: string;
  kind: "string" | "expr" | "bool" | "spread";
  /** The literal value, when the attribute is a string. */
  text?: string;
  expr?: TS.Expression;
  /** Every string literal inside the value. `emphasis={busy ? "loud" : "medium"}` gives both. */
  strings: string[];
  /** An object literal value read as key to string: `columns={{ initial: "1", md: "3" }}`. */
  object?: Record<string, string | undefined>;
};

export type El = {
  kind: "el";
  tag: string;
  attrs: Attr[];
  children: VNode[];
  /** JSX passed in attributes, such as `render={<Button />}` or `action={<Button />}`. */
  attrChildren: VNode[];
  /** The raw child expressions, for checks that need to read a condition. */
  childExprs: TS.Expression[];
  /** Static text inside the element: JSX text plus every string literal in its child expressions. */
  text: string;
  file: string;
  line: number;
  /** Unique per source element, so a component expanded twice still counts as one element. */
  key: string;
};
export type Choice = { kind: "choice"; options: VNode[][] };
export type Repeat = { kind: "repeat"; body: VNode[] };
export type VNode = El | Choice | Repeat;

export type SourceFile = { path: string; text: string };
export type Project = {
  files: SourceFile[];
  /** One entry per root: a top-level render call, or a component no other code renders. */
  roots: VNode[][];
};

type Fn = TS.FunctionDeclaration | TS.ArrowFunction | TS.FunctionExpression;
type FnInfo = { name: string; fn: Fn; sf: TS.SourceFile; file: string };

type Ctx = {
  sf: TS.SourceFile;
  file: string;
  /** Component names being expanded right now, outermost first, to stop recursion. */
  stack: string[];
  /** Prop name to the JSX it was handed. `children` included. */
  props: Map<string, VNode[]>;
  /** Prop name to a string literal it was handed, so `gap={gap}` resolves. */
  propStrings: Map<string, string>;
  /** Local `const` initializers in the function being read. */
  locals: Map<string, TS.Expression>;
  depth: number;
};

const MAX_DEPTH = 40;

export function parseProject(files: SourceFile[]): Project {
  const parsed = files.map((file) => ({
    file: file.path,
    sf: ts.createSourceFile(file.path, file.text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX),
  }));

  const fns = new Map<string, FnInfo[]>();
  const moduleLocals = new Map<string, Map<string, TS.Expression>>();
  for (const { file, sf } of parsed) {
    const locals = new Map<string, TS.Expression>();
    moduleLocals.set(file, locals);
    for (const statement of sf.statements) {
      collectTopLevel(statement, sf, file, fns, locals);
    }
  }

  const referenced = new Set<string>();
  for (const { sf } of parsed) {
    const visit = (node: TS.Node): void => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        referenced.add(node.tagName.getText(sf));
      }
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        referenced.add(node.expression.text);
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }

  const expanded = new Set<string>();
  const builder = new Builder(fns, moduleLocals, expanded);
  const roots: VNode[][] = [];

  // Top-level JSX outside any function: `createRoot(...).render(<App />)`.
  for (const { file, sf } of parsed) {
    const visit = (node: TS.Node): void => {
      if (isFunctionLike(node)) return;
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
        roots.push(builder.nodes(node as TS.Expression, builder.ctx(sf, file)));
        return;
      }
      ts.forEachChild(node, visit);
    };
    for (const statement of sf.statements) {
      if (ts.isVariableStatement(statement) || ts.isFunctionDeclaration(statement)) continue;
      visit(statement);
    }
  }

  // Components nothing renders: each is a root of its own.
  for (const [name, infos] of fns) {
    if (!isComponentName(name) || referenced.has(name)) continue;
    for (const info of infos) roots.push(builder.expand(info, builder.ctx(info.sf, info.file), new Map(), new Map()));
  }

  // Components something renders, but through a path the walk could not follow.
  for (const [name, infos] of fns) {
    if (!isComponentName(name) || expanded.has(name) || !referenced.has(name)) continue;
    for (const info of infos) roots.push(builder.expand(info, builder.ctx(info.sf, info.file), new Map(), new Map()));
  }

  return { files, roots };
}

export function loadProject(paths: string[], base: string): Project {
  return parseProject(
    paths.map((file) => ({ path: path.relative(base, file) || file, text: readFileSync(file, "utf8") })),
  );
}

function isFunctionLike(node: TS.Node): boolean {
  return ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isMethodDeclaration(node);
}

const isComponentName = (name: string): boolean => /^[A-Z]/.test(name);

function collectTopLevel(
  statement: TS.Statement,
  sf: TS.SourceFile,
  file: string,
  fns: Map<string, FnInfo[]>,
  locals: Map<string, TS.Expression>,
): void {
  const add = (name: string, fn: Fn): void => {
    const list = fns.get(name) ?? [];
    list.push({ name, fn, sf, file });
    fns.set(name, list);
  };
  if (ts.isFunctionDeclaration(statement) && statement.body) {
    add(statement.name?.text ?? "default", statement);
    return;
  }
  if (ts.isExportAssignment(statement)) {
    const value = unwrapCall(statement.expression);
    if (ts.isArrowFunction(value) || ts.isFunctionExpression(value)) add("default", value);
    return;
  }
  if (ts.isVariableStatement(statement)) {
    for (const decl of statement.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      const value = unwrapCall(decl.initializer);
      if (ts.isArrowFunction(value) || ts.isFunctionExpression(value)) add(decl.name.text, value);
      else locals.set(decl.name.text, decl.initializer);
    }
  }
}

/** `memo(function X() {})` and `forwardRef((p, r) => ...)` are the function inside. */
function unwrapCall(expr: TS.Expression): TS.Expression {
  let current = expr;
  while (ts.isCallExpression(current) && current.arguments.length > 0) {
    const first = current.arguments[0]!;
    if (ts.isArrowFunction(first) || ts.isFunctionExpression(first)) return first;
    if (ts.isCallExpression(first)) {
      current = first;
      continue;
    }
    break;
  }
  return current;
}

// Plain fields rather than parameter properties: `--experimental-strip-types` erases types and
// cannot transform a parameter property.
class Builder {
  private readonly fns: Map<string, FnInfo[]>;
  private readonly moduleLocals: Map<string, Map<string, TS.Expression>>;
  private readonly expanded: Set<string>;

  constructor(
    fns: Map<string, FnInfo[]>,
    moduleLocals: Map<string, Map<string, TS.Expression>>,
    expanded: Set<string>,
  ) {
    this.fns = fns;
    this.moduleLocals = moduleLocals;
    this.expanded = expanded;
  }

  ctx(sf: TS.SourceFile, file: string): Ctx {
    return { sf, file, stack: [], props: new Map(), propStrings: new Map(), locals: new Map(), depth: 0 };
  }

  private find(name: string, file: string): FnInfo | undefined {
    const list = this.fns.get(name);
    if (!list) return undefined;
    return list.find((info) => info.file === file) ?? list[0];
  }

  expand(info: FnInfo, outer: Ctx, props: Map<string, VNode[]>, propStrings: Map<string, string>): VNode[] {
    this.expanded.add(info.name);
    const ctx: Ctx = {
      sf: info.sf,
      file: info.file,
      stack: [...outer.stack, info.name],
      props,
      propStrings,
      locals: new Map(),
      depth: outer.depth + 1,
    };
    const body = info.fn.body;
    if (!body) return [];
    if (!ts.isBlock(body)) return this.nodes(body, ctx);

    const returns: TS.Expression[] = [];
    const visit = (node: TS.Node): void => {
      if (node !== body && isFunctionLike(node)) return;
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        ctx.locals.set(node.name.text, node.initializer);
      }
      if (ts.isReturnStatement(node) && node.expression) returns.push(node.expression);
      ts.forEachChild(node, visit);
    };
    visit(body);
    const options = returns.map((expr) => this.nodes(expr, ctx)).filter((nodes) => nodes.length > 0);
    if (options.length === 0) return [];
    if (options.length === 1) return options[0]!;
    return [{ kind: "choice", options }];
  }

  private local(name: string, ctx: Ctx): TS.Expression | undefined {
    return ctx.locals.get(name) ?? this.moduleLocals.get(ctx.file)?.get(name);
  }

  nodes(expr: TS.Expression, ctx: Ctx): VNode[] {
    if (ctx.depth > MAX_DEPTH) return [];
    if (ts.isParenthesizedExpression(expr) || ts.isAsExpression(expr) || ts.isNonNullExpression(expr)) {
      return this.nodes(expr.expression, ctx);
    }
    if (ts.isJsxElement(expr) || ts.isJsxSelfClosingElement(expr)) return this.element(expr, ctx);
    if (ts.isJsxFragment(expr)) return this.jsxChildren(expr.children, ctx).nodes;
    if (ts.isConditionalExpression(expr)) {
      return [{ kind: "choice", options: [this.nodes(expr.whenTrue, ctx), this.nodes(expr.whenFalse, ctx)] }];
    }
    if (ts.isBinaryExpression(expr)) {
      const op = expr.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
        return [{ kind: "choice", options: [this.nodes(expr.right, ctx), []] }];
      }
      if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) {
        return [{ kind: "choice", options: [this.nodes(expr.left, ctx), this.nodes(expr.right, ctx)] }];
      }
      return [];
    }
    if (ts.isArrayLiteralExpression(expr)) {
      return expr.elements.flatMap((element) => this.nodes(element as TS.Expression, ctx));
    }
    if (ts.isCallExpression(expr)) return this.call(expr, ctx);
    if (ts.isIdentifier(expr)) {
      const name = expr.text;
      const fromProps = ctx.props.get(name);
      if (fromProps) return fromProps;
      const init = this.local(name, ctx);
      if (init && !ctx.stack.includes(`local:${name}`)) {
        return this.nodes(init, { ...ctx, stack: [...ctx.stack, `local:${name}`] });
      }
      return [];
    }
    if (ts.isPropertyAccessExpression(expr)) {
      // `props.children`, `props.action`
      if (ts.isIdentifier(expr.expression) && /^props$/i.test(expr.expression.text)) {
        return ctx.props.get(expr.name.text) ?? [];
      }
      return [];
    }
    if (ts.isElementAccessExpression(expr) && ts.isIdentifier(expr.expression)) {
      // `pages[current]` over an object literal of JSX: only one shows.
      const init = this.local(expr.expression.text, ctx);
      if (init && ts.isObjectLiteralExpression(init)) {
        const options = init.properties
          .filter(ts.isPropertyAssignment)
          .map((prop) => this.nodes(prop.initializer, ctx))
          .filter((nodes) => nodes.length > 0);
        if (options.length > 0) return [{ kind: "choice", options }];
      }
      return [];
    }
    return [];
  }

  private call(expr: TS.CallExpression, ctx: Ctx): VNode[] {
    const callee = expr.expression;
    if (ts.isPropertyAccessExpression(callee) && /^(map|flatMap)$/.test(callee.name.text)) {
      const cb = expr.arguments[0];
      if (cb && (ts.isArrowFunction(cb) || ts.isFunctionExpression(cb))) {
        const body = this.callbackBody(cb, ctx);
        return body.length ? [{ kind: "repeat", body }] : [];
      }
      return [];
    }
    if (ts.isIdentifier(callee)) {
      const info = this.find(callee.text, ctx.file);
      if (info && !ctx.stack.includes(info.name)) return this.expand(info, ctx, new Map(), new Map());
    }
    return [];
  }

  private callbackBody(cb: TS.ArrowFunction | TS.FunctionExpression, ctx: Ctx): VNode[] {
    if (!ts.isBlock(cb.body)) return this.nodes(cb.body, ctx);
    const inner: Ctx = { ...ctx, locals: new Map(ctx.locals) };
    const returns: TS.Expression[] = [];
    const visit = (node: TS.Node): void => {
      if (node !== cb.body && isFunctionLike(node)) return;
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        inner.locals.set(node.name.text, node.initializer);
      }
      if (ts.isReturnStatement(node) && node.expression) returns.push(node.expression);
      ts.forEachChild(node, visit);
    };
    visit(cb.body);
    const options = returns.map((r) => this.nodes(r, inner)).filter((n) => n.length > 0);
    if (options.length <= 1) return options[0] ?? [];
    return [{ kind: "choice", options }];
  }

  private jsxChildren(children: TS.NodeArray<TS.JsxChild>, ctx: Ctx): { nodes: VNode[]; exprs: TS.Expression[]; text: string[] } {
    const nodes: VNode[] = [];
    const exprs: TS.Expression[] = [];
    const text: string[] = [];
    for (const child of children) {
      if (ts.isJsxText(child)) {
        const value = child.text.replace(/\s+/g, " ").trim();
        if (value) text.push(value);
        continue;
      }
      if (ts.isJsxExpression(child)) {
        if (!child.expression) continue;
        exprs.push(child.expression);
        text.push(...stringsIn(child.expression));
        nodes.push(...this.nodes(child.expression, ctx));
        continue;
      }
      nodes.push(...this.nodes(child as TS.Expression, ctx));
    }
    return { nodes, exprs, text };
  }

  private element(node: TS.JsxElement | TS.JsxSelfClosingElement, ctx: Ctx): VNode[] {
    const opening = ts.isJsxElement(node) ? node.openingElement : node;
    const tag = opening.tagName.getText(ctx.sf);
    const attrs: Attr[] = [];
    const attrChildren: VNode[] = [];
    const jsxProps = new Map<string, VNode[]>();
    const stringProps = new Map<string, string>();

    for (const prop of opening.attributes.properties) {
      if (ts.isJsxSpreadAttribute(prop)) {
        attrs.push({ name: "", kind: "spread", expr: prop.expression, strings: [] });
        continue;
      }
      const name = prop.name.getText(ctx.sf);
      const init = prop.initializer;
      if (!init) {
        attrs.push({ name, kind: "bool", strings: [] });
        continue;
      }
      if (ts.isStringLiteral(init)) {
        attrs.push({ name, kind: "string", text: init.text, strings: [init.text] });
        stringProps.set(name, init.text);
        continue;
      }
      if (ts.isJsxExpression(init) && init.expression) {
        const value = init.expression;
        if (ts.isIdentifier(value) && ctx.propStrings.has(value.text)) {
          const text = ctx.propStrings.get(value.text)!;
          attrs.push({ name, kind: "string", text, strings: [text] });
          stringProps.set(name, text);
          continue;
        }
        if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
          attrs.push({ name, kind: "string", text: value.text, strings: [value.text] });
          stringProps.set(name, value.text);
          continue;
        }
        const attr: Attr = { name, kind: "expr", expr: value, strings: stringsIn(value) };
        if (ts.isObjectLiteralExpression(value)) attr.object = objectStrings(value);
        attrs.push(attr);
        const held = this.nodes(value, ctx);
        if (held.length) {
          attrChildren.push(...held);
          jsxProps.set(name, held);
        }
      }
    }

    const content = ts.isJsxElement(node) ? this.jsxChildren(node.children, ctx) : { nodes: [], exprs: [], text: [] };

    // A local component: its rendered JSX replaces the tag.
    if (/^[A-Z]/.test(tag) && !tag.includes(".")) {
      const info = this.find(tag, ctx.file);
      if (info && !ctx.stack.includes(info.name)) {
        jsxProps.set("children", content.nodes);
        return this.expand(info, ctx, jsxProps, stringProps);
      }
    }

    const start = node.getStart(ctx.sf);
    return [
      {
        kind: "el",
        tag,
        attrs,
        children: content.nodes,
        attrChildren,
        childExprs: content.exprs,
        text: content.text.join(" ").trim(),
        file: ctx.file,
        line: ctx.sf.getLineAndCharacterOfPosition(start).line + 1,
        key: `${ctx.file}:${start}`,
      },
    ];
  }
}

/** Every string literal inside an expression, JSX excluded. */
export function stringsIn(expr: TS.Node): string[] {
  const out: string[] = [];
  const visit = (node: TS.Node): void => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) return;
    if (isFunctionLike(node)) return;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) out.push(node.text);
    ts.forEachChild(node, visit);
  };
  visit(expr);
  return out;
}

function objectStrings(obj: TS.ObjectLiteralExpression): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const key = ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) ? prop.name.text : prop.name.getText();
    const value = prop.initializer;
    out[key] = ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value) ? value.text : undefined;
  }
  return out;
}

/** Identifiers read inside an expression, for "does the label depend on the busy flag". */
export function identifiersIn(expr: TS.Node): Set<string> {
  const out = new Set<string>();
  const visit = (node: TS.Node): void => {
    if (ts.isIdentifier(node)) out.add(node.text);
    ts.forEachChild(node, visit);
  };
  visit(expr);
  return out;
}

/** Source text with whitespace, parentheses and one leading `!` removed, for comparing conditions. */
export function normalizeCondition(text: string): string {
  return text.replace(/\s+/g, "").replace(/^\(+|\)+$/g, "").replace(/^!+/, "");
}

/** The conditions an expression branches on: ternary tests and the left side of `&&` / `||`. */
export function conditionsIn(expr: TS.Node): string[] {
  const out: string[] = [];
  const visit = (node: TS.Node): void => {
    if (ts.isConditionalExpression(node)) out.push(normalizeCondition(node.condition.getText()));
    if (ts.isBinaryExpression(node)) {
      const op = node.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken || op === ts.SyntaxKind.BarBarToken) {
        out.push(normalizeCondition(node.left.getText()));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(expr);
  return out;
}

// ---------------------------------------------------------------- walking

export type Visit = (el: El, ancestors: El[]) => void;

/** Every element, with its ancestors. JSX held in attributes counts as a child of its holder. */
export function walk(nodes: VNode[], visit: Visit, ancestors: El[] = []): void {
  for (const node of nodes) {
    if (node.kind === "el") {
      visit(node, ancestors);
      const next = [...ancestors, node];
      walk(node.children, visit, next);
      walk(node.attrChildren, visit, next);
    } else if (node.kind === "choice") {
      for (const option of node.options) walk(option, visit, ancestors);
    } else {
      walk(node.body, visit, ancestors);
    }
  }
}

export function allElements(project: Project): { el: El; ancestors: El[] }[] {
  const out: { el: El; ancestors: El[] }[] = [];
  for (const root of project.roots) walk(root, (el, ancestors) => out.push({ el, ancestors }));
  return out;
}

/** Elements of these tags, each source element once. */
export function elementsOf(project: Project, ...tags: string[]): El[] {
  const seen = new Set<string>();
  const out: El[] = [];
  for (const { el } of allElements(project)) {
    if (!tags.includes(el.tag) || seen.has(el.key)) continue;
    seen.add(el.key);
    out.push(el);
  }
  return out;
}

/** The elements directly under an element, looking through `choice`, `repeat` and fragments. */
export function directElements(nodes: VNode[]): El[] {
  const out: El[] = [];
  for (const node of nodes) {
    if (node.kind === "el") out.push(node);
    else if (node.kind === "choice") for (const option of node.options) out.push(...directElements(option));
    else out.push(...directElements(node.body));
  }
  return out;
}

/** Every element under an element, children and attribute JSX both. */
export function descendants(el: El): El[] {
  const out: El[] = [];
  walk([...el.children, ...el.attrChildren], (child) => out.push(child));
  return out;
}

export const attr = (el: El, name: string): Attr | undefined => el.attrs.find((a) => a.name === name);
export const has = (el: El, name: string): boolean => el.attrs.some((a) => a.name === name);

/** True when the attribute is present and not the literal `false`. */
export function isOn(el: El, name: string): boolean {
  const a = attr(el, name);
  if (!a) return false;
  if (a.kind === "expr" && a.expr && a.expr.kind === ts.SyntaxKind.FalseKeyword) return false;
  return true;
}

export const where = (el: El): string => `${el.file}:${el.line} <${el.tag}>`;
