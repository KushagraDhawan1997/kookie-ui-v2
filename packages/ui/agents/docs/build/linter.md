# Linter

The linter runs in your editor while you write, and it runs for an AI agent before the agent
finishes. Each report has three parts: what is wrong, what to use instead, and a link to the
page to read.

It ships in the package, so its rules always match the version of Kookie you have installed.

## Set it up

The linter is an ESLint plugin. Add it last in your flat config, after the entry that sets your
TypeScript parser, because the plugin brings no parser.

```js title="eslint.config.mjs"
import tseslint from "typescript-eslint";
import kookie from "@kushagradhawan/kookie-ui-react/eslint-plugin";

export default [
  { files: ["**/*.tsx"], languageOptions: { parser: tseslint.parser } },
  ...kookie.configs.recommended,
];
```

The [`init` command](/build/agents) adds these two lines for you when your project already has
a flat config.

Oxlint runs the same rules. Give the plugin the name `kookie`, then turn on the rules you want.

```json title=".oxlintrc.json"
{
  "jsPlugins": [
    { "name": "kookie", "specifier": "@kushagradhawan/kookie-ui-react/eslint-plugin" }
  ],
  "rules": { "kookie/prefer-field-row": "warn" }
}
```

## Choose a set

There are two sets, and they hold the same rules.

- **`recommended`:** A report is an error only when the code is always wrong. It is a warning
  when a fair exception exists. Use this set in a project that people write by hand.
- **`strict`:** Every report is an error. Use this set for an AI agent, or in a new project
  that has no old code to bring across.

```js
...kookie.configs.strict,
```

## What it checks

The linter reads one file at a time. It reports only what that file shows, and it says nothing
when it cannot read the code, for example when a dialog takes `{children}` or holds a component
of your own.

### Composition

| Rule | What it reports | Level | Fix |
| --- | --- | --- | --- |
| `prefer-field-row` | Two or more fields with a text box, side by side in a `Grid` or a `Flex` | Warning | Offers `FieldRow` |
| `no-dialog-cancel` | A Cancel button in a dialog that has a Close button | Warning | Offers to remove it |
| `prefer-toolbar` | A dialog, sheet or popover whose Close button or top row is placed by hand | Warning | None |
| `prefer-toolbar-title` | A heading placed by hand in a `Toolbar`, or a heading that repeats a Navigator screen's title | Warning | Offers `ToolbarTitle` |

```tsx
// Reported: the boxes of the two fields collide.
<Grid columns="2" gap="3">
  <Field>…</Field>
  <Field>…</Field>
</Grid>

// Correct: FieldRow sets the space, and stacks the fields on a narrow window.
<FieldRow>
  <Field>…</Field>
  <Field>…</Field>
</FieldRow>
```

### Style written by hand

| Rule | What it reports | Level | Fix |
| --- | --- | --- | --- |
| `no-escape-abuse` | A utility class such as `p-4` on a Kookie component | Warning | None |
| `no-escape-abuse` | A colour written in `style`, such as `#0b0b0b` | Warning | None |
| `no-escape-abuse` | A length in `style` for padding, margin or gap | Warning | Fixes it, or offers two steps |
| `no-escape-abuse` | A `box-shadow`, `font-size` or `font-weight` written in `style` | Warning | None |
| `no-refused-attribute` | A `data-tone` or `data-size` attribute in place of the prop | Error | None |
| `no-refused-prop` | A `color` prop, or a refused prop inside a spread | Error | None |

A token in `style` is correct, so `style={{ background: "var(--color-surface)" }}` gets no
report. A width or a height in `style` is also correct, because Kookie has no scale for them.

### Missing pieces

| Rule | What it reports | Level | Fix |
| --- | --- | --- | --- |
| `require-accessible-name` | An icon-only button with no `aria-label` | Error | None |
| `require-field-label` | A `Field` that holds a control and no `FieldLabel` | Error | None |
| `require-dialog-title` | A dialog or a sheet with no title | Warning | None |

In a TypeScript file the type checker already reports an icon-only button with no `aria-label`.
The linter adds the cases the type checker cannot see: a JavaScript file, and a label that is an
empty string.

## How a fix works

A rule changes your code in one of three ways.

- **It fixes the code by itself** when there is exactly one correct answer. `padding: "16px"` on
  a `Box` becomes `p="5"`, because 16px is step 5 of the space scale. Run ESLint with its fix
  flag, or save the file if your editor fixes on save.
- **It offers a fix for you to choose** when the answer is a judgement. `padding: "13px"` is
  between two steps, so the rule offers `p="4"` and `p="5"`. Your editor shows the choices.
- **It only reports** when it cannot know the answer. It cannot write the label of a button.

A step of the space scale follows the theme's density. The fix gives the same length at the
default density, and a length that follows the density in a denser theme.

## Turn a rule off in one place

Some code breaks a rule for a good reason. Turn the rule off for that line, and give the reason
after two hyphens.

```tsx
// eslint-disable-next-line kookie/no-escape-abuse -- the colour is the customer's brand colour
<Box style={{ background: "#ff5a1f" }} />
```

A comment that gives no reason is an error in both sets (`require-disable-reason`). A person who
reviews the code then sees each exception and why it is there.

## Run it for an AI agent

An agent follows a lint error more reliably than a rule in a document. There are two ways to
make an agent run the linter.

- **The rules file:** The block that `init` writes to `AGENTS.md` or `CLAUDE.md` tells the agent
  to run the linter before it says the work is done.
- **A hook for Claude Code:** Add the hook flag to the `init` command, as below. The hook runs the linter each
  time Claude Code tries to finish, on the files it changed. If the linter reports a problem,
  the hook sends the report to the agent, and the agent fixes the code. A warning stops the
  agent too.

```bash
npx @kushagradhawan/kookie-ui-react init --hook --write
```

The command writes `.claude/hooks/kookie-lint.mjs` and adds one entry to
`.claude/settings.json`. It keeps everything else in that file. To remove the hook, delete the
script and its entry.

## What the linter cannot see

The linter reads code. It does not see the page. It cannot tell that two cards from different
files end up one inside the other, or that a gap looks wrong on the screen. For those, read the
[Composition](/start/composition) chapter and look at the screen.
