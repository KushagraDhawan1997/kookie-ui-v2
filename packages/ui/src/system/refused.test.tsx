/**
 * THE REFUSALS, AS COMPILE ERRORS AND AS SENTENCES (2026-09-07).
 *
 * Two halves, because the mechanism has two claims and one law cannot carry both.
 *
 * The `@ts-expect-error` block is `layout-types.test.tsx`'s own shape and it is enforced by
 * `tsc` in the lint step rather than by vitest: each suppression fails the build in BOTH
 * directions — if a refused prop starts compiling, tsc reports the suppression as unused
 * (TS2578), so a refusal that quietly stops refusing is caught exactly like one that was never
 * written. That half proves the prop is rejected.
 *
 * The sentences are the other half and the reason the file exists at all. `never` also rejects
 * a prop, and it was measured and refused because its diagnostic — "Type 'string' is not
 * assignable to type 'never'" — tells the writer nothing to do next. So the law below asserts
 * what a rejection is WORTH: every refusal names something to write instead. A refusal without
 * an escape is a wall, and this system's refusals have always come with a door.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import * as React from "react";
import ts from "typescript";
import { expect, it, describe } from "vitest";

import { marginPropNames } from "./props.ts";
import { PLATFORM_OWNED_REFUSALS, SPACING_REFUSALS } from "./refused.ts";
import { REFUSAL_SETS, typeRefusalsFor } from "./refusal-sets.ts";
import { Button } from "../components/button/button.tsx";
import { Card } from "../components/card/card.tsx";
import { Text } from "../components/text/text.tsx";
import { Box } from "../components/box/box.tsx";
import { Flex } from "../components/flex/flex.tsx";
import { Theme } from "../theme/theme.tsx";

const refused = [
  // The four a model trained on Radix Themes reaches for first.
  // @ts-expect-error — there is no `variant`; `tone` and `emphasis` are the two questions
  <Button variant="solid" />,
  // @ts-expect-error — there is no `color`; a component names a family, never a hue
  <Button color="red" />,
  // @ts-expect-error — contrast is app-wide, on the Theme
  <Button highContrast />,
  // @ts-expect-error — composition is spelled `render`
  <Button asChild />,
  // @ts-expect-error — `as` is Radix's spelling of the same escape
  <Text as="p" />,

  // Outer spacing, on everything that is not a layout.
  // @ts-expect-error — a control sets no outer spacing
  <Button m="4" />,
  // @ts-expect-error — a surface sets no outer spacing either
  <Card mt="2" />,
  // @ts-expect-error — nor does a type atom
  <Text mb="3" />,

  // The Theme's own, from Radix Themes' `<Theme>`.
  // @ts-expect-error — the accent is generated, not chosen per subtree
  <Theme accentColor="blue" />,
  // @ts-expect-error — the neutrals derive their hue from the accent
  <Theme grayColor="slate" />,
  // @ts-expect-error — translucency is `material`
  <Theme panelBackground="translucent" />,
  // @ts-expect-error — density re-picks designed values; scaling multiplies them
  <Theme scaling="95%" />,
];

/**
 * THE VACUITY GUARD, and it is the load-bearing half of this file.
 *
 * A refusal that accidentally refused everything would satisfy every suppression above and
 * still be a defect — so these must COMPILE. The margin row on a layout is the case that
 * actually broke during the change: `Box` and its three siblings own that row, and an earlier
 * spelling mixed the refusals in everywhere and made `<Box m="4">` an error, which is the
 * whole spacing mechanism deleted by the thing meant to teach it.
 */
const stillLegal = [
  <Box m="4" p="3" />,
  <Flex gap="3" />,
  <Button tone="destructive" emphasis="quiet" />,
  <Theme radius="full" size="3" density="compact" contrast="high" />,
];

/**
 * AND A WRAPPER STILL COMPILES, which is the half this guard did not have (2026-09-07, the
 * audit).
 *
 * Every fixture above writes attributes DIRECTLY, and a JSX attribute is excess-property
 * checked while a spread of a typed variable is not — so the whole block was blind to the
 * direction that actually broke. `color` shipped as `string & Refused<…>` for a day, and the
 * canonical React wrapper stopped compiling on all 143 components with a five-level "not
 * assignable" wall naming a prop the author never wrote. `tsc` is the enforcement here: if this
 * function stops type-checking, `pnpm run lint` fails and this comment is the reason.
 *
 * `className` AND `style` ARE OMITTED FROM THE SOURCE TYPE, and that is a separate, real, and
 * unfixed thing rather than a convenience. This repo compiles with
 * `exactOptionalPropertyTypes`, under which `className?: string` rejects `string | undefined`
 * — so a consumer who also sets that flag cannot forward those two keys into any component
 * here. Declaring `| undefined` on both, on 143 props types, is the repair; it is a change to
 * every public signature in the package and is not being made inside an audit fix. Recorded in
 * LOG 2026-09-07. What this fixture isolates is the `color` regression, which broke the same
 * wrapper under EVERY tsconfig.
 */
export function SaveButton({
  pending,
  ...rest
}: Omit<React.ComponentPropsWithoutRef<"button">, "className" | "style"> & { pending?: boolean }) {
  return (
    <Button loading={pending ?? false} {...rest}>
      Save
    </Button>
  );
}

export function Panel(props: Omit<React.ComponentPropsWithoutRef<"div">, "className" | "style">) {
  return <Card {...props} />;
}

describe("the refusals", () => {
  it("mounted nothing and proved nothing at runtime — tsc is the enforcement", () => {
    expect(refused.length + stillLegal.length).toBeGreaterThan(0);
  });

  /**
   * Every refusal names an escape.
   *
   * Read off the source rather than off a list, because a list is the second home this file
   * exists to avoid. The marker is a backticked alternative in the message body: every escape
   * this system offers is a prop, a component or a value, and all three are written in
   * backticks by `content/AUTHORING.md`'s own rules. A message with none is a wall.
   */
  it("each one says what to write instead", () => {
    // READ OFF THE TABLES, which are values now (2026-09-07). They were string literal TYPES,
    // and reading them meant a regex over this file's source — the same regex the MCP server
    // ran at build time, and the reason the documentation site had these facts nowhere at all.
    const messages = Object.values(REFUSAL_SETS).flatMap((rows) => rows.map((row) => row.why));
    expect(messages.length).toBeGreaterThan(10);
    for (const message of messages) {
      const escapes = message.match(/`[^`]+`/g) ?? [];
      expect(escapes.length, `no escape offered by: ${message}`).toBeGreaterThan(0);
    }
  });

  /**
   * `color` IS REFUSED, AND NOT BY THE TYPE (2026-09-07, the audit).
   *
   * React's own `HTMLAttributes` declares `color?: string`, so any unsatisfiable declaration of
   * it — brand, `never`, anything — stops an ordinary wrapper compiling: a consumer forwarding
   * `React.ComponentPropsWithoutRef<"button">` into a Button has a `color` in that rest object.
   * Measured on all 143 components before this moved. So the sentence lives in
   * `PLATFORM_OWNED_REFUSALS` and the ESLint plugin prints it.
   *
   * BOTH HALVES ARE PINNED, because either alone is the defect: the sentence still exists and
   * still names `tone`, and no props type declares the key.
   */
  it("refuses `color` out of the type, and says so somewhere a consumer will read", () => {
    expect(PLATFORM_OWNED_REFUSALS.color).toContain("`tone`");
    // Reachable through the same door both agent surfaces use.
    expect(typeRefusalsFor("Button").map((row) => row.prop)).toContain("color");
    // And absent from the props mixins, which is what keeps the wrapper compiling.
    for (const set of ["RadixReflexRefusals", "SpacingRefusals", "ComponentRefusals"]) {
      expect(
        (REFUSAL_SETS[set] ?? []).map((row) => row.prop),
        `${set} declares \`color\`, which breaks every inbound native-props spread`,
      ).not.toContain("color");
    }
  });

  /**
   * The spacing refusal covers the margin row exactly.
   *
   * `props.ts` is the single home of what a margin prop is called, and this file writes the
   * names out again because each key needs its own sentence. That is a second SPELLING of one
   * fact, so it is pinned: add a margin row and forget this file, and the row is a prop that
   * silently works on a Button.
   */
  it("refuses exactly the margin row `props.ts` declares", () => {
    expect(Object.keys(SPACING_REFUSALS).sort()).toEqual([...marginPropNames].sort());
  });

  /**
   * THE LAW THIS FILE EXISTS FOR: the compiler must SAY the sentence.
   *
   * Written after the `@ts-expect-error` block above was measured and found unable to fail at
   * the thing that changed. Delete the `variant` refusal entirely and every suppression still
   * passes — because `variant` is not a `<button>` attribute either, so it stays an excess
   * property and the suppression stays used. That block proves a prop is REJECTED, which was
   * already true before any of this was written; it cannot see a refusal regressing from a
   * sentence back to the anonymous `TS2322` this whole mechanism replaced.
   *
   * So this compiles a real fixture and reads the real diagnostics. It is the slowest law in
   * the node project by an order of magnitude, and it earns that: it is the only one that can
   * fail when the message stops being displayed.
   */
  it("puts the escape in the diagnostic, per prop", () => {
    const fixture = path.join(os.tmpdir(), `kui-refused-${process.pid}.tsx`);
    fs.writeFileSync(
      fixture,
      [
        `import { Button, Text, Theme } from ${JSON.stringify(path.resolve("src/index.ts"))};`,
        "export const a = <Button variant=\"solid\" m=\"4\" />;",
        "export const b = <Text as=\"p\" />;",
        "export const c = <Theme accentColor=\"blue\" />;",
      ].join("\n"),
    );
    try {
      const program = ts.createProgram([fixture], {
        jsx: ts.JsxEmit.ReactJSX,
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        allowImportingTsExtensions: true,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        target: ts.ScriptTarget.ES2022,
      });
      const text = ts
        .getPreEmitDiagnostics(program, program.getSourceFile(fixture))
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, " "))
        .join("\n");

      // One line per refused prop, each naming its own escape. The fragments are deliberately
      // the ESCAPE and not the refusal: "there is no variant" is the half a `never` already
      // said, and the half that was worthless.
      expect(text).toContain("Use `tone` for what a thing means");
      expect(text).toContain("A component sets no outer spacing");
      expect(text).toContain("Pass an element to `render`");
      expect(text).toContain("set `accent` in the colour config");
    } finally {
      fs.rmSync(fixture, { force: true });
    }
  });
});
