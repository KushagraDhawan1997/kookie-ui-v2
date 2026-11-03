import RULE_LIST from "./rules.json";

/** The composition rules, one list for the builder and the screen check (2026-11-02). Each
    entry is a rule's words: id, title, severity, reason, its RULES.md number, and which checker
    enforces it. Detection lives with each checker; `rules.test.ts` keeps them in step. */
export type RuleEntry = {
  id: string;
  title: string;
  severity: "error" | "warning";
  why: string;
  rule: number | null;
  checkedBy: ("builder" | "screen")[];
};

export const RULE_ENTRIES = RULE_LIST as RuleEntry[];

/** Who checks a rule, in words. */
export const checkedBy = (by: readonly string[]): string =>
  by.length > 1 ? "builder and the screen check" : by[0] === "screen" ? "screen check" : "builder";
