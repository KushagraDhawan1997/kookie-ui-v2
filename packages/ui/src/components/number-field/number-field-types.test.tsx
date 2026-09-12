/**
 * NumberField's props are DECLARED, and this is what keeps them true (2026-09-12).
 *
 * The reference tables are generated from the package's own types and the generator follows a
 * type ALIAS. Base UI's `NumberFieldRootProps` is an `interface`, so `Pick<BaseNumberField.Root
 * .Props, …>` resolved to nothing and /components/number-field published six props — `backdrop`,
 * `className`, `decrementLabel`, `incrementLabel`, `size`, `style` — while every number this
 * component exists to take was documented nowhere. The repair is to declare them, which is the
 * house pattern (a prop this package publishes states its own contract and its own reason) and
 * which this package prefers to printing a dependency's prose under its own name.
 *
 * A declaration is a SECOND SPELLING of a fact Base UI owns, and a second spelling is this
 * repo's most expensive habit — so it is bound rather than trusted. ENGINEERING §6's clause is
 * exact about the shape: a mechanism with two implementations owes a law that they AGREE. Both
 * directions are asserted, because a one-way check passes on a declaration that has quietly
 * gone WIDER than the thing it documents as easily as on a correct one, and a reference that
 * promises more than the component accepts is worse than one that promises less.
 *
 * It fails at `tsc`, which is where it belongs: the failure has to arrive when Base UI's
 * signature moves, not when somebody notices the sentence is wrong.
 */
import { expect, it } from "vitest";

import type { NumberBehaviour, NumberOwnBehaviour } from "./number-field.tsx";
import { NumberField } from "./number-field.tsx";

/**
 * THE AGREEMENT, MEMBER BY MEMBER — and the first spelling of it COULD NOT FAIL (2026-09-12,
 * caught by its own sabotage pass, which is the only reason this paragraph exists).
 *
 * That spelling asserted assignability between `NumberBehaviour` and `NumberFieldProps`, and
 * it was vacuous twice over. Every member of both is optional, so `{}` satisfies either side
 * and the check had nothing to bite on; and `NumberFieldProps` INTERSECTS the declaration with
 * Base UI's own Pick, so a declaration that has gone wider is silently narrowed back by the
 * intersection rather than rejected. Sabotaged by widening `step` to `number | "any" | "lots"`,
 * `tsc` was perfectly happy — the law would have watched the documentation drift and said
 * nothing, which is the exact failure it was written to prevent.
 *
 * So it reads the two DECLARATIONS against each other rather than the public type they compose
 * into, in both directions, and it reads the KEY SETS too: a name on Base UI's side and not
 * ours is a prop the component takes and the reference does not mention — the original defect —
 * and a name on ours and not theirs is a prop the reference promises and the component does not
 * have, which is worse.
 *
 * Each check is spelled so that the FAILURE NAMES THE PROP: the annotation collapses to `true`
 * when the two agree and to the offending key otherwise, so `tsc` prints `Type 'true' is not
 * assignable to type '"step"'` rather than a bare boolean mismatch.
 */
type Common = keyof NumberBehaviour & keyof NumberOwnBehaviour;

/** Every shared member whose two spellings are not mutually assignable. */
type Divergent = {
  [K in Common]-?: [NumberBehaviour[K]] extends [NumberOwnBehaviour[K]]
    ? [NumberOwnBehaviour[K]] extends [NumberBehaviour[K]]
      ? never
      : K
    : K;
}[Common];

/** A prop Base UI's root takes that this component does not declare — the original defect. */
type Undeclared = Exclude<keyof NumberBehaviour, keyof NumberOwnBehaviour>;
/** A prop this component declares that Base UI's root does not take — a promise it cannot keep. */
type Invented = Exclude<keyof NumberOwnBehaviour, keyof NumberBehaviour>;

const everyPropIsDeclared: [Undeclared] extends [never] ? true : Undeclared = true;
const noPropIsInvented: [Invented] extends [never] ? true : Invented = true;
const everySignatureAgrees: [Divergent] extends [never] ? true : Divergent = true;

/**
 * And the declarations reach the RUNTIME props, not just a type beside them. Each of these is
 * a prop that was in the type, in an editor's completions, and in no document anywhere —
 * writing them down is what fixed that, so the one thing that must not happen is a declared
 * prop the component does not actually accept.
 */
const accepted = [
  <NumberField format={{ style: "currency", currency: "USD" }} locale="en-US" />,
  <NumberField min={0} max={10} step={2} smallStep={0.1} largeStep={5} snapOnStep />,
  <NumberField allowOutOfRange onValueChange={(value) => void value} />,
  <NumberField onValueCommitted={(value) => void value} name="seats" form="checkout" required />,
  <NumberField value={3} readOnly id="seats" />,
  <NumberField defaultValue={3} disabled />,
];

const refusals = [
  // The value arrives as a number through `onValueChange`; a string handler is the half that
  // cannot parse a formatted value back.
  // @ts-expect-error — no `onChange` (§4)
  <NumberField onChange={() => {}} />,
  // A native number input formats nothing, parses nothing in the reader's locale, and draws its
  // own spinner inside our box — which is the whole reason this component exists.
  // @ts-expect-error — `type` is the component's, always text with a computed inputMode
  <NumberField type="number" />,
  // The slots are the steppers. A unit belongs in `format`.
  // @ts-expect-error — no adornment slots (§4)
  <NumberField leading={<span>$</span>} />,
];

it("the agreement is a compile error, and this keeps vitest from seeing an empty suite", () => {
  // The three checks are read here so they are USED: an unused binding is a lint finding, and
  // a law that has to be exempted from the linter to exist is a law somebody deletes. What
  // actually enforces them is `tsc` — each is `true` only while the two declarations agree.
  expect([everyPropIsDeclared, noPropIsInvented, everySignatureAgrees]).toEqual([true, true, true]);
  expect(accepted).toHaveLength(6);
  expect(refusals).toHaveLength(3);
});
