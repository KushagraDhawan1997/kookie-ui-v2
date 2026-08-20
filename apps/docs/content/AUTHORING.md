# Writing a chapter

The house style for `apps/docs/content`. Read this before writing one; it is short on purpose.

## What these pages are

A **guideline document**, not an API reference. The reference is `/components`, generated from
the types and the registry. A chapter answers *when*, *why*, and *what it should feel like*.
The reader is someone composing a screen, not someone looking up a prop.

Almost nothing here is new thinking. The canon already exists in `docs/DECISIONS.md`,
`docs/THESIS.md` and `docs/LOG.md`; a chapter is that canon **re-voiced for a person who has
not been in the room**. Where the spec says "the system refuses two louds", the chapter says
"one focal action per surface, and here is why". Same decision, different register.

If you find yourself inventing a rule that is not in the spec, stop. Either you have found a
gap worth recording in `docs/LOG.md`, or you are about to publish something the code does not
enforce — and this system's whole claim is that its guidelines are load-bearing.

## Voice

- **Normative, not descriptive.** "Rank actions with emphasis" beats "emphasis is the axis
  that ranks actions."
- **Say the reason.** Every rule that is a *floor* cites what makes it one (Fitts, WCAG/APCA,
  the 44pt anthropometry, Gestalt). Every rule that is *taste* says so plainly. Dressing taste
  as objective is the one sin this system names twice (THESIS §4).
- **Plain sentences.** No arrow chains, no `A → B` shorthand, no invented abbreviations. Spell
  the technical terms out. A reader should never have to scroll up to decode a label.
- **Second person for instructions**, third for the system. "You choose meaning; the theme
  resolves the pigment."
- **No hedging and no hype.** Never "simply", "just", "powerful", "beautiful", "delightful".
  Never promise what the system does not do.
- **Refusals are content.** When the system will not do something, say so, say why, and say
  what to do instead. That paragraph is usually the most useful one on the page.

## Structure

- **No `#` heading.** The page title comes from the registry; a chapter that opens its own
  `h1` produces two, and the docs law fails on it.
- Open with **two or three sentences of orientation** before the first `##`. No preamble
  about what the chapter will cover.
- `##` for sections, `###` for subsections. Nothing deeper — the table of contents reads `##`
  and `###` only, and a page needing `####` wants to be two pages.
- **Every heading unique on the page.** Anchors are slugified titles and there is no
  de-duplicating counter, by design.
- Aim for 700–1,200 words. A chapter that runs past that is usually two chapters.
  (This said 400–900 until 2026-08-21, and every chapter in the first batch overran it while
  meeting its brief — the guidance was wrong, not the chapters. A foundations chapter owes
  three or four mechanisms with a stated reason each, and that does not fit in 900 words.)

## Code

- Fences must be labelled, and the language must be one of: `tsx`, `ts`, `jsx`, `js`, `css`,
  `json`, `bash`, `html`, `mdx`. An unlabelled or unknown fence fails the build.
- **Samples must be real.** Every prop, token and component name in a fence has to exist. The
  fastest way to check is `packages/ui/src/index.ts` and the component's own `.tsx`.
- Show the *shape*, not a whole screen. Three to twelve lines.
- Prefer showing a **contrast** — the composed answer beside the thing people reach for
  instead — over a lone correct snippet.
- Never invent a `variant`, a `margin` prop, a raw colour, or a pixel value. If a sample needs
  one, the sample is wrong.

## Tokens and names

- Public tokens are unprefixed and appear as written in the spec: `--space-4`,
  `--radius-control-2`, `--accent-solid`. Private `--kui-*` names are not public API and do
  not belong in a chapter.
- `size` is an **index**, never a measurement. Say "size 3", never "16px", unless the point is
  the measured value itself.
- Component names are exact and PascalCase: `TextField`, not "text field" or "Textfield".

## What every chapter owes

1. The **rule**, stated once, early, and unmissable.
2. The **reason** — floor or taste, named as one.
3. The **refusal** the rule implies, and the alternative.
4. At least one **fence** showing the rule in real code.
5. A `spec` entry in `chapters.ts` naming the DECISIONS sections it publishes. A chapter that
   publishes nothing is either about nothing or about a decision that never made it into the
   spec, and the coverage law treats both as failures.

## Things this system believes, which chapters should never contradict

- Components own no outer spacing. The escape is `<Box m>`.
- There is no `variant`. Meaning is `tone`; loudness is `emphasis`.
- Elevation is not a component-level choice. No component takes a shadow prop.
- `bold` does not exist. Semibold tops the weight ladder.
- Appearance is resolved output: you choose meaning, the theme resolves the pigment.
- State styling is CSS. No JavaScript runs on hover, press or focus.
- Size 1 is retired from composed surfaces — "matters less" is what the muted and faint ink
  roles say at 14 or 16.
