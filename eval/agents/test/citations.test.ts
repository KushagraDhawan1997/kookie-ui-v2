/**
 * Every rubric check cites a sentence in the shipped docs. This re-reads each cited line and
 * fails when the sentence is no longer there, so a check cannot outlive the rule it enforces.
 *
 * The docs are hard-wrapped, so a sentence may run onto the following lines. It must START on
 * the cited line.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { CHECKS } from "../lib/checks.ts";
import { DOCS_DIR } from "../lib/paths.ts";

const squash = (text: string): string => text.replace(/\s+/g, " ").trim();

for (const check of CHECKS) {
  test(`${check.id} cites sentences that are still on their lines`, () => {
    assert.ok(check.cites.length > 0, `${check.id} cites nothing`);
    for (const cite of check.cites) {
      const file = path.join(DOCS_DIR, cite.page);
      const lines = readFileSync(file, "utf8").split("\n");
      const first = lines[cite.line - 1];
      assert.ok(first !== undefined, `${cite.page}:${cite.line} is past the end of the file`);
      const head = squash(first);
      const joined = squash(lines.slice(cite.line - 1, cite.line + 5).join(" "));
      const at = joined.indexOf(squash(cite.quote));
      assert.ok(at >= 0, `${cite.page}:${cite.line} no longer says: ${cite.quote}`);
      assert.ok(at < head.length, `${cite.page}:${cite.line}: the sentence starts on a later line`);
    }
  });
}

test("a citation's page is under packages/ui/agents/docs", () => {
  for (const check of CHECKS) {
    for (const cite of check.cites) {
      assert.match(cite.page, /^(start|foundations|patterns|components)\/[a-z-]+\.md$/, `${check.id}: ${cite.page}`);
    }
  }
});
