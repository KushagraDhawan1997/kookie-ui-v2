# How to write a chapter

The rules for `apps/docs/content` **and for every word a reader sees outside it**: the front
door (`app/(docs)/page.tsx`), the two index decks (`components/page.tsx`, `blocks/page.tsx`),
and every blurb in `app/(docs)/chapters.ts` and `app/(docs)/components/registry.ts`. Read this
before you write a chapter, a blurb, or a line on any of those pages.

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
- Wrong: `No motion.`
- Right: `When you hover, press or open something, the change shows at once, with no
  animation.`

A verbless opener fails a test. A fragment whose verb hides in a subordinate clause does not —
no test can catch that one, so it is on you.

**Say what the reader gets, not what the system contains.** "Seven app-level values, stated one
time at the root" describes the implementation. "A Theme sets eight values for your whole app"
tells a reader what to do with it.

**Never put a date, a version or a decision history in a blurb.** A reader has not seen an
earlier version. `docs/LOG.md` holds that.

## The front door and the indexes

The home page and the two index decks are not chapters, and they fail differently. A chapter is
read by somebody who has already decided to use this system. These are read by somebody who has
not. The fault here is rarely jargon. It is **altitude**: true sentences about the API, written
where a promise belongs.

**Write what somebody gets, not what the API contains.**

- Wrong: `You set a tone, a loudness and a size index. The theme resolves the colour, the length
  and the corner. There is no colour prop and no variant prop.`
- Right: `You say a button is the main action on the screen, or the one that deletes something.
  The theme turns that into a colour, a height and a corner, and keeps it right in light mode
  and dark, on a phone and on a desktop.`

Every sentence in the wrong version is true. "There is no colour prop" is unreadable to somebody
who arrived thirty seconds ago, because they do not yet know there could have been one. A
refusal only means something to a reader who was expecting the thing refused.

**The test.** Could a person who has never heard of this library decide, from this sentence,
whether they want it? If the sentence only pays off once you know the API, it belongs in a
chapter.

**Name one concrete thing.** "the main action, or the one that deletes something" is a button
anybody has seen. "a tone, a loudness and a size index" is three words they have not met.

**Do not name a family on the front door.** A ground, a surface, a control, a mark, a row and an
instrument are how this system thinks. They are the subject of a whole chapter, and a stranger
has met none of them. Link to that chapter instead.

**Do not explain the documentation.** "every chapter cites the specification, and a test resolves
each citation" describes how this site is built. A reader on the front door has not agreed to
care about that yet. Say what holds the rules, and stop.

**Never praise the document.** "these pages are honest about what that costs you" and "rather
than taking them on trust" both assert a virtue the reader has no way to check, and it is the
one claim a document cannot make about itself. State the cost and let them judge it.

- Wrong: `It is built to be correct rather than quick to adopt, and these pages are honest about
  what that costs you.`
- Right: `It has strong opinions and fewer ways out than you are used to, which is what keeps
  screens built months apart looking like one product.`

The same goes for the marketing adjectives — powerful, seamless, robust, elegant, intuitive —
and for "not just a component library". None of them survives the question "how would I check
that?"

**A card title is a heading.** The three claims on the front door are `h3`s, so every heading
rule below applies to them: no four-word verdict, no aphorism, and `X, not Y` only where X is a
plain answer. "Meaning, not appearance" and "Types, not advice" both read as the conclusion of
an argument the reader has not been given. A title that states the fact — "The theme decides how
it looks", "The rules are built into the types" — tells them what the card is about before they
read it.

**A sentence borrowed from a chapter is not automatically safe here.** "your twentieth screen
costs about what your second one did" is earned in
[Why Kookie exists](/philosophy/why-kookie-exists), where three paragraphs first establish that
the bill for inconsistency arrives around the twentieth screen. Lifted onto the deck it is a
riddle: a reader who has not read those paragraphs cannot tell what "costs" is measuring. Check
what a sentence was leaning on before you move it.

## The register: write to a reader, not to the team

This is the rule the whole document broke, and no test can catch it. Every sentence below is
grammatical, short and active. Every one is also unreadable to a person who did not build the
system. The fault is register, not grammar.

### Read the reference page first

`content/start/principles.mdx` is the reference for cadence. Read it before you write a
chapter, and match the way its sentences are built. The rules below tell you what to avoid. The
reference page shows you what to do, and a sample carries things that no rule states.

The reference page exists because rules alone did not work. Four drafts of that chapter passed
every rule in this guide and were rejected anyway, and one sample paragraph fixed the register
in a single pass. When a draft keeps failing on register, add a sample rather than a seventh
rule.

Copy these habits from it.

- **Subordinate a second fact instead of starting a new sentence.** "A fingertip is about 10
  millimetres across, which informs the 44-point minimum on Apple platforms." Three sentences
  that each restart with the same subject read as a chant.
- **Use ordinary connectives.** because, while, whereas, conversely, rather than. They carry the
  relation between two facts, so you do not have to state it.
- **Use a stronger, more precise verb.** Replace "is", "has" and "takes" with a verb that says
  what the component does. `A Card takes a material` becomes `A Card accepts a material prop`.
  informs, replicates, conceals, reflects, records, determines, accepts.
- **Keep a list in parallel structure.** Every item in a list takes the same grammatical shape,
  which is what makes a list faster to read than a paragraph. `A menu selects an action. A
  select selects a value` becomes `A menu triggers an action. A select chooses a value`. The
  same applies to bold labels: three labels that read verb, adjective, adjective are not a list.
- **Remove the echo.** A word repeated inside one sentence or one paragraph slows a reader
  down. `The kind of a component decides which props it takes` becomes `A component's category
  determines which props it accepts`.
- **Write a bullet as a label and a definition.** `**Tap targets:** A fingertip is about 10
  millimetres across.` A label scans. A full sentence in bold does not. Use bold labels and
  bullets consistently inside a section, so a reader sees the relationship between the items
  without reading them.

Do not write a sentence in the second person only to sound direct. "The space between two
elements changes how they are interpreted" is correct, and rewriting it around "you" makes it
worse.

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

### What is checked, and what is not

`app/(docs)/prose.test.ts` runs on every commit. It reads the chapters, and it reads the five
files outside `content/` that carry reader prose — the front door, the two index pages,
`chapters.ts` and `registry.ts` — with their code comments stripped first, because a comment is
written to the next maintainer and may say "the mark ladder". It catches the half of these rules
that is a word rather than a shape:

- an internal noun a reader has not met (rung, veil, ladder, ramp, posture, the seal)
- a component acting like a person (prices, rides, owes, stands down)
- `by construction`, `by design`, `by derivation`
- filler: simply, of course, it turns out, said plainly
- "a call site" and "the reader", where the chapter means you
- a date, which is development history and belongs in `docs/LOG.md`
- the document praising itself: "honest about", "on trust", "we believe", "carefully crafted"
- a marketing adjective with no measurement behind it: powerful, seamless, robust, elegant,
  intuitive, delightful
- a marketing phrase: "out of the box", "under the hood", "first-class", "not just a"
- a chapter that says "you" fewer than two times

It cannot catch a verdict, a riddle, two abstractions equated, or a sentence written at the
wrong altitude, because those are shapes and not strings. "The mark ladder is the line box" is
six ordinary words in an ordinary order, and "There is no colour prop and no variant prop" is a
true sentence that was wrong only because of where it was printed. That half is yours, and it is
the half worth reading this section for.

## Language: ASD-STE100 Simplified Technical English

Every page on this site is written in ASD-STE100 Simplified Technical English (STE). STE is a
controlled language for technical documents. It makes text easy to read for people who do not
speak English as a first language, and easy to translate. The rules below are the STE rules we
use. The register rules above still apply.

Words:

- Use simple, common words. Use one word for one meaning, and use it the same way every time.
  If you write "panel", do not write "pane", "box" and "sheet" for the same thing.
- Use a verb as a verb and a noun as a noun. Do not make a verb from a noun ("to gate", "to
  surface", "to host") when a simple verb exists.
- Use the simple tenses: present, past and future. Do not use "-ing" forms as verbs where a
  simple form is possible.
- Use articles ("a", "an", "the") before nouns. Do not write telegraphic text.
- Do not use more than three nouns together. Break long noun groups with "of", "for" or "in".
- Do not use slang, idioms, metaphors or figures of speech.

Sentences:

- Write one topic in each sentence.
- An instruction is 20 words or fewer. A description is 25 words or fewer.
- Use the active voice. Name the thing that does the action.
- Write instructions as commands: "Set `size` to change the height." Put a condition first:
  "If the field is empty, the button is disabled."
- Do not leave out words to make a sentence shorter. Keep "that", "which" and the verb.
- Use a vertical list when a sentence has more than two or three items.

Paragraphs:

- Write one topic in each paragraph. Put the topic in the first sentence.
- A paragraph is six sentences or fewer.
- Start with the fact. Do not start with an introduction to the fact.

### Conventions

- **Use contractions where a normal writer would.** "There's no config file", "it doesn't write
  an appearance of its own". The full form everywhere reads as a person performing formality —
  the earlier no-contractions rule came from ASD-STE100 and is overturned (Kushagra's own edit:
  "who writes 'There is no config file and no build plugin, because…'"). Keep the full form
  only where the contraction lands wrong in your ear.
- **Say "no X or Y", not "no X and no Y".** The doubled negative is the rhetorical form.
- **A list matches its sentence's grammar.** After "takes three steps:", write "adding,
  importing, and wrapping", not the bare imperatives "add, import, wrap".
- **Use the ordinary precise word, not a folksy phrase.** "Calculated beforehand", not "worked
  out ahead of time". Plain is not the same as homespun.
- **Write complete phrases.** "All eight questions are optional, and the default answers are
  suitable", never "All eight are optional, and the defaults are right". Clipping the nouns out
  of a sentence is not STE. Short sentences are correct; clipped sentences are not.
- **Capitalise a heading, always.** A heading is a sentence-case phrase, never a lowercase
  identifier: write `### Appearance`, not `### appearance`, even when the section is about a
  prop of that name. Name the prop in the first line instead, where the backticks make it a
  code span and not a title.
- **Write "judgment", not "judgement".** The corpus uses the first spelling and no instance of
  the second.

Product names keep their own capitalisation even at the start of a sentence. It is `shadcn/ui`,
never `Shadcn/UI`. If the lowercase opening reads badly, rewrite the sentence rather than the
name.

## The razor

Before any rule about how a sentence is written, ask whether it should exist: **does the person
doing this task need it?** A sentence that exists to make the library look good, to restate its
neighbour, or to savour a fact gets deleted whole, not reworded. Most bad sentences in this
corpus were never badly written — they were unnecessary. "The file stays the same size however
many components you use" is grammatical, true, and gone.

## Revising a draft, and revising these rules

Four faults appear when somebody revises an existing chapter, or revises the rules and tests
behind it.

**Compression loses facts, so read a polished draft for meaning as well as for rhythm.** A pass
that tightens sentences also generalises them, and a generalisation can contradict the list
beneath it. One revision replaced "the thing you act on" with "interactive elements" in
`foundations/depth.mdx`, directly above a list of interactive components that cast no shadow.
Check every claim that got shorter.

**Do not delete a reason while tightening a sentence.** "A smaller thing casts a smaller shadow,
or it looks swollen" reads long, and the second clause is why the rule exists. A rule with its
reason removed is a rule a later writer will delete.

**A correction is a fix for one fault, not a law.** "Write flat subject-verb-object sentences"
was the correct fix for clever, quotable prose. Applied to every sentence it produces three
short sentences that each restart with the same subject, which reads as a chant. Every
instruction in this guide has a fault it was written for, and applying it past that fault
creates a new one.

**Calibrate a test against the fault, not against the corpus.** `prose.test.ts` required a
chapter to say "you" five times, and five was chosen because five was what the thinnest chapter
happened to carry. The fault it was written for is a chapter with no reader in it, which a floor
of two still catches, and the higher floor pushed second person into sentences that read better
without it. When you add a floor, set it from the smallest value that fails the defect.

## Register: seven habits that keep coming back

The rules above are about words. These are about the shape of a sentence. They are the faults a
reviewer finds most often, and each one has a different fix.

**1. Do not put a comma tail on a heading.** The head names the thing. A tail that explains
the head is a subtitle glued on with a comma.

- Wrong: `## Three claims, and where to read about each`
- Right: `## Three claims`
- Wrong: `## Size prices the type, and render names the document`
- Right: `## Size sets the step, render sets the element`

`X, not Y` is a different construction, and it is allowed **only when X says what the thing is
or does, in ordinary words**. "An index, not a measurement" passes, because "an index" is a
plain answer on its own. "Meaning, not appearance" does not: it is two abstractions with no verb
between them, so the correction lands before a reader has anything to correct. `X, and Y` crams
two facts into one heading.

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

**5. Explain, do not perform.** The compressed, quotable sentence is this project's house
voice, and it does not survive contact with a reader. A docs sentence spends words to be clear,
not saves them to be memorable. Ordinary connectives — "while", "alternatively", "however",
"finally" — are allowed to do their ordinary work, and one idea per sentence beats three ideas
in a triad.

- Wrong: `Kookie sorts components by what they do, and styles them second. Every rule in the
  system follows from that order: which props a component takes, which ones it refuses, and
  which component you reach for when two look alike.`
- Right: `Kookie organises its components by what they do, rather than by how they look. Two
  components can look almost identical and still do different jobs. When that happens, they are
  kept separate, each with its own name and its own props.`

Every clause in the wrong version is a riddle to a first-time reader: "which ones it refuses"
and "when two look alike" refer to things the page has not introduced yet. **Never make a claim
before the thing it is about has been shown.** If the evidence is a section below, point at the
example instead of asserting the thesis.

**6. No kicker sentences.** A section ends when the explanation ends. The clever closing line —
a manufactured symmetry, a callback, a verdict — is the signature of writing that performs.

- Wrong: `In return, your twentieth screen takes about as long to build as your second.`
- Right: `In return, the system stays consistent as your app grows, because its decisions are
  enforced rather than left to memory.`

**7. Name a link as what it is.** A bare chapter title cannot be the actor of a sentence:
"Navigation shows the shapes it can take" reads as the concept of navigation doing something.
Write "the Navigation chapter shows how to build one", the way you would say it aloud.

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
