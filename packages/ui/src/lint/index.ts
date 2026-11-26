/**
 * The linter, shipped with the package.
 *
 * IT BEGAN AS WHAT THE COMPILER PROVABLY CANNOT SEE (ENGINEERING §5). Every other refusal in
 * this system is held by a closed union and caught by `tsc`. Two are not: TSX exempts hyphenated
 * attribute names from excess-property checking, so a `data-` axis compiles whatever the props
 * type says; and `className` and `style` are `string` and `CSSProperties` by construction, so a
 * utility class and a raw colour are both perfectly well-typed. The first three rules close
 * those holes.
 *
 * IT IS NOW THE LINTER (Kushagra, 2026-11-26; LOG, same date; SETTLED "The linter"). The scope
 * is every settled rule that one file of code can show: composition, hand-written style and
 * missing pieces. What only a running app or a rendered page can show stays with the console
 * warnings and the screen check.
 *
 * Flat config, because that is what a consumer has. Two sets. `recommended` is an error only
 * when the code is always wrong and a warning where a fair exception exists. `strict` is the
 * same rules, all errors, for agents and new projects.
 */

import type { ESLint, Linter } from "eslint";

import { noDialogCancel, preferFieldRow, preferToolbar, preferToolbarTitle } from "./composition.ts";
import { requireAccessibleName, requireDialogTitle, requireFieldLabel } from "./missing.ts";
import { noEscapeAbuse } from "./no-escape-abuse.ts";
import { noRefusedAttribute } from "./no-refused-attribute.ts";
import { noRefusedProp } from "./no-refused-prop.ts";
import { requireDisableReason } from "./require-disable-reason.ts";

/** The namespace a consumer writes in front of a rule name. */
export const NAMESPACE = "kookie";

/** The plugin's rules, by the name a consumer writes after the namespace. */
export const rules = {
  "no-refused-attribute": noRefusedAttribute,
  "no-refused-prop": noRefusedProp,
  "no-escape-abuse": noEscapeAbuse,
  "require-disable-reason": requireDisableReason,
  "prefer-field-row": preferFieldRow,
  "no-dialog-cancel": noDialogCancel,
  "prefer-toolbar": preferToolbar,
  "prefer-toolbar-title": preferToolbarTitle,
  "require-accessible-name": requireAccessibleName,
  "require-field-label": requireFieldLabel,
  "require-dialog-title": requireDialogTitle,
} as const;

/** Severity per rule, in one place, so `recommended` cannot disagree with the argument above. */
const SEVERITY: Readonly<Record<keyof typeof rules, Linter.RuleSeverity>> = {
  "no-refused-attribute": "error",
  "no-refused-prop": "error",
  "no-escape-abuse": "warn",
  "require-disable-reason": "error",
  // Composition. A fair exception exists for each, so a person gets a warning.
  "prefer-field-row": "warn",
  "no-dialog-cancel": "warn",
  "prefer-toolbar": "warn",
  "prefer-toolbar-title": "warn",
  // Missing pieces. A control or a field with no name is always wrong. A panel can be named
  // in ways one file does not show, so its title is a warning.
  "require-accessible-name": "error",
  "require-field-label": "error",
  "require-dialog-title": "warn",
};

const plugin: ESLint.Plugin = {
  meta: { name: "@kushagradhawan/kookie-ui-react/eslint-plugin" },
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
const configFor = (set: "recommended" | "strict", rules: Linter.RulesRecord): Linter.Config[] => [
  {
    name: `kookie/${set}-js`,
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
    rules,
  },
  {
    name: `kookie/${set}-ts`,
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    // NO `languageOptions`, deliberately: see the paragraph above. Whatever parser the
    // consumer's TypeScript config supplies is the one that reads these files.
    plugins: { [NAMESPACE]: plugin },
    rules,
  },
];

/**
 * The default set. An error only when the code is always wrong, and a warning where a fair
 * exception exists. Spread it into a flat config: `...kookie.configs.recommended`.
 */
export const recommended: Linter.Config[] = configFor("recommended", RULES);

/** Every rule, as an error. Derived from `rules`, so the two sets cannot hold different rules. */
const STRICT_RULES: Linter.RulesRecord = Object.fromEntries(
  Object.keys(rules).map((rule) => [`${NAMESPACE}/${rule}`, "error" as const]),
);

/**
 * THE STRICT SET (Kushagra, 2026-11-26): the same rules, every one an error.
 *
 * `recommended` warns where a fair exception exists, because a person can weigh one. An agent
 * reads a warning as optional and leaves it. So an agent, or a new project with nothing to
 * migrate, runs `strict`: nothing passes until it is fixed or carries a written reason
 * (`require-disable-reason`). It is derived from `rules`, like `recommended`, so the two sets
 * cannot hold different rules.
 */
export const strict: Linter.Config[] = configFor("strict", STRICT_RULES);

plugin.configs = { recommended, strict };

export default plugin;
