import {
  Code,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@kookie-ui/react";

import { InlineCode } from "../inline-code";
import { RULES } from "../builder/review";

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
 * It renders on the server: `RULES` carries `run` and `apply` functions, and none of them are
 * called here — only `id`, `title`, `severity` and `why` are read, which are data.
 */
export function ReviewRules() {
  return (
    <Table size="3">
      <TableHeader>
        <TableRow>
          <TableHead>Rule</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Why</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {RULES.map((rule) => (
          <TableRow key={rule.id}>
            <TableCell>
              <Text weight="medium" render={<div />}>
                <InlineCode text={rule.title} />
              </Text>
              <Code>{rule.id}</Code>
            </TableCell>
            <TableCell>{rule.severity}</TableCell>
            <TableCell>
              <InlineCode text={rule.why} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
