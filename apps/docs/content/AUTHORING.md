# How to write a chapter

The rules for `apps/docs/content` **and for every blurb in `app/(docs)/chapters.ts` and
`app/(docs)/components/registry.ts`**. Read this before you write a chapter or a blurb.

## Blurbs

A blurb is the sentence under a page's title and the line under its name in the index. It is
the most-read prose on the site, and until 2026-08-25 it was the worst, because this guide did
not cover it and the test that claimed to check it only measured length.

**Write a blurb as a sentence that says what the page is for.** Not a headline. Not a list of
noun phrases. If you read it aloud and it does not finish a thought, it is not a blurb.

- Wrong: `The house style. One loud control, different gaps for different groups, a type
  ladder, and tone used as a vocabulary.`
- Right: `Correct components do not add up to a good screen on their own. These are the rules
  for putting them together, and the builder checks most of them for you.`
- Wrong: `The package, one stylesheet, a Theme at the root, and the script that sets dark mode
  before the first paint.`
- Right: `Add the package to your app, import one stylesheet, and wrap your app in a Theme. You
  also add a small script so dark mode is correct on the first paint.`
- Wrong: `Two clocks.`
- Right: `Motion runs on two clocks. A colour change lands on the very first frame, and
  anything that moves follows a spring.`

A verbless opener fails a test. A fragment whose verb hides in a subordinate clause does not —
no test can catch that one, so it is on you.

**Say what the reader gets, not what the system contains.** "Seven app-level values, stated one
time at the root" describes the implementation. "A Theme sets seven values for your whole app"
tells a reader what to do with it.

**Never put a date, a version or a decision history in a blurb.** A reader has not seen an
earlier version. `docs/LOG.md` holds that.

## The register: write to a reader, not to the team

This is the rule the whole document broke, and no test can catch it. Every sentence below is
grammatical, short and active. Every one is also unreadable to a person who did not build the
system. The fault is register, not grammar.

**1. Do not write a verdict.** A sentence that sounds like a conclusion is not teaching.

- Wrong: "A scale with an escape stops being a scale."
- Right: "There is no `size="2.5"`. If one call site could invent a value, the scale would no
  longer hold across the app."

**2. Do not write a riddle.** If a phrase only makes sense once you already know the answer,
cut it.

- Wrong: "A mark's target grows to the container it never had."
- Right: "A checkbox is small, so its tappable area extends past the box you can see, out to
  the size a Button of the same size would occupy."
- Wrong: "Code refuses from the other side."
- Right: "`Code` does the opposite: its `size` is optional."

**3. Do not equate two abstractions.** "X is Y" teaches nothing when the reader knows neither.

- Wrong: "The mark ladder is the line box."
- Right: "A checkbox is exactly as tall as one line of the text beside it."

**4. Do not let components act like people.** Components do not read, refuse, own, leave,
keep, take a rule or answer a question.

- Wrong: "The height ladder is the geometry of a container, so these four leave it."
- Right: "A checkbox has no text inside it, so it does not use the control height. It uses its
  own set of sizes."

**5. Name a thing the first time you use it.** "the reading ramp", "the handheld type band",
"a designed set", "a cell", "one shared ladder" — a reader has met none of these. Either
explain the term in the sentence that introduces it, or use a plain word.

**6. Write to "you".** These pages are instructions. Apple writes "Use a slider when you want
people to choose a value from a range." Write the same way. Do not write "one", "a call site"
or "the reader" where you mean the person reading.

**7. Open with what the thing does, not with what it is not.**

- Wrong: "`size` is an index into a designed set, not a length."
- Right: "`size` picks a step, not a measurement. `size="2"` means the second step on a
  scale, and the theme decides what that step is worth."

**The test.** Read the paragraph out loud to somebody who has not used this library. If you
have to add a sentence of explanation as you read, the paragraph is not finished.

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

## Register: four habits that keep coming back

The rules above are about words. These four are about the shape of a sentence. They are the
faults a reviewer finds most often, and each one has a different fix.

**1. Do not put a comma tail on a heading.** The head names the thing. A tail that explains
the head is a subtitle glued on with a comma.

- Wrong: `## Three claims, and where to read about each`
- Right: `## Three claims`
- Wrong: `## Size prices the type, and render names the document`
- Right: `## Size sets the step, render sets the element`

`X, not Y` is a different construction and it is allowed. "An index, not a measurement"
defines by exclusion and it is short. `X, and Y` crams two facts into one heading.

**2. Name the thing.** Do not describe a product instead of naming it.

- Wrong: "A copy-paste component collection has no centre."
- Right: "shadcn/ui gives you source code to copy into your project."
- Wrong: "Tools with no centre won."
- Right: "shadcn/ui and Tailwind are both quick to adopt. Neither can hold a rule in one place."

A reader cannot check a claim about a thing you refuse to name.

**3. Do not bolt a qualifier onto a claim.** ", by construction", ", by design" and ", by
derivation" assert that something is necessarily true without showing why. Either show why or
delete the tail.

**4. Do not write an aphorism as a heading.** A heading says what the section tells the reader
to do. It is not a four-word verdict.

- Wrong: `## Tone is a vocabulary`
- Right: `## Use a tone for its meaning`
- Wrong: `## A ladder can refuse`
- Right: `## Ask whether a ladder fits before you add size`

**Vocabulary that is banned because it is invented.** Do not write that a component "prices" a
value, "rides" a media query, "owes" a rule, or "stands down" a colour. Do not write "rung",
"veil", "posture", "seal", "bed" or "dress" as nouns for parts of the system. These are the
internal words of `docs/DECISIONS.md`, and a reader outside the project cannot decode them.

**Do not overuse "states".** It was doing six jobs at once: means, shows, sets, says, declares
and tells. Pick the one you mean.

- "the corner states nothing" → "the corner tells you nothing"
- "each density level states its own four heights" → "each density level sets its own four heights"
- "a tone states a meaning" → "a tone carries a meaning"
- "the shape states the role" → "the shape carries the role"

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
- There is no `variant` prop. `tone` is meaning. `emphasis` is loudness.
- A component does not set a shadow.
- The weight ladder stops at semibold.
- You choose the meaning. The theme resolves the colour.
- CSS resolves every state. No JavaScript runs on hover, press or focus.
- Do not use size 1 on a composed screen. Use the muted or faint ink role at size 2 or 3.
