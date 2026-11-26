/**
 * The laws of the linter as Kushagra widened it on 2026-11-26 (LOG, same date).
 *
 * `lint.test.ts` holds the laws of the first three rules and of the shipped config. This file
 * holds what was added when the plugin stopped being "only what the compiler cannot see": the
 * message shape, the strict set, the reason a disable comment owes, and the composition, style
 * and missing-piece rules.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { Linter } from "eslint";
import tseslint from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { DOCS_ORIGIN, DOCS_PAGES } from "./docs.ts";
import plugin, { NAMESPACE, recommended, rules, strict } from "./index.ts";

const here = fileURLToPath(new URL(".", import.meta.url));

const languageOptions = {
  parser: tseslint.parser as never,
  parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" as const },
};

describe("a message says what is wrong, what to use, and where to read", () => {
  it("every linked page is a page the package ships", () => {
    const pages = Object.entries(DOCS_PAGES);
    expect(pages.length).toBeGreaterThan(5);
    for (const [name, path] of pages) {
      const file = join(here, "../../agents/docs", `${path}.md`);
      expect(existsSync(file), `${name} links ${path}, and ${file} is not there`).toBe(true);
    }
  });

  it("every message of every rule ends with a link to one of those pages", () => {
    const known = new Set(Object.values(DOCS_PAGES).map((path) => `${DOCS_ORIGIN}${path}`));
    let seen = 0;
    for (const [name, rule] of Object.entries(rules)) {
      for (const [id, message] of Object.entries(rule.meta?.messages ?? {})) {
        // A suggestion's label is a button, not a report, and carries no link.
        if (id.startsWith("suggest")) continue;
        seen += 1;
        const link = /Docs: (\S+)$/.exec(message)?.[1];
        expect(link, `${name}/${id} has no link`).toBeDefined();
        expect(known.has(link as string), `${name}/${id} links ${String(link)}`).toBe(true);
      }
    }
    expect(seen).toBeGreaterThan(8);
  });
});

describe("the strict set", () => {
  it("holds exactly the rules recommended holds, and every one is an error", () => {
    const keys = (config: typeof recommended) => Object.keys(config[0]?.rules ?? {}).sort();
    expect(keys(strict)).toEqual(keys(recommended));
    expect(keys(strict).length).toBe(Object.keys(rules).length);
    for (const entry of strict) {
      for (const [rule, severity] of Object.entries(entry.rules ?? {})) {
        expect(severity, rule).toBe("error");
      }
    }
    expect(plugin.configs?.["strict"]).toBe(strict);
  });

  it("recommended keeps a warning where a fair exception exists", () => {
    expect(recommended[0]?.rules?.[`${NAMESPACE}/no-escape-abuse`]).toBe("warn");
  });
});

/** The plugin as a consumer runs it, so a disable comment can name its rules. */
function lint(code: string, set = recommended, filename = "example.tsx") {
  return new Linter()
    .verify(
      code,
      set.map((entry) => ({ ...entry, files: ["**/*.ts", "**/*.tsx"], languageOptions })),
      filename,
    )
    .filter((message) => message.ruleId?.startsWith(`${NAMESPACE}/`));
}

describe("require-disable-reason — an ignore needs a reason", () => {
  const found = (code: string) =>
    lint(code).filter((message) => message.ruleId === `${NAMESPACE}/require-disable-reason`);

  it("is silent when the comment says why, and on comments that are not ours", () => {
    for (const code of [
      `// eslint-disable-next-line kookie/no-escape-abuse -- the colour comes from the customer's brand\nconst x = 1;`,
      `/* eslint-disable kookie/no-escape-abuse, no-console -- generated file */\nconst x = 1;`,
      // Someone else's rule is their business.
      `// eslint-disable-next-line no-console\nconst x = 1;`,
      // An ordinary comment that only mentions the words.
      `// we used to eslint-disable kookie/no-escape-abuse here\nconst x = 1;`,
    ]) {
      expect(found(code), code).toEqual([]);
    }
  });

  it("reports a comment that turns one of our rules off and gives no reason", () => {
    for (const code of [
      `// eslint-disable-next-line kookie/no-escape-abuse\nconst x = 1;`,
      `/* eslint-disable no-console, kookie/no-refused-prop */\nconst x = 1;`,
      // A reason of nothing is no reason.
      `const x = 1; // eslint-disable-line kookie/no-escape-abuse -- `,
      `// oxlint-disable-next-line kookie/no-escape-abuse\nconst x = 1;`,
    ]) {
      const messages = found(code);
      expect(messages.length, code).toBe(1);
      expect(messages[0]?.severity, code).toBe(2);
    }
  });

  it("cannot be silenced by the comment it reports", () => {
    const code = `import { Card } from "@kushagradhawan/kookie-ui-react";\n// eslint-disable-next-line kookie/no-escape-abuse\nconst x = <Card className="p-4" />;\n`;
    expect(found(code).length).toBe(1);
  });
});
