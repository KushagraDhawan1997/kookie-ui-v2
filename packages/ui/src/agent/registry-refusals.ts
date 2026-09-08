/**
 * Reading prop names out of a refusal written for a person (2026-09-07).
 *
 * The documentation registry states refusals in prose, because a reader meets a sentence and
 * not a symbol: "A horizontal orientation", "`tone` and `emphasis`". A checker needs the
 * symbol. This is the one rule that turns the first into the second, and it lives here because
 * BOTH agent surfaces need it — the stdio server bakes it into its snapshot at build time, and
 * the documentation site runs it against the live registry in the browser.
 *
 * It had two homes for an afternoon and the second one was silently dead: the site's adapter
 * used the refusal's whole prose name AS the prop, so `refused.get("className")` was matched
 * against "A horizontal orientation" and no registry refusal ever fired. The checker was
 * shared and the FACTS feeding it were not, which is the same defect one layer down.
 *
 * ONLY BACKTICKED IDENTIFIERS ARE TAKEN, because those are the ones the registry has itself
 * spelled as code. A refusal naming no prop yields nothing and is left to the component page,
 * where the reader meets the whole sentence. The refusal's own words travel with the prop, so
 * nothing here writes a new reason for an old rule.
 */
export type RegistryRefusal = { name: string; why: string; on?: readonly string[] };
/** `on`, when present, names the only parts this refusal applies to. */
export type PropRefusal = { prop: string; why: string; on?: readonly string[] };

/** Does a refusal reach this symbol? Open refusals reach every part; scoped ones only theirs. */
export const refusalReaches = (row: { on?: readonly string[] }, symbol: string): boolean =>
  !row.on || row.on.includes(symbol);

/** The prop names a registry refusal is about, each carrying the refusal's own words. */
export function refusedPropsOf(refusals: readonly RegistryRefusal[]): PropRefusal[] {
  const out: PropRefusal[] = [];
  for (const refusal of refusals) {
    for (const [, code] of refusal.name.matchAll(/`([^`]+)`/g)) {
      // A prop, not a component or an element: lower camel, no spaces.
      if (!code || !/^[a-z][A-Za-z0-9]*$/.test(code)) continue;
      if (out.some((row) => row.prop === code)) continue;
      out.push({ prop: code, why: `${refusal.name} — ${refusal.why}`, ...(refusal.on ? { on: refusal.on } : {}) });
    }
  }
  return out;
}
