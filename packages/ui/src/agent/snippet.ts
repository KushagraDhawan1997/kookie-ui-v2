/**
 * Reads a piece of JSX and reports what this system refuses in it.
 *
 * WHY THIS IS THE TOOL THAT EARNS THE SERVER. The other three answer questions a reader could
 * answer by opening a file. This one answers a question nothing in the repo answers today: is
 * the code I just wrote inside the system. The compiler says so for a consumer who has already
 * installed the package and run `tsc`; it says nothing to a model writing a snippet in a chat,
 * which is exactly the moment the wrong API gets written.
 *
 * IT IS A SCANNER, NOT A COMPILER, and the limits are worth stating rather than hiding. It
 * reads opening tags and their attributes. It does not resolve identifiers, so
 * `<Button {...props}>` hides whatever `props` holds, and a prop whose value is a variable is
 * checked only where the value is a literal. Everything it reports is read off text it can
 * see; nothing is inferred. A clean result means "nothing visible here is refused", never
 * "this compiles".
 *
 * EVERY SENTENCE IT PRINTS COMES FROM THE SYSTEM. The reason a prop is refused is the one
 * `refused.ts` prints or the one the documentation registry states, carried through the
 * snapshot verbatim. Nothing here writes a new explanation of an old rule.
 */
import { isOwnedProperty, kebab, normalizeProperty, propFor } from "../lint/owned-properties.ts";
import { isRawColor, isRawLength } from "../lint/raw-values.ts";
import { matchUtility } from "../lint/utility-classes.ts";
/**
 * What the checker has to be told, because it cannot look it up itself.
 *
 * The RULES are this package's and live here. The FACTS differ by caller: the stdio server
 * reads a snapshot built from the documentation registry, and the documentation site reads
 * that registry live in the same process. Injecting them is what lets one implementation
 * answer for both surfaces — before this, two files scanned JSX under the same tool name and
 * checked different things, so the same snippet got different verdicts depending on which
 * surface an agent happened to reach.
 */
export type SnippetData = {
  /** Is this tag a component this system exports? */
  isKookie: (tag: string) => boolean;
  /** What this symbol refuses, and the sentence that says what to write instead. */
  refusalsFor: (symbol: string) => ReadonlyArray<{ prop: string; why: string }>;
  /** The closed set a prop admits, or undefined where the prop is not a closed union. */
  legalValues: (symbol: string, prop: string) => string[] | undefined;
  /**
   * Does this prop resolve an INDEX through a scale, and pass anything else through as raw CSS?
   *
   * The space rows do, deliberately and on the record: `resolve.ts` says "the raw palette is
   * reachable via `gap=\"16px\"` or style, where opting out of the system is at least visible",
   * and `props.ts` documents `<Box position="absolute" inset="0">` as the ordinary spelling. A
   * closed list read as a closed set turned both of those into hard errors — reported on this
   * repo's own laws and on a block the site ships (2026-09-07, the audit). So the list closes
   * the INDEXES and nothing else: a bare number outside it is a dead index and still reports,
   * and a length, a keyword or a zero is the escape and is left alone.
   *
   * Optional, because a caller that cannot tell simply gets the stricter reading.
   */
  scaleIndexed?: (symbol: string, prop: string) => boolean;
  /** The `data-` axis names TSX waves through undeclared. */
  refusedAttributes: readonly string[];
  /** The one sentence about those, with `{{attribute}}` and `{{axis}}` to fill in. */
  refusedAttributeMessage: string;
};

export type Finding = {
  rule: "refused-prop" | "refused-attribute" | "illegal-value" | "utility-class" | "raw-value-in-style";
  severity: "error" | "warning" | "note";
  line: number;
  tag: string;
  prop?: string;
  /** What is wrong, and what to write instead. */
  message: string;
};

type Attribute = { name: string; value: string | undefined; expression: boolean; line: number };
type Element = { tag: string; line: number; attributes: Attribute[]; spreads: number };

/**
 * The opening tags in a source, with their attributes.
 *
 * Hand-written rather than parsed with a real parser, because the alternative is a runtime
 * dependency on a full TypeScript or Babel front end to read four things off an opening tag.
 * The scan tracks strings, template literals, comments and brace depth, which is what it takes
 * to find where an attribute value ends.
 */
export function scanElements(source: string): Element[] {
  const out: Element[] = [];
  const lineAt = lineFinder(source);

  for (let i = 0; i < source.length; i += 1) {
    if (source[i] !== "<") continue;
    // A TYPE ARGUMENT IS NOT A TAG (2026-09-07, the audit). `useState<Item>([])` and
    // `Map<string, Row>` both put a capitalised name straight after a `<`, and reading them as
    // elements reported `Item` and `Row` as components this system does not export — on
    // ordinary TypeScript, which is what a model writing against this library writes. A tag's
    // `<` never follows an identifier character: it follows whitespace, a brace, a paren, a
    // comma, another tag's `>`, or the start of the source.
    if (i > 0 && /[A-Za-z0-9_$]/.test(source[i - 1]!)) continue;
    const match = /^<([A-Z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)*)/.exec(source.slice(i));
    if (!match) continue;
    const tag = match[1]!;
    const attributes: Attribute[] = [];
    let spreads = 0;
    let cursor = i + match[0].length;

    // Attributes, until the `>` that closes this tag at brace depth zero.
    while (cursor < source.length) {
      cursor = skipTrivia(source, cursor);
      const here = source[cursor];
      if (here === undefined || here === ">") break;
      if (here === "/" && source[cursor + 1] === ">") break;
      if (here === "{") {
        // A spread, or a comment. Skipped, and a spread is COUNTED here rather than by a sweep
        // over the whole source: the sweep matched every object spread in the file — a
        // `{...rest}` in a props destructure, a `{...a, ...b}` in a plain object — so an
        // ordinary snippet was told props had been hidden from checking when none had
        // (2026-09-07, the audit). At this point we are inside an opening tag, which is the
        // only place a spread hides an attribute.
        if (/^\{\s*\.\.\./.test(source.slice(cursor))) spreads += 1;
        cursor = skipBraces(source, cursor);
        continue;
      }
      const name = /^[A-Za-z_$][A-Za-z0-9_$-]*/.exec(source.slice(cursor));
      if (!name) {
        cursor += 1;
        continue;
      }
      const nameAt = cursor;
      cursor += name[0].length;
      const after = skipTrivia(source, cursor);
      if (source[after] !== "=") {
        // A bare attribute is `true`, and nothing here checks a boolean's value.
        attributes.push({ name: name[0], value: undefined, expression: false, line: lineAt(nameAt) });
        cursor = after;
        continue;
      }
      cursor = skipTrivia(source, after + 1);
      const opener = source[cursor];
      if (opener === '"' || opener === "'") {
        const end = source.indexOf(opener, cursor + 1);
        if (end === -1) break;
        attributes.push({
          name: name[0],
          value: source.slice(cursor + 1, end),
          expression: false,
          line: lineAt(nameAt),
        });
        cursor = end + 1;
      } else if (opener === "{") {
        const end = skipBraces(source, cursor);
        attributes.push({
          name: name[0],
          value: source.slice(cursor + 1, end - 1),
          expression: true,
          line: lineAt(nameAt),
        });
        cursor = end;
      } else {
        cursor += 1;
      }
    }
    out.push({ tag, line: lineAt(i), attributes, spreads });
    i = cursor;
  }
  return out;
}

/**
 * Line numbers, in one pass over the source rather than one pass per attribute.
 *
 * The first spelling counted newlines from the start of the file for every name it read, which
 * is quadratic: measured, a snippet of a few hundred lines was fine and a large paste made the
 * stdio server unresponsive to every other call while it counted (2026-09-07, the audit). The
 * offsets are found once and searched.
 */
function lineFinder(source: string): (index: number) => number {
  const starts: number[] = [0];
  for (let i = 0; i < source.length; i += 1) if (source[i] === "\n") starts.push(i + 1);
  return (index) => {
    let low = 0;
    let high = starts.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (starts[mid]! <= index) low = mid;
      else high = mid - 1;
    }
    return low + 1;
  };
}

/** Past whitespace and both comment forms. */
function skipTrivia(source: string, at: number): number {
  let i = at;
  for (;;) {
    while (i < source.length && /\s/.test(source[i]!)) i += 1;
    if (source[i] === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i);
      i = end === -1 ? source.length : end + 1;
      continue;
    }
    if (source[i] === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i);
      i = end === -1 ? source.length : end + 2;
      continue;
    }
    return i;
  }
}

/** The index just past the `}` matching the `{` at `at`, counting strings as opaque. */
function skipBraces(source: string, at: number): number {
  let depth = 0;
  for (let i = at; i < source.length; i += 1) {
    const character = source[i]!;
    if (character === '"' || character === "'" || character === "`") {
      i = skipString(source, i);
      continue;
    }
    if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }
  return source.length;
}

/** The index of the closing quote of the string opening at `at`. */
function skipString(source: string, at: number): number {
  const quote = source[at];
  for (let i = at + 1; i < source.length; i += 1) {
    if (source[i] === "\\") {
      i += 1;
      continue;
    }
    if (source[i] === quote) return i;
  }
  return source.length - 1;
}

/**
 * The two rules whose subject is a VALUE rather than a prop, so no refusal row carries their
 * sentence. Both quote a non-negotiable from this repo's own CLAUDE.md, and the judgement
 * underneath each — is this class a utility, is this value raw, is this property one the
 * space scale owns — comes from the package's own eslint rules rather than from a second
 * opinion written here.
 */
const UTILITY_MESSAGE = (className: string, sentence: string): string =>
  `\`${className}\` is a utility class. This system ships none: ${sentence}.`;

/** The `{ key: "literal" }` pairs a style expression states outright. */
function styleEntries(expression: string): { key: string; value: string | number }[] {
  const out: { key: string; value: string | number }[] = [];
  for (const [, quoted, key, raw] of expression.matchAll(
    /(?:^|[{,])\s*(?:"([^"]+)"|([A-Za-z$_][\w$]*))\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|-?[\d.]+)/g,
  )) {
    const name = quoted ?? key;
    if (name === undefined || raw === undefined) continue;
    const literal = /^["']/.test(raw) ? raw.slice(1, -1) : Number(raw);
    out.push({ key: name, value: literal });
  }
  return out;
}

export type CheckResult = {
  findings: Finding[];
  /** Tags the scanner saw that this system does not export. Reported so a caller can tell
      "nothing wrong" from "I did not recognise anything you wrote". */
  foreign: string[];
  /** Elements carrying a spread, whose props this scanner cannot see. */
  spread: number;
};

/**
 * Read a piece of JSX and say what this system refuses in it.
 *
 * The facts come from the caller, so one implementation answers for both agent surfaces. It
 * scans opening tags and literal values: a clean result means nothing visible here breaks a
 * rule, never that the code compiles.
 */
export function checkUsage(source: string, data: SnippetData): CheckResult {
  const findings: Finding[] = [];
  const foreign = new Set<string>();
  let spread = 0;

  for (const element of scanElements(source)) {
    if (!data.isKookie(element.tag)) {
      foreign.add(element.tag);
      continue;
    }
    spread += element.spreads;
    const refused = new Map(data.refusalsFor(element.tag).map((row) => [row.prop, row]));

    for (const attribute of element.attributes) {
      const refusal = refused.get(attribute.name);
      if (refusal) {
        findings.push({
          rule: "refused-prop",
          severity: "error",
          line: attribute.line,
          tag: element.tag,
          prop: attribute.name,
          message: refusal.why,
        });
        continue;
      }

      // A `data-` axis, which TSX waves through undeclared: a hyphenated JSX attribute is
      // exempt from excess-property checking, so `data-tone="destructive"` compiles whatever
      // the props type says. The set is the package's, computed from the axis tables.
      if (data.refusedAttributes.includes(attribute.name)) {
        findings.push({
          rule: "refused-attribute",
          severity: "error",
          line: attribute.line,
          tag: element.tag,
          prop: attribute.name,
          message: data.refusedAttributeMessage.replaceAll("{{attribute}}", attribute.name)
            .replaceAll("{{axis}}", attribute.name.replace(/^data-/, "")),
        });
        continue;
      }

      if (attribute.name === "className" && attribute.value !== undefined) {
        for (const className of attribute.value.split(/\s+/).filter(Boolean)) {
          const match = matchUtility(className);
          if (!match) continue;
          findings.push({
            rule: "utility-class",
            severity: "warning",
            line: attribute.line,
            tag: element.tag,
            prop: "className",
            message: UTILITY_MESSAGE(match.className, match.answer.sentence),
          });
        }
        continue;
      }

      if (attribute.name === "style" && attribute.expression && attribute.value !== undefined) {
        for (const entry of styleEntries(attribute.value)) {
          const property = normalizeProperty(kebab(entry.key));
          const owned = isOwnedProperty(entry.key);
          if (owned && isRawLength(entry.value)) {
            const prop = propFor(property);
            findings.push({
              rule: "raw-value-in-style",
              severity: "warning",
              line: attribute.line,
              tag: element.tag,
              prop: "style",
              message:
                `\`${entry.key}\` is a distance the space scale already holds. Write ` +
                `${prop ? `the \`${prop}\` prop on a layout primitive` : "the prop that owns it"} ` +
                `rather than a length here — \`style\` is for the CSS this system has no prop for.`,
            });
            continue;
          }
          if (isRawColor(entry.value, property)) {
            findings.push({
              rule: "raw-value-in-style",
              severity: "warning",
              line: attribute.line,
              tag: element.tag,
              prop: "style",
              message:
                `\`${entry.key}: ${JSON.stringify(entry.value)}\` is a colour written out. Appearance is resolved ` +
                `output here: choose it with \`tone\` and \`emphasis\`, or reach a token — \`var(--tone-solid)\`.`,
            });
          }
        }
        continue;
      }

      // A closed union, checked only where the value is written out. An expression is a value
      // this scanner cannot see, and guessing at one would report the caller's variable name.
      if (attribute.value === undefined || attribute.expression) continue;
      const legal = data.legalValues(element.tag, attribute.name);
      // A scale-indexed prop's list closes its indexes, never its values: see `scaleIndexed`.
      // A bare number is an index and is checked against the list; everything else is the
      // documented raw-CSS escape and is not this checker's business.
      // An index is 1 upward: the scales start at 1 and `0` is a length, which is why
      // `<Box position="absolute" inset="0">` is the spelling `props.ts` documents.
      const isIndex = /^[1-9][0-9]*$/.test(attribute.value);
      const escapes =
        legal !== undefined && !isIndex && (data.scaleIndexed?.(element.tag, attribute.name) ?? false);
      if (legal && !legal.includes(attribute.value) && !escapes) {
        findings.push({
          rule: "illegal-value",
          severity: "error",
          line: attribute.line,
          tag: element.tag,
          prop: attribute.name,
          message: `\`${attribute.name}\` is a closed set on ${element.tag}. It takes ${legal
            .map((value) => `\`${value}\``)
            .join(", ")} — never \`${attribute.value}\`.`,
        });
      }
    }
  }

  return { findings, foreign: [...foreign].sort(), spread };
}
