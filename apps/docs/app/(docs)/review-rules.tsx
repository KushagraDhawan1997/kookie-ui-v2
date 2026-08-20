import { Code, Stack, Text } from "@kookie-ui/react";

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
 * It renders on the server: `RULES` carries `run` and `apply` functions, and none of them are
 * called here — only `id`, `title`, `severity` and `why` are read, which are data.
 */
export function ReviewRules() {
  return (
    <Stack gap="5">
      {RULES.map((rule) => (
        <Stack key={rule.id} gap="2">
          <Text size="3" weight="medium">
            {rule.title}
          </Text>
          <Text size="2" emphasis="quiet">
            <Code size="2">{rule.id}</Code> · {rule.severity}
          </Text>
          <Text size="2" emphasis="medium" render={<p />}>
            {rule.why}
          </Text>
        </Stack>
      ))}
    </Stack>
  );
}
