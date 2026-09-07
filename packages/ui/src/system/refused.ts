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
 * `node_modules` and the diagnostic it repairs from. The refusals already had one home in the
 * documentation registry. This gives them a second READER, not a second home: the sentences
 * here are written for a compiler's one-line display and the registry's are written for
 * `content/AUTHORING.md`'s prose rules, so a law binds the two on the SET of refused symbols
 * and never on the wording.
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
 * `Omit` over a union collapses it, which would silently delete a shipped guarantee. The one
 * key that can collide is `color`, which React's own HTML attributes still carry — measured,
 * the intersection `string & Refused<…>` rejects `color="red"` and still prints the sentence,
 * so no special case is needed.
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

/**
 * The four props a model trained on Radix Themes reaches for first.
 *
 * This is the measured corpus risk and it is worth naming precisely: KookieUI v1 is published
 * but tiny, so nothing memorised it. v1 is a FORK OF RADIX THEMES, and Radix Themes is heavily
 * represented in training data — so the wrong code a model writes here is not v1's API, it is
 * Radix's. `variant`, `color` and `highContrast` are Radix Themes props on almost every
 * control; `asChild` is Radix's composition escape, and this system spells that `render`.
 */
export type RadixReflexRefusals = {
  variant?: Refused<"KookieUI has no `variant`. Use `tone` for what a thing means and `emphasis` for how loud it is — so a quiet destructive button is expressible.">;
  /** Intersected with `string`, and that is load-bearing rather than decorative. `color` is the
      one refused name React's own `HTMLAttributes` already carries, so a component that spreads
      its rest props onto a `<div>` must still satisfy `color?: string`. A bare brand fails that
      assignment in 50 files; `string & Refused<…>` satisfies it while remaining unsatisfiable
      by any actual string, so the call site still gets the sentence. Measured both ways. */
  color?: string & Refused<"KookieUI has no `color`. Use `tone`, which names a meaning (`destructive`, `success`) and lets the theme resolve the hue.">;
  highContrast?: Refused<"KookieUI has no `highContrast`. Contrast is an app-wide setting: `<Theme contrast=\"high\">`.">;
  asChild?: Refused<"KookieUI has no `asChild`. Pass an element to `render`: `<Button render={<a href=\"/x\" />}>`.">;
  as?: Refused<"KookieUI has no `as`. Pass an element to `render`: `<Text render={<label />}>`.">;
};

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
export type SpacingRefusals = {
  m?: Refused<"A component sets no outer spacing. Wrap it — `<Box m=\"4\"><Button/></Box>` — or set `gap` on the Flex, Stack or Grid that holds it.">;
  mx?: Refused<"A component sets no outer spacing. Wrap it in a `<Box mx=\"4\">`, or set `gap` on the layout that holds it.">;
  my?: Refused<"A component sets no outer spacing. Wrap it in a `<Box my=\"4\">`, or set `gap` on the layout that holds it.">;
  mt?: Refused<"A component sets no outer spacing. Wrap it in a `<Box mt=\"4\">`, or set `gap` on the layout that holds it.">;
  mr?: Refused<"A component sets no outer spacing. Wrap it in a `<Box mr=\"4\">`, or set `gap` on the layout that holds it.">;
  mb?: Refused<"A component sets no outer spacing. Wrap it in a `<Box mb=\"4\">`, or set `gap` on the layout that holds it.">;
  ml?: Refused<"A component sets no outer spacing. Wrap it in a `<Box ml=\"4\">`, or set `gap` on the layout that holds it.">;
};

/**
 * What a component refuses. Everything but Box, Flex, Stack and Grid takes this whole set;
 * those four own the margin row, so they take the reflex refusals alone.
 */
export type ComponentRefusals = RadixReflexRefusals & SpacingRefusals;

/**
 * Radix Themes' `<Theme>` props, refused on ours.
 *
 * The first element a model writes is the Theme, so this is the earliest place the wrong API
 * shows up and the cheapest place to redirect it. `accentColor` is refused for a reason worth
 * stating: the accent is generated in `color-config.ts` and baked by the token generator, so
 * it is one app-wide identity rather than a per-subtree choice, and there is nothing for a
 * prop to set. `radius` and `size` are NOT here — this Theme really does take both.
 */
export type ThemeRefusals = {
  accentColor?: Refused<"KookieUI has no `accentColor`. The accent is generated: set `accent` in the colour config and the whole palette is re-derived from it.">;
  grayColor?: Refused<"KookieUI has no `grayColor`. The neutrals derive their hue from the accent, so there is nothing to choose here.">;
  panelBackground?: Refused<"KookieUI has no `panelBackground`. Use `material` for translucency — `solid`, `thin`, `regular` or `thick`.">;
  scaling?: Refused<"KookieUI has no `scaling`. Use `density` (`compact`, `default`, `comfortable`), which re-picks designed values rather than multiplying them.">;
};
