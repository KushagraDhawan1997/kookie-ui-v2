# How to write a chapter

The rules for `apps/docs/content`. Read this before you write a chapter.

## Language: Simplified Technical English

These pages follow ASD-STE100. Apply these rules to every sentence.

- **Use the active voice.** Write "the theme resolves the colour", not "the colour is
  resolved by the theme".
- **Write short sentences.** Use a maximum of 20 words in an instruction and 25 words in a
  description. One idea in each sentence.
- **Use simple words.** Use the same word for the same thing every time. Do not use a
  different word to add variety.
- **Do not use metaphors.** Do not write that a value is "frozen", that a rule "bites", or
  that a system "argues". Write what the code does.
- **Do not use filler.** Delete "simply", "just", "of course", "it turns out", "the thing
  is", and "said plainly".
- **Do not write a preamble.** Start with the fact. Do not tell the reader what the chapter
  will cover.
- **Use the present tense** for what the system does now.
- **Use articles.** Write "the control", not "control".
- **Do not use more than three nouns together.** Break up long noun groups.
- **Give each paragraph one topic.** Use a maximum of six sentences.

## What belongs in a chapter, and what does not

A chapter tells a reader what a thing is, when to use it, what it refuses, and how to write
the code. It is not a record of how the system reached its current shape.

**Cut all four of these.**

- **Development history.** Do not write "the specification once held a four-level ladder", "the
  team removed it", or "the first design gave each family an offset". Nothing has shipped, so
  no reader has seen an earlier version. `docs/LOG.md` holds this history.
- **Defect archaeology.** Do not quote audit findings. "Wrong in 21 of 24 cells, by up to 9
  pixels" shows that the team measured. It does not help a reader build a screen.
- **Arguments against a design nobody proposed.** A section titled "Why there is no per-family
  ladder" answers an objection that only the team has. State the rule instead.
- **Internal names.** Do not write "the team", "a reviewer", "the audit" or "the law". Write
  what the system does.

**Keep a reason only when it changes what the reader types.**

- Keep: "Set `depth` once, at the root. There is no per-card shadow prop." The reader stops
  looking for the prop.
- Cut: "The team removed the ladder after the first visual review." The reader does nothing
  differently.

**Show the code doing real work.** A fence that assigns one prop teaches nothing. At least one
fence in each chapter must build something a reader recognises: a form row, a toolbar, a card
with a title and an action. Aim for 8 to 15 lines in that fence.

## What these pages are

These pages are a guideline document. They are not an API reference. The reference is
`/components`, and a script generates it from the types.

A chapter answers three questions: when to use a thing, why the system works this way, and
what the result must look like. The reader composes a screen. The reader does not look up a
prop.

The content is not new. `docs/DECISIONS.md`, `docs/THESIS.md` and `docs/LOG.md` hold the
decisions. A chapter states those decisions for a reader who did not make them.

Do not invent a rule. If you cannot find the decision in the specification, record a gap in
`docs/LOG.md`.

## Structure

- **Do not write a `#` heading.** The registry supplies the page title. A second `h1` fails
  the law.
- Start with two or three sentences that state the subject.
- Use `##` for a section and `###` for a subsection. Do not go deeper. The table of contents
  reads `##` and `###` only.
- Give each heading a different name. The anchor is the heading text, and two identical
  headings make one anchor.
- Write 700 to 1200 words.

## Rules and reasons

State the rule first. Then state the reason. Then state what the system refuses.

Mark each reason as one of two kinds:

- A **measured limit**. Cite the source: Fitts's law, WCAG, APCA, the Gestalt principles, or
  the 44-point touch minimum.
- A **judgment**. Say that it is a judgment.

Do not present a judgment as a measured limit.

## Code

- Label every fence. Use one of: `tsx`, `ts`, `jsx`, `js`, `css`, `json`, `bash`, `html`,
  `mdx`. The build fails on any other label.
- Every prop, token and component name in a fence must exist. Check
  `packages/ui/src/index.ts` and `packages/ui/src/tokens/tokens.css`.
- Write at least one fence in each chapter that builds something real. Aim for 8 to 15
  lines in it. A fence that sets one prop teaches nothing.
- Keep a second fence short when it shows one contrast, such as the wrong code beside the
  correct code.
- Show the wrong code and the correct code together where this helps.
- Do not write a colour value, a pixel value, a `variant` prop or a margin prop.

## Names

- Write a public token as the specification writes it: `--space-4`, `--radius-control-2`,
  `--accent-solid`.
- Do not write a `--kui-*` name. These names are private and can change.
- Write "size 3". Do not write "16px", unless the measured value is the subject.
- Write a component name exactly: `TextField`, not "text field".

## What each chapter must contain

1. The rule.
2. The reason, marked as a measured limit or a judgment.
3. What the system refuses, and what to use instead.
4. At least one code fence that builds something real.
5. A `spec` entry in `chapters.ts` that names the DECISIONS sections.

## Rules that no chapter can contradict

- A component does not set outer spacing. Use `<Box m>`.
- There is no `variant` prop. `tone` states meaning. `emphasis` states loudness.
- A component does not set a shadow.
- The weight ladder stops at semibold.
- You choose the meaning. The theme resolves the colour.
- CSS resolves every state. No JavaScript runs on hover, press or focus.
- Do not use size 1 on a composed screen. Use the muted or faint ink role at size 2 or 3.
