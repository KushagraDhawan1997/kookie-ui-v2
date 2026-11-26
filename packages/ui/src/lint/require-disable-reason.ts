/**
 * An "ignore this rule" comment needs a written reason (Kushagra, 2026-11-26).
 *
 * A real exception exists, so the comment is allowed. What is not allowed is silence: an agent
 * that meets a report it does not want to fix writes the disable comment and moves on, and the
 * next reader cannot tell an exception from a dodge. With the reason beside it, a person
 * reviewing the code sees every exception and why it is there.
 *
 * The reason is ESLint's own description syntax: everything after ` -- ` in the comment. This
 * rule reads only comments that name a rule of this plugin. A comment that disables someone
 * else's rule is their business.
 */
import type { Rule } from "eslint";

import { docs } from "./docs.ts";

type Comment = { type: string; value: string; loc?: unknown };

/** `eslint-disable`, `eslint-disable-line`, `eslint-disable-next-line`, and Oxlint's spellings. */
const DIRECTIVE = /^\s*(?:eslint|oxlint)-disable(?:-next-line|-line)?(?=\s|$)([\s\S]*)$/;

/** The rule's own namespace, written here because this file must not import the plugin. */
const OURS = /(?:^|[\s,])kookie\/[\w-]+/;

export const requireDisableReason: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "A comment that turns off a Kookie UI lint rule must say why.",
    },
    schema: [],
    messages: {
      missing:
        "This comment turns off a Kookie UI rule and gives no reason. Add the reason after ` -- `, for example `// eslint-disable-next-line {{rule}} -- the colour comes from the customer's brand`. Docs: " +
        docs("linter"),
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments() as Comment[]) {
          const match = DIRECTIVE.exec(comment.value);
          if (!match) continue;
          const [list = "", ...reason] = (match[1] ?? "").split(/\s--\s/);
          const named = OURS.exec(list);
          if (!named) continue;
          if (reason.join(" -- ").trim().length > 0) continue;
          context.report({
            loc: comment.loc as never,
            messageId: "missing",
            data: { rule: named[0].replace(/^[\s,]/, "") },
          });
        }
      },
    };
  },
};
