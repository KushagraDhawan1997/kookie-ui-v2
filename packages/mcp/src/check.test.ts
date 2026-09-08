/**
 * The scanner, read against real markup.
 *
 * Every fixture here is code someone would actually write. The wrong ones are the reflexes
 * `refused.ts` names — Radix Themes' API, which is what a model trained on the web produces
 * for this system — and the right ones are ordinary KookieUI, because a checker that flags
 * correct code is worse than no checker.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CONFORMANCE_CASES } from "@kookie-ui/react/agent";
import { describe, expect, it } from "vitest";

import { checkUsage } from "./check.ts";

const rules = (code: string): string[] =>
  checkUsage(code).findings.map((finding) => `${finding.rule}:${finding.tag}.${finding.prop ?? ""}`);

describe("what it refuses", () => {
  it("catches the four props a model trained on Radix Themes reaches for", () => {
    expect(
      rules(`<Button variant="solid" color="red" highContrast asChild>Save</Button>`),
    ).toEqual([
      "refused-prop:Button.variant",
      "refused-prop:Button.color",
      "refused-prop:Button.highContrast",
      "refused-prop:Button.asChild",
    ]);
  });

  it("catches outer spacing on a control and allows it on the layouts that own it", () => {
    expect(rules(`<Button mt="4">Save</Button>`)).toEqual(["refused-prop:Button.mt"]);
    expect(rules(`<Box m="4"><Button>Save</Button></Box>`)).toEqual([]);
  });

  it("catches a value outside a closed union, and prints the whole union", () => {
    const { findings } = checkUsage(`<Button size="5" />`);
    expect(findings[0]?.rule).toBe("illegal-value");
    expect(findings[0]?.message).toContain("`1`, `2`, `3`, `4`");
    expect(findings[0]?.message).toContain("never `5`");
  });

  it("catches a tone the system does not have, and a weight it deliberately deleted", () => {
    expect(rules(`<Button tone="purple" />`)).toEqual(["illegal-value:Button.tone"]);
    // `bold` was refused system-wide and the token deleted with it, so this is the exact case
    // where a plausible value is wrong.
    expect(rules(`<Text weight="bold">Title</Text>`)).toEqual(["illegal-value:Text.weight"]);
  });

  it("catches a space index past the end of the scale", () => {
    expect(rules(`<Flex gap="3" />`)).toEqual([]);
    expect(rules(`<Flex gap="20" />`)).toEqual(["illegal-value:Flex.gap"]);
  });

  it("catches utility classes ONE AT A TIME, and leaves an ordinary class name alone", () => {
    // One finding per class, because each head has its own answer: `mt-4` is told to use a
    // layout's margin and `rounded-lg` is told the corner is the theme's. Collapsing them
    // into one report per `className` would print one of those two sentences and drop the other.
    const { findings } = checkUsage(`<Card className="mt-4 rounded-lg" />`);
    expect(findings).toHaveLength(2);
    expect(findings[0]?.message).toContain("block-start margin is the `mt` prop");
    expect(findings[1]?.message).toContain("a corner is the theme's `radius` axis");
    expect(rules(`<Card className="pricing-card sidebar-flex" />`)).toEqual([]);
  });

  it("catches a raw length only where the space scale owns the property", () => {
    // React appends `px` to a bare number, so this is twelve raw pixels wearing no unit.
    expect(rules(`<Card style={{ padding: 12 }} />`)).toEqual(["raw-value-in-style:Card.style"]);
    expect(rules(`<Card style={{ marginTop: "8px" }} />`)).toEqual([
      "raw-value-in-style:Card.style",
    ]);
    // AND STAYS SILENT WHERE THE ESCAPE IS REQUIRED. A scroller has to be told how tall it is
    // — it is the builder's one catalog exclusion — so a rule that flagged this would be wrong
    // about the system rather than about the code.
    expect(rules(`<ScrollArea style={{ height: "160px" }} />`)).toEqual([]);
    expect(rules(`<Card style={{ maxWidth: "22rem" }} />`)).toEqual([]);
    expect(rules(`<Card style={{ opacity: 0.5 }} />`)).toEqual([]);
    expect(rules(`<Card style={{ padding: "var(--space-3)" }} />`)).toEqual([]);
  });

  it("catches a colour written out, in any spelling", () => {
    expect(rules(`<Card style={{ background: "#0b0b0b" }} />`)).toEqual([
      "raw-value-in-style:Card.style",
    ]);
    expect(rules(`<Card style={{ color: "white" }} />`)).toEqual(["raw-value-in-style:Card.style"]);
    expect(rules(`<Card style={{ background: "var(--color-track)" }} />`)).toEqual([]);
  });

  it("catches an axis written straight onto the DOM as a data attribute", () => {
    // TSX exempts hyphenated attributes from excess-property checking, so this compiles no
    // matter what the props type says — which is how a deleted axis came back from a call site.
    expect(rules(`<Card data-tone="destructive" />`)).toEqual(["refused-attribute:Card.data-tone"]);
    expect(rules(`<Card data-testid="pricing" />`)).toEqual([]);
  });
});

describe("what it refuses to guess", () => {
  it("says nothing about a component it does not export", () => {
    const { findings, foreign } = checkUsage(`<MyThing variant="solid" className="mt-4" />`);
    expect(findings).toEqual([]);
    expect(foreign).toEqual(["MyThing"]);
  });

  it("counts a spread rather than pretending to see through it", () => {
    const { findings, spread } = checkUsage(`<Button {...props} />`);
    expect(findings).toEqual([]);
    expect(spread).toBe(1);
  });

  it("says nothing about a value it cannot read", () => {
    // The value is a variable. Reporting it would print the caller's identifier as an illegal
    // token value, which is a confident wrong answer.
    expect(rules(`<Button size={size} />`)).toEqual([]);
  });

  it("passes ordinary, correct KookieUI without a word", () => {
    expect(
      rules(`
        <Theme appearance="dark" density="compact">
          <Flex gap="4" p="5" align="center">
            <Button tone="destructive" emphasis="loud" size="2">Delete</Button>
            <Text size="2" tone="neutral" emphasis="quiet">This cannot be undone.</Text>
          </Flex>
        </Theme>`),
    ).toEqual([]);
  });
});

/**
 * ONE HOME FOR THE DETECTORS.
 *
 * `check_usage` shipped with its own utility-class patterns and its own raw-value regexes for
 * about an hour, because `packages/ui/src/lint` did not exist when it was written. It exists
 * now, and re-pointing at it is not a refactor — it is the difference between two answers to
 * "is this a utility class" and one. This law reads the SOURCE, because a behavioural check
 * would pass over a copy that agrees today: the copy that agrees today is exactly the one that
 * disagrees the first time the grammar widens.
 */
describe("the detectors have one home", () => {
  const source = readFileSync(new URL("./check.ts", import.meta.url), "utf8");

  it("calls the package's checker rather than carrying a second one", () => {
    // The rules moved to `@kookie-ui/react/agent` when the documentation site turned out to
    // have its own scanner. What has to stay true here is that this file never grows them
    // back: it binds the snapshot and delegates, and a re-implemented rule would show up as
    // this file reading a detector directly again.
    expect(source).toContain('from "@kookie-ui/react/agent"');
    for (const module of ["utility-classes", "raw-values", "owned-properties"]) {
      expect(source, module).not.toContain(`lint/${module}.ts`);
    }
  });

  it("prints the eslint rule's own sentence for a refused data attribute", () => {
    // The scanner's header promises it writes no new explanation of an old rule, and this was
    // the one place it did: `no-refused-attribute` already reports that refusal, in words, and
    // `check.ts` had a second wording of it. The template is carried through the snapshot, so
    // the law reads the RULE's source — a re-authored sentence here would agree with the
    // snapshot and disagree with the system.
    const rule = readFileSync(
      new URL("../../ui/src/lint/no-refused-attribute.ts", import.meta.url),
      "utf8",
    );
    const [finding] = checkUsage(`<Card data-tone="destructive" />`).findings;
    expect(finding?.rule).toBe("refused-attribute");
    // The rule states it with placeholders; the finding has them filled in, so the halves on
    // either side of each one are what must appear verbatim in the rule's own file.
    for (const fragment of ["writes the", "axis onto the DOM past the type", "re-grows what was removed"]) {
      expect(finding?.message, fragment).toContain(fragment);
      expect(rule, fragment).toContain(fragment);
    }
  });

  it("states none of the vocabulary itself", () => {
    // A Tailwind head, a colour function, a length unit list: each one is a fact the lint
    // package owns, and finding one here means a second copy has grown back.
    const stripped = source.replace(/\/\*\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    expect(stripped).not.toMatch(/\brounded\b|\bsemibold\b/);
    expect(stripped).not.toMatch(/rgba?\|hsla?|#\[0-9a-f\]/);
    expect(stripped).not.toMatch(/px\|rem\|em/);
  });
});

/**
 * THE CORPUS. Every example the documentation site ships, read by the checker.
 *
 * A fixture proves the checker catches what its author was thinking of. This proves the thing
 * nobody thinks of: that it stays quiet on code the system itself calls correct. It is the law
 * that was missing, and it was missing on the day two of these files were being reported as
 * wrong — `<AlertDialogTrigger render>`, which the alert's own example ships, and
 * `<ToggleGroup render>`, which the registry's own part blurb instructs a reader to write.
 * Both came from one cause: a refusal written about a component reaches every part of it.
 *
 * THE LEDGER IS THE POINT. A bare "raises nothing" would have to be deleted to ship while one
 * false positive is still open, and a deleted law catches nothing. So the law asserts the
 * findings EQUAL a list, which fails in both directions: a new false positive fails it, and so
 * does fixing the recorded one without emptying the ledger. The entry below is a real defect
 * that needs a decision this file cannot make — whether a registry refusal reaches the entry's
 * parts at all — and it is recorded rather than tolerated.
 *
 * It reads across a package boundary, exactly as the drift law does, so it owes the same build
 * edge in `turbo.json`; without one, a change to these files serves a cache hit and this law
 * does not run.
 */
describe("it stays silent on the system's own examples", () => {
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../apps/docs/examples");

  const KNOWN_WRONG: string[] = [
    // EMPTY, AND THAT IS THE MEASUREMENT. The one residual this ledger carried was
    // `<ToggleGroup render>`: the registry refuses `render` on Toggle, the group's own blurb
    // says to `render` it as the layout, and nothing in the snapshot could tell the two apart.
    // The registry can now scope a refusal to named parts (`on`), so that refusal reaches
    // Toggle alone and the example is clean. A finding appearing here again is a real one.
  ];

  it("raises nothing on them but the findings recorded as wrong", () => {
    const raised: string[] = [];
    const files = readdirSync(dir).filter((name) => name.endsWith(".tsx"));
    // A corpus with nothing in it passes every assertion below, so the size is asserted too.
    expect(files.length, "the examples directory was found").toBeGreaterThan(40);
    for (const name of files) {
      for (const finding of checkUsage(readFileSync(path.join(dir, name), "utf8")).findings) {
        raised.push(`${name} | ${finding.rule}:${finding.tag}.${finding.prop ?? ""}`);
      }
    }
    expect(raised.sort()).toEqual([...KNOWN_WRONG].sort());
  });
});

/**
 * THE CONFORMANCE SUITE, run against this surface's binding (2026-09-07, the audit).
 *
 * The mirror of the block at the foot of `apps/docs/app/(docs)/agent-tools.test.ts`. Sharing
 * the RULES did not make the two "check this snippet" tools agree, because each injects its
 * own FACTS and the site's were half-empty — it read the documentation registry alone where
 * this reads the registry AND `system/refused.ts`, so one snippet got five findings here and
 * none there, with every law on both sides green because each asked its own side.
 *
 * The expectation ships from the package as data because a call cannot be shared: this entry
 * starts a stdio process on import and that one runs in a browser. A case failing on one side
 * and passing on the other is the divergence returning.
 */
describe("the conformance suite the package ships", () => {
  for (const item of CONFORMANCE_CASES) {
    it(item.why, () => {
      const got = checkUsage(item.code)
        .findings.map((finding) => (finding.prop ? `${finding.tag}.${finding.prop}` : finding.tag))
        .sort();
      expect(got).toEqual([...item.findings].sort());
    });
  }
});
