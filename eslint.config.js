import tseslint from "typescript-eslint";

// TODO(ENGINEERING §5): author and ship the custom rule `no-spacing-utilities-on-controls`
// when the first control lands. Package-boundary enforcement (deep-import bans) needs a
// real boundary rule (eslint-plugin-boundaries) — relative-depth patterns false-positive
// on legitimate nesting like src/components/button → src/system.
export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/.turbo/**"] },
  ...tseslint.configs.recommended,
);
