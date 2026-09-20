/**
 * NOTHING MOVES HERE EITHER (2026-09-20).
 *
 * The motion system was removed from the package on Kushagra's call, and the removal treated
 * this app as in scope — `blocks/footer.css` and `blocks/table-of-contents.css` each lost a
 * two-channel `transition` with its own `prefers-reduced-motion` stand-down, and
 * `blocks/conversation.css` lost a `transition: rotate`. The package then grew one structural
 * law to hold the absence (`packages/ui/src/system/stillness.test.ts`), and nothing held this
 * side of it: of the twenty-seven law files in this suite, not one mentioned `transition`.
 *
 * WHY THAT MATTERS MORE HERE THAN IT LOOKS. A block is COPIED SOURCE. A transition added to one
 * in good faith does not merely move something on this site — it gets pasted into a consumer's
 * app, where it is the one thing in their tree that answers a state change with a clock, and
 * where none of the package's own laws can reach it. The distribution model is what turns a
 * docs-app oversight into a package-shaped one.
 *
 * WHY NOT PARAMETERISE THE PACKAGE'S LAW OVER A SECOND ROOT. That was the cheaper repair and it
 * is the wrong one: it would put a package-suite verdict on a sibling app's files with no build
 * edge between them, which is the 2026-08-08 `docs:test` finding re-committed — a law that
 * reads across a package boundary owes a build edge across the same boundary, and "did not run"
 * is a way of not failing. The claim about this app's files is held in this app's suite.
 *
 * THE ALLOWLIST IS TWO LOOPS AND THEY ARE NOT THE SAME KIND OF THING, which is why each entry
 * carries what it owes `prefers-reduced-motion` rather than the list carrying one rule:
 *
 *   - `kb-shimmer` (blocks/conversation.css) — the band that says something is still happening,
 *     in the reading column, instead of a spinner. It is CONTENT, so it SLOWS, exactly as the
 *     package's three loops do.
 *   - `kb-bed-drift` (app/globals.css) — the preview page's moving backdrop, which exists so
 *     that glass can be judged against something passing underneath it. Its own comment calls
 *     it a test rig rather than content, so it STOPS: there is no information in it to lose.
 *
 * THE LAB ROUTES ARE OUT OF THE WALK, by name and for a stated reason: `app/lab/`, `app/lab2/`
 * and `app/lab3/` each open with "SCRATCH, never shipped" in their own first line. They are
 * benches for judging a material, nothing imports them, and a bench that cannot move cannot be
 * a bench. Excluding a directory is a decision somebody has to make on purpose, which is the
 * property that keeps this an exemption rather than a hole.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** The directories whose stylesheets ship, walked rather than listed — so a new block, or a new
    route stylesheet, is covered the day it exists (the package's audit-D14 argument). */
const ROOTS = ["app", "blocks"];

/** Scratch benches, excluded with their reason in the header above. Matched on the path, so a
    file added inside one is excluded and a file merely NAMED after one is not. */
const BENCHES = ["app/lab/", "app/lab2/", "app/lab3/"];

/** What each allowlisted loop is, and what it therefore owes the preference. */
const LOOPS: Record<string, { keyframe: string; underStillness: "slows" | "stops" }> = {
  "blocks/conversation.css": { keyframe: "kb-shimmer", underStillness: "slows" },
  "app/globals.css": { keyframe: "kb-bed-drift", underStillness: "stops" },
};

/** Both arms are load-bearing and neither was in the package's first spelling: the anchor takes
    `^`, `{`, `;` or whitespace, and the character before `-webkit-transition` is a `-`; CSS
    property names are ASCII case-insensitive, so `TRANSITION:` is a real declaration. Lightning
    keeps the first verbatim and normalises the second to canonical `transition:`, so both reach
    a page. The prefix arm is non-capturing, which keeps the match the property name. */
const TRANSITION =
  /(?:^|[{;\s])(?:-[a-z]+-)?(transition(?:-property|-duration|-timing-function|-delay|-behavior)?)\s*:/i;
const ANIMATION = /(?:^|[{;\s])(?:-[a-z]+-)?(animation(?:-[a-z-]+)?)\s*:/i;
const KEYFRAMES = /@(?:-[a-z]+-)?keyframes\s+([\w-]+)/gi;

function walk(dir: string): string[] {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(join(dir, entry.name))
      : entry.name.endsWith(".css")
        ? [join(dir, entry.name)]
        : [],
  );
}

/** Src-relative paths, benches removed. `blocks/` is a sibling of `app/`, so the walk starts one
    level up and every path is reported the way a person would name it. */
const SHEETS = ROOTS.flatMap((dir) => walk(dir))
  .map((path) => relative(".", path))
  .filter((path) => !BENCHES.some((bench) => path.startsWith(bench)))
  .sort();

/** Comments out. These files are heavily commented and their comments name, by design, the very
    mechanisms this law forbids — `globals.css`'s own paragraph explains its drift. */
const sheet = (path: string): string =>
  readFileSync(join(root, path), "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");

/**
 * The body of an at-rule block, BRACE-BALANCED. A slice to the first `}` is the first inner
 * RULE's close and not the query's, so a law reading a media block that way reads one rule and
 * calls it the block — which is how a stand-down two rules down goes unnoticed.
 */
function atRuleBody(css: string, marker: string): string {
  const start = css.indexOf(marker);
  if (start === -1) throw new Error(`atRuleBody(): ${marker} not found`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`atRuleBody(): ${marker} is never closed`);
}

describe("nothing moves in the docs app either (2026-09-20)", () => {
  it("the walk finds the corpus — an empty walk proves nothing", () => {
    // The negative control this file cannot do without: every assertion below is an ABSENCE,
    // and an absence is satisfied perfectly by finding no stylesheets at all.
    expect(SHEETS.length, "the stylesheet walk came back short").toBeGreaterThan(5);
    for (const path of Object.keys(LOOPS)) {
      expect(SHEETS, `the walk missed ${path}, which the allowlist names`).toContain(path);
    }
    // And the benches really are excluded, or the exemption above is describing nothing.
    expect(SHEETS.filter((path) => path.includes("lab"))).toEqual([]);
  });

  it("no stylesheet declares a transition", () => {
    for (const path of SHEETS) {
      const found = TRANSITION.exec(sheet(path));
      expect(
        found?.[1],
        `${path} declares \`${found?.[1]}\` — every state change is instant, and this file gets copied`,
      ).toBeUndefined();
    }
  });

  it("the only animations are the two allowlisted loops, each in its own sheet", () => {
    for (const path of SHEETS) {
      const css = sheet(path);
      const loop = LOOPS[path];
      const keyframes = [...css.matchAll(KEYFRAMES)].map((match) => match[1]!);
      const animates = ANIMATION.exec(css);

      if (!loop) {
        expect(keyframes, `${path} defines a keyframe — only the allowlisted loops may`).toEqual([]);
        expect(
          animates?.[1],
          `${path} declares \`${animates?.[1]}\` — motion that is not content is instant`,
        ).toBeUndefined();
        continue;
      }
      // Exactly ONE keyframe, and it must be the named one: a second loop smuggled into an
      // allowlisted sheet would otherwise inherit its exemption.
      expect(keyframes, `${path} may define ${loop.keyframe} and nothing else`).toEqual([
        loop.keyframe,
      ]);
      // And it must really run it, or the allowlist has stopped describing the code.
      expect(css, `${path} no longer runs ${loop.keyframe} — take it out of the allowlist`).toContain(
        `animation: ${loop.keyframe} `,
      );
    }
  });

  it("only those two answer prefers-reduced-motion, and each answers it the way its kind must", () => {
    for (const path of SHEETS) {
      const css = sheet(path);
      const loop = LOOPS[path];
      const asks = css.includes("prefers-reduced-motion");
      if (!loop) {
        expect(
          asks,
          `${path} answers prefers-reduced-motion — nothing outside the loops has anything to stand down`,
        ).toBe(false);
        continue;
      }
      expect(asks, `${path} runs ${loop.keyframe} and owes it a reduced-motion arm`).toBe(true);
      // SCOPED TO THE BLOCK. Two whole-file `includes` is not this claim: the file can contain
      // the query and contain a duration and still stand the loop down inside the query, with
      // both reads satisfied by different lines. That exact sabotage passed the package's first
      // spelling, so the same mistake is not made here.
      const guard = atRuleBody(css, "@media (prefers-reduced-motion: reduce)");
      const stands = /animation\s*:\s*none/.test(guard);
      if (loop.underStillness === "slows") {
        expect(
          /animation-duration\s*:/.test(guard),
          `${path} answers the preference without slowing ${loop.keyframe}`,
        ).toBe(true);
        expect(
          stands,
          `${path} STOPS ${loop.keyframe} — it is content, and a loop that freezes has stopped saying it`,
        ).toBe(false);
      } else {
        expect(
          stands,
          `${path} keeps ${loop.keyframe} running — it is a test rig, and a rig may simply stop`,
        ).toBe(true);
      }
    }
  });

  it("nothing grows, scrolls smoothly, or enters from a starting state", () => {
    for (const path of SHEETS) {
      const css = sheet(path);
      expect(css, `${path} uses interpolate-size — an animated size is still motion`).not.toContain(
        "interpolate-size",
      );
      expect(
        /scroll-behavior\s*:\s*smooth/.test(css),
        `${path} scrolls smoothly — a scroll is a state change like any other`,
      ).toBe(false);
      expect(
        css,
        `${path} declares @starting-style — nothing enters, so nothing has a state to enter from`,
      ).not.toContain("@starting-style");
    }
  });
});
