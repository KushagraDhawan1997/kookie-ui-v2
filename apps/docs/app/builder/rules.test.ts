import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { RULES } from "./review";
import { RULE_ENTRIES as LIST } from "./rules";

/**
 * ONE LIST OF COMPOSITION RULES, TWO CHECKERS (2026-11-02).
 *
 * The builder's reviewer reads builder documents; the screen check (`scripts/review-ui`) reads
 * any rendered page. They enforce overlapping rules, and two copies of a rule's words drift:
 * the reason this file exists. `rules.json` holds each rule's id, title, severity, reason and
 * RULES.md number once; each checker holds only its detection. These laws keep the list, both
 * checkers and RULES.md saying the same thing.
 */
const root = path.resolve(__dirname, "../../../..");
const screenSource = readFileSync(path.join(root, "scripts/review-ui/check.js"), "utf8");
const rulesMd = readFileSync(path.join(root, "RULES.md"), "utf8");

const screenIds = (): string[] => {
  const block = screenSource.slice(screenSource.indexOf("const RULES = ["), screenSource.indexOf("window.__kuiHoverCandidates"));
  if (block.length < 100) throw new Error("could not find the screen check's RULES array");
  return [...block.matchAll(/^ {6}id: "([a-z0-9-]+)",/gm)].map((m) => m[1]!);
};
const listed = (checker: string) => LIST.filter((r) => (r.checkedBy as string[]).includes(checker)).map((r) => r.id).sort();

describe("the composition rules have one list", () => {
  it("every builder rule is in the list, and nothing else claims the builder", () => {
    expect(RULES.map((r) => r.id).sort()).toEqual(listed("builder"));
  });

  it("every screen rule is in the list, and nothing else claims the screen", () => {
    expect(screenIds().sort()).toEqual(listed("screen"));
  });

  it("each rule is stated once, completely", () => {
    const ids = LIST.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of LIST) {
      expect(r.checkedBy.length, r.id).toBeGreaterThan(0);
      expect(["error", "warning"], r.id).toContain(r.severity);
      expect(r.title.trim().length, r.id).toBeGreaterThan(3);
      expect(r.why.split(" ").length, r.id).toBeGreaterThan(6);
    }
  });

  it("a builder finding carries the list's words", () => {
    for (const rule of RULES) {
      const entry = LIST.find((r) => r.id === rule.id)!;
      expect({ title: rule.title, severity: rule.severity, why: rule.why }).toEqual({
        title: entry.title,
        severity: entry.severity,
        why: entry.why,
      });
    }
  });

  it("every RULES.md number a rule cites exists", () => {
    const numbers = new Set([...rulesMd.matchAll(/^\s*(\d+)\. \*\*/gm)].map((m) => Number(m[1])));
    for (const r of LIST) if (r.rule !== null) expect(numbers, `${r.id} cites rule ${r.rule}`).toContain(r.rule);
  });

  it("every check RULES.md names is a real rule of that checker", () => {
    // "screen and builder `x`" names both checkers, so both must list it.
    const names = [...rulesMd.matchAll(/(screen|builder)( and builder)? `([a-z0-9-]+)`((?:, `[a-z0-9-]+`)*)/g)];
    expect(names.length).toBeGreaterThan(10);
    for (const [, checker, both, first, rest] of names) {
      const ids = [first!, ...[...rest!.matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1]!)];
      const checkers = both ? [checker!, "builder"] : [checker!];
      for (const c of checkers)
        for (const id of ids) expect(listed(c), `RULES.md names ${c} \`${id}\``).toContain(id);
    }
  });
});
