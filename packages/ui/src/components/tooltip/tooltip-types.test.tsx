/**
 * Tooltip's refusals, as compile errors (ENGINEERING §1.3, §6 "Boundary"), in the shape
 * `layout-types.test.tsx` established: every `@ts-expect-error` fails the build in BOTH
 * directions, so a narrowing that quietly widens is caught the same as one that never existed.
 */
import { expect, it } from "vitest";

import { Kbd } from "../kbd/kbd.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.tsx";

const refusals = [
  // A tooltip holds a SENTENCE, not a composition. An inverted pane cannot invert an arbitrary
  // subtree: a component that stamps a tone re-declares the ink roles on its own element, which
  // outranks anything a parent re-scoped — measured, a Kbd inside a tooltip kept the page's ink
  // and its own pale fill and vanished on a near-black pane.
  // @ts-expect-error — children is a string; a chip in a tooltip is a Popover
  <TooltipContent><Kbd>⌘Z</Kbd></TooltipContent>,

  // There is no size axis (§32): the only index a tooltip could ride is its trigger's, which it
  // cannot see and which would make one label two sizes.
  // @ts-expect-error — size is not an axis here
  <Tooltip size="2" />,

  // Tone and emphasis are stamped identities, not choices: a tooltip has a job, not a volume.
  // @ts-expect-error — a tooltip carries no tone
  <TooltipContent tone="destructive">Undo</TooltipContent>,
  // @ts-expect-error — a tooltip carries no emphasis
  <TooltipContent emphasis="loud">Undo</TooltipContent>,

  // The delay is the system's. A per-call-site delay makes one product feel like several.
  // @ts-expect-error — the delay is not a prop
  <Tooltip delay={0} />,

  // AND THE ESCAPE THE ROOT NEVER HAD IS ON THE TRIGGER (added 2026-08-26, ultracode audit).
  // Base UI's Trigger takes its OWN `delay`/`closeDelay` and honours them over the provider's,
  // so inheriting its props verbatim left the refusal above true of the one element that could
  // not express it and false of the one that could: `<TooltipTrigger delay={0}/>` compiled,
  // shipped, and made exactly one button in a toolbar open instantly. The `Tooltip` line above
  // was the law for this refusal and it tested an element the escape was never on.
  // @ts-expect-error — the delay is the provider's, for a REGION, never one label
  <TooltipTrigger delay={0} />,
  // @ts-expect-error — and its other half
  <TooltipTrigger closeDelay={0} />,
];

it("the refusals are compile errors, and this keeps vitest from seeing an empty suite", () => {
  expect(refusals).toHaveLength(7);
});
