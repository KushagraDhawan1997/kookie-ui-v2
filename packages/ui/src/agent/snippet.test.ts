/**
 * THE SCANNER'S OWN LAWS, moved here with the scanner (2026-09-07).
 *
 * They were written in `@kookie-ui/mcp`, because that is where the checker was first built.
 * The checker moved into this package when the documentation site turned out to have a second
 * one, and a law belongs beside the mechanism it measures — read from the server, these would
 * have gone on passing while testing a copy nobody runs.
 *
 * These are about reading TEXT: where an opening tag ends, what is a spread, what is inside a
 * string. Nothing here needs to know a single component's name, which is why they need no
 * injected data.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { scanElements } from "./snippet.ts";

describe("the scanner reads an opening tag", () => {
  it("finds attributes across lines, past expressions and past children", () => {
    const [element] = scanElements(`
      <Button
        size="3"
        onClick={() => setOpen(true)}
        tone="destructive"
      >
        Delete
      </Button>`);
    expect(element?.tag).toBe("Button");
    expect(element?.attributes.map((attribute) => attribute.name)).toEqual([
      "size",
      "onClick",
      "tone",
    ]);
    expect(element?.attributes[0]?.line).toBe(3);
  });

  it("does not mistake a `>` inside an expression for the end of the tag", () => {
    const [element] = scanElements(`<Button onClick={() => (a > b ? x : y)} tone="accent" />`);
    expect(element?.attributes.map((attribute) => attribute.name)).toEqual(["onClick", "tone"]);
  });

  it("does not mistake a `}` inside a string for the end of an expression", () => {
    const [element] = scanElements(`<Text style={{ content: "}" }} size="3" />`);
    expect(element?.attributes.map((attribute) => attribute.name)).toEqual(["style", "size"]);
  });

  it("reads past a SPREAD holding nested braces, and keeps checking what follows it", () => {
    // A REGRESSION GUARD, AND ITS SABOTAGE SURVIVED — recorded rather than dressed up. Replacing
    // the spread's `skipBraces` with a naive `indexOf("}")` leaves this green, because the scan
    // recovers: an unrecognised character is skipped, so it walks out of a half-parsed
    // expression and finds `tone` anyway. What `skipBraces` genuinely protects is the attribute
    // VALUE, whose text is handed to the style check, and the raw-value law is the one that
    // goes red when that call is naive. This still holds a real property — an attribute after a
    // nested spread is checked — and it is honest about not being the falsification.
    const [element] = scanElements(`<Button {...(big ? { size: "3" } : { size: "1" })} tone="purple" />`);
    expect(element?.attributes.map((attribute) => attribute.name)).toEqual(["tone"]);
    // The other half of this law — that the attribute AFTER the spread is then judged against
    // the axis — needs to know what `Button.tone` admits, which is snapshot knowledge rather
    // than scanner knowledge. It stays with the server, in `@kookie-ui/mcp`'s own suite.
  });
});

/**
 * The judgements have one home, and this file is not it.
 *
 * `snippet.ts` decides WHERE to look; whether a class is a utility, whether a value is a raw
 * length, and which CSS property a prop owns are decided by the ESLint rules' own modules. A
 * second opinion written here would agree with itself and disagree with the linter a consumer
 * runs, which is the same defect one layer down.
 */
describe("the detectors have one home", () => {
  const source = readFileSync(new URL("./snippet.ts", import.meta.url), "utf8");

  it("imports its judgements from the eslint rules rather than restating them", () => {
    for (const module of ["utility-classes", "raw-values", "owned-properties"]) {
      expect(source, module).toContain(`../lint/${module}.ts`);
    }
  });
});
