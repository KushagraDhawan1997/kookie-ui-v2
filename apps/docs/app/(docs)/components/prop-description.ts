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
