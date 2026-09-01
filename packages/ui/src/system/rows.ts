/**
 * The row family's identity, spelled once (§21).
 *
 * A row is `kui-control kui-row` riding the existing control cells, quiet by STAMP because
 * emphasis is refused (a list is a set of peers, and one louder row names nothing), neutral
 * unless the one meaning with its own ink is asked for.
 *
 * IT LIVES HERE BECAUSE THERE ARE THREE CONSUMERS. Menu wrote it, Select copied it with the
 * note "self-keyed on the second member", and Command is the third — which is this repo's own
 * rule (LOG 2026-08-05: the second member self-keys, the third promotes). The two copies had
 * already drifted in shape if not in output: menu's took a tone parameter and select's did not,
 * so the same fact was spelled with two different signatures, which is how the NEXT difference
 * becomes a real one.
 *
 * It is deliberately props and not a component. Each consumer hands these to a different Base
 * UI part — `Menu.Item`, `Select.Item`, `Autocomplete.Item` — and each of those owns its own
 * roving highlight, its own ARIA role and its own activation. The identity is the fact they
 * share; the part is not. That is `glyphs.ts`'s sentence one layer up.
 */
import type { Size } from "./axes.ts";

export function rowProps(
  size: Size,
  part: string,
  opts: { tone?: "destructive"; className?: string } = {},
) {
  const cls = `kui-control kui-row ${part}`;
  return {
    "data-size": size,
    "data-tone": opts.tone ?? "neutral",
    "data-emphasis": "quiet",
    className: opts.className ? `${cls} ${opts.className}` : cls,
  } as const;
}
