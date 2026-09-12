/**
 * Sheet's NODE laws — what the published TYPE says, where a mount cannot answer.
 *
 * One question, and it is the one the ship audit paid for (S2, 2026-09-12).
 * `SheetOpenChangeReason` is HAND-LISTED rather than aliased to
 * `BaseDrawer.Root.ChangeEventReason`, for the reason every other union in this package is: the
 * published API is Kookie's, so a Base UI minor bump must not silently widen what a consumer's
 * `switch` has to handle. What that costs is that the two can silently DIVERGE — and they had.
 * `close-watcher` was missing, which is the reason Base UI's Drawer sends for the Android system
 * BACK gesture, so an exhaustive "you have unsaved changes" guard written over this union had no
 * case for the commonest dismissal on that platform, and TypeScript REJECTED the case that would
 * have handled it. The worst shape a missing member can take: the guard looks complete and the
 * compiler agrees.
 *
 * So the deliberate hand-list owes an agreement law rather than a comment, and this is it. It
 * reads both SOURCES — ours and the dependency's `.d.ts` — and compares them as SETS, in both
 * directions: a reason Base UI gained and we did not is the defect above, and a reason we
 * publish and Base UI can never send is a `case` a consumer writes that will never run.
 *
 * It is Sheet's union and not the overlay family's, and that is measured rather than assumed:
 * Base UI's Dialog root declares no `closeWatcher` and installs none, so widening
 * `OverlayOpenChangeReason` would publish a reason Dialog and AlertDialog can never send.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { raw } from "../../test/stylesheets.ts";

const require = createRequire(import.meta.url);

/** The dependency's own declarations, resolved through the exports map rather than by a path
    literal — a hand-written `node_modules/...` would break the day pnpm's store layout changes,
    and would go on passing if it broke by finding nothing. */
function baseUiFile(relative: string): string {
  const drawer = path.dirname(require.resolve("@base-ui/react/drawer"));
  const pkg = path.resolve(drawer, "..");
  const file = path.join(pkg, relative);
  try {
    return readFileSync(file, "utf8");
  } catch {
    throw new Error(`baseUiFile(): Base UI no longer ships ${relative} — resolved ${file}`);
  }
}

/**
 * The declaration named by `symbol`, from its `=` to the `;` that ends it — and LOUD when the
 * symbol is missing, which is the whole point. Every negative half of this law is a set
 * difference, and an extractor that silently answers "" makes two empty sets agree perfectly
 * (`block()`'s own reason, test/stylesheets.ts).
 */
function declaration(source: string, symbol: string, where: string): string {
  const at = source.indexOf(`type ${symbol}`);
  if (at === -1) throw new Error(`declaration(): ${symbol} is not declared in ${where}`);
  const eq = source.indexOf("=", at);
  const end = source.indexOf(";", eq);
  if (eq === -1 || end === -1) throw new Error(`declaration(): ${symbol} in ${where} has no body`);
  return source.slice(eq + 1, end);
}

/** Every string literal in a union body. */
const literals = (body: string): string[] => [...body.matchAll(/["']([^"']+)["']/g)].map(([, v]) => v!);

/** WHAT THIS PACKAGE PUBLISHES: the overlay family's reasons, plus the two a drawer adds. Read
    through the composition rather than as one flat list, because the composition is the design —
    a hand-list that stopped referencing `OverlayOpenChangeReason` would be a second home for
    seven strings, and this is where that would show. */
function ours(): Set<string> {
  const sheet = raw("components/sheet/sheet.tsx");
  const body = declaration(sheet, "SheetOpenChangeReason", "sheet.tsx");
  expect(
    body,
    "SheetOpenChangeReason no longer builds on the overlay family's union — it is a second home for those reasons now",
  ).toContain("OverlayOpenChangeReason");
  const overlay = declaration(
    raw("system/floating.tsx"),
    "OverlayOpenChangeReason",
    "system/floating.tsx",
  );
  return new Set([...literals(overlay), ...literals(body)]);
}

/** WHAT BASE UI CAN SEND: `DrawerRootChangeEventReason` names its members through `typeof
    REASONS.x`, so the camelCase names are resolved through the constants file that gives them
    their values. Two hops, and both are read rather than remembered. */
function theirs(): Set<string> {
  const body = declaration(
    baseUiFile("drawer/root/DrawerRoot.d.ts"),
    "DrawerRootChangeEventReason",
    "@base-ui/react/drawer",
  );
  const members = [...body.matchAll(/typeof REASONS\.(\w+)/g)].map(([, name]) => name!);
  if (members.length === 0)
    throw new Error(`theirs(): the drawer union no longer names REASONS members: ${body.trim()}`);
  const parts = baseUiFile("internals/reason-parts.d.ts");
  return new Set(
    members.map((name) => {
      const declared = parts.match(new RegExp(`\\b${name}\\s*:\\s*["']([^"']+)["']`));
      if (!declared) throw new Error(`theirs(): REASONS.${name} has no value in reason-parts.d.ts`);
      return declared[1]!;
    }),
  );
}

describe("the sheet's close reasons are Base UI's Drawer's, as a SET (§11, S2)", () => {
  it("both extractors read something real — an empty set agrees with anything", () => {
    // The calibration this law cannot do without. Two regexes over two codebases sit between the
    // claim and the answer, and the failure mode of a broken one is SILENCE: `new Set()` equals
    // `new Set()`, so the equality below would be the greenest assertion in the suite while
    // checking nothing. An instrument is calibrated against a known answer before its output is
    // evidence (2026-08-08).
    expect(ours().size, "our union came back too small to be the published one").toBeGreaterThanOrEqual(8);
    expect(theirs().size, "the drawer's union came back too small to be real").toBeGreaterThanOrEqual(8);
    // Anchors on both sides: a reason that has been in both unions since either existed.
    expect([...ours()], "our extractor found no escape-key").toContain("escape-key");
    expect([...theirs()], "their extractor found no escape-key").toContain("escape-key");
  });

  it("every reason the Drawer can send is a reason a consumer can write a case for", () => {
    // The direction the audit found: `close-watcher` was missing, so the Android BACK gesture —
    // the commonest dismissal on that platform — had no case, and TypeScript refused the one
    // that would have handled it. Falsified by deleting `| "close-watcher"` from sheet.tsx.
    const missing = [...theirs()].filter((reason) => !ours().has(reason));
    expect(
      missing,
      `Base UI's Drawer sends ${missing.join(", ")} and SheetOpenChangeReason has no member for it — an exhaustive guard cannot handle a dismissal it cannot name`,
    ).toEqual([]);
  });

  it("and every reason we publish is one the Drawer can actually send", () => {
    // The other direction, and it is not symmetry for its own sake: a reason in the union that
    // nothing emits is a `case` a consumer writes, tests by reading, and never runs. It is also
    // what catches the cheapest wrong repair for the law above — widening our union until it
    // covers everything.
    const invented = [...ours()].filter((reason) => !theirs().has(reason));
    expect(
      invented,
      `SheetOpenChangeReason publishes ${invented.join(", ")}, which Base UI's Drawer never sends — a consumer's case for it can never run`,
    ).toEqual([]);
  });

  it("the two reasons a DRAWER adds are the sheet's own, not the overlay family's", () => {
    // Why this union exists at all, stated as a law rather than as the comment above it: Base
    // UI's Dialog root declares neither `swipe` nor `closeWatcher`, so widening
    // `OverlayOpenChangeReason` would publish on Dialog and AlertDialog two reasons they can
    // never send — which is the previous law's own defect, aimed the other way.
    const overlay = new Set(
      literals(declaration(raw("system/floating.tsx"), "OverlayOpenChangeReason", "system/floating.tsx")),
    );
    for (const reason of ["swipe", "close-watcher"]) {
      expect([...theirs()], `the drawer no longer sends ${reason}`).toContain(reason);
      expect(
        [...overlay],
        `${reason} has leaked into the overlay family's union, where Dialog and AlertDialog can never send it`,
      ).not.toContain(reason);
      expect([...ours()], `the sheet no longer publishes ${reason}`).toContain(reason);
    }
    // And the rest of our union IS the overlay family's, verbatim — the composition, measured.
    expect([...ours()].filter((r) => r !== "swipe" && r !== "close-watcher").sort()).toEqual(
      [...overlay].sort(),
    );
  });
});
