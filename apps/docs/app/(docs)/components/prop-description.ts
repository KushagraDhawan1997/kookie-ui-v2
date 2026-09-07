import type { ApiProp } from "./api.generated";

/**
 * What a prop's description cell says.
 *
 * `className` and `style` mean the same thing on every component, so the sentence that says
 * so has ONE home and this is it — not 58 JSDoc comments that would each have to be kept in
 * step. The coverage law exempts the two names for exactly that reason, and the exemption was
 * right; what was wrong is that the exemption rendered an EMPTY CELL, so a reader scanning the
 * table learned nothing and had nothing pointing them at the section that would have told
 * them (found 2026-08-21, by eye, on a table that had shipped that way from the start).
 *
 * A component still writes a JSDoc where the escape lands somewhere a reader would guess
 * wrong — a popup rather than its positioner, a panel rather than its scrim. That is a
 * different fact from the universal one, so it has its own home, and it is APPENDED here
 * rather than replacing the sentence it qualifies.
 */
export function propDescription(prop: ApiProp): string {
  const universal =
    prop.name === "className"
      ? "Your classes, appended to the ones this component resolves rather than replacing them."
      : prop.name === "style"
        ? "Inline styles, merged last, so your value wins over anything the component resolved."
        : "";
  if (!universal) return prop.doc;
  return prop.doc ? `${universal} ${prop.doc.replace(/^[^.]*\.\s*/, "")}` : universal;
}

/**
 * A prop's FIRST SENTENCE — what a table cell says (2026-09-04, Kushagra: "the 'What it does'
 * is too verbose isn't it").
 *
 * It is, and the cause is one string with two readers. A JSDoc is the editor hover, where four
 * sentences about why an inline array re-runs the filter are exactly what a developer wants;
 * a table is a scanning surface, where they are a wall. Measured across the package's 442
 * documented props: 27 words median, 147 over forty, and `Button.done` at 260 words and
 * fourteen sentences inside one cell.
 *
 * So the cell takes the abstract and the hover keeps the discussion — which is the same split
 * the page already makes about itself one level up, and Apple's: a symbol list gives one line,
 * the symbol's own page gives the rest.
 *
 * TWO THINGS THE SPLIT MUST NOT DO. A code span is not prose, so a period inside backticks —
 * `DialogProps["defaultOpen"]`, a `§30.` citation — is not a sentence end; the scan tracks
 * backticks and ignores everything between them. And a sentence ends before a CAPITAL or a
 * backtick, so "e.g. a row" and "v1. the" do not split a sentence in half.
 */
export function propSummary(doc: string): string {
  let inCode = false;
  for (let i = 0; i < doc.length; i++) {
    // `charAt` rather than an index: under `noUncheckedIndexedAccess` the index is
    // `string | undefined`, and the undefined arm here would be a character that does not exist.
    const ch = doc.charAt(i);
    if (ch === "`") inCode = !inCode;
    if (inCode) continue;
    if (!".!?".includes(ch)) continue;
    const rest = doc.slice(i + 1);
    const match = /^\s+(?=[A-Z`])/.exec(rest);
    if (match) return doc.slice(0, i + 1);
  }
  return doc;
}

/**
 * What a prop's TYPE cell says.
 *
 * The legal values where the package can name them all, and the alias where it cannot
 * (2026-09-07). `size?: Size` used to render as the word `Size` — 38 times across the
 * reference, `Tone` 13 more — so the one machine-readable document this system publishes
 * never stated a single legal value, in a system whose whole claim is that its unions are
 * closed. A reader had to leave the page to learn that there are four sizes.
 *
 * ONE HOME for both readers, next to the description's, because the page's table and the
 * markdown twin's table are the same table twice and the twin exists to be identical.
 *
 * The alias survives wherever `values` is absent, which is every type that is not a finite
 * union of string literals: `RenderElement`, `React.ReactNode`, `Responsive<Size>`. Naming
 * `boolean` as `"true" | "false"` would be a worse sentence than the word `boolean`.
 */
export const propType = (prop: ApiProp): string =>
  prop.values ? prop.values.map((value) => `"${value}"`).join(" | ") : prop.type;
