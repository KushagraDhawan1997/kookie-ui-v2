import * as Kookie from "@kookie-ui/react";
import { componentAxes, themeAxes } from "@kookie-ui/react";
import {
  checkUsage,
  webToolName,
  layoutScales,
  refusalReaches,
  refusedPropsOf,
  typeRefusalsFor,
  type SnippetData,
} from "@kookie-ui/react/agent";
import { rules as lintRules } from "@kookie-ui/react/eslint-plugin";

import { API } from "./components/api.generated";
import { ENTRIES } from "./components/registry";
import { humanLabel } from "./label";

/**
 * WHAT THIS SITE CAN DO FOR AN AGENT LOOKING AT IT (§47).
 *
 * The tools, and only the tools. Nothing here touches the DOM, the network, React or the
 * filesystem: every one of them is a pure function over this site's own data, plus an `env`
 * the caller supplies for the two questions that need the page itself. That split is
 * `search.ts`/`search-index.ts` one file over, and it exists for the same reason — the half
 * that can be checked without a browser is the half worth checking, and this whole surface is
 * otherwise unreachable from a node suite.
 *
 * WHY THIS SURFACE EXISTS AT ALL, given the site already serves `llms.txt` and a markdown
 * twin for every page. Those answer an agent that has been handed a URL. This answers one that
 * is LOOKING AT the page — it is inside the app, so it reads the same objects the page renders
 * from and needs no snapshot, and two of the four tools cannot be built any other way: a
 * snippet is checked against the export list and the axis vocabulary as they are in the
 * package this build linked, and a token is resolved as the reader's own appearance, contrast
 * and density currently resolve it.
 *
 * ONE HOME PER FACT, and each one is named where it is used:
 *   - which components exist, and what they are   → `ENTRIES` (components/registry.ts)
 *   - what one component's page SAYS              → its markdown twin, `/components/x.md`
 *   - the props a component declares              → `API` (components/api.generated.ts)
 *   - which symbols the package exports           → the package namespace itself
 *   - which prop is which axis, and its values    → `CATALOG` + `componentAxes`
 *   - the tokens and their values                 → the stylesheet the page has loaded
 *
 * Nothing below authors a list. A tool that described the system in its own words would be a
 * second copy of the documentation, reaching an agent's context, drifting silently — which is
 * the failure `markdown.ts` refuses attribution lines for.
 */

/**
 * A tool, in the shape this file states rather than the shape any protocol wants.
 *
 * `execute` returns a STRING. The wire formats disagree — the current WebMCP draft wants any
 * serializable value, the shape MCP itself settled on is `{ content: [{ type, text }] }` — and
 * a proposal in flux is exactly the thing not to bake into the layer that knows the answers.
 * `webmcp-register.ts` wraps whichever the host asked for.
 */
export type AgentTool = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
  /** Every tool here reads. None of them navigates, submits or writes. */
  annotations: { readOnlyHint: true };
  execute: (input: Record<string, unknown>) => Promise<string>;
};

/**
 * The two questions a pure function cannot answer, handed in rather than reached for.
 *
 * Both are the page itself: one fetches this site's own markdown twin, the other reads the
 * custom properties the loaded stylesheet declares and what they currently resolve to. In the
 * browser `webmcp.tsx` supplies the real ones; in the suite they are stubs, which is what
 * makes every tool's own logic checkable without a DOM.
 */
export type ToolEnv = {
  /** A same-origin document, by path. Rejects on any status but 200. */
  fetchText: (path: string) => Promise<string>;
  /** Every custom property name the loaded stylesheets declare, `--` prefix included. */
  tokenNames: () => readonly string[];
  /** One property, as the page resolves it right now. Empty string when it resolves to nothing. */
  resolveToken: (name: string) => string;
};

/* ── The export list, at runtime ──────────────────────────────────────────────────────────
   The package's index IS the closed export list, so this reads it rather than restating it.
   Capitalised only: a component is what a snippet writes as a tag, and the hooks and the
   axis objects beside them are not things `<Foo>` can be. */
const EXPORTS: ReadonlySet<string> = new Set(
  Object.keys(Kookie).filter((name) => /^[A-Z]/.test(name)),
);

/* THE PARTS ARE KEYS TOO (2026-09-07, the audit). A part is documented on its parent's page,
   so `MenuItem` and `ToolbarButton` resolve to the Menu and Toolbar rows — which is what the
   stdio server's `resolveComponent` has always done, and what `LIVE.refusalsFor` twelve lines
   down already did. Without them 89 of the 143 exported symbols dead-ended here, so this
   file's own checker would report a finding against `<MenuItem>` and its sibling tool would
   then answer that no such component exists. */
const ENTRY_BY_KEY = new Map(
  ENTRIES.flatMap((entry) => [
    [entry.name.toLowerCase(), entry] as const,
    [entry.slug.toLowerCase(), entry] as const,
    ...(entry.parts ?? []).map((part) => [part.part.toLowerCase(), entry] as const),
  ]),
);

/** A component by either of the two names a reader has: the export, or the URL segment. */
export const entryFor = (name: string) => ENTRY_BY_KEY.get(name.trim().toLowerCase()) ?? null;

/**
 * The families, from the entries rather than from the type.
 *
 * The union in `registry.ts` is the type-level home and this is the value-level one, so the
 * list a tool offers cannot name a family no component is in — which is the direction that
 * would be wrong, since a family with no members is a menu item that returns nothing.
 */
export const FAMILIES = [...new Set(ENTRIES.map((entry) => entry.family))].sort();

/* ── Tool 1: the catalogue ────────────────────────────────────────────────────────────── */

/**
 * One line per component. `name — family — abstract`, which is what `ENTRIES` already carries
 * as the line a reader meets before they have decided to read anything.
 */
export function listComponents(input: { family?: string; query?: string }): string {
  const family = input.family?.trim().toLowerCase();
  const query = input.query?.trim().toLowerCase();
  const rows = ENTRIES.filter((entry) => {
    if (family && entry.family.toLowerCase() !== family) return false;
    if (!query) return true;
    // The refusals are searchable for the reason `search-index.ts` gives: "why can I not set a
    // margin" is a real question, and the answer to it is a refusal rather than a feature.
    const haystack =
      `${entry.name} ${entry.abstract} ${entry.refusals.map((r) => r.name).join(" ")}`.toLowerCase();
    return haystack.includes(query);
  });

  if (rows.length === 0) {
    return `No component matches. Families: ${FAMILIES.join(", ")}.`;
  }

  const lines = rows.map(
    (entry) => `${entry.name} — ${entry.family} — ${entry.abstract} — /components/${entry.slug}`,
  );
  return [
    `${rows.length} of ${ENTRIES.length} components.`,
    ``,
    ...lines,
    ``,
    `Call ${webToolName("get")} with a name for the full page, refusals included.`,
  ].join("\n");
}

/* ── Tool 2: one component ────────────────────────────────────────────────────────────── */

/**
 * A component's own page, as markdown.
 *
 * IT FETCHES THE TWIN rather than rebuilding the page out of the same parts. The twin is
 * already the single home for what a page says — `markdown.ts` builds it from this same
 * registry, the same generated API and the same example files — so composing a second
 * rendering here would be that file's contents written twice, in a place no law compares.
 *
 * The fallback below is deliberately POORER than the twin and says so. It exists because a
 * tool that throws when one fetch fails is worse than one that answers with what it holds in
 * memory, and everything it prints is data this module already imported.
 */
export async function getComponent(
  env: ToolEnv,
  input: { name?: unknown },
): Promise<string> {
  const requested = typeof input.name === "string" ? input.name : "";
  const entry = entryFor(requested);
  if (!entry) {
    return `No component called "${requested}". Call ${webToolName("list")} for the list.`;
  }
  try {
    return await env.fetchText(`/components/${entry.slug}.md`);
  } catch {
    return summarise(entry);
  }
}

/** What this module can say about a component without the network. Named so the caller of a
    degraded answer knows it is one. */
function summarise(entry: (typeof ENTRIES)[number]): string {
  const props = API[entry.name]?.props ?? [];
  const out = [
    `# ${humanLabel(entry.name)}`,
    ``,
    `> The page at /components/${entry.slug} could not be fetched. This is the registry's own`,
    `> record, which is less than that page carries.`,
    ``,
    entry.abstract,
    ``,
    ...entry.overview.flatMap((para) => [para, ``]),
  ];
  if (props.length > 0) {
    out.push(`## Props`, ``);
    for (const prop of props) {
      out.push(`- \`${prop.name}${prop.optional ? "?" : ""}: ${prop.type}\``);
    }
    out.push(``);
  }
  out.push(`## Refusals`, ``);
  for (const refusal of entry.refusals) out.push(`- **${refusal.name}** — ${refusal.why}`);
  return `${out.join("\n")}\n`;
}

/* ── Tool 3: check a snippet ──────────────────────────────────────────────────────────── */

export type SnippetProblem = { symbol: string; message: string };

/**
 * The package's own named imports. The tag and attribute scan is NOT here: it moved into the
 * shared checker when the two implementations were collapsed, and the pair of regexes that
 * read them stayed behind for a while with nothing calling them. `snippet.ts` states what a
 * scanner can and cannot see; this file no longer says it a second time.
 */
const NAMED_IMPORT = /import\s*\{([^}]*)\}\s*from\s*['"]@kookie-ui\/react['"]/g;
const ANY_IMPORT = /import\s+([^;]*?)\s+from\s+['"]([^'"]+)['"]/g;

/**
 * Every capitalised name the snippet binds from somewhere OTHER than the package.
 *
 * A tag whose name the snippet itself imports from another module is not a typo of a Kookie
 * component — the code has said where it comes from — so reporting it is noise in the one
 * place this scan promised to have none. Measured before it was written: run over the site's
 * own 65 example files the tag check raised 18 findings and every single one was a local
 * import, an icon or a block, so an agent reading the answer would have had to discard all of
 * them to reach a real one. A hedge in the message does not fix that; not saying it does.
 */
function importedElsewhere(code: string): ReadonlySet<string> {
  const names = new Set<string>();
  for (const match of code.matchAll(ANY_IMPORT)) {
    if (match[2] === "@kookie-ui/react") continue;
    // Braces become separators so one pass reads `X`, `{ A, B }` and `* as Ns` alike; the
    // LOCAL name is what a tag is written with, which is the tail of any `as`.
    for (const raw of (match[1] ?? "").replace(/[{}]/g, ",").split(",")) {
      const name = (raw.split(/\s+as\s+/).pop() ?? "").trim();
      if (/^[A-Z][A-Za-z0-9_]*$/.test(name)) names.add(name);
    }
  }
  return names;
}


/**
 * Everything this file can prove wrong about a snippet, with the home each check reads from.
 *
 * Exported for its law, and for the tool below: the law wants the findings, the tool wants
 * them formatted, and those are two different jobs.
 */
/**
 * THE FACTS THIS PAGE CAN SEE, in the shape the package's checker asks for.
 *
 * The RULES are `@kookie-ui/react/agent`'s and are shared with the stdio MCP server. Only the
 * facts differ: the server reads a snapshot built from this registry, and this file reads the
 * registry itself, in the same process the page renders from. Before the checker was shared,
 * these two surfaces each had their own scanner checking a DIFFERENT set of rules under the
 * same tool name, so one snippet got two verdicts depending on which one an agent reached.
 */
const LIVE: SnippetData = {
  isKookie: (tag) => EXPORTS.has(tag),
  // TWO SOURCES, ONE ANSWER, and the second one was missing for a day (2026-09-07, the audit).
  // `system/refused.ts` states what the COMPILER refuses — the Radix reflexes and the margin
  // row — and the registry states what a PERSON is told on the page. The server merged both
  // from the start; this read the registry alone, so `<Button asChild m="4" as="a"
  // highContrast />` came back "No problems found" here and with five findings there. One
  // snippet, two verdicts, which is the exact failure the shared checker exists to prevent
  // arriving one layer down. The sentences are values now, so both callers read one home.
  //
  // A registry refusal is stated on the ENTRY and an entry covers its parts, so `<MenuItem>`
  // reads Menu's refusals. That is the registry's own shape and not a decision made here;
  // where it over-reaches the fix belongs in the registry. The registry writes a refusal as a
  // SENTENCE, so the prop has to be read out of it — the package owns that rule and the server
  // uses the same one.
  refusalsFor: (symbol) => {
    const rows = [...typeRefusalsFor(symbol)];
    const seen = new Set(rows.map((row) => row.prop));
    const entry = ENTRIES.find(
      (item) => item.name === symbol || item.parts?.some((part) => part.part === symbol),
    );
    if (!entry) return rows;
    // Two narrowings, the same two the server applies. A refusal the registry scoped with
    // `on` reaches only the parts it names; and a part whose generated API DECLARES the prop
    // takes it, whatever a sentence written about a sibling says — `render` on an alert's
    // trigger is the alert's own example.
    const declared = new Set((API[symbol]?.props ?? []).map((row) => row.name));
    for (const row of refusedPropsOf(entry.refusals)) {
      if (seen.has(row.prop)) continue;
      if (!refusalReaches(row, symbol)) continue;
      if (symbol !== entry.name && declared.has(row.prop)) continue;
      seen.add(row.prop);
      rows.push(row);
    }
    return rows;
  },
  // THE GENERATED API, NOT THE BUILDER'S CATALOG (2026-09-07, the audit). `CATALOG` is a
  // deliberately narrowed vocabulary for a constrained editor — "every distance is a token
  // index picked from a closed list" — and reading it here made this tool report legal CSS as
  // an illegal value on 21 prop schemas, including code this site itself ships. What closes a
  // prop is its TYPE, which `api.generated.ts` prints and carries the values of, so this is
  // the same derivation the server does from the same generated table.
  legalValues: (symbol, prop) => {
    const declared = API[symbol]?.props.find((row) => row.name === prop);
    if (declared) return declared.values ? [...declared.values] : undefined;
    // A layout prop arrives from the shared table rather than from the component, so the API
    // does not repeat it. `props.ts` says which scale it resolves through, and the scale is
    // what closes the value.
    if (layoutScales[prop] !== "space") return undefined;
    if (/^m([xytrbl])?$/.test(prop)) return [...componentAxes["marginSpace"]];
    if (/^p([xytrbl])?$/.test(prop)) return [...componentAxes["paddingSpace"]];
    return [...componentAxes["space"]];
  },
  // A space row closes its INDEXES and passes everything else through as raw CSS, which
  // `resolve.ts` states as the visible way out of the scale. Reading the list as a closed set
  // made `gap="16px"` and `inset="0"` hard errors.
  scaleIndexed: (_symbol, prop) => layoutScales[prop] === "space",
  refusedAttributes: [...new Set([...Object.keys(themeAxes), ...Object.keys(componentAxes)])].map(
    (axis) => `data-${axis}`,
  ),
  refusedAttributeMessage:
    (lintRules["no-refused-attribute"].meta?.messages?.refused as string | undefined) ??
    "`{{attribute}}` writes the `{{axis}}` axis onto the DOM past the type.",
};

export function checkSnippet(code: string): SnippetProblem[] {
  const problems: SnippetProblem[] = [];

  // 1. IMPORTED SYMBOLS, against the package's own index. A name that is not exported is not a
  //    matter of opinion, and it is the single most common thing a model gets wrong about a
  //    library it has only read about.
  for (const match of code.matchAll(NAMED_IMPORT)) {
    for (const raw of (match[1] ?? "").split(",")) {
      // `Button as Btn` — the local alias is not the package's business, so only the head of
      // an `as` is checked.
      const name = (raw.split(/\s+as\s+/)[0] ?? "").trim();
      if (!name || !/^[A-Z]/.test(name)) continue;
      if (!EXPORTS.has(name)) {
        problems.push({
          symbol: name,
          message: `@kookie-ui/react does not export ${name}. Call ${webToolName("list")} for what it does export.`,
        });
      }
    }
  }

  // 2. THE TAG, and 3. THE VALUE, and everything else, are the SHARED checker's — refused
  //    props, refused `data-` axes, illegal values, utility classes in `className` and raw
  //    values in `style`. This file's own copy of the value check was deleted when the checker
  //    was shared, and its own laws are what caught the overlap: one snippet reported
  //    `Button.tone` twice, once from each implementation.
  const { findings } = checkUsage(code, LIVE);
  for (const finding of findings) {
    problems.push({
      symbol: finding.prop ? `${finding.tag}.${finding.prop}` : finding.tag,
      message: finding.message,
    });
  }

  return problems;
}

/**
 * What the scan could NOT see, which is a different kind of answer from what it found wrong.
 *
 * A foreign tag and a spread are both "I did not look here", and the server has always printed
 * them as trailing notes for that reason. This file promoted foreign tags into the numbered
 * problem list instead — so a snippet's own `<Icon>` read as a defect, and a name imported
 * from nowhere was reported twice: once as an unexported symbol, once again as a foreign tag,
 * with the second message ("if it is your own, ignore this") telling a reader to ignore the
 * first (2026-09-07, the audit). Notes now, and each name said once.
 */
export function snippetNotes(code: string): string[] {
  const local = importedElsewhere(code);
  const named = new Set(
    [...code.matchAll(NAMED_IMPORT)].flatMap((match) =>
      (match[1] ?? "").split(",").map((raw) => (raw.split(/\s+as\s+/)[0] ?? "").trim()),
    ),
  );
  const { foreign, spread } = checkUsage(code, LIVE);
  const notes: string[] = [];
  if (spread) {
    notes.push(
      `${spread} spread${spread === 1 ? "" : "s"} on a component. A spread hides the props it carries, so nothing in it was checked.`,
    );
  }
  // Imported from elsewhere in the snippet: the writer's own component, and not our business.
  // Imported from us and not exported: already reported above, by name, with the better
  // sentence.
  const unknown = foreign.filter((tag) => !local.has(tag) && !named.has(tag));
  if (unknown.length) notes.push(`Not KookieUI, so not checked: ${unknown.join(", ")}.`);
  return notes;
}

function formatSnippet(input: { code?: unknown }): string {
  const code = typeof input.code === "string" ? input.code : "";
  if (!code.trim()) return `No code given.`;
  const problems = checkSnippet(code);
  const notes = snippetNotes(code).map((note) => `Note: ${note}`);
  const tail = notes.length ? ["", ...notes] : [];
  if (problems.length === 0) {
    return [
      `No problems found.`,
      ``,
      // What was checked, enumerated so a clean answer cannot be read as "this compiles". The
      // list is the SHARED checker's, which is why the refusals are named: this text listed
      // three checks while the checker ran six, so a reader could not tell from the answer
      // whether refused props had been looked at (2026-09-07, the audit).
      `Checked: imported names and JSX tag names against the package's export list, every prop`,
      `against what its component refuses, every \`data-\` axis, every literal prop value against`,
      `the type that closes it, \`className\` for utility classes and \`style\` for raw values. This`,
      `is a scan rather than a compilation, so it finds what is written and does not type-check.`,
      ...tail,
    ].join("\n");
  }
  return [
    `${problems.length} problem${problems.length === 1 ? "" : "s"}.`,
    ``,
    ...problems.map((problem) => `- ${problem.symbol}: ${problem.message}`),
    ...tail,
  ].join("\n");
}

/* ── Tool 4: tokens, as this page resolves them ───────────────────────────────────────── */

/**
 * Token names matching a query, in the order they should be read.
 *
 * The names come from the stylesheet the page has loaded, which is the emitted `tokens.css` —
 * so this cannot list a token the build did not generate, and it cannot miss one it did. What
 * it CANNOT take from that stylesheet is an order: a custom property is declared wherever the
 * generator emitted it, and re-declared in every appearance and contrast scope, so declaration
 * order is an accident of emission.
 *
 * ORDERING HAS ONE HOME AND IT IS HERE. The first spelling sorted in the caller as well, which
 * made this function's own sort unreachable — an exact name was already first because the
 * input arrived alphabetical, so the ranking could be deleted with every law still green. The
 * caller hands over what the sheet declares, and this decides what to read first.
 */
export function matchTokens(names: readonly string[], query: string): string[] {
  const needle = query.trim().toLowerCase().replace(/^-+/, "");
  const exact = `--${needle}`;
  return names
    .filter((name) => name.toLowerCase().includes(needle))
    .sort(
      (a, b) =>
        // The name the reader typed, then everything else alphabetically: asking for
        // `accent-9` and being answered `--accent-9-contrast` first is the tool getting the
        // one unambiguous case wrong.
        Number(b.toLowerCase() === exact) - Number(a.toLowerCase() === exact) || a.localeCompare(b),
    );
}

function lookupToken(env: ToolEnv, input: { query?: unknown }): string {
  const query = typeof input.query === "string" ? input.query : "";
  if (!query.trim()) return `No query given. Try a family name, a role, or a full token name.`;
  const names = matchTokens(env.tokenNames(), query);
  if (names.length === 0) {
    return `No token matches "${query}".`;
  }
  const shown = names.slice(0, 40);
  const lines = shown.map((name) => {
    const value = env.resolveToken(name);
    return value ? `${name}: ${value}` : `${name}: (resolves to nothing in this scope)`;
  });
  return [
    `${names.length} token${names.length === 1 ? "" : "s"} match "${query}"${
      names.length > shown.length ? `, first ${shown.length} shown` : ``
    }.`,
    ``,
    `Values are what THIS page resolves right now — the reader's appearance, contrast and`,
    `density are already applied.`,
    ``,
    ...lines,
  ].join("\n");
}

/* ── The set ──────────────────────────────────────────────────────────────────────────── */

/**
 * The four tools, given a way to reach the page.
 *
 * A factory rather than a constant, because two of them need the page and one suite needs
 * neither — and a module-level constant that reached for `document` would be the thing that
 * makes this file impossible to check.
 *
 * The names are prefixed, which the WebMCP draft does not require and an agent's tool list
 * does: several pages may be offering tools at once, and `list_components` from an unnamed
 * site is a tool nobody can attribute.
 */
export function buildTools(env: ToolEnv): AgentTool[] {
  return [
    {
      name: webToolName("list"),
      description:
        "List the components KookieUI exports, with a one-line abstract and the page path for each. Filter by family or by a word, which also searches what each component refuses.",
      inputSchema: {
        type: "object",
        properties: {
          family: { type: "string", description: `One of: ${FAMILIES.join(", ")}.` },
          query: {
            type: "string",
            description: "A word to match against names, abstracts and refusals.",
          },
        },
      },
      annotations: { readOnlyHint: true },
      /* THE KEYS ARE OMITTED RATHER THAN SET TO `undefined`. `exactOptionalPropertyTypes` is
         on in this repo and it is right to be: "the caller did not filter" and "the caller
         filtered by nothing" are two different questions, and a spread is how you say the
         first one. */
      execute: async (input) =>
        listComponents({
          ...(typeof input.family === "string" ? { family: input.family } : {}),
          ...(typeof input.query === "string" ? { query: input.query } : {}),
        }),
    },
    {
      name: webToolName("get"),
      description:
        "Get one component's documentation page as markdown: what it is, how it composes, its props, and — the part that matters most — what it refuses and why.",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The exported name (Button) or the URL segment (button).",
          },
        },
        required: ["name"],
      },
      annotations: { readOnlyHint: true },
      execute: (input) => getComponent(env, input),
    },
    {
      name: webToolName("check"),
      description:
        "Check a snippet of JSX against the KookieUI vocabulary this site is built on: imported names and tag names against the package's export list, and every literal prop value against the closed axis that prop belongs to. A scan, not a compiler.",
      inputSchema: {
        type: "object",
        properties: { code: { type: "string", description: "The JSX to check." } },
        required: ["code"],
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => formatSnippet(input),
    },
    {
      name: webToolName("tokens"),
      description:
        "Look up KookieUI design tokens by name and read what they resolve to on this page right now, with the reader's own appearance, contrast and density applied.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Part of a token name, such as accent, radius, or --color-surface.",
          },
        },
        required: ["query"],
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => lookupToken(env, input),
    },
  ];
}
