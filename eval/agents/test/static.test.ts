/**
 * The scoring tools on two hand-made screens: one that writes the Radix Themes reflexes the
 * package refuses, one that does not. The tools are loaded from packages/ui, so this needs its
 * `dist/` (the watchers keep it built).
 *
 * The checkUsage half needs a snapshot (see `snapshot.ts`). With none, it is skipped and says so.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

import { FIXTURES_DIR, UI_PACKAGE } from "../lib/paths.ts";
import { runLint, snapshotPath, usageChecker, wrongProps } from "../lib/static.ts";

const refused = path.join(FIXTURES_DIR, "_static/refused.tsx");
const clean = path.join(FIXTURES_DIR, "_static/clean.tsx");
const built = existsSync(path.join(UI_PACKAGE, "dist/lint/index.js"));

describe("the kookie ESLint plugin", { skip: built ? false : "packages/ui/dist is not built" }, () => {
  test("reports the refused props as errors", async () => {
    const result = await runLint([refused], FIXTURES_DIR, UI_PACKAGE);
    assert.equal(result.fatal, 0, JSON.stringify(result.messages));
    assert.ok(result.errors >= 1, JSON.stringify(result.messages));
    assert.ok(result.messages.every((m) => m.rule?.startsWith("kookie/")), "only the plugin's own rules run");
  });
  test("reports nothing on the clean screen", async () => {
    const result = await runLint([clean], FIXTURES_DIR, UI_PACKAGE);
    assert.deepEqual([result.fatal, result.errors, result.warnings], [0, 0, 0], JSON.stringify(result.messages));
  });
});

let snapshot: string | null = null;
try {
  snapshot = snapshotPath();
} catch {
  snapshot = null;
}

describe("checkUsage bound to the snapshot", { skip: !built ? "packages/ui/dist is not built" : snapshot ? false : "no snapshot" }, () => {
  test("names every refused prop on the refused screen", async () => {
    const check = await usageChecker(UI_PACKAGE, snapshot!);
    const result = check(readFileSync(refused, "utf8"));
    const named = new Set(result.findings.map((f) => `${f.tag}.${f.prop}`));
    for (const want of ["Card.variant", "Button.variant", "Button.color", "Button.m"]) {
      assert.ok(named.has(want), `missing ${want} in ${[...named].join(", ")}`);
    }
  });
  test("finds nothing on the clean screen", async () => {
    const check = await usageChecker(UI_PACKAGE, snapshot!);
    assert.deepEqual(check(readFileSync(clean, "utf8")).findings, []);
  });
});

test("wrong props are read off checkUsage findings and tsc messages", () => {
  const tally = wrongProps(
    [
      { rule: "refused-prop", severity: "error", line: 1, tag: "Button", prop: "variant", message: "" },
      { rule: "raw-value-in-style", severity: "warning", line: 1, tag: "Box", prop: "style", message: "" },
    ],
    [
      "src/App.tsx(4,15): error TS2322: Type '{ children: string; variant: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps'.",
      "src/App.tsx(7,9): error TS2322: Property 'highContrast' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.",
    ],
  );
  assert.deepEqual(tally, ["Button.variant", "Button.highContrast (tsc)"]);
});
