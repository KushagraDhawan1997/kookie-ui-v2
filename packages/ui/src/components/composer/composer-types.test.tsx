/**
 * Composer's refusals, as compile errors (ENGINEERING §1.3, §6 "Boundary"), in the shape
 * `tooltip-types.test.tsx` established: every `@ts-expect-error` fails the build in BOTH
 * directions, so a narrowing that quietly widens is caught the same as one that never existed.
 */
import { expect, it } from "vitest";

import { ComposerInput, ComposerSend } from "./composer.tsx";

const refusals = [
  // THE NAME IS NOT OPTIONAL (§30, audit 2026-08-26). `ComposerInput` is the one text control
  // in the library a surrounding `Field` cannot name: every other input goes through a Base UI
  // primitive that registers with `Field.Root` and picks up the label's `htmlFor`, and this one
  // is a BARE <textarea> — the decision that keeps a second box from appearing — so a
  // `FieldLabel` above it points at an id no element carries. A placeholder is not a name.
  // Unnamed, a screen reader announces "edit text, blank": Button's `iconOnly` defect in the
  // same shape, so it takes Button's answer.
  // @ts-expect-error — a composer's text must carry an accessible name
  <ComposerInput placeholder="Reply to the thread…" />,

  // `ComposerSend` places the button, so what it IS in each state is the system's: `submitted`
  // drives the busy state and `streaming` is not a submit. A caller stating either twice is
  // stating a second answer to a question the status already answered.
  // @ts-expect-error — the busy state comes from `status`, never from `loading`
  <ComposerSend loading />,
  // @ts-expect-error — the element comes from `status`: stopping is not a submission
  <ComposerSend type="submit" />,
  // @ts-expect-error — one button with four meanings; the glyph goes through `icons`
  <ComposerSend>Send</ComposerSend>,
];

/**
 * Both accepted spellings of the name, so the refusal above is a refusal and not a wall — and
 * so that a widening which made `aria-label` unsatisfiable would fail here rather than pass.
 */
const accepted = [
  <ComposerInput aria-label="Message" />,
  <ComposerInput aria-labelledby="some-heading" />,
];

it("the refusals are compile errors, and this keeps vitest from seeing an empty suite", () => {
  expect(refusals).toHaveLength(4);
  expect(accepted).toHaveLength(2);
});
