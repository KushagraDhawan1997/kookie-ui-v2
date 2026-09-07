import * as Kookie from "@kookie-ui/react";
import { componentAxes, themeAxes } from "@kookie-ui/react";
import { checkUsage, type SnippetData } from "@kookie-ui/react/agent";
import { rules as lintRules } from "@kookie-ui/react/eslint-plugin";

import { CATALOG, type PropSchema } from "../builder/catalog";
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

const ENTRY_BY_KEY = new Map(
  ENTRIES.flatMap((entry) => [
    [entry.name.toLowerCase(), entry] as const,
    [entry.slug.toLowerCase(), entry] as const,
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
    `Call kookie_get_component with a name for the full page, refusals included.`,
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
    return `No component called "${requested}". Call kookie_list_components for the list.`;
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

/** The values a schema allows, or null where the schema is not a closed list. */
function allowed(schema: PropSchema | undefined): readonly string[] | null {
  if (!schema) return null;
  if (schema.kind === "axis") return componentAxes[schema.axis];
  if (schema.kind === "options") return schema.values;
  return null;
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
  // A refusal is stated on the ENTRY, and an entry covers its parts — so `<MenuItem>` reads
  // Menu's refusals. That is the registry's own shape and not a decision made here; where it
  // over-reaches (a part that really does take the prop) the fix belongs in the registry, not
  // in a second opinion written at this call site.
  refusalsFor: (symbol) =>
    (
      ENTRIES.find(
        (entry) => entry.name === symbol || entry.parts?.some((part) => part.part === symbol),
      )?.refusals ?? []
    ).map((refusal) => ({ prop: refusal.name, why: refusal.why })),
  legalValues: (symbol, prop) => {
    const values = allowed(CATALOG[symbol]?.props?.[prop]);
    return values ? [...values] : undefined;
  },
  refusedAttributes: [...new Set([...Object.keys(themeAxes), ...Object.keys(componentAxes)])].map(
    (axis) => `data-${axis}`,
  ),
  refusedAttributeMessage:
    (lintRules["no-refused-attribute"].meta?.messages?.refused as string | undefined) ??
    "`{{attribute}}` writes the `{{axis}}` axis onto the DOM past the type.",
};

export function checkSnippet(code: string): SnippetProblem[] {
  const problems: SnippetProblem[] = [];
  const local = importedElsewhere(code);

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
          message: `@kookie-ui/react does not export ${name}. Call kookie_list_components for what it does export.`,
        });
      }
    }
  }

  // 2. THE TAG, and 3. THE VALUE, and everything else, are the SHARED checker's — refused
  //    props, refused `data-` axes, illegal values, utility classes in `className` and raw
  //    values in `style`. This file's own copy of the value check was deleted when the checker
  //    was shared, and its own laws are what caught the overlap: one snippet reported
  //    `Button.tone` twice, once from each implementation.
  const { findings, foreign } = checkUsage(code, LIVE);
  for (const finding of findings) {
    problems.push({
      symbol: finding.prop ? `${finding.tag}.${finding.prop}` : finding.tag,
      message: finding.message,
    });
  }

  // A tag the package does not export AND the snippet does not import from anywhere else. The
  // shared checker reports every foreign tag; only this file knows what the snippet imported,
  // so the narrowing stays here. Without it the site's own examples raised eighteen findings
  // and all eighteen were the snippet's own icons and wrappers.
  for (const tag of foreign) {
    if (local.has(tag)) continue;
    problems.push({
      symbol: tag,
      message: `<${tag}> is not a KookieUI component. If it is your own, ignore this.`,
    });
  }

  return problems;
}

function formatSnippet(input: { code?: unknown }): string {
  const code = typeof input.code === "string" ? input.code : "";
  if (!code.trim()) return `No code given.`;
  const problems = checkSnippet(code);
  if (problems.length === 0) {
    return [
      `No problems found.`,
      ``,
      `Checked: imported names against the package's export list, JSX tag names against the`,
      `same list, and every literal prop value against the axis that prop belongs to. This is a`,
      `scan rather than a compilation, so it finds what is written and does not type-check.`,
    ].join("\n");
  }
  return [
    `${problems.length} problem${problems.length === 1 ? "" : "s"}.`,
    ``,
    ...problems.map((problem) => `- ${problem.symbol}: ${problem.message}`),
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
      name: "kookie_list_components",
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
      name: "kookie_get_component",
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
      name: "kookie_check_snippet",
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
      name: "kookie_lookup_token",
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
