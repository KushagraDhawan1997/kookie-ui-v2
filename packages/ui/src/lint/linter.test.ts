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

import { Linter, RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { noEscapeAbuse } from "./no-escape-abuse.ts";
import { noDialogCancel, preferFieldRow, preferToolbar, preferToolbarTitle } from "./composition.ts";
import { DOCS_ORIGIN, DOCS_PAGES } from "./docs.ts";
import plugin, { NAMESPACE, recommended, rules, strict } from "./index.ts";

const here = fileURLToPath(new URL(".", import.meta.url));

const languageOptions = {
  parser: tseslint.parser as never,
  parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" as const },
};

const tester = new RuleTester({ languageOptions });

/** A file that imports the names it uses from the package, then one expression. */
const file = (names: string, jsx: string) =>
  `import { ${names} } from "@kushagradhawan/kookie-ui-react";\nconst x = (\n${jsx}\n);\n`;

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

describe("prefer-field-row — fields side by side go in a FieldRow (SETTLED, Components and patterns)", () => {
  const two = `<Field><FieldLabel>First name</FieldLabel><TextField /></Field><Field><FieldLabel>Last name</FieldLabel><TextField /></Field>`;
  it("runs", () => {
    tester.run("prefer-field-row", preferFieldRow, {
      valid: [
        file("Field, FieldLabel, FieldRow, TextField", `<FieldRow>${two}</FieldRow>`),
        // Stacked fields are the ordinary form.
        file("Field, FieldLabel, Stack, TextField", `<Stack gap="5">${two}</Stack>`),
        file("Field, FieldLabel, Flex, TextField", `<Flex direction="column" gap="5">${two}</Flex>`),
        file("Field, FieldLabel, Grid, TextField", `<Grid gap="5">${two}</Grid>`),
        // One field beside a button is a search row, not a row of fields.
        file("Button, Field, FieldLabel, Flex, TextField", `<Flex gap="3"><Field><FieldLabel>Email</FieldLabel><TextField /></Field><Button>Invite</Button></Flex>`),
        // A field with no text box has nothing that reaches past its label.
        file("Checkbox, Field, FieldLabel, Flex", `<Flex gap="5"><Field><Checkbox /><FieldLabel>Email</FieldLabel></Field><Field><Checkbox /><FieldLabel>Push</FieldLabel></Field></Flex>`),
        // A consumer's own grid is their business, and so is a direction the file cannot state.
        `const x = <Grid columns="2"><Field><TextField /></Field><Field><TextField /></Field></Grid>;`,
        file("Field, FieldLabel, Flex, TextField", `<Flex direction={narrow ? "column" : "row"}>${two}</Flex>`),
      ],
      invalid: [
        {
          code: file("Field, FieldLabel, Grid, TextField", `<Grid columns="2" gap="3">${two}</Grid>`),
          errors: [
            {
              messageId: "sideBySide",
              data: { element: "Grid" },
              suggestions: [
                {
                  messageId: "suggestFieldRow",
                  data: { element: "Grid" },
                  output: file("Field, FieldLabel, Grid, TextField, FieldRow", `<FieldRow>${two}</FieldRow>`),
                },
              ],
            },
          ],
        },
        {
          // The import is already there, under another name.
          code: file("Field, FieldLabel, FieldRow as Pair, Flex, TextField", `<Flex gap="3">${two}</Flex>`),
          errors: [
            {
              messageId: "sideBySide",
              suggestions: [
                {
                  messageId: "suggestFieldRow",
                  output: file("Field, FieldLabel, FieldRow as Pair, Flex, TextField", `<Pair>${two}</Pair>`),
                },
              ],
            },
          ],
        },
        {
          // A row that also holds something else is reported, and no swap is offered.
          code: file("Button, Field, FieldLabel, Flex, TextField", `<Flex gap="3">${two}<Button>Save</Button></Flex>`),
          errors: [{ messageId: "sideBySide", suggestions: [] }],
        },
      ],
    });
  });
});

const close = `<DialogClose render={<ToolbarButton iconOnly aria-label="Close"><X /></ToolbarButton>} />`;
const band = `<Toolbar><ToolbarTitle render={<DialogTitle />}>Rename project</ToolbarTitle>${close}</Toolbar>`;
const DIALOG = "Button, Dialog, DialogClose, DialogContent, DialogTitle, Flex, Toolbar, ToolbarButton, ToolbarTitle";

describe("no-dialog-cancel — Close already cancels (SETTLED, settled for now 2026-11-25)", () => {
  it("runs", () => {
    tester.run("no-dialog-cancel", noDialogCancel, {
      valid: [
        file(DIALOG, `<Dialog><DialogContent>${band}<Toolbar><ToolbarButton emphasis="loud">Rename</ToolbarButton></Toolbar></DialogContent></Dialog>`),
        // With no Close, Cancel is the only way out that a pointer has.
        file(DIALOG, `<Dialog><DialogContent><DialogClose render={<Button>Cancel</Button>} /></DialogContent></Dialog>`),
        // An alert dialog asks a question, and Cancel is one of its two answers.
        `import { AlertDialog, AlertDialogCancel, AlertDialogContent } from "@kushagradhawan/kookie-ui-react";\nconst x = <AlertDialog><AlertDialogContent><AlertDialogCancel>Cancel</AlertDialogCancel></AlertDialogContent></AlertDialog>;`,
        // "Cancel subscription" is an action, not the way out.
        file(DIALOG, `<Dialog><DialogContent>${band}<Button>Cancel subscription</Button></DialogContent></Dialog>`),
      ],
      invalid: [
        {
          code: file(DIALOG, `<Dialog><DialogContent>${band}<Flex><DialogClose render={<Button emphasis="quiet">Cancel</Button>} /><Button emphasis="loud">Rename</Button></Flex></DialogContent></Dialog>`),
          errors: [
            {
              messageId: "cancel",
              suggestions: [
                {
                  messageId: "suggestRemove",
                  output: file(DIALOG, `<Dialog><DialogContent>${band}<Flex><Button emphasis="loud">Rename</Button></Flex></DialogContent></Dialog>`),
                },
              ],
            },
          ],
        },
        {
          code: file(DIALOG, `<Dialog><DialogContent>${band}<Button onClick={close}>Cancel</Button></DialogContent></Dialog>`),
          errors: [{ messageId: "cancel", suggestions: 1 }],
        },
      ],
    });
  });
});

describe("prefer-toolbar — a panel's top row is a Toolbar (RULES 2)", () => {
  it("runs", () => {
    tester.run("prefer-toolbar", preferToolbar, {
      valid: [
        file(DIALOG, `<Dialog><DialogContent>${band}</DialogContent></Dialog>`),
        // Grouping band items in a Flex cluster is how a band is written.
        file(DIALOG, `<Dialog><DialogContent><Toolbar><ToolbarTitle render={<DialogTitle />}>Rename</ToolbarTitle><Flex>${close}</Flex></Toolbar></DialogContent></Dialog>`),
        // A title under the band, with no button beside it, is one of the three settled tops.
        file(DIALOG, `<Dialog><DialogContent><Toolbar>${close}</Toolbar><DialogTitle>Rename project</DialogTitle></DialogContent></Dialog>`),
        // The consumer's own header may be a toolbar of theirs. The rule cannot read it.
        file(DIALOG, `<Dialog><DialogContent><Header><DialogTitle>Rename</DialogTitle><Button>Save</Button></Header></DialogContent></Dialog>`),
        // A close that says its name is an action in the content, not the X.
        file(DIALOG, `<Dialog><DialogContent>${band}<DialogClose render={<Button>Done</Button>} /></DialogContent></Dialog>`),
      ],
      invalid: [
        {
          code: file(DIALOG, `<Dialog><DialogContent><Flex justify="space-between"><DialogTitle>Rename project</DialogTitle>${close}</Flex></DialogContent></Dialog>`),
          // One row built by hand is one report, not one for the row and one for its X.
          errors: [{ messageId: "rowByHand", data: { row: "Flex" } }],
        },
        {
          code: file(DIALOG, `<Dialog><DialogContent><div className="head"><DialogTitle>Rename project</DialogTitle><Button>Save</Button></div></DialogContent></Dialog>`),
          errors: [{ messageId: "rowByHand", data: { row: "div" } }],
        },
        {
          code: `import { Popover, PopoverClose, PopoverContent, ToolbarButton } from "@kushagradhawan/kookie-ui-react";\nconst x = <Popover><PopoverContent><PopoverClose render={<ToolbarButton iconOnly aria-label="Close" />} /></PopoverContent></Popover>;`,
          errors: [{ messageId: "closeByHand", data: { panel: "PopoverContent" } }],
        },
      ],
    });
  });
});

describe("prefer-toolbar-title — a title in a row is the row's own (RULES 2)", () => {
  it("runs", () => {
    tester.run("prefer-toolbar-title", preferToolbarTitle, {
      valid: [
        file(DIALOG, band),
        // A heading outside any toolbar is an ordinary heading.
        file("Heading, Stack", `<Stack><Heading>Billing</Heading></Stack>`),
        // A screen's own section heading is not its title.
        file("Heading, NavigatorScreen, Stack", `<NavigatorScreen title="Billing"><Stack><Heading>Current plan</Heading></Stack></NavigatorScreen>`),
      ],
      invalid: [
        {
          code: file("Heading, Toolbar", `<Toolbar><Heading size="4">Activity</Heading></Toolbar>`),
          errors: [
            {
              messageId: "title",
              data: { element: "Heading" },
              suggestions: [
                {
                  messageId: "suggestToolbarTitle",
                  output: file("Heading, Toolbar, ToolbarTitle", `<Toolbar><ToolbarTitle>Activity</ToolbarTitle></Toolbar>`),
                },
              ],
            },
          ],
        },
        {
          code: file("DialogTitle, Flex, Toolbar, ToolbarTitle", `<Toolbar><Flex><DialogTitle>Rename project</DialogTitle></Flex></Toolbar>`),
          errors: [
            {
              messageId: "title",
              suggestions: [
                {
                  messageId: "suggestToolbarTitle",
                  output: file("DialogTitle, Flex, Toolbar, ToolbarTitle", `<Toolbar><Flex><ToolbarTitle render={<DialogTitle />}>Rename project</ToolbarTitle></Flex></Toolbar>`),
                },
              ],
            },
          ],
        },
        {
          code: file("Heading, NavigatorScreen, Stack", `<NavigatorScreen title="Billing"><Stack><Heading>Billing</Heading><Text>Pro</Text></Stack></NavigatorScreen>`),
          errors: [{ messageId: "repeated", suggestions: 1 }],
        },
      ],
    });
  });
});

describe("no-escape-abuse — the repair, and the styles the theme owns (SETTLED \"The linter\")", () => {
  const box = (jsx: string) => file("Box, Button, Card, Text", jsx);
  it("runs", () => {
    tester.run("no-escape-abuse", noEscapeAbuse, {
      valid: [
        // A token reached through `style` is the documented escape.
        box(`<Card style={{ boxShadow: "var(--my-shadow)" }} />`),
        box(`<Card style={{ boxShadow: "none" }} />`),
        box(`<Text style={{ fontSize: "var(--font-size-3)", fontWeight: "var(--weight-medium)" }} />`),
        // A consumer's own element is their business.
        `const x = <p style={{ fontSize: 13, fontWeight: 600, boxShadow: "0 1px 2px #000" }} />;`,
      ],
      invalid: [
        {
          // Between two steps is a judgement, so the rule offers both and picks neither.
          code: box(`<Box style={{ padding: "13px" }} />`),
          errors: [
            {
              messageId: "ownedLength",
              suggestions: [
                { messageId: "suggestStep", data: { prop: "p", step: "4", px: "12" }, output: box(`<Box p="4" />`) },
                { messageId: "suggestStep", data: { prop: "p", step: "5", px: "16" }, output: box(`<Box p="5" />`) },
              ],
            },
          ],
        },
        {
          // The last property of several: the comma before it goes with it.
          code: box(`<Box style={{ width: "20rem", gap: 16 }} />`),
          errors: [{ messageId: "ownedLength" }],
          output: box(`<Box gap="5" style={{ width: "20rem" }} />`),
        },
        {
          // The prop is already set. Two answers would disagree, so the reader chooses.
          code: box(`<Box p="2" style={{ padding: "16px" }} />`),
          errors: [{ messageId: "ownedLength", suggestions: [] }],
          output: null,
        },
        {
          // A unit that is not pixels is not a step the file states.
          code: box(`<Box style={{ padding: "1rem" }} />`),
          errors: [{ messageId: "ownedLength", suggestions: [] }],
          output: null,
        },
        {
          // Not a layout: there is no prop to move it to.
          code: box(`<Button style={{ margin: "8px" }} />`),
          errors: [{ messageId: "ownedLengthRefused", suggestions: [] }],
          output: null,
        },
        {
          code: box(`<Card style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)" }} />`),
          errors: [{ messageId: "rawShadow", data: { value: "0 1px 2px rgba(0, 0, 0, 0.2)", element: "Card" } }],
        },
        {
          code: box(`<Text style={{ fontSize: "13px", fontWeight: 600 }} />`),
          errors: [{ messageId: "rawFontSize" }, { messageId: "rawFontWeight" }],
        },
        {
          code: box(`<Text style={{ fontWeight: "bold" }} />`),
          errors: [{ messageId: "rawFontWeight" }],
        },
      ],
    });
  });
});
