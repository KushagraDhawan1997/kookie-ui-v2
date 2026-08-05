/**
 * The declaration format, owned (2026-08-06). `  --name: value;` — two-space indent, colon,
 * space, trailing semicolon — was hand-spelled at ~15 sites across generate.ts and color.ts
 * (including two byte-identical local `put`s), and the node laws regex the same shape back
 * out: an implicit contract between eight files' worth of call sites with no owner. The
 * numbers stay where they are — this is mechanism, not design (the recipes.css distinction).
 */

/** One custom-property declaration, at rule depth. Callers pass the name WITHOUT `--`. */
export const decl = (name: string, value: string): string => `  --${name}: ${value};`;

/** One nesting level for a block emitted inside an at-rule. Empty lines stay empty — an
    indented blank is trailing whitespace the committed artifact does not carry. */
export const indent = (lines: string[]): string[] =>
  lines.map((l) => (l === "" ? l : `  ${l}`));
