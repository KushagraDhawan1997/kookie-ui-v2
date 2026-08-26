/**
 * Popover's refusals, as compile errors (ENGINEERING §1.3, §6 "Boundary"), in the shape
 * `layout-types.test.tsx` established: every `@ts-expect-error` fails the build in BOTH
 * directions, so a narrowing that quietly widens is caught the same as one that never existed.
 */
import * as React from "react";
import { expect, it } from "vitest";

import { Button } from "../button/button.tsx";
import { PopoverClose, PopoverTrigger } from "./popover.tsx";

/**
 * Base UI's `ComponentRenderFn<HTMLProps, State>`, spelled the way a consumer would — one per
 * part, because the STATE differs (`PopoverCloseState` is empty and `PopoverTriggerState`
 * carries `open`) and a function whose state parameter does not match is rejected for its own
 * reasons. That would make the directive below pass on a package where `render` had never been
 * narrowed, which is a law that cannot fail — caught by this file's own falsification run.
 */
const triggerRenderFn = (
  props: React.ComponentPropsWithRef<"button">,
  state: { open: boolean },
) => <button {...props}>{state.open ? "Close" : "Open"}</button>;
const closeRenderFn = (props: React.ComponentPropsWithRef<"button">) => <button {...props} />;

const refusals = [
  /**
   * `render` IS AN ELEMENT (added 2026-08-26, ultracode audit).
   *
   * Base UI also accepts a render FUNCTION, and inheriting its props verbatim let that form
   * type-check while `rootsInButton` — which asks an element what it IS, in order to answer
   * `nativeButton` — read `.props` off a function and threw `TypeError: Cannot read properties
   * of undefined`. The canonical state-dependent trigger crashed the render on mount.
   *
   * The narrowing is Menu's and Dialog's, restated on the fourth consumer: a refusal the type
   * expresses is the house rule, and a refusal spelled as a runtime crash is not one. What the
   * function form buys — a trigger that relabels itself by open state — is reachable by reading
   * Base UI's own `data-popup-open` in CSS, which is where this system keeps state anyway.
   */
  // Base UI's own signature, verbatim — the shape that type-checked before the narrowing and
  // threw at render. A hand-rolled parameter type would fail to compile for its OWN reasons
  // and make the two directives below pass on a package where `render` was never narrowed.
  // @ts-expect-error — render takes an element, not a function
  <PopoverTrigger render={triggerRenderFn} />,
  // @ts-expect-error — and the same on the close button, which takes the same escape
  <PopoverClose render={closeRenderFn} />,

  // The element form is the supported one, and it must still compile — without this the two
  // refusals above would pass on a day `render` had been removed from the props altogether.
  <PopoverTrigger render={<Button>Filters</Button>} />,
];

it("the refusals are compile errors, and this keeps vitest from seeing an empty suite", () => {
  expect(refusals).toHaveLength(3);
});
