/**
 * THE AGENT SURFACE: reading a piece of JSX and saying what this system refuses in it.
 *
 * It ships from the package because there are two callers and one answer. The stdio MCP
 * server (`@kookie-ui/mcp`) and the documentation site's in-browser tools both expose a
 * "check this snippet" tool, and before this module existed each had written its own scanner:
 * one checked refused props, refused attributes, utility classes and raw values; the other
 * checked unknown imports, unknown tags and illegal values. Two tools, one name, different
 * verdicts on the same code — which is the failure this system's first rule exists to prevent,
 * arriving in the tooling rather than in the components.
 *
 * The RULES are here. The FACTS are injected (`SnippetData`), because what a caller can see
 * differs: the server reads a snapshot built from the documentation registry, and the site
 * reads that registry live. Neither owns a rule.
 *
 * IT IS A SCANNER, NOT A COMPILER. It reads opening tags and their attributes; it resolves no
 * identifiers, so a spread hides whatever it holds and a prop whose value is a variable is
 * checked only where the value is a literal. A clean result means "nothing visible here is
 * refused", never "this compiles". `CheckResult` reports the spread count and the foreign tags
 * for exactly that reason: a caller can tell "nothing wrong" from "I could not see".
 */
export { checkUsage, type CheckResult, type Finding, type SnippetData } from "./snippet.ts";
