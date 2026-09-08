/**
 * THE REFUSALS, SPELLED SO THE COMPILER CAN SAY THEM (2026-09-07).
 *
 * This system is defined as much by the props it does not have as by the ones it does, and
 * until now a call site that reached for one got nothing to act on. Measured, before this
 * file existed: `<Button variant="solid" m="4">` produced ONE anonymous `TS2322` over the
 * whole props object, naming neither offending prop and offering no alternative — and the
 * cheapest repair from that text is not "use `emphasis`", it is "stop passing props and use
 * `className`", which lands the writer in the one hole nothing in this repo checks.
 *
 * WHO THIS IS FOR. A person reads the reference; a model writing code in someone else's repo
 * usually does not, and the two things it cannot skip are the `.d.ts` it resolves out of
 * `node_modules` and the diagnostic it repairs from.
 *
 * AND IT IS NOT THE SAME FACT AS THE REGISTRY'S REFUSALS, which is worth stating because an
 * earlier draft of this comment claimed a law bound the two and no such law exists — nor can
 * the one it described be written. The documentation registry states a refusal as a SENTENCE
 * ("A horizontal orientation", "`tone` and `emphasis`"), because a reader meets prose and not
 * a symbol; it stores no symbol to compare against. What binds them in practice is the other
 * direction: `system/agent/registry-refusals.ts` mines backticked identifiers out of that
 * prose so the snippet checker can act on it, and the docs suite drives one end to end. A
 * refusal spelled here and nowhere in the registry is a refusal the reference does not
 * explain, and that gap is caught by a person reading the page, not by a law.
 *
 * THE SENTENCES ARE VALUES AND THE TYPES DERIVE FROM THEM (2026-09-07, the audit). They were
 * written as string literal types alone, which meant the only way for anything else to read
 * one was to parse this file: `@kookie-ui/mcp` scraped it with a regex at build time, and the
 * documentation site — which runs in a browser and cannot read a file at all — simply did not
 * have them, so its `check_snippet` tool answered "No problems found" to
 * `<Button asChild m="4" as="a" highContrast />`. Two surfaces, one name, opposite answers,
 * which is the failure the shared checker exists to prevent arriving one layer down. A `const`
 * with `as const` is a string literal type as well as a value, so one table now serves the
 * compiler, the server and the browser, and the scrape is deleted.
 *
 * THE SPELLING WAS MEASURED, not chosen. Three candidates, one file, real `tsc` output:
 *
 *   `variant?: never`                       -> "Type 'string' is not assignable to type
 *                                              'never'". Nothing to act on, and it reads as
 *                                              though the prop exists with a bad value.
 *   `variant?: M | undefined`               -> prints the message, and the message is then a
 *                                              LEGAL VALUE: `variant="KookieUI has no…"`
 *                                              compiles, and a component that spreads its rest
 *                                              props lands the sentence on the DOM.
 *   `variant?: Refused<M>` (a branded type) -> prints the same message, and NO string is
 *                                              assignable, so the sentence can never be a
 *                                              value and can never reach an element.
 *
 * The third is strictly better than the second and it is what ships. The brand is a unique
 * symbol with no exported constructor, so nothing outside this file can build one.
 *
 * INTERSECTION, NEVER `Omit`. These are mixed into a component's props with `&`. That matters:
 * `ButtonProps` is a discriminated union (`iconOnly: true` requires an accessible name), and
 * `Omit` over a union collapses it, which would silently delete a shipped guarantee.
 *
 * A NAME THE PLATFORM OWNS CANNOT BE REFUSED IN THE TYPE, and `color` is the one (2026-09-07,
 * the audit; this file previously carried `color?: string & Refused<…>` under a comment
 * claiming it had been "measured both ways" — it had been measured one way). The direction
 * that was measured is a Kookie component spreading its own rest props ONTO a `<div>`, where a
 * bare brand fails `color?: string` in fifty files. The direction that was not is a CONSUMER
 * spreading a native element's props INTO one of ours, which is the ordinary wrapper every
 * React codebase has:
 *
 *   function SaveButton({ pending, ...rest }: React.ComponentPropsWithoutRef<"button">) {
 *     return <Button loading={pending} {...rest}>Save</Button>;
 *   }
 *
 * Measured: with `color` declared as `string & Refused<…>` that stops compiling on all 143
 * components, with a five-level "not assignable" wall naming a prop the author never wrote and
 * advising `tone`, which does not repair a spread — and the cheapest repairs from that text are
 * `{...(rest as any)}` and dropping to `className`, the exact hole this file exists to close.
 * ANY unsatisfiable declaration of `color` breaks it, `never` included, so there is no third
 * spelling to find: a prop React's own `HTMLAttributes` carries has to stay assignable inbound.
 *
 * So `color` is not here. Each component's own `Omit<…, "color">` already keeps it out of the
 * props type, which is what a direct `color="red"` still fails against — measured, the
 * diagnostic names the prop ("Property 'color' does not exist on type …"), it simply carries
 * no escape. The escape moved to the ESLint plugin's `no-refused-prop`, which reads
 * `PLATFORM_OWNED_REFUSALS` below, and which also reaches the case `tsc` never could: a
 * `color` arriving inside a spread object literal.
 *
 * THE ESCAPES ARE THE POINT. Every message names what to write instead. A refusal without an
 * escape is a wall, and this system's refusals have always come with a door.
 */

declare const REFUSAL: unique symbol;

/**
 * A prop that does not exist, carrying the reason it does not and the thing to write instead.
 *
 * The type parameter is displayed verbatim by TypeScript in the error, which is the entire
 * mechanism — there is no other way to attach a custom message to a diagnostic
 * (microsoft/TypeScript#13713 is closed as Declined). Keep each message to one line: the
 * checker truncates long type displays, and the truncation point is set by the CONSUMER's
 * editor, not by us.
 */
export type Refused<Message extends string> = { readonly [REFUSAL]: Message };

/** Brand every key of a message table, which is how a table of sentences becomes a props mixin. */
type RefusedProps<Messages extends Record<string, string>> = {
  [Key in keyof Messages]?: Refused<Messages[Key]>;
};

/**
 * The props a model trained on Radix Themes reaches for first.
 *
 * This is the measured corpus risk and it is worth naming precisely: KookieUI v1 is published
 * but tiny, so nothing memorised it. v1 is a FORK OF RADIX THEMES, and Radix Themes is heavily
 * represented in training data — so the wrong code a model writes here is not v1's API, it is
 * Radix's. `variant`, `color` and `highContrast` are Radix Themes props on almost every
 * control; `asChild` is Radix's composition escape, and this system spells that `render`.
 *
 * `color` is in `PLATFORM_OWNED_REFUSALS` rather than here, for the reason the file header
 * gives at length: the type has to keep letting a native element's own props through.
 */
export const RADIX_REFLEX_REFUSALS = {
  variant:
    "KookieUI has no `variant`. Use `tone` for what a thing means and `emphasis` for how loud it is — so a quiet destructive button is expressible.",
  highContrast: 'KookieUI has no `highContrast`. Contrast is an app-wide setting: `<Theme contrast="high">`.',
  asChild: 'KookieUI has no `asChild`. Pass an element to `render`: `<Button render={<a href="/x" />}>`.',
  as: "KookieUI has no `as`. Pass an element to `render`: `<Text render={<label />}>`.",
} as const;

/**
 * Refused, and refusable only by the linter.
 *
 * A separate table because the criterion is structural rather than editorial: React's own
 * `HTMLAttributes` declares `color?: string`, so every Kookie component that extends a native
 * element's props must keep that key assignable inbound or the ordinary wrapper component
 * stops compiling. The sentence still has to exist, so it lives here, is printed by
 * `no-refused-prop`, and travels into both agent surfaces beside the rest.
 *
 * A refusal moves here the day the platform takes its name, and never for convenience.
 */
export const PLATFORM_OWNED_REFUSALS = {
  color:
    "KookieUI has no `color`. Use `tone`, which names a meaning (`destructive`, `success`) and lets the theme resolve the hue.",
} as const;

/**
 * Outer spacing, refused on everything that is not a layout.
 *
 * The oldest rule in the system: a component never sets the space around itself, because the
 * distance between two things belongs to whatever owns the relationship. Radix Themes puts the
 * whole margin row on every component, so this is the second thing a model reaches for.
 *
 * The names are written out rather than derived from `marginPropNames`, and that is deliberate
 * — each one carries a different sentence would be a lie, so they share one, and a law binds
 * this key set to that array so a new margin row cannot be refused in one place and forgotten
 * in the other.
 */
export const SPACING_REFUSALS = {
  m: 'A component sets no outer spacing. Wrap it — `<Box m="4"><Button/></Box>` — or set `gap` on the Flex, Stack or Grid that holds it.',
  mx: 'A component sets no outer spacing. Wrap it in a `<Box mx="4">`, or set `gap` on the layout that holds it.',
  my: 'A component sets no outer spacing. Wrap it in a `<Box my="4">`, or set `gap` on the layout that holds it.',
  mt: 'A component sets no outer spacing. Wrap it in a `<Box mt="4">`, or set `gap` on the layout that holds it.',
  mr: 'A component sets no outer spacing. Wrap it in a `<Box mr="4">`, or set `gap` on the layout that holds it.',
  mb: 'A component sets no outer spacing. Wrap it in a `<Box mb="4">`, or set `gap` on the layout that holds it.',
  ml: 'A component sets no outer spacing. Wrap it in a `<Box ml="4">`, or set `gap` on the layout that holds it.',
} as const;

/**
 * Radix Themes' `<Theme>` props, refused on ours.
 *
 * The first element a model writes is the Theme, so this is the earliest place the wrong API
 * shows up and the cheapest place to redirect it. `accentColor` is refused for a reason worth
 * stating: the accent is generated in `color-config.ts` and baked by the token generator, so
 * it is one app-wide identity rather than a per-subtree choice, and there is nothing for a
 * prop to set. `radius` and `size` are NOT here — this Theme really does take both.
 */
export const THEME_REFUSALS = {
  accentColor:
    "KookieUI has no `accentColor`. The accent is generated: set `accent` in the colour config and the whole palette is re-derived from it.",
  grayColor: "KookieUI has no `grayColor`. The neutrals derive their hue from the accent, so there is nothing to choose here.",
  panelBackground:
    "KookieUI has no `panelBackground`. Use `material` for translucency — `solid`, `thin`, `regular` or `thick`.",
  scaling:
    "KookieUI has no `scaling`. Use `density` (`compact`, `default`, `comfortable`), which re-picks designed values rather than multiplying them.",
} as const;

export type RadixReflexRefusals = RefusedProps<typeof RADIX_REFLEX_REFUSALS>;
export type SpacingRefusals = RefusedProps<typeof SPACING_REFUSALS>;
export type ThemeRefusals = RefusedProps<typeof THEME_REFUSALS>;

/**
 * What a component refuses. Everything but Box, Flex, Stack and Grid takes this whole set;
 * those four own the margin row, so they take the reflex refusals alone.
 *
 * That sentence is now also the CODE: `refusalSetsFor` in `system/refusal-sets.ts` states it
 * once, both agent surfaces ask it, and a law walks every shipped declaration to check that
 * what the components actually intersect agrees with what the rule says they do.
 */
export type ComponentRefusals = RadixReflexRefusals & SpacingRefusals;
