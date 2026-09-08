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
export { CONFORMANCE_CASES, type ConformanceCase } from "./conformance.ts";
export { TOOL_NAMES, WEB_TOOL_PREFIX, webToolName } from "./tool-names.ts";
export { refusalReaches, refusedPropsOf, type PropRefusal, type RegistryRefusal } from "./registry-refusals.ts";
/* The refusals the TYPE states, as data. Both surfaces need them and neither can read a source
   file at runtime — the browser cannot read one at all — so the sentences are values in
   `system/refused.ts` and the rule saying who gets them is `system/refusal-sets.ts`. Before
   this export the server scraped that file with a regex and the site had the facts nowhere,
   which is how one checker came to give two answers (§48, the 2026-09-07 audit). */
export {
  LAYOUT_SYMBOLS,
  REFUSAL_SETS,
  refusalSetsFor,
  typeRefusalsFor,
  type TypeRefusal,
} from "../system/refusal-sets.ts";

/* Which layout props resolve an index through which scale, derived from the Box prop table.
   Both agent surfaces need it and for the same two reasons: a layout prop arrives from the
   shared table rather than from a component, so the generated API does not repeat it; and a
   space-scaled prop's list closes its INDEXES while anything else passes through as raw CSS
   (`checkUsage`'s `scaleIndexed`). The server used to reach into `system/props.ts` at build
   time and the site had no way to reach it at all. */
export { layoutScales } from "../system/props.ts";
