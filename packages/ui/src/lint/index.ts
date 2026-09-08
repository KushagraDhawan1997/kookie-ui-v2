/**
 * The ESLint plugin, shipped with the package (ENGINEERING §5's own TODO, which has sat in the
 * root config since before the first control landed).
 *
 * IT EXISTS FOR WHAT THE COMPILER PROVABLY CANNOT SEE. Every other refusal in this system is
 * held by a closed union and caught by `tsc`. Two are not: TSX exempts hyphenated attribute
 * names from excess-property checking, so a `data-` axis compiles whatever the props type
 * says; and `className` and `style` are `string` and `CSSProperties` by construction, so a
 * utility class and a raw colour are both perfectly well-typed. Those two holes are the whole
 * scope, and the plugin does not grow past them.
 *
 * Flat config, because that is what a consumer has. `recommended` sets the two rules at the
 * severities they were argued at: the attribute is an ERROR because it re-grows a deleted axis
 * on the DOM, and the escape is a WARNING because an escape is not a defect — only two shapes
 * of it are, and the call site is the one that knows which.
 */

import type { ESLint, Linter } from "eslint";

import { noEscapeAbuse } from "./no-escape-abuse.ts";
import { noRefusedAttribute } from "./no-refused-attribute.ts";
import { noRefusedProp } from "./no-refused-prop.ts";

/** The namespace a consumer writes in front of a rule name. */
export const NAMESPACE = "kookie";

/** The plugin's rules, by the name a consumer writes after the namespace. */
export const rules = {
  "no-refused-attribute": noRefusedAttribute,
  "no-refused-prop": noRefusedProp,
  "no-escape-abuse": noEscapeAbuse,
} as const;

/** Severity per rule, in one place, so `recommended` cannot disagree with the argument above. */
const SEVERITY: Readonly<Record<keyof typeof rules, Linter.RuleSeverity>> = {
  "no-refused-attribute": "error",
  "no-refused-prop": "error",
  "no-escape-abuse": "warn",
};

const plugin: ESLint.Plugin = {
  meta: { name: "@kookie-ui/react/eslint-plugin" },
  rules: rules as unknown as ESLint.Plugin["rules"],
};

/**
 * The shareable config. Derived from `rules` rather than listed beside it, so a rule added
 * above is enabled by the same edit — a plugin that ships a rule its own recommended config
 * forgets is a rule nobody runs, which is a way of not failing.
 */
/** Every rule at its severity, which is the half both config entries share. */
const RULES: Linter.RulesRecord = Object.fromEntries(
  (Object.keys(rules) as Array<keyof typeof rules>).map((rule) => [`${NAMESPACE}/${rule}`, SEVERITY[rule]]),
);

/**
 * The shareable config, in TWO entries, and the split is the fix for a shipped defect
 * (2026-09-07, the audit).
 *
 * The rules are derived from `rules` rather than listed beside it, so a rule added above is
 * enabled by the same edit — a plugin that ships a rule its own recommended config forgets is
 * a rule nobody runs, which is a way of not failing.
 *
 * A CONFIG MUST NOT CLAIM A FILE IT CANNOT PARSE. The first spelling was one entry over
 * one `files` entry over the two JSX extensions, turning on `ecmaFeatures.jsx` for ESLint's
 * default parser, with a
 * comment reasoning that "a TypeScript consumer's own parser is set in a later config object
 * and wins on order". True when there is one — and the install the documentation printed is
 * `export default [...kookie.configs.recommended]` and nothing else, which in a TypeScript
 * project made espree read every `.tsx` file and report `Parsing error: Unexpected token` on
 * each, swallowing every finding the plugin exists to make. Measured from a scratch consumer
 * against the built artifact. That is the same "a shipped config that lints nothing" failure
 * the `files` key was added to fix, one layer over: it now matches the file and dies on it.
 *
 * So the JS entry states the parser options for the files espree really can read — `.js`
 * included, which CRA and Next's pages router both use for JSX and which the one-entry
 * spelling silently excluded — and the TypeScript entry states plugins and rules ALONE,
 * bringing no parser opinion of its own. A TypeScript project already configures a parser and
 * this composes with it in either order; one that does not gets espree's parse error, which is
 * loud, and the consumer chapter shows the `typescript-eslint` entry beside this one. A plugin
 * cannot ship a parser, so what it owes is to say so rather than to look like it has.
 */
export const recommended: Linter.Config[] = [
  {
    name: "kookie/recommended-js",
    // IT STATES ITS OWN FILES, and that is not a courtesy. A flat config with no `files` key
    // matches nothing in ESLint 9: `export default [...kookie.configs.recommended]` then
    // reports "File ignored because no matching configuration was supplied" and exits ZERO, so
    // a consumer who enabled the plugin correctly is told everything is fine by a run that
    // linted no files. Measured against the built artifact from a scratch consumer before this
    // line existed. "Did not run" is a way of not failing, and this is that finding in a
    // plugin's own shipped config.
    files: ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs"],
    // Every rule here reads JSX attributes, so a config that cannot parse JSX is a config that
    // cannot work: ESLint's default parser reports `Parsing error: Unexpected token <` on the
    // first tag. This turns the flag on for the built-in parser, which is the parser these
    // extensions get.
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { [NAMESPACE]: plugin },
    rules: RULES,
  },
  {
    name: "kookie/recommended-ts",
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    // NO `languageOptions`, deliberately: see the paragraph above. Whatever parser the
    // consumer's TypeScript config supplies is the one that reads these files.
    plugins: { [NAMESPACE]: plugin },
    rules: RULES,
  },
];

plugin.configs = { recommended };

export default plugin;
