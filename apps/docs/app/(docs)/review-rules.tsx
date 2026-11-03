import {
  Code,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@kushagradhawan/kookie-ui-react";

import { InlineCode } from "../inline-code";
import { RULE_ENTRIES, checkedBy } from "../builder/rules";

/**
 * The house style's rules, rendered FROM THE LINTER (2026-08-21).
 *
 * This is the builder integration that is worth more than a link. The composition rules exist
 * in two registers — prose a person reads, and checks a machine runs — and the ordinary
 * outcome of that is drift: someone adds a rule to the reviewer and the guideline page never
 * hears about it, or a chapter states a rule nothing enforces. Both directions have happened
 * in this repo often enough to have a name.
 *
 * So the chapter narrates the rules in its own words, and this list is generated from
 * `RULES` — the same array the builder walks over a live document. A new rule appears here
 * the day it ships. A rule whose stated reason changes changes here too, because `why` is the
 * one string both the finding and this page print.
 *
 * A TABLE, not a stack (2026-09-07, Kushagra: "is this the best way to present it?"). The
 * first rendering stacked twenty-three title/id/paragraph blocks, which reads as one long
 * undifferentiated column at the end of a chapter that has already narrated the headline
 * rules in prose. A table serves the two ways this list is actually read: scanning the titles
 * to see what exists, and looking up one rule's reason. Severity becomes a column you can
 * compare, and the id sits under the title where a finding's reader will look for it.
 *
 * ONE LIST SINCE 2026-11-02: the rows come from `rules.json`, which the builder and the screen
 * check (`scripts/review-ui`) both read, so the table covers every rule either one enforces and
 * says which. `rules.test.ts` keeps the list and both checkers in step.
 */
export function ReviewRules() {
  return (
    <Table size="2">
      <TableHeader>
        <TableRow>
          <TableHead>Rule</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Checked by</TableHead>
          <TableHead>Why</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {RULE_ENTRIES.map((rule) => (
          <TableRow key={rule.id}>
            <TableCell>
              <Text weight="medium" render={<div />}>
                <InlineCode text={rule.title} />
              </Text>
              <Code>{rule.id}</Code>
            </TableCell>
            <TableCell>{rule.severity}</TableCell>
            <TableCell>{checkedBy(rule.checkedBy)}</TableCell>
            <TableCell>
              <InlineCode text={rule.why} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
