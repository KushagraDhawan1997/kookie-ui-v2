/**
 * Shell's refusals, as compile errors (ENGINEERING §1.3, §6 "Boundary"), in the shape
 * `composer-types.test.tsx` established: every `@ts-expect-error` fails the build in BOTH
 * directions, so a narrowing that quietly widens is caught the same as one that never existed.
 */
import { expect, it } from "vitest";

import {
  ShellBottom,
  ShellContent,
  ShellHeader,
  ShellInspector,
  ShellRail,
  ShellSidebar,
} from "./shell.tsx";

const refusals = [
  // THE WORK AREA NEVER GETS GLASS (§10, §27, 2026-08-29 — Kushagra: "I dont think content
  // should ever get glass, panels are fine"). Structural rather than a preference: shell.css
  // derives floating as "a pane floats if the content is underneath it", so the content is by
  // construction the one pane nothing is ever underneath, and glass over the app's flat ground
  // blurs nothing at the price of a full backdrop read on the largest box on screen.
  //
  // A mounted law can only read the routes that exist; only the type can say the question is
  // not askable. The escape is §10's own sentence — a solid surface HOSTS glass — so a vibrant
  // region inside the work area is a `<Box backdrop>` or a `<Card backdrop>` placed in it.
  // @ts-expect-error — the work area is the bottom of the stack; nothing passes behind it
  <ShellContent backdrop>c</ShellContent>,
];

/**
 * The five panels take it, so the refusal above is a refusal and not a wall — and so that a
 * widening which made `backdrop` unreachable on a panel would fail here rather than pass.
 */
const accepted = [
  <ShellHeader backdrop>h</ShellHeader>,
  <ShellRail aria-label="Sections" backdrop>r</ShellRail>,
  <ShellSidebar aria-label="Primary" backdrop>s</ShellSidebar>,
  <ShellInspector backdrop>i</ShellInspector>,
  <ShellBottom backdrop>b</ShellBottom>,
  // Posture is a separate question on every pane, the work area included (2026-08-29): the two
  // were briefly wired together, and `flush` staying reachable HERE is what says they no
  // longer are.
  <ShellContent flush={false}>c</ShellContent>,
];

it("the refusals are compile errors, and this keeps vitest from seeing an empty suite", () => {
  expect(refusals).toHaveLength(1);
  expect(accepted).toHaveLength(6);
});
