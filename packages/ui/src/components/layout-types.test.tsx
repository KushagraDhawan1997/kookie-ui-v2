/**
 * The refusals, as compile errors (ENGINEERING §1.3, §6 "Boundary"). The enforcement here is
 * `tsc` in the lint step, not vitest: every `@ts-expect-error` below fails the build in BOTH
 * directions — if the forbidden prop compiles, tsc reports an unused suppression (TS2578),
 * so a narrowing that quietly widens is caught the same as one that never existed.
 *
 * The single runtime test only keeps vitest from complaining about an empty suite.
 */
import { expect, it } from "vitest";

import { Flex } from "./flex/flex.tsx";
import { Grid } from "./grid/grid.tsx";
import { Stack } from "./stack/stack.tsx";

const refusals = [
  // Grid vocabulary does not exist on Flex.
  // @ts-expect-error — columns is grid-only
  <Flex columns="repeat(3, 1fr)" />,
  // @ts-expect-error — areas is grid-only
  <Flex areas='"a b"' />,
  // @ts-expect-error — flow is grid-only
  <Flex flow="dense" />,

  // Flex vocabulary does not exist on Grid.
  // @ts-expect-error — direction is flex-only
  <Grid direction="column" />,
  // @ts-expect-error — wrap is flex-only
  <Grid wrap="wrap" />,

  // Stack has one axis and one direction by definition.
  // @ts-expect-error — Stack is vertical by construction
  <Stack direction="row" />,
  // @ts-expect-error — a single column has no cross-axis gap
  <Stack gapX="2" />,
  // @ts-expect-error — a Stack that wraps is a Flex
  <Stack wrap="wrap" />,

  // The preset is the identity: none of them takes an arbitrary display.
  // @ts-expect-error — a Flex that is a grid is a Box
  <Flex display="grid" />,
  // @ts-expect-error — Stack does not expose display at all
  <Stack display="flex" />,
];

it("the refusals are compile-time, so this suite only has to exist", () => {
  expect(refusals.length).toBeGreaterThan(0);
});
