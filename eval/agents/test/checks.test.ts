/**
 * Every rubric check passes its good fixture and fails its bad one.
 *
 * A check that cannot tell the two apart is not a check, so both halves are asserted, and the
 * good half must be a real `pass`: an `na` would mean the fixture never reached the check.
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

import { TASKS, UNIVERSAL_CHECKS } from "../tasks.ts";
import { CHECKS, runChecks } from "../lib/checks.ts";
import { FIXTURES_DIR } from "../lib/paths.ts";
import { loadProject } from "../lib/tree.ts";

const fixture = (id: string, kind: string) => {
  const file = path.join(FIXTURES_DIR, id, `${kind}.tsx`);
  return loadProject([file], FIXTURES_DIR);
};

describe("each check against its fixtures", () => {
  for (const check of CHECKS) {
    test(`${check.id}: good passes`, () => {
      const result = check.run(fixture(check.id, "good"));
      assert.equal(result.status, "pass", result.notes.join("; "));
    });
    test(`${check.id}: bad fails`, () => {
      const result = check.run(fixture(check.id, "bad"));
      assert.equal(result.status, "fail", `expected a fail, got ${result.status}: ${result.notes.join("; ")}`);
    });
  }
});

test("every check has both fixtures, and every fixture folder names a check", () => {
  const ids = new Set(CHECKS.map((check) => check.id));
  for (const id of ids) {
    assert.ok(existsSync(path.join(FIXTURES_DIR, id, "good.tsx")), `${id}/good.tsx`);
    assert.ok(existsSync(path.join(FIXTURES_DIR, id, "bad.tsx")), `${id}/bad.tsx`);
  }
  for (const entry of readdirSync(FIXTURES_DIR)) {
    if (entry.startsWith("_")) continue;
    assert.ok(ids.has(entry), `fixtures/${entry} names no check`);
  }
});

test("a good fixture is also good by the universal checks", () => {
  // A good fixture that broke another rule would teach the wrong screen.
  for (const check of CHECKS) {
    const results = runChecks(fixture(check.id, "good"), UNIVERSAL_CHECKS);
    for (const [id, result] of Object.entries(results)) {
      assert.notEqual(result.status, "fail", `${check.id}/good.tsx fails ${id}: ${result.notes.join("; ")}`);
    }
  }
});

test("every task names real checks, and every check is scored somewhere", () => {
  const ids = new Set(CHECKS.map((check) => check.id));
  const used = new Set<string>(UNIVERSAL_CHECKS);
  for (const task of TASKS) {
    for (const id of task.checks) {
      assert.ok(ids.has(id), `${task.id} names unknown check ${id}`);
      used.add(id);
    }
  }
  for (const id of ids) assert.ok(used.has(id), `${id} is scored by no task`);
  assert.equal(TASKS.length, 8);
});

test("no prompt names a component the rubric looks for", () => {
  // The prompts are product-style. Prop names such as `loading` are ordinary English and are
  // not tested; component names are.
  const components = new Set(
    CHECKS.flatMap((check) => check.cites.flatMap((cite) => [...cite.quote.matchAll(/`([A-Z][A-Za-z]+)`/g)].map((m) => m[1]!))),
  );
  for (const task of TASKS) {
    for (const name of components) {
      assert.ok(!new RegExp(`\\b${name}\\b`).test(task.prompt), `${task.id} prompt names \`${name}\``);
    }
  }
});

describe("cases the docs allow, found by the 2026-10-18 run", () => {
  for (const [id, kind] of [["alert-for-irreversible", "good-dialog"], ["group-gap-steps", "good-fields"]] as const) {
    test(`${id}: ${kind} passes`, () => {
      const check = CHECKS.find((c) => c.id === id)!;
      const result = check.run(fixture(id, kind));
      assert.equal(result.status, "pass", result.notes.join("; "));
    });
  }
});
