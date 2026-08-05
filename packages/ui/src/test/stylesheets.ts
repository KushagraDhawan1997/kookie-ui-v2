/**
 * The stylesheet-law infrastructure — what a node law needs to read a shipped sheet, shared
 * once (2026-08-06). Three lessons had been learned per-file and never promoted:
 *
 * - The directory walk (audit D14: laws WALK, so a new component cannot ship unaudited)
 *   existed as two byte-identical private copies in one law file and nowhere else.
 * - Comment stripping ("a law a comment can satisfy is not a law" — learned 2026-08-03,
 *   learned again 2026-08-05) had one seam and seven dead per-site re-strips.
 * - The loud parser existed only in tokens.test.ts: its `block()` throws on a missing
 *   selector because most laws assert ABSENCE, and `expect("").not.toContain(x)` passes
 *   trivially — while ~20 `slice(indexOf(...))` sites in the other law files had exactly
 *   that hole. `indexOf` returns -1, `slice(-1)` yields one character, and every negative
 *   assertion goes green while checking nothing. Here, the safe idiom is the only idiom:
 *   `block()` and `from()` throw, so a renamed selector fails the law instead of blinding it.
 *
 * Paths are relative to `src/`, so a law names a sheet the same way from any directory.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const src = join(dirname(fileURLToPath(import.meta.url)), "..");

/** One file, verbatim. For the generated sheets, where literals are supposed to bottom out
    and the prose is emitted, not argued in. */
export const raw = (path: string): string => readFileSync(join(src, path), "utf8");

/** CODE only — comments replaced by a space. Every law asks what a sheet DOES, and the answer
    is never in its prose; these are heavily commented files whose comments name the very
    things the laws forbid. */
export const stripped = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, " ");

/** A hand-authored stylesheet's code: read + strip, the default way a law takes a sheet. */
export const sheet = (path: string): string => stripped(raw(path));

/** The generated sheets, exempt from the hand-authored walks: they are where palette
    references and literals legitimately bottom out. */
export const GENERATED = ["tokens.css", "layout.css"];

/** Every hand-authored stylesheet the package ships, walked — never listed. Returns
    src-relative paths. `dir` narrows the walk (e.g. "components"). */
export function allStylesheets(dir = "."): string[] {
  return readdirSync(join(src, dir), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? allStylesheets(join(dir, entry.name))
      : entry.name.endsWith(".css") && !GENERATED.includes(entry.name)
        ? [join(dir, entry.name)]
        : [],
  );
}

/** The declaration body of the first rule at `selector` — and LOUD when the selector is
    missing, which is the whole point (see the header). `selector` may be a prefix of the
    full selector; the body runs from its `{` to the first `}`. */
export function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`block(): selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close);
}

/** The sheet from `marker` onward — for laws scoped to everything after an @media or
    @supports gate. Loud on a missing marker, for the same reason block() is. */
export function from(css: string, marker: string): string {
  const start = css.indexOf(marker);
  if (start === -1) throw new Error(`from(): marker not found: ${marker}`);
  return css.slice(start);
}
