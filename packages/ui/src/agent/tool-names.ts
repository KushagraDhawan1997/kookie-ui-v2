/**
 * ONE NAME PER TOOL, WHEREVER IT IS OFFERED (2026-09-07, the audit).
 *
 * Two surfaces expose this system's tools — the stdio MCP server and the documentation site's
 * in-browser WebMCP registration — and both the chapter and DECISIONS §48 said they were "the
 * same four tools". Measured, all four differed: two only by a prefix, and two by their stem
 * (`check_usage` against `check_snippet`, `get_tokens` against `lookup_token`). Nothing
 * anywhere asserted otherwise, so an agent that had read the documentation asked for a tool
 * that was not there.
 *
 * THE STEM IS SHARED AND THE PREFIX IS NOT, and that difference is real rather than tolerated.
 * A stdio server's tools are already namespaced by the server a client configured it under. A
 * WebMCP page registers into a namespace shared with every other tool on the document, where a
 * bare `get_component` is a name any site could also claim. So the browser applies
 * `WEB_TOOL_PREFIX` and nothing else varies.
 */

/** The four tools, by stem. The MCP server registers these names verbatim. */
export const TOOL_NAMES = {
  list: "list_components",
  get: "get_component",
  check: "check_usage",
  tokens: "get_tokens",
} as const;

/** What a page adds, because a document's tool namespace is shared with every other script. */
export const WEB_TOOL_PREFIX = "kookie_";

/** The name a browser surface registers for a tool. */
export const webToolName = (tool: keyof typeof TOOL_NAMES): string =>
  `${WEB_TOOL_PREFIX}${TOOL_NAMES[tool]}`;
