/**
 * An identifier, written the way a person reads it (2026-08-31, Kushagra: "calling it
 * AvatarGroup instead of Avatar Group, this is an example, every name is to be corrected. And
 * that size is not Size, backdrop is not Backdrop").
 *
 * DERIVED, NEVER A SECOND FIELD. `registry.name` is the EXPORTED name — the key the coverage
 * law matches on and the key the generated API table is filed under — so it cannot become
 * "Avatar Group" without breaking both. A `displayName` beside it would be a second home for
 * one fact, and the two would part company the first time a component was renamed. The rule is
 * mechanical, so it is a function.
 *
 * ONE FUNCTION FOR BOTH KINDS OF NAME. A component is `PascalCase` and a prop is `camelCase`,
 * and the difference is only whether the first word is already capitalized — so the split is
 * the same and the capitalization is applied once, at the front.
 */
export const humanLabel = (identifier: string): string =>
  identifier
    // The boundary is lowercase-or-digit followed by uppercase: `AvatarGroup` → `Avatar Group`,
    // `lineNumbers` → `line Numbers`, `Kbd` and `size` untouched.
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
