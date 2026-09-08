/**
 * The server's adapter onto the package's snippet checker.
 *
 * The rules used to live here. They now live in `@kookie-ui/react/agent`, because the
 * documentation site exposes the same tool and had written its own scanner — two
 * implementations of "is this snippet inside the system", under one tool name, giving
 * different answers. What is left in this file is the only part that was ever the server's:
 * binding the package's rules to the SNAPSHOT this package builds, and the start-up probe
 * that reads the exported symbols out of it.
 */
import { checkUsage as check, type CheckResult, type Finding, type SnippetData } from "@kookie-ui/react/agent";

import { data, isKookie, legalValues, refusalsFor } from "./data.ts";

export type { CheckResult, Finding };

/** The snapshot, in the shape the package's checker asks for. Every field is a lookup into
    `data.ts`; nothing here decides anything. */
const snapshot = (): SnippetData => ({
  isKookie,
  refusalsFor,
  legalValues,
  // A space row closes its INDEXES and passes everything else through as raw CSS, which
  // `resolve.ts` states as the visible way out of the scale. Without this the checker read the
  // list as a closed set and reported `gap="16px"` and `inset="0"` — both documented — as hard
  // errors, on this repo's own laws among other things (2026-09-07, the audit).
  scaleIndexed: (_symbol, prop) => data().layoutProps[prop]?.scale === "space",
  refusedAttributes: data().refusedAttributes,
  refusedAttributeMessage: data().refusedAttributeMessage,
});

export function checkUsage(source: string): CheckResult {
  return check(source, snapshot());
}

/** Every symbol the system exports. Its one caller is `index.ts`, which reads it at start-up
    so a missing or empty snapshot fails where the process can still print why. */
export const exportedSymbols = (): string[] =>
  [...new Set(data().components.flatMap((row) => row.symbols))].sort();
